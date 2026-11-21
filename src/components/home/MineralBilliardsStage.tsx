import {
  BookOpen,
  Bot,
  Lock,
  RotateCcw,
  Shield,
  Trophy,
  Unlock,
  User,
  Users,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  acceptStalemateRerack,
  ALL_POOL_BALL_SPECS,
  applyEightOnBreakDecision,
  applyIllegalBreakDecision,
  areAllLegalTargetsInKitchen,
  buildOfficial15BallRack,
  clampBreakCueBallPlacement,
  clampValidCueBallPlacement,
  computeAiShotPlan,
  computeStereoPan,
  computeTableMetrics,
  createBilliardsWorld,
  evaluateAiIllegalBreakChoice,
  FINE_AIM_STEP_RAD,
  isCallPocketRequired,
  isCueBallPlacementValid,
  isInBreakKitchen,
  isShootingForEightBall,
  normalizeAngleDiff,
  PRECISION_AIM_FACTOR,
  renderBilliardsStageFrame,
  SOLID_BALL_SPECS,
  spawnChalkDustBurst,
  spawnChalkStreak,
  stepBilliardsPhysicsFrame,
  STRIPE_BALL_SPECS,
  STRIKE_ANIM_DURATION_SEC,
  SUBSTEPS,
  TABLE_SHAKE_DURATION_SEC,
  triggerFeltToast,
  type AiDifficulty,
  type BallGroup,
  type BallInHandScope,
  type BilliardBall,
  type BilliardGameMode,
  type BilliardsWorld,
  type EightOnBreakChoice,
  type GuidelineMode,
  type IllegalBreakChoice,
  type PendingRefereeDecision,
  type RefereeLogEntry,
  type ReturnRailBall,
  type StrikeAnimationState,
  type WpaRuleSet,
} from '@/components/home/billiardsEngine';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';
import {
  playCueStrike,
  playRackClear,
  setBilliardSoundEnabled,
  unlockBilliardAudio,
  updateBilliardRollingSound,
} from '@/utils/billiardAudio';
import { computeShotLaunchSpeed, initializeCueBallShot } from '@/utils/billiardPhysics';

export interface MineralBilliardsStageProps {
  readonly className?: string;
}

const CANCEL_POWER_THRESHOLD = 0.08;
const AI_AIM_DURATION_SEC = 0.65;
const AI_CHARGE_DURATION_SEC = 0.45;
const BEST_RECORD_STORAGE_KEY = 'lu_billiards_8ball_best_shots_v2';

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

interface PlayerRackSlotsProps {
  readonly group: BallGroup | null;
  readonly pocketedIds: readonly number[];
  readonly testIdPrefix: string;
}

