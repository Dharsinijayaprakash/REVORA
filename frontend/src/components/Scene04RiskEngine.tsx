import React, { useState } from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { formatINR, formatLabel } from '../utils/formatters';
import { Activity, ChevronRight } from 'lucide-react';

interface Scene04RiskEngineProps {
  summary: EvaluationSummary;
  onSelectRootCause?: (cause: string) => void;
}

export const Scene04RiskEngine: React.FC<Scene04RiskEngineProps> = ({ 
  summary,
  onSelectRootCause
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const causes = Object.entries(summary.root_cause_performance || {})
    .map(([key, metrics]) => ({
      key,
      label: formatLabel(key),
      recovered: metrics.recovered,
      attempts: metrics.attempts,
      successes: metrics.successes,
      rate: metrics.attempts > 0 ? (metrics.successes / metrics.attempts) * 100 : 0,
    }))
    .sort((a, b) => b.recovered - a.recovered);

  const maxRecovered = Math.max(...causes.map((c) => c.recovered), 1);

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-24 px-6 sm:px-12 lg:px-20 border-t border-white/[0.05] film-dots select-none">
      
      {/* Chapter Eyebrow */}
      <div className="max-w-6xl mx-auto w-full mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-xs font-mono text-indigo-300">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>03 / DIAGNOSTIC CLASSIFICATION</span>
        </div>
      </div>

      {/* Main Typography Statement */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <h2 className="scene-statement-title text-white uppercase tracking-tight">
          <span className="block text-slate-400">REVORA</span>
          <span className="block text-slate-100">UNDERSTANDS</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-sky-300 to-teal-300">
            WHY.
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono leading-relaxed">
          Static automation treats every error identically. REVORA isolates root causes across 7 distinct failure archetypes to calculate dynamic recovery probabilities.
        </p>

        {/* Editorial Ranked Flowing Rows (Pure Editorial Layout) */}
        <div className="my-12 space-y-3">
          {causes.map((cause, index) => {
            const pct = (cause.recovered / maxRecovered) * 100;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={cause.key}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectRootCause && onSelectRootCause(cause.key)}
                className={`py-5 px-6 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isHovered
                    ? 'bg-slate-900/90 border-indigo-500/50 shadow-xl pl-8'
                    : 'bg-white/[0.015] border-white/[0.05] hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Number and Title */}
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-white/[0.08]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-base sm:text-lg font-mono font-bold text-white tracking-tight">
                      {cause.label}
                    </span>
                  </div>

                  {/* Right: Telemetry & Amount */}
                  <div className="flex items-baseline gap-6 sm:text-right">
                    <span className="text-xs font-mono text-slate-400">
                      {cause.successes} / {cause.attempts} Recovered ({cause.rate.toFixed(0)}%)
                    </span>
                    <span className="text-lg sm:text-xl font-mono font-extrabold text-emerald-400">
                      {formatINR(cause.recovered)}
                    </span>
                  </div>
                </div>

                {/* Animated Flowing Line */}
                <div className="w-full h-1 bg-slate-950 rounded-full mt-4 overflow-hidden border border-white/[0.04]">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isHovered
                        ? 'bg-gradient-to-r from-indigo-400 to-emerald-300 shadow-md'
                        : 'bg-gradient-to-r from-indigo-600 to-emerald-500 opacity-70'
                    }`}
                    style={{ width: `${Math.max(pct, 6)}%` }}
                  />
                </div>

                {/* Hover Reveal Details */}
                {isHovered && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400 animate-fade-in-up">
                    <span>Targeted AI Context Analysis • Dynamic Retry Calibration</span>
                    <span className="text-indigo-400 inline-flex items-center gap-1 font-bold">
                      <span>View in Recovery Queue</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
