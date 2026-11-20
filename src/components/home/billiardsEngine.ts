import {
  playBallClack,
  playCushionBounce,
  playJawRattle,
  playMarbleRoll,
  playPocketDrop,
  playTrickShotReward,
  updateBilliardRollingSound,
} from '@/utils/billiardAudio';
import {
  applyCushionEnglishBounce,
  BALL_RESTITUTION,
  BREAK_HIGH_SPEED_THRESHOLD,
  computeCueSquirtOffsetRad,
  computePhysicsScale,
  CUSHION_RESTITUTION,
  INITIAL_RACK_GAP_PX,
  initializeCueBallShot,
  integrateClothSlideToRollSubstep,
  JAW_RADIUS_PX,
  JAW_RESTITUTION,
  MAX_SHOT_SPEED_PX_PER_FRAME,
  resolveRigidBallPairCollision,
  STOP_SPEED_PX_PER_FRAME,
  SUBSTEPS,
  type RigidBallMotion,
} from '@/utils/billiardPhysics';
import {
  computeLongStringSpotPosition,
  evaluateWpaShot,
  STALEMATE_TURN_THRESHOLD,
  type EightOnBreakChoice,
  type IllegalBreakChoice,
  type PendingRefereeDecision,
  type PocketedBallRecord,
  type RefereeLogEntry,
  type WpaRuleSet,
} from '@/utils/billiardRules';

export {
  BALL_RESTITUTION,
  CUSHION_RESTITUTION,
  INITIAL_RACK_GAP_PX,
  JAW_RADIUS_PX,
  JAW_RESTITUTION,
  MAX_SHOT_SPEED_PX_PER_FRAME,
  STALEMATE_TURN_THRESHOLD,
  STOP_SPEED_PX_PER_FRAME,
  SUBSTEPS,
  type EightOnBreakChoice,
  type IllegalBreakChoice,
  type PendingRefereeDecision,
  type RefereeLogEntry,
  type WpaRuleSet,
};

export type BilliardGameMode = 'vs-ai' | 'two-player' | 'free';
export type BallGroup = 'solids' | 'stripes';
export type GuidelineMode = 'full' | 'club' | 'pro';
export type AiDifficulty = 'rookie' | 'club' | 'pro';
export type BallInHandScope = 'full' | 'kitchen';

export const POCKET_SINK_DURATION_SEC = 0.19;
export const STRIKE_ANIM_DURATION_SEC = 0.07;
export const CHALK_DUST_DURATION_SEC = 0.35;
export const CHALK_STREAK_DURATION_SEC = 0.24;
export const TABLE_SHAKE_DURATION_SEC = 0.13;
export const TABLE_SHAKE_AMP_PX = 2.5;
export const GHOST_CUE_VECTOR_LEN_PX = 42;
export const OBJECT_GUIDE_VECTOR_LEN_PX = 64;
export const PRECISION_AIM_FACTOR = 0.25;
export const FINE_AIM_STEP_RAD = (0.15 * Math.PI) / 180;
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
  /** Vận tốc lăn tương đương bề mặt cầu tiếp xúc mặt nỉ (lăn thuần túy khi sx == vx, sy == vy). */
  sx: number;
  sy: number;
  /** Độ xoáy ngang Ép phê omega_z trong [-1, 1]. */
  omegaZ: number;
  // Ma trận trực chuẩn 3x3 định hướng 3D (frontVec, poleVec, rightVec)
  fx: number;
  fy: number;
  fz: number;
  px: number;
  py: number;
  pz: number;
  rx: number;
  ry: number;
  rz: number;
  cushionBouncesThisTurn: number;
  pocketed: boolean;
  sinking: boolean;
  sinkProgress: number;
  sinkTargetX: number;
  sinkTargetY: number;
  sinkAngle: number;
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

export interface PocketFacingSegment {
  readonly id: number;
  readonly pocketId: number;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly nx: number;
  readonly ny: number;
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

export interface ChalkStreak {
  active: boolean;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  ageSec: number;
  maxAgeSec: number;
}

export interface FeltToastEvent {
  active: boolean;
  text: string;
  tone: 'info' | 'foul' | 'reward';
  seq: number;
}

export interface TableSurfaceCache {
  canvas: HTMLCanvasElement | OffscreenCanvas | null;
  width: number;
  height: number;
  dpr: number;
  isDarkTheme: boolean;
}

export interface AiTurnPlan {
  phase: 'idle' | 'aiming' | 'charging';
  elapsedSec: number;
  targetAngle: number;
  startAngle: number;
  targetPower: number;
  targetSpinX: number;
  targetSpinY: number;
  placeX: number | null;
  placeY: number | null;
  calledPocketId: number | null;
  isSafety: boolean;
}

export interface TableMetrics {
  width: number;
  height: number;
  tableLeft: number;
  tableTop: number;
  tableWidth: number;
  tableHeight: number;
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
  cornerMouthOffset: number;
  sideMouthOffset: number;
  cornerDropRadius: number;
  sideDropRadius: number;
  physicsScale: number;
  headStringX: number;
  footSpotX: number;
  centerY: number;
  pockets: PocketNode[];
  pocketJaws: PocketJawNode[];
  pocketFacings: PocketFacingSegment[];
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
  readonly launchDirX: number;
  readonly launchDirY: number;
  readonly targetDirX: number;
  readonly targetDirY: number;
  readonly cueDeflectX: number;
  readonly cueDeflectY: number;
  readonly cueCurveCtrlX: number;
  readonly cueCurveCtrlY: number;
  readonly cueCurveEndX: number;
  readonly cueCurveEndY: number;
  readonly cuePathPoints: readonly { readonly x: number; readonly y: number }[];
}

export interface BilliardsWorld {
  metrics: TableMetrics;
  dpr: number;
  gameMode: BilliardGameMode;
  guidelineMode: GuidelineMode;
  aiDifficulty: AiDifficulty;
  ruleSet: WpaRuleSet;
  isSafetyActive: boolean;
  balls: BilliardBall[];
  returnRailQueue: ReturnRailBall[];
  ripples: PocketRipple[];
  rippleCursor: number;
  sparks: SparkParticle[];
  sparkCursor: number;
  chalkStreaks: ChalkStreak[];
  chalkCursor: number;
  floatTexts: FloatingBannerText[];
  floatCursor: number;
  toastEvent: FeltToastEvent;
  staticTableCache: TableSurfaceCache;
  aimAngle: number;
  dragPullPower: number;
  isDraggingAim: boolean;
  dragPrevX: number;
  dragPrevY: number;
  isPrecisionAim: boolean;
  hoverPlaceX: number;
  hoverPlaceY: number;
  hoverPlaceValid: boolean;
  spinX: number;
  spinY: number;
  activeCueSpinX: number;
  activeCueSpinY: number;
  activeShotDirX: number;
  activeShotDirY: number;
  cueHasHitBallThisTurn: boolean;
  firstHitBallIdThisTurn: number | null;
  firstHitWasInKitchenThisTurn: boolean;
  allLegalTargetsInKitchenAtStart: boolean;
  railOrPocketAfterFirstHitThisTurn: boolean;
  breakRailHitBallIds: number[];
  pocketedIdsThisTurn: number[];
  pocketedPocketMapThisTurn: Record<number, number>;
  eightBallPocketedId: number | null;
  calledEightPocketId: number | null;
  calledRegularPocketId: number | null;
  ballInHandScope: BallInHandScope;
  mustShootOutOfKitchen: boolean;
  cueCrossedHeadStringThisTurn: boolean;
  pendingDecision: PendingRefereeDecision | null;
  consecutiveNonPottingTurns: number;
  stalemateOffered: boolean;
  refereeLog: RefereeLogEntry[];
  refereeLogSeq: number;
  isDraggingCueInKitchen: boolean;
  cueBallHovered: boolean;
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
  const safeW = Math.max(420, width);
  const safeH = Math.max(220, height);

  // Khoảng đệm biên gọn (~22-26px) đủ cho bóng đổ 3D và phần chuôi cơ vươn nhẹ qua thành gỗ
  const outerMarginX = Math.max(20, Math.min(26, Math.round(safeW * 0.02)));
  const outerMarginY = Math.max(18, Math.min(24, Math.round(safeH * 0.036)));
  const tableLeft = outerMarginX;
  const tableTop = outerMarginY;
  const tableBottomPad = outerMarginY;
  const tableHeight = Math.max(170, safeH - tableTop - tableBottomPad);

  // Ước lượng sơ bộ để khóa máng hồi bi 2 ray bên phải bám sát thành bàn (width = 2 * R_ball + 10px)
  const returnRailGap = 8;
  const returnRailRightPad = outerMarginX;
  const approxRailW = Math.max(18, Math.min(34, Math.round(tableHeight * 0.07)));
  const approxFeltW = Math.max(
    240,
    safeW - tableLeft - returnRailGap - 40 - returnRailRightPad - approxRailW * 2,
  );
  const estBallR = Math.max(9.5, Math.min(20.5, approxFeltW * 0.0172));
  const estReturnRailW = Math.round(estBallR * 2 + 10);

  const tableWidth = Math.max(
    320,
    safeW - tableLeft - returnRailGap - estReturnRailW - returnRailRightPad,
  );
  const railWidth = Math.max(
    18,
    Math.min(34, Math.round(Math.min(tableWidth * 0.034, tableHeight * 0.07))),
  );
  const cushionBevelPx = Math.max(5.5, Math.min(9.5, Math.round(railWidth * 0.28)));

  const feltLeft = tableLeft + railWidth;
  const feltTop = tableTop + railWidth;
  const feltRight = tableLeft + tableWidth - railWidth;
  const feltBottom = tableTop + tableHeight - railWidth;
  const feltWidth = Math.max(240, feltRight - feltLeft);
  const feltHeight = Math.max(115, feltBottom - feltTop);

  // Tỷ lệ bi & lỗ chuẩn WPA (miệng lỗ góc ~2.13D, miệng lỗ giữa ~2.35D rộng hơn lỗ góc, má vát 142° & 104°)
  const ballRadius = Math.max(9.5, Math.min(20.5, feltWidth * 0.0172));
  const pocketRadius = ballRadius * 1.65;
  const jawRadius = Math.max(2.6, Math.min(4.2, ballRadius * 0.2));
  const cornerMouthOffset = ballRadius * 3.1;
  const sideMouthOffset = ballRadius * 2.55;
  const cornerDropRadius = ballRadius * 1.66;
  const sideDropRadius = ballRadius * 1.54;
  const physicsScale = computePhysicsScale(feltWidth);
  const returnRailW = Math.round(ballRadius * 2 + 10);

  // Vạch khai cuộc thẳng tại 25% và chấm khai cuộc tại 75%
  const headStringX = feltLeft + feltWidth * 0.25;
  const footSpotX = feltLeft + feltWidth * 0.75;
  const centerY = feltTop + feltHeight * 0.5;

  const midX = feltLeft + feltWidth * 0.5;
  const cornerRecess = ballRadius * 0.22;
  const sideRecess = ballRadius * 0.88;
  const pockets: PocketNode[] = [
    { id: 0, x: feltLeft - cornerRecess, y: feltTop - cornerRecess, isCorner: true },
    { id: 1, x: midX, y: feltTop - sideRecess, isCorner: false },
    { id: 2, x: feltRight + cornerRecess, y: feltTop - cornerRecess, isCorner: true },
    { id: 3, x: feltLeft - cornerRecess, y: feltBottom + cornerRecess, isCorner: true },
    { id: 4, x: midX, y: feltBottom + sideRecess, isCorner: false },
    { id: 5, x: feltRight + cornerRecess, y: feltBottom + cornerRecess, isCorner: true },
  ];

  // 12 chốt bo tròn mũi băng đặt tiếp tuyến C1 lùi vào trong thân băng (không nhô ra cản bi lăn dọc băng!)
  const rawJaws: { x: number; y: number }[] = [
    { x: feltLeft + cornerMouthOffset, y: feltTop - jawRadius },
    { x: feltLeft - jawRadius, y: feltTop + cornerMouthOffset },
    { x: midX - sideMouthOffset, y: feltTop - jawRadius },
    { x: midX + sideMouthOffset, y: feltTop - jawRadius },
    { x: feltRight - cornerMouthOffset, y: feltTop - jawRadius },
    { x: feltRight + jawRadius, y: feltTop + cornerMouthOffset },
    { x: feltLeft + cornerMouthOffset, y: feltBottom + jawRadius },
    { x: feltLeft - jawRadius, y: feltBottom - cornerMouthOffset },
    { x: midX - sideMouthOffset, y: feltBottom + jawRadius },
    { x: midX + sideMouthOffset, y: feltBottom + jawRadius },
    { x: feltRight - cornerMouthOffset, y: feltBottom + jawRadius },
    { x: feltRight + jawRadius, y: feltBottom - cornerMouthOffset },
  ];

  const pocketJaws: PocketJawNode[] = rawJaws.map((pt, idx) => ({
    id: idx,
    x: pt.x,
    y: pt.y,
    r: jawRadius,
  }));

  // 12 đoạn má vát hàm lỗ (142° cho 4 lỗ góc, 104° cho 2 lỗ giữa) có pháp tuyến hướng vào lòng hốc lỗ
  const makeFacing = (
    id: number,
    pocketId: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    towardX: number,
    towardY: number,
  ): PocketFacingSegment => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len;
    let ny = dx / len;
    const midFX = (x1 + x2) * 0.5;
    const midFY = (y1 + y2) * 0.5;
    if ((towardX - midFX) * nx + (towardY - midFY) * ny < 0) {
      nx = -nx;
      ny = -ny;
    }
    return { id, pocketId, x1, y1, x2, y2, nx, ny };
  };

  const cos38 = Math.cos((38 * Math.PI) / 180);
  const sin38 = Math.sin((38 * Math.PI) / 180);
  const sin14 = Math.sin((14 * Math.PI) / 180);
  const cos14 = Math.cos((14 * Math.PI) / 180);
  const cornerFacingLen = ballRadius * 1.95;
  const sideFacingLen = ballRadius * 1.65;

  const pocketFacings: PocketFacingSegment[] = [];
  let facingId = 0;

  for (const [pocketId, cx, cy, sx, sy] of [
    [0, feltLeft, feltTop, 1, 1],
    [2, feltRight, feltTop, -1, 1],
    [3, feltLeft, feltBottom, 1, -1],
    [5, feltRight, feltBottom, -1, -1],
  ] as const) {
    const throatX = cx + sx * cornerMouthOffset * 0.5;
    const throatY = cy + sy * cornerMouthOffset * 0.5;
    const jhx = cx + sx * cornerMouthOffset;
    const jhy = cy;
    pocketFacings.push(
      makeFacing(
        facingId++,
        pocketId,
        jhx,
        jhy,
        jhx - sx * cos38 * cornerFacingLen,
        jhy - sy * sin38 * cornerFacingLen,
        throatX,
        throatY,
      ),
    );
    const jvx = cx;
    const jvy = cy + sy * cornerMouthOffset;
    pocketFacings.push(
      makeFacing(
        facingId++,
        pocketId,
        jvx,
        jvy,
        jvx - sx * sin38 * cornerFacingLen,
        jvy - sy * cos38 * cornerFacingLen,
        throatX,
        throatY,
      ),
    );
  }

  for (const [pocketId, ry, sy] of [
    [1, feltTop, 1],
    [4, feltBottom, -1],
  ] as const) {
    const throatX = midX;
    const throatY = ry;
    const jlx = midX - sideMouthOffset;
    pocketFacings.push(
      makeFacing(
        facingId++,
        pocketId,
        jlx,
        ry,
        jlx + sin14 * sideFacingLen,
        ry - sy * cos14 * sideFacingLen,
        throatX,
        throatY,
      ),
    );
    const jrx = midX + sideMouthOffset;
    pocketFacings.push(
      makeFacing(
        facingId++,
        pocketId,
        jrx,
        ry,
        jrx - sin14 * sideFacingLen,
        ry - sy * cos14 * sideFacingLen,
        throatX,
        throatY,
      ),
    );
  }

  // Chiều cao máng hồi bi bằng đúng chiều cao thành gỗ bên phải (tableTop -> tableTop + tableHeight)
  const returnRailX = tableLeft + tableWidth + returnRailGap;
  const returnRailTopY = tableTop;
  const returnRailBottomY = tableTop + tableHeight;
  const usableStackHeight = Math.max(120, returnRailBottomY - returnRailTopY - 26);
  const maxFitRadiusFor15 = usableStackHeight / (15 * 2.04);
  const returnBallRadius = Math.max(
    5.5,
    Math.min(ballRadius * 0.88, maxFitRadiusFor15, (returnRailW - 6) * 0.5),
  );

