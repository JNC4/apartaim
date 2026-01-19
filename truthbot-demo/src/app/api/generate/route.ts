import { NextRequest, NextResponse } from 'next/server';
import { callLambdaAPIWithHistory } from '@/lib/lambda';
import { buildUnknownModelPrompt, buildTruthbotPrompt } from '@/lib/prompts';
import { getTopicById } from '@/lib/topics';
import { Mode, ConversationHistory } from '@/lib/types';

export const maxDuration = 60; // Allow up to 60 seconds for LLM calls

interface GenerateRequest {
  question: string;
  topicId: string;
  mode: Mode;
  turnNumber: number;
  unknownModelHistory?: ConversationHistory[];
  truthbotHistory?: ConversationHistory[];
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const {
      question,
      topicId,
      mode,
      turnNumber = 1,
      unknownModelHistory = [],
      truthbotHistory = [],
    } = body;

    // Validate input
    if (!question || !topicId || !mode) {
      return NextResponse.json(
        { error: 'Missing required fields: question, topicId, mode' },
        { status: 400 }
      );
    }

    const topic = getTopicById(topicId);
    if (!topic) {
      return NextResponse.json(
        { error: `Unknown topic: ${topicId}` },
        { status: 400 }
      );
    }

    // Build prompts
    const unknownPrompt = buildUnknownModelPrompt(mode, topic);
    const truthbotPrompt = buildTruthbotPrompt(topic);

    // Make parallel API calls with conversation history
    const [unknownResult, truthbotResult] = await Promise.all([
      callLambdaAPIWithHistory(unknownPrompt, question, unknownModelHistory),
      callLambdaAPIWithHistory(truthbotPrompt, question, truthbotHistory),
    ]);

    return NextResponse.json({
      unknownModelResponse: unknownResult.content,
      truthbotResponse: truthbotResult.content,
      turnNumber,
      tokensUsed: {
        unknown: unknownResult.tokens,
        truthbot: truthbotResult.tokens,
      },
    });
  } catch (error) {
    console.error('Generate API error:', error);

    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limited. Please wait a moment and try again.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate responses. Please try again.' },
      { status: 500 }
    );
  }
}
