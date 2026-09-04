import React, { useState } from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { formatINR } from '../utils/formatters';
import { 
  AlertCircle, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Bot, 
  TrendingUp, 
  Zap
} from 'lucide-react';

interface Scene03MoneyFlowProps {
  summary: EvaluationSummary;
}

export const Scene03MoneyFlow: React.FC<Scene03MoneyFlowProps> = ({ summary }) => {
  const [activeHoverNode, setActiveHoverNode] = useState<number | null>(null);

  const nodes = [
    {
      id: 1,
      tag: '01 / INPUT',
      title: 'Revenue At Risk',
      value: formatINR(summary.total_revenue_at_risk),
      sub: `${summary.total_at_risk_transactions.toLocaleString()} failed items`,
      icon: AlertCircle,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      desc: 'Failed authorizations, dropped sessions, and overdue receivables ingested across payment gateways.',
    },
    {
      id: 2,
      tag: '02 / DIAGNOSIS',
      title: 'Risk Engine',
      value: '7-Class Diagnostic',
      sub: 'Root Cause Classification',
      icon: Activity,
      color: 'text-indigo-400',
      border: 'border-indigo-500/30',
      desc: 'Diagnostic parser isolates permanent revocation vs temporary gateway dips.',
    },
    {
      id: 3,
      tag: '03 / REASONING',
      title: 'AI Recovery Agent',
      value: 'Groq Llama-3.3 70B',
      sub: `${summary.policy_override_count || 142} Smart Overrides`,
      icon: Sparkles,
      color: 'text-violet-400',
      border: 'border-violet-500/40',
      desc: 'Generates structured JSON recovery decisions with confidence scoring in <350ms.',
    },
    {
      id: 4,
      tag: '04 / GATEWAY',
      title: 'Policy Guard',
      value: '100% Policy Bounds',
      sub: `${summary.human_approval_count} Gated Reviews`,
      icon: ShieldCheck,
      color: 'text-emerald-400',
      border: 'border-emerald-500/40',
      desc: 'Deterministic safety barrier enforcing merchant rules, frequency caps, and approval thresholds.',
    },
    {
      id: 5,
      tag: '05 / DISPATCH',
      title: 'Action Executor',
      value: 'Bounded Execution',
      sub: 'Simulated Dispatch',
      icon: Bot,
      color: 'text-teal-400',
      border: 'border-teal-500/30',
      desc: 'Dispatches validated smart retries, reminders, and customer escalation workflows.',
    },
    {
      id: 6,
      tag: '06 / YIELD',
      title: 'Recovered Capital',
      value: formatINR(summary.expected_recovery_from_decision_engine),
      sub: `${(summary.revenue_recovery_rate * 100).toFixed(1)}% Realized Yield`,
      icon: TrendingUp,
      color: 'text-emerald-300',
      border: 'border-emerald-400/50',
      desc: 'Simulated realized revenue logged with complete non-repudiation audit trails.',
    },
  ];

  return (
    <section id="scene-flow" className="relative min-h-screen flex flex-col justify-center py-24 px-6 sm:px-12 lg:px-20 border-t border-white/[0.05] film-grain-grid select-none">
      
      {/* Chapter Eyebrow */}
      <div className="max-w-6xl mx-auto w-full mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-xs font-mono text-indigo-300">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>02 / CONTINUOUS MONEY FLOW</span>
        </div>
      </div>

      {/* Main Typography Statement */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <h2 className="scene-statement-title text-white uppercase tracking-tight">
          <span className="block text-slate-400">A LIVING FINANCIAL</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-teal-200 to-emerald-300">
            RECOVERY STREAM.
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono leading-relaxed">
          Capital moves continuously through diagnostic parsing, generative AI recommendation, deterministic policy gating, and audited execution.
        </p>

        {/* Spatial Money Flow System */}
        <div className="my-16 relative">
          
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 -z-10">
            <svg className="w-full h-2" overflow="visible">
              <line 
                x1="0" 
                y1="1" 
                x2="100%" 
                y2="1" 
                stroke="rgba(99, 102, 241, 0.25)" 
                strokeWidth="2" 
              />
              <line 
                x1="0" 
                y1="1" 
                x2="100%" 
                y2="1" 
                stroke="#6366f1" 
                strokeWidth="2" 
                className="animate-flow-line" 
              />
            </svg>
          </div>

          {/* 6 Spatial Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {nodes.map((node) => {
              const Icon = node.icon;
              const isHovered = activeHoverNode === node.id;

              return (
                <div
                  key={node.id}
                  onMouseEnter={() => setActiveHoverNode(node.id)}
                  onMouseLeave={() => setActiveHoverNode(null)}
                  className={`p-5 rounded-2xl bg-[#0b0e14]/90 border transition-all duration-300 cursor-pointer ${
                    node.border
                  } ${
                    isHovered 
                      ? 'scale-105 shadow-2xl bg-slate-900 z-10' 
                      : 'hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                      {node.tag}
                    </span>
                    <Icon className={`w-4 h-4 ${node.color}`} />
                  </div>

                  <div className="text-xs font-mono text-slate-400">
                    {node.title}
                  </div>

                  <div className="text-base sm:text-lg font-mono font-extrabold text-white mt-1 tracking-tight">
                    {node.value}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500 mt-1">
                    {node.sub}
                  </div>

                  {isHovered && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.08] text-[11px] text-slate-300 leading-snug font-sans animate-fade-in-up">
                      {node.desc}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Telemetry Footnote */}
        <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-500">
          <span>LATENCY SLA: &lt; 350ms PER TRANSACTION</span>
          <span>100% AUDIT LINEAGE PRESERVED</span>
        </div>

      </div>
    </section>
  );
};
