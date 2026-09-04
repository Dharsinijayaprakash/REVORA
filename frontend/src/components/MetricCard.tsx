import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accentColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendUp,
  accentColor = 'indigo'
}) => {
  const accentMap: Record<string, { bg: string; text: string; iconBg: string; border: string }> = {
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', iconBg: 'bg-rose-100', border: 'border-rose-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', iconBg: 'bg-indigo-100', border: 'border-indigo-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', iconBg: 'bg-emerald-100', border: 'border-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', iconBg: 'bg-amber-100', border: 'border-amber-100' },
    sky: { bg: 'bg-sky-50', text: 'text-sky-600', iconBg: 'bg-sky-100', border: 'border-sky-100' },
  };

  const accent = accentMap[accentColor] || accentMap.indigo;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">{value}</h3>

          {subtitle && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{subtitle}</p>
          )}

          {trend && (
            <div className={`flex items-center mt-2.5 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              <span className="mr-1">{trendUp ? '↑' : '↓'}</span>
              {trend}
            </div>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${accent.iconBg} ${accent.text} transition-transform duration-200 group-hover:scale-105`}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
};
