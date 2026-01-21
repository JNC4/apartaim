'use client';

interface ChatMessageProps {
  role: 'user' | 'unknown' | 'truthbot';
  content: string;
  turnNumber?: number;
}

export function ChatMessage({ role, content, turnNumber }: ChatMessageProps) {
  const isUser = role === 'user';
  const isTruthbot = role === 'truthbot';

  // Extract just the response text, removing any <think> blocks
  const cleanContent = content
    .replace(/<think>[\s\S]*?<\/think>/g, '')
    .trim();

  // For user messages, extract just the question if it starts with think tags
  const displayContent = isUser && cleanContent.startsWith('"')
    ? cleanContent.replace(/^"|"$/g, '')
    : cleanContent;

  const roleStyles = {
    user: {
      container: 'justify-end',
      bubble: 'bg-blue-600 text-white rounded-2xl rounded-br-sm',
      label: '',
    },
    unknown: {
      container: 'justify-start',
      bubble: 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm',
      label: 'AI',
    },
    truthbot: {
      container: 'justify-start',
      bubble: 'bg-emerald-50 text-gray-900 border border-emerald-200 rounded-2xl rounded-bl-sm',
      label: 'TruthBot',
    },
  };

  const style = roleStyles[role];

  return (
    <div className={`flex ${style.container} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? '' : 'flex gap-3'}`}>
        {!isUser && (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
              isTruthbot ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
            }`}
          >
            {isTruthbot ? 'TB' : 'AI'}
          </div>
        )}
        <div>
          {!isUser && (
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-semibold ${
                  isTruthbot ? 'text-emerald-600' : 'text-gray-500'
                }`}
              >
                {style.label}
              </span>
              {turnNumber && (
                <span className="text-xs text-gray-400">Turn {turnNumber}</span>
              )}
            </div>
          )}
          <div className={`px-4 py-3 ${style.bubble}`}>
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {displayContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BeliefProgressBarProps {
  beliefs: number[];
  labels?: string[];
}

export function BeliefProgressBar({ beliefs, labels }: BeliefProgressBarProps) {
  const min = 0;
  const max = 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Belief: 0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      <div className="relative h-4 bg-gray-100 overflow-hidden">
        {/* Track markers */}
        <div className="absolute inset-0 flex">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div
              key={mark}
              className="absolute top-0 bottom-0 w-px bg-gray-300"
              style={{ left: `${mark}%` }}
            />
          ))}
        </div>

        {/* Belief points */}
        {beliefs.map((belief, i) => (
          <div
            key={i}
            className={`absolute top-0 bottom-0 w-3 h-3 border-2 border-white shadow transform -translate-x-1/2 transition-all duration-300 ${
              i === 0
                ? 'bg-gray-400'
                : i === beliefs.length - 1
                ? belief > beliefs[0]
                  ? 'bg-emerald-500'
                  : 'bg-red-500'
                : 'bg-blue-400'
            }`}
            style={{ left: `${belief}%`, top: '2px' }}
            title={`${labels?.[i] || `Turn ${i}`}: ${belief}%`}
          />
        ))}

        {/* Connecting line */}
        {beliefs.length > 1 && (
          <div
            className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-gray-300"
            style={{
              left: `${Math.min(...beliefs)}%`,
              width: `${Math.max(...beliefs) - Math.min(...beliefs)}%`,
            }}
          />
        )}
      </div>
      <div className="flex justify-between text-xs">
        {beliefs.map((belief, i) => (
          <span
            key={i}
            className={`font-medium ${
              i === 0
                ? 'text-gray-500'
                : i === beliefs.length - 1
                ? belief > beliefs[0]
                  ? 'text-emerald-600'
                  : 'text-red-600'
                : 'text-blue-500'
            }`}
          >
            {labels?.[i] || (i === 0 ? 'Start' : i === beliefs.length - 1 ? 'End' : `T${i}`)}:{' '}
            {belief}%
          </span>
        ))}
      </div>
    </div>
  );
}

interface GuesserVerdictProps {
  prediction: boolean | null;
  confidence: number | null;
  groundTruth: boolean;
}

export function GuesserVerdict({ prediction, confidence, groundTruth }: GuesserVerdictProps) {
  if (prediction === null) {
    return (
      <div className="text-sm text-gray-500 italic">
        No guesser prediction available
      </div>
    );
  }

  const isCorrect = prediction === groundTruth;

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 text-sm font-medium ${
              prediction
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            <span
              className={`w-2 h-2 ${
                prediction ? 'bg-red-500' : 'bg-green-500'
              }`}
            />
            {prediction ? 'Predicted Manipulative' : 'Predicted Helpful'}
          </span>
          {confidence !== null && (
            <span className="text-sm text-gray-500">
              ({confidence.toFixed(0)}% confidence)
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Ground truth:{' '}
          <span className={groundTruth ? 'text-red-600' : 'text-green-600'}>
            {groundTruth ? 'Manipulative' : 'Helpful'}
          </span>
          {' • '}
          <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
            {isCorrect ? '✓ Correct' : '✗ Incorrect'}
          </span>
        </div>
      </div>
    </div>
  );
}
