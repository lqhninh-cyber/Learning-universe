import { Hourglass, Pause, Play, RotateCcw } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import { usePomodoro } from '@/context/PomodoroContext';
import { cn } from '@/shared/lib/cn';

export interface HeaderPomodoroTimerProps {
  readonly isDark?: boolean;
  readonly placement?: 'header' | 'rail';
  readonly collapsed?: boolean;
}

const CUSTOM_MINUTES_STORAGE_KEY = 'lu_pomodoro_custom_minutes';
const DEFAULT_CUSTOM_MINUTES = 30;
const MIN_CUSTOM_MINUTES = 1;
const MAX_CUSTOM_MINUTES = 180;

const POMODORO_PRESETS: readonly { readonly minutes: number; readonly label: string }[] = [
  { minutes: 25, label: 'Tiêu chuẩn' },
  { minutes: 45, label: '1 tiết' },
  { minutes: 5, label: 'Nghỉ ngơi' },
];

function clampCustomMinutes(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_CUSTOM_MINUTES;
  return Math.max(MIN_CUSTOM_MINUTES, Math.min(MAX_CUSTOM_MINUTES, Math.round(value)));
}

function readStoredCustomMinutes(): number {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM_MINUTES;
  try {
    const raw = localStorage.getItem(CUSTOM_MINUTES_STORAGE_KEY);
    if (raw === null) return DEFAULT_CUSTOM_MINUTES;
    return clampCustomMinutes(Number.parseInt(raw, 10));
  } catch {
    return DEFAULT_CUSTOM_MINUTES;
  }
}

