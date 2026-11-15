import { rgbaString, type AtmospherePalette } from '@/components/home/atmosphereThemes';
import { drawGlowSprite, frameDampFactor, type GlowSpriteCache } from '@/shared/lib/canvasSprites';

export type OffscreenSurface = OffscreenCanvas | HTMLCanvasElement;

export interface AtmosphereSpriteCache {
  readonly starIvory: OffscreenSurface | null;
  readonly starSilver: OffscreenSurface | null;
  readonly starGold: OffscreenSurface | null;
  readonly cloudIvory: OffscreenSurface | null;
  readonly cloudPearl: OffscreenSurface | null;
  readonly cloudSlate: OffscreenSurface | null;
  readonly cloudRoseGold: OffscreenSurface | null;
  readonly subsurfaceAmber: OffscreenSurface | null;
  readonly waterStreak: OffscreenSurface | null;
  readonly waterfallSpray: OffscreenSurface | null;
  readonly waterfallMist: OffscreenSurface | null;
  readonly petalRose: OffscreenSurface | null;
  readonly petalGold: OffscreenSurface | null;
  readonly lanternBody: OffscreenSurface | null;
  readonly lanternHalo: OffscreenSurface | null;
}

export interface StarMote {
  readonly nx: number;
  readonly ny: number;
  readonly size: number;
  readonly baseAlpha: number;
  readonly twinkleSpeed: number;
  readonly phase: number;
  readonly tone: 'starIvory' | 'starSilver' | 'starGold';
}

export interface NovaPulse {
  active: boolean;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
}

export interface ShootingStarState {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
}

export interface WaterfallDrop {
  xOffset: number;
  yProgress: number;
  vy: number;
  vx: number;
  length: number;
  width: number;
  alpha: number;
  bounced: boolean;
}

export interface WaterfallMistPuff {
  xOffset: number;
  yOffset: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface TerraceGlint {
  readonly nx: number;
  readonly ny: number;
  readonly arcSpan: number;
  readonly phase: number;
  readonly side: 'west' | 'east';
}

export interface VolumetricCloudPuff {
  nx: number;
  ny: number;
  depth: number;
  speed: number;
  radiusX: number;
  radiusY: number;
  phase: number;
  opacity: number;
  variant: 'cloudIvory' | 'cloudPearl' | 'cloudSlate' | 'cloudRoseGold';
  dispX: number;
  dispY: number;
}

export interface SubsurfaceCloudGlowPool {
  nx: number;
  ny: number;
  speed: number;
  radius: number;
  phase: number;
}

export interface RhododendronPetal {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
  phase: number;
  tone: 'petalRose' | 'petalGold';
}

export interface ValleyFirefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
}

/** Cá thể Chim Lạc ánh sao 2 khớp nối cánh + đuôi dài */
export interface ChimLacBird {
  xRatio: number;
  yRatio: number;
  z: number;
  speedX: number;
  phase: number;
  wingSpan: number;
  prevWingY: number;
}

/** Dây đàn Cực Quang Hàm Số tương tác gảy dây */
export interface HarmonicAuroraRibbon {
  readonly id: string;
  readonly yRatio: number;
  readonly amps: readonly [number, number, number];
  readonly freqs: readonly [number, number, number];
  readonly speeds: readonly [number, number, number];
  readonly primaryColor: string;
  readonly accentColor: string;
  pluckAmplitude: number;
  pluckVelocity: number;
  pluckCenterX: number;
  pluckSigma: number;
  pluckPhase: number;
  readonly lastSamples: Float32Array;
}

/** Đèn Trời Tri Thức 3D bay lên từ thung lũng mây */
export interface SkyLantern {
  nx: number;
  ny: number;
  z: number;
  baseSpeedY: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
  boosted: boolean;
  boostFlash: number;
}

/** Hạt sáng dùng chung Object Pool cố định (không cấp phát mới trong vòng lặp 120fps) */
export interface PooledSpark {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  life: number;
  maxLife: number;
  tone: 'gold' | 'emerald';
}

export interface SparkPool {
  readonly items: PooledSpark[];
  cursor: number;
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

export interface AtmosphereWorld {
  readonly stars: readonly StarMote[];
  readonly terraceGlints: readonly TerraceGlint[];
  readonly waterfallDrops: WaterfallDrop[];
  readonly waterfallMist: WaterfallMistPuff[];
  readonly cloudPuffs: VolumetricCloudPuff[];
  readonly subsurfacePools: SubsurfaceCloudGlowPool[];
  readonly petals: RhododendronPetal[];
  readonly fireflies: ValleyFirefly[];
  readonly chimLacFlock: ChimLacBird[];
  readonly auroraRibbons: HarmonicAuroraRibbon[];
  readonly skyLanterns: SkyLantern[];
  readonly chimLacSparks: SparkPool;
  readonly auroraSparks: SparkPool;
  readonly lanternSparks: SparkPool;
  readonly novaPulses: NovaPulse[];
  novaCursor: number;
  readonly shootingStar: ShootingStarState;
  nextMeteorCountdownSec: number;
  novaSceneBoost: number;
  compassRotationRad: number;
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
}

interface CrepuscularRaySpec {
  readonly angleDeg: number;
  readonly spreadDeg: number;
  readonly lengthRatio: number;
  readonly intensity: number;
  readonly warm: boolean;
}

const CREPUSCULAR_RAYS: readonly CrepuscularRaySpec[] = [
  { angleDeg: -138, spreadDeg: 14.5, lengthRatio: 0.72, intensity: 0.038, warm: false },
  { angleDeg: -116, spreadDeg: 17.5, lengthRatio: 0.78, intensity: 0.048, warm: true },
  { angleDeg: -92, spreadDeg: 16.0, lengthRatio: 0.82, intensity: 0.042, warm: false },
  { angleDeg: -64, spreadDeg: 19.5, lengthRatio: 0.76, intensity: 0.054, warm: true },
  { angleDeg: -38, spreadDeg: 15.5, lengthRatio: 0.7, intensity: 0.04, warm: false },
  { angleDeg: 32, spreadDeg: 21.0, lengthRatio: 0.58, intensity: 0.036, warm: true },
  { angleDeg: 62, spreadDeg: 22.5, lengthRatio: 0.62, intensity: 0.046, warm: true },
  { angleDeg: 102, spreadDeg: 18.0, lengthRatio: 0.58, intensity: 0.034, warm: false },
];

const AURORA_SAMPLE_COUNT = 56;
const WATERFALL_ANCHOR_NX = 0.488;
const WATERFALL_TOP_NY = 0.496;
const WATERFALL_BOTTOM_NY = 0.696;

function makeSurface(w: number, h: number): OffscreenSurface | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      return new OffscreenCanvas(w, h);
    } catch {
      // Fallback HTMLCanvasElement
    }
  }
  if (typeof document !== 'undefined') {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }
  return null;
}

function getSurface2d(
  surface: OffscreenSurface | null,
): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null {
  if (!surface) return null;
  try {
    return surface.getContext('2d') as
      CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  } catch {
    return null;
  }
}

function buildRadialSprite(
  w: number,
  h: number,
  stops: readonly (readonly [number, string])[],
): OffscreenSurface | null {
  const surface = makeSurface(w, h);
  const ctx = getSurface2d(surface);
  if (!surface || !ctx || typeof ctx.createRadialGradient !== 'function') return null;

  const cx = w / 2;
  const cy = h / 2;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cx, cy));
  for (const [offset, color] of stops) {
    grad.addColorStop(offset, color);
  }
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1, h / w);
  ctx.translate(-cx, -cy);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, cx, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  return surface;
}

