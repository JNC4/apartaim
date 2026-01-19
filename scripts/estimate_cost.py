#!/usr/bin/env python3
"""Estimate API costs before running experiment."""

import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.settings import Settings


def estimate_cost(
    num_propositions: int = 12,
    conversations_per_condition: int = 50,
    num_conditions: int = 4,
    turns_per_conversation: int = 3,
    avg_input_tokens_per_call: int = 800,
    avg_output_tokens_per_call: int = 400,
    input_price_per_million: float = 0.10,
    output_price_per_million: float = 0.30,
):
    """
    Estimate total API cost for the experiment.

    API calls per conversation (average):
    - Initial user question: 1
    - Per turn: Unknown model (1) + Truthbot (0.5 avg) + User belief (1) + User followup (0.67)
    - Manipulation guesser: 0.5 (only truthbot conditions)

    Total: ~1 + 3 * 3.17 + 0.5 = ~11 calls per conversation (average)
    """
    # Average API calls per conversation (accounting for conditions with/without truthbot)
    calls_per_turn = 3.17  # Average across conditions
    calls_per_conversation = 1 + (turns_per_conversation * calls_per_turn) + 0.5

    total_conversations = num_propositions * num_conditions * conversations_per_condition
    total_calls = total_conversations * calls_per_conversation

    total_input_tokens = total_calls * avg_input_tokens_per_call
    total_output_tokens = total_calls * avg_output_tokens_per_call

    input_cost = (total_input_tokens / 1_000_000) * input_price_per_million
    output_cost = (total_output_tokens / 1_000_000) * output_price_per_million
    total_cost = input_cost + output_cost

    print("=" * 50)
    print("EXPERIMENT COST ESTIMATE")
    print("=" * 50)
    print(f"\nConfiguration:")
    print(f"  Propositions: {num_propositions}")
    print(f"  Conditions: {num_conditions}")
    print(f"  Conversations per condition: {conversations_per_condition}")
    print(f"  Turns per conversation: {turns_per_conversation}")
    print(f"\nEstimated usage:")
    print(f"  Total conversations: {total_conversations:,}")
    print(f"  Total API calls: {total_calls:,.0f}")
    print(f"  Total input tokens: {total_input_tokens:,.0f}")
    print(f"  Total output tokens: {total_output_tokens:,.0f}")
    print(f"\nEstimated costs (Qwen3-32B pricing):")
    print(f"  Input cost: ${input_cost:.2f}")
    print(f"  Output cost: ${output_cost:.2f}")
    print(f"  TOTAL COST: ${total_cost:.2f}")
    print(f"\n  Budget: $400.00")
    print(f"  Remaining: ${400 - total_cost:.2f}")
    print("=" * 50)

    return total_cost


def main():
    """Run cost estimation with settings from env."""
    settings = Settings.from_env()

    print("\n[Using settings from .env]\n")

    estimate_cost(
        num_propositions=12,
        conversations_per_condition=settings.experiment.conversations_per_condition,
        num_conditions=4,
        turns_per_conversation=settings.experiment.num_turns,
    )

    print("\n[Pilot run estimate (2 props × 2 convos)]\n")
    estimate_cost(
        num_propositions=2,
        conversations_per_condition=2,
        num_conditions=4,
        turns_per_conversation=settings.experiment.num_turns,
    )


if __name__ == "__main__":
    main()
