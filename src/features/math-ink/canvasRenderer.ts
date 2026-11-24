import { evaluateGeoScene, renderGeoSceneOnCanvas, type GeoOverlayState } from './geoEngine';
import { renderGeometryStampOnCanvas } from './geometryStampEngine';
import {
  compileMathExpression,
  computeDefiniteIntegral,
  findSpecialGraphPoints,
} from './mathExprParser';
import { renderSolid3DOnCanvas } from './solid3dEngine';
import type {
  InkGraphItem,
  InkPage,
  InkPoint,
  InkShapeItem,
  InkStroke,
  InkTextItem,
  InkWorksheetBackground,
  PaperConfig,
} from './types';
import { renderVariationTableOnCanvas } from './variationTableEngine';

function isDarkHex(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return false;
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.45;
}

export function drawPaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  paper: PaperConfig,
): void {
  ctx.save();
  ctx.fillStyle = paper.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  const dark = isDarkHex(paper.backgroundColor);
  const gridColor = dark ? 'rgba(167, 212, 198, 0.14)' : 'rgba(96, 165, 250, 0.34)';
  const minorGridColor = dark ? 'rgba(167, 212, 198, 0.08)' : 'rgba(147, 197, 253, 0.25)';
  const marginColor = dark ? 'rgba(248, 113, 113, 0.45)' : 'rgba(239, 68, 68, 0.46)';

  if (paper.pattern === 'math' || paper.pattern === 'math-sm' || paper.pattern === 'math-lg') {
    const step = paper.pattern === 'math-sm' ? 20 : paper.pattern === 'math-lg' ? 40 : 28;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = step; x < width; x += step) {
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, height);
    }
    for (let y = step; y < height; y += step) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();
  } else if (paper.pattern === 'ruled') {
    const step = 34;
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = 72; y < height; y += step) {
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(width, y + 0.5);
    }
    ctx.stroke();
  } else if (paper.pattern === 'dotted') {
    const step = 28;
    ctx.fillStyle = dark ? 'rgba(167, 212, 198, 0.3)' : 'rgba(100, 116, 139, 0.35)';
    for (let x = step; x < width; x += step) {
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, 1.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Đường kẻ lề đỏ & tiêu đề giống vở ô ly Scrble Ink
  if (paper.showBorderLines && paper.pattern !== 'blank') {
    ctx.strokeStyle = marginColor;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(76.5, 0);
    ctx.lineTo(76.5, height);
    ctx.moveTo(width - 42.5, 0);
    ctx.lineTo(width - 42.5, height);
    ctx.stroke();

    // Đường ngăn tiêu đề nét đứt nhẹ phía trên
    ctx.strokeStyle = minorGridColor;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, 68.5);
    ctx.lineTo(width, 68.5);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
}

/**
 * Bộ lọc ổn định nét bút thời gian thực (Spring-String Streamline Filter):
 * - Khử rung tay khi viết bằng chuột / touchpad ở tốc độ chậm.
 * - Tự động bắt kịp đầu bút khi vẩy nét nhanh để không bị trễ.
 * - Tự nội suy áp lực bút tự nhiên từ vận tốc di chuyển khi thiết bị không có cảm ứng lực.
 */
export function stabilizeInkPoint(
  prev: InkPoint,
  raw: InkPoint,
  streamline = 0.58,
  dtMs = 16,
): InkPoint {
  const clampedStreamline = Math.max(0, Math.min(0.92, streamline));
  const dx = raw.x - prev.x;
  const dy = raw.y - prev.y;
  const dist = Math.hypot(dx, dy);

  // Vận tốc tức thời (px/ms) để tự điều biến độ mở bộ lọc và áp lực giả lập
  const safeDt = Math.max(4, Math.min(80, dtMs));
  const velocity = dist / safeDt;

  // Khi lia nhanh (dist lớn), tăng hệ số alpha để nét bám sát mũi bút
  const dynamicAlpha = Math.max(
    0.16,
    Math.min(1, 1 - clampedStreamline * 0.76 + Math.min(0.28, dist / 95)),
  );

  const x = prev.x + dx * dynamicAlpha;
  const y = prev.y + dy * dynamicAlpha;

  const rawPressure = raw.pressure;
  const hasHardwarePressure =
    typeof rawPressure === 'number' && Math.abs(rawPressure - 0.5) > 0.015 && rawPressure > 0.05;

  let pressure: number;
  if (hasHardwarePressure) {
    const prevP = prev.pressure ?? rawPressure;
    pressure = prevP * 0.45 + rawPressure * 0.55;
  } else {
    // Giả lập lực nhấn tự nhiên từ tốc độ viết: nét uốn chậm đậm vừa, nét vẩy nhanh thanh nhẹ
    const targetP = Math.max(0.3, Math.min(0.88, 0.76 - velocity * 0.24));
    const prevP = prev.pressure ?? 0.56;
    pressure = prevP * 0.64 + targetP * 0.36;
  }

  return { x, y, pressure };
}

/**
 * Làm mịn đa tầng bảo toàn góc nhọn (Corner-Preserving Multi-Pass Smoothing):
 * - Loại bỏ hoàn toàn răng cưa vi mô khi viết chữ cái uốn lượn (a, e, g, s, ∫, α, β, φ).
 * - Tự động phát hiện và giữ sắc nét các góc gập chủ ý (> 105° như số 7, 4, Σ, Δ, dấu căn).
 */
export function smoothStrokePoints(pts: readonly InkPoint[], streamline = 0.58): InkPoint[] {
  if (pts.length <= 2) return [...pts];
  const strength = Math.max(0, Math.min(0.92, streamline));
  if (strength <= 0.03) return [...pts];

  const passes = strength >= 0.72 ? 3 : strength >= 0.38 ? 2 : 1;
  let current: InkPoint[] = [...pts];

  for (let pass = 0; pass < passes; pass += 1) {
    const nextPass: InkPoint[] = [current[0]!];
    const neighborWeight = 0.14 + strength * 0.14; // 0.14 -> 0.27

    for (let i = 1; i < current.length - 1; i += 1) {
      const prev = current[i - 1]!;
      const cur = current[i]!;
      const next = current[i + 1]!;

      const ux = cur.x - prev.x;
      const uy = cur.y - prev.y;
      const vx = next.x - cur.x;
      const vy = next.y - cur.y;
      const lenU = Math.hypot(ux, uy);
      const lenV = Math.hypot(vx, vy);

      // Bảo toàn góc nhọn chủ ý (cosTheta < -0.22 tương ứng góc rẽ > 103°)
      let localNeighborW = neighborWeight;
      if (lenU > 1.2 && lenV > 1.2) {
        const cosTheta = (ux * vx + uy * vy) / (lenU * lenV);
        if (cosTheta < -0.22) {
          localNeighborW *= 0.18;
        } else if (cosTheta < 0.25) {
          localNeighborW *= 0.55;
        }
      }
      const localCenterW = 1 - localNeighborW * 2;

      const pPrev = prev.pressure ?? 0.55;
      const pCur = cur.pressure ?? 0.55;
      const pNext = next.pressure ?? 0.55;

      nextPass.push({
        x: prev.x * localNeighborW + cur.x * localCenterW + next.x * localNeighborW,
        y: prev.y * localNeighborW + cur.y * localCenterW + next.y * localNeighborW,
        pressure: pPrev * 0.2 + pCur * 0.6 + pNext * 0.2,
      });
    }

    nextPass.push(current[current.length - 1]!);
    current = nextPass;
  }

  return current;
}

/** Lấy mẫu mịn dọc đường cong сплайн bậc hai qua trung điểm để ngòi bút uốn lượn mượt mà */
function sampleSmoothCurve(pts: readonly InkPoint[], streamline = 0.58, stepPx = 1.8): InkPoint[] {
  if (pts.length <= 1) return [...pts];
  const smooth = smoothStrokePoints(pts, streamline);
  if (smooth.length === 2) {
    const a = smooth[0]!;
    const b = smooth[1]!;
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(dist / stepPx));
    const sampled: InkPoint[] = [];
    for (let s = 0; s <= steps; s += 1) {
      const t = s / steps;
      sampled.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        pressure: (a.pressure ?? 0.55) + ((b.pressure ?? 0.55) - (a.pressure ?? 0.55)) * t,
      });
    }
    return sampled;
  }

  const sampled: InkPoint[] = [smooth[0]!];
  let prevX = smooth[0]!.x;
  let prevY = smooth[0]!.y;
  let prevP = smooth[0]!.pressure ?? 0.55;

  for (let i = 1; i < smooth.length; i += 1) {
    const ctrl = smooth[i]!;
    const isLast = i === smooth.length - 1;
    const endX = isLast ? ctrl.x : (ctrl.x + smooth[i + 1]!.x) / 2;
    const endY = isLast ? ctrl.y : (ctrl.y + smooth[i + 1]!.y) / 2;
    const endP = isLast
      ? (ctrl.pressure ?? 0.55)
      : ((ctrl.pressure ?? 0.55) + (smooth[i + 1]!.pressure ?? 0.55)) / 2;

    const approxLen =
      Math.hypot(ctrl.x - prevX, ctrl.y - prevY) + Math.hypot(endX - ctrl.x, endY - ctrl.y);
    const steps = Math.max(1, Math.min(32, Math.ceil(approxLen / stepPx)));

    for (let s = 1; s <= steps; s += 1) {
      const t = s / steps;
      const omt = 1 - t;
      const x = omt * omt * prevX + 2 * omt * t * ctrl.x + t * t * endX;
      const y = omt * omt * prevY + 2 * omt * t * ctrl.y + t * t * endY;
      const pressure = prevP + (endP - prevP) * t;
      sampled.push({ x, y, pressure });
    }

    prevX = endX;
    prevY = endY;
    prevP = endP;
  }

  return sampled;
}

