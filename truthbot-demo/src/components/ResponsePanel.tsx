'use client';

import { cn } from '@/lib/utils';
import { Turn } from '@/lib/types';

interface ResponsePanelProps {
  title: string;
  icon: string;
  turns: Turn[];
  responseKey: 'unknownModelResponse' | 'truthbotResponse';
  isLoading: boolean;
  variant: 'unknown' | 'truthbot';
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 bg-gray-200 w-3/4"></div>
      <div className="h-4 bg-gray-200 w-full"></div>
      <div className="h-4 bg-gray-200 w-5/6"></div>
      <div className="h-4 bg-gray-200 w-2/3"></div>
      <div className="h-4 bg-gray-200 w-full"></div>
      <div className="h-4 bg-gray-200 w-4/5"></div>
    </div>
  );
}

export function ResponsePanel({
  title,
  icon,
  turns,
  responseKey,
  isLoading,
  variant,
}: ResponsePanelProps) {
  const borderColor = variant === 'truthbot' ? 'border-green-200' : 'border-gray-200';
  const headerBg = variant === 'truthbot' ? 'bg-green-50' : 'bg-gray-50';
  const headerText = variant === 'truthbot' ? 'text-green-800' : 'text-gray-800';
  const turnBg = variant === 'truthbot' ? 'bg-green-50/50' : 'bg-gray-50/50';
  const userBg = 'bg-blue-50';

  const hasResponses = turns.length > 0;

  return (
    <div className={cn(
      'flex flex-col border overflow-hidden h-full',
      borderColor
    )}>
      <div className={cn(
        'px-4 py-3 border-b flex items-center gap-2',
        headerBg,
        borderColor
      )}>
        <span className="text-xl">{icon}</span>
        <h3 className={cn('font-semibold', headerText)}>{title}</h3>
        {hasResponses && (
          <span className="ml-auto text-xs text-gray-500">
            {turns.length} turn{turns.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto response-panel max-h-[600px] bg-white space-y-4">
        {hasResponses ? (
          <>
            {turns.map((turn) => (
              <div key={turn.turnNumber} className="space-y-2">
                {/* Turn header */}
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span className="px-2 py-0.5 bg-gray-100">Turn {turn.turnNumber}</span>
                </div>

                {/* User's question */}
                <div className={cn('p-3 text-sm', userBg)}>
                  <div className="text-xs text-blue-600 font-medium mb-1">User:</div>
                  <div className="text-gray-700">{turn.userMessage}</div>
                </div>

                {/* Model's response */}
                <div className={cn('p-3 text-sm', turnBg)}>
                  <div className={cn('text-xs font-medium mb-1', headerText)}>
                    {variant === 'truthbot' ? 'TruthBot:' : 'Unknown Model:'}
                  </div>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                    {turn[responseKey]}
                  </div>
                </div>

                {/* Separator between turns */}
                {turn.turnNumber < turns.length && (
                  <div className="border-t border-dashed border-gray-200 my-2" />
                )}
              </div>
            ))}

            {/* Loading indicator for next turn */}
            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span className="px-2 py-0.5 bg-gray-100 animate-pulse">
                    Turn {turns.length + 1}
                  </span>
                </div>
                <div className={cn('p-3', turnBg)}>
                  <LoadingSkeleton />
                </div>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <span className="px-2 py-0.5 bg-gray-100 animate-pulse">Turn 1</span>
            </div>
            <LoadingSkeleton />
          </div>
        ) : (
          <p className="text-gray-400 italic">
            Response will appear here...
          </p>
        )}
      </div>
    </div>
  );
}
