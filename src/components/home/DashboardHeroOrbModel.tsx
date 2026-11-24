import { useEffect, useRef, useState } from 'react';
import type { Vec3 } from '@/components/home/heroSculptureGeometry';
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

interface RibbonSample {
  readonly center: Vec3;
  readonly normal: Vec3;
  readonly binormal: Vec3;
  readonly u: number;
}

interface PhyllotaxisPoint {
  readonly pos: Vec3;
  readonly phase: number;
  readonly index: number;
}

const RIBBON_SAMPLES = 160;
const PHYLLOTAXIS_COUNT = 64;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function normalize3(v: Vec3): Vec3 {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/**
 * Dải Lụa Möbius-Trefoil 3D thuần túy (1 mô hình điêu khắc độc bản):
 * - Đường tâm Trefoil xoắn tỷ lệ vàng (2, 3) với khung trực chuẩn Frenet-Bishop xoắn 540°
 *   tạo bề mặt lụa Möbius liền mạch, khác biệt hoàn toàn với đa diện ở /learning-space.
 */
const MOBIUS_RIBBON: readonly RibbonSample[] = (() => {
  const evalCurve = (t: number): Vec3 => {
    const r = 0.82 + 0.34 * Math.cos(3 * t);
    return {
      x: r * Math.cos(2 * t),
      y: r * Math.sin(2 * t),
      z: 0.44 * Math.sin(3 * t),
    };
  };

  return Array.from({ length: RIBBON_SAMPLES }, (_, idx) => {
    const u = idx / RIBBON_SAMPLES;
    const t = u * Math.PI * 2;
    const eps = 0.002;
    const c = evalCurve(t);
    const prev = evalCurve(t - eps);
    const next = evalCurve(t + eps);

    const tangent = normalize3({
      x: next.x - prev.x,
      y: next.y - prev.y,
      z: next.z - prev.z,
    });
    const refUp: Vec3 = Math.abs(tangent.z) > 0.92 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 0, z: 1 };
    const normal = normalize3(cross3(tangent, refUp));
    const binormal = normalize3(cross3(tangent, normal));

    return { center: c, normal, binormal, u };
  });
})();

/**
 * Quả cầu hạt Fibonacci Tỷ Lệ Vàng (Phyllotaxis Sphere) lơ lửng trong lòng dải Möbius:
 * 64 hạt phát sáng phân bố đều hoàn hảo theo góc vàng 137.508°.
 */
