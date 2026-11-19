import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

interface ChladniPreset {
  readonly id: string;
  readonly label: string;
  readonly m: number;
  readonly n: number;
}

const CHLADNI_PRESETS: readonly ChladniPreset[] = [
  { id: 'doi-xung', label: 'Đối xứng (3, 5)', m: 3, n: 5 },
  { id: 'giao-thoa', label: 'Giao thoa (4, 7)', m: 4, n: 7 },
  { id: 'hoi-tu', label: 'Hội tụ (5, 8)', m: 5, n: 8 },
  { id: 'dong-son', label: 'Đông Sơn (6, 9)', m: 6, n: 9 },
] as const;

const MANIFESTO_PILLARS: readonly {
  readonly index: string;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    index: '01',
    title: 'Chuẩn hóa Chứng minh',
    description:
      'Toàn bộ định nghĩa, mệnh đề và chứng minh biên soạn chuẩn KaTeX, đối chiếu nguồn giáo trình rõ ràng.',
  },
  {
    index: '02',
    title: 'Trực quan hóa 120fps',
    description:
      'Chuyển hóa cấu trúc trừu tượng thành mô phỏng tương tác trực tiếp bằng đồ họa trắc địa.',
  },
  {
    index: '03',
    title: 'Nhịp học tập Chuyên sâu',
    description:
      'Kết hợp bộ đếm giờ tùy chỉnh, chế độ tập trung và hệ thống thuật ngữ tra cứu liên môn.',
  },
] as const;

const PARTICLE_COUNT = 2600;
const POINTER_DISTURB_RADIUS_PX = 65;

interface ChladniParticleSystem {
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly radius: Float32Array;
  readonly isBronze: Uint8Array;
  seed: number;
}

function nextRand(sys: ChladniParticleSystem): number {
  // PRNG Mulberry-style nhanh O(1), không cấp phát bộ nhớ trong vòng lặp 120fps
  sys.seed = (sys.seed * 1664525 + 1013904223) >>> 0;
  return sys.seed / 4294967296;
}

function createChladniParticles(): ChladniParticleSystem {
  const sys: ChladniParticleSystem = {
    x: new Float32Array(PARTICLE_COUNT),
    y: new Float32Array(PARTICLE_COUNT),
    radius: new Float32Array(PARTICLE_COUNT),
    isBronze: new Uint8Array(PARTICLE_COUNT),
    seed: 20261119,
  };

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    const angle = nextRand(sys) * Math.PI * 2;
    const rad = Math.sqrt(nextRand(sys)) * 0.96;
    sys.x[i] = Math.cos(angle) * rad;
    sys.y[i] = Math.sin(angle) * rad;
    sys.radius[i] = 1.1 + nextRand(sys) * 0.5; // 1.1px - 1.6px
    sys.isBronze[i] = i % 4 === 0 ? 1 : 0; // 75% Đá Phiến #1E332E, 25% Đồng Cổ #9C7A4C
  }

  return sys;
}

