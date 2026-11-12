import { useEffect, useId, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface HeroSonHaDioramaProps {
  readonly className?: string;
}

interface KarstIslandSpec {
  readonly id: string;
  readonly waterY: number;
  readonly bodyPath: string;
  readonly litFacePath: string;
  readonly foliagePaths: readonly string[];
  readonly fissurePaths: readonly string[];
}

const WATERLINE_Y = 535;

/**
 * Tầng 1: Viễn cảnh sát chân trời (opaque 0.35, đa giác đá vôi mờ xa hòa ráng chiều)
 */
const LAYER1_FAR_HORIZON_ISLANDS: readonly string[] = [
  'M -40 538 L -18 518 L 12 488 L 34 494 L 58 468 L 82 476 L 106 446 L 134 452 L 154 474 L 182 465 L 208 492 L 234 486 L 260 510 L 284 516 L 274 528 L 268 538 Z',
  'M 304 538 L 314 522 L 328 496 L 346 502 L 368 474 L 390 482 L 414 458 L 438 468 L 460 452 L 484 466 L 508 490 L 532 498 L 548 520 L 538 530 L 532 538 Z',
  'M 575 538 L 586 520 L 604 494 L 626 500 L 646 476 L 670 484 L 692 468 L 716 482 L 738 504 L 758 518 L 748 530 L 742 538 Z',
  'M 885 538 L 896 522 L 916 492 L 940 498 L 964 466 L 990 474 L 1018 450 L 1044 462 L 1072 486 L 1098 494 L 1122 518 L 1112 529 L 1106 538 Z',
  'M 1148 538 L 1160 518 L 1184 488 L 1212 496 L 1236 460 L 1264 470 L 1292 444 L 1320 458 L 1348 482 L 1378 474 L 1408 496 L 1438 506 L 1464 524 L 1452 532 L 1446 538 Z',
];

/**
 * Tầng 2: Trung cảnh xa (cụm tháp đá vôi 25-35 điểm/đảo có vách 75-85 độ & hàm ếch đáy đảo)
 */
const LAYER2_MID_FAR_ISLANDS: readonly KarstIslandSpec[] = [
  {
    id: 'far-karst-west',
    waterY: 538,
    bodyPath:
      'M 118 538 L 126 530 L 114 520 L 110 494 L 118 466 L 124 434 L 136 410 L 148 418 L 160 390 L 176 398 L 192 368 L 210 380 L 226 352 L 244 364 L 260 392 L 274 386 L 290 412 L 308 406 L 324 438 L 336 468 L 342 498 L 336 520 L 322 530 L 328 538 Z',
    litFacePath:
      'M 226 352 L 244 364 L 260 392 L 274 386 L 290 412 L 308 406 L 324 438 L 336 468 L 342 498 L 336 520 L 322 530 L 328 538 L 242 538 L 236 485 L 222 442 L 232 396 Z',
    foliagePaths: [
      'M 132 414 Q 146 396 164 388 Q 180 398 196 368 Q 214 374 228 352 Q 248 360 264 394 Q 240 400 220 394 Q 190 408 164 408 Z',
    ],
    fissurePaths: ['M 184 416 L 180 486', 'M 218 402 L 214 512', 'M 278 416 L 284 498'],
  },
  {
    id: 'far-karst-center-left',
    waterY: 538,
    bodyPath:
      'M 452 538 L 460 529 L 448 518 L 444 492 L 452 462 L 462 432 L 474 406 L 488 414 L 502 384 L 518 394 L 534 368 L 552 380 L 566 408 L 580 402 L 594 436 L 604 466 L 608 498 L 602 520 L 588 530 L 594 538 Z',
    litFacePath:
      'M 534 368 L 552 380 L 566 408 L 580 402 L 594 436 L 604 466 L 608 498 L 602 520 L 588 530 L 594 538 L 536 538 L 530 488 L 524 432 Z',
    foliagePaths: [
      'M 472 410 Q 492 382 518 388 Q 536 364 556 382 Q 570 404 584 406 Q 554 414 522 410 Q 495 416 472 410 Z',
    ],
    fissurePaths: ['M 498 424 L 494 504', 'M 556 420 L 562 508'],
  },
  {
    id: 'far-karst-east',
    waterY: 538,
    bodyPath:
      'M 1030 538 L 1038 529 L 1024 518 L 1020 486 L 1028 452 L 1038 418 L 1052 388 L 1068 398 L 1086 362 L 1106 376 L 1126 342 L 1146 356 L 1166 386 L 1184 378 L 1204 412 L 1222 404 L 1240 442 L 1252 478 L 1256 508 L 1246 524 L 1232 531 L 1238 538 Z',
    litFacePath:
      'M 1030 538 L 1038 529 L 1024 518 L 1020 486 L 1028 452 L 1038 418 L 1052 388 L 1068 398 L 1086 362 L 1106 376 L 1126 342 L 1122 416 L 1114 484 L 1118 538 Z',
    foliagePaths: [
      'M 1064 394 Q 1086 358 1106 374 Q 1128 338 1150 356 Q 1170 384 1188 380 Q 1158 398 1126 392 Q 1094 402 1064 394 Z',
    ],
    fissurePaths: ['M 1084 414 L 1080 510', 'M 1144 392 L 1148 504', 'M 1196 426 L 1202 512'],
  },
];

/**
 * Tầng 3: Trung cảnh gần (Cụm đảo Karst sắc nét + Hòn Trống Mái biểu tượng)
 */
const LAYER3_MID_NEAR_ISLANDS: readonly KarstIslandSpec[] = [
  {
    id: 'near-karst-left',
    waterY: WATERLINE_Y,
    bodyPath:
      'M 218 535 L 228 524 L 210 512 L 202 478 L 208 438 L 216 392 L 226 352 L 238 362 L 252 324 L 266 336 L 284 294 L 302 310 L 320 278 L 338 298 L 354 334 L 370 326 L 386 366 L 402 358 L 418 402 L 430 444 L 436 488 L 428 514 L 410 526 L 418 535 Z',
    litFacePath:
      'M 320 278 L 338 298 L 354 334 L 370 326 L 386 366 L 402 358 L 418 402 L 430 444 L 436 488 L 428 514 L 410 526 L 418 535 L 348 535 L 340 472 L 328 412 L 336 346 Z',
    foliagePaths: [
      'M 234 358 Q 254 316 270 334 Q 284 288 304 308 Q 322 272 342 296 Q 360 330 376 326 Q 350 344 322 336 Q 290 350 264 348 Z',
    ],
    fissurePaths: [
      'M 262 368 L 256 492',
      'M 298 342 L 292 508',
      'M 366 364 L 374 494',
      'M 396 410 L 404 510',
    ],
  },
  {
    id: 'near-karst-right',
    waterY: WATERLINE_Y,
    bodyPath:
      'M 1126 535 L 1136 525 L 1118 512 L 1110 474 L 1118 430 L 1128 386 L 1142 344 L 1156 356 L 1172 316 L 1190 330 L 1208 286 L 1228 304 L 1248 264 L 1268 286 L 1286 324 L 1304 318 L 1324 360 L 1342 354 L 1362 402 L 1374 448 L 1380 490 L 1370 515 L 1350 525 L 1358 535 Z',
    litFacePath:
      'M 1126 535 L 1136 525 L 1118 512 L 1110 474 L 1118 430 L 1128 386 L 1142 344 L 1156 356 L 1172 316 L 1190 330 L 1208 286 L 1228 304 L 1248 264 L 1236 334 L 1222 414 L 1216 490 L 1220 535 Z',
    foliagePaths: [
      'M 1152 352 Q 1172 310 1192 328 Q 1208 280 1230 302 Q 1250 258 1272 284 Q 1292 320 1310 318 Q 1276 336 1244 330 Q 1202 344 1174 344 Z',
    ],
    fissurePaths: [
      'M 1170 356 L 1164 494',
      'M 1212 332 L 1206 508',
      'M 1282 340 L 1288 498',
      'M 1326 392 L 1334 506',
    ],
  },
];

/**
 * Biểu tượng Hòn Trống Mái (Fighting Cocks Islet) tại khoảng giữa trung cảnh
 * Hai khối đá vôi nghiêng đối diện nhau với phần chân thắt hẹp bị thủy triều bào mòn
 */
const HON_TRONG_MAI: readonly KarstIslandSpec[] = [
  {
    id: 'hon-trong',
    waterY: 548,
    bodyPath:
      'M 756 548 L 762 536 L 758 522 L 748 504 L 742 478 L 746 448 L 754 420 L 764 398 L 774 388 L 786 396 L 798 382 L 808 394 L 814 416 L 810 442 L 800 470 L 788 496 L 780 518 L 776 534 L 784 548 Z',
    litFacePath:
      'M 774 388 L 786 396 L 798 382 L 808 394 L 814 416 L 810 442 L 800 470 L 788 496 L 780 518 L 776 534 L 784 548 L 772 548 L 768 518 L 772 474 L 778 430 Z',
    foliagePaths: ['M 764 402 Q 778 384 794 386 Q 806 382 812 400 Q 794 404 774 404 Z'],
    fissurePaths: ['M 768 416 L 762 504', 'M 792 414 L 784 494'],
  },
  {
    id: 'hon-mai',
    waterY: 548,
    bodyPath:
      'M 848 548 L 854 534 L 848 518 L 836 492 L 826 462 L 822 434 L 826 408 L 836 396 L 848 404 L 860 392 L 874 402 L 886 426 L 892 456 L 888 486 L 878 512 L 870 528 L 874 548 Z',
    litFacePath:
      'M 848 548 L 854 534 L 848 518 L 836 492 L 826 462 L 822 434 L 826 408 L 836 396 L 848 404 L 852 440 L 854 492 L 858 548 Z',
    foliagePaths: ['M 830 408 Q 844 390 860 392 Q 876 394 884 414 Q 862 414 842 412 Z'],
    fissurePaths: ['M 846 422 L 842 502', 'M 870 426 L 868 506'],
  },
];

interface JunkBoatProps {
  readonly testId: string;
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly flipX?: boolean;
  readonly sailGradId: string;
  readonly reflectGradId: string;
  readonly reflectBlurId: string;
  readonly animationClass?: string;
}

/**
 * Thuyền gỗ buồm cánh dơi truyền thống Hạ Long (3 cánh buồm nan quạt + nan tre ngang + bóng phản chiếu)
 */
function BatWingJunkBoat({
  testId,
  x,
  y,
  scale,
  flipX = false,
  sailGradId,
  reflectGradId,
  reflectBlurId,
  animationClass,
}: JunkBoatProps) {
  const sailGroup = (
    <g>
      {/* Thân thuyền gỗ cong mềm mại, mũi & lái nâng cao */}
      <path
        d="M -68 -6 Q -32 3 0 3 Q 36 3 72 -9 L 58 6 Q 28 11 0 11 Q -28 11 -54 6 Z"
        fill="#22130F"
      />
      <path
        d="M -64 -5 Q -28 3 0 3 Q 32 3 68 -8"
        fill="none"
        stroke="#C88A56"
        strokeWidth="1.4"
        strokeOpacity="0.65"
      />

      {/* Cột buồm mảnh */}
      <g stroke="#2F1812" strokeWidth="2.1" strokeLinecap="round">
        <line x1="-28" y1="3" x2="-35" y2="-66" />
        <line x1="2" y1="3" x2="-4" y2="-92" />
        <line x1="34" y1="2" x2="29" y2="-56" />
      </g>

      {/* Cánh buồm mũi (Fore Lug Sail) */}
      <path
        d="M -35 -64 C -18 -60, -10 -44, -12 -18 L -32 -14 C -36 -30, -37 -48, -35 -64 Z"
        fill={`url(#${sailGradId})`}
      />
      <g stroke="#441E14" strokeWidth="0.9" strokeOpacity="0.72" fill="none">
        <path d="M -35 -52 Q -24 -50 -16 -52" />
        <path d="M -35 -42 Q -22 -39 -13 -42" />
        <path d="M -34 -32 Q -22 -29 -12 -32" />
        <path d="M -33 -22 Q -22 -19 -12 -22" />
      </g>

      {/* Cánh buồm chính giữa (Main Bat-Wing Lug Sail) */}
      <path
        d="M -4 -88 C 18 -84, 32 -60, 29 -18 L -2 -12 C -8 -36, -9 -62, -4 -88 Z"
        fill={`url(#${sailGradId})`}
      />
      <g stroke="#441E14" strokeWidth="1" strokeOpacity="0.75" fill="none">
        <path d="M -4 -75 Q 10 -72 21 -74" />
        <path d="M -5 -63 Q 11 -60 25 -62" />
        <path d="M -5 -51 Q 12 -47 28 -50" />
        <path d="M -5 -39 Q 12 -35 29 -38" />
        <path d="M -4 -27 Q 12 -23 29 -26" />
        <path d="M -3 -16 Q 13 -13 29 -16" />
      </g>

      {/* Cánh buồm lái (Mizzen Lug Sail) */}
      <path
        d="M 29 -54 C 46 -49, 54 -34, 51 -14 L 31 -10 C 27 -24, 27 -40, 29 -54 Z"
        fill={`url(#${sailGradId})`}
      />
      <g stroke="#441E14" strokeWidth="0.85" strokeOpacity="0.7" fill="none">
        <path d="M 29 -43 Q 39 -41 47 -43" />
        <path d="M 29 -33 Q 40 -30 50 -32" />
        <path d="M 30 -23 Q 41 -20 51 -22" />
        <path d="M 30 -14 Q 41 -12 51 -14" />
      </g>
    </g>
  );

  return (
    <g
      data-testid={testId}
      transform={`translate(${x}, ${y}) scale(${flipX ? -scale : scale}, ${scale})`}
    >
      <g className={animationClass}>
        {/* Bóng đổ lộn ngược của thuyền xuống mặt biển (scaleY -0.45) */}
        <g
          transform="translate(0, 10) scale(1, -0.45) translate(0, -10)"
          filter={`url(#${reflectBlurId})`}
          opacity="0.52"
        >
          <path
            d="M -68 -6 Q -32 3 0 3 Q 36 3 72 -9 L 58 6 Q 28 11 0 11 Q -28 11 -54 6 Z"
            fill={`url(#${reflectGradId})`}
          />
          <path
            d="M -35 -64 C -18 -60, -10 -44, -12 -18 L -32 -14 Z"
            fill={`url(#${reflectGradId})`}
          />
          <path d="M -4 -88 C 18 -84, 32 -60, 29 -18 L -2 -12 Z" fill={`url(#${reflectGradId})`} />
          <path d="M 29 -54 C 46 -49, 54 -34, 51 -14 L 31 -10 Z" fill={`url(#${reflectGradId})`} />
        </g>

        {/* Thân thuyền & 3 cánh buồm */}
        {sailGroup}
      </g>
    </g>
  );
}

/**
 * Cảnh quan Vịnh Hạ Long Chân thực 4 tầng Chiều sâu Khí quyển:
 * - Địa hình Karst vách đứng 75°-85°, chóp nhọn & hàm ếch thủy triều (25-40 điểm/đảo)
 * - Phân tách sườn sáng hoàng hôn (#8C7A6B -> #C88A56) & sườn rêu bóng tối (#132A26 -> #1E3F37)
 * - Hòn Trống Mái nổi bật giữa khe thoáng trung cảnh
 * - 2 thuyền buồm cánh dơi 3 cánh buồm nan tre nhấp nhô nhẹ theo nhịp sóng
 * - Bóng đảo đổ ngược mặt biển scaleY(-0.45) làm nhòe ngang tự nhiên
 */
export function HeroSonHaDiorama({ className }: HeroSonHaDioramaProps) {
  const uid = useId().replace(/:/g, '');
  const prefersReducedMotion = useReducedMotion();

  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);
  const layer4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyNeutral = () => {
      for (const ref of [layer1Ref, layer2Ref, layer3Ref, layer4Ref]) {
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
        layer1Ref.current.style.transform = `translate3d(${(-currentX * 8).toFixed(2)}px, ${(-currentY * 6).toFixed(2)}px, 0px)`;
      }
      if (layer2Ref.current) {
        layer2Ref.current.style.transform = `translate3d(${(-currentX * 16).toFixed(2)}px, ${(-currentY * 10).toFixed(2)}px, 0px)`;
      }
      if (layer3Ref.current) {
        layer3Ref.current.style.transform = `translate3d(${(currentX * 26).toFixed(2)}px, ${(currentY * 14).toFixed(2)}px, 0px)`;
      }
      if (layer4Ref.current) {
        layer4Ref.current.style.transform = `translate3d(${(currentX * 42).toFixed(2)}px, ${(currentY * 22).toFixed(2)}px, 0px)`;
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

  const skyGradId = `hl-sky-${uid}`;
  const sunsetGlowId = `hl-sunset-${uid}`;
  const seaGradId = `hl-sea-${uid}`;
  const litRockGradId = `hl-rock-lit-${uid}`;
  const darkRockGradId = `hl-rock-dark-${uid}`;
  const midFarRockGradId = `hl-rock-midfar-${uid}`;
  const midFarLitGradId = `hl-rock-midfar-lit-${uid}`;
  const reflectGrad535Id = `hl-reflect-535-${uid}`;
  const reflectGrad548Id = `hl-reflect-548-${uid}`;
  const boatReflectGradId = `hl-boat-reflect-${uid}`;
  const sailGradId = `hl-sail-${uid}`;
  const mistBlurId = `hl-mist-blur-${uid}`;
  const waterBlurId = `hl-water-blur-${uid}`;

  return (
    <div
      data-testid="son-ha-diorama"
      data-landscape="vinh-ha-long"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden select-none', className)}
      style={{
        background: 'linear-gradient(180deg, #1E2433 0%, #5B353B 34%, #C47A4C 60%, #133832 100%)',
      }}
    >
      {/* TẦNG 1 (Viễn cảnh sát chân trời): Bầu trời hoàng hôn + dãy đảo tím sương opacity 0.35 (-mx*8) */}
      <div
        ref={layer1Ref}
        data-testid="son-ha-layer-1"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={skyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1B2130" />
              <stop offset="34%" stopColor="#4F3542" />
              <stop offset="52%" stopColor="#A95C46" />
              <stop offset="60%" stopColor="#E6A669" />
              <stop offset="62%" stopColor="#133832" />
            </linearGradient>
            <radialGradient id={sunsetGlowId} cx="51%" cy="56%" r="44%">
              <stop offset="0%" stopColor="#FFF0C2" stopOpacity="0.82" />
              <stop offset="36%" stopColor="#F0A259" stopOpacity="0.45" />
              <stop offset="72%" stopColor="#C46B49" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#C46B49" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width="1600" height="560" fill={`url(#${skyGradId})`} />
          <rect width="1600" height="580" fill={`url(#${sunsetGlowId})`} />

          {/* Dải đảo đá viễn cảnh sát đường chân trời (tím sương – xanh lam nhạt, opacity 0.35) */}
          <g fill="#6B6882" opacity="0.35">
            {LAYER1_FAR_HORIZON_ISLANDS.map((d, idx) => (
              <path key={idx} d={d} />
            ))}
          </g>
        </svg>
      </div>

      {/* TẦNG 2 (Trung cảnh xa): Đảo Karst nhiều tầng + Sương mù trắng mờ feGaussianBlur (-mx*16) */}
      <div
        ref={layer2Ref}
        data-testid="son-ha-layer-2"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={midFarRockGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A4645" />
              <stop offset="100%" stopColor="#1A3331" />
            </linearGradient>
            <linearGradient id={midFarLitGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#B8845B" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#6D6360" stopOpacity="0.45" />
            </linearGradient>
            <filter id={mistBlurId} x="-15%" y="-40%" width="130%" height="180%">
              <feGaussianBlur stdDeviation="20 6" />
            </filter>
          </defs>

          {LAYER2_MID_FAR_ISLANDS.map((island) => (
            <g key={island.id} opacity="0.82">
              <path d={island.bodyPath} fill={`url(#${midFarRockGradId})`} />
              <path d={island.litFacePath} fill={`url(#${midFarLitGradId})`} />
              {island.foliagePaths.map((fPath, idx) => (
                <path key={idx} d={fPath} fill="#16312C" opacity="0.85" />
              ))}
              <g stroke="#112420" strokeWidth="1" strokeOpacity="0.45" fill="none">
                {island.fissurePaths.map((linePath, idx) => (
                  <path key={idx} d={linePath} />
                ))}
              </g>
            </g>
          ))}

          {/* Dải sương mù trắng mờ luồn ngang lưng chừng đảo trung cảnh xa */}
          <g
            filter={`url(#${mistBlurId})`}
            className={prefersReducedMotion ? undefined : 'lu-mist-drift'}
          >
            <ellipse cx="320" cy="485" rx="340" ry="18" fill="#FDEFE0" fillOpacity="0.26" />
            <ellipse cx="860" cy="492" rx="410" ry="16" fill="#FFEBD6" fillOpacity="0.22" />
            <ellipse cx="1290" cy="476" rx="330" ry="20" fill="#FDEFE0" fillOpacity="0.24" />
          </g>
        </svg>
      </div>

      {/* TẦNG 3 (Trung cảnh gần): Mặt biển ngọc lục bảo, Đảo Karst sắc nét, Hòn Trống Mái, Bóng đổ & 2 Thuyền Cánh Dơi (+mx*26) */}
      <div
        ref={layer3Ref}
        data-testid="son-ha-layer-3"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={seaGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#133832" />
              <stop offset="48%" stopColor="#1C4E45" />
              <stop offset="100%" stopColor="#0E2925" />
            </linearGradient>

            {/* Sườn tối & thảm thực vật đá vôi (#132A26 -> #1E3F37) */}
            <linearGradient id={darkRockGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3F37" />
              <stop offset="55%" stopColor="#16332D" />
              <stop offset="100%" stopColor="#132A26" />
            </linearGradient>

            {/* Sườn đón nắng hoàng hôn (#8C7A6B -> #C88A56) */}
            <linearGradient id={litRockGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#C88A56" />
              <stop offset="55%" stopColor="#9B7E6A" />
              <stop offset="100%" stopColor="#6D635B" />
            </linearGradient>

            {/* Gradient bóng phản chiếu lộn ngược (rgba(10, 28, 24, 0.55) -> 0) */}
            <linearGradient
              id={reflectGrad535Id}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="535"
              x2="0"
              y2="290"
            >
              <stop offset="0%" stopColor="rgba(10, 28, 24, 0.55)" />
              <stop offset="100%" stopColor="rgba(10, 28, 24, 0)" />
            </linearGradient>
            <linearGradient
              id={reflectGrad548Id}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="548"
              x2="0"
              y2="380"
            >
              <stop offset="0%" stopColor="rgba(10, 28, 24, 0.55)" />
              <stop offset="100%" stopColor="rgba(10, 28, 24, 0)" />
            </linearGradient>
            <linearGradient
              id={boatReflectGradId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="10"
              x2="0"
              y2="-92"
            >
              <stop offset="0%" stopColor="rgba(10, 28, 24, 0.55)" />
              <stop offset="100%" stopColor="rgba(10, 28, 24, 0)" />
            </linearGradient>

            {/* Cánh buồm nâu cánh gián xuyên sáng hoàng hôn */}
            <linearGradient id={sailGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9A4B32" />
              <stop offset="65%" stopColor="#7C3C28" />
              <stop offset="100%" stopColor="#5D2B1D" />
            </linearGradient>

            {/* Nhòe ngang nhẹ cho bóng phản chiếu trên mặt nước gợn */}
            <filter id={waterBlurId} x="-15%" y="-15%" width="130%" height="130%">
              <feGaussianBlur stdDeviation="3.5 0.9" />
            </filter>
          </defs>

          {/* Mặt biển ngọc lục bảo chuyển sắc sâu */}
          <rect x="-80" y={WATERLINE_Y} width="1760" height="420" fill={`url(#${seaGradId})`} />

          {/* Các đảo Karst trung cảnh gần + bóng phản chiếu lộn ngược */}
          {LAYER3_MID_NEAR_ISLANDS.map((island) => (
            <g key={island.id}>
              {/* Bóng đảo đổ ngược xuống mặt nước (scaleY -0.45) */}
              <g
                transform={`translate(0, ${island.waterY}) scale(1, -0.45) translate(0, -${island.waterY})`}
                filter={`url(#${waterBlurId})`}
              >
                <path d={island.bodyPath} fill={`url(#${reflectGrad535Id})`} />
              </g>

              {/* Khối đảo 2 lớp sáng / tối & vân nứt đá vôi */}
              <path d={island.bodyPath} fill={`url(#${darkRockGradId})`} />
              <path d={island.litFacePath} fill={`url(#${litRockGradId})`} fillOpacity="0.88" />
              {island.foliagePaths.map((fPath, idx) => (
                <path key={idx} d={fPath} fill="#142C27" />
              ))}
              <g stroke="#0C1C19" strokeWidth="1.25" strokeOpacity="0.58" fill="none">
                {island.fissurePaths.map((linePath, idx) => (
                  <path key={idx} d={linePath} />
                ))}
              </g>
            </g>
          ))}

          {/* BIỂU TƯỢNG HÒN TRỐNG MÁI (Fighting Cocks Islet) ở khoảng thoáng trung cảnh */}
          <g data-testid="hon-trong-mai">
            {HON_TRONG_MAI.map((rock) => (
              <g key={rock.id}>
                {/* Bóng đổ ngược của Hòn Trống & Hòn Mái */}
                <g
                  transform={`translate(0, ${rock.waterY}) scale(1, -0.45) translate(0, -${rock.waterY})`}
                  filter={`url(#${waterBlurId})`}
                >
                  <path d={rock.bodyPath} fill={`url(#${reflectGrad548Id})`} />
                </g>

                <path d={rock.bodyPath} fill={`url(#${darkRockGradId})`} />
                <path d={rock.litFacePath} fill={`url(#${litRockGradId})`} fillOpacity="0.92" />
                {rock.foliagePaths.map((fPath, idx) => (
                  <path key={idx} d={fPath} fill="#132A26" />
                ))}
                <g stroke="#0C1C19" strokeWidth="1.15" strokeOpacity="0.55" fill="none">
                  {rock.fissurePaths.map((linePath, idx) => (
                    <path key={idx} d={linePath} />
                  ))}
                </g>
              </g>
            ))}
          </g>

          {/* 2 THUYỀN GỖ BUỒM CÁNH DƠI TRUYỀN THỐNG HẠ LONG (xa & gần) */}
          <BatWingJunkBoat
            testId="halong-junk-boat-far"
            x={645}
            y={548}
            scale={0.58}
            sailGradId={sailGradId}
            reflectGradId={boatReflectGradId}
            reflectBlurId={waterBlurId}
            animationClass={prefersReducedMotion ? undefined : 'lu-boat-bob-slow'}
          />

          <BatWingJunkBoat
            testId="halong-junk-boat-near"
            x={948}
            y={576}
            scale={0.96}
            flipX
            sailGradId={sailGradId}
            reflectGradId={boatReflectGradId}
            reflectBlurId={waterBlurId}
            animationClass={prefersReducedMotion ? undefined : 'lu-boat-bob'}
          />
        </svg>
      </div>

      {/* TẦNG 4 (Tiền cảnh 2 bên rìa màn hình): Vách đá sẫm màu tạo khung chiều sâu (+mx*42) */}
      <div
        ref={layer4Ref}
        data-testid="son-ha-layer-4"
        className="absolute -inset-10 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient
              id={`hl-fg-reflect-${uid}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="575"
              x2="0"
              y2="340"
            >
              <stop offset="0%" stopColor="rgba(8, 22, 19, 0.6)" />
              <stop offset="100%" stopColor="rgba(8, 22, 19, 0)" />
            </linearGradient>
          </defs>

          {/* Bóng đảo tiền cảnh phản chiếu */}
          <g transform="translate(0, 575) scale(1, -0.45) translate(0, -575)" opacity="0.65">
            <path
              d="M -90 575 L -90 360 L 20 350 L 58 392 L 96 440 L 118 498 L 106 544 L 84 562 L 94 575 Z"
              fill={`url(#hl-fg-reflect-${uid})`}
            />
            <path
              d="M 1495 575 L 1508 558 L 1488 538 L 1482 496 L 1498 446 L 1524 398 L 1562 344 L 1690 330 L 1690 575 Z"
              fill={`url(#hl-fg-reflect-${uid})`}
            />
          </g>

          {/* Vách đá vôi rìa trái */}
          <path
            d="M -90 578 L -90 325 L -40 318 L -8 352 L 24 338 L 54 388 L 78 410 L 102 456 L 116 498 L 106 544 L 84 562 L 94 578 Z"
            fill="#0D231F"
          />
          <path
            d="M 54 388 L 78 410 L 102 456 L 116 498 L 106 544 L 84 562 L 94 578 L 62 578 L 58 510 L 48 440 Z"
            fill="#8C6D56"
            fillOpacity="0.48"
          />

          {/* Vách đá vôi rìa phải */}
          <path
            d="M 1495 578 L 1508 558 L 1488 538 L 1482 496 L 1496 446 L 1522 396 L 1546 378 L 1568 336 L 1605 322 L 1690 312 L 1690 578 Z"
            fill="#0C211D"
          />
          <path
            d="M 1495 578 L 1508 558 L 1488 538 L 1482 496 L 1496 446 L 1522 396 L 1546 378 L 1534 452 L 1524 522 L 1528 578 Z"
            fill="#8C6D56"
            fillOpacity="0.45"
          />
        </svg>
      </div>

      {/* Dải hòa sắc êm xuống khu vực tiếp theo */}
      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{ background: 'linear-gradient(180deg, rgba(14,41,37,0) 0%, #F5F4EF 100%)' }}
      />
    </div>
  );
}
