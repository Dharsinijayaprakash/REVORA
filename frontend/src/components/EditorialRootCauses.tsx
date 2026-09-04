import React, { useState } from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { formatINR, formatLabel } from '../utils/formatters';
import { useInView } from '../hooks/useInView';
import { ChevronRight, Filter, AlertCircle } from 'lucide-react';

interface EditorialRootCausesProps {
  summary: EvaluationSummary;
  onSelectRootCause: (cause: string) => void;
}

export const EditorialRootCauses: React.FC<EditorialRootCausesProps> = ({
  summary,
  onSelectRootCause,
}) => {
  const [sectionRef, isInView] = useInView({ threshold: 0.15 });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Process root causes from real backend data
  const rawCauses = Object.entries(summary.root_cause_performance || {}).map(([key, metrics]) => ({
    key,
    label: formatLabel(key),
    recovered: metrics.recovered,
    attempts: metrics.attempts,
    successes: metrics.successes,
    successRate: metrics.attempts > 0 ? (metrics.successes / metrics.attempts) * 100 : 0,
  }));

  const totalRecoveredSum = rawCauses.reduce((acc, c) => acc + c.recovered, 0) || 1;
  const maxRecovered = Math.max(...rawCauses.map((c) => c.recovered), 1);

  // Sort descending to find the top driver
  const causes = rawCauses
    .map((c) => ({
      ...c,
      share: (c.recovered / totalRecoveredSum) * 100,
    }))
    .sort((a, b) => b.recovered - a.recovered);

  const topDriver = causes[0] || null;

  return (
    <section
      id="scene-diagnosis"
      ref={sectionRef}
      className="relative w-full py-8 px-3 sm:px-6 lg:px-10 select-none"
    >
      {/* Central Floating Warm Editorial Canvas (Matching Section 1) */}
      <div className="w-full max-w-[1400px] mx-auto rounded-[24px] sm:rounded-[32px] bg-[#F7F4EF] border border-[#EDE6DA] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-10 lg:p-14 text-[#1C1B18] relative overflow-hidden">

        {/* Section Header: Label + Title + Subtitle */}
        <div className={`space-y-4 pb-8 border-b border-[#E5DFD5] transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EDE6DA] text-[11px] font-mono font-bold text-[#777168] tracking-wider">
              02 / DIAGNOSIS
            </span>
            <span className="text-[11px] font-mono text-[#9A9388] uppercase tracking-widest hidden sm:inline">
              ROOT-CAUSE TAXONOMY
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-display font-bold text-[#1C1B18] tracking-tight leading-[1.1] uppercase">
                WHY IS REVENUE LEAKING?
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base text-[#777168] font-sans leading-relaxed">
                REVORA classifies at-risk transactions by failure pattern, revealing where recoverable revenue is concentrated.
              </p>
            </div>
          </div>
        </div>

        {/* Central Total Revenue at Risk Callout & Top Driver Highlight */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 my-8 items-stretch transition-all duration-700 delay-150 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>

          {/* Total Revenue At Risk Block (Level 3) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#EDE6DA]/60 border border-[#E0D8CC] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase block mb-1">
                TOTAL REVENUE AT RISK
              </span>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-mono font-black text-[#1C1B18] tracking-tight">
                {formatINR(summary.total_revenue_at_risk)}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#D8D0C3]/60 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#777168]">
              <span>{summary.total_at_risk_transactions.toLocaleString()} transactions analyzed</span>
              <span className="text-[#524E48] font-bold">7 Diagnostic Archetypes</span>
            </div>
          </div>

          {/* Top Driver Highlight Block */}
          {topDriver && (
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#EDE6DA]/40 border border-[#E0D8CC] flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#C85A3E]/15 text-[10px] font-mono font-bold text-[#C85A3E] tracking-wider">
                    <AlertCircle className="w-3 h-3" />
                    TOP DRIVER
                  </span>
                  <span className="text-xs font-mono font-bold text-[#C85A3E]">
                    {topDriver.share.toFixed(1)}% OF LEAKAGE
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-mono font-bold text-[#1C1B18] mt-2">
                  {topDriver.label}
                </div>
                <p className="text-xs text-[#777168] font-sans mt-1.5 leading-relaxed">
                  The single largest concentration of exposure in the gateway stream.
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#D8D0C3]/60 flex items-center justify-between text-xs font-mono">
                <span className="text-[#777168]">Recovered Potential:</span>
                <span className="text-base font-mono font-extrabold text-[#71805A]">
                  {formatINR(topDriver.recovered)}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Level 4: Editorial Flowing Streams Visualization */}
        <div className={`space-y-3 pt-4 transition-all duration-700 delay-300 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}>

          <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-[#9A9388] uppercase tracking-wider">
            <span>DIAGNOSED FAILURE PATTERNS</span>
            <span className="hidden sm:inline">SHARE // REALIZED YIELD</span>
          </div>

          <div className="divide-y divide-[#E5DFD5] border-t border-b border-[#E5DFD5]">
            {causes.map((cause, index) => {
              const isHovered = hoveredIdx === index;
              const isAnyHovered = hoveredIdx !== null;
              const isTop = index === 0;
              const rankNum = String(index + 1).padStart(2, '0');
              const barWidth = (cause.recovered / maxRecovered) * 100;

              return (
                <div
                  key={cause.key}
                  onMouseEnter={() => setHoveredIdx(index)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => onSelectRootCause(cause.key)}
                  className={`group py-5 px-3 sm:px-5 rounded-2xl transition-all duration-300 cursor-pointer ${isHovered
                      ? 'bg-[#EDE6DA] shadow-sm translate-x-1'
                      : isAnyHovered
                        ? 'opacity-40 hover:opacity-100'
                        : 'hover:bg-[#EDE6DA]/40'
                    }`}
                >
                  {/* Row Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                    {/* Left: Rank + Name + Top Tag */}
                    <div className="flex items-center gap-4">
                      <span className={`font-mono text-sm sm:text-base font-bold transition-colors ${isHovered ? 'text-[#C85A3E]' : 'text-[#9A9388]'
                        }`}>
                        {rankNum}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-sm sm:text-base font-bold transition-colors ${isHovered ? 'text-[#1C1B18]' : 'text-[#2D2A26]'
                            }`}>
                            {cause.label}
                          </span>
                          {isTop && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#C85A3E]/15 text-[#C85A3E]">
                              PRIMARY
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-[#777168] mt-0.5 block">
                          {cause.attempts.toLocaleString()} failure signals detected
                        </span>
                      </div>
                    </div>

                    {/* Right: Share Percentage + Recovered Amount */}
                    <div className="flex items-baseline justify-between sm:justify-end gap-6 sm:text-right">
                      <div className="text-left sm:text-right">
                        <span className="font-mono text-base sm:text-lg font-bold text-[#1C1B18] block">
                          {formatINR(cause.recovered)}
                        </span>
                        <span className="text-[11px] font-mono text-[#777168]">
                          {cause.share.toFixed(1)}% share • {cause.successes} recovered ({cause.successRate.toFixed(0)}%)
                        </span>
                      </div>

                      <div className={`p-1.5 rounded-lg border transition-all ${isHovered
                          ? 'bg-[#1C1B18] border-[#1C1B18] text-white'
                          : 'bg-[#EDE6DA]/80 border-[#D8D0C3] text-[#777168]'
                        }`}>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>

                  </div>

                  {/* Flowing Stream Visual Bar */}
                  <div className="w-full h-1.5 bg-[#EDE6DA] rounded-full mt-3.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${isHovered
                          ? 'bg-gradient-to-r from-[#C85A3E] via-[#C89A4A] to-[#71805A]'
                          : isTop
                            ? 'bg-gradient-to-r from-[#C85A3E] to-[#C89A4A]'
                            : 'bg-gradient-to-r from-[#C89A4A] to-[#71805A] opacity-75'
                        }`}
                      style={{ width: isInView ? `${Math.max(barWidth, 6)}%` : '0%' }}
                    />
                  </div>

                  {/* Inline Expanded Telemetry on Hover */}
                  {isHovered && (
                    <div className="mt-3 pt-3 border-t border-[#D8D0C3]/60 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#524E48]">
                      <span>Precision context parsing applied for {cause.label}</span>
                      <span className="font-bold text-[#C85A3E] inline-flex items-center gap-1">
                        <Filter className="w-3 h-3" />
                        <span>Click to filter in Operations Console</span>
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
