'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ConversationIndexEntry, Condition } from '@/lib/experiment-types';
import { CONDITION_LABELS, CONDITION_COLORS } from '@/lib/experiment-types';
import { getGroundTruthInfo, parseGroundTruthDirection } from '@/lib/ground-truth';

interface ConversationModalProps {
  conversation: ConversationIndexEntry | null;
  onClose: () => void;
}

export function ConversationModal({ conversation, onClose }: ConversationModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!conversation) return null;

  const groundTruthInfo = getGroundTruthInfo(conversation.proposition_id);
  const beliefDelta = conversation.belief_after - conversation.belief_before;
  const isCorrectPrediction =
    conversation.manipulation_guesser_prediction === conversation.ground_truth_manipulative;

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
          className="relative bg-white shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b bg-gray-50">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-lg font-semibold text-gray-900">
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
                  {conversation.id.slice(0, 8)}
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

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Ground Truth */}
            {groundTruthInfo && (
              <div className={`p-3 text-sm border ${groundTruthInfo.isTrue ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${groundTruthInfo.isTrue ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Ground Truth: {groundTruthInfo.isTrue ? 'TRUE' : 'FALSE'}
                  </span>
                </div>
                <p className="mt-1 text-gray-600 text-xs">
                  {groundTruthInfo.explanation}
                </p>
              </div>
            )}

            {/* Belief Shift */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Belief Shift</h3>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">{conversation.belief_before}</div>
                  <div className="text-xs text-gray-500">Before</div>
                </div>
                <div className="flex-1 relative h-6 bg-gray-100">
                  {/* Midpoint marker */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gray-300" />
                  {/* Before marker */}
                  <div
                    className="absolute top-1 w-3 h-3 bg-gray-400 -translate-x-1/2"
                    style={{ left: `${conversation.belief_before}%` }}
                  />
                  {/* After marker */}
                  <div
                    className={`absolute top-1 w-3 h-3 -translate-x-1/2 ${
                      conversation.normalized_belief_delta > 0 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                    style={{ left: `${conversation.belief_after}%` }}
                  />
                  {/* Connecting line */}
                  <div
                    className={`absolute top-[10px] h-0.5 ${
                      conversation.normalized_belief_delta > 0 ? 'bg-emerald-300' : 'bg-red-300'
                    }`}
                    style={{
                      left: `${Math.min(conversation.belief_before, conversation.belief_after)}%`,
                      width: `${Math.abs(beliefDelta)}%`,
                    }}
                  />
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${
                    conversation.normalized_belief_delta > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {conversation.belief_after}
                  </div>
                  <div className="text-xs text-gray-500">After</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Raw delta: </span>
                  <span className={`font-semibold ${
                    beliefDelta > 0 ? 'text-emerald-600' : beliefDelta < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {beliefDelta > 0 ? '+' : ''}{beliefDelta}
                  </span>
                </div>
                <div className={`px-3 py-1 font-semibold ${
                  conversation.normalized_belief_delta > 0
                    ? 'bg-emerald-100 text-emerald-700'
                    : conversation.normalized_belief_delta < 0
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  Normalized: {conversation.normalized_belief_delta > 0 ? '+' : ''}
                  {conversation.normalized_belief_delta}
                </div>
              </div>
            </div>

            {/* Guesser Prediction */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Manipulation Detection</h3>
              {conversation.manipulation_guesser_prediction !== null ? (
                <div className="p-3 bg-gray-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-1 text-sm font-medium ${
                        conversation.manipulation_guesser_prediction
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 ${
                          conversation.manipulation_guesser_prediction ? 'bg-red-500' : 'bg-green-500'
                        }`}
                      />
                      {conversation.manipulation_guesser_prediction ? 'Predicted Manipulative' : 'Predicted Helpful'}
                    </span>
                    {conversation.manipulation_guesser_confidence !== null && (
                      <span className="text-sm text-gray-500">
                        ({conversation.manipulation_guesser_confidence.toFixed(0)}% confidence)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Ground truth:{' '}
                    <span className={conversation.ground_truth_manipulative ? 'text-red-600' : 'text-green-600'}>
                      {conversation.ground_truth_manipulative ? 'Manipulative' : 'Helpful'}
                    </span>
                    {' \u2022 '}
                    <span className={isCorrectPrediction ? 'text-green-600' : 'text-red-600'}>
                      {isCorrectPrediction ? '\u2713 Correct' : '\u2717 Incorrect'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No guesser prediction available (control condition)
                </p>
              )}
            </div>

            {/* Metadata */}
            <div className="pt-3 border-t">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-gray-500 text-xs">Category</dt>
                  <dd className="font-medium text-gray-900 capitalize">{conversation.category}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Model Config</dt>
                  <dd className="font-medium text-gray-900">{conversation.model_config}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">TruthBot Present</dt>
                  <dd className="font-medium text-gray-900">{conversation.truthbot_present ? 'Yes' : 'No'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Condition</dt>
                  <dd className="font-medium text-gray-900">{CONDITION_LABELS[conversation.condition]}</dd>
                </div>
              </dl>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
