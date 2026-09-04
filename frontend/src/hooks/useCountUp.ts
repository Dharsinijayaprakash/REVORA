import { useState, useEffect } from 'react';

export function useCountUp(endValue: number, durationMs: number = 900): number {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || endValue === 0) {
      setCurrentValue(endValue);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      const easedProgress = easeOutQuart(progress);
      
      setCurrentValue(easedProgress * endValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCurrentValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [endValue, durationMs]);

  return currentValue;
}
