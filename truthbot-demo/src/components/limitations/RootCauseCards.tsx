'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RootCause } from '@/lib/limitations-types';

interface RootCauseCardsProps {
  causes: RootCause[];
  onExampleClick?: (conversationId: string) => void;
}

const CAUSE_ICONS: Record<string, string> = {
  absolute_nuanced: '/icons/absolute.svg',
  double_negative: '/icons/confusion.svg',
  manipulative_failure: '/icons/shield.svg',
  example_salience: '/icons/example.svg',
};

const CAUSE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  absolute_nuanced: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  double_negative: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  manipulative_failure: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' },
  example_salience: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
};

export function RootCauseCards({ causes, onExampleClick }: RootCauseCardsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {causes.map((cause, index) => {
        const isExpanded = expandedId === cause.id;
        const colors = CAUSE_COLORS[cause.id] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };

        return (
          <motion.div
            key={cause.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`${colors.bg} ${colors.border} border overflow-hidden`}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : cause.id)}
              className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${colors.text}`}>
                    {cause.title}
                  </h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {cause.affectedCount} conversations affected
                  </div>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {cause.description}
                    </p>
                    {onExampleClick && cause.example && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExampleClick(cause.example);
                        }}
                        className="mt-4 text-sm font-medium text-gray-600 hover:text-gray-900 underline"
                      >
                        View example conversation ({cause.example.slice(0, 8)})
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
