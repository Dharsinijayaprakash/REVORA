import React from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { formatINR } from '../utils/formatters';
import { useCountUp } from '../hooks/useCountUp';
import { 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  TrendingUp, 
  AlertCircle, 
  Activity, 
  Zap,
  Percent,
  CheckCircle2
} from 'lucide-react';

interface HeroCinematicProps {
  summary: EvaluationSummary;
}

export const HeroCinematic: React.FC<HeroCinematicProps> = ({ summary }) => {
  const atRiskAmount = summary.total_revenue_at_risk;
  const expectedRecovery = summary.expected_recovery_from_decision_engine;
  const actualRecovered = summary.total_amount_recovered;
  const recoveryRate = summary.recovery_rate;
  const revenueRate = summary.revenue_recovery_rate;

  // Animated counters
  const animatedAtRisk = useCountUp(atRiskAmount, 1000);
  const animatedExpected = useCountUp(expectedRecovery, 1000);
  const animatedRecoveryRate = useCountUp(recoveryRate, 1000);
  const animatedRevenueRate = useCountUp(revenueRate, 1000);

  return (
    <section className="relative rounded-2xl bg-[#0b0f17] text-white border border-slate-800 shadow-2xl overflow-hidden p-6 sm:p-8 lg:p-10 fintech-grid-bg">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-0 animate-pulse-glow" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 space-y-8">
        {/* Top Header & Tagline */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                AI REVENUE RECOVERY ENGINE
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                SYSTEM ACTIVE
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Turn revenue leakage into{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400">
                recoverable capital.
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
              REVORA detects failed transactions across gateways, diagnoses failure mechanisms with Groq AI, and executes bounded recovery actions inside deterministic safety guardrails.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-row lg:flex-col gap-3 flex-shrink-0">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md min-w-[150px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Total Evaluated
              </span>
              <span className="text-2xl font-extrabold font-mono text-white mt-0.5 block">
                {summary.total_transactions.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400">Transactions Analyzed</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md min-w-[150px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Safety Guarantee
              </span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5 block">
                100%
              </span>
              <span className="text-[10px] text-slate-400">Policy-Gated Enforcement</span>
            </div>
          </div>
        </div>

        {/* Cinematic Animated Financial Flow Pipeline Widget */}
        <div className="p-5 sm:p-6 rounded-xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase">
                Continuous Revenue Recovery Flow
              </span>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded border border-indigo-800">
              LIVE SIMULATION TELEMETRY
            </span>
          </div>

          {/* 5-Node Animated Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 relative">
            {/* Node 1: Revenue at Risk */}
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex flex-col justify-between group hover:border-rose-500 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wide">01. Leakage</span>
                <AlertCircle className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-xs text-slate-300 font-semibold">Revenue At Risk</p>
              <p className="text-xl font-extrabold text-white font-mono mt-1">
                {formatINR(animatedAtRisk)}
              </p>
              <p className="text-[10px] text-rose-300/80 mt-1">
                {summary.total_at_risk_transactions.toLocaleString()} at-risk txs
              </p>
            </div>

            {/* Node 2: Risk Engine */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between group hover:border-indigo-500 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">02. Diagnosis</span>
                <Activity className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-xs text-slate-300 font-semibold">Risk Engine</p>
              <p className="text-sm font-bold text-slate-200 mt-1">
                Root Cause Parser
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                7 Category Classifier
              </p>
            </div>

            {/* Node 3: AI Intelligence */}
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/60 flex flex-col justify-between group hover:border-indigo-400 transition-all duration-300 relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wide">03. AI Agent</span>
                <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-300 font-semibold">Groq Llama-3.3 70B</p>
              <p className="text-sm font-bold text-indigo-200 mt-1">
                Smart Action Proposal
              </p>
              <p className="text-[10px] text-indigo-300/80 mt-1">
                Contextual Recovery Logic
              </p>
            </div>

            {/* Node 4: Policy Guard */}
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex flex-col justify-between group hover:border-emerald-400 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide">04. Safety Gate</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 font-semibold">Policy Guard</p>
              <p className="text-sm font-bold text-emerald-300 mt-1">
                100% Policy Bounds
              </p>
              <p className="text-[10px] text-emerald-300/80 mt-1">
                Zero Unbounded Action
              </p>
            </div>

            {/* Node 5: Recovery Outcome */}
            <div className="p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-600/60 flex flex-col justify-between group hover:border-emerald-300 transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">05. Realized</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-300 font-semibold">Expected Recovery</p>
              <p className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                {formatINR(animatedExpected)}
              </p>
              <p className="text-[10px] text-emerald-300/80 mt-1">
                Simulated: {formatINR(actualRecovered)}
              </p>
            </div>
          </div>
        </div>

        {/* 4 Primary KPI Performance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition-all duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="uppercase font-bold tracking-wider text-[10px]">Revenue at Risk</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {formatINR(animatedAtRisk)}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Capital exposed across {summary.total_at_risk_transactions.toLocaleString()} transactions
            </p>
          </div>

          {/* KPI 2 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="uppercase font-bold tracking-wider text-[10px]">Expected Recovery</span>
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {formatINR(animatedExpected)}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Deterministic baseline rule projection
            </p>
          </div>

          {/* KPI 3 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="uppercase font-bold tracking-wider text-[10px]">Volume Recovery Rate</span>
              <Percent className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
              {(animatedRecoveryRate * 100).toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              {summary.successful_recoveries.toLocaleString()} of {summary.total_recovery_attempts.toLocaleString()} attempts successful
            </p>
          </div>

          {/* KPI 4 */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/50 transition-all duration-200">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="uppercase font-bold tracking-wider text-[10px]">Revenue Recovery Rate</span>
              <TrendingUp className="w-4 h-4 text-sky-400" />
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-400">
              {(animatedRevenueRate * 100).toFixed(1)}%
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              Simulated: {formatINR(actualRecovered)} realized
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
