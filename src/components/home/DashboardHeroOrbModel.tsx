import { useEffect, useRef, useState } from 'react';
import {
  addVec3,
  crossVec3,
  CRYSTAL_FACES,
  CRYSTAL_VERTICES,
  dotVec3,
  ICO_FACES,
  ICO_VERTICES,
  LIGHT_DIR,
  scaleVec3,
  subVec3,
  type Vec3,
} from '@/components/home/heroSculptureGeometry';
import type { DayPeriod } from '@/features/workspace';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import {
  computeFrameDelta,
  frameDampFactor,
  getLowLatency2DContext,
} from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

export interface DashboardHeroOrbModelProps {
  readonly dayPeriod: DayPeriod;
  readonly className?: string;
}

interface PeriodPalette {
  readonly wireStroke: string;
  readonly backWireStroke: string;
  readonly faceRgb: readonly [number, number, number];
  readonly coreRgb: readonly [number, number, number];
  readonly coreGlow: string;
  readonly dialStroke: string;
  readonly glyphFill: string;
  readonly auraInner: string;
  readonly auraMid: string;
}

const PERIOD_PALETTES: Readonly<Record<DayPeriod, PeriodPalette>> = {
  morning: {
    wireStroke: 'rgba(255, 244, 214, 0.88)',
    backWireStroke: 'rgba(140, 232, 201, 0.34)',
    faceRgb: [148, 226, 200],
    coreRgb: [248, 214, 134],
    coreGlow: 'rgba(248, 214, 134, 0.42)',
    dialStroke: 'rgba(255, 246, 224, 0.34)',
    glyphFill: 'rgba(255, 250, 236, 0.9)',
    auraInner: 'rgba(246, 208, 126, 0.24)',
    auraMid: 'rgba(110, 231, 183, 0.14)',
  },
  afternoon: {
    wireStroke: 'rgba(196, 249, 230, 0.9)',
    backWireStroke: 'rgba(126, 220, 190, 0.36)',
    faceRgb: [120, 222, 190],
    coreRgb: [245, 208, 120],
    coreGlow: 'rgba(245, 208, 120, 0.4)',
    dialStroke: 'rgba(218, 250, 238, 0.34)',
    glyphFill: 'rgba(244, 252, 249, 0.92)',
    auraInner: 'rgba(110, 231, 183, 0.22)',
    auraMid: 'rgba(245, 208, 120, 0.14)',
  },
  evening: {
    wireStroke: 'rgba(255, 226, 184, 0.88)',
    backWireStroke: 'rgba(134, 218, 190, 0.34)',
    faceRgb: [232, 178, 122],
    coreRgb: [247, 198, 118],
    coreGlow: 'rgba(242, 182, 121, 0.44)',
    dialStroke: 'rgba(255, 226, 184, 0.32)',
    glyphFill: 'rgba(255, 244, 230, 0.9)',
    auraInner: 'rgba(242, 182, 121, 0.24)',
    auraMid: 'rgba(82, 179, 148, 0.14)',
  },
  night: {
    wireStroke: 'rgba(176, 235, 248, 0.88)',
    backWireStroke: 'rgba(110, 212, 190, 0.36)',
    faceRgb: [124, 202, 224],
    coreRgb: [245, 214, 134],
    coreGlow: 'rgba(147, 213, 250, 0.42)',
    dialStroke: 'rgba(186, 232, 246, 0.32)',
    glyphFill: 'rgba(235, 248, 255, 0.92)',
    auraInner: 'rgba(147, 213, 250, 0.22)',
    auraMid: 'rgba(110, 231, 183, 0.14)',
  },
};

