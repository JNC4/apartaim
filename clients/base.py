"""Abstract base class for LLM API clients."""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Message:
    """A chat message."""
    role: str  # "system", "user", "assistant"
    content: str


@dataclass
class CompletionResponse:
    """Response from an LLM completion request."""
    content: str
    input_tokens: int
    output_tokens: int
    model: str
    latency_ms: float


class BaseLLMClient(ABC):
    """Abstract base class for LLM API clients."""

    @abstractmethod
    async def complete(
        self,
        messages: List[Message],
        temperature: float = 0.7,
        max_tokens: int = 1024,
    ) -> CompletionResponse:
        """Generate a completion from messages."""
        pass

    @abstractmethod
    async def complete_batch(
        self,
        message_batches: List[List[Message]],
        temperature: float = 0.7,
        max_tokens: int = 1024,
        concurrency: int = 10,
    ) -> List[CompletionResponse]:
        """Process multiple completions with controlled concurrency."""
        pass

    @property
    @abstractmethod
    def cost_per_million_input(self) -> float:
        """Cost per million input tokens."""
        pass

    @property
    @abstractmethod
    def cost_per_million_output(self) -> float:
        """Cost per million output tokens."""
        pass

    @property
    @abstractmethod
    def total_cost(self) -> float:
        """Total cost incurred so far."""
        pass
