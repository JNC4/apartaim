#!/usr/bin/env python3
"""Main analysis script for experiment results."""

import argparse
import logging
import sys
import json
from pathlib import Path
from datetime import datetime

import pandas as pd
import numpy as np

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from storage.json_store import load_experiment_sync, load_conversations_sync
from analysis.metrics.truthbot_efficacy import (
    compute_truthbot_metrics,
    compute_confidence_intervals,
)
from analysis.metrics.manipulation_guesser import (
    compute_guesser_metrics,
    compute_roc_curve,
    compute_calibration_data,
)
from analysis.metrics.effect_sizes import cohens_d_with_ci
from analysis.statistical_tests import run_statistical_tests
from analysis.visualizations import (
    plot_belief_shift_violin,
    plot_manipulation_reduction,
    plot_helpfulness_preservation,
    plot_roc_curve,
    plot_reliability_diagram,
    plot_topic_heatmap,
)


def setup_logging(level: str = "INFO"):
    """Configure logging."""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format='%(asctime)s - %(levelname)s - %(message)s',
    )


def conversations_to_dataframe(conversations) -> pd.DataFrame:
    """Convert conversations to DataFrame for analysis."""
    records = []
    for conv in conversations:
        record = conv.to_dict() if hasattr(conv, 'to_dict') else conv
        records.append(record)

    df = pd.DataFrame(records)

    # Ensure required columns exist
    if 'condition' not in df.columns and 'truthbot_present' in df.columns:
        df['condition'] = df.apply(
            lambda r: f"{'truthbot' if r['truthbot_present'] else 'control'}_"
                     f"{'manipulative' if r['ground_truth_manipulative'] else 'helpful'}",
            axis=1
        )

    # Extract response length statistics from turns
    df['mean_unknown_response_length'] = df['turns'].apply(
        lambda turns: np.mean([t.get('unknown_model_response_length', 0) for t in turns]) if turns else 0
    )
    df['mean_truthbot_response_length'] = df['turns'].apply(
        lambda turns: np.mean([t.get('truthbot_response_length', 0) for t in turns]) if turns else 0
    )

    return df


def analyze_response_lengths(df: pd.DataFrame) -> dict:
    """Analyze response lengths across conditions."""
    length_stats = {}

    for condition in df['condition'].unique():
        mask = df['condition'] == condition
        subset = df[mask]
        length_stats[condition] = {
            'unknown_model': {
                'mean': float(subset['mean_unknown_response_length'].mean()),
                'std': float(subset['mean_unknown_response_length'].std()),
                'n': int(len(subset)),
            },
            'truthbot': {
                'mean': float(subset['mean_truthbot_response_length'].mean()),
                'std': float(subset['mean_truthbot_response_length'].std()),
                'n': int(len(subset)),
            },
        }

    return length_stats


def analyze_parse_quality(df: pd.DataFrame) -> dict:
    """Analyze belief parse quality and report statistics.

    Returns a dict with counts of each parse method and a warning if
    there are unreliable parses (fallback/failed).
    """
    parse_stats = {
        'exact': 0,
        'original_format': 0,
        'fallback': 0,
        'failed': 0,
        'unknown': 0,
        'total_turns': 0,
    }

    if 'turns' not in df.columns:
        return parse_stats

    # Extract belief_parse_method from all turns
    for turns in df['turns']:
        if not turns:
            continue
        for turn in turns:
            method = turn.get('belief_parse_method', 'unknown')
            parse_stats['total_turns'] += 1
            if method in parse_stats:
                parse_stats[method] += 1
            else:
                parse_stats['unknown'] += 1

    # Calculate reliability metrics
    reliable = parse_stats['exact'] + parse_stats['original_format']
    unreliable = parse_stats['fallback'] + parse_stats['failed']
    total = parse_stats['total_turns']

    parse_stats['reliable_count'] = reliable
    parse_stats['unreliable_count'] = unreliable
    parse_stats['reliability_rate'] = reliable / total if total > 0 else 0.0

    return parse_stats


