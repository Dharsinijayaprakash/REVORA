import React from 'react';
import type { EvaluationSummary } from '../../types/evaluation';
import { useCountUp } from '../../hooks/useCountUp';
import { ArrowDown, AlertTriangle } from 'lucide-react';

interface Page1RevenueAtRiskProps {
  summary: EvaluationSummary;
  onNext: () => void;
}

export const Page1RevenueAtRisk: React.FC<Page1RevenueAtRiskProps> = ({ summary, onNext }) => {
  const atRiskCr = useCountUp(summary.total_revenue_at_risk / 10000000, 1100);
  const atRiskTxs = useCountUp(summary.total_at_risk_transactions, 1200);

  return (
    <section
      id="page-1"
      className="relative w-full h-full flex flex-col justify-between items-center px-6 py-8 pt-20 sm:pt-24 bg-[#F7F4EF] text-[#121212] select-none overflow-hidden"
    >
      {/* Top Question Eyebrow */}
      <div className="flex flex-col items-center gap-2 pt-2 flex-shrink-0">
        <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#C85A3E] uppercase bg-[#C85A3E]/10 px-3 py-1 rounded-full border border-[#C85A3E]/30 flex items-center gap-1.5 whitespace-nowrap">
          <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>01 / REVENUE AT RISK</span>
        </span>
        <h2 className="text-xs font-mono font-bold tracking-widest text-[#777168] uppercase mt-0.5">
          HOW MUCH REVENUE IS AT RISK?
        </h2>
      </div>

      {/* Main Focus: Dominant Revenue Value */}
      <div className="max-w-4xl w-full text-center space-y-4 sm:space-y-6 my-auto px-4">
        <div className="space-y-2">
          <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.3em] text-[#777168] uppercase block">
            TOTAL CAPITAL EXPOSURE
          </span>

          {/* Visually Dominant Value: ₹5.10 Cr */}
          <div className="font-display font-black text-6xl sm:text-8xl lg:text-[110px] tracking-[-0.05em] leading-none text-[#121212]">
            ₹{atRiskCr.toFixed(2)}<span className="text-4xl sm:text-6xl text-[#C85A3E] font-sans ml-2">Cr</span>
          </div>

          <div className="text-sm sm:text-base font-mono font-bold tracking-widest uppercase text-[#C85A3E] pt-1">
            REVENUE AT RISK
          </div>
        </div>

        {/* Sub-value: 2,026 AT-RISK TRANSACTIONS */}
        <div className="pt-2">
          <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-[#EDE6DA]/70 border border-[#D8D0C3]">
            <span className="text-2xl sm:text-3xl font-mono font-black text-[#121212] whitespace-nowrap">
              {Math.round(atRiskTxs).toLocaleString()}
            </span>
            <div className="text-left border-l border-[#D8D0C3] pl-4">
              <span className="text-[10px] font-mono font-bold text-[#777168] uppercase tracking-wider block whitespace-nowrap">
                FAILURE VOLUME
              </span>
              <span className="text-xs font-mono font-bold text-[#121212] uppercase tracking-wide block whitespace-nowrap">
                AT-RISK TRANSACTIONS
              </span>
            </div>
          </div>
        </div>

        {/* Simple visual representation of revenue flowing into risk */}
        <div className="w-full max-w-md mx-auto pt-4 sm:pt-6">
          <div className="relative h-10 flex flex-col justify-center">
            {/* Ambient Flow Track */}
            <div className="w-full h-1.5 bg-[#EDE6DA] rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-[#121212] via-[#C85A3E] to-[#C89A4A] rounded-full w-full animate-flow-dash" />
            </div>
            {/* Flow Markers */}
            <div className="flex justify-between text-[10px] font-mono text-[#777168] px-1 mt-2">
              <span className="whitespace-nowrap">NORMAL STREAM</span>
              <span className="text-[#C85A3E] font-bold whitespace-nowrap">LEAKAGE DIVERSION</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Swipe Indicator */}
      <div className="pb-3 flex-shrink-0">
        <button
          onClick={onNext}
          className="inline-flex flex-col items-center gap-1.5 px-4 py-2 text-[11px] font-mono tracking-widest text-[#777168] hover:text-[#121212] transition-colors cursor-pointer group"
        >
          <span className="tracking-[0.25em] font-bold">SWIPE</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-[#C85A3E]" />
        </button>
      </div>
    </section>
  );
};
