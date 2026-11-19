import {
  playBallClack,
  playCushionBounce,
  playMarbleRoll,
  playPocketDrop,
  playTrickShotReward,
} from '@/utils/billiardAudio';

export type BilliardGameMode = 'vs-ai' | 'two-player' | 'free';
export type BallGroup = 'solids' | 'stripes';

export const SUBSTEPS = 6;
export const BALL_RESTITUTION = 0.96;
export const CUSHION_RESTITUTION = 0.86;
export const JAW_RESTITUTION = 0.78;
export const JAW_RADIUS_PX = 3.5;
export const STOP_SPEED_PX_PER_FRAME = 0.08;
export const MAX_SHOT_SPEED_PX_PER_FRAME = 24.0;
export const POCKET_SINK_DURATION_SEC = 0.18;
export const STRIKE_ANIM_DURATION_SEC = 0.07;
export const CHALK_DUST_DURATION_SEC = 0.35;
export const TABLE_SHAKE_DURATION_SEC = 0.13;
export const TABLE_SHAKE_AMP_PX = 2.5;
export const GHOST_CUE_VECTOR_LEN_PX = 56;
export const PRECISION_AIM_FACTOR = 0.25;
export const ENGLISH_MAX_DEFLECT_RAD = (18 * Math.PI) / 180;
export const RETURN_RAIL_DELAY_SEC = 0.22;

export interface PoolBallSpec {
  readonly number: number; // 0 = cue, 1..7 = solids, 8 = black 8, 9..15 = stripes
  readonly name: string;
  readonly group: BallGroup | 'cue' | 'eight';
  readonly colorHex: string;
  readonly lightHex: string;
  readonly shadowHex: string;
  readonly isStripe: boolean;
}

const SOLID_PALETTE: readonly {
  readonly number: number;
  readonly name: string;
  readonly colorHex: string;
  readonly lightHex: string;
  readonly shadowHex: string;
}[] = [
  {
    number: 1,
    name: 'Vàng Hổ Phách',
    colorHex: '#D9A438',
    lightHex: '#F3D27A',
    shadowHex: '#845D14',
  },
  { number: 2, name: 'Lam Đậm', colorHex: '#2C5E8A', lightHex: '#6EA3D2', shadowHex: '#15314B' },
  {
    number: 3,
    name: 'Đỏ Son Trầm',
    colorHex: '#B5443C',
    lightHex: '#DF7F78',
    shadowHex: '#631D18',
  },
  {
    number: 4,
    name: 'Tím Thạch Anh',
    colorHex: '#6D4B82',
    lightHex: '#AA85C2',
    shadowHex: '#3A2347',
  },
  {
    number: 5,
    name: 'Cam Đất Nung',
    colorHex: '#C96D3B',
    lightHex: '#ECA47C',
    shadowHex: '#733818',
  },
  {
    number: 6,
    name: 'Ngọc Lục Bảo',
    colorHex: '#2D7A5B',
    lightHex: '#6AB898',
    shadowHex: '#154230',
  },
  { number: 7, name: 'Nâu Đỏ Gụ', colorHex: '#7A3832', lightHex: '#B56E67', shadowHex: '#421915' },
];

export const ALL_POOL_BALL_SPECS: readonly PoolBallSpec[] = [
  {
    number: 0,
    name: 'Bi cái Trắng Sứ',
    group: 'cue',
    colorHex: '#FAFBF9',
    lightHex: '#FFFFFF',
    shadowHex: '#C3D0CB',
    isStripe: false,
  },
  ...SOLID_PALETTE.map((s) => ({
    ...s,
    group: 'solids' as const,
    isStripe: false,
  })),
  {
    number: 8,
    name: 'Bi số 8 Đen',
    group: 'eight' as const,
    colorHex: '#141817',
    lightHex: '#48524F',
    shadowHex: '#050706',
    isStripe: false,
  },
  ...SOLID_PALETTE.map((s) => ({
    number: s.number + 8,
    name: `${s.name} (Sọc)`,
    group: 'stripes' as const,
    colorHex: s.colorHex,
    lightHex: s.lightHex,
    shadowHex: s.shadowHex,
    isStripe: true,
  })),
];

export const SOLID_BALL_SPECS = ALL_POOL_BALL_SPECS.filter((s) => s.group === 'solids');
export const STRIPE_BALL_SPECS = ALL_POOL_BALL_SPECS.filter((s) => s.group === 'stripes');

export interface BilliardBall {
  readonly id: number;
  readonly spec: PoolBallSpec;
  x: number;
  y: number;
  vx: number;
  vy: number;
  // Vector đơn vị cho vị trí lõi số (frontVec) và trục cực dải sọc (poleVec) trong không gian 3D lăn thật
  fx: number;
  fy: number;
  fz: number;
  px: number;
  py: number;
  pz: number;
  cushionBouncesThisTurn: number;
  pocketed: boolean;
  sinking: boolean;
  sinkProgress: number;
  sinkTargetX: number;
  sinkTargetY: number;
}

export interface ReturnRailBall {
  readonly id: number;
  readonly spec: PoolBallSpec;
  y: number;
  vy: number;
  rollAngle: number;
  pendingSec: number;
}

export interface PocketNode {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly isCorner: boolean;
}

