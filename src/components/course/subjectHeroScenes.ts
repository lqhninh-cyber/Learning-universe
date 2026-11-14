/**
 * Bộ dựng cảnh Canvas 2D cho 4 Không gian Tri thức trên Hero trang Chi tiết Môn học.
 * Mọi chuyển động được chuẩn hóa theo `dtScale` (1.0 = khung hình 60Hz) để mượt đồng đều
 * trên màn hình 60/120/144/240Hz.
 */

import { hexToRgba, type SubjectUniverseId } from './subjectUniverseThemes';

export interface ScenePointer {
  /** Tọa độ chuẩn hóa đã làm mượt trong khoảng [-1, 1] */
  readonly nx: number;
  readonly ny: number;
  /** Tọa độ pixel đã làm mượt trong hệ tọa độ canvas */
  readonly px: number;
  readonly py: number;
  /** Mức độ hiện diện của con trỏ (0 → 1), làm mượt theo thời gian */
  readonly presence: number;
}

export interface SceneFrame {
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  /** Thời gian trôi (giây) */
  readonly time: number;
  /** Hệ số khung hình chuẩn hóa (1.0 = 16.67ms) */
  readonly dtScale: number;
  readonly pointer: ScenePointer;
}

export type SubjectScene = (frame: SceneFrame) => void;

interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface Projected {
  readonly x: number;
  readonly y: number;
  readonly depth: number;
  readonly k: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  tone: number;
}

const TAU = Math.PI * 2;

// ---------------------------------------------------------------------------
// TIỆN ÍCH DÙNG CHUNG
// ---------------------------------------------------------------------------

const glowSpriteCache = new Map<string, HTMLCanvasElement | null>();

function getGlowSprite(color: string): HTMLCanvasElement | null {
  const cached = glowSpriteCache.get(color);
  if (cached !== undefined) return cached;
  if (typeof document === 'undefined') return null;

  const sprite = document.createElement('canvas');
  sprite.width = 64;
  sprite.height = 64;
  const g = (() => {
    try {
      return sprite.getContext('2d');
    } catch {
      return null;
    }
  })();
  if (!g) {
    glowSpriteCache.set(color, null);
    return null;
  }
  const gradient = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, hexToRgba(color, 1));
  gradient.addColorStop(0.22, hexToRgba(color, 0.55));
  gradient.addColorStop(0.55, hexToRgba(color, 0.12));
  gradient.addColorStop(1, hexToRgba(color, 0));
  g.fillStyle = gradient;
  g.fillRect(0, 0, 64, 64);
  glowSpriteCache.set(color, sprite);
  return sprite;
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  color: string,
  x: number,
  y: number,
  radius: number,
  alpha: number,
): void {
  const sprite = getGlowSprite(color);
  if (!sprite || alpha <= 0) return;
  ctx.globalAlpha = Math.min(alpha, 1);
  ctx.drawImage(sprite, x - radius, y - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}

function rotate3d(p: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x = p.x * cy + p.z * sy;
  const z1 = -p.x * sy + p.z * cy;
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y = p.y * cp - z1 * sp;
  const z = p.y * sp + z1 * cp;
  return { x, y, z };
}

/** Phép chiếu phối cảnh (trục y mô hình hướng lên, trục y màn hình hướng xuống). */
function project(p: Vec3, cx: number, cy: number, scale: number, camera: number): Projected {
  const k = camera / Math.max(camera + p.z, 0.2);
  return { x: cx + p.x * scale * k, y: cy - p.y * scale * k, depth: p.z, k };
}

function depthAlpha(depth: number, range: number): number {
  const t = (depth + range) / (2 * range);
  return 0.22 + 0.7 * (1 - Math.min(Math.max(t, 0), 1));
}

function createParticles(count: number, seed: number): Particle[] {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    vx: (rand() - 0.5) * 0.0004,
    vy: -(0.0003 + rand() * 0.0009),
    size: 0.6 + rand() * 1.8,
    phase: rand() * TAU,
    tone: rand(),
  }));
}

function stepParticles(particles: Particle[], dtScale: number, time: number): void {
  for (const p of particles) {
    p.x += (p.vx + Math.sin(time * 0.6 + p.phase) * 0.00012) * dtScale;
    p.y += p.vy * dtScale;
    if (p.y < -0.05) {
      p.y = 1.05;
      p.x = (p.x + 0.37) % 1;
    }
    if (p.x < -0.05) p.x = 1.05;
    if (p.x > 1.05) p.x = -0.05;
  }
}

