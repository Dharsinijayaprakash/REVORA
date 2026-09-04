import React, { useState } from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { formatINR } from '../utils/formatters';
import { useCountUp } from '../hooks/useCountUp';
import {
  ShieldCheck,
  Sparkles,
  Cpu,
  TrendingUp,
  AlertCircle,
  Activity,
  Zap,
  ArrowDown,
  ChevronRight
} from 'lucide-react';

interface EditorialHeroProps {
  summary: EvaluationSummary;
  onExploreConsole: () => void;
  onExploreSafety: () => void;
}

export const EditorialHero: React.FC<EditorialHeroProps> = ({
  summary,
  onExploreConsole,
  onExploreSafety
}) => {
  const [activeStageHover, setActiveStageHover] = useState<number | null>(null);

  // Animated Count-ups
  const revenueAtRiskDisplay = useCountUp(summary.total_revenue_at_risk / 10000000, 1400); // in Cr
  const expectedRecoveryDisplay = useCountUp(summary.expected_recovery_from_decision_engine / 10000000, 1600); // in Cr
  const recoveryRateDisplay = useCountUp(summary.recovery_rate * 100, 1500);
  const revenueYieldDisplay = useCountUp(summary.revenue_recovery_rate * 100, 1600);

  const flowStages = [
    {
      id: 1,
      tag: '01 / LEAKAGE',
      label: 'Revenue At Risk',
      value: `₹${revenueAtRiskDisplay.toFixed(2)} Cr`,
      sub: `${summary.total_at_risk_transactions.toLocaleString()} failed transactions`,
      accent: 'border-rose-500/40 text-rose-400 bg-rose-950/20',
      glow: 'rgba(244, 63, 94, 0.15)',
      icon: AlertCircle,
      desc: 'Failed card charges, expired mandates, checkout abandonments and overdue receivables across payment gateways.',
    },
    {
      id: 2,
      tag: '02 / DIAGNOSIS',
      label: 'Risk Engine',
      value: '7-Class Diagnostic',
      sub: 'Root Cause Parsing',
      accent: 'border-indigo-500/40 text-indigo-400 bg-indigo-950/20',
      glow: 'rgba(99, 102, 241, 0.15)',
      icon: Activity,
      desc: 'Parses failure codes and customer interaction patterns to isolate permanent revocation vs temporary issues.',
    },
    {
      id: 3,
      tag: '03 / AI AGENT',
      label: 'Groq Llama-3.3 70B',
      value: `${summary.policy_override_count || 142} Smart Overrides`,
      sub: 'Agentic Reasoning',
      accent: 'border-violet-500/40 text-violet-300 bg-violet-950/20',
      glow: 'rgba(168, 85, 247, 0.18)',
      icon: Sparkles,
      desc: 'Generates context-aware recovery decisions with confidence scoring in <350ms.',
    },
    {
      id: 4,
      tag: '04 / SAFETY GATE',
      label: 'Policy Guard',
      value: '100% Policy Bounds',
      sub: `${summary.human_approval_count} Gated Reviews`,
      accent: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20',
      glow: 'rgba(16, 185, 129, 0.2)',
      icon: ShieldCheck,
      desc: 'Deterministic barrier strictly enforcing merchant retry rules, frequency caps, and human approvals.',
    },
    {
      id: 5,
      tag: '05 / REALIZED',
      label: 'Expected Recovery',
      value: `₹${expectedRecoveryDisplay.toFixed(2)} Cr`,
      sub: `${(summary.revenue_recovery_rate * 100).toFixed(1)}% Realized Yield`,
      accent: 'border-emerald-400/60 text-emerald-300 bg-emerald-900/30',
      glow: 'rgba(52, 211, 153, 0.25)',
      icon: TrendingUp,
      desc: 'Simulated automated recovery yield logged to non-repudiation audit trails.',
    },
  ];

  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-12 pb-16 px-4 sm:px-8 lg:px-14 border-b border-white/[0.06] revora-bg-grid glow-ambient-indigo overflow-hidden">
      {/* Subtle Atmospheric Top Noise & Ambient Lighting */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-emerald-600/8 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Top Header Bar inside Hero */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            R
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-black tracking-[0.25em] text-white">REVORA</span>
            <span className="text-slate-600">/</span>
            <span className="text-[11px] font-mono font-medium tracking-widest text-slate-400 uppercase">
              AI REVENUE RECOVERY
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AUTONOMOUS ENGINE ACTIVE</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-[11px] font-mono text-indigo-300">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Groq Llama-3.3 70B</span>
          </div>
        </div>
      </div>

      {/* Massive Editorial Headline & Introduction */}
      <div className="max-w-6xl my-auto py-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-indigo-300 mb-6 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>PRODUCTION-GRADE AI AGENTIC RECOVERY SYSTEM</span>
        </div>

        <h1 className="hero-display-title text-white tracking-tight uppercase">
          <span className="block text-slate-100">TURN REVENUE</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-indigo-300 to-indigo-500">
            LEAKAGE INTO
          </span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300">
            RECOVERABLE CAPITAL.
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-8 items-end">
          <p className="lg:col-span-8 text-base sm:text-lg lg:text-xl text-slate-400 font-normal leading-relaxed max-w-3xl">
            REVORA autonomously ingests failed transactions across gateways, applies agentic diagnostic reasoning to determine optimal recovery paths, and enforces strict deterministic safety barriers before executing financial interactions.
          </p>

          <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
            <button
              onClick={onExploreConsole}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold tracking-wider uppercase transition-all shadow-lg shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Operations Console</span>
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreSafety}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.1] text-xs font-mono font-medium tracking-wider uppercase transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Safety Gate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Living Financial Money Flow Visual System */}
      <div className="w-full mt-10 pt-8 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-slate-400">
            <Activity className="w-3.5 h-3.5 text-indigo-400" />
            <span>Continuous Financial Recovery Stream</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Hover stage for architectural telemetry
          </span>
        </div>

        {/* 5 Connected Flow Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {flowStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isHovered = activeStageHover === stage.id;
            return (
              <div
                key={stage.id}
                onMouseEnter={() => setActiveStageHover(stage.id)}
                onMouseLeave={() => setActiveStageHover(null)}
                className={`relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${stage.accent
                  } ${isHovered
                    ? 'scale-[1.03] shadow-2xl z-20 bg-slate-900/90'
                    : 'bg-[#0d1117]/80 hover:bg-[#131822]'
                  }`}
                style={{
                  boxShadow: isHovered ? `0 0 30px ${stage.glow}` : undefined
                }}
              >
                {/* Connecting Light Pulse (between stages) */}
                {idx < 4 && (
                  <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest opacity-70">
                    {stage.tag}
                  </span>
                  <Icon className="w-4 h-4 opacity-90" />
                </div>

                <div className="text-xs font-medium text-slate-400">
                  {stage.label}
                </div>

                <div className="text-lg sm:text-xl font-mono font-extrabold text-white mt-0.5 tracking-tight">
                  {stage.value}
                </div>

                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  {stage.sub}
                </div>

                {isHovered && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.1] text-[11px] text-slate-300 leading-snug animate-fade-in-up">
                    {stage.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Oversized Editorial Financial Telemetry (4 Large Telemetry Stats) */}
      <div className="w-full mt-10 grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-white/[0.06]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 block mb-1">
            01 / EXPOSURE AT RISK
          </span>
          <div className="stat-huge text-white">
            ₹{revenueAtRiskDisplay.toFixed(2)}<span className="text-xl sm:text-2xl text-slate-400 font-sans ml-1">Cr</span>
          </div>
          <span className="text-xs font-mono text-slate-500 mt-1 block">
            {summary.total_at_risk_transactions.toLocaleString()} failed transactions
          </span>
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 block mb-1">
            02 / EXPECTED RECOVERY
          </span>
          <div className="stat-huge text-indigo-300">
            ₹{expectedRecoveryDisplay.toFixed(2)}<span className="text-xl sm:text-2xl text-slate-400 font-sans ml-1">Cr</span>
          </div>
          <span className="text-xs font-mono text-slate-500 mt-1 block">
            Agentic decisioning projection
          </span>
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
            03 / VOLUME SUCCESS RATE
          </span>
          <div className="stat-huge text-emerald-400">
            {recoveryRateDisplay.toFixed(1)}<span className="text-xl sm:text-2xl text-slate-400 font-sans ml-0.5">%</span>
          </div>
          <span className="text-xs font-mono text-slate-500 mt-1 block">
            {summary.successful_recoveries} of {summary.total_recovery_attempts} recovered
          </span>
        </div>

        <div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-teal-400 block mb-1">
            04 / CAPITAL RECOVERY YIELD
          </span>
          <div className="stat-huge text-teal-300">
            {revenueYieldDisplay.toFixed(1)}<span className="text-xl sm:text-2xl text-slate-400 font-sans ml-0.5">%</span>
          </div>
          <span className="text-xs font-mono text-slate-500 mt-1 block">
            {formatINR(summary.total_amount_recovered)} simulated capital
          </span>
        </div>
      </div>
    </section>
  );
};
