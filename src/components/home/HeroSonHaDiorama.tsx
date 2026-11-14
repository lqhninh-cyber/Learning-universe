import { useEffect, useId, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, frameDampFactor } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';

export interface HeroSonHaDioramaProps {
  readonly className?: string;
}

interface CraneSpec {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly opacity: number;
  readonly flapDelaySec: number;
  readonly flapDurationSec: number;
}

interface TerraceCurveSpec {
  readonly id: string;
  readonly d: string;
  readonly rimOpacity: number;
}

interface VillageLanternPoolSpec {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly points: readonly { readonly x: number; readonly y: number; readonly r: number }[];
}

const TERRACE_CURVES: readonly TerraceCurveSpec[] = [
  // Ruộng bậc thang sườn tây Hoàng Liên
  { id: 't-west-1', d: 'M 40 598 Q 165 568 310 592 Q 415 612 520 634', rimOpacity: 0.42 },
  { id: 't-west-2', d: 'M 15 620 Q 150 588 305 614 Q 425 636 550 658', rimOpacity: 0.48 },
  { id: 't-west-3', d: 'M -10 642 Q 145 608 312 636 Q 438 656 575 680', rimOpacity: 0.4 },
  { id: 't-west-4', d: 'M -30 666 Q 130 632 308 660 Q 446 682 590 704', rimOpacity: 0.34 },
  // Ruộng bậc thang sườn đông dãy Phan Xi Păng
  { id: 't-east-1', d: 'M 1010 590 Q 1165 562 1320 582 Q 1460 600 1580 578', rimOpacity: 0.44 },
  { id: 't-east-2', d: 'M 985 614 Q 1150 584 1325 606 Q 1475 626 1615 602', rimOpacity: 0.5 },
  { id: 't-east-3', d: 'M 955 640 Q 1140 608 1332 632 Q 1490 652 1635 628', rimOpacity: 0.42 },
  { id: 't-east-4', d: 'M 935 666 Q 1132 634 1336 658 Q 1502 678 1655 654', rimOpacity: 0.34 },
];

const VILLAGE_LANTERN_POOLS: readonly VillageLanternPoolSpec[] = [
  {
    id: 'muong-hoa-west',
    cx: 268,
    cy: 626,
    rx: 88,
    ry: 24,
    points: [
      { x: 242, y: 623, r: 1.9 },
      { x: 256, y: 628, r: 1.5 },
      { x: 271, y: 624, r: 2.2 },
      { x: 286, y: 629, r: 1.6 },
      { x: 300, y: 625, r: 1.4 },
    ],
  },
  {
    id: 'cat-cat-mid',
    cx: 790,
    cy: 618,
    rx: 76,
    ry: 20,
    points: [
      { x: 768, y: 616, r: 1.7 },
      { x: 785, y: 621, r: 2.1 },
      { x: 803, y: 617, r: 1.5 },
      { x: 816, y: 622, r: 1.4 },
    ],
  },
  {
    id: 'ta-van-east',
    cx: 1265,
    cy: 608,
    rx: 94,
    ry: 24,
    points: [
      { x: 1234, y: 606, r: 1.8 },
      { x: 1252, y: 611, r: 2.2 },
      { x: 1270, y: 605, r: 1.7 },
      { x: 1288, y: 610, r: 1.9 },
      { x: 1304, y: 607, r: 1.4 },
    ],
  },
];

const CRANE_FORMATION: readonly CraneSpec[] = [
  { id: 'c1', x: 642, y: 392, scale: 0.72, opacity: 0.86, flapDelaySec: 0, flapDurationSec: 3.1 },
  {
    id: 'c2',
    x: 684,
    y: 376,
    scale: 0.86,
    opacity: 0.92,
    flapDelaySec: 0.35,
    flapDurationSec: 2.9,
  },
  {
    id: 'c3',
    x: 734,
    y: 364,
    scale: 0.98,
    opacity: 0.96,
    flapDelaySec: 0.7,
    flapDurationSec: 3.3,
  },
  {
    id: 'c4',
    x: 782,
    y: 379,
    scale: 0.82,
    opacity: 0.88,
    flapDelaySec: 1.1,
    flapDurationSec: 2.8,
  },
  {
    id: 'c5',
    x: 822,
    y: 396,
    scale: 0.68,
    opacity: 0.82,
    flapDelaySec: 1.45,
    flapDurationSec: 3.4,
  },
  {
    id: 'c6',
    x: 418,
    y: 446,
    scale: 0.56,
    opacity: 0.72,
    flapDelaySec: 0.55,
    flapDurationSec: 3.2,
  },
  {
    id: 'c7',
    x: 452,
    y: 438,
    scale: 0.64,
    opacity: 0.78,
    flapDelaySec: 1.05,
    flapDurationSec: 2.9,
  },
  {
    id: 'c8',
    x: 1126,
    y: 332,
    scale: 0.58,
    opacity: 0.74,
    flapDelaySec: 0.25,
    flapDurationSec: 3.0,
  },
  {
    id: 'c9',
    x: 1164,
    y: 344,
    scale: 0.5,
    opacity: 0.68,
    flapDelaySec: 0.9,
    flapDurationSec: 3.5,
  },
];

