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
}

const HEATMAP_LEVEL_CLASSES: Readonly<Record<0 | 1 | 2 | 3, string>> = {
  0: 'bg-[var(--bg-shell)] border border-[var(--border-hairline)]',
  1: 'bg-[#C4E1D5] dark:bg-[#193B30]',
  2: 'bg-[#5BA88E] dark:bg-[#2A6F59]',
  3: 'bg-[#17332C] dark:bg-[#52B394]',
};

export const StudyRhythmCard: FC<StudyRhythmCardProps> = ({ metrics }) => {
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

  return (
    <section
      aria-label="Chuỗi ngày học, bản đồ nhiệt chuyên cần và mục tiêu tuần"
      data-testid="study-rhythm-card"
      className="flex min-w-0 flex-col justify-between gap-4 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-5 shadow-[0_10px_28px_-18px_rgba(17,26,24,0.14)] dark:bg-[#161E1C]"
    >
      {/* 1. CHUỖI NGÀY HỌC (STREAK) */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--accent-heritage)]">
              <Flame className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                Chuỗi chuyên cần
              </p>
              <p
                data-testid="study-streak-value"
                className="font-serif text-xl leading-tight font-semibold text-[var(--text-main)] tabular-nums"
              >
                {metrics.currentStreak}{' '}
                <span className="font-sans text-xs font-normal text-[var(--text-secondary)]">
                  ngày liên tiếp
                </span>
              </p>
            </div>
          </div>

          <span className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums">
            Kỷ lục: {metrics.bestStreak}d
          </span>
        </div>

        {/* 2. BẢN ĐỒ NHIỆT CHUYÊN CẦN MINI 28 NGÀY (4 TUẦN × 7 NGÀY) */}
        <div className="space-y-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/75 p-3">
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
                  'aspect-square w-full rounded-[4px] transition-transform duration-150 hover:scale-110',
                  HEATMAP_LEVEL_CLASSES[cell.level],
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-end gap-1 pt-0.5 font-mono text-[9.5px] text-[var(--text-muted)]">
            <span>Ít</span>
            <span className="h-2.5 w-2.5 rounded-[3px] border border-[var(--border-hairline)] bg-[var(--bg-shell)]" />
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#C4E1D5] dark:bg-[#193B30]" />
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#5BA88E] dark:bg-[#2A6F59]" />
            <span className="h-2.5 w-2.5 rounded-[3px] bg-[#17332C] dark:bg-[#52B394]" />
            <span>Nhiều</span>
          </div>
        </div>
      </div>

      {/* 3. MỤC TIÊU HỌC TẬP THEO TUẦN */}
      <div
        data-testid="weekly-study-goal-card"
        className="space-y-3 border-t border-[var(--border-hairline)] pt-3.5"
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
