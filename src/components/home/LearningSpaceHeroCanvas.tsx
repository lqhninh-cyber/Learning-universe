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
  readonly baseTiltX: number;
  readonly baseTiltZ: number;
  readonly speedY: number;
  readonly speedZ: number;
  readonly color: string;
  readonly accentColor: string;
  readonly nodeGlowRgba: string;
  readonly tickStepDeg: number;
  readonly strokeWidth: number;
}

interface HarmonicDustParticle {
  readonly baseRadius: number;
  readonly goldenAngle: number;
  readonly verticalTilt: number;
  readonly orbitSpeed: number;
  readonly size: number;
  readonly hue: 'gold' | 'jade' | 'cyan';
  readonly phase: number;
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
    positionClass: 'top-5 left-4 text-xl sm:text-2xl',
    depthFactor: 14,
    floatPhase: 0.2,
    toneClass: 'text-[#1E322D]/22',
  },
  {
    symbol: '∂',
    label: 'Đạo hàm riêng',
    positionClass: 'top-10 right-6 text-lg sm:text-xl',
    depthFactor: -18,
    floatPhase: 1.4,
    toneClass: 'text-[#2D5266]/25',
  },
  {
    symbol: '∑',
    label: 'Tổng chuỗi',
    positionClass: 'top-1/2 -left-1 text-lg sm:text-xl',
    depthFactor: 12,
    floatPhase: 2.3,
    toneClass: 'text-[#8C6D3F]/28',
  },
  {
    symbol: 'π',
    label: 'Hằng số Pi',
    positionClass: 'right-3 bottom-16 text-lg sm:text-xl',
    depthFactor: -14,
    floatPhase: 3.1,
    toneClass: 'text-[#1E322D]/22',
  },
  {
    symbol: '∆',
    label: 'Toán tử Laplace',
    positionClass: 'bottom-6 left-10 text-base sm:text-lg',
    depthFactor: 16,
    floatPhase: 4.2,
    toneClass: 'text-[#2D5266]/24',
  },
  {
    symbol: 'φ',
    label: 'Tỷ lệ vàng Phi',
    positionClass: 'top-1/3 right-1 text-lg sm:text-xl',
    depthFactor: -12,
    floatPhase: 5.0,
    toneClass: 'text-[#8C6D3F]/26',
  },
];

function dotVec3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function subVec3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
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

const LIGHT_DIR = normalizeVec3({ x: -0.46, y: -0.64, z: 0.61 });
const VIEW_DIR: Vec3 = { x: 0, y: 0, z: 1 };

const PHI = (1 + Math.sqrt(5)) / 2;
const INV_PHI = 1 / PHI;

// 1. Lõi Bát diện đều bên trong (Octahedron Core - 6 đỉnh, 8 mặt tam giác đều)
const OCTA_VERTICES: readonly Vec3[] = [
  { x: 0, y: 1.08, z: 0 },
  { x: 0, y: -1.08, z: 0 },
  { x: 0.96, y: 0, z: 0 },
  { x: -0.96, y: 0, z: 0 },
  { x: 0, y: 0, z: 0.96 },
  { x: 0, y: 0, z: -0.96 },
];

const OCTA_FACES: readonly (readonly [number, number, number])[] = [
  [0, 4, 2],
  [0, 2, 5],
  [0, 5, 3],
  [0, 3, 4],
  [1, 2, 4],
  [1, 5, 2],
  [1, 3, 5],
  [1, 4, 3],
];

// Nhị thập diện đều phụ dùng để dựng mặt phẳng cho Thập nhị diện đều bao ngoài
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