function buildWaterStreakSprite(): OffscreenSurface | null {
  const w = 16;
  const h = 48;
  const surface = makeSurface(w, h);
  const ctx = getSurface2d(surface);
  if (!surface || !ctx || typeof ctx.createLinearGradient !== 'function') return null;

  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
  grad.addColorStop(0.28, 'rgba(220, 238, 250, 0.85)');
  grad.addColorStop(0.65, 'rgba(248, 251, 255, 0.96)');
  grad.addColorStop(1, 'rgba(200, 224, 240, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, 3.2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
  return surface;
}

function buildPetalSprite(tone: 'rose' | 'gold'): OffscreenSurface | null {
  const size = 40;
  const surface = makeSurface(size, size);
  const ctx = getSurface2d(surface);
  if (!surface || !ctx || typeof ctx.createRadialGradient !== 'function') return null;

  const half = size / 2;
  const halo = ctx.createRadialGradient(half, half, 2, half, half, half);
  if (tone === 'rose') {
    halo.addColorStop(0, 'rgba(249, 198, 212, 0.42)');
    halo.addColorStop(0.55, 'rgba(244, 167, 185, 0.16)');
    halo.addColorStop(1, 'rgba(244, 167, 185, 0)');
  } else {
    halo.addColorStop(0, 'rgba(255, 244, 206, 0.45)');
    halo.addColorStop(0.55, 'rgba(243, 201, 120, 0.18)');
    halo.addColorStop(1, 'rgba(243, 201, 120, 0)');
  }
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);

  const petalGrad = ctx.createLinearGradient(half - 8, half - 8, half + 8, half + 8);
  if (tone === 'rose') {
    petalGrad.addColorStop(0, '#FDE7EE');
    petalGrad.addColorStop(0.55, '#F4A7B9');
    petalGrad.addColorStop(1, '#D87590');
  } else {
    petalGrad.addColorStop(0, '#FFF8DF');
    petalGrad.addColorStop(0.55, '#F5CE7E');
    petalGrad.addColorStop(1, '#D69E4E');
  }

  ctx.fillStyle = petalGrad;
  ctx.beginPath();
  ctx.moveTo(half, half - 10);
  ctx.bezierCurveTo(half + 9, half - 6, half + 8, half + 5, half, half + 9);
  ctx.bezierCurveTo(half - 8, half + 5, half - 9, half - 6, half, half - 10);
  ctx.fill();

  return surface;
}

function buildSkyLanternBodySprite(): OffscreenSurface | null {
  const w = 48;
  const h = 64;
  const surface = makeSurface(w, h);
  const ctx = getSurface2d(surface);
  if (!surface || !ctx || typeof ctx.createLinearGradient !== 'function') return null;

  const bodyGrad = ctx.createLinearGradient(w / 2, 10, w / 2, 50);
  bodyGrad.addColorStop(0, '#FFF2CC');
  bodyGrad.addColorStop(0.35, '#FFD166');
  bodyGrad.addColorStop(0.8, '#FF9F43');
  bodyGrad.addColorStop(1, '#D95F28');

  // Lồng đèn giấy dó thon bầu
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(15, 11);
  ctx.quadraticCurveTo(24, 7, 33, 11);
  ctx.quadraticCurveTo(39, 26, 30, 48);
  ctx.lineTo(18, 48);
  ctx.quadraticCurveTo(9, 26, 15, 11);
  ctx.closePath();
  ctx.fill();

  // Viền vành đèn tre mảnh
  ctx.strokeStyle = 'rgba(255, 240, 196, 0.72)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Ngọn lửa tim đèn vàng trắng sáng ấm dưới đáy lồng
  const flame = ctx.createRadialGradient(24, 46, 0, 24, 46, 10);
  flame.addColorStop(0, 'rgba(255, 255, 245, 1)');
  flame.addColorStop(0.45, 'rgba(255, 209, 102, 0.85)');
  flame.addColorStop(1, 'rgba(255, 159, 67, 0)');
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.arc(24, 46, 10, 0, Math.PI * 2);
  ctx.fill();

  return surface;
}

/**
 * Khởi tạo toàn bộ Sprite Cache vào OffscreenCanvas đúng 1 lần (0 shadowBlur trong vòng lặp).
 */
export function buildAtmosphereSpriteCache(): AtmosphereSpriteCache {
  return {
    starIvory: buildRadialSprite(32, 32, [
      [0, 'rgba(255, 253, 247, 1)'],
      [0.24, 'rgba(248, 246, 240, 0.72)'],
      [0.62, 'rgba(197, 211, 220, 0.22)'],
      [1, 'rgba(197, 211, 220, 0)'],
    ]),
    starSilver: buildRadialSprite(32, 32, [
      [0, 'rgba(226, 240, 255, 0.98)'],
      [0.28, 'rgba(148, 179, 200, 0.62)'],
      [0.66, 'rgba(92, 130, 166, 0.18)'],
      [1, 'rgba(92, 130, 166, 0)'],
    ]),
    starGold: buildRadialSprite(32, 32, [
      [0, 'rgba(255, 248, 225, 1)'],
      [0.28, 'rgba(243, 201, 120, 0.7)'],
      [0.64, 'rgba(229, 184, 105, 0.24)'],
      [1, 'rgba(229, 184, 105, 0)'],
    ]),
    cloudIvory: buildRadialSprite(128, 84, [
      [0, 'rgba(251, 249, 242, 0.86)'],
      [0.44, 'rgba(251, 249, 242, 0.5)'],
      [0.78, 'rgba(235, 240, 244, 0.18)'],
      [1, 'rgba(251, 249, 242, 0)'],
    ]),
    cloudPearl: buildRadialSprite(128, 84, [
      [0, 'rgba(242, 245, 248, 0.78)'],
      [0.45, 'rgba(218, 226, 234, 0.42)'],
      [0.8, 'rgba(143, 166, 184, 0.14)'],
      [1, 'rgba(218, 226, 234, 0)'],
    ]),
    cloudSlate: buildRadialSprite(128, 84, [
      [0, 'rgba(143, 166, 184, 0.68)'],
      [0.46, 'rgba(116, 142, 166, 0.36)'],
      [0.82, 'rgba(62, 92, 120, 0.1)'],
      [1, 'rgba(143, 166, 184, 0)'],
    ]),
    cloudRoseGold: buildRadialSprite(128, 84, [
      [0, 'rgba(232, 197, 148, 0.72)'],
      [0.42, 'rgba(229, 184, 105, 0.38)'],
      [0.8, 'rgba(143, 166, 184, 0.12)'],
      [1, 'rgba(232, 197, 148, 0)'],
    ]),
    subsurfaceAmber: buildRadialSprite(128, 96, [
      [0, 'rgba(255, 209, 102, 0.65)'],
      [0.38, 'rgba(255, 159, 67, 0.34)'],
      [0.78, 'rgba(232, 197, 148, 0.1)'],
      [1, 'rgba(255, 159, 67, 0)'],
    ]),
    waterStreak: buildWaterStreakSprite(),
    waterfallSpray: buildRadialSprite(16, 16, [
      [0, 'rgba(255, 255, 255, 0.94)'],
      [0.42, 'rgba(218, 238, 252, 0.54)'],
      [1, 'rgba(200, 224, 240, 0)'],
    ]),
    waterfallMist: buildRadialSprite(64, 64, [
      [0, 'rgba(248, 251, 255, 0.78)'],
      [0.38, 'rgba(182, 212, 235, 0.4)'],
      [0.78, 'rgba(143, 166, 184, 0.12)'],
      [1, 'rgba(143, 166, 184, 0)'],
    ]),
    petalRose: buildPetalSprite('rose'),
    petalGold: buildPetalSprite('gold'),
    lanternBody: buildSkyLanternBodySprite(),
    lanternHalo: buildRadialSprite(96, 96, [
      [0, 'rgba(255, 224, 140, 0.9)'],
      [0.34, 'rgba(255, 159, 67, 0.48)'],
      [0.72, 'rgba(255, 159, 67, 0.14)'],
      [1, 'rgba(255, 159, 67, 0)'],
    ]),
  };
}

function deterministicUnit(seed: number): number {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
}

function createSparkPool(capacity: number): SparkPool {
  const items: PooledSpark[] = [];
  for (let i = 0; i < capacity; i += 1) {
    items.push({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 4,
      life: 0,
      maxLife: 1,
      tone: 'gold',
    });
  }
  return { items, cursor: 0 };
}

function spawnSparkFromPool(
  pool: SparkPool,
  x: number,
  y: number,
  vx: number,
  vy: number,
  radius: number,
  maxLife: number,
  tone: 'gold' | 'emerald',
): void {
  const slot = pool.items[pool.cursor];
  pool.cursor = (pool.cursor + 1) % pool.items.length;
  if (!slot) return;
  slot.active = true;
  slot.x = x;
  slot.y = y;
  slot.vx = vx;
  slot.vy = vy;
  slot.radius = radius;
  slot.life = 0;
  slot.maxLife = maxLife;
  slot.tone = tone;
}

