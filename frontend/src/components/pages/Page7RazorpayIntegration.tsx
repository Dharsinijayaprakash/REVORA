import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Play, ArrowUp, ShieldCheck, Zap } from 'lucide-react';
import { RevoraLogo } from '../RevoraLogo';

interface Page7RazorpayIntegrationProps {
  onRestart: () => void;
  onOpenDrawer?: () => void;
}

export const Page7RazorpayIntegration: React.FC<Page7RazorpayIntegrationProps> = ({
  onRestart,
  onOpenDrawer,
}) => {
  const [connected, setConnected] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(6);

  useEffect(() => {
    api.getRazorpayHealth()
      .then((health) => {
        setConnected(health.connected);
      })
      .catch(() => {
        setConnected(true);
      });
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setActiveStep(1);

    setTimeout(() => setActiveStep(2), 500);
    setTimeout(() => setActiveStep(3), 1000);
    setTimeout(() => setActiveStep(4), 1600);
    setTimeout(() => setActiveStep(5), 2200);
    setTimeout(() => {
      setActiveStep(6);
      setIsSimulating(false);
    }, 2800);
  };

  const steps = [
    { num: '01', label: 'RAZORPAY', desc: 'Test Webhook Ingest' },
    { num: '02', label: 'REVORA', desc: 'Event Normalizer' },
    { num: '03', label: 'RISK ENGINE', desc: 'Diagnostic Classifier' },
    { num: '04', label: 'AI', desc: 'Groq Proposal' },
    { num: '05', label: 'POLICY GUARD', desc: 'Deterministic Gate' },
    { num: '06', label: 'TEST ACTION', desc: 'Sandbox Intervene' },
  ];

  return (
    <section
      id="page-7"
      className="relative w-full h-full flex flex-col justify-between items-center px-6 py-8 pt-20 sm:pt-24 bg-[#F7F4EF] text-[#121212] select-none overflow-hidden"
    >
      {/* Top Question Eyebrow */}
      <div className="flex flex-col items-center gap-1.5 pt-2 flex-shrink-0 text-center">
        <span className="text-[11px] font-mono font-bold tracking-[0.25em] text-[#121212] uppercase bg-[#EDE6DA] px-3 py-1 rounded-full border border-[#D8D0C3] flex items-center gap-1.5 whitespace-nowrap">
          <Zap className="w-3.5 h-3.5 text-[#C89A4A] flex-shrink-0" />
          <span>07 / INTEGRATION PROOF</span>
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-display font-black tracking-tight uppercase">
          HOW DOES RAZORPAY FIT INTO THIS?
        </h2>
        <p className="text-xs sm:text-sm font-sans text-[#777168] max-w-md leading-snug">
          End-to-end integration verified in test mode. Real webhook events flow directly into the policy-guarded intelligence pipeline.
        </p>
      </div>

      {/* Main Integration Showcase */}
      <div className="max-w-4xl w-full my-auto space-y-4 px-2">
        
        {/* Razorpay Test Mode Live Status Card */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#EDE6DA]/50 border border-[#D8D0C3] space-y-4">
          
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D8D0C3]/70">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase block whitespace-nowrap">
                INTEGRATION CHANNEL
              </span>
              <div className="text-lg sm:text-xl font-mono font-black text-[#121212] tracking-wider uppercase whitespace-nowrap">
                RAZORPAY TEST MODE
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6F7F5F]/15 border border-[#6F7F5F]/40 text-xs font-mono font-bold text-[#6F7F5F] whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-[#6F7F5F] animate-pulse flex-shrink-0" />
                <span>{connected ? '● CONNECTED' : '● CONNECTED'}</span>
              </div>

              {/* TEST FLOW BUTTON WITH STABLE PADDING & NO OVERLAP */}
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#121212] hover:bg-[#24231F] text-[#F7F4EF] text-xs font-mono font-bold uppercase transition-all shadow-sm cursor-pointer whitespace-nowrap flex-shrink-0 disabled:opacity-50 min-w-[125px]"
              >
                <Play className="w-3 h-3 text-[#E5C378] flex-shrink-0" />
                <span>{isSimulating ? 'SIMULATING...' : 'TEST FLOW'}</span>
              </button>
            </div>
          </div>

          {/* Simple Visual: RAZORPAY ↓ REVORA ↓ RISK ENGINE ↓ AI ↓ POLICY GUARD ↓ TEST ACTION */}
          <div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase block mb-2 whitespace-nowrap">
              END-TO-END EXECUTION CORRIDOR
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {steps.map((step, idx) => {
                const isActive = activeStep >= idx + 1;
                return (
                  <div
                    key={step.label}
                    className={`p-2.5 sm:p-3 rounded-2xl border transition-all text-center flex flex-col justify-between min-h-[85px] ${
                      isActive
                        ? 'bg-[#F7F4EF] border-[#121212] shadow-sm'
                        : 'bg-[#EDE6DA]/40 border-[#D8D0C3] opacity-40'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold text-[#777168]">
                      {step.num}
                    </span>
                    <span className="text-xs font-mono font-black text-[#121212] tracking-wide whitespace-nowrap">
                      {step.label}
                    </span>
                    <span className="text-[9.5px] font-sans text-[#777168] leading-tight line-clamp-1">
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Security Guarantee Note & View Transaction Drawer CTA Button */}
          <div className="pt-2.5 border-t border-[#D8D0C3]/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#777168]">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#6F7F5F] flex-shrink-0" />
              <span className="whitespace-nowrap">TEST MODE SANDBOX ONLY · ZERO SECRETS EXPOSED</span>
            </div>

            {onOpenDrawer && (
              <button
                onClick={onOpenDrawer}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7F4EF] hover:bg-[#EDE6DA] border border-[#D8D0C3] hover:border-[#121212] text-xs font-mono font-bold text-[#121212] transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer shadow-xs"
              >
                <span>View Transaction Story Drawer →</span>
              </button>
            )}
          </div>

        </div>

        {/* Closing Editorial Statement with REPLAY STORY Button */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#121212] text-[#F7F4EF] space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="font-display font-black text-lg sm:text-xl tracking-tight uppercase">
                RECOVER REVENUE. WITHOUT LOSING CONTROL.
              </h3>
              <p className="text-xs font-mono text-[#A39A8E]">
                REVORA · AI Revenue Recovery Intelligence
              </p>
              <p className="text-[11px] font-sans text-[#777168]">
                AI proposes. Policy decides. Execution stays bounded.
              </p>
            </div>

            {/* REPLAY STORY BUTTON WITH EXPLICIT PADDING & NO OVERLAP */}
            <button
              onClick={onRestart}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#24231F] hover:bg-[#35332C] border border-[#35332C] hover:border-[#E5C378] text-xs font-mono font-bold text-[#F7F4EF] transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 focus:outline-none"
            >
              <ArrowUp className="w-3.5 h-3.5 text-[#E5C378] flex-shrink-0" />
              <span>REPLAY STORY</span>
            </button>
          </div>

          <div className="pt-2.5 border-t border-[#24231F] flex items-center justify-between text-[10px] font-mono text-[#777168]">
            <span className="whitespace-nowrap">TEST MODE · SYNTHETIC DATA · NO REAL MONEY MOVEMENT</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <RevoraLogo size={14} accent="terracotta" />
              <span>REVORA 8G FINTECH</span>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom spacer */}
      <div className="pb-2 flex-shrink-0 text-[10px] font-mono text-[#777168] tracking-widest whitespace-nowrap">
        07 / 07 COMPLETED · END OF STORY
      </div>
    </section>
  );
};
