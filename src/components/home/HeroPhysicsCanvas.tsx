import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import {
  computeFrameDelta,
  createGlowSpriteCache,
  drawGlowSprite,
  frameDampFactor,
  getLowLatency2DContext,
} from '@/shared/lib/canvasSprites';
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

interface ForegroundBird {
  species: 'gull' | 'egret';
  xRatio: number;
  yRatio: number;
  vxRatio: number;
  bobAmp: number;
  wingSpan: number;
  flapSpeed: number;
  phase: number;
}

interface HighEagle {
  centerXRatio: number;
  centerYRatio: number;
  orbitRx: number;
  orbitRy: number;
  angularSpeed: number;
  phase: number;
  wingSpan: number;
}

interface SchoolFish {
  schoolIdx: 0 | 1;
  offsetX: number;
  offsetY: number;
  length: number;
  opacity: number;
  phase: number;
  tone: 'gold' | 'silver';
}

interface FishSchool {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseSpeed: number;
  phase: number;
  tone: 'gold' | 'silver';
}

interface PlanktonMote {
  xRatio: number;
  yNorm: number;
  phase: number;
  driftSpeed: number;
  radius: number;
  tone: 'emerald' | 'gold';
}

interface LeapingFishState {
  active: boolean;
  startMs: number;
  nextTriggerMs: number;
  originX: number;
  originY: number;
  direction: 1 | -1;
  arcWidth: number;
  arcHeight: number;
  durationMs: number;
  entrySplashed: boolean;
}

interface SplashDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  radius: number;
}

const PARTICLE_COUNT = 64;
const SUN_GLINT_COUNT = 136;
const WATER_SPARKLE_COUNT = 48;
const PLANKTON_COUNT = 42;
const INTERACTION_RADIUS = 140;
const MAX_TRAIL_POINTS = 18;
const MAX_ACTIVE_RIPPLES = 24;
const MAX_SPLASH_DROPLETS = 28;
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

function createForegroundBirds(): ForegroundBird[] {
  return [
    {
      species: 'gull',
      xRatio: 0.14,
      yRatio: 0.44,
      vxRatio: 0.024,
      bobAmp: 7,
      wingSpan: 17,
      flapSpeed: 5.2,
      phase: 0.2,
    },
    {
      species: 'egret',
      xRatio: 0.31,
      yRatio: 0.51,
      vxRatio: 0.019,
      bobAmp: 6,
      wingSpan: 22,
      flapSpeed: 4.1,
      phase: 1.6,
    },
    {
      species: 'gull',
      xRatio: 0.48,
      yRatio: 0.47,
      vxRatio: -0.021,
      bobAmp: 8,
      wingSpan: 16,
      flapSpeed: 5.5,
      phase: 2.9,
    },
    {
      species: 'egret',
      xRatio: 0.66,
      yRatio: 0.54,
      vxRatio: -0.017,
      bobAmp: 5.5,
      wingSpan: 21,
      flapSpeed: 3.9,
      phase: 4.1,
    },
    {
      species: 'gull',
      xRatio: 0.82,
      yRatio: 0.41,
      vxRatio: -0.026,
      bobAmp: 7.5,
      wingSpan: 15,
      flapSpeed: 5.8,
      phase: 5.0,
    },
    {
      species: 'gull',
      xRatio: 0.57,
      yRatio: 0.37,
      vxRatio: 0.022,
      bobAmp: 6.5,
      wingSpan: 14,
      flapSpeed: 5.1,
      phase: 0.9,
    },
  ];
}

function createHighEagles(): HighEagle[] {
  return [
    {
      centerXRatio: 0.22,
      centerYRatio: 0.23,
      orbitRx: 68,
      orbitRy: 22,
      angularSpeed: 0.24,
      phase: 0.4,
      wingSpan: 24,
    },
    {
      centerXRatio: 0.77,
      centerYRatio: 0.2,
      orbitRx: 78,
      orbitRy: 25,
      angularSpeed: -0.21,
      phase: 2.2,
      wingSpan: 26,
    },
    {
      centerXRatio: 0.48,
      centerYRatio: 0.16,
      orbitRx: 56,
      orbitRy: 18,
      angularSpeed: 0.19,
      phase: 4.1,
      wingSpan: 22,
    },
  ];
}