export function createAtmosphereWorld(width: number, height: number): AtmosphereWorld {
  const stars: StarMote[] = [];
  const starCount = 240;
  for (let i = 0; i < starCount; i += 1) {
    const r1 = deterministicUnit(i + 1);
    const r2 = deterministicUnit(i * 3 + 7);
    const r3 = deterministicUnit(i * 5 + 19);
    const r4 = deterministicUnit(i * 7 + 31);
    const inMilkyWay = i < Math.floor(starCount * 0.66);

    let nx: number;
    let ny: number;
    if (inMilkyWay) {
      const t = r1;
      const spread = (r2 + r3 - 1) * 0.145;
      nx = Math.min(Math.max(0.03 + t * 0.92 + spread * 0.28, 0.01), 0.99);
      ny = Math.min(Math.max(0.04 + t * 0.41 + spread, 0.02), 0.56);
    } else {
      nx = r1 * 0.98 + 0.01;
      ny = r2 * 0.56 + 0.02;
    }

    const tone: StarMote['tone'] = r4 > 0.78 ? 'starGold' : r4 > 0.4 ? 'starSilver' : 'starIvory';
    stars.push({
      nx,
      ny,
      size: inMilkyWay ? 2.1 + r3 * 4.2 : 2.5 + r3 * 5.2,
      baseAlpha: inMilkyWay ? 0.34 + r4 * 0.6 : 0.28 + r4 * 0.52,
      twinkleSpeed: 0.9 + r2 * 2.1,
      phase: r3 * Math.PI * 2,
      tone,
    });
  }

  const terraceGlints: TerraceGlint[] = [];
  for (let i = 0; i < 42; i += 1) {
    const isWest = i < 21;
    const t = (i % 21) / 20;
    const tier = i % 3;
    terraceGlints.push({
      nx: isWest ? 0.02 + t * 0.33 : 0.63 + t * 0.35,
      ny: (isWest ? 0.655 : 0.652) + tier * 0.025 + Math.sin(t * 4.2) * 0.012,
      arcSpan: 14 + (i % 4) * 5,
      phase: i * 0.7,
      side: isWest ? 'west' : 'east',
    });
  }

  const waterfallDrops: WaterfallDrop[] = [];
  for (let i = 0; i < 140; i += 1) {
    const r1 = deterministicUnit(i + 401);
    const r2 = deterministicUnit(i + 503);
    waterfallDrops.push({
      xOffset: (r1 - 0.5) * 18,
      yProgress: r2,
      vy: 1.3 + r1 * 1.1,
      vx: (r2 - 0.5) * 0.16,
      length: 10 + r1 * 16,
      width: 1.8 + r2 * 2.4,
      alpha: 0.36 + r1 * 0.48,
      bounced: r2 > 0.34,
    });
  }

  const waterfallMist: WaterfallMistPuff[] = [];
  for (let i = 0; i < 24; i += 1) {
    const r1 = deterministicUnit(i + 601);
    const r2 = deterministicUnit(i + 703);
    waterfallMist.push({
      xOffset: (r1 - 0.5) * 52,
      yOffset: (r2 - 0.5) * 14,
      vx: (r1 - 0.5) * 0.42,
      vy: -(0.14 + r2 * 0.2),
      radius: 22 + r1 * 28,
      alpha: 0.45,
      life: r2 * 2.4,
      maxLife: 2.2 + r1 * 1.1,
    });
  }

  const variants: readonly VolumetricCloudPuff['variant'][] = [
    'cloudSlate',
    'cloudRoseGold',
    'cloudPearl',
    'cloudIvory',
  ];
  const cloudPuffs: VolumetricCloudPuff[] = [];
  const puffCount = 64;
  for (let i = 0; i < puffCount; i += 1) {
    const depthIdx = Math.floor((i / puffCount) * 4);
    const depth = (depthIdx + 1) / 4;
    const r1 = deterministicUnit(i + 809);
    const r2 = deterministicUnit(i + 907);
    const r3 = deterministicUnit(i + 1009);
    cloudPuffs.push({
      nx: ((i % 16) / 15) * 1.16 - 0.08 + (r1 - 0.5) * 0.05,
      ny: 0.675 + depthIdx * 0.075 + (r2 - 0.5) * 0.026,
      depth,
      speed: (depthIdx % 2 === 0 ? 1 : -1) * (0.008 + depth * 0.013),
      radiusX: 98 + r1 * 68 + depth * 36,
      radiusY: 56 + r2 * 30 + depth * 18,
      phase: r3 * Math.PI * 2,
      opacity: 0.36 + depth * 0.42,
      variant: variants[depthIdx] ?? 'cloudIvory',
      dispX: 0,
      dispY: 0,
    });
  }

  const subsurfacePools: SubsurfaceCloudGlowPool[] = [
    { nx: 0.22, ny: 0.77, speed: 0.015, radius: 190, phase: 0.2 },
    { nx: 0.55, ny: 0.75, speed: -0.012, radius: 220, phase: 2.1 },
    { nx: 0.84, ny: 0.81, speed: 0.018, radius: 185, phase: 4.3 },
  ];

  const petals: RhododendronPetal[] = [];
  for (let i = 0; i < 26; i += 1) {
    const r1 = deterministicUnit(i + 1103);
    const r2 = deterministicUnit(i + 1201);
    const r3 = deterministicUnit(i + 1301);
    const z = 0.4 + r3 * 0.95;
    petals.push({
      x: r1 * width,
      y: height * (0.14 + r2 * 0.74),
      z,
      vx: (0.42 + r1 * 0.65) * (0.65 + z * 0.45),
      vy: 0.14 + r2 * 0.26,
      rx: r1 * Math.PI * 2,
      ry: r2 * Math.PI * 2,
      rz: r3 * Math.PI * 2,
      vrx: 1.4 + r1 * 1.8,
      vry: 1.1 + r2 * 1.6,
      vrz: 0.9 + r3 * 1.5,
      phase: r2 * Math.PI * 2,
      tone: i % 3 === 0 ? 'petalGold' : 'petalRose',
    });
  }

  const fireflies: ValleyFirefly[] = [];
  for (let i = 0; i < 22; i += 1) {
    const r1 = deterministicUnit(i + 1409);
    const r2 = deterministicUnit(i + 1511);
    const r3 = deterministicUnit(i + 1601);
    fireflies.push({
      x: r1 * width,
      y: height * (0.58 + r2 * 0.28),
      vx: (r3 - 0.5) * 0.26,
      vy: -(0.14 + r2 * 0.24),
      radius: 2 + r3 * 2.4,
      alpha: 0.34 + r1 * 0.48,
      phase: r2 * Math.PI * 2,
    });
  }

  // 4 Chim Lạc ánh sao bay đội hình cung tên
  const chimLacFlock: ChimLacBird[] = [
    { xRatio: 0.22, yRatio: 0.26, z: 1.0, speedX: 0.026, phase: 0, wingSpan: 34, prevWingY: 0 },
    {
      xRatio: 0.175,
      yRatio: 0.23,
      z: 0.86,
      speedX: 0.026,
      phase: 0.55,
      wingSpan: 28,
      prevWingY: 0,
    },
    {
      xRatio: 0.172,
      yRatio: 0.295,
      z: 0.82,
      speedX: 0.026,
      phase: 1.1,
      wingSpan: 27,
      prevWingY: 0,
    },
    {
      xRatio: 0.128,
      yRatio: 0.205,
      z: 0.72,
      speedX: 0.026,
      phase: 1.65,
      wingSpan: 23,
      prevWingY: 0,
    },
  ];

  // 2 Dải Lụa Cực Quang Hàm Số tương tác gảy dây
  const auroraRibbons: HarmonicAuroraRibbon[] = [
    {
      id: 'aurora-emerald',
      yRatio: 0.19,
      amps: [20, 11, 6],
      freqs: [0.0052, 0.0115, 0.019],
      speeds: [0.75, -1.05, 1.4],
      primaryColor: '#34D399',
      accentColor: '#FBBF24',
      pluckAmplitude: 0,
      pluckVelocity: 0,
      pluckCenterX: width * 0.5,
      pluckSigma: 130,
      pluckPhase: 0,
      lastSamples: new Float32Array(AURORA_SAMPLE_COUNT),
    },
    {
      id: 'aurora-gold',
      yRatio: 0.255,
      amps: [17, 10, 5],
      freqs: [0.0046, 0.0102, 0.0175],
      speeds: [-0.68, 0.96, -1.25],
      primaryColor: '#FBBF24',
      accentColor: '#34D399',
      pluckAmplitude: 0,
      pluckVelocity: 0,
      pluckCenterX: width * 0.5,
      pluckSigma: 135,
      pluckPhase: 0,
      lastSamples: new Float32Array(AURORA_SAMPLE_COUNT),
    },
  ];

  // 10 Đèn Trời Tri Thức 3D (z ∈ [0.2, 0.9]) bay lên từ khe núi & tầng biển mây
  const skyLanterns: SkyLantern[] = [];
  for (let i = 0; i < 10; i += 1) {
    const r1 = deterministicUnit(i + 1709);
    const r2 = deterministicUnit(i + 1811);
    const r3 = deterministicUnit(i + 1901);
    skyLanterns.push({
      nx: 0.14 + (i / 10) * 0.72 + (r1 - 0.5) * 0.06,
      ny: 0.24 + r2 * 0.56,
      z: 0.22 + r3 * 0.68,
      baseSpeedY: 0.022 + r2 * 0.018,
      swayAmp: 0.008 + r1 * 0.009,
      swayFreq: 0.7 + r3 * 0.6,
      phase: r2 * Math.PI * 2,
      boosted: false,
      boostFlash: 0,
    });
  }

  const novaPulses: NovaPulse[] = [];
  for (let i = 0; i < 6; i += 1) {
    novaPulses.push({
      active: false,
      x: 0,
      y: 0,
      radius: 0,
      maxRadius: 300,
      alpha: 0,
      speed: 4,
    });
  }

  return {
    stars,
    terraceGlints,
    waterfallDrops,
    waterfallMist,
    cloudPuffs,
    subsurfacePools,
    petals,
    fireflies,
    chimLacFlock,
    auroraRibbons,
    skyLanterns,
    chimLacSparks: createSparkPool(140),
    auroraSparks: createSparkPool(80),
    lanternSparks: createSparkPool(90),
    novaPulses,
    novaCursor: 0,
    shootingStar: {
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      length: 120,
      life: 0,
      maxLife: 1,
    },
    nextMeteorCountdownSec: 1.5,
    novaSceneBoost: 0,
    compassRotationRad: 0,
  };
}

