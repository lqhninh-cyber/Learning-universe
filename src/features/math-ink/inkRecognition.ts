import type { InkPoint, InkRecognitionMode, InkShapeItem, InkStroke, ShapeToolKind } from './types';

export interface RecognizedShapeResult {
  readonly kind: ShapeToolKind;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
}

/**
 * Nhận diện tự động nét vẽ tay thành đoạn thẳng hoặc hình học chuẩn (giống Scrble Ink:
 * Ink to Line / Ink to Shape / Ink to Shape and Line).
 */
export function recognizeInkGesture(
  points: readonly InkPoint[],
  mode: InkRecognitionMode,
): RecognizedShapeResult | null {
  if (mode === 'ink' || points.length < 4) return null;

  const first = points[0]!;
  const last = points[points.length - 1]!;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let pathLength = 0;

  for (let i = 0; i < points.length; i += 1) {
    const p = points[i]!;
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    if (i > 0) {
      const prev = points[i - 1]!;
      pathLength += Math.hypot(p.x - prev.x, p.y - prev.y);
    }
  }

  const bboxW = maxX - minX;
  const bboxH = maxY - minY;
  const diag = Math.hypot(bboxW, bboxH);
  if (diag < 18 || pathLength < 18) return null;

  const chordLen = Math.hypot(last.x - first.x, last.y - first.y);

  // 1. Nhận diện ĐOẠN THẲNG (khi tỉ lệ chiều dài nét / khoảng cách 2 đầu gần 1)
  if (mode === 'line' || mode === 'shape-and-line') {
    const straightness = chordLen / pathLength;
    if (straightness > 0.9) {
      // Hút góc nhẹ về ngang / dọc / 45° nếu rất gần
      let x2 = last.x;
      let y2 = last.y;
      const dx = last.x - first.x;
      const dy = last.y - first.y;
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const snappedDeg = Math.round(deg / 45) * 45;
      if (Math.abs(deg - snappedDeg) < 6.5) {
        const rad = (snappedDeg * Math.PI) / 180;
        x2 = first.x + Math.cos(rad) * chordLen;
        y2 = first.y + Math.sin(rad) * chordLen;
      }
      return {
        kind: 'line',
        x1: first.x,
        y1: first.y,
        x2,
        y2,
      };
    }
  }

  // 2. Nhận diện HÌNH KHÉP KÍN (Đường tròn, Elip, Hình chữ nhật, Tam giác)
  if (mode === 'shape' || mode === 'shape-and-line') {
    const closureRatio = chordLen / diag;
    if (closureRatio > 0.42) return null;

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = Math.max(1, bboxW / 2);
    const ry = Math.max(1, bboxH / 2);

    // Đánh giá độ khớp đường tròn / elip bằng phương sai bán kính chuẩn hóa
    let sumNormDist = 0;
    const normDists: number[] = [];
    for (const p of points) {
      const nd = Math.hypot((p.x - cx) / rx, (p.y - cy) / ry);
      normDists.push(nd);
      sumNormDist += nd;
    }
    const meanNd = sumNormDist / normDists.length;
    let variance = 0;
    for (const nd of normDists) {
      variance += (nd - meanNd) ** 2;
    }
    const stdDev = Math.sqrt(variance / normDists.length);

    if (stdDev < 0.16 && Math.abs(meanNd - 1) < 0.2) {
      const aspect = Math.max(rx, ry) / Math.min(rx, ry);
      if (aspect < 1.24) {
        const r = (rx + ry) / 2;
        return {
          kind: 'circle',
          x1: cx - r,
          y1: cy - r,
          x2: cx + r,
          y2: cy + r,
        };
      }
      return {
        kind: 'ellipse',
        x1: minX,
        y1: minY,
        x2: maxX,
        y2: maxY,
      };
    }

    // Phân biệt Tam giác vs Hình chữ nhật dựa trên diện tích bao đóng (Shoelace formula)
    let area2 = 0;
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i]!;
      const b = points[(i + 1) % points.length]!;
      area2 += a.x * b.y - b.x * a.y;
    }
    const polyArea = Math.abs(area2) / 2;
    const rectArea = Math.max(1, bboxW * bboxH);
    const fillRatio = polyArea / rectArea;

    if (fillRatio >= 0.34 && fillRatio <= 0.62) {
      return {
        kind: 'triangle',
        x1: minX,
        y1: minY,
        x2: maxX,
        y2: maxY,
      };
    }

    if (fillRatio > 0.62) {
      return {
        kind: 'rect',
        x1: minX,
        y1: minY,
        x2: maxX,
        y2: maxY,
      };
    }
  }

  return null;
}

