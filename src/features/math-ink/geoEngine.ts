import type {
  GeoConicObject,
  GeoLineObject,
  GeoObject,
  GeoPointObject,
  GeoPolygonObject,
} from './types';

export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export interface EvaluatedGeoPoint {
  readonly x: number;
  readonly y: number;
  readonly obj: GeoPointObject;
}

export interface EvaluatedGeoLine {
  readonly p1: Vec2;
  readonly p2: Vec2;
  readonly dir: Vec2;
  readonly infinite: boolean;
  readonly ray: boolean;
  readonly vector: boolean;
  readonly rightAngleAt?: {
    readonly vertex: Vec2;
    readonly dir1: Vec2;
    readonly dir2: Vec2;
  };
  /** Đường gióng nét đứt kéo dài cạnh đáy khi chân đường cao H rơi ra ngoài đoạn thẳng đáy (tam giác tù) */
  readonly baseExtension?: {
    readonly from: Vec2;
    readonly to: Vec2;
  };
  readonly obj: GeoLineObject;
}

export interface EvaluatedGeoConic {
  readonly kind: 'circle' | 'ellipse';
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly rotation: number;
  readonly obj: GeoConicObject;
}

export interface EvaluatedGeoPolygon {
  readonly vertices: readonly Vec2[];
  readonly obj: GeoPolygonObject;
}

export interface EvaluatedGeoScene {
  readonly points: ReadonlyMap<string, EvaluatedGeoPoint>;
  readonly lines: ReadonlyMap<string, EvaluatedGeoLine>;
  readonly conics: ReadonlyMap<string, EvaluatedGeoConic>;
  readonly polygons: ReadonlyMap<string, EvaluatedGeoPolygon>;
}

const NICE_FRACTIONS: readonly { readonly value: number; readonly label: string }[] = [
  { value: 0.25, label: '1/4' },
  { value: 1 / 3, label: '1/3' },
  { value: 0.5, label: '1/2' },
  { value: 2 / 3, label: '2/3' },
  { value: 0.75, label: '3/4' },
];

/** Hút nhẹ tỉ số chia đoạn về các phân số toán học quen thuộc (1/4, 1/3, 1/2, 2/3, 3/4) */
export function snapRatioToNiceFraction(rawT: number): {
  readonly t: number;
  readonly label: string;
  readonly snapped: boolean;
} {
  const clamped = Math.max(0.03, Math.min(0.97, rawT));
  for (const frac of NICE_FRACTIONS) {
    if (Math.abs(clamped - frac.value) <= 0.025) {
      return { t: frac.value, label: frac.label, snapped: true };
    }
  }
  return { t: Number(clamped.toFixed(3)), label: clamped.toFixed(2), snapped: false };
}

/** Định dạng hiển thị gọn cho tỉ số chia đoạn (VD: 1/3, 2/3, 1/2 hoặc 0.42) */
export function formatRatioLabel(t: number): string {
  for (const frac of NICE_FRACTIONS) {
    if (Math.abs(t - frac.value) <= 0.012) return frac.label;
  }
  return t.toFixed(2);
}

/** Phân tích chuỗi tỉ số do người dùng nhập (VD: "1/3", "2/5", "0.35", "40%") */
export function parseRatioInput(raw: string): number | null {
  const clean = raw.trim().replace(',', '.');
  if (!clean) return null;
  if (clean.endsWith('%')) {
    const pct = Number.parseFloat(clean.slice(0, -1));
    if (Number.isFinite(pct) && pct > 1 && pct < 99) {
      return pct / 100;
    }
    return null;
  }
  if (clean.includes('/')) {
    const parts = clean.split('/');
    if (parts.length !== 2) return null;
    const num = Number.parseFloat(parts[0]!);
    const den = Number.parseFloat(parts[1]!);
    if (Number.isFinite(num) && Number.isFinite(den) && den > 0) {
      const val = num / den;
      if (val >= 0.02 && val <= 0.98) return val;
    }
    return null;
  }
  const num = Number.parseFloat(clean);
  if (Number.isFinite(num) && num >= 0.02 && num <= 0.98) {
    return num;
  }
  return null;
}

const DEFAULT_POINT_ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
] as const;

export function nextGeoPointLabel(
  objects: readonly GeoObject[],
  preferredOrder?: readonly string[],
): string {
  const used = new Set<string>();
  for (const obj of objects) {
    if (obj.kind === 'geo-point' && obj.label.trim()) {
      used.add(obj.label.trim());
    }
  }
  const pool = preferredOrder
    ? [...preferredOrder, ...DEFAULT_POINT_ALPHABET]
    : [...DEFAULT_POINT_ALPHABET];
  for (const ch of pool) {
    if (!used.has(ch)) return ch;
  }
  let idx = 1;
  while (used.has(`A${idx}`)) idx += 1;
  return `A${idx}`;
}

function normalize2(dx: number, dy: number): Vec2 {
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return { x: 1, y: 0 };
  return { x: dx / len, y: dy / len };
}

function projectPointOntoLine(
  p: Vec2,
  a: Vec2,
  b: Vec2,
): { readonly foot: Vec2; readonly t: number } {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const lenSq = abx * abx + aby * aby;
  if (lenSq < 1e-6) return { foot: a, t: 0 };
  const t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / lenSq;
  return {
    foot: { x: a.x + abx * t, y: a.y + aby * t },
    t,
  };
}

function intersectLines(l1: EvaluatedGeoLine, l2: EvaluatedGeoLine): Vec2 | null {
  const x1 = l1.p1.x;
  const y1 = l1.p1.y;
  const x2 = l1.p2.x;
  const y2 = l1.p2.y;
  const x3 = l2.p1.x;
  const y3 = l2.p1.y;
  const x4 = l2.p2.x;
  const y4 = l2.p2.y;
  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(denom) < 1e-6) return null;
  const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
  const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
  return { x: px, y: py };
}

