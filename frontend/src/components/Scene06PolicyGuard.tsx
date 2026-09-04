import React, { useState } from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Bot, 
  Sparkles, 
  ArrowDown
} from 'lucide-react';

interface Scene06PolicyGuardProps {
  summary: EvaluationSummary;
}

export const Scene06PolicyGuard: React.FC<Scene06PolicyGuardProps> = ({ summary }) => {
  const [activeRule, setActiveRule] = useState<number>(1);

  const rules = [
    {
      id: 1,
      code: 'RULE PG-01',
      title: 'Merchant Retry Velocity Limits',
      condition: 'Max 3 automated retry attempts within 72h window per merchant account.',
      enforcement: 'Deterministic Stop on 4th attempt to protect merchant gateway health.',
      status: 'ACTIVE & ENFORCING',
    },
    {
      id: 2,
      code: 'RULE PG-02',
      title: 'High-Exposure Invoicing Ceiling',
      condition: 'Overdue receivable balance > ₹25,000.',
      enforcement: `Gated ${summary.human_approval_count} automated dispatches to require human operator review.`,
      status: `${summary.human_approval_count} GATED REVIEWS`,
    },
    {
      id: 3,
      code: 'RULE PG-03',
      title: 'Permanent Mandate Revocation Halt',
      condition: 'Issuer hard reject code or bank account closure.',
      enforcement: 'Strict zero-retry barrier; redirects flow to 1-click encrypted card update modal.',
      status: 'ACTIVE & ENFORCING',
    },
  ];

  return (
    <section id="scene-guard" className="relative min-h-screen flex flex-col justify-center py-24 px-6 sm:px-12 lg:px-20 border-t border-white/[0.05] film-grain-grid select-none overflow-hidden">
      
      {/* Background Rotating Micro Rings */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-500/[0.08] pointer-events-none animate-orbit-slow" />
      <div className="absolute top-1/2 right-20 -translate-y-1/2 w-[440px] h-[440px] rounded-full border border-emerald-500/[0.05] pointer-events-none animate-orbit-reverse" />

      {/* Chapter Eyebrow */}
      <div className="max-w-6xl mx-auto w-full mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>05 / THE PHYSICAL SAFETY GATE</span>
        </div>
      </div>

      {/* Main Typography Statement */}
      <div className="max-w-6xl mx-auto w-full space-y-6">
        <h2 className="scene-statement-title text-white uppercase tracking-tight">
          <span className="block text-slate-400">AI CAN PROPOSE.</span>
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-indigo-300">
            POLICY DECIDES.
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl font-mono leading-relaxed">
          The Policy Guard is a cryptographic, deterministic firewall between generative reasoning and monetary rails. No financial transaction is ever dispatched without policy validation.
        </p>

        {/* Physical Safety Barrier Visual Architecture */}
        <div className="my-12 p-8 sm:p-12 rounded-3xl bg-[#090d13] border-2 border-emerald-500/30 relative overflow-hidden shadow-2xl">
          
          {/* Subtle Ambient Scanline */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/[0.03] to-transparent pointer-events-none animate-scan-line" />

          {/* 3-Step Physical Barrier Gateway */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Flow Stack */}
            <div className="lg:col-span-7 space-y-3">
              
              {/* Input Signal */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-mono font-bold text-white">
                    Groq AI Proposed Action
                  </span>
                </div>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded">
                  RAW CANDIDATE
                </span>
              </div>

              <div className="flex justify-center">
                <ArrowDown className="w-4 h-4 text-emerald-400 animate-bounce" />
              </div>

              {/* Physical Gate (Centerpiece Box) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/50 via-[#0a1813] to-slate-950/80 border-2 border-emerald-400/60 shadow-xl relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-black tracking-widest text-emerald-300 uppercase">
                      POLICY GUARD BOUNDARY GATEWAY
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-extrabold text-emerald-400 bg-emerald-900/70 border border-emerald-700/60 px-2.5 py-0.5 rounded-full">
                    100% GATED
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] font-mono font-bold text-emerald-200 block">1. VALIDATE</span>
                    <span className="text-[9px] text-slate-500 font-mono">Rule Schema</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                    <Lock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] font-mono font-bold text-emerald-200 block">2. BOUND</span>
                    <span className="text-[9px] text-slate-500 font-mono">Frequency Caps</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] font-mono font-bold text-emerald-200 block">3. APPROVE</span>
                    <span className="text-[9px] text-slate-500 font-mono">Signed Dispatch</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <ArrowDown className="w-4 h-4 text-emerald-400 animate-bounce" />
              </div>

              {/* Output Signal */}
              <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-mono font-bold text-white">
                    Validated Action Dispatched to Rails
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  SAFE EXECUTION
                </span>
              </div>

            </div>

            {/* Right Telemetry Column (Integrated into visual, not generic cards) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/[0.06]">
                <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-400">
                  100%
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mt-1 block">
                  POLICY ENFORCEMENT RATE
                </span>
                <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                  Zero unvalidated actions executed
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/[0.06]">
                <div className="text-4xl sm:text-5xl font-mono font-black text-purple-300">
                  {summary.human_approval_count}
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mt-1 block">
                  HUMAN APPROVALS GATED
                </span>
                <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                  Invoices exceeding autonomous ceiling (&gt; ₹25,000)
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950/80 border border-white/[0.06]">
                <div className="text-4xl sm:text-5xl font-mono font-black text-slate-200">
                  0
                </div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mt-1 block">
                  UNBOUNDED ACTIONS
                </span>
                <span className="text-[11px] font-mono text-slate-500 mt-1 block">
                  Hard guarantee enforced on every execution
                </span>
              </div>

            </div>

          </div>

          {/* Active Rules Selector */}
          <div className="mt-8 pt-6 border-t border-white/[0.06]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 block mb-3">
              ACTIVE ENFORCED POLICY GUARD RULES
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  onClick={() => setActiveRule(rule.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    activeRule === rule.id
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                      : 'bg-slate-950/60 border-white/[0.04] text-slate-400 hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-emerald-300">
                      {rule.code}
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                      ENFORCED
                    </span>
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-200">
                    {rule.title}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">
                    {rule.condition}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
