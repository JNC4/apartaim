'use client';

import { motion } from 'framer-motion';
import type { FutureResearchItem } from '@/lib/limitations-types';

interface FutureResearchCardsProps {
  items: FutureResearchItem[];
}

const PRIORITY_STYLES: Record<string, { bg: string; badge: string; badgeText: string }> = {
  high: {
    bg: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
  },
  medium: {
    bg: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100',
    badgeText: 'text-blue-700',
  },
  low: {
    bg: 'bg-gray-50 border-gray-200',
    badge: 'bg-gray-100',
    badgeText: 'text-gray-700',
  },
};

export function FutureResearchCards({ items }: FutureResearchCardsProps) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {items.map((item, index) => {
        const styles = PRIORITY_STYLES[item.priority] || PRIORITY_STYLES.low;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 border ${styles.bg}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-medium px-2 py-1 ${styles.badge} ${styles.badgeText}`}>
                {item.priority.toUpperCase()} PRIORITY
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {item.title}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
