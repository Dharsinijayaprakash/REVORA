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

interface PhysicalPolicyGateProps {
  summary: EvaluationSummary;
}

export const PhysicalPolicyGate: React.FC<PhysicalPolicyGateProps> = ({ summary }) => {
  const [activeRuleHover, setActiveRuleHover] = useState<number | null>(null);

  const rules = [
    {
      id: 1,
      code: 'RULE PG-01',
      title: 'Merchant Retry Velocity Limits',
      condition: 'Max 3 automated attempts in 72h window',
      enforcement: 'Deterministic Stop on 4th attempt to prevent card network penalties.',
      status: 'ACTIVE & ENFORCING',
      color: 'emerald',
    },
    {
      id: 2,
      code: 'RULE PG-02',
      title: 'High-Exposure Invoicing Ceiling',
      condition: 'Overdue receivable > ₹25,000',
      enforcement: 'Automatically gates autonomous outreach; routes to Finance Operator for human approval.',
      status: `${summary.human_approval_count} ACTIONS GATED`,
      color: 'purple',
    },
    {
      id: 3,
      code: 'RULE PG-03',
      title: 'Permanent Mandate Revocation Halt',
      condition: 'Hard issuer reject or account closure code',
      enforcement: 'Strict zero-retry barrier; immediately switches channel to secure customer card update portal.',
      status: 'ACTIVE & ENFORCING',
      color: 'emerald',
    },
  ];

  return (
    <div id="safety-architecture" className="space-y-24 py-16 px-4 sm:px-8 lg:px-14 border-b border-white/[0.06] revora-bg-grid glow-ambient-emerald">
      
      {/* =========================================================================
          THE PHYSICAL POLICY GUARD SAFETY GATE (VISUAL CENTERPIECE)
          ========================================================================= */}
      <section className="relative">
        <div className="max-w-4xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-xs font-mono text-emerald-300 mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>04 / DETERMINISTIC BARRIER</span>
          </div>
          <h2 className="section-display-title text-white tracking-tight uppercase">
            POLICY GUARD:<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-indigo-300">
              THE PHYSICAL SAFETY GATE.
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4 max-w-2xl leading-relaxed">
            AI agents must never have unfettered access to financial execution. Policy Guard acts as a hard cryptographic firewall between generative intelligence and monetary transactions.
          </p>
        </div>

        {/* Physical Gate Architectural Visualization */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-emerald-500/20 relative overflow-hidden">
          
          {/* Background Concentric Radar Rings */}
          <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full border border-emerald-500/10 pointer-events-none animate-ring-rotate" />
          <div className="absolute -right-32 -top-32 w-[480px] h-[480px] rounded-full border border-emerald-500/5 pointer-events-none animate-ring-rotate-reverse" />

          {/* 3-Tier Vertical Gateway Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Interactive 3-Step Physical Barrier */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Stage 1: AI Proposal Enters */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block">
                      INPUT STREAM
                    </span>
                    <span className="text-sm font-mono font-bold text-white">
                      AI Agent Contextual Proposal
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-indigo-300 bg-indigo-900/60 px-2.5 py-1 rounded-full">
                  Llama-3.3 70B
                </span>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-1">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-emerald-500/30 flex items-center justify-center">
                  <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Stage 2: PHYSICAL POLICY GUARD GATEWAY (Centerpiece) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-[#0a1813] to-slate-950/80 border-2 border-emerald-500/50 shadow-2xl relative animate-guard-glow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-extrabold tracking-widest text-emerald-300 uppercase">
                      POLICY GUARD BOUNDARY FIREWALL
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-900/60 px-3 py-0.5 rounded-full border border-emerald-700/60">
                    100% GATED
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 my-4 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] font-mono font-bold text-emerald-200 block uppercase">1. VALIDATE</span>
                    <span className="text-[9px] text-slate-400 font-mono">Rule Matrix</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/20">
                    <Lock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] font-mono font-bold text-emerald-200 block uppercase">2. BOUND</span>
                    <span className="text-[9px] text-slate-400 font-mono">Limits & Caps</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[10px] font-mono font-bold text-emerald-200 block uppercase">3. APPROVE</span>
                    <span className="text-[9px] text-slate-400 font-mono">Sign Dispatch</span>
                  </div>
                </div>

                <p className="text-xs text-emerald-100/90 leading-relaxed font-sans mt-2">
                  No automated action reaches payment rails without cryptographic validation against merchant risk constraints and customer fatigue caps.
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center my-1">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-emerald-500/30 flex items-center justify-center">
                  <ArrowDown className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>

              {/* Stage 3: Executor Acts */}
              <div className="p-4 rounded-2xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center text-teal-300">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 block">
                      EXECUTION DISPATCH
                    </span>
                    <span className="text-sm font-mono font-bold text-white">
                      Action Executor Engine
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800">
                  Simulated Execution
                </span>
              </div>

            </div>

            {/* Right: Integrated Telemetry & Rule Enforcements */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Telemetry Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/[0.06]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                    POLICY COMPLIANCE
                  </span>
                  <div className="text-3xl font-mono font-extrabold text-emerald-400 mt-1">
                    100%
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Zero unvalidated actions
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/[0.06]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 block">
                    HUMAN REVIEWS GATED
                  </span>
                  <div className="text-3xl font-mono font-extrabold text-purple-300 mt-1">
                    {summary.human_approval_count}
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Over ₹25k invoice threshold
                  </span>
                </div>
              </div>

              {/* Active Enforced Rules */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-white/[0.06] space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-slate-400 block mb-2">
                  Active Hard Guardrail Rules
                </span>
                
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    onMouseEnter={() => setActiveRuleHover(rule.id)}
                    onMouseLeave={() => setActiveRuleHover(null)}
                    className="p-3 rounded-xl bg-slate-900/90 border border-white/[0.04] hover:border-emerald-500/40 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-emerald-300">
                        {rule.code}: {rule.title}
                      </span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {rule.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {rule.condition}
                    </p>
                    {activeRuleHover === rule.id && (
                      <p className="text-[11px] text-slate-300 mt-1.5 pt-1.5 border-t border-white/[0.06] animate-fade-in-up">
                        {rule.enforcement}
                      </p>
                    )}
                  </div>
                ))}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          THE FULL-WIDTH "TRUST" MOMENT
          ========================================================================= */}
      <section className="relative py-16 border-t border-b border-white/[0.08] revora-bg-dots overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-4">
          <span className="text-xs font-mono font-bold tracking-[0.3em] text-emerald-400 uppercase block mb-4">
            REVORA TRUST & SAFETY STANDARD
          </span>

          <div className="section-display-title text-white tracking-tight uppercase leading-none font-black space-y-2">
            <div className="text-slate-100">
              AI CAN PROPOSE.
            </div>
            <div className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400">
              POLICY DECIDES.
            </div>
            <div className="text-slate-300">
              MONEY MOVES ONLY WHEN IT IS SAFE.
            </div>
          </div>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mt-6 pt-4 font-mono leading-relaxed">
            Deterministic rule validation guarantees that autonomous agents can never trigger rogue billing cycles or customer fatigue.
          </p>
        </div>
      </section>

    </div>
  );
};
