import React, { useState, useEffect, useRef } from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { useInView } from '../hooks/useInView';
import { RotateCcw } from 'lucide-react';

interface EditorialRecoveryFlowProps {
  summary: EvaluationSummary;
}

export const EditorialRecoveryFlow: React.FC<EditorialRecoveryFlowProps> = ({ summary }) => {
  const [sectionRef, isInView] = useInView({ threshold: 0.15 });
  const [animStage, setAnimStage] = useState<number>(0);
  const [hoveredStream, setHoveredStream] = useState<'success' | 'failed' | 'amount' | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Check user preference for reduced motion
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);

  // Real backend metrics
  const totalAttempts = summary.total_recovery_attempts || 1522;
  const successfulRecoveries = summary.successful_recoveries || 654;
  const failedRecoveries = summary.failed_recoveries || (totalAttempts - successfulRecoveries);
  const successRatePct = (summary.recovery_rate * 100).toFixed(2);

  // Amounts in Crores
  const expectedAmount = summary.expected_recovery_from_decision_engine || 23500000;
  const simulatedAmount = summary.actual_simulated_recovery || summary.total_amount_recovered || 16500000;
  const expectedCr = (expectedAmount / 10000000).toFixed(2);
  const simulatedCr = (simulatedAmount / 10000000).toFixed(2);

  // Sequential Animation Orchestration (~3.4s total)
  // Stage 1 (0ms): Policy Approved continuous moss line enters
  // Stage 2 (800ms): Splits into transaction pulses (1,522 ATTEMPTS)
  // Stage 3 (1700ms): Successful continue, unsuccessful gently fade (654 SUCCESSFUL)
  // Stage 4 (2500ms): Converges into one large capital stream
  // Stage 5 (3100ms): Final Simulated Recovery Climax (~₹1.65 Cr)
  const runAnimationSequence = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    if (prefersReducedMotion) {
      setAnimStage(5);
      return;
    }

    setAnimStage(1);

    const t1 = setTimeout(() => setAnimStage(2), 800);
    const t2 = setTimeout(() => setAnimStage(3), 1700);
    const t3 = setTimeout(() => setAnimStage(4), 2500);
    const t4 = setTimeout(() => setAnimStage(5), 3100);

    timerRef.current = [t1, t2, t3, t4];
  };

  useEffect(() => {
    if (isInView) {
      runAnimationSequence();
    }
    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [isInView, prefersReducedMotion]);

  const isApprovedEntering = animStage >= 1;
  const isAttemptsDividing = animStage >= 2;
  const isOutcomeDiverging = animStage >= 3;
  const isCapitalConverging = animStage >= 4;
  const isFinalClimax = animStage >= 5;

  return (
    <section
      id="scene-recovery"
      ref={sectionRef}
      className="relative w-full py-8 px-3 sm:px-6 lg:px-10 select-none"
    >
      {/* Central Floating Warm Editorial Canvas (Matching Sections 1, 2, 3, 4) */}
      <div className="w-full max-w-[1400px] mx-auto rounded-[24px] sm:rounded-[32px] bg-[#F7F4EF] border border-[#EDE6DA] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-10 lg:p-14 text-[#1C1B18] relative overflow-hidden">

        {/* Section Header: Eyebrow + Title + Editorial Subtitle */}
        <div
          className={`space-y-4 pb-8 border-b border-[#E5DFD5] transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EDE6DA] text-[11px] font-mono font-bold text-[#777168] tracking-wider">
                05 / RECOVERY
              </span>
              <span className="text-[11px] font-mono text-[#9A9388] uppercase tracking-widest hidden sm:inline">
                CAPITAL RECOVERY STREAM
              </span>
            </div>

            {/* Replay Flow Button */}
            <button
              onClick={runAnimationSequence}
              title="Replay recovery stream transformation flow"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EDE6DA]/70 hover:bg-[#EDE6DA] border border-[#E0D8CC] text-[11px] font-mono font-bold text-[#524E48] transition-all cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${animStage > 0 && animStage < 5 ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">REPLAY STREAM</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-display font-bold text-[#1C1B18] tracking-tight leading-[1.1] uppercase">
                FROM APPROVAL TO RECOVERED CAPITAL
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base text-[#777168] font-sans leading-relaxed">
                Approved recovery actions are simulated against the at-risk transaction population to estimate realized recovery.
              </p>
            </div>
          </div>
        </div>

        {/* MAIN VISUAL: THE RECOVERY STREAM (Deep Warm Visual Anchor Surface) */}
        <div
          className={`my-8 rounded-3xl bg-[#24231F] border border-[#35332C] p-6 sm:p-10 relative overflow-hidden transition-all duration-700 delay-100 shadow-[0_20px_50px_rgba(0,0,0,0.18)] text-[#F7F4EF] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          {/* Top Short Animation Steps Wire */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#3A3830] text-xs font-mono">
            <div className="flex items-center gap-4 text-[11px]">
              <span className={`font-bold transition-colors ${animStage >= 1 ? 'text-[#8EA66E]' : 'text-[#777168]'}`}>
                01 APPROVED
              </span>
              <span className="text-[#555044]">→</span>
              <span className={`font-bold transition-colors ${animStage >= 2 ? 'text-[#F7F4EF]' : 'text-[#777168]'}`}>
                02 RECOVERY ATTEMPTS
              </span>
              <span className="text-[#555044]">→</span>
              <span className={`font-bold transition-colors ${animStage >= 3 ? 'text-[#8EA66E]' : 'text-[#777168]'}`}>
                03 SUCCESSFUL OUTCOMES
              </span>
              <span className="text-[#555044]">→</span>
              <span className={`font-bold transition-colors ${animStage >= 4 ? 'text-[#8EA66E]' : 'text-[#777168]'}`}>
                04 CAPITAL RECOVERED
              </span>
            </div>

            <div className="text-[10px] font-mono text-[#A39A8E] uppercase">
              {animStage === 1 && 'APPROVED STREAM INFLOW'}
              {animStage === 2 && '1,522 ATTEMPTS DISPATCHED'}
              {animStage === 3 && '654 SUCCESSES DIVERGING'}
              {animStage === 4 && 'CAPITAL STREAM CONVERGING'}
              {animStage >= 5 && 'SIMULATED RECOVERY REALIZED'}
            </div>
          </div>

          {/* SVG Canvas for Elegant Stream & Ribbon Flow */}
          <div className="relative w-full py-6 sm:py-10 my-2 overflow-visible">
            <svg
              viewBox="0 0 1000 320"
              className="w-full h-auto max-h-[360px] overflow-visible select-none"
            >
              <defs>
                <linearGradient id="mossInflowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#71805A" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6F7F5F" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="convergedCapitalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6F7F5F" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#71805A" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="fadeExitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#B8B0A2" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#C85A3E" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Reference Gridlines */}
              <g opacity="0.6">
                <line x1="40" y1="50" x2="960" y2="50" stroke="#3A3830" strokeWidth="1" strokeDasharray="3 6" />
                <line x1="40" y1="270" x2="960" y2="270" stroke="#3A3830" strokeWidth="1" strokeDasharray="3 6" />
              </g>

              {/* ------------------------------------------------------------- */}
              {/* STAGE 1: APPROVED ACTION (Continuing from Policy Gate)         */}
              {/* ------------------------------------------------------------- */}
              <g className="transition-opacity duration-700" opacity={isApprovedEntering ? 1 : 0}>
                {/* One continuous moss line entering from left */}
                <path
                  d="M 40 160 L 220 160"
                  fill="none"
                  stroke="url(#mossInflowGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />

                {/* Short Clean Label: 01 APPROVED */}
                <text
                  x="130"
                  y="142"
                  textAnchor="middle"
                  fill="#8EA66E"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                  letterSpacing="1"
                >
                  APPROVED
                </text>
              </g>

              {/* ------------------------------------------------------------- */}
              {/* STAGE 2: 1,522 TRANSACTION PULSES (Splits from moss line)     */}
              {/* ------------------------------------------------------------- */}
              <g className="transition-opacity duration-700" opacity={isAttemptsDividing ? 1 : 0}>
                {/* Pulse branch lines */}
                <path d="M 220 160 C 260 160, 280 100, 380 100" fill="none" stroke="#71805A" strokeWidth="2.5" strokeDasharray="4 4" />
                <path d="M 220 160 C 260 160, 280 130, 380 130" fill="none" stroke="#71805A" strokeWidth="2.5" strokeDasharray="4 4" />
                <path d="M 220 160 C 260 160, 280 160, 380 160" fill="none" stroke="#6F7F5F" strokeWidth="3.5" />
                <path d="M 220 160 C 260 160, 280 190, 380 190" fill="none" stroke="#555044" strokeWidth="2" strokeDasharray="3 3" />
                <path d="M 220 160 C 260 160, 280 220, 380 220" fill="none" stroke="#555044" strokeWidth="2" strokeDasharray="3 3" />

                {/* Short Clean Label: 1,522 ATTEMPTS */}
                <text
                  x="300"
                  y="72"
                  textAnchor="middle"
                  fill="#F7F4EF"
                  fontSize="11"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                  letterSpacing="0.8"
                >
                  1,522 ATTEMPTS
                </text>
              </g>

              {/* ------------------------------------------------------------- */}
              {/* STAGE 3: OUTCOME DIVERGENCE (Successful forward, Unsuccessful fade) */}
              {/* ------------------------------------------------------------- */}
              <g className="transition-opacity duration-700" opacity={isOutcomeDiverging ? 1 : 0}>

                {/* 1. Successful Pulses Continue Forward */}
                <g
                  onMouseEnter={() => setHoveredStream('success')}
                  onMouseLeave={() => setHoveredStream(null)}
                  className="cursor-pointer"
                >
                  <path d="M 380 100 C 460 100, 520 130, 620 145" fill="none" stroke="url(#mossInflowGrad)" strokeWidth={hoveredStream === 'success' ? 4.5 : 3.5} className="transition-all" />
                  <path d="M 380 130 C 460 130, 520 150, 620 155" fill="none" stroke="url(#mossInflowGrad)" strokeWidth={hoveredStream === 'success' ? 4.5 : 3.5} className="transition-all" />
                  <path d="M 380 160 C 460 160, 520 160, 620 160" fill="none" stroke="url(#mossInflowGrad)" strokeWidth={hoveredStream === 'success' ? 5 : 4} className="transition-all" />

                  {/* Flow beads */}
                  <circle cx="500" cy="132" r="4" fill="#6F7F5F" stroke="#F7F4EF" strokeWidth="1.5" />
                  <circle cx="560" cy="155" r="4.5" fill="#71805A" stroke="#F7F4EF" strokeWidth="1.5" />

                  {/* Short Clean Label: 654 SUCCESSFUL */}
                  <text
                    x="500"
                    y="85"
                    textAnchor="middle"
                    fill="#6F7F5F"
                    fontSize="11"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    letterSpacing="0.8"
                  >
                    654 SUCCESSFUL
                  </text>
                </g>

                {/* 2. Unsuccessful Pulses Gently Fade Away Downward */}
                <g
                  onMouseEnter={() => setHoveredStream('failed')}
                  onMouseLeave={() => setHoveredStream(null)}
                  className="cursor-pointer"
                >
                  <path d="M 380 190 C 450 190, 480 230, 580 245" fill="none" stroke="url(#fadeExitGrad)" strokeWidth={hoveredStream === 'failed' ? 3 : 2} strokeDasharray="4 4" className="transition-all" />
                  <path d="M 380 220 C 450 220, 480 250, 580 260" fill="none" stroke="url(#fadeExitGrad)" strokeWidth={hoveredStream === 'failed' ? 3 : 2} strokeDasharray="4 4" className="transition-all" />

                  <circle cx="580" cy="245" r="3" fill="#B8B0A2" opacity="0.5" />
                  <circle cx="580" cy="260" r="3" fill="#B8B0A2" opacity="0.5" />

                  <text
                    x="480"
                    y="240"
                    fill="#9A9388"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {failedRecoveries.toLocaleString()} UNRESOLVED (FADE)
                  </text>
                </g>
              </g>

              {/* ------------------------------------------------------------- */}
              {/* STAGE 4: CAPITAL CONVERGENCE (Into single solid stream)        */}
              {/* ------------------------------------------------------------- */}
              <g className="transition-opacity duration-700" opacity={isCapitalConverging ? 1 : 0}>
                {/* Successful pulses converge into one large capital stream */}
                <path d="M 620 145 C 670 150, 700 160, 750 160" fill="none" stroke="url(#convergedCapitalGrad)" strokeWidth="6" strokeLinecap="round" />
                <path d="M 620 155 C 670 158, 700 160, 750 160" fill="none" stroke="url(#convergedCapitalGrad)" strokeWidth="7" strokeLinecap="round" />
                <path d="M 620 160 L 800 160" fill="none" stroke="url(#convergedCapitalGrad)" strokeWidth="8" strokeLinecap="round" />

                <circle cx="720" cy="160" r="6" fill="#6F7F5F" stroke="#F7F4EF" strokeWidth="2" />
                <circle cx="780" cy="160" r="5" fill="#71805A" />
              </g>

              {/* ------------------------------------------------------------- */}
              {/* STAGE 5: FINAL RESULT CLIMAX (~₹1.65 Cr SIMULATED RECOVERY)  */}
              {/* ------------------------------------------------------------- */}
              <g
                className="transition-all duration-700 ease-out cursor-pointer"
                opacity={isFinalClimax ? 1 : 0}
                onMouseEnter={() => setHoveredStream('amount')}
                onMouseLeave={() => setHoveredStream(null)}
              >
                {/* Terminal Capital Collector Line */}
                <line x1="800" y1="120" x2="800" y2="200" stroke="#71805A" strokeWidth="2" strokeDasharray="3 3" />

                {/* Climax Visual Metric Display in SVG */}
                <text
                  x="820"
                  y="168"
                  fill="#8EA66E"
                  fontSize="30"
                  fontFamily="Syne, Plus Jakarta Sans, sans-serif"
                  fontWeight="800"
                  letterSpacing="-0.5"
                >
                  ~₹{simulatedCr} Cr
                </text>

                <text
                  x="822"
                  y="190"
                  fill="#A39A8E"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight="bold"
                  letterSpacing="1"
                >
                  SIMULATED RECOVERY
                </text>
              </g>

              {/* Contextual Interactive Hover Tooltips */}
              {hoveredStream === 'success' && (
                <g>
                  <rect x="420" y="44" width="200" height="24" rx="4" fill="#121212" stroke="#3A3830" strokeWidth="1" />
                  <text x="520" y="60" textAnchor="middle" fill="#EDE6DA" fontSize="9" fontFamily="JetBrains Mono, monospace">
                    {successfulRecoveries.toLocaleString()} successful attempts
                  </text>
                </g>
              )}

              {hoveredStream === 'failed' && (
                <g>
                  <rect x="420" y="274" width="210" height="24" rx="4" fill="#121212" stroke="#3A3830" strokeWidth="1" />
                  <text x="525" y="290" textAnchor="middle" fill="#EDE6DA" fontSize="9" fontFamily="JetBrains Mono, monospace">
                    {failedRecoveries.toLocaleString()} unsuccessful attempts
                  </text>
                </g>
              )}

              {hoveredStream === 'amount' && (
                <g>
                  <rect x="670" y="70" width="310" height="26" rx="4" fill="#121212" stroke="#3A3830" strokeWidth="1" />
                  <text x="825" y="87" textAnchor="middle" fill="#EDE6DA" fontSize="8.5" fontFamily="JetBrains Mono, monospace">
                    Synthetic evaluation result — no real payment was executed.
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* EDITORIAL RECOVERY RESULT & SUBTLE COMPARISON (No generic card grid) */}
          <div className="pt-8 border-t border-[#3A3830] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Col (Span 7): Subtle Horizontal Comparison Lines */}
            <div className="lg:col-span-7 space-y-6">

              {/* Expected Recovery Path */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#E5C378] uppercase tracking-wider">
                    EXPECTED RECOVERY
                  </span>
                  <span className="font-bold text-[#F7F4EF] text-sm">
                    ₹{expectedCr} Cr
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1A1916] overflow-hidden border border-[#35332C]">
                  <div className="h-full bg-[#E5C378] rounded-full w-full opacity-85" />
                </div>
                <span className="text-[11px] font-mono text-[#A39A8E] block">
                  Potential evaluation estimate
                </span>
              </div>

              {/* Simulated Realized Recovery Path */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#8EA66E] uppercase tracking-wider">
                    SIMULATED RECOVERY
                  </span>
                  <span className="font-bold text-[#8EA66E] text-base">
                    ~₹{simulatedCr} Cr
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#1A1916] overflow-hidden border border-[#35332C]">
                  <div
                    className="h-full bg-[#6F7F5F] rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        (parseFloat(simulatedCr) / parseFloat(expectedCr)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-[#D8D0C3] block">
                  Simulated realized outcome across network failure conditions
                </span>
              </div>

            </div>

            {/* Right Col (Span 5): Typography-Driven Metadata (Not KPI cards) */}
            <div className="lg:col-span-5 bg-[#1A1916] p-5 sm:p-6 rounded-2xl border border-[#35332C] space-y-4">
              <div>
                <div className="text-3xl sm:text-4xl font-mono font-black text-[#8EA66E] tracking-tight">
                  ~₹{simulatedCr} Cr
                </div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#A39A8E] mt-0.5">
                  SIMULATED RECOVERY
                </div>
              </div>

              <div className="pt-3 border-t border-[#2C2A24] space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#A39A8E]">SUCCESSFUL ATTEMPTS:</span>
                  <span className="font-bold text-[#F7F4EF]">
                    {successfulRecoveries.toLocaleString()} / {totalAttempts.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#A39A8E]">RECOVERY SUCCESS RATE:</span>
                  <span className="font-bold text-[#8EA66E]">
                    {successRatePct}%
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Simulation Disclosure */}
          <div className="mt-8 pt-4 border-t border-[#3A3830] flex items-center justify-between gap-3 text-[10px] font-mono text-[#A39A8E]">
            <span>SIMULATED RECOVERY · SYNTHETIC TRANSACTION DATA · NO REAL MONEY MOVEMENT</span>
            <span className="hidden sm:inline">GROQ AI EVALUATION</span>
          </div>

        </div>

      </div>
    </section>
  );
};
