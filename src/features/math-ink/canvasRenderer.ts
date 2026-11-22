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
  PaperConfig,
} from './types';

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

  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0]!.x, pts[0]!.y, Math.max(1, stroke.width / 2), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }

  // Bút máy thư pháp (Fountain): biến thiên độ dày mượt theo áp lực / tốc độ nét
  if (stroke.penKind === 'fountain' && pts.length > 2) {
    for (let i = 1; i < pts.length; i += 1) {
      const prev = pts[i - 1]!;
      const cur = pts[i]!;
      const dist = Math.hypot(cur.x - prev.x, cur.y - prev.y);
      const pressure = cur.pressure && cur.pressure > 0 ? cur.pressure : 0.5;
      const speedFactor = Math.max(0.62, Math.min(1.22, 1.15 - dist * 0.015));
      const dynamicWidth = Math.max(1, stroke.width * (0.65 + pressure * 0.65) * speedFactor);

      ctx.lineWidth = dynamicWidth;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  // Nét mực mịn bằng đường cong bậc hai qua trung điểm (quadratic Bezier)
  ctx.lineWidth = stroke.width;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);

  for (let i = 1; i < pts.length - 1; i += 1) {
    const cur = pts[i]!;
    const next = pts[i + 1]!;
    const midX = (cur.x + next.x) / 2;
    const midY = (cur.y + next.y) / 2;
    ctx.quadraticCurveTo(cur.x, cur.y, midX, midY);
  }
  const last = pts[pts.length - 1]!;
  ctx.lineTo(last.x, last.y);
  ctx.stroke();

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

  // 3. Hình không gian 3D
  for (const solid of page.solids3d) {
    renderSolid3DOnCanvas(ctx, solid);
  }

  // 4. Hình học 2D & đường thẳng / mũi tên
  for (const shape of page.shapes) {
    drawInkShape(ctx, shape);
  }

  // 5. Các nét mực viết tay (dạ quang vẽ trước để không che chữ mực đậm)
  for (const stroke of page.strokes) {
    if (stroke.penKind === 'highlighter') drawInkStroke(ctx, stroke);
  }
  for (const stroke of page.strokes) {
    if (stroke.penKind !== 'highlighter') drawInkStroke(ctx, stroke);
  }

  // 6. Ghi chú chữ / nhãn trên canvas (phục vụ xuất PNG & xem nhanh)
  for (const textItem of page.texts) {
    ctx.save();
    ctx.fillStyle = textItem.color;
    ctx.font = textItem.isMath
      ? `italic 600 ${textItem.fontSize}px "Times New Roman", Georgia, serif`
      : `500 ${textItem.fontSize}px "Be Vietnam Pro", system-ui, sans-serif`;
    const lines = textItem.text.split('\n');
    lines.forEach((line, idx) => {
      ctx.fillText(line, textItem.x, textItem.y + idx * (textItem.fontSize * 1.35));
    });
    ctx.restore();
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
