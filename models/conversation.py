"""Data structures for conversation tracking."""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any
from enum import Enum
import uuid
from datetime import datetime


class Condition(Enum):
    """Experimental conditions."""
    CONTROL_HELPFUL = "control_helpful"
    CONTROL_MANIPULATIVE = "control_manipulative"
    TRUTHBOT_HELPFUL = "truthbot_helpful"
    TRUTHBOT_MANIPULATIVE = "truthbot_manipulative"


@dataclass
class Turn:
    """A single turn in the conversation."""
    turn_number: int
    user_message: str
    unknown_model_response: str
    truthbot_response: Optional[str] = None
    user_belief_after: Optional[int] = None
    belief_parse_method: str = "unknown"  # "exact", "original_format", "fallback", "failed"
    # Response length tracking (Issue 8)
    unknown_model_response_length: int = 0
    truthbot_response_length: int = 0


@dataclass
class ManipulationPrediction:
    """Output from the manipulation guesser."""
    prediction: bool  # True = manipulative
    confidence: float  # 0-100
    key_differences: List[str]
    reasoning: str


@dataclass
class Conversation:
    """Complete conversation record for the experiment."""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    proposition: str = ""
    proposition_id: str = ""
    ground_truth_direction: str = ""
    condition: Condition = Condition.CONTROL_HELPFUL
    turns: List[Turn] = field(default_factory=list)
    belief_before: int = 50
    belief_after: Optional[int] = None
    manipulation_prediction: Optional[ManipulationPrediction] = None
    ground_truth_manipulative: bool = False
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    metadata: Dict[str, Any] = field(default_factory=dict)
    # Multi-model support
    prompt_variant: int = 0
    model_config: Dict[str, str] = field(default_factory=lambda: {
        "unknown_model": "qwen3-32b",
        "truthbot_model": "qwen3-32b",
        "user_model": "qwen3-32b",
        "guesser_model": "qwen3-32b",
    })
    scenario_name: str = "single-qwen"
    # Task tracking for checkpoint recovery (Issue 14)
    task_index: int = 0

    @property
    def belief_delta(self) -> Optional[int]:
        """Compute belief change."""
        if self.belief_after is not None:
            return self.belief_after - self.belief_before
        return None

    @property
    def normalized_belief_delta(self) -> Optional[int]:
        """Compute belief change normalized by ground truth direction.

        Returns positive values for "good" changes (toward evidence)
        and negative values for "bad" changes (away from evidence).

        For increase:positive propositions (e.g., "vaccines are safe"):
            - Belief going UP is good (positive delta)
            - Belief going DOWN is bad (negative delta)

        For increase:negative propositions (e.g., "5G causes health problems"):
            - Belief going DOWN is good (positive delta, inverted)
            - Belief going UP is bad (negative delta, inverted)
        """
        if self.belief_after is None:
            return None
        delta = self.belief_after - self.belief_before
        # For increase:negative, invert: belief going UP is bad
        if self.ground_truth_direction == "increase:negative":
            return -delta
        return delta

    @property
    def has_truthbot(self) -> bool:
        """Check if this is a truthbot condition."""
        return self.condition in (
            Condition.TRUTHBOT_HELPFUL,
            Condition.TRUTHBOT_MANIPULATIVE
        )

    @property
    def is_manipulative_condition(self) -> bool:
        """Check if this is a manipulative condition."""
        return self.condition in (
            Condition.CONTROL_MANIPULATIVE,
            Condition.TRUTHBOT_MANIPULATIVE
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "conversation_id": self.id,
            "proposition": self.proposition,
            "proposition_id": self.proposition_id,
            "ground_truth_direction": self.ground_truth_direction,
            "condition": self.condition.value,
            "truthbot_present": self.has_truthbot,
            "turns": [
                {
                    "turn_number": t.turn_number,
                    "user_message": t.user_message,
                    "unknown_model_response": t.unknown_model_response,
                    "truthbot_response": t.truthbot_response,
                    "user_belief_after": t.user_belief_after,
                    "belief_parse_method": t.belief_parse_method,
                    "unknown_model_response_length": t.unknown_model_response_length,
                    "truthbot_response_length": t.truthbot_response_length,
                }
                for t in self.turns
            ],
            "belief_before": self.belief_before,
            "belief_after": self.belief_after,
            "belief_delta": self.belief_delta,
            "normalized_belief_delta": self.normalized_belief_delta,
            "manipulation_guesser_prediction": (
                self.manipulation_prediction.prediction
                if self.manipulation_prediction else None
            ),
            "manipulation_guesser_confidence": (
                self.manipulation_prediction.confidence
                if self.manipulation_prediction else None
            ),
            "manipulation_guesser_key_differences": (
                self.manipulation_prediction.key_differences
                if self.manipulation_prediction else None
            ),
            "manipulation_guesser_reasoning": (
                self.manipulation_prediction.reasoning
                if self.manipulation_prediction else None
            ),
            "ground_truth_manipulative": self.ground_truth_manipulative,
            "created_at": self.created_at,
            "metadata": self.metadata,
            "prompt_variant": self.prompt_variant,
            "model_config": self.model_config,
            "scenario_name": self.scenario_name,
            "task_index": self.task_index,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Conversation":
        """Create from dictionary."""
        conv = cls(
            id=data["conversation_id"],
            proposition=data["proposition"],
            proposition_id=data["proposition_id"],
            ground_truth_direction=data["ground_truth_direction"],
            condition=Condition(data["condition"]),
            belief_before=data["belief_before"],
            belief_after=data.get("belief_after"),
            ground_truth_manipulative=data["ground_truth_manipulative"],
            created_at=data.get("created_at", datetime.utcnow().isoformat()),
            metadata=data.get("metadata", {}),
            prompt_variant=data.get("prompt_variant", 0),
            model_config=data.get("model_config", {
                "unknown_model": "qwen3-32b",
                "truthbot_model": "qwen3-32b",
                "user_model": "qwen3-32b",
                "guesser_model": "qwen3-32b",
            }),
            scenario_name=data.get("scenario_name", "single-qwen"),
            task_index=data.get("task_index", 0),
        )

        conv.turns = [
            Turn(
                turn_number=t["turn_number"],
                user_message=t["user_message"],
                unknown_model_response=t["unknown_model_response"],
                truthbot_response=t.get("truthbot_response"),
                user_belief_after=t.get("user_belief_after"),
                belief_parse_method=t.get("belief_parse_method", "unknown"),
                unknown_model_response_length=t.get("unknown_model_response_length", 0),
                truthbot_response_length=t.get("truthbot_response_length", 0),
            )
            for t in data.get("turns", [])
        ]

        if data.get("manipulation_guesser_prediction") is not None:
            conv.manipulation_prediction = ManipulationPrediction(
                prediction=data["manipulation_guesser_prediction"],
                confidence=data.get("manipulation_guesser_confidence", 50),
                key_differences=data.get("manipulation_guesser_key_differences", []),
                reasoning=data.get("manipulation_guesser_reasoning", ""),
            )

        return conv
