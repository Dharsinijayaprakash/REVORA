import React from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { formatINR } from '../utils/formatters';
import { 
  TrendingUp, 
  ArrowRight, 
  Bot, 
  UserCheck, 
  OctagonX, 
  Zap, 
  Activity
} from 'lucide-react';

interface RecoveryFlowShowcaseProps {
  summary: EvaluationSummary;
}

export const RecoveryFlowShowcase: React.FC<RecoveryFlowShowcaseProps> = ({ summary }) => {
  const actions = summary.action_performance || {};
  
  const actionBreakdown = [
    {
      action: 'SMART_RETRY',
      label: 'Smart Retry (Autonomous)',
      attempts: actions['SMART_RETRY']?.attempts || 0,
      recovered: actions['SMART_RETRY']?.recovered || 0,
      color: 'indigo',
      icon: Zap,
    },
    {
      action: 'HUMAN_APPROVAL',
      label: 'Human Approval (Gated)',
      attempts: actions['HUMAN_APPROVAL']?.attempts || summary.human_approval_count || 0,
      recovered: actions['HUMAN_APPROVAL']?.recovered || 0,
      color: 'purple',
      icon: UserCheck,
    },
    {
      action: 'PAYMENT_REMINDER',
      label: 'Payment Reminder (Precision)',
      attempts: actions['PAYMENT_REMINDER']?.attempts || 0,
      recovered: actions['PAYMENT_REMINDER']?.recovered || 0,
      color: 'sky',
      icon: Bot,
    },
    {
      action: 'RECEIVABLES_ESCALATION',
      label: 'Receivables Escalation',
      attempts: actions['RECEIVABLES_ESCALATION']?.attempts || 0,
      recovered: actions['RECEIVABLES_ESCALATION']?.recovered || 0,
      color: 'amber',
      icon: Activity,
    },
    {
      action: 'STOP',
      label: 'Safety Stop (Fatigue Limit)',
      attempts: actions['STOP']?.attempts || summary.stopped_count || 0,
      recovered: 0,
      color: 'slate',
      icon: OctagonX,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-8 lg:px-14 border-b border-white/[0.06] revora-bg-grid">
      <div className="max-w-4xl mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/40 border border-teal-800/40 text-xs font-mono text-teal-300 mb-4">
          <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
          <span>05 / MEASURED CAPITAL IMPACT</span>
        </div>
        <h2 className="section-display-title text-white tracking-tight uppercase">
          RECOVERY IS MEASURED.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-indigo-300">
            NOT HYPOTHESIZED.
          </span>
        </h2>
        <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl leading-relaxed">
          Every decision executed by REVORA produces verifiable financial yield and non-repudiation audit records.
        </p>
      </div>

      {/* Flowing Transformation Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/[0.08] relative overflow-hidden mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Before: Risk */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-rose-500/20">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 block mb-2">
              STARTING EXPOSURE
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-white">
              {formatINR(summary.total_revenue_at_risk)}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-2 block">
              {summary.total_at_risk_transactions.toLocaleString()} at-risk transactions
            </span>
          </div>

          {/* Center Flowing Arrow & Yield */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
              <ArrowRight className="w-6 h-6 animate-pulse" />
            </div>
            <div className="text-lg font-mono font-bold text-emerald-400">
              {(summary.revenue_recovery_rate * 100).toFixed(1)}% Recovery Yield
            </div>
            <span className="text-xs font-mono text-slate-500 block">
              Autonomous + Human Gated Execution
            </span>
          </div>

          {/* After: Recovered */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 block mb-2">
              REALIZED RECOVERY
            </span>
            <div className="text-3xl sm:text-4xl font-mono font-extrabold text-emerald-300">
              {formatINR(summary.total_amount_recovered)}
            </div>
            <span className="text-xs font-mono text-slate-400 mt-2 block">
              Expected: {formatINR(summary.expected_recovery_from_decision_engine)}
            </span>
          </div>

        </div>
      </div>

      {/* Action Distribution Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {actionBreakdown.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.action} 
              className="p-5 rounded-2xl bg-slate-950/80 border border-white/[0.04] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-slate-400">
                    {item.attempts} attempts
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-200">
                  {item.label}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Recovered Amount
                </span>
                <span className="text-sm font-mono font-extrabold text-emerald-400 mt-0.5 block">
                  {formatINR(item.recovered)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
