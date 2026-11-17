import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import {
  computeFrameDelta,
  frameDampFactor,
  getLowLatency2DContext,
} from '@/shared/lib/canvasSprites';

interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface ProjectedPoint {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly scale: number;
}

interface ArmillaryRingSpec {
  readonly radiusX: number;
  readonly radiusY: number;
  readonly innerRatio: number;
  readonly isDoubleRim: boolean;
  readonly baseTiltX: number;
  readonly baseTiltZ: number;
  readonly speedY: number;
  readonly speedZ: number;
  readonly ringColor: string;
  readonly cometColor: string;
  readonly cometRgb: string;
  readonly spokeCount: number;
  readonly strokeWidth: number;
  readonly cometOffset: number;
  readonly cometDirection: 1 | -1;
}

interface InterferencePulse {
  active: boolean;
  progress: number;
}

interface MathParallaxGlyph {
  readonly symbol: string;
  readonly label: string;
  readonly positionClass: string;
  readonly depthFactor: number;
  readonly floatPhase: number;
  readonly toneClass: string;
}

const MATH_PARALLAX_GLYPHS: readonly MathParallaxGlyph[] = [
  {
    symbol: '∫',
    label: 'Tích phân',
    positionClass: 'top-4 left-4 text-xl sm:text-2xl',
    depthFactor: 14,
    floatPhase: 0.2,
    toneClass: 'text-[#1E322D]/24',
  },
  {
    symbol: '∂',
    label: 'Đạo hàm riêng',
    positionClass: 'top-8 right-5 text-lg sm:text-xl',
    depthFactor: -18,
    floatPhase: 1.4,
    toneClass: 'text-[#2D5266]/26',
  },
  {
    symbol: '∑',
    label: 'Tổng chuỗi',
    positionClass: 'top-1/2 left-1 text-lg sm:text-xl',
    depthFactor: 12,
    floatPhase: 2.3,
    toneClass: 'text-[#8C6D3F]/28',
  },
  {
    symbol: 'π',
    label: 'Hằng số Pi',
    positionClass: 'right-4 bottom-12 text-lg sm:text-xl',
    depthFactor: -14,
    floatPhase: 3.1,
    toneClass: 'text-[#1E322D]/24',
  },
  {
    symbol: '∆',
    label: 'Toán tử Laplace',
    positionClass: 'bottom-5 left-10 text-base sm:text-lg',
    depthFactor: 16,
    floatPhase: 4.2,
    toneClass: 'text-[#2D5266]/25',
  },
  {
    symbol: 'φ',
    label: 'Tỷ lệ vàng Phi',
    positionClass: 'top-1/3 right-2 text-lg sm:text-xl',
    depthFactor: -12,
    floatPhase: 5.0,
    toneClass: 'text-[#8C6D3F]/28',
  },
];

function dotVec3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function subVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function addVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function scaleVec3(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function normalizeVec3(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

const LIGHT_DIR = normalizeVec3({ x: -0.45, y: -0.62, z: 0.64 });
const VIEW_DIR: Vec3 = { x: 0, y: 0, z: 1 };
const HALF_LIGHT_VEC = normalizeVec3(addVec3(LIGHT_DIR, VIEW_DIR));

// Tỷ lệ vàng φ = (1 + √5) / 2 chuẩn xác cho Nhị thập diện đều (Regular Icosahedron)
const PHI = (1 + Math.sqrt(5)) / 2;

const RAW_ICO_COORDS: readonly (readonly [number, number, number])[] = [
  [-1, PHI, 0],
  [1, PHI, 0],
  [-1, -PHI, 0],
  [1, -PHI, 0],
  [0, -1, PHI],
  [0, 1, PHI],
  [0, -1, -PHI],
  [0, 1, -PHI],
  [PHI, 0, -1],
  [PHI, 0, 1],
  [-PHI, 0, -1],
  [-PHI, 0, 1],
];

const ICO_VERTICES: readonly Vec3[] = RAW_ICO_COORDS.map(([x, y, z]) => normalizeVec3({ x, y, z }));

// Tự động xây dựng 20 mặt tam giác đều khép kín & hướng pháp tuyến ra ngoài (outward CCW)
function buildIcosahedronTopology(vertices: readonly Vec3[]): {
  readonly faces: readonly (readonly [number, number, number])[];
  readonly edges: readonly (readonly [number, number])[];
} {
  const edgeThreshold = 1.15; // Độ dài cạnh chuẩn trên mặt cầu đơn vị ≈ 1.0515
  const edges: [number, number][] = [];
  const adj: boolean[][] = Array.from({ length: vertices.length }, () =>
    Array<boolean>(vertices.length).fill(false),
  );

  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      const d = subVec3(vertices[i]!, vertices[j]!);
      if (Math.hypot(d.x, d.y, d.z) < edgeThreshold) {
        adj[i]![j] = true;
        adj[j]![i] = true;
        edges.push([i, j]);
      }
    }
  }

  const faces: [number, number, number][] = [];
  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      if (!adj[i]![j]) continue;
      for (let k = j + 1; k < vertices.length; k += 1) {
        if (!adj[i]![k] || !adj[j]![k]) continue;
        const v0 = vertices[i]!;
        const v1 = vertices[j]!;
        const v2 = vertices[k]!;
        const centroid = scaleVec3(addVec3(addVec3(v0, v1), v2), 1 / 3);
        const normal = crossVec3(subVec3(v1, v0), subVec3(v2, v0));
        faces.push(dotVec3(normal, centroid) >= 0 ? [i, j, k] : [i, k, j]);
      }
    }
  }

  return { faces, edges };
}

