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
  ReferenceLine,
} from 'recharts';
import { CONDITION_COLORS, CONDITION_LABELS, type Condition } from '@/lib/experiment-types';

interface BeliefShiftChartProps {
  data: Record<Condition, number[]>;
  title?: string;
  showLegend?: boolean;
}

export function BeliefShiftChart({ data, title, showLegend = true }: BeliefShiftChartProps) {
  const chartData = useMemo(() => {
    const conditions: Condition[] = ['control_helpful', 'truthbot_helpful', 'control_manipulative', 'truthbot_manipulative'];

    return conditions.map((condition) => {
      const values = data[condition] || [];
      const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const sortedValues = [...values].sort((a, b) => a - b);
      const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)] || 0;
      const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)] || 0;

      return {
        condition: CONDITION_LABELS[condition],
        conditionKey: condition,
        mean: Math.round(mean * 10) / 10,
        q1,
        q3,
        n: values.length,
        fill: CONDITION_COLORS[condition],
      };
    });
  }, [data]);

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="condition"
            tick={{ fontSize: 11 }}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            label={{ value: 'Belief Change', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
            domain={[-50, 50]}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}`, name]}
            labelFormatter={(label) => label}
            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
          />
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Bar
            dataKey="mean"
            name="Mean Belief Change"
            radius={0}
            label={{ position: 'top', fontSize: 11 }}
          />
        </BarChart>
      </ResponsiveContainer>
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
          {chartData.map((item) => (
            <div key={item.conditionKey} className="flex items-center gap-2">
              <div
                className="w-3 h-3"
                style={{ backgroundColor: item.fill }}
              />
              <span>{item.condition} (n={item.n})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface BeliefDistributionChartProps {
  data: Record<Condition, number[]>;
  title?: string;
}

export function BeliefDistributionChart({ data, title }: BeliefDistributionChartProps) {
  const histogramData = useMemo(() => {
    const bins = Array.from({ length: 21 }, (_, i) => ({
      bin: i * 10 - 100,
      label: `${i * 10 - 100}`,
      control_helpful: 0,
      control_manipulative: 0,
      truthbot_helpful: 0,
      truthbot_manipulative: 0,
    }));

    for (const [condition, values] of Object.entries(data)) {
      for (const value of values) {
        const binIndex = Math.min(20, Math.max(0, Math.floor((value + 100) / 10)));
        bins[binIndex][condition as Condition]++;
      }
    }

    return bins;
  }, [data]);

  return (
    <div className="w-full">
      {title && <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10 }}
            label={{ value: 'Belief Change', position: 'bottom', offset: -5 }}
          />
          <YAxis
            label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
          />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)' }} />
          <Legend />
          <Bar dataKey="control_helpful" name="Control (Helpful)" fill={CONDITION_COLORS.control_helpful} stackId="a" />
          <Bar dataKey="truthbot_helpful" name="TruthBot (Helpful)" fill={CONDITION_COLORS.truthbot_helpful} stackId="a" />
          <Bar dataKey="control_manipulative" name="Control (Manipulative)" fill={CONDITION_COLORS.control_manipulative} stackId="b" />
          <Bar dataKey="truthbot_manipulative" name="TruthBot (Manipulative)" fill={CONDITION_COLORS.truthbot_manipulative} stackId="b" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
