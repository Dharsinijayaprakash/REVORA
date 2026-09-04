import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export const Scene05AiDecision: React.FC = () => {
  const [activeCase, setActiveCase] = useState<number>(0);

  const testCases = [
    {
      title: 'Transient Gateway Drop',
      baselineAction: 'Payment Reminder',
      baselineDesc: 'Static rule blindly queues an email notice, causing customer confusion during a temporary bank dip.',
      aiAction: 'Smart Retry (35-Min Cadence)',
      aiConfidence: 85,
      aiDesc: 'Groq LPU detects network degradation signature; schedules automated retry at off-peak window without customer ping.',
      override: true,
      result: 'Recovered ₹4,500 with zero customer friction',
    },
    {
      title: 'High-Value Invoice Overdue',
      baselineAction: 'Payment Reminder',
      baselineDesc: 'Blind automated dunning notice sent on ₹45,000 enterprise invoice.',
      aiAction: 'Human Approval Required',
      aiConfidence: 94,
      aiDesc: 'Policy Guard flags invoice amount exceeding autonomous ceiling; halts auto-collection and routes to account manager.',
      override: true,
      result: 'Protects key enterprise account relationship',
    },
    {
      title: 'Expired Card Token',
      baselineAction: 'Mandate Retry',
      baselineDesc: 'Repeatedly hits issuing bank, risking merchant payment gateway chargeback fines.',
      aiAction: 'Stop / Card Update Modal',
      aiConfidence: 91,
      aiDesc: 'Identifies permanent closure; stops retries and sends zero-friction 1-click card update link.',
      override: true,
      result: 'Zero merchant fines, friction-free card update',
    },
  ];

  const current = testCases[activeCase];

  return (
    <section className="relative min-h-screen flex flex-col justify-center py-24 px-6 sm:px-12 lg:px-20 border-t border-white/[0.05] film-grain-grid select-none">
      
      {/* Chapter Eyebrow */}
      <div className="max-w-6xl mx-auto w-full mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-800/40 text-xs font-mono text-violet-300">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>04 / AGENTIC REASONING</span>
        </div>
      </div>

      {/* Main Typography Statement */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <h2 className="scene-statement-title text-white uppercase tracking-tight">
          <span className="block text-slate-400">THE AI</span>
          <span className="block text-slate-100">DOESN'T ACT.</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-indigo-300 to-pink-300">
            IT PROPOSES.
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono leading-relaxed">
          Groq Llama-3.3 70B synthesizes rich customer context and transaction failure signatures to formulate structured recovery recommendations.
        </p>

        {/* Case Toggle Selector */}
        <div className="flex flex-wrap gap-2 pt-6">
          {testCases.map((c, idx) => (
            <button
              key={c.title}
              onClick={() => setActiveCase(idx)}
              className={`px-4 py-2 rounded-full text-xs font-mono transition-all cursor-pointer ${
                activeCase === idx
                  ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.08]'
              }`}
            >
              Case 0{idx + 1}: {c.title}
            </button>
          ))}
        </div>

        {/* Live Comparison Visual Console */}
        <div className="my-8 grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
          
          {/* Left: Deterministic Baseline */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-white/[0.015] border border-white/[0.06] flex flex-col justify-between min-h-[260px]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-4">
                DETERMINISTIC BASELINE
              </span>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-slate-300">
                {current.baselineAction}
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed font-sans">
                {current.baselineDesc}
              </p>
            </div>

            <div className="pt-4 border-t border-white/[0.04] text-[11px] font-mono text-slate-500">
              Legacy Rule v1.4 • Fixed Interval
            </div>
          </div>

          {/* Center: AI Override Arrow */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center py-2">
            <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-md">
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="text-[9px] font-mono font-bold text-indigo-400 mt-2 uppercase tracking-wider text-center">
              AI OVERRIDE
            </span>
          </div>

          {/* Right: AI Proposal */}
          <div className="lg:col-span-5 p-8 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-violet-950/20 to-[#0c0f17] border border-indigo-500/30 flex flex-col justify-between min-h-[260px] relative overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400">
                GROQ AI RECOMMENDATION
              </span>
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-900/60 px-2.5 py-0.5 rounded-full border border-indigo-700/60">
                {current.aiConfidence}% CONFIDENCE
              </span>
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-mono font-extrabold text-white">
                {current.aiAction}
              </div>
              <p className="text-xs text-slate-200 mt-3 leading-relaxed font-sans">
                "{current.aiDesc}"
              </p>
            </div>

            <div className="pt-4 border-t border-indigo-500/20 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>Outcome: {current.result}</span>
              <span className="text-indigo-400">Gated by Guard →</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