function stepChladniParticles(
  sys: ChladniParticleSystem,
  m: number,
  n: number,
  dtScale: number,
  excitation: number,
  pointerActive: boolean,
  pointerNormX: number,
  pointerNormY: number,
  pointerNormRadius: number,
): void {
  const nPi = n * Math.PI;
  const mPi = m * Math.PI;
  const safeDt = Math.min(2.2, Math.max(0.15, dtScale));
  const pointerR2 = pointerNormRadius * pointerNormRadius;

  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    let x = sys.x[i]!;
    let y = sys.y[i]!;

    const cosNx = Math.cos(nPi * x);
    const sinNx = Math.sin(nPi * x);
    const cosMy = Math.cos(mPi * y);
    const sinMy = Math.sin(mPi * y);
    const cosMx = Math.cos(mPi * x);
    const sinMx = Math.sin(mPi * x);
    const cosNy = Math.cos(nPi * y);
    const sinNy = Math.sin(nPi * y);

    // Z(x, y) = cos(nπx)cos(mπy) − cos(mπx)cos(nπy)
    const z = cosNx * cosMy - cosMx * cosNy;
    const absZ = Math.abs(z);

    // Gradient giải tích giúp hạt tụ sắc nét dọc theo đường nút Z(x, y) ≈ 0
    const dZx = -nPi * sinNx * cosMy + mPi * sinMx * cosNy;
    const dZy = -mPi * cosNx * sinMy + nPi * cosMx * sinNy;
    const gradMag = Math.hypot(dZx, dZy) + 0.001;

    const signZ = z >= 0 ? 1 : -1;
    const settleStrength = Math.min(0.022, absZ * 0.0155) * safeDt;
    const jitterAmp = (absZ * 0.0145 + excitation * 0.032) * safeDt;

    x += -(signZ * (dZx / gradMag)) * settleStrength + (nextRand(sys) - 0.5) * 2 * jitterAmp;
    y += -(signZ * (dZy / gradMag)) * settleStrength + (nextRand(sys) - 0.5) * 2 * jitterAmp;

    // Tương tác chuột / chạm: rung nhiễu cục bộ trong bán kính 65px
    if (pointerActive) {
      const dx = x - pointerNormX;
      const dy = y - pointerNormY;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < pointerR2) {
        const dist = Math.sqrt(dist2) + 0.0001;
        const falloff = 1 - dist / pointerNormRadius;
        const push = falloff * falloff * 0.055 * safeDt;
        const scatter = falloff * 0.042 * safeDt;
        x += (dx / dist) * push + (nextRand(sys) - 0.5) * 2 * scatter;
        y += (dy / dist) * push + (nextRand(sys) - 0.5) * 2 * scatter;
      }
    }

    // Giữ toàn bộ 2.600 hạt bên trong đĩa tròn chuẩn độ R_plate
    const r2 = x * x + y * y;
    if (r2 > 0.9604) {
      const r = Math.sqrt(r2);
      const clampR = 0.955 - nextRand(sys) * 0.04;
      x = (x / r) * clampR;
      y = (y / r) * clampR;
    }

    sys.x[i] = x;
    sys.y[i] = y;
  }
}

function drawChladniFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  sys: ChladniParticleSystem,
  pointerActive: boolean,
  pointerPxX: number,
  pointerPxY: number,
): void {
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const cx = width * 0.5;
  const cy = height * 0.5;
  const plateR = Math.max(88, Math.min(width, height) * 0.43);

  // Nền đĩa tròn sứ tinh tế bên trong khung
  const plateBg = ctx.createRadialGradient(cx, cy, plateR * 0.08, cx, cy, plateR);
  plateBg.addColorStop(0, '#FFFFFF');
  plateBg.addColorStop(0.74, '#F7F9F8');
  plateBg.addColorStop(1, '#EDF2F0');
  ctx.beginPath();
  ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
  ctx.fillStyle = plateBg;
  ctx.fill();

  // Trục tọa độ trắc địa siêu mảnh (x, y) và vòng đồng tâm chia độ gợi nhớ mặt trống đồng
  ctx.strokeStyle = 'rgba(30, 51, 46, 0.075)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  ctx.moveTo(cx - plateR, cy);
  ctx.lineTo(cx + plateR, cy);
  ctx.moveTo(cx, cy - plateR);
  ctx.lineTo(cx, cy + plateR);
  ctx.stroke();

  ctx.beginPath();
  ctx.setLineDash([3, 5]);
  ctx.arc(cx, cy, plateR * 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.2)';
  ctx.lineWidth = 0.7;
  ctx.stroke();
  ctx.setLineDash([]);

  // Vành ngoài đĩa cộng hưởng & 72 vạch khắc chia độ chuẩn xác (5° / 30°)
  ctx.beginPath();
  ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(30, 51, 46, 0.28)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, plateR + 6, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.34)';
  ctx.lineWidth = 0.75;
  ctx.stroke();

  // Vòng chia độ cơ khí cực mảnh (0.6px, 72 vạch chia) bao sát vành ngoài đĩa Chladni
  ctx.beginPath();
  ctx.arc(cx, cy, plateR + 10.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(156, 122, 76, 0.25)';
  ctx.lineWidth = 0.6;
  ctx.stroke();

  for (let i = 0; i < 72; i += 1) {
    const rad = (i * 5 * Math.PI) / 180;
    const isMajor = i % 6 === 0;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const inner = plateR + 0.5;
    const outer = plateR + (isMajor ? 8.5 : 4.2);
    ctx.beginPath();
    ctx.moveTo(cx + cos * inner, cy + sin * inner);
    ctx.lineTo(cx + cos * outer, cy + sin * outer);
    ctx.strokeStyle = isMajor ? 'rgba(140, 98, 40, 0.56)' : 'rgba(30, 51, 46, 0.22)';
    ctx.lineWidth = isMajor ? 1.0 : 0.6;
    ctx.stroke();

    // 72 vạch chia độ cơ khí siêu mảnh trên vành đồng ngoài cùng
    ctx.beginPath();
    ctx.moveTo(cx + cos * (plateR + 10.5), cy + sin * (plateR + 10.5));
    ctx.lineTo(
      cx + cos * (plateR + (isMajor ? 14.5 : 12.8)),
      cy + sin * (plateR + (isMajor ? 14.5 : 12.8)),
    );
    ctx.strokeStyle = 'rgba(156, 122, 76, 0.25)';
    ctx.lineWidth = 0.6;
    ctx.stroke();
  }

  // Vòng sóng nhiễu cục bộ khi người dùng di chuột / chạm trên đĩa (r = 65px)
  if (pointerActive) {
    const distFromCenter = Math.hypot(pointerPxX - cx, pointerPxY - cy);
    if (distFromCenter <= plateR + POINTER_DISTURB_RADIUS_PX * 0.4) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, plateR, 0, Math.PI * 2);
      ctx.clip();

      const aura = ctx.createRadialGradient(
        pointerPxX,
        pointerPxY,
        2,
        pointerPxX,
        pointerPxY,
        POINTER_DISTURB_RADIUS_PX,
      );
      aura.addColorStop(0, 'rgba(156, 122, 76, 0.14)');
      aura.addColorStop(1, 'rgba(156, 122, 76, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(pointerPxX, pointerPxY, POINTER_DISTURB_RADIUS_PX, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.setLineDash([3, 4]);
      ctx.arc(pointerPxX, pointerPxY, POINTER_DISTURB_RADIUS_PX, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(156, 122, 76, 0.32)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  // Kết xuất 2.600 hạt khoáng thạch siêu mịn (batch 2 pass màu để đạt 120fps < 1.5ms/frame)
  ctx.fillStyle = 'rgba(30, 51, 46, 0.82)';
  ctx.beginPath();
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    if (sys.isBronze[i] === 1) continue;
    const px = cx + sys.x[i]! * plateR;
    const py = cy + sys.y[i]! * plateR;
    const r = sys.radius[i]!;
    ctx.moveTo(px + r, py);
    ctx.arc(px, py, r, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.fillStyle = 'rgba(156, 122, 76, 0.88)';
  ctx.beginPath();
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    if (sys.isBronze[i] === 0) continue;
    const px = cx + sys.x[i]! * plateR;
    const py = cy + sys.y[i]! * plateR;
    const r = sys.radius[i]!;
    ctx.moveTo(px + r, py);
    ctx.arc(px, py, r, 0, Math.PI * 2);
  }
  ctx.fill();

  ctx.restore();
}

/**
 * PHÂN KHU KẾT TRANG TRANG CHỦ: EDITORIAL MANIFESTO × CHLADNI RESONANCE (120FPS)
 * - Cột Trái (5 cột): Tuyên ngôn phương pháp học thuật, 3 trụ cột & cụm CTA kết trang.
 * - Cột Phải (7 cột): Đài cộng hưởng sóng đứng Chladni với 2.600 hạt khoáng thạch 120fps,
 *   4 chế độ cộng hưởng (3,5) · (4,7) · (5,8) · (6,9) & nhiễu chạm cục bộ 65px.
 * - Kết thúc bằng đường viền kép mảnh Đồng Trầm (#9C7A4C/40) nối liền xuống Footer Đá Phiến Trầm.
 */
export function ChladniManifestoSection() {
  const prefersReducedMotion = useReducedMotion();
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const activePreset = CHLADNI_PRESETS[activePresetIndex] ?? CHLADNI_PRESETS[0]!;

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const presetRef = useRef<ChladniPreset>(activePreset);
  const excitationRef = useRef<number>(0.35);
  const particlesRef = useRef<ChladniParticleSystem | null>(null);

  useEffect(() => {
    presetRef.current = activePreset;
    excitationRef.current = 1.0;

    // Với prefers-reduced-motion: hội tụ nhanh và vẽ 1 khung tĩnh mới khi người dùng đổi chế độ
    if (prefersReducedMotion && canvasRef.current && stageRef.current) {
      if (particlesRef.current === null) {
        particlesRef.current = createChladniParticles();
      }
      const canvas = canvasRef.current;
      const ctx = getLowLatency2DContext(canvas, { alpha: true });
      if (!ctx) return;
      const rect = stageRef.current.getBoundingClientRect();
      const width = Math.max(280, Math.round(rect.width) || 520);
      const height = Math.max(280, Math.round(rect.height) || 380);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sys = particlesRef.current;
      for (let step = 0; step < 52; step += 1) {
        stepChladniParticles(sys, activePreset.m, activePreset.n, 1.15, 0.08, false, 0, 0, 0.1);
      }
      drawChladniFrame(ctx, width, height, dpr, sys, false, 0, 0);
    }
  }, [activePreset, prefersReducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!section || !stage || !canvas) return;
    if (particlesRef.current === null) {
      particlesRef.current = createChladniParticles();
    }
    const sys = particlesRef.current;

    const ctx = getLowLatency2DContext(canvas, { alpha: true });
    if (!ctx) return;

    let width = Math.max(280, stage.clientWidth || 520);
    let height = Math.max(280, stage.clientHeight || 380);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let isVisible = true;
    let rafId = 0;
    let prevNow = performance.now();

    let pointerActive = false;
    let pointerPxX = 0;
    let pointerPxY = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(280, stage.clientWidth || 520);
      height = Math.max(280, stage.clientHeight || 380);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    resize();

    // Tiền hội tụ nhẹ ban đầu để ngay khung hình đầu tiên đã hiện hoa văn đối xứng sắc nét
    const initSteps = prefersReducedMotion ? 56 : 26;
    for (let s = 0; s < initSteps; s += 1) {
      stepChladniParticles(
        sys,
        presetRef.current.m,
        presetRef.current.n,
        1.1,
        0.12,
        false,
        0,
        0,
        0.1,
      );
    }
    drawChladniFrame(ctx, width, height, dpr, sys, false, 0, 0);

    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      pointerPxX = event.clientX - rect.left;
      pointerPxY = event.clientY - rect.top;
      pointerActive = true;
    };

    const onPointerLeave = () => {
      pointerActive = false;
    };

    canvas.addEventListener('pointerdown', onPointerMove, { passive: true });
    canvas.addEventListener('pointermove', onPointerMove, { passive: true });
    canvas.addEventListener('pointerleave', onPointerLeave, { passive: true });
    canvas.addEventListener('pointercancel', onPointerLeave, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        resize();
        drawChladniFrame(ctx, width, height, dpr, sys, pointerActive, pointerPxX, pointerPxY);
      });
      resizeObserver.observe(stage);
    }

    if (prefersReducedMotion) {
      return () => {
        canvas.removeEventListener('pointerdown', onPointerMove);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.removeEventListener('pointercancel', onPointerLeave);
        resizeObserver?.disconnect();
      };
    }

    const tick = (now: number) => {
      if (!isVisible) {
        rafId = 0;
        return;
      }

      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;

      if (!document.hidden) {
        excitationRef.current = Math.max(0, excitationRef.current - dtSeconds * 1.45);
        const plateR = Math.max(88, Math.min(width, height) * 0.43);
        const cx = width * 0.5;
        const cy = height * 0.5;
        const pNormX = (pointerPxX - cx) / plateR;
        const pNormY = (pointerPxY - cy) / plateR;
        const pNormRadius = POINTER_DISTURB_RADIUS_PX / plateR;

        stepChladniParticles(
          sys,
          presetRef.current.m,
          presetRef.current.n,
          dtScale,
          excitationRef.current,
          pointerActive,
          pNormX,
          pNormY,
          pNormRadius,
        );
        drawChladniFrame(ctx, width, height, dpr, sys, pointerActive, pointerPxX, pointerPxY);
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId !== 0) return;
      prevNow = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          isVisible = entry ? entry.isIntersecting : true;
          if (isVisible) startLoop();
          else stopLoop();
        },
        { threshold: 0.02 },
      );
      intersectionObserver.observe(section);
    }

    startLoop();

    return () => {
      stopLoop();
      canvas.removeEventListener('pointerdown', onPointerMove);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointercancel', onPointerLeave);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
    };
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="tuyen-ngon-chladni"
      data-testid="chladni-manifesto-section"
      aria-label="Tuyên ngôn học thuật và Đài cộng hưởng sóng đứng Chladni"
      className="relative border-t border-[#D4DFDA] bg-[#F2F4F3] text-[#142622]"
    >
      {/* Dấu cộng chuẩn trực (+) trên đường ngăn kỹ thuật 1px solid #D4DFDA */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1400px] justify-between px-6 lg:px-10"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 py-24 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
          {/* CỘT TRÁI (5 cột): Tuyên Ngôn Phương Pháp Học Thuật */}
          <div className="space-y-8 lg:col-span-5">
            <div className="space-y-3">
              <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#8C6228] uppercase">
                SEC. 03 // KIẾN TRÚC TRI THỨC
              </p>
              <h2 className="font-serif text-3xl leading-tight font-bold tracking-tight text-[#142622] lg:text-4xl">
                Khi trực giác hình học gặp gỡ chiều sâu tiên đề.
              </h2>
            </div>

            {/* 3 Trụ cột ngắn gọn dạng đường kẻ mảnh */}
            <ol className="divide-y divide-[#D8E1DD] border-y border-[#D8E1DD]">
              {MANIFESTO_PILLARS.map((pillar) => (
                <li key={pillar.index} className="py-4 first:pt-4 last:pb-4">
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-mono text-xs font-bold text-[#8C6228] tabular-nums">
                      {pillar.index} ·
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#142622]">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#2D423D]">
                    {pillar.description}
                  </p>
                </li>
              ))}
            </ol>

            {/* Cụm nút kết trang (Clear Conversion CTA) */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to={ROUTES.learningSpace}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1E332E] px-5 py-3 text-sm font-semibold text-[#FAFBF9] shadow-[0_10px_24px_rgba(30,51,46,0.16)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#28443D] active:scale-[0.98]"
              >
                <span>Bước vào Không gian học tập</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                to={ROUTES.glossary}
                className="inline-flex items-center gap-2 rounded-xl border border-[#CFD9D5] bg-[#FAFBF9] px-5 py-3 text-sm font-semibold text-[#182624] shadow-xs transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#9C7A4C]/65 hover:bg-[#E7ECEA] active:scale-[0.98]"
              >
                <span>Khám phá Kho Thuật ngữ</span>
                <ArrowRight className="h-4 w-4 text-[#8C6228]" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* CỘT PHẢI (7 cột): Đài Cộng Hưởng Sóng Đứng Chladni 120FPS */}
          <div className="lg:col-span-7">
            <div
              data-testid="chladni-resonance-card"
              className="relative overflow-hidden rounded-2xl border border-[#CFD9D5] bg-[#FAFBF9] shadow-[0_18px_48px_rgba(24,38,36,0.06)]"
            >
              {/* 4 góc thước ngắm bản vẽ chữ L mảnh sát mép ngoài thẻ */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 left-2 z-20 h-3 w-3 border-t-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-2 right-2 z-20 h-3 w-3 border-t-[1.5px] border-r-[1.5px] border-[#9C7A4C]/70"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute bottom-2 left-2 z-20 h-3 w-3 border-b-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-2 bottom-2 z-20 h-3 w-3 border-r-[1.5px] border-b-[1.5px] border-[#9C7A4C]/70"
              />

              {/* Thanh đầu thẻ: Phương trình sóng đứng Chladni & tần số (m, n) */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E2E8E5] bg-[#F7F9F8] px-6 py-4">
                <span className="lu-fx-band-formula text-[#142622]">
                  cos(nπx)cos(mπy) − cos(mπx)cos(nπy) = 0
                </span>
                <span
                  data-testid="chladni-mode-indicator"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE4E0] bg-[#FAFBF9] px-3 py-0.5 font-mono text-[11px] font-semibold text-[#8C6228] tabular-nums"
                >
                  <span>(m, n) =</span>
                  <span className="text-[#142622]">
                    ({activePreset.m}, {activePreset.n})
                  </span>
                </span>
              </div>

              {/* Sân khấu Canvas đĩa cộng hưởng 2.600 hạt khoáng thạch */}
              <div
                ref={stageRef}
                className="relative h-[340px] w-full overflow-hidden bg-[#FAFBF9] sm:h-[390px] lg:h-[420px]"
              >
                <canvas
                  ref={canvasRef}
                  data-testid="chladni-resonance-canvas"
                  aria-label="Mô phỏng tương tác sóng đứng Chladni 2.600 hạt khoáng thạch"
                  className="block h-full w-full cursor-crosshair touch-none"
                />
              </div>

              {/* 4 nút chọn chế độ cộng hưởng đặt gọn dưới đáy khung */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8E5] bg-[#F7F9F8] px-6 py-4">
                <div
                  role="group"
                  aria-label="Chọn chế độ cộng hưởng sóng đứng Chladni"
                  className="flex flex-wrap items-center gap-2"
                >
                  {CHLADNI_PRESETS.map((preset, idx) => {
                    const isSelected = idx === activePresetIndex;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setActivePresetIndex(idx)}
                        className={cn(
                          'cursor-pointer rounded-full border px-3 py-1.5 font-mono text-[11px] font-semibold transition-all duration-150 active:scale-[0.98]',
                          isSelected
                            ? 'border-[#1E332E] bg-[#1E332E] text-[#FAFBF9] shadow-2xs'
                            : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#2D423D] hover:border-[#9C7A4C] hover:bg-[#EDF2F0] hover:text-[#142622]',
                        )}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <span className="hidden font-mono text-[10.5px] text-[#4A5D58] sm:inline">
                  2.600 hạt khoáng thạch · Di chuột để khuấy sóng
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Đường viền kép mảnh Đồng Trầm (1px solid #9C7A4C/40) chuyển tiếp gọn xuống Footer Đá Phiến Trầm (#142622) */}
      <div
        aria-hidden="true"
        data-testid="chladni-footer-seam"
        className="w-full bg-[#F2F4F3] pt-1"
      >
        <div className="h-[5px] w-full border-y border-[#9C7A4C]/40 bg-[#EAEFED]" />
      </div>
    </section>
  );
}

export default ChladniManifestoSection;