/** Vị trí tâm cảnh vật: lệch phải trên màn hình rộng để nhường chỗ cho chữ bên trái. */
function sceneAnchor(width: number, height: number): { cx: number; cy: number; size: number } {
  const wide = width >= 960;
  return {
    cx: wide ? width * 0.7 : width * 0.62,
    cy: height * 0.52,
    size: Math.min(width * (wide ? 0.34 : 0.6), height * 0.92),
  };
}

// ---------------------------------------------------------------------------
// A. CẤU TRÚC ĐẠI SỐ — TINH THỂ ĐỐI XỨNG & ĐỒ THỊ CAYLEY CỦA NHÓM NHỊ DIỆN D6
// ---------------------------------------------------------------------------

const CTDS_GOLD = '#E5B84B';
const CTDS_CINNABAR = '#D94E34';

const SUPERSCRIPTS = ['', '', '²', '³', '⁴', '⁵'];

function buildIcosahedron(radius: number): { vertices: Vec3[]; edges: [number, number][] } {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw: [number, number, number][] = [
    [-1, phi, 0],
    [1, phi, 0],
    [-1, -phi, 0],
    [1, -phi, 0],
    [0, -1, phi],
    [0, 1, phi],
    [0, -1, -phi],
    [0, 1, -phi],
    [phi, 0, -1],
    [phi, 0, 1],
    [-phi, 0, -1],
    [-phi, 0, 1],
  ];
  const norm = Math.sqrt(1 + phi * phi);
  const vertices = raw.map(([x, y, z]) => ({
    x: (x / norm) * radius,
    y: (y / norm) * radius,
    z: (z / norm) * radius,
  }));
  const edges: [number, number][] = [];
  const edgeLength = (2 / norm) * radius;
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      const a = vertices[i];
      const b = vertices[j];
      if (!a || !b) continue;
      const d = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      if (Math.abs(d - edgeLength) < 0.01 * radius) edges.push([i, j]);
    }
  }
  return { vertices, edges };
}