/**
 * Khoảng cách nhỏ nhất từ 1 điểm (px, py) tới đoạn thẳng AB
 */
export function pointToSegmentDistance(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) return Math.hypot(px - ax, py - ay);
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function doesCircleHitStroke(
  stroke: InkStroke,
  cx: number,
  cy: number,
  radius: number,
): boolean {
  const threshold = radius + stroke.width * 0.6;
  const pts = stroke.points;
  if (pts.length === 1) {
    return Math.hypot(pts[0]!.x - cx, pts[0]!.y - cy) <= threshold;
  }
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1]!;
    const b = pts[i]!;
    if (pointToSegmentDistance(cx, cy, a.x, a.y, b.x, b.y) <= threshold) {
      return true;
    }
  }
  return false;
}

/**
 * Tẩy theo đoạn (Segment Eraser): tách nét mực thành các đoạn con còn lại sau khi loại bỏ các điểm nằm trong bán kính tẩy.
 */
export function eraseStrokeSegment(
  stroke: InkStroke,
  cx: number,
  cy: number,
  radius: number,
): readonly InkStroke[] {
  const threshold = radius + stroke.width * 0.4;
  const chunks: InkPoint[][] = [];
  let current: InkPoint[] = [];

  for (const pt of stroke.points) {
    const inside = Math.hypot(pt.x - cx, pt.y - cy) <= threshold;
    if (inside) {
      if (current.length >= 2) {
        chunks.push(current);
      }
      current = [];
    } else {
      current.push(pt);
    }
  }
  if (current.length >= 2) {
    chunks.push(current);
  }

  if (chunks.length === 0) return [];
  if (chunks.length === 1 && chunks[0]!.length === stroke.points.length) {
    return [stroke];
  }

  return chunks.map((pts, idx) => ({
    ...stroke,
    id: `${stroke.id}-seg-${idx}-${Date.now().toString(36)}`,
    points: pts,
  }));
}

export function isPointInPolygon(px: number, py: number, polygon: readonly InkPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i]!.x;
    const yi = polygon[i]!.y;
    const xj = polygon[j]!.x;
    const yj = polygon[j]!.y;
    const intersect = yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function doesShapeHitPoint(
  shape: InkShapeItem,
  px: number,
  py: number,
  radius: number,
): boolean {
  const minX = Math.min(shape.x1, shape.x2) - radius;
  const maxX = Math.max(shape.x1, shape.x2) + radius;
  const minY = Math.min(shape.y1, shape.y2) - radius;
  const maxY = Math.max(shape.y1, shape.y2) + radius;
  if (px < minX || px > maxX || py < minY || py > maxY) return false;

  if (
    shape.kind === 'line' ||
    shape.kind === 'dashed-line' ||
    shape.kind === 'dash-dot-line' ||
    shape.kind === 'arrow' ||
    shape.kind === 'double-arrow'
  ) {
    return (
      pointToSegmentDistance(px, py, shape.x1, shape.y1, shape.x2, shape.y2) <= radius + shape.width
    );
  }
  return true;
}

/**
 * Hút điểm con trỏ vào cạnh trên của Thước kẻ nếu đang vẽ sát cạnh thước (<= 18px)
 */
export function snapPointToRulerEdge(
  px: number,
  py: number,
  ruler: {
    readonly x: number;
    readonly y: number;
    readonly angleDeg: number;
    readonly length: number;
  },
): InkPoint | null {
  const rad = (ruler.angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  // Chuyển sang tọa độ cục bộ của thước (gốc tại tâm thước)
  const dx = px - ruler.x;
  const dy = py - ruler.y;
  const localX = dx * cos + dy * sin;
  const localY = -dx * sin + dy * cos;

  const halfLen = ruler.length / 2;
  const edgeY = -28; // Cạnh trên của thanh thước (chiều cao thước 56px)

  if (localX >= -halfLen - 16 && localX <= halfLen + 16 && Math.abs(localY - edgeY) <= 18) {
    const clampedX = Math.max(-halfLen, Math.min(halfLen, localX));
    return {
      x: ruler.x + clampedX * cos - edgeY * sin,
      y: ruler.y + clampedX * sin + edgeY * cos,
    };
  }
  return null;
}
