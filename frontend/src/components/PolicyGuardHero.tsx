import React from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { 
  ShieldCheck, 
  UserCheck, 
  OctagonX, 
  CheckCircle2, 
  Lock, 
} from 'lucide-react';

interface PolicyGuardHeroProps {
  summary: EvaluationSummary;
}

export const PolicyGuardHero: React.FC<PolicyGuardHeroProps> = ({ summary }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs relative overflow-hidden">
      {/* Background soft ambient tint */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              DETERMINISTIC TRUST LAYER
            </span>
            <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              Zero Unbounded Actions
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Policy Guard: The Deterministic Safety Barrier
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Generative AI models propose contextual recovery actions, but Policy Guard deterministically enforces hard bounds on frequency, amount thresholds, and human review before execution.
          </p>
        </div>

        {/* Shield Icon with Animated Rings */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center p-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm">
            <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 animate-ping opacity-30 pointer-events-none" />
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* 3 Metric Trust Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Policy Compliance
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-0.5">
              100%
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Zero unvalidated actions executed</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
              Human Approvals Required
            </span>
            <p className="text-2xl font-extrabold text-purple-950 font-mono mt-0.5">
              {summary.human_approval_count}
            </p>
            <p className="text-[11px] text-purple-700/80 mt-0.5">High-exposure invoices gated</p>
          </div>
          <div className="p-2.5 rounded-lg bg-purple-100 text-purple-700">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Automated Safety Stops
            </span>
            <p className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
              {summary.stopped_count}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Halted to prevent customer fatigue</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-200 text-slate-700">
            <OctagonX className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active Deterministic Rules Snapshot */}
      <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Active Enforced Policy Guard Rules
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Deterministic Engine v2.0</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="font-bold text-emerald-400 text-[11px]">Rule PG-01: Retry Limits</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Max 3 automated attempts in 72h window.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="font-bold text-purple-300 text-[11px]">Rule PG-02: ₹25k Review Threshold</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Large overdue receivables require operator approval.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800">
            <p className="font-bold text-sky-300 text-[11px]">Rule PG-03: Hard Mandate Halts</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Permanent account errors stop immediately.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
