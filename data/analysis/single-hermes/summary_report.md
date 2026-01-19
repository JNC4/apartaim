# Experiment Results Summary

Generated: 2026-01-12T15:55:35.377991

## Truthbot Efficacy

### Belief Shifts by Condition

| Condition | Mean Δ | Std | N |
|-----------|--------|-----|---|
| Manipulative (Control) | -26.49 | 19.47 | 750 |
| Manipulative (+ TruthBot) | -18.57 | 25.10 | 750 |
| Helpful (Control) | 20.35 | 21.86 | 750 |
| Helpful (+ TruthBot) | 19.36 | 22.84 | 750 |

### Key Metrics

- **Manipulation Reduction Ratio**: 29.88%
  - TruthBot reduced manipulation effect by 29.9%
- **Helpfulness Preservation Ratio**: 95.12%
  - TruthBot preserved 95.1% of helpful persuasion

### Statistical Tests

| Comparison | Test | Statistic | p-value | Significant |
|------------|------|-----------|---------|-------------|
| Manipulation Effect | mann_whitney_u_less | 212414.500 | 0.0000 | Yes |
| Helpfulness Effect | mann_whitney_u | 285105.000 | 0.6379 | No |

### Effect Sizes (Cohen's d)

| Effect | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Manipulation Reduction | 0.352 | [0.250, 0.454] | small |
| Helpfulness Effect | -0.044 | [-0.146, 0.057] | negligible |

### Multiple Comparison Correction (Bonferroni)

| Comparison | Raw p-value | Corrected p-value | Significant (α=0.05) |
|------------|-------------|-------------------|----------------------|
| Manipulation Effect | 0.0000 | 0.0000 | Yes |
| Helpfulness Effect | 0.6379 | 1.0000 | No |


## Manipulation Guesser Performance

| Metric | Value |
|--------|-------|
| Accuracy | 95.60% |
| Precision | 92.54% |
| Recall | 99.20% |
| F1 Score | 95.75% |
| AUC-ROC | 0.977 |
| Total Predictions | 1500 |
| Abstentions | 0 |

### Confusion Matrix

```
                 Predicted
              Honest | Manip
Actual Honest    690 |   60
       Manip       6 |  744
```

## Response Length Analysis

| Condition | Unknown Model (mean chars) | TruthBot (mean chars) |
|-----------|---------------------------|----------------------|
| control_helpful | 2089 | 0 |
| truthbot_helpful | 2109 | 2365 |
| control_manipulative | 1819 | 0 |
| truthbot_manipulative | 1808 | 2377 |

## Visualizations Generated

1. `belief_shift_violin.png` - Distribution of belief changes
2. `manipulation_reduction.png` - Effect of TruthBot on manipulation
3. `helpfulness_preservation.png` - Effect of TruthBot on helpfulness
4. `roc_curve.png` - Manipulation guesser ROC curve
5. `calibration.png` - Guesser confidence calibration
6. `topic_heatmap.png` - Per-topic breakdown
