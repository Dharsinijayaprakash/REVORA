import React from 'react';
import { ShieldCheck, Cpu, Menu, X, ArrowRight, Layers } from 'lucide-react';
import type { NavView } from './Sidebar';

interface HeaderProps {
  currentView: NavView;
  onSelectView?: (view: NavView) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const VIEW_TITLES: Record<NavView, { title: string; subtitle: string }> = {
  'overview': {
    title: 'Executive Command Center',
    subtitle: 'Autonomous Revenue Operations & Risk Intelligence',
  },
  'pipeline': {
    title: 'Interactive 6-Stage Recovery Pipeline',
    subtitle: 'Deep architectural exploration of AI Agent & Policy Guard validation',
  },
  'queue': {
    title: 'Recovery Queue Operations',
    subtitle: 'Prioritized at-risk transactions requiring policy-validated actions',
  },
  'ai-insights': {
    title: 'AI Intelligence & Model Telemetry',
    subtitle: 'Groq Llama-3.3 70B decisions, confidence calibration & override analysis',
  },
  'policy-guard': {
    title: 'Policy Guard Compliance & Audit Trail',
    subtitle: 'Deterministic guardrails, boundary enforcement & execution log',
  },
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const current = VIEW_TITLES[currentView] || VIEW_TITLES.overview;

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 shadow-xs backdrop-blur-md bg-white/95">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: View breadcrumb / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Layers className="w-3.5 h-3.5" />
              <span>REVORA</span>
              <ArrowRight className="w-3 h-3 text-slate-300" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-none">
                {current.title}
              </h1>
              <p className="hidden md:block text-[11px] text-slate-500 mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Engine status badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Groq Engine */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700">
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[11px] font-semibold tracking-wide">Groq Llama-3.3 70B</span>
          </div>

          {/* Policy Guard Active */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold tracking-wide">Policy Guard Active</span>
          </div>

          {/* Live system state */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full text-[11px] font-semibold text-slate-700">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
