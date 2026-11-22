import {
  ArrowLeft,
  CheckCircle2,
  Gamepad2,
  Hourglass,
  Landmark,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useLayout } from '@/context/LayoutContext';
import {
  POMODORO_BREAK_AUTOSTART_KEY,
  POMODORO_RETURN_PATH_KEY,
  usePomodoro,
  type SanctuaryBreakDuration,
} from '@/context/PomodoroContext';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

const HeritageExhibitionPavilion = lazy(() =>
  import('@/components/home/HeritageExhibitionPavilion').then((mod) => ({
    default: mod.HeritageExhibitionPavilion,
  })),
);

const MineralBilliardsStage = lazy(() =>
  import('@/components/home/MineralBilliardsStage').then((mod) => ({
    default: mod.MineralBilliardsStage,
  })),
);

export type SanctuaryTab = 'di-san' | 'bida';

function resolveSanctuaryTab(raw: string | null): SanctuaryTab {
  return raw === 'bida' ? 'bida' : 'di-san';
}

function formatMmSs(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function readPomodoroReturnPath(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const val = window.sessionStorage.getItem(POMODORO_RETURN_PATH_KEY);
    return val && val.startsWith('/') ? val : null;
  } catch {
    return null;
  }
}

function readBreakAutostartMinutes(): SanctuaryBreakDuration | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(POMODORO_BREAK_AUTOSTART_KEY);
    if (raw === '10') return 10;
    if (raw === '5') return 5;
    return null;
  } catch {
    return null;
  }
}

/**
 * Pill đếm ngược giờ nghỉ giải lao (5p / 10p) đặt cô lập tại TopContextBar của Sảnh Thư giãn
 * để nhịp tick 1Hz không làm re-render bàn Bida hay Bảo tàng Di sản.
 */