function PlayerRackSlots({ group, pocketedIds, testIdPrefix }: PlayerRackSlotsProps) {
  if (group === null) {
    return (
      <div className="flex items-center gap-1.5" data-testid={`${testIdPrefix}-slots`}>
        {Array.from({ length: 7 }, (_, idx) => (
          <span
            key={idx}
            aria-hidden="true"
            className="inline-block h-[18px] w-[18px] rounded-full border border-dashed border-[#8BA098]/75 bg-[#EEF2F0]/45 shadow-inner sm:h-5 sm:w-5 dark:border-[#3E5C50] dark:bg-[#0D1A14]/50"
          />
        ))}
      </div>
    );
  }

  const specs = group === 'solids' ? SOLID_BALL_SPECS : STRIPE_BALL_SPECS;
  return (
    <div className="flex items-center gap-1.5" data-testid={`${testIdPrefix}-slots`}>
      {specs.map((spec) => {
        const isPocketed = pocketedIds.includes(spec.number);
        return (
          <span
            key={spec.number}
            data-testid={`${testIdPrefix}-ball-${spec.number}`}
            data-pocketed={isPocketed ? 'true' : 'false'}
            title={`Bi ${spec.number} (${spec.name}): ${isPocketed ? 'Đã ăn' : 'Còn trên bàn'}`}
            style={{
              backgroundColor: isPocketed ? undefined : spec.isStripe ? '#F8F9F7' : spec.colorHex,
              borderColor: isPocketed ? undefined : spec.colorHex,
            }}
            className={cn(
              'relative inline-flex h-[18px] w-[18px] items-center justify-center overflow-hidden rounded-full border font-mono text-[8.5px] font-bold transition-all duration-200 sm:h-5 sm:w-5',
              isPocketed
                ? 'scale-90 border-[#9BAEA6]/55 bg-[#DDE6E2]/55 opacity-25 shadow-inner dark:border-[#2C473C] dark:bg-[#0B1611]'
                : 'shadow-[0_2px_4px_rgba(18,34,28,0.18)]',
            )}
          >
            {spec.isStripe && !isPocketed && (
              <span
                aria-hidden="true"
                style={{ backgroundColor: spec.colorHex }}
                className="pointer-events-none absolute inset-x-0 h-[54%]"
              />
            )}
            <span
              className={cn(
                'relative z-10 flex h-3 w-3 items-center justify-center rounded-full leading-none',
                isPocketed
                  ? 'bg-transparent text-[#5E706A] dark:text-[#7E968D]'
                  : 'bg-[#FAFBF9]/95 text-[#141817]',
              )}
            >
              {spec.number}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/**
 * SCREEN 3: SÂN KHẤU BIDA CHUẨN 8 BALL POOL (15 BI + BI 8, BÀN 3D VÁT BĂNG, MÁNG HỒI BI, ĐẤU AI)
 * - Bàn 3D khung Đá Phiến – Óc Chó vát cạnh, 6 ốp kim loại Đồng Cổ, 18 diamond sights, 6 băng nỉ hình thang vát 45° & máng hồi bi bên phải.
 * - Tách biệt ngắm trên bàn (xoay gậy tự do + Shift vi chỉnh + Ghost Ball) & Thanh kéo lực dọc bên trái + Bảng chọn xoáy 112x112px.
 * - Match HUD 3 phần trên đầu bàn, luật 8-Ball chuẩn (Trơn 1-7 / Sọc 9-15 / Bi 8) và chế độ Đấu Máy AI thông minh.
 */
export function MineralBilliardsStage({ className }: MineralBilliardsStageProps = {}) {
  const prefersReducedMotion = useReducedMotion();

  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [gameMode, setGameMode] = useState<BilliardGameMode>('vs-ai');
  const [shots, setShots] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestRecord, setBestRecord] = useState<number | null>(() => readBestRecordFromStorage());
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [p1Group, setP1Group] = useState<BallGroup | null>(null);
  const [p2Group, setP2Group] = useState<BallGroup | null>(null);
  const [pocketedBallIds, setPocketedBallIds] = useState<readonly number[]>([]);
  const [ballInHand, setBallInHand] = useState(false);
  const [isBreakShot, setIsBreakShot] = useState(true);
  const [aiStatusText, setAiStatusText] = useState<string | null>(null);
  const [foulBanner, setFoulBanner] = useState<string | null>(null);
  const [rackCleared, setRackCleared] = useState(false);
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [winReason, setWinReason] = useState<string | null>(null);

  const [sliderPower, setSliderPower] = useState(0);
  const [isDraggingPower, setIsDraggingPower] = useState(false);
  const [spin, setSpin] = useState<{ readonly x: number; readonly y: number }>({ x: 0, y: 0 });
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [guidelineMode, setGuidelineMode] = useState<GuidelineMode>('full');
  const [aiDifficulty, setAiDifficulty] = useState<AiDifficulty>('club');
  const [ruleSet, setRuleSet] = useState<WpaRuleSet>('club');
  const [isSafetyActive, setIsSafetyActive] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<PendingRefereeDecision | null>(null);
  const [mustShootOutOfKitchen, setMustShootOutOfKitchen] = useState(false);
  const [stalemateOffered, setStalemateOffered] = useState(false);
  const [refereeLog, setRefereeLog] = useState<readonly RefereeLogEntry[]>([]);
  const [rulesActiveTab, setRulesActiveTab] = useState<'controls' | 'wpa-rules' | 'referee-log'>(
    'controls',
  );
  const [ballInHandScope, setBallInHandScope] = useState<BallInHandScope>('full');
  const [isShootingEight, setIsShootingEight] = useState(false);
  const [isCallRequired, setIsCallRequired] = useState(false);
  const [calledEightPocketId, setCalledEightPocketId] = useState<number | null>(null);
  const [calledRegularPocketId, setCalledRegularPocketId] = useState<number | null>(null);
  const [isHoverCueBallInKitchen, setIsHoverCueBallInKitchen] = useState(false);
  const [activeToast, setActiveToast] = useState<{
    readonly text: string;
    readonly tone: 'info' | 'foul' | 'reward';
  } | null>(null);
  const [hasFreeRetry, setHasFreeRetry] = useState(false);
  const [tableDim, setTableDim] = useState<{ readonly w: number; readonly h: number }>({
    w: 1180,
    h: 615,
  });
  const [isMobileSlider, setIsMobileSlider] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth > 0 && window.innerWidth < 768,
  );

  const sectionRef = useRef<HTMLElement>(null);
  const stageCardRef = useRef<HTMLDivElement>(null);
  const playfieldRowRef = useRef<HTMLDivElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const powerSliderRef = useRef<HTMLDivElement>(null);
  const spinPadRef = useRef<HTMLDivElement>(null);
  const spinPopupWrapperRef = useRef<HTMLDivElement>(null);

  const isDraggingSliderRef = useRef(false);
  const sliderStartXRef = useRef(0);
  const sliderStartYRef = useRef(0);
  const isDraggingSpinRef = useRef(false);
  const spaceChargingRef = useRef(false);
  const lastToastSeqRef = useRef(0);
  const toastTimerRef = useRef<number | null>(null);

  const lastFreeShotRef = useRef<{
    readonly balls: BilliardBall[];
    readonly returnRailQueue: ReturnRailBall[];
    readonly combo: number;
    readonly shots: number;
    readonly aimAngle: number;
    readonly ballInHand: boolean;
    readonly rackCleared: boolean;
  } | null>(null);

  const worldRef = useRef<BilliardsWorld | null>(null);
  const getWorld = useCallback((): BilliardsWorld => {
    if (!worldRef.current) {
      worldRef.current = createBilliardsWorld(1180, 615, 'vs-ai');
    }
    return worldRef.current;
  }, []);

  const syncReactHudFromWorld = useCallback(() => {
    const w = getWorld();
    setShots(w.shots);
    setCombo(w.combo);
    setCurrentPlayer(w.currentPlayer);
    setP1Group(w.p1Group);
    setP2Group(w.p2Group);
    setBallInHand(w.ballInHand);
    setIsBreakShot(w.isBreakShot);
    setFoulBanner(w.foulMessage);
    setRackCleared(w.rackCleared);
    setWinner(w.winner);
    setWinReason(w.winReason);
    setBallInHandScope(w.ballInHandScope);
    setRuleSet(w.ruleSet);
    setIsSafetyActive(w.isSafetyActive);
    setPendingDecision(w.pendingDecision);
    setMustShootOutOfKitchen(w.mustShootOutOfKitchen);
    setStalemateOffered(w.stalemateOffered);
    setRefereeLog([...w.refereeLog]);
    setIsShootingEight(isShootingForEightBall(w, w.currentPlayer));
    setIsCallRequired(isCallPocketRequired(w, w.currentPlayer));
    setCalledEightPocketId(w.calledEightPocketId);
    setCalledRegularPocketId(w.calledRegularPocketId);
    setAiStatusText(
      w.pendingDecision && w.gameMode === 'vs-ai' && w.pendingDecision.decidingPlayer === 2
        ? 'Máy đang cân nhắc...'
        : w.aiPlan.phase !== 'idle'
          ? w.aiPlan.phase === 'aiming'
            ? 'Máy đang ngắm...'
            : 'Máy đang kéo lực...'
          : null,
    );
    const pocketedIds = w.balls.filter((b) => b.id >= 1 && b.pocketed).map((b) => b.id);
    setPocketedBallIds(pocketedIds);

    if (w.toastEvent.active && w.toastEvent.seq !== lastToastSeqRef.current) {
      lastToastSeqRef.current = w.toastEvent.seq;
      setActiveToast({ text: w.toastEvent.text, tone: w.toastEvent.tone });
      if (toastTimerRef.current !== null && typeof window !== 'undefined') {
        window.clearTimeout(toastTimerRef.current);
      }
      if (typeof window !== 'undefined') {
        toastTimerRef.current = window.setTimeout(() => {
          setActiveToast(null);
          toastTimerRef.current = null;
        }, 1600);
      }
    }

    if (w.rackCleared) {
      playRackClear();
      if (w.winner === 1 && w.shots > 0) {
        setBestRecord((prev) => {
          if (prev === null || w.shots < prev) {
            writeBestRecordToStorage(w.shots);
            return w.shots;
          }
          return prev;
        });
      }
    }
  }, [getWorld]);

  const executeCueBallContact = useCallback(
    (strike: StrikeAnimationState) => {
      const w = getWorld();
      const cueBall = w.balls[0];
      if (!cueBall || cueBall.pocketed) return;

      for (const b of w.balls) {
        b.cushionBouncesThisTurn = 0;
      }

      const shotAngle = Math.atan2(strike.dirY, strike.dirX);
      const launch = initializeCueBallShot(
        cueBall,
        shotAngle,
        strike.power,
        strike.spinX,
        strike.spinY,
        w.metrics.physicsScale,
      );
      w.activeCueSpinX = strike.spinX * (0.35 + strike.power * 0.65);
      w.activeCueSpinY = strike.spinY * (0.35 + strike.power * 0.65);
      w.activeShotDirX = launch.dirX;
      w.activeShotDirY = launch.dirY;
      w.cueHasHitBallThisTurn = false;
      w.firstHitBallIdThisTurn = null;
      w.firstHitWasInKitchenThisTurn = false;
      w.allLegalTargetsInKitchenAtStart = areAllLegalTargetsInKitchen(w, w.currentPlayer);
      w.railOrPocketAfterFirstHitThisTurn = false;
      w.breakRailHitBallIds = [];
      w.pocketedPocketMapThisTurn = {};
      w.cueCrossedHeadStringThisTurn = false;
      w.eightBallPocketedId = null;
      w.pocketedIdsThisTurn = [];
      w.scratchedThisTurn = false;
      w.foulMessage = null;

      const tipContactX = cueBall.x - strike.dirX * w.metrics.ballRadius;
      const tipContactY = cueBall.y - strike.dirY * w.metrics.ballRadius;
      const spinMag = Math.min(1, Math.hypot(strike.spinX, strike.spinY));
      spawnChalkDustBurst(w, tipContactX, tipContactY, strike.dirX, strike.dirY);
      if (strike.power > 0.65 || spinMag > 0.35) {
        spawnChalkStreak(w, cueBall.x, cueBall.y, strike.dirX, strike.dirY, 34);
      }
      playCueStrike(strike.power, computeStereoPan(cueBall.x, w.metrics), spinMag);

      if (strike.power > 0.8) {
        w.shakeRemainingSec = TABLE_SHAKE_DURATION_SEC;
      }
    },
    [getWorld],
  );

  const launchShotWithPower = useCallback(
    (
      powerNorm: number,
      angleRad?: number,
      overrideSpin?: { readonly x: number; readonly y: number },
    ) => {
      const w = getWorld();
      const cueBall = w.balls[0];
      if (
        !cueBall ||
        cueBall.pocketed ||
        w.shotInProgress ||
        w.rackCleared ||
        w.strikeAnim.active ||
        w.pendingDecision !== null
      ) {
        return false;
      }

      const isHumanTurn = !(w.gameMode === 'vs-ai' && w.currentPlayer === 2);
      const shootingEightNow = isShootingForEightBall(w, w.currentPlayer);
      if (isHumanTurn && shootingEightNow && w.calledEightPocketId === null) {
        w.dragPullPower = 0;
        setSliderPower(0);
        triggerFeltToast(w, 'CHỌN LỖ ĐÁNH BI SỐ 8', 'info');
        syncReactHudFromWorld();
        return false;
      }
      if (
        isHumanTurn &&
        !shootingEightNow &&
        isCallPocketRequired(w, w.currentPlayer) &&
        w.calledRegularPocketId === null
      ) {
        w.dragPullPower = 0;
        setSliderPower(0);
        triggerFeltToast(w, 'CHỌN LỖ CHỈ ĐỊNH TRƯỚC KHI ĐÁNH', 'info');
        syncReactHudFromWorld();
        return false;
      }

      const clampedPower = Math.max(0.08, Math.min(1, powerNorm));
      const shotAngle = angleRad ?? w.aimAngle;

      // Lưu snapshot trước cú đánh gần nhất khi ở chế độ Tập tự do để cho phép Thử lại cú vừa rồi
      if (w.gameMode === 'free') {
        lastFreeShotRef.current = {
          balls: w.balls.map((b) => ({ ...b })),
          returnRailQueue: w.returnRailQueue.map((rb) => ({ ...rb })),
          combo: w.combo,
          shots: w.shots,
          aimAngle: shotAngle,
          ballInHand: w.ballInHand,
          rackCleared: w.rackCleared,
        };
        setHasFreeRetry(true);
      }

      const dirX = Math.cos(shotAngle);
      const dirY = Math.sin(shotAngle);
      const launchSpeed = computeShotLaunchSpeed(clampedPower, undefined, w.metrics.physicsScale);
      const shotSpinX = overrideSpin ? overrideSpin.x : w.spinX;
      const shotSpinY = overrideSpin ? overrideSpin.y : w.spinY;

      w.aimAngle = shotAngle;
      w.dragPullPower = 0;
      setSliderPower(0);
      w.shotInProgress = true;
      w.shots += 1;

      const strikeSpec: StrikeAnimationState = {
        active: true,
        elapsedSec: 0,
        durationSec: STRIKE_ANIM_DURATION_SEC,
        dirX,
        dirY,
        power: clampedPower,
        launchSpeed,
        pullBackOffsetPx: w.metrics.ballRadius + 7 + clampedPower * 52,
        spinX: shotSpinX,
        spinY: shotSpinY,
      };

      if (prefersReducedMotion) {
        strikeSpec.active = false;
        w.strikeAnim = strikeSpec;
        executeCueBallContact(strikeSpec);
      } else {
        w.strikeAnim = strikeSpec;
      }

      syncReactHudFromWorld();
      return true;
    },
    [executeCueBallContact, getWorld, prefersReducedMotion, syncReactHudFromWorld],
  );

  const resetRackForMode = useCallback(
    (nextMode: BilliardGameMode) => {
      const w = getWorld();
      w.gameMode = nextMode;
      w.balls = buildOfficial15BallRack(w.metrics);
      w.returnRailQueue = [];
      w.aimAngle = 0;
      w.dragPullPower = 0;
      w.isDraggingAim = false;
      w.strikeAnim.active = false;
      w.aiPlan.phase = 'idle';
      w.shotInProgress = false;
      w.ballInHand = false;
      w.isBreakShot = true;
      w.p1Group = null;
      w.p2Group = null;
      w.foulMessage = null;
      w.winner = null;
      w.winReason = null;
      w.shots = 0;
      w.combo = 0;
      w.currentPlayer = 1;
      w.rackCleared = false;
      w.hoverPlaceValid = true;
      w.calledEightPocketId = null;
      w.calledRegularPocketId = null;
      w.eightBallPocketedId = null;
      w.railOrPocketAfterFirstHitThisTurn = false;
      w.breakRailHitBallIds = [];
      w.pocketedPocketMapThisTurn = {};
      w.ballInHandScope = 'full';
      w.mustShootOutOfKitchen = false;
      w.firstHitWasInKitchenThisTurn = false;
      w.allLegalTargetsInKitchenAtStart = false;
      w.isSafetyActive = false;
      w.pendingDecision = null;
      w.consecutiveNonPottingTurns = 0;
      w.stalemateOffered = false;
      w.refereeLog = [];
      w.refereeLogSeq = 0;
      w.cueCrossedHeadStringThisTurn = false;
      w.isDraggingCueInKitchen = false;
      w.cueBallHovered = false;
      setIsHoverCueBallInKitchen(false);
      updateBilliardRollingSound(0);
      lastFreeShotRef.current = null;
      setHasFreeRetry(false);
      setActiveToast(null);
      setSliderPower(0);
      syncReactHudFromWorld();
    },
    [getWorld, syncReactHudFromWorld],
  );

  const handleCycleGuideline = useCallback(() => {
    const order: readonly GuidelineMode[] = ['full', 'club', 'pro'];
    setGuidelineMode((prev) => {
      const next = order[(order.indexOf(prev) + 1) % order.length] ?? 'full';
      getWorld().guidelineMode = next;
      return next;
    });
  }, [getWorld]);

  const handleCycleAiDifficulty = useCallback(() => {
    const order: readonly AiDifficulty[] = ['rookie', 'club', 'pro'];
    setAiDifficulty((prev) => {
      const next = order[(order.indexOf(prev) + 1) % order.length] ?? 'club';
      getWorld().aiDifficulty = next;
      return next;
    });
  }, [getWorld]);

  const handleToggleRuleSet = useCallback(() => {
    const w = getWorld();
    const next: WpaRuleSet = w.ruleSet === 'club' ? 'wpa-pro' : 'club';
    w.ruleSet = next;
    w.calledRegularPocketId = null;
    setRuleSet(next);
    syncReactHudFromWorld();
  }, [getWorld, syncReactHudFromWorld]);

  const handleToggleSafety = useCallback(() => {
    const w = getWorld();
    if (
      w.gameMode === 'free' ||
      w.isBreakShot ||
      w.shotInProgress ||
      w.rackCleared ||
      w.pendingDecision !== null
    ) {
      return;
    }
    if (w.gameMode === 'vs-ai' && w.currentPlayer === 2) return;
    const next = !w.isSafetyActive;
    w.isSafetyActive = next;
    if (next) {
      w.calledRegularPocketId = null;
    }
    setIsSafetyActive(next);
    syncReactHudFromWorld();
  }, [getWorld, syncReactHudFromWorld]);

  const handleResolveIllegalBreak = useCallback(
    (choice: IllegalBreakChoice) => {
      const w = getWorld();
      applyIllegalBreakDecision(w, choice);
      syncReactHudFromWorld();
    },
    [getWorld, syncReactHudFromWorld],
  );

  const handleResolveEightOnBreak = useCallback(
    (choice: EightOnBreakChoice) => {
      const w = getWorld();
      applyEightOnBreakDecision(w, choice);
      syncReactHudFromWorld();
    },
    [getWorld, syncReactHudFromWorld],
  );

  const handleAcceptStalemate = useCallback(() => {
    const w = getWorld();
    acceptStalemateRerack(w);
    syncReactHudFromWorld();
  }, [getWorld, syncReactHudFromWorld]);

  const handleRetryLastShot = useCallback(() => {
    const snap = lastFreeShotRef.current;
    const w = getWorld();
    if (!snap || w.gameMode !== 'free') return;

    w.balls = snap.balls.map((b) => ({ ...b }));
    w.returnRailQueue = snap.returnRailQueue.map((rb) => ({ ...rb }));
    w.combo = snap.combo;
    w.shots = snap.shots;
    w.aimAngle = snap.aimAngle;
    w.ballInHand = snap.ballInHand;
    w.rackCleared = snap.rackCleared;
    w.shotInProgress = false;
    w.strikeAnim.active = false;
    w.dragPullPower = 0;
    w.foulMessage = null;
    w.calledEightPocketId = null;
    w.eightBallPocketedId = null;
    w.railOrPocketAfterFirstHitThisTurn = false;
    updateBilliardRollingSound(0);
    setSliderPower(0);
    setActiveToast(null);
    syncReactHudFromWorld();
  }, [getWorld, syncReactHudFromWorld]);

  const nudgeAimAngle = useCallback(
    (deltaRad: number) => {
      const w = getWorld();
      if (
        w.shotInProgress ||
        w.rackCleared ||
        w.ballInHand ||
        w.strikeAnim.active ||
        w.pendingDecision !== null
      ) {
        return;
      }
      if (w.gameMode === 'vs-ai' && w.currentPlayer === 2) return;
      w.aimAngle += deltaRad;
    },
    [getWorld],
  );

  const handleNewRack = useCallback(() => {
    resetRackForMode(getWorld().gameMode);
  }, [getWorld, resetRackForMode]);

  const handleSelectMode = useCallback(
    (nextMode: BilliardGameMode) => {
      setGameMode(nextMode);
      resetRackForMode(nextMode);
    },
    [resetRackForMode],
  );

  const handleToggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      setBilliardSoundEnabled(next);
      if (next) {
        unlockBilliardAudio();
        playCueStrike(0.45);
      } else {
        updateBilliardRollingSound(0);
      }
      return next;
    });
  }, []);

  const updateSpinFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const pad = spinPadRef.current;
      if (!pad) return;
      const rect = pad.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.5;
      const maxOffset = Math.max(1, rect.width * 0.5 * 0.75);

      let nx = (clientX - cx) / maxOffset;
      let ny = -(clientY - cy) / maxOffset;
      const mag = Math.hypot(nx, ny);
      if (mag > 1) {
        nx /= mag;
        ny /= mag;
      }

      const rx = Math.round(nx * 100) / 100;
      const ry = Math.round(ny * 100) / 100;
      const w = getWorld();
      w.spinX = rx;
      w.spinY = ry;
      setSpin({ x: rx, y: ry });
    },
    [getWorld],
  );

  const handleResetSpin = useCallback(() => {
    const w = getWorld();
    w.spinX = 0;
    w.spinY = 0;
    setSpin({ x: 0, y: 0 });
  }, [getWorld]);

  // Khóa màn hình tập trung không giật bố cục (Zero-Shift Scroll Lock & Focus Mode)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleGlobalLockShortcuts = (event: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;

      if (
        event.key === 'Escape' &&
        isScreenLocked &&
        !spaceChargingRef.current &&
        !isDraggingSliderRef.current
      ) {
        event.preventDefault();
        setIsScreenLocked(false);
        return;
      }

      if (
        (event.key === 'l' || event.key === 'L') &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        const rect = sectionRef.current?.getBoundingClientRect();
        const inView =
          !rect || (rect.width === 0 && rect.height === 0)
            ? true
            : rect.top < window.innerHeight && rect.bottom > 0;
        if (isScreenLocked || inView) {
          event.preventDefault();
          setIsScreenLocked((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalLockShortcuts);
    if (!isScreenLocked) {
      return () => {
        window.removeEventListener('keydown', handleGlobalLockShortcuts);
      };
    }

    const docEl = document.documentElement;
    const bodyEl = document.body;
    const origDocOverflow = docEl.style.overflow;
    const origBodyOverflow = bodyEl.style.overflow;
    const origBodyPaddingRight = bodyEl.style.paddingRight;
    let isLockedApplied = false;
    let lockTimer: number | null = null;

    const applyScrollLock = () => {
      if (isLockedApplied) return;
      isLockedApplied = true;
      const scrollbarWidth = Math.max(0, window.innerWidth - docEl.clientWidth);
      docEl.style.overflow = 'hidden';
      bodyEl.style.overflow = 'hidden';
      bodyEl.style.paddingRight = `${scrollbarWidth}px`;
    };

    const targetEl = stageCardRef.current ?? sectionRef.current;
    const stageRect = targetEl?.getBoundingClientRect();
    const needsCentering = Boolean(
      stageRect && stageRect.height > 0 && (stageRect.top < 48 || stageRect.top > 96),
    );

    if (needsCentering && stageRect) {
      const targetY = Math.max(0, stageRect.top + window.scrollY - 54);
      if (typeof window.scrollTo === 'function') {
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
      lockTimer = window.setTimeout(() => {
        lockTimer = null;
        applyScrollLock();
      }, 260);
    } else {
      applyScrollLock();
    }

    const isInsideInteractiveControl = (target: EventTarget | null): boolean => {
      if (!(target instanceof Node)) return false;
      return Boolean(
        canvasRef.current?.contains(target) ||
        powerSliderRef.current?.contains(target) ||
        spinPopupWrapperRef.current?.contains(target),
      );
    };

    const preventBackgroundWheel = (event: WheelEvent) => {
      if (!isInsideInteractiveControl(event.target)) {
        event.preventDefault();
      }
    };

    const preventBackgroundTouchMove = (event: TouchEvent) => {
      if (!isInsideInteractiveControl(event.target)) {
        event.preventDefault();
      }
    };

    const preventScrollKeys = (event: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      if (
        event.code === 'Space' ||
        event.key === 'ArrowUp' ||
        event.key === 'ArrowDown' ||
        event.key === 'PageUp' ||
        event.key === 'PageDown' ||
        event.key === 'Home' ||
        event.key === 'End'
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('wheel', preventBackgroundWheel, { passive: false });
    window.addEventListener('touchmove', preventBackgroundTouchMove, { passive: false });
    window.addEventListener('keydown', preventScrollKeys);

    return () => {
      if (lockTimer !== null) {
        window.clearTimeout(lockTimer);
      }
      window.removeEventListener('keydown', handleGlobalLockShortcuts);
      window.removeEventListener('wheel', preventBackgroundWheel);
      window.removeEventListener('touchmove', preventBackgroundTouchMove);
      window.removeEventListener('keydown', preventScrollKeys);
      docEl.style.overflow = origDocOverflow;
      bodyEl.style.overflow = origBodyOverflow;
      bodyEl.style.paddingRight = origBodyPaddingRight;
    };
  }, [isScreenLocked]);

  // Trọng tài Máy AI tự chọn phương án tối ưu sau 650ms khi chờ quyết định Illegal Break / 8-Ball on Break
  useEffect(() => {
    if (
      !pendingDecision ||
      gameMode !== 'vs-ai' ||
      pendingDecision.decidingPlayer !== 2 ||
      typeof window === 'undefined'
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      const w = getWorld();
      if (!w.pendingDecision || w.pendingDecision.decidingPlayer !== 2) return;
      if (w.pendingDecision.type === 'illegal-break') {
        applyIllegalBreakDecision(w, evaluateAiIllegalBreakChoice(w));
      } else {
        applyEightOnBreakDecision(w, 'spot-and-continue');
      }
      syncReactHudFromWorld();
    }, 650);
    return () => window.clearTimeout(timer);
  }, [gameMode, getWorld, pendingDecision, syncReactHudFromWorld]);

  // Đóng popup chỉnh xoáy / sổ tay trọng tài khi bấm ra ngoài hoặc nhấn Esc
  useEffect(() => {
    if (!isSpinOpen && !isRulesOpen) return;
    const onKeyDownClose = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSpinOpen(false);
        setIsRulesOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDownClose);
    return () => window.removeEventListener('keydown', onKeyDownClose);
  }, [isRulesOpen, isSpinOpen]);

  // Đóng popup chỉnh xoáy khi bấm ra ngoài
  useEffect(() => {
    if (!isSpinOpen) return;
    const onPointerDownOutside = (event: PointerEvent) => {
      if (
        spinPopupWrapperRef.current &&
        !spinPopupWrapperRef.current.contains(event.target as Node)
      ) {
        setIsSpinOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDownOutside);
    return () => window.removeEventListener('pointerdown', onPointerDownOutside);
  }, [isSpinOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = tableWrapperRef.current;
    const section = sectionRef.current;
    if (!canvas || !wrapper || typeof window === 'undefined') return;

    // Bắt buộc dùng alpha: true để clearRect giữ nền trong suốt (xóa sạch nền đen #000000 quanh bàn & giữa 2 ray)
    const ctx = getLowLatency2DContext(canvas, { alpha: true });
    if (!ctx) return;

    const w = getWorld();

    const updateSize = () => {
      const viewportW = window.innerWidth > 0 ? window.innerWidth : 1280;
      const compactMobile = viewportW < 768;
      setIsMobileSlider(compactMobile);

      const rowRect = playfieldRowRef.current?.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const rawAvailW =
        rowRect && rowRect.width > 0
          ? rowRect.width - (compactMobile ? 0 : 72)
          : wrapperRect.width > 0
            ? wrapperRect.width
            : 1180;
      const availW = Math.max(360, rawAvailW);
      const viewportH = window.innerHeight > 0 ? window.innerHeight : 900;
      const maxTableH = Math.min(viewportH * 0.68, 660);

      const nextW = Math.max(360, Math.floor(Math.min(availW, maxTableH * 1.92)));
      const nextH = Math.max(200, Math.floor(nextW / 1.92));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const prevMetrics = w.metrics;
      const nextMetrics = computeTableMetrics(nextW, nextH);

      for (const ball of w.balls) {
        const relX = (ball.x - prevMetrics.feltLeft) / Math.max(1, prevMetrics.feltWidth);
        const relY = (ball.y - prevMetrics.feltTop) / Math.max(1, prevMetrics.feltHeight);
        ball.x =
          nextMetrics.feltLeft + Math.max(0.03, Math.min(0.97, relX)) * nextMetrics.feltWidth;
        ball.y =
          nextMetrics.feltTop + Math.max(0.04, Math.min(0.96, relY)) * nextMetrics.feltHeight;
      }

      w.metrics = nextMetrics;
      w.dpr = dpr;
      canvas.width = Math.round(nextW * dpr);
      canvas.height = Math.round(nextH * dpr);
      canvas.style.width = `${nextW}px`;
      canvas.style.height = `${nextH}px`;
      setTableDim((prev) => (prev.w === nextW && prev.h === nextH ? prev : { w: nextW, h: nextH }));
    };

    updateSize();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        w.isPrecisionAim = true;
      }
      const activeTag = document.activeElement?.tagName;
      if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
      const rect = section?.getBoundingClientRect();
      const inView = rect ? rect.top < window.innerHeight && rect.bottom > 0 : false;
      if (!inView) return;

      if (event.key === 'Escape' && spaceChargingRef.current) {
        spaceChargingRef.current = false;
        w.dragPullPower = 0;
        setSliderPower(0);
        return;
      }

      const canControl =
        !w.shotInProgress &&
        !w.rackCleared &&
        !w.ballInHand &&
        !w.strikeAnim.active &&
        w.pendingDecision === null &&
        !(w.gameMode === 'vs-ai' && w.currentPlayer === 2);

      if (canControl && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        const step = event.shiftKey ? FINE_AIM_STEP_RAD : (0.75 * Math.PI) / 180;
        w.aimAngle += event.key === 'ArrowRight' ? step : -step;
        return;
      }

      if (event.code === 'Space' && canControl) {
        event.preventDefault();
        if (!spaceChargingRef.current) {
          spaceChargingRef.current = true;
          unlockBilliardAudio();
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        w.isPrecisionAim = false;
      }
      if (event.code === 'Space' && spaceChargingRef.current) {
        spaceChargingRef.current = false;
        if (w.dragPullPower >= CANCEL_POWER_THRESHOLD) {
          launchShotWithPower(w.dragPullPower);
        } else {
          w.dragPullPower = 0;
          setSliderPower(0);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const isDarkModeActive = () =>
      document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark' ||
      document.documentElement.getAttribute('data-reading-theme') === 'dark';

    if (prefersReducedMotion) {
      renderBilliardsStageFrame(ctx, w, isDarkModeActive());
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

      // Nạp lực khi người chơi giữ Space (tốc độ 0.78/s giúp dễ canh chuẩn mức lực 25%–75%)
      if (spaceChargingRef.current && !w.shotInProgress && !w.strikeAnim.active) {
        w.dragPullPower = Math.min(1, w.dragPullPower + dtSeconds * 0.78);
        setSliderPower(w.dragPullPower);
      }

      // Chạy AI Bot tự động (xoay gậy 650ms -> kéo lực 450ms -> tung cú đánh) khi đến lượt Máy
      if (
        w.gameMode === 'vs-ai' &&
        w.currentPlayer === 2 &&
        !w.shotInProgress &&
        !w.strikeAnim.active &&
        !w.rackCleared &&
        w.pendingDecision === null
      ) {
        if (w.aiPlan.phase === 'idle') {
          w.aiPlan = computeAiShotPlan(w);
          w.isSafetyActive = w.aiPlan.isSafety;
          if (!w.aiPlan.isSafety && w.aiPlan.calledPocketId !== null) {
            if (isShootingForEightBall(w, 2)) {
              w.calledEightPocketId = w.aiPlan.calledPocketId;
            } else if (w.ruleSet === 'wpa-pro') {
              w.calledRegularPocketId = w.aiPlan.calledPocketId;
            }
          }
          if (w.ballInHand && w.aiPlan.placeX !== null && w.aiPlan.placeY !== null) {
            const cue = w.balls[0];
            if (cue) {
              cue.x = w.aiPlan.placeX;
              cue.y = w.aiPlan.placeY;
            }
            if (w.ballInHandScope === 'kitchen') {
              w.mustShootOutOfKitchen = true;
              w.cueCrossedHeadStringThisTurn = false;
            }
            w.ballInHand = false;
            w.ballInHandScope = 'full';
          }
          syncReactHudFromWorld();
        } else if (w.aiPlan.phase === 'aiming') {
          w.aiPlan.elapsedSec += dtSeconds;
          const t = Math.min(1, w.aiPlan.elapsedSec / AI_AIM_DURATION_SEC);
          const eased = 1 - Math.pow(1 - t, 3);
          const delta = normalizeAngleDiff(w.aiPlan.targetAngle - w.aiPlan.startAngle);
          w.aimAngle = w.aiPlan.startAngle + delta * eased;
          if (t >= 1) {
            w.aiPlan.phase = 'charging';
            w.aiPlan.elapsedSec = 0;
            syncReactHudFromWorld();
          }
        } else if (w.aiPlan.phase === 'charging') {
          w.aiPlan.elapsedSec += dtSeconds;
          const t = Math.min(1, w.aiPlan.elapsedSec / AI_CHARGE_DURATION_SEC);
          w.dragPullPower = w.aiPlan.targetPower * t;
          setSliderPower(w.dragPullPower);
          if (t >= 1) {
            const chosenPower = w.aiPlan.targetPower;
            const chosenAngle = w.aiPlan.targetAngle;
            const chosenSpin = { x: w.aiPlan.targetSpinX, y: w.aiPlan.targetSpinY };
            w.aiPlan.phase = 'idle';
            launchShotWithPower(chosenPower, chosenAngle, chosenSpin);
          }
        }
      }

      const hudDirty = stepBilliardsPhysicsFrame(w, dtSeconds, dtScale, executeCueBallContact);
      if (hudDirty) {
        syncReactHudFromWorld();
      }

      renderBilliardsStageFrame(ctx, w, isDarkModeActive());
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

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && playfieldRowRef.current) {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(playfieldRowRef.current);
    }

    window.addEventListener('resize', updateSize, { passive: true });
    renderBilliardsStageFrame(ctx, w, isDarkModeActive());
    startLoop();

    return () => {
      isDisposed = true;
      stopLoop();
      updateBilliardRollingSound(0);
      observer?.disconnect();
      resizeObserver?.disconnect();
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    executeCueBallContact,
    getWorld,
    launchShotWithPower,
    prefersReducedMotion,
    syncReactHudFromWorld,
  ]);

  const getCanvasPoint = (
    event: React.PointerEvent<HTMLCanvasElement> | React.WheelEvent<HTMLCanvasElement>,
  ): { x: number; y: number } => {
    const canvas = canvasRef.current;
    const w = getWorld();
    if (!canvas) return { x: w.metrics.headStringX, y: w.metrics.centerY };
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? w.metrics.width / rect.width : 1;
    const scaleY = rect.height > 0 ? w.metrics.height / rect.height : 1;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  // Xoay góc ngắm tự do trên toàn mặt bàn (kể cả khi bi cái ở sát góc/băng)
  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    unlockBilliardAudio();
    setIsSpinOpen(false);
    setIsRulesOpen(false);

    const w = getWorld();
    if (w.rackCleared || w.strikeAnim.active || w.shotInProgress || w.pendingDecision !== null) {
      return;
    }
    if (w.gameMode === 'vs-ai' && w.currentPlayer === 2) return;

    const pt = getCanvasPoint(event);
    const cueBall = w.balls[0];
    if (!cueBall) return;

    // Đặt bi tự do (Ball-in-Hand)
    if (w.ballInHand) {
      const placed = clampValidCueBallPlacement(w, pt.x, pt.y);
      cueBall.x = placed.x;
      cueBall.y = placed.y;
      cueBall.vx = 0;
      cueBall.vy = 0;
      cueBall.sx = 0;
      cueBall.sy = 0;
      cueBall.omegaZ = 0;
      cueBall.pocketed = false;
      cueBall.sinking = false;
      if (w.ballInHandScope === 'kitchen') {
        w.mustShootOutOfKitchen = true;
        w.cueCrossedHeadStringThisTurn = false;
      }
      w.ballInHand = false;
      w.ballInHandScope = 'full';
      w.hoverPlaceValid = true;
      w.foulMessage = null;
      syncReactHudFromWorld();
      return;
    }

    // Chọn lỗ chỉ định (Call Pocket cho Bi 8 hoặc toàn bộ cơ trong chế độ Giải đấu WPA)
    if (isCallPocketRequired(w, w.currentPlayer)) {
      let clickedPocket = null;
      let minPocketDist = w.metrics.pocketRadius * 2.25;
      for (const pocket of w.metrics.pockets) {
        const pd = Math.hypot(pt.x - pocket.x, pt.y - pocket.y);
        if (pd <= minPocketDist) {
          minPocketDist = pd;
          clickedPocket = pocket;
        }
      }
      if (clickedPocket) {
        if (isShootingForEightBall(w, w.currentPlayer)) {
          w.calledEightPocketId = clickedPocket.id;
          triggerFeltToast(w, `ĐÃ CHỌN LỖ #${clickedPocket.id + 1} CHO BI 8`, 'info');
        } else {
          w.calledRegularPocketId = clickedPocket.id;
          triggerFeltToast(w, `ĐÃ CHỈ ĐỊNH LỖ #${clickedPocket.id + 1}`, 'info');
        }
        syncReactHudFromWorld();
        return;
      }
    }

    // Kéo đặt lại bi cái "Trong Bếp" (Behind the Head String) trước cú khai cuộc
    const distFromCue = Math.hypot(pt.x - cueBall.x, pt.y - cueBall.y);
    if (isInBreakKitchen(w) && distFromCue <= w.metrics.ballRadius * 1.95) {
      w.isDraggingCueInKitchen = true;
      try {
        event.currentTarget.setPointerCapture(event.pointerId);
      } catch {
        // Bỏ qua trong JSDOM
      }
      return;
    }

    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Bỏ qua trong JSDOM
    }

    w.isDraggingAim = true;
    w.dragPrevX = pt.x;
    w.dragPrevY = pt.y;
    w.isPrecisionAim = Boolean(event.shiftKey);

    // Chạm nhanh ở vị trí xa bi cái lập tức xoay gậy hướng về phía đó nếu bấm ngoài vùng sát bi
    if (distFromCue > w.metrics.ballRadius * 2.2) {
      w.aimAngle = Math.atan2(pt.y - cueBall.y, pt.x - cueBall.x);
    }
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const w = getWorld();
    const pt = getCanvasPoint(event);

    if (w.ballInHand && !(w.gameMode === 'vs-ai' && w.currentPlayer === 2)) {
      w.hoverPlaceValid = isCueBallPlacementValid(w, pt.x, pt.y);
      const placed = clampValidCueBallPlacement(w, pt.x, pt.y);
      w.hoverPlaceX = placed.x;
      w.hoverPlaceY = placed.y;
      const cueBall = w.balls[0];
      if (cueBall) {
        cueBall.x = placed.x;
        cueBall.y = placed.y;
      }
      return;
    }

    if (w.isDraggingCueInKitchen) {
      const cueBall = w.balls[0];
      if (cueBall) {
        const clamped = clampBreakCueBallPlacement(w, pt.x, pt.y);
        cueBall.x = clamped.x;
        cueBall.y = clamped.y;
      }
      return;
    }

    if (!w.isDraggingAim) {
      const cueBall = w.balls[0];
      const hovered =
        Boolean(cueBall && !cueBall.pocketed && isInBreakKitchen(w)) &&
        Math.hypot(pt.x - cueBall!.x, pt.y - cueBall!.y) <= w.metrics.ballRadius * 1.95;
      if (w.cueBallHovered !== hovered) {
        w.cueBallHovered = hovered;
        setIsHoverCueBallInKitchen(hovered);
      }
      return;
    }
    w.isPrecisionAim = Boolean(event.shiftKey);
    const cueBall = w.balls[0];
    if (!cueBall) return;

    const prevAngle = Math.atan2(w.dragPrevY - cueBall.y, w.dragPrevX - cueBall.x);
    const currAngle = Math.atan2(pt.y - cueBall.y, pt.x - cueBall.x);
    const deltaAngle = normalizeAngleDiff(currAngle - prevAngle);
    const sens = w.isPrecisionAim ? PRECISION_AIM_FACTOR : 1;

    w.aimAngle += deltaAngle * sens;
    w.dragPrevX = pt.x;
    w.dragPrevY = pt.y;
  };

  const handleCanvasPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const w = getWorld();
    w.isDraggingAim = false;
    w.isDraggingCueInKitchen = false;
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Bỏ qua trong JSDOM
    }
  };

  // Thanh kéo lực dọc bên trái bàn (hoặc ngang dưới bàn trên Mobile < 768px)
  const computeSliderPowerFromPointer = (clientX: number, clientY: number): number => {
    const rect = powerSliderRef.current?.getBoundingClientRect();
    if (isMobileSlider) {
      const travelX = rect && rect.width > 0 ? Math.max(120, rect.width * 0.78) : 210;
      return Math.max(0, Math.min(1, (clientX - sliderStartXRef.current) / travelX));
    }
    const travelY = rect && rect.height > 0 ? Math.max(120, rect.height * 0.78) : 210;
    return Math.max(0, Math.min(1, (clientY - sliderStartYRef.current) / travelY));
  };

  const handleSliderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    unlockBilliardAudio();
    const w = getWorld();
    if (
      w.rackCleared ||
      w.shotInProgress ||
      w.strikeAnim.active ||
      w.ballInHand ||
      w.pendingDecision !== null
    ) {
      return;
    }
    if (w.gameMode === 'vs-ai' && w.currentPlayer === 2) return;

    isDraggingSliderRef.current = true;
    setIsDraggingPower(true);
    sliderStartXRef.current = event.clientX;
    sliderStartYRef.current = event.clientY;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Bỏ qua trong JSDOM
    }
    const p = computeSliderPowerFromPointer(event.clientX, event.clientY);
    w.dragPullPower = p;
    setSliderPower(p);
  };

  const handleSliderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSliderRef.current) return;
    const w = getWorld();
    const p = computeSliderPowerFromPointer(event.clientX, event.clientY);
    w.dragPullPower = p;
    setSliderPower(p);
  };

  const handleSliderPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSliderRef.current) return;
    isDraggingSliderRef.current = false;
    setIsDraggingPower(false);
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Bỏ qua trong JSDOM
    }

    const w = getWorld();
    const power = w.dragPullPower;
    if (power >= CANCEL_POWER_THRESHOLD) {
      launchShotWithPower(power);
    } else {
      w.dragPullPower = 0;
      setSliderPower(0);
    }
  };

  const centerStatusLabel = rackCleared
    ? winner === 1
      ? gameMode === 'vs-ai'
        ? 'Bạn thắng!'
        : gameMode === 'free'
          ? `Hoàn thành · ${shots} cơ`
          : 'P1 thắng!'
      : gameMode === 'vs-ai'
        ? 'Máy thắng!'
        : 'P2 thắng!'
    : pendingDecision
      ? gameMode === 'vs-ai' && pendingDecision.decidingPlayer === 2
        ? 'Máy đang chọn phương án...'
        : 'Trọng tài chờ quyết định'
      : aiStatusText
        ? aiStatusText
        : ballInHand
          ? ballInHandScope === 'kitchen'
            ? 'Đặt Trong Bếp'
            : 'Đặt bi tự do'
          : isShootingEight && !(gameMode === 'vs-ai' && currentPlayer === 2)
            ? calledEightPocketId === null
              ? 'Chọn lỗ đánh Bi 8'
              : `Lỗ Bi 8: #${calledEightPocketId + 1}`
            : isCallRequired && !(gameMode === 'vs-ai' && currentPlayer === 2)
              ? calledRegularPocketId === null
                ? 'Chọn lỗ chỉ định'
                : `Lỗ chỉ định: #${calledRegularPocketId + 1}`
              : isSafetyActive
                ? 'Chạy đạn (Safety)'
                : mustShootOutOfKitchen
                  ? 'Đánh bi ngoài vạch Bếp'
                  : isBreakShot
                    ? 'Khai cuộc'
                    : gameMode === 'vs-ai'
                      ? currentPlayer === 1
                        ? 'Lượt bạn'
                        : 'Lượt Máy'
                      : gameMode === 'two-player'
                        ? `Lượt P${currentPlayer}`
                        : `${shots} cơ`;

  const isPlayerOneActive = !rackCleared && currentPlayer === 1;
  const isPlayerTwoActive = !rackCleared && currentPlayer === 2 && gameMode !== 'free';

  const verticalSliderH = Math.max(260, Math.min(420, Math.round(tableDim.h * 0.74)));
  const powerReadoutText =
    isDraggingPower && sliderPower > 0.005 && sliderPower < CANCEL_POWER_THRESHOLD
      ? 'HỦY'
      : sliderPower < 0.02
        ? isMobileSlider
          ? 'KÉO →'
          : 'KÉO ↓'
        : `${Math.round(sliderPower * 100)}%`;

  const powerTierLabel =
    sliderPower >= 0.9
      ? 'PHÁ'
      : sliderPower >= 0.7
        ? 'MẠNH'
        : sliderPower >= 0.35
          ? 'VỪA'
          : sliderPower >= CANCEL_POWER_THRESHOLD
            ? 'NHẸ'
            : null;

  const spinModeDescription = (() => {
    const vert =
      Math.abs(spin.y) < 0.12
        ? 'Tâm · Stun (90°)'
        : spin.y >= 0.48 && spin.y <= 0.72
          ? 'Lăn tự nhiên (30°)'
          : spin.y > 0
            ? 'Cù lê (Follow)'
            : 'Trô (Draw)';
    const horiz = Math.abs(spin.x) < 0.14 ? '' : spin.x > 0 ? ' · Ép phải' : ' · Ép trái';
    return `${vert}${horiz}`;
  })();

  const guidelineLabel =
    guidelineMode === 'full' ? 'Tia: Đầy đủ' : guidelineMode === 'club' ? 'Tia: CLB' : 'Tia: Pro';
  const aiDifficultyLabel =
    aiDifficulty === 'rookie' ? 'AI: Tập sự' : aiDifficulty === 'pro' ? 'AI: Cơ thủ' : 'AI: CLB';

  return (
    <section
      ref={sectionRef}
      id="ban-bida-khoang-thach"
      data-testid="mineral-billiards-stage"
      data-screen-locked={isScreenLocked ? 'true' : 'false'}
      data-hide-cursor-ring="true"
      aria-label="Bàn Bida 8 Ball Pool Khoáng Thạch 120fps"
      className={cn(
        'relative scroll-mt-14 overflow-x-clip border-t border-[var(--border-hairline)] bg-[var(--bg-shell)] text-[var(--text-main)]',
        className,
      )}
    >
      {/* 3.1. Lớp nền Bản Vẽ Kiến Trúc & Thiên Cầu Đồng Tâm (Ambient Drafting Layer, pointer-events-none) */}
      <div
        aria-hidden="true"
        data-testid="billiards-salon-backdrop"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none"
      >
        {/* Lưới điểm & kẻ bản vẽ siêu mảnh 36x36px mờ dần ra 4 mép */}
        <div
          className="absolute inset-0 opacity-100 dark:hidden"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(30, 51, 46, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(30, 51, 46, 0.04) 1px, transparent 1px), radial-gradient(circle, rgba(30, 51, 46, 0.09) 0.9px, transparent 0.9px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(ellipse 82% 78% at 50% 50%, #000 45%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 82% 78% at 50% 50%, #000 45%, transparent 100%)',
          }}
        />
        <div
          className="absolute inset-0 hidden dark:block"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(212, 175, 106, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(212, 175, 106, 0.04) 1px, transparent 1px), radial-gradient(circle, rgba(212, 175, 106, 0.09) 0.9px, transparent 0.9px)',
            backgroundSize: '36px 36px',
            maskImage: 'radial-gradient(ellipse 82% 78% at 50% 50%, #000 45%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 82% 78% at 50% 50%, #000 45%, transparent 100%)',
          }}
        />

        {/* Quầng sáng khuếch tán ấm nhẹ phía sau thẻ bàn tạo cảm giác phòng trưng bày */}
        <div
          className="absolute top-1/2 left-1/2 h-[880px] w-[1440px] -translate-x-1/2 -translate-y-1/2 dark:hidden"
          style={{
            background:
              'radial-gradient(ellipse 56% 52% at 50% 50%, rgba(250, 251, 249, 0.92) 0%, rgba(250, 251, 249, 0.42) 55%, rgba(250, 251, 249, 0) 100%)',
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 hidden h-[880px] w-[1440px] -translate-x-1/2 -translate-y-1/2 dark:block"
          style={{
            background:
              'radial-gradient(ellipse 56% 52% at 50% 50%, rgba(28, 62, 48, 0.34) 0%, rgba(14, 26, 21, 0.1) 58%, rgba(14, 26, 21, 0) 100%)',
          }}
        />

        {/* SVG trang trí 2 vòng cung thiên cầu lớn + 2 trục ngắm ngang với dấu chấm kim cương */}
        <svg
          data-testid="billiards-salon-backdrop-svg"
          viewBox="0 0 1800 920"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          className="absolute inset-0 h-full w-full"
        >
          <circle cx="900" cy="460" r="680" stroke="rgba(156, 122, 76, 0.14)" strokeWidth="0.85" />
          <circle
            cx="900"
            cy="460"
            r="810"
            stroke="rgba(156, 122, 76, 0.14)"
            strokeWidth="0.8"
            strokeDasharray="6 6"
          />
          <line
            x1="0"
            y1="270"
            x2="1800"
            y2="270"
            stroke="rgba(156, 122, 76, 0.11)"
            strokeWidth="0.8"
          />
          <line
            x1="0"
            y1="650"
            x2="1800"
            y2="650"
            stroke="rgba(156, 122, 76, 0.11)"
            strokeWidth="0.8"
          />
          {[84, 154, 1646, 1716].map((dx) => (
            <g key={dx}>
              <path
                d={`M${dx} 265 L${dx + 5} 270 L${dx} 275 L${dx - 5} 270 Z`}
                fill="rgba(156, 122, 76, 0.3)"
              />
              <path
                d={`M${dx} 645 L${dx + 5} 650 L${dx} 655 L${dx - 5} 650 Z`}
                fill="rgba(156, 122, 76, 0.3)"
              />
            </g>
          ))}
        </svg>
      </div>

      {/* Focus Vignette làm dịu xung quanh khi kích hoạt Khóa màn hình */}
      <div
        aria-hidden="true"
        data-testid="billiards-focus-vignette"
        className={cn(
          'pointer-events-none fixed inset-0 z-10 bg-[#142622]/12 backdrop-blur-[1.5px] transition-opacity duration-300 dark:bg-black/40',
          isScreenLocked ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Hai thanh thước kiến trúc dọc lề trái/phải (chỉ hiện trên màn hình siêu rộng >= 1540px) */}
      <div
        aria-hidden="true"
        data-testid="billiards-ruler-left"
        className="pointer-events-none absolute top-1/2 left-5 z-10 hidden -translate-y-1/2 flex-col items-center gap-3 select-none min-[1540px]:flex"
      >
        <div className="flex flex-col gap-1.5 opacity-60">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className={cn('block h-[1px] bg-[#9C7A4C]', i % 3 === 0 ? 'w-3' : 'w-1.5')}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] tracking-[0.24em] text-[#7D8C87]/70 uppercase [writing-mode:vertical-rl] dark:text-[#8CA39A]/65">
          SALON 03 // 9-FT MINERAL TABLE
        </span>
        <span className="font-mono text-[9px] text-[#9C7A4C]/70">◆ ◆ ◆</span>
      </div>

      <div
        aria-hidden="true"
        data-testid="billiards-ruler-right"
        className="pointer-events-none absolute top-1/2 right-5 z-10 hidden -translate-y-1/2 flex-col items-center gap-3 select-none min-[1540px]:flex"
      >
        <span className="font-mono text-[9px] text-[#9C7A4C]/70">◆ ◆ ◆</span>
        <span className="font-mono text-[10px] tracking-[0.24em] text-[#7D8C87]/70 uppercase [writing-mode:vertical-rl] dark:text-[#8CA39A]/65">
          WPA 8-BALL // 15 BALLS · 120FPS
        </span>
        <div className="flex flex-col items-end gap-1.5 opacity-60">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className={cn('block h-[1px] bg-[#9C7A4C]', i % 3 === 0 ? 'w-3' : 'w-1.5')}
            />
          ))}
        </div>
      </div>

      {/* Dấu cộng chuẩn trực (+) trên đường ngăn kỹ thuật */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1480px] justify-between px-4 md:px-6 lg:px-8"
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

      <div className="relative z-20 mx-auto w-full max-w-[1480px] px-4 pt-8 pb-14 md:px-6 lg:px-8">
        {/* 3.2. Tiêu đề khung kiến trúc siêu thanh mảnh phía trên thẻ bàn */}
        <div
          data-testid="billiards-salon-eyebrow"
          className="mb-4 flex items-center justify-center gap-3 font-mono text-[11px] tracking-[0.2em] text-[#6D7D78] uppercase select-none sm:gap-4 dark:text-[#8CA39A]"
        >
          <span className="h-[1px] max-w-[110px] flex-1 bg-gradient-to-r from-transparent to-[#9C7A4C]/55" />
          <span aria-hidden="true" className="text-[10px] text-[#9C7A4C]">
            ◇
          </span>
          <span className="text-center whitespace-nowrap">
            SẢNH THƯ GIÃN · BIDA KHOÁNG THẠCH 8-BALL
          </span>
          <span aria-hidden="true" className="text-[10px] text-[#9C7A4C]">
            ◇
          </span>
          <span className="h-[1px] max-w-[110px] flex-1 bg-gradient-to-l from-transparent to-[#9C7A4C]/55" />
        </div>

        <div
          ref={stageCardRef}
          data-testid="billiards-stage-card"
          data-game-mode={gameMode}
          className={cn(
            'relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border bg-[#FAFBF9] transition-[border-color,box-shadow] duration-300 md:gap-3 dark:bg-[#12241C]',
            isScreenLocked
              ? 'border-[#9C7A4C]/65 shadow-[0_24px_64px_rgba(20,38,34,0.14)]'
              : 'border-[#CFD9D5] shadow-[0_18px_48px_rgba(24,38,36,0.06)] dark:border-[#243B32]',
          )}
        >
          {/* 4 góc thước ngắm bản vẽ chữ L mảnh sát mép (inset-1.5) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1.5 left-1.5 z-20 h-3 w-3 border-t-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1.5 right-1.5 z-20 h-3 w-3 border-t-[1.5px] border-r-[1.5px] border-[#9C7A4C]/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-1.5 left-1.5 z-20 h-3 w-3 border-b-[1.5px] border-l-[1.5px] border-[#9C7A4C]/70"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-1.5 bottom-1.5 z-20 h-3 w-3 border-r-[1.5px] border-b-[1.5px] border-[#9C7A4C]/70"
          />

          {/* 4.A. TOP MATCH HUD 3 PHẦN THOÁNG RỘNG (cách >= 16px khỏi góc thước ┌ ┐) */}
          <div
            data-testid="billiards-match-hud"
            className="grid grid-cols-1 items-center gap-3 border-b border-[#E2E8E5] bg-[#F7F9F8] px-7 py-4 md:py-5 lg:grid-cols-12 dark:border-[#243B32] dark:bg-[#0E1A15]"
          >
            {/* Bên trái: Bạn / P1 (+ 7 ô bi 18-20px ở chế độ Đấu Máy/2 Người; ẩn ở Tập tự do) */}
            <div className="flex items-center justify-between gap-2.5 lg:col-span-4 lg:justify-start">
              {gameMode === 'free' ? (
                <div
                  data-testid="billiards-free-stats"
                  className="inline-flex flex-wrap items-center gap-2 font-mono text-xs text-[#354E48] dark:text-[#B9C8C1]"
                >
                  <span
                    data-testid="billiards-shot-count"
                    className="rounded-lg border border-[#DCE4E0] bg-[#FAFBF9] px-2.5 py-1 font-semibold whitespace-nowrap text-[#142622] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7]"
                  >
                    Số cơ: <strong>{shots}</strong>
                  </span>
                  <span
                    data-testid="billiards-combo-count"
                    className="rounded-lg border border-[#DCE4E0] bg-[#FAFBF9] px-2.5 py-1 font-semibold whitespace-nowrap text-[#3B7A65] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#6EB59B]"
                  >
                    Combo: <strong>x{combo}</strong>
                  </span>
                  <span
                    data-testid="billiards-best-record"
                    className="rounded-lg border border-[#DCE4E0] bg-[#FAFBF9] px-2.5 py-1 font-semibold whitespace-nowrap text-[#8C6228] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#D5B47A]"
                  >
                    Kỷ lục: <strong>{bestRecord ?? '—'}</strong>
                  </span>
                </div>
              ) : (
                <>
                  <div
                    data-testid="billiards-p1-card"
                    data-active={isPlayerOneActive ? 'true' : 'false'}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-1.5 whitespace-nowrap transition-all',
                      isPlayerOneActive
                        ? 'border-[#3B7A65] bg-[#EDF6F2] shadow-[0_0_0_1px_rgba(59,122,101,0.35)] dark:border-[#6EB59B] dark:bg-[#163127]'
                        : 'border-[#DCE4E0] bg-[#FAFBF9] opacity-85 dark:border-[#244335] dark:bg-[#12241C]',
                    )}
                  >
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3B7A65] text-[#FAFBF9]">
                      <User className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="flex flex-col leading-tight">
                      <span className="font-mono text-[11px] font-bold text-[#142622] dark:text-[#E6ECE7]">
                        {gameMode === 'two-player' ? 'Người chơi 1' : 'Bạn'}
                      </span>
                      <span className="font-mono text-[9.5px] text-[#4A5D58] dark:text-[#98ABA3]">
                        {p1Group === 'solids'
                          ? 'Bi Trơn (1–7)'
                          : p1Group === 'stripes'
                            ? 'Bi Sọc (9–15)'
                            : 'Chưa chia nhóm'}
                      </span>
                    </div>
                  </div>
                  <PlayerRackSlots
                    group={p1Group}
                    pocketedIds={pocketedBallIds}
                    testIdPrefix="p1"
                  />
                </>
              )}
            </div>

            {/* Chính giữa: 3 chế độ gọn + Trạng thái lượt + Nút Loa */}
            <div className="flex flex-wrap items-center justify-center gap-2 lg:col-span-4">
              <div
                role="group"
                data-testid="billiards-mode-selector"
                aria-label="Chọn chế độ chơi 8 Ball Pool"
                className="inline-flex items-center rounded-full border border-[#CFD9D5] bg-[#FAFBF9] p-0.5 font-mono text-[11px] font-semibold dark:border-[#244335] dark:bg-[#12241C]"
              >
                <button
                  type="button"
                  data-testid="billiards-mode-vs-ai"
                  aria-pressed={gameMode === 'vs-ai'}
                  onClick={() => handleSelectMode('vs-ai')}
                  className={cn(
                    'cursor-pointer rounded-full px-2.5 py-1 whitespace-nowrap transition-colors',
                    gameMode === 'vs-ai'
                      ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746]'
                      : 'text-[#354E48] hover:text-[#142622] dark:text-[#98ABA3]',
                  )}
                >
                  Đấu Máy
                </button>
                <button
                  type="button"
                  data-testid="billiards-mode-two-player"
                  aria-pressed={gameMode === 'two-player'}
                  onClick={() => handleSelectMode('two-player')}
                  className={cn(
                    'cursor-pointer rounded-full px-2.5 py-1 whitespace-nowrap transition-colors',
                    gameMode === 'two-player'
                      ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746]'
                      : 'text-[#354E48] hover:text-[#142622] dark:text-[#98ABA3]',
                  )}
                >
                  2 Người
                </button>
                <button
                  type="button"
                  data-testid="billiards-mode-free"
                  aria-pressed={gameMode === 'free'}
                  onClick={() => handleSelectMode('free')}
                  className={cn(
                    'cursor-pointer rounded-full px-2.5 py-1 whitespace-nowrap transition-colors',
                    gameMode === 'free'
                      ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746]'
                      : 'text-[#354E48] hover:text-[#142622] dark:text-[#98ABA3]',
                  )}
                >
                  Tập tự do
                </button>
              </div>

              <span
                data-testid="billiards-status-pill"
                className="inline-flex items-center rounded-full border border-[#D4DFDA] bg-[#FAFBF9] px-2.5 py-1 font-mono text-[11px] font-bold whitespace-nowrap text-[#8C6228] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#D5B47A]"
              >
                {centerStatusLabel}
              </span>

              <button
                type="button"
                data-testid="billiards-sound-toggle"
                aria-pressed={isSoundEnabled}
                aria-label={isSoundEnabled ? 'Tắt âm thanh bida' : 'Bật âm thanh bida'}
                onClick={handleToggleSound}
                className={cn(
                  'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition-colors',
                  isSoundEnabled
                    ? 'border-[#9C7A4C] bg-[#9C7A4C] text-[#FAFBF9] dark:border-[#D5B47A] dark:bg-[#D5B47A] dark:text-[#142622]'
                    : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#2D423D] hover:border-[#9C7A4C] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#C9D6D0]',
                )}
              >
                {isSoundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </button>
            </div>

            {/* Bên phải: Đối thủ (Máy AI / P2) + 7 ô bi; ở Tập tự do hiển thị Đã ăn + mini progress */}
            <div className="flex items-center justify-between gap-2.5 lg:col-span-4 lg:justify-end">
              {gameMode === 'free' ? (
                <div
                  data-testid="billiards-free-progress"
                  className="flex items-center gap-3 font-mono text-xs text-[#354E48] dark:text-[#B9C8C1]"
                >
                  <span className="whitespace-nowrap">
                    Đã ăn: <strong>{pocketedBallIds.length} / 15</strong>
                  </span>
                  <div
                    aria-hidden="true"
                    className="h-1.5 w-24 overflow-hidden rounded-full bg-[#DCE4E0] dark:bg-[#1F3A2F]"
                  >
                    <div
                      style={{ width: `${Math.round((pocketedBallIds.length / 15) * 100)}%` }}
                      className="h-full rounded-full bg-[#3B7A65] transition-all duration-300 dark:bg-[#6EB59B]"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <PlayerRackSlots
                    group={p2Group}
                    pocketedIds={pocketedBallIds}
                    testIdPrefix="p2"
                  />
                  <div
                    data-testid="billiards-p2-card"
                    data-active={isPlayerTwoActive ? 'true' : 'false'}
                    className={cn(
                      'inline-flex shrink-0 items-center gap-2.5 rounded-xl border px-3 py-1.5 whitespace-nowrap transition-all',
                      isPlayerTwoActive
                        ? 'border-[#9C7A4C] bg-[#FAF5EA] shadow-[0_0_0_1px_rgba(156,122,76,0.4)] dark:border-[#D5B47A] dark:bg-[#2A2215]'
                        : 'border-[#DCE4E0] bg-[#FAFBF9] opacity-85 dark:border-[#244335] dark:bg-[#12241C]',
                    )}
                  >
                    <div className="flex flex-col text-right leading-tight">
                      <span className="font-mono text-[11px] font-bold text-[#142622] dark:text-[#E6ECE7]">
                        {gameMode === 'vs-ai' ? 'Máy AI' : 'Người chơi 2'}
                      </span>
                      <span className="font-mono text-[9.5px] text-[#4A5D58] dark:text-[#98ABA3]">
                        {p2Group === 'solids'
                          ? 'Bi Trơn (1–7)'
                          : p2Group === 'stripes'
                            ? 'Bi Sọc (9–15)'
                            : 'Chưa chia nhóm'}
                      </span>
                    </div>
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#9C7A4C] text-[#FAFBF9]">
                      {gameMode === 'vs-ai' ? (
                        <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Users className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* KHU VỰC CỤM ĐIỀU KHIỂN (TRÁI DESKTOP / DƯỚI BÀN MOBILE) & BÀN BIDA NỔI KHỐI TRONG SUỐT */}
          <div
            ref={playfieldRowRef}
            className={cn(
              'relative flex bg-transparent px-4 py-3.5 md:px-6 md:py-4',
              isMobileSlider
                ? 'flex-col items-center gap-3'
                : 'flex-row items-center justify-center gap-2.5 md:gap-3.5',
            )}
          >
            {/* CỤM ĐIỀU KHIỂN XOÁY + THANH KÉO LỰC (trái bàn trên Desktop, ngang dưới bàn trên Mobile) */}
            <div
              className={cn(
                'relative z-20 flex shrink-0 items-center',
                isMobileSlider
                  ? 'order-2 w-full justify-center gap-3'
                  : 'order-1 w-14 flex-col gap-2.5 pl-2',
              )}
            >
              {/* Nút chỉnh xoáy bi cái (căn thẳng trục dọc tuyệt đối với tâm thanh kéo lực) */}
              <div ref={spinPopupWrapperRef} className="relative flex flex-col items-center gap-1">
                <button
                  type="button"
                  data-testid="billiards-spin-popup-trigger"
                  aria-expanded={isSpinOpen}
                  aria-label="Mở bảng chọn điểm chạm xoáy bi cái"
                  onClick={() => setIsSpinOpen((prev) => !prev)}
                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#CFD9D5] bg-[radial-gradient(circle_at_35%_35%,#FFFFFF,#FAFBF9_65%,#D3DFDB)] shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  <span
                    aria-hidden="true"
                    style={{
                      transform: `translate(${(spin.x * 11).toFixed(1)}px, ${(-spin.y * 11).toFixed(1)}px)`,
                    }}
                    className="h-2.5 w-2.5 rounded-full bg-[#B5443C] ring-1 ring-[#FAFBF9]"
                  />
                </button>
                <span className="font-mono text-[9.5px] font-bold tracking-wider text-[#4A5D58] dark:text-[#98ABA3]">
                  XOÁY
                </span>

                {/* Nút vi chỉnh góc ngắm siêu gọn (↺ / ↻ ±0.15°) ngay dưới nhãn XOÁY */}
                <div
                  className="mt-0.5 inline-flex items-center gap-1"
                  aria-label="Vi chỉnh góc ngắm"
                >
                  <button
                    type="button"
                    data-testid="billiards-fine-aim-minus"
                    aria-label="Vi chỉnh góc ngắm -0.15 độ"
                    title="Vi chỉnh góc ngắm -0.15° (hoặc giữ Shift + lăn chuột)"
                    onClick={() => nudgeAimAngle(-FINE_AIM_STEP_RAD)}
                    className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-[#CFD9D5] bg-[#FAFBF9] font-mono text-[11px] font-bold text-[#2D423D] transition-colors hover:border-[#9C7A4C] active:scale-95 dark:border-[#244335] dark:bg-[#12241C] dark:text-[#C9D6D0]"
                  >
                    ↺
                  </button>
                  <button
                    type="button"
                    data-testid="billiards-fine-aim-plus"
                    aria-label="Vi chỉnh góc ngắm +0.15 độ"
                    title="Vi chỉnh góc ngắm +0.15° (hoặc giữ Shift + lăn chuột)"
                    onClick={() => nudgeAimAngle(FINE_AIM_STEP_RAD)}
                    className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded border border-[#CFD9D5] bg-[#FAFBF9] font-mono text-[11px] font-bold text-[#2D423D] transition-colors hover:border-[#9C7A4C] active:scale-95 dark:border-[#244335] dark:bg-[#12241C] dark:text-[#C9D6D0]"
                  >
                    ↻
                  </button>
                </div>

                {isSpinOpen && (
                  <div
                    data-testid="billiards-spin-popover"
                    className={cn(
                      'absolute z-40 flex flex-col items-center gap-2 rounded-2xl border border-[#CFD9D5] bg-[#FAFBF9] p-3 shadow-2xl dark:border-[#244335] dark:bg-[#12241C]',
                      isMobileSlider ? 'bottom-full left-0 mb-2' : 'top-0 left-full ml-3',
                    )}
                  >
                    <span className="font-mono text-[10px] font-bold tracking-wider whitespace-nowrap text-[#8C6228] uppercase dark:text-[#D5B47A]">
                      Cù lê · Trô · Ép phê
                    </span>
                    <div
                      ref={spinPadRef}
                      role="slider"
                      tabIndex={0}
                      data-testid="billiards-spin-selector"
                      data-spin-x={spin.x.toFixed(2)}
                      data-spin-y={spin.y.toFixed(2)}
                      aria-label="Điểm chạm xoáy bi cái"
                      aria-valuemin={-1}
                      aria-valuemax={1}
                      aria-valuenow={spin.y}
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
                      style={{ width: '116px', height: '116px', touchAction: 'none' }}
                      className="relative flex cursor-pointer items-center justify-center rounded-full border-2 border-[#9C7A4C] bg-[radial-gradient(circle_at_35%_35%,#FFFFFF,#FAFBF9_60%,#D5E0DC)] shadow-inner select-none"
                    >
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-3 top-1/2 h-[1px] -translate-y-1/2 bg-[#9C7A4C]/35"
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-3 left-1/2 w-[1px] -translate-x-1/2 bg-[#9C7A4C]/35"
                      />
                      {/* Vòng giới hạn vùng chạm an toàn chống tạch cơ (~62% bán kính bi) */}
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute h-[72px] w-[72px] rounded-full border border-dashed border-[#3B7A65]/45"
                      />
                      <span
                        data-testid="billiards-spin-tip"
                        style={{
                          transform: `translate(${(spin.x * 42).toFixed(1)}px, ${(-spin.y * 42).toFixed(1)}px)`,
                        }}
                        className="pointer-events-none h-4 w-4 rounded-full border-2 border-[#FAFBF9] bg-[#B5443C] shadow-sm"
                      />
                    </div>
                    <span
                      data-testid="billiards-spin-mode-label"
                      className="font-mono text-[10px] font-semibold whitespace-nowrap text-[#1E332E] dark:text-[#C9D6D0]"
                    >
                      {spinModeDescription}
                    </span>
                    <button
                      type="button"
                      onClick={handleResetSpin}
                      className="cursor-pointer font-mono text-[10px] font-semibold text-[#354E48] underline hover:text-[#142622] dark:text-[#98ABA3]"
                    >
                      Đặt lại tâm (0, 0)
                    </button>
                  </div>
                )}
              </div>

              {/* Thanh Kéo Lực: Vertical w-11 (~74% bàn, 260-420px) + 5 vạch khắc mảnh 6px bên trái trên Desktop; Ngang trên Mobile */}
              <div className="relative flex items-center justify-center">
                {!isMobileSlider && (
                  <div
                    aria-hidden="true"
                    data-testid="billiards-power-ticks"
                    className="pointer-events-none absolute inset-y-3 right-full mr-[6px] flex flex-col justify-between"
                  >
                    <span className="h-[1px] w-1.5 bg-[#9C7A4C]/50" />
                    <span className="h-[1px] w-1.5 bg-[#9C7A4C]/50" />
                    <span className="h-[1px] w-1.5 bg-[#9C7A4C]/50" />
                    <span className="h-[1px] w-1.5 bg-[#9C7A4C]/50" />
                    <span className="h-[1px] w-1.5 bg-[#9C7A4C]/50" />
                  </div>
                )}

                <div
                  ref={powerSliderRef}
                  role="slider"
                  tabIndex={0}
                  data-testid="billiards-power-slider"
                  data-orientation={isMobileSlider ? 'horizontal' : 'vertical'}
                  data-power={Math.round(sliderPower * 100)}
                  aria-label="Thanh kéo lực đánh bida (Kéo để nạp lực, thả để đánh)"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(sliderPower * 100)}
                  title="Nhấn giữ và kéo để chỉnh lực đánh · Thả để đánh · Trả về đầu để hủy"
                  style={
                    isMobileSlider
                      ? { width: '210px', height: '40px', touchAction: 'none' }
                      : { height: `${verticalSliderH}px`, touchAction: 'none' }
                  }
                  onPointerDown={handleSliderPointerDown}
                  onPointerMove={handleSliderPointerMove}
                  onPointerUp={handleSliderPointerUp}
                  onPointerCancel={handleSliderPointerUp}
                  className={cn(
                    'relative flex touch-none items-center justify-start overflow-hidden rounded-full border border-[#B9C9C2] bg-[#182924] p-1 shadow-inner select-none dark:border-[#244335]',
                    isMobileSlider
                      ? 'cursor-ew-resize flex-row'
                      : 'max-h-[420px] min-h-[260px] w-11 cursor-ns-resize flex-col',
                  )}
                >
                  {/* Dải màu nền lực mượt */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-1.5 rounded-full opacity-35"
                    style={{
                      background: isMobileSlider
                        ? 'linear-gradient(90deg, #3B7A65 0%, #C29548 55%, #B5443C 100%)'
                        : 'linear-gradient(180deg, #3B7A65 0%, #C29548 55%, #B5443C 100%)',
                    }}
                  />
                  {/* Mức lực đang nạp */}
                  <div
                    aria-hidden="true"
                    style={
                      isMobileSlider
                        ? {
                            width: `${Math.round(sliderPower * 100)}%`,
                            background:
                              'linear-gradient(90deg, #3B7A65 0%, #C29548 55%, #B5443C 100%)',
                          }
                        : {
                            height: `${Math.round(sliderPower * 100)}%`,
                            background:
                              'linear-gradient(180deg, #3B7A65 0%, #C29548 55%, #B5443C 100%)',
                          }
                    }
                    className={cn(
                      'pointer-events-none absolute rounded-full transition-all duration-75',
                      isMobileSlider ? 'inset-y-1.5 left-1.5' : 'inset-x-1.5 top-1.5',
                    )}
                  />
                  {/* Đầu gậy cơ thu nhỏ trượt theo tay kéo (không chữ đè trong rãnh) */}
                  {isMobileSlider ? (
                    <div
                      aria-hidden="true"
                      style={{ transform: `translateX(${Math.round(sliderPower * 155)}px)` }}
                      className="relative z-10 flex h-6 flex-row items-center"
                    >
                      <span className="h-3.5 w-1.5 rounded-l-sm bg-[#49768F]" />
                      <span className="h-3.5 w-1 bg-[#FAFBF9]" />
                      <span className="h-4 w-2.5 rounded-r-sm bg-[#E6D3B3] ring-1 ring-[#C29548]" />
                    </div>
                  ) : (
                    <div
                      aria-hidden="true"
                      style={{
                        transform: `translateY(${Math.round(sliderPower * Math.max(120, verticalSliderH - 72))}px)`,
                      }}
                      className="relative z-10 flex w-6 flex-col items-center"
                    >
                      <span className="h-1.5 w-3.5 rounded-t-sm bg-[#49768F]" />
                      <span className="h-1 w-3.5 bg-[#FAFBF9]" />
                      <span className="h-2.5 w-4 rounded-b-sm bg-[#E6D3B3] ring-1 ring-[#C29548]" />
                      <span className="mt-1 h-11 w-2 rounded-b-full bg-gradient-to-b from-[#E6D3B3] to-[#9C7A4C] opacity-85" />
                    </div>
                  )}
                </div>
              </div>

              {/* Chỉ số lực duy nhất sắc nét dưới đáy thanh */}
              <div className="flex min-h-[28px] flex-col items-center leading-tight">
                <span
                  data-testid="billiards-power-readout"
                  className="font-mono text-[11px] font-semibold text-[#1E332E] tabular-nums dark:text-[#C9D6D0]"
                >
                  {powerReadoutText}
                </span>
                {powerTierLabel && (
                  <span
                    data-testid="billiards-power-tier"
                    className="font-mono text-[8.5px] font-bold tracking-wider text-[#8C6228] dark:text-[#D5B47A]"
                  >
                    {powerTierLabel}
                  </span>
                )}
              </div>
            </div>

            {/* BÀN BIDA 3D & MÁNG HỒI BI HAI RAY TRONG SUỐT NỔI KHỐI */}
            <div
              ref={tableWrapperRef}
              style={{
                maxWidth: `${tableDim.w}px`,
                height: isMobileSlider ? undefined : `${tableDim.h}px`,
                aspectRatio: '1.92 / 1',
                backgroundColor: 'transparent',
              }}
              className="relative order-1 mx-auto flex w-full flex-1 items-center justify-center overflow-visible bg-transparent md:order-2"
            >
              <canvas
                ref={canvasRef}
                data-testid="mineral-billiards-canvas"
                data-substeps={SUBSTEPS}
                data-target-balls={ALL_POOL_BALL_SPECS.length - 1}
                data-pocket-jaws="12"
                aria-label="Bàn Bida 8 Ball Pool Khoáng Thạch 15 Bi"
                style={{ touchAction: 'none', backgroundColor: 'transparent' }}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerUp}
                onWheel={(e) => {
                  const w = getWorld();
                  if (
                    w.shotInProgress ||
                    w.rackCleared ||
                    w.ballInHand ||
                    w.pendingDecision !== null
                  )
                    return;
                  if (w.gameMode === 'vs-ai' && w.currentPlayer === 2) return;
                  const step = e.shiftKey ? FINE_AIM_STEP_RAD : 0.015;
                  w.isPrecisionAim = Boolean(e.shiftKey);
                  w.aimAngle += (e.deltaY > 0 ? 1 : -1) * step;
                }}
                className={cn(
                  'block h-full w-full touch-none bg-transparent select-none',
                  isHoverCueBallInKitchen
                    ? 'cursor-grab active:cursor-grabbing'
                    : 'cursor-crosshair',
                )}
              />

              {/* Toast thông báo nổi 1.6s trên mép trên giữa mặt nỉ */}
              {activeToast && (
                <div
                  data-testid="billiards-felt-toast"
                  data-tone={activeToast.tone}
                  className={cn(
                    'pointer-events-none absolute top-3 left-1/2 z-30 -translate-x-1/2 rounded-full border px-4 py-1.5 font-mono text-[11px] font-bold tracking-wider whitespace-nowrap shadow-lg backdrop-blur-xs',
                    activeToast.tone === 'foul'
                      ? 'border-[#E08A7B]/80 bg-[#5C1E1A]/92 text-[#FFF3F1]'
                      : activeToast.tone === 'reward'
                        ? 'border-[#D5B47A] bg-[#1E332E]/94 text-[#F3D27A]'
                        : 'border-[#CFD9D5]/70 bg-[#142622]/90 text-[#FAFBF9]',
                  )}
                >
                  {activeToast.text}
                </div>
              )}

              {/* Thông báo Đặt bi tự do (Ball-in-Hand) */}
              {!activeToast &&
                !pendingDecision &&
                ballInHand &&
                !rackCleared &&
                !(gameMode === 'vs-ai' && currentPlayer === 2) && (
                  <div
                    data-testid="billiards-ball-in-hand-banner"
                    className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#D5B47A]/80 bg-[#142622]/90 px-4 py-1.5 font-mono text-xs font-semibold text-[#FAFBF9] shadow-lg backdrop-blur-xs"
                  >
                    {foulBanner ?? 'Đặt bi tự do — Bấm chọn vị trí trên bàn'}
                  </div>
                )}

              {/* Banner đề xuất Xếp lại bàn khi bế tắc 6 lượt không ăn bi (WPA 1.12 Stalemate) */}
              {!activeToast &&
                !pendingDecision &&
                !ballInHand &&
                !rackCleared &&
                stalemateOffered && (
                  <div
                    data-testid="billiards-stalemate-banner"
                    className="absolute top-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-[#D5B47A] bg-[#142622]/94 py-1 pr-1.5 pl-4 font-mono text-[11px] font-semibold whitespace-nowrap text-[#FAFBF9] shadow-lg backdrop-blur-xs"
                  >
                    <span>6 lượt không ăn bi · Thế bế tắc (WPA 1.12)</span>
                    <button
                      type="button"
                      data-testid="decision-stalemate-rerack"
                      onClick={handleAcceptStalemate}
                      className="cursor-pointer rounded-full bg-[#9C7A4C] px-3 py-1 text-[10.5px] font-bold text-[#FAFBF9] transition-colors hover:bg-[#B28B56]"
                    >
                      Hòa &amp; Xếp lại bàn
                    </button>
                  </div>
                )}

              {/* Thẻ Quyết định Trọng tài nổi giữa bàn (Illegal Break 3 phương án / 8-Ball on Break 2 phương án) */}
              {pendingDecision &&
                !rackCleared &&
                !(gameMode === 'vs-ai' && pendingDecision.decidingPlayer === 2) && (
                  <div
                    data-testid="billiards-decision-modal"
                    className="absolute inset-0 z-30 flex items-center justify-center bg-[#142622]/55 p-4 backdrop-blur-[2px]"
                  >
                    <div className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-[#9C7A4C] bg-[#FAFBF9] p-5 text-left shadow-2xl dark:bg-[#12241C]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-mono text-[10px] font-bold tracking-widest text-[#8C6228] uppercase dark:text-[#D5B47A]">
                            Quyết định Trọng tài ·{' '}
                            {pendingDecision.decidingPlayer === 1
                              ? 'Người chơi 1'
                              : gameMode === 'vs-ai'
                                ? 'Máy AI'
                                : 'Người chơi 2'}
                          </p>
                          <h3 className="mt-0.5 font-serif text-lg font-bold text-[#142622] dark:text-[#E6ECE7]">
                            {pendingDecision.type === 'illegal-break'
                              ? 'Khai cuộc không hợp lệ (WPA 3.3)'
                              : pendingDecision.scratched
                                ? 'Rơi Bi 8 & Bi cái khi phá (WPA 3.3c)'
                                : 'Rơi Bi số 8 khi khai cuộc (WPA 3.3)'}
                          </h3>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed text-[#354E48] dark:text-[#B9C8C1]">
                        {pendingDecision.type === 'illegal-break'
                          ? 'Cú phá chưa đưa được bi nào vào lỗ và có dưới 4 bi chạm băng. Đối thủ được chọn 1 trong 3 phương án:'
                          : pendingDecision.scratched
                            ? 'Người phá rơi cả Bi 8 và Bi cái. Bạn được quyền Đặt bi Trong Bếp nếu đánh tiếp hoặc yêu cầu xếp lại bàn:'
                            : 'Cú phá hợp lệ đưa Bi 8 vào lỗ. Người phá được chọn phương án xử lý:'}
                      </p>

                      {pendingDecision.type === 'illegal-break' ? (
                        <div className="grid gap-2 sm:grid-cols-1">
                          <button
                            type="button"
                            data-testid="decision-accept-table"
                            onClick={() => handleResolveIllegalBreak('accept-table')}
                            className="cursor-pointer rounded-xl border border-[#9C7A4C] bg-[#1E332E] px-4 py-2 text-left font-mono text-xs font-semibold text-[#FAFBF9] transition-colors hover:bg-[#28443D]"
                          >
                            1. Nhận bàn hiện tại và đánh tiếp
                          </button>
                          <button
                            type="button"
                            data-testid="decision-rebreak-self"
                            onClick={() => handleResolveIllegalBreak('rebreak-self')}
                            className="cursor-pointer rounded-xl border border-[#CFD9D5] bg-[#F2F4F3] px-4 py-2 text-left font-mono text-xs font-semibold text-[#142622] transition-colors hover:border-[#9C7A4C] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#E6ECE7]"
                          >
                            2. Xếp lại bàn — Tôi phá lại
                          </button>
                          <button
                            type="button"
                            data-testid="decision-rebreak-opponent"
                            onClick={() => handleResolveIllegalBreak('rebreak-opponent')}
                            className="cursor-pointer rounded-xl border border-[#CFD9D5] bg-[#F2F4F3] px-4 py-2 text-left font-mono text-xs font-semibold text-[#142622] transition-colors hover:border-[#9C7A4C] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#E6ECE7]"
                          >
                            3. Xếp lại bàn — Bắt đối thủ phá lại
                          </button>
                        </div>
                      ) : (
                        <div className="grid gap-2 sm:grid-cols-1">
                          <button
                            type="button"
                            data-testid="decision-spot-eight"
                            onClick={() => handleResolveEightOnBreak('spot-and-continue')}
                            className="cursor-pointer rounded-xl border border-[#9C7A4C] bg-[#1E332E] px-4 py-2 text-left font-mono text-xs font-semibold text-[#FAFBF9] transition-colors hover:bg-[#28443D]"
                          >
                            1. Đặt lại Bi 8 (Chấm đầu) &amp; đánh tiếp
                          </button>
                          <button
                            type="button"
                            data-testid="decision-rerack"
                            onClick={() => handleResolveEightOnBreak('rerack')}
                            className="cursor-pointer rounded-xl border border-[#CFD9D5] bg-[#F2F4F3] px-4 py-2 text-left font-mono text-xs font-semibold text-[#142622] transition-colors hover:border-[#9C7A4C] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#E6ECE7]"
                          >
                            2. Xếp lại bàn mới và phá lại
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Thông báo kết thúc ván */}
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
                      {winner === 1
                        ? gameMode === 'vs-ai'
                          ? 'Chiến thắng Máy AI!'
                          : gameMode === 'free'
                            ? `Hoàn thành 15 bi · ${shots} cơ`
                            : 'Người chơi 1 Thắng!'
                        : gameMode === 'vs-ai'
                          ? 'Máy AI Chiến thắng'
                          : 'Người chơi 2 Thắng!'}
                    </h3>
                    {winReason && (
                      <p className="font-mono text-xs text-[#354E48] dark:text-[#B9C8C1]">
                        {winReason}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={handleNewRack}
                      className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E332E] px-5 py-2.5 font-mono text-xs font-semibold text-[#FAFBF9] shadow-md transition-transform hover:-translate-y-0.5 hover:bg-[#28443D] active:scale-[0.98] dark:bg-[#245746]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Ván mới</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. THANH ĐÁY GỌN GÀNG: Ván mới · Luật nhanh · Điều hướng trang */}
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8E5] bg-[#F7F9F8] px-4 py-3 md:px-6 dark:border-[#243B32] dark:bg-[#0E1A15]">
            <div className="relative flex flex-wrap items-center gap-2">
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
                <span>Ván mới</span>
              </button>

              {gameMode === 'free' && (
                <button
                  type="button"
                  data-testid="billiards-retry-shot-btn"
                  disabled={!hasFreeRetry}
                  onClick={handleRetryLastShot}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#182624] shadow-2xs transition-all hover:border-[#3B7A65] hover:bg-[#EDF2F0] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#6EB59B]"
                >
                  <span>Thử lại cú vừa rồi</span>
                </button>
              )}

              <button
                type="button"
                data-testid="billiards-guideline-toggle"
                data-guideline-mode={guidelineMode}
                title="Đổi cấp độ tia ngắm (Đầy đủ · Câu lạc bộ · Pro)"
                onClick={handleCycleGuideline}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-3 py-1.5 font-mono text-xs font-semibold text-[#182624] shadow-2xs transition-all hover:border-[#9C7A4C] hover:bg-[#EDF2F0] active:scale-[0.98] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
              >
                <span>{guidelineLabel}</span>
              </button>

              {gameMode === 'vs-ai' && (
                <button
                  type="button"
                  data-testid="billiards-ai-level-toggle"
                  data-ai-difficulty={aiDifficulty}
                  title="Đổi trình độ Máy AI (Tập sự · Câu lạc bộ · Cơ thủ)"
                  onClick={handleCycleAiDifficulty}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-3 py-1.5 font-mono text-xs font-semibold text-[#182624] shadow-2xs transition-all hover:border-[#9C7A4C] hover:bg-[#EDF2F0] active:scale-[0.98] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
                >
                  <span>{aiDifficultyLabel}</span>
                </button>
              )}

              {gameMode !== 'free' && (
                <>
                  <button
                    type="button"
                    data-testid="billiards-callshot-toggle"
                    data-rule-set={ruleSet}
                    aria-pressed={ruleSet === 'wpa-pro'}
                    title="Chuyển bộ luật (Luật: CLB hoặc Luật: WPA Pro bắt buộc chỉ định lỗ)"
                    onClick={handleToggleRuleSet}
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-semibold shadow-2xs transition-all active:scale-[0.98]',
                      ruleSet === 'wpa-pro'
                        ? 'border-[#9C7A4C] bg-[#FAF5EA] text-[#8C6228] dark:border-[#D5B47A] dark:bg-[#2A2215] dark:text-[#D5B47A]'
                        : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#182624] hover:border-[#9C7A4C] hover:bg-[#EDF2F0] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]',
                    )}
                  >
                    <span>{ruleSet === 'wpa-pro' ? 'Luật: WPA Pro' : 'Luật: CLB'}</span>
                  </button>

                  <button
                    type="button"
                    data-testid="billiards-safety-toggle"
                    aria-pressed={isSafetyActive}
                    disabled={
                      isBreakShot ||
                      rackCleared ||
                      pendingDecision !== null ||
                      (gameMode === 'vs-ai' && currentPlayer === 2)
                    }
                    title="Tuyên bố Chạy đạn (Safety · WPA 3.6): cú đánh phòng thủ hợp lệ, không tính ăn bi & chuyển lượt"
                    onClick={handleToggleSafety}
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45',
                      isSafetyActive
                        ? 'border-[#9C7A4C] bg-[#1E332E] text-[#F3D27A] dark:border-[#D5B47A] dark:bg-[#245746]'
                        : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#182624] hover:border-[#9C7A4C] hover:bg-[#EDF2F0] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]',
                    )}
                  >
                    <Shield
                      className="h-3.5 w-3.5 text-[#8C6228] dark:text-[#D5B47A]"
                      aria-hidden="true"
                    />
                    <span>Chạy đạn (Safety)</span>
                  </button>
                </>
              )}

              <button
                type="button"
                data-testid="billiards-rules-btn"
                aria-expanded={isRulesOpen}
                onClick={() => setIsRulesOpen((prev) => !prev)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#182624] shadow-2xs transition-all hover:border-[#9C7A4C] hover:bg-[#EDF2F0] active:scale-[0.98] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
              >
                <BookOpen
                  className="h-3.5 w-3.5 text-[#2D5266] dark:text-[#7FA8C0]"
                  aria-hidden="true"
                />
                <span>Luật &amp; Trọng tài</span>
              </button>

              {isRulesOpen && (
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-label="Sổ tay Luật WPA 8-Ball và Nhật ký Trọng tài"
                  onClick={() => setIsRulesOpen(false)}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-[#142622]/45 p-4 backdrop-blur-[2px]"
                >
                  <div
                    data-testid="billiards-rules-popover"
                    onClick={(e) => e.stopPropagation()}
                    className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[#9C7A4C]/70 bg-[#FAFBF9] text-[#182624] shadow-2xl dark:border-[#D5B47A]/50 dark:bg-[#12241C] dark:text-[#E6ECE7]"
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-[#DCE4E0] px-5 py-3.5 dark:border-[#243B32]">
                      <div>
                        <p className="font-mono text-[10px] font-bold tracking-widest text-[#8C6228] uppercase dark:text-[#D5B47A]">
                          Sổ Tay Chuyên Gia &amp; Nhật Ký Trọng Tài
                        </p>
                        <h3 className="font-serif text-lg font-bold text-[#142622] dark:text-[#E6ECE7]">
                          Luật Thi Đấu WPA 8-Ball Chính Thức
                        </h3>
                      </div>
                      <button
                        type="button"
                        data-testid="billiards-rules-close-btn"
                        aria-label="Đóng sổ tay luật"
                        onClick={() => setIsRulesOpen(false)}
                        className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#CFD9D5] bg-[#F2F4F3] text-[#2D423D] transition-colors hover:border-[#9C7A4C] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#C9D6D0]"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div
                      role="tablist"
                      aria-label="Các mục sổ tay trọng tài"
                      className="flex flex-wrap gap-1.5 border-b border-[#DCE4E0] bg-[#F2F4F3] px-5 py-2.5 dark:border-[#243B32] dark:bg-[#0E1A15]"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={rulesActiveTab === 'controls'}
                        data-testid="rules-tab-controls"
                        onClick={() => setRulesActiveTab('controls')}
                        className={cn(
                          'cursor-pointer rounded-full px-3 py-1 font-mono text-xs font-semibold transition-colors',
                          rulesActiveTab === 'controls'
                            ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746]'
                            : 'text-[#354E48] hover:bg-[#E4ECE8] dark:text-[#98ABA3] dark:hover:bg-[#193026]',
                        )}
                      >
                        Điều khiển
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={rulesActiveTab === 'wpa-rules'}
                        data-testid="rules-tab-wpa"
                        onClick={() => setRulesActiveTab('wpa-rules')}
                        className={cn(
                          'cursor-pointer rounded-full px-3 py-1 font-mono text-xs font-semibold transition-colors',
                          rulesActiveTab === 'wpa-rules'
                            ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746]'
                            : 'text-[#354E48] hover:bg-[#E4ECE8] dark:text-[#98ABA3] dark:hover:bg-[#193026]',
                        )}
                      >
                        Bộ Luật WPA 8-Ball
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={rulesActiveTab === 'referee-log'}
                        data-testid="rules-tab-log"
                        onClick={() => setRulesActiveTab('referee-log')}
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold transition-colors',
                          rulesActiveTab === 'referee-log'
                            ? 'bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746]'
                            : 'text-[#354E48] hover:bg-[#E4ECE8] dark:text-[#98ABA3] dark:hover:bg-[#193026]',
                        )}
                      >
                        <span>Nhật ký Trọng tài</span>
                        {refereeLog.length > 0 && (
                          <span className="rounded-full bg-[#9C7A4C] px-1.5 py-0.5 text-[10px] text-[#FAFBF9]">
                            {refereeLog.length}
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="overflow-y-auto px-5 py-4 text-xs leading-relaxed text-[#2D423D] dark:text-[#C9D6D0]">
                      {rulesActiveTab === 'controls' && (
                        <ul className="space-y-2">
                          <li>
                            • <strong>Xoay hướng ngắm:</strong> Kéo chuột trực tiếp trên mặt bàn
                            hoặc dùng phím <kbd className="font-mono font-bold">← / →</kbd>.
                          </li>
                          <li>
                            • <strong>Vi chỉnh ±0.15°:</strong> Giữ{' '}
                            <kbd className="font-mono font-bold">Shift</kbd> khi kéo/lăn chuột hoặc
                            bấm cặp nút <kbd className="font-mono font-bold">↺ / ↻</kbd> dưới nút
                            Xoáy.
                          </li>
                          <li>
                            • <strong>Chỉnh lực &amp; Đánh:</strong> Kéo thanh lực dọc bên trái
                            (hoặc giữ <kbd className="font-mono font-bold">Space</kbd>, nhấn{' '}
                            <kbd className="font-mono font-bold">Esc</kbd> để hủy) rồi thả.
                          </li>
                          <li>
                            • <strong>Xoáy bi cái (Cù lê · Trô · Ép phê):</strong> Bấm bi trắng chấm
                            đỏ bên trái để chọn điểm chạm; bấm đúp để về tâm (0, 0).
                          </li>
                          <li>
                            • <strong>Chỉ định lỗ &amp; Chạy đạn:</strong> Bấm trực tiếp vào lỗ mục
                            tiêu trên bàn khi đánh Bi 8 hoặc ở chế độ{' '}
                            <span className="font-mono font-semibold">WPA Pro</span>; bật{' '}
                            <span className="font-mono font-semibold">Chạy đạn (Safety)</span> khi
                            muốn phòng thủ chuyển lượt.
                          </li>
                          <li>
                            • <strong>Khóa màn hình (Focus Mode):</strong> Nhấn phím{' '}
                            <kbd className="font-mono font-bold">L</kbd> hoặc nút Khóa màn hình để
                            cố định khung bàn, nhấn <kbd className="font-mono font-bold">Esc</kbd>{' '}
                            để mở lại.
                          </li>
                        </ul>
                      )}

                      {rulesActiveTab === 'wpa-rules' && (
                        <div className="space-y-3">
                          <section className="rounded-xl border border-[#DCE4E0] bg-[#F7F9F8] p-3 dark:border-[#243B32] dark:bg-[#0E1A15]">
                            <h4 className="font-mono text-[11px] font-bold text-[#8C6228] uppercase dark:text-[#D5B47A]">
                              1. Khai cuộc hợp lệ &amp; Illegal Break (WPA 3.3)
                            </h4>
                            <p className="mt-1">
                              Cú phá hợp lệ phải ăn được ít nhất <strong>1 bi mục tiêu</strong> hoặc
                              có tối thiểu <strong>4 bi mục tiêu khác nhau</strong> chạm thành băng.
                              Nếu không đạt (Illegal Break), đối thủ được chọn 1 trong 3 quyền:{' '}
                              <em>Nhận bàn đánh tiếp</em>, <em>Tự phá lại</em>, hoặc{' '}
                              <em>Bắt người vừa phá xếp bàn phá lại</em>. Rơi Bi 8 lúc phá không bị
                              xử thua (nếu không kèm lỗi, người phá chọn Đặt lại Bi 8 tại chấm đầu
                              hoặc Xếp lại bàn).
                            </p>
                          </section>

                          <section className="rounded-xl border border-[#DCE4E0] bg-[#F7F9F8] p-3 dark:border-[#243B32] dark:bg-[#0E1A15]">
                            <h4 className="font-mono text-[11px] font-bold text-[#8C6228] uppercase dark:text-[#D5B47A]">
                              2. Bàn Mở &amp; Phân nhóm bi (WPA 3.4)
                            </h4>
                            <p className="mt-1">
                              Bàn luôn ở trạng thái <strong>Mở (Open Table)</strong> sau cú phá, kể
                              cả khi ăn bi lúc phá. Nhóm bi (Trơn 1–7 hoặc Sọc 9–15) chỉ được chốt
                              khi một cơ thủ ăn hợp lệ một bi được chỉ định sau cú phá (không phạm
                              lỗi và không phải Bi 8). Ở chế độ <strong>WPA Pro</strong>, mọi cơ đều
                              phải chỉ định lỗ trước khi đánh; ở chế độ <strong>CLB</strong>, chỉ
                              bắt buộc chỉ định lỗ cho Bi số 8.
                            </p>
                          </section>

                          <section className="rounded-xl border border-[#DCE4E0] bg-[#F7F9F8] p-3 dark:border-[#243B32] dark:bg-[#0E1A15]">
                            <h4 className="font-mono text-[11px] font-bold text-[#8C6228] uppercase dark:text-[#D5B47A]">
                              3. Đặt bi Trong Bếp (Head String / Kitchen)
                            </h4>
                            <p className="mt-1">
                              Khi người phá làm rơi bi cái lúc khai cuộc (Scratch on Break), đối thủ
                              nhận Ball-in-Hand giới hạn <strong>Trong Bếp</strong> (vùng 25% đầu
                              bàn). Cú đánh từ Trong Bếp bắt buộc chạm bi mục tiêu nằm ngoài vạch
                              Bếp hoặc đưa bi cái vượt qua vạch Bếp trước khi va chạm bi trong Bếp
                              (ngoại lệ khi mọi bi hợp lệ đều nằm Trong Bếp).
                            </p>
                          </section>

                          <section className="rounded-xl border border-[#DCE4E0] bg-[#F7F9F8] p-3 dark:border-[#243B32] dark:bg-[#0E1A15]">
                            <h4 className="font-mono text-[11px] font-bold text-[#8C6228] uppercase dark:text-[#D5B47A]">
                              4. Chạy đạn (Safety) &amp; Chỉ định lỗ (WPA 3.6–3.7)
                            </h4>
                            <p className="mt-1">
                              Cơ thủ có thể tuyên bố <strong>Chạy đạn (Safety)</strong> để đánh một
                              cú phòng thủ chiến thuật: vẫn phải chạm đúng bi hợp lệ và có bi chạm
                              băng/rơi lỗ, nhưng không tính giữ lượt dù có bi rơi lỗ (bi ăn hợp lệ
                              vẫn nằm dưới lỗ). Cú đánh vào nhầm lỗ chỉ định không phạm lỗi nhưng
                              mất lượt và không được phân nhóm (bi nhầm lỗ giữ nguyên dưới lỗ).
                            </p>
                          </section>

                          <section className="rounded-xl border border-[#DCE4E0] bg-[#F7F9F8] p-3 dark:border-[#243B32] dark:bg-[#0E1A15]">
                            <h4 className="font-mono text-[11px] font-bold text-[#8C6228] uppercase dark:text-[#D5B47A]">
                              5. Đặt lại Bi 8 (Long-String) &amp; Thế bế tắc (WPA 1.12)
                            </h4>
                            <p className="mt-1">
                              Khi cần đặt lại Bi số 8, trọng tài đặt Bi 8 tại{' '}
                              <strong>Chấm đầu (Foot Spot)</strong>; nếu chấm bị bi khác chiếm, bi
                              được tịnh tiến từng nấc dọc theo trục tâm về phía băng cuối đến vị trí
                              trống gần nhất. Nếu diễn ra <strong>6 lượt liên tiếp</strong> không có
                              bi mục tiêu nào rơi lỗ hợp lệ, trận đấu mở đề xuất{' '}
                              <strong>Hòa &amp; Xếp lại bàn (Stalemate)</strong>.
                            </p>
                          </section>

                          <section className="rounded-xl border border-[#E08A7B]/45 bg-[#FFF6F4] p-3 text-[#4E231D] dark:border-[#6A2B24] dark:bg-[#231412] dark:text-[#F0C8C2]">
                            <h4 className="font-mono text-[11px] font-bold text-[#B5443C] uppercase dark:text-[#F08A80]">
                              6. Lỗi xử thua &amp; Khác biệt với 9-Ball
                            </h4>
                            <p className="mt-1">
                              Đưa Bi 8 vào lỗ khi chưa dọn hết nhóm, rơi bi cái/phạm lỗi trong cùng
                              cú đánh ăn Bi 8, hoặc đưa Bi 8 sai lỗ đã chỉ định sẽ bị{' '}
                              <strong>xử thua ngay lập tức</strong>. Lưu ý chuyên môn: Luật WPA
                              8-Ball chính thức <strong>không áp dụng</strong> quy tắc &ldquo;3 lỗi
                              liên tiếp bị xử thua&rdquo; (quy tắc 3-foul chỉ áp dụng ở 9-Ball).
                            </p>
                          </section>
                        </div>
                      )}

                      {rulesActiveTab === 'referee-log' && (
                        <div data-testid="billiards-referee-log-list" className="space-y-2">
                          {refereeLog.length === 0 ? (
                            <p className="py-6 text-center font-mono text-xs text-[#556B65] dark:text-[#98ABA3]">
                              Chưa có biên bản nào trong ván hiện tại. Thực hiện cú khai cuộc để
                              trọng tài ghi nhận từng lượt đánh.
                            </p>
                          ) : (
                            [...refereeLog].reverse().map((entry) => {
                              const badgeLabel =
                                entry.verdict === 'foul'
                                  ? 'Lỗi'
                                  : entry.verdict === 'win'
                                    ? 'Thắng'
                                    : entry.verdict === 'loss'
                                      ? 'Thua'
                                      : entry.verdict === 'decision'
                                        ? 'Trọng tài'
                                        : 'Hợp lệ';
                              const badgeClass =
                                entry.verdict === 'foul' || entry.verdict === 'loss'
                                  ? 'bg-[#B5443C]/15 text-[#B5443C] dark:text-[#F08A80]'
                                  : entry.verdict === 'win' || entry.verdict === 'decision'
                                    ? 'bg-[#9C7A4C]/18 text-[#8C6228] dark:text-[#D5B47A]'
                                    : 'bg-[#3B7A65]/15 text-[#2C614F] dark:text-[#6EB59B]';
                              return (
                                <div
                                  key={entry.seq}
                                  className="flex items-start justify-between gap-3 rounded-xl border border-[#DCE4E0] bg-[#F7F9F8] px-3.5 py-2.5 dark:border-[#243B32] dark:bg-[#0E1A15]"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] font-bold">
                                      <span className="text-[#8C6228] dark:text-[#D5B47A]">
                                        Cơ #{entry.shotNumber}
                                      </span>
                                      <span>·</span>
                                      <span>
                                        {entry.player === 1
                                          ? 'P1'
                                          : gameMode === 'vs-ai'
                                            ? 'Máy AI'
                                            : 'P2'}
                                      </span>
                                      <span>·</span>
                                      <span>{entry.actionLabel}</span>
                                    </div>
                                    <p className="mt-0.5 text-xs text-[#354E48] dark:text-[#B9C8C1]">
                                      {entry.detail}
                                    </p>
                                  </div>
                                  <span
                                    className={cn(
                                      'shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase',
                                      badgeClass,
                                    )}
                                  >
                                    {badgeLabel}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                data-testid="billiards-screen-lock-btn"
                aria-pressed={isScreenLocked}
                title={
                  isScreenLocked
                    ? 'Mở khóa cuộn trang (phím L hoặc Esc)'
                    : 'Khóa màn hình cố định khung bàn khi chơi (phím L)'
                }
                onClick={() => setIsScreenLocked((prev) => !prev)}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-semibold shadow-2xs transition-all active:scale-[0.98]',
                  isScreenLocked
                    ? 'border-[#9C7A4C] bg-[#1E332E] text-[#FAFBF9] shadow-[0_6px_18px_rgba(30,51,46,0.24)]'
                    : 'border-[#CFD9D5] bg-[#FAFBF9] text-[#1E332E] hover:border-[#9C7A4C] hover:bg-[#EDF2F0] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]',
                )}
              >
                {isScreenLocked ? (
                  <>
                    <Lock className="h-3.5 w-3.5 text-[#D4AF6A]" aria-hidden="true" />
                    <span>Đã khóa màn hình · Mở</span>
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 animate-pulse rounded-full bg-[#D4AF6A]"
                    />
                  </>
                ) : (
                  <>
                    <Unlock
                      className="h-3.5 w-3.5 text-[#8C6228] dark:text-[#D5B47A]"
                      aria-hidden="true"
                    />
                    <span>Khóa màn hình</span>
                    <kbd className="rounded border border-[#CFD9D5] bg-[#F2F4F3] px-1.5 py-0.5 text-[10px] font-bold text-[#4A5D58] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#98ABA3]">
                      L
                    </kbd>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Đường viền kép mảnh Đồng Trầm chuyển tiếp gọn xuống Footer */}
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
