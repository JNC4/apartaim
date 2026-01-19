#!/usr/bin/env python3
"""Main entry point for running the manipulation detection experiment."""

import asyncio
import argparse
import logging
import sys
import json
from pathlib import Path
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.settings import Settings, EXPERIMENT_SCENARIOS, ModelRoleConfig
from clients.lambda_client import LambdaClient
from orchestration.conversation_runner import ConversationRunner
from orchestration.experiment_runner import ExperimentRunner, ExperimentConfig
from orchestration.batch_manager import BatchManager, BatchConfig
from storage.json_store import JsonStore


def setup_logging(level: str = "INFO", log_file: Path = None):
    """Configure logging."""
    handlers = [logging.StreamHandler(sys.stdout)]

    if log_file:
        handlers.append(logging.FileHandler(log_file))

    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=handlers,
    )


def save_run_metadata(
    settings: Settings,
    store: JsonStore,
    scenario_name: str = "single-qwen",
    model_config: dict = None,
) -> dict:
    """Save metadata for reproducibility."""
    metadata = {
        "run_id": store.run_id,
        "started_at": datetime.utcnow().isoformat(),
        "settings": {
            "model": {
                "name": settings.model.name,
                "temperature": settings.model.temperature,
                "max_tokens": settings.model.max_tokens,
                "guesser_temperature": settings.model.guesser_temperature,
            },
            "experiment": {
                "num_turns": settings.experiment.num_turns,
                "conversations_per_condition": settings.experiment.conversations_per_condition,
            },
            "batch": {
                "max_concurrency": settings.batch.max_concurrency,
                "batch_size": settings.batch.batch_size,
            },
        },
        "scenario": {
            "name": scenario_name,
            "model_config": model_config or {
                "unknown_model": settings.model.name,
                "truthbot_model": settings.model.name,
                "user_model": settings.model.name,
                "guesser_model": settings.model.name,
            },
        },
        "python_version": sys.version,
    }

    filepath = store.run_path / "run_metadata.json"
    with open(filepath, 'w') as f:
        json.dump(metadata, f, indent=2)

    return metadata


async def load_completed_task_keys(store: JsonStore) -> set:
    """
    Load task keys of completed conversations for resume (Issue 14).

    Task key format: {proposition_id}_{condition}_{task_index}
    """
    completed_keys = set()

    # Scan completed conversation files
    for filepath in store.run_path.glob("*.json"):
        if filepath.name in ("experiment_summary.json", "checkpoint.json", "run_metadata.json"):
            continue
        # UUID-style filename indicates a conversation file
        if len(filepath.stem) == 36 and '-' in filepath.stem:
            try:
                with open(filepath, 'r') as f:
                    data = json.load(f)
                    prop_id = data.get("proposition_id", "")
                    condition = data.get("condition", "")
                    task_index = data.get("task_index", 0)
                    task_key = f"{prop_id}_{condition}_{task_index}"
                    completed_keys.add(task_key)
            except (json.JSONDecodeError, KeyError) as e:
                logging.warning(f"Failed to parse {filepath}: {e}")

    return completed_keys