  return {
    width: safeW,
    height: safeH,
    tableLeft,
    tableTop,
    tableWidth,
    tableHeight,
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
    cornerMouthOffset,
    sideMouthOffset,
    cornerDropRadius,
    sideDropRadius,
    physicsScale,
    headStringX,
    footSpotX,
    centerY,
    pockets,
    pocketJaws,
    pocketFacings,
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
 * - Khóa khoảng cách tâm giữa các bi = 2 * R_ball + 0.6px để 15 bi đứng yên tuyệt đối 100% trước cú phá bi.
 */
export function buildOfficial15BallRack(metrics: TableMetrics): BilliardBall[] {
  const r = metrics.ballRadius;
  const spacing = r * 2 + INITIAL_RACK_GAP_PX;
  const colGapY = spacing;
  const rowGapX = (Math.sqrt(3) / 2) * spacing;

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
    // Khởi tạo trực chuẩn 3x3 với mặt số hướng thẳng về camera (fz = 1) và góc xoay nhẹ tự nhiên
    const tilt = ((spec.number * 0.45) % 0.8) - 0.4;
    const ux = Math.sin(tilt);
    const uy = Math.cos(tilt);
    // right = pole x front, front = (0, 0, 1) => right = (uy, -ux, 0)
    return {
      id: spec.number,
      spec,
      x,
      y,
      vx: 0,
      vy: 0,
      sx: 0,
      sy: 0,
      omegaZ: 0,
      fx: 0,
      fy: 0,
      fz: 1,
      px: ux,
      py: uy,
      pz: 0,
      rx: uy,
      ry: -ux,
      rz: 0,
      cushionBouncesThisTurn: 0,
      pocketed: false,
      sinking: false,
      sinkProgress: 0,
      sinkTargetX: 0,
      sinkTargetY: 0,
      sinkAngle: 0,
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

/**
 * Phép quay cầu 3D chính xác (Ma trận xoay 3x3 trực chuẩn hóa) quanh trục ngang (-dy, dx, 0)
 * kết hợp phép quay trục đứng Z theo độ xoáy ngang omegaZ (ép phê).
 */
export function advanceBallRolling3D(
  ball: BilliardBall,
  dx: number,
  dy: number,
  radius: number,
  dSpinZRad = 0,
): void {
  const dist = Math.hypot(dx, dy);
  if (dist >= 1e-4 && radius > 0) {
    const dTheta = dist / radius;
    const ux = -dy / dist;
    const uy = dx / dist;
    const cosT = Math.cos(dTheta);
    const sinT = Math.sin(dTheta);

    const [nfx, nfy, nfz] = rotateVectorByAxis(ball.fx, ball.fy, ball.fz, ux, uy, cosT, sinT);
    const [npx, npy, npz] = rotateVectorByAxis(ball.px, ball.py, ball.pz, ux, uy, cosT, sinT);

    // Tái trực chuẩn hóa Right = Pole × Front để triệt tiêu trôi số dấu phẩy động
    const rrx = npy * nfz - npz * nfy;
    const rry = npz * nfx - npx * nfz;
    const rrz = npx * nfy - npy * nfx;
    const rLen = Math.hypot(rrx, rry, rrz) || 1;
    const rx = rrx / rLen;
    const ry = rry / rLen;
    const rz = rrz / rLen;

    // Tái lập Pole = Front × Right để bảo toàn ma trận trực chuẩn 3x3 tuyệt đối
    const ppx = nfy * rz - nfz * ry;
    const ppy = nfz * rx - nfx * rz;
    const ppz = nfx * ry - nfy * rx;

    ball.fx = nfx;
    ball.fy = nfy;
    ball.fz = nfz;
    ball.px = ppx;
    ball.py = ppy;
    ball.pz = ppz;
    ball.rx = rx;
    ball.ry = ry;
    ball.rz = rz;
  }

  if (Math.abs(dSpinZRad) > 1e-5) {
    const cz = Math.cos(dSpinZRad);
    const sz = Math.sin(dSpinZRad);
    const fx = ball.fx * cz - ball.fy * sz;
    const fy = ball.fx * sz + ball.fy * cz;
    const px = ball.px * cz - ball.py * sz;
    const py = ball.px * sz + ball.py * cz;
    const rx = ball.rx * cz - ball.ry * sz;
    const ry = ball.rx * sz + ball.ry * cz;
    ball.fx = fx;
    ball.fy = fy;
    ball.px = px;
    ball.py = py;
    ball.rx = rx;
    ball.ry = ry;
  }
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
    guidelineMode: 'full',
    aiDifficulty: 'club',
    ruleSet: 'club',
    isSafetyActive: false,
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
    chalkStreaks: Array.from({ length: 6 }, () => ({
      active: false,
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      ageSec: 0,
      maxAgeSec: CHALK_STREAK_DURATION_SEC,
    })),
    chalkCursor: 0,
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
    toastEvent: {
      active: false,
      text: '',
      tone: 'info',
      seq: 0,
    },
    staticTableCache: {
      canvas: null,
      width: 0,
      height: 0,
      dpr: 1,
      isDarkTheme: false,
    },
    aimAngle: 0,
    dragPullPower: 0,
    isDraggingAim: false,
    dragPrevX: 0,
    dragPrevY: 0,
    isPrecisionAim: false,
    hoverPlaceX: metrics.headStringX,
    hoverPlaceY: metrics.centerY,
    hoverPlaceValid: true,
    spinX: 0,
    spinY: 0,
    activeCueSpinX: 0,
    activeCueSpinY: 0,
    activeShotDirX: 1,
    activeShotDirY: 0,
    cueHasHitBallThisTurn: false,
    firstHitBallIdThisTurn: null,
    firstHitWasInKitchenThisTurn: false,
    allLegalTargetsInKitchenAtStart: false,
    railOrPocketAfterFirstHitThisTurn: false,
    breakRailHitBallIds: [],
    pocketedIdsThisTurn: [],
    pocketedPocketMapThisTurn: {},
    eightBallPocketedId: null,
    calledEightPocketId: null,
    calledRegularPocketId: null,
    ballInHandScope: 'full',
    mustShootOutOfKitchen: false,
    cueCrossedHeadStringThisTurn: false,
    pendingDecision: null,
    consecutiveNonPottingTurns: 0,
    stalemateOffered: false,
    refereeLog: [],
    refereeLogSeq: 0,
    isDraggingCueInKitchen: false,
    cueBallHovered: false,
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
      targetSpinX: 0,
      targetSpinY: 0,
      placeX: null,
      placeY: null,
      calledPocketId: null,
      isSafety: false,
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

export function pushRefereeLog(world: BilliardsWorld, entry: Omit<RefereeLogEntry, 'seq'>): void {
  world.refereeLogSeq += 1;
  world.refereeLog = [{ seq: world.refereeLogSeq, ...entry }, ...world.refereeLog].slice(0, 20);
}

export function isShootingForEightBall(world: BilliardsWorld, player: 1 | 2): boolean {
  if (world.gameMode === 'free' || world.rackCleared) return false;
  const group = getPlayerGroup(world, player);
  if (group === null || !hasClearedGroup(world, group)) return false;
  const eight = world.balls.find((b) => b.id === 8);
  return Boolean(eight && !eight.pocketed);
}

export function isCallPocketRequired(world: BilliardsWorld, player: 1 | 2): boolean {
  if (world.gameMode === 'free' || world.rackCleared || world.isBreakShot) return false;
  if (isShootingForEightBall(world, player)) return true;
  return world.ruleSet === 'wpa-pro' && !world.isSafetyActive;
}

export function areAllLegalTargetsInKitchen(world: BilliardsWorld, player: 1 | 2): boolean {
  const legal = world.balls.filter((b) => isBallLegalTarget(world, b, player));
  if (legal.length === 0) return false;
  return legal.every((b) => b.x <= world.metrics.headStringX + 0.5);
}

export function isBallKitchenExempted(
  world: BilliardsWorld,
  ball: BilliardBall,
  player: 1 | 2,
): boolean {
  if (!world.mustShootOutOfKitchen) return true;
  if (ball.x > world.metrics.headStringX + 0.5) return true;
  const legal = world.balls.filter((b) => isBallLegalTarget(world, b, player));
  if (legal.length === 0 || !legal.every((b) => b.x <= world.metrics.headStringX + 0.5)) {
    return false;
  }
  let closestId = legal[0]!.id;
  let closestDist = Math.abs(world.metrics.headStringX - legal[0]!.x);
  for (const b of legal) {
    const d = Math.abs(world.metrics.headStringX - b.x);
    if (d < closestDist) {
      closestDist = d;
      closestId = b.id;
    }
  }
  return ball.id === closestId;
}

/**
 * Đặt lại viên bi (ví dụ Bi 8 rơi ngay cú khai cuộc theo luật WPA 3.3 & 1.4) lên Chấm Chân Bàn
 * hoặc vị trí trống sát nhất dọc Long String theo từng bước 2px (khoảng cách >= 2*R + 1px).
 */
export function spotBallOnLongString(world: BilliardsWorld, ball: BilliardBall): void {
  const { metrics, balls } = world;
  const pos = computeLongStringSpotPosition(
    ball.id,
    metrics.ballRadius,
    metrics.feltLeft,
    metrics.feltRight,
    metrics.centerY,
    metrics.footSpotX,
    balls,
  );
  ball.x = pos.x;
  ball.y = pos.y;
  ball.vx = 0;
  ball.vy = 0;
  ball.sx = 0;
  ball.sy = 0;
  ball.omegaZ = 0;
  ball.pocketed = false;
  ball.sinking = false;
  ball.sinkProgress = 0;
  world.returnRailQueue = world.returnRailQueue.filter((rb) => rb.id !== ball.id);
}

/**
 * Áp dụng lựa chọn xử lý Phá bi không hợp lệ (WPA 3.3: Nhận bàn / Tự phá lại / Bắt đối thủ phá lại).
 */
export function applyIllegalBreakDecision(world: BilliardsWorld, choice: IllegalBreakChoice): void {
  const decision = world.pendingDecision;
  if (!decision || decision.type !== 'illegal-break') return;

  if (choice === 'accept-table') {
    world.pendingDecision = null;
    world.currentPlayer = decision.decidingPlayer;
    world.isBreakShot = false;
    world.foulMessage = null;
    pushRefereeLog(world, {
      shotNumber: world.shots,
      player: decision.decidingPlayer,
      actionLabel: 'Quyết định trọng tài',
      verdict: 'decision',
      detail: 'Chấp nhận thế bàn hiện tại và tiếp tục đánh (Bàn Mở)',
    });
    triggerFeltToast(world, 'CHẤP NHẬN BÀN HIỆN TẠI · TIẾP TỤC ĐÁNH', 'info');
    return;
  }

  const nextBreaker: 1 | 2 = choice === 'rebreak-self' ? decision.decidingPlayer : decision.breaker;
  world.balls = buildOfficial15BallRack(world.metrics);
  world.returnRailQueue = [];
  world.pendingDecision = null;
  world.currentPlayer = nextBreaker;
  world.isBreakShot = true;
  world.ballInHand = false;
  world.ballInHandScope = 'full';
  world.mustShootOutOfKitchen = false;
  world.p1Group = null;
  world.p2Group = null;
  world.foulMessage = null;
  world.shots = 0;
  world.combo = 0;
  world.consecutiveNonPottingTurns = 0;
  world.stalemateOffered = false;
  world.calledEightPocketId = null;
  world.calledRegularPocketId = null;
  world.isSafetyActive = false;
  world.aimAngle = 0;
  pushRefereeLog(world, {
    shotNumber: 0,
    player: nextBreaker,
    actionLabel: 'Xếp lại bàn (Illegal Break)',
    verdict: 'decision',
    detail:
      choice === 'rebreak-self'
        ? 'Xếp lại 15 bi và giành quyền tự phá lại'
        : 'Yêu cầu người phá trước xếp lại & phá lại',
  });
  triggerFeltToast(world, 'XẾP LẠI BÀN · PHÁ BI LẠI', 'info');
}

/**
 * Áp dụng lựa chọn khi Bi 8 rơi ngay cú khai cuộc (WPA 3.3: Đặt lại Bi 8 Spot & đánh tiếp / Xếp lại bàn).
 */
export function applyEightOnBreakDecision(world: BilliardsWorld, choice: EightOnBreakChoice): void {
  const decision = world.pendingDecision;
  if (!decision || decision.type !== 'eight-on-break') return;

  if (choice === 'spot-and-continue') {
    const eightBall = world.balls.find((b) => b.id === 8);
    if (eightBall) {
      spotBallOnLongString(world, eightBall);
    }
    world.pendingDecision = null;
    world.isBreakShot = false;
    world.currentPlayer = decision.decidingPlayer;
    world.foulMessage = decision.scratched
      ? 'Bi 8 đã đặt lại · Đặt bi Trong Bếp (đánh bi ngoài vạch 25%)'
      : null;
    pushRefereeLog(world, {
      shotNumber: world.shots,
      player: decision.decidingPlayer,
      actionLabel: 'Xử lý Bi 8 khai cuộc',
      verdict: 'decision',
      detail: decision.scratched
        ? 'Đặt lại Bi 8 lên Long String · Đối thủ đặt bi Trong Bếp'
        : 'Đặt lại Bi 8 lên Long String và tiếp tục lượt (Bàn Mở)',
    });
    triggerFeltToast(world, 'ĐẶT LẠI BI 8 LÊN CHẤM ĐẦU · TIẾP TỤC', 'info');
    return;
  }

  world.balls = buildOfficial15BallRack(world.metrics);
  world.returnRailQueue = [];
  world.pendingDecision = null;
  world.currentPlayer = decision.breaker;
  world.isBreakShot = true;
  world.ballInHand = false;
  world.ballInHandScope = 'full';
  world.mustShootOutOfKitchen = false;
  world.p1Group = null;
  world.p2Group = null;
  world.foulMessage = null;
  world.shots = 0;
  world.combo = 0;
  world.consecutiveNonPottingTurns = 0;
  world.stalemateOffered = false;
  world.calledEightPocketId = null;
  world.calledRegularPocketId = null;
  world.isSafetyActive = false;
  world.aimAngle = 0;
  pushRefereeLog(world, {
    shotNumber: 0,
    player: decision.breaker,
    actionLabel: 'Xếp lại bàn (8-on-Break)',
    verdict: 'decision',
    detail: 'Xếp lại tam giác 15 bi và phá lại ván mới',
  });
  triggerFeltToast(world, 'XẾP LẠI BÀN · PHÁ BI LẠI', 'info');
}

/**
 * Chấp nhận hòa & xếp lại bàn khi rơi vào Thế Bế Tắc (Stalemate — WPA 1.12).
 */
export function acceptStalemateRerack(world: BilliardsWorld): void {
  const nextBreaker = world.currentPlayer;
  world.balls = buildOfficial15BallRack(world.metrics);
  world.returnRailQueue = [];
  world.pendingDecision = null;
  world.currentPlayer = nextBreaker;
  world.isBreakShot = true;
  world.ballInHand = false;
  world.ballInHandScope = 'full';
  world.mustShootOutOfKitchen = false;
  world.p1Group = null;
  world.p2Group = null;
  world.foulMessage = null;
  world.shots = 0;
  world.combo = 0;
  world.consecutiveNonPottingTurns = 0;
  world.stalemateOffered = false;
  world.calledEightPocketId = null;
  world.calledRegularPocketId = null;
  world.isSafetyActive = false;
  world.aimAngle = 0;
  pushRefereeLog(world, {
    shotNumber: 0,
    player: nextBreaker,
    actionLabel: 'Thế Bế Tắc (Stalemate)',
    verdict: 'decision',
    detail: 'Hai bên đồng ý hòa ván do 6 lượt liên tiếp không ăn bi — Xếp lại bàn mới',
  });
  triggerFeltToast(world, 'HÒA BẾ TẮC · XẾP LẠI BÀN MỚI', 'info');
}

/**
 * AI đánh giá thế bàn sau khi người chơi Phá bi lỗi để quyết định Nhận bàn hay Tự phá lại.
 */
export function evaluateAiIllegalBreakChoice(world: BilliardsWorld): IllegalBreakChoice {
  const cueBall = world.balls[0];
  if (!cueBall) return 'rebreak-self';
  const { metrics, balls } = world;
  const openTargets = balls.filter((b) => b.id >= 1 && b.id !== 8 && !b.pocketed);
  let clearPots = 0;
  for (const tBall of openTargets) {
    for (const pocket of metrics.pockets) {
      const dx = pocket.x - tBall.x;
      const dy = pocket.y - tBall.y;
      const d = Math.hypot(dx, dy) || 1;
      const gx = tBall.x - (dx / d) * metrics.ballRadius * 2;
      const gy = tBall.y - (dy / d) * metrics.ballRadius * 2;
      const c2gX = gx - cueBall.x;
      const c2gY = gy - cueBall.y;
      const dCG = Math.hypot(c2gX, c2gY) || 1;
      if ((c2gX * dx + c2gY * dy) / (dCG * d) < 0.35) continue;
      if (
        isSegmentClear(
          cueBall.x,
          cueBall.y,
          gx,
          gy,
          balls,
          0,
          tBall.id,
          metrics.ballRadius * 1.9,
        ) &&
        isSegmentClear(
          tBall.x,
          tBall.y,
          pocket.x,
          pocket.y,
          balls,
          0,
          tBall.id,
          metrics.ballRadius * 1.9,
        )
      ) {
        clearPots += 1;
        break;
      }
    }
  }
  return clearPots >= 2 ? 'accept-table' : 'rebreak-self';
}

export function detectPocketTargetedByRay(
  hitBall: BilliardBall | null,
  targetDirX: number,
  targetDirY: number,
  balls: readonly BilliardBall[],
  metrics: TableMetrics,
): number | null {
  if (!hitBall) return null;
  let bestPocketId: number | null = null;
  let bestDist = Infinity;
  for (const pocket of metrics.pockets) {
    const vx = pocket.x - hitBall.x;
    const vy = pocket.y - hitBall.y;
    const proj = vx * targetDirX + vy * targetDirY;
    if (proj <= 0) continue;
    const perpDist = Math.hypot(vx - proj * targetDirX, vy - proj * targetDirY);
    const acceptR = pocket.isCorner ? metrics.cornerDropRadius * 1.6 : metrics.sideDropRadius * 1.6;
    if (perpDist <= acceptR && proj < bestDist) {
      if (
        isSegmentClear(
          hitBall.x,
          hitBall.y,
          pocket.x,
          pocket.y,
          balls,
          0,
          hitBall.id,
          metrics.ballRadius * 1.85,
        )
      ) {
        bestDist = proj;
        bestPocketId = pocket.id;
      }
    }
  }
  return bestPocketId;
}

export function isInBreakKitchen(world: BilliardsWorld): boolean {
  return (
    world.isBreakShot &&
    world.shots === 0 &&
    !world.shotInProgress &&
    !world.rackCleared &&
    !world.strikeAnim.active
  );
}

export function clampBreakCueBallPlacement(
  world: BilliardsWorld,
  rawX: number,
  rawY: number,
): { x: number; y: number } {
  const { metrics } = world;
  const r = metrics.ballRadius;
  const minX = metrics.feltLeft + r + 5;
  const maxX = Math.max(minX, metrics.headStringX);
  const minY = metrics.feltTop + r + 5;
  const maxY = metrics.feltBottom - r - 5;

  return {
    x: Math.max(minX, Math.min(maxX, rawX)),
    y: Math.max(minY, Math.min(maxY, rawY)),
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
  previewPower = 0.55,
): GhostBallRaycastResult {
  const r = metrics.ballRadius;
  const twoR = r * 2;

  // Áp dụng độ lệch đầu cơ thật (Cue Squirt) do ép phê ngang spinX
  const baseAimAngle = Math.atan2(dirY, dirX);
  const squirtOffset = computeCueSquirtOffsetRad(Math.max(0.25, previewPower), spinX);
  const launchAngle = baseAimAngle + squirtOffset;
  const launchDirX = Math.cos(launchAngle);
  const launchDirY = Math.sin(launchAngle);

  let minDistance = Number.POSITIVE_INFINITY;
  let hitBall: BilliardBall | null = null;
  let cushionNormalX = 0;
  let cushionNormalY = 0;

  const minX = metrics.feltLeft + r;
  const maxX = metrics.feltRight - r;
  const minY = metrics.feltTop + r;
  const maxY = metrics.feltBottom - r;

  if (launchDirX > 1e-5) {
    const tRight = (maxX - cueBall.x) / launchDirX;
    if (tRight > 0 && tRight < minDistance) {
      minDistance = tRight;
      cushionNormalX = -1;
      cushionNormalY = 0;
    }
  } else if (launchDirX < -1e-5) {
    const tLeft = (minX - cueBall.x) / launchDirX;
    if (tLeft > 0 && tLeft < minDistance) {
      minDistance = tLeft;
      cushionNormalX = 1;
      cushionNormalY = 0;
    }
  }

  if (launchDirY > 1e-5) {
    const tBottom = (maxY - cueBall.y) / launchDirY;
    if (tBottom > 0 && tBottom < minDistance) {
      minDistance = tBottom;
      cushionNormalX = 0;
      cushionNormalY = -1;
    }
  } else if (launchDirY < -1e-5) {
    const tTop = (minY - cueBall.y) / launchDirY;
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
    const proj = ocX * launchDirX + ocY * launchDirY;
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
  const ghostX = cueBall.x + launchDirX * safeDist;
  const ghostY = cueBall.y + launchDirY * safeDist;

  let targetDirX = 0;
  let targetDirY = 0;
  let cueDeflectX: number;
  let cueDeflectY: number;
  let cueCurveCtrlX: number;
  let cueCurveCtrlY: number;
  let cueCurveEndX: number;
  let cueCurveEndY: number;
  const cuePathPoints: { readonly x: number; readonly y: number }[] = [{ x: ghostX, y: ghostY }];

  // Mini-Sim vật lý thật (2 viên bi ảo, ~24 substep, <0.02ms) mô phỏng đúng 90° Stun, 30° Natural Roll, Cù lê, Trô & CIT/SIT
  const simPower = Math.max(0.35, Math.min(1, previewPower));
  const simCue: RigidBallMotion = {
    x: cueBall.x,
    y: cueBall.y,
    vx: 0,
    vy: 0,
    sx: 0,
    sy: 0,
    omegaZ: 0,
  };
  initializeCueBallShot(simCue, baseAimAngle, simPower, spinX, spinY, metrics.physicsScale);

  // Tiến tới vị trí va chạm (ghostX, ghostY) theo đúng ma sát trượt mặt nỉ (phản ánh quãng trượt d_s)
  let traveled = 0;
  for (let s = 0; s < 48 && traveled < safeDist; s += 1) {
    const spd = Math.hypot(simCue.vx, simCue.vy);
    if (spd < 0.2 * metrics.physicsScale) break;
    const stepDt = Math.min(0.65, (safeDist - traveled) / spd);
    integrateClothSlideToRollSubstep(simCue, stepDt, metrics.physicsScale);
    traveled += spd * stepDt;
  }
  simCue.x = ghostX;
  simCue.y = ghostY;
  // Bảo đảm vận tốc tới điểm chạm tối thiểu đủ để quan sát hướng chạy bi cái trên tia ngắm
  const arrivalSpd = Math.hypot(simCue.vx, simCue.vy);
  const minPreviewSpd = 6.5 * metrics.physicsScale;
  if (arrivalSpd < minPreviewSpd) {
    const boost = minPreviewSpd / Math.max(0.1, arrivalSpd);
    if (arrivalSpd < 0.1) {
      simCue.vx = launchDirX * minPreviewSpd;
      simCue.vy = launchDirY * minPreviewSpd;
      simCue.sx = simCue.vx * (spinY >= 0 ? 1.65 * spinY : 1.95 * spinY);
      simCue.sy = simCue.vy * (spinY >= 0 ? 1.65 * spinY : 1.95 * spinY);
    } else {
      simCue.vx *= boost;
      simCue.vy *= boost;
      simCue.sx *= boost;
      simCue.sy *= boost;
    }
  }

  if (hitBall) {
    const nxRaw = hitBall.x - ghostX;
    const nyRaw = hitBall.y - ghostY;
    const nLen = Math.hypot(nxRaw, nyRaw) || 1;
    const nx = nxRaw / nLen;
    const ny = nyRaw / nLen;

    const simObj: RigidBallMotion = {
      x: hitBall.x,
      y: hitBall.y,
      vx: 0,
      vy: 0,
      sx: 0,
      sy: 0,
      omegaZ: 0,
    };
    resolveRigidBallPairCollision(simCue, simObj, nx, ny, metrics.physicsScale);

    const objSpd = Math.hypot(simObj.vx, simObj.vy);
    if (objSpd > 1e-4) {
      targetDirX = simObj.vx / objSpd;
      targetDirY = simObj.vy / objSpd;
    } else {
      targetDirX = nx;
      targetDirY = ny;
    }

    const maxPreviewDist = GHOST_CUE_VECTOR_LEN_PX * (1.28 + Math.abs(spinY) * 0.42);
    let pathDist = 0;
    let prevX = ghostX;
    let prevY = ghostY;
    for (let s = 0; s < 36 && pathDist < maxPreviewDist; s += 1) {
      integrateClothSlideToRollSubstep(simCue, 0.5, metrics.physicsScale);
      const stepDist = Math.hypot(simCue.x - prevX, simCue.y - prevY);
      if (stepDist < 0.05 && Math.hypot(simCue.sx, simCue.sy) < 0.1) break;
      const clampedX = Math.max(minX, Math.min(maxX, simCue.x));
      const clampedY = Math.max(minY, Math.min(maxY, simCue.y));
      pathDist += stepDist;
      if (s % 2 === 0 || pathDist >= maxPreviewDist) {
        cuePathPoints.push({ x: clampedX, y: clampedY });
      }
      if (clampedX !== simCue.x || clampedY !== simCue.y) break;
      prevX = simCue.x;
      prevY = simCue.y;
    }

    const endPt = cuePathPoints[cuePathPoints.length - 1] ?? { x: ghostX, y: ghostY };
    const midPt = cuePathPoints[Math.floor(cuePathPoints.length * 0.45)] ?? {
      x: (ghostX + endPt.x) * 0.5,
      y: (ghostY + endPt.y) * 0.5,
    };
    const endDx = endPt.x - ghostX;
    const endDy = endPt.y - ghostY;
    const endLen = Math.hypot(endDx, endDy);
    if (endLen > 1e-3) {
      cueDeflectX = endDx / endLen;
      cueDeflectY = endDy / endLen;
    } else {
      cueDeflectX = -ny;
      cueDeflectY = nx;
    }
    cueCurveCtrlX = midPt.x;
    cueCurveCtrlY = midPt.y;
    cueCurveEndX = endPt.x;
    cueCurveEndY = endPt.y;
  } else {
    applyCushionEnglishBounce(
      simCue,
      cushionNormalX,
      cushionNormalY,
      Math.abs(simCue.vx * cushionNormalX + simCue.vy * cushionNormalY),
      metrics.physicsScale,
    );
    const outSpd = Math.hypot(simCue.vx, simCue.vy) || 1;
    cueDeflectX = simCue.vx / outSpd;
    cueDeflectY = simCue.vy / outSpd;
    cueCurveCtrlX = ghostX + cueDeflectX * (GHOST_CUE_VECTOR_LEN_PX * 0.5);
    cueCurveCtrlY = ghostY + cueDeflectY * (GHOST_CUE_VECTOR_LEN_PX * 0.5);
    cueCurveEndX = ghostX + cueDeflectX * GHOST_CUE_VECTOR_LEN_PX;
    cueCurveEndY = ghostY + cueDeflectY * GHOST_CUE_VECTOR_LEN_PX;
    cuePathPoints.push(
      { x: cueCurveCtrlX, y: cueCurveCtrlY },
      { x: cueCurveEndX, y: cueCurveEndY },
    );
  }

  return {
    ghostX,
    ghostY,
    hitBall,
    launchDirX,
    launchDirY,
    targetDirX,
    targetDirY,
    cueDeflectX,
    cueDeflectY,
    cueCurveCtrlX,
    cueCurveCtrlY,
    cueCurveEndX,
    cueCurveEndY,
    cuePathPoints,
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
  const maxX =
    world.ballInHand && world.ballInHandScope === 'kitchen'
      ? Math.max(minX, metrics.headStringX)
      : metrics.feltRight - r - 5;
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
 * Ước lượng vị trí dừng của bi cái sau cú đánh để AI né rơi bi cái (scratch avoidance) & điều bi 2 nhịp (position play).
 */
function simulateAiCueBallLeave(
  cueX: number,
  cueY: number,
  ghostX: number,
  ghostY: number,
  targetBall: BilliardBall,
  power: number,
  spinY: number,
  metrics: TableMetrics,
): { readonly x: number; readonly y: number; readonly scratched: boolean } {
  const aimAngle = Math.atan2(ghostY - cueY, ghostX - cueX);
  const simCue: RigidBallMotion = {
    x: ghostX,
    y: ghostY,
    vx: 0,
    vy: 0,
    sx: 0,
    sy: 0,
    omegaZ: 0,
  };
  initializeCueBallShot(simCue, aimAngle, power, 0, spinY, metrics.physicsScale);
  const nxRaw = targetBall.x - ghostX;
  const nyRaw = targetBall.y - ghostY;
  const nLen = Math.hypot(nxRaw, nyRaw) || 1;
  const simObj: RigidBallMotion = {
    x: targetBall.x,
    y: targetBall.y,
    vx: 0,
    vy: 0,
    sx: 0,
    sy: 0,
    omegaZ: 0,
  };
  resolveRigidBallPairCollision(simCue, simObj, nxRaw / nLen, nyRaw / nLen, metrics.physicsScale);

  const r = metrics.ballRadius;
  let scratched = false;
  for (let s = 0; s < 48; s += 1) {
    integrateClothSlideToRollSubstep(simCue, 0.85, metrics.physicsScale);
    for (const p of metrics.pockets) {
      const dropR = p.isCorner ? metrics.cornerDropRadius : metrics.sideDropRadius;
      if (Math.hypot(simCue.x - p.x, simCue.y - p.y) < dropR * 1.18) {
        scratched = true;
        break;
      }
    }
    if (scratched) break;
    if (simCue.x - r < metrics.feltLeft) {
      simCue.x = metrics.feltLeft + r;
      applyCushionEnglishBounce(simCue, 1, 0, Math.abs(simCue.vx), metrics.physicsScale);
    } else if (simCue.x + r > metrics.feltRight) {
      simCue.x = metrics.feltRight - r;
      applyCushionEnglishBounce(simCue, -1, 0, Math.abs(simCue.vx), metrics.physicsScale);
    }
    if (simCue.y - r < metrics.feltTop) {
      simCue.y = metrics.feltTop + r;
      applyCushionEnglishBounce(simCue, 0, 1, Math.abs(simCue.vy), metrics.physicsScale);
    } else if (simCue.y + r > metrics.feltBottom) {
      simCue.y = metrics.feltBottom - r;
      applyCushionEnglishBounce(simCue, 0, -1, Math.abs(simCue.vy), metrics.physicsScale);
    }
    if (Math.hypot(simCue.vx, simCue.vy) < STOP_SPEED_PX_PER_FRAME * 1.2 * metrics.physicsScale) {
      break;
    }
  }
  return { x: simCue.x, y: simCue.y, scratched };
}

/**
 * AI Bot thực chiến 3 cấp độ (Tập sự / Câu lạc bộ / Cơ thủ):
 * - Biết phá bi uy lực (92-98% lực), đặt bi theo vùng Full/Kitchen, né rơi bi cái, điều bi 2 nhịp bằng Follow/Draw (Cơ thủ) & Safety Shot.
 */
export function computeAiShotPlan(world: BilliardsWorld): AiTurnPlan {
  const { metrics, balls, aiDifficulty } = world;
  const cueBall = balls[0];
  if (!cueBall) {
    return {
      phase: 'aiming',
      elapsedSec: 0,
      targetAngle: 0,
      startAngle: world.aimAngle,
      targetPower: 0.65,
      targetSpinX: 0,
      targetSpinY: 0,
      placeX: null,
      placeY: null,
      calledPocketId: null,
      isSafety: false,
    };
  }

  // Nếu là cú khai cuộc của Máy AI: tung cú phá uy lực (92–98%) nhắm thẳng bi đỉnh tam giác
  if (world.isBreakShot) {
    const breakOffsetY =
      aiDifficulty === 'pro' ? (Math.random() > 0.5 ? 1 : -1) * metrics.ballRadius * 0.14 : 0;
    const breakAngle = Math.atan2(
      metrics.centerY + breakOffsetY - cueBall.y,
      metrics.footSpotX - cueBall.x,
    );
    return {
      phase: 'aiming',
      elapsedSec: 0,
      targetAngle: breakAngle,
      startAngle: world.aimAngle,
      targetPower: aiDifficulty === 'rookie' ? 0.84 : 0.95,
      targetSpinX: 0,
      targetSpinY: 0.18,
      placeX: null,
      placeY: null,
      calledPocketId: null,
      isSafety: false,
    };
  }

  let placeX: number | null = null;
  let placeY: number | null = null;
  const isAiShootingEight = isShootingForEightBall(world, 2);
  const rawLegalTargets = balls.filter((b) => isBallLegalTarget(world, b, 2));
  const enforceOutOfKitchen =
    (world.ballInHand && world.ballInHandScope === 'kitchen') || world.mustShootOutOfKitchen;
  const kitchenFilteredTargets = enforceOutOfKitchen
    ? rawLegalTargets.filter((b) => isBallKitchenExempted(world, b, 2))
    : rawLegalTargets;
  const legalTargets = kitchenFilteredTargets.length > 0 ? kitchenFilteredTargets : rawLegalTargets;
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
      const def = clampValidCueBallPlacement(
        world,
        metrics.headStringX - metrics.ballRadius * 2,
        metrics.centerY,
      );
      placeX = def.x;
      placeY = def.y;
      evalCueX = def.x;
      evalCueY = def.y;
    }
  }

  let bestScore = -Infinity;
  let bestAngle = 0;
  let bestPower = 0.65;
  let bestSpinX = 0;
  let bestSpinY = 0;
  let isAiSafetyShot = false;
  let bestPocketId: number | null =
    isAiShootingEight || world.ruleSet === 'wpa-pro' ? (metrics.pockets[0]?.id ?? 0) : null;

  const spinCandidates: readonly number[] = aiDifficulty === 'pro' ? [0, 0.62, -0.68] : [0];

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

      const basePower = Math.max(
        0.38,
        Math.min(0.82, 0.32 + (distCG + distTP) / (metrics.feltWidth * 1.7)),
      );

      let baseScore = cutCos * 420 - distTP * 0.45 - distCG * 0.28;
      if (cuePathClear && objPathClear) {
        baseScore += 900;
      } else if (cuePathClear) {
        baseScore += 120;
      }

      // Đánh giá né bi cái rơi lỗ & điều bi 2 nhịp cho các cơ ăn rõ ràng ở chế độ CLB / Cơ thủ
      if (cuePathClear && objPathClear && aiDifficulty !== 'rookie') {
        const nextCandidates = fallbackTargets.filter((b) => b.id !== tBall.id);
        for (const candSpinY of spinCandidates) {
          const leave = simulateAiCueBallLeave(
            evalCueX,
            evalCueY,
            ghostX,
            ghostY,
            tBall,
            basePower,
            candSpinY,
            metrics,
          );
          let totalScore = baseScore - (leave.scratched ? 520 : 0);
          if (!leave.scratched && aiDifficulty === 'pro' && nextCandidates.length > 0) {
            let bestNextBonus = 0;
            for (const nextB of nextCandidates) {
              const distNext = Math.hypot(nextB.x - leave.x, nextB.y - leave.y);
              if (
                distNext > metrics.ballRadius * 3 &&
                isSegmentClear(
                  leave.x,
                  leave.y,
                  nextB.x,
                  nextB.y,
                  balls,
                  0,
                  nextB.id,
                  metrics.ballRadius * 1.85,
                )
              ) {
                const bonus = Math.max(0, 210 - distNext * 0.25);
                if (bonus > bestNextBonus) bestNextBonus = bonus;
              }
            }
            totalScore += bestNextBonus;
          }
          if (totalScore > bestScore) {
            bestScore = totalScore;
            bestAngle = Math.atan2(dirCGY, dirCGX);
            bestPocketId = isAiShootingEight || world.ruleSet === 'wpa-pro' ? pocket.id : null;
            bestPower = basePower;
            bestSpinX = 0;
            bestSpinY = candSpinY;
          }
        }
      } else if (baseScore > bestScore) {
        bestScore = baseScore;
        bestAngle = Math.atan2(dirCGY, dirCGX);
        bestPocketId = isAiShootingEight || world.ruleSet === 'wpa-pro' ? pocket.id : null;
        bestPower = basePower;
        bestSpinX = 0;
        bestSpinY = 0;
      }
    }
  }

  // Chiến thuật Safety Shot khi không có cơ ăn lỗ tỷ lệ cao (bestScore < 500):
  // Đánh chạm bi hợp lệ dội băng an toàn + tuyên bố Safety chuẩn WPA
  if (bestScore < 500 && !isAiShootingEight && fallbackTargets.length > 0) {
    let bestSafetyDist = Infinity;
    for (const tBall of fallbackTargets) {
      if (
        isSegmentClear(
          evalCueX,
          evalCueY,
          tBall.x,
          tBall.y,
          balls,
          0,
          tBall.id,
          metrics.ballRadius * 1.92,
        )
      ) {
        const distToRail = Math.min(
          tBall.x - metrics.feltLeft,
          metrics.feltRight - tBall.x,
          tBall.y - metrics.feltTop,
          metrics.feltBottom - tBall.y,
        );
        const cueDist = Math.hypot(tBall.x - evalCueX, tBall.y - evalCueY);
        const safetyCost = cueDist * 0.55 + distToRail * 0.9;
        if (safetyCost < bestSafetyDist) {
          bestSafetyDist = safetyCost;
          bestAngle = Math.atan2(tBall.y - evalCueY, tBall.x - evalCueX);
          bestPower = Math.max(0.36, Math.min(0.48, 0.32 + cueDist / (metrics.feltWidth * 1.8)));
          bestScore = 550;
          isAiSafetyShot = true;
        }
      }
    }
  }

  // Nhánh dự phòng snooker 1: chạm trực tiếp bi hợp lệ thông thoáng
  if (bestScore === -Infinity && fallbackTargets.length > 0) {
    let bestDirectDist = Infinity;
    for (const tBall of fallbackTargets) {
      if (
        isSegmentClear(
          evalCueX,
          evalCueY,
          tBall.x,
          tBall.y,
          balls,
          0,
          tBall.id,
          metrics.ballRadius * 1.92,
        )
      ) {
        const d = Math.hypot(tBall.x - evalCueX, tBall.y - evalCueY);
        if (d < bestDirectDist) {
          bestDirectDist = d;
          bestAngle = Math.atan2(tBall.y - evalCueY, tBall.x - evalCueX);
          bestPower = 0.54;
          bestScore = 1;
        }
      }
    }
  }

  // 2) Nếu toàn bộ bi mục tiêu đều bị che đường thẳng -> tính cú đánh bật 1 băng chạm bi mục tiêu
  if (bestScore === -Infinity && fallbackTargets.length > 0) {
    const rPad = metrics.ballRadius;
    const cushionPlanes = [
      { axis: 'y' as const, plane: metrics.feltTop + rPad },
      { axis: 'y' as const, plane: metrics.feltBottom - rPad },
      { axis: 'x' as const, plane: metrics.feltLeft + rPad },
      { axis: 'x' as const, plane: metrics.feltRight - rPad },
    ];

    let bestBankDist = Infinity;
    for (const tBall of fallbackTargets) {
      for (const c of cushionPlanes) {
        const refX = c.axis === 'x' ? 2 * c.plane - tBall.x : tBall.x;
        const refY = c.axis === 'y' ? 2 * c.plane - tBall.y : tBall.y;
        const dxR = refX - evalCueX;
        const dyR = refY - evalCueY;

        let tHit = -1;
        if (c.axis === 'x' && Math.abs(dxR) > 1e-4) {
          tHit = (c.plane - evalCueX) / dxR;
        } else if (c.axis === 'y' && Math.abs(dyR) > 1e-4) {
          tHit = (c.plane - evalCueY) / dyR;
        }

        if (tHit <= 0.05 || tHit >= 0.95) continue;
        const bx = evalCueX + dxR * tHit;
        const by = evalCueY + dyR * tHit;
        if (
          bx < metrics.feltLeft + rPad ||
          bx > metrics.feltRight - rPad ||
          by < metrics.feltTop + rPad ||
          by > metrics.feltBottom - rPad
        ) {
          continue;
        }

        const leg1Clear = isSegmentClear(
          evalCueX,
          evalCueY,
          bx,
          by,
          balls,
          0,
          tBall.id,
          rPad * 1.9,
        );
        const leg2Clear = isSegmentClear(bx, by, tBall.x, tBall.y, balls, 0, tBall.id, rPad * 1.9);
        if (leg1Clear && leg2Clear) {
          const totalDist =
            Math.hypot(bx - evalCueX, by - evalCueY) + Math.hypot(tBall.x - bx, tBall.y - by);
          if (totalDist < bestBankDist) {
            bestBankDist = totalDist;
            bestAngle = Math.atan2(by - evalCueY, bx - evalCueX);
            bestPower = 0.68;
            bestScore = 1;
          }
        }
      }
    }
  }

  // 3) Phương án cuối cùng (mọi đường 1 băng cũng kín): hướng về bi hợp lệ gần nhất
  if (bestScore === -Infinity && fallbackTargets.length > 0) {
    const sorted = [...fallbackTargets].sort(
      (a, b) =>
        Math.hypot(a.x - evalCueX, a.y - evalCueY) - Math.hypot(b.x - evalCueX, b.y - evalCueY),
    );
    const nearest = sorted[0]!;
    bestAngle = Math.atan2(nearest.y - evalCueY, nearest.x - evalCueX);
    bestPower = 0.6;
  }

  // Sai số góc tự nhiên theo cấp độ AI (Tập sự ±2.4°, CLB ±1.1°, Cơ thủ ±0.35°)
  const jitterSpanDeg = aiDifficulty === 'rookie' ? 4.8 : aiDifficulty === 'pro' ? 0.7 : 2.2;
  const jitterRad = ((Math.random() - 0.5) * jitterSpanDeg * Math.PI) / 180;

  return {
    phase: 'aiming',
    elapsedSec: 0,
    targetAngle: bestAngle + jitterRad,
    startAngle: world.aimAngle,
    targetPower: bestPower,
    targetSpinX: bestSpinX,
    targetSpinY: bestSpinY,
    placeX,
    placeY,
    calledPocketId: isAiSafetyShot
      ? null
      : isAiShootingEight || world.ruleSet === 'wpa-pro'
        ? bestPocketId
        : null,
    isSafety: isAiSafetyShot,
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

export function computeStereoPan(x: number, metrics: TableMetrics): number {
  const feltCenterX = metrics.feltLeft + metrics.feltWidth * 0.5;
  const halfSpan = Math.max(1, metrics.feltWidth * 0.5);
  return Math.max(-0.85, Math.min(0.85, ((x - feltCenterX) / halfSpan) * 0.85));
}

export function isCueBallPlacementValid(world: BilliardsWorld, x: number, y: number): boolean {
  const { metrics, balls } = world;
  const r = metrics.ballRadius;
  const maxX =
    world.ballInHand && world.ballInHandScope === 'kitchen'
      ? metrics.headStringX
      : metrics.feltRight - r;
  if (
    x < metrics.feltLeft + r ||
    x > maxX ||
    y < metrics.feltTop + r ||
    y > metrics.feltBottom - r
  ) {
    return false;
  }
  const minClear = r * 2 + 0.8;
  for (const ball of balls) {
    if (ball.id === 0 || ball.pocketed || ball.sinking) continue;
    if (Math.hypot(x - ball.x, y - ball.y) < minClear) {
      return false;
    }
  }
  return true;
}

export function triggerFeltToast(
  world: BilliardsWorld,
  text: string,
  tone: 'info' | 'foul' | 'reward' = 'info',
): void {
  world.toastEvent = {
    active: true,
    text,
    tone,
    seq: world.toastEvent.seq + 1,
  };
}

export function spawnChalkStreak(
  world: BilliardsWorld,
  x1: number,
  y1: number,
  dirX: number,
  dirY: number,
  lengthPx = 32,
): void {
  const streak = world.chalkStreaks[world.chalkCursor % world.chalkStreaks.length];
  world.chalkCursor = (world.chalkCursor + 1) % world.chalkStreaks.length;
  if (!streak) return;
  streak.active = true;
  streak.x1 = x1;
  streak.y1 = y1;
  streak.x2 = x1 + dirX * lengthPx;
  streak.y2 = y1 + dirY * lengthPx;
  streak.ageSec = 0;
  streak.maxAgeSec = CHALK_STREAK_DURATION_SEC;
}

export function spawnChalkDustBurst(
  world: BilliardsWorld,
  tipX: number,
  tipY: number,
  dirX: number,
  dirY: number,
): void {
  const count = 8;
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
    spark.colorRgba = 'rgba(235, 245, 242, 0.92)';
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
 * Xử lý kết thúc một lượt đánh theo chuẩn luật WPA 8-Ball (Đấu Máy / 2 Người / Tập tự do):
 * - Khai cuộc hợp lệ (>= 1 bi rơi lỗ HOẶC >= 4 bi mục tiêu chạm băng).
 * - Rơi Bi 8 ngay cú khai cuộc: KHÔNG thua — tự động đặt lại Bi 8 lên Foot Spot (Long String).
 * - Rơi bi cái lúc khai cuộc (Scratch on Break): trao Ball-in-Hand giới hạn Trong Bếp (Head String).
 * - Đánh từ Trong Bếp bắt buộc bi cái vượt vạch 25% trước khi chạm bi mục tiêu.
 * - Hỗ trợ cả chuẩn Chỉ định lỗ Bi 8 và chế độ Giải đấu WPA (Pro Call-Shot mọi cơ).
 */
function resolveTurnOutcome(world: BilliardsWorld): void {
  const { metrics } = world;
  const cueBall = world.balls[0];
  const pocketedEight = world.pocketedIdsThisTurn.includes(8);
  const pocketedNonEightIds = world.pocketedIdsThisTurn.filter((id) => id !== 8);

  const resetTurnTransient = () => {
    world.isBreakShot = false;
    world.isSafetyActive = false;
    world.pocketedIdsThisTurn = [];
    world.pocketedPocketMapThisTurn = {};
    world.breakRailHitBallIds = [];
    world.calledEightPocketId = null;
    world.calledRegularPocketId = null;
    world.eightBallPocketedId = null;
    world.railOrPocketAfterFirstHitThisTurn = false;
    world.cueCrossedHeadStringThisTurn = false;
    world.firstHitWasInKitchenThisTurn = false;
    world.allLegalTargetsInKitchenAtStart = false;
  };

  if (world.gameMode === 'free') {
    if (world.scratchedThisTurn) {
      world.ballInHand = true;
      world.ballInHandScope = 'full';
      world.mustShootOutOfKitchen = false;
      world.foulMessage = 'Bi cái rơi lỗ — Bấm chọn vị trí đặt lại';
      world.combo = 0;
      triggerFeltToast(world, 'BI CÁI RƠI LỖ · ĐẶT BI TỰ DO', 'foul');
    } else if (pocketedNonEightIds.length === 0 && !pocketedEight) {
      world.combo = 0;
      world.foulMessage = null;
      world.mustShootOutOfKitchen = false;
    } else {
      world.foulMessage = null;
      world.mustShootOutOfKitchen = false;
    }
    const allCleared = world.balls.filter((b) => b.id >= 1).every((b) => b.pocketed);
    if (allCleared) {
      world.rackCleared = true;
      world.ballInHand = false;
      world.winner = 1;
      world.winReason = `Hoàn thành bàn 15 bi · ${world.shots} cơ`;
    }
    resetTurnTransient();
    return;
  }

  // Luật 8-Ball đối kháng WPA (Bộ máy trọng tài thuần evaluateWpaShot)
  const shooter = world.currentPlayer;
  const opponent: 1 | 2 = shooter === 1 ? 2 : 1;
  const shooterGroupBefore = getPlayerGroup(world, shooter);
  const opponentGroupBefore = getPlayerGroup(world, opponent);
  const shooterClearedBeforeTurn =
    shooterGroupBefore !== null &&
    world.balls
      .filter(
        (b) => b.spec.group === shooterGroupBefore && !world.pocketedIdsThisTurn.includes(b.id),
      )
      .every((b) => b.pocketed);

  const firstHitBall =
    world.firstHitBallIdThisTurn !== null
      ? world.balls.find((b) => b.id === world.firstHitBallIdThisTurn)
      : undefined;
  const firstHitBallGroup =
    firstHitBall === undefined
      ? null
      : firstHitBall.id === 8
        ? 'eight'
        : firstHitBall.spec.group === 'stripes'
          ? 'stripes'
          : 'solids';

  const pocketedBalls: PocketedBallRecord[] = world.pocketedIdsThisTurn.map((id) => {
    const ball = world.balls.find((item) => item.id === id);
    const group = id === 8 ? 'eight' : ball?.spec.group === 'stripes' ? 'stripes' : 'solids';
    const fallbackPocket =
      id === 8 && world.eightBallPocketedId !== null ? world.eightBallPocketedId : 0;
    return {
      id,
      group,
      pocketId: world.pocketedPocketMapThisTurn[id] ?? fallbackPocket,
    };
  });

  const activeCalledPocketId = isShootingForEightBall(world, shooter)
    ? world.calledEightPocketId
    : world.calledRegularPocketId;

  const res = evaluateWpaShot({
    gameMode: world.gameMode,
    ruleSet: world.ruleSet,
    shooter,
    shotNumber: world.shots,
    isBreakShot: world.isBreakShot,
    scratched: world.scratchedThisTurn,
    firstHitBallId: world.firstHitBallIdThisTurn,
    firstHitBallGroup,
    firstHitWasInKitchen: world.firstHitWasInKitchenThisTurn,
    allLegalTargetsInKitchen: world.allLegalTargetsInKitchenAtStart,
    mustShootOutOfKitchen: world.mustShootOutOfKitchen,
    cueCrossedHeadStringBeforeFirstHit: world.cueCrossedHeadStringThisTurn,
    pocketedBalls,
    railHitAfterFirstContact: world.railOrPocketAfterFirstHitThisTurn,
    breakRailHitCount: world.breakRailHitBallIds.length,
    calledPocketId: activeCalledPocketId,
    isSafetyCall: world.isSafetyActive,
    shooterGroupBefore,
    opponentGroupBefore,
    shooterGroupClearedBeforeTurn: shooterClearedBeforeTurn,
    consecutiveNonPottingTurns: world.consecutiveNonPottingTurns,
  });

  if (res.spotEightBall) {
    const eightBall = world.balls.find((b) => b.id === 8);
    if (eightBall) {
      spotBallOnLongString(world, eightBall);
    }
  }

  if (res.newlyAssignedGroup && cueBall) {
    spawnFloatingText(
      world,
      cueBall.x,
      Math.max(metrics.feltTop + 26, cueBall.y - 20),
      res.newlyAssignedGroup === 'solids' ? 'NHÓM TRƠN (1–7)' : 'NHÓM SỌC (9–15)',
      '#D9B468',
    );
  }

  world.p1Group = res.assignedP1Group;
  world.p2Group = res.assignedP2Group;
  world.currentPlayer = res.nextPlayer;
  world.ballInHand = res.ballInHand;
  world.ballInHandScope = res.ballInHandScope;
  world.mustShootOutOfKitchen = res.mustShootOutOfKitchen;
  world.pendingDecision = res.pendingDecision;
  world.foulMessage = res.foulReason;
  world.consecutiveNonPottingTurns = res.nextConsecutiveNonPottingTurns;
  world.stalemateOffered = res.stalemateReached;

  if (res.isFoul || !res.continuesTurn) {
    world.combo = 0;
  }

  if (res.winner !== null) {
    world.rackCleared = true;
    world.winner = res.winner;
    world.winReason = res.winReason;
  }

  if (res.toastText) {
    triggerFeltToast(world, res.toastText, res.toastTone);
  }

  pushRefereeLog(world, res.logEntry);
  resetTurnTransient();
}

/**
 * Chạy 1 bước vật lý SUBSTEPS=8 (tự tăng 16 khi phá bi tốc độ cao) ở 120fps (`dtScale`):
 * - Trượt -> Lăn Coulomb theo tỷ lệ bàn `physicsScale` + quay 3D cả trục ngang & trục đứng Z (ép phê).
 * - Hình học miệng lỗ chuẩn WPA: 6 đoạn băng thẳng giữa các mũi băng + 12 chốt bo góc + 12 má vát 142°/104° + thềm dốc hốc lỗ.
 * - Giải va chạm Bi–Bi Gauss-Seidel 2 lượt đảo chiều giúp cú phá bi 15 bi bung đối xứng.
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
  const scale = metrics.physicsScale;
  const stopSpeed = STOP_SPEED_PX_PER_FRAME * scale;
  const midX = metrics.feltLeft + metrics.feltWidth * 0.5;
  const cornerGap = metrics.cornerMouthOffset;
  const sideGap = metrics.sideMouthOffset;

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

  // 2. Cập nhật hiệu ứng hút bi rơi vào lỗ (190ms, xoáy nhẹ & lặn xuống hốc lỗ) & đưa bi vào máng hồi bi (220ms)
  for (const ball of world.balls) {
    if (!ball.sinking) continue;
    ball.sinkProgress += dtSeconds / POCKET_SINK_DURATION_SEC;
    ball.sinkAngle += dtSeconds * 11;
    const swirlOffset = Math.max(0, 1 - ball.sinkProgress) * r * 0.24;
    const targetSwirlX = ball.sinkTargetX + Math.cos(ball.sinkAngle) * swirlOffset;
    const targetSwirlY = ball.sinkTargetY + Math.sin(ball.sinkAngle) * swirlOffset;
    ball.x += (targetSwirlX - ball.x) * Math.min(1, dtSeconds * 20);
    ball.y += (targetSwirlY - ball.y) * Math.min(1, dtSeconds * 20);

    if (ball.sinkProgress >= 1) {
      ball.sinking = false;
      ball.sinkProgress = 1;
      if (ball.id === 0) {
        ball.pocketed = false;
        ball.vx = 0;
        ball.vy = 0;
        ball.sx = 0;
        ball.sy = 0;
        ball.omegaZ = 0;
        const safePos = clampValidCueBallPlacement(
          world,
          metrics.headStringX - r * 1.5,
          metrics.centerY,
        );
        ball.x = safePos.x;
        ball.y = safePos.y;
        world.hoverPlaceX = safePos.x;
        world.hoverPlaceY = safePos.y;
        world.hoverPlaceValid = isCueBallPlacementValid(world, safePos.x, safePos.y);
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

    if (rb.y > railFloorY) {
      if (rb.vy > 45) {
        playMarbleRoll(Math.min(1, rb.vy / 340), 0.82);
      }
      rb.y = railFloorY;
      rb.vy = Math.abs(rb.vy) > 40 ? -rb.vy * 0.25 : 0;
    }

    if (i > 0) {
      const below = world.returnRailQueue[i - 1]!;
      if (below.pendingSec <= 0) {
        const minStackY = below.y - rr * 2.02;
        if (rb.y > minStackY) {
          if (rb.vy - below.vy > 40) {
            playMarbleRoll(Math.min(1, (rb.vy - below.vy) / 320), 0.82);
          }
          rb.y = minStackY;
          rb.vy = below.vy * 0.3;
        }
      }
    }
  }

  const recordRailContact = (ball: BilliardBall) => {
    ball.cushionBouncesThisTurn += 1;
    if (world.firstHitBallIdThisTurn !== null) {
      world.railOrPocketAfterFirstHitThisTurn = true;
    }
    if (world.isBreakShot && ball.id >= 1 && !world.breakRailHitBallIds.includes(ball.id)) {
      world.breakRailHitBallIds.push(ball.id);
    }
  };

  // 4. Vật lý Trượt -> Lăn chuẩn WPA (tự nâng lên 16 substep khi tốc độ phá bi > 18 px/f để chống xuyên bi tuyệt đối)
  if (!world.strikeAnim.active) {
    let peakSpd = 0;
    for (const b of world.balls) {
      if (b.pocketed || b.sinking) continue;
      const spd = Math.hypot(b.vx, b.vy);
      if (spd > peakSpd) peakSpd = spd;
    }
    const effectiveSubsteps =
      peakSpd > BREAK_HIGH_SPEED_THRESHOLD * scale ? SUBSTEPS * 2 : SUBSTEPS;
    const subDtScale = dtScale / effectiveSubsteps;

    const resolveBallPairAt = (a: BilliardBall, b: BilliardBall) => {
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

        const impactSpeed = resolveRigidBallPairCollision(a, b, nx, ny, scale);
        if (impactSpeed > 0) {
          if (a.id === 0 || b.id === 0) {
            const target = a.id === 0 ? b : a;
            if (world.firstHitBallIdThisTurn === null) {
              world.firstHitBallIdThisTurn = target.id;
              world.firstHitWasInKitchenThisTurn = target.x <= metrics.headStringX + 0.5;
            }
            world.cueHasHitBallThisTurn = true;
          }

          const impactNorm = Math.min(1, impactSpeed / (16 * scale));
          if (impactNorm > 0.06) {
            const contactX = (a.x + b.x) * 0.5;
            spawnCollisionSparks(world, contactX, (a.y + b.y) * 0.5, 5);
            playBallClack(impactNorm, computeStereoPan(contactX, metrics));
          }
        }
      }
    };

    for (let step = 0; step < effectiveSubsteps; step += 1) {
      for (const ball of world.balls) {
        if (ball.pocketed || ball.sinking) continue;

        const { rollDx, rollDy, dSpinZRad } = integrateClothSlideToRollSubstep(
          ball,
          subDtScale,
          scale,
        );
        advanceBallRolling3D(ball, rollDx, rollDy, r, dSpinZRad);

        // Ghi nhận bi cái đã vượt ra ngoài vạch Bếp (Head String 25%) trước khi chạm bi đầu tiên
        if (
          ball.id === 0 &&
          world.firstHitBallIdThisTurn === null &&
          ball.x > metrics.headStringX + r * 0.15
        ) {
          world.cueCrossedHeadStringThisTurn = true;
        }

        // Kiểm tra rơi hốc lỗ & độ dốc thềm lỗ (Corner vs Side khác biệt chuẩn WPA)
        let droppedPocket: PocketNode | null = null;
        for (const pocket of metrics.pockets) {
          const dropR = pocket.isCorner ? metrics.cornerDropRadius : metrics.sideDropRadius;
          const shelfOuter = pocket.isCorner ? dropR * 1.28 : dropR * 1.15;
          const pdx = pocket.x - ball.x;
          const pdy = pocket.y - ball.y;
          const pDist = Math.hypot(pdx, pdy);

          if (pDist < dropR) {
            droppedPocket = pocket;
            break;
          }
          if (pDist < shelfOuter && pDist > 0.001) {
            const curSpeed = Math.hypot(ball.vx, ball.vy);
            if (curSpeed >= stopSpeed || pDist < dropR * 1.08) {
              const slopeFactor = (shelfOuter - pDist) / Math.max(0.1, shelfOuter - dropR);
              const pullAccel = 0.092 * scale * slopeFactor * subDtScale;
              ball.vx += (pdx / pDist) * pullAccel;
              ball.vy += (pdy / pDist) * pullAccel;
              ball.sx += (pdx / pDist) * pullAccel * 0.5;
              ball.sy += (pdy / pDist) * pullAccel * 0.5;
            }
          }
        }

        if (droppedPocket) {
          const dropPan = computeStereoPan(droppedPocket.x, metrics);
          ball.vx = 0;
          ball.vy = 0;
          ball.sx = 0;
          ball.sy = 0;
          ball.omegaZ = 0;
          ball.sinking = true;
          ball.sinkProgress = 0;
          ball.sinkTargetX = droppedPocket.x;
          ball.sinkTargetY = droppedPocket.y;
          ball.sinkAngle = Math.atan2(ball.y - droppedPocket.y, ball.x - droppedPocket.x);
          spawnPocketRipple(world, droppedPocket.x, droppedPocket.y, metrics.pocketRadius * 1.9);

          if (world.firstHitBallIdThisTurn !== null) {
            world.railOrPocketAfterFirstHitThisTurn = true;
          }

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
            triggerFeltToast(world, 'BI CÁI RƠI LỖ · ĐẶT BI TỰ DO', 'foul');
            playCushionBounce(0.5, dropPan);
          } else {
            if (ball.id === 8) {
              world.eightBallPocketedId = droppedPocket.id;
            }
            world.pocketedIdsThisTurn.push(ball.id);
            world.pocketedPocketMapThisTurn[ball.id] = droppedPocket.id;
            world.combo += 1;
            const nonEightCount = world.pocketedIdsThisTurn.filter((id) => id !== 8).length;
            const bannerY = Math.max(metrics.feltTop + 30, droppedPocket.y - 16);

            if (ball.cushionBouncesThisTurn >= 1) {
              spawnFloatingText(world, droppedPocket.x, bannerY - 16, 'BANK SHOT!', '#D9B468');
              triggerFeltToast(world, 'BANK SHOT!', 'reward');
              playTrickShotReward('bank');
            }
            if (nonEightCount >= 2) {
              spawnFloatingText(world, droppedPocket.x, bannerY, 'DOUBLE POT!', '#D9B468');
              triggerFeltToast(world, 'DOUBLE POT!', 'reward');
              playTrickShotReward('double');
            } else if (world.combo >= 2) {
              spawnFloatingText(
                world,
                droppedPocket.x,
                bannerY,
                `COMBO ×${world.combo}!`,
                '#D9B468',
              );
              triggerFeltToast(world, `COMBO ×${world.combo}`, 'reward');
              playTrickShotReward('combo');
            } else if (ball.cushionBouncesThisTurn === 0) {
              spawnFloatingText(world, droppedPocket.x, bannerY, `+${ball.id}`, '#D9B468');
            }
            playPocketDrop(world.combo, dropPan);
          }
          hudDirty = true;
          continue;
        }

        // A. 12 Chốt bo tròn mũi băng (Pocket Jaw Knuckles)
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
              const sn = ball.sx * jnx + ball.sy * jny;
              if (sn < 0) {
                ball.sx -= (1 + JAW_RESTITUTION * 0.7) * sn * jnx;
                ball.sy -= (1 + JAW_RESTITUTION * 0.7) * sn * jny;
              }
              recordRailContact(ball);
              playJawRattle(
                Math.min(1, Math.abs(vn) / (14 * scale)),
                computeStereoPan(ball.x, metrics),
              );
            }
          }
        }

        // B. 12 Má vát hàm lỗ chuẩn WPA (142° lỗ góc / 104° lỗ giữa — dẫn bi chậm vào lỗ & tạo rattle khi đánh quá mạnh)
        for (const facing of metrics.pocketFacings) {
          const segX = facing.x2 - facing.x1;
          const segY = facing.y2 - facing.y1;
          const segLenSq = segX * segX + segY * segY;
          if (segLenSq < 1e-4) continue;
          const t = Math.max(
            0,
            Math.min(1, ((ball.x - facing.x1) * segX + (ball.y - facing.y1) * segY) / segLenSq),
          );
          // Điểm t=0 đã có PocketJawNode bo tròn, ưu tiên xử lý dọc thân má vát
          if (t < 0.04) continue;
          const cx = facing.x1 + segX * t;
          const cy = facing.y1 + segY * t;
          const fdx = ball.x - cx;
          const fdy = ball.y - cy;
          const fDist = Math.hypot(fdx, fdy);
          const signedSide = (ball.x - facing.x1) * facing.nx + (ball.y - facing.y1) * facing.ny;

          if (fDist < r && signedSide > -r * 0.45) {
            const fnx = fDist > 1e-4 ? fdx / fDist : facing.nx;
            const fny = fDist > 1e-4 ? fdy / fDist : facing.ny;
            const push = r - fDist;
            ball.x += fnx * push;
            ball.y += fny * push;

            const vn = ball.vx * fnx + ball.vy * fny;
            if (vn < 0) {
              ball.vx -= (1 + JAW_RESTITUTION) * vn * fnx;
              ball.vy -= (1 + JAW_RESTITUTION) * vn * fny;
              const sn = ball.sx * fnx + ball.sy * fny;
              if (sn < 0) {
                ball.sx -= (1 + JAW_RESTITUTION * 0.7) * sn * fnx;
                ball.sy -= (1 + JAW_RESTITUTION * 0.7) * sn * fny;
              }
              recordRailContact(ball);
              playJawRattle(
                Math.min(1, Math.abs(vn) / (14 * scale)),
                computeStereoPan(ball.x, metrics),
              );
            }
          }
        }

        // C. 6 Đoạn băng thẳng chính xác giữa các mũi băng (đảm bảo bi lăn sát băng đi thẳng vào lỗ góc mượt mà!)
        const inVerticalRailSpan =
          ball.y >= metrics.feltTop + cornerGap && ball.y <= metrics.feltBottom - cornerGap;
        const inHorizontalRailSpan =
          (ball.x >= metrics.feltLeft + cornerGap && ball.x <= midX - sideGap) ||
          (ball.x >= midX + sideGap && ball.x <= metrics.feltRight - cornerGap);

        let cushionImpact = 0;
        let hitRail = false;
        if (inVerticalRailSpan) {
          if (ball.x - r < metrics.feltLeft) {
            ball.x = metrics.feltLeft + r;
            cushionImpact = Math.max(cushionImpact, Math.abs(ball.vx));
            applyCushionEnglishBounce(ball, 1, 0, Math.abs(ball.vx), scale);
            hitRail = true;
          } else if (ball.x + r > metrics.feltRight) {
            ball.x = metrics.feltRight - r;
            cushionImpact = Math.max(cushionImpact, Math.abs(ball.vx));
            applyCushionEnglishBounce(ball, -1, 0, Math.abs(ball.vx), scale);
            hitRail = true;
          }
        }

        if (inHorizontalRailSpan) {
          if (ball.y - r < metrics.feltTop) {
            ball.y = metrics.feltTop + r;
            cushionImpact = Math.max(cushionImpact, Math.abs(ball.vy));
            applyCushionEnglishBounce(ball, 0, 1, Math.abs(ball.vy), scale);
            hitRail = true;
          } else if (ball.y + r > metrics.feltBottom) {
            ball.y = metrics.feltBottom - r;
            cushionImpact = Math.max(cushionImpact, Math.abs(ball.vy));
            applyCushionEnglishBounce(ball, 0, -1, Math.abs(ball.vy), scale);
            hitRail = true;
          }
        }

        // Hàng rào an toàn ngoài cùng tránh bi thoát khỏi vùng hốc sâu phía sau lỗ
        const backPad = r * 1.65;
        if (ball.x < metrics.feltLeft - backPad) {
          ball.x = metrics.feltLeft - backPad;
          ball.vx = Math.abs(ball.vx) * 0.4;
        } else if (ball.x > metrics.feltRight + backPad) {
          ball.x = metrics.feltRight + backPad;
          ball.vx = -Math.abs(ball.vx) * 0.4;
        }
        if (ball.y < metrics.feltTop - backPad) {
          ball.y = metrics.feltTop - backPad;
          ball.vy = Math.abs(ball.vy) * 0.4;
        } else if (ball.y > metrics.feltBottom + backPad) {
          ball.y = metrics.feltBottom + backPad;
          ball.vy = -Math.abs(ball.vy) * 0.4;
        }

        if (hitRail) {
          recordRailContact(ball);
          if (cushionImpact > 0.45 * scale) {
            playCushionBounce(
              Math.min(1, cushionImpact / (14 * scale)),
              computeStereoPan(ball.x, metrics),
            );
          }
        }
      }

      // Va chạm Bi–Bi vật lý Rigid-Sphere (2 lượt Gauss-Seidel đảo chiều đảm bảo phá bi 15 bi đối xứng)
      const nBalls = world.balls.length;
      for (let pass = 0; pass < 2; pass += 1) {
        if ((step + pass) % 2 === 0) {
          for (let i = 0; i < nBalls; i += 1) {
            const a = world.balls[i]!;
            if (a.pocketed || a.sinking) continue;
            for (let j = i + 1; j < nBalls; j += 1) {
              const b = world.balls[j]!;
              if (b.pocketed || b.sinking) continue;
              resolveBallPairAt(a, b);
            }
          }
        } else {
          for (let i = nBalls - 1; i >= 0; i -= 1) {
            const a = world.balls[i]!;
            if (a.pocketed || a.sinking) continue;
            for (let j = i - 1; j >= 0; j -= 1) {
              const b = world.balls[j]!;
              if (b.pocketed || b.sinking) continue;
              resolveBallPairAt(a, b);
            }
          }
        }
      }
    }
  }

  // Cập nhật âm thanh lăn êm trên vải nỉ (Brown noise ~240Hz tự giảm về 0 khi bi dừng hẳn)
  let rollingSpeedSum = 0;
  let maxBallSpeed = 0;
  if (!world.strikeAnim.active) {
    for (const b of world.balls) {
      if (b.pocketed || b.sinking) continue;
      const spd = Math.hypot(b.vx, b.vy);
      if (spd > stopSpeed) {
        rollingSpeedSum += spd;
        if (spd > maxBallSpeed) maxBallSpeed = spd;
      }
    }
  }
  const rollingEnergyNorm =
    rollingSpeedSum > 0
      ? Math.min(1, Math.max(maxBallSpeed / (18 * scale), rollingSpeedSum / (65 * scale)))
      : 0;
  updateBilliardRollingSound(rollingEnergyNorm);

  // 5. Kết thúc lượt đánh khi toàn bộ bi đã đứng yên
  if (world.shotInProgress && !world.strikeAnim.active) {
    const stillMoving = world.balls.some(
      (b) => !b.pocketed && (b.sinking || Math.hypot(b.vx, b.vy) > stopSpeed),
    );
    if (!stillMoving) {
      updateBilliardRollingSound(0);
      world.shotInProgress = false;
      resolveTurnOutcome(world);
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

  for (const streak of world.chalkStreaks) {
    if (!streak.active) continue;
    streak.ageSec += dtSeconds;
    if (streak.ageSec >= streak.maxAgeSec) {
      streak.active = false;
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
 * Vẽ 1 viên bi khoáng thạch chuẩn Studio 2.5D:
 * - 2 lớp radialGradient bóng đổ hướng tâm theo đèn bàn bida (tuyệt đối không dùng shadowBlur).
 * - Chiếu ma trận cầu 3x3 cho dải sọc xích đạo (9-15) & lõi số 2 mặt sắc nét.
 * - Vệt phản quang đèn trần cố định + viền phản xạ ánh nỉ xanh (Fresnel rim) không xoay theo mặt bi.
 */
function drawSinglePoolBall3D(
  ctx: CanvasRenderingContext2D,
  ball: BilliardBall,
  radius: number,
  lightCenterX: number,
  lightCenterY: number,
  isInChute = false,
  alpha = 1,
  darkenFactor = 0,
): void {
  const { spec, fx, fy, fz, px, py, pz, rx, ry } = ball;

  ctx.save();
  ctx.globalAlpha = alpha;

  // 1. Bóng đổ động 2 lớp bằng radialGradient (KHÔNG dùng shadowBlur để bảo toàn 120fps)
  if (isInChute) {
    const chuteAO = ctx.createRadialGradient(
      ball.x,
      ball.y + 2.6,
      radius * 0.2,
      ball.x,
      ball.y + 2.6,
      radius * 1.05,
    );
    chuteAO.addColorStop(0, 'rgba(4, 9, 7, 0.48)');
    chuteAO.addColorStop(1, 'rgba(4, 9, 7, 0)');
    ctx.fillStyle = chuteAO;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y + 2.6, radius * 1.05, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const offX = Math.max(-5, Math.min(5, (ball.x - lightCenterX) * 0.018)) + 1.0;
    const offY = Math.max(-5, Math.min(5, (ball.y - lightCenterY) * 0.018)) + 1.5;

    // Lớp bóng chiếu mềm dịch chuyển theo vector từ tâm đèn bàn ra tâm bi
    const castGrad = ctx.createRadialGradient(
      ball.x + offX,
      ball.y + offY,
      radius * 0.25,
      ball.x + offX,
      ball.y + offY,
      radius * 1.2,
    );
    castGrad.addColorStop(0, 'rgba(5, 11, 9, 0.44)');
    castGrad.addColorStop(0.62, 'rgba(5, 11, 9, 0.2)');
    castGrad.addColorStop(1, 'rgba(5, 11, 9, 0)');
    ctx.fillStyle = castGrad;
    ctx.beginPath();
    ctx.arc(ball.x + offX, ball.y + offY, radius * 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Lớp bóng tiếp xúc đậm sát đáy bi (r = 1.04 * R_ball)
    const aoGrad = ctx.createRadialGradient(
      ball.x + 1,
      ball.y + 2.1,
      radius * 0.14,
      ball.x + 1,
      ball.y + 2.1,
      radius * 1.04,
    );
    aoGrad.addColorStop(0, 'rgba(3, 8, 6, 0.56)');
    aoGrad.addColorStop(0.7, 'rgba(3, 8, 6, 0.22)');
    aoGrad.addColorStop(1, 'rgba(3, 8, 6, 0)');
    ctx.fillStyle = aoGrad;
    ctx.beginPath();
    ctx.arc(ball.x + 1, ball.y + 2.1, radius * 1.04, 0, Math.PI * 2);
    ctx.fill();
  }

  // Clip hình cầu cho thân bi + dải sọc + lõi số
  ctx.save();
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
  ctx.clip();

  if (spec.isStripe) {
    const baseGrad = ctx.createRadialGradient(
      ball.x - radius * 0.34,
      ball.y - radius * 0.34,
      radius * 0.1,
      ball.x,
      ball.y,
      radius,
    );
    baseGrad.addColorStop(0, '#FFFFFF');
    baseGrad.addColorStop(0.68, '#F8F9F7');
    baseGrad.addColorStop(1, '#B8C5C0');
    ctx.fillStyle = baseGrad;
    ctx.fillRect(ball.x - radius, ball.y - radius, radius * 2, radius * 2);

    // Chiếu trực giao dải sọc xích đạo 3D từ trục cực (px, py, pz)
    const projPoleLen = Math.hypot(px, py);
    const poleAngle = projPoleLen > 1e-4 ? Math.atan2(py, px) : 0;
    const bandHalfThick = radius * 0.54;
    const bandShift = pz * radius * 0.32;
    const bandCurvatureScale = Math.max(0.45, Math.min(1.05, Math.hypot(px, py) * 0.4 + 0.6));

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(poleAngle - Math.PI * 0.5);

    const bandGrad = ctx.createLinearGradient(-radius, 0, radius, 0);
    bandGrad.addColorStop(0, spec.shadowHex);
    bandGrad.addColorStop(0.32, spec.lightHex);
    bandGrad.addColorStop(0.55, spec.colorHex);
    bandGrad.addColorStop(1, spec.shadowHex);
    ctx.fillStyle = bandGrad;
    ctx.fillRect(
      -radius * 1.25,
      bandShift - bandHalfThick * bandCurvatureScale,
      radius * 2.5,
      bandHalfThick * 2 * bandCurvatureScale,
    );
    ctx.restore();
  } else {
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

  // 2. Chiếu ma trận trực giao 3D cho lõi số trắng 2 mặt (+front và -front)
  if (ball.id >= 1) {
    const useFront = fz >= 0;
    const nx = useFront ? fx : -fx;
    const ny = useFront ? fy : -fy;
    const nz = Math.abs(fz);
    const ux = useFront ? px : -px;
    const uy = useFront ? py : -py;
    const vx = useFront ? rx : -rx;
    const vy = useFront ? ry : -ry;

    if (nz > 0.08) {
      const discAlpha = Math.max(0.25, Math.min(1, (nz - 0.06) / 0.2));
      const spotX = ball.x + nx * radius * 0.54;
      const spotY = ball.y + ny * radius * 0.54;
      const coreR = radius * 0.44;
      const tangentAngle = Math.atan2(vy, vx);
      const upDot = vx * ux + vy * uy;
      const rotTilt = Math.atan2(ny, nx);

      ctx.save();
      ctx.globalAlpha = alpha * discAlpha;
      ctx.translate(spotX, spotY);
      ctx.rotate(rotTilt);
      ctx.scale(Math.max(0.32, nz), 1);

      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fillStyle = '#FAFBF9';
      ctx.fill();

      // Xoay nhẹ con số theo định hướng tiếp tuyến cầu thực
      ctx.rotate(tangentAngle - rotTilt + upDot * 0.01);
      ctx.font = `700 ${Math.max(8.5, Math.round(radius * 0.68))}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#141817';
      ctx.fillText(String(ball.id), 0, 0.5);
      ctx.restore();
    }
  } else {
    // Vệt chấm đỏ định hướng xoáy 3D trên Bi Cái
    if (fz > 0.06) {
      const dotX = ball.x + fx * radius * 0.5;
      const dotY = ball.y + fy * radius * 0.5;
      ctx.beginPath();
      ctx.arc(dotX, dotY, Math.max(1.4, radius * 0.14 * fz), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(181, 68, 60, 0.78)';
      ctx.fill();
    }
  }

  // 3. Ánh sáng Studio cố định (KHÔNG xoay theo mặt bi): bóng tối đáy cầu + Fresnel ánh nỉ xanh + điểm lóe acrylic
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
  rimGrad.addColorStop(1, 'rgba(5, 10, 8, 0.34)');
  ctx.fillStyle = rimGrad;
  ctx.fillRect(ball.x - radius, ball.y - radius, radius * 2, radius * 2);

  // Phản xạ ánh nỉ lục bảo cực mảnh dưới chân cầu (Static Fresnel Rim)
  if (!isInChute) {
    const fresnelGrad = ctx.createRadialGradient(
      ball.x,
      ball.y - radius * 0.18,
      radius * 0.68,
      ball.x,
      ball.y + radius * 0.25,
      radius * 1.02,
    );
    fresnelGrad.addColorStop(0, 'rgba(74, 170, 134, 0)');
    fresnelGrad.addColorStop(0.84, 'rgba(74, 170, 134, 0.16)');
    fresnelGrad.addColorStop(1, 'rgba(74, 170, 134, 0)');
    ctx.fillStyle = fresnelGrad;
    ctx.fillRect(ball.x - radius, ball.y - radius, radius * 2, radius * 2);
  }

  // Đốm phản quang acrylic cố định phía trên-trái + 2 dải đèn bàn bida (Aramith Overhead Light-Bar Reflections)
  const specX = ball.x - radius * 0.34;
  const specY = ball.y - radius * 0.34;
  const specGrad = ctx.createRadialGradient(specX, specY, 0, specX, specY, radius * 0.42);
  specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.82)');
  specGrad.addColorStop(0.45, 'rgba(255, 255, 255, 0.32)');
  specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = specGrad;
  ctx.beginPath();
  ctx.arc(specX, specY, radius * 0.42, 0, Math.PI * 2);
  ctx.fill();

  if (!isInChute && typeof ctx.ellipse === 'function') {
    // 2 dải ánh sáng đèn chùm chữ nhật mềm phản chiếu trên vòm bi nhựa phenolic thật
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.36)';
    ctx.beginPath();
    ctx.ellipse(
      ball.x - radius * 0.16,
      ball.y - radius * 0.44,
      radius * 0.28,
      radius * 0.085,
      -0.16,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.ellipse(
      ball.x + radius * 0.14,
      ball.y - radius * 0.38,
      radius * 0.2,
      radius * 0.065,
      0.16,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  if (darkenFactor > 0.01) {
    ctx.fillStyle = `rgba(5, 10, 8, ${Math.min(0.68, darkenFactor).toFixed(3)})`;
    ctx.fillRect(ball.x - radius, ball.y - radius, radius * 2, radius * 2);
  }

  ctx.restore();

  // Viền mảnh 0.6px tách bạch từng bi
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, radius - 0.3, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(10, 18, 15, 0.36)';
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.restore();
}

function createFeltGrainPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (typeof ctx.createPattern !== 'function') return null;
  try {
    const size = 48;
    const tile =
      typeof OffscreenCanvas !== 'undefined'
        ? new OffscreenCanvas(size, size)
        : document.createElement('canvas');
    tile.width = size;
    tile.height = size;
    const tCtx = tile.getContext('2d') as CanvasRenderingContext2D | null;
    if (!tCtx) return null;

    let seed = 1337;
    const nextRand = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 0xffffffff;
    };

    for (let i = 0; i < 160; i += 1) {
      const px = Math.floor(nextRand() * size);
      const py = Math.floor(nextRand() * size);
      tCtx.fillStyle = nextRand() > 0.5 ? 'rgba(245, 252, 248, 0.038)' : 'rgba(6, 18, 14, 0.038)';
      tCtx.fillRect(px, py, 1.4, 1.4);
    }

    return ctx.createPattern(tile as CanvasImageSource, 'repeat');
  } catch {
    return null;
  }
}

function drawBrassScrewHead(ctx: CanvasRenderingContext2D, sx: number, sy: number, r = 2.1): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#5B452A';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(sx, sy, r * 0.72, 0, Math.PI * 2);
  ctx.fillStyle = '#C9A878';
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(sx - r * 0.45, sy - r * 0.45);
  ctx.lineTo(sx + r * 0.45, sy + r * 0.45);
  ctx.strokeStyle = '#3B2C1A';
  ctx.lineWidth = 0.65;
  ctx.stroke();
  ctx.restore();
}

/**
 * Tiền kết xuất toàn bộ mặt bàn tĩnh (Nỉ hạt vi mô, đèn bàn elip, vân gỗ Óc Chó, ốp Đồng Cổ có vít & máng ray hở)
 * vào OffscreenCanvas cache theo kích thước để vòng lặp 120fps luôn < 2.5ms/frame.
 */
function bakeStaticTableSurface(
  metrics: TableMetrics,
  dpr: number,
  isDarkTheme: boolean,
  fallbackCtx: CanvasRenderingContext2D,
): TableSurfaceCache {
  const {
    width,
    height,
    tableLeft,
    tableTop,
    tableWidth,
    tableHeight,
    railWidth,
    cushionBevelPx,
    feltLeft,
    feltTop,
    feltRight,
    feltBottom,
    feltWidth,
    feltHeight,
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

  const pixelW = Math.max(1, Math.round(width * dpr));
  const pixelH = Math.max(1, Math.round(height * dpr));
  let cacheCanvas: HTMLCanvasElement | OffscreenCanvas | null = null;
  let cCtx: CanvasRenderingContext2D | null = null;

  if (typeof OffscreenCanvas !== 'undefined') {
    cacheCanvas = new OffscreenCanvas(pixelW, pixelH);
    cCtx = cacheCanvas.getContext('2d') as unknown as CanvasRenderingContext2D | null;
  } else if (typeof document !== 'undefined') {
    const el = document.createElement('canvas');
    el.width = pixelW;
    el.height = pixelH;
    cacheCanvas = el;
    cCtx = el.getContext('2d');
  }

  const ctx = cCtx ?? fallbackCtx;
  const tableRight = tableLeft + tableWidth;
  const tableBottom = tableTop + tableHeight;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  // 1. MÁNG HỒI BI HAI THANH RAY KIM LOẠI HỞ BÊN PHẢI BÀN (Tĩnh)
  ctx.save();
  const railCenterX = returnRailX + returnRailW * 0.5;
  const trackHalfSpan = Math.max(returnBallRadius * 0.78, returnRailW * 0.25);
  const leftTrackX = railCenterX - trackHalfSpan;
  const rightTrackX = railCenterX + trackHalfSpan;
  const chuteStartY = returnRailTopY + 18;
  const chuteEndY = returnRailBottomY - 6;

  const elbowStartX = tableRight - 6;
  const elbowY = returnRailTopY + 3;
  ctx.beginPath();
  ctx.moveTo(elbowStartX, elbowY);
  ctx.quadraticCurveTo(railCenterX, elbowY, railCenterX, chuteStartY + 2);
  ctx.strokeStyle = isDarkTheme ? '#2E3D37' : '#3B4C47';
  ctx.lineWidth = Math.max(12, returnBallRadius * 1.45);
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(elbowStartX, elbowY);
  ctx.quadraticCurveTo(railCenterX, elbowY, railCenterX, chuteStartY + 2);
  ctx.strokeStyle = 'rgba(184, 146, 90, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#9C7A4C';
  ctx.fillRect(tableRight - 3, elbowY - 7, 6, 14);

  for (const tieRatio of [0.22, 0.55, 0.88] as const) {
    const ty = chuteStartY + (chuteEndY - chuteStartY) * tieRatio;
    ctx.strokeStyle = isDarkTheme ? 'rgba(130, 152, 144, 0.35)' : 'rgba(59, 76, 71, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(leftTrackX - 1, ty);
    ctx.lineTo(rightTrackX + 1, ty);
    ctx.stroke();
  }

  const railGrad = ctx.createLinearGradient(0, chuteStartY, 0, chuteEndY);
  railGrad.addColorStop(0, '#9C7A4C');
  railGrad.addColorStop(0.18, isDarkTheme ? '#6F827B' : '#4E5F5A');
  railGrad.addColorStop(0.85, isDarkTheme ? '#4E5F5A' : '#34423E');
  railGrad.addColorStop(1, '#9C7A4C');

  for (const rx of [leftTrackX, rightTrackX] as const) {
    ctx.save();
    ctx.shadowColor = isDarkTheme ? 'rgba(0, 0, 0, 0.36)' : 'rgba(18, 34, 28, 0.18)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.moveTo(rx, chuteStartY);
    ctx.lineTo(rx, chuteEndY);
    ctx.strokeStyle = railGrad;
    ctx.lineWidth = 3.8;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(rx - 0.6, chuteStartY + 2);
    ctx.lineTo(rx - 0.6, chuteEndY - 2);
    ctx.strokeStyle = 'rgba(230, 210, 175, 0.48)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
  }

  ctx.fillStyle = '#141817';
  ctx.beginPath();
  ctx.roundRect(leftTrackX - 4, chuteEndY - 3, rightTrackX - leftTrackX + 8, 8, 3);
  ctx.fill();
  ctx.strokeStyle = '#9C7A4C';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  // 2. KHUNG THÀNH GỖ 3D (#2C221D -> #17120F) + SỚ GỖ + BÓNG ĐỔ TIẾP XÚC MỀM NỔI KHỐI
  ctx.save();
  ctx.shadowColor = isDarkTheme ? 'rgba(0, 0, 0, 0.52)' : 'rgba(18, 34, 28, 0.24)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 10;

  const woodGrad = ctx.createLinearGradient(0, tableTop, 0, tableBottom);
  woodGrad.addColorStop(0, '#362B25');
  woodGrad.addColorStop(0.2, '#2C221D');
  woodGrad.addColorStop(0.84, '#1C1612');
  woodGrad.addColorStop(1, '#17120F');

  ctx.fillStyle = woodGrad;
  ctx.beginPath();
  ctx.roundRect(tableLeft, tableTop, tableWidth, tableHeight, 18);
  ctx.fill();
  ctx.restore();

  // Sớ gỗ dọc theo thành gỗ Đá Phiến – Óc Chó
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(tableLeft, tableTop, tableWidth, tableHeight, 18);
  ctx.clip();
  ctx.strokeStyle = 'rgba(255, 240, 215, 0.05)';
  ctx.lineWidth = 0.85;
  for (let gy = tableTop + 4; gy < tableBottom - 4; gy += 4.5) {
    ctx.beginPath();
    ctx.moveTo(tableLeft, gy);
    ctx.quadraticCurveTo(
      tableLeft + tableWidth * 0.5,
      gy + Math.sin(gy * 0.25) * 1.4,
      tableRight,
      gy,
    );
    ctx.stroke();
  }
  ctx.restore();

  // Đường gờ bắt sáng vát cạnh 1px
  ctx.strokeStyle = 'rgba(255, 246, 224, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(tableLeft + 1.5, tableTop + 1.5, tableWidth - 3, tableHeight - 3, 17);
  ctx.stroke();

  // 3. 6 ỐP ĐỒNG CỔ XƯỚC + 2 ĐẦU VÍT ĐỒNG CHÌM NHỎ MỖI ỐP
  const bronzeGrad = ctx.createLinearGradient(tableLeft, tableTop, tableRight, tableBottom);
  bronzeGrad.addColorStop(0, '#B8925A');
  bronzeGrad.addColorStop(0.5, '#9C7A4C');
  bronzeGrad.addColorStop(1, '#6B5335');

  const cornerPlateLen = railWidth * 1.65;
  const cornerRadius = 18;
  ctx.fillStyle = bronzeGrad;
  ctx.strokeStyle = 'rgba(255, 246, 224, 0.25)';
  ctx.lineWidth = 1;

  for (const [cx, cy, sx, sy] of [
    [tableLeft, tableTop, 1, 1],
    [tableRight, tableTop, -1, 1],
    [tableLeft, tableBottom, 1, -1],
    [tableRight, tableBottom, -1, -1],
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

    // 2 đầu vít đồng chìm nhỏ trên từng ốp góc
    drawBrassScrewHead(ctx, cx + sx * (cornerPlateLen - 6.5), cy + sy * (railWidth * 0.45));
    drawBrassScrewHead(ctx, cx + sx * (railWidth * 0.45), cy + sy * (cornerPlateLen - 6.5));
  }

  const midX = feltLeft + feltWidth * 0.5;
  const midPlateW = pocketRadius * 2.25;
  for (const py of [tableTop, tableBottom - railWidth]) {
    ctx.beginPath();
    ctx.roundRect(midX - midPlateW * 0.5, py, midPlateW, railWidth, 4);
    ctx.fill();
    ctx.stroke();
    drawBrassScrewHead(ctx, midX - midPlateW * 0.36, py + railWidth * 0.42);
    drawBrassScrewHead(ctx, midX + midPlateW * 0.36, py + railWidth * 0.42);
  }

  // 18 Chấm định vị Kim Cương
  const drawDiamondSight = (dx: number, dy: number) => {
    const s = 3.2;
    ctx.beginPath();
    ctx.moveTo(dx, dy - s);
    ctx.lineTo(dx + s, dy);
    ctx.lineTo(dx, dy + s);
    ctx.lineTo(dx - s, dy);
    ctx.closePath();
    ctx.fillStyle = '#D5B47A';
    ctx.fill();
  };

  const topRailY = tableTop + railWidth * 0.44;
  const botRailY = tableBottom - railWidth * 0.44;
  const leftRailX = tableLeft + railWidth * 0.44;
  const rightRailX = tableRight - railWidth * 0.44;

  for (const i of [1, 2, 3, 5, 6, 7] as const) {
    const sx = feltLeft + (feltWidth * i) / 8;
    drawDiamondSight(sx, topRailY);
    drawDiamondSight(sx, botRailY);
  }
  for (const j of [1, 2, 3] as const) {
    const sy = feltTop + (feltHeight * j) / 4;
    drawDiamondSight(leftRailX, sy);
    drawDiamondSight(rightRailX, sy);
  }

  // 4. MẶT VẢI NỈ WORSTED FELT (#214E42 -> #17382F) + VÂN HẠT VI MÔ + ĐÈN TRẦN HÌNH ELIP
  const feltAreaLeft = feltLeft - cushionBevelPx;
  const feltAreaTop = feltTop - cushionBevelPx;
  const feltAreaW = feltWidth + cushionBevelPx * 2;
  const feltAreaH = feltHeight + cushionBevelPx * 2;
  const feltCenterX = feltLeft + feltWidth * 0.5;

  const feltGrad = ctx.createRadialGradient(
    feltCenterX,
    centerY,
    feltHeight * 0.08,
    feltCenterX,
    centerY,
    Math.hypot(feltWidth, feltHeight) * 0.62,
  );
  feltGrad.addColorStop(0, '#214E42');
  feltGrad.addColorStop(0.66, '#1B4036');
  feltGrad.addColorStop(1, '#17382F');

  ctx.fillStyle = feltGrad;
  ctx.fillRect(feltAreaLeft, feltAreaTop, feltAreaW, feltAreaH);

  // Lớp hạt sợi nỉ vi mô (Worsted Felt Grain, opacity ~0.038)
  const grainPattern = createFeltGrainPattern(ctx);
  if (grainPattern) {
    ctx.save();
    ctx.fillStyle = grainPattern;
    ctx.fillRect(feltAreaLeft, feltAreaTop, feltAreaW, feltAreaH);
    ctx.restore();
  }

  // Quầng sáng đèn bàn bida hình elip 5 điểm dừng chuyển mịn ra trong suốt (triệt tiêu hoàn toàn viền cứng)
  ctx.save();
  ctx.beginPath();
  ctx.rect(feltAreaLeft, feltAreaTop, feltAreaW, feltAreaH);
  ctx.clip();
  ctx.translate(feltCenterX, centerY);
  const rxGlow = feltWidth * 0.36;
  const ryGlow = feltHeight * 0.44;
  ctx.scale(rxGlow / Math.max(1, ryGlow), 1);
  const lampGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, ryGlow * 1.25);
  lampGrad.addColorStop(0, 'rgba(245, 252, 248, 0.13)');
  lampGrad.addColorStop(0.28, 'rgba(245, 252, 248, 0.07)');
  lampGrad.addColorStop(0.56, 'rgba(245, 252, 248, 0.03)');
  lampGrad.addColorStop(0.82, 'rgba(245, 252, 248, 0.008)');
  lampGrad.addColorStop(1, 'rgba(245, 252, 248, 0)');
  ctx.fillStyle = lampGrad;
  ctx.beginPath();
  ctx.arc(0, 0, ryGlow * 1.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Vạch Khai Cuộc thẳng đứng (25%) & Chấm Khai Cuộc (75%)
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

  // 5. 6 ĐOẠN BĂNG NỈ VÁT GÓC CHUẨN WPA (142° LỖ GÓC / 104° LỖ GIỮA) + BÓNG ĐỔ SÂU MỀM 14PX LÊN MÉP NỈ
  const cornerGap = metrics.cornerMouthOffset;
  const sideGap = metrics.sideMouthOffset;
  const bevel = cushionBevelPx;
  const cornerBevelShift = bevel * 1.28; // tương ứng góc vát ~142° (cot 38° ≈ 1.28)
  const sideBevelShift = bevel * 0.25; // tương ứng góc vát ~104° (tan 14° ≈ 0.25)

  const trapezoids: readonly {
    readonly pts: readonly (readonly [number, number])[];
    readonly lightEdge: readonly [number, number, number, number];
  }[] = [
    {
      pts: [
        [feltLeft + cornerGap - cornerBevelShift, feltTop - bevel],
        [midX - sideGap + sideBevelShift, feltTop - bevel],
        [midX - sideGap, feltTop],
        [feltLeft + cornerGap, feltTop],
      ],
      lightEdge: [feltLeft + cornerGap, feltTop, midX - sideGap, feltTop],
    },
    {
      pts: [
        [midX + sideGap - sideBevelShift, feltTop - bevel],
        [feltRight - cornerGap + cornerBevelShift, feltTop - bevel],
        [feltRight - cornerGap, feltTop],
        [midX + sideGap, feltTop],
      ],
      lightEdge: [midX + sideGap, feltTop, feltRight - cornerGap, feltTop],
    },
    {
      pts: [
        [feltLeft + cornerGap, feltBottom],
        [midX - sideGap, feltBottom],
        [midX - sideGap + sideBevelShift, feltBottom + bevel],
        [feltLeft + cornerGap - cornerBevelShift, feltBottom + bevel],
      ],
      lightEdge: [feltLeft + cornerGap, feltBottom, midX - sideGap, feltBottom],
    },
    {
      pts: [
        [midX + sideGap, feltBottom],
        [feltRight - cornerGap, feltBottom],
        [feltRight - cornerGap + cornerBevelShift, feltBottom + bevel],
        [midX + sideGap - sideBevelShift, feltBottom + bevel],
      ],
      lightEdge: [midX + sideGap, feltBottom, feltRight - cornerGap, feltBottom],
    },
    {
      pts: [
        [feltLeft - bevel, feltTop + cornerGap - cornerBevelShift],
        [feltLeft, feltTop + cornerGap],
        [feltLeft, feltBottom - cornerGap],
        [feltLeft - bevel, feltBottom - cornerGap + cornerBevelShift],
      ],
      lightEdge: [feltLeft, feltTop + cornerGap, feltLeft, feltBottom - cornerGap],
    },
    {
      pts: [
        [feltRight, feltTop + cornerGap],
        [feltRight + bevel, feltTop + cornerGap - cornerBevelShift],
        [feltRight + bevel, feltBottom - cornerGap + cornerBevelShift],
        [feltRight, feltBottom - cornerGap],
      ],
      lightEdge: [feltRight, feltTop + cornerGap, feltRight, feltBottom - cornerGap],
    },
  ];

  for (const trap of trapezoids) {
    ctx.save();
    ctx.beginPath();
    trap.pts.forEach(([x, y], idx) => {
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    ctx.shadowColor = 'rgba(4, 10, 8, 0.62)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 3.5;

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

    ctx.strokeStyle = 'rgba(130, 195, 175, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(trap.lightEdge[0], trap.lightEdge[1]);
    ctx.lineTo(trap.lightEdge[2], trap.lightEdge[3]);
    ctx.stroke();
  }

  // 6. 6 HỐC LỖ KHOÉT SÂU CHUẨN WPA (#09100E) + RỔ DA + 12 CHỐT ĐỒNG KHỚP CHÍNH XÁC HÌNH HỌC VA CHẠM
  for (const pocket of pockets) {
    const holeR = pocket.isCorner ? metrics.cornerDropRadius * 1.06 : metrics.sideDropRadius * 1.06;

    // Viền bóng thềm dốc đá phiến (Pocket Shelf Shading)
    const shelfGrad = ctx.createRadialGradient(
      pocket.x,
      pocket.y,
      holeR * 0.85,
      pocket.x,
      pocket.y,
      holeR * 1.32,
    );
    shelfGrad.addColorStop(0, 'rgba(6, 13, 10, 0.56)');
    shelfGrad.addColorStop(1, 'rgba(6, 13, 10, 0)');
    ctx.fillStyle = shelfGrad;
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, holeR * 1.32, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, holeR + 3.4, 0, Math.PI * 2);
    ctx.fillStyle = '#5B452A';
    ctx.fill();

    // Viền lót da tối bên trong hốc lỗ
    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, holeR + 1.1, 0, Math.PI * 2);
    ctx.fillStyle = '#231A16';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, holeR, 0, Math.PI * 2);
    ctx.fillStyle = '#070C0A';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pocket.x, pocket.y, holeR * 0.82, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(156, 122, 76, 0.34)';
    ctx.lineWidth = 1.1;
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

  return {
    canvas: cacheCanvas,
    width,
    height,
    dpr,
    isDarkTheme,
  };
}

/**
 * Kết xuất toàn bộ Bàn Bida Studio 2.5D: dán lớp bàn tĩnh từ OffscreenCanvas cache (<2.5ms) + lớp bi/gậy/hiệu ứng động.
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
    feltLeft,
    feltWidth,
    ballRadius,
    centerY,
    returnRailX,
    returnRailW,
    returnBallRadius,
  } = metrics;

  const cache = world.staticTableCache;
  if (
    !cache.canvas ||
    cache.width !== width ||
    cache.height !== height ||
    cache.dpr !== world.dpr ||
    cache.isDarkTheme !== isDarkTheme
  ) {
    world.staticTableCache = bakeStaticTableSurface(metrics, world.dpr, isDarkTheme, ctx);
  }

  const lightCenterX = feltLeft + feltWidth * 0.5;
  const lightCenterY = centerY;

  ctx.setTransform(world.dpr, 0, 0, world.dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  if (world.shakeRemainingSec > 0) {
    const shakeProgress = world.shakeRemainingSec / TABLE_SHAKE_DURATION_SEC;
    const amp = TABLE_SHAKE_AMP_PX * shakeProgress;
    ctx.translate(
      Math.sin(world.shakeRemainingSec * 190) * amp,
      Math.cos(world.shakeRemainingSec * 155) * amp,
    );
  }

  // Dán lớp bàn tĩnh đã tiền kết xuất (1 lệnh drawImage cực nhẹ)
  if (world.staticTableCache.canvas && typeof ctx.drawImage === 'function') {
    ctx.drawImage(world.staticTableCache.canvas as CanvasImageSource, 0, 0, width, height);
  }

  // Bi đang lăn & xếp chồng trong máng hồi bi hai thanh ray (có bóng tiếp xúc nhẹ)
  const railCenterX = returnRailX + returnRailW * 0.5;
  for (const rb of world.returnRailQueue) {
    if (rb.pendingSec > 0) continue;
    const fx = 0;
    const fy = Math.sin(rb.rollAngle) * 0.55;
    const fz = Math.cos(rb.rollAngle);
    const fakeBall: BilliardBall = {
      id: rb.id,
      spec: rb.spec,
      x: railCenterX,
      y: rb.y,
      vx: 0,
      vy: 0,
      sx: 0,
      sy: 0,
      omegaZ: 0,
      fx,
      fy,
      fz,
      px: 0,
      py: fz,
      pz: -fy,
      rx: 1,
      ry: 0,
      rz: 0,
      cushionBouncesThisTurn: 0,
      pocketed: false,
      sinking: false,
      sinkProgress: 0,
      sinkTargetX: 0,
      sinkTargetY: 0,
      sinkAngle: 0,
    };
    drawSinglePoolBall3D(ctx, fakeBall, returnBallRadius, lightCenterX, lightCenterY, true);
  }

  // Vùng "Trong Bếp" (Behind the Head String) khi chuẩn bị khai cuộc, Ball-in-Hand Kitchen hoặc đang phải đánh ra ngoài vạch Bếp
  if (
    isInBreakKitchen(world) ||
    (world.ballInHand && world.ballInHandScope === 'kitchen' && !world.rackCleared) ||
    (world.mustShootOutOfKitchen && !world.rackCleared)
  ) {
    const kitchenW = Math.max(0, metrics.headStringX - feltLeft);
    ctx.save();
    ctx.fillStyle = 'rgba(217, 180, 104, 0.065)';
    ctx.fillRect(feltLeft, metrics.feltTop, kitchenW, metrics.feltHeight);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = 'rgba(217, 180, 104, 0.45)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(
      feltLeft + 1,
      metrics.feltTop + 1,
      Math.max(0, kitchenW - 2),
      Math.max(0, metrics.feltHeight - 2),
    );
    ctx.setLineDash([]);
    if (world.mustShootOutOfKitchen || (world.ballInHand && world.ballInHandScope === 'kitchen')) {
      ctx.font = '700 9.5px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(240, 212, 152, 0.86)';
      ctx.fillText(
        world.mustShootOutOfKitchen ? 'TRONG BẾP · ĐÁNH BI NGOÀI VẠCH' : 'ĐẶT BI TRONG BẾP',
        feltLeft + kitchenW * 0.5,
        metrics.feltTop + 10,
      );
    }
    ctx.restore();
  }

  // Vòng chọn lỗ chỉ định (Call Pocket cho Bi 8 hoặc toàn bộ cơ trong chế độ WPA Pro)
  if (isCallPocketRequired(world, world.currentPlayer)) {
    const nowSec = typeof performance !== 'undefined' ? performance.now() * 0.004 : 0;
    const pulse = 0.5 + 0.5 * Math.sin(nowSec);
    const activeCalledId = isShootingForEightBall(world, world.currentPlayer)
      ? world.calledEightPocketId
      : world.calledRegularPocketId;
    const cueBallForSuggest = world.balls[0];
    let suggestedPocketId: number | null = null;
    if (
      activeCalledId === null &&
      world.ruleSet === 'wpa-pro' &&
      !world.shotInProgress &&
      !world.ballInHand &&
      !world.strikeAnim.active &&
      cueBallForSuggest &&
      !cueBallForSuggest.pocketed
    ) {
      const suggestRaycast = computeGhostBallRaycast(
        cueBallForSuggest,
        Math.cos(world.aimAngle),
        Math.sin(world.aimAngle),
        world.spinX,
        world.spinY,
        world.balls,
        metrics,
        Math.max(0.45, world.dragPullPower),
      );
      suggestedPocketId = detectPocketTargetedByRay(
        suggestRaycast.hitBall,
        suggestRaycast.targetDirX,
        suggestRaycast.targetDirY,
        world.balls,
        metrics,
      );
    }
    ctx.save();
    for (const pocket of metrics.pockets) {
      const holeR = pocket.isCorner
        ? metrics.cornerDropRadius * 1.06
        : metrics.sideDropRadius * 1.06;
      const isSelected = activeCalledId === pocket.id;
      const isSuggested = !isSelected && suggestedPocketId === pocket.id;
      ctx.beginPath();
      ctx.arc(pocket.x, pocket.y, holeR + (isSelected ? 4.5 : 3.2 + pulse * 1.8), 0, Math.PI * 2);
      if (isSelected) {
        ctx.fillStyle = 'rgba(59, 122, 101, 0.24)';
        ctx.fill();
        ctx.strokeStyle = '#F3D27A';
        ctx.lineWidth = 2.6;
        ctx.stroke();
      } else if (isSuggested) {
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = 'rgba(213, 180, 122, 0.72)';
        ctx.lineWidth = 2.0;
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = `rgba(194, 149, 72, ${(0.42 + pulse * 0.34).toFixed(3)})`;
        ctx.lineWidth = 2.0;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Vệt phấn trượt trên nỉ khi đánh lực > 65% hoặc xoáy mạnh (fade-out 240ms)
  for (const streak of world.chalkStreaks) {
    if (!streak.active) continue;
    const alpha = Math.max(0, 1 - streak.ageSec / streak.maxAgeSec) * 0.22;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(streak.x1, streak.y1);
    ctx.lineTo(streak.x2, streak.y2);
    ctx.strokeStyle = `rgba(235, 245, 242, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
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

  // Vòng đặt bi cái Ball-in-Hand (#3B7A65 hợp lệ / #B5443C không hợp lệ)
  const cueBall = world.balls[0];
  if (world.ballInHand && !world.rackCleared) {
    const isPlaceOk = world.hoverPlaceValid;
    const preview = isPlaceOk
      ? { x: world.hoverPlaceX, y: world.hoverPlaceY }
      : clampValidCueBallPlacement(world, world.hoverPlaceX, world.hoverPlaceY);
    const ringColor = isPlaceOk ? '#3B7A65' : '#B5443C';
    ctx.save();
    ctx.beginPath();
    ctx.arc(preview.x, preview.y, ballRadius + 5, 0, Math.PI * 2);
    ctx.fillStyle = isPlaceOk ? 'rgba(59, 122, 101, 0.14)' : 'rgba(181, 68, 60, 0.16)';
    ctx.fill();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 2.0;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 8. VẼ 16 VIÊN BI STUDIO 2.5D (bi đang rơi được clip vào lòng hốc lỗ để lặn sâu xuống rổ da thật!)
  for (const ball of world.balls) {
    if (ball.pocketed) continue;
    const scale = ball.sinking ? Math.max(0.56, 1 - ball.sinkProgress * 0.44) : 1;
    const alpha = ball.sinking ? Math.max(0.2, 1 - ball.sinkProgress * 0.72) : 1;
    const darken = ball.sinking ? ball.sinkProgress * 0.65 : 0;

    if (ball.sinking) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.sinkTargetX, ball.sinkTargetY, metrics.cornerDropRadius * 1.12, 0, Math.PI * 2);
      ctx.clip();
      drawSinglePoolBall3D(
        ctx,
        ball,
        ballRadius * scale,
        lightCenterX,
        lightCenterY,
        false,
        alpha,
        darken,
      );
      ctx.restore();
    } else {
      drawSinglePoolBall3D(
        ctx,
        ball,
        ballRadius * scale,
        lightCenterX,
        lightCenterY,
        false,
        alpha,
        darken,
      );
    }
  }

  // 9. TIA NGẮM & BI ẢO CHUẨN 8 BALL POOL + GẬY CƠ THON DÀI 4 KHÚC (~52% BÀN)
  const drawTaperedCueStickAt = (
    originX: number,
    originY: number,
    shotDirX: number,
    shotDirY: number,
    tipOffsetPx: number,
  ) => {
    const cueAngle = Math.atan2(-shotDirY, -shotDirX);
    const cueLength = Math.max(250, Math.round(feltWidth * 0.52));
    const cueScale = Math.max(1, Math.min(1.45, ballRadius / 13.5));
    const tipR = 2.1 * cueScale;
    const buttR = 5.2 * cueScale;
    const radiusAt = (distFromTip: number) => {
      const t = Math.max(0, Math.min(1, distFromTip / cueLength));
      return tipR + (buttR - tipR) * t;
    };

    const tipLen = 3.5 * cueScale;
    const ferruleEnd = tipLen + 6.0 * cueScale;
    const shaftEnd = cueLength * 0.58;
    const bumperStart = cueLength - 6.5 * cueScale;

    // Đổ bóng mềm lệch xuống dưới (rgba(8, 16, 14, 0.42), offsetY: 5px) để gậy cơ nổi 3D
    ctx.save();
    ctx.translate(originX, originY + 5);
    ctx.rotate(cueAngle);
    ctx.beginPath();
    ctx.moveTo(tipOffsetPx, -tipR);
    ctx.lineTo(tipOffsetPx + cueLength, -buttR);
    ctx.lineTo(tipOffsetPx + cueLength, buttR);
    ctx.lineTo(tipOffsetPx, tipR);
    ctx.closePath();
    ctx.fillStyle = 'rgba(8, 16, 14, 0.42)';
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(cueAngle);

    // 4. Đầu da phủ lơ màu Lam Ngọc (#49768F, dài 3.5px)
    const tipX = tipOffsetPx;
    ctx.beginPath();
    ctx.arc(tipX + 1.2, 0, tipR, Math.PI * 0.5, Math.PI * 1.5);
    ctx.lineTo(tipX + tipLen, -radiusAt(tipLen));
    ctx.lineTo(tipX + tipLen, radiusAt(tipLen));
    ctx.closePath();
    ctx.fillStyle = '#49768F';
    ctx.fill();

    // 3. Phíp đầu gậy Trắng Sứ (#FAFBF9, dài 6px)
    ctx.beginPath();
    ctx.moveTo(tipX + tipLen, -radiusAt(tipLen));
    ctx.lineTo(tipX + ferruleEnd, -radiusAt(ferruleEnd));
    ctx.lineTo(tipX + ferruleEnd, radiusAt(ferruleEnd));
    ctx.lineTo(tipX + tipLen, radiusAt(tipLen));
    ctx.closePath();
    ctx.fillStyle = '#FAFBF9';
    ctx.fill();

    // 2. Thân gậy gỗ phong sáng (#E6D3B3 -> #C9AE82) + vệt bắt sáng dọc thân
    const shaftGrad = ctx.createLinearGradient(0, -4, 0, 4);
    shaftGrad.addColorStop(0, '#F3E7CF');
    shaftGrad.addColorStop(0.45, '#E6D3B3');
    shaftGrad.addColorStop(1, '#C9AE82');
    ctx.beginPath();
    ctx.moveTo(tipX + ferruleEnd, -radiusAt(ferruleEnd));
    ctx.lineTo(tipX + shaftEnd, -radiusAt(shaftEnd));
    ctx.lineTo(tipX + shaftEnd, radiusAt(shaftEnd));
    ctx.lineTo(tipX + ferruleEnd, radiusAt(ferruleEnd));
    ctx.closePath();
    ctx.fillStyle = shaftGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(tipX + ferruleEnd + 2, -radiusAt(ferruleEnd) * 0.45);
    ctx.lineTo(tipX + shaftEnd - 2, -radiusAt(shaftEnd) * 0.45);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 1. Chuôi gỗ Đá Phiến trầm (#1E2D29) khảm 3 vòng nhẫn Đồng Cổ (#C29548) + Đế cao su đen (#111816)
    const handleGrad = ctx.createLinearGradient(0, -5.2, 0, 5.2);
    handleGrad.addColorStop(0, '#2C413C');
    handleGrad.addColorStop(0.45, '#1E2D29');
    handleGrad.addColorStop(1, '#121C19');
    ctx.beginPath();
    ctx.moveTo(tipX + shaftEnd, -radiusAt(shaftEnd));
    ctx.lineTo(tipX + bumperStart, -radiusAt(bumperStart));
    ctx.lineTo(tipX + bumperStart, radiusAt(bumperStart));
    ctx.lineTo(tipX + shaftEnd, radiusAt(shaftEnd));
    ctx.closePath();
    ctx.fillStyle = handleGrad;
    ctx.fill();

    // 3 vòng nhẫn Đồng Cổ (#C29548)
    for (const ringPos of [
      shaftEnd + 1.5,
      (shaftEnd + bumperStart) * 0.52,
      bumperStart - 3.5,
    ] as const) {
      const rr = radiusAt(ringPos);
      ctx.fillStyle = '#C29548';
      ctx.fillRect(tipX + ringPos, -rr, 2.2, rr * 2);
    }

    // Đế cao su đen (#111816) ở cuối chuôi
    ctx.beginPath();
    ctx.moveTo(tipX + bumperStart, -radiusAt(bumperStart));
    ctx.lineTo(tipX + cueLength, -buttR);
    ctx.lineTo(tipX + cueLength, buttR);
    ctx.lineTo(tipX + bumperStart, radiusAt(bumperStart));
    ctx.closePath();
    ctx.fillStyle = '#111816';
    ctx.fill();

    ctx.restore();
  };

  // Huy hiệu "SAFETY" ngay gần bi cái khi người chơi hoặc AI bật chế độ Chạy đạn
  if (world.isSafetyActive && cueBall && !cueBall.pocketed && !world.rackCleared) {
    const bx = Math.max(metrics.feltLeft + 34, Math.min(metrics.feltRight - 34, cueBall.x));
    const by = Math.max(metrics.feltTop + 18, cueBall.y - ballRadius - 18);
    ctx.save();
    ctx.fillStyle = 'rgba(18, 34, 28, 0.9)';
    ctx.strokeStyle = 'rgba(213, 180, 122, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(bx - 27, by - 9, 54, 17, 4);
    ctx.fill();
    ctx.stroke();
    ctx.font = '700 8.5px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#E8C57B';
    ctx.fillText('SAFETY', bx, by);
    ctx.restore();
  }

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
    const previewPower = Math.max(0.45, world.dragPullPower);
    const raycast = computeGhostBallRaycast(
      cueBall,
      dirX,
      dirY,
      world.spinX,
      world.spinY,
      world.balls,
      metrics,
      previewPower,
    );

    const isIllegalHit =
      raycast.hitBall !== null &&
      (!isBallLegalTarget(world, raycast.hitBall, world.currentPlayer) ||
        (world.mustShootOutOfKitchen &&
          !isBallKitchenExempted(world, raycast.hitBall, world.currentPlayer)));

    ctx.save();
    if (world.guidelineMode === 'pro') {
      // Chế độ Chuyên nghiệp (Pro): chỉ hiển thị vạch căn cơ ngắn 58px, không hiện Bi Ảo
      const proLen = 58;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(cueBall.x + raycast.launchDirX * proLen, cueBall.y + raycast.launchDirY * proLen);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      // Tia ngắm chính Trắng Sứ #FFFFFF (2.0px) bọc viền tối mỏng (rgba(10, 20, 17, 0.58), 3.8px)
      ctx.beginPath();
      ctx.moveTo(cueBall.x, cueBall.y);
      ctx.lineTo(raycast.ghostX, raycast.ghostY);
      ctx.strokeStyle = 'rgba(10, 20, 17, 0.58)';
      ctx.lineWidth = 3.8;
      ctx.lineCap = 'round';
      ctx.stroke();

      ctx.strokeStyle = isIllegalHit ? '#E05247' : '#FFFFFF';
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Vòng Bi Ảo (Ghost Ball) hoặc Biểu tượng vòng tròn dấu chéo đỏ (⊘) khi ngắm nhầm bi đối thủ
      if (isIllegalHit) {
        ctx.beginPath();
        ctx.arc(raycast.ghostX, raycast.ghostY, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(224, 82, 71, 0.22)';
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
        ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(10, 20, 17, 0.58)';
        ctx.lineWidth = 3.8;
        ctx.stroke();

        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.0;
        ctx.stroke();

        // Đường chạy cong vật lý thật của bi cái từ mini-sim (hiển thị chính xác 90° Stun, 30° Follow, vòng cung Draw!)
        const isClubGuide = world.guidelineMode === 'club';
        const pathPts = raycast.cuePathPoints;
        if (pathPts.length >= 2) {
          const maxPts = isClubGuide
            ? Math.max(2, Math.ceil(pathPts.length * 0.45))
            : pathPts.length;
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(pathPts[0]!.x, pathPts[0]!.y);
          for (let i = 1; i < maxPts; i += 1) {
            ctx.lineTo(pathPts[i]!.x, pathPts[i]!.y);
          }
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 1.65;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Tia bật bi mục tiêu sắc nét (đầy đủ 64px ở Hỗ trợ, ngắn 42% ở CLB — đã tính sẵn CIT/SIT)
        if (raycast.hitBall) {
          const guideLen = isClubGuide
            ? OBJECT_GUIDE_VECTOR_LEN_PX * 0.42
            : OBJECT_GUIDE_VECTOR_LEN_PX;
          const startX = raycast.hitBall.x;
          const startY = raycast.hitBall.y;
          const tdx = raycast.targetDirX;
          const tdy = raycast.targetDirY;
          const endX = startX + tdx * guideLen;
          const endY = startY + tdy * guideLen;
          const arrowLen = isClubGuide ? 6.5 : 8;
          const arrowSpread = isClubGuide ? 3.8 : 4.4;
          const perpX = -tdy;
          const perpY = tdx;
          const backX = endX - tdx * arrowLen;
          const backY = endY - tdy * arrowLen;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = 'rgba(10, 20, 17, 0.58)';
          ctx.lineWidth = 3.8;
          ctx.stroke();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2.0;
          ctx.stroke();

          // Mũi tên mảnh đầu tia bật mục tiêu
          ctx.beginPath();
          ctx.moveTo(backX + perpX * arrowSpread, backY + perpY * arrowSpread);
          ctx.lineTo(endX, endY);
          ctx.lineTo(backX - perpX * arrowSpread, backY - perpY * arrowSpread);
          ctx.strokeStyle = 'rgba(10, 20, 17, 0.58)';
          ctx.lineWidth = 3.6;
          ctx.stroke();
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 1.9;
          ctx.stroke();
        }
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

    // Gậy cơ căn dịch ngang theo điểm ép phê (spinX) để người chơi thấy ngay vị trí tiếp xúc đầu da trên bi cái
    const cueLatShift = world.spinX * ballRadius * 0.42;
    const cueOriginX = cueBall.x - dirY * cueLatShift;
    const cueOriginY = cueBall.y + dirX * cueLatShift;
    const tipOffset = ballRadius + 7 + world.dragPullPower * 52;
    drawTaperedCueStickAt(cueOriginX, cueOriginY, dirX, dirY, tipOffset);
  } else if (world.strikeAnim.active && cueBall && !cueBall.pocketed) {
    const progress = Math.min(1, world.strikeAnim.elapsedSec / world.strikeAnim.durationSec);
    const eased = 1 - Math.pow(1 - progress, 3);
    const cueLatShift = world.strikeAnim.spinX * ballRadius * 0.42;
    const cueOriginX = cueBall.x - world.strikeAnim.dirY * cueLatShift;
    const cueOriginY = cueBall.y + world.strikeAnim.dirX * cueLatShift;
    const tipOffset = world.strikeAnim.pullBackOffsetPx * (1 - eased) + ballRadius * eased;
    drawTaperedCueStickAt(
      cueOriginX,
      cueOriginY,
      world.strikeAnim.dirX,
      world.strikeAnim.dirY,
      tipOffset,
    );
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
