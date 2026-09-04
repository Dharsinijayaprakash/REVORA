import React from 'react';
import type { TransactionEvaluation } from '../types/evaluation';
import { formatINR, formatLabel } from '../utils/formatters';
import { StatusBadge } from './StatusBadge';
import { 
  X, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText
} from 'lucide-react';

interface EditorialTransactionDetailProps {
  transaction: TransactionEvaluation;
  onClose: () => void;
}

export const EditorialTransactionDetail: React.FC<EditorialTransactionDetailProps> = ({
  transaction,
  onClose,
}) => {
  const isAIOverride = transaction.ai_action !== transaction.deterministic_action;
  const remainingAtRisk = transaction.remaining_revenue_at_risk ?? (transaction.success ? 0 : transaction.revenue_at_risk);
  const confidence = transaction.ai_recommendation?.confidence ?? 0.60;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Dark Cinematic Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in Investigation Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-2xl w-full flex pl-6">
        <div className="w-full h-full bg-[#0b0e14] shadow-2xl flex flex-col border-l border-white/[0.08] animate-slide-in-right">
          
          {/* Drawer Header */}
          <div className="px-8 py-6 border-b border-white/[0.06] bg-[#0e121a] flex-shrink-0 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  TECHNICAL INVESTIGATION
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {transaction.transaction_id}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  GROQ AI TRACED
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-mono font-black text-white">
                  {formatINR(transaction.revenue_at_risk)}
                </span>
                <span className="text-xs font-mono text-rose-400">
                  Exposed Capital
                </span>
              </div>

              <div className="text-xs text-slate-400 mt-1 font-mono">
                Root Cause: <span className="text-slate-200 font-bold">{formatLabel(transaction.root_cause)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
              aria-label="Close trace"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Content: Sequential 5-Stage Trace */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            
            {/* Stage 01: Risk Ingestion */}
            <div className="glass-panel p-5 rounded-2xl border border-white/[0.06] relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-rose-950 border border-rose-800 text-[10px] font-mono font-bold text-rose-400 flex items-center justify-center">
                    01
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Risk Engine Diagnostic
                  </h4>
                </div>
                <StatusBadge type="risk" value={transaction.risk_level} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono mt-3">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 block">TOTAL TRANSACTION</span>
                  <span className="font-bold text-white mt-0.5 block">{formatINR(transaction.amount)}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.04]">
                  <span className="text-[10px] text-slate-500 block">CLASSIFIED CAUSE</span>
                  <span className="font-bold text-white mt-0.5 block">{formatLabel(transaction.root_cause)}</span>
                </div>
              </div>
            </div>

            {/* Stage 02: Baseline Comparison */}
            <div className="glass-panel p-5 rounded-2xl border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-[10px] font-mono font-bold text-slate-400 flex items-center justify-center">
                    02
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Static Deterministic Baseline
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Legacy Rule v1.4</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-mono font-bold text-slate-200">
                    {formatLabel(transaction.deterministic_action)}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Fixed Interval</span>
              </div>
            </div>

            {/* Stage 03: AI Agent Proposal */}
            <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/30 to-slate-950/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-700 text-[10px] font-mono font-bold text-indigo-300 flex items-center justify-center">
                    03
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300">
                    Groq AI Agentic Proposal
                  </h4>
                </div>
                {isAIOverride && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-600 text-white shadow-sm">
                    <Sparkles className="w-3 h-3" />
                    AI OVERRIDE
                  </span>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/90 border border-indigo-500/20 mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm font-mono font-extrabold text-white">
                      {formatLabel(transaction.ai_action)}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {(confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-800/40 text-xs text-slate-300 font-sans italic leading-relaxed">
                "{transaction.ai_recommendation?.reasoning || transaction.outcome_reason || `Classified as ${formatLabel(transaction.root_cause)}. Dynamic retry logic adjusts execution cadence to maximize recovery probability within safety bounds.`}"
              </div>
            </div>

            {/* Stage 04: Policy Guard Safety Gate */}
            <div className={`p-5 rounded-2xl border ${
              transaction.policy_approved 
                ? 'bg-emerald-950/20 border-emerald-500/30' 
                : 'bg-amber-950/20 border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full text-[10px] font-mono font-bold flex items-center justify-center border ${
                    transaction.policy_approved 
                      ? 'bg-emerald-950 border-emerald-700 text-emerald-300' 
                      : 'bg-amber-950 border-amber-700 text-amber-300'
                  }`}>
                    04
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                    Policy Guard Safety Gate
                  </h4>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                  transaction.policy_approved 
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                    : 'bg-amber-950 text-amber-300 border-amber-800'
                }`}>
                  {transaction.policy_approved ? '✓ POLICY APPROVED' : 'HUMAN APPROVAL REQUIRED'}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {transaction.policy_approved 
                  ? 'AI recommendation adheres to all active retry caps, merchant thresholds, and frequency rules. Approved for automated execution dispatch.'
                  : 'Action halted by deterministic guardrails. Requires manual operator verification before financial execution.'}
              </p>
            </div>

            {/* Stage 05: Executor Outcome */}
            <div className="glass-panel p-5 rounded-2xl border border-white/[0.06]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-950 border border-teal-700 text-[10px] font-mono font-bold text-teal-300 flex items-center justify-center">
                    05
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                    Execution Outcome (Simulated)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-500">Ledger Entry</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {transaction.success ? (
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">STATUS</span>
                    <span className={`text-sm font-mono font-bold ${transaction.success ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {transaction.success ? 'SIMULATED SUCCESS' : 'SIMULATED SKIPPED / PENDING'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">RECOVERED</span>
                  <span className="text-lg font-mono font-extrabold text-emerald-400">
                    {formatINR(transaction.amount_recovered)}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Remaining Revenue at Risk:</span>
                <span className="font-bold text-white">{formatINR(remainingAtRisk)}</span>
              </div>
            </div>

            {/* Synthetic Banner */}
            <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
                SYNTHETIC EVALUATION • NO REAL MONEY MOVED
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