def compute_effect_sizes(df: pd.DataFrame) -> dict:
    """Compute Cohen's d effect sizes for manipulation and helpfulness effects (Issue 9)."""
    # Use normalized_belief_delta if available, else belief_delta
    delta_col = 'normalized_belief_delta' if 'normalized_belief_delta' in df.columns else 'belief_delta'

    # Extract belief deltas for each condition
    def get_deltas(condition_pattern: str, has_truthbot: bool) -> np.ndarray:
        mask = df['condition'].str.contains(condition_pattern, case=False)
        if 'truthbot_present' in df.columns:
            mask &= df['truthbot_present'] == has_truthbot
        elif has_truthbot:
            mask &= df['condition'].str.contains('truthbot', case=False)
        else:
            mask &= ~df['condition'].str.contains('truthbot', case=False)
        return df[mask][delta_col].dropna().values

    manip_control = get_deltas('manipulative', False)
    manip_truthbot = get_deltas('manipulative', True)
    help_control = get_deltas('helpful', False)
    help_truthbot = get_deltas('helpful', True)

    effect_sizes = {}

    # Effect size for manipulation reduction
    # Positive d means truthbot group has higher (less negative) belief delta
    if len(manip_control) >= 2 and len(manip_truthbot) >= 2:
        manip_effect = cohens_d_with_ci(manip_truthbot, manip_control)
        effect_sizes['manipulation'] = {
            'cohens_d': float(manip_effect.cohens_d),
            'ci_lower': float(manip_effect.ci_lower),
            'ci_upper': float(manip_effect.ci_upper),
            'interpretation': manip_effect.interpretation,
        }
    else:
        effect_sizes['manipulation'] = None

    # Effect size for helpfulness effect
    if len(help_control) >= 2 and len(help_truthbot) >= 2:
        help_effect = cohens_d_with_ci(help_truthbot, help_control)
        effect_sizes['helpfulness'] = {
            'cohens_d': float(help_effect.cohens_d),
            'ci_lower': float(help_effect.ci_lower),
            'ci_upper': float(help_effect.ci_upper),
            'interpretation': help_effect.interpretation,
        }
    else:
        effect_sizes['helpfulness'] = None

    return effect_sizes