function SanctuaryBreakPill({ hasReturnPath }: { readonly hasReturnPath: boolean }) {
  const { breakTimer, startBreakTimer, setBreakDuration, pauseBreakTimer, resumeBreakTimer } =
    usePomodoro();

  // Nếu vừa đi từ hộp thoại kết thúc Pomodoro qua sessionStorage flag, tự chạy Break Countdown 5p
  useEffect(() => {
    const autoMin = readBreakAutostartMinutes();
    if (autoMin && breakTimer.status === 'idle') {
      startBreakTimer(autoMin);
    }
  }, [breakTimer.status, startBreakTimer]);

  const showPill = breakTimer.status !== 'idle' || hasReturnPath;
  if (!showPill) return null;

  const isRunning = breakTimer.status === 'running';
  const isPaused = breakTimer.status === 'paused';
  const isDone = breakTimer.status === 'done';

  const handleTogglePlay = () => {
    if (isRunning) pauseBreakTimer();
    else if (isPaused) resumeBreakTimer();
    else startBreakTimer(breakTimer.durationMinutes);
  };

  return (
    <div
      data-testid="sanctuary-break-pill"
      data-break-status={breakTimer.status}
      className={cn(
        'inline-flex h-7 items-center gap-1 rounded-lg border px-2 text-xs transition-colors',
        isDone
          ? 'border-[#1B5E4A] bg-[#1B5E4A]/12 text-[#1B5E4A] dark:border-[#52B394] dark:bg-[#52B394]/15 dark:text-[#52B394]'
          : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-main)]',
      )}
    >
      <Hourglass
        className={cn(
          'h-3 w-3 shrink-0',
          isDone ? 'text-[#1B5E4A] dark:text-[#52B394]' : 'text-[var(--accent-heritage)]',
        )}
        aria-hidden="true"
      />
      <span
        data-testid="sanctuary-break-countdown"
        className="font-mono text-[11px] font-semibold tabular-nums"
      >
        {isDone ? '00:00' : formatMmSs(breakTimer.remainingSeconds)}
      </span>

      <div
        role="group"
        aria-label="Chọn thời lượng nghỉ giải lao"
        className="ml-0.5 inline-flex items-center rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-0.5"
      >
        {([5, 10] as const).map((min) => {
          const active = breakTimer.durationMinutes === min && breakTimer.status !== 'idle';
          return (
            <button
              key={min}
              type="button"
              data-testid={`sanctuary-break-${min}m`}
              aria-pressed={active}
              onClick={() => setBreakDuration(min)}
              className={cn(
                'cursor-pointer rounded px-1.5 py-0.5 font-mono text-[10px] leading-none font-semibold transition-colors',
                active
                  ? 'bg-[var(--accent-os)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
              )}
            >
              {min}p
            </button>
          );
        })}
      </div>

      <button
        type="button"
        data-testid="sanctuary-break-toggle"
        onClick={handleTogglePlay}
        aria-label={isRunning ? 'Tạm dừng nghỉ giải lao' : 'Bắt đầu nghỉ giải lao'}
        title={isRunning ? 'Tạm dừng' : 'Bắt đầu / Tiếp tục'}
        className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]"
      >
        {isRunning ? (
          <Pause className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Play className="h-3 w-3" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

/**
 * Thông báo thị giác nhẹ (không phát âm thanh chói) khi hết giờ nghỉ giải lao Pomodoro.
 */
function SanctuaryBreakDoneBanner({
  returnLessonPath,
  onClearReturnPath,
}: {
  readonly returnLessonPath: string | null;
  readonly onClearReturnPath: () => void;
}) {
  const { breakTimer, resetBreakTimer, startBreakTimer } = usePomodoro();

  if (breakTimer.status !== 'done') return null;

  const targetHref = returnLessonPath ?? ROUTES.learningSpace;
  const targetLabel = returnLessonPath ? 'Quay về bài đang học' : 'Quay lại Không gian học tập';

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="sanctuary-break-done-banner"
      className="mx-auto w-full max-w-[1280px] px-4 pt-4 sm:px-6 lg:px-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1B5E4A]/35 bg-[#F2F9F6] px-4 py-3 text-sm text-[#143D30] shadow-xs dark:border-[#52B394]/35 dark:bg-[#10221C] dark:text-[#D5EDE4]">
        <div className="flex items-center gap-2.5">
          <CheckCircle2
            className="h-4 w-4 shrink-0 text-[#1B5E4A] dark:text-[#52B394]"
            aria-hidden="true"
          />
          <p className="text-xs font-medium sm:text-[13px]">
            <strong className="font-semibold">
              Hết giờ nghỉ giải lao ({breakTimer.durationMinutes} phút).
            </strong>{' '}
            Tâm trí đã sẵn sàng quay lại nhịp học sâu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={targetHref}
            data-testid="sanctuary-break-done-return-btn"
            onClick={() => {
              resetBreakTimer();
              if (returnLessonPath) onClearReturnPath();
            }}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-[#1B5E4A] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-95 dark:bg-[#52B394] dark:text-[#0D1110]"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{targetLabel}</span>
          </Link>

          <button
            type="button"
            onClick={() => startBreakTimer(5)}
            className="inline-flex h-7 cursor-pointer items-center rounded-lg border border-current/25 px-2.5 text-xs font-medium transition-opacity hover:opacity-80"
          >
            Nghỉ thêm 5p
          </button>

          <button
            type="button"
            onClick={resetBreakTimer}
            aria-label="Đóng thông báo hết giờ nghỉ"
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function SanctuarySkeleton({ label }: { readonly label: string }) {
  return (
    <div
      data-testid="sanctuary-loading-skeleton"
      className="mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-10"
    >
      <div className="flex min-h-[580px] items-center justify-center rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
        <span className="font-mono text-xs tracking-wider text-[var(--text-muted)] uppercase">
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Sảnh Thư giãn chuyên biệt (`/thu-gian`) — Academic OS:
 * - `?tab=di-san` (mặc định): Bảo tàng 40 Di sản Học thuật & Nghệ thuật (React.lazy).
 * - `?tab=bida`: Bàn Bida 8-Ball WPA 2.5D (React.lazy), tự động thu gọn LeftRail trên desktop để tối ưu bề ngang.
 * - Nối trực tiếp với Pomodoro: hiển thị nút `← Quay lại bài đang học` khi có `lu_pomodoro_return_path`.
 */
export function SanctuaryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = resolveSanctuaryTab(searchParams.get('tab'));
  const { setTopBarRightSlot, setRailCollapsed } = useLayout();
  const [returnLessonPath, setReturnLessonPath] = useState<string | null>(() =>
    readPomodoroReturnPath(),
  );

  const handleSelectTab = useCallback(
    (nextTab: SanctuaryTab) => {
      setSearchParams({ tab: nextTab }, { replace: true });
    },
    [setSearchParams],
  );

  // Tự động thu gọn LeftRail một lần mỗi khi chuyển sang tab Bida trên desktop
  const prevTabRef = useRef<SanctuaryTab | null>(null);
  useEffect(() => {
    const enteredBida = activeTab === 'bida' && prevTabRef.current !== 'bida';
    prevTabRef.current = activeTab;
    if (enteredBida && typeof window !== 'undefined' && window.innerWidth >= 768) {
      setRailCollapsed(true);
    }
  }, [activeTab, setRailCollapsed]);

  const handleClearReturnPath = useCallback(() => {
    try {
      window.sessionStorage.removeItem(POMODORO_RETURN_PATH_KEY);
    } catch {
      // Bỏ qua lỗi sessionStorage
    }
    setReturnLessonPath(null);
  }, []);

  const topBarControls = useMemo(
    () => (
      <div className="flex items-center gap-2">
        {returnLessonPath && (
          <Link
            to={returnLessonPath}
            onClick={handleClearReturnPath}
            data-testid="sanctuary-return-lesson-btn"
            className="inline-flex h-7 items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-xs font-semibold text-[var(--accent-os)] transition-colors hover:border-[var(--accent-os)]"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Quay lại bài đang học</span>
          </Link>
        )}

        <SanctuaryBreakPill hasReturnPath={Boolean(returnLessonPath)} />

        <div
          role="tablist"
          aria-label="Chuyển đổi không gian Sảnh Thư giãn"
          data-testid="sanctuary-tab-switcher"
          className="inline-flex items-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-shell)] p-0.5"
        >
          <button
            type="button"
            role="tab"
            data-testid="sanctuary-tab-di-san"
            aria-selected={activeTab === 'di-san'}
            onClick={() => handleSelectTab('di-san')}
            className={cn(
              'inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors',
              activeTab === 'di-san'
                ? 'bg-[var(--accent-os)] text-white shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            <Landmark className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Bảo tàng 40 Di sản</span>
          </button>

          <button
            type="button"
            role="tab"
            data-testid="sanctuary-tab-bida"
            aria-selected={activeTab === 'bida'}
            onClick={() => handleSelectTab('bida')}
            className={cn(
              'inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors',
              activeTab === 'bida'
                ? 'bg-[var(--accent-os)] text-white shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            <Gamepad2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Bida 8-Ball WPA</span>
          </button>
        </div>
      </div>
    ),
    [activeTab, handleClearReturnPath, handleSelectTab, returnLessonPath],
  );

  useEffect(() => {
    setTopBarRightSlot(topBarControls);
    return () => {
      setTopBarRightSlot(null);
    };
  }, [setTopBarRightSlot, topBarControls]);

  return (
    <div
      data-testid="sanctuary-page"
      data-active-tab={activeTab}
      className="min-h-[calc(100vh-3rem)] bg-[var(--bg-workspace)] text-[var(--text-main)]"
    >
      <SanctuaryBreakDoneBanner
        returnLessonPath={returnLessonPath}
        onClearReturnPath={handleClearReturnPath}
      />
      {activeTab === 'di-san' ? (
        <Suspense fallback={<SanctuarySkeleton label="Đang mở Phòng trưng bày 40 Di sản…" />}>
          <HeritageExhibitionPavilion />
        </Suspense>
      ) : (
        <Suspense fallback={<SanctuarySkeleton label="Đang chuẩn bị bàn Bida 8-Ball WPA 2.5D…" />}>
          <MineralBilliardsStage />
        </Suspense>
      )}
    </div>
  );
}

export default SanctuaryPage;
