/**
 * ENGINE ĐỒ HỌA CANVAS 2D: "THIÊN CẦU KHUÊ VĂN CÁC"
 * Bảng màu sáng hoàng cung (Bright Editorial Palette): Giấy dó #FFFDF9, Đỏ chu sa #C83E37,
 * Vàng thếp cổ #C5A262 / #8A6A2F và Xanh men ngọc #1B3D2F / #4E9B58.
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
  cinnabarGlow: 'rgba(200, 62, 55, 0.12)',
  goldBright: '#C5A262',
  goldDark: '#8A6A2F',
  jadeDeep: '#1B3D2F',
  jadeLight: '#4E9B58',
  jadePetalFill: 'rgba(78, 155, 88, 0.15)',
} as const;

interface KhueStar {
  readonly radiusFactor: number;
  readonly angleDeg: number;
  readonly tier: 1 | 2;
  readonly isCinnabar: boolean;
}

// Chòm 16 ngôi sao Khuê phân bố thành hai dải thiên hà đối xứng cân bằng quanh thước thiên văn
const KHUE_STARS: readonly KhueStar[] = [
  // Dải cung Đông-Bắc (8 sao)
  { radiusFactor: 2.08, angleDeg: -72, tier: 2, isCinnabar: true },
  { radiusFactor: 2.34, angleDeg: -56, tier: 1, isCinnabar: false },
  { radiusFactor: 2.62, angleDeg: -42, tier: 2, isCinnabar: false },
  { radiusFactor: 2.46, angleDeg: -20, tier: 1, isCinnabar: true },
  { radiusFactor: 2.78, angleDeg: -6, tier: 2, isCinnabar: true },
  { radiusFactor: 2.56, angleDeg: 14, tier: 1, isCinnabar: false },
  { radiusFactor: 2.24, angleDeg: 28, tier: 1, isCinnabar: false },
  { radiusFactor: 2.48, angleDeg: 44, tier: 2, isCinnabar: true },
  // Dải cung Tây-Nam (8 sao)
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

/** Tính bán kính cửa sổ Khuê Văn Các chuẩn hóa theo kích thước khung hình */
export function getWindowRadius(width: number, height: number): number {
  const minDim = Math.min(width, height);
  return Math.max(42, Math.min(126, minDim * 0.135));
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
    // Mở cổng tức thì với easeOutCubic khi người dùng click/nhấn phím
    const eDismiss = easeOutCubic(state.dismissProgress);
    const startR = Math.max(r1 * 0.45, state.dismissStartPortalRadius);
    return {
      portalRadius: startR + (maxPortalR - startR) * eDismiss,
      sceneScale: state.dismissStartScale + 1.35 * eDismiss,
      sceneRotation: state.dismissStartRotation + 0.28 * eDismiss,
    };
  }

  if (state.prefersReducedMotion) {
    // 0 -> 1.05s tĩnh, 1.05s -> 1.5s mở cổng nhanh
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

  // Kịch bản chuẩn Hồi III (5.2s -> 7.5s)
  if (state.elapsed <= 5.2) {
    return { portalRadius: 0, sceneScale: 1, sceneRotation: 0 };
  }

  if (state.elapsed < 5.5) {
    // 5.2s -> 5.5s: Lòng cửa sổ tròn r1 mở thành thấu kính trong suốt
    const pLens = clamp01((state.elapsed - 5.2) / 0.3);
    const eLens = easeOutCubic(pLens);
    return {
      portalRadius: r1 * 0.92 * eLens,
      sceneScale: 1 + 0.03 * eLens,
      sceneRotation: 0.02 * eLens,
    };
  }

  // 5.5s -> 7.5s: Phóng đại cổng theo hàm mũ easeInOutExpo vượt qua đường chéo màn hình
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
      const x = start[0] + (end[0] - start[0]) * edgeT;
      const y = start[1] + (end[1] - start[1]) * edgeT;
      ctx.lineTo(x, y);
    }
  }

  if (p >= 1) {
    ctx.closePath();
  }
  ctx.stroke();
  ctx.restore();
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

  // Vòng viền chính
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

  // Vạch chia độ mỗi 5° (tổng 72 vạch) và vạch lớn mỗi 15°
  const totalSteps = 72;
  for (let i = 0; i < totalSteps; i++) {
    const angle = (i * Math.PI * 2) / totalSteps;
    const isMajor = i % 3 === 0; // Mỗi 15°
    const isCardinal = i % 18 === 0; // Mỗi 90°

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

  // Hạt vệ tinh xanh men ngọc trên quỹ đạo giữa
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

/** Vẽ hoa văn cực 8 cánh r(θ) = R₁ · |cos(4θ)| đồng bộ hình học Logo */
function drawEightPetalPolarCurve(
  ctx: CanvasRenderingContext2D,
  radius: number,
  rotationRad: number,
  revealProgress: number,
  fadeFactor: number,
): void {
  const p = easeInOutQuart(revealProgress);
  if (p <= 0 || fadeFactor <= 0.01) return;

  const steps = 240;
  const maxTheta = Math.PI * 2 * p;

  ctx.save();
  ctx.rotate(rotationRad);
  ctx.globalAlpha *= fadeFactor;

  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const theta = (i / steps) * maxTheta;
    const r = radius * 0.88 * Math.abs(Math.cos(4 * theta));
    const x = r * Math.cos(theta);
    const y = r * Math.sin(theta);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }

  if (p >= 0.99) {
    ctx.closePath();
    ctx.fillStyle = COLORS.jadePetalFill;
    ctx.fill();
  }

  ctx.strokeStyle = COLORS.goldBright;
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // 8 chấm ngọc nhỏ tại 8 đỉnh cánh hoa
  if (p > 0.2) {
    const baseAlpha = ctx.globalAlpha;
    const dotAlpha = clamp01((p - 0.2) / 0.6);
    ctx.globalAlpha = baseAlpha * dotAlpha;
    for (let k = 0; k < 8; k++) {
      if (k / 8 > p) break;
      const a = k * (Math.PI / 4);
      const rDot = radius * 0.88;
      ctx.fillStyle = k % 2 === 0 ? COLORS.jadeDeep : COLORS.jadeLight;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * rDot, Math.sin(a) * rDot, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/** Vẽ chòm 16 ngôi sao Khuê nối bởi các đoạn kỷ hà mảnh */
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

  // Vẽ các đoạn thẳng kỷ hà nối các ngôi sao
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

  // Vẽ từng ngôi sao Khuê
  for (let i = 0; i < positions.length; i++) {
    const item = positions[i];
    if (!item) continue;

    const starDelay = (i / positions.length) * 0.6;
    const starP = easeOutCubic(clamp01((p - starDelay) / 0.4));
    if (starP <= 0) continue;

    const twinkle = 0.82 + 0.18 * Math.sin(twinkleTime * 2.6 + i * 0.9);
    const radius = (item.star.tier === 2 ? 3.2 : 2.1) * starP * twinkle;

    // Quầng sáng dịu quanh sao chính
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

    // Điểm tâm ngọc trai cho sao cấp 2
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
  const squareHalf = r1 * 1.28; // Khung Đất vuông ôm lấy Trời tròn R₁

  // Nếu reduced-motion đang bật, chốt pose nghệ thuật tĩnh tại mốc 4.8s (đầy đủ cấu trúc)
  const artTime = state.prefersReducedMotion ? 4.8 : state.elapsed;
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

  // 2. BIẾN ĐỔI HỆ TỌA ĐỘ TRUNG TÂM & MỞ RỘNG HỒI III
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(portal.sceneScale, portal.sceneScale);
  ctx.rotate(portal.sceneRotation);

  // --- HỒI I (0.0s - 2.2s): CHẤM CHU SA, SÓNG MẢNH & TRỜI TRÒN ĐẤT VUÔNG ---
  // (0.0s - 0.8s): Chấm tròn Đỏ Chu Sa bung nở kèm quầng sáng và 2 vòng sóng mảnh Vàng Thếp
  const pSeed = easeOutCubic(clamp01(artTime / 0.8));
  const centerSeedAlpha = artTime >= 5.2 ? clamp01(1 - (artTime - 5.2) / 0.25) : 1;

  if (pSeed > 0 && centerSeedAlpha > 0) {
    ctx.save();
    ctx.globalAlpha *= centerSeedAlpha;

    // Quầng sáng Chu Sa rgba(200, 62, 55, 0.12)
    const glowR = r1 * 0.55 * pSeed;
    const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
    glowGrad.addColorStop(0, COLORS.cinnabarGlow);
    glowGrad.addColorStop(1, 'rgba(200, 62, 55, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, glowR, 0, Math.PI * 2);
    ctx.fill();

    // 2 vòng sóng mảnh màu Vàng Thếp lan nhẹ
    for (let w = 0; w < 2; w++) {
      const waveDelay = w * 0.2;
      const wp = clamp01((artTime - waveDelay) / 1.1);
      if (wp > 0 && wp < 1) {
        const waveR = r1 * (0.15 + 1.15 * easeOutCubic(wp));
        ctx.strokeStyle = COLORS.goldBright;
        ctx.lineWidth = 1;
        ctx.globalAlpha = centerSeedAlpha * (1 - wp) * 0.75;
        ctx.beginPath();
        ctx.arc(0, 0, waveR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Tâm chấm Đỏ Chu Sa thu nhỏ khi hoa cực xuất hiện để làm nhụy
    ctx.globalAlpha = centerSeedAlpha;
    ctx.fillStyle = COLORS.cinnabar;
    ctx.beginPath();
    ctx.arc(0, 0, 4.5 * pSeed, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // (0.6s - 2.2s): 2 hình vuông lồng nhau xoay lệch 45° (Octagram Bát phương)
  const sq1Progress = clamp01((artTime - 0.6) / 0.95);
  const sq2Progress = clamp01((artTime - 0.95) / 0.95);

  ctx.strokeStyle = COLORS.cinnabar;
  ctx.lineWidth = 1.5;
  drawProgressiveSquare(ctx, squareHalf, 0, sq1Progress);
  drawProgressiveSquare(ctx, squareHalf, Math.PI / 4, sq2Progress);

  // Vòng tròn "Trời tròn" (Cửa sổ Khuê Văn Các) bán kính R₁ viền kép Đỏ Chu Sa và Vàng Đồng
  const circleProgress = easeInOutQuart(clamp01((artTime - 1.1) / 1.1));
  if (circleProgress > 0) {
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * circleProgress;

    ctx.strokeStyle = COLORS.cinnabar;
    ctx.lineWidth = 1.85;
    ctx.beginPath();
    ctx.arc(0, 0, r1, startAngle, endAngle);
    ctx.stroke();

    ctx.strokeStyle = COLORS.goldDark;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(0, 0, r1 * 0.92, startAngle, endAngle);
    ctx.stroke();
  }

  // --- HỒI II (2.2s - 5.2s): 8 NAN KÉP, HOA CỰC 8 CÁNH, 3 THƯỚC THIÊN VĂN & 16 SAO KHUÊ ---
  // 8 thanh nan kép đối xứng nối từ R₁ ra khung vuông bên ngoài
  const barsProgress = easeOutCubic(clamp01((artTime - 2.05) / 0.95));
  if (barsProgress > 0) {
    const barEndR = squareHalf;
    const currentEndR = r1 + (barEndR - r1) * barsProgress;
    for (let k = 0; k < 8; k++) {
      const angle = k * (Math.PI / 4);
      ctx.save();
      ctx.rotate(angle);

      // Cặp thanh nan kép Đỏ Chu Sa
      ctx.strokeStyle = COLORS.cinnabar;
      ctx.lineWidth = 1.15;
      for (const offset of [-2.4, 2.4]) {
        ctx.beginPath();
        ctx.moveTo(r1, offset);
        ctx.lineTo(currentEndR, offset);
        ctx.stroke();
      }

      // Đường tim Vàng Đồng mảnh ở giữa thanh nan
      ctx.strokeStyle = 'rgba(138, 106, 47, 0.65)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(r1, 0);
      ctx.lineTo(currentEndR, 0);
      ctx.stroke();

      ctx.restore();
    }
  }

  // Đường cong hoa cực 8 cánh r(θ) = R₁ · |cos(4θ)| (mờ đi nhẹ nhàng khi cổng thấu quang mở)
  const polarReveal = clamp01((artTime - 2.2) / 1.35);
  const polarFade = artTime >= 5.15 ? clamp01(1 - (artTime - 5.15) / 0.35) : 1;
  const polarSpin = Math.max(0, artTime - 2.2) * 0.16;
  drawEightPetalPolarCurve(ctx, r1, polarSpin, polarReveal, polarFade);

  // 3 vòng thước đo thiên văn đồng tâm xoay ngược chiều nhau chậm rãi
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

  // Chòm 16 ngôi sao Khuê chuyển động mượt mà trên quỹ đạo
  const starOrbitRot = Math.max(0, artTime - 2.8) * 0.035;
  drawKhueConstellation(
    ctx,
    r1,
    starOrbitRot,
    clamp01((artTime - 2.8) / 1.6),
    state.prefersReducedMotion ? 0 : state.elapsed,
  );

  ctx.restore(); // Kết thúc biến đổi trung tâm

  // --- HỒI III (5.2s - 7.5s): CỬA SỔ THẤU QUANG MỞ VÀO TRANG CHỦ (destination-out) ---
  if (portal.portalRadius > 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, portal.portalRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Viền vàng thếp & đỏ chu sa ôm mép cửa sổ thấu quang khi đang mở
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
