import React from 'react';
import { RevoraLogo } from './RevoraLogo';

interface StoryHUDProps {
  currentPage: number;
  totalPages: number;
  onNavigateToPage: (pageIndex: number) => void;
  razorpayConnected?: boolean;
}

export const StoryHUD: React.FC<StoryHUDProps> = ({
  currentPage,
  totalPages = 8,
  onNavigateToPage,
  razorpayConnected = true,
}) => {
  const pageTitles = [
    'WHAT IS REVORA?',
    'REVENUE AT RISK',
    'WHY IS IT AT RISK?',
    'WHAT CAN REVORA DO?',
    'AI PROPOSAL',
    'POLICY GUARD',
    'RECOVERY',
    'RAZORPAY INTEGRATION',
  ];

  // Whether current page is a dark background page (Pages 2, 4, 6)
  const isDark = currentPage === 2 || currentPage === 4 || currentPage === 6;

  const currentDisplay = currentPage === 0 ? 'LANDING' : `0${currentPage} / 07`;

  return (
    <>
      {/* Top Floating Minimal Navigation Bar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 lg:px-12 py-3 flex items-center justify-between transition-colors duration-500 select-none ${
          isDark
            ? 'bg-[#171717]/95 text-[#F7F4EF] border-b border-[#2C2A24]'
            : 'bg-[#F7F4EF]/95 text-[#121212] border-b border-[#EDE6DA]'
        } backdrop-blur-md`}
      >
        {/* Left: Brand */}
        <button
          onClick={() => onNavigateToPage(0)}
          className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0 bg-transparent border-none p-0 focus:outline-none"
        >
          <RevoraLogo size={22} accent="terracotta" className="group-hover:scale-105 transition-transform flex-shrink-0" />
          <span className="text-xs font-mono font-black tracking-[0.25em] whitespace-nowrap">
            REVORA
          </span>
          <span className="opacity-30 hidden sm:inline">/</span>
          <span className="text-[10px] font-mono tracking-widest uppercase opacity-60 hidden md:inline whitespace-nowrap">
            FINTECH INTELLIGENCE
          </span>
        </button>

        {/* Center: Current Story Progress */}
        <div className="flex items-center gap-2 flex-shrink-0 mx-2">
          <div
            className={`px-3.5 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider transition-colors border flex items-center gap-2 whitespace-nowrap ${
              isDark
                ? 'bg-[#24231F] border-[#35332C] text-[#E5C378]'
                : 'bg-[#EDE6DA] border-[#D8D0C3] text-[#121212]'
            }`}
          >
            <span>{currentDisplay}</span>
            {currentPage > 0 && (
              <span className="opacity-60 hidden lg:inline text-[10px] font-normal border-l border-current/30 pl-2">
                {pageTitles[currentPage]}
              </span>
            )}
          </div>
        </div>

        {/* Right: Live Integration Badge */}
        <div className="flex items-center gap-2 text-[10px] font-mono flex-shrink-0">
          <button
            onClick={() => onNavigateToPage(7)}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-full transition-colors border whitespace-nowrap ${
              isDark
                ? 'bg-[#24231F] border-[#35332C] text-[#D8D0C3] hover:border-[#6F7F5F]'
                : 'bg-[#EDE6DA]/80 border-[#D8D0C3] text-[#524E48] hover:border-[#121212]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#6F7F5F] animate-pulse flex-shrink-0" />
            <span className="font-bold tracking-wider uppercase">RAZORPAY TEST</span>
            <span className="text-[#6F7F5F] font-bold hidden sm:inline">
              {razorpayConnected ? '● CONNECTED' : '● CONNECTED'}
            </span>
          </button>
        </div>
      </nav>

      {/* Right Side Vertical Progress Track Dots */}
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-2.5 select-none pointer-events-auto">
        {Array.from({ length: totalPages }).map((_, idx) => {
          const isActive = currentPage === idx;
          return (
            <button
              key={idx}
              onClick={() => onNavigateToPage(idx)}
              title={`Page ${idx}: ${pageTitles[idx]}`}
              className="group relative flex items-center justify-center p-1.5 cursor-pointer focus:outline-none"
            >
              {/* Tooltip on hover */}
              <span
                className={`absolute right-8 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md border ${
                  isDark
                    ? 'bg-[#24231F] text-[#F7F4EF] border-[#35332C]'
                    : 'bg-[#EDE6DA] text-[#121212] border-[#D8D0C3]'
                }`}
              >
                {idx === 0 ? '00 LANDING' : `0${idx} ${pageTitles[idx]}`}
              </span>

              {/* Dot visual */}
              <span
                className={`transition-all duration-300 rounded-full block ${
                  isActive
                    ? 'w-2.5 h-6 bg-[#C85A3E]'
                    : isDark
                    ? 'w-1.5 h-1.5 bg-[#555044] hover:bg-[#A39A8E]'
                    : 'w-1.5 h-1.5 bg-[#D8D0C3] hover:bg-[#777168]'
                }`}
              />
            </button>
          );
        })}
      </div>
    </>
  );
};
