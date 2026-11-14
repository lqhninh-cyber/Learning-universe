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

interface TerracePoolSpec {
  readonly id: string;
  readonly fillPath: string;
  readonly rimPath: string;
  readonly opacity: number;
}

interface FacetSpec {
  readonly id: string;
  readonly points: string;
  readonly tone: 'celestial' | 'dawn' | 'mid' | 'abyss';
}

interface VillageLanternPoolSpec {
  readonly id: string;
  readonly cx: number;
  readonly cy: number;
  readonly rx: number;
  readonly ry: number;
  readonly points: readonly { readonly x: number; readonly y: number; readonly r: number }[];
}

/**
 * Các mặt vách đá 3D đa diện (3D Faceted Ridge Shading) tạo khối địa chất sắc nét cho dãy Phan Xi Păng:
 * - celestial (#5C82A6): Mặt đá đón ánh xanh bạc từ Dải Ngân Hà
 * - dawn (#E5B869): Sống núi và sườn đông đón ánh vàng hừng đông
 * - mid (#13283F): Sườn trung gian chìm trong sương lam
 * - abyss (#07111E): Hẻm vực tối sâu tạo chiều sâu 3D
 */
const MOUNTAIN_3D_FACETS: readonly FacetSpec[] = [
  // Đỉnh Tây Bắc (giữ thấp thoáng bên trái cột chữ)
  { id: 'f-w1-a', points: '125,468 42,585 135,585', tone: 'celestial' },
  { id: 'f-w1-b', points: '125,468 135,585 215,548', tone: 'abyss' },
  { id: 'f-w2-a', points: '312,422 208,548 308,556', tone: 'celestial' },
  { id: 'f-w2-b', points: '312,422 308,556 392,512', tone: 'abyss' },
  { id: 'f-w2-rim', points: '312,422 365,478 392,512 332,474', tone: 'dawn' },

  // Khối Trung Cảnh Tây & Yên Ngựa Thác Bạc
  { id: 'f-c1-a', points: '548,374 412,518 538,532', tone: 'celestial' },
  { id: 'f-c1-b', points: '548,374 538,532 648,476', tone: 'abyss' },
  { id: 'f-c1-c', points: '548,374 620,440 538,532', tone: 'mid' },
  { id: 'f-c2-a', points: '712,356 618,478 726,462', tone: 'celestial' },
  { id: 'f-c2-dawn', points: '712,356 756,422 726,462', tone: 'dawn' },

  // Đỉnh Chính Phan Xi Păng (vươn cao phía trung tâm – phải)
  { id: 'f-p1-a', points: '1018,266 868,452 998,468', tone: 'celestial' },
  { id: 'f-p1-dawn', points: '1018,266 1088,372 998,468', tone: 'dawn' },
  { id: 'f-p1-b', points: '1018,266 1138,412 1088,372', tone: 'abyss' },
  { id: 'f-p1-deep', points: '998,468 1088,372 1148,510', tone: 'abyss' },

  // Khối Đông Phan Xi Păng & Ngũ Chỉ Sơn
  { id: 'f-e1-a', points: '1262,286 1135,418 1244,442', tone: 'celestial' },
  { id: 'f-e1-dawn', points: '1262,286 1336,368 1244,442', tone: 'dawn' },
  { id: 'f-e1-b', points: '1262,286 1392,396 1336,368', tone: 'abyss' },
  { id: 'f-e2-a', points: '1478,274 1372,396 1468,418', tone: 'celestial' },
  { id: 'f-e2-dawn', points: '1478,274 1558,348 1468,418', tone: 'dawn' },
  { id: 'f-e2-b', points: '1478,274 1640,368 1558,348', tone: 'abyss' },
];

/**
 * Các dải ruộng bậc thang mùa nước đổ uốn lượn mềm mại dọc sườn đồi trung cảnh gần:
 * vừa giữ mảng mặt nước phản chiếu (`fillPath`) vừa vẽ viền phản quang ánh sao (`rimPath`).
 */
