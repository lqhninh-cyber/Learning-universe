/**
 * Lõi tính toán Hình học Affine 2D phục vụ Figure Kit (Giai đoạn 5).
 * Tách biệt hoàn toàn khỏi giao diện để dễ dàng kiểm thử độ chính xác toán học.
 */

export type Point2D = [number, number];
export type Vector2D = [number, number];

export interface Matrix2x2 {
  readonly a11: number;
  readonly a12: number;
  readonly a21: number;
  readonly a22: number;
}

export interface AffineCoordinatesResult {
  readonly degenerate: boolean;
  readonly determinant: number;
  readonly x: number;
  readonly y: number;
  /** Điểm chiếu $P_1 = O + x\vec{e}_1$ trên trục thứ nhất. */
  readonly projE1: Point2D;
  /** Điểm chiếu $P_2 = O + y\vec{e}_2$ trên trục thứ hai. */
  readonly projE2: Point2D;
}

export interface WeightedPoint2D {
  readonly label?: string;
  readonly point: Point2D;
  readonly weight: number;
}

export interface BarycenterResult {
  readonly exists: boolean;
  readonly totalWeight: number;
  /** Tâm tỉ cự $G = \frac{\sum \alpha_i A_i}{\sum \alpha_i}$ khi $\sum \alpha_i \neq 0$. */
  readonly barycenter: Point2D | null;
  /** Khi $\sum \alpha_i = 0$, tổ hợp $\sum \alpha_i \vect{OA_i}$ là vectơ không phụ thuộc $O$. */
  readonly freeVector: Vector2D;
}

const EPSILON = 1e-6;

/** Cộng hai vectơ $\vec{u} + \vec{v}$. */
export function addVec(u: Vector2D, v: Vector2D): Vector2D {
  return [u[0] + v[0], u[1] + v[1]];
}

/** Trừ hai vectơ $\vec{u} - \vec{v}$. */
export function subVec(u: Vector2D, v: Vector2D): Vector2D {
  return [u[0] - v[0], u[1] - v[1]];
}

/** Nhân vectơ $\vec{u}$ với vô hướng $\lambda \in \R$. */
export function scaleVec(u: Vector2D, scalar: number): Vector2D {
  return [u[0] * scalar, u[1] * scalar];
}

/** Tạo vectơ $\vect{AB} = B - A$ nối từ điểm đầu $A$ tới điểm cuối $B$. */
export function vectorBetween(A: Point2D, B: Point2D): Vector2D {
  return [B[0] - A[0], B[1] - A[1]];
}

/** Tác động của vectơ $\vec{u}$ lên điểm $A$ theo tiên đề Weyl: $B = A + \vec{u}$. */
export function translatePoint(A: Point2D, u: Vector2D): Point2D {
  return [A[0] + u[0], A[1] + u[1]];
}

/** Độ dài Euclid của vectơ $\vec{u}$ (dùng để căn chỉnh nhãn hiển thị). */
export function vectorLength(u: Vector2D): number {
  return Math.hypot(u[0], u[1]);
}

/** Vectơ pháp tuyến đơn vị ngược chiều kim đồng hồ của $\vec{u}$. */
export function unitNormal(u: Vector2D): Vector2D {
  const len = vectorLength(u);
  if (len <= EPSILON) {
    return [0, 1];
  }
  return [-u[1] / len, u[0] / len];
}

