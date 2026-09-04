import React, { useState } from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { formatINR, formatLabel } from '../utils/formatters';
import { 
  AlertCircle, 
  CreditCard, 
  ShoppingCart, 
  FileText, 
  Clock, 
  Cpu, 
  Sparkles, 
  ShieldAlert,
  Zap
} from 'lucide-react';

interface ChapterStorylineProps {
  summary: EvaluationSummary;
}

export const ChapterStoryline: React.FC<ChapterStorylineProps> = ({ summary }) => {
  const [hoveredRootCause, setHoveredRootCause] = useState<string | null>(null);
  const [activeComparisonTab, setActiveComparisonTab] = useState<'case1' | 'case2' | 'case3'>('case1');

  // Root cause sorted data
  const rootCauses = Object.entries(summary.root_cause_performance || {})
    .map(([key, data]) => ({
      key,
      label: formatLabel(key),
      recovered: data.recovered,
      attempts: data.attempts,
      successes: data.successes,
      rate: data.attempts > 0 ? (data.successes / data.attempts) * 100 : 0
    }))
    .sort((a, b) => b.recovered - a.recovered);

  const maxRecovered = Math.max(...rootCauses.map(r => r.recovered), 1);

  // Leakage spatial signals
  const leakageSignals = [
    {
      id: 'signal-1',
      title: 'Payment Method Failure',
      code: 'ERR_INSUFFICIENT_FUNDS / AUTH_EXPIRED',
      impact: '₹18.4 Lakhs Exposed',
      recoveryStrategy: 'Smart Retry Timing + Fallback Routing',
      icon: CreditCard,
      badge: 'TRANSIENT FAILURE',
      badgeColor: 'text-amber-400 bg-amber-950/40 border-amber-800/60',
    },
    {
      id: 'signal-2',
      title: 'Checkout Abandonment',
      code: 'SESSION_TIMEOUT / GATEWAY_DROP',
      impact: '₹1.29 Cr Exposed',
      recoveryStrategy: 'Omnichannel Precision Outreach',
      icon: ShoppingCart,
      badge: 'HIGH INTENT',
      badgeColor: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60',
    },
    {
      id: 'signal-3',
      title: 'Overdue B2B Receivable',
      code: 'INVOICE_NET30_EXPIRED',
      impact: '₹1.91 Cr Exposed',
      recoveryStrategy: 'Tiered Escalation + Human Safety Review',
      icon: FileText,
      badge: 'POLICY GATED',
      badgeColor: 'text-purple-400 bg-purple-950/40 border-purple-800/60',
    },
    {
      id: 'signal-4',
      title: 'Recurring Subscription Drop',
      code: 'MANDATE_REVOCATION / BANK_DIP',
      impact: '₹34.2 Lakhs Exposed',
      recoveryStrategy: 'Grace Period Preservation Engine',
      icon: Clock,
      badge: 'CHURN CRITICAL',
      badgeColor: 'text-rose-400 bg-rose-950/40 border-rose-800/60',
    },
  ];

  // AI Decision Cases
  const comparisonCases = {
    case1: {
      title: 'Transient Gateway Latency (Card Drop)',
      rootCause: 'Payment Infrastructure Failure',
      baselineAction: 'Payment Reminder',
      baselineReason: 'Static rule blindly queues an email notice regardless of customer presence.',
      aiAction: 'Smart Retry (35-Minute Window)',
      aiReason: 'Groq AI detects temporal gateway dip; schedules an off-peak automated retry before pinging customer.',
      override: true,
      impact: 'Recovered ₹4,500 without customer friction'
    },
    case2: {
      title: 'High-Value Invoice Past Due',
      rootCause: 'Overdue Receivable (> ₹25,000)',
      baselineAction: 'Payment Reminder',
      baselineReason: 'Standard automation sends automated dunning note.',
      aiAction: 'Human Approval Required',
      aiReason: 'Policy Guard flags invoice size (₹45,019) exceeding autonomous authority limit; mandates operator review.',
      override: true,
      impact: 'Safeguards strategic customer relationship'
    },
    case3: {
      title: 'Expired Card Token',
      rootCause: 'Payment Method Failure',
      baselineAction: 'Mandate Retry',
      baselineReason: 'Repeatedly hits issuer, causing merchant chargeback fees.',
      aiAction: 'Stop / Payment Update Flow',
      aiReason: 'AI identifies hard account closure; halts retries and dispatches encrypted card update modal.',
      override: true,
      impact: 'Zero retry penalties, preserves customer trust'
    }
  };

  const currentCase = comparisonCases[activeComparisonTab];

  return (
    <div className="space-y-24 py-16 px-4 sm:px-8 lg:px-14 border-b border-white/[0.06] revora-bg-dots">
      
      {/* =========================================================================
          CHAPTER 01 / THE PROBLEM
          ========================================================================= */}
      <section className="relative">
        <div className="max-w-4xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 text-xs font-mono text-rose-300 mb-4">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>01 / THE PROBLEM</span>
          </div>
          <h2 className="section-display-title text-white tracking-tight uppercase">
            REVENUE DOESN'T DISAPPEAR.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-rose-300 to-amber-300">
              IT LEAKS.
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl leading-relaxed">
            Every day, modern businesses lose 3% to 8% of revenue due to silent infrastructure disconnects, expired mandates, and blind dunning loops.
          </p>
        </div>

        {/* Spatial Leakage Signal Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {leakageSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div 
                key={signal.id}
                className="glass-panel glass-panel-hover p-6 rounded-2xl flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:text-indigo-400 group-hover:border-indigo-500/40 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${signal.badgeColor}`}>
                      {signal.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight">
                    {signal.title}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    {signal.code}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Exposure Scale
                  </span>
                  <div className="text-lg font-mono font-extrabold text-rose-300 mt-0.5">
                    {signal.impact}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{signal.recoveryStrategy}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 02 / INTELLIGENCE
          ========================================================================= */}
      <section className="relative pt-12 border-t border-white/[0.06]">
        <div className="max-w-4xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-xs font-mono text-indigo-300 mb-4">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>02 / INTELLIGENCE</span>
          </div>
          <h2 className="section-display-title text-white tracking-tight uppercase">
            REVORA UNDERSTANDS<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-sky-300">
              WHY MONEY IS AT RISK.
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl leading-relaxed">
            Static payment rules treat every failure as an identical event. REVORA classifies root causes across 7 distinct failure archetypes to calculate dynamic recovery odds.
          </p>
        </div>

        {/* Editorial Ranked Flowing Rows (Replacing boring bar chart) */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08]">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-mono font-bold tracking-widest text-white uppercase flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-400" />
                Root Cause Failure Taxonomy & Recovery Capital
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Ranked by simulated capital recovered through targeted intervention
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
              7 Active Diagnoses
            </span>
          </div>

          <div className="space-y-4">
            {rootCauses.map((cause, index) => {
              const pct = (cause.recovered / maxRecovered) * 100;
              const isHovered = hoveredRootCause === cause.key;

              return (
                <div
                  key={cause.key}
                  onMouseEnter={() => setHoveredRootCause(cause.key)}
                  onMouseLeave={() => setHoveredRootCause(null)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isHovered 
                      ? 'bg-slate-800/80 border-indigo-500/50 shadow-lg scale-[1.01]' 
                      : 'bg-slate-950/60 border-white/[0.04] hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-sm sm:text-base font-bold text-white">
                        {cause.label}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-4 sm:text-right">
                      <div className="text-xs font-mono text-slate-400">
                        {cause.successes} / {cause.attempts} Recovered ({cause.rate.toFixed(0)}%)
                      </div>
                      <div className="text-base sm:text-lg font-mono font-extrabold text-emerald-400">
                        {formatINR(cause.recovered)}
                      </div>
                    </div>
                  </div>

                  {/* Flowing Proportional Bar */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/[0.04]">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 transition-all duration-1000"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>

                  {isHovered && (
                    <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-slate-300 font-mono animate-fade-in-up">
                      <span>Intervention Strategy: Continuous Telemetry & Adaptive Execution</span>
                      <span className="text-indigo-400">Click to filter queue →</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CHAPTER 03 / AI DECISION
          ========================================================================= */}
      <section className="relative pt-12 border-t border-white/[0.06]">
        <div className="max-w-4xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-800/40 text-xs font-mono text-violet-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>03 / AI DECISION</span>
          </div>
          <h2 className="section-display-title text-white tracking-tight uppercase">
            AI DOESN'T ACT.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-indigo-200 to-pink-300">
              AI PROPOSES.
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl leading-relaxed">
            The core breakthrough: Groq Llama-3.3 70B synthesizes rich merchant context to propose optimized actions, which are strictly gated by Policy Guard before execution.
          </p>
        </div>

        {/* Interactive Comparison Console */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08]">
          {/* Scenario Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setActiveComparisonTab('case1')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeComparisonTab === 'case1'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Case 01: Transient Network Drop
            </button>
            <button
              onClick={() => setActiveComparisonTab('case2')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeComparisonTab === 'case2'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Case 02: High-Exposure Invoice
            </button>
            <button
              onClick={() => setActiveComparisonTab('case3')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                activeComparisonTab === 'case3'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Case 03: Expired Payment Method
            </button>
          </div>

          {/* Side-by-side transition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Baseline */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/[0.06] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest">
                    Static Deterministic Baseline
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    Legacy v1.4 Rule
                  </span>
                </div>
                <div className="text-lg font-mono font-extrabold text-slate-300">
                  {currentCase.baselineAction}
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {currentCase.baselineReason}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-500">
                Drawback: One-size-fits-all retry cadence causes customer churn.
              </div>
            </div>

            {/* AI Proposal */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-violet-950/20 to-slate-900/80 border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  ✦ AI OVERRIDE ACTIVE
                </span>
              </div>

              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-widest block mb-4">
                  Groq AI Agentic Proposal
                </span>
                <div className="text-xl font-mono font-extrabold text-white">
                  {currentCase.aiAction}
                </div>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {currentCase.aiReason}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-500/20 flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">Outcome: {currentCase.impact}</span>
                <span className="text-indigo-400">Bounded by Guard →</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
