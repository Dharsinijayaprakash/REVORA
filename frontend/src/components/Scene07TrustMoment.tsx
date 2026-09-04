import React from 'react';

export const Scene07TrustMoment: React.FC = () => {
  return (
    <section className="relative min-h-[85vh] flex flex-col justify-center py-32 px-6 sm:px-12 lg:px-20 border-t border-white/[0.05] film-dots select-none">
      <div className="max-w-6xl mx-auto w-full text-left space-y-12">
        
        <div className="text-xs font-mono font-bold tracking-[0.4em] text-emerald-400 uppercase">
          06 / THE TRUST STANDARD
        </div>

        <div className="scene-statement-title text-white uppercase tracking-tight font-black space-y-3 sm:space-y-4">
          <div className="text-slate-500">
            AI CAN PROPOSE.
          </div>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
            POLICY DECIDES.
          </div>
          <div className="text-slate-100">
            MONEY MOVES ONLY WHEN IT IS SAFE.
          </div>
        </div>

        <div className="pt-6 border-t border-white/[0.06] max-w-xl">
          <p className="text-xs sm:text-sm font-mono text-slate-400 leading-relaxed">
            Deterministic rule validation guarantees that autonomous agents can never trigger runaway billing loops, repeated customer outreach fatigue, or unapproved write-offs.
          </p>
        </div>

      </div>
    </section>
  );
};
