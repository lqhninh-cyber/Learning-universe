import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';
import type { HeroAtmosphere } from './heroAtmosphere';

export interface HeroPhysicsCanvasProps {
  readonly atmosphere: HeroAtmosphere;
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
  tone: 'gold' | 'cinnabar' | 'firefly';
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

const PARTICLE_COUNT = 120;
const INTERACTION_RADIUS = 140;
const MAX_TRAIL_POINTS = 18;

function createParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const baseVx = (Math.random() - 0.5) * 0.28;
    const baseVy = -0.12 - Math.random() * 0.24;
    const tonePick = i % 5 === 0 ? 'cinnabar' : i % 2 === 0 ? 'firefly' : 'gold';
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      radius: tonePick === 'firefly' ? 1.7 + Math.random() * 1.9 : 1.1 + Math.random() * 1.5,
      alpha: 0.4 + Math.random() * 0.5,
      phase: Math.random() * Math.PI * 2,
      tone: tonePick,
    });
  }
  return particles;
}

/**
 * Canvas 2D vật lý 60fps phía sau Hero:
 * - 3 dải sóng lụa ánh sáng (Silk Light Ribbons) màu Vàng Thếp & Đỏ Chu Sa
 * - 70 hạt bụi vàng & đom đóm đẩy/xoáy quanh con trỏ chuột (bán kính 140px) + vệt sao băng
 * - Sóng xung kích đồng tâm (Click Ripple Shockwave) lan tỏa mỗi khi click chuột
 */
