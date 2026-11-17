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

export interface ConstellationVertex {
  readonly nx: number;
  readonly ny: number;
}

/** Chòm sao hình học toán học (Scorpion, Đa diện Platon, Lưới cầu, Tam giác đồng dạng, Ngũ giác vàng) */
export interface MathematicalConstellation {
  readonly id: string;
  readonly name: string;
  readonly centerNx: number;
  readonly centerNy: number;
  readonly vertices: readonly ConstellationVertex[];
  readonly edges: readonly (readonly [number, number])[];
}

/** Vệt sao băng định kỳ 5s-9s với đầu trắng bạc #FFFDF7 và đuôi mờ dần */
export interface ShootingStar {
  active: boolean;
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  lengthPx: number;
  ageSec: number;
  durationSec: number;
}

/** Hạt bụi sao 3D có độ sâu z khác nhau chuyển động theo quỹ đạo elip nhẹ quanh tâm thiên thể */
export interface Stardust3DMote {
  readonly orbitRx: number;
  readonly orbitRy: number;
  readonly tilt: number;
  readonly zDepth: number;
  readonly speed: number;
  readonly phase: number;
  readonly radius: number;
  readonly alpha: number;
  readonly warm: boolean;
}

export interface Vec3Spec {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

/** Khối Đa Diện Tinh Tú 3D xoay chậm trên bầu trời */
export interface PolyhedralConstellation3D {
  readonly id: string;
  readonly name: string;
  readonly anchorNx: number;
  readonly anchorNy: number;
  readonly scalePx: number;
  readonly rotSpeedX: number;
  readonly rotSpeedY: number;
  readonly rotSpeedZ: number;
  readonly phase: number;
  readonly vertices: readonly Vec3Spec[];
  readonly edges: readonly (readonly [number, number])[];
  readonly faces: readonly (readonly number[])[];
}

export interface AtmosphereWorld {
  readonly stars: readonly StarMote[];
  readonly constellations: readonly MathematicalConstellation[];
  readonly polyhedralConstellations3D: readonly PolyhedralConstellation3D[];
  readonly shootingStars: ShootingStar[];
  nextShootingStarInSec: number;
  shootingStarCursor: number;
  readonly stardust3D: readonly Stardust3DMote[];
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
  const totalStars = 280;
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

  // 24 vệt gợn sóng ngang lấp lánh trên Dòng Suối / Mặt Hồ Sương Khói (x: 0.35W -> 0.68W, y: 0.76H -> 0.98H)
  const mistRipples: MistMirrorRipple[] = Array.from({ length: 24 }, (_, i) => ({
    nx: 0.37 + seededRandom(i * 15.61 + 4.7) * 0.28,
    ny: 0.77 + (i / 24) * 0.195,
    halfWidth: 26 + seededRandom(i * 16.93) * 62,
    speed: 0.65 + seededRandom(i * 17.37) * 0.95,
    phase: seededRandom(i * 18.23) * Math.PI * 2,
    alpha: 0.16 + seededRandom(i * 19.11) * 0.24,
  }));

