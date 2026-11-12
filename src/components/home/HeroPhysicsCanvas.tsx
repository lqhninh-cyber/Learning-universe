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
  isWater: boolean;
}

interface TrailPoint {
  x: number;
  y: number;
  life: number;
}

interface SunGlint {
  rowNorm: number; // 0 gần chân trời .. 1 gần tiền cảnh
  baseWidth: number;
  baseHeight: number;
  phase: number;
  speed: number;
  driftAmp: number;
  offsetX: number;
}

interface WaterSparkle {
  xRatio: number;
  yNorm: number; // 0 .. 1 trong vùng mặt biển
  phase: number;
  speed: number;
  size: number;
  tone: 'gold' | 'jade';
}

const PARTICLE_COUNT = 64;
const SUN_GLINT_COUNT = 136;
const WATER_SPARKLE_COUNT = 48;
const INTERACTION_RADIUS = 140;
const MAX_TRAIL_POINTS = 16;
const MAX_ACTIVE_RIPPLES = 20;
const WATERLINE_RATIO = 535 / 900;

function createParticles(width: number, height: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const baseVx = (Math.random() - 0.5) * 0.24;
    const baseVy = -0.07 - Math.random() * 0.16;
    const tone: Particle['tone'] = i % 4 === 0 ? 'emerald' : 'gold';
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: baseVx,
      vy: baseVy,
      baseVx,
      baseVy,
      radius: tone === 'emerald' ? 1.2 + Math.random() * 1.3 : 1.0 + Math.random() * 1.5,
      alpha: 0.34 + Math.random() * 0.48,
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
    const spread = 1 + rowNorm * 1.45;
    glints.push({
      rowNorm,
      baseWidth: 12 + rowNorm * 68 + ((i * 19) % 22),
      baseHeight: 0.9 + rowNorm * 2.1,
      phase: i * 0.73,
      speed: 0.9 + (i % 6) * 0.2,
      driftAmp: 4 + rowNorm * 18,
      offsetX: (i % 2 === 0 ? 1 : -1) * (((i * 31) % 72) - 8) * spread * 0.55,
    });
  }
  return glints;
}

function createWaterSparkles(): WaterSparkle[] {
  const sparkles: WaterSparkle[] = [];
  for (let i = 0; i < WATER_SPARKLE_COUNT; i += 1) {
    sparkles.push({
      xRatio: ((i * 73 + 19) % 100) / 100,
      yNorm: ((i * 41 + 7) % 100) / 100,
      phase: i * 1.17,
      speed: 1.2 + (i % 5) * 0.35,
      size: 1.4 + (i % 3) * 0.75,
      tone: i % 3 === 0 ? 'jade' : 'gold',
    });
  }
  return sparkles;
}

