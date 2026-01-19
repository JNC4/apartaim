#!/usr/bin/env python3
"""
Generate sample outputs for prompt validation (Issue 6).

This script generates sample responses from each condition to verify
that prompts produce expected behavior before running a full experiment.
"""

import asyncio
import argparse
import logging
import sys
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.settings import Settings, EXPERIMENT_SCENARIOS
from clients.lambda_client import LambdaClient
from models.conversation import Condition
from prompts.unknown_model import get_unknown_model_prompt
from prompts.truthbot import get_truthbot_prompt


def setup_logging(level: str = "INFO"):
    """Configure logging."""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    )


async def generate_sample(
    client: LambdaClient,
    proposition: Dict[str, Any],
    condition: Condition,
    prompt_variant: int,
    model: str,
) -> Dict[str, Any]:
    """Generate a single sample response."""
    from clients.base import Message

    is_manipulative = condition in (
        Condition.CONTROL_MANIPULATIVE,
        Condition.TRUTHBOT_MANIPULATIVE,
    )

    # Build system prompt
    system_prompt = get_unknown_model_prompt(is_manipulative, proposition, prompt_variant)

    # Simple user message
    user_message = f"What do you think about this: {proposition['text']}? Please share your perspective."

    messages = [
        Message("system", system_prompt),
        Message("user", user_message),
    ]

    try:
        response = await client.complete(messages, temperature=0.7, model=model)
        return {
            "proposition_id": proposition["id"],
            "proposition_text": proposition["text"],
            "condition": condition.value,
            "prompt_variant": prompt_variant,
            "system_prompt": system_prompt,
            "user_message": user_message,
            "response": response.content,
            "response_length": len(response.content),
            "status": "success",
        }
    except Exception as e:
        return {
            "proposition_id": proposition["id"],
            "proposition_text": proposition["text"],
            "condition": condition.value,
            "prompt_variant": prompt_variant,
            "system_prompt": system_prompt,
            "user_message": user_message,
            "response": None,
            "error": str(e),
            "status": "failed",
        }


async def generate_truthbot_sample(
    client: LambdaClient,
    proposition: Dict[str, Any],
    model: str,
) -> Dict[str, Any]:
    """Generate a TruthBot sample response."""
    from clients.base import Message

    system_prompt = get_truthbot_prompt(proposition)
    user_message = f"What do you think about this: {proposition['text']}? Please share your perspective."

    messages = [
        Message("system", system_prompt),
        Message("user", user_message),
    ]

    try:
        response = await client.complete(messages, temperature=0.7, model=model)
        return {
            "proposition_id": proposition["id"],
            "proposition_text": proposition["text"],
            "role": "truthbot",
            "system_prompt": system_prompt,
            "user_message": user_message,
            "response": response.content,
            "response_length": len(response.content),
            "status": "success",
        }
    except Exception as e:
        return {
            "proposition_id": proposition["id"],
            "proposition_text": proposition["text"],
            "role": "truthbot",
            "system_prompt": system_prompt,
            "user_message": user_message,
            "response": None,
            "error": str(e),
            "status": "failed",
        }


def generate_markdown_report(
    samples: List[Dict[str, Any]],
    truthbot_samples: List[Dict[str, Any]],
) -> str:
    """Generate a markdown validation report."""
    report = f"""# Prompt Validation Report

Generated: {datetime.utcnow().isoformat()}

This report contains sample outputs from each condition for manual review.
Check for:
- Appropriate tone and behavior for each condition
- No refusals or unexpected responses
- Manipulative prompts showing persuasive behavior
- Helpful prompts showing balanced behavior
- TruthBot showing evidence-based responses

---

## Summary

- Total samples: {len(samples)}
- Successful: {len([s for s in samples if s['status'] == 'success'])}
- Failed: {len([s for s in samples if s['status'] == 'failed'])}

---

## Unknown Model Samples

"""

    # Group by condition
    by_condition = {}
    for sample in samples:
        cond = sample['condition']
        if cond not in by_condition:
            by_condition[cond] = []
        by_condition[cond].append(sample)

    for condition, cond_samples in by_condition.items():
        report += f"\n### Condition: {condition}\n\n"

        for sample in cond_samples:
            report += f"#### Proposition: {sample['proposition_id']}\n\n"
            report += f"**Text:** {sample['proposition_text']}\n\n"
            report += f"**Prompt Variant:** {sample['prompt_variant']}\n\n"
            report += f"**Status:** {sample['status']}\n\n"

            if sample['status'] == 'success':
                report += f"**Response Length:** {sample['response_length']} chars\n\n"
                report += f"<details>\n<summary>System Prompt</summary>\n\n```\n{sample['system_prompt']}\n```\n\n</details>\n\n"
                report += f"**Response:**\n\n> {sample['response'][:1000]}{'...' if len(sample['response']) > 1000 else ''}\n\n"
            else:
                report += f"**Error:** {sample.get('error', 'Unknown error')}\n\n"

            report += "---\n\n"

    # TruthBot samples
    report += "\n## TruthBot Samples\n\n"
    for sample in truthbot_samples:
        report += f"### Proposition: {sample['proposition_id']}\n\n"
        report += f"**Text:** {sample['proposition_text']}\n\n"
        report += f"**Status:** {sample['status']}\n\n"

        if sample['status'] == 'success':
            report += f"**Response Length:** {sample['response_length']} chars\n\n"
            report += f"<details>\n<summary>System Prompt</summary>\n\n```\n{sample['system_prompt']}\n```\n\n</details>\n\n"
            report += f"**Response:**\n\n> {sample['response'][:1000]}{'...' if len(sample['response']) > 1000 else ''}\n\n"
        else:
            report += f"**Error:** {sample.get('error', 'Unknown error')}\n\n"

        report += "---\n\n"

    # Flagging section
    failed = [s for s in samples + truthbot_samples if s['status'] == 'failed']
    if failed:
        report += "\n## ⚠️ Flagged Issues\n\n"
        report += f"**{len(failed)} samples failed:**\n\n"
        for sample in failed:
            report += f"- {sample.get('proposition_id', 'unknown')} / {sample.get('condition', sample.get('role', 'unknown'))}: {sample.get('error', 'Unknown error')}\n"

    return report


