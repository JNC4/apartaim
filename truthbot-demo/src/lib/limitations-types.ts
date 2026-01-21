// Types for limitations page data

export interface AnomalyCategory {
  count: number;
  description: string;
  byProposition: AnomalyByProposition[];
}

export interface AnomalyByProposition {
  id: string;
  proposition: string;
  count: number;
  meanDelta: number;
  samples: string[]; // conversation IDs
}

export interface RootCause {
  id: string;
  title: string;
  description: string;
  example: string;
  affectedCount: number;
}

export interface AnomalySummary {
  total: number;
  categories: {
    control_helpful_negative: AnomalyCategory;
    control_manipulative_positive: AnomalyCategory;
    truthbot_helpful_negative: AnomalyCategory;
  };
  rootCauses: RootCause[];
}

export interface SecondOrderInfo {
  title: string;
  description: string;
}

export interface InternalPreferencesInfo {
  title: string;
  description: string;
}

export interface FalsePositive {
  type: string;
  why: string;
  consequence: string;
}

export interface FalseNegative {
  type: string;
  why: string;
  consequence: string;
}

export interface ScalabilityConstraint {
  dimension: string;
  note: string;
}

export interface DualUseRisk {
  title: string;
  description: string;
}

export interface FutureResearchItem {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface LimitationsContent {
  secondOrder: SecondOrderInfo;
  internalPreferences: InternalPreferencesInfo;
  falsePositives: FalsePositive[];
  falseNegatives: FalseNegative[];
  scalability: ScalabilityConstraint[];
  dualUseRisks: DualUseRisk[];
  futureResearch: FutureResearchItem[];
}

// Anomaly category keys
export type AnomalyCategoryKey =
  | 'control_helpful_negative'
  | 'control_manipulative_positive'
  | 'truthbot_helpful_negative';

// Category display info
export const ANOMALY_CATEGORY_INFO: Record<AnomalyCategoryKey, { label: string; color: string; shortLabel: string }> = {
  control_helpful_negative: {
    label: 'Control: Helpful AI pushed user away from truth',
    shortLabel: 'Control: Helpful Neg',
    color: '#22c55e', // green
  },
  control_manipulative_positive: {
    label: 'Control: Manipulative AI pushed user toward truth',
    shortLabel: 'Control: Manip Pos',
    color: '#ef4444', // red
  },
  truthbot_helpful_negative: {
    label: 'Helpful condition: User moved away from truth despite TruthBot',
    shortLabel: 'Helpful + TruthBot Neg',
    color: '#3b82f6', // blue
  },
};
