"""Calibration diagram for manipulation guesser confidence."""

import matplotlib.pyplot as plt
import numpy as np
from typing import Optional, Tuple
from pathlib import Path

from .utils import setup_style, save_figure


def plot_reliability_diagram(
    confidence_bins: np.ndarray,
    accuracy_per_bin: np.ndarray,
    count_per_bin: np.ndarray,
    ece: float,
    output_path: Optional[str] = None,
    figsize: Tuple[int, int] = (10, 8),
) -> plt.Figure:
    """
    Plot reliability diagram for confidence calibration.

    Args:
        confidence_bins: Bin center values
        accuracy_per_bin: Actual accuracy in each bin
        count_per_bin: Number of samples in each bin
        ece: Expected Calibration Error
        output_path: If provided, save figure to this path
        figsize: Figure dimensions

    Returns:
        matplotlib Figure object
    """
    setup_style()

    fig, (ax1, ax2) = plt.subplots(2, 1, figsize=figsize, height_ratios=[3, 1])

    # Main reliability diagram
    n_bins = len(confidence_bins)
    bin_width = 1.0 / n_bins

    # Plot bars colored by calibration gap
    for i, (conf, acc, count) in enumerate(zip(confidence_bins, accuracy_per_bin, count_per_bin)):
        if count > 0:
            gap = acc - conf
            if gap > 0:
                color = '#2ecc71'  # Underconfident (green)
            else:
                color = '#e74c3c'  # Overconfident (red)

            ax1.bar(
                conf, acc,
                width=bin_width * 0.9,
                color=color,
                edgecolor='black',
                alpha=0.7,
            )

    # Plot perfect calibration line
    ax1.plot([0, 1], [0, 1], 'k--', lw=2, label='Perfect calibration')

    # Labels and formatting
    ax1.set_xlim([0, 1])
    ax1.set_ylim([0, 1])
    ax1.set_xlabel('Mean Predicted Confidence')
    ax1.set_ylabel('Fraction of Positives (Accuracy)')
    ax1.set_title(f'Reliability Diagram (ECE = {ece:.3f})')
    ax1.legend(loc='upper left')

    # Add ECE annotation
    ax1.text(
        0.95, 0.05,
        f'Expected Calibration Error: {ece:.3f}',
        transform=ax1.transAxes,
        ha='right',
        va='bottom',
        fontsize=11,
        bbox=dict(boxstyle='round', facecolor='white', alpha=0.8),
    )

    # Histogram of predictions
    ax2.bar(
        confidence_bins,
        count_per_bin,
        width=bin_width * 0.9,
        color='#3498db',
        edgecolor='black',
        alpha=0.7,
    )
    ax2.set_xlim([0, 1])
    ax2.set_xlabel('Confidence')
    ax2.set_ylabel('Count')
    ax2.set_title('Distribution of Confidence Scores')

    plt.tight_layout()

    if output_path:
        save_figure(fig, output_path)

    return fig