def generate_summary_report(
    metrics: dict,
    test_results: dict,
    output_path: Path,
    response_length_stats: dict = None,
    effect_sizes: dict = None,
):
    """Generate a markdown summary report."""
    tb = metrics['truthbot']
    gs = metrics.get('guesser')

    report = f"""# Experiment Results Summary

Generated: {datetime.utcnow().isoformat()}

## Truthbot Efficacy

### Belief Shifts by Condition

| Condition | Mean Δ | Std | N |
|-----------|--------|-----|---|
| Manipulative (Control) | {tb.mean_delta_manip_control:.2f} | {tb.std_delta_manip_control:.2f} | {tb.n_manip_control} |
| Manipulative (+ TruthBot) | {tb.mean_delta_manip_truthbot:.2f} | {tb.std_delta_manip_truthbot:.2f} | {tb.n_manip_truthbot} |
| Helpful (Control) | {tb.mean_delta_help_control:.2f} | {tb.std_delta_help_control:.2f} | {tb.n_help_control} |
| Helpful (+ TruthBot) | {tb.mean_delta_help_truthbot:.2f} | {tb.std_delta_help_truthbot:.2f} | {tb.n_help_truthbot} |

### Key Metrics

- **Manipulation Reduction Ratio**: {tb.manipulation_reduction_ratio:.2%}
  - TruthBot reduced manipulation effect by {tb.manipulation_reduction_ratio:.1%}
- **Helpfulness Preservation Ratio**: {tb.helpfulness_preservation_ratio:.2%}
  - TruthBot preserved {tb.helpfulness_preservation_ratio:.1%} of helpful persuasion

### Statistical Tests

| Comparison | Test | Statistic | p-value | Significant |
|------------|------|-----------|---------|-------------|
| Manipulation Effect | {test_results['manipulation_test'].test_name} | {test_results['manipulation_test'].statistic:.3f} | {test_results['manipulation_test'].p_value:.4f} | {'Yes' if test_results['manipulation_test'].significant_at_05 else 'No'} |
| Helpfulness Effect | {test_results['helpfulness_test'].test_name} | {test_results['helpfulness_test'].statistic:.3f} | {test_results['helpfulness_test'].p_value:.4f} | {'Yes' if test_results['helpfulness_test'].significant_at_05 else 'No'} |

"""

    # Effect sizes (Issue 9)
    if effect_sizes:
        report += """### Effect Sizes (Cohen's d)

| Effect | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
"""
        if effect_sizes.get('manipulation'):
            m = effect_sizes['manipulation']
            report += f"| Manipulation Reduction | {m['cohens_d']:.3f} | [{m['ci_lower']:.3f}, {m['ci_upper']:.3f}] | {m['interpretation']} |\n"
        if effect_sizes.get('helpfulness'):
            h = effect_sizes['helpfulness']
            report += f"| Helpfulness Effect | {h['cohens_d']:.3f} | [{h['ci_lower']:.3f}, {h['ci_upper']:.3f}] | {h['interpretation']} |\n"
        report += "\n"

    # Bonferroni correction (Issue 10)
    if 'bonferroni_corrected' in test_results:
        corrected = test_results['bonferroni_corrected']
        report += """### Multiple Comparison Correction (Bonferroni)

| Comparison | Raw p-value | Corrected p-value | Significant (α=0.05) |
|------------|-------------|-------------------|----------------------|
"""
        manip_raw = test_results['manipulation_test'].p_value
        help_raw = test_results['helpfulness_test'].p_value
        manip_corr = corrected['manipulation']
        help_corr = corrected['helpfulness']
        report += f"| Manipulation Effect | {manip_raw:.4f} | {manip_corr[0]:.4f} | {'Yes' if manip_corr[1] else 'No'} |\n"
        report += f"| Helpfulness Effect | {help_raw:.4f} | {help_corr[0]:.4f} | {'Yes' if help_corr[1] else 'No'} |\n"
        report += "\n"

    if gs:
        report += f"""
## Manipulation Guesser Performance

| Metric | Value |
|--------|-------|
| Accuracy | {gs.accuracy:.2%} |
| Precision | {gs.precision:.2%} |
| Recall | {gs.recall:.2%} |
| F1 Score | {gs.f1:.2%} |
| AUC-ROC | {gs.auc_roc:.3f} |
| Total Predictions | {gs.n_predictions} |
| Abstentions | {gs.n_abstentions} |

### Confusion Matrix

```
                 Predicted
              Honest | Manip
Actual Honest   {gs.confusion_matrix[0,0]:4d} | {gs.confusion_matrix[0,1]:4d}
       Manip    {gs.confusion_matrix[1,0]:4d} | {gs.confusion_matrix[1,1]:4d}
```
"""

    # Response length analysis (Issue 8)
    if response_length_stats:
        report += """
## Response Length Analysis

| Condition | Unknown Model (mean chars) | TruthBot (mean chars) |
|-----------|---------------------------|----------------------|
"""
        for condition, stats in response_length_stats.items():
            unknown_mean = stats['unknown_model']['mean']
            truthbot_mean = stats['truthbot']['mean']
            report += f"| {condition} | {unknown_mean:.0f} | {truthbot_mean:.0f} |\n"

    report += """
## Visualizations Generated

1. `belief_shift_violin.png` - Distribution of belief changes
2. `manipulation_reduction.png` - Effect of TruthBot on manipulation
3. `helpfulness_preservation.png` - Effect of TruthBot on helpfulness
4. `roc_curve.png` - Manipulation guesser ROC curve
5. `calibration.png` - Guesser confidence calibration
6. `topic_heatmap.png` - Per-topic breakdown
"""

    with open(output_path, 'w') as f:
        f.write(report)