  // 5 Chòm sao Hình học Toán học (Scorpion, Đa diện Platon, Tam giác đồng dạng, Lưới tọa độ cầu, Ngũ giác tỷ lệ vàng)
  const constellations: MathematicalConstellation[] = [
    {
      id: 'scorpion',
      name: 'Chòm sao Bọ Cạp (Scorpion)',
      centerNx: 0.2,
      centerNy: 0.25,
      vertices: [
        { nx: 0.145, ny: 0.165 },
        { nx: 0.17, ny: 0.195 },
        { nx: 0.155, ny: 0.225 },
        { nx: 0.195, ny: 0.23 }, // Antares
        { nx: 0.225, ny: 0.27 },
        { nx: 0.245, ny: 0.315 },
        { nx: 0.23, ny: 0.355 },
        { nx: 0.198, ny: 0.365 },
        { nx: 0.184, ny: 0.342 },
      ],
      edges: [
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 7],
        [7, 8],
        [1, 2],
      ],
    },
    {
      id: 'platonic-octahedron',
      name: 'Khối Đa diện Platon',
      centerNx: 0.43,
      centerNy: 0.18,
      vertices: [
        { nx: 0.43, ny: 0.095 },
        { nx: 0.382, ny: 0.175 },
        { nx: 0.478, ny: 0.175 },
        { nx: 0.43, ny: 0.265 },
        { nx: 0.415, ny: 0.148 },
        { nx: 0.448, ny: 0.212 },
      ],
      edges: [
        [0, 1],
        [0, 2],
        [1, 3],
        [2, 3],
        [1, 2],
        [0, 4],
        [4, 1],
        [4, 2],
        [4, 5],
        [5, 3],
        [5, 1],
        [5, 2],
      ],
    },
    {
      id: 'similar-triangles',
      name: 'Tam giác Đồng dạng Euclid',
      centerNx: 0.57,
      centerNy: 0.13,
      vertices: [
        { nx: 0.53, ny: 0.085 },
        { nx: 0.618, ny: 0.098 },
        { nx: 0.562, ny: 0.195 },
        { nx: 0.574, ny: 0.091 },
        { nx: 0.546, ny: 0.14 },
        { nx: 0.59, ny: 0.146 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 0],
        [3, 4],
        [4, 5],
        [5, 3],
      ],
    },
    {
      id: 'spherical-grid',
      name: 'Lưới Tọa độ Cầu Trắc địa',
      centerNx: 0.88,
      centerNy: 0.17,
      vertices: [
        { nx: 0.88, ny: 0.095 },
        { nx: 0.835, ny: 0.135 },
        { nx: 0.88, ny: 0.145 },
        { nx: 0.925, ny: 0.135 },
        { nx: 0.825, ny: 0.19 },
        { nx: 0.88, ny: 0.2 },
        { nx: 0.935, ny: 0.19 },
        { nx: 0.88, ny: 0.255 },
      ],
      edges: [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [2, 3],
        [1, 4],
        [2, 5],
        [3, 6],
        [4, 5],
        [5, 6],
        [4, 7],
        [5, 7],
        [6, 7],
      ],
    },
    {
      id: 'golden-pentagon',
      name: 'Ngũ giác Tỷ lệ Vàng',
      centerNx: 0.31,
      centerNy: 0.33,
      vertices: [
        { nx: 0.31, ny: 0.275 },
        { nx: 0.348, ny: 0.312 },
        { nx: 0.334, ny: 0.368 },
        { nx: 0.286, ny: 0.368 },
        { nx: 0.272, ny: 0.312 },
      ],
      edges: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
        [0, 2],
        [2, 4],
        [4, 1],
        [1, 3],
        [3, 0],
      ],
    },
  ];

  // Object Pool cố định 2 Vệt Sao Băng (chu kỳ 5s - 9s)
  const shootingStars: ShootingStar[] = Array.from({ length: 2 }, () => ({
    active: false,
    nx: 0,
    ny: 0,
    vx: 0,
    vy: 0,
    lengthPx: 140,
    ageSec: 0,
    durationSec: 0.7,
  }));

  // Nhân đôi trường hạt bụi sao 3D (56 hạt) chuyển động theo quỹ đạo elip nhẹ quanh tâm thiên thể
  const stardust3D: Stardust3DMote[] = Array.from({ length: 56 }, (_, i) => {
    const zDepth = 0.2 + seededRandom(i * 21.13 + 1.1) * 0.8;
    return {
      orbitRx: 0.12 + seededRandom(i * 22.37 + 2.4) * 0.56,
      orbitRy: 0.06 + seededRandom(i * 23.71 + 3.8) * 0.24,
      tilt: (seededRandom(i * 24.43) - 0.5) * 0.72,
      zDepth,
      speed: (0.015 + seededRandom(i * 25.19) * 0.032) * (0.55 + zDepth * 0.55),
      phase: seededRandom(i * 26.83) * Math.PI * 2,
      radius: 0.65 + zDepth * 1.25,
      alpha: 0.18 + zDepth * 0.46,
      warm: i % 3 !== 0,
    };
  });

  // 3 Khối Đa Diện Tinh Tú 3D xoay chậm chiếu phối cảnh thật
  const polyhedralConstellations3D: PolyhedralConstellation3D[] = [
    {
      id: 'poly-octahedron-west',
      name: 'Bát diện Tinh Tú',
      anchorNx: 0.16,
      anchorNy: 0.18,
      scalePx: 46,
      rotSpeedX: 0.08,
      rotSpeedY: 0.13,
      rotSpeedZ: 0.05,
      phase: 0.4,
      vertices: [
        { x: 0, y: 1.05, z: 0 },
        { x: 0, y: -1.05, z: 0 },
        { x: 0.95, y: 0, z: 0 },
        { x: -0.95, y: 0, z: 0 },
        { x: 0, y: 0, z: 0.95 },
        { x: 0, y: 0, z: -0.95 },
      ],
      edges: [
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 4],
        [4, 3],
        [3, 5],
        [5, 2],
      ],
      faces: [
        [0, 4, 2],
        [0, 2, 5],
        [0, 5, 3],
        [0, 3, 4],
        [1, 2, 4],
        [1, 5, 2],
        [1, 3, 5],
        [1, 4, 3],
      ],
    },
    {
      id: 'poly-tetrahedron-zenith',
      name: 'Tứ diện Nhật Nguyệt',
      anchorNx: 0.41,
      anchorNy: 0.15,
      scalePx: 44,
      rotSpeedX: -0.07,
      rotSpeedY: 0.11,
      rotSpeedZ: 0.06,
      phase: 1.9,
      vertices: [
        { x: 0, y: -1.0, z: 0 },
        { x: 0.94, y: 0.35, z: 0.45 },
        { x: -0.94, y: 0.35, z: 0.45 },
        { x: 0, y: 0.35, z: -0.98 },
      ],
      edges: [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [2, 3],
        [3, 1],
      ],
      faces: [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 1],
        [1, 3, 2],
      ],
    },
    {
      id: 'poly-pentagonal-east',
      name: 'Song chóp Ngũ giác Đông Sơn',
      anchorNx: 0.89,
      anchorNy: 0.17,
      scalePx: 42,
      rotSpeedX: 0.06,
      rotSpeedY: -0.1,
      rotSpeedZ: 0.07,
      phase: 3.1,
      vertices: [
        { x: 0, y: -1.12, z: 0 },
        { x: 0, y: 1.12, z: 0 },
        ...Array.from({ length: 5 }, (_, k) => {
          const ang = (k / 5) * Math.PI * 2;
          return { x: Math.cos(ang) * 0.92, y: 0, z: Math.sin(ang) * 0.92 };
        }),
      ],
      edges: [
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 6],
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [1, 6],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 6],
        [6, 2],
      ],
      faces: [
        [0, 2, 3],
        [0, 3, 4],
        [0, 4, 5],
        [0, 5, 6],
        [0, 6, 2],
        [1, 3, 2],
        [1, 4, 3],
        [1, 5, 4],
        [1, 6, 5],
        [1, 2, 6],
      ],
    },
  ];

  return {
    stars,
    constellations,
    polyhedralConstellations3D,
    shootingStars,
    nextShootingStarInSec: 5.5,
    shootingStarCursor: 0,
    stardust3D,
    pulses,
    pulseCursor: 0,
    ascendingStarlights,
    mistRipples,
  };
}

