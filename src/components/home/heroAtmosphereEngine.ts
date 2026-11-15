import { rgbaString, type AtmospherePalette } from '@/components/home/atmosphereThemes';
import {
  buildHeroTerrainGeometry,
  traceSmoothQuadraticCurve,
  type HeroTerrainGeometry,
  type HeroTerrainLayerCache,
  type TerrainSurface,
} from '@/components/home/heroTerrainBuilder';
import { drawGlowSprite, type GlowSpriteCache } from '@/shared/lib/canvasSprites';

export const PIPELINE_LAYER_NAMES = [
  '1_sky_nebula_and_cross_flare_stars',
  '2_dong_son_celestial_astrolabe',
  '3_sky_constellation_lens_and_compass',
  '4_five_layer_mist_mountains_and_contours',
  '5_interactive_topographic_lens_and_drum_pulse',
  '6_mist_mirror_lake_and_ascending_starlight',
] as const;

export interface StarMote {
  readonly nx: number;
  readonly ny: number;
  readonly baseRadius: number;
  readonly baseAlpha: number;
  readonly speed: number;
  readonly phase: number;
  readonly crossFlare: boolean;
  readonly flareLength: number;
}

/** Sóng Ngân Trống Đồng khi nhấp chuột (lan tỏa R(t): 0 -> 600px) */
export interface HarmonicContourPulse {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speedPxPerSec: number;
  alpha: number;
}

/** 25 hạt tinh tú vàng ấm bay từ mặt hồ sương khói lên bầu trời theo gió xoáy nhẹ */
export interface AscendingStarlight {
  nx: number;
  ny: number;
  vy: number;
  radius: number;
  swirlAmp: number;
  swirlFreq: number;
  phase: number;
  alpha: number;
}

/** Đường gợn sóng ngang siêu mảnh 0.5px trên mặt hồ sương khói (18% đáy) */
export interface MistMirrorRipple {
  readonly nx: number;
  readonly ny: number;
  readonly halfWidth: number;
  readonly speed: number;
  readonly phase: number;
  readonly alpha: number;
}

export interface AtmosphereMouseState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  normX: number;
  normY: number;
  active: boolean;
}

export interface TerrainLayerTransition {
  readonly prev: HeroTerrainLayerCache | null;
  readonly next: HeroTerrainLayerCache | null;
  readonly blend: number;
}

export interface AtmosphereSpriteCache {
  readonly warmStarSprite: TerrainSurface | null;
}

export interface AtmosphereWorld {
  readonly stars: readonly StarMote[];
  readonly pulses: HarmonicContourPulse[];
  pulseCursor: number;
  readonly ascendingStarlights: AscendingStarlight[];
  readonly mistRipples: readonly MistMirrorRipple[];
}

export interface RenderContextData {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  readonly tSec: number;
  readonly dtSeconds: number;
  readonly dtScale: number;
  readonly scrollProgress: number;
  readonly animate: boolean;
  readonly palette: AtmospherePalette;
  readonly sprites: AtmosphereSpriteCache;
  readonly glowSprites: GlowSpriteCache;
  readonly mouse: AtmosphereMouseState;
  readonly world: AtmosphereWorld;
  readonly terrainLayers?: TerrainLayerTransition;
}

function seededRandom(seed: number): number {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function makeSpriteSurface(size: number): TerrainSurface | null {
  if (size <= 0) return null;
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      return new OffscreenCanvas(size, size);
    } catch {
      // Fallback sang HTMLCanvasElement
    }
  }
  if (typeof document !== 'undefined') {
    const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
    if (isJsdom) return null;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    return canvas;
  }
  return null;
}

