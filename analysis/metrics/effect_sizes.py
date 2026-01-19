"""Effect size calculations."""

import numpy as np
from typing import Tuple, NamedTuple
from scipy import stats


class EffectSizeResult(NamedTuple):
    """Container for effect size results."""
    cohens_d: float
    ci_lower: float
    ci_upper: float
    interpretation: str


def cohens_d(group1: np.ndarray, group2: np.ndarray) -> float:
    """
    Compute Cohen's d effect size for two independent groups.

    Formula: d = (mean1 - mean2) / pooled_std

    Pooled std = sqrt(((n1-1)*s1^2 + (n2-1)*s2^2) / (n1+n2-2))
    """
    group1 = np.asarray(group1)
    group2 = np.asarray(group2)

    n1, n2 = len(group1), len(group2)

    if n1 < 2 or n2 < 2:
        return np.nan

    var1 = group1.var(ddof=1)
    var2 = group2.var(ddof=1)

    pooled_std = np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))

    if pooled_std < 1e-10:
        return np.nan

    return (group1.mean() - group2.mean()) / pooled_std


def cohens_d_with_ci(
    group1: np.ndarray,
    group2: np.ndarray,
    confidence: float = 0.95,
) -> EffectSizeResult:
    """
    Compute Cohen's d with confidence interval.

    Uses the non-central t-distribution approximation for CI.

    Returns:
        EffectSizeResult with d, CI, and interpretation
    """
    group1 = np.asarray(group1)
    group2 = np.asarray(group2)

    d = cohens_d(group1, group2)

    if np.isnan(d):
        return EffectSizeResult(
            cohens_d=np.nan,
            ci_lower=np.nan,
            ci_upper=np.nan,
            interpretation="undefined",
        )

    n1, n2 = len(group1), len(group2)

    # Standard error of d (approximate)
    se_d = np.sqrt((n1 + n2) / (n1 * n2) + (d ** 2) / (2 * (n1 + n2)))

    # Use t-distribution for CI
    df = n1 + n2 - 2
    t_crit = stats.t.ppf((1 + confidence) / 2, df)

    ci_lower = d - t_crit * se_d
    ci_upper = d + t_crit * se_d

    return EffectSizeResult(
        cohens_d=d,
        ci_lower=ci_lower,
        ci_upper=ci_upper,
        interpretation=interpret_cohens_d(d),
    )


def interpret_cohens_d(d: float) -> str:
    """
    Interpret Cohen's d magnitude.

    |d| < 0.2: negligible
    0.2 <= |d| < 0.5: small
    0.5 <= |d| < 0.8: medium
    |d| >= 0.8: large
    """
    if np.isnan(d):
        return "undefined"

    d_abs = abs(d)
    if d_abs < 0.2:
        return "negligible"
    elif d_abs < 0.5:
        return "small"
    elif d_abs < 0.8:
        return "medium"
    else:
        return "large"


def glass_delta(treatment: np.ndarray, control: np.ndarray) -> float:
    """
    Compute Glass's delta (when groups have unequal variances).

    Uses control group's standard deviation as denominator.
    """
    treatment = np.asarray(treatment)
    control = np.asarray(control)

    if len(control) < 2:
        return np.nan

    control_std = control.std(ddof=1)
    if control_std < 1e-10:
        return np.nan

    return (treatment.mean() - control.mean()) / control_std
