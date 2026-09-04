import React from 'react';
import type { EvaluationSummary } from '../../types/evaluation';
import { ArrowDown, AlertTriangle, TrendingUp } from 'lucide-react';

interface Page6RecoveryProps {
  summary: EvaluationSummary;
  onNext: () => void;
}

export const Page6Recovery: React.FC<Page6RecoveryProps> = ({ summary, onNext }) => {
  const totalAttempts = summary.total_recovery_attempts || 1522;
  const successfulRecoveries = summary.successful_recoveries || 654;
  const recoveryRate = summary.recovery_rate ? `${(summary.recovery_rate * 100).toFixed(2)}%` : '42.97%';
  const simulatedRecoveryCr = summary.total_amount_recovered ? (summary.total_amount_recovered / 10000000).toFixed(2) : '1.65';
  const expectedRecoveryCr = summary.expected_recovery_from_decision_engine ? (summary.expected_recovery_from_decision_engine / 10000000).toFixed(2) : '2.35';

  return (
    <section
      id="page-6"
      className="relative w-full h-full flex flex-col justify-between items-center px-6 py-8 pt-20 sm:pt-24 bg-[#171717] text-[#F7F4EF] select-none overflow-hidden"
    >
      {/* Top Question Eyebrow */}
      <div className="flex flex-col items-center gap-1.5 pt-2 flex-shrink-0 text-center">
        <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#8EA66E] uppercase bg-[#6F7F5F]/20 px-3 py-1 rounded-full border border-[#6F7F5F]/40 flex items-center gap-1.5 whitespace-nowrap">
          <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
          <span>06 / RECOVERY RESULTS</span>
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight uppercase">
          FROM RISK TO RECOVERY
        </h2>
        <p className="text-xs sm:text-sm font-sans text-[#A39A8E] max-w-md leading-snug">
          Measurable recovery yield realized through bounded, deterministic interventions.
        </p>
      </div>

      {/* Main Recovery Dashboard */}
      <div className="max-w-4xl w-full my-auto space-y-3 sm:space-y-4 px-2">
        
        {/* Recovery Journey Flow: AT RISK ↓ ACTION ↓ RECOVERY ATTEMPT ↓ SUCCESS ↓ RECOVERED VALUE */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#24231F] border border-[#35332C] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="font-bold text-[#C85A3E] whitespace-nowrap">AT RISK (₹5.10 Cr)</span>
            <span className="text-[#555044] hidden sm:inline">↓</span>
            <span className="font-bold text-[#E5C378] whitespace-nowrap">ACTION</span>
            <span className="text-[#555044] hidden sm:inline">↓</span>
            <span className="font-bold text-[#D8D0C3] whitespace-nowrap">1,522 ATTEMPTS</span>
            <span className="text-[#555044] hidden sm:inline">↓</span>
            <span className="font-bold text-[#8EA66E] whitespace-nowrap">654 SUCCESSES</span>
            <span className="text-[#555044] hidden sm:inline">↓</span>
            <span className="font-bold text-[#6F7F5F] whitespace-nowrap">~₹1.65 Cr RECOVERED</span>
          </div>
        </div>

        {/* Big 4 Real Metrics Carpet */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          
          <div className="p-4 sm:p-5 rounded-2xl bg-[#24231F] border border-[#35332C] space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase block whitespace-nowrap">
              01 / DISPATCHED
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#F7F4EF] whitespace-nowrap">
              {totalAttempts.toLocaleString()}
            </div>
            <span className="text-xs font-mono font-bold text-[#A39A8E] block whitespace-nowrap">
              RECOVERY ATTEMPTS
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#24231F] border border-[#35332C] space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase block whitespace-nowrap">
              02 / COMPLETED
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#8EA66E] whitespace-nowrap">
              {successfulRecoveries.toLocaleString()}
            </div>
            <span className="text-xs font-mono font-bold text-[#8EA66E] block whitespace-nowrap">
              SUCCESSFUL RECOVERIES
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#24231F] border border-[#35332C] space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase block whitespace-nowrap">
              03 / SUCCESS RATE
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#E5C378] whitespace-nowrap">
              {recoveryRate}
            </div>
            <span className="text-xs font-mono font-bold text-[#E5C378] block whitespace-nowrap">
              RECOVERY RATE
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[#24231F] border border-[#35332C] space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase block whitespace-nowrap">
              04 / REALIZED
            </span>
            <div className="text-2xl sm:text-3xl font-mono font-black text-[#6F7F5F] whitespace-nowrap">
              ~₹{simulatedRecoveryCr} Cr
            </div>
            <span className="text-xs font-mono font-bold text-[#6F7F5F] block whitespace-nowrap">
              SIMULATED RECOVERY
            </span>
          </div>

        </div>

        {/* Expected vs Simulated Comparison Block */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#24231F] border border-[#35332C] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase block whitespace-nowrap">
                EXPECTED RECOVERY TARGET
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-[#E5C378] whitespace-nowrap">
                ₹{expectedRecoveryCr} Cr
              </div>
              <span className="text-[11px] font-mono text-[#A39A8E] whitespace-nowrap">
                Decision engine projected potential
              </span>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase block whitespace-nowrap">
                SIMULATED RECOVERY ACHIEVED
              </span>
              <div className="text-xl sm:text-2xl font-mono font-black text-[#8EA66E] whitespace-nowrap">
                ~₹{simulatedRecoveryCr} Cr
              </div>
              <span className="text-[11px] font-mono text-[#6F7F5F] font-bold whitespace-nowrap">
                70.2% Target Realization
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#1A1916] rounded-full overflow-hidden border border-[#35332C]">
            <div className="h-full bg-gradient-to-r from-[#C89A4A] to-[#6F7F5F] rounded-full w-[70.2%]" />
          </div>
        </div>

        {/* MANDATORY PROMINENT DISCLAIMERS */}
        <div className="p-3 sm:p-3.5 rounded-2xl bg-[#1A1916] border border-[#35332C] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#A39A8E]">
          <div className="flex items-center gap-2 text-[#E5C378]">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold tracking-wider uppercase whitespace-nowrap">
              SIMULATED RECOVERY · SYNTHETIC DATA · NO REAL MONEY MOVED
            </span>
          </div>
          <span className="text-[11px] text-[#777168] whitespace-nowrap">
            Zero real bank funds movement
          </span>
        </div>

      </div>

      {/* Bottom Swipe Indicator */}
      <div className="pb-3 flex-shrink-0">
        <button
          onClick={onNext}
          className="inline-flex flex-col items-center gap-1.5 px-4 py-2 text-[11px] font-mono tracking-widest text-[#777168] hover:text-[#F7F4EF] transition-colors cursor-pointer group"
        >
          <span className="tracking-[0.25em] font-bold">SWIPE</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-[#6F7F5F]" />
        </button>
      </div>
    </section>
  );
};
