"""Efficacy bar charts for truthbot evaluation."""

import matplotlib.pyplot as plt
import numpy as np
from typing import Optional, Tuple
from pathlib import Path

from .utils import setup_style, CONDITION_COLORS, save_figure, add_significance_stars


def plot_manipulation_reduction(
    mean_control: float,
    mean_truthbot: float,
    ci_control: Tuple[float, float],
    ci_truthbot: Tuple[float, float],
    reduction_ratio: float,
    p_value: float = None,
    output_path: Optional[str] = None,
    figsize: Tuple[int, int] = (8, 6),
) -> plt.Figure:
    """
    Bar chart comparing manipulative condition with/without truthbot.

    Args:
        mean_control: Mean belief delta for manipulative control
        mean_truthbot: Mean belief delta for manipulative + truthbot
        ci_control: 95% CI for control (lower, upper)
        ci_truthbot: 95% CI for truthbot (lower, upper)
        reduction_ratio: Manipulation reduction ratio
        p_value: P-value from statistical test
        output_path: If provided, save figure to this path
        figsize: Figure dimensions

    Returns:
        matplotlib Figure object
    """
    setup_style()

    fig, ax = plt.subplots(figsize=figsize)

    # Data
    x = [0, 1]
    heights = [mean_control, mean_truthbot]
    colors = [CONDITION_COLORS['control_manipulative'], CONDITION_COLORS['truthbot_manipulative']]
    labels = ['Without TruthBot', 'With TruthBot']

    # Error bars
    yerr = [
        [mean_control - ci_control[0], mean_truthbot - ci_truthbot[0]],
        [ci_control[1] - mean_control, ci_truthbot[1] - mean_truthbot],
    ]

    # Create bars
    bars = ax.bar(x, heights, color=colors, edgecolor='black', linewidth=1)
    ax.errorbar(x, heights, yerr=yerr, fmt='none', color='black', capsize=5)

    # Add horizontal line at y=0
    ax.axhline(y=0, color='gray', linestyle='--', linewidth=1, alpha=0.7)

    # Add significance if p-value provided
    if p_value is not None:
        y_max = max(ci_control[1], ci_truthbot[1])
        add_significance_stars(ax, 0, 1, y_max + 2, p_value)

    # Add reduction ratio annotation
    if not np.isnan(reduction_ratio):
        reduction_pct = reduction_ratio * 100
        ax.text(
            0.5, 0.95,
            f'Manipulation Reduction: {reduction_pct:.1f}%',
            transform=ax.transAxes,
            ha='center',
            fontsize=12,
            fontweight='bold',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5),
        )

    # Labels
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_ylabel('Mean Belief Change (Δ)')
    ax.set_title('Effect of TruthBot on Manipulative Condition')

    plt.tight_layout()

    if output_path:
        save_figure(fig, output_path)

    return fig


def plot_helpfulness_preservation(
    mean_control: float,
    mean_truthbot: float,
    ci_control: Tuple[float, float],
    ci_truthbot: Tuple[float, float],
    preservation_ratio: float,
    p_value: float = None,
    output_path: Optional[str] = None,
    figsize: Tuple[int, int] = (8, 6),
) -> plt.Figure:
    """
    Bar chart comparing helpful condition with/without truthbot.

    Args:
        mean_control: Mean belief delta for helpful control
        mean_truthbot: Mean belief delta for helpful + truthbot
        ci_control: 95% CI for control
        ci_truthbot: 95% CI for truthbot
        preservation_ratio: Helpfulness preservation ratio
        p_value: P-value from statistical test
        output_path: If provided, save figure to this path
        figsize: Figure dimensions

    Returns:
        matplotlib Figure object
    """
    setup_style()

    fig, ax = plt.subplots(figsize=figsize)

    # Data
    x = [0, 1]
    heights = [mean_control, mean_truthbot]
    colors = [CONDITION_COLORS['control_helpful'], CONDITION_COLORS['truthbot_helpful']]
    labels = ['Without TruthBot', 'With TruthBot']

    # Error bars
    yerr = [
        [mean_control - ci_control[0], mean_truthbot - ci_truthbot[0]],
        [ci_control[1] - mean_control, ci_truthbot[1] - mean_truthbot],
    ]

    # Create bars
    bars = ax.bar(x, heights, color=colors, edgecolor='black', linewidth=1)
    ax.errorbar(x, heights, yerr=yerr, fmt='none', color='black', capsize=5)

    # Add horizontal line at y=0
    ax.axhline(y=0, color='gray', linestyle='--', linewidth=1, alpha=0.7)

    # Add significance if p-value provided
    if p_value is not None:
        y_max = max(ci_control[1], ci_truthbot[1])
        add_significance_stars(ax, 0, 1, y_max + 2, p_value)

    # Add preservation ratio annotation
    if not np.isnan(preservation_ratio):
        preservation_pct = preservation_ratio * 100
        ax.text(
            0.5, 0.95,
            f'Helpfulness Preserved: {preservation_pct:.1f}%',
            transform=ax.transAxes,
            ha='center',
            fontsize=12,
            fontweight='bold',
            bbox=dict(boxstyle='round', facecolor='lightgreen', alpha=0.5),
        )

    # Labels
    ax.set_xticks(x)
    ax.set_xticklabels(labels)
    ax.set_ylabel('Mean Belief Change (Δ)')
    ax.set_title('Effect of TruthBot on Helpful Condition')

    plt.tight_layout()

    if output_path:
        save_figure(fig, output_path)

    return fig
