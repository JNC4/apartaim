export interface Topic {
  id: string;
  proposition: string;
  topic: string;
  category: 'health' | 'science' | 'policy' | 'history';
  groundTruthDirection: 'positive' | 'negative';
  suggestedQuestion: string;
}

export interface Difference {
  type: 'omitted' | 'overstated' | 'downplayed' | 'framing';
  description: string;
  unknownModelQuote: string;
  truthbotQuote: string;
  explanation: string;
}

export interface AnalysisResult {
  prediction: 'likely_manipulative' | 'likely_helpful';
  confidence: number;
  reasoning: string;
  differences: Difference[];
}

export interface GenerateResponse {
  unknownModelResponse: string;
  truthbotResponse: string;
  turnNumber: number;
}

// Multi-turn conversation support (Issue 6)
export interface Turn {
  turnNumber: number;
  userMessage: string;
  unknownModelResponse: string;
  truthbotResponse: string;
}

export interface ConversationHistory {
  role: 'user' | 'assistant';
  content: string;
}

export type Mode = 'helpful' | 'manipulative';

// Human belief logging (Issue 5)
export interface BeliefLog {
  topicId: string;
  mode: Mode;
  beliefBefore: number;
  beliefAfter: number;
  truthbotPresent: boolean;  // Whether TruthBot response was shown (Issue 8)
  timestamp: string;
  sessionId: string;
}
