/**
 * ENGINE ĐỒ HỌA CANVAS 2D: "THIÊN CẦU KHUÊ VĂN CÁC" (PHIÊN BẢN CƠ HỆ TOÁN HỌC 3D & SAO BĂNG)
 *
 * - Ánh sáng nền: Vignette góc #E5DEC9 tôn khung Đỏ Chu Sa / Vàng Thếp + Quầng sáng ấm tại tâm rgba(229,195,120,0.22).
 * - Trung tâm (Tâm điểm 3 lớp hình học bên trong cửa sổ R₁):
 *   + Hỗn Thiên Nghi 3D (3 elip nghiêng 30°, 60°, -45° độ nét 1.2px kèm vệt sao băng quỹ đạo).
 *   + Vân Tơ Toán Học Hypotrochoid 8 nhánh (a/b = 8, lineWidth = 0.85, 2 lớp lệch pha Đỏ Chu Sa & Vàng Thếp).
 *   + Khối Nhị Thập Diện Đều 3D (Icosahedron 12 đỉnh, 30 cạnh) xoay 2 trục + góc nghiêng chuột, chiếu phối cảnh 2D,
 *     chấm ngọc đỉnh trước (#C5A262 & #4E9B58) và Hạt Nhân Quang Học Tâm (radialGradient #C83E37 nhịp sin(t * 3)).
 * - Kiến trúc Khuê Văn Các: Đất vuông NÉT KÉP (#C83E37 ngoài & #C5A262 cách 4px) + đường phân giác & chấm vàng tại 8 đỉnh
 *   + 8 nan gỗ tô mờ rgba(200,62,55,0.05) với vạch khóa ngang song tiện cổ truyền ở giữa.
 * - Toàn khung (Full-Viewport Cartography) & Parallax 3 lớp:
 *   + Lớp khung Sắc Phong (-mx*4, -my*4), Lớp thiên văn & chòm sao (mx*10, my*10) kèm vệt sao băng Astrolabe,
 *     Lớp tâm Khuê Văn & Đa diện 3D (mx*18, my*18).
 */

export const INTRO_TOTAL_DURATION_S = 7.5;
export const INTRO_REDUCED_DURATION_S = 1.5;
export const PORTAL_DISMISS_DURATION_S = 0.45;

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

const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2;
const ICOSAHEDRON_INV_NORM = 1 / Math.hypot(1, GOLDEN_RATIO);

type Vec3 = readonly [number, number, number];

const RAW_ICOSAHEDRON_VERTICES: readonly Vec3[] = [
  [0, 1, GOLDEN_RATIO],
  [0, -1, GOLDEN_RATIO],
  [0, 1, -GOLDEN_RATIO],
  [0, -1, -GOLDEN_RATIO],
  [1, GOLDEN_RATIO, 0],
  [-1, GOLDEN_RATIO, 0],
  [1, -GOLDEN_RATIO, 0],
  [-1, -GOLDEN_RATIO, 0],
  [GOLDEN_RATIO, 0, 1],
  [GOLDEN_RATIO, 0, -1],
  [-GOLDEN_RATIO, 0, 1],
  [-GOLDEN_RATIO, 0, -1],
];

/** 12 đỉnh chuẩn hóa của khối Nhị thập diện đều (Regular Icosahedron) */
export const ICOSAHEDRON_VERTICES: readonly Vec3[] = RAW_ICOSAHEDRON_VERTICES.map(([x, y, z]) => [
  x * ICOSAHEDRON_INV_NORM,
  y * ICOSAHEDRON_INV_NORM,
  z * ICOSAHEDRON_INV_NORM,
]);

/** 30 cạnh nối các cặp đỉnh lân cận của khối Nhị thập diện đều */
export const ICOSAHEDRON_EDGES: readonly (readonly [number, number])[] = (() => {
  const edges: [number, number][] = [];
  for (let i = 0; i < RAW_ICOSAHEDRON_VERTICES.length; i++) {
    const a = RAW_ICOSAHEDRON_VERTICES[i];
    if (!a) continue;
    for (let j = i + 1; j < RAW_ICOSAHEDRON_VERTICES.length; j++) {
      const b = RAW_ICOSAHEDRON_VERTICES[j];
      if (!b) continue;
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const dz = a[2] - b[2];
      const distSq = dx * dx + dy * dy + dz * dz;
      if (Math.abs(distSq - 4) < 1e-6) {
        edges.push([i, j]);
      }
    }
  }
  return edges;
})();

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

