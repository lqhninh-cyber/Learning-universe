import { Hourglass, Pause, Play, RotateCcw } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import { useIsland } from '@/context/IslandContext';
import { cn } from '@/shared/lib/cn';

export interface HeaderPomodoroTimerProps {
  readonly isDark?: boolean;
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

export const HeaderPomodoroTimer: FC<HeaderPomodoroTimerProps> = ({ isDark = false }) => {
  const {
    pomodoro,
    startPomodoro,
    addPomodoroMinutes,
    pausePomodoro,
    resumePomodoro,
    resetPomodoro,
  } = useIsland();
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

  return (
    <div ref={rootRef} className="relative hidden md:block">
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
        title="Nhịp học tập"
        className={cn(
          'inline-flex h-9 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none active:scale-[0.98]',
          isActive
            ? isDark
              ? 'gap-1.5 border-[#9EC5B8]/40 bg-[#9EC5B8]/15 px-3 text-[#EBF0EE]'
              : 'gap-1.5 border-[#1E332E]/25 bg-[#1E332E]/10 px-3 text-[#1E332E]'
            : isDark
              ? 'w-9 border-[#9E845A]/30 bg-[#182E24] text-[#EBF0EE] hover:border-[#9EC5B8]/50 hover:bg-[#1E3B2E]'
              : 'w-9 border-[#D8E0DD] bg-[#EDF1EF]/80 text-[#182624] hover:bg-[#E2E8E5]',
        )}
      >
        {isActive ? (
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
            'absolute top-full right-0 z-50 mt-3 w-72 rounded-2xl border p-3.5 shadow-[0_16px_40px_rgba(24,38,36,0.12)] backdrop-blur-xl',
            isDark
              ? 'border-[#4E9B58]/30 bg-[#11221A]/96 text-[#F7F4EB]'
              : 'border-[#D8E0DD] bg-[#FAFBF9]/95 text-[#182624] dark:border-[#1E3B2D] dark:bg-[#12241C]/96 dark:text-[#E6ECE7]',
          )}
        >
          <div className="mb-2.5 flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
            <div>
              <p className="text-xs font-bold">Nhịp học tập</p>
              <p className="text-[11px] text-[#4A5D58] dark:text-[#A7B5AC]">
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
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors',
                  isDark
                    ? 'bg-[#182E24]/80 text-[#EBF0EE] hover:bg-[#1E3B2E]'
                    : 'bg-[#EDF1EF]/70 text-[#182624] hover:bg-[#E2E8E5]',
                )}
              >
                <span className="font-semibold">{preset.minutes} phút</span>
                <span className="text-[11px] text-[#4A5D58] dark:text-[#A7B5AC]">
                  {preset.label}
                </span>
              </button>
            ))}
          </div>

          {/* Phân khu Tùy chỉnh thời gian (Custom Duration Stepper & Input) */}
          <div
            onClick={(event) => event.stopPropagation()}
            className={cn(
              'mt-2 border-t pt-3',
              isDark ? 'border-[#4E9B58]/25' : 'border-[#D8E0DD]',
            )}
          >
            <p className="mb-2 text-[11px] font-semibold tracking-wide text-[#4A5D58] uppercase dark:text-[#A7B5AC]">
              Tùy chỉnh thời gian
            </p>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="pomodoro-custom-minutes-input"
                className={cn(
                  'text-[12px] font-medium',
                  isDark ? 'text-[#A7B5AC]' : 'text-[#4A5D58]',
                )}
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
                  className={cn(
                    'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs font-bold transition-colors',
                    isDark
                      ? 'border-[#4E9B58]/30 bg-[#182E24] text-[#EBF0EE] hover:bg-[#1E3B2E]'
                      : 'border-[#CBD6D2] bg-[#EDF1EF] text-[#182624] hover:bg-[#E2E8E5]',
                  )}
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
                  className={cn(
                    'h-8 w-14 rounded-lg border text-center text-[13px] font-bold tabular-nums focus:outline-none',
                    isDark
                      ? 'border-[#4E9B58]/35 bg-[#182E24] text-[#F7F4EB] focus:border-[#6EE7B7]'
                      : 'border-[#CBD6D2] bg-[#EDF1EF] text-[#182624] focus:border-[#1E332E]',
                  )}
                />

                <button
                  type="button"
                  aria-label="Tăng 5 phút"
                  onClick={(event) => {
                    event.stopPropagation();
                    updateCustomMinutes(customMinutes + 5);
                  }}
                  className={cn(
                    'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border text-xs font-bold transition-colors',
                    isDark
                      ? 'border-[#4E9B58]/30 bg-[#182E24] text-[#EBF0EE] hover:bg-[#1E3B2E]'
                      : 'border-[#CBD6D2] bg-[#EDF1EF] text-[#182624] hover:bg-[#E2E8E5]',
                  )}
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
              className="mt-2.5 w-full cursor-pointer rounded-xl bg-[#1E332E] py-2 text-[13px] font-semibold text-[#FAFBF9] transition-colors hover:bg-[#26403A]"
            >
              Bắt đầu hẹn giờ
            </button>
          </div>

          {isActive && (
            <div
              data-testid="pomodoro-active-controls"
              className={cn(
                'mt-2.5 space-y-2 border-t pt-2.5',
                isDark ? 'border-[#4E9B58]/25' : 'border-[#D8E0DD]',
              )}
            >
              <div className="flex items-center justify-between text-[11px] font-medium text-[#4A5D58] dark:text-[#A7B5AC]">
                <span>Phiên: {pomodoro.presetLabel}</span>
                <span className="font-mono font-semibold tabular-nums">
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
                  className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-xl bg-[#1E332E] px-2.5 py-1.5 text-xs font-semibold text-[#FAFBF9] transition-colors hover:bg-[#26403A]"
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
                  className={cn(
                    'inline-flex cursor-pointer items-center justify-center rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                    isDark
                      ? 'border-[#4E9B58]/30 bg-[#182E24] text-[#EBF0EE] hover:bg-[#1E3B2E]'
                      : 'border-[#D8E0DD] bg-[#EDF1EF]/80 text-[#182624] hover:bg-[#E2E8E5]',
                  )}
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
                  className={cn(
                    'inline-flex cursor-pointer items-center justify-center gap-1 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors',
                    isDark
                      ? 'border-[#4E9B58]/30 text-[#EBF0EE] hover:bg-white/10'
                      : 'border-[#D8E0DD] text-[#4A5D58] hover:bg-[#EDF1EF] hover:text-[#182624]',
                  )}
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
