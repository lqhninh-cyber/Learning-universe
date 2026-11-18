import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';

interface StageInteraction {
  readonly rotOffsetX: number;
  readonly rotOffsetY: number;
}

interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface StageTheme {
  readonly background: string;
  readonly borderClass: string;
  readonly dotColor: string;
}

const DEFAULT_STAGE_THEME: StageTheme = {
  background: 'linear-gradient(135deg, #F3F0E8 0%, #E9E4D8 100%)',
  borderClass: 'border-[#D8D0C0]',
  dotColor: '#6B5335',
};

const STAGE_THEMES: Record<string, StageTheme> = {
  'cau-truc-dai-so': DEFAULT_STAGE_THEME,
  'hinh-hoc-affine': {
    background: 'linear-gradient(135deg, #ECF1F4 0%, #E0E9EE 100%)',
    borderClass: 'border-[#C9D7DF]',
    dotColor: '#2D5266',
  },
  'giai-tich-ham-mot-bien': {
    background: 'linear-gradient(135deg, #EBF2EE 0%, #DFECE5 100%)',
    borderClass: 'border-[#C6DBD0]',
    dotColor: '#245746',
  },
  'giao-duc-hoc': {
    background: 'linear-gradient(135deg, #F3ECE9 0%, #E9DFDB 100%)',
    borderClass: 'border-[#D8C8C1]',
    dotColor: '#7A463B',
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

function drawGlowingNode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fill: string,
  glowColor: string,
): void {
  const halo = ctx.createRadialGradient(x, y, 0.5, x, y, radius * 2.6);
  halo.addColorStop(0, glowColor);
  halo.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, Math.max(1.2, radius * 0.42), 0, Math.PI * 2);
  ctx.fillStyle = '#FAFBF9';
  ctx.fill();
}

