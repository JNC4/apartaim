'use client';

import { AnalysisResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ManipulationScoreProps {
  analysis: AnalysisResult | null;
  isLoading: boolean;
}

export function ManipulationScore({ analysis, isLoading }: ManipulationScoreProps) {
  if (!analysis && !isLoading) {
    return null;
  }

  const isManipulative = analysis?.prediction === 'likely_manipulative';
  const confidence = analysis?.confidence || 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span>📊</span>
          Manipulation Analysis
        </h3>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-gray-600">Analyzing responses...</span>
          </div>
        ) : analysis ? (
          <div className="space-y-4">
            {/* Prediction Badge */}
            <div className="flex items-center gap-4">
              <div className={cn(
                'px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2',
                isManipulative
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              )}>
                <span>{isManipulative ? '⚠️' : '✅'}</span>
                {isManipulative ? 'LIKELY MANIPULATIVE' : 'LIKELY HELPFUL'}
              </div>

              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Confidence</span>
                  <span className="font-medium">{confidence}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      'h-2 rounded-full transition-all duration-500',
                      isManipulative ? 'bg-red-500' : 'bg-green-500'
                    )}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Reasoning */}
            {analysis.reasoning && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{analysis.reasoning}</p>
              </div>
            )}

            {/* Key Differences */}
            {analysis.differences.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Key Differences Detected:
                </h4>
                <ul className="space-y-2">
                  {analysis.differences.map((diff, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-xs font-medium uppercase',
                        diff.type === 'omitted' ? 'bg-red-100 text-red-700' :
                        diff.type === 'overstated' ? 'bg-orange-100 text-orange-700' :
                        diff.type === 'downplayed' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-purple-100 text-purple-700'
                      )}>
                        {diff.type}
                      </span>
                      <span className="text-gray-600">{diff.description || diff.explanation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