export interface PocketJawNode {
  readonly id: number;
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

export interface PocketRipple {
  active: boolean;
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
}

export interface SparkParticle {
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

export interface FloatingBannerText {
  active: boolean;
  x: number;
  y: number;
  text: string;
  colorHex: string;
  ageSec: number;
  durationSec: number;
}

export interface StrikeAnimationState {
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

export interface AiTurnPlan {
  phase: 'idle' | 'aiming' | 'charging';
  elapsedSec: number;
  targetAngle: number;
  startAngle: number;
  targetPower: number;
  placeX: number | null;
  placeY: number | null;
}

export interface TableMetrics {
  width: number;
  height: number;
  tableWidth: number;
  railWidth: number;
  cushionBevelPx: number;
  feltLeft: number;
  feltTop: number;
  feltRight: number;
  feltBottom: number;
  feltWidth: number;
  feltHeight: number;
  ballRadius: number;
  pocketRadius: number;
  headStringX: number;
  footSpotX: number;
  centerY: number;
  pockets: PocketNode[];
  pocketJaws: PocketJawNode[];
  returnRailX: number;
  returnRailW: number;
  returnRailTopY: number;
  returnRailBottomY: number;
  returnBallRadius: number;
}

export interface GhostBallRaycastResult {
  readonly ghostX: number;
  readonly ghostY: number;
  readonly hitBall: BilliardBall | null;
  readonly targetDirX: number;
  readonly targetDirY: number;
  readonly cueDeflectX: number;
  readonly cueDeflectY: number;
}

export interface BilliardsWorld {
  metrics: TableMetrics;
  dpr: number;
  gameMode: BilliardGameMode;
  balls: BilliardBall[];
  returnRailQueue: ReturnRailBall[];
  ripples: PocketRipple[];
  rippleCursor: number;
  sparks: SparkParticle[];
  sparkCursor: number;
  floatTexts: FloatingBannerText[];
  floatCursor: number;
  aimAngle: number;
  dragPullPower: number;
  isDraggingAim: boolean;
  dragPrevX: number;
  dragPrevY: number;
  isPrecisionAim: boolean;
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
  pocketedIdsThisTurn: number[];
  scratchedThisTurn: boolean;
  isBreakShot: boolean;
  p1Group: BallGroup | null;
  p2Group: BallGroup | null;
  foulMessage: string | null;
  winner: 1 | 2 | null;
  winReason: string | null;
  strikeAnim: StrikeAnimationState;
  aiPlan: AiTurnPlan;
  shakeRemainingSec: number;
  shotInProgress: boolean;
  ballInHand: boolean;
  shots: number;
  combo: number;
  currentPlayer: 1 | 2;
  rackCleared: boolean;
}

export function normalizeAngleDiff(diff: number): number {
  return Math.atan2(Math.sin(diff), Math.cos(diff));
}

export function computeTableMetrics(width: number, height: number): TableMetrics {
  const safeW = Math.max(400, width);
  const safeH = Math.max(210, height);

  // Dành hành lang bên phải cho Máng hồi bi cơ khí chuẩn 8 Ball Pool
  const returnRailW = Math.max(28, Math.min(36, Math.round(safeW * 0.036)));
  const returnRailGap = 10;
  const tableWidth = Math.max(320, safeW - returnRailW - returnRailGap - 8);
  const railWidth = Math.max(
    20,
    Math.min(34, Math.round(Math.min(tableWidth * 0.036, safeH * 0.072))),
  );
  const cushionBevelPx = Math.max(5.5, Math.min(9.5, Math.round(railWidth * 0.28)));

  const feltLeft = railWidth;
  const feltTop = railWidth;
  const feltRight = tableWidth - railWidth;
  const feltBottom = safeH - railWidth;
  const feltWidth = Math.max(240, feltRight - feltLeft);
  const feltHeight = Math.max(120, feltBottom - feltTop);

  const ballRadius = Math.max(8.5, Math.min(13.5, feltHeight * 0.033));
  const pocketRadius = ballRadius * 1.68;

  // Vạch khai cuộc thẳng tại 25% và chấm khai cuộc tại 75%
  const headStringX = feltLeft + feltWidth * 0.25;
  const footSpotX = feltLeft + feltWidth * 0.75;
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

  const cornerMouthOffset = pocketRadius * 1.06;
  const sideMouthOffset = pocketRadius * 0.96;
  const rawJaws: { x: number; y: number }[] = [
    { x: feltLeft + cornerMouthOffset, y: feltTop },
    { x: feltLeft, y: feltTop + cornerMouthOffset },
    { x: midX - sideMouthOffset, y: feltTop },
    { x: midX + sideMouthOffset, y: feltTop },
    { x: feltRight - cornerMouthOffset, y: feltTop },
    { x: feltRight, y: feltTop + cornerMouthOffset },
    { x: feltLeft + cornerMouthOffset, y: feltBottom },
    { x: feltLeft, y: feltBottom - cornerMouthOffset },
    { x: midX - sideMouthOffset, y: feltBottom },
    { x: midX + sideMouthOffset, y: feltBottom },
    { x: feltRight - cornerMouthOffset, y: feltBottom },
    { x: feltRight, y: feltBottom - cornerMouthOffset },
  ];

  const pocketJaws: PocketJawNode[] = rawJaws.map((pt, idx) => ({
    id: idx,
    x: pt.x,
    y: pt.y,
    r: JAW_RADIUS_PX,
  }));

  const returnRailX = tableWidth + returnRailGap;
  const returnRailTopY = railWidth * 0.65;
  const returnRailBottomY = safeH - railWidth * 0.45;
  const returnBallRadius = Math.max(8, Math.min(11.5, returnRailW * 0.34));

  return {
    width: safeW,
    height: safeH,
    tableWidth,
    railWidth,
    cushionBevelPx,
    feltLeft,
    feltTop,
    feltRight,
    feltBottom,
    feltWidth,
    feltHeight,
    ballRadius,
    pocketRadius,
    headStringX,
    footSpotX,
    centerY,
    pockets,
    pocketJaws,
    returnRailX,
    returnRailW,
    returnRailTopY,
    returnRailBottomY,
    returnBallRadius,
  };
}

function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

/**
 * Xếp Tam Giác 15 Bi chuẩn 8 Ball Pool (5 hàng 1-2-3-4-5):
 * - Bi 8 Đen nằm chính giữa hàng 3 (index 4).
 * - Hai góc đáy hàng 5 bắt buộc 1 Trơn và 1 Sọc.
 * - Các vị trí còn lại xáo trộn tự nhiên.
 */
export function buildOfficial15BallRack(metrics: TableMetrics): BilliardBall[] {
  const r = metrics.ballRadius;
  const rowGapX = r * Math.sqrt(3) * 1.025;
  const colGapY = r * 2.04;

  const cueSpec = ALL_POOL_BALL_SPECS[0]!;
  const eightSpec = ALL_POOL_BALL_SPECS.find((s) => s.number === 8)!;

  const solids = shuffleInPlace([...SOLID_BALL_SPECS]);
  const stripes = shuffleInPlace([...STRIPE_BALL_SPECS]);

  const cornerSolid = solids.pop()!;
  const cornerStripe = stripes.pop()!;
  const swapCorners = Math.random() > 0.5;
  const leftBottomCorner = swapCorners ? cornerStripe : cornerSolid;
  const rightBottomCorner = swapCorners ? cornerSolid : cornerStripe;

  const remaining = shuffleInPlace([...solids, ...stripes]);

  // 15 slot tọa độ (hàng 0..4, cột 0..row)
  const slots: { row: number; col: number; spec: PoolBallSpec }[] = [];
  let remCursor = 0;

  for (let row = 0; row < 5; row += 1) {
    for (let col = 0; col <= row; col += 1) {
      let spec: PoolBallSpec;
      if (row === 2 && col === 1) {
        spec = eightSpec;
      } else if (row === 4 && col === 0) {
        spec = leftBottomCorner;
      } else if (row === 4 && col === 4) {
        spec = rightBottomCorner;
      } else {
        spec = remaining[remCursor] ?? eightSpec;
        remCursor += 1;
      }
      slots.push({ row, col, spec });
    }
  }

  const makeBall = (spec: PoolBallSpec, x: number, y: number): BilliardBall => {
    const tilt = ((spec.number * 0.45) % 0.8) - 0.4;
    return {
      id: spec.number,
      spec,
      x,
      y,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: 0,
      fz: 1,
      px: Math.sin(tilt) * 0.25,
      py: Math.cos(tilt),
      pz: 0.15,
      cushionBouncesThisTurn: 0,
      pocketed: false,
      sinking: false,
      sinkProgress: 0,
      sinkTargetX: 0,
      sinkTargetY: 0,
    };
  };

  const cueBall = makeBall(cueSpec, metrics.headStringX, metrics.centerY);
  const rackBalls = slots.map((slot) => {
    const offsetY = (slot.col - slot.row * 0.5) * colGapY;
    const x = metrics.footSpotX + slot.row * rowGapX;
    const y = metrics.centerY + offsetY;
    return makeBall(slot.spec, x, y);
  });

  return [cueBall, ...rackBalls];
}

function rotateVectorByAxis(
  vx: number,
  vy: number,
  vz: number,
  ux: number,
  uy: number,
  cosT: number,
  sinT: number,
): [number, number, number] {
  const dot = ux * vx + uy * vy;
  const cx = uy * vz;
  const cy = -ux * vz;
  const cz = ux * vy - uy * vx;

  const nx = vx * cosT + cx * sinT + ux * dot * (1 - cosT);
  const ny = vy * cosT + cy * sinT + uy * dot * (1 - cosT);
  const nz = vz * cosT + cz * sinT;
  const len = Math.hypot(nx, ny, nz) || 1;
  return [nx / len, ny / len, nz / len];
}

export function advanceBallRolling3D(
  ball: BilliardBall,
  dx: number,
  dy: number,
  radius: number,
): void {
  const dist = Math.hypot(dx, dy);
  if (dist < 1e-4 || radius <= 0) return;

  const dTheta = dist / radius;
  const ux = -dy / dist;
  const uy = dx / dist;
  const cosT = Math.cos(dTheta);
  const sinT = Math.sin(dTheta);

  const [nfx, nfy, nfz] = rotateVectorByAxis(ball.fx, ball.fy, ball.fz, ux, uy, cosT, sinT);
  ball.fx = nfx;
  ball.fy = nfy;
  ball.fz = nfz;

  const [npx, npy, npz] = rotateVectorByAxis(ball.px, ball.py, ball.pz, ux, uy, cosT, sinT);
  ball.px = npx;
  ball.py = npy;
  ball.pz = npz;
}

export function createBilliardsWorld(
  width = 1020,
  height = 490,
  mode: BilliardGameMode = 'vs-ai',
): BilliardsWorld {
  const metrics = computeTableMetrics(width, height);
  return {
    metrics,
    dpr: 1,
    gameMode: mode,
    balls: buildOfficial15BallRack(metrics),
    returnRailQueue: [],
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
      durationSec: 1.25,
    })),
    floatCursor: 0,
    aimAngle: 0,
    dragPullPower: 0,
    isDraggingAim: false,
    dragPrevX: 0,
    dragPrevY: 0,
    isPrecisionAim: false,
    hoverPlaceX: metrics.headStringX,
    hoverPlaceY: metrics.centerY,
    spinX: 0,
    spinY: 0,
    activeCueSpinX: 0,
    activeCueSpinY: 0,
    activeShotDirX: 1,
    activeShotDirY: 0,
    cueHasHitBallThisTurn: false,
    firstHitBallIdThisTurn: null,
    pocketedIdsThisTurn: [],
    scratchedThisTurn: false,
    isBreakShot: true,
    p1Group: null,
    p2Group: null,
    foulMessage: null,
    winner: null,
    winReason: null,
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
    aiPlan: {
      phase: 'idle',
      elapsedSec: 0,
      targetAngle: 0,
      startAngle: 0,
      targetPower: 0.65,
      placeX: null,
      placeY: null,
    },
    shakeRemainingSec: 0,
    shotInProgress: false,
    ballInHand: false,
    shots: 0,
    combo: 0,
    currentPlayer: 1,
    rackCleared: false,
  };
}

export function getPlayerGroup(world: BilliardsWorld, player: 1 | 2): BallGroup | null {
  return player === 1 ? world.p1Group : world.p2Group;
}

export function hasClearedGroup(world: BilliardsWorld, group: BallGroup): boolean {
  return world.balls.filter((b) => b.spec.group === group).every((b) => b.pocketed || b.sinking);
}

/**
 * Kiểm tra xem viên bi mục tiêu có hợp lệ để chạm trước cho người chơi hiện tại hay không.
 */
export function isBallLegalTarget(
  world: BilliardsWorld,
  ball: BilliardBall,
  player: 1 | 2,
): boolean {
  if (ball.id <= 0 || ball.pocketed) return false;
  if (world.gameMode === 'free') return true;

  const group = getPlayerGroup(world, player);
  if (group === null) {
    // Bàn đang mở: mọi bi trừ bi 8 đều hợp lệ (riêng phá bi có thể chạm mọi bi 1..15 trừ bi 8)
    return ball.id !== 8;
  }

  if (hasClearedGroup(world, group)) {
    return ball.id === 8;
  }

  return ball.spec.group === group;
}

