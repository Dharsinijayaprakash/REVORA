import React, { useState, useEffect } from 'react';
import type { EvaluationSummary } from '../types/evaluation';
import { Signature3DVisual } from './Signature3DVisual';
import { formatINR } from '../utils/formatters';
import { Play, Pause } from 'lucide-react';

interface Continuous5StageStoryProps {
  summary: EvaluationSummary;
  onExploreConsole?: () => void;
  onSelectRootCause?: (cause: string) => void;
}

export const Continuous5StageStory: React.FC<Continuous5StageStoryProps> = ({
  summary,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Auto-play interval with smooth ~3.8s loop
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentStage((prev) => (prev >= 5 ? 1 : prev + 1));
        setIsTransitioning(false);
      }, 300);
    }, 4200);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const handleStageClick = (stageId: number) => {
    if (stageId === currentStage) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStage(stageId);
      setIsTransitioning(false);
    }, 200);
  };

  const stages = [
    {
      id: 1,
      numeral: '01',
      badgeText: '01 / 05',
      title: 'Revenue Leakage',
      subtitle: 'Money is slipping through the cracks before businesses even notice.',
      accentColor: '#C85A3E', // Terracotta
      accentBg: 'bg-[#C85A3E]',
      accentText: 'text-[#C85A3E]',
      timelineLabel: 'LEAKAGE',
      timelineSub: 'Revenue is leaking',
      metrics: [
        { label: 'AT RISK', value: formatINR(summary.total_revenue_at_risk) },
        { label: 'TRANSACTIONS', value: summary.total_at_risk_transactions.toLocaleString() },
      ],
      insight: {
        label: 'TOP ROOT CAUSE',
        title: 'Overdue Receivable',
        rate: '37.5%',
      },
      tags: ['RISK ENGINE', 'DETERMINISTIC ANALYSIS'],
    },
    {
      id: 2,
      numeral: '02',
      badgeText: '02 / 05',
      title: 'Diagnostic Classification',
      subtitle: 'REVORA identifies why revenue is at risk across distinct failure patterns.',
      accentColor: '#C89A4A', // Warm Amber
      accentBg: 'bg-[#C89A4A]',
      accentText: 'text-[#C89A4A]',
      timelineLabel: 'DIAGNOSIS',
      timelineSub: 'We understand why',
      metrics: [
        { label: 'CLASSIFIED CAUSES', value: `${Object.keys(summary.root_cause_performance || {}).length || 7} Classes` },
        { label: 'FAILURE TAXONOMY', value: 'Verified' },
      ],
      insight: {
        label: 'LARGEST VECTOR',
        title: 'Overdue Receivable',
        rate: formatINR(summary.root_cause_performance?.['OVERDUE_RECEIVABLE']?.recovered || 2681792),
      },
      tags: ['ROOT CAUSE SENSORS', 'FAILURE TAXONOMY'],
    },
    {
      id: 3,
      numeral: '03',
      badgeText: '03 / 05',
      title: 'AI Proposal',
      subtitle: 'AI proposes the safest recovery action based on the detected failure physics.',
      accentColor: '#C89A4A', // Warm Gold / Sand
      accentBg: 'bg-[#C89A4A]',
      accentText: 'text-[#C89A4A]',
      timelineLabel: 'AI PROPOSAL',
      timelineSub: 'AI recommends action',
      metrics: [
        { label: 'RECOMMENDATION', value: 'Smart Retry' },
        { label: 'CONFIDENCE', value: '88%' },
      ],
      insight: {
        label: 'PROPOSAL ENGINE',
        title: 'Groq AI Formulation',
        rate: 'Bounded',
      },
      tags: ['GROQ AI', 'BOUNDED CANDIDATE'],
    },
    {
      id: 4,
      numeral: '04',
      badgeText: '04 / 05',
      title: 'Policy Gate Validation',
      subtitle: 'Every proposed action is checked against deterministic safety boundaries before execution.',
      accentColor: '#6F7F5F', // Moss Green
      accentBg: 'bg-[#6F7F5F]',
      accentText: 'text-[#6F7F5F]',
      timelineLabel: 'POLICY GATE',
      timelineSub: 'Policy validates',
      metrics: [
        { label: 'POLICY ENFORCEMENT', value: '100% Gated' },
        { label: 'GATED REVIEWS', value: `${summary.human_approval_count} Invoices` },
      ],
      insight: {
        label: 'SAFETY GUARANTEE',
        title: 'Zero Unbounded Actions',
        rate: 'Active',
      },
      tags: ['POLICY GUARD', 'CRYPTOGRAPHIC BOUNDS'],
    },
    {
      id: 5,
      numeral: '05',
      badgeText: '05 / 05',
      title: 'Simulated Recovery',
      subtitle: 'Approved actions are simulated and measured for verified recovery impact.',
      accentColor: '#71805A', // Olive / Moss Green
      accentBg: 'bg-[#71805A]',
      accentText: 'text-[#71805A]',
      timelineLabel: 'RECOVERY',
      timelineSub: 'Simulated recovery',
      metrics: [
        { label: 'EXPECTED RECOVERY', value: formatINR(summary.expected_recovery_from_decision_engine) },
        { label: 'SIMULATED RECOVERY', value: formatINR(summary.total_amount_recovered) },
      ],
      insight: {
        label: 'RECOVERY RATE',
        title: 'Volume Yield',
        rate: `${(summary.recovery_rate * 100).toFixed(1)}%`,
      },
      tags: ['SIMULATED RECOVERY', 'AUDIT TRAIL LOGGED'],
    },
  ];

  const current = stages[currentStage - 1];

  return (
    <section className="relative w-full py-4 px-3 sm:px-6 lg:px-10 select-none">
      
      {/* Central Floating Warm Editorial Canvas */}
      <div className="w-full max-w-[1400px] mx-auto rounded-[24px] sm:rounded-[32px] bg-[#F7F4EF] border border-[#EDE6DA] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-10 lg:p-12 text-[#1C1B18] relative overflow-hidden flex flex-col justify-between min-h-[640px] sm:min-h-[680px]">
        
        {/* Top Header Row inside the Canvas */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E5DFD5]">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-sm sm:text-base font-black tracking-[0.25em] text-[#1C1B18] uppercase">
              REVORA
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE6DA]/70 border border-[#D8D0C3] text-[10px] font-mono text-[#777168]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6F7F5F]" />
              <span className="font-bold tracking-wider uppercase">SYNTHETIC EVALUATION</span>
            </div>

            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE6DA]/70 hover:bg-[#E5DFD5] border border-[#D8D0C3] text-[11px] font-mono text-[#524E48] transition-colors cursor-pointer"
              title={autoPlay ? 'Pause auto-play' : 'Play continuous presentation'}
            >
              {autoPlay ? <Pause className="w-3 h-3 text-[#524E48]" /> : <Play className="w-3 h-3 text-[#524E48]" />}
              <span className="hidden sm:inline">{autoPlay ? 'PAUSE' : 'PLAY'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area: Left Stage Information + Right 3D Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-6">
          
          {/* Left Column: Stage-Specific Information */}
          <div className={`lg:col-span-6 space-y-6 transition-all duration-300 ${
            isTransitioning ? 'opacity-40 translate-y-1' : 'opacity-100 translate-y-0'
          }`}>
            
            {/* Stage Pill */}
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EDE6DA] text-[11px] font-mono font-bold text-[#777168] tracking-wider">
              {current.badgeText}
            </div>

            {/* Stage Title (Refined, 28-36px) */}
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-display font-bold text-[#1C1B18] tracking-tight leading-snug">
                {current.title}
              </h1>
              <p className="text-sm sm:text-base text-[#777168] font-sans mt-2 max-w-lg leading-relaxed">
                {current.subtitle}
              </p>
            </div>

            {/* Stage Key Metrics & Insight Divider */}
            <div className="pt-4 border-t border-[#E5DFD5] grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              
              {/* Primary Key Metrics */}
              <div className="space-y-4">
                {current.metrics.map((m, idx) => (
                  <div key={idx}>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase block">
                      {m.label}
                    </span>
                    <div className="text-2xl sm:text-[28px] font-mono font-extrabold text-[#1C1B18] tracking-tight mt-0.5">
                      {m.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Insight Column */}
              <div className="p-4 rounded-2xl bg-[#EDE6DA]/50 border border-[#E0D8CC]">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase block mb-1">
                  {current.insight.label}
                </span>
                <div className="text-sm sm:text-base font-mono font-bold text-[#1C1B18]">
                  {current.insight.title}
                </div>
                <div className="text-xl sm:text-2xl font-mono font-black text-[#C85A3E] mt-1" style={{ color: current.accentColor }}>
                  {current.insight.rate}
                </div>
              </div>

            </div>

            {/* Small Telemetry Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {current.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-[#EDE6DA]/70 border border-[#D8D0C3] text-[10px] font-mono font-bold text-[#524E48] tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>

          </div>

          {/* Right Column: Signature 3D Visual with Deep Warm Anchor Surface */}
          <div className="lg:col-span-6 relative w-full h-[320px] sm:h-[400px] lg:h-[440px] rounded-2xl sm:rounded-3xl bg-[#24231F] border border-[#35332C] shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-center overflow-hidden p-2 sm:p-4">
            <Signature3DVisual stage={currentStage} className="w-full h-full" />
          </div>

        </div>

        {/* Bottom Horizontal 5-Step Process Timeline */}
        <div className="pt-6 border-t border-[#E5DFD5]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 items-center">
            {stages.map((stg) => {
              const isActive = currentStage === stg.id;
              return (
                <div
                  key={stg.id}
                  onClick={() => handleStageClick(stg.id)}
                  className={`group relative p-3 sm:p-4 rounded-2xl transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-[#EDE6DA] border-[#D8D0C3] shadow-sm'
                      : 'bg-[#F7F4EF] hover:bg-[#EDE6DA]/50 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span
                      className={`w-6 h-6 rounded-full text-xs font-mono font-bold flex items-center justify-center transition-colors ${
                        isActive
                          ? 'text-white'
                          : 'bg-[#EDE6DA] text-[#777168] group-hover:text-[#1C1B18]'
                      }`}
                      style={{
                        backgroundColor: isActive ? stg.accentColor : undefined,
                      }}
                    >
                      {stg.numeral}
                    </span>
                    <span className={`text-xs font-mono font-bold tracking-wider uppercase transition-colors ${
                      isActive ? 'text-[#1C1B18]' : 'text-[#777168] group-hover:text-[#1C1B18]'
                    }`}>
                      {stg.timelineLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#777168] font-sans truncate pl-8">
                    {stg.timelineSub}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </section>
  );
};