/**
 * Kết xuất nét Bút thường / Bút Gel Toán học (Variable-Width Tapered Gel Ink):
 * - Tự động vuốt thon nhẹ ở đầu nét và đuôi nét (tapered terminals) giúp chữ viết thanh thoát.
 * - Điều biến độ dày mượt theo lực nhấn / vận tốc (±22%) trên một dải băng liên tục không ngấn.
 */
function drawBallpointGelStroke(ctx: CanvasRenderingContext2D, stroke: InkStroke): void {
  const dense = sampleSmoothCurve(stroke.points, stroke.streamline ?? 0.58, 1.8);
  if (dense.length <= 2) {
    const p0 = dense[0]!;
    const p1 = dense[dense.length - 1]!;
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
    return;
  }

  // Tính chiều dài tích lũy dọc nét để tạo độ vuốt thon (taper) tự nhiên ở đầu và đuôi
  const cumLen: number[] = [0];
  let totalLen = 0;
  for (let i = 1; i < dense.length; i += 1) {
    totalLen += Math.hypot(dense[i]!.x - dense[i - 1]!.x, dense[i]!.y - dense[i - 1]!.y);
    cumLen.push(totalLen);
  }

  if (totalLen < 4.5) {
    ctx.lineWidth = stroke.width;
    ctx.beginPath();
    ctx.moveTo(dense[0]!.x, dense[0]!.y);
    for (let i = 1; i < dense.length; i += 1) {
      ctx.lineTo(dense[i]!.x, dense[i]!.y);
    }
    ctx.stroke();
    return;
  }

  const baseRadius = Math.max(0.65, stroke.width / 2);
  const startTaperDist = Math.min(7, totalLen * 0.16);
  const endTaperDist = Math.min(14, totalLen * 0.25);

  const leftSide: { x: number; y: number }[] = [];
  const rightSide: { x: number; y: number }[] = [];

  for (let i = 0; i < dense.length; i += 1) {
    const cur = dense[i]!;
    const prev = dense[Math.max(0, i - 1)]!;
    const next = dense[Math.min(dense.length - 1, i + 1)]!;

    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const tLen = Math.hypot(tx, ty);
    if (tLen > 1e-4) {
      tx /= tLen;
      ty /= tLen;
    } else {
      tx = 1;
      ty = 0;
    }

    const nx = -ty;
    const ny = tx;

    const dStart = cumLen[i]!;
    const dEnd = totalLen - dStart;
    const startFactor =
      startTaperDist > 0.5 && dStart < startTaperDist ? 0.58 + 0.42 * (dStart / startTaperDist) : 1;
    const endFactor =
      endTaperDist > 0.5 && dEnd < endTaperDist
        ? 0.42 + 0.58 * Math.pow(dEnd / endTaperDist, 0.85)
        : 1;

    const pFactor = 0.82 + (cur.pressure ?? 0.55) * 0.32;
    const r = baseRadius * startFactor * endFactor * pFactor;

    leftSide.push({ x: cur.x + nx * r, y: cur.y + ny * r });
    rightSide.push({ x: cur.x - nx * r, y: cur.y - ny * r });
  }

  ctx.beginPath();
  ctx.moveTo(leftSide[0]!.x, leftSide[0]!.y);
  for (let i = 1; i < leftSide.length; i += 1) {
    ctx.lineTo(leftSide[i]!.x, leftSide[i]!.y);
  }
  for (let i = rightSide.length - 1; i >= 0; i -= 1) {
    ctx.lineTo(rightSide[i]!.x, rightSide[i]!.y);
  }
  ctx.closePath();
  ctx.fill();

  // Bo tròn hai đầu mút nét mực
  const firstPt = dense[0]!;
  const lastPt = dense[dense.length - 1]!;
  ctx.beginPath();
  ctx.arc(firstPt.x, firstPt.y, baseRadius * 0.56, 0, Math.PI * 2);
  ctx.arc(lastPt.x, lastPt.y, baseRadius * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Kết xuất nét bút máy ngòi dẹt nghiêng (Calligraphy Chisel Nib góc -34°, nâng cấp độ mịn cao):
 * - Nét đi lên-phải (↗) thanh mảnh, nét đi xuống-phải (↘) & sổ dọc (↓) đậm bản rộng.
 * - Vuốt thon nhẹ ở đuôi nét và khử hoàn toàn ngấn răng cưa ở các vòng cong chữ viết.
 */
function drawFountainCalligraphyStroke(ctx: CanvasRenderingContext2D, stroke: InkStroke): void {
  const NIB_ANGLE_RAD = (-34 * Math.PI) / 180;
  const cosA = Math.cos(NIB_ANGLE_RAD);
  const sinA = Math.sin(NIB_ANGLE_RAD);

  const nibFullLength = Math.max(2.6, stroke.width * 2.08);
  const minRibbonWidth = Math.max(1.1, stroke.width * 0.4);
  const dense = sampleSmoothCurve(stroke.points, stroke.streamline ?? 0.68, 1.45);

  if (dense.length === 1) {
    const p = dense[0]!;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(NIB_ANGLE_RAD);
    ctx.fillRect(-nibFullLength / 2, -minRibbonWidth / 2, nibFullLength, minRibbonWidth);
    ctx.restore();
    return;
  }

  // 1. Nét lõi thanh mảnh bảo đảm đoạn trùng góc ngòi (-34°) luôn liền mạch sắc nét
  ctx.lineWidth = minRibbonWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(dense[0]!.x, dense[0]!.y);
  for (let i = 1; i < dense.length; i += 1) {
    ctx.lineTo(dense[i]!.x, dense[i]!.y);
  }
  ctx.stroke();

  // 2. Quét lưỡi ngòi dẹt với mật độ cao + vuốt nhẹ ở điểm kết thúc nét
  const n = dense.length;
  const tailCount = Math.min(10, Math.floor(n * 0.2));
  ctx.lineWidth = 0.35;
  ctx.lineJoin = 'round';
  for (let i = 0; i < n - 1; i += 1) {
    const p0 = dense[i]!;
    const p1 = dense[i + 1]!;
    const tailFactor0 =
      tailCount > 2 && n - 1 - i < tailCount ? 0.62 + 0.38 * ((n - 1 - i) / tailCount) : 1;
    const tailFactor1 =
      tailCount > 2 && n - 2 - i < tailCount
        ? 0.62 + 0.38 * (Math.max(0, n - 2 - i) / tailCount)
        : 1;

    const scale0 = (0.84 + (p0.pressure ?? 0.55) * 0.32) * tailFactor0;
    const scale1 = (0.84 + (p1.pressure ?? 0.55) * 0.32) * tailFactor1;
    const h0 = (nibFullLength * scale0) / 2;
    const h1 = (nibFullLength * scale1) / 2;

    const ax0 = p0.x - cosA * h0;
    const ay0 = p0.y - sinA * h0;
    const bx0 = p0.x + cosA * h0;
    const by0 = p0.y + sinA * h0;

    const ax1 = p1.x - cosA * h1;
    const ay1 = p1.y - sinA * h1;
    const bx1 = p1.x + cosA * h1;
    const by1 = p1.y + sinA * h1;

    ctx.beginPath();
    ctx.moveTo(ax0, ay0);
    ctx.lineTo(bx0, by0);
    ctx.lineTo(bx1, by1);
    ctx.lineTo(ax1, ay1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

export function drawInkStroke(ctx: CanvasRenderingContext2D, stroke: InkStroke): void {
  const pts = stroke.points;
  if (pts.length === 0) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = stroke.color;
  ctx.fillStyle = stroke.color;
  ctx.globalAlpha = stroke.opacity;

  if (stroke.penKind === 'highlighter') {
    ctx.lineCap = 'butt';
  }

  // Bút máy thư pháp (Fountain): ngòi dẹt nghiêng thanh-đậm chuẩn thư pháp Toán học
  if (stroke.penKind === 'fountain') {
    drawFountainCalligraphyStroke(ctx, stroke);
    ctx.restore();
    return;
  }

  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0]!.x, pts[0]!.y, Math.max(1, stroke.width / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Bút thường / Bút Gel (Ballpoint): dải băng vuốt thon hai đầu & điều biến độ dày mượt
  if (stroke.penKind === 'ballpoint') {
    drawBallpointGelStroke(ctx, stroke);
    ctx.restore();
    return;
  }

  // Bút chì (Pencil) & Dạ quang (Highlighter): đường cong spline đa tầng
  const smooth = smoothStrokePoints(pts, stroke.streamline ?? 0.5);
  const traceCurve = () => {
    ctx.beginPath();
    ctx.moveTo(smooth[0]!.x, smooth[0]!.y);
    for (let i = 1; i < smooth.length - 1; i += 1) {
      const cur = smooth[i]!;
      const next = smooth[i + 1]!;
      const midX = (cur.x + next.x) / 2;
      const midY = (cur.y + next.y) / 2;
      ctx.quadraticCurveTo(cur.x, cur.y, midX, midY);
    }
    const last = smooth[smooth.length - 1]!;
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  };

  if (stroke.penKind === 'pencil') {
    // Lớp bột than chì mờ bên ngoài + lõi chì sắc bên trong
    ctx.globalAlpha = stroke.opacity * 0.34;
    ctx.lineWidth = stroke.width * 1.28;
    traceCurve();
    ctx.globalAlpha = stroke.opacity * 0.92;
    ctx.lineWidth = stroke.width * 0.84;
    traceCurve();
  } else {
    ctx.lineWidth = stroke.width;
    traceCurve();
  }

  ctx.restore();
}

function drawPolygon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  sides: number,
): void {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / sides;
    const x = cx + Math.cos(angle) * rx;
    const y = cy + Math.sin(angle) * ry;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number,
): void {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle - Math.PI / 6), y2 - size * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - size * Math.cos(angle + Math.PI / 6), y2 - size * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

export function drawInkShape(ctx: CanvasRenderingContext2D, shape: InkShapeItem): void {
  ctx.save();
  ctx.strokeStyle = shape.color;
  ctx.lineWidth = shape.width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const { x1, y1, x2, y2, kind } = shape;
  const minX = Math.min(x1, x2);
  const minY = Math.min(y1, y2);
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;

  if (kind === 'dashed-line') ctx.setLineDash([8, 6]);
  if (kind === 'dash-dot-line') ctx.setLineDash([10, 4, 2, 4]);

  if (
    kind === 'line' ||
    kind === 'dashed-line' ||
    kind === 'dash-dot-line' ||
    kind === 'arrow' ||
    kind === 'double-arrow'
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.setLineDash([]);
    const headSize = Math.max(10, shape.width * 3.8);
    if (kind === 'arrow' || kind === 'double-arrow') {
      drawArrowHead(ctx, x1, y1, x2, y2, headSize);
    }
    if (kind === 'double-arrow') {
      drawArrowHead(ctx, x2, y2, x1, y1, headSize);
    }
  } else if (kind === 'rect') {
    ctx.strokeRect(minX, minY, w, h);
  } else if (kind === 'parallelogram') {
    const shear = Math.min(w * 0.24, Math.max(12, h * 0.42));
    ctx.beginPath();
    ctx.moveTo(minX + shear, minY);
    ctx.lineTo(minX + w, minY);
    ctx.lineTo(minX + w - shear, minY + h);
    ctx.lineTo(minX, minY + h);
    ctx.closePath();
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = shape.color;
    ctx.fill();
    ctx.restore();
    ctx.stroke();

    // Cung góc mặt phẳng (α) ở góc trái dưới chuẩn sách giáo khoa Hình học
    if (w > 48 && h > 32) {
      const arcR = Math.min(22, w * 0.18, h * 0.34);
      const slopeAngle = Math.atan2(-h, shear);
      ctx.beginPath();
      ctx.arc(minX, minY + h, arcR, slopeAngle, 0);
      ctx.stroke();
    }
  } else if (kind === 'circle') {
    const r = Math.max(2, Math.min(w, h) / 2);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'ellipse') {
    ctx.beginPath();
    ctx.ellipse(cx, cy, Math.max(2, w / 2), Math.max(2, h / 2), 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === 'triangle') {
    ctx.beginPath();
    ctx.moveTo(cx, minY);
    ctx.lineTo(minX + w, minY + h);
    ctx.lineTo(minX, minY + h);
    ctx.closePath();
    ctx.stroke();
  } else if (kind === 'right-triangle') {
    ctx.beginPath();
    ctx.moveTo(minX, minY);
    ctx.lineTo(minX, minY + h);
    ctx.lineTo(minX + w, minY + h);
    ctx.closePath();
    ctx.stroke();
    // Ký hiệu góc vuông nhỏ ở góc trái dưới
    const sq = Math.min(14, w * 0.2, h * 0.2);
    if (sq > 4) {
      ctx.beginPath();
      ctx.moveTo(minX, minY + h - sq);
      ctx.lineTo(minX + sq, minY + h - sq);
      ctx.lineTo(minX + sq, minY + h);
      ctx.stroke();
    }
  } else if (kind === 'diamond') {
    ctx.beginPath();
    ctx.moveTo(cx, minY);
    ctx.lineTo(minX + w, cy);
    ctx.lineTo(cx, minY + h);
    ctx.lineTo(minX, cy);
    ctx.closePath();
    ctx.stroke();
  } else if (kind === 'pentagon') {
    drawPolygon(ctx, cx, cy, Math.max(2, w / 2), Math.max(2, h / 2), 5);
  } else if (kind === 'hexagon') {
    drawPolygon(ctx, cx, cy, Math.max(2, w / 2), Math.max(2, h / 2), 6);
  }

  ctx.restore();
}

/**
 * Kết xuất đồ thị hàm số 2D chuẩn Toán học trên hệ trục Oxy:
 * - Hỗ trợ nhiều hàm số đồng thời.
 * - Tự ngắt đường tại tiệm cận đứng / điểm gián đoạn (không nối nét dọc giả).
 * - Hỗ trợ tô bóng miền tích phân xác định + tính diện tích xấp xỉ Simpson.
 * - Tự đánh dấu điểm đặc biệt (giao Ox, Oy, cực trị).
 */
export function renderFunctionGraphOnCanvas(
  ctx: CanvasRenderingContext2D,
  graph: InkGraphItem,
  isDarkPaper = false,
): void {
  ctx.save();
  const { x, y, width, height, xMin, xMax, yMin, yMax } = graph;
  const pad = 28;
  const plotX = x + pad;
  const plotY = y + pad;
  const plotW = Math.max(40, width - pad * 2);
  const plotH = Math.max(40, height - pad * 2);

  const toCanvasX = (vx: number) => plotX + ((vx - xMin) / (xMax - xMin)) * plotW;
  const toCanvasY = (vy: number) => plotY + ((yMax - vy) / (yMax - yMin)) * plotH;

  // Khung giấy nhẹ bao đồ thị
  ctx.fillStyle = isDarkPaper ? 'rgba(18, 28, 25, 0.88)' : 'rgba(255, 255, 255, 0.94)';
  ctx.strokeStyle = isDarkPaper ? 'rgba(255, 255, 255, 0.18)' : 'rgba(17, 26, 24, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 10);
  ctx.fill();
  ctx.stroke();

  // Lưới tọa độ bên trong vùng vẽ
  if (graph.showGrid) {
    ctx.strokeStyle = isDarkPaper ? 'rgba(255, 255, 255, 0.09)' : 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 0.8;
    const xStep = Math.max(1, Math.ceil((xMax - xMin) / 12));
    const yStep = Math.max(1, Math.ceil((yMax - yMin) / 10));

    ctx.beginPath();
    for (let gx = Math.ceil(xMin / xStep) * xStep; gx <= xMax; gx += xStep) {
      const px = toCanvasX(gx);
      ctx.moveTo(px, plotY);
      ctx.lineTo(px, plotY + plotH);
    }
    for (let gy = Math.ceil(yMin / yStep) * yStep; gy <= yMax; gy += yStep) {
      const py = toCanvasY(gy);
      ctx.moveTo(plotX, py);
      ctx.lineTo(plotX + plotW, py);
    }
    ctx.stroke();
  }

  // Hai trục tọa độ Ox, Oy
  const axisColor = isDarkPaper ? '#E2E8F0' : '#111827';
  ctx.strokeStyle = axisColor;
  ctx.fillStyle = axisColor;
  ctx.lineWidth = 1.4;

  const axisY = yMin <= 0 && yMax >= 0 ? toCanvasY(0) : plotY + plotH;
  const axisX = xMin <= 0 && xMax >= 0 ? toCanvasX(0) : plotX;

  ctx.beginPath();
  ctx.moveTo(plotX - 6, axisY);
  ctx.lineTo(plotX + plotW + 10, axisY);
  ctx.moveTo(axisX, plotY + plotH + 6);
  ctx.lineTo(axisX, plotY - 10);
  ctx.stroke();

  drawArrowHead(ctx, plotX, axisY, plotX + plotW + 10, axisY, 7);
  drawArrowHead(ctx, axisX, plotY + plotH, axisX, plotY - 10, 7);

  // Vạch chia số trên trục
  ctx.font = '10.5px "JetBrains Mono Variable", monospace';
  const tickStepX = Math.max(1, Math.ceil((xMax - xMin) / 10));
  const tickStepY = Math.max(1, Math.ceil((yMax - yMin) / 8));
  for (let gx = Math.ceil(xMin / tickStepX) * tickStepX; gx <= xMax; gx += tickStepX) {
    if (gx === 0) continue;
    const px = toCanvasX(gx);
    ctx.beginPath();
    ctx.moveTo(px, axisY - 3);
    ctx.lineTo(px, axisY + 3);
    ctx.stroke();
    ctx.fillText(String(gx), px - 5, axisY + 14);
  }
  for (let gy = Math.ceil(yMin / tickStepY) * tickStepY; gy <= yMax; gy += tickStepY) {
    if (gy === 0) continue;
    const py = toCanvasY(gy);
    ctx.beginPath();
    ctx.moveTo(axisX - 3, py);
    ctx.lineTo(axisX + 3, py);
    ctx.stroke();
    ctx.fillText(String(gy), axisX + 6, py + 3);
  }

  ctx.font = 'italic 700 13px "Times New Roman", serif';
  ctx.fillText('x', plotX + plotW + 13, axisY + 4);
  ctx.fillText('y', axisX + 7, plotY - 9);
  if (xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0) {
    ctx.fillText('O', axisX - 13, axisY + 14);
  }

  // Clip vùng vẽ đồ thị để đường cong không tràn khung
  ctx.save();
  ctx.beginPath();
  ctx.rect(plotX, plotY, plotW, plotH);
  ctx.clip();

  const ySpan = Math.max(1, yMax - yMin);

  // 1. Tô bóng miền tích phân xác định nếu bật
  if (graph.integral?.enabled) {
    const targetFnEntry = graph.functions[graph.integral.funcIndex];
    if (targetFnEntry && targetFnEntry.visible) {
      const compiled = compileMathExpression(targetFnEntry.expression);
      if (compiled.ok) {
        const a = Math.min(graph.integral.from, graph.integral.to);
        const b = Math.max(graph.integral.from, graph.integral.to);
        const steps = 120;
        const step = (b - a) / steps;
        const yZero = toCanvasY(0);

        ctx.fillStyle = `${targetFnEntry.color}30`;
        ctx.beginPath();
        ctx.moveTo(toCanvasX(a), yZero);
        for (let i = 0; i <= steps; i += 1) {
          const vx = a + i * step;
          const vy = compiled.evaluate(vx);
          if (Number.isFinite(vy)) {
            ctx.lineTo(toCanvasX(vx), toCanvasY(vy));
          }
        }
        ctx.lineTo(toCanvasX(b), yZero);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // 2. Vẽ từng đường cong hàm số (tự phát hiện tiệm cận đứng)
  const samples = Math.max(240, Math.round(plotW * 0.9));
  const dx = (xMax - xMin) / samples;

  for (const fnEntry of graph.functions) {
    if (!fnEntry.visible || !fnEntry.expression.trim()) continue;
    const compiled = compileMathExpression(fnEntry.expression);
    if (!compiled.ok) continue;

    ctx.strokeStyle = fnEntry.color;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.beginPath();

    let drawing = false;
    let prevY = 0;
    for (let i = 0; i <= samples; i += 1) {
      const vx = xMin + i * dx;
      const vy = compiled.evaluate(vx);
      const valid = Number.isFinite(vy) && Math.abs(vy) < ySpan * 12;

      if (!valid) {
        drawing = false;
        continue;
      }

      // Ngắt nét nếu bước nhảy quá lớn (tiệm cận đứng như 1/(x-1) hoặc tan(x))
      if (drawing && Math.abs(vy - prevY) > ySpan * 0.85) {
        drawing = false;
      }

      const px = toCanvasX(vx);
      const py = toCanvasY(vy);
      if (!drawing) {
        ctx.moveTo(px, py);
        drawing = true;
      } else {
        ctx.lineTo(px, py);
      }
      prevY = vy;
    }
    ctx.stroke();

    // Đánh dấu các điểm đặc biệt (giao trục, cực trị)
    if (graph.showSpecialPoints) {
      const pts = findSpecialGraphPoints(compiled.evaluate, xMin, xMax, yMin, yMax);
      ctx.font = '10px "JetBrains Mono Variable", monospace';
      for (const sp of pts) {
        const px = toCanvasX(sp.x);
        const py = toCanvasY(sp.y);
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = fnEntry.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = axisColor;
        ctx.fillText(sp.label, px + 6, py - 6);
      }
    }
  }

  ctx.restore();

  // Chú thích tên hàm & giá trị tích phân ở góc trên trái khung đồ thị
  let legendY = y + 18;
  ctx.font = '600 11px "JetBrains Mono Variable", monospace';
  for (const fnEntry of graph.functions) {
    if (!fnEntry.visible || !fnEntry.expression.trim()) continue;
    ctx.fillStyle = fnEntry.color;
    ctx.fillText(`y = ${fnEntry.expression}`, x + 12, legendY);
    legendY += 15;
  }

  if (graph.integral?.enabled) {
    const targetFnEntry = graph.functions[graph.integral.funcIndex];
    const compiled = targetFnEntry ? compileMathExpression(targetFnEntry.expression) : null;
    if (compiled?.ok) {
      const areaVal = computeDefiniteIntegral(
        compiled.evaluate,
        graph.integral.from,
        graph.integral.to,
      );
      if (areaVal !== null) {
        ctx.fillStyle = axisColor;
        ctx.fillText(
          `∫[${graph.integral.from}; ${graph.integral.to}] ≈ ${areaVal.toFixed(3)}`,
          x + 12,
          y + height - 10,
        );
      }
    }
  }

  ctx.restore();
}

export interface PageRenderOptions {
  readonly width: number;
  readonly height: number;
  readonly paper: PaperConfig;
  readonly page: InkPage;
  readonly activeStroke?: InkStroke | null;
  readonly previewShape?: InkShapeItem | null;
  readonly imageCache?: ReadonlyMap<string, HTMLImageElement>;
  readonly selectionRect?: {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  } | null;
  readonly lassoPoints?: readonly InkPoint[];
  readonly selectedIds?: ReadonlySet<string>;
  readonly spacerLineY?: number | null;
  readonly geoOverlay?: GeoOverlayState;
  /**
   * Khi bật trên màn hình tương tác, các mục `page.texts` được hiển thị qua lớp phủ KaTeX HTML vector
   * nên bỏ qua vẽ thô trên canvas để không bị bóng chữ LaTeX đè dưới công thức.
   * Khi xuất PNG / PDF / Ghi hình bài giảng (mặc định `false`), động cơ sẽ vẽ công thức toán định dạng đẹp trực tiếp lên Canvas 2D.
   */
  readonly skipScreenMathTexts?: boolean;
}

const LATEX_SYMBOL_MAP: ReadonlyArray<readonly [RegExp, string]> = [
  [/\\mathbb\{R\}|\\R\b/g, 'ℝ'],
  [/\\mathbb\{Z\}|\\Z\b/g, 'ℤ'],
  [/\\mathbb\{N\}|\\N\b/g, 'ℕ'],
  [/\\mathbb\{Q\}|\\Q\b/g, 'ℚ'],
  [/\\mathbb\{C\}|\\C\b/g, 'ℂ'],
  [/\\operatorname\{([^}]*)\}/g, '$1'],
  [/\\text\{([^}]*)\}/g, '$1'],
  [/\\mathrm\{([^}]*)\}/g, '$1'],
  [/\\iff\b|\\Leftrightarrow\b/g, '⇔'],
  [/\\implies\b|\\Rightarrow\b/g, '⇒'],
  [/\\Leftarrow\b/g, '⇐'],
  [/\\mapsto\b/g, '↦'],
  [/\\to\b|\\rightarrow\b/g, '→'],
  [/\\leftarrow\b/g, '←'],
  [/\\forall\b/g, '∀'],
  [/\\exists\b/g, '∃'],
  [/\\notin\b/g, '∉'],
  [/\\in\b/g, '∈'],
  [/\\subseteq\b/g, '⊆'],
  [/\\subset\b/g, '⊂'],
  [/\\supseteq\b/g, '⊇'],
  [/\\supset\b/g, '⊃'],
  [/\\cup\b/g, '∪'],
  [/\\cap\b/g, '∩'],
  [/\\setminus\b/g, '∖'],
  [/\\emptyset\b|\\varnothing\b/g, '∅'],
  [/\\infty\b/g, '∞'],
  [/\\pm\b/g, '±'],
  [/\\mp\b/g, '∓'],
  [/\\cdot\b/g, '·'],
  [/\\times\b/g, '×'],
  [/\\div\b/g, '÷'],
  [/\\le\b|\\leq\b/g, '≤'],
  [/\\ge\b|\\geq\b/g, '≥'],
  [/\\ne\b|\\neq\b/g, '≠'],
  [/\\approx\b/g, '≈'],
  [/\\equiv\b/g, '≡'],
  [/\\cong\b/g, '≅'],
  [/\\sim\b/g, '∼'],
  [/\\perp\b/g, '⊥'],
  [/\\parallel\b/g, '∥'],
  [/\\triangle\b/g, '△'],
  [/\\angle\b/g, '∠'],
  [/\^\\circ|\\circ\b/g, '°'],
  [/\\int\b/g, '∫'],
  [/\\sum\b/g, '∑'],
  [/\\prod\b/g, '∏'],
  [/\\partial\b/g, '∂'],
  [/\\nabla\b/g, '∇'],
  [/\\ker\b/g, 'ker '],
  [/\\im\b/g, 'Im '],
  [/\\lim\b/g, 'lim'],
  [/\\sin\b/g, 'sin'],
  [/\\cos\b/g, 'cos'],
  [/\\tan\b/g, 'tan'],
  [/\\cot\b/g, 'cot'],
  [/\\ln\b/g, 'ln'],
  [/\\log\b/g, 'log'],
  [/\\alpha\b/g, 'α'],
  [/\\beta\b/g, 'β'],
  [/\\gamma\b/g, 'γ'],
  [/\\Gamma\b/g, 'Γ'],
  [/\\delta\b/g, 'δ'],
  [/\\Delta\b/g, 'Δ'],
  [/\\varepsilon\b|\\epsilon\b/g, 'ε'],
  [/\\zeta\b/g, 'ζ'],
  [/\\eta\b/g, 'η'],
  [/\\theta\b/g, 'θ'],
  [/\\Theta\b/g, 'Θ'],
  [/\\lambda\b/g, 'λ'],
  [/\\Lambda\b/g, 'Λ'],
  [/\\mu\b/g, 'μ'],
  [/\\pi\b/g, 'π'],
  [/\\Pi\b/g, 'Π'],
  [/\\rho\b/g, 'ρ'],
  [/\\sigma\b/g, 'σ'],
  [/\\Sigma\b/g, 'Σ'],
  [/\\tau\b/g, 'τ'],
  [/\\varphi\b|\\phi\b/g, 'φ'],
  [/\\Phi\b/g, 'Φ'],
  [/\\psi\b/g, 'ψ'],
  [/\\omega\b/g, 'ω'],
  [/\\Omega\b/g, 'Ω'],
  [/\\dots\b|\\ldots\b|\\cdots\b/g, '…'],
  [/\\,|\\;|\\quad\b|\\qquad\b/g, ' '],
  [/\\left|\\right/g, ''],
];

function extractBracedGroup(
  src: string,
  openIdx: number,
): { content: string; nextIdx: number } | null {
  if (src[openIdx] !== '{') return null;
  let depth = 0;
  for (let i = openIdx; i < src.length; i += 1) {
    const ch = src[i];
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) {
        return { content: src.slice(openIdx + 1, i), nextIdx: i + 1 };
      }
    }
  }
  return { content: src.slice(openIdx + 1), nextIdx: src.length };
}

/**
 * Chuyển chuỗi LaTeX sang chuỗi ký hiệu toán học Unicode sạch đẹp (phục vụ kiểm thử & fallback một dòng).
 */
export function formatLatexToReadableMath(raw: string): string {
  let out = raw.trim();
  if (out.startsWith('$$') && out.endsWith('$$') && out.length > 4) {
    out = out.slice(2, -2).trim();
  } else if (out.startsWith('$') && out.endsWith('$') && out.length > 2) {
    out = out.slice(1, -1).trim();
  } else {
    out = out.replace(/\$\$([\s\S]+?)\$\$/g, '$1').replace(/\$([^$\n]+?)\$/g, '$1');
  }

  out = out.replace(/\\begin\{cases\}([\s\S]*?)\\end\{cases\}/g, (_m, body: string) =>
    body
      .split(/\\\\/)
      .map((r) => `{ ${r.replace(/&/g, '  ').trim()}`)
      .join('\n'),
  );
  out = out.replace(
    /\\begin\{(?:p|b|v)?matrix\}([\s\S]*?)\\end\{(?:p|b|v)?matrix\}/g,
    (_m, body: string) =>
      body
        .split(/\\\\/)
        .map((r) => `[ ${r.replace(/&/g, '   ').trim()} ]`)
        .join('\n'),
  );

  for (const [pattern, replacement] of LATEX_SYMBOL_MAP) {
    out = out.replace(pattern, replacement);
  }

  // Biểu diễn fallback ngắn gọn cho phân số / căn / vectơ trong chuỗi thuần văn bản
  out = out.replace(/\\(?:d|t)?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
  out = out.replace(/\\sqrt\[([^{}\]]*)\]\{([^{}]*)\}/g, 'ⁿ√($2)');
  out = out.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)');
  out = out.replace(/\\(?:overrightarrow|vec)\{([^{}]*)\}/g, '$1⃗');
  out = out.replace(/\\widehat\{([^{}]*)\}/g, '∠$1');

  return out;
}

type MathCanvasToken =
  | { readonly kind: 'text'; readonly value: string }
  | { readonly kind: 'frac'; readonly num: string; readonly den: string }
  | { readonly kind: 'sqrt'; readonly index?: string; readonly body: string }
  | { readonly kind: 'vec'; readonly body: string }
  | { readonly kind: 'hat'; readonly body: string }
  | { readonly kind: 'sup'; readonly body: string }
  | { readonly kind: 'sub'; readonly body: string };

function tokenizeMathLine(line: string): readonly MathCanvasToken[] {
  let normalized = line;
  for (const [pattern, replacement] of LATEX_SYMBOL_MAP) {
    normalized = normalized.replace(pattern, replacement);
  }

  const tokens: MathCanvasToken[] = [];
  let buf = '';
  let i = 0;

  const flushBuf = () => {
    if (buf) {
      tokens.push({ kind: 'text', value: buf });
      buf = '';
    }
  };

  while (i < normalized.length) {
    const rest = normalized.slice(i);

    // \frac{num}{den} hoặc \dfrac{num}{den}
    const fracMatch = rest.match(/^\\(?:d|t)?frac\s*/);
    if (fracMatch) {
      const g1Start = i + fracMatch[0].length;
      const g1 = extractBracedGroup(normalized, g1Start);
      if (g1) {
        let g2Start = g1.nextIdx;
        while (g2Start < normalized.length && normalized[g2Start] === ' ') g2Start += 1;
        const g2 = extractBracedGroup(normalized, g2Start);
        if (g2) {
          flushBuf();
          tokens.push({ kind: 'frac', num: g1.content, den: g2.content });
          i = g2.nextIdx;
          continue;
        }
      }
    }

    // \sqrt[n]{body} hoặc \sqrt{body}
    if (rest.startsWith('\\sqrt')) {
      let cursor = i + 5;
      let rootIdx: string | undefined;
      if (normalized[cursor] === '[') {
        const closeBracket = normalized.indexOf(']', cursor + 1);
        if (closeBracket !== -1) {
          rootIdx = normalized.slice(cursor + 1, closeBracket);
          cursor = closeBracket + 1;
        }
      }
      const grp = extractBracedGroup(normalized, cursor);
      if (grp) {
        flushBuf();
        tokens.push({ kind: 'sqrt', index: rootIdx, body: grp.content });
        i = grp.nextIdx;
        continue;
      }
    }

    // \overrightarrow{AB} hoặc \vec{u}
    const vecMatch = rest.match(/^\\(?:overrightarrow|vec)\s*/);
    if (vecMatch) {
      const grp = extractBracedGroup(normalized, i + vecMatch[0].length);
      if (grp) {
        flushBuf();
        tokens.push({ kind: 'vec', body: grp.content });
        i = grp.nextIdx;
        continue;
      }
    }

    // \widehat{ABC}
    const hatMatch = rest.match(/^\\widehat\s*/);
    if (hatMatch) {
      const grp = extractBracedGroup(normalized, i + hatMatch[0].length);
      if (grp) {
        flushBuf();
        tokens.push({ kind: 'hat', body: grp.content });
        i = grp.nextIdx;
        continue;
      }
    }

    // Mũ ^{...} hoặc ^x, chỉ số dưới _{...} hoặc _x
    if ((normalized[i] === '^' || normalized[i] === '_') && i + 1 < normalized.length) {
      const isSup = normalized[i] === '^';
      flushBuf();
      if (normalized[i + 1] === '{') {
        const grp = extractBracedGroup(normalized, i + 1);
        if (grp) {
          tokens.push({ kind: isSup ? 'sup' : 'sub', body: grp.content });
          i = grp.nextIdx;
          continue;
        }
      }
      tokens.push({ kind: isSup ? 'sup' : 'sub', body: normalized[i + 1]! });
      i += 2;
      continue;
    }

    if (normalized[i] === '{' || normalized[i] === '}') {
      i += 1;
      continue;
    }

    buf += normalized[i]!;
    i += 1;
  }

  flushBuf();
  return tokens;
}

function setMathFont(ctx: CanvasRenderingContext2D, fontSize: number, isMath: boolean): void {
  ctx.font = isMath
    ? `italic 600 ${Math.max(9, Math.round(fontSize))}px "Times New Roman", Georgia, serif`
    : `500 ${Math.max(9, Math.round(fontSize))}px "Be Vietnam Pro", system-ui, sans-serif`;
}

function measureMathTokensWidth(
  ctx: CanvasRenderingContext2D,
  tokens: readonly MathCanvasToken[],
  fontSize: number,
  isMath: boolean,
): number {
  let total = 0;
  for (const tok of tokens) {
    if (tok.kind === 'text') {
      setMathFont(ctx, fontSize, isMath);
      total += ctx.measureText(tok.value).width;
    } else if (tok.kind === 'sup' || tok.kind === 'sub') {
      const subTokens = tokenizeMathLine(tok.body);
      total += measureMathTokensWidth(ctx, subTokens, fontSize * 0.72, true) + 1;
    } else if (tok.kind === 'frac') {
      const numW = measureMathTokensWidth(ctx, tokenizeMathLine(tok.num), fontSize * 0.82, true);
      const denW = measureMathTokensWidth(ctx, tokenizeMathLine(tok.den), fontSize * 0.82, true);
      total += Math.max(numW, denW) + 8;
    } else if (tok.kind === 'sqrt') {
      const bodyW = measureMathTokensWidth(ctx, tokenizeMathLine(tok.body), fontSize * 0.94, true);
      total += bodyW + fontSize * 0.65 + 4;
    } else if (tok.kind === 'vec' || tok.kind === 'hat') {
      const bodyW = measureMathTokensWidth(ctx, tokenizeMathLine(tok.body), fontSize, true);
      total += bodyW + 3;
    }
  }
  return total;
}

function drawMathTokensAt(
  ctx: CanvasRenderingContext2D,
  tokens: readonly MathCanvasToken[],
  startX: number,
  baselineY: number,
  fontSize: number,
  isMath: boolean,
  color: string,
): number {
  let cursorX = startX;
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  for (const tok of tokens) {
    if (tok.kind === 'text') {
      setMathFont(ctx, fontSize, isMath);
      ctx.fillText(tok.value, cursorX, baselineY);
      cursorX += ctx.measureText(tok.value).width;
      continue;
    }

    if (tok.kind === 'sup') {
      const subSize = fontSize * 0.72;
      const subTokens = tokenizeMathLine(tok.body);
      cursorX = drawMathTokensAt(
        ctx,
        subTokens,
        cursorX,
        baselineY - fontSize * 0.38,
        subSize,
        true,
        color,
      );
      cursorX += 1;
      continue;
    }

    if (tok.kind === 'sub') {
      const subSize = fontSize * 0.72;
      const subTokens = tokenizeMathLine(tok.body);
      cursorX = drawMathTokensAt(
        ctx,
        subTokens,
        cursorX,
        baselineY + fontSize * 0.24,
        subSize,
        true,
        color,
      );
      cursorX += 1;
      continue;
    }

    if (tok.kind === 'frac') {
      const childSize = fontSize * 0.82;
      const numTokens = tokenizeMathLine(tok.num);
      const denTokens = tokenizeMathLine(tok.den);
      const numW = measureMathTokensWidth(ctx, numTokens, childSize, true);
      const denW = measureMathTokensWidth(ctx, denTokens, childSize, true);
      const barW = Math.max(numW, denW) + 6;
      const barY = baselineY - fontSize * 0.3;

      drawMathTokensAt(
        ctx,
        numTokens,
        cursorX + 1 + (barW - numW) / 2,
        barY - 4,
        childSize,
        true,
        color,
      );
      ctx.save();
      ctx.lineWidth = Math.max(1.1, fontSize * 0.065);
      ctx.beginPath();
      ctx.moveTo(cursorX + 1, barY);
      ctx.lineTo(cursorX + 1 + barW, barY);
      ctx.stroke();
      ctx.restore();

      drawMathTokensAt(
        ctx,
        denTokens,
        cursorX + 1 + (barW - denW) / 2,
        barY + childSize * 0.92 + 2,
        childSize,
        true,
        color,
      );
      cursorX += barW + 3;
      continue;
    }

    if (tok.kind === 'sqrt') {
      const bodySize = fontSize * 0.94;
      const bodyTokens = tokenizeMathLine(tok.body);
      const bodyW = measureMathTokensWidth(ctx, bodyTokens, bodySize, true);
      const radW = fontSize * 0.56;
      const topY = baselineY - fontSize * 0.84;

      if (tok.index) {
        setMathFont(ctx, fontSize * 0.55, true);
        ctx.fillText(tok.index, cursorX, baselineY - fontSize * 0.45);
      }

      ctx.save();
      ctx.lineWidth = Math.max(1.15, fontSize * 0.065);
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cursorX + 1, baselineY - fontSize * 0.32);
      ctx.lineTo(cursorX + radW * 0.42, baselineY + 1);
      ctx.lineTo(cursorX + radW, topY);
      ctx.lineTo(cursorX + radW + bodyW + 3, topY);
      ctx.stroke();
      ctx.restore();

      drawMathTokensAt(ctx, bodyTokens, cursorX + radW + 1.5, baselineY, bodySize, true, color);
      cursorX += radW + bodyW + 4;
      continue;
    }

    if (tok.kind === 'vec') {
      const bodyTokens = tokenizeMathLine(tok.body);
      const bodyW = measureMathTokensWidth(ctx, bodyTokens, fontSize, true);
      const arrowY = baselineY - fontSize * 0.86;
      drawMathTokensAt(ctx, bodyTokens, cursorX + 1, baselineY, fontSize, true, color);
      ctx.save();
      ctx.lineWidth = Math.max(1.1, fontSize * 0.06);
      ctx.beginPath();
      ctx.moveTo(cursorX + 1, arrowY);
      ctx.lineTo(cursorX + 1 + bodyW, arrowY);
      ctx.lineTo(cursorX + 1 + bodyW - 4, arrowY - 2.6);
      ctx.moveTo(cursorX + 1 + bodyW, arrowY);
      ctx.lineTo(cursorX + 1 + bodyW - 4, arrowY + 2.6);
      ctx.stroke();
      ctx.restore();
      cursorX += bodyW + 3;
      continue;
    }

    if (tok.kind === 'hat') {
      const bodyTokens = tokenizeMathLine(tok.body);
      const bodyW = measureMathTokensWidth(ctx, bodyTokens, fontSize, true);
      const hatTopY = baselineY - fontSize * 0.96;
      const hatBaseY = baselineY - fontSize * 0.76;
      drawMathTokensAt(ctx, bodyTokens, cursorX + 1, baselineY, fontSize, true, color);
      ctx.save();
      ctx.lineWidth = Math.max(1.1, fontSize * 0.06);
      ctx.beginPath();
      ctx.moveTo(cursorX + 1, hatBaseY);
      ctx.lineTo(cursorX + 1 + bodyW / 2, hatTopY);
      ctx.lineTo(cursorX + 1 + bodyW, hatBaseY);
      ctx.stroke();
      ctx.restore();
      cursorX += bodyW + 3;
    }
  }

  return cursorX;
}

/**
 * Vẽ một mục công thức / nhãn văn bản toán học trực tiếp lên Canvas 2D
 * (hỗ trợ phân số chồng tầng, căn thức, chỉ số trên/dưới, mũi tên vectơ, hệ phương trình ngoặc nhọn).
 */
export function drawFormattedMathTextOnCanvas(
  ctx: CanvasRenderingContext2D,
  textItem: InkTextItem,
): void {
  ctx.save();
  let raw = textItem.text.trim();
  if (!raw) {
    ctx.restore();
    return;
  }

  const autoMath =
    textItem.isMath ||
    raw.includes('$') ||
    /\\(?:frac|dfrac|sqrt|int|sum|lim|overrightarrow|vec|begin|forall|exists|implies|iff)/.test(
      raw,
    );

  if (raw.startsWith('$$') && raw.endsWith('$$') && raw.length > 4) {
    raw = raw.slice(2, -2).trim();
  } else if (raw.startsWith('$') && raw.endsWith('$') && raw.length > 2) {
    raw = raw.slice(1, -1).trim();
  } else {
    raw = raw.replace(/\$\$([\s\S]+?)\$\$/g, '$1').replace(/\$([^$\n]+?)\$/g, '$1');
  }

  // Xử lý khối hệ phương trình \begin{cases} ... \end{cases} với dấu ngoặc nhọn cao
  const casesMatch = raw.match(/^(.*?)\\begin\{cases\}([\s\S]*?)\\end\{cases\}(.*)$/);
  if (casesMatch) {
    const prefix = casesMatch[1]?.trim() ?? '';
    const casesBody = casesMatch[2] ?? '';
    const rows = casesBody
      .split(/\\\\|\n/)
      .map((r) => r.replace(/&/g, '   ').trim())
      .filter(Boolean);
    const lineStep = textItem.fontSize * 1.48;
    const totalH = Math.max(textItem.fontSize, rows.length * lineStep);
    let startX = textItem.x;
    const centerY = textItem.y + ((rows.length - 1) * lineStep) / 2 - textItem.fontSize * 0.28;

    if (prefix) {
      startX =
        drawMathTokensAt(
          ctx,
          tokenizeMathLine(prefix),
          startX,
          centerY + textItem.fontSize * 0.28,
          textItem.fontSize,
          true,
          textItem.color,
        ) + 6;
    }

    // Dấu ngoặc nhọn hệ phương trình
    const topY = centerY - totalH / 2 + 2;
    const botY = centerY + totalH / 2 - 2;
    const braceW = Math.max(7, textItem.fontSize * 0.38);
    ctx.strokeStyle = textItem.color;
    ctx.lineWidth = Math.max(1.3, textItem.fontSize * 0.07);
    ctx.beginPath();
    ctx.moveTo(startX + braceW, topY);
    ctx.quadraticCurveTo(startX + braceW * 0.35, topY, startX + braceW * 0.35, topY + 6);
    ctx.lineTo(startX + braceW * 0.35, centerY - 4);
    ctx.lineTo(startX, centerY);
    ctx.lineTo(startX + braceW * 0.35, centerY + 4);
    ctx.lineTo(startX + braceW * 0.35, botY - 6);
    ctx.quadraticCurveTo(startX + braceW * 0.35, botY, startX + braceW, botY);
    ctx.stroke();

    rows.forEach((row, idx) => {
      drawMathTokensAt(
        ctx,
        tokenizeMathLine(row),
        startX + braceW + 5,
        textItem.y + idx * lineStep,
        textItem.fontSize * 0.94,
        true,
        textItem.color,
      );
    });
    ctx.restore();
    return;
  }

  // Ma trận cơ bản
  const expanded = raw.replace(
    /\\begin\{(?:p|b|v)?matrix\}([\s\S]*?)\\end\{(?:p|b|v)?matrix\}/g,
    (_m, body: string) =>
      body
        .split(/\\\\/)
        .map((r) => `( ${r.replace(/&/g, '   ').trim()} )`)
        .join('\n'),
  );

  const lines = expanded.split('\n');
  const hasTallFraction = /\\(?:d|t)?frac/.test(expanded);
  const lineStep = textItem.fontSize * (hasTallFraction ? 2.05 : 1.42);
  lines.forEach((line, idx) => {
    const tokens = tokenizeMathLine(line);
    drawMathTokensAt(
      ctx,
      tokens,
      textItem.x,
      textItem.y + idx * lineStep,
      textItem.fontSize,
      autoMath,
      textItem.color,
    );
  });

  ctx.restore();
}

function drawWorksheetBackground(
  ctx: CanvasRenderingContext2D,
  bg: InkWorksheetBackground,
  img: HTMLImageElement | undefined,
  pageW: number,
  pageH: number,
): void {
  if (!img || !img.complete || img.naturalWidth <= 0 || img.naturalHeight <= 0) return;

  const padX = 28;
  const padY = 28;
  const availW = Math.max(120, pageW - padX * 2);
  const availH =
    bg.fitMode === 'top-half'
      ? Math.max(120, pageH * 0.48 - padY)
      : Math.max(120, pageH - padY * 2);

  let drawW = availW;
  let drawH = (img.naturalHeight / img.naturalWidth) * drawW;

  if (bg.fitMode !== 'full-width' && drawH > availH) {
    drawH = availH;
    drawW = (img.naturalWidth / img.naturalHeight) * drawH;
  }

  const drawX = (pageW - drawW) / 2;
  const drawY = bg.fitMode === 'top-half' ? padY : (pageH - drawH) / 2;

  ctx.save();
  ctx.globalAlpha = Math.max(0.15, Math.min(1, bg.opacity));
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
}

/**
 * Kết xuất toàn bộ 1 trang sổ toán học lên Canvas 2D.
 */
export function renderInkPageToCanvas(
  ctx: CanvasRenderingContext2D,
  opts: PageRenderOptions,
): void {
  const { width, height, paper, page } = opts;
  const darkPaper = isDarkHex(paper.backgroundColor);

  drawPaperBackground(ctx, width, height, paper);

  // 0. Lớp nền phiếu bài tập / đề bài khóa cố định (nằm dưới mọi nét bút & hình vẽ)
  if (page.worksheetBackground) {
    drawWorksheetBackground(
      ctx,
      page.worksheetBackground,
      opts.imageCache?.get(page.worksheetBackground.id),
      width,
      height,
    );
  }

  // 1. Ảnh đính kèm
  for (const imgItem of page.images) {
    const cached = opts.imageCache?.get(imgItem.id);
    if (cached && cached.complete && cached.naturalWidth > 0) {
      ctx.drawImage(cached, imgItem.x, imgItem.y, imgItem.width, imgItem.height);
    }
  }

  // 2. Đồ thị hàm số
  for (const graph of page.graphs) {
    renderFunctionGraphOnCanvas(ctx, graph, darkPaper);
  }

  // 2b. Bảng biến thiên & Bảng xét dấu
  for (const table of page.variationTables ?? []) {
    renderVariationTableOnCanvas(ctx, table, darkPaper);
  }

  // 3. Hình không gian 3D
  for (const solid of page.solids3d) {
    renderSolid3DOnCanvas(ctx, solid);
  }

  // 4. Hình học 2D & đường thẳng / mũi tên
  for (const shape of page.shapes) {
    drawInkShape(ctx, shape);
  }

  // 4b. Con dấu ký hiệu Hình học phẳng (Góc vuông, Vạch bằng nhau, Cung góc, Song song, Điểm)
  for (const stamp of page.stamps ?? []) {
    renderGeometryStampOnCanvas(ctx, stamp);
    if (opts.selectedIds?.has(stamp.id)) {
      ctx.save();
      ctx.strokeStyle = '#1D4ED8';
      ctx.lineWidth = 1.25;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(stamp.x, stamp.y, Math.max(18, stamp.size * 0.62), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 4c. Lớp Hình học động GeoGebra (Điểm, Tỉ lệ, Trung điểm, Giao điểm, Vuông góc/Song song, Đường tròn, Elip, Đa giác/Mặt phẳng)
  if ((page.geoObjects && page.geoObjects.length > 0) || opts.geoOverlay?.hoveredHit) {
    const geoScene = evaluateGeoScene(page.geoObjects);
    renderGeoSceneOnCanvas(ctx, geoScene, width, height, opts.geoOverlay);
  }

  // 5. Các nét mực viết tay (dạ quang vẽ trước để không che chữ mực đậm)
  for (const stroke of page.strokes) {
    if (stroke.penKind === 'highlighter') drawInkStroke(ctx, stroke);
  }
  for (const stroke of page.strokes) {
    if (stroke.penKind !== 'highlighter') drawInkStroke(ctx, stroke);
  }

  // 6. Ghi chú chữ / công thức toán định dạng đẹp trên canvas (khi xuất PNG, PDF hoặc ghi hình bài giảng)
  if (!opts.skipScreenMathTexts) {
    for (const textItem of page.texts) {
      drawFormattedMathTextOnCanvas(ctx, textItem);
    }
  }

  // 7. Nét đang vẽ & hình đang kéo xem trước
  if (opts.activeStroke) {
    drawInkStroke(ctx, opts.activeStroke);
  }
  if (opts.previewShape) {
    drawInkShape(ctx, opts.previewShape);
  }

  // 8. Vùng chọn chữ nhật / Lasso / Thanh Page Spacer
  if (opts.selectionRect) {
    ctx.save();
    ctx.strokeStyle = '#1D4ED8';
    ctx.fillStyle = 'rgba(29, 78, 216, 0.08)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([6, 4]);
    ctx.fillRect(
      opts.selectionRect.x,
      opts.selectionRect.y,
      opts.selectionRect.w,
      opts.selectionRect.h,
    );
    ctx.strokeRect(
      opts.selectionRect.x,
      opts.selectionRect.y,
      opts.selectionRect.w,
      opts.selectionRect.h,
    );
    ctx.restore();
  }

  if (opts.lassoPoints && opts.lassoPoints.length > 1) {
    ctx.save();
    ctx.strokeStyle = '#1D4ED8';
    ctx.fillStyle = 'rgba(29, 78, 216, 0.08)';
    ctx.lineWidth = 1.4;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(opts.lassoPoints[0]!.x, opts.lassoPoints[0]!.y);
    for (let i = 1; i < opts.lassoPoints.length; i += 1) {
      ctx.lineTo(opts.lassoPoints[i]!.x, opts.lassoPoints[i]!.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  if (typeof opts.spacerLineY === 'number') {
    ctx.save();
    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.moveTo(0, opts.spacerLineY);
    ctx.lineTo(width, opts.spacerLineY);
    ctx.stroke();
    ctx.restore();
  }
}