export function computeGhostBallRaycast(
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

    const dotDN = dirX * targetDirX + dirY * targetDirY;
    let tx = dirX - dotDN * targetDirX;
    let ty = dirY - dotDN * targetDirY;
    const tLen = Math.hypot(tx, ty);
    if (tLen > 1e-4) {
      tx /= tLen;
      ty /= tLen;
    } else {
      tx = spinY >= 0 ? dirX : -dirX;
      ty = spinY >= 0 ? dirY : -dirY;
    }

    const spinPullX = spinY >= 0 ? dirX * spinY * 0.72 : -targetDirX * Math.abs(spinY) * 0.85;
    const spinPullY = spinY >= 0 ? dirY * spinY * 0.72 : -targetDirY * Math.abs(spinY) * 0.85;

    const rawCueX = tx * 0.75 + spinPullX;
    const rawCueY = ty * 0.75 + spinPullY;
    const cLen = Math.hypot(rawCueX, rawCueY) || 1;
    cueDeflectX = rawCueX / cLen;
    cueDeflectY = rawCueY / cLen;
  } else {
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

function isSegmentClear(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  balls: readonly BilliardBall[],
  ignoreIdA: number,
  ignoreIdB: number,
  clearanceR: number,
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-4) return true;

  for (const b of balls) {
    if (b.pocketed || b.sinking || b.id === ignoreIdA || b.id === ignoreIdB) continue;
    const t = Math.max(0, Math.min(1, ((b.x - x1) * dx + (b.y - y1) * dy) / lenSq));
    const px = x1 + t * dx;
    const py = y1 + t * dy;
    if (Math.hypot(b.x - px, b.y - py) < clearanceR) {
      return false;
    }
  }
  return true;
}

