import {
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  RotateCcw,
  Trophy,
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
  setBilliardSoundEnabled,
  unlockBilliardAudio,
} from '@/utils/billiardAudio';

export interface MineralBilliardsStageProps {
  readonly className?: string;
}

const SUBSTEPS = 6;
const BALL_RESTITUTION = 0.96;
const CUSHION_RESTITUTION = 0.86;
const STOP_SPEED_PX_PER_FRAME = 0.08;
const CANCEL_PULL_DISTANCE_PX = 12;
const MAX_PULL_DISTANCE_PX = 155;
const MAX_SHOT_SPEED_PX_PER_FRAME = 23.5;
const POCKET_SINK_DURATION_SEC = 0.18;
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
}

interface FloatingBannerText {
  active: boolean;
  x: number;
  y: number;
  text: string;
  ageSec: number;
  durationSec: number;
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
}

interface GhostBallRaycastResult {
  readonly ghostX: number;
  readonly ghostY: number;
  readonly hitBall: BilliardBall | null;
  readonly targetDirX: number;
  readonly targetDirY: number;
}

interface BilliardsWorld {
  metrics: TableMetrics;
  dpr: number;
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
  hoverPlaceX: number;
  hoverPlaceY: number;
  shotInProgress: boolean;
  pocketedThisTurn: number;
  ballInHand: boolean;
  shots: number;
  combo: number;
  rackCleared: boolean;
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

  // Bán kính bi ~13px-15px trên desktop, tự co giãn theo bàn
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
  };
}

/**
 * Xếp 1 Bi cái ở vạch khai cuộc (baulk line) và 6 Bi mục tiêu thành hình tam giác 1-2-3 chuẩn tâm đối diện.
 */
function buildRackBalls(metrics: TableMetrics): BilliardBall[] {
  const r = metrics.ballRadius;
  const rowGapX = r * Math.sqrt(3) * 1.03;
  const colGapY = r * 2.05;

  // Tam giác 1-2-3 (Đỉnh bi 1 tại footSpotX, hàng 2 gồm bi 2-3, hàng 3 gồm bi 4-5-6)
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
      pocketed: false,
      sinking: false,
      sinkProgress: 0,
      sinkTargetX: 0,
      sinkTargetY: 0,
    };
  });

  return [cueBall, ...targetBalls];
}

function createBilliardsWorld(width = 960, height = 480): BilliardsWorld {
  const metrics = computeTableMetrics(width, height);
  return {
    metrics,
    dpr: 1,
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
    sparks: Array.from({ length: 36 }, () => ({
      active: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ageSec: 0,
      maxAgeSec: 0.22,
    })),
    sparkCursor: 0,
    floatTexts: Array.from({ length: 10 }, () => ({
      active: false,
      x: 0,
      y: 0,
      text: '',
      ageSec: 0,
      durationSec: 1.05,
    })),
    floatCursor: 0,
    isAiming: false,
    aimStartX: metrics.baulkLineX,
    aimStartY: metrics.centerY,
    pointerX: metrics.baulkLineX,
    pointerY: metrics.centerY,
    hoverPlaceX: metrics.baulkLineX,
    hoverPlaceY: metrics.centerY,
    shotInProgress: false,
    pocketedThisTurn: 0,
    ballInHand: false,
    shots: 0,
    combo: 0,
    rackCleared: false,
  };
}

/**
 * Tính toán giao điểm đầu tiên dọc hướng ngắm bắn (Ghost Ball Raycast) với thành băng hoặc 6 bi mục tiêu.
 */
