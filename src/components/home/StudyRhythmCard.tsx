import { Flame, SlidersHorizontal, Target, X } from 'lucide-react';
import { type FC, type FormEvent, useState } from 'react';
import {
  selectActiveWorkspaceBucket,
  useWorkspaceStore,
  type StudyActivityMetrics,
} from '@/features/workspace';
import { cn } from '@/shared/lib/cn';

export interface StudyRhythmCardProps {
  readonly metrics: StudyActivityMetrics;
  readonly layout?: 'vertical' | 'horizontal';
}

const HEATMAP_LEVEL_CLASSES: Readonly<Record<0 | 1 | 2 | 3, string>> = {
  0: 'bg-[#E9EFEC] dark:bg-[#1A2421]',
  1: 'bg-[#A7DEC8] dark:bg-[#193B30]',
  2: 'bg-[#3AA981] dark:bg-[#2A6F59]',
  3: 'bg-[#0F7656] dark:bg-[#4AD1A3]',
};

export const StudyRhythmCard: FC<StudyRhythmCardProps> = ({ metrics, layout = 'vertical' }) => {
  const bucket = useWorkspaceStore(selectActiveWorkspaceBucket);
  const updateWeeklyGoal = useWorkspaceStore((state) => state.updateWeeklyGoal);

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [lessonTargetInput, setLessonTargetInput] = useState(
    String(bucket.weeklyGoal.targetLessons),
  );
  const [pomodoroTargetInput, setPomodoroTargetInput] = useState(
    String(bucket.weeklyGoal.targetPomodoros),
  );

  const lessonPct = Math.min(
    100,
    Math.round((metrics.weekLessonsCount / Math.max(1, bucket.weeklyGoal.targetLessons)) * 100),
  );
  const pomodoroPct = Math.min(
    100,
    Math.round((metrics.weekPomodorosCount / Math.max(1, bucket.weeklyGoal.targetPomodoros)) * 100),
  );

  const handleOpenEdit = () => {
    setLessonTargetInput(String(bucket.weeklyGoal.targetLessons));
    setPomodoroTargetInput(String(bucket.weeklyGoal.targetPomodoros));
    setIsEditingGoal(true);
  };

  const handleSaveGoal = (event: FormEvent) => {
    event.preventDefault();
    updateWeeklyGoal({
      targetLessons: Number.parseInt(lessonTargetInput, 10),
      targetPomodoros: Number.parseInt(pomodoroTargetInput, 10),
    });
    setIsEditingGoal(false);
  };

  const isHorizontal = layout === 'horizontal';

  return (
    <section
      aria-label="Chuỗi ngày học, bản đồ nhiệt chuyên cần và mục tiêu tuần"
      data-testid="study-rhythm-card"
      className={cn(
        'relative min-w-0 overflow-hidden rounded-[26px] border border-black/[0.05] bg-white p-5 shadow-[0_14px_38px_-22px_rgba(16,45,35,0.14)] sm:p-6 dark:border-white/[0.07] dark:bg-[#141D1A]',
        isHorizontal
          ? 'grid grid-cols-1 items-center gap-5 lg:grid-cols-12'
          : 'flex flex-col justify-between gap-4',
      )}
    >
      {/* Vầng sáng ấm & sóng trang trí nền sau khối Chuỗi chuyên cần */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-10 -left-10 h-44 w-44 rounded-full bg-[radial-gradient(circle,rgba(194,120,36,0.18)_0%,transparent_72%)] dark:bg-[radial-gradient(circle,rgba(229,169,92,0.15)_0%,transparent_72%)]"
      />
      <svg
        viewBox="0 0 180 120"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-4 -left-4 h-28 w-44 opacity-[0.14] dark:opacity-[0.2]"
      >
        <circle cx="48" cy="76" r="44" stroke="#C27824" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="48" cy="76" r="28" stroke="#0F7656" strokeWidth="0.9" />
      </svg>

      {/* 1. CHUỖI NGÀY HỌC (STREAK) */}
      <div className={cn('relative z-10 space-y-3', isHorizontal && 'lg:col-span-3')}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#FDF4E7] text-[#C27824] dark:bg-[#261D12] dark:text-[#E5A95C]">
              <Flame className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                Chuỗi chuyên cần
              </p>
              <p
                data-testid="study-streak-value"
                className="font-serif text-2xl leading-tight font-semibold text-[var(--text-main)] tabular-nums"
              >
                {metrics.currentStreak}{' '}
                <span className="font-sans text-xs font-normal text-[var(--text-secondary)]">
                  ngày liên tiếp
                </span>
              </p>
            </div>
          </div>

          <span className="rounded-full bg-[#F2F6F4] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums dark:bg-[#0F1715]">
            Kỷ lục: {metrics.bestStreak}d
          </span>
        </div>

        {!isHorizontal && (
          <div className="space-y-1.5 rounded-[18px] bg-[#F6F8F7] p-3 dark:bg-[#0F1715]">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                Nhiệt đồ 28 ngày
              </span>
              <span className="font-mono text-[10px] text-[var(--text-secondary)] tabular-nums">
                {metrics.activeDaysLast28}/28 ngày có học
              </span>
            </div>

            <div
              data-testid="study-activity-heatmap"
              className="grid grid-cols-7 gap-1 sm:grid-cols-14"
              aria-label="Lưới 28 ngày hoạt động học tập gần nhất"
            >
              {metrics.heatmapDays.map((cell) => (
                <span
                  key={cell.dateKey}
                  data-level={cell.level}
                  title={`${cell.shortLabel}: ${cell.count} hoạt động`}
                  className={cn(
                    'aspect-square w-full rounded-[5px] transition-transform duration-150 hover:scale-110',
                    HEATMAP_LEVEL_CLASSES[cell.level],
                  )}
                />
              ))}
            </div>

            <div className="flex items-center justify-end gap-1 pt-0.5 font-mono text-[9.5px] text-[var(--text-muted)]">
              <span>Ít</span>
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#E9EFEC] dark:bg-[#1A2421]" />
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#A7DEC8] dark:bg-[#193B30]" />
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#3AA981] dark:bg-[#2A6F59]" />
              <span className="h-2.5 w-2.5 rounded-[3px] bg-[#0F7656] dark:bg-[#4AD1A3]" />
              <span>Nhiều</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. BẢN ĐỒ NHIỆT 28 NGÀY (Khi ở chế độ nằm ngang toàn màn hình lịch) */}
      {isHorizontal && (
        <div className="space-y-2 rounded-[20px] bg-[#F6F8F7] p-3.5 lg:col-span-5 dark:bg-[#0F1715]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Nhiệt đồ chuyên cần 28 ngày
            </span>
            <span className="font-mono text-[10.5px] font-semibold text-[#0F7656] tabular-nums dark:text-[#4AD1A3]">
              {metrics.activeDaysLast28}/28 ngày có học
            </span>
          </div>

          <div
            data-testid="study-activity-heatmap"
            className="grid grid-cols-14 gap-1.5"
            aria-label="Lưới 28 ngày hoạt động học tập gần nhất"
          >
            {metrics.heatmapDays.map((cell) => (
              <span
                key={cell.dateKey}
                data-level={cell.level}
                title={`${cell.shortLabel}: ${cell.count} hoạt động`}
                className={cn(
                  'aspect-square w-full rounded-[6px] transition-transform duration-150 hover:scale-110',
                  HEATMAP_LEVEL_CLASSES[cell.level],
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-end gap-1 font-mono text-[9.5px] text-[var(--text-muted)]">
            <span>Ít</span>
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#E9EFEC] dark:bg-[#1A2421]" />
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#A7DEC8] dark:bg-[#193B30]" />
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#3AA981] dark:bg-[#2A6F59]" />
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#0F7656] dark:bg-[#4AD1A3]" />
            <span>Nhiều</span>
          </div>
        </div>
      )}

      {/* 3. MỤC TIÊU HỌC TẬP THEO TUẦN */}
      <div
        data-testid="weekly-study-goal-card"
        className={cn(
          'space-y-3',
          isHorizontal
            ? 'lg:col-span-4 lg:border-l lg:border-[var(--border-hairline)] lg:pl-5'
            : 'border-t border-[var(--border-hairline)] pt-3.5',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            <Target className="h-3.5 w-3.5 text-[var(--accent-os)]" aria-hidden="true" />
            <span>Mục tiêu tuần này</span>
          </span>

          <button
            type="button"
            data-testid="weekly-goal-edit-toggle"
            onClick={() => (isEditingGoal ? setIsEditingGoal(false) : handleOpenEdit())}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)]"
          >
            {isEditingGoal ? (
              <>
                <X className="h-3 w-3" aria-hidden="true" />
                <span>Hủy</span>
              </>
            ) : (
              <>
                <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
                <span>Tùy chỉnh</span>
              </>
            )}
          </button>
        </div>

        {isEditingGoal ? (
          <form
            onSubmit={handleSaveGoal}
            data-testid="weekly-goal-form"
            className="space-y-2.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="block font-mono text-[10px] text-[var(--text-muted)]">
                  Số bài / tuần
                </span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={lessonTargetInput}
                  onChange={(e) => setLessonTargetInput(e.target.value)}
                  aria-label="Mục tiêu số bài mỗi tuần"
                  className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1 font-mono text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                />
              </label>

              <label className="space-y-1">
                <span className="block font-mono text-[10px] text-[var(--text-muted)]">
                  Pomodoro / tuần
                </span>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={pomodoroTargetInput}
                  onChange={(e) => setPomodoroTargetInput(e.target.value)}
                  aria-label="Mục tiêu số phiên Pomodoro mỗi tuần"
                  className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1 font-mono text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-lg bg-[var(--accent-os)] py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95"
            >
              Lưu mục tiêu tuần
            </button>
          </form>
        ) : (
          <div className="space-y-2.5">
            {/* Thanh 1: Bài giảng hoàn thành */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Bài giảng hoàn thành</span>
                <span
                  data-testid="weekly-goal-lessons-ratio"
                  className="font-mono text-[11px] font-semibold text-[var(--text-main)] tabular-nums"
                >
                  {metrics.weekLessonsCount}/{bucket.weeklyGoal.targetLessons}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-os)] transition-[width] duration-300"
                  style={{ width: `${Math.max(lessonPct, metrics.weekLessonsCount > 0 ? 8 : 0)}%` }}
                />
              </div>
            </div>

            {/* Thanh 2: Phiên Pomodoro */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--text-secondary)]">Phiên tập trung Pomodoro</span>
                <span
                  data-testid="weekly-goal-pomodoro-ratio"
                  className="font-mono text-[11px] font-semibold text-[var(--text-main)] tabular-nums"
                >
                  {metrics.weekPomodorosCount}/{bucket.weeklyGoal.targetPomodoros}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-hairline)]">
                <div
                  className="h-full rounded-full bg-[var(--accent-heritage)] transition-[width] duration-300"
                  style={{
                    width: `${Math.max(pomodoroPct, metrics.weekPomodorosCount > 0 ? 8 : 0)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudyRhythmCard;