function intersectLineCircle(line: EvaluatedGeoLine, circle: EvaluatedGeoConic): Vec2[] {
  const dx = line.dir.x;
  const dy = line.dir.y;
  const fx = line.p1.x - circle.cx;
  const fy = line.p1.y - circle.cy;
  const r = circle.rx;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  const disc = b * b - 4 * c;
  if (disc < -1e-4) return [];
  const sqrtD = Math.sqrt(Math.max(0, disc));
  const t1 = (-b - sqrtD) / 2;
  const t2 = (-b + sqrtD) / 2;
  const res: Vec2[] = [{ x: line.p1.x + dx * t1, y: line.p1.y + dy * t1 }];
  if (sqrtD > 1e-3) {
    res.push({ x: line.p1.x + dx * t2, y: line.p1.y + dy * t2 });
  }
  return res;
}

function intersectCircles(c1: EvaluatedGeoConic, c2: EvaluatedGeoConic): Vec2[] {
  const dx = c2.cx - c1.cx;
  const dy = c2.cy - c1.cy;
  const d = Math.hypot(dx, dy);
  const r1 = c1.rx;
  const r2 = c2.rx;
  if (d < 1e-5 || d > r1 + r2 + 1e-4 || d < Math.abs(r1 - r2) - 1e-4) return [];
  const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
  const hSq = Math.max(0, r1 * r1 - a * a);
  const h = Math.sqrt(hSq);
  const xm = c1.cx + (a * dx) / d;
  const ym = c1.cy + (a * dy) / d;
  const rx = (-dy * h) / d;
  const ry = (dx * h) / d;
  const res: Vec2[] = [{ x: xm + rx, y: ym + ry }];
  if (h > 1e-3) {
    res.push({ x: xm - rx, y: ym - ry });
  }
  return res;
}

/** Tính mọi giao điểm tiềm năng giữa 2 đối tượng (đường/đoạn/đường tròn) */
export function computeGeoIntersections(
  scene: EvaluatedGeoScene,
  id1: string,
  id2: string,
): readonly Vec2[] {
  const l1 = scene.lines.get(id1);
  const l2 = scene.lines.get(id2);
  const c1 = scene.conics.get(id1);
  const c2 = scene.conics.get(id2);

  if (l1 && l2) {
    const pt = intersectLines(l1, l2);
    return pt ? [pt] : [];
  }
  if (l1 && c2 && c2.kind === 'circle') {
    return intersectLineCircle(l1, c2);
  }
  if (c1 && l2 && c1.kind === 'circle') {
    return intersectLineCircle(l2, c1);
  }
  if (c1 && c2 && c1.kind === 'circle' && c2.kind === 'circle') {
    return intersectCircles(c1, c2);
  }
  return [];
}

function computeCircumcircle(
  a: Vec2,
  b: Vec2,
  c: Vec2,
): { cx: number; cy: number; r: number } | null {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < 1e-4) return null;
  const a2 = a.x * a.x + a.y * a.y;
  const b2 = b.x * b.x + b.y * b.y;
  const c2 = c.x * c.x + c.y * c.y;
  const cx = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d;
  const cy = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d;
  const r = Math.hypot(a.x - cx, a.y - cy);
  if (!Number.isFinite(r) || r > 5000) return null;
  return { cx, cy, r };
}

/**
 * Bộ giải phụ thuộc hình học động (Dynamic Geometry Dependency Solver):
 * Tính lại toàn bộ tọa độ điểm, trung điểm, điểm tỉ lệ, giao điểm, đường vuông góc/song song/trung trực/phân giác/tiếp tuyến,
 * đường tròn ngoại tiếp, elip và đa giác khi người dùng kéo thả bất kỳ điểm tự do nào.
 */
