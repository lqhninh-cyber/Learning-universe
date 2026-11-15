import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

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

interface OrbitalRingSpec {
  readonly radius: number;
  readonly baseTiltX: number;
  readonly baseRotZ: number;
  readonly speedY: number;
  readonly speedZ: number;
  readonly color: string;
  readonly withTicks: boolean;
}

interface SatelliteSpec {
  readonly index: string;
  readonly slug: string;
  readonly shortLabel: string;
  readonly title: string;
  readonly color: string;
  readonly softBg: string;
  readonly borderColor: string;
  readonly glow: string;
  readonly ringIndex: 0 | 1 | 2;
  readonly orbitSpeed: number;
  readonly phase: number;
}

export interface OrbitalSubjectProgress {
  readonly completed: number;
  readonly total: number;
  readonly percent: number;
}

export interface LearningSpaceHeroCanvasProps {
  readonly subjectProgress?: Readonly<Record<string, OrbitalSubjectProgress>>;
  readonly onSelectSubject?: (slug: string) => void;
}

// 3 Vòng Quỹ đạo 3D cân chỉnh cho Thiên cầu Khuê Văn
const ORBITAL_RINGS: readonly [OrbitalRingSpec, OrbitalRingSpec, OrbitalRingSpec] = [
  {
    radius: 0.45,
    baseTiltX: 0.94,
    baseRotZ: 0.24,
    speedY: 0.16,
    speedZ: 0,
    color: '#243E38',
    withTicks: true,
  },
  {
    radius: 0.39,
    baseTiltX: -0.76,
    baseRotZ: 0.82,
    speedY: -0.2,
    speedZ: 0,
    color: '#8C7248',
    withTicks: false,
  },
  {
    radius: 0.33,
    baseTiltX: 0.42,
    baseRotZ: -0.62,
    speedY: 0.26,
    speedZ: 0.08,
    color: '#3B6275',
    withTicks: false,
  },
];