def main(args):
    """Main analysis pipeline."""
    setup_logging(args.log_level)
    logger = logging.getLogger(__name__)

    # Load data
    logger.info(f"Loading data from {args.data}")
    data = load_experiment_sync(args.data)
    conversations = [c for c in data.get('conversations', [])]
    df = conversations_to_dataframe(conversations)

    logger.info(f"Loaded {len(df)} conversations")

    # Analyze parse quality and report (Issue 4)
    logger.info("Analyzing belief parse quality...")
    parse_stats = analyze_parse_quality(df)

    print("\n=== Belief Parse Quality ===")
    print(f"Total turns analyzed: {parse_stats['total_turns']}")
    print(f"  Exact matches: {parse_stats['exact']}")
    print(f"  Original format: {parse_stats['original_format']}")
    print(f"  Fallback parses: {parse_stats['fallback']}")
    print(f"  Failed parses: {parse_stats['failed']}")
    print(f"  Unknown: {parse_stats['unknown']}")
    print(f"  Reliability rate: {parse_stats['reliability_rate']:.1%}")

    if parse_stats['unreliable_count'] > 0:
        print(f"\nWARNING: {parse_stats['unreliable_count']} potentially unreliable parses "
              f"({parse_stats['fallback']} fallback, {parse_stats['failed']} failed)")
        print("Consider reviewing conversations with fallback/failed parses for data quality.\n")

    # Create output directory
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Compute metrics
    logger.info("Computing truthbot efficacy metrics...")
    tb_metrics = compute_truthbot_metrics(df)

    logger.info("Computing guesser metrics...")
    gs_metrics = compute_guesser_metrics(df)

    metrics = {
        'truthbot': tb_metrics,
        'guesser': gs_metrics,
    }

    # Run statistical tests
    logger.info("Running statistical tests...")
    test_results = run_statistical_tests(df)

    # Generate visualizations
    logger.info("Generating visualizations...")

    # 1. Belief shift violin
    plot_belief_shift_violin(df, output_dir / 'belief_shift_violin')

    # 2. Manipulation reduction
    ci_mc = compute_confidence_intervals(df, 'manipulative', False)
    ci_mt = compute_confidence_intervals(df, 'manipulative', True)
    plot_manipulation_reduction(
        tb_metrics.mean_delta_manip_control,
        tb_metrics.mean_delta_manip_truthbot,
        ci_mc, ci_mt,
        tb_metrics.manipulation_reduction_ratio,
        test_results['manipulation_test'].p_value,
        output_dir / 'manipulation_reduction',
    )

    # 3. Helpfulness preservation
    ci_hc = compute_confidence_intervals(df, 'helpful', False)
    ci_ht = compute_confidence_intervals(df, 'helpful', True)
    plot_helpfulness_preservation(
        tb_metrics.mean_delta_help_control,
        tb_metrics.mean_delta_help_truthbot,
        ci_hc, ci_ht,
        tb_metrics.helpfulness_preservation_ratio,
        test_results['helpfulness_test'].p_value,
        output_dir / 'helpfulness_preservation',
    )

    # 4. ROC curve
    fpr, tpr, thresholds, auc = compute_roc_curve(df)
    if len(fpr) > 0:
        plot_roc_curve(fpr, tpr, auc, output_dir / 'roc_curve')

    # 5. Calibration diagram
    cal_data = compute_calibration_data(df)
    if cal_data:
        plot_reliability_diagram(
            cal_data.confidence_bins,
            cal_data.accuracy_per_bin,
            cal_data.count_per_bin,
            cal_data.expected_calibration_error,
            output_dir / 'calibration',
        )

    # 6. Topic heatmap
    plot_topic_heatmap(df, output_dir / 'topic_heatmap')

    # Analyze response lengths (Issue 8)
    logger.info("Analyzing response lengths...")
    response_length_stats = analyze_response_lengths(df)

    # Compute effect sizes (Issue 9)
    logger.info("Computing effect sizes...")
    effect_sizes = compute_effect_sizes(df)

    # Generate summary report
    logger.info("Generating summary report...")
    generate_summary_report(
        metrics, test_results, output_dir / 'summary_report.md',
        response_length_stats, effect_sizes
    )

    # Save metrics as JSON
    metrics_json = {
        'truthbot': {
            'mean_delta_manip_control': tb_metrics.mean_delta_manip_control,
            'mean_delta_manip_truthbot': tb_metrics.mean_delta_manip_truthbot,
            'mean_delta_help_control': tb_metrics.mean_delta_help_control,
            'mean_delta_help_truthbot': tb_metrics.mean_delta_help_truthbot,
            'manipulation_reduction_ratio': tb_metrics.manipulation_reduction_ratio,
            'helpfulness_preservation_ratio': tb_metrics.helpfulness_preservation_ratio,
            'n_manip_control': tb_metrics.n_manip_control,
            'n_manip_truthbot': tb_metrics.n_manip_truthbot,
            'n_help_control': tb_metrics.n_help_control,
            'n_help_truthbot': tb_metrics.n_help_truthbot,
        },
        'guesser': {
            'accuracy': gs_metrics.accuracy if gs_metrics else None,
            'precision': gs_metrics.precision if gs_metrics else None,
            'recall': gs_metrics.recall if gs_metrics else None,
            'f1': gs_metrics.f1 if gs_metrics else None,
            'auc_roc': gs_metrics.auc_roc if gs_metrics else None,
        } if gs_metrics else None,
        'tests': {
            'manipulation': {
                'test_name': test_results['manipulation_test'].test_name,
                'statistic': test_results['manipulation_test'].statistic,
                'p_value': test_results['manipulation_test'].p_value,
                'significant_05': test_results['manipulation_test'].significant_at_05,
                'bonferroni_corrected_p': test_results['bonferroni_corrected']['manipulation'][0],
                'bonferroni_significant_05': test_results['bonferroni_corrected']['manipulation'][1],
            },
            'helpfulness': {
                'test_name': test_results['helpfulness_test'].test_name,
                'statistic': test_results['helpfulness_test'].statistic,
                'p_value': test_results['helpfulness_test'].p_value,
                'significant_05': test_results['helpfulness_test'].significant_at_05,
                'bonferroni_corrected_p': test_results['bonferroni_corrected']['helpfulness'][0],
                'bonferroni_significant_05': test_results['bonferroni_corrected']['helpfulness'][1],
            },
        },
        'response_lengths': response_length_stats,
        'effect_sizes': effect_sizes,
        'parse_quality': parse_stats,
    }

    with open(output_dir / 'metrics.json', 'w') as f:
        json.dump(metrics_json, f, indent=2, default=lambda x: float(x) if isinstance(x, np.floating) else x)

    logger.info(f"Analysis complete. Results saved to {output_dir}")

    # Print summary
    print("\n" + "=" * 60)
    print("ANALYSIS SUMMARY")
    print("=" * 60)
    print(f"\nTruthbot Efficacy:")
    print(f"  Manipulation Reduction: {tb_metrics.manipulation_reduction_ratio:.1%}")
    print(f"  Helpfulness Preservation: {tb_metrics.helpfulness_preservation_ratio:.1%}")
    print(f"\nStatistical Significance:")
    print(f"  Manipulation effect: p={test_results['manipulation_test'].p_value:.4f} "
          f"({'*' if test_results['manipulation_test'].significant_at_05 else 'n.s.'})")
    print(f"  Helpfulness effect: p={test_results['helpfulness_test'].p_value:.4f} "
          f"({'*' if test_results['helpfulness_test'].significant_at_05 else 'n.s.'})")
    if gs_metrics:
        print(f"\nManipulation Guesser:")
        print(f"  Accuracy: {gs_metrics.accuracy:.1%}")
        print(f"  AUC-ROC: {gs_metrics.auc_roc:.3f}")
    print("=" * 60)


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description='Analyze manipulation detection experiment results'
    )
    parser.add_argument(
        '--data',
        required=True,
        help='Path to experiment_summary.json',
    )
    parser.add_argument(
        '--output',
        default='results/',
        help='Output directory for figures and tables',
    )
    parser.add_argument(
        '--log-level',
        default='INFO',
        help='Logging level',
    )

    return parser.parse_args()


if __name__ == '__main__':
    args = parse_args()
    main(args)