const ICO_TOPOLOGY = buildIcosahedronTopology(ICO_VERTICES);

// Lõi Bát diện kép cắt giác sắc nét (Faceted Dual-Octahedron Crystal Core)
// Xây dựng từ bát diện chuẩn + bát diện thứ hai xoay π/4 quanh trục Y và nghiêng góc,
// tách rõ từng mặt tam giác hướng pháp tuyến ra ngoài để tô bóng chuyển sắc Vàng Kim – Hổ Phách.
const PRIMARY_OCTA_VERTS: readonly Vec3[] = [
  { x: 0, y: 1.08, z: 0 },
  { x: 0, y: -1.08, z: 0 },
  { x: 0.92, y: 0, z: 0 },
  { x: -0.92, y: 0, z: 0 },
  { x: 0, y: 0, z: 0.92 },
  { x: 0, y: 0, z: -0.92 },
];

const SECONDARY_OCTA_VERTS: readonly Vec3[] = PRIMARY_OCTA_VERTS.map((v) => {
  // Xoay chéo tạo tinh thể Bát diện sao / Bát diện kép sắc cạnh
  const a = Math.PI / 4;
  const b = 0.62;
  const x1 = v.x * Math.cos(a) - v.z * Math.sin(a);
  const z1 = v.x * Math.sin(a) + v.z * Math.cos(a);
  const y2 = v.y * Math.cos(b) - z1 * Math.sin(b);
  const z2 = v.y * Math.sin(b) + z1 * Math.cos(b);
  return { x: x1 * 0.86, y: y2 * 0.86, z: z2 * 0.86 };
});

const CRYSTAL_VERTICES: readonly Vec3[] = [...PRIMARY_OCTA_VERTS, ...SECONDARY_OCTA_VERTS];

const RAW_OCTA_TRIS: readonly (readonly [number, number, number])[] = [
  [0, 4, 2],
  [0, 2, 5],
  [0, 5, 3],
  [0, 3, 4],
  [1, 2, 4],
  [1, 5, 2],
  [1, 3, 5],
  [1, 4, 3],
];

const CRYSTAL_FACES: readonly (readonly [number, number, number])[] = [
  ...RAW_OCTA_TRIS,
  ...RAW_OCTA_TRIS.map(([a, b, c]): readonly [number, number, number] => [a + 6, b + 6, c + 6]),
].map(([i, j, k]) => {
  const v0 = CRYSTAL_VERTICES[i]!;
  const v1 = CRYSTAL_VERTICES[j]!;
  const v2 = CRYSTAL_VERTICES[k]!;
  const centroid = scaleVec3(addVec3(addVec3(v0, v1), v2), 1 / 3);
  const normal = crossVec3(subVec3(v1, v0), subVec3(v2, v0));
  return dotVec3(normal, centroid) >= 0 ? ([i, j, k] as const) : ([i, k, j] as const);
});

// Bảng lượng giác tĩnh 360° cho Đĩa La Bàn Trắc Địa (Zero GC overhead)
const DIAL_TRIG_360: readonly {
  readonly cos: number;
  readonly sin: number;
  readonly isMajor15: boolean;
  readonly isMedium5: boolean;
}[] = Array.from({ length: 360 }, (_, deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    cos: Math.cos(rad),
    sin: Math.sin(rad),
    isMajor15: deg % 15 === 0,
    isMedium5: deg % 5 === 0,
  };
});

// 4 Vòng Quỹ Đạo Thiên Cầu 3D với Vành Khuyên Kép 36 nan hoa & Đuôi Sao Chổi 4 sắc khoáng thạch
const ARMILLARY_RINGS: readonly ArmillaryRingSpec[] = [
  {
    radiusX: 0.9,
    radiusY: 0.78,
    innerRatio: 0.942,
    isDoubleRim: true,
    baseTiltX: 1.02,
    baseTiltZ: 0.24,
    speedY: 0.16,
    speedZ: 0.03,
    ringColor: '#1E3A34',
    cometColor: '#10B981',
    cometRgb: '16, 185, 129',
    spokeCount: 36,
    strokeWidth: 1.4,
    cometOffset: 0.4,
    cometDirection: 1,
  },
  {
    radiusX: 0.81,
    radiusY: 0.69,
    innerRatio: 0.948,
    isDoubleRim: true,
    baseTiltX: -0.78,
    baseTiltZ: 0.86,
    speedY: -0.21,
    speedZ: -0.04,
    ringColor: '#2D5266',
    cometColor: '#0EA5E9',
    cometRgb: '14, 165, 233',
    spokeCount: 36,
    strokeWidth: 1.32,
    cometOffset: 2.1,
    cometDirection: -1,
  },
  {
    radiusX: 0.72,
    radiusY: 0.6,
    innerRatio: 0.955,
    isDoubleRim: false,
    baseTiltX: 0.46,
    baseTiltZ: -0.72,
    speedY: 0.25,
    speedZ: 0.06,
    ringColor: '#8C6D3F',
    cometColor: '#D97706',
    cometRgb: '217, 119, 6',
    spokeCount: 24,
    strokeWidth: 1.25,
    cometOffset: 4.0,
    cometDirection: 1,
  },
  {
    radiusX: 0.63,
    radiusY: 0.52,
    innerRatio: 0.96,
    isDoubleRim: false,
    baseTiltX: 1.26,
    baseTiltZ: -0.36,
    speedY: -0.29,
    speedZ: 0.08,
    ringColor: '#6B4E46',
    cometColor: '#E11D48',
    cometRgb: '225, 29, 72',
    spokeCount: 24,
    strokeWidth: 1.18,
    cometOffset: 5.2,
    cometDirection: -1,
  },
];

