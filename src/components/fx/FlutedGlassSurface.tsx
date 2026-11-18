import { type ReactNode, useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';

export interface FlutedGlassSurfaceProps {
  readonly children: ReactNode;
  readonly className?: string;
  /** Số rãnh gân thấu kính trụ (mặc định 18) */
  readonly ribs?: number;
  readonly tone?: 'mineral' | 'brass' | 'vellum';
  readonly as?: 'div' | 'span';
  readonly 'data-testid'?: string;
}

const TONE_MAP: Record<
  NonNullable<FlutedGlassSurfaceProps['tone']>,
  {
    readonly border: string;
    readonly baseBg: string;
    readonly seamRgba: string;
    readonly specularRgba: string;
    readonly rimRgba: string;
  }
> = {
  mineral: {
    border: 'border-[#CFD8D4]',
    baseBg: 'bg-[#FAFBF9]/84',
    seamRgba: '30, 51, 46',
    specularRgba: '255, 255, 255',
    rimRgba: '36, 87, 70',
  },
  brass: {
    border: 'border-[#D7CCB8]',
    baseBg: 'bg-[#FAF8F4]/86',
    seamRgba: '107, 83, 53',
    specularRgba: '255, 249, 236',
    rimRgba: '140, 114, 72',
  },
  vellum: {
    border: 'border-[#D8E0DD]',
    baseBg: 'bg-[#F5F7F6]/88',
    seamRgba: '45, 74, 67',
    specularRgba: '255, 255, 255',
    rimRgba: '140, 114, 72',
  },
};

/**
 * Bề mặt thấu kính gân trụ Fluted-Glass (chuyển thể từ fluted-glass/effect.js).
 * Tạo độ khúc xạ quang học dọc theo từng gân kính với mép sáng u=0.16 và rãnh tối u=0/1.
 */
export function FlutedGlassSurface({
  children,
  className,
  ribs = 18,
  tone = 'mineral',
  as = 'div',
  'data-testid': dataTestId = 'fluted-glass-surface',
}: FlutedGlassSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  const palette = TONE_MAP[tone];

  // Lớp gân CSS tĩnh dự phòng (hiển thị ngay ở SSR / JSDOM với độ trễ 0ms)
  const ribBackground = useMemo(() => {
    const pct = (100 / Math.max(6, ribs)).toFixed(3);
    return {
      backgroundImage: `repeating-linear-gradient(90deg, rgba(${palette.seamRgba}, 0.08) 0px, rgba(${palette.specularRgba}, 0.42) calc(${pct}% * 0.16), rgba(${palette.rimRgba}, 0.04) calc(${pct}% * 0.55), rgba(255,255,255,0.16) calc(${pct}% * 0.85), rgba(${palette.seamRgba}, 0.09) ${pct}%)`,
    };
  }, [palette, ribs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getLowLatency2DContext(canvas, { alpha: true });
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let rafId: number | null = null;
    let lastTs = typeof performance !== 'undefined' ? performance.now() : 0;
    let phase = 0;
    let hovered = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const nextW = Math.max(0, Math.round(rect.width));
      const nextH = Math.max(0, Math.round(rect.height));
      if (nextW === 0 || nextH === 0) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (nextW !== width || nextH !== height) {
        width = nextW;
        height = nextH;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
      }
    };

    const drawRibs = (ts: number) => {
      const delta = computeFrameDelta(ts, lastTs);
      lastTs = ts;
      if (!reducedMotion) {
        phase += delta.dtSeconds * (hovered ? 1.55 : 0.48);
      }

      if (width === 0 || height === 0) resize();
      if (width === 0 || height === 0) return;

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      const safeRibs = Math.max(8, ribs);
      const ribW = width / safeRibs;
      const sweepPos = 0.5 + 0.42 * Math.sin(phase);

      for (let i = 0; i < safeRibs; i += 1) {
        const x0 = i * ribW;
        // Độ nghiêng mặt trụ cu = u - 0.5 trong fluted-glass
        const uNorm = (i + 0.5) / safeRibs;
        const refractGlow = Math.exp(-Math.pow((uNorm - sweepPos) * 3.4, 2));

        // Mép khúc xạ sáng nổi tại u = 0.16 của mỗi gân
        const bevelX = x0 + ribW * 0.16;
        const grad = ctx.createLinearGradient(x0, 0, x0 + ribW, 0);
        grad.addColorStop(0, `rgba(${palette.seamRgba}, 0.11)`);
        grad.addColorStop(
          0.16,
          `rgba(${palette.specularRgba}, ${(0.44 + refractGlow * 0.34).toFixed(3)})`,
        );
        grad.addColorStop(
          0.54,
          `rgba(${palette.rimRgba}, ${(0.03 + refractGlow * 0.05).toFixed(3)})`,
        );
        grad.addColorStop(1, `rgba(${palette.seamRgba}, 0.09)`);

        ctx.fillStyle = grad;
        ctx.fillRect(x0, 0, ribW + 0.5, height);

        // Vệt sáng đứng sắc nét dọc đỉnh vát gân kính
        ctx.fillStyle = `rgba(${palette.specularRgba}, ${(0.24 + refractGlow * 0.28).toFixed(3)})`;
        ctx.fillRect(bevelX, 0, 1, height);
      }

      ctx.restore();
    };

    const tick = (ts: number) => {
      drawRibs(ts);
      if (!reducedMotion) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    resize();
    drawRibs(lastTs);

    const parent = canvas.parentElement;
    const onEnter = () => {
      hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    if (parent) {
      parent.addEventListener('pointerenter', onEnter, { passive: true });
      parent.addEventListener('pointerleave', onLeave, { passive: true });
    }

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        resize();
        drawRibs(lastTs);
      });
      ro.observe(canvas);
    }

    if (!reducedMotion) {
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (parent) {
        parent.removeEventListener('pointerenter', onEnter);
        parent.removeEventListener('pointerleave', onLeave);
      }
      ro?.disconnect();
    };
  }, [palette, reducedMotion, ribs]);

  const Component = as;

  return (
    <Component
      data-testid={dataTestId}
      data-fluted-ribs={ribs}
      className={cn(
        'relative isolate overflow-hidden border shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_4px_14px_rgba(24,38,36,0.05)] backdrop-blur-md',
        palette.border,
        palette.baseBg,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-85"
        style={ribBackground}
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] h-full w-full opacity-80"
      />
      <span className="relative z-[2] flex w-full items-center">{children}</span>
    </Component>
  );
}
