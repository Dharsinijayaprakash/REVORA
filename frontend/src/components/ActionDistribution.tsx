import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Bot, UserCheck, OctagonX, Zap } from 'lucide-react';
import { formatLabel } from '../utils/formatters';

interface ActionDistributionProps {
  data: Record<string, { attempts: number; successes: number; recovered: number }>;
}

const ACTION_COLORS: Record<string, string> = {
  'SMART_RETRY': '#4f46e5',            // indigo
  'PAYMENT_REMINDER': '#0ea5e9',       // sky
  'HUMAN_APPROVAL': '#a855f7',         // purple (distinct)
  'RECEIVABLES_ESCALATION': '#f59e0b',  // amber
  'STOP': '#64748b',                   // slate
};

export const ActionDistribution: React.FC<ActionDistributionProps> = ({ data }) => {
  const chartData = Object.entries(data)
    .map(([action, metrics]) => ({
      name: formatLabel(action),
      rawName: action,
      value: metrics.attempts,
      recovered: metrics.recovered,
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  // Compute breakdown stats
  const autonomousCount = (data['SMART_RETRY']?.attempts || 0) 
                        + (data['PAYMENT_REMINDER']?.attempts || 0) 
                        + (data['RECEIVABLES_ESCALATION']?.attempts || 0);
  const humanCount = data['HUMAN_APPROVAL']?.attempts || 0;
  const stoppedCount = data['STOP']?.attempts || 0;
  const totalAttempts = chartData.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between h-[440px]">
      <div>
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            How Does REVORA Respond?
          </h3>
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            {totalAttempts.toLocaleString()} Total Actions
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Action distribution: Smart retries, human approvals & safety stops
        </p>
      </div>

      <div className="flex-1 w-full min-h-[210px] my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="48%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={ACTION_COLORS[entry.rawName] || '#94a3b8'} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: any, _name: any, props: any) => [
                `${value} transactions (${((value / (totalAttempts || 1)) * 100).toFixed(1)}%)`,
                props.payload.name,
              ]}
              contentStyle={{ 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                fontSize: '12px',
                fontWeight: 500,
                backgroundColor: '#ffffff',
              }}
            />
            <Legend 
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#475569' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Automation vs Human Oversight */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Automation vs Human Oversight
          </p>
          <span className="text-[10px] text-slate-400 font-mono">
            Safety Gated
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100/80 text-indigo-700">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 leading-none font-mono">
                {autonomousCount.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Autonomous</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-base font-extrabold text-purple-950 leading-none font-mono">
                {humanCount.toLocaleString()}
              </p>
              <p className="text-[10px] text-purple-700 font-bold mt-0.5">Human Approval</p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700">
              <OctagonX className="w-3.5 h-3.5" />
            </div>
            <div>
              <p className="text-base font-extrabold text-slate-900 leading-none font-mono">
                {stoppedCount.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">Stopped</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
