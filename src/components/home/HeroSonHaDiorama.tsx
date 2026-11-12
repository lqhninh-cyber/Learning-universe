import { useEffect, useId, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';
import { ATMOSPHERE_THEMES, type HeroAtmosphere } from './heroAtmosphere';

export interface HeroSonHaDioramaProps {
  readonly atmosphere: HeroAtmosphere;
  readonly className?: string;
}

const DAWN_TERRACES_BACK: ReadonlyArray<{
  readonly d: string;
  readonly fill: string;
  readonly rim?: string;
}> = [
  {
    d: 'M -60 470 C 180 410, 410 435, 640 485 C 880 535, 1180 430, 1660 495 L 1660 940 L -60 940 Z',
    fill: '#7FA57C',
    rim: '#F6EBC2',
  },
  {
    d: 'M -60 515 C 210 455, 450 495, 700 540 C 960 588, 1230 478, 1660 535 L 1660 940 L -60 940 Z',
    fill: '#5B8C5A',
    rim: '#FBF5DC',
  },
  {
    d: 'M -60 562 C 240 500, 490 555, 760 592 C 1020 628, 1270 520, 1660 582 L 1660 940 L -60 940 Z',
    fill: '#9FB659',
    rim: '#FEF9E5',
  },
];

const DAWN_TERRACES_MID: ReadonlyArray<{
  readonly d: string;
  readonly fill: string;
  readonly rim: string;
}> = [
  {
    d: 'M -80 612 C 210 560, 460 615, 730 645 C 1020 678, 1280 572, 1680 632 L 1680 940 L -80 940 Z',
    fill: '#E3B448',
    rim: '#FFF7DF',
  },
  {
    d: 'M -80 662 C 230 615, 510 668, 790 692 C 1070 715, 1320 625, 1680 682 L 1680 940 L -80 940 Z',
    fill: '#D49B27',
    rim: '#FBE8AF',
  },
  {
    d: 'M -80 712 C 260 672, 540 718, 840 742 C 1110 762, 1360 678, 1680 732 L 1680 940 L -80 940 Z',
    fill: '#5B8C5A',
    rim: '#E7F3E2',
  },
  {
    d: 'M -80 764 C 280 725, 590 768, 890 792 C 1160 812, 1410 738, 1680 785 L 1680 940 L -80 940 Z',
    fill: '#3C704D',
    rim: '#D7EAD4',
  },
];

const HALONG_FAR_ISLANDS: ReadonlyArray<string> = [
  'M 90 565 L 118 470 Q 145 450 175 468 L 210 520 L 235 455 Q 268 438 298 462 L 330 565 Z',
  'M 420 565 L 448 488 Q 478 472 512 490 L 548 565 Z',
  'M 720 565 L 748 462 Q 785 442 820 465 L 860 565 Z',
  'M 1030 565 L 1062 440 Q 1105 422 1140 448 L 1175 505 L 1205 446 Q 1242 432 1272 456 L 1308 565 Z',
  'M 1390 565 L 1425 468 Q 1465 450 1502 475 L 1545 565 Z',
];

const HALONG_MID_ISLANDS: ReadonlyArray<string> = [
  'M 210 585 L 232 455 C 242 418 286 418 302 458 L 325 510 L 352 442 C 368 415 412 422 426 462 L 456 585 Z',
  'M 640 585 L 664 478 C 674 445 712 442 732 472 L 758 585 Z',
  'M 890 585 L 916 420 C 930 385 978 386 994 426 L 1022 492 L 1054 415 C 1072 385 1118 392 1134 432 L 1168 585 Z',
  'M 1290 585 L 1322 435 C 1340 404 1394 405 1412 442 L 1455 585 Z',
];

const WATER_RIPPLES: ReadonlyArray<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly opacity: number;
}> = [
  { x: 420, y: 615, w: 120, opacity: 0.42 },
  { x: 640, y: 640, w: 185, opacity: 0.56 },
  { x: 780, y: 668, w: 230, opacity: 0.65 },
  { x: 560, y: 695, w: 170, opacity: 0.48 },
  { x: 890, y: 722, w: 260, opacity: 0.58 },
  { x: 710, y: 752, w: 210, opacity: 0.45 },
  { x: 960, y: 785, w: 245, opacity: 0.5 },
  { x: 480, y: 812, w: 160, opacity: 0.36 },
  { x: 1180, y: 655, w: 135, opacity: 0.38 },
  { x: 250, y: 680, w: 110, opacity: 0.32 },
];

