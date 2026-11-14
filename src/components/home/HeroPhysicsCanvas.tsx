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

type OffscreenSurface = OffscreenCanvas | HTMLCanvasElement;

interface StarSpriteCache {
  readonly ivory: OffscreenSurface | null;
  readonly silver: OffscreenSurface | null;
  readonly gold: OffscreenSurface | null;
  readonly cloudIvory: OffscreenSurface | null;
  readonly cloudMist: OffscreenSurface | null;
  readonly cloudSlate: OffscreenSurface | null;
}

interface StarMote {
  readonly nx: number;
  readonly ny: number;
  readonly size: number;
  readonly baseAlpha: number;
  readonly twinkleSpeed: number;
  readonly phase: number;
  readonly tone: 'ivory' | 'silver' | 'gold';
  readonly inMilkyWay: boolean;
}

interface ConstellationVertex {
  readonly nx: number;
  readonly ny: number;
}

interface ConstellationCircle {
  readonly cx: number;
  readonly cy: number;
  readonly rRatio: number;
}

interface ConstellationSpec {
  readonly id: string;
  readonly centerNx: number;
  readonly centerNy: number;
  readonly vertices: readonly ConstellationVertex[];
  readonly edges: readonly (readonly [number, number])[];
  readonly circumcircle?: ConstellationCircle;
  readonly baseOpacity: number;
  glow: number;
}

interface ShootingStar {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
}

interface ValleyFirefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
}

interface CloudRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

interface CloudLayerSpec {
  readonly yRatio: number;
  readonly amplitude: number;
  readonly speed: number;
  readonly waveFreq: number;
  readonly waveCount: number;
  readonly color: string;
  readonly opacity: number;
  readonly puffTone: 'cloudIvory' | 'cloudMist' | 'cloudSlate';
  readonly puffRadius: number;
}

const CLOUD_LAYERS: readonly CloudLayerSpec[] = [
  {
    yRatio: 0.675,
    amplitude: 16,
    speed: 14,
    waveFreq: 0.0042,
    waveCount: 9,
    color: '#C5D3DC',
    opacity: 0.34,
    puffTone: 'cloudSlate',
    puffRadius: 112,
  },
  {
    yRatio: 0.735,
    amplitude: 20,
    speed: -18,
    waveFreq: 0.0036,
    waveCount: 8,
    color: '#D5DFE5',
    opacity: 0.44,
    puffTone: 'cloudSlate',
    puffRadius: 124,
  },
  {
    yRatio: 0.795,
    amplitude: 22,
    speed: 24,
    waveFreq: 0.0046,
    waveCount: 9,
    color: '#E6E2D6',
    opacity: 0.56,
    puffTone: 'cloudMist',
    puffRadius: 136,
  },
  {
    yRatio: 0.86,
    amplitude: 24,
    speed: -28,
    waveFreq: 0.0039,
    waveCount: 8,
    color: '#F2EFE7',
    opacity: 0.7,
    puffTone: 'cloudIvory',
    puffRadius: 148,
  },
  {
    yRatio: 0.925,
    amplitude: 20,
    speed: 32,
    waveFreq: 0.0044,
    waveCount: 9,
    color: '#F8F6F0',
    opacity: 0.86,
    puffTone: 'cloudIvory',
    puffRadius: 158,
  },
];

function createOffscreenSurface(size: number): OffscreenSurface | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    return new OffscreenCanvas(size, size);
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
  }
  return null;
}

