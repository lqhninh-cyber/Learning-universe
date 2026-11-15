import { useEffect, useId, useRef } from 'react';
import {
  ATMOSPHERIC_PALETTES,
  interpolateAtmospherePalette,
  rgbString,
  type AtmospherePalette,
  type AtmosphericPhase,
} from '@/components/home/atmosphereThemes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, frameDampFactor } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

export interface HeroSonHaDioramaProps {
  readonly phase?: AtmosphericPhase;
  readonly className?: string;
}

function applyPaletteCssVars(el: HTMLElement, p: AtmospherePalette): void {
  el.style.setProperty('--hls-sky-0', rgbString(p.sky0));
  el.style.setProperty('--hls-sky-1', rgbString(p.sky1));
  el.style.setProperty('--hls-sky-2', rgbString(p.sky2));
  el.style.setProperty('--hls-sky-3', rgbString(p.sky3));
  el.style.setProperty('--hls-sky-4', rgbString(p.sky4));
  el.style.setProperty('--hls-dawn-core', rgbString(p.dawnCore));
  el.style.setProperty('--hls-dawn-edge', rgbString(p.dawnEdge));
  el.style.setProperty('--hls-bottom-mist', rgbString(p.bottomMistDeep));
  el.style.setProperty('--hls-scrim-alpha', p.contrastScrimAlpha.toFixed(3));
}

/**
 * Nền Bầu Trời Đa Thời Khắc & Lớp Phủ Tương Phản AAA cho Cảnh Quan
 * "Sơn Thủy Trắc Địa Đại Việt & Thiên Cầu Đông Sơn" (120fps):
 * - Chuyển đổi bảng màu 600ms giữa 4 thời khắc (Đêm Ngân Hà · Bình Minh · Nắng Ngọc · Hoàng Hôn)
 * - Loại bỏ hoàn toàn các hình chim chữ M SVG, núi viền cứng và chi tiết ngoại lai
 * - Đặt 2 lớp phủ tương phản WCAG > 10:1 ở z-10 (trên Canvas z-[2], dưới UI z-20)
 */