function createFishSchools(
  width: number,
  height: number,
): {
  schools: FishSchool[];
  members: SchoolFish[];
} {
  const horizonY = height * WATERLINE_RATIO;
  const schools: FishSchool[] = [
    {
      x: width * 0.28,
      y: horizonY + (height - horizonY) * 0.46,
      vx: 0.56,
      vy: 0.04,
      baseSpeed: 0.58,
      phase: 0.3,
      tone: 'gold',
    },
    {
      x: width * 0.72,
      y: horizonY + (height - horizonY) * 0.64,
      vx: -0.5,
      vy: -0.03,
      baseSpeed: 0.52,
      phase: 2.6,
      tone: 'silver',
    },
  ];

  const members: SchoolFish[] = [];
  for (let i = 0; i < 10; i += 1) {
    const col = Math.floor(i / 2);
    const rowSign = i % 2 === 0 ? 1 : -1;
    members.push({
      schoolIdx: 0,
      offsetX: -col * 13 + (i % 3) * 4,
      offsetY: rowSign * (4 + col * 3.5),
      length: 11 + (i % 4) * 2.2,
      opacity: 0.38 + ((i * 13) % 24) / 100,
      phase: i * 0.85,
      tone: 'gold',
    });
  }
  for (let i = 0; i < 9; i += 1) {
    const col = Math.floor(i / 2);
    const rowSign = i % 2 === 0 ? 1 : -1;
    members.push({
      schoolIdx: 1,
      offsetX: col * 14 - (i % 3) * 3,
      offsetY: rowSign * (4 + col * 3.4),
      length: 10.5 + (i % 3) * 2.4,
      opacity: 0.36 + ((i * 17) % 26) / 100,
      phase: i * 0.92 + 1.2,
      tone: 'silver',
    });
  }

  return { schools, members };
}

function createPlanktonMotes(): PlanktonMote[] {
  const motes: PlanktonMote[] = [];
  for (let i = 0; i < PLANKTON_COUNT; i += 1) {
    motes.push({
      xRatio: ((i * 61 + 13) % 100) / 100,
      yNorm: 0.06 + (((i * 37 + 11) % 88) / 100) * 0.9,
      phase: i * 0.91,
      driftSpeed: 0.8 + (i % 5) * 0.25,
      radius: 1.1 + (i % 3) * 0.55,
      tone: i % 3 === 0 ? 'gold' : 'emerald',
    });
  }
  return motes;
}

