import { useEffect, useRef } from 'react';
import {
  ATMOSPHERIC_PALETTES,
  interpolateAtmospherePalette,
  type AtmospherePalette,
  type AtmosphericPhase,
} from '@/components/home/atmosphereThemes';
import {
  buildAtmosphereSpriteCache,
  createAtmosphereWorld,
  renderAtmosphereFrame,
  spawnNovaPulse,
  triggerAuroraPluck,
  tryBoostSkyLanternAt,
  trySpawnMouseLakeRipple,
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
  readonly phase?: AtmosphericPhase;
  readonly className?: string;
}

/**
 * Canvas 2D Engine Khí Quyển & Sơn Thủy Fractal 6 Lớp 120fps (`dtScale` + `OffscreenCanvas` cache):
 * - Đồng bộ 600ms bảng màu & cache địa hình OffscreenCanvas theo 4 thời khắc (Đêm Ngân Hà · Bình Minh · Nắng Ngọc · Hoàng Hôn)
 * - 6 lớp thứ tự Z: Ngân Hà + Cực Quang Màn Rèm -> Núi Fractal + Vọng Tinh Các + Thác Đa Dòng -> Cầu Vòm Đá + Hồ Fresnel -> Tiền cảnh Tùng & Bokeh DoF
 * - Tương tác gảy màn cực quang, thắp Đèn Trời 3D bay vút & tạo sóng lăn tăn elip 3.5:1 trên mặt hồ
 */
export function HeroPhysicsCanvas({ phase = 'dem-ngan-ha', className }: HeroPhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const paletteTransitionRef = useRef<{
    fromPhase: AtmosphericPhase;
    toPhase: AtmosphericPhase;
    from: AtmospherePalette;
    to: AtmospherePalette;
    current: AtmospherePalette;
    elapsedSec: number;
  }>({
    fromPhase: phase,
    toPhase: phase,
    from: ATMOSPHERIC_PALETTES[phase],
    to: ATMOSPHERIC_PALETTES[phase],
    current: ATMOSPHERIC_PALETTES[phase],
    elapsedSec: 0.6,
  });

  const terrainCacheRef = useRef<{
    from: HeroTerrainLayerCache | null;
    to: HeroTerrainLayerCache | null;
    width: number;
    height: number;
    dpr: number;
    fromPhase: AtmosphericPhase;
    toPhase: AtmosphericPhase;
  }>({
    from: null,
    to: null,
    width: 0,
    height: 0,
    dpr: 1,
    fromPhase: phase,
    toPhase: phase,
  });

  useEffect(() => {
    const tr = paletteTransitionRef.current;
    const target = ATMOSPHERIC_PALETTES[phase];
    const prevPhase = tr.toPhase;
    paletteTransitionRef.current = {
      fromPhase: prevPhase,
      toPhase: phase,
      from: tr.current,
      to: target,
      current: prefersReducedMotion ? target : tr.current,
      elapsedSec: prefersReducedMotion ? 0.6 : 0,
    };

    const tc = terrainCacheRef.current;
    if (tc.width > 0 && tc.height > 0 && tc.toPhase !== phase) {
      const nextCache = buildHeroTerrainLayerCache(tc.width, tc.height, phase, target, tc.dpr);
      tc.fromPhase = tc.toPhase;
      tc.toPhase = phase;
      tc.from = prefersReducedMotion ? nextCache : tc.to;
      tc.to = nextCache;
    }
  }, [phase, prefersReducedMotion]);

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

      const tr = paletteTransitionRef.current;
      const tc = terrainCacheRef.current;
      tc.width = width;
      tc.height = height;
      tc.dpr = dpr;
      tc.fromPhase = tr.fromPhase;
      tc.toPhase = tr.toPhase;
      tc.to = buildHeroTerrainLayerCache(
        width,
        height,
        tr.toPhase,
        ATMOSPHERIC_PALETTES[tr.toPhase],
        dpr,
      );
      tc.from =
        tr.fromPhase !== tr.toPhase
          ? buildHeroTerrainLayerCache(
              width,
              height,
              tr.fromPhase,
              ATMOSPHERIC_PALETTES[tr.fromPhase],
              dpr,
            )
          : tc.to;
    };

    resize();

    const world = createAtmosphereWorld(width, height);
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
        triggerAuroraPluck(world, nextX, nextY, mouse.vy, width, height);
        if (nextY > height * 0.7) {
          trySpawnMouseLakeRipple(world, nextX, nextY, width, height, performance.now());
        }
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      if (clickX < 0 || clickX > width || clickY < 0 || clickY > height) return;

      // Ưu tiên tương tác thắp sáng Đèn Trời 3D bay vút lên trước khi tạo xung Nova
      if (tryBoostSkyLanternAt(world, clickX, clickY, width, height)) {
        world.novaSceneBoost = Math.min(1, world.novaSceneBoost + 0.35);
        return;
      }

      const isSkyClick = clickY < height * 0.65;
      spawnNovaPulse(
        world,
        clickX,
        clickY,
        isSkyClick ? Math.max(width, height) * 0.52 : 170,
        isSkyClick ? 0.68 : 0.42,
        isSkyClick ? 5.6 : 2.6,
      );
      world.novaSceneBoost = Math.min(1, world.novaSceneBoost + (isSkyClick ? 0.95 : 0.45));
    };

    const drawFrame = (nowMs: number, dtSeconds: number, dtScale: number, animate: boolean) => {
      const tr = paletteTransitionRef.current;
      if (tr.elapsedSec < 0.6) {
        tr.elapsedSec = Math.min(0.6, tr.elapsedSec + dtSeconds);
        const eased = 1 - Math.pow(1 - tr.elapsedSec / 0.6, 3);
        tr.current = interpolateAtmospherePalette(tr.from, tr.to, eased);
      }

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
      const blend = tr.elapsedSec >= 0.6 ? 1 : 1 - Math.pow(1 - tr.elapsedSec / 0.6, 3);
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
        palette: tr.current,
        sprites,
        glowSprites,
        mouse,
        world,
        terrainLayers: tc.to ? { prev: tc.from, next: tc.to, blend } : undefined,
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
      for (const np of world.novaPulses) {
        np.active = false;
      }
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="hero-physics-canvas"
      data-phase={phase}
      data-pipeline-layers="6"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 z-[2] h-full w-full', className)}
    />
  );
}
