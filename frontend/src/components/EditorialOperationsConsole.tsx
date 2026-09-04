import React, { useState, useEffect, useRef } from 'react';
import type { EvaluationSummary, TransactionEvaluation } from '../types/evaluation';
import { api } from '../services/api';
import { formatINR, formatLabel } from '../utils/formatters';
import { useInView } from '../hooks/useInView';
import { ArrowUpRight, RotateCcw, ChevronLeft, ChevronRight, Activity, Search } from 'lucide-react';

interface EditorialOperationsConsoleProps {
  onSelectTransaction: (tx: TransactionEvaluation) => void;
  atRiskCount?: number;
  initialRootCauseFilter?: string;
  summary?: EvaluationSummary;
}

export const EditorialOperationsConsole: React.FC<EditorialOperationsConsoleProps> = ({
  onSelectTransaction,
  atRiskCount = 2026,
  initialRootCauseFilter,
  summary: propSummary,
}) => {
  const [sectionRef, isInView] = useInView({ threshold: 0.15 });
  const [summary, setSummary] = useState<EvaluationSummary | null>(propSummary || null);
  const [transactions, setTransactions] = useState<TransactionEvaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pulseStage, setPulseStage] = useState<number>(0);
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);
  const [hoveredTxId, setHoveredTxId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'APPROVED' | 'HUMAN_REVIEW' | 'BLOCKED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const limit = 6;

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

  // Fetch summary if not provided through props
  useEffect(() => {
    if (propSummary) {
      setSummary(propSummary);
      return;
    }
    let isMounted = true;
    api.getEvaluationSummary()
      .then((data) => {
        if (isMounted) setSummary(data);
      })
      .catch((err) => console.error('Failed to fetch summary in console', err));
    return () => { isMounted = false; };
  }, [propSummary]);

  // Fetch transactions from API for real event stream
  useEffect(() => {
    let isMounted = true;
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const params: any = {
          limit,
          offset: (page - 1) * limit,
        };

        if (initialRootCauseFilter && initialRootCauseFilter !== 'all') {
          params.root_cause = initialRootCauseFilter;
        }

        if (statusFilter === 'APPROVED') {
          params.action = 'SMART_RETRY';
        } else if (statusFilter === 'HUMAN_REVIEW') {
          params.action = 'HUMAN_APPROVAL';
        } else if (statusFilter === 'BLOCKED') {
          params.action = 'STOP';
        }

        const response = await api.getTransactions(params);
        if (isMounted) {
          setTransactions(response.data || []);
          setTotalCount(response.total_count || 0);
        }
      } catch (err) {
        console.error('Failed to load transaction events', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchTransactions();
    return () => { isMounted = false; };
  }, [page, statusFilter, initialRootCauseFilter]);

  // Animated System Pulse Orchestration (3.4s total)
  // 1 (0ms): At-Risk node activates
  // 2 (700ms): Pulse travels to Analyzed
  // 3 (1400ms): Pulse moves to AI Proposal
  // 4 (2100ms): Policy Gate activates
  // 5 (2800ms): Recovery activates & settles
  const runSystemPulse = () => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];

    if (prefersReducedMotion) {
      setPulseStage(5);
      return;
    }

    setPulseStage(1);

    const t1 = setTimeout(() => setPulseStage(2), 700);
    const t2 = setTimeout(() => setPulseStage(3), 1400);
    const t3 = setTimeout(() => setPulseStage(4), 2100);
    const t4 = setTimeout(() => setPulseStage(5), 2800);

    timerRef.current = [t1, t2, t3, t4];
  };

  useEffect(() => {
    if (isInView) {
      runSystemPulse();
    }
    return () => {
      timerRef.current.forEach(clearTimeout);
    };
  }, [isInView, prefersReducedMotion]);

  // Derived real backend metrics
  const totalAtRisk = summary?.total_at_risk_transactions || atRiskCount || 2026;
  const totalRiskRevenueCr = summary?.total_revenue_at_risk
    ? (summary.total_revenue_at_risk / 10000000).toFixed(2)
    : '5.10';
  const simulatedRecoveryCr = summary?.actual_simulated_recovery || summary?.total_amount_recovered
    ? ((summary.actual_simulated_recovery || summary.total_amount_recovered) / 10000000).toFixed(2)
    : '1.65';
  const totalAttempts = summary?.total_recovery_attempts || 1522;
  const successfulAttempts = summary?.successful_recoveries || 654;
  const successRatePct = summary?.recovery_rate
    ? (summary.recovery_rate * 100).toFixed(2)
    : '42.97';
  const humanApprovalsCount = summary?.human_approval_count || 504;

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  // Filter transactions locally by search term if provided
  const filteredTransactions = transactions.filter((tx) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      tx.transaction_id.toLowerCase().includes(term) ||
      tx.root_cause.toLowerCase().includes(term) ||
      tx.final_action.toLowerCase().includes(term)
    );
  });

  return (
    <section
      id="scene-console"
      ref={sectionRef}
      className="relative w-full py-8 px-3 sm:px-6 lg:px-10 select-none"
    >
      {/* Central Floating Warm Editorial Canvas (Matching Sections 1–5) */}
      <div className="w-full max-w-[1400px] mx-auto rounded-[24px] sm:rounded-[32px] bg-[#F7F4EF] border border-[#EDE6DA] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-6 sm:p-10 lg:p-14 text-[#1C1B18] relative overflow-hidden">

        {/* Section Header: Eyebrow + Status Indicator + Large Editorial Heading */}
        <div
          className={`space-y-4 pb-8 border-b border-[#E5DFD5] transition-all duration-700 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EDE6DA] text-[11px] font-mono font-bold text-[#777168] tracking-wider">
                06 / OPERATIONS
              </span>
              <span className="text-[11px] font-mono text-[#9A9388] uppercase tracking-widest hidden sm:inline">
                RECOVERY CONSOLE
              </span>
            </div>

            {/* System Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE6DA]/70 border border-[#E0D8CC] text-[11px] font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6F7F5F] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6F7F5F]" />
              </span>
              <span className="font-bold text-[#6F7F5F] tracking-wide">OPERATIONAL</span>
              <span className="text-[#B8B0A2]">·</span>
              <span className="text-[#777168] text-[10px] hidden sm:inline">
                SYNTHETIC EVALUATION ENVIRONMENT
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-end">
            <div className="lg:col-span-8">
              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-display font-bold text-[#1C1B18] tracking-tight leading-[1.1] uppercase">
                THE RECOVERY SYSTEM, IN MOTION
              </h2>
            </div>
            <div className="lg:col-span-4">
              <p className="text-sm sm:text-base text-[#777168] font-sans leading-relaxed">
                A live operational view of detected risk, proposed actions, policy decisions and recovery outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* ASYMMETRIC OPERATIONAL LAYOUT: Operational Flow (Left) + Event Stream (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-8 items-start">

          {/* ----------------------------------------------------------------- */}
          {/* LEFT: THE OPERATIONAL FLOW MAP (Single System Map, Not 5 Cards)  */}
          {/* ----------------------------------------------------------------- */}
          <div className="lg:col-span-7 space-y-6">

            <div className="flex items-center justify-between pb-2 border-b border-[#D8D0C3]/60 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#777168]">
                <Activity className="w-3.5 h-3.5 text-[#C89A4A]" />
                <span className="font-bold tracking-wider text-[#1C1B18] uppercase">
                  END-TO-END PROCESSING MAP
                </span>
              </div>
              <button
                onClick={runSystemPulse}
                title="Retrigger operational system pulse"
                className="inline-flex items-center gap-1 text-[10px] text-[#777168] hover:text-[#1C1B18] cursor-pointer"
              >
                <RotateCcw className={`w-3 h-3 ${pulseStage > 0 && pulseStage < 5 ? 'animate-spin' : ''}`} />
                <span>PULSE SYSTEM</span>
              </button>
            </div>

            {/* Continuous Vertical Map Corridor */}
            <div className="relative pl-6 sm:pl-8 space-y-7 my-4 border-l-2 border-[#EDE6DA]">

              {/* STAGE 1: AT RISK */}
              <div
                onMouseEnter={() => setHoveredStage('at_risk')}
                onMouseLeave={() => setHoveredStage(null)}
                className={`relative transition-all duration-300 cursor-pointer ${pulseStage >= 1 ? 'opacity-100' : 'opacity-40'
                  }`}
              >
                {/* Connector Pin */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${pulseStage >= 1
                      ? 'bg-[#F7F4EF] border-[#C85A3E] ring-4 ring-[#C85A3E]/15'
                      : 'bg-[#EDE6DA] border-[#D8D0C3]'
                    }`}
                />

                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase block">
                      01 / AT RISK
                    </span>
                    <h3 className="text-xl sm:text-2xl font-mono font-bold text-[#1C1B18] tracking-tight">
                      {totalAtRisk.toLocaleString()} Transactions
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#C85A3E] bg-[#C85A3E]/10 px-2.5 py-0.5 rounded border border-[#C85A3E]/30">
                    ₹{totalRiskRevenueCr} Cr Ingested
                  </span>
                </div>

                <p className="text-xs font-sans text-[#777168] mt-1.5 leading-relaxed">
                  Revenue leakage detected across failed gateways, unpaid receivables, and abandoned carts.
                </p>

                {hoveredStage === 'at_risk' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#EDE6DA]/70 border border-[#D8D0C3] text-[11px] font-mono text-[#524E48]">
                    2,026 transactions identified as revenue at risk from core ledger stream.
                  </div>
                )}
              </div>

              {/* STAGE 2: ANALYZED */}
              <div
                onMouseEnter={() => setHoveredStage('analyzed')}
                onMouseLeave={() => setHoveredStage(null)}
                className={`relative transition-all duration-300 cursor-pointer ${pulseStage >= 2 ? 'opacity-100' : 'opacity-40'
                  }`}
              >
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${pulseStage >= 2
                      ? 'bg-[#F7F4EF] border-[#C89A4A] ring-4 ring-[#C89A4A]/15'
                      : 'bg-[#EDE6DA] border-[#D8D0C3]'
                    }`}
                />

                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase block">
                      02 / ANALYZED
                    </span>
                    <h3 className="text-xl sm:text-2xl font-mono font-bold text-[#1C1B18] tracking-tight">
                      7 Diagnostic Archetypes
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#8A6A1A] bg-[#E5C378]/20 px-2.5 py-0.5 rounded border border-[#E5C378]/40">
                    Root Cause Telemetry
                  </span>
                </div>

                <p className="text-xs font-sans text-[#777168] mt-1.5 leading-relaxed">
                  Classified into failure patterns (e.g. transient bank dips, expired card tokens, overdue invoices).
                </p>

                {hoveredStage === 'analyzed' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#EDE6DA]/70 border border-[#D8D0C3] text-[11px] font-mono text-[#524E48]">
                    Diagnosed across 7 failure archetypes to isolate recoverable from permanently failed items.
                  </div>
                )}
              </div>

              {/* STAGE 3: PROPOSED */}
              <div
                onMouseEnter={() => setHoveredStage('proposed')}
                onMouseLeave={() => setHoveredStage(null)}
                className={`relative transition-all duration-300 cursor-pointer ${pulseStage >= 3 ? 'opacity-100' : 'opacity-40'
                  }`}
              >
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${pulseStage >= 3
                      ? 'bg-[#F7F4EF] border-[#E5C378] ring-4 ring-[#E5C378]/20'
                      : 'bg-[#EDE6DA] border-[#D8D0C3]'
                    }`}
                />

                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase block">
                      03 / PROPOSED
                    </span>
                    <h3 className="text-xl sm:text-2xl font-mono font-bold text-[#1C1B18] tracking-tight">
                      AI Action Formulation
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#8A6A1A] bg-[#E5C378]/20 px-2.5 py-0.5 rounded border border-[#E5C378]/40">
                    GROQ AI
                  </span>
                </div>

                <p className="text-xs font-sans text-[#777168] mt-1.5 leading-relaxed">
                  Context-aware recovery candidates synthesized with confidence scoring and optimal retry cadences.
                </p>

                {hoveredStage === 'proposed' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#EDE6DA]/70 border border-[#D8D0C3] text-[11px] font-mono text-[#524E48]">
                    Targeted recovery proposals formulated by Groq AI without autonomous execution permissions.
                  </div>
                )}
              </div>

              {/* STAGE 4: POLICY CHECK */}
              <div
                onMouseEnter={() => setHoveredStage('policy_check')}
                onMouseLeave={() => setHoveredStage(null)}
                className={`relative transition-all duration-300 cursor-pointer ${pulseStage >= 4 ? 'opacity-100' : 'opacity-40'
                  }`}
              >
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${pulseStage >= 4
                      ? 'bg-[#F7F4EF] border-[#1C1B18] ring-4 ring-[#1C1B18]/15'
                      : 'bg-[#EDE6DA] border-[#D8D0C3]'
                    }`}
                />

                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase block">
                      04 / POLICY CHECK
                    </span>
                    <h3 className="text-xl sm:text-2xl font-mono font-bold text-[#1C1B18] tracking-tight">
                      100% Policy Gated
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#1C1B18] bg-[#EDE6DA] px-2.5 py-0.5 rounded border border-[#D8D0C3]">
                    {humanApprovalsCount} Gated Reviews
                  </span>
                </div>

                <p className="text-xs font-sans text-[#777168] mt-1.5 leading-relaxed">
                  Deterministic bounds verified. Actions exceeding ₹25,000 threshold routed for human operator review.
                </p>

                {hoveredStage === 'policy_check' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#EDE6DA]/70 border border-[#D8D0C3] text-[11px] font-mono text-[#524E48]">
                    Deterministic velocity and authorization boundaries enforced. Unbounded execution strictly prevented.
                  </div>
                )}
              </div>

              {/* STAGE 5: RECOVERY */}
              <div
                onMouseEnter={() => setHoveredStage('recovery')}
                onMouseLeave={() => setHoveredStage(null)}
                className={`relative transition-all duration-300 cursor-pointer ${pulseStage >= 5 ? 'opacity-100' : 'opacity-40'
                  }`}
              >
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${pulseStage >= 5
                      ? 'bg-[#F7F4EF] border-[#6F7F5F] ring-4 ring-[#6F7F5F]/20'
                      : 'bg-[#EDE6DA] border-[#D8D0C3]'
                    }`}
                />

                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-[#6F7F5F] uppercase block">
                      05 / RECOVERY OUTCOME
                    </span>
                    <h3 className="text-xl sm:text-2xl font-mono font-bold text-[#6F7F5F] tracking-tight">
                      ~₹{simulatedRecoveryCr} Cr Realized
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#6F7F5F] bg-[#6F7F5F]/10 px-2.5 py-0.5 rounded border border-[#6F7F5F]/30">
                    {successRatePct}% Success Rate
                  </span>
                </div>

                <p className="text-xs font-sans text-[#777168] mt-1.5 leading-relaxed">
                  {successfulAttempts.toLocaleString()} of {totalAttempts.toLocaleString()} simulated recovery attempts converted back into realized capital.
                </p>

                {hoveredStage === 'recovery' && (
                  <div className="mt-2 p-2.5 rounded-xl bg-[#EDE6DA]/70 border border-[#D8D0C3] text-[11px] font-mono text-[#524E48]">
                    654 successful attempts yielding ₹1.65 Cr simulated recovery across evaluation dataset.
                  </div>
                )}
              </div>

            </div>

            {/* Bottom System Processing Telemetry Strip */}
            <div className="pt-4 border-t border-[#D8D0C3]/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#EDE6DA]/50 border border-[#E0D8CC]">
                <span className="text-[10px] text-[#9A9388] block">ATTEMPTS</span>
                <span className="font-bold text-[#1C1B18] text-sm">{totalAttempts.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EDE6DA]/50 border border-[#E0D8CC]">
                <span className="text-[10px] text-[#9A9388] block">SUCCESSES</span>
                <span className="font-bold text-[#6F7F5F] text-sm">{successfulAttempts.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EDE6DA]/50 border border-[#E0D8CC]">
                <span className="text-[10px] text-[#9A9388] block">SUCCESS RATE</span>
                <span className="font-bold text-[#1C1B18] text-sm">{successRatePct}%</span>
              </div>
              <div className="p-3 rounded-xl bg-[#EDE6DA]/50 border border-[#E0D8CC]">
                <span className="text-[10px] text-[#9A9388] block">GATED REVIEWS</span>
                <span className="font-bold text-[#C89A4A] text-sm">{humanApprovalsCount}</span>
              </div>
            </div>

          </div>

          {/* ----------------------------------------------------------------- */}
          {/* RIGHT: OPERATIONAL EVENT STREAM (Real Backend Transactions)       */}
          {/* ----------------------------------------------------------------- */}
          <div className="lg:col-span-5 space-y-4">

            {/* Event Stream Header & Filter Pills */}
            <div className="space-y-3 pb-2 border-b border-[#D8D0C3]/60">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-widest text-[#9A9388] uppercase block">
                    OPERATIONAL EVENT STREAM
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1C1B18]">
                    RECENT SYSTEM TRANSACTIONS
                  </span>
                </div>

                {/* Search Input Filter */}
                <div className="relative">
                  <Search className="w-3 h-3 text-[#9A9388] absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-28 pl-7 pr-2 py-1 bg-[#F7F4EF] border border-[#D8D0C3] rounded-lg text-[10px] font-mono text-[#1C1B18] placeholder:text-[#9A9388] focus:outline-none focus:border-[#C89A4A]"
                  />
                </div>
              </div>

              {/* Status Filter Pills */}
              <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                {(['all', 'APPROVED', 'HUMAN_REVIEW', 'BLOCKED'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => { setStatusFilter(filter); setPage(1); }}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer border ${statusFilter === filter
                        ? 'bg-[#1C1B18] text-[#EDE6DA] border-[#1C1B18] font-bold'
                        : 'bg-[#EDE6DA]/60 text-[#777168] hover:bg-[#EDE6DA] border-[#E0D8CC]'
                      }`}
                  >
                    {filter === 'all' ? 'ALL EVENTS' : filter.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Real System Events */}
            <div className="space-y-2.5 min-h-[360px]">
              {loading ? (
                <div className="py-16 text-center text-xs font-mono text-[#777168] space-y-2">
                  <div className="w-4 h-4 rounded-full border-2 border-[#C89A4A] border-t-transparent animate-spin mx-auto" />
                  <span>Streaming transaction records from backend...</span>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="py-16 text-center text-xs font-mono text-[#777168]">
                  No events found matching active filter.
                </div>
              ) : (
                filteredTransactions.map((tx, idx) => {
                  const isHovered = hoveredTxId === tx.transaction_id;
                  const isSuccess = tx.success;
                  const isReview = tx.final_action === 'HUMAN_APPROVAL';
                  const isBlocked = tx.final_action === 'STOP';

                  // Status badge styling adhering strictly to palette
                  const statusLabel = isReview ? 'HUMAN REVIEW' : isBlocked ? 'BLOCKED' : 'APPROVED';
                  const statusBg = isReview
                    ? 'bg-[#C89A4A]/15 text-[#8A6A1A] border-[#C89A4A]/30'
                    : isBlocked
                      ? 'bg-[#C85A3E]/15 text-[#C85A3E] border-[#C85A3E]/30'
                      : 'bg-[#6F7F5F]/15 text-[#6F7F5F] border-[#6F7F5F]/30';

                  return (
                    <div
                      key={tx.transaction_id}
                      onMouseEnter={() => setHoveredTxId(tx.transaction_id)}
                      onMouseLeave={() => setHoveredTxId(null)}
                      onClick={() => onSelectTransaction(tx)}
                      className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${isHovered
                          ? 'bg-[#171717] border-[#2C2A24] text-[#F7F4EF] shadow-md -translate-y-0.5'
                          : 'bg-[#EDE6DA]/40 border-[#E0D8CC]'
                        }`}
                      style={{
                        animationDelay: `${idx * 100}ms`,
                      }}
                    >
                      {/* Top Event Wire: ID + Action Tag + Detail Link */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isHovered ? 'text-[#F7F4EF]' : 'text-[#1C1B18]'}`}>
                            {tx.transaction_id}
                          </span>
                          <span className="text-[#9A9388]">·</span>
                          <span className={isHovered ? 'text-[#C4BCB0]' : 'text-[#777168]'}>
                            {formatINR(tx.revenue_at_risk)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${statusBg}`}>
                            {statusLabel}
                          </span>
                          <ArrowUpRight className={`w-3.5 h-3.5 transition-transform ${isHovered ? 'text-[#F7F4EF] translate-x-0.5 -translate-y-0.5' : 'text-[#9A9388]'}`} />
                        </div>
                      </div>

                      {/* Middle Event Details: Proposed Action → Final Result */}
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono">
                        <div className={`flex items-center gap-1 ${isHovered ? 'text-[#EDE6DA]' : 'text-[#524E48]'}`}>
                          <span className="text-[#9A9388]">ACTION:</span>
                          <span className="font-bold">{tx.final_action}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {isSuccess ? (
                            <span className="text-[#8EA66E] font-bold">
                              ✓ Recovered {formatINR(tx.amount_recovered)}
                            </span>
                          ) : (
                            <span className={isHovered ? 'text-[#A39A8E]' : 'text-[#777168]'}>
                              {tx.outcome_reason ? formatLabel(tx.outcome_reason) : 'Pending execution'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contextual Cause */}
                      <div className={`mt-1 text-[10px] font-mono truncate ${isHovered ? 'text-[#A39A8E]' : 'text-[#9A9388]'}`}>
                        Pattern: {formatLabel(tx.root_cause)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            <div className="pt-3 border-t border-[#D8D0C3]/60 flex items-center justify-between text-xs font-mono text-[#777168]">
              <span>
                Page {page} of {totalPages}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-[#EDE6DA] border border-[#E0D8CC] text-[#524E48] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E0D8CC] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-lg bg-[#EDE6DA] border border-[#E0D8CC] text-[#524E48] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#E0D8CC] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Simulation & Non-Repudiation Footnote */}
        <div className="mt-8 pt-4 border-t border-[#D8D0C3]/50 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-[#9A9388]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F7F5F]" />
            <span>REVORA FINANCIAL RECOVERY TELEMETRY · AUDITED RECORD LOG</span>
          </div>
          <span className="hidden sm:inline">
            CLICK ANY TRANSACTION RECORD TO VIEW AUDIT TRAIL
          </span>
        </div>

      </div>
    </section>
  );
};
