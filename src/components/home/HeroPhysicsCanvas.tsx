import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface HeroPhysicsCanvasProps {
  readonly className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  alpha: number;
  phase: number;
  tone: 'gold' | 'emerald';
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

interface SunGlint {
  rowNorm: number; // 0 gần chân trời .. 1 gần tiền cảnh
  baseWidth: number;
  phase: number;
  speed: number;
  driftAmp: number;
  offsetX: number;
}

const PARTICLE_COUNT = 56;
const SUN_GLINT_COUNT = 44;
const INTERACTION_RADIUS = 140;
const MAX_TRAIL_POINTS = 16;
const WATERLINE_RATIO = 535 / 900;

function createParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const baseVx = (Math.random() - 0.5) * 0.22;
    const baseVy = -0.08 - Math.random() * 0.18;
    const tone: Particle['tone'] = i % 3 === 0 ? 'emerald' : 'gold';
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      radius: tone === 'emerald' ? 1.4 + Math.random() * 1.4 : 1.0 + Math.random() * 1.3,
      alpha: 0.35 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
      tone,
    });
  }
  return particles;
}

function createSunGlints(): SunGlint[] {
  const glints: SunGlint[] = [];
  for (let i = 0; i < SUN_GLINT_COUNT; i += 1) {
    const rowNorm = i / (SUN_GLINT_COUNT - 1);
    glints.push({
      rowNorm,
      baseWidth: 16 + rowNorm * 82 + ((i * 17) % 24),
      phase: i * 0.85,
      speed: 0.85 + (i % 5) * 0.22,
      driftAmp: 5 + rowNorm * 16,
      offsetX: (i % 2 === 0 ? 1 : -1) * ((i * 23) % 45) * (0.35 + rowNorm * 0.9),
    });
  }
  return glints;
}

/**
 * Canvas 2D vật lý 60fps cho Vịnh Hạ Long:
 * - Vệt nắng hoàng hôn phản chiếu mặt biển (#E8A85A) gồm hàng chục gợn sóng lăn tăn theo hàm sin
 * - Đom đóm & bụi sáng dịu nhẹ tương tác con trỏ chuột (bán kính 140px)
 * - Vệt sao băng mảnh & sóng xung kích khi nhấn chuột
 */
