'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import type { ScalabilityConstraint, DualUseRisk } from '@/lib/limitations-types';

interface ScalabilityChartProps {
  constraints: ScalabilityConstraint[];
  dualUseRisks?: DualUseRisk[];
}

// Conceptual data for cost comparison
const costData = [
  { name: 'Standard AI', cost: 1, label: '1x' },
  { name: 'TruthBot Verification', cost: 2.2, label: '~2x+' },
];

// Conceptual data for adversarial improvement over time
const adversarialData = [
  { month: 0, detection: 95, evasion: 5, label: 'Initial' },
  { month: 3, detection: 88, evasion: 25, label: '3mo' },
  { month: 6, detection: 78, evasion: 45, label: '6mo' },
  { month: 9, detection: 65, evasion: 60, label: '9mo' },
  { month: 12, detection: 50, evasion: 75, label: '12mo' },
];

export function ScalabilityChart({ constraints, dualUseRisks }: ScalabilityChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="space-y-8"
    >
      {/* Dual Use Risks Section */}
      {dualUseRisks && dualUseRisks.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Dual Use Risks
          </h3>
          <p className="text-sm text-red-800 mb-4">
            This research carries inherent risks that must be transparently acknowledged. By studying manipulation detection, we simultaneously provide information that could be used to create more effective manipulators.
          </p>
          <div className="space-y-4">
            {dualUseRisks.map((risk, index) => (
              <motion.div
                key={risk.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/50 p-4 border border-red-100"
              >
                <h4 className="font-medium text-red-900 mb-2">{risk.title}</h4>
                <p className="text-sm text-red-800">{risk.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Constraints list (text only, no severity scores) */}
      <div className="bg-white p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Deployment Constraints</h3>
        <div className="space-y-4">
          {constraints.map((constraint, index) => (
            <motion.div
              key={constraint.dimension}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-2 h-2 mt-2 bg-amber-500 flex-shrink-0" />
              <div>
                <span className="font-medium text-gray-900">{constraint.dimension}:</span>{' '}
                <span className="text-gray-600">{constraint.note}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Conceptual charts section */}
      <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <strong>Note:</strong> The following visualizations are illustrative projections based on our assumptions, not measured data. They demonstrate conceptual trade-offs we expect in real-world deployment.
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Cost comparison chart */}
        <div className="bg-white p-6 border shadow-sm">
          <h4 className="font-semibold mb-2">Projected Computational Cost</h4>
          <p className="text-sm text-gray-500 mb-4">
            Relative cost per user interaction (baseline = 1x)
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={costData} layout="vertical" margin={{ top: 10, right: 40, left: 100, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} horizontal />
              <XAxis type="number" domain={[0, 3]} tickFormatter={(v) => `${v}x`} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={95}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}x baseline cost`, 'Cost']}
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="cost" radius={0}>
                {costData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-gray-500 mt-2 text-center">
            TruthBot requires additional model inference for each interaction
          </p>
        </div>

        {/* Adversarial adaptation chart */}
        <div className="bg-white p-6 border shadow-sm">
          <h4 className="font-semibold mb-2">Adversarial Models Improve Over Time</h4>
          <p className="text-sm text-gray-500 mb-4">
            As adversaries study detection methods, they train better evasion
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={adversarialData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === 'detection' ? 'Detection Rate' : 'Adversarial Evasion'
                ]}
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb' }}
              />
              <Line
                type="monotone"
                dataKey="detection"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2 }}
                name="detection"
              />
              <Line
                type="monotone"
                dataKey="evasion"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
                name="evasion"
              />
            </LineChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="flex justify-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-green-500" />
              <span className="text-gray-600">Detection Rate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-red-500" />
              <span className="text-gray-600">Adversarial Evasion</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Adversaries can use published detection criteria to train manipulators that evade detection while remaining persuasive
          </p>
        </div>
      </div>
    </motion.div>
  );
}
