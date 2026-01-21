'use client';

import type { ConversationIndexEntry, Condition } from '@/lib/experiment-types';
import { CONDITION_LABELS, CONDITION_COLORS } from '@/lib/experiment-types';

interface ConversationCardProps {
  conversation: ConversationIndexEntry;
  onClick: () => void;
}

export function ConversationCard({ conversation, onClick }: ConversationCardProps) {
  const isManipulative = conversation.condition.includes('manipulative');
  const hasTruthbot = conversation.truthbot_present;

  const formatDelta = (delta: number) => {
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta}`;
  };

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border hover:border-emerald-300 hover:shadow-md transition-all p-4 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate group-hover:text-emerald-700">
            {conversation.proposition}
          </p>
          <div className="flex flex-wrap items-center gap-1 mt-2 text-xs text-gray-500">
            <span
              style={{ color: CONDITION_COLORS[conversation.condition as Condition] }}
            >
              {CONDITION_LABELS[conversation.condition as Condition]}
            </span>
            <span>/</span>
            <span>{conversation.scenario_name}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div
            className={`text-lg font-bold ${
              conversation.normalized_belief_delta > 0
                ? 'text-emerald-600'
                : conversation.normalized_belief_delta < 0
                ? 'text-red-600'
                : 'text-gray-500'
            }`}
          >
            {formatDelta(conversation.normalized_belief_delta)}
          </div>
          <div className="text-xs text-gray-500">
            {conversation.belief_before} → {conversation.belief_after}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3">
          {conversation.manipulation_guesser_prediction !== null && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium ${
                conversation.manipulation_guesser_prediction
                  ? 'text-red-600'
                  : 'text-green-600'
              }`}
            >
              <span
                className={`w-2 h-2 ${
                  conversation.manipulation_guesser_prediction ? 'bg-red-500' : 'bg-green-500'
                }`}
              />
              {conversation.manipulation_guesser_prediction ? 'Predicted Manip.' : 'Predicted OK'}
            </span>
          )}
          {conversation.manipulation_guesser_confidence !== null && (
            <span className="text-xs text-gray-400">
              {conversation.manipulation_guesser_confidence.toFixed(0)}% conf.
            </span>
          )}
        </div>
        <span className="text-xs text-gray-400 group-hover:text-emerald-600">
          View →
        </span>
      </div>
    </button>
  );
}

export function ConversationCardSkeleton() {
  return (
    <div className="bg-white border p-4 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 w-3/4" />
          <div className="flex gap-2 mt-2">
            <div className="h-5 bg-gray-200 w-24" />
            <div className="h-5 bg-gray-200 w-20" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="h-6 bg-gray-200 w-12" />
          <div className="h-3 bg-gray-200 w-16" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="h-4 bg-gray-200 w-32" />
        <div className="h-4 bg-gray-200 w-12" />
      </div>
    </div>
  );
}
