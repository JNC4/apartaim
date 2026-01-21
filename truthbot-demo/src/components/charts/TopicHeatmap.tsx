'use client';

import { useMemo } from 'react';
import type { Condition, Category, PropositionMetrics } from '@/lib/experiment-types';
import { CONDITION_LABELS, CATEGORY_LABELS } from '@/lib/experiment-types';

interface TopicHeatmapProps {
  propositions: PropositionMetrics[];
  selectedCondition?: Condition;
}

function getColor(value: number): string {
  // Diverging color scale: red for negative, green for positive
  if (value < -30) return '#dc2626';
  if (value < -15) return '#f87171';
  if (value < 0) return '#fca5a5';
  if (value < 15) return '#86efac';
  if (value < 30) return '#22c55e';
  return '#16a34a';
}

export function TopicHeatmap({ propositions, selectedCondition }: TopicHeatmapProps) {
  const conditions: Condition[] = selectedCondition
    ? [selectedCondition]
    : ['control_helpful', 'truthbot_helpful', 'control_manipulative', 'truthbot_manipulative'];

  const groupedByCategory = useMemo(() => {
    const groups: Record<Category, PropositionMetrics[]> = {
      health: [],
      science: [],
      policy: [],
      history: [],
    };

    for (const prop of propositions) {
      if (groups[prop.category as Category]) {
        groups[prop.category as Category].push(prop);
      }
    }

    return groups;
  }, [propositions]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2 font-semibold text-gray-700">Topic</th>
            {conditions.map((cond) => (
              <th key={cond} className="text-center p-2 font-semibold text-gray-700 min-w-[100px]">
                {CONDITION_LABELS[cond].split(' ')[0]}
                <br />
                <span className="text-xs font-normal text-gray-500">
                  ({CONDITION_LABELS[cond].split('(')[1]}
                </span>
              </th>
            ))}
            <th className="text-center p-2 font-semibold text-gray-700">n</th>
          </tr>
        </thead>
        <tbody>
          {(Object.entries(groupedByCategory) as [Category, PropositionMetrics[]][]).map(([category, props]) => (
            props.length > 0 && (
              <>
                <tr key={category} className="bg-gray-50">
                  <td colSpan={conditions.length + 2} className="p-2 font-semibold text-gray-600">
                    {CATEGORY_LABELS[category]}
                  </td>
                </tr>
                {props.map((prop) => (
                  <tr key={prop.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-2 text-gray-900 max-w-[250px] truncate" title={prop.text}>
                      {prop.text}
                    </td>
                    {conditions.map((cond) => {
                      const value = prop.mean_belief_delta_by_condition[cond];
                      return (
                        <td
                          key={cond}
                          className="text-center p-2 font-mono"
                          style={{
                            backgroundColor: value !== undefined ? getColor(value) : '#f3f4f6',
                            color: Math.abs(value || 0) > 15 ? 'white' : 'black',
                          }}
                        >
                          {value !== undefined ? value.toFixed(1) : '-'}
                        </td>
                      );
                    })}
                    <td className="text-center p-2 text-gray-600">{prop.n_conversations}</td>
                  </tr>
                ))}
              </>
            )
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-600">
        <span>Belief Shift (normalized):</span>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-600" />
          <div className="w-4 h-4 bg-red-400" />
          <div className="w-4 h-4 bg-red-300" />
          <div className="w-4 h-4 bg-green-300" />
          <div className="w-4 h-4 bg-green-500" />
          <div className="w-4 h-4 bg-green-600" />
        </div>
        <span className="text-red-600">-30 (away from truth)</span>
        <span>to</span>
        <span className="text-green-600">+30 (toward truth)</span>
      </div>
    </div>
  );
}
