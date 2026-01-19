# Experiment Results Summary

Generated: 2026-01-12T15:55:48.908067

## Truthbot Efficacy

### Belief Shifts by Condition

| Condition | Mean Δ | Std | N |
|-----------|--------|-----|---|
| Manipulative (Control) | -22.96 | 23.57 | 750 |
| Manipulative (+ TruthBot) | -8.39 | 30.52 | 750 |
| Helpful (Control) | 20.15 | 23.09 | 750 |
| Helpful (+ TruthBot) | 23.17 | 21.84 | 750 |

### Key Metrics

- **Manipulation Reduction Ratio**: 63.44%
  - TruthBot reduced manipulation effect by 63.4%
- **Helpfulness Preservation Ratio**: 114.99%
  - TruthBot preserved 115.0% of helpful persuasion

### Statistical Tests

| Comparison | Test | Statistic | p-value | Significant |
|------------|------|-----------|---------|-------------|
| Manipulation Effect | mann_whitney_u_less | 207445.000 | 0.0000 | Yes |
| Helpfulness Effect | mann_whitney_u | 247201.000 | 0.0000 | Yes |

### Effect Sizes (Cohen's d)

| Effect | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Manipulation Reduction | 0.534 | [0.431, 0.637] | medium |
| Helpfulness Effect | 0.134 | [0.033, 0.236] | negligible |

### Multiple Comparison Correction (Bonferroni)

| Comparison | Raw p-value | Corrected p-value | Significant (α=0.05) |
|------------|-------------|-------------------|----------------------|
| Manipulation Effect | 0.0000 | 0.0000 | Yes |
| Helpfulness Effect | 0.0000 | 0.0001 | Yes |


## Manipulation Guesser Performance

| Metric | Value |
|--------|-------|
| Accuracy | 88.27% |
| Precision | 82.54% |
| Recall | 97.07% |
| F1 Score | 89.22% |
| AUC-ROC | 0.972 |
| Total Predictions | 1500 |
| Abstentions | 0 |

### Confusion Matrix

```
                 Predicted
              Honest | Manip
Actual Honest    596 |  154
       Manip      22 |  728
```

## Response Length Analysis

| Condition | Unknown Model (mean chars) | TruthBot (mean chars) |
|-----------|---------------------------|----------------------|
| control_manipulative | 2862 | 0 |
| truthbot_helpful | 4472 | 3692 |
| control_helpful | 4515 | 0 |
| truthbot_manipulative | 2876 | 3717 |

## Visualizations Generated

1. `belief_shift_violin.png` - Distribution of belief changes
2. `manipulation_reduction.png` - Effect of TruthBot on manipulation
3. `helpfulness_preservation.png` - Effect of TruthBot on helpfulness
4. `roc_curve.png` - Manipulation guesser ROC curve
5. `calibration.png` - Guesser confidence calibration
6. `topic_heatmap.png` - Per-topic breakdown