function computeGhostBallRaycast(
  cueBall: BilliardBall,
  dirX: number,
  dirY: number,
  balls: readonly BilliardBall[],
  metrics: TableMetrics,
): GhostBallRaycastResult {
  const r = metrics.ballRadius;
  const twoR = r * 2;
  let minDistance = Number.POSITIVE_INFINITY;
  let hitBall: BilliardBall | null = null;

  // 1. Kiểm tra giao điểm với thành băng (bi cái tâm cách băng đúng r)
  const minX = metrics.feltLeft + r;
  const maxX = metrics.feltRight - r;
  const minY = metrics.feltTop + r;
  const maxY = metrics.feltBottom - r;

  if (dirX > 1e-5) {
    const tRight = (maxX - cueBall.x) / dirX;
    if (tRight > 0 && tRight < minDistance) minDistance = tRight;
  } else if (dirX < -1e-5) {
    const tLeft = (minX - cueBall.x) / dirX;
    if (tLeft > 0 && tLeft < minDistance) minDistance = tLeft;
  }

  if (dirY > 1e-5) {
    const tBottom = (maxY - cueBall.y) / dirY;
    if (tBottom > 0 && tBottom < minDistance) minDistance = tBottom;
  } else if (dirY < -1e-5) {
    const tTop = (minY - cueBall.y) / dirY;
    if (tTop > 0 && tTop < minDistance) minDistance = tTop;
  }

  // 2. Kiểm tra giao điểm tia với hình tròn mở rộng bán kính 2*R_ball quanh mỗi bi mục tiêu
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
  if (hitBall) {
    const nx = hitBall.x - ghostX;
    const ny = hitBall.y - ghostY;
    const nLen = Math.hypot(nx, ny) || 1;
    targetDirX = nx / nLen;
    targetDirY = ny / nLen;
  }

  return {
    ghostX,
    ghostY,
    hitBall,
    targetDirX,
    targetDirY,
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
    // Bỏ qua lỗi quyền truy cập storage
  }
}

/**
 * SCREEN 3: SÂN KHẤU BIDA KHOÁNG THẠCH 6 BI (120FPS MINERAL BILLIARDS MINI-GAME)
 * - Vật lý va chạm đàn hồi chính xác với 6 bước con (SUBSTEPS = 6) chống xuyên bi ở 120fps (dtScale).
 * - Gậy cơ trực quan, tia ngắm Ghost Ball Raycast + dự đoán hướng bật của bi mục tiêu, thanh lực đổi màu.
 * - Chế độ đặt lại bi cái tự do (Ball-in-Hand) khi bi cái rơi lỗ hoặc bấm nút Đặt lại bi cái.
 * - Tổng hợp âm thanh Web Audio API thuần túy (playCueStrike, playBallClack, playCushionBounce, playPocketDrop, playRackClear).
 */
