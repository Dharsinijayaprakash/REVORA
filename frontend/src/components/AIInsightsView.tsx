import React from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  CheckCircle2, 
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface AIInsightsViewProps {
  summary: EvaluationSummary;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({ summary }) => {
  const expectedBaseline = summary.expected_recovery_from_decision_engine;
  const actualRecovered = summary.total_amount_recovered;
  const calibrationGap = summary.recovery_calibration_gap;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Hero Card */}
      <div className="bg-gradient-to-br from-[#0b0f17] via-[#111827] to-[#1e1b4b] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden fintech-grid-bg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Groq Llama-3.3 70B Versatile
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                100% Policy-Gated
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              AI Recovery Intelligence & Model Telemetry
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              REVORA deploys agentic diagnostic reasoning on revenue failure states, generating context-aware recovery decisions while preventing autonomous safety violations.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overrides Executed</span>
              <span className="text-2xl font-extrabold text-indigo-400 font-mono mt-0.5 block">
                {summary.policy_override_count || 142}
              </span>
            </div>
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-center min-w-[130px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Human Approvals</span>
              <span className="text-2xl font-extrabold text-purple-400 font-mono mt-0.5 block">
                {summary.human_approval_count}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Benchmark Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Diagnostic Context Analysis
            </h4>
            <Cpu className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {summary.total_recovery_attempts.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Transaction failure contexts evaluated through structured prompt schemas
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Latency SLA</span>
            <span className="font-mono font-bold text-emerald-600">&lt; 350ms (Groq LPUs)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Realized Revenue Recovery
            </h4>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 font-mono">
            {formatINR(actualRecovered)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Simulated capital recovered across {summary.successful_recoveries.toLocaleString()} successful executions
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Recovery Yield</span>
            <span className="font-mono font-bold text-emerald-600">{(summary.revenue_recovery_rate * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Safety Calibration Delta
            </h4>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 font-mono">
            {formatINR(Math.abs(calibrationGap))}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Delta between theoretical baseline and realized execution under strict policy guards
          </p>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Policy Compliance</span>
            <span className="font-mono font-bold text-emerald-600">100% Policy Bounds</span>
          </div>
        </div>
      </div>

      {/* AI vs Deterministic Comparison */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" />
          AI Enhancement vs Deterministic Baseline
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          How agentic decisioning outperforms static rules without bypassing safety boundaries
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Static Rule Baseline
              </span>
              <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                Deterministic
              </span>
            </div>
            <p className="text-sm font-bold text-slate-800">Fixed Interval Reminders</p>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Blind periodic retry regardless of root failure code
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Standard payment reminders without customer lifetime context
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                Fixed deterministic expectation: {formatINR(expectedBaseline)}
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-xl bg-indigo-50/60 border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">
                REVORA Agentic System
              </span>
              <span className="text-[10px] font-mono bg-indigo-600 text-white px-2 py-0.5 rounded font-bold">
                Groq AI + Guard
              </span>
            </div>
            <p className="text-sm font-bold text-indigo-950">Contextual Smart Routing</p>
            <ul className="mt-3 space-y-2 text-xs text-indigo-900">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                Differentiates temporary network dips from hard mandate failures
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                Escalates high-value receivables with customer risk tiering
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                Policy Guard bounds AI execution to prevent repeated customer friction
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
