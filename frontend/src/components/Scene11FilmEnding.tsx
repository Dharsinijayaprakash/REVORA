import React from 'react';
import { ShieldCheck, Cpu, ArrowUp } from 'lucide-react';

interface Scene11FilmEndingProps {
  totalTransactions?: number;
}

export const Scene11FilmEnding: React.FC<Scene11FilmEndingProps> = ({ 
  totalTransactions = 5000 
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative py-28 px-6 sm:px-12 lg:px-20 bg-[#06070a] border-t border-white/[0.06] film-grain-grid select-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-12">
        
        {/* Left Film Closing Block */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-indigo-500/30">
              R
            </div>
            <span className="text-sm font-mono font-black tracking-[0.3em] text-white">
              REVORA
            </span>
          </div>

          <div className="scene-statement-title text-white uppercase tracking-tight font-black leading-none">
            <span className="block text-slate-100">RECOVER MORE.</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              SAFELY.
            </span>
          </div>

          <p className="text-xs font-mono text-slate-500 max-w-md leading-relaxed">
            The autonomous revenue recovery control center bridging Groq generative intelligence with deterministic financial policy guardrails.
          </p>
        </div>

        {/* Right System Telemetry & Back to Top */}
        <div className="flex flex-col items-start md:items-end gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEM ACTIVE</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>POLICY PROTECTED</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-xs font-mono text-indigo-300">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>SYNTHETIC MODE</span>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500">
            {totalTransactions.toLocaleString()} Transactions Evaluated • Autonomous Financial Ops
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer mt-2"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
