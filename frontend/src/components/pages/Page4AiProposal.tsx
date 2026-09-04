import React, { useState } from 'react';
import { ArrowDown, Cpu, AlertCircle, ArrowRight } from 'lucide-react';

interface Page4AiProposalProps {
  onNext: () => void;
}

export const Page4AiProposal: React.FC<Page4AiProposalProps> = ({ onNext }) => {
  const [selectedCase, setSelectedCase] = useState<number>(0);

  // Truthful transactions from the active evaluation dataset
  const realExamples = [
    {
      id: 'txn_8a8dab2f',
      title: 'Payment Method Failure',
      amount: '₹1,739',
      rootCause: 'PAYMENT_METHOD_FAILURE',
      rootCauseLabel: 'Payment Method Failure (Issuer Decline)',
      aiProvider: 'Groq AI (Llama-3.3 70B)',
      aiRecommendation: 'PAYMENT_REMINDER',
      aiRecommendationDetail: 'Scheduled Payment Reminder (Customer Notification)',
      aiConfidence: 88,
      baselineAction: 'PAYMENT_REMINDER',
      baselineActionDetail: 'Static Fixed Interval Code',
      policyDecision: 'APPROVED',
      executionResult: 'Simulated Recovery Attempted · ₹0 Recovered',
      aiReasoning: 'Groq AI diagnostic confirms card authorization drop. Evaluates issuer decline signature and confirms customer notification via payment reminder notice.',
    },
    {
      id: 'txn_9b9c144c',
      title: 'Temporary Gateway Timeout',
      amount: '₹13,064',
      rootCause: 'TEMPORARY_PAYMENT_FAILURE',
      rootCauseLabel: 'Temporary Payment Failure (Network Timeout)',
      aiProvider: 'Groq AI (Llama-3.3 70B)',
      aiRecommendation: 'SMART_RETRY',
      aiRecommendationDetail: 'Smart Retry (35-Min Off-Peak Execution)',
      aiConfidence: 94,
      baselineAction: 'SMART_RETRY',
      baselineActionDetail: 'Standard Blind Retry Cadence',
      policyDecision: 'APPROVED',
      executionResult: 'Simulated Recovery Successful · ₹13,064 Recovered',
      aiReasoning: 'Groq AI detects transient issuer 504 timeout signature. Cleared by Policy Guard for smart retry at off-peak window. Successfully recovered ₹13,064.',
    },
    {
      id: 'txn_dcd95042',
      title: 'Checkout Inactivity',
      amount: '₹45,853',
      rootCause: 'CHECKOUT_ABANDONMENT',
      rootCauseLabel: 'Checkout Abandonment (High Exposure)',
      aiProvider: 'Groq AI (Llama-3.3 70B)',
      aiRecommendation: 'PAYMENT_REMINDER',
      aiRecommendationDetail: 'Targeted Checkout Reminder Notice',
      aiConfidence: 91,
      baselineAction: 'PAYMENT_REMINDER',
      baselineActionDetail: 'Generic Dunning Email',
      policyDecision: 'APPROVED',
      executionResult: 'Simulated Recovery Attempted · ₹0 Recovered',
      aiReasoning: 'User session dropped before payment authorization. Groq AI recommends single low-friction reminder notice within policy limits.',
    },
  ];

  const current = realExamples[selectedCase];

  return (
    <section
      id="page-4"
      className="relative w-full h-full flex flex-col justify-between items-center px-6 py-8 pt-20 sm:pt-24 bg-[#171717] text-[#F7F4EF] select-none overflow-hidden"
    >
      {/* Top Question Eyebrow */}
      <div className="flex flex-col items-center gap-1.5 pt-2 flex-shrink-0 text-center">
        <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#C89A4A] uppercase bg-[#C89A4A]/15 px-3 py-1 rounded-full border border-[#C89A4A]/30 flex items-center gap-1.5 whitespace-nowrap">
          <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
          <span>04 / REASONING</span>
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight uppercase">
          WHAT DOES AI PROPOSE?
        </h2>
        <p className="text-xs sm:text-sm font-sans text-[#A39A8E] max-w-md leading-snug">
          Groq AI analyzes failure signatures in &lt;100ms and proposes optimized recovery strategies.
        </p>
      </div>

      {/* Main Interactive AI Proposal Showcase */}
      <div className="max-w-4xl w-full my-auto space-y-4 px-2">
        
        {/* Case Switcher Tabs - With ample padding and no overlap */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase whitespace-nowrap">
            REAL TRANSACTION EXAMPLES:
          </span>

          <div className="flex items-center gap-2 flex-wrap">
            {realExamples.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => setSelectedCase(idx)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border whitespace-nowrap focus:outline-none ${
                  selectedCase === idx
                    ? 'bg-[#E5C378] text-[#121212] font-bold border-[#E5C378] shadow-sm'
                    : 'bg-[#24231F] text-[#A39A8E] hover:text-[#F7F4EF] border-[#35332C]'
                }`}
              >
                {ex.id} · {ex.title}
              </button>
            ))}
          </div>
        </div>

        {/* The Concrete Comparison Card */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#24231F] border border-[#35332C] space-y-4 shadow-xl">
          
          {/* Card Top: Transaction Meta */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#35332C] text-xs font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded bg-[#171717] border border-[#35332C] font-bold text-[#E5C378] whitespace-nowrap">
                {current.id}
              </span>
              <span className="text-[#A39A8E] truncate max-w-xs">{current.rootCauseLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#777168] uppercase whitespace-nowrap">EXPOSURE:</span>
              <span className="text-base font-bold text-[#F7F4EF] whitespace-nowrap">{current.amount}</span>
            </div>
          </div>

          {/* Side-by-Side: Static Baseline vs AI Recommendation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Left: What Legacy Rules Would Do */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1C1B18] border border-[#2C2A24] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-[#777168] uppercase tracking-wider whitespace-nowrap">
                  STATIC DETERMINISTIC BASELINE
                </span>
                <span className="text-[9.5px] font-mono text-[#C85A3E] bg-[#C85A3E]/10 px-2 py-0.5 rounded border border-[#C85A3E]/20 whitespace-nowrap">
                  LEGACY RULE
                </span>
              </div>
              <div className="text-sm font-mono font-bold text-[#D8D0C3]">
                {current.baselineAction}
              </div>
              <p className="text-xs font-sans text-[#777168] leading-relaxed">
                {current.baselineActionDetail}
              </p>
            </div>

            {/* Right: What Groq AI Proposes */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#1C1B18] border border-[#E5C378]/40 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#E5C378] animate-pulse flex-shrink-0" />
                  <span className="text-[10px] font-mono font-bold text-[#E5C378] uppercase tracking-wider whitespace-nowrap">
                    GROQ AI PROPOSAL
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#E5C378] bg-[#E5C378]/15 px-2 py-0.5 rounded border border-[#E5C378]/30 whitespace-nowrap">
                  {current.aiConfidence}% CONFIDENCE
                </span>
              </div>
              <div className="text-sm font-mono font-black text-[#F7F4EF] flex items-center gap-1.5">
                <span>{current.aiRecommendation}</span>
                <span className="text-[10px] font-mono text-[#A39A8E] font-normal">({current.aiProvider})</span>
              </div>
              <p className="text-xs font-sans text-[#A39A8E] leading-relaxed">
                {current.aiRecommendationDetail}
              </p>
            </div>

          </div>

          {/* AI Reasoning Quote Box */}
          <div className="p-3 sm:p-4 rounded-2xl bg-[#1C1B18]/70 border border-[#2C2A24] space-y-1 text-xs font-mono">
            <span className="text-[10px] font-bold text-[#C89A4A] tracking-wider uppercase block whitespace-nowrap">
              GROQ AI DIAGNOSTIC RATIONALE
            </span>
            <p className="font-sans italic text-[#D8D0C3] text-xs sm:text-[13px] leading-relaxed">
              "{current.aiReasoning}"
            </p>
          </div>

          {/* Policy Guard Pre-Check Disclaimer with generous spacing */}
          <div className="pt-2 border-t border-[#35332C] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#777168]">
            <div className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-[#C89A4A] flex-shrink-0" />
              <span>PROPOSAL ONLY · ZERO AUTONOMOUS DISPATCH YET</span>
            </div>

            <div className="flex items-center gap-1 text-[#E5C378] whitespace-nowrap flex-shrink-0 font-bold">
              <span>Next: Policy Guard Decides</span>
              <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Swipe Indicator */}
      <div className="pb-3 flex-shrink-0">
        <button
          onClick={onNext}
          className="inline-flex flex-col items-center gap-1.5 px-4 py-2 text-[11px] font-mono tracking-widest text-[#A39A8E] hover:text-[#F7F4EF] transition-colors cursor-pointer group"
        >
          <span className="tracking-[0.25em] font-bold">SWIPE</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-[#C89A4A]" />
        </button>
      </div>
    </section>
  );
};
