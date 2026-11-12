import { drawGlowSprite, type GlowSpriteCache } from '@/shared/lib/canvasSprites';
import {
  drawDF,
  drawPetal,
  mix,
  type LayerConfig,
  type PadConfig,
  type PetalData,
  rgb,
  rng,
} from './lotusCanvasEngine';

export interface FallingPetal {
  xRatio: number;
  yOffset: number;
  vx: number;
  vy: number;
  rot: number;
  rotSpeed: number;
  swayPhase: number;
  landed: boolean;
  waterYOffset: number;
  age: number;
  maxAge: number;
  scale: number;
}

export interface DrippingDewdrop {
  yOffset: number;
  vy: number;
  age: number;
}

export interface SplashMicroDroplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  radius: number;
}

export interface BaitPellet {
  x: number;
  y: number;
  vy: number;
  sinkOffset: number;
  age: number;
  maxAge: number;
  phase: number;
  eaten: boolean;
}

export interface WaterBubble {
  x: number;
  y: number;
  vy: number;
  radius: number;
  alpha: number;
  wobblePhase: number;
}

export interface InteractiveWaterRipple {
  readonly x: number;
  readonly y: number;
  readonly birthTime: number;
  readonly maxRadiusScale: number;
  readonly ringCount: number;
  readonly tint: 'emerald' | 'sound' | 'gold';
}

export interface FrogState {
  currentPadIdx: number;
  targetPadIdx: number;
  isJumping: boolean;
  jumpElapsed: number;
  jumpDuration: number;
  jumpStartXRatio: number;
  jumpStartYRatio: number;
  nextJumpAt: number;
  nextCroakAt: number;
  croakAge: number;
  facing: 1 | -1;
}

export interface PerchingDragonfly {
  readonly palette: 'jade' | 'crimson';
  readonly flightIndex: number;
  readonly perchTargetIdx: number; // 0: main bud, 1: left seed pod, 2: right bud/pod
  phase: number;
  cycleTimer: number;
  perchDuration: number;
  flightDuration: number;
  state: 'flying' | 'approaching' | 'perching' | 'departing';
  blend: number; // 0 = flying, 1 = perched
  x: number;
  y: number;
  heading: number;
}

export interface BoidMinnow {
  xRatio: number;
  yRatio: number;
  vx: number;
  vy: number;
  phase: number;
  scale: number;
}

export interface KoiSpeciesConfig {
  readonly ax: number;
  readonly ay: number;
  readonly sp: number;
  readonly ph: number;
  readonly sz: number;
  readonly baseColor: readonly [number, number, number];
  readonly spotColor: readonly [number, number, number];
  readonly accentColor?: readonly [number, number, number]; // Cho cá Tam Sắc Sanke
}

export interface DynamicKoiFish {
  readonly config: KoiSpeciesConfig;
  readonly fi: number;
  u: number;
  x: number;
  y: number;
  heading: number;
  boostTimer: number;
  speedMult: number;
  seekingBait: boolean;
  scatterTimeLeft: number;
  scatterVx: number;
  scatterVy: number;
  initialized: boolean;
}

export interface EnhancedFirefly {
  readonly baseXRatio: number;
  readonly baseYRatio: number;
  readonly rangeX: number;
  readonly rangeY: number;
  readonly speedX: number;
  readonly speedY: number;
  readonly pulseSpeed: number;
  readonly phase: number;
  readonly size: number;
  readonly haloRadius: number;
  x: number;
  y: number;
  swirlVx: number;
  swirlVy: number;
  trail: [number, number][];
}

export interface AquaticReed {
  readonly side: 'left' | 'right';
  readonly xOffsetRatio: number;
  readonly heightRatio: number;
  readonly curve: number;
  readonly phase: number;
  readonly width: number;
  readonly hasCattail: boolean;
}

export interface EcosystemState {
  elapsedTime: number;
  fallingPetals: FallingPetal[];
  nextPetalAt: number;
  drippingDrops: DrippingDewdrop[];
  nextDewdropAt: number;
  splashDroplets: SplashMicroDroplet[];
  baitPellets: BaitPellet[];
  bubbles: WaterBubble[];
  ripples: InteractiveWaterRipple[];
  frog: FrogState;
  dragonflies: PerchingDragonfly[];
  minnows: BoidMinnow[];
  koiFishes: DynamicKoiFish[];
  fireflies: EnhancedFirefly[];
  reeds: readonly AquaticReed[];
  padBounces: number[];
  perchTremors: [number, number, number];
  lastTrailRippleX: number;
  lastTrailRippleY: number;
  lastTrailRippleTime: number;
  pointerSmoothX: number | null;
  pointerSmoothY: number | null;
  pointerSpeed: number;
}

export const KOI_ROSTER: readonly KoiSpeciesConfig[] = [
  // 1. Kohaku cam-trắng
  {
    ax: 0.34,
    ay: 0.25,
    sp: 0.16,
    ph: 0.0,
    sz: 1.12,
    baseColor: [248, 244, 236],
    spotColor: [232, 86, 42],
  },
  // 2. Yamabuki Ogon (Vàng hoàng kim)
  {
    ax: 0.29,
    ay: 0.22,
    sp: 0.14,
    ph: 1.25,
    sz: 1.04,
    baseColor: [242, 186, 52],
    spotColor: [255, 224, 128],
  },
  // 3. Tancho Kohaku (Trắng sứ, đỉnh đầu đỏ son)
  {
    ax: 0.38,
    ay: 0.19,
    sp: 0.12,
    ph: 2.35,
    sz: 1.22,
    baseColor: [252, 250, 246],
    spotColor: [222, 46, 46],
  },
  // 4. Taisho Sanke (Tam sắc Trắng - Đỏ - Đen sumi)
  {
    ax: 0.32,
    ay: 0.17,
    sp: 0.15,
    ph: 3.45,
    sz: 1.08,
    baseColor: [250, 247, 240],
    spotColor: [226, 68, 44],
    accentColor: [38, 42, 48],
  },
  // 5. Yamabuki Vàng rực tầng sâu
  {
    ax: 0.41,
    ay: 0.23,
    sp: 0.11,
    ph: 4.5,
    sz: 1.16,
    baseColor: [236, 174, 46],
    spotColor: [254, 232, 165],
  },
  // 6. Kohaku đỏ rực cỡ trung
  {
    ax: 0.27,
    ay: 0.2,
    sp: 0.17,
    ph: 5.15,
    sz: 0.94,
    baseColor: [238, 92, 48],
    spotColor: [255, 246, 238],
  },
  // 7. Sanke nhỏ linh hoạt
  {
    ax: 0.35,
    ay: 0.15,
    sp: 0.18,
    ph: 5.9,
    sz: 0.9,
    baseColor: [248, 245, 238],
    spotColor: [218, 58, 46],
    accentColor: [42, 46, 52],
  },
  // 8. Kohaku mượt thanh thoát
  {
    ax: 0.3,
    ay: 0.24,
    sp: 0.13,
    ph: 0.68,
    sz: 1.0,
    baseColor: [252, 249, 244],
    spotColor: [236, 104, 52],
  },
];

export function computeKoiParametricPos(
  config: KoiSpeciesConfig,
  u: number,
  W: number,
  H: number,
): [number, number] {
  return [
    W * (0.5 + config.ax * Math.sin(u) + 0.09 * Math.sin(2.1 * u + 1)),
    H * (0.64 + config.ay * Math.sin(1.4 * u + 0.7)),
  ];
}

export function makeDewdropSprite(): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas');
  c.width = 32;
  c.height = 32;
  const g = c.getContext('2d');
  if (!g) return null;

  g.translate(16, 16);
  // Bóng đổ mềm dưới giọt sương
  g.beginPath();
  g.ellipse(2.2, 3, 10, 6.2, 0, 0, Math.PI * 2);
  g.fillStyle = 'rgba(4, 30, 18, 0.35)';
  g.fill();

  // Thân giọt sương thủy ngân trong suốt phản xạ xanh ngọc & ánh sáng trắng
  const rad = 9.5;
  const grad = g.createRadialGradient(-rad * 0.32, -rad * 0.34, 0.6, 0, 0, rad);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.96)');
  grad.addColorStop(0.28, 'rgba(220, 255, 240, 0.68)');
  grad.addColorStop(0.75, 'rgba(130, 215, 175, 0.28)');
  grad.addColorStop(1, 'rgba(14, 65, 42, 0.56)');

  g.beginPath();
  g.arc(0, 0, rad, 0, Math.PI * 2);
  g.fillStyle = grad;
  g.fill();

  // Đốm lóe sáng lấp lánh trên đỉnh giọt nước
  g.beginPath();
  g.ellipse(-rad * 0.36, -rad * 0.38, rad * 0.26, rad * 0.16, -0.5, 0, Math.PI * 2);
  g.fillStyle = 'rgba(255, 255, 255, 0.95)';
  g.fill();

  return c;
}