function rotateVec3(v: Vec3, ax: number, ay: number, az: number): Vec3 {
  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const y1 = v.y * cx - v.z * sx;
  const z1 = v.y * sx + v.z * cx;

  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const x2 = v.x * cy + z1 * sy;
  const z2 = -v.x * sy + z1 * cy;

  const cz = Math.cos(az);
  const sz = Math.sin(az);
  return {
    x: x2 * cz - y1 * sz,
    y: x2 * sz + y1 * cz,
    z: z2,
  };
}

function projectPoint(v: Vec3, cx: number, cy: number, fov: number): ProjectedPoint {
  const dist = 3.35;
  const scale = fov / (dist - v.z);
  return {
    x: cx + v.x * scale,
    y: cy + v.y * scale,
    z: v.z,
    scale,
  };
}

interface ShadedTriangle {
  readonly indices: readonly [number, number, number];
  readonly points: readonly [ProjectedPoint, ProjectedPoint, ProjectedPoint];
  readonly avgZ: number;
  readonly normal: Vec3;
  readonly light: number;
  readonly specular: number;
  readonly fresnel: number;
  readonly isFront: boolean;
}

interface PolyhedronProjection {
  readonly worldVerts: readonly Vec3[];
  readonly projVerts: readonly ProjectedPoint[];
  readonly back: readonly ShadedTriangle[];
  readonly front: readonly ShadedTriangle[];
}

function projectPolyhedron(
  vertices: readonly Vec3[],
  faces: readonly (readonly [number, number, number])[],
  scaleFactor: number,
  rotX: number,
  rotY: number,
  rotZ: number,
  cx: number,
  cy: number,
  fov: number,
): PolyhedronProjection {
  const worldVerts = vertices.map((v) => rotateVec3(scaleVec3(v, scaleFactor), rotX, rotY, rotZ));
  const projVerts = worldVerts.map((v) => projectPoint(v, cx, cy, fov));

  const back: ShadedTriangle[] = [];
  const front: ShadedTriangle[] = [];

  for (const indices of faces) {
    const [i0, i1, i2] = indices;
    const w0 = worldVerts[i0]!;
    const w1 = worldVerts[i1]!;
    const w2 = worldVerts[i2]!;
    const normal = normalizeVec3(crossVec3(subVec3(w1, w0), subVec3(w2, w0)));
    const p0 = projVerts[i0]!;
    const p1 = projVerts[i1]!;
    const p2 = projVerts[i2]!;
    const avgZ = (p0.z + p1.z + p2.z) / 3;
    const light = Math.max(0, dotVec3(normal, LIGHT_DIR));
    const specular = Math.pow(Math.max(0, dotVec3(normal, HALF_LIGHT_VEC)), 14);
    const fresnel = Math.pow(1 - Math.max(0, normal.z), 2.2);

    const tri: ShadedTriangle = {
      indices,
      points: [p0, p1, p2],
      avgZ,
      normal,
      light,
      specular,
      fresnel,
      isFront: normal.z >= 0,
    };

    if (tri.isFront) front.push(tri);
    else back.push(tri);
  }

  back.sort((a, b) => a.avgZ - b.avgZ);
  front.sort((a, b) => a.avgZ - b.avgZ);

  return { worldVerts, projVerts, back, front };
}

