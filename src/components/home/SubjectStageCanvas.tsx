import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';

interface StageInteraction {
  readonly rotOffsetX: number;
  readonly rotOffsetY: number;
  readonly hoverMix: number;
  readonly pulseTime: number;
  readonly resonanceWave: number;
}

interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

interface StageTheme {
  readonly background: string;
  readonly darkBackground: string;
  readonly borderClass: string;
  readonly darkBorderClass: string;
  readonly dotColor: string;
  readonly dotColorDark: string;
}

const DEFAULT_STAGE_THEME: StageTheme = {
  background: 'linear-gradient(135deg, #F3F0E8 0%, #E9E4D8 100%)',
  darkBackground: 'linear-gradient(135deg, #1D1813 0%, #14120F 100%)',
  borderClass: 'border-[#D8D0C0]',
  darkBorderClass: 'dark:border-[#3A2D20]',
  dotColor: '#6B5335',
  dotColorDark: '#D99B5E',
};

const STAGE_THEMES: Record<string, StageTheme> = {
  'cau-truc-dai-so': DEFAULT_STAGE_THEME,
  'hinh-hoc-affine': {
    background: 'linear-gradient(135deg, #ECF1F4 0%, #E0E9EE 100%)',
    darkBackground: 'linear-gradient(135deg, #121A21 0%, #0E141A 100%)',
    borderClass: 'border-[#C9D7DF]',
    darkBorderClass: 'dark:border-[#233845]',
    dotColor: '#2D5266',
    dotColorDark: '#64A8D1',
  },
  'giai-tich-ham-mot-bien': {
    background: 'linear-gradient(135deg, #EBF2EE 0%, #DFECE5 100%)',
    darkBackground: 'linear-gradient(135deg, #101C18 0%, #0D1512 100%)',
    borderClass: 'border-[#C6DBD0]',
    darkBorderClass: 'dark:border-[#1F3B31]',
    dotColor: '#245746',
    dotColorDark: '#52B394',
  },
  'giao-duc-hoc': {
    background: 'linear-gradient(135deg, #F3ECE9 0%, #E9DFDB 100%)',
    darkBackground: 'linear-gradient(135deg, #1D1413 0%, #141010 100%)',
    borderClass: 'border-[#D8C8C1]',
    darkBorderClass: 'dark:border-[#3F2624]',
    dotColor: '#7A463B',
    dotColorDark: '#DF7B70',
  },
};

