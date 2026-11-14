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
  readonly waterfallMist: OffscreenSurface | null;
  readonly petalRose: OffscreenSurface | null;
  readonly petalGold: OffscreenSurface | null;
}

export interface StarMote {
  readonly nx: number;
  readonly ny: number;
  readonly size: number;
  readonly baseAlpha: number;
  readonly twinkleSpeed: number;
  readonly phase: number;
  readonly tone: 'starIvory' | 'starSilver' | 'starGold';
  readonly inMilkyWay: boolean;
}

export interface NovaPulse {
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
  readonly novaPulses: NovaPulse[];
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
  readonly animate: boolean;
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
  { angleDeg: -136, spreadDeg: 6.5, lengthRatio: 0.72, intensity: 0.14, warm: false },
  { angleDeg: -116, spreadDeg: 8.5, lengthRatio: 0.78, intensity: 0.19, warm: true },
  { angleDeg: -92, spreadDeg: 7.0, lengthRatio: 0.82, intensity: 0.16, warm: false },
  { angleDeg: -64, spreadDeg: 9.0, lengthRatio: 0.76, intensity: 0.21, warm: true },
  { angleDeg: -38, spreadDeg: 7.5, lengthRatio: 0.7, intensity: 0.15, warm: false },
  { angleDeg: 32, spreadDeg: 10.5, lengthRatio: 0.56, intensity: 0.13, warm: true },
  { angleDeg: 62, spreadDeg: 11.5, lengthRatio: 0.62, intensity: 0.17, warm: true },
  { angleDeg: 102, spreadDeg: 9.5, lengthRatio: 0.58, intensity: 0.12, warm: false },
];

const WATERFALL_ANCHOR_NX = 0.488;
const WATERFALL_TOP_NY = 0.496;
const WATERFALL_BOTTOM_NY = 0.696;