export function buildEcosystemState(padCount: number): EcosystemState {
  const rand = rng(2026);

  // 40 chú đom đóm đêm kèm bộ nhớ vệt sáng 4 điểm
  const fireflies: EnhancedFirefly[] = [];
  for (let i = 0; i < 40; i += 1) {
    const baseX = 0.08 + rand() * 0.84;
    const baseY = 0.16 + rand() * 0.62;
    fireflies.push({
      baseXRatio: baseX,
      baseYRatio: baseY,
      rangeX: 26 + rand() * 48,
      rangeY: 16 + rand() * 32,
      speedX: 0.22 + rand() * 0.34,
      speedY: 0.18 + rand() * 0.36,
      pulseSpeed: 1.25 + rand() * 1.55,
      phase: rand() * Math.PI * 2,
      size: 1.35 + rand() * 0.55,
      haloRadius: 9 + rand() * 5,
      x: baseX,
      y: baseY,
      swirlVx: 0,
      swirlVy: 0,
      trail: [],
    });
  }

  // Đàn 12 cá nhỏ (boids) bơi gần vùng gốc sen
  const minnows: BoidMinnow[] = [];
  for (let i = 0; i < 12; i += 1) {
    const angle = (i / 12) * Math.PI * 2;
    minnows.push({
      xRatio: 0.45 + Math.cos(angle) * 0.08 + (rand() - 0.5) * 0.04,
      yRatio: 0.66 + Math.sin(angle) * 0.045 + (rand() - 0.5) * 0.03,
      vx: (rand() - 0.5) * 0.06,
      vy: (rand() - 0.5) * 0.035,
      phase: rand() * Math.PI * 2,
      scale: 0.85 + rand() * 0.3,
    });
  }

  // Cỏ thủy sinh ven bờ trái & phải
  const reeds: AquaticReed[] = [
    {
      side: 'left',
      xOffsetRatio: 0.025,
      heightRatio: 0.42,
      curve: 0.25,
      phase: 0.2,
      width: 3.4,
      hasCattail: true,
    },
    {
      side: 'left',
      xOffsetRatio: 0.042,
      heightRatio: 0.34,
      curve: 0.42,
      phase: 1.1,
      width: 2.6,
      hasCattail: false,
    },
    {
      side: 'left',
      xOffsetRatio: 0.06,
      heightRatio: 0.46,
      curve: 0.18,
      phase: 2.0,
      width: 3.0,
      hasCattail: true,
    },
    {
      side: 'left',
      xOffsetRatio: 0.082,
      heightRatio: 0.28,
      curve: 0.55,
      phase: 2.8,
      width: 2.2,
      hasCattail: false,
    },
    {
      side: 'right',
      xOffsetRatio: 0.975,
      heightRatio: 0.44,
      curve: -0.24,
      phase: 0.7,
      width: 3.3,
      hasCattail: true,
    },
    {
      side: 'right',
      xOffsetRatio: 0.955,
      heightRatio: 0.36,
      curve: -0.45,
      phase: 1.8,
      width: 2.5,
      hasCattail: false,
    },
    {
      side: 'right',
      xOffsetRatio: 0.935,
      heightRatio: 0.48,
      curve: -0.16,
      phase: 2.5,
      width: 3.1,
      hasCattail: true,
    },
    {
      side: 'right',
      xOffsetRatio: 0.915,
      heightRatio: 0.29,
      curve: -0.52,
      phase: 3.3,
      width: 2.2,
      hasCattail: false,
    },
  ];

  const koiFishes: DynamicKoiFish[] = KOI_ROSTER.map((config, fi) => ({
    config,
    fi,
    u: config.ph,
    x: 0,
    y: 0,
    heading: 0,
    boostTimer: 0,
    speedMult: 1,
    seekingBait: false,
    scatterTimeLeft: 0,
    scatterVx: 0,
    scatterVy: 0,
    initialized: false,
  }));

  const dragonflies: PerchingDragonfly[] = [
    {
      palette: 'jade',
      flightIndex: 0,
      perchTargetIdx: 0,
      phase: 0.4,
      cycleTimer: 1.2,
      perchDuration: 3.8,
      flightDuration: 7.5,
      state: 'flying',
      blend: 0,
      x: 0,
      y: 0,
      heading: 0,
    },
    {
      palette: 'crimson',
      flightIndex: 1,
      perchTargetIdx: 1,
      phase: 2.7,
      cycleTimer: 4.1,
      perchDuration: 4.4,
      flightDuration: 8.8,
      state: 'flying',
      blend: 0,
      x: 0,
      y: 0,
      heading: 0,
    },
    {
      palette: 'jade',
      flightIndex: 2,
      perchTargetIdx: 2,
      phase: 4.9,
      cycleTimer: 6.4,
      perchDuration: 3.4,
      flightDuration: 9.6,
      state: 'flying',
      blend: 0,
      x: 0,
      y: 0,
      heading: 0,
    },
  ];

  return {
    elapsedTime: 0,
    fallingPetals: [],
    nextPetalAt: 3.2,
    drippingDrops: [],
    nextDewdropAt: 2.4,
    splashDroplets: [],
    baitPellets: [],
    bubbles: [],
    ripples: [],
    frog: {
      currentPadIdx: 6, // Lá sen tiền cảnh lớn góc trái (x: 0.14, y: 0.13 sau wy)
      targetPadIdx: 7, // Lá sen lân cận góc dưới trái-giữa (x: 0.36, y: 0.2)
      isJumping: false,
      jumpElapsed: 0,
      jumpDuration: 0.68,
      jumpStartXRatio: 0.14,
      jumpStartYRatio: 0.13,
      nextJumpAt: 10.5,
      nextCroakAt: 3.2,
      croakAge: -1,
      facing: 1,
    },
    dragonflies,
    minnows,
    koiFishes,
    fireflies,
    reeds,
    padBounces: new Array<number>(padCount).fill(0),
    perchTremors: [0, 0, 0],
    lastTrailRippleX: -9999,
    lastTrailRippleY: -9999,
    lastTrailRippleTime: -999,
    pointerSmoothX: null,
    pointerSmoothY: null,
    pointerSpeed: 0,
  };
}

export function getPadCenter(
  pad: PadConfig,
  t: number,
  W: number,
  H: number,
  wy: number,
  bounceOffset = 0,
): [number, number] {
  const yy = pad.f ? wy + pad.y * H : pad.y * H;
  const x = pad.x * W + Math.sin(t * 0.12 + pad.p) * 6;
  const y = yy + Math.cos(t * 0.1 + pad.p) * 4 + bounceOffset;
  return [x, y];
}

export function pushRipple(
  state: EcosystemState,
  x: number,
  y: number,
  tint: 'emerald' | 'sound' | 'gold' = 'emerald',
  maxRadiusScale = 1,
  ringCount = 3,
) {
  state.ripples.push({
    x,
    y,
    birthTime: state.elapsedTime,
    maxRadiusScale,
    ringCount,
    tint,
  });
  if (state.ripples.length > 36) {
    state.ripples.shift();
  }
}

export function spawnBaitAt(state: EcosystemState, x: number, y: number, S: number) {
  pushRipple(state, x, y, 'gold', 1.15, 3);
  const count = 2 + (Math.round(x + y) % 2); // 2 hoặc 3 hạt sáng vàng
  for (let i = 0; i < count; i += 1) {
    const spreadX = (i - (count - 1) * 0.5) * 14 * S + ((i * 7) % 5) - 2;
    const spreadY = ((i % 2) * 8 - 4) * S;
    state.baitPellets.push({
      x: x + spreadX,
      y: y + spreadY,
      vy: (18 + i * 4) * S,
      sinkOffset: 0,
      age: 0,
      maxAge: 7.5,
      phase: i * 2.1,
      eaten: false,
    });
  }
  if (state.baitPellets.length > 18) {
    state.baitPellets.splice(0, state.baitPellets.length - 18);
  }
}

export function getRightLeafTip(W: number, H: number, t: number, S: number): [number, number] {
  const cx = W / 2;
  const cy = H * 0.5;
  const lx = Math.min(W - 70 * S, cx + 255 * S);
  const ly = cy + 10 * S;
  const r = 56 * S;
  const sway = Math.sin(t * 0.28 + 2) * 4 * S;
  // Mép phải rủ xuống của lá sen cao bên phải
  return [lx + sway + r * 0.88, ly + r * 0.14];
}

export function getPerchTargetCoord(
  targetIdx: number,
  W: number,
  H: number,
  t: number,
  S: number,
): [number, number] {
  const cx = W / 2;
  const cy = H * 0.5;
  const wy = cy + 140 * S;
  if (targetIdx === 0) {
    // Đỉnh nụ sen chính bên trái-trung tâm
    const bx = Math.max(70 * S, cx - 215 * S);
    const by = cy - 250 * S;
    const sw = Math.sin(t * 0.3) * 5 * S;
    return [bx + sw, by - 58 * S];
  }
  if (targetIdx === 1) {
    // Đỉnh gương sen cụm phụ bên trái
    const sx = W * 0.19 + Math.sin(t * 0.34 + 1.4) * 5 * S;
    const sy = wy - 148 * S;
    return [sx, sy - 10 * S];
  }
  // Đỉnh nụ / gương sen cụm phụ bên phải
  const rx = W * 0.81 + Math.sin(t * 0.31 + 2.8) * 5 * S;
  const ry = wy - 156 * S;
  return [rx, ry - 12 * S];
}

function getDragonflyCurvePoint(
  flightIndex: number,
  u: number,
  cx: number,
  cy: number,
  W: number,
  H: number,
  S: number,
): [number, number] {
  if (flightIndex === 1) {
    return [
      cx - W * 0.12 + Math.cos(u * 0.48 + 1.7) * W * 0.32 + Math.sin(u * 1.2) * 22 * S,
      cy - 95 * S + Math.sin(u * 0.4 + 2.5) * H * 0.16 + Math.cos(u * 1.1) * 12 * S,
    ];
  }
  if (flightIndex === 2) {
    return [
      cx + W * 0.14 + Math.sin(u * 0.44 + 0.9) * W * 0.28 + Math.cos(u * 1.05) * 24 * S,
      cy - 120 * S + Math.cos(u * 0.34 + 1.1) * H * 0.14 + Math.sin(u * 1.35) * 10 * S,
    ];
  }
  return [
    cx + Math.sin(u * 0.38) * W * 0.31 + Math.sin(u * 0.95) * 28 * S,
    cy - 135 * S + Math.sin(u * 0.31 + 1.0) * H * 0.15 + Math.sin(u * 1.28) * 14 * S,
  ];
}

