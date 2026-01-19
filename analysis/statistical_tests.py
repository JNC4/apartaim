"""Statistical tests for experiment analysis."""

import numpy as np
import pandas as pd
from typing import Tuple, NamedTuple, List, Dict, Any
from scipy import stats


class TestResult(NamedTuple):
    """Container for statistical test results."""
    statistic: float
    p_value: float
    test_name: str
    significant_at_05: bool
    significant_at_01: bool


def test_normality(data: np.ndarray, alpha: float = 0.05) -> Tuple[bool, float]:
    """
    Test for normality using Shapiro-Wilk test.

    Args:
        data: Array of values to test
        alpha: Significance level

    Returns:
        Tuple of (is_normal, p_value)
    """
    data = np.asarray(data)
    data = data[~np.isnan(data)]

    if len(data) < 3:
        return True, 1.0  # Assume normal for tiny samples

    if len(data) > 5000:
        # Use D'Agostino-Pearson for large samples
        stat, p = stats.normaltest(data)
    else:
        stat, p = stats.shapiro(data)

    return p > alpha, p


def test_homogeneity_of_variance(
    group1: np.ndarray,
    group2: np.ndarray,
    alpha: float = 0.05,
) -> Tuple[bool, float]:
    """
    Test homogeneity of variance using Levene's test.

    Returns:
        Tuple of (variances_equal, p_value)
    """
    stat, p = stats.levene(group1, group2, center='median')
    return p > alpha, p


def independent_samples_test(
    group1: np.ndarray,
    group2: np.ndarray,
    check_assumptions: bool = True,
    alternative: str = 'two-sided',
) -> TestResult:
    """
    Perform appropriate independent samples test.

    Decision tree:
    1. Check normality of both groups
    2. If both normal, check homogeneity of variance
    3. If normal + equal variance: Student's t-test
    4. If normal + unequal variance: Welch's t-test
    5. If non-normal: Mann-Whitney U test

    Args:
        group1: First group's data
        group2: Second group's data
        check_assumptions: Whether to check normality/variance assumptions
        alternative: 'two-sided', 'less', or 'greater'
            - 'two-sided': group1 != group2
            - 'less': group1 < group2
            - 'greater': group1 > group2

    Returns:
        TestResult with statistic, p-value, and test used
    """
    group1 = np.asarray(group1)
    group2 = np.asarray(group2)

    group1 = group1[~np.isnan(group1)]
    group2 = group2[~np.isnan(group2)]

    if len(group1) < 3 or len(group2) < 3:
        return TestResult(
            statistic=np.nan,
            p_value=np.nan,
            test_name="insufficient_data",
            significant_at_05=False,
            significant_at_01=False,
        )

    if check_assumptions:
        normal1, _ = test_normality(group1)
        normal2, _ = test_normality(group2)

        if normal1 and normal2:
            equal_var, _ = test_homogeneity_of_variance(group1, group2)

            if equal_var:
                stat, p = stats.ttest_ind(group1, group2, equal_var=True, alternative=alternative)
                test_name = "student_t"
            else:
                stat, p = stats.ttest_ind(group1, group2, equal_var=False, alternative=alternative)
                test_name = "welch_t"
        else:
            # Use Mann-Whitney U for non-normal data
            stat, p = stats.mannwhitneyu(group1, group2, alternative=alternative)
            test_name = "mann_whitney_u"
    else:
        # Default to Welch's t-test (most robust)
        stat, p = stats.ttest_ind(group1, group2, equal_var=False, alternative=alternative)
        test_name = "welch_t"

    # Add suffix to test name to indicate directionality
    if alternative != 'two-sided':
        test_name = f"{test_name}_{alternative}"

    return TestResult(
        statistic=stat,
        p_value=p,
        test_name=test_name,
        significant_at_05=p < 0.05,
        significant_at_01=p < 0.01,
    )


def apply_bonferroni_correction(
    p_values: List[float],
    alpha: float = 0.05,
) -> List[Tuple[float, bool]]:
    """
    Apply Bonferroni correction for multiple comparisons.

    Args:
        p_values: List of uncorrected p-values
        alpha: Family-wise error rate

    Returns:
        List of (adjusted_p, significant) tuples
    """
    n = len(p_values)
    adjusted_alpha = alpha / n

    return [
        (min(p * n, 1.0), p < adjusted_alpha)
        for p in p_values
    ]


def apply_benjamini_hochberg(
    p_values: List[float],
    alpha: float = 0.05,
) -> List[Tuple[float, bool]]:
    """
    Apply Benjamini-Hochberg FDR correction.

    Less conservative than Bonferroni, controls false discovery rate.
    """
    n = len(p_values)
    sorted_indices = np.argsort(p_values)
    sorted_p = np.array(p_values)[sorted_indices]

    # Calculate BH-adjusted p-values
    adjusted = np.zeros(n)
    for i, (idx, p) in enumerate(zip(sorted_indices, sorted_p)):
        rank = i + 1
        adjusted[idx] = p * n / rank

    # Ensure monotonicity (adjusted p-values should not decrease)
    for i in range(n - 2, -1, -1):
        adjusted[i] = min(adjusted[i], adjusted[i + 1] if i + 1 < n else 1.0)

    return [
        (min(adj_p, 1.0), adj_p < alpha)
        for adj_p in adjusted
    ]


def run_statistical_tests(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Run all statistical tests on experiment data.

    Args:
        df: DataFrame with experiment results

    Returns:
        Dictionary of test results
    """
    results = {}

    # Extract groups - use normalized_belief_delta to correctly handle increase:negative propositions
    delta_col = 'normalized_belief_delta' if 'normalized_belief_delta' in df.columns else 'belief_delta'

    def get_group(condition: str, truthbot: bool) -> np.ndarray:
        if truthbot:
            mask = df['condition'].str.contains('truthbot', case=False)
        else:
            mask = ~df['condition'].str.contains('truthbot', case=False)

        if condition == 'manipulative':
            mask &= df['condition'].str.contains('manipulative', case=False)
        else:
            mask &= df['condition'].str.contains('helpful', case=False)

        return df[mask][delta_col].dropna().values

    manip_control = get_group('manipulative', False)
    manip_truthbot = get_group('manipulative', True)
    help_control = get_group('helpful', False)
    help_truthbot = get_group('helpful', True)

    # Primary tests with directional hypotheses (Issue 17)
    # Manipulation test: We expect TruthBot to REDUCE negative belief shift
    # i.e., truthbot group should have HIGHER (less negative) delta
    # So we test: control < truthbot => alternative='less'
    results['manipulation_test'] = independent_samples_test(
        manip_control, manip_truthbot, alternative='less'
    )
    # Helpfulness test: Two-sided - we want to check if TruthBot affects helpfulness
    # (could either preserve or reduce helpful persuasion)
    results['helpfulness_test'] = independent_samples_test(
        help_control, help_truthbot, alternative='two-sided'
    )

    # Bonferroni correction for primary hypotheses
    primary_p = [
        results['manipulation_test'].p_value,
        results['helpfulness_test'].p_value,
    ]
    corrected = apply_bonferroni_correction(primary_p)
    results['bonferroni_corrected'] = {
        'manipulation': corrected[0],
        'helpfulness': corrected[1],
    }

    return results