export function HeroPhysicsCanvas({ atmosphere, className }: HeroPhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const atmosphereRef = useRef<HeroAtmosphere>(atmosphere);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    atmosphereRef.current = atmosphere;
  }, [atmosphere]);

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

      // Phát ra 2 vòng sóng xung kích vàng kim đồng tâm
      ripples.push(
        { x: cx, y: cy, radius: 6, maxRadius: 190, alpha: 0.72, speed: 3.1 },
        { x: cx, y: cy, radius: 2, maxRadius: 255, alpha: 0.48, speed: 2.25 },
      );

      // Đẩy nhẹ các hạt bụi vàng xung quanh tâm sóng
      for (const p of particles) {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const distSq = dx * dx + dy * dy;
        if (distSq > 0.01 && distSq < INTERACTION_RADIUS * INTERACTION_RADIUS * 2.2) {
          const dist = Math.sqrt(distSq);
          const impulse = (1 - dist / (INTERACTION_RADIUS * 1.5)) * 2.6;
          p.vx += (dx / dist) * impulse;
          p.vy += (dy / dist) * impulse;
        }
      }
    };

    const drawRibbons = (
      context: CanvasRenderingContext2D,
      timeSec: number,
      mode: HeroAtmosphere,
    ) => {
      const configs =
        mode === 'night'
          ? [
              {
                amp: 24,
                freq: 0.0032,
                speed: 0.55,
                yBase: height * 0.28,
                color: 'rgba(134, 239, 172, 0.2)',
                width: 1.8,
              },
              {
                amp: 32,
                freq: 0.0026,
                speed: 0.42,
                yBase: height * 0.46,
                color: 'rgba(212, 175, 55, 0.16)',
                width: 1.5,
              },
              {
                amp: 20,
                freq: 0.0038,
                speed: 0.68,
                yBase: height * 0.64,
                color: 'rgba(167, 243, 208, 0.15)',
                width: 1.3,
              },
            ]
          : mode === 'sunset'
            ? [
                {
                  amp: 18,
                  freq: 0.0034,
                  speed: 0.62,
                  yBase: height * 0.68,
                  color: 'rgba(246, 208, 122, 0.34)',
                  width: 1.9,
                },
                {
                  amp: 22,
                  freq: 0.0028,
                  speed: 0.48,
                  yBase: height * 0.78,
                  color: 'rgba(142, 229, 206, 0.24)',
                  width: 1.6,
                },
                {
                  amp: 16,
                  freq: 0.004,
                  speed: 0.72,
                  yBase: height * 0.87,
                  color: 'rgba(246, 208, 122, 0.22)',
                  width: 1.4,
                },
              ]
            : [
                {
                  amp: 22,
                  freq: 0.003,
                  speed: 0.46,
                  yBase: height * 0.32,
                  color: 'rgba(227, 180, 72, 0.24)',
                  width: 1.7,
                },
                {
                  amp: 28,
                  freq: 0.0024,
                  speed: 0.36,
                  yBase: height * 0.52,
                  color: 'rgba(91, 140, 90, 0.18)',
                  width: 1.5,
                },
                {
                  amp: 18,
                  freq: 0.0037,
                  speed: 0.52,
                  yBase: height * 0.7,
                  color: 'rgba(212, 155, 39, 0.18)',
                  width: 1.2,
                },
              ];

      for (const cfg of configs) {
        context.beginPath();
        context.lineWidth = cfg.width;
        context.strokeStyle = cfg.color;
        const step = 28;
        for (let x = -step; x <= width + step; x += step) {
          const y =
            cfg.yBase +
            Math.sin(x * cfg.freq + timeSec * cfg.speed) * cfg.amp +
            Math.cos(x * cfg.freq * 0.6 - timeSec * cfg.speed * 0.7) * (cfg.amp * 0.45);
          if (x <= -step) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.stroke();
      }
    };

    const drawFrame = (timeMs: number, animate: boolean) => {
      const mode = atmosphereRef.current;
      const timeSec = timeMs * 0.001;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1. Dải sóng lụa ánh sáng (Silk Light Ribbons)
      drawRibbons(ctx, timeSec, mode);

      // 2. Hạt đom đóm / bụi nước phát sáng / bụi vàng tương tác chuột (bán kính 140px)
      const activeLimit = mode === 'night' ? particles.length : 72;
      for (let i = 0; i < activeLimit; i += 1) {
        const p = particles[i];
        if (!p) continue;

        if (animate) {
          p.phase += 0.032;

          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > 0.5 && distSq < INTERACTION_RADIUS * INTERACTION_RADIUS) {
              const dist = Math.sqrt(distSq);
              const strength = (1 - dist / INTERACTION_RADIUS) * 0.42;
              const nx = dx / dist;
              const ny = dy / dist;
              // Đẩy rẽ sóng + xoáy quỹ đạo nhẹ quanh con trỏ
              p.vx += nx * strength - ny * strength * 0.75;
              p.vy += ny * strength + nx * strength * 0.75;
            }
          }

          // Hồi về vận tốc tự nhiên (damping)
          const riseSpeed = mode === 'night' && p.tone === 'firefly' ? p.baseVy * 1.45 : p.baseVy;
          p.vx += (p.baseVx - p.vx) * 0.045;
          p.vy += (riseSpeed - p.vy) * 0.045;

          p.x += p.vx;
          p.y += p.vy;

          if (p.y < -12) p.y = height + 12;
          if (p.y > height + 12) p.y = -12;
          if (p.x < -12) p.x = width + 12;
          if (p.x > width + 12) p.x = -12;
        }

        const pulse = 0.65 + 0.35 * Math.sin(p.phase);
        const alpha = p.alpha * pulse * (mode === 'night' ? 1 : 0.78);

        let fillColor: string;
        if (mode === 'night') {
          fillColor =
            p.tone === 'firefly'
              ? `rgba(134, 239, 172, ${alpha.toFixed(3)})`
              : p.tone === 'cinnabar'
                ? `rgba(224, 247, 238, ${(alpha * 0.85).toFixed(3)})`
                : `rgba(229, 195, 120, ${alpha.toFixed(3)})`;
        } else if (mode === 'sunset') {
          fillColor =
            p.tone === 'cinnabar'
              ? `rgba(142, 229, 206, ${alpha.toFixed(3)})`
              : `rgba(246, 208, 122, ${alpha.toFixed(3)})`;
        } else {
          fillColor =
            p.tone === 'cinnabar'
              ? `rgba(91, 140, 90, ${(alpha * 0.7).toFixed(3)})`
              : `rgba(212, 155, 39, ${(alpha * 0.85).toFixed(3)})`;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();

        if (mode === 'night' && (p.tone === 'firefly' || i % 3 === 0)) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3.1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(134, 239, 172, ${(alpha * 0.16).toFixed(3)})`;
          ctx.fill();
        }
      }

      // 3. Vệt sao băng mảnh theo đầu con trỏ (Comet Trail)
      if (animate && trail.length > 1) {
        for (let i = trail.length - 1; i >= 0; i -= 1) {
          const pt = trail[i];
          if (!pt) continue;
          pt.life -= 0.055;
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
          ctx.lineWidth = Math.max(0.7, currPt.life * 2.4);
          ctx.lineCap = 'round';
          ctx.strokeStyle =
            mode === 'night'
              ? `rgba(134, 239, 172, ${(currPt.life * 0.45).toFixed(3)})`
              : `rgba(229, 184, 105, ${(currPt.life * 0.55).toFixed(3)})`;
          ctx.stroke();
        }
      }

      // 4. Sóng xung kích đồng tâm khi Click (Click Ripple Shockwave)
      if (animate && ripples.length > 0) {
        for (let i = ripples.length - 1; i >= 0; i -= 1) {
          const ripple = ripples[i];
          if (!ripple) continue;
          ripple.radius += ripple.speed;
          ripple.alpha *= 0.955;

          if (ripple.radius >= ripple.maxRadius || ripple.alpha <= 0.015) {
            ripples.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
          ctx.lineWidth = 1.6;
          ctx.strokeStyle =
            mode === 'night'
              ? `rgba(212, 175, 55, ${ripple.alpha.toFixed(3)})`
              : `rgba(229, 184, 105, ${ripple.alpha.toFixed(3)})`;
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