/** Kích hoạt xung Celestial Nova Pulse từ Object Pool */
export function spawnNovaPulse(
  world: AtmosphereWorld,
  x: number,
  y: number,
  maxRadius: number,
  alpha: number,
  speed: number,
): void {
  const slot = world.novaPulses[world.novaCursor];
  world.novaCursor = (world.novaCursor + 1) % world.novaPulses.length;
  if (!slot) return;
  slot.active = true;
  slot.x = x;
  slot.y = y;
  slot.radius = 10;
  slot.maxRadius = maxRadius;
  slot.alpha = alpha;
  slot.speed = speed;
}

/** Gảy dải lụa cực quang nếu con trỏ lướt cắt qua dây sóng */
export function triggerAuroraPluck(
  world: AtmosphereWorld,
  mouseX: number,
  mouseY: number,
  mouseVy: number,
  width: number,
): void {
  if (Math.abs(mouseVy) < 1.2) return;
  const normIdx = Math.min(
    AURORA_SAMPLE_COUNT - 1,
    Math.max(0, Math.round((mouseX / Math.max(width, 1)) * (AURORA_SAMPLE_COUNT - 1))),
  );

  for (const ribbon of world.auroraRibbons) {
    const ribbonY = ribbon.lastSamples[normIdx] ?? 0;
    if (ribbonY > 0 && Math.abs(mouseY - ribbonY) < 34) {
      const clampedVel = Math.max(-42, Math.min(42, mouseVy * 3.4));
      ribbon.pluckVelocity = clampedVel;
      ribbon.pluckAmplitude = Math.max(
        -36,
        Math.min(36, ribbon.pluckAmplitude + clampedVel * 0.45),
      );
      ribbon.pluckCenterX = mouseX;
      ribbon.pluckPhase = 0;

      for (let k = 0; k < 6; k += 1) {
        const offsetX = (k - 2.5) * 14;
        spawnSparkFromPool(
          world.auroraSparks,
          mouseX + offsetX,
          ribbonY,
          offsetX * 0.04,
          (k % 2 === 0 ? -1 : 1) * (0.5 + (k % 3) * 0.35),
          4.5,
          0.95,
          k % 2 === 0 ? 'emerald' : 'gold',
        );
      }
    }
  }
}

/** Kiểm tra click trực tiếp vào Đèn Trời để thắp sáng rực rỡ & bay vút lên Ngân Hà */
export function tryBoostSkyLanternAt(
  world: AtmosphereWorld,
  clickX: number,
  clickY: number,
  width: number,
  height: number,
): boolean {
  for (const lantern of world.skyLanterns) {
    const altScale = Math.max(0.54, 1 - (0.78 - lantern.ny) * 0.48);
    const scale = (0.45 + lantern.z * 0.72) * altScale;
    const lx = lantern.nx * width;
    const ly = lantern.ny * height;
    const hitRadius = 26 + scale * 18;

    if (Math.hypot(clickX - lx, clickY - ly) <= hitRadius) {
      lantern.boosted = true;
      lantern.boostFlash = 1.0;

      for (let k = 0; k < 10; k += 1) {
        const a = (k / 10) * Math.PI * 2;
        spawnSparkFromPool(
          world.lanternSparks,
          lx,
          ly,
          Math.cos(a) * 1.4,
          Math.sin(a) * 1.4 - 0.6,
          5.5,
          1.1,
          'gold',
        );
      }
      return true;
    }
  }
  return false;
}

function updateAndDrawSparkPool(
  ctx: CanvasRenderingContext2D,
  pool: SparkPool,
  glowSprites: GlowSpriteCache,
  dtScale: number,
  dtSeconds: number,
  animate: boolean,
): void {
  for (const s of pool.items) {
    if (!s.active) continue;
    if (animate) {
      s.life += dtSeconds;
      if (s.life >= s.maxLife) {
        s.active = false;
        continue;
      }
      s.x += s.vx * dtScale;
      s.y += s.vy * dtScale;
    }
    const alpha = Math.max(0, 1 - s.life / s.maxLife);
    const sprite = s.tone === 'emerald' ? glowSprites.emerald : glowSprites.gold;
    drawGlowSprite(
      ctx,
      sprite,
      s.x,
      s.y,
      s.radius * (0.75 + alpha * 0.45),
      alpha * 0.88,
      s.tone === 'emerald' ? '#34D399' : '#F3C978',
    );
  }
}

