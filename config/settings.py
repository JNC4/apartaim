"""Configuration settings for the manipulation detection experiment."""

import os
import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

@dataclass
class ModelConfig:
    """LLM model configuration."""
    name: str = "qwen3-32b"
    temperature: float = 0.7
    max_tokens: int = 1024
    guesser_temperature: float = 0.3


@dataclass
class ModelRoleConfig:
    """Configuration for each model role in the experiment."""
    unknown_model: str = "qwen3-32b"
    truthbot_model: str = "qwen3-32b"
    user_model: str = "qwen3-32b"
    guesser_model: str = "qwen3-32b"

    def to_dict(self) -> Dict[str, str]:
        return {
            "unknown_model": self.unknown_model,
            "truthbot_model": self.truthbot_model,
            "user_model": self.user_model,
            "guesser_model": self.guesser_model,
        }


# Model name mappings: short name -> HuggingFace ID (for vLLM on Lambda instances)
MODEL_NAME_MAP: Dict[str, str] = {
    "qwen3-32b": "Qwen/Qwen3-32B",
    "hermes-70b": "NousResearch/Hermes-3-Llama-3.1-70B",
    "gpt-oss-120b": "openai/gpt-oss-120b",
}

def get_model_id(short_name: str) -> str:
    """Convert short model name to full HuggingFace ID if USE_HF_MODEL_NAMES is set."""
    if os.getenv("USE_HF_MODEL_NAMES", "").lower() in ("1", "true", "yes"):
        return MODEL_NAME_MAP.get(short_name, short_name)
    return short_name

# Pre-defined experiment scenarios with different model combinations
# Based on the 9 scenarios from the issue:
EXPERIMENT_SCENARIOS: Dict[str, ModelRoleConfig] = {
    # Single-model scenarios (all roles use the same model)
    "single-qwen": ModelRoleConfig(
        "qwen3-32b", "qwen3-32b", "qwen3-32b", "qwen3-32b"
    ),
    "single-hermes": ModelRoleConfig(
        "hermes-70b", "hermes-70b", "hermes-70b", "hermes-70b"
    ),
    "single-gptoss": ModelRoleConfig(
        "gpt-oss-120b", "gpt-oss-120b", "gpt-oss-120b", "gpt-oss-120b"
    ),
    # Multi-model scenarios
    "user-eq-guesser": ModelRoleConfig(
        unknown_model="qwen3-32b",
        truthbot_model="gpt-oss-120b",
        user_model="hermes-70b",
        guesser_model="hermes-70b",  # Same as user
    ),
    "unknown-eq-guesser": ModelRoleConfig(
        unknown_model="qwen3-32b",
        truthbot_model="gpt-oss-120b",
        user_model="hermes-70b",
        guesser_model="qwen3-32b",  # Same as unknown
    ),
    "unknown-eq-truthbot": ModelRoleConfig(
        unknown_model="qwen3-32b",
        truthbot_model="qwen3-32b",  # Same as unknown
        user_model="hermes-70b",
        guesser_model="gpt-oss-120b",
    ),
    "user-eq-guesser-alt": ModelRoleConfig(
        unknown_model="hermes-70b",
        truthbot_model="gpt-oss-120b",
        user_model="qwen3-32b",
        guesser_model="qwen3-32b",  # Same as user
    ),
    "user-eq-guesser-alt2": ModelRoleConfig(
        unknown_model="hermes-70b",
        truthbot_model="qwen3-32b",
        user_model="gpt-oss-120b",
        guesser_model="gpt-oss-120b",  # Same as user
    ),
    "truthbot-eq-guesser": ModelRoleConfig(
        unknown_model="gpt-oss-120b",
        truthbot_model="hermes-70b",
        user_model="qwen3-32b",
        guesser_model="hermes-70b",  # Same as truthbot
    ),
}

@dataclass
class ExperimentConfig:
    """Experiment parameters."""
    num_turns: int = 3
    conversations_per_condition: int = 50
    belief_initial: int = 50

@dataclass
class BatchConfig:
    """Batch processing configuration."""
    max_concurrency: int = 10
    batch_size: int = 20
    delay_between_batches: float = 1.0
    max_retries: int = 3
    retry_delay: float = 1.0

@dataclass
class Settings:
    """Main settings container."""

    # API Configuration
    lambda_api_key: str = field(default_factory=lambda: os.getenv("LAMBDA_API_KEY", ""))
    lambda_base_url: str = field(default_factory=lambda: os.getenv("LAMBDA_BASE_URL", "https://api.lambdalabs.com/v1"))

    # Model settings
    model: ModelConfig = field(default_factory=ModelConfig)

    # Experiment settings
    experiment: ExperimentConfig = field(default_factory=ExperimentConfig)

    # Batch settings
    batch: BatchConfig = field(default_factory=BatchConfig)

    # Paths
    base_dir: str = field(default_factory=lambda: str(Path(__file__).parent.parent))
    data_dir: str = "data/results"
    propositions_path: str = "config/propositions.json"

    # Logging
    log_level: str = "INFO"

    @classmethod
    def from_env(cls) -> "Settings":
        """Load settings from environment variables."""
        return cls(
            lambda_api_key=os.getenv("LAMBDA_API_KEY", ""),
            model=ModelConfig(
                name=os.getenv("MODEL_NAME", "qwen3-32b"),
                temperature=float(os.getenv("MODEL_TEMPERATURE", "0.7")),
                max_tokens=int(os.getenv("MODEL_MAX_TOKENS", "1024")),
            ),
            experiment=ExperimentConfig(
                num_turns=int(os.getenv("NUM_TURNS", "3")),
                conversations_per_condition=int(os.getenv("CONVERSATIONS_PER_CONDITION", "50")),
            ),
            batch=BatchConfig(
                max_concurrency=int(os.getenv("MAX_CONCURRENCY", "10")),
                batch_size=int(os.getenv("BATCH_SIZE", "20")),
            ),
            log_level=os.getenv("LOG_LEVEL", "INFO"),
        )

    def load_propositions(self) -> List[Dict[str, Any]]:
        """Load propositions from JSON file."""
        path = Path(self.base_dir) / self.propositions_path
        with open(path) as f:
            data = json.load(f)
        return data["propositions"]

    def get_data_path(self) -> Path:
        """Get full path to data directory."""
        return Path(self.base_dir) / self.data_dir