/**
 * Cảnh quan "Biển Mây & Bầu Trời Ngân Hà Trên Đỉnh Hoàng Liên Sơn" 120fps GPU-Composited:
 * - Bầu trời đêm vùng cao chuyển hừng đông dịu (#050B16 -> #0B192C -> #16324F -> #2B4C65 -> #D4A373/25)
 * - Tầng 1: Dãy Phan Xi Păng & Hoàng Liên Sơn sừng sững, mặt sáng ánh trăng (#4A6B82) & mặt tối chàm (#091522)
 * - Tầng 2: Sườn núi trung cảnh, vân ruộng bậc thang lấp lánh ánh đồng & quầng đèn bản làng Tây Bắc
 * - Tầng 3: Rừng tùng & đỗ quyên cổ thụ hai bên sườn núi rung nhẹ theo gió vùng cao
 * - Tầng 4: Đàn chim hạc / chim én sải cánh lướt trên tầng mây mù sáng ánh bạc
 * - Parallax 4 tầng chuẩn 120fps bằng `translate3d` + exponential delta-time damping + IntersectionObserver
 */
export function HeroSonHaDiorama({ className }: HeroSonHaDioramaProps) {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyNeutral = () => {
      for (const ref of [layer1Ref, layer2Ref, layer3Ref, layer4Ref]) {
        if (ref.current) {
          ref.current.style.transform = 'translate3d(0px, 0px, 0px)';
          ref.current.style.backfaceVisibility = 'hidden';
        }
      }
    };

    if (typeof window === 'undefined' || prefersReducedMotion) {
      applyNeutral();
      return;
    }

    for (const ref of [layer1Ref, layer2Ref, layer3Ref, layer4Ref]) {
      if (ref.current) {
        ref.current.style.backfaceVisibility = 'hidden';
      }
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;
    let isVisible = true;
    let isMounted = true;
    let prevNow = performance.now();

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
      const smoothFactor = frameDampFactor(12, dtSeconds);

      currentX += (targetX - currentX) * smoothFactor;
      currentY += (targetY - currentY) * smoothFactor;

      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate3d(${(-currentX * 8).toFixed(2)}px, ${(-currentY * 6).toFixed(2)}px, 0px)`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate3d(${(-currentX * 16).toFixed(2)}px, ${(-currentY * 10).toFixed(2)}px, 0px)`;
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translate3d(${(currentX * 24).toFixed(2)}px, ${(currentY * 14).toFixed(2)}px, 0px)`;
      }
      if (layer4Ref.current) {
        layer4Ref.current.style.transform = `translate3d(${(currentX * 38).toFixed(2)}px, ${(currentY * 20).toFixed(2)}px, 0px)`;
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

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    startLoop();

    return () => {
      isMounted = false;
      window.removeEventListener('mousemove', handleMouseMove);
      observer?.disconnect();
      stopLoop();
    };
  }, [prefersReducedMotion]);

  const skyGradId = `hls-sky-${uid}`;
  const dawnWashId = `hls-dawn-wash-${uid}`;
  const farPeakDarkId = `hls-far-dark-${uid}`;
  const farPeakLitId = `hls-far-lit-${uid}`;
  const farRimGradId = `hls-far-rim-${uid}`;
  const valleyMistId = `hls-valley-mist-${uid}`;
  const midSlopeDarkId = `hls-mid-dark-${uid}`;
  const midSlopeLitId = `hls-mid-lit-${uid}`;
  const terraceRimGradId = `hls-terrace-rim-${uid}`;
  const lanternGlowId = `hls-lantern-glow-${uid}`;
  const pineSilhouetteId = `hls-pine-sil-${uid}`;
  const cloudFloorGradId = `hls-cloud-floor-${uid}`;

  return (
    <div
      ref={containerRef}
      data-testid="son-ha-diorama"
      data-landscape="hoang-lien-son"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden select-none', className)}
      style={{
        background:
          'linear-gradient(180deg, #050B16 0%, #0B192C 26%, #16324F 52%, #2B4C65 76%, #1B2D41 90%, #0E1B2B 100%)',
      }}
    >
      {/* TẦNG 1: Bầu trời Ngân Hà vùng cao & Dãy núi Phan Xi Păng hùng vĩ (-mx*8) */}
      <div
        ref={layer1Ref}
        data-testid="son-ha-layer-1"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            {/* Bầu trời đêm vùng cao chuyển hừng đông ấm dịu ở chân mây */}
            <linearGradient id={skyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#050B16" />
              <stop offset="28%" stopColor="#0B192C" />
              <stop offset="56%" stopColor="#16324F" />
              <stop offset="78%" stopColor="#2B4C65" />
              <stop offset="92%" stopColor="#D4A373" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1B2E42" />
            </linearGradient>

            {/* Ánh tím hừng đông dịu tỏa sau yên ngựa Phan Xi Păng */}
            <radialGradient id={dawnWashId} cx="64%" cy="62%" r="48%">
              <stop offset="0%" stopColor="#D4A373" stopOpacity="0.25" />
              <stop offset="42%" stopColor="#4A6B82" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0B192C" stopOpacity="0" />
            </radialGradient>

            {/* Đá núi Phan Xi Păng mặt tối chàm sâu & mặt sáng ánh sao bạc */}
            <linearGradient id={farPeakDarkId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#132539" />
              <stop offset="55%" stopColor="#091522" />
              <stop offset="100%" stopColor="#050B16" />
            </linearGradient>
            <linearGradient id={farPeakLitId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4A6B82" stopOpacity="0.88" />
              <stop offset="52%" stopColor="#2B4C65" stopOpacity="0.56" />
              <stop offset="100%" stopColor="#091522" stopOpacity="0.16" />
            </linearGradient>
            <linearGradient id={farRimGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94B3C8" stopOpacity="0.18" />
              <stop offset="50%" stopColor="#C5D3DC" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#D4A373" stopOpacity="0.32" />
            </linearGradient>

            {/* Sương thung lũng lững lờ dưới chân núi */}
            <linearGradient id={valleyMistId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C5D3DC" stopOpacity="0" />
              <stop offset="52%" stopColor="#C5D3DC" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#E6E2D6" stopOpacity="0.48" />
            </linearGradient>
          </defs>

          {/* Lớp bầu trời đa sắc */}
          <rect x="-80" y="-40" width="1760" height="960" fill={`url(#${skyGradId})`} />
          <ellipse
            data-testid="hoang-lien-dawn-glow"
            cx="1020"
            cy="550"
            rx="780"
            ry="320"
            fill={`url(#${dawnWashId})`}
          />

          {/* Dãy Hoàng Liên Sơn viễn cảnh cực xa (bên trái thấp để giữ chữ sáng, bên phải vươn cao Phan Xi Păng) */}
          <g data-testid="fansipan-peaks">
            {/* Mạch núi hậu cảnh mờ sương */}
            <path
              d="M -100 545 L 40 488 L 155 516 L 295 452 L 420 492 L 560 442 L 690 474 L 835 398 L 945 436 L 1075 344 L 1185 388 L 1320 302 L 1435 358 L 1545 316 L 1700 378 L 1700 760 L -100 760 Z"
              fill="#112438"
              opacity="0.72"
            />

            {/* Khối đỉnh Phan Xi Păng & Hoàng Liên Sơn chính sắc cạnh */}
            <path
              d="M -100 592 L 22 528 L 138 552 L 265 496 L 382 536 L 510 474 L 622 512 L 758 432 L 866 476 L 992 384 L 1094 426 L 1226 322 L 1328 386 L 1446 312 L 1564 368 L 1700 330 L 1700 780 L -100 780 Z"
              fill={`url(#${farPeakDarkId})`}
            />

            {/* Mặt đón ánh trăng sao xanh bạc (#4A6B82) bên sườn đón sáng */}
            <path
              d="M 265 496 L 332 545 L 382 536 L 315 620 L 245 612 Z
                 M 510 474 L 584 522 L 622 512 L 548 616 L 478 602 Z
                 M 758 432 L 830 486 L 866 476 L 788 604 L 716 588 Z
                 M 992 384 L 1068 438 L 1094 426 L 1018 594 L 944 576 Z
                 M 1226 322 L 1304 398 L 1328 386 L 1254 584 L 1172 562 Z
                 M 1446 312 L 1528 382 L 1564 368 L 1482 574 L 1396 552 Z"
              fill={`url(#${farPeakLitId})`}
            />

            {/* Đường viền sống núi lấp lánh ánh bạc chân trời */}
            <path
              d="M -40 562 L 22 528 L 138 552 L 265 496 L 382 536 L 510 474 L 622 512 L 758 432 L 866 476 L 992 384 L 1094 426 L 1226 322 L 1328 386 L 1446 312 L 1564 368 L 1680 336"
              fill="none"
              stroke={`url(#${farRimGradId})`}
              strokeWidth="1.3"
            />
          </g>

          {/* Màn sương thung lũng lững lờ dưới chân dãy Hoàng Liên */}
          <rect x="-80" y="510" width="1760" height="230" fill={`url(#${valleyMistId})`} />
        </svg>
      </div>

      {/* TẦNG 2: Sườn núi trung cảnh, vân ruộng bậc thang & ánh đèn bản làng Tây Bắc (-mx*16) */}
      <div
        ref={layer2Ref}
        data-testid="son-ha-layer-2"
        className="absolute -inset-8 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={midSlopeDarkId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#14293F" />
              <stop offset="55%" stopColor="#091522" />
              <stop offset="100%" stopColor="#060E18" />
            </linearGradient>
            <linearGradient id={midSlopeLitId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#355873" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#091522" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id={terraceRimGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#D4A373" stopOpacity="0.14" />
              <stop offset="50%" stopColor="#F6D383" stopOpacity="0.52" />
              <stop offset="100%" stopColor="#94B3C8" stopOpacity="0.22" />
            </linearGradient>
            <radialGradient id={lanternGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F6D383" stopOpacity="0.62" />
              <stop offset="48%" stopColor="#D4A373" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Hai sườn núi trung cảnh ôm thung lũng Mường Hoa - Sa Pa */}
          <g data-testid="midground-slopes">
            <path
              d="M -100 620 Q 115 546 310 582 Q 495 618 675 668 L 675 840 L -100 840 Z"
              fill={`url(#${midSlopeDarkId})`}
            />
            <path
              d="M -60 612 Q 120 554 298 584 L 240 658 L -60 658 Z"
              fill={`url(#${midSlopeLitId})`}
            />

            <path
              d="M 880 676 Q 1085 604 1270 572 Q 1455 542 1700 582 L 1700 840 L 880 840 Z"
              fill={`url(#${midSlopeDarkId})`}
            />
            <path
              d="M 960 650 Q 1160 588 1345 568 L 1388 648 L 960 675 Z"
              fill={`url(#${midSlopeLitId})`}
            />
          </g>

          {/* Các đường đồng mức ruộng bậc thang phản chiếu ánh trăng & hừng đông */}
          <g data-testid="terraced-fields">
            {TERRACE_CURVES.map((curve) => (
              <path
                key={curve.id}
                d={curve.d}
                fill="none"
                stroke={`url(#${terraceRimGradId})`}
                strokeWidth="1.25"
                strokeOpacity={curve.rimOpacity}
                strokeLinecap="round"
              />
            ))}
          </g>

          {/* Quầng sáng mờ ảo ánh đèn bản làng Tây Bắc ẩn dưới sương thung lũng */}
          <g data-testid="village-lantern-glow">
            {VILLAGE_LANTERN_POOLS.map((pool) => (
              <g key={pool.id}>
                <ellipse
                  cx={pool.cx}
                  cy={pool.cy}
                  rx={pool.rx}
                  ry={pool.ry}
                  fill={`url(#${lanternGlowId})`}
                />
                {pool.points.map((pt, idx) => (
                  <circle
                    key={`${pool.id}-${idx}`}
                    cx={pt.x}
                    cy={pt.y}
                    r={pt.r}
                    fill="#FDE68A"
                    opacity="0.86"
                  />
                ))}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* TẦNG 3: Rừng tùng & đỗ quyên cổ thụ hai bên sườn núi rung nhẹ trong gió (+mx*24) */}
      <div
        ref={layer3Ref}
        data-testid="son-ha-layer-3"
        className="absolute -inset-9 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={pineSilhouetteId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#182C3D" />
              <stop offset="48%" stopColor="#091522" />
              <stop offset="100%" stopColor="#050B16" />
            </linearGradient>
          </defs>

          <g data-testid="hoang-lien-foliage">
            {/* Cụm núi & rừng tùng đỗ quyên sườn trái */}
            <path
              d="M -110 740 L -110 612 Q -25 588 64 622 Q 138 652 212 722 L 212 850 L -110 850 Z"
              fill={`url(#${pineSilhouetteId})`}
            />
            <g className={prefersReducedMotion ? undefined : 'lu-canopy-sway'}>
              {/* Cây tùng núi cao trái */}
              <path
                d="M 18 654 L 30 578 L 42 654 Z M 8 628 L 30 582 L 52 628 Z M 13 606 L 30 568 L 47 606 Z"
                fill="#0C1B2A"
              />
              <path
                d="M 76 668 L 88 594 L 100 668 Z M 67 642 L 88 596 L 109 642 Z M 72 618 L 88 584 L 104 618 Z"
                fill="#091522"
              />
              {/* Tán đỗ quyên cổ thụ bên trái */}
              <path
                d="M -42 634 Q -18 598 16 616 Q 44 600 66 632 Q 36 654 -42 634 Z"
                fill="#112334"
              />
            </g>

            {/* Cụm núi & rừng tùng đỗ quyên sườn phải */}
            <path
              d="M 1368 730 Q 1448 648 1538 614 Q 1625 584 1710 606 L 1710 850 L 1368 850 Z"
              fill={`url(#${pineSilhouetteId})`}
            />
            <g className={prefersReducedMotion ? undefined : 'lu-canopy-sway'}>
              <path
                d="M 1492 656 L 1506 572 L 1520 656 Z M 1480 628 L 1506 576 L 1532 628 Z M 1486 604 L 1506 562 L 1526 604 Z"
                fill="#091522"
              />
              <path
                d="M 1554 646 L 1568 564 L 1582 646 Z M 1544 618 L 1568 568 L 1592 618 Z M 1550 594 L 1568 552 L 1586 594 Z"
                fill="#0C1B2A"
              />
              {/* Tán đỗ quyên cổ thụ bên phải */}
              <path
                d="M 1424 662 Q 1456 624 1492 640 Q 1528 616 1556 648 Q 1514 674 1424 662 Z"
                fill="#112334"
              />
            </g>
          </g>
        </svg>
      </div>

      {/* TẦNG 4: Đàn chim hạc / én sải cánh bay lướt qua tầng mây bạc (+mx*38) */}
      <div
        ref={layer4Ref}
        data-testid="son-ha-layer-4"
        className="absolute -inset-10 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            {/* Dải sương nền dịu phía chân tầng mây chuẩn bị nối vào 5 lớp mây Canvas */}
            <linearGradient id={cloudFloorGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C5D3DC" stopOpacity="0" />
              <stop offset="48%" stopColor="#E6E2D6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#F8F6F0" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          <rect x="-80" y="650" width="1760" height="260" fill={`url(#${cloudFloorGradId})`} />

          {/* Đàn chim hạc / chim én bay liệng trên biển mây */}
          <g data-testid="hoang-lien-cranes">
            {CRANE_FORMATION.map((crane) => (
              <g
                key={crane.id}
                transform={`translate(${crane.x}, ${crane.y}) scale(${crane.scale})`}
                opacity={crane.opacity}
              >
                <path
                  d="M -20 4 Q -10 -7 0 -1 Q 10 -7 20 4 Q 10 -2 0 1.5 Q -10 -2 -20 4 Z"
                  fill="#E6E2D6"
                  stroke="#F8F6F0"
                  strokeWidth="0.65"
                  className={prefersReducedMotion ? undefined : 'lu-canopy-sway'}
                  style={
                    prefersReducedMotion
                      ? undefined
                      : {
                          animationDelay: `${crane.flapDelaySec}s`,
                          animationDuration: `${crane.flapDurationSec}s`,
                        }
                  }
                />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
