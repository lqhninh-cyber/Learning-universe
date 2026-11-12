import {
  createGlowSpriteCache,
  drawGlowSprite,
  type GlowSpriteCache,
} from '@/shared/lib/canvasSprites';

/**
 * ENGINE ĐỒ HỌA CANVAS 2D: "THIÊN CẦU KHUÊ VĂN CÁC" (THẤU KÍNH POINCARÉ, COMPA & TƠ SƠN MÀI)
 *
 * - Ánh sáng nền: Vignette góc #E5DEC9 tôn khung Đỏ Chu Sa / Vàng Thếp + Quầng sáng ấm tại tâm rgba(229,195,120,0.22).
 * - Trung tâm (bên trong cửa sổ tròn R₁):
 *   + Hỗn Thiên Nghi 3D (3 elip nghiêng 30°, 60°, -45° kèm sao băng đuôi 12 đoạn).
 *   + Lớp 1: Lưới Trắc Địa Đĩa Poincaré Mộng Gỗ (16 điểm, dây cung bước 5 & 7 uốn cong trực giao bằng quadraticCurveTo,
 *     2 tầng xoay ngược chiều #C83E37 & #C5A262 tạo hiệu ứng vạn hoa moiré).
 *   + Lớp 2: Phép Dựng Hình Compa Euclid (4 đường tròn phụ trợ 0.5*R1 nét đứt #8A6A2F + kim quét ánh sáng +
 *     8 giao điểm ngọc #4E9B58 & #C83E37 bừng sáng theo nhịp sóng).
 *   + Lớp 3: Ấn Tâm Hoa Thị Vàng (cực 8 cánh r = 0.18*R1*cos(4θ) viền #C5A262 + hạt ngọc #C83E37 shadowBlur = 10).
 * - Kiến trúc Khuê Văn Các: Đất vuông NÉT KÉP (#C83E37 ngoài & #C5A262 cách 4px) + 8 nan gỗ khóa ngang song tiện.
 * - Không gian ngoại vi & Parallax 3 lớp:
 *   + 16 sợi Dòng Chảy Tơ Sơn Mài nhọn 2 đầu dày 1px ở giữa (#C5A262 & #C83E37), sao băng quỹ đạo 12 đoạn (alpha 0.85 -> 0).
 *   + Khung Sắc Phong (-mx*4, -my*4), Lớp thiên văn & tơ sơn mài (mx*10, my*10), Lớp Khuê Văn & Poincaré (mx*18, my*18).
 */

export const INTRO_TOTAL_DURATION_S = 7.5;
export const INTRO_REDUCED_DURATION_S = 1.5;
export const PORTAL_DISMISS_DURATION_S = 0.45;
export const POINCARE_BOUNDARY_COUNT = 16;

interface KhueGradientCache {
  readonly width: number;
  readonly height: number;
  readonly rOuter1: number;
  readonly bgGrad: CanvasGradient;
  readonly warmGlowGrad: CanvasGradient;
}

const khueGradientCache = new WeakMap<CanvasRenderingContext2D, KhueGradientCache>();
let khueGlowSprites: GlowSpriteCache | null = null;

function getKhueGlowSprites(): GlowSpriteCache {
  if (!khueGlowSprites) {
    khueGlowSprites = createGlowSpriteCache();
  }
  return khueGlowSprites;
}

export interface KhueVanRenderState {
  readonly elapsed: number;
  readonly dismissProgress: number | null;
  readonly dismissStartPortalRadius: number;
  readonly dismissStartScale: number;
  readonly dismissStartRotation: number;
  readonly prefersReducedMotion: boolean;
  /** Độ lệch chuột chuẩn hóa theo trục ngang trong [-1, 1] cho hiệu ứng Parallax */
  readonly parallaxX?: number;
  /** Độ lệch chuột chuẩn hóa theo trục dọc trong [-1, 1] cho hiệu ứng Parallax */
  readonly parallaxY?: number;
}

export interface ComputedPortalTransform {
  readonly portalRadius: number;
  readonly sceneScale: number;
  readonly sceneRotation: number;
}

const COLORS = {
  paperCenter: '#FFFDF9',
  paperMid: '#F7F4EB',
  paperEdge: '#EDE8D8',
  paperCornerDeep: '#E5DEC9',
  warmCenterGlow: 'rgba(229, 195, 120, 0.22)',
  cinnabar: '#C83E37',
  cinnabarGlow: 'rgba(200, 62, 55, 0.12)',
  cinnabarNanFill: 'rgba(200, 62, 55, 0.05)',
  goldBright: '#C5A262',
  goldDark: '#8A6A2F',
  jadeLight: '#4E9B58',
} as const;

interface KhueStar {
  readonly radiusFactor: number;
  readonly angleDeg: number;
  readonly tier: 1 | 2;
  readonly isCinnabar: boolean;
}

// Chòm 16 ngôi sao Khuê trung tâm quay quanh thước đo thiên văn
const KHUE_STARS: readonly KhueStar[] = [
  { radiusFactor: 2.08, angleDeg: -72, tier: 2, isCinnabar: true },
  { radiusFactor: 2.34, angleDeg: -56, tier: 1, isCinnabar: false },
  { radiusFactor: 2.62, angleDeg: -42, tier: 2, isCinnabar: false },
  { radiusFactor: 2.46, angleDeg: -20, tier: 1, isCinnabar: true },
  { radiusFactor: 2.78, angleDeg: -6, tier: 2, isCinnabar: true },
  { radiusFactor: 2.56, angleDeg: 14, tier: 1, isCinnabar: false },
  { radiusFactor: 2.24, angleDeg: 28, tier: 1, isCinnabar: false },
  { radiusFactor: 2.48, angleDeg: 44, tier: 2, isCinnabar: true },
  { radiusFactor: 2.08, angleDeg: 108, tier: 2, isCinnabar: true },
  { radiusFactor: 2.34, angleDeg: 124, tier: 1, isCinnabar: false },
  { radiusFactor: 2.62, angleDeg: 138, tier: 2, isCinnabar: false },
  { radiusFactor: 2.46, angleDeg: 160, tier: 1, isCinnabar: true },
  { radiusFactor: 2.78, angleDeg: 174, tier: 2, isCinnabar: true },
  { radiusFactor: 2.56, angleDeg: 194, tier: 1, isCinnabar: false },
  { radiusFactor: 2.24, angleDeg: 208, tier: 1, isCinnabar: false },
  { radiusFactor: 2.48, angleDeg: 224, tier: 2, isCinnabar: true },
];

const KHUE_CONSTELLATION_EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [1, 3],
  [5, 7],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [12, 13],
  [13, 14],
  [14, 15],
  [9, 11],
  [13, 15],
];

interface BranchedStarPoint {
  readonly dx: number;
  readonly dy: number;
  readonly isPrimary: boolean;
  readonly isJade: boolean;
  readonly size: number;
}

interface WingBranchedCluster {
  readonly xSign: -1 | 1;
  readonly ySign: -1 | 1;
  readonly stars: readonly BranchedStarPoint[];
  /** Đồ thị cây phân nhánh mở (tuyệt đối không khép kín thành đa giác) */
  readonly edges: readonly (readonly [number, number])[];
}