const TERRACE_WATER_POOLS: readonly TerracePoolSpec[] = [
  {
    id: 'tp-west-1',
    fillPath:
      'M 15 604 Q 155 574 315 596 Q 425 616 530 638 L 518 648 Q 410 626 302 606 Q 145 585 15 614 Z',
    rimPath: 'M 15 604 Q 155 574 315 596 Q 425 616 530 638',
    opacity: 0.62,
  },
  {
    id: 'tp-west-2',
    fillPath:
      'M -12 628 Q 148 594 310 622 Q 434 642 562 666 L 548 677 Q 422 652 298 632 Q 138 606 -12 638 Z',
    rimPath: 'M -12 628 Q 148 594 310 622 Q 434 642 562 666',
    opacity: 0.7,
  },
  {
    id: 'tp-west-3',
    fillPath:
      'M -30 654 Q 140 618 318 646 Q 445 668 585 692 L 570 704 Q 432 680 305 656 Q 132 630 -30 664 Z',
    rimPath: 'M -30 654 Q 140 618 318 646 Q 445 668 585 692',
    opacity: 0.56,
  },
  {
    id: 'tp-east-1',
    fillPath:
      'M 1015 592 Q 1168 564 1325 584 Q 1468 602 1590 578 L 1582 590 Q 1462 612 1318 594 Q 1162 574 1015 602 Z',
    rimPath: 'M 1015 592 Q 1168 564 1325 584 Q 1468 602 1590 578',
    opacity: 0.64,
  },
  {
    id: 'tp-east-2',
    fillPath:
      'M 985 618 Q 1152 586 1330 608 Q 1480 628 1620 602 L 1612 614 Q 1474 638 1322 618 Q 1146 596 985 628 Z',
    rimPath: 'M 985 618 Q 1152 586 1330 608 Q 1480 628 1620 602',
    opacity: 0.72,
  },
  {
    id: 'tp-east-3',
    fillPath:
      'M 955 644 Q 1142 610 1336 634 Q 1495 654 1640 628 L 1630 640 Q 1488 666 1328 644 Q 1136 620 955 655 Z',
    rimPath: 'M 955 644 Q 1142 610 1336 634 Q 1495 654 1640 628',
    opacity: 0.58,
  },
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
    cx: 858,
    cy: 620,
    rx: 76,
    ry: 20,
    points: [
      { x: 836, y: 618, r: 1.7 },
      { x: 853, y: 623, r: 2.1 },
      { x: 871, y: 619, r: 1.5 },
      { x: 884, y: 624, r: 1.4 },
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
 * Cảnh quan "Biển Mây & Ngân Hà Hoàng Liên Sơn 3D" 120fps GPU-Composited:
 * - Tầng 1: Khối núi Phan Xi Păng 3D đa diện với mặt vách đón ánh xanh bạc (#5C82A6), vàng hừng đông (#E5B869) & hẻm vực tối sâu (#07111E)
 * - Tầng 2: Hẻm núi Thác Bạc (khoảng thoáng giữa cột chữ và khung Di sản), thung lũng ruộng bậc thang mùa nước đổ phản chiếu ánh sao & đèn bản làng
 * - Tầng 3: Rừng tùng & đỗ quyên cổ thụ hai bên sườn núi rung nhẹ theo gió
 * - Tầng 4: Đàn chim hạc / én sải cánh bay lướt qua tầng mây bạc
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
  const facetAbyssGradId = `hls-facet-abyss-${uid}`;
  const facetMidGradId = `hls-facet-mid-${uid}`;
  const facetCelestialGradId = `hls-facet-celestial-${uid}`;
  const facetDawnGradId = `hls-facet-dawn-${uid}`;
  const farRimGradId = `hls-far-rim-${uid}`;
  const valleyMistId = `hls-valley-mist-${uid}`;
  const midSlopeDarkId = `hls-mid-dark-${uid}`;
  const midSlopeLitId = `hls-mid-lit-${uid}`;
  const waterfallStreamGradId = `hls-waterfall-stream-${uid}`;
  const waterfallMistId = `hls-waterfall-mist-${uid}`;
  const terracePoolGradId = `hls-terrace-pool-${uid}`;
  const terraceRimGradId = `hls-terrace-rim-${uid}`;
  const lanternGlowId = `hls-lantern-glow-${uid}`;
  const pineSilhouetteId = `hls-pine-sil-${uid}`;
  const cloudFloorGradId = `hls-cloud-floor-${uid}`;

  const facetFillUrl = (tone: FacetSpec['tone']): string => {
    switch (tone) {
      case 'celestial':
        return `url(#${facetCelestialGradId})`;
      case 'dawn':
        return `url(#${facetDawnGradId})`;
      case 'mid':
        return `url(#${facetMidGradId})`;
      case 'abyss':
      default:
        return `url(#${facetAbyssGradId})`;
    }
  };

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
      {/* TẦNG 1: Bầu trời Ngân Hà & Dãy núi Phan Xi Păng kiến tạo khối 3D đa diện (-mx*8) */}
      <div
        ref={layer1Ref}
        data-testid="son-ha-layer-1"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            {/* Bầu trời đêm vùng cao chuyển hừng đông ấm dịu */}
            <linearGradient id={skyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#050B16" />
              <stop offset="28%" stopColor="#0B192C" />
              <stop offset="56%" stopColor="#16324F" />
              <stop offset="78%" stopColor="#2B4C65" />
              <stop offset="92%" stopColor="#D4A373" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1B2E42" />
            </linearGradient>

            {/* Ánh hừng đông tỏa dịu sau yên ngựa Phan Xi Păng */}
            <radialGradient id={dawnWashId} cx="58%" cy="54%" r="48%">
              <stop offset="0%" stopColor="#E5B869" stopOpacity="0.28" />
              <stop offset="44%" stopColor="#5C82A6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0B192C" stopOpacity="0" />
            </radialGradient>

            {/* Hệ sắc độ khối đá 3D đa diện */}
            <linearGradient id={facetAbyssGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0C1829" />
              <stop offset="55%" stopColor="#07111E" />
              <stop offset="100%" stopColor="#040912" />
            </linearGradient>
            <linearGradient id={facetMidGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1D3752" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#091522" stopOpacity="0.96" />
            </linearGradient>
            <linearGradient id={facetCelestialGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5C82A6" stopOpacity="0.92" />
              <stop offset="55%" stopColor="#2F5170" stopOpacity="0.78" />
              <stop offset="100%" stopColor="#0B192B" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id={facetDawnGradId} x1="0%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#E5B869" stopOpacity="0.72" />
              <stop offset="42%" stopColor="#94A7BA" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#122437" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id={farRimGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5C82A6" stopOpacity="0.35" />
              <stop offset="52%" stopColor="#E5B869" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#9CC1DE" stopOpacity="0.58" />
            </linearGradient>

            <linearGradient id={valleyMistId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C5D3DC" stopOpacity="0" />
              <stop offset="52%" stopColor="#C5D3DC" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#E6E2D6" stopOpacity="0.48" />
            </linearGradient>
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

          {/* Dãy Hoàng Liên Sơn viễn cảnh & Khối đa diện 3D sắc nét */}
          <g data-testid="fansipan-peaks">
            {/* Lớp đỉnh hậu cảnh siêu xa mờ lam bạc */}
            <path
              d="M -100 545 L 40 488 L 155 516 L 295 452 L 420 492 L 560 442 L 690 474 L 835 398 L 945 436 L 1075 344 L 1185 388 L 1320 302 L 1435 358 L 1545 316 L 1700 378 L 1700 760 L -100 760 Z"
              fill="#112438"
              opacity="0.72"
            />

            {/* Khối nền núi chính tối sâu */}
            <path
              d="M -100 596 L 42 522 L 125 468 L 215 548 L 312 422 L 392 512 L 548 374 L 648 476 L 712 356 L 795 445 L 868 452 L 1018 266 L 1138 412 L 1262 286 L 1392 396 L 1478 274 L 1640 368 L 1710 342 L 1710 780 L -100 780 Z"
              fill={`url(#${facetAbyssGradId})`}
            />

            {/* Các mặt vách đá 3D đa diện: ánh sao xanh bạc (#5C82A6) + hừng đông (#E5B869) + hẻm vực tối (#07111E) */}
            <g data-testid="mountain-3d-facets">
              {MOUNTAIN_3D_FACETS.map((facet) => (
                <polygon key={facet.id} points={facet.points} fill={facetFillUrl(facet.tone)} />
              ))}
            </g>

            {/* Sống núi 3D sắc nét bắt sáng */}
            <path
              d="M -50 568 L 42 522 L 125 468 L 215 548 L 312 422 L 392 512 L 548 374 L 648 476 L 712 356 L 795 445 L 868 452 L 1018 266 L 1138 412 L 1262 286 L 1392 396 L 1478 274 L 1640 368"
              fill="none"
              stroke={`url(#${farRimGradId})`}
              strokeWidth="1.45"
              strokeLinejoin="round"
            />
          </g>

          <rect x="-80" y="510" width="1760" height="230" fill={`url(#${valleyMistId})`} />
        </svg>
      </div>

      {/* TẦNG 2: Hẻm núi Thác Bạc, sườn trung cảnh, ruộng bậc thang phản quang & đèn bản làng (-mx*16) */}
      <div
        ref={layer2Ref}
        data-testid="son-ha-layer-2"
        className="absolute -inset-8 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={midSlopeDarkId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#13283F" />
              <stop offset="52%" stopColor="#07111E" />
              <stop offset="100%" stopColor="#050C16" />
            </linearGradient>
            <linearGradient id={midSlopeLitId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5C82A6" stopOpacity="0.56" />
              <stop offset="55%" stopColor="#2F5170" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#07111E" stopOpacity="0.12" />
            </linearGradient>

            {/* Dải nền dòng Thác Bạc đổ xuống hẻm đá */}
            <linearGradient id={waterfallStreamGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.88" />
              <stop offset="48%" stopColor="#C8DFEE" stopOpacity="0.72" />
              <stop offset="86%" stopColor="#EBF3F9" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#F8F6F0" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={waterfallMistId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F8F9FA" stopOpacity="0.78" />
              <stop offset="48%" stopColor="#9CC1DE" stopOpacity="0.38" />
              <stop offset="100%" stopColor="#5C82A6" stopOpacity="0" />
            </radialGradient>

            {/* Mặt nước ruộng bậc thang phản chiếu bầu trời sao */}
            <linearGradient id={terracePoolGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1B3956" stopOpacity="0.55" />
              <stop offset="35%" stopColor="#5C82A6" stopOpacity="0.48" />
              <stop offset="68%" stopColor="#E5B869" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#1B3956" stopOpacity="0.48" />
            </linearGradient>
            <linearGradient id={terraceRimGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5C82A6" stopOpacity="0.28" />
              <stop offset="45%" stopColor="#F6D383" stopOpacity="0.68" />
              <stop offset="78%" stopColor="#C5D3DC" stopOpacity="0.62" />
              <stop offset="100%" stopColor="#E5B869" stopOpacity="0.26" />
            </linearGradient>
            <radialGradient id={lanternGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F6D383" stopOpacity="0.65" />
              <stop offset="48%" stopColor="#E5B869" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Hai sườn núi trung cảnh vách đá sắc cạnh ôm khe Thác Bạc ở khoảng thoáng giữa hero */}
          <g data-testid="midground-slopes">
            {/* Sườn Tây & vách núi dẫn nước trái */}
            <path
              d="M -100 622 Q 115 546 310 582 Q 495 616 695 636 L 748 446 L 764 468 L 762 686 L 675 840 L -100 840 Z"
              fill={`url(#${midSlopeDarkId})`}
            />
            <path
              d="M -60 612 Q 120 554 298 584 L 240 658 L -60 658 Z"
              fill={`url(#${midSlopeLitId})`}
            />
            <polygon points="748,446 704,548 762,566 764,468" fill="#0D2136" opacity="0.88" />

            {/* Sườn Đông & vách đá phải ôm khe thác */}
            <path
              d="M 800 452 L 856 544 Q 1085 604 1270 572 Q 1455 542 1700 582 L 1700 840 L 798 840 L 798 665 Z"
              fill={`url(#${midSlopeDarkId})`}
            />
            <path
              d="M 960 650 Q 1160 588 1345 568 L 1388 648 L 960 675 Z"
              fill={`url(#${midSlopeLitId})`}
            />
            <polygon points="800,452 842,542 798,592 796,476" fill={`url(#${midSlopeLitId})`} />
          </g>

          {/* Hẻm núi Thác Bạc (giữa cột chữ trái và khung Di sản phải) - phần nước & hơi sương hạt chi tiết chạy 120fps trên Canvas */}
          <g data-testid="thac-bac-gorge">
            {/* Vực đá ẩm tối sau dòng thác */}
            <path d="M 760 444 L 802 452 L 808 656 L 754 656 Z" fill="#07111E" opacity="0.92" />
            {/* Dải lõi Thác Bạc phản quang ánh trăng 2 tầng */}
            <path
              d="M 772 448 C 770 502, 774 548, 768 625 L 792 625 C 788 548, 792 502, 790 452 Z"
              fill={`url(#${waterfallStreamGradId})`}
            />
            <path d="M 778 449 L 785 451 L 787 624 L 775 624 Z" fill="#FFFFFF" opacity="0.45" />
            {/* Bụi sương chân thác bốc sáng hòa vào biển mây */}
            <ellipse cx="780" cy="624" rx="56" ry="20" fill={`url(#${waterfallMistId})`} />
          </g>

          {/* Thung lũng ruộng bậc thang mùa nước đổ phản chiếu ánh sao */}
          <g data-testid="terraced-fields">
            {TERRACE_WATER_POOLS.map((pool) => (
              <g key={pool.id} opacity={pool.opacity}>
                <path d={pool.fillPath} fill={`url(#${terracePoolGradId})`} />
                <path
                  d={pool.rimPath}
                  fill="none"
                  stroke={`url(#${terraceRimGradId})`}
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>

          {/* Quầng sáng ánh đèn bản làng Tây Bắc */}
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
                    opacity="0.88"
                  />
                ))}
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* TẦNG 3: Rừng tùng & đỗ quyên cổ thụ hai bên sườn núi rung nhẹ (+mx*24) */}
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
            <path
              d="M -110 740 L -110 612 Q -25 588 64 622 Q 138 652 212 722 L 212 850 L -110 850 Z"
              fill={`url(#${pineSilhouetteId})`}
            />
            <g className={prefersReducedMotion ? undefined : 'lu-canopy-sway'}>
              <path
                d="M 18 654 L 30 578 L 42 654 Z M 8 628 L 30 582 L 52 628 Z M 13 606 L 30 568 L 47 606 Z"
                fill="#0C1B2A"
              />
              <path
                d="M 76 668 L 88 594 L 100 668 Z M 67 642 L 88 596 L 109 642 Z M 72 618 L 88 584 L 104 618 Z"
                fill="#091522"
              />
              <path
                d="M -42 634 Q -18 598 16 616 Q 44 600 66 632 Q 36 654 -42 634 Z"
                fill="#112334"
              />
            </g>

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
            <linearGradient id={cloudFloorGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8FA6B8" stopOpacity="0" />
              <stop offset="48%" stopColor="#E6E2D6" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#FBF9F2" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          <rect x="-80" y="650" width="1760" height="260" fill={`url(#${cloudFloorGradId})`} />

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
