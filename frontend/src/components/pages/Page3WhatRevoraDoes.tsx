import React, { useState } from 'react';
import { ArrowDown, Check, ChevronRight } from 'lucide-react';

interface Page3WhatRevoraDoesProps {
  onNext: () => void;
}

export const Page3WhatRevoraDoes: React.FC<Page3WhatRevoraDoesProps> = ({ onNext }) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      num: '01',
      title: 'DETECT',
      subtitle: 'Captures failures in real time',
      desc: 'Ingests transaction drops and payment rejects across payment gateways before revenue slips.',
      accent: '#C85A3E',
    },
    {
      num: '02',
      title: 'DIAGNOSE',
      subtitle: 'Identifies failure physics',
      desc: 'Separates temporary network timeouts from permanent bank refusals across 7 archetypes.',
      accent: '#C89A4A',
    },
    {
      num: '03',
      title: 'PROPOSE',
      subtitle: 'AI formulates recovery action',
      desc: 'Groq AI proposes context-aware recovery cadences with calibrated confidence scoring.',
      accent: '#E5C378',
    },
    {
      num: '04',
      title: 'VALIDATE',
      subtitle: 'Deterministic safety check',
      desc: 'Policy Guard strictly enforces retry velocity caps, customer limits, and invoice thresholds.',
      accent: '#6F7F5F',
    },
    {
      num: '05',
      title: 'RECOVER',
      subtitle: 'Converts risk to capital',
      desc: 'Executes bounded interventions, safely returning lost money back into business revenue.',
      accent: '#71805A',
    },
  ];

  return (
    <section
      id="page-3"
      className="relative w-full h-full flex flex-col justify-between items-center px-6 py-8 pt-20 sm:pt-24 bg-[#F7F4EF] text-[#121212] select-none overflow-hidden"
    >
      {/* Top Question Eyebrow */}
      <div className="flex flex-col items-center gap-1.5 pt-2 flex-shrink-0 text-center">
        <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#121212] uppercase bg-[#EDE6DA] px-3 py-1 rounded-full border border-[#D8D0C3] whitespace-nowrap">
          03 / PRODUCT WORKFLOW
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight uppercase">
          WHAT CAN REVORA DO?
        </h2>
        <p className="text-xs sm:text-sm font-sans text-[#777168] max-w-md leading-snug">
          A progressive 5-stage intelligence pipeline moving from failure detection to safe recovery.
        </p>
      </div>

      {/* Main Workflow: DETECT → DIAGNOSE → PROPOSE → VALIDATE → RECOVER */}
      <div className="max-w-4xl w-full my-auto space-y-4 sm:space-y-6 px-2">
        
        {/* Horizontal Visual Step Sequence */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {steps.map((step, idx) => {
            const isSelected = activeStep === idx;
            return (
              <button
                key={step.title}
                onClick={() => setActiveStep(idx)}
                className={`p-3 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[130px] sm:min-h-[145px] text-left focus:outline-none ${
                  isSelected
                    ? 'bg-[#EDE6DA] border-[#D8D0C3] shadow-md'
                    : 'bg-[#F7F4EF] hover:bg-[#EDE6DA]/50 border-[#E0D8CC]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg text-[10px] sm:text-xs font-mono font-bold flex items-center justify-center transition-colors flex-shrink-0"
                      style={{
                        backgroundColor: isSelected ? step.accent : '#EDE6DA',
                        color: isSelected ? '#F7F4EF' : '#777168',
                      }}
                    >
                      {step.num}
                    </span>
                    {idx < activeStep ? (
                      <Check className="w-3.5 h-3.5 text-[#6F7F5F] flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-[#9A9388] flex-shrink-0" />
                    )}
                  </div>

                  <h3 className="text-xs sm:text-sm font-mono font-black tracking-wide text-[#121212] whitespace-nowrap">
                    {step.title}
                  </h3>

                  <p className="text-[10px] sm:text-[11px] font-sans text-[#777168] mt-0.5 leading-snug line-clamp-2">
                    {step.subtitle}
                  </p>
                </div>

                <div
                  className="w-full h-1 rounded-full mt-2 transition-colors"
                  style={{
                    backgroundColor: isSelected ? step.accent : '#D8D0C3',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Highlighted Step Narrative Detail */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#EDE6DA]/60 border border-[#E0D8CC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase block whitespace-nowrap">
              PHASE {steps[activeStep].num} — {steps[activeStep].title}
            </span>
            <p className="text-xs sm:text-sm font-sans text-[#121212] font-medium leading-relaxed">
              {steps[activeStep].desc}
            </p>
          </div>

          <div className="text-right flex-shrink-0">
            <span className="text-[11px] font-mono font-bold text-[#777168] bg-[#F7F4EF] px-3 py-1 rounded-lg border border-[#D8D0C3] whitespace-nowrap">
              Step {activeStep + 1} of 5
            </span>
          </div>
        </div>

      </div>

      {/* Bottom Swipe Indicator */}
      <div className="pb-3 flex-shrink-0">
        <button
          onClick={onNext}
          className="inline-flex flex-col items-center gap-1.5 px-4 py-2 text-[11px] font-mono tracking-widest text-[#777168] hover:text-[#121212] transition-colors cursor-pointer group"
        >
          <span className="tracking-[0.25em] font-bold">SWIPE</span>
          <ArrowDown className="w-4 h-4 animate-bounce text-[#C85A3E]" />
        </button>
      </div>
    </section>
  );
};
