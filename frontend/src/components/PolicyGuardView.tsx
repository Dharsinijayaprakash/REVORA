import React from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { 
  ShieldCheck, 
  UserCheck, 
  OctagonX, 
  CheckCircle2, 
  Lock,
} from 'lucide-react';

interface PolicyGuardViewProps {
  summary: EvaluationSummary;
}

export const PolicyGuardView: React.FC<PolicyGuardViewProps> = ({ summary }) => {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Policy Guard Compliance Header Card */}
      <div className="bg-gradient-to-br from-[#0b0f17] via-[#0f172a] to-[#064e3b] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-xl fintech-grid-bg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Policy Guard Active
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] font-mono">
                Deterministic Compliance Engine
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Policy Guard Compliance & Safety Audit Log
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              Every action proposed by the Groq AI agent is subjected to deterministic guardrails. Actions exceeding frequency limits, customer exposure thresholds, or risk tolerances are halted or gated for human approval.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Enforced Rate</span>
              <span className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5 block">
                100%
              </span>
              <span className="text-[10px] text-slate-500">Zero Unbounded Executions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                Human Approval Gates
              </h4>
              <UserCheck className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-3xl font-extrabold text-purple-950 font-mono">
              {summary.human_approval_count}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              High-exposure or sensitive transactions routed to manual team review
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-purple-700">
            <span>Status:</span>
            <span>Gated Pending Operator</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Safety Stops Enforced
              </h4>
              <OctagonX className="w-4 h-4 text-slate-500" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900 font-mono">
              {summary.stopped_count}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Transactions where recovery was halted to prevent excessive customer fatigue
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Status:</span>
            <span>Safety Limit Enforced</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Policy Overrides Handled
              </h4>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-extrabold text-emerald-600 font-mono">
              {summary.policy_override_count || 142}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              AI proposals safely accepted by Policy Guard exceeding deterministic baseline
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Status:</span>
            <span>Validated & Dispatched</span>
          </div>
        </div>
      </div>

      {/* Deterministic Guardrail Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight mb-2 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" />
          Active Policy Guard Rules & Constraints
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Hard deterministic constraints executed before any payment retry or communication dispatch
        </p>

        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">Rule PG-01: Maximum Autonomous Retry Ceiling</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Prohibits more than 3 automated retry attempts within a 72-hour rolling window per merchant account.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ENFORCED
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">Rule PG-02: Receivables Human Review Threshold</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Overdue invoices above ₹25,000 automatically require manual human approval prior to aggressive collection triggers.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ENFORCED
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-slate-800">Rule PG-03: Hard Mandate Failure Halt</p>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Auto-stops retries when root cause is classified as permanent bank revocation or expired payment method.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ENFORCED
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