async def main(args):
    """Main validation pipeline."""
    setup_logging(args.log_level)
    logger = logging.getLogger(__name__)

    # Load settings
    settings = Settings.from_env()

    # Get scenario
    scenario_name = args.scenario or "single-qwen"
    if scenario_name not in EXPERIMENT_SCENARIOS:
        print(f"Error: Unknown scenario '{scenario_name}'")
        print(f"Available scenarios: {', '.join(EXPERIMENT_SCENARIOS.keys())}")
        sys.exit(1)

    model_role_config = EXPERIMENT_SCENARIOS[scenario_name]
    model = model_role_config.unknown_model

    # Load propositions
    propositions = settings.load_propositions()
    if args.propositions:
        propositions = propositions[:args.propositions]

    logger.info(f"Validating with {len(propositions)} propositions")
    logger.info(f"Model: {model}")

    # Initialize client
    client = LambdaClient(
        api_key=settings.lambda_api_key,
        model=model,
        base_url=settings.lambda_base_url,
    )

    samples = []
    truthbot_samples = []

    try:
        # Generate samples for each condition
        conditions = [
            Condition.CONTROL_HELPFUL,
            Condition.CONTROL_MANIPULATIVE,
        ]

        for prop in propositions:
            for condition in conditions:
                for variant in range(min(args.variants, 3)):
                    logger.info(f"Generating: {prop['id']} / {condition.value} / variant {variant}")
                    sample = await generate_sample(
                        client, prop, condition, variant, model
                    )
                    samples.append(sample)

            # TruthBot sample
            logger.info(f"Generating TruthBot: {prop['id']}")
            tb_sample = await generate_truthbot_sample(
                client, prop, model_role_config.truthbot_model
            )
            truthbot_samples.append(tb_sample)

        # Generate report
        report = generate_markdown_report(samples, truthbot_samples)

        # Save report
        output_path = Path(args.output)
        with open(output_path, 'w') as f:
            f.write(report)

        logger.info(f"Validation report saved to {output_path}")

        # Save raw JSON data
        json_path = output_path.with_suffix('.json')
        with open(json_path, 'w') as f:
            json.dump({
                "samples": samples,
                "truthbot_samples": truthbot_samples,
                "metadata": {
                    "scenario": scenario_name,
                    "model": model,
                    "generated_at": datetime.utcnow().isoformat(),
                }
            }, f, indent=2)

        logger.info(f"Raw data saved to {json_path}")

        # Print summary
        success_count = len([s for s in samples if s['status'] == 'success'])
        fail_count = len([s for s in samples if s['status'] == 'failed'])
        print(f"\n{'='*60}")
        print("VALIDATION SUMMARY")
        print(f"{'='*60}")
        print(f"Total samples: {len(samples)} + {len(truthbot_samples)} TruthBot")
        print(f"Successful: {success_count}")
        print(f"Failed: {fail_count}")
        print(f"Report: {output_path}")
        print(f"{'='*60}")

    finally:
        await client.close()


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Validate prompts by generating sample outputs'
    )
    parser.add_argument(
        '--propositions',
        type=int,
        default=2,
        help='Number of propositions to test (default: 2)',
    )
    parser.add_argument(
        '--variants',
        type=int,
        default=1,
        help='Number of prompt variants to test per condition (default: 1, max: 3)',
    )
    parser.add_argument(
        '--scenario',
        type=str,
        default='single-qwen',
        choices=list(EXPERIMENT_SCENARIOS.keys()),
        help='Model scenario to use',
    )
    parser.add_argument(
        '--output',
        type=str,
        default='validation_report.md',
        help='Output file path (default: validation_report.md)',
    )
    parser.add_argument(
        '--log-level',
        type=str,
        default='INFO',
        help='Logging level',
    )

    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    asyncio.run(main(args))
