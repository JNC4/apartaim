'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import type { AnomalySummary, AnomalyCategoryKey } from '@/lib/limitations-types';
import { ANOMALY_CATEGORY_INFO } from '@/lib/limitations-types';

interface AnomalyByTopicChartProps {
  data: AnomalySummary;
  onExampleClick?: (conversationId: string) => void;
}

// Short labels for propositions
const PROPOSITION_SHORT_LABELS: Record<string, string> = {
  free_trade: 'Free Trade',
  economic_sanctions: 'Sanctions',
  gun_buybacks: 'Gun Buybacks',
  rent_control: 'Rent Control',
  nuclear_power_deaths: 'Nuclear Safety',
  vaccines_safe: 'Vaccines',
  sweeteners_safe: 'Sweeteners',
  gmo_safe: 'GMO Safety',
  red_meat_cancer: 'Red Meat',
  quantitative_easing: 'QE',
  '5g_health': '5G Health',
  death_penalty_deterrence: 'Death Penalty',
  civil_war_cause: 'Civil War',
};

export function AnomalyByTopicChart({ data, onExampleClick }: AnomalyByTopicChartProps) {
  const chartData = useMemo(() => {
    // Collect all propositions across categories
    const propMap = new Map<string, {
      id: string;
      name: string;
      helpful_neg: number;
      manip_pos: number;
      truthbot_neg: number;
      total: number;
      samples: string[];
    }>();

    // Process each category
    for (const [catKey, category] of Object.entries(data.categories) as [AnomalyCategoryKey, typeof data.categories[AnomalyCategoryKey]][]) {
      for (const prop of category.byProposition) {
        const existing = propMap.get(prop.id) || {
          id: prop.id,
          name: PROPOSITION_SHORT_LABELS[prop.id] || prop.id,
          helpful_neg: 0,
          manip_pos: 0,
          truthbot_neg: 0,
          total: 0,
          samples: [],
        };

        if (catKey === 'control_helpful_negative') {
          existing.helpful_neg = prop.count;
        } else if (catKey === 'control_manipulative_positive') {
          existing.manip_pos = prop.count;
        } else if (catKey === 'truthbot_helpful_negative') {
          existing.truthbot_neg = prop.count;
        }

        existing.total = existing.helpful_neg + existing.manip_pos + existing.truthbot_neg;
        existing.samples = [...existing.samples, ...prop.samples];
        propMap.set(prop.id, existing);
      }
    }

    // Convert to array and sort by total
    return Array.from(propMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 8); // Top 8 propositions
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white p-6 border shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4">Anomalies by Proposition</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12 }}
            width={75}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb' }}
            formatter={(value: number, name: string) => [value, name]}
          />
          <Legend />
          <Bar
            dataKey="helpful_neg"
            name="Helpful Negative"
            stackId="a"
            fill={ANOMALY_CATEGORY_INFO.control_helpful_negative.color}
          />
          <Bar
            dataKey="manip_pos"
            name="Manipulative Positive"
            stackId="a"
            fill={ANOMALY_CATEGORY_INFO.control_manipulative_positive.color}
          />
          <Bar
            dataKey="truthbot_neg"
            name="TruthBot Negative"
            stackId="a"
            fill={ANOMALY_CATEGORY_INFO.truthbot_helpful_negative.color}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Example links */}
      {onExampleClick && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Click to view example conversations:</p>
          <div className="flex flex-wrap gap-2">
            {chartData.slice(0, 4).map((prop) => (
              <button
                key={prop.id}
                onClick={() => prop.samples[0] && onExampleClick(prop.samples[0])}
                className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
              >
                {prop.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
