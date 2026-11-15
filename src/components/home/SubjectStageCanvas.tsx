import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';

interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface StageTheme {
  readonly background: string;
  readonly borderClass: string;
  readonly accent: string;
  readonly label: string;
}

const DEFAULT_STAGE_THEME: StageTheme = {
  background: 'linear-gradient(135deg, #16120D 0%, #261C12 100%)',
  borderClass: 'border-[#E5B85B]/30',
  accent: '#E5B85B',
  label: 'CAYLEY · ĐỐI XỨNG NHÓM',
};

const STAGE_THEMES: Record<string, StageTheme> = {
  'cau-truc-dai-so': DEFAULT_STAGE_THEME,
  'hinh-hoc-affine': {
    background: 'linear-gradient(135deg, #0B1C28 0%, #133146 100%)',
    borderClass: 'border-[#38BDF8]/30',
    accent: '#38BDF8',
    label: 'MỤC TIÊU AFFINE · QUADRIC',
  },
  'giai-tich-ham-mot-bien': {
    background: 'linear-gradient(135deg, #09211B 0%, #12382E 100%)',
    borderClass: 'border-[#34D399]/30',
    accent: '#34D399',
    label: 'RIEMANN · HỘI TỤ TAYLOR',
  },
  'giao-duc-hoc': {
    background: 'linear-gradient(135deg, #211412 0%, #38201B 100%)',
    borderClass: 'border-[#E76F51]/30',
    accent: '#F4A261',
    label: 'HỆ SINH THÁI SƯ PHẠM',
  },
};

