export const SVG_W = 540;
export const SVG_H = 320;

export interface Point2D {
  x: number;
  y: number;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function clampSvgPoint(p: Point2D, pad = 22): Point2D {
  return {
    x: clamp(p.x, pad, SVG_W - pad),
    y: clamp(p.y, pad, SVG_H - pad),
  };
}

export function toMathCoords(svgPt: Point2D, origin: Point2D, pxPerUnit: number): Point2D {
  return {
    x: (svgPt.x - origin.x) / pxPerUnit,
    y: (origin.y - svgPt.y) / pxPerUnit,
  };
}

export function toSvgCoords(mathPt: Point2D, origin: Point2D, pxPerUnit: number): Point2D {
  return {
    x: origin.x + mathPt.x * pxPerUnit,
    y: origin.y - mathPt.y * pxPerUnit,
  };
}

export function formatSigned(value: number, digits = 2): string {
  const cleaned = Math.abs(value) < 5e-4 ? 0 : value;
  return cleaned.toFixed(digits);
}

/* ============================================================================
 * 1. Barycentric Coordinates Model (Tâm tỉ cự)
 * ========================================================================== */

export interface BarycenterResult {
  exists: boolean;
  sum: number;
  point: Point2D | null;
  /** Direction vector sum(lambda_i * OP_i) when sum == 0 */
  freeVector: Point2D;
  normalizedWeights: [number, number, number] | null;
  inSimplex: boolean;
}

export function computeBarycenter(
  points: readonly [Point2D, Point2D, Point2D],
  weights: readonly [number, number, number],
): BarycenterResult {
  const [p1, p2, p3] = points;
  const [l1, l2, l3] = weights;
  const sum = l1 + l2 + l3;

  const freeVector: Point2D = {
    x: l1 * p1.x + l2 * p2.x + l3 * p3.x,
    y: l1 * p1.y + l2 * p2.y + l3 * p3.y,
  };

  if (Math.abs(sum) < 1e-6) {
    return {
      exists: false,
      sum: 0,
      point: null,
      freeVector,
      normalizedWeights: null,
      inSimplex: false,
    };
  }

  const b1 = l1 / sum;
  const b2 = l2 / sum;
  const b3 = l3 / sum;
  const point: Point2D = {
    x: b1 * p1.x + b2 * p2.x + b3 * p3.x,
    y: b1 * p1.y + b2 * p2.y + b3 * p3.y,
  };

  const inSimplex = b1 >= -1e-6 && b2 >= -1e-6 && b3 >= -1e-6;

  return {
    exists: true,
    sum,
    point,
    freeVector,
    normalizedWeights: [b1, b2, b3],
    inSimplex,
  };
}

/* ============================================================================
 * 2. Euclidean Dot & Cross Product Model (Tích vô hướng & Tích có hướng)
 * ========================================================================== */

export interface EuclideanMetrics {
  normA: number;
  normB: number;
  dot: number;
  signedArea: number;
  area: number;
  angleRad: number;
  angleDeg: number;
  projVec: Point2D;
  projScalar: number;
  distanceToLineA: number;
  isOrthogonal: boolean;
  isCollinear: boolean;
}

export function computeEuclideanMetrics(a: Point2D, b: Point2D): EuclideanMetrics {
  const normA = Math.hypot(a.x, a.y);
  const normB = Math.hypot(b.x, b.y);
  const dot = a.x * b.x + a.y * b.y;
  const signedArea = a.x * b.y - a.y * b.x;
  const area = Math.abs(signedArea);

  const nonZero = normA > 1e-5 && normB > 1e-5;
  const cosPhi = nonZero ? clamp(dot / (normA * normB), -1, 1) : 1;
  const angleRad = nonZero ? Math.acos(cosPhi) : 0;
  const angleDeg = (angleRad * 180) / Math.PI;

  const projScalar = normA > 1e-5 ? dot / (normA * normA) : 0;
  const projVec: Point2D = {
    x: projScalar * a.x,
    y: projScalar * a.y,
  };
  const distanceToLineA = normA > 1e-5 ? area / normA : normB;

  const isOrthogonal = nonZero && Math.abs(dot) / (normA * normB) < 0.025;
  const isCollinear = nonZero && Math.abs(signedArea) / (normA * normB) < 0.025;

  return {
    normA,
    normB,
    dot,
    signedArea,
    area,
    angleRad,
    angleDeg,
    projVec,
    projScalar,
    distanceToLineA,
    isOrthogonal,
    isCollinear,
  };
}

/* ============================================================================
 * 3. Desargues Projective Theorem Model (Định lí Desargues)
 * ========================================================================== */

export type LineIntersection =
  | { kind: 'point'; point: Point2D }
  | { kind: 'parallel'; direction: Point2D }
  | { kind: 'degenerate' };

export function intersectLines(
  p1: Point2D,
  p2: Point2D,
  q1: Point2D,
  q2: Point2D,
): LineIntersection {
  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = q2.x - q1.x;
  const dy2 = q2.y - q1.y;

  const len1 = Math.hypot(dx1, dy1);
  const len2 = Math.hypot(dx2, dy2);
  if (len1 < 1e-5 || len2 < 1e-5) {
    return { kind: 'degenerate' };
  }

  const det = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(det) / (len1 * len2) < 1e-4) {
    return {
      kind: 'parallel',
      direction: { x: dx1 / len1, y: dy1 / len1 },
    };
  }

