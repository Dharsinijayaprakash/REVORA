import React from 'react';
import { 
  LayoutDashboard, 
  ListFilter, 
  Sparkles, 
  ShieldCheck, 
  Activity, 
  Zap,
  Bot,
  Layers
} from 'lucide-react';

export type NavView = 'overview' | 'pipeline' | 'queue' | 'ai-insights' | 'policy-guard';

interface SidebarProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
  totalAtRiskCount?: number;
  totalTransactions?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  totalAtRiskCount = 2026,
  totalTransactions = 5000,
}) => {
  const navItems = [
    {
      id: 'overview' as NavView,
      label: 'Executive Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'pipeline' as NavView,
      label: 'Interactive Pipeline',
      icon: Layers,
      badge: '6 Stages',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'queue' as NavView,
      label: 'Recovery Queue',
      icon: ListFilter,
      badge: totalAtRiskCount.toLocaleString(),
    },
    {
      id: 'ai-insights' as NavView,
      label: 'AI Intelligence',
      icon: Sparkles,
      badge: 'Groq 70B',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'policy-guard' as NavView,
      label: 'Policy Guard',
      icon: ShieldCheck,
      badge: '100% Gated',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
  ];

  return (
    <aside className="w-64 bg-[#0b0f17] border-r border-slate-800/80 flex flex-col flex-shrink-0 min-h-screen select-none fintech-grid-bg">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center font-extrabold text-base text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            R
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-[0.22em] text-white">REVORA</span>
            <span className="text-[10px] font-semibold tracking-wider text-indigo-400">AI REVENUE RECOVERY</span>
          </div>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-medium text-slate-400 w-full">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Autonomous Ops Console</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                  isActive
                    ? 'bg-indigo-700/80 text-indigo-100 border-indigo-400/30'
                    : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
        <div className="space-y-2">
          {/* Active indicator */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-emerald-400 tracking-wide">AI SYSTEM ACTIVE</span>
            </div>
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
          </div>

          {/* Synthetic mode badge */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-semibold">
            <div className="flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-amber-400" />
              <span>SYNTHETIC MODE</span>
            </div>
            <span className="text-[9px] font-mono opacity-80">{totalTransactions.toLocaleString()} TXS</span>
          </div>

          {/* Policy Guard status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            <span className="truncate">Protected by Policy Guard</span>
          </div>
        </div>

        <div className="pt-1 text-[10px] text-slate-500 text-center font-mono">
          REVORA Motion v2.0 • Autonomous Ops
        </div>
      </div>
    </aside>
  );
};