/** Kích hoạt một vệt sao băng trắng bạc (#FFFDF7) vút qua góc trời */
export function spawnShootingStar(world: AtmosphereWorld, leftToRight?: boolean): void {
  const star = world.shootingStars[world.shootingStarCursor % world.shootingStars.length];
  world.shootingStarCursor = (world.shootingStarCursor + 1) % world.shootingStars.length;
  if (!star) return;

  const dirLeftToRight = leftToRight ?? Math.random() >= 0.5;
  star.active = true;
  star.nx = dirLeftToRight ? 0.08 + Math.random() * 0.35 : 0.57 + Math.random() * 0.35;
  star.ny = 0.06 + Math.random() * 0.24;
  const speedX = (0.48 + Math.random() * 0.24) * (dirLeftToRight ? 1 : -1);
  const speedY = 0.14 + Math.random() * 0.12;
  star.vx = speedX;
  star.vy = speedY;
  star.lengthPx = 115 + Math.random() * 75;
  star.ageSec = 0;
  star.durationSec = 0.55 + Math.random() * 0.3;
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
  mouse: AtmosphereMouseState,
  palette: AtmospherePalette,
  tSec: number,
  parallaxX: number,
  parallaxY: number,
): void {
  const { astrolabe } = geometry;
  const cx = astrolabe.cx + parallaxX;
  const cy = astrolabe.cy + parallaxY;
  const scale = Math.max(0.56, Math.min(geometry.width, geometry.height) / 900);

  // Hệ số bừng sáng x2 khi con trỏ chuột tiến vào bán kính 240px quanh Thiên Cầu
  let hoverBoost = 0;
  if (mouse.active) {
    const dist = Math.hypot(mouse.x - cx, mouse.y - cy);
    if (dist < 240) {
      hoverBoost = Math.pow(1 - dist / 240, 1.4);
    }
  }
  const ringBrightness = 1 + hoverBoost;

  // 0. Quầng Hào Quang Tâm Điểm (Core Radial Glow r = 220px) phía sau Thiên Cầu Đông Sơn
  const coreGlowRadius = 220 * scale;
  const coreGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, coreGlowRadius);
  coreGlow.addColorStop(
    0,
    `rgba(235, 190, 105, ${Math.min(0.45, 0.22 * (1 + hoverBoost * 0.65)).toFixed(3)})`,
  );
  coreGlow.addColorStop(0.45, rgbaString(palette.rayCool, 0.08 * (1 + hoverBoost * 0.6)));
  coreGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.save();
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, coreGlowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 1. 2 cung quỹ đạo elip lớn cắt chéo qua bầu trời & các điểm nút hoàng đạo
  ctx.save();
  for (const arc of astrolabe.eclipticArcs) {
    ctx.save();
    ctx.translate(arc.cx + parallaxX, arc.cy + parallaxY);
    ctx.rotate(arc.rotationRad);
    ctx.beginPath();
    ctx.ellipse(0, 0, arc.rx, arc.ry, 0, 0, Math.PI * 2);
    ctx.lineWidth = 0.75 + hoverBoost * 0.35;
    ctx.strokeStyle = `rgba(243, 201, 120, ${(0.22 * ringBrightness).toFixed(3)})`;
    ctx.stroke();
    ctx.restore();

    for (const node of arc.nodes) {
      const nx = node.x + parallaxX;
      const ny = node.y + parallaxY;
      ctx.beginPath();
      ctx.arc(nx, ny, 2.3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 243, 209, ${(0.42 * ringBrightness).toFixed(3)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(nx, ny, 5, 0, Math.PI * 2);
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = `rgba(243, 201, 120, ${(0.26 * ringBrightness).toFixed(3)})`;
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. Ngôi sao Đông Sơn 14 cánh rực rỡ ở tâm (xoay cực chậm)
  const nextCache = terrainLayers?.next;
  const spriteSize = nextCache?.astrolabeRingSpriteSize ?? 460;
  const starSurf = nextCache?.astrolabeStarSprite;

  if (starSurf) {
    const sw = (astrolabe.starOuterRadius + 14) * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tSec * 0.015);
    ctx.globalAlpha = Math.min(1, 0.92 + hoverBoost * 0.25);
    ctx.drawImage(starSurf as CanvasImageSource, -sw * 0.5, -sw * 0.5, sw, sw);
    ctx.restore();
  } else {
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
    ctx.fillStyle = 'rgba(243, 201, 120, 0.14)';
    ctx.fill();
    ctx.lineWidth = 0.95;
    ctx.strokeStyle = 'rgba(243, 201, 120, 0.62)';
    ctx.stroke();
    ctx.restore();
  }

  // 3. 4 vòng tròn đồng tâm khắc vạch chia độ + 8 Hạt Ngọc Tinh Tú phát sáng (r = 2.5px, #FFF3D1)
  for (let idx = 0; idx < astrolabe.rings.length; idx += 1) {
    const ring = astrolabe.rings[idx]!;
    const angle = tSec * ring.angularSpeedRadSec;
    const elasticWave = hoverBoost > 0.05 ? Math.sin(tSec * 3.2 - idx * 1.1) * 2.2 * hoverBoost : 0;
    const effectiveRadius = ring.radius + elasticWave;
    const ringSurf = nextCache?.astrolabeRingSprites[idx];

    if (ringSurf) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.globalAlpha = Math.min(1, 0.92 + hoverBoost * 0.35);
      const drawSize = spriteSize + elasticWave * 2;
      ctx.drawImage(
        ringSurf as CanvasImageSource,
        -drawSize * 0.5,
        -drawSize * 0.5,
        drawSize,
        drawSize,
      );
      ctx.restore();
    } else {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveRadius, 0, Math.PI * 2);
      ctx.lineWidth = ring.lineWidth + 0.15;
      ctx.strokeStyle = `rgba(243, 201, 120, ${Math.min(0.85, 0.5 * ringBrightness).toFixed(3)})`;
      ctx.stroke();
      ctx.restore();
    }

    // Khi di chuột trong 240px -> bổ sung hào quang vành khuyên gấp đôi độ rực
    if (hoverBoost > 0.04) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveRadius, 0, Math.PI * 2);
      ctx.lineWidth = 1.45;
      ctx.strokeStyle = `rgba(245, 212, 132, ${(0.42 * hoverBoost).toFixed(3)})`;
      ctx.stroke();
      ctx.restore();
    }

    // 2 Hạt Ngọc Tinh Tú (#FFF3D1, r = 2.5px) trên mỗi vòng -> 8 hạt chuyển động tròn quanh Thiên Cầu
    for (const offset of [idx * 0.85, idx * 0.85 + Math.PI]) {
      const pearlAngle = angle * 1.8 + offset + tSec * (idx % 2 === 0 ? 0.18 : -0.15);
      const px = cx + Math.cos(pearlAngle) * effectiveRadius;
      const py = cy + Math.sin(pearlAngle) * effectiveRadius;
      const pearlHalo = ctx.createRadialGradient(px, py, 0.5, px, py, 9);
      pearlHalo.addColorStop(0, 'rgba(255, 243, 209, 0.85)');
      pearlHalo.addColorStop(0.45, 'rgba(243, 201, 120, 0.32)');
      pearlHalo.addColorStop(1, 'rgba(243, 201, 120, 0)');
      ctx.fillStyle = pearlHalo;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFF3D1';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
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
      ctx.arc(cx, cy, effectiveRadius, 0, Math.PI * 2);
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = `rgba(245, 212, 132, ${(0.55 * fade).toFixed(3)})`;
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
  palette: AtmospherePalette,
  tSec: number,
): void {
  const lensRadius = 240;
  const hasPulses = activePulses.length > 0;
  const pulseBand = 54;
  const pulseRgb = palette.terraceRim;

  // 1. Hiệu ứng Xung Ánh Sáng Chạy Dọc Bậc Thang (Flowing Contour Pulses)
  // Sử dụng hàm sóng Math.sin(x * 0.012 - t * 1.8 + ridgeIndex) trên toàn bộ đường đồng mức
  for (const contour of geometry.contours) {
    const ridgeIndex = contour.layerIndex * 1.35 + contour.tierIndex * 0.55;
    let activeSpan: { x: number; y: number }[] = [];
    let spanPeak = 0;

    const flushFlowSpan = () => {
      if (activeSpan.length < 2) {
        activeSpan = [];
        spanPeak = 0;
        return;
      }
      const alpha = Math.min(0.65, 0.28 + spanPeak * 0.37);
      ctx.save();
      ctx.beginPath();
      traceSmoothQuadraticCurve(ctx, activeSpan, true);
      ctx.lineWidth = 1.15;
      ctx.strokeStyle = rgbaString(contour.tone === 'gold' ? [245, 208, 125] : pulseRgb, alpha);
      ctx.stroke();
      ctx.restore();
      activeSpan = [];
      spanPeak = 0;
    };

    for (const pt of contour.points) {
      const wave = Math.sin(pt.x * 0.012 - tSec * 1.8 + ridgeIndex);
      if (wave > 0.38) {
        const crest = (wave - 0.38) / 0.62;
        activeSpan.push({ x: pt.x, y: pt.y });
        if (crest > spanPeak) spanPeak = crest;
      } else {
        flushFlowSpan();
      }
    }
    flushFlowSpan();
  }

  // 2. Tương tác Thấu Kính Chuột (240px -> gấp đôi độ rực & gợn sóng đàn hồi) + Sóng Vàng Kim khi Click
  if (!mouse.active && !hasPulses) return;

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

      const alpha = Math.min(0.92, spanPeakStrength * (spanHasPulse ? 0.85 : 0.78));
      ctx.save();
      ctx.beginPath();
      traceSmoothQuadraticCurve(ctx, activeSpan, true);
      ctx.lineWidth = spanHasPulse ? 1.65 : 1.45;
      ctx.strokeStyle = `rgba(245, 208, 125, ${alpha.toFixed(3)})`;
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
          yDisplace += Math.sin(pt.x * 0.032 - tSec * 3.0) * 3.2 * lensStrength;
        }
      }

      if (nearPulseY) {
        for (const pulse of activePulses) {
          const distP = Math.hypot(pt.x - pulse.x, pt.y - pulse.y);
          const diff = distP - pulse.radius;
          if (Math.abs(diff) <= pulseBand) {
            const fade = Math.max(0, 1 - pulse.radius / pulse.maxRadius);
            const ringBell = Math.exp(-(diff * diff) / (pulseBand * pulseBand * 0.25)) * fade;
            glowStrength = Math.max(glowStrength, ringBell * 1.25);
            yDisplace += Math.sin(diff * 0.16) * 5.2 * ringBell;
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
    ctx.lineWidth = 1.45;
    ctx.strokeStyle = `rgba(245, 208, 125, ${(fade * 0.52).toFixed(3)})`;
    ctx.stroke();

    if (pulse.radius > 28) {
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius - 22, 0, Math.PI * 2);
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = `rgba(125, 211, 252, ${(fade * 0.34).toFixed(3)})`;
      ctx.stroke();
    }
    ctx.restore();
  }
}

