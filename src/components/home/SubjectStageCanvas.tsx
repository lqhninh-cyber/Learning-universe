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
  readonly dotColor: string;
  readonly labelBgClass: string;
  readonly labelTextClass: string;
  readonly label: string;
}

const DEFAULT_STAGE_THEME: StageTheme = {
  background: 'linear-gradient(135deg, #F3F0E8 0%, #E9E4D8 100%)',
  borderClass: 'border-[#D8D0C0]',
  dotColor: '#6B5335',
  labelBgClass: 'border-[#D8D0C0] bg-[#FAFBF9]/85',
  labelTextClass: 'text-[#6B5335]',
  label: 'CAYLEY · ĐỐI XỨNG NHÓM S₄',
};

const STAGE_THEMES: Record<string, StageTheme> = {
  'cau-truc-dai-so': DEFAULT_STAGE_THEME,
  'hinh-hoc-affine': {
    background: 'linear-gradient(135deg, #ECF1F4 0%, #E0E9EE 100%)',
    borderClass: 'border-[#C9D7DF]',
    dotColor: '#2D5266',
    labelBgClass: 'border-[#C9D7DF] bg-[#FAFBF9]/85',
    labelTextClass: 'text-[#2D5266]',
    label: 'HYPERBOLOID · MỤC TIÊU AFFINE',
  },
  'giai-tich-ham-mot-bien': {
    background: 'linear-gradient(135deg, #EBF2EE 0%, #DFECE5 100%)',
    borderClass: 'border-[#C6DBD0]',
    dotColor: '#245746',
    labelBgClass: 'border-[#C6DBD0] bg-[#FAFBF9]/85',
    labelTextClass: 'text-[#245746]',
    label: 'TAYLOR · TÍCH PHÂN RIEMANN',
  },
  'giao-duc-hoc': {
    background: 'linear-gradient(135deg, #F3ECE9 0%, #E9DFDB 100%)',
    borderClass: 'border-[#D8C8C1]',
    dotColor: '#7A463B',
    labelBgClass: 'border-[#D8C8C1] bg-[#FAFBF9]/85',
    labelTextClass: 'text-[#7A463B]',
    label: 'HỆ SINH THÁI · QUỸ ĐẠO SƯ PHẠM',
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

// 1. Cấu trúc đại số (Đá Hổ Phách Xám): Lưới Đa Diện Đối Xứng & Đồ Thị Cayley S_4
function drawAlgebraStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
): void {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const rMain = Math.min(width, height) * 0.35;

  // Vòng sáng hổ phách xám rất nhẹ trên nền đá khoáng
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, rMain * 1.45);
  glow.addColorStop(0, 'rgba(156, 122, 76, 0.13)');
  glow.addColorStop(0.65, 'rgba(107, 83, 53, 0.05)');
  glow.addColorStop(1, 'rgba(243, 240, 232, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Vòng ngoài đồ thị Cayley S_4 (8 đỉnh bát giác + chu trình đối xứng 4-bước)
  const outerNodes: { x: number; y: number }[] = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + t * 0.12;
    outerNodes.push({
      x: cx + Math.cos(a) * rMain * 1.18,
      y: cy + Math.sin(a) * rMain * 0.88,
    });
  }

  // Các cạnh sinh (vòng liên tiếp & dây hoán vị đối xứng)
  for (let i = 0; i < 8; i += 1) {
    const a = outerNodes[i];
    const b = outerNodes[(i + 1) % 8];
    const opposite = outerNodes[(i + 4) % 8];
    const chord = outerNodes[(i + 2) % 8];
    if (!a || !b) continue;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = 'rgba(107, 83, 53, 0.42)';
    ctx.lineWidth = 1.25;
    ctx.stroke();

    if (chord) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(chord.x, chord.y);
      ctx.strokeStyle = 'rgba(156, 122, 76, 0.28)';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }

    if (i < 4 && opposite) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(opposite.x, opposite.y);
      ctx.strokeStyle = 'rgba(107, 83, 53, 0.32)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Điểm chuyển động minh họa tác động nhóm trên đồ thị Cayley
  const packetProgress = (t * 0.95) % 8;
  const segIndex = Math.floor(packetProgress);
  const segT = packetProgress - segIndex;
  const pStart = outerNodes[segIndex];
  const pEnd = outerNodes[(segIndex + 1) % 8];
  if (pStart && pEnd) {
    const px = pStart.x + (pEnd.x - pStart.x) * segT;
    const py = pStart.y + (pEnd.y - pStart.y) * segT;

    ctx.beginPath();
    ctx.arc(px, py, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = '#9C7A4C';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(px, py, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#FAFBF9';
    ctx.fill();
  }

  for (const node of outerNodes) {
    ctx.beginPath();
    ctx.arc(node.x, node.y, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = '#9C7A4C';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(node.x, node.y, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = '#F3F0E8';
    ctx.fill();
  }

  // Lưới Đa diện Tứ diện kép / Bát diện đối xứng 3D ở tâm (nhóm đối xứng S_4)
  const octVerts: readonly Vec3[] = [
    { x: 0, y: -0.76, z: 0 },
    { x: 0, y: 0.76, z: 0 },
    { x: -0.76, y: 0, z: 0 },
    { x: 0.76, y: 0, z: 0 },
    { x: 0, y: 0, z: -0.76 },
    { x: 0, y: 0, z: 0.76 },
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

  const fov = Math.min(width, height) * 0.94;
  const projected = octVerts.map((v) =>
    projectPoint3D(rotatePoint3D(v, t * 0.42, t * 0.62, t * 0.18), cx, cy, fov),
  );
  for (const [i, j] of octEdges) {
    const pa = projected[i];
    const pb = projected[j];
    if (!pa || !pb) continue;
    const front = (pa.z + pb.z) * 0.5 > 0;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.strokeStyle = front ? '#6B5335' : '#9C7A4C';
    ctx.globalAlpha = front ? 0.92 : 0.44;
    ctx.lineWidth = front ? 1.55 : 0.95;
    ctx.stroke();
  }
  for (const pt of projected) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.z > 0 ? 2.6 : 1.7, 0, Math.PI * 2);
    ctx.fillStyle = pt.z > 0 ? '#6B5335' : '#9C7A4C';
    ctx.globalAlpha = pt.z > 0 ? 0.95 : 0.55;
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// 2. Hình học Affine và Euclide (Đá Lam Phiến): Siêu mặt Hyperboloid & Hệ mục tiêu Affine
function drawAffineStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
): void {
  const cx = width * 0.5;
  const cy = height * 0.52;
  const fov = Math.min(width, height) * 1.12;

  const bgGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, width * 0.44);
  bgGlow.addColorStop(0, 'rgba(73, 118, 143, 0.13)');
  bgGlow.addColorStop(1, 'rgba(236, 241, 244, 0)');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, width, height);

  // Đường sinh thẳng của siêu mặt Hyperboloid 1 tầng xoay 3D
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
    ctx.strokeStyle = avgZ > 0 ? '#2D5266' : '#49768F';
    ctx.globalAlpha = avgZ > 0 ? 0.78 : 0.32;
    ctx.lineWidth = avgZ > 0 ? 1.35 : 0.85;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 3 mặt cắt elip Hyperboloid nét #49768F
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
    ctx.strokeStyle = 'rgba(73, 118, 143, 0.65)';
    ctx.lineWidth = 1.15;
    ctx.stroke();
  }

  // Hệ mục tiêu Affine (O; e1, e2, e3) ở tâm
  const origin = projectPoint3D(rotatePoint3D({ x: 0, y: 0, z: 0 }, rotX, rotY, 0.14), cx, cy, fov);
  const axes: readonly { vec: Vec3; color: string; label: string }[] = [
    { vec: { x: 0.72, y: 0, z: 0 }, color: '#2D5266', label: 'e₁' },
    { vec: { x: 0, y: -0.72, z: 0 }, color: '#49768F', label: 'e₂' },
    { vec: { x: 0, y: 0, z: 0.72 }, color: '#6B5335', label: 'e₃' },
  ];
  ctx.font = '600 11px "JetBrains Mono", monospace';
  for (const axis of axes) {
    const tip = projectPoint3D(rotatePoint3D(axis.vec, rotX, rotY, 0.14), cx, cy, fov);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.strokeStyle = axis.color;
    ctx.lineWidth = 1.9;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(tip.x, tip.y, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = axis.color;
    ctx.fill();
    ctx.fillText(axis.label, tip.x + 6, tip.y - 4);
  }
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 3.6, 0, Math.PI * 2);
  ctx.fillStyle = '#2D5266';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 1.4, 0, Math.PI * 2);
  ctx.fillStyle = '#FAFBF9';
  ctx.fill();
}