function buildRadialSprite(
  size: number,
  stops: readonly (readonly [number, string])[],
): OffscreenSurface | null {
  const surface = createOffscreenSurface(size);
  if (!surface) return null;
  const ctx = surface.getContext('2d') as
    CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) return null;

  const half = size / 2;
  const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
  for (const [offset, color] of stops) {
    grad.addColorStop(offset, color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return surface;
}

function createStarAndCloudSpriteCache(): StarSpriteCache {
  return {
    ivory: buildRadialSprite(32, [
      [0, 'rgba(255, 253, 247, 1)'],
      [0.24, 'rgba(248, 246, 240, 0.72)'],
      [0.62, 'rgba(197, 211, 220, 0.22)'],
      [1, 'rgba(197, 211, 220, 0)'],
    ]),
    silver: buildRadialSprite(32, [
      [0, 'rgba(226, 240, 255, 0.98)'],
      [0.28, 'rgba(148, 179, 200, 0.62)'],
      [0.66, 'rgba(74, 107, 130, 0.18)'],
      [1, 'rgba(74, 107, 130, 0)'],
    ]),
    gold: buildRadialSprite(32, [
      [0, 'rgba(255, 248, 225, 1)'],
      [0.28, 'rgba(246, 211, 131, 0.68)'],
      [0.64, 'rgba(212, 163, 115, 0.22)'],
      [1, 'rgba(212, 163, 115, 0)'],
    ]),
    cloudIvory: buildRadialSprite(96, [
      [0, 'rgba(248, 246, 240, 0.75)'],
      [0.42, 'rgba(248, 246, 240, 0.42)'],
      [0.78, 'rgba(230, 226, 214, 0.14)'],
      [1, 'rgba(248, 246, 240, 0)'],
    ]),
    cloudMist: buildRadialSprite(96, [
      [0, 'rgba(230, 226, 214, 0.68)'],
      [0.45, 'rgba(230, 226, 214, 0.34)'],
      [0.8, 'rgba(197, 211, 220, 0.12)'],
      [1, 'rgba(230, 226, 214, 0)'],
    ]),
    cloudSlate: buildRadialSprite(96, [
      [0, 'rgba(197, 211, 220, 0.56)'],
      [0.45, 'rgba(197, 211, 220, 0.28)'],
      [0.82, 'rgba(74, 107, 130, 0.08)'],
      [1, 'rgba(197, 211, 220, 0)'],
    ]),
  };
}

function deterministicUnit(seed: number): number {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function createStarField(count: number): readonly StarMote[] {
  const stars: StarMote[] = [];
  for (let i = 0; i < count; i += 1) {
    const r1 = deterministicUnit(i + 1);
    const r2 = deterministicUnit(i * 3 + 7);
    const r3 = deterministicUnit(i * 5 + 19);
    const r4 = deterministicUnit(i * 7 + 31);
    const inMilkyWay = i < Math.floor(count * 0.68);

    let nx: number;
    let ny: number;
    if (inMilkyWay) {
      // Dải Ngân Hà kéo chéo từ góc trên trái (0.04, 0.04) xuống sau đỉnh núi bên phải (0.94, 0.49)
      const t = r1;
      const spread = (r2 + r3 - 1) * 0.145;
      nx = Math.min(Math.max(0.03 + t * 0.92 + spread * 0.28, 0.01), 0.99);
      ny = Math.min(Math.max(0.05 + t * 0.42 + spread, 0.02), 0.56);
    } else {
      nx = r1 * 0.98 + 0.01;
      ny = r2 * 0.56 + 0.02;
    }

    const tone: StarMote['tone'] = r4 > 0.8 ? 'gold' : r4 > 0.42 ? 'silver' : 'ivory';
    stars.push({
      nx,
      ny,
      size: inMilkyWay ? 2.2 + r3 * 4.4 : 2.6 + r3 * 5.6,
      baseAlpha: inMilkyWay ? 0.32 + r4 * 0.62 : 0.28 + r4 * 0.54,
      twinkleSpeed: 0.9 + r2 * 2.1,
      phase: r3 * Math.PI * 2,
      tone,
      inMilkyWay,
    });
  }
  return stars;
}

function createGeometricConstellations(): ConstellationSpec[] {
  return [
    {
      // 1. Tứ diện đều & Đường tròn ngoại tiếp
      id: 'tetrahedron-circumcircle',
      centerNx: 0.19,
      centerNy: 0.2,
      baseOpacity: 0.18,
      glow: 0,
      circumcircle: { cx: 0.19, cy: 0.2, rRatio: 0.068 },
      vertices: [
        { nx: 0.19, ny: 0.125 },
        { nx: 0.138, ny: 0.235 },
        { nx: 0.244, ny: 0.24 },
        { nx: 0.194, ny: 0.198 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
        [0, 3],
        [1, 3],
        [2, 3],
      ],
    },
    {
      // 2. Bát diện đều chiếu phẳng trên trục Ngân Hà
      id: 'octahedron-projection',
      centerNx: 0.48,
      centerNy: 0.16,
      baseOpacity: 0.18,
      glow: 0,
      circumcircle: { cx: 0.48, cy: 0.16, rRatio: 0.062 },
      vertices: [
        { nx: 0.48, ny: 0.088 },
        { nx: 0.432, ny: 0.158 },
        { nx: 0.528, ny: 0.162 },
        { nx: 0.48, ny: 0.232 },
        { nx: 0.464, ny: 0.142 },
        { nx: 0.496, ny: 0.178 },
      ],
      edges: [
        [0, 1],
        [0, 2],
        [3, 1],
        [3, 2],
        [1, 4],
        [4, 2],
        [2, 5],
        [5, 1],
        [0, 4],
        [0, 5],
        [3, 4],
        [3, 5],
      ],
    },
    {
      // 3. Tâm tỷ cự Affine & Tam giác nội tiếp đường tròn
      id: 'affine-circumcircle-triangle',
      centerNx: 0.72,
      centerNy: 0.22,
      baseOpacity: 0.18,
      glow: 0,
      circumcircle: { cx: 0.72, cy: 0.22, rRatio: 0.066 },
      vertices: [
        { nx: 0.72, ny: 0.145 },
        { nx: 0.666, ny: 0.262 },
        { nx: 0.778, ny: 0.256 },
        { nx: 0.721, ny: 0.221 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
        [0, 3],
        [1, 3],
        [2, 3],
      ],
    },
    {
      // 4. Ngũ giác đều vàng phía Đông Phan Xi Păng
      id: 'golden-pentagon-polyhedron',
      centerNx: 0.89,
      centerNy: 0.145,
      baseOpacity: 0.18,
      glow: 0,
      circumcircle: { cx: 0.89, cy: 0.145, rRatio: 0.056 },
      vertices: [
        { nx: 0.89, ny: 0.082 },
        { nx: 0.938, ny: 0.125 },
        { nx: 0.919, ny: 0.194 },
        { nx: 0.861, ny: 0.194 },
        { nx: 0.842, ny: 0.125 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
        [0, 2],
        [0, 3],
        [1, 4],
      ],
    },
  ];
}

function createValleyFireflies(count: number, width: number, height: number): ValleyFirefly[] {
  const list: ValleyFirefly[] = [];
  for (let i = 0; i < count; i += 1) {
    const r1 = deterministicUnit(i + 101);
    const r2 = deterministicUnit(i + 203);
    const r3 = deterministicUnit(i + 307);
    list.push({
      x: r1 * width,
      y: height * (0.58 + r2 * 0.3),
      vx: (r3 - 0.5) * 0.26,
      vy: -(0.14 + r2 * 0.24),
      radius: 2 + r3 * 2.5,
      alpha: 0.35 + r1 * 0.5,
      phase: r2 * Math.PI * 2,
    });
  }
  return list;
}

/**
 * Canvas 2D hiệu ứng liên tục 120fps (`dtScale`) cho Cảnh quan Biển Mây & Ngân Hà Hoàng Liên Sơn:
 * - Dải Ngân Hà kéo chéo góc trên trái ra sau đỉnh núi + hàng trăm đốm sáng lấp lánh (OffscreenCanvas cache)
 * - 4 Chòm sao Hình học Toán học (Đa diện đều & Đường tròn ngoại tiếp) sáng dịu theo vị trí chuột
 * - Sao băng định kỳ (4s–7s) với vệt sáng vàng trắng thanh mảnh
 * - 5 tầng Biển Mây cuộn trôi mượt (`#F8F6F0`, `#E6E2D6`, `#C5D3DC`), sương ấm bản làng & đom đóm thung lũng
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
    const spriteCache = createStarAndCloudSpriteCache();
    const stars = createStarField(260);
    const constellations = createGeometricConstellations();

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

    const fireflies = createValleyFireflies(28, width, height);
    const ripples: CloudRipple[] = [];

    const shootingStar: ShootingStar = {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      length: 120,
      life: 0,
      maxLife: 1.05,
    };
    // Kích hoạt sao băng đầu tiên sớm (~1.6s) rồi lặp ngẫu nhiên 4s–7s
    let nextMeteorCountdownSec = 1.6;

    const mouse = { x: -9999, y: -9999, active: false };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;
      mouse.x = nextX;
      mouse.y = nextY;
      mouse.active = nextX >= 0 && nextX <= width && nextY >= 0 && nextY <= height;

      if (mouse.active && nextY > height * 0.66 && Math.random() < 0.16 && ripples.length < 16) {
        ripples.push({
          x: nextX,
          y: nextY,
          radius: 8,
          maxRadius: 64,
          alpha: 0.24,
          speed: 0.9,
        });
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      if (clickX < 0 || clickX > width || clickY < 0 || clickY > height) return;
      if (ripples.length >= 20) ripples.shift();
      ripples.push({
        x: clickX,
        y: clickY,
        radius: 10,
        maxRadius: 96,
        alpha: 0.36,
        speed: 1.25,
      });
    };

    const drawMilkyWayBand = (tSec: number) => {
      ctx.save();
      ctx.translate(width * 0.46, height * 0.24);
      ctx.rotate(0.41);

      // Lõi Dải Ngân Hà mờ dịu lam ngọc - hồng hổ phách
      const coreGrad = ctx.createRadialGradient(0, 0, width * 0.04, 0, 0, width * 0.56);
      const pulse = 0.92 + Math.sin(tSec * 0.35) * 0.08;
      coreGrad.addColorStop(0, `rgba(148, 196, 236, ${(0.14 * pulse).toFixed(3)})`);
      coreGrad.addColorStop(0.38, `rgba(116, 162, 206, ${(0.09 * pulse).toFixed(3)})`);
      coreGrad.addColorStop(0.68, `rgba(212, 163, 115, ${(0.055 * pulse).toFixed(3)})`);
      coreGrad.addColorStop(1, 'rgba(11, 25, 44, 0)');

      ctx.scale(1.65, 0.34);
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, width * 0.56, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawStars = (tSec: number) => {
      for (const star of stars) {
        const sx = star.nx * width;
        const sy = star.ny * height;
        const twinkle = 0.55 + 0.45 * Math.sin(tSec * star.twinkleSpeed + star.phase);
        let alpha = star.baseAlpha * twinkle;

        if (mouse.active) {
          const dist = Math.hypot(mouse.x - sx, mouse.y - sy);
          if (dist < 130) {
            alpha = Math.min(1, alpha + (1 - dist / 130) * 0.35);
          }
        }

        const sprite = spriteCache[star.tone];
        const drawSize = star.size * 2.4;
        if (sprite) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, Math.max(0.08, alpha));
          ctx.drawImage(sprite, sx - drawSize / 2, sy - drawSize / 2, drawSize, drawSize);
          ctx.restore();
        } else {
          ctx.fillStyle = `rgba(248, 246, 240, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, star.size * 0.32, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const drawConstellations = (tSec: number, dtSeconds: number, animate: boolean) => {
      const refDim = Math.min(width, height * 1.45);
      const smooth = frameDampFactor(8, dtSeconds);

      for (const c of constellations) {
        const cx = c.centerNx * width;
        const cy = c.centerNy * height;
        let targetGlow = 0;

        if (animate && mouse.active) {
          const dist = Math.hypot(mouse.x - cx, mouse.y - cy);
          const triggerRadius = Math.max(150, refDim * 0.18);
          if (dist < triggerRadius) {
            targetGlow = 1 - dist / triggerRadius;
          }
        }
        c.glow = animate ? c.glow + (targetGlow - c.glow) * smooth : 0;

        const breath = 0.92 + Math.sin(tSec * 1.1 + c.centerNx * 10) * 0.08;
        const strokeAlpha = (c.baseOpacity + c.glow * 0.4) * breath;
        const circleAlpha = (0.11 + c.glow * 0.28) * breath;

        // Đường tròn ngoại tiếp đa diện
        if (c.circumcircle) {
          ctx.save();
          ctx.strokeStyle = `rgba(232, 200, 132, ${circleAlpha.toFixed(3)})`;
          ctx.lineWidth = 0.85 + c.glow * 0.6;
          ctx.setLineDash([4, 5]);
          ctx.beginPath();
          ctx.arc(
            c.circumcircle.cx * width,
            c.circumcircle.cy * height,
            c.circumcircle.rRatio * width,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
          ctx.restore();
        }

        // Các cạnh nối chòm sao hình học
        ctx.save();
        ctx.strokeStyle = `rgba(246, 211, 131, ${strokeAlpha.toFixed(3)})`;
        ctx.lineWidth = 0.95 + c.glow * 0.75;
        ctx.beginPath();
        for (const [i, j] of c.edges) {
          const v1 = c.vertices[i];
          const v2 = c.vertices[j];
          if (!v1 || !v2) continue;
          ctx.moveTo(v1.nx * width, v1.ny * height);
          ctx.lineTo(v2.nx * width, v2.ny * height);
        }
        ctx.stroke();
        ctx.restore();

        // Đỉnh sao chòm sao
        for (const v of c.vertices) {
          const vx = v.nx * width;
          const vy = v.ny * height;
          drawGlowSprite(
            ctx,
            glowSprites.gold,
            vx,
            vy,
            6 + c.glow * 6,
            Math.min(0.95, 0.36 + c.glow * 0.55),
            '#F6D383',
          );
        }
      }
    };

    const updateAndDrawShootingStar = (dtSeconds: number, dtScale: number, animate: boolean) => {
      if (!animate) return;

      if (!shootingStar.active) {
        nextMeteorCountdownSec -= dtSeconds;
        if (nextMeteorCountdownSec <= 0) {
          const startFromLeft = Math.random() > 0.35;
          shootingStar.active = true;
          shootingStar.x = startFromLeft
            ? width * (0.12 + Math.random() * 0.36)
            : width * (0.58 + Math.random() * 0.25);
          shootingStar.y = height * (0.04 + Math.random() * 0.14);
          shootingStar.vx = (startFromLeft ? 1 : -0.85) * (11.5 + Math.random() * 4.5);
          shootingStar.vy = 5.2 + Math.random() * 2.4;
          shootingStar.length = 115 + Math.random() * 65;
          shootingStar.life = 0;
          shootingStar.maxLife = 0.85 + Math.random() * 0.3;
          nextMeteorCountdownSec = 4 + Math.random() * 3;
        }
        return;
      }

      shootingStar.life += dtSeconds;
      shootingStar.x += shootingStar.vx * dtScale;
      shootingStar.y += shootingStar.vy * dtScale;

      const progress = shootingStar.life / shootingStar.maxLife;
      if (progress >= 1 || shootingStar.y > height * 0.58) {
        shootingStar.active = false;
        return;
      }

      const fadeAlpha = Math.sin(progress * Math.PI);
      const speedMag = Math.hypot(shootingStar.vx, shootingStar.vy) || 1;
      const tailX = shootingStar.x - (shootingStar.vx / speedMag) * shootingStar.length;
      const tailY = shootingStar.y - (shootingStar.vy / speedMag) * shootingStar.length;

      const tailGrad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
      tailGrad.addColorStop(0, 'rgba(246, 211, 131, 0)');
      tailGrad.addColorStop(0.55, `rgba(246, 211, 131, ${(0.38 * fadeAlpha).toFixed(3)})`);
      tailGrad.addColorStop(1, `rgba(255, 250, 232, ${(0.95 * fadeAlpha).toFixed(3)})`);

      ctx.save();
      ctx.strokeStyle = tailGrad;
      ctx.lineWidth = 2.1;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(shootingStar.x, shootingStar.y);
      ctx.stroke();
      ctx.restore();

      drawGlowSprite(
        ctx,
        glowSprites.gold,
        shootingStar.x,
        shootingStar.y,
        12,
        0.9 * fadeAlpha,
        '#FFF7DC',
      );
    };

    const drawVolumetricCloudSea = (tSec: number) => {
      for (let layerIdx = 0; layerIdx < CLOUD_LAYERS.length; layerIdx += 1) {
        const layer = CLOUD_LAYERS[layerIdx];
        if (!layer) continue;

        const baseY = height * layer.yRatio;
        const driftX = (tSec * layer.speed) % (width + 420);
        const puffSprite = spriteCache[layer.puffTone];

        // Dải sóng mây nền cuộn trôi liên tục
        ctx.save();
        ctx.beginPath();
        const step = 36;
        for (let x = -step; x <= width + step * 2; x += step) {
          const wave1 = Math.sin((x + driftX) * layer.waveFreq + layerIdx * 1.3) * layer.amplitude;
          const wave2 =
            Math.cos((x - driftX * 0.55) * (layer.waveFreq * 1.8) + layerIdx) *
            (layer.amplitude * 0.45);
          const cursorBoost =
            mouse.active && Math.abs(mouse.y - baseY) < 120
              ? Math.exp(-Math.pow((x - mouse.x) / 140, 2)) * Math.sin(tSec * 3.6 + x * 0.02) * 8
              : 0;
          const py = baseY + wave1 + wave2 + cursorBoost;
          if (x === -step) {
            ctx.moveTo(x, py);
          } else {
            ctx.lineTo(x, py);
          }
        }
        ctx.lineTo(width + step * 2, height + 24);
        ctx.lineTo(-step, height + 24);
        ctx.closePath();

        const bandGrad = ctx.createLinearGradient(0, baseY - layer.amplitude, 0, height);
        bandGrad.addColorStop(0, layer.color);
        bandGrad.addColorStop(1, layerIdx >= 3 ? '#F8F6F0' : '#E6E2D6');
        ctx.globalAlpha = layer.opacity;
        ctx.fillStyle = bandGrad;
        ctx.fill();
        ctx.restore();

        // Lớp cụm mây bồng bềnh OffscreenCanvas cache tại đỉnh sóng mây
        if (puffSprite) {
          const span = width + 320;
          const spacing = span / layer.waveCount;
          ctx.save();
          ctx.globalAlpha = layer.opacity * 0.78;
          for (let k = -1; k <= layer.waveCount + 1; k += 1) {
            const rawX = ((((k * spacing + driftX * 1.15) % span) + span) % span) - 160;
            const puffY =
              baseY + Math.sin(k * 1.45 + tSec * 0.4 + layerIdx) * (layer.amplitude * 0.65);
            const r = layer.puffRadius * (0.85 + 0.22 * Math.sin(k * 2.1 + layerIdx));
            ctx.drawImage(puffSprite, rawX - r, puffY - r * 0.58, r * 2, r * 1.16);
          }
          ctx.restore();
        }
      }
    };

    const drawValleyFirefliesAndRipples = (tSec: number, dtScale: number, animate: boolean) => {
      for (const ff of fireflies) {
        if (animate) {
          ff.x += (ff.vx + Math.sin(tSec * 0.9 + ff.phase) * 0.16) * dtScale;
          ff.y += ff.vy * dtScale;

          if (mouse.active) {
            const dx = ff.x - mouse.x;
            const dy = ff.y - mouse.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 1 && dist < 140) {
              const force = ((140 - dist) / 140) * 0.22 * dtScale;
              ff.x += (dx / dist) * force * 4.5;
              ff.y += (dy / dist) * force * 4.5;
            }
          }

          if (ff.y < height * 0.52) {
            ff.y = height * 0.88;
            ff.x = deterministicUnit(ff.phase * 100 + tSec) * width;
          }
          if (ff.x < -20) ff.x = width + 20;
          if (ff.x > width + 20) ff.x = -20;
        }

        const flicker = 0.45 + 0.55 * Math.sin(tSec * 2.3 + ff.phase);
        drawGlowSprite(
          ctx,
          glowSprites.firefly,
          ff.x,
          ff.y,
          ff.radius * 3.4,
          ff.alpha * flicker,
          '#F6D383',
        );
      }

      if (animate && ripples.length > 0) {
        const decay = Math.pow(0.955, dtScale);
        for (let i = ripples.length - 1; i >= 0; i -= 1) {
          const r = ripples[i];
          if (!r) continue;
          r.radius += r.speed * dtScale;
          r.alpha *= decay;
          if (r.radius >= r.maxRadius || r.alpha <= 0.012) {
            ripples.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.beginPath();
          ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.36, 0, 0, Math.PI * 2);
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = `rgba(248, 246, 240, ${r.alpha.toFixed(3)})`;
          ctx.stroke();
          ctx.restore();
        }
      }
    };

    const drawFrame = (nowMs: number, dtSeconds: number, dtScale: number, animate: boolean) => {
      const tSec = nowMs / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      drawMilkyWayBand(tSec);
      drawStars(tSec);
      drawConstellations(tSec, dtSeconds, animate);
      updateAndDrawShootingStar(dtSeconds, dtScale, animate);
      drawVolumetricCloudSea(tSec);
      drawValleyFirefliesAndRipples(tSec, dtScale, animate);
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
