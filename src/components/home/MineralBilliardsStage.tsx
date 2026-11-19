import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  HelpCircle,
  RotateCcw,
  Trophy,
  User,
  Users,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  ALL_POOL_BALL_SPECS,
  buildOfficial15BallRack,
  clampValidCueBallPlacement,
  computeAiShotPlan,
  computeTableMetrics,
  createBilliardsWorld,
  MAX_SHOT_SPEED_PX_PER_FRAME,
  normalizeAngleDiff,
  PRECISION_AIM_FACTOR,
  renderBilliardsStageFrame,
  SOLID_BALL_SPECS,
  spawnChalkDustBurst,
  stepBilliardsPhysicsFrame,
  STRIPE_BALL_SPECS,
  STRIKE_ANIM_DURATION_SEC,
  TABLE_SHAKE_DURATION_SEC,
  type BallGroup,
  type BilliardGameMode,
  type BilliardsWorld,
  type StrikeAnimationState,
} from '@/components/home/billiardsEngine';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { computeFrameDelta, getLowLatency2DContext } from '@/shared/lib/canvasSprites';
import { cn } from '@/shared/lib/cn';
import {
  playCueStrike,
  playRackClear,
  setBilliardSoundEnabled,
  unlockBilliardAudio,
} from '@/utils/billiardAudio';

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
      <div className="flex items-center gap-1" data-testid={`${testIdPrefix}-slots`}>
        {Array.from({ length: 7 }, (_, idx) => (
          <span
            key={idx}
            aria-hidden="true"
            className="inline-block h-3.5 w-3.5 rounded-full border border-dashed border-[#8BA098]/70 bg-transparent dark:border-[#3E5C50]"
          />
        ))}
      </div>
    );
  }

  const specs = group === 'solids' ? SOLID_BALL_SPECS : STRIPE_BALL_SPECS;
  return (
    <div className="flex items-center gap-1" data-testid={`${testIdPrefix}-slots`}>
      {specs.map((spec) => {
        const isPocketed = pocketedIds.includes(spec.number);
        return (
          <span
            key={spec.number}
            data-testid={`${testIdPrefix}-ball-${spec.number}`}
            data-pocketed={isPocketed ? 'true' : 'false'}
            title={`Bi ${spec.number} (${spec.name}): ${isPocketed ? 'Đã ăn' : 'Còn trên bàn'}`}
            style={{
              backgroundColor: spec.isStripe ? '#F8F9F7' : spec.colorHex,
              borderColor: spec.colorHex,
            }}
            className={cn(
              'relative inline-flex h-4 w-4 items-center justify-center overflow-hidden rounded-full border font-mono text-[8px] font-bold transition-all duration-200',
              isPocketed ? 'scale-90 opacity-30' : 'shadow-2xs',
            )}
          >
            {spec.isStripe && (
              <span
                aria-hidden="true"
                style={{ backgroundColor: spec.colorHex }}
                className="pointer-events-none absolute inset-x-0 h-[52%]"
              />
            )}
            <span className="relative z-10 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-[#FAFBF9]/95 text-[#141817]">
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
  const [spin, setSpin] = useState<{ readonly x: number; readonly y: number }>({ x: 0, y: 0 });
  const [isSpinOpen, setIsSpinOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const powerSliderRef = useRef<HTMLDivElement>(null);
  const spinPadRef = useRef<HTMLDivElement>(null);
  const spinPopupWrapperRef = useRef<HTMLDivElement>(null);

  const isDraggingSliderRef = useRef(false);
  const sliderStartYRef = useRef(0);
  const isDraggingSpinRef = useRef(false);
  const spaceChargingRef = useRef(false);

  const worldRef = useRef<BilliardsWorld | null>(null);
  const getWorld = useCallback((): BilliardsWorld => {
    if (!worldRef.current) {
      worldRef.current = createBilliardsWorld(1020, 490, 'vs-ai');
    }
    return worldRef.current;
  }, []);

  const syncReactHudFromWorld = useCallback(() => {
    const w = getWorld();
    setShots(w.shots);
    setCurrentPlayer(w.currentPlayer);
    setP1Group(w.p1Group);
    setP2Group(w.p2Group);
    setBallInHand(w.ballInHand);
    setIsBreakShot(w.isBreakShot);
    setFoulBanner(w.foulMessage);
    setRackCleared(w.rackCleared);
    setWinner(w.winner);
    setWinReason(w.winReason);
    setAiStatusText(
      w.aiPlan.phase !== 'idle'
        ? w.aiPlan.phase === 'aiming'
          ? 'Máy đang ngắm...'
          : 'Máy đang kéo lực...'
        : null,
    );
    const pocketedIds = w.balls.filter((b) => b.id >= 1 && b.pocketed).map((b) => b.id);
    setPocketedBallIds(pocketedIds);

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

      cueBall.vx = strike.dirX * strike.launchSpeed;
      cueBall.vy = strike.dirY * strike.launchSpeed;
      w.activeCueSpinX = strike.spinX * (0.35 + strike.power * 0.65);
      w.activeCueSpinY = strike.spinY * (0.35 + strike.power * 0.65);
      w.activeShotDirX = strike.dirX;
      w.activeShotDirY = strike.dirY;
      w.cueHasHitBallThisTurn = false;
      w.firstHitBallIdThisTurn = null;
      w.pocketedIdsThisTurn = [];
      w.scratchedThisTurn = false;
      w.foulMessage = null;

      const tipContactX = cueBall.x - strike.dirX * w.metrics.ballRadius;
      const tipContactY = cueBall.y - strike.dirY * w.metrics.ballRadius;
      spawnChalkDustBurst(w, tipContactX, tipContactY, strike.dirX, strike.dirY);
      playCueStrike(strike.power);

      if (strike.power > 0.8) {
        w.shakeRemainingSec = TABLE_SHAKE_DURATION_SEC;
      }
    },
    [getWorld],
  );

  const launchShotWithPower = useCallback(
    (powerNorm: number, angleRad?: number) => {
      const w = getWorld();
      const cueBall = w.balls[0];
      if (
        !cueBall ||
        cueBall.pocketed ||
        w.shotInProgress ||
        w.rackCleared ||
        w.strikeAnim.active
      ) {
        return false;
      }

      const clampedPower = Math.max(0.08, Math.min(1, powerNorm));
      const shotAngle = angleRad ?? w.aimAngle;
      const dirX = Math.cos(shotAngle);
      const dirY = Math.sin(shotAngle);
      const launchSpeed = (0.16 + clampedPower * 0.84) * MAX_SHOT_SPEED_PX_PER_FRAME;

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
      setSliderPower(0);
      syncReactHudFromWorld();
    },
    [getWorld, syncReactHudFromWorld],
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

    const ctx = getLowLatency2DContext(canvas, { alpha: false });
    if (!ctx) return;

    const w = getWorld();

    const updateSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const nextW = Math.max(400, Math.floor(rect.width || 1020));
      const nextH = Math.max(220, Math.floor(rect.height || Math.round(nextW * 0.48)));
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
    };

    updateSize();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        w.isPrecisionAim = true;
      }
      if (
        event.code === 'Space' &&
        !w.shotInProgress &&
        !w.rackCleared &&
        !w.ballInHand &&
        !(w.gameMode === 'vs-ai' && w.currentPlayer === 2)
      ) {
        const activeTag = document.activeElement?.tagName;
        if (activeTag === 'INPUT' || activeTag === 'TEXTAREA') return;
        const rect = section?.getBoundingClientRect();
        const inView = rect ? rect.top < window.innerHeight && rect.bottom > 0 : false;
        if (!inView) return;
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

      // Nạp lực khi người chơi giữ Space
      if (spaceChargingRef.current && !w.shotInProgress && !w.strikeAnim.active) {
        w.dragPullPower = Math.min(1, w.dragPullPower + dtSeconds * 0.95);
        setSliderPower(w.dragPullPower);
      }

      // Chạy AI Bot tự động (xoay gậy 650ms -> kéo lực 450ms -> tung cú đánh) khi đến lượt Máy
      if (
        w.gameMode === 'vs-ai' &&
        w.currentPlayer === 2 &&
        !w.shotInProgress &&
        !w.strikeAnim.active &&
        !w.rackCleared
      ) {
        if (w.aiPlan.phase === 'idle') {
          w.aiPlan = computeAiShotPlan(w);
          if (w.ballInHand && w.aiPlan.placeX !== null && w.aiPlan.placeY !== null) {
            const cue = w.balls[0];
            if (cue) {
              cue.x = w.aiPlan.placeX;
              cue.y = w.aiPlan.placeY;
            }
            w.ballInHand = false;
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
            w.aiPlan.phase = 'idle';
            launchShotWithPower(chosenPower, chosenAngle);
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

    window.addEventListener('resize', updateSize, { passive: true });
    renderBilliardsStageFrame(ctx, w, isDarkModeActive());
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
    if (w.rackCleared || w.strikeAnim.active || w.shotInProgress) return;
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
      cueBall.pocketed = false;
      cueBall.sinking = false;
      w.ballInHand = false;
      w.foulMessage = null;
      syncReactHudFromWorld();
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
    const distFromCue = Math.hypot(pt.x - cueBall.x, pt.y - cueBall.y);
    if (distFromCue > w.metrics.ballRadius * 2.2) {
      w.aimAngle = Math.atan2(pt.y - cueBall.y, pt.x - cueBall.x);
    }
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const w = getWorld();
    const pt = getCanvasPoint(event);

    if (w.ballInHand && !(w.gameMode === 'vs-ai' && w.currentPlayer === 2)) {
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

    if (!w.isDraggingAim) return;
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
    try {
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Bỏ qua trong JSDOM
    }
  };

  // Thanh kéo lực dọc bên trái bàn (Vertical Power Cue Slider)
  const handleSliderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    unlockBilliardAudio();
    const w = getWorld();
    if (w.rackCleared || w.shotInProgress || w.strikeAnim.active || w.ballInHand) return;
    if (w.gameMode === 'vs-ai' && w.currentPlayer === 2) return;

    isDraggingSliderRef.current = true;
    sliderStartYRef.current = event.clientY;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Bỏ qua trong JSDOM
    }
    const rect = powerSliderRef.current?.getBoundingClientRect();
    const travel = rect ? Math.max(120, rect.height * 0.78) : 210;
    const p = Math.max(0, Math.min(1, (event.clientY - sliderStartYRef.current) / travel));
    w.dragPullPower = p;
    setSliderPower(p);
  };

  const handleSliderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSliderRef.current) return;
    const w = getWorld();
    const rect = powerSliderRef.current?.getBoundingClientRect();
    const travel = rect ? Math.max(120, rect.height * 0.78) : 210;
    const p = Math.max(0, Math.min(1, (event.clientY - sliderStartYRef.current) / travel));
    w.dragPullPower = p;
    setSliderPower(p);
  };

  const handleSliderPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSliderRef.current) return;
    isDraggingSliderRef.current = false;
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
    : aiStatusText
      ? aiStatusText
      : ballInHand
        ? 'Đặt bi tự do'
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

  return (
    <section
      ref={sectionRef}
      id="ban-bida-khoang-thach"
      data-testid="mineral-billiards-stage"
      aria-label="Bàn Bida 8 Ball Pool Khoáng Thạch 120fps"
      className={cn(
        'relative scroll-mt-20 border-t border-[#D4DFDA] bg-[#F2F4F3] text-[#142622] dark:border-[#1E3B2D] dark:bg-[#0E1A15] dark:text-[#E6ECE7]',
        className,
      )}
    >
      {/* Dấu cộng chuẩn trực (+) trên đường ngăn kỹ thuật */}
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

      <div className="mx-auto max-w-[1400px] px-4 pt-12 pb-18 sm:px-6 lg:px-10">
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

          {/* 4.A. TOP MATCH HUD 3 PHẦN CÂN ĐỐI CHUẨN 8 BALL POOL */}
          <div
            data-testid="billiards-match-hud"
            className="grid grid-cols-1 items-center gap-3 border-b border-[#E2E8E5] bg-[#F7F9F8] px-4 py-3 sm:px-6 lg:grid-cols-12 dark:border-[#243B32] dark:bg-[#0E1A15]"
          >
            {/* Bên trái: Bạn / P1 + viền sáng Ngọc Bích + 7 ô bi */}
            <div className="flex items-center justify-between gap-2 lg:col-span-4 lg:justify-start">
              <div
                data-testid="billiards-p1-card"
                data-active={isPlayerOneActive ? 'true' : 'false'}
                className={cn(
                  'inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-all',
                  isPlayerOneActive
                    ? 'border-[#3B7A65] bg-[#EDF6F2] shadow-[0_0_0_1px_rgba(59,122,101,0.35)] dark:border-[#6EB59B] dark:bg-[#163127]'
                    : 'border-[#DCE4E0] bg-[#FAFBF9] opacity-85 dark:border-[#244335] dark:bg-[#12241C]',
                )}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#3B7A65] text-[#FAFBF9]">
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
                        : gameMode === 'free'
                          ? `${shots} cơ · Kỷ lục ${bestRecord ?? '—'}`
                          : 'Chưa chia nhóm'}
                  </span>
                </div>
              </div>
              <PlayerRackSlots group={p1Group} pocketedIds={pocketedBallIds} testIdPrefix="p1" />
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
                    'cursor-pointer rounded-full px-2.5 py-1 transition-colors',
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
                    'cursor-pointer rounded-full px-2.5 py-1 transition-colors',
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
                    'cursor-pointer rounded-full px-2.5 py-1 transition-colors',
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
                className="inline-flex items-center rounded-full border border-[#D4DFDA] bg-[#FAFBF9] px-2.5 py-1 font-mono text-[11px] font-bold text-[#8C6228] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#D5B47A]"
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

            {/* Bên phải: Đối thủ (Máy AI / P2) + viền sáng Đồng Cổ + 7 ô bi */}
            <div className="flex items-center justify-between gap-2 lg:col-span-4 lg:justify-end">
              {gameMode === 'free' ? (
                <div className="flex items-center gap-2 font-mono text-xs text-[#354E48] dark:text-[#B9C8C1]">
                  <span>
                    Đã ăn: <strong>{pocketedBallIds.length} / 15</strong>
                  </span>
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
                      'inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition-all',
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
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#9C7A4C] text-[#FAFBF9]">
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

          {/* KHU VỰC BÀN BIDA + THANH LỰC DỌC BÊN TRÁI + NÚT XOÁY GÓC TRÊN PHẢI */}
          <div className="relative flex items-center gap-2.5 bg-[#EEF2F0] p-2.5 sm:gap-4 sm:p-5 dark:bg-[#0D1A14]">
            {/* 3.C. THANH KÉO LỰC DỌC ĐỘC LẬP BÊN TRÁI BÀN (Vertical Power Cue Slider) */}
            <div className="flex shrink-0 flex-col items-center gap-1.5">
              <div
                ref={powerSliderRef}
                role="slider"
                tabIndex={0}
                data-testid="billiards-power-slider"
                data-power={Math.round(sliderPower * 100)}
                aria-label="Thanh kéo lực đánh bida (Kéo xuống để nạp lực, thả để đánh)"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(sliderPower * 100)}
                title="Nhấn giữ và kéo xuống để chỉnh lực đánh · Thả để đánh · Trả lên đỉnh để hủy"
                onPointerDown={handleSliderPointerDown}
                onPointerMove={handleSliderPointerMove}
                onPointerUp={handleSliderPointerUp}
                onPointerCancel={handleSliderPointerUp}
                className="relative flex h-[220px] w-9 cursor-ns-resize touch-none flex-col items-center justify-start overflow-hidden rounded-full border border-[#B9C9C2] bg-[#182924] p-1 shadow-inner select-none sm:h-[280px] sm:w-10 dark:border-[#244335]"
              >
                {/* Vạch chia lực chuyển màu từ Ngọc Bích -> Vàng Đồng -> Đỏ Đất Nung */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-1.5 rounded-full opacity-35"
                  style={{
                    background: 'linear-gradient(180deg, #3B7A65 0%, #C29548 55%, #B5443C 100%)',
                  }}
                />
                {/* Vạch mức lực đang nạp */}
                <div
                  aria-hidden="true"
                  style={{
                    height: `${Math.round(sliderPower * 100)}%`,
                    background: 'linear-gradient(180deg, #3B7A65 0%, #C29548 55%, #B5443C 100%)',
                  }}
                  className="pointer-events-none absolute inset-x-1.5 top-1.5 rounded-full transition-[height] duration-75"
                />
                {/* Đầu gậy cơ thu nhỏ trượt theo tay kéo */}
                <div
                  aria-hidden="true"
                  style={{ transform: `translateY(${Math.round(sliderPower * 195)}px)` }}
                  className="relative z-10 flex w-6 flex-col items-center"
                >
                  <span className="h-1.5 w-3.5 rounded-t-sm bg-[#3B7A65]" />
                  <span className="h-1 w-3.5 bg-[#FAFBF9]" />
                  <span className="h-2.5 w-4 rounded-b-sm bg-[#D2B486] ring-1 ring-[#9C7A4C]" />
                  <span className="mt-1 h-12 w-2 rounded-b-full bg-gradient-to-b from-[#C9A878] to-[#9C7A4C] opacity-85" />
                </div>
              </div>
              <span className="font-mono text-[10px] font-bold text-[#354E48] tabular-nums dark:text-[#98ABA3]">
                {Math.round(sliderPower * 100)}%
              </span>
            </div>

            {/* BÀN BIDA 3D & MÁNG HỒI BI CƠ KHÍ */}
            <div
              ref={tableWrapperRef}
              className="relative mx-auto aspect-[2.08/1] max-h-[500px] min-h-[240px] w-full flex-1 overflow-hidden rounded-xl"
            >
              <canvas
                ref={canvasRef}
                data-testid="mineral-billiards-canvas"
                data-substeps="6"
                data-target-balls={ALL_POOL_BALL_SPECS.length - 1}
                data-pocket-jaws="12"
                aria-label="Bàn Bida 8 Ball Pool Khoáng Thạch 15 Bi"
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerCancel={handleCanvasPointerUp}
                onWheel={(e) => {
                  const w = getWorld();
                  if (w.shotInProgress || w.rackCleared || w.ballInHand) return;
                  if (w.gameMode === 'vs-ai' && w.currentPlayer === 2) return;
                  w.aimAngle += (e.deltaY > 0 ? 1 : -1) * 0.015;
                }}
                className="block h-full w-full cursor-crosshair touch-none select-none"
              />

              {/* 3.D. NÚT BẢNG CHỈNH XOÁY BI CÁI (Cue Tip Spin Popup Trigger) GÓC TRÊN PHẢI */}
              <div ref={spinPopupWrapperRef} className="absolute top-3 right-12 z-20 sm:right-14">
                <button
                  type="button"
                  data-testid="billiards-spin-popup-trigger"
                  aria-expanded={isSpinOpen}
                  aria-label="Mở bảng chọn điểm chạm xoáy bi cái"
                  onClick={() => setIsSpinOpen((prev) => !prev)}
                  className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-[#CFD9D5] bg-[radial-gradient(circle_at_35%_35%,#FFFFFF,#FAFBF9_65%,#D3DFDB)] shadow-md transition-transform hover:scale-105 active:scale-95"
                >
                  <span
                    aria-hidden="true"
                    style={{
                      transform: `translate(${(spin.x * 10).toFixed(1)}px, ${(-spin.y * 10).toFixed(1)}px)`,
                    }}
                    className="h-2.5 w-2.5 rounded-full bg-[#B5443C] ring-1 ring-[#FAFBF9]"
                  />
                </button>

                {isSpinOpen && (
                  <div
                    data-testid="billiards-spin-popover"
                    className="absolute top-11 right-0 z-30 flex flex-col items-center gap-2 rounded-2xl border border-[#CFD9D5] bg-[#FAFBF9] p-3 shadow-2xl dark:border-[#244335] dark:bg-[#12241C]"
                  >
                    <span className="font-mono text-[10px] font-bold tracking-wider text-[#8C6228] uppercase dark:text-[#D5B47A]">
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
                      style={{ width: '112px', height: '112px' }}
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
                      <span
                        data-testid="billiards-spin-tip"
                        style={{
                          transform: `translate(${(spin.x * 40).toFixed(1)}px, ${(-spin.y * 40).toFixed(1)}px)`,
                        }}
                        className="pointer-events-none h-4 w-4 rounded-full border-2 border-[#FAFBF9] bg-[#B5443C] shadow-sm"
                      />
                    </div>
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

              {/* Thông báo Đặt bi tự do (Ball-in-Hand) */}
              {ballInHand && !rackCleared && !(gameMode === 'vs-ai' && currentPlayer === 2) && (
                <div
                  data-testid="billiards-ball-in-hand-banner"
                  className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#D5B47A]/80 bg-[#142622]/90 px-4 py-1.5 font-mono text-xs font-semibold text-[#FAFBF9] shadow-lg backdrop-blur-xs"
                >
                  {foulBanner ?? 'Đặt bi tự do — Bấm chọn vị trí trên bàn'}
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
          <div className="relative flex flex-wrap items-center justify-between gap-3 border-t border-[#E2E8E5] bg-[#F7F9F8] px-5 py-3.5 sm:px-6 dark:border-[#243B32] dark:bg-[#0E1A15]">
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

              <button
                type="button"
                data-testid="billiards-rules-btn"
                aria-expanded={isRulesOpen}
                onClick={() => setIsRulesOpen((prev) => !prev)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CFD9D5] bg-[#FAFBF9] px-3.5 py-1.5 font-mono text-xs font-semibold text-[#182624] shadow-2xs transition-all hover:border-[#9C7A4C] hover:bg-[#EDF2F0] active:scale-[0.98] dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7] dark:hover:border-[#D5B47A]"
              >
                <HelpCircle
                  className="h-3.5 w-3.5 text-[#2D5266] dark:text-[#7FA8C0]"
                  aria-hidden="true"
                />
                <span>Luật nhanh</span>
              </button>

              {isRulesOpen && (
                <div
                  data-testid="billiards-rules-popover"
                  className="absolute bottom-11 left-0 z-30 w-80 rounded-xl border border-[#CFD9D5] bg-[#FAFBF9] p-3.5 text-xs leading-relaxed text-[#2D423D] shadow-xl dark:border-[#244335] dark:bg-[#12241C] dark:text-[#C9D6D0]"
                >
                  <p className="mb-1.5 font-mono text-[11px] font-bold text-[#8C6228] uppercase dark:text-[#D5B47A]">
                    Luật 8 Ball Pool &amp; Điều khiển
                  </p>
                  <ul className="space-y-1">
                    <li>• Kéo trên bàn để xoay góc ngắm (giữ Shift để vi chỉnh 0.25x).</li>
                    <li>• Kéo thanh lực bên trái xuống (hoặc giữ Space) và thả để đánh.</li>
                    <li>
                      • Ăn bi hợp lệ đầu tiên sau khai cuộc để nhận nhóm Trơn (1–7) hoặc Sọc (9–15).
                    </li>
                    <li>• Dọn hết 7 bi nhóm mình rồi đưa Bi 8 Đen vào lỗ để thắng.</li>
                  </ul>
                </div>
              )}
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
