import React, { useState, useEffect } from 'react';
import { RevoraLogo } from './RevoraLogo';

interface MinimalNavProps {
  onScrollTo: (id: string) => void;
}

export const MinimalNav: React.FC<MinimalNavProps> = ({ onScrollTo }) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('scene-leakage');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Detect active section based on scroll position
      const sections = [
        { id: 'scene-console', navId: 'scene-console' },
        { id: 'scene-recovery', navId: 'scene-recovery' },
        { id: 'scene-guard', navId: 'scene-guard' },
        { id: 'scene-proposal', navId: 'scene-proposal' },
        { id: 'scene-diagnosis', navId: 'scene-diagnosis' },
        { id: 'scene-leakage', navId: 'scene-leakage' },
      ];

      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(section.navId);
          return;
        }
      }
      setActiveSection('scene-leakage');
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'LEAKAGE', num: '01', id: 'scene-leakage', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    { label: 'DIAGNOSIS', num: '02', id: 'scene-diagnosis', action: () => onScrollTo('scene-diagnosis') },
    { label: 'PROPOSAL', num: '03', id: 'scene-proposal', action: () => onScrollTo('scene-proposal') },
    { label: 'POLICY GATE', num: '04', id: 'scene-guard', action: () => onScrollTo('scene-guard') },
    { label: 'RECOVERY', num: '05', id: 'scene-recovery', action: () => onScrollTo('scene-recovery') },
    { label: 'OPERATIONS', num: '06', id: 'scene-console', action: () => onScrollTo('scene-console') },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-8 lg:px-12 py-3.5 flex items-center justify-between select-none ${scrolled
          ? 'bg-[#F7F4EF]/95 backdrop-blur-md border-b border-[#EDE6DA] shadow-[0_4px_20px_rgba(0,0,0,0.02)]'
          : 'bg-[#F7F4EF] border-b border-[#EDE6DA]/60'
        }`}
    >
      {/* Left: Brand Identity */}
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <RevoraLogo size={24} accent="terracotta" className="group-hover:scale-105 transition-transform" />
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-black tracking-[0.28em] text-[#121212]">
            REVORA
          </span>
          <span className="text-[#D8D0C3] hidden sm:inline">/</span>
          <span className="text-[10px] font-mono font-bold tracking-widest text-[#777168] uppercase hidden sm:inline">
            AI REVENUE RECOVERY
          </span>
        </div>
      </div>

      {/* Center: Editorial Index Navigation */}
      <div className="hidden md:flex items-center gap-2 lg:gap-3 text-[11px] font-mono">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={item.action}
              className={`relative transition-all cursor-pointer group flex items-center gap-1.5 px-2.5 py-1 rounded-md ${isActive
                  ? 'bg-[#171717] text-[#F7F4EF] font-bold shadow-xs'
                  : 'text-[#777168] hover:text-[#121212] hover:bg-[#EDE6DA]/50'
                }`}
            >
              <span className={`text-[9px] ${isActive ? 'text-[#C85A3E] font-bold' : 'text-[#9A9388]'}`}>
                {item.num}.
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right: Small Subtle Status Indicator */}
      <div className="flex items-center gap-2 text-[10px] font-mono text-[#777168]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6F7F5F]" />
        <span className="tracking-wider uppercase font-semibold text-[#524E48]">
          SYNTHETIC SYSTEM
        </span>
      </div>
    </nav>
  );
};
