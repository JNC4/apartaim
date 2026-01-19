'use client';

import { useState, useCallback } from 'react';
import { Topic, Mode, AnalysisResult, GenerateResponse, Turn, ConversationHistory } from '@/lib/types';

const MAX_TURNS = 3;

interface DemoState {
  mode: Mode;
  selectedTopic: Topic | null;
  question: string;
  turns: Turn[];
  currentTurn: number;
  // Separate conversation histories for each model (they don't see each other's responses)
  unknownModelHistory: ConversationHistory[];
  truthbotHistory: ConversationHistory[];
  analysis: AnalysisResult | null;
  isLoading: boolean;
  loadingStage: 'idle' | 'generating' | 'analyzing';
  error: string | null;
}

const initialState: DemoState = {
  mode: 'helpful',
  selectedTopic: null,
  question: '',
  turns: [],
  currentTurn: 0,
  unknownModelHistory: [],
  truthbotHistory: [],
  analysis: null,
  isLoading: false,
  loadingStage: 'idle',
  error: null,
};

export function useDemo() {
  const [state, setState] = useState<DemoState>(initialState);

  const setMode = useCallback((mode: Mode) => {
    setState(prev => ({
      ...initialState,
      mode,
    }));
  }, []);

  const setTopic = useCallback((topic: Topic | null) => {
    setState(prev => ({
      ...initialState,
      mode: prev.mode,
      selectedTopic: topic,
      question: topic?.suggestedQuestion || '',
    }));
  }, []);

  const setQuestion = useCallback((question: string) => {
    setState(prev => ({ ...prev, question }));
  }, []);

  const generateResponses = useCallback(async () => {
    if (!state.selectedTopic || !state.question.trim()) {
      setState(prev => ({ ...prev, error: 'Please select a topic and enter a question.' }));
      return;
    }

    const newTurnNumber = state.currentTurn + 1;

    setState(prev => ({
      ...prev,
      isLoading: true,
      loadingStage: 'generating',
      error: null,
    }));

    try {
      // Generate responses
      const genResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: state.question,
          topicId: state.selectedTopic.id,
          mode: state.mode,
          turnNumber: newTurnNumber,
          unknownModelHistory: state.unknownModelHistory,
          truthbotHistory: state.truthbotHistory,
        }),
      });

      if (!genResponse.ok) {
        const error = await genResponse.json();
        throw new Error(error.error || 'Failed to generate responses');
      }

      const genData: GenerateResponse = await genResponse.json();

      // Create the new turn
      const newTurn: Turn = {
        turnNumber: newTurnNumber,
        userMessage: state.question,
        unknownModelResponse: genData.unknownModelResponse,
        truthbotResponse: genData.truthbotResponse,
      };

      // Update conversation histories
      const newUnknownHistory: ConversationHistory[] = [
        ...state.unknownModelHistory,
        { role: 'user', content: state.question },
        { role: 'assistant', content: genData.unknownModelResponse },
      ];
      const newTruthbotHistory: ConversationHistory[] = [
        ...state.truthbotHistory,
        { role: 'user', content: state.question },
        { role: 'assistant', content: genData.truthbotResponse },
      ];

      const newTurns = [...state.turns, newTurn];
      const conversationComplete = newTurnNumber >= MAX_TURNS;

      if (conversationComplete) {
        // Trigger analysis after 3 turns
        setState(prev => ({
          ...prev,
          turns: newTurns,
          currentTurn: newTurnNumber,
          unknownModelHistory: newUnknownHistory,
          truthbotHistory: newTruthbotHistory,
          question: '',
          loadingStage: 'analyzing',
        }));

        // Analyze responses
        const analyzeResponse = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicId: state.selectedTopic.id,
            turns: newTurns,
          }),
        });

        if (!analyzeResponse.ok) {
          const error = await analyzeResponse.json();
          throw new Error(error.error || 'Failed to analyze responses');
        }

        const analysisData: AnalysisResult = await analyzeResponse.json();

        setState(prev => ({
          ...prev,
          analysis: analysisData,
          isLoading: false,
          loadingStage: 'idle',
        }));
      } else {
        // Not complete yet, prepare for next turn
        setState(prev => ({
          ...prev,
          turns: newTurns,
          currentTurn: newTurnNumber,
          unknownModelHistory: newUnknownHistory,
          truthbotHistory: newTruthbotHistory,
          question: '',
          isLoading: false,
          loadingStage: 'idle',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        loadingStage: 'idle',
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  }, [state.selectedTopic, state.question, state.mode, state.currentTurn, state.turns, state.unknownModelHistory, state.truthbotHistory]);

  const reset = useCallback(() => {
    setState(prev => ({
      ...initialState,
      mode: prev.mode,
    }));
  }, []);

  // Computed properties
  const isConversationComplete = state.currentTurn >= MAX_TURNS;
  const canAskFollowup = state.currentTurn > 0 && state.currentTurn < MAX_TURNS && !state.isLoading;

  // Legacy compatibility: get the latest responses for single-response components
  const latestTurn = state.turns[state.turns.length - 1];
  const unknownModelResponse = latestTurn?.unknownModelResponse || null;
  const truthbotResponse = latestTurn?.truthbotResponse || null;

  return {
    ...state,
    // Legacy compatibility
    unknownModelResponse,
    truthbotResponse,
    // Multi-turn specific
    isConversationComplete,
    canAskFollowup,
    maxTurns: MAX_TURNS,
    // Actions
    setMode,
    setTopic,
    setQuestion,
    generateResponses,
    reset,
  };
}