function drawAstrolabeBackdrop(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  minDim: number,
): void {
  const unitScale = minDim / 460;
  const outerR = 185 * unitScale;
  const innerR = 178 * unitScale;
  const axisExtent = 198 * unitScale;

  ctx.save();

  // Hai vòng chia độ ngoại vi đồng tâm R = 185px & R = 178px (tỷ lệ theo khung nhìn)
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(30, 58, 52, 0.24)';
  ctx.lineWidth = 0.85;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(140, 109, 63, 0.26)';
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // Vòng tham chiếu trắc địa phía trong
  ctx.beginPath();
  ctx.arc(cx, cy, outerR * 0.76, 0, Math.PI * 2);
  ctx.setLineDash([3, 5]);
  ctx.strokeStyle = 'rgba(45, 82, 102, 0.14)';
  ctx.lineWidth = 0.65;
  ctx.stroke();
  ctx.setLineDash([]);

  // 360 vạch chia độ mảnh 0.5px, mỗi 15° vạch dài hơn kèm chấm mốc tọa độ nhỏ
  for (let deg = 0; deg < 360; deg += 1) {
    const t = DIAL_TRIG_360[deg]!;
    const tickStart = t.isMajor15
      ? innerR - 7.5 * unitScale
      : t.isMedium5
        ? innerR - 3.2 * unitScale
        : innerR + 1.2 * unitScale;

    ctx.beginPath();
    ctx.moveTo(cx + t.cos * tickStart, cy + t.sin * tickStart);
    ctx.lineTo(cx + t.cos * outerR, cy + t.sin * outerR);
    ctx.strokeStyle = t.isMajor15
      ? 'rgba(30, 58, 52, 0.42)'
      : t.isMedium5
        ? 'rgba(140, 109, 63, 0.30)'
        : 'rgba(30, 58, 52, 0.18)';
    ctx.lineWidth = t.isMajor15 ? 0.85 : 0.5;
    ctx.stroke();

    if (t.isMajor15) {
      const dotR = (deg % 45 === 0 ? 1.55 : 1.05) * Math.max(0.85, unitScale);
      const dotRadiusPos = outerR + 5.5 * unitScale;
      ctx.beginPath();
      ctx.arc(cx + t.cos * dotRadiusPos, cy + t.sin * dotRadiusPos, dotR, 0, Math.PI * 2);
      ctx.fillStyle = deg % 90 === 0 ? 'rgba(140, 109, 63, 0.62)' : 'rgba(36, 87, 70, 0.42)';
      ctx.fill();
    }
  }

  // 2 trục chuẩn trực vuông góc & đường chéo 45° cắt qua tâm với vạch thước ngắm (reticle ticks)
  for (const angleDeg of [0, 45, 90, 135]) {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const isCardinal = angleDeg % 90 === 0;
    const reach = isCardinal ? axisExtent : outerR * 0.96;

    ctx.beginPath();
    ctx.moveTo(cx - cos * reach, cy - sin * reach);
    ctx.lineTo(cx + cos * reach, cy + sin * reach);
    ctx.strokeStyle = isCardinal ? 'rgba(30, 58, 52, 0.14)' : 'rgba(140, 109, 63, 0.11)';
    ctx.lineWidth = isCardinal ? 0.7 : 0.55;
    ctx.stroke();

    // Reticle ticks dọc theo trục ngắm
    const perpX = -sin;
    const perpY = cos;
    const reticleSteps = isCardinal ? [0.35, 0.58, 0.82] : [0.45, 0.72];
    for (const frac of reticleSteps) {
      for (const sign of [-1, 1]) {
        const px = cx + cos * (outerR * frac * sign);
        const py = cy + sin * (outerR * frac * sign);
        const halfLen = (isCardinal ? 3.2 : 2.2) * unitScale;
        ctx.beginPath();
        ctx.moveTo(px - perpX * halfLen, py - perpY * halfLen);
        ctx.lineTo(px + perpX * halfLen, py + perpY * halfLen);
        ctx.strokeStyle = isCardinal ? 'rgba(30, 58, 52, 0.24)' : 'rgba(140, 109, 63, 0.2)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

interface OrbitalSatelliteWorld {
  readonly ringIdx: number;
  readonly ring: ArmillaryRingSpec;
  readonly worldPos: Vec3;
  readonly projPos: ProjectedPoint;
}

function drawArmillaryHalfAndCollectComet(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  ring: ArmillaryRingSpec,
  ringIdx: number,
  fov: number,
  rotX: number,
  rotY: number,
  rotZ: number,
  time: number,
  drawFrontHalf: boolean,
): OrbitalSatelliteWorld {
  const segments = 96;
  const outerProj: ProjectedPoint[] = [];
  const innerProj: ProjectedPoint[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const theta = (i / segments) * Math.PI * 2;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const wOuter = rotateVec3(
      { x: cos * ring.radiusX, y: sin * ring.radiusY, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    outerProj.push(projectPoint(wOuter, cx, cy, fov));

    if (ring.isDoubleRim) {
      const wInner = rotateVec3(
        { x: cos * ring.radiusX * ring.innerRatio, y: sin * ring.radiusY * ring.innerRatio, z: 0 },
        rotX,
        rotY,
        rotZ,
      );
      innerProj.push(projectPoint(wInner, cx, cy, fov));
    }
  }

  // Vẽ nửa sau hoặc nửa trước của vành elip (phân tách sắc nét giữa mặt trước và mặt khuất)
  for (let i = 0; i < segments; i += 1) {
    const p1 = outerProj[i]!;
    const p2 = outerProj[i + 1]!;
    const avgZ = (p1.z + p2.z) * 0.5;
    if (avgZ >= 0 !== drawFrontHalf) continue;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = ring.ringColor;
    ctx.globalAlpha = drawFrontHalf ? Math.min(0.92, 0.62 + avgZ * 0.32) : 0.35;
    ctx.lineWidth = drawFrontHalf ? ring.strokeWidth : 0.7;
    ctx.stroke();

    if (ring.isDoubleRim) {
      const ip1 = innerProj[i]!;
      const ip2 = innerProj[i + 1]!;
      ctx.beginPath();
      ctx.moveTo(ip1.x, ip1.y);
      ctx.lineTo(ip2.x, ip2.y);
      ctx.strokeStyle = '#8C6D3F';
      ctx.globalAlpha = drawFrontHalf ? 0.66 : 0.24;
      ctx.lineWidth = drawFrontHalf ? 0.95 : 0.55;
      ctx.stroke();
    }
  }

  // 36 nan hoa / vạch khắc độ 3D nối 2 đường elip song song của Vành Khuyên Kép
  const stepDeg = Math.round(360 / ring.spokeCount);
  for (let deg = 0; deg < 360; deg += stepDeg) {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const wOut = rotateVec3(
      { x: cos * ring.radiusX, y: sin * ring.radiusY, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    if (wOut.z >= 0 !== drawFrontHalf) continue;

    const innerScale = ring.isDoubleRim ? ring.innerRatio : deg % 30 === 0 ? 0.945 : 0.97;
    const wIn = rotateVec3(
      { x: cos * ring.radiusX * innerScale, y: sin * ring.radiusY * innerScale, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    const po = projectPoint(wOut, cx, cy, fov);
    const pi = projectPoint(wIn, cx, cy, fov);
    ctx.beginPath();
    ctx.moveTo(pi.x, pi.y);
    ctx.lineTo(po.x, po.y);
    ctx.strokeStyle = deg % 90 === 0 ? '#8C6D3F' : ring.ringColor;
    ctx.globalAlpha = drawFrontHalf ? 0.64 : 0.24;
    ctx.lineWidth = drawFrontHalf ? (ring.isDoubleRim ? 0.9 : 0.75) : 0.5;
    ctx.stroke();
  }

  // Vệ tinh Sao Chổi với dải đuôi cong dài 25° (14 đoạn giảm dần alpha & lineWidth)
  const omega = (0.42 + ringIdx * 0.08) * ring.cometDirection;
  const headTheta = ring.cometOffset + time * omega;
  const headWorld = rotateVec3(
    { x: Math.cos(headTheta) * ring.radiusX, y: Math.sin(headTheta) * ring.radiusY, z: 0 },
    rotX,
    rotY,
    rotZ,
  );
  const headProj = projectPoint(headWorld, cx, cy, fov);

  const trailSpanRad = (25 * Math.PI) / 180;
  const trailSegs = 14;
  for (let s = 0; s < trailSegs; s += 1) {
    const t0 = s / trailSegs;
    const t1 = (s + 1) / trailSegs;
    const a0 = headTheta - ring.cometDirection * trailSpanRad * t0;
    const a1 = headTheta - ring.cometDirection * trailSpanRad * t1;

    const w0 = rotateVec3(
      { x: Math.cos(a0) * ring.radiusX, y: Math.sin(a0) * ring.radiusY, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    const w1 = rotateVec3(
      { x: Math.cos(a1) * ring.radiusX, y: Math.sin(a1) * ring.radiusY, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    const midZ = (w0.z + w1.z) * 0.5;
    if (midZ >= 0 !== drawFrontHalf) continue;

    const p0 = projectPoint(w0, cx, cy, fov);
    const p1 = projectPoint(w1, cx, cy, fov);
    const falloff = Math.pow(1 - t0, 1.55);

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.strokeStyle = `rgba(${ring.cometRgb}, ${(falloff * (drawFrontHalf ? 0.92 : 0.34)).toFixed(3)})`;
    ctx.lineWidth = (drawFrontHalf ? 3.1 : 1.8) * (1 - t0 * 0.85);
    ctx.lineCap = 'round';
    ctx.globalAlpha = 1;
    ctx.stroke();
  }

  // Đầu sao chổi rực sáng
  if (headWorld.z >= 0 === drawFrontHalf) {
    const haloR = drawFrontHalf ? 9.5 : 5.5;
    const halo = ctx.createRadialGradient(
      headProj.x,
      headProj.y,
      0.4,
      headProj.x,
      headProj.y,
      haloR,
    );
    halo.addColorStop(0, `rgba(${ring.cometRgb}, ${drawFrontHalf ? 0.85 : 0.34})`);
    halo.addColorStop(1, `rgba(${ring.cometRgb}, 0)`);
    ctx.globalAlpha = 1;
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(headProj.x, headProj.y, haloR, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(headProj.x, headProj.y, drawFrontHalf ? 2.6 : 1.7, 0, Math.PI * 2);
    ctx.fillStyle = ring.cometColor;
    ctx.globalAlpha = drawFrontHalf ? 0.98 : 0.4;
    ctx.fill();

    if (drawFrontHalf) {
      ctx.beginPath();
      ctx.arc(headProj.x, headProj.y, 1.15, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.globalAlpha = 0.95;
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
  return { ringIdx, ring, worldPos: headWorld, projPos: headProj };
}

/**
 * Điêu Khắc Đa Diện Kép Platonic & Đĩa Thiên Văn Trắc Địa 120fps (`dual-platonic-astrolabe-v3`):
 * - Khối Nhị thập diện đều ngoài (Regular Icosahedron: 12 đỉnh tỷ lệ vàng φ, 20 mặt tam giác đều khép kín)
 *   với Back-Face Culling & Painter's Z-Sort chuẩn, tô gradient phản xạ ánh sáng Ngọc Bích & Trắng Sứ
 * - Lõi Tinh Thể Hổ Phách cắt giác sắc nét (Faceted Dual-Octahedron Crystal Core) quay ngược chiều,
 *   chuyển sắc Vàng Kim – Hổ Phách (#F5D078 -> #B87D28 -> #7C5216) + vạch khúc xạ ánh sáng trắng
 * - Đĩa la bàn chuẩn độ trắc địa 360° (R = 185px / 178px) & 4 Vòng Quỹ Đạo Thiên Cầu Kép 36 nan hoa
 * - 4 Vệ tinh Đuôi Sao Chổi 25° + Tia Liên Kết Lượng Tử có xung chạy dọc + sóng giao thoa khi di chuột
 */
export function LearningSpaceHeroCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    let width = Math.max(360, container.clientWidth || 480);
    let height = Math.max(380, container.clientHeight || 470);
    let dpr = Math.min(window.devicePixelRatio || 1, 3);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 3);
      width = Math.max(360, container.clientWidth || 480);
      height = Math.max(380, container.clientHeight || 470);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    let pointerX = 0;
    let pointerY = 0;
    let smoothX = 0;
    let smoothY = 0;
    let isHovered = false;
    let hoverMix = 0;
    let coreSpinPhase = 0;
    let isVisible = true;
    let rafId = 0;
    let elapsed = 0;
    let prevNow = performance.now();

    const pulses: InterferencePulse[] = [
      { active: false, progress: 0 },
      { active: false, progress: 0 },
      { active: false, progress: 0 },
    ];
    let lastPulseSpawnSec = -10;

    const triggerInterferenceWave = (nowSec: number) => {
      if (nowSec - lastPulseSpawnSec < 0.45) return;
      const slot = pulses.find((p) => !p.active) ?? pulses[0]!;
      slot.active = true;
      slot.progress = 0;
      lastPulseSpawnSec = nowSec;
    };

    const heroSection = container.closest('section') ?? container;

    const handleHeroPointerMove = (event: Event) => {
      const ptr = event as PointerEvent;
      const rect = heroSection.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = Math.max(-1, Math.min(1, ((ptr.clientX - rect.left) / rect.width - 0.5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((ptr.clientY - rect.top) / rect.height - 0.5) * 2));
    };

    const handleHeroPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    const handleSculptureEnter = () => {
      isHovered = true;
      triggerInterferenceWave(elapsed);
    };

    const handleSculptureMove = () => {
      if (!isHovered) {
        isHovered = true;
        triggerInterferenceWave(elapsed);
      } else if (elapsed - lastPulseSpawnSec > 1.35) {
        triggerInterferenceWave(elapsed);
      }
    };

    const handleSculptureLeave = () => {
      isHovered = false;
    };

    heroSection.addEventListener('pointermove', handleHeroPointerMove);
    heroSection.addEventListener('pointerleave', handleHeroPointerLeave);
    container.addEventListener('pointerenter', handleSculptureEnter);
    container.addEventListener('pointermove', handleSculptureMove);
    container.addEventListener('pointerleave', handleSculptureLeave);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(container);
    }

    let intersectionObserver: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      intersectionObserver.observe(container);
    }

    const updateParallaxGlyphs = (time: number) => {
      MATH_PARALLAX_GLYPHS.forEach((glyph, idx) => {
        const el = glyphRefs.current[idx];
        if (!el) return;
        const px = smoothX * glyph.depthFactor + Math.sin(time * 0.65 + glyph.floatPhase) * 4.5;
        const py = smoothY * glyph.depthFactor + Math.cos(time * 0.55 + glyph.floatPhase) * 5.5;
        el.style.transform = `translate3d(${px.toFixed(2)}px, ${py.toFixed(2)}px, 0)`;
      });
    };

    const renderFrame = (time: number, corePhase: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5 + smoothX * 8;
      const cy = height * 0.5 + smoothY * 7;
      const minDim = Math.min(width, height);
      const fov = minDim * 1.15;
      const unitScale = minDim / 460;

      // Hào quang tinh thể nền cực nhẹ giữ độ trong trẻo cho bề mặt Bạch Ngọc
      const subtleBackdropGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 195 * unitScale);
      subtleBackdropGlow.addColorStop(0, 'rgba(245, 208, 120, 0.14)');
      subtleBackdropGlow.addColorStop(0.45, 'rgba(36, 87, 70, 0.05)');
      subtleBackdropGlow.addColorStop(1, 'rgba(242, 244, 243, 0)');
      ctx.fillStyle = subtleBackdropGlow;
      ctx.fillRect(0, 0, width, height);

      // A. Đĩa chuẩn độ trắc địa tĩnh 360° phía sau (Precision Horological Astrolabe Dial)
      drawAstrolabeBackdrop(ctx, cx, cy, minDim);

      // Sóng giao thoa đồng tâm mảnh lan từ tâm ra đĩa chuẩn độ ngoài cùng khi tương tác chuột
      for (const pulse of pulses) {
        if (!pulse.active) continue;
        const p = pulse.progress;
        const radius = (22 + p * 168) * unitScale;
        const alpha = (1 - p) * (1 - p) * 0.45;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(36, 87, 70, ${alpha.toFixed(3)})`;
        ctx.lineWidth = 1.05 - p * 0.45;
        ctx.stroke();

        const innerEchoR = radius * 0.82;
        ctx.beginPath();
        ctx.arc(cx, cy, innerEchoR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(217, 119, 6, ${(alpha * 0.72).toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Góc Euler của 4 vòng Thiên Cầu (damping mượt theo chuột)
      const tiltBoost = 1 + hoverMix * 0.28;
      const ringAngles = ARMILLARY_RINGS.map((ring, idx) => ({
        rotX: ring.baseTiltX + smoothY * (0.3 * tiltBoost - idx * 0.03),
        rotY: time * ring.speedY + smoothX * (0.34 * tiltBoost - idx * 0.04),
        rotZ: ring.baseTiltZ + time * ring.speedZ,
      }));

      // LỚP 1: Nửa sau của 4 Vòng Thiên Cầu & Đuôi Sao Chổi (phía sau khối đa diện)
      const satellitesBack = ARMILLARY_RINGS.map((ring, idx) => {
        const ang = ringAngles[idx]!;
        return drawArmillaryHalfAndCollectComet(
          ctx,
          cx,
          cy,
          ring,
          idx,
          fov,
          ang.rotX,
          ang.rotY,
          ang.rotZ,
          time,
          false,
        );
      });

      // Tính phép chiếu 3D cho Khối Nhị thập diện ngoài & Lõi tinh thể Hổ Phách trong
      const outerIco = projectPolyhedron(
        ICO_VERTICES,
        ICO_TOPOLOGY.faces,
        0.39,
        time * 0.18 + smoothY * 0.46 * tiltBoost,
        time * 0.25 + smoothX * 0.52 * tiltBoost,
        time * 0.07,
        cx,
        cy,
        fov,
      );

      const coreCrystal = projectPolyhedron(
        CRYSTAL_VERTICES,
        CRYSTAL_FACES,
        0.2,
        -corePhase * 0.34 + smoothY * 0.58 * tiltBoost,
        -corePhase * 0.5 + smoothX * 0.62 * tiltBoost,
        corePhase * 0.19,
        cx,
        cy,
        fov,
      );

      // LỚP 2a: Các mặt khuất phía sau của Nhị thập diện đều (n_z < 0)
      ctx.save();
      ctx.setLineDash([2, 3]);
      for (const f of outerIco.back) {
        const [p0, p1, p2] = f.points;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(36, 87, 70, 0.04)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(30, 58, 52, 0.18)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // Đỉnh khuất của Nhị thập diện
      for (let idx = 0; idx < outerIco.worldVerts.length; idx += 1) {
        if (outerIco.worldVerts[idx]!.z >= 0) continue;
        const pv = outerIco.projVerts[idx]!;
        ctx.beginPath();
        ctx.arc(pv.x, pv.y, 1.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 251, 249, 0.65)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(36, 87, 70, 0.32)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // LỚP 2b: Lõi Tinh Thể Hổ Phách Cắt Giác Sắc Nét (#F5D078 -> #B87D28 -> #7C5216)
      for (const f of coreCrystal.back) {
        const [p0, p1, p2] = f.points;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(184, 125, 40, 0.22)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(124, 82, 22, 0.32)';
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      for (const f of coreCrystal.front) {
        const [p0, p1, p2] = f.points;
        const grad = ctx.createLinearGradient(p0.x, p0.y, (p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5);
        if (f.light > 0.52) {
          grad.addColorStop(0, '#F5D078');
          grad.addColorStop(0.55, '#B87D28');
          grad.addColorStop(1, '#7C5216');
        } else {
          grad.addColorStop(0, '#E3B652');
          grad.addColorStop(0.5, '#9F691F');
          grad.addColorStop(1, '#7C5216');
        }

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.globalAlpha = 0.78 + f.light * 0.2;
        ctx.fillStyle = grad;
        ctx.fill();

        ctx.globalAlpha = 0.85;
        ctx.strokeStyle = f.specular > 0.25 ? '#FFF8E1' : '#7C5216';
        ctx.lineWidth = 0.95;
        ctx.stroke();

        // Đường chéo khúc xạ ánh sáng trắng mảnh bên trong các mặt tinh thể đón sáng
        if (f.light > 0.34) {
          const midEdgeX = (p1.x + p2.x) * 0.5;
          const midEdgeY = (p1.y + p2.y) * 0.5;
          const innerStartX = p0.x + (midEdgeX - p0.x) * 0.16;
          const innerStartY = p0.y + (midEdgeY - p0.y) * 0.16;
          const innerEndX = p0.x + (midEdgeX - p0.x) * 0.76;
          const innerEndY = p0.y + (midEdgeY - p0.y) * 0.76;
          ctx.beginPath();
          ctx.moveTo(innerStartX, innerStartY);
          ctx.lineTo(innerEndX, innerEndY);
          ctx.strokeStyle = `rgba(255, 255, 255, ${(0.35 + f.specular * 0.52).toFixed(2)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Tia Liên Kết Lượng Tử (Vertex-to-Orbit Tethers + pulse dot chạy dọc dây nối theo hàm sin)
      for (let i = 0; i < satellitesBack.length; i += 1) {
        const sat = satellitesBack[i]!;
        const anchorIdx = i < 4 ? i * 2 : 0; // Đỉnh trên lõi bát diện
        const coreWorld = coreCrystal.worldVerts[anchorIdx]!;
        const coreProj = coreCrystal.projVerts[anchorIdx]!;
        const sp = sat.projPos;

        const tetherGrad = ctx.createLinearGradient(coreProj.x, coreProj.y, sp.x, sp.y);
        tetherGrad.addColorStop(0, 'rgba(245, 208, 120, 0.58)');
        tetherGrad.addColorStop(1, `rgba(${sat.ring.cometRgb}, 0.42)`);

        const isBackTether = sat.worldPos.z < 0 && coreWorld.z < 0;
        ctx.beginPath();
        ctx.moveTo(coreProj.x, coreProj.y);
        ctx.lineTo(sp.x, sp.y);
        ctx.strokeStyle = tetherGrad;
        ctx.globalAlpha = isBackTether ? 0.25 : 0.48;
        ctx.lineWidth = 0.75;
        ctx.stroke();

        // Xung sáng nhỏ chạy dọc dây nối theo nhịp hàm sin
        const u = 0.5 + 0.46 * Math.sin(time * (1.8 + i * 0.22) + i * 1.4);
        const px = coreProj.x + (sp.x - coreProj.x) * u;
        const py = coreProj.y + (sp.y - coreProj.y) * u;
        ctx.globalAlpha = isBackTether ? 0.35 : 0.92;
        ctx.beginPath();
        ctx.arc(px, py, 1.55, 0, Math.PI * 2);
        ctx.fillStyle = '#FAFBF9';
        ctx.fill();
        ctx.strokeStyle = sat.ring.cometColor;
        ctx.lineWidth = 0.9;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // LỚP 2c: Các mặt hướng ra trước của Nhị thập diện đều (n_z >= 0) — Painter's Z-Sort + Gradient Fresnel/Blinn-Phong
      for (const f of outerIco.front) {
        const [p0, p1, p2] = f.points;
        const oppMidX = (p1.x + p2.x) * 0.5;
        const oppMidY = (p1.y + p2.y) * 0.5;
        const faceGrad = ctx.createLinearGradient(p0.x, p0.y, oppMidX, oppMidY);

        const jadeAlpha = 0.14 + f.light * 0.1 + f.fresnel * 0.05;
        const porcelainAlpha = Math.min(0.42, 0.14 + f.light * 0.16 + f.specular * 0.35);
        faceGrad.addColorStop(0, `rgba(255, 255, 255, ${porcelainAlpha.toFixed(3)})`);
        faceGrad.addColorStop(0.55, `rgba(45, 118, 96, ${jadeAlpha.toFixed(3)})`);
        faceGrad.addColorStop(1, `rgba(27, 59, 51, ${(0.08 + (1 - f.light) * 0.1).toFixed(3)})`);

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.closePath();
        ctx.fillStyle = faceGrad;
        ctx.fill();

        ctx.strokeStyle = '#1B3B33';
        ctx.lineWidth = 1.25;
        ctx.lineJoin = 'round';
        ctx.stroke();
      }

      // Đỉnh mặt trước của Nhị thập diện (r = 1.8px, #FAFBF9 viền #245746)
      for (let idx = 0; idx < outerIco.worldVerts.length; idx += 1) {
        if (outerIco.worldVerts[idx]!.z < 0) continue;
        const pv = outerIco.projVerts[idx]!;
        ctx.beginPath();
        ctx.arc(pv.x, pv.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = '#FAFBF9';
        ctx.fill();
        ctx.strokeStyle = '#245746';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }

      // LỚP 3: Nửa trước của 4 Vòng Thiên Cầu Kép & Đầu/Đuôi Sao Chổi phía trước đa diện
      ARMILLARY_RINGS.forEach((ring, idx) => {
        const ang = ringAngles[idx]!;
        drawArmillaryHalfAndCollectComet(
          ctx,
          cx,
          cy,
          ring,
          idx,
          fov,
          ang.rotX,
          ang.rotY,
          ang.rotZ,
          time,
          true,
        );
      });

      ctx.restore();
    };

    renderFrame(0.65, 0.65);
    updateParallaxGlyphs(0.65);
    if (prefersReducedMotion) {
      return () => {
        heroSection.removeEventListener('pointermove', handleHeroPointerMove);
        heroSection.removeEventListener('pointerleave', handleHeroPointerLeave);
        container.removeEventListener('pointerenter', handleSculptureEnter);
        container.removeEventListener('pointermove', handleSculptureMove);
        container.removeEventListener('pointerleave', handleSculptureLeave);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        elapsed += dtScale / 60;
        const hoverDamp = frameDampFactor(7.0, dtSeconds);
        hoverMix += ((isHovered ? 1 : 0) - hoverMix) * hoverDamp;
        coreSpinPhase += (dtScale / 60) * (1 + hoverMix * 0.45);

        // Damping mượt góc nghiêng 3D theo chuột (~0.08 ở 60fps, bất biến ở 120fps)
        const tiltDamp = frameDampFactor(5.0, dtSeconds);
        smoothX += (pointerX - smoothX) * tiltDamp;
        smoothY += (pointerY - smoothY) * tiltDamp;

        // Cập nhật sóng giao thoa đồng tâm
        for (const pulse of pulses) {
          if (!pulse.active) continue;
          pulse.progress += dtSeconds * 0.85;
          if (pulse.progress >= 1) {
            pulse.active = false;
            pulse.progress = 0;
          }
        }

        renderFrame(elapsed, coreSpinPhase);
        updateParallaxGlyphs(elapsed);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      heroSection.removeEventListener('pointermove', handleHeroPointerMove);
      heroSection.removeEventListener('pointerleave', handleHeroPointerLeave);
      container.removeEventListener('pointerenter', handleSculptureEnter);
      container.removeEventListener('pointermove', handleSculptureMove);
      container.removeEventListener('pointerleave', handleSculptureLeave);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      data-testid="learning-space-celestial-rings"
      data-sculpture-version="dual-platonic-astrolabe-v3"
      className="relative flex h-[400px] w-full items-center justify-center select-none sm:h-[460px] lg:h-[480px]"
    >
      {/* Ký hiệu toán học vector nhỏ trôi lờ mờ theo hiệu ứng Parallax quanh khối 3D */}
      <div
        aria-hidden="true"
        data-testid="hero-math-parallax-glyphs"
        className="pointer-events-none absolute inset-0 z-20 overflow-visible"
      >
        {MATH_PARALLAX_GLYPHS.map((glyph, idx) => (
          <span
            key={glyph.symbol}
            ref={(node) => {
              glyphRefs.current[idx] = node;
            }}
            title={glyph.label}
            className={`absolute font-serif font-semibold tracking-tight italic transition-opacity duration-300 will-change-transform ${glyph.positionClass} ${glyph.toneClass}`}
          >
            {glyph.symbol}
          </span>
        ))}
      </div>

      {/* Khung SVG dự phòng thanh mảnh khi môi trường không hỗ trợ Canvas 2D */}
      <svg
        viewBox="0 0 360 360"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto h-[320px] w-[320px] opacity-20"
        fill="none"
      >
        <circle
          cx="180"
          cy="180"
          r="146"
          stroke="#8C6D3F"
          strokeWidth="0.9"
          strokeDasharray="3 5"
        />
        <ellipse
          cx="180"
          cy="180"
          rx="142"
          ry="66"
          transform="rotate(-24 180 180)"
          stroke="#10B981"
          strokeWidth="0.9"
        />
        <ellipse
          cx="180"
          cy="180"
          rx="132"
          ry="58"
          transform="rotate(34 180 180)"
          stroke="#0EA5E9"
          strokeWidth="0.9"
        />
        <polygon points="180,96 244,142 220,224 140,224 116,142" stroke="#1B3B33" strokeWidth="1" />
        <polygon points="180,126 220,192 140,192" stroke="#B87D28" strokeWidth="1" />
      </svg>

      <canvas ref={canvasRef} aria-hidden="true" className="relative z-10 block h-full w-full" />
    </div>
  );
}