/** Tạo sprite hạt tinh tú vàng ấm cho chế độ 120fps zero-allocation */
export function buildAtmosphereSpriteCache(): AtmosphereSpriteCache {
  const size = 24;
  const surf = makeSpriteSurface(size);
  if (surf) {
    const ctx = surf.getContext('2d') as CanvasRenderingContext2D | null;
    if (ctx) {
      const half = size * 0.5;
      const grad = ctx.createRadialGradient(half, half, 0, half, half, half);
      grad.addColorStop(0, 'rgba(255, 245, 210, 0.95)');
      grad.addColorStop(0.28, 'rgba(229, 193, 118, 0.72)');
      grad.addColorStop(0.65, 'rgba(229, 193, 118, 0.16)');
      grad.addColorStop(1, 'rgba(229, 193, 118, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(half, half, half, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return { warmStarSprite: surf };
}

/** Khởi tạo thế giới tinh tú, sóng trống đồng & hạt ánh sáng trên mặt hồ sương khói */
export function createAtmosphereWorld(): AtmosphereWorld {
  const totalStars = 260;
  const stars: StarMote[] = [];

  // 15 ngôi sao sáng nhất có 4 tia khúc xạ chữ thập (r = 1.3px, dài 8px-14px)
  const crossFlareCount = 15;
  for (let i = 0; i < totalStars; i += 1) {
    const isFlare = i < crossFlareCount;
    stars.push({
      nx: 0.02 + seededRandom(i * 1.31 + 0.5) * 0.96,
      ny: 0.03 + seededRandom(i * 2.17 + 1.3) * 0.64,
      baseRadius: isFlare ? 1.3 : 0.45 + seededRandom(i * 3.73) * 0.85,
      baseAlpha: isFlare ? 0.92 : 0.25 + seededRandom(i * 4.91) * 0.52,
      speed: 0.8 + seededRandom(i * 5.47) * 1.8,
      phase: seededRandom(i * 6.83) * Math.PI * 2,
      crossFlare: isFlare,
      flareLength: isFlare ? 8 + seededRandom(i * 7.19) * 6 : 0,
    });
  }

  // Object Pool cố định 4 Sóng Ngân Trống Đồng
  const pulses: HarmonicContourPulse[] = Array.from({ length: 4 }, () => ({
    active: false,
    x: 0,
    y: 0,
    radius: 0,
    maxRadius: 600,
    speedPxPerSec: 320,
    alpha: 0,
  }));

  // Chính xác 25 hạt tinh tú vàng ấm (r = 1.5px) từ mặt hồ bay lên bầu trời theo gió xoáy nhẹ
  const ascendingStarlights: AscendingStarlight[] = Array.from({ length: 25 }, (_, i) => ({
    nx: 0.04 + seededRandom(i * 8.31 + 2.1) * 0.92,
    ny: 0.14 + seededRandom(i * 9.17 + 3.4) * 0.83,
    vy: 0.016 + seededRandom(i * 10.43) * 0.018,
    radius: 1.5,
    swirlAmp: 8 + seededRandom(i * 11.71) * 16,
    swirlFreq: 0.55 + seededRandom(i * 12.19) * 0.75,
    phase: seededRandom(i * 13.37) * Math.PI * 2,
    alpha: 0.45 + seededRandom(i * 14.53) * 0.42,
  }));

  // 20 đường gợn sóng ngang siêu mảnh 0.5px ở 18% đáy
  const mistRipples: MistMirrorRipple[] = Array.from({ length: 20 }, (_, i) => ({
    nx: 0.05 + seededRandom(i * 15.61 + 4.7) * 0.9,
    ny: 0.835 + (i / 20) * 0.135,
    halfWidth: 36 + seededRandom(i * 16.93) * 95,
    speed: 0.6 + seededRandom(i * 17.37) * 0.9,
    phase: seededRandom(i * 18.23) * Math.PI * 2,
    alpha: 0.08 + seededRandom(i * 19.11) * 0.12,
  }));

  return {
    stars,
    pulses,
    pulseCursor: 0,
    ascendingStarlights,
    mistRipples,
  };
}

/** Kích hoạt Sóng Ngân Trống Đồng tại (clickX, clickY), lan rộng R(t): 0 -> 600px */
export function spawnHarmonicContourPulse(
  world: AtmosphereWorld,
  x: number,
  y: number,
  maxRadius = 600,
): void {
  const pulse = world.pulses[world.pulseCursor % world.pulses.length];
  world.pulseCursor = (world.pulseCursor + 1) % world.pulses.length;
  if (!pulse) return;
  pulse.active = true;
  pulse.x = x;
  pulse.y = y;
  pulse.radius = 0;
  pulse.maxRadius = maxRadius;
  pulse.speedPxPerSec = 310;
  pulse.alpha = 0.85;
}

function drawBlendedOffscreenLayer(
  ctx: CanvasRenderingContext2D,
  prevSurface: TerrainSurface | null | undefined,
  nextSurface: TerrainSurface | null | undefined,
  blend: number,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  if (!nextSurface && !prevSurface) return;
  const clamped = Math.max(0, Math.min(1, blend));
  if (prevSurface && prevSurface !== nextSurface && clamped < 0.999) {
    ctx.save();
    ctx.globalAlpha = 1 - clamped;
    ctx.drawImage(prevSurface as CanvasImageSource, x, y, w, h);
    ctx.restore();
  }
  if (nextSurface) {
    ctx.save();
    ctx.globalAlpha = prevSurface && prevSurface !== nextSurface ? clamped : 1;
    ctx.drawImage(nextSurface as CanvasImageSource, x, y, w, h);
    ctx.restore();
  }
}

function drawCrossFlareStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  flareLen: number,
  alpha: number,
): void {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Tia khúc xạ ngang (mờ dần ra hai đầu)
  const hGrad = ctx.createLinearGradient(x - flareLen, y, x + flareLen, y);
  hGrad.addColorStop(0, 'rgba(255, 253, 247, 0)');
  hGrad.addColorStop(0.5, 'rgba(255, 253, 247, 0.92)');
  hGrad.addColorStop(1, 'rgba(255, 253, 247, 0)');
  ctx.strokeStyle = hGrad;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(x - flareLen, y);
  ctx.lineTo(x + flareLen, y);
  ctx.stroke();

  // Tia khúc xạ dọc (mờ dần ra hai đầu)
  const vGrad = ctx.createLinearGradient(x, y - flareLen, x, y + flareLen);
  vGrad.addColorStop(0, 'rgba(255, 253, 247, 0)');
  vGrad.addColorStop(0.5, 'rgba(255, 253, 247, 0.92)');
  vGrad.addColorStop(1, 'rgba(255, 253, 247, 0)');
  ctx.strokeStyle = vGrad;
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(x, y - flareLen);
  ctx.lineTo(x, y + flareLen);
  ctx.stroke();

  // Tâm sao r = 1.3px, #FFFDF7
  ctx.fillStyle = '#FFFDF7';
  ctx.beginPath();
  ctx.arc(x, y, 1.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawDongSonAstrolabe(
  ctx: CanvasRenderingContext2D,
  geometry: HeroTerrainGeometry,
  terrainLayers: TerrainLayerTransition | undefined,
  activePulses: readonly HarmonicContourPulse[],
  tSec: number,
  parallaxX: number,
  parallaxY: number,
): void {
  const { astrolabe } = geometry;
  const cx = astrolabe.cx + parallaxX;
  const cy = astrolabe.cy + parallaxY;

  // 1. 2 cung quỹ đạo elip lớn cắt chéo qua bầu trời & các điểm nút hoàng đạo
  ctx.save();
  for (const arc of astrolabe.eclipticArcs) {
    ctx.save();
    ctx.translate(arc.cx + parallaxX, arc.cy + parallaxY);
    ctx.rotate(arc.rotationRad);
    ctx.beginPath();
    ctx.ellipse(0, 0, arc.rx, arc.ry, 0, 0, Math.PI * 2);
    ctx.lineWidth = 0.65;
    ctx.strokeStyle = 'rgba(229, 193, 118, 0.14)';
    ctx.stroke();
    ctx.restore();

    for (const node of arc.nodes) {
      const nx = node.x + parallaxX;
      const ny = node.y + parallaxY;
      ctx.beginPath();
      ctx.arc(nx, ny, 2.1, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(229, 193, 118, 0.28)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(nx, ny, 4.5, 0, Math.PI * 2);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(229, 193, 118, 0.16)';
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. Ngôi sao Đông Sơn 14 cánh mảnh ở tâm (xoay cực chậm)
  const nextCache = terrainLayers?.next;
  const spriteSize = nextCache?.astrolabeRingSpriteSize ?? 460;
  const starSurf = nextCache?.astrolabeStarSprite;

  if (starSurf) {
    const sw = (astrolabe.starOuterRadius + 14) * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tSec * 0.015);
    ctx.drawImage(starSurf as CanvasImageSource, -sw * 0.5, -sw * 0.5, sw, sw);
    ctx.restore();
  } else {
    // Fallback vector mảnh khi chưa có sprite cache (hoặc trong unit test không có OffscreenCanvas)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tSec * 0.015);
    ctx.beginPath();
    const totalPts = astrolabe.starRays * 2;
    for (let i = 0; i <= totalPts; i += 1) {
      const angle = (i * Math.PI) / astrolabe.starRays - Math.PI / 2;
      const r = i % 2 === 0 ? astrolabe.starOuterRadius : astrolabe.starInnerRadius;
      if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
      else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
    }
    ctx.closePath();
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = 'rgba(229, 193, 118, 0.22)';
    ctx.stroke();
    ctx.restore();
  }

  // 3. 4 vòng tròn đồng tâm khắc vạch chia độ xoay ngược chiều nhau cực chậm (~0.04 rad/s)
  for (let idx = 0; idx < astrolabe.rings.length; idx += 1) {
    const ring = astrolabe.rings[idx]!;
    const angle = tSec * ring.angularSpeedRadSec;
    const ringSurf = nextCache?.astrolabeRingSprites[idx];

    if (ringSurf) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.drawImage(
        ringSurf as CanvasImageSource,
        -spriteSize * 0.5,
        -spriteSize * 0.5,
        spriteSize,
        spriteSize,
      );
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
      ctx.lineWidth = ring.lineWidth;
      ctx.strokeStyle = 'rgba(229, 193, 118, 0.18)';
      ctx.stroke();
      ctx.restore();
    }

    // Phản hồi ngân vang khi Sóng Trống Đồng R(t) giao thoa qua bán kính vòng thiên cầu
    for (const pulse of activePulses) {
      const distCenter = Math.hypot(pulse.x - cx, pulse.y - cy);
      const intersectsRing =
        pulse.radius >= Math.abs(distCenter - ring.radius) - 24 &&
        pulse.radius <= distCenter + ring.radius + 24;
      if (!intersectsRing) continue;

      const fade = Math.max(0, 1 - pulse.radius / pulse.maxRadius);
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, ring.radius, 0, Math.PI * 2);
      ctx.lineWidth = 1.15;
      ctx.strokeStyle = `rgba(235, 195, 110, ${(0.34 * fade).toFixed(3)})`;
      ctx.stroke();
      ctx.restore();
    }
  }
}

function drawSkyConstellationLens(
  ctx: CanvasRenderingContext2D,
  stars: readonly StarMote[],
  mouse: AtmosphereMouseState,
  width: number,
  height: number,
  tSec: number,
): void {
  if (!mouse.active) return;

  const lensRadius = 160;
  const maxLinkDist = 132;
  const starParallaxX = -mouse.normX * 7;
  const starParallaxY = -mouse.normY * 4;

  // Thu thập các sao nằm trong bán kính 160px quanh con trỏ
  const nearby: { x: number; y: number; dist: number }[] = [];
  for (const star of stars) {
    const sx = star.nx * width + starParallaxX;
    const sy = star.ny * height + starParallaxY;
    const dx = sx - mouse.x;
    const dy = sy - mouse.y;
    const d2 = dx * dx + dy * dy;
    if (d2 <= lensRadius * lensRadius) {
      nearby.push({ x: sx, y: sy, dist: Math.sqrt(d2) });
    }
  }

  // Nối mạng lưới tam giác hình học mảnh (0.6px, rgba(180, 225, 255, alpha))
  if (nearby.length >= 2) {
    ctx.save();
    ctx.lineWidth = 0.6;
    for (let i = 0; i < nearby.length; i += 1) {
      const a = nearby[i]!;
      let connections = 0;
      for (let j = i + 1; j < nearby.length && connections < 4; j += 1) {
        const b = nearby[j]!;
        const pairDist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pairDist <= maxLinkDist) {
          const avgLensFade = 1 - ((a.dist + b.dist) * 0.5) / lensRadius;
          const distFade = 1 - pairDist / maxLinkDist;
          const alpha = Math.max(0.06, Math.min(0.42, avgLensFade * distFade * 0.55));
          ctx.strokeStyle = `rgba(180, 225, 255, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          connections += 1;
        }
      }
    }

    // Điểm nút sao được chiếu sáng nhẹ trong chòm sao
    for (const pt of nearby) {
      const alpha = 0.35 + (1 - pt.dist / lensRadius) * 0.45;
      ctx.fillStyle = `rgba(220, 240, 255, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Vòng la bàn nhỏ tinh tế đi theo con trỏ khi ở vùng bầu trời
  if (mouse.y < height * 0.72) {
    ctx.save();
    ctx.translate(mouse.x, mouse.y);

    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.lineWidth = 0.6;
    ctx.strokeStyle = 'rgba(180, 225, 255, 0.28)';
    ctx.stroke();

    ctx.rotate(tSec * 0.25);
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(0, 0, 28, 0, Math.PI * 2);
    ctx.lineWidth = 0.55;
    ctx.strokeStyle = 'rgba(229, 193, 118, 0.24)';
    ctx.stroke();
    ctx.setLineDash([]);

    // 4 kim chữ thập trắc địa ngắn
    for (let k = 0; k < 4; k += 1) {
      const ang = (k * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 14, Math.sin(ang) * 14);
      ctx.lineTo(Math.cos(ang) * 21, Math.sin(ang) * 21);
      ctx.lineWidth = 0.65;
      ctx.strokeStyle = 'rgba(229, 193, 118, 0.34)';
      ctx.stroke();
    }

    ctx.restore();
  }
}

function drawInteractiveMountainContours(
  ctx: CanvasRenderingContext2D,
  geometry: HeroTerrainGeometry,
  mouse: AtmosphereMouseState,
  activePulses: readonly HarmonicContourPulse[],
  tSec: number,
): void {
  const lensRadius = 200;
  const hasPulses = activePulses.length > 0;
  if (!mouse.active && !hasPulses) return;

  const pulseBand = 48;

  for (const contour of geometry.contours) {
    const nearMouseY =
      mouse.active && mouse.y >= contour.minY - lensRadius && mouse.y <= contour.maxY + lensRadius;
    const nearPulseY =
      hasPulses &&
      activePulses.some(
        (p) =>
          p.y >= contour.minY - p.radius - pulseBand && p.y <= contour.maxY + p.radius + pulseBand,
      );

    if (!nearMouseY && !nearPulseY) continue;

    // Tính đoạn đồng mức được chiếu sáng & dao động đàn hồi quanh thấu kính chuột / sóng trống đồng
    let activeSpan: { x: number; y: number }[] = [];
    let spanPeakStrength = 0;
    let spanHasPulse = false;

    const flushSpan = () => {
      if (activeSpan.length < 2) {
        activeSpan = [];
        spanPeakStrength = 0;
        spanHasPulse = false;
        return;
      }

      const alpha = Math.min(0.68, spanPeakStrength * (spanHasPulse ? 0.65 : 0.55));
      ctx.save();
      ctx.beginPath();
      traceSmoothQuadraticCurve(ctx, activeSpan, true);
      ctx.lineWidth = spanHasPulse ? 1.25 : 1.1;
      ctx.strokeStyle = `rgba(235, 195, 110, ${alpha.toFixed(3)})`;
      ctx.stroke();
      ctx.restore();

      activeSpan = [];
      spanPeakStrength = 0;
      spanHasPulse = false;
    };

    for (const pt of contour.points) {
      let glowStrength = 0;
      let yDisplace = 0;
      let hitPulse = false;

      if (nearMouseY) {
        const dxM = pt.x - mouse.x;
        const dyM = pt.y - mouse.y;
        const distM = Math.hypot(dxM, dyM);
        if (distM < lensRadius) {
          const falloff = 1 - distM / lensRadius;
          const lensStrength = falloff * falloff;
          glowStrength = Math.max(glowStrength, lensStrength);
          yDisplace += Math.sin(pt.x * 0.032 - tSec * 3.0) * 2.8 * lensStrength;
        }
      }

      if (nearPulseY) {
        for (const pulse of activePulses) {
          const distP = Math.hypot(pt.x - pulse.x, pt.y - pulse.y);
          const diff = distP - pulse.radius;
          if (Math.abs(diff) <= pulseBand) {
            const fade = Math.max(0, 1 - pulse.radius / pulse.maxRadius);
            const ringBell = Math.exp(-(diff * diff) / (pulseBand * pulseBand * 0.25)) * fade;
            glowStrength = Math.max(glowStrength, ringBell * 1.15);
            yDisplace += Math.sin(diff * 0.16) * 4.8 * ringBell;
            hitPulse = true;
          }
        }
      }

      if (glowStrength > 0.04) {
        activeSpan.push({ x: pt.x, y: pt.y + yDisplace });
        if (glowStrength > spanPeakStrength) spanPeakStrength = glowStrength;
        if (hitPulse) spanHasPulse = true;
      } else {
        flushSpan();
      }
    }
    flushSpan();
  }
}

function drawHarmonicPulseRings(
  ctx: CanvasRenderingContext2D,
  activePulses: readonly HarmonicContourPulse[],
): void {
  if (activePulses.length === 0) return;

  for (const pulse of activePulses) {
    const progress = pulse.radius / Math.max(pulse.maxRadius, 1);
    const fade = Math.max(0, (1 - progress) * pulse.alpha);

    ctx.save();
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = `rgba(229, 193, 118, ${(fade * 0.36).toFixed(3)})`;
    ctx.stroke();

    if (pulse.radius > 28) {
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius - 22, 0, Math.PI * 2);
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = `rgba(180, 225, 255, ${(fade * 0.22).toFixed(3)})`;
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawMistMirrorLakeAndStarlight(
  ctx: CanvasRenderingContext2D,
  world: AtmosphereWorld,
  palette: AtmospherePalette,
  sprites: AtmosphereSpriteCache,
  glowSprites: GlowSpriteCache,
  width: number,
  height: number,
  tSec: number,
  dtScale: number,
  animate: boolean,
): void {
  const lakeTop = height * 0.82;
  const lakeH = height - lakeTop;

  // Mặt hồ sương khói phẳng lặng ở 18% đáy màn hình nối êm xuống #121B28
  const lakeGrad = ctx.createLinearGradient(0, lakeTop - 12, 0, height);
  lakeGrad.addColorStop(0, rgbaString(palette.bottomMistDeep, 0));
  lakeGrad.addColorStop(0.28, rgbaString(palette.bottomMistDeep, 0.72));
  lakeGrad.addColorStop(0.75, 'rgba(18, 27, 40, 0.94)');
  lakeGrad.addColorStop(1, '#121B28');
  ctx.fillStyle = lakeGrad;
  ctx.fillRect(0, lakeTop - 12, width, lakeH + 12);

  // Đường gợn sóng ngang siêu mảnh (0.5px)
  ctx.save();
  ctx.lineWidth = 0.5;
  for (const r of world.mistRipples) {
    const cx = r.nx * width + Math.sin(tSec * r.speed + r.phase) * 18;
    const cy = r.ny * height;
    const w = r.halfWidth;
    const shimmer = 0.55 + 0.45 * Math.sin(tSec * (r.speed * 1.4) + r.phase);
    const grad = ctx.createLinearGradient(cx - w, cy, cx + w, cy);
    grad.addColorStop(0, 'rgba(180, 225, 255, 0)');
    grad.addColorStop(0.5, `rgba(218, 232, 244, ${(r.alpha * shimmer).toFixed(3)})`);
    grad.addColorStop(1, 'rgba(180, 225, 255, 0)');
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - w, cy);
    ctx.lineTo(cx + w, cy);
    ctx.stroke();
  }
  ctx.restore();

  // 25 hạt tinh tú vàng ấm (r = 1.5px) bay từ mặt nước lên bầu trời theo gió xoáy nhẹ
  for (const mote of world.ascendingStarlights) {
    if (animate) {
      mote.ny -= (mote.vy * dtScale) / 60;
      if (mote.ny < 0.06) {
        mote.ny = 0.85 + (mote.ny % 0.12) + 0.12;
        if (mote.ny > 0.98) mote.ny = 0.92;
      }
    }

    const swirlOffsetX = Math.sin(tSec * mote.swirlFreq + mote.phase) * mote.swirlAmp;
    const sx = (mote.nx * width + swirlOffsetX + width) % width;
    const sy = mote.ny * height;

    const fadeBottom = Math.min(1, (0.98 - mote.ny) / 0.1);
    const fadeTop = Math.min(1, (mote.ny - 0.06) / 0.18);
    const alpha = Math.max(0.08, mote.alpha * fadeBottom * fadeTop);

    if (sprites.warmStarSprite) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprites.warmStarSprite as CanvasImageSource, sx - 6, sy - 6, 12, 12);
      ctx.restore();
    } else {
      drawGlowSprite(ctx, glowSprites.gold, sx, sy, 6, alpha, 'rgba(255, 224, 148, 0.85)');
    }

    ctx.fillStyle = `rgba(255, 236, 178, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, mote.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Kết xuất toàn bộ khung hình Sơn Thủy Trắc Địa Đại Việt & Thiên Cầu Đông Sơn 120fps (< 3ms/frame) */
export function renderAtmosphereFrame(data: RenderContextData): void {
  const {
    ctx,
    width,
    height,
    tSec,
    dtSeconds,
    dtScale,
    scrollProgress,
    animate,
    palette,
    sprites,
    glowSprites,
    mouse,
    world,
    terrainLayers,
  } = data;

  ctx.clearRect(0, 0, width, height);

  const activeGeometry: HeroTerrainGeometry =
    terrainLayers?.next?.geometry ?? buildHeroTerrainGeometry(width, height);

  // Cập nhật các Sóng Ngân Trống Đồng
  if (animate) {
    for (const pulse of world.pulses) {
      if (!pulse.active) continue;
      pulse.radius += pulse.speedPxPerSec * dtSeconds;
      if (pulse.radius >= pulse.maxRadius) {
        pulse.active = false;
      }
    }
  }
  const activePulses = world.pulses.filter((p) => p.active);

  const nebulaParallaxX = -mouse.normX * 10;
  const nebulaParallaxY = -mouse.normY * 6 - scrollProgress * 18;
  const astrolabeParallaxX = -mouse.normX * 14;
  const astrolabeParallaxY = -mouse.normY * 8 - scrollProgress * 22;
  const mountainParallaxX = -mouse.normX * 18;
  const mountainParallaxY = -mouse.normY * 6 - scrollProgress * 12;

  // LỚP 1: Dải Tinh Vân mềm (pre-rendered radialGradient halos) & Các Vì Sao + 15 Sao Khúc Xạ Chữ Thập
  if (terrainLayers?.next?.nebulaLayer || terrainLayers?.prev?.nebulaLayer) {
    drawBlendedOffscreenLayer(
      ctx,
      terrainLayers.prev?.nebulaLayer,
      terrainLayers.next?.nebulaLayer,
      terrainLayers.blend,
      nebulaParallaxX,
      nebulaParallaxY,
      width,
      height,
    );
  }

  for (const star of world.stars) {
    const sx = star.nx * width - mouse.normX * 7;
    const sy = star.ny * height - mouse.normY * 4;
    const twinkle = 0.62 + 0.38 * Math.sin(tSec * star.speed + star.phase);
    const alpha = Math.max(0.08, star.baseAlpha * twinkle * (0.45 + 0.55 * palette.starIntensity));

    if (star.crossFlare) {
      drawCrossFlareStar(ctx, sx, sy, star.flareLength, alpha);
    } else {
      ctx.fillStyle = `rgba(255, 253, 247, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, star.baseRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // LỚP 2: Đài Thiên Cầu Mặt Trời Đông Sơn (72% x 30%, 14 cánh, 4 vòng chia độ quay 0.04 rad/s)
  drawDongSonAstrolabe(
    ctx,
    activeGeometry,
    terrainLayers,
    activePulses,
    tSec,
    astrolabeParallaxX,
    astrolabeParallaxY,
  );

  // LỚP 3: Thấu Kính Chòm Sao Tam Giác & La Bàn Trỏ Chuột trên Bầu Trời (160px)
  drawSkyConstellationLens(ctx, world.stars, mouse, width, height, tSec);

  // LỚP 4: 5 Tầng Núi Sương Mù Khí Quyển & 21 Đường Đồng Mức Ruộng Bậc Thang (OffscreenCanvas)
  ctx.save();
  ctx.translate(mountainParallaxX, mountainParallaxY);
  if (
    terrainLayers?.next?.mountainTopographyLayer ||
    terrainLayers?.prev?.mountainTopographyLayer
  ) {
    drawBlendedOffscreenLayer(
      ctx,
      terrainLayers.prev?.mountainTopographyLayer,
      terrainLayers.next?.mountainTopographyLayer,
      terrainLayers.blend,
      0,
      0,
      width,
      height,
    );
  }

  // LỚP 5: Thấu Kính Trắc Địa (200px) & Sóng Ngân Trống Đồng (0 -> 600px)
  const localMouse: AtmosphereMouseState = {
    ...mouse,
    x: mouse.x - mountainParallaxX,
    y: mouse.y - mountainParallaxY,
  };
  const localPulses = activePulses.map((p) => ({
    ...p,
    x: p.x - mountainParallaxX,
    y: p.y - mountainParallaxY,
  }));
  drawInteractiveMountainContours(ctx, activeGeometry, localMouse, localPulses, tSec);
  ctx.restore();

  drawHarmonicPulseRings(ctx, activePulses);

  // LỚP 6: Mặt Hồ Sương Khói (18% đáy) & 25 Hạt Tinh Tú Vàng Ấm Bay Lên
  drawMistMirrorLakeAndStarlight(
    ctx,
    world,
    palette,
    sprites,
    glowSprites,
    width,
    height,
    tSec,
    dtScale,
    animate,
  );
}
