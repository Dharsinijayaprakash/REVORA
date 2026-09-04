import React, { useEffect, useRef } from 'react';

interface Signature3DVisualProps {
  stage: number; // 1 to 5
  interactive?: boolean;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  baseColor: [number, number, number];
  alpha: number;
  life: number;
  maxLife: number;
  seed: number;
}

export const Signature3DVisual: React.FC<Signature3DVisualProps> = ({
  stage,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetStageRef = useRef<number>(stage);
  const currentMorphRef = useRef<number>(stage);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    targetStageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1) || 600);
    let height = (canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1) || 600);

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = canvas.width = (canvas.offsetWidth || 600) * dpr;
      height = canvas.height = (canvas.offsetHeight || 600) * dpr;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseRef.current.targetX = nx * 0.35;
      mouseRef.current.targetY = ny * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Create particles
    const particleCount = 150;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * 400,
        y: (Math.random() - 0.5) * 400,
        z: (Math.random() - 0.5) * 300,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        vz: (Math.random() - 0.5) * 0.7,
        size: Math.random() * 2.2 + 1.2,
        baseColor: [200, 90, 62], // Start with warm terracotta
        alpha: Math.random() * 0.7 + 0.3,
        life: 0,
        maxLife: Math.random() * 200 + 100,
        seed: Math.random() * 100,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.016;

      // Smooth stage interpolation (800-1200ms easing)
      currentMorphRef.current += (targetStageRef.current - currentMorphRef.current) * 0.045;
      const morph = currentMorphRef.current;

      // Mouse easing
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const scale = Math.min(width, height) / 640;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Rotation angles with subtle mouse parallax
      const rotY = time * 0.3 + mouseRef.current.x * 0.6;
      const rotX = Math.sin(time * 0.18) * 0.2 - mouseRef.current.y * 0.6;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // 3D projection helper
      const project = (x: number, y: number, z: number) => {
        const x1 = x * cosY - z * sinY;
        const z1 = z * cosY + x * sinY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = z1 * cosX + y * sinX;
        const fov = 480;
        const depth = fov / (fov + z2 + 250);
        return {
          px: x1 * depth * scale,
          py: y2 * depth * scale,
          depth,
          z2,
        };
      };

      // 1. STAGE-SPECIFIC RIBBON SCULPTURE
      const drawRibbonStreams = () => {
        const ribbonCount = 5;
        const segments = 45;

        for (let r = 0; r < ribbonCount; r++) {
          const ribbonOffset = (r / ribbonCount) * Math.PI * 2;
          const points: { px: number; py: number; depth: number }[] = [];

          for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * Math.PI * 2;
            const radius = 130 + Math.sin(t * 3 + time * 1.5 + ribbonOffset) * 22;
            let px3d = 0;
            let py3d = 0;
            let pz3d = 0;

            if (morph < 1.8) {
              // Stage 1: Fragmented / Broken flow with chaotic dispersal (Terracotta)
              const breakup = Math.sin(t * 4 + ribbonOffset);
              const breakFactor = breakup > 0.4 ? 1.6 : 1.0;
              px3d = Math.cos(t + time * 0.4) * radius * breakFactor;
              py3d = Math.sin(t * 2 + time * 0.5) * 55 + (breakup > 0.4 ? (Math.random() - 0.5) * 18 : 0);
              pz3d = Math.sin(t + time * 0.4) * radius * breakFactor;
            } else if (morph < 2.8) {
              // Stage 2: Diagnostic sorting ribbons (Warm Amber / Ochre)
              const band = (r % 3) - 1;
              px3d = Math.cos(t + time * 0.5) * (radius + band * 30);
              py3d = Math.sin(t * 3 + time * 0.8) * 45 + band * 25;
              pz3d = Math.sin(t + time * 0.5) * (radius + band * 30);
            } else if (morph < 3.8) {
              // Stage 3: AI Neural Core Pulse with focused vector trajectory (Warm Gold / Sand)
              const pulse = Math.sin(time * 3) * 15;
              px3d = Math.cos(t + time * 0.8) * (radius * 0.7 + pulse);
              py3d = Math.sin(t * 4 + time * 1.2) * (35 + pulse * 0.5);
              pz3d = Math.sin(t + time * 0.8) * (radius * 0.7 + pulse);
            } else if (morph < 4.8) {
              // Stage 4: Policy Gate physical barrier passing (Moss Green)
              const xPos = Math.cos(t + time * 0.6) * radius * 1.2;
              px3d = xPos;
              py3d = Math.sin(t * 2 + time * 0.9) * 50;
              pz3d = Math.sin(t + time * 0.6) * radius * 0.7;
            } else {
              // Stage 5: Resolved, harmonic infinity/torus capital loop (Olive / Moss Green)
              const p = 2;
              const q = 3;
              const rTorus = 120 + 35 * Math.cos(q * t + time * 1.2);
              px3d = rTorus * Math.cos(p * t + time * 0.6);
              py3d = 45 * Math.sin(q * t + time * 1.2);
              pz3d = rTorus * Math.sin(p * t + time * 0.6);
            }

            const p2d = project(px3d, py3d, pz3d);
            points.push(p2d);
          }

          // Render ribbon path
          ctx.beginPath();
          for (let i = 0; i < points.length; i++) {
            if (i === 0) ctx.moveTo(points[i].px, points[i].py);
            else ctx.lineTo(points[i].px, points[i].py);
          }

          // Dynamic coloring per stage using warm palette (No blue)
          let strokeColor = 'rgba(200, 90, 62, 0.45)';
          let lineWidth = 2.2 * scale;

          if (morph < 1.8) {
            // Stage 1: Terracotta / Warm Ember
            strokeColor = r % 2 === 0 ? 'rgba(200, 90, 62, 0.6)' : 'rgba(216, 120, 74, 0.45)';
            lineWidth = 1.8 * scale;
          } else if (morph < 2.8) {
            // Stage 2: Warm Amber / Ochre
            const colors = [
              'rgba(200, 154, 74, 0.65)',
              'rgba(220, 175, 95, 0.55)',
              'rgba(185, 135, 60, 0.55)',
            ];
            strokeColor = colors[r % colors.length];
            lineWidth = 2.4 * scale;
          } else if (morph < 3.8) {
            // Stage 3: Warm Gold / Sand
            strokeColor = 'rgba(229, 195, 120, 0.7)';
            lineWidth = 2.8 * scale;
          } else if (morph < 4.8) {
            // Stage 4: Moss Green Policy Barrier
            strokeColor = 'rgba(111, 127, 95, 0.7)';
            lineWidth = 2.6 * scale;
          } else {
            // Stage 5: Cohesive Olive / Moss Green Recovery
            strokeColor = 'rgba(113, 128, 90, 0.8)';
            lineWidth = 3.2 * scale;
          }

          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.stroke();
        }
      };

      // 2. STAGE 4 POLICY GATE BARRIER (Warm Moss Green)
      if (morph > 3.2 && morph < 4.9) {
        const gateAlpha = Math.sin(Math.min(Math.max((morph - 3.2) / 0.8, 0), 1) * Math.PI);
        ctx.save();
        const gateTop = project(0, -160, 0);
        const gateBottom = project(0, 160, 0);

        const grad = ctx.createLinearGradient(gateTop.px, gateTop.py, gateBottom.px, gateBottom.py);
        grad.addColorStop(0, `rgba(111, 127, 95, 0)`);
        grad.addColorStop(0.5, `rgba(142, 166, 110, ${0.85 * gateAlpha})`);
        grad.addColorStop(1, `rgba(111, 127, 95, 0)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = 3.5 * scale;
        ctx.beginPath();
        ctx.moveTo(gateTop.px, gateTop.py);
        ctx.lineTo(gateBottom.px, gateBottom.py);
        ctx.stroke();

        // Gate rings
        for (let g = 0; g < 3; g++) {
          const ringY = -80 + g * 80 + Math.sin(time * 2 + g) * 10;
          const pLeft = project(-70, ringY, 0);
          const pRight = project(70, ringY, 0);
          ctx.beginPath();
          ctx.arc((pLeft.px + pRight.px) / 2, (pLeft.py + pRight.py) / 2, 22 * scale, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(111, 127, 95, ${0.4 * gateAlpha})`;
          ctx.lineWidth = 1.2 * scale;
          ctx.stroke();
        }
        ctx.restore();
      }

      // 3. DRAW RIBBONS
      drawRibbonStreams();

      // 4. DRAW DYNAMIC PARTICLES
      particles.forEach((p) => {
        p.life += 1;
        if (p.life > p.maxLife) {
          p.life = 0;
          p.x = (Math.random() - 0.5) * 350;
          p.y = (Math.random() - 0.5) * 350;
          p.z = (Math.random() - 0.5) * 250;
        }

        // Morph-dependent velocity and orbit in warm palette
        if (morph < 1.8) {
          // Stage 1: Terracotta / Ember escape
          p.x += p.vx * 1.6 + Math.sin(p.seed + time) * 0.5;
          p.y += p.vy * 1.6 + Math.cos(p.seed + time) * 0.5;
          p.z += p.vz * 1.6;
          p.baseColor = [200, 90, 62]; // Terracotta
        } else if (morph < 2.8) {
          // Stage 2: Warm Amber / Ochre classification
          const targetY = ((p.seed % 7) - 3) * 28;
          p.y += (targetY - p.y) * 0.04;
          p.x += Math.cos(time + p.seed) * 1.1;
          p.z += Math.sin(time + p.seed) * 1.1;
          p.baseColor = [200, 154, 74]; // Warm Amber
        } else if (morph < 3.8) {
          // Stage 3: Warm Gold / Sand AI proposal
          const angle = Math.atan2(p.z, p.x) + 0.032;
          const targetDist = 90 + Math.sin(p.seed + time * 2) * 25;
          p.x = Math.cos(angle) * targetDist;
          p.z = Math.sin(angle) * targetDist;
          p.y += (Math.sin(time * 3 + p.seed) * 35 - p.y) * 0.05;
          p.baseColor = [229, 195, 120]; // Warm Gold
        } else if (morph < 4.8) {
          // Stage 4: Moss Green gate validation
          p.x += 1.5;
          if (p.x > 180) p.x = -180;
          p.y += Math.sin(time + p.seed) * 0.7;
          p.baseColor = p.x > 0 ? [142, 166, 110] : [160, 150, 138];
        } else {
          // Stage 5: Harmonious Olive / Moss Green recovery
          const angle = time * 0.75 + p.seed;
          const r = 110 + Math.sin(angle * 3) * 18;
          p.x = Math.cos(angle) * r;
          p.z = Math.sin(angle) * r;
          p.y = Math.sin(angle * 2) * 30;
          p.baseColor = [113, 128, 90]; // Olive / Moss
        }

        const proj = project(p.x, p.y, p.z);
        if (proj.depth > 0) {
          const [r, g, b] = p.baseColor;
          const alpha = Math.max(0.15, Math.min(p.alpha * proj.depth * 1.3, 0.85));

          ctx.beginPath();
          ctx.arc(proj.px, proj.py, Math.max(1, p.size * proj.depth * scale * 1.3), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fill();

          if (p.seed > 80) {
            ctx.beginPath();
            ctx.arc(proj.px, proj.py, p.size * proj.depth * scale * 3.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.22})`;
            ctx.fill();
          }
        }
      });

      // 5. STAGE 3 WARM GOLD CENTRAL NEURAL CORE
      if (morph > 2.2 && morph < 3.9) {
        const aiAlpha = Math.sin(Math.min(Math.max((morph - 2.2) / 0.8, 0), 1) * Math.PI);
        const coreProj = project(0, 0, 0);

        const radialGrad = ctx.createRadialGradient(
          coreProj.px,
          coreProj.py,
          0,
          coreProj.px,
          coreProj.py,
          65 * scale
        );
        radialGrad.addColorStop(0, `rgba(229, 195, 120, ${0.8 * aiAlpha})`);
        radialGrad.addColorStop(0.4, `rgba(200, 154, 74, ${0.35 * aiAlpha})`);
        radialGrad.addColorStop(1, 'rgba(200, 154, 74, 0)');

        ctx.beginPath();
        ctx.arc(coreProj.px, coreProj.py, 65 * scale, 0, Math.PI * 2);
        ctx.fillStyle = radialGrad;
        ctx.fill();
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative w-full h-full flex items-center justify-center pointer-events-none select-none ${className}`}>
      {/* Background Soft Atmospheric Warm Aura (No blue) */}
      <div 
        className="absolute inset-0 rounded-full blur-[90px] opacity-35 transition-colors duration-1000 pointer-events-none"
        style={{
          background:
            stage === 1
              ? 'radial-gradient(circle, rgba(200,90,62,0.2) 0%, transparent 70%)'
              : stage === 2
              ? 'radial-gradient(circle, rgba(200,154,74,0.22) 0%, transparent 70%)'
              : stage === 3
              ? 'radial-gradient(circle, rgba(229,195,120,0.24) 0%, transparent 70%)'
              : stage === 4
              ? 'radial-gradient(circle, rgba(111,127,95,0.22) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(113,128,90,0.25) 0%, transparent 70%)',
        }}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[700px] max-h-[560px] object-contain relative z-10"
      />
    </div>
  );
};