// 4 Nút Tinh Cầu đại diện 4 học phần gắn trực tiếp trên 3 vòng quỹ đạo 3D
const ORBITAL_SUBJECTS: readonly SatelliteSpec[] = [
  {
    index: '01',
    slug: 'cau-truc-dai-so',
    shortLabel: '01. CTĐS',
    title: 'Cấu trúc đại số',
    color: '#6B5335',
    softBg: '#F3F0E8',
    borderColor: '#D8D0C0',
    glow: 'rgba(156, 122, 76, 0.28)',
    ringIndex: 1,
    orbitSpeed: 0.22,
    phase: 0.35,
  },
  {
    index: '02',
    slug: 'hinh-hoc-affine',
    shortLabel: '02. HHAVE',
    title: 'Hình học Affine & Euclide',
    color: '#2D5266',
    softBg: '#ECF1F4',
    borderColor: '#C9D7DF',
    glow: 'rgba(73, 118, 143, 0.28)',
    ringIndex: 2,
    orbitSpeed: 0.27,
    phase: 2.35,
  },
  {
    index: '03',
    slug: 'giai-tich-ham-mot-bien',
    shortLabel: '03. GTHMB',
    title: 'Giải tích hàm một biến',
    color: '#245746',
    softBg: '#EBF2EE',
    borderColor: '#C6DBD0',
    glow: 'rgba(59, 122, 101, 0.26)',
    ringIndex: 0,
    orbitSpeed: 0.19,
    phase: 3.9,
  },
  {
    index: '04',
    slug: 'giao-duc-hoc',
    shortLabel: '04. GDH',
    title: 'Giáo dục học',
    color: '#7A463B',
    softBg: '#F3ECE9',
    borderColor: '#D8C8C1',
    glow: 'rgba(158, 99, 86, 0.26)',
    ringIndex: 0,
    orbitSpeed: 0.19,
    phase: 0.78,
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
  { char: 'Σ', x: 0.11, y: 0.16, phase: 0.4, depth: 1.1, color: 'rgba(140, 114, 72, 0.52)' },
  { char: '∫', x: 0.89, y: 0.18, phase: 1.7, depth: 0.9, color: 'rgba(36, 62, 56, 0.48)' },
  { char: '∀', x: 0.12, y: 0.84, phase: 2.9, depth: 1.0, color: 'rgba(59, 98, 117, 0.50)' },
  { char: 'π', x: 0.88, y: 0.82, phase: 4.1, depth: 1.15, color: 'rgba(140, 114, 72, 0.48)' },
  { char: '≅', x: 0.52, y: 0.08, phase: 5.2, depth: 0.8, color: 'rgba(36, 62, 56, 0.44)' },
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
  isHighlighted: boolean,
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
    const baseAlpha = Math.max(0.2, Math.min(0.78, 0.44 + (p1.z + p2.z) * 0.36));
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.strokeStyle = color;
    ctx.globalAlpha = isHighlighted ? Math.min(1, baseAlpha + 0.34) : baseAlpha;
    ctx.lineWidth = isHighlighted ? (p1.z > 0 ? 2.6 : 1.75) : p1.z > 0 ? 1.45 : 0.95;
    ctx.stroke();
  }

  if (withTicks) {
    for (let deg = 0; deg < 360; deg += 30) {
      const rad = (deg * Math.PI) / 180;
      const tickLen = deg % 90 === 0 ? 0.042 : 0.024;
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
      ctx.strokeStyle = isHighlighted ? color : '#8C7248';
      ctx.globalAlpha = outer.z > 0 ? 0.72 : 0.28;
      ctx.lineWidth = deg % 90 === 0 ? 1.3 : 0.85;
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * Bản đồ Quỹ đạo 4 Học Phần Tương tác 120fps trên nền sáng Khoáng Thạch & Trắng Sứ Dịu:
 * Tích hợp 3 vòng quỹ đạo 3D, lõi Nhị thập diện và 4 Nút Tinh Cầu có thể di chuột / nhấp chuyển hướng.
 */
export function LearningSpaceHeroCanvas({
  subjectProgress,
  onSelectSubject,
}: LearningSpaceHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const orbButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hoveredSlugRef = useRef<string | null>(null);

  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    hoveredSlugRef.current = hoveredSlug;
  }, [hoveredSlug]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    let width = Math.max(320, container.clientWidth || 440);
    let height = Math.max(320, container.clientHeight || 400);
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = Math.max(320, container.clientWidth || 440);
      height = Math.max(320, container.clientHeight || 400);
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
      const fov = minDim * 1.24;

      const activeHoverSlug = hoveredSlugRef.current;
      const activeSatellite = ORBITAL_SUBJECTS.find((sat) => sat.slug === activeHoverSlug);
      const highlightedRingIndex = activeSatellite?.ringIndex ?? -1;

      // Hào quang trung tâm dịu nhẹ
      const coreGlow = ctx.createRadialGradient(cx, cy, 6, cx, cy, minDim * 0.46);
      coreGlow.addColorStop(0, 'rgba(166, 130, 75, 0.14)');
      coreGlow.addColorStop(0.5, 'rgba(59, 98, 117, 0.07)');
      coreGlow.addColorStop(1, 'rgba(235, 240, 238, 0)');
      ctx.fillStyle = coreGlow;
      ctx.fillRect(0, 0, width, height);

      // Tính góc quay hiện tại của cả 3 vòng quỹ đạo (để các nút tinh cầu bám khít trên vòng)
      const ringAngles = ORBITAL_RINGS.map((ring, idx) => ({
        rotX: ring.baseTiltX + smoothY * (0.14 - idx * 0.02),
        rotY: time * ring.speedY + smoothX * (0.16 - idx * 0.02),
        rotZ: ring.baseRotZ + time * ring.speedZ,
      }));

      // Vẽ 3 vòng quỹ đạo 3D
      ORBITAL_RINGS.forEach((ring, idx) => {
        const ang = ringAngles[idx]!;
        const isRingHighlighted = highlightedRingIndex === idx;
        drawArmillaryRing(
          ctx,
          cx,
          cy,
          ring.radius,
          fov,
          ang.rotX,
          ang.rotY,
          ang.rotZ,
          isRingHighlighted && activeSatellite ? activeSatellite.color : ring.color,
          ring.withTicks,
          isRingHighlighted,
        );
      });

      // Lõi Đa diện 3D Nhị thập diện ở tâm
      const polyScale = 0.21;
      const rotatedVerts = RAW_ICO_VERTICES.map((v) =>
        rotateVec3(
          { x: v.x * polyScale, y: v.y * polyScale, z: v.z * polyScale },
          time * 0.34 + smoothY * 0.35,
          time * 0.48 + smoothX * 0.4,
          time * 0.16,
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
        ctx.globalAlpha = avgZ > 0 ? 0.78 : 0.32;
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

      ctx.beginPath();
      ctx.arc(cx, cy, 4.2, 0, Math.PI * 2);
      ctx.fillStyle = '#8C7248';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 1.7, 0, Math.PI * 2);
      ctx.fillStyle = '#FAFBF9';
      ctx.fill();

      // Vẽ quầng sáng và cập nhật tọa độ 3D của 4 nút Tinh Cầu theo 120fps (không gây re-render React)
      for (const sat of ORBITAL_SUBJECTS) {
        const ringSpec = ORBITAL_RINGS[sat.ringIndex];
        const ang = ringAngles[sat.ringIndex]!;
        // Tạm chậm quỹ đạo khi người dùng đang rê vào tinh cầu để dễ bấm
        const speedFactor = activeHoverSlug ? 0.35 : 1;
        const theta = sat.phase + time * sat.orbitSpeed * speedFactor;

        const localPos: Vec3 = {
          x: Math.cos(theta) * ringSpec.radius,
          y: Math.sin(theta) * ringSpec.radius,
          z: 0,
        };
        const worldPos = rotateVec3(localPos, ang.rotX, ang.rotY, ang.rotZ);
        const proj = projectPoint(worldPos, cx, cy, fov);

        const isHovered = activeHoverSlug === sat.slug;
        const glowRadius = isHovered ? 24 : 15;

        const satGlow = ctx.createRadialGradient(proj.x, proj.y, 1, proj.x, proj.y, glowRadius);
        satGlow.addColorStop(0, sat.glow);
        satGlow.addColorStop(1, 'rgba(235, 240, 238, 0)');
        ctx.fillStyle = satGlow;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        const btn = orbButtonRefs.current[sat.slug];
        if (btn) {
          const depthScale = isHovered ? 1.08 : worldPos.z > 0 ? 1 : 0.92;
          const clampedX = Math.max(54, Math.min(width - 54, proj.x));
          const clampedY = Math.max(24, Math.min(height - 24, proj.y));
          btn.style.top = '0px';
          btn.style.left = '0px';
          btn.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0) translate(-50%, -50%) scale(${depthScale})`;
          btn.style.zIndex = isHovered ? '30' : worldPos.z > 0 ? '20' : '15';
          btn.style.opacity = isHovered ? '1' : worldPos.z > 0 ? '0.98' : '0.84';
        }
      }

      // Ký hiệu toán học lơ lửng tinh tế
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

  const activeSubject = ORBITAL_SUBJECTS.find((item) => item.slug === hoveredSlug) ?? null;
  const activeStats = activeSubject ? subjectProgress?.[activeSubject.slug] : undefined;

  return (
    <div
      ref={containerRef}
      data-testid="learning-space-celestial-rings"
      className="relative flex h-[350px] w-full items-center justify-center select-none sm:h-[420px]"
    >
      {/* Khung SVG dự phòng thanh mảnh khi môi trường không chạy Canvas 2D */}
      <svg
        viewBox="0 0 360 360"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto h-[320px] w-[320px] opacity-30"
        fill="none"
      >
        <circle cx="180" cy="180" r="144" stroke="#8C7248" strokeWidth="1" strokeDasharray="4 6" />
        <ellipse
          cx="180"
          cy="180"
          rx="136"
          ry="62"
          transform="rotate(-24 180 180)"
          stroke="#243E38"
          strokeWidth="1"
        />
        <ellipse
          cx="180"
          cy="180"
          rx="130"
          ry="56"
          transform="rotate(34 180 180)"
          stroke="#3B6275"
          strokeWidth="1"
        />
        <circle cx="180" cy="180" r="4.5" fill="#8C7248" />
      </svg>

      <canvas ref={canvasRef} aria-hidden="true" className="relative z-10 block h-full w-full" />

      {/* 4 Nút Tinh Cầu Tương Tác cho 4 Học Phần */}
      {ORBITAL_SUBJECTS.map((sat, idx) => {
        const isHovered = hoveredSlug === sat.slug;
        const fallbackPositions = [
          'top-[18%] left-[72%]',
          'top-[34%] left-[18%]',
          'top-[76%] left-[24%]',
          'top-[74%] left-[78%]',
        ] as const;

        return (
          <button
            key={sat.slug}
            ref={(el) => {
              orbButtonRefs.current[sat.slug] = el;
            }}
            type="button"
            data-testid={`orbital-subject-node-${sat.slug}`}
            aria-label={`${sat.shortLabel}: ${sat.title}`}
            onMouseEnter={() => setHoveredSlug(sat.slug)}
            onMouseLeave={() => setHoveredSlug((prev) => (prev === sat.slug ? null : prev))}
            onFocus={() => setHoveredSlug(sat.slug)}
            onBlur={() => setHoveredSlug((prev) => (prev === sat.slug ? null : prev))}
            onClick={() => onSelectSubject?.(sat.slug)}
            style={{
              borderColor: isHovered ? sat.color : sat.borderColor,
              backgroundColor: isHovered ? sat.color : sat.softBg,
              color: isHovered ? '#FAFBF9' : sat.color,
              boxShadow: isHovered ? `0 8px 22px ${sat.glow}` : '0 4px 12px rgba(24, 38, 36, 0.08)',
            }}
            className={cn(
              'absolute top-0 left-0 inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10.5px] font-bold tracking-tight whitespace-nowrap transition-[background-color,color,border-color,box-shadow] duration-200 focus-visible:ring-2 focus-visible:ring-[#1E332E] focus-visible:outline-none',
              // Vị trí dự phòng ban đầu trước khi canvas compute frame đầu
              fallbackPositions[idx],
            )}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full transition-colors"
              style={{ backgroundColor: isHovered ? '#FAFBF9' : sat.color }}
              aria-hidden="true"
            />
            <span>{sat.shortLabel}</span>
          </button>
        );
      })}

      {/* Tooltip tóm tắt tiến độ môn học khi di chuột hoặc focus vào Tinh cầu */}
      {activeSubject && (
        <div
          role="status"
          data-testid="orbital-subject-tooltip"
          className="pointer-events-none absolute right-2 bottom-2 left-2 z-40 mx-auto max-w-[300px] rounded-2xl border border-[#CBD6D2] bg-[#FAFBF9]/95 px-3.5 py-2.5 shadow-lg backdrop-blur-md transition-all duration-200"
        >
          <div className="flex items-center justify-between gap-2">
            <span
              className="font-mono text-[10px] font-bold"
              style={{ color: activeSubject.color }}
            >
              {activeSubject.shortLabel}
            </span>
            {activeStats && (
              <span className="font-mono text-[10.5px] font-semibold text-[#182624]">
                Đã học {activeStats.completed}/{activeStats.total} bài ({activeStats.percent}%)
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs font-semibold text-[#182624]">{activeSubject.title}</p>
          <p className="mt-0.5 text-[10.5px] text-[#4A5D58]">
            Nhấp để di chuyển nhanh tới học phần
          </p>
        </div>
      )}
    </div>
  );
}
