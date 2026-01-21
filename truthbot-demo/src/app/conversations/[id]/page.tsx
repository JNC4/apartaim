'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChatMessage, BeliefProgressBar, GuesserVerdict } from '@/components/conversations/ChatMessage';
import type { Conversation, Condition } from '@/lib/experiment-types';
import { CONDITION_LABELS, CONDITION_COLORS } from '@/lib/experiment-types';

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.id as string;
    if (!id) return;

    fetch(`/api/conversations/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Conversation not found');
        return res.json();
      })
      .then(setConversation)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-emerald-600" />
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error || 'Conversation not found'}</p>
        <Link
          href="/conversations"
          className="text-emerald-600 hover:text-emerald-700 font-medium"
        >
          ← Back to conversations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/conversations"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to conversations
          </Link>
        </div>

        {/* Header */}
        <div className="bg-white shadow-sm border p-6 mb-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-3">
            {conversation.proposition}
          </h1>
          <div className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
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

        {/* Chat Content */}
        <div className="bg-white shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h2>
          <div className="space-y-2">
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
                  <div className="flex items-center gap-2 py-4">
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
        </div>

        {/* Results Panel */}
        <div className="bg-white shadow-sm border p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Belief Progression</h2>
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
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Manipulation Detection</h2>
            <GuesserVerdict
              prediction={conversation.manipulation_guesser_prediction}
              confidence={conversation.manipulation_guesser_confidence}
              groundTruth={conversation.ground_truth_manipulative}
            />
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t">
            <h2 className="text-sm font-semibold text-gray-500 mb-3">Metadata</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <dt className="text-gray-500" title="Positive = toward truth, regardless of belief direction">
                  Normalized Belief Shift
                </dt>
                <dd className={`font-semibold ${
                  conversation.normalized_belief_delta > 0 ? 'text-emerald-600' :
                  conversation.normalized_belief_delta < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {conversation.normalized_belief_delta > 0 ? '+' : ''}{conversation.normalized_belief_delta}
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    ({conversation.belief_delta > 0 ? '+' : ''}{conversation.belief_delta} raw)
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Ground Truth</dt>
                <dd className={`font-semibold ${
                  conversation.ground_truth_manipulative ? 'text-red-600' : 'text-green-600'
                }`}>
                  {conversation.ground_truth_manipulative ? 'Manipulative' : 'Helpful'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">TruthBot Present</dt>
                <dd className="font-semibold text-gray-900">
                  {conversation.truthbot_present ? 'Yes' : 'No'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Model</dt>
                <dd className="font-semibold text-gray-900">
                  {conversation.model_config?.unknown_model || 'Unknown'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
