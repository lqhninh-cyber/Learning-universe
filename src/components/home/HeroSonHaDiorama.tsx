import { useEffect, useId, useRef } from 'react';
import { JADE_MIST_DAWN_PALETTE, rgbString } from '@/components/home/atmosphereThemes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, frameDampFactor } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

export interface HeroSonHaDioramaProps {
  readonly className?: string;
}

/**
 * Nền Bầu Trời "Bình Minh Bạch Ngọc & Sơn Thủy Sương Lam" cùng lớp phủ tương phản AAA
 * cho Cảnh Quan Sơn Thủy Khắc Đồng & Thiên Cầu Đông Sơn 120fps:
 * - Chuyển sắc bầu trời: #EDF3F1 (Bạch Ngọc Sương) -> #DDEAE6 (Lam Ngọc Dịu) -> #F6EFE0 (Nắng Mai Vàng Kem)
 * - Dải sương mặt hồ 14% đáy Hero (#DDE7E4 -> #EDF2F0)
 * - Quầng nền sáng khuếch tán cực nhẹ bảo toàn tương phản ≥ 7:1 phía sau cột chữ Hero & Hộp Danh Ngôn
 */
export function HeroSonHaDiorama({ className }: HeroSonHaDioramaProps = {}) {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyNeutral = () => {
      if (layer1Ref.current) {
        layer1Ref.current.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
        layer1Ref.current.style.backfaceVisibility = 'hidden';
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
      data-phase="binh-minh-bach-ngoc"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden select-none', className)}
      style={{
        background: `linear-gradient(180deg, ${rgbString(JADE_MIST_DAWN_PALETTE.sky0)} 0%, ${rgbString(JADE_MIST_DAWN_PALETTE.sky2)} 52%, ${rgbString(JADE_MIST_DAWN_PALETTE.sky4)} 100%)`,
      }}
    >
      {/* TẦNG 1 (z-[1]): Bầu trời Sương Ngọc Ban Mai & quầng nắng chân trời sau núi */}
      <div
        ref={layer1Ref}
        data-testid="son-ha-layer-1"
        className="pointer-events-none absolute -inset-6 z-[1] will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={skyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EDF3F1" />
              <stop offset="50%" stopColor="#DDEAE6" />
              <stop offset="86%" stopColor="#F6EFE0" />
              <stop offset="100%" stopColor="#EDF2F0" />
            </linearGradient>

            <radialGradient id={dawnWashId} cx="72%" cy="36%" r="52%">
              <stop offset="0%" stopColor="#FFF6E0" stopOpacity="0.88" />
              <stop offset="48%" stopColor="#DAB676" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#DDEAE6" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x="-80" y="-40" width="1760" height="960" fill={`url(#${skyGradId})`} />
          <ellipse
            data-testid="hoang-lien-dawn-glow"
            cx="1140"
            cy="340"
            rx="780"
            ry="380"
            fill={`url(#${dawnWashId})`}
          />

          {/* Mỏ neo ngữ nghĩa cho địa hình 5 tầng sương mù & đường đồng mức trắc địa trên Canvas */}
          <g data-testid="fansipan-peaks" data-terrain-mode="topographic-dong-son-6layer" />
        </svg>
      </div>

      {/* Dải sương sáng mặt hồ ở 14% cuối màn hình (#DDE7E4 -> #EDF2F0) */}
      <div
        data-testid="hero-bottom-mist-transition"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[14%]"
        style={{
          background:
            'linear-gradient(180deg, rgba(221, 231, 228, 0) 0%, rgba(221, 231, 228, 0.72) 56%, #EDF2F0 100%)',
        }}
      />

      {/* Quầng nền sáng khuếch tán cực nhẹ phía sau cột chữ bên trái (WCAG AAA ≥ 7:1) */}
      <div
        data-testid="hero-text-contrast-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-full lg:w-[60%]"
        style={{
          background:
            'radial-gradient(ellipse at 24% 48%, rgba(237, 243, 241, 0.84) 0%, rgba(237, 243, 241, 0.48) 54%, rgba(237, 243, 241, 0) 84%)',
        }}
      />

      {/* Quầng nền sáng dịu phía sau Hộp Danh Ngôn bên phải */}
      <div
        data-testid="hero-quote-contrast-scrim"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-full lg:w-[46%]"
        style={{
          background:
            'radial-gradient(ellipse at 74% 72%, rgba(237, 243, 241, 0.52) 0%, rgba(237, 243, 241, 0.2) 52%, rgba(237, 243, 241, 0) 80%)',
        }}
      />
    </div>
  );
}
