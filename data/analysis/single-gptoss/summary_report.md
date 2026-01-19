# Experiment Results Summary

Generated: 2026-01-12T15:55:41.850221

## Truthbot Efficacy

### Belief Shifts by Condition

| Condition | Mean Δ | Std | N |
|-----------|--------|-----|---|
| Manipulative (Control) | -19.07 | 23.14 | 750 |
| Manipulative (+ TruthBot) | -5.82 | 28.39 | 750 |
| Helpful (Control) | 22.36 | 18.60 | 750 |
| Helpful (+ TruthBot) | 23.78 | 18.39 | 750 |

### Key Metrics

- **Manipulation Reduction Ratio**: 69.46%
  - TruthBot reduced manipulation effect by 69.5%
- **Helpfulness Preservation Ratio**: 106.35%
  - TruthBot preserved 106.4% of helpful persuasion

### Statistical Tests

| Comparison | Test | Statistic | p-value | Significant |
|------------|------|-----------|---------|-------------|
| Manipulation Effect | mann_whitney_u_less | 196759.500 | 0.0000 | Yes |
| Helpfulness Effect | mann_whitney_u | 260441.500 | 0.0127 | Yes |

### Effect Sizes (Cohen's d)

| Effect | Cohen's d | 95% CI | Interpretation |
|--------|-----------|--------|----------------|
| Manipulation Reduction | 0.511 | [0.408, 0.614] | medium |
| Helpfulness Effect | 0.077 | [-0.025, 0.178] | negligible |

### Multiple Comparison Correction (Bonferroni)

| Comparison | Raw p-value | Corrected p-value | Significant (α=0.05) |
|------------|-------------|-------------------|----------------------|
| Manipulation Effect | 0.0000 | 0.0000 | Yes |
| Helpfulness Effect | 0.0127 | 0.0254 | Yes |


## Manipulation Guesser Performance

| Metric | Value |
|--------|-------|
| Accuracy | 83.40% |
| Precision | 77.38% |
| Recall | 94.40% |
| F1 Score | 85.05% |
| AUC-ROC | 0.948 |
| Total Predictions | 1500 |
| Abstentions | 0 |

### Confusion Matrix

```
                 Predicted
              Honest | Manip
Actual Honest    543 |  207
       Manip      42 |  708
```

## Response Length Analysis

| Condition | Unknown Model (mean chars) | TruthBot (mean chars) |
|-----------|---------------------------|----------------------|
| control_helpful | 3352 | 0 |
| control_manipulative | 3214 | 0 |
| truthbot_manipulative | 3146 | 2917 |
| truthbot_helpful | 3306 | 2961 |

## Visualizations Generated

1. `belief_shift_violin.png` - Distribution of belief changes
2. `manipulation_reduction.png` - Effect of TruthBot on manipulation
3. `helpfulness_preservation.png` - Effect of TruthBot on helpfulness
4. `roc_curve.png` - Manipulation guesser ROC curve
5. `calibration.png` - Guesser confidence calibration
6. `topic_heatmap.png` - Per-topic breakdown