function renderDongSonCompassAndMilkyWay(data: RenderContextData): void {
  const { ctx, width, height, tSec, dtSeconds, animate, palette, world } = data;
  const mwIntensity = palette.milkyWayIntensity;

  if (mwIntensity > 0.04) {
    ctx.save();
    ctx.translate(width * 0.46, height * 0.24);
    ctx.rotate(0.41);
    const pulse = 0.92 + Math.sin(tSec * 0.35) * 0.08;
    const bandGrad = ctx.createRadialGradient(0, 0, width * 0.04, 0, 0, width * 0.56);
    bandGrad.addColorStop(0, `rgba(92, 130, 166, ${(0.2 * pulse * mwIntensity).toFixed(3)})`);
    bandGrad.addColorStop(0.38, `rgba(148, 196, 236, ${(0.12 * pulse * mwIntensity).toFixed(3)})`);
    bandGrad.addColorStop(0.68, `rgba(229, 184, 105, ${(0.07 * pulse * mwIntensity).toFixed(3)})`);
    bandGrad.addColorStop(1, 'rgba(11, 25, 44, 0)');
    ctx.scale(1.65, 0.34);
    ctx.fillStyle = bandGrad;
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.56, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (animate) {
    world.compassRotationRad = (world.compassRotationRad + dtSeconds * 0.025) % (Math.PI * 2);
  }
  const polarisX = width * 0.48;
  const polarisY = height * 0.175;
  const baseRadius = Math.max(120, Math.min(width * 0.17, height * 0.25));

  ctx.save();
  ctx.translate(polarisX, polarisY);
  ctx.rotate(world.compassRotationRad);
  ctx.strokeStyle = rgbaString(palette.rimGlow, 0.12);
  ctx.lineWidth = 0.85;

  for (const rMul of [0.38, 0.7, 1.0]) {
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * rMul, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.beginPath();
  for (let k = 0; k < 16; k += 1) {
    const a = (k / 16) * Math.PI * 2;
    const innerR = k % 2 === 0 ? baseRadius * 0.16 : baseRadius * 0.44;
    const outerR = k % 2 === 0 ? baseRadius * 1.12 : baseRadius * 0.92;
    ctx.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
    ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
  }
  ctx.stroke();
  ctx.restore();
}

function renderDynamicCrepuscularRays(data: RenderContextData): void {
  const { ctx, width, height, tSec, mouse, palette, world } = data;
  const pivotX = width * (0.6 - mouse.normX * 0.065);
  const pivotY = height * (0.36 - mouse.normY * 0.04);
  const tiltShiftDeg = -mouse.normX * 10;
  const mouseGlowFactor = mouse.active ? 1.12 : 1;
  const novaMul = 1 + world.novaSceneBoost * 0.35;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Quầng tán xạ bầu khí quyển tỏa rộng mềm mại phía sau đỉnh Hoàng Liên Sơn (tối đa alpha 0.10)
  const scatterRadius = Math.max(width, height) * 0.56;
  const scatterGrad = ctx.createRadialGradient(pivotX, pivotY, 0, pivotX, pivotY, scatterRadius);
  scatterGrad.addColorStop(0, rgbaString(palette.rayWarm, 0.085));
  scatterGrad.addColorStop(0.42, rgbaString(palette.rayCool, 0.038));
  scatterGrad.addColorStop(1, rgbaString(palette.rayCool, 0));
  ctx.fillStyle = scatterGrad;
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, scatterRadius, 0, Math.PI * 2);
  ctx.fill();

  for (let i = 0; i < CREPUSCULAR_RAYS.length; i += 1) {
    const ray = CREPUSCULAR_RAYS[i];
    if (!ray) continue;

    const theta = ((ray.angleDeg + tiltShiftDeg) * Math.PI) / 180;
    const halfSpread = (ray.spreadDeg * Math.PI) / 180;
    const rayLen = Math.max(width, height) * ray.lengthRatio;

    const endX1 = pivotX + Math.cos(theta - halfSpread) * rayLen;
    const endY1 = pivotY + Math.sin(theta - halfSpread) * rayLen;
    const endX2 = pivotX + Math.cos(theta + halfSpread) * rayLen;
    const endY2 = pivotY + Math.sin(theta + halfSpread) * rayLen;
    const midEndX = (endX1 + endX2) / 2;
    const midEndY = (endY1 + endY2) / 2;

    const shimmer = 0.82 + 0.18 * Math.sin(tSec * 0.55 + i * 1.1);
    const alpha = Math.min(
      0.1,
      ray.intensity * shimmer * mouseGlowFactor * novaMul * palette.rayIntensity,
    );

    const rayGrad = ctx.createLinearGradient(pivotX, pivotY, midEndX, midEndY);
    const tint = ray.warm ? palette.rayWarm : palette.rayCool;
    rayGrad.addColorStop(0, rgbaString(tint, alpha));
    rayGrad.addColorStop(0.38, rgbaString(tint, alpha * 0.42));
    rayGrad.addColorStop(0.76, rgbaString(tint, alpha * 0.1));
    rayGrad.addColorStop(1, rgbaString(tint, 0));

    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(endX1, endY1);
    ctx.lineTo(endX2, endY2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function renderHarmonicSilkAuroras(data: RenderContextData): void {
  const { ctx, width, height, tSec, dtSeconds, dtScale, animate, world, glowSprites, palette } =
    data;
  const auroraVis = 0.38 + palette.starIntensity * 0.62;
  const stepX = width / (AURORA_SAMPLE_COUNT - 1);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (const ribbon of world.auroraRibbons) {
    if (
      animate &&
      (Math.abs(ribbon.pluckAmplitude) > 0.05 || Math.abs(ribbon.pluckVelocity) > 0.05)
    ) {
      ribbon.pluckPhase += dtSeconds * 16;
      const damp = Math.exp(-3.1 * dtSeconds);
      ribbon.pluckAmplitude =
        (ribbon.pluckAmplitude + ribbon.pluckVelocity * dtSeconds * 2.4) * damp;
      ribbon.pluckVelocity *= damp;
    }

    const baseY = height * ribbon.yRatio;
    const sigmaSq2 = 2 * ribbon.pluckSigma * ribbon.pluckSigma;

    for (let i = 0; i < AURORA_SAMPLE_COUNT; i += 1) {
      const x = i * stepX;
      const harmonic =
        ribbon.amps[0] * Math.sin(ribbon.freqs[0] * x + ribbon.speeds[0] * tSec) +
        ribbon.amps[1] * Math.sin(ribbon.freqs[1] * x + ribbon.speeds[1] * tSec) +
        ribbon.amps[2] * Math.sin(ribbon.freqs[2] * x + ribbon.speeds[2] * tSec);
      const dx = x - ribbon.pluckCenterX;
      const pluckOffset =
        ribbon.pluckAmplitude * Math.exp(-(dx * dx) / sigmaSq2) * Math.cos(ribbon.pluckPhase);
      ribbon.lastSamples[i] = baseY + harmonic + pluckOffset;
    }

    const grad = ctx.createLinearGradient(0, baseY - 26, width, baseY + 26);
    grad.addColorStop(0, 'rgba(52, 211, 153, 0)');
    grad.addColorStop(0.24, ribbon.primaryColor);
    grad.addColorStop(0.56, ribbon.accentColor);
    grad.addColorStop(0.84, ribbon.primaryColor);
    grad.addColorStop(1, 'rgba(251, 191, 36, 0)');

    const drawPass = (lineWidth: number, alpha: number) => {
      ctx.beginPath();
      for (let i = 0; i < AURORA_SAMPLE_COUNT; i += 1) {
        const x = i * stepX;
        const y = ribbon.lastSamples[i] ?? baseY;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          const prevX = (i - 1) * stepX;
          const prevY = ribbon.lastSamples[i - 1] ?? baseY;
          ctx.quadraticCurveTo(prevX, prevY, (prevX + x) * 0.5, (prevY + y) * 0.5);
        }
      }
      ctx.globalAlpha = alpha * auroraVis;
      ctx.strokeStyle = grad;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    drawPass(14, 0.14);
    drawPass(4.2, 0.28);
    drawPass(1.3, 0.52);
  }

  ctx.restore();

  updateAndDrawSparkPool(ctx, world.auroraSparks, glowSprites, dtScale, dtSeconds, animate);
}

function renderStarMeshAndNovas(data: RenderContextData): void {
  const {
    ctx,
    width,
    height,
    tSec,
    dtSeconds,
    dtScale,
    animate,
    palette,
    sprites,
    glowSprites,
    mouse,
    world,
  } = data;

  const starVis = palette.starIntensity;
  const skyMouseActive = animate && mouse.active && mouse.y < height * 0.66;
  const proxyRadius = 160;
  const nearStars: { x: number; y: number; distRatio: number }[] = [];

  for (const star of world.stars) {
    const sx = star.nx * width;
    const sy = star.ny * height;
    const twinkle = 0.56 + 0.44 * Math.sin(tSec * star.twinkleSpeed + star.phase);
    let alpha = star.baseAlpha * twinkle * starVis;
    let drawSize = star.size * 2.35;

    for (const np of world.novaPulses) {
      if (!np.active) continue;
      const ringDelta = Math.abs(Math.hypot(sx - np.x, sy - np.y) - np.radius);
      if (ringDelta < 52) {
        const boost = (1 - ringDelta / 52) * np.alpha;
        alpha = Math.min(1, alpha + boost * 0.72);
        drawSize += boost * 4.2;
      }
    }

    if (skyMouseActive) {
      const dist = Math.hypot(mouse.x - sx, mouse.y - sy);
      if (dist <= proxyRadius) {
        const ratio = 1 - dist / proxyRadius;
        alpha = Math.min(1, alpha + ratio * (0.35 + starVis * 0.35));
        drawSize += ratio * 3.8;
        if (nearStars.length < 20) {
          nearStars.push({ x: sx, y: sy, distRatio: ratio });
        }
      }
    }

    if (alpha <= 0.04) continue;
    const sprite = sprites[star.tone];
    if (sprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(1, alpha);
      ctx.drawImage(sprite, sx - drawSize / 2, sy - drawSize / 2, drawSize, drawSize);
      ctx.globalAlpha = prevAlpha;
    } else {
      ctx.fillStyle = `rgba(248, 246, 240, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (nearStars.length > 1) {
    const linkMaxDist = 112;
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < nearStars.length; i += 1) {
      const a = nearStars[i];
      if (!a) continue;
      for (let j = i + 1; j < nearStars.length; j += 1) {
        const b = nearStars[j];
        if (!b) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d <= linkMaxDist) {
          const edgeAlpha =
            (1 - d / linkMaxDist) * Math.min(a.distRatio, b.distRatio) * 0.75 + 0.06;
          ctx.strokeStyle = `rgba(243, 201, 120, ${Math.min(0.85, edgeAlpha).toFixed(3)})`;
          ctx.lineWidth = 0.65 + edgeAlpha * 0.7;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      drawGlowSprite(
        ctx,
        glowSprites.gold,
        a.x,
        a.y,
        7 + a.distRatio * 5,
        0.55 + a.distRatio * 0.4,
        '#F3C978',
      );
    }
    ctx.restore();
  }

  if (animate) {
    const meteor = world.shootingStar;
    if (!meteor.active) {
      world.nextMeteorCountdownSec -= dtSeconds;
      if (world.nextMeteorCountdownSec <= 0 && starVis > 0.25) {
        const startFromLeft = Math.random() > 0.35;
        meteor.active = true;
        meteor.x = startFromLeft
          ? width * (0.12 + Math.random() * 0.34)
          : width * (0.58 + Math.random() * 0.24);
        meteor.y = height * (0.04 + Math.random() * 0.14);
        meteor.vx = (startFromLeft ? 1 : -0.85) * (11.5 + Math.random() * 4.5);
        meteor.vy = 5.2 + Math.random() * 2.4;
        meteor.length = 120 + Math.random() * 60;
        meteor.life = 0;
        meteor.maxLife = 0.85 + Math.random() * 0.3;
        world.nextMeteorCountdownSec = 4 + Math.random() * 3;
      }
    } else {
      meteor.life += dtSeconds;
      meteor.x += meteor.vx * dtScale;
      meteor.y += meteor.vy * dtScale;
      const progress = meteor.life / meteor.maxLife;
      if (progress >= 1 || meteor.y > height * 0.58) {
        meteor.active = false;
      } else {
        const fadeAlpha = Math.sin(progress * Math.PI);
        const speedMag = Math.hypot(meteor.vx, meteor.vy) || 1;
        const tailX = meteor.x - (meteor.vx / speedMag) * meteor.length;
        const tailY = meteor.y - (meteor.vy / speedMag) * meteor.length;
        const grad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
        grad.addColorStop(0, 'rgba(243, 201, 120, 0)');
        grad.addColorStop(0.55, `rgba(243, 201, 120, ${(0.4 * fadeAlpha).toFixed(3)})`);
        grad.addColorStop(1, `rgba(255, 251, 236, ${(0.95 * fadeAlpha).toFixed(3)})`);

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.1;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.stroke();
        ctx.restore();

        drawGlowSprite(ctx, glowSprites.gold, meteor.x, meteor.y, 12, 0.9 * fadeAlpha, '#FFF7DC');
      }
    }
  }

  if (animate) {
    world.novaSceneBoost = Math.max(0, world.novaSceneBoost * Math.pow(0.955, dtScale));
    for (const pulse of world.novaPulses) {
      if (!pulse.active) continue;
      pulse.radius += pulse.speed * dtScale;
      pulse.alpha *= Math.pow(0.968, dtScale);

      if (pulse.radius >= pulse.maxRadius || pulse.alpha <= 0.015) {
        pulse.active = false;
        continue;
      }

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = `rgba(243, 201, 120, ${pulse.alpha.toFixed(3)})`;
      ctx.stroke();
      ctx.restore();
    }
  }
}

function renderConstellationChimLacFlock(data: RenderContextData): void {
  const { ctx, width, height, tSec, dtScale, dtSeconds, animate, world, glowSprites } = data;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const bird of world.chimLacFlock) {
    if (animate) {
      bird.xRatio += bird.speedX * dtSeconds;
      if (bird.xRatio > 1.15) {
        bird.xRatio = -0.15;
      }
    }

    const bx = bird.xRatio * width;
    const by = bird.yRatio * height + Math.sin(tSec * 1.4 + bird.phase) * 9;
    const s = bird.wingSpan * bird.z;
    const flapWave = Math.sin(tSec * 4.2 + bird.phase);
    const elbowLift = -s * (0.2 + flapWave * 0.34);
    const tipLift = -s * (0.1 + flapWave * 0.56);

    // Thả luồng bụi sao khi cánh vỗ qua đỉnh
    if (animate && flapWave > 0.62 && bird.prevWingY <= 0.62) {
      const tipRightX = bx - s * 0.34;
      const tipRightY = by + tipLift;
      const tailX = bx - s * 1.15;
      spawnSparkFromPool(world.chimLacSparks, tipRightX, tipRightY, -0.5, 0.18, 5, 0.9, 'gold');
      spawnSparkFromPool(world.chimLacSparks, tailX, by + 2, -0.6, 0.05, 4.5, 0.85, 'gold');
    }
    bird.prevWingY = flapWave;

    // 6 nút sao cấu trúc Chim Lạc
    const beakPt = [bx + s * 0.88, by - s * 0.14] as const;
    const crestPt = [bx + s * 0.18, by - s * 0.08] as const;
    const heartPt = [bx, by] as const;
    const tailPt = [bx - s * 1.18, by + s * 0.1] as const;
    const elbowFrontPt = [bx + s * 0.04, by + elbowLift * 0.88] as const;
    const tipFrontPt = [bx - s * 0.32, by + tipLift * 0.94] as const;
    const elbowBackPt = [bx - s * 0.16, by + elbowLift * 0.64] as const;
    const tipBackPt = [bx - s * 0.54, by + tipLift * 0.68] as const;

    ctx.strokeStyle = 'rgba(243, 201, 120, 0.82)';
    ctx.lineWidth = 1.1 * bird.z;
    ctx.beginPath();
    // Trục mỏ dài - thân - đuôi dài Chim Lạc
    ctx.moveTo(beakPt[0], beakPt[1]);
    ctx.lineTo(crestPt[0], crestPt[1]);
    ctx.lineTo(heartPt[0], heartPt[1]);
    ctx.lineTo(tailPt[0], tailPt[1]);
    // Cánh trước 2 khớp
    ctx.moveTo(heartPt[0], heartPt[1]);
    ctx.lineTo(elbowFrontPt[0], elbowFrontPt[1]);
    ctx.lineTo(tipFrontPt[0], tipFrontPt[1]);
    // Cánh sau 2 khớp
    ctx.moveTo(heartPt[0], heartPt[1]);
    ctx.lineTo(elbowBackPt[0], elbowBackPt[1]);
    ctx.lineTo(tipBackPt[0], tipBackPt[1]);
    ctx.stroke();

    // Đốm sao sáng tại các khớp nối
    for (const pt of [beakPt, heartPt, tailPt, elbowFrontPt, tipFrontPt, tipBackPt]) {
      drawGlowSprite(ctx, glowSprites.gold, pt[0], pt[1], 5.5 * bird.z, 0.88, '#F3C978');
    }
  }

  ctx.restore();

  updateAndDrawSparkPool(ctx, world.chimLacSparks, glowSprites, dtScale, dtSeconds, animate);
}

function renderSkyLanterns(data: RenderContextData): void {
  const { ctx, width, height, tSec, dtSeconds, dtScale, animate, sprites, glowSprites, world } =
    data;
  const bodySprite = sprites.lanternBody;
  const haloSprite = sprites.lanternHalo;
  const subSprite = sprites.subsurfaceAmber;

  for (const lantern of world.skyLanterns) {
    if (animate) {
      const speedMul = lantern.boosted ? 3.2 : 1.0;
      lantern.ny -= lantern.baseSpeedY * speedMul * dtSeconds;
      lantern.nx += Math.sin(tSec * lantern.swayFreq + lantern.phase) * lantern.swayAmp * dtSeconds;
      if (lantern.boostFlash > 0) {
        lantern.boostFlash = Math.max(0, lantern.boostFlash - dtSeconds * 0.9);
      }

      if (lantern.ny < -0.08) {
        lantern.ny = 0.78 + deterministicUnit(tSec + lantern.phase) * 0.1;
        lantern.nx = 0.12 + deterministicUnit(tSec * 2 + lantern.phase) * 0.76;
        lantern.boosted = false;
        lantern.boostFlash = 0;
      }
    }

    const altScale = Math.max(0.52, 1 - (0.78 - lantern.ny) * 0.48);
    const scale = (0.45 + lantern.z * 0.72) * altScale;
    const lx = lantern.nx * width;
    const ly = lantern.ny * height;
    const boostAdd = lantern.boostFlash * 0.85;

    // Chiếu sáng ngược (Sub-surface Illumination) vào lớp mây xung quanh khi đèn bay xuyên vùng biển mây chân núi
    if (
      lantern.ny >= 0.56 &&
      lantern.ny <= 0.88 &&
      subSprite &&
      typeof ctx.drawImage === 'function'
    ) {
      const subR = 85 * scale + lantern.boostFlash * 40;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(0.72, 0.34 + boostAdd * 0.4);
      ctx.drawImage(subSprite, lx - subR, ly - subR * 0.65, subR * 2, subR * 1.3);
      ctx.globalAlpha = prevAlpha;
    }

    // Quầng sáng đèn trời cache OffscreenCanvas
    if (haloSprite && typeof ctx.drawImage === 'function') {
      const haloR = (38 + boostAdd * 26) * scale;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(0.95, 0.58 + boostAdd * 0.4);
      ctx.drawImage(haloSprite, lx - haloR, ly - haloR, haloR * 2, haloR * 2);
      ctx.globalAlpha = prevAlpha;
    }

    // Thân đèn trời giấy dó ánh vàng cam
    if (bodySprite && typeof ctx.drawImage === 'function') {
      const bw = 24 * scale;
      const bh = 32 * scale;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(Math.sin(tSec * lantern.swayFreq + lantern.phase) * 0.08);
      ctx.globalAlpha = Math.min(1, 0.82 + lantern.z * 0.18 + boostAdd);
      ctx.drawImage(bodySprite, -bw / 2, -bh / 2, bw, bh);
      ctx.restore();
    } else {
      drawGlowSprite(ctx, glowSprites.gold, lx, ly, 16 * scale, 0.85, '#FFD166');
    }
  }

  updateAndDrawSparkPool(ctx, world.lanternSparks, glowSprites, dtScale, dtSeconds, animate);
}

function renderMountainWaterfall(data: RenderContextData): void {
  const { ctx, width, height, tSec, dtScale, scrollProgress, animate, sprites, palette, world } =
    data;
  const zoom = 1 + scrollProgress * 0.28;
  const anchorX = width * WATERFALL_ANCHOR_NX;
  const topY = height * (WATERFALL_TOP_NY - scrollProgress * 0.04);
  const bottomY = height * (WATERFALL_BOTTOM_NY + scrollProgress * 0.04);
  const fallSpan = Math.max(bottomY - topY, 64);

  // Tọa độ uốn chữ S của 3 tầng thác qua ghềnh đá (y = 0 -> 1)
  const curveShiftAt = (p: number) => Math.sin(p * Math.PI * 2.15 + 0.4) * 5.2 * zoom;
  const halfWidthAt = (p: number) => (4.5 + p * p * 16.5) * zoom;

  ctx.save();
  const mistFlowGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
  mistFlowGrad.addColorStop(0, 'rgba(248, 251, 255, 0.36)');
  mistFlowGrad.addColorStop(0.36, 'rgba(220, 238, 250, 0.28)');
  mistFlowGrad.addColorStop(0.72, 'rgba(200, 224, 240, 0.22)');
  mistFlowGrad.addColorStop(1, 'rgba(248, 246, 240, 0.04)');
  ctx.fillStyle = mistFlowGrad;

  const rippleShift = Math.sin(tSec * 5.2) * 1.4;
  const yT1 = topY + fallSpan * 0.34;
  const yT2 = topY + fallSpan * 0.68;

  ctx.beginPath();
  ctx.moveTo(anchorX - halfWidthAt(0), topY);
  ctx.bezierCurveTo(
    anchorX - 4 * zoom + rippleShift,
    topY + fallSpan * 0.16,
    anchorX - 9 * zoom,
    yT1 - 6,
    anchorX - halfWidthAt(0.34),
    yT1,
  );
  ctx.bezierCurveTo(
    anchorX - 15 * zoom - rippleShift,
    topY + fallSpan * 0.5,
    anchorX - 8 * zoom,
    yT2 - 8,
    anchorX - halfWidthAt(0.68),
    yT2,
  );
  ctx.bezierCurveTo(
    anchorX - 18 * zoom + rippleShift,
    topY + fallSpan * 0.85,
    anchorX - 20 * zoom,
    bottomY - 6,
    anchorX - halfWidthAt(1),
    bottomY,
  );
  ctx.lineTo(anchorX + halfWidthAt(1), bottomY);
  ctx.bezierCurveTo(
    anchorX + 20 * zoom - rippleShift,
    topY + fallSpan * 0.85,
    anchorX + 10 * zoom,
    yT2 - 8,
    anchorX + halfWidthAt(0.68),
    yT2,
  );
  ctx.bezierCurveTo(
    anchorX + 12 * zoom + rippleShift,
    topY + fallSpan * 0.5,
    anchorX + 6 * zoom,
    yT1 - 6,
    anchorX + halfWidthAt(0.34),
    yT1,
  );
  ctx.bezierCurveTo(
    anchorX + 6 * zoom - rippleShift,
    topY + fallSpan * 0.16,
    anchorX + 4 * zoom,
    topY + 4,
    anchorX + halfWidthAt(0),
    topY,
  );
  ctx.closePath();
  ctx.fill();

  // Quầng sương tròn phát sáng dịu + 2 vòng gợn sóng tại điểm thác chạm biển mây
  const plumeRadius = 64 * zoom;
  const plumeGrad = ctx.createRadialGradient(
    anchorX,
    bottomY + 2,
    2,
    anchorX,
    bottomY + 2,
    plumeRadius,
  );
  plumeGrad.addColorStop(0, rgbaString(palette.cloudIvory, 0.34));
  plumeGrad.addColorStop(0.45, rgbaString(palette.dawnEdge, 0.16));
  plumeGrad.addColorStop(1, rgbaString(palette.cloudSlate, 0));
  ctx.fillStyle = plumeGrad;
  ctx.beginPath();
  ctx.ellipse(anchorX, bottomY + 2, plumeRadius, plumeRadius * 0.34, 0, 0, Math.PI * 2);
  ctx.fill();

  for (let ring = 0; ring < 2; ring += 1) {
    const ripplePhase = (tSec * 0.48 + ring * 0.5) % 1;
    const rx = (22 + ripplePhase * 48) * zoom;
    const ry = rx * 0.28;
    const rippleAlpha = Math.sin(ripplePhase * Math.PI) * 0.24;
    ctx.strokeStyle = rgbaString(palette.cloudIvory, rippleAlpha);
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.ellipse(anchorX, bottomY + 3, rx, ry, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  const streakSprite = sprites.waterStreak;
  const spraySprite = sprites.waterfallSpray;
  for (let i = 0; i < world.waterfallDrops.length; i += 1) {
    const drop = world.waterfallDrops[i]!;
    if (animate) {
      // Gia tốc trọng trường thực tế dọc 3 tầng thác
      drop.vy = Math.min(drop.vy + 0.088 * dtScale, 4.9);
      drop.yProgress += drop.vy * 0.0115 * dtScale;
      drop.xOffset += drop.vx * dtScale;

      if (!drop.bounced && drop.yProgress >= 0.34 && drop.yProgress < 0.66) {
        drop.bounced = true;
        drop.vx = (deterministicUnit(drop.length + tSec * 1.7) - 0.5) * 0.56;
      } else if (drop.bounced && drop.yProgress >= 0.66) {
        drop.vx = (deterministicUnit(drop.width + tSec * 2.3) - 0.5) * 0.72;
      }

      if (drop.yProgress >= 1) {
        drop.yProgress = 0;
        drop.vy = 1.15 + deterministicUnit(tSec * 10 + drop.length) * 0.85;
        drop.vx = (deterministicUnit(drop.width + tSec) - 0.5) * 0.16;
        drop.xOffset = (deterministicUnit(drop.alpha + tSec) - 0.5) * 8;
        drop.bounced = false;
      }
    }

    const spreadScale = 0.45 + drop.yProgress * 1.45;
    const dx = anchorX + curveShiftAt(drop.yProgress) + drop.xOffset * spreadScale * zoom;
    const dy = topY + drop.yProgress * fallSpan;
    const stretchLen = drop.length * (0.65 + drop.vy * 0.35) * zoom;

    if (i % 3 === 0 && spraySprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      const spraySize = (3.4 + drop.width) * zoom;
      ctx.globalAlpha = prevAlpha * Math.min(0.8, drop.alpha * 0.9);
      ctx.drawImage(spraySprite, dx - spraySize / 2, dy - spraySize / 2, spraySize, spraySize);
      ctx.globalAlpha = prevAlpha;
    } else if (streakSprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * drop.alpha;
      ctx.drawImage(
        streakSprite,
        dx - drop.width * zoom,
        dy - stretchLen / 2,
        drop.width * 2 * zoom,
        stretchLen,
      );
      ctx.globalAlpha = prevAlpha;
    }
  }

  const mistSprite = sprites.waterfallMist;
  for (const puff of world.waterfallMist) {
    if (animate) {
      puff.life += data.dtSeconds;
      puff.xOffset += puff.vx * dtScale;
      puff.yOffset += puff.vy * dtScale;
      if (puff.life >= puff.maxLife) {
        puff.life = 0;
        puff.xOffset = (deterministicUnit(tSec * 13 + puff.radius) - 0.5) * 52;
        puff.yOffset = 0;
      }
    }
    const ratio = puff.life / puff.maxLife;
    const fade = Math.sin(ratio * Math.PI);
    const radius = puff.radius * (0.72 + ratio * 0.72) * zoom;
    const px = anchorX + puff.xOffset * zoom;
    const py = bottomY + puff.yOffset - ratio * 18;

    if (mistSprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(0.68, puff.alpha * fade);
      ctx.drawImage(mistSprite, px - radius, py - radius * 0.62, radius * 2, radius * 1.24);
      ctx.globalAlpha = prevAlpha;
    }
  }
}

function renderTerraceStarReflections(data: RenderContextData): void {
  const { ctx, width, height, tSec, mouse, palette, world, glowSprites } = data;
  const cursorAzimuth = mouse.active ? mouse.normX : Math.sin(tSec * 0.25) * 0.4;
  const novaBoost = world.novaSceneBoost;

  ctx.save();
  ctx.lineCap = 'round';
  for (const g of world.terraceGlints) {
    const x = g.nx * width;
    const y = g.ny * height;
    const angleMatch =
      g.side === 'west'
        ? Math.max(0, 0.7 - cursorAzimuth * 0.65)
        : Math.max(0, 0.7 + cursorAzimuth * 0.65);
    const shimmer = 0.5 + 0.5 * Math.sin(tSec * 2.1 + g.phase + cursorAzimuth * 3);
    const alpha = Math.min(0.88, (0.16 + shimmer * 0.38) * angleMatch + novaBoost * 0.55);

    ctx.strokeStyle = rgbaString(palette.terraceRim, alpha);
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(x - g.arcSpan * 0.5, y);
    ctx.quadraticCurveTo(x, y + (g.side === 'west' ? 2.5 : -2.5), x + g.arcSpan * 0.5, y);
    ctx.stroke();

    if (alpha > 0.45) {
      drawGlowSprite(ctx, glowSprites.gold, x, y, 6.5, (alpha - 0.3) * 0.75, '#F3C978');
    }
  }
  ctx.restore();
}

function renderVolumetricCloudSea(data: RenderContextData): void {
  const {
    ctx,
    width,
    height,
    tSec,
    dtSeconds,
    dtScale,
    scrollProgress,
    animate,
    sprites,
    mouse,
    world,
  } = data;

  // Khi người dùng cuộn xuống, biển mây dâng nhẹ ôm trọn chân màn hình đón vào Không gian Học phần
  const cloudLiftY = -scrollProgress * height * 0.085;
  const cloudCursorActive = animate && mouse.active && mouse.y > height * 0.54;
  const partRadius = 150;
  const relaxFactor = frameDampFactor(3.4, dtSeconds);

  const subSprite = sprites.subsurfaceAmber;
  for (const pool of world.subsurfacePools) {
    if (animate) {
      pool.nx += pool.speed * 0.04 * dtScale;
      if (pool.nx > 1.15) pool.nx = -0.15;
      if (pool.nx < -0.15) pool.nx = 1.15;
    }
    const px = pool.nx * width;
    const py = pool.ny * height + cloudLiftY;
    const glowWave = 0.48 + 0.52 * Math.sin(tSec * 0.8 + pool.phase);
    const r = pool.radius * (0.92 + glowWave * 0.16);
    if (subSprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * (0.32 + glowWave * 0.3 + world.novaSceneBoost * 0.25);
      ctx.drawImage(subSprite, px - r, py - r * 0.62, r * 2, r * 1.24);
      ctx.globalAlpha = prevAlpha;
    }
  }

  for (const puff of world.cloudPuffs) {
    if (animate) {
      puff.nx += puff.speed * dtSeconds;
      if (puff.nx > 1.18) puff.nx = -0.18;
      if (puff.nx < -0.18) puff.nx = 1.18;

      const baseX = puff.nx * width;
      const baseY =
        puff.ny * height + Math.sin(tSec * 0.7 + puff.phase) * 9 * puff.depth + cloudLiftY;

      if (cloudCursorActive) {
        const dx = baseX + puff.dispX - mouse.x;
        const dy = baseY + puff.dispY - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < partRadius && dist > 0.5) {
          const strength = (1 - dist / partRadius) * 2.8 * dtScale;
          puff.dispX += (dx / dist) * strength * 2.2 + mouse.vx * 0.22 * strength;
          puff.dispY += (dy / dist) * strength * 1.4 + mouse.vy * 0.16 * strength;
        }
      }

      puff.dispX += (0 - puff.dispX) * relaxFactor;
      puff.dispY += (0 - puff.dispY) * relaxFactor;
    }

    const px = puff.nx * width + puff.dispX;
    const py =
      puff.ny * height +
      Math.sin(tSec * 0.7 + puff.phase) * 9 * puff.depth +
      puff.dispY +
      cloudLiftY;
    const puffSprite = sprites[puff.variant];

    if (puffSprite && typeof ctx.drawImage === 'function') {
      const bottomEdgeFade =
        py > height * 0.85
          ? Math.max(0.18, 1 - ((py - height * 0.85) / (height * 0.22)) * 0.82)
          : 1;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha =
        prevAlpha * Math.min(0.95, puff.opacity + scrollProgress * 0.14) * bottomEdgeFade;
      ctx.drawImage(
        puffSprite,
        px - puff.radiusX,
        py - puff.radiusY,
        puff.radiusX * 2,
        puff.radiusY * 2,
      );
      ctx.globalAlpha = prevAlpha;
    }
  }
}

function renderWindRibbonsPetalsAndFireflies(data: RenderContextData): void {
  const { ctx, width, height, tSec, dtScale, animate, sprites, glowSprites, mouse, world } = data;

  ctx.save();
  ctx.lineCap = 'round';
  for (let i = 0; i < 3; i += 1) {
    const baseY = height * (0.31 + i * 0.12);
    const drift = ((tSec * (54 + i * 16) + i * 260) % (width + 420)) - 210;
    const ribbonLen = 280 + i * 70;
    const xStart = drift - ribbonLen * 0.5;
    const xEnd = drift + ribbonLen * 0.5;

    const grad = ctx.createLinearGradient(xStart, baseY, xEnd, baseY);
    grad.addColorStop(0, 'rgba(197, 211, 220, 0)');
    grad.addColorStop(0.5, i === 1 ? 'rgba(243, 201, 120, 0.2)' : 'rgba(226, 238, 248, 0.16)');
    grad.addColorStop(1, 'rgba(197, 211, 220, 0)');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.moveTo(xStart, baseY + Math.sin(tSec * 1.4 + i) * 14);
    ctx.bezierCurveTo(
      xStart + ribbonLen * 0.34,
      baseY - 22 + Math.cos(tSec * 1.8 + i) * 12,
      xStart + ribbonLen * 0.68,
      baseY + 22 + Math.sin(tSec * 1.6 + i) * 12,
      xEnd,
      baseY - Math.cos(tSec * 1.3 + i) * 10,
    );
    ctx.stroke();
  }
  ctx.restore();

  for (const p of world.petals) {
    if (animate) {
      const gustX = Math.sin(tSec * 0.85 + p.phase) * 0.25;
      const flutterY = Math.cos(tSec * 1.45 + p.phase * 1.3) * 0.22;
      p.x += (p.vx + gustX) * dtScale;
      p.y += (p.vy + flutterY) * dtScale;
      p.rx += p.vrx * data.dtSeconds;
      p.ry += p.vry * data.dtSeconds;
      p.rz += p.vrz * data.dtSeconds;

      if (mouse.active) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist > 1 && dist < 130) {
          const push = ((130 - dist) / 130) * 0.65 * dtScale;
          p.x += (dx / dist) * push + mouse.vx * 0.08 * dtScale;
          p.y += (dy / dist) * push + mouse.vy * 0.08 * dtScale;
        }
      }

      if (p.x > width + 36) p.x = -28;
      if (p.y > height + 24) {
        p.y = -18;
        p.x = deterministicUnit(p.phase * 50 + tSec) * width * 0.75;
      }
    }

    const scalePerspective = 0.55 + p.z * 0.62;
    const tiltY = Math.max(0.28, Math.abs(Math.cos(p.rx)));
    const tiltX = Math.max(0.32, Math.abs(Math.cos(p.ry)));
    const petalSprite = sprites[p.tone];
    const drawSize = 26 * scalePerspective;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rz);
    ctx.scale(tiltX, tiltY);
    ctx.globalAlpha = Math.min(0.92, 0.45 + p.z * 0.35);
    if (petalSprite && typeof ctx.drawImage === 'function') {
      ctx.drawImage(petalSprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
    } else {
      ctx.fillStyle = p.tone === 'petalGold' ? '#F5CE7E' : '#F4A7B9';
      ctx.beginPath();
      ctx.ellipse(0, 0, drawSize * 0.25, drawSize * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  for (const ff of world.fireflies) {
    if (animate) {
      ff.x += (ff.vx + Math.sin(tSec * 0.9 + ff.phase) * 0.16) * dtScale;
      ff.y += ff.vy * dtScale;
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
      ff.radius * 3.2,
      ff.alpha * flicker,
      '#F3C978',
    );
  }
}

/**
 * Kết xuất toàn bộ 1 frame của Engine Khí Quyển Hoàng Liên Sơn 120fps (< 5.5ms/frame).
 */
export function renderAtmosphereFrame(data: RenderContextData): void {
  const { ctx, width, height } = data;
  ctx.clearRect(0, 0, width, height);

  renderDongSonCompassAndMilkyWay(data);
  renderHarmonicSilkAuroras(data);
  renderDynamicCrepuscularRays(data);
  renderStarMeshAndNovas(data);
  renderConstellationChimLacFlock(data);
  renderMountainWaterfall(data);
  renderTerraceStarReflections(data);
  renderVolumetricCloudSea(data);
  renderSkyLanterns(data);
  renderWindRibbonsPetalsAndFireflies(data);
}