export function createCtdsScene(): SubjectScene {
  const n = 6;
  // Đỉnh r^i nằm ở vành trên, đỉnh r^i·s nằm ở vành dưới (đồ thị Cayley D6 với hệ sinh {r, s})
  const vertices: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    vertices.push({ x: Math.cos(a), y: 0.5, z: Math.sin(a) });
  }
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    vertices.push({ x: Math.cos(a), y: -0.5, z: Math.sin(a) });
  }
  const labels = [
    ...Array.from({ length: n }, (_, i) => (i === 0 ? 'e' : `r${SUPERSCRIPTS[i] ?? ''}`)),
    ...Array.from({ length: n }, (_, i) => (i === 0 ? 's' : `r${SUPERSCRIPTS[i] ?? ''}s`)),
  ];

  // Cạnh nhân phải với r: r^i → r^(i+1) (vành trên), r^i·s → r^(i−1)·s (vành dưới, ngược chiều)
  const rEdges: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    rEdges.push([i, (i + 1) % n]);
    rEdges.push([n + i, n + ((i - 1 + n) % n)]);
  }
  // Cạnh nhân phải với s (phần tử cấp 2): r^i ↔ r^i·s
  const sEdges: [number, number][] = Array.from({ length: n }, (_, i) => [i, n + i]);

  const crystal = buildIcosahedron(0.36);
  const dust = createParticles(70, 7);

  return ({ ctx, width, height, time, dtScale, pointer }) => {
    const { cx, cy, size } = sceneAnchor(width, height);
    const scale = size * 0.5;
    const yaw = time * 0.16 + pointer.nx * 0.65;
    const pitch = 0.38 + pointer.ny * 0.28;
    const camera = 3.6;

    // Hoa văn đối xứng 12 tia mờ phía sau (nhóm quay C12)
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.03);
    ctx.strokeStyle = hexToRgba(CTDS_GOLD, 0.06);
    ctx.lineWidth = 1;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a) * size * 0.95, Math.sin(a) * size * 0.95);
      ctx.stroke();
    }
    for (let ring = 1; ring <= 3; ring++) {
      ctx.beginPath();
      for (let i = 0; i <= 12; i++) {
        const a = (i / 12) * TAU;
        const r = size * 0.28 * ring;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.stroke();
    }
    ctx.restore();

    // Bụi vàng kim lơ lửng
    stepParticles(dust, dtScale, time);
    for (const p of dust) {
      const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(time * 1.4 + p.phase));
      const color = p.tone > 0.82 ? CTDS_CINNABAR : CTDS_GOLD;
      ctx.fillStyle = hexToRgba(color, 0.35 * twinkle);
      ctx.fillRect(p.x * width, p.y * height, p.size, p.size);
    }

    const projected = vertices.map((v) => project(rotate3d(v, yaw, pitch), cx, cy, scale, camera));

    // Khối đa diện đối xứng (nhóm quay của khối hai mươi mặt) ở tâm
    const crystalProjected = crystal.vertices.map((v) =>
      project(
        rotate3d(v, -time * 0.35 + pointer.nx * 0.4, time * 0.21 + pitch),
        cx,
        cy,
        scale,
        camera,
      ),
    );
    ctx.lineWidth = 1;
    for (const [a, b] of crystal.edges) {
      const pa = crystalProjected[a];
      const pb = crystalProjected[b];
      if (!pa || !pb) continue;
      ctx.strokeStyle = hexToRgba(
        CTDS_GOLD,
        0.18 + 0.22 * depthAlpha((pa.depth + pb.depth) / 2, 0.4),
      );
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    }
    drawGlow(ctx, CTDS_GOLD, cx, cy, scale * 0.42, 0.22);

    // Cạnh đồ thị Cayley
    const drawEdge = (a: number, b: number, color: string, width2: number) => {
      const pa = projected[a];
      const pb = projected[b];
      if (!pa || !pb) return;
      const alpha = depthAlpha((pa.depth + pb.depth) / 2, 1.2);
      ctx.strokeStyle = hexToRgba(color, alpha * 0.55);
      ctx.lineWidth = width2;
      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);
      ctx.stroke();
    };
    for (const [a, b] of rEdges) drawEdge(a, b, CTDS_GOLD, 1.4);
    for (const [a, b] of sEdges) drawEdge(a, b, CTDS_CINNABAR, 1.1);

    // Xung ánh sáng chạy dọc cạnh: phép hợp thành g ↦ g·r (một chiều) và g ↦ g·s (đi – về)
    rEdges.forEach(([a, b], index) => {
      const pa = projected[a];
      const pb = projected[b];
      if (!pa || !pb) return;
      const t = (time * 0.45 + index * 0.137) % 1;
      const x = pa.x + (pb.x - pa.x) * t;
      const y = pa.y + (pb.y - pa.y) * t;
      const alpha = depthAlpha((pa.depth + pb.depth) / 2, 1.2);
      drawGlow(ctx, CTDS_GOLD, x, y, 9 * pa.k, alpha * 0.9);
    });
    sEdges.forEach(([a, b], index) => {
      const pa = projected[a];
      const pb = projected[b];
      if (!pa || !pb) return;
      const t = 0.5 + 0.5 * Math.sin(time * 1.3 + index * 1.05);
      const x = pa.x + (pb.x - pa.x) * t;
      const y = pa.y + (pb.y - pa.y) * t;
      const alpha = depthAlpha((pa.depth + pb.depth) / 2, 1.2);
      drawGlow(ctx, CTDS_CINNABAR, x, y, 8 * pa.k, alpha * 0.85);
    });

    // Đỉnh phát sáng & nhãn phần tử nhóm
    ctx.font = '500 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    projected.forEach((p, index) => {
      const alpha = depthAlpha(p.depth, 1.2);
      const pulse = 0.75 + 0.25 * Math.sin(time * 2 + index);
      drawGlow(ctx, CTDS_GOLD, p.x, p.y, 16 * p.k * pulse, alpha * 0.8);
      ctx.fillStyle = hexToRgba('#FFF4D6', alpha);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.6 * p.k, 0, TAU);
      ctx.fill();
      const label = labels[index];
      if (label) {
        ctx.fillStyle = hexToRgba('#F6E2B0', alpha * 0.85);
        ctx.fillText(label, p.x + 14 * p.k, p.y - 12 * p.k);
      }
    });
  };
}

