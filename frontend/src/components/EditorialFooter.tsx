import React from 'react';
import { ShieldCheck, Cpu, ArrowUp } from 'lucide-react';

interface EditorialFooterProps {
  totalTransactions?: number;
}

export const EditorialFooter: React.FC<EditorialFooterProps> = ({
  totalTransactions = 5000
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-20 px-4 sm:px-8 lg:px-14 bg-[#050608] border-t border-white/[0.06] revora-bg-grid relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-10">

        {/* Left Brand Closing */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center font-black text-base text-white shadow-lg shadow-indigo-500/30">
              R
            </div>
            <span className="text-xl font-mono font-black tracking-[0.3em] text-white">
              REVORA
            </span>
          </div>

          <div className="section-display-title text-white tracking-tight uppercase leading-none font-black">
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
              <span>SYSTEM ONLINE</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Policy Gated</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-800/40 text-xs font-mono text-indigo-300">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              <span>Groq LPUs Active</span>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500">
            {totalTransactions.toLocaleString()} Transactions Evaluated • Synthetic Demonstration Environment
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer mt-2"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