/**
 * Cảnh quan Thiên nhiên Việt Nam 5 lớp 3D Parallax (`dawn` Ruộng Bậc Thang | `sunset` Vịnh Hạ Long | `night` Hang Sơn Đoòng)
 * Cập nhật 60fps bằng useRef + requestAnimationFrame, không trigger React re-render khi di chuột.
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

  const dawnMistId = `vn-dawn-mist-${uid}`;
  const dawnBeamId = `vn-dawn-beam-${uid}`;
  const dawnSkyGlowId = `vn-dawn-glow-${uid}`;

  const halongSeaId = `vn-halong-sea-${uid}`;
  const halongGlowId = `vn-halong-glow-${uid}`;
  const halongHazeId = `vn-halong-haze-${uid}`;

  const sondoongSinkholeId = `vn-sondoong-sinkhole-${uid}`;
  const sondoongBeamId = `vn-sondoong-beam-${uid}`;
  const sondoongFogId = `vn-sondoong-fog-${uid}`;

  return (
    <div
      data-testid="son-ha-diorama"
      data-atmosphere={atmosphere}
      data-landscape={
        atmosphere === 'dawn'
          ? 'ruong-bac-thang'
          : atmosphere === 'sunset'
            ? 'vinh-ha-long'
            : 'hang-son-doong'
      }
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden transition-colors duration-700 select-none',
        className,
      )}
      style={{ background: theme.skyGradient }}
    >
      {/* ===================================================================
          CẢNH QUAN 1 (`dawn`): RUỘNG BẬC THANG MÙ CANG CHẢI & HOÀNG LIÊN SƠN
          =================================================================== */}
      {atmosphere === 'dawn' && (
        <>
          {/* Tầng 1: Bầu trời bình minh, tia nắng xiên & dãy Hoàng Liên Sơn xa */}
          <div
            ref={layer1Ref}
            data-testid="son-ha-layer-1"
            className="absolute -inset-6 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              <defs>
                <radialGradient id={dawnSkyGlowId} cx="32%" cy="18%" r="55%">
                  <stop offset="0%" stopColor="#FFF5D6" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#F6DF9F" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F6DF9F" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={dawnBeamId} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF4CC" stopOpacity="0.48" />
                  <stop offset="65%" stopColor="#F3D687" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#F3D687" stopOpacity="0" />
                </linearGradient>
              </defs>

              <rect width="1600" height="900" fill={`url(#${dawnSkyGlowId})`} />

              {/* Tia nắng sớm nhẹ lướt xuống sườn núi */}
              <g className={prefersReducedMotion ? undefined : 'lu-beam-pulse'}>
                <polygon points="160,0 410,0 920,900 480,900" fill={`url(#${dawnBeamId})`} />
                <polygon points="520,0 680,0 1220,900 960,900" fill={`url(#${dawnBeamId})`} />
              </g>

              {/* Đỉnh Hoàng Liên Sơn xa mờ sương */}
              <path
                d="M -60 440 C 140 350, 310 295, 480 345 C 650 395, 810 260, 1020 315 C 1220 365, 1380 275, 1660 355 L 1660 940 L -60 940 Z"
                fill="#A8C0B2"
                fillOpacity="0.42"
              />
              <path
                d="M -60 470 C 120 390, 340 380, 560 340 C 760 305, 960 395, 1180 340 C 1360 295, 1490 365, 1660 415 L 1660 940 L -60 940 Z"
                fill="#88A997"
                fillOpacity="0.48"
              />
            </svg>
          </div>

          {/* Tầng 2: Biển mây trắng bồng bềnh ngang thung lũng */}
          <div
            ref={layer2Ref}
            data-testid="son-ha-layer-2"
            className="absolute -inset-6 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id={dawnMistId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                  <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.72" />
                  <stop offset="100%" stopColor="#EAF2EA" stopOpacity="0" />
                </linearGradient>
              </defs>

              <g className={prefersReducedMotion ? undefined : 'lu-cloud-drift'}>
                <path
                  d="M -120 430 Q 40 392 220 418 Q 380 385 560 416 Q 740 388 940 422 Q 1140 390 1360 424 Q 1520 398 1720 432 L 1720 515 L -120 515 Z"
                  fill="#FFFFFF"
                  fillOpacity="0.58"
                />
                <path
                  d="M -80 458 Q 140 428 340 452 Q 560 420 790 456 Q 1030 425 1260 458 Q 1470 432 1680 462 L 1680 540 L -80 540 Z"
                  fill="#F7FAF6"
                  fillOpacity="0.65"
                />
              </g>
              <rect x="-60" y="385" width="1720" height="175" fill={`url(#${dawnMistId})`} />
            </svg>
          </div>

          {/* Tầng 3: Những thửa ruộng bậc thang tầm xa (Lúa non & lúa trổ đòng) */}
          <div
            ref={layer3Ref}
            data-testid="son-ha-layer-3"
            className="absolute -inset-6 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              {DAWN_TERRACES_BACK.map((step, idx) => (
                <g key={idx}>
                  <path d={step.d} fill={step.fill} fillOpacity="0.76" />
                  {step.rim && (
                    <path
                      d={step.d.split(' L ')[0]}
                      fill="none"
                      stroke={step.rim}
                      strokeWidth="2"
                      strokeOpacity="0.6"
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Tầng 4: Ruộng bậc thang tầng trung (Vàng lúa chín & xanh rừng thẳm) */}
          <div
            ref={layer4Ref}
            data-testid="son-ha-layer-4"
            className="absolute -inset-8 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              {DAWN_TERRACES_MID.map((step, idx) => (
                <g key={idx}>
                  <path d={step.d} fill={step.fill} fillOpacity="0.88" />
                  <path
                    d={step.d.split(' L ')[0]}
                    fill="none"
                    stroke={step.rim}
                    strokeWidth="2.4"
                    strokeOpacity="0.68"
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Tầng 5: Sườn đồi xanh thẳm tiền cảnh */}
          <div
            ref={layer5Ref}
            data-testid="son-ha-layer-5"
            className="absolute -inset-10 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              <path
                d="M -90 818 C 190 778, 490 822, 810 842 C 1120 860, 1410 788, 1690 826 L 1690 950 L -90 950 Z"
                fill="#234F3B"
                fillOpacity="0.92"
              />
              <path
                d="M -90 818 C 190 778, 490 822, 810 842 C 1120 860, 1410 788, 1690 826"
                fill="none"
                stroke="#C5E0B4"
                strokeWidth="2"
                strokeOpacity="0.45"
              />
            </svg>
          </div>
        </>
      )}

      {/* ===================================================================
          CẢNH QUAN 2 (`sunset`): VỊNH HẠ LONG – BÁI TỬ LONG & BIỂN NGỌC
          =================================================================== */}
      {atmosphere === 'sunset' && (
        <>
          {/* Tầng 1: Ráng chiều Vịnh Hạ Long ấm áp & dải núi mờ chân trời */}
          <div
            ref={layer1Ref}
            data-testid="son-ha-layer-1"
            className="absolute -inset-6 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              <defs>
                <radialGradient id={halongGlowId} cx="62%" cy="54%" r="48%">
                  <stop offset="0%" stopColor="#FFE1A1" stopOpacity="0.72" />
                  <stop offset="45%" stopColor="#E48F55" stopOpacity="0.34" />
                  <stop offset="100%" stopColor="#E48F55" stopOpacity="0" />
                </radialGradient>
              </defs>

              <rect width="1600" height="620" fill={`url(#${halongGlowId})`} />

              {/* Dãy đảo mờ nơi đường chân trời */}
              <path
                d="M -60 555 L 70 495 L 150 535 L 280 482 L 360 530 L 520 475 L 610 528 L 780 490 L 880 538 L 1060 478 L 1180 532 L 1340 486 L 1460 530 L 1660 495 L 1660 600 L -60 600 Z"
                fill="#4D3D4A"
                fillOpacity="0.48"
              />
            </svg>
          </div>

          {/* Tầng 2: Quần thể đảo núi đá vôi (Karst) tầng xa */}
          <div
            ref={layer2Ref}
            data-testid="son-ha-layer-2"
            className="absolute -inset-6 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id={halongHazeId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#E5A76E" stopOpacity="0" />
                  <stop offset="100%" stopColor="#2E6F64" stopOpacity="0.55" />
                </linearGradient>
              </defs>

              {HALONG_FAR_ISLANDS.map((pathD, idx) => (
                <path key={idx} d={pathD} fill="#2B5B55" fillOpacity="0.75" />
              ))}
              <rect x="-60" y="505" width="1720" height="80" fill={`url(#${halongHazeId})`} />
            </svg>
          </div>

          {/* Tầng 3: Đảo đá vôi vách đứng tầng trung & Thuyền buồm cánh dơi Việt Nam */}
          <div
            ref={layer3Ref}
            data-testid="son-ha-layer-3"
            className="absolute -inset-6 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              {HALONG_MID_ISLANDS.map((pathD, idx) => (
                <path key={idx} d={pathD} fill="#164E46" fillOpacity="0.92" />
              ))}

              {/* Thuyền buồm cánh dơi truyền thống lướt nhẹ trên mặt vịnh */}
              <g className={prefersReducedMotion ? undefined : 'lu-boat-glide'}>
                {/* Thuyền chính ở trung cảnh */}
                <g transform="translate(815, 560)" fill="#201A1D">
                  <path d="M -28 24 L 26 24 L 18 32 L -20 32 Z" />
                  <path d="M -2 24 L -2 -14 C 12 -10 22 4 19 20 L -2 20 Z" fill="#4A2724" />
                  <path d="M -5 23 L -5 -4 C -16 0 -22 10 -18 20 L -5 20 Z" fill="#63332C" />
                  <g stroke="#F6D07A" strokeWidth="0.75" strokeOpacity="0.45">
                    <line x1="-2" y1="2" x2="15" y2="4" />
                    <line x1="-2" y1="9" x2="18" y2="11" />
                    <line x1="-2" y1="15" x2="17" y2="17" />
                  </g>
                </g>

                {/* Thuyền xa nhỏ ở phía phải */}
                <g transform="translate(1195, 566) scale(0.72)" fill="#262024" opacity="0.88">
                  <path d="M -26 22 L 24 22 L 16 29 L -18 29 Z" />
                  <path d="M -1 22 L -1 -12 C 11 -8 19 5 17 18 L -1 18 Z" fill="#522C28" />
                </g>
              </g>
            </svg>
          </div>

          {/* Tầng 4: Mặt biển xanh ngọc lục bảo & Gợn sóng phản chiếu ánh vàng */}
          <div
            ref={layer4Ref}
            data-testid="son-ha-layer-4"
            className="absolute -inset-8 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id={halongSeaId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3B9683" />
                  <stop offset="45%" stopColor="#226F63" />
                  <stop offset="100%" stopColor="#164E46" />
                </linearGradient>
              </defs>

              <rect x="-80" y="582" width="1760" height="360" fill={`url(#${halongSeaId})`} />

              {/* Phản quang bóng núi trên mặt nước */}
              <path
                d="M 210 582 L 456 582 L 420 675 L 250 675 Z"
                fill="#113D37"
                fillOpacity="0.4"
              />
              <path
                d="M 890 582 L 1168 582 L 1110 700 L 925 700 Z"
                fill="#113D37"
                fillOpacity="0.45"
              />

              {/* Gợn sóng ánh sáng vàng lấp lánh */}
              <g className={prefersReducedMotion ? undefined : 'lu-water-shimmer'}>
                {WATER_RIPPLES.map((ripple, idx) => (
                  <rect
                    key={idx}
                    x={ripple.x}
                    y={ripple.y}
                    width={ripple.w}
                    height="3"
                    rx="1.5"
                    fill="#F6D07A"
                    fillOpacity={ripple.opacity}
                  />
                ))}
              </g>
            </svg>
          </div>

          {/* Tầng 5: Mũi đá vôi tiền cảnh hai bên vịnh */}
          <div
            ref={layer5Ref}
            data-testid="son-ha-layer-5"
            className="absolute -inset-10 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              <path
                d="M -90 950 L -90 615 L 40 570 C 90 575 118 628 145 705 L 185 950 Z"
                fill="#0F3B34"
                fillOpacity="0.88"
              />
              <path
                d="M 1425 950 L 1468 680 C 1490 605 1538 565 1615 585 L 1690 620 L 1690 950 Z"
                fill="#0D342E"
                fillOpacity="0.92"
              />
            </svg>
          </div>
        </>
      )}

      {/* ===================================================================
          CẢNH QUAN 3 (`night`): HANG SƠN ĐOÒNG – HỐ SỤT ÁNH SÁNG & RỪNG NGUYÊN SINH
          =================================================================== */}
      {atmosphere === 'night' && (
        <>
          {/* Tầng 1: Hố sụt trời mở phía trên & Luồng tia sáng volumetric */}
          <div
            ref={layer1Ref}
            data-testid="son-ha-layer-1"
            className="absolute -inset-6 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              <defs>
                <radialGradient id={sondoongSinkholeId} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ECFFF5" stopOpacity="0.95" />
                  <stop offset="45%" stopColor="#86EFAC" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#86EFAC" stopOpacity="0" />
                </radialGradient>
                <linearGradient id={sondoongBeamId} x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#E6FFF2" stopOpacity="0.34" />
                  <stop offset="55%" stopColor="#86EFAC" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#3B825D" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Quầng sáng cửa hố sụt trời cao */}
              <ellipse cx="1060" cy="85" rx="280" ry="175" fill={`url(#${sondoongSinkholeId})`} />

              {/* Các luồng tia sáng mặt trời chiếu xuyên qua làn sương trong hang */}
              <g className={prefersReducedMotion ? undefined : 'lu-beam-pulse'}>
                <polygon points="880,0 1190,0 1440,900 720,900" fill={`url(#${sondoongBeamId})`} />
                <polygon points="940,0 1110,0 1230,900 840,900" fill={`url(#${sondoongBeamId})`} />
                <polygon
                  points="560,0 710,0 880,900 500,900"
                  fill={`url(#${sondoongBeamId})`}
                  opacity="0.45"
                />
              </g>
            </svg>
          </div>

          {/* Tầng 2: Khối đá vòm hang sâu & sương mù xanh ngọc */}
          <div
            ref={layer2Ref}
            data-testid="son-ha-layer-2"
            className="absolute -inset-6 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              <defs>
                <linearGradient id={sondoongFogId} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#143326" stopOpacity="0" />
                  <stop offset="100%" stopColor="#256246" stopOpacity="0.52" />
                </linearGradient>
              </defs>

              {/* Măng đá lớn vươn lên trong sương hang */}
              <path
                d="M 380 900 L 420 560 Q 455 490 485 560 L 535 900 Z"
                fill="#112920"
                fillOpacity="0.72"
              />
              <path
                d="M 1180 900 L 1225 510 Q 1260 440 1295 515 L 1350 900 Z"
                fill="#10281F"
                fillOpacity="0.78"
              />

              {/* Thạch nhũ rủ từ vòm xa */}
              <path
                d="M 480 -20 L 540 185 Q 555 215 570 185 L 620 -20 Z"
                fill="#0D2119"
                fillOpacity="0.82"
              />
              <path
                d="M 1290 -20 L 1340 215 Q 1358 250 1378 215 L 1430 -20 Z"
                fill="#0D2119"
                fillOpacity="0.82"
              />

              <rect x="-60" y="540" width="1720" height="360" fill={`url(#${sondoongFogId})`} />
            </svg>
          </div>

          {/* Tầng 3: Thảm rừng nguyên sinh Vườn Địa Đàng dưới ánh sáng hố sụt */}
          <div
            ref={layer3Ref}
            data-testid="son-ha-layer-3"
            className="absolute -inset-6 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              {/* Tán cây rừng nguyên sinh nhận sáng mặt trời */}
              <path
                d="M 460 920 L 460 720 Q 540 620 640 660 Q 740 570 860 645 Q 980 540 1120 625 Q 1240 585 1360 680 L 1360 920 Z"
                fill="#1E5238"
                fillOpacity="0.88"
              />
              <path
                d="M 620 920 L 620 755 Q 720 675 820 715 Q 940 620 1065 690 Q 1165 645 1280 735 L 1280 920 Z"
                fill="#2F7E54"
                fillOpacity="0.82"
              />
              {/* Đỉnh dương xỉ & tán lá sáng biếc trong luồng nắng */}
              <path
                d="M 790 770 Q 860 695 940 740 Q 1020 670 1110 745 L 1110 920 L 790 920 Z"
                fill="#44A36E"
                fillOpacity="0.58"
              />
            </svg>
          </div>

          {/* Tầng 4: Vòm thạch nhũ rủ xuống & măng đá tầm trung */}
          <div
            ref={layer4Ref}
            data-testid="son-ha-layer-4"
            className="absolute -inset-8 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              {/* Vòm trần thạch nhũ sắc nét */}
              <path
                d="M -80 -20 L 1680 -20 L 1680 185 L 1540 115 L 1490 230 L 1435 125 L 1370 170 L 1310 75 L 820 40 L 745 160 L 690 95 L 615 245 L 555 110 L 455 190 L 385 85 L 270 165 L -80 245 Z"
                fill="#091711"
                fillOpacity="0.94"
              />
              {/* Măng đá sườn hai bên */}
              <path
                d="M 190 940 L 235 635 Q 260 565 288 640 L 340 940 Z"
                fill="#0B1C15"
                fillOpacity="0.94"
              />
              <path
                d="M 1340 940 L 1390 590 Q 1422 520 1455 595 L 1525 940 Z"
                fill="#0B1C15"
                fillOpacity="0.95"
              />
            </svg>
          </div>

          {/* Tầng 5: Khung vòm đá vôi tiền cảnh ôm trọn không gian hang động */}
          <div
            ref={layer5Ref}
            data-testid="son-ha-layer-5"
            className="absolute -inset-10 will-change-transform"
          >
            <svg
              viewBox="0 0 1600 900"
              preserveAspectRatio="xMidYMid slice"
              className="h-full w-full"
            >
              {/* Sườn vách đá trái & phải */}
              <path
                d="M -100 -40 L 190 -40 C 125 140, 85 320, 120 510 C 155 690, 210 810, 260 960 L -100 960 Z"
                fill="#050D0A"
                fillOpacity="0.95"
              />
              <path
                d="M 1700 -40 L 1465 -40 C 1535 130, 1560 340, 1510 535 C 1465 710, 1395 820, 1335 960 L 1700 960 Z"
                fill="#050D0A"
                fillOpacity="0.95"
              />
            </svg>
          </div>
        </>
      )}

      {/* Dải hòa sắc êm xuống khu vực tiếp theo */}
      <div
        className="absolute inset-x-0 bottom-0 h-24 transition-colors duration-700"
        style={{ background: theme.bottomEdgeBlend }}
      />
    </div>
  );
}
