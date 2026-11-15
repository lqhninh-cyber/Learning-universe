import { rgbaString, type AtmospherePalette } from '@/components/home/atmosphereThemes';
import {
  drawStoneArchBridge,
  type HeroTerrainGeometry,
  type HeroTerrainLayerCache,
} from '@/components/home/heroTerrainBuilder';
import { drawGlowSprite, frameDampFactor, type GlowSpriteCache } from '@/shared/lib/canvasSprites';

export type OffscreenSurface = OffscreenCanvas | HTMLCanvasElement;

export const PIPELINE_LAYER_NAMES = [
  'Sky & Celestial Orb Layer',
  'Distant & Mid Fractal Ridges + Rim-Light Pass',
  'Orographic Cloud-Fall & Illuminated Pavilion Path',
  'Multi-Stream Gorge Waterfall & Fresnel Reflective Lake',
  'Rolling Cloud Sea & Drifting Lotus Lanterns',
  'Foreground Pine Silhouette & DoF Bokeh Fireflies',
] as const;

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
  readonly lotusLantern: OffscreenSurface | null;
  readonly bokehGold: OffscreenSurface | null;
  readonly bokehCyan: OffscreenSurface | null;
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
  streamIndex: number;
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
  tierIndex: 0 | 1 | 2;
  xOffset: number;
  yOffset: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

/** Hạt mây đổ đèo (Orographic Cloud-Fall) trượt dọc sườn yên ngựa xuống thung lũng */
export interface CloudFallPuff {
  progress: number;
  lateralOffset: number;
  speed: number;
  vx: number;
  vy: number;
  radiusX: number;
  radiusY: number;
  opacity: number;
  phase: number;
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

/** Đom đóm & Sương sáng Bokeh lệch tiêu cự (f/1.4, r = 6..16px, Parallax = 1.6x) */
export interface BokehFirefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  tone: 'bokehGold' | 'bokehCyan';
  side: 'left' | 'right';
}

/** Cột ánh sáng Cực Quang Rèm Lụa Thể Tích 3D (60–80 dải dọc mềm mại) */
export interface AuroraCurtainColumn {
  readonly index: number;
  readonly nx: number;
  readonly baseNy: number;
  readonly heightRatio: number;
  readonly widthPx: number;
  readonly phase: number;
  readonly hueMix: number;
  swayOffset: number;
  swayVelocity: number;
}

/** Hoa đăng trôi trên Hồ Sơn Thủy (#FF9F43) */
export interface DriftingLotusLantern {
  nx: number;
  ny: number;
  vx: number;
  vy: number;
  scale: number;
  phase: number;
}

/** Vòng sóng nước elip đồng tâm tương tác chuột trên mặt hồ (tỷ lệ 3.5 : 1) */
export interface MouseLakeRipple {
  active: boolean;
  x: number;
  y: number;
  rx: number;
  maxRx: number;
  alpha: number;
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

export interface TerrainLayerTransition {
  readonly prev: HeroTerrainLayerCache | null;
  readonly next: HeroTerrainLayerCache | null;
  readonly blend: number;
}

export interface AtmosphereWorld {
  readonly stars: readonly StarMote[];
  readonly auroraCurtains: AuroraCurtainColumn[];
  readonly terraceGlints: readonly TerraceGlint[];
  readonly waterfallDrops: WaterfallDrop[];
  readonly waterfallMist: WaterfallMistPuff[];
  readonly cloudFallPuffs: CloudFallPuff[];
  readonly cloudPuffs: VolumetricCloudPuff[];
  readonly subsurfacePools: SubsurfaceCloudGlowPool[];
  readonly petals: RhododendronPetal[];
  readonly bokehFireflies: BokehFirefly[];
  readonly lotusLanterns: DriftingLotusLantern[];
  readonly mouseLakeRipples: MouseLakeRipple[];
  lakeRippleCursor: number;
  lastLakeRippleSpawnMs: number;
  readonly chimLacFlock: ChimLacBird[];
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
  readonly terrainLayers?: TerrainLayerTransition;
}

interface CrepuscularRaySpec {
  readonly angleDeg: number;
  readonly spreadDeg: number;
  readonly lengthRatio: number;
  readonly intensity: number;
  readonly warm: boolean;
}

const CREPUSCULAR_RAYS: readonly CrepuscularRaySpec[] = [
  { angleDeg: -148, spreadDeg: 13.5, lengthRatio: 0.68, intensity: 0.032, warm: false },
  { angleDeg: -124, spreadDeg: 16.5, lengthRatio: 0.74, intensity: 0.044, warm: true },
  { angleDeg: -96, spreadDeg: 15.0, lengthRatio: 0.78, intensity: 0.036, warm: false },
  { angleDeg: 145, spreadDeg: 19.0, lengthRatio: 0.74, intensity: 0.048, warm: true },
  { angleDeg: 166, spreadDeg: 16.0, lengthRatio: 0.76, intensity: 0.04, warm: false },
  { angleDeg: 120, spreadDeg: 18.0, lengthRatio: 0.62, intensity: 0.038, warm: true },
];

const AURORA_CURTAIN_COUNT = 72;
const FOREGROUND_PINE_PARALLAX = 1.4;
const BOKEH_FIREFLY_PARALLAX = 1.6;
const LAKE_RIPPLE_ASPECT_RATIO = 3.5;

function makeSurface(w: number, h: number): OffscreenSurface | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      return new OffscreenCanvas(w, h);
    } catch {
      // Fallback HTMLCanvasElement
    }
  }
  if (typeof document !== 'undefined') {
    const isJsdom = typeof navigator !== 'undefined' && navigator.userAgent.includes('jsdom');
    if (isJsdom) return null;
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
  grad.addColorStop(0.28, 'rgba(186, 230, 253, 0.85)');
  grad.addColorStop(0.65, 'rgba(248, 251, 255, 0.96)');
  grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, 2.8, h / 2, 0, 0, Math.PI * 2);
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

  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.moveTo(15, 11);
  ctx.quadraticCurveTo(24, 7, 33, 11);
  ctx.quadraticCurveTo(39, 26, 30, 48);
  ctx.lineTo(18, 48);
  ctx.quadraticCurveTo(9, 26, 15, 11);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 240, 196, 0.72)';
  ctx.lineWidth = 1;
  ctx.stroke();

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

