import React from 'react';
import type { TransactionEvaluation } from '../types/evaluation';
import { 
  X, 
  ShieldCheck, 
  Sparkles, 
  Bot, 
  Cpu, 
  Cog, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ShieldAlert,
  FileText
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { AuditTimeline } from './AuditTimeline';
import { formatLabel, formatINR } from '../utils/formatters';

interface TransactionDetailProps {
  transaction: TransactionEvaluation;
  onClose: () => void;
}

export const TransactionDetail: React.FC<TransactionDetailProps> = ({ 
  transaction, 
  onClose 
}) => {
  const isAIOverride = transaction.ai_action !== transaction.deterministic_action;
  const remainingAtRisk = transaction.remaining_revenue_at_risk ?? (transaction.success ? 0 : transaction.revenue_at_risk);
  const confidence = transaction.ai_recommendation?.confidence ?? 0.60;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Cinematic Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Slide-in Right Panel */}
      <div className="fixed inset-y-0 right-0 max-w-2xl w-full flex pl-6">
        <div className="w-full h-full bg-[#f8f9fb] shadow-2xl flex flex-col transform transition-all duration-350 border-l border-slate-200 animate-slide-in-right">
          
          {/* Panel Header */}
          <div className="px-6 py-5 border-b border-slate-200 bg-white flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                    Transaction
                  </span>
                  <span className="font-mono text-sm font-extrabold text-slate-900">
                    {transaction.transaction_id}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                    GROQ AI PROCESSED
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    {formatINR(transaction.revenue_at_risk)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Revenue at Risk
                  </span>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors"
                aria-label="Close transaction details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Panel Content (Sequential Reveal Sections) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* 1. Risk Assessment */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  01. Risk Assessment
                </h3>
                <StatusBadge type="risk" value={transaction.risk_level} />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Root Cause Classification</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {formatLabel(transaction.root_cause)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-500">Exposure Capital</p>
                  <p className="text-sm font-bold text-rose-600 font-mono mt-0.5">
                    {formatINR(transaction.revenue_at_risk)}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded bg-slate-50 text-slate-600">
                  <span className="font-semibold block text-slate-400">Total Amount:</span>
                  <span className="font-mono font-bold text-slate-800">{formatINR(transaction.amount)}</span>
                </div>
                <div className="p-2 rounded bg-slate-50 text-slate-600">
                  <span className="font-semibold block text-slate-400">Policy Category:</span>
                  <span className="font-bold text-slate-800">{formatLabel(transaction.root_cause)}</span>
                </div>
              </div>
            </div>

            {/* 2. Deterministic Baseline vs AI Intelligence */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cog className="w-3.5 h-3.5 text-slate-500" />
                  02. Baseline vs AI Proposal
                </h3>
                {isAIOverride && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-600 text-white shadow-xs">
                    <Sparkles className="w-3 h-3" />
                    AI OVERRIDE
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Baseline */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Deterministic Baseline
                  </span>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-bold text-slate-800">
                      {formatLabel(transaction.deterministic_action)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block font-mono">Standard Rule v1.4</span>
                </div>

                {/* AI Proposal */}
                <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block">
                      Groq AI Recommendation
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-700">
                      {(confidence * 100).toFixed(0)}% Conf
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-extrabold text-indigo-950">
                      {formatLabel(transaction.ai_action)}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-indigo-200 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${confidence * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="p-3 bg-indigo-50/30 rounded-lg border border-indigo-100">
                <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider mb-1">
                  Agentic Diagnostic Reasoning
                </p>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  "{transaction.ai_recommendation?.reasoning || transaction.outcome_reason || `Classified as ${formatLabel(transaction.root_cause)}. Dynamic retry logic adjusts execution cadence to maximize recovery probability within safety bounds.`}"
                </p>
              </div>
            </div>

            {/* 3. Decision Modification Path (when override exists) */}
            {isAIOverride && (
              <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
                    Decision Modification Flow
                  </span>
                  <span className="text-[9px] font-mono bg-indigo-900 text-indigo-200 px-1.5 py-0.5 rounded">
                    POLICY VALIDATED
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-800 border border-slate-700">
                    <span className="text-[9px] text-slate-400 block font-semibold">BASELINE</span>
                    <span className="font-bold text-slate-200 mt-1 block truncate">
                      {formatLabel(transaction.deterministic_action)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-indigo-600 border border-indigo-500">
                    <span className="text-[9px] text-indigo-200 block font-semibold">AI PROPOSAL</span>
                    <span className="font-extrabold text-white mt-1 block truncate">
                      {formatLabel(transaction.ai_action)}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-emerald-900/60 border border-emerald-700">
                    <span className="text-[9px] text-emerald-300 block font-semibold">GUARD</span>
                    <span className="font-bold text-emerald-200 mt-1 block">
                      {transaction.policy_approved ? 'APPROVED' : 'GATED'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-400 block font-semibold">FINAL</span>
                    <span className="font-bold text-white mt-1 block truncate">
                      {formatLabel(transaction.final_action)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Policy Guard Safety Gate */}
            <div className={`rounded-xl border p-5 shadow-xs ${
              transaction.policy_approved 
                ? 'bg-emerald-50/40 border-emerald-200' 
                : 'bg-amber-50/40 border-amber-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className={`w-4 h-4 ${transaction.policy_approved ? 'text-emerald-600' : 'text-amber-600'}`} />
                  <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                    03. Policy Guard Safety Gate
                  </h3>
                </div>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                  transaction.policy_approved 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {transaction.policy_approved ? '✓ APPROVED' : 'HUMAN APPROVAL REQUIRED'}
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed">
                {transaction.policy_approved 
                  ? 'AI recommendation meets all safety rules (retry limits, customer fatigue limits, and frequency windows). Approved for automated dispatch.'
                  : 'Action halted by deterministic guardrails. Requires manual operator verification before financial execution.'}
              </p>
            </div>

            {/* 5. Recovery Outcome */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                04. Recovery Outcome (Simulated)
              </h3>

              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-100 mb-3">
                <div className="flex items-center gap-2.5">
                  {transaction.success ? (
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Simulated Result</p>
                    <p className={`text-sm font-extrabold ${transaction.success ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {transaction.success ? 'SIMULATED SUCCESS' : 'SIMULATED FAILURE / SKIPPED'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Recovered</p>
                  <p className="text-xl font-mono font-extrabold text-emerald-600">
                    {formatINR(transaction.amount_recovered)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-600 px-1">
                <span>Remaining Revenue at Risk:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatINR(remainingAtRisk)}
                </span>
              </div>
            </div>

            {/* 6. REVORA Safety Architecture Hero Component */}
            <div className="bg-[#0b0f17] text-white rounded-xl p-5 shadow-lg border border-slate-800">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-extrabold tracking-wider text-white">REVORA SAFETY LAYER</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  BOUNDED & EXPLAINABLE
                </span>
              </div>

              {/* 3 Step Flow */}
              <div className="grid grid-cols-3 gap-2 text-center relative my-4">
                <div className="p-2.5 rounded-lg bg-indigo-950/70 border border-indigo-800 flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-300 uppercase">1. AI Proposes</span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/70 border border-emerald-800 flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-300 uppercase">2. Guard Validates</span>
                </div>

                <div className="p-2.5 rounded-lg bg-sky-950/70 border border-sky-800 flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-md bg-sky-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-sky-300 uppercase">3. Executor Acts</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 text-center leading-relaxed mt-3">
                Every recovery action is bounded, explainable, policy-gated and auditable. AI cannot independently execute without deterministic policy validation.
              </p>
            </div>

            {/* 7. Audit Trail Vertical Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  05. Sequential Audit Timeline
                </h3>
                <span className="text-[10px] font-mono text-slate-400">
                  6-Stage Non-Repudiation Log
                </span>
              </div>
              <AuditTimeline transaction={transaction} />
            </div>

            {/* 8. Synthetic Warning Banner */}
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200/80 text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                SYNTHETIC EVALUATION • NO REAL MONEY MOVED
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
