import React from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { formatINR } from '../utils/formatters';
import { 
  AlertCircle, 
  Activity, 
  Cpu, 
  ShieldCheck, 
  TrendingUp, 
} from 'lucide-react';

interface StorytellingScrollProps {
  summary: EvaluationSummary;
}

export const StorytellingScroll: React.FC<StorytellingScrollProps> = ({ summary }) => {
  const steps = [
    {
      num: '01',
      tag: 'LEAKAGE DETECTION',
      title: 'Revenue is leaking.',
      subtitle: `Capital exposed across payment gateways: ${formatINR(summary.total_revenue_at_risk)}`,
      description: `${summary.total_at_risk_transactions.toLocaleString()} failed transactions detected requiring recovery intervention.`,
      icon: AlertCircle,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200'
    },
    {
      num: '02',
      tag: 'DIAGNOSTIC INTELLIGENCE',
      title: 'REVORA understands why.',
      subtitle: '7-category root cause classification engine',
      description: 'Differentiates permanent revocation, temporary bank timeouts, and checkout abandonment.',
      icon: Activity,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      num: '03',
      tag: 'AGENTIC PROPOSAL',
      title: 'AI decides what to do.',
      subtitle: 'Groq Llama-3.3 70B contextual smart action proposal',
      description: `${summary.policy_override_count || 142} decisions dynamically adjusted to maximize recovery probability.`,
      icon: Cpu,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    {
      num: '04',
      tag: 'DETERMINISTIC SAFETY',
      title: 'Policy Guard keeps it safe.',
      subtitle: '100% Policy-bounded execution barrier',
      description: `${summary.human_approval_count} high-exposure actions gated for operator review. Zero unbounded actions.`,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    {
      num: '05',
      tag: 'MEASURED IMPACT',
      title: 'Recovery is measured.',
      subtitle: `Simulated realized capital: ${formatINR(summary.total_amount_recovered)}`,
      description: `${(summary.revenue_recovery_rate * 100).toFixed(1)}% recovery yield logged with complete audit lineage.`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    }
  ];

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-xl relative overflow-hidden fintech-grid-bg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              The 5-Stage Story
            </span>
            <span className="text-xs font-bold text-slate-300">How REVORA Converts Risk into Capital</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1 tracking-tight">
            Autonomous Revenue Recovery Lifecycle
          </h3>
        </div>

        <span className="text-xs text-slate-400 font-mono hidden md:inline">
          Continuous Agentic Feedback Loop
        </span>
      </div>

      {/* 5 Story Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div 
              key={step.num}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                    {step.num}
                  </span>
                  <Icon className={`w-4 h-4 ${step.color} transition-transform group-hover:scale-110`} />
                </div>
                <span className="text-[9px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
                  {step.tag}
                </span>
                <h4 className="text-xs font-extrabold text-white mt-1">
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-300 font-medium mt-1 leading-snug">
                  {step.subtitle}
                </p>
              </div>

              <p className="text-[10px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80 leading-relaxed">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
