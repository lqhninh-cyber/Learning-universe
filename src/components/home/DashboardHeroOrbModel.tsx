import { Sparkles } from 'lucide-react';
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

export type HeroSculptureMode = 'torus-knot' | 'lorenz' | 'helicoid';

export interface DashboardHeroOrbModelProps {
  readonly dayPeriod: DayPeriod;
  readonly className?: string;
}

interface SculptureModeMeta {
  readonly id: HeroSculptureMode;
  readonly label: string;
  readonly formula: string;
}

export const HERO_SCULPTURE_MODES: readonly SculptureModeMeta[] = [
  {
    id: 'torus-knot',
    label: 'Xoắn Torus',
    formula: 'T(3,5) · φ-Ribbon',
  },
  {
    id: 'lorenz',
    label: 'Hấp dẫn Lorenz',
    formula: 'dx/dt = σ(y − x)',
  },
  {
    id: 'helicoid',
    label: 'Mặt Yên Ngựa',
    formula: 'z = x² − y²',
  },
] as const;

interface CurveNode3D {
  readonly torus: Vec3;
  readonly lorenz: Vec3;
  readonly helicoid: Vec3;
  readonly u: number;
}

const CURVE_SAMPLES = 156;

/**
 * Tiền tính toán O(1) 156 điểm 3D chuẩn hóa cho 3 mặt/đường cong toán học kinh điển
 * để nội suy hình thái (3D Morphing) mượt ở 120fps hoàn toàn khác biệt với Nhị thập diện ở /learning-space.
 */
const MORPH_CURVE_NODES: readonly CurveNode3D[] = (() => {
  // 1. Tích phân quỹ đạo Hố hấp dẫn Lorenz (σ = 10, ρ = 28, β = 8/3)
  const lorenzRaw: Vec3[] = [];
  let lx = 0.1;
  let ly = 0;
  let lz = 0;
  const dt = 0.0085;
  // Bỏ qua 120 bước đầu để vào đúng mặt hút cánh bướm đôi
  for (let w = 0; w < 140; w += 1) {
    const dx = 10 * (ly - lx);
    const dy = lx * (28 - lz) - ly;
    const dz = lx * ly - (8 / 3) * lz;
    lx += dx * dt;
    ly += dy * dt;
    lz += dz * dt;
  }
  for (let i = 0; i < CURVE_SAMPLES; i += 1) {
    for (let sub = 0; sub < 4; sub += 1) {
      const dx = 10 * (ly - lx);
      const dy = lx * (28 - lz) - ly;
      const dz = lx * ly - (8 / 3) * lz;
      lx += dx * dt;
      ly += dy * dt;
      lz += dz * dt;
    }
    lorenzRaw.push({
      x: lx * 0.056,
      y: (lz - 25) * 0.052,
      z: ly * 0.052,
    });
  }

  return Array.from({ length: CURVE_SAMPLES }, (_, idx) => {
    const u = idx / CURVE_SAMPLES;
    const t = u * Math.PI * 2;

    // Hình thái 1: Nút xoắn Torus T(3, 5) tỷ lệ vàng (3D Trefoil-Penta Torus Knot)
    const p = 3;
    const q = 5;
    const rTube = 0.78 + 0.36 * Math.cos(q * t);
    const torus: Vec3 = {
      x: rTube * Math.cos(p * t),
      y: rTube * Math.sin(p * t),
      z: 0.46 * Math.sin(q * t),
    };

    // Hình thái 2: Quỹ đạo cánh bướm Lorenz 3D
    const lorenz = lorenzRaw[idx] ?? { x: 0, y: 0, z: 0 };

    // Hình thái 3: Mặt Yên Ngựa Hyperbolic Paraboloid & Đường xoắn Helicoid kép
    const waveR = 1.05 * Math.sin(t * 2) + 0.25;
    const hx = Math.cos(t * 3) * (0.55 + 0.48 * Math.cos(t));
    const hz = Math.sin(t * 3) * (0.55 + 0.48 * Math.cos(t));
    const hy = (hx * hx - hz * hz) * 0.68 + 0.25 * Math.sin(waveR * Math.PI);
    const helicoid: Vec3 = { x: hx * 1.12, y: hy * 1.08, z: hz * 1.12 };

    return { torus, lorenz, helicoid, u };
  });
})();

