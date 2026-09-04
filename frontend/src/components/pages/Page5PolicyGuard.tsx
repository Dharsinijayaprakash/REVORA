import React, { useState } from 'react';
import type { EvaluationSummary } from '../../types/evaluation';
import { ArrowDown, RotateCcw, ShieldCheck } from 'lucide-react';

interface Page5PolicyGuardProps {
  summary: EvaluationSummary;
  onNext: () => void;
}

type ScenarioType = 'APPROVED' | 'HUMAN_REVIEW' | 'BLOCKED';

export const Page5PolicyGuard: React.FC<Page5PolicyGuardProps> = ({ summary, onNext }) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('APPROVED');
  const [gateAnimKey, setGateAnimKey] = useState<number>(0);

  const scenarios: Record<ScenarioType, {
    label: string;
    action: string;
    decision: 'APPROVED' | 'HUMAN REVIEW' | 'BLOCKED';
    rule: string;
    statusColor: string;
    description: string;
  }> = {
    APPROVED: {
      label: 'TRANSIENT FAILURE',
      action: 'SMART_RETRY',
      decision: 'APPROVED',
      rule: 'Within retry velocity limits (< 2 attempts) • Economic ROI positive',
      statusColor: '#6F7F5F', // MOSS
      description: 'Action conforms strictly with merchant risk limits and brand velocity bounds. Cleared for dispatch.',
    },
    HUMAN_REVIEW: {
      label: 'HIGH VALUE INVOICE',
      action: 'HUMAN_APPROVAL',
      decision: 'HUMAN REVIEW',
      rule: 'Value > ₹25,000 ceiling • Autonomous execution barred by policy',
      statusColor: '#C89A4A', // AMBER
      description: 'Held at gate. Automated execution halted. Mandatory operator sign-off required before dispatch.',
    },
    BLOCKED: {
      label: 'CLOSED CARD REJECT',
      action: 'MANDATE_RETRY',
      decision: 'BLOCKED',
      rule: 'Attempts ≥ 2 on revoked token • Repetitive penalty stop lock enforced',
      statusColor: '#C85A3E', // TERRACOTTA
      description: 'Dispatch barred by Policy Guard. Protects merchant from network penalty fines.',
    },
  };

  const current = scenarios[selectedScenario];

  const handleReplay = () => {
    setGateAnimKey((prev) => prev + 1);
  };

  return (
    <section
      id="page-5"
      className="relative w-full h-full flex flex-col justify-between items-center px-6 py-8 pt-20 sm:pt-24 bg-[#F7F4EF] text-[#121212] select-none overflow-hidden"
    >
      {/* 1. TOP HERO EYEBROW & CORE QUESTION — DOMINANT & SPACIOUS */}
      <div className="flex flex-col items-center gap-2 pt-3 flex-shrink-0 text-center">
        <span className="text-[10px] font-mono font-bold tracking-[0.25em] text-[#6F7F5F] uppercase bg-[#6F7F5F]/10 px-3 py-1 rounded-full border border-[#6F7F5F]/25 flex items-center gap-1.5 whitespace-nowrap">
          <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 text-[#6F7F5F]" />
          <span>05 / POLICY GUARD</span>
        </span>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black tracking-tight uppercase mt-1">
          CAN THIS ACTION SAFELY PROCEED?
        </h2>

        {/* 2. ARCHITECTURAL HIERARCHY PILL: AI PROPOSES · POLICY DECIDES · EXECUTOR ACTS */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono pt-1 text-[#777168]">
          <span className="text-[#777168] whitespace-nowrap">AI PROPOSES</span>
          <span className="text-[#D8D0C3]">→</span>
          <span className="font-bold text-[#121212] px-2.5 py-0.5 rounded-full bg-[#EDE6DA] border border-[#D8D0C3] whitespace-nowrap">
            POLICY DECIDES
          </span>
          <span className="text-[#D8D0C3]">→</span>
          <span className="text-[#777168] whitespace-nowrap">EXECUTOR ACTS</span>
        </div>
      </div>

      {/* 3. MAIN CORRIDOR GATE CARD — CALM, PRECISE & CONTROLLED */}
      <div className="max-w-4xl w-full my-auto space-y-3.5 px-2">
        
        {/* Scenario Controls Strip — Clean, Uncluttered Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-[#777168] uppercase tracking-wider whitespace-nowrap mr-1">
              SELECT SCENARIO:
            </span>
            {(['APPROVED', 'HUMAN_REVIEW', 'BLOCKED'] as ScenarioType[]).map((scKey) => (
              <button
                key={scKey}
                onClick={() => { setSelectedScenario(scKey); handleReplay(); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border whitespace-nowrap focus:outline-none ${
                  selectedScenario === scKey
                    ? 'bg-[#121212] text-[#F7F4EF] border-[#121212] font-bold shadow-sm'
                    : 'bg-[#EDE6DA]/50 hover:bg-[#EDE6DA] border-[#D8D0C3] text-[#777168]'
                }`}
              >
                {scenarios[scKey].decision}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10.5px] font-mono text-[#777168] hidden sm:inline">
              {summary.human_approval_count} Gated Reviews Enforced
            </span>
            <button
              onClick={handleReplay}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDE6DA]/50 hover:bg-[#EDE6DA] border border-[#D8D0C3] text-xs font-mono text-[#777168] hover:text-[#121212] cursor-pointer whitespace-nowrap flex-shrink-0 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Replay Gate</span>
            </button>
          </div>
        </div>

        {/* Architectural Corridor Visualization */}
        <div className="p-5 sm:p-7 rounded-3xl bg-[#EDE6DA]/40 border border-[#D8D0C3] relative overflow-hidden space-y-4 shadow-sm">
          
          {/* Subtle Top Flow Indicator */}
          <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#D8D0C3]/60 text-[#777168]">
            <div className="flex items-center gap-2">
              <span>FLOW: AI PROPOSAL</span>
              <span className="text-[#A39A8E]">→</span>
              <span className="text-[#121212] font-bold">POLICY GUARD</span>
              <span className="text-[#A39A8E]">→</span>
              <span className="font-bold" style={{ color: current.statusColor }}>
                {current.decision}
              </span>
            </div>

            <span className="text-[10px] text-[#777168] font-mono uppercase tracking-wider">
              DETERMINISTIC GATE
            </span>
          </div>

          {/* SVG Gate Corridor */}
          <div key={gateAnimKey} className="py-2">
            <svg viewBox="0 0 800 130" className="w-full h-auto max-h-[140px] select-none">
              <defs>
                <linearGradient id="corridorGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C89A4A" stopOpacity="0.3" />
                  <stop offset="50%" stopColor="#121212" stopOpacity="0.8" />
                  <stop offset="100%" stopColor={current.statusColor} stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Approach Track */}
              <line x1="60" y1="65" x2="360" y2="65" stroke="#D8D0C3" strokeWidth="2" strokeDasharray="4 4" />

              {/* In-transit Proposal Capsule */}
              <g className="animate-slide-in-right">
                <rect x="110" y="47" width="120" height="36" rx="18" fill="#F7F4EF" stroke="#C89A4A" strokeWidth="1.5" />
                <text x="170" y="69" textAnchor="middle" fill="#121212" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                  {current.action}
                </text>
              </g>

              {/* POLICY GATE ARCHITECTURAL MONOLITH */}
              <rect x="380" y="10" width="40" height="110" rx="6" fill="#121212" stroke="#24231F" strokeWidth="1" />
              <line x1="400" y1="10" x2="400" y2="120" stroke={current.statusColor} strokeWidth="2" strokeDasharray="2 2" />
              
              <text x="400" y="8" textAnchor="middle" fill="#777168" fontSize="8.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                GATE
              </text>

              {/* Post-gate outcome */}
              {selectedScenario === 'APPROVED' && (
                <g>
                  <line x1="420" y1="65" x2="740" y2="65" stroke="#6F7F5F" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="700" cy="65" r="5" fill="#6F7F5F" />
                  <text x="580" y="55" textAnchor="middle" fill="#6F7F5F" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                    ✓ CLEARED FOR EXECUTION
                  </text>
                </g>
              )}

              {selectedScenario === 'HUMAN_REVIEW' && (
                <g>
                  <circle cx="400" cy="65" r="14" fill="#F7F4EF" stroke="#C89A4A" strokeWidth="2" />
                  <line x1="420" y1="65" x2="740" y2="65" stroke="#C89A4A" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="580" y="55" textAnchor="middle" fill="#C89A4A" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                    PAUSED FOR OPERATOR SIGN-OFF
                  </text>
                </g>
              )}

              {selectedScenario === 'BLOCKED' && (
                <g>
                  <rect x="394" y="45" width="12" height="40" rx="3" fill="#C85A3E" />
                  <line x1="420" y1="65" x2="740" y2="65" stroke="#D8D0C3" strokeWidth="2" strokeDasharray="2 6" opacity="0.5" />
                  <text x="580" y="55" textAnchor="middle" fill="#C85A3E" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
                    DISPATCH BARRED BY POLICY
                  </text>
                </g>
              )}
            </svg>
          </div>

          {/* 4. CURRENT DECISION & SUPPORTING EXPLANATION — CLEAN & PRECISE */}
          <div className="pt-3 border-t border-[#D8D0C3]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#777168] uppercase">DECISION:</span>
                <span className="font-bold text-sm tracking-wide" style={{ color: current.statusColor }}>
                  POLICY {current.decision}
                </span>
              </div>
              <p className="text-xs font-sans text-[#777168] max-w-md leading-relaxed">
                {current.description}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#F7F4EF] border border-[#D8D0C3] text-[11px] font-mono text-[#777168] max-w-sm">
              <span className="font-bold text-[#121212]">RULE:</span> {current.rule}
            </div>
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
          <ArrowDown className="w-4 h-4 animate-bounce text-[#6F7F5F]" />
        </button>
      </div>
    </section>
  );
};