// ---------------------------------------------------------------------------
// B. HÌNH HỌC AFFINE & EUCLIDE — LƯỚI TỌA ĐỘ PHỐI CẢNH & HYPERBOLOID MỘT TẦNG
// ---------------------------------------------------------------------------

const HH_SKY = '#38BDF8';
const HH_PLATINUM = '#FDE68A';

function drawArrow(
  ctx: CanvasRenderingContext2D,
  from: Projected,
  to: Projected,
  color: string,
  label: string,
): void {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const head = 9;
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - head * Math.cos(angle - 0.4), to.y - head * Math.sin(angle - 0.4));
  ctx.lineTo(to.x - head * Math.cos(angle + 0.4), to.y - head * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.font = 'italic 600 13px "Times New Roman", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, to.x + 14 * Math.cos(angle), to.y + 14 * Math.sin(angle));
}

export function createHhaveScene(): SubjectScene {
  const rulingCount = 30;
  const radius = 0.95;
  const halfHeight = 1.15;
  const twist = TAU * 0.3;
  const stars = createParticles(80, 11);

  return ({ ctx, width, height, time, dtScale, pointer }) => {
    const { cx, cy, size } = sceneAnchor(width, height);
    const scale = size * 0.42;
    const yaw = time * 0.2 + pointer.nx * 0.55;
    const pitch = 0.3 + pointer.ny * 0.2;
    const camera = 6;

    // Sao xa xăm
    stepParticles(stars, dtScale * 0.3, time);
    for (const p of stars) {
      const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.9 + p.phase));
      ctx.fillStyle = hexToRgba(p.tone > 0.85 ? HH_PLATINUM : '#BAE6FD', 0.32 * twinkle);
      ctx.fillRect(p.x * width, p.y * height * 0.75, p.size * 0.8, p.size * 0.8);
    }

    const toScreen = (p: Vec3) => project(rotate3d(p, yaw, pitch), cx, cy, scale, camera);

    // Mặt phẳng lưới tọa độ phối cảnh (y = -1.35)
    const floorY = -1.35;
    const extent = 3;
    ctx.lineWidth = 1;
    for (let i = -extent * 2; i <= extent * 2; i++) {
      const v = i / 2;
      const a1 = toScreen({ x: v, y: floorY, z: -extent });
      const b1 = toScreen({ x: v, y: floorY, z: extent });
      const a2 = toScreen({ x: -extent, y: floorY, z: v });
      const b2 = toScreen({ x: extent, y: floorY, z: v });
      const strong = i === 0;
      ctx.strokeStyle = hexToRgba(HH_SKY, strong ? 0.32 : 0.1);
      ctx.beginPath();
      ctx.moveTo(a1.x, a1.y);
      ctx.lineTo(b1.x, b1.y);
      ctx.moveTo(a2.x, a2.y);
      ctx.lineTo(b2.x, b2.y);
      ctx.stroke();
    }

    // Hai họ đường sinh thẳng của hyperboloid một tầng: nối điểm góc θ ở đáy với góc θ ± α ở đỉnh
    const drawFamily = (direction: 1 | -1, color: string) => {
      for (let i = 0; i < rulingCount; i++) {
        const theta = (i / rulingCount) * TAU;
        const bottom = toScreen({
          x: radius * Math.cos(theta),
          y: -halfHeight,
          z: radius * Math.sin(theta),
        });
        const top = toScreen({
          x: radius * Math.cos(theta + direction * twist),
          y: halfHeight,
          z: radius * Math.sin(theta + direction * twist),
        });
        const alpha = depthAlpha((bottom.depth + top.depth) / 2, 1.1);
        ctx.strokeStyle = hexToRgba(color, alpha * 0.62);
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(bottom.x, bottom.y);
        ctx.lineTo(top.x, top.y);
        ctx.stroke();
      }
    };
    drawFamily(1, HH_SKY);
    drawFamily(-1, HH_PLATINUM);

    // Đường tròn đáy, đỉnh và đường thắt (eo) của mặt
    const waist = radius * Math.cos(twist / 2);
    const rings: { y: number; r: number; color: string; alpha: number }[] = [
      { y: -halfHeight, r: radius, color: HH_SKY, alpha: 0.7 },
      { y: halfHeight, r: radius, color: HH_SKY, alpha: 0.7 },
      { y: 0, r: waist, color: HH_PLATINUM, alpha: 0.85 },
    ];
    for (const ring of rings) {
      ctx.strokeStyle = hexToRgba(ring.color, ring.alpha);
      ctx.lineWidth = ring.y === 0 ? 1.6 : 1.2;
      ctx.beginPath();
      for (let s = 0; s <= 64; s++) {
        const a = (s / 64) * TAU;
        const p = toScreen({ x: ring.r * Math.cos(a), y: ring.y, z: ring.r * Math.sin(a) });
        if (s === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }

    // Điểm sáng chạy dọc đường thắt
    for (let s = 0; s < 3; s++) {
      const a = time * 0.8 + (s / 3) * TAU;
      const p = toScreen({ x: waist * Math.cos(a), y: 0, z: waist * Math.sin(a) });
      drawGlow(ctx, HH_PLATINUM, p.x, p.y, 14 * p.k, depthAlpha(p.depth, 1.1));
    }

    // Mục tiêu affine {O; e₁, e₂, e₃} phản ứng theo con trỏ (cơ sở không nhất thiết trực chuẩn)
    const origin: Vec3 = { x: -2.1, y: floorY, z: 1.6 };
    const e1: Vec3 = { x: 1, y: 0, z: 0.35 * pointer.ny };
    const e2: Vec3 = { x: 0.3 * pointer.nx, y: 1.05, z: 0 };
    const e3: Vec3 = { x: 0.25 * pointer.nx, y: 0, z: -1 };
    const o = toScreen(origin);
    const add = (a: Vec3, b: Vec3): Vec3 => ({ x: a.x + b.x, y: a.y + b.y, z: a.z + b.z });
    drawArrow(ctx, o, toScreen(add(origin, e1)), hexToRgba(HH_SKY, 0.95), 'e₁');
    drawArrow(ctx, o, toScreen(add(origin, e2)), hexToRgba(HH_PLATINUM, 0.95), 'e₂');
    drawArrow(ctx, o, toScreen(add(origin, e3)), hexToRgba('#A5F3FC', 0.9), 'e₃');
    drawGlow(ctx, HH_PLATINUM, o.x, o.y, 12, 0.9);
    ctx.fillStyle = hexToRgba('#E0F2FE', 0.9);
    ctx.font = 'italic 600 13px "Times New Roman", Georgia, serif';
    ctx.fillText('O', o.x - 12, o.y + 10);
  };
}

