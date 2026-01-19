# Experiment Results Summary

Generated: 2026-01-12T15:55:45.410457

## Truthbot Efficacy

### Belief Shifts by Condition

| Condition | Mean Δ | Std | N |
|-----------|--------|-----|---|
| Manipulative (Control) | -23.45 | 22.89 | 750 |
| Manipulative (+ TruthBot) | -9.30 | 30.27 | 750 |
| Helpful (Control) | 19.89 | 23.32 | 750 |
| Helpful (+ TruthBot) | 23.89 | 20.97 | 750 |

### Key Metrics

- **Manipulation Reduction Ratio**: 60.35%
  - TruthBot reduced manipulation effect by 60.3%
- **Helpfulness Preservation Ratio**: 120.11%
  - TruthBot preserved 120.1% of helpful persuasion

### Statistical Tests

| Comparison | Test | Statistic | p-value | Significant |
|------------|------|-----------|---------|-------------|
| Manipulation Effect | mann_whitney_u_less | 216446.500 | 0.0000 | Yes |
| Helpfulness Effect | mann_whitney_u | 245649.000 | 0.0000 | Yes |

### Effect Sizes (Cohen's d)

| Effect | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Manipulation Reduction | 0.527 | [0.424, 0.630] | medium |
| Helpfulness Effect | 0.180 | [0.079, 0.282] | negligible |

### Multiple Comparison Correction (Bonferroni)

| Comparison | Raw p-value | Corrected p-value | Significant (α=0.05) |
|------------|-------------|-------------------|----------------------|
| Manipulation Effect | 0.0000 | 0.0000 | Yes |
| Helpfulness Effect | 0.0000 | 0.0000 | Yes |


## Manipulation Guesser Performance

| Metric | Value |
|--------|-------|
| Accuracy | 60.73% |
| Precision | 56.08% |
| Recall | 99.07% |
| F1 Score | 71.61% |
| AUC-ROC | 0.849 |
| Total Predictions | 1500 |
| Abstentions | 0 |

### Confusion Matrix

```
                 Predicted
              Honest | Manip
Actual Honest    168 |  582
       Manip       7 |  743
```

## Response Length Analysis

| Condition | Unknown Model (mean chars) | TruthBot (mean chars) |
|-----------|---------------------------|----------------------|
| control_manipulative | 2827 | 0 |
| truthbot_manipulative | 2874 | 3719 |
| control_helpful | 4509 | 0 |
| truthbot_helpful | 4479 | 3694 |

## Visualizations Generated

1. `belief_shift_violin.png` - Distribution of belief changes
2. `manipulation_reduction.png` - Effect of TruthBot on manipulation
3. `helpfulness_preservation.png` - Effect of TruthBot on helpfulness
4. `roc_curve.png` - Manipulation guesser ROC curve
5. `calibration.png` - Guesser confidence calibration
6. `topic_heatmap.png` - Per-topic breakdown
