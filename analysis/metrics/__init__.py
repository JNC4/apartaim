from .truthbot_efficacy import (
    TruthbotMetrics,
    compute_truthbot_metrics,
    compute_manipulation_reduction_ratio,
    compute_helpfulness_preservation_ratio,
)
from .manipulation_guesser import (
    GuesserMetrics,
    compute_guesser_metrics,
    compute_calibration_data,
)
from .effect_sizes import cohens_d, cohens_d_with_ci, interpret_cohens_d


def compute_all_metrics(df):
    """Compute all metrics from experiment data."""
    truthbot = compute_truthbot_metrics(df)
    guesser = compute_guesser_metrics(df)
    return {
        "truthbot": truthbot,
        "guesser": guesser,
    }