// 1. Cấu trúc đại số: Đồ thị đối xứng Cayley & Khối Bát diện tô bóng bán trong suốt 3D
function drawAlgebraStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  interaction: StageInteraction,
): void {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const rMain = Math.min(width, height) * 0.35;

  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, rMain * 1.5);
  glow.addColorStop(0, 'rgba(156, 122, 76, 0.16)');
  glow.addColorStop(0.6, 'rgba(107, 83, 53, 0.06)');
  glow.addColorStop(1, 'rgba(243, 240, 232, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  // Vòng ngoài đồ thị đối xứng bát giác + dây hợp thành nhóm
  const outerNodes: { x: number; y: number }[] = [];
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * Math.PI * 2 + t * 0.14 + interaction.rotOffsetX * 0.45;
    outerNodes.push({
      x: cx + Math.cos(a) * rMain * 1.18,
      y: cy + Math.sin(a) * rMain * 0.88,
    });
  }

  for (let i = 0; i < 8; i += 1) {
    const a = outerNodes[i];
    const b = outerNodes[(i + 1) % 8];
    const opposite = outerNodes[(i + 4) % 8];
    const chord = outerNodes[(i + 2) % 8];
    if (!a || !b) continue;

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = 'rgba(107, 83, 53, 0.46)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    if (chord) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(chord.x, chord.y);
      ctx.strokeStyle = 'rgba(156, 122, 76, 0.30)';
      ctx.lineWidth = 0.95;
      ctx.stroke();
    }

    if (i < 4 && opposite) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(opposite.x, opposite.y);
      ctx.strokeStyle = 'rgba(107, 83, 53, 0.28)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // Điểm phát sáng chạy dọc chu trình tác động nhóm
  const packetProgress = (t * 0.95) % 8;
  const segIndex = Math.floor(packetProgress);
  const segT = packetProgress - segIndex;
  const pStart = outerNodes[segIndex];
  const pEnd = outerNodes[(segIndex + 1) % 8];
  if (pStart && pEnd) {
    drawGlowingNode(
      ctx,
      pStart.x + (pEnd.x - pStart.x) * segT,
      pStart.y + (pEnd.y - pStart.y) * segT,
      4.4,
      '#9C7A4C',
      'rgba(156, 122, 76, 0.45)',
    );
  }

  for (const node of outerNodes) {
    drawGlowingNode(ctx, node.x, node.y, 3.6, '#8B6D43', 'rgba(156, 122, 76, 0.24)');
  }

  // Bát diện 3D tô bóng từng mặt (Z-sorted translucent planes)
  const octVerts: readonly Vec3[] = [
    { x: 0, y: -0.82, z: 0 }, // 0 top
    { x: 0, y: 0.82, z: 0 }, // 1 bottom
    { x: -0.82, y: 0, z: 0 }, // 2 left
    { x: 0.82, y: 0, z: 0 }, // 3 right
    { x: 0, y: 0, z: -0.82 }, // 4 back
    { x: 0, y: 0, z: 0.82 }, // 5 front
  ];
  const octFaces: readonly (readonly [number, number, number])[] = [
    [0, 5, 3],
    [0, 3, 4],
    [0, 4, 2],
    [0, 2, 5],
    [1, 3, 5],
    [1, 4, 3],
    [1, 2, 4],
    [1, 5, 2],
  ];

  const fov = Math.min(width, height) * 0.96;
  const rotVerts = octVerts.map((v) =>
    rotatePoint3D(
      v,
      t * 0.44 + interaction.rotOffsetY,
      t * 0.64 + interaction.rotOffsetX,
      t * 0.18,
    ),
  );
  const projected = rotVerts.map((v) => projectPoint3D(v, cx, cy, fov));

  const sortedFaces = octFaces
    .map(([a, b, c]) => {
      const va = rotVerts[a]!;
      const vb = rotVerts[b]!;
      const vc = rotVerts[c]!;
      const pa = projected[a]!;
      const pb = projected[b]!;
      const pc = projected[c]!;
      const ux = vb.x - va.x;
      const uy = vb.y - va.y;
      const uz = vb.z - va.z;
      const vx = vc.x - va.x;
      const vy = vc.y - va.y;
      const vz = vc.z - va.z;
      const nx = uy * vz - uz * vy;
      const ny = uz * vx - ux * vz;
      const nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz) || 1;
      const light = Math.max(0, (-0.4 * nx - 0.6 * ny + 0.7 * nz) / len);
      return { pa, pb, pc, avgZ: (va.z + vb.z + vc.z) / 3, light, front: nz >= 0 };
    })
    .sort((a, b) => a.avgZ - b.avgZ);

  for (const face of sortedFaces) {
    ctx.beginPath();
    ctx.moveTo(face.pa.x, face.pa.y);
    ctx.lineTo(face.pb.x, face.pb.y);
    ctx.lineTo(face.pc.x, face.pc.y);
    ctx.closePath();

    const alpha = face.front ? 0.16 + face.light * 0.24 : 0.06;
    const red = Math.round(138 + face.light * 65);
    const green = Math.round(104 + face.light * 56);
    const blue = Math.round(58 + face.light * 38);
    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
    ctx.fill();

    ctx.strokeStyle = face.front ? 'rgba(107, 83, 53, 0.88)' : 'rgba(156, 122, 76, 0.36)';
    ctx.lineWidth = face.front ? 1.45 : 0.9;
    ctx.stroke();
  }

  for (const pt of projected) {
    if (pt.z > 0) {
      drawGlowingNode(ctx, pt.x, pt.y, 2.7, '#6B5335', 'rgba(156, 122, 76, 0.38)');
    }
  }
}

