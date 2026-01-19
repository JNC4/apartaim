"""ROC curve visualization for manipulation guesser."""

import matplotlib.pyplot as plt
import numpy as np
from typing import Optional, Tuple
from pathlib import Path

from .utils import setup_style, save_figure


def plot_roc_curve(
    fpr: np.ndarray,
    tpr: np.ndarray,
    auc: float,
    output_path: Optional[str] = None,
    figsize: Tuple[int, int] = (8, 8),
) -> plt.Figure:
    """
    Plot ROC curve for manipulation guesser.

    Args:
        fpr: False positive rates
        tpr: True positive rates
        auc: Area under curve
        output_path: If provided, save figure to this path
        figsize: Figure dimensions

    Returns:
        matplotlib Figure object
    """
    setup_style()

    fig, ax = plt.subplots(figsize=figsize)

    # Plot ROC curve
    ax.plot(
        fpr, tpr,
        color='#3498db',
        lw=2,
        label=f'Manipulation Guesser (AUC = {auc:.3f})',
    )

    # Fill under curve
    ax.fill_between(fpr, tpr, alpha=0.3, color='#3498db')

    # Plot diagonal (random classifier)
    ax.plot([0, 1], [0, 1], color='gray', lw=1, linestyle='--', label='Random')

    # Find and mark optimal threshold (Youden's J)
    if len(fpr) > 0 and len(tpr) > 0:
        j_scores = tpr - fpr
        optimal_idx = np.argmax(j_scores)
        optimal_fpr = fpr[optimal_idx]
        optimal_tpr = tpr[optimal_idx]

        ax.scatter(
            [optimal_fpr], [optimal_tpr],
            marker='o', s=100, color='red', zorder=5,
            label=f'Optimal (FPR={optimal_fpr:.2f}, TPR={optimal_tpr:.2f})',
        )

    # Labels and formatting
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel('False Positive Rate')
    ax.set_ylabel('True Positive Rate')
    ax.set_title('Manipulation Guesser ROC Curve')
    ax.legend(loc='lower right')
    ax.set_aspect('equal')

    plt.tight_layout()

    if output_path:
        save_figure(fig, output_path)

    return fig


def plot_precision_recall_curve(
    precision: np.ndarray,
    recall: np.ndarray,
    average_precision: float,
    output_path: Optional[str] = None,
    figsize: Tuple[int, int] = (8, 8),
) -> plt.Figure:
    """
    Plot precision-recall curve.

    Args:
        precision: Precision values
        recall: Recall values
        average_precision: Average precision score
        output_path: If provided, save figure to this path
        figsize: Figure dimensions

    Returns:
        matplotlib Figure object
    """
    setup_style()

    fig, ax = plt.subplots(figsize=figsize)

    # Plot PR curve
    ax.plot(
        recall, precision,
        color='#27ae60',
        lw=2,
        label=f'Manipulation Guesser (AP = {average_precision:.3f})',
    )

    # Fill under curve
    ax.fill_between(recall, precision, alpha=0.3, color='#27ae60')

    # Labels and formatting
    ax.set_xlim([0.0, 1.0])
    ax.set_ylim([0.0, 1.05])
    ax.set_xlabel('Recall')
    ax.set_ylabel('Precision')
    ax.set_title('Manipulation Guesser Precision-Recall Curve')
    ax.legend(loc='lower left')

    plt.tight_layout()

    if output_path:
        save_figure(fig, output_path)

    return fig
