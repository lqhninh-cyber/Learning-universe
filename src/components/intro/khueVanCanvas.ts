/**
 * ENGINE ĐỒ HỌA CANVAS 2D: "THIÊN CẦU KHUÊ VĂN CÁC" (PHIÊN BẢN TOÀN CẢNH BẢN ĐỒ THIÊN VĂN HOÀNG CUNG)
 *
 * - Trung tâm: Hỗn Thiên Nghi 3D (3 vòng elip nghiêng 30°, 60°, -45°) + Mặt Trời Lạc Việt 12 Tia vát khối 3D
 *   + Vòng Bát Giác Tâm & Nhụy Ngọc Đỏ Chu Sa.
 * - Toàn khung (Full-Viewport Cartography): Khung viền Sắc phong kép + Triện Hồi Văn 4 góc + Vạch thước 40px,
 *   8 trục phương hướng nét đứt, 2 vòng quỹ đạo ngoại vi khổng lồ (0.38 & 0.48), 4 cụm quần tinh hai bên cánh
 *   và 40 hạt bụi vàng li ti trôi nổi.
 * - Hồi III: Cửa sổ thấu quang destination-out mở toang vào Trang chủ.
 */

export const INTRO_TOTAL_DURATION_S = 7.5;
export const INTRO_REDUCED_DURATION_S = 1.5;
export const PORTAL_DISMISS_DURATION_S = 0.45;

