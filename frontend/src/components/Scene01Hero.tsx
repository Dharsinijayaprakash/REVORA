import React from 'react';
import { ArrowDown, Zap } from 'lucide-react';

interface Scene01HeroProps {
  onScrollToNext: () => void;
}

export const Scene01Hero: React.FC<Scene01HeroProps> = ({ onScrollToNext }) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-between pt-28 pb-16 px-6 sm:px-12 lg:px-20 film-grain-grid overflow-hidden select-none">
      {/* Extremely subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-[700px] h-[500px] bg-indigo-600/[0.07] rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-emerald-600/[0.05] rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Top Eyebrow Tag */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-indigo-300 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-indigo-400" />
          <span>AUTONOMOUS REVENUE RECOVERY PLATFORM</span>
        </div>
      </div>

      {/* Monumental Asymmetrical Typography */}
      <div className="my-auto py-12 max-w-7xl">
        <div className="space-y-3 sm:space-y-4">
          <div className="text-xs font-mono font-bold tracking-[0.35em] text-slate-500 uppercase ml-1">
            REVORA / 00
          </div>
          
          <h1 className="hero-huge-title text-white uppercase tracking-tight">
            <span className="block text-slate-100">
              TURN REVENUE
            </span>
            <span className="block pl-4 sm:pl-16 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-indigo-300 to-indigo-500">
              LEAKAGE
            </span>
            <span className="block pl-1 sm:pl-8 text-xs sm:text-base font-mono font-medium tracking-widest text-slate-600 my-2 sm:my-4">
              INTO
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-sky-300">
              RECOVERABLE CAPITAL.
            </span>
          </h1>
        </div>
      </div>

      {/* Bottom Asymmetrical Spatial Elements */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end pt-8 border-t border-white/[0.05]">
        <div className="md:col-span-7">
          <p className="text-sm sm:text-base text-slate-400 font-normal leading-relaxed max-w-2xl font-sans">
            Autonomous ingestion of failed payment events, agentic diagnostic reasoning powered by Groq LPUs, and strictly bounded deterministic safety guardrails before capital intervention.
          </p>
        </div>

        <div className="md:col-span-5 flex flex-col md:items-end gap-3">
          <button
            onClick={onScrollToNext}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer group"
          >
            <span>DISCOVER THE SYSTEM</span>
            <ArrowDown className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-y-0.5 transition-transform" />
          </button>
          <span className="text-[10px] font-mono text-slate-600 tracking-wider">
            SCROLL TO BEGIN NARRATIVE
          </span>
        </div>
      </div>
    </section>
  );
};
