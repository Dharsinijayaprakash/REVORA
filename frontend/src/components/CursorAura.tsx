import React, { useEffect, useRef } from 'react';

export const CursorAura: React.FC = () => {
  const auraRef = useRef<HTMLDivElement | null>(null);
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Only enable on pointer-fine devices
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animId: number;
    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;

    const animate = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.08);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.08);

      if (auraRef.current) {
        auraRef.current.style.transform = `translate3d(${currentPos.current.x - 200}px, ${currentPos.current.y - 200}px, 0)`;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={auraRef}
      className="fixed top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none z-0 transition-opacity duration-700 opacity-25"
      style={{
        background: 'radial-gradient(circle, rgba(200, 154, 74, 0.18) 0%, rgba(200, 90, 62, 0.06) 45%, transparent 70%)',
        filter: 'blur(60px)',
        willChange: 'transform',
      }}
    />
  );
};