// 2. Khối Thập nhị diện đều bao ngoài (Dodecahedron - 20 đỉnh, 12 mặt ngũ giác đều)
const RAW_DODECA_COORDS: readonly (readonly [number, number, number])[] = [
  [-1, -1, -1],
  [-1, -1, 1],
  [-1, 1, -1],
  [-1, 1, 1],
  [1, -1, -1],
  [1, -1, 1],
  [1, 1, -1],
  [1, 1, 1],
  [0, -INV_PHI, -PHI],
  [0, -INV_PHI, PHI],
  [0, INV_PHI, -PHI],
  [0, INV_PHI, PHI],
  [-INV_PHI, -PHI, 0],
  [-INV_PHI, PHI, 0],
  [INV_PHI, -PHI, 0],
  [INV_PHI, PHI, 0],
  [-PHI, 0, -INV_PHI],
  [-PHI, 0, INV_PHI],
  [PHI, 0, -INV_PHI],
  [PHI, 0, INV_PHI],
];

const DODECA_VERTICES: readonly Vec3[] = RAW_DODECA_COORDS.map(([x, y, z]) =>
  normalizeVec3({ x, y, z }),
);

const DODECA_FACES: readonly (readonly number[])[] = ICO_VERTICES.map((faceNormal) => {
  const nearest = DODECA_VERTICES.map((v, index) => ({
    index,
    v,
    d: dotVec3(v, faceNormal),
  }))
    .sort((a, b) => b.d - a.d)
    .slice(0, 5);

  const upHint = Math.abs(faceNormal.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
  const tangentU = normalizeVec3(crossVec3(upHint, faceNormal));
  const tangentW = crossVec3(faceNormal, tangentU);

  const ordered = [...nearest]
    .sort(
      (a, b) =>
        Math.atan2(dotVec3(a.v, tangentW), dotVec3(a.v, tangentU)) -
        Math.atan2(dotVec3(b.v, tangentW), dotVec3(b.v, tangentU)),
    )
    .map((entry) => entry.index);

  const p0 = DODECA_VERTICES[ordered[0]!]!;
  const p1 = DODECA_VERTICES[ordered[1]!]!;
  const p2 = DODECA_VERTICES[ordered[2]!]!;
  const nCheck = crossVec3(subVec3(p1, p0), subVec3(p2, p0));
  return dotVec3(nCheck, faceNormal) < 0 ? [...ordered].reverse() : ordered;
});

// 3. Hệ 4 Vòng Elip Quỹ Đạo Thiên Cầu Khắc Độ (Engraved Elliptical Orbit Rings)
const ARMILLARY_RINGS: readonly ArmillaryRingSpec[] = [
  {
    radiusX: 0.78,
    radiusY: 0.68,
    baseTiltX: 0.96,
    baseTiltZ: 0.22,
    speedY: 0.14,
    speedZ: 0.03,
    color: '#1E3A34',
    accentColor: '#34D399',
    nodeGlowRgba: 'rgba(52, 211, 153, 0.85)',
    tickStepDeg: 10,
    strokeWidth: 1.5,
  },
  {
    radiusX: 0.7,
    radiusY: 0.59,
    baseTiltX: -0.78,
    baseTiltZ: 0.84,
    speedY: -0.19,
    speedZ: -0.04,
    color: '#2D5266',
    accentColor: '#38BDF8',
    nodeGlowRgba: 'rgba(56, 189, 248, 0.85)',
    tickStepDeg: 15,
    strokeWidth: 1.38,
  },
  {
    radiusX: 0.62,
    radiusY: 0.52,
    baseTiltX: 0.44,
    baseTiltZ: -0.68,
    speedY: 0.24,
    speedZ: 0.07,
    color: '#8C6D3F',
    accentColor: '#E5B85B',
    nodeGlowRgba: 'rgba(229, 184, 91, 0.9)',
    tickStepDeg: 30,
    strokeWidth: 1.25,
  },
  {
    radiusX: 0.54,
    radiusY: 0.45,
    baseTiltX: 1.24,
    baseTiltZ: -0.34,
    speedY: -0.27,
    speedZ: 0.09,
    color: '#2B5B50',
    accentColor: '#34D399',
    nodeGlowRgba: 'rgba(52, 211, 153, 0.82)',
    tickStepDeg: 30,
    strokeWidth: 1.15,
  },
];

// 4. Hạt bụi sáng tỷ lệ vàng xoắn ốc & trường sóng điều hòa
const GOLDEN_ANGLE_RAD = Math.PI * (3 - Math.sqrt(5));
const HARMONIC_DUST: readonly HarmonicDustParticle[] = Array.from({ length: 30 }, (_, idx) => {
  const norm = (idx + 1) / 30;
  const hues: readonly ('gold' | 'jade' | 'cyan')[] = ['gold', 'jade', 'cyan'];
  return {
    baseRadius: 0.42 + Math.sqrt(norm) * 0.46,
    goldenAngle: idx * GOLDEN_ANGLE_RAD,
    verticalTilt: ((idx % 7) - 3) * 0.18,
    orbitSpeed: 0.09 + (idx % 5) * 0.025,
    size: 1.2 + (idx % 3) * 0.55,
    hue: hues[idx % 3]!,
    phase: idx * 0.55,
  };
});

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
  const dist = 3.25;
  const scale = fov / (dist - v.z);
  return {
    x: cx + v.x * scale,
    y: cy + v.y * scale,
    z: v.z,
    scale,
  };
}

