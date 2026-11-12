import { useEffect, useId, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';
import { ATMOSPHERE_THEMES, type HeroAtmosphere } from './heroAtmosphere';

export interface HeroSonHaDioramaProps {
  readonly atmosphere: HeroAtmosphere;
  readonly className?: string;
}

const STAR_COORDINATES: ReadonlyArray<{
  readonly cx: number;
  readonly cy: number;
  readonly r: number;
  readonly opacity: number;
}> = [
  { cx: 140, cy: 90, r: 1.4, opacity: 0.75 },
  { cx: 260, cy: 140, r: 1.1, opacity: 0.55 },
  { cx: 390, cy: 70, r: 1.7, opacity: 0.85 },
  { cx: 520, cy: 130, r: 1.2, opacity: 0.65 },
  { cx: 680, cy: 65, r: 1.5, opacity: 0.8 },
  { cx: 810, cy: 115, r: 1.1, opacity: 0.6 },
  { cx: 930, cy: 85, r: 1.6, opacity: 0.85 },
  { cx: 1080, cy: 155, r: 1.2, opacity: 0.55 },
  { cx: 1210, cy: 75, r: 1.8, opacity: 0.9 },
  { cx: 1340, cy: 135, r: 1.3, opacity: 0.7 },
  { cx: 1480, cy: 92, r: 1.5, opacity: 0.75 },
  { cx: 190, cy: 230, r: 1.0, opacity: 0.45 },
  { cx: 450, cy: 215, r: 1.3, opacity: 0.5 },
  { cx: 740, cy: 195, r: 1.2, opacity: 0.55 },
  { cx: 1410, cy: 220, r: 1.4, opacity: 0.6 },
];

const CRANE_OFFSETS: ReadonlyArray<{
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}> = [
  { x: 350, y: 205, scale: 0.82 },
  { x: 405, y: 184, scale: 0.95 },
  { x: 458, y: 196, scale: 0.76 },
  { x: 510, y: 168, scale: 1.08 },
  { x: 572, y: 182, scale: 0.88 },
  { x: 632, y: 158, scale: 0.7 },
];

/**
 * Cảnh quan Sơn Hà 5 lớp 3D Parallax (SVG Multi-layer Diorama)
 * Chuyển động mượt 60fps bằng useRef + requestAnimationFrame, không kích hoạt React re-render khi di chuột.
 */
export function HeroSonHaDiorama({ atmosphere, className }: HeroSonHaDioramaProps) {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();

  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);
  const layer5Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyNeutral = () => {
      const layers = [layer1Ref, layer2Ref, layer3Ref, layer4Ref, layer5Ref];
      for (const ref of layers) {
        if (ref.current) {
          ref.current.style.transform = 'translate3d(0px, 0px, 0px)';
        }
      }
    };

    if (typeof window === 'undefined' || prefersReducedMotion) {
      applyNeutral();
      return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const vw = Math.max(window.innerWidth, 1);
      const vh = Math.max(window.innerHeight, 1);
      targetX = (event.clientX / vw - 0.5) * 2;
      targetY = (event.clientY / vh - 0.5) * 2;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      if (layer1Ref.current) {
        layer1Ref.current.style.transform = `translate3d(${(-currentX * 8).toFixed(2)}px, ${(-currentY * 8).toFixed(2)}px, 0px)`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate3d(${(-currentX * 16).toFixed(2)}px, ${(-currentY * 10).toFixed(2)}px, 0px)`;
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translate3d(${(currentX * 24).toFixed(2)}px, ${(-currentY * 14).toFixed(2)}px, 0px)`;
      }
      if (layer4Ref.current) {
        layer4Ref.current.style.transform = `translate3d(${(currentX * 32).toFixed(2)}px, ${(currentY * 18).toFixed(2)}px, 0px)`;
      }
      if (layer5Ref.current) {
        layer5Ref.current.style.transform = `translate3d(${(currentX * 45).toFixed(2)}px, ${(currentY * 25).toFixed(2)}px, 0px)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [prefersReducedMotion]);

  const theme = ATMOSPHERE_THEMES[atmosphere];

  const palette =
    atmosphere === 'sunset'
      ? {
          orbCore: '#E85332',
          orbRim: '#E5B869',
          orbHalo: 'rgba(229, 184, 105, 0.42)',
          orbitStroke: '#F3C978',
          farMountain: '#5E2A33',
          farMountainSecondary: '#4A222E',
          mistStopTop: 'rgba(217, 138, 78, 0)',
          mistStopBottom: 'rgba(217, 138, 78, 0.38)',
          midMountain: '#361923',
          pagodaFill: '#241017',
          cloudPrimary: '#F3C978',
          cloudSecondary: '#D98A4E',
          craneStroke: '#FFF2DC',
          foliageFill: '#1B0D12',
        }
      : atmosphere === 'night'
        ? {
            orbCore: '#E6F5EC',
            orbRim: '#A7F3D0',
            orbHalo: 'rgba(134, 239, 172, 0.28)',
            orbitStroke: '#D4AF37',
            farMountain: '#0F291F',
            farMountainSecondary: '#0A1E17',
            mistStopTop: 'rgba(21, 50, 38, 0)',
            mistStopBottom: 'rgba(21, 50, 38, 0.45)',
            midMountain: '#081812',
            pagodaFill: '#050F0B',
            cloudPrimary: '#86EFAC',
            cloudSecondary: '#D4AF37',
            craneStroke: '#E5C378',
            foliageFill: '#040C09',
          }
        : {
            orbCore: '#C83E37',
            orbRim: '#E5B869',
            orbHalo: 'rgba(200, 62, 55, 0.16)',
            orbitStroke: '#C5A262',
            farMountain: '#84A899',
            farMountainSecondary: '#688F80',
            mistStopTop: 'rgba(242, 236, 225, 0)',
            mistStopBottom: 'rgba(228, 239, 233, 0.72)',
            midMountain: '#365E4E',
            pagodaFill: '#27463A',
            cloudPrimary: '#FFFFFF',
            cloudSecondary: '#E5C378',
            craneStroke: '#365E4E',
            foliageFill: '#244135',
          };

  const mistId = `sonha-mist-${uid}`;
  const haloId = `sonha-halo-${uid}`;
  const beamId = `sonha-beam-${uid}`;

  return (
    <div
      data-testid="son-ha-diorama"
      data-atmosphere={atmosphere}
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden transition-colors duration-700 select-none',
        className,
      )}
      style={{ background: theme.skyGradient }}
    >
      {/* Tầng 1: Thiên cầu & Nhật/Nguyệt (-mx*8, -my*8) */}
      <div
        ref={layer1Ref}
        data-testid="son-ha-layer-1"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <radialGradient id={haloId}>
              <stop offset="0%" stopColor={palette.orbCore} stopOpacity="0.95" />
              <stop offset="32%" stopColor={palette.orbRim} stopOpacity="0.55" />
              <stop offset="70%" stopColor={palette.orbHalo} stopOpacity="0.22" />
              <stop offset="100%" stopColor={palette.orbRim} stopOpacity="0" />
            </radialGradient>
            <linearGradient id={beamId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5D78E" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#F5D78E" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Tia nắng xiên ban mai trong chế độ Nắng Sớm */}
          {atmosphere === 'dawn' && (
            <g opacity="0.55">
              <polygon points="150,0 440,0 920,900 420,900" fill={`url(#${beamId})`} />
              <polygon points="520,0 710,0 1240,900 960,900" fill={`url(#${beamId})`} />
            </g>
          )}

          {/* Bầu trời sao lấp lánh ở chế độ Đêm Đom Đóm */}
          {atmosphere === 'night' && (
            <g>
              {STAR_COORDINATES.map((star, idx) => (
                <circle
                  key={idx}
                  cx={star.cx}
                  cy={star.cy}
                  r={star.r}
                  fill={idx % 3 === 0 ? '#E5C378' : '#ECFDF5'}
                  opacity={star.opacity}
                  className={prefersReducedMotion ? undefined : 'lu-star-twinkle'}
                  style={
                    prefersReducedMotion
                      ? undefined
                      : { animationDelay: `${(idx * 0.45).toFixed(2)}s` }
                  }
                />
              ))}
            </g>
          )}

          {/* Quầng sáng lớn & Vầng Nhật / Nguyệt */}
          <circle cx="1130" cy="235" r="245" fill={`url(#${haloId})`} />

          {/* Các vòng quỹ đạo vàng mảnh xoay chậm phía sau */}
          <g
            className={prefersReducedMotion ? undefined : 'lu-orbit-slow'}
            style={{ transformOrigin: '1130px 235px' }}
          >
            <circle
              cx="1130"
              cy="235"
              r="146"
              fill="none"
              stroke={palette.orbitStroke}
              strokeWidth="1"
              strokeDasharray="6 8"
              strokeOpacity="0.55"
            />
            <circle
              cx="1130"
              cy="235"
              r="178"
              fill="none"
              stroke={palette.orbitStroke}
              strokeWidth="0.75"
              strokeDasharray="2 10"
              strokeOpacity="0.4"
            />
            <circle cx="1276" cy="235" r="3" fill={palette.orbitStroke} fillOpacity="0.75" />
            <circle cx="984" cy="235" r="2.5" fill={palette.orbitStroke} fillOpacity="0.6" />
          </g>

          {/* Đĩa Mặt Trời Chu Sa / Mặt Trăng Ngọc Bích */}
          <circle
            cx="1130"
            cy="235"
            r="84"
            fill={palette.orbCore}
            fillOpacity={atmosphere === 'dawn' ? '0.88' : '0.96'}
          />
          {atmosphere === 'night' && (
            <circle cx="1104" cy="212" r="26" fill="#FFFFFF" fillOpacity="0.16" />
          )}
        </svg>
      </div>

      {/* Tầng 2: Viễn Sơn - Núi xa mờ sương (-mx*16, -my*10) */}
      <div
        ref={layer2Ref}
        data-testid="son-ha-layer-2"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={mistId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={palette.mistStopTop} />
              <stop offset="100%" stopColor={palette.mistStopBottom} />
            </linearGradient>
          </defs>

          <path
            d="M -60 720 C 140 610, 290 560, 470 615 C 640 668, 790 520, 980 545 C 1170 570, 1340 480, 1660 610 L 1660 940 L -60 940 Z"
            fill={palette.farMountainSecondary}
            fillOpacity="0.34"
          />
          <path
            d="M -60 760 C 160 645, 340 655, 530 595 C 710 538, 910 640, 1110 565 C 1290 498, 1460 575, 1660 650 L 1660 940 L -60 940 Z"
            fill={palette.farMountain}
            fillOpacity="0.45"
          />
          <rect x="-60" y="610" width="1720" height="330" fill={`url(#${mistId})`} />
        </svg>
      </div>

      {/* Tầng 3: Đàn Hạc Bay & Vân Mây Cổ (+mx*24, -my*14) */}
      <div
        ref={layer3Ref}
        data-testid="son-ha-layer-3"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {/* Vân mây cuộn truyền thống bên trái & phải */}
          <g fill="none" strokeLinecap="round">
            <path
              d="M 110 215 C 155 190, 225 194, 265 215 C 300 232, 345 224, 378 206"
              stroke={palette.cloudPrimary}
              strokeWidth="2.5"
              strokeOpacity="0.42"
            />
            <path
              d="M 140 232 C 182 222, 232 238, 278 232"
              stroke={palette.cloudSecondary}
              strokeWidth="1.8"
              strokeOpacity="0.48"
            />
            <path
              d="M 1180 340 C 1245 318, 1310 326, 1365 344 C 1412 358, 1455 342, 1495 325"
              stroke={palette.cloudPrimary}
              strokeWidth="2.4"
              strokeOpacity="0.45"
            />
            <path
              d="M 1220 360 C 1278 352, 1335 366, 1392 356"
              stroke={palette.cloudSecondary}
              strokeWidth="1.6"
              strokeOpacity="0.5"
            />
          </g>

          {/* Đàn 6 chim hạc sải cánh bay nhẹ ngang bầu trời */}
          <g
            fill="none"
            stroke={palette.craneStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.72"
          >
            {CRANE_OFFSETS.map((crane, idx) => (
              <g key={idx} transform={`translate(${crane.x}, ${crane.y}) scale(${crane.scale})`}>
                <path d="M -14 4 Q -6 -8 0 0 Q 8 -9 16 3" />
                <path d="M 0 0 L 9 1" strokeWidth="1.4" />
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Tầng 4: Trung Sơn & Tháp Cổ Ẩn Hiện (+mx*32, +my*18) */}
      <div
        ref={layer4Ref}
        data-testid="son-ha-layer-4"
        className="absolute -inset-8 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {/* Dải núi sườn trái */}
          <path
            d="M -80 940 L -80 650 C 40 605, 175 635, 290 710 C 410 788, 530 825, 680 940 Z"
            fill={palette.midMountain}
            fillOpacity={atmosphere === 'dawn' ? '0.26' : '0.68'}
          />

          {/* Dải núi sườn phải + Bóng Tháp Cổ 3 tầng (Văn Miếu / Tháp Chùa Việt) */}
          <path
            d="M 960 940 C 1090 820, 1215 735, 1345 695 C 1455 660, 1560 645, 1680 685 L 1680 940 Z"
            fill={palette.midMountain}
            fillOpacity={atmosphere === 'dawn' ? '0.3' : '0.72'}
          />

          <g
            transform="translate(1315, 618)"
            fill={palette.pagodaFill}
            fillOpacity={atmosphere === 'dawn' ? '0.45' : '0.88'}
          >
            {/* Đế tháp & 3 tầng mái cong */}
            <rect x="14" y="54" width="44" height="24" rx="1" />
            <path d="M 4 56 Q 36 46 68 56 L 62 60 Q 36 53 10 60 Z" />
            <rect x="20" y="34" width="32" height="20" rx="1" />
            <path d="M 10 36 Q 36 27 62 36 L 56 40 Q 36 34 16 40 Z" />
            <rect x="26" y="17" width="20" height="17" rx="1" />
            <path d="M 16 19 Q 36 10 56 19 L 50 23 Q 36 17 22 23 Z" />
            <path d="M 36 2 L 39 14 L 33 14 Z" />
          </g>
        </svg>
      </div>

      {/* Tầng 5: Tiền Cảnh Lá Trúc / Cành Tùng Mảnh ở Góc Biên (+mx*45, +my*25) */}
      <div
        ref={layer5Ref}
        data-testid="son-ha-layer-5"
        className="absolute -inset-10 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {/* Cành trúc mảnh góc trên-trái */}
          <g fill={palette.foliageFill} fillOpacity={atmosphere === 'dawn' ? '0.24' : '0.52'}>
            <path
              d="M -10 120 Q 85 160 175 235"
              fill="none"
              stroke={palette.foliageFill}
              strokeOpacity={atmosphere === 'dawn' ? '0.28' : '0.55'}
              strokeWidth="2.5"
            />
            <path d="M 48 148 C 68 122, 95 112, 118 118 C 96 134, 72 146, 48 148 Z" />
            <path d="M 92 178 C 118 164, 152 162, 178 175 C 148 184, 118 186, 92 178 Z" />
            <path d="M 122 198 C 102 222, 96 250, 108 272 C 118 248, 126 224, 122 198 Z" />
            <path d="M 155 220 C 185 212, 214 218, 232 232 C 204 234, 178 230, 155 220 Z" />
          </g>

          {/* Nhành trúc mảnh sườn dưới-phải nối xuống vùng Hồ Sen */}
          <g fill={palette.foliageFill} fillOpacity={atmosphere === 'dawn' ? '0.28' : '0.6'}>
            <path
              d="M 1620 660 Q 1520 735 1440 855"
              fill="none"
              stroke={palette.foliageFill}
              strokeOpacity={atmosphere === 'dawn' ? '0.32' : '0.62'}
              strokeWidth="3"
            />
            <path d="M 1545 718 C 1515 692, 1480 684, 1455 692 C 1482 708, 1515 718, 1545 718 Z" />
            <path d="M 1502 764 C 1466 756, 1432 764, 1408 782 C 1442 782, 1474 776, 1502 764 Z" />
            <path d="M 1466 815 C 1436 822, 1410 842, 1398 866 C 1425 850, 1448 832, 1466 815 Z" />
          </g>
        </svg>
      </div>

      {/* Dải hòa sắc êm xuống khu vực tiếp theo */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 transition-colors duration-700"
        style={{ background: theme.bottomEdgeBlend }}
      />
    </div>
  );
}