export function clampValidCueBallPlacement(
  world: BilliardsWorld,
  rawX: number,
  rawY: number,
): { x: number; y: number } {
  const { metrics } = world;
  const r = metrics.ballRadius;
  const minX = metrics.feltLeft + r + 5;
  const maxX = metrics.feltRight - r - 5;
  const minY = metrics.feltTop + r + 5;
  const maxY = metrics.feltBottom - r - 5;

  let x = Math.max(minX, Math.min(maxX, rawX));
  let y = Math.max(minY, Math.min(maxY, rawY));

  for (let pass = 0; pass < 4; pass += 1) {
    for (const ball of world.balls) {
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
}

/**
 * AI Bot thực chiến (Chế độ Đấu Máy):
 * Quét toàn bộ bi hợp lệ × 6 lỗ, kiểm tra raycast không bị chắn, tính góc cắt + sai số tự nhiên (±1.2°).
 */
export function computeAiShotPlan(world: BilliardsWorld): AiTurnPlan {
  const { metrics, balls } = world;
  const cueBall = balls[0];
  if (!cueBall) {
    return {
      phase: 'aiming',
      elapsedSec: 0,
      targetAngle: 0,
      startAngle: world.aimAngle,
      targetPower: 0.65,
      placeX: null,
      placeY: null,
    };
  }

  let placeX: number | null = null;
  let placeY: number | null = null;
  const legalTargets = balls.filter((b) => isBallLegalTarget(world, b, 2));
  const fallbackTargets =
    legalTargets.length > 0 ? legalTargets : balls.filter((b) => b.id > 0 && !b.pocketed);

  // Nếu Máy được đặt bi tự do (Ball-in-Hand), tự chọn vị trí đẹp phía sau 1 bi hợp lệ thẳng lỗ
  let evalCueX = cueBall.x;
  let evalCueY = cueBall.y;

  if (world.ballInHand && fallbackTargets.length > 0) {
    let bestPlaceScore = -Infinity;
    for (const tBall of fallbackTargets) {
      for (const pocket of metrics.pockets) {
        const dxP = pocket.x - tBall.x;
        const dyP = pocket.y - tBall.y;
        const distP = Math.hypot(dxP, dyP) || 1;
        if (
          !isSegmentClear(
            tBall.x,
            tBall.y,
            pocket.x,
            pocket.y,
            balls,
            tBall.id,
            0,
            metrics.ballRadius * 1.9,
          )
        ) {
          continue;
        }
        const candRawX = tBall.x - (dxP / distP) * metrics.ballRadius * 7.5;
        const candRawY = tBall.y - (dyP / distP) * metrics.ballRadius * 7.5;
        const cand = clampValidCueBallPlacement(world, candRawX, candRawY);
        const distToCand = Math.hypot(cand.x - tBall.x, cand.y - tBall.y);
        if (distToCand > metrics.ballRadius * 2.5) {
          const score = 1000 - distP;
          if (score > bestPlaceScore) {
            bestPlaceScore = score;
            placeX = cand.x;
            placeY = cand.y;
            evalCueX = cand.x;
            evalCueY = cand.y;
          }
        }
      }
    }
    if (placeX === null) {
      const def = clampValidCueBallPlacement(world, metrics.headStringX, metrics.centerY);
      placeX = def.x;
      placeY = def.y;
      evalCueX = def.x;
      evalCueY = def.y;
    }
  }

  let bestScore = -Infinity;
  let bestAngle = 0;
  let bestPower = 0.65;

  for (const tBall of fallbackTargets) {
    for (const pocket of metrics.pockets) {
      const toPocketX = pocket.x - tBall.x;
      const toPocketY = pocket.y - tBall.y;
      const distTP = Math.hypot(toPocketX, toPocketY) || 1;
      const dirTPX = toPocketX / distTP;
      const dirTPY = toPocketY / distTP;

      // Vị trí Bi Ảo để đưa tBall hướng thẳng tới tâm lỗ
      const ghostX = tBall.x - dirTPX * metrics.ballRadius * 2;
      const ghostY = tBall.y - dirTPY * metrics.ballRadius * 2;

      if (
        ghostX < metrics.feltLeft + metrics.ballRadius ||
        ghostX > metrics.feltRight - metrics.ballRadius ||
        ghostY < metrics.feltTop + metrics.ballRadius ||
        ghostY > metrics.feltBottom - metrics.ballRadius
      ) {
        continue;
      }

      const cueToGhostX = ghostX - evalCueX;
      const cueToGhostY = ghostY - evalCueY;
      const distCG = Math.hypot(cueToGhostX, cueToGhostY) || 1;
      const dirCGX = cueToGhostX / distCG;
      const dirCGY = cueToGhostY / distCG;

      // Kiểm tra góc cắt hợp lý (>= ~22°)
      const cutCos = dirCGX * dirTPX + dirCGY * dirTPY;
      if (cutCos < 0.25) continue;

      // Kiểm tra đường bi cái -> bi ảo và bi mục tiêu -> lỗ có bị bi khác chắn không
      const cuePathClear = isSegmentClear(
        evalCueX,
        evalCueY,
        ghostX,
        ghostY,
        balls,
        0,
        tBall.id,
        metrics.ballRadius * 1.92,
      );
      const objPathClear = isSegmentClear(
        tBall.x,
        tBall.y,
        pocket.x,
        pocket.y,
        balls,
        0,
        tBall.id,
        metrics.ballRadius * 1.92,
      );

      let score = cutCos * 420 - distTP * 0.45 - distCG * 0.28;
      if (cuePathClear && objPathClear) {
        score += 900;
      } else if (cuePathClear) {
        score += 120;
      }

      if (score > bestScore) {
        bestScore = score;
        bestAngle = Math.atan2(dirCGY, dirCGX);
        bestPower = Math.max(
          0.42,
          Math.min(0.86, 0.36 + (distCG + distTP) / (metrics.feltWidth * 1.65)),
        );
      }
    }
  }

  // Nếu mọi đường ăn trực tiếp đều bị cắt gắt, AI đánh nhẹ hướng thẳng vào tâm bi mục tiêu hợp lệ gần nhất
  if (bestScore === -Infinity && fallbackTargets.length > 0) {
    const nearest = fallbackTargets[0]!;
    bestAngle = Math.atan2(nearest.y - evalCueY, nearest.x - evalCueX);
    bestPower = 0.56;
  }

  // Thêm sai số tự nhiên nhỏ (±1.2°) để AI chơi chân thực như người
  const jitterRad = ((Math.random() - 0.5) * 2.4 * Math.PI) / 180;

  return {
    phase: 'aiming',
    elapsedSec: 0,
    targetAngle: bestAngle + jitterRad,
    startAngle: world.aimAngle,
    targetPower: bestPower,
    placeX,
    placeY,
  };
}

export function spawnPocketRipple(world: BilliardsWorld, x: number, y: number, maxR = 36): void {
  const ripple = world.ripples[world.rippleCursor % world.ripples.length];
  world.rippleCursor = (world.rippleCursor + 1) % world.ripples.length;
  if (!ripple) return;
  ripple.active = true;
  ripple.x = x;
  ripple.y = y;
  ripple.r = 6;
  ripple.maxR = maxR;
  ripple.alpha = 0.92;
}

export function spawnCollisionSparks(world: BilliardsWorld, x: number, y: number, count = 5): void {
  for (let i = 0; i < count; i += 1) {
    const spark = world.sparks[world.sparkCursor % world.sparks.length];
    world.sparkCursor = (world.sparkCursor + 1) % world.sparks.length;
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
}

export function spawnChalkDustBurst(
  world: BilliardsWorld,
  tipX: number,
  tipY: number,
  dirX: number,
  dirY: number,
): void {
  const count = 10;
  const baseAngle = Math.atan2(dirY, dirX);
  for (let i = 0; i < count; i += 1) {
    const spark = world.sparks[world.sparkCursor % world.sparks.length];
    world.sparkCursor = (world.sparkCursor + 1) % world.sparks.length;
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
    spark.colorRgba = 'rgba(220, 234, 230, 0.92)';
    spark.radius = 2.1;
  }
}

export function spawnFloatingText(
  world: BilliardsWorld,
  x: number,
  y: number,
  text: string,
  colorHex = '#D9B468',
): void {
  const item = world.floatTexts[world.floatCursor % world.floatTexts.length];
  world.floatCursor = (world.floatCursor + 1) % world.floatTexts.length;
  if (!item) return;
  item.active = true;
  item.x = x;
  item.y = y;
  item.text = text;
  item.colorHex = colorHex;
  item.ageSec = 0;
  item.durationSec = 1.25;
}

/**
 * Xử lý kết thúc một lượt đánh theo chuẩn luật 8-Ball (Đấu Máy / 2 Người / Tập tự do).
 */
function resolveTurnOutcome(world: BilliardsWorld): void {
  const { metrics } = world;
  const cueBall = world.balls[0];
  const pocketedEight = world.pocketedIdsThisTurn.includes(8);
  const pocketedNonEightIds = world.pocketedIdsThisTurn.filter((id) => id !== 8);

  if (world.gameMode === 'free') {
    if (world.scratchedThisTurn) {
      world.ballInHand = true;
      world.foulMessage = 'Bi cái rơi lỗ — Bấm chọn vị trí đặt lại';
      world.combo = 0;
    } else if (pocketedNonEightIds.length === 0 && !pocketedEight) {
      world.combo = 0;
    }
    const allCleared = world.balls.filter((b) => b.id >= 1).every((b) => b.pocketed);
    if (allCleared) {
      world.rackCleared = true;
      world.ballInHand = false;
      world.winner = 1;
      world.winReason = `Hoàn thành bàn 15 bi · ${world.shots} cơ`;
    }
    world.isBreakShot = false;
    world.pocketedIdsThisTurn = [];
    return;
  }

  // Luật 8-Ball đối kháng (Đấu Máy & 2 Người)
  const shooter = world.currentPlayer;
  const opponent: 1 | 2 = shooter === 1 ? 2 : 1;
  const shooterGroupBefore = getPlayerGroup(world, shooter);

  // 1. Kiểm tra rơi Bi số 8
  if (pocketedEight) {
    const shooterClearedBeforeTurn =
      shooterGroupBefore !== null &&
      world.balls
        .filter(
          (b) => b.spec.group === shooterGroupBefore && !world.pocketedIdsThisTurn.includes(b.id),
        )
        .every((b) => b.pocketed);

    // Nếu chưa dọn hết nhóm của mình hoặc rơi kèm bi cái -> thua ngay
    if (!shooterClearedBeforeTurn || world.scratchedThisTurn) {
      world.rackCleared = true;
      world.winner = opponent;
      world.winReason =
        shooter === 1
          ? world.scratchedThisTurn
            ? 'Rơi bi cái khi đánh bi 8'
            : 'Rơi bi 8 trước khi dọn hết nhóm'
          : 'Đối thủ phạm lỗi bi 8';
    } else {
      world.rackCleared = true;
      world.winner = shooter;
      world.winReason =
        shooter === 1 ? 'Đưa Bi số 8 vào lỗ hợp lệ!' : 'Máy AI đưa Bi số 8 vào lỗ hợp lệ!';
    }
    world.ballInHand = false;
    world.isBreakShot = false;
    world.pocketedIdsThisTurn = [];
    return;
  }

  // 2. Xác định lỗi chạm (Foul)
  let foulText: string | null = null;
  if (world.scratchedThisTurn) {
    foulText = 'Bi cái rơi lỗ — Đặt bi tự do';
  } else if (world.firstHitBallIdThisTurn === null) {
    foulText = 'Không chạm bi — Đặt bi tự do';
  } else if (shooterGroupBefore !== null) {
    const firstBall = world.balls.find((b) => b.id === world.firstHitBallIdThisTurn);
    const mustHitEight = hasClearedGroup(world, shooterGroupBefore);
    if (firstBall) {
      if (mustHitEight && firstBall.id !== 8) {
        foulText = 'Phải chạm Bi 8 trước — Đặt bi tự do';
      } else if (!mustHitEight && firstBall.spec.group !== shooterGroupBefore) {
        foulText = 'Chạm sai nhóm bi — Đặt bi tự do';
      }
    }
  } else if (world.firstHitBallIdThisTurn === 8 && !world.isBreakShot) {
    foulText = 'Chạm Bi 8 khi bàn đang mở — Đặt bi tự do';
  }

  // 3. Phân nhóm tự động sau cú khai cuộc (khi bàn đang mở và ăn hợp lệ >= 1 bi không phạm lỗi)
  if (
    !foulText &&
    !world.isBreakShot &&
    shooterGroupBefore === null &&
    pocketedNonEightIds.length > 0
  ) {
    const firstPocketed = world.balls.find((b) => b.id === pocketedNonEightIds[0]);
    if (
      firstPocketed &&
      (firstPocketed.spec.group === 'solids' || firstPocketed.spec.group === 'stripes')
    ) {
      const assigned: BallGroup = firstPocketed.spec.group;
      const other: BallGroup = assigned === 'solids' ? 'stripes' : 'solids';
      if (shooter === 1) {
        world.p1Group = assigned;
        world.p2Group = other;
      } else {
        world.p2Group = assigned;
        world.p1Group = other;
      }
      if (cueBall) {
        spawnFloatingText(
          world,
          cueBall.x,
          Math.max(metrics.feltTop + 26, cueBall.y - 20),
          assigned === 'solids' ? 'NHÓM TRƠN (1–7)' : 'NHÓM SỌC (9–15)',
          '#D9B468',
        );
      }
    }
  }

  const shooterGroupNow = getPlayerGroup(world, shooter);
  const scoredOwnBall =
    !foulText &&
    pocketedNonEightIds.some((id) => {
      if (shooterGroupNow === null) return true;
      const b = world.balls.find((item) => item.id === id);
      return b?.spec.group === shooterGroupNow;
    });

  if (foulText) {
    world.combo = 0;
    world.currentPlayer = opponent;
    world.ballInHand = true;
    world.foulMessage = foulText;
  } else if (scoredOwnBall) {
    world.foulMessage = null;
    world.ballInHand = false;
  } else {
    world.combo = 0;
    world.currentPlayer = opponent;
    world.ballInHand = false;
    world.foulMessage = null;
  }

  world.isBreakShot = false;
  world.pocketedIdsThisTurn = [];
}

/**
 * Chạy 1 bước vật lý SUBSTEPS=6 ở 120fps (`dtScale`) + máng hồi bi cơ khí bên phải.
 * Trả về true nếu trạng thái HUD React cần đồng bộ.
 */
export function stepBilliardsPhysicsFrame(
  world: BilliardsWorld,
  dtSeconds: number,
  dtScale: number,
  onStrikeContact: (strike: StrikeAnimationState) => void,
): boolean {
  let hudDirty = false;
  const { metrics } = world;
  const r = metrics.ballRadius;
  const twoR = r * 2;
  const subDtScale = dtScale / SUBSTEPS;
  const subFriction = Math.pow(0.986, subDtScale);
  const pocketCaptureDist = metrics.pocketRadius * 0.92;
  const pocketMouthAllowance = metrics.pocketRadius * 1.16;

  if (world.shakeRemainingSec > 0) {
    world.shakeRemainingSec = Math.max(0, world.shakeRemainingSec - dtSeconds);
  }

  // 1. Cập nhật Animation Gậy Lao Chạm Bi (70ms)
  if (world.strikeAnim.active) {
    world.strikeAnim.elapsedSec += dtSeconds;
    if (world.strikeAnim.elapsedSec >= world.strikeAnim.durationSec) {
      world.strikeAnim.active = false;
      onStrikeContact(world.strikeAnim);
      hudDirty = true;
    }
  }

  // 2. Cập nhật hiệu ứng hút bi rơi vào lỗ (180ms) & đưa bi vào máng hồi bi cơ khí (sau 220ms)
  for (const ball of world.balls) {
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
        const safePos = clampValidCueBallPlacement(world, metrics.headStringX, metrics.centerY);
        ball.x = safePos.x;
        ball.y = safePos.y;
        world.hoverPlaceX = safePos.x;
        world.hoverPlaceY = safePos.y;
      } else {
        ball.pocketed = true;
        // Đưa bi vào Máng hồi bi cơ khí bên phải (xuất hiện sau 220ms ở ray trên cùng)
        if (!world.returnRailQueue.some((rb) => rb.id === ball.id)) {
          world.returnRailQueue.push({
            id: ball.id,
            spec: ball.spec,
            y: metrics.returnRailTopY + metrics.returnBallRadius,
            vy: 42,
            rollAngle: 0,
            pendingSec: RETURN_RAIL_DELAY_SEC,
          });
        }
      }
      hudDirty = true;
    }
  }

  // 3. Cập nhật Máng Hồi Bi Cơ Khí bên phải bàn (trượt dốc xuống đáy & xếp chồng va chạm nhẹ)
  const rr = metrics.returnBallRadius;
  const railFloorY = metrics.returnRailBottomY - rr - 4;
  for (let i = 0; i < world.returnRailQueue.length; i += 1) {
    const rb = world.returnRailQueue[i]!;
    if (rb.pendingSec > 0) {
      rb.pendingSec = Math.max(0, rb.pendingSec - dtSeconds);
      continue;
    }
    rb.vy += 680 * dtSeconds;
    const prevY = rb.y;
    rb.y += rb.vy * dtSeconds;
    rb.rollAngle += (rb.y - prevY) / Math.max(1, rr);

    // Chạm đáy máng hồi bi
    if (rb.y > railFloorY) {
      if (rb.vy > 45) {
        playMarbleRoll(Math.min(1, rb.vy / 340));
      }
      rb.y = railFloorY;
      rb.vy = Math.abs(rb.vy) > 40 ? -rb.vy * 0.25 : 0;
    }

    // Xếp chồng nối đuôi lên các viên bi đã nằm dưới đáy máng
    if (i > 0) {
      const below = world.returnRailQueue[i - 1]!;
      if (below.pendingSec <= 0) {
        const minStackY = below.y - rr * 2.02;
        if (rb.y > minStackY) {
          if (rb.vy - below.vy > 40) {
            playMarbleRoll(Math.min(1, (rb.vy - below.vy) / 320));
          }
          rb.y = minStackY;
          rb.vy = below.vy * 0.3;
        }
      }
    }
  }

  // 4. Vật lý SUBSTEPS = 6 trên mặt nỉ
  if (!world.strikeAnim.active) {
    for (let step = 0; step < SUBSTEPS; step += 1) {
      for (const ball of world.balls) {
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

        // Kiểm tra rơi vào 1 trong 6 lỗ
        let droppedPocket: PocketNode | null = null;
        for (const pocket of metrics.pockets) {
          if (Math.hypot(ball.x - pocket.x, ball.y - pocket.y) < pocketCaptureDist) {
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
          spawnPocketRipple(world, droppedPocket.x, droppedPocket.y, metrics.pocketRadius * 1.9);

          if (ball.id === 0) {
            world.combo = 0;
            world.scratchedThisTurn = true;
            spawnFloatingText(
              world,
              droppedPocket.x,
              Math.max(metrics.feltTop + 28, droppedPocket.y - 18),
              'RƠI BI CÁI',
              '#E08A7B',
            );
            playCushionBounce(0.5);
          } else {
            world.pocketedIdsThisTurn.push(ball.id);
            world.combo += 1;
            const nonEightCount = world.pocketedIdsThisTurn.filter((id) => id !== 8).length;
            const bannerY = Math.max(metrics.feltTop + 30, droppedPocket.y - 16);

            if (ball.cushionBouncesThisTurn >= 1) {
              spawnFloatingText(world, droppedPocket.x, bannerY - 16, 'BANK SHOT!', '#D9B468');
              playTrickShotReward('bank');
            }
            if (nonEightCount >= 2) {
              spawnFloatingText(world, droppedPocket.x, bannerY, 'DOUBLE POT!', '#D9B468');
              playTrickShotReward('double');
            } else if (world.combo >= 2) {
              spawnFloatingText(
                world,
                droppedPocket.x,
                bannerY,
                `COMBO ×${world.combo}!`,
                '#D9B468',
              );
              playTrickShotReward('combo');
            } else if (ball.cushionBouncesThisTurn === 0) {
              spawnFloatingText(world, droppedPocket.x, bannerY, `+${ball.id}`, '#D9B468');
            }
            playPocketDrop(world.combo);
          }
          continue;
        }

        // 12 Chốt bo góc miệng lỗ (Pocket Knuckles / Jaws: r = 3.5px, restitution = 0.78)
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
          if (ball.id === 0 && Math.abs(world.activeCueSpinX) > 0.02) {
            const spd = Math.hypot(ball.vx, ball.vy);
            if (spd > 0.2) {
              const ang =
                Math.atan2(ball.vy, ball.vx) + world.activeCueSpinX * ENGLISH_MAX_DEFLECT_RAD;
              ball.vx = Math.cos(ang) * spd;
              ball.vy = Math.sin(ang) * spd;
              world.activeCueSpinX *= 0.52;
            }
          }
          if (cushionImpact > 0.45) {
            playCushionBounce(Math.min(1, cushionImpact / 14));
          }
        }
      }

      // Va chạm Bi – Bi + bảo toàn động lượng 2D (0.96) + xung lực Cù lê / Trô
      for (let i = 0; i < world.balls.length; i += 1) {
        const a = world.balls[i]!;
        if (a.pocketed || a.sinking) continue;

        for (let j = i + 1; j < world.balls.length; j += 1) {
          const b = world.balls[j]!;
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

              if (a.id === 0 || b.id === 0) {
                const cue = a.id === 0 ? a : b;
                const target = a.id === 0 ? b : a;
                const toTargetX = a.id === 0 ? nx : -nx;
                const toTargetY = a.id === 0 ? ny : -ny;

                if (world.firstHitBallIdThisTurn === null) {
                  world.firstHitBallIdThisTurn = target.id;
                }

                if (!world.cueHasHitBallThisTurn && Math.abs(world.activeCueSpinY) > 0.03) {
                  world.cueHasHitBallThisTurn = true;
                  const spinImpulse =
                    Math.max(1.8, preSpeed * 0.44) * Math.abs(world.activeCueSpinY);
                  if (world.activeCueSpinY > 0) {
                    cue.vx += world.activeShotDirX * spinImpulse;
                    cue.vy += world.activeShotDirY * spinImpulse;
                  } else {
                    cue.vx -= toTargetX * spinImpulse * 1.12;
                    cue.vy -= toTargetY * spinImpulse * 1.12;
                  }
                  world.activeCueSpinY *= 0.2;
                } else {
                  world.cueHasHitBallThisTurn = true;
                }
              }

              const impactNorm = Math.min(1, Math.abs(velAlongNormal) / 15);
              if (impactNorm > 0.06) {
                spawnCollisionSparks(world, (a.x + b.x) * 0.5, (a.y + b.y) * 0.5, 5);
                playBallClack(impactNorm);
              }
            }
          }
        }
      }
    }
  }

  // 5. Kết thúc lượt đánh khi toàn bộ bi đã đứng yên
  if (world.shotInProgress && !world.strikeAnim.active) {
    const stillMoving = world.balls.some(
      (b) => !b.pocketed && (b.sinking || Math.hypot(b.vx, b.vy) > STOP_SPEED_PX_PER_FRAME),
    );
    if (!stillMoving) {
      world.shotInProgress = false;
      resolveTurnOutcome(world);
      // Hướng lại góc ngắm ban đầu hướng vào bi hợp lệ đầu tiên cho mượt mà
      const cue = world.balls[0];
      const nextTarget = world.balls.find((b) => isBallLegalTarget(world, b, world.currentPlayer));
      if (cue && nextTarget) {
        world.aimAngle = Math.atan2(nextTarget.y - cue.y, nextTarget.x - cue.x);
      }
      hudDirty = true;
    }
  }

  // 6. Hiệu ứng hạt & sóng
  for (const ripple of world.ripples) {
    if (!ripple.active) continue;
    ripple.r += 54 * dtSeconds;
    ripple.alpha = Math.max(0, 0.92 * (1 - ripple.r / ripple.maxR));
    if (ripple.r >= ripple.maxR) {
      ripple.active = false;
    }
  }

  for (const spark of world.sparks) {
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

  for (const ft of world.floatTexts) {
    if (!ft.active) continue;
    ft.ageSec += dtSeconds;
    ft.y -= 24 * dtSeconds;
    if (ft.ageSec >= ft.durationSec) {
      ft.active = false;
    }
  }

  return hudDirty;
}