// Lưới mặt cong kẻ 3D (Ruled Surface Struts) nối các nhánh đối xứng
const SURFACE_RIB_INDICES: readonly (readonly [number, number])[] = Array.from(
  { length: 26 },
  (_, k) => {
    const i = (k * 6) % CURVE_SAMPLES;
    const j = (i + Math.floor(CURVE_SAMPLES * 0.382)) % CURVE_SAMPLES;
    return [i, j] as const;
  },
);

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
  const dist = 3.85;
  const k = scale / Math.max(1.2, dist - v.z);
  return { x: cx + v.x * k, y: cy + v.y * k, z: v.z, k };
}

/**
 * Điêu Khắc Toán Học Tham Số 3D Đa Hình Thái (120fps Canvas) dành riêng cho Trang Tổng quan (/):
 * - Khác biệt 100% với khối Nhị thập diện ở /learning-space.
 * - Cho phép người dùng bấm chuyển đổi mượt (3D Morphing) giữa 3 mô hình:
 *   1. Xoắn Torus T(3,5) & Dải lụa Möbius ánh kim
 *   2. Hố hấp dẫn Lorenz 3D (Cánh bướm vi phân hỗn loạn)
 *   3. Mặt Yên Ngựa Hyperbolic & Lưới kẻ không gian
 * - Hỗ trợ kéo chuột xoay 360° và tự đổi hòa sắc theo khung giờ Sáng / Chiều / Tối / Đêm.
 */
