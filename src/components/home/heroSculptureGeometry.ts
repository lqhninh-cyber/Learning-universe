export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface ProjectedPoint {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export interface ArmillaryRingSpec {
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

export interface BlueprintSymbolSpec {
  readonly symbol: string;
  readonly label: string;
  readonly nx: number;
  readonly ny: number;
  readonly ampX: number;
  readonly ampY: number;
  readonly omega: number;
  readonly phase: number;
  readonly depthFactor: number;
  readonly orbitSpeed: number;
}

export function dotVec3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function subVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function addVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function scaleVec3(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

export function crossVec3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function normalizeVec3(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

export const WORLD_R_DIAL = (185 / 460) * (3.35 / 1.15);
export const ICO_TIER1_SCALE = 0.31 * WORLD_R_DIAL;
export const CORE_TIER1_SCALE = 0.165 * WORLD_R_DIAL;
export const SHININESS_BLINN = 12;

export const LIGHT_DIR = normalizeVec3({ x: -0.45, y: -0.55, z: 0.7 });
export const VIEW_DIR: Vec3 = { x: 0, y: 0, z: 1 };
export const HALF_LIGHT_VEC = normalizeVec3(addVec3(LIGHT_DIR, VIEW_DIR));

// Tỷ lệ vàng φ = (1 + √5) / 2 chuẩn xác cho khối Nhị thập diện đều
export const PHI = (1 + Math.sqrt(5)) / 2;

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

export const ICO_VERTICES: readonly Vec3[] = RAW_ICO_COORDS.map(([x, y, z]) =>
  normalizeVec3({ x, y, z }),
);

function buildIcosahedronFaces(
  vertices: readonly Vec3[],
): readonly (readonly [number, number, number])[] {
  const edgeThreshold = 1.15;
  const adj: boolean[][] = Array.from({ length: vertices.length }, () =>
    Array<boolean>(vertices.length).fill(false),
  );

  for (let i = 0; i < vertices.length; i += 1) {
    for (let j = i + 1; j < vertices.length; j += 1) {
      const d = subVec3(vertices[i]!, vertices[j]!);
      if (Math.hypot(d.x, d.y, d.z) < edgeThreshold) {
        adj[i]![j] = true;
        adj[j]![i] = true;
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

  return faces;
}

export const ICO_FACES = buildIcosahedronFaces(ICO_VERTICES);

// Lõi Bát diện kép cắt giác sắc nét (Faceted Dual-Octahedron Crystal Core)
const PRIMARY_OCTA_VERTS: readonly Vec3[] = [
  { x: 0, y: 1.08, z: 0 },
  { x: 0, y: -1.08, z: 0 },
  { x: 0.92, y: 0, z: 0 },
  { x: -0.92, y: 0, z: 0 },
  { x: 0, y: 0, z: 0.92 },
  { x: 0, y: 0, z: -0.92 },
];

const SECONDARY_OCTA_VERTS: readonly Vec3[] = PRIMARY_OCTA_VERTS.map((v) => {
  const a = Math.PI / 4;
  const b = 0.62;
  const x1 = v.x * Math.cos(a) - v.z * Math.sin(a);
  const z1 = v.x * Math.sin(a) + v.z * Math.cos(a);
  const y2 = v.y * Math.cos(b) - z1 * Math.sin(b);
  const z2 = v.y * Math.sin(b) + z1 * Math.cos(b);
  return { x: x1 * 0.86, y: y2 * 0.86, z: z2 * 0.86 };
});

export const CRYSTAL_VERTICES: readonly Vec3[] = [...PRIMARY_OCTA_VERTS, ...SECONDARY_OCTA_VERTS];

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

export const CRYSTAL_FACES: readonly (readonly [number, number, number])[] = [
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

// Bảng lượng giác tĩnh 360° cho Đĩa La Bàn Trắc Địa (O(1))
export const DIAL_TRIG_360: readonly {
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

// Bảng lượng giác 120 điểm cho 2 Vòng Sóng Đứng Điều Hòa Cầu quanh xích đạo (O(1))
export const HARMONIC_WAVE_POINTS = 120;
export const SPHERICAL_WAVE_TRIG: readonly {
  readonly theta: number;
  readonly cosT: number;
  readonly sinT: number;
}[] = Array.from({ length: HARMONIC_WAVE_POINTS }, (_, idx) => {
  const theta = (idx / HARMONIC_WAVE_POINTS) * Math.PI * 2;
  return {
    theta,
    cosT: Math.cos(theta),
    sinT: Math.sin(theta),
  };
});

// 4 Vòng Quỹ Đạo Thiên Cầu nằm gọn trong Tầng 2 (0.48 * R_dial -> 0.78 * R_dial) tạo khoảng thở rõ quanh lõi
export const ARMILLARY_RINGS: readonly ArmillaryRingSpec[] = [
  {
    radiusX: 0.76 * WORLD_R_DIAL,
    radiusY: 0.7 * WORLD_R_DIAL,
    innerRatio: 0.942,
    isDoubleRim: true,
    baseTiltX: 0.44,
    baseTiltZ: 0.24,
    speedY: 0.16,
    speedZ: 0.08,
    ringColor: '#6B5335',
    cometColor: '#9C7A4C',
    cometRgb: '156, 122, 76',
    spokeCount: 36,
    strokeWidth: 1.4,
    cometOffset: 0.4,
    cometDirection: 1,
  },
  {
    radiusX: 0.69 * WORLD_R_DIAL,
    radiusY: 0.64 * WORLD_R_DIAL,
    innerRatio: 0.948,
    isDoubleRim: true,
    baseTiltX: -0.46,
    baseTiltZ: 0.86,
    speedY: -0.21,
    speedZ: -0.1,
    ringColor: '#2D5266',
    cometColor: '#49768F',
    cometRgb: '73, 118, 143',
    spokeCount: 36,
    strokeWidth: 1.32,
    cometOffset: 2.1,
    cometDirection: -1,
  },
  {
    radiusX: 0.63 * WORLD_R_DIAL,
    radiusY: 0.58 * WORLD_R_DIAL,
    innerRatio: 0.955,
    isDoubleRim: false,
    baseTiltX: 0.38,
    baseTiltZ: -0.72,
    speedY: 0.25,
    speedZ: 0.12,
    ringColor: '#245746',
    cometColor: '#3B7A65',
    cometRgb: '59, 122, 101',
    spokeCount: 24,
    strokeWidth: 1.25,
    cometOffset: 4.0,
    cometDirection: 1,
  },
  {
    radiusX: 0.57 * WORLD_R_DIAL,
    radiusY: 0.54 * WORLD_R_DIAL,
    innerRatio: 0.96,
    isDoubleRim: false,
    baseTiltX: -0.32,
    baseTiltZ: -0.36,
    speedY: -0.29,
    speedZ: -0.14,
    ringColor: '#7A463B',
    cometColor: '#9E6356',
    cometRgb: '158, 99, 86',
    spokeCount: 24,
    strokeWidth: 1.18,
    cometOffset: 5.2,
    cometDirection: -1,
  },
];

// 8 Nút Giao Bản Vẽ Động (Animated Blueprint Nodes) với quỹ đạo Lissajous vi mô
export const BLUEPRINT_SYMBOLS: readonly BlueprintSymbolSpec[] = [
  {
    symbol: '∫',
    label: 'Tích phân',
    nx: 0.12,
    ny: 0.14,
    ampX: 5.5,
    ampY: 6.5,
    omega: 0.72,
    phase: 0.3,
    depthFactor: 11,
    orbitSpeed: 0.9,
  },
  {
    symbol: '∂',
    label: 'Đạo hàm riêng',
    nx: 0.88,
    ny: 0.15,
    ampX: 6.0,
    ampY: 5.2,
    omega: 0.66,
    phase: 1.2,
    depthFactor: -13,
    orbitSpeed: -0.85,
  },
  {
    symbol: '∑',
    label: 'Tổng chuỗi',
    nx: 0.09,
    ny: 0.51,
    ampX: 5.0,
    ampY: 7.0,
    omega: 0.58,
    phase: 2.1,
    depthFactor: 10,
    orbitSpeed: 1.05,
  },
  {
    symbol: 'π',
    label: 'Hằng số Pi',
    nx: 0.89,
    ny: 0.81,
    ampX: 6.2,
    ampY: 5.8,
    omega: 0.74,
    phase: 3.0,
    depthFactor: -11,
    orbitSpeed: -0.95,
  },
  {
    symbol: '∆',
    label: 'Toán tử Laplace',
    nx: 0.14,
    ny: 0.84,
    ampX: 5.8,
    ampY: 5.0,
    omega: 0.64,
    phase: 4.1,
    depthFactor: 12,
    orbitSpeed: 0.82,
  },
  {
    symbol: 'φ',
    label: 'Tỷ lệ vàng Phi',
    nx: 0.91,
    ny: 0.47,
    ampX: 5.4,
    ampY: 6.8,
    omega: 0.68,
    phase: 5.0,
    depthFactor: -10,
    orbitSpeed: 0.96,
  },
  {
    symbol: '∀',
    label: 'Lượng từ phổ dụng',
    nx: 0.25,
    ny: 0.08,
    ampX: 4.8,
    ampY: 4.4,
    omega: 0.62,
    phase: 2.6,
    depthFactor: 9,
    orbitSpeed: -0.78,
  },
  {
    symbol: '≃',
    label: 'Đẳng cấu & Tương đương',
    nx: 0.77,
    ny: 0.91,
    ampX: 5.2,
    ampY: 4.6,
    omega: 0.7,
    phase: 3.8,
    depthFactor: -9,
    orbitSpeed: 0.88,
  },
];

export function rotateVec3Into(v: Vec3, ax: number, ay: number, az: number, out: Vec3): Vec3 {
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
  out.x = x2 * cz - y1 * sz;
  out.y = x2 * sz + y1 * cz;
  out.z = z2;
  return out;
}

export function rotateVec3ScaledInto(
  v: Vec3,
  scaleFactor: number,
  ax: number,
  ay: number,
  az: number,
  out: Vec3,
): Vec3 {
  const sxv = v.x * scaleFactor;
  const syv = v.y * scaleFactor;
  const szv = v.z * scaleFactor;

  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const y1 = syv * cx - szv * sx;
  const z1 = syv * sx + szv * cx;

  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const x2 = sxv * cy + z1 * sy;
  const z2 = -sxv * sy + z1 * cy;

  const cz = Math.cos(az);
  const sz = Math.sin(az);
  out.x = x2 * cz - y1 * sz;
  out.y = x2 * sz + y1 * cz;
  out.z = z2;
  return out;
}

export function projectPointInto(
  v: Vec3,
  cx: number,
  cy: number,
  fov: number,
  out: ProjectedPoint,
): ProjectedPoint {
  const dist = 3.35;
  const scale = fov / (dist - v.z);
  out.x = cx + v.x * scale;
  out.y = cy + v.y * scale;
  out.z = v.z;
  out.scale = scale;
  return out;
}

export function angleLerp(current: number, target: number, t: number): number {
  const diff = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + diff * t;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const tmp = y;
    y = x % y;
    x = tmp;
  }
  return x || 1;
}

export function formatAlidadeAngle(angleRad: number): string {
  const twoPi = Math.PI * 2;
  const norm = ((angleRad % twoPi) + twoPi) % twoPi;
  const deg = Math.round((norm * 180) / Math.PI) % 360;
  const twelfth = Math.round((norm / Math.PI) * 12);
  const errRad = Math.abs(norm - (twelfth / 12) * Math.PI);

  if (errRad < 0.045) {
    const num = twelfth % 24;
    if (num === 0) return `${deg}° · 0π`;
    const g = gcd(num, 12);
    const sn = num / g;
    const sd = 12 / g;
    if (sd === 1) return `${deg}° · ${sn === 1 ? 'π' : `${sn}π`}`;
    return `${deg}° · ${sn === 1 ? '' : sn}π/${sd}`;
  }

  return `${deg}° · ${(norm / Math.PI).toFixed(2)}π`;
}
