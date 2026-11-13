import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import {
  computeFrameDelta,
  frameDampFactor,
  getLowLatency2DContext,
} from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';
import { SUBJECT_SCENE_FACTORIES, type ScenePointer } from './subjectHeroScenes';
import type { SubjectUniverseId } from './subjectUniverseThemes';

export interface SubjectHeroCanvasProps {
  readonly universe: SubjectUniverseId;
  readonly className?: string;
}

interface MutablePointer {
  nx: number;
  ny: number;
  px: number;
  py: number;
  presence: number;
}

/**
 * Canvas nền tương tác 120fps cho Hero trang Chi tiết Môn học.
 * - Delta-time chuẩn hóa (`dtScale`) cho mọi tần số quét.
 * - Tự tạm dừng khi Hero ra khỏi khung nhìn (`IntersectionObserver`) hoặc tab bị ẩn.
 * - Tôn trọng `prefers-reduced-motion`: chỉ vẽ một khung hình tĩnh.
 */
export function SubjectHeroCanvas({ universe, className }: SubjectHeroCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getLowLatency2DContext(canvas);
    if (!ctx) return;

    const scene = SUBJECT_SCENE_FACTORIES[universe]();
    let width = 1;
    let height = 1;
    let rafId = 0;
    let isDisposed = false;
    let isIntersecting = true;
    let isPageVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden';
    let elapsed = 0;
    let prevNow = performance.now();

    const target = { nx: 0, ny: 0, px: 0, py: 0, inside: false };
    const pointer: MutablePointer = { nx: 0, ny: 0, px: 0, py: 0, presence: 0 };

    const renderFrame = (dtSeconds: number, dtScale: number) => {
      const damp = frameDampFactor(5, dtSeconds);
      pointer.nx += (target.nx - pointer.nx) * damp;
      pointer.ny += (target.ny - pointer.ny) * damp;
      pointer.px += (target.px - pointer.px) * damp;
      pointer.py += (target.py - pointer.py) * damp;
      pointer.presence +=
        ((target.inside ? 1 : 0) - pointer.presence) * frameDampFactor(4, dtSeconds);

      ctx.clearRect(0, 0, width, height);
      scene({
        ctx,
        width,
        height,
        time: elapsed,
        dtScale,
        pointer: pointer as ScenePointer,
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (target.px === 0 && target.py === 0) {
        target.px = width * 0.7;
        target.py = height * 0.5;
        pointer.px = target.px;
        pointer.py = target.py;
      }
      if (prefersReducedMotion || rafId === 0) {
        renderFrame(0, 0);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
      target.inside = inside;
      if (!inside) return;
      target.px = x;
      target.py = y;
      target.nx = (x / Math.max(rect.width, 1)) * 2 - 1;
      target.ny = (y / Math.max(rect.height, 1)) * 2 - 1;
    };

    const handlePointerLeave = () => {
      target.inside = false;
      target.nx = 0;
      target.ny = 0;
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const tick = (now: number) => {
      if (isDisposed || !isIntersecting || !isPageVisible) {
        rafId = 0;
        return;
      }
      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;
      elapsed += dtSeconds;
      renderFrame(dtSeconds, dtScale);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (prefersReducedMotion || isDisposed || !isIntersecting || !isPageVisible || rafId !== 0) {
        return;
      }
      prevNow = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    const handleVisibility = () => {
      isPageVisible = document.visibilityState !== 'hidden';
      if (isPageVisible) startLoop();
      else stopLoop();
    };

    resize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => resize());
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener('resize', resize, { passive: true });
    }

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) startLoop();
          else stopLoop();
        },
        { threshold: 0.02 },
      );
      intersectionObserver.observe(canvas);
    }

    if (!prefersReducedMotion) {
      window.addEventListener('pointermove', handlePointerMove, { passive: true });
      document.addEventListener('pointerleave', handlePointerLeave);
    }
    document.addEventListener('visibilitychange', handleVisibility);
    startLoop();

    return () => {
      isDisposed = true;
      stopLoop();
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [universe, prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-testid="subject-hero-canvas"
      data-universe={universe}
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
}
