import { useEffect, useRef } from 'react';
import { JADE_MIST_DAWN_PALETTE } from '@/components/home/atmosphereThemes';
import {
  buildAtmosphereSpriteCache,
  createAtmosphereWorld,
  renderAtmosphereFrame,
  spawnHarmonicContourPulse,
  type AtmosphereMouseState,
} from '@/components/home/heroAtmosphereEngine';
import {
  buildHeroTerrainLayerCache,
  type HeroTerrainLayerCache,
} from '@/components/home/heroTerrainBuilder';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import {
  computeFrameDelta,
  createGlowSpriteCache,
  frameDampFactor,
  getLowLatency2DContext,
} from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

export interface HeroPhysicsCanvasProps {
  readonly className?: string;
}

/**
 * Canvas 2D Engine "Bình Minh Bạch Ngọc & Sơn Thủy Khắc Đồng" (120fps `dtScale` + `OffscreenCanvas` cache):
 * - Tiền kết xuất 5 tầng núi sương mù, 24-30 đường đồng mức & Đài Thiên Cầu Đông Sơn vào OffscreenCanvas (< 3ms/frame)
 * - Chùm tia nắng ban mai (god-rays), 3 khối đa diện nét khắc bản vẽ & gợn caustics mặt hồ sáng đáy màn hình
 * - Tương tác chuột (220px) làm sáng rực đồng mức màu Vàng Đồng (#A67936) & click phát sóng đồng tâm Trống Đồng
 */
export function HeroPhysicsCanvas({ className }: HeroPhysicsCanvasProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const terrainCacheRef = useRef<{
    cache: HeroTerrainLayerCache | null;
    width: number;
    height: number;
    dpr: number;
  }>({
    cache: null,
    width: 0,
    height: 0,
    dpr: 1,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof window === 'undefined') return;

    const ctx = getLowLatency2DContext(canvas, { alpha: true });
    if (!ctx) return;

    const glowSprites = createGlowSpriteCache();
    const sprites = buildAtmosphereSpriteCache();

    let width = window.innerWidth || 1440;
    let height = window.innerHeight || 900;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      const rect = parent ? parent.getBoundingClientRect() : null;
      width = Math.max(Math.floor(rect?.width || window.innerWidth || 1440), 320);
      height = Math.max(Math.floor(rect?.height || window.innerHeight || 900), 480);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const tc = terrainCacheRef.current;
      tc.width = width;
      tc.height = height;
      tc.dpr = dpr;
      tc.cache = buildHeroTerrainLayerCache(
        width,
        height,
        'binh-minh-bach-ngoc',
        JADE_MIST_DAWN_PALETTE,
        dpr,
      );
    };

    resize();

    const world = createAtmosphereWorld();
    const mouse: AtmosphereMouseState = {
      x: -9999,
      y: -9999,
      vx: 0,
      vy: 0,
      normX: 0,
      normY: 0,
      active: false,
    };
    let targetNormX = 0;
    let targetNormY = 0;
    let targetScroll = 0;
    let currentScroll = 0;

    const updateTargetScroll = () => {
      const heroHeight = Math.max(height, 360);
      targetScroll = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nextX = event.clientX - rect.left;
      const nextY = event.clientY - rect.top;

      if (mouse.active) {
        mouse.vx = Math.max(-28, Math.min(28, nextX - mouse.x));
        mouse.vy = Math.max(-28, Math.min(28, nextY - mouse.y));
      } else {
        mouse.vx = 0;
        mouse.vy = 0;
      }

      mouse.x = nextX;
      mouse.y = nextY;
      mouse.active = nextX >= 0 && nextX <= width && nextY >= 0 && nextY <= height;

      if (mouse.active) {
        targetNormX = (nextX / Math.max(width, 1) - 0.5) * 2;
        targetNormY = (nextY / Math.max(height, 1) - 0.5) * 2;
      }
    };

    const handleClick = (event: MouseEvent) => {
      const targetEl = event.target as HTMLElement | null;
      if (targetEl?.closest('a, button, [role="button"], input, textarea, select')) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      if (clickX < 0 || clickX > width || clickY < 0 || clickY > height) return;

      spawnHarmonicContourPulse(
        world,
        clickX,
        clickY,
        Math.max(720, Math.round(Math.hypot(width, height) * 0.65)),
      );
    };

    const drawFrame = (nowMs: number, dtSeconds: number, dtScale: number, animate: boolean) => {
      if (animate) {
        const smooth = frameDampFactor(10, dtSeconds);
        const scrollSmooth = frameDampFactor(14, dtSeconds);
        mouse.normX += (targetNormX - mouse.normX) * smooth;
        mouse.normY += (targetNormY - mouse.normY) * smooth;
        currentScroll += (targetScroll - currentScroll) * scrollSmooth;
        const velDecay = Math.pow(0.84, dtScale);
        mouse.vx *= velDecay;
        mouse.vy *= velDecay;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const tc = terrainCacheRef.current;
      renderAtmosphereFrame({
        ctx,
        width,
        height,
        tSec: nowMs / 1000,
        dtSeconds,
        dtScale,
        scrollProgress: currentScroll,
        animate,
        palette: JADE_MIST_DAWN_PALETTE,
        sprites,
        glowSprites,
        mouse,
        world,
        terrainLayers: tc.cache ? { prev: tc.cache, next: tc.cache, blend: 1 } : undefined,
      });
    };

    if (prefersReducedMotion) {
      drawFrame(0, 1 / 60, 1, false);
      window.addEventListener('resize', resize, { passive: true });
      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    let rafId = 0;
    let isDisposed = false;
    let isIntersecting = true;
    let elapsedSec = 0;
    let prevNowMs = performance.now();

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const tick = (now: number) => {
      if (isDisposed || !isIntersecting) {
        rafId = 0;
        return;
      }
      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNowMs);
      prevNowMs = now;
      elapsedSec += dtSeconds;

      drawFrame(elapsedSec * 1000, dtSeconds, dtScale, true);
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (isDisposed || !isIntersecting || rafId !== 0) return;
      prevNowMs = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    let intersectionObserver: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0.02 },
      );
      intersectionObserver.observe(canvas);
    }

    updateTargetScroll();
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('scroll', updateTargetScroll, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    startLoop();

    return () => {
      isDisposed = true;
      stopLoop();
      intersectionObserver?.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', updateTargetScroll);
      window.removeEventListener('resize', resize);
      for (const pulse of world.pulses) {
        pulse.active = false;
      }
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="hero-physics-canvas"
      data-phase="binh-minh-bach-ngoc"
      data-pipeline-layers="6"
      data-landscape-style="topographic-dong-son"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 z-[2] h-full w-full', className)}
    />
  );
}
