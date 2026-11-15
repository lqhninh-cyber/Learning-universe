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

interface SatelliteSpec {
  readonly color: string;
  readonly glow: string;
  readonly radius: number;
  readonly tiltX: number;
  readonly tiltZ: number;
  readonly speed: number;
  readonly phase: number;
}

// 4 vệ tinh Khoáng Thạch Tự Nhiên (Muted Mineral Palette) của 4 môn học
const SATELLITES: readonly SatelliteSpec[] = [
  {
    color: '#6B5335',
    glow: 'rgba(156, 122, 76, 0.20)',
    radius: 0.37,
    tiltX: 0.48,
    tiltZ: 0.32,
    speed: 0.56,
    phase: 0.2,
  },
  {
    color: '#2D5266',
    glow: 'rgba(73, 118, 143, 0.20)',
    radius: 0.41,
    tiltX: -0.64,
    tiltZ: -0.45,
    speed: 0.42,
    phase: 2.1,
  },
  {
    color: '#245746',
    glow: 'rgba(59, 122, 101, 0.18)',
    radius: 0.34,
    tiltX: 0.92,
    tiltZ: -0.22,
    speed: 0.68,
    phase: 4.0,
  },
  {
    color: '#7A463B',
    glow: 'rgba(158, 99, 86, 0.18)',
    radius: 0.43,
    tiltX: -0.25,
    tiltZ: 0.78,
    speed: 0.35,
    phase: 5.3,
  },
];

// Đỉnh và cạnh khối Nhị thập diện chuẩn (Icosahedron) tối giản
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
const RAW_ICO_VERTICES: readonly Vec3[] = RAW_ICO_COORDS.map(([x, y, z]) => {
  const len = Math.hypot(x, y, z);
  return { x: x / len, y: y / len, z: z / len };
});

const ICO_EDGES: readonly (readonly [number, number])[] = [
  [0, 1],
  [0, 5],
  [0, 7],
  [0, 10],
  [0, 11],
  [1, 5],
  [1, 7],
  [1, 8],
  [1, 9],
  [2, 3],
  [2, 4],
  [2, 6],
  [2, 10],
  [2, 11],
  [3, 4],
  [3, 6],
  [3, 8],
  [3, 9],
  [4, 5],
  [4, 9],
  [4, 11],
  [5, 9],
  [5, 11],
  [6, 7],
  [6, 8],
  [6, 10],
  [7, 8],
  [7, 10],
  [8, 9],
  [10, 11],
];

const FLOATING_SYMBOLS = [
  { char: 'Σ', x: 0.14, y: 0.2, phase: 0.4, depth: 1.1, color: 'rgba(140, 114, 72, 0.54)' },
  { char: '∫', x: 0.86, y: 0.24, phase: 1.7, depth: 0.9, color: 'rgba(36, 62, 56, 0.48)' },
  { char: '∀', x: 0.16, y: 0.8, phase: 2.9, depth: 1.0, color: 'rgba(59, 98, 117, 0.50)' },
  { char: 'π', x: 0.84, y: 0.78, phase: 4.1, depth: 1.15, color: 'rgba(140, 114, 72, 0.50)' },
  { char: '≅', x: 0.52, y: 0.11, phase: 5.2, depth: 0.8, color: 'rgba(36, 62, 56, 0.44)' },
] as const;

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
  const dist = 3.2;
  const scale = fov / (dist - v.z);
  return {
    x: cx + v.x * scale,
    y: cy + v.y * scale,
    z: v.z,
    scale,
  };
}

function drawArmillaryRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  fov: number,
  rotX: number,
  rotY: number,
  rotZ: number,
  color: string,
  withTicks: boolean,
): void {
  const segments = 96;
  const points: ProjectedPoint[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const theta = (i / segments) * Math.PI * 2;
    const base: Vec3 = {
      x: Math.cos(theta) * radius,
      y: Math.sin(theta) * radius,
      z: 0,
    };
    const r = rotateVec3(base, rotX, rotY, rotZ);
    points.push(projectPoint(r, cx, cy, fov));
  }

  for (let i = 0; i < segments; i += 1) {
    const p1 = points[i];
    const p2 = points[i + 1];
    if (!p1 || !p2) continue;
    const depthAlpha = Math.max(0.18, Math.min(0.76, 0.42 + (p1.z + p2.z) * 0.36));
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = color;
    ctx.globalAlpha = depthAlpha;
    ctx.lineWidth = p1.z > 0 ? 1.4 : 0.95;
    ctx.stroke();
  }

  if (withTicks) {
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      const tickLen = deg % 90 === 0 ? 0.04 : 0.022;
      const inner = rotateVec3(
        { x: Math.cos(rad) * (radius - tickLen), y: Math.sin(rad) * (radius - tickLen), z: 0 },
        rotX,
        rotY,
        rotZ,
      );
      const outer = rotateVec3(
        { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius, z: 0 },
        rotX,
        rotY,
        rotZ,
      );
      const pi = projectPoint(inner, cx, cy, fov);
      const po = projectPoint(outer, cx, cy, fov);
      ctx.beginPath();
      ctx.moveTo(pi.x, pi.y);
      ctx.lineTo(po.x, po.y);
      ctx.strokeStyle = '#A6824B';
      ctx.globalAlpha = outer.z > 0 ? 0.68 : 0.25;
      ctx.lineWidth = deg % 90 === 0 ? 1.25 : 0.8;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Sân khấu Canvas 2D 120fps trực tiếp trên nền sáng Xanh Men Ngọc & Giấy Dó Ngà:
 * Thiên cầu Đa diện & Vòng quỹ đạo Khuê Văn nét mảnh (#23423A, #A6824B, #3E6B7E).
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

    let width = Math.max(260, container.clientWidth || 340);
    let height = Math.max(260, container.clientHeight || 320);
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = Math.max(260, container.clientWidth || 340);
      height = Math.max(260, container.clientHeight || 320);
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

    const handlePointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handlePointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerleave', handlePointerLeave);

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

      const cx = width * 0.5 + smoothX * 8;
      const cy = height * 0.5 + smoothY * 8;
      const minDim = Math.min(width, height);
      const fov = minDim * 1.15;

      // Hào quang trung tâm cực dịu hòa tan vào nền xanh men ngọc
      const coreGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, minDim * 0.44);
      coreGlow.addColorStop(0, 'rgba(166, 130, 75, 0.14)');
      coreGlow.addColorStop(0.5, 'rgba(62, 107, 126, 0.07)');
      coreGlow.addColorStop(1, 'rgba(237, 243, 240, 0)');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, width, height);

      // 3 Vòng Quỹ đạo Khuê Văn: #243E38, #8C7248, #3B6275
      drawArmillaryRing(
        ctx,
        cx,
        cy,
        0.46,
        fov,
        0.95 + smoothY * 0.14,
        time * 0.18 + smoothX * 0.16,
        0.25,
        '#243E38',
        true,
      );
      drawArmillaryRing(
        ctx,
        cx,
        cy,
        0.39,
        fov,
        -0.78 + smoothY * 0.12,
        -time * 0.24 + smoothX * 0.14,
        0.82,
        '#8C7248',
        false,
      );
      drawArmillaryRing(
        ctx,
        cx,
        cy,
        0.33,
        fov,
        0.38 - smoothY * 0.1,
        time * 0.31,
        -0.65 + time * 0.1,
        '#3B6275',
        false,
      );

      // Lõi Đa diện 3D Nhị thập diện nét mảnh sắc sảo
      const polyScale = 0.21;
      const rotatedVerts = RAW_ICO_VERTICES.map((v) =>
        rotateVec3(
          { x: v.x * polyScale, y: v.y * polyScale, z: v.z * polyScale },
          time * 0.36 + smoothY * 0.35,
          time * 0.52 + smoothX * 0.4,
          time * 0.18,
        ),
      );
      const projectedVerts = rotatedVerts.map((v) => projectPoint(v, cx, cy, fov));

      for (const [a, b] of ICO_EDGES) {
        const pa = projectedVerts[a];
        const pb = projectedVerts[b];
        if (!pa || !pb) continue;
        const avgZ = (pa.z + pb.z) * 0.5;
        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = avgZ > 0 ? '#243E38' : '#8C7248';
        ctx.globalAlpha = avgZ > 0 ? 0.8 : 0.34;
        ctx.lineWidth = avgZ > 0 ? 1.25 : 0.8;
        ctx.stroke();
      }

      for (const pt of projectedVerts) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.z > 0 ? 2.2 : 1.4, 0, Math.PI * 2);
        ctx.fillStyle = pt.z > 0 ? '#243E38' : '#8C7248';
        ctx.globalAlpha = pt.z > 0 ? 0.9 : 0.45;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Điểm tâm Đồng Trầm thanh lịch
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#8C7248';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 1.7, 0, Math.PI * 2);
      ctx.fillStyle = '#FAFBF9';
      ctx.fill();

      // 4 Vệ tinh Pastel Khoáng Vật của 4 học phần
      for (const sat of SATELLITES) {
        const angle = sat.phase + time * sat.speed;
        const pos = rotateVec3(
          { x: Math.cos(angle) * sat.radius, y: Math.sin(angle) * sat.radius, z: 0 },
          sat.tiltX + smoothY * 0.12,
          time * 0.14 + smoothX * 0.14,
          sat.tiltZ,
        );
        const proj = projectPoint(pos, cx, cy, fov);
        const r = pos.z > 0 ? 4.4 : 3.2;

        const satGlow = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, r * 3);
        satGlow.addColorStop(0, sat.glow);
        satGlow.addColorStop(1, 'rgba(237, 243, 240, 0)');
        ctx.fillStyle = satGlow;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(proj.x, proj.y, r, 0, Math.PI * 2);
        ctx.fillStyle = sat.color;
        ctx.globalAlpha = pos.z > 0 ? 0.92 : 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Ký hiệu toán học lơ lửng tinh tế trên nền sáng
      ctx.font = '600 13px "JetBrains Mono", "Fira Code", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const sym of FLOATING_SYMBOLS) {
        const sx = width * sym.x + smoothX * 14 * sym.depth;
        const sy = height * sym.y + smoothY * 14 * sym.depth + Math.sin(time * 1.1 + sym.phase) * 5;
        ctx.fillStyle = sym.color;
        ctx.fillText(sym.char, sx, sy);
      }

      ctx.restore();
    };

    renderFrame(0.6);
    if (prefersReducedMotion) {
      return () => {
        container.removeEventListener('pointermove', handlePointerMove);
        container.removeEventListener('pointerleave', handlePointerLeave);
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
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerleave', handlePointerLeave);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <div
      ref={containerRef}
      data-testid="learning-space-celestial-rings"
      className="relative flex h-[280px] w-full items-center justify-center sm:h-[320px]"
      aria-hidden="true"
    >
      {/* Khung SVG dự phòng thanh mảnh hòa quyện nền sáng khi môi trường không chạy Canvas 2D */}
      <svg
        viewBox="0 0 320 320"
        className="pointer-events-none absolute inset-0 m-auto h-[260px] w-[260px] opacity-30"
        fill="none"
      >
        <circle cx="160" cy="160" r="124" stroke="#8C7248" strokeWidth="1" strokeDasharray="4 6" />
        <ellipse
          cx="160"
          cy="160"
          rx="116"
          ry="52"
          transform="rotate(-24 160 160)"
          stroke="#243E38"
          strokeWidth="1"
        />
        <ellipse
          cx="160"
          cy="160"
          rx="112"
          ry="48"
          transform="rotate(34 160 160)"
          stroke="#3B6275"
          strokeWidth="1"
        />
        <circle cx="160" cy="160" r="4" fill="#8C7248" />
      </svg>

      <canvas ref={canvasRef} className="relative z-10 block h-full w-full" />
    </div>
  );
}