function formatMmSs(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const HeaderPomodoroTimer: FC<HeaderPomodoroTimerProps> = ({
  isDark = false,
  placement = 'header',
  collapsed = false,
}) => {
  const {
    pomodoro,
    startPomodoro,
    addPomodoroMinutes,
    pausePomodoro,
    resumePomodoro,
    resetPomodoro,
  } = usePomodoro();
  const [isOpen, setIsOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<number>(() => readStoredCustomMinutes());
  const rootRef = useRef<HTMLDivElement>(null);

  const updateCustomMinutes = (nextValue: number) => {
    const clamped = clampCustomMinutes(nextValue);
    setCustomMinutes(clamped);
    try {
      localStorage.setItem(CUSTOM_MINUTES_STORAGE_KEY, String(clamped));
    } catch {
      // Bỏ qua lỗi lưu trữ cục bộ
    }
  };

  const handleStartCustomTimer = () => {
    const clamped = clampCustomMinutes(customMinutes);
    updateCustomMinutes(clamped);
    startPomodoro(clamped, 'Tùy chỉnh');
    setIsOpen(false);
  };

  const isActive = pomodoro.status !== 'idle';
  const isRunning = pomodoro.status === 'running';
  const progressRatio =
    pomodoro.totalSeconds > 0
      ? Math.min(1, Math.max(0, 1 - pomodoro.remainingSeconds / pomodoro.totalSeconds))
      : 0;
  const ringRadius = 7;
  const circumference = 2 * Math.PI * ringRadius;
  const dashOffset = circumference * (1 - progressRatio);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const isRail = placement === 'rail';

  return (
    <div ref={rootRef} className={cn('relative', isRail ? 'w-full' : 'hidden md:block')}>
      <button
        type="button"
        data-testid="pomodoro-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={
          isActive
            ? `Bộ đếm Nhịp học tập đang còn ${formatMmSs(pomodoro.remainingSeconds)}`
            : 'Mở bộ đếm Nhịp học tập'
        }
        title={
          isActive
            ? `Nhịp học tập · Còn ${formatMmSs(pomodoro.remainingSeconds)}`
            : 'Nhịp học tập (Pomodoro)'
        }
        className={cn(
          'cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent-heritage)] focus-visible:outline-none active:scale-[0.98]',
          isRail
            ? collapsed
              ? cn(
                  'relative mx-auto flex h-9 w-9 items-center justify-center rounded-lg border',
                  isActive
                    ? 'border-[var(--accent-heritage)]/50 bg-[var(--bg-workspace)] text-[var(--accent-heritage)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-hairline)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]',
                )
              : cn(
                  'flex h-9 w-full items-center justify-between gap-2 rounded-lg border px-2.5 text-[13px] font-medium',
                  isActive
                    ? 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-hairline)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]',
                )
            : cn(
                'inline-flex h-9 items-center justify-center rounded-full border',
                isActive
                  ? isDark
                    ? 'gap-1.5 border-[#9EC5B8]/40 bg-[#9EC5B8]/15 px-3 text-[#EBF0EE]'
                    : 'gap-1.5 border-[#1E332E]/25 bg-[#1E332E]/10 px-3 text-[#1E332E]'
                  : isDark
                    ? 'w-9 border-[#9E845A]/30 bg-[#182E24] text-[#EBF0EE] hover:border-[#9EC5B8]/50 hover:bg-[#1E3B2E]'
                    : 'w-9 border-[#D8E0DD] bg-[#EDF1EF]/80 text-[#182624] hover:bg-[#E2E8E5]',
              ),
        )}
      >
        {isRail ? (
          collapsed ? (
            <>
              <Hourglass className="h-4 w-4 shrink-0" aria-hidden="true" />
              {isActive && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--accent-heritage)]',
                    isRunning && 'animate-pulse',
                  )}
                />
              )}
            </>
          ) : (
            <>
              <span className="flex min-w-0 items-center gap-2.5">
                <Hourglass
                  className={cn(
                    'h-4 w-4 shrink-0',
                    isActive ? 'text-[var(--accent-heritage)]' : 'text-[var(--text-muted)]',
                  )}
                  aria-hidden="true"
                />
                <span className="truncate">Nhịp học tập</span>
              </span>
              {isActive && (
                <span className="inline-flex shrink-0 items-center gap-1.5">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full bg-[var(--accent-heritage)]',
                      isRunning && 'animate-pulse',
                    )}
                    aria-hidden="true"
                  />
                  <span
                    data-testid="pomodoro-countdown"
                    className="font-mono text-xs font-semibold text-[var(--accent-heritage)] tabular-nums"
                  >
                    {formatMmSs(pomodoro.remainingSeconds)}
                  </span>
                </span>
              )}
            </>
          )
        ) : isActive ? (
          <>
            <svg className="h-4 w-4 shrink-0 -rotate-90" viewBox="0 0 18 18" aria-hidden="true">
              <circle
                cx="9"
                cy="9"
                r={ringRadius}
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeWidth="2"
              />
              <circle
                cx="9"
                cy="9"
                r={ringRadius}
                fill="none"
                stroke={isDark ? '#6EE7B7' : '#1E332E'}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-[stroke-dashoffset] duration-300"
              />
            </svg>
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full',
                isRunning ? 'animate-pulse bg-emerald-600 dark:bg-emerald-400' : 'bg-[#9C7A4C]',
              )}
              aria-hidden="true"
            />
            <span
              data-testid="pomodoro-countdown"
              className="font-mono text-xs font-semibold tabular-nums"
            >
              {formatMmSs(pomodoro.remainingSeconds)}
            </span>
          </>
        ) : (
          <Hourglass className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          data-testid="pomodoro-popover"
          role="dialog"
          aria-label="Chọn nhịp học tập"
          onClick={(event) => event.stopPropagation()}
          className={cn(
            'absolute z-50 w-72 rounded-2xl border p-3.5 shadow-[0_16px_40px_rgba(17,26,24,0.16)] backdrop-blur-xl',
            isRail ? 'bottom-0 left-full ml-3' : 'top-full right-0 mt-3',
            isRail
              ? 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)]'
              : isDark
                ? 'border-[#4E9B58]/30 bg-[#11221A]/96 text-[#F7F4EB]'
                : 'border-[#D8E0DD] bg-[#FAFBF9]/95 text-[#182624] dark:border-[#1E3B2D] dark:bg-[#12241C]/96 dark:text-[#E6ECE7]',
          )}
        >
          <div className="mb-2.5 flex items-center justify-between border-b border-[var(--border-hairline)] pb-2">
            <div>
              <p className="text-xs font-bold text-[var(--text-main)]">Nhịp học tập</p>
              <p className="text-[11px] text-[var(--text-muted)]">
                {isActive
                  ? `${pomodoro.presetLabel} · Còn ${formatMmSs(pomodoro.remainingSeconds)}`
                  : 'Chọn chu kỳ tập trung tối giản'}
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            {POMODORO_PRESETS.map((preset) => (
              <button
                key={preset.minutes}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  startPomodoro(preset.minutes, preset.label);
                  setIsOpen(false);
                }}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 text-left text-xs text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)]/40 hover:bg-[var(--bg-shell)]"
              >
                <span className="font-semibold">{preset.minutes} phút</span>
                <span className="text-[11px] text-[var(--text-muted)]">{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Phân khu Tùy chỉnh thời gian (Custom Duration Stepper & Input) */}
          <div
            onClick={(event) => event.stopPropagation()}
            className="mt-2.5 border-t border-[var(--border-hairline)] pt-3"
          >
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-[var(--text-muted)] uppercase">
              Tùy chỉnh thời gian
            </p>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="pomodoro-custom-minutes-input"
                className="text-[12px] font-medium text-[var(--text-secondary)]"
              >
                Tự chọn (phút)
              </label>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Giảm 5 phút"
                  onClick={(event) => {
                    event.stopPropagation();
                    updateCustomMinutes(customMinutes - 5);
                  }}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs font-bold text-[var(--text-main)] transition-colors hover:bg-[var(--bg-shell)]"
                >
                  -5
                </button>

                <input
                  id="pomodoro-custom-minutes-input"
                  data-testid="pomodoro-custom-input"
                  type="number"
                  min={MIN_CUSTOM_MINUTES}
                  max={MAX_CUSTOM_MINUTES}
                  value={customMinutes}
                  onClick={(event) => event.stopPropagation()}
                  onChange={(event) => {
                    const parsed = Number.parseInt(event.target.value, 10);
                    if (Number.isFinite(parsed)) {
                      updateCustomMinutes(parsed);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      event.stopPropagation();
                      handleStartCustomTimer();
                    }
                  }}
                  aria-label="Số phút tự chọn"
                  className="h-8 w-14 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-center text-[13px] font-bold text-[var(--text-main)] tabular-nums focus:border-[var(--accent-os)] focus:outline-none"
                />

                <button
                  type="button"
                  aria-label="Tăng 5 phút"
                  onClick={(event) => {
                    event.stopPropagation();
                    updateCustomMinutes(customMinutes + 5);
                  }}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-xs font-bold text-[var(--text-main)] transition-colors hover:bg-[var(--bg-shell)]"
                >
                  +5
                </button>
              </div>
            </div>

            <button
              type="button"
              data-testid="pomodoro-custom-start"
              onClick={(event) => {
                event.stopPropagation();
                handleStartCustomTimer();
              }}
              className="mt-2.5 w-full cursor-pointer rounded-xl bg-[var(--accent-os)] py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-95"
            >
              Bắt đầu hẹn giờ
            </button>
          </div>

          {isActive && (
            <div
              data-testid="pomodoro-active-controls"
              className="mt-2.5 space-y-2 border-t border-[var(--border-hairline)] pt-2.5"
            >
              <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-secondary)]">
                <span>Phiên: {pomodoro.presetLabel}</span>
                <span className="font-mono font-semibold text-[var(--text-main)] tabular-nums">
                  {formatMmSs(pomodoro.remainingSeconds)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (isRunning) pausePomodoro();
                    else resumePomodoro();
                  }}
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl bg-[var(--accent-os)] px-2.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95"
                >
                  {isRunning ? (
                    <>
                      <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tạm dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Tiếp tục</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    addPomodoroMinutes(5);
                  }}
                  className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:bg-[var(--bg-shell)]"
                >
                  +5 phút
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    resetPomodoro();
                    setIsOpen(false);
                  }}
                  className="inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl border border-[var(--border-hairline)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Đặt lại</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