export function MineralBilliardsStage({ className }: MineralBilliardsStageProps = {}) {
  const prefersReducedMotion = useReducedMotion();

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [shots, setShots] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestRecord, setBestRecord] = useState<number | null>(() => readBestRecordFromStorage());
  const [ballInHand, setBallInHand] = useState(false);
  const [rackCleared, setRackCleared] = useState(false);
  const [pocketedBallIds, setPocketedBallIds] = useState<readonly number[]>([]);

  const sectionRef = useRef<HTMLElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setRackCleared(w.rackCleared);
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
      }
    },
    [getWorld],
  );

  const spawnFloatingText = useCallback(
    (x: number, y: number, text: string) => {
      const w = getWorld();
      const item = w.floatTexts[w.floatCursor % w.floatTexts.length];
      w.floatCursor = (w.floatCursor + 1) % w.floatTexts.length;
      if (!item) return;
      item.active = true;
      item.x = x;
      item.y = y;
      item.text = text;
      item.ageSec = 0;
      item.durationSec = 1.1;
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

      // Tránh đặt chồng lên miệng lỗ hoặc chồng lên các bi mục tiêu đang còn trên bàn
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

  // Nút "Xếp ván mới": Reset tam giác 6 bi khoáng thạch & bi cái
  const handleNewRack = useCallback(() => {
    const w = getWorld();
    w.balls = buildRackBalls(w.metrics);
    w.isAiming = false;
    w.shotInProgress = false;
    w.pocketedThisTurn = 0;
    w.ballInHand = false;
    w.shots = 0;
    w.combo = 0;
    w.rackCleared = false;
    syncReactHudFromWorld();
  }, [getWorld, syncReactHudFromWorld]);

  // Nút "Đặt lại bi cái": Bật chế độ Ball-in-Hand để người chơi đặt bi cái sang vị trí thuận lợi
  const handleActivateBallInHand = useCallback(() => {
    const w = getWorld();
    const anyMoving = w.balls.some(
      (b) => !b.pocketed && (Math.hypot(b.vx, b.vy) > STOP_SPEED_PX_PER_FRAME || b.sinking),
    );
    if (anyMoving || w.rackCleared) return;

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

      // Quy đổi tương đối tọa độ các viên bi khi thay đổi kích thước khung nhìn
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

    const stepPhysics = (dtSeconds: number, dtScale: number) => {
      const { metrics } = w;
      const r = metrics.ballRadius;
      const twoR = r * 2;
      const subDtScale = dtScale / SUBSTEPS;
      const subFriction = Math.pow(0.986, subDtScale);
      const pocketCaptureDist = metrics.pocketRadius * 0.92;
      const pocketMouthAllowance = metrics.pocketRadius * 1.18;

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
            // Bi cái rơi lỗ -> Bật chế độ Ball-in-Hand ở vị trí hợp lệ
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
      for (let step = 0; step < SUBSTEPS; step += 1) {
        for (const ball of w.balls) {
          if (ball.pocketed || ball.sinking) continue;

          ball.x += ball.vx * subDtScale;
          ball.y += ball.vy * subDtScale;
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
              spawnFloatingText(
                droppedPocket.x,
                Math.max(metrics.feltTop + 28, droppedPocket.y - 18),
                'RƠI BI CÁI',
              );
              playCushionBounce(0.5);
            } else {
              w.pocketedThisTurn += 1;
              w.combo += 1;
              const banner = w.combo >= 2 ? `COMBO x${w.combo}!` : '+1';
              spawnFloatingText(
                droppedPocket.x,
                Math.max(metrics.feltTop + 28, droppedPocket.y - 16),
                banner,
              );
              playPocketDrop(w.combo);
            }
            continue;
          }

          // Kiểm tra xem bi có đang ở sát miệng lỗ không (chừa khoảng trống miệng lỗ để bi lăn tự nhiên)
          const nearAnyPocketMouth = metrics.pockets.some(
            (p) => Math.hypot(ball.x - p.x, ball.y - p.y) < pocketMouthAllowance,
          );
          if (nearAnyPocketMouth) continue;

          // Va chạm thành băng 4 cạnh với hệ số đàn hồi 0.86
          let cushionImpact = 0;
          if (ball.x - r < metrics.feltLeft) {
            ball.x = metrics.feltLeft + r;
            cushionImpact = Math.max(cushionImpact, Math.abs(ball.vx));
            ball.vx = Math.abs(ball.vx) * CUSHION_RESTITUTION;
          } else if (ball.x + r > metrics.feltRight) {
            ball.x = metrics.feltRight - r;
            cushionImpact = Math.max(cushionImpact, Math.abs(ball.vx));
            ball.vx = -Math.abs(ball.vx) * CUSHION_RESTITUTION;
          }

          if (ball.y - r < metrics.feltTop) {
            ball.y = metrics.feltTop + r;
            cushionImpact = Math.max(cushionImpact, Math.abs(ball.vy));
            ball.vy = Math.abs(ball.vy) * CUSHION_RESTITUTION;
          } else if (ball.y + r > metrics.feltBottom) {
            ball.y = metrics.feltBottom - r;
            cushionImpact = Math.max(cushionImpact, Math.abs(ball.vy));
            ball.vy = -Math.abs(ball.vy) * CUSHION_RESTITUTION;
          }

          if (cushionImpact > 0.45) {
            playCushionBounce(Math.min(1, cushionImpact / 14));
          }
        }

        // Va chạm Bi – Bi: tách overlap/2 mỗi bi và bảo toàn động lượng 2D (restitution = 0.96)
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
                const impulse = -(1 + BALL_RESTITUTION) * velAlongNormal * 0.5;
                a.vx -= impulse * nx;
                a.vy -= impulse * ny;
                b.vx += impulse * nx;
                b.vy += impulse * ny;

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

      // 3. Cập nhật kết thúc lượt cơ & kiểm tra dọn sạch cả 6 bi
      if (w.shotInProgress) {
        const stillMoving = w.balls.some(
          (b) => !b.pocketed && (b.sinking || Math.hypot(b.vx, b.vy) > STOP_SPEED_PX_PER_FRAME),
        );
        if (!stillMoving) {
          w.shotInProgress = false;
          if (w.pocketedThisTurn === 0) {
            w.combo = 0;
          }
          w.pocketedThisTurn = 0;

          const allTargetsCleared = w.balls.filter((b) => b.id >= 1).every((b) => b.pocketed);

          if (allTargetsCleared && !w.rackCleared) {
            w.rackCleared = true;
            w.ballInHand = false;
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

      // 4. Cập nhật sóng vàng quanh lỗ, tia sáng va chạm & chữ nổi combo
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
      } = metrics;

      ctx.setTransform(w.dpr, 0, 0, w.dpr, 0, 0);

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

      // Đổ bóng viền trong mặt nỉ (inner cushion shadow) & nẹp đồng mảnh quanh băng
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
        if (i === 4) continue; // Vị trí lỗ giữa
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

      // 5. Vẽ 6 Lỗ Bida (4 góc + 2 giữa): Vành đồng bán nguyệt #9C7A4C, lòng lỗ sâu #0D1815
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

      // Vòng sóng vàng lan tỏa quanh lỗ mỗi khi bi rơi vào
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

      // 6. Chế độ Đặt lại Bi Cái (Ball-in-Hand): hiển thị bóng bi cái xem trước và thông báo trên bàn
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

      // 7. Vẽ Tia Ngắm Ghost Ball Raycast, Vòng Lực & Gậy Cơ khi người chơi kéo ngắm
      if (w.isAiming && cueBall && !cueBall.pocketed && !w.shotInProgress && !w.rackCleared) {
        const pullDx = w.pointerX - cueBall.x;
        const pullDy = w.pointerY - cueBall.y;
        const pullDist = Math.hypot(pullDx, pullDy);
        const isCancelled = pullDist < CANCEL_PULL_DISTANCE_PX;

        // Vòng cung lực quanh bi cái (Ngọc Bích -> Vàng Đồng -> Đất Nung)
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

        if (!isCancelled && pullDist > 0.001) {
          // Hướng bắn ngược với hướng kéo chuột (Slingshot Pull-Back)
          const dirX = -pullDx / pullDist;
          const dirY = -pullDy / pullDist;

          const raycast = computeGhostBallRaycast(cueBall, dirX, dirY, w.balls, metrics);

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

          // Nếu trúng bi mục tiêu: vẽ đoạn tia ngắn dự đoán hướng bật của bi mục tiêu
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

          // Vẽ Gậy Cơ (Cue Stick): Thân Đá Phiến khảm vạch đồng, đầu bịt sứ lùi ra sau theo lực kéo
          const cueAngle = Math.atan2(-dirY, -dirX);
          const tipOffset = ballRadius + 8 + power * 46;
          const cueLength = Math.min(210, feltWidth * 0.28);

          ctx.save();
          ctx.translate(cueBall.x, cueBall.y);
          ctx.rotate(cueAngle);

          // Bóng gậy cơ
          ctx.beginPath();
          ctx.moveTo(tipOffset + 2, 4);
          ctx.lineTo(tipOffset + cueLength + 2, 5);
          ctx.strokeStyle = 'rgba(8, 16, 14, 0.38)';
          ctx.lineWidth = 6;
          ctx.lineCap = 'round';
          ctx.stroke();

          // Thân gậy cơ Đá Phiến & Gỗ Trầm
          const cueGrad = ctx.createLinearGradient(tipOffset, 0, tipOffset + cueLength, 0);
          cueGrad.addColorStop(0, '#E8ECEA');
          cueGrad.addColorStop(0.04, '#FAFBF9'); // Đầu bịt sứ
          cueGrad.addColorStop(0.05, '#9C7A4C'); // Khâu đồng
          cueGrad.addColorStop(0.55, '#C9A878'); // Ngọn gỗ sáng
          cueGrad.addColorStop(0.58, '#9C7A4C'); // Vạch khảm đồng
          cueGrad.addColorStop(1, '#1E332E'); // Chuôi Đá Phiến Trầm

          ctx.beginPath();
          ctx.moveTo(tipOffset, -2.1);
          ctx.lineTo(tipOffset + cueLength, -4.4);
          ctx.lineTo(tipOffset + cueLength, 4.4);
          ctx.lineTo(tipOffset, 2.1);
          ctx.closePath();
          ctx.fillStyle = cueGrad;
          ctx.fill();
          ctx.strokeStyle = 'rgba(156, 122, 76, 0.55)';
          ctx.lineWidth = 0.8;
          ctx.stroke();

          ctx.restore();
        }
        ctx.restore();
      }

      // 8. Vẽ 7 Viên Bi 3D Khoáng Thạch (1 Bi cái Trắng Sứ + 6 Bi mục tiêu đánh số 1..6)
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

        // Lõi trắng nhỏ & số thứ tự 1..6 cho 6 bi mục tiêu
        if (ball.id >= 1) {
          ctx.beginPath();
          ctx.arc(ball.x, ball.y, r * 0.48, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(250, 251, 249, 0.92)';
          ctx.fill();

          ctx.font = `700 ${Math.max(8, Math.round(r * 0.64))}px "JetBrains Mono", monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = '#142622';
          ctx.fillText(String(ball.id), ball.x, ball.y + 0.5);
        }

        // Điểm lóe sáng cầu 3D (specular highlight)
        ctx.beginPath();
        ctx.arc(ball.x - r * 0.36, ball.y - r * 0.36, r * 0.22, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        ctx.fill();

        ctx.restore();
      }

      // 9. Vẽ các hạt tia sáng nhỏ tại điểm chạm Bi - Bi
      for (const spark of w.sparks) {
        if (!spark.active) continue;
        const lifeRatio = 1 - spark.ageSec / spark.maxAgeSec;
        ctx.save();
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, 1.8 * lifeRatio, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(246, 224, 168, ${lifeRatio.toFixed(3)})`;
        ctx.fill();
        ctx.restore();
      }

      // 10. Vẽ chữ nổi +1 / COMBO x2! màu vàng đồng khi ăn bi
      for (const ft of w.floatTexts) {
        if (!ft.active) continue;
        const alpha = Math.max(0, 1 - ft.ageSec / ft.durationSec);
        ctx.save();
        ctx.font = '700 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = `rgba(238, 208, 142, ${alpha.toFixed(3)})`;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }
    };

    if (prefersReducedMotion) {
      drawTableAndBalls();
      window.addEventListener('resize', updateSize, { passive: true });
      return () => {
        window.removeEventListener('resize', updateSize);
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
    };
  }, [
    clampValidCueBallPlacement,
    getWorld,
    prefersReducedMotion,
    spawnCollisionSparks,
    spawnFloatingText,
    spawnPocketRipple,
    syncReactHudFromWorld,
  ]);

  // Chuyển đổi tọa độ chuột / chạm về hệ tọa độ logic của bàn bida
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
    if (w.rackCleared) return;

    const anyMoving = w.balls.some(
      (b) => !b.pocketed && (b.sinking || Math.hypot(b.vx, b.vy) > STOP_SPEED_PX_PER_FRAME),
    );
    if (anyMoving) return;

    const pt = getCanvasPoint(event);
    const cueBall = w.balls[0];
    if (!cueBall) return;

    // Nếu đang ở chế độ Đặt lại bi cái (Ball-in-Hand): bấm để đặt bi cái ngay tại vị trí hợp lệ
    if (w.ballInHand) {
      const placed = clampValidCueBallPlacement(pt.x, pt.y);
      cueBall.x = placed.x;
      cueBall.y = placed.y;
      cueBall.vx = 0;
      cueBall.vy = 0;
      cueBall.pocketed = false;
      cueBall.sinking = false;
      w.ballInHand = false;
      spawnPocketRipple(placed.x, placed.y, w.metrics.ballRadius * 2.2);
      syncReactHudFromWorld();
      return;
    }

    // Bắt đầu kéo ngắm (cho phép nhấn giữ từ bi cái hoặc vùng xung quanh trên bàn)
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Bỏ qua trong môi trường JSDOM không hỗ trợ setPointerCapture
    }

    w.isAiming = true;
    w.aimStartX = pt.x;
    w.aimStartY = pt.y;
    w.pointerX = pt.x;
    w.pointerY = pt.y;
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

    const pullDx = w.pointerX - cueBall.x;
    const pullDy = w.pointerY - cueBall.y;
    const pullDist = Math.hypot(pullDx, pullDy);

    // Kéo ngược lại sát tâm (< 12px) để hủy cú đánh
    if (pullDist < CANCEL_PULL_DISTANCE_PX) {
      return;
    }

    const power = Math.min(
      1,
      (pullDist - CANCEL_PULL_DISTANCE_PX) / (MAX_PULL_DISTANCE_PX - CANCEL_PULL_DISTANCE_PX),
    );
    const launchSpeed = (0.14 + power * 0.86) * MAX_SHOT_SPEED_PX_PER_FRAME;
    const dirX = -pullDx / pullDist;
    const dirY = -pullDy / pullDist;

    cueBall.vx = dirX * launchSpeed;
    cueBall.vy = dirY * launchSpeed;
    w.shotInProgress = true;
    w.pocketedThisTurn = 0;
    w.shots += 1;

    playCueStrike(power);
    syncReactHudFromWorld();
  };

  const handlePointerCancel = () => {
    const w = getWorld();
    w.isAiming = false;
  };

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

          {/* A. Thanh Header Sân Khấu Gọn Sắc Nét */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E2E8E5] bg-[#F7F9F8] px-5 py-3.5 sm:px-6 dark:border-[#243B32] dark:bg-[#0E1A15]">
            <div className="flex flex-wrap items-center gap-3">
              <p
                data-testid="billiards-play-hint"
                className="font-mono text-xs font-medium text-[#2D423D] dark:text-[#C9D6D0]"
              >
                Kéo ngược từ bi cái để ngắm &amp; chỉnh lực · Thả để đánh · Kéo về tâm để hủy
              </p>

              {/* 6 chấm trạng thái bi còn lại / đã ăn */}
              <div
                data-testid="billiards-ball-status-dots"
                aria-label="Trạng thái 6 bi khoáng thạch"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#DCE4E0] bg-[#FAFBF9] px-2.5 py-1 dark:border-[#244335] dark:bg-[#12241C]"
              >
                {MINERAL_TARGET_BALL_SPECS.map((spec) => {
                  const isPocketed = pocketedBallIds.includes(spec.number);
                  return (
                    <span
                      key={spec.number}
                      data-testid={`billiard-status-dot-${spec.number}`}
                      data-pocketed={isPocketed ? 'true' : 'false'}
                      title={`Bi số ${spec.number} (${spec.name}): ${isPocketed ? 'Đã ăn' : 'Còn trên bàn'}`}
                      style={{
                        backgroundColor: isPocketed ? 'transparent' : spec.colorHex,
                        borderColor: spec.colorHex,
                      }}
                      className={cn(
                        'inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border font-mono text-[8.5px] font-bold transition-all duration-200',
                        isPocketed ? 'scale-90 opacity-35' : 'text-[#FAFBF9] shadow-2xs',
                      )}
                    >
                      {isPocketed ? '' : spec.number}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Cụm chỉ số thời gian thực (Số cơ, Combo, Kỷ lục) + Nút Âm thanh */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
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
                aria-label="Bàn Bida Khoáng Thạch 6 Bi tương tác 120fps"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
                className="block h-full w-full cursor-crosshair touch-none select-none"
              />

              {/* Thông báo ngắn trên bàn khi Bi cái rơi lỗ hoặc chế độ Đặt lại bi cái (Ball-in-Hand) */}
              {ballInHand && !rackCleared && (
                <div
                  data-testid="billiards-ball-in-hand-banner"
                  className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#D5B47A]/80 bg-[#142622]/90 px-4 py-1.5 font-mono text-xs font-semibold text-[#FAFBF9] shadow-lg backdrop-blur-xs"
                >
                  Bi cái rơi lỗ — Bấm chọn vị trí đặt lại
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
                      Dọn bàn hoàn hảo · {shots} cơ
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

          {/* E. Thanh Điều Khiển Đáy Khung */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8E5] bg-[#F7F9F8] px-5 py-3.5 sm:px-6 dark:border-[#243B32] dark:bg-[#0E1A15]">
            <div
              role="group"
              aria-label="Điều khiển bàn bida khoáng thạch"
              className="flex flex-wrap items-center gap-2"
            >
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
