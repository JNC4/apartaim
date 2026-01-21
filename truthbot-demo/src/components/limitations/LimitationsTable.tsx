'use client';

import { motion } from 'framer-motion';

interface TableItem {
  type: string;
  why: string;
  consequence: string;
}

interface LimitationsTableProps {
  title: string;
  items: TableItem[];
  variant?: 'warning' | 'danger';
}

export function LimitationsTable({ title, items, variant = 'warning' }: LimitationsTableProps) {
  const colors = variant === 'danger'
    ? { header: 'bg-red-50', headerText: 'text-red-800', border: 'border-red-200' }
    : { header: 'bg-amber-50', headerText: 'text-amber-800', border: 'border-amber-200' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden border border-gray-200 shadow-sm"
    >
      <div className={`${colors.header} px-4 py-3 ${colors.border} border-b`}>
        <h4 className={`font-semibold ${colors.headerText}`}>{title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                Why It Occurs
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                Consequence
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {item.type}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.why}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.consequence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
