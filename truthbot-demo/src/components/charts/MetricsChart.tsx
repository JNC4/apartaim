'use client';

import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface GaugeChartProps {
  value: number;
  label: string;
  color?: string;
  maxValue?: number;
}

export function GaugeChart({ value, label, color = '#10b981', maxValue = 100 }: GaugeChartProps) {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const data = [
    { name: label, value: percentage, fill: color },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={150} height={100}>
        <RadialBarChart
          cx="50%"
          cy="100%"
          innerRadius="60%"
          outerRadius="100%"
          barSize={15}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="text-center -mt-6">
        <div className="text-2xl font-bold" style={{ color }}>{Math.round(value)}%</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
}

interface ConfusionMatrixProps {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
}

export function ConfusionMatrixChart({ tp, tn, fp, fn }: ConfusionMatrixProps) {
  const total = tp + tn + fp + fn;
  const accuracy = total > 0 ? ((tp + tn) / total * 100).toFixed(1) : '0';
  const precision = (tp + fp) > 0 ? (tp / (tp + fp) * 100).toFixed(1) : '0';
  const recall = (tp + fn) > 0 ? (tp / (tp + fn) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 text-center text-sm">
        <div></div>
        <div className="font-semibold text-gray-700 p-2">Predicted Manip.</div>
        <div className="font-semibold text-gray-700 p-2">Predicted Helpful</div>

        <div className="font-semibold text-gray-700 p-2 text-right">Actual Manip.</div>
        <div className="bg-green-100 p-3">
          <div className="text-lg font-bold text-green-700">{tp}</div>
          <div className="text-xs text-green-600">TP</div>
        </div>
        <div className="bg-red-100 p-3">
          <div className="text-lg font-bold text-red-700">{fn}</div>
          <div className="text-xs text-red-600">FN</div>
        </div>

        <div className="font-semibold text-gray-700 p-2 text-right">Actual Helpful</div>
        <div className="bg-red-100 p-3">
          <div className="text-lg font-bold text-red-700">{fp}</div>
          <div className="text-xs text-red-600">FP</div>
        </div>
        <div className="bg-green-100 p-3">
          <div className="text-lg font-bold text-green-700">{tn}</div>
          <div className="text-xs text-green-600">TN</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t">
        <div>
          <div className="text-xl font-bold text-gray-900">{accuracy}%</div>
          <div className="text-sm text-gray-600">Accuracy</div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900">{precision}%</div>
          <div className="text-sm text-gray-600">Precision</div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900">{recall}%</div>
          <div className="text-sm text-gray-600">Recall</div>
        </div>
      </div>
    </div>
  );
}

interface DonutChartProps {
  value: number;
  total: number;
  label: string;
  color?: string;
}

export function DonutChart({ value, total, label, color = '#10b981' }: DonutChartProps) {
  const percentage = total > 0 ? (value / total * 100) : 0;
  const data = [
    { name: 'Value', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={50}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-2">
        <div className="text-xl font-bold" style={{ color }}>{percentage.toFixed(1)}%</div>
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
}
