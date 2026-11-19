import { type AtmospherePalette } from '@/components/home/atmosphereThemes';
import {
  buildHeroTerrainGeometry,
  MOUNTAIN_PARALLAX_PAD_PX,
  traceSmoothQuadraticCurve,
  type HeroTerrainGeometry,
  type HeroTerrainLayerCache,
  type TerrainSurface,
} from '@/components/home/heroTerrainBuilder';
import { type GlowSpriteCache } from '@/shared/lib/canvasSprites';

export const PIPELINE_LAYER_NAMES = [
  '1_sky_god_rays_and_sunlit_motes',
  '2_dong_son_celestial_astrolabe_and_orbit_nodes',
  '3_fbm_mountains_and_drifting_valley_mist',
  '4_geometric_lac_birds_and_ridgelines',
  '5_interactive_topographic_lens_and_drum_pulse',
  '6_reflective_water_caustics_and_lake_seal',
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

/** Cụm khí cụ đo góc tí hon neo cố định và chuyển động chậm dọc theo 2 cung quỹ đạo Đông Sơn */
export interface OrbitAstrolabeNode {
  readonly id: 'armillary' | 'vernier' | 'lunar';
  readonly name: string;
  readonly orbitIndex: 0 | 1;
  readonly radiusPx: number;
  readonly initialAngleRad: number;
  readonly angularSpeedRadSec: number;
}

/** Cánh chim Lạc cách điệu dựng từ 2 cung Bézier bậc ba đối xứng sắc nét */
export interface GeometricLacBird {
  readonly id: string;
  readonly initialProgress: number;
  readonly startNx: number;
  readonly endNx: number;
  readonly startNy: number;
  readonly endNy: number;
  readonly speed: number;
  readonly scale: number;
  readonly phase: number;
  readonly waveAmpRatio: number;
}

/** Hạt phấn nắng vi mô (r = 0.8px -> 2.0px) lơ lửng trong chùm tia sáng ban mai bên phải */
export interface SunlitMote {
  readonly nx: number;
  readonly ny: number;
  readonly radius: number;
  readonly tone: 'cream' | 'gold';
  readonly phase: number;
  readonly opacitySpeed: number;
  readonly swirlAmp: number;
  readonly swirlFreq: number;
}

/** Vệt sóng khúc xạ ánh sáng mặt nước caustics dưới cột sáng Đài Thiên Cầu (10-14 vệt) */
export interface WaterCausticStreak {
  readonly offsetNx: number;
  readonly depthRatio: number;
  readonly halfWidthPx: number;
  readonly speed: number;
  readonly phase: number;
  readonly alpha: number;
  readonly warmCream: boolean;
}

export interface AtmosphereWorld {
  readonly stars: readonly StarMote[];
  readonly constellations: readonly MathematicalConstellation[];
  readonly orbitAstrolabeNodes: readonly OrbitAstrolabeNode[];
  readonly lacBirds: readonly GeometricLacBird[];
  readonly sunlitMotes: readonly SunlitMote[];
  readonly waterCaustics: readonly WaterCausticStreak[];
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

  // 3 cụm khí cụ đo góc tí hon neo cố định trên 2 cung quỹ đạo mở rộng từ Đài Thiên Cầu Đông Sơn (0.03 - 0.06 rad/s)
  const orbitAstrolabeNodes: OrbitAstrolabeNode[] = [
    {
      id: 'armillary',
      name: 'Nút Hỗn Thiên',
      orbitIndex: 0,
      radiusPx: 16,
      initialAngleRad: 3.64,
      angularSpeedRadSec: 0.036,
    },
    {
      id: 'vernier',
      name: 'Nút Thước Ngắm Phương Vị',
      orbitIndex: 1,
      radiusPx: 13,
      initialAngleRad: 3.24,
      angularSpeedRadSec: 0.048,
    },
    {
      id: 'lunar',
      name: 'Nút Giao Điểm Pha Mặt Trăng',
      orbitIndex: 0,
      radiusPx: 11,
      initialAngleRad: 3.04,
      angularSpeedRadSec: 0.056,
    },
  ];

  // Đàn 4 cánh chim Lạc cách điệu bay chéo chậm từ thung lũng trái lên phía nguồn sáng bên phải
  const lacBirds: GeometricLacBird[] = [
    {
      id: 'lac-leader',
      initialProgress: 0.36,
      startNx: 0.14,
      endNx: 1.06,
      startNy: 0.43,
      endNy: 0.16,
      speed: 0.014,
      scale: 1.15,
      phase: 0.2,
      waveAmpRatio: 0.014,
    },
    {
      id: 'lac-wing-east',
      initialProgress: 0.29,
      startNx: 0.12,
      endNx: 1.05,
      startNy: 0.455,
      endNy: 0.185,
      speed: 0.014,
      scale: 0.98,
      phase: 1.35,
      waveAmpRatio: 0.013,
    },
    {
      id: 'lac-wing-west',
      initialProgress: 0.24,
      startNx: 0.1,
      endNx: 1.04,
      startNy: 0.415,
      endNy: 0.145,
      speed: 0.014,
      scale: 0.84,
      phase: 2.45,
      waveAmpRatio: 0.012,
    },
    {
      id: 'lac-distant',
      initialProgress: 0.17,
      startNx: 0.08,
      endNx: 1.02,
      startNy: 0.445,
      endNy: 0.175,
      speed: 0.014,
      scale: 0.68,
      phase: 3.55,
      waveAmpRatio: 0.011,
    },
  ];

  // 36 hạt phấn nắng vi mô (r = 0.8px -> 2.0px) lơ lửng trong chùm tia sáng ban mai bên phải
  const sunlitMotes: SunlitMote[] = Array.from({ length: 36 }, (_, i) => ({
    nx: 0.52 + seededRandom(i * 27.13 + 0.9) * 0.44,
    ny: 0.08 + seededRandom(i * 28.41 + 1.7) * 0.64,
    radius: 0.8 + seededRandom(i * 29.73 + 2.3) * 1.2,
    tone: i % 2 === 0 ? 'cream' : 'gold',
    phase: seededRandom(i * 30.19) * Math.PI * 2,
    opacitySpeed: 0.85 + seededRandom(i * 31.67) * 1.25,
    swirlAmp: 5 + seededRandom(i * 32.11) * 11,
    swirlFreq: 0.35 + seededRandom(i * 33.47) * 0.45,
  }));

  // 12 vệt sóng khúc xạ caustics mảnh dao động ngang dưới cột phản chiếu của Đài Thiên Cầu
  const waterCaustics: WaterCausticStreak[] = Array.from({ length: 12 }, (_, i) => {
    const t = i / 11;
    const spread = 0.04 + t * 0.15;
    const side = (seededRandom(i * 34.71 + 0.4) - 0.5) * 2;
    return {
      offsetNx: side * spread,
      depthRatio: 0.16 + t * 0.68,
      halfWidthPx: 18 + (1 - t) * 24 + seededRandom(i * 35.19) * 30,
      speed: 0.45 + seededRandom(i * 36.29) * 0.55,
      phase: seededRandom(i * 37.83) * Math.PI * 2,
      alpha: 0.24 + (1 - Math.abs(side) * 0.6) * 0.24,
      warmCream: i % 3 !== 2,
    };
  });

  return {
    stars,
    constellations,
    orbitAstrolabeNodes,
    lacBirds,
    sunlitMotes,
    waterCaustics,
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

function drawDongSonAstrolabe(
  ctx: CanvasRenderingContext2D,
  geometry: HeroTerrainGeometry,
  terrainLayers: TerrainLayerTransition | undefined,
  activePulses: readonly HarmonicContourPulse[],
  mouse: AtmosphereMouseState,
  _palette: AtmospherePalette,
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

  // 0. Quầng nắng ấm trong trẻo phía sau Thiên Cầu Đông Sơn (rgba(255, 246, 224, 0.85) -> rgba(218, 182, 118, 0.18) -> transparent)
  const coreGlowRadius = 235 * scale;
  const coreGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, coreGlowRadius);
  coreGlow.addColorStop(
    0,
    `rgba(255, 246, 224, ${Math.min(0.95, 0.85 + hoverBoost * 0.1).toFixed(3)})`,
  );
  coreGlow.addColorStop(
    0.46,
    `rgba(218, 182, 118, ${Math.min(0.32, 0.18 * (1 + hoverBoost * 0.5)).toFixed(3)})`,
  );
  coreGlow.addColorStop(1, 'rgba(218, 182, 118, 0)');
  ctx.save();
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, coreGlowRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 1. 2 cung quỹ đạo elip lớn khắc mảnh bằng chỉ Đồng Trầm & Lam Phiến
  ctx.save();
  for (let aIdx = 0; aIdx < astrolabe.eclipticArcs.length; aIdx += 1) {
    const arc = astrolabe.eclipticArcs[aIdx]!;
    ctx.save();
    ctx.translate(arc.cx + parallaxX, arc.cy + parallaxY);
    ctx.rotate(arc.rotationRad);
    ctx.beginPath();
    ctx.ellipse(0, 0, arc.rx, arc.ry, 0, 0, Math.PI * 2);
    ctx.lineWidth = 0.8 + hoverBoost * 0.3;
    ctx.strokeStyle =
      aIdx === 0
        ? `rgba(148, 107, 48, ${Math.min(0.62, 0.32 * ringBrightness).toFixed(3)})`
        : `rgba(45, 82, 102, ${Math.min(0.5, 0.24 * ringBrightness).toFixed(3)})`;
    ctx.stroke();
    ctx.restore();

    for (const node of arc.nodes) {
      const nx = node.x + parallaxX;
      const ny = node.y + parallaxY;
      ctx.beginPath();
      ctx.arc(nx, ny, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148, 107, 48, ${Math.min(0.74, 0.52 * ringBrightness).toFixed(3)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(nx, ny, 4.8, 0, Math.PI * 2);
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = `rgba(45, 82, 102, ${Math.min(0.42, 0.24 * ringBrightness).toFixed(3)})`;
      ctx.stroke();
    }
  }
  ctx.restore();

  // 2. Ngôi sao Đông Sơn 14 cánh khắc vàng cổ (xoay cực chậm)
  const nextCache = terrainLayers?.next;
  const spriteSize = nextCache?.astrolabeRingSpriteSize ?? 460;
  const starSurf = nextCache?.astrolabeStarSprite;

  if (starSurf) {
    const sw = (astrolabe.starOuterRadius + 14) * 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(tSec * 0.015);
    ctx.globalAlpha = Math.min(1, 0.92 + hoverBoost * 0.12);
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
    ctx.fillStyle = 'rgba(218, 182, 118, 0.17)';
    ctx.fill();
    ctx.lineWidth = 1.0;
    ctx.strokeStyle = 'rgba(148, 107, 48, 0.52)';
    ctx.stroke();
    ctx.restore();
  }

  // 3. 4 vòng tròn đồng tâm khắc vạch chia độ + 6 Hạt Ngọc Khoáng Thạch xoay chậm 120fps
  const mineralPearls: readonly {
    readonly ringIdx: number;
    readonly offset: number;
    readonly speed: number;
    readonly color: string;
    readonly haloRgba: string;
  }[] = [
    {
      ringIdx: 0,
      offset: 0.4,
      speed: 0.16,
      color: '#9C7A4C',
      haloRgba: 'rgba(156, 122, 76, 0.28)',
    },
    {
      ringIdx: 1,
      offset: 2.1,
      speed: -0.13,
      color: '#2D5266',
      haloRgba: 'rgba(45, 82, 102, 0.24)',
    },
    { ringIdx: 1, offset: 5.2, speed: -0.13, color: '#245746', haloRgba: 'rgba(36, 87, 70, 0.24)' },
    { ringIdx: 2, offset: 1.1, speed: 0.11, color: '#7A463B', haloRgba: 'rgba(122, 70, 59, 0.24)' },
    {
      ringIdx: 2,
      offset: 4.3,
      speed: 0.11,
      color: '#A67936',
      haloRgba: 'rgba(166, 121, 54, 0.28)',
    },
    {
      ringIdx: 3,
      offset: 2.8,
      speed: -0.09,
      color: '#4C7369',
      haloRgba: 'rgba(76, 115, 105, 0.24)',
    },
  ];

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
      ctx.globalAlpha = Math.min(1, 0.92 + hoverBoost * 0.15);
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
      ctx.lineWidth = ring.lineWidth + 0.1;
      ctx.strokeStyle =
        idx % 2 === 0
          ? `rgba(148, 107, 48, ${Math.min(0.72, 0.52 * ringBrightness).toFixed(3)})`
          : `rgba(45, 82, 102, ${Math.min(0.6, 0.34 * ringBrightness).toFixed(3)})`;
      ctx.stroke();
      ctx.restore();
    }

    if (hoverBoost > 0.04) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, effectiveRadius, 0, Math.PI * 2);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = `rgba(166, 121, 54, ${(0.38 * hoverBoost).toFixed(3)})`;
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
      ctx.arc(cx, cy, effectiveRadius, 0, Math.PI * 2);
      ctx.lineWidth = 1.35;
      ctx.strokeStyle = `rgba(166, 121, 54, ${(0.58 * fade).toFixed(3)})`;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Vẽ 6 hạt ngọc khoáng thạch xoay chậm 120fps trên các vòng thiên cầu
  for (const pearl of mineralPearls) {
    const ring = astrolabe.rings[pearl.ringIdx];
    if (!ring) continue;
    const angle = tSec * ring.angularSpeedRadSec;
    const elasticWave =
      hoverBoost > 0.05 ? Math.sin(tSec * 3.2 - pearl.ringIdx * 1.1) * 2.2 * hoverBoost : 0;
    const effectiveRadius = ring.radius + elasticWave;
    const pearlAngle = angle * 1.4 + pearl.offset + tSec * pearl.speed;
    const px = cx + Math.cos(pearlAngle) * effectiveRadius;
    const py = cy + Math.sin(pearlAngle) * effectiveRadius;

    ctx.beginPath();
    ctx.arc(px, py, 6.2, 0, Math.PI * 2);
    ctx.fillStyle = pearl.haloRgba;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px, py, 2.7, 0, Math.PI * 2);
    ctx.fillStyle = pearl.color;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(px - 0.7, py - 0.7, 0.9, 0, Math.PI * 2);
    ctx.fillStyle = '#FAFBF9';
    ctx.fill();
  }
}

function drawInteractiveMountainContours(
  ctx: CanvasRenderingContext2D,
  geometry: HeroTerrainGeometry,
  mouse: AtmosphereMouseState,
  activePulses: readonly HarmonicContourPulse[],
  _palette: AtmospherePalette,
  tSec: number,
  targetLayerIndex?: 1 | 2 | 3 | 4,
): void {
  const lensRadius = 220;
  const hasPulses = activePulses.length > 0;
  const pulseBand = 54;

  // 1. Dòng ánh nắng nhẹ chạy dọc bậc thang (Đồng Cổ & Trắng Sứ)
  for (const contour of geometry.contours) {
    if (targetLayerIndex !== undefined && contour.layerIndex !== targetLayerIndex) continue;
    const ridgeIndex = contour.layerIndex * 1.35 + contour.tierIndex * 0.55;
    let activeSpan: { x: number; y: number }[] = [];
    let spanPeak = 0;

    const flushFlowSpan = () => {
      if (activeSpan.length < 2) {
        activeSpan = [];
        spanPeak = 0;
        return;
      }
      const alpha = Math.min(0.45, 0.16 + spanPeak * 0.24);
      ctx.save();
      ctx.beginPath();
      traceSmoothQuadraticCurve(ctx, activeSpan, true);
      ctx.lineWidth = 0.9;
      ctx.strokeStyle =
        contour.tone === 'gold'
          ? `rgba(166, 121, 54, ${alpha.toFixed(3)})`
          : `rgba(255, 252, 240, ${(alpha * 1.15).toFixed(3)})`;
      ctx.stroke();
      ctx.restore();
      activeSpan = [];
      spanPeak = 0;
    };

    for (const pt of contour.points) {
      const wave = Math.sin(pt.x * 0.012 - tSec * 1.6 + ridgeIndex);
      if (wave > 0.45) {
        const crest = (wave - 0.45) / 0.55;
        activeSpan.push({ x: pt.x, y: pt.y });
        if (crest > spanPeak) spanPeak = crest;
      } else {
        flushFlowSpan();
      }
    }
    flushFlowSpan();
  }

  // 2. Tương tác Chuột bán kính 220px -> sáng rực màu Vàng Đồng (#A67936) & uốn gợn nhẹ + Sóng Trống Đồng
  if (!mouse.active && !hasPulses) return;

  for (const contour of geometry.contours) {
    if (targetLayerIndex !== undefined && contour.layerIndex !== targetLayerIndex) continue;
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

      const alpha = Math.min(0.95, spanPeakStrength * (spanHasPulse ? 0.92 : 0.86));
      ctx.save();
      ctx.beginPath();
      traceSmoothQuadraticCurve(ctx, activeSpan, true);
      ctx.lineWidth = spanHasPulse ? 1.55 : 1.35;
      ctx.strokeStyle = `rgba(166, 121, 54, ${alpha.toFixed(3)})`; // #A67936 Vàng Đồng
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
    ctx.strokeStyle = `rgba(166, 121, 54, ${(fade * 0.62).toFixed(3)})`;
    ctx.stroke();

    if (pulse.radius > 28) {
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius - 22, 0, Math.PI * 2);
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = `rgba(45, 82, 102, ${(fade * 0.36).toFixed(3)})`;
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

/** Vẽ 2 dải sương thung lũng bán trong suốt trôi ngang ngược chiều nhau giữa tầng núi 2–3 và 3–4 */
function drawInterMountainValleyMistBand(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  bandIndex: 0 | 1,
  tSec: number,
  parallaxX: number,
  parallaxY: number,
): void {
  const centerY = height * (bandIndex === 0 ? 0.595 : 0.675) + parallaxY;
  const bandH = height * (bandIndex === 0 ? 0.14 : 0.13);
  const topY = centerY - bandH * 0.5;
  const direction = bandIndex === 0 ? -1 : 1;
  const speedPxSec = bandIndex === 0 ? 11 : 15;
  const driftPhase = (((tSec * speedPxSec * direction) % width) + width) % width;

  ctx.save();
  // Lớp màn sương tuyến tính tổng thể từ trong suốt -> rgba(242, 247, 245, 0.55) -> trong suốt
  const bandGrad = ctx.createLinearGradient(0, topY, 0, topY + bandH);
  bandGrad.addColorStop(0, 'rgba(242, 247, 245, 0)');
  bandGrad.addColorStop(0.42, 'rgba(242, 247, 245, 0.55)');
  bandGrad.addColorStop(0.66, 'rgba(242, 247, 245, 0.34)');
  bandGrad.addColorStop(1, 'rgba(242, 247, 245, 0)');
  ctx.fillStyle = bandGrad;
  ctx.fillRect(0, topY, width, bandH);

  // Dải sương gợn sóng trôi ngang mềm mịn (2 chu kỳ bọc liền)
  const wispCount = 5;
  for (let i = 0; i < wispCount; i += 1) {
    const baseRatio = (i + 0.35) / wispCount;
    const rx = width * (0.2 + (i % 2) * 0.06);
    const ry = bandH * (0.36 + (i % 3) * 0.06);
    const wx = ((baseRatio * width + driftPhase) % (width + rx * 2)) - rx + parallaxX * 0.4;
    const wy = centerY + Math.sin(i * 1.9 + bandIndex * 2.1) * (bandH * 0.14);

    ctx.save();
    ctx.translate(wx, wy);
    ctx.scale(1, ry / Math.max(rx, 1));
    const wispGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    wispGrad.addColorStop(0, 'rgba(242, 247, 245, 0.48)');
    wispGrad.addColorStop(0.55, 'rgba(242, 247, 245, 0.2)');
    wispGrad.addColorStop(1, 'rgba(242, 247, 245, 0)');
    ctx.fillStyle = wispGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}

/** Vẽ 36 hạt phấn nắng vi mô (r = 0.8px -> 2.0px, #FFF9EA & #D4AF6A, opacity 0.15 -> 0.55) trong luồng nắng phải */
function drawSunlitMotes(
  ctx: CanvasRenderingContext2D,
  motes: readonly SunlitMote[],
  width: number,
  height: number,
  tSec: number,
  parallaxX: number,
  parallaxY: number,
): void {
  ctx.save();
  for (const mote of motes) {
    const swayX = Math.sin(tSec * mote.swirlFreq + mote.phase) * mote.swirlAmp;
    const driftY = Math.cos(tSec * (mote.swirlFreq * 0.72) + mote.phase * 1.3) * 7;
    const sx = mote.nx * width + swayX + parallaxX;
    const sy = mote.ny * height + driftY + parallaxY;

    const osc = 0.5 + 0.5 * Math.sin(tSec * mote.opacitySpeed + mote.phase);
    const opacity = 0.15 + osc * 0.4;
    ctx.fillStyle =
      mote.tone === 'cream'
        ? `rgba(255, 249, 234, ${opacity.toFixed(3)})`
        : `rgba(212, 175, 106, ${opacity.toFixed(3)})`;

    ctx.beginPath();
    ctx.arc(sx, sy, mote.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawMistMirrorLakeAndStarlight(
  ctx: CanvasRenderingContext2D,
  world: AtmosphereWorld,
  _palette: AtmospherePalette,
  _sprites: AtmosphereSpriteCache,
  _glowSprites: GlowSpriteCache,
  terrainLayers: TerrainLayerTransition | undefined,
  width: number,
  height: number,
  astrolabeCx: number,
  tSec: number,
): void {
  // Dải mặt nước tĩnh mờ sương ở 14% cuối cùng (0.86H -> 1.00H) dưới chân tầng núi 5
  const lakeTop = height * 0.86;
  const lakeH = height - lakeTop;

  const baseGrad = ctx.createLinearGradient(0, lakeTop, 0, height);
  baseGrad.addColorStop(0, 'rgba(184, 203, 197, 0)');
  baseGrad.addColorStop(0.28, 'rgba(218, 229, 225, 0.58)');
  baseGrad.addColorStop(0.68, 'rgba(238, 242, 240, 0.88)');
  baseGrad.addColorStop(1, '#EEF2F0');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, lakeTop, width, lakeH);

  // Cột ánh sáng vàng kem phản chiếu dịu nhẹ từ Đài Thiên Cầu Đông Sơn xuống mặt hồ
  const reflectColHalfW = Math.max(115, width * 0.16);
  const reflectGrad = ctx.createRadialGradient(
    astrolabeCx,
    lakeTop + lakeH * 0.34,
    8,
    astrolabeCx,
    lakeTop + lakeH * 0.42,
    reflectColHalfW,
  );
  reflectGrad.addColorStop(0, 'rgba(255, 246, 224, 0.46)');
  reflectGrad.addColorStop(0.45, 'rgba(234, 206, 148, 0.2)');
  reflectGrad.addColorStop(1, 'rgba(255, 246, 224, 0)');
  ctx.save();
  ctx.fillStyle = reflectGrad;
  ctx.fillRect(Math.max(0, astrolabeCx - reflectColHalfW), lakeTop, reflectColHalfW * 2, lakeH);
  ctx.restore();

  // 3 lớp Biển Sương Ban Mai OffscreenCanvas trôi ngang êm ái
  drawVolumetricValleyMist(ctx, terrainLayers, width, height, tSec);

  // 12 vệt sóng khúc xạ ánh sáng mặt nước (caustics) mảnh dao động ngang chậm
  ctx.save();
  for (let i = 0; i < world.waterCaustics.length; i += 1) {
    const streak = world.waterCaustics[i]!;
    const oscX = Math.sin(tSec * streak.speed + streak.phase) * 14;
    const cx = astrolabeCx + streak.offsetNx * width + oscX;
    const cy = lakeTop + streak.depthRatio * (lakeH * 0.78);
    if (cy > height * 0.975) continue;

    const w = streak.halfWidthPx;
    const shimmer = 0.55 + 0.45 * Math.sin(tSec * (streak.speed * 1.35) + streak.phase);
    const rgb = streak.warmCream ? '255, 248, 224' : '226, 196, 138';
    const peakAlpha = Math.min(0.68, streak.alpha * shimmer * 1.25);

    const grad = ctx.createLinearGradient(cx - w, cy, cx + w, cy);
    grad.addColorStop(0, `rgba(${rgb}, 0)`);
    grad.addColorStop(0.5, `rgba(${rgb}, ${peakAlpha.toFixed(3)})`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);

    ctx.strokeStyle = grad;
    ctx.lineWidth = i % 3 === 0 ? 1.15 : 0.85;
    ctx.beginPath();
    ctx.moveTo(cx - w, cy);
    ctx.lineTo(cx + w, cy);
    ctx.stroke();
  }
  ctx.restore();

  // Lớp sương khóa mép đáy tan êm không vết cắt vào màu nền Screen 2 (#EEF2F0 / #F2F4F3)
  const bottomSealTop = height * 0.915;
  const bottomSealGrad = ctx.createLinearGradient(0, bottomSealTop, 0, height);
  bottomSealGrad.addColorStop(0, 'rgba(238, 242, 240, 0)');
  bottomSealGrad.addColorStop(0.52, 'rgba(238, 242, 240, 0.88)');
  bottomSealGrad.addColorStop(1, '#EEF2F0');
  ctx.fillStyle = bottomSealGrad;
  ctx.fillRect(0, bottomSealTop, width, height - bottomSealTop);
}

/**
 * 5 chùm tia nắng ban mai nghiêng mềm (god-rays, rgba(255, 250, 235, 0.35) mờ dần hai biên)
 * tỏa chéo từ góc phải bầu trời xuống thung lũng.
 */
function drawVolumetricGodRays(
  ctx: CanvasRenderingContext2D,
  originX: number,
  _originY: number,
  _palette: AtmospherePalette,
  mouse: AtmosphereMouseState,
  width: number,
  height: number,
  tSec: number,
): void {
  const rayOriginX = Math.max(originX + width * 0.12, width * 0.86);
  const rayOriginY = -height * 0.12;
  const rayLength = Math.hypot(width, height) * 0.95;
  const baseTilt = 2.18 + mouse.normX * 0.04;
  const shaftCount = 5;

  ctx.save();
  for (let i = 0; i < shaftCount; i += 1) {
    const progress = (i + 0.5) / shaftCount;
    const sway = Math.sin(tSec * 0.22 + i * 1.35) * 0.018;
    const angle = baseTilt + (progress - 0.5) * 0.52 + sway;
    const halfSpread = 0.042 + (i % 2) * 0.016;
    const len = rayLength * (0.85 + (i % 3) * 0.06);

    const x1 = rayOriginX + Math.cos(angle - halfSpread) * len;
    const y1 = rayOriginY + Math.sin(angle - halfSpread) * len;
    const x2 = rayOriginX + Math.cos(angle + halfSpread) * len;
    const y2 = rayOriginY + Math.sin(angle + halfSpread) * len;

    const beamGrad = ctx.createLinearGradient(
      rayOriginX,
      rayOriginY,
      rayOriginX + Math.cos(angle) * len,
      rayOriginY + Math.sin(angle) * len,
    );
    const pulse = 0.85 + 0.15 * Math.sin(tSec * 0.35 + i * 1.8);
    const peakAlpha = Math.min(0.35, (0.28 + (i % 2) * 0.07) * pulse);
    beamGrad.addColorStop(0, `rgba(255, 250, 235, ${peakAlpha.toFixed(3)})`);
    beamGrad.addColorStop(0.55, `rgba(255, 250, 235, ${(peakAlpha * 0.48).toFixed(3)})`);
    beamGrad.addColorStop(1, 'rgba(255, 250, 235, 0)');

    ctx.beginPath();
    ctx.moveTo(rayOriginX, rayOriginY);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();
    ctx.fillStyle = beamGrad;
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Lát cắt địa hình ridgeline mảnh hòa nhập vào 5 tầng núi sương lam ban mai.
 */
function drawElevationRidgelines(
  ctx: CanvasRenderingContext2D,
  _palette: AtmospherePalette,
  mouse: AtmosphereMouseState,
  width: number,
  height: number,
  tSec: number,
): void {
  const rows = 20;
  const hiRow = 7;
  const cols = 44;
  const ridgeSpanStart = width * 0.28;
  const ridgeSpanWidth = width * 0.76;
  const topY = height * 0.52;
  const depthSpanY = height * 0.24;

  ctx.save();
  for (let row = 0; row < rows; row += 1) {
    const zNorm = row / (rows - 1);
    const baseY = topY + zNorm * depthSpanY;
    const isHighlight = row === hiRow;
    const rowLift = height * 0.044 * (0.45 + 0.55 * (1 - zNorm));

    ctx.beginPath();
    for (let col = 0; col <= cols; col += 1) {
      const u = col / cols;
      const x = ridgeSpanStart + u * ridgeSpanWidth;
      const d = (u - 0.58) / 0.34;
      const env = Math.exp(-0.275 * d * d * d * d - 0.3 * d * d);

      const n1 = Math.sin(u * 13.5 + row * 0.52 + tSec * 0.05);
      const n2 = Math.cos(u * 27.0 - row * 0.88 + 0.7) * 0.45;
      const rawNoise = (n1 + n2) / 1.45;
      const cusp = 1 - Math.sqrt(rawNoise * rawNoise + 0.0025);

      let mouseBoost = 1;
      if (mouse.active) {
        const md = Math.hypot(x - mouse.x, baseY - mouse.y);
        if (md < 220) {
          mouseBoost += Math.pow(1 - md / 220, 2) * 0.45;
        }
      }

      const elevation = Math.max(0, cusp * env * rowLift * mouseBoost);
      const y = baseY - elevation;

      if (col === 0) ctx.moveTo(x, baseY + 6);
      ctx.lineTo(x, y);
      if (col === cols) ctx.lineTo(x, baseY + 6);
    }

    ctx.fillStyle = 'rgba(230, 239, 236, 0.08)';
    ctx.fill();

    ctx.lineWidth = isHighlight ? 0.95 : 0.65;
    ctx.strokeStyle = isHighlight ? 'rgba(255, 252, 240, 0.52)' : 'rgba(156, 122, 76, 0.14)';
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Vẽ 2 cung quỹ đạo đồng tâm mở rộng siêu mảnh (lineWidth: 0.7px, nét đứt [3, 5], rgba(148, 107, 48, 0.24))
 * cùng 3 cụm khí cụ đo góc tí hon (Armillary, Vernier, Lunar) & tia tiếp tuyến khi di chuột gần tâm (< 260px).
 */
function drawOrbitAstrolabeNodes(
  ctx: CanvasRenderingContext2D,
  geometry: HeroTerrainGeometry,
  nodes: readonly OrbitAstrolabeNode[],
  mouse: AtmosphereMouseState,
  tSec: number,
  parallaxX: number,
  parallaxY: number,
): void {
  const cx = geometry.astrolabe.cx + parallaxX;
  const cy = geometry.astrolabe.cy + parallaxY;
  const [r1, r2] = geometry.astrolabe.expandedOrbitRadii;

  // 1. 2 cung quỹ đạo đồng tâm mở rộng siêu mảnh hướng về trung tâm bầu trời
  ctx.save();
  ctx.lineWidth = 0.7;
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = 'rgba(148, 107, 48, 0.24)';
  for (const orbitRadius of [r1, r2]) {
    ctx.beginPath();
    ctx.arc(cx, cy, orbitRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();

  // 2. Tính tọa độ 3 cụm khí cụ neo trên 2 cung quỹ đạo & tìm nút gần con trỏ chuột nhất
  let nearestNode: { x: number; y: number; tangentAngle: number } | null = null;
  let nearestDist = Number.POSITIVE_INFINITY;
  const pointerNearDial = mouse.active && Math.hypot(mouse.x - cx, mouse.y - cy) < 260;

  for (const node of nodes) {
    const orbitR = node.orbitIndex === 0 ? r1 : r2;
    const angle = node.initialAngleRad + tSec * node.angularSpeedRadSec;
    const nx = cx + Math.cos(angle) * orbitR;
    const ny = cy + Math.sin(angle) * orbitR;
    const tangentAngle = angle + Math.PI / 2;

    if (pointerNearDial) {
      const d = Math.hypot(mouse.x - nx, mouse.y - ny);
      if (d < nearestDist) {
        nearestDist = d;
        nearestNode = { x: nx, y: ny, tangentAngle };
      }
    }

    ctx.save();
    ctx.translate(nx, ny);

    // Hạt neo nhỏ trên đường quỹ đạo
    ctx.beginPath();
    ctx.arc(0, 0, node.radiusPx + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(250, 251, 249, 0.28)';
    ctx.fill();

    if (node.id === 'armillary') {
      // Nút Hỗn Thiên (Armillary Node): 2 vòng elip vuông góc nghiêng 3D xoay nhẹ
      const tilt1 = Math.max(4.8, node.radiusPx * Math.abs(Math.cos(tSec * 0.42)));
      const tilt2 = Math.max(4.8, node.radiusPx * Math.abs(Math.sin(tSec * 0.42 + 0.55)));

      ctx.save();
      ctx.rotate(tSec * 0.18 + 0.35);
      ctx.beginPath();
      ctx.ellipse(0, 0, node.radiusPx, tilt1, 0, 0, Math.PI * 2);
      ctx.lineWidth = 1.05;
      ctx.strokeStyle = '#2D5266';
      ctx.stroke();

      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, node.radiusPx, tilt2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#9C7A4C';
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FAFBF9';
      ctx.fill();
      ctx.lineWidth = 0.85;
      ctx.strokeStyle = '#9C7A4C';
      ctx.stroke();
    } else if (node.id === 'vernier') {
      // Nút Thước Ngắm Phương Vị (Vernier Reticle): 12 vạch & kim chỉ tiếp tuyến vuông góc với bán kính
      ctx.beginPath();
      ctx.arc(0, 0, node.radiusPx, 0, Math.PI * 2);
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = '#2D5266';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, node.radiusPx * 0.66, 0, Math.PI * 2);
      ctx.lineWidth = 0.65;
      ctx.strokeStyle = 'rgba(156, 122, 76, 0.45)';
      ctx.stroke();

      for (let tick = 0; tick < 12; tick += 1) {
        const aTick = (tick / 12) * Math.PI * 2;
        const innerT = tick % 3 === 0 ? node.radiusPx - 3.6 : node.radiusPx - 2.2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(aTick) * innerT, Math.sin(aTick) * innerT);
        ctx.lineTo(Math.cos(aTick) * node.radiusPx, Math.sin(aTick) * node.radiusPx);
        ctx.lineWidth = tick % 3 === 0 ? 0.9 : 0.6;
        ctx.strokeStyle = '#2D5266';
        ctx.stroke();
      }

      // Kim chỉ tiếp tuyến luôn xoay vuông góc với vectơ bán kính về tâm Đông Sơn
      ctx.save();
      ctx.rotate(tangentAngle);
      ctx.beginPath();
      ctx.moveTo(-node.radiusPx - 3.5, 0);
      ctx.lineTo(node.radiusPx + 4.5, 0);
      ctx.lineWidth = 1.05;
      ctx.strokeStyle = '#9C7A4C';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(node.radiusPx + 4.5, 0, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#9C7A4C';
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(0, 0, 2.0, 0, Math.PI * 2);
      ctx.fillStyle = '#FAFBF9';
      ctx.fill();
    } else {
      // Nút Giao Điểm Pha Mặt Trăng (Lunar Phase Node): Trăng lưỡi liềm tối giản bằng nét khắc đồng
      ctx.beginPath();
      ctx.arc(0, 0, node.radiusPx, 0, Math.PI * 2);
      ctx.lineWidth = 0.75;
      ctx.strokeStyle = 'rgba(156, 122, 76, 0.48)';
      ctx.stroke();

      ctx.save();
      ctx.rotate(-0.45 + Math.sin(tSec * 0.25) * 0.12);
      const rCrescent = node.radiusPx * 0.74;
      ctx.beginPath();
      ctx.arc(0, 0, rCrescent, -Math.PI * 0.55, Math.PI * 0.55, false);
      ctx.arc(rCrescent * 0.46, 0, rCrescent * 0.84, Math.PI * 0.48, -Math.PI * 0.48, true);
      ctx.closePath();
      ctx.fillStyle = 'rgba(250, 251, 249, 0.76)';
      ctx.fill();
      ctx.lineWidth = 1.05;
      ctx.strokeStyle = '#9C7A4C';
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(-node.radiusPx * 0.45, 0, 1.35, 0, Math.PI * 2);
      ctx.fillStyle = '#2D5266';
      ctx.fill();
    }

    ctx.restore();
  }

  // 3. Tia tiếp tuyến mảnh mờ (rgba(156, 122, 76, 0.25)) nối vị trí chuột với nút khí cụ gần nhất khi ở gần tâm (< 260px)
  if (pointerNearDial && nearestNode) {
    ctx.save();
    ctx.strokeStyle = 'rgba(156, 122, 76, 0.25)';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.moveTo(mouse.x, mouse.y);
    ctx.lineTo(nearestNode.x, nearestNode.y);
    ctx.stroke();

    // Kéo dài nhẹ đường tiếp tuyến tại nút khí cụ
    const tx = Math.cos(nearestNode.tangentAngle) * 24;
    const ty = Math.sin(nearestNode.tangentAngle) * 24;
    ctx.setLineDash([2.5, 3.5]);
    ctx.beginPath();
    ctx.moveTo(nearestNode.x - tx, nearestNode.y - ty);
    ctx.lineTo(nearestNode.x + tx, nearestNode.y + ty);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(nearestNode.x, nearestNode.y, 2.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(156, 122, 76, 0.48)';
    ctx.fill();
    ctx.restore();
  }
}

/**
 * Vẽ đàn 4 cánh chim Lạc cách điệu theo phong cách bản vẽ trắc địa
 * dựng từ 2 cung Bézier bậc ba đối xứng sắc nét kèm đường dẫn phụ nét đứt qua đầu cánh.
 */
function drawGeometricLacBirds(
  ctx: CanvasRenderingContext2D,
  birds: readonly GeometricLacBird[],
  width: number,
  height: number,
  tSec: number,
  parallaxX: number,
  parallaxY: number,
): void {
  const samplePos = (bird: GeometricLacBird, p: number): { x: number; y: number } => {
    const nx = bird.startNx + (bird.endNx - bird.startNx) * p;
    const baseNy = bird.startNy + (bird.endNy - bird.startNy) * p;
    const waveY = Math.sin(p * Math.PI * 3 + bird.phase) * bird.waveAmpRatio;
    return {
      x: nx * width + parallaxX,
      y: (baseNy + waveY) * height + parallaxY,
    };
  };

  ctx.save();
  for (const bird of birds) {
    const progress = (bird.initialProgress + tSec * bird.speed) % 1;
    const pos = samplePos(bird, progress);
    const lookAhead = samplePos(bird, (progress + 0.004) % 1);
    const headingAngle = Math.atan2(lookAhead.y - pos.y, lookAhead.x - pos.x);
    const s = bird.scale * Math.max(0.76, Math.min(1.12, width / 1280));
    const flap = Math.sin(tSec * 2.6 + bird.phase);

    const upperTipX = -10.5 * s;
    const upperTipY = (-17.5 - flap * 4.8) * s;
    const lowerTipX = -10.5 * s;
    const lowerTipY = (17.5 - flap * 4.8) * s;

    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(headingAngle);

    // Đường dẫn hình học phụ nét đứt siêu mờ (rgba(156, 122, 76, 0.18)) nối qua đầu cánh
    ctx.save();
    ctx.setLineDash([2.5, 4]);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = 'rgba(156, 122, 76, 0.18)';
    ctx.beginPath();
    ctx.moveTo(upperTipX - 4 * s, upperTipY - 2 * s);
    ctx.quadraticCurveTo(9.5 * s, -flap * 2 * s, lowerTipX - 4 * s, lowerTipY + 2 * s);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Thân, mỏ dài và đuôi chim Lạc Đông Sơn + 2 cung Bézier bậc ba đối xứng sắc nét
    ctx.strokeStyle = 'rgba(30, 51, 46, 0.52)';
    ctx.lineWidth = 1.15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Trục thân kéo dài từ đuôi chẻ tới mỏ nhọn Đông Sơn
    ctx.beginPath();
    ctx.moveTo(-14.5 * s, -2.0 * s);
    ctx.lineTo(-9.5 * s, 0);
    ctx.lineTo(-14.5 * s, 2.0 * s);
    ctx.moveTo(-9.5 * s, 0);
    ctx.lineTo(17.5 * s, 0);
    ctx.stroke();

    // Cung cánh trên (Cubic Bézier 1)
    ctx.beginPath();
    ctx.moveTo(3.2 * s, -0.7 * s);
    ctx.bezierCurveTo(
      5.5 * s,
      (-9.2 - flap * 3.8) * s,
      -2.2 * s,
      (-18.5 - flap * 5.2) * s,
      upperTipX,
      upperTipY,
    );
    ctx.stroke();

    // Cung cánh dưới đối xứng (Cubic Bézier 2)
    ctx.beginPath();
    ctx.moveTo(3.2 * s, 0.7 * s);
    ctx.bezierCurveTo(
      5.5 * s,
      (9.2 - flap * 3.8) * s,
      -2.2 * s,
      (18.5 - flap * 5.2) * s,
      lowerTipX,
      lowerTipY,
    );
    ctx.stroke();

    ctx.restore();
  }
  ctx.restore();
}

const MOUNTAIN_PARALLAX_X = [7, 7, 12, 15, 18] as const;
const MOUNTAIN_PARALLAX_Y = [2.8, 3.2, 4.6, 5.8, 7] as const;

/** Kết xuất toàn bộ khung hình Sơn Thủy Trắc Địa Phát Sáng & Vũ Trụ Đông Sơn 120fps (< 3ms/frame) */
export function renderAtmosphereFrame(data: RenderContextData): void {
  const {
    ctx,
    width,
    height,
    tSec,
    dtSeconds,
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

  // Parallax chuột đa tầng chuẩn: bầu trời & thiên cầu ±4px, núi xa ±7px, núi trung ±12px, núi tiền cảnh & chim Lạc ±18px
  const skyParallaxX = -mouse.normX * 4;
  const skyParallaxY = -mouse.normY * 2.5 - scrollProgress * 10;
  const foregroundParallaxX = -mouse.normX * 18;
  const foregroundParallaxY = -mouse.normY * 7 - scrollProgress * 14;

  // LỚP 1: Chùm Tia Nắng Ban Mai (god-rays) & 36 Hạt Phấn Nắng Vi Mô (#FFF9EA / #D4AF6A)
  drawVolumetricGodRays(
    ctx,
    activeGeometry.astrolabe.cx + skyParallaxX,
    activeGeometry.astrolabe.cy + skyParallaxY,
    palette,
    mouse,
    width,
    height,
    tSec,
  );
  drawSunlitMotes(ctx, world.sunlitMotes, width, height, tSec, skyParallaxX, skyParallaxY);

  // LỚP 2: Đài Thiên Cầu Đông Sơn + 2 Cung Quỹ Đạo Mở Rộng & 3 Cụm Khí Cụ Neo Quỹ Đạo
  drawDongSonAstrolabe(
    ctx,
    activeGeometry,
    terrainLayers,
    activePulses,
    mouse,
    palette,
    tSec,
    skyParallaxX,
    skyParallaxY,
  );
  drawOrbitAstrolabeNodes(
    ctx,
    activeGeometry,
    world.orbitAstrolabeNodes,
    mouse,
    tSec,
    skyParallaxX,
    skyParallaxY,
  );

  // LỚP 3 & 4: 5 Tầng Núi FBM + Rim Light Nắng Mai Parallax Đa Tầng & 2 Dải Sương Thung Lũng Ngược Chiều
  for (let layerIdx = 0; layerIdx < 5; layerIdx += 1) {
    const px = -mouse.normX * (MOUNTAIN_PARALLAX_X[layerIdx] ?? 12);
    const py =
      -mouse.normY * (MOUNTAIN_PARALLAX_Y[layerIdx] ?? 4.5) - scrollProgress * (8 + layerIdx * 1.5);

    const prevSurf = terrainLayers?.prev?.mountainLayerSurfaces?.[layerIdx];
    const nextSurf = terrainLayers?.next?.mountainLayerSurfaces?.[layerIdx];
    if (prevSurf || nextSurf) {
      drawBlendedOffscreenLayer(
        ctx,
        prevSurf,
        nextSurf,
        terrainLayers?.blend ?? 1,
        -MOUNTAIN_PARALLAX_PAD_PX + px,
        py,
        width + MOUNTAIN_PARALLAX_PAD_PX * 2,
        height,
      );
    }

    if (layerIdx >= 1) {
      const localMouse: AtmosphereMouseState = {
        ...mouse,
        x: mouse.x - px,
        y: mouse.y - py,
      };
      const localPulses = activePulses.map((p) => ({
        ...p,
        x: p.x - px,
        y: p.y - py,
      }));
      ctx.save();
      ctx.translate(px, py);
      drawInteractiveMountainContours(
        ctx,
        activeGeometry,
        localMouse,
        localPulses,
        palette,
        tSec,
        layerIdx as 1 | 2 | 3 | 4,
      );
      if (layerIdx === 2) {
        drawElevationRidgelines(ctx, palette, localMouse, width, height, tSec);
      }
      ctx.restore();
    }

    // Chèn Dải Sương Thung Lũng 1 giữa tầng núi 2–3 (layerIdx === 1 -> 1-based layer 2)
    if (layerIdx === 1) {
      drawInterMountainValleyMistBand(ctx, width, height, 0, tSec, px * 0.85, py * 0.85);
    }

    // Chèn Dải Sương Thung Lũng 2 trôi ngược chiều giữa tầng núi 3–4 (layerIdx === 2 -> 1-based layer 3)
    if (layerIdx === 2) {
      drawInterMountainValleyMistBand(ctx, width, height, 1, tSec, px * 0.85, py * 0.85);
    }
  }

  // Đàn 4 Chim Lạc Bézier Tiếp Tuyến trên mặt phẳng tiền cảnh (±18px)
  drawGeometricLacBirds(
    ctx,
    world.lacBirds,
    width,
    height,
    tSec,
    foregroundParallaxX,
    foregroundParallaxY,
  );

  drawHarmonicPulseRings(ctx, activePulses);

  // LỚP 6: Dải Mặt Nước Tĩnh Mờ Sương 14% cuối Hero & 12 Vệt Caustics Khúc Xạ dưới cột sáng Thiên Cầu
  drawMistMirrorLakeAndStarlight(
    ctx,
    world,
    palette,
    sprites,
    glowSprites,
    terrainLayers,
    width,
    height,
    activeGeometry.astrolabe.cx + skyParallaxX,
    tSec,
  );
}