export function evaluateGeoScene(objects: readonly GeoObject[] | undefined): EvaluatedGeoScene {
  const points = new Map<string, EvaluatedGeoPoint>();
  const lines = new Map<string, EvaluatedGeoLine>();
  const conics = new Map<string, EvaluatedGeoConic>();
  const polygons = new Map<string, EvaluatedGeoPolygon>();

  if (!objects || objects.length === 0) {
    return { points, lines, conics, polygons };
  }

  const sceneView: EvaluatedGeoScene = { points, lines, conics, polygons };

  for (const obj of objects) {
    if (obj.kind === 'geo-point') {
      if (obj.pointMode === 'free') {
        points.set(obj.id, { x: obj.x, y: obj.y, obj });
      } else if (obj.pointMode === 'on-segment') {
        const line = lines.get(obj.targetId);
        if (!line) continue;
        const x = line.p1.x + (line.p2.x - line.p1.x) * obj.t;
        const y = line.p1.y + (line.p2.y - line.p1.y) * obj.t;
        points.set(obj.id, { x, y, obj });
      } else if (obj.pointMode === 'on-circle') {
        const conic = conics.get(obj.targetId);
        if (!conic) continue;
        const lx = Math.cos(obj.angleRad) * conic.rx;
        const ly = Math.sin(obj.angleRad) * conic.ry;
        const cosR = Math.cos(conic.rotation);
        const sinR = Math.sin(conic.rotation);
        points.set(obj.id, {
          x: conic.cx + lx * cosR - ly * sinR,
          y: conic.cy + lx * sinR + ly * cosR,
          obj,
        });
      } else if (obj.pointMode === 'midpoint') {
        const a = points.get(obj.p1Id);
        const b = points.get(obj.p2Id);
        if (!a || !b) continue;
        points.set(obj.id, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, obj });
      } else if (obj.pointMode === 'centroid') {
        const pts = obj.pointIds
          .map((pid) => points.get(pid))
          .filter((p): p is EvaluatedGeoPoint => Boolean(p));
        if (pts.length < 2) continue;
        const sx = pts.reduce((acc, p) => acc + p.x, 0);
        const sy = pts.reduce((acc, p) => acc + p.y, 0);
        points.set(obj.id, { x: sx / pts.length, y: sy / pts.length, obj });
      } else if (obj.pointMode === 'projection') {
        const src = points.get(obj.sourcePointId);
        const line = lines.get(obj.lineId);
        if (!src || !line) continue;
        const { foot } = projectPointOntoLine(src, line.p1, line.p2);
        points.set(obj.id, { x: foot.x, y: foot.y, obj });
      } else if (obj.pointMode === 'intersection') {
        const hits = computeGeoIntersections(sceneView, obj.obj1Id, obj.obj2Id);
        const picked = hits[obj.branch ?? 0] ?? hits[0];
        if (!picked) continue;
        points.set(obj.id, { x: picked.x, y: picked.y, obj });
      }
    } else if (obj.kind === 'geo-line') {
      if (
        obj.lineMode === 'segment' ||
        obj.lineMode === 'line' ||
        obj.lineMode === 'ray' ||
        obj.lineMode === 'vector'
      ) {
        const a = points.get(obj.p1Id);
        const b = points.get(obj.p2Id);
        if (!a || !b) continue;
        const dir = normalize2(b.x - a.x, b.y - a.y);
        lines.set(obj.id, {
          p1: { x: a.x, y: a.y },
          p2: { x: b.x, y: b.y },
          dir,
          infinite: obj.lineMode === 'line',
          ray: obj.lineMode === 'ray',
          vector: obj.lineMode === 'vector',
          obj,
        });
      } else if (obj.lineMode === 'perp-bisector') {
        const a = points.get(obj.p1Id);
        const b = points.get(obj.p2Id);
        if (!a || !b) continue;
        const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        const abDir = normalize2(b.x - a.x, b.y - a.y);
        const perpDir = { x: -abDir.y, y: abDir.x };
        lines.set(obj.id, {
          p1: mid,
          p2: { x: mid.x + perpDir.x * 120, y: mid.y + perpDir.y * 120 },
          dir: perpDir,
          infinite: true,
          ray: false,
          vector: false,
          rightAngleAt: { vertex: mid, dir1: abDir, dir2: perpDir },
          obj,
        });
      } else if (obj.lineMode === 'altitude' || obj.lineMode === 'perpendicular') {
        const pt = points.get(obj.throughPointId);
        const ref = lines.get(obj.refLineId);
        if (!pt || !ref) continue;
        const { foot, t } = projectPointOntoLine(pt, ref.p1, ref.p2);
        const perpDir = { x: -ref.dir.y, y: ref.dir.x };
        const distToFoot = Math.hypot(pt.x - foot.x, pt.y - foot.y);
        const toPt = distToFoot > 2 ? normalize2(pt.x - foot.x, pt.y - foot.y) : perpDir;
        const isFiniteAltitude = obj.lineMode === 'altitude';

        // Hướng ký hiệu góc vuông quay vào phía tâm đoạn đáy để hình luôn cân đối chuẩn SGK
        const refMid = { x: (ref.p1.x + ref.p2.x) / 2, y: (ref.p1.y + ref.p2.y) / 2 };
        const dotTowardMid = (refMid.x - foot.x) * ref.dir.x + (refMid.y - foot.y) * ref.dir.y;
        const sqDir1 = dotTowardMid < -1 ? { x: -ref.dir.x, y: -ref.dir.y } : ref.dir;

        let baseExtension: { readonly from: Vec2; readonly to: Vec2 } | undefined;
        if (isFiniteAltitude && !ref.infinite && !ref.ray && distToFoot > 2) {
          if (t < -0.01) {
            baseExtension = { from: ref.p1, to: foot };
          } else if (t > 1.01) {
            baseExtension = { from: ref.p2, to: foot };
          }
        }

        lines.set(obj.id, {
          p1: { x: pt.x, y: pt.y },
          p2: distToFoot <= 1e-3 ? { x: pt.x + perpDir.x * 100, y: pt.y + perpDir.y * 100 } : foot,
          dir: toPt,
          infinite: !isFiniteAltitude,
          ray: false,
          vector: false,
          rightAngleAt: { vertex: foot, dir1: sqDir1, dir2: toPt },
          baseExtension,
          obj,
        });
      } else if (obj.lineMode === 'parallel') {
        const pt = points.get(obj.throughPointId);
        const ref = lines.get(obj.refLineId);
        if (!pt || !ref) continue;
        lines.set(obj.id, {
          p1: { x: pt.x, y: pt.y },
          p2: { x: pt.x + ref.dir.x * 120, y: pt.y + ref.dir.y * 120 },
          dir: ref.dir,
          infinite: true,
          ray: false,
          vector: false,
          obj,
        });
      } else if (obj.lineMode === 'angle-bisector') {
        const a = points.get(obj.p1Id);
        const v = points.get(obj.vertexId);
        const c = points.get(obj.p3Id);
        if (!a || !v || !c) continue;
        const u1 = normalize2(a.x - v.x, a.y - v.y);
        const u2 = normalize2(c.x - v.x, c.y - v.y);
        const bx = u1.x + u2.x;
        const by = u1.y + u2.y;
        const dir = Math.hypot(bx, by) > 1e-4 ? normalize2(bx, by) : { x: -u1.y, y: u1.x };
        lines.set(obj.id, {
          p1: { x: v.x, y: v.y },
          p2: { x: v.x + dir.x * 140, y: v.y + dir.y * 140 },
          dir,
          infinite: false,
          ray: true,
          vector: false,
          obj,
        });
      } else if (obj.lineMode === 'tangent') {
        const pt = points.get(obj.throughPointId);
        const circle = conics.get(obj.circleId);
        if (!pt || !circle || circle.kind !== 'circle') continue;
        const dx = pt.x - circle.cx;
        const dy = pt.y - circle.cy;
        const d = Math.hypot(dx, dy);
        if (d < circle.rx - 1) continue;
        const baseAngle = Math.atan2(dy, dx);
        const alpha = d <= circle.rx + 1 ? 0 : Math.acos(Math.max(-1, Math.min(1, circle.rx / d)));
        const tangAngle = obj.branch === 0 ? baseAngle + alpha : baseAngle - alpha;
        const touchPt: Vec2 = {
          x: circle.cx + Math.cos(tangAngle) * circle.rx,
          y: circle.cy + Math.sin(tangAngle) * circle.rx,
        };
        const dir =
          d <= circle.rx + 1
            ? { x: -Math.sin(baseAngle), y: Math.cos(baseAngle) }
            : normalize2(touchPt.x - pt.x, touchPt.y - pt.y);
        const radDir = normalize2(touchPt.x - circle.cx, touchPt.y - circle.cy);
        lines.set(obj.id, {
          p1: { x: pt.x, y: pt.y },
          p2: d <= circle.rx + 1 ? { x: pt.x + dir.x * 100, y: pt.y + dir.y * 100 } : touchPt,
          dir,
          infinite: true,
          ray: false,
          vector: false,
          rightAngleAt: { vertex: touchPt, dir1: radDir, dir2: dir },
          obj,
        });
      }
    } else if (obj.kind === 'geo-conic') {
      if (obj.conicMode === 'circle-center-point') {
        const c = points.get(obj.centerId);
        const t = points.get(obj.throughId);
        if (!c || !t) continue;
        const r = Math.max(4, Math.hypot(t.x - c.x, t.y - c.y));
        conics.set(obj.id, { kind: 'circle', cx: c.x, cy: c.y, rx: r, ry: r, rotation: 0, obj });
      } else if (obj.conicMode === 'circle-3pts') {
        const a = points.get(obj.p1Id);
        const b = points.get(obj.p2Id);
        const c = points.get(obj.p3Id);
        if (!a || !b || !c) continue;
        const circum = computeCircumcircle(a, b, c);
        if (!circum) continue;
        conics.set(obj.id, {
          kind: 'circle',
          cx: circum.cx,
          cy: circum.cy,
          rx: circum.r,
          ry: circum.r,
          rotation: 0,
          obj,
        });
      } else if (obj.conicMode === 'ellipse') {
        const c = points.get(obj.centerId);
        const a1 = points.get(obj.axis1Id);
        const a2 = points.get(obj.axis2Id);
        if (!c || !a1 || !a2) continue;
        const rx = Math.max(8, Math.hypot(a1.x - c.x, a1.y - c.y));
        const rotation = Math.atan2(a1.y - c.y, a1.x - c.x);
        const nx = -Math.sin(rotation);
        const ny = Math.cos(rotation);
        const ry = Math.max(6, Math.abs((a2.x - c.x) * nx + (a2.y - c.y) * ny));
        conics.set(obj.id, { kind: 'ellipse', cx: c.x, cy: c.y, rx, ry, rotation, obj });
      }
    } else if (obj.kind === 'geo-polygon') {
      const verts = obj.pointIds
        .map((pid) => points.get(pid))
        .filter((p): p is EvaluatedGeoPoint => Boolean(p))
        .map((p) => ({ x: p.x, y: p.y }));
      if (verts.length >= 3) {
        polygons.set(obj.id, { vertices: verts, obj });
      }
    }
  }

  return sceneView;
}

