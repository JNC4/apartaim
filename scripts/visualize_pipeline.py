#!/usr/bin/env python3
"""
Visualize the data pipeline architecture.

This script generates a visual diagram of the data pipelines in this project.
It is read-only and does not modify any existing data.

Usage:
    python scripts/visualize_pipeline.py

Output:
    pipeline_diagram.png - Visual diagram of the data pipeline
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np


def create_rounded_box(ax, x, y, width, height, text, facecolor, edgecolor, fontsize=8, text_color='black', bold_title=None):
    """Create a rounded rectangle box with text."""
    box = FancyBboxPatch(
        (x - width/2, y - height/2), width, height,
        boxstyle="round,pad=0.02,rounding_size=0.1",
        facecolor=facecolor,
        edgecolor=edgecolor,
        linewidth=2,
        mutation_scale=1
    )
    ax.add_patch(box)

    if bold_title:
        # Title at top
        ax.text(x, y + height/2 - 0.3, bold_title, ha='center', va='top',
                fontsize=fontsize+1, fontweight='bold', color=text_color)
        # Details below
        ax.text(x, y - 0.1, text, ha='center', va='center',
                fontsize=fontsize-1, color=text_color, linespacing=1.2)
    else:
        ax.text(x, y, text, ha='center', va='center',
                fontsize=fontsize, color=text_color, linespacing=1.3)
    return box


def create_cylinder(ax, x, y, width, height, text, facecolor, edgecolor, fontsize=8):
    """Create a cylinder shape (database)."""
    # Main body
    rect = FancyBboxPatch(
        (x - width/2, y - height/2), width, height * 0.8,
        boxstyle="round,pad=0.02,rounding_size=0.05",
        facecolor=facecolor,
        edgecolor=edgecolor,
        linewidth=2
    )
    ax.add_patch(rect)

    # Top ellipse
    ellipse = mpatches.Ellipse((x, y + height*0.3), width, height*0.25,
                                facecolor=facecolor, edgecolor=edgecolor, linewidth=2)
    ax.add_patch(ellipse)

    ax.text(x, y - 0.1, text, ha='center', va='center', fontsize=fontsize-1)


def draw_arrow(ax, start, end, color='#555555', style='-', connectionstyle='arc3,rad=0'):
    """Draw an arrow between two points."""
    ax.annotate('', xy=end, xytext=start,
                arrowprops=dict(arrowstyle='->', color=color,
                               connectionstyle=connectionstyle,
                               linestyle=style, linewidth=1.5))


def draw_labeled_arrow(ax, start, end, label, color='#555555', style='-', offset=(0, 0.15)):
    """Draw an arrow with a label."""
    draw_arrow(ax, start, end, color, style)
    mid_x = (start[0] + end[0]) / 2 + offset[0]
    mid_y = (start[1] + end[1]) / 2 + offset[1]
    ax.text(mid_x, mid_y, label, fontsize=7, ha='center', va='center',
            color='#444444', style='italic')


def create_pipeline_diagram():
    """Create the main pipeline architecture diagram."""
    fig, ax = plt.subplots(1, 1, figsize=(16, 16))
    ax.set_xlim(-1, 13)
    ax.set_ylim(-1, 17)
    ax.set_aspect('equal')
    ax.axis('off')

    # Title
    ax.text(6, 16.3, 'Apartaim Data Pipeline Architecture', fontsize=18, fontweight='bold',
            ha='center', va='center', color='#333333')
    ax.text(6, 15.7, 'AI Manipulation Detection Research Pipeline', fontsize=11,
            ha='center', va='center', color='#666666', style='italic')

    # ========== LAYER 1: DATA SOURCES ==========
    ax.add_patch(FancyBboxPatch((0.3, 13.2), 11.4, 2.2, boxstyle="round,pad=0.1",
                                facecolor='#E3F2FD', edgecolor='#1976D2', linewidth=1, linestyle='--'))
    ax.text(0.6, 15.1, 'DATA SOURCES', fontsize=9, fontweight='bold', color='#1976D2')

    create_rounded_box(ax, 2.5, 14.2, 2.5, 1.2, 'Propositions\n(JSON)', '#BBDEFB', '#1976D2', fontsize=9)
    create_rounded_box(ax, 6, 14.2, 2.5, 1.2, 'LLM API\n(Lambda/Qwen)', '#BBDEFB', '#1976D2', fontsize=9)
    create_rounded_box(ax, 9.5, 14.2, 2.5, 1.2, 'Environment\nConfig (.env)', '#BBDEFB', '#1976D2', fontsize=9)

    # ========== LAYER 2: ORCHESTRATION ==========
    ax.add_patch(FancyBboxPatch((0.3, 9.5), 11.4, 3.3, boxstyle="round,pad=0.1",
                                facecolor='#FFF3E0', edgecolor='#F57C00', linewidth=1))
    ax.text(0.6, 12.5, 'ORCHESTRATION LAYER', fontsize=9, fontweight='bold', color='#E65100')

    create_rounded_box(ax, 3, 11.5, 4.5, 1.6,
                      '• Build task queue\n• Stratified random\n• Resume checkpoint',
                      '#FFE0B2', '#F57C00', fontsize=8, bold_title='ExperimentRunner')

    create_rounded_box(ax, 9, 11.5, 4.5, 1.6,
                      '• Concurrency control\n• Rate limiting\n• Retry w/ backoff',
                      '#FFE0B2', '#F57C00', fontsize=8, bold_title='BatchManager')

    create_rounded_box(ax, 6, 10, 7, 1.3,
                      '• Multi-turn dialogues  • Belief extraction  • Manipulation guesser',
                      '#FFE0B2', '#F57C00', fontsize=8, bold_title='ConversationRunner')

    # ========== LAYER 3: ETL PROCESSING ==========
    ax.add_patch(FancyBboxPatch((0.3, 6.2), 11.4, 2.9, boxstyle="round,pad=0.1",
                                facecolor='#E8F5E9', edgecolor='#388E3C', linewidth=1))
    ax.text(0.6, 8.8, 'ETL PROCESSING', fontsize=9, fontweight='bold', color='#2E7D32')

    create_rounded_box(ax, 2.5, 7.4, 3.2, 1.8,
                      '• Fetch LLM responses\n• Parse JSON outputs\n• Extract beliefs',
                      '#C8E6C9', '#388E3C', fontsize=8, bold_title='EXTRACT')

    create_rounded_box(ax, 6, 7.4, 3.2, 1.8,
                      '• Compute deltas\n• Normalize scores\n• Track lengths',
                      '#C8E6C9', '#388E3C', fontsize=8, bold_title='TRANSFORM')

    create_rounded_box(ax, 9.5, 7.4, 3.2, 1.8,
                      '• Save JSON files\n• Create checkpoints\n• Build summary',
                      '#C8E6C9', '#388E3C', fontsize=8, bold_title='LOAD')

    # ========== LAYER 4: STORAGE ==========
    ax.add_patch(FancyBboxPatch((0.3, 3.5), 11.4, 2.3, boxstyle="round,pad=0.1",
                                facecolor='#F3E5F5', edgecolor='#7B1FA2', linewidth=1))
    ax.text(0.6, 5.5, 'STORAGE (JsonStore)', fontsize=9, fontweight='bold', color='#6A1B9A')

    create_cylinder(ax, 2.5, 4.5, 2.2, 1.2, '{uuid}.json\nConversations', '#E1BEE7', '#7B1FA2', fontsize=8)
    create_cylinder(ax, 6, 4.5, 2.2, 1.2, 'checkpoint.json\nRecovery', '#E1BEE7', '#7B1FA2', fontsize=8)
    create_cylinder(ax, 9.5, 4.5, 2.8, 1.2, 'experiment_\nsummary.json', '#E1BEE7', '#7B1FA2', fontsize=8)

    # ========== LAYER 5: ANALYSIS ==========
    ax.add_patch(FancyBboxPatch((0.3, 0.5), 11.4, 2.6, boxstyle="round,pad=0.1",
                                facecolor='#FFEBEE', edgecolor='#D32F2F', linewidth=1))
    ax.text(0.6, 2.8, 'ANALYSIS PIPELINE', fontsize=9, fontweight='bold', color='#C62828')

    create_rounded_box(ax, 2, 1.6, 2.2, 1.3, 'Load Data\n(pandas)', '#FFCDD2', '#D32F2F', fontsize=8)

    create_rounded_box(ax, 4.8, 1.6, 2.8, 1.3,
                      '• Efficacy metrics\n• Effect sizes',
                      '#FFCDD2', '#D32F2F', fontsize=7, bold_title='Metrics')

    create_rounded_box(ax, 7.6, 1.6, 2.5, 1.3,
                      '• t-tests\n• Bonferroni',
                      '#FFCDD2', '#D32F2F', fontsize=7, bold_title='Statistics')

    create_rounded_box(ax, 10.2, 1.6, 2.2, 1.3,
                      '• Violin plots\n• ROC curves',
                      '#FFCDD2', '#D32F2F', fontsize=7, bold_title='Visualize')

    # ========== LAYER 6: OUTPUTS ==========
    ax.add_patch(FancyBboxPatch((0.3, -0.7), 11.4, 1.0, boxstyle="round,pad=0.1",
                                facecolor='#FAFAFA', edgecolor='#757575', linewidth=1, linestyle='--'))
    ax.text(0.6, 0.1, 'OUTPUTS', fontsize=9, fontweight='bold', color='#616161')

    create_rounded_box(ax, 2.5, -0.3, 2.2, 0.6, 'Report (MD)', '#E0E0E0', '#757575', fontsize=8)
    create_rounded_box(ax, 6, -0.3, 2.5, 0.6, 'Metrics (JSON)', '#E0E0E0', '#757575', fontsize=8)
    create_rounded_box(ax, 9.5, -0.3, 2.2, 0.6, 'Charts (PNG)', '#E0E0E0', '#757575', fontsize=8)

    # ========== ARROWS ==========
    # Sources to Orchestration
    draw_labeled_arrow(ax, (2.5, 13.6), (3, 12.3), 'load', offset=(-0.5, 0))
    draw_labeled_arrow(ax, (9.5, 13.6), (9, 12.3), 'config', offset=(0.5, 0))
    draw_arrow(ax, (6, 13.6), (6, 10.65), style='--')  # LLM API dashed

    # Within Orchestration
    draw_labeled_arrow(ax, (5.25, 11.5), (6.75, 11.5), 'tasks')
    draw_arrow(ax, (6, 10.65), (6, 9.35))  # Down to ConversationRunner output

    # Orchestration to ETL
    draw_arrow(ax, (6, 9.35), (6, 8.3))

    # ETL flow
    draw_arrow(ax, (4.1, 7.4), (4.4, 7.4))
    draw_arrow(ax, (7.6, 7.4), (7.9, 7.4))

    # ETL to Storage
    draw_labeled_arrow(ax, (2.5, 6.5), (2.5, 5.1), 'save', offset=(-0.5, 0))
    draw_labeled_arrow(ax, (6, 6.5), (6, 5.1), 'checkpoint', offset=(-0.7, 0))
    draw_labeled_arrow(ax, (9.5, 6.5), (9.5, 5.1), 'summary', offset=(0.6, 0))

    # Checkpoint feedback loop (dashed purple)
    ax.annotate('', xy=(0.8, 11.5), xytext=(2.5, 3.9),
                arrowprops=dict(arrowstyle='->', color='#7B1FA2',
                               connectionstyle='arc3,rad=0.3',
                               linestyle='--', linewidth=1.5))
    ax.text(0.2, 7.5, 'resume', fontsize=7, color='#7B1FA2', style='italic', rotation=90)

    # Storage to Analysis
    draw_arrow(ax, (9.5, 3.9), (9.5, 3.1))
    draw_arrow(ax, (9.5, 3.1), (2, 2.25))

    # Analysis flow
    draw_arrow(ax, (3.1, 1.6), (3.4, 1.6))
    draw_arrow(ax, (6.2, 1.6), (6.35, 1.6))
    draw_arrow(ax, (8.85, 1.6), (9.1, 1.6))

    # Analysis to Outputs
    draw_arrow(ax, (4.8, 1.0), (2.5, 0))
    draw_arrow(ax, (7.6, 1.0), (6, 0))
    draw_arrow(ax, (10.2, 1.0), (9.5, 0))

    # Legend
    ax.text(12.2, 15.5, 'Legend:', fontsize=9, fontweight='bold')
    ax.annotate('', xy=(12.7, 15), xytext=(12.2, 15),
                arrowprops=dict(arrowstyle='->', color='#555555', linewidth=1.5))
    ax.text(12.8, 15, 'Data flow', fontsize=8)
    ax.annotate('', xy=(12.7, 14.5), xytext=(12.2, 14.5),
                arrowprops=dict(arrowstyle='->', color='#555555', linestyle='--', linewidth=1.5))
    ax.text(12.8, 14.5, 'External/Optional', fontsize=8)
    ax.annotate('', xy=(12.7, 14), xytext=(12.2, 14),
                arrowprops=dict(arrowstyle='->', color='#7B1FA2', linestyle='--', linewidth=1.5))
    ax.text(12.8, 14, 'Checkpoint resume', fontsize=8)

    plt.tight_layout()
    return fig


def create_conversation_flow_diagram():
    """Create a detailed conversation flow diagram."""
    fig, ax = plt.subplots(1, 1, figsize=(14, 14))
    ax.set_xlim(-0.5, 13.5)
    ax.set_ylim(-1, 13)
    ax.set_aspect('equal')
    ax.axis('off')

    # Title
    ax.text(6.5, 12.5, 'Conversation Processing Flow', fontsize=18, fontweight='bold',
            ha='center', va='center', color='#333333')
    ax.text(6.5, 11.9, 'Multi-turn dialogue with TruthBot intervention', fontsize=11,
            ha='center', va='center', color='#666666', style='italic')

    # ========== USER MODEL ==========
    ax.add_patch(FancyBboxPatch((0, 6.5), 5, 4.5, boxstyle="round,pad=0.1",
                                facecolor='#E3F2FD', edgecolor='#1976D2', linewidth=1))
    ax.text(0.2, 10.7, 'USER MODEL', fontsize=10, fontweight='bold', color='#1565C0')

    create_rounded_box(ax, 1.5, 9.5, 2.5, 1.2, 'Initial\nQuestion', '#BBDEFB', '#1976D2', fontsize=9)
    create_rounded_box(ax, 1.5, 7.8, 2.5, 1.2, 'Belief\nElicitation', '#BBDEFB', '#1976D2', fontsize=9)
    create_rounded_box(ax, 3.8, 8.6, 2, 1.2, 'Follow-up', '#BBDEFB', '#1976D2', fontsize=9)

    # ========== UNKNOWN MODEL ==========
    ax.add_patch(FancyBboxPatch((5.5, 8), 4, 3, boxstyle="round,pad=0.1",
                                facecolor='#FFF3E0', edgecolor='#F57C00', linewidth=1))
    ax.text(5.7, 10.7, 'UNKNOWN MODEL', fontsize=10, fontweight='bold', color='#E65100')

    create_rounded_box(ax, 7.5, 9.3, 3, 1.5, 'Response\n(Helpful or\nManipulative)', '#FFE0B2', '#F57C00', fontsize=9)

    # ========== TRUTHBOT ==========
    ax.add_patch(FancyBboxPatch((5.5, 4), 4, 3.5, boxstyle="round,pad=0.1",
                                facecolor='#E8F5E9', edgecolor='#388E3C', linewidth=1, linestyle='--'))
    ax.text(5.7, 7.2, 'TRUTHBOT (conditional)', fontsize=10, fontweight='bold', color='#2E7D32')

    create_rounded_box(ax, 7.5, 5.5, 3, 1.5, 'Fact-check\nResponse', '#C8E6C9', '#388E3C', fontsize=9)

    # ========== OUTPUT ==========
    ax.add_patch(FancyBboxPatch((10, 4.5), 3.3, 6.5, boxstyle="round,pad=0.1",
                                facecolor='#F3E5F5', edgecolor='#7B1FA2', linewidth=1))
    ax.text(10.2, 10.7, 'OUTPUT', fontsize=10, fontweight='bold', color='#6A1B9A')

    create_rounded_box(ax, 11.65, 8.8, 2.8, 2.2,
                      'Turn Record\n━━━━━━━━━━━━\n• User message\n• Model responses\n• Belief score\n• Response lengths',
                      '#E1BEE7', '#7B1FA2', fontsize=8)

    create_rounded_box(ax, 11.65, 6, 2.8, 1.8,
                      'Manipulation\nGuesser',
                      '#E1BEE7', '#7B1FA2', fontsize=9)

    # ========== TURN LOOP ==========
    ax.add_patch(FancyBboxPatch((0, 0), 9.2, 3.5, boxstyle="round,pad=0.1",
                                facecolor='#ECEFF1', edgecolor='#607D8B', linewidth=1, linestyle='--'))
    ax.text(0.2, 3.2, 'TURN LOOP (3 turns)', fontsize=10, fontweight='bold', color='#455A64')

    ax.text(4.6, 1.5, '1. User asks question\n2. Unknown Model responds\n3. TruthBot fact-checks (if present)\n4. User updates belief\n5. Repeat or finalize',
            fontsize=10, ha='center', va='center', color='#455A64', linespacing=1.5)

    # ========== ARROWS ==========
    # User to Unknown Model
    draw_labeled_arrow(ax, (2.75, 9.5), (6, 9.3), 'question')

    # Unknown Model to TruthBot
    draw_labeled_arrow(ax, (7.5, 8.55), (7.5, 6.25), 'triggers', style='--')

    # Unknown Model to User (belief)
    ax.annotate('', xy=(2.75, 7.8), xytext=(6, 8.8),
                arrowprops=dict(arrowstyle='->', color='#555555',
                               connectionstyle='arc3,rad=-0.2', linewidth=1.5))
    ax.text(4.5, 7.6, 'combined view', fontsize=8, color='#444444', style='italic')

    # TruthBot to User
    ax.annotate('', xy=(2.75, 7.4), xytext=(6, 5.5),
                arrowprops=dict(arrowstyle='->', color='#388E3C',
                               connectionstyle='arc3,rad=0.3', linewidth=1.5, linestyle='--'))

    # User follow-up loop
    ax.annotate('', xy=(4.8, 9.2), xytext=(2.75, 8.6),
                arrowprops=dict(arrowstyle='->', color='#1976D2',
                               connectionstyle='arc3,rad=-0.3', linewidth=1.5))

    ax.annotate('', xy=(6, 9.6), xytext=(4.8, 9.2),
                arrowprops=dict(arrowstyle='->', color='#1976D2',
                               connectionstyle='arc3,rad=-0.2', linewidth=1.5))

    # To Turn Record
    draw_arrow(ax, (9, 9.3), (10.25, 8.8))
    draw_arrow(ax, (9, 5.5), (10.25, 6), style='--')

    # Turn Record to Guesser
    draw_labeled_arrow(ax, (11.65, 7.7), (11.65, 6.9), 'final', offset=(0.6, 0))

    plt.tight_layout()
    return fig


def main():
    """Generate pipeline visualization diagrams."""
    print("=" * 60)
    print("Generating Data Pipeline Visualizations")
    print("=" * 60)
    print()
    print("This script is READ-ONLY and does not modify any existing data.")
    print()

    # Main pipeline diagram
    print("1. Creating main pipeline architecture diagram...")
    fig1 = create_pipeline_diagram()
    fig1.savefig('pipeline_diagram.png', dpi=150, bbox_inches='tight',
                 facecolor='white', edgecolor='none')
    plt.close(fig1)
    print("   Saved: pipeline_diagram.png")

    # Detailed conversation flow
    print("2. Creating conversation flow diagram...")
    fig2 = create_conversation_flow_diagram()
    fig2.savefig('conversation_flow_diagram.png', dpi=150, bbox_inches='tight',
                 facecolor='white', edgecolor='none')
    plt.close(fig2)
    print("   Saved: conversation_flow_diagram.png")

    print()
    print("=" * 60)
    print("Done! Generated visualizations:")
    print("  - pipeline_diagram.png: High-level data pipeline architecture")
    print("  - conversation_flow_diagram.png: Detailed conversation processing")
    print("=" * 60)


if __name__ == '__main__':
    main()
