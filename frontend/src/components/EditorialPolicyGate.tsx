import React, { useState, useEffect, useRef } from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { useInView } from '../hooks/useInView';
import { RotateCcw } from 'lucide-react';

interface EditorialPolicyGateProps {
  summary: EvaluationSummary;
}

type ScenarioType = 'APPROVED' | 'HUMAN_REVIEW' | 'BLOCKED';

interface PolicyScenario {
  id: ScenarioType;
  label: string;
  shortLabel: string;
  proposedAction: string;
  confidence: number;
  triggerContext: string;
  ruleEvaluated: string;
  policyResult: 'APPROVED' | 'HUMAN REVIEW REQUIRED' | 'BLOCKED';
  resultDescription: string;
  statusColor: string;
  statusBg: string;
  statusBorder: string;
}

export const EditorialPolicyGate: React.FC<EditorialPolicyGateProps> = ({ summary }) => {
  const [sectionRef, isInView] = useInView({ threshold: 0.18 });
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('APPROVED');
  const [animStep, setAnimStep] = useState<number>(0);
  const [isHoveredGate, setIsHoveredGate] = useState<boolean>(false);
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

  // Scenarios strictly grounded in backend policy rules (services/policy_guard.py)
  const scenarios: Record<ScenarioType, PolicyScenario> = {
    APPROVED: {
      id: 'APPROVED',
      label: 'Autonomous Approval',
      shortLabel: 'APPROVED',
      proposedAction: 'SMART_RETRY',
      confidence: 88,
      triggerContext: 'Transient Gateway 503 Timeout (Recovery Attempts < 2)',
      ruleEvaluated: 'Velocity limits verified • Economic ROI positive • Authorized action set',
      policyResult: 'APPROVED',
      resultDescription: 'Action cleared for execution. Within deterministic retry bounds.',
      statusColor: '#6F7F5F', // Muted Moss Green
      statusBg: 'rgba(111, 127, 95, 0.12)',
      statusBorder: '#71805A',
    },
    HUMAN_REVIEW: {
      id: 'HUMAN_REVIEW',
      label: 'Human Authorization Gate',
      shortLabel: 'HUMAN REVIEW',
      proposedAction: 'HUMAN_APPROVAL',
      confidence: 95,
      triggerContext: 'Enterprise Receivable > ₹25,000 threshold',
      ruleEvaluated: 'High-value ceiling rule enforced • AI autonomous execution barred',
      policyResult: 'HUMAN REVIEW REQUIRED',
      resultDescription: 'Held at gate. Manual operator sign-off mandatory before dispatch.',
      statusColor: '#C89A4A', // Warm Amber
      statusBg: 'rgba(200, 154, 74, 0.14)',
      statusBorder: '#C89A4A',
    },
    BLOCKED: {
      id: 'BLOCKED',
      label: 'Safety Stop / Blocked',
      shortLabel: 'BLOCKED',
      proposedAction: 'MANDATE_RETRY',
      confidence: 92,
      triggerContext: 'Closed Bank Token Hard Rejection (Attempts ≥ 2)',
      ruleEvaluated: 'Max retry velocity limit reached • Deterministic STOP lock enforced',
      policyResult: 'BLOCKED',
      resultDescription: 'REVORA prevented execution. Repetitive card penalty barrier locked.',
      statusColor: '#C85A3E', // Terracotta
      statusBg: 'rgba(200, 90, 62, 0.12)',
      statusBorder: '#C85A3E',
    },
  };

  const current = scenarios[activeScenario];

  // Sequential Animation Orchestration (0.8s proposal -> 1.0s approach -> 0.8s validation -> 0.5s pause -> 0.8s result)
  const runAnimationSequence = () => {
    // Clear any existing step timers
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    if (prefersReducedMotion) {
      setAnimStep(5);
      return;
    }

    setAnimStep(1); // Step 1: Proposal Enters (0ms)

    const t1 = setTimeout(() => {
      setAnimStep(2); // Step 2: Approach Gate & Activate Calipers (850ms)
    }, 850);

    const t2 = setTimeout(() => {
      setAnimStep(3); // Step 3: Policy Validation Indicators Pass (1850ms)
    }, 1850);

    const t3 = setTimeout(() => {
      setAnimStep(4); // Step 4: Decision Pause (2650ms)
    }, 2650);

    const t4 = setTimeout(() => {
      setAnimStep(5); // Step 5: Final Determination Emerges (3150ms)
    }, 3150);

    timerRef.current = [t1, t2, t3, t4];
  };

  // Trigger animation when section scrolls into view
  useEffect(() => {
    if (isInView) {
      runAnimationSequence();
    }
    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [isInView, activeScenario, prefersReducedMotion]);

  const handleSelectScenario = (type: ScenarioType) => {
    if (activeScenario === type && animStep === 5) {
      runAnimationSequence();
    } else {
      setActiveScenario(type);
    }
  };

  // Derived progress values for SVG Gate
  const isApproved = current.id === 'APPROVED';
  const isBlocked = current.id === 'BLOCKED';
  const isReview = current.id === 'HUMAN_REVIEW';

  // Animation phase flags
  const isProposalVisible = animStep >= 1;
  const isAtGate = animStep >= 2;
  const isValidating = animStep >= 3;
  const isFinalResult = animStep >= 5;

  return (
    <section
      id="scene-guard"
      ref={sectionRef}
      className="relative w-full py-8 px-3 sm:px-6 lg:px-10 select-none"
    >
      {/* Central Floating Warm Editorial Canvas (Matching Section 1, 2, 3) */}
      <div className="w-full max-w-[1400px] mx-auto rounded-[24px] sm:rounded-[32px] bg-[#F7F4EF] border border-[#EDE6DA] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-10 lg:p-14 text-[#1C1B18] relative overflow-hidden">

        {/* Section Header: Label + Title + Narrative Subtitle */}
        <div
          className={`space-y-4 pb-8 border-b border-[#E5DFD5] transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EDE6DA] text-[11px] font-mono font-bold text-[#777168] tracking-wider">
                04 / POLICY GATE
              </span>
              <span className="text-[11px] font-mono text-[#9A9388] uppercase tracking-widest hidden sm:inline">
                DETERMINISTIC VALIDATION CHECKPOINT
              </span>
            </div>

            {/* Replay Sequence Button */}
            <button
              onClick={runAnimationSequence}
              title="Replay policy gate validation flow"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EDE6DA]/70 hover:bg-[#EDE6DA] border border-[#E0D8CC] text-[11px] font-mono font-bold text-[#524E48] transition-all cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${animStep > 0 && animStep < 5 ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">REPLAY FLOW</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-display font-bold text-[#1C1B18] tracking-tight leading-[1.1] uppercase">
                IS REVORA ALLOWED TO DO IT?
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base text-[#777168] font-sans leading-relaxed">
                AI can propose recovery actions, but cannot execute them. Every candidate must satisfy hard deterministic boundaries before release.
              </p>
            </div>
          </div>
        </div>

        {/* Minimal Editorial Scenario Selector (Secondary Controls - Not Dashboard Cards) */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 my-6 transition-all duration-700 delay-100 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#9A9388] mr-1">
              SCENARIO:
            </span>
            {(['APPROVED', 'HUMAN_REVIEW', 'BLOCKED'] as ScenarioType[]).map((type) => {
              const sc = scenarios[type];
              const isSelected = activeScenario === type;
              return (
                <button
                  key={type}
                  onClick={() => handleSelectScenario(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5 border ${isSelected
                      ? 'bg-[#EDE6DA] border-[#D8D0C3] text-[#1C1B18] font-bold shadow-sm'
                      : 'bg-[#F7F4EF] hover:bg-[#EDE6DA]/50 border-[#E5DFD5] text-[#777168]'
                    }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sc.statusColor }}
                  />
                  <span>{sc.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Understated Real Telemetry Indicators */}
          <div className="flex items-center gap-3 text-[10px] font-mono text-[#9A9388]">
            <span className="bg-[#EDE6DA]/60 px-2 py-0.5 rounded border border-[#E0D8CC]">
              100% POLICY GATED
            </span>
            <span className="bg-[#EDE6DA]/60 px-2 py-0.5 rounded border border-[#E0D8CC]">
              {summary.human_approval_count} REVIEW
            </span>
            <span className="bg-[#EDE6DA]/60 px-2 py-0.5 rounded border border-[#E0D8CC]">
              {summary.stopped_count || 0} STOPPED
            </span>
          </div>
        </div>

        {/* THE MAIN EXPERIENCE: THE POLICY GATE (Deep Warm Architectural Centerpiece) */}
        <div
          className={`my-6 rounded-3xl bg-[#24231F] border border-[#35332C] p-6 sm:p-10 transition-all duration-700 delay-150 shadow-[0_20px_50px_rgba(0,0,0,0.18)] text-[#F7F4EF] ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          onMouseEnter={() => setIsHoveredGate(true)}
          onMouseLeave={() => setIsHoveredGate(false)}
        >
          {/* Top Corridor Status Wire */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#3A3830] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-widest text-[#A39A8E] uppercase">
                CONTROLLED CORRIDOR:
              </span>
              <span className="text-[#F7F4EF] font-bold">
                PROPOSED → VALIDATED → CONTROLLED
              </span>
            </div>

            {/* Current Animation Phase Banner */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#777168]">
                STAGE:
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider"
                style={{
                  backgroundColor: isFinalResult ? current.statusBg : 'rgba(229, 195, 120, 0.2)',
                  color: isFinalResult ? current.statusColor : '#8A6A1A',
                  border: `1px solid ${isFinalResult ? current.statusBorder : '#E5C378'}`,
                }}
              >
                {animStep === 1 && '1. PROPOSAL INGESTED'}
                {animStep === 2 && '2. APPROACHING GATE'}
                {animStep === 3 && '3. DETERMINISTIC CHECK'}
                {animStep === 4 && '4. DECISION PAUSE'}
                {animStep >= 5 && `5. POLICY ${current.policyResult}`}
              </span>
            </div>
          </div>

          {/* Monumental Abstract Gate Canvas (SVG + Geometric Precision Engineering) */}
          <div className="relative w-full py-8 sm:py-12 my-2 overflow-hidden flex flex-col items-center justify-center">

            <svg
              viewBox="0 0 1000 320"
              className="w-full h-auto max-h-[380px] overflow-visible select-none"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.03))' }}
            >
              <defs>
                {/* Flow Linear Gradients */}
                <linearGradient id="proposalFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E5C378" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#E5C378" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="approvedFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6F7F5F" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#71805A" stopOpacity="1" />
                </linearGradient>

                <linearGradient id="blockedFlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#E5C378" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#C85A3E" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Background Precision Caliper Guidelines */}
              <g opacity="0.6">
                <line x1="80" y1="60" x2="920" y2="60" stroke="#3A3830" strokeWidth="1" strokeDasharray="3 6" />
                <line x1="80" y1="260" x2="920" y2="260" stroke="#3A3830" strokeWidth="1" strokeDasharray="3 6" />

                {/* Horizontal Coordinate Ticks */}
                {[150, 300, 450, 500, 550, 700, 850].map((x) => (
                  <line key={x} x1={x} y1="54" x2={x} y2="66" stroke="#555044" strokeWidth="1.2" />
                ))}
                {[150, 300, 450, 500, 550, 700, 850].map((x) => (
                  <line key={x} x1={x} y1="254" x2={x} y2="266" stroke="#555044" strokeWidth="1.2" />
                ))}
              </g>

              {/* ------------------------------------------------------------- */}
              {/* SECTION A: LEFT SIDE — THE AI PROPOSAL PATH (X: 80 to 460)     */}
              {/* ------------------------------------------------------------- */}

              {/* Static Foundation Track (Pre-Gate) */}
              <line
                x1="80"
                y1="160"
                x2="460"
                y2="160"
                stroke="#3A3830"
                strokeWidth="2.5"
                strokeDasharray="4 6"
              />

              {/* Fragmented / Uncertain AI Flow Vector (Warm Gold) */}
              {isProposalVisible && (
                <path
                  d="M 80 160 L 460 160"
                  fill="none"
                  stroke={isBlocked && isFinalResult ? 'url(#blockedFlowGrad)' : 'url(#proposalFlowGrad)'}
                  strokeWidth="3.5"
                  strokeDasharray={isAtGate ? 'none' : '8 6'}
                  className="transition-all duration-700 ease-out"
                  style={{
                    strokeDashoffset: isAtGate ? 0 : 30,
                    opacity: isProposalVisible ? 1 : 0,
                  }}
                />
              )}

              {/* Moving Proposal Transit Capsule (Warm Gold) */}
              <g
                className="transition-all ease-out"
                style={{
                  transform: `translateX(${!isProposalVisible
                      ? '0px'
                      : animStep === 1
                        ? '120px'
                        : animStep === 2
                          ? '310px'
                          : '360px'
                    })`,
                  transitionDuration: animStep === 1 ? '850ms' : '1000ms',
                }}
              >
                {isProposalVisible && (
                  <g>
                    {/* Proposal Capsule Body */}
                    <rect
                      x="70"
                      y="142"
                      width="100"
                      height="36"
                      rx="18"
                      fill="#303028"
                      stroke="#E5C378"
                      strokeWidth="2"
                    />
                    <circle cx="90" cy="160" r="4" fill="#C89A4A" />
                    <text
                      x="102"
                      y="164"
                      fill="#F7F4EF"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="700"
                      letterSpacing="0.5"
                    >
                      {current.proposedAction.replace('_', ' ')}
                    </text>

                    {/* AI Confidence Pin Tag */}
                    <rect
                      x="82"
                      y="114"
                      width="76"
                      height="18"
                      rx="4"
                      fill="#1E1D19"
                      stroke="#454238"
                      strokeWidth="1"
                    />
                    <text
                      x="120"
                      y="126"
                      textAnchor="middle"
                      fill="#E5C378"
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      AI PROPOSAL
                    </text>
                    <line x1="120" y1="132" x2="120" y2="142" stroke="#454238" strokeWidth="1" />
                  </g>
                )}
              </g>

              {/* Pre-Gate Calibration Label */}
              <text
                x="120"
                y="210"
                fill="#A39A8E"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="1"
              >
                AI CANDIDATE STREAM
              </text>

              {/* ------------------------------------------------------------- */}
              {/* SECTION B: CENTER — THE ABSTRACT POLICY GATE (X: 470 to 530)   */}
              {/* ------------------------------------------------------------- */}

              {/* Gate Corridor Structural Background */}
              <rect
                x="465"
                y="50"
                width="70"
                height="220"
                rx="6"
                fill="#1A1916"
                stroke="#3A3830"
                strokeWidth="1.5"
                opacity={isHoveredGate || isAtGate ? '1' : '0.7'}
                className="transition-all duration-300"
              />

              {/* Left Vertical Monolith Structure */}
              <g className="transition-all duration-500" style={{ transform: isAtGate ? 'translateX(-2px)' : 'none' }}>
                <rect
                  x="458"
                  y="40"
                  width="12"
                  height="240"
                  rx="3"
                  fill="#121212"
                  stroke="#26241E"
                  strokeWidth="1"
                />
                {/* Structural Measurement Notches */}
                {[60, 90, 120, 150, 180, 210, 240, 260].map((y) => (
                  <line key={y} x1="461" y1={y} x2="467" y2={y} stroke="#A39A8E" strokeWidth="1.2" />
                ))}
              </g>

              {/* Right Vertical Monolith Structure */}
              <g className="transition-all duration-500" style={{ transform: isAtGate ? 'translateX(2px)' : 'none' }}>
                <rect
                  x="530"
                  y="40"
                  width="12"
                  height="240"
                  rx="3"
                  fill="#121212"
                  stroke="#26241E"
                  strokeWidth="1"
                />
                {/* Structural Measurement Notches */}
                {[60, 90, 120, 150, 180, 210, 240, 260].map((y) => (
                  <line key={y} x1="533" y1={y} x2="539" y2={y} stroke="#A39A8E" strokeWidth="1.2" />
                ))}
              </g>

              {/* Gate Center Axis Line (The Decision Horizon) */}
              <line
                x1="500"
                y1="40"
                x2="500"
                y2="280"
                stroke={
                  isFinalResult
                    ? current.statusColor
                    : isValidating
                      ? '#C89A4A'
                      : '#454238'
                }
                strokeWidth={isValidating || isFinalResult ? '2.5' : '1.5'}
                strokeDasharray={isValidating ? '3 3' : 'none'}
                className="transition-all duration-500"
              />

              {/* Top Gate Caliper Header */}
              <rect x="445" y="24" width="110" height="20" rx="4" fill="#121212" stroke="#3A3830" strokeWidth="1" />
              <text
                x="500"
                y="37"
                textAnchor="middle"
                fill="#F7F4EF"
                fontSize="9"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="800"
                letterSpacing="1"
              >
                POLICY GUARD
              </text>

              {/* Bottom Gate Foundation Anchor */}
              <rect x="445" y="276" width="110" height="20" rx="4" fill="#121212" stroke="#3A3830" strokeWidth="1" />
              <text
                x="500"
                y="289"
                textAnchor="middle"
                fill="#EDE6DA"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="700"
                letterSpacing="1"
              >
                DETERMINISTIC BOUND
              </text>

              {/* Validation Scanning Indicators (Active inside corridor during Step 3) */}
              {isValidating && !isFinalResult && (
                <g className="animate-pulse">
                  <circle cx="500" cy="110" r="5" fill="#C89A4A" opacity="0.9" />
                  <circle cx="500" cy="160" r="7" fill="#C89A4A" opacity="0.6" />
                  <circle cx="500" cy="210" r="5" fill="#C89A4A" opacity="0.9" />
                  <text
                    x="500"
                    y="136"
                    textAnchor="middle"
                    fill="#8A6A1A"
                    fontSize="8"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                  >
                    EVALUATING
                  </text>
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SECTION C: GATE REACTION & DECISION DYNAMICS (Threshold X: 500) */}
              {/* ------------------------------------------------------------- */}

              {/* (1) APPROVED STATE: Green path cleanly passes through to right */}
              {isApproved && isFinalResult && (
                <g className="transition-all duration-700 ease-out">
                  {/* Clean Moss Green Unified Path through and beyond */}
                  <path
                    d="M 460 160 L 920 160"
                    fill="none"
                    stroke="url(#approvedFlowGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Flow transit marker moving forward to execution horizon */}
                  <circle cx="720" cy="160" r="6" fill="#6F7F5F" stroke="#F7F4EF" strokeWidth="2" />
                  <circle cx="860" cy="160" r="4" fill="#71805A" />

                  {/* Approved Corridor Seal */}
                  <circle cx="500" cy="160" r="14" fill="#F7F4EF" stroke="#6F7F5F" strokeWidth="2.5" />
                  <line x1="494" y1="160" x2="498" y2="164" stroke="#6F7F5F" strokeWidth="2" strokeLinecap="round" />
                  <line x1="498" y1="164" x2="506" y2="156" stroke="#6F7F5F" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}

              {/* (2) BLOCKED STATE: Terracotta barrier stop right at the gate threshold */}
              {isBlocked && isFinalResult && (
                <g className="transition-all duration-500 ease-out">
                  {/* Path termination block (Does NOT cross X: 500) */}
                  <rect
                    x="486"
                    y="136"
                    width="12"
                    height="48"
                    rx="3"
                    fill="#C85A3E"
                    stroke="#F7F4EF"
                    strokeWidth="2"
                  />
                  {/* Terracotta Stop Caliper Clamp */}
                  <line x1="492" y1="140" x2="492" y2="180" stroke="#F7F4EF" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="492" cy="160" r="3" fill="#F7F4EF" />

                  {/* Empty dashed non-executed track after gate */}
                  <line
                    x1="530"
                    y1="160"
                    x2="920"
                    y2="160"
                    stroke="#D8D0C3"
                    strokeWidth="2"
                    strokeDasharray="2 8"
                    opacity="0.5"
                  />
                  <text
                    x="680"
                    y="154"
                    textAnchor="middle"
                    fill="#C85A3E"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    letterSpacing="0.8"
                  >
                    DISPATCH PREVENTED BY POLICY
                  </text>
                </g>
              )}

              {/* (3) HUMAN REVIEW STATE: Warm amber holding chamber at the threshold */}
              {isReview && isFinalResult && (
                <g className="transition-all duration-500 ease-out">
                  {/* Holding Chamber Seal (Path paused at threshold) */}
                  <circle cx="500" cy="160" r="18" fill="#F7F4EF" stroke="#C89A4A" strokeWidth="2.5" />
                  <circle cx="500" cy="160" r="10" fill="none" stroke="#C89A4A" strokeWidth="1.5" strokeDasharray="3 3" />
                  <circle cx="500" cy="160" r="4" fill="#C89A4A" />

                  {/* Awaiting human sign-off track (Dashed, not automatically flowing) */}
                  <line
                    x1="530"
                    y1="160"
                    x2="920"
                    y2="160"
                    stroke="#C89A4A"
                    strokeWidth="2"
                    strokeDasharray="4 6"
                    opacity="0.7"
                  />
                  <text
                    x="680"
                    y="154"
                    textAnchor="middle"
                    fill="#8A6A1A"
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                    letterSpacing="0.8"
                  >
                    AWAITING OPERATOR SIGN-OFF
                  </text>
                </g>
              )}

              {/* ------------------------------------------------------------- */}
              {/* SECTION D: RIGHT SIDE — RESULT HORIZON (X: 540 to 920)        */}
              {/* ------------------------------------------------------------- */}

              {/* Default Foundation Track (Post-Gate) */}
              {!isFinalResult && (
                <line
                  x1="540"
                  y1="160"
                  x2="920"
                  y2="160"
                  stroke="#3A3830"
                  strokeWidth="2"
                  strokeDasharray="4 6"
                />
              )}

              {/* Post-Gate Horizon Label */}
              <text
                x="820"
                y="210"
                textAnchor="end"
                fill="#A39A8E"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
                letterSpacing="1"
              >
                EXECUTION BOUNDARY
              </text>
            </svg>

          </div>

          {/* POLICY DECISION OUTCOME HERO & METADATA (Directly underneath the gate visual) */}
          <div className="pt-6 border-t border-[#3A3830] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

            {/* Left Col (Span 7): Prominent Decision Result */}
            <div className="lg:col-span-7 space-y-2">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: current.statusColor }}
                />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#A39A8E]">
                  POLICY GUARD DETERMINATION:
                </span>
              </div>

              {/* Decision Typography (28-36px) */}
              <div
                className="text-2xl sm:text-3xl lg:text-4xl font-display font-black tracking-tight"
                style={{ color: current.statusColor }}
              >
                POLICY {current.policyResult}
              </div>

              <p className="text-xs sm:text-sm text-[#D8D0C3] font-sans leading-relaxed">
                {current.resultDescription}
              </p>
            </div>

            {/* Right Col (Span 5): Precise Secondary Metadata */}
            <div className="lg:col-span-5 bg-[#1A1916] p-4 sm:p-5 rounded-2xl border border-[#35332C] space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between pb-2 border-b border-[#2C2A24]">
                <span className="text-[#A39A8E] text-[11px]">PROPOSED ACTION:</span>
                <span className="font-bold text-[#F7F4EF]">
                  {current.proposedAction}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-[#2C2A24]">
                <span className="text-[#A39A8E] text-[11px]">POLICY RESULT:</span>
                <span
                  className="font-bold uppercase"
                  style={{ color: current.statusColor }}
                >
                  {current.policyResult}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#A39A8E] text-[11px]">EXECUTION STATUS:</span>
                <span className="font-bold text-[#A39A8E] bg-[#24231F] px-2 py-0.5 rounded text-[10px] tracking-wider border border-[#35332C]">
                  PENDING
                </span>
              </div>
            </div>

          </div>

          {/* Compact Rule Validation Note (Deterministic checks strictly from backend) */}
          <div className="mt-6 pt-4 border-t border-[#3A3830] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#A39A8E]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F7F4EF]">DETERMINISTIC EVALUATION:</span>
              <span className="text-[#D8D0C3]">{current.ruleEvaluated}</span>
            </div>
            <span className="text-[#A39A8E]">
              Context: {current.triggerContext}
            </span>
          </div>

        </div>

      </div>
    </section>
  );
};
