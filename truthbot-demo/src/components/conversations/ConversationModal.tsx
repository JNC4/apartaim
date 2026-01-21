'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatMessage, BeliefProgressBar, GuesserVerdict } from './ChatMessage';
import type { Conversation, Condition } from '@/lib/experiment-types';
import { CONDITION_LABELS, CONDITION_COLORS } from '@/lib/experiment-types';

interface ConversationModalProps {
  conversationId: string | null;
  onClose: () => void;
}

export function ConversationModal({ conversationId, onClose }: ConversationModalProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setConversation(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/conversations/${conversationId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Conversation not found');
        return res.json();
      })
      .then(setConversation)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [conversationId]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!conversationId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="animate-spin h-8 w-8 border-b-2 border-emerald-600" />
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={onClose}
                className="mt-4 text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          ) : conversation ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between p-4 border-b bg-gray-50">
                <div className="flex-1 min-w-0 pr-4">
                  <h2 className="text-lg font-semibold text-gray-900 truncate">
                    {conversation.proposition}
                  </h2>
                  <div className="flex flex-wrap items-center gap-1 mt-2 text-xs text-gray-500">
                    <span style={{ color: CONDITION_COLORS[conversation.condition] }}>
                      {CONDITION_LABELS[conversation.condition]}
                    </span>
                    <span>/</span>
                    <span>{conversation.scenario_name}</span>
                    <span>/</span>
                    <span className="text-gray-400">
                      {conversation.conversation_id.slice(0, 8)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {conversation.turns.map((turn, i) => (
                  <div key={i} className="space-y-2">
                    {/* User message */}
                    <ChatMessage
                      role="user"
                      content={turn.user_message}
                      turnNumber={turn.turn_number}
                    />

                    {/* Unknown model response */}
                    <ChatMessage
                      role="unknown"
                      content={turn.unknown_model_response}
                      turnNumber={turn.turn_number}
                    />

                    {/* TruthBot response (if present) */}
                    {turn.truthbot_response && (
                      <ChatMessage
                        role="truthbot"
                        content={turn.truthbot_response}
                        turnNumber={turn.turn_number}
                      />
                    )}

                    {/* Turn divider */}
                    {i < conversation.turns.length - 1 && (
                      <div className="flex items-center gap-2 py-2">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400">
                          Belief after turn {turn.turn_number}: {turn.user_belief_after}%
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t p-4 bg-gray-50 space-y-4">
                {/* Belief Progress */}
                <BeliefProgressBar
                  beliefs={[
                    conversation.belief_before,
                    ...conversation.turns.map((t) => t.user_belief_after),
                  ]}
                  labels={[
                    'Start',
                    ...conversation.turns.map((t) => `T${t.turn_number}`),
                  ]}
                />

                {/* Guesser Verdict */}
                <GuesserVerdict
                  prediction={conversation.manipulation_guesser_prediction}
                  confidence={conversation.manipulation_guesser_confidence}
                  groundTruth={conversation.ground_truth_manipulative}
                />
              </div>
            </>
          ) : null}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