export function HeroSonHaDiorama({ phase = 'dem-ngan-ha', className }: HeroSonHaDioramaProps) {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);

  const transitionRef = useRef<{
    from: AtmospherePalette;
    to: AtmospherePalette;
    current: AtmospherePalette;
    elapsedSec: number;
  }>({
    from: ATMOSPHERIC_PALETTES[phase],
    to: ATMOSPHERIC_PALETTES[phase],
    current: ATMOSPHERIC_PALETTES[phase],
    elapsedSec: 0.6,
  });

  useEffect(() => {
    const target = ATMOSPHERIC_PALETTES[phase];
    transitionRef.current = {
      from: transitionRef.current.current,
      to: target,
      current: prefersReducedMotion ? target : transitionRef.current.current,
      elapsedSec: prefersReducedMotion ? 0.6 : 0,
    };
    if (containerRef.current && prefersReducedMotion) {
      applyPaletteCssVars(containerRef.current, target);
    }
  }, [phase, prefersReducedMotion]);

  useEffect(() => {
    const applyNeutral = () => {
      if (layer1Ref.current) {
        layer1Ref.current.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
        layer1Ref.current.style.backfaceVisibility = 'hidden';
      }
      if (containerRef.current) {
        applyPaletteCssVars(containerRef.current, transitionRef.current.to);
      }
    };

    if (typeof window === 'undefined' || prefersReducedMotion) {
      applyNeutral();
      return;
    }

    if (layer1Ref.current) {
      layer1Ref.current.style.backfaceVisibility = 'hidden';
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let targetScroll = 0;
    let currentScroll = 0;
    let rafId = 0;
    let isVisible = true;
    let isMounted = true;
    let prevNow = performance.now();

    const updateTargetScroll = () => {
      const heroHeight = Math.max(
        containerRef.current?.offsetHeight || window.innerHeight || 900,
        360,
      );
      targetScroll = Math.min(Math.max(window.scrollY / heroHeight, 0), 1);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const vw = Math.max(window.innerWidth, 1);
      const vh = Math.max(window.innerHeight, 1);
      targetX = (event.clientX / vw - 0.5) * 2;
      targetY = (event.clientY / vh - 0.5) * 2;
    };

    const tick = (now: number) => {
      if (!isMounted || !isVisible) {
        rafId = 0;
        return;
      }

      const { dtSeconds } = computeFrameDelta(now, prevNow);
      prevNow = now;

      const tr = transitionRef.current;
      if (tr.elapsedSec < 0.6 && containerRef.current) {
        tr.elapsedSec = Math.min(0.6, tr.elapsedSec + dtSeconds);
        const eased = 1 - Math.pow(1 - tr.elapsedSec / 0.6, 3);
        tr.current = interpolateAtmospherePalette(tr.from, tr.to, eased);
        applyPaletteCssVars(containerRef.current, tr.current);
      }

      const smoothMouse = frameDampFactor(12, dtSeconds);
      const smoothScroll = frameDampFactor(14, dtSeconds);
      currentX += (targetX - currentX) * smoothMouse;
      currentY += (targetY - currentY) * smoothMouse;
      currentScroll += (targetScroll - currentScroll) * smoothScroll;

      const sp = currentScroll;
      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate3d(${(-currentX * 8).toFixed(2)}px, ${(-currentY * 4 - sp * 10).toFixed(2)}px, 0px) scale(${(1 + sp * 0.04).toFixed(4)})`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (rafId !== 0 || !isMounted) return;
      prevNow = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && containerRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return;
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startLoop();
          } else {
            stopLoop();
          }
        },
        { threshold: 0.02 },
      );
      observer.observe(containerRef.current);
    }

    updateTargetScroll();
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', updateTargetScroll, { passive: true });
    startLoop();

    return () => {
      isMounted = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', updateTargetScroll);
      observer?.disconnect();
      stopLoop();
    };
  }, [prefersReducedMotion]);

  const skyGradId = `hls-sky-${uid}`;
  const dawnWashId = `hls-dawn-wash-${uid}`;

  return (
    <div
      ref={containerRef}
      data-testid="son-ha-diorama"
      data-landscape="hoang-lien-son"
      data-phase={phase}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden select-none', className)}
      style={{
        background:
          'linear-gradient(180deg, var(--hls-sky-0, #050B16) 0%, var(--hls-sky-1, #0B192C) 28%, var(--hls-sky-2, #16324F) 54%, var(--hls-sky-3, #2B4C65) 78%, var(--hls-sky-4, #1B2E42) 100%)',
      }}
    >
      {/* TẦNG 1 (z-[1]): Bầu trời đa thời khắc & quầng ánh sáng chân trời phía sau Canvas trắc địa */}
      <div
        ref={layer1Ref}
        data-testid="son-ha-layer-1"
        className="pointer-events-none absolute -inset-6 z-[1] will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={skyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--hls-sky-0, #050B16)" />
              <stop offset="28%" stopColor="var(--hls-sky-1, #0B192C)" />
              <stop offset="56%" stopColor="var(--hls-sky-2, #16324F)" />
              <stop offset="78%" stopColor="var(--hls-sky-3, #2B4C65)" />
              <stop offset="100%" stopColor="var(--hls-sky-4, #1B2E42)" />
            </linearGradient>

            <radialGradient id={dawnWashId} cx="58%" cy="54%" r="50%">
              <stop offset="0%" stopColor="var(--hls-dawn-core, #E5B869)" stopOpacity="0.42" />
              <stop offset="46%" stopColor="var(--hls-dawn-edge, #5C82A6)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--hls-sky-1, #0B192C)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="-80" y="-40" width="1760" height="960" fill={`url(#${skyGradId})`} />
          <ellipse
            data-testid="hoang-lien-dawn-glow"
            cx="930"
            cy="495"
            rx="780"
            ry="320"
            fill={`url(#${dawnWashId})`}
          />

          {/* Mỏ neo ngữ nghĩa cho địa hình 5 tầng sương mù & đường đồng mức trắc địa trên Canvas */}
          <g data-testid="fansipan-peaks" data-terrain-mode="topographic-dong-son-6layer" />
        </svg>
      </div>

      {/* Dải hòa tan 18% đáy Hero (z-10) nối mặt hồ sương khói xuống Screen 2 (#121B28) */}
      <div
        data-testid="hero-bottom-mist-transition"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[18%]"
        style={{
          background:
            'linear-gradient(180deg, rgba(17, 34, 51, 0) 0%, color-mix(in srgb, var(--hls-bottom-mist, #112233) 68%, transparent) 62%, #121B28 100%)',
        }}
      />

      {/* Lớp phủ bảo vệ độ tương phản AAA (> 10:1) phía sau cụm Tuyên ngôn bên trái (z-10) */}
      <div
        data-testid="hero-text-contrast-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-full lg:w-[62%]"
        style={{
          opacity: 'var(--hls-scrim-alpha, 0.36)',
          background:
            'radial-gradient(ellipse at 24% 48%, rgba(5, 11, 22, 0.92) 0%, rgba(5, 11, 22, 0.64) 52%, rgba(5, 11, 22, 0) 84%)',
        }}
      />

      {/* Lớp phủ bảo vệ độ tương phản AAA (> 10:1) phía sau Thẻ Danh Ngôn bên phải (z-10) */}
      <div
        data-testid="hero-quote-contrast-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-full lg:w-[48%]"
        style={{
          opacity: 'var(--hls-scrim-alpha, 0.36)',
          background:
            'radial-gradient(ellipse at 74% 70%, rgba(5, 11, 22, 0.90) 0%, rgba(5, 11, 22, 0.60) 48%, rgba(5, 11, 22, 0) 80%)',
        }}
      />
    </div>
  );
}