function drawArticulatedBird(
  context: CanvasRenderingContext2D,
  bx: number,
  by: number,
  wingSpan: number,
  flapWave: number,
  facing: 1 | -1,
  color: string,
  species: 'gull' | 'egret' | 'eagle',
) {
  context.save();
  context.translate(bx, by);
  context.scale(facing, 1);

  const innerElbowLift = -wingSpan * (0.28 + flapWave * 0.34);
  const tipLift = wingSpan * (0.08 - flapWave * 0.44);

  // Thân thuôn nhọn & cổ/mỏ thanh mảnh
  context.fillStyle = color;
  context.beginPath();
  context.ellipse(0, 0, wingSpan * 0.26, wingSpan * 0.085, 0, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = color;
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = species === 'eagle' ? 1.85 : species === 'egret' ? 1.55 : 1.35;

  // Cánh sau (cung 2 khớp gập lướt gió)
  context.beginPath();
  context.moveTo(-1, -0.5);
  context.quadraticCurveTo(
    -wingSpan * 0.44,
    innerElbowLift * 0.9,
    -wingSpan * 0.82,
    innerElbowLift + tipLift * 0.65,
  );
  context.stroke();

  // Cánh trước (cung 2 khớp rõ nét)
  context.beginPath();
  context.moveTo(1, -0.5);
  context.quadraticCurveTo(wingSpan * 0.38, innerElbowLift, wingSpan * 0.64, innerElbowLift * 0.72);
  context.quadraticCurveTo(wingSpan * 0.84, tipLift * 0.5, wingSpan, tipLift);
  context.stroke();

  context.restore();
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

    const ctx = getLowLatency2DContext(canvas, { alpha: true });
    if (!ctx) return;

    const glowSprites = createGlowSpriteCache();

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
    const foregroundBirds = createForegroundBirds();
    const highEagles = createHighEagles();
    const { schools: fishSchools, members: schoolMembers } = createFishSchools(width, height);
    const planktonMotes = createPlanktonMotes();
    const ripples: Ripple[] = [];
    const trail: TrailPoint[] = [];
    const splashDroplets: SplashDroplet[] = [];
    const leapState: LeapingFishState = {
      active: false,
      startMs: 0,
      nextTriggerMs: 3200,
      originX: width * 0.42,
      originY: height * (WATERLINE_RATIO + 0.14),
      direction: 1,
      arcWidth: 68,
      arcHeight: 42,
      durationMs: 980,
      entrySplashed: false,
    };

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

    const drawShimmeringWaterReflections = (context: CanvasRenderingContext2D, timeSec: number) => {
      const horizonY = height * WATERLINE_RATIO;
      const seaSpanY = Math.max(height - horizonY - 18, 90);
      // Gợn phản chiếu bóng đảo Karst & thuyền buồm cắt lát ngang 120fps thay thế SVG feDisplacementMap
      const anchors = [
        { xRatio: 0.16, spanW: 54, tone: 'rgba(13, 34, 31, 0.24)' },
        { xRatio: 0.56, spanW: 68, tone: 'rgba(16, 40, 36, 0.28)' },
        { xRatio: 0.77, spanW: 84, tone: 'rgba(12, 30, 27, 0.26)' },
        { xRatio: 0.9, spanW: 48, tone: 'rgba(20, 44, 39, 0.22)' },
      ] as const;

      context.lineCap = 'round';
      for (let a = 0; a < anchors.length; a += 1) {
        const anchor = anchors[a];
        if (!anchor) continue;
        const baseX = width * anchor.xRatio;
        context.strokeStyle = anchor.tone;
        for (let row = 0; row < 5; row += 1) {
          const norm = (row + 0.3) / 5.4;
          const ry = horizonY + 12 + norm * seaSpanY * 0.58;
          const waveShift = Math.sin(timeSec * 1.45 + row * 1.1 + a) * (4 + row * 1.5);
          const halfSpan = anchor.spanW * (1 - norm * 0.42);
          context.lineWidth = Math.max(1.2, 2.8 - norm * 1.4);
          context.beginPath();
          context.moveTo(baseX + waveShift - halfSpan, ry);
          context.lineTo(baseX + waveShift + halfSpan, ry);
          context.stroke();
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

    const drawBioluminescentPlankton = (context: CanvasRenderingContext2D, timeSec: number) => {
      const horizonY = height * WATERLINE_RATIO;
      const seaSpanY = Math.max(height - horizonY - 18, 90);

      for (const mote of planktonMotes) {
        const px =
          (((mote.xRatio * width + Math.sin(timeSec * 0.35 + mote.phase) * 18) % width) + width) %
          width;
        const py = horizonY + 8 + mote.yNorm * seaSpanY + Math.cos(timeSec * 0.55 + mote.phase) * 4;
        const glow =
          0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(timeSec * mote.driftSpeed + mote.phase), 2);
        const radius = mote.radius * (0.85 + 0.35 * glow);

        drawGlowSprite(
          context,
          glowSprites[mote.tone === 'emerald' ? 'emerald' : 'gold'],
          px,
          py,
          radius * 4.2,
          glow * 0.42,
        );

        context.beginPath();
        context.arc(px, py, radius, 0, Math.PI * 2);
        context.fillStyle =
          mote.tone === 'emerald'
            ? `rgba(110, 231, 183, ${(glow * 0.65).toFixed(3)})`
            : `rgba(253, 230, 138, ${(glow * 0.68).toFixed(3)})`;
        context.fill();
      }
    };

    const drawUnderwaterFishSchools = (
      context: CanvasRenderingContext2D,
      timeSec: number,
      dtSeconds: number,
      dtScale: number,
      animate: boolean,
    ) => {
      const horizonY = height * WATERLINE_RATIO;
      const minSeaY = horizonY + 28;
      const maxSeaY = Math.max(height - 26, minSeaY + 40);
      const schoolLerp = frameDampFactor(1.85, dtSeconds);

      for (const school of fishSchools) {
        if (animate) {
          school.phase += 0.022 * dtScale;
          const baseDir = school.tone === 'gold' ? 1 : -1;
          let targetVx = baseDir * school.baseSpeed;
          let targetVy = Math.sin(timeSec * 0.75 + school.phase) * 0.24;

          if (pointer.active && pointer.y > horizonY + 14) {
            const dx = pointer.x - school.x;
            const dy = pointer.y - school.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 28 && dist < 240) {
              targetVx += (dx / dist) * 0.42;
              targetVy += (dy / dist) * 0.28;
            }
          }

          school.vx += (targetVx - school.vx) * schoolLerp;
          school.vy += (targetVy - school.vy) * schoolLerp;
          school.x += school.vx * dtScale;
          school.y += school.vy * dtScale;

          if (school.x > width + 90) school.x = -90;
          if (school.x < -90) school.x = width + 90;
          if (school.y < minSeaY) school.y = minSeaY + 4;
          if (school.y > maxSeaY) school.y = maxSeaY - 4;
        }
      }

      for (const fish of schoolMembers) {
        const school = fishSchools[fish.schoolIdx];
        if (!school) continue;
        const swimWave = Math.sin(timeSec * 4.5 + fish.phase) * 2.2;
        const fx = school.x + fish.offsetX;
        const fy = school.y + fish.offsetY + swimWave;
        const heading = Math.atan2(school.vy, school.vx || 1);
        const tailWag = Math.sin(timeSec * 11 + fish.phase) * 2.6;

        context.save();
        context.translate(fx, fy);
        context.rotate(heading);

        context.fillStyle =
          fish.tone === 'gold'
            ? `rgba(246, 201, 107, ${fish.opacity.toFixed(3)})`
            : `rgba(182, 238, 224, ${fish.opacity.toFixed(3)})`;

        // Thân cá thuôn dài mờ ảo dưới làn nước ngọc
        context.beginPath();
        context.moveTo(fish.length * 0.55, 0);
        context.quadraticCurveTo(0, -fish.length * 0.22, -fish.length * 0.45, 0);
        context.quadraticCurveTo(0, fish.length * 0.22, fish.length * 0.55, 0);
        context.fill();

        // Đuôi cá vẫy nhẹ
        context.beginPath();
        context.moveTo(-fish.length * 0.4, 0);
        context.lineTo(-fish.length * 0.78, -fish.length * 0.22 + tailWag);
        context.lineTo(-fish.length * 0.78, fish.length * 0.22 + tailWag);
        context.closePath();
        context.fill();

        context.restore();
      }
    };

    const drawLeapingFishAndSplashes = (
      context: CanvasRenderingContext2D,
      timeMs: number,
      dtScale: number,
      animate: boolean,
    ) => {
      if (!animate) return;
      const horizonY = height * WATERLINE_RATIO;

      if (!leapState.active && timeMs >= leapState.nextTriggerMs) {
        const spot = 0.24 + Math.random() * 0.54;
        leapState.active = true;
        leapState.startMs = timeMs;
        leapState.originX = width * spot;
        leapState.originY = horizonY + 34 + Math.random() * Math.max(height - horizonY - 96, 40);
        leapState.direction = Math.random() > 0.5 ? 1 : -1;
        leapState.arcWidth = 54 + Math.random() * 28;
        leapState.arcHeight = 32 + Math.random() * 18;
        leapState.entrySplashed = false;

        // Vòng sóng khi cá phóng lên khỏi mặt nước
        pushRipple({
          x: leapState.originX,
          y: leapState.originY,
          radius: 5,
          maxRadius: 68,
          alpha: 0.52,
          speed: 1.55,
          isWater: true,
        });
      }

      if (leapState.active) {
        const elapsed = timeMs - leapState.startMs;
        const progress = Math.min(1, elapsed / leapState.durationMs);
        const fx = leapState.originX + leapState.direction * leapState.arcWidth * progress;
        const fy = leapState.originY - 4 * leapState.arcHeight * progress * (1 - progress);
        const slopeY = -4 * leapState.arcHeight * (1 - 2 * progress);
        const angle = Math.atan2(slopeY, leapState.direction * leapState.arcWidth);

        context.save();
        context.translate(fx, fy);
        context.rotate(angle);
        context.fillStyle = 'rgba(255, 224, 152, 0.9)';
        context.beginPath();
        context.ellipse(0, 0, 8.5, 2.7, 0, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.moveTo(-7.5, 0);
        context.lineTo(-12.5, -3.5);
        context.lineTo(-12.5, 3.5);
        context.closePath();
        context.fill();
        context.restore();

        if (progress >= 0.96 && !leapState.entrySplashed) {
          leapState.entrySplashed = true;
          const endX = leapState.originX + leapState.direction * leapState.arcWidth;
          for (let rIdx = 0; rIdx < 3; rIdx += 1) {
            pushRipple({
              x: endX,
              y: leapState.originY,
              radius: 3 + rIdx * 4,
              maxRadius: 56 + rIdx * 24,
              alpha: 0.56 - rIdx * 0.1,
              speed: 1.2 + rIdx * 0.25,
              isWater: true,
            });
          }
          for (let d = 0; d < 7; d += 1) {
            if (splashDroplets.length >= MAX_SPLASH_DROPLETS) {
              splashDroplets.shift();
            }
            splashDroplets.push({
              x: endX + (Math.random() - 0.5) * 6,
              y: leapState.originY,
              vx: (Math.random() - 0.5) * 2.2,
              vy: -2.2 - Math.random() * 1.9,
              alpha: 0.85,
              radius: 1.2 + Math.random() * 1.1,
            });
          }
        }

        if (progress >= 1) {
          leapState.active = false;
          leapState.nextTriggerMs = timeMs + 4200 + Math.random() * 1700;
        }
      }

      for (let i = splashDroplets.length - 1; i >= 0; i -= 1) {
        const drop = splashDroplets[i];
        if (!drop) continue;
        drop.vy += 0.14 * dtScale;
        drop.x += drop.vx * dtScale;
        drop.y += drop.vy * dtScale;
        drop.alpha -= 0.032 * dtScale;

        if (drop.alpha <= 0.02) {
          splashDroplets.splice(i, 1);
          continue;
        }

        context.beginPath();
        context.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
        context.fillStyle = `rgba(220, 250, 240, ${drop.alpha.toFixed(3)})`;
        context.fill();
      }
    };

    const drawAirborneBirdsAndEagles = (
      context: CanvasRenderingContext2D,
      timeSec: number,
      dtScale: number,
      animate: boolean,
    ) => {
      // 3 đại bàng biển lượn vòng elip chậm trên tầm cao quanh các đỉnh Karst
      for (const eagle of highEagles) {
        const angle = eagle.phase + timeSec * eagle.angularSpeed;
        const ex = eagle.centerXRatio * width + Math.cos(angle) * eagle.orbitRx;
        const ey = eagle.centerYRatio * height + Math.sin(angle) * eagle.orbitRy;
        const facing: 1 | -1 = Math.sin(angle) * eagle.angularSpeed < 0 ? 1 : -1;
        const flap = Math.sin(timeSec * 1.8 + eagle.phase) * 0.25;
        drawArticulatedBird(
          context,
          ex,
          ey,
          eagle.wingSpan,
          flap,
          facing,
          'rgba(28, 22, 26, 0.72)',
          'eagle',
        );
      }

      // 6 chim hải âu & cò trắng có cánh 2 khớp bay lướt qua vịnh & đan xen nhịp vỗ - lướt
      for (const bird of foregroundBirds) {
        if (animate) {
          bird.xRatio += bird.vxRatio * 0.016 * dtScale;
          if (bird.xRatio > 1.06) bird.xRatio = -0.06;
          if (bird.xRatio < -0.06) bird.xRatio = 1.06;
        }

        const bx = bird.xRatio * width;
        const by = bird.yRatio * height + Math.sin(timeSec * 1.2 + bird.phase) * bird.bobAmp;
        // Xen kẽ chu kỳ vỗ cánh và lướt nghiêng nhẹ
        const glideCycle = Math.sin(timeSec * 0.65 + bird.phase);
        const flap =
          glideCycle > 0.28
            ? 0.16 * Math.sin(timeSec * 1.4 + bird.phase)
            : Math.sin(timeSec * bird.flapSpeed + bird.phase);
        const facing: 1 | -1 = bird.vxRatio >= 0 ? 1 : -1;
        const color =
          bird.species === 'egret' ? 'rgba(248, 245, 236, 0.84)' : 'rgba(255, 236, 200, 0.76)';

        drawArticulatedBird(context, bx, by, bird.wingSpan, flap, facing, color, bird.species);
      }
    };

    const drawFrame = (timeMs: number, dtSeconds: number, dtScale: number, animate: boolean) => {
      const timeSec = timeMs * 0.001;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const sampleTime = animate ? timeSec : 0.45;
      const particleDamp = frameDampFactor(2.76, dtSeconds);

      // 1. Gợn phản chiếu Karst 120fps, sóng sine, dải nắng, sinh vật phát quang & đàn cá bơi dưới vịnh
      drawShimmeringWaterReflections(ctx, sampleTime);
      drawSineWaterWaves(ctx, sampleTime);
      drawDynamicSunpath(ctx, sampleTime);
      drawBioluminescentPlankton(ctx, sampleTime);
      drawUnderwaterFishSchools(ctx, sampleTime, dtSeconds, dtScale, animate);
      drawLeapingFishAndSplashes(ctx, timeMs, dtScale, animate);

      // 2. Đốm sáng lấp lánh (water sparkles) & Đàn chim hải âu / cò trắng / đại bàng trên cao
      drawWaterSparkles(ctx, sampleTime);
      drawAirborneBirdsAndEagles(ctx, sampleTime, dtScale, animate);

      // 3. Bụi nắng vàng kim & đom đóm lơ lửng tương tác chuột (bán kính 140px)
      for (const p of particles) {
        if (animate) {
          p.phase += 0.028 * dtScale;

          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const distSq = dx * dx + dy * dy;
            if (distSq > 0.5 && distSq < INTERACTION_RADIUS * INTERACTION_RADIUS) {
              const dist = Math.sqrt(distSq);
              const strength = (1 - dist / INTERACTION_RADIUS) * 0.36 * dtScale;
              const nx = dx / dist;
              const ny = dy / dist;
              p.vx += nx * strength - ny * strength * 0.65;
              p.vy += ny * strength + nx * strength * 0.65;
            }
          }

          p.vx += (p.baseVx - p.vx) * particleDamp;
          p.vy += (p.baseVy - p.vy) * particleDamp;

          p.x += p.vx * dtScale;
          p.y += p.vy * dtScale;

          if (p.y < -12) p.y = height + 12;
          if (p.y > height + 12) p.y = -12;
          if (p.x < -12) p.x = width + 12;
          if (p.x > width + 12) p.x = -12;
        }

        const pulse = 0.58 + 0.42 * Math.sin(p.phase);
        const alpha = p.alpha * pulse;

        if (p.tone === 'gold') {
          drawGlowSprite(ctx, glowSprites.gold, p.x, p.y, p.radius * 3.8, alpha * 0.48);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle =
          p.tone === 'emerald'
            ? `rgba(142, 229, 206, ${(alpha * 0.7).toFixed(3)})`
            : `rgba(255, 213, 132, ${(alpha * 0.88).toFixed(3)})`;
        ctx.fill();
      }

      // 4. Vệt sáng & rẽ nước hình chữ V phát quang theo đầu con trỏ trên mặt vịnh
      if (animate && trail.length > 1) {
        const horizonY = height * WATERLINE_RATIO;
        for (let i = trail.length - 1; i >= 0; i -= 1) {
          const pt = trail[i];
          if (!pt) continue;
          pt.life -= 0.055 * dtScale;
          if (pt.life <= 0) {
            trail.splice(i, 1);
          }
        }

        for (let i = 1; i < trail.length; i += 1) {
          const prevPt = trail[i - 1];
          const currPt = trail[i];
          if (!prevPt || !currPt) continue;
          const overWater = currPt.y > horizonY + 8;

          ctx.beginPath();
          ctx.moveTo(prevPt.x, prevPt.y);
          ctx.lineTo(currPt.x, currPt.y);
          ctx.lineWidth = Math.max(0.7, currPt.life * (overWater ? 2.4 : 2.1));
          ctx.lineCap = 'round';
          ctx.strokeStyle = overWater
            ? `rgba(110, 231, 183, ${(currPt.life * 0.56).toFixed(3)})`
            : `rgba(255, 213, 132, ${(currPt.life * 0.45).toFixed(3)})`;
          ctx.stroke();

          // Vệt rẽ nước chữ V sinh vật phù du phát quang khi rê chuột qua vùng mặt vịnh
          if (overWater) {
            const dx = currPt.x - prevPt.x;
            const dy = currPt.y - prevPt.y;
            const len = Math.hypot(dx, dy);
            if (len > 1.5) {
              const nx = -dy / len;
              const ny = dx / len;
              const spread = (1 - currPt.life) * 18 + 5;
              ctx.beginPath();
              ctx.moveTo(currPt.x, currPt.y);
              ctx.lineTo(prevPt.x + nx * spread, prevPt.y + ny * spread);
              ctx.moveTo(currPt.x, currPt.y);
              ctx.lineTo(prevPt.x - nx * spread, prevPt.y - ny * spread);
              ctx.lineWidth = 0.85;
              ctx.strokeStyle = `rgba(110, 231, 183, ${(currPt.life * 0.28).toFixed(3)})`;
              ctx.stroke();
            }
          }
        }
      }

      // 5. Gợn sóng nước lan tỏa tròn phối cảnh elip (rê chuột trên biển & Click)
      if (animate && ripples.length > 0) {
        const waterDecay = Math.pow(0.96, dtScale);
        const airDecay = Math.pow(0.95, dtScale);
        for (let i = ripples.length - 1; i >= 0; i -= 1) {
          const ripple = ripples[i];
          if (!ripple) continue;
          ripple.radius += ripple.speed * dtScale;
          ripple.alpha *= ripple.isWater ? waterDecay : airDecay;

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
      drawFrame(0, 1 / 60, 1, false);
      window.addEventListener('resize', resize, { passive: true });
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    let rafId = 0;
    let isDisposed = false;
    let isIntersecting = true;
    let elapsedSec = 0;
    let prevNowMs = performance.now();

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const tick = (now: number) => {
      if (isDisposed || !isIntersecting) {
        rafId = 0;
        return;
      }
      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNowMs);
      prevNowMs = now;
      elapsedSec += dtSeconds;

      drawFrame(elapsedSec * 1000, dtSeconds, dtScale, true);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (isDisposed || !isIntersecting || rafId !== 0) return;
      prevNowMs = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0.02 },
      );
      intersectionObserver.observe(canvas);
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    startLoop();

    return () => {
      isDisposed = true;
      stopLoop();
      intersectionObserver?.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
      ripples.length = 0;
      trail.length = 0;
      splashDroplets.length = 0;
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