export function stepEcosystem(
  state: EcosystemState,
  pads: readonly PadConfig[],
  W: number,
  H: number,
  S: number,
  wy: number,
  t: number,
  dtSeconds: number,
  pointerX: number | null,
  pointerY: number | null,
  theme: 'day' | 'night',
) {
  state.elapsedTime = t;
  const dt = Math.min(Math.max(dtSeconds, 0.001), 0.05);
  const cx = W * 0.5;
  const cy = H * 0.5;

  // Làm mượt vị trí con trỏ & phát hiện chuyển động trên mặt nước tạo chuỗi sóng elip
  if (pointerX !== null && pointerY !== null) {
    if (state.pointerSmoothX === null || state.pointerSmoothY === null) {
      state.pointerSmoothX = pointerX;
      state.pointerSmoothY = pointerY;
      state.pointerSpeed = 0;
    } else {
      const moveDist = Math.hypot(pointerX - state.pointerSmoothX, pointerY - state.pointerSmoothY);
      state.pointerSpeed = moveDist / dt;
      state.pointerSmoothX = pointerX;
      state.pointerSmoothY = pointerY;

      if (pointerY > wy * 0.68) {
        const trailDist = Math.hypot(
          pointerX - state.lastTrailRippleX,
          pointerY - state.lastTrailRippleY,
        );
        if (trailDist > 26 * S && t - state.lastTrailRippleTime > 0.055) {
          pushRipple(state, pointerX, pointerY, 'emerald', 0.72, 2);
          state.lastTrailRippleX = pointerX;
          state.lastTrailRippleY = pointerY;
          state.lastTrailRippleTime = t;
        }
      }
    }
  } else {
    state.pointerSmoothX = null;
    state.pointerSmoothY = null;
    state.pointerSpeed = 0;
  }

  // Suy giảm dao động nhún của các lá sen & làm lá sen dập dềnh khi rê chuột gần
  const bounceDamp = Math.exp(-5.2 * dt);
  for (let i = 0; i < state.padBounces.length; i += 1) {
    const pad = pads[i];
    if (!pad) continue;
    let bounce = (state.padBounces[i] ?? 0) * bounceDamp;
    if (pointerX !== null && pointerY !== null && state.pointerSpeed > 45) {
      const [px, py] = getPadCenter(pad, t, W, H, wy, 0);
      const d = Math.hypot(pointerX - px, pointerY - py);
      if (d < pad.r * 1.45 * S) {
        bounce = Math.min(8 * S, bounce + 2.8 * S * dt * 12);
      }
    }
    state.padBounces[i] = Math.abs(bounce) < 0.02 ? 0 : bounce;
  }

  // 1. Cánh hoa sen hồng rơi định kỳ mỗi 5s-8s
  if (t >= state.nextPetalAt) {
    const dir = (state.fallingPetals.length % 2 === 0 ? 1 : -1) * (10 + ((t * 7) % 14));
    state.fallingPetals.push({
      xRatio: 0.48 + (((t * 17) % 10) - 5) * 0.008,
      yOffset: -26 * S,
      vx: dir,
      vy: 24 * S,
      rot: -0.4 + ((t * 3) % 0.8),
      rotSpeed: (t % 2 < 1 ? 1 : -1) * 1.1,
      swayPhase: t * 1.7,
      landed: false,
      waterYOffset: 16 * S + ((t * 19) % 45) * S,
      age: 0,
      maxAge: 7.5,
      scale: 0.72 + ((t * 11) % 3) * 0.08,
    });
    state.nextPetalAt = t + 5.2 + ((t * 13) % 2.8);
  }

  for (let i = state.fallingPetals.length - 1; i >= 0; i -= 1) {
    const petal = state.fallingPetals[i];
    if (!petal) continue;
    petal.age += dt;
    if (!petal.landed) {
      petal.swayPhase += dt * 3.1;
      petal.xRatio += ((petal.vx + Math.sin(petal.swayPhase) * 26) * dt) / Math.max(W, 320);
      petal.yOffset += petal.vy * dt;
      petal.rot += petal.rotSpeed * dt;

      const worldY = cy + petal.yOffset;
      const landingY = wy + petal.waterYOffset;
      if (worldY >= landingY) {
        petal.landed = true;
        petal.yOffset = landingY - cy;
        const px = petal.xRatio * W;
        pushRipple(state, px, landingY, 'emerald', 0.65, 2);
      }
    } else {
      // Trôi lững lờ theo dòng nước trước khi mờ dần
      petal.xRatio += (11 * dt) / Math.max(W, 320);
      petal.rot += 0.14 * dt;
    }

    if (petal.age >= petal.maxAge) {
      state.fallingPetals.splice(i, 1);
    }
  }

  // 2. Giọt sương rơi có gia tốc trọng trường từ mép lá sen cao bên phải
  if (t >= state.nextDewdropAt) {
    state.drippingDrops.push({ yOffset: 0, vy: 12 * S, age: 0 });
    state.nextDewdropAt = t + 4.4 + ((t * 5) % 2.4);
  }

  const [tipX, tipY] = getRightLeafTip(W, H, t, S);
  const waterSurfaceY = wy + 34 * S;
  for (let i = state.drippingDrops.length - 1; i >= 0; i -= 1) {
    const drop = state.drippingDrops[i];
    if (!drop) continue;
    drop.age += dt;
    drop.vy += 420 * S * dt; // Gia tốc trọng trường thực
    drop.yOffset += drop.vy * dt;
    if (tipY + drop.yOffset >= waterSurfaceY) {
      pushRipple(state, tipX, waterSurfaceY, 'emerald', 0.88, 3);
      for (let d = 0; d < 5; d += 1) {
        const angle = -Math.PI * (0.2 + d * 0.15);
        state.splashDroplets.push({
          x: tipX + (d - 2) * 3 * S,
          y: waterSurfaceY,
          vx: Math.cos(angle) * (24 + d * 6) * S,
          vy: Math.sin(angle) * (46 + (d % 2) * 14) * S,
          alpha: 0.9,
          radius: 1.5 * S,
        });
      }
      state.drippingDrops.splice(i, 1);
    }
  }

  for (let i = state.splashDroplets.length - 1; i >= 0; i -= 1) {
    const sp = state.splashDroplets[i];
    if (!sp) continue;
    sp.vy += 240 * S * dt;
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    sp.alpha -= 1.8 * dt;
    if (sp.alpha <= 0.02) {
      state.splashDroplets.splice(i, 1);
    }
  }

  // 3. Mồi hạt sáng vàng & bọt khí
  for (let i = state.baitPellets.length - 1; i >= 0; i -= 1) {
    const bait = state.baitPellets[i];
    if (!bait) continue;
    bait.age += dt;
    bait.vy *= Math.exp(-1.5 * dt);
    bait.sinkOffset += bait.vy * dt;
    if (bait.eaten || bait.age >= bait.maxAge) {
      state.baitPellets.splice(i, 1);
    }
  }

  for (let i = state.bubbles.length - 1; i >= 0; i -= 1) {
    const b = state.bubbles[i];
    if (!b) continue;
    b.wobblePhase += dt * 7;
    b.y -= b.vy * dt;
    b.x += Math.sin(b.wobblePhase) * 9 * S * dt;
    b.alpha -= 0.72 * dt;
    if (b.alpha <= 0.02) {
      state.bubbles.splice(i, 1);
    }
  }

  // 4. Hành vi chú Ếch: ộp phồng túi thanh âm (~4s) & bật nhảy parabol (10s-14s hoặc khi rê chuột sát)
  const frog = state.frog;
  const curPad = pads[frog.currentPadIdx] ?? pads[6];
  const tgtPad = pads[frog.targetPadIdx] ?? pads[7];
  if (curPad && tgtPad) {
    const [curX, curY] = getPadCenter(
      curPad,
      t,
      W,
      H,
      wy,
      state.padBounces[frog.currentPadIdx] ?? 0,
    );
    if (!frog.isJumping) {
      if (t >= frog.nextCroakAt) {
        frog.croakAge = 0;
        frog.nextCroakAt = t + 3.8 + ((t * 3) % 0.9);
        pushRipple(state, curX + 4 * S, curY + 5 * S, 'sound', 1.05, 2);
      }
      if (frog.croakAge >= 0) {
        frog.croakAge += dt;
        if (frog.croakAge > 0.75) {
          frog.croakAge = -1;
        }
      }

      const cursorDist =
        pointerX !== null && pointerY !== null
          ? Math.hypot(pointerX - curX, pointerY - curY)
          : 9999;
      if (t >= frog.nextJumpAt || cursorDist < 42 * S) {
        frog.isJumping = true;
        frog.jumpElapsed = 0;
        frog.jumpStartXRatio = curX / Math.max(W, 1);
        frog.jumpStartYRatio = curY / Math.max(H, 1);
        frog.croakAge = -1;
        // Hoán đổi sang lá sen kia
        const [tx] = getPadCenter(tgtPad, t, W, H, wy, 0);
        frog.facing = tx >= curX ? 1 : -1;
        state.padBounces[frog.currentPadIdx] = 5.5 * S;
        pushRipple(state, curX, curY + 4 * S, 'emerald', 0.9, 2);
      }
    } else {
      frog.jumpElapsed += dt;
      if (frog.jumpElapsed >= frog.jumpDuration) {
        frog.isJumping = false;
        const landedIdx = frog.targetPadIdx;
        frog.targetPadIdx = frog.currentPadIdx;
        frog.currentPadIdx = landedIdx;
        frog.nextJumpAt = t + 10.5 + ((t * 7) % 3.5);
        frog.nextCroakAt = t + 2.4;
        const [landX, landY] = getPadCenter(tgtPad, t, W, H, wy, 0);
        state.padBounces[landedIdx] = 7.2 * S;
        pushRipple(state, landX, landY + 4 * S, 'emerald', 1.1, 3);
      }
    }
  }

  // 5. Chuồn chuồn bay lượn & đậu nghỉ 3s-5s trên nụ sen / gương sen
  state.perchTremors = [0, 0, 0];
  state.dragonflies.forEach((df, idx) => {
    const speed = theme === 'day' ? 0.78 : 0.56;
    df.phase += dt * speed;
    df.cycleTimer += dt;

    const u = df.phase + idx * 14.2;
    const [fx, fy] = getDragonflyCurvePoint(df.flightIndex, u, cx, cy, W, H, S);
    const [fx2, fy2] = getDragonflyCurvePoint(df.flightIndex, u + 0.05, cx, cy, W, H, S);
    const flyHeading = Math.atan2(fy2 - fy, fx2 - fx);

    const [px, py] = getPerchTargetCoord(df.perchTargetIdx, W, H, t, S);

    if (df.state === 'flying' && df.cycleTimer >= df.flightDuration) {
      df.state = 'approaching';
      df.cycleTimer = 0;
    } else if (df.state === 'approaching') {
      df.blend = Math.min(1, df.blend + dt / 1.45);
      if (df.blend >= 1) {
        df.state = 'perching';
        df.cycleTimer = 0;
      }
    } else if (df.state === 'perching') {
      df.blend = 1;
      const tremor = Math.sin(t * 14 + idx * 2) * 1.4 * S;
      const prev = state.perchTremors[df.perchTargetIdx] ?? 0;
      state.perchTremors[df.perchTargetIdx] = prev + tremor;
      if (df.cycleTimer >= df.perchDuration) {
        df.state = 'departing';
        df.cycleTimer = 0;
      }
    } else if (df.state === 'departing') {
      df.blend = Math.max(0, df.blend - dt / 1.15);
      if (df.blend <= 0) {
        df.state = 'flying';
        df.cycleTimer = 0;
      }
    }

    const sm = df.blend * df.blend * (3 - 2 * df.blend);
    let dh = -2.25 - flyHeading;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    df.heading = flyHeading + dh * sm;
    const hoverAmp = (1 - sm) * Math.sin(t * (theme === 'day' ? 7 : 5) + idx) * 1.3 * S;
    df.x = fx + (px - fx) * sm;
    df.y = fy + (py - fy) * sm + hoverAmp;
  });

  // 6. Cá Koi tìm mồi click + né tránh + quẫy sóng spine
  state.koiFishes.forEach((fish) => {
    if (!fish.initialized) {
      const [ix, iy] = computeKoiParametricPos(fish.config, fish.u, W, H);
      const [ix2, iy2] = computeKoiParametricPos(fish.config, fish.u + 0.02, W, H);
      fish.x = ix;
      fish.y = iy;
      fish.heading = Math.atan2(iy2 - iy, ix2 - ix);
      fish.initialized = true;
    }

    // Tìm hạt mồi vàng gần nhất trong bán kính 290 * S
    let nearestBait: BaitPellet | null = null;
    let nearestDist = 290 * S;
    for (const bait of state.baitPellets) {
      if (bait.eaten) continue;
      const bx = bait.x;
      const by = bait.y + bait.sinkOffset;
      const dist = Math.hypot(bx - fish.x, by - fish.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestBait = bait;
      }
    }

    if (nearestBait) {
      fish.seekingBait = true;
      const targetX = nearestBait.x;
      const targetY = nearestBait.y + nearestBait.sinkOffset;
      const angleToBait = Math.atan2(targetY - fish.y, targetX - fish.x);
      const diff = Math.atan2(
        Math.sin(angleToBait - fish.heading),
        Math.cos(angleToBait - fish.heading),
      );
      fish.heading += diff * Math.min(1, dt * 6.5);
      const dashSpeed = 148 * S * fish.config.sz;
      fish.x += Math.cos(fish.heading) * dashSpeed * dt;
      fish.y += Math.sin(fish.heading) * dashSpeed * dt;
      fish.speedMult = 1.65;

      if (nearestDist < 16 * S) {
        nearestBait.eaten = true;
        fish.scatterTimeLeft = 0.85;
        fish.scatterVx = Math.cos(fish.heading) * 65 * S;
        fish.scatterVy = Math.sin(fish.heading) * 45 * S;
        pushRipple(state, targetX, targetY, 'gold', 0.85, 2);
        for (let b = 0; b < 4; b += 1) {
          state.bubbles.push({
            x: targetX + (b - 1.5) * 4 * S,
            y: targetY + 4 * S,
            vy: (26 + b * 7) * S,
            radius: (1.5 + (b % 2) * 0.8) * S,
            alpha: 0.88,
            wobblePhase: t + b,
          });
        }
      }
      return;
    }

    fish.seekingBait = false;
    if (fish.scatterTimeLeft > 0) {
      fish.scatterTimeLeft -= dt;
      fish.x += fish.scatterVx * dt;
      fish.y += fish.scatterVy * dt;
      fish.speedMult = 1.35;
      return;
    }

    if (pointerX !== null && pointerY !== null) {
      const pDist = Math.hypot(fish.x - pointerX, fish.y - pointerY);
      if (pDist < 78 * S && fish.boostTimer <= 0) {
        fish.boostTimer = 1.45;
      }
    }

    if (fish.boostTimer > 0) {
      fish.boostTimer = Math.max(0, fish.boostTimer - dt);
      fish.speedMult = 1.0 + 0.52 * Math.sin((fish.boostTimer / 1.45) * Math.PI);
    } else {
      fish.speedMult = 1.0;
    }

    fish.u += dt * fish.config.sp * fish.speedMult;
    const [tx, ty] = computeKoiParametricPos(fish.config, fish.u, W, H);
    const [tx2, ty2] = computeKoiParametricPos(fish.config, fish.u + 0.02, W, H);
    const blendLerp = 1 - Math.exp(-5.0 * dt);
    fish.x += (tx - fish.x) * blendLerp;
    fish.y += (ty - fish.y) * blendLerp;
    const nextHeading = Math.atan2(ty2 - ty, tx2 - tx);
    const dh = Math.atan2(
      Math.sin(nextHeading - fish.heading),
      Math.cos(nextHeading - fish.heading),
    );
    fish.heading += dh * blendLerp;
  });

  // 7. Đàn cá nhỏ (Boids) gần gốc sen: tách đàn tránh cá Koi & chuột
  const flockCenterX = 0.48;
  const flockCenterY = 0.67;
  state.minnows.forEach((m, idx) => {
    let ax = (flockCenterX - m.xRatio) * 0.18;
    let ay = (flockCenterY - m.yRatio) * 0.22;
    ax += Math.sin(t * 0.9 + m.phase) * 0.04;
    ay += Math.cos(t * 1.1 + m.phase) * 0.03;

    // Tách giãn giữa các cá con
    for (let j = 0; j < state.minnows.length; j += 1) {
      if (j === idx) continue;
      const other = state.minnows[j];
      if (!other) continue;
      const dx = m.xRatio - other.xRatio;
      const dy = m.yRatio - other.yRatio;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.0001 && dist < 0.038) {
        const push = (0.038 - dist) / 0.038;
        ax += (dx / dist) * push * 0.14;
        ay += (dy / dist) * push * 0.14;
      }
    }

    const mxPx = m.xRatio * W;
    const myPx = m.yRatio * H;

    // Tản nhanh khi cá Koi lớn bơi qua gần
    for (const koi of state.koiFishes) {
      const kDist = Math.hypot(mxPx - koi.x, myPx - koi.y);
      if (kDist > 1 && kDist < 78 * S) {
        const rep = (1 - kDist / (78 * S)) * 0.65;
        ax += ((mxPx - koi.x) / kDist) * rep;
        ay += ((myPx - koi.y) / kDist) * rep;
      }
    }

    // Tản nhanh khi chuột chạm gần
    if (pointerX !== null && pointerY !== null) {
      const pDist = Math.hypot(mxPx - pointerX, myPx - pointerY);
      if (pDist > 1 && pDist < 85 * S) {
        const rep = (1 - pDist / (85 * S)) * 0.85;
        ax += ((mxPx - pointerX) / pDist) * rep;
        ay += ((myPx - pointerY) / pDist) * rep;
      }
    }

    m.vx = (m.vx + ax * dt) * Math.exp(-1.8 * dt);
    m.vy = (m.vy + ay * dt) * Math.exp(-1.8 * dt);
    const spd = Math.hypot(m.vx, m.vy);
    if (spd > 0.18) {
      m.vx = (m.vx / spd) * 0.18;
      m.vy = (m.vy / spd) * 0.18;
    } else if (spd < 0.03) {
      m.vx += Math.cos(m.phase) * 0.02 * dt;
      m.vy += Math.sin(m.phase) * 0.015 * dt;
    }

    m.xRatio = Math.min(0.86, Math.max(0.14, m.xRatio + m.vx * dt));
    m.yRatio = Math.min(0.92, Math.max(0.48, m.yRatio + m.vy * dt));
  });

  // 8. Khuấy động đom đóm theo con trỏ & cập nhật vệt sáng
  state.fireflies.forEach((ff) => {
    const basePx = ff.baseXRatio * W + Math.sin(t * ff.speedX + ff.phase) * ff.rangeX * S;
    const basePy = ff.baseYRatio * H + Math.cos(t * ff.speedY + ff.phase) * ff.rangeY * S;

    if (pointerX !== null && pointerY !== null && state.pointerSpeed > 25) {
      const curX = ff.x > 1 ? ff.x : basePx;
      const curY = ff.y > 1 ? ff.y : basePy;
      const dist = Math.hypot(curX - pointerX, curY - pointerY);
      if (dist > 1 && dist < 95 * S) {
        const strength = (1 - dist / (95 * S)) * 90 * S * dt;
        const nx = (curX - pointerX) / dist;
        const ny = (curY - pointerY) / dist;
        ff.swirlVx += (nx - ny * 0.6) * strength;
        ff.swirlVy += (ny + nx * 0.6) * strength;
      }
    }

    ff.swirlVx *= Math.exp(-3.0 * dt);
    ff.swirlVy *= Math.exp(-3.0 * dt);
    const nextX = basePx + ff.swirlVx;
    const nextY = basePy + ff.swirlVy;

    if (
      ff.trail.length === 0 ||
      Math.hypot(nextX - (ff.trail[0]?.[0] ?? 0), nextY - (ff.trail[0]?.[1] ?? 0)) > 2.5
    ) {
      ff.trail.unshift([nextX, nextY]);
      if (ff.trail.length > 5) {
        ff.trail.pop();
      }
    }
    ff.x = nextX;
    ff.y = nextY;
  });
}

