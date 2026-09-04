import React from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { formatINR } from '../utils/formatters';
import { useCountUp } from '../hooks/useCountUp';
import { TrendingUp, ArrowRight, Zap, UserCheck, Bot, OctagonX, Activity } from 'lucide-react';

interface Scene08RecoveryTransformProps {
  summary: EvaluationSummary;
}

export const Scene08RecoveryTransform: React.FC<Scene08RecoveryTransformProps> = ({ summary }) => {
  const atRiskDisplay = useCountUp(summary.total_revenue_at_risk / 10000000, 1400);
  const expectedDisplay = useCountUp(summary.expected_recovery_from_decision_engine / 10000000, 1600);
  const rateDisplay = useCountUp(summary.recovery_rate * 100, 1500);
  const yieldDisplay = useCountUp(summary.revenue_recovery_rate * 100, 1600);

  const actions = summary.action_performance || {};

  const actionItems = [
    {
      action: 'SMART_RETRY',
      label: 'Smart Retry (Autonomous)',
      attempts: actions['SMART_RETRY']?.attempts || 0,
      recovered: actions['SMART_RETRY']?.recovered || 0,
      icon: Zap,
      color: 'text-indigo-400',
    },
    {
      action: 'HUMAN_APPROVAL',
      label: 'Human Approval (Gated)',
      attempts: actions['HUMAN_APPROVAL']?.attempts || summary.human_approval_count || 0,
      recovered: actions['HUMAN_APPROVAL']?.recovered || 0,
      icon: UserCheck,
      color: 'text-purple-400',
    },
    {
      action: 'PAYMENT_REMINDER',
      label: 'Payment Reminder (Precision)',
      attempts: actions['PAYMENT_REMINDER']?.attempts || 0,
      recovered: actions['PAYMENT_REMINDER']?.recovered || 0,
      icon: Bot,
      color: 'text-sky-400',
    },
    {
      action: 'RECEIVABLES_ESCALATION',
      label: 'Receivables Escalation',
      attempts: actions['RECEIVABLES_ESCALATION']?.attempts || 0,
      recovered: actions['RECEIVABLES_ESCALATION']?.recovered || 0,
      icon: Activity,
      color: 'text-amber-400',
    },
    {
      action: 'STOP',
      label: 'Safety Stop (Fatigue Limit)',
      attempts: actions['STOP']?.attempts || summary.stopped_count || 0,
      recovered: 0,
      icon: OctagonX,
      color: 'text-slate-400',
    },
  ];

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-24 px-6 sm:px-12 lg:px-20 border-t border-white/[0.05] film-grain-grid select-none">
      
      {/* Chapter Eyebrow */}
      <div className="max-w-6xl mx-auto w-full mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/40 border border-teal-800/40 text-xs font-mono text-teal-300">
          <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
          <span>07 / MEASURED FINANCIAL IMPACT</span>
        </div>
      </div>

      {/* Main Typography Statement */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <h2 className="scene-statement-title text-white uppercase tracking-tight">
          <span className="block text-slate-400">LEAKAGE</span>
          <span className="block text-slate-100">TRANSFORMS INTO</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-sky-300">
            RECOVERED REVENUE.
          </span>
        </h2>

        {/* Spatial Transformation Flow Box */}
        <div className="my-12 p-8 sm:p-12 rounded-3xl bg-white/[0.015] border border-white/[0.06] relative">
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
            
            {/* Left: At Risk */}
            <div className="lg:col-span-5 p-8 rounded-2xl bg-slate-950/90 border border-rose-500/20">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 block mb-2">
                EXPOSURE INGESTED
              </span>
              <div className="stat-monumental text-white">
                ₹{atRiskDisplay.toFixed(2)}<span className="text-2xl font-sans text-slate-500 ml-1">Cr</span>
              </div>
              <span className="text-xs font-mono text-slate-400 mt-2 block">
                {summary.total_at_risk_transactions.toLocaleString()} at-risk transactions
              </span>
            </div>

            {/* Center Flowing Transformation Indicator */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center py-2">
              <div className="w-10 h-10 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <ArrowRight className="w-5 h-5 animate-pulse" />
              </div>
              <span className="text-[9px] font-mono font-bold text-emerald-400 mt-2 uppercase tracking-wider text-center">
                RECOVERY
              </span>
            </div>

            {/* Right: Recovered */}
            <div className="lg:col-span-5 p-8 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950/90 border border-emerald-500/40 shadow-2xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block mb-2">
                EXPECTED / REALIZED YIELD
              </span>
              <div className="stat-monumental text-emerald-300">
                ₹{expectedDisplay.toFixed(2)}<span className="text-2xl font-sans text-slate-500 ml-1">Cr</span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-300">
                <span className="text-emerald-400 font-bold">{rateDisplay.toFixed(1)}% Volume Rate</span>
                <span>•</span>
                <span className="text-teal-300 font-bold">{yieldDisplay.toFixed(1)}% Revenue Yield</span>
              </div>
            </div>

          </div>
        </div>

        {/* Action Breakdown Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-6 border-t border-white/[0.06]">
          {actionItems.map((item) => {
            const Icon = item.icon;
            return (
              <div 
                key={item.action}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]"
              >
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-4 h-4 ${item.color}`} />
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {item.attempts}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-300 truncate">
                  {item.label}
                </div>
                <div className="text-xs font-mono font-extrabold text-emerald-400 mt-1">
                  {formatINR(item.recovered)}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