function rotatePoint3D(v: Vec3, ax: number, ay: number, az: number): Vec3 {
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

function projectPoint3D(v: Vec3, cx: number, cy: number, fov: number) {
  const dist = 3.6;
  const scale = fov / (dist - v.z);
  return {
    x: cx + v.x * scale,
    y: cy + v.y * scale,
    z: v.z,
  };
}

// 1. Sân khấu Đại số: Khối bát diện 3D + Đồ thị Cayley lục giác & các gói sáng truyền dọc cạnh
function drawAlgebraStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
): void {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const rMain = Math.min(width, height) * 0.34;

  // Ánh hào quang vàng sơn mài
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, rMain * 1.45);
  glow.addColorStop(0, 'rgba(229, 184, 91, 0.24)');
  glow.addColorStop(0.6, 'rgba(200, 150, 62, 0.08)');
  glow.addColorStop(1, 'rgba(22, 18, 13, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Vòng ngoài đồ thị Cayley Z_6 / S_3
  const outerNodes: { x: number; y: number }[] = [];
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2 + t * 0.14;
    outerNodes.push({
      x: cx + Math.cos(a) * rMain * 1.15,
      y: cy + Math.sin(a) * rMain * 0.85,
    });
  }

  // Các cạnh vòng sinh Cayley
  ctx.strokeStyle = 'rgba(229, 184, 91, 0.35)';
  ctx.lineWidth = 1.25;
  for (let i = 0; i < 6; i += 1) {
    const a = outerNodes[i];
    const b = outerNodes[(i + 1) % 6];
    const opposite = outerNodes[(i + 3) % 6];
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();

    if (i < 3 && opposite) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(opposite.x, opposite.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Gói ánh sáng chạy dọc chu trình Cayley
  const packetProgress = (t * 0.9) % 6;
  const segIndex = Math.floor(packetProgress);
  const segT = packetProgress - segIndex;
  const pStart = outerNodes[segIndex];
  const pEnd = outerNodes[(segIndex + 1) % 6];
  if (pStart && pEnd) {
    const px = pStart.x + (pEnd.x - pStart.x) * segT;
    const py = pStart.y + (pEnd.y - pStart.y) * segT;

    ctx.beginPath();
    ctx.arc(px, py, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = '#FFF3D1';
    ctx.fill();
  }

  for (const node of outerNodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#E5B85B';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#16120D';
    ctx.fill();
  }

  // Khối Bát diện 3D xoay ở tâm
  const octVerts: readonly Vec3[] = [
    { x: 0, y: -0.75, z: 0 },
    { x: 0, y: 0.75, z: 0 },
    { x: -0.75, y: 0, z: 0 },
    { x: 0.75, y: 0, z: 0 },
    { x: 0, y: 0, z: -0.75 },
    { x: 0, y: 0, z: 0.75 },
  ];
  const octEdges: readonly (readonly [number, number])[] = [
    [0, 2],
    [0, 3],
    [0, 4],
    [0, 5],
    [1, 2],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 4],
    [4, 3],
    [3, 5],
    [5, 2],
  ];

  const fov = Math.min(width, height) * 0.95;
  const projected = octVerts.map((v) =>
    projectPoint3D(rotatePoint3D(v, t * 0.45, t * 0.65, t * 0.2), cx, cy, fov),
  );
  for (const [i, j] of octEdges) {
    const pa = projected[i];
    const pb = projected[j];
    if (!pa || !pb) continue;
    const front = (pa.z + pb.z) * 0.5 > 0;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = front ? '#FAF5E8' : '#C8963E';
    ctx.globalAlpha = front ? 0.88 : 0.36;
    ctx.lineWidth = front ? 1.5 : 0.9;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

// 2. Sân khấu Hình học Affine: Mặt Quadric Hyperboloid 1 tầng xoay 3D & Mục tiêu Affine (O; e1, e2, e3)
function drawAffineStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
): void {
  const cx = width * 0.5;
  const cy = height * 0.52;
  const fov = Math.min(width, height) * 1.15;

  const bgGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, width * 0.44);
  bgGlow.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
  bgGlow.addColorStop(1, 'rgba(11, 28, 40, 0)');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, width, height);

  // Vẽ đường sinh thẳng của Hyperboloid 1 tầng xoay chậm
  const generators = 18;
  const rotY = t * 0.32;
  const rotX = 0.52 + Math.sin(t * 0.4) * 0.08;

  for (let i = 0; i < generators; i += 1) {
    const phi = (i / generators) * Math.PI * 2;
    const twist = 0.95;
    const pTop: Vec3 = {
      x: 0.95 * Math.cos(phi + twist),
      y: -0.78,
      z: 0.95 * Math.sin(phi + twist),
    };
    const pBot: Vec3 = {
      x: 0.95 * Math.cos(phi - twist),
      y: 0.78,
      z: 0.95 * Math.sin(phi - twist),
    };
    const rTop = projectPoint3D(rotatePoint3D(pTop, rotX, rotY, 0.14), cx, cy, fov);
    const rBot = projectPoint3D(rotatePoint3D(pBot, rotX, rotY, 0.14), cx, cy, fov);
    const avgZ = (rTop.z + rBot.z) * 0.5;

    ctx.beginPath();
    ctx.moveTo(rTop.x, rTop.y);
    ctx.lineTo(rBot.x, rBot.y);
    ctx.strokeStyle = avgZ > 0 ? '#7DD3FC' : '#0EA5E9';
    ctx.globalAlpha = avgZ > 0 ? 0.65 : 0.24;
    ctx.lineWidth = avgZ > 0 ? 1.3 : 0.85;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Vẽ 3 vòng tròn mặt cắt Hyperboloid
  for (const [yLevel, radius] of [
    [-0.78, 0.95],
    [0, 0.56],
    [0.78, 0.95],
  ] as const) {
    ctx.beginPath();
    for (let s = 0; s <= 40; s += 1) {
      const a = (s / 40) * Math.PI * 2;
      const pt = projectPoint3D(
        rotatePoint3D(
          { x: Math.cos(a) * radius, y: yLevel, z: Math.sin(a) * radius },
          rotX,
          rotY,
          0.14,
        ),
        cx,
        cy,
        fov,
      );
      if (s === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.36)';
    ctx.lineWidth = 1.05;
    ctx.stroke();
  }

  // Mục tiêu Affine (O; e1, e2, e3) ở tâm
  const origin = projectPoint3D(rotatePoint3D({ x: 0, y: 0, z: 0 }, rotX, rotY, 0.14), cx, cy, fov);
  const axes: readonly { vec: Vec3; color: string; label: string }[] = [
    { vec: { x: 0.72, y: 0, z: 0 }, color: '#E5B85B', label: 'e₁' },
    { vec: { x: 0, y: -0.72, z: 0 }, color: '#38BDF8', label: 'e₂' },
    { vec: { x: 0, y: 0, z: 0.72 }, color: '#F4A261', label: 'e₃' },
  ];
  ctx.font = '600 11px "JetBrains Mono", monospace';
  for (const axis of axes) {
    const tip = projectPoint3D(rotatePoint3D(axis.vec, rotX, rotY, 0.14), cx, cy, fov);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.strokeStyle = axis.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = axis.color;
    ctx.fill();
    ctx.fillText(axis.label, tip.x + 6, tip.y - 4);
  }
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 3.8, 0, Math.PI * 2);
  ctx.fillStyle = '#FAF5E8';
  ctx.fill();
}

// 3. Sân khấu Giải tích: Sóng hội tụ Taylor & Các cột Tích phân Riemann sống động
function drawCalculusStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
): void {
  const midY = height * 0.56;
  const leftPad = width * 0.08;
  const spanX = width * 0.84;

  // Trục tọa độ
  ctx.strokeStyle = 'rgba(110, 231, 183, 0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftPad, midY);
  ctx.lineTo(leftPad + spanX, midY);
  ctx.moveTo(width * 0.5, height * 0.14);
  ctx.lineTo(width * 0.5, height * 0.88);
  ctx.stroke();

  const fn = (u: number) =>
    Math.sin(u * Math.PI * 2 + t * 0.9) * 0.56 + Math.cos(u * Math.PI * 4 - t * 0.5) * 0.22;

  // Cột Riemann
  const bars = 18;
  const barW = spanX / bars;
  for (let i = 0; i < bars; i += 1) {
    const u = (i + 0.5) / bars;
    const val = fn(u) * (height * 0.34);
    const x = leftPad + i * barW;
    const y = val >= 0 ? midY - val : midY;
    const h = Math.abs(val);

    ctx.fillStyle = 'rgba(52, 211, 153, 0.16)';
    ctx.strokeStyle = 'rgba(110, 231, 183, 0.42)';
    ctx.lineWidth = 1;
    ctx.fillRect(x + 2, y, barW - 4, h);
    ctx.strokeRect(x + 2, y, barW - 4, h);
  }

  // Đường cong xấp xỉ Taylor bậc thấp (mờ) & hàm gốc sáng nét
  ctx.beginPath();
  for (let s = 0; s <= 90; s += 1) {
    const u = s / 90;
    const x = leftPad + u * spanX;
    const y = midY - Math.sin(u * Math.PI * 2 + t * 0.9) * (height * 0.2);
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(229, 184, 91, 0.35)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.beginPath();
  for (let s = 0; s <= 100; s += 1) {
    const u = s / 100;
    const x = leftPad + u * spanX;
    const y = midY - fn(u) * (height * 0.34);
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#6EE7B7';
  ctx.lineWidth = 2.1;
  ctx.stroke();

  // Điểm tiếp tuyến trượt dọc theo đồ thị
  const probeU = (Math.sin(t * 0.55) + 1) * 0.5;
  const px = leftPad + probeU * spanX;
  const py = midY - fn(probeU) * (height * 0.34);
  const eps = 0.005;
  const dy = (fn(probeU + eps) - fn(probeU - eps)) / (2 * eps);
  const slopePx = (-dy * (height * 0.34)) / spanX;

  ctx.beginPath();
  ctx.moveTo(px - 38, py - 38 * slopePx);
  ctx.lineTo(px + 38, py + 38 * slopePx);
  ctx.strokeStyle = '#E5B85B';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(px, py, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFF3D1';
  ctx.fill();
}

// 4. Sân khấu Giáo dục học: 3 Quỹ đạo Venn giao thoa & Đường tăng trưởng phát triển nhân cách
function drawPedagogyStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
): void {
  const cx = width * 0.5;
  const cy = height * 0.52;
  const rOrbit = Math.min(width, height) * 0.25;

  const circles = [
    { angle: 0, color: 'rgba(231, 111, 81, 0.36)', stroke: '#E76F51', label: 'Tri thức' },
    {
      angle: (Math.PI * 2) / 3,
      color: 'rgba(229, 184, 91, 0.30)',
      stroke: '#E5B85B',
      label: 'Năng lực',
    },
    {
      angle: (Math.PI * 4) / 3,
      color: 'rgba(244, 162, 97, 0.28)',
      stroke: '#F4A261',
      label: 'Phẩm chất',
    },
  ] as const;

  for (const c of circles) {
    const a = c.angle + t * 0.18;
    const ox = cx + Math.cos(a) * (rOrbit * 0.62);
    const oy = cy + Math.sin(a) * (rOrbit * 0.48);

    const grad = ctx.createRadialGradient(ox, oy, 4, ox, oy, rOrbit * 1.1);
    grad.addColorStop(0, c.color);
    grad.addColorStop(1, 'rgba(33, 20, 18, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ox, oy, rOrbit * 1.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ox, oy, rOrbit * 1.05, 0, Math.PI * 2);
    ctx.strokeStyle = c.stroke;
    ctx.globalAlpha = 0.58;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Quỹ đạo phát triển đi lên dạng Bezier nối các mốc
  const p0 = { x: width * 0.16, y: height * 0.78 };
  const p1 = { x: width * 0.42, y: height * 0.62 };
  const p2 = { x: width * 0.62, y: height * 0.42 };
  const p3 = { x: width * 0.84, y: height * 0.24 };

  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  ctx.strokeStyle = '#FFF3D1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hạt ánh sáng trượt dọc đường quỹ đạo phát triển
  const u = (t * 0.35) % 1;
  const inv = 1 - u;
  const bx =
    inv * inv * inv * p0.x + 3 * inv * inv * u * p1.x + 3 * inv * u * u * p2.x + u * u * u * p3.x;
  const by =
    inv * inv * inv * p0.y + 3 * inv * inv * u * p1.y + 3 * inv * u * u * p2.y + u * u * u * p3.y;

  ctx.beginPath();
  ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#E5B85B';
  ctx.fill();

  for (const anchor of [p0, p3]) {
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FAF5E8';
    ctx.fill();
  }
}

export interface SubjectStageCanvasProps {
  readonly slug: string;
}

/**
 * Sân khấu Canvas 2D 120fps chuyên biệt cho 4 môn học trong Atlas Không gian Học tập.
 */
export function SubjectStageCanvas({ slug }: SubjectStageCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const theme = STAGE_THEMES[slug] ?? DEFAULT_STAGE_THEME;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    let width = Math.max(240, container.clientWidth || 360);
    let height = Math.max(180, container.clientHeight || 208);
    let dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      width = Math.max(240, container.clientWidth || 360);
      height = Math.max(180, container.clientHeight || 208);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    let isVisible = true;
    let rafId = 0;
    let elapsed = 0;
    let prevNow = performance.now();

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

    const render = (time: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      if (slug === 'hinh-hoc-affine') {
        drawAffineStage(ctx, width, height, time);
      } else if (slug === 'giai-tich-ham-mot-bien') {
        drawCalculusStage(ctx, width, height, time);
      } else if (slug === 'giao-duc-hoc') {
        drawPedagogyStage(ctx, width, height, time);
      } else {
        drawAlgebraStage(ctx, width, height, time);
      }

      ctx.restore();
    };

    render(0.8);
    if (prefersReducedMotion) {
      return () => {
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        elapsed += dtSeconds;
        render(elapsed);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [prefersReducedMotion, slug]);

  return (
    <div
      ref={containerRef}
      data-testid={`subject-stage-${slug}`}
      style={{ background: theme.background }}
      className={cn(
        'relative my-5 h-52 w-full overflow-hidden rounded-2xl border shadow-inner transition-transform duration-300 group-hover:scale-[1.01]',
        theme.borderClass,
      )}
      aria-hidden="true"
    >
      {/* Lưới tọa độ siêu mờ phía sau Canvas */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(${theme.accent} 0.75px, transparent 0.75px)`,
          backgroundSize: '18px 18px',
        }}
      />

      <canvas ref={canvasRef} className="relative z-10 block h-full w-full" />

      <span className="pointer-events-none absolute right-3 bottom-2.5 z-20 rounded-full border border-white/15 bg-black/45 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-[#FAF6EE]/85 backdrop-blur-xs">
        {theme.label}
      </span>
    </div>
  );
}
