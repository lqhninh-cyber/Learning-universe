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
  readonly rimPath: string;
  readonly foliageBackPaths: readonly string[];
  readonly foliageHighlightPaths: readonly string[];
  readonly strataPaths: readonly string[];
  readonly fissurePaths: readonly string[];
}

interface BirdSpec {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly flapDelaySec: number;
  readonly flapDurationSec: number;
}

const WATERLINE_Y = 535;
const SUN_CX = 815;
const SUN_CY = 488;

/**
 * Tầng 1: Viễn cảnh sát chân trời (đảo mờ sương tím chiều hòa vào ráng hoàng hôn)
 */
const LAYER1_FAR_HORIZON_ISLANDS: readonly string[] = [
  'M -40 538 L -18 518 L 12 488 L 34 494 L 58 468 L 82 476 L 106 446 L 134 452 L 154 474 L 182 465 L 208 492 L 234 486 L 260 510 L 284 516 L 274 528 L 268 538 Z',
  'M 304 538 L 314 522 L 328 496 L 346 502 L 368 474 L 390 482 L 414 458 L 438 468 L 460 452 L 484 466 L 508 490 L 532 498 L 548 520 L 538 530 L 532 538 Z',
  'M 575 538 L 586 520 L 604 494 L 626 500 L 646 476 L 670 484 L 692 468 L 716 482 L 738 504 L 758 518 L 748 530 L 742 538 Z',
  'M 885 538 L 896 522 L 916 492 L 940 498 L 964 466 L 990 474 L 1018 450 L 1044 462 L 1072 486 L 1098 494 L 1122 518 L 1112 529 L 1106 538 Z',
  'M 1148 538 L 1160 518 L 1184 488 L 1212 496 L 1236 460 L 1264 470 L 1292 444 L 1320 458 L 1348 482 L 1378 474 L 1408 496 L 1438 506 L 1464 524 L 1452 532 L 1446 538 Z',
];

/**
 * 5 luồng tia nắng chiều (Volumetric God Rays) chiếu xiên từ tâm mặt trời (815, 488)
 */
const VOLUMETRIC_GOD_RAYS: readonly {
  readonly id: string;
  readonly points: string;
  readonly className: string;
  readonly opacity: number;
}[] = [
  {
    id: 'ray-far-left',
    points: `${SUN_CX},${SUN_CY} 110,120 340,70`,
    className: 'lu-god-ray-pulse',
    opacity: 0.48,
  },
  {
    id: 'ray-mid-left',
    points: `${SUN_CX},${SUN_CY} 440,54 620,38`,
    className: 'lu-god-ray-pulse-alt',
    opacity: 0.56,
  },
  {
    id: 'ray-center',
    points: `${SUN_CX},${SUN_CY} 728,28 912,28`,
    className: 'lu-god-ray-pulse',
    opacity: 0.62,
  },
  {
    id: 'ray-mid-right',
    points: `${SUN_CX},${SUN_CY} 1020,40 1230,72`,
    className: 'lu-god-ray-pulse-alt',
    opacity: 0.54,
  },
  {
    id: 'ray-bay-sheen',
    points: `${SUN_CX},${SUN_CY} 560,720 1080,720`,
    className: 'lu-god-ray-pulse',
    opacity: 0.36,
  },
];

/**
 * 2 đàn chim chiều (hải âu / hạc) bay lượn qua bầu trời hoàng hôn
 */
const BIRD_FLOCK_WEST: readonly BirdSpec[] = [
  { x: 560, y: 248, scale: 1.05, flapDelaySec: 0, flapDurationSec: 0.85 },
  { x: 584, y: 238, scale: 0.9, flapDelaySec: 0.22, flapDurationSec: 0.92 },
  { x: 606, y: 252, scale: 0.85, flapDelaySec: 0.45, flapDurationSec: 0.88 },
  { x: 626, y: 234, scale: 0.78, flapDelaySec: 0.14, flapDurationSec: 0.96 },
  { x: 644, y: 246, scale: 0.72, flapDelaySec: 0.58, flapDurationSec: 0.82 },
  { x: 668, y: 229, scale: 0.68, flapDelaySec: 0.32, flapDurationSec: 1.02 },
];

const BIRD_FLOCK_EAST: readonly BirdSpec[] = [
  { x: 1025, y: 204, scale: 0.84, flapDelaySec: 0.12, flapDurationSec: 0.94 },
  { x: 1046, y: 194, scale: 0.76, flapDelaySec: 0.38, flapDurationSec: 0.86 },
  { x: 1068, y: 208, scale: 0.7, flapDelaySec: 0.62, flapDurationSec: 0.98 },
  { x: 1090, y: 196, scale: 0.64, flapDelaySec: 0.24, flapDurationSec: 0.9 },
  { x: 1112, y: 210, scale: 0.58, flapDelaySec: 0.5, flapDurationSec: 1.04 },
];

/**
 * Tầng 2: Trung cảnh xa (đảo đá vôi Karst đa lớp + tán rừng nhiệt đới + đường vân phân tầng)
 */
