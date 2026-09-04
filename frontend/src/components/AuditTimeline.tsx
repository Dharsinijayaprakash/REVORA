import React from 'react';
import type { TransactionEvaluation } from '../types/evaluation';
import { CheckCircle2, ShieldAlert, Cpu, Bot, FileText, ArrowRight } from 'lucide-react';

interface AuditTimelineProps {
  transaction: TransactionEvaluation;
}

const formatLabel = (value: string): string => {
  return value
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ transaction }) => {
  const steps = [
    {
      id: 'risk',
      title: 'Risk Detected',
      description: `${formatLabel(transaction.risk_level)} risk identified — ${formatLabel(transaction.root_cause)}`,
      icon: ShieldAlert,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      ringColor: 'ring-rose-100',
      status: 'complete'
    },
    {
      id: 'baseline',
      title: 'Deterministic Baseline',
      description: `Rule engine suggests: ${formatLabel(transaction.deterministic_action)}`,
      icon: FileText,
      color: 'text-slate-500',
      bgColor: 'bg-slate-50',
      ringColor: 'ring-slate-100',
      status: 'complete'
    },
    {
      id: 'ai',
      title: 'AI Proposes',
      description: `AI recommends: ${formatLabel(transaction.ai_action)}`,
      icon: Cpu,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      ringColor: 'ring-indigo-100',
      status: 'complete',
      badge: transaction.ai_action !== transaction.deterministic_action ? 'AI OVERRIDE' : undefined
    },
    {
      id: 'policy',
      title: 'Policy Guard Validates',
      description: transaction.policy_approved
        ? 'AI action approved within policy boundaries'
        : 'AI action rejected — fell outside policy bounds',
      icon: Bot,
      color: transaction.policy_approved ? 'text-emerald-500' : 'text-amber-500',
      bgColor: transaction.policy_approved ? 'bg-emerald-50' : 'bg-amber-50',
      ringColor: transaction.policy_approved ? 'ring-emerald-100' : 'ring-amber-100',
      status: 'complete',
      badge: transaction.policy_overridden ? 'POLICY OVERRIDE' : undefined
    },
    {
      id: 'executor',
      title: 'Executor Acts',
      description: transaction.attempted
        ? `Executed: ${formatLabel(transaction.final_action)}`
        : 'Automation stopped — no action taken.',
      icon: ArrowRight,
      color: transaction.attempted ? 'text-sky-500' : 'text-slate-400',
      bgColor: transaction.attempted ? 'bg-sky-50' : 'bg-slate-50',
      ringColor: transaction.attempted ? 'ring-sky-100' : 'ring-slate-100',
      status: 'complete'
    },
    {
      id: 'outcome',
      title: 'Outcome Recorded',
      description: transaction.success
        ? `Simulated success — recovered ₹${transaction.amount_recovered.toLocaleString('en-IN')}`
        : `Simulated failure — ${transaction.outcome_reason || 'Recovery unsuccessful'}`,
      icon: CheckCircle2,
      color: transaction.success ? 'text-emerald-500' : 'text-slate-400',
      bgColor: transaction.success ? 'bg-emerald-50' : 'bg-slate-50',
      ringColor: transaction.success ? 'ring-emerald-100' : 'ring-slate-100',
      status: 'complete'
    }
  ];

  return (
    <div className="py-2">
      <div className="flow-root">
        <ul className="-mb-8">
          {steps.map((step, stepIdx) => (
            <li key={step.id}>
              <div className="relative pb-8">
                {stepIdx !== steps.length - 1 ? (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200/80" aria-hidden="true"></span>
                ) : null}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ${step.ringColor} ${step.bgColor}`}>
                      <step.icon className={`h-3.5 w-3.5 ${step.color}`} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col pt-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-bold text-slate-800">{step.title}</p>
                      {step.badge && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200">
                          {step.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