/** Kết xuất 3 lớp Biển Mây Bồng Bềnh từ OffscreenCanvas trôi ngang êm ái (0.72H -> 1.0H) */
function drawVolumetricValleyMist(
  ctx: CanvasRenderingContext2D,
  terrainLayers: TerrainLayerTransition | undefined,
  width: number,
  height: number,
  tSec: number,
): void {
  const layers = terrainLayers?.next?.valleyMistLayers;
  if (!layers || layers.length === 0) return;

  const speeds = [8, 14, 21] as const;
  const bandY = height * 0.69;
  const bandH = height * 0.32;

  for (let i = 0; i < layers.length; i += 1) {
    const surf = layers[i];
    if (!surf) continue;
    const speed = speeds[i] ?? 12;
    const rawOffset = (tSec * speed) % width;
    const offsetX = rawOffset;

    ctx.save();
    ctx.drawImage(surf as CanvasImageSource, offsetX - width, bandY, width, bandH);
    ctx.drawImage(surf as CanvasImageSource, offsetX, bandY, width, bandH);
    ctx.restore();
  }
}

function drawMistMirrorLakeAndStarlight(
  ctx: CanvasRenderingContext2D,
  world: AtmosphereWorld,
  palette: AtmospherePalette,
  sprites: AtmosphereSpriteCache,
  glowSprites: GlowSpriteCache,
  terrainLayers: TerrainLayerTransition | undefined,
  width: number,
  height: number,
  tSec: number,
  dtScale: number,
  animate: boolean,
): void {
  const mistTop = height * 0.72;
  const mistH = height - mistTop;

  // Chuyển êm xuống nền thung lũng trước khi trải 3 lớp biển mây bồng bềnh
  const baseGrad = ctx.createLinearGradient(0, mistTop, 0, height);
  baseGrad.addColorStop(0, rgbaString(palette.bottomMistDeep, 0));
  baseGrad.addColorStop(0.35, rgbaString(palette.bottomMistDeep, 0.42));
  baseGrad.addColorStop(0.82, 'rgba(18, 27, 40, 0.88)');
  baseGrad.addColorStop(1, '#121B28');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, mistTop, width, mistH);

  // 3 lớp Biển Mây Bồng Bềnh OffscreenCanvas (#1B3548, #27475E, ánh vàng #D4A359/15)
  drawVolumetricValleyMist(ctx, terrainLayers, width, height, tSec);

  // Dòng Suối / Mặt Hồ Sương Khói uốn lượn nhẹ ở trung tâm thung lũng (x: 0.35W -> 0.68W, y: 0.76H -> 0.98H)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(width * 0.48, height * 0.76);
  ctx.bezierCurveTo(
    width * 0.56,
    height * 0.81,
    width * 0.42,
    height * 0.88,
    width * 0.35,
    height * 0.985,
  );
  ctx.lineTo(width * 0.68, height * 0.985);
  ctx.bezierCurveTo(
    width * 0.62,
    height * 0.88,
    width * 0.61,
    height * 0.81,
    width * 0.55,
    height * 0.76,
  );
  ctx.closePath();
  const streamGrad = ctx.createLinearGradient(0, height * 0.76, 0, height * 0.99);
  streamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
  streamGrad.addColorStop(0.45, 'rgba(243, 201, 120, 0.14)');
  streamGrad.addColorStop(0.85, 'rgba(125, 211, 252, 0.12)');
  streamGrad.addColorStop(1, 'rgba(18, 27, 40, 0.04)');
  ctx.fillStyle = streamGrad;
  ctx.fill();
  ctx.restore();

  // 24 vệt sóng ngang lấp lánh ánh vàng kim (#F3C978) & lam băng (#7DD3FC) phản chiếu từ Thiên Cầu
  ctx.save();
  ctx.lineWidth = 0.75;
  for (let i = 0; i < world.mistRipples.length; i += 1) {
    const r = world.mistRipples[i]!;
    const cx = r.nx * width + Math.sin(tSec * r.speed + r.phase) * 18;
    const cy = r.ny * height;
    const w = r.halfWidth;
    const shimmer = 0.55 + 0.45 * Math.sin(tSec * (r.speed * 1.4) + r.phase);
    const isGold = i % 2 === 0;
    const rgb = isGold ? '243, 201, 120' : '125, 211, 252';
    const grad = ctx.createLinearGradient(cx - w, cy, cx + w, cy);
    grad.addColorStop(0, `rgba(${rgb}, 0)`);
    grad.addColorStop(0.5, `rgba(${rgb}, ${(r.alpha * shimmer).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
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

/** Vẽ 5 Chòm sao Hình học Toán học (lineWidth 0.45px mặc định; bừng sáng & tỏa tia sáng nhỏ khi chuột gần) */
function drawMathematicalConstellations(
  ctx: CanvasRenderingContext2D,
  constellations: readonly MathematicalConstellation[],
  mouse: AtmosphereMouseState,
  width: number,
  height: number,
  tSec: number,
  starIntensity: number,
): void {
  const parallaxX = -mouse.normX * 7;
  const parallaxY = -mouse.normY * 4;
  const hoverRadius = 195;

  ctx.save();
  for (let cIdx = 0; cIdx < constellations.length; cIdx += 1) {
    const constellation = constellations[cIdx]!;
    const cx = constellation.centerNx * width + parallaxX;
    const cy = constellation.centerNy * height + parallaxY;

    let proximity = 0;
    if (mouse.active) {
      let minDist = Math.hypot(mouse.x - cx, mouse.y - cy);
      for (const v of constellation.vertices) {
        const vx = v.nx * width + parallaxX;
        const vy = v.ny * height + parallaxY;
        const vd = Math.hypot(mouse.x - vx, mouse.y - vy);
        if (vd < minDist) minDist = vd;
      }
      if (minDist < hoverRadius) {
        proximity = 1 - minDist / hoverRadius;
      }
    }

    const baseScale = 0.45 + 0.55 * starIntensity;
    const lineAlpha = (0.16 + proximity * 0.56) * baseScale;
    ctx.strokeStyle = `rgba(225, 195, 120, ${lineAlpha.toFixed(3)})`;
    ctx.lineWidth = 0.45 + proximity * 0.5;
    ctx.beginPath();
    for (const [a, b] of constellation.edges) {
      const va = constellation.vertices[a]!;
      const vb = constellation.vertices[b]!;
      ctx.moveTo(va.nx * width + parallaxX, va.ny * height + parallaxY);
      ctx.lineTo(vb.nx * width + parallaxX, vb.ny * height + parallaxY);
    }
    ctx.stroke();

    // Đỉnh sao neo của chòm sao + các hạt tia sáng nhỏ li ti khi chuột di chuyển gần
    for (let vIdx = 0; vIdx < constellation.vertices.length; vIdx += 1) {
      const v = constellation.vertices[vIdx]!;
      const vx = v.nx * width + parallaxX;
      const vy = v.ny * height + parallaxY;
      const dotAlpha = (0.38 + proximity * 0.58) * baseScale;

      ctx.fillStyle = `rgba(255, 245, 214, ${dotAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(vx, vy, 1.15 + proximity * 0.85, 0, Math.PI * 2);
      ctx.fill();

      if (proximity > 0.08) {
        for (let s = 0; s < 3; s += 1) {
          const sparkAngle = tSec * 1.4 + cIdx * 1.3 + vIdx * 0.9 + (s * Math.PI * 2) / 3;
          const sparkDist = 4 + proximity * 9 * (0.55 + 0.45 * Math.sin(tSec * 3.1 + s + vIdx));
          const sx = vx + Math.cos(sparkAngle) * sparkDist;
          const sy = vy + Math.sin(sparkAngle) * sparkDist;
          const sparkAlpha = proximity * (0.45 + 0.35 * Math.sin(tSec * 4.2 + s));
          ctx.fillStyle = `rgba(255, 253, 247, ${Math.max(0.08, sparkAlpha).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, 0.85, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }
  ctx.restore();
}

/** Cập nhật và vẽ Vệt Sao Băng Định Kỳ (mỗi 5s-9s, #FFFDF7 + đuôi linearGradient mờ dần) */
function updateAndDrawShootingStars(
  ctx: CanvasRenderingContext2D,
  world: AtmosphereWorld,
  width: number,
  height: number,
  dtScale: number,
  animate: boolean,
): void {
  const dt = dtScale / 60;
  if (animate) {
    world.nextShootingStarInSec -= dt;
    if (world.nextShootingStarInSec <= 0) {
      spawnShootingStar(world);
      world.nextShootingStarInSec = 5 + Math.random() * 4;
    }

    for (const star of world.shootingStars) {
      if (!star.active) continue;
      star.ageSec += dt;
      star.nx += star.vx * dt;
      star.ny += star.vy * dt;
      if (star.ageSec >= star.durationSec) {
        star.active = false;
      }
    }
  }

  ctx.save();
  for (const star of world.shootingStars) {
    if (!star.active) continue;
    const progress = Math.max(0, Math.min(1, star.ageSec / star.durationSec));
    const envelope = Math.sin(progress * Math.PI);
    const hx = star.nx * width;
    const hy = star.ny * height;
    const velMag = Math.hypot(star.vx * width, star.vy * height) || 1;
    const dirX = (star.vx * width) / velMag;
    const dirY = (star.vy * height) / velMag;
    const tx = hx - dirX * star.lengthPx * (0.45 + 0.55 * progress);
    const ty = hy - dirY * star.lengthPx * (0.45 + 0.55 * progress);

    const tailGrad = ctx.createLinearGradient(tx, ty, hx, hy);
    tailGrad.addColorStop(0, 'rgba(255, 253, 247, 0)');
    tailGrad.addColorStop(0.55, `rgba(185, 225, 255, ${(0.32 * envelope).toFixed(3)})`);
    tailGrad.addColorStop(1, `rgba(255, 253, 247, ${(0.95 * envelope).toFixed(3)})`);

    ctx.strokeStyle = tailGrad;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 253, 247, ${(0.96 * envelope).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(hx, hy, 1.85, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Vẽ trường hạt bụi sao 3D (56 hạt) chuyển động theo quỹ đạo elip nhẹ quanh tâm thiên thể */
function draw3DStardustDrift(
  ctx: CanvasRenderingContext2D,
  stardust: readonly Stardust3DMote[],
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  tSec: number,
  starIntensity: number,
): void {
  const baseScale = 0.5 + 0.5 * starIntensity;
  ctx.save();
  for (const mote of stardust) {
    const theta = mote.phase + tSec * mote.speed;
    const lx = Math.cos(theta) * (mote.orbitRx * width);
    const ly = Math.sin(theta) * (mote.orbitRy * height);
    const cosTilt = Math.cos(mote.tilt);
    const sinTilt = Math.sin(mote.tilt);
    const x = centerX + lx * cosTilt - ly * sinTilt;
    const y = centerY + lx * sinTilt + ly * cosTilt;
    if (y > height * 0.84) continue;

    const shimmer = 0.72 + 0.28 * Math.sin(tSec * (1.2 + mote.zDepth) + mote.phase);
    const alpha = mote.alpha * shimmer * baseScale;
    ctx.fillStyle = mote.warm
      ? `rgba(243, 229, 171, ${alpha.toFixed(3)})`
      : `rgba(185, 225, 255, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(x, y, mote.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Luồng sáng khí quyển chân trời phía sau dãy núi (cx=0.58W, cy=0.55H, r=0.55W) */
function drawHorizonAtmosphericGlow(
  ctx: CanvasRenderingContext2D,
  palette: AtmospherePalette,
  width: number,
  height: number,
  parallaxX: number,
  parallaxY: number,
): void {
  const cx = width * 0.58 + parallaxX * 0.6;
  const cy = height * 0.55 + parallaxY * 0.6;
  const radius = width * 0.55;

  const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radius);
  const coolAlpha = 0.24 + palette.rayIntensity * 0.08; // ~0.32 ở Đêm Ngân Hà
  const warmAlpha = 0.12 + palette.rayIntensity * 0.04; // ~0.16 ở Đêm Ngân Hà
  grad.addColorStop(0, `rgba(45, 115, 155, ${Math.min(0.42, coolAlpha).toFixed(3)})`);
  grad.addColorStop(0.38, rgbaString(palette.dawnCore, Math.min(0.28, warmAlpha)));
  grad.addColorStop(0.72, rgbaString(palette.rayCool, 0.09));
  grad.addColorStop(1, 'rgba(45, 115, 155, 0)');

  ctx.save();
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** 2 Dải Lụa Cực Quang Mềm mại phía trên đỉnh núi (Lục Bảo #34D399/18 & Lam Ngọc #38BDF8/16, mờ dần 2 mép) */
function drawSoftAuroraRibbons(
  ctx: CanvasRenderingContext2D,
  palette: AtmospherePalette,
  width: number,
  height: number,
  tSec: number,
  parallaxX: number,
  parallaxY: number,
): void {
  const ribbons = [
    {
      baseY: height * 0.28,
      thickness: height * 0.13,
      amp: height * 0.038,
      freq: 0.0042,
      phase: 0.4,
      speed: 0.28,
      rgb: palette.starIntensity >= 0.45 ? ([52, 211, 153] as const) : palette.rayCool,
      peakAlpha: 0.18 * (0.45 + 0.55 * palette.milkyWayIntensity + 0.15 * palette.rayIntensity),
    },
    {
      baseY: height * 0.34,
      thickness: height * 0.11,
      amp: height * 0.032,
      freq: 0.0051,
      phase: 2.3,
      speed: -0.22,
      rgb: [56, 189, 248] as const,
      peakAlpha: 0.16 * (0.45 + 0.55 * palette.milkyWayIntensity + 0.15 * palette.rayIntensity),
    },
  ] as const;

  const step = Math.max(24, Math.round(width / 44));
  ctx.save();
  ctx.translate(parallaxX * 0.5, parallaxY * 0.5);

  for (const rb of ribbons) {
    const grad = ctx.createLinearGradient(0, rb.baseY - rb.thickness, 0, rb.baseY + rb.thickness);
    grad.addColorStop(0, rgbaString(rb.rgb, 0));
    grad.addColorStop(0.5, rgbaString(rb.rgb, Math.min(0.22, rb.peakAlpha)));
    grad.addColorStop(1, rgbaString(rb.rgb, 0));

    const topPts: { x: number; y: number }[] = [];
    const botPts: { x: number; y: number }[] = [];
    for (let x = -40; x <= width + 40; x += step) {
      const wave = Math.sin(x * rb.freq + tSec * rb.speed + rb.phase) * rb.amp;
      const pinch = 0.65 + 0.35 * Math.cos(x * 0.003 + rb.phase);
      const halfThick = rb.thickness * 0.55 * pinch;
      topPts.push({ x, y: rb.baseY + wave - halfThick });
      botPts.push({ x, y: rb.baseY + wave + halfThick });
    }

    ctx.beginPath();
    traceSmoothQuadraticCurve(ctx, topPts, true);
    for (let i = botPts.length - 1; i >= 0; i -= 1) {
      const p = botPts[i]!;
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }
  ctx.restore();
}

function rotatePoint3D(v: Vec3Spec, ax: number, ay: number, az: number): Vec3Spec {
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const y1 = v.y * cx - v.z * sx;
  const z1 = v.y * sx + v.z * cx;

  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const x2 = v.x * cy + z1 * sy;
  const z2 = -v.x * sy + z1 * cy;

  const cz = Math.cos(az);
  const sz = Math.sin(az);
  return {
    x: x2 * cz - y1 * sz,
    y: x2 * sz + y1 * cz,
    z: z2,
  };
}

/** 3 Khối Đa Diện Tinh Tú 3D xoay chậm chiếu phối cảnh thật (cạnh vàng kim mảnh + mặt tô mờ cyan) */
function drawPolyhedralConstellations3D(
  ctx: CanvasRenderingContext2D,
  polyhedra: readonly PolyhedralConstellation3D[],
  mouse: AtmosphereMouseState,
  activePulses: readonly HarmonicContourPulse[],
  width: number,
  height: number,
  tSec: number,
  starIntensity: number,
): void {
  const parallaxX = -mouse.normX * 7;
  const parallaxY = -mouse.normY * 4;
  const baseScale = 0.5 + 0.5 * starIntensity;

  for (const poly of polyhedra) {
    const cx = poly.anchorNx * width + parallaxX;
    const cy = poly.anchorNy * height + parallaxY;
    const scale = poly.scalePx * Math.max(0.72, Math.min(1.15, width / 1280));

    let boost = 0;
    if (mouse.active) {
      const distM = Math.hypot(mouse.x - cx, mouse.y - cy);
      if (distM < 240) boost = 1 - distM / 240;
    }
    for (const p of activePulses) {
      const distP = Math.hypot(cx - p.x, cy - p.y);
      if (Math.abs(distP - p.radius) < 60) {
        boost = Math.max(boost, Math.max(0, 1 - p.radius / p.maxRadius));
      }
    }

    const ax = tSec * poly.rotSpeedX + poly.phase + (mouse.active ? mouse.normY * 0.18 : 0);
    const ay = tSec * poly.rotSpeedY + poly.phase * 0.7 + (mouse.active ? mouse.normX * 0.22 : 0);
    const az = tSec * poly.rotSpeedZ;

    const proj = poly.vertices.map((v) => {
      const rv = rotatePoint3D(v, ax, ay, az);
      const persp = 3.2 / (3.2 - rv.z);
      return {
        x: cx + rv.x * scale * persp,
        y: cy + rv.y * scale * persp,
        z: rv.z,
      };
    });

    ctx.save();
    // Mặt đa giác tô mờ rgba(125, 211, 252, 0.05) sắp xếp theo trục Z
    const sortedFaces = [...poly.faces]
      .map((indices) => {
        const avgZ =
          indices.reduce((sum, idx) => sum + (proj[idx]?.z ?? 0), 0) / Math.max(indices.length, 1);
        return { indices, avgZ };
      })
      .sort((a, b) => a.avgZ - b.avgZ);

    const faceAlpha = Math.min(0.14, (0.05 + boost * 0.07) * baseScale);
    ctx.fillStyle = `rgba(125, 211, 252, ${faceAlpha.toFixed(3)})`;
    for (const face of sortedFaces) {
      if (face.indices.length < 3) continue;
      ctx.beginPath();
      const firstPt = proj[face.indices[0]!]!;
      ctx.moveTo(firstPt.x, firstPt.y);
      for (let i = 1; i < face.indices.length; i += 1) {
        const pt = proj[face.indices[i]!]!;
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Cạnh nối màu vàng kim mảnh rgba(243, 201, 120, 0.35)
    const edgeAlpha = Math.min(0.85, (0.35 + boost * 0.42) * baseScale);
    ctx.strokeStyle = `rgba(243, 201, 120, ${edgeAlpha.toFixed(3)})`;
    ctx.lineWidth = 0.7 + boost * 0.45;
    ctx.beginPath();
    for (const [a, b] of poly.edges) {
      const pa = proj[a]!;
      const pb = proj[b]!;
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
    }
    ctx.stroke();

    // Đỉnh sao sáng rõ
    for (const pt of proj) {
      const ptAlpha = Math.min(1, (0.58 + pt.z * 0.22 + boost * 0.35) * baseScale);
      ctx.fillStyle = `rgba(255, 243, 209, ${ptAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.45 + boost * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

/** Kết xuất toàn bộ khung hình Sơn Thủy Trắc Địa Phát Sáng & Vũ Trụ Đông Sơn 120fps (< 3ms/frame) */
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

  // LỚP 1: Dải Ngân Hà (5 lớp tinh vân chéo) + Cực Quang Lụa Mềm + 280 Ngôi Sao + 15 Sao Chữ Thập
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

  drawSoftAuroraRibbons(ctx, palette, width, height, tSec, nebulaParallaxX, nebulaParallaxY);

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

  // LỚP 1.5: 3 Khối Đa Diện Tinh Tú 3D xoay chậm + 5 Chòm sao Hình học + Bụi sao 3D + Sao băng định kỳ
  drawPolyhedralConstellations3D(
    ctx,
    world.polyhedralConstellations3D,
    mouse,
    activePulses,
    width,
    height,
    tSec,
    palette.starIntensity,
  );

  drawMathematicalConstellations(
    ctx,
    world.constellations,
    mouse,
    width,
    height,
    tSec,
    palette.starIntensity,
  );

  draw3DStardustDrift(
    ctx,
    world.stardust3D,
    activeGeometry.astrolabe.cx + astrolabeParallaxX,
    activeGeometry.astrolabe.cy + astrolabeParallaxY,
    width,
    height,
    tSec,
    palette.starIntensity,
  );

  updateAndDrawShootingStars(ctx, world, width, height, dtScale, animate);

  // Ánh sáng khí quyển chân trời sau dãy núi (cx=0.58W, cy=0.55H, r=0.55W)
  drawHorizonAtmosphericGlow(ctx, palette, width, height, mountainParallaxX, mountainParallaxY);

  // LỚP 2: Đài Thiên Cầu Mặt Trời Đông Sơn (73% x 32%, Core Radial Glow 220px, 8 Hạt Ngọc Tinh Tú)
  drawDongSonAstrolabe(
    ctx,
    activeGeometry,
    terrainLayers,
    activePulses,
    mouse,
    palette,
    tSec,
    astrolabeParallaxX,
    astrolabeParallaxY,
  );

  // LỚP 3: Thấu Kính Chòm Sao Tam Giác & La Bàn Trỏ Chuột trên Bầu Trời (160px)
  drawSkyConstellationLens(ctx, world.stars, mouse, width, height, tSec);

  // LỚP 4: 5 Tầng Núi Sương Mù Khí Quyển + Viền Sáng 1.2px + 24 Đường Đồng Mức Bậc Thang
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

  // LỚP 5: Xung Ánh Sáng Chạy Dọc Bậc Thang + Thấu Kính Trắc Địa (240px) & Sóng Vàng Kim
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
  drawInteractiveMountainContours(ctx, activeGeometry, localMouse, localPulses, palette, tSec);
  ctx.restore();

  drawHarmonicPulseRings(ctx, activePulses);

  // LỚP 6: 3 Lớp Biển Mây Bồng Bềnh + Dòng Suối Ánh Sao (0.35W->0.68W) + 25 Tinh Tú Vàng Ấm
  drawMistMirrorLakeAndStarlight(
    ctx,
    world,
    palette,
    sprites,
    glowSprites,
    terrainLayers,
    width,
    height,
    tSec,
    dtScale,
    animate,
  );
}
