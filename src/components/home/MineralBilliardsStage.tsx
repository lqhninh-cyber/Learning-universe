import {
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  RotateCcw,
  Trophy,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';
import {
  playBallClack,
  playCueStrike,
  playCushionBounce,
  playPocketDrop,
  playRackClear,
  playTrickShotReward,
  setBilliardSoundEnabled,
  unlockBilliardAudio,
} from '@/utils/billiardAudio';

export interface MineralBilliardsStageProps {
  readonly className?: string;
}

export type BilliardGameMode = 'free' | 'sequential' | 'two-player';

const SUBSTEPS = 6;
const BALL_RESTITUTION = 0.96;
const CUSHION_RESTITUTION = 0.86;
const JAW_RESTITUTION = 0.78;
const JAW_RADIUS_PX = 3.5;
const STOP_SPEED_PX_PER_FRAME = 0.08;
const CANCEL_PULL_DISTANCE_PX = 12;
const MAX_PULL_DISTANCE_PX = 155;
const MAX_SHOT_SPEED_PX_PER_FRAME = 23.5;
const POCKET_SINK_DURATION_SEC = 0.18;
const STRIKE_ANIM_DURATION_SEC = 0.075;
const CHALK_DUST_DURATION_SEC = 0.35;
const TABLE_SHAKE_DURATION_SEC = 0.13;
const TABLE_SHAKE_AMP_PX = 2.5;
const GHOST_CUE_VECTOR_LEN_PX = 56;
const PRECISION_AIM_FACTOR = 0.25;
const ENGLISH_MAX_DEFLECT_RAD = (18 * Math.PI) / 180;
const BEST_RECORD_STORAGE_KEY = 'lu_billiards_best_shots_v1';

interface TargetBallSpec {
  readonly number: 1 | 2 | 3 | 4 | 5 | 6;
  readonly name: string;
  readonly colorHex: string;
  readonly lightHex: string;
  readonly shadowHex: string;
}

const MINERAL_TARGET_BALL_SPECS: readonly TargetBallSpec[] = [
  {
    number: 1,
    name: 'Đồng Hổ Phách',
    colorHex: '#9C7A4C',
    lightHex: '#D8BA8C',
    shadowHex: '#594223',
  },
  {
    number: 2,
    name: 'Ngọc Bích',
    colorHex: '#3B7A65',
    lightHex: '#7CC2AA',
    shadowHex: '#1C4134',
  },
  {
    number: 3,
    name: 'Lam Phiến',
    colorHex: '#49768F',
    lightHex: '#89B5CD',
    shadowHex: '#233E4E',
  },
  {
    number: 4,
    name: 'Đất Nung',
    colorHex: '#9E6356',
    lightHex: '#D79B8E',
    shadowHex: '#5A3229',
  },
  {
    number: 5,
    name: 'Hoàng Thổ',
    colorHex: '#C29548',
    lightHex: '#EED08E',
    shadowHex: '#70521F',
  },
  {
    number: 6,
    name: 'Thạch Anh Trầm',
    colorHex: '#6E5A7A',
    lightHex: '#AC98B8',
    shadowHex: '#3C2E45',
  },
] as const;

interface BilliardBall {
  readonly id: number; // 0 = Bi cái (Cue Ball), 1..6 = 6 Bi mục tiêu
  readonly colorHex: string;
  readonly lightHex: string;
  readonly shadowHex: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rollX: number;
  rollY: number;
  spotNx: number;
  spotNy: number;
  spotNz: number;
  cushionBouncesThisTurn: number;
  pocketed: boolean;
  sinking: boolean;
  sinkProgress: number;
  sinkTargetX: number;
  sinkTargetY: number;
}

interface PocketNode {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly isCorner: boolean;
}

interface PocketJawNode {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

interface PocketRipple {
  active: boolean;
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
}

interface SparkParticle {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ageSec: number;
  maxAgeSec: number;
  colorRgba: string;
  radius: number;
}

interface FloatingBannerText {
  active: boolean;
  x: number;
  y: number;
  text: string;
  colorHex: string;
  ageSec: number;
  durationSec: number;
}

interface StrikeAnimationState {
  active: boolean;
  elapsedSec: number;
  durationSec: number;
  dirX: number;
  dirY: number;
  power: number;
  launchSpeed: number;
  pullBackOffsetPx: number;
  spinX: number;
  spinY: number;
}

interface TableMetrics {
  width: number;
  height: number;
  railWidth: number;
  feltLeft: number;
  feltTop: number;
  feltRight: number;
  feltBottom: number;
  feltWidth: number;
  feltHeight: number;
  ballRadius: number;
  pocketRadius: number;
  baulkLineX: number;
  footSpotX: number;
  centerY: number;
  pockets: PocketNode[];
  pocketJaws: PocketJawNode[];
}

interface GhostBallRaycastResult {
  readonly ghostX: number;
  readonly ghostY: number;
  readonly hitBall: BilliardBall | null;
  readonly targetDirX: number;
  readonly targetDirY: number;
  readonly cueDeflectX: number;
  readonly cueDeflectY: number;
}

interface BilliardsWorld {
  metrics: TableMetrics;
  dpr: number;
  gameMode: BilliardGameMode;
  balls: BilliardBall[];
  ripples: PocketRipple[];
  rippleCursor: number;
  sparks: SparkParticle[];
  sparkCursor: number;
  floatTexts: FloatingBannerText[];
  floatCursor: number;
  isAiming: boolean;
  aimStartX: number;
  aimStartY: number;
  pointerX: number;
  pointerY: number;
  isPrecisionAim: boolean;
  precisionBaseAngle: number;
  hoverPlaceX: number;
  hoverPlaceY: number;
  spinX: number;
  spinY: number;
  activeCueSpinX: number;
  activeCueSpinY: number;
  activeShotDirX: number;
  activeShotDirY: number;
  cueHasHitBallThisTurn: boolean;
  firstHitBallIdThisTurn: number | null;
  requiredTargetIdAtShotStart: number | null;
  scratchedThisTurn: boolean;
  foulMessage: string | null;
  strikeAnim: StrikeAnimationState;
  shakeRemainingSec: number;
  shotInProgress: boolean;
  pocketedThisTurn: number;
  ballInHand: boolean;
  shots: number;
  combo: number;
  currentPlayer: 1 | 2;
  p1Score: number;
  p2Score: number;
  rackCleared: boolean;
}

function normalizeAngleDiff(diff: number): number {
  return Math.atan2(Math.sin(diff), Math.cos(diff));
}

function computeTableMetrics(width: number, height: number): TableMetrics {
  const safeW = Math.max(360, width);
  const safeH = Math.max(200, height);
  const railWidth = Math.max(22, Math.min(36, Math.round(Math.min(safeW * 0.036, safeH * 0.072))));

  const feltLeft = railWidth;
  const feltTop = railWidth;
  const feltRight = safeW - railWidth;
  const feltBottom = safeH - railWidth;
  const feltWidth = Math.max(240, feltRight - feltLeft);
  const feltHeight = Math.max(120, feltBottom - feltTop);

  const ballRadius = Math.max(9.5, Math.min(15, feltHeight * 0.035));
  const pocketRadius = ballRadius * 1.65;

  const baulkLineX = feltLeft + feltWidth * 0.24;
  const footSpotX = feltLeft + feltWidth * 0.72;
  const centerY = feltTop + feltHeight * 0.5;

  const midX = feltLeft + feltWidth * 0.5;
  const cornerInset = 2;
  const pockets: PocketNode[] = [
    { id: 0, x: feltLeft + cornerInset, y: feltTop + cornerInset, isCorner: true },
    { id: 1, x: midX, y: feltTop - 2, isCorner: false },
    { id: 2, x: feltRight - cornerInset, y: feltTop + cornerInset, isCorner: true },
    { id: 3, x: feltLeft + cornerInset, y: feltBottom - cornerInset, isCorner: true },
    { id: 4, x: midX, y: feltBottom + 2, isCorner: false },
    { id: 5, x: feltRight - cornerInset, y: feltBottom - cornerInset, isCorner: true },
  ];

  // 12 Chốt bo góc miệng lỗ (Pocket Knuckles / Jaws: 2 mép vát cho mỗi lỗ trong 6 lỗ)
  const cornerMouthOffset = pocketRadius * 1.06;
  const sideMouthOffset = pocketRadius * 0.96;
  const rawJaws: { x: number; y: number }[] = [
    // Lỗ 0 (Góc trên trái)
    { x: feltLeft + cornerMouthOffset, y: feltTop },
    { x: feltLeft, y: feltTop + cornerMouthOffset },
    // Lỗ 1 (Giữa trên)
    { x: midX - sideMouthOffset, y: feltTop },
    { x: midX + sideMouthOffset, y: feltTop },
    // Lỗ 2 (Góc trên phải)
    { x: feltRight - cornerMouthOffset, y: feltTop },
    { x: feltRight, y: feltTop + cornerMouthOffset },
    // Lỗ 3 (Góc dưới trái)
    { x: feltLeft + cornerMouthOffset, y: feltBottom },
    { x: feltLeft, y: feltBottom - cornerMouthOffset },
    // Lỗ 4 (Giữa dưới)
    { x: midX - sideMouthOffset, y: feltBottom },
    { x: midX + sideMouthOffset, y: feltBottom },
    // Lỗ 5 (Góc dưới phải)
    { x: feltRight - cornerMouthOffset, y: feltBottom },
    { x: feltRight, y: feltBottom - cornerMouthOffset },
  ];

  const pocketJaws: PocketJawNode[] = rawJaws.map((pt, idx) => ({
    id: idx,
    x: pt.x,
    y: pt.y,
    r: JAW_RADIUS_PX,
  }));

  return {
    width: safeW,
    height: safeH,
    railWidth,
    feltLeft,
    feltTop,
    feltRight,
    feltBottom,
    feltWidth,
    feltHeight,
    ballRadius,
    pocketRadius,
    baulkLineX,
    footSpotX,
    centerY,
    pockets,
    pocketJaws,
  };
}

/**
 * Xếp 1 Bi cái ở vạch khai cuộc (baulk line) và 6 Bi mục tiêu thành hình tam giác 1-2-3 chuẩn tâm đối diện.
 */
function buildRackBalls(metrics: TableMetrics): BilliardBall[] {
  const r = metrics.ballRadius;
  const rowGapX = r * Math.sqrt(3) * 1.03;
  const colGapY = r * 2.05;

  const triangleOffsets: readonly { readonly row: number; readonly offsetY: number }[] = [
    { row: 0, offsetY: 0 }, // Bi 1
    { row: 1, offsetY: -0.5 }, // Bi 2
    { row: 1, offsetY: 0.5 }, // Bi 3
    { row: 2, offsetY: -1 }, // Bi 4
    { row: 2, offsetY: 0 }, // Bi 5
    { row: 2, offsetY: 1 }, // Bi 6
  ];

  const cueBall: BilliardBall = {
    id: 0,
    colorHex: '#FAFBF9',
    lightHex: '#FFFFFF',
    shadowHex: '#C6D3CE',
    x: metrics.baulkLineX,
    y: metrics.centerY,
    vx: 0,
    vy: 0,
    rollX: 0,
    rollY: 0,
    spotNx: 0,
    spotNy: 0,
    spotNz: 1,
    cushionBouncesThisTurn: 0,
    pocketed: false,
    sinking: false,
    sinkProgress: 0,
    sinkTargetX: 0,
    sinkTargetY: 0,
  };

  const targetBalls: BilliardBall[] = MINERAL_TARGET_BALL_SPECS.map((spec, idx) => {
    const pos = triangleOffsets[idx] ?? { row: 0, offsetY: 0 };
    return {
      id: spec.number,
      colorHex: spec.colorHex,
      lightHex: spec.lightHex,
      shadowHex: spec.shadowHex,
      x: metrics.footSpotX + pos.row * rowGapX,
      y: metrics.centerY + pos.offsetY * colGapY,
      vx: 0,
      vy: 0,
      rollX: 0,
      rollY: 0,
      spotNx: 0,
      spotNy: 0,
      spotNz: 1,
      cushionBouncesThisTurn: 0,
      pocketed: false,
      sinking: false,
      sinkProgress: 0,
      sinkTargetX: 0,
      sinkTargetY: 0,
    };
  });

  return [cueBall, ...targetBalls];
}

/**
 * Cập nhật góc xoay giả 3D (rollX, rollY) và pháp tuyến điểm lõi số trên mặt cầu khi bi lăn (dx, dy).
 */
function advanceBallRolling3D(ball: BilliardBall, dx: number, dy: number, radius: number): void {
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-4 || radius <= 0) return;

  const dTheta = dist / radius;
  ball.rollX += dx / radius;
  ball.rollY += dy / radius;

  // Trục quay trên mặt phẳng bàn: u = (-dy, dx, 0) / dist
  const ux = -dy / dist;
  const uy = dx / dist;
  const cosT = Math.cos(dTheta);
  const sinT = Math.sin(dTheta);

  const nx = ball.spotNx;
  const ny = ball.spotNy;
  const nz = ball.spotNz;

  // Công thức Rodrigues cho vector (nx, ny, nz) quay quanh (ux, uy, 0)
  const dot = ux * nx + uy * ny;
  const crossX = uy * nz;
  const crossY = -ux * nz;
  const crossZ = ux * ny - uy * nx;

  const nextNx = nx * cosT + crossX * sinT + ux * dot * (1 - cosT);
  const nextNy = ny * cosT + crossY * sinT + uy * dot * (1 - cosT);
  const nextNz = nz * cosT + crossZ * sinT;

  const norm = Math.hypot(nextNx, nextNy, nextNz) || 1;
  ball.spotNx = nextNx / norm;
  ball.spotNy = nextNy / norm;
  ball.spotNz = nextNz / norm;
}

function getLowestRemainingTargetId(balls: readonly BilliardBall[]): number | null {
  let lowest: number | null = null;
  for (const b of balls) {
    if (b.id >= 1 && !b.pocketed && !b.sinking) {
      if (lowest === null || b.id < lowest) {
        lowest = b.id;
      }
    }
  }
  return lowest;
}

function createBilliardsWorld(width = 960, height = 480): BilliardsWorld {
  const metrics = computeTableMetrics(width, height);
  return {
    metrics,
    dpr: 1,
    gameMode: 'free',
    balls: buildRackBalls(metrics),
    ripples: Array.from({ length: 16 }, () => ({
      active: false,
      x: 0,
      y: 0,
      r: 4,
      maxR: 38,
      alpha: 0,
    })),
    rippleCursor: 0,
    sparks: Array.from({ length: 48 }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ageSec: 0,
      maxAgeSec: 0.25,
      colorRgba: 'rgba(246, 224, 168, 1)',
      radius: 1.8,
    })),
    sparkCursor: 0,
    floatTexts: Array.from({ length: 12 }, () => ({
      active: false,
      x: 0,
      y: 0,
      text: '',
      colorHex: '#D9B468',
      ageSec: 0,
      durationSec: 1.15,
    })),
    floatCursor: 0,
    isAiming: false,
    aimStartX: metrics.baulkLineX,
    aimStartY: metrics.centerY,
    pointerX: metrics.baulkLineX,
    pointerY: metrics.centerY,
    isPrecisionAim: false,
    precisionBaseAngle: 0,
    hoverPlaceX: metrics.baulkLineX,
    hoverPlaceY: metrics.centerY,
    spinX: 0,
    spinY: 0,
    activeCueSpinX: 0,
    activeCueSpinY: 0,
    activeShotDirX: 1,
    activeShotDirY: 0,
    cueHasHitBallThisTurn: false,
    firstHitBallIdThisTurn: null,
    requiredTargetIdAtShotStart: 1,
    scratchedThisTurn: false,
    foulMessage: null,
    strikeAnim: {
      active: false,
      elapsedSec: 0,
      durationSec: STRIKE_ANIM_DURATION_SEC,
      dirX: 1,
      dirY: 0,
      power: 0,
      launchSpeed: 0,
      pullBackOffsetPx: 0,
      spinX: 0,
      spinY: 0,
    },
    shakeRemainingSec: 0,
    shotInProgress: false,
    pocketedThisTurn: 0,
    ballInHand: false,
    shots: 0,
    combo: 0,
    currentPlayer: 1,
    p1Score: 0,
    p2Score: 0,
    rackCleared: false,
  };
}