export function DashboardHeroOrbModel({ dayPeriod, className }: DashboardHeroOrbModelProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const [activeMode, setActiveMode] = useState<HeroSculptureMode>('torus-knot');
  const activeModeRef = useRef<HeroSculptureMode>(activeMode);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    activeModeRef.current = activeMode;
  }, [activeMode]);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    let width = Math.max(230, host.clientWidth || 280);
    let height = Math.max(210, host.clientHeight || 250);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(230, host.clientWidth || 280);
      height = Math.max(210, host.clientHeight || 250);
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
    let targetRotX = 0.32;
    let targetRotY = -0.25;
    let curRotX = targetRotX;
    let curRotY = targetRotY;

    // Trọng số nội suy hình thái 3D (wTorus, wLorenz, wHelicoid)
    let wTorus = 1;
    let wLorenz = 0;
    let wHelicoid = 0;

    const getSamplePosition = (node: CurveNode3D, time: number): Vec3 => {
      const breath = 1 + Math.sin(time * 1.4 + node.u * Math.PI * 4) * 0.045;
      const base: Vec3 = {
        x: (node.torus.x * wTorus + node.lorenz.x * wLorenz + node.helicoid.x * wHelicoid) * breath,
        y: (node.torus.y * wTorus + node.lorenz.y * wLorenz + node.helicoid.y * wHelicoid) * breath,
        z: (node.torus.z * wTorus + node.lorenz.z * wLorenz + node.helicoid.z * wHelicoid) * breath,
      };
      return base;
    };

    const renderFrame = (time: number) => {
      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.49;
      const minDim = Math.min(width, height);
      const outerR = minDim * 0.44;
      const projScale = minDim * 1.04;

      // 1. Hào quang đa tầng phía sau tượng điêu khắc 3D
      const aura = ctx.createRadialGradient(cx, cy, 4, cx, cy, outerR * 1.22);
      if (dayPeriod === 'morning' || dayPeriod === 'evening') {
        aura.addColorStop(0, 'rgba(245, 208, 120, 0.28)');
        aura.addColorStop(0.52, 'rgba(74, 209, 163, 0.16)');
      } else {
        aura.addColorStop(0, 'rgba(110, 231, 183, 0.26)');
        aura.addColorStop(0.52, 'rgba(147, 213, 250, 0.16)');
      }
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR * 1.22, 0, Math.PI * 2);
      ctx.fill();

      // 2. Khung vòm Nhật Quỹ / Chân trời 12 cung giờ học thuật (khác hẳn la bàn 360 độ của /learning-space)
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 248, 228, 0.24)';
      ctx.lineWidth = 1;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, -Math.PI * 0.82, Math.PI * 0.82);
      ctx.stroke();
      ctx.setLineDash([]);

      // 8 điểm sao chòm sao kiến trúc quanh vòm ngoài
      for (let s = 0; s < 8; s += 1) {
        const ang = (s / 8) * Math.PI * 2 + time * 0.05;
        const sx = cx + Math.cos(ang) * outerR;
        const sy = cy + Math.sin(ang) * outerR;
        ctx.beginPath();
        ctx.arc(sx, sy, s % 2 === 0 ? 2.1 : 1.3, 0, Math.PI * 2);
        ctx.fillStyle = s % 2 === 0 ? '#F5D078' : 'rgba(167, 243, 208, 0.75)';
        ctx.fill();
      }
      ctx.restore();

      // 3. Tính tọa độ xoay 3D của 156 đỉnh đường cong tham số + dải lụa kép (Ribbon Offset)
      const ax = curRotX + Math.sin(time * 0.35) * 0.12;
      const ay = curRotY + time * 0.38;
      const az = Math.cos(time * 0.24) * 0.14;

      const mainPts = MORPH_CURVE_NODES.map((node) => {
        const p3 = rotateVec3(getSamplePosition(node, time), ax, ay, az);
        return {
          ...project3D(p3, cx, cy, projScale),
          u: node.u,
          p3,
        };
      });

      // Dải biên song song tạo bề mặt lụa Möbius 3D có chiều rộng
      const ribbonPts = MORPH_CURVE_NODES.map((node, idx) => {
        const base = getSamplePosition(node, time);
        const twistAngle = node.u * Math.PI * 6 + time * 0.9;
        const offset: Vec3 = {
          x: base.x + Math.cos(twistAngle) * 0.13,
          y: base.y + Math.sin(twistAngle) * 0.13,
          z: base.z + Math.sin(twistAngle * 0.5) * 0.11,
        };
        const p3 = rotateVec3(offset, ax, ay, az);
        return {
          ...project3D(p3, cx, cy, projScale),
          main: mainPts[idx]!,
        };
      });

      // 4. Vẽ các thanh giằng mặt kẻ (Ruled Surface Geodesic Struts)
      for (const [i, j] of SURFACE_RIB_INDICES) {
        const a = mainPts[i]!;
        const b = mainPts[j]!;
        const avgZ = (a.z + b.z) * 0.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = avgZ >= 0 ? 'rgba(245, 208, 120, 0.24)' : 'rgba(147, 213, 250, 0.12)';
        ctx.lineWidth = avgZ >= 0 ? 0.9 : 0.65;
        ctx.stroke();
      }

      // 5. Vẽ các mặt tứ giác của Dải Lụa 3D (Z-sorted Translucent Ribbon Quads)
      const quads = mainPts.map((curr, idx) => {
        const nextIdx = (idx + 1) % CURVE_SAMPLES;
        const next = mainPts[nextIdx]!;
        const rCurr = ribbonPts[idx]!;
        const rNext = ribbonPts[nextIdx]!;
        const avgZ = (curr.z + next.z) * 0.5;
        return { curr, next, rCurr, rNext, avgZ, u: curr.u, idx };
      });
      quads.sort((a, b) => a.avgZ - b.avgZ);

      for (const q of quads) {
        const depthNorm = Math.max(0, Math.min(1, (q.avgZ + 1.2) / 2.4));
        const hueMix = Math.sin(q.u * Math.PI * 2 + time * 0.8) * 0.5 + 0.5;
        const r = Math.round(74 + hueMix * 171);
        const g = Math.round(209 - hueMix * 10);
        const b = Math.round(168 - hueMix * 48);
        const fillAlpha = 0.08 + depthNorm * 0.24;

        // Mặt lụa bán trong suốt
        ctx.beginPath();
        ctx.moveTo(q.curr.x, q.curr.y);
        ctx.lineTo(q.next.x, q.next.y);
        ctx.lineTo(q.rNext.x, q.rNext.y);
        ctx.lineTo(q.rCurr.x, q.rCurr.y);
        ctx.closePath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${fillAlpha.toFixed(3)})`;
        ctx.fill();

        // Thanh ngang trên mặt lụa mỗi 3 bước
        if (q.idx % 3 === 0) {
          ctx.beginPath();
          ctx.moveTo(q.curr.x, q.curr.y);
          ctx.lineTo(q.rCurr.x, q.rCurr.y);
          ctx.strokeStyle = `rgba(255, 248, 224, ${(0.14 + depthNorm * 0.25).toFixed(3)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }

        // Đường sống chính phát sáng
        ctx.beginPath();
        ctx.moveTo(q.curr.x, q.curr.y);
        ctx.lineTo(q.next.x, q.next.y);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${(0.35 + depthNorm * 0.6).toFixed(3)})`;
        ctx.lineWidth = 1.3 + depthNorm * 1.4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Đường viền lụa phụ ánh kim
        ctx.beginPath();
        ctx.moveTo(q.rCurr.x, q.rCurr.y);
        ctx.lineTo(q.rNext.x, q.rNext.y);
        ctx.strokeStyle = `rgba(245, 208, 120, ${(0.22 + depthNorm * 0.45).toFixed(3)})`;
        ctx.lineWidth = 0.85 + depthNorm * 0.6;
        ctx.stroke();
      }

      // 6. 4 Hạt Xung Năng Lượng (4 màu học phần) chạy dọc theo ống xoắn 3D
      const pulseColors = [
        { hex: '#F5D078', rgb: '245, 208, 120', speed: 0.16, offset: 0 },
        { hex: '#93D5FA', rgb: '147, 213, 250', speed: 0.16, offset: 0.25 },
        { hex: '#6EE7B7', rgb: '110, 231, 183', speed: 0.16, offset: 0.5 },
        { hex: '#F5A49B', rgb: '245, 164, 155', speed: 0.16, offset: 0.75 },
      ] as const;

      for (const pulse of pulseColors) {
        const prog = ((time * pulse.speed + pulse.offset) % 1) * CURVE_SAMPLES;
        const i0 = Math.floor(prog) % CURVE_SAMPLES;
        const i1 = (i0 + 1) % CURVE_SAMPLES;
        const frac = prog - Math.floor(prog);
        const p0 = mainPts[i0]!;
        const p1 = mainPts[i1]!;
        const px = p0.x + (p1.x - p0.x) * frac;
        const py = p0.y + (p1.y - p0.y) * frac;

        const glow = ctx.createRadialGradient(px, py, 0.5, px, py, 12);
        glow.addColorStop(0, `rgba(${pulse.rgb}, 0.85)`);
        glow.addColorStop(1, `rgba(${pulse.rgb}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = pulse.hex;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }

      // 7. Hạt nhân ánh sáng tỷ lệ vàng tại tâm đối xứng
      const centerPulse = 4.2 + Math.sin(time * 2.4) * 1.1;
      const coreHalo = ctx.createRadialGradient(cx, cy, 1, cx, cy, 24);
      coreHalo.addColorStop(0, 'rgba(255, 248, 220, 0.75)');
      coreHalo.addColorStop(0.45, 'rgba(245, 208, 120, 0.25)');
      coreHalo.addColorStop(1, 'rgba(245, 208, 120, 0)');
      ctx.fillStyle = coreHalo;
      ctx.beginPath();
      ctx.arc(cx, cy, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, centerPulse, 0, Math.PI * 2);
      ctx.fillStyle = '#FFF9E6';
      ctx.fill();

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
          // Bỏ qua nếu môi trường không hỗ trợ
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
        targetRotX = Math.max(-1.2, Math.min(1.2, targetRotX + dy * 0.011));
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
        targetRotY = -0.25 + nx * 0.65;
        targetRotX = 0.32 + ny * 0.5;
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

    // Đồng bộ trọng số ngay cho frame tĩnh đầu tiên
    wTorus = activeModeRef.current === 'torus-knot' ? 1 : 0;
    wLorenz = activeModeRef.current === 'lorenz' ? 1 : 0;
    wHelicoid = activeModeRef.current === 'helicoid' ? 1 : 0;
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
        elapsed += dtSeconds * (hovered ? 1.3 : 1);
        const damp = frameDampFactor(7, dtSeconds);
        curRotX += (targetRotX - curRotX) * damp;
        curRotY += (targetRotY - curRotY) * damp;

        // Nội suy mượt giữa 3 hình thái 3D (Morphing)
        const mode = activeModeRef.current;
        const morphRate = frameDampFactor(5.5, dtSeconds);
        wTorus += ((mode === 'torus-knot' ? 1 : 0) - wTorus) * morphRate;
        wLorenz += ((mode === 'lorenz' ? 1 : 0) - wLorenz) * morphRate;
        wHelicoid += ((mode === 'helicoid' ? 1 : 0) - wHelicoid) * morphRate;

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

  // Khi prefersReducedMotion bật và đổi mode, vẽ lại ngay
  useEffect(() => {
    if (!prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const evt = new PointerEvent('pointermove', { clientX: 0, clientY: 0 });
    hostRef.current?.dispatchEvent(evt);
  }, [activeMode, prefersReducedMotion]);

  const currentMeta =
    HERO_SCULPTURE_MODES.find((m) => m.id === activeMode) ?? HERO_SCULPTURE_MODES[0]!;

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <div
        ref={hostRef}
        data-testid="dashboard-hero-orb-model"
        data-sculpture-mode={activeMode}
        title="Kéo xoay 360° hoặc bấm nút bên dưới để biến đổi hình thái mặt cong 3D"
        className={cn(
          'relative h-[220px] w-[248px] select-none lg:h-[256px] lg:w-[292px]',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        aria-hidden="true"
      >
        <canvas ref={canvasRef} className="block h-full w-full touch-none" />
      </div>

      {/* Bộ nút chuyển đổi 3 hình thái mặt cong 3D ngay dưới mô hình */}
      <div
        role="group"
        aria-label="Chọn hình thái điêu khắc toán học 3D"
        className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/35 p-1 backdrop-blur-md"
      >
        {HERO_SCULPTURE_MODES.map((mode) => {
          const isSelected = mode.id === activeMode;
          return (
            <button
              key={mode.id}
              type="button"
              data-testid={`hero-sculpture-mode-${mode.id}`}
              aria-pressed={isSelected}
              onClick={() => setActiveMode(mode.id)}
              className={cn(
                'cursor-pointer rounded-full px-2.5 py-0.5 font-mono text-[9.5px] font-semibold transition-all duration-150',
                isSelected
                  ? 'bg-[#0F7656] text-white shadow-2xs ring-1 ring-[#A7F3D0]/40'
                  : 'text-white/75 hover:bg-white/10 hover:text-white',
              )}
            >
              {mode.label}
            </button>
          );
        })}
      </div>

      <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] font-medium tracking-wider text-white/80">
        <Sparkles className="h-2.5 w-2.5 text-[#F5D078]" aria-hidden="true" />
        <span>{currentMeta.formula} · Kéo xoay 3D</span>
      </span>
    </div>
  );
}

export default DashboardHeroOrbModel;
