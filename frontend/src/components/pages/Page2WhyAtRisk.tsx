import React, { useState } from 'react';
import type { EvaluationSummary } from '../../types/evaluation';
import { formatINR, formatLabel } from '../../utils/formatters';
import { ArrowDown, Activity, ChevronRight } from 'lucide-react';

interface Page2WhyAtRiskProps {
  summary: EvaluationSummary;
  onNext: () => void;
}

export const Page2WhyAtRisk: React.FC<Page2WhyAtRiskProps> = ({ summary, onNext }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  // Process causes from real backend data
  const rawCauses = Object.entries(summary.root_cause_performance || {}).map(([key, metrics]) => ({
    key,
    label: formatLabel(key),
    recovered: metrics.recovered,
    attempts: metrics.attempts,
    successes: metrics.successes,
    successRate: metrics.attempts > 0 ? (metrics.successes / metrics.attempts) * 100 : 0,
  }));

  const totalSum = rawCauses.reduce((acc, c) => acc + c.recovered, 0) || 1;
  const maxAmount = Math.max(...rawCauses.map((c) => c.recovered), 1);

  const causes = rawCauses
    .map((c) => ({
      ...c,
      share: (c.recovered / totalSum) * 100,
    }))
    .sort((a, b) => b.recovered - a.recovered);

  const activeCause = causes.find((c) => c.key === hoveredKey) || causes[0];

  return (
    <section
      id="page-2"
      className="relative w-full h-full flex flex-col justify-between items-center px-6 py-8 pt-20 sm:pt-24 bg-[#171717] text-[#F7F4EF] select-none overflow-hidden"
    >
      {/* Top Question Eyebrow — Dominant, Clean & Spacious */}
      <div className="flex flex-col items-center gap-2 pt-3 flex-shrink-0 text-center">
        <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#C89A4A] uppercase bg-[#C89A4A]/10 px-3 py-1 rounded-full border border-[#C89A4A]/25 flex items-center gap-1.5 whitespace-nowrap">
          <Activity className="w-3.5 h-3.5 flex-shrink-0 text-[#C89A4A]" />
          <span>02 / DIAGNOSIS</span>
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight uppercase mt-1">
          WHY IS REVENUE AT RISK?
        </h2>

        <p className="text-xs sm:text-sm font-sans text-[#777168] max-w-lg leading-relaxed">
          Six distinct failure patterns diagnosed across the active payment stream.
        </p>
      </div>

      {/* Visual Connected Flow Streams — Breathing Room & Clear Hierarchy */}
      <div className="max-w-4xl w-full my-auto space-y-4 px-2">
        
        {/* Subtle Architectural Flow Line (Replaces heavy competing badge box) */}
        <div className="flex items-center justify-between px-4 py-2 text-xs font-mono text-[#777168] border-b border-[#2C2A24]">
          <span className="whitespace-nowrap">
            EXPOSURE: <strong className="text-[#D8D0C3] font-bold">₹5.10 Cr</strong>
          </span>
          <span className="text-[#45423B] hidden sm:inline">———</span>
          <span className="whitespace-nowrap text-[#A39A8E]">
            6 DIAGNOSED VECTORS
          </span>
          <span className="text-[#45423B] hidden sm:inline">———</span>
          <span className="whitespace-nowrap">
            VOLUME: <strong className="text-[#D8D0C3] font-bold">2,026 TXS</strong>
          </span>
        </div>

        {/* 6 Root-Cause Vectors Grid — Calm, Scannable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {causes.slice(0, 6).map((cause, idx) => {
            const isHovered = (hoveredKey === cause.key) || (!hoveredKey && idx === 0);
            const barWidth = Math.max((cause.recovered / maxAmount) * 100, 10);

            return (
              <div
                key={cause.key}
                onMouseEnter={() => setHoveredKey(cause.key)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isHovered
                    ? 'bg-[#24231F] border-[#E5C378]/60 shadow-lg'
                    : 'bg-[#1C1B18]/60 hover:bg-[#24231F]/80 border-[#2C2A24]'
                }`}
              >
                {/* Primary Card Row: Rank + Category Name + Share % */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold text-[#555044] flex-shrink-0">
                      0{idx + 1}
                    </span>
                    <span className={`text-xs sm:text-sm font-mono font-bold truncate transition-colors ${
                      isHovered ? 'text-[#F7F4EF]' : 'text-[#D8D0C3]'
                    }`}>
                      {cause.label}
                    </span>
                  </div>

                  <span className={`text-xs font-mono font-bold flex-shrink-0 whitespace-nowrap transition-colors ${
                    isHovered ? 'text-[#E5C378]' : 'text-[#A39A8E]'
                  }`}>
                    {cause.share.toFixed(1)}%
                  </span>
                </div>

                {/* Quiet Slim Stream Indicator Bar */}
                <div className="w-full h-1 bg-[#141311] rounded-full overflow-hidden my-2">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isHovered
                        ? 'bg-gradient-to-r from-[#C85A3E] via-[#C89A4A] to-[#6F7F5F]'
                        : 'bg-[#C89A4A]/40'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Subdued Secondary Metadata — Calm, Does Not Shout */}
                <div className="flex items-center justify-between text-[10.5px] font-mono pt-1 text-[#777168]">
                  <span className="whitespace-nowrap">{cause.attempts.toLocaleString()} at-risk txs</span>
                  <span className={`whitespace-nowrap transition-colors ${isHovered ? 'text-[#D8D0C3]' : 'text-[#777168]'}`}>
                    {formatINR(cause.recovered)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Vector Detail Strip — Clean Inspection on Hover */}
        {activeCause && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-[#24231F]/90 border border-[#35332C] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="text-[10px] font-bold text-[#777168] uppercase tracking-wider whitespace-nowrap">
                ACTIVE VECTOR:
              </span>
              <span className="font-bold text-[#E5C378] uppercase truncate">{activeCause.label}</span>
              <span className="text-[#45423B] hidden sm:inline">·</span>
              <span className="text-[#A39A8E] whitespace-nowrap">{activeCause.attempts} affected transactions</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#6F7F5F] flex-shrink-0 whitespace-nowrap">
              <span className="text-[10px] text-[#777168] uppercase">EXPOSURE:</span>
              <span className="font-bold text-[#D8D0C3]">{formatINR(activeCause.recovered)}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#6F7F5F]" />
            </div>
          </div>
        )}

      </div>

      {/* Bottom Swipe Indicator */}
      <div className="pb-3 flex-shrink-0">
        <button
          onClick={onNext}
          className="inline-flex flex-col items-center gap-1.5 px-4 py-2 text-[11px] font-mono tracking-widest text-[#777168] hover:text-[#F7F4EF] transition-colors cursor-pointer group"
        >
          <span className="tracking-[0.25em] font-bold">SWIPE</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-[#C89A4A]" />
        </button>
      </div>
    </section>
  );
};
