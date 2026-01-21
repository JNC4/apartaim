'use client';

import { useState } from 'react';
import type { ConversationFilters, Condition, ConversationIndex } from '@/lib/experiment-types';
import { CONDITION_LABELS } from '@/lib/experiment-types';

interface FilterPanelProps {
  index: ConversationIndex;
  filters: ConversationFilters;
  onFiltersChange: (filters: ConversationFilters) => void;
  resultCount: number;
}

export function FilterPanel({ index, filters, onFiltersChange, resultCount }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateFilter = <K extends keyof ConversationFilters>(
    key: K,
    value: ConversationFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof ConversationFilters>(
    key: K,
    value: string
  ) => {
    const current = filters[key] as string[];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  const clearFilters = () => {
    onFiltersChange({
      propositions: [],
      conditions: [],
      scenarios: [],
      beliefDeltaRange: [-100, 100],
      guesserPrediction: 'all',
      search: '',
    });
  };

  const hasActiveFilters =
    filters.propositions.length > 0 ||
    filters.conditions.length > 0 ||
    filters.scenarios.length > 0 ||
    filters.guesserPrediction !== 'all' ||
    filters.search !== '';

  return (
    <div className="bg-white shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <h3 className="font-semibold text-gray-900">Filters</h3>
          <span className="text-sm text-gray-500">
            {resultCount.toLocaleString()} conversations
          </span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search propositions..."
              className="w-full px-3 py-2 border text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
            <div className="flex flex-wrap gap-2">
              {(index.conditions as Condition[]).map((condition) => (
                <button
                  key={condition}
                  onClick={() => toggleArrayFilter('conditions', condition)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    filters.conditions.includes(condition)
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {CONDITION_LABELS[condition]}
                </button>
              ))}
            </div>
          </div>

          {/* Scenarios */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model Config</label>
            <div className="flex flex-wrap gap-2">
              {index.scenarios.map((scenario) => (
                <button
                  key={scenario}
                  onClick={() => toggleArrayFilter('scenarios', scenario)}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    filters.scenarios.includes(scenario)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {scenario}
                </button>
              ))}
            </div>
          </div>

          {/* Guesser Prediction */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Guesser Prediction</label>
            <select
              value={filters.guesserPrediction}
              onChange={(e) => updateFilter('guesserPrediction', e.target.value as any)}
              className="w-full px-3 py-2 border text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All</option>
              <option value="manipulative">Predicted Manipulative</option>
              <option value="not_manipulative">Predicted Not Manipulative</option>
              <option value="no_prediction">No Prediction</option>
            </select>
          </div>

          {/* Propositions - Collapsed by default */}
          <details className="group">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2 list-none flex items-center gap-2">
              <svg className="w-4 h-4 transform group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Propositions ({filters.propositions.length} selected)
            </summary>
            <div className="mt-2 max-h-48 overflow-y-auto space-y-1 pl-6">
              {index.propositions.map((prop) => (
                <label key={prop.id} className="flex items-start gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1">
                  <input
                    type="checkbox"
                    checked={filters.propositions.includes(prop.id)}
                    onChange={() => toggleArrayFilter('propositions', prop.id)}
                    className="mt-0.5 border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-gray-700">{prop.text}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