// 2. Hình học Affine và Euclide: Hyperboloid 2 họ đường sinh + các dải mặt cong tô bóng + hệ mục tiêu
function drawAffineStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  interaction: StageInteraction,
): void {
  const cx = width * 0.5;
  const cy = height * 0.52;
  const fov = Math.min(width, height) * 1.12;

  const bgGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, width * 0.45);
  bgGlow.addColorStop(0, 'rgba(73, 118, 143, 0.16)');
  bgGlow.addColorStop(1, 'rgba(236, 241, 244, 0)');
  ctx.fillStyle = bgGlow;
  ctx.fillRect(0, 0, width, height);

  const sectors = 18;
  const rotY = t * 0.32 + interaction.rotOffsetX;
  const rotX = 0.52 + Math.sin(t * 0.4) * 0.08 + interaction.rotOffsetY;
  const twist = 0.96;

  // Xây dựng lưới điểm trên vành trên, vành eo giữa và vành đáy để tô mặt cong Hyperboloid
  const topRing: { w: Vec3; p: ReturnType<typeof projectPoint3D> }[] = [];
  const midRing: { w: Vec3; p: ReturnType<typeof projectPoint3D> }[] = [];
  const botRing: { w: Vec3; p: ReturnType<typeof projectPoint3D> }[] = [];

  for (let i = 0; i < sectors; i += 1) {
    const phi = (i / sectors) * Math.PI * 2;
    const wTop = rotatePoint3D(
      { x: 0.94 * Math.cos(phi + twist), y: -0.78, z: 0.94 * Math.sin(phi + twist) },
      rotX,
      rotY,
      0.14,
    );
    const wMid = rotatePoint3D(
      { x: 0.54 * Math.cos(phi), y: 0, z: 0.54 * Math.sin(phi) },
      rotX,
      rotY,
      0.14,
    );
    const wBot = rotatePoint3D(
      { x: 0.94 * Math.cos(phi - twist), y: 0.78, z: 0.94 * Math.sin(phi - twist) },
      rotX,
      rotY,
      0.14,
    );
    topRing.push({ w: wTop, p: projectPoint3D(wTop, cx, cy, fov) });
    midRing.push({ w: wMid, p: projectPoint3D(wMid, cx, cy, fov) });
    botRing.push({ w: wBot, p: projectPoint3D(wBot, cx, cy, fov) });
  }

  // Tô bóng dải mặt cong bán trong suốt (Z-sorted)
  const bands: {
    pts: [
      ReturnType<typeof projectPoint3D>,
      ReturnType<typeof projectPoint3D>,
      ReturnType<typeof projectPoint3D>,
      ReturnType<typeof projectPoint3D>,
    ];
    avgZ: number;
  }[] = [];

  for (let i = 0; i < sectors; i += 1) {
    const next = (i + 1) % sectors;
    bands.push({
      pts: [topRing[i]!.p, topRing[next]!.p, midRing[next]!.p, midRing[i]!.p],
      avgZ: (topRing[i]!.w.z + midRing[i]!.w.z) * 0.5,
    });
    bands.push({
      pts: [midRing[i]!.p, midRing[next]!.p, botRing[next]!.p, botRing[i]!.p],
      avgZ: (midRing[i]!.w.z + botRing[i]!.w.z) * 0.5,
    });
  }
  bands.sort((a, b) => a.avgZ - b.avgZ);

  for (const b of bands) {
    ctx.beginPath();
    ctx.moveTo(b.pts[0].x, b.pts[0].y);
    ctx.lineTo(b.pts[1].x, b.pts[1].y);
    ctx.lineTo(b.pts[2].x, b.pts[2].y);
    ctx.lineTo(b.pts[3].x, b.pts[3].y);
    ctx.closePath();
    const alpha = b.avgZ > 0 ? 0.14 : 0.05;
    ctx.fillStyle = `rgba(73, 118, 143, ${alpha})`;
    ctx.fill();
  }

  // Vẽ 2 họ đường sinh chéo của siêu mặt Hyperboloid (+twist và -twist)
  for (let i = 0; i < sectors; i += 1) {
    // Họ 1
    const a1 = topRing[i]!.p;
    const b1 = botRing[i]!.p;
    const avgZ1 = (a1.z + b1.z) * 0.5;
    ctx.beginPath();
    ctx.moveTo(a1.x, a1.y);
    ctx.lineTo(b1.x, b1.y);
    ctx.strokeStyle = avgZ1 > 0 ? '#2D5266' : '#49768F';
    ctx.globalAlpha = avgZ1 > 0 ? 0.78 : 0.3;
    ctx.lineWidth = avgZ1 > 0 ? 1.3 : 0.8;
    ctx.stroke();

    // Họ 2 (lệch pha đảo xoắn)
    const mirrorIdx = (i + 5) % sectors;
    const a2 = projectPoint3D(
      rotatePoint3D(
        {
          x: 0.94 * Math.cos((mirrorIdx / sectors) * Math.PI * 2 - twist),
          y: -0.78,
          z: 0.94 * Math.sin((mirrorIdx / sectors) * Math.PI * 2 - twist),
        },
        rotX,
        rotY,
        0.14,
      ),
      cx,
      cy,
      fov,
    );
    const b2 = projectPoint3D(
      rotatePoint3D(
        {
          x: 0.94 * Math.cos((mirrorIdx / sectors) * Math.PI * 2 + twist),
          y: 0.78,
          z: 0.94 * Math.sin((mirrorIdx / sectors) * Math.PI * 2 + twist),
        },
        rotX,
        rotY,
        0.14,
      ),
      cx,
      cy,
      fov,
    );
    ctx.beginPath();
    ctx.moveTo(a2.x, a2.y);
    ctx.lineTo(b2.x, b2.y);
    ctx.strokeStyle = '#6B5335';
    ctx.globalAlpha = 0.24;
    ctx.lineWidth = 0.9;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 3 mặt cắt elip Hyperboloid
  for (const [yLevel, radius] of [
    [-0.78, 0.94],
    [0, 0.54],
    [0.78, 0.94],
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
    ctx.strokeStyle = 'rgba(45, 82, 102, 0.68)';
    ctx.lineWidth = 1.15;
    ctx.stroke();
  }

  // Mặt phẳng mục tiêu tô mờ tại tâm + hệ 3 vector (e1, e2, e3)
  const origin = projectPoint3D(rotatePoint3D({ x: 0, y: 0, z: 0 }, rotX, rotY, 0.14), cx, cy, fov);
  const e1Vec = { x: 0.68, y: 0, z: 0 };
  const e2Vec = { x: 0, y: -0.68, z: 0 };
  const e3Vec = { x: 0, y: 0, z: 0.68 };
  const e1Tip = projectPoint3D(rotatePoint3D(e1Vec, rotX, rotY, 0.14), cx, cy, fov);
  const e3Tip = projectPoint3D(rotatePoint3D(e3Vec, rotX, rotY, 0.14), cx, cy, fov);
  const e13Tip = projectPoint3D(
    rotatePoint3D({ x: 0.68, y: 0, z: 0.68 }, rotX, rotY, 0.14),
    cx,
    cy,
    fov,
  );

  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(e1Tip.x, e1Tip.y);
  ctx.lineTo(e13Tip.x, e13Tip.y);
  ctx.lineTo(e3Tip.x, e3Tip.y);
  ctx.closePath();
  ctx.fillStyle = 'rgba(156, 122, 76, 0.16)';
  ctx.fill();

  const axes: readonly { vec: Vec3; color: string; label: string }[] = [
    { vec: e1Vec, color: '#2D5266', label: 'e₁' },
    { vec: e2Vec, color: '#49768F', label: 'e₂' },
    { vec: e3Vec, color: '#6B5335', label: 'e₃' },
  ];
  ctx.font = '600 11px "JetBrains Mono", monospace';
  for (const axis of axes) {
    const tip = projectPoint3D(rotatePoint3D(axis.vec, rotX, rotY, 0.14), cx, cy, fov);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.strokeStyle = axis.color;
    ctx.lineWidth = 1.95;
    ctx.stroke();

    drawGlowingNode(ctx, tip.x, tip.y, 3.1, axis.color, 'rgba(73, 118, 143, 0.35)');
    ctx.fillStyle = axis.color;
    ctx.fillText(axis.label, tip.x + 6, tip.y - 4);
  }
  drawGlowingNode(ctx, origin.x, origin.y, 3.5, '#2D5266', 'rgba(45, 82, 102, 0.42)');
}

// 3. Giải tích hàm một biến: Dải tích phân Riemann bán trong suốt & Sóng đa thức Taylor
function drawCalculusStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  interaction: StageInteraction,
): void {
  const midY = height * 0.56;
  const leftPad = width * 0.08;
  const spanX = width * 0.84;

  ctx.strokeStyle = 'rgba(36, 87, 70, 0.24)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftPad, midY);
  ctx.lineTo(leftPad + spanX, midY);
  ctx.moveTo(width * 0.5, height * 0.12);
  ctx.lineTo(width * 0.5, height * 0.9);
  ctx.stroke();

  const phaseShift = interaction.rotOffsetX * 0.85;
  const ampMod = 1 + Math.max(-0.28, Math.min(0.28, -interaction.rotOffsetY * 0.22));
  const fn = (u: number) =>
    (Math.sin(u * Math.PI * 2 + t * 0.85 + phaseShift) * 0.56 +
      Math.cos(u * Math.PI * 4 - t * 0.48 + phaseShift * 0.5) * 0.22) *
    ampMod;

  // Dải diện tích tích phân gradient mượt bên dưới đồ thị
  const areaGrad = ctx.createLinearGradient(0, height * 0.18, 0, height * 0.88);
  areaGrad.addColorStop(0, 'rgba(59, 122, 101, 0.22)');
  areaGrad.addColorStop(0.55, 'rgba(59, 122, 101, 0.07)');
  areaGrad.addColorStop(1, 'rgba(156, 122, 76, 0.15)');

  ctx.beginPath();
  ctx.moveTo(leftPad, midY);
  for (let s = 0; s <= 100; s += 1) {
    const u = s / 100;
    const x = leftPad + u * spanX;
    const y = midY - fn(u) * (height * 0.34);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(leftPad + spanX, midY);
  ctx.closePath();
  ctx.fillStyle = areaGrad;
  ctx.fill();

  // Các phân hoạch tích phân Riemann bán trong suốt
  const bars = 18;
  const barW = spanX / bars;
  for (let i = 0; i < bars; i += 1) {
    const u = (i + 0.5) / bars;
    const val = fn(u) * (height * 0.34);
    const x = leftPad + i * barW;
    const y = val >= 0 ? midY - val : midY;
    const h = Math.abs(val);

    ctx.fillStyle = val >= 0 ? 'rgba(59, 122, 101, 0.17)' : 'rgba(156, 122, 76, 0.14)';
    ctx.strokeStyle = val >= 0 ? 'rgba(36, 87, 70, 0.38)' : 'rgba(156, 122, 76, 0.38)';
    ctx.lineWidth = 0.9;
    ctx.fillRect(x + 2, y, barW - 4, h);
    ctx.strokeRect(x + 2, y, barW - 4, h);
  }

  // Sóng xấp xỉ Taylor bậc cao
  ctx.beginPath();
  for (let s = 0; s <= 90; s += 1) {
    const u = s / 90;
    const x = leftPad + u * spanX;
    const y =
      midY -
      (Math.sin(u * Math.PI * 2 + t * 0.85 + phaseShift) * 0.42 +
        Math.sin(u * Math.PI * 6 - t * 0.3) * 0.08) *
        (height * 0.34);
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.72)';
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1.3;
  ctx.stroke();
  ctx.setLineDash([]);

  // Đường cong hàm chính
  ctx.beginPath();
  for (let s = 0; s <= 100; s += 1) {
    const u = s / 100;
    const x = leftPad + u * spanX;
    const y = midY - fn(u) * (height * 0.34);
    if (s === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = '#245746';
  ctx.lineWidth = 2.15;
  ctx.stroke();

  // Tiếp tuyến trượt cùng điểm tiếp xúc phát sáng
  const probeU = (Math.sin(t * 0.55) + 1) * 0.5;
  const px = leftPad + probeU * spanX;
  const py = midY - fn(probeU) * (height * 0.34);
  const eps = 0.005;
  const dy = (fn(probeU + eps) - fn(probeU - eps)) / (2 * eps);
  const slopePx = (-dy * (height * 0.34)) / spanX;

  ctx.beginPath();
  ctx.moveTo(px - 42, py - 42 * slopePx);
  ctx.lineTo(px + 42, py + 42 * slopePx);
  ctx.strokeStyle = '#6B5335';
  ctx.lineWidth = 1.65;
  ctx.stroke();

  drawGlowingNode(ctx, px, py, 4.4, '#245746', 'rgba(59, 122, 101, 0.48)');
}

// 4. Giáo dục học: 3 Mặt phẳng giao thoa sư phạm 3D nghiêng + Quỹ đạo nhân cách thăng tiến
function drawPedagogyStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  interaction: StageInteraction,
): void {
  const cx = width * 0.5;
  const cy = height * 0.54;
  const fov = Math.min(width, height) * 1.15;
  const tiltX = 0.72 + interaction.rotOffsetY * 0.35;
  const tiltY = t * 0.24 + interaction.rotOffsetX * 0.45;

  const planes = [
    { ox: -0.36, oy: 0.08, oz: -0.22, r: 0.52, fill: 'rgba(122, 70, 59, 0.16)', stroke: '#7A463B' },
    { ox: 0.36, oy: 0.06, oz: -0.18, r: 0.5, fill: 'rgba(140, 109, 63, 0.15)', stroke: '#8C6D3F' },
    { ox: 0, oy: -0.14, oz: 0.32, r: 0.54, fill: 'rgba(158, 99, 86, 0.18)', stroke: '#9E6356' },
  ] as const;

  const projectedPlanes = planes
    .map((plane, idx) => {
      const centerW = rotatePoint3D({ x: plane.ox, y: plane.oy, z: plane.oz }, tiltX, tiltY, 0);
      const pts = Array.from({ length: 40 }, (_, s) => {
        const a = (s / 40) * Math.PI * 2;
        const v: Vec3 = {
          x: plane.ox + Math.cos(a) * plane.r,
          y: plane.oy + Math.sin(a) * 0.08 * (idx === 2 ? -1 : 1),
          z: plane.oz + Math.sin(a) * plane.r,
        };
        return projectPoint3D(rotatePoint3D(v, tiltX, tiltY, 0), cx, cy, fov);
      });
      return { centerW, pts, fill: plane.fill, stroke: plane.stroke };
    })
    .sort((a, b) => a.centerW.z - b.centerW.z);

  for (const plane of projectedPlanes) {
    ctx.beginPath();
    plane.pts.forEach((pt, idx) => {
      if (idx === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.closePath();
    ctx.fillStyle = plane.fill;
    ctx.fill();
    ctx.strokeStyle = plane.stroke;
    ctx.globalAlpha = 0.72;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Quỹ đạo phát triển nhân cách đi lên xuyên qua giao điểm 3 mặt phẳng sư phạm
  const curveTilt = Math.max(-24, Math.min(24, interaction.rotOffsetY * 18));
  const p0 = { x: width * 0.17, y: height * 0.8 };
  const p1 = { x: width * 0.42, y: height * 0.62 + curveTilt };
  const p2 = { x: width * 0.62, y: height * 0.4 - curveTilt };
  const p3 = { x: width * 0.84, y: height * 0.2 };

  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  ctx.strokeStyle = 'rgba(122, 70, 59, 0.22)';
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  ctx.strokeStyle = '#7A463B';
  ctx.lineWidth = 2;
  ctx.stroke();

  const u = (t * 0.36) % 1;
  const inv = 1 - u;
  const bx =
    inv * inv * inv * p0.x + 3 * inv * inv * u * p1.x + 3 * inv * u * u * p2.x + u * u * u * p3.x;
  const by =
    inv * inv * inv * p0.y + 3 * inv * inv * u * p1.y + 3 * inv * u * u * p2.y + u * u * u * p3.y;

  drawGlowingNode(ctx, p0.x, p0.y, 3.4, '#7A463B', 'rgba(122, 70, 59, 0.28)');
  drawGlowingNode(ctx, p3.x, p3.y, 3.8, '#8C6D3F', 'rgba(140, 109, 63, 0.38)');
  drawGlowingNode(ctx, bx, by, 4.6, '#9E6356', 'rgba(158, 99, 86, 0.48)');
}

export interface SubjectStageCanvasProps {
  readonly slug: string;
  readonly isCardHovered?: boolean;
}

/**
 * Sân khấu Canvas 2D 120fps tinh khiết cho 4 môn học:
 * - Không chèn bất kỳ nhãn chữ hoặc pill góc nào trên hình minh họa
 * - Nội suy tỷ lệ mô hình bên trong Canvas (`1.0 -> 1.12`) khi hover thẻ để giữ 100% độ sắc nét văn bản
 * - Hỗ trợ kéo chuột xoay mô hình trực tiếp trong Canvas
 */
export function SubjectStageCanvas({ slug, isCardHovered = false }: SubjectStageCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isCardHoveredRef = useRef(isCardHovered);
  const [isDragging, setIsDragging] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const theme = STAGE_THEMES[slug] ?? DEFAULT_STAGE_THEME;

  useEffect(() => {
    isCardHoveredRef.current = isCardHovered;
  }, [isCardHovered]);

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

    let dragging = false;
    let lastClientX = 0;
    let lastClientY = 0;
    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let currentOffsetX = 0;
    let currentOffsetY = 0;
    let currentModelScale = 1.0;

    const render = (time: number) => {
      const interaction: StageInteraction = {
        rotOffsetX: currentOffsetX,
        rotOffsetY: currentOffsetY,
      };
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      if (Math.abs(currentModelScale - 1) > 0.001) {
        ctx.translate(cx, cy);
        ctx.scale(currentModelScale, currentModelScale);
        ctx.translate(-cx, -cy);
      }

      if (slug === 'hinh-hoc-affine') {
        drawAffineStage(ctx, width, height, time, interaction);
      } else if (slug === 'giai-tich-ham-mot-bien') {
        drawCalculusStage(ctx, width, height, time, interaction);
      } else if (slug === 'giao-duc-hoc') {
        drawPedagogyStage(ctx, width, height, time, interaction);
      } else {
        drawAlgebraStage(ctx, width, height, time, interaction);
      }

      ctx.restore();
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastClientX = event.clientX;
      lastClientY = event.clientY;
      setIsDragging(true);
      if (typeof container.setPointerCapture === 'function') {
        try {
          container.setPointerCapture(event.pointerId);
        } catch {
          // Bỏ qua nếu môi trường không hỗ trợ pointer capture
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (dragging) {
        const dx = event.clientX - lastClientX;
        const dy = event.clientY - lastClientY;
        lastClientX = event.clientX;
        lastClientY = event.clientY;
        targetOffsetX += dx * 0.012;
        targetOffsetY = Math.max(-1.2, Math.min(1.2, targetOffsetY + dy * 0.01));
        if (prefersReducedMotion) {
          currentOffsetX = targetOffsetX;
          currentOffsetY = targetOffsetY;
          render(0.8);
        }
        return;
      }

      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const localX = event.clientX - rect.left;
        const localY = event.clientY - rect.top;
        container.style.setProperty('--stage-mx', `${localX.toFixed(1)}px`);
        container.style.setProperty('--stage-my', `${localY.toFixed(1)}px`);
        const nx = localX / rect.width - 0.5;
        const ny = localY / rect.height - 0.5;
        targetOffsetX += (nx * 0.35 - (targetOffsetX % 6.283)) * 0.015;
        targetOffsetY = Math.max(-0.45, Math.min(0.45, ny * 0.4));
      }
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      setIsDragging(false);
      if (typeof container.releasePointerCapture === 'function') {
        try {
          container.releasePointerCapture(event.pointerId);
        } catch {
          // Bỏ qua
        }
      }
    };

    const onPointerLeave = () => {
      dragging = false;
      setIsDragging(false);
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);
    container.addEventListener('pointerleave', onPointerLeave);

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

    render(0.8);
    if (prefersReducedMotion) {
      return () => {
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('pointercancel', onPointerUp);
        container.removeEventListener('pointerleave', onPointerLeave);
        resizeObserver?.disconnect();
        intersectionObserver?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        const hovered = isCardHoveredRef.current;
        const speedMultiplier = dragging ? 0.55 : hovered ? 1.65 : 1;
        elapsed += dtSeconds * speedMultiplier;
        const smoothRate = Math.min(1, dtSeconds * 9);
        currentOffsetX += (targetOffsetX - currentOffsetX) * smoothRate;
        currentOffsetY += (targetOffsetY - currentOffsetY) * smoothRate;
        const targetScale = hovered ? 1.12 : 1.0;
        currentModelScale += (targetScale - currentModelScale) * Math.min(1, dtSeconds * 7.5);
        render(elapsed);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerUp);
      container.removeEventListener('pointercancel', onPointerUp);
      container.removeEventListener('pointerleave', onPointerLeave);
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
        'group/stage relative my-4 h-52 w-full overflow-hidden rounded-[2px] border border-[#CFD8D4] select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        theme.borderClass,
      )}
      aria-hidden="true"
    >
      {/* Lưới tọa độ Ruled-Ground & spotlight bám con trỏ chuột (taste-skill) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-24"
        style={{
          backgroundImage: `radial-gradient(${theme.dotColor} 0.75px, transparent 0.85px)`,
          backgroundSize: '16px 16px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover/stage:opacity-100"
        style={{
          background: `radial-gradient(220px circle at var(--stage-mx, 50%) var(--stage-my, 50%), ${theme.dotColor}28, transparent 70%)`,
        }}
      />

      {/* Thước chia độ dọc bên lề trái sân khấu 3D */}
      <div
        data-testid={`stage-vertical-ruler-${slug}`}
        className="lu-tabular-telemetry pointer-events-none absolute top-0 bottom-0 left-0 z-20 flex w-7 flex-col justify-between border-r border-[#CFD8D4]/85 bg-[#FAFBF9]/45 py-2.5 pr-1 font-mono text-[8px] font-semibold"
        style={{ color: theme.dotColor }}
      >
        {(['90°', '60°', '30°', '00°'] as const).map((deg, idx) => (
          <div key={deg} className="flex w-full items-center justify-end gap-1">
            <span className="opacity-70">{deg}</span>
            <span
              className="block h-px bg-current"
              style={{ width: idx === 0 || idx === 3 ? '7px' : '5px', opacity: 0.65 }}
            />
          </div>
        ))}
      </div>

      {/* 4 góc chữ L bản vẽ chuẩn trực trên khung viewport 3D */}
      <span
        className="pointer-events-none absolute top-2 left-8 z-20 h-3 w-3 border-t-[1.5px] border-l-[1.5px] opacity-75"
        style={{ borderColor: theme.dotColor }}
      />
      <span
        className="pointer-events-none absolute top-2 right-2 z-20 h-3 w-3 border-t-[1.5px] border-r-[1.5px] opacity-75"
        style={{ borderColor: theme.dotColor }}
      />
      <span
        className="pointer-events-none absolute bottom-2 left-8 z-20 h-3 w-3 border-b-[1.5px] border-l-[1.5px] opacity-75"
        style={{ borderColor: theme.dotColor }}
      />
      <span
        className="pointer-events-none absolute right-2 bottom-2 z-20 h-3 w-3 border-r-[1.5px] border-b-[1.5px] opacity-75"
        style={{ borderColor: theme.dotColor }}
      />
      <span
        className="lu-tabular-telemetry pointer-events-none absolute top-2 right-6 z-20 font-mono text-[9px] font-semibold tracking-[0.16em] uppercase opacity-55"
        style={{ color: theme.dotColor }}
      >
        3D.STAGE // 120FPS
      </span>

      <canvas ref={canvasRef} className="relative z-10 block h-full w-full touch-none" />
    </div>
  );
}