/**
 * Tính giao điểm đầu tiên dọc hướng bắn (Ghost Ball Raycast) kèm cả 2 tia phản xạ:
 * 1) Hướng bay của bi mục tiêu (targetDirX, targetDirY)
 * 2) Hướng trượt tiếp tuyến của chính bi cái sau va chạm (cueDeflectX, cueDeflectY) có điều chỉnh theo Cù lê / Trô / Ép phê.
 */
function computeGhostBallRaycast(
  cueBall: BilliardBall,
  dirX: number,
  dirY: number,
  spinX: number,
  spinY: number,
  balls: readonly BilliardBall[],
  metrics: TableMetrics,
): GhostBallRaycastResult {
  const r = metrics.ballRadius;
  const twoR = r * 2;
  let minDistance = Number.POSITIVE_INFINITY;
  let hitBall: BilliardBall | null = null;
  let cushionNormalX = 0;
  let cushionNormalY = 0;

  const minX = metrics.feltLeft + r;
  const maxX = metrics.feltRight - r;
  const minY = metrics.feltTop + r;
  const maxY = metrics.feltBottom - r;

  if (dirX > 1e-5) {
    const tRight = (maxX - cueBall.x) / dirX;
    if (tRight > 0 && tRight < minDistance) {
      minDistance = tRight;
      cushionNormalX = -1;
      cushionNormalY = 0;
    }
  } else if (dirX < -1e-5) {
    const tLeft = (minX - cueBall.x) / dirX;
    if (tLeft > 0 && tLeft < minDistance) {
      minDistance = tLeft;
      cushionNormalX = 1;
      cushionNormalY = 0;
    }
  }

  if (dirY > 1e-5) {
    const tBottom = (maxY - cueBall.y) / dirY;
    if (tBottom > 0 && tBottom < minDistance) {
      minDistance = tBottom;
      cushionNormalX = 0;
      cushionNormalY = -1;
    }
  } else if (dirY < -1e-5) {
    const tTop = (minY - cueBall.y) / dirY;
    if (tTop > 0 && tTop < minDistance) {
      minDistance = tTop;
      cushionNormalX = 0;
      cushionNormalY = 1;
    }
  }

  for (const target of balls) {
    if (target.id === 0 || target.pocketed || target.sinking) continue;
    const ocX = target.x - cueBall.x;
    const ocY = target.y - cueBall.y;
    const proj = ocX * dirX + ocY * dirY;
    if (proj <= 0) continue;

    const perpSq = ocX * ocX + ocY * ocY - proj * proj;
    const radSq = twoR * twoR;
    if (perpSq >= radSq) continue;

    const hitDist = proj - Math.sqrt(radSq - perpSq);
    if (hitDist > 0 && hitDist < minDistance) {
      minDistance = hitDist;
      hitBall = target;
    }
  }

  const safeDist = Number.isFinite(minDistance) ? Math.max(0, minDistance) : 220;
  const ghostX = cueBall.x + dirX * safeDist;
  const ghostY = cueBall.y + dirY * safeDist;

  let targetDirX = 0;
  let targetDirY = 0;
  let cueDeflectX: number;
  let cueDeflectY: number;

  if (hitBall) {
    const nx = hitBall.x - ghostX;
    const ny = hitBall.y - ghostY;
    const nLen = Math.hypot(nx, ny) || 1;
    targetDirX = nx / nLen;
    targetDirY = ny / nLen;

    // Phương tiếp tuyến cơ sở của bi cái sau va chạm đàn hồi: t = d - (d·n)n
    const dotDN = dirX * targetDirX + dirY * targetDirY;
    let tx = dirX - dotDN * targetDirX;
    let ty = dirY - dotDN * targetDirY;
    const tLen = Math.hypot(tx, ty);
    if (tLen > 1e-4) {
      tx /= tLen;
      ty /= tLen;
    } else {
      // Va chạm trực diện tâm đối tâm
      tx = spinY >= 0 ? dirX : -dirX;
      ty = spinY >= 0 ? dirY : -dirY;
    }

    // Điều chỉnh theo xoáy Cù lê (spinY > 0 tiến theo dir) hoặc Trô (spinY < 0 giật lùi theo -targetDir)
    const spinPullX = spinY >= 0 ? dirX * spinY * 0.72 : -targetDirX * Math.abs(spinY) * 0.85;
    const spinPullY = spinY >= 0 ? dirY * spinY * 0.72 : -targetDirY * Math.abs(spinY) * 0.85;

    const rawCueX = tx * 0.75 + spinPullX;
    const rawCueY = ty * 0.75 + spinPullY;
    const cLen = Math.hypot(rawCueX, rawCueY) || 1;
    cueDeflectX = rawCueX / cLen;
    cueDeflectY = rawCueY / cLen;
  } else {
    // Phản xạ thành băng kèm góc lệch Ép phê (±18° * spinX)
    const dotN = dirX * cushionNormalX + dirY * cushionNormalY;
    const rx = dirX - 2 * dotN * cushionNormalX;
    const ry = dirY - 2 * dotN * cushionNormalY;
    const baseAng = Math.atan2(ry, rx) + spinX * ENGLISH_MAX_DEFLECT_RAD;
    cueDeflectX = Math.cos(baseAng);
    cueDeflectY = Math.sin(baseAng);
  }

  return {
    ghostX,
    ghostY,
    hitBall,
    targetDirX,
    targetDirY,
    cueDeflectX,
    cueDeflectY,
  };
}

function readBestRecordFromStorage(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BEST_RECORD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function writeBestRecordToStorage(shots: number): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(BEST_RECORD_STORAGE_KEY, String(shots));
  } catch {
    // Bỏ qua lỗi storage
  }
}

/**
 * SCREEN 3 (V2): SÂN KHẤU BIDA KHOÁNG THẠCH 6 BI 120FPS
 * - Ngắm kéo tự do toàn mặt bàn (Free-Drag Aiming) + Giữ Shift ngắm vi chỉnh (0.25x) + 2 tia phản xạ tại Bi Ảo.
 * - Vật lý Xoáy bi (Cù lê / Trô / Ép phê ±18°), 12 chốt bo góc miệng lỗ (Pocket Jaws) & Bi lăn 3D (rollX, rollY).
 * - Animation gậy lao chạm bi 75ms, bụi phấn lơ #DCEAE6, rung bàn vi mô >82% lực, nhận diện BANK SHOT! / DOUBLE POT! / COMBO ×N!.
 * - Khay rãnh đựng bi đã ăn & 3 chế độ chơi: Tự do · Thứ tự 1→6 · 2 Người (P1 vs P2).
 */