/** Tính tọa độ điểm trên đường cong Hypotrochoid tham số */
export function computeHypotrochoidPoint(
  a: number,
  b: number,
  h: number,
  t: number,
  phase: number,
): readonly [number, number] {
  const ratio = (a - b) / b;
  const x = (a - b) * Math.cos(t) + h * Math.cos(ratio * t + phase);
  const y = (a - b) * Math.sin(t) - h * Math.sin(ratio * t + phase);
  return [x, y];
}

/**
 * Vẽ hạt sáng chuyển động kèm đuôi sao băng (15-20 đoạn cung ngắn):
 * giảm dần alpha từ 0.9 về 0 và giảm lineWidth từ 2.5px về 0.2px.
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
    const segAlpha = 0.9 * (1 - s / segments);
    const segWidth = 0.2 + 2.3 * (segments > 1 ? 1 - s / (segments - 1) : 1);

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

    // 2 sao băng chuyển động dọc quỹ đạo ngoại vi 1
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
        18,
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

    // 2 sao băng nghịch chiều trên quỹ đạo ngoại vi 2
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
        18,
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

    // Hạt sao băng chuyển động dọc quỹ đạo elip kèm đuôi mờ 18 đoạn
    const orbitTheta = liveTime * ring.orbitRate + ring.phase * 2.1;
    const direction: 1 | -1 = ring.orbitRate >= 0 ? 1 : -1;
    drawCometTrail(
      ctx,
      orbitTheta,
      direction,
      0.72,
      18,
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

/**
 * Lớp 2A Trung tâm: Vân Tơ Toán Học (Parametric Hypotrochoid 8 nhánh, a/b = 8)
 * Phối 2 lớp lệch pha nét 0.85px màu Đỏ Chu Sa và Vàng Thếp.
 */
