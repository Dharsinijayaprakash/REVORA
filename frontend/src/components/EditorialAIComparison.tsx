import React, { useState } from 'react';
import { useInView } from '../hooks/useInView';
import { ArrowRight, Cpu } from 'lucide-react';

export const EditorialAIComparison: React.FC = () => {
  const [sectionRef, isInView] = useInView({ threshold: 0.15 });
  const [activeCase, setActiveCase] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const cases = [
    {
      id: 1,
      title: 'Transient Bank Network Dip',
      category: 'PAYMENT_METHOD_FAILURE',
      categoryLabel: 'Payment Method Failure',
      exposure: '₹14,200',
      baselineAction: 'PAYMENT_REMINDER',
      baselineLabel: 'Payment Reminder',
      baselineDesc: 'Blindly emails dunning notice during temporary issuer server lag; causes customer confusion.',
      aiAction: 'SMART_RETRY',
      aiLabel: 'Smart Retry (35-Min Cadence)',
      aiConfidence: 88,
      aiReasoning: 'Groq AI detects transient issuer 503 error signatures; queues automated silent retry at off-peak window without customer friction.',
      outcome: 'Recovered ₹14,200 seamlessly with zero friction',
      tag: 'TRANSIENT DIP',
    },
    {
      id: 2,
      title: 'High-Value Enterprise Receivable',
      category: 'OVERDUE_RECEIVABLE',
      categoryLabel: 'Overdue Receivable',
      exposure: '₹85,000',
      baselineAction: 'PAYMENT_REMINDER',
      baselineLabel: 'Standard Dunning Notice',
      baselineDesc: 'Automated generic dunning email insults Tier-1 enterprise account relationship.',
      aiAction: 'HUMAN_APPROVAL',
      aiLabel: 'Human Approval Required',
      aiConfidence: 95,
      aiReasoning: 'Exposure > ₹25,000 ceiling. Halts automated dunning and routes signed review workflow to designated Account Director.',
      outcome: 'Protects key enterprise account relationship and contract health',
      tag: 'HIGH EXPOSURE',
    },
    {
      id: 3,
      title: 'Revoked Card Token Hard Reject',
      category: 'SUBSCRIPTION_PAYMENT_FAILURE',
      categoryLabel: 'Subscription Failure',
      exposure: '₹4,990',
      baselineAction: 'MANDATE_RETRY',
      baselineLabel: 'Repeated Gateway Retries',
      baselineDesc: 'Blind recurring hits on closed card risk card-brand excessive retry fines ($15/hit).',
      aiAction: 'STOP / CARD_UPDATE_MODAL',
      aiLabel: 'Safety Stop & 1-Click Update',
      aiConfidence: 92,
      aiReasoning: 'Hard bank refusal token recognized. Halts payment retries immediately; triggers encrypted instant card update portal.',
      outcome: 'Eliminates gateway chargeback fines; customer updates card in 40s',
      tag: 'TOKEN REVOKED',
    },
    {
      id: 4,
      title: 'Checkout Drop on High-Intent Session',
      category: 'CHECKOUT_ABANDONMENT',
      categoryLabel: 'Checkout Abandonment',
      exposure: '₹7,800',
      baselineAction: 'PAYMENT_REMINDER',
      baselineLabel: 'Generic Cart Abandonment Email',
      baselineRisk: 'Delayed batch email sent 24h later when customer purchase intent has already cooled.',
      aiAction: 'SMART_RETRY',
      aiLabel: 'Precision 15-Min Session Re-engagement',
      aiConfidence: 84,
      aiReasoning: 'Session telemetry indicates cart dropped at OTP verification. Re-engages session via SMS deep-link within 15 minutes.',
      outcome: 'Recovers high-intent session at 64% completion rate',
      tag: 'SESSION DROP',
    },
  ];

  const current = cases[activeCase];

  // 10-pip confidence meter
  const filledPips = Math.round((current.aiConfidence / 100) * 10);

  return (
    <section
      id="scene-proposal"
      ref={sectionRef}
      className="relative w-full py-8 px-3 sm:px-6 lg:px-10 select-none"
    >
      {/* Central Floating Warm Editorial Canvas */}
      <div className="w-full max-w-[1400px] mx-auto rounded-[24px] sm:rounded-[32px] bg-[#F7F4EF] border border-[#EDE6DA] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-10 lg:p-14 text-[#1C1B18] relative overflow-hidden">

        {/* Section Header: Label + Title + Subtitle */}
        <div className={`space-y-4 pb-8 border-b border-[#E5DFD5] transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EDE6DA] text-[11px] font-mono font-bold text-[#777168] tracking-wider">
              03 / AI PROPOSAL
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E5C378]/25 text-[10px] font-mono font-bold text-[#8A6A1A] tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C89A4A] animate-pulse" />
              PROPOSED ACTION (NOT YET EXECUTED)
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-display font-bold text-[#1C1B18] tracking-tight leading-[1.1] uppercase">
                WHAT SHOULD REVORA DO?
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base text-[#777168] font-sans leading-relaxed">
                REVORA’s Groq AI analyzes diagnosed failure physics to formulate targeted, confidence-scored recovery proposals.
              </p>
            </div>
          </div>
        </div>

        {/* Case Toggle Selector (Failure Archetype Explorer) */}
        <div className={`flex flex-wrap gap-2.5 my-6 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          {cases.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveCase(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer flex items-center gap-2 border ${activeCase === idx
                  ? 'bg-[#EDE6DA] border-[#D8D0C3] text-[#1C1B18] font-bold shadow-sm'
                  : 'bg-[#F7F4EF] hover:bg-[#EDE6DA]/50 border-[#E5DFD5] text-[#777168]'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${activeCase === idx ? 'bg-[#C89A4A]' : 'bg-[#D8D0C3]'
                }`} />
              <span>{c.title}</span>
            </button>
          ))}
        </div>

        {/* DECISION FORMS: Visual Transformation Flow (DIAGNOSIS → ANALYSIS → PROPOSAL) */}
        <div className={`my-8 p-6 sm:p-8 rounded-2xl bg-[#EDE6DA]/50 border border-[#E0D8CC] transition-all duration-700 delay-200 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>

          {/* Flow Stepper Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#D8D0C3]/70 text-[11px] font-mono">
            <div className="flex items-center gap-2 text-[#777168]">
              <span className="font-bold text-[#C85A3E]">01. DIAGNOSIS</span>
              <span>→</span>
              <span className="font-bold text-[#C89A4A]">02. ANALYSIS</span>
              <span>→</span>
              <span className="font-bold text-[#1C1B18]">03. PROPOSAL READY</span>
            </div>

            <div className="flex items-center gap-2 text-[#777168]">
              <span>FAILURE VECTOR:</span>
              <span className="font-bold text-[#1C1B18] uppercase">{current.categoryLabel}</span>
            </div>
          </div>

          {/* Interactive Flow Architecture: Baseline vs AI Proposal */}
          <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center my-6">

            {/* Left: Static Deterministic Baseline (Terracotta Accent) */}
            <div className="lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-[#F7F4EF] border border-[#E5DFD5] flex flex-col justify-between min-h-[220px]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase">
                    DETERMINISTIC BASELINE
                  </span>
                  <span className="text-[10px] font-mono text-[#777168] bg-[#EDE6DA] px-2 py-0.5 rounded">
                    RULE V1.4
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-mono font-bold text-[#1C1B18] tracking-tight">
                  {current.baselineLabel}
                </div>

                <p className="text-xs sm:text-sm text-[#777168] mt-3 leading-relaxed font-sans">
                  {current.baselineDesc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5DFD5] flex items-center justify-between text-[11px] font-mono text-[#9A9388]">
                <span>Failure Context Ignored</span>
                <span className="text-[#C85A3E] font-bold">Static Dispatch</span>
              </div>
            </div>

            {/* Center Decision Node Indicator */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center py-2">
              <div className="w-10 h-10 rounded-2xl bg-[#EDE6DA] border border-[#D8D0C3] flex items-center justify-center text-[#C89A4A] shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-mono font-bold text-[#C89A4A] mt-2 uppercase tracking-widest text-center">
                AI ANALYSIS
              </span>
            </div>

            {/* Right: AI Proposed Action (Warm Gold Accent) */}
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`lg:col-span-5 p-6 sm:p-7 rounded-2xl bg-[#F7F4EF] border transition-all duration-300 flex flex-col justify-between min-h-[220px] shadow-sm ${isHovered
                  ? 'border-[#C89A4A] shadow-md -translate-y-0.5'
                  : 'border-[#E0D8CC]'
                }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#C89A4A] uppercase flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5" />
                    AI PROPOSED ACTION
                  </span>
                  <span className="text-xs font-mono font-bold text-[#8A6A1A] bg-[#E5C378]/25 border border-[#E5C378]/50 px-2.5 py-0.5 rounded-full">
                    {current.aiConfidence}% CONFIDENCE
                  </span>
                </div>

                <div className="text-xl sm:text-2xl font-mono font-black text-[#1C1B18] tracking-tight">
                  {current.aiLabel}
                </div>

                <p className="text-xs sm:text-sm text-[#524E48] mt-3 leading-relaxed font-sans bg-[#EDE6DA]/40 p-3 rounded-xl border border-[#E0D8CC]/80">
                  "{current.aiReasoning}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#E5DFD5] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#71805A] font-bold">
                  Target: {current.outcome}
                </span>
                <span className="text-[#777168]">Routes to Policy Gate →</span>
              </div>
            </div>

          </div>

          {/* Bottom Telemetry Strip: Confidence Pip Meter & Model Meta */}
          <div className="pt-4 border-t border-[#D8D0C3]/70 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center text-xs font-mono">

            {/* Confidence Pip Meter */}
            <div className="flex items-center gap-3">
              <span className="text-[#9A9388] text-[11px]">CONFIDENCE:</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${i < filledPips ? 'bg-[#C89A4A]' : 'bg-[#D8D0C3]'
                      }`}
                  />
                ))}
              </div>
              <span className="font-bold text-[#1C1B18] text-[11px]">{current.aiConfidence}%</span>
            </div>

            {/* Inference Engine */}
            <div className="flex items-center gap-2 sm:justify-center text-[#777168]">
              <span>ENGINE:</span>
              <span className="font-bold text-[#1C1B18]">GROQ AI</span>
            </div>

            {/* Governance Note */}
            <div className="sm:text-right text-[11px] text-[#777168]">
              <span>STATUS:</span>{' '}
              <span className="font-bold text-[#C89A4A]">PENDING POLICY VALIDATION</span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