export type GeoSceneHit =
  | {
      readonly kind: 'point';
      readonly id: string;
      readonly label: string;
      readonly x: number;
      readonly y: number;
    }
  | {
      readonly kind: 'line';
      readonly id: string;
      readonly projX: number;
      readonly projY: number;
      readonly t: number;
      readonly snappedT: number;
      readonly ratioLabel: string;
    }
  | {
      readonly kind: 'conic';
      readonly id: string;
      readonly projX: number;
      readonly projY: number;
      readonly angleRad: number;
    }
  | {
      readonly kind: 'intersection-snap';
      readonly obj1Id: string;
      readonly obj2Id: string;
      readonly branch: 0 | 1;
      readonly x: number;
      readonly y: number;
    }
  | {
      readonly kind: 'polygon';
      readonly id: string;
    };

function isPointInsidePolygon2D(x: number, y: number, vertices: readonly Vec2[]): boolean {
  if (vertices.length < 3) return false;
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i]!.x;
    const yi = vertices[i]!.y;
    const xj = vertices[j]!.x;
    const yj = vertices[j]!.y;
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Lấy danh sách ID phụ thuộc trực tiếp của một đối tượng GeoObject.
 */
function getDirectGeoDependencies(obj: GeoObject): readonly string[] {
  if (obj.kind === 'geo-point') {
    if (obj.pointMode === 'free') return [];
    if (obj.pointMode === 'on-segment' || obj.pointMode === 'on-circle') return [obj.targetId];
    if (obj.pointMode === 'midpoint') return [obj.p1Id, obj.p2Id];
    if (obj.pointMode === 'centroid') return obj.pointIds;
    if (obj.pointMode === 'intersection') return [obj.obj1Id, obj.obj2Id];
    if (obj.pointMode === 'projection') return [obj.sourcePointId, obj.lineId];
    return [];
  }
  if (obj.kind === 'geo-line') {
    if (
      obj.lineMode === 'segment' ||
      obj.lineMode === 'line' ||
      obj.lineMode === 'ray' ||
      obj.lineMode === 'vector' ||
      obj.lineMode === 'perp-bisector'
    ) {
      return [obj.p1Id, obj.p2Id];
    }
    if (
      obj.lineMode === 'altitude' ||
      obj.lineMode === 'perpendicular' ||
      obj.lineMode === 'parallel'
    ) {
      return [obj.throughPointId, obj.refLineId];
    }
    if (obj.lineMode === 'angle-bisector') {
      return [obj.p1Id, obj.vertexId, obj.p3Id];
    }
    if (obj.lineMode === 'tangent') {
      return [obj.throughPointId, obj.circleId];
    }
    return [];
  }
  if (obj.kind === 'geo-conic') {
    if (obj.conicMode === 'circle-center-point') return [obj.centerId, obj.throughId];
    if (obj.conicMode === 'circle-3pts') return [obj.p1Id, obj.p2Id, obj.p3Id];
    if (obj.conicMode === 'ellipse') return [obj.centerId, obj.axis1Id, obj.axis2Id];
    return [];
  }
  return obj.pointIds;
}

/**
 * Xóa tập đối tượng hình học kèm dọn sạch các đối tượng con phụ thuộc trực tiếp vào chúng
 * (tránh để lại đối tượng mồ côi vô hình trong dữ liệu trang).
 */
