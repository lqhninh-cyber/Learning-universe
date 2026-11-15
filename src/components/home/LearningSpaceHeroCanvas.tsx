import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';

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
  readonly radius: number;
  readonly baseTiltX: number;
  readonly baseTiltZ: number;
  readonly speedY: number;
  readonly speedZ: number;
  readonly color: string;
  readonly accentColor: string;
  readonly tickStepDeg: number;
  readonly strokeWidth: number;
}

interface HarmonicDustParticle {
  readonly baseRadius: number;
  readonly goldenAngle: number;
  readonly verticalTilt: number;
  readonly orbitSpeed: number;
  readonly size: number;
  readonly hue: 'gold' | 'jade' | 'slate';
  readonly phase: number;
}

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

const LIGHT_DIR = normalizeVec3({ x: -0.45, y: -0.62, z: 0.64 });

const PHI = (1 + Math.sqrt(5)) / 2;
const INV_PHI = 1 / PHI;

// 1. Khối Nhị thập diện đều bên trong (Icosahedron - 12 đỉnh, 20 mặt tam giác)
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

const ICO_FACES: readonly (readonly [number, number, number])[] = (() => {
  const faces: [number, number, number][] = [];
  for (let i = 0; i < ICO_VERTICES.length; i += 1) {
    for (let j = i + 1; j < ICO_VERTICES.length; j += 1) {
      if (dotVec3(ICO_VERTICES[i]!, ICO_VERTICES[j]!) < 0.42) continue;
      for (let k = j + 1; k < ICO_VERTICES.length; k += 1) {
        if (
          dotVec3(ICO_VERTICES[i]!, ICO_VERTICES[k]!) < 0.42 ||
          dotVec3(ICO_VERTICES[j]!, ICO_VERTICES[k]!) < 0.42
        ) {
          continue;
        }
        const vi = ICO_VERTICES[i]!;
        const vj = ICO_VERTICES[j]!;
        const vk = ICO_VERTICES[k]!;
        const centroid = {
          x: (vi.x + vj.x + vk.x) / 3,
          y: (vi.y + vj.y + vk.y) / 3,
          z: (vi.z + vj.z + vk.z) / 3,
        };
        const normal = crossVec3(subVec3(vj, vi), subVec3(vk, vi));
        if (dotVec3(normal, centroid) < 0) {
          faces.push([i, k, j]);
        } else {
          faces.push([i, j, k]);
        }
      }
    }
  }
  return faces;
})();

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

// 3. Hệ 4 Vòng Thiên Cầu Khắc Độ (Engraved Armillary Rings)
const ARMILLARY_RINGS: readonly ArmillaryRingSpec[] = [
  {
    radius: 0.72,
    baseTiltX: 0.96,
    baseTiltZ: 0.22,
    speedY: 0.14,
    speedZ: 0.03,
    color: '#1E3A34',
    accentColor: '#8C6D3F',
    tickStepDeg: 10,
    strokeWidth: 1.55,
  },
  {
    radius: 0.64,
    baseTiltX: -0.78,
    baseTiltZ: 0.84,
    speedY: -0.19,
    speedZ: -0.04,
    color: '#8C6D3F',
    accentColor: '#1E3A34',
    tickStepDeg: 15,
    strokeWidth: 1.4,
  },
  {
    radius: 0.56,
    baseTiltX: 0.44,
    baseTiltZ: -0.68,
    speedY: 0.24,
    speedZ: 0.07,
    color: '#2D5266',
    accentColor: '#A6844E',
    tickStepDeg: 30,
    strokeWidth: 1.25,
  },
  {
    radius: 0.48,
    baseTiltX: 1.24,
    baseTiltZ: -0.34,
    speedY: -0.27,
    speedZ: 0.09,
    color: '#A6844E',
    accentColor: '#1E3A34',
    tickStepDeg: 30,
    strokeWidth: 1.15,
  },
];