interface ShadedFaceItem {
  readonly points: readonly ProjectedPoint[];
  readonly avgZ: number;
  readonly light: number;
  readonly specular: number;
  readonly normalBlend: number;
  readonly isFront: boolean;
}

function buildPolyhedronFaces(
  vertices: readonly Vec3[],
  faces: readonly (readonly number[])[],
  scaleFactor: number,
  rotX: number,
  rotY: number,
  rotZ: number,
  cx: number,
  cy: number,
  fov: number,
): { readonly back: readonly ShadedFaceItem[]; readonly front: readonly ShadedFaceItem[] } {
  const worldVerts = vertices.map((v) =>
    rotateVec3(
      { x: v.x * scaleFactor, y: v.y * scaleFactor, z: v.z * scaleFactor },
      rotX,
      rotY,
      rotZ,
    ),
  );
  const projVerts = worldVerts.map((v) => projectPoint(v, cx, cy, fov));

  const back: ShadedFaceItem[] = [];
  const front: ShadedFaceItem[] = [];

  for (const faceIndices of faces) {
    const w0 = worldVerts[faceIndices[0]!]!;
    const w1 = worldVerts[faceIndices[1]!]!;
    const w2 = worldVerts[faceIndices[2]!]!;
    const normal = normalizeVec3(crossVec3(subVec3(w1, w0), subVec3(w2, w0)));
    const light = Math.max(0, dotVec3(normal, LIGHT_DIR));
    const halfVec = normalizeVec3({
      x: LIGHT_DIR.x + VIEW_DIR.x,
      y: LIGHT_DIR.y + VIEW_DIR.y,
      z: LIGHT_DIR.z + VIEW_DIR.z,
    });
    const specular = Math.pow(Math.max(0, dotVec3(normal, halfVec)), 10);
    const normalBlend = Math.max(0, Math.min(1, 0.5 + normal.x * 0.45 - normal.y * 0.25));
    let avgZ = 0;
    const pts: ProjectedPoint[] = [];
    for (const idx of faceIndices) {
      const p = projVerts[idx]!;
      pts.push(p);
      avgZ += p.z;
    }
    avgZ /= faceIndices.length;

    const item: ShadedFaceItem = {
      points: pts,
      avgZ,
      light,
      specular,
      normalBlend,
      isFront: normal.z >= -0.04,
    };
    if (item.isFront) front.push(item);
    else back.push(item);
  }

  back.sort((a, b) => a.avgZ - b.avgZ);
  front.sort((a, b) => a.avgZ - b.avgZ);
  return { back, front };
}

function drawPolygonFace(
  ctx: CanvasRenderingContext2D,
  pts: readonly ProjectedPoint[],
  fillStyle: string,
  strokeStyle: string,
  lineWidth: number,
): void {
  if (pts.length === 0) return;
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < pts.length; i += 1) {
    ctx.lineTo(pts[i]!.x, pts[i]!.y);
  }
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