export function HeroPhysicsCanvas({ className }: HeroPhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    let width = window.innerWidth || 1440;
    let height = window.innerHeight || 900;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : null;
      width = Math.max(Math.floor(rect?.width || window.innerWidth || 1440), 320);
      height = Math.max(Math.floor(rect?.height || window.innerHeight || 900), 480);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();

    const particles = createParticles(width, height);
    const sunGlints = createSunGlints();
    const ripples: Ripple[] = [];
    const trail: TrailPoint[] = [];

    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.x = x;
      pointer.y = y;
      pointer.active = x >= 0 && x <= width && y >= 0 && y <= height;

      if (pointer.active) {
        trail.push({ x, y, life: 1 });
        if (trail.length > MAX_TRAIL_POINTS) {
          trail.shift();
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;

      ripples.push(
        { x: cx, y: cy, radius: 6, maxRadius: 175, alpha: 0.58, speed: 2.9 },
        { x: cx, y: cy, radius: 2, maxRadius: 235, alpha: 0.36, speed: 2.1 },
      );

      for (const p of particles) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const distSq = dx * dx + dy * dy;
        if (distSq > 0.5 && distSq < INTERACTION_RADIUS * INTERACTION_RADIUS * 2.2) {
          const dist = Math.sqrt(distSq);
          const impulse = (1 - dist / (INTERACTION_RADIUS * 1.5)) * 2.2;
          p.vx += (dx / dist) * impulse;
          p.vy += (dy / dist) * impulse;
        }
      }
    };

    const drawDynamicSunpath = (context: CanvasRenderingContext2D, timeSec: number) => {
      const horizonY = height * WATERLINE_RATIO;
      const seaSpanY = Math.max(height - horizonY - 24, 120);
      const sunCenterX = width * 0.51;

      context.lineCap = 'round';

      for (const glint of sunGlints) {
        // Phân bố dày gần chân trời và thưa dần xuống tiền cảnh (tạo phối cảnh mặt nước)
        const perspectiveY = horizonY + 8 + Math.pow(glint.rowNorm, 1.45) * seaSpanY;
        const waveX = Math.sin(timeSec * glint.speed + glint.phase) * glint.driftAmp;
        const widthMod = 0.8 + 0.25 * Math.cos(timeSec * (glint.speed * 0.9) + glint.phase);
        const alpha =
          (0.28 + 0.45 * (1 - glint.rowNorm * 0.55)) *
          (0.65 + 0.35 * Math.sin(timeSec * glint.speed * 1.2 + glint.phase));

        const xCenter = sunCenterX + glint.offsetX + waveX;
        const halfW = glint.baseWidth * widthMod * 0.5;
        const lineWidth = 1.1 + glint.rowNorm * 1.8;

        // Vệt chính màu vàng đồng #E8A85A
        context.beginPath();
        context.moveTo(xCenter - halfW, perspectiveY);
        context.lineTo(xCenter + halfW, perspectiveY);
        context.lineWidth = lineWidth;
        context.strokeStyle = `rgba(232, 168, 90, ${alpha.toFixed(3)})`;
        context.stroke();

        // Điểm nhấn sáng rực mảnh ở tâm gợn sóng
        if (Math.sin(timeSec * 1.4 + glint.phase) > -0.2) {
          context.beginPath();
          context.moveTo(xCenter - halfW * 0.42, perspectiveY);
          context.lineTo(xCenter + halfW * 0.42, perspectiveY);
          context.lineWidth = Math.max(0.8, lineWidth * 0.6);
          context.strokeStyle = `rgba(255, 224, 158, ${(alpha * 0.85).toFixed(3)})`;
          context.stroke();
        }
      }
    };

    const drawFrame = (timeMs: number, animate: boolean) => {
      const timeSec = timeMs * 0.001;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. Dải nắng hoàng hôn phản chiếu lăn tăn trên mặt vịnh
      drawDynamicSunpath(ctx, animate ? timeSec : 0.4);

      // 2. Hạt đom đóm & bụi sáng dịu nhẹ tương tác chuột (bán kính 140px)
      for (const p of particles) {
        if (animate) {
          p.phase += 0.028;

          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > 0.5 && distSq < INTERACTION_RADIUS * INTERACTION_RADIUS) {
              const dist = Math.sqrt(distSq);
              const strength = (1 - dist / INTERACTION_RADIUS) * 0.36;
              const nx = dx / dist;
              const ny = dy / dist;
              p.vx += nx * strength - ny * strength * 0.65;
              p.vy += ny * strength + nx * strength * 0.65;
            }
          }

          p.vx += (p.baseVx - p.vx) * 0.045;
          p.vy += (p.baseVy - p.vy) * 0.045;

          p.x += p.vx;
          p.y += p.vy;

          if (p.y < -12) p.y = height + 12;
          if (p.y > height + 12) p.y = -12;
          if (p.x < -12) p.x = width + 12;
          if (p.x > width + 12) p.x = -12;
        }

        const pulse = 0.6 + 0.4 * Math.sin(p.phase);
        const alpha = p.alpha * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          p.tone === 'emerald'
            ? `rgba(142, 229, 206, ${(alpha * 0.72).toFixed(3)})`
            : `rgba(232, 168, 90, ${(alpha * 0.85).toFixed(3)})`;
        ctx.fill();

        if (p.tone === 'gold') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 168, 90, ${(alpha * 0.14).toFixed(3)})`;
          ctx.fill();
        }
      }

      // 3. Vệt sao băng mảnh theo đầu con trỏ
      if (animate && trail.length > 1) {
        for (let i = trail.length - 1; i >= 0; i -= 1) {
          const pt = trail[i];
          if (!pt) continue;
          pt.life -= 0.06;
          if (pt.life <= 0) {
            trail.splice(i, 1);
          }
        }

        for (let i = 1; i < trail.length; i += 1) {
          const prevPt = trail[i - 1];
          const currPt = trail[i];
          if (!prevPt || !currPt) continue;
          ctx.beginPath();
          ctx.moveTo(prevPt.x, prevPt.y);
          ctx.lineTo(currPt.x, currPt.y);
          ctx.lineWidth = Math.max(0.7, currPt.life * 2.1);
          ctx.lineCap = 'round';
          ctx.strokeStyle = `rgba(232, 168, 90, ${(currPt.life * 0.45).toFixed(3)})`;
          ctx.stroke();
        }
      }

      // 4. Sóng xung kích đồng tâm khi Click
      if (animate && ripples.length > 0) {
        for (let i = ripples.length - 1; i >= 0; i -= 1) {
          const ripple = ripples[i];
          if (!ripple) continue;
          ripple.radius += ripple.speed;
          ripple.alpha *= 0.95;

          if (ripple.radius >= ripple.maxRadius || ripple.alpha <= 0.015) {
            ripples.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.lineWidth = 1.4;
          ctx.strokeStyle = `rgba(232, 168, 90, ${ripple.alpha.toFixed(3)})`;
          ctx.stroke();
        }
      }
    };

    if (prefersReducedMotion) {
      drawFrame(0, false);
      window.addEventListener('resize', resize, { passive: true });
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    let rafId = 0;
    const tick = (now: number) => {
      drawFrame(now, true);
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="hero-physics-canvas"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
}