export function removeGeoObjectsWithCascade(
  objects: readonly GeoObject[] | undefined,
  initialRemoveIds: ReadonlySet<string> | readonly string[],
): readonly GeoObject[] {
  if (!objects || objects.length === 0) return [];
  const toRemove = new Set<string>(initialRemoveIds);
  if (toRemove.size === 0) return objects;

  let added = true;
  while (added) {
    added = false;
    for (const obj of objects) {
      if (toRemove.has(obj.id)) continue;
      const deps = getDirectGeoDependencies(obj);
      if (deps.some((depId) => toRemove.has(depId))) {
        toRemove.add(obj.id);
        added = true;
      }
    }
  }

  return objects.filter((obj) => !toRemove.has(obj.id));
}

/**
 * Tìm toàn bộ các Điểm tự do (`pointMode === 'free'`) gốc tạo nên tập đối tượng được chọn
 * để có thể kéo di chuyển nguyên đoạn thẳng AB, đường tròn, hoặc đa giác cùng lúc mà vẫn bảo toàn ràng buộc hình học!
 */
export function collectMovableFreePointIds(
  objects: readonly GeoObject[] | undefined,
  targetIds: ReadonlySet<string> | readonly string[],
): ReadonlySet<string> {
  const freeIds = new Set<string>();
  if (!objects || objects.length === 0) return freeIds;

  const byId = new Map<string, GeoObject>();
  for (const obj of objects) {
    byId.set(obj.id, obj);
  }

  const visited = new Set<string>();
  const stack: string[] = [...targetIds];

  while (stack.length > 0) {
    const curId = stack.pop()!;
    if (visited.has(curId)) continue;
    visited.add(curId);

    const obj = byId.get(curId);
    if (!obj) continue;

    if (obj.kind === 'geo-point' && obj.pointMode === 'free') {
      freeIds.add(obj.id);
      continue;
    }

    for (const depId of getDirectGeoDependencies(obj)) {
      if (!visited.has(depId)) {
        stack.push(depId);
      }
    }
  }

  return freeIds;
}

/**
 * Tịnh tiến cứng (rigid-body translation) một hoặc nhiều đối tượng hình học động theo `(dx, dy)`
 * bằng cách dịch chuyển đồng thời tất cả các điểm tự do gốc tạo nên chúng (mỗi điểm chỉ dịch đúng 1 lần).
 */
export function translateGeoObjectsByTargets(
  objects: readonly GeoObject[] | undefined,
  targetIds: ReadonlySet<string> | readonly string[],
  dx: number,
  dy: number,
): readonly GeoObject[] {
  if (!objects || objects.length === 0 || (dx === 0 && dy === 0)) {
    return objects ?? [];
  }
  const freeIds = collectMovableFreePointIds(objects, targetIds);
  if (freeIds.size === 0) return objects;

  return objects.map((obj) => {
    if (obj.kind === 'geo-point' && obj.pointMode === 'free' && freeIds.has(obj.id)) {
      return {
        ...obj,
        x: Number((obj.x + dx).toFixed(2)),
        y: Number((obj.y + dy).toFixed(2)),
      };
    }
    return obj;
  });
}

function distanceToEvaluatedLine(
  x: number,
  y: number,
  line: EvaluatedGeoLine,
): { readonly dist: number; readonly proj: Vec2; readonly t: number } {
  const { foot, t } = projectPointOntoLine({ x, y }, line.p1, line.p2);
  if (!line.infinite && !line.ray) {
    const clampedT = Math.max(0, Math.min(1, t));
    const px = line.p1.x + (line.p2.x - line.p1.x) * clampedT;
    const py = line.p1.y + (line.p2.y - line.p1.y) * clampedT;
    return { dist: Math.hypot(x - px, y - py), proj: { x: px, y: py }, t: clampedT };
  }
  if (line.ray && t < 0) {
    return { dist: Math.hypot(x - line.p1.x, y - line.p1.y), proj: line.p1, t: 0 };
  }
  return { dist: Math.hypot(x - foot.x, y - foot.y), proj: foot, t };
}

/**
 * Nhận diện đối tượng gần con trỏ chuột nhất trên lớp hình học động GeoGebra
 * (hỗ trợ bắt nam châm điểm, chiếu mượt trượt dọc đoạn thẳng với tỉ số k, đường tròn và giao điểm).
 */
