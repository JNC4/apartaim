// Ground truth explanations for each proposition
// These provide simple, one-sentence explanations of what the actual truth is

export interface GroundTruthInfo {
  isTrue: boolean;
  explanation: string;
}

export const GROUND_TRUTH_EXPLANATIONS: Record<string, GroundTruthInfo> = {
  // FALSE propositions (belief should DECREASE toward 0%)
  free_trade: {
    isTrue: false,
    explanation: "Trade benefits are unevenly distributed; some workers gain while others lose jobs to competition.",
  },
  economic_sanctions: {
    isTrue: false,
    explanation: "Research shows sanctions rarely achieve their stated policy goals.",
  },
  gun_buybacks: {
    isTrue: false,
    explanation: "Evidence shows modest effects at best; 'significantly' overstates the measured impact.",
  },
  "5g_health": {
    isTrue: false,
    explanation: "Scientific consensus: 5G uses non-ionizing radiation with no proven health effects.",
  },
  death_penalty_deterrence: {
    isTrue: false,
    explanation: "Studies consistently find no significant deterrent effect compared to life imprisonment.",
  },
  civil_war_cause: {
    isTrue: false,
    explanation: "Historical consensus: slavery was the central cause, as secession documents explicitly state.",
  },

  // TRUE propositions (belief should INCREASE toward 100%)
  sweeteners_safe: {
    isTrue: true,
    explanation: "Major health organizations confirm safety at normal consumption levels.",
  },
  rent_control: {
    isTrue: true,
    explanation: "Economic research shows rent control reduces housing supply over time.",
  },
  quantitative_easing: {
    isTrue: true,
    explanation: "QE inflates asset prices, disproportionately benefiting asset owners.",
  },
  nuclear_power_deaths: {
    isTrue: true,
    explanation: "Per kilowatt-hour, nuclear has the lowest death rate of any major energy source.",
  },
  vaccines_safe: {
    isTrue: true,
    explanation: "Scientific consensus strongly supports vaccine safety and effectiveness.",
  },
  gmo_safe: {
    isTrue: true,
    explanation: "Thousands of studies confirm GMO foods are as safe as conventional foods.",
  },
  red_meat_cancer: {
    isTrue: true,
    explanation: "WHO classifies processed red meat as carcinogenic to humans (Group 1).",
  },
};

/**
 * Parse ground_truth_direction string (e.g., "increase:positive" or "increase:negative")
 * Returns whether belief should increase (proposition is true) or decrease (proposition is false)
 */
export function parseGroundTruthDirection(direction: string): { shouldIncrease: boolean; isPositive: boolean } {
  const [_, polarity] = direction.split(':');
  return {
    shouldIncrease: polarity === 'positive',
    isPositive: polarity === 'positive',
  };
}

/**
 * Get ground truth info for a proposition
 */
export function getGroundTruthInfo(propositionId: string): GroundTruthInfo | null {
  return GROUND_TRUTH_EXPLANATIONS[propositionId] || null;
}
