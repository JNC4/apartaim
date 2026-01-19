"""Heatmap visualizations for per-topic analysis."""

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from typing import Optional, Tuple
from pathlib import Path

from .utils import setup_style, save_figure, get_condition_order, CONDITION_LABELS


def plot_topic_heatmap(
    df: pd.DataFrame,
    output_path: Optional[str] = None,
    figsize: Tuple[int, int] = (12, 10),
) -> plt.Figure:
    """
    Heatmap showing belief delta across topics and conditions.

    Args:
        df: DataFrame with columns: proposition_id, condition, belief_delta (or normalized_belief_delta)
        output_path: If provided, save figure to this path
        figsize: Figure dimensions

    Returns:
        matplotlib Figure object
    """
    setup_style()

    # Use normalized_belief_delta if available, else fall back to belief_delta
    delta_col = 'normalized_belief_delta' if 'normalized_belief_delta' in df.columns else 'belief_delta'

    # Pivot data for heatmap
    pivot_df = df.pivot_table(
        values=delta_col,
        index='proposition_id',
        columns='condition',
        aggfunc='mean',
    )

    # Reorder columns
    order = get_condition_order()
    cols = [c for c in order if c in pivot_df.columns]
    pivot_df = pivot_df[cols]

    # Sort rows by truthbot effect (manipulative reduction)
    # effect = control_manip - truthbot_manip (more negative = bigger improvement)
    # ascending=True puts biggest effects (most negative) at top
    if 'control_manipulative' in cols and 'truthbot_manipulative' in cols:
        pivot_df['effect'] = pivot_df['control_manipulative'] - pivot_df['truthbot_manipulative']
        pivot_df = pivot_df.sort_values('effect', ascending=True)
        pivot_df = pivot_df.drop('effect', axis=1)

    fig, ax = plt.subplots(figsize=figsize)

    # Create heatmap
    sns.heatmap(
        pivot_df,
        annot=True,
        fmt='.1f',
        cmap='RdYlGn',  # Green for positive (toward truth), Red for negative (away from truth)
        center=0,
        ax=ax,
        cbar_kws={'label': 'Normalized Belief Δ (+ = toward truth)'},
    )

    # Labels
    ax.set_xlabel('')
    ax.set_ylabel('Topic')
    ax.set_title('Normalized Belief Shift by Topic and Condition\n(Positive = toward evidence-supported position)')

    # Update x-axis labels
    ax.set_xticklabels([CONDITION_LABELS.get(c, c).replace('\n', ' ') for c in cols], rotation=45, ha='right')

    plt.tight_layout()

    if output_path:
        save_figure(fig, output_path)

    return fig


def plot_guesser_accuracy_by_topic(
    df: pd.DataFrame,
    output_path: Optional[str] = None,
    figsize: Tuple[int, int] = (10, 8),
) -> plt.Figure:
    """
    Bar chart of guesser accuracy per topic.

    Args:
        df: DataFrame with guesser predictions and ground truth
        output_path: If provided, save figure to this path
        figsize: Figure dimensions

    Returns:
        matplotlib Figure object
    """
    setup_style()

    # Filter to truthbot conditions with predictions
    df_tb = df[
        df['condition'].str.contains('truthbot', case=False) &
        df['manipulation_guesser_prediction'].notna()
    ].copy()

    if len(df_tb) == 0:
        fig, ax = plt.subplots(figsize=figsize)
        ax.text(0.5, 0.5, 'No guesser predictions available', ha='center', va='center')
        return fig

    # Calculate accuracy per topic
    df_tb['correct'] = (
        df_tb['manipulation_guesser_prediction'] == df_tb['ground_truth_manipulative']
    )

    accuracy_by_topic = df_tb.groupby('proposition_id').agg({
        'correct': 'mean',
        'manipulation_guesser_prediction': 'count',
    }).rename(columns={'manipulation_guesser_prediction': 'n'})

    accuracy_by_topic = accuracy_by_topic.sort_values('correct', ascending=True)

    fig, ax = plt.subplots(figsize=figsize)

    # Create horizontal bar chart
    y = range(len(accuracy_by_topic))
    bars = ax.barh(
        y,
        accuracy_by_topic['correct'],
        color=['#e74c3c' if acc < 0.5 else '#2ecc71' for acc in accuracy_by_topic['correct']],
        edgecolor='black',
    )

    # Add accuracy labels
    for i, (acc, n) in enumerate(zip(accuracy_by_topic['correct'], accuracy_by_topic['n'])):
        ax.text(acc + 0.02, i, f'{acc:.0%} (n={int(n)})', va='center', fontsize=9)

    # Add 50% line (random)
    ax.axvline(x=0.5, color='gray', linestyle='--', linewidth=1, label='Random')

    # Labels
    ax.set_yticks(y)
    ax.set_yticklabels(accuracy_by_topic.index)
    ax.set_xlabel('Guesser Accuracy')
    ax.set_ylabel('Topic')
    ax.set_title('Manipulation Guesser Accuracy by Topic')
    ax.set_xlim([0, 1.15])

    plt.tight_layout()

    if output_path:
        save_figure(fig, output_path)

    return fig