// 4. Hạt bụi sáng tỷ lệ vàng xoắn ốc & trường sóng điều hòa
const GOLDEN_ANGLE_RAD = Math.PI * (3 - Math.sqrt(5));
const HARMONIC_DUST: readonly HarmonicDustParticle[] = Array.from({ length: 28 }, (_, idx) => {
  const norm = (idx + 1) / 28;
  const hues: readonly ('gold' | 'jade' | 'slate')[] = ['gold', 'jade', 'slate'];
  return {
    baseRadius: 0.42 + Math.sqrt(norm) * 0.44,
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
  const worldPoints: Vec3[] = [];
  const projPoints: ProjectedPoint[] = [];

  for (let i = 0; i <= segments; i += 1) {
    const theta = (i / segments) * Math.PI * 2;
    const world = rotateVec3(
      { x: Math.cos(theta) * ring.radius, y: Math.sin(theta) * ring.radius, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    worldPoints.push(world);
    projPoints.push(projectPoint(world, cx, cy, fov));
  }

  // Vẽ nửa sau hoặc nửa trước của vành nhẫn
  for (let i = 0; i < segments; i += 1) {
    const p1 = projPoints[i]!;
    const p2 = projPoints[i + 1]!;
    const avgZ = (p1.z + p2.z) * 0.5;
    if (avgZ >= 0 !== drawFrontHalf) continue;

    const alpha = Math.max(0.24, Math.min(0.86, 0.46 + avgZ * 0.46));
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = ring.color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = drawFrontHalf ? ring.strokeWidth * 1.15 : ring.strokeWidth * 0.72;
    ctx.stroke();
  }

  // Vạch khắc độ chia độ góc trên vòng Thiên cầu
  for (let deg = 0; deg < 360; deg += ring.tickStepDeg) {
    const rad = (deg * Math.PI) / 180;
    const isMajor = deg % 30 === 0;
    const tickLen = isMajor ? 0.038 : 0.02;
    const outerW = rotateVec3(
      { x: Math.cos(rad) * ring.radius, y: Math.sin(rad) * ring.radius, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    if (outerW.z >= 0 !== drawFrontHalf) continue;

    const innerW = rotateVec3(
      {
        x: Math.cos(rad) * (ring.radius - tickLen),
        y: Math.sin(rad) * (ring.radius - tickLen),
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
    ctx.globalAlpha = drawFrontHalf ? (isMajor ? 0.78 : 0.46) : 0.24;
    ctx.lineWidth = isMajor ? 1.25 : 0.75;
    ctx.stroke();
  }

  // Điểm nút đồng sáng trượt dọc theo từng vòng nhẫn
  for (const offset of [0.4, Math.PI + 0.4]) {
    const nodeTheta = offset + time * ring.speedY * 1.3;
    const nodeW = rotateVec3(
      { x: Math.cos(nodeTheta) * ring.radius, y: Math.sin(nodeTheta) * ring.radius, z: 0 },
      rotX,
      rotY,
      rotZ,
    );
    if (nodeW.z >= 0 !== drawFrontHalf) continue;
    const np = projectPoint(nodeW, cx, cy, fov);
    ctx.globalAlpha = drawFrontHalf ? 0.95 : 0.35;
    ctx.beginPath();
    ctx.arc(np.x, np.y, drawFrontHalf ? 3.2 : 2.1, 0, Math.PI * 2);
    ctx.fillStyle = ring.accentColor;
    ctx.fill();
    if (drawFrontHalf) {
      ctx.beginPath();
      ctx.arc(np.x, np.y, 1.3, 0, Math.PI * 2);
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
 * - Hệ 4 vòng Thiên cầu khắc độ xoay lệch trục với độ sâu che khuất 3D chuẩn mực
 * - Trường sóng điều hòa & hạt sáng tỷ lệ vàng nghiêng mượt theo vị trí chuột trên Hero
 */
export function LearningSpaceHeroCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    let width = Math.max(340, container.clientWidth || 460);
    let height = Math.max(340, container.clientHeight || 420);
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = Math.max(340, container.clientWidth || 460);
      height = Math.max(340, container.clientHeight || 420);
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

    const renderFrame = (time: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5 + smoothX * 10;
      const cy = height * 0.5 + smoothY * 9;
      const minDim = Math.min(width, height);
      const fov = minDim * 1.18;

      // Hào quang tinh thể nhiều tầng phía sau khối điêu khắc
      const outerHalo = ctx.createRadialGradient(cx, cy, 8, cx, cy, minDim * 0.52);
      outerHalo.addColorStop(0, 'rgba(184, 142, 74, 0.20)');
      outerHalo.addColorStop(0.42, 'rgba(45, 82, 102, 0.10)');
      outerHalo.addColorStop(0.75, 'rgba(30, 58, 52, 0.05)');
      outerHalo.addColorStop(1, 'rgba(242, 244, 243, 0)');
      ctx.fillStyle = outerHalo;
      ctx.fillRect(0, 0, width, height);

      // Trường sóng điều hòa mảnh đồng bộ góc nghiêng 3D
      for (const wave of [
        {
          rx: minDim * 0.44,
          ry: minDim * 0.16,
          tilt: -0.32 + smoothY * 0.1,
          color: 'rgba(140, 109, 63, 0.22)',
        },
        {
          rx: minDim * 0.47,
          ry: minDim * 0.19,
          tilt: 0.46 - smoothY * 0.08,
          color: 'rgba(30, 58, 52, 0.18)',
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

      // Góc Euler của 4 vòng Thiên cầu
      const ringAngles = ARMILLARY_RINGS.map((ring, idx) => ({
        rotX: ring.baseTiltX + smoothY * (0.24 - idx * 0.03),
        rotY: time * ring.speedY + smoothX * (0.28 - idx * 0.04),
        rotZ: ring.baseTiltZ + time * ring.speedZ,
      }));

      // LỚP 1: Nửa sau của 4 Vòng Thiên cầu khắc độ (nằm phía sau đa diện)
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
            ? 'rgba(166, 132, 78, 0.36)'
            : item.pt.hue === 'slate'
              ? 'rgba(45, 82, 102, 0.30)'
              : 'rgba(30, 58, 52, 0.28)';
        ctx.fill();
      }

      // LỚP 2: Khối đa diện ngoài Thập nhị diện đều (Dodecahedron) & Lõi Nhị thập diện đều (Icosahedron)
      const dodecaFaces = buildPolyhedronFaces(
        DODECA_VERTICES,
        DODECA_FACES,
        0.37,
        time * 0.19 + smoothY * 0.42,
        time * 0.28 + smoothX * 0.46,
        time * 0.08,
        cx,
        cy,
        fov,
      );

      const icoFaces = buildPolyhedronFaces(
        ICO_VERTICES,
        ICO_FACES,
        0.215,
        -time * 0.32 + smoothY * 0.52,
        -time * 0.44 + smoothX * 0.54,
        time * 0.14,
        cx,
        cy,
        fov,
      );

      // 2a. Mặt sau bán trong suốt của Thập nhị diện ngoài (chiều sâu kính khoáng thạch)
      for (const f of dodecaFaces.back) {
        const lum = 0.05 + f.light * 0.08;
        drawPolygonFace(
          ctx,
          f.points,
          `rgba(36, 87, 70, ${lum.toFixed(3)})`,
          'rgba(45, 82, 102, 0.16)',
          0.7,
        );
      }

      // 2b. Lõi Nhị thập diện phát sáng ấm áp (Mặt sau + Mặt trước tô bóng pháp tuyến 3D)
      for (const f of icoFaces.back) {
        drawPolygonFace(
          ctx,
          f.points,
          'rgba(140, 109, 63, 0.18)',
          'rgba(166, 132, 78, 0.26)',
          0.75,
        );
      }
      for (const f of icoFaces.front) {
        const r = Math.round(168 + f.light * 56);
        const g = Math.round(132 + f.light * 52);
        const b = Math.round(68 + f.light * 38);
        const alpha = 0.38 + f.light * 0.44;
        drawPolygonFace(
          ctx,
          f.points,
          `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`,
          `rgba(246, 232, 198, ${(0.42 + f.light * 0.45).toFixed(2)})`,
          1.15,
        );
      }

      // Điểm tâm phát sáng trong lõi tinh thể
      const coreGlow = ctx.createRadialGradient(cx, cy, 1, cx, cy, minDim * 0.12);
      coreGlow.addColorStop(0, 'rgba(255, 243, 214, 0.85)');
      coreGlow.addColorStop(0.45, 'rgba(184, 142, 74, 0.32)');
      coreGlow.addColorStop(1, 'rgba(184, 142, 74, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // 2c. Mặt trước Thập nhị diện ngoài (tô bóng ngọc lam-lục khoáng bán trong suốt + viền phản chiếu)
      for (const f of dodecaFaces.front) {
        const r = Math.round(28 + f.light * 124);
        const g = Math.round(62 + f.light * 120);
        const b = Math.round(58 + f.light * 116);
        const alpha = 0.09 + f.light * 0.22;
        drawPolygonFace(
          ctx,
          f.points,
          `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`,
          `rgba(30, 58, 52, ${(0.32 + f.light * 0.48).toFixed(2)})`,
          1.25,
        );
      }

      // LỚP 3: Nửa trước của 4 Vòng Thiên cầu khắc độ + hạt bụi sáng phía trước
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
            ? 'rgba(166, 132, 78, 0.82)'
            : item.pt.hue === 'slate'
              ? 'rgba(45, 82, 102, 0.72)'
              : 'rgba(30, 58, 52, 0.68)';
        ctx.fill();
      }

      ctx.restore();
    };

    renderFrame(0.65);
    if (prefersReducedMotion) {
      return () => {
        heroSection.removeEventListener('pointermove', handlePointerMove);
        heroSection.removeEventListener('pointerleave', handlePointerLeave);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        elapsed += dtSeconds;
        const lerpRate = Math.min(1, dtSeconds * 6);
        smoothX += (pointerX - smoothX) * lerpRate;
        smoothY += (pointerY - smoothY) * lerpRate;
        renderFrame(elapsed);
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
      className="relative flex h-[360px] w-full items-center justify-center select-none sm:h-[430px]"
    >
      {/* Khung SVG dự phòng thanh mảnh khi môi trường không hỗ trợ Canvas 2D */}
      <svg
        viewBox="0 0 360 360"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto h-[320px] w-[320px] opacity-25"
        fill="none"
      >
        <circle cx="180" cy="180" r="146" stroke="#8C6D3F" strokeWidth="1" strokeDasharray="4 6" />
        <ellipse
          cx="180"
          cy="180"
          rx="138"
          ry="64"
          transform="rotate(-24 180 180)"
          stroke="#1E3A34"
          strokeWidth="1"
        />
        <ellipse
          cx="180"
          cy="180"
          rx="130"
          ry="58"
          transform="rotate(34 180 180)"
          stroke="#2D5266"
          strokeWidth="1"
        />
        <polygon points="180,96 244,142 220,224 140,224 116,142" stroke="#1E3A34" strokeWidth="1" />
        <polygon points="180,126 220,192 140,192" stroke="#8C6D3F" strokeWidth="1" />
      </svg>

      <canvas ref={canvasRef} aria-hidden="true" className="relative z-10 block h-full w-full" />
    </div>
  );
}
