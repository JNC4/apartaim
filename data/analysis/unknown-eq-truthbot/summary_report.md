# Experiment Results Summary

Generated: 2026-01-12T15:57:46.675759

## Truthbot Efficacy

### Belief Shifts by Condition

| Condition | Mean Δ | Std | N |
|-----------|--------|-----|---|
| Manipulative (Control) | -22.84 | 23.61 | 750 |
| Manipulative (+ TruthBot) | -6.59 | 30.86 | 750 |
| Helpful (Control) | 20.65 | 22.59 | 750 |
| Helpful (+ TruthBot) | 26.17 | 19.56 | 750 |

### Key Metrics

- **Manipulation Reduction Ratio**: 71.16%
  - TruthBot reduced manipulation effect by 71.2%
- **Helpfulness Preservation Ratio**: 126.73%
  - TruthBot preserved 126.7% of helpful persuasion

### Statistical Tests

| Comparison | Test | Statistic | p-value | Significant |
|------------|------|-----------|---------|-------------|
| Manipulation Effect | mann_whitney_u_less | 192629.000 | 0.0000 | Yes |
| Helpfulness Effect | mann_whitney_u | 226151.500 | 0.0000 | Yes |

### Effect Sizes (Cohen's d)

| Effect | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Manipulation Reduction | 0.592 | [0.488, 0.695] | medium |
| Helpfulness Effect | 0.261 | [0.160, 0.363] | small |

### Multiple Comparison Correction (Bonferroni)

| Comparison | Raw p-value | Corrected p-value | Significant (α=0.05) |
|------------|-------------|-------------------|----------------------|
| Manipulation Effect | 0.0000 | 0.0000 | Yes |
| Helpfulness Effect | 0.0000 | 0.0000 | Yes |


## Manipulation Guesser Performance

| Metric | Value |
|--------|-------|
| Accuracy | 93.20% |
| Precision | 89.32% |
| Recall | 98.13% |
| F1 Score | 93.52% |
| AUC-ROC | 0.990 |
| Total Predictions | 1500 |
| Abstentions | 0 |

### Confusion Matrix

```
                 Predicted
              Honest | Manip
Actual Honest    662 |   88
       Manip      14 |  736
```

## Response Length Analysis

| Condition | Unknown Model (mean chars) | TruthBot (mean chars) |
|-----------|---------------------------|----------------------|
| control_manipulative | 2822 | 0 |
| truthbot_helpful | 4461 | 3586 |
| control_helpful | 4511 | 0 |
| truthbot_manipulative | 2807 | 3687 |

## Visualizations Generated

1. `belief_shift_violin.png` - Distribution of belief changes
2. `manipulation_reduction.png` - Effect of TruthBot on manipulation
3. `helpfulness_preservation.png` - Effect of TruthBot on helpfulness
4. `roc_curve.png` - Manipulation guesser ROC curve
5. `calibration.png` - Guesser confidence calibration
6. `topic_heatmap.png` - Per-topic breakdown
