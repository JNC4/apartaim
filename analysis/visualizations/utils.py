"""Visualization utilities and style settings."""

import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from typing import Optional, List

# Consistent style configuration
STYLE_CONFIG = {
    'figure.figsize': (10, 6),
    'font.size': 11,
    'axes.titlesize': 14,
    'axes.labelsize': 12,
    'xtick.labelsize': 10,
    'ytick.labelsize': 10,
    'legend.fontsize': 10,
    'figure.dpi': 150,
}

# Color palette for conditions
CONDITION_COLORS = {
    'control_helpful': '#2ecc71',       # Green
    'control_manipulative': '#e74c3c',  # Red
    'truthbot_helpful': '#27ae60',      # Darker green
    'truthbot_manipulative': '#3498db', # Blue (mitigated)
}

# Condition labels for display
CONDITION_LABELS = {
    'control_helpful': 'Helpful\n(Control)',
    'control_manipulative': 'Manipulative\n(Control)',
    'truthbot_helpful': 'Helpful\n(+ TruthBot)',
    'truthbot_manipulative': 'Manipulative\n(+ TruthBot)',
}


def setup_style():
    """Apply consistent matplotlib style."""
    plt.rcParams.update(STYLE_CONFIG)
    sns.set_style("whitegrid")
    sns.set_palette("husl")


def save_figure(
    fig: plt.Figure,
    path: str,
    formats: List[str] = None,
):
    """
    Save figure in multiple formats.

    Args:
        fig: Matplotlib figure
        path: Base path (without extension)
        formats: List of formats to save (default: ['png', 'pdf'])
    """
    if formats is None:
        formats = ['png', 'pdf']

    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)

    for fmt in formats:
        fig.savefig(f"{path}.{fmt}", bbox_inches='tight', dpi=300)


def add_significance_stars(
    ax: plt.Axes,
    x1: float,
    x2: float,
    y: float,
    p_value: float,
    height: float = 0.02,
):
    """
    Add significance annotation between two bars.

    Stars: * p<0.05, ** p<0.01, *** p<0.001, n.s. otherwise
    """
    if p_value < 0.001:
        stars = '***'
    elif p_value < 0.01:
        stars = '**'
    elif p_value < 0.05:
        stars = '*'
    else:
        stars = 'n.s.'

    # Get y-axis range for positioning
    y_range = ax.get_ylim()[1] - ax.get_ylim()[0]
    bar_height = y_range * height

    # Draw bracket
    ax.plot([x1, x1, x2, x2], [y, y + bar_height, y + bar_height, y], 'k-', lw=1)

    # Add text
    ax.text((x1 + x2) / 2, y + bar_height, stars, ha='center', va='bottom', fontsize=12)


def get_condition_order() -> List[str]:
    """Get standard order for conditions."""
    return [
        'control_helpful',
        'truthbot_helpful',
        'control_manipulative',
        'truthbot_manipulative',
    ]