function makeSurface(w: number, h: number): OffscreenSurface | null {
  if (typeof OffscreenCanvas !== 'undefined') {
    try {
      return new OffscreenCanvas(w, h);
    } catch {
      // Fallback sang HTMLCanvasElement nếu trình duyệt hoặc JSDOM không hỗ trợ
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

/**
 * Khởi tạo toàn bộ Sprite Cache vào OffscreenCanvas đúng 1 lần khi Engine gắn kết:
 * - 3 mẫu sao ngân hà
 * - 4 mẫu cụm mây thể tích (#FBF9F2, #EDF1F4, #8FA6B8, #E8C594)
 * - Hào quang ẩn mây, tia thác nước, hơi sương chân thác & 2 mẫu cánh hoa đỗ quyên 3D
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
      [0, 'rgba(246, 211, 131, 0.55)'],
      [0.4, 'rgba(229, 184, 105, 0.28)'],
      [0.78, 'rgba(232, 197, 148, 0.08)'],
      [1, 'rgba(232, 197, 148, 0)'],
    ]),
    waterStreak: buildWaterStreakSprite(),
    waterfallMist: buildRadialSprite(64, 64, [
      [0, 'rgba(248, 251, 255, 0.78)'],
      [0.38, 'rgba(182, 212, 235, 0.4)'],
      [0.78, 'rgba(143, 166, 184, 0.12)'],
      [1, 'rgba(143, 166, 184, 0)'],
    ]),
    petalRose: buildPetalSprite('rose'),
    petalGold: buildPetalSprite('gold'),
  };
}

function deterministicUnit(seed: number): number {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return raw - Math.floor(raw);
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
      inMilkyWay,
    });
  }

  // Các điểm phản quang ánh sao trên mặt nước ruộng bậc thang (sườn Tây & Đông)
  const terraceGlints: TerraceGlint[] = [];
  for (let i = 0; i < 42; i += 1) {
    const isWest = i < 21;
    const t = (i % 21) / 20;
    const tier = i % 3;
    if (isWest) {
      terraceGlints.push({
        nx: 0.02 + t * 0.33,
        ny: 0.655 + tier * 0.026 + Math.sin(t * 4.2) * 0.012,
        arcSpan: 14 + (i % 4) * 5,
        phase: i * 0.7,
        side: 'west',
      });
    } else {
      terraceGlints.push({
        nx: 0.63 + t * 0.35,
        ny: 0.652 + tier * 0.025 + Math.cos(t * 4.5) * 0.012,
        arcSpan: 14 + (i % 4) * 5,
        phase: i * 0.7,
        side: 'east',
      });
    }
  }

  // Hạt nước Thác Bạc (120fps accelerating droplets)
  const waterfallDrops: WaterfallDrop[] = [];
  for (let i = 0; i < 90; i += 1) {
    const r1 = deterministicUnit(i + 401);
    const r2 = deterministicUnit(i + 503);
    waterfallDrops.push({
      xOffset: (r1 - 0.5) * 14,
      yProgress: r2,
      vy: 1.4 + r1 * 1.1,
      vx: (r2 - 0.5) * 0.14,
      length: 12 + r1 * 18,
      width: 2.2 + r2 * 2.8,
      alpha: 0.42 + r1 * 0.5,
      bounced: r2 > 0.46,
    });
  }

  // Đám mây sương bốc lên ở chân Thác Bạc
  const waterfallMist: WaterfallMistPuff[] = [];
  for (let i = 0; i < 16; i += 1) {
    const r1 = deterministicUnit(i + 601);
    const r2 = deterministicUnit(i + 703);
    waterfallMist.push({
      xOffset: (r1 - 0.5) * 38,
      yOffset: (r2 - 0.5) * 12,
      vx: (r1 - 0.5) * 0.35,
      vy: -(0.12 + r2 * 0.18),
      radius: 20 + r1 * 26,
      alpha: 0.48,
      life: r2 * 2.4,
      maxLife: 2.2 + r1 * 1.1,
    });
  }

  // Cụm mây thể tích 4 mẫu bồng bềnh từ chân núi ra toàn chiều rộng
  const variants: readonly VolumetricCloudPuff['variant'][] = [
    'cloudSlate',
    'cloudRoseGold',
    'cloudPearl',
    'cloudIvory',
  ];
  const cloudPuffs: VolumetricCloudPuff[] = [];
  const puffCount = 68;
  for (let i = 0; i < puffCount; i += 1) {
    const depthIdx = Math.floor((i / puffCount) * 4);
    const depth = (depthIdx + 1) / 4;
    const r1 = deterministicUnit(i + 809);
    const r2 = deterministicUnit(i + 907);
    const r3 = deterministicUnit(i + 1009);
    cloudPuffs.push({
      nx: ((i % 17) / 16) * 1.16 - 0.08 + (r1 - 0.5) * 0.05,
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

  // 28 cánh hoa đỗ quyên rừng Tây Bắc bay lượn 3 chiều
  const petals: RhododendronPetal[] = [];
  for (let i = 0; i < 28; i += 1) {
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

  // Đom đóm thung lũng ấm áp
  const fireflies: ValleyFirefly[] = [];
  for (let i = 0; i < 24; i += 1) {
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

  return {
    stars,
    terraceGlints,
    waterfallDrops,
    waterfallMist,
    cloudPuffs,
    subsurfacePools,
    petals,
    fireflies,
    novaPulses: [],
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

function renderDongSonCompassAndMilkyWay(data: RenderContextData): void {
  const { ctx, width, height, tSec, dtSeconds, animate, world } = data;

  // 1. Dải Ngân Hà mờ dịu chéo từ góc trên trái xuống sau đỉnh Phan Xi Păng
  ctx.save();
  ctx.translate(width * 0.46, height * 0.24);
  ctx.rotate(0.41);
  const pulse = 0.92 + Math.sin(tSec * 0.35) * 0.08;
  const bandGrad = ctx.createRadialGradient(0, 0, width * 0.04, 0, 0, width * 0.56);
  bandGrad.addColorStop(0, `rgba(92, 130, 166, ${(0.2 * pulse).toFixed(3)})`);
  bandGrad.addColorStop(0.38, `rgba(148, 196, 236, ${(0.12 * pulse).toFixed(3)})`);
  bandGrad.addColorStop(0.68, `rgba(229, 184, 105, ${(0.07 * pulse).toFixed(3)})`);
  bandGrad.addColorStop(1, 'rgba(11, 25, 44, 0)');
  ctx.scale(1.65, 0.34);
  ctx.fillStyle = bandGrad;
  ctx.beginPath();
  ctx.arc(0, 0, width * 0.56, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 2. Vòng Thiên Văn Đông Sơn chìm (opacity: 0.12) xoay chậm quanh sao Bắc Đẩu
  if (animate) {
    world.compassRotationRad = (world.compassRotationRad + dtSeconds * 0.025) % (Math.PI * 2);
  }
  const polarisX = width * 0.48;
  const polarisY = height * 0.175;
  const baseRadius = Math.max(120, Math.min(width * 0.17, height * 0.25));

  ctx.save();
  ctx.translate(polarisX, polarisY);
  ctx.rotate(world.compassRotationRad);
  ctx.strokeStyle = 'rgba(243, 201, 120, 0.12)';
  ctx.lineWidth = 0.85;

  // Vòng tọa độ cực đồng tâm
  for (const rMul of [0.38, 0.7, 1.0]) {
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * rMul, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 16 tia mặt trời Đông Sơn mảnh & chia độ
  ctx.beginPath();
  for (let k = 0; k < 16; k += 1) {
    const a = (k / 16) * Math.PI * 2;
    const innerR = k % 2 === 0 ? baseRadius * 0.16 : baseRadius * 0.44;
    const outerR = k % 2 === 0 ? baseRadius * 1.12 : baseRadius * 0.92;
    ctx.moveTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
    ctx.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
  }
  ctx.stroke();

  // Đường chéo cực mảnh tạo hệ tọa độ thiên cầu
  ctx.setLineDash([3, 7]);
  ctx.beginPath();
  ctx.arc(0, 0, baseRadius * 1.18, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function renderDynamicCrepuscularRays(data: RenderContextData): void {
  const { ctx, width, height, tSec, mouse, world } = data;
  // Nguồn sáng ẩn sau đỉnh chính Phan Xi Păng, dịch chuyển đối xứng với chuột
  const pivotX = width * (0.6 - mouse.normX * 0.075);
  const pivotY = height * (0.35 - mouse.normY * 0.045);
  const tiltShiftDeg = -mouse.normX * 12;
  const mouseGlowFactor = mouse.active ? 1.18 : 1;
  const novaMul = 1 + world.novaSceneBoost * 0.7;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

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

    const shimmer = 0.8 + 0.2 * Math.sin(tSec * 0.65 + i * 1.1);
    const alpha = Math.min(0.4, ray.intensity * shimmer * mouseGlowFactor * novaMul);

    const rayGrad = ctx.createLinearGradient(pivotX, pivotY, midEndX, midEndY);
    if (ray.warm) {
      rayGrad.addColorStop(0, `rgba(229, 184, 105, ${alpha.toFixed(3)})`);
      rayGrad.addColorStop(0.45, `rgba(232, 197, 148, ${(alpha * 0.42).toFixed(3)})`);
      rayGrad.addColorStop(1, 'rgba(229, 184, 105, 0)');
    } else {
      rayGrad.addColorStop(0, `rgba(130, 178, 224, ${alpha.toFixed(3)})`);
      rayGrad.addColorStop(0.5, `rgba(92, 130, 166, ${(alpha * 0.36).toFixed(3)})`);
      rayGrad.addColorStop(1, 'rgba(92, 130, 166, 0)');
    }

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

function renderStarMeshAndNovas(data: RenderContextData): void {
  const {
    ctx,
    width,
    height,
    tSec,
    dtSeconds,
    dtScale,
    animate,
    sprites,
    glowSprites,
    mouse,
    world,
  } = data;

  // Tương tác nối sao thời gian thực O(N) trong bán kính 160px quanh chuột trên bầu trời
  const skyMouseActive = animate && mouse.active && mouse.y < height * 0.66;
  const proxyRadius = 160;
  const nearStars: { x: number; y: number; distRatio: number }[] = [];

  for (const star of world.stars) {
    const sx = star.nx * width;
    const sy = star.ny * height;
    const twinkle = 0.56 + 0.44 * Math.sin(tSec * star.twinkleSpeed + star.phase);
    let alpha = star.baseAlpha * twinkle;
    let drawSize = star.size * 2.35;

    // Xung sóng ánh sáng thiên hà (Nova Pulse) làm sao bừng sáng khi đi qua
    if (world.novaPulses.length > 0) {
      for (const np of world.novaPulses) {
        const ringDelta = Math.abs(Math.hypot(sx - np.x, sy - np.y) - np.radius);
        if (ringDelta < 52) {
          const boost = (1 - ringDelta / 52) * np.alpha;
          alpha = Math.min(1, alpha + boost * 0.65);
          drawSize += boost * 4.2;
        }
      }
    }

    if (skyMouseActive) {
      const dist = Math.hypot(mouse.x - sx, mouse.y - sy);
      if (dist <= proxyRadius) {
        const ratio = 1 - dist / proxyRadius;
        alpha = Math.min(1, alpha + ratio * 0.52);
        drawSize += ratio * 3.8;
        if (nearStars.length < 22) {
          nearStars.push({ x: sx, y: sy, distRatio: ratio });
        }
      }
    }

    const sprite = sprites[star.tone];
    if (sprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(1, Math.max(0.08, alpha));
      ctx.drawImage(sprite, sx - drawSize / 2, sy - drawSize / 2, drawSize, drawSize);
      ctx.globalAlpha = prevAlpha;
    } else {
      ctx.fillStyle = `rgba(248, 246, 240, ${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(sx, sy, star.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Nối các ngôi sao trong bán kính 160px thành mạng chòm sao hình học sống động theo chuột
  if (nearStars.length > 1) {
    const linkMaxDist = 110;
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
      // Hạt sao bừng sáng khi nối lưới
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

  // Sao băng định kỳ (4s - 7s)
  if (animate) {
    const meteor = world.shootingStar;
    if (!meteor.active) {
      world.nextMeteorCountdownSec -= dtSeconds;
      if (world.nextMeteorCountdownSec <= 0) {
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

  // Cập nhật & vẽ Celestial Nova Pulse (Click lên bầu trời)
  if (animate && world.novaPulses.length > 0) {
    world.novaSceneBoost = Math.max(0, world.novaSceneBoost * Math.pow(0.955, dtScale));
    for (let i = world.novaPulses.length - 1; i >= 0; i -= 1) {
      const pulse = world.novaPulses[i];
      if (!pulse) continue;
      pulse.radius += pulse.speed * dtScale;
      pulse.alpha *= Math.pow(0.968, dtScale);

      if (pulse.radius >= pulse.maxRadius || pulse.alpha <= 0.015) {
        world.novaPulses.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.beginPath();
      ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = `rgba(243, 201, 120, ${pulse.alpha.toFixed(3)})`;
      ctx.stroke();

      if (pulse.radius > 28) {
        ctx.beginPath();
        ctx.arc(pulse.x, pulse.y, pulse.radius * 0.72, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = `rgba(130, 178, 224, ${(pulse.alpha * 0.55).toFixed(3)})`;
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

function renderMountainWaterfall(data: RenderContextData): void {
  const { ctx, width, height, tSec, dtScale, animate, sprites, world } = data;
  const anchorX = width * WATERFALL_ANCHOR_NX;
  const topY = height * WATERFALL_TOP_NY;
  const bottomY = height * WATERFALL_BOTTOM_NY;
  const fallSpan = Math.max(bottomY - topY, 60);

  // Dải bọt trắng mờ lượn sóng mềm liên tục thân Thác Bạc
  ctx.save();
  const mistFlowGrad = ctx.createLinearGradient(0, topY, 0, bottomY);
  mistFlowGrad.addColorStop(0, 'rgba(248, 251, 255, 0.34)');
  mistFlowGrad.addColorStop(0.55, 'rgba(200, 224, 240, 0.24)');
  mistFlowGrad.addColorStop(1, 'rgba(248, 246, 240, 0.05)');
  ctx.fillStyle = mistFlowGrad;
  const rippleShift = Math.sin(tSec * 5.2) * 1.4;
  ctx.beginPath();
  ctx.moveTo(anchorX - 5, topY);
  ctx.quadraticCurveTo(anchorX - 8 + rippleShift, topY + fallSpan * 0.5, anchorX - 11, bottomY);
  ctx.lineTo(anchorX + 11, bottomY);
  ctx.quadraticCurveTo(anchorX + 8 - rippleShift, topY + fallSpan * 0.5, anchorX + 5, topY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Hạt nước thác rơi có gia tốc (trọng lực) dùng sprite OffscreenCanvas
  const streakSprite = sprites.waterStreak;
  for (const drop of world.waterfallDrops) {
    if (animate) {
      drop.vy = Math.min(drop.vy + 0.065 * dtScale, 4.4);
      drop.yProgress += drop.vy * 0.011 * dtScale;
      drop.xOffset += drop.vx * dtScale;

      // Bậc đá giữa thác nhẹ làm nước tung nhẹ
      if (!drop.bounced && drop.yProgress >= 0.45) {
        drop.bounced = true;
        drop.vx = (deterministicUnit(drop.length + tSec) - 0.5) * 0.42;
      }

      if (drop.yProgress >= 1) {
        drop.yProgress = 0;
        drop.vy = 1.2 + deterministicUnit(tSec * 10 + drop.length) * 0.9;
        drop.vx = (deterministicUnit(drop.width + tSec) - 0.5) * 0.14;
        drop.xOffset = (deterministicUnit(drop.alpha + tSec) - 0.5) * 12;
        drop.bounced = false;
      }
    }

    const dx = anchorX + drop.xOffset;
    const dy = topY + drop.yProgress * fallSpan;
    const stretchLen = drop.length * (0.65 + drop.vy * 0.35);

    if (streakSprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * drop.alpha;
      ctx.drawImage(streakSprite, dx - drop.width, dy - stretchLen / 2, drop.width * 2, stretchLen);
      ctx.globalAlpha = prevAlpha;
    } else {
      ctx.fillStyle = `rgba(240, 248, 255, ${drop.alpha.toFixed(3)})`;
      ctx.fillRect(dx - 0.7, dy - stretchLen / 2, 1.4, stretchLen);
    }
  }

  // Đám sương mù rực sáng bốc lên tại chân Thác Bạc
  const mistSprite = sprites.waterfallMist;
  for (const puff of world.waterfallMist) {
    if (animate) {
      puff.life += data.dtSeconds;
      puff.xOffset += puff.vx * dtScale;
      puff.yOffset += puff.vy * dtScale;
      if (puff.life >= puff.maxLife) {
        puff.life = 0;
        puff.xOffset = (deterministicUnit(tSec * 13 + puff.radius) - 0.5) * 34;
        puff.yOffset = 0;
      }
    }

    const ratio = puff.life / puff.maxLife;
    const fade = Math.sin(ratio * Math.PI);
    const radius = puff.radius * (0.7 + ratio * 0.65);
    const px = anchorX + puff.xOffset;
    const py = bottomY + puff.yOffset - ratio * 16;

    if (mistSprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * Math.min(0.65, puff.alpha * fade);
      ctx.drawImage(mistSprite, px - radius, py - radius * 0.65, radius * 2, radius * 1.3);
      ctx.globalAlpha = prevAlpha;
    }
  }
}

function renderTerraceStarReflections(data: RenderContextData): void {
  const { ctx, width, height, tSec, mouse, world, glowSprites } = data;
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

    ctx.strokeStyle = `rgba(243, 201, 120, ${alpha.toFixed(3)})`;
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
  const { ctx, width, height, tSec, dtSeconds, dtScale, animate, sprites, mouse, world } = data;
  const cloudCursorActive = animate && mouse.active && mouse.y > height * 0.54;
  const partRadius = 150;
  const relaxFactor = frameDampFactor(3.4, dtSeconds);

  // Chớp sáng vàng ấm ẩn trong mây lan truyền giữa các thung lũng
  const subSprite = sprites.subsurfaceAmber;
  for (const pool of world.subsurfacePools) {
    if (animate) {
      pool.nx += pool.speed * 0.04 * dtScale;
      if (pool.nx > 1.15) pool.nx = -0.15;
      if (pool.nx < -0.15) pool.nx = 1.15;
    }
    const px = pool.nx * width;
    const py = pool.ny * height;
    const glowWave = 0.48 + 0.52 * Math.sin(tSec * 0.8 + pool.phase);
    const r = pool.radius * (0.92 + glowWave * 0.16);
    if (subSprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * (0.34 + glowWave * 0.34 + world.novaSceneBoost * 0.25);
      ctx.drawImage(subSprite, px - r, py - r * 0.62, r * 2, r * 1.24);
      ctx.globalAlpha = prevAlpha;
    }
  }

  // Vẽ các lớp cụm mây thể tích 4 mẫu đã cache + tương tác rẽ mây vật lý 150px
  for (const puff of world.cloudPuffs) {
    if (animate) {
      puff.nx += puff.speed * dtSeconds;
      if (puff.nx > 1.18) puff.nx = -0.18;
      if (puff.nx < -0.18) puff.nx = 1.18;

      const baseX = puff.nx * width;
      const baseY = puff.ny * height + Math.sin(tSec * 0.7 + puff.phase) * 9 * puff.depth;

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
    const py = puff.ny * height + Math.sin(tSec * 0.7 + puff.phase) * 9 * puff.depth + puff.dispY;
    const puffSprite = sprites[puff.variant];

    if (puffSprite && typeof ctx.drawImage === 'function') {
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = prevAlpha * puff.opacity;
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

  // 1. 3 dải lụa gió mảnh uốn lượn qua các đỉnh núi
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

  // 2. 28 Cánh hoa đỗ quyên rừng Tây Bắc xoay 3D bay lượn toàn màn hình
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

  // 3. Đom đóm thung lũng
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
 * Kết xuất toàn bộ 1 frame của Engine Khí Quyển Hoàng Liên Sơn 120fps.
 */
export function renderAtmosphereFrame(data: RenderContextData): void {
  const { ctx, width, height } = data;
  ctx.clearRect(0, 0, width, height);

  renderDongSonCompassAndMilkyWay(data);
  renderDynamicCrepuscularRays(data);
  renderStarMeshAndNovas(data);
  renderMountainWaterfall(data);
  renderTerraceStarReflections(data);
  renderVolumetricCloudSea(data);
  renderWindRibbonsPetalsAndFireflies(data);
}