export function hitTestGeoScene(
  scene: EvaluatedGeoScene,
  x: number,
  y: number,
  opts?: {
    readonly skipPoints?: boolean;
    readonly preferIntersection?: boolean;
    readonly includePolygons?: boolean;
    readonly pointRadius?: number;
    readonly curveRadius?: number;
  },
): GeoSceneHit | null {
  const pointR = opts?.pointRadius ?? 16;
  const curveR = opts?.curveRadius ?? 13;

  // 1. Nếu đang ở công cụ Giao điểm, ưu tiên bắt thẳng giao điểm thực của 2 đường/đường tròn gần con trỏ
  if (opts?.preferIntersection) {
    const curveIds = [...scene.lines.keys(), ...scene.conics.keys()];
    let bestHit: GeoSceneHit | null = null;
    let bestDist = 18;
    for (let i = 0; i < curveIds.length; i += 1) {
      for (let j = i + 1; j < curveIds.length; j += 1) {
        const id1 = curveIds[i]!;
        const id2 = curveIds[j]!;
        const pts = computeGeoIntersections(scene, id1, id2);
        pts.forEach((pt, bIdx) => {
          const d = Math.hypot(x - pt.x, y - pt.y);
          if (d < bestDist) {
            bestDist = d;
            bestHit = {
              kind: 'intersection-snap',
              obj1Id: id1,
              obj2Id: id2,
              branch: bIdx === 1 ? 1 : 0,
              x: pt.x,
              y: pt.y,
            };
          }
        });
      }
    }
    if (bestHit) return bestHit;
  }

  // 2. Ưu tiên bắt Điểm hiện có (trừ khi chế độ chỉ tìm đối tượng đường/đường tròn)
  if (!opts?.skipPoints) {
    let bestPt: GeoSceneHit | null = null;
    let bestDist = pointR;
    for (const [id, pt] of scene.points.entries()) {
      const d = Math.hypot(x - pt.x, y - pt.y);
      if (d <= bestDist) {
        bestDist = d;
        bestPt = { kind: 'point', id, label: pt.obj.label, x: pt.x, y: pt.y };
      }
    }
    if (bestPt) return bestPt;
  }

  // 3. Bắt Đoạn thẳng / Đường thẳng / Tia / Vectơ (kèm tính tỉ số trượt k liên tục!)
  let bestCurve: GeoSceneHit | null = null;
  let bestCurveDist = curveR;

  for (const [id, line] of scene.lines.entries()) {
    const res = distanceToEvaluatedLine(x, y, line);
    if (res.dist <= bestCurveDist) {
      bestCurveDist = res.dist;
      const snap = snapRatioToNiceFraction(res.t);
      const snappedX = line.p1.x + (line.p2.x - line.p1.x) * snap.t;
      const snappedY = line.p1.y + (line.p2.y - line.p1.y) * snap.t;
      bestCurve = {
        kind: 'line',
        id,
        projX: line.infinite ? res.proj.x : snappedX,
        projY: line.infinite ? res.proj.y : snappedY,
        t: res.t,
        snappedT: line.infinite ? res.t : snap.t,
        ratioLabel: snap.label,
      };
    }
  }

  // 4. Bắt Đường tròn / Elip
  for (const [id, conic] of scene.conics.entries()) {
    const dx = x - conic.cx;
    const dy = y - conic.cy;
    const cosR = Math.cos(-conic.rotation);
    const sinR = Math.sin(-conic.rotation);
    const lx = dx * cosR - dy * sinR;
    const ly = dx * sinR + dy * cosR;
    const angleRad = Math.atan2(ly / Math.max(1, conic.ry), lx / Math.max(1, conic.rx));
    const ex = Math.cos(angleRad) * conic.rx;
    const ey = Math.sin(angleRad) * conic.ry;
    const projX = conic.cx + ex * Math.cos(conic.rotation) - ey * Math.sin(conic.rotation);
    const projY = conic.cy + ex * Math.sin(conic.rotation) + ey * Math.cos(conic.rotation);
    const d = Math.hypot(x - projX, y - projY);
    if (d <= bestCurveDist) {
      bestCurveDist = d;
      bestCurve = { kind: 'conic', id, projX, projY, angleRad };
    }
  }

  if (bestCurve) return bestCurve;

  // 5. Bắt vùng trong Đa giác / Mặt phẳng (khi bật includePolygons cho Di chuyển / Chọn / Tẩy)
  if (opts?.includePolygons) {
    const polyEntries = [...scene.polygons.entries()];
    for (let i = polyEntries.length - 1; i >= 0; i -= 1) {
      const [id, poly] = polyEntries[i]!;
      if (isPointInsidePolygon2D(x, y, poly.vertices)) {
        return { kind: 'polygon', id };
      }
    }
  }

  return null;
}

