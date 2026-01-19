"""Manages batched async processing with rate limiting."""

import asyncio
import time
import logging
from typing import List, Callable, TypeVar, Any, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

T = TypeVar('T')


@dataclass
class BatchConfig:
    """Configuration for batch processing."""
    max_concurrency: int = 10
    batch_size: int = 20
    delay_between_batches: float = 1.0
    max_retries_per_item: int = 3


class BatchManager:
    """Manages batched async processing with rate limiting."""

    def __init__(self, config: Optional[BatchConfig] = None):
        self.config = config or BatchConfig()
        self._stats = {
            "total": 0,
            "success": 0,
            "failed": 0,
            "start_time": None,
        }

    async def process_batch(
        self,
        items: List[Any],
        processor: Callable[[Any], T],
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ) -> List[Optional[T]]:
        """
        Process items with controlled concurrency and rate limiting.

        Args:
            items: List of items to process
            processor: Async function to process each item
            progress_callback: Optional callback(completed, total)

        Returns:
            List of results (None for failed items)
        """
        self._stats = {
            "total": len(items),
            "success": 0,
            "failed": 0,
            "start_time": time.monotonic(),
        }

        results: List[Optional[T]] = []
        semaphore = asyncio.Semaphore(self.config.max_concurrency)

        async def process_with_retry(item: Any, idx: int) -> Optional[T]:
            async with semaphore:
                for attempt in range(self.config.max_retries_per_item):
                    try:
                        result = await processor(item)
                        self._stats["success"] += 1
                        self._log_progress(idx, progress_callback)
                        return result
                    except Exception as e:
                        if attempt == self.config.max_retries_per_item - 1:
                            logger.error(
                                f"Item {idx} failed after {attempt + 1} attempts: {e}"
                            )
                            self._stats["failed"] += 1
                            return None
                        wait_time = 2 ** attempt
                        logger.warning(
                            f"Item {idx} attempt {attempt + 1} failed, "
                            f"retrying in {wait_time}s: {e}"
                        )
                        await asyncio.sleep(wait_time)
                return None

        # Process in batches
        for batch_start in range(0, len(items), self.config.batch_size):
            batch_end = min(batch_start + self.config.batch_size, len(items))
            batch = items[batch_start:batch_end]

            logger.info(
                f"Processing batch {batch_start // self.config.batch_size + 1}, "
                f"items {batch_start + 1}-{batch_end} of {len(items)}"
            )

            batch_results = await asyncio.gather(*[
                process_with_retry(item, batch_start + i)
                for i, item in enumerate(batch)
            ])
            results.extend(batch_results)

            # Rate limiting delay between batches
            if batch_end < len(items):
                await asyncio.sleep(self.config.delay_between_batches)

        self._log_summary()
        return results

    def _log_progress(
        self,
        idx: int,
        callback: Optional[Callable[[int, int], None]] = None,
    ):
        """Log progress and call callback if provided."""
        completed = self._stats["success"] + self._stats["failed"]

        if callback:
            callback(completed, self._stats["total"])

        if completed % 10 == 0 or completed == self._stats["total"]:
            elapsed = time.monotonic() - self._stats["start_time"]
            rate = completed / elapsed if elapsed > 0 else 0
            remaining = (self._stats["total"] - completed) / rate if rate > 0 else 0
            logger.info(
                f"Progress: {completed}/{self._stats['total']} "
                f"({rate:.1f}/s, ~{remaining:.0f}s remaining)"
            )

    def _log_summary(self):
        """Log final summary."""
        elapsed = time.monotonic() - self._stats["start_time"]
        logger.info(
            f"Batch complete: {self._stats['success']}/{self._stats['total']} "
            f"succeeded, {self._stats['failed']} failed in {elapsed:.1f}s"
        )

    def get_stats(self) -> dict:
        """Get processing statistics."""
        return dict(self._stats)
