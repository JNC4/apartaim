// Types for experiment data from /data/results/

export interface ExperimentTurn {
  turn_number: number;
  user_message: string;
  unknown_model_response: string;
  truthbot_response: string | null;
  user_belief_after: number;
  belief_parse_method?: string;
  unknown_model_response_length: number;
  truthbot_response_length: number;
}

export interface ModelConfig {
  unknown_model: string;
  truthbot_model: string;
  user_model: string;
  guesser_model: string;
}

export type Condition = 'control_helpful' | 'control_manipulative' | 'truthbot_helpful' | 'truthbot_manipulative';
export type Category = 'health' | 'science' | 'policy' | 'history';

export interface Conversation {
  conversation_id: string;
  proposition: string;
  proposition_id: string;
  ground_truth_direction: string;
  condition: Condition;
  truthbot_present: boolean;
  turns: ExperimentTurn[];
  belief_before: number;
  belief_after: number;
  belief_delta: number;
  normalized_belief_delta: number;
  manipulation_guesser_prediction: boolean | null;
  manipulation_guesser_confidence: number | null;
  manipulation_guesser_key_differences?: string | null;
  manipulation_guesser_reasoning?: string | null;
  ground_truth_manipulative: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
  prompt_variant?: number;
  model_config: ModelConfig;
  scenario_name: string;
  task_index: number;
}

// Lightweight index entry for filtering (doesn't include full turn content)
export interface ConversationIndexEntry {
  id: string;
  proposition_id: string;
  proposition: string;
  condition: Condition;
  truthbot_present: boolean;
  belief_before: number;
  belief_after: number;
  belief_delta: number;
  normalized_belief_delta: number;
  manipulation_guesser_prediction: boolean | null;
  manipulation_guesser_confidence: number | null;
  ground_truth_manipulative: boolean;
  scenario_name: string;
  model_config: string; // Simplified model name
  category: Category;
  created_at: string;
}

export interface ConversationIndex {
  conversations: ConversationIndexEntry[];
  total: number;
  scenarios: string[];
  propositions: { id: string; text: string; category: Category }[];
  conditions: Condition[];
  lastUpdated: string;
}

// Pre-computed metrics types
export interface TruthbotMetrics {
  mean_delta_manip_control: number;
  mean_delta_manip_truthbot: number;
  mean_delta_help_control: number;
  mean_delta_help_truthbot: number;
  manipulation_reduction_ratio: number;
  helpfulness_preservation_ratio: number;
  n_manip_control: number;
  n_manip_truthbot: number;
  n_help_control: number;
  n_help_truthbot: number;
}

export interface GuesserMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc_roc: number;
}

export interface StatisticalTest {
  test_name: string;
  statistic: number;
  p_value: number;
  significant_05: boolean;
  significant_01: boolean;
  bonferroni_corrected_p: number;
}

export interface EffectSize {
  cohens_d: number;
  ci_lower: number;
  ci_upper: number;
  interpretation: string;
}

export interface ScenarioMetrics {
  truthbot: TruthbotMetrics;
  guesser: GuesserMetrics;
  tests: {
    manipulation: StatisticalTest;
    helpfulness: StatisticalTest;
  };
  effect_sizes: {
    manipulation: EffectSize;
    helpfulness: EffectSize;
  };
}

export interface PropositionMetrics {
  id: string;
  text: string;
  category: Category;
  n_conversations: number;
  mean_belief_delta_by_condition: Record<Condition, number>;
  guesser_accuracy: number;
}

export interface ConfusionMatrix {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
}

export interface AggregatedMetrics {
  scenarios: Record<string, ScenarioMetrics>;
  propositions: PropositionMetrics[];
  overall: {
    total_conversations: number;
    mean_manipulation_reduction: number;
    mean_helpfulness_preservation: number;
    mean_guesser_accuracy: number;
    mean_guesser_auc: number;
    confusion_matrix: ConfusionMatrix;
  };
  belief_distributions: {
    by_condition: Record<Condition, number[]>;
    by_scenario: Record<string, Record<Condition, number[]>>;
  };
  lastUpdated: string;
}

// Filter state for conversation explorer
export interface ConversationFilters {
  propositions: string[];
  conditions: Condition[];
  scenarios: string[];
  beliefDeltaRange: [number, number];
  guesserPrediction: 'all' | 'manipulative' | 'not_manipulative' | 'no_prediction';
  search: string;
}

export const DEFAULT_FILTERS: ConversationFilters = {
  propositions: [],
  conditions: [],
  scenarios: [],
  beliefDeltaRange: [-100, 100],
  guesserPrediction: 'all',
  search: '',
};

export const CONDITION_LABELS: Record<Condition, string> = {
  control_helpful: 'Control (Helpful)',
  control_manipulative: 'Control (Manipulative)',
  truthbot_helpful: 'TruthBot (Helpful)',
  truthbot_manipulative: 'TruthBot (Manipulative)',
};

export const CONDITION_COLORS: Record<Condition, string> = {
  control_helpful: '#22c55e', // green
  control_manipulative: '#ef4444', // red
  truthbot_helpful: '#3b82f6', // blue
  truthbot_manipulative: '#f59e0b', // amber
};

export const CATEGORY_LABELS: Record<Category, string> = {
  health: 'Health',
  science: 'Science',
  policy: 'Policy',
  history: 'History',
};