// ---------------------------------------------------------------------------
// C. GIẢI TÍCH HÀM MỘT BIẾN — CỰC QUANG CHUỖI FOURIER & TỔNG RIEMANN
// ---------------------------------------------------------------------------

const GT_EMERALD = '#34D399';
const GT_SUN = '#FBBF24';

/** Tổng riêng thứ N của chuỗi Fourier sóng vuông: (4/π)·Σ sin((2k−1)u)/(2k−1). */
function squareWavePartialSum(u: number, terms: number): number {
  let sum = 0;
  for (let k = 1; k <= terms; k++) {
    const m = 2 * k - 1;
    sum += Math.sin(m * u) / m;
  }
  return (4 / Math.PI) * sum;
}

export function createGthmbScene(): SubjectScene {
  const fireflies = createParticles(46, 23);

  return ({ ctx, width, height, time, dtScale, pointer }) => {
    const wide = width >= 960;
    const bandTop = height * 0.2;
    const bandAmp = height * 0.085;
    const step = Math.max(4, Math.round(width / 260));

    // Dải cực quang mềm (vùng giữa hai đồ thị sin)
    const aurora = ctx.createLinearGradient(0, bandTop - bandAmp * 2, 0, bandTop + bandAmp * 3);
    aurora.addColorStop(0, hexToRgba(GT_EMERALD, 0));
    aurora.addColorStop(0.5, hexToRgba(GT_EMERALD, 0.1));
    aurora.addColorStop(1, hexToRgba(GT_SUN, 0));
    ctx.fillStyle = aurora;
    ctx.beginPath();
    for (let x = 0; x <= width; x += step) {
      const y = bandTop + Math.sin(x * 0.006 + time * 0.4) * bandAmp * 1.4;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let x = width; x >= 0; x -= step) {
      const y = bandTop + bandAmp * 2.4 + Math.sin(x * 0.005 - time * 0.3 + 1.2) * bandAmp;
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Họ tổng riêng Fourier S₁…S₆ hội tụ dần về sóng vuông
    const baseline = bandTop + bandAmp * 1.6;
    const phase = time * 0.35 + pointer.nx * 0.4;
    for (let terms = 1; terms <= 6; terms++) {
      const t = terms / 6;
      ctx.strokeStyle = hexToRgba(terms === 6 ? GT_SUN : GT_EMERALD, 0.14 + t * 0.5);
      ctx.lineWidth = terms === 6 ? 1.8 : 1.1;
      ctx.beginPath();
      for (let x = 0; x <= width; x += step) {
        const u = (x / width) * TAU * 2.2 + phase;
        const y = baseline - squareWavePartialSum(u, terms) * bandAmp * 0.9 + (6 - terms) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Tổng Riemann dưới đồ thị hàm khả vi f
    const regionStart = wide ? width * 0.44 : width * 0.04;
    const regionEnd = width * 0.98;
    const floor = height - 2;
    const barCount = wide ? 30 : 22;
    const barWidth = (regionEnd - regionStart) / barCount;
    const maxBar = height * 0.36;
    const f = (x: number) => {
      const u = (x - regionStart) / (regionEnd - regionStart);
      return (
        0.48 +
        0.24 * Math.sin(u * TAU * 1.1 + time * 0.55) +
        0.12 * Math.sin(u * TAU * 2.7 - time * 0.4 + 0.8)
      );
    };
    const sigma = barWidth * 3.2;
    for (let i = 0; i < barCount; i++) {
      const x0 = regionStart + i * barWidth;
      const mid = x0 + barWidth / 2;
      const distance = mid - pointer.px;
      const lift =
        1 + 0.28 * pointer.presence * Math.exp(-(distance * distance) / (2 * sigma * sigma));
      const h = f(mid) * maxBar * lift;
      const highlight = pointer.presence * Math.exp(-(distance * distance) / (2 * sigma * sigma));
      ctx.fillStyle = hexToRgba(GT_EMERALD, 0.1 + 0.16 * highlight);
      ctx.fillRect(x0 + 1, floor - h, barWidth - 2, h);
      ctx.fillStyle = hexToRgba(GT_SUN, 0.45 + 0.4 * highlight);
      ctx.fillRect(x0 + 1, floor - h, barWidth - 2, 1.5);
    }

    // Đồ thị f liền mạch phía trên các cột
    ctx.strokeStyle = hexToRgba(GT_SUN, 0.75);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let x = regionStart; x <= regionEnd; x += step) {
      const y = floor - f(x) * maxBar;
      if (x === regionStart) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Tiếp tuyến tại hoành độ con trỏ: hệ số góc f′(x₀) xấp xỉ bằng sai phân trung tâm
    if (pointer.presence > 0.02 && pointer.px >= regionStart && pointer.px <= regionEnd) {
      const x0 = pointer.px;
      const h = 1.5;
      const y0 = floor - f(x0) * maxBar;
      const slope = (-(f(x0 + h) - f(x0 - h)) * maxBar) / (2 * h);
      const span = 70;
      ctx.strokeStyle = hexToRgba('#ECFDF5', 0.7 * pointer.presence);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x0 - span, y0 - slope * span);
      ctx.lineTo(x0 + span, y0 + slope * span);
      ctx.stroke();
      drawGlow(ctx, GT_SUN, x0, y0, 16, pointer.presence);
    }

    // Đom đóm lân tinh
    stepParticles(fireflies, dtScale, time);
    for (const p of fireflies) {
      const glow = 0.25 + 0.75 * Math.abs(Math.sin(time * 1.1 + p.phase));
      drawGlow(
        ctx,
        p.tone > 0.7 ? GT_SUN : GT_EMERALD,
        p.x * width,
        p.y * height,
        4 + p.size * 2,
        glow * 0.55,
      );
    }
  };
}

// ---------------------------------------------------------------------------
// D. GIÁO DỤC HỌC — VÒNG GIAO THOA ĐỒNG TÂM & HỆ SINH THÁI SƯ PHẠM
// ---------------------------------------------------------------------------

const GDH_CINNABAR = '#E76F51';
const GDH_GOLD = '#E9C46A';
const GDH_LOTUS = '#52B788';

export function createGdhScene(): SubjectScene {
  const embers = createParticles(80, 31);
  const nodes: { label: string; color: string; angle: number }[] = [
    { label: 'Giáo dục', color: GDH_CINNABAR, angle: -Math.PI / 2 },
    { label: 'Dạy học', color: GDH_GOLD, angle: -Math.PI / 2 + TAU / 3 },
    { label: 'Phát triển nhân cách', color: GDH_LOTUS, angle: -Math.PI / 2 + (2 * TAU) / 3 },
  ];

  return ({ ctx, width, height, time, dtScale, pointer }) => {
    const { cx, cy, size } = sceneAnchor(width, height);
    const spread = size * 0.2;
    const circleRadius = size * 0.27;
    const ringMax = size * 0.55;

    const centers = nodes.map((node, index) => {
      const breathe = 1 + 0.04 * Math.sin(time * 0.8 + index * 2.1);
      const bx = cx + Math.cos(node.angle) * spread * breathe;
      const by = cy + Math.sin(node.angle) * spread * breathe;
      // Nghiêng nhẹ về phía con trỏ
      const pull = 0.04 * pointer.presence;
      return {
        ...node,
        x: bx + (pointer.px - bx) * pull,
        y: by + (pointer.py - by) * pull,
      };
    });

    // Vòng sóng lan tỏa đồng tâm giao thoa (hòa sắc cộng)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const c of centers) {
      for (let k = 0; k < 6; k++) {
        const r = (time * 22 + k * (ringMax / 6)) % ringMax;
        const alpha = (1 - r / ringMax) * 0.22;
        ctx.strokeStyle = hexToRgba(c.color, alpha);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, TAU);
        ctx.stroke();
      }
      const fill = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, circleRadius);
      fill.addColorStop(0, hexToRgba(c.color, 0.12));
      fill.addColorStop(1, hexToRgba(c.color, 0.02));
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(c.x, c.y, circleRadius, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    // Ba vòng tròn thống nhất (đường viền) và nhãn
    ctx.font = '600 12px ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const c of centers) {
      ctx.strokeStyle = hexToRgba(c.color, 0.55);
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(c.x, c.y, circleRadius, 0, TAU);
      ctx.stroke();
      const lx = cx + (c.x - cx) * 2.55;
      const ly = cy + (c.y - cy) * 2.55;
      ctx.fillStyle = hexToRgba(c.color, 0.85);
      ctx.fillText(c.label, lx, ly);
    }
    drawGlow(ctx, GDH_GOLD, cx, cy, spread * 1.3, 0.5 + 0.15 * Math.sin(time * 1.6));

    // Đường cung kết nối mềm từ con trỏ tới ba tâm
    if (pointer.presence > 0.02) {
      ctx.save();
      ctx.setLineDash([4, 6]);
      ctx.lineDashOffset = -time * 28;
      ctx.lineWidth = 1.2;
      for (const c of centers) {
        const mx = (pointer.px + c.x) / 2;
        const my = Math.min(pointer.py, c.y) - 60;
        ctx.strokeStyle = hexToRgba(c.color, 0.5 * pointer.presence);
        ctx.beginPath();
        ctx.moveTo(pointer.px, pointer.py);
        ctx.quadraticCurveTo(mx, my, c.x, c.y);
        ctx.stroke();
      }
      ctx.restore();
      drawGlow(ctx, GDH_GOLD, pointer.px, pointer.py, 14, 0.8 * pointer.presence);
    }

    // Hạt sáng ấm áp bay lên
    stepParticles(embers, dtScale * 1.3, time);
    for (const p of embers) {
      const color = p.tone < 0.45 ? GDH_CINNABAR : p.tone < 0.8 ? GDH_GOLD : GDH_LOTUS;
      const life = Math.min(1, p.y * 1.4);
      drawGlow(ctx, color, p.x * width, p.y * height, 3 + p.size * 2, 0.6 * life);
    }
  };
}

export const SUBJECT_SCENE_FACTORIES: Readonly<Record<SubjectUniverseId, () => SubjectScene>> = {
  ctds: createCtdsScene,
  hhave: createHhaveScene,
  gthmb: createGthmbScene,
  gdh: createGdhScene,
};
