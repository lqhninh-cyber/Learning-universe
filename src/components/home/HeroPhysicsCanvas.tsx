import { useEffect, useRef } from 'react';
import {
  buildAtmosphereSpriteCache,
  createAtmosphereWorld,
  renderAtmosphereFrame,
  type AtmosphereMouseState,
} from '@/components/home/heroAtmosphereEngine';
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
 * Canvas 2D Engine Khí Quyển 3D Hoàng Liên Sơn 120fps (`dtScale` + `OffscreenCanvas` cache):
 * - 8 luồng tia sáng thể tích xuyên núi (`globalCompositeOperation = 'screen'`) dịch chuyển đối xứng chuột
 * - Vòng thiên văn Đông Sơn chìm (`opacity: 0.12`) xoay quanh sao Bắc Đẩu + Dải Ngân Hà
 * - Tương tác nối sao thời gian thực `O(N)` trong bán kính 160px & Celestial Nova Pulse khi click bầu trời
 * - Thác Bạc 120fps đổ từ vách núi xuống chân thác bốc sương sáng & ruộng bậc thang phản quang ánh sao
 * - Biển mây thể tích 4 lớp cache, chớp sáng ẩn mây, rẽ mây vật lý 150px, 3 dải lụa gió & 28 cánh hoa đỗ quyên 3D
 */
export function HeroPhysicsCanvas({ className }: HeroPhysicsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

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
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      if (clickX < 0 || clickX > width || clickY < 0 || clickY > height) return;

      // Phát xung sóng ánh sáng thiên hà (Celestial Nova Pulse) làm bừng sáng sao, đỉnh núi & ruộng bậc thang
      if (world.novaPulses.length >= 6) {
        world.novaPulses.shift();
      }
      const isSkyClick = clickY < height * 0.65;
      world.novaPulses.push({
        x: clickX,
        y: clickY,
        radius: 10,
        maxRadius: isSkyClick ? Math.max(width, height) * 0.52 : 170,
        alpha: isSkyClick ? 0.68 : 0.42,
        speed: isSkyClick ? 5.6 : 2.6,
      });
      world.novaSceneBoost = Math.min(1, world.novaSceneBoost + (isSkyClick ? 0.95 : 0.45));
    };

    const drawFrame = (nowMs: number, dtSeconds: number, dtScale: number, animate: boolean) => {
      if (animate) {
        const smooth = frameDampFactor(10, dtSeconds);
        mouse.normX += (targetNormX - mouse.normX) * smooth;
        mouse.normY += (targetNormY - mouse.normY) * smooth;
        const velDecay = Math.pow(0.84, dtScale);
        mouse.vx *= velDecay;
        mouse.vy *= velDecay;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderAtmosphereFrame({
        ctx,
        width,
        height,
        tSec: nowMs / 1000,
        dtSeconds,
        dtScale,
        animate,
        sprites,
        glowSprites,
        mouse,
        world,
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

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    window.addEventListener('resize', resize, { passive: true });
    startLoop();

    return () => {
      isDisposed = true;
      stopLoop();
      intersectionObserver?.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
      world.novaPulses.length = 0;
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="hero-physics-canvas"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
}