const LAYER2_MID_FAR_ISLANDS: readonly KarstIslandSpec[] = [
  {
    id: 'far-karst-west',
    waterY: 538,
    bodyPath:
      'M 118 538 L 126 530 L 114 520 L 110 494 L 118 466 L 124 434 L 136 410 L 148 418 L 160 390 L 176 398 L 192 368 L 210 380 L 226 352 L 244 364 L 260 392 L 274 386 L 290 412 L 308 406 L 324 438 L 336 468 L 342 498 L 336 520 L 322 530 L 328 538 Z',
    litFacePath:
      'M 226 352 L 244 364 L 260 392 L 274 386 L 290 412 L 308 406 L 324 438 L 336 468 L 342 498 L 336 520 L 322 530 L 328 538 L 242 538 L 236 485 L 222 442 L 232 396 Z',
    rimPath:
      'M 226 352 L 244 364 L 260 392 L 274 386 L 290 412 L 308 406 L 324 438 L 336 468 L 342 498',
    foliageBackPaths: [
      'M 130 418 Q 146 394 166 386 Q 182 396 198 364 Q 216 372 230 348 Q 250 358 266 392 Q 242 404 218 396 Q 186 412 158 412 Z',
    ],
    foliageHighlightPaths: [
      'M 218 358 Q 232 346 246 364 Q 258 386 276 384 Q 288 404 268 402 Q 246 396 226 382 Z',
    ],
    strataPaths: ['M 136 456 Q 218 450 318 462', 'M 122 492 Q 224 484 334 494'],
    fissurePaths: ['M 184 416 L 180 486', 'M 218 402 L 214 512', 'M 278 416 L 284 498'],
  },
  {
    id: 'far-karst-center-left',
    waterY: 538,
    bodyPath:
      'M 452 538 L 460 529 L 448 518 L 444 492 L 452 462 L 462 432 L 474 406 L 488 414 L 502 384 L 518 394 L 534 368 L 552 380 L 566 408 L 580 402 L 594 436 L 604 466 L 608 498 L 602 520 L 588 530 L 594 538 Z',
    litFacePath:
      'M 534 368 L 552 380 L 566 408 L 580 402 L 594 436 L 604 466 L 608 498 L 602 520 L 588 530 L 594 538 L 536 538 L 530 488 L 524 432 Z',
    rimPath: 'M 534 368 L 552 380 L 566 408 L 580 402 L 594 436 L 604 466 L 608 498',
    foliageBackPaths: [
      'M 470 414 Q 492 380 518 386 Q 538 362 558 380 Q 572 402 586 406 Q 554 416 522 412 Q 494 418 470 414 Z',
    ],
    foliageHighlightPaths: ['M 526 372 Q 542 362 556 382 Q 568 400 584 402 Q 562 412 536 400 Z'],
    strataPaths: ['M 464 452 Q 528 446 592 456', 'M 454 490 Q 524 484 600 492'],
    fissurePaths: ['M 498 424 L 494 504', 'M 556 420 L 562 508'],
  },
  {
    id: 'far-karst-east',
    waterY: 538,
    bodyPath:
      'M 1030 538 L 1038 529 L 1024 518 L 1020 486 L 1028 452 L 1038 418 L 1052 388 L 1068 398 L 1086 362 L 1106 376 L 1126 342 L 1146 356 L 1166 386 L 1184 378 L 1204 412 L 1222 404 L 1240 442 L 1252 478 L 1256 508 L 1246 524 L 1232 531 L 1238 538 Z',
    litFacePath:
      'M 1030 538 L 1038 529 L 1024 518 L 1020 486 L 1028 452 L 1038 418 L 1052 388 L 1068 398 L 1086 362 L 1106 376 L 1126 342 L 1122 416 L 1114 484 L 1118 538 Z',
    rimPath:
      'M 1020 486 L 1028 452 L 1038 418 L 1052 388 L 1068 398 L 1086 362 L 1106 376 L 1126 342',
    foliageBackPaths: [
      'M 1062 396 Q 1086 356 1106 372 Q 1128 336 1152 354 Q 1172 384 1190 380 Q 1158 400 1126 394 Q 1094 404 1062 396 Z',
    ],
    foliageHighlightPaths: [
      'M 1064 392 Q 1084 358 1104 372 Q 1122 342 1134 352 Q 1118 386 1086 394 Z',
    ],
    strataPaths: ['M 1044 434 Q 1136 426 1232 438', 'M 1028 476 Q 1134 468 1246 480'],
    fissurePaths: ['M 1084 414 L 1080 510', 'M 1144 392 L 1148 504', 'M 1196 426 L 1202 512'],
  },
];

/**
 * Tầng 3: Trung cảnh gần (Cụm đảo Karst sắc nét, gờ sáng kim loại & vân đá vôi phân tầng)
 */