// 4 chuỗi nhánh thiên văn mở (Open Branched Constellations: 7 sao/chòm, có sao chính vòng bao + nhánh phụ tự nhiên)
const WING_BRANCHED_CLUSTERS: readonly WingBranchedCluster[] = [
  {
    xSign: -1,
    ySign: -1,
    stars: [
      { dx: -56, dy: -28, isPrimary: false, isJade: true, size: 1.9 },
      { dx: -26, dy: -16, isPrimary: true, isJade: false, size: 3.3 },
      { dx: 6, dy: -32, isPrimary: false, isJade: false, size: 2.1 },
      { dx: 34, dy: -12, isPrimary: true, isJade: false, size: 3.1 },
      { dx: 62, dy: -26, isPrimary: false, isJade: true, size: 1.8 },
      { dx: -18, dy: 22, isPrimary: false, isJade: true, size: 2.0 },
      { dx: 24, dy: 28, isPrimary: false, isJade: false, size: 1.9 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [3, 6],
    ],
  },
  {
    xSign: -1,
    ySign: 1,
    stars: [
      { dx: -54, dy: 24, isPrimary: false, isJade: false, size: 1.9 },
      { dx: -22, dy: 8, isPrimary: true, isJade: false, size: 3.3 },
      { dx: 12, dy: 26, isPrimary: false, isJade: true, size: 2.0 },
      { dx: 42, dy: 6, isPrimary: true, isJade: false, size: 3.0 },
      { dx: 64, dy: 22, isPrimary: false, isJade: false, size: 1.8 },
      { dx: -14, dy: -28, isPrimary: false, isJade: true, size: 2.1 },
      { dx: 22, dy: -32, isPrimary: false, isJade: false, size: 1.8 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [5, 6],
    ],
  },
  {
    xSign: 1,
    ySign: -1,
    stars: [
      { dx: 56, dy: -28, isPrimary: false, isJade: true, size: 1.9 },
      { dx: 26, dy: -16, isPrimary: true, isJade: false, size: 3.3 },
      { dx: -6, dy: -32, isPrimary: false, isJade: false, size: 2.1 },
      { dx: -34, dy: -12, isPrimary: true, isJade: false, size: 3.1 },
      { dx: -62, dy: -26, isPrimary: false, isJade: true, size: 1.8 },
      { dx: 18, dy: 22, isPrimary: false, isJade: true, size: 2.0 },
      { dx: -24, dy: 28, isPrimary: false, isJade: false, size: 1.9 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [3, 6],
    ],
  },
  {
    xSign: 1,
    ySign: 1,
    stars: [
      { dx: 54, dy: 24, isPrimary: false, isJade: false, size: 1.9 },
      { dx: 22, dy: 8, isPrimary: true, isJade: false, size: 3.3 },
      { dx: -12, dy: 26, isPrimary: false, isJade: true, size: 2.0 },
      { dx: -42, dy: 6, isPrimary: true, isJade: false, size: 3.0 },
      { dx: -64, dy: 22, isPrimary: false, isJade: false, size: 1.8 },
      { dx: 14, dy: -28, isPrimary: false, isJade: true, size: 2.1 },
      { dx: -22, dy: -32, isPrimary: false, isJade: false, size: 1.8 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [1, 5],
      [5, 6],
    ],
  },
];

interface DustMote {
  readonly baseX: number;
  readonly baseY: number;
  readonly radius: number;
  readonly driftX: number;
  readonly driftY: number;
  readonly twinkleSpeed: number;
  readonly phase: number;
  readonly isCinnabar: boolean;
}

const AMBIENT_DUST: readonly DustMote[] = Array.from({ length: 40 }, (_, i) => {
  const goldenRatio = 0.61803398875;
  const pseudo1 = (i * goldenRatio) % 1;
  const pseudo2 = ((i + 7) * 0.38196601125) % 1;
  const pseudo3 = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
  return {
    baseX: 0.04 + pseudo1 * 0.92,
    baseY: 0.05 + pseudo2 * 0.9,
    radius: 1.0 + pseudo3 * 1.45,
    driftX: Math.cos(i * 1.7) * 8,
    driftY: Math.sin(i * 2.3) * 6,
    twinkleSpeed: 1.3 + pseudo3 * 1.8,
    phase: i * 0.77,
    isCinnabar: i % 4 === 0,
  };
});

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function clampSigned(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(-1, Math.min(1, value));
}

export function easeOutCubic(x: number): number {
  const t = clamp01(x);
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutQuart(x: number): number {
  const t = clamp01(x);
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function easeInOutExpo(x: number): number {
  const t = clamp01(x);
  if (t === 0) return 0;
  if (t === 1) return 1;
  return t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;
}

/** Tính điểm điều khiển hướng tâm cho cung trắc địa (Poincaré geodesic) qua quadraticCurveTo */
export function computePoincareControlPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  diskRadius: number,
): readonly [number, number] {
  const mx = (x1 + x2) * 0.5;
  const my = (y1 + y2) * 0.5;
  const midDist = Math.hypot(mx, my);
  if (midDist < 1e-6 || diskRadius <= 0) {
    return [0, 0];
  }
  const cosHalfTheta = clamp01(midDist / diskRadius);
  const halfTheta = Math.acos(cosHalfTheta);
  const apexRadius = diskRadius * Math.tan((Math.PI / 2 - halfTheta) * 0.5);
  const ctrlDist = Math.max(0, 2 * apexRadius - midDist);
  const scale = ctrlDist / midDist;
  return [mx * scale, my * scale];
}

/** Tính tọa độ điểm cực trên hoa thị vàng 8 cánh r = amplitude * cos(4 * theta) */
export function computeRosePetalPoint(amplitude: number, theta: number): readonly [number, number] {
  const r = amplitude * Math.cos(4 * theta);
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

/** Tính khoảng cách góc có hướng quanh vòng tròn [0, 2π) từ needle tới targetAngle */
function angularLagBehindSweep(sweepAngle: number, targetAngle: number): number {
  const twoPi = Math.PI * 2;
  const diff = (sweepAngle - targetAngle) % twoPi;
  return diff >= 0 ? diff : diff + twoPi;
}

/**
 * Vẽ hạt sáng chuyển động kèm đuôi sao băng 12 đoạn ngắn:
 * giảm dần độ trong suốt opacity từ 0.85 về 0 và thu gọn nét vẽ từ đầu về đuôi.
 */
function drawCometTrail(
  ctx: CanvasRenderingContext2D,
  headTheta: number,
  direction: 1 | -1,
  arcSpanRad: number,
  segments: number,
  headRadius: number,
  headColor: string,
  trailRgb: string,
  pointAt: (theta: number) => readonly [number, number],
): void {
  const stepRad = arcSpanRad / segments;
  ctx.save();
  ctx.lineCap = 'round';

  for (let s = segments - 1; s >= 0; s--) {
    const t0 = headTheta - direction * (s + 1) * stepRad;
    const t1 = headTheta - direction * s * stepRad;
    const p0 = pointAt(t0);
    const p1 = pointAt(t1);
    const segAlpha = segments > 1 ? 0.85 * (1 - s / segments) : 0.85;
    const segWidth = 0.25 + 1.95 * (segments > 1 ? 1 - s / (segments - 1) : 1);

    ctx.strokeStyle = `rgba(${trailRgb}, ${segAlpha.toFixed(3)})`;
    ctx.lineWidth = segWidth;
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.stroke();
  }

  const head = pointAt(headTheta);
  ctx.fillStyle = `rgba(${trailRgb}, 0.24)`;
  ctx.beginPath();
  ctx.arc(head[0], head[1], headRadius * 2.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(head[0], head[1], headRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.paperCenter;
  ctx.beginPath();
  ctx.arc(head[0], head[1], headRadius * 0.42, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Tính bán kính cửa sổ Khuê Văn Các (+20% kích thước) */
export function getWindowRadius(width: number, height: number): number {
  const minDim = Math.min(width, height);
  return Math.max(50, Math.min(152, minDim * 0.162));
}

/** Tính thông số cổng thấu quang & biến đổi khung hình hiện tại */
export function computePortalTransform(
  width: number,
  height: number,
  state: KhueVanRenderState,
): ComputedPortalTransform {
  const r1 = getWindowRadius(width, height);
  const maxPortalR = Math.hypot(width, height) * 1.05;

  if (state.dismissProgress !== null) {
    const eDismiss = easeOutCubic(state.dismissProgress);
    const startR = Math.max(r1 * 0.45, state.dismissStartPortalRadius);
    return {
      portalRadius: startR + (maxPortalR - startR) * eDismiss,
      sceneScale: state.dismissStartScale + 1.35 * eDismiss,
      sceneRotation: state.dismissStartRotation + 0.28 * eDismiss,
    };
  }

  if (state.prefersReducedMotion) {
    if (state.elapsed <= 1.05) {
      return { portalRadius: 0, sceneScale: 1, sceneRotation: 0 };
    }
    const pRed = clamp01((state.elapsed - 1.05) / 0.45);
    const eRed = easeInOutExpo(pRed);
    return {
      portalRadius: maxPortalR * eRed,
      sceneScale: 1 + 0.8 * eRed,
      sceneRotation: 0,
    };
  }

  if (state.elapsed <= 5.2) {
    return { portalRadius: 0, sceneScale: 1, sceneRotation: 0 };
  }

  if (state.elapsed < 5.5) {
    const pLens = clamp01((state.elapsed - 5.2) / 0.3);
    const eLens = easeOutCubic(pLens);
    return {
      portalRadius: r1 * 0.92 * eLens,
      sceneScale: 1 + 0.03 * eLens,
      sceneRotation: 0.02 * eLens,
    };
  }

  const pExpand = clamp01((state.elapsed - 5.5) / 2.0);
  const eExpand = easeInOutExpo(pExpand);
  const lensBaseR = r1 * 0.92;
  return {
    portalRadius: lensBaseR + (maxPortalR - lensBaseR) * eExpand,
    sceneScale: 1.03 + 1.65 * eExpand,
    sceneRotation: 0.02 + 0.36 * easeInOutQuart(pExpand),
  };
}

/** Phác thảo hình vuông đơn theo tiến trình */
function strokeProgressiveSquarePath(
  ctx: CanvasRenderingContext2D,
  halfSide: number,
  rotationRad: number,
  progress: number,
): void {
  const p = clamp01(progress);
  if (p <= 0) return;

  const vertices: readonly (readonly [number, number])[] = [
    [-halfSide, -halfSide],
    [halfSide, -halfSide],
    [halfSide, halfSide],
    [-halfSide, halfSide],
  ];

  const first = vertices[0];
  if (!first) return;

  ctx.save();
  ctx.rotate(rotationRad);
  ctx.beginPath();
  ctx.moveTo(first[0], first[1]);

  const segProgress = p * 4;
  for (let i = 0; i < 4; i++) {
    const start = vertices[i];
    const end = vertices[(i + 1) % 4];
    if (!start || !end) continue;

    const edgeT = clamp01(segProgress - i);
    if (edgeT > 0) {
      ctx.lineTo(start[0] + (end[0] - start[0]) * edgeT, start[1] + (end[1] - start[1]) * edgeT);
    }
  }

  if (p >= 1) {
    ctx.closePath();
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * Kiến trúc Đất Vuông NÉT KÉP (Octagram):
 * - Viền ngoài Đỏ Chu Sa #C83E37 (1.5px) song song viền trong Vàng Thếp #C5A262 (0.8px, cách 4px).
 * - Đường phân giác ngắn & chấm tròn vàng đính tại 8 góc nhọn của ngôi sao 8 đỉnh.
 */
function drawDoubleOctagramFrame(
  ctx: CanvasRenderingContext2D,
  squareHalf: number,
  sq1Progress: number,
  sq2Progress: number,
): void {
  // Hình vuông 1 (0°)
  if (sq1Progress > 0) {
    ctx.strokeStyle = COLORS.cinnabar;
    ctx.lineWidth = 1.5;
    strokeProgressiveSquarePath(ctx, squareHalf, 0, sq1Progress);

    ctx.strokeStyle = COLORS.goldBright;
    ctx.lineWidth = 0.8;
    strokeProgressiveSquarePath(ctx, squareHalf - 4, 0, sq1Progress);
  }

  // Hình vuông 2 (xoay 45°)
  if (sq2Progress > 0) {
    ctx.strokeStyle = COLORS.cinnabar;
    ctx.lineWidth = 1.5;
    strokeProgressiveSquarePath(ctx, squareHalf, Math.PI / 4, sq2Progress);

    ctx.strokeStyle = COLORS.goldBright;
    ctx.lineWidth = 0.8;
    strokeProgressiveSquarePath(ctx, squareHalf - 4, Math.PI / 4, sq2Progress);
  }

  // Họa tiết 8 đỉnh góc nhọn Octagram: phân giác ngắn + chấm tròn vàng đính ở đỉnh góc
  const tipProgress = clamp01((sq2Progress - 0.35) / 0.65);
  if (tipProgress > 0) {
    const outerCornerR = squareHalf * Math.SQRT2;
    const bisectorStartR = squareHalf * 1.15;
    const bisectorEndR = outerCornerR - 6.5;
    const eTip = easeOutCubic(tipProgress);

    for (let k = 0; k < 8; k++) {
      const angle = k * (Math.PI / 4);
      const isSq1 = k % 2 === 1;
      const localP = isSq1 ? clamp01((sq1Progress - 0.4) / 0.6) : eTip;
      if (localP <= 0) continue;

      ctx.save();
      ctx.rotate(angle);
      ctx.globalAlpha *= localP;

      // Đường phân giác ngắn hướng vào đỉnh tam giác góc
      ctx.strokeStyle = COLORS.goldDark;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(bisectorStartR, 0);
      ctx.lineTo(bisectorStartR + (bisectorEndR - bisectorStartR) * localP, 0);
      ctx.stroke();

      // Chấm tròn vàng đính ở đỉnh góc
      ctx.fillStyle = COLORS.goldBright;
      ctx.beginPath();
      ctx.arc(outerCornerR - 5.5, 0, 2.3 * localP, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = COLORS.cinnabar;
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.arc(outerCornerR - 5.5, 0, 3.6 * localP, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    }
  }
}

/** A. Vẽ Khung Viền Sắc Phong, Triện Góc Hồi Văn & Thước Tọa Độ mỗi 40px */
function drawImperialBorderAndFretwork(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  artTime: number,
): void {
  const inset = width >= 768 ? 28 : 16;
  const innerInset = inset + 5;
  const outerW = width - inset * 2;
  const outerH = height - inset * 2;
  const innerW = width - innerInset * 2;
  const innerH = height - innerInset * 2;

  if (outerW <= 40 || outerH <= 40) return;

  const borderP = easeOutCubic(clamp01((artTime - 0.15) / 1.4));
  if (borderP <= 0) return;

  ctx.save();
  ctx.globalAlpha *= borderP;

  ctx.strokeStyle = 'rgba(197, 162, 98, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(inset, inset, outerW, outerH);

  ctx.strokeStyle = 'rgba(200, 62, 55, 0.4)';
  ctx.lineWidth = 0.75;
  ctx.strokeRect(innerInset, innerInset, innerW, innerH);
  ctx.restore();

  // 4 góc Triện Hồi Văn (~36x36px) tự phác nét
  const fretP = easeInOutQuart(clamp01((artTime - 0.4) / 1.5));
  const fretSize = width >= 768 ? 36 : 26;
  if (fretP > 0) {
    const corners: readonly { x: number; y: number; sx: number; sy: number }[] = [
      { x: innerInset, y: innerInset, sx: 1, sy: 1 },
      { x: width - innerInset, y: innerInset, sx: -1, sy: 1 },
      { x: width - innerInset, y: height - innerInset, sx: -1, sy: -1 },
      { x: innerInset, y: height - innerInset, sx: 1, sy: -1 },
    ];

    const scaleRatio = fretSize / 36;
    const totalFretDash = 220;

    for (const c of corners) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.scale(c.sx * scaleRatio, c.sy * scaleRatio);
      ctx.strokeStyle = COLORS.cinnabar;
      ctx.lineWidth = 1.35 / scaleRatio;
      ctx.setLineDash([totalFretDash * fretP, totalFretDash]);

      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(0, 0);
      ctx.lineTo(36, 0);

      ctx.moveTo(8, 0);
      ctx.lineTo(8, 16);
      ctx.lineTo(28, 16);
      ctx.lineTo(28, 7);
      ctx.lineTo(15, 7);
      ctx.lineTo(15, 11);

      ctx.moveTo(0, 8);
      ctx.lineTo(16, 8);
      ctx.lineTo(16, 28);
      ctx.lineTo(7, 28);
      ctx.lineTo(7, 15);
      ctx.lineTo(11, 15);
      ctx.stroke();

      if (fretP > 0.7) {
        ctx.setLineDash([]);
        ctx.fillStyle = COLORS.goldBright;
        ctx.globalAlpha *= clamp01((fretP - 0.7) / 0.3);
        ctx.beginPath();
        ctx.arc(21, 21, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Vạch thước tọa độ mỗi 40px dọc 4 cạnh
  const tickP = easeOutCubic(clamp01((artTime - 0.9) / 1.1));
  if (tickP > 0) {
    ctx.save();
    ctx.globalAlpha *= tickP;
    const marginGuard = fretSize + 10;

    let idx = 0;
    for (let x = innerInset + marginGuard; x <= width - innerInset - marginGuard; x += 40) {
      const isMajor = idx % 4 === 0;
      const len = isMajor ? 7 : 4;
      ctx.strokeStyle = isMajor ? COLORS.goldDark : 'rgba(197, 162, 98, 0.6)';
      ctx.lineWidth = isMajor ? 1.0 : 0.75;

      ctx.beginPath();
      ctx.moveTo(x, innerInset);
      ctx.lineTo(x, innerInset + len);
      ctx.moveTo(x, height - innerInset);
      ctx.lineTo(x, height - innerInset - len);
      ctx.stroke();
      idx++;
    }

    idx = 0;
    for (let y = innerInset + marginGuard; y <= height - innerInset - marginGuard; y += 40) {
      const isMajor = idx % 4 === 0;
      const len = isMajor ? 7 : 4;
      ctx.strokeStyle = isMajor ? COLORS.goldDark : 'rgba(197, 162, 98, 0.6)';
      ctx.lineWidth = isMajor ? 1.0 : 0.75;

      ctx.beginPath();
      ctx.moveTo(innerInset, y);
      ctx.lineTo(innerInset + len, y);
      ctx.moveTo(width - innerInset, y);
      ctx.lineTo(width - innerInset - len, y);
      ctx.stroke();
      idx++;
    }
    ctx.restore();
  }
}

/**
 * Vẽ Cung Thước Đo Bán Nguyệt Hai Bên (-30°..+30° và 150°..210°)
 * Cân bằng trọng lượng thị giác với cụm trung tâm trên màn hình rộng
 */
function drawLateralAstrolabeArc(
  ctx: CanvasRenderingContext2D,
  radius: number,
  startDeg: number,
  endDeg: number,
  revealProgress: number,
): void {
  const p = easeOutCubic(revealProgress);
  if (p <= 0) return;

  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  const midRad = (startRad + endRad) / 2;
  const halfSpan = ((endRad - startRad) / 2) * p;
  const a0 = midRad - halfSpan;
  const a1 = midRad + halfSpan;

  const bandOffset = 10;

  ctx.save();
  ctx.globalAlpha *= p;

  // Dải nền vàng nhạt dày dặn giữa 2 cung thước đo
  ctx.beginPath();
  ctx.arc(0, 0, radius + bandOffset, a0, a1);
  ctx.arc(0, 0, radius, a1, a0, true);
  ctx.closePath();
  ctx.fillStyle = 'rgba(197, 162, 98, 0.08)';
  ctx.fill();

  // Hai cung viền dày dặn (vàng thếp & đỏ chu sa)
  ctx.strokeStyle = COLORS.goldBright;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, 0, radius + bandOffset, a0, a1);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(200, 62, 55, 0.75)';
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.arc(0, 0, radius, a0, a1);
  ctx.stroke();

  // Hai vạch chặn đầu cung (End brackets)
  for (const capAngle of [a0, a1]) {
    ctx.strokeStyle = COLORS.cinnabar;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(Math.cos(capAngle) * (radius - 3), Math.sin(capAngle) * (radius - 3));
    ctx.lineTo(
      Math.cos(capAngle) * (radius + bandOffset + 3),
      Math.sin(capAngle) * (radius + bandOffset + 3),
    );
    ctx.stroke();
  }

  // Vạch chia độ rõ nét mỗi 3° và vạch lớn mỗi 15° (-30, -15, 0, 15, 30)
  const stepDeg = 3;
  for (let d = startDeg; d <= endDeg; d += stepDeg) {
    const rad = (d * Math.PI) / 180;
    if (rad < a0 || rad > a1) continue;

    const isMajor = d % 15 === 0;
    const isMid = d % 30 === 0 || d === 180 || d === 0;

    const innerTick = radius - (isMajor ? 4 : 0);
    const outerTick = radius + (isMajor ? bandOffset + 4 : bandOffset * 0.65);

    ctx.strokeStyle = isMid ? COLORS.cinnabar : isMajor ? COLORS.goldDark : COLORS.goldBright;
    ctx.lineWidth = isMid ? 1.5 : isMajor ? 1.15 : 0.75;
    ctx.beginPath();
    ctx.moveTo(Math.cos(rad) * innerTick, Math.sin(rad) * innerTick);
    ctx.lineTo(Math.cos(rad) * outerTick, Math.sin(rad) * outerTick);
    ctx.stroke();

    if (isMajor) {
      ctx.fillStyle = isMid ? COLORS.cinnabar : COLORS.goldDark;
      ctx.beginPath();
      ctx.arc(
        Math.cos(rad) * (radius + bandOffset + 7),
        Math.sin(rad) * (radius + bandOffset + 7),
        isMid ? 2.4 : 1.7,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }

  ctx.restore();
}

/** B. Vẽ Lưới Trục Xuyên Tâm, 2 Vòng Quỹ Đạo Ngoại Vi Kèm Sao Băng & 2 Cung Thước Đo Bán Nguyệt */
function drawFullViewportCartographyGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  r1: number,
  artTime: number,
  liveTime: number,
  borderOffsetX: number,
  borderOffsetY: number,
  midOffsetX: number,
  midOffsetY: number,
): void {
  const inset = (width >= 768 ? 28 : 16) + 5;
  const innerW = width - inset * 2;
  const innerH = height - inset * 2;
  if (innerW <= 20 || innerH <= 20) return;

  const gridCx = width / 2 + midOffsetX;
  const gridCy = height / 2 + midOffsetY;
  const maxSpan = Math.hypot(width, height);

  ctx.save();
  ctx.beginPath();
  ctx.rect(inset + borderOffsetX, inset + borderOffsetY, innerW, innerH);
  ctx.clip();

  // 8 đường trục phương hướng nét đứt kéo dài chạm tới tận khung viền ngoài cùng
  const axisP = easeOutCubic(clamp01((artTime - 0.5) / 1.5));
  if (axisP > 0) {
    ctx.save();
    ctx.strokeStyle = 'rgba(197, 162, 98, 0.35)';
    ctx.lineWidth = 0.85;
    ctx.setLineDash([4, 6]);

    const startR = r1 * 1.32;
    const targetR = maxSpan * 0.65;
    const currentEndR = startR + (targetR - startR) * axisP;

    for (let k = 0; k < 8; k++) {
      const a = k * (Math.PI / 4);
      ctx.beginPath();
      ctx.moveTo(gridCx + Math.cos(a) * startR, gridCy + Math.sin(a) * startR);
      ctx.lineTo(gridCx + Math.cos(a) * currentEndR, gridCy + Math.sin(a) * currentEndR);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2 vòng tròn quỹ đạo ngoại vi khổng lồ (R_outer1 = max(W,H)*0.38, R_outer2 = max(W,H)*0.48) kèm sao băng quỹ đạo
  const maxDim = Math.max(width, height);
  const rOuter1 = maxDim * 0.38;
  const rOuter2 = maxDim * 0.48;
  const outerRingP = easeOutCubic(clamp01((artTime - 2.3) / 1.4));

  if (outerRingP > 0) {
    const orbitTime = Math.max(0, liveTime - 2.3);

    // Vòng quỹ đạo ngoại vi 1 + 2 cung thước đo bán nguyệt (-30°..+30° & 150°..210°)
    ctx.save();
    ctx.translate(gridCx, gridCy);

    // Hai cung thước đo bán nguyệt hai bên giữ ổn định ở hai cánh để cân bằng trọng lượng thị giác
    drawLateralAstrolabeArc(ctx, rOuter1, -30, 30, outerRingP);
    drawLateralAstrolabeArc(ctx, rOuter1, 150, 210, outerRingP);

    ctx.save();
    ctx.rotate(orbitTime * 0.025);
    ctx.globalAlpha *= outerRingP;

    ctx.strokeStyle = 'rgba(197, 162, 98, 0.42)';
    ctx.lineWidth = 0.9;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, rOuter1, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2 sao băng chuyển động dọc quỹ đạo ngoại vi 1 (đuôi 12 đoạn mờ dần 0.85 -> 0)
    ctx.save();
    ctx.globalAlpha *= outerRingP;
    for (let k = 0; k < 2; k++) {
      const headTheta = orbitTime * 0.22 + k * Math.PI + Math.PI / 6;
      const isCinnabar = k % 2 === 0;
      drawCometTrail(
        ctx,
        headTheta,
        1,
        0.28,
        12,
        3.0,
        isCinnabar ? COLORS.cinnabar : COLORS.goldBright,
        isCinnabar ? '200, 62, 55' : '197, 162, 98',
        (theta) => [Math.cos(theta) * rOuter1, Math.sin(theta) * rOuter1],
      );
    }
    ctx.restore();

    ctx.restore();

    // Vòng quỹ đạo ngoại vi 2
    ctx.save();
    ctx.translate(gridCx, gridCy);

    ctx.save();
    ctx.rotate(-orbitTime * 0.018);
    ctx.globalAlpha *= outerRingP;

    ctx.strokeStyle = 'rgba(138, 106, 47, 0.34)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, rOuter2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 2 sao băng nghịch chiều trên quỹ đạo ngoại vi 2 (đuôi 12 đoạn mờ dần 0.85 -> 0)
    ctx.save();
    ctx.globalAlpha *= outerRingP;
    for (let k = 0; k < 2; k++) {
      const headTheta = -orbitTime * 0.16 + k * Math.PI + Math.PI / 3;
      const isJade = k % 2 === 0;
      drawCometTrail(
        ctx,
        headTheta,
        -1,
        0.24,
        12,
        2.8,
        isJade ? COLORS.jadeLight : COLORS.goldDark,
        isJade ? '78, 155, 88' : '138, 106, 47',
        (theta) => [Math.cos(theta) * rOuter2, Math.sin(theta) * rOuter2],
      );
    }
    ctx.restore();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Dòng Chảy Tơ Sơn Mài: 16 sợi tơ sóng điều hòa (Vàng Thếp & Đỏ Chu Sa)
 * Uốn lượn mềm mại từ hai bên cánh hướng về tâm, nhọn ở 2 đầu và dày 1px ở giữa.
 */
function drawLacquerSilkFilaments(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  r1: number,
  artTime: number,
  liveTime: number,
  borderOffsetX: number,
  borderOffsetY: number,
  midOffsetX: number,
  midOffsetY: number,
): void {
  const silkP = easeOutCubic(clamp01((artTime - 0.8) / 1.5));
  if (silkP <= 0) return;

  const inset = (width >= 768 ? 28 : 16) + 5;
  const innerW = width - inset * 2;
  const innerH = height - inset * 2;
  if (innerW <= 40 || innerH <= 40) return;

  const cx = width / 2 + midOffsetX;
  const cy = height / 2 + midOffsetY;
  const outerXSpread = Math.max(r1 * 2.1, width * 0.45);
  const innerStopR = r1 * 1.62;
  const halfHeightSpan = height * 0.37;
  const sampleCount = 26;

  ctx.save();
  ctx.beginPath();
  ctx.rect(inset + borderOffsetX, inset + borderOffsetY, innerW, innerH);
  ctx.clip();
  ctx.globalAlpha *= silkP;

  for (let idx = 0; idx < 16; idx++) {
    const side: -1 | 1 = idx < 8 ? -1 : 1;
    const lane = idx % 8;
    const normLane = (lane - 3.5) / 3.5;
    const yOuter = cy + normLane * halfHeightSpan;
    const yInner = cy + normLane * (r1 * 1.15);
    const xOuter = cx + side * outerXSpread;
    const xInner = cx + side * innerStopR;
    const waveFreq = 1.6 + (lane % 3) * 0.35;
    const waveAmp = (10 + (lane % 4) * 4.5) * (width >= 768 ? 1 : 0.65);
    const wavePhase = liveTime * (0.75 + (lane % 3) * 0.14) + idx * 0.72;

    const spinePoints: (readonly [number, number])[] = [];
    for (let s = 0; s <= sampleCount; s++) {
      const u = s / sampleCount;
      const uSmooth = u * u * (3 - 2 * u);
      const px = xOuter + (xInner - xOuter) * u;
      const baseY = yOuter + (yInner - yOuter) * uSmooth;
      const envelope = Math.sin(Math.PI * u);
      const py = baseY + Math.sin(u * Math.PI * waveFreq + wavePhase) * waveAmp * envelope;
      spinePoints.push([px, py]);
    }

    const upperSide: (readonly [number, number])[] = [];
    const lowerSide: (readonly [number, number])[] = [];

    for (let s = 0; s <= sampleCount; s++) {
      const curr = spinePoints[s];
      if (!curr) continue;
      const prev = spinePoints[Math.max(0, s - 1)] ?? curr;
      const next = spinePoints[Math.min(sampleCount, s + 1)] ?? curr;
      const dx = next[0] - prev[0];
      const dy = next[1] - prev[1];
      const segLen = Math.hypot(dx, dy) || 1;
      const nx = -dy / segLen;
      const ny = dx / segLen;

      const u = s / sampleCount;
      const halfWidth = 0.5 * Math.sin(Math.PI * u);
      upperSide.push([curr[0] + nx * halfWidth, curr[1] + ny * halfWidth]);
      lowerSide.push([curr[0] - nx * halfWidth, curr[1] - ny * halfWidth]);
    }

    const firstUpper = upperSide[0];
    if (!firstUpper) continue;

    ctx.beginPath();
    ctx.moveTo(firstUpper[0], firstUpper[1]);
    for (let s = 1; s < upperSide.length; s++) {
      const pt = upperSide[s];
      if (pt) ctx.lineTo(pt[0], pt[1]);
    }
    for (let s = lowerSide.length - 1; s >= 0; s--) {
      const pt = lowerSide[s];
      if (pt) ctx.lineTo(pt[0], pt[1]);
    }
    ctx.closePath();

    ctx.fillStyle = idx % 2 === 0 ? 'rgba(197, 162, 98, 0.28)' : 'rgba(200, 62, 55, 0.18)';
    ctx.fill();
  }

  ctx.restore();
}

/** C. Vẽ 4 Chuỗi Nhánh Thiên Văn Mở (Open Branched Constellations) & 40 hạt bụi vàng */
function drawAmbientStarfieldAndDust(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  r1: number,
  artTime: number,
  twinkleTime: number,
  midOffsetX: number,
  midOffsetY: number,
): void {
  const cx = width / 2;
  const cy = height / 2;
  const inset = width >= 768 ? 48 : 28;

  ctx.save();
  ctx.translate(midOffsetX, midOffsetY);

  // 1. 4 chuỗi nhánh thiên văn mở hai bên cánh (6-8 sao/cụm, không nối khép kín, có sao chính kèm vòng bao)
  const wingP = easeOutCubic(clamp01((artTime - 2.6) / 1.5));
  if (wingP > 0) {
    const centralGuardR = r1 * 2.85;
    const isWide = width >= height * 1.15;

    for (const cluster of WING_BRANCHED_CLUSTERS) {
      const anchorX = isWide
        ? cx + cluster.xSign * Math.max(centralGuardR + 68, width * 0.34)
        : cx + cluster.xSign * (width * 0.28);
      const anchorY = isWide
        ? cy + cluster.ySign * (height * 0.25)
        : cy + cluster.ySign * Math.max(centralGuardR + 36, height * 0.34);

      if (
        anchorX < inset + 28 ||
        anchorX > width - inset - 28 ||
        anchorY < inset + 24 ||
        anchorY > height - inset - 24
      ) {
        continue;
      }

      const scaleFactor = width >= 768 ? 1 : 0.72;
      const pts = cluster.stars.map((s) => ({
        x: anchorX + s.dx * scaleFactor,
        y: anchorY + s.dy * scaleFactor,
        isPrimary: s.isPrimary,
        isJade: s.isJade,
        size: s.size * scaleFactor,
      }));

      ctx.save();
      ctx.globalAlpha *= wingP;

      // Đường gấp khúc phân nhánh mở bằng nét vàng mảnh 0.75px
      ctx.strokeStyle = 'rgba(197, 162, 98, 0.58)';
      ctx.lineWidth = 0.75;
      for (let eIdx = 0; eIdx < cluster.edges.length; eIdx++) {
        const edge = cluster.edges[eIdx];
        if (!edge) continue;
        const a = pts[edge[0]];
        const b = pts[edge[1]];
        if (!a || !b) continue;

        const ep = clamp01((wingP - eIdx * 0.09) / 0.5);
        if (ep <= 0) continue;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * ep, a.y + (b.y - a.y) * ep);
        ctx.stroke();
      }

      // Sao chính rực sáng kèm vòng tròn nhỏ bao quanh & các sao phụ
      for (let sIdx = 0; sIdx < pts.length; sIdx++) {
        const pt = pts[sIdx];
        if (!pt) continue;
        const sp = easeOutCubic(clamp01((wingP - sIdx * 0.07) / 0.45));
        if (sp <= 0) continue;

        const twinkle = 0.84 + 0.16 * Math.sin(twinkleTime * 2.2 + sIdx * 1.3 + cluster.xSign);
        const rad = pt.size * sp * twinkle;

        if (pt.isPrimary) {
          // Vòng tròn nhỏ bao quanh sao chính
          ctx.strokeStyle = 'rgba(197, 162, 98, 0.75)';
          ctx.lineWidth = 0.85;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, rad * 2.15, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = COLORS.cinnabarGlow;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, rad * 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = pt.isJade ? COLORS.jadeLight : COLORS.cinnabar;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
        ctx.fill();

        if (pt.isPrimary) {
          ctx.fillStyle = COLORS.paperCenter;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, rad * 0.36, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.restore();
    }
  }

  // 2. 40 hạt bụi vàng & chu sa lấp lánh trôi nổi
  const dustReveal = clamp01(artTime / 1.4);
  if (dustReveal > 0) {
    for (const mote of AMBIENT_DUST) {
      const px = mote.baseX * width + Math.sin(twinkleTime * 0.45 + mote.phase) * mote.driftX;
      const py = mote.baseY * height + Math.cos(twinkleTime * 0.38 + mote.phase) * mote.driftY;
      const twinkleAlpha =
        0.2 + 0.55 * (0.5 + 0.5 * Math.sin(twinkleTime * mote.twinkleSpeed + mote.phase));

      ctx.save();
      ctx.globalAlpha = dustReveal * twinkleAlpha;
      ctx.fillStyle = mote.isCinnabar ? COLORS.cinnabar : COLORS.goldBright;
      ctx.beginPath();
      ctx.arc(px, py, mote.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

/** Lớp 1 Trung tâm: Hỗn Thiên Nghi 3D (3 elip nghiêng 30°, 60°, -45° kèm sao băng quỹ đạo) */
function drawArmillaryCometRings(
  ctx: CanvasRenderingContext2D,
  r1: number,
  artTime: number,
  liveTime: number,
  coreFade: number,
): void {
  const armillaryP = easeOutCubic(clamp01((artTime - 1.55) / 1.1));
  if (armillaryP <= 0) return;

  const tilts = [
    { angle: Math.PI / 6, speed: 0.9, orbitRate: 1.45, phase: 0.2, isCinnabar: false }, // 30°
    { angle: Math.PI / 3, speed: -0.75, orbitRate: -1.15, phase: 1.4, isCinnabar: true }, // 60°
    { angle: -Math.PI / 4, speed: 0.65, orbitRate: 1.7, phase: 2.6, isCinnabar: false }, // -45°
  ] as const;

  const majorR = r1 * 0.87 * armillaryP;
  ctx.save();
  ctx.globalAlpha *= coreFade * armillaryP;

  for (const ring of tilts) {
    const minorFactor = Math.max(0.16, Math.abs(Math.cos(liveTime * ring.speed + ring.phase)));
    const minorR = majorR * minorFactor;
    const cosA = Math.cos(ring.angle);
    const sinA = Math.sin(ring.angle);

    ctx.strokeStyle = 'rgba(197, 162, 98, 0.75)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, majorR, minorR, ring.angle, 0, Math.PI * 2);
    ctx.stroke();

    // Hạt sao băng chuyển động dọc quỹ đạo elip kèm đuôi mờ 12 đoạn (opacity 0.85 -> 0)
    const orbitTheta = liveTime * ring.orbitRate + ring.phase * 2.1;
    const direction: 1 | -1 = ring.orbitRate >= 0 ? 1 : -1;
    drawCometTrail(
      ctx,
      orbitTheta,
      direction,
      0.72,
      12,
      2.7,
      ring.isCinnabar ? COLORS.cinnabar : COLORS.goldBright,
      ring.isCinnabar ? '200, 62, 55' : '197, 162, 98',
      (theta) => {
        const lx = Math.cos(theta) * majorR;
        const ly = Math.sin(theta) * minorR;
        return [lx * cosA - ly * sinA, lx * sinA + ly * cosA];
      },
    );
  }
  ctx.restore();
}

/** Phác họa 1 tầng lưới trắc địa 16 điểm (nối bước 5 & 7 qua quadraticCurveTo hướng tâm) */
function drawPoincareLayer(
  ctx: CanvasRenderingContext2D,
  diskR: number,
  rotationRad: number,
  strokeColor: string,
  lineWidth: number,
  layerOpacity: number,
  fillInterior: boolean,
): void {
  const stepAngle = (Math.PI * 2) / POINCARE_BOUNDARY_COUNT;
  const pts: (readonly [number, number])[] = [];
  for (let k = 0; k < POINCARE_BOUNDARY_COUNT; k++) {
    const theta = k * stepAngle;
    pts.push([Math.cos(theta) * diskR, Math.sin(theta) * diskR]);
  }

  ctx.save();
  ctx.rotate(rotationRad);

  // Tô lấp mờ đa giác sao 16 đỉnh trắc địa bước 7 cho tầng chính
  if (fillInterior) {
    const startPt = pts[0];
    if (startPt) {
      ctx.beginPath();
      ctx.moveTo(startPt[0], startPt[1]);
      let currIdx = 0;
      for (let i = 0; i < POINCARE_BOUNDARY_COUNT; i++) {
        const nextIdx = (currIdx + 7) % POINCARE_BOUNDARY_COUNT;
        const p1 = pts[currIdx];
        const p2 = pts[nextIdx];
        if (p1 && p2) {
          const [cxCtrl, cyCtrl] = computePoincareControlPoint(p1[0], p1[1], p2[0], p2[1], diskR);
          ctx.quadraticCurveTo(cxCtrl, cyCtrl, p2[0], p2[1]);
        }
        currIdx = nextIdx;
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(200, 62, 55, 0.04)';
      ctx.fill('evenodd');
    }
  }

  ctx.globalAlpha *= layerOpacity;
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;

  for (const jumpStep of [5, 7] as const) {
    ctx.beginPath();
    for (let k = 0; k < POINCARE_BOUNDARY_COUNT; k++) {
      const p1 = pts[k];
      const p2 = pts[(k + jumpStep) % POINCARE_BOUNDARY_COUNT];
      if (!p1 || !p2) continue;
      const [cxCtrl, cyCtrl] = computePoincareControlPoint(p1[0], p1[1], p2[0], p2[1], diskR);
      ctx.moveTo(p1[0], p1[1]);
      ctx.quadraticCurveTo(cxCtrl, cyCtrl, p2[0], p2[1]);
    }
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Lớp 1 Trung tâm: Lưới Trắc Địa Đĩa Poincaré (Hyperbolic Mộng Gỗ Lattice)
 * - 16 điểm biên kết nối bước 5 và bước 7 qua cung cong hướng tâm quadraticCurveTo
 * - 2 tầng xoay ngược chiều (time * 0.15 & -time * 0.1) tạo hiệu ứng vạn hoa moiré
 */
function drawPoincareLattice(
  ctx: CanvasRenderingContext2D,
  r1: number,
  artTime: number,
  liveTime: number,
  coreFade: number,
): void {
  const latticeP = easeOutCubic(clamp01((artTime - 1.25) / 1.1));
  if (latticeP <= 0) return;

  const diskR = r1 * 0.9 * latticeP;
  ctx.save();
  ctx.globalAlpha *= coreFade * latticeP;

  // Tầng chính: xoay thuận (time * 0.15), nét Đỏ Chu Sa #C83E37 (1.2px, opacity 0.75) + tô lấp mờ 0.04
  drawPoincareLayer(ctx, diskR, liveTime * 0.15, COLORS.cinnabar, 1.2, 0.75, true);

  // Tầng phụ: xoay nghịch (-time * 0.1), nét Vàng Thếp #C5A262 (0.85px, opacity 0.65)
  drawPoincareLayer(ctx, diskR, -liveTime * 0.1, COLORS.goldBright, 0.85, 0.65, false);

  ctx.restore();
}

/**
 * Lớp 2 Trung tâm: Phép Dựng Hình Compa Euclid & Giao Điểm Ngọc
 * - 4 đường tròn phụ trợ bán kính 0.5*R1 có tâm chạy trên đường tròn 0.5*R1 (nét đứt #8A6A2F)
 * - Tia quét bán kính vàng mảnh kèm vệt quạt sáng mờ & 8 giao điểm #4E9B58 / #C83E37 bừng sáng theo nhịp sóng
 */
function drawCompassConstruction(
  ctx: CanvasRenderingContext2D,
  r1: number,
  artTime: number,
  liveTime: number,
  coreFade: number,
): void {
  const compassP = easeOutCubic(clamp01((artTime - 1.55) / 1.1));
  if (compassP <= 0) return;

  const locusR = r1 * 0.5 * compassP;
  const circleR = r1 * 0.5 * compassP;
  const constructionRot = liveTime * 0.18;
  const sweepAngle = liveTime * 1.35 - Math.PI / 2;

  ctx.save();
  ctx.globalAlpha *= coreFade * compassP;

  // 4 đường tròn dựng hình phụ trợ nét đứt siêu mảnh #8A6A2F
  ctx.save();
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = COLORS.goldDark;
  ctx.lineWidth = 0.85;
  ctx.globalAlpha *= 0.68;

  for (let k = 0; k < 4; k++) {
    const centerTheta = constructionRot + k * (Math.PI / 2);
    const cxCirc = Math.cos(centerTheta) * locusR;
    const cyCirc = Math.sin(centerTheta) * locusR;
    ctx.beginPath();
    ctx.arc(cxCirc, cyCirc, circleR, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();

  // Hiệu ứng tia quét Compa: vệt quạt sáng mờ & kim bán kính vàng mảnh
  const fanSlices = 14;
  const fanSpan = 0.88;
  const sliceSpan = fanSpan / fanSlices;
  const sweepRadius = r1 * 0.91 * compassP;

  for (let s = 0; s < fanSlices; s++) {
    const a1 = sweepAngle - s * sliceSpan;
    const a0 = sweepAngle - (s + 1) * sliceSpan;
    const fanAlpha = 0.15 * (1 - s / fanSlices);
    ctx.fillStyle = `rgba(197, 162, 98, ${fanAlpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, sweepRadius, a0, a1);
    ctx.closePath();
    ctx.fill();
  }

  ctx.strokeStyle = COLORS.goldBright;
  ctx.lineWidth = 1.15;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(Math.cos(sweepAngle) * sweepRadius, Math.sin(sweepAngle) * sweepRadius);
  ctx.stroke();

  // 8 giao điểm hình học: 4 nút tâm tròn (0.5*R1, Đỏ Chu Sa) & 4 giao điểm Vesica (0.5*sqrt(2)*R1, Xanh Men Ngọc)
  const vesicaR = locusR * Math.SQRT2;
  for (let idx = 0; idx < 8; idx++) {
    const isJade = idx % 2 === 1;
    const nodeTheta = constructionRot + idx * (Math.PI / 4);
    const nodeR = isJade ? vesicaR : locusR;
    const nx = Math.cos(nodeTheta) * nodeR;
    const ny = Math.sin(nodeTheta) * nodeR;

    const lag = angularLagBehindSweep(sweepAngle, nodeTheta);
    const sweepFlare = Math.exp(-lag * 2.4);
    const wavePulse = 0.5 + 0.5 * Math.sin(liveTime * 3.2 + idx * 0.85);
    const intensity = Math.min(1, 0.35 + 0.3 * wavePulse + 0.65 * sweepFlare);

    const gemR = (2.1 + 1.3 * intensity) * compassP;
    const haloR = (4.2 + 3.4 * sweepFlare) * compassP;

    ctx.fillStyle = isJade
      ? `rgba(78, 155, 88, ${(0.18 + 0.28 * intensity).toFixed(3)})`
      : `rgba(200, 62, 55, ${(0.18 + 0.28 * intensity).toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(nx, ny, haloR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isJade ? COLORS.jadeLight : COLORS.cinnabar;
    ctx.beginPath();
    ctx.arc(nx, ny, gemR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.paperCenter;
    ctx.beginPath();
    ctx.arc(nx, ny, gemR * 0.36, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Lớp 3 Trung tâm: Ấn Tâm Hoa Thị Vàng
 * - Đường cong cực 8 cánh r = 0.18 * R1 * cos(4θ) viền Vàng Thếp #C5A262
 * - Hạt ngọc tâm Đỏ Chu Sa #C83E37 tỏa quầng sáng ấm (shadowBlur = 10)
 */
function drawCentralGoldenRosette(
  ctx: CanvasRenderingContext2D,
  r1: number,
  artTime: number,
  liveTime: number,
  coreFade: number,
): void {
  const sealP = easeOutCubic(clamp01((artTime - 0.12) / 0.9));
  if (sealP <= 0) return;

  const breath = 0.96 + 0.04 * Math.sin(liveTime * 2.2);
  const amplitude = 0.18 * r1 * sealP * breath;
  const steps = 144;
  const stepTheta = (Math.PI * 2) / steps;

  ctx.save();
  ctx.globalAlpha *= coreFade;

  // Hoa thị 8 cánh cực sắc nét r = 0.18 * R1 * cos(4θ)
  ctx.save();
  ctx.rotate(liveTime * 0.06);
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const theta = i * stepTheta;
    const [px, py] = computeRosePetalPoint(amplitude, theta);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(197, 162, 98, 0.14)';
  ctx.fill();
  ctx.strokeStyle = COLORS.goldBright;
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.restore();

  // Hạt ngọc tâm Đỏ Chu Sa #C83E37 tỏa quầng sáng ấm qua sprite đệm sẵn 120fps (không dùng shadowBlur)
  const jewelR = Math.max(3.6, r1 * 0.048) * sealP;
  drawGlowSprite(
    ctx,
    getKhueGlowSprites().cinnabar,
    0,
    0,
    jewelR * 2.8,
    0.78,
    'rgba(200, 62, 55, 0.25)',
  );
  ctx.fillStyle = COLORS.cinnabar;
  ctx.beginPath();
  ctx.arc(0, 0, jewelR, 0, Math.PI * 2);
  ctx.fill();

  // Điểm phản quang tinh tế trên mặt ngọc
  ctx.fillStyle = COLORS.paperCenter;
  ctx.beginPath();
  ctx.arc(-jewelR * 0.28, -jewelR * 0.28, jewelR * 0.32, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Toàn bộ cụm cơ hệ trung tâm bên trong cửa sổ tròn R₁ */
function drawCentralCelestialMechanism(
  ctx: CanvasRenderingContext2D,
  r1: number,
  artTime: number,
  liveTime: number,
): void {
  const coreFade = artTime >= 5.1 ? clamp01(1 - (artTime - 5.1) / 0.3) : 1;
  if (coreFade <= 0.01) return;

  // Hỗn Thiên Nghi 3D kèm vệt sao băng 12 đoạn
  drawArmillaryCometRings(ctx, r1, artTime, liveTime, coreFade);
  // Lớp 1: Lưới Trắc Địa Đĩa Poincaré (2 tầng xoay ngược chiều)
  drawPoincareLattice(ctx, r1, artTime, liveTime, coreFade);
  // Lớp 2: Phép Dựng Hình Compa 4 đường tròn & 8 nút ngọc bừng sáng
  drawCompassConstruction(ctx, r1, artTime, liveTime, coreFade);
  // Lớp 3: Ấn Tâm Hoa Thị Vàng (r = 0.18*R1*cos(4θ)) & hạt ngọc #C83E37 shadowBlur = 10
  drawCentralGoldenRosette(ctx, r1, artTime, liveTime, coreFade);
}

interface AstrolabeCometSpec {
  readonly count: number;
  readonly angularRate: number;
  readonly phaseOffset: number;
  readonly arcSpanRad: number;
  readonly color: string;
  readonly trailRgb: string;
}

/** Vẽ 1 vòng thước đo thiên văn có vạch chia 5°, 15° kèm sao băng quỹ đạo */
function drawAstrolabeRing(
  ctx: CanvasRenderingContext2D,
  radius: number,
  rotationRad: number,
  revealProgress: number,
  cometTime: number,
  ringStyle: 'inner' | 'middle' | 'outer',
  cometSpec: AstrolabeCometSpec,
): void {
  const p = easeOutCubic(revealProgress);
  if (p <= 0) return;

  ctx.save();
  ctx.rotate(rotationRad);
  ctx.globalAlpha *= p;

  ctx.strokeStyle = ringStyle === 'middle' ? 'rgba(138, 106, 47, 0.5)' : 'rgba(197, 162, 98, 0.6)';
  ctx.lineWidth = ringStyle === 'middle' ? 1.15 : 0.9;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  if (ringStyle === 'middle') {
    ctx.save();
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = 'rgba(200, 62, 55, 0.28)';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.arc(0, 0, radius - 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  const totalSteps = 72;
  for (let i = 0; i < totalSteps; i++) {
    const angle = (i * Math.PI * 2) / totalSteps;
    const isMajor = i % 3 === 0;
    const isCardinal = i % 18 === 0;

    const tickLen = isCardinal ? 11 : isMajor ? 7.5 : 3.5;
    const innerR = radius - tickLen * 0.5;
    const outerR = radius + tickLen * 0.5;

    ctx.strokeStyle = isCardinal
      ? COLORS.cinnabar
      : isMajor
        ? COLORS.goldDark
        : 'rgba(197, 162, 98, 0.65)';
    ctx.lineWidth = isCardinal ? 1.35 : isMajor ? 1.0 : 0.7;

    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
    ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
    ctx.stroke();
  }

  // Các hạt sao băng chuyển động trên vòng thước đo thiên văn
  const direction: 1 | -1 = cometSpec.angularRate >= 0 ? 1 : -1;
  const stepSpacing = (Math.PI * 2) / cometSpec.count;
  for (let k = 0; k < cometSpec.count; k++) {
    const headTheta = cometTime * cometSpec.angularRate + cometSpec.phaseOffset + k * stepSpacing;
    drawCometTrail(
      ctx,
      headTheta,
      direction,
      cometSpec.arcSpanRad,
      12,
      3.1,
      cometSpec.color,
      cometSpec.trailRgb,
      (theta) => [Math.cos(theta) * radius, Math.sin(theta) * radius],
    );
  }

  ctx.restore();
}

/** Vẽ chòm 16 ngôi sao Khuê trung tâm nối bởi các đoạn kỷ hà mảnh */
function drawKhueConstellation(
  ctx: CanvasRenderingContext2D,
  r1: number,
  rotationRad: number,
  revealProgress: number,
  twinkleTime: number,
): void {
  const p = easeOutCubic(revealProgress);
  if (p <= 0) return;

  ctx.save();
  ctx.rotate(rotationRad);

  const positions = KHUE_STARS.map((star) => {
    const rad = (star.angleDeg * Math.PI) / 180;
    const dist = r1 * star.radiusFactor;
    return {
      x: Math.cos(rad) * dist,
      y: Math.sin(rad) * dist,
      star,
    };
  });

  const totalEdges = KHUE_CONSTELLATION_EDGES.length;
  ctx.strokeStyle = 'rgba(138, 106, 47, 0.45)';
  ctx.lineWidth = 0.85;

  for (let i = 0; i < totalEdges; i++) {
    const edge = KHUE_CONSTELLATION_EDGES[i];
    if (!edge) continue;

    const a = positions[edge[0]];
    const b = positions[edge[1]];
    if (!a || !b) continue;

    const edgeStart = (i / totalEdges) * 0.75;
    const edgeP = clamp01((p - edgeStart) / 0.35);
    if (edgeP <= 0) continue;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(a.x + (b.x - a.x) * edgeP, a.y + (b.y - a.y) * edgeP);
    ctx.stroke();
  }

  for (let i = 0; i < positions.length; i++) {
    const item = positions[i];
    if (!item) continue;

    const starDelay = (i / positions.length) * 0.6;
    const starP = easeOutCubic(clamp01((p - starDelay) / 0.4));
    if (starP <= 0) continue;

    const twinkle = 0.82 + 0.18 * Math.sin(twinkleTime * 2.6 + i * 0.9);
    const radius = (item.star.tier === 2 ? 3.2 : 2.1) * starP * twinkle;

    if (item.star.tier === 2) {
      ctx.fillStyle = item.star.isCinnabar ? 'rgba(200, 62, 55, 0.16)' : 'rgba(197, 162, 98, 0.22)';
      ctx.beginPath();
      ctx.arc(item.x, item.y, radius * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = item.star.isCinnabar ? COLORS.cinnabar : COLORS.goldBright;
    ctx.beginPath();
    ctx.arc(item.x, item.y, radius, 0, Math.PI * 2);
    ctx.fill();

    if (item.star.tier === 2) {
      ctx.fillStyle = COLORS.paperCenter;
      ctx.beginPath();
      ctx.arc(item.x, item.y, radius * 0.38, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** Hàm vẽ toàn khung hình Thiên Cầu Khuê Văn Các tại thời điểm hiện tại */
export function renderKhueVanCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  state: KhueVanRenderState,
): ComputedPortalTransform {
  if (width <= 0 || height <= 0) {
    return { portalRadius: 0, sceneScale: 1, sceneRotation: 0 };
  }

  const cx = width / 2;
  const cy = height / 2;
  const r1 = getWindowRadius(width, height);
  const squareHalf = r1 * 1.28;
  const rOuter1 = Math.max(width, height) * 0.38;

  const artTime = state.prefersReducedMotion ? 4.8 : state.elapsed;
  const liveTime = state.prefersReducedMotion ? 4.8 : state.elapsed;
  const portal = computePortalTransform(width, height, state);

  // Hệ số Parallax 3 lớp giảm dần về 0 khi cổng Hồi III mở rộng
  const mx = state.prefersReducedMotion ? 0 : clampSigned(state.parallaxX ?? 0);
  const my = state.prefersReducedMotion ? 0 : clampSigned(state.parallaxY ?? 0);
  const portalDamp = clamp01(1 - portal.portalRadius / Math.max(1, r1 * 2.2));
  const effMx = mx * portalDamp;
  const effMy = my * portalDamp;

  const borderOffsetX = -effMx * 4;
  const borderOffsetY = -effMy * 4;
  const midOffsetX = effMx * 10;
  const midOffsetY = effMy * 10;
  const coreOffsetX = effMx * 18;
  const coreOffsetY = effMy * 18;

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // 1. NỀN GIẤY DÓ HOÀNG CUNG CÓ VIGNETTE TRẦM NHẸ 4 GÓC (#FFFDF9 -> #EDE8D8 -> #E5DEC9) — cache theo kích thước
  let cachedGrad = khueGradientCache.get(ctx);
  if (
    !cachedGrad ||
    cachedGrad.width !== width ||
    cachedGrad.height !== height ||
    cachedGrad.rOuter1 !== rOuter1
  ) {
    const bgRadius = Math.hypot(cx, cy) * 1.05;
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bgRadius);
    bgGrad.addColorStop(0, COLORS.paperCenter);
    bgGrad.addColorStop(0.45, COLORS.paperMid);
    bgGrad.addColorStop(0.78, COLORS.paperEdge);
    bgGrad.addColorStop(1, COLORS.paperCornerDeep);

    const warmGlowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, rOuter1);
    warmGlowGrad.addColorStop(0, COLORS.warmCenterGlow);
    warmGlowGrad.addColorStop(1, 'rgba(229, 195, 120, 0)');

    cachedGrad = { width, height, rOuter1, bgGrad, warmGlowGrad };
    khueGradientCache.set(ctx, cachedGrad);
  }

  ctx.fillStyle = cachedGrad.bgGrad;
  ctx.fillRect(0, 0, width, height);

  // QUẦNG SÁNG ẤM TẠI TÂM (bám theo lớp lõi Parallax bằng translate thay vì tạo gradient mới mỗi frame)
  ctx.save();
  ctx.translate(cx + coreOffsetX, cy + coreOffsetY);
  ctx.fillStyle = cachedGrad.warmGlowGrad;
  ctx.fillRect(-rOuter1, -rOuter1, rOuter1 * 2, rOuter1 * 2);
  ctx.restore();

  // 2A. LỚP KHUNG VIỀN NGOÀI (-mx * 4, -my * 4)
  ctx.save();
  ctx.translate(borderOffsetX, borderOffsetY);
  drawImperialBorderAndFretwork(ctx, width, height, artTime);
  ctx.restore();

  // 2B. LỚP BẢN ĐỒ THIÊN VĂN, TƠ SƠN MÀI & CHÒM SAO (mx * 10, my * 10)
  drawFullViewportCartographyGrid(
    ctx,
    width,
    height,
    r1,
    artTime,
    liveTime,
    borderOffsetX,
    borderOffsetY,
    midOffsetX,
    midOffsetY,
  );
  drawLacquerSilkFilaments(
    ctx,
    width,
    height,
    r1,
    artTime,
    liveTime,
    borderOffsetX,
    borderOffsetY,
    midOffsetX,
    midOffsetY,
  );
  drawAmbientStarfieldAndDust(ctx, width, height, r1, artTime, liveTime, midOffsetX, midOffsetY);

  // 3A. LỚP VÒNG THIÊN VĂN ASTROLABE & 16 SAO KHUÊ (mx * 10, my * 10)
  ctx.save();
  ctx.translate(cx + midOffsetX, cy + midOffsetY);
  ctx.scale(portal.sceneScale, portal.sceneScale);
  ctx.rotate(portal.sceneRotation);

  const astrolabeTime = Math.max(0, liveTime - 2.4);
  drawAstrolabeRing(
    ctx,
    r1 * 1.98,
    astrolabeTime * 0.08,
    clamp01((artTime - 2.4) / 0.9),
    astrolabeTime,
    'inner',
    {
      count: 1,
      angularRate: 0.42,
      phaseOffset: 0.35,
      arcSpanRad: 0.46,
      color: COLORS.goldBright,
      trailRgb: '197, 162, 98',
    },
  );
  drawAstrolabeRing(
    ctx,
    r1 * 2.28,
    -astrolabeTime * 0.055,
    clamp01((artTime - 2.65) / 1.0),
    astrolabeTime,
    'middle',
    {
      count: 2,
      angularRate: -0.34,
      phaseOffset: Math.PI / 4,
      arcSpanRad: 0.42,
      color: COLORS.jadeLight,
      trailRgb: '78, 155, 88',
    },
  );
  drawAstrolabeRing(
    ctx,
    r1 * 2.62,
    astrolabeTime * 0.035,
    clamp01((artTime - 2.95) / 1.1),
    astrolabeTime,
    'outer',
    {
      count: 2,
      angularRate: 0.26,
      phaseOffset: 1.1,
      arcSpanRad: 0.36,
      color: COLORS.cinnabar,
      trailRgb: '200, 62, 55',
    },
  );

  drawKhueConstellation(
    ctx,
    r1,
    Math.max(0, artTime - 2.8) * 0.035,
    clamp01((artTime - 2.8) / 1.6),
    state.prefersReducedMotion ? 0 : liveTime,
  );
  ctx.restore();

  // 3B. LỚP KHUNG KHUÊ VĂN & ĐĨA POINCARÉ TÂM (mx * 18, my * 18)
  ctx.save();
  ctx.translate(cx + coreOffsetX, cy + coreOffsetY);
  ctx.scale(portal.sceneScale, portal.sceneScale);
  ctx.rotate(portal.sceneRotation);

  // 2 vòng sóng mảnh màu vàng thếp lan nhẹ trong 1.1s đầu
  for (let w = 0; w < 2; w++) {
    const waveDelay = w * 0.2;
    const wp = clamp01((artTime - waveDelay) / 1.1);
    if (wp > 0 && wp < 1) {
      ctx.save();
      ctx.strokeStyle = COLORS.goldBright;
      ctx.lineWidth = 1;
      ctx.globalAlpha = (1 - wp) * 0.75;
      ctx.beginPath();
      ctx.arc(0, 0, r1 * (0.15 + 1.15 * easeOutCubic(wp)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Khung Đất Vuông NÉT KÉP (2 hình vuông xoay 45° + phân giác & chấm vàng tại 8 đỉnh)
  const sq1P = clamp01((artTime - 0.6) / 0.95);
  const sq2P = clamp01((artTime - 0.95) / 0.95);
  drawDoubleOctagramFrame(ctx, squareHalf, sq1P, sq2P);

  // Vòng tròn "Trời tròn" R₁ viền kép Đỏ Chu Sa & Vàng Đồng
  const circleProgress = easeInOutQuart(clamp01((artTime - 1.1) / 1.1));
  if (circleProgress > 0) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * circleProgress;

    ctx.strokeStyle = COLORS.cinnabar;
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.arc(0, 0, r1, startAngle, endAngle);
    ctx.stroke();

    ctx.strokeStyle = COLORS.goldDark;
    ctx.lineWidth = 1.15;
    ctx.beginPath();
    ctx.arc(0, 0, r1 * 0.92, startAngle, endAngle);
    ctx.stroke();
  }

  // 8 Nan Gỗ Khuê Văn: tô nền mờ rgba(200,62,55,0.05) + vạch khóa ngang song tiện cổ truyền ở giữa
  const barsProgress = easeOutCubic(clamp01((artTime - 2.05) / 0.95));
  if (barsProgress > 0) {
    const barEndR = squareHalf - 4;
    const currentEndR = r1 + (barEndR - r1) * barsProgress;
    const midBarR = (r1 + barEndR) * 0.5;
    const lockP = clamp01((barsProgress - 0.45) / 0.55);

    for (let k = 0; k < 8; k++) {
      ctx.save();
      ctx.rotate(k * (Math.PI / 4));

      // Tô nền mờ giữa 2 thanh nan
      ctx.fillStyle = COLORS.cinnabarNanFill;
      ctx.fillRect(r1, -3, Math.max(0, currentEndR - r1), 6);

      // 2 thanh nan song song #C83E37
      ctx.strokeStyle = COLORS.cinnabar;
      ctx.lineWidth = 1.15;
      for (const offset of [-3, 3]) {
        ctx.beginPath();
        ctx.moveTo(r1, offset);
        ctx.lineTo(currentEndR, offset);
        ctx.stroke();
      }

      // Đường tim mảnh ở giữa
      ctx.strokeStyle = 'rgba(138, 106, 47, 0.55)';
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      ctx.moveTo(r1, 0);
      ctx.lineTo(currentEndR, 0);
      ctx.stroke();

      // Vạch khóa ngang nhỏ ở giữa (họa tiết song tiện cổ truyền)
      if (lockP > 0) {
        ctx.globalAlpha *= lockP;
        ctx.strokeStyle = COLORS.goldDark;
        ctx.lineWidth = 1.15;
        ctx.beginPath();
        ctx.moveTo(midBarR, -5);
        ctx.lineTo(midBarR, 5);
        ctx.stroke();

        ctx.strokeStyle = COLORS.cinnabar;
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        ctx.moveTo(midBarR - 2.8, -3.6);
        ctx.lineTo(midBarR - 2.8, 3.6);
        ctx.moveTo(midBarR + 2.8, -3.6);
        ctx.lineTo(midBarR + 2.8, 3.6);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // TÂM KHUÊ VĂN CÁC: HỖN THIÊN NGHI + ĐĨA POINCARÉ MỘNG GỖ + COMPA + ẤN TÂM HOA THỊ VÀNG
  drawCentralCelestialMechanism(ctx, r1, artTime, liveTime);

  ctx.restore();

  // 4. HỒI III (5.2s - 7.5s): CỬA SỔ THẤU QUANG MỞ VÀO TRANG CHỦ (destination-out)
  if (portal.portalRadius > 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, portal.portalRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = COLORS.cinnabar;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, portal.portalRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = COLORS.goldBright;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(cx, cy, portal.portalRadius + 3.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
  return portal;
}
