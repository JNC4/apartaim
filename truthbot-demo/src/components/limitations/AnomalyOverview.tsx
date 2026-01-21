'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import type { AnomalySummary, AnomalyCategoryKey } from '@/lib/limitations-types';
import { ANOMALY_CATEGORY_INFO } from '@/lib/limitations-types';

interface AnomalyOverviewProps {
  data: AnomalySummary;
}

export function AnomalyOverview({ data }: AnomalyOverviewProps) {
  const pieData = useMemo(() => {
    return (Object.entries(data.categories) as [AnomalyCategoryKey, typeof data.categories[AnomalyCategoryKey]][]).map(
      ([key, category]) => ({
        name: ANOMALY_CATEGORY_INFO[key].shortLabel,
        value: category.count,
        color: ANOMALY_CATEGORY_INFO[key].color,
        description: category.description,
      })
    );
  }, [data]);

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      {/* Stats */}
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center lg:text-left"
        >
          <div className="text-5xl font-bold text-gray-900">{data.total}</div>
          <div className="text-gray-600 mt-1">Total Anomalous Conversations</div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.entries(data.categories) as [AnomalyCategoryKey, typeof data.categories[AnomalyCategoryKey]][]).map(
            ([key, category], index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-4 border shadow-sm"
              >
                <div
                  className="text-3xl font-bold"
                  style={{ color: ANOMALY_CATEGORY_INFO[key].color }}
                >
                  {category.count}
                </div>
                <div className="text-xs text-gray-600 mt-1 leading-tight">
                  {ANOMALY_CATEGORY_INFO[key].shortLabel}
                </div>
              </motion.div>
            )
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {(Object.entries(data.categories) as [AnomalyCategoryKey, typeof data.categories[AnomalyCategoryKey]][]).map(
            ([key, category]) => (
              <div key={key} className="flex items-start gap-2">
                <div
                  className="w-3 h-3 mt-0.5 flex-shrink-0"
                  style={{ backgroundColor: ANOMALY_CATEGORY_INFO[key].color }}
                />
                <span>{category.description}</span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Donut Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-white p-6 border shadow-sm"
      >
        <h3 className="text-lg font-semibold mb-4 text-center">Anomaly Distribution</h3>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              dataKey="value"
              paddingAngle={2}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [value, name]}
              contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb' }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Legend below chart */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {pieData.map((entry) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <div className="w-3 h-3 flex-shrink-0" style={{ backgroundColor: entry.color }} />
              <span>{entry.name} ({entry.value})</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
