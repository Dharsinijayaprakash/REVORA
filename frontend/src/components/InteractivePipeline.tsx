import React, { useState } from 'react';
import { 
  ShieldAlert, 
  FileText, 
  Cpu, 
  ShieldCheck, 
  Bot, 
  CheckCircle2, 
  Sparkles,
  Info,
  Layers,
  Lock
} from 'lucide-react';

interface StageInfo {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: any;
  color: string;
  borderColor: string;
  bgColor: string;
  textColor: string;
  heading: string;
  description: string;
  technicalRule: string;
}

const STAGES: StageInfo[] = [
  {
    id: 'risk',
    step: 'STAGE 01',
    title: 'Risk Detected',
    subtitle: '7-Class Diagnostic',
    badge: 'Context Ingestion',
    icon: ShieldAlert,
    color: 'text-rose-500',
    borderColor: 'border-rose-300 ring-rose-100',
    bgColor: 'bg-rose-50/70',
    textColor: 'text-rose-950',
    heading: 'Failure Event & Risk Detection',
    description: 'When a payment fails across gateways (Razorpay, Stripe, Adyen), the risk engine classifies the root cause—such as payment method failure, temporary network timeout, or overdue receivables.',
    technicalRule: 'Classifies failure mechanism into 7 distinct categories with real-time exposure calculation.'
  },
  {
    id: 'baseline',
    step: 'STAGE 02',
    title: 'Deterministic Baseline',
    subtitle: 'Standard Rule v1.4',
    badge: 'Rule Engine',
    icon: FileText,
    color: 'text-slate-600',
    borderColor: 'border-slate-300 ring-slate-100',
    bgColor: 'bg-slate-50/70',
    textColor: 'text-slate-900',
    heading: 'Deterministic Baseline Projection',
    description: 'A static rule engine computes the baseline response (e.g. fixed reminder intervals, standard retry schedule). This serves as the benchmark against which AI decisions are evaluated.',
    technicalRule: 'Evaluates baseline expected recovery without dynamic context adaptation.'
  },
  {
    id: 'ai',
    step: 'STAGE 03',
    title: 'AI Proposal',
    subtitle: 'Groq Llama-3.3 70B',
    badge: 'Agentic Reasoning',
    icon: Cpu,
    color: 'text-indigo-600',
    borderColor: 'border-indigo-400 ring-indigo-100',
    bgColor: 'bg-indigo-50/70',
    textColor: 'text-indigo-950',
    heading: 'Groq AI Agentic Intelligence',
    description: 'The AI Recovery Agent evaluates rich transaction context, customer history, failure latency, and recovery probability to propose an optimized action (e.g. Smart Retry, Customer Escalation, or Cooldown).',
    technicalRule: 'Generates structured JSON decision with diagnostic confidence score in <350ms.'
  },
  {
    id: 'policy',
    step: 'STAGE 04',
    title: 'Policy Guard',
    subtitle: 'Deterministic Gate',
    badge: '100% Policy-Gated',
    icon: ShieldCheck,
    color: 'text-emerald-600',
    borderColor: 'border-emerald-400 ring-emerald-100',
    bgColor: 'bg-emerald-50/70',
    textColor: 'text-emerald-950',
    heading: 'Policy Guard Safety Gate',
    description: 'AI proposals are NEVER executed directly. Policy Guard validates the proposed action against deterministic hard constraints: max retry frequency, customer fatigue limits, and human approval thresholds.',
    technicalRule: 'Enforces Rule PG-01 (retry ceilings), PG-02 (₹25k invoice review), and PG-03 (mandate failure halts).'
  },
  {
    id: 'executor',
    step: 'STAGE 05',
    title: 'Executor Dispatch',
    subtitle: 'Telemetry & Gate',
    badge: 'Bounded Execution',
    icon: Bot,
    color: 'text-sky-600',
    borderColor: 'border-sky-300 ring-sky-100',
    bgColor: 'bg-sky-50/70',
    textColor: 'text-sky-950',
    heading: 'Bounded Execution & Dispatch',
    description: 'Once validated by Policy Guard, the action executor dispatches automated retries, customer payment notifications, or routes high-value invoices to the human operator queue.',
    technicalRule: 'Emits execution telemetry and maintains non-repudiation audit trails.'
  },
  {
    id: 'recovery',
    step: 'STAGE 06',
    title: 'Recovery Recorded',
    subtitle: 'Audited Outcome',
    badge: 'Simulation Ledger',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    borderColor: 'border-emerald-400 ring-emerald-100',
    bgColor: 'bg-emerald-50/70',
    textColor: 'text-emerald-950',
    heading: 'Audited Financial Outcome',
    description: 'The simulation records the exact recovery status, recovered amount, calibration delta, and full decision lineage from risk trigger to capital realization.',
    technicalRule: 'Calibrates decision yield against baseline expectation with complete cryptographic auditability.'
  }
];

export const InteractivePipeline: React.FC = () => {
  const [activeStageId, setActiveStageId] = useState<string>('ai');

  const activeStage = STAGES.find(s => s.id === activeStageId) || STAGES[2];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              The REVORA Interactive Recovery Pipeline
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Hover to Explore Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Explore how REVORA bridges generative AI intelligence with deterministic safety guardrails across 6 connected phases.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Zero Unbounded Executions</span>
        </div>
      </div>

      {/* 6-Node Horizontal Interactive Pipeline Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 relative my-6">
        {STAGES.map((stage) => {
          const Icon = stage.icon;
          const isActive = activeStageId === stage.id;
          const isDimmed = activeStageId && !isActive;

          return (
            <div
              key={stage.id}
              onMouseEnter={() => setActiveStageId(stage.id)}
              onClick={() => setActiveStageId(stage.id)}
              className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer relative flex flex-col justify-between select-none ${
                isActive
                  ? `${stage.bgColor} ${stage.borderColor} ring-2 shadow-md scale-[1.03] z-10`
                  : isDimmed
                  ? 'bg-slate-50/50 border-slate-200 opacity-65 hover:opacity-100 hover:scale-[1.01]'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    {stage.step}
                  </span>
                  <Icon className={`w-4 h-4 ${stage.color} transition-transform ${isActive ? 'scale-110' : ''}`} />
                </div>
                <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                  {stage.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 font-medium truncate">
                  {stage.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-white text-slate-800 shadow-2xs' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {stage.badge}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Interactive Drawer Detail on Hover */}
      <div className="mt-6 p-5 sm:p-6 rounded-xl bg-slate-900 text-white border border-slate-800 transition-all duration-300 relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                {activeStage.step} ARCHITECTURAL EXPLORATION
              </span>
              <span className="text-xs font-bold text-slate-300">
                {activeStage.title}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-extrabold text-white">
              {activeStage.heading}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {activeStage.description}
            </p>
          </div>

          <div className="hidden lg:flex p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-right flex-col justify-center min-w-[220px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Enforcement Contract
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-400 mt-1 block">
              {activeStage.technicalRule}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Hover any node above to inspect architectural mechanics and deterministic bounds.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">
            Policy Guard Validated: 100%
          </span>
        </div>
      </div>
    </div>
  );
};