/** Trung điểm $I$ của đoạn thẳng $AB$. */
export function midpoint2D(A: Point2D, B: Point2D): Point2D {
  return [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
}

/**
 * Tìm đỉnh thứ tư $C$ của hình bình hành $ABCD$ sao cho $\vect{AB} = \vect{DC} \iff \vect{AD} = \vect{BC}$.
 * Công thức: $C = B + \vect{AD} = D + \vect{AB}$.
 */
export function fourthParallelogramVertex(A: Point2D, B: Point2D, D: Point2D): Point2D {
  const ad = vectorBetween(A, D);
  return translatePoint(B, ad);
}

/** Định thức của cặp vectơ $(\vec{e}_1, \vec{e}_2)$ trong mặt phẳng. */
export function determinant2D(e1: Vector2D, e2: Vector2D): number {
  return e1[0] * e2[1] - e1[1] * e2[0];
}

/**
 * Tìm tọa độ affine $(x, y)$ của điểm $M$ đối với mục tiêu affine $\mathcal{R} = (O; \vec{e}_1, \vec{e}_2)$
 * sao cho $\vect{OM} = x\vec{e}_1 + y\vec{e}_2$.
 */
export function resolveAffineCoordinates(
  O: Point2D,
  e1: Vector2D,
  e2: Vector2D,
  M: Point2D,
): AffineCoordinatesResult {
  const det = determinant2D(e1, e2);
  if (Math.abs(det) <= EPSILON) {
    return {
      degenerate: true,
      determinant: 0,
      x: 0,
      y: 0,
      projE1: O,
      projE2: O,
    };
  }

  const om = vectorBetween(O, M);
  const x = (om[0] * e2[1] - om[1] * e2[0]) / det;
  const y = (e1[0] * om[1] - e1[1] * om[0]) / det;

  return {
    degenerate: false,
    determinant: det,
    x,
    y,
    projE1: translatePoint(O, scaleVec(e1, x)),
    projE2: translatePoint(O, scaleVec(e2, y)),
  };
}

/**
 * Tính tâm tỉ cự $G$ của họ điểm có trọng số $\{(A_i, \alpha_i)\}_{i=1}^k$.
 * - Nếu $\sum \alpha_i \neq 0$: tồn tại duy nhất $G$ thỏa $\sum \alpha_i \vect{GA_i} = \vec{0}$.
 * - Nếu $\sum \alpha_i = 0$: không tồn tại tâm tỉ cự, tổng $\sum \alpha_i \vect{OA_i}$ là vectơ hằng.
 */
export function computeBarycenter(items: readonly WeightedPoint2D[]): BarycenterResult {
  let sumWeight = 0;
  let sumX = 0;
  let sumY = 0;

  for (const item of items) {
    sumWeight += item.weight;
    sumX += item.weight * item.point[0];
    sumY += item.weight * item.point[1];
  }

  if (Math.abs(sumWeight) <= EPSILON) {
    return {
      exists: false,
      totalWeight: 0,
      barycenter: null,
      freeVector: [sumX, sumY],
    };
  }

  return {
    exists: true,
    totalWeight: sumWeight,
    barycenter: [sumX / sumWeight, sumY / sumWeight],
    freeVector: [0, 0],
  };
}

/**
 * Áp dụng ánh xạ affine phẳng $f(M) = A \cdot M + \vec{b}$.
 */
export function applyAffineMap2D(
  point: Point2D,
  matrix: Matrix2x2,
  translation: Vector2D,
): Point2D {
  return [
    matrix.a11 * point[0] + matrix.a12 * point[1] + translation[0],
    matrix.a21 * point[0] + matrix.a22 * point[1] + translation[1],
  ];
}

/** Làm tròn điểm tới bội số `step` gần nhất (hỗ trợ bắt dính lưới). */
export function snapPointToStep(point: Point2D, step = 0.5): Point2D {
  if (step <= 0) {
    return point;
  }
  const snap = (val: number) => {
    const rounded = Math.round(val / step) * step;
    return Object.is(rounded, -0) ? 0 : Number(rounded.toFixed(4));
  };
  return [snap(point[0]), snap(point[1])];
}

/** Định dạng số thực chuẩn gọn, khử `-0.00`. */
export function formatMathNumber(value: number, decimals = 1): string {
  const cleaned = Math.abs(value) < 1e-4 ? 0 : value;
  const fixed = cleaned.toFixed(decimals);
  return fixed.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
}

/** Định dạng tọa độ điểm hoặc vectơ $(x; y)$. */
export function formatCoords(coords: Point2D | Vector2D, decimals = 1): string {
  return `(${formatMathNumber(coords[0], decimals)}; ${formatMathNumber(coords[1], decimals)})`;
}