const PHYLLOTAXIS_CORE: readonly PhyllotaxisPoint[] = Array.from(
  { length: PHYLLOTAXIS_COUNT },
  (_, i) => {
    const y = 1 - (i / (PHYLLOTAXIS_COUNT - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;
    const radius = 0.43;
    return {
      pos: {
        x: Math.cos(theta) * r * radius,
        y: y * radius,
        z: Math.sin(theta) * r * radius,
      },
      phase: (i / PHYLLOTAXIS_COUNT) * Math.PI * 2,
      index: i,
    };
  },
);

/** Hai vòng thiên đạo nghiêng giao nhau (Dual Tilted Orbital Rings) */
const ORBIT_RING_SAMPLES = 72;
const ORBIT_RING_A: readonly Vec3[] = Array.from({ length: ORBIT_RING_SAMPLES }, (_, i) => {
  const a = (i / ORBIT_RING_SAMPLES) * Math.PI * 2;
  return { x: Math.cos(a) * 1.24, y: Math.sin(a) * 1.24 * 0.42, z: Math.sin(a) * 1.24 * 0.91 };
});
const ORBIT_RING_B: readonly Vec3[] = Array.from({ length: ORBIT_RING_SAMPLES }, (_, i) => {
  const a = (i / ORBIT_RING_SAMPLES) * Math.PI * 2;
  return { x: Math.cos(a) * 1.18 * 0.84, y: Math.sin(a) * 1.18, z: Math.cos(a) * 1.18 * 0.54 };
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

function project3D(v: Vec3, cx: number, cy: number, scale: number) {
  const dist = 3.95;
  const k = scale / Math.max(1.25, dist - v.z);
  return { x: cx + v.x * k, y: cy + v.y * k, z: v.z, k };
}

/**
 * Điêu khắc Toán học Độc bản 3D (Dải Möbius-Trefoil & Lõi Cầu Fibonacci Tỷ Lệ Vàng)
 * thuần mỹ thuật không chữ, kéo xoay 360° tự do ở 120fps.
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

    let width = Math.max(240, host.clientWidth || 292);
    let height = Math.max(240, host.clientHeight || 280);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(240, host.clientWidth || 292);
      height = Math.max(240, host.clientHeight || 280);
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
    let targetRotX = 0.36;
    let targetRotY = -0.28;
    let curRotX = targetRotX;
    let curRotY = targetRotY;

    const renderFrame = (time: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const minDim = Math.min(width, height);
      const projScale = minDim * 1.12;

      // 1. Vầng hào quang nền tinh khiết hòa quyện vào cảnh núi hồ
      const auraR = minDim * 0.48;
      const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, auraR);
      if (dayPeriod === 'morning' || dayPeriod === 'evening') {
        aura.addColorStop(0, 'rgba(248, 217, 146, 0.24)');
        aura.addColorStop(0.55, 'rgba(92, 214, 172, 0.12)');
      } else {
        aura.addColorStop(0, 'rgba(130, 232, 196, 0.22)');
        aura.addColorStop(0.55, 'rgba(245, 211, 142, 0.12)');
      }
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, auraR, 0, Math.PI * 2);
      ctx.fill();

      const ax = curRotX + Math.sin(time * 0.32) * 0.12;
      const ay = curRotY + time * 0.34;
      const az = Math.cos(time * 0.22) * 0.14;

      // 2. Hai vòng thiên đạo mảnh xoay đối nghịch nhẹ
      const drawOrbitRing = (
        ring: readonly Vec3[],
        rAx: number,
        rAy: number,
        rAz: number,
        colorRgb: string,
        dash: readonly number[],
      ) => {
        ctx.save();
        ctx.setLineDash([...dash]);
        ctx.lineWidth = 0.85;
        ctx.beginPath();
        for (let i = 0; i <= ring.length; i += 1) {
          const p3 = rotateVec3(ring[i % ring.length]!, rAx, rAy, rAz);
          const p2 = project3D(p3, cx, cy, projScale);
          if (i === 0) ctx.moveTo(p2.x, p2.y);
          else ctx.lineTo(p2.x, p2.y);
        }
        ctx.strokeStyle = `rgba(${colorRgb}, 0.24)`;
        ctx.stroke();
        ctx.restore();
      };

      drawOrbitRing(ORBIT_RING_A, ax * 0.65, ay * 0.55, az + 0.18, '248, 224, 168', [5, 6]);
      drawOrbitRing(ORBIT_RING_B, -ax * 0.5, -ay * 0.42, az - 0.24, '167, 243, 208', [2, 5]);

      // 3. Tiền chiếu dải lụa Möbius kép (edgeA & edgeB đối xứng qua tâm đường cong)
      const halfWidth = 0.155;
      const projectedCenters = new Array<{ x: number; y: number; z: number; u: number }>(
        RIBBON_SAMPLES,
      );
      const edgeA = new Array<{ x: number; y: number; z: number }>(RIBBON_SAMPLES);
      const edgeB = new Array<{ x: number; y: number; z: number }>(RIBBON_SAMPLES);

      for (let i = 0; i < RIBBON_SAMPLES; i += 1) {
        const s = MOBIUS_RIBBON[i]!;
        const breath = 1 + Math.sin(time * 1.25 + s.u * Math.PI * 6) * 0.038;
        const twist = s.u * Math.PI * 3 + time * 0.55; // 540° Möbius twist
        const cosT = Math.cos(twist);
        const sinT = Math.sin(twist);

        const ox = (s.normal.x * cosT + s.binormal.x * sinT) * halfWidth;
        const oy = (s.normal.y * cosT + s.binormal.y * sinT) * halfWidth;
        const oz = (s.normal.z * cosT + s.binormal.z * sinT) * halfWidth;

        const cPos: Vec3 = {
          x: s.center.x * breath,
          y: s.center.y * breath,
          z: s.center.z * breath,
        };
        const aPos: Vec3 = { x: cPos.x + ox, y: cPos.y + oy, z: cPos.z + oz };
        const bPos: Vec3 = { x: cPos.x - ox, y: cPos.y - oy, z: cPos.z - oz };

        const pc = project3D(rotateVec3(cPos, ax, ay, az), cx, cy, projScale);
        projectedCenters[i] = { x: pc.x, y: pc.y, z: pc.z, u: s.u };
        edgeA[i] = project3D(rotateVec3(aPos, ax, ay, az), cx, cy, projScale);
        edgeB[i] = project3D(rotateVec3(bPos, ax, ay, az), cx, cy, projScale);
      }

      // 4. Chuẩn bị lõi cầu Fibonacci xoay ngược chiều chậm rãi
      const coreRotX = -ax * 0.7 + time * 0.16;
      const coreRotY = -ay * 0.85 - time * 0.24;
      const coreNodes = PHYLLOTAXIS_CORE.map((pt) => {
        const pulse = 1 + Math.sin(time * 1.9 + pt.phase * 2) * 0.065;
        const p3 = rotateVec3(
          { x: pt.pos.x * pulse, y: pt.pos.y * pulse, z: pt.pos.z * pulse },
          coreRotX,
          coreRotY,
          az * 0.5,
        );
        return {
          ...project3D(p3, cx, cy, projScale),
          phase: pt.phase,
          index: pt.index,
        };
      });

      // 5. Gộp sắp xếp chiều sâu (Z-sorting) cho Dải Möbius & Hạt lõi Fibonacci để xuyên lồng 3D thật
      interface DrawItem {
        readonly z: number;
        readonly draw: () => void;
      }
      const drawQueue: DrawItem[] = [];

      // Thêm các mảng tứ giác Dải Möbius
      for (let i = 0; i < RIBBON_SAMPLES; i += 1) {
        const next = (i + 1) % RIBBON_SAMPLES;
        const a0 = edgeA[i]!;
        const a1 = edgeA[next]!;
        const b0 = edgeB[i]!;
        const b1 = edgeB[next]!;
        const c0 = projectedCenters[i]!;
        const avgZ = (a0.z + a1.z + b0.z + b1.z) * 0.25;

        drawQueue.push({
          z: avgZ,
          draw: () => {
            const depth = Math.max(0, Math.min(1, (avgZ + 1.25) / 2.5));
            const hueWave = Math.sin(c0.u * Math.PI * 4 + time * 0.65) * 0.5 + 0.5;
            // Chuyển sắc thanh nhã: Vàng cổ điển (#F5D38E) <-> Ngọc bích (#65D9B0) <-> Sương lam (#9BDFF5)
            const r = Math.round(98 + hueWave * 147);
            const g = Math.round(216 - hueWave * 6);
            const b = Math.round(186 - hueWave * 44);

            // Mặt lụa bán trong suốt mềm
            ctx.beginPath();
            ctx.moveTo(a0.x, a0.y);
            ctx.lineTo(a1.x, a1.y);
            ctx.lineTo(b1.x, b1.y);
            ctx.lineTo(b0.x, b0.y);
            ctx.closePath();
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(0.07 + depth * 0.22).toFixed(3)})`;
            ctx.fill();

            // Gân ngang kiến trúc mảnh mỗi 4 phân đoạn
            if (i % 4 === 0) {
              ctx.beginPath();
              ctx.moveTo(a0.x, a0.y);
              ctx.lineTo(b0.x, b0.y);
              ctx.strokeStyle = `rgba(255, 249, 232, ${(0.12 + depth * 0.28).toFixed(3)})`;
              ctx.lineWidth = 0.7;
              ctx.stroke();
            }

            // Hai mép biên lụa phát sáng sắc nét (mép vàng đồng & mép ngọc bích)
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(a0.x, a0.y);
            ctx.lineTo(a1.x, a1.y);
            ctx.strokeStyle = `rgba(247, 217, 146, ${(0.28 + depth * 0.62).toFixed(3)})`;
            ctx.lineWidth = 1.05 + depth * 1.15;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(b0.x, b0.y);
            ctx.lineTo(b1.x, b1.y);
            ctx.strokeStyle = `rgba(116, 231, 190, ${(0.24 + depth * 0.58).toFixed(3)})`;
            ctx.lineWidth = 0.95 + depth * 1.05;
            ctx.stroke();
          },
        });
      }

      // Thêm các sợi nối xoắn Fibonacci bên trong lõi
      for (let i = 0; i < PHYLLOTAXIS_COUNT - 8; i += 2) {
        const n1 = coreNodes[i]!;
        const n2 = coreNodes[i + 5]!;
        const avgZ = (n1.z + n2.z) * 0.5;
        drawQueue.push({
          z: avgZ - 0.02,
          draw: () => {
            const depth = Math.max(0, Math.min(1, (avgZ + 0.6) / 1.2));
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(245, 218, 152, ${(0.07 + depth * 0.16).toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          },
        });
      }

      // Thêm 64 hạt sáng Fibonacci
      for (const node of coreNodes) {
        drawQueue.push({
          z: node.z,
          draw: () => {
            const depth = Math.max(0, Math.min(1, (node.z + 0.55) / 1.1));
            const rad = 1.15 + depth * 1.65;
            const isGold = node.index % 3 === 0;
            ctx.beginPath();
            ctx.arc(node.x, node.y, rad, 0, Math.PI * 2);
            ctx.fillStyle = isGold
              ? `rgba(252, 226, 160, ${(0.35 + depth * 0.62).toFixed(3)})`
              : `rgba(146, 240, 208, ${(0.28 + depth * 0.58).toFixed(3)})`;
            ctx.fill();
          },
        });
      }

      drawQueue.sort((a, b) => a.z - b.z);
      for (const item of drawQueue) {
        item.draw();
      }

      // 6. 3 Ngôi sao ánh sáng có vệt đuôi lướt dọc sống lụa Möbius
      const starSpecs = [
        { hex: '#FCE29F', rgb: '252, 226, 159', offset: 0, speed: 0.14 },
        { hex: '#86F0C8', rgb: '134, 240, 200', offset: 0.333, speed: 0.14 },
        { hex: '#A5E2FC', rgb: '165, 226, 252', offset: 0.666, speed: 0.14 },
      ] as const;

      for (const star of starSpecs) {
        const headFloat = ((time * star.speed + star.offset) % 1) * RIBBON_SAMPLES;

        // Vệt đuôi sao chổi mảnh (10 đốt mượt)
        for (let tStep = 10; tStep >= 1; tStep -= 1) {
          const idxRaw = (Math.floor(headFloat) - tStep + RIBBON_SAMPLES) % RIBBON_SAMPLES;
          const pt = projectedCenters[idxRaw]!;
          const fade = (1 - tStep / 11) * 0.42;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.1 + (1 - tStep / 11) * 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${star.rgb}, ${fade.toFixed(3)})`;
          ctx.fill();
        }

        const i0 = Math.floor(headFloat) % RIBBON_SAMPLES;
        const i1 = (i0 + 1) % RIBBON_SAMPLES;
        const frac = headFloat - Math.floor(headFloat);
        const p0 = projectedCenters[i0]!;
        const p1 = projectedCenters[i1]!;
        const px = p0.x + (p1.x - p0.x) * frac;
        const py = p0.y + (p1.y - p0.y) * frac;

        const halo = ctx.createRadialGradient(px, py, 0.5, px, py, 13);
        halo.addColorStop(0, `rgba(${star.rgb}, 0.85)`);
        halo.addColorStop(1, `rgba(${star.rgb}, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px, py, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = star.hex;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 1.3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
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
          // Bỏ qua nếu trình duyệt không hỗ trợ
        }
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (dragging) {
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        targetRotY += dx * 0.013;
        targetRotX = Math.max(-1.25, Math.min(1.25, targetRotX + dy * 0.011));
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
        targetRotY = -0.28 + nx * 0.6;
        targetRotX = 0.36 + ny * 0.45;
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
        elapsed += dtSeconds * (hovered ? 1.28 : 1);
        const damp = frameDampFactor(7, dtSeconds);
        curRotX += (targetRotX - curRotX) * damp;
        curRotY += (targetRotY - curRotY) * damp;
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
      className={cn(
        'relative h-[248px] w-[264px] select-none lg:h-[282px] lg:w-[304px]',
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