function getWindAndCursorBend(
  baseX: number,
  wy: number,
  t: number,
  freq: number,
  phase: number,
  amp: number,
  pointerX: number | null,
  pointerY: number | null,
  S: number,
): number {
  let sway = Math.sin(t * freq + phase) * amp * S;
  if (pointerX !== null && pointerY !== null && pointerY < wy + 20 * S) {
    const dx = baseX - pointerX;
    const dist = Math.abs(dx);
    if (dist < 110 * S) {
      const dir = dx >= 0 ? 1 : -1;
      sway += dir * (1 - dist / (110 * S)) * 11 * S;
    }
  }
  return sway;
}

/** Vẽ gương sen / đài sen xanh vàng cúi nhẹ tự nhiên */
export function drawSeedPod(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  wy: number,
  podY: number,
  lean: number,
  t: number,
  S: number,
  scaleFactor: number,
  tremorY = 0,
) {
  const topX = baseX + lean;
  const topY = podY + tremorY;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(baseX, wy + 2 * S);
  ctx.bezierCurveTo(
    baseX - 8 * S,
    wy - (wy - topY) * 0.35,
    baseX + lean * 0.55,
    wy - (wy - topY) * 0.72,
    topX,
    topY + 10 * S,
  );
  ctx.strokeStyle = '#387639';
  ctx.lineWidth = 4.0 * S * scaleFactor;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(175, 226, 138, 0.42)';
  ctx.lineWidth = 1.2 * S * scaleFactor;
  ctx.stroke();

  ctx.translate(topX, topY);
  ctx.rotate(lean > 0 ? 0.26 : -0.26 + Math.sin(t * 0.45) * 0.03);
  ctx.scale(S * scaleFactor, S * scaleFactor);

  // Thân đài sen nón ngược xanh lục pha vàng chanh
  ctx.beginPath();
  ctx.moveTo(-2.5, 16);
  ctx.quadraticCurveTo(-11, 2, -16, -6);
  ctx.lineTo(16, -6);
  ctx.quadraticCurveTo(11, 2, 2.5, 16);
  ctx.closePath();
  ctx.fillStyle = '#4f8b3e';
  ctx.fill();

  // Mặt đĩa gương sen phẳng nghiêng vàng lục
  ctx.beginPath();
  ctx.ellipse(0, -6, 16, 6.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#b9cf4f';
  ctx.fill();
  ctx.strokeStyle = '#6f8e2e';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Hạt sen nhỏ trên mặt gương sen
  const seedCoords: readonly [number, number][] = [
    [-7, -6],
    [0, -8],
    [7, -6],
    [-4, -3.5],
    [4, -3.5],
    [0, -4.8],
  ];
  seedCoords.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.ellipse(sx, sy, 2.1, 1.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#536222';
    ctx.fill();
  });

  ctx.restore();
}

