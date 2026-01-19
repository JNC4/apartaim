'use client';

import { useState, useEffect } from 'react';
import { Topic, Mode, BeliefLog } from '@/lib/types';

interface BeliefLoggerProps {
  topic: Topic;
  mode: Mode;
  hasResponses: boolean;
  truthbotPresent?: boolean;  // Whether TruthBot response was shown (default: true)
  onBeliefLogged?: (log: BeliefLog) => void;
}

// Generate a simple session ID
function getSessionId(): string {
  const stored = sessionStorage.getItem('truthbot_session_id');
  if (stored) return stored;
  const newId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  sessionStorage.setItem('truthbot_session_id', newId);
  return newId;
}

export function BeliefLogger({ topic, mode, hasResponses, truthbotPresent = true, onBeliefLogged }: BeliefLoggerProps) {
  const [beliefBefore, setBeliefBefore] = useState<number>(50);
  const [beliefAfter, setBeliefAfter] = useState<number>(50);
  const [beforeSubmitted, setBeforeSubmitted] = useState(false);
  const [afterSubmitted, setAfterSubmitted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset when topic or mode changes
  useEffect(() => {
    setBeliefBefore(50);
    setBeliefAfter(50);
    setBeforeSubmitted(false);
    setAfterSubmitted(false);
  }, [topic.id, mode]);

  const handleBeforeSubmit = () => {
    setBeforeSubmitted(true);
  };

  const handleAfterSubmit = async () => {
    const log: BeliefLog = {
      topicId: topic.id,
      mode,
      beliefBefore,
      beliefAfter,
      truthbotPresent,  // Track whether TruthBot response was shown (Issue 8)
      timestamp: new Date().toISOString(),
      sessionId: getSessionId(),
    };

    // Save to local storage for now (could be sent to API)
    const existingLogs = JSON.parse(localStorage.getItem('truthbot_belief_logs') || '[]');
    existingLogs.push(log);
    localStorage.setItem('truthbot_belief_logs', JSON.stringify(existingLogs));

    setAfterSubmitted(true);
    onBeliefLogged?.(log);

    // Also try to send to API (best effort)
    try {
      await fetch('/api/log-belief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(log),
      });
    } catch (e) {
      console.warn('Failed to send belief log to API:', e);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-gray-700">
          Log Your Belief (Optional)
        </span>
        <span className="text-gray-400">{isExpanded ? '-' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <p className="text-xs text-gray-500">
            Help improve this research by logging how your beliefs change.
            Your data is stored locally and optionally sent anonymously.
          </p>

          {/* Before reading */}
          <div className={`p-3 rounded ${beforeSubmitted ? 'bg-green-50' : 'bg-white'}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Before reading the responses:
            </label>
            <p className="text-xs text-gray-500 mb-2">
              How likely do you think "{topic.proposition}" is true? (0 = definitely false, 100 = definitely true)
            </p>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={beliefBefore}
                onChange={(e) => setBeliefBefore(parseInt(e.target.value))}
                disabled={beforeSubmitted}
                className="flex-1"
              />
              <span className="text-sm font-mono w-12 text-center">{beliefBefore}</span>
              <button
                onClick={handleBeforeSubmit}
                disabled={beforeSubmitted}
                className={`px-3 py-1 text-sm rounded ${
                  beforeSubmitted
                    ? 'bg-gray-200 text-gray-500'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {beforeSubmitted ? 'Saved' : 'Lock In'}
              </button>
            </div>
          </div>

          {/* After reading */}
          {hasResponses && beforeSubmitted && (
            <div className={`p-3 rounded ${afterSubmitted ? 'bg-green-50' : 'bg-white'}`}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                After reading the responses:
              </label>
              <p className="text-xs text-gray-500 mb-2">
                How likely do you now think "{topic.proposition}" is true?
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={beliefAfter}
                  onChange={(e) => setBeliefAfter(parseInt(e.target.value))}
                  disabled={afterSubmitted}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-12 text-center">{beliefAfter}</span>
                <button
                  onClick={handleAfterSubmit}
                  disabled={afterSubmitted}
                  className={`px-3 py-1 text-sm rounded ${
                    afterSubmitted
                      ? 'bg-gray-200 text-gray-500'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {afterSubmitted ? 'Logged' : 'Submit'}
                </button>
              </div>
              {afterSubmitted && (
                <p className="mt-2 text-xs text-green-600">
                  Thank you! Your belief change: {beliefBefore} {">"} {beliefAfter} (delta: {beliefAfter - beliefBefore > 0 ? '+' : ''}{beliefAfter - beliefBefore})
                </p>
              )}
            </div>
          )}

          {!beforeSubmitted && (
            <p className="text-xs text-amber-600">
              Lock in your initial belief before reading the AI responses to accurately track how they influence you.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
