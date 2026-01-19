import OpenAI from 'openai';
import { ConversationHistory } from './types';

const client = new OpenAI({
  apiKey: process.env.LAMBDA_API_KEY,
  baseURL: 'https://api.lambdalabs.com/v1',
});

// Simple single-turn call (legacy)
export async function callLambdaAPI(
  systemPrompt: string,
  userMessage: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<{ content: string; tokens: number }> {
  const response = await client.chat.completions.create({
    model: process.env.LAMBDA_MODEL || 'qwen3-32b',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
  });

  return {
    content: response.choices[0].message.content || '',
    tokens: response.usage?.total_tokens || 0,
  };
}

// Multi-turn call with conversation history (Issue 6)
export async function callLambdaAPIWithHistory(
  systemPrompt: string,
  userMessage: string,
  history: ConversationHistory[] = [],
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<{ content: string; tokens: number }> {
  // Build messages array with history
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({
      role: h.role as 'user' | 'assistant',
      content: h.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const response = await client.chat.completions.create({
    model: process.env.LAMBDA_MODEL || 'qwen3-32b',
    messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 1024,
  });

  return {
    content: response.choices[0].message.content || '',
    tokens: response.usage?.total_tokens || 0,
  };
}