  const rx = q1.x - p1.x;
  const ry = q1.y - p1.y;
  const t = (rx * dy2 - ry * dx2) / det;

  return {
    kind: 'point',
    point: {
      x: p1.x + t * dx1,
      y: p1.y + t * dy1,
    },
  };
}

export function extendLineSegment(a: Point2D, b: Point2D, span = 1200): [Point2D, Point2D] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-5) {
    return [a, b];
  }
  const ux = dx / len;
  const uy = dy / len;
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  return [
    { x: midX - ux * span, y: midY - uy * span },
    { x: midX + ux * span, y: midY + uy * span },
  ];
}

export interface DesarguesResult {
  aPrime: Point2D;
  bPrime: Point2D;
  cPrime: Point2D;
  /** Intersections P = AB∩A'B', Q = BC∩B'C', R = CA∩C'A' */
  P: LineIntersection;
  Q: LineIntersection;
  R: LineIntersection;
  /** Up to 2 finite points (or point + direction when 1 pair parallel) defining axis */
  axisLine: [Point2D, Point2D] | null;
  parallelCount: number;
}

export function scaleFromCenter(center: Point2D, vertex: Point2D, ratio: number): Point2D {
  return {
    x: center.x + ratio * (vertex.x - center.x),
    y: center.y + ratio * (vertex.y - center.y),
  };
}

export function computeDesargues(
  center: Point2D,
  A: Point2D,
  B: Point2D,
  C: Point2D,
  ratios: readonly [number, number, number],
): DesarguesResult {
  const [kA, kB, kC] = ratios;
  const aPrime = scaleFromCenter(center, A, kA);
  const bPrime = scaleFromCenter(center, B, kB);
  const cPrime = scaleFromCenter(center, C, kC);

  const P = intersectLines(A, B, aPrime, bPrime);
  const Q = intersectLines(B, C, bPrime, cPrime);
  const R = intersectLines(C, A, cPrime, aPrime);

  const finitePoints: Point2D[] = [];
  const parallelDirs: Point2D[] = [];
  for (const inter of [P, Q, R]) {
    if (inter.kind === 'point') finitePoints.push(inter.point);
    else if (inter.kind === 'parallel') parallelDirs.push(inter.direction);
  }

  let axisLine: [Point2D, Point2D] | null = null;
  if (finitePoints.length >= 2) {
    axisLine = extendLineSegment(finitePoints[0]!, finitePoints[finitePoints.length - 1]!);
  } else if (finitePoints.length === 1 && parallelDirs.length >= 1) {
    const p = finitePoints[0]!;
    const dir = parallelDirs[0]!;
    axisLine = extendLineSegment(p, { x: p.x + dir.x * 100, y: p.y + dir.y * 100 });
  }

  return {
    aPrime,
    bPrime,
    cPrime,
    P,
    Q,
    R,
    axisLine,
    parallelCount: parallelDirs.length,
  };
}

/* ============================================================================
 * 4. Symmetric Group S_n (n = 3, 4) & Disjoint Cycles Helper
 * ========================================================================== */

export type Permutation = readonly number[];

export function identityPerm(n: number): number[] {
  return Array.from({ length: n }, (_, idx) => idx + 1);
}

/** Right-to-left algebraic product (sigma o tau)(i) = sigma(tau(i)) */
export function composePerm(sigma: Permutation, tau: Permutation): number[] {
  return tau.map((img) => sigma[img - 1] ?? img);
}

export function invertPerm(sigma: Permutation): number[] {
  const inv = new Array<number>(sigma.length).fill(1);
  sigma.forEach((img, idx) => {
    inv[img - 1] = idx + 1;
  });
  return inv;
}

export function disjointCycles(sigma: Permutation): number[][] {
  const n = sigma.length;
  const visited = new Array<boolean>(n).fill(false);
  const cycles: number[][] = [];

  for (let i = 1; i <= n; i += 1) {
    if (visited[i - 1]) continue;
    const cycle: number[] = [];
    let cur = i;
    while (!visited[cur - 1]) {
      visited[cur - 1] = true;
      cycle.push(cur);
      cur = sigma[cur - 1] ?? cur;
    }
    if (cycle.length > 1) {
      cycles.push(cycle);
    }
  }
  return cycles;
}

export function formatCycleNotation(sigma: Permutation): string {
  const cycles = disjointCycles(sigma);
  if (cycles.length === 0) return 'id';
  return cycles.map((c) => `(${c.join(' ')})`).join('');
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

export function permutationOrder(sigma: Permutation): number {
  const cycles = disjointCycles(sigma);
  if (cycles.length === 0) return 1;
  return cycles.reduce((acc, c) => lcm(acc, c.length), 1);
}

export function permutationSign(sigma: Permutation): 1 | -1 {
  const transpositions = disjointCycles(sigma).reduce((sum, c) => sum + (c.length - 1), 0);
  return transpositions % 2 === 0 ? 1 : -1;
}

export function generateCyclicSubgroup(sigma: Permutation): number[][] {
  const n = sigma.length;
  const id = identityPerm(n);
  const elements: number[][] = [id];
  const seen = new Set<string>([id.join(',')]);

  let current = [...sigma];
  while (!seen.has(current.join(',')) && elements.length <= 24) {
    seen.add(current.join(','));
    elements.push(current);
    current = composePerm(sigma, current);
  }
  return elements;
}
