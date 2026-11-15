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

interface MountainPoint {
  readonly x: number;
  readonly y: number;
}

interface OrganicRidgeGeometry {
  readonly fillPath: string;
  readonly rimPath: string;
  readonly points: readonly MountainPoint[];
}

function buildOrganicMountainRidge(options: {
  readonly seed: number;
  readonly baseY: number;
  readonly xStart: number;
  readonly xEnd: number;
  readonly step: number;
  readonly bottomY: number;
  readonly amplitude: number;
  readonly peaks: readonly {
    readonly centerX: number;
    readonly width: number;
    readonly height: number;
  }[];
}): OrganicRidgeGeometry {
  const { seed, baseY, xStart, xEnd, step, bottomY, amplitude, peaks } = options;
  const points: MountainPoint[] = [];

  for (let x = xStart; x <= xEnd; x += step) {
    const nx = x * 0.0042 + seed;
    const oct1 = Math.sin(nx * 1.15 + seed * 0.7) * amplitude * 0.45;
    const oct2 = Math.cos(nx * 2.45 + seed * 1.9) * amplitude * 0.28;
    const oct3 = Math.sin(nx * 5.2 + seed * 3.1) * amplitude * 0.14;
    const oct4 = (1 - Math.abs(Math.sin(nx * 1.85 + seed * 2.3))) * amplitude * 0.24;

    let massifLift = 0;
    for (const peak of peaks) {
      const dist = (x - peak.centerX) / peak.width;
      massifLift += Math.exp(-dist * dist) * peak.height;
    }

    const y = Math.round((baseY - oct1 - oct2 - oct3 - oct4 - massifLift) * 10) / 10;
    points.push({ x, y });
  }

  const first = points[0] ?? { x: xStart, y: baseY };
  const last = points[points.length - 1] ?? { x: xEnd, y: baseY };

  // Nối các điểm bằng đường cong bậc hai (Quadratic Bézier) qua trung điểm để tạo đường sống núi mềm mại tự nhiên
  const curveParts: string[] = [`M ${first.x} ${first.y}`];
  for (let i = 1; i < points.length - 1; i += 1) {
    const p = points[i]!;
    const next = points[i + 1]!;
    const midX = Math.round(((p.x + next.x) / 2) * 10) / 10;
    const midY = Math.round(((p.y + next.y) / 2) * 10) / 10;
    curveParts.push(`Q ${p.x} ${p.y} ${midX} ${midY}`);
  }
  curveParts.push(`T ${last.x} ${last.y}`);

  const rimPath = curveParts.join(' ');
  const fillPath = `${rimPath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;

  return { fillPath, rimPath, points };
}

// 4 lớp dãy núi Hoàng Liên Sơn hữu cơ (xa -> trung -> đỉnh chính Fansipan -> đèo phụ)
const FAR_ALPS_RIDGE = buildOrganicMountainRidge({
  seed: 1.4,
  baseY: 468,
  xStart: -100,
  xEnd: 1700,
  step: 60,
  bottomY: 760,
  amplitude: 42,
  peaks: [
    { centerX: 280, width: 190, height: 54 },
    { centerX: 740, width: 230, height: 82 },
    { centerX: 1180, width: 220, height: 108 },
    { centerX: 1520, width: 170, height: 74 },
  ],
});

const SECONDARY_SPUR_RIDGE = buildOrganicMountainRidge({
  seed: 3.1,
  baseY: 506,
  xStart: -100,
  xEnd: 1700,
  step: 54,
  bottomY: 760,
  amplitude: 46,
  peaks: [
    { centerX: 165, width: 165, height: 68 },
    { centerX: 540, width: 195, height: 92 },
    { centerX: 985, width: 210, height: 126 },
    { centerX: 1365, width: 180, height: 112 },
  ],
});

const FANSIPAN_MAIN_RIDGE = buildOrganicMountainRidge({
  seed: 5.7,
  baseY: 542,
  xStart: -100,
  xEnd: 1710,
  step: 45,
  bottomY: 780,
  amplitude: 44,
  peaks: [
    { centerX: 130, width: 140, height: 84 },
    { centerX: 335, width: 145, height: 114 },
    { centerX: 565, width: 155, height: 138 },
    { centerX: 1020, width: 175, height: 228 }, // Đỉnh Fansipan 3.143m
    { centerX: 1265, width: 150, height: 194 },
    { centerX: 1495, width: 165, height: 206 },
  ],
});

const MOUNTAIN_3D_FACETS: readonly FacetSpec[] = FANSIPAN_MAIN_RIDGE.points
  .slice(2, 26)
  .map((pt, idx, arr) => {
    const nextPt = arr[idx + 1] ?? FANSIPAN_MAIN_RIDGE.points[idx + 3] ?? pt;
    const spurShiftX = idx % 2 === 0 ? 32 : -26;
    const dropY = 78 + (idx % 3) * 30;
    const tone: FacetSpec['tone'] =
      idx % 4 === 1 ? 'dawn' : idx % 3 === 0 ? 'celestial' : idx % 2 === 0 ? 'mid' : 'abyss';
    return {
      id: `f-ridge-${idx}`,
      points: `${pt.x},${pt.y} ${nextPt.x},${nextPt.y} ${Math.round(nextPt.x + spurShiftX)},${Math.round(nextPt.y + dropY)} ${Math.round(pt.x + spurShiftX * 0.55)},${Math.round(pt.y + dropY * 0.92)}`,
      tone,
    };
  });

const TERRACE_WEST_POOLS: readonly TerracePoolSpec[] = [
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
];

const TERRACE_EAST_POOLS: readonly TerracePoolSpec[] = [
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

const VILLAGE_LANTERN_POOLS_WEST: readonly VillageLanternPoolSpec[] = [
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
];

const VILLAGE_LANTERN_POOLS_EAST: readonly VillageLanternPoolSpec[] = [
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

function applyPaletteCssVars(el: HTMLElement, p: AtmospherePalette): void {
  el.style.setProperty('--hls-sky-0', rgbString(p.sky0));
  el.style.setProperty('--hls-sky-1', rgbString(p.sky1));
  el.style.setProperty('--hls-sky-2', rgbString(p.sky2));
  el.style.setProperty('--hls-sky-3', rgbString(p.sky3));
  el.style.setProperty('--hls-sky-4', rgbString(p.sky4));
  el.style.setProperty('--hls-dawn-core', rgbString(p.dawnCore));
  el.style.setProperty('--hls-dawn-edge', rgbString(p.dawnEdge));
  el.style.setProperty('--hls-facet-celestial', rgbString(p.facetCelestial));
  el.style.setProperty('--hls-facet-dawn', rgbString(p.facetDawn));
  el.style.setProperty('--hls-facet-mid', rgbString(p.facetMid));
  el.style.setProperty('--hls-facet-abyss', rgbString(p.facetAbyss));
  el.style.setProperty('--hls-rim-glow', rgbString(p.rimGlow));
  el.style.setProperty('--hls-terrace-a', rgbString(p.terracePoolA));
  el.style.setProperty('--hls-terrace-b', rgbString(p.terracePoolB));
  el.style.setProperty('--hls-terrace-rim', rgbString(p.terraceRim));
  el.style.setProperty('--hls-cloud-a', rgbString(p.cloudSlate));
  el.style.setProperty('--hls-cloud-b', rgbString(p.cloudIvory));
  el.style.setProperty('--hls-pine-top', rgbString(p.pineTop));
  el.style.setProperty('--hls-pine-bot', rgbString(p.pineBot));
  el.style.setProperty('--hls-bottom-mist', rgbString(p.bottomMistDeep));
  el.style.setProperty('--hls-scrim-alpha', p.contrastScrimAlpha.toFixed(3));
}

/**
 * Cảnh quan "Biển Mây & Ngân Hà Hoàng Liên Sơn 3D" 120fps GPU-Composited:
 * - Chuyển đổi mượt mà trong 600ms giữa 4 thời khắc (Đêm Ngân Hà · Bình Minh · Nắng Ngọc · Hoàng Hôn)
 * - Camera 3D bay xuyên qua cổng núi khi cuộn trang (`scale = 1 + scrollProgress * 0.35`, tách 2 sườn núi ±140px)
 * - Lớp phủ tương phản giữ chữ tiêu đề luôn sáng rõ ở cả 4 thời khắc
 */
export function HeroSonHaDiorama({ phase = 'dem-ngan-ha', className }: HeroSonHaDioramaProps) {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);
  const westSlopeRef = useRef<SVGGElement>(null);
  const eastSlopeRef = useRef<SVGGElement>(null);
  const westFoliageRef = useRef<SVGGElement>(null);
  const eastFoliageRef = useRef<SVGGElement>(null);

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
      for (const ref of [layer1Ref, layer2Ref, layer3Ref, layer4Ref]) {
        if (ref.current) {
          ref.current.style.transform = 'translate3d(0px, 0px, 0px) scale(1)';
          ref.current.style.backfaceVisibility = 'hidden';
        }
      }
      if (containerRef.current) {
        applyPaletteCssVars(containerRef.current, transitionRef.current.to);
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

      // 1. Nội suy bảng màu 600ms giữa 4 thời khắc khí quyển
      const tr = transitionRef.current;
      if (tr.elapsedSec < 0.6 && containerRef.current) {
        tr.elapsedSec = Math.min(0.6, tr.elapsedSec + dtSeconds);
        const eased = 1 - Math.pow(1 - tr.elapsedSec / 0.6, 3);
        tr.current = interpolateAtmospherePalette(tr.from, tr.to, eased);
        applyPaletteCssVars(containerRef.current, tr.current);
      }

      // 2. Parallax 4 tầng + Camera 3D Scroll Fly-Through (scale = 1 + sp*0.35, tách ±140px)
      const smoothMouse = frameDampFactor(12, dtSeconds);
      const smoothScroll = frameDampFactor(14, dtSeconds);
      currentX += (targetX - currentX) * smoothMouse;
      currentY += (targetY - currentY) * smoothMouse;
      currentScroll += (targetScroll - currentScroll) * smoothScroll;

      const sp = currentScroll;
      const farScale = 1 + sp * 0.14;
      const nearScale = 1 + sp * 0.35;
      const splitPx = sp * 140;

      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate3d(${(-currentX * 8).toFixed(2)}px, ${(-currentY * 6 - sp * 12).toFixed(2)}px, 0px) scale(${farScale.toFixed(4)})`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate3d(${(-currentX * 16).toFixed(2)}px, ${(-currentY * 10 - sp * 18).toFixed(2)}px, 0px) scale(${nearScale.toFixed(4)})`;
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translate3d(${(currentX * 24).toFixed(2)}px, ${(currentY * 14 - sp * 22).toFixed(2)}px, 0px) scale(${nearScale.toFixed(4)})`;
      }
      if (layer4Ref.current) {
        layer4Ref.current.style.transform = `translate3d(${(currentX * 38).toFixed(2)}px, ${(currentY * 20 - sp * 26).toFixed(2)}px, 0px) scale(${(1 + sp * 0.25).toFixed(4)})`;
      }

      if (westSlopeRef.current) {
        westSlopeRef.current.style.transform = `translate3d(${(-splitPx).toFixed(2)}px, ${(sp * 16).toFixed(2)}px, 0px)`;
      }
      if (eastSlopeRef.current) {
        eastSlopeRef.current.style.transform = `translate3d(${splitPx.toFixed(2)}px, ${(sp * 16).toFixed(2)}px, 0px)`;
      }
      if (westFoliageRef.current) {
        westFoliageRef.current.style.transform = `translate3d(${(-splitPx).toFixed(2)}px, ${(sp * 20).toFixed(2)}px, 0px)`;
      }
      if (eastFoliageRef.current) {
        eastFoliageRef.current.style.transform = `translate3d(${splitPx.toFixed(2)}px, ${(sp * 20).toFixed(2)}px, 0px)`;
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
      data-phase={phase}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden select-none', className)}
      style={{
        background:
          'linear-gradient(180deg, var(--hls-sky-0, #050B16) 0%, var(--hls-sky-1, #0B192C) 28%, var(--hls-sky-2, #16324F) 54%, var(--hls-sky-3, #2B4C65) 78%, var(--hls-sky-4, #1B2E42) 100%)',
      }}
    >
      {/* TẦNG 1: Bầu trời đa thời khắc & Khối núi Phan Xi Păng 3D (-mx*8) */}
      <div
        ref={layer1Ref}
        data-testid="son-ha-layer-1"
        className="absolute -inset-6 will-change-transform"
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

            <linearGradient id={facetAbyssGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--hls-facet-abyss, #07111E)" />
              <stop offset="100%" stopColor="#040912" />
            </linearGradient>
            <linearGradient id={facetMidGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--hls-facet-mid, #1D3752)" stopOpacity="0.92" />
              <stop offset="100%" stopColor="var(--hls-facet-abyss, #07111E)" stopOpacity="0.96" />
            </linearGradient>
            <linearGradient id={facetCelestialGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor="var(--hls-facet-celestial, #5C82A6)"
                stopOpacity="0.92"
              />
              <stop offset="56%" stopColor="var(--hls-facet-mid, #1D3752)" stopOpacity="0.78" />
              <stop offset="100%" stopColor="var(--hls-facet-abyss, #07111E)" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id={facetDawnGradId} x1="0%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="var(--hls-facet-dawn, #E5B869)" stopOpacity="0.76" />
              <stop
                offset="44%"
                stopColor="var(--hls-facet-celestial, #5C82A6)"
                stopOpacity="0.48"
              />
              <stop offset="100%" stopColor="var(--hls-facet-abyss, #07111E)" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id={farRimGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--hls-facet-celestial, #5C82A6)" stopOpacity="0.4" />
              <stop offset="52%" stopColor="var(--hls-rim-glow, #E5B869)" stopOpacity="0.78" />
              <stop offset="100%" stopColor="var(--hls-dawn-core, #E5B869)" stopOpacity="0.62" />
            </linearGradient>

            <linearGradient id={valleyMistId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--hls-cloud-a, #C5D3DC)" stopOpacity="0" />
              <stop offset="52%" stopColor="var(--hls-cloud-a, #C5D3DC)" stopOpacity="0.28" />
              <stop offset="100%" stopColor="var(--hls-cloud-b, #E6E2D6)" stopOpacity="0.48" />
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

          <g data-testid="fansipan-peaks">
            {/* Lớp 1: Dãy núi xa mờ sương tạo chiều sâu viễn cảnh khí quyển */}
            <path d={FAR_ALPS_RIDGE.fillPath} fill="var(--hls-facet-mid, #1D3752)" opacity="0.46" />

            {/* Dải sương thung lũng tầng 1 trôi ngang giữa lớp núi xa và dãy chính */}
            <g
              data-testid="valley-mist-band-1"
              className={prefersReducedMotion ? undefined : 'lu-wave-drift-1'}
            >
              <path
                d="M -160 442 Q 220 418 540 448 Q 880 476 1220 434 Q 1480 408 1760 444 L 1760 660 L -160 660 Z"
                fill={`url(#${valleyMistId})`}
                opacity="0.62"
              />
            </g>

            {/* Lớp 2: Dãy sườn phụ Hoàng Liên Sơn nhấp nhô mềm mại */}
            <path
              d={SECONDARY_SPUR_RIDGE.fillPath}
              fill="var(--hls-facet-mid, #1D3752)"
              opacity="0.72"
            />

            {/* Lớp 3: Khối đỉnh chính Phan Xi Păng điêu khắc hữu cơ */}
            <path d={FANSIPAN_MAIN_RIDGE.fillPath} fill={`url(#${facetAbyssGradId})`} />
            <g data-testid="mountain-3d-facets" opacity="0.52">
              {MOUNTAIN_3D_FACETS.map((facet) => (
                <polygon key={facet.id} points={facet.points} fill={facetFillUrl(facet.tone)} />
              ))}
            </g>
            <path
              d={FANSIPAN_MAIN_RIDGE.rimPath}
              fill="none"
              stroke={`url(#${farRimGradId})`}
              strokeWidth="1.65"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.88"
            />
          </g>

          {/* Dải sương thung lũng tầng 2 ngăn cách dãy núi chính với hẻm thác trung cảnh */}
          <g
            data-testid="valley-mist-band-2"
            className={prefersReducedMotion ? undefined : 'lu-wave-drift-2'}
          >
            <rect x="-120" y="504" width="1840" height="236" fill={`url(#${valleyMistId})`} />
          </g>
        </svg>
      </div>

      {/* TẦNG 2: Cổng núi 3D bay xuyên (Tách sườn Tây/Đông ±140px), Thác Bạc & Ruộng bậc thang */}
      <div
        ref={layer2Ref}
        data-testid="son-ha-layer-2"
        className="absolute -inset-8 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={midSlopeDarkId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--hls-facet-mid, #1D3752)" />
              <stop offset="52%" stopColor="var(--hls-facet-abyss, #07111E)" />
              <stop offset="100%" stopColor="#050C16" />
            </linearGradient>
            <linearGradient id={midSlopeLitId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop
                offset="0%"
                stopColor="var(--hls-facet-celestial, #5C82A6)"
                stopOpacity="0.58"
              />
              <stop offset="55%" stopColor="var(--hls-facet-mid, #1D3752)" stopOpacity="0.34" />
              <stop offset="100%" stopColor="var(--hls-facet-abyss, #07111E)" stopOpacity="0.12" />
            </linearGradient>

            <linearGradient id={waterfallStreamGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.9" />
              <stop offset="48%" stopColor="var(--hls-dawn-edge, #C8DFEE)" stopOpacity="0.72" />
              <stop offset="86%" stopColor="var(--hls-cloud-b, #EBF3F9)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F8F6F0" stopOpacity="0" />
            </linearGradient>
            <radialGradient id={waterfallMistId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F8F9FA" stopOpacity="0.8" />
              <stop offset="48%" stopColor="var(--hls-dawn-edge, #9CC1DE)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--hls-facet-celestial, #5C82A6)" stopOpacity="0" />
            </radialGradient>

            <linearGradient id={terracePoolGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--hls-terrace-a, #234B6E)" stopOpacity="0.6" />
              <stop offset="42%" stopColor="var(--hls-terrace-b, #B4CEE4)" stopOpacity="0.55" />
              <stop offset="76%" stopColor="var(--hls-rim-glow, #E5B869)" stopOpacity="0.38" />
              <stop offset="100%" stopColor="var(--hls-terrace-a, #234B6E)" stopOpacity="0.54" />
            </linearGradient>
            <linearGradient id={terraceRimGradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop
                offset="0%"
                stopColor="var(--hls-facet-celestial, #5C82A6)"
                stopOpacity="0.34"
              />
              <stop offset="48%" stopColor="var(--hls-terrace-rim, #F3C978)" stopOpacity="0.75" />
              <stop offset="100%" stopColor="var(--hls-terrace-b, #C5D3DC)" stopOpacity="0.46" />
            </linearGradient>
            <radialGradient id={lanternGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F6D383" stopOpacity="0.65" />
              <stop offset="48%" stopColor="#E5B869" stopOpacity="0.24" />
              <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Hẻm núi Thác Bạc 3 tầng ghềnh đá uốn lượn & hồ sương phát sáng */}
          <g data-testid="thac-bac-gorge">
            {/* Hốc hẻm đá granite tối sâu dẫn dòng thác */}
            <path
              d="M 758 442 Q 782 440 806 450 Q 814 542 820 658 L 750 658 Q 754 544 758 442 Z"
              fill="var(--hls-facet-abyss, #07111E)"
              opacity="0.92"
            />
            {/* Bậc đá chia tầng 1->2 và 2->3 */}
            <path
              d="M 762 504 Q 784 497 804 507 L 798 516 Q 780 510 760 513 Z"
              fill="var(--hls-facet-mid, #1D3752)"
              opacity="0.88"
            />
            <path
              d="M 757 566 Q 784 558 810 568 L 806 579 Q 782 572 756 575 Z"
              fill="var(--hls-facet-mid, #1D3752)"
              opacity="0.88"
            />
            {/* Dòng thác 3 tầng hẹp ở thượng nguồn -> loe rộng ở hạ lưu */}
            <path
              d="M 776 446 C 779 468, 773 486, 778 504 L 790 504 C 786 485, 790 468, 787 447 Z"
              fill={`url(#${waterfallStreamGradId})`}
            />
            <path
              d="M 774 504 C 769 528, 780 546, 771 566 L 796 566 C 792 544, 798 525, 791 504 Z"
              fill={`url(#${waterfallStreamGradId})`}
            />
            <path
              d="M 770 566 C 764 590, 768 612, 761 634 L 807 634 C 801 610, 800 588, 796 566 Z"
              fill={`url(#${waterfallStreamGradId})`}
            />
            {/* Dải bọt bạc mảnh uốn chữ S dọc 3 tầng thác */}
            <path
              d="M 781 448 C 783 472, 777 486, 783 504 C 788 524, 776 544, 783 566 C 789 590, 778 610, 785 634"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.62"
            />
            {/* Quầng sương tròn phát sáng nhẹ & gợn sóng tại chân thác */}
            <ellipse cx="785" cy="634" rx="70" ry="22" fill={`url(#${waterfallMistId})`} />
            <ellipse
              cx="785"
              cy="636"
              rx="48"
              ry="11"
              fill="none"
              stroke="var(--hls-dawn-edge, #9CC1DE)"
              strokeWidth="0.9"
              opacity="0.45"
            />
          </g>

          {/* Dải sương thung lũng tầng 3 trôi ngang phía trên ruộng bậc thang */}
          <g
            data-testid="valley-mist-band-3"
            className={prefersReducedMotion ? undefined : 'lu-wave-drift-1'}
          >
            <path
              d="M -120 564 Q 320 536 740 572 Q 1160 604 1720 558 L 1720 676 L -120 676 Z"
              fill={`url(#${valleyMistId})`}
              opacity="0.42"
            />
          </g>

          {/* Khối sườn Tây (dạt trái -140px khi cuộn xuống) */}
          <g data-testid="midground-slopes">
            <g ref={westSlopeRef} data-testid="flythrough-west-slope">
              <path
                d="M -100 622 Q 115 546 310 582 Q 495 616 695 636 L 748 446 L 764 468 L 762 686 L 675 840 L -100 840 Z"
                fill={`url(#${midSlopeDarkId})`}
              />
              <path
                d="M -60 612 Q 120 554 298 584 L 240 658 L -60 658 Z"
                fill={`url(#${midSlopeLitId})`}
              />
              <polygon
                points="748,446 704,548 762,566 764,468"
                fill="var(--hls-facet-abyss, #0D2136)"
                opacity="0.88"
              />
              <g data-testid="terraced-fields">
                {TERRACE_WEST_POOLS.map((pool) => (
                  <g key={pool.id} opacity={pool.opacity}>
                    <path d={pool.fillPath} fill={`url(#${terracePoolGradId})`} />
                    <path
                      d={pool.rimPath}
                      fill="none"
                      stroke={`url(#${terraceRimGradId})`}
                      strokeWidth="1.35"
                      strokeLinecap="round"
                    />
                  </g>
                ))}
              </g>
              <g data-testid="village-lantern-glow">
                {VILLAGE_LANTERN_POOLS_WEST.map((pool) => (
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
            </g>

            {/* Khối sườn Đông (dạt phải +140px khi cuộn xuống) */}
            <g ref={eastSlopeRef} data-testid="flythrough-east-slope">
              <path
                d="M 800 452 L 856 544 Q 1085 604 1270 572 Q 1455 542 1700 582 L 1700 840 L 798 840 L 798 665 Z"
                fill={`url(#${midSlopeDarkId})`}
              />
              <path
                d="M 960 650 Q 1160 588 1345 568 L 1388 648 L 960 675 Z"
                fill={`url(#${midSlopeLitId})`}
              />
              <polygon points="800,452 842,542 798,592 796,476" fill={`url(#${midSlopeLitId})`} />
              {TERRACE_EAST_POOLS.map((pool) => (
                <g key={pool.id} opacity={pool.opacity}>
                  <path d={pool.fillPath} fill={`url(#${terracePoolGradId})`} />
                  <path
                    d={pool.rimPath}
                    fill="none"
                    stroke={`url(#${terraceRimGradId})`}
                    strokeWidth="1.35"
                    strokeLinecap="round"
                  />
                </g>
              ))}
              {VILLAGE_LANTERN_POOLS_EAST.map((pool) => (
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
          </g>
        </svg>
      </div>

      {/* TẦNG 3: Rừng tùng & đỗ quyên cổ thụ hai bên dạt sang hai bên cổng núi khi bay xuyên */}
      <div
        ref={layer3Ref}
        data-testid="son-ha-layer-3"
        className="absolute -inset-9 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={pineSilhouetteId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--hls-pine-top, #182C3D)" />
              <stop offset="56%" stopColor="var(--hls-facet-abyss, #091522)" />
              <stop offset="100%" stopColor="var(--hls-pine-bot, #050B16)" />
            </linearGradient>
          </defs>

          <g data-testid="hoang-lien-foliage">
            <g ref={westFoliageRef}>
              <path
                d="M -110 740 L -110 612 Q -25 588 64 622 Q 138 652 212 722 L 212 850 L -110 850 Z"
                fill={`url(#${pineSilhouetteId})`}
              />
              <g className={prefersReducedMotion ? undefined : 'lu-canopy-sway'}>
                <path
                  d="M 18 654 L 30 578 L 42 654 Z M 8 628 L 30 582 L 52 628 Z M 13 606 L 30 568 L 47 606 Z"
                  fill="var(--hls-pine-top, #0C1B2A)"
                />
                <path
                  d="M 76 668 L 88 594 L 100 668 Z M 67 642 L 88 596 L 109 642 Z M 72 618 L 88 584 L 104 618 Z"
                  fill="var(--hls-pine-bot, #091522)"
                />
                <path
                  d="M -42 634 Q -18 598 16 616 Q 44 600 66 632 Q 36 654 -42 634 Z"
                  fill="var(--hls-pine-top, #112334)"
                />
              </g>
            </g>

            <g ref={eastFoliageRef}>
              <path
                d="M 1368 730 Q 1448 648 1538 614 Q 1625 584 1710 606 L 1710 850 L 1368 850 Z"
                fill={`url(#${pineSilhouetteId})`}
              />
              <g className={prefersReducedMotion ? undefined : 'lu-canopy-sway'}>
                <path
                  d="M 1492 656 L 1506 572 L 1520 656 Z M 1480 628 L 1506 576 L 1532 628 Z M 1486 604 L 1506 562 L 1526 604 Z"
                  fill="var(--hls-pine-bot, #091522)"
                />
                <path
                  d="M 1554 646 L 1568 564 L 1582 646 Z M 1544 618 L 1568 568 L 1592 618 Z M 1550 594 L 1568 552 L 1586 594 Z"
                  fill="var(--hls-pine-top, #0C1B2A)"
                />
                <path
                  d="M 1424 662 Q 1456 624 1492 640 Q 1528 616 1556 648 Q 1514 674 1424 662 Z"
                  fill="var(--hls-pine-top, #112334)"
                />
              </g>
            </g>
          </g>
        </svg>
      </div>

      {/* TẦNG 4: Đàn chim hạc / én bay lướt & lớp mây chân núi (+mx*38) */}
      <div
        ref={layer4Ref}
        data-testid="son-ha-layer-4"
        className="absolute -inset-10 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={cloudFloorGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--hls-cloud-a, #8FA6B8)" stopOpacity="0" />
              <stop offset="54%" stopColor="var(--hls-bottom-mist, #112233)" stopOpacity="0.62" />
              <stop offset="100%" stopColor="#121B28" stopOpacity="0.96" />
            </linearGradient>
          </defs>

          <rect x="-80" y="685" width="1760" height="235" fill={`url(#${cloudFloorGradId})`} />

          <g data-testid="hoang-lien-cranes">
            {CRANE_FORMATION.map((crane) => (
              <g
                key={crane.id}
                transform={`translate(${crane.x}, ${crane.y}) scale(${crane.scale})`}
                opacity={crane.opacity}
              >
                <path
                  d="M -20 4 Q -10 -7 0 -1 Q 10 -7 20 4 Q 10 -2 0 1.5 Q -10 -2 -20 4 Z"
                  fill="var(--hls-cloud-b, #E6E2D6)"
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

      {/* Dải hòa tan 15% đáy Hero (Deep Indigo Mist #112233 -> #121B28) triệt tiêu hoàn toàn đường cắt giữa Screen 1 và Screen 2 */}
      <div
        data-testid="hero-bottom-mist-transition"
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%]"
        style={{
          background:
            'linear-gradient(180deg, rgba(17, 34, 51, 0) 0%, color-mix(in srgb, var(--hls-bottom-mist, #112233) 72%, transparent) 58%, #121B28 100%)',
        }}
      />

      {/* Lớp nền tương phản an toàn phía sau chữ tiêu đề ở mọi thời khắc (Đêm/Bình minh/Nắng Ngọc/Hoàng hôn) */}
      <div
        data-testid="hero-text-contrast-scrim"
        className="pointer-events-none absolute inset-y-0 left-0 w-full lg:w-[62%]"
        style={{
          opacity: 'var(--hls-scrim-alpha, 0.24)',
          background:
            'radial-gradient(ellipse at 24% 44%, rgba(5, 11, 22, 0.88) 0%, rgba(5, 11, 22, 0.56) 52%, rgba(5, 11, 22, 0) 82%)',
        }}
      />
    </div>
  );
}
