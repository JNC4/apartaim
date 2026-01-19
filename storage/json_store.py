"""JSON file storage for experiment data."""

import json
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime

import aiofiles

from models.conversation import Conversation

logger = logging.getLogger(__name__)


class JsonStore:
    """JSON file storage for experiment data."""

    def __init__(self, base_path: str = "data/results"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)

        self.run_id = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        self.run_path = self.base_path / self.run_id
        self.run_path.mkdir(exist_ok=True)

        logger.info(f"Initialized JsonStore at {self.run_path}")

    async def save_conversation(self, conv: Conversation) -> str:
        """
        Save a single conversation to JSON.

        Args:
            conv: Conversation to save

        Returns:
            Path to saved file
        """
        filepath = self.run_path / f"{conv.id}.json"
        data = conv.to_dict()

        async with aiofiles.open(filepath, 'w') as f:
            await f.write(json.dumps(data, indent=2))

        return str(filepath)

    async def save_experiment_summary(
        self,
        conversations: List[Conversation],
        metadata: Dict[str, Any],
    ) -> str:
        """
        Save experiment summary with all conversations.

        Args:
            conversations: List of all conversations
            metadata: Experiment metadata

        Returns:
            Path to saved file
        """
        filepath = self.run_path / "experiment_summary.json"

        data = {
            "run_id": self.run_id,
            "created_at": datetime.utcnow().isoformat(),
            "metadata": metadata,
            "total_conversations": len(conversations),
            "conversations": [c.to_dict() for c in conversations],
        }

        async with aiofiles.open(filepath, 'w') as f:
            await f.write(json.dumps(data, indent=2))

        logger.info(f"Saved experiment summary to {filepath}")
        return str(filepath)

    async def load_conversation(self, conv_id: str) -> Optional[Conversation]:
        """
        Load a conversation by ID.

        Args:
            conv_id: Conversation UUID

        Returns:
            Conversation object or None if not found
        """
        filepath = self.run_path / f"{conv_id}.json"
        if not filepath.exists():
            return None

        async with aiofiles.open(filepath, 'r') as f:
            data = json.loads(await f.read())

        return Conversation.from_dict(data)

    async def load_experiment_summary(
        self,
        run_id: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Load an experiment summary.

        Args:
            run_id: Run ID to load (defaults to current run)

        Returns:
            Summary dict or None if not found
        """
        run_path = self.base_path / (run_id or self.run_id)
        filepath = run_path / "experiment_summary.json"

        if not filepath.exists():
            return None

        async with aiofiles.open(filepath, 'r') as f:
            return json.loads(await f.read())

    async def save_checkpoint(
        self,
        completed_ids: set,
        pending_tasks: List[Dict[str, Any]],
    ) -> str:
        """
        Save checkpoint for recovery.

        Args:
            completed_ids: Set of completed conversation IDs
            pending_tasks: List of pending tasks

        Returns:
            Path to checkpoint file
        """
        checkpoint = {
            "run_id": self.run_id,
            "completed_conversation_ids": list(completed_ids),
            "pending_tasks_count": len(pending_tasks),
            "timestamp": datetime.utcnow().isoformat(),
        }

        filepath = self.run_path / "checkpoint.json"
        async with aiofiles.open(filepath, 'w') as f:
            await f.write(json.dumps(checkpoint, indent=2))

        return str(filepath)

    async def load_checkpoint(self) -> Optional[Dict[str, Any]]:
        """
        Load checkpoint for recovery.

        Returns:
            Checkpoint dict or None if not found
        """
        filepath = self.run_path / "checkpoint.json"
        if not filepath.exists():
            return None

        async with aiofiles.open(filepath, 'r') as f:
            return json.loads(await f.read())

    def list_runs(self) -> List[str]:
        """List all available run IDs."""
        return [
            d.name for d in self.base_path.iterdir()
            if d.is_dir() and (d / "experiment_summary.json").exists()
        ]

    def resume_from_run(self, run_id: str) -> bool:
        """
        Resume from a previous run (Issue 14).

        Args:
            run_id: Run ID to resume from

        Returns:
            True if run exists and can be resumed, False otherwise
        """
        run_path = self.base_path / run_id
        if not run_path.exists():
            logger.error(f"Run {run_id} not found at {run_path}")
            return False

        self.run_id = run_id
        self.run_path = run_path
        logger.info(f"Resuming from run {run_id} at {run_path}")
        return True

    async def get_completed_conversation_ids(self) -> set:
        """
        Get IDs of all completed conversations in the current run.

        Returns:
            Set of completed conversation IDs
        """
        completed_ids = set()

        # Try loading from checkpoint first
        checkpoint = await self.load_checkpoint()
        if checkpoint:
            completed_ids = set(checkpoint.get('completed_conversation_ids', []))
            logger.info(f"Loaded {len(completed_ids)} completed IDs from checkpoint")
            return completed_ids

        # Fallback: scan individual conversation files
        for filepath in self.run_path.glob("*.json"):
            if filepath.name in ("experiment_summary.json", "checkpoint.json", "run_metadata.json"):
                continue
            # UUID-style filename indicates a conversation file
            if len(filepath.stem) == 36 and '-' in filepath.stem:
                completed_ids.add(filepath.stem)

        logger.info(f"Found {len(completed_ids)} completed conversations from files")
        return completed_ids


def load_experiment_sync(filepath: str) -> Dict[str, Any]:
    """
    Synchronously load experiment data (for analysis scripts).

    Args:
        filepath: Path to experiment_summary.json

    Returns:
        Experiment data dict
    """
    with open(filepath, 'r') as f:
        return json.load(f)


def load_conversations_sync(filepath: str) -> List[Conversation]:
    """
    Synchronously load conversations from experiment summary.

    Args:
        filepath: Path to experiment_summary.json

    Returns:
        List of Conversation objects
    """
    data = load_experiment_sync(filepath)
    return [Conversation.from_dict(c) for c in data.get("conversations", [])]
