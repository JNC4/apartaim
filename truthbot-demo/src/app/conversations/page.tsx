'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { FilterPanel } from '@/components/conversations/FilterPanel';
import { ConversationCard, ConversationCardSkeleton } from '@/components/conversations/ConversationCard';
import { ConversationModal } from '@/components/conversations/ConversationModal';
import type { ConversationIndex, ConversationIndexEntry, ConversationFilters } from '@/lib/experiment-types';
import { DEFAULT_FILTERS } from '@/lib/experiment-types';

export default function ConversationsPage() {
  const [index, setIndex] = useState<ConversationIndex | null>(null);
  const [filters, setFilters] = useState<ConversationFilters>(DEFAULT_FILTERS);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);

  // Load index on mount
  useEffect(() => {
    fetch('/data/conversations-index.json')
      .then((res) => res.json())
      .then((data: ConversationIndex) => {
        setIndex(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load conversation index:', err);
        setLoading(false);
      });
  }, []);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!index) return [];

    return index.conversations.filter((conv) => {
      // Search filter
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!conv.proposition.toLowerCase().includes(search)) {
          return false;
        }
      }

      // Proposition filter
      if (filters.propositions.length > 0 && !filters.propositions.includes(conv.proposition_id)) {
        return false;
      }

      // Condition filter
      if (filters.conditions.length > 0 && !filters.conditions.includes(conv.condition)) {
        return false;
      }

      // Scenario filter
      if (filters.scenarios.length > 0 && !filters.scenarios.includes(conv.scenario_name)) {
        return false;
      }

      // Guesser prediction filter
      if (filters.guesserPrediction !== 'all') {
        if (filters.guesserPrediction === 'manipulative' && conv.manipulation_guesser_prediction !== true) {
          return false;
        }
        if (filters.guesserPrediction === 'not_manipulative' && conv.manipulation_guesser_prediction !== false) {
          return false;
        }
        if (filters.guesserPrediction === 'no_prediction' && conv.manipulation_guesser_prediction !== null) {
          return false;
        }
      }

      // Belief delta range filter
      if (
        conv.belief_delta < filters.beliefDeltaRange[0] ||
        conv.belief_delta > filters.beliefDeltaRange[1]
      ) {
        return false;
      }

      return true;
    });
  }, [index, filters]);

  // Virtual list
  const virtualizer = useVirtualizer({
    count: filteredConversations.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 140,
    overscan: 10,
  });

  const handleConversationClick = useCallback((id: string) => {
    setSelectedConversationId(id);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 w-64 animate-pulse" />
            <div className="h-4 bg-gray-200 w-48 mt-2 animate-pulse" />
          </div>
          <div className="grid gap-4">
            {[...Array(6)].map((_, i) => (
              <ConversationCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!index) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Failed to load conversation data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Conversation Explorer</h1>
          <p className="text-gray-600 mt-1">
            Browse {index.total.toLocaleString()} experiment conversations
          </p>
        </div>

        <div className="grid lg:grid-cols-[320px,1fr] gap-6">
          {/* Sidebar - Filters */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <FilterPanel
              index={index}
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={filteredConversations.length}
            />
          </div>

          {/* Main content - Conversation list */}
          <div>
            {filteredConversations.length === 0 ? (
              <div className="bg-white border p-12 text-center">
                <p className="text-gray-500">No conversations match your filters</p>
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div
                ref={parentRef}
                className="h-[calc(100vh-200px)] overflow-auto"
              >
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {virtualizer.getVirtualItems().map((virtualItem) => {
                    const conversation = filteredConversations[virtualItem.index];
                    return (
                      <div
                        key={virtualItem.key}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                          padding: '4px 0',
                        }}
                      >
                        <ConversationCard
                          conversation={conversation}
                          onClick={() => handleConversationClick(conversation.id)}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conversation Modal */}
      <ConversationModal
        conversationId={selectedConversationId}
        onClose={() => setSelectedConversationId(null)}
      />
    </div>
  );
}
