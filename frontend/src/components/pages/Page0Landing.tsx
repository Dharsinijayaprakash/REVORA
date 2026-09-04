import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { RevoraLogo } from '../RevoraLogo';

interface Page0LandingProps {
  onEnter: () => void;
  onNext: () => void;
}

export const Page0Landing: React.FC<Page0LandingProps> = ({ onEnter, onNext }) => {
  return (
    <section
      id="page-0"
      className="relative w-full h-full flex flex-col justify-between items-center text-center px-6 py-8 pt-20 sm:pt-24 bg-[#F7F4EF] text-[#121212] select-none overflow-hidden"
    >
      {/* Top Subtle Brand Seal */}
      <div className="flex items-center gap-2 pt-2 flex-shrink-0">
        <RevoraLogo size={24} accent="terracotta" />
        <span className="text-[11px] font-mono font-bold tracking-[0.3em] uppercase text-[#777168]">
          REVORA SYSTEMS
        </span>
      </div>

      {/* Main Essential Hero Content */}
      <div className="max-w-4xl space-y-5 sm:space-y-6 my-auto px-4">
        {/* Large Monolithic Title */}
        <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-[96px] tracking-[-0.05em] leading-[0.9] uppercase text-[#121212]">
          REVORA
        </h1>

        {/* Short Tagline */}
        <p className="text-lg sm:text-2xl lg:text-3xl font-mono font-bold text-[#121212] tracking-tight uppercase max-w-2xl mx-auto leading-tight">
          RECOVER REVENUE BEFORE IT BECOMES LOSS.
        </p>

        {/* Small Supporting Text */}
        <p className="text-xs sm:text-sm lg:text-base font-sans text-[#777168] max-w-md mx-auto leading-relaxed">
          AI-powered revenue recovery intelligence for payment risk.
        </p>

        {/* Clear CTA: ENTER REVORA → */}
        <div className="pt-4 sm:pt-6">
          <button
            onClick={onEnter}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#121212] hover:bg-[#24231F] text-[#F7F4EF] text-xs sm:text-sm font-mono font-bold tracking-widest uppercase transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
          >
            <span>ENTER REVORA</span>
            <ArrowRight className="w-4 h-4 text-[#E5C378] flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Bottom Subtle Swipe Indicator */}
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
