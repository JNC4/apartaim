"""Lambda.ai API client using OpenAI-compatible interface."""

import asyncio
import os
import time
import logging
from typing import List, Optional, Dict, Any
from openai import AsyncOpenAI, APIConnectionError
from openai import RateLimitError, APIError, APITimeoutError

from .base import BaseLLMClient, Message, CompletionResponse
from config.settings import get_model_id

logger = logging.getLogger(__name__)


# Model -> vLLM server URL mapping for multi-model scenarios
# Each model runs on a different vLLM instance/port
MODEL_URL_MAP: Dict[str, str] = {
    "qwen3-32b": os.getenv("QWEN_URL", "http://localhost:8000/v1"),
    "gpt-oss-120b": os.getenv("GPTOSS_URL", "http://localhost:8001/v1"),
    "hermes-70b": os.getenv("HERMES_URL", "http://localhost:8002/v1"),
}


class LambdaClient(BaseLLMClient):
    """Lambda.ai OpenAI-compatible API client with async support."""

    # Pricing per million tokens (as of 2025) - for local vLLM these are notional
    MODELS: Dict[str, Dict[str, float]] = {
        "qwen3-32b": {"input": 0.10, "output": 0.30},
        "hermes-70b": {"input": 0.20, "output": 0.60},
        "gpt-oss-120b": {"input": 0.15, "output": 0.45},
        "llama3.1-405b-instruct": {"input": 0.50, "output": 1.50},
    }

    def __init__(
        self,
        api_key: str,
        model: str = "qwen3-32b",
        base_url: str = "https://api.lambdalabs.com/v1",
        max_retries: int = 3,
        retry_delay: float = 1.0,
        timeout: float = 60.0,
    ):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.timeout = timeout

        # Main client for default model
        self._client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=timeout,
        )

        # Cache of clients for different model endpoints
        self._model_clients: Dict[str, AsyncOpenAI] = {}

        self._total_input_tokens = 0
        self._total_output_tokens = 0
        self._total_requests = 0

    def _get_client_for_model(self, model_name: str) -> AsyncOpenAI:
        """Get or create a client for a specific model's endpoint."""
        # Check if this model has a specific URL mapping
        model_url = MODEL_URL_MAP.get(model_name)

        if not model_url:
            # Fall back to default client
            return self._client

        # Check cache
        if model_name in self._model_clients:
            return self._model_clients[model_name]

        # Create new client for this model's endpoint
        client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=model_url,
            timeout=self.timeout,
        )
        self._model_clients[model_name] = client
        logger.info(f"Created client for model {model_name} at {model_url}")
        return client

    async def complete(
        self,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 1024,
        model: Optional[str] = None,
    ) -> CompletionResponse:
        """Generate a completion from messages with retry logic.

        Args:
            messages: List of Message objects
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            model: Override model for this call (uses instance model if None)

        Returns:
            CompletionResponse with content and usage stats
        """
        # Use provided model or fall back to instance default
        model_short_name = model or self.model
        effective_model = get_model_id(model_short_name)

        # Get the appropriate client for this model (may be different server)
        client = self._get_client_for_model(model_short_name)

        formatted_messages = [
            {"role": m.role, "content": m.content}
            for m in messages
        ]

        last_error: Optional[Exception] = None

        for attempt in range(self.max_retries):
            start_time = time.monotonic()
            try:
                # Disable thinking for Qwen models (much faster)
                extra_body = {}
                if "qwen" in model_short_name.lower():
                    extra_body = {"chat_template_kwargs": {"enable_thinking": False}}

                response = await client.chat.completions.create(
                    model=effective_model,
                    messages=formatted_messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    extra_body=extra_body if extra_body else None,
                )

                latency_ms = (time.monotonic() - start_time) * 1000

                # Handle empty choices array
                if not response.choices:
                    raise APIError(
                        message="API returned empty choices array",
                        request=None,
                        body={"response": response.model_dump() if hasattr(response, 'model_dump') else str(response)}
                    )

                input_tokens = response.usage.prompt_tokens if response.usage else 0
                output_tokens = response.usage.completion_tokens if response.usage else 0

                self._total_input_tokens += input_tokens
                self._total_output_tokens += output_tokens
                self._total_requests += 1

                content = response.choices[0].message.content
                if content is None:
                    logger.warning("API returned None content, using empty string")
                    content = ""

                return CompletionResponse(
                    content=content,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    model=effective_model,
                    latency_ms=latency_ms,
                )

            except RateLimitError as e:
                last_error = e
                wait_time = self.retry_delay * (2 ** attempt)
                logger.warning(
                    f"Rate limit hit, waiting {wait_time:.1f}s (attempt {attempt + 1}/{self.max_retries})"
                )
                await asyncio.sleep(wait_time)

            except APITimeoutError as e:
                last_error = e
                wait_time = self.retry_delay * (2 ** attempt)
                logger.warning(
                    f"Request timeout, retrying in {wait_time:.1f}s (attempt {attempt + 1}/{self.max_retries})"
                )
                await asyncio.sleep(wait_time)

            except APIConnectionError as e:
                last_error = e
                wait_time = self.retry_delay * (2 ** attempt)
                logger.warning(
                    f"Connection error, retrying in {wait_time:.1f}s (attempt {attempt + 1}/{self.max_retries})"
                )
                await asyncio.sleep(wait_time)

            except APIError as e:
                last_error = e
                if hasattr(e, 'status_code') and e.status_code and e.status_code >= 500:
                    # Server error, retry
                    wait_time = self.retry_delay * (2 ** attempt)
                    logger.warning(
                        f"Server error {e.status_code}, retrying in {wait_time:.1f}s"
                    )
                    await asyncio.sleep(wait_time)
                else:
                    # Client error, don't retry
                    raise

        raise RuntimeError(
            f"Max retries ({self.max_retries}) exceeded. Last error: {last_error}"
        )

    async def complete_batch(
        self,
        message_batches: List[List[Message]],
        temperature: float = 0.7,
        max_tokens: int = 1024,
        concurrency: int = 10,
    ) -> List[CompletionResponse]:
        """Process multiple completions with controlled concurrency."""

        semaphore = asyncio.Semaphore(concurrency)

        async def bounded_complete(messages: List[Message]) -> CompletionResponse:
            async with semaphore:
                return await self.complete(messages, temperature, max_tokens)

        results = await asyncio.gather(
            *[bounded_complete(msgs) for msgs in message_batches],
            return_exceptions=True
        )

        # Convert exceptions to None or re-raise based on your needs
        processed_results = []
        for r in results:
            if isinstance(r, Exception):
                logger.error(f"Batch item failed: {r}")
                raise r  # Re-raise to fail fast
            processed_results.append(r)

        return processed_results

    @property
    def cost_per_million_input(self) -> float:
        """Cost per million input tokens for current model."""
        return self.MODELS.get(self.model, {"input": 0.10})["input"]

    @property
    def cost_per_million_output(self) -> float:
        """Cost per million output tokens for current model."""
        return self.MODELS.get(self.model, {"output": 0.30})["output"]

    @property
    def total_cost(self) -> float:
        """Total cost incurred so far."""
        input_cost = (self._total_input_tokens / 1_000_000) * self.cost_per_million_input
        output_cost = (self._total_output_tokens / 1_000_000) * self.cost_per_million_output
        return input_cost + output_cost

    @property
    def total_tokens(self) -> int:
        """Total tokens used."""
        return self._total_input_tokens + self._total_output_tokens

    def get_usage_stats(self) -> Dict[str, Any]:
        """Get detailed usage statistics."""
        return {
            "total_requests": self._total_requests,
            "total_input_tokens": self._total_input_tokens,
            "total_output_tokens": self._total_output_tokens,
            "total_tokens": self.total_tokens,
            "total_cost_usd": self.total_cost,
            "model": self.model,
        }

    async def close(self):
        """Close all clients."""
        await self._client.close()
        for client in self._model_clients.values():
            await client.close()