/** Vẽ búp sen hồng hé nở cho 2 cụm phụ trung cảnh */
function drawHalfOpenLotusBloom(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  wy: number,
  bloomY: number,
  swayX: number,
  S: number,
  scaleFactor: number,
  petals: readonly PetalData[],
  tremorY = 0,
) {
  const topX = baseX + swayX;
  const topY = bloomY + tremorY;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(baseX, wy + 2 * S);
  ctx.bezierCurveTo(
    baseX + 10 * S,
    wy - (wy - topY) * 0.35,
    baseX + swayX * 0.5,
    wy - (wy - topY) * 0.72,
    topX,
    topY + 8 * S,
  );
  ctx.strokeStyle = '#3d7c3a';
  ctx.lineWidth = 4.2 * S * scaleFactor;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(170, 224, 150, 0.4)';
  ctx.lineWidth = 1.2 * S * scaleFactor;
  ctx.stroke();

  ctx.translate(topX, topY);
  ctx.scale(S * scaleFactor, S * scaleFactor);
  const angles: readonly [number, number][] = [
    [-0.42, 0],
    [0.42, 0],
    [-0.18, 1],
    [0.18, 1],
    [0, 2],
  ];
  angles.forEach(([angle, idx]) => {
    const p = petals[idx];
    if (!p) return;
    ctx.save();
    ctx.rotate(angle);
    drawPetal(ctx, p);
    ctx.restore();
  });
  ctx.restore();
}

/** Vẽ lá sen đứng hình phễu mép lá uốn lượn + giọt sương đêm lăn nhẹ */
function drawStandingFunnelLeaf(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  wy: number,
  leafY: number,
  r: number,
  swayX: number,
  t: number,
  S: number,
  phase: number,
  dewdropSprite: HTMLCanvasElement | null,
) {
  const lx = baseX + swayX;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(baseX - 4 * S, wy + 3 * S);
  ctx.quadraticCurveTo(baseX + swayX * 0.45, (wy + leafY) * 0.5, lx, leafY + r * 0.42);
  ctx.strokeStyle = '#2d6a34';
  ctx.lineWidth = 4 * S;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(165, 222, 145, 0.42)';
  ctx.lineWidth = 1.2 * S;
  ctx.stroke();

  ctx.translate(lx, leafY);
  ctx.rotate(Math.sin(t * 0.28 + phase) * 0.045);

  // Phễu mặt dưới lá sen
  ctx.beginPath();
  ctx.moveTo(-r * 0.96, 0);
  ctx.quadraticCurveTo(0, r * 0.9, r * 0.96, 0);
  ctx.fillStyle = '#1b5830';
  ctx.fill();

  // Mép lá uốn lượn hữu cơ phía trên
  ctx.beginPath();
  const steps = 42;
  for (let i = 0; i <= steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    const rippleR = 1 + 0.055 * Math.sin(a * 6 + phase) + 0.025 * Math.cos(a * 11);
    const px = Math.cos(a) * r * rippleR;
    const py = Math.sin(a) * r * 0.36 * rippleR;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#36874a';
  ctx.fill();
  ctx.strokeStyle = 'rgba(12, 58, 32, 0.65)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Hệ gân lá tỏa tròn xanh lục nhạt
  ctx.strokeStyle = 'rgba(202, 245, 186, 0.26)';
  ctx.lineWidth = 0.85;
  for (let v = 0; v < 18; v += 1) {
    const a = (v / 18) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 0.92, Math.sin(a) * r * 0.33);
    ctx.stroke();
  }

  // 2 hạt sương lăn nhẹ quanh lòng phễu lá
  for (let d = 0; d < 2; d += 1) {
    const dp = t * 0.65 + phase + d * 2.4;
    const dx = Math.sin(dp) * r * 0.28;
    const dy = Math.cos(dp * 1.3) * r * 0.08 + r * 0.03;
    const dRadius = r * (0.065 + d * 0.018);
    if (dewdropSprite) {
      ctx.drawImage(dewdropSprite, dx - dRadius, dy - dRadius, dRadius * 2, dRadius * 2);
    } else {
      ctx.beginPath();
      ctx.arc(dx, dy, dRadius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 255, 245, 0.85)';
      ctx.fill();
    }
  }
  ctx.restore();
}

export function drawAquaticReeds(
  ctx: CanvasRenderingContext2D,
  reeds: readonly AquaticReed[],
  W: number,
  wy: number,
  t: number,
  S: number,
  pointerX: number | null,
  pointerY: number | null,
  theme: 'day' | 'night',
) {
  ctx.save();
  ctx.lineCap = 'round';
  reeds.forEach((reed) => {
    const rx = reed.xOffsetRatio * W;
    const h = reed.heightRatio * 290 * S;
    const sway = getWindAndCursorBend(rx, wy, t, 0.82, reed.phase, 7.5, pointerX, pointerY, S);
    const tipX = rx + reed.curve * 42 * S + sway;
    const tipY = wy + 28 * S - h;

    ctx.beginPath();
    ctx.moveTo(rx, wy + 28 * S);
    ctx.quadraticCurveTo(
      rx + reed.curve * 16 * S + sway * 0.45,
      wy + 28 * S - h * 0.55,
      tipX,
      tipY,
    );
    ctx.strokeStyle = theme === 'day' ? '#2c6838' : '#18442a';
    ctx.lineWidth = reed.width * S;
    ctx.stroke();

    if (reed.hasCattail) {
      ctx.save();
      ctx.translate(tipX, tipY + 14 * S);
      ctx.rotate((tipX - rx) * 0.008);
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.2 * S, 11 * S, 0, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'day' ? '#5e4028' : '#3a271a';
      ctx.fill();
      ctx.restore();
    }
  });
  ctx.restore();
}