function readDomDarkState(): boolean {
  if (typeof document === 'undefined') return false;
  const root = document.documentElement;
  return (
    root.classList.contains('dark') ||
    root.getAttribute('data-theme') === 'dark' ||
    (typeof document.body !== 'undefined' &&
      document.body !== null &&
      document.body.classList.contains('dark'))
  );
}

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
  isDark: boolean,
): void {
  const cx = width * 0.5;
  const cy = height * 0.5;
  const rMain = Math.min(width, height) * 0.35;

  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, rMain * 1.5);
  glow.addColorStop(0, isDark ? 'rgba(217, 155, 94, 0.24)' : 'rgba(156, 122, 76, 0.16)');
  glow.addColorStop(0.6, isDark ? 'rgba(212, 175, 106, 0.10)' : 'rgba(107, 83, 53, 0.06)');
  glow.addColorStop(1, isDark ? 'rgba(29, 24, 19, 0)' : 'rgba(243, 240, 232, 0)');
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
    ctx.strokeStyle = isDark ? 'rgba(217, 155, 94, 0.58)' : 'rgba(107, 83, 53, 0.46)';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    if (chord) {
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(chord.x, chord.y);
      ctx.strokeStyle = isDark ? 'rgba(229, 195, 120, 0.36)' : 'rgba(156, 122, 76, 0.30)';
      ctx.lineWidth = 0.95;
      ctx.stroke();
    }

    if (i < 4 && opposite) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(opposite.x, opposite.y);
      ctx.strokeStyle = isDark ? 'rgba(217, 155, 94, 0.34)' : 'rgba(107, 83, 53, 0.28)';
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
      isDark ? '#F0C782' : '#9C7A4C',
      isDark ? 'rgba(240, 199, 130, 0.62)' : 'rgba(156, 122, 76, 0.45)',
    );
  }

  for (const node of outerNodes) {
    drawGlowingNode(
      ctx,
      node.x,
      node.y,
      3.6,
      isDark ? '#D99B5E' : '#8B6D43',
      isDark ? 'rgba(217, 155, 94, 0.42)' : 'rgba(156, 122, 76, 0.24)',
    );
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

    const alpha = isDark
      ? face.front
        ? 0.22 + face.light * 0.28
        : 0.08
      : face.front
        ? 0.16 + face.light * 0.24
        : 0.06;
    const red = isDark ? Math.round(186 + face.light * 60) : Math.round(138 + face.light * 65);
    const green = isDark ? Math.round(134 + face.light * 58) : Math.round(104 + face.light * 56);
    const blue = isDark ? Math.round(72 + face.light * 44) : Math.round(58 + face.light * 38);
    ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha.toFixed(3)})`;
    ctx.fill();

    ctx.strokeStyle = isDark
      ? face.front
        ? 'rgba(240, 199, 130, 0.92)'
        : 'rgba(217, 155, 94, 0.45)'
      : face.front
        ? 'rgba(107, 83, 53, 0.88)'
        : 'rgba(156, 122, 76, 0.36)';
    ctx.lineWidth = face.front ? 1.45 : 0.9;
    ctx.stroke();
  }

  for (const pt of projected) {
    if (pt.z > 0) {
      drawGlowingNode(
        ctx,
        pt.x,
        pt.y,
        2.7,
        isDark ? '#F0C782' : '#6B5335',
        isDark ? 'rgba(240, 199, 130, 0.56)' : 'rgba(156, 122, 76, 0.38)',
      );
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
  isDark: boolean,
): void {
  const cx = width * 0.5;
  const cy = height * 0.52;
  const fov = Math.min(width, height) * 1.12;

  const bgGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, width * 0.45);
  bgGlow.addColorStop(0, isDark ? 'rgba(100, 168, 209, 0.22)' : 'rgba(73, 118, 143, 0.16)');
  bgGlow.addColorStop(1, isDark ? 'rgba(18, 26, 33, 0)' : 'rgba(236, 241, 244, 0)');
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
    const alpha = isDark ? (b.avgZ > 0 ? 0.18 : 0.07) : b.avgZ > 0 ? 0.14 : 0.05;
    ctx.fillStyle = isDark ? `rgba(100, 168, 209, ${alpha})` : `rgba(73, 118, 143, ${alpha})`;
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
    ctx.strokeStyle = isDark
      ? avgZ1 > 0
        ? '#7EC2EB'
        : '#4E8FB5'
      : avgZ1 > 0
        ? '#2D5266'
        : '#49768F';
    ctx.globalAlpha = avgZ1 > 0 ? (isDark ? 0.85 : 0.78) : isDark ? 0.42 : 0.3;
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
    ctx.strokeStyle = isDark ? '#D4AF6A' : '#6B5335';
    ctx.globalAlpha = isDark ? 0.36 : 0.24;
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
    ctx.strokeStyle = isDark ? 'rgba(126, 194, 235, 0.74)' : 'rgba(45, 82, 102, 0.68)';
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
  ctx.fillStyle = isDark ? 'rgba(212, 175, 106, 0.22)' : 'rgba(156, 122, 76, 0.16)';
  ctx.fill();

  const axes: readonly { vec: Vec3; color: string; label: string }[] = [
    { vec: e1Vec, color: isDark ? '#7EC2EB' : '#2D5266', label: 'e₁' },
    { vec: e2Vec, color: isDark ? '#A4D8F7' : '#49768F', label: 'e₂' },
    { vec: e3Vec, color: isDark ? '#E5C378' : '#6B5335', label: 'e₃' },
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

    drawGlowingNode(
      ctx,
      tip.x,
      tip.y,
      3.1,
      axis.color,
      isDark ? 'rgba(126, 194, 235, 0.48)' : 'rgba(73, 118, 143, 0.35)',
    );
    ctx.fillStyle = axis.color;
    ctx.fillText(axis.label, tip.x + 6, tip.y - 4);
  }
  drawGlowingNode(
    ctx,
    origin.x,
    origin.y,
    3.5,
    isDark ? '#7EC2EB' : '#2D5266',
    isDark ? 'rgba(126, 194, 235, 0.56)' : 'rgba(45, 82, 102, 0.42)',
  );
}

// 3. Giải tích hàm một biến: Dải tích phân Riemann bán trong suốt & Sóng đa thức Taylor
function drawCalculusStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  interaction: StageInteraction,
  isDark: boolean,
): void {
  const midY = height * 0.56;
  const leftPad = width * 0.08;
  const spanX = width * 0.84;

  ctx.strokeStyle = isDark ? 'rgba(127, 214, 184, 0.32)' : 'rgba(36, 87, 70, 0.24)';
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
  areaGrad.addColorStop(0, isDark ? 'rgba(82, 179, 148, 0.28)' : 'rgba(59, 122, 101, 0.22)');
  areaGrad.addColorStop(0.55, isDark ? 'rgba(82, 179, 148, 0.10)' : 'rgba(59, 122, 101, 0.07)');
  areaGrad.addColorStop(1, isDark ? 'rgba(217, 155, 94, 0.18)' : 'rgba(156, 122, 76, 0.15)');

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

    ctx.fillStyle =
      val >= 0
        ? isDark
          ? 'rgba(82, 179, 148, 0.22)'
          : 'rgba(59, 122, 101, 0.17)'
        : isDark
          ? 'rgba(217, 155, 94, 0.18)'
          : 'rgba(156, 122, 76, 0.14)';
    ctx.strokeStyle =
      val >= 0
        ? isDark
          ? 'rgba(127, 214, 184, 0.52)'
          : 'rgba(36, 87, 70, 0.38)'
        : isDark
          ? 'rgba(229, 195, 120, 0.48)'
          : 'rgba(156, 122, 76, 0.38)';
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
  ctx.strokeStyle = isDark ? 'rgba(229, 195, 120, 0.85)' : 'rgba(156, 122, 76, 0.72)';
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
  ctx.strokeStyle = isDark ? '#6AD8B3' : '#245746';
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
  ctx.strokeStyle = isDark ? '#E5C378' : '#6B5335';
  ctx.lineWidth = 1.65;
  ctx.stroke();

  drawGlowingNode(
    ctx,
    px,
    py,
    4.4,
    isDark ? '#7FD6B8' : '#245746',
    isDark ? 'rgba(127, 214, 184, 0.62)' : 'rgba(59, 122, 101, 0.48)',
  );
}

// 4. Giáo dục học: Hệ Sinh Thái Sư Phạm & Đường Xoắn Ốc Trưởng Thành (120fps)
function drawPedagogyStage(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  t: number,
  interaction: StageInteraction,
  isDark: boolean,
): void {
  const fit = Math.min(1, height / 210);
  const cx = Math.max(120 * fit, width * 0.34);
  const cy = height * 0.5;
  const hover = interaction.hoverMix;

  // Hào quang đất nung dịu phía sau lõi Tam giác Sư phạm
  const warmAura = ctx.createRadialGradient(cx, cy, 4, cx, cy, 128 * fit);
  warmAura.addColorStop(
    0,
    isDark
      ? `rgba(223, 123, 112, ${(0.18 + hover * 0.08).toFixed(3)})`
      : `rgba(122, 70, 59, ${(0.12 + hover * 0.06).toFixed(3)})`,
  );
  warmAura.addColorStop(0.55, isDark ? 'rgba(235, 155, 142, 0.07)' : 'rgba(158, 99, 86, 0.05)');
  warmAura.addColorStop(1, isDark ? 'rgba(29, 20, 19, 0)' : 'rgba(243, 236, 233, 0)');
  ctx.fillStyle = warmAura;
  ctx.fillRect(0, 0, width, height);

  // =========================================================================
  // LỚP 1 — 3 VÀNH SINH THÁI GIÁO DỤC ĐỒNG TÂM (Ecological Rings: r = 34, 60, 86px)
  // =========================================================================
  const ecoRings = [
    {
      ox: cx,
      oy: cy,
      r: 34 * fit,
      dashed: false,
      ticks: false,
      stroke: isDark
        ? `rgba(223, 123, 112, ${(0.42 + hover * 0.1).toFixed(3)})`
        : `rgba(122, 70, 59, ${(0.28 + hover * 0.08).toFixed(3)})`,
      lineWidth: 1.0,
      label: 'SƯ PHẠM',
      labelAngle: (-142 * Math.PI) / 180,
      labelAlign: 'right' as CanvasTextAlign,
    },
    {
      ox: cx + 6 * fit,
      oy: cy - 1 * fit,
      r: 60 * fit,
      dashed: true,
      ticks: false,
      stroke: isDark
        ? `rgba(235, 155, 142, ${(0.38 + hover * 0.1).toFixed(3)})`
        : `rgba(158, 99, 86, ${(0.25 + hover * 0.08).toFixed(3)})`,
      lineWidth: 1.0,
      label: 'NHÀ TRƯỜNG',
      labelAngle: (94 * Math.PI) / 180,
      labelAlign: 'center' as CanvasTextAlign,
    },
    {
      ox: cx + 12 * fit,
      oy: cy - 2 * fit,
      r: 86 * fit,
      dashed: false,
      ticks: true,
      stroke: isDark
        ? `rgba(223, 123, 112, ${(0.28 + hover * 0.1).toFixed(3)})`
        : `rgba(122, 70, 59, ${(0.16 + hover * 0.08).toFixed(3)})`,
      lineWidth: 0.9,
      label: 'HƯỚNG NGHIỆP',
      labelAngle: (-42 * Math.PI) / 180,
      labelAlign: 'left' as CanvasTextAlign,
    },
  ] as const;

  ctx.save();
  ctx.font = '500 8.5px "JetBrains Mono Variable", ui-monospace, monospace';
  ctx.textBaseline = 'middle';

  for (const ring of ecoRings) {
    ctx.beginPath();
    if (ring.dashed) ctx.setLineDash([4, 4]);
    else ctx.setLineDash([]);
    ctx.arc(ring.ox, ring.oy, ring.r, 0, Math.PI * 2);
    ctx.strokeStyle = ring.stroke;
    ctx.lineWidth = ring.lineWidth;
    ctx.stroke();
    ctx.setLineDash([]);

    if (ring.ticks) {
      const tickCount = 36;
      const tickSpin = t * 0.035;
      ctx.beginPath();
      for (let k = 0; k < tickCount; k += 1) {
        const a = (k / tickCount) * Math.PI * 2 + tickSpin;
        const innerTick = k % 3 === 0 ? ring.r - 4.2 * fit : ring.r - 2.2 * fit;
        ctx.moveTo(ring.ox + Math.cos(a) * innerTick, ring.oy + Math.sin(a) * innerTick);
        ctx.lineTo(ring.ox + Math.cos(a) * ring.r, ring.oy + Math.sin(a) * ring.r);
      }
      ctx.strokeStyle = isDark
        ? `rgba(235, 155, 142, ${(0.34 + hover * 0.1).toFixed(3)})`
        : `rgba(122, 70, 59, ${(0.2 + hover * 0.08).toFixed(3)})`;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    const lx = ring.ox + Math.cos(ring.labelAngle) * (ring.r + 5.5 * fit);
    const ly = ring.oy + Math.sin(ring.labelAngle) * (ring.r + 5.5 * fit);
    ctx.globalAlpha = isDark ? 0.86 + hover * 0.14 : 0.65 + hover * 0.16;
    ctx.fillStyle = isDark ? '#F0A49B' : '#7A463B';
    ctx.textAlign = ring.labelAlign;
    ctx.fillText(ring.label, lx, ly);
    ctx.globalAlpha = 1;
  }

  // Sóng cộng hưởng dịu lan tỏa từ tâm ra ngoài vòng sinh thái ngoài khi rê chuột vào thẻ GDH
  if (interaction.resonanceWave > 0.001 || hover > 0.04) {
    const waveProg = interaction.resonanceWave > 0.001 ? interaction.resonanceWave : (t * 0.45) % 1;
    const waveRadius = (26 + waveProg * 70) * fit;
    const waveFade = Math.sin(waveProg * Math.PI) * Math.max(hover * 0.85, 0.75);
    if (waveFade > 0.01) {
      ctx.beginPath();
      ctx.arc(cx + 8 * fit * waveProg, cy - 1.5 * fit * waveProg, waveRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isDark
        ? `rgba(223, 123, 112, ${(0.48 * waveFade).toFixed(3)})`
        : `rgba(122, 70, 59, ${(0.34 * waveFade).toFixed(3)})`;
      ctx.lineWidth = 1.4 - waveProg * 0.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(
        cx + 8 * fit * waveProg,
        cy - 1.5 * fit * waveProg,
        Math.max(12, waveRadius * 0.84),
        0,
        Math.PI * 2,
      );
      ctx.strokeStyle = isDark
        ? `rgba(229, 195, 120, ${(0.36 * waveFade).toFixed(3)})`
        : `rgba(212, 163, 89, ${(0.24 * waveFade).toFixed(3)})`;
      ctx.lineWidth = 0.9;
      ctx.stroke();
    }
  }
  ctx.restore();

  // =========================================================================
  // LỚP 2 — TAM GIÁC SƯ PHẠM TƯƠNG TÁC HAI CHIỀU (Didactic Triangle Core)
  // =========================================================================
  const triR = 54 * fit;
  const oscRad =
    Math.sin(t * 0.72) * ((2.6 * Math.PI) / 180) +
    Math.max(-0.06, Math.min(0.06, interaction.rotOffsetX * 0.03)) +
    Math.max(-0.04, Math.min(0.04, interaction.rotOffsetY * 0.04));

  const triVertices = [
    {
      label: 'GIÁO VIÊN',
      angle: -Math.PI / 2 + oscRad,
      color: isDark ? '#DF7B70' : '#7A463B',
      glow: isDark ? 'rgba(223, 123, 112, 0.5)' : 'rgba(122, 70, 59, 0.34)',
      radius: 4.3,
      labelDx: 0,
      labelDy: -10.5 * fit,
      align: 'center' as CanvasTextAlign,
      ripple: false,
    },
    {
      label: 'NGƯỜI HỌC',
      angle: (5 * Math.PI) / 6 + oscRad,
      color: isDark ? '#EB9B8E' : '#9E6356',
      glow: isDark ? 'rgba(235, 155, 142, 0.48)' : 'rgba(158, 99, 86, 0.32)',
      radius: 4.0,
      labelDx: -3 * fit,
      labelDy: 12.5 * fit,
      align: 'center' as CanvasTextAlign,
      ripple: true,
    },
    {
      label: 'TRI THỨC',
      angle: Math.PI / 6 + oscRad,
      color: isDark ? '#F2B89F' : '#B67B65',
      glow: isDark ? 'rgba(242, 184, 159, 0.48)' : 'rgba(182, 123, 101, 0.32)',
      radius: 4.0,
      labelDx: 4 * fit,
      labelDy: 12.5 * fit,
      align: 'center' as CanvasTextAlign,
      ripple: false,
    },
  ].map((v) => ({
    ...v,
    x: cx + Math.cos(v.angle) * triR,
    y: cy + Math.sin(v.angle) * triR,
  }));

  // Vùng nền mờ trong Tam giác Sư phạm
  ctx.beginPath();
  ctx.moveTo(triVertices[0]!.x, triVertices[0]!.y);
  ctx.lineTo(triVertices[1]!.x, triVertices[1]!.y);
  ctx.lineTo(triVertices[2]!.x, triVertices[2]!.y);
  ctx.closePath();
  ctx.fillStyle = isDark
    ? `rgba(223, 123, 112, ${(0.08 + hover * 0.04).toFixed(3)})`
    : `rgba(122, 70, 59, ${(0.042 + hover * 0.025).toFixed(3)})`;
  ctx.fill();

  // Các cung cong đôi (bidirectional curved arcs) + 2 hạt xung chạy ngược chiều
  const edges: readonly (readonly [number, number])[] = [
    [0, 1],
    [1, 2],
    [2, 0],
  ];

  for (let eIdx = 0; eIdx < edges.length; eIdx += 1) {
    const [ia, ib] = edges[eIdx]!;
    const a = triVertices[ia]!;
    const b = triVertices[ib]!;
    const mx = (a.x + b.x) * 0.5;
    const my = (a.y + b.y) * 0.5;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    if ((mx - cx) * nx + (my - cy) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }

    const ctrlOutX = mx + nx * 11 * fit;
    const ctrlOutY = my + ny * 11 * fit;
    const ctrlInX = mx - nx * 7 * fit;
    const ctrlInY = my - ny * 7 * fit;

    // Cung thuận (Tác động sư phạm)
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(ctrlOutX, ctrlOutY, b.x, b.y);
    ctx.strokeStyle = isDark
      ? `rgba(223, 123, 112, ${(0.5 + hover * 0.16).toFixed(3)})`
      : `rgba(122, 70, 59, ${(0.34 + hover * 0.14).toFixed(3)})`;
    ctx.lineWidth = 1.15;
    ctx.stroke();

    // Cung nghịch (Phản hồi & Tự lĩnh hội)
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.quadraticCurveTo(ctrlInX, ctrlInY, b.x, b.y);
    ctx.strokeStyle = isDark
      ? `rgba(229, 195, 120, ${(0.52 + hover * 0.18).toFixed(3)})`
      : `rgba(212, 163, 89, ${(0.36 + hover * 0.16).toFixed(3)})`;
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Hạt xung 1: chạy chiều A -> B
    const uFwd = (interaction.pulseTime * 0.42 + eIdx * 0.31) % 1;
    const invFwd = 1 - uFwd;
    const pxFwd = invFwd * invFwd * a.x + 2 * invFwd * uFwd * ctrlOutX + uFwd * uFwd * b.x;
    const pyFwd = invFwd * invFwd * a.y + 2 * invFwd * uFwd * ctrlOutY + uFwd * uFwd * b.y;
    drawGlowingNode(
      ctx,
      pxFwd,
      pyFwd,
      2,
      isDark ? '#DF7B70' : '#7A463B',
      isDark
        ? `rgba(223, 123, 112, ${(0.45 + hover * 0.25).toFixed(3)})`
        : `rgba(122, 70, 59, ${(0.3 + hover * 0.2).toFixed(3)})`,
    );

    // Hạt xung 2: chạy ngược chiều B -> A
    const uRev = 1 - ((interaction.pulseTime * 0.42 + eIdx * 0.31 + 0.5) % 1);
    const invRev = 1 - uRev;
    const pxRev = invRev * invRev * a.x + 2 * invRev * uRev * ctrlInX + uRev * uRev * b.x;
    const pyRev = invRev * invRev * a.y + 2 * invRev * uRev * ctrlInY + uRev * uRev * b.y;
    drawGlowingNode(
      ctx,
      pxRev,
      pyRev,
      2,
      isDark ? '#E5C378' : '#D4A359',
      isDark
        ? `rgba(229, 195, 120, ${(0.5 + hover * 0.25).toFixed(3)})`
        : `rgba(212, 163, 89, ${(0.36 + hover * 0.24).toFixed(3)})`,
    );
  }

  // =========================================================================
  // LỚP 3 — ĐƯỜNG XOẮN ỐC PHÁT TRIỂN & 5 NÚT MẦM NĂNG LỰC (Growth Spiral)
  // =========================================================================
  const maxRightReach = Math.max(135, width - cx - 32);
  const maxSpiralR = Math.min(maxRightReach * 0.78, 220);
  const spiralDrift = Math.max(26, maxRightReach - maxSpiralR * 0.92);
  const spiralYScale = Math.min(0.45, (height * 0.29) / Math.max(80, maxSpiralR));
  const spiralExp = 2.35;
  const spiralExpDenom = Math.exp(spiralExp) - 1;

  const sampleGrowthSpiral = (u: number): { x: number; y: number } => {
    const expNorm = (Math.exp(spiralExp * u) - 1) / spiralExpDenom;
    const r = maxSpiralR * expNorm;
    const theta = 1.05 * Math.PI - u * 1.18 * Math.PI;
    const driftX = spiralDrift * Math.pow(u, 1.35);
    return {
      x: cx + r * Math.cos(theta) + driftX,
      y: cy + r * spiralYScale * Math.sin(theta),
    };
  };

  const spiralEnd = sampleGrowthSpiral(0.98);
  const spiralGrad = ctx.createLinearGradient(cx, cy, spiralEnd.x, spiralEnd.y);
  spiralGrad.addColorStop(0, isDark ? '#DF7B70' : '#7A463B');
  spiralGrad.addColorStop(1, isDark ? '#F2B89F' : '#C48B76');

  ctx.beginPath();
  const spiralSteps = 72;
  for (let s = 0; s <= spiralSteps; s += 1) {
    const pt = sampleGrowthSpiral((s / spiralSteps) * 0.98);
    if (s === 0) ctx.moveTo(pt.x, pt.y);
    else ctx.lineTo(pt.x, pt.y);
  }
  ctx.strokeStyle = spiralGrad;
  ctx.lineWidth = 1.35;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 5 điểm nút phát triển (r = 2.2px -> 4.2px) & nét phân nhánh mầm cây đối xứng chuẩn hình học
  const sproutPositions = [0.22, 0.42, 0.62, 0.81, 0.97] as const;
  for (let i = 0; i < sproutPositions.length; i += 1) {
    const u = sproutPositions[i]!;
    const p = sampleGrowthSpiral(u);
    const pNext = sampleGrowthSpiral(Math.min(1, u + 0.015));
    const tx = pNext.x - p.x;
    const ty = pNext.y - p.y;
    const tLen = Math.hypot(tx, ty) || 1;
    const tangentAngle = Math.atan2(ty / tLen, tx / tLen);

    const branchLen = (6.5 + i * 2.1) * fit;
    const branchAlpha = 0.48 + hover * 0.36;
    for (const side of [-1, 1] as const) {
      const leafAngle = tangentAngle + side * ((38 * Math.PI) / 180);
      const midAngle = tangentAngle + side * ((20 * Math.PI) / 180);
      const lx = p.x + Math.cos(leafAngle) * branchLen;
      const ly = p.y + Math.sin(leafAngle) * branchLen;
      const ctrlX = p.x + Math.cos(midAngle) * (branchLen * 0.62);
      const ctrlY = p.y + Math.sin(midAngle) * (branchLen * 0.62);

      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, lx, ly);
      ctx.strokeStyle = isDark
        ? `rgba(235, 155, 142, ${Math.min(0.95, branchAlpha + 0.14).toFixed(3)})`
        : `rgba(122, 70, 59, ${branchAlpha.toFixed(3)})`;
      ctx.lineWidth = 0.85;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(lx, ly, 1.05 + hover * 0.35, 0, Math.PI * 2);
      ctx.fillStyle = isDark
        ? `rgba(242, 184, 159, ${Math.min(0.95, 0.74 + hover * 0.22).toFixed(3)})`
        : `rgba(196, 139, 118, ${Math.min(0.95, 0.62 + hover * 0.3).toFixed(3)})`;
      ctx.fill();
    }

    const nodeR = 2.2 + i * 0.5;
    const nodeColor = isDark
      ? i < 2
        ? '#DF7B70'
        : i < 4
          ? '#EB9B8E'
          : '#F2B89F'
      : i < 2
        ? '#7A463B'
        : i < 4
          ? '#9E6356'
          : '#C48B76';
    const nodeGlowAlpha = isDark ? 0.36 + hover * 0.36 : 0.24 + hover * 0.34;
    drawGlowingNode(
      ctx,
      p.x,
      p.y,
      nodeR,
      nodeColor,
      isDark
        ? `rgba(242, 184, 159, ${nodeGlowAlpha.toFixed(3)})`
        : `rgba(196, 139, 118, ${nodeGlowAlpha.toFixed(3)})`,
    );
  }

  // Tâm khởi nguồn Tam giác Sư phạm
  drawGlowingNode(
    ctx,
    cx,
    cy,
    2.5,
    isDark ? '#DF7B70' : '#7A463B',
    isDark ? 'rgba(223, 123, 112, 0.4)' : 'rgba(122, 70, 59, 0.26)',
  );

  // Vẽ 3 đỉnh Tam giác Sư phạm & nhãn ở trên cùng để sắc nét tuyệt đối
  ctx.save();
  ctx.font = '600 8.5px "JetBrains Mono Variable", ui-monospace, monospace';
  ctx.textBaseline = 'middle';
  for (const v of triVertices) {
    if (v.ripple) {
      const rippleP = (t * 0.55) % 1;
      const rippleR = (5.5 + rippleP * 11.5) * fit;
      const rippleAlpha = (1 - rippleP) * (0.4 + hover * 0.2);
      ctx.beginPath();
      ctx.arc(v.x, v.y, rippleR, 0, Math.PI * 2);
      ctx.strokeStyle = isDark
        ? `rgba(235, 155, 142, ${(rippleAlpha * 1.15).toFixed(3)})`
        : `rgba(158, 99, 86, ${rippleAlpha.toFixed(3)})`;
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    drawGlowingNode(ctx, v.x, v.y, v.radius, v.color, v.glow);
    ctx.fillStyle = v.color;
    ctx.textAlign = v.align;
    ctx.fillText(v.label, v.x + v.labelDx, v.y + v.labelDy);
  }
  ctx.restore();
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
  const [isDark, setIsDark] = useState<boolean>(readDomDarkState);
  const isDarkRef = useRef<boolean>(isDark);
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
    let pulseElapsed = 0.8;
    let hoverMix = 0;
    let wasHovered = false;
    let resonanceWave = 0;
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
      const darkActive = isDarkRef.current;
      const interaction: StageInteraction = {
        rotOffsetX: currentOffsetX,
        rotOffsetY: currentOffsetY,
        hoverMix,
        pulseTime: pulseElapsed,
        resonanceWave,
      };
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.rect(0, 0, width, height);
      ctx.clip();

      const cx = width * 0.5;
      const cy = height * 0.5;
      if (Math.abs(currentModelScale - 1) > 0.001) {
        ctx.translate(cx, cy);
        ctx.scale(currentModelScale, currentModelScale);
        ctx.translate(-cx, -cy);
      }

      if (slug === 'hinh-hoc-affine') {
        drawAffineStage(ctx, width, height, time, interaction, darkActive);
      } else if (slug === 'giai-tich-ham-mot-bien') {
        drawCalculusStage(ctx, width, height, time, interaction, darkActive);
      } else if (slug === 'giao-duc-hoc') {
        drawPedagogyStage(ctx, width, height, time, interaction, darkActive);
      } else {
        drawAlgebraStage(ctx, width, height, time, interaction, darkActive);
      }

      ctx.restore();
    };

    const syncThemeState = () => {
      const next = readDomDarkState();
      if (next !== isDarkRef.current) {
        isDarkRef.current = next;
        setIsDark(next);
        render(prefersReducedMotion ? 0.8 : elapsed);
      }
    };
    syncThemeState();

    let themeObserver: MutationObserver | undefined;
    if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
      themeObserver = new MutationObserver(syncThemeState);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme'],
      });
      if (document.body) {
        themeObserver.observe(document.body, {
          attributes: true,
          attributeFilter: ['class', 'data-theme'],
        });
      }
    }

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
        themeObserver?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        const hovered = isCardHoveredRef.current;
        if (hovered && !wasHovered && resonanceWave <= 0.01) {
          resonanceWave = 0.02;
        }
        wasHovered = hovered;

        const hoverDamp = Math.min(1, 0.14 * dtScale);
        hoverMix += ((hovered ? 1 : 0) - hoverMix) * hoverDamp;

        const pulseRate = 1 + 0.6 * hoverMix;
        pulseElapsed += (dtScale / 60) * pulseRate;

        if (resonanceWave > 0) {
          resonanceWave += (dtScale / 60) * 0.92;
          if (resonanceWave >= 1) resonanceWave = 0;
        }

        const speedMultiplier = dragging ? 0.55 : hovered ? 1.6 : 1;
        elapsed += (dtScale / 60) * speedMultiplier;
        const smoothRate = Math.min(1, dtSeconds * 9);
        currentOffsetX += (targetOffsetX - currentOffsetX) * smoothRate;
        currentOffsetY += (targetOffsetY - currentOffsetY) * smoothRate;
        const targetScale = slug === 'giao-duc-hoc' ? 1.0 : hovered ? 1.12 : 1.0;
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
      themeObserver?.disconnect();
    };
  }, [prefersReducedMotion, slug]);

  const stageBg = isDark ? theme.darkBackground : theme.background;
  const stageDot = isDark ? theme.dotColorDark : theme.dotColor;

  return (
    <div
      ref={containerRef}
      data-testid={`subject-stage-${slug}`}
      style={{ background: stageBg }}
      className={cn(
        'group/stage relative my-4 h-52 w-full overflow-hidden rounded-[2px] border border-[#CFD8D4] select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        theme.borderClass,
        theme.darkBorderClass,
      )}
      aria-hidden="true"
    >
      {/* Lưới tọa độ Ruled-Ground & spotlight bám con trỏ chuột (taste-skill) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-24 dark:opacity-28"
        style={{
          backgroundImage: `radial-gradient(${stageDot} 0.75px, transparent 0.85px)`,
          backgroundSize: '16px 16px',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover/stage:opacity-100"
        style={{
          background: `radial-gradient(220px circle at var(--stage-mx, 50%) var(--stage-my, 50%), ${stageDot}28, transparent 70%)`,
        }}
      />

      {/* Thước chia độ dọc bên lề trái sân khấu 3D */}
      <div
        data-testid={`stage-vertical-ruler-${slug}`}
        className="lu-tabular-telemetry pointer-events-none absolute top-0 bottom-0 left-0 z-20 flex w-7 flex-col justify-between border-r border-[#CFD8D4]/85 bg-[#FAFBF9]/45 py-2.5 pr-1 font-mono text-[8px] font-semibold dark:border-[#242E2B]/90 dark:bg-[#0D1110]/72"
        style={{ color: stageDot }}
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
        style={{ borderColor: stageDot }}
      />
      <span
        className="pointer-events-none absolute top-2 right-2 z-20 h-3 w-3 border-t-[1.5px] border-r-[1.5px] opacity-75"
        style={{ borderColor: stageDot }}
      />
      <span
        className="pointer-events-none absolute bottom-2 left-8 z-20 h-3 w-3 border-b-[1.5px] border-l-[1.5px] opacity-75"
        style={{ borderColor: stageDot }}
      />
      <span
        className="pointer-events-none absolute right-2 bottom-2 z-20 h-3 w-3 border-r-[1.5px] border-b-[1.5px] opacity-75"
        style={{ borderColor: stageDot }}
      />

      <canvas ref={canvasRef} className="relative z-10 block h-full w-full touch-none" />
    </div>
  );
}