/**
 * Vẽ 1 viên bi khoáng thạch với khối cầu 3D, dải băng sọc ~52% đường kính (9-15) và lõi số lăn 2 mặt.
 */
function drawSinglePoolBall3D(
  ctx: CanvasRenderingContext2D,
  ball: BilliardBall,
  radius: number,
  rollFx: number,
  rollFy: number,
  rollFz: number,
  rollPx: number,
  rollPy: number,
  rollPz: number,
  alpha = 1,
): void {
  const { spec } = ball;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Bóng đổ mềm hướng tâm xuống mặt nỉ
  ctx.beginPath();
  ctx.arc(ball.x + 2.2, ball.y + 3.0, radius * 1.03, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(7, 15, 12, 0.36)';
  ctx.fill();

  // Clip hình cầu cho thân bi + dải sọc + lõi số
  ctx.save();
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
  ctx.clip();

  if (spec.isStripe) {
    // Bi Sọc (9-15): nền Trắng Sứ #F8F9F7 + dải băng màu quấn quanh xích đạo dày ~52% đường kính bi
    const baseGrad = ctx.createRadialGradient(
      ball.x - radius * 0.32,
      ball.y - radius * 0.32,
      radius * 0.1,
      ball.x,
      ball.y,
      radius,
    );
    baseGrad.addColorStop(0, '#FFFFFF');
    baseGrad.addColorStop(0.65, '#F8F9F7');
    baseGrad.addColorStop(1, '#BCC8C4');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(ball.x - radius, ball.y - radius, radius * 2, radius * 2);

    const poleAngle = Math.atan2(rollPy, rollPx);
    const bandHalfThick = radius * 0.52;
    const bandShift = rollPz * radius * 0.28;

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(poleAngle - Math.PI * 0.5);

    const bandGrad = ctx.createRadialGradient(
      -radius * 0.3,
      bandShift - radius * 0.25,
      radius * 0.08,
      0,
      bandShift,
      radius,
    );
    bandGrad.addColorStop(0, spec.lightHex);
    bandGrad.addColorStop(0.58, spec.colorHex);
    bandGrad.addColorStop(1, spec.shadowHex);
    ctx.fillStyle = bandGrad;
    ctx.fillRect(-radius * 1.2, bandShift - bandHalfThick, radius * 2.4, bandHalfThick * 2);
    ctx.restore();
  } else {
    // Bi Cái (0), Bi Trơn (1-7) & Bi 8 Đen (#141817)
    const bodyGrad = ctx.createRadialGradient(
      ball.x - radius * 0.34,
      ball.y - radius * 0.34,
      radius * 0.1,
      ball.x,
      ball.y,
      radius,
    );
    bodyGrad.addColorStop(0, spec.lightHex);
    bodyGrad.addColorStop(0.56, spec.colorHex);
    bodyGrad.addColorStop(1, spec.shadowHex);
    ctx.fillStyle = bodyGrad;
    ctx.fillRect(ball.x - radius, ball.y - radius, radius * 2, radius * 2);
  }

  // Vẽ lõi số 2 mặt đối xứng (lăn ra sau sẽ hiện mặt đối diện)
  if (ball.id >= 1) {
    const useFront = rollFz >= 0;
    const vx = useFront ? rollFx : -rollFx;
    const vy = useFront ? rollFy : -rollFy;
    const vz = Math.abs(rollFz);

    if (vz > 0.08) {
      const spotX = ball.x + vx * radius * 0.52;
      const spotY = ball.y + vy * radius * 0.52;
      const foreshorten = Math.max(0.32, vz);
      const rotAngle = Math.atan2(vy, vx);
      const coreR = radius * 0.44;

      ctx.save();
      ctx.translate(spotX, spotY);
      ctx.rotate(rotAngle);
      ctx.scale(foreshorten, 1);

      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250, 251, 249, 0.95)';
      ctx.fill();

      ctx.font = `700 ${Math.max(7.5, Math.round(radius * 0.62))}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#141817';
      ctx.fillText(String(ball.id), 0, 0.5);
      ctx.restore();
    }
  } else {
    // Vệt điểm chạm lăn 3D màu Đá Phiến/Đất Nung trên Bi Cái
    if (rollFz > 0.05) {
      const dotX = ball.x + rollFx * radius * 0.5;
      const dotY = ball.y + rollFy * radius * 0.5;
      ctx.beginPath();
      ctx.arc(dotX, dotY, Math.max(1.4, radius * 0.14 * rollFz), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(181, 68, 60, 0.72)';
      ctx.fill();
    }
  }

  // Lớp bóng đổ cầu nhẹ mép dưới phải tăng chiều sâu khối 3D
  const rimGrad = ctx.createRadialGradient(
    ball.x - radius * 0.3,
    ball.y - radius * 0.3,
    radius * 0.35,
    ball.x,
    ball.y,
    radius,
  );
  rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  rimGrad.addColorStop(0.76, 'rgba(0, 0, 0, 0.04)');
  rimGrad.addColorStop(1, 'rgba(5, 10, 8, 0.32)');
  ctx.fillStyle = rimGrad;
  ctx.fillRect(ball.x - radius, ball.y - radius, radius * 2, radius * 2);

  // Vệt lóe sáng thủy tinh góc trên trái
  ctx.beginPath();
  ctx.ellipse(
    ball.x - radius * 0.34,
    ball.y - radius * 0.34,
    radius * 0.28,
    radius * 0.16,
    -Math.PI / 4,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.fill();

  ctx.restore();
  ctx.restore();
}

/**
 * Kết xuất toàn bộ Bàn Bida 3D vát băng, Máng hồi bi cơ khí, 16 bi lăn 3D, Gậy cơ & Tia ngắm chuẩn 8 Ball Pool.
 */
export function renderBilliardsStageFrame(
  ctx: CanvasRenderingContext2D,
  world: BilliardsWorld,
  isDarkTheme: boolean,
): void {
  const { metrics } = world;
  const {
    width,
    height,
    tableWidth,
    railWidth,
    cushionBevelPx,
    feltLeft,
    feltTop,
    feltRight,
    feltBottom,
    feltWidth,
    feltHeight,
    ballRadius,
    pocketRadius,
    headStringX,
    footSpotX,
    centerY,
    pockets,
    pocketJaws,
    returnRailX,
    returnRailW,
    returnRailTopY,
    returnRailBottomY,
    returnBallRadius,
  } = metrics;

  ctx.setTransform(world.dpr, 0, 0, world.dpr, 0, 0);

  // Nền ngoài quanh bàn khớp thẻ bọc (#EEF2F0 / #0D1A14)
  ctx.fillStyle = isDarkTheme ? '#0D1A14' : '#EEF2F0';
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  if (world.shakeRemainingSec > 0) {
    const shakeProgress = world.shakeRemainingSec / TABLE_SHAKE_DURATION_SEC;
    const amp = TABLE_SHAKE_AMP_PX * shakeProgress;
    ctx.translate(
      Math.sin(world.shakeRemainingSec * 190) * amp,
      Math.cos(world.shakeRemainingSec * 155) * amp,
    );
  }

  // 1. MÁNG HỒI BI CƠ KHÍ BÊN PHẢI THÀNH BÀN (Mechanical Ball Return Rail)
  ctx.save();
  // Đường ống nối từ hông phải thành bàn sang máng
  ctx.fillStyle = '#251D19';
  ctx.fillRect(
    tableWidth - 4,
    returnRailTopY - 2,
    returnRailX - tableWidth + returnRailW * 0.5,
    12,
  );

  // Rãnh máng tối bên dưới bi
  ctx.fillStyle = '#0D1412';
  ctx.beginPath();
  ctx.roundRect(returnRailX, returnRailTopY, returnRailW, returnRailBottomY - returnRailTopY, 10);
  ctx.fill();

  // Hai đường ray kim loại đôi mảnh màu Đá Phiến / Đồng Cổ
  const trackLeft = returnRailX + returnRailW * 0.24;
  const trackRight = returnRailX + returnRailW * 0.76;
  ctx.strokeStyle = '#6B7D77';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(trackLeft, returnRailTopY + 6);
  ctx.lineTo(trackLeft, returnRailBottomY - 6);
  ctx.moveTo(trackRight, returnRailTopY + 6);
  ctx.lineTo(trackRight, returnRailBottomY - 6);
  ctx.stroke();

  ctx.strokeStyle = '#9C7A4C';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.roundRect(returnRailX, returnRailTopY, returnRailW, returnRailBottomY - returnRailTopY, 10);
  ctx.stroke();

  // Các viên bi đã ăn lăn trượt & xếp chồng trong máng hồi bi
  const railCenterX = returnRailX + returnRailW * 0.5;
  for (const rb of world.returnRailQueue) {
    if (rb.pendingSec > 0) continue;
    const fakeBall: BilliardBall = {
      id: rb.id,
      spec: rb.spec,
      x: railCenterX,
      y: rb.y,
      vx: 0,
      vy: 0,
      fx: 0,
      fy: Math.sin(rb.rollAngle) * 0.55,
      fz: Math.cos(rb.rollAngle),
      px: 0,
      py: Math.cos(rb.rollAngle),
      pz: Math.sin(rb.rollAngle),
      cushionBouncesThisTurn: 0,
      pocketed: false,
      sinking: false,
      sinkProgress: 0,
      sinkTargetX: 0,
      sinkTargetY: 0,
    };
    drawSinglePoolBall3D(
      ctx,
      fakeBall,
      returnBallRadius,
      fakeBall.fx,
      fakeBall.fy,
      fakeBall.fz,
      fakeBall.px,
      fakeBall.py,
      fakeBall.pz,
    );
  }
  ctx.restore();

  // 2. KHUNG THÀNH GỖ 3D (Outer Wood Rails: Đá Phiến – Óc Chó trầm #2A211C -> #181310)
  const woodGrad = ctx.createLinearGradient(0, 0, 0, height);
  woodGrad.addColorStop(0, '#332822');
  woodGrad.addColorStop(0.18, '#2A211C');
  woodGrad.addColorStop(0.84, '#1D1714');
  woodGrad.addColorStop(1, '#14100E');

  ctx.fillStyle = woodGrad;
  ctx.beginPath();
  ctx.roundRect(0, 0, tableWidth, height, 18);
  ctx.fill();

  // Đường vát cạnh bắt sáng trên và bóng đổ dưới thành gỗ
  ctx.strokeStyle = 'rgba(255, 246, 224, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(1.5, 1.5, tableWidth - 3, height - 3, 17);
  ctx.stroke();

  // 3. 4 ỐP GÓC BO TRÒN & 2 ỐP LỖ GIỮA BẰNG KIM LOẠI ĐỒNG CỔ XƯỚC (#9C7A4C -> #6B5335)
  const bronzeGrad = ctx.createLinearGradient(0, 0, tableWidth, height);
  bronzeGrad.addColorStop(0, '#B8925A');
  bronzeGrad.addColorStop(0.5, '#9C7A4C');
  bronzeGrad.addColorStop(1, '#6B5335');

  const cornerPlateLen = railWidth * 1.65;
  const cornerRadius = 18;
  ctx.fillStyle = bronzeGrad;
  ctx.strokeStyle = 'rgba(255, 246, 224, 0.25)';
  ctx.lineWidth = 1;

  // 4 ốp góc bo tròn
  for (const [cx, cy, sx, sy] of [
    [0, 0, 1, 1],
    [tableWidth, 0, -1, 1],
    [0, height, 1, -1],
    [tableWidth, height, -1, -1],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(cx + sx * cornerRadius, cy);
    ctx.lineTo(cx + sx * cornerPlateLen, cy);
    ctx.lineTo(cx + sx * cornerPlateLen, cy + sy * railWidth);
    ctx.lineTo(cx + sx * railWidth, cy + sy * railWidth);
    ctx.lineTo(cx + sx * railWidth, cy + sy * cornerPlateLen);
    ctx.lineTo(cx, cy + sy * cornerPlateLen);
    ctx.lineTo(cx, cy + sy * cornerRadius);
    ctx.quadraticCurveTo(cx, cy, cx + sx * cornerRadius, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // 2 ốp lỗ giữa bằng Đồng Cổ xước
  const midX = feltLeft + feltWidth * 0.5;
  const midPlateW = pocketRadius * 2.25;
  for (const py of [0, height - railWidth]) {
    ctx.beginPath();
    ctx.roundRect(midX - midPlateW * 0.5, py, midPlateW, railWidth, 4);
    ctx.fill();
    ctx.stroke();
  }

  // 18 Chấm định vị Kim Cương (Diamond Sights) mảnh màu vàng đồng dọc 4 thành bàn (4x3 + 2x3 = 18)
  const drawDiamondSight = (dx: number, dy: number) => {
    const s = 3.3;
    ctx.beginPath();
    ctx.moveTo(dx, dy - s);
    ctx.lineTo(dx + s, dy);
    ctx.lineTo(dx, dy + s);
    ctx.lineTo(dx - s, dy);
    ctx.closePath();
    ctx.fillStyle = '#D5B47A';
    ctx.fill();
  };

  const topRailY = railWidth * 0.44;
  const botRailY = height - railWidth * 0.44;
  const leftRailX = railWidth * 0.44;
  const rightRailX = tableWidth - railWidth * 0.44;

  // 12 chấm dọc 2 băng dài (chia làm 2 đoạn x 3 chấm)
  for (const i of [1, 2, 3, 5, 6, 7] as const) {
    const sx = feltLeft + (feltWidth * i) / 8;
    drawDiamondSight(sx, topRailY);
    drawDiamondSight(sx, botRailY);
  }
  // 6 chấm dọc 2 băng ngắn (mỗi bên 3 chấm)
  for (const j of [1, 2, 3] as const) {
    const sy = feltTop + (feltHeight * j) / 4;
    drawDiamondSight(leftRailX, sy);
    drawDiamondSight(rightRailX, sy);
  }

  // 4. MẶT NỈ BÀN (#214E42 -> #193D34) & BÓNG ĐỔ MỀM TỪ BĂNG (10–14px inner drop shadow)
  const feltAreaLeft = feltLeft - cushionBevelPx;
  const feltAreaTop = feltTop - cushionBevelPx;
  const feltAreaW = feltWidth + cushionBevelPx * 2;
  const feltAreaH = feltHeight + cushionBevelPx * 2;

  const feltGrad = ctx.createRadialGradient(
    feltLeft + feltWidth * 0.5,
    centerY,
    feltHeight * 0.1,
    feltLeft + feltWidth * 0.5,
    centerY,
    Math.hypot(feltWidth, feltHeight) * 0.62,
  );
  feltGrad.addColorStop(0, '#214E42');
  feltGrad.addColorStop(0.7, '#1C443A');
  feltGrad.addColorStop(1, '#193D34');

  ctx.fillStyle = feltGrad;
  ctx.fillRect(feltAreaLeft, feltAreaTop, feltAreaW, feltAreaH);

  // Vạch Khai Cuộc thẳng đứng (Head String tại 25%) & Chấm Khai Cuộc (Foot Spot tại 75%)
  ctx.save();
  ctx.strokeStyle = 'rgba(250, 251, 249, 0.2)';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(headStringX, feltTop + 2);
  ctx.lineTo(headStringX, feltBottom - 2);
  ctx.stroke();

  for (const sx of [headStringX, feltLeft + feltWidth * 0.5, footSpotX]) {
    ctx.beginPath();
    ctx.arc(sx, centerY, sx === footSpotX ? 3.2 : 2.2, 0, Math.PI * 2);
    ctx.fillStyle = sx === footSpotX ? 'rgba(250, 251, 249, 0.36)' : 'rgba(250, 251, 249, 0.2)';
    ctx.fill();
  }
  ctx.restore();

  // 5. 6 ĐOẠN BĂNG NỈ HÌNH THANG VÁT GÓC 45° HƯỚNG VÀO MIỆNG LỖ (#27584B -> #16362E) + ĐỔ BÓNG LÊN MẶT NỈ
  const cornerGap = pocketRadius * 1.1;
  const sideGap = pocketRadius * 0.98;
  const bevel = cushionBevelPx;

  const trapezoids: readonly {
    readonly pts: readonly (readonly [number, number])[];
    readonly lightEdge: readonly [number, number, number, number];
  }[] = [
    // Băng trên trái
    {
      pts: [
        [feltLeft + cornerGap - bevel, feltTop - bevel],
        [midX - sideGap + bevel * 0.5, feltTop - bevel],
        [midX - sideGap, feltTop],
        [feltLeft + cornerGap, feltTop],
      ],
      lightEdge: [feltLeft + cornerGap, feltTop, midX - sideGap, feltTop],
    },
    // Băng trên phải
    {
      pts: [
        [midX + sideGap - bevel * 0.5, feltTop - bevel],
        [feltRight - cornerGap + bevel, feltTop - bevel],
        [feltRight - cornerGap, feltTop],
        [midX + sideGap, feltTop],
      ],
      lightEdge: [midX + sideGap, feltTop, feltRight - cornerGap, feltTop],
    },
    // Băng dưới trái
    {
      pts: [
        [feltLeft + cornerGap, feltBottom],
        [midX - sideGap, feltBottom],
        [midX - sideGap + bevel * 0.5, feltBottom + bevel],
        [feltLeft + cornerGap - bevel, feltBottom + bevel],
      ],
      lightEdge: [feltLeft + cornerGap, feltBottom, midX - sideGap, feltBottom],
    },
    // Băng dưới phải
    {
      pts: [
        [midX + sideGap, feltBottom],
        [feltRight - cornerGap, feltBottom],
        [feltRight - cornerGap + bevel, feltBottom + bevel],
        [midX + sideGap - bevel * 0.5, feltBottom + bevel],
      ],
      lightEdge: [midX + sideGap, feltBottom, feltRight - cornerGap, feltBottom],
    },
    // Băng trái
    {
      pts: [
        [feltLeft - bevel, feltTop + cornerGap - bevel],
        [feltLeft, feltTop + cornerGap],
        [feltLeft, feltBottom - cornerGap],
        [feltLeft - bevel, feltBottom - cornerGap + bevel],
      ],
      lightEdge: [feltLeft, feltTop + cornerGap, feltLeft, feltBottom - cornerGap],
    },
    // Băng phải
    {
      pts: [
        [feltRight, feltTop + cornerGap],
        [feltRight + bevel, feltTop + cornerGap - bevel],
        [feltRight + bevel, feltBottom - cornerGap + bevel],
        [feltRight, feltBottom - cornerGap],
      ],
      lightEdge: [feltRight, feltTop + cornerGap, feltRight, feltBottom - cornerGap],
    },
  ];

  // Đổ bóng mềm từ 6 đoạn băng lên mặt nỉ (12px inner shadow)
  for (const trap of trapezoids) {
    ctx.save();
    ctx.beginPath();
    trap.pts.forEach(([x, y], idx) => {
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    ctx.shadowColor = 'rgba(6, 14, 12, 0.55)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3;

    const trapGrad = ctx.createLinearGradient(
      trap.pts[0]![0],
      trap.pts[0]![1],
      trap.pts[2]![0],
      trap.pts[2]![1],
    );
    trapGrad.addColorStop(0, '#27584B');
    trapGrad.addColorStop(1, '#16362E');
    ctx.fillStyle = trapGrad;
    ctx.fill();
    ctx.restore();

    // Đường sáng mép vát mũi băng
    ctx.strokeStyle = 'rgba(130, 195, 175, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(trap.lightEdge[0], trap.lightEdge[1]);
    ctx.lineTo(trap.lightEdge[2], trap.lightEdge[3]);
    ctx.stroke();
  }

  // 6. 6 HỐC LỖ KHOÉT SÂU (#09100E) + VIỀN DA/ĐỒNG BÁN NGUYỆT & 12 CHỐT BO MIỆNG LỖ
  for (const pocket of pockets) {
    // Hốc khoét ăn sâu vào thành gỗ
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocketRadius + 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#5B452A';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocketRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#09100E';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, pocketRadius * 0.82, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(156, 122, 76, 0.36)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  for (const jaw of pocketJaws) {
    ctx.beginPath();
    ctx.arc(jaw.x, jaw.y, jaw.r, 0, Math.PI * 2);
    ctx.fillStyle = '#9C7A4C';
    ctx.fill();
    ctx.strokeStyle = '#14100E';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  for (const ripple of world.ripples) {
    if (!ripple.active) continue;
    ctx.save();
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(213, 180, 122, ${ripple.alpha.toFixed(3)})`;
    ctx.lineWidth = 1.8;
    ctx.stroke();
    ctx.restore();
  }

  // 7. Vòng đặt bi cái Ball-in-Hand
  const cueBall = world.balls[0];
  if (world.ballInHand && !world.rackCleared) {
    const preview = clampValidCueBallPlacement(world, world.hoverPlaceX, world.hoverPlaceY);
    ctx.save();
    ctx.beginPath();
    ctx.arc(preview.x, preview.y, ballRadius + 5, 0, Math.PI * 2);
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 8. VẼ 16 VIÊN BI KHOÁNG THẠCH LĂN 3D
  for (const ball of world.balls) {
    if (ball.pocketed) continue;
    const scale = ball.sinking ? Math.max(0.2, 1 - ball.sinkProgress * 0.78) : 1;
    const alpha = ball.sinking ? Math.max(0.15, 1 - ball.sinkProgress * 0.85) : 1;
    drawSinglePoolBall3D(
      ctx,
      ball,
      ballRadius * scale,
      ball.fx,
      ball.fy,
      ball.fz,
      ball.px,
      ball.py,
      ball.pz,
      alpha,
    );
  }

  // 9. TIA NGẮM CHUẨN 8 BALL POOL + GẬY CƠ LUÔN HIỆN KHI ĐẾN LƯỢT
  const drawCueStickAt = (
    originX: number,
    originY: number,
    shotDirX: number,
    shotDirY: number,
    tipOffsetPx: number,
  ) => {
    const cueAngle = Math.atan2(-shotDirY, -shotDirX);
    const cueLength = Math.min(235, feltWidth * 0.31);

    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(cueAngle);

    ctx.beginPath();
    ctx.moveTo(tipOffsetPx + 2, 4);
    ctx.lineTo(tipOffsetPx + cueLength + 2, 5);
    ctx.strokeStyle = 'rgba(6, 12, 10, 0.42)';
    ctx.lineWidth = 6.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    const cueGrad = ctx.createLinearGradient(tipOffsetPx, 0, tipOffsetPx + cueLength, 0);
    cueGrad.addColorStop(0, '#3B7A65'); // Đầu lơ Ngọc Bích
    cueGrad.addColorStop(0.02, '#FAFBF9'); // Đầu bịt sứ
    cueGrad.addColorStop(0.045, '#9C7A4C'); // Khâu đồng
    cueGrad.addColorStop(0.55, '#D2B486'); // Ngọn gỗ Phong sáng
    cueGrad.addColorStop(0.58, '#9C7A4C'); // Vạch khảm đồng
    cueGrad.addColorStop(1, '#1A2B26'); // Chuôi Đá Phiến Trầm

    ctx.beginPath();
    ctx.moveTo(tipOffsetPx, -2.0);
    ctx.lineTo(tipOffsetPx + cueLength, -4.6);
    ctx.lineTo(tipOffsetPx + cueLength, 4.6);
    ctx.lineTo(tipOffsetPx, 2.0);
    ctx.closePath();
    ctx.fillStyle = cueGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(156, 122, 76, 0.55)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  };

  const canShowPlayerOrAiCue =
    cueBall &&
    !cueBall.pocketed &&
    !world.shotInProgress &&
    !world.rackCleared &&
    !world.ballInHand &&
    !world.strikeAnim.active;

  if (canShowPlayerOrAiCue) {
    const dirX = Math.cos(world.aimAngle);
    const dirY = Math.sin(world.aimAngle);
    const raycast = computeGhostBallRaycast(
      cueBall,
      dirX,
      dirY,
      world.spinX,
      world.spinY,
      world.balls,
      metrics,
    );

    const isIllegalHit =
      raycast.hitBall !== null && !isBallLegalTarget(world, raycast.hitBall, world.currentPlayer);

    // Đường ngắm nét Trắng tinh khiết 2px có viền tối mảnh bao ngoài (rgba(12, 22, 19, 0.65), 3.6px)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cueBall.x, cueBall.y);
    ctx.lineTo(raycast.ghostX, raycast.ghostY);
    ctx.strokeStyle = 'rgba(12, 22, 19, 0.65)';
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.strokeStyle = isIllegalHit ? '#E05247' : '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Vòng tròn Bi Ảo (Ghost Ball) hoặc Biểu tượng vòng tròn dấu chéo đỏ (⊘) khi ngắm nhầm bi đối thủ
    if (isIllegalHit) {
      ctx.beginPath();
      ctx.arc(raycast.ghostX, raycast.ghostY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(224, 82, 71, 0.2)';
      ctx.fill();
      ctx.strokeStyle = '#E05247';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      const slashR = ballRadius * 0.66;
      ctx.beginPath();
      ctx.moveTo(raycast.ghostX - slashR, raycast.ghostY - slashR);
      ctx.lineTo(raycast.ghostX + slashR, raycast.ghostY + slashR);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(raycast.ghostX, raycast.ghostY, ballRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(12, 22, 19, 0.65)';
      ctx.lineWidth = 3.4;
      ctx.stroke();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Tia lệch hướng bi cái (ngắn, điều chỉnh theo Cù lê / Trô)
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(raycast.ghostX, raycast.ghostY);
      ctx.lineTo(
        raycast.ghostX + raycast.cueDeflectX * GHOST_CUE_VECTOR_LEN_PX,
        raycast.ghostY + raycast.cueDeflectY * GHOST_CUE_VECTOR_LEN_PX,
      );
      ctx.strokeStyle = 'rgba(250, 251, 249, 0.62)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.setLineDash([]);

      // Tia bật dự đoán hướng bi mục tiêu (dài sắc nét)
      if (raycast.hitBall) {
        const guideLen = ballRadius * 5.2;
        const startX = raycast.hitBall.x;
        const startY = raycast.hitBall.y;
        const endX = startX + raycast.targetDirX * guideLen;
        const endY = startY + raycast.targetDirY * guideLen;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = 'rgba(12, 22, 19, 0.65)';
        ctx.lineWidth = 3.6;
        ctx.stroke();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(endX, endY, 2.8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    }

    // Nhãn nhỏ VI CHỈNH khi giữ Shift
    if (world.isPrecisionAim) {
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#EED08E';
      ctx.fillText('VI CHỈNH', cueBall.x + ballRadius + 12, cueBall.y - ballRadius - 8);
    }
    ctx.restore();

    // Gậy cơ luôn hiển thị sát bi cái và lùi ra sau theo thanh lực dọc bên trái
    const tipOffset = ballRadius + 7 + world.dragPullPower * 52;
    drawCueStickAt(cueBall.x, cueBall.y, dirX, dirY, tipOffset);
  } else if (world.strikeAnim.active && cueBall && !cueBall.pocketed) {
    const progress = Math.min(1, world.strikeAnim.elapsedSec / world.strikeAnim.durationSec);
    const eased = 1 - Math.pow(1 - progress, 3);
    const tipOffset = world.strikeAnim.pullBackOffsetPx * (1 - eased) + ballRadius * eased;
    drawCueStickAt(cueBall.x, cueBall.y, world.strikeAnim.dirX, world.strikeAnim.dirY, tipOffset);
  }

  // 10. Tia sáng va chạm, bụi phấn lơ #DCEAE6 & chữ nổi pha đánh đẹp
  for (const spark of world.sparks) {
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

  for (const ft of world.floatTexts) {
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
}
