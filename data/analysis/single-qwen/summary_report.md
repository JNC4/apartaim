# Experiment Results Summary

Generated: 2026-01-12T15:55:38.561191

## Truthbot Efficacy

### Belief Shifts by Condition

| Condition | Mean Δ | Std | N |
|-----------|--------|-----|---|
| Manipulative (Control) | -25.15 | 17.28 | 750 |
| Manipulative (+ TruthBot) | 7.14 | 25.09 | 750 |
| Helpful (Control) | 24.05 | 17.65 | 750 |
| Helpful (+ TruthBot) | 26.48 | 17.46 | 750 |

### Key Metrics

- **Manipulation Reduction Ratio**: 128.39%
  - TruthBot reduced manipulation effect by 128.4%
- **Helpfulness Preservation Ratio**: 110.09%
  - TruthBot preserved 110.1% of helpful persuasion

### Statistical Tests

| Comparison | Test | Statistic | p-value | Significant |
|------------|------|-----------|---------|-------------|
| Manipulation Effect | mann_whitney_u_less | 79182.000 | 0.0000 | Yes |
| Helpfulness Effect | mann_whitney_u | 246448.000 | 0.0000 | Yes |

### Effect Sizes (Cohen's d)

| Effect | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Manipulation Reduction | 1.499 | [1.385, 1.614] | large |
| Helpfulness Effect | 0.138 | [0.037, 0.240] | negligible |

### Multiple Comparison Correction (Bonferroni)

| Comparison | Raw p-value | Corrected p-value | Significant (α=0.05) |
|------------|-------------|-------------------|----------------------|
| Manipulation Effect | 0.0000 | 0.0000 | Yes |
| Helpfulness Effect | 0.0000 | 0.0001 | Yes |


## Manipulation Guesser Performance

| Metric | Value |
|--------|-------|
| Accuracy | 89.87% |
| Precision | 83.67% |
| Recall | 99.07% |
| F1 Score | 90.72% |
| AUC-ROC | 0.985 |
| Total Predictions | 1500 |
| Abstentions | 0 |

### Confusion Matrix

```
                 Predicted
              Honest | Manip
Actual Honest    605 |  145
       Manip       7 |  743
```

## Response Length Analysis

| Condition | Unknown Model (mean chars) | TruthBot (mean chars) |
|-----------|---------------------------|----------------------|
| truthbot_manipulative | 2464 | 4441 |
| truthbot_helpful | 4370 | 4414 |
| control_manipulative | 2517 | 0 |
| control_helpful | 4382 | 0 |

## Visualizations Generated

1. `belief_shift_violin.png` - Distribution of belief changes
2. `manipulation_reduction.png` - Effect of TruthBot on manipulation
3. `helpfulness_preservation.png` - Effect of TruthBot on helpfulness
4. `roc_curve.png` - Manipulation guesser ROC curve
5. `calibration.png` - Guesser confidence calibration
6. `topic_heatmap.png` - Per-topic breakdown