/**
 * Canvas 2D hiệu ứng liên tục 60fps cho Vịnh Hạ Long (gộp trong 1 vòng lặp requestAnimationFrame):
 * - Dải ánh nắng mặt trời hình thoi mảnh co giãn & lấp lánh trên mặt sóng từ chân trời tới tiền cảnh
 * - Gợn sóng sine mảnh & đốm sáng lấp lánh (water sparkles) bật/tắt dịu trên mặt biển ngọc
 * - Bụi nắng vàng kim & hạt sáng lơ lửng tương tác con trỏ chuột (bán kính 140px)
 * - Vòng gợn sóng nước elip lan tỏa khi rê chuột trên mặt vịnh & sóng đồng tâm khi Click
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
    const waterSparkles = createWaterSparkles();
    const ripples: Ripple[] = [];
    const trail: TrailPoint[] = [];

    const pointer = {
      x: -9999,
      y: -9999,
      active: false,
      lastRippleX: -9999,
      lastRippleY: -9999,
      lastRippleAt: 0,
    };

    const pushRipple = (ripple: Ripple) => {
      ripples.push(ripple);
      if (ripples.length > MAX_ACTIVE_RIPPLES) {
        ripples.shift();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      pointer.x = x;
      pointer.y = y;
      pointer.active = x >= 0 && x <= width && y >= 0 && y <= height;

      if (!pointer.active) return;

      trail.push({ x, y, life: 1 });
      if (trail.length > MAX_TRAIL_POINTS) {
        trail.shift();
      }

      // Tạo vòng sóng nước lan tỏa khi rê chuột ngang vùng mặt vịnh
      const horizonY = height * WATERLINE_RATIO;
      if (y > horizonY + 8) {
        const now = performance.now();
        const dx = x - pointer.lastRippleX;
        const dy = y - pointer.lastRippleY;
        if (dx * dx + dy * dy > 780 && now - pointer.lastRippleAt > 90) {
          pointer.lastRippleX = x;
          pointer.lastRippleY = y;
          pointer.lastRippleAt = now;
          pushRipple({
            x,
            y,
            radius: 4,
            maxRadius: 56 + ((y - horizonY) / Math.max(height - horizonY, 1)) * 42,
            alpha: 0.42,
            speed: 1.45,
            isWater: true,
          });
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;
      const isWater = cy > height * WATERLINE_RATIO;

      pushRipple({
        x: cx,
        y: cy,
        radius: 6,
        maxRadius: isWater ? 140 : 175,
        alpha: 0.58,
        speed: isWater ? 2.4 : 2.9,
        isWater,
      });
      pushRipple({
        x: cx,
        y: cy,
        radius: 2,
        maxRadius: isWater ? 195 : 235,
        alpha: 0.36,
        speed: isWater ? 1.75 : 2.1,
        isWater,
      });

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

    const drawSineWaterWaves = (context: CanvasRenderingContext2D, timeSec: number) => {
      const horizonY = height * WATERLINE_RATIO;
      const seaSpanY = Math.max(height - horizonY - 18, 100);
      const waveBands = 7;

      context.lineWidth = 1;
      for (let b = 0; b < waveBands; b += 1) {
        const norm = (b + 0.4) / waveBands;
        const baseY = horizonY + 14 + Math.pow(norm, 1.38) * seaSpanY;
        const amp = 1.1 + norm * 2.4;
        const freq = 0.014 - norm * 0.005;
        const phase = timeSec * (0.9 + b * 0.14) + b * 1.3;

        context.beginPath();
        for (let sx = 0; sx <= width; sx += 44) {
          const sy = baseY + Math.sin(sx * freq + phase) * amp;
          if (sx === 0) {
            context.moveTo(sx, sy);
          } else {
            context.lineTo(sx, sy);
          }
        }
        context.strokeStyle = `rgba(142, 229, 206, ${(0.04 + norm * 0.05).toFixed(3)})`;
        context.stroke();
      }
    };

    const drawDynamicSunpath = (context: CanvasRenderingContext2D, timeSec: number) => {
      const horizonY = height * WATERLINE_RATIO;
      const seaSpanY = Math.max(height - horizonY - 22, 120);
      const sunCenterX = width * 0.51;

      for (const glint of sunGlints) {
        const perspectiveY = horizonY + 6 + Math.pow(glint.rowNorm, 1.55) * seaSpanY;
        const waveX = Math.sin(timeSec * glint.speed + glint.phase) * glint.driftAmp;
        const waveY =
          Math.cos(timeSec * (glint.speed * 0.8) + glint.phase) * (0.8 + glint.rowNorm * 1.4);
        const widthMod = 0.68 + 0.42 * Math.sin(timeSec * (glint.speed * 1.15) + glint.phase);
        const shimmer = 0.48 + 0.52 * Math.sin(timeSec * glint.speed * 1.5 + glint.phase);
        const alpha = (0.24 + 0.52 * (1 - glint.rowNorm * 0.48)) * shimmer;

        const xCenter = sunCenterX + glint.offsetX + waveX;
        const py = perspectiveY + waveY;
        const halfW = glint.baseWidth * widthMod * 0.5;
        const halfH = glint.baseHeight * (0.75 + 0.25 * shimmer);

        // Vệt sóng hình thoi mảnh sắc nét
        context.beginPath();
        context.moveTo(xCenter - halfW, py);
        context.lineTo(xCenter, py - halfH);
        context.lineTo(xCenter + halfW, py);
        context.lineTo(xCenter, py + halfH);
        context.closePath();
        context.fillStyle = `rgba(232, 168, 90, ${alpha.toFixed(3)})`;
        context.fill();

        // Lõi ánh nắng vàng rực ở giữa hình thoi
        if (shimmer > 0.55) {
          context.beginPath();
          context.moveTo(xCenter - halfW * 0.45, py);
          context.lineTo(xCenter, py - halfH * 0.65);
          context.lineTo(xCenter + halfW * 0.45, py);
          context.lineTo(xCenter, py + halfH * 0.65);
          context.closePath();
          context.fillStyle = `rgba(255, 232, 175, ${(alpha * 0.92).toFixed(3)})`;
          context.fill();
        }
      }
    };

    const drawWaterSparkles = (context: CanvasRenderingContext2D, timeSec: number) => {
      const horizonY = height * WATERLINE_RATIO;
      const seaSpanY = Math.max(height - horizonY - 24, 100);

      for (const sp of waterSparkles) {
        const pulse = Math.pow(Math.max(0, Math.sin(timeSec * sp.speed + sp.phase)), 4);
        if (pulse < 0.04) continue;

        const sx = sp.xRatio * width;
        const sy = horizonY + 12 + Math.pow(sp.yNorm, 1.3) * seaSpanY;
        const arm = sp.size * (0.7 + pulse * 1.1);

        context.strokeStyle =
          sp.tone === 'jade'
            ? `rgba(174, 244, 224, ${(pulse * 0.72).toFixed(3)})`
            : `rgba(255, 228, 168, ${(pulse * 0.85).toFixed(3)})`;
        context.lineWidth = 0.95;

        context.beginPath();
        context.moveTo(sx - arm * 1.6, sy);
        context.lineTo(sx + arm * 1.6, sy);
        context.moveTo(sx, sy - arm);
        context.lineTo(sx, sy + arm);
        context.stroke();
      }
    };

    const drawFrame = (timeMs: number, animate: boolean) => {
      const timeSec = timeMs * 0.001;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const sampleTime = animate ? timeSec : 0.45;

      // 1. Gợn sóng sine mềm & Dải nắng mặt trời hình thoi lấp lánh trên mặt biển
      drawSineWaterWaves(ctx, sampleTime);
      drawDynamicSunpath(ctx, sampleTime);

      // 2. Đốm sáng lấp lánh (water sparkles) bật/tắt dịu trên mặt biển xanh ngọc
      drawWaterSparkles(ctx, sampleTime);

      // 3. Bụi nắng vàng kim & đom đóm lơ lửng tương tác chuột (bán kính 140px)
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

        const pulse = 0.58 + 0.42 * Math.sin(p.phase);
        const alpha = p.alpha * pulse;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          p.tone === 'emerald'
            ? `rgba(142, 229, 206, ${(alpha * 0.7).toFixed(3)})`
            : `rgba(255, 213, 132, ${(alpha * 0.88).toFixed(3)})`;
        ctx.fill();

        if (p.tone === 'gold') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 168, 90, ${(alpha * 0.16).toFixed(3)})`;
          ctx.fill();
        }
      }

      // 4. Vệt sáng mảnh theo đầu con trỏ
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
          ctx.strokeStyle = `rgba(255, 213, 132, ${(currPt.life * 0.45).toFixed(3)})`;
          ctx.stroke();
        }
      }

      // 5. Gợn sóng nước lan tỏa tròn phối cảnh elip (rê chuột trên biển & Click)
      if (animate && ripples.length > 0) {
        for (let i = ripples.length - 1; i >= 0; i -= 1) {
          const ripple = ripples[i];
          if (!ripple) continue;
          ripple.radius += ripple.speed;
          ripple.alpha *= ripple.isWater ? 0.96 : 0.95;

          if (ripple.radius >= ripple.maxRadius || ripple.alpha <= 0.015) {
            ripples.splice(i, 1);
            continue;
          }

          ctx.beginPath();
          if (ripple.isWater) {
            ctx.ellipse(ripple.x, ripple.y, ripple.radius, ripple.radius * 0.34, 0, 0, Math.PI * 2);
            ctx.lineWidth = 1.25;
            ctx.strokeStyle = `rgba(174, 244, 224, ${ripple.alpha.toFixed(3)})`;
          } else {
            ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            ctx.lineWidth = 1.4;
            ctx.strokeStyle = `rgba(255, 213, 132, ${ripple.alpha.toFixed(3)})`;
          }
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
      ripples.length = 0;
      trail.length = 0;
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
