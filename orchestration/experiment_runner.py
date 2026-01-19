"""Orchestrates the full experiment across all conditions."""

import random
import logging
from typing import List, Dict, Any, Optional, Callable
from dataclasses import dataclass, field

from models.conversation import Conversation, Condition
from orchestration.conversation_runner import ConversationRunner
from orchestration.batch_manager import BatchManager, BatchConfig
from storage.json_store import JsonStore

logger = logging.getLogger(__name__)


@dataclass
class ExperimentConfig:
    """Configuration for the experiment."""
    propositions: List[Dict[str, Any]]
    conversations_per_condition: int = 50
    num_turns: int = 3
    conditions: List[Condition] = field(default_factory=lambda: list(Condition))
    shuffle: bool = True
    seed: Optional[int] = None
    # For resuming interrupted experiments (Issue 14)
    completed_task_keys: set = field(default_factory=set)


class ExperimentRunner:
    """Orchestrates the full experiment across all conditions."""

    def __init__(
        self,
        config: ExperimentConfig,
        runner: ConversationRunner,
        store: JsonStore,
        batch_manager: BatchManager,
    ):
        self.config = config
        self.runner = runner
        self.store = store
        self.batch_manager = batch_manager

    async def run_experiment(
        self,
        progress_callback: Optional[Callable[[int, int], None]] = None,
    ) -> List[Conversation]:
        """
        Run the complete experiment.

        Args:
            progress_callback: Optional callback(completed, total)

        Returns:
            List of all completed conversations
        """
        # Build task queue
        tasks = self._build_task_queue()

        logger.info(
            f"Starting experiment with {len(tasks)} total conversations "
            f"({len(self.config.propositions)} propositions × "
            f"{len(self.config.conditions)} conditions × "
            f"{self.config.conversations_per_condition} per condition)"
        )

        # Process all tasks
        results = await self.batch_manager.process_batch(
            tasks,
            self._run_single_conversation,
            progress_callback,
        )

        # Filter out failed conversations (already saved incrementally)
        conversations = [conv for conv in results if conv is not None]

        # Save experiment summary
        metadata = {
            "num_propositions": len(self.config.propositions),
            "num_conditions": len(self.config.conditions),
            "conversations_per_condition": self.config.conversations_per_condition,
            "num_turns": self.config.num_turns,
            "total_conversations": len(conversations),
        }
        await self.store.save_experiment_summary(conversations, metadata)

        logger.info(
            f"Experiment complete: {len(conversations)} conversations saved"
        )

        return conversations

    def _build_task_queue(self) -> List[Dict[str, Any]]:
        """Build the queue of tasks to process with stratified random assignment (Issue 18)."""
        tasks = []
        skipped = 0

        # Set random seed for reproducibility
        if self.config.seed is not None:
            random.seed(self.config.seed)

        for prop in self.config.propositions:
            for condition in self.config.conditions:
                # Stratified random assignment: create balanced prompt variants
                # for each proposition/condition combination
                n = self.config.conversations_per_condition
                num_variants = 3

                # Create base assignment ensuring equal distribution
                # Each variant appears at least n // num_variants times
                base_per_variant = n // num_variants
                remainder = n % num_variants

                # Build variant list with equal distribution
                variants = []
                for v in range(num_variants):
                    count = base_per_variant + (1 if v < remainder else 0)
                    variants.extend([v] * count)

                # Shuffle variants within this proposition/condition
                random.shuffle(variants)

                for i in range(n):
                    # Create task key for deduplication (Issue 14)
                    task_key = f"{prop['id']}_{condition.value}_{i}"

                    # Skip if already completed (when resuming)
                    if task_key in self.config.completed_task_keys:
                        skipped += 1
                        continue

                    tasks.append({
                        "proposition": prop,
                        "condition": condition,
                        "prompt_variant": variants[i],  # Stratified random assignment
                        "task_key": task_key,
                        "task_index": i,
                    })

        if skipped > 0:
            logger.info(f"Skipped {skipped} already-completed tasks (resuming)")

        # Shuffle for better load distribution
        if self.config.shuffle:
            random.shuffle(tasks)

        return tasks

    async def _run_single_conversation(
        self,
        task: Dict[str, Any],
    ) -> Conversation:
        """Run a single conversation task and save immediately."""
        conv = await self.runner.run_conversation(
            proposition=task["proposition"],
            condition=task["condition"],
            prompt_variant=task["prompt_variant"],
            task_index=task.get("task_index", 0),
        )
        # Save immediately after completion (Issue: incremental saving)
        if conv is not None:
            await self.store.save_conversation(conv)
        return conv

    async def run_pilot(
        self,
        num_propositions: int = 2,
        conversations_per_condition: int = 2,
    ) -> List[Conversation]:
        """
        Run a small pilot experiment for testing.

        Args:
            num_propositions: Number of propositions to test
            conversations_per_condition: Conversations per condition

        Returns:
            List of pilot conversations
        """
        # Create pilot config
        pilot_config = ExperimentConfig(
            propositions=self.config.propositions[:num_propositions],
            conversations_per_condition=conversations_per_condition,
            num_turns=self.config.num_turns,
            conditions=self.config.conditions,
            shuffle=False,  # Don't shuffle pilot for reproducibility
        )

        # Temporarily swap config
        original_config = self.config
        self.config = pilot_config

        try:
            logger.info(
                f"Running pilot: {num_propositions} propositions × "
                f"{conversations_per_condition} per condition"
            )
            conversations = await self.run_experiment()
            return conversations
        finally:
            self.config = original_config