function drawHypotrochoidGuilloche(
  ctx: CanvasRenderingContext2D,
  r1: number,
  artTime: number,
  liveTime: number,
  coreFade: number,
): void {
  const guillocheP = easeOutCubic(clamp01((artTime - 1.35) / 1.15));
  if (guillocheP <= 0) return;

  const b = r1 * 0.088 * guillocheP;
  const a = 8 * b;
  const steps = 240;
  const stepAngle = (Math.PI * 2) / steps;

  const layers = [
    {
      h: 2.65 * b,
      phase: liveTime * 0.36,
      strokeStyle: 'rgba(200, 62, 55, 0.45)',
    },
    {
      h: 2.25 * b,
      phase: -liveTime * 0.28 + Math.PI,
      strokeStyle: 'rgba(197, 162, 98, 0.55)',
    },
  ] as const;

  ctx.save();
  ctx.globalAlpha *= coreFade * guillocheP;
  ctx.lineWidth = 0.85;

  for (const layer of layers) {
    ctx.strokeStyle = layer.strokeStyle;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i * stepAngle;
      const [px, py] = computeHypotrochoidPoint(a, b, layer.h, t, layer.phase);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.restore();
}

/** Lớp 2C Trung tâm: Hạt Nhân Quang Học Tâm (radialGradient #C83E37 nhịp theo sin(time * 3)) */
function drawCentralOpticalCore(
  ctx: CanvasRenderingContext2D,
  r1: number,
  coreReveal: number,
  liveTime: number,
): void {
  if (coreReveal <= 0) return;

  const pulse01 = 0.5 + 0.5 * Math.sin(liveTime * 3);
  const haloR = Math.max(14, r1 * 0.21) * (0.82 + 0.34 * pulse01) * coreReveal;

  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, haloR);
  coreGrad.addColorStop(0, COLORS.cinnabar);
  coreGrad.addColorStop(0.28, 'rgba(200, 62, 55, 0.42)');
  coreGrad.addColorStop(1, 'rgba(200, 62, 55, 0)');

  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, haloR, 0, Math.PI * 2);
  ctx.fill();

  const beadR = Math.max(2.6, r1 * 0.032) * (0.92 + 0.12 * pulse01) * coreReveal;
  ctx.fillStyle = COLORS.cinnabar;
  ctx.beginPath();
  ctx.arc(0, 0, beadR, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.paperCenter;
  ctx.beginPath();
  ctx.arc(-beadR * 0.28, -beadR * 0.28, beadR * 0.34, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Lớp 2B & 2C Trung tâm:
 * - Khối Nhị thập diện đều 3D (12 đỉnh, 30 cạnh) bán kính 0.42*R1, xoay quanh trục X/Y & tương tác chuột
 * - Chiếu phối cảnh 2D: cạnh sau (z < 0) nét đứt mờ, cạnh trước (z >= 0) Đỏ Chu Sa / Vàng Đồng sắc nét
 * - Chấm ngọc Vàng Thếp (#C5A262) và Xanh Ngọc (#4E9B58) tại các đỉnh phía trước
 * - Hạt Nhân Quang Học Tâm phát sáng bên trong lồng đa diện.
 */
function drawIcosahedronAndOpticalCore(
  ctx: CanvasRenderingContext2D,
  r1: number,
  artTime: number,
  liveTime: number,
  coreFade: number,
  tiltX: number,
  tiltY: number,
): void {
  const coreReveal = easeOutCubic(clamp01((artTime - 0.12) / 0.85));
  const polyReveal = easeOutCubic(clamp01((artTime - 1.65) / 1.1));
  if (coreReveal <= 0 && polyReveal <= 0) return;

  ctx.save();
  ctx.globalAlpha *= coreFade;

  if (polyReveal <= 0) {
    drawCentralOpticalCore(ctx, r1, coreReveal, liveTime);
    ctx.restore();
    return;
  }

  const polyR = r1 * 0.42 * polyReveal;
  const angleX = liveTime * 0.6 + tiltX;
  const angleY = liveTime * 0.9 + tiltY;
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const focal = Math.max(120, r1 * 2.5);

  const projected = ICOSAHEDRON_VERTICES.map(([vx, vy, vz], idx) => {
    // Quay quanh trục Y rồi quay quanh trục X
    const x1 = vx * cosY + vz * sinY;
    const z1 = -vx * sinY + vz * cosY;
    const y2 = vy * cosX - z1 * sinX;
    const z2 = vy * sinX + z1 * cosX;

    const px = x1 * polyR;
    const py = y2 * polyR;
    const pz = z2 * polyR;
    const persp = focal / (focal - pz);
    return {
      idx,
      sx: px * persp,
      sy: py * persp,
      z: pz,
      persp,
    };
  });

  const backEdges: { a: (typeof projected)[number]; b: (typeof projected)[number] }[] = [];
  const frontEdges: {
    idx: number;
    midZ: number;
    a: (typeof projected)[number];
    b: (typeof projected)[number];
  }[] = [];

  for (let eIdx = 0; eIdx < ICOSAHEDRON_EDGES.length; eIdx++) {
    const edge = ICOSAHEDRON_EDGES[eIdx];
    if (!edge) continue;
    const a = projected[edge[0]];
    const b = projected[edge[1]];
    if (!a || !b) continue;
    const midZ = (a.z + b.z) * 0.5;
    if (midZ < 0) {
      backEdges.push({ a, b });
    } else {
      frontEdges.push({ idx: eIdx, midZ, a, b });
    }
  }

  // 1. Cạnh phía sau (z < 0): nét đứt mờ rgba(197, 162, 98, 0.25)
  ctx.save();
  ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(197, 162, 98, 0.25)';
  ctx.lineWidth = 0.95;
  for (const edge of backEdges) {
    ctx.beginPath();
    ctx.moveTo(edge.a.sx, edge.a.sy);
    ctx.lineTo(edge.b.sx, edge.b.sy);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Hạt Nhân Quang Học Tâm tỏa sáng ở giữa khối đa diện (z = 0)
  drawCentralOpticalCore(ctx, r1, coreReveal, liveTime);

  // 3. Cạnh phía trước (z >= 0): nét liền sắc nét #C83E37 & #8A6A2F (lineWidth = 1.3)
  frontEdges.sort((u, v) => u.midZ - v.midZ);
  ctx.save();
  ctx.setLineDash([]);
  ctx.lineWidth = 1.3;
  ctx.lineCap = 'round';
  for (const edge of frontEdges) {
    ctx.strokeStyle = edge.idx % 2 === 0 ? COLORS.cinnabar : COLORS.goldDark;
    ctx.beginPath();
    ctx.moveTo(edge.a.sx, edge.a.sy);
    ctx.lineTo(edge.b.sx, edge.b.sy);
    ctx.stroke();
  }

  // 4. Chấm ngọc tại các đỉnh phía trước (z >= 0) phối Vàng Thếp (#C5A262) & Xanh Ngọc (#4E9B58)
  const frontVertices = projected.filter((v) => v.z >= 0).sort((u, v) => u.z - v.z);
  for (const v of frontVertices) {
    const isGold = v.idx % 2 === 0;
    const gemR = 2.2 * v.persp * polyReveal;

    ctx.fillStyle = isGold ? 'rgba(197, 162, 98, 0.28)' : 'rgba(78, 155, 88, 0.28)';
    ctx.beginPath();
    ctx.arc(v.sx, v.sy, gemR * 2.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = isGold ? COLORS.goldBright : COLORS.jadeLight;
    ctx.beginPath();
    ctx.arc(v.sx, v.sy, gemR, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = COLORS.paperCenter;
    ctx.beginPath();
    ctx.arc(v.sx - gemR * 0.25, v.sy - gemR * 0.25, gemR * 0.36, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.restore();
}

/** Toàn bộ cụm cơ hệ trung tâm bên trong cửa sổ tròn R₁ */
function drawCentralCelestialMechanism(
  ctx: CanvasRenderingContext2D,
  r1: number,
  artTime: number,
  liveTime: number,
  tiltX: number,
  tiltY: number,
): void {
  const coreFade = artTime >= 5.1 ? clamp01(1 - (artTime - 5.1) / 0.3) : 1;
  if (coreFade <= 0.01) return;

  // Hỗn Thiên Nghi 3D kèm vệt sao băng
  drawArmillaryCometRings(ctx, r1, artTime, liveTime, coreFade);
  // Lớp 1: Vân tơ Hypotrochoid 8 nhánh đối xứng
  drawHypotrochoidGuilloche(ctx, r1, artTime, liveTime, coreFade);
  // Lớp 2 & 3: Khối Nhị thập diện đều 3D & Hạt Nhân Quang Học Tâm
  drawIcosahedronAndOpticalCore(ctx, r1, artTime, liveTime, coreFade, tiltX, tiltY);
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
      18,
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

  // 1. NỀN GIẤY DÓ HOÀNG CUNG CÓ VIGNETTE TRẦM NHẸ 4 GÓC (#FFFDF9 -> #EDE8D8 -> #E5DEC9)
  const bgRadius = Math.hypot(cx, cy) * 1.05;
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bgRadius);
  bgGrad.addColorStop(0, COLORS.paperCenter);
  bgGrad.addColorStop(0.45, COLORS.paperMid);
  bgGrad.addColorStop(0.78, COLORS.paperEdge);
  bgGrad.addColorStop(1, COLORS.paperCornerDeep);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // QUẦNG SÁNG ẤM TẠI TÂM (bám theo lớp lõi Parallax)
  const warmGlowGrad = ctx.createRadialGradient(
    cx + coreOffsetX,
    cy + coreOffsetY,
    0,
    cx + coreOffsetX,
    cy + coreOffsetY,
    rOuter1,
  );
  warmGlowGrad.addColorStop(0, COLORS.warmCenterGlow);
  warmGlowGrad.addColorStop(1, 'rgba(229, 195, 120, 0)');
  ctx.fillStyle = warmGlowGrad;
  ctx.fillRect(0, 0, width, height);

  // 2A. LỚP KHUNG VIỀN NGOÀI (-mx * 4, -my * 4)
  ctx.save();
  ctx.translate(borderOffsetX, borderOffsetY);
  drawImperialBorderAndFretwork(ctx, width, height, artTime);
  ctx.restore();

  // 2B. LỚP BẢN ĐỒ THIÊN VĂN & CHÒM SAO (mx * 10, my * 10)
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

  // 3B. LỚP TÂM KHUÊ VĂN CÁC & ĐA DIỆN 3D (mx * 18, my * 18 + góc xoay theo chuột)
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

  // TÂM KHUÊ VĂN CÁC: HỖN THIÊN NGHI + HYPOTROCHOID + NHỊ THẬP DIỆN ĐỀU 3D + HẠT NHÂN QUANG HỌC
  drawCentralCelestialMechanism(ctx, r1, artTime, liveTime, effMy * 0.45, effMx * 0.45);

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
