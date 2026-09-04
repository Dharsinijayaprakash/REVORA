import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { formatINR, formatLabel } from '../utils/formatters';
import { AlertCircle } from 'lucide-react';

interface RootCauseChartProps {
  data: Record<string, { attempts: number; successes: number; recovered: number }>;
}

export const RootCauseChart: React.FC<RootCauseChartProps> = ({ data }) => {
  const chartData = Object.entries(data)
    .map(([cause, metrics]) => ({
      name: formatLabel(cause),
      rawName: cause,
      recovered: metrics.recovered,
      attempts: metrics.attempts,
      successes: metrics.successes,
    }))
    .filter(item => item.recovered > 0 || item.attempts > 0)
    .sort((a, b) => b.recovered - a.recovered);

  const totalRecovered = chartData.reduce((acc, curr) => acc + curr.recovered, 0);

  const BAR_COLORS = [
    '#4338ca', // indigo-700
    '#4f46e5', // indigo-600
    '#6366f1', // indigo-500
    '#818cf8', // indigo-400
    '#a5b4fc', // indigo-300
    '#c7d2fe', // indigo-200
    '#93c5fd', // blue-300
    '#cbd5e1', // slate-300
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between h-[440px]">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-600" />
            Where is Revenue Leaking?
          </h3>
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Total: {formatINR(totalRecovered)}
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Revenue at risk and recovered volume by root cause classification
        </p>
      </div>

      <div className="flex-1 w-full min-h-[300px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              type="number"
              tickFormatter={formatINR}
              stroke="#cbd5e1"
              fontSize={11}
              tick={{ fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={160}
              stroke="#cbd5e1"
              fontSize={11}
              tick={{ fill: '#334155', fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any, _name: any, item: any) => [
                `${formatINR(value as number)} (${item.payload.attempts} attempts)`,
                'Recovered Amount',
              ]}
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: '#ffffff',
              }}
              cursor={{ fill: '#f8fafc' }}
            />
            <Bar dataKey="recovered" radius={[0, 6, 6, 0]} barSize={20} animationDuration={1000}>
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>Root Cause Diagnostic Engine</span>
        <span>Ranked by Recovered Capital</span>
      </div>
    </div>
  );
};