function hexToRgba2D(hex: string, alpha: number): string {
  const clean = hex.trim().replace('#', '');
  if (clean.length >= 6) {
    const r = Number.parseInt(clean.slice(0, 2), 16);
    const g = Number.parseInt(clean.slice(2, 4), 16);
    const b = Number.parseInt(clean.slice(4, 6), 16);
    if (!Number.isNaN(r) && !Number.isNaN(g) && !Number.isNaN(b)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  return `rgba(29, 78, 216, ${alpha})`;
}

function drawArrowTip2D(
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

export interface GeoOverlayState {
  readonly hoveredHit?: GeoSceneHit | null;
  readonly selectedGeoId?: string | null;
  readonly selectedIds?: ReadonlySet<string>;
  readonly pendingPointIds?: readonly string[];
  readonly cursor?: Vec2 | null;
  readonly activeGeoTool?: string;
  readonly activeColor?: string;
  readonly activeLineStyle?: 'solid' | 'dashed';
}

function drawHaloText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  fillColor: string,
): void {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 3.8;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Kết xuất toàn bộ lớp Hình học động GeoGebra lên Canvas 2D (và bản xuất PNG/PDF).
 */
export function renderGeoSceneOnCanvas(
  ctx: CanvasRenderingContext2D,
  scene: EvaluatedGeoScene,
  pageWidth: number,
  pageHeight: number,
  overlay?: GeoOverlayState,
): void {
  const maxSpan = Math.hypot(pageWidth, pageHeight) + 120;
  const isIdSelected = (id: string): boolean =>
    overlay?.selectedGeoId === id || Boolean(overlay?.selectedIds?.has(id));

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, pageWidth, pageHeight);
  ctx.clip();

  // 1. Đa giác / Mặt phẳng tô màu bán trong suốt
  for (const [id, poly] of scene.polygons.entries()) {
    const isSel = isIdSelected(id);
    const isHov = overlay?.hoveredHit?.kind === 'polygon' && overlay.hoveredHit.id === id;
    ctx.save();
    ctx.fillStyle = hexToRgba2D(
      poly.obj.color,
      isSel || isHov ? Math.min(0.32, poly.obj.fillOpacity + 0.08) : poly.obj.fillOpacity,
    );
    ctx.strokeStyle = poly.obj.color;
    ctx.lineWidth = isSel ? poly.obj.width + 1.4 : poly.obj.width;
    ctx.setLineDash(poly.obj.borderStyle === 'dashed' ? [7, 5] : []);
    ctx.beginPath();
    ctx.moveTo(poly.vertices[0]!.x, poly.vertices[0]!.y);
    for (let i = 1; i < poly.vertices.length; i += 1) {
      ctx.lineTo(poly.vertices[i]!.x, poly.vertices[i]!.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    if (poly.obj.label?.trim()) {
      const cx = poly.vertices.reduce((s, v) => s + v.x, 0) / poly.vertices.length;
      const cy = poly.vertices.reduce((s, v) => s + v.y, 0) / poly.vertices.length;
      ctx.font = 'italic 700 16px "Times New Roman", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawHaloText(ctx, poly.obj.label.trim(), cx, cy, poly.obj.color);
    }
    ctx.restore();
  }

  // 2. Đường tròn & Elip
  for (const [id, conic] of scene.conics.entries()) {
    const isSel = isIdSelected(id);
    const isHov = overlay?.hoveredHit?.kind === 'conic' && overlay.hoveredHit.id === id;
    ctx.save();
    if (isSel) {
      ctx.strokeStyle = hexToRgba2D(conic.obj.color, 0.2);
      ctx.lineWidth = conic.obj.width + 6;
      ctx.beginPath();
      ctx.ellipse(conic.cx, conic.cy, conic.rx, conic.ry, conic.rotation, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = conic.obj.color;
    ctx.lineWidth = isSel || isHov ? conic.obj.width + 1.2 : conic.obj.width;
    ctx.setLineDash(conic.obj.style === 'dashed' ? [7, 5] : []);
    ctx.beginPath();
    ctx.ellipse(conic.cx, conic.cy, conic.rx, conic.ry, conic.rotation, 0, Math.PI * 2);
    if (conic.obj.fillOpacity && conic.obj.fillOpacity > 0) {
      ctx.fillStyle = hexToRgba2D(conic.obj.color, conic.obj.fillOpacity);
      ctx.fill();
    }
    ctx.stroke();
    ctx.restore();
  }

  // 3. Đường trung tuyến của các Trọng tâm (nếu bật showMedians)
  for (const pt of scene.points.values()) {
    if (pt.obj.pointMode === 'centroid' && pt.obj.showMedians) {
      const verts = pt.obj.pointIds
        .map((pid) => scene.points.get(pid))
        .filter((v): v is EvaluatedGeoPoint => Boolean(v));
      if (verts.length === 3) {
        ctx.save();
        ctx.strokeStyle = hexToRgba2D(pt.obj.color, 0.55);
        ctx.lineWidth = 1.35;
        ctx.setLineDash([5, 4]);
        for (let i = 0; i < 3; i += 1) {
          const v = verts[i]!;
          const o1 = verts[(i + 1) % 3]!;
          const o2 = verts[(i + 2) % 3]!;
          ctx.beginPath();
          ctx.moveTo(v.x, v.y);
          ctx.lineTo((o1.x + o2.x) / 2, (o1.y + o2.y) / 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  // 4. Đoạn thẳng, Đường cao (đoạn vuông góc), Đường thẳng, Tia, Vectơ, Song song, Trung trực, Phân giác, Tiếp tuyến
  for (const [id, line] of scene.lines.entries()) {
    const isSel = isIdSelected(id);
    const isHov = overlay?.hoveredHit?.kind === 'line' && overlay.hoveredHit.id === id;
    ctx.save();

    let start = line.p1;
    let end = line.p2;
    if (line.infinite) {
      start = { x: line.p1.x - line.dir.x * maxSpan, y: line.p1.y - line.dir.y * maxSpan };
      end = { x: line.p1.x + line.dir.x * maxSpan, y: line.p1.y + line.dir.y * maxSpan };
    } else if (line.ray) {
      end = { x: line.p1.x + line.dir.x * maxSpan, y: line.p1.y + line.dir.y * maxSpan };
    }

    // Đường gióng nét đứt kéo dài cạnh đáy nếu chân đường cao rơi ngoài đoạn đáy (tam giác tù)
    if (line.baseExtension) {
      ctx.save();
      ctx.strokeStyle = hexToRgba2D(line.obj.color, 0.55);
      ctx.lineWidth = 1.35;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(line.baseExtension.from.x, line.baseExtension.from.y);
      ctx.lineTo(line.baseExtension.to.x, line.baseExtension.to.y);
      ctx.stroke();
      ctx.restore();
    }

    if (isSel) {
      ctx.save();
      ctx.strokeStyle = hexToRgba2D(line.obj.color, 0.2);
      ctx.lineWidth = line.obj.width + 6.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.restore();
    }

    ctx.strokeStyle = line.obj.color;
    ctx.lineWidth = isSel || isHov ? line.obj.width + 1.2 : line.obj.width;
    ctx.lineCap = 'round';
    ctx.setLineDash(line.obj.style === 'dashed' ? [7, 5] : []);

    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    if (line.vector) {
      ctx.setLineDash([]);
      drawArrowTip2D(
        ctx,
        line.p1.x,
        line.p1.y,
        line.p2.x,
        line.p2.y,
        Math.max(12, line.obj.width * 4.5),
      );
    }

    // Ký hiệu vạch cạnh bằng nhau (1, 2, 3 vạch) trên đoạn thẳng
    const tickMarks =
      'tickMarks' in line.obj && typeof line.obj.tickMarks === 'number' ? line.obj.tickMarks : 0;
    if (tickMarks > 0 && !line.infinite && !line.ray) {
      const mx = (line.p1.x + line.p2.x) / 2;
      const my = (line.p1.y + line.p2.y) / 2;
      const nx = -line.dir.y;
      const ny = line.dir.x;
      const tickHalf = 6.5;
      const spacing = 4.5;
      ctx.setLineDash([]);
      ctx.lineWidth = 1.65;
      for (let k = 0; k < tickMarks; k += 1) {
        const offset = (k - (tickMarks - 1) / 2) * spacing;
        const cx = mx + line.dir.x * offset;
        const cy = my + line.dir.y * offset;
        ctx.beginPath();
        ctx.moveTo(cx - nx * tickHalf, cy - ny * tickHalf);
        ctx.lineTo(cx + nx * tickHalf, cy + ny * tickHalf);
        ctx.stroke();
      }
    }

    // Nhãn tên đoạn / đường (VD: a, b, h, d)
    if (line.obj.label?.trim() && !line.infinite) {
      const mx = (line.p1.x + line.p2.x) / 2 - line.dir.y * 13;
      const my = (line.p1.y + line.p2.y) / 2 + line.dir.x * 13;
      ctx.font = 'italic 600 15.5px "Times New Roman", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      drawHaloText(ctx, line.obj.label.trim(), mx, my, line.obj.color);
    }

    // Ký hiệu góc vuông tự động cho đoạn/đường vuông góc, trung trực, tiếp tuyến
    if (line.rightAngleAt) {
      const sq = 12.5;
      const { vertex, dir1, dir2 } = line.rightAngleAt;
      const a = { x: vertex.x + dir1.x * sq, y: vertex.y + dir1.y * sq };
      const c = { x: vertex.x + (dir1.x + dir2.x) * sq, y: vertex.y + (dir1.y + dir2.y) * sq };
      const b = { x: vertex.x + dir2.x * sq, y: vertex.y + dir2.y * sq };
      ctx.setLineDash([]);
      ctx.lineWidth = 1.45;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(c.x, c.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  // 5. Các bản vẽ xem trước (Rubber-band preview) khi đang bấm chọn hoặc kéo vẽ trực tiếp
  if (overlay?.pendingPointIds && overlay.pendingPointIds.length > 0 && overlay.cursor) {
    const pendingPts = overlay.pendingPointIds
      .map((pid) => scene.points.get(pid))
      .filter((p): p is EvaluatedGeoPoint => Boolean(p));
    const cur = overlay.cursor;
    const color = overlay.activeColor ?? '#1D4ED8';

    ctx.save();
    ctx.strokeStyle = hexToRgba2D(color, 0.72);
    ctx.fillStyle = hexToRgba2D(color, 0.12);
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 4]);

    if (overlay.activeGeoTool === 'polygon' && pendingPts.length >= 1) {
      ctx.beginPath();
      ctx.moveTo(pendingPts[0]!.x, pendingPts[0]!.y);
      for (let i = 1; i < pendingPts.length; i += 1) {
        ctx.lineTo(pendingPts[i]!.x, pendingPts[i]!.y);
      }
      ctx.lineTo(cur.x, cur.y);
      if (pendingPts.length >= 2) {
        ctx.closePath();
        ctx.fill();
      }
      ctx.stroke();
    } else if (overlay.activeGeoTool === 'circle-center-point' && pendingPts.length === 1) {
      const c = pendingPts[0]!;
      const r = Math.hypot(cur.x - c.x, cur.y - c.y);
      ctx.beginPath();
      ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
      ctx.stroke();
    } else if (overlay.activeGeoTool === 'circle-3pts' && pendingPts.length === 2) {
      const circum = computeCircumcircle(pendingPts[0]!, pendingPts[1]!, cur);
      if (circum) {
        ctx.beginPath();
        ctx.arc(circum.cx, circum.cy, circum.r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (
      overlay.activeGeoTool === 'altitude' &&
      pendingPts.length === 1 &&
      overlay.hoveredHit?.kind === 'line'
    ) {
      const srcPt = pendingPts[0]!;
      const targetLine = scene.lines.get(overlay.hoveredHit.id);
      if (targetLine) {
        const { foot } = projectPointOntoLine(srcPt, targetLine.p1, targetLine.p2);
        ctx.beginPath();
        ctx.moveTo(srcPt.x, srcPt.y);
        ctx.lineTo(foot.x, foot.y);
        ctx.stroke();
      }
    } else if (pendingPts.length >= 1) {
      const last = pendingPts[pendingPts.length - 1]!;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 6. Các Điểm hình học (tỉ lệ rõ nét trên màn 23.8" FHD + viền sáng trắng chống đè nét)
  for (const [id, pt] of scene.points.entries()) {
    const isSel = isIdSelected(id) || Boolean(overlay?.pendingPointIds?.includes(id));
    const isHov = overlay?.hoveredHit?.kind === 'point' && overlay.hoveredHit.id === id;
    const isConstrained = pt.obj.pointMode !== 'free';

    ctx.save();
    if (isSel || isHov) {
      ctx.fillStyle = hexToRgba2D(pt.obj.color, 0.24);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 11.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = isConstrained ? '#FFFFFF' : pt.obj.color;
    ctx.strokeStyle = isConstrained ? pt.obj.color : '#FFFFFF';
    ctx.lineWidth = isConstrained ? 2.25 : 1.75;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, isConstrained ? 5.0 : 5.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    if (isConstrained) {
      ctx.fillStyle = pt.obj.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2.3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (pt.obj.showLabel !== false && pt.obj.label.trim()) {
      ctx.font = 'italic 700 17px "Times New Roman", Georgia, serif';
      drawHaloText(ctx, pt.obj.label, pt.x + 9, pt.y - 8, pt.obj.color);
    }
    ctx.restore();
  }

  // 7. Vòng bắt nam châm & nhãn tỉ số trượt trực tiếp khi rê chuột trên cạnh / giao điểm
  if (overlay?.hoveredHit) {
    const hit = overlay.hoveredHit;
    if (
      (hit.kind === 'line' && overlay.activeGeoTool === 'point-on-object') ||
      (hit.kind === 'conic' && overlay.activeGeoTool === 'point-on-object')
    ) {
      const px = hit.projX;
      const py = hit.projY;
      ctx.save();
      ctx.fillStyle = 'rgba(29, 78, 216, 0.2)';
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.arc(px, py, 4.2, 0, Math.PI * 2);
      ctx.fill();

      if (hit.kind === 'line') {
        const badge = `k = ${hit.ratioLabel}`;
        ctx.font = '600 12px "JetBrains Mono Variable", monospace';
        const tw = ctx.measureText(badge).width + 14;
        ctx.fillStyle = '#17332C';
        ctx.beginPath();
        ctx.roundRect(px + 11, py - 26, tw, 22, 6);
        ctx.fill();
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(badge, px + 18, py - 11);
      }
      ctx.restore();
    } else if (hit.kind === 'intersection-snap') {
      ctx.save();
      ctx.strokeStyle = '#DC2626';
      ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hit.x, hit.y, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(hit.x, hit.y, 3.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}
