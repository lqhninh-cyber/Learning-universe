import { type AtmospherePalette } from '@/components/home/atmosphereThemes';
import {
  buildHeroTerrainGeometry,
  traceSmoothQuadraticCurve,
  type HeroTerrainGeometry,
  type HeroTerrainLayerCache,
  type TerrainSurface,
} from '@/components/home/heroTerrainBuilder';
import { type GlowSpriteCache } from '@/shared/lib/canvasSprites';

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
): void {
  const lensRadius = 220;
  const hasPulses = activePulses.length > 0;
  const pulseBand = 54;

  // 1. Dòng ánh nắng nhẹ chạy dọc bậc thang (Đồng Cổ & Trắng Sứ)
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

function drawMistMirrorLakeAndStarlight(
  ctx: CanvasRenderingContext2D,
  world: AtmosphereWorld,
  _palette: AtmospherePalette,
  _sprites: AtmosphereSpriteCache,
  _glowSprites: GlowSpriteCache,
  terrainLayers: TerrainLayerTransition | undefined,
  width: number,
  height: number,
  tSec: number,
  dtScale: number,
  animate: boolean,
): void {
  const mistTop = height * 0.78;
  const mistH = height - mistTop;

  // Dải sương sáng mặt hồ tan êm không vết cắt ở đáy Hero (#B8CBC5 -> #EEF2F0 -> #F2F4F3)
  const baseGrad = ctx.createLinearGradient(0, mistTop, 0, height);
  baseGrad.addColorStop(0, 'rgba(184, 203, 197, 0)');
  baseGrad.addColorStop(0.42, 'rgba(184, 203, 197, 0.62)');
  baseGrad.addColorStop(0.76, 'rgba(238, 242, 240, 0.92)');
  baseGrad.addColorStop(1, '#EEF2F0');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, mistTop, width, mistH);

  // 3 lớp Biển Sương Ban Mai OffscreenCanvas trôi ngang êm ái
  drawVolumetricValleyMist(ctx, terrainLayers, width, height, tSec);

  // Hiệu ứng khúc xạ ánh sáng mặt nước caustics màu vàng kem mảnh (trên dải sương sáng)
  const causticTop = height * 0.84;
  const causticH = height * 0.1;
  ctx.save();
  for (let row = 0; row < 5; row += 1) {
    const rowY = causticTop + ((row + 0.5) / 5) * causticH;
    const waveSpeed = 0.42 + row * 0.11;
    const xStep = Math.max(24, Math.round(width / 42));
    ctx.beginPath();
    for (let x = 0; x <= width + xStep; x += xStep) {
      const sx = x > width ? width : x;
      const nx = sx / Math.max(width, 1);
      // Giao thoa 2 sóng caustics lệch pha tạo sợi sáng khúc xạ lượn sóng
      const w1 = Math.sin(nx * 14.5 + tSec * waveSpeed + row * 1.4) * 3.8;
      const w2 = Math.cos(nx * 23.0 - tSec * (waveSpeed * 0.75) + row * 2.1) * 2.1;
      const y = rowY + w1 + w2;
      if (x === 0) ctx.moveTo(sx, y);
      else ctx.lineTo(sx, y);
    }
    const causticGrad = ctx.createLinearGradient(0, rowY, width, rowY);
    causticGrad.addColorStop(0, 'rgba(255, 248, 224, 0)');
    causticGrad.addColorStop(0.28, 'rgba(255, 250, 232, 0.48)');
    causticGrad.addColorStop(0.66, 'rgba(234, 206, 148, 0.4)');
    causticGrad.addColorStop(1, 'rgba(255, 248, 224, 0)');
    ctx.strokeStyle = causticGrad;
    ctx.lineWidth = row % 2 === 0 ? 1.1 : 0.75;
    ctx.stroke();
  }

  // Vệt sáng caustics giao thoa ngang tinh tế trên mặt hồ sương
  ctx.lineWidth = 0.85;
  for (let i = 0; i < world.mistRipples.length; i += 1) {
    const r = world.mistRipples[i]!;
    const cx = r.nx * width + Math.sin(tSec * r.speed + r.phase) * 18;
    const cy = height * 0.85 + (r.ny - 0.76) * (height * 0.42);
    if (cy > height * 0.96) continue;
    const w = r.halfWidth * 1.15;
    const shimmer = 0.5 + 0.5 * Math.sin(tSec * (r.speed * 1.4) + r.phase);
    const isCream = i % 2 === 0;
    const rgb = isCream ? '255, 250, 232' : '214, 180, 118';
    const grad = ctx.createLinearGradient(cx - w, cy, cx + w, cy);
    grad.addColorStop(0, `rgba(${rgb}, 0)`);
    grad.addColorStop(0.5, `rgba(${rgb}, ${Math.min(0.62, r.alpha * shimmer * 1.55).toFixed(3)})`);
    grad.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.strokeStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx - w, cy);
    ctx.lineTo(cx + w, cy);
    ctx.stroke();
  }
  ctx.restore();

  // Lớp sương khóa 12% cuối cùng của Canvas tan êm từ #B8CBC5 -> #EEF2F0 -> #F2F4F3 nối liền không vết cắt
  const bottomSealTop = height * 0.88;
  const bottomSealGrad = ctx.createLinearGradient(0, bottomSealTop, 0, height);
  bottomSealGrad.addColorStop(0, 'rgba(184, 203, 197, 0)');
  bottomSealGrad.addColorStop(0.45, 'rgba(238, 242, 240, 0.84)');
  bottomSealGrad.addColorStop(1, '#EEF2F0');
  ctx.fillStyle = bottomSealGrad;
  ctx.fillRect(0, bottomSealTop, width, height - bottomSealTop);

  // Hạt bụi nắng mai nhẹ bay lên trong không khí sáng trong
  for (const mote of world.ascendingStarlights) {
    if (animate) {
      mote.ny -= (mote.vy * dtScale) / 72;
      if (mote.ny < 0.1) {
        mote.ny = 0.86 + (mote.ny % 0.1) + 0.08;
        if (mote.ny > 0.97) mote.ny = 0.92;
      }
    }

    const swirlOffsetX = Math.sin(tSec * mote.swirlFreq + mote.phase) * mote.swirlAmp;
    const sx = (mote.nx * width + swirlOffsetX + width) % width;
    const sy = mote.ny * height;
    const fadeBottom = Math.min(1, (0.98 - mote.ny) / 0.1);
    const fadeTop = Math.min(1, (mote.ny - 0.1) / 0.18);
    const alpha = Math.max(0.06, mote.alpha * fadeBottom * fadeTop * 0.55);

    ctx.fillStyle = `rgba(255, 250, 235, ${(alpha * 1.3).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, mote.radius * 1.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(166, 121, 54, ${(alpha * 0.55).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, mote.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();
  }
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
): void {
  const parallaxX = -mouse.normX * 7;
  const parallaxY = -mouse.normY * 4;

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

    // Mặt đa giác tô trong nhẹ rgba(250, 251, 249, 0.25)
    const faceAlpha = Math.min(0.42, 0.25 + boost * 0.12);
    ctx.fillStyle = `rgba(250, 251, 249, ${faceAlpha.toFixed(3)})`;
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

    // Nét khắc bản vẽ mảnh sắc nét (lineWidth: 0.85px, rgba(45, 82, 102, 0.28))
    const edgeAlpha = Math.min(0.62, 0.28 + boost * 0.28);
    ctx.strokeStyle = `rgba(45, 82, 102, ${edgeAlpha.toFixed(3)})`;
    ctx.lineWidth = 0.85 + boost * 0.35;
    ctx.beginPath();
    for (const [a, b] of poly.edges) {
      const pa = proj[a]!;
      const pb = proj[b]!;
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
    }
    ctx.stroke();

    // Đỉnh khắc đồng trầm tinh tế
    for (const pt of proj) {
      const ptAlpha = Math.min(0.75, 0.36 + pt.z * 0.14 + boost * 0.3);
      ctx.fillStyle = `rgba(148, 107, 48, ${ptAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.35 + boost * 0.55, 0, Math.PI * 2);
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

  const astrolabeParallaxX = -mouse.normX * 14;
  const astrolabeParallaxY = -mouse.normY * 8 - scrollProgress * 22;
  const mountainParallaxX = -mouse.normX * 18;
  const mountainParallaxY = -mouse.normY * 6 - scrollProgress * 12;

  // LỚP 1: 3 Khối Đa Diện Khắc Bản Vẽ 3D xoay chậm trên bầu trời sương ngọc ban mai
  drawPolyhedralConstellations3D(
    ctx,
    world.polyhedralConstellations3D,
    mouse,
    activePulses,
    width,
    height,
    tSec,
  );

  // LỚP 2: Chùm Tia Nắng Ban Mai (god-rays) + Đài Thiên Cầu Đông Sơn Khắc Vàng Cổ (72% x 33%)
  drawVolumetricGodRays(
    ctx,
    activeGeometry.astrolabe.cx + astrolabeParallaxX,
    activeGeometry.astrolabe.cy + astrolabeParallaxY,
    palette,
    mouse,
    width,
    height,
    tSec,
  );
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

  // LỚP 3 & 4: 5 Tầng Núi Sơn Thủy Sương Mù OffscreenCanvas + Lát Cắt Đồng Mức Ridgeline 3D
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

  // LỚP 5: Lát cắt địa hình Ridgeline 3D + Tương tác Chuột 220px màu Vàng Đồng (#A67936) & Sóng Trống Đồng
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
  drawElevationRidgelines(ctx, palette, localMouse, width, height, tSec);
  drawInteractiveMountainContours(ctx, activeGeometry, localMouse, localPulses, palette, tSec);
  ctx.restore();

  drawHarmonicPulseRings(ctx, activePulses);

  // LỚP 6: Dải Sương Sáng Mặt Hồ 14% cuối màn hình (#DDE7E4 -> #EDF2F0) + Gợn Caustics Vàng Kem
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
