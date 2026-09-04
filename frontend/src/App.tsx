import { useEffect, useState, useRef, useCallback } from 'react';
import { api } from './services/api';
import type { EvaluationSummary, TransactionEvaluation } from './types/evaluation';
import { FluidCursor } from './components/FluidCursor';
import { StoryHUD } from './components/StoryHUD';
import { Page0Landing } from './components/pages/Page0Landing';
import { Page1RevenueAtRisk } from './components/pages/Page1RevenueAtRisk';
import { Page2WhyAtRisk } from './components/pages/Page2WhyAtRisk';
import { Page3WhatRevoraDoes } from './components/pages/Page3WhatRevoraDoes';
import { Page4AiProposal } from './components/pages/Page4AiProposal';
import { Page5PolicyGuard } from './components/pages/Page5PolicyGuard';
import { Page6Recovery } from './components/pages/Page6Recovery';
import { Page7RazorpayIntegration } from './components/pages/Page7RazorpayIntegration';
import { EditorialCommandPanel } from './components/EditorialCommandPanel';
import { RevoraLogo } from './components/RevoraLogo';
import { AlertCircle, RotateCcw } from 'lucide-react';

function App() {
  const [summary, setSummary] = useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [selectedTx, setSelectedTx] = useState<TransactionEvaluation | null>(null);
  const [sampleTx, setSampleTx] = useState<TransactionEvaluation | null>(null);

  const isTransitioningRef = useRef<boolean>(false);
  const wheelAccumulatorRef = useRef<number>(0);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Ingest summary data from real backend
  useEffect(() => {
    let mounted = true;

    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await api.getEvaluationSummary();
        if (mounted) {
          setSummary(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Unable to retrieve recovery intelligence from REVORA backend.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchSummary();
    return () => { mounted = false; };
  }, []);

  // Ingest sample transaction for drawer inspection
  useEffect(() => {
    let mounted = true;
    api.getTransactions({ limit: 1 })
      .then((res) => {
        if (mounted && res.data && res.data.length > 0) {
          setSampleTx(res.data[0]);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Controlled Cinematic Page Navigation
  const goToPage = useCallback((targetIndex: number) => {
    const nextIdx = Math.max(0, Math.min(7, targetIndex));
    if (nextIdx === currentPage || isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    setCurrentPage(nextIdx);

    // Lock transitions for animation duration (680ms + buffer)
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 700);
  }, [currentPage]);

  // Mouse Wheel & Trackpad Gesture Controller
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Allow free scrolling inside drawer when open
      if (selectedTx) return;

      // Prevent native document scrolling
      e.preventDefault();

      if (isTransitioningRef.current) return;

      wheelAccumulatorRef.current += e.deltaY;

      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => {
        wheelAccumulatorRef.current = 0;
      }, 160);

      // Trigger transition once accumulator threshold is reached
      if (Math.abs(wheelAccumulatorRef.current) >= 35) {
        if (wheelAccumulatorRef.current > 0) {
          goToPage(currentPage + 1);
        } else {
          goToPage(currentPage - 1);
        }
        wheelAccumulatorRef.current = 0;
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [currentPage, goToPage, selectedTx]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedTx) return;
      if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        goToPage(currentPage + 1);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPage(currentPage - 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToPage(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToPage(7);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, goToPage, selectedTx]);

  // Touch swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (selectedTx) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (selectedTx || touchStartY.current === null || isTransitioningRef.current) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY.current - touchEndY;
    touchStartY.current = null;

    if (Math.abs(deltaY) >= 45) {
      if (deltaY > 0) {
        goToPage(currentPage + 1);
      } else {
        goToPage(currentPage - 1);
      }
    }
  };

  // -------------------------------------------------------------
  // Atmospheric Loading State (NO VISIBLE "LOADING" TEXT)
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#F7F4EF] text-[#121212] flex flex-col items-center justify-center select-none">
        <div className="flex flex-col items-center space-y-4 text-center">
          <RevoraLogo size={42} accent="terracotta" className="animate-pulse" />
          <div className="w-40 h-0.5 bg-[#EDE6DA] rounded-full overflow-hidden border border-[#E0D8CC]">
            <div className="h-full bg-[#C85A3E] rounded-full animate-flow-dash w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !summary) {
    return (
      <div className="h-screen w-screen bg-[#F7F4EF] text-[#121212] flex items-center justify-center p-6 select-none">
        <div className="max-w-md w-full p-8 rounded-3xl bg-[#F7F4EF] border border-[#C85A3E]/40 text-center shadow-lg">
          <div className="w-12 h-12 bg-[#C85A3E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#C85A3E]/30 text-[#C85A3E]">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-sm font-mono font-bold text-[#121212] mb-2 uppercase tracking-wide">
            Backend Connection Offline
          </h2>
          <p className="text-xs text-[#777168] leading-relaxed font-mono mb-6">
            {error || 'Unable to connect to FastAPI backend on port 8000. Verify the uvicorn server is running.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-[#121212] hover:bg-[#24231F] text-[#F7F4EF] text-xs font-mono font-bold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  // Slide content render list
  const slides = [
    <Page0Landing
      onEnter={() => goToPage(1)}
      onNext={() => goToPage(1)}
    />,
    <Page1RevenueAtRisk
      summary={summary}
      onNext={() => goToPage(2)}
    />,
    <Page2WhyAtRisk
      summary={summary}
      onNext={() => goToPage(3)}
    />,
    <Page3WhatRevoraDoes
      onNext={() => goToPage(4)}
    />,
    <Page4AiProposal
      onNext={() => goToPage(5)}
    />,
    <Page5PolicyGuard
      summary={summary}
      onNext={() => goToPage(6)}
    />,
    <Page6Recovery
      summary={summary}
      onNext={() => goToPage(7)}
    />,
    <Page7RazorpayIntegration
      onRestart={() => goToPage(0)}
      onOpenDrawer={() => {
        if (sampleTx) setSelectedTx(sampleTx);
      }}
    />,
  ];

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-[#121212] select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Global Atmospheric Fluid Cursor (WebGL Navier-Stokes Fluid with Revora Warm Palette) */}
      <FluidCursor
        enabled={true}
        densityDissipation={3.5}
        velocityDissipation={2.0}
        pressure={0.1}
        curl={3.0}
        splatRadius={0.2}
        splatForce={6000}
        transparent={true}
        className="z-30 pointer-events-none"
      />

      {/* Floating Story HUD (Top Nav + Progress Counter + Right Track Dots) */}
      <StoryHUD
        currentPage={currentPage}
        totalPages={8}
        onNavigateToPage={(idx) => goToPage(idx)}
      />

      {/* ------------------------------------------------------------- */}
      {/* CINEMATIC PRESENTATION STAGE (SLIDE-UP FROM BOTTOM ON ADVANCE) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative w-full h-full overflow-hidden">
        {slides.map((slideContent, idx) => {
          const diff = idx - currentPage;
          const isCurrent = diff === 0;
          const isPassed = diff < 0;
          const isUpcoming = diff > 0;

          // Compute directional CSS transform
          let transformStyle = 'translate3d(0, 0, 0) scale(1)';
          let opacityStyle = 1;
          let zIndexStyle = 20;

          if (isPassed) {
            // Already viewed pages recede upward and gently scale down
            transformStyle = 'translate3d(0, -32%, 0) scale(0.93)';
            opacityStyle = 0;
            zIndexStyle = 10;
          } else if (isUpcoming) {
            // Upcoming pages sit below the screen waiting to rise up
            transformStyle = 'translate3d(0, 100%, 0) scale(1)';
            opacityStyle = 0;
            zIndexStyle = 30;
          }

          // For optimal performance, hide slides that are further than 1 step away
          const isRenderVisible = Math.abs(diff) <= 1;

          return (
            <div
              key={idx}
              className="absolute inset-0 w-full h-full"
              style={{
                transform: transformStyle,
                opacity: opacityStyle,
                zIndex: isCurrent ? 25 : zIndexStyle,
                pointerEvents: isCurrent ? 'auto' : 'none',
                visibility: isRenderVisible ? 'visible' : 'hidden',
                transition: 'transform 680ms cubic-bezier(0.16, 1, 0.3, 1), opacity 550ms cubic-bezier(0.16, 1, 0.3, 1)',
                willChange: 'transform, opacity',
              }}
            >
              {slideContent}
            </div>
          );
        })}
      </div>

      {/* Slide-in Transaction Recovery Story Drawer when requested */}
      {selectedTx && (
        <EditorialCommandPanel
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
}

export default App;