/** Vẽ 2 cụm sen phụ trái/phải gồm búp sen, gương sen & lá đứng hình phễu */
export function drawMidgroundBotanicalClusters(
  ctx: CanvasRenderingContext2D,
  t: number,
  W: number,
  H: number,
  wy: number,
  S: number,
  budPetals: readonly PetalData[],
  pointerX: number | null,
  pointerY: number | null,
  perchTremors: readonly [number, number, number],
  dewdropSprite: HTMLCanvasElement | null,
) {
  const cy = H * 0.5;

  // Cụm phụ TRÁI (tầng trung cảnh)
  const leftX = W * 0.19;
  const leftPodLean =
    getWindAndCursorBend(leftX, wy, t, 0.34, 1.4, 5, pointerX, pointerY, S) - 10 * S;
  drawStandingFunnelLeaf(
    ctx,
    W * 0.135,
    wy,
    cy + 26 * S,
    46 * S,
    getWindAndCursorBend(W * 0.135, wy, t, 0.3, 0.9, 4.5, pointerX, pointerY, S),
    t,
    S,
    0.9,
    dewdropSprite,
  );
  drawHalfOpenLotusBloom(
    ctx,
    W * 0.235,
    wy,
    wy - 178 * S,
    getWindAndCursorBend(W * 0.235, wy, t, 0.38, 2.2, 5.2, pointerX, pointerY, S),
    S,
    0.72,
    budPetals,
  );
  drawSeedPod(ctx, leftX, wy, wy - 148 * S, leftPodLean, t, S, 0.92, perchTremors[1] ?? 0);

  // Cụm phụ PHẢI (tầng trung cảnh)
  const rightX = W * 0.81;
  const rightPodLean =
    getWindAndCursorBend(rightX, wy, t, 0.31, 2.8, 5, pointerX, pointerY, S) + 12 * S;
  drawStandingFunnelLeaf(
    ctx,
    W * 0.865,
    wy,
    cy + 20 * S,
    48 * S,
    getWindAndCursorBend(W * 0.865, wy, t, 0.29, 3.1, 4.5, pointerX, pointerY, S),
    t,
    S,
    3.1,
    dewdropSprite,
  );
  drawSeedPod(ctx, rightX - 18 * S, wy, wy - 134 * S, -14 * S + rightPodLean * 0.4, t, S, 0.86);
  drawHalfOpenLotusBloom(
    ctx,
    rightX,
    wy,
    wy - 160 * S,
    rightPodLean * 0.7,
    S,
    0.76,
    budPetals,
    perchTremors[2] ?? 0,
  );
}

/** 2 tầng sương khói mặt hồ trôi ngang phản chiếu sắc hồng dịu từ hoa sen */
export function drawLowLyingMist(
  ctx: CanvasRenderingContext2D,
  t: number,
  W: number,
  H: number,
  wy: number,
  S: number,
  glowSprites: GlowSpriteCache,
  theme: 'day' | 'night',
) {
  ctx.save();
  const baseOpacity = theme === 'night' ? 0.16 : 0.09;
  for (let band = 0; band < 6; band += 1) {
    const progress = ((t * (0.018 + band * 0.004) + band * 0.19) % 1.3) - 0.15;
    const mx = progress * W;
    const my = wy + (band % 2 === 0 ? -10 : 28) * S;
    const mw = (180 + (band % 3) * 70) * S;
    const mh = 34 * S;

    ctx.save();
    ctx.translate(mx, my);
    ctx.scale(mw / Math.max(mh, 1), 1);
    drawGlowSprite(ctx, glowSprites.mist, 0, 0, mh, baseOpacity);
    ctx.restore();
  }

  // Ánh hồng dịu phản chiếu từ đóa sen chính lên màn sương gần tâm hồ
  drawGlowSprite(
    ctx,
    glowSprites.cinnabar,
    W * 0.5 + Math.sin(t * 0.25) * 18 * S,
    wy + 8 * S,
    130 * S,
    theme === 'night' ? 0.12 : 0.06,
  );
  ctx.restore();
  void H;
}

