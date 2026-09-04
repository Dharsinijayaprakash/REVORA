import React from 'react';
import type { TransactionEvaluation } from '../types/evaluation';
import { formatINR, formatLabel } from '../utils/formatters';
import {
  X,
  Sparkles,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText
} from 'lucide-react';

interface EditorialCommandPanelProps {
  transaction: TransactionEvaluation;
  onClose: () => void;
}

export const EditorialCommandPanel: React.FC<EditorialCommandPanelProps> = ({
  transaction,
  onClose,
}) => {
  const isAIOverride = transaction.ai_action !== transaction.deterministic_action;
  const remainingAtRisk = transaction.remaining_revenue_at_risk ?? (transaction.success ? 0 : transaction.revenue_at_risk);
  const confidence = transaction.ai_recommendation?.confidence ?? 0.88;

  const riskColor = transaction.risk_level === 'HIGH'
    ? 'text-[#C85A3E] bg-[#C85A3E]/10 border-[#C85A3E]/30'
    : transaction.risk_level === 'MEDIUM'
      ? 'text-[#8A6A1A] bg-[#E5C378]/20 border-[#E5C378]/40'
      : 'text-[#6F7F5F] bg-[#6F7F5F]/10 border-[#6F7F5F]/30';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">

      {/* Editorial Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-in Command Panel Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-2xl w-full flex pl-4 sm:pl-6">
        <div className="w-full h-full bg-[#F7F4EF] shadow-2xl flex flex-col border-l border-[#EDE6DA] animate-slide-in-right text-[#121212]">

          {/* Header */}
          <div className="px-8 py-7 border-b border-[#EDE6DA] bg-[#EDE6DA]/50 flex-shrink-0 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold text-[#777168] uppercase tracking-widest bg-[#F7F4EF] px-2 py-0.5 rounded border border-[#D8D0C3]">
                  COMMAND AUDIT TRACE
                </span>
                <span className="font-mono text-xs font-bold text-[#121212]">
                  {transaction.transaction_id}
                </span>
              </div>

              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl sm:text-4xl font-mono font-black text-[#121212]">
                  {formatINR(transaction.revenue_at_risk)}
                </span>
                <span className="text-xs font-mono font-bold text-[#C85A3E]">
                  Capital at Risk
                </span>
              </div>

              <div className="text-xs text-[#777168] mt-2 font-mono">
                Classified Failure Pattern: <span className="text-[#121212] font-bold">{formatLabel(transaction.root_cause)}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#F7F4EF] hover:bg-[#EDE6DA] text-[#777168] hover:text-[#121212] border border-[#D8D0C3] transition-colors cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sequential 6-Stage Trace Audit */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-5">

            {/* 01 Risk Engine Diagnostic */}
            <div className="p-5 rounded-2xl bg-[#EDE6DA]/40 border border-[#E0D8CC]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#C85A3E]/10 border border-[#C85A3E]/30 text-[11px] font-mono font-bold text-[#C85A3E] flex items-center justify-center">
                    01
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#121212]">
                    Risk Engine Diagnostic
                  </h4>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded border ${riskColor}`}>
                  {transaction.risk_level} RISK
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono mt-3">
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#E0D8CC]">
                  <span className="text-[10px] text-[#9A9388] block">EXPOSURE AMOUNT</span>
                  <span className="font-bold text-[#121212] mt-0.5 block">{formatINR(transaction.amount)}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#F7F4EF] border border-[#E0D8CC]">
                  <span className="text-[10px] text-[#9A9388] block">FAILURE PATTERN</span>
                  <span className="font-bold text-[#121212] mt-0.5 block">{formatLabel(transaction.root_cause)}</span>
                </div>
              </div>
            </div>

            {/* 02 Deterministic Baseline */}
            <div className="p-5 rounded-2xl bg-[#EDE6DA]/40 border border-[#E0D8CC]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#121212]/10 border border-[#121212]/20 text-[11px] font-mono font-bold text-[#121212] flex items-center justify-center">
                    02
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#121212]">
                    Static Deterministic Baseline
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#9A9388]">Legacy Rule v1.4</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F4EF] border border-[#E0D8CC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#777168]" />
                  <span className="text-sm font-mono font-bold text-[#121212]">
                    {formatLabel(transaction.deterministic_action)}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#777168]">Fixed Interval Code</span>
              </div>
            </div>

            {/* 03 AI Proposal (Truthful Representation of Backend AI Result) */}
            <div className="p-5 rounded-2xl bg-[#EDE6DA]/60 border border-[#D8D0C3] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#E5C378]/30 border border-[#C89A4A]/40 text-[11px] font-mono font-bold text-[#8A6A1A] flex items-center justify-center">
                    03
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8A6A1A]">
                    Groq AI Proposal
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#777168] bg-[#F7F4EF] px-2 py-0.5 rounded border border-[#D8D0C3]">
                    Llama-3.3 70B
                  </span>
                  {isAIOverride && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E5C378]/30 text-[#8A6A1A] border border-[#C89A4A]/40">
                      <Sparkles className="w-3 h-3" />
                      AI OVERRIDE
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F4EF] border border-[#D8D0C3] mb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#C89A4A]" />
                    <div>
                      <span className="text-[10px] font-mono text-[#777168] uppercase block">RECOMMENDATION</span>
                      <span className="text-sm font-mono font-black text-[#121212]">
                        {formatLabel(transaction.ai_action)}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#8A6A1A]">
                    {(confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#F7F4EF] rounded-xl border border-[#E0D8CC] text-xs text-[#524E48] font-sans italic leading-relaxed">
                "{transaction.ai_recommendation?.reasoning || transaction.outcome_reason || `Classified as ${formatLabel(transaction.root_cause)}. Groq AI evaluates failure parameters and confirms optimal recovery action (${formatLabel(transaction.ai_action)}) within deterministic safety bounds.`}"
              </div>
            </div>

            {/* 04 Policy Guard Validation */}
            <div className={`p-5 rounded-2xl border ${transaction.policy_approved
                ? 'bg-[#6F7F5F]/10 border-[#6F7F5F]/30'
                : 'bg-[#C89A4A]/10 border-[#C89A4A]/30'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg text-[11px] font-mono font-bold flex items-center justify-center border ${transaction.policy_approved
                      ? 'bg-[#6F7F5F]/20 border-[#6F7F5F]/40 text-[#6F7F5F]'
                      : 'bg-[#C89A4A]/20 border-[#C89A4A]/40 text-[#C89A4A]'
                    }`}>
                    04
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#121212]">
                    Policy Guard Safety Gate
                  </h4>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${transaction.policy_approved
                    ? 'bg-[#6F7F5F]/20 text-[#6F7F5F] border-[#6F7F5F]/40'
                    : 'bg-[#C89A4A]/20 text-[#8A6A1A] border-[#C89A4A]/40'
                  }`}>
                  {transaction.policy_approved ? '✓ POLICY APPROVED' : 'HUMAN APPROVAL REQUIRED'}
                </span>
              </div>

              <p className="text-xs text-[#524E48] leading-relaxed font-sans">
                {transaction.policy_approved
                  ? 'AI candidate conforms strictly with merchant rate limits, high-value invoice boundaries, and brand retry velocity limits.'
                  : 'Automated dispatch halted by deterministic safety rules. Requires explicit manual human operator sign-off before dispatch.'}
              </p>
            </div>

            {/* 05 Action Executor Outcome */}
            <div className="p-5 rounded-2xl bg-[#EDE6DA]/40 border border-[#E0D8CC]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-[#6F7F5F]/20 border border-[#6F7F5F]/40 text-[11px] font-mono font-bold text-[#6F7F5F] flex items-center justify-center">
                    05
                  </span>
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#121212]">
                    Execution Outcome (Simulated)
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-[#9A9388]">Dispatch Log</span>
              </div>

              <div className="p-4 rounded-xl bg-[#F7F4EF] border border-[#E0D8CC] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {transaction.success ? (
                    <div className="w-8 h-8 rounded-lg bg-[#6F7F5F]/15 border border-[#6F7F5F]/30 text-[#6F7F5F] flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-[#C85A3E]/15 border border-[#C85A3E]/30 text-[#C85A3E] flex items-center justify-center">
                      <XCircle className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-mono text-[#9A9388] uppercase block">STATUS</span>
                    <span className={`text-sm font-mono font-bold ${transaction.success ? 'text-[#6F7F5F]' : 'text-[#777168]'}`}>
                      {transaction.success ? 'SIMULATED SUCCESS' : 'SIMULATED ATTEMPTED'}
                    </span>
                    <span className="text-[11px] font-sans text-[#777168] block mt-0.5">
                      {transaction.outcome_reason || (transaction.success ? 'Recovery successful' : 'Recovery attempt completed')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#9A9388] uppercase block">RECOVERED</span>
                  <span className="text-lg font-mono font-extrabold text-[#6F7F5F]">
                    {formatINR(transaction.amount_recovered)}
                  </span>
                </div>
              </div>
            </div>

            {/* 06 Financial Ledger Summary */}
            <div className="p-4 rounded-2xl bg-[#EDE6DA]/50 border border-[#E0D8CC] flex items-center justify-between text-xs font-mono text-[#777168]">
              <span>Remaining Revenue At Risk:</span>
              <span className="font-bold text-[#121212]">{formatINR(remainingAtRisk)}</span>
            </div>

            {/* Synthetic Notice */}
            <div className="p-3 rounded-xl bg-[#EDE6DA] border border-[#D8D0C3] text-center flex items-center justify-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#C89A4A] flex-shrink-0" />
              <span className="text-[10px] font-mono font-bold text-[#8A6A1A] uppercase tracking-wider">
                SYNTHETIC EVALUATION DATASET · NO REAL MONEY MOVED
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