// 3. Giải tích hàm một biến (Đá Ngọc Bích Sương): Chuỗi Taylor, Tiếp tuyến trượt & Tích phân Riemann
function drawCalculusStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
): void {
  const midY = height * 0.56;
  const leftPad = width * 0.08;
  const spanX = width * 0.84;

  // Hệ trục tọa độ nét mảnh
  ctx.strokeStyle = 'rgba(36, 87, 70, 0.24)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftPad, midY);
  ctx.lineTo(leftPad + spanX, midY);
  ctx.moveTo(width * 0.5, height * 0.14);
  ctx.lineTo(width * 0.5, height * 0.88);
  ctx.stroke();

  const fn = (u: number) =>
    Math.sin(u * Math.PI * 2 + t * 0.85) * 0.56 + Math.cos(u * Math.PI * 4 - t * 0.48) * 0.22;

  // Các lát cắt tích phân Riemann tô bóng #3B7A65 với alpha 20%
  const bars = 18;
  const barW = spanX / bars;
  for (let i = 0; i < bars; i += 1) {
    const u = (i + 0.5) / bars;
    const val = fn(u) * (height * 0.34);
    const x = leftPad + i * barW;
    const y = val >= 0 ? midY - val : midY;
    const h = Math.abs(val);

    ctx.fillStyle = 'rgba(59, 122, 101, 0.20)';
    ctx.strokeStyle = 'rgba(36, 87, 70, 0.42)';
    ctx.lineWidth = 0.95;
    ctx.fillRect(x + 2, y, barW - 4, h);
    ctx.strokeRect(x + 2, y, barW - 4, h);
  }

  // Đường cong xấp xỉ Taylor bậc thấp (nét đứt)
  ctx.beginPath();
  for (let s = 0; s <= 90; s += 1) {
    const u = s / 90;
    const x = leftPad + u * spanX;
    const y = midY - Math.sin(u * Math.PI * 2 + t * 0.85) * (height * 0.2);
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.65)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.25;
  ctx.stroke();
  ctx.setLineDash([]);

  // Đường cong hàm chính nét Ngọc Bích Trầm (#245746)
  ctx.beginPath();
  for (let s = 0; s <= 100; s += 1) {
    const u = s / 100;
    const x = leftPad + u * spanX;
    const y = midY - fn(u) * (height * 0.34);
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#245746';
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // Tiếp tuyến trượt dọc đồ thị
  const probeU = (Math.sin(t * 0.55) + 1) * 0.5;
  const px = leftPad + probeU * spanX;
  const py = midY - fn(probeU) * (height * 0.34);
  const eps = 0.005;
  const dy = (fn(probeU + eps) - fn(probeU - eps)) / (2 * eps);
  const slopePx = (-dy * (height * 0.34)) / spanX;

  ctx.beginPath();
  ctx.moveTo(px - 38, py - 38 * slopePx);
  ctx.lineTo(px + 38, py + 38 * slopePx);
  ctx.strokeStyle = '#6B5335';
  ctx.lineWidth = 1.6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(px, py, 4.3, 0, Math.PI * 2);
  ctx.fillStyle = '#245746';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(px, py, 1.7, 0, Math.PI * 2);
  ctx.fillStyle = '#FAFBF9';
  ctx.fill();
}

// 4. Giáo dục học (Đá Đất Nung Nhạt): Sơ đồ giao thoa Hệ sinh thái Sư phạm & Quỹ đạo Nhân cách
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
    { angle: 0, fill: 'rgba(122, 70, 59, 0.14)', stroke: '#7A463B' },
    { angle: (Math.PI * 2) / 3, fill: 'rgba(158, 99, 86, 0.14)', stroke: '#9E6356' },
    { angle: (Math.PI * 4) / 3, fill: 'rgba(122, 70, 59, 0.10)', stroke: '#7A463B' },
  ] as const;

  for (const c of circles) {
    const a = c.angle + t * 0.18;
    const ox = cx + Math.cos(a) * (rOrbit * 0.62);
    const oy = cy + Math.sin(a) * (rOrbit * 0.48);

    const grad = ctx.createRadialGradient(ox, oy, 4, ox, oy, rOrbit * 1.08);
    grad.addColorStop(0, c.fill);
    grad.addColorStop(1, 'rgba(243, 236, 233, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(ox, oy, rOrbit * 1.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(ox, oy, rOrbit * 1.02, 0, Math.PI * 2);
    ctx.strokeStyle = c.stroke;
    ctx.globalAlpha = 0.68;
    ctx.lineWidth = 1.35;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Quỹ đạo phát triển nhân cách đi lên dạng Bezier nối các mốc
  const p0 = { x: width * 0.16, y: height * 0.78 };
  const p1 = { x: width * 0.42, y: height * 0.62 };
  const p2 = { x: width * 0.62, y: height * 0.42 };
  const p3 = { x: width * 0.84, y: height * 0.24 };

  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  ctx.strokeStyle = '#7A463B';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hạt ánh sáng Đất Nung (#9E6356) trượt dọc quỹ đạo phát triển
  const u = (t * 0.35) % 1;
  const inv = 1 - u;
  const bx =
    inv * inv * inv * p0.x + 3 * inv * inv * u * p1.x + 3 * inv * u * u * p2.x + u * u * u * p3.x;
  const by =
    inv * inv * inv * p0.y + 3 * inv * inv * u * p1.y + 3 * inv * u * u * p2.y + u * u * u * p3.y;

  ctx.beginPath();
  ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#9E6356';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(bx, by, 1.8, 0, Math.PI * 2);
  ctx.fillStyle = '#FAFBF9';
  ctx.fill();

  for (const anchor of [p0, p3]) {
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, 3.8, 0, Math.PI * 2);
    ctx.fillStyle = '#7A463B';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FAFBF9';
    ctx.fill();
  }
}

export interface SubjectStageCanvasProps {
  readonly slug: string;
}

/**
 * Sân khấu Canvas 2D 120fps theo Bảng Màu Pastel Học Thuật cho 4 môn học trong Atlas Không gian Học tập.
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
        'relative my-5 h-52 w-full overflow-hidden rounded-2xl border transition-transform duration-300 group-hover:scale-[1.01]',
        theme.borderClass,
      )}
      aria-hidden="true"
    >
      {/* Lưới tọa độ siêu mờ phía sau Canvas */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(${theme.dotColor} 0.7px, transparent 0.7px)`,
          backgroundSize: '18px 18px',
        }}
      />

      <canvas ref={canvasRef} className="relative z-10 block h-full w-full" />

      <span
        className={cn(
          'pointer-events-none absolute right-3 bottom-2.5 z-20 rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wider backdrop-blur-xs',
          theme.labelBgClass,
          theme.labelTextClass,
        )}
      >
        {theme.label}
      </span>
    </div>
  );
}