function buildLotusLanternSprite(): OffscreenSurface | null {
  const size = 40;
  const surface = makeSurface(size, size);
  const ctx = getSurface2d(surface);
  if (!surface || !ctx || typeof ctx.createRadialGradient !== 'function') return null;

  const half = size / 2;
  const glow = ctx.createRadialGradient(half, half, 1, half, half, half);
  glow.addColorStop(0, 'rgba(255, 232, 179, 0.96)');
  glow.addColorStop(0.32, 'rgba(255, 159, 67, 0.62)');
  glow.addColorStop(0.7, 'rgba(255, 159, 67, 0.16)');
  glow.addColorStop(1, 'rgba(255, 159, 67, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#FF9F43';
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(half + i * 2.6, half + 2, 3.2, 5.4, i * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#FFF7DC';
  ctx.beginPath();
  ctx.arc(half, half + 0.5, 2.3, 0, Math.PI * 2);
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
      [0.42, 'rgba(186, 230, 253, 0.56)'],
      [1, 'rgba(56, 189, 248, 0)'],
    ]),
    waterfallMist: buildRadialSprite(64, 64, [
      [0, 'rgba(248, 251, 255, 0.8)'],
      [0.38, 'rgba(182, 212, 235, 0.42)'],
      [0.78, 'rgba(143, 166, 184, 0.14)'],
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
    lotusLantern: buildLotusLanternSprite(),
    bokehGold: buildRadialSprite(48, 48, [
      [0, 'rgba(255, 218, 128, 0.95)'],
      [0.58, 'rgba(255, 183, 77, 0.42)'],
      [0.86, 'rgba(255, 183, 77, 0.1)'],
      [1, 'rgba(255, 183, 77, 0)'],
    ]),
    bokehCyan: buildRadialSprite(48, 48, [
      [0, 'rgba(186, 230, 253, 0.92)'],
      [0.58, 'rgba(56, 189, 248, 0.38)'],
      [0.86, 'rgba(56, 189, 248, 0.08)'],
      [1, 'rgba(56, 189, 248, 0)'],
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
  const starCount = 280;
  for (let i = 0; i < starCount; i += 1) {
    const r1 = deterministicUnit(i + 1);
    const r2 = deterministicUnit(i * 3 + 7);
    const r3 = deterministicUnit(i * 5 + 19);
    const r4 = deterministicUnit(i * 7 + 31);
    const inMilkyWay = i < Math.floor(starCount * 0.65);

    let nx: number;
    let ny: number;
    if (inMilkyWay) {
      const t = r1;
      const spread = (r2 + r3 - 1) * 0.13;
      nx = Math.min(Math.max(0.03 + t * 0.92 + spread * 0.25, 0.01), 0.99);
      ny = Math.min(Math.max(0.04 + t * 0.39 + spread, 0.02), 0.54);
    } else {
      nx = r1 * 0.98 + 0.01;
      ny = r2 * 0.52 + 0.02;
    }

    const tone: StarMote['tone'] = r4 > 0.78 ? 'starGold' : r4 > 0.38 ? 'starSilver' : 'starIvory';
    stars.push({
      nx,
      ny,
      size: inMilkyWay ? 2.0 + r3 * 4.4 : 2.4 + r3 * 5.2,
      baseAlpha: inMilkyWay ? 0.36 + r4 * 0.62 : 0.3 + r4 * 0.52,
      twinkleSpeed: 0.9 + r2 * 2.2,
      phase: r3 * Math.PI * 2,
      tone,
    });
  }

  const auroraCurtains: AuroraCurtainColumn[] = [];
  for (let i = 0; i < AURORA_CURTAIN_COUNT; i += 1) {
    const t = i / (AURORA_CURTAIN_COUNT - 1);
    const r1 = deterministicUnit(i * 19 + 41);
    const r2 = deterministicUnit(i * 23 + 67);
    auroraCurtains.push({
      index: i,
      nx: 0.1 + t * 0.8,
      baseNy: 0.17 + Math.sin(t * Math.PI * 1.45 - 0.3) * 0.065,
      heightRatio: 0.12 + Math.sin(t * Math.PI) * 0.11 + r1 * 0.04,
      widthPx: 14 + r2 * 16,
      phase: t * 5.2 + r1 * 0.8,
      hueMix: 0.25 + 0.75 * Math.sin(t * Math.PI * 1.3 + 0.4) * Math.sin(t * Math.PI * 1.3 + 0.4),
      swayOffset: 0,
      swayVelocity: 0,
    });
  }

  const terraceGlints: TerraceGlint[] = [];
  for (let i = 0; i < 48; i += 1) {
    const isWest = i < 24;
    const t = (i % 24) / 23;
    const tier = i % 7;
    terraceGlints.push({
      nx: isWest ? 0.02 + t * 0.37 : 0.57 + t * 0.4,
      ny: (isWest ? 0.588 : 0.586) + tier * 0.0155 + Math.sin(t * 4.5) * 0.009,
      arcSpan: 12 + (i % 4) * 4.5,
      phase: i * 0.65,
      side: isWest ? 'west' : 'east',
    });
  }

  const waterfallDrops: WaterfallDrop[] = [];
  for (let i = 0; i < 150; i += 1) {
    const r1 = deterministicUnit(i + 401);
    const r2 = deterministicUnit(i + 503);
    waterfallDrops.push({
      streamIndex: i % 5,
      xOffset: (r1 - 0.5) * 9,
      yProgress: r2,
      vy: 1.35 + r1 * 1.1,
      vx: (r2 - 0.5) * 0.14,
      length: 10 + r1 * 15,
      width: 1.5 + r2 * 2.1,
      alpha: 0.38 + r1 * 0.5,
      bounced: r2 > 0.34,
    });
  }

  const waterfallMist: WaterfallMistPuff[] = [];
  for (let i = 0; i < 27; i += 1) {
    const r1 = deterministicUnit(i + 601);
    const r2 = deterministicUnit(i + 703);
    const tierIndex = (i % 3) as 0 | 1 | 2;
    waterfallMist.push({
      tierIndex,
      xOffset: (r1 - 0.5) * (36 + tierIndex * 16),
      yOffset: (r2 - 0.5) * 10,
      vx: (r1 - 0.5) * 0.42,
      vy: -(0.12 + r2 * 0.18),
      radius: 18 + tierIndex * 6 + r1 * 18,
      alpha: 0.42,
      life: r2 * 2.4,
      maxLife: 2.1 + r1 * 1.1,
    });
  }

  const cloudFallPuffs: CloudFallPuff[] = [];
  for (let i = 0; i < 18; i += 1) {
    const r1 = deterministicUnit(i * 17 + 751);
    const r2 = deterministicUnit(i * 29 + 769);
    cloudFallPuffs.push({
      progress: r1,
      lateralOffset: (r2 - 0.5) * 34,
      speed: 0.18 + r1 * 0.12,
      vx: 0.25 + r2 * 0.14,
      vy: 0.85 + r1 * 0.22,
      radiusX: 34 + r1 * 26,
      radiusY: 18 + r2 * 14,
      opacity: 0.26 + r2 * 0.2,
      phase: r1 * Math.PI * 2,
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
      ny: 0.785 + depthIdx * 0.052 + (r2 - 0.5) * 0.022,
      depth,
      speed: (depthIdx % 2 === 0 ? 1 : -1) * (0.008 + depth * 0.012),
      radiusX: 98 + r1 * 68 + depth * 36,
      radiusY: 50 + r2 * 26 + depth * 16,
      phase: r3 * Math.PI * 2,
      opacity: 0.34 + depth * 0.38,
      variant: variants[depthIdx] ?? 'cloudIvory',
      dispX: 0,
      dispY: 0,
    });
  }

  const subsurfacePools: SubsurfaceCloudGlowPool[] = [
    { nx: 0.22, ny: 0.83, speed: 0.015, radius: 190, phase: 0.2 },
    { nx: 0.56, ny: 0.82, speed: -0.012, radius: 220, phase: 2.1 },
    { nx: 0.84, ny: 0.85, speed: 0.018, radius: 185, phase: 4.3 },
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

  const bokehFireflies: BokehFirefly[] = [];
  for (let i = 0; i < 20; i += 1) {
    const side: 'left' | 'right' = i < 10 ? 'left' : 'right';
    const r1 = deterministicUnit(i * 11 + 1409);
    const r2 = deterministicUnit(i * 13 + 1511);
    const r3 = deterministicUnit(i * 17 + 1601);
    const nx = side === 'left' ? 0.02 + r1 * 0.19 : 0.79 + r1 * 0.19;
    bokehFireflies.push({
      x: nx * width,
      y: height * (0.5 + r2 * 0.44),
      vx: (r3 - 0.5) * 0.22,
      vy: -(0.12 + r2 * 0.2),
      radius: 6 + r3 * 10,
      alpha: 0.08 + r1 * 0.14,
      phase: r2 * Math.PI * 2,
      tone: i % 4 === 0 ? 'bokehCyan' : 'bokehGold',
      side,
    });
  }

  const lotusLanterns: DriftingLotusLantern[] = [];
  for (let i = 0; i < 6; i += 1) {
    const r1 = deterministicUnit(i + 1657);
    const r2 = deterministicUnit(i + 1693);
    lotusLanterns.push({
      nx: 0.495 + (i / 5) * 0.31 + (r1 - 0.5) * 0.03,
      ny: 0.745 + r2 * 0.095,
      vx: 0.0065 + r1 * 0.004,
      vy: 0.002 + r2 * 0.002,
      scale: 0.72 + r2 * 0.36,
      phase: i * 1.1,
    });
  }

  const mouseLakeRipples: MouseLakeRipple[] = [];
  for (let i = 0; i < 12; i += 1) {
    mouseLakeRipples.push({ active: false, x: 0, y: 0, rx: 4, maxRx: 52, alpha: 0 });
  }

  const chimLacFlock: ChimLacBird[] = [
    { xRatio: 0.22, yRatio: 0.26, z: 1.0, speedX: 0.024, phase: 0, wingSpan: 32, prevWingY: 0 },
    {
      xRatio: 0.175,
      yRatio: 0.23,
      z: 0.86,
      speedX: 0.024,
      phase: 0.55,
      wingSpan: 27,
      prevWingY: 0,
    },
    {
      xRatio: 0.172,
      yRatio: 0.295,
      z: 0.82,
      speedX: 0.024,
      phase: 1.1,
      wingSpan: 26,
      prevWingY: 0,
    },
    {
      xRatio: 0.128,
      yRatio: 0.205,
      z: 0.72,
      speedX: 0.024,
      phase: 1.65,
      wingSpan: 22,
      prevWingY: 0,
    },
  ];

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
    novaPulses.push({ active: false, x: 0, y: 0, radius: 0, maxRadius: 300, alpha: 0, speed: 4 });
  }

  return {
    stars,
    auroraCurtains,
    terraceGlints,
    waterfallDrops,
    waterfallMist,
    cloudFallPuffs,
    cloudPuffs,
    subsurfacePools,
    petals,
    bokehFireflies,
    lotusLanterns,
    mouseLakeRipples,
    lakeRippleCursor: 0,
    lastLakeRippleSpawnMs: -1000,
    chimLacFlock,
    skyLanterns,
    chimLacSparks: createSparkPool(140),
    auroraSparks: createSparkPool(80),
    lanternSparks: createSparkPool(90),
    novaPulses,
    novaCursor: 0,
    shootingStar: { active: false, x: 0, y: 0, vx: 0, vy: 0, length: 120, life: 0, maxLife: 1 },
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

/** Gảy dải rèm lụa cực quang 3D khi con trỏ lướt qua bầu trời */
export function triggerAuroraPluck(
  world: AtmosphereWorld,
  mouseX: number,
  mouseY: number,
  mouseVy: number,
  width: number,
  height = 900,
): void {
  if (Math.abs(mouseVy) < 1.0 && mouseY > height * 0.45) return;
  const cursorNx = mouseX / Math.max(width, 1);
  const cursorNy = mouseY / Math.max(height, 1);
  if (cursorNy > 0.48) return;

  const impulse = Math.max(-28, Math.min(28, mouseVy * 2.2));
  for (const col of world.auroraCurtains) {
    const distX = Math.abs(col.nx - cursorNx);
    if (distX > 0.14) continue;
    const influence = 1 - distX / 0.14;
    col.swayVelocity += impulse * influence * 0.45;
    col.swayOffset = Math.max(-24, Math.min(24, col.swayOffset + impulse * influence * 0.18));

    if (influence > 0.72 && col.index % 4 === 0) {
      spawnSparkFromPool(
        world.auroraSparks,
        col.nx * width,
        col.baseNy * height,
        (col.nx - cursorNx) * 6,
        -0.45,
        4.2,
        0.9,
        col.index % 8 === 0 ? 'emerald' : 'gold',
      );
    }
  }
}

/** Sinh vòng sóng nước elip đồng tâm (aspectRatio = 3.5 : 1) khi con trỏ đi qua vùng Hồ Sơn Thủy (`y > height * 0.70`) */
export function trySpawnMouseLakeRipple(
  world: AtmosphereWorld,
  mouseX: number,
  mouseY: number,
  width: number,
  height: number,
  nowMs: number,
): boolean {
  if (mouseY <= height * 0.7 || nowMs - world.lastLakeRippleSpawnMs < 85) {
    return false;
  }
  if (mouseX < width * 0.4 || mouseX > width * 0.96) {
    return false;
  }
  const slot = world.mouseLakeRipples[world.lakeRippleCursor];
  world.lakeRippleCursor = (world.lakeRippleCursor + 1) % world.mouseLakeRipples.length;
  if (!slot) return false;

  slot.active = true;
  slot.x = mouseX;
  slot.y = mouseY;
  slot.rx = 6;
  slot.maxRx = 54;
  slot.alpha = 0.56;
  world.lastLakeRippleSpawnMs = nowMs;
  return true;
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

function drawBlendedOffscreenLayer(
  ctx: CanvasRenderingContext2D,
  prevSurface: OffscreenSurface | null | undefined,
  nextSurface: OffscreenSurface | null | undefined,
  blend: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
): void {
  if (typeof ctx.drawImage !== 'function') return;
  const clamped = Math.min(1, Math.max(0, blend));
  if (prevSurface && clamped < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - clamped;
    ctx.drawImage(prevSurface, dx, dy, dw, dh);
    ctx.restore();
  }
  if (nextSurface && clamped > 0) {
    ctx.save();
    ctx.globalAlpha = clamped;
    ctx.drawImage(nextSurface, dx, dy, dw, dh);
    ctx.restore();
  }
}

/* ============================================================================
 * LỚP 1: SKY & CELESTIAL ORB LAYER (Ngân Hà, Cực Quang Rèm Lụa 3D & Nhật/Nguyệt)
 * ============================================================================ */
function renderLayer1SkyAndCelestialOrb(data: RenderContextData): void {
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
    terrainLayers,
  } = data;

  drawBlendedOffscreenLayer(
    ctx,
    terrainLayers?.prev?.milkyWayLayer,
    terrainLayers?.next?.milkyWayLayer,
    terrainLayers?.blend ?? 1,
    -mouse.normX * 4,
    -mouse.normY * 3,
    width,
    height,
  );

  if (animate) {
    world.compassRotationRad = (world.compassRotationRad + dtSeconds * 0.022) % (Math.PI * 2);
  }
  const polarisX = width * 0.48;
  const polarisY = height * 0.17;
  const baseRadius = Math.max(115, Math.min(width * 0.16, height * 0.24));

  ctx.save();
  ctx.translate(polarisX, polarisY);
  ctx.rotate(world.compassRotationRad);
  ctx.strokeStyle = rgbaString(palette.rimGlow, 0.1);
  ctx.lineWidth = 0.8;
  for (const rMul of [0.38, 0.72, 1.0]) {
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * rMul, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // CỰC QUANG RÈM LỤA THỂ TÍCH 3D (60–80 dải cột sáng dọc, KHÔNG vẽ dây sóng đơn điệu)
  const auroraVis = 0.34 + palette.starIntensity * 0.66;
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const damp = frameDampFactor(4.2, dtSeconds);
  for (const col of world.auroraCurtains) {
    if (animate) {
      col.swayOffset += col.swayVelocity * dtSeconds;
      col.swayVelocity += -col.swayOffset * 12 * dtSeconds;
      col.swayOffset *= 1 - damp * 0.6;
      col.swayVelocity *= 1 - damp;
    }

    const fold =
      Math.sin(tSec * 1.15 + col.phase) * 10 + Math.cos(tSec * 0.72 + col.phase * 1.7) * 6;
    const cx = col.nx * width + fold + col.swayOffset - mouse.normX * 8;
    const footY =
      col.baseNy * height + Math.sin(tSec * 0.85 + col.phase) * 14 + col.swayOffset * 0.4;
    const colH = col.heightRatio * height;
    const topY = footY - colH;

    const curtainGrad = ctx.createLinearGradient(cx, footY, cx, topY);
    const edgeAlpha = Math.sin((col.index / (AURORA_CURTAIN_COUNT - 1)) * Math.PI);
    const intensity = Math.min(
      0.42,
      (0.18 + 0.16 * Math.sin(tSec * 1.4 + col.phase)) * auroraVis * edgeAlpha,
    );
    const emeraldCyan =
      col.hueMix > 0.5
        ? `rgba(52, 211, 153, ${intensity.toFixed(3)})`
        : `rgba(56, 189, 248, ${intensity.toFixed(3)})`;
    curtainGrad.addColorStop(0, emeraldCyan);
    curtainGrad.addColorStop(0.38, `rgba(56, 189, 248, ${(intensity * 0.52).toFixed(3)})`);
    curtainGrad.addColorStop(0.76, `rgba(192, 132, 252, ${(intensity * 0.18).toFixed(3)})`);
    curtainGrad.addColorStop(1, 'rgba(192, 132, 252, 0)');

    ctx.fillStyle = curtainGrad;
    ctx.fillRect(cx - col.widthPx * 0.5, topY, col.widthPx, colH);
  }
  ctx.restore();
  updateAndDrawSparkPool(ctx, world.auroraSparks, glowSprites, dtScale, dtSeconds, animate);

  const orbX = width * 0.78 - mouse.normX * 6;
  const orbY = height * 0.22 - mouse.normY * 4;
  drawBlendedOffscreenLayer(
    ctx,
    terrainLayers?.prev?.celestialOrbLayer,
    terrainLayers?.next?.celestialOrbLayer,
    terrainLayers?.blend ?? 1,
    -mouse.normX * 6,
    -mouse.normY * 4,
    width,
    height,
  );

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const mouseGlowFactor = mouse.active ? 1.12 : 1;
  const novaMul = 1 + world.novaSceneBoost * 0.3;
  for (let i = 0; i < CREPUSCULAR_RAYS.length; i += 1) {
    const ray = CREPUSCULAR_RAYS[i];
    if (!ray) continue;
    const theta = ((ray.angleDeg - mouse.normX * 7) * Math.PI) / 180;
    const halfSpread = (ray.spreadDeg * Math.PI) / 180;
    const rayLen = Math.max(width, height) * ray.lengthRatio;
    const endX1 = orbX + Math.cos(theta - halfSpread) * rayLen;
    const endY1 = orbY + Math.sin(theta - halfSpread) * rayLen;
    const endX2 = orbX + Math.cos(theta + halfSpread) * rayLen;
    const endY2 = orbY + Math.sin(theta + halfSpread) * rayLen;
    const shimmer = 0.84 + 0.16 * Math.sin(tSec * 0.55 + i * 1.1);
    const alpha = Math.min(
      0.09,
      ray.intensity * shimmer * mouseGlowFactor * novaMul * palette.rayIntensity,
    );
    const tint = ray.warm ? palette.rayWarm : palette.rayCool;
    const rayGrad = ctx.createLinearGradient(orbX, orbY, (endX1 + endX2) / 2, (endY1 + endY2) / 2);
    rayGrad.addColorStop(0, rgbaString(tint, alpha));
    rayGrad.addColorStop(0.55, rgbaString(tint, alpha * 0.28));
    rayGrad.addColorStop(1, rgbaString(tint, 0));
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(orbX, orbY);
    ctx.lineTo(endX1, endY1);
    ctx.lineTo(endX2, endY2);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  renderStarFieldAndChimLac(
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
  );
}

function renderStarFieldAndChimLac(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tSec: number,
  dtSeconds: number,
  dtScale: number,
  animate: boolean,
  palette: AtmospherePalette,
  sprites: AtmosphereSpriteCache,
  glowSprites: GlowSpriteCache,
  mouse: AtmosphereMouseState,
  world: AtmosphereWorld,
): void {
  const starVis = palette.starIntensity;
  const skyMouseActive = animate && mouse.active && mouse.y < height * 0.62;
  const proxyRadius = 155;
  const nearStars: { x: number; y: number; distRatio: number }[] = [];

  for (const star of world.stars) {
    const sx = star.nx * width;
    const sy = star.ny * height;
    const twinkle = 0.56 + 0.44 * Math.sin(tSec * star.twinkleSpeed + star.phase);
    let alpha = star.baseAlpha * twinkle * starVis;
    let drawSize = star.size * 2.25;

    for (const np of world.novaPulses) {
      if (!np.active) continue;
      const ringDelta = Math.abs(Math.hypot(sx - np.x, sy - np.y) - np.radius);
      if (ringDelta < 52) {
        const boost = (1 - ringDelta / 52) * np.alpha;
        alpha = Math.min(1, alpha + boost * 0.72);
        drawSize += boost * 4.0;
      }
    }

    if (skyMouseActive) {
      const dist = Math.hypot(mouse.x - sx, mouse.y - sy);
      if (dist <= proxyRadius) {
        const ratio = 1 - dist / proxyRadius;
        alpha = Math.min(1, alpha + ratio * (0.35 + starVis * 0.35));
        drawSize += ratio * 3.6;
        if (nearStars.length < 18) nearStars.push({ x: sx, y: sy, distRatio: ratio });
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
      ctx.arc(sx, sy, star.size * 0.28, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (nearStars.length > 1) {
    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < nearStars.length; i += 1) {
      const a = nearStars[i]!;
      for (let j = i + 1; j < nearStars.length; j += 1) {
        const b = nearStars[j]!;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d <= 112) {
          const edgeAlpha = (1 - d / 112) * Math.min(a.distRatio, b.distRatio) * 0.72 + 0.05;
          ctx.strokeStyle = `rgba(243, 201, 120, ${Math.min(0.85, edgeAlpha).toFixed(3)})`;
          ctx.lineWidth = 0.7;
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
        7 + a.distRatio * 4,
        0.55 + a.distRatio * 0.35,
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
        const left = Math.random() > 0.35;
        meteor.active = true;
        meteor.x = left
          ? width * (0.12 + Math.random() * 0.34)
          : width * (0.58 + Math.random() * 0.24);
        meteor.y = height * (0.04 + Math.random() * 0.14);
        meteor.vx = (left ? 1 : -0.85) * (11.5 + Math.random() * 4.5);
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
      if (progress >= 1 || meteor.y > height * 0.55) {
        meteor.active = false;
      } else {
        const fade = Math.sin(progress * Math.PI);
        const mag = Math.hypot(meteor.vx, meteor.vy) || 1;
        const tailX = meteor.x - (meteor.vx / mag) * meteor.length;
        const tailY = meteor.y - (meteor.vy / mag) * meteor.length;
        const grad = ctx.createLinearGradient(tailX, tailY, meteor.x, meteor.y);
        grad.addColorStop(0, 'rgba(243, 201, 120, 0)');
        grad.addColorStop(1, `rgba(255, 251, 236, ${(0.95 * fade).toFixed(3)})`);
        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.0;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(meteor.x, meteor.y);
        ctx.stroke();
        ctx.restore();
      }
    }

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
      ctx.lineWidth = 2.0;
      ctx.strokeStyle = `rgba(243, 201, 120, ${pulse.alpha.toFixed(3)})`;
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const bird of world.chimLacFlock) {
    if (animate) {
      bird.xRatio += bird.speedX * dtSeconds;
      if (bird.xRatio > 1.15) bird.xRatio = -0.15;
    }
    const bx = bird.xRatio * width;
    const by = bird.yRatio * height + Math.sin(tSec * 1.4 + bird.phase) * 8;
    const s = bird.wingSpan * bird.z;
    const flapWave = Math.sin(tSec * 4.2 + bird.phase);
    const elbowLift = -s * (0.2 + flapWave * 0.34);
    const tipLift = -s * (0.1 + flapWave * 0.56);

    if (animate && flapWave > 0.62 && bird.prevWingY <= 0.62) {
      spawnSparkFromPool(
        world.chimLacSparks,
        bx - s * 0.34,
        by + tipLift,
        -0.5,
        0.18,
        4.8,
        0.9,
        'gold',
      );
      spawnSparkFromPool(world.chimLacSparks, bx - s * 1.15, by + 2, -0.6, 0.05, 4.2, 0.85, 'gold');
    }
    bird.prevWingY = flapWave;

    ctx.strokeStyle = 'rgba(243, 201, 120, 0.82)';
    ctx.lineWidth = 1.05 * bird.z;
    ctx.beginPath();
    ctx.moveTo(bx + s * 0.88, by - s * 0.14);
    ctx.lineTo(bx + s * 0.18, by - s * 0.08);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx - s * 1.18, by + s * 0.1);
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + s * 0.04, by + elbowLift * 0.88);
    ctx.lineTo(bx - s * 0.32, by + tipLift * 0.94);
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - s * 0.16, by + elbowLift * 0.64);
    ctx.lineTo(bx - s * 0.54, by + tipLift * 0.68);
    ctx.stroke();

    for (const pt of [
      [bx + s * 0.88, by - s * 0.14],
      [bx, by],
      [bx - s * 1.18, by + s * 0.1],
      [bx - s * 0.32, by + tipLift * 0.94],
    ] as const) {
      drawGlowSprite(ctx, glowSprites.gold, pt[0], pt[1], 5.0 * bird.z, 0.85, '#F3C978');
    }
  }
  ctx.restore();
  updateAndDrawSparkPool(ctx, world.chimLacSparks, glowSprites, dtScale, dtSeconds, animate);
}

/* ============================================================================
 * LỚP 2: DISTANT & MID FRACTAL RIDGES + RIM-LIGHT PASS + VỌNG TINH CÁC
 * ============================================================================ */
function renderLayer2FractalRidgesAndTerraces(data: RenderContextData): void {
  const {
    ctx,
    width,
    height,
    tSec,
    scrollProgress,
    palette,
    mouse,
    world,
    glowSprites,
    terrainLayers,
  } = data;
  const ox = -mouse.normX * 12;
  const oy = -mouse.normY * 6 - scrollProgress * 10;

  drawBlendedOffscreenLayer(
    ctx,
    terrainLayers?.prev?.ridgesAndArchitectureLayer,
    terrainLayers?.next?.ridgesAndArchitectureLayer,
    terrainLayers?.blend ?? 1,
    ox,
    oy,
    width,
    height,
  );

  const cursorAzimuth = mouse.active ? mouse.normX : Math.sin(tSec * 0.25) * 0.4;
  ctx.save();
  ctx.lineCap = 'round';
  for (const g of world.terraceGlints) {
    const x = g.nx * width + ox;
    const y = g.ny * height + oy;
    const angleMatch =
      g.side === 'west'
        ? Math.max(0, 0.72 - cursorAzimuth * 0.65)
        : Math.max(0, 0.72 + cursorAzimuth * 0.65);
    const shimmer = 0.5 + 0.5 * Math.sin(tSec * 2.1 + g.phase + cursorAzimuth * 3);
    const alpha = Math.min(
      0.86,
      (0.16 + shimmer * 0.38) * angleMatch + world.novaSceneBoost * 0.48,
    );

    ctx.strokeStyle = rgbaString(palette.terraceRim, alpha);
    ctx.lineWidth = 1.05;
    ctx.beginPath();
    ctx.moveTo(x - g.arcSpan * 0.5, y);
    ctx.quadraticCurveTo(x, y + (g.side === 'west' ? 2.2 : -2.2), x + g.arcSpan * 0.5, y);
    ctx.stroke();

    if (alpha > 0.46) {
      drawGlowSprite(ctx, glowSprites.gold, x, y, 5.5, (alpha - 0.3) * 0.7, '#F3C978');
    }
  }
  ctx.restore();
}

/* ============================================================================
 * LỚP 3: OROGRAPHIC CLOUD-FALL & ILLUMINATED PAVILION PATH (Thác Mây & Ánh Đèn Lầu)
 * ============================================================================ */
function renderLayer3CloudFallAndPavilionGlow(
  data: RenderContextData,
  geom: HeroTerrainGeometry | undefined,
): void {
  const {
    ctx,
    width,
    height,
    tSec,
    dtSeconds,
    sprites,
    glowSprites,
    mouse,
    scrollProgress,
    animate,
    world,
  } = data;
  const ox = -mouse.normX * 12;
  const oy = -mouse.normY * 6 - scrollProgress * 10;

  const originX = (geom?.saddleOrigin.x ?? width * 0.42) + ox;
  const originY = (geom?.saddleOrigin.y ?? height * 0.445) + oy;
  const slopeSpanX = width * 0.085;
  const slopeSpanY = height * 0.25;
  const cloudSprite = sprites.cloudPearl ?? sprites.waterfallMist;

  if (cloudSprite && typeof ctx.drawImage === 'function') {
    for (const puff of world.cloudFallPuffs) {
      if (animate) {
        puff.progress = (puff.progress + puff.speed * dtSeconds) % 1;
      }
      const p = puff.progress;
      const curveX =
        originX +
        p * slopeSpanX * puff.vx +
        Math.sin(p * Math.PI * 1.5 + puff.phase) * 14 +
        puff.lateralOffset * (0.4 + p);
      const curveY = originY + p * p * slopeSpanY * puff.vy;
      const edgeFade = Math.sin(p * Math.PI);
      const scale = 0.65 + p * 0.85;
      const rx = puff.radiusX * scale;
      const ry = puff.radiusY * scale;

      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(0.48, puff.opacity * edgeFade);
      ctx.drawImage(cloudSprite, curveX - rx, curveY - ry, rx * 2, ry * 2);
      ctx.globalAlpha = prevAlpha;
    }
  }

  if (geom) {
    const pavX = geom.pavilion.cx + ox;
    const pavY = geom.pavilion.baseY - geom.pavilion.height * 0.35 + oy;
    const pavPulse = 0.78 + 0.22 * Math.sin(tSec * 2.1);
    drawGlowSprite(ctx, glowSprites.gold, pavX, pavY, 26 * pavPulse, 0.38, '#FFB74D');

    for (let i = 0; i < geom.pavilion.stoneLanterns.length; i += 1) {
      const l = geom.pavilion.stoneLanterns[i]!;
      const twinkle = 0.68 + 0.32 * Math.sin(tSec * 2.6 + i * 1.2);
      drawGlowSprite(ctx, glowSprites.gold, l.x + ox, l.y + oy, 8.5 * twinkle, 0.32, '#FFD166');
    }
  }
}

/* ============================================================================
 * LỚP 4: MULTI-STREAM GORGE WATERFALL, STONE ARCH BRIDGE & FRESNEL LAKE
 * ============================================================================ */
function renderLayer4WaterfallAndFresnelLake(
  data: RenderContextData,
  geom: HeroTerrainGeometry | undefined,
): void {
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
    palette,
    mouse,
    world,
  } = data;
  const ox = -mouse.normX * 12;
  const oy = -mouse.normY * 6 - scrollProgress * 10;

  const gorgeCx = (geom?.gorge.centerX ?? width * 0.486) + ox;
  const topY = (geom?.gorge.topY ?? height * 0.455) + oy;
  const bottomY = (geom?.gorge.bottomY ?? height * 0.728) + oy;
  const fallSpan = Math.max(bottomY - topY, 64);

  ctx.save();
  const basinGrad = ctx.createRadialGradient(gorgeCx, bottomY, 4, gorgeCx, bottomY, width * 0.08);
  basinGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
  basinGrad.addColorStop(0.55, 'rgba(56, 189, 248, 0.14)');
  basinGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = basinGrad;
  ctx.beginPath();
  ctx.ellipse(gorgeCx, bottomY + 4, width * 0.08, height * 0.032, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(186, 230, 253, 0.38)';
  ctx.lineWidth = 4.2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(gorgeCx, bottomY + 2);
  ctx.bezierCurveTo(
    gorgeCx - width * 0.035,
    bottomY + height * 0.04,
    gorgeCx + width * 0.055,
    bottomY + height * 0.075,
    gorgeCx + width * 0.03,
    bottomY + height * 0.115,
  );
  ctx.stroke();
  ctx.restore();

  if (geom) {
    ctx.save();
    ctx.lineCap = 'round';
    for (const stream of geom.streams) {
      const streamGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
      streamGrad.addColorStop(0, 'rgba(248, 251, 255, 0.78)');
      streamGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.62)');
      streamGrad.addColorStop(1, 'rgba(56, 189, 248, 0.22)');

      ctx.strokeStyle = streamGrad;
      ctx.lineWidth = stream.widthBase * (0.9 + 0.15 * Math.sin(tSec * 4.4 + stream.phase));
      ctx.beginPath();
      for (let i = 0; i < stream.points.length; i += 1) {
        const pt = stream.points[i]!;
        const wave = Math.sin(tSec * 5.4 + i * 0.6 + stream.phase) * 1.4;
        const sx = pt.x + ox + wave;
        const sy = pt.y + oy;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  const streakSprite = sprites.waterStreak;
  const spraySprite = sprites.waterfallSpray;
  for (let i = 0; i < world.waterfallDrops.length; i += 1) {
    const drop = world.waterfallDrops[i]!;
    if (animate) {
      drop.vy = Math.min(drop.vy + 0.088 * dtScale, 4.9);
      drop.yProgress += drop.vy * 0.0115 * dtScale;
      drop.xOffset += drop.vx * dtScale;
      if (!drop.bounced && drop.yProgress >= 0.36 && drop.yProgress < 0.66) {
        drop.bounced = true;
        drop.vx = (deterministicUnit(drop.length + tSec * 1.7) - 0.5) * 0.52;
      }
      if (drop.yProgress >= 1) {
        drop.yProgress = 0;
        drop.vy = 1.2 + deterministicUnit(tSec * 10 + drop.length) * 0.85;
        drop.vx = (deterministicUnit(drop.width + tSec) - 0.5) * 0.14;
        drop.xOffset = (deterministicUnit(drop.alpha + tSec) - 0.5) * 7;
        drop.bounced = false;
      }
    }

    const stream = geom?.streams[drop.streamIndex];
    let dx = gorgeCx + (drop.streamIndex - 2) * 7 + drop.xOffset;
    if (stream && stream.points.length > 1) {
      const fIdx = drop.yProgress * (stream.points.length - 1);
      const lo = Math.floor(fIdx);
      const hi = Math.min(stream.points.length - 1, lo + 1);
      const frac = fIdx - lo;
      const px = stream.points[lo]!.x * (1 - frac) + stream.points[hi]!.x * frac;
      dx = px + ox + drop.xOffset;
    }
    const dy = topY + drop.yProgress * fallSpan;

    if (i % 3 === 0 && spraySprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      const spraySize = 3.2 + drop.width;
      ctx.globalAlpha = prevAlpha * Math.min(0.84, drop.alpha * 0.9);
      ctx.drawImage(spraySprite, dx - spraySize / 2, dy - spraySize / 2, spraySize, spraySize);
      ctx.globalAlpha = prevAlpha;
    } else if (streakSprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      const stretchLen = drop.length * (0.65 + drop.vy * 0.35);
      ctx.globalAlpha = prevAlpha * drop.alpha;
      ctx.drawImage(
        streakSprite,
        dx - drop.width * 0.85,
        dy - stretchLen / 2,
        drop.width * 1.7,
        stretchLen,
      );
      ctx.globalAlpha = prevAlpha;
    }
  }

  if (geom) {
    drawStoneArchBridge(
      ctx,
      {
        ...geom.bridge,
        leftX: geom.bridge.leftX + ox,
        rightX: geom.bridge.rightX + ox,
        deckY: geom.bridge.deckY + oy,
        archCrownY: geom.bridge.archCrownY + oy,
      },
      palette,
    );
  }

  const mistSprite = sprites.waterfallMist;
  for (const puff of world.waterfallMist) {
    if (animate) {
      puff.life += dtSeconds;
      puff.xOffset += puff.vx * dtScale;
      puff.yOffset += puff.vy * dtScale;
      if (puff.life >= puff.maxLife) {
        puff.life = 0;
        puff.xOffset = (deterministicUnit(tSec * 13 + puff.radius) - 0.5) * 44;
        puff.yOffset = 0;
      }
    }
    const ratio = puff.life / puff.maxLife;
    const fade = Math.sin(ratio * Math.PI);
    const tierY =
      topY + fallSpan * (puff.tierIndex === 0 ? 0.34 : puff.tierIndex === 1 ? 0.65 : 0.98);
    if (mistSprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(0.62, puff.alpha * fade);
      ctx.drawImage(
        mistSprite,
        gorgeCx + puff.xOffset - puff.radius,
        tierY + puff.yOffset - puff.radius * 0.6,
        puff.radius * 2,
        puff.radius * 1.2,
      );
      ctx.globalAlpha = prevAlpha;
    }
  }

  renderFresnelMountainLake(
    ctx,
    width,
    height,
    tSec,
    dtSeconds,
    dtScale,
    animate,
    geom,
    palette,
    mouse,
    world,
    ox,
    oy,
  );
}

function renderFresnelMountainLake(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  tSec: number,
  _dtSeconds: number,
  dtScale: number,
  animate: boolean,
  geom: HeroTerrainGeometry | undefined,
  palette: AtmospherePalette,
  mouse: AtmosphereMouseState,
  world: AtmosphereWorld,
  ox: number,
  oy: number,
): void {
  const lakeTopY = (geom?.lakeBounds.topY ?? height * 0.72) + oy * 0.5;
  const lakeBotY = (geom?.lakeBounds.bottomY ?? height * 0.88) + oy * 0.5;
  const lakeH = Math.max(24, lakeBotY - lakeTopY);
  const lakeLeftX = geom?.lakeBounds.leftX ?? width * 0.42;
  const lakeRightX = geom?.lakeBounds.rightX ?? width * 0.94;
  const lakeCx = (lakeLeftX + lakeRightX) * 0.5;
  const lakeRx = (lakeRightX - lakeLeftX) * 0.52;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(lakeCx, lakeTopY + lakeH * 0.5, lakeRx, lakeH * 0.52, 0, 0, Math.PI * 2);
  ctx.clip();

  const lakeBg = ctx.createLinearGradient(0, lakeTopY, 0, lakeBotY);
  lakeBg.addColorStop(0, '#071422');
  lakeBg.addColorStop(0.45, '#0D2238');
  lakeBg.addColorStop(1, '#102438');
  ctx.fillStyle = lakeBg;
  ctx.fillRect(lakeLeftX - 40, lakeTopY, lakeRightX - lakeLeftX + 80, lakeH);

  const pavReflectX = (geom?.pavilion.cx ?? width * 0.722) + ox * 0.8;
  for (let strip = 0; strip < 10; strip += 1) {
    const f = strip / 9;
    const sy = lakeTopY + lakeH * (0.08 + f * 0.82);
    const shimmerOffset = Math.sin(tSec * 2.2 + strip * 0.9) * (6 + f * 8);

    ctx.save();
    ctx.translate(width * 0.56 + shimmerOffset * 0.7, sy);
    ctx.scale(2.5, 0.35);
    const auroraRefGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, width * 0.055);
    const aAlpha = (0.12 - f * 0.06) * (0.4 + palette.starIntensity * 0.6);
    auroraRefGrad.addColorStop(
      0,
      strip % 2 === 0
        ? `rgba(52, 211, 153, ${Math.max(0.02, aAlpha).toFixed(3)})`
        : `rgba(56, 189, 248, ${Math.max(0.02, aAlpha).toFixed(3)})`,
    );
    auroraRefGrad.addColorStop(1, 'rgba(13, 34, 56, 0)');
    ctx.fillStyle = auroraRefGrad;
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.055, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(pavReflectX + shimmerOffset, sy);
    ctx.scale(2.5, 0.35);
    const colRad = Math.max(12, 10 + f * 14);
    const amberGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, colRad);
    const ambAlpha = 0.24 - f * 0.14 + Math.sin(tSec * 3.1 + strip) * 0.04;
    amberGrad.addColorStop(0, `rgba(255, 183, 77, ${Math.max(0.04, ambAlpha).toFixed(3)})`);
    amberGrad.addColorStop(
      0.55,
      `rgba(255, 159, 67, ${Math.max(0.02, ambAlpha * 0.45).toFixed(3)})`,
    );
    amberGrad.addColorStop(1, 'rgba(255, 183, 77, 0)');
    ctx.fillStyle = amberGrad;
    ctx.beginPath();
    ctx.arc(0, 0, colRad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.strokeStyle = 'rgba(220, 240, 255, 0.18)';
  ctx.lineWidth = 0.8;
  ctx.lineCap = 'round';
  for (let i = 0; i < 22; i += 1) {
    const f = i / 21;
    const ry = lakeTopY + lakeH * (0.08 + f * 0.84);
    const r1 = deterministicUnit(i * 31 + 211);
    const rxCenter = lakeLeftX + width * 0.04 + r1 * (lakeRightX - lakeLeftX - width * 0.08);
    const waveOffset = Math.sin(tSec * 2.2 + ry * 0.15) * (8 + f * 6);
    const segLen = 22 + (i % 5) * 14 + f * 18;
    ctx.beginPath();
    ctx.moveTo(rxCenter + waveOffset - segLen * 0.5, ry);
    ctx.lineTo(rxCenter + waveOffset + segLen * 0.5, ry);
    ctx.stroke();
  }

  if (animate && mouse.active) {
    trySpawnMouseLakeRipple(world, mouse.x, mouse.y, width, height, tSec * 1000);
  }
  for (const ripple of world.mouseLakeRipples) {
    if (!ripple.active) continue;
    if (animate) {
      ripple.rx += 0.55 * dtScale;
      ripple.alpha = Math.max(0, 0.54 * (1 - ripple.rx / ripple.maxRx));
      if (ripple.rx >= ripple.maxRx || ripple.alpha <= 0.015) {
        ripple.active = false;
        continue;
      }
    }
    ctx.strokeStyle = `rgba(220, 242, 255, ${ripple.alpha.toFixed(3)})`;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.ellipse(
      ripple.x,
      ripple.y,
      ripple.rx,
      ripple.rx / LAKE_RIPPLE_ASPECT_RATIO,
      0,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
  }

  ctx.restore();
}

/* ============================================================================
 * LỚP 5: ROLLING CLOUD SEA & DRIFTING LOTUS LANTERNS (Biển Mây & Hoa Đăng)
 * ============================================================================ */
function renderLayer5CloudSeaAndLanterns(data: RenderContextData): void {
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
    glowSprites,
    mouse,
    world,
  } = data;

  const lotusSprite = sprites.lotusLantern;
  for (const lotus of world.lotusLanterns) {
    if (animate) {
      lotus.nx += lotus.vx * dtSeconds;
      lotus.ny += lotus.vy * dtSeconds + Math.sin(tSec * 1.3 + lotus.phase) * 0.0004 * dtScale;
      if (lotus.nx > 0.89 || lotus.ny > 0.875) {
        lotus.nx = 0.475 + deterministicUnit(tSec + lotus.phase) * 0.04;
        lotus.ny = 0.735 + deterministicUnit(tSec * 2 + lotus.phase) * 0.02;
      }
    }
    const lx = lotus.nx * width;
    const ly = lotus.ny * height;
    const drawSize = 26 * lotus.scale;

    const shimmer = 0.5 + 0.5 * Math.sin(tSec * 3.8 + lotus.phase);
    const refX = lx + Math.sin(tSec * 2.5 + lotus.phase) * 2.5;
    drawGlowSprite(
      ctx,
      glowSprites.gold,
      refX,
      ly + 8 * lotus.scale,
      11 * lotus.scale,
      0.28 + shimmer * 0.22,
      '#FF9F43',
    );

    if (lotusSprite && typeof ctx.drawImage === 'function') {
      ctx.drawImage(lotusSprite, lx - drawSize / 2, ly - drawSize / 2, drawSize, drawSize);
    } else {
      drawGlowSprite(ctx, glowSprites.gold, lx, ly, 12 * lotus.scale, 0.85, '#FF9F43');
    }
  }

  const cloudLiftY = -scrollProgress * height * 0.08;
  const cloudCursorActive = animate && mouse.active && mouse.y > height * 0.58;
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
      ctx.globalAlpha = prevAlpha * (0.28 + glowWave * 0.25 + world.novaSceneBoost * 0.2);
      ctx.drawImage(subSprite, px - r, py - r * 0.6, r * 2, r * 1.2);
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
        puff.ny * height + Math.sin(tSec * 0.7 + puff.phase) * 8 * puff.depth + cloudLiftY;
      if (cloudCursorActive) {
        const dx = baseX + puff.dispX - mouse.x;
        const dy = baseY + puff.dispY - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150 && dist > 0.5) {
          const strength = (1 - dist / 150) * 2.6 * dtScale;
          puff.dispX += (dx / dist) * strength * 2.0 + mouse.vx * 0.2 * strength;
          puff.dispY += (dy / dist) * strength * 1.3 + mouse.vy * 0.15 * strength;
        }
      }
      puff.dispX += (0 - puff.dispX) * relaxFactor;
      puff.dispY += (0 - puff.dispY) * relaxFactor;
    }

    const px = puff.nx * width + puff.dispX;
    const py =
      puff.ny * height +
      Math.sin(tSec * 0.7 + puff.phase) * 8 * puff.depth +
      puff.dispY +
      cloudLiftY;
    const puffSprite = sprites[puff.variant];
    if (puffSprite && typeof ctx.drawImage === 'function') {
      const edgeFade =
        py > height * 0.86
          ? Math.max(0.16, 1 - ((py - height * 0.86) / (height * 0.22)) * 0.84)
          : 1;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(0.92, puff.opacity + scrollProgress * 0.12) * edgeFade;
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

  const bodySprite = sprites.lanternBody;
  const haloSprite = sprites.lanternHalo;
  for (const lantern of world.skyLanterns) {
    if (animate) {
      const speedMul = lantern.boosted ? 3.2 : 1.0;
      lantern.ny -= lantern.baseSpeedY * speedMul * dtSeconds;
      lantern.nx += Math.sin(tSec * lantern.swayFreq + lantern.phase) * lantern.swayAmp * dtSeconds;
      if (lantern.boostFlash > 0)
        lantern.boostFlash = Math.max(0, lantern.boostFlash - dtSeconds * 0.9);
      if (lantern.ny < -0.08) {
        lantern.ny = 0.78 + deterministicUnit(tSec + lantern.phase) * 0.1;
        lantern.nx = 0.12 + deterministicUnit(tSec * 2 + lantern.phase) * 0.76;
        lantern.boosted = false;
        lantern.boostFlash = 0;
      }
    }

    const altScale = Math.max(0.52, 1 - (0.78 - lantern.ny) * 0.48);
    const scale = (0.44 + lantern.z * 0.7) * altScale;
    const lx = lantern.nx * width;
    const ly = lantern.ny * height;
    const boostAdd = lantern.boostFlash * 0.85;

    if (haloSprite && typeof ctx.drawImage === 'function') {
      const haloR = (36 + boostAdd * 24) * scale;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(0.92, 0.56 + boostAdd * 0.4);
      ctx.drawImage(haloSprite, lx - haloR, ly - haloR, haloR * 2, haloR * 2);
      ctx.globalAlpha = prevAlpha;
    }
    if (bodySprite && typeof ctx.drawImage === 'function') {
      const bw = 22 * scale;
      const bh = 30 * scale;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(Math.sin(tSec * lantern.swayFreq + lantern.phase) * 0.08);
      ctx.globalAlpha = Math.min(1, 0.82 + lantern.z * 0.18 + boostAdd);
      ctx.drawImage(bodySprite, -bw / 2, -bh / 2, bw, bh);
      ctx.restore();
    } else {
      drawGlowSprite(ctx, glowSprites.gold, lx, ly, 14 * scale, 0.85, '#FFD166');
    }
  }
  updateAndDrawSparkPool(ctx, world.lanternSparks, glowSprites, dtScale, dtSeconds, animate);
}

/* ============================================================================
 * LỚP 6: FOREGROUND PINE SILHOUETTE (1.4x) & DoF BOKEH FIREFLIES (1.6x)
 * ============================================================================ */
function renderLayer6ForegroundPineAndBokeh(data: RenderContextData): void {
  const {
    ctx,
    width,
    height,
    tSec,
    dtScale,
    dtSeconds,
    scrollProgress,
    animate,
    sprites,
    mouse,
    world,
    terrainLayers,
  } = data;

  const fgShiftX = -mouse.normX * width * 0.014 * FOREGROUND_PINE_PARALLAX;
  const fgShiftY = -mouse.normY * height * 0.01 * FOREGROUND_PINE_PARALLAX + scrollProgress * 14;
  drawBlendedOffscreenLayer(
    ctx,
    terrainLayers?.prev?.foregroundPineLayer,
    terrainLayers?.next?.foregroundPineLayer,
    terrainLayers?.blend ?? 1,
    fgShiftX,
    fgShiftY,
    width,
    height,
  );

  for (const p of world.petals) {
    if (animate) {
      p.x += (p.vx + Math.sin(tSec * 0.85 + p.phase) * 0.25) * dtScale;
      p.y += (p.vy + Math.cos(tSec * 1.45 + p.phase * 1.3) * 0.22) * dtScale;
      p.rx += p.vrx * dtSeconds;
      p.ry += p.vry * dtSeconds;
      p.rz += p.vrz * dtSeconds;
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
    const petalSprite = sprites[p.tone];
    const drawSize = 24 * scalePerspective;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rz);
    ctx.scale(Math.max(0.32, Math.abs(Math.cos(p.ry))), Math.max(0.28, Math.abs(Math.cos(p.rx))));
    ctx.globalAlpha = Math.min(0.9, 0.45 + p.z * 0.35);
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

  const bokehShiftX = -mouse.normX * width * 0.018 * BOKEH_FIREFLY_PARALLAX;
  const bokehShiftY = -mouse.normY * height * 0.012 * BOKEH_FIREFLY_PARALLAX;
  for (const ff of world.bokehFireflies) {
    if (animate) {
      ff.x += (ff.vx + Math.sin(tSec * 0.8 + ff.phase) * 0.14) * dtScale;
      ff.y += ff.vy * dtScale;
      if (ff.y < height * 0.42) {
        ff.y = height * 0.94;
        ff.x =
          ff.side === 'left'
            ? (0.02 + deterministicUnit(ff.phase * 90 + tSec) * 0.19) * width
            : (0.79 + deterministicUnit(ff.phase * 90 + tSec) * 0.19) * width;
      }
    }
    const pulse = 0.68 + 0.32 * Math.sin(tSec * 1.9 + ff.phase);
    const drawAlpha = ff.alpha * pulse;
    const drawX = ff.x + bokehShiftX;
    const drawY = ff.y + bokehShiftY;
    const sprite = sprites[ff.tone];

    if (sprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * drawAlpha;
      ctx.drawImage(sprite, drawX - ff.radius, drawY - ff.radius, ff.radius * 2, ff.radius * 2);
      ctx.globalAlpha = prevAlpha;
    } else {
      ctx.fillStyle = `rgba(255, 209, 102, ${drawAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(drawX, drawY, ff.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/**
 * Kết xuất toàn bộ 6 lớp Pipeline 120fps (< 3ms/frame nhờ OffscreenCanvas cache + Object Pools).
 */
export function renderAtmosphereFrame(data: RenderContextData): void {
  const { ctx, width, height, terrainLayers } = data;
  ctx.clearRect(0, 0, width, height);

  const geom = terrainLayers?.next?.geometry ?? terrainLayers?.prev?.geometry;

  renderLayer1SkyAndCelestialOrb(data);
  renderLayer2FractalRidgesAndTerraces(data);
  renderLayer3CloudFallAndPavilionGlow(data, geom);
  renderLayer4WaterfallAndFresnelLake(data, geom);
  renderLayer5CloudSeaAndLanterns(data);
  renderLayer6ForegroundPineAndBokeh(data);
}
