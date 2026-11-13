import type { ManifestChapter } from '@schemas/index';
import { ArrowDown, CheckCircle2, UserCheck } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { SubjectUniverseStage, SubjectUniverseTheme } from './subjectUniverseThemes';

export interface SubjectUniverseWidgetProps {
  readonly theme: SubjectUniverseTheme;
  readonly chapters: readonly ManifestChapter[];
  readonly completedLessons: Readonly<Record<string, unknown>>;
  readonly isAuthenticated: boolean;
  readonly completedCount: number;
  readonly lessonCount: number;
  readonly progressPercent: number;
  readonly onEnableLearnerMode: () => void;
  readonly onJumpToChapters?: (chapterNumbers: readonly number[]) => void;
}

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
 * Sơ đồ điều hướng nhanh theo cấu trúc môn học kết hợp hộp Tiến độ hoàn thành,
 * đặt ở cột phải của Hero Không gian Tri thức.
 */
export function SubjectUniverseWidget({
  theme,
  chapters,
  completedLessons,
  isAuthenticated,
  completedCount,
  lessonCount,
  progressPercent,
  onEnableLearnerMode,
  onJumpToChapters,
}: SubjectUniverseWidgetProps) {
  const ringSize = 52;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div
      aria-label={isAuthenticated ? 'Tiến độ học tập môn học' : 'Chế độ khách'}
      data-testid="subject-universe-widget"
      className="w-full rounded-2xl border border-white/15 bg-black/35 p-4 text-white shadow-lg backdrop-blur-md sm:p-5 lg:max-w-md"
    >
      {/* Tiến độ hoàn thành */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] font-semibold tracking-wider text-[var(--subject-accent)] uppercase">
            Tiến độ hoàn thành
          </p>
          <p className="mt-0.5 flex items-baseline gap-2">
            <span className="font-serif text-2xl text-white">{progressPercent}%</span>
            <span className="text-xs text-white/70">
              {completedCount}/{lessonCount} bài học
            </span>
          </p>
        </div>
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
              stroke="rgba(255,255,255,0.16)"
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
          <span className="absolute font-mono text-[11px] font-semibold text-white/90">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Sơ đồ cấu trúc môn học */}
      <div className="mt-4 border-t border-white/12 pt-3.5">
        <p className="mb-2.5 font-mono text-[11px] font-semibold tracking-wider text-white/75 uppercase">
          {theme.widgetTitle}
        </p>
        <ol className="space-y-1" aria-label={theme.widgetTitle}>
          {theme.stages.map((stage, index) => {
            const stageChapters = chapters.filter((chapter) =>
              stage.chapterNumbers.includes(chapter.number),
            );
            const total = stageChapters.reduce((sum, chapter) => sum + chapter.lessons.length, 0);
            const done = stageChapters.reduce(
              (sum, chapter) =>
                sum +
                chapter.lessons.filter((lesson) => Boolean(completedLessons[lesson.id])).length,
              0,
            );
            const percent = total > 0 ? Math.round((done / total) * 100) : 0;
            const caption = formatStageCaption(stage, chapters);
            const isLast = index === theme.stages.length - 1;

            return (
              <li key={stage.id}>
                <button
                  type="button"
                  onClick={() => onJumpToChapters?.(stage.chapterNumbers)}
                  disabled={stageChapters.length === 0}
                  aria-label={`${stage.label}${stage.detail ? ` ${stage.detail}` : ''} — ${caption}`}
                  className={cn(
                    'group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition-colors',
                    'hover:bg-white/8 focus-visible:ring-2 focus-visible:ring-[var(--subject-accent)] focus-visible:outline-none',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                  )}
                >
                  <span className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--subject-accent-border)] bg-[var(--subject-accent-soft)] font-mono text-[11px] font-semibold text-[var(--subject-accent)] transition-colors group-hover:bg-[var(--subject-accent)] group-hover:text-black">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-1.5">
                      <span className="text-[13.5px] leading-snug font-semibold text-white">
                        {stage.label}
                      </span>
                      {stage.detail && (
                        <span className="font-mono text-[11.5px] text-[var(--subject-accent-2)]">
                          {stage.detail}
                        </span>
                      )}
                    </span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="h-1 w-16 overflow-hidden rounded-full bg-white/12">
                        <span
                          className="block h-full rounded-full bg-[var(--subject-accent)] transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </span>
                      <span className="text-[11px] text-white/60">{caption}</span>
                    </span>
                  </span>
                  {!isLast && (
                    <ArrowDown
                      className="h-3.5 w-3.5 shrink-0 text-white/30 transition-colors group-hover:text-[var(--subject-accent)]"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      {isAuthenticated ? (
        completedCount === lessonCount &&
        lessonCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5 border-t border-white/12 pt-3 text-xs font-medium text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Đã hoàn thành toàn bộ học phần</span>
          </div>
        )
      ) : (
        <div className="mt-3 border-t border-white/12 pt-3">
          <button
            type="button"
            onClick={onEnableLearnerMode}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-white/20 bg-white/8 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-white/15"
          >
            <UserCheck className="h-3.5 w-3.5 text-[var(--subject-accent)]" aria-hidden="true" />
            <span>Bật theo dõi tiến độ học tập</span>
          </button>
        </div>
      )}
    </div>
  );
}