export function drawFallingPetalsAndDewdrops(
  ctx: CanvasRenderingContext2D,
  state: EcosystemState,
  W: number,
  H: number,
  t: number,
  S: number,
  petalSprite: PetalData | undefined,
  dewdropSprite: HTMLCanvasElement | null,
) {
  const cy = H * 0.5;
  // 1. Cánh hoa sen rơi & trôi nước
  if (petalSprite) {
    state.fallingPetals.forEach((p) => {
      const fade = p.age > p.maxAge - 1.5 ? Math.max(0, (p.maxAge - p.age) / 1.5) : 1;
      ctx.save();
      ctx.translate(p.xRatio * W, cy + p.yOffset);
      ctx.rotate(p.rot);
      ctx.scale(S * p.scale * 0.36, S * p.scale * (p.landed ? 0.18 : 0.34));
      ctx.globalAlpha = fade * 0.92;
      drawPetal(ctx, petalSprite);
      ctx.restore();
    });
  }

  // 2. Giọt sương rơi có trọng lực từ mép lá sen bên phải
  const [tipX, tipY] = getRightLeafTip(W, H, t, S);
  state.drippingDrops.forEach((drop) => {
    const dx = tipX;
    const dy = tipY + drop.yOffset;
    const r = 4.5 * S;
    if (dewdropSprite) {
      ctx.drawImage(dewdropSprite, dx - r, dy - r, r * 2, r * 2);
    } else {
      ctx.beginPath();
      ctx.arc(dx, dy, r * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(230, 255, 245, 0.9)';
      ctx.fill();
    }
  });

  // 3. Tia nước bắn lên khi giọt sương chạm mặt hồ
  state.splashDroplets.forEach((sp) => {
    ctx.beginPath();
    ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220, 255, 245, ${sp.alpha.toFixed(3)})`;
    ctx.fill();
  });
}

export function drawInteractiveRipplesAndBaits(
  ctx: CanvasRenderingContext2D,
  state: EcosystemState,
  t: number,
  S: number,
  glowSprites: GlowSpriteCache,
) {
  // 1. Vòng gợn sóng tương tác (chuột, âm thanh ếch ộp, giọt sương, cánh hoa)
  for (let i = state.ripples.length - 1; i >= 0; i -= 1) {
    const rip = state.ripples[i];
    if (!rip) continue;
    const age = t - rip.birthTime;
    const maxLife = 1.25;
    if (age > maxLife || age < 0) {
      state.ripples.splice(i, 1);
      continue;
    }
    const p = age / maxLife;
    for (let ring = 0; ring < rip.ringCount; ring += 1) {
      const ringP = p - ring * 0.16;
      if (ringP <= 0 || ringP > 1) continue;
      const radX = (10 + ringP * 62 * rip.maxRadiusScale) * S;
      const radY = radX * 0.32;
      const alpha = (1 - ringP) * (rip.tint === 'sound' ? 0.38 : 0.48);

      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, radX, radY, 0, 0, Math.PI * 2);
      if (rip.tint === 'gold') {
        ctx.strokeStyle = `rgba(255, 232, 165, ${alpha.toFixed(3)})`;
      } else if (rip.tint === 'sound') {
        ctx.strokeStyle = `rgba(248, 210, 224, ${alpha.toFixed(3)})`;
      } else {
        ctx.strokeStyle = `rgba(216, 255, 236, ${alpha.toFixed(3)})`;
      }
      ctx.lineWidth = (1.55 - ringP * 0.55) * Math.max(0.8, S);
      ctx.stroke();
    }
  }

  // 2. Hạt sáng vàng thả xuống khi click
  state.baitPellets.forEach((bait) => {
    const fade = bait.age > bait.maxAge - 1.2 ? Math.max(0, (bait.maxAge - bait.age) / 1.2) : 1;
    const pulse = 0.72 + 0.28 * Math.sin(t * 5.2 + bait.phase);
    const bx = bait.x;
    const by = bait.y + bait.sinkOffset;
    drawGlowSprite(
      ctx,
      glowSprites.gold,
      bx,
      by,
      10 * S,
      fade * pulse * 0.65,
      'rgba(255, 220, 120, 0.3)',
    );
    ctx.beginPath();
    ctx.arc(bx, by, 2.3 * S * pulse, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 240, 168, ${(fade * 0.92).toFixed(3)})`;
    ctx.fill();
  });

  // 3. Bọt nước khi cá Koi đớp mồi
  state.bubbles.forEach((b) => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(230, 255, 248, ${b.alpha.toFixed(3)})`;
    ctx.lineWidth = 1.05;
    ctx.stroke();
  });
}

export function drawDynamicKoiFishes(
  ctx: CanvasRenderingContext2D,
  koiFishes: readonly DynamicKoiFish[],
  t: number,
  H: number,
  S: number,
) {
  const wd = [0.5, 0.85, 1, 0.95, 0.82, 0.64, 0.48, 0.34, 0.24, 0.17, 0.13, 0.1] as const;
  const N = 12;

  koiFishes.forEach((fish) => {
    const { config: f, fi } = fish;
    const per = 11 + (fi % 4) * 2;
    const d0 = (((t - fi * 3.1) % per) + per) % per;
    const dd = Math.min(d0, per - d0);
    const nr = Math.exp(-Math.pow(dd / 1.35, 2));

    const k = S * f.sz * (1 + 0.06 * nr) * (0.58 + (0.78 * Math.max(0, fish.y)) / H);
    const seg = 6.6 * k;
    const pts: [number, number, number][] = [];
    let px = fish.x;
    let py = fish.y;
    let a = fish.heading;

    const swimFreq = 3.8 * fish.speedMult;
    for (let i = 0; i < N; i += 1) {
      pts.push([px, py, a]);
      px -= Math.cos(a) * seg;
      py -= Math.sin(a) * seg;
      a += Math.sin(t * swimFreq - i * 0.58 + fi * 1.9) * 0.16 * (0.3 + i / N);
    }

    const h = pts[0];
    const e = pts[N - 1];
    const q = pts[2];
    if (!h || !e || !q) return;

    // 1. Bóng mờ của cá Koi dưới làn nước sâu
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.fillStyle = '#03170f';
    ctx.beginPath();
    pts.forEach((p, idx) => {
      const rW = (wd[idx] ?? 0.4) * 6.2 * k;
      ctx.moveTo(p[0] + rW, p[1] + 10 * k);
      ctx.ellipse(p[0], p[1] + 10 * k, rW, rW * 0.65, p[2], 0, Math.PI * 2);
    });
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.88 + 0.12 * nr;
    ctx.lineJoin = 'round';

    const ca = Math.cos(e[2]);
    const sa = Math.sin(e[2]);
    const wv = Math.sin(t * swimFreq - N * 0.6 + fi * 2) * 4.2 * k;
    const bx = e[0] - ca * 17 * k;
    const by = e[1] - sa * 17 * k;
    const nx = -sa;
    const ny = ca;

    // Vây đuôi uyển chuyển
    ctx.beginPath();
    ctx.moveTo(e[0], e[1]);
    ctx.quadraticCurveTo(
      e[0] - ca * 9 * k + nx * 8 * k,
      e[1] - sa * 9 * k + ny * 8 * k,
      bx + nx * (11 * k + wv),
      by + ny * (11 * k + wv),
    );
    ctx.lineTo(e[0] - ca * 11 * k + nx * wv * 0.5, e[1] - sa * 11 * k + ny * wv * 0.5);
    ctx.lineTo(bx - nx * (11 * k - wv), by - ny * (11 * k - wv));
    ctx.quadraticCurveTo(
      e[0] - ca * 9 * k - nx * 8 * k,
      e[1] - sa * 9 * k - ny * 8 * k,
      e[0],
      e[1],
    );
    ctx.fillStyle = rgb(f.baseColor, 0.62);
    ctx.fill();

    // Đôi vây ngực vẫy nhịp nhàng đối xứng
    const qn: [number, number] = [-Math.sin(q[2]), Math.cos(q[2])];
    const qw = (wd[2] ?? 1) * 6.5 * k;
    for (const s of [-1, 1]) {
      const sx = q[0] + qn[0] * qw * s;
      const sy = q[1] + qn[1] * qw * s;
      const fw = Math.sin(t * 2.6 + s + fi) * 2.2 * k;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(
        sx + qn[0] * s * (9 * k + fw),
        sy + qn[1] * s * (9 * k + fw),
        sx - Math.cos(q[2]) * 9 * k + qn[0] * s * 5 * k,
        sy - Math.sin(q[2]) * 9 * k + qn[1] * s * 5 * k,
      );
      ctx.closePath();
      ctx.fillStyle = rgb(f.baseColor, 0.52);
      ctx.fill();
    }

    // Thân cá thuôn nối liền mạch 12 đốt
    const L: [number, number][] = [];
    const R: [number, number][] = [];
    pts.forEach((p, idx) => {
      const w = (wd[idx] ?? 0.5) * 6.5 * k;
      const n: [number, number] = [-Math.sin(p[2]), Math.cos(p[2])];
      L.push([p[0] + n[0] * w, p[1] + n[1] * w]);
      R.push([p[0] - n[0] * w, p[1] - n[1] * w]);
    });

    ctx.beginPath();
    ctx.moveTo(h[0] + Math.cos(h[2]) * seg * 0.7, h[1] + Math.sin(h[2]) * seg * 0.7);
    L.forEach((p) => ctx.lineTo(p[0], p[1]));
    for (let i = N - 1; i >= 0; i -= 1) {
      const rp = R[i];
      if (rp) ctx.lineTo(rp[0], rp[1]);
    }
    ctx.closePath();
    ctx.fillStyle = rgb(f.baseColor);
    ctx.fill();

    // Đốm hoa văn Kohaku / Yamabuki / Sanke
    [2, 5, 8].forEach((idx, j) => {
      const p = pts[idx];
      if (!p) return;
      ctx.beginPath();
      ctx.ellipse(
        p[0] + (j - 1) * k,
        p[1] + (1 - j) * k,
        seg * (j === 1 ? 1.1 : 0.8),
        (wd[idx] ?? 0.5) * 4.5 * k,
        p[2],
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = rgb(j === 1 ? f.spotColor : mix(f.spotColor, f.baseColor, 0.18), 0.9);
      ctx.fill();
    });

    if (f.accentColor) {
      const pSumi = pts[4];
      const pSumi2 = pts[7];
      if (pSumi) {
        ctx.beginPath();
        ctx.ellipse(pSumi[0], pSumi[1], seg * 0.55, 2.4 * k, pSumi[2], 0, Math.PI * 2);
        ctx.fillStyle = rgb(f.accentColor, 0.85);
        ctx.fill();
      }
      if (pSumi2) {
        ctx.beginPath();
        ctx.ellipse(pSumi2[0], pSumi2[1], seg * 0.45, 1.9 * k, pSumi2[2], 0, Math.PI * 2);
        ctx.fillStyle = rgb(f.accentColor, 0.82);
        ctx.fill();
      }
    }

    // Sống lưng ánh ngọc
    ctx.beginPath();
    pts.forEach((p, idx) => (idx ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5 * k;
    ctx.stroke();

    // Đôi mắt
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(
        h[0] + Math.cos(h[2]) * seg * 0.16 - Math.sin(h[2]) * 3.1 * k * s,
        h[1] + Math.sin(h[2]) * seg * 0.16 + Math.cos(h[2]) * 3.1 * k * s,
        1.15 * k,
        0,
        Math.PI * 2,
      );
      ctx.fillStyle = '#141615';
      ctx.fill();
    }
    ctx.restore();
  });
}

export function drawBoidsMinnows(
  ctx: CanvasRenderingContext2D,
  minnows: readonly BoidMinnow[],
  t: number,
  W: number,
  H: number,
  S: number,
) {
  ctx.save();
  ctx.lineJoin = 'round';
  minnows.forEach((m, i) => {
    const x = m.xRatio * W;
    const y = m.yRatio * H;
    const heading = Math.atan2(m.vy, m.vx || 0.01);
    const perspective = 0.6 + (0.72 * Math.min(Math.max(y, 0), H)) / H;
    const sc = S * 0.34 * perspective * m.scale;
    const len = 36 * sc;
    const bodyW = 7.5 * sc;
    const tailWave = Math.sin(t * 9.5 - i * 0.8) * 0.28;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(heading);

    ctx.beginPath();
    ctx.moveTo(len * 0.5, 0);
    ctx.bezierCurveTo(
      len * 0.25,
      bodyW * 0.9,
      -len * 0.2,
      bodyW * 0.7,
      -len * 0.5,
      tailWave * 4 * S,
    );
    ctx.bezierCurveTo(-len * 0.2, -bodyW * 0.7, len * 0.25, -bodyW * 0.9, len * 0.5, 0);
    ctx.fillStyle = 'rgba(130, 198, 165, 0.78)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(len * 0.45, 0);
    ctx.lineTo(-len * 0.45, tailWave * 3 * S);
    ctx.strokeStyle = 'rgba(245, 255, 248, 0.48)';
    ctx.lineWidth = 0.85 * S;
    ctx.stroke();

    ctx.save();
    ctx.translate(-len * 0.5, tailWave * 4 * S);
    ctx.rotate(tailWave * 1.45);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10 * sc, 5.5 * sc);
    ctx.quadraticCurveTo(-5 * sc, 0, -10 * sc, -5.5 * sc);
    ctx.closePath();
    ctx.fillStyle = 'rgba(205, 242, 224, 0.68)';
    ctx.fill();
    ctx.restore();

    ctx.restore();
  });
  ctx.restore();
}

export function drawAnimatedFrog(
  ctx: CanvasRenderingContext2D,
  state: EcosystemState,
  pads: readonly PadConfig[],
  t: number,
  W: number,
  H: number,
  S: number,
  wy: number,
  pointerX: number | null,
  pointerY: number | null,
) {
  const frog = state.frog;
  const curPad = pads[frog.currentPadIdx] ?? pads[6];
  const tgtPad = pads[frog.targetPadIdx] ?? pads[7];
  if (!curPad || !tgtPad) return;

  let frogX: number;
  let frogY: number;
  let jumpArcRatio = 0;

  if (!frog.isJumping) {
    const [px, py] = getPadCenter(curPad, t, W, H, wy, state.padBounces[frog.currentPadIdx] ?? 0);
    frogX = px;
    frogY = py - 2 * S;
  } else {
    const p = Math.min(1, frog.jumpElapsed / frog.jumpDuration);
    const [tx, ty] = getPadCenter(tgtPad, t, W, H, wy, state.padBounces[frog.targetPadIdx] ?? 0);
    const sx = frog.jumpStartXRatio * W;
    const sy = frog.jumpStartYRatio * H;
    jumpArcRatio = 4 * p * (1 - p);
    frogX = sx + (tx - sx) * p;
    frogY = sy + (ty - 2 * S - sy) * p - 58 * S * jumpArcRatio;
  }

  let distToCursor = 9999;
  if (pointerX !== null && pointerY !== null) {
    distToCursor = Math.hypot(frogX - pointerX, frogY - pointerY);
  }
  const breath = 1 + 0.04 * Math.sin(t * 2.5);
  const croakFactor =
    frog.croakAge >= 0 ? Math.sin(Math.min(1, frog.croakAge / 0.75) * Math.PI) : 0;
  const blinkCycle = (t % 5.0) / 0.18;
  const isBlinking = blinkCycle < 1.0 || (distToCursor < 35 && t % 1.1 < 0.15);
  const blinkAmount = isBlinking ? (blinkCycle < 1.0 ? Math.sin(blinkCycle * Math.PI) : 1) : 0;

  const fs = 1.3 * S;
  ctx.save();
  ctx.translate(frogX, frogY);
  ctx.scale(frog.facing, 1);

  // Bóng ếch trên phiến lá
  ctx.save();
  ctx.translate(0, 6 * fs + jumpArcRatio * 24 * S);
  ctx.scale(1, 0.42);
  ctx.beginPath();
  ctx.ellipse(
    0,
    4 * fs,
    16 * fs * (1 - jumpArcRatio * 0.35),
    9 * fs * (1 - jumpArcRatio * 0.35),
    0,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = `rgba(0, 26, 16, ${(0.34 * (1 - jumpArcRatio * 0.5)).toFixed(3)})`;
  ctx.fill();
  ctx.restore();

  // Chân sau (duỗi ra khi đang bật nhảy parabol!)
  const legExtend = jumpArcRatio * 9 * fs;
  ctx.beginPath();
  ctx.ellipse(
    -7 * fs - legExtend * 0.45,
    3.5 * fs + legExtend * 0.35,
    8.2 * fs + legExtend * 0.3,
    4.6 * fs,
    -0.35,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = '#26633b';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(
    5.5 * fs - legExtend * 0.3,
    4 * fs + legExtend * 0.35,
    9.2 * fs + legExtend * 0.3,
    5.2 * fs,
    0.28,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = '#3b8d55';
  ctx.fill();

  // Thân ếch xanh ngọc bích
  ctx.beginPath();
  ctx.moveTo(-6.2 * fs, 4.5 * fs);
  ctx.bezierCurveTo(-10 * fs, 0, -7.2 * fs, -9.2 * fs, 0, -10.2 * fs);
  ctx.bezierCurveTo(7.2 * fs, -9.2 * fs, 9.2 * fs, -2 * fs, 6.2 * fs, 4.5 * fs);
  ctx.bezierCurveTo(3.2 * fs, 7 * fs, -3.2 * fs, 7 * fs, -6.2 * fs, 4.5 * fs);
  ctx.closePath();
  ctx.fillStyle = '#3A8752';
  ctx.fill();

  // Mảng bụng trắng kem
  ctx.beginPath();
  ctx.ellipse(2.6 * fs, 1.8 * fs, 4.4 * fs * breath, 4.6 * fs * breath, 0.18, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(250, 244, 224, 0.72)';
  ctx.fill();

  // Túi thanh âm trắng hồng dưới cằm phồng to mỗi ~4s khi ộp!
  if (croakFactor > 0.02) {
    ctx.beginPath();
    ctx.ellipse(
      5.8 * fs + croakFactor * 2.2 * fs,
      -2.2 * fs + croakFactor * 1.4 * fs,
      (3.5 + croakFactor * 4.8) * fs,
      (2.8 + croakFactor * 4.2) * fs,
      0.15,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = `rgba(252, 224, 232, ${(0.58 + croakFactor * 0.32).toFixed(3)})`;
    ctx.fill();
  }

  // Đốm lưng vi mô
  ctx.fillStyle = '#205232';
  [
    [-3 * fs, -6 * fs, 1.2 * fs],
    [-1 * fs, -3 * fs, 1.3 * fs],
    [1.8 * fs, -5 * fs, 1.15 * fs],
  ].forEach(([sx, sy, sr]) => {
    if (sx === undefined || sy === undefined || sr === undefined) return;
    ctx.beginPath();
    ctx.ellipse(sx, sy, sr, sr * 0.7, 0.4, 0, Math.PI * 2);
    ctx.fill();
  });

  // Chân trước
  ctx.beginPath();
  ctx.moveTo(-3 * fs, 2 * fs);
  ctx.bezierCurveTo(-4 * fs, 5 * fs, -4.5 * fs, 7 * fs, -5 * fs, 7.8 * fs);
  ctx.moveTo(2 * fs, 2 * fs);
  ctx.bezierCurveTo(2.5 * fs, 5 * fs, 3 * fs, 7 * fs, 4 * fs, 7.8 * fs);
  ctx.strokeStyle = '#2E6E42';
  ctx.lineWidth = 1.7 * S;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Hai mắt lồi vàng kim
  ctx.beginPath();
  ctx.arc(-3.4 * fs, -10.2 * fs, 2.6 * fs, 0, Math.PI * 2);
  ctx.fillStyle = '#3A8752';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(3.4 * fs, -10.2 * fs, 3.2 * fs, 0, Math.PI * 2);
  ctx.fillStyle = '#4AA366';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(-3.4 * fs, -10.2 * fs, 2.1 * fs, 0, Math.PI * 2);
  ctx.arc(3.4 * fs, -10.2 * fs, 2.6 * fs, 0, Math.PI * 2);
  ctx.fillStyle = '#E5B25D';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(-3.4 * fs, -10.2 * fs, 1.25 * fs, 0.72 * fs * (1 - blinkAmount), 0.2, 0, Math.PI * 2);
  ctx.ellipse(3.6 * fs, -10.2 * fs, 1.55 * fs, 0.86 * fs * (1 - blinkAmount), 0.15, 0, Math.PI * 2);
  ctx.fillStyle = '#0a0a0a';
  ctx.fill();

  if (blinkAmount < 0.4) {
    ctx.beginPath();
    ctx.arc(4.2 * fs, -11.1 * fs, 0.8 * S, 0, Math.PI * 2);
    ctx.arc(-2.8 * fs, -10.9 * fs, 0.6 * S, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }

  ctx.restore();
}

export function drawPerchingDragonflies(
  ctx: CanvasRenderingContext2D,
  dragonflies: readonly PerchingDragonfly[],
  t: number,
  S: number,
) {
  dragonflies.forEach((df, idx) => {
    const k = S * (idx === 0 ? 0.92 : idx === 1 ? 0.84 : 0.78);
    const wingAmp =
      df.state === 'perching' ? 0.12 + 0.12 * Math.sin(t * 2.8 + idx) : 1 - df.blend * 0.88;
    // Bóng chuồn chuồn in mờ trên nước
    drawDF(
      ctx,
      df.x + 36 * S * (1 - df.blend * 0.68),
      df.y + 68 * S * (1 - df.blend * 0.55),
      df.heading,
      k * 0.9,
      t + idx,
      true,
      wingAmp,
      df.palette,
    );
    // Thân chuồn chuồn 4 cánh
    drawDF(ctx, df.x, df.y, df.heading, k, t + idx, false, wingAmp, df.palette);
  });
}

export function drawEnhancedFireflies(
  ctx: CanvasRenderingContext2D,
  fireflies: readonly EnhancedFirefly[],
  t: number,
  S: number,
  wy: number,
  glowSprites: GlowSpriteCache,
  theme: 'day' | 'night',
) {
  if (theme === 'day') return;
  const sprite = glowSprites.firefly;
  ctx.save();
  fireflies.forEach((ff) => {
    const alpha = Math.pow(Math.max(0, Math.sin(t * ff.pulseSpeed + ff.phase)), 3.2);
    if (alpha <= 0.015) return;

    const haloR = ff.haloRadius * S;
    const coreR = ff.size * S;

    // Vệt sáng mờ phía sau theo quỹ đạo bay
    if (ff.trail.length > 1) {
      for (let ti = 1; ti < ff.trail.length; ti += 1) {
        const pt = ff.trail[ti];
        if (!pt) continue;
        const trailAlpha = alpha * (1 - ti / ff.trail.length) * 0.24;
        drawGlowSprite(ctx, sprite, pt[0], pt[1], haloR * 0.42, trailAlpha);
      }
    }

    drawGlowSprite(
      ctx,
      sprite,
      ff.x,
      ff.y,
      haloR,
      alpha * 0.74,
      `rgba(226, 248, 107, ${(alpha * 0.26).toFixed(3)})`,
    );

    ctx.beginPath();
    ctx.arc(ff.x, ff.y, coreR, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(226, 248, 107, ${(alpha * 0.96).toFixed(3)})`;
    ctx.fill();

    // Phản chiếu lung linh xuống mặt nước đen lục bảo
    if (ff.y < wy + 85 * S) {
      const mirrorY = wy + (wy - ff.y) * 0.3 + 16 * S;
      ctx.save();
      ctx.translate(ff.x, mirrorY);
      ctx.scale(1, 0.34);
      drawGlowSprite(ctx, sprite, 0, 0, haloR * 0.82, alpha * 0.32);
      ctx.restore();
    }
  });
  ctx.restore();
}

export type { LayerConfig };