export function MineralBilliardsStage({ className }: MineralBilliardsStageProps = {}) {
  const prefersReducedMotion = useReducedMotion();

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [gameMode, setGameMode] = useState<BilliardGameMode>('free');
  const [shots, setShots] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestRecord, setBestRecord] = useState<number | null>(() => readBestRecordFromStorage());
  const [ballInHand, setBallInHand] = useState(false);
  const [foulBanner, setFoulBanner] = useState<string | null>(null);
  const [rackCleared, setRackCleared] = useState(false);
  const [pocketedBallIds, setPocketedBallIds] = useState<readonly number[]>([]);
  const [spin, setSpin] = useState<{ readonly x: number; readonly y: number }>({ x: 0, y: 0 });
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spinPadRef = useRef<HTMLDivElement>(null);
  const isDraggingSpinRef = useRef(false);

  const worldRef = useRef<BilliardsWorld | null>(null);
  const getWorld = useCallback((): BilliardsWorld => {
    if (!worldRef.current) {
      worldRef.current = createBilliardsWorld(960, 480);
    }
    return worldRef.current;
  }, []);

  const syncReactHudFromWorld = useCallback(() => {
    const w = getWorld();
    setShots(w.shots);
    setCombo(w.combo);
    setBallInHand(w.ballInHand);
    setFoulBanner(w.foulMessage);
    setRackCleared(w.rackCleared);
    setCurrentPlayer(w.currentPlayer);
    setP1Score(w.p1Score);
    setP2Score(w.p2Score);
    const pocketedIds = w.balls.filter((b) => b.id >= 1 && b.pocketed).map((b) => b.id);
    setPocketedBallIds(pocketedIds);
  }, [getWorld]);

  const spawnPocketRipple = useCallback(
    (x: number, y: number, maxR = 36) => {
      const w = getWorld();
      const ripple = w.ripples[w.rippleCursor % w.ripples.length];
      w.rippleCursor = (w.rippleCursor + 1) % w.ripples.length;
      if (!ripple) return;
      ripple.active = true;
      ripple.x = x;
      ripple.y = y;
      ripple.r = 6;
      ripple.maxR = maxR;
      ripple.alpha = 0.92;
    },
    [getWorld],
  );

  const spawnCollisionSparks = useCallback(
    (x: number, y: number, count = 5) => {
      const w = getWorld();
      for (let i = 0; i < count; i += 1) {
        const spark = w.sparks[w.sparkCursor % w.sparks.length];
        w.sparkCursor = (w.sparkCursor + 1) % w.sparks.length;
        if (!spark) continue;
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const speed = 38 + Math.random() * 68;
        spark.active = true;
        spark.x = x;
        spark.y = y;
        spark.vx = Math.cos(angle) * speed;
        spark.vy = Math.sin(angle) * speed;
        spark.ageSec = 0;
        spark.maxAgeSec = 0.16 + Math.random() * 0.1;
        spark.colorRgba = 'rgba(246, 224, 168, 1)';
        spark.radius = 1.8;
      }
    },
    [getWorld],
  );

  // Bung 8-12 hạt bụi phấn lơ màu lam nhạt (#DCEAE6) tan biến trong 350ms khi đầu cơ chạm bi cái
  const spawnChalkDustBurst = useCallback(
    (tipX: number, tipY: number, dirX: number, dirY: number) => {
      const w = getWorld();
      const count = 10;
      const baseAngle = Math.atan2(dirY, dirX);
      for (let i = 0; i < count; i += 1) {
        const spark = w.sparks[w.sparkCursor % w.sparks.length];
        w.sparkCursor = (w.sparkCursor + 1) % w.sparks.length;
        if (!spark) continue;
        const spread = (i / (count - 1) - 0.5) * 1.45 + (Math.random() - 0.5) * 0.25;
        const speed = 24 + Math.random() * 62;
        spark.active = true;
        spark.x = tipX;
        spark.y = tipY;
        spark.vx = Math.cos(baseAngle + spread) * speed;
        spark.vy = Math.sin(baseAngle + spread) * speed;
        spark.ageSec = 0;
        spark.maxAgeSec = CHALK_DUST_DURATION_SEC;
        spark.colorRgba = 'rgba(220, 234, 230, 0.92)'; // #DCEAE6
        spark.radius = 2.1;
      }
    },
    [getWorld],
  );

  const spawnFloatingText = useCallback(
    (x: number, y: number, text: string, colorHex = '#D9B468') => {
      const w = getWorld();
      const item = w.floatTexts[w.floatCursor % w.floatTexts.length];
      w.floatCursor = (w.floatCursor + 1) % w.floatTexts.length;
      if (!item) return;
      item.active = true;
      item.x = x;
      item.y = y;
      item.text = text;
      item.colorHex = colorHex;
      item.ageSec = 0;
      item.durationSec = 1.25;
    },
    [getWorld],
  );

  const clampValidCueBallPlacement = useCallback(
    (rawX: number, rawY: number): { x: number; y: number } => {
      const w = getWorld();
      const { metrics } = w;
      const r = metrics.ballRadius;
      const minX = metrics.feltLeft + r + 6;
      const maxX = metrics.feltRight - r - 6;
      const minY = metrics.feltTop + r + 6;
      const maxY = metrics.feltBottom - r - 6;

      let x = Math.max(minX, Math.min(maxX, rawX));
      let y = Math.max(minY, Math.min(maxY, rawY));

      for (let pass = 0; pass < 4; pass += 1) {
        for (const ball of w.balls) {
          if (ball.id === 0 || ball.pocketed) continue;
          const dx = x - ball.x;
          const dy = y - ball.y;
          const dist = Math.hypot(dx, dy);
          const minSep = r * 2.15;
          if (dist < minSep) {
            const nx = dist > 0.001 ? dx / dist : 1;
            const ny = dist > 0.001 ? dy / dist : 0;
            x = Math.max(minX, Math.min(maxX, ball.x + nx * minSep));
            y = Math.max(minY, Math.min(maxY, ball.y + ny * minSep));
          }
        }
      }

      return { x, y };
    },
    [getWorld],
  );

  const resetRackForMode = useCallback(
    (targetMode: BilliardGameMode) => {
      const w = getWorld();
      w.gameMode = targetMode;
      w.balls = buildRackBalls(w.metrics);
      w.isAiming = false;
      w.strikeAnim.active = false;
      w.shotInProgress = false;
      w.pocketedThisTurn = 0;
      w.ballInHand = false;
      w.foulMessage = null;
      w.shots = 0;
      w.combo = 0;
      w.currentPlayer = 1;
      w.p1Score = 0;
      w.p2Score = 0;
      w.rackCleared = false;
      syncReactHudFromWorld();
    },
    [getWorld, syncReactHudFromWorld],
  );

  const handleNewRack = useCallback(() => {
    resetRackForMode(getWorld().gameMode);
  }, [getWorld, resetRackForMode]);

  const handleSelectGameMode = useCallback(
    (nextMode: BilliardGameMode) => {
      setGameMode(nextMode);
      resetRackForMode(nextMode);
    },
    [resetRackForMode],
  );

  const handleActivateBallInHand = useCallback(() => {
    const w = getWorld();
    const anyMoving = w.balls.some(
      (b) => !b.pocketed && (Math.hypot(b.vx, b.vy) > STOP_SPEED_PX_PER_FRAME || b.sinking),
    );
    if (anyMoving || w.strikeAnim.active || w.rackCleared) return;

    const cueBall = w.balls[0];
    if (cueBall) {
      cueBall.pocketed = false;
      cueBall.sinking = false;
      cueBall.vx = 0;
      cueBall.vy = 0;
      const safeSpot = clampValidCueBallPlacement(w.metrics.baulkLineX, w.metrics.centerY);
      cueBall.x = safeSpot.x;
      cueBall.y = safeSpot.y;
      w.hoverPlaceX = safeSpot.x;
      w.hoverPlaceY = safeSpot.y;
    }
    w.isAiming = false;
    w.foulMessage = null;
    w.ballInHand = true;
    syncReactHudFromWorld();
  }, [clampValidCueBallPlacement, getWorld, syncReactHudFromWorld]);

  const handleToggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      setBilliardSoundEnabled(next);
      if (next) {
        unlockBilliardAudio();
        playCueStrike(0.45);
      }
      return next;
    });
  }, []);

  // Cập nhật tọa độ điểm chạm tâm bi cái (spinX, spinY ∈ [-1, 1]) trong phạm vi 0.75R
  const updateSpinFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const pad = spinPadRef.current;
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      const maxOffset = Math.max(1, rect.width * 0.5 * 0.75);

      let nx = (clientX - cx) / maxOffset;
      let ny = -(clientY - cy) / maxOffset; // Kéo lên (+) = Cù lê (Follow), kéo xuống (-) = Trô (Draw)
      const mag = Math.hypot(nx, ny);
      if (mag > 1) {
        nx /= mag;
        ny /= mag;
      }

      const roundedX = Math.round(nx * 100) / 100;
      const roundedY = Math.round(ny * 100) / 100;
      const w = getWorld();
      w.spinX = roundedX;
      w.spinY = roundedY;
      setSpin({ x: roundedX, y: roundedY });
    },
    [getWorld],
  );

  const handleResetSpin = useCallback(() => {
    const w = getWorld();
    w.spinX = 0;
    w.spinY = 0;
    setSpin({ x: 0, y: 0 });
  }, [getWorld]);

  // Hoàn tất khoảnh khắc đầu cơ chạm tâm bi cái (sau 75ms hoặc tức thì khi reduced-motion)
  const executeCueBallContact = useCallback(
    (strike: StrikeAnimationState) => {
      const w = getWorld();
      const cueBall = w.balls[0];
      if (!cueBall || cueBall.pocketed) return;

      for (const b of w.balls) {
        b.cushionBouncesThisTurn = 0;
      }

      cueBall.vx = strike.dirX * strike.launchSpeed;
      cueBall.vy = strike.dirY * strike.launchSpeed;
      w.activeCueSpinX = strike.spinX * (0.35 + strike.power * 0.65);
      w.activeCueSpinY = strike.spinY * (0.35 + strike.power * 0.65);
      w.activeShotDirX = strike.dirX;
      w.activeShotDirY = strike.dirY;
      w.cueHasHitBallThisTurn = false;
      w.firstHitBallIdThisTurn = null;
      w.requiredTargetIdAtShotStart = getLowestRemainingTargetId(w.balls);
      w.scratchedThisTurn = false;
      w.foulMessage = null;

      const tipContactX = cueBall.x - strike.dirX * w.metrics.ballRadius;
      const tipContactY = cueBall.y - strike.dirY * w.metrics.ballRadius;
      spawnChalkDustBurst(tipContactX, tipContactY, strike.dirX, strike.dirY);
      playCueStrike(strike.power);

      if (strike.power > 0.82) {
        w.shakeRemainingSec = TABLE_SHAKE_DURATION_SEC;
      }
    },
    [getWorld, spawnChalkDustBurst],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = tableWrapperRef.current;
    const section = sectionRef.current;
    if (!canvas || !wrapper || typeof window === 'undefined') return;

    const ctx = getLowLatency2DContext(canvas, { alpha: false });
    if (!ctx) return;

    const w = getWorld();

    const updateSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const nextW = Math.max(360, Math.floor(rect.width || 960));
      const nextH = Math.max(220, Math.floor(rect.height || Math.round(nextW * 0.5)));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const prevMetrics = w.metrics;
      const nextMetrics = computeTableMetrics(nextW, nextH);

      for (const ball of w.balls) {
        const relX = (ball.x - prevMetrics.feltLeft) / Math.max(1, prevMetrics.feltWidth);
        const relY = (ball.y - prevMetrics.feltTop) / Math.max(1, prevMetrics.feltHeight);
        ball.x =
          nextMetrics.feltLeft + Math.max(0.04, Math.min(0.96, relX)) * nextMetrics.feltWidth;
        ball.y =
          nextMetrics.feltTop + Math.max(0.06, Math.min(0.94, relY)) * nextMetrics.feltHeight;
      }

      w.metrics = nextMetrics;
      w.dpr = dpr;
      canvas.width = Math.round(nextW * dpr);
      canvas.height = Math.round(nextH * dpr);
      canvas.style.width = `${nextW}px`;
      canvas.style.height = `${nextH}px`;
    };

    updateSize();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift' && !w.isPrecisionAim) {
        w.isPrecisionAim = true;
        const rawDx = w.pointerX - w.aimStartX;
        const rawDy = w.pointerY - w.aimStartY;
        if (Math.hypot(rawDx, rawDy) > 1) {
          w.precisionBaseAngle = Math.atan2(-rawDy, -rawDx);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        w.isPrecisionAim = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const stepPhysics = (dtSeconds: number, dtScale: number) => {
      const { metrics } = w;
      const r = metrics.ballRadius;
      const twoR = r * 2;
      const subDtScale = dtScale / SUBSTEPS;
      const subFriction = Math.pow(0.986, subDtScale);
      const pocketCaptureDist = metrics.pocketRadius * 0.92;
      const pocketMouthAllowance = metrics.pocketRadius * 1.16;

      // 0. Cập nhật rung bàn vi mô (> 82% lực, biên độ 2.5px trong 130ms)
      if (w.shakeRemainingSec > 0) {
        w.shakeRemainingSec = Math.max(0, w.shakeRemainingSec - dtSeconds);
      }

      // 0.5. Cập nhật Animation Gậy Lao Chạm Bi (75ms Strike Follow-Through)
      if (w.strikeAnim.active) {
        w.strikeAnim.elapsedSec += dtSeconds;
        if (w.strikeAnim.elapsedSec >= w.strikeAnim.durationSec) {
          w.strikeAnim.active = false;
          executeCueBallContact(w.strikeAnim);
        }
      }

      // 1. Cập nhật hiệu ứng thu nhỏ hút vào tâm lỗ (180ms)
      for (const ball of w.balls) {
        if (!ball.sinking) continue;
        ball.sinkProgress += dtSeconds / POCKET_SINK_DURATION_SEC;
        ball.x += (ball.sinkTargetX - ball.x) * Math.min(1, dtSeconds * 18);
        ball.y += (ball.sinkTargetY - ball.y) * Math.min(1, dtSeconds * 18);

        if (ball.sinkProgress >= 1) {
          ball.sinking = false;
          ball.sinkProgress = 1;
          if (ball.id === 0) {
            ball.pocketed = false;
            ball.vx = 0;
            ball.vy = 0;
            const safePos = clampValidCueBallPlacement(metrics.baulkLineX, metrics.centerY);
            ball.x = safePos.x;
            ball.y = safePos.y;
            w.hoverPlaceX = safePos.x;
            w.hoverPlaceY = safePos.y;
            w.combo = 0;
            w.ballInHand = true;
            syncReactHudFromWorld();
          } else {
            ball.pocketed = true;
            syncReactHudFromWorld();
          }
        }
      }

      // 2. Chia frame thành 6 bước con (SUBSTEPS = 6) loại bỏ hoàn toàn lỗi xuyên bi
      if (!w.strikeAnim.active) {
        for (let step = 0; step < SUBSTEPS; step += 1) {
          for (const ball of w.balls) {
            if (ball.pocketed || ball.sinking) continue;

            const dx = ball.vx * subDtScale;
            const dy = ball.vy * subDtScale;
            ball.x += dx;
            ball.y += dy;
            advanceBallRolling3D(ball, dx, dy, r);

            ball.vx *= subFriction;
            ball.vy *= subFriction;

            const speed = Math.hypot(ball.vx, ball.vy);
            if (speed > 0 && speed < STOP_SPEED_PX_PER_FRAME) {
              ball.vx = 0;
              ball.vy = 0;
            }

            // Kiểm tra rơi vào 1 trong 6 lỗ bida (distToPocket < R_pocket * 0.92)
            let droppedPocket: PocketNode | null = null;
            for (const pocket of metrics.pockets) {
              const distP = Math.hypot(ball.x - pocket.x, ball.y - pocket.y);
              if (distP < pocketCaptureDist) {
                droppedPocket = pocket;
                break;
              }
            }

            if (droppedPocket) {
              ball.vx = 0;
              ball.vy = 0;
              ball.sinking = true;
              ball.sinkProgress = 0;
              ball.sinkTargetX = droppedPocket.x;
              ball.sinkTargetY = droppedPocket.y;
              spawnPocketRipple(droppedPocket.x, droppedPocket.y, metrics.pocketRadius * 1.9);

              if (ball.id === 0) {
                w.combo = 0;
                w.scratchedThisTurn = true;
                spawnFloatingText(
                  droppedPocket.x,
                  Math.max(metrics.feltTop + 28, droppedPocket.y - 18),
                  'RƠI BI CÁI',
                  '#E08A7B',
                );
                playCushionBounce(0.5);
              } else {
                w.pocketedThisTurn += 1;
                w.combo += 1;
                const baseBannerY = Math.max(metrics.feltTop + 30, droppedPocket.y - 16);

                // Nhận diện pha đánh đẹp: BANK SHOT! / DOUBLE POT! / COMBO ×N!
                if (ball.cushionBouncesThisTurn >= 1) {
                  spawnFloatingText(droppedPocket.x, baseBannerY - 16, 'BANK SHOT!', '#D9B468');
                  playTrickShotReward('bank');
                }
                if (w.pocketedThisTurn >= 2) {
                  spawnFloatingText(droppedPocket.x, baseBannerY, 'DOUBLE POT!', '#D9B468');
                  playTrickShotReward('double');
                } else if (w.combo >= 2) {
                  spawnFloatingText(droppedPocket.x, baseBannerY, `COMBO ×${w.combo}!`, '#D9B468');
                  playTrickShotReward('combo');
                } else if (ball.cushionBouncesThisTurn === 0) {
                  spawnFloatingText(droppedPocket.x, baseBannerY, '+1', '#D9B468');
                }

                playPocketDrop(w.combo);
              }
              continue;
            }

            // Va chạm với 12 Chốt bo góc miệng lỗ (Pocket Knuckles / Jaws: r = 3.5px, restitution = 0.78)
            for (const jaw of metrics.pocketJaws) {
              const jdx = ball.x - jaw.x;
              const jdy = ball.y - jaw.y;
              const jDist = Math.hypot(jdx, jdy);
              const minJawDist = r + jaw.r;
              if (jDist < minJawDist && jDist > 0.0001) {
                const jnx = jdx / jDist;
                const jny = jdy / jDist;
                const overlap = minJawDist - jDist;
                ball.x += jnx * overlap;
                ball.y += jny * overlap;

                const vn = ball.vx * jnx + ball.vy * jny;
                if (vn < 0) {
                  ball.vx -= (1 + JAW_RESTITUTION) * vn * jnx;
                  ball.vy -= (1 + JAW_RESTITUTION) * vn * jny;
                  ball.cushionBouncesThisTurn += 1;
                  playCushionBounce(Math.min(1, Math.abs(vn) / 14));
                }
              }
            }

            const nearAnyPocketMouth = metrics.pockets.some(
              (p) => Math.hypot(ball.x - p.x, ball.y - p.y) < pocketMouthAllowance,
            );
            if (nearAnyPocketMouth) continue;

            // Va chạm thành băng 4 cạnh (restitution = 0.86) + lệch góc Ép phê (±18° * spinX) cho bi cái
            let cushionImpact = 0;
            let hitRail = false;
            if (ball.x - r < metrics.feltLeft) {
              ball.x = metrics.feltLeft + r;
              cushionImpact = Math.max(cushionImpact, Math.abs(ball.vx));
              ball.vx = Math.abs(ball.vx) * CUSHION_RESTITUTION;
              hitRail = true;
            } else if (ball.x + r > metrics.feltRight) {
              ball.x = metrics.feltRight - r;
              cushionImpact = Math.max(cushionImpact, Math.abs(ball.vx));
              ball.vx = -Math.abs(ball.vx) * CUSHION_RESTITUTION;
              hitRail = true;
            }

            if (ball.y - r < metrics.feltTop) {
              ball.y = metrics.feltTop + r;
              cushionImpact = Math.max(cushionImpact, Math.abs(ball.vy));
              ball.vy = Math.abs(ball.vy) * CUSHION_RESTITUTION;
              hitRail = true;
            } else if (ball.y + r > metrics.feltBottom) {
              ball.y = metrics.feltBottom - r;
              cushionImpact = Math.max(cushionImpact, Math.abs(ball.vy));
              ball.vy = -Math.abs(ball.vy) * CUSHION_RESTITUTION;
              hitRail = true;
            }

            if (hitRail) {
              ball.cushionBouncesThisTurn += 1;
              if (ball.id === 0 && Math.abs(w.activeCueSpinX) > 0.02) {
                const spd = Math.hypot(ball.vx, ball.vy);
                if (spd > 0.2) {
                  const ang =
                    Math.atan2(ball.vy, ball.vx) + w.activeCueSpinX * ENGLISH_MAX_DEFLECT_RAD;
                  ball.vx = Math.cos(ang) * spd;
                  ball.vy = Math.sin(ang) * spd;
                  w.activeCueSpinX *= 0.52;
                }
              }
              if (cushionImpact > 0.45) {
                playCushionBounce(Math.min(1, cushionImpact / 14));
              }
            }
          }

          // Va chạm Bi – Bi: tách overlap/2 mỗi bi, bảo toàn động lượng 2D (restitution = 0.96) + xung lực Cù lê / Trô
          for (let i = 0; i < w.balls.length; i += 1) {
            const a = w.balls[i]!;
            if (a.pocketed || a.sinking) continue;

            for (let j = i + 1; j < w.balls.length; j += 1) {
              const b = w.balls[j]!;
              if (b.pocketed || b.sinking) continue;

              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy);

              if (dist < twoR && dist > 0.0001) {
                const nx = dx / dist;
                const ny = dy / dist;
                const overlap = (twoR - dist) * 0.5;

                a.x -= nx * overlap;
                a.y -= ny * overlap;
                b.x += nx * overlap;
                b.y += ny * overlap;

                const rvx = b.vx - a.vx;
                const rvy = b.vy - a.vy;
                const velAlongNormal = rvx * nx + rvy * ny;

                if (velAlongNormal < 0) {
                  const preSpeed =
                    a.id === 0 ? Math.hypot(a.vx, a.vy) : b.id === 0 ? Math.hypot(b.vx, b.vy) : 0;
                  const impulse = -(1 + BALL_RESTITUTION) * velAlongNormal * 0.5;
                  a.vx -= impulse * nx;
                  a.vy -= impulse * ny;
                  b.vx += impulse * nx;
                  b.vy += impulse * ny;

                  // Ghi nhận viên bi đầu tiên bi cái chạm phải trong lượt cơ & áp dụng xoáy Cù lê (Follow) / Trô (Draw)
                  if (a.id === 0 || b.id === 0) {
                    const cue = a.id === 0 ? a : b;
                    const target = a.id === 0 ? b : a;
                    const toTargetX = a.id === 0 ? nx : -nx;
                    const toTargetY = a.id === 0 ? ny : -ny;

                    if (w.firstHitBallIdThisTurn === null) {
                      w.firstHitBallIdThisTurn = target.id;
                    }

                    if (!w.cueHasHitBallThisTurn && Math.abs(w.activeCueSpinY) > 0.03) {
                      w.cueHasHitBallThisTurn = true;
                      const spinImpulse =
                        Math.max(1.8, preSpeed * 0.44) * Math.abs(w.activeCueSpinY);
                      if (w.activeCueSpinY > 0) {
                        // Cù lê (Follow): đẩy bi cái tiến tiếp theo hướng bắn ban đầu
                        cue.vx += w.activeShotDirX * spinImpulse;
                        cue.vy += w.activeShotDirY * spinImpulse;
                      } else {
                        // Trô (Draw): giật ngược bi cái lại sau khi chạm bi mục tiêu
                        cue.vx -= toTargetX * spinImpulse * 1.12;
                        cue.vy -= toTargetY * spinImpulse * 1.12;
                      }
                      w.activeCueSpinY *= 0.2;
                    } else {
                      w.cueHasHitBallThisTurn = true;
                    }
                  }

                  const impactNorm = Math.min(1, Math.abs(velAlongNormal) / 15);
                  if (impactNorm > 0.06) {
                    spawnCollisionSparks((a.x + b.x) * 0.5, (a.y + b.y) * 0.5, 5);
                    playBallClack(impactNorm);
                  }
                }
              }
            }
          }
        }
      }

      // 3. Cập nhật kết thúc lượt cơ, kiểm tra luật 3 chế độ chơi & kiểm tra dọn sạch cả 6 bi
      if (w.shotInProgress && !w.strikeAnim.active) {
        const stillMoving = w.balls.some(
          (b) => !b.pocketed && (b.sinking || Math.hypot(b.vx, b.vy) > STOP_SPEED_PX_PER_FRAME),
        );
        if (!stillMoving) {
          w.shotInProgress = false;

          let orderFoul = false;
          if (
            w.gameMode === 'sequential' &&
            w.requiredTargetIdAtShotStart !== null &&
            w.firstHitBallIdThisTurn !== w.requiredTargetIdAtShotStart
          ) {
            orderFoul = true;
            w.combo = 0;
            w.ballInHand = true;
            w.foulMessage = 'Chạm sai thứ tự — Đặt lại bi cái tự do';
            const cue = w.balls[0];
            if (cue) {
              spawnFloatingText(
                cue.x,
                Math.max(metrics.feltTop + 28, cue.y - 18),
                'CHẠM SAI THỨ TỰ!',
                '#E08A7B',
              );
            }
          }

          if (w.gameMode === 'two-player') {
            if (w.scratchedThisTurn || orderFoul) {
              // Rơi bi cái hoặc phạm lỗi -> đổi lượt và trao quyền đặt bi tự do (Ball-in-Hand) cho đối thủ
              w.currentPlayer = w.currentPlayer === 1 ? 2 : 1;
              w.ballInHand = true;
              w.combo = 0;
            } else if (w.pocketedThisTurn > 0) {
              // Ăn hợp lệ -> cộng điểm và giữ quyền đánh tiếp
              if (w.currentPlayer === 1) {
                w.p1Score += w.pocketedThisTurn;
              } else {
                w.p2Score += w.pocketedThisTurn;
              }
            } else {
              // Đánh hụt -> đổi lượt
              w.currentPlayer = w.currentPlayer === 1 ? 2 : 1;
              w.combo = 0;
            }
          } else if (w.pocketedThisTurn === 0 && !orderFoul) {
            w.combo = 0;
          }

          w.pocketedThisTurn = 0;

          const allTargetsCleared = w.balls.filter((b) => b.id >= 1).every((b) => b.pocketed);

          if (allTargetsCleared && !w.rackCleared) {
            w.rackCleared = true;
            w.ballInHand = false;
            w.foulMessage = null;
            playRackClear();
            setBestRecord((prevBest) => {
              if (w.shots > 0 && (prevBest === null || w.shots < prevBest)) {
                writeBestRecordToStorage(w.shots);
                return w.shots;
              }
              return prevBest;
            });
          }

          syncReactHudFromWorld();
        }
      }

      // 4. Cập nhật sóng vàng quanh lỗ, hạt phấn lơ/tia sáng & chữ nổi
      for (const ripple of w.ripples) {
        if (!ripple.active) continue;
        ripple.r += 54 * dtSeconds;
        ripple.alpha = Math.max(0, 0.92 * (1 - ripple.r / ripple.maxR));
        if (ripple.r >= ripple.maxR) {
          ripple.active = false;
        }
      }

      for (const spark of w.sparks) {
        if (!spark.active) continue;
        spark.ageSec += dtSeconds;
        spark.x += spark.vx * dtSeconds;
        spark.y += spark.vy * dtSeconds;
        spark.vx *= 0.94;
        spark.vy *= 0.94;
        if (spark.ageSec >= spark.maxAgeSec) {
          spark.active = false;
        }
      }

      for (const ft of w.floatTexts) {
        if (!ft.active) continue;
        ft.ageSec += dtSeconds;
        ft.y -= 24 * dtSeconds;
        if (ft.ageSec >= ft.durationSec) {
          ft.active = false;
        }
      }
    };

    const drawTableAndBalls = () => {
      const { metrics } = w;
      const {
        width,
        height,
        railWidth,
        feltLeft,
        feltTop,
        feltBottom,
        feltWidth,
        feltHeight,
        ballRadius,
        pocketRadius,
        baulkLineX,
        footSpotX,
        centerY,
        pockets,
        pocketJaws,
      } = metrics;

      ctx.setTransform(w.dpr, 0, 0, w.dpr, 0, 0);

      ctx.save();
      if (w.shakeRemainingSec > 0) {
        const shakeProgress = w.shakeRemainingSec / TABLE_SHAKE_DURATION_SEC;
        const amp = TABLE_SHAKE_AMP_PX * shakeProgress;
        const ox = Math.sin(w.shakeRemainingSec * 190) * amp;
        const oy = Math.cos(w.shakeRemainingSec * 155) * amp;
        ctx.translate(ox, oy);
      }

      // 1. Khung thành bàn (Rails): Gỗ Đá Phiến trầm #182924 + nẹp viền Đồng Cổ #9C7A4C (2px)
      ctx.fillStyle = '#182924';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#9C7A4C';
      ctx.lineWidth = 2;
      ctx.strokeRect(2, 2, width - 4, height - 4);

      // 2. Mặt nỉ bàn (Felt): Chuyển sắc hướng tâm #234B40 (tâm sáng dịu) -> #19372F (inner shadow)
      const feltCx = feltLeft + feltWidth * 0.5;
      const feltCy = feltTop + feltHeight * 0.5;
      const feltGrad = ctx.createRadialGradient(
        feltCx,
        feltCy,
        feltHeight * 0.08,
        feltCx,
        feltCy,
        Math.hypot(feltWidth, feltHeight) * 0.62,
      );
      feltGrad.addColorStop(0, '#234B40');
      feltGrad.addColorStop(0.68, '#1D3F35');
      feltGrad.addColorStop(1, '#19372F');

      ctx.fillStyle = feltGrad;
      ctx.fillRect(feltLeft, feltTop, feltWidth, feltHeight);

      ctx.strokeStyle = 'rgba(9, 20, 17, 0.45)';
      ctx.lineWidth = 4;
      ctx.strokeRect(feltLeft + 2, feltTop + 2, feltWidth - 4, feltHeight - 4);

      ctx.strokeStyle = 'rgba(156, 122, 76, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(feltLeft, feltTop, feltWidth, feltHeight);

      // 3. Khắc các chấm định vị kim cương (diamond sights) màu vàng đồng dọc 4 cạnh thành bàn
      const drawDiamondSight = (dx: number, dy: number) => {
        const s = 3.2;
        ctx.beginPath();
        ctx.moveTo(dx, dy - s);
        ctx.lineTo(dx + s, dy);
        ctx.lineTo(dx, dy + s);
        ctx.lineTo(dx - s, dy);
        ctx.closePath();
        ctx.fillStyle = '#C29548';
        ctx.fill();
      };

      const topRailY = railWidth * 0.5;
      const botRailY = height - railWidth * 0.5;
      const leftRailX = railWidth * 0.5;
      const rightRailX = width - railWidth * 0.5;

      for (let i = 1; i <= 7; i += 1) {
        if (i === 4) continue;
        const sx = feltLeft + (feltWidth * i) / 8;
        drawDiamondSight(sx, topRailY);
        drawDiamondSight(sx, botRailY);
      }
      for (let j = 1; j <= 3; j += 1) {
        const sy = feltTop + (feltHeight * j) / 4;
        drawDiamondSight(leftRailX, sy);
        drawDiamondSight(rightRailX, sy);
      }

      // 4. Vạch khai cuộc (baulk line), cung chữ D và chấm đặt bi siêu mảnh rgba(250, 251, 249, 0.16)
      ctx.save();
      ctx.strokeStyle = 'rgba(250, 251, 249, 0.16)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(baulkLineX, feltTop + 6);
      ctx.lineTo(baulkLineX, feltBottom - 6);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(baulkLineX, centerY, feltHeight * 0.22, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();

      for (const spotX of [baulkLineX, footSpotX]) {
        ctx.beginPath();
        ctx.arc(spotX, centerY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(250, 251, 249, 0.28)';
        ctx.fill();
      }
      ctx.restore();

      // 5. Vẽ 6 Lỗ Bida (4 góc + 2 giữa) & 12 Chốt bo góc miệng lỗ (Pocket Knuckles / Jaws)
      for (const pocket of pockets) {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocketRadius + 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#9C7A4C';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocketRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0D1815';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocketRadius * 0.78, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(156, 122, 76, 0.28)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      for (const jaw of pocketJaws) {
        ctx.beginPath();
        ctx.arc(jaw.x, jaw.y, jaw.r, 0, Math.PI * 2);
        ctx.fillStyle = '#9C7A4C';
        ctx.fill();
        ctx.strokeStyle = '#182924';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      for (const ripple of w.ripples) {
        if (!ripple.active) continue;
        ctx.save();
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(213, 180, 122, ${ripple.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.restore();
      }

      // 6. Chế độ Đặt lại Bi Cái (Ball-in-Hand)
      const cueBall = w.balls[0];
      if (w.ballInHand && !w.rackCleared) {
        const preview = clampValidCueBallPlacement(w.hoverPlaceX, w.hoverPlaceY);
        ctx.save();
        ctx.beginPath();
        ctx.arc(preview.x, preview.y, ballRadius + 5, 0, Math.PI * 2);
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#EED08E';
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 6.5. Chế độ Thứ tự (1->6): Vòng sáng mảnh bao quanh bi có số nhỏ nhất còn lại trên bàn
      if (w.gameMode === 'sequential' && !w.rackCleared) {
        const lowestId = getLowestRemainingTargetId(w.balls);
        const targetBall = w.balls.find((b) => b.id === lowestId && !b.pocketed && !b.sinking);
        if (targetBall) {
          ctx.save();
          ctx.beginPath();
          ctx.arc(targetBall.x, targetBall.y, ballRadius + 5.5, 0, Math.PI * 2);
          ctx.strokeStyle = '#EED08E';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }
      }

      // Hàm vẽ Gậy Cơ (Cue Stick) dùng chung cho lúc Kéo ngắm và lúc Animation 75ms lao chạm bi
      const drawCueStickAt = (
        originX: number,
        originY: number,
        shotDirX: number,
        shotDirY: number,
        tipOffsetPx: number,
      ) => {
        const cueAngle = Math.atan2(-shotDirY, -shotDirX);
        const cueLength = Math.min(210, feltWidth * 0.28);

        ctx.save();
        ctx.translate(originX, originY);
        ctx.rotate(cueAngle);

        ctx.beginPath();
        ctx.moveTo(tipOffsetPx + 2, 4);
        ctx.lineTo(tipOffsetPx + cueLength + 2, 5);
        ctx.strokeStyle = 'rgba(8, 16, 14, 0.38)';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.stroke();

        const cueGrad = ctx.createLinearGradient(tipOffsetPx, 0, tipOffsetPx + cueLength, 0);
        cueGrad.addColorStop(0, '#E8ECEA');
        cueGrad.addColorStop(0.04, '#FAFBF9');
        cueGrad.addColorStop(0.05, '#9C7A4C');
        cueGrad.addColorStop(0.55, '#C9A878');
        cueGrad.addColorStop(0.58, '#9C7A4C');
        cueGrad.addColorStop(1, '#1E332E');

        ctx.beginPath();
        ctx.moveTo(tipOffsetPx, -2.1);
        ctx.lineTo(tipOffsetPx + cueLength, -4.4);
        ctx.lineTo(tipOffsetPx + cueLength, 4.4);
        ctx.lineTo(tipOffsetPx, 2.1);
        ctx.closePath();
        ctx.fillStyle = cueGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(156, 122, 76, 0.55)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.restore();
      };

      // 7. Vẽ Tia Ngắm Ghost Ball Raycast, 2 Tia Phản Xạ, Vòng Lực & Gậy Cơ
      if (w.isAiming && cueBall && !cueBall.pocketed && !w.shotInProgress && !w.rackCleared) {
        const pullDx = w.pointerX - w.aimStartX;
        const pullDy = w.pointerY - w.aimStartY;
        const pullDist = Math.hypot(pullDx, pullDy);
        const isCancelled = pullDist < CANCEL_PULL_DISTANCE_PX;

        const power = isCancelled
          ? 0
          : Math.min(
              1,
              (pullDist - CANCEL_PULL_DISTANCE_PX) /
                (MAX_PULL_DISTANCE_PX - CANCEL_PULL_DISTANCE_PX),
            );
        const powerColor = power < 0.45 ? '#3B7A65' : power < 0.78 ? '#C29548' : '#9E6356';

        ctx.save();
        ctx.beginPath();
        ctx.arc(
          cueBall.x,
          cueBall.y,
          ballRadius + 7,
          -Math.PI * 0.5,
          -Math.PI * 0.5 + Math.PI * 2 * Math.max(0.06, power),
        );
        ctx.strokeStyle = isCancelled ? 'rgba(250, 251, 249, 0.35)' : powerColor;
        ctx.lineWidth = 2.6;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Nhãn nhỏ VI CHỈNH cạnh vòng lực khi người chơi giữ phím Shift
        if (w.isPrecisionAim) {
          ctx.font = '700 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#EED08E';
          ctx.fillText('VI CHỈNH', cueBall.x + ballRadius + 12, cueBall.y - ballRadius - 4);
        }

        if (!isCancelled && pullDist > 0.001) {
          const rawAngle = Math.atan2(-pullDy, -pullDx);
          const effectiveAngle = w.isPrecisionAim
            ? w.precisionBaseAngle +
              normalizeAngleDiff(rawAngle - w.precisionBaseAngle) * PRECISION_AIM_FACTOR
            : rawAngle;
          const dirX = Math.cos(effectiveAngle);
          const dirY = Math.sin(effectiveAngle);

          const raycast = computeGhostBallRaycast(
            cueBall,
            dirX,
            dirY,
            w.spinX,
            w.spinY,
            w.balls,
            metrics,
          );

          // Đường ngắm nét đứt mảnh từ tâm bi cái tới tâm Bi Ảo (Ghost Ball)
          ctx.beginPath();
          ctx.setLineDash([5, 5]);
          ctx.moveTo(cueBall.x, cueBall.y);
          ctx.lineTo(raycast.ghostX, raycast.ghostY);
          ctx.strokeStyle = 'rgba(250, 251, 249, 0.62)';
          ctx.lineWidth = 1.25;
          ctx.stroke();

          // Vòng tròn Bi Ảo (Ghost Ball) tại điểm chạm
          ctx.beginPath();
          ctx.arc(raycast.ghostX, raycast.ghostY, ballRadius, 0, Math.PI * 2);
          ctx.strokeStyle = '#EED08E';
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.setLineDash([]);

          // TIA PHẢN XẠ 1: Đoạn tia ngắn mảnh (length = 56px, nét đứt màu Trắng Sứ rgba(250,251,249,0.55))
          // biểu thị phương trượt tiếp tuyến của chính bi cái sau va chạm (đã tính Cù lê / Trô / Ép phê)
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(raycast.ghostX, raycast.ghostY);
          ctx.lineTo(
            raycast.ghostX + raycast.cueDeflectX * GHOST_CUE_VECTOR_LEN_PX,
            raycast.ghostY + raycast.cueDeflectY * GHOST_CUE_VECTOR_LEN_PX,
          );
          ctx.strokeStyle = 'rgba(250, 251, 249, 0.55)';
          ctx.lineWidth = 1.35;
          ctx.lineCap = 'round';
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();

          // TIA PHẢN XẠ 2: Nếu trúng bi mục tiêu, vẽ đoạn tia dự đoán hướng bay của bi mục tiêu
          if (raycast.hitBall) {
            const guideLen = ballRadius * 4.2;
            const startX = raycast.hitBall.x;
            const startY = raycast.hitBall.y;
            const endX = startX + raycast.targetDirX * guideLen;
            const endY = startY + raycast.targetDirY * guideLen;

            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.strokeStyle = '#EED08E';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(endX, endY, 2.6, 0, Math.PI * 2);
            ctx.fillStyle = '#EED08E';
            ctx.fill();
          }

          const tipOffset = ballRadius + 8 + power * 46;
          drawCueStickAt(cueBall.x, cueBall.y, dirX, dirY, tipOffset);
        }
        ctx.restore();
      } else if (w.strikeAnim.active && cueBall && !cueBall.pocketed) {
        // Animation 75ms gậy cơ lao mạnh về trước chạm đúng vào tâm bi cái
        const progress = Math.min(1, w.strikeAnim.elapsedSec / w.strikeAnim.durationSec);
        const eased = 1 - Math.pow(1 - progress, 3);
        const tipOffset = w.strikeAnim.pullBackOffsetPx * (1 - eased) + ballRadius * eased;
        drawCueStickAt(cueBall.x, cueBall.y, w.strikeAnim.dirX, w.strikeAnim.dirY, tipOffset);
      }

      // 8. Vẽ 7 Viên Bi 3D Khoáng Thạch với hiệu ứng Lăn Bi Giả 3D (Pseudo-3D Ball Rolling)
      for (const ball of w.balls) {
        if (ball.pocketed) continue;

        const scale = ball.sinking ? Math.max(0.2, 1 - ball.sinkProgress * 0.78) : 1;
        const r = ballRadius * scale;

        ctx.save();
        if (ball.sinking) {
          ctx.globalAlpha = Math.max(0.15, 1 - ball.sinkProgress * 0.85);
        }

        // Bóng đổ mềm lệch dưới
        ctx.beginPath();
        ctx.arc(ball.x + 2.2 * scale, ball.y + 3.0 * scale, r * 1.02, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(7, 16, 13, 0.34)';
        ctx.fill();

        // Khối cầu 3D radialGradient
        const grad = ctx.createRadialGradient(
          ball.x - r * 0.34,
          ball.y - r * 0.34,
          r * 0.1,
          ball.x,
          ball.y,
          r,
        );
        grad.addColorStop(0, ball.lightHex);
        grad.addColorStop(0.56, ball.colorHex);
        grad.addColorStop(1, ball.shadowHex);

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        if (ball.id === 0) {
          // Vệt chấm nhỏ trên bi cái phản ánh độ lăn 3D & vị trí tâm chạm xoáy
          const dotX = ball.x + (ball.spotNx * 0.48 + w.spinX * 0.25) * r;
          const dotY = ball.y + (ball.spotNy * 0.48 - w.spinY * 0.25) * r;
          if (ball.spotNz > 0.05) {
            ctx.beginPath();
            ctx.arc(dotX, dotY, Math.max(1.4, r * 0.13 * ball.spotNz), 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(158, 99, 86, 0.65)';
            ctx.fill();
          }
        } else {
          // Lõi số màu trắng dịch chuyển & co phối cảnh theo (spotNx, spotNy, spotNz) khi bi lăn 3D
          if (ball.spotNz > 0.06) {
            const spotX = ball.x + ball.spotNx * r * 0.5;
            const spotY = ball.y + ball.spotNy * r * 0.5;
            const foreshorten = Math.max(0.28, ball.spotNz);
            const rotAngle = Math.atan2(ball.spotNy, ball.spotNx);
            const coreR = r * 0.48;

            ctx.save();
            ctx.translate(spotX, spotY);
            ctx.rotate(rotAngle);
            ctx.scale(foreshorten, 1);

            ctx.beginPath();
            ctx.arc(0, 0, coreR, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(250, 251, 249, ${(0.94 * Math.min(1, ball.spotNz * 1.35)).toFixed(3)})`;
            ctx.fill();

            ctx.font = `700 ${Math.max(8, Math.round(r * 0.64))}px "JetBrains Mono", monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#142622';
            ctx.fillText(String(ball.id), 0, 0.5);
            ctx.restore();
          }
        }

        // Điểm lóe sáng cầu 3D (specular highlight)
        ctx.beginPath();
        ctx.arc(ball.x - r * 0.36, ball.y - r * 0.36, r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.fill();

        ctx.restore();
      }

      // 9. Vẽ các hạt tia sáng va chạm & hạt bụi phấn lơ #DCEAE6
      for (const spark of w.sparks) {
        if (!spark.active) continue;
        const lifeRatio = Math.max(0, 1 - spark.ageSec / spark.maxAgeSec);
        ctx.save();
        ctx.globalAlpha = lifeRatio;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.radius * (0.4 + 0.6 * lifeRatio), 0, Math.PI * 2);
        ctx.fillStyle = spark.colorRgba;
        ctx.fill();
        ctx.restore();
      }

      // 10. Vẽ chữ nổi BANK SHOT! / DOUBLE POT! / COMBO ×N! màu Vàng Đồng #D9B468
      for (const ft of w.floatTexts) {
        if (!ft.active) continue;
        const alpha = Math.max(0, 1 - ft.ageSec / ft.durationSec);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = ft.colorHex;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      ctx.restore();
    };

    if (prefersReducedMotion) {
      drawTableAndBalls();
      window.addEventListener('resize', updateSize, { passive: true });
      return () => {
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };
    }

    let rafId = 0;
    let isIntersecting = true;
    let isDisposed = false;
    let prevNow = performance.now();

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
      const { dtSeconds, dtScale } = computeFrameDelta(now, prevNow);
      prevNow = now;

      stepPhysics(dtSeconds, dtScale);
      drawTableAndBalls();

      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (isDisposed || !isIntersecting || rafId !== 0) return;
      prevNow = performance.now();
      rafId = window.requestAnimationFrame(tick);
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined' && section) {
      observer = new IntersectionObserver(
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
        { threshold: 0.04 },
      );
      observer.observe(section);
    }

    window.addEventListener('resize', updateSize, { passive: true });
    drawTableAndBalls();
    startLoop();

    return () => {
      isDisposed = true;
      stopLoop();
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    clampValidCueBallPlacement,
    executeCueBallContact,
    getWorld,
    prefersReducedMotion,
    spawnCollisionSparks,
    spawnFloatingText,
    spawnPocketRipple,
    syncReactHudFromWorld,
  ]);

  const getCanvasPoint = (
    event: React.PointerEvent<HTMLCanvasElement>,
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    const w = getWorld();
    if (!canvas) return { x: w.metrics.baulkLineX, y: w.metrics.centerY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? w.metrics.width / rect.width : 1;
    const scaleY = rect.height > 0 ? w.metrics.height / rect.height : 1;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    unlockBilliardAudio();
    const w = getWorld();
    if (w.rackCleared || w.strikeAnim.active) return;

    const anyMoving = w.balls.some(
      (b) => !b.pocketed && (b.sinking || Math.hypot(b.vx, b.vy) > STOP_SPEED_PX_PER_FRAME),
    );
    if (anyMoving) return;

    const pt = getCanvasPoint(event);
    const cueBall = w.balls[0];
    if (!cueBall) return;

    if (w.ballInHand) {
      const placed = clampValidCueBallPlacement(pt.x, pt.y);
      cueBall.x = placed.x;
      cueBall.y = placed.y;
      cueBall.vx = 0;
      cueBall.vy = 0;
      cueBall.pocketed = false;
      cueBall.sinking = false;
      w.ballInHand = false;
      w.foulMessage = null;
      spawnPocketRipple(placed.x, placed.y, w.metrics.ballRadius * 2.2);
      syncReactHudFromWorld();
      return;
    }

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Bỏ qua trong JSDOM
    }

    // Free-Drag Aiming: cho phép nhấn giữ và kéo từ bất kỳ đâu trên mặt bàn
    w.isAiming = true;
    w.aimStartX = pt.x;
    w.aimStartY = pt.y;
    w.pointerX = pt.x;
    w.pointerY = pt.y;
    w.isPrecisionAim = Boolean(event.shiftKey);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const w = getWorld();
    const pt = getCanvasPoint(event);

    if (w.ballInHand) {
      const placed = clampValidCueBallPlacement(pt.x, pt.y);
      w.hoverPlaceX = placed.x;
      w.hoverPlaceY = placed.y;
      const cueBall = w.balls[0];
      if (cueBall) {
        cueBall.x = placed.x;
        cueBall.y = placed.y;
      }
      return;
    }

    if (!w.isAiming) return;

    const nextShift = Boolean(event.shiftKey);
    if (nextShift && !w.isPrecisionAim) {
      const rawDx = pt.x - w.aimStartX;
      const rawDy = pt.y - w.aimStartY;
      if (Math.hypot(rawDx, rawDy) > 1) {
        w.precisionBaseAngle = Math.atan2(-rawDy, -rawDx);
      }
    }
    w.isPrecisionAim = nextShift;
    w.pointerX = pt.x;
    w.pointerY = pt.y;
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const w = getWorld();
    if (!w.isAiming) return;

    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Bỏ qua trong JSDOM
    }

    const pt = getCanvasPoint(event);
    w.pointerX = pt.x;
    w.pointerY = pt.y;
    w.isAiming = false;

    const cueBall = w.balls[0];
    if (!cueBall || cueBall.pocketed) return;

    const pullDx = w.pointerX - w.aimStartX;
    const pullDy = w.pointerY - w.aimStartY;
    const pullDist = Math.hypot(pullDx, pullDy);

    // Kéo ngược lại sát điểm bắt đầu (< 12px) để hủy cú đánh
    if (pullDist < CANCEL_PULL_DISTANCE_PX) {
      return;
    }

    const power = Math.min(
      1,
      (pullDist - CANCEL_PULL_DISTANCE_PX) / (MAX_PULL_DISTANCE_PX - CANCEL_PULL_DISTANCE_PX),
    );
    const launchSpeed = (0.14 + power * 0.86) * MAX_SHOT_SPEED_PX_PER_FRAME;
    const rawAngle = Math.atan2(-pullDy, -pullDx);
    const effectiveAngle = w.isPrecisionAim
      ? w.precisionBaseAngle +
        normalizeAngleDiff(rawAngle - w.precisionBaseAngle) * PRECISION_AIM_FACTOR
      : rawAngle;
    const dirX = Math.cos(effectiveAngle);
    const dirY = Math.sin(effectiveAngle);

    w.shotInProgress = true;
    w.pocketedThisTurn = 0;
    w.shots += 1;

    const strikeSpec: StrikeAnimationState = {
      active: true,
      elapsedSec: 0,
      durationSec: STRIKE_ANIM_DURATION_SEC,
      dirX,
      dirY,
      power,
      launchSpeed,
      pullBackOffsetPx: w.metrics.ballRadius + 8 + power * 46,
      spinX: w.spinX,
      spinY: w.spinY,
    };

    if (prefersReducedMotion) {
      strikeSpec.active = false;
      w.strikeAnim = strikeSpec;
      executeCueBallContact(strikeSpec);
    } else {
      w.strikeAnim = strikeSpec;
    }

    syncReactHudFromWorld();
  };

  const handlePointerCancel = () => {
    const w = getWorld();
    w.isAiming = false;
  };

  const spinLabel =
    Math.abs(spin.x) < 0.08 && Math.abs(spin.y) < 0.08
      ? 'Tâm bi'
      : `${spin.y > 0.12 ? 'Cù lê' : spin.y < -0.12 ? 'Trô' : ''}${
          Math.abs(spin.y) > 0.12 && Math.abs(spin.x) > 0.12 ? ' · ' : ''
        }${spin.x > 0.12 ? 'Ép P' : spin.x < -0.12 ? 'Ép T' : ''}`;

  return (
    <section
      ref={sectionRef}
      id="ban-bida-khoang-thach"
      data-testid="mineral-billiards-stage"
      aria-label="Trò chơi Bida Khoáng Thạch 6 Bi 120fps"
      className={cn(
        'relative scroll-mt-20 border-t border-[#D4DFDA] bg-[#F2F4F3] text-[#142622] dark:border-[#1E3B2D] dark:bg-[#0E1A15] dark:text-[#E6ECE7]',
        className,
      )}
    >
      {/* Dấu cộng chuẩn trực (+) trên đường ngăn kỹ thuật 1px solid #D4DFDA */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1400px] justify-between px-6 lg:px-10"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="-mt-[6px] opacity-65"
        >
          <path d="M6 0V12M0 6H12" stroke="#9C7A4C" strokeWidth="1.25" />
          <circle cx="6" cy="6" r="1.15" fill="#9C7A4C" />
        </svg>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 pt-14 pb-20 lg:px-10">
        <div
          data-testid="billiards-stage-card"
          data-game-mode={gameMode}
          className="relative overflow-hidden rounded-2xl border border-[#CFD9D5] bg-[#FAFBF9] shadow-[0_18px_48px_rgba(24,38,36,0.06)] dark:border-[#243B32] dark:bg-[#12241C]"
        >
          {/* 4 góc thước ngắm bản vẽ chữ L mảnh */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 left-2 z-20 h-3 w-3 border-t-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-2 right-2 z-20 h-3 w-3 border-t-[1.5px] border-r-[1.5px] border-[#9C7A4C]/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 left-2 z-20 h-3 w-3 border-b-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-2 bottom-2 z-20 h-3 w-3 border-r-[1.5px] border-b-[1.5px] border-[#9C7A4C]/70"
          />

          {/* A. Thanh Header Sân Khấu: Hướng dẫn · Khay Rãnh Đựng Bi Đã Ăn · Segmented 3 Chế độ · Chỉ số */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8E5] bg-[#F7F9F8] px-5 py-3.5 sm:px-6 dark:border-[#243B32] dark:bg-[#0E1A15]">
            <div className="flex flex-wrap items-center gap-3">
              <p
                data-testid="billiards-play-hint"
                className="font-mono text-xs font-medium text-[#2D423D] dark:text-[#C9D6D0]"
              >
                Kéo ngược từ bi cái để ngắm &amp; chỉnh lực · Thả để đánh · Kéo về tâm để hủy
              </p>

              {/* Khay Rãnh Đựng Bi Đã Ăn (Pocketed Ball Rack) */}
              <div
                data-testid="billiards-pocketed-rack"
                aria-label="Khay rãnh đựng bi khoáng thạch đã ăn"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#D4DFDA] bg-[#142622]/8 px-2.5 py-1 dark:border-[#244335] dark:bg-[#0D1815]"
              >
                <span className="pr-0.5 font-mono text-[10px] font-semibold text-[#4A5D58] dark:text-[#98ABA3]">
                  Rãnh:
                </span>
                {MINERAL_TARGET_BALL_SPECS.map((spec) => {
                  const isPocketed = pocketedBallIds.includes(spec.number);
                  return (
                    <span
                      key={spec.number}
                      data-testid={`billiard-status-dot-${spec.number}`}
                      data-pocketed={isPocketed ? 'true' : 'false'}
                      title={`Bi số ${spec.number} (${spec.name}): ${isPocketed ? 'Đã vào rãnh' : 'Còn trên bàn'}`}
                      style={
                        isPocketed
                          ? {
                              background: `radial-gradient(circle at 32% 32%, ${spec.lightHex}, ${spec.colorHex} 60%, ${spec.shadowHex})`,
                              borderColor: spec.colorHex,
                            }
                          : {
                              backgroundColor: 'transparent',
                              borderColor: spec.colorHex,
                            }
                      }
                      className={cn(
                        'inline-flex h-4 w-4 items-center justify-center rounded-full border font-mono text-[8.5px] font-bold transition-all duration-200',
                        isPocketed
                          ? 'scale-100 text-[#FAFBF9] shadow-2xs'
                          : 'scale-90 border-dashed opacity-40',
                      )}
                    >
                      {spec.number}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              {/* Bộ chuyển đổi 3 chế độ chơi (Segmented Control: Tự do · Thứ tự 1->6 · 2 Người) */}
              <div
                role="group"
                data-testid="billiards-mode-selector"
                aria-label="Chọn chế độ chơi bida"
                className="inline-flex items-center rounded-full border border-[#CFD9D5] bg-[#FAFBF9] p-0.5 font-mono text-[11px] font-semibold dark:border-[#244335] dark:bg-[#12241C]"
              >
                <button
                  type="button"
                  data-testid="billiards-mode-free"
                  aria-pressed={gameMode === 'free'}
                  onClick={() => handleSelectGameMode('free')}
                  className={cn(
                    'cursor-pointer rounded-full px-2.5 py-0.5 transition-colors',
                    gameMode === 'free'
                      ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746]'
                      : 'text-[#354E48] hover:text-[#142622] dark:text-[#98ABA3]',
                  )}
                >
                  Tự do
                </button>
                <button
                  type="button"
                  data-testid="billiards-mode-sequential"
                  aria-pressed={gameMode === 'sequential'}
                  onClick={() => handleSelectGameMode('sequential')}
                  className={cn(
                    'cursor-pointer rounded-full px-2.5 py-0.5 transition-colors',
                    gameMode === 'sequential'
                      ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746]'
                      : 'text-[#354E48] hover:text-[#142622] dark:text-[#98ABA3]',
                  )}
                >
                  Thứ tự 1→6
                </button>
                <button
                  type="button"
                  data-testid="billiards-mode-two-player"
                  aria-pressed={gameMode === 'two-player'}
                  onClick={() => handleSelectGameMode('two-player')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 transition-colors',
                    gameMode === 'two-player'
                      ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746]'
                      : 'text-[#354E48] hover:text-[#142622] dark:text-[#98ABA3]',
                  )}
                >
                  <Users className="h-3 w-3" aria-hidden="true" />
                  <span>2 Người</span>
                </button>
              </div>

              {/* Huy hiệu lượt đánh & tỷ số khi ở chế độ 2 Người */}
              {gameMode === 'two-player' && (
                <div
                  data-testid="billiards-two-player-hud"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE4E0] bg-[#FAFBF9] px-2.5 py-0.5 text-[11px] font-semibold dark:border-[#244335] dark:bg-[#12241C]"
                >
                  <span
                    data-testid="billiards-turn-badge"
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10.5px] font-bold text-[#FAFBF9]',
                      currentPlayer === 1 ? 'bg-[#3B7A65]' : 'bg-[#9C7A4C]',
                    )}
                  >
                    Lượt P{currentPlayer}
                  </span>
                  <span
                    data-testid="billiards-p1-score"
                    className="text-[#3B7A65] dark:text-[#6EB59B]"
                  >
                    P1:{p1Score}
                  </span>
                  <span className="opacity-40">·</span>
                  <span
                    data-testid="billiards-p2-score"
                    className="text-[#8C6228] dark:text-[#D5B47A]"
                  >
                    P2:{p2Score}
                  </span>
                </div>
              )}

              <span
                data-testid="billiards-shot-count"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE4E0] bg-[#FAFBF9] px-3 py-1 font-semibold text-[#2D423D] tabular-nums dark:border-[#244335] dark:bg-[#12241C] dark:text-[#C9D6D0]"
              >
                <span>Số cơ:</span>
                <strong className="text-[#142622] dark:text-[#E6ECE7]">{shots}</strong>
              </span>

              <span
                data-testid="billiards-combo-count"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE4E0] bg-[#FAFBF9] px-3 py-1 font-semibold text-[#8C6228] tabular-nums dark:border-[#244335] dark:bg-[#12241C] dark:text-[#D5B47A]"
              >
                <span>Combo:</span>
                <strong>x{combo}</strong>
              </span>

              <span
                data-testid="billiards-best-record"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE4E0] bg-[#FAFBF9] px-3 py-1 font-semibold text-[#3B7A65] tabular-nums dark:border-[#244335] dark:bg-[#12241C] dark:text-[#6EB59B]"
              >
                <Trophy className="h-3 w-3" aria-hidden="true" />
                <span>Kỷ lục:</span>
                <strong>{bestRecord !== null ? `${bestRecord} cơ` : '—'}</strong>
              </span>

              <button
                type="button"
                data-testid="billiards-sound-toggle"
                aria-pressed={isSoundEnabled}
                onClick={handleToggleSound}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1 font-mono text-[11px] font-semibold transition-colors',
                  isSoundEnabled
                    ? 'border-[#9C7A4C] bg-[#9C7A4C] text-[#FAFBF9] shadow-2xs dark:border-[#D5B47A] dark:bg-[#D5B47A] dark:text-[#142622]'
                    : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#2D423D] hover:border-[#9C7A4C] hover:text-[#142622] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#C9D6D0] dark:hover:border-[#D5B47A]',
                )}
              >
                {isSoundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>Âm thanh</span>
              </button>
            </div>
          </div>

          {/* B. Bàn Bida Kiến Trúc Khoáng Thạch (Canvas Retina 120FPS, tỷ lệ 2:1 đáp ứng responsive) */}
          <div className="bg-[#EEF2F0] p-3 sm:p-5 dark:bg-[#0D1A14]">
            <div
              ref={tableWrapperRef}
              className="relative mx-auto aspect-[2/1] max-h-[520px] min-h-[260px] w-full overflow-hidden rounded-xl shadow-[0_14px_36px_rgba(15,28,24,0.22)]"
            >
              <canvas
                ref={canvasRef}
                data-testid="mineral-billiards-canvas"
                data-substeps={SUBSTEPS}
                data-target-balls={MINERAL_TARGET_BALL_SPECS.length}
                data-pocket-jaws="12"
                aria-label="Bàn Bida Khoáng Thạch 6 Bi tương tác 120fps"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                className="block h-full w-full cursor-crosshair touch-none select-none"
              />

              {/* Thông báo ngắn trên bàn khi Bi cái rơi lỗ hoặc Chạm sai thứ tự (Ball-in-Hand) */}
              {ballInHand && !rackCleared && (
                <div
                  data-testid="billiards-ball-in-hand-banner"
                  className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#D5B47A]/80 bg-[#142622]/90 px-4 py-1.5 font-mono text-xs font-semibold text-[#FAFBF9] shadow-lg backdrop-blur-xs"
                >
                  {foulBanner ?? 'Bi cái rơi lỗ — Bấm chọn vị trí đặt lại'}
                </div>
              )}

              {/* Bảng chúc mừng gọn trong khung bàn khi dọn sạch cả 6 bi */}
              {rackCleared && (
                <div
                  data-testid="billiards-rack-clear-modal"
                  className="absolute inset-0 z-30 flex items-center justify-center bg-[#142622]/75 p-4 backdrop-blur-xs"
                >
                  <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl border border-[#9C7A4C] bg-[#FAFBF9] px-7 py-6 text-center shadow-2xl dark:bg-[#12241C]">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#9C7A4C]/15 text-[#8C6228] dark:text-[#D5B47A]">
                      <Trophy className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-[#142622] dark:text-[#E6ECE7]">
                      {gameMode === 'two-player'
                        ? p1Score > p2Score
                          ? `P1 Chiến thắng (${p1Score} - ${p2Score})`
                          : p2Score > p1Score
                            ? `P2 Chiến thắng (${p2Score} - ${p1Score})`
                            : `Hòa kịch tính (${p1Score} - ${p2Score})`
                        : `Dọn bàn hoàn hảo · ${shots} cơ`}
                    </h3>
                    <p className="font-mono text-xs text-[#354E48] dark:text-[#B9C8C1]">
                      Kỷ lục cá nhân: {bestRecord !== null ? `${bestRecord} cơ` : `${shots} cơ`}
                    </p>
                    <button
                      type="button"
                      onClick={handleNewRack}
                      className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E332E] px-5 py-2.5 font-mono text-xs font-semibold text-[#FAFBF9] shadow-md transition-transform hover:-translate-y-0.5 hover:bg-[#28443D] active:scale-[0.98] dark:bg-[#245746]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Xếp ván mới</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* E. Thanh Điều Khiển Đáy Khung + Bộ Chọn Điểm Chạm Tâm Bi Cái (38x38px Spin Selector) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8E5] bg-[#F7F9F8] px-5 py-3.5 sm:px-6 dark:border-[#243B32] dark:bg-[#0E1A15]">
            <div
              role="group"
              aria-label="Điều khiển bàn bida và xoáy bi cái"
              className="flex flex-wrap items-center gap-3"
            >
              {/* Bộ Chọn Điểm Chạm Tâm Bi Cái (Cue Tip Spin Selector 38x38px) */}
              <div className="inline-flex items-center gap-2 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] py-1 pr-3 pl-1.5 shadow-2xs dark:border-[#244335] dark:bg-[#12241C]">
                <div
                  ref={spinPadRef}
                  role="slider"
                  tabIndex={0}
                  data-testid="billiards-spin-selector"
                  data-spin-x={spin.x.toFixed(2)}
                  data-spin-y={spin.y.toFixed(2)}
                  aria-label="Bộ chọn điểm chạm xoáy tâm bi cái (Nhấp đúp để về tâm)"
                  aria-valuemin={-1}
                  aria-valuemax={1}
                  aria-valuenow={spin.y}
                  title="Kéo chấm Đất Nung để chỉnh Cù lê / Trô / Ép phê (Nhấp đúp để đặt lại tâm)"
                  onDoubleClick={handleResetSpin}
                  onPointerDown={(e) => {
                    isDraggingSpinRef.current = true;
                    try {
                      e.currentTarget.setPointerCapture(e.pointerId);
                    } catch {
                      // Bỏ qua trong JSDOM
                    }
                    updateSpinFromPointer(e.clientX, e.clientY);
                  }}
                  onPointerMove={(e) => {
                    if (!isDraggingSpinRef.current) return;
                    updateSpinFromPointer(e.clientX, e.clientY);
                  }}
                  onPointerUp={(e) => {
                    isDraggingSpinRef.current = false;
                    try {
                      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                        e.currentTarget.releasePointerCapture(e.pointerId);
                      }
                    } catch {
                      // Bỏ qua trong JSDOM
                    }
                  }}
                  style={{ width: '38px', height: '38px' }}
                  className="relative flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#9C7A4C] bg-[radial-gradient(circle_at_35%_35%,#FFFFFF,#FAFBF9_60%,#D5E0DC)] shadow-inner select-none"
                >
                  {/* Đường chữ thập định tâm */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-1.5 top-1/2 h-[1px] -translate-y-1/2 bg-[#9C7A4C]/35"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-1.5 left-1/2 w-[1px] -translate-x-1/2 bg-[#9C7A4C]/35"
                  />
                  {/* Chấm chạm đầu cơ màu Đất Nung (#9E6356) trong bán kính 0.75R */}
                  <span
                    data-testid="billiards-spin-tip"
                    style={{
                      transform: `translate(${(spin.x * 13).toFixed(1)}px, ${(-spin.y * 13).toFixed(1)}px)`,
                    }}
                    className="pointer-events-none h-2.5 w-2.5 rounded-full border border-[#FAFBF9] bg-[#9E6356] shadow-xs"
                  />
                </div>

                <div className="flex flex-col leading-tight">
                  <span className="font-mono text-[9.5px] font-semibold tracking-wider text-[#8C6228] uppercase dark:text-[#D5B47A]">
                    ĐIỂM CHẠM
                  </span>
                  <span
                    data-testid="billiards-spin-label"
                    className="font-mono text-[11px] font-bold text-[#142622] dark:text-[#E6ECE7]"
                  >
                    {spinLabel}
                  </span>
                </div>
              </div>

              <button
                type="button"
                data-testid="billiards-new-rack-btn"
                onClick={handleNewRack}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#182624] shadow-2xs transition-all hover:border-[#9C7A4C] hover:bg-[#EDF2F0] active:scale-[0.98] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
              >
                <RotateCcw
                  className="h-3.5 w-3.5 text-[#8C6228] dark:text-[#D5B47A]"
                  aria-hidden="true"
                />
                <span>Xếp ván mới</span>
              </button>

              <button
                type="button"
                data-testid="billiards-ball-in-hand-btn"
                onClick={handleActivateBallInHand}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-xs font-semibold shadow-2xs transition-all active:scale-[0.98]',
                  ballInHand
                    ? 'border-[#9C7A4C] bg-[#9C7A4C] text-[#FAFBF9] dark:border-[#D5B47A] dark:bg-[#D5B47A] dark:text-[#142622]'
                    : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#182624] hover:border-[#9C7A4C] hover:bg-[#EDF2F0] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]',
                )}
              >
                <Crosshair
                  className={cn(
                    'h-3.5 w-3.5',
                    ballInHand ? 'text-current' : 'text-[#3B7A65] dark:text-[#6EB59B]',
                  )}
                  aria-hidden="true"
                />
                <span>Đặt lại bi cái</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to={ROUTES.learningSpace}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#1E332E] px-4 py-2 text-xs font-semibold text-[#FAFBF9] shadow-[0_8px_20px_rgba(30,51,46,0.16)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[#28443D] active:scale-[0.98] sm:text-sm dark:bg-[#245746] dark:hover:bg-[#2E6E58]"
              >
                <span>Bước vào Không gian học tập</span>
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>

              <Link
                to={ROUTES.glossary}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#CFD9D5] bg-[#FAFBF9] px-4 py-2 text-xs font-semibold text-[#182624] shadow-2xs transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#9C7A4C]/65 hover:bg-[#E7ECEA] active:scale-[0.98] sm:text-sm dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
              >
                <span>Kho Thuật ngữ</span>
                <ArrowRight
                  className="h-4 w-4 text-[#8C6228] dark:text-[#D5B47A]"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Đường viền kép mảnh Đồng Trầm chuyển tiếp gọn xuống Footer Đá Phiến Trầm (#142622) */}
      <div
        aria-hidden="true"
        data-testid="billiards-footer-seam"
        className="w-full bg-[#F2F4F3] pt-1 dark:bg-[#0E1A15]"
      >
        <div className="h-[5px] w-full border-y border-[#9C7A4C]/40 bg-[#EAEFED] dark:bg-[#12241C]" />
      </div>
    </section>
  );
}

export default MineralBilliardsStage;