async def main(args):
    """Main experiment runner."""
    # Load settings
    settings = Settings.from_env()

    # Override settings from args if provided
    if args.conversations:
        settings.experiment.conversations_per_condition = args.conversations
    if args.concurrency:
        settings.batch.max_concurrency = args.concurrency

    # Get scenario configuration
    scenario_name = args.scenario or "single-qwen"
    if scenario_name not in EXPERIMENT_SCENARIOS:
        print(f"Error: Unknown scenario '{scenario_name}'")
        print(f"Available scenarios: {', '.join(EXPERIMENT_SCENARIOS.keys())}")
        sys.exit(1)

    model_role_config = EXPERIMENT_SCENARIOS[scenario_name]
    model_config_dict = model_role_config.to_dict()

    # Initialize store
    store = JsonStore(str(Path(settings.base_dir) / settings.data_dir))

    # Handle resume (Issue 14)
    completed_task_keys = set()
    if args.resume:
        if not store.resume_from_run(args.resume):
            print(f"Error: Cannot resume from run '{args.resume}'")
            sys.exit(1)
        completed_task_keys = await load_completed_task_keys(store)
        print(f"Resuming from run {args.resume}: {len(completed_task_keys)} tasks already completed")

    # Setup logging
    log_file = store.run_path / "experiment.log"
    setup_logging(settings.log_level, log_file)

    logger = logging.getLogger(__name__)
    logger.info(f"Starting experiment run: {store.run_id}")
    logger.info(f"Using scenario: {scenario_name}")
    logger.info(f"Model config: {model_config_dict}")

    # Save metadata
    metadata = save_run_metadata(settings, store, scenario_name, model_config_dict)
    logger.info(f"Run metadata saved")

    # Load propositions
    propositions = settings.load_propositions()
    if args.propositions:
        propositions = propositions[:args.propositions]
    logger.info(f"Loaded {len(propositions)} propositions")

    # Initialize client
    client = LambdaClient(
        api_key=settings.lambda_api_key,
        model=settings.model.name,
        base_url=settings.lambda_base_url,
    )

    # Initialize components with multi-model support
    runner = ConversationRunner(
        client=client,
        num_turns=settings.experiment.num_turns,
        temperature=settings.model.temperature,
        guesser_temperature=settings.model.guesser_temperature,
        model_config=model_config_dict,
        scenario_name=scenario_name,
    )

    batch_manager = BatchManager(BatchConfig(
        max_concurrency=settings.batch.max_concurrency,
        batch_size=settings.batch.batch_size,
        delay_between_batches=settings.batch.delay_between_batches,
    ))

    experiment_config = ExperimentConfig(
        propositions=propositions,
        conversations_per_condition=settings.experiment.conversations_per_condition,
        num_turns=settings.experiment.num_turns,
        seed=args.seed,
        completed_task_keys=completed_task_keys,  # For resume (Issue 14)
    )

    experiment = ExperimentRunner(
        config=experiment_config,
        runner=runner,
        store=store,
        batch_manager=batch_manager,
    )

    # Run experiment
    try:
        if args.pilot:
            logger.info("Running pilot experiment...")
            conversations = await experiment.run_pilot(
                num_propositions=args.pilot_propositions or 2,
                conversations_per_condition=args.pilot_conversations or 2,
            )
        else:
            logger.info("Running full experiment...")
            conversations = await experiment.run_experiment()

        # Log summary
        logger.info(f"Experiment complete!")
        logger.info(f"Total conversations: {len(conversations)}")
        logger.info(f"Total API cost: ${client.total_cost:.4f}")
        logger.info(f"Results saved to: {store.run_path}")

        # Print usage stats
        stats = client.get_usage_stats()
        logger.info(f"Usage stats: {json.dumps(stats, indent=2)}")

    except KeyboardInterrupt:
        logger.info("Experiment interrupted by user")
        raise
    except Exception as e:
        logger.exception(f"Experiment failed: {e}")
        raise
    finally:
        await client.close()


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Run the AI manipulation detection experiment'
    )

    parser.add_argument(
        '--pilot',
        action='store_true',
        help='Run a small pilot experiment for testing',
    )
    parser.add_argument(
        '--pilot-propositions',
        type=int,
        default=2,
        help='Number of propositions for pilot (default: 2)',
    )
    parser.add_argument(
        '--pilot-conversations',
        type=int,
        default=2,
        help='Conversations per condition for pilot (default: 2)',
    )
    parser.add_argument(
        '--propositions',
        type=int,
        help='Limit number of propositions (default: all)',
    )
    parser.add_argument(
        '--conversations',
        type=int,
        help='Conversations per condition (default: from settings)',
    )
    parser.add_argument(
        '--concurrency',
        type=int,
        help='Max concurrent API calls (default: from settings)',
    )
    parser.add_argument(
        '--seed',
        type=int,
        help='Random seed for reproducibility',
    )
    parser.add_argument(
        '--scenario',
        type=str,
        default='single-qwen',
        choices=list(EXPERIMENT_SCENARIOS.keys()),
        help='Model scenario to use (default: single-qwen). '
             'Available: ' + ', '.join(EXPERIMENT_SCENARIOS.keys()),
    )
    parser.add_argument(
        '--resume',
        type=str,
        help='Run ID to resume from (Issue 14). Resumes an interrupted experiment.',
    )

    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(main(args))
