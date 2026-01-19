import { Topic, Mode } from './types';

// Import shared prompts from the common source
// This ensures demo prompts match experiment prompts exactly
import sharedPrompts from '../../../shared/prompts.json';

export function buildUnknownModelPrompt(mode: Mode, topic: Topic): string {
  if (mode === 'helpful') {
    // Use first helpful prompt variant
    const template = sharedPrompts.helpful_prompts[0];
    return template.replace('{topic}', topic.topic);
  } else {
    // For manipulative mode, argue AGAINST the evidence-supported position
    const targetDirection = topic.groundTruthDirection === 'positive' ? 'against' : 'in favor of';
    const position = topic.groundTruthDirection === 'positive'
      ? `the opposite of: ${topic.proposition}`
      : topic.proposition;

    // Use first manipulative prompt variant
    const template = sharedPrompts.manipulative_prompts[0];
    return template
      .replace('{topic}', topic.topic)
      .replace('{position}', position);
  }
}

export function buildTruthbotPrompt(topic: Topic): string {
  return sharedPrompts.truthbot_prompt.replace('{topic}', topic.topic);
}

// Legacy single-turn analysis prompt (deprecated)
export function buildAnalysisPrompt(
  question: string,
  topic: Topic,
  unknownResponse: string,
  truthbotResponse: string
): string {
  // Format as single-turn transcript
  const unknownTranscript = `[Turn 1]\nUser: ${question}\nAssistant: ${unknownResponse}`;
  const truthbotTranscript = `[Turn 1]\nUser: ${question}\nAssistant: ${truthbotResponse}`;

  return sharedPrompts.guesser_analysis_prompt
    .replace('{topic}', topic.topic)
    .replace('{proposition}', topic.proposition)
    .replace('{unknown_transcript}', unknownTranscript)
    .replace('{truthbot_transcript}', truthbotTranscript);
}

// Multi-turn analysis prompt (Issue 6)
export function buildMultiTurnAnalysisPrompt(
  topic: Topic,
  turns: { turnNumber: number; userMessage: string; unknownModelResponse: string; truthbotResponse: string }[]
): string {
  // Format transcripts with user messages included
  const unknownTranscript = turns.map(t =>
    `[Turn ${t.turnNumber}]\nUser: ${t.userMessage}\nAssistant: ${t.unknownModelResponse}`
  ).join('\n\n');

  const truthbotTranscript = turns.map(t =>
    `[Turn ${t.turnNumber}]\nUser: ${t.userMessage}\nAssistant: ${t.truthbotResponse}`
  ).join('\n\n');

  return sharedPrompts.guesser_analysis_prompt
    .replace('{topic}', topic.topic)
    .replace('{proposition}', topic.proposition)
    .replace('{unknown_transcript}', unknownTranscript)
    .replace('{truthbot_transcript}', truthbotTranscript);
}

export const GUESSER_SYSTEM_PROMPT = sharedPrompts.guesser_system_prompt;