const LAYER3_MID_NEAR_ISLANDS: readonly KarstIslandSpec[] = [
  {
    id: 'near-karst-left',
    waterY: WATERLINE_Y,
    bodyPath:
      'M 218 535 L 228 524 L 210 512 L 202 478 L 208 438 L 216 392 L 226 352 L 238 362 L 252 324 L 266 336 L 284 294 L 302 310 L 320 278 L 338 298 L 354 334 L 370 326 L 386 366 L 402 358 L 418 402 L 430 444 L 436 488 L 428 514 L 410 526 L 418 535 Z',
    litFacePath:
      'M 320 278 L 338 298 L 354 334 L 370 326 L 386 366 L 402 358 L 418 402 L 430 444 L 436 488 L 428 514 L 410 526 L 418 535 L 348 535 L 340 472 L 328 412 L 336 346 Z',
    rimPath:
      'M 320 278 L 338 298 L 354 334 L 370 326 L 386 366 L 402 358 L 418 402 L 430 444 L 436 488',
    foliageBackPaths: [
      'M 228 360 Q 248 314 268 332 Q 284 284 304 306 Q 322 268 344 294 Q 362 328 378 326 Q 350 348 320 340 Q 286 354 258 352 Z',
      'M 368 332 Q 384 352 404 354 Q 420 388 414 402 Q 392 384 374 366 Z',
    ],
    foliageHighlightPaths: [
      'M 310 296 Q 324 270 340 296 Q 354 328 372 326 Q 388 358 366 354 Q 344 338 320 326 Z',
    ],
    strataPaths: [
      'M 226 398 Q 312 388 408 404',
      'M 212 442 Q 316 432 426 448',
      'M 206 484 Q 318 476 432 490',
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
    rimPath:
      'M 1110 474 L 1118 430 L 1128 386 L 1142 344 L 1156 356 L 1172 316 L 1190 330 L 1208 286 L 1228 304 L 1248 264',
    foliageBackPaths: [
      'M 1146 356 Q 1170 308 1192 326 Q 1208 276 1232 300 Q 1252 254 1274 282 Q 1294 318 1312 318 Q 1278 338 1244 332 Q 1202 346 1172 346 Z',
      'M 1298 320 Q 1324 342 1344 352 Q 1362 390 1356 406 Q 1328 378 1308 358 Z',
    ],
    foliageHighlightPaths: [
      'M 1142 348 Q 1168 312 1190 328 Q 1208 282 1230 302 Q 1244 268 1254 274 Q 1236 320 1196 340 Z',
    ],
    strataPaths: [
      'M 1140 388 Q 1244 378 1346 394',
      'M 1122 434 Q 1244 424 1364 440',
      'M 1116 480 Q 1246 472 1372 486',
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
 * Biểu tượng Hòn Trống Mái (Fighting Cocks Islet) đa tầng ánh sáng & tán cây đỉnh
 */
const HON_TRONG_MAI: readonly KarstIslandSpec[] = [
  {
    id: 'hon-trong',
    waterY: 548,
    bodyPath:
      'M 756 548 L 762 536 L 758 522 L 748 504 L 742 478 L 746 448 L 754 420 L 764 398 L 774 388 L 786 396 L 798 382 L 808 394 L 814 416 L 810 442 L 800 470 L 788 496 L 780 518 L 776 534 L 784 548 Z',
    litFacePath:
      'M 774 388 L 786 396 L 798 382 L 808 394 L 814 416 L 810 442 L 800 470 L 788 496 L 780 518 L 776 534 L 784 548 L 772 548 L 768 518 L 772 474 L 778 430 Z',
    rimPath: 'M 774 388 L 786 396 L 798 382 L 808 394 L 814 416 L 810 442 L 800 470 L 788 496',
    foliageBackPaths: ['M 762 404 Q 778 382 794 386 Q 806 380 814 402 Q 794 406 772 406 Z'],
    foliageHighlightPaths: ['M 784 390 Q 798 380 810 398 Q 798 404 786 400 Z'],
    strataPaths: ['M 748 456 Q 778 452 806 458', 'M 748 494 Q 768 490 788 496'],
    fissurePaths: ['M 768 416 L 762 504', 'M 792 414 L 784 494'],
  },
  {
    id: 'hon-mai',
    waterY: 548,
    bodyPath:
      'M 848 548 L 854 534 L 848 518 L 836 492 L 826 462 L 822 434 L 826 408 L 836 396 L 848 404 L 860 392 L 874 402 L 886 426 L 892 456 L 888 486 L 878 512 L 870 528 L 874 548 Z',
    litFacePath:
      'M 848 548 L 854 534 L 848 518 L 836 492 L 826 462 L 822 434 L 826 408 L 836 396 L 848 404 L 852 440 L 854 492 L 858 548 Z',
    rimPath: 'M 836 492 L 826 462 L 822 434 L 826 408 L 836 396 L 848 404 L 860 392',
    foliageBackPaths: ['M 828 410 Q 844 388 860 392 Q 878 394 886 416 Q 862 416 840 414 Z'],
    foliageHighlightPaths: ['M 830 406 Q 842 390 858 394 Q 848 408 832 410 Z'],
    strataPaths: ['M 824 448 Q 856 444 888 450', 'M 836 488 Q 862 484 886 490'],
    fissurePaths: ['M 846 422 L 842 502', 'M 870 426 L 868 506'],
  },
];

interface IslandRenderIds {
  readonly darkRockGradId: string;
  readonly litRockGradId: string;
  readonly sunsetRimGradId: string;
  readonly foliageDarkGradId: string;
  readonly foliageLitColor: string;
}

function PainterlyKarstIsland({
  island,
  ids,
  litOpacity = 0.88,
  showRimStroke = true,
}: {
  readonly island: KarstIslandSpec;
  readonly ids: IslandRenderIds;
  readonly litOpacity?: number;
  readonly showRimStroke?: boolean;
}) {
  return (
    <g>
      <path d={island.bodyPath} fill={`url(#${ids.darkRockGradId})`} />
      <path d={island.litFacePath} fill={`url(#${ids.litRockGradId})`} fillOpacity={litOpacity} />

      {/* Vân địa chất phân tầng ngang tự nhiên của đá vôi Hạ Long */}
      <g stroke="#0A1815" strokeWidth="0.9" strokeOpacity="0.42" fill="none">
        {island.strataPaths.map((sPath, idx) => (
          <path key={idx} d={sPath} />
        ))}
      </g>

      {/* Khe nứt thẳng đứng sâu tạo khối 3D */}
      <g stroke="#071311" strokeWidth="1.25" strokeOpacity="0.62" fill="none">
        {island.fissurePaths.map((linePath, idx) => (
          <path key={idx} d={linePath} />
        ))}
      </g>

      {/* Tán cây rừng nhiệt đới đa lớp nhấp nhô trên đỉnh đảo */}
      {island.foliageBackPaths.map((fPath, idx) => (
        <path key={`fb-${idx}`} d={fPath} fill={`url(#${ids.foliageDarkGradId})`} />
      ))}
      {island.foliageHighlightPaths.map((fPath, idx) => (
        <path key={`fh-${idx}`} d={fPath} fill={ids.foliageLitColor} fillOpacity="0.78" />
      ))}

      {/* Viền sáng vàng kim loại chạy dọc gờ đá đón nắng hoàng hôn */}
      {showRimStroke && (
        <path
          d={island.rimPath}
          fill="none"
          stroke={`url(#${ids.sunsetRimGradId})`}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </g>
  );
}

interface JunkBoatProps {
  readonly testId: string;
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly flipX?: boolean;
  readonly sailGradId: string;
  readonly reflectGradId: string;
  readonly waterRippleFilterId: string;
  readonly lanternGlowId: string;
  readonly glideClass?: string;
  readonly rockClass?: string;
  readonly reducedMotion: boolean;
}

/**
 * Thuyền gỗ buồm cánh dơi truyền thống Hạ Long:
 * - Lướt chậm ngang qua vịnh + nhấp nhô nghiêng theo sóng (±1.2deg)
 * - 1-2 đèn lồng vàng ấm (#FFB84D) nhấp nháy dịu + ánh phản chiếu dưới mũi thuyền
 * - Vệt sóng rẽ nước trắng/vàng mảnh phía sau đuôi thuyền
 */
function BatWingJunkBoat({
  testId,
  x,
  y,
  scale,
  flipX = false,
  sailGradId,
  reflectGradId,
  waterRippleFilterId,
  lanternGlowId,
  glideClass,
  rockClass,
  reducedMotion,
}: JunkBoatProps) {
  const wakeClass = reducedMotion ? undefined : 'lu-wake-pulse';
  const lanternClass = reducedMotion ? undefined : 'lu-lantern-glow';
  const swayClass = reducedMotion ? undefined : 'lu-reflection-sway';

  const sailGroup = (
    <g>
      {/* Vệt sóng rẽ nước trắng/vàng mảnh phía sau đuôi thuyền */}
      <g className={wakeClass} fill="none" strokeLinecap="round">
        <path d="M 52 7 Q 86 11 132 16" stroke="#FFE6B8" strokeWidth="1.35" strokeOpacity="0.58" />
        <path d="M 56 4 Q 96 6 148 9" stroke="#FFF7E2" strokeWidth="0.9" strokeOpacity="0.45" />
        <path d="M 48 10 Q 80 15 118 22" stroke="#E8A85A" strokeWidth="1.05" strokeOpacity="0.42" />
      </g>

      {/* Thân thuyền gỗ cong mềm mại, mũi & lái nâng cao */}
      <path
        d="M -68 -6 Q -32 3 0 3 Q 36 3 72 -9 L 58 6 Q 28 11 0 11 Q -28 11 -54 6 Z"
        fill="#22130F"
      />
      <path
        d="M -64 -5 Q -28 3 0 3 Q 32 3 68 -8"
        fill="none"
        stroke="#DF9B5D"
        strokeWidth="1.4"
        strokeOpacity="0.72"
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

      {/* Đèn lồng mũi thuyền & khoang thuyền màu vàng ấm (#FFB84D) */}
      <g className={lanternClass}>
        <circle cx="-58" cy="-8" r="8.5" fill={`url(#${lanternGlowId})`} />
        <circle cx="-58" cy="-8" r="2.2" fill="#FFF3C4" />
        <circle cx="-58" cy="-8" r="3.4" fill="#FFB84D" fillOpacity="0.65" />

        <circle cx="8" cy="-4" r="7.5" fill={`url(#${lanternGlowId})`} />
        <circle cx="8" cy="-4" r="1.9" fill="#FFF3C4" />
        <circle cx="8" cy="-4" r="3" fill="#FFB84D" fillOpacity="0.6" />
      </g>
    </g>
  );

  return (
    <g
      data-testid={testId}
      transform={`translate(${x}, ${y}) scale(${flipX ? -scale : scale}, ${scale})`}
    >
      <g className={glideClass}>
        <g className={rockClass}>
          {/* Bóng phản chiếu gợn sóng dưới thuyền + ánh đèn lồng loang mặt nước */}
          <g
            transform="translate(0, 10) scale(1, -0.45) translate(0, -10)"
            filter={`url(#${waterRippleFilterId})`}
            opacity="0.56"
            className={swayClass}
          >
            <path
              d="M -68 -6 Q -32 3 0 3 Q 36 3 72 -9 L 58 6 Q 28 11 0 11 Q -28 11 -54 6 Z"
              fill={`url(#${reflectGradId})`}
            />
            <path
              d="M -35 -64 C -18 -60, -10 -44, -12 -18 L -32 -14 Z"
              fill={`url(#${reflectGradId})`}
            />
            <path
              d="M -4 -88 C 18 -84, 32 -60, 29 -18 L -2 -12 Z"
              fill={`url(#${reflectGradId})`}
            />
            <path
              d="M 29 -54 C 46 -49, 54 -34, 51 -14 L 31 -10 Z"
              fill={`url(#${reflectGradId})`}
            />
          </g>

          {/* Ánh đèn lồng phản chiếu xuống mặt nước ngay dưới mũi & khoang thuyền */}
          <g className={lanternClass}>
            <ellipse cx="-58" cy="18" rx="11" ry="3.2" fill="#FFB84D" fillOpacity="0.42" />
            <ellipse cx="-58" cy="18" rx="4.5" ry="1.4" fill="#FFE8A3" fillOpacity="0.72" />
            <ellipse cx="8" cy="16" rx="9" ry="2.6" fill="#FFB84D" fillOpacity="0.34" />
          </g>

          {/* Thân thuyền, 3 cánh buồm, đèn lồng & vệt sóng */}
          {sailGroup}
        </g>
      </g>
    </g>
  );
}

/**
 * Cảnh quan Vịnh Hạ Long Hội Họa 60fps:
 * - Bầu trời hoàng hôn đa sắc + 3 lớp mây trôi + Vầng mặt trời vàng/chu sa + 5 luồng tia nắng Volumetric God Rays
 * - Sương mù chân trời làm mềm đường tiếp giáp trời-biển & 3 dải sương luồn quanh chân đảo đá vôi
 * - Cụm đảo Karst & Hòn Trống Mái tô đa sắc (#162E2A -> #244740 -> #0D1F1C), viền sáng kim loại & vân phân tầng
 * - Đàn chim chiều vỗ cánh bay lượn + 2 Thuyền buồm cánh dơi lướt sóng kèm đèn lồng vàng & vệt sóng rẽ nước
 * - Bóng đảo phản chiếu gợn sóng bằng feTurbulence + feDisplacementMap
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

  // Unique SVG filter & gradient IDs
  const skyGradId = `hl-sky-${uid}`;
  const sunOuterGlowId = `hl-sun-outer-${uid}`;
  const sunCoronaGlowId = `hl-sun-corona-${uid}`;
  const sunDiscGradId = `hl-sun-disc-${uid}`;
  const godRayGradId = `hl-god-ray-${uid}`;
  const cloudWarmGradId = `hl-cloud-warm-${uid}`;
  const cloudDuskGradId = `hl-cloud-dusk-${uid}`;
  const cloudBlurId = `hl-cloud-blur-${uid}`;
  const horizonMistGradId = `hl-horizon-mist-${uid}`;
  const seaGradId = `hl-sea-${uid}`;
  const seaSunSheenId = `hl-sea-sheen-${uid}`;
  const litRockGradId = `hl-rock-lit-${uid}`;
  const darkRockGradId = `hl-rock-dark-${uid}`;
  const midFarRockGradId = `hl-rock-midfar-${uid}`;
  const midFarLitGradId = `hl-rock-midfar-lit-${uid}`;
  const sunsetRimGradId = `hl-rim-grad-${uid}`;
  const midFarRimGradId = `hl-rim-midfar-${uid}`;
  const foliageDarkGradId = `hl-foliage-dark-${uid}`;
  const reflectGrad535Id = `hl-reflect-535-${uid}`;
  const reflectGrad548Id = `hl-reflect-548-${uid}`;
  const boatReflectGradId = `hl-boat-reflect-${uid}`;
  const sailGradId = `hl-sail-${uid}`;
  const lanternGlowId = `hl-lantern-glow-${uid}`;
  const mistBlurId = `hl-mist-blur-${uid}`;
  const waterRippleFilterId = `hl-water-ripple-${uid}`;

  const midFarIslandIds: IslandRenderIds = {
    darkRockGradId: midFarRockGradId,
    litRockGradId: midFarLitGradId,
    sunsetRimGradId: midFarRimGradId,
    foliageDarkGradId,
    foliageLitColor: '#36584D',
  };

  const nearIslandIds: IslandRenderIds = {
    darkRockGradId,
    litRockGradId,
    sunsetRimGradId,
    foliageDarkGradId,
    foliageLitColor: '#4E6B47',
  };

  return (
    <div
      data-testid="son-ha-diorama"
      data-landscape="vinh-ha-long"
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 overflow-hidden select-none', className)}
      style={{
        background: 'linear-gradient(180deg, #171F2E 0%, #5B353B 34%, #D97E4B 58%, #133832 100%)',
      }}
    >
      {/* TẦNG 1: Bầu trời hoàng hôn, Mặt trời & 5 tia nắng chiều, 3 lớp mây trôi, Viễn cảnh & Sương chân trời (-mx*8) */}
      <div
        ref={layer1Ref}
        data-testid="son-ha-layer-1"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={skyGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#161D2C" />
              <stop offset="30%" stopColor="#432E40" />
              <stop offset="56%" stopColor="#9B4D46" />
              <stop offset="82%" stopColor="#DF834E" />
              <stop offset="100%" stopColor="#F4B66E" />
            </linearGradient>

            {/* Vầng hào quang ngoài tím khói - cam chu sa */}
            <radialGradient id={sunOuterGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFD584" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#E06D42" stopOpacity="0.52" />
              <stop offset="68%" stopColor="#7A405D" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#432E40" stopOpacity="0" />
            </radialGradient>

            {/* Hào quang trong vàng rực */}
            <radialGradient id={sunCoronaGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF7DC" stopOpacity="0.98" />
              <stop offset="45%" stopColor="#FFD584" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#E06D42" stopOpacity="0" />
            </radialGradient>

            {/* Đĩa mặt trời hoàng hôn */}
            <linearGradient id={sunDiscGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF8E1" />
              <stop offset="55%" stopColor="#FFD584" />
              <stop offset="100%" stopColor="#E06D42" />
            </linearGradient>

            {/* Tia nắng Volumetric God Rays */}
            <radialGradient
              id={godRayGradId}
              gradientUnits="userSpaceOnUse"
              cx={SUN_CX}
              cy={SUN_CY}
              r="760"
            >
              <stop offset="0%" stopColor="#FFE6AA" stopOpacity="0.32" />
              <stop offset="38%" stopColor="#F5AA64" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#E06D42" stopOpacity="0" />
            </radialGradient>

            {/* Gradient mây hoàng hôn */}
            <linearGradient id={cloudWarmGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7B485A" stopOpacity="0.78" />
              <stop offset="55%" stopColor="#D7744E" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#FFD185" stopOpacity="0.88" />
            </linearGradient>
            <linearGradient id={cloudDuskGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4F364C" stopOpacity="0.7" />
              <stop offset="70%" stopColor="#9C5552" stopOpacity="0.62" />
              <stop offset="100%" stopColor="#E89A60" stopOpacity="0.65" />
            </linearGradient>
            <filter id={cloudBlurId} x="-15%" y="-25%" width="130%" height="150%">
              <feGaussianBlur stdDeviation="12 5" />
            </filter>

            {/* Màng sương chân trời làm mềm ranh giới trời - biển */}
            <linearGradient id={horizonMistGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F4B66E" stopOpacity="0" />
              <stop offset="48%" stopColor="#F7C78B" stopOpacity="0.52" />
              <stop offset="70%" stopColor="#E8A86C" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#143A34" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Bầu trời hoàng hôn */}
          <rect x="-80" y="-40" width="1760" height="590" fill={`url(#${skyGradId})`} />

          {/* 3 lớp mây hoàng hôn trôi ngang chậm rãi */}
          <g data-testid="halong-clouds" filter={`url(#${cloudBlurId})`}>
            {/* Lớp mây cao 1 */}
            <g className={prefersReducedMotion ? undefined : 'lu-cloud-drift-1'}>
              <path
                d="M 40 164 Q 140 132 260 156 Q 360 136 470 162 Q 390 182 260 178 Q 140 186 40 164 Z"
                fill={`url(#${cloudDuskGradId})`}
              />
              <path
                d="M 1020 138 Q 1140 108 1265 132 Q 1390 116 1510 144 Q 1410 164 1260 158 Q 1120 166 1020 138 Z"
                fill={`url(#${cloudDuskGradId})`}
              />
            </g>

            {/* Lớp mây trung bình 2 */}
            <g className={prefersReducedMotion ? undefined : 'lu-cloud-drift-2'}>
              <path
                d="M 190 256 Q 310 222 440 248 Q 540 228 650 254 Q 560 278 430 272 Q 300 282 190 256 Z"
                fill={`url(#${cloudWarmGradId})`}
              />
              <path
                d="M 900 242 Q 1030 210 1170 236 Q 1290 218 1420 244 Q 1310 268 1170 260 Q 1020 268 900 242 Z"
                fill={`url(#${cloudWarmGradId})`}
              />
            </g>

            {/* Lớp mây ráng chiều sát tầng thấp 3 */}
            <g className={prefersReducedMotion ? undefined : 'lu-cloud-drift-1'}>
              <path
                d="M 540 342 Q 660 318 790 338 Q 920 316 1050 340 Q 950 358 790 356 Q 640 360 540 342 Z"
                fill={`url(#${cloudWarmGradId})`}
                opacity="0.72"
              />
            </g>
          </g>

          {/* 5 luồng tia nắng Volumetric God Rays xoay/co giãn độ sáng nhịp nhàng */}
          <g data-testid="halong-god-rays">
            {VOLUMETRIC_GOD_RAYS.map((ray) => (
              <polygon
                key={ray.id}
                points={ray.points}
                fill={`url(#${godRayGradId})`}
                fillOpacity={ray.opacity}
                className={prefersReducedMotion ? undefined : ray.className}
              />
            ))}
          </g>

          {/* Vầng Mặt Trời Hoàng Hôn lặn dần giữa hai cụm núi chân trời */}
          <g data-testid="halong-sunset-sun">
            <circle cx={SUN_CX} cy={SUN_CY} r="320" fill={`url(#${sunOuterGlowId})`} />
            <circle cx={SUN_CX} cy={SUN_CY} r="145" fill={`url(#${sunCoronaGlowId})`} />
            <circle cx={SUN_CX} cy={SUN_CY} r="46" fill={`url(#${sunDiscGradId})`} />
          </g>

          {/* Dải đảo đá viễn cảnh sát chân trời */}
          <g fill="#5B4D67" opacity="0.38">
            {LAYER1_FAR_HORIZON_ISLANDS.map((d, idx) => (
              <path key={idx} d={d} />
            ))}
          </g>

          {/* Sương mù chân trời hòa tan vạch cắt trời - biển */}
          <rect x="-80" y="468" width="1760" height="122" fill={`url(#${horizonMistGradId})`} />

          {/* 2 đàn chim hải âu / hạc chiều vỗ cánh bay lượn */}
          <g data-testid="halong-bird-flocks" fill="none" stroke="#2D1D24" strokeLinecap="round">
            <g className={prefersReducedMotion ? undefined : 'lu-flock-glide-1'}>
              {BIRD_FLOCK_WEST.map((bird, idx) => (
                <g
                  key={`bw-${idx}`}
                  transform={`translate(${bird.x}, ${bird.y}) scale(${bird.scale})`}
                >
                  <path
                    d="M -9 -2 Q -4 -7 0 0 Q 4 -7 9 -2"
                    strokeWidth="1.6"
                    className={prefersReducedMotion ? undefined : 'lu-bird-flap'}
                    style={
                      prefersReducedMotion
                        ? undefined
                        : {
                            animationDelay: `${bird.flapDelaySec}s`,
                            animationDuration: `${bird.flapDurationSec}s`,
                          }
                    }
                  />
                </g>
              ))}
            </g>

            <g className={prefersReducedMotion ? undefined : 'lu-flock-glide-2'}>
              {BIRD_FLOCK_EAST.map((bird, idx) => (
                <g
                  key={`be-${idx}`}
                  transform={`translate(${bird.x}, ${bird.y}) scale(${bird.scale})`}
                >
                  <path
                    d="M -8 -2 Q -4 -6 0 0 Q 4 -6 8 -2"
                    strokeWidth="1.45"
                    className={prefersReducedMotion ? undefined : 'lu-bird-flap'}
                    style={
                      prefersReducedMotion
                        ? undefined
                        : {
                            animationDelay: `${bird.flapDelaySec}s`,
                            animationDuration: `${bird.flapDurationSec}s`,
                          }
                    }
                  />
                </g>
              ))}
            </g>
          </g>
        </svg>
      </div>

      {/* TẦNG 2 (Trung cảnh xa): Đảo Karst đa sắc + 2 dải sương mù luồn lưng chừng & chân đảo (-mx*16) */}
      <div
        ref={layer2Ref}
        data-testid="son-ha-layer-2"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={midFarRockGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2A4C47" />
              <stop offset="50%" stopColor="#1E3A36" />
              <stop offset="100%" stopColor="#122723" />
            </linearGradient>
            <linearGradient id={midFarLitGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E69A58" stopOpacity="0.72" />
              <stop offset="55%" stopColor="#996C58" stopOpacity="0.48" />
              <stop offset="100%" stopColor="#26403B" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id={midFarRimGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFD584" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#E06D42" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id={foliageDarkGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22453B" />
              <stop offset="100%" stopColor="#0E211D" />
            </linearGradient>
            <filter id={mistBlurId} x="-15%" y="-40%" width="130%" height="180%">
              <feGaussianBlur stdDeviation="20 6" />
            </filter>
          </defs>

          {LAYER2_MID_FAR_ISLANDS.map((island) => (
            <g key={island.id} opacity="0.86">
              <PainterlyKarstIsland island={island} ids={midFarIslandIds} litOpacity={0.78} />
            </g>
          ))}

          {/* Dải sương mù 1 & 2 luồn ngang lưng chừng & chân đảo trung cảnh xa */}
          <g
            filter={`url(#${mistBlurId})`}
            className={prefersReducedMotion ? undefined : 'lu-mist-drift'}
          >
            <ellipse cx="290" cy="482" rx="340" ry="18" fill="#FDEFE0" fillOpacity="0.28" />
            <ellipse cx="860" cy="496" rx="420" ry="16" fill="#FFEBD6" fillOpacity="0.24" />
            <ellipse cx="1310" cy="474" rx="340" ry="20" fill="#FDEFE0" fillOpacity="0.26" />
          </g>
          <g
            filter={`url(#${mistBlurId})`}
            className={prefersReducedMotion ? undefined : 'lu-mist-drift-reverse'}
          >
            <ellipse cx="520" cy="524" rx="310" ry="14" fill="#FFF3E4" fillOpacity="0.24" />
            <ellipse cx="1140" cy="526" rx="360" ry="15" fill="#FDE8D2" fillOpacity="0.22" />
          </g>
        </svg>
      </div>

      {/* TẦNG 3: Mặt biển, Bóng phản chiếu gợn sóng feTurbulence, Đảo Karst gần, Hòn Trống Mái, Sương chân đảo & 2 Thuyền (+mx*26) */}
      <div
        ref={layer3Ref}
        data-testid="son-ha-layer-3"
        className="absolute -inset-6 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={seaGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#163E37" />
              <stop offset="32%" stopColor="#1D5147" />
              <stop offset="72%" stopColor="#123832" />
              <stop offset="100%" stopColor="#0A231F" />
            </linearGradient>

            {/* Ánh ráng hoàng hôn phản chiếu mềm dưới mặt biển */}
            <radialGradient id={seaSunSheenId} cx="51%" cy="8%" r="48%">
              <stop offset="0%" stopColor="#F5AF67" stopOpacity="0.34" />
              <stop offset="45%" stopColor="#C47448" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#123832" stopOpacity="0" />
            </radialGradient>

            {/* Sườn tối & thảm thực vật đá vôi đa điểm (#162E2A -> #244740 -> #0D1F1C) */}
            <linearGradient id={darkRockGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#244740" />
              <stop offset="52%" stopColor="#162E2A" />
              <stop offset="100%" stopColor="#0D1F1C" />
            </linearGradient>

            {/* Sườn đón nắng hoàng hôn hòa mượt vào đá */}
            <linearGradient id={litRockGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E69B56" />
              <stop offset="42%" stopColor="#9C7357" />
              <stop offset="100%" stopColor="#23423B" />
            </linearGradient>

            {/* Viền sáng vàng kim loại gờ đá đón nắng */}
            <linearGradient id={sunsetRimGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFE19C" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#E8A85A" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#C88A56" stopOpacity="0.15" />
            </linearGradient>

            {/* Gradient bóng phản chiếu lộn ngược */}
            <linearGradient
              id={reflectGrad535Id}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="535"
              x2="0"
              y2="290"
            >
              <stop offset="0%" stopColor="rgba(9, 27, 23, 0.62)" />
              <stop offset="100%" stopColor="rgba(9, 27, 23, 0)" />
            </linearGradient>
            <linearGradient
              id={reflectGrad548Id}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="548"
              x2="0"
              y2="380"
            >
              <stop offset="0%" stopColor="rgba(9, 27, 23, 0.62)" />
              <stop offset="100%" stopColor="rgba(9, 27, 23, 0)" />
            </linearGradient>
            <linearGradient
              id={boatReflectGradId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="10"
              x2="0"
              y2="-92"
            >
              <stop offset="0%" stopColor="rgba(10, 28, 24, 0.6)" />
              <stop offset="100%" stopColor="rgba(10, 28, 24, 0)" />
            </linearGradient>

            {/* Cánh buồm nâu cánh gián xuyên sáng hoàng hôn */}
            <linearGradient id={sailGradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A95638" />
              <stop offset="60%" stopColor="#7E3D28" />
              <stop offset="100%" stopColor="#58281B" />
            </linearGradient>

            {/* Ánh đèn lồng vàng ấm */}
            <radialGradient id={lanternGlowId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB84D" stopOpacity="0.88" />
              <stop offset="50%" stopColor="#E88B38" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#E88B38" stopOpacity="0" />
            </radialGradient>

            {/* Bộ lọc sóng gợn nhẹ feTurbulence + feDisplacementMap cho bóng phản chiếu uốn lượn */}
            <filter id={waterRippleFilterId} x="-15%" y="-15%" width="130%" height="130%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.015 0.065"
                numOctaves="2"
                seed="5"
                result="rippleNoise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="rippleNoise"
                scale="6.5"
                xChannelSelector="R"
                yChannelSelector="G"
                result="rippled"
              />
              <feGaussianBlur in="rippled" stdDeviation="1.4 0.55" />
            </filter>
          </defs>

          {/* Mặt biển ngọc lục bảo + ánh phản quang hoàng hôn dịu */}
          <rect x="-80" y={WATERLINE_Y} width="1760" height="420" fill={`url(#${seaGradId})`} />
          <rect x="-80" y={WATERLINE_Y} width="1760" height="390" fill={`url(#${seaSunSheenId})`} />

          {/* Các đảo Karst trung cảnh gần + bóng phản chiếu gợn sóng */}
          {LAYER3_MID_NEAR_ISLANDS.map((island) => (
            <g key={island.id}>
              <g
                transform={`translate(0, ${island.waterY}) scale(1, -0.45) translate(0, -${island.waterY})`}
                filter={`url(#${waterRippleFilterId})`}
                className={prefersReducedMotion ? undefined : 'lu-reflection-sway'}
              >
                <path d={island.bodyPath} fill={`url(#${reflectGrad535Id})`} />
              </g>
              <PainterlyKarstIsland island={island} ids={nearIslandIds} litOpacity={0.9} />
            </g>
          ))}

          {/* BIỂU TƯỢNG HÒN TRỐNG MÁI (Fighting Cocks Islet) */}
          <g data-testid="hon-trong-mai">
            {HON_TRONG_MAI.map((rock) => (
              <g key={rock.id}>
                <g
                  transform={`translate(0, ${rock.waterY}) scale(1, -0.45) translate(0, -${rock.waterY})`}
                  filter={`url(#${waterRippleFilterId})`}
                  className={prefersReducedMotion ? undefined : 'lu-reflection-sway'}
                >
                  <path d={rock.bodyPath} fill={`url(#${reflectGrad548Id})`} />
                </g>
                <PainterlyKarstIsland island={rock} ids={nearIslandIds} litOpacity={0.94} />
              </g>
            ))}
          </g>

          {/* Dải sương mù thứ 3 ôm sát chân cụm đảo trung cảnh gần */}
          <g
            filter={`url(#${mistBlurId})`}
            className={prefersReducedMotion ? undefined : 'lu-mist-drift'}
          >
            <ellipse cx="320" cy="534" rx="220" ry="11" fill="#FDEFE0" fillOpacity="0.22" />
            <ellipse cx="1235" cy="534" rx="240" ry="12" fill="#FDEFE0" fillOpacity="0.2" />
          </g>

          {/* 2 THUYỀN GỖ BUỒM CÁNH DƠI TRUYỀN THỐNG HẠ LONG */}
          <BatWingJunkBoat
            testId="halong-junk-boat-far"
            x={645}
            y={548}
            scale={0.58}
            sailGradId={sailGradId}
            reflectGradId={boatReflectGradId}
            waterRippleFilterId={waterRippleFilterId}
            lanternGlowId={lanternGlowId}
            glideClass={prefersReducedMotion ? undefined : 'lu-boat-glide-far'}
            rockClass={prefersReducedMotion ? undefined : 'lu-boat-rock-slow'}
            reducedMotion={prefersReducedMotion}
          />

          <BatWingJunkBoat
            testId="halong-junk-boat-near"
            x={948}
            y={576}
            scale={0.96}
            flipX
            sailGradId={sailGradId}
            reflectGradId={boatReflectGradId}
            waterRippleFilterId={waterRippleFilterId}
            lanternGlowId={lanternGlowId}
            glideClass={prefersReducedMotion ? undefined : 'lu-boat-glide-near'}
            rockClass={prefersReducedMotion ? undefined : 'lu-boat-rock'}
            reducedMotion={prefersReducedMotion}
          />
        </svg>
      </div>

      {/* TẦNG 4 (Tiền cảnh 2 bên rìa màn hình): Vách đá đa sắc sẫm & viền ánh vàng kim loại (+mx*42) */}
      <div
        ref={layer4Ref}
        data-testid="son-ha-layer-4"
        className="absolute -inset-10 will-change-transform"
      >
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          <defs>
            <linearGradient id={`hl-fg-rock-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#193832" />
              <stop offset="55%" stopColor="#102722" />
              <stop offset="100%" stopColor="#081714" />
            </linearGradient>
            <linearGradient id={`hl-fg-lit-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C88753" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#1A3530" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient
              id={`hl-fg-reflect-${uid}`}
              gradientUnits="userSpaceOnUse"
              x1="0"
              y1="575"
              x2="0"
              y2="340"
            >
              <stop offset="0%" stopColor="rgba(8, 22, 19, 0.62)" />
              <stop offset="100%" stopColor="rgba(8, 22, 19, 0)" />
            </linearGradient>
          </defs>

          {/* Bóng đảo tiền cảnh phản chiếu gợn nhẹ */}
          <g
            transform="translate(0, 575) scale(1, -0.45) translate(0, -575)"
            opacity="0.65"
            className={prefersReducedMotion ? undefined : 'lu-reflection-sway'}
          >
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
            fill={`url(#hl-fg-rock-${uid})`}
          />
          <path
            d="M 54 388 L 78 410 L 102 456 L 116 498 L 106 544 L 84 562 L 94 578 L 62 578 L 58 510 L 48 440 Z"
            fill={`url(#hl-fg-lit-${uid})`}
          />
          <path d="M -90 325 Q -32 308 16 336 Q 48 360 66 392 Q 14 394 -90 384 Z" fill="#0F2621" />
          <path
            d="M 24 338 L 54 388 L 78 410 L 102 456 L 116 498"
            fill="none"
            stroke={`url(#${sunsetRimGradId})`}
            strokeWidth="1.2"
          />

          {/* Vách đá vôi rìa phải */}
          <path
            d="M 1495 578 L 1508 558 L 1488 538 L 1482 496 L 1496 446 L 1522 396 L 1546 378 L 1568 336 L 1605 322 L 1690 312 L 1690 578 Z"
            fill={`url(#hl-fg-rock-${uid})`}
          />
          <path
            d="M 1495 578 L 1508 558 L 1488 538 L 1482 496 L 1496 446 L 1522 396 L 1546 378 L 1534 452 L 1524 522 L 1528 578 Z"
            fill={`url(#hl-fg-lit-${uid})`}
          />
          <path
            d="M 1534 382 Q 1568 332 1605 316 Q 1650 304 1690 312 L 1690 368 Q 1612 372 1534 382 Z"
            fill="#0F2621"
          />
          <path
            d="M 1482 496 L 1496 446 L 1522 396 L 1546 378 L 1568 336"
            fill="none"
            stroke={`url(#${sunsetRimGradId})`}
            strokeWidth="1.2"
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