const ORB_RINGS = [
  {
    rx: 1.0,
    ry: 0.92,
    tiltX: 0.56,
    tiltZ: 0.28,
    speedY: 0.22,
    speedZ: 0.08,
    color: 'rgba(245, 208, 120, 0.55)',
    cometHex: '#F5D078',
    cometRgb: '245, 208, 120',
    offset: 0.4,
    dir: 1,
  },
  {
    rx: 0.86,
    ry: 0.8,
    tiltX: -0.52,
    tiltZ: 0.92,
    speedY: -0.26,
    speedZ: -0.1,
    color: 'rgba(147, 213, 250, 0.52)',
    cometHex: '#93D5FA',
    cometRgb: '147, 213, 250',
    offset: 2.2,
    dir: -1,
  },
  {
    rx: 0.74,
    ry: 0.68,
    tiltX: 0.4,
    tiltZ: -0.76,
    speedY: 0.31,
    speedZ: 0.12,
    color: 'rgba(134, 230, 198, 0.54)',
    cometHex: '#86E6C6',
    cometRgb: '134, 230, 198',
    offset: 4.1,
    dir: 1,
  },
] as const;

const FLOATING_GLYPHS = [
  { glyph: '∫', nx: 0.14, ny: 0.2, phase: 0.2 },
  { glyph: '∑', nx: 0.88, ny: 0.22, phase: 1.7 },
  { glyph: 'φ', nx: 0.16, ny: 0.82, phase: 3.1 },
  { glyph: '≃', nx: 0.86, ny: 0.8, phase: 4.6 },
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

function projectOrb(v: Vec3, cx: number, cy: number, scale: number) {
  const dist = 4.4;
  const k = scale / (dist - v.z);
  return { x: cx + v.x * k, y: cy + v.y * k, z: v.z };
}

/**
 * Mô hình Thiên Cầu & Đa Diện Pha Lê 3D Tương Tác (120fps Canvas)
 * đặt nổi trên góc phải ảnh Hero Trang Tổng quan:
 * - Tương thích sáng/tối & đổi sắc thái ánh sáng theo khung giờ (Sáng/Chiều/Tối/Đêm)
 * - Hỗ trợ rê chuột tạo hiệu ứng nghiêng parallax & kéo xoay đa diện mượt
 * - Tạm dừng hoàn toàn khi cuộn khuất màn hình hoặc khi prefers-reduced-motion được bật
 */
export function DashboardHeroOrbModel({ dayPeriod, className }: DashboardHeroOrbModelProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    const palette = PERIOD_PALETTES[dayPeriod];
    let width = Math.max(220, host.clientWidth || 280);
    let height = Math.max(200, host.clientHeight || 250);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(220, host.clientWidth || 280);
      height = Math.max(200, host.clientHeight || 250);
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
    let hovered = false;
    let lastX = 0;
    let lastY = 0;
    let targetRotX = 0.28;
    let targetRotY = -0.35;
    let curRotX = targetRotX;
    let curRotY = targetRotY;
    let hoverMix = 0;

    const drawRingHalf = (
      ring: (typeof ORB_RINGS)[number],
      cx: number,
      cy: number,
      ringBaseR: number,
      projScale: number,
      time: number,
      frontHalf: boolean,
    ) => {
      const steps = 64;
      const ax = ring.tiltX + curRotX * 0.42;
      const ay = time * ring.speedY + curRotY * 0.65;
      const az = ring.tiltZ + time * ring.speedZ;

      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= steps; i += 1) {
        const theta = (i / steps) * Math.PI * 2;
        const raw: Vec3 = {
          x: Math.cos(theta) * ring.rx * ringBaseR,
          y: Math.sin(theta) * ring.ry * ringBaseR,
          z: 0,
        };
        const r = rotateVec3(raw, ax, ay, az);
        const isFront = r.z >= 0;
        if (isFront !== frontHalf) {
          started = false;
          continue;
        }
        const p = projectOrb(r, cx, cy, projScale);
        if (!started) {
          ctx.moveTo(p.x, p.y);
          started = true;
        } else {
          ctx.lineTo(p.x, p.y);
        }
      }
      ctx.strokeStyle = ring.color;
      ctx.globalAlpha = frontHalf ? 0.78 + hoverMix * 0.18 : 0.28;
      ctx.lineWidth = frontHalf ? 1.25 : 0.85;
      ctx.stroke();

      // Vẽ hạt khoáng thạch & đuôi sao chổi trên quỹ đạo
      const cometAngle = time * (0.68 + hoverMix * 0.25) * ring.dir + ring.offset;
      const cometRaw: Vec3 = {
        x: Math.cos(cometAngle) * ring.rx * ringBaseR,
        y: Math.sin(cometAngle) * ring.ry * ringBaseR,
        z: 0,
      };
      const cometRot = rotateVec3(cometRaw, ax, ay, az);
      if (cometRot.z >= 0 === frontHalf) {
        const tailAngle = cometAngle - 0.36 * ring.dir;
        const tailRot = rotateVec3(
          {
            x: Math.cos(tailAngle) * ring.rx * ringBaseR,
            y: Math.sin(tailAngle) * ring.ry * ringBaseR,
            z: 0,
          },
          ax,
          ay,
          az,
        );
        const headP = projectOrb(cometRot, cx, cy, projScale);
        const tailP = projectOrb(tailRot, cx, cy, projScale);

        const trailGrad = ctx.createLinearGradient(tailP.x, tailP.y, headP.x, headP.y);
        trailGrad.addColorStop(0, `rgba(${ring.cometRgb}, 0)`);
        trailGrad.addColorStop(1, `rgba(${ring.cometRgb}, ${frontHalf ? '0.92' : '0.45'})`);
        ctx.beginPath();
        ctx.moveTo(tailP.x, tailP.y);
        ctx.lineTo(headP.x, headP.y);
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = frontHalf ? 2.4 : 1.4;
        ctx.lineCap = 'round';
        ctx.stroke();

        const halo = ctx.createRadialGradient(headP.x, headP.y, 0.5, headP.x, headP.y, 10);
        halo.addColorStop(0, `rgba(${ring.cometRgb}, ${frontHalf ? '0.68' : '0.28'})`);
        halo.addColorStop(1, `rgba(${ring.cometRgb}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(headP.x, headP.y, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = frontHalf ? 1 : 0.55;
        ctx.beginPath();
        ctx.arc(headP.x, headP.y, frontHalf ? 3.2 : 2.1, 0, Math.PI * 2);
        ctx.fillStyle = ring.cometHex;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headP.x, headP.y, frontHalf ? 1.3 : 0.9, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const renderFrame = (time: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const minDim = Math.min(width, height);
      const dialR = minDim * 0.44;
      const ringBaseR = 1.42;
      const projScale = minDim * 1.18;

      // 1. Quầng sáng khí quyển mềm phía sau khối cầu
      const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, dialR * 1.18);
      aura.addColorStop(0, palette.auraInner);
      aura.addColorStop(0.55, palette.auraMid);
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, dialR * 1.18, 0, Math.PI * 2);
      ctx.fill();

      // 2. Vành trắc địa thiên cầu chia độ 72 vạch mảnh xoay chậm
      const tickRot = time * 0.045;
      ctx.strokeStyle = palette.dialStroke;
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cy, dialR, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([2, 6]);
      ctx.arc(cx, cy, dialR * 0.87, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      for (let i = 0; i < 72; i += 1) {
        const a = (i / 72) * Math.PI * 2 + tickRot;
        const inner = i % 6 === 0 ? dialR - 7 : i % 3 === 0 ? dialR - 4.5 : dialR - 2.5;
        ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * dialR, cy + Math.sin(a) * dialR);
      }
      ctx.strokeStyle = palette.dialStroke;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 3. Nửa sau 3 vòng thiên cầu
      for (const ring of ORB_RINGS) {
        drawRingHalf(ring, cx, cy, ringBaseR, projScale, time, false);
      }

      // 4. Lõi tinh thể ánh kim xoay ngược bên trong khối nhị thập diện
      const coreScale = 0.34;
      const coreVerts = CRYSTAL_VERTICES.map((v) =>
        rotateVec3(
          scaleVec3(v, coreScale),
          -time * 0.42 + curRotX * 0.8,
          -time * 0.58 + curRotY * 0.8,
          time * 0.2,
        ),
      );
      const coreProj = coreVerts.map((v) => projectOrb(v, cx, cy, projScale));

      const coreGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, minDim * 0.2);
      coreGlow.addColorStop(0, palette.coreGlow);
      coreGlow.addColorStop(1, 'rgba(245, 208, 120, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, minDim * 0.2, 0, Math.PI * 2);
      ctx.fill();

      const sortedCore = CRYSTAL_FACES.map(([i, j, k]) => {
        const v0 = coreVerts[i]!;
        const v1 = coreVerts[j]!;
        const v2 = coreVerts[k]!;
        const centroid = scaleVec3(addVec3(addVec3(v0, v1), v2), 1 / 3);
        const normal = crossVec3(subVec3(v1, v0), subVec3(v2, v0));
        const nLen = Math.hypot(normal.x, normal.y, normal.z) || 1;
        const lambert = Math.max(0.18, dotVec3(scaleVec3(normal, 1 / nLen), LIGHT_DIR));
        return {
          p0: coreProj[i]!,
          p1: coreProj[j]!,
          p2: coreProj[k]!,
          z: centroid.z,
          lambert,
        };
      }).sort((a, b) => a.z - b.z);

      for (const f of sortedCore) {
        const [cr, cg, cb] = palette.coreRgb;
        ctx.beginPath();
        ctx.moveTo(f.p0.x, f.p0.y);
        ctx.lineTo(f.p1.x, f.p1.y);
        ctx.lineTo(f.p2.x, f.p2.y);
        ctx.closePath();
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${(0.28 + f.lambert * 0.42).toFixed(3)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 248, 224, ${(0.35 + f.lambert * 0.4).toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // 5. Khối Nhị Thập Diện Kính Mờ (Translucent Glass Icosahedron)
      const icoScale = 0.64 + hoverMix * 0.04;
      const icoVerts = ICO_VERTICES.map((v) =>
        rotateVec3(
          scaleVec3(v, icoScale),
          time * 0.24 + curRotX,
          time * 0.36 + curRotY,
          time * 0.1,
        ),
      );
      const icoProj = icoVerts.map((v) => projectOrb(v, cx, cy, projScale));

      const sortedIco = ICO_FACES.map(([i, j, k]) => {
        const v0 = icoVerts[i]!;
        const v1 = icoVerts[j]!;
        const v2 = icoVerts[k]!;
        const centroid = scaleVec3(addVec3(addVec3(v0, v1), v2), 1 / 3);
        const normal = crossVec3(subVec3(v1, v0), subVec3(v2, v0));
        const nLen = Math.hypot(normal.x, normal.y, normal.z) || 1;
        const unitN = scaleVec3(normal, 1 / nLen);
        const lambert = Math.max(0.16, dotVec3(unitN, LIGHT_DIR));
        return {
          p0: icoProj[i]!,
          p1: icoProj[j]!,
          p2: icoProj[k]!,
          z: centroid.z,
          front: normal.z >= 0,
          lambert,
        };
      }).sort((a, b) => a.z - b.z);

      const [fr, fg, fb] = palette.faceRgb;
      for (const face of sortedIco) {
        ctx.beginPath();
        ctx.moveTo(face.p0.x, face.p0.y);
        ctx.lineTo(face.p1.x, face.p1.y);
        ctx.lineTo(face.p2.x, face.p2.y);
        ctx.closePath();
        ctx.fillStyle = face.front
          ? `rgba(${fr}, ${fg}, ${fb}, ${(0.08 + face.lambert * 0.16).toFixed(3)})`
          : `rgba(${fr}, ${fg}, ${fb}, 0.03)`;
        ctx.fill();
        ctx.strokeStyle = face.front ? palette.wireStroke : palette.backWireStroke;
        ctx.lineWidth = face.front ? 1.15 : 0.7;
        ctx.stroke();
      }

      // Chấm sáng tại các đỉnh mặt trước của khối đa diện
      for (const p of icoProj) {
        if (p.z > 0.1) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.9, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();
        }
      }

      // 6. Nửa trước 3 vòng thiên cầu
      for (const ring of ORB_RINGS) {
        drawRingHalf(ring, cx, cy, ringBaseR, projScale, time, true);
      }

      // 7. 4 ký hiệu toán học lơ lửng theo quỹ đạo Lissajous vi mô
      ctx.font = '500 13px "KaTeX_Main", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const item of FLOATING_GLYPHS) {
        const gx = item.nx * width + Math.cos(time * 0.7 + item.phase) * 4;
        const gy = item.ny * height + Math.sin(time * 0.9 + item.phase) * 5;
        ctx.beginPath();
        ctx.arc(gx, gy, 13, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(12, 26, 22, 0.34)';
        ctx.fill();
        ctx.strokeStyle = palette.dialStroke;
        ctx.lineWidth = 0.85;
        ctx.stroke();

        ctx.fillStyle = palette.glyphFill;
        ctx.fillText(item.glyph, gx, gy + 0.5);
      }

      ctx.restore();
    };

    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      lastY = event.clientY;
      setIsDragging(true);
      if (typeof host.setPointerCapture === 'function') {
        try {
          host.setPointerCapture(event.pointerId);
        } catch {
          // Bỏ qua khi không hỗ trợ pointer capture
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (dragging) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        targetRotY += dx * 0.012;
        targetRotX = Math.max(-1.1, Math.min(1.1, targetRotX + dy * 0.01));
        if (prefersReducedMotion) {
          curRotX = targetRotX;
          curRotY = targetRotY;
          renderFrame(0.8);
        }
        return;
      }
      const rect = host.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        targetRotY = -0.35 + nx * 0.55;
        targetRotX = 0.28 + ny * 0.45;
      }
    };

    const onPointerEnter = () => {
      hovered = true;
    };

    const onPointerLeave = () => {
      hovered = false;
      dragging = false;
      setIsDragging(false);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      setIsDragging(false);
      if (typeof host.releasePointerCapture === 'function') {
        try {
          host.releasePointerCapture(event.pointerId);
        } catch {
          // Bỏ qua
        }
      }
    };

    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerenter', onPointerEnter);
    host.addEventListener('pointerleave', onPointerLeave);
    host.addEventListener('pointerup', onPointerUp);
    host.addEventListener('pointercancel', onPointerUp);

    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize);
      ro.observe(host);
    }

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          isVisible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      io.observe(host);
    }

    renderFrame(0.8);
    if (prefersReducedMotion) {
      return () => {
        host.removeEventListener('pointerdown', onPointerDown);
        host.removeEventListener('pointermove', onPointerMove);
        host.removeEventListener('pointerenter', onPointerEnter);
        host.removeEventListener('pointerleave', onPointerLeave);
        host.removeEventListener('pointerup', onPointerUp);
        host.removeEventListener('pointercancel', onPointerUp);
        ro?.disconnect();
        io?.disconnect();
      };
    }

    const tick = (now: number) => {
      const { dtSeconds } = computeFrameDelta(now, prevNow);
      prevNow = now;
      if (isVisible && !document.hidden) {
        elapsed += dtSeconds * (hovered ? 1.35 : 1);
        const damp = frameDampFactor(7.5, dtSeconds);
        curRotX += (targetRotX - curRotX) * damp;
        curRotY += (targetRotY - curRotY) * damp;
        hoverMix += ((hovered ? 1 : 0) - hoverMix) * damp;
        renderFrame(elapsed);
      }
      rafId = window.requestAnimationFrame(tick);
    };
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerenter', onPointerEnter);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerUp);
      ro?.disconnect();
      io?.disconnect();
    };
  }, [dayPeriod, prefersReducedMotion]);

  return (
    <div
      ref={hostRef}
      data-testid="dashboard-hero-orb-model"
      title="Kéo xoay mô hình Thiên cầu Đa diện 3D"
      className={cn(
        'relative select-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className,
      )}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="block h-full w-full touch-none" />
    </div>
  );
}

export default DashboardHeroOrbModel;
