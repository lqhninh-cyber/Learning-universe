import type { ManifestChapter } from '@schemas/index';
import { ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { SubjectUniverseStage, SubjectUniverseTheme } from './subjectUniverseThemes';

export interface SubjectProgressPillProps {
  readonly theme: SubjectUniverseTheme;
  readonly isAuthenticated: boolean;
  readonly completedCount: number;
  readonly lessonCount: number;
  readonly progressPercent: number;
  readonly onEnableLearnerMode: () => void;
}

export interface SubjectPathwayDockProps {
  readonly theme: SubjectUniverseTheme;
  readonly chapters: readonly ManifestChapter[];
  readonly completedLessons: Readonly<Record<string, unknown>>;
  readonly onJumpToChapters?: (chapterNumbers: readonly number[]) => void;
}

const STAGE_GRID_CLASSES: Readonly<Record<number, string>> = {
  3: 'grid grid-cols-1 gap-3 sm:grid-cols-3',
  4: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5',
};

function formatStageCaption(
  stage: SubjectUniverseStage,
  chapters: readonly ManifestChapter[],
): string {
  const matched = chapters.filter((chapter) => stage.chapterNumbers.includes(chapter.number));
  if (matched.length === 0) return 'Đang cập nhật';
  if (matched.every((chapter) => /^Khối/i.test(chapter.title))) return 'Khối thực hành';

  const numbers = matched.map((chapter) => chapter.number).sort((a, b) => a - b);
  const first = numbers[0] ?? 0;
  const last = numbers[numbers.length - 1] ?? first;
  const isContiguous = numbers.every((value, index) => value === first + index);
  if (numbers.length === 1) return `Chương ${first}`;
  if (isContiguous) return `Chương ${first}–${last}`;
  return `Chương ${numbers.join(' · ')}`;
}

/**
 * Hộp Tiến độ Thu gọn (Compact Progress Pill) đặt cạnh cụm CTA ở cột trái Hero,
 * không che khuất sân khấu đồ họa 3D/2D bên phải.
 */
export function SubjectProgressPill({
  theme,
  isAuthenticated,
  completedCount,
  lessonCount,
  progressPercent,
  onEnableLearnerMode,
}: SubjectProgressPillProps) {
  const ringSize = 26;
  const strokeWidth = 3;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      aria-label={isAuthenticated ? 'Tiến độ học tập môn học' : 'Chế độ khách'}
      data-testid="subject-progress-pill"
      className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-white/15 bg-black/30 px-3.5 py-2 text-xs text-white backdrop-blur-md"
    >
      <div className="relative flex items-center justify-center">
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          className="-rotate-90 transform"
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Tiến độ hoàn thành: ${progressPercent}%`}
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="transparent"
            stroke={theme.accent}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
      </div>

      <span className="font-medium text-white/90">
        Tiến độ:{' '}
        <strong className="font-mono text-[var(--subject-accent)]">{progressPercent}%</strong>{' '}
        <span className="text-white/65">
          ({completedCount}/{lessonCount} bài học)
        </span>
      </span>

      {isAuthenticated ? (
        completedCount === lessonCount &&
        lessonCount > 0 && (
          <span className="inline-flex items-center gap-1 border-l border-white/15 pl-2.5 font-medium text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Hoàn thành</span>
          </span>
        )
      ) : (
        <button
          type="button"
          onClick={onEnableLearnerMode}
          aria-label="Bật theo dõi tiến độ học tập"
          className="inline-flex cursor-pointer items-center gap-1 border-l border-white/15 pl-2.5 font-medium text-[var(--subject-accent)] transition-colors hover:text-white"
        >
          <UserCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>Bật theo dõi</span>
        </button>
      )}
    </div>
  );
}

/**
 * Thanh lộ trình ngang (Horizontal Pathway Dock) trải đều ở đáy Hero, giúp nhảy nhanh
 * tới các chương tương ứng mà không che tầm nhìn đồ họa 3D/2D.
 */
export function SubjectPathwayDock({
  theme,
  chapters,
  completedLessons,
  onJumpToChapters,
}: SubjectPathwayDockProps) {
  const gridClass =
    STAGE_GRID_CLASSES[theme.stages.length] ??
    'grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div
      data-testid="subject-pathway-dock"
      className="relative z-20 mt-7 w-full border-t border-white/10 pt-5"
    >
      <p className="mb-3 font-mono text-[11px] font-semibold tracking-[0.16em] text-white/75 uppercase">
        {theme.widgetTitle}
      </p>

      <ol className={gridClass} aria-label={theme.widgetTitle}>
        {theme.stages.map((stage, index) => {
          const stageChapters = chapters.filter((chapter) =>
            stage.chapterNumbers.includes(chapter.number),
          );
          const total = stageChapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
          const done = stageChapters.reduce(
            (sum, chapter) =>
              sum + chapter.lessons.filter((lesson) => Boolean(completedLessons[lesson.id])).length,
            0,
          );
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          const caption = formatStageCaption(stage, chapters);
          const isLast = index === theme.stages.length - 1;

          return (
            <li key={stage.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onJumpToChapters?.(stage.chapterNumbers)}
                disabled={stageChapters.length === 0}
                aria-label={`${stage.label}${stage.detail ? ` ${stage.detail}` : ''} — ${caption}`}
                className={cn(
                  'group flex h-full w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl border border-white/10 bg-black/25 px-3.5 py-2.5 text-left backdrop-blur-md transition-all',
                  'hover:border-[var(--subject-accent-border)] hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[var(--subject-accent)] focus-visible:outline-none',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[var(--subject-accent-border)] bg-[var(--subject-accent-soft)] font-mono text-[10.5px] font-semibold text-[var(--subject-accent)] transition-colors group-hover:bg-[var(--subject-accent)] group-hover:text-black">
                      {index + 1}
                    </span>
                    <span className="truncate text-[13px] font-semibold text-white">
                      {stage.label}
                    </span>
                  </span>

                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-7">
                    {stage.detail && (
                      <span className="font-mono text-[11px] font-medium text-[var(--subject-accent-2)]">
                        {stage.detail}
                      </span>
                    )}
                    <span className="text-[11px] text-white/60">{caption}</span>
                  </span>

                  <span className="mt-1.5 block h-0.5 w-full overflow-hidden rounded-full bg-white/10">
                    <span
                      className="block h-full rounded-full bg-[var(--subject-accent)] transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                </span>

                {!isLast && (
                  <ArrowRight
                    className="h-3.5 w-3.5 shrink-0 text-white/35 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--subject-accent)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