export interface KhueVanRenderState {
  /** Thời gian theo kịch bản (0 -> 7.5s) */
  readonly elapsed: number;
  /** Tiến trình mở cổng khi người dùng click/phím bỏ qua (0 -> 1, null nếu chạy tự nhiên) */
  readonly dismissProgress: number | null;
  /** Bán kính cổng thấu quang ở thời điểm bắt đầu bỏ qua (px) */
  readonly dismissStartPortalRadius: number;
  /** Tỉ lệ phóng đại bối cảnh ở thời điểm bắt đầu bỏ qua */
  readonly dismissStartScale: number;
  /** Góc xoay bối cảnh ở thời điểm bắt đầu bỏ qua */
  readonly dismissStartRotation: number;
  /** Chế độ giảm chuyển động */
  readonly prefersReducedMotion: boolean;
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
  cinnabar: '#C83E37',
  cinnabarLight: '#DF5049',
  cinnabarDark: '#9A2520',
  cinnabarGlow: 'rgba(200, 62, 55, 0.12)',
  goldBright: '#C5A262',
  goldLight: '#DFBE7E',
  goldDark: '#8A6A2F',
  jadeDeep: '#1B3D2F',
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

interface WingStarPoint {
  readonly dx: number;
  readonly dy: number;
  readonly isJade: boolean;
  readonly size: number;
}

interface WingClusterTemplate {
  readonly xSign: -1 | 1;
  readonly ySign: -1 | 1;
  readonly stars: readonly WingStarPoint[];
  readonly edges: readonly (readonly [number, number])[];
}

// 4 cụm chòm sao đối xứng hai bên cánh (mỗi cụm 5 ngôi sao nối đoạn kỷ hà mảnh)
const WING_CLUSTERS: readonly WingClusterTemplate[] = [
  {
    xSign: -1,
    ySign: -1,
    stars: [
      { dx: -44, dy: -22, isJade: false, size: 2.8 },
      { dx: -10, dy: -36, isJade: true, size: 2.2 },
      { dx: 18, dy: -8, isJade: false, size: 2.6 },
      { dx: -16, dy: 24, isJade: true, size: 2.1 },
      { dx: 36, dy: 28, isJade: false, size: 2.9 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
    ],
  },
  {
    xSign: -1,
    ySign: 1,
    stars: [
      { dx: -38, dy: 18, isJade: true, size: 2.4 },
      { dx: -12, dy: -18, isJade: false, size: 2.9 },
      { dx: 24, dy: -28, isJade: false, size: 2.2 },
      { dx: 38, dy: 8, isJade: true, size: 2.6 },
      { dx: -4, dy: 34, isJade: false, size: 2.3 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },
  {
    xSign: 1,
    ySign: -1,
    stars: [
      { dx: 44, dy: -22, isJade: false, size: 2.8 },
      { dx: 10, dy: -36, isJade: true, size: 2.2 },
      { dx: -18, dy: -8, isJade: false, size: 2.6 },
      { dx: 16, dy: 24, isJade: true, size: 2.1 },
      { dx: -36, dy: 28, isJade: false, size: 2.9 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [2, 4],
    ],
  },
  {
    xSign: 1,
    ySign: 1,
    stars: [
      { dx: 38, dy: 18, isJade: true, size: 2.4 },
      { dx: 12, dy: -18, isJade: false, size: 2.9 },
      { dx: -24, dy: -28, isJade: false, size: 2.2 },
      { dx: -38, dy: 8, isJade: true, size: 2.6 },
      { dx: 4, dy: 34, isJade: false, size: 2.3 },
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
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

// 40 hạt bụi vàng & chu sa định sẵn theo phân bố chuẩn toàn màn hình (tránh cấp phát bộ nhớ trong vòng lặp 60fps)
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

/** Tính bán kính cửa sổ Khuê Văn Các (đã phóng to +20% cho bề thế trên màn hình rộng) */
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

/** Vẽ hình vuông xoay góc bất kỳ theo tiến trình phác thảo nét (progressive stroke) */
function drawProgressiveSquare(
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

  // Khung chữ nhật viền kép mảnh
  ctx.save();
  ctx.globalAlpha *= borderP;

  // Viền ngoài #C5A262 (1px, opacity 0.6)
  ctx.strokeStyle = 'rgba(197, 162, 98, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(inset, inset, outerW, outerH);

  // Viền trong #C83E37 (0.75px, opacity 0.4, cách viền ngoài 5px)
  ctx.strokeStyle = 'rgba(200, 62, 55, 0.4)';
  ctx.lineWidth = 0.75;
  ctx.strokeRect(innerInset, innerInset, innerW, innerH);
  ctx.restore();

  // Họa tiết Triện Góc Hồi Văn (~36x36px) tự động phác nét trong Hồi I
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

      // Hồi văn kỷ hà vuông vức truyền thống 36x36
      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(0, 0);
      ctx.lineTo(36, 0);

      // Nhánh hồi văn ngang
      ctx.moveTo(8, 0);
      ctx.lineTo(8, 16);
      ctx.lineTo(28, 16);
      ctx.lineTo(28, 7);
      ctx.lineTo(15, 7);
      ctx.lineTo(15, 11);

      // Nhánh hồi văn dọc
      ctx.moveTo(0, 8);
      ctx.lineTo(16, 8);
      ctx.lineTo(16, 28);
      ctx.lineTo(7, 28);
      ctx.lineTo(7, 15);
      ctx.lineTo(11, 15);
      ctx.stroke();

      // Điểm chấm vàng son ở lõi triện góc
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

  // Vạch thước chia tọa độ bản đồ (Map scale ticks) mỗi 40px dọc 4 cạnh
  const tickP = easeOutCubic(clamp01((artTime - 0.9) / 1.1));
  if (tickP > 0) {
    ctx.save();
    ctx.globalAlpha *= tickP;
    const marginGuard = fretSize + 10;

    // Cạnh trên & dưới
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

    // Cạnh trái & phải
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

/** B. Vẽ Lưới Trục Kinh Vĩ Tuyến Xuyên Tâm & 2 Vòng Quỹ Đạo Ngoại Vi Khổng Lồ */
function drawFullViewportCartographyGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  r1: number,
  artTime: number,
): void {
  const inset = (width >= 768 ? 28 : 16) + 5;
  const innerW = width - inset * 2;
  const innerH = height - inset * 2;
  if (innerW <= 20 || innerH <= 20) return;

  const cx = width / 2;
  const cy = height / 2;
  const maxSpan = Math.hypot(width, height);

  // Clip gọn bên trong khung viền sắc phong để không tràn mép giấy
  ctx.save();
  ctx.beginPath();
  ctx.rect(inset, inset, innerW, innerH);
  ctx.clip();

  // 8 đường trục phương hướng (Ngang, Dọc, 2 Chéo) kéo dài tới tận khung viền ngoài cùng
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
      ctx.moveTo(cx + Math.cos(a) * startR, cy + Math.sin(a) * startR);
      ctx.lineTo(cx + Math.cos(a) * currentEndR, cy + Math.sin(a) * currentEndR);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 2 vòng tròn quỹ đạo ngoại vi khổng lồ (R_outer1 = max(W,H)*0.38, R_outer2 = max(W,H)*0.48)
  const maxDim = Math.max(width, height);
  const rOuter1 = maxDim * 0.38;
  const rOuter2 = maxDim * 0.48;
  const outerRingP = easeOutCubic(clamp01((artTime - 2.3) / 1.4));

  if (outerRingP > 0) {
    const orbitTime = Math.max(0, artTime - 2.3);

    // Vòng quỹ đạo ngoại vi 1
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(orbitTime * 0.025);
    ctx.globalAlpha *= outerRingP;

    ctx.strokeStyle = 'rgba(197, 162, 98, 0.42)';
    ctx.lineWidth = 0.9;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, rOuter1, 0, Math.PI * 2);
    ctx.stroke();

    // Con trỏ thiên văn hình thoi vàng - đỏ xoay chậm trên vòng 1
    ctx.setLineDash([]);
    for (let k = 0; k < 4; k++) {
      const a = k * (Math.PI / 2) + Math.PI / 6;
      ctx.save();
      ctx.rotate(a);
      ctx.translate(rOuter1, 0);
      ctx.fillStyle = k % 2 === 0 ? COLORS.cinnabar : COLORS.goldBright;
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(0, 3.5);
      ctx.lineTo(-6, 0);
      ctx.lineTo(0, -3.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Vòng quỹ đạo ngoại vi 2
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-orbitTime * 0.018);
    ctx.globalAlpha *= outerRingP;

    ctx.strokeStyle = 'rgba(138, 106, 47, 0.34)';
    ctx.lineWidth = 0.8;
    ctx.setLineDash([2, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, rOuter2, 0, Math.PI * 2);
    ctx.stroke();

    // Con trỏ tam giác chỉ hướng trên vòng 2
    ctx.setLineDash([]);
    for (let k = 0; k < 6; k++) {
      const a = k * (Math.PI / 3);
      ctx.save();
      ctx.rotate(a);
      ctx.translate(rOuter2, 0);
      ctx.fillStyle = k % 2 === 0 ? COLORS.jadeLight : COLORS.goldDark;
      ctx.beginPath();
      ctx.moveTo(-7, 0);
      ctx.lineTo(3, 3.2);
      ctx.lineTo(3, -3.2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  ctx.restore(); // Kết thúc vùng clip khung viền
}

/** C. Vẽ 4 cụm Quần Tinh hai bên cánh & 40 hạt bụi vàng li ti trôi nổi toàn màn hình */
function drawAmbientStarfieldAndDust(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  r1: number,
  artTime: number,
  twinkleTime: number,
): void {
  const cx = width / 2;
  const cy = height / 2;
  const inset = width >= 768 ? 46 : 28;

  // 1. 4 cụm chòm sao đối xứng ở hai bên cánh (lấp đầy khoảng trống 16:9 ngoài cụm trung tâm)
  const wingP = easeOutCubic(clamp01((artTime - 2.6) / 1.5));
  if (wingP > 0) {
    const centralGuardR = r1 * 2.85;
    const isWide = width >= height * 1.15;

    for (const cluster of WING_CLUSTERS) {
      // Định vị tự động vào khoảng trống cánh trái/phải (hoặc trên/dưới trên màn hình dọc)
      const anchorX = isWide
        ? cx + cluster.xSign * Math.max(centralGuardR + 58, width * 0.34)
        : cx + cluster.xSign * (width * 0.28);
      const anchorY = isWide
        ? cy + cluster.ySign * (height * 0.25)
        : cy + cluster.ySign * Math.max(centralGuardR + 36, height * 0.34);

      // Bỏ qua nếu cụm rơi sát mép khung viền quá hẹp
      if (
        anchorX < inset + 20 ||
        anchorX > width - inset - 20 ||
        anchorY < inset + 20 ||
        anchorY > height - inset - 20
      ) {
        continue;
      }

      const scaleFactor = width >= 768 ? 1 : 0.72;
      const pts = cluster.stars.map((s) => ({
        x: anchorX + s.dx * scaleFactor,
        y: anchorY + s.dy * scaleFactor,
        isJade: s.isJade,
        size: s.size * scaleFactor,
      }));

      ctx.save();
      ctx.globalAlpha *= wingP;

      // Đoạn thẳng vàng mảnh 0.75px nối sao trong cụm
      ctx.strokeStyle = 'rgba(197, 162, 98, 0.55)';
      ctx.lineWidth = 0.75;
      for (let eIdx = 0; eIdx < cluster.edges.length; eIdx++) {
        const edge = cluster.edges[eIdx];
        if (!edge) continue;
        const a = pts[edge[0]];
        const b = pts[edge[1]];
        if (!a || !b) continue;

        const ep = clamp01((wingP - eIdx * 0.1) / 0.55);
        if (ep <= 0) continue;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (b.x - a.x) * ep, a.y + (b.y - a.y) * ep);
        ctx.stroke();
      }

      // Chấm sao Đỏ Chu Sa / Xanh Ngọc
      for (let sIdx = 0; sIdx < pts.length; sIdx++) {
        const pt = pts[sIdx];
        if (!pt) continue;
        const sp = easeOutCubic(clamp01((wingP - sIdx * 0.08) / 0.45));
        if (sp <= 0) continue;

        const twinkle = 0.8 + 0.2 * Math.sin(twinkleTime * 2.2 + sIdx * 1.3 + cluster.xSign);
        const rad = pt.size * sp * twinkle;

        ctx.fillStyle = pt.isJade ? COLORS.jadeLight : COLORS.cinnabar;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  // 2. 40 hạt bụi vàng & chu sa li ti (bán kính 1px - 2.5px, opacity lấp lánh theo sin)
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
}

/**
 * LỚP TRUNG TÂM MỚI:
 * 1) Hỗn Thiên Nghi 3D (3 elip nghiêng 30°, 60°, -45° xoay 3D)
 * 2) Mặt Trời Lạc Việt 12 Tia vát khối 3D (6 chính #C83E37 + 6 phụ #8A6A2F)
 * 3) Vòng Bát Giác Tâm & Nhụy Ngọc Đỏ Chu Sa
 */
function drawArmillaryAndLacVietSunburst(
  ctx: CanvasRenderingContext2D,
  r1: number,
  artTime: number,
  liveTime: number,
): void {
  // Tan nhẹ từ 5.1s -> 5.4s nhường không gian cho thấu kính destination-out mở cửa
  const coreFade = artTime >= 5.1 ? clamp01(1 - (artTime - 5.1) / 0.3) : 1;
  if (coreFade <= 0.01) return;

  // --- LỚP 1: HỖN THIÊN NGHI 3D (3 vòng elip kinh-vĩ tuyến nghiêng 30°, 60°, -45°) ---
  const armillaryP = easeOutCubic(clamp01((artTime - 1.55) / 1.1));
  if (armillaryP > 0) {
    const tilts = [
      { angle: Math.PI / 6, speed: 0.9, phase: 0.2 }, // 30°
      { angle: Math.PI / 3, speed: -0.75, phase: 1.4 }, // 60°
      { angle: -Math.PI / 4, speed: 0.65, phase: 2.6 }, // -45°
    ] as const;

    const majorR = r1 * 0.87 * armillaryP;
    ctx.save();
    ctx.globalAlpha *= coreFade * armillaryP;
    ctx.strokeStyle = 'rgba(197, 162, 98, 0.55)';
    ctx.lineWidth = 1.15;

    for (const ring of tilts) {
      const minorFactor = Math.max(0.14, Math.abs(Math.cos(liveTime * ring.speed + ring.phase)));
      const minorR = majorR * minorFactor;

      ctx.beginPath();
      ctx.ellipse(0, 0, majorR, minorR, ring.angle, 0, Math.PI * 2);
      ctx.stroke();

      // Điểm nút kinh-vĩ vàng đậm đánh dấu quỹ đạo 3D
      const nodeX = Math.cos(ring.angle) * majorR;
      const nodeY = Math.sin(ring.angle) * majorR;
      ctx.fillStyle = COLORS.goldDark;
      ctx.beginPath();
      ctx.arc(nodeX, nodeY, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- LỚP 2: MẶT TRỜI LẠC VIỆT 12 TIA VÁT KHỐI 3D (6 chính #C83E37 + 6 phụ #8A6A2F) ---
  const sunP = easeInOutQuart(clamp01((artTime - 1.9) / 1.2));
  if (sunP > 0) {
    ctx.save();
    ctx.globalAlpha *= coreFade;
    // Xoay nhẹ toàn khối la bàn Mặt Trời Lạc Việt
    ctx.rotate(Math.max(0, liveTime - 1.9) * 0.08);

    const numPoints = 12;
    const stepAngle = (Math.PI * 2) / numPoints; // 30° mỗi tia
    const valleyR = r1 * 0.24 * sunP;
    const primaryTipR = r1 * 0.86 * sunP; // Chạm sát viền trong cửa tròn
    const secondaryTipR = r1 * 0.58 * sunP; // Xen kẽ ngắn hơn

    for (let i = 0; i < numPoints; i++) {
      const isPrimary = i % 2 === 0;
      const theta = i * stepAngle - Math.PI / 2;
      const leftAngle = theta - stepAngle * 0.5;
      const rightAngle = theta + stepAngle * 0.5;
      const tipR = isPrimary ? primaryTipR : secondaryTipR;

      const tipX = Math.cos(theta) * tipR;
      const tipY = Math.sin(theta) * tipR;
      const leftX = Math.cos(leftAngle) * valleyR;
      const leftY = Math.sin(leftAngle) * valleyR;
      const rightX = Math.cos(rightAngle) * valleyR;
      const rightY = Math.sin(rightAngle) * valleyR;

      // Mặt sáng bên trái (vát khối 3D sáng)
      ctx.fillStyle = isPrimary ? COLORS.cinnabar : COLORS.goldBright;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(leftX, leftY);
      ctx.lineTo(tipX, tipY);
      ctx.closePath();
      ctx.fill();

      // Mặt tối bên phải (vát khối 3D đậm)
      ctx.fillStyle = isPrimary ? COLORS.cinnabarDark : COLORS.goldDark;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(tipX, tipY);
      ctx.lineTo(rightX, rightY);
      ctx.closePath();
      ctx.fill();

      // Đường sống tia sắc sảo
      ctx.strokeStyle = isPrimary ? COLORS.cinnabarLight : COLORS.goldLight;
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- LỚP 3: NHỤY NGỌC & VÒNG BÁT GIÁC TÂM ---
  const jewelP = easeOutCubic(clamp01((artTime - 0.1) / 0.9));
  if (jewelP > 0) {
    ctx.save();
    ctx.globalAlpha *= coreFade;

    // Vòng bát giác nhỏ viền vàng chính giữa tâm
    const octScale = clamp01((artTime - 1.8) / 0.8);
    if (octScale > 0) {
      const octR = r1 * 0.165 * easeOutCubic(octScale);
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4 + Math.PI / 8;
        const ox = Math.cos(a) * octR;
        const oy = Math.sin(a) * octR;
        if (i === 0) ctx.moveTo(ox, oy);
        else ctx.lineTo(ox, oy);
      }
      ctx.closePath();
      ctx.fillStyle = COLORS.paperCenter;
      ctx.fill();
      ctx.strokeStyle = COLORS.goldBright;
      ctx.lineWidth = 1.4;
      ctx.stroke();
    }

    // Hạt ngọc đỏ chu sa phát sáng nhẹ ở chính tâm
    const pulse = 1 + 0.08 * Math.sin(liveTime * 3.2);
    const jewelR = Math.max(4.5, r1 * 0.085) * jewelP;

    const haloGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, jewelR * 3.4 * pulse);
    haloGrad.addColorStop(0, 'rgba(200, 62, 55, 0.3)');
    haloGrad.addColorStop(0.5, COLORS.cinnabarGlow);
    haloGrad.addColorStop(1, 'rgba(200, 62, 55, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, jewelR * 3.4 * pulse, 0, Math.PI * 2);
    ctx.fill();

    const coreGrad = ctx.createRadialGradient(
      -jewelR * 0.25,
      -jewelR * 0.25,
      jewelR * 0.1,
      0,
      0,
      jewelR,
    );
    coreGrad.addColorStop(0, COLORS.paperCenter);
    coreGrad.addColorStop(0.35, COLORS.cinnabarLight);
    coreGrad.addColorStop(0.85, COLORS.cinnabar);
    coreGrad.addColorStop(1, COLORS.cinnabarDark);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, jewelR, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/** Vẽ 1 vòng thước đo thiên văn có vạch chia 5° và 15° */
function drawAstrolabeRing(
  ctx: CanvasRenderingContext2D,
  radius: number,
  rotationRad: number,
  revealProgress: number,
  includeJadeBeads: boolean,
  ringStyle: 'inner' | 'middle' | 'outer',
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

  if (includeJadeBeads) {
    for (let k = 0; k < 4; k++) {
      const beadAngle = k * (Math.PI / 2) + Math.PI / 4;
      const bx = Math.cos(beadAngle) * radius;
      const by = Math.sin(beadAngle) * radius;

      ctx.fillStyle = COLORS.jadeLight;
      ctx.beginPath();
      ctx.arc(bx, by, 3.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = COLORS.jadeDeep;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(bx, by, 5.2, 0, Math.PI * 2);
      ctx.stroke();
    }
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

  const artTime = state.prefersReducedMotion ? 4.8 : state.elapsed;
  const liveTime = state.prefersReducedMotion ? 4.8 : state.elapsed;
  const portal = computePortalTransform(width, height, state);

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // 1. NỀN GIẤY DÓ HOÀNG CUNG (#FFFDF9 -> #F7F4EB -> #EDE8D8)
  const bgRadius = Math.hypot(cx, cy) * 1.05;
  const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bgRadius);
  bgGrad.addColorStop(0, COLORS.paperCenter);
  bgGrad.addColorStop(0.55, COLORS.paperMid);
  bgGrad.addColorStop(1, COLORS.paperEdge);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. BỐI CẢNH BẢN ĐỒ THIÊN VĂN TOÀN MÀN HÌNH (lấp đầy khung 16:9)
  drawImperialBorderAndFretwork(ctx, width, height, artTime);
  drawFullViewportCartographyGrid(ctx, width, height, r1, artTime);
  drawAmbientStarfieldAndDust(ctx, width, height, r1, artTime, liveTime);

  // 3. CỤM THIÊN CẦU KHUÊ VĂN CÁC TRUNG TÂM (+20% kích thước & biến đổi mở cổng Hồi III)
  ctx.save();
  ctx.translate(cx, cy);
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

  // 2 hình vuông lồng nhau xoay lệch 45° (Octagram Đất vuông & Bát phương)
  ctx.strokeStyle = COLORS.cinnabar;
  ctx.lineWidth = 1.5;
  drawProgressiveSquare(ctx, squareHalf, 0, clamp01((artTime - 0.6) / 0.95));
  drawProgressiveSquare(ctx, squareHalf, Math.PI / 4, clamp01((artTime - 0.95) / 0.95));

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

  // 8 thanh nan kép đối xứng Khuê Văn Các kết nối từ R₁ ra khung vuông
  const barsProgress = easeOutCubic(clamp01((artTime - 2.05) / 0.95));
  if (barsProgress > 0) {
    const currentEndR = r1 + (squareHalf - r1) * barsProgress;
    for (let k = 0; k < 8; k++) {
      ctx.save();
      ctx.rotate(k * (Math.PI / 4));

      ctx.strokeStyle = COLORS.cinnabar;
      ctx.lineWidth = 1.15;
      for (const offset of [-2.4, 2.4]) {
        ctx.beginPath();
        ctx.moveTo(r1, offset);
        ctx.lineTo(currentEndR, offset);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(138, 106, 47, 0.65)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(r1, 0);
      ctx.lineTo(currentEndR, 0);
      ctx.stroke();
      ctx.restore();
    }
  }

  // TÂM KHUÊ VĂN CÁC 3 LỚP: HỖN THIÊN NGHI 3D + MẶT TRỜI LẠC VIỆT 12 TIA + NHỤY NGỌC BÁT GIÁC
  drawArmillaryAndLacVietSunburst(ctx, r1, artTime, liveTime);

  // 3 vòng thước đo thiên văn đồng tâm xoay ngược chiều nhau
  const astrolabeTime = Math.max(0, artTime - 2.4);
  drawAstrolabeRing(
    ctx,
    r1 * 1.98,
    astrolabeTime * 0.08,
    clamp01((artTime - 2.4) / 0.9),
    false,
    'inner',
  );
  drawAstrolabeRing(
    ctx,
    r1 * 2.28,
    -astrolabeTime * 0.055,
    clamp01((artTime - 2.65) / 1.0),
    true,
    'middle',
  );
  drawAstrolabeRing(
    ctx,
    r1 * 2.62,
    astrolabeTime * 0.035,
    clamp01((artTime - 2.95) / 1.1),
    false,
    'outer',
  );

  // Chòm 16 ngôi sao Khuê trung tâm
  drawKhueConstellation(
    ctx,
    r1,
    Math.max(0, artTime - 2.8) * 0.035,
    clamp01((artTime - 2.8) / 1.6),
    state.prefersReducedMotion ? 0 : liveTime,
  );

  ctx.restore(); // Kết thúc biến đổi trung tâm

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