function drawArmillaryHalf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  ring: ArmillaryRingSpec,
  fov: number,
  rotX: number,
  rotY: number,
  rotZ: number,
  time: number,
  drawFrontHalf: boolean,
): void {
  const segments = 96;
  const projPoints: ProjectedPoint[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const theta = (i / segments) * Math.PI * 2;
    const world = rotateVec3(
      { x: Math.cos(theta) * ring.radiusX, y: Math.sin(theta) * ring.radiusY, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    projPoints.push(projectPoint(world, cx, cy, fov));
  }

  // Vẽ nửa sau hoặc nửa trước của vòng quỹ đạo elip 3D
  for (let i = 0; i < segments; i += 1) {
    const p1 = projPoints[i]!;
    const p2 = projPoints[i + 1]!;
    const avgZ = (p1.z + p2.z) * 0.5;
    if (avgZ >= 0 !== drawFrontHalf) continue;

    const alpha = Math.max(0.22, Math.min(0.84, 0.44 + avgZ * 0.44));
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = ring.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = drawFrontHalf ? ring.strokeWidth * 1.15 : ring.strokeWidth * 0.7;
    ctx.stroke();
  }

  // Vạch khắc độ chia độ góc trên vòng quỹ đạo
  for (let deg = 0; deg < 360; deg += ring.tickStepDeg) {
    const rad = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const tickRatio = isMajor ? 0.052 : 0.028;
    const outerW = rotateVec3(
      { x: Math.cos(rad) * ring.radiusX, y: Math.sin(rad) * ring.radiusY, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    if (outerW.z >= 0 !== drawFrontHalf) continue;

    const innerW = rotateVec3(
      {
        x: Math.cos(rad) * ring.radiusX * (1 - tickRatio),
        y: Math.sin(rad) * ring.radiusY * (1 - tickRatio),
        z: 0,
      },
      rotX,
      rotY,
      rotZ,
    );
    const pi = projectPoint(innerW, cx, cy, fov);
    const po = projectPoint(outerW, cx, cy, fov);
    ctx.beginPath();
    ctx.moveTo(pi.x, pi.y);
    ctx.lineTo(po.x, po.y);
    ctx.strokeStyle = isMajor ? ring.accentColor : ring.color;
    ctx.globalAlpha = drawFrontHalf ? (isMajor ? 0.78 : 0.44) : 0.22;
    ctx.lineWidth = isMajor ? 1.2 : 0.7;
    ctx.stroke();
  }

  // Hạt sáng nhỏ chuyển động dọc quỹ đạo
  for (const particleOffset of [1.25, Math.PI + 1.25]) {
    const pTheta = particleOffset - time * ring.speedY * 1.65;
    const pWorld = rotateVec3(
      { x: Math.cos(pTheta) * ring.radiusX, y: Math.sin(pTheta) * ring.radiusY, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    if (pWorld.z >= 0 !== drawFrontHalf) continue;
    const pp = projectPoint(pWorld, cx, cy, fov);
    ctx.globalAlpha = drawFrontHalf ? 0.78 : 0.28;
    ctx.beginPath();
    ctx.arc(pp.x, pp.y, drawFrontHalf ? 1.9 : 1.3, 0, Math.PI * 2);
    ctx.fillStyle = ring.accentColor;
    ctx.fill();
  }

  // Điểm nút giao (Glowing Nodes) có tia sáng mảnh nối trực tiếp về tâm
  for (const offset of [0.4, Math.PI + 0.4]) {
    const nodeTheta = offset + time * ring.speedY * 1.3;
    const nodeW = rotateVec3(
      { x: Math.cos(nodeTheta) * ring.radiusX, y: Math.sin(nodeTheta) * ring.radiusY, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    if (nodeW.z >= 0 !== drawFrontHalf) continue;
    const np = projectPoint(nodeW, cx, cy, fov);

    // Tia sáng mảnh nối trực tiếp từ Điểm nút giao về tâm (cx, cy)
    const rayGrad = ctx.createLinearGradient(cx, cy, np.x, np.y);
    rayGrad.addColorStop(0, 'rgba(229, 184, 91, 0.58)');
    rayGrad.addColorStop(0.55, ring.nodeGlowRgba);
    rayGrad.addColorStop(1, ring.accentColor);

    ctx.globalAlpha = drawFrontHalf ? 0.52 : 0.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(np.x, np.y);
    ctx.strokeStyle = rayGrad;
    ctx.lineWidth = drawFrontHalf ? 0.95 : 0.65;
    ctx.stroke();

    // Quầng sáng mềm quanh Điểm nút giao
    const glowR = drawFrontHalf ? 10 : 6.5;
    const nodeHalo = ctx.createRadialGradient(np.x, np.y, 0.5, np.x, np.y, glowR);
    nodeHalo.addColorStop(0, ring.nodeGlowRgba);
    nodeHalo.addColorStop(1, 'rgba(250, 251, 249, 0)');
    ctx.globalAlpha = drawFrontHalf ? 0.82 : 0.34;
    ctx.fillStyle = nodeHalo;
    ctx.beginPath();
    ctx.arc(np.x, np.y, glowR, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = drawFrontHalf ? 0.96 : 0.38;
    ctx.beginPath();
    ctx.arc(np.x, np.y, drawFrontHalf ? 3.3 : 2.1, 0, Math.PI * 2);
    ctx.fillStyle = ring.accentColor;
    ctx.fill();
    if (drawFrontHalf) {
      ctx.beginPath();
      ctx.arc(np.x, np.y, 1.35, 0, Math.PI * 2);
      ctx.fillStyle = '#FAFBF9';
      ctx.fill();
    }
  }

  ctx.globalAlpha = 1;
}

/**
 * Điêu Khắc Đa Diện Lồng Nhau & Thiên Cầu Hoàng Kim 3D (120FPS Volumetric Sculpture):
 * Khối trang trí hình học tinh khiết bên phải Hero:
 * - Thập nhị diện đều bán trong suốt bao bọc Nhị thập diện đều ấm áp bên trong
 * - Lõi Bát diện đều Vàng Hổ Phách (#E5B85B) phát sáng cùng hiệu ứng tỏa tia sáng mềm
 * - Lớp vỏ Thập nhị diện đều bán trong suốt tô bóng pháp tuyến Z-sorted (#34D399 & #38BDF8)
 * - Hệ 4 vòng Elip Quỹ đạo 3D với hạt sáng & Điểm nút giao (Glowing Nodes) nối tia về tâm
 * - Tương tác pitch/yaw damping mượt mà theo tọa độ chuột + ký hiệu toán học Parallax (120fps)
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
    let height = Math.max(360, container.clientHeight || 450);
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = Math.max(360, container.clientWidth || 480);
      height = Math.max(360, container.clientHeight || 450);
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
    let isVisible = true;
    let rafId = 0;
    let elapsed = 0;
    let prevNow = performance.now();

    const heroSection = container.closest('section') ?? container;

    const handlePointerMove = (event: Event) => {
      const ptr = event as PointerEvent;
      const rect = heroSection.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = Math.max(-1, Math.min(1, ((ptr.clientX - rect.left) / rect.width - 0.5) * 2));
      pointerY = Math.max(-1, Math.min(1, ((ptr.clientY - rect.top) / rect.height - 0.5) * 2));
    };

    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    heroSection.addEventListener('pointermove', handlePointerMove);
    heroSection.addEventListener('pointerleave', handlePointerLeave);

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

    const renderFrame = (time: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5 + smoothX * 11;
      const cy = height * 0.5 + smoothY * 10;
      const minDim = Math.min(width, height);
      const fov = minDim * 1.18;

      // Hào quang tinh thể nhiều tầng phía sau khối điêu khắc (Vàng Hổ Phách #E5B85B + Ngọc Lam)
      const outerHalo = ctx.createRadialGradient(cx, cy, 8, cx, cy, minDim * 0.54);
      outerHalo.addColorStop(0, 'rgba(229, 184, 91, 0.28)');
      outerHalo.addColorStop(0.36, 'rgba(52, 211, 153, 0.11)');
      outerHalo.addColorStop(0.68, 'rgba(56, 189, 248, 0.07)');
      outerHalo.addColorStop(1, 'rgba(242, 244, 243, 0)');
      ctx.fillStyle = outerHalo;
      ctx.fillRect(0, 0, width, height);

      // Trường sóng điều hòa mảnh đồng bộ góc nghiêng 3D
      for (const wave of [
        {
          rx: minDim * 0.45,
          ry: minDim * 0.16,
          tilt: -0.32 + smoothY * 0.1,
          color: 'rgba(140, 109, 63, 0.20)',
        },
        {
          rx: minDim * 0.48,
          ry: minDim * 0.19,
          tilt: 0.46 - smoothY * 0.08,
          color: 'rgba(45, 82, 102, 0.16)',
        },
      ]) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(wave.tilt + Math.sin(time * 0.22) * 0.04);
        ctx.beginPath();
        for (let s = 0; s <= 72; s += 1) {
          const th = (s / 72) * Math.PI * 2;
          const amp = 3.5 * Math.sin(th * 6 + time * 1.2);
          const wx = (wave.rx + amp) * Math.cos(th);
          const wy = (wave.ry + amp * 0.45) * Math.sin(th);
          if (s === 0) ctx.moveTo(wx, wy);
          else ctx.lineTo(wx, wy);
        }
        ctx.closePath();
        ctx.strokeStyle = wave.color;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }

      // Góc Euler của 4 vòng Elip Quỹ đạo (tương tác pitch/yaw theo chuột)
      const ringAngles = ARMILLARY_RINGS.map((ring, idx) => ({
        rotX: ring.baseTiltX + smoothY * (0.28 - idx * 0.03),
        rotY: time * ring.speedY + smoothX * (0.32 - idx * 0.04),
        rotZ: ring.baseTiltZ + time * ring.speedZ,
      }));

      // LỚP 1: Nửa sau của 4 Vòng Elip Quỹ đạo & Điểm nút giao (phía sau đa diện)
      ARMILLARY_RINGS.forEach((ring, idx) => {
        const ang = ringAngles[idx]!;
        drawArmillaryHalf(ctx, cx, cy, ring, fov, ang.rotX, ang.rotY, ang.rotZ, time, false);
      });

      // Hạt sáng xoắn ốc tỷ lệ vàng phía sau tâm
      const dustProjected = HARMONIC_DUST.map((pt) => {
        const a = pt.goldenAngle + time * pt.orbitSpeed;
        const w = rotateVec3(
          {
            x: Math.cos(a) * pt.baseRadius,
            y: Math.sin(a * 0.7 + time * 0.5 + pt.phase) * 0.18 + pt.verticalTilt,
            z: Math.sin(a) * pt.baseRadius,
          },
          smoothY * 0.25,
          smoothX * 0.28,
          0.12,
        );
        return { w, p: projectPoint(w, cx, cy, fov), pt };
      });

      for (const item of dustProjected) {
        if (item.w.z >= 0) continue;
        ctx.beginPath();
        ctx.arc(item.p.x, item.p.y, item.pt.size * 0.85, 0, Math.PI * 2);
        ctx.fillStyle =
          item.pt.hue === 'gold'
            ? 'rgba(229, 184, 91, 0.44)'
            : item.pt.hue === 'cyan'
              ? 'rgba(56, 189, 248, 0.36)'
              : 'rgba(52, 211, 153, 0.36)';
        ctx.fill();
      }

      // LỚP 2: Lớp vỏ Thập nhị diện đều (Dodecahedron) & Lõi Bát diện Vàng Hổ Phách (Octahedron)
      const dodecaFaces = buildPolyhedronFaces(
        DODECA_VERTICES,
        DODECA_FACES,
        0.38,
        time * 0.19 + smoothY * 0.48,
        time * 0.28 + smoothX * 0.52,
        time * 0.08,
        cx,
        cy,
        fov,
      );

      const octaFaces = buildPolyhedronFaces(
        OCTA_VERTICES,
        OCTA_FACES,
        0.215,
        -time * 0.36 + smoothY * 0.58,
        -time * 0.48 + smoothX * 0.62,
        time * 0.15,
        cx,
        cy,
        fov,
      );

      // 2a. Mặt sau bán trong suốt của Vỏ Đa Diện Ngoài (tô bóng Z-sorted #34D399 <-> #38BDF8)
      for (const f of dodecaFaces.back) {
        const r = Math.round(52 * (1 - f.normalBlend) + 56 * f.normalBlend);
        const g = Math.round(211 * (1 - f.normalBlend) + 189 * f.normalBlend);
        const b = Math.round(153 * (1 - f.normalBlend) + 248 * f.normalBlend);
        const alpha = 0.08 + f.light * 0.11;
        drawPolygonFace(
          ctx,
          f.points,
          `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`,
          'rgba(45, 82, 102, 0.18)',
          0.72,
        );
      }

      // 2b. Hiệu ứng tỏa tia sáng mềm quanh Lõi Vàng Hổ Phách (#E5B85B)
      const rayPulse = 0.88 + Math.sin(time * 1.9) * 0.12;
      const rayRadius = minDim * 0.22 * rayPulse;
      const amberCoreHalo = ctx.createRadialGradient(cx, cy, 2, cx, cy, rayRadius);
      amberCoreHalo.addColorStop(0, 'rgba(255, 248, 224, 0.94)');
      amberCoreHalo.addColorStop(0.32, 'rgba(229, 184, 91, 0.58)');
      amberCoreHalo.addColorStop(0.7, 'rgba(229, 184, 91, 0.16)');
      amberCoreHalo.addColorStop(1, 'rgba(229, 184, 91, 0)');
      ctx.fillStyle = amberCoreHalo;
      ctx.beginPath();
      ctx.arc(cx, cy, rayRadius, 0, Math.PI * 2);
      ctx.fill();

      // Tia sáng mềm tỏa ra từ tâm bát diện
      for (let rayIdx = 0; rayIdx < 6; rayIdx += 1) {
        const rayAngle = (rayIdx / 6) * Math.PI + time * 0.18 + smoothX * 0.25;
        const rayLen = minDim * (0.17 + (rayIdx % 2) * 0.05) * rayPulse;
        const rx1 = cx - Math.cos(rayAngle) * rayLen;
        const ry1 = cy - Math.sin(rayAngle) * rayLen;
        const rx2 = cx + Math.cos(rayAngle) * rayLen;
        const ry2 = cy + Math.sin(rayAngle) * rayLen;
        const beamGrad = ctx.createLinearGradient(rx1, ry1, rx2, ry2);
        beamGrad.addColorStop(0, 'rgba(229, 184, 91, 0)');
        beamGrad.addColorStop(0.5, 'rgba(229, 184, 91, 0.42)');
        beamGrad.addColorStop(1, 'rgba(229, 184, 91, 0)');
        ctx.beginPath();
        ctx.moveTo(rx1, ry1);
        ctx.lineTo(rx2, ry2);
        ctx.strokeStyle = beamGrad;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }

      // 2c. Lõi Bát diện Vàng Hổ Phách Phát Sáng (#E5B85B)
      for (const f of octaFaces.back) {
        drawPolygonFace(
          ctx,
          f.points,
          'rgba(229, 184, 91, 0.24)',
          'rgba(229, 184, 91, 0.36)',
          0.85,
        );
      }
      for (const f of octaFaces.front) {
        const r = Math.round(205 + f.light * 44);
        const g = Math.round(156 + f.light * 58);
        const b = Math.round(62 + f.light * 74);
        const alpha = 0.46 + f.light * 0.44;
        drawPolygonFace(
          ctx,
          f.points,
          `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`,
          `rgba(255, 244, 212, ${(0.55 + f.light * 0.42).toFixed(2)})`,
          1.25,
        );
      }

      // 2d. Mặt trước Vỏ Đa Diện Bán Trong Suốt (tô bóng Z-sorted sắc Ngọc Bích #34D399 & Lam Nhạt #38BDF8)
      for (const f of dodecaFaces.front) {
        const baseR = Math.round(52 * (1 - f.normalBlend) + 56 * f.normalBlend);
        const baseG = Math.round(211 * (1 - f.normalBlend) + 189 * f.normalBlend);
        const baseB = Math.round(153 * (1 - f.normalBlend) + 248 * f.normalBlend);
        const shade = 0.42 + f.light * 0.58;
        const r = Math.min(255, Math.round(baseR * shade + f.specular * 90));
        const g = Math.min(255, Math.round(baseG * shade + f.specular * 90));
        const b = Math.min(255, Math.round(baseB * shade + f.specular * 95));
        const alpha = 0.13 + f.light * 0.26 + f.specular * 0.14;
        drawPolygonFace(
          ctx,
          f.points,
          `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`,
          `rgba(22, 62, 58, ${(0.34 + f.light * 0.42).toFixed(2)})`,
          1.25,
        );
      }

      // LỚP 3: Nửa trước của 4 Vòng Elip Quỹ đạo, Điểm nút giao & Hạt sáng phía trước
      ARMILLARY_RINGS.forEach((ring, idx) => {
        const ang = ringAngles[idx]!;
        drawArmillaryHalf(ctx, cx, cy, ring, fov, ang.rotX, ang.rotY, ang.rotZ, time, true);
      });

      for (const item of dustProjected) {
        if (item.w.z < 0) continue;
        const pulse = 0.72 + Math.sin(time * 2.1 + item.pt.phase) * 0.28;
        ctx.beginPath();
        ctx.arc(item.p.x, item.p.y, item.pt.size * pulse, 0, Math.PI * 2);
        ctx.fillStyle =
          item.pt.hue === 'gold'
            ? 'rgba(229, 184, 91, 0.88)'
            : item.pt.hue === 'cyan'
              ? 'rgba(56, 189, 248, 0.82)'
              : 'rgba(52, 211, 153, 0.80)';
        ctx.fill();
      }

      ctx.restore();
    };

    renderFrame(0.65);
    updateParallaxGlyphs(0.65);
    if (prefersReducedMotion) {
      return () => {
        heroSection.removeEventListener('pointermove', handlePointerMove);
        heroSection.removeEventListener('pointerleave', handlePointerLeave);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        elapsed += dtScale / 60;
        const damp = frameDampFactor(6.5, dtSeconds);
        smoothX += (pointerX - smoothX) * damp;
        smoothY += (pointerY - smoothY) * damp;
        renderFrame(elapsed);
        updateParallaxGlyphs(elapsed);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      heroSection.removeEventListener('pointermove', handlePointerMove);
      heroSection.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      data-testid="learning-space-celestial-rings"
      data-sculpture-version="polyhedral-armillary-v2"
      className="relative flex h-[380px] w-full items-center justify-center select-none sm:h-[440px] lg:h-[460px]"
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
        className="pointer-events-none absolute inset-0 m-auto h-[320px] w-[320px] opacity-25"
        fill="none"
      >
        <circle cx="180" cy="180" r="146" stroke="#E5B85B" strokeWidth="1" strokeDasharray="4 6" />
        <ellipse
          cx="180"
          cy="180"
          rx="142"
          ry="66"
          transform="rotate(-24 180 180)"
          stroke="#34D399"
          strokeWidth="1"
        />
        <ellipse
          cx="180"
          cy="180"
          rx="132"
          ry="58"
          transform="rotate(34 180 180)"
          stroke="#38BDF8"
          strokeWidth="1"
        />
        <polygon points="180,96 244,142 220,224 140,224 116,142" stroke="#1E3A34" strokeWidth="1" />
        <polygon points="180,126 220,192 140,192" stroke="#E5B85B" strokeWidth="1" />
      </svg>

      <canvas ref={canvasRef} aria-hidden="true" className="relative z-10 block h-full w-full" />
    </div>
  );
}
