"""Belief shift distribution visualizations."""

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np
from typing import Optional, Tuple
from pathlib import Path

from .utils import setup_style, CONDITION_COLORS, CONDITION_LABELS, save_figure, get_condition_order


def plot_belief_shift_violin(
    df: pd.DataFrame,
    output_path: Optional[str] = None,
    figsize: Tuple[int, int] = (12, 6),
) -> plt.Figure:
    """
    Create violin plots of belief shifts across all 4 conditions.

    Args:
        df: DataFrame with columns: condition, belief_delta (or normalized_belief_delta)
        output_path: If provided, save figure to this path
        figsize: Figure dimensions

    Returns:
        matplotlib Figure object
    """
    setup_style()

    fig, ax = plt.subplots(figsize=figsize)

    # Use normalized_belief_delta if available, else fall back to belief_delta
    delta_col = 'normalized_belief_delta' if 'normalized_belief_delta' in df.columns else 'belief_delta'

    # Prepare data
    order = get_condition_order()
    colors = [CONDITION_COLORS.get(c, '#888888') for c in order]

    # Create violin plot
    parts = ax.violinplot(
        [df[df['condition'] == c][delta_col].dropna().values for c in order if c in df['condition'].values],
        positions=range(len([c for c in order if c in df['condition'].values])),
        showmeans=True,
        showmedians=True,
    )

    # Color the violins
    for i, pc in enumerate(parts['bodies']):
        pc.set_facecolor(colors[i])
        pc.set_alpha(0.7)

    # Add horizontal line at y=0
    ax.axhline(y=0, color='gray', linestyle='--', linewidth=1, alpha=0.7)

    # Labels
    present_conditions = [c for c in order if c in df['condition'].values]
    ax.set_xticks(range(len(present_conditions)))
    ax.set_xticklabels([CONDITION_LABELS.get(c, c) for c in present_conditions])
    ax.set_ylabel('Belief Change (Δ)')
    ax.set_title('Belief Shift Distribution by Condition')

    # Add sample size annotations
    for i, c in enumerate(present_conditions):
        n = len(df[df['condition'] == c][delta_col].dropna())
        ax.text(i, ax.get_ylim()[0], f'n={n}', ha='center', va='top', fontsize=9)

    plt.tight_layout()

    if output_path:
        save_figure(fig, output_path)

    return fig


def plot_belief_shift_by_condition(
    df: pd.DataFrame,
    output_path: Optional[str] = None,
    figsize: Tuple[int, int] = (10, 6),
) -> plt.Figure:
    """
    Create box plots comparing conditions.

    Args:
        df: DataFrame with experiment results
        output_path: If provided, save figure to this path
        figsize: Figure dimensions

    Returns:
        matplotlib Figure object
    """
    setup_style()

    fig, ax = plt.subplots(figsize=figsize)

    # Use normalized_belief_delta if available, else fall back to belief_delta
    delta_col = 'normalized_belief_delta' if 'normalized_belief_delta' in df.columns else 'belief_delta'

    # Prepare data
    order = get_condition_order()
    present_conditions = [c for c in order if c in df['condition'].values]

    # Create box plot with swarm overlay
    box = sns.boxplot(
        data=df[df['condition'].isin(present_conditions)],
        x='condition',
        y=delta_col,
        order=present_conditions,
        palette=[CONDITION_COLORS.get(c, '#888888') for c in present_conditions],
        ax=ax,
    )

    # Add individual points
    sns.stripplot(
        data=df[df['condition'].isin(present_conditions)],
        x='condition',
        y=delta_col,
        order=present_conditions,
        color='black',
        alpha=0.3,
        size=3,
        ax=ax,
    )

    # Add horizontal line at y=0
    ax.axhline(y=0, color='gray', linestyle='--', linewidth=1, alpha=0.7)

    # Labels
    ax.set_xticklabels([CONDITION_LABELS.get(c, c) for c in present_conditions])
    ax.set_xlabel('')
    ax.set_ylabel('Belief Change (Δ)')
    ax.set_title('Belief Shift by Experimental Condition')

    plt.tight_layout()

    if output_path:
        save_figure(fig, output_path)

    return fig
