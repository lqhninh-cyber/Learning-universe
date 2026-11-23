import { ArrowUpRight, CheckCircle2, HelpCircle, PenTool } from 'lucide-react';
import { type ReactNode, useRef } from 'react';
import { useInRouterContext, useNavigate } from 'react-router';
import { NUMBERED_BLOCKS } from '@schemas/blocks';
import {
  buildExerciseStorageKey,
  useLearningStore,
  type ExercisePracticeStatus,
} from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Badge, Collapsible } from '@/shared/ui';
import { extractExercisePromptFromElement, saveExerciseHandoff } from '@/utils/exerciseHandoff';
import { useLessonContext } from '../lesson-context';
import { SourceAttributionBadge } from './TheoryBlock';

export interface ExerciseProps {
  readonly id?: string;
  /** Số hiệu Chương.Bài.Số do `remark-theorem-numbering` tự động gán (bộ đếm bài tập riêng). */
  readonly number?: string;
  readonly anchorId?: string;
  readonly title?: string;
  readonly group?: string;
  readonly original?: string;
  readonly source?: string;
  readonly page?: string;
  readonly children: ReactNode;
}

const EXERCISE_STATUS_OPTIONS: ReadonlyArray<{
  readonly value: ExercisePracticeStatus;
  readonly label: string;
  readonly shortLabel: string;
  readonly activeClass: string;
}> = [
  {
    value: 'todo',
    label: 'Chưa làm',
    shortLabel: 'Chưa làm',
    activeClass:
      'border-stone-400/80 bg-stone-200/85 text-stone-800 dark:border-[#3A4D45] dark:bg-[#1C2A24] dark:text-[#D1DCD7]',
  },
  {
    value: 'review',
    label: 'Cần xem lại',
    shortLabel: 'Xem lại',
    activeClass:
      'border-[#9E763B] bg-[#9E763B] text-white dark:border-[#D4AF6A] dark:bg-[#9E763B] dark:text-white',
  },
  {
    value: 'done',
    label: 'Đã giải xong',
    shortLabel: 'Đã giải',
    activeClass:
      'border-[#1B5E4A] bg-[#1B5E4A] text-white dark:border-[#52B394] dark:bg-[#1B5E4A] dark:text-white',
  },
];

function parseExerciseTitle(
  rawTitle?: string,
  explicitGroup?: string,
): {
  cleanTitle?: string;
  groupLabel?: string;
} {
  if (!rawTitle) {
    return { cleanTitle: undefined, groupLabel: explicitGroup };
  }
  const bracketMatch = rawTitle.match(/^\[(Nhóm\s+[A-D])[^\]]*\]\s*(.*)$/i);
  if (bracketMatch) {
    return {
      groupLabel: explicitGroup ?? bracketMatch[1],
      cleanTitle: bracketMatch[2]?.trim() || undefined,
    };
  }
  const prefixMatch = rawTitle.match(
    /^Bài\s+tập\s+[\d.]+(?:\s*\((Nhóm\s+[A-D]|[^)]+)\))?\s*[:—–-]\s*(.*)$/i,
  );
  if (prefixMatch) {
    return {
      groupLabel: explicitGroup ?? prefixMatch[1]?.trim(),
      cleanTitle: prefixMatch[2]?.trim() || undefined,
    };
  }
  return {
    cleanTitle: rawTitle.trim(),
    groupLabel: explicitGroup,
  };
}

function ExerciseInkHandoffButton({
  onHandoff,
}: {
  readonly onHandoff: (navigateToInk: () => void) => void;
}) {
  const inRouter = useInRouterContext();
  if (!inRouter) {
    return (
      <button
        type="button"
        data-testid="exercise-ink-handoff-btn"
        onClick={() =>
          onHandoff(() => {
            if (typeof window !== 'undefined') {
              window.location.assign(ROUTES.mathInk);
            }
          })
        }
        className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)] hover:text-[var(--accent-os)] print:hidden"
        title="Đưa đề bài này sang Bảng viết để vẽ hình và nháp lời giải"
      >
        <PenTool className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span>Nháp trên Bảng viết</span>
        <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
      </button>
    );
  }
  return <RouterExerciseInkHandoffButton onHandoff={onHandoff} />;
}

function RouterExerciseInkHandoffButton({
  onHandoff,
}: {
  readonly onHandoff: (navigateToInk: () => void) => void;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      data-testid="exercise-ink-handoff-btn"
      onClick={() => onHandoff(() => void navigate(ROUTES.mathInk))}
      className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)] hover:text-[var(--accent-os)] print:hidden"
      title="Đưa đề bài này sang Bảng viết để vẽ hình và nháp lời giải"
    >
      <PenTool className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>Nháp trên Bảng viết</span>
      <ArrowUpRight className="h-3 w-3 shrink-0" aria-hidden="true" />
    </button>
  );
}

export function Exercise({
  id,
  number,
  anchorId,
  title,
  group,
  original,
  source,
  page,
  children,
}: ExerciseProps) {
  const spec = NUMBERED_BLOCKS.Exercise;
  const resolvedAnchor = anchorId ?? id;
  const headingLabel = number ? `${spec.label} ${number}` : spec.label;
  const { cleanTitle, groupLabel } = parseExerciseTitle(title, group);
  const bodyRef = useRef<HTMLDivElement>(null);

  const { lessonId, lessonTitle, lessonPath } = useLessonContext();
  const effectiveLessonId = lessonId ?? 'standalone-lesson';
  const effectiveExerciseId =
    resolvedAnchor ??
    (number
      ? `exercise-${number}`
      : cleanTitle
        ? `exercise-${cleanTitle.slice(0, 32)}`
        : 'exercise');

  const storageKey = buildExerciseStorageKey(effectiveLessonId, effectiveExerciseId);
  const status = useLearningStore((state) => state.exerciseStatus[storageKey] ?? 'todo');
  const setExerciseStatus = useLearningStore((state) => state.setExerciseStatus);

  const handleHandoffToInk = (navigateToInk: () => void) => {
    const promptText = extractExercisePromptFromElement(
      bodyRef.current,
      cleanTitle ? `${headingLabel}: ${cleanTitle}` : headingLabel,
    );
    const currentReturnPath =
      lessonPath ??
      (typeof window !== 'undefined' && window.location.pathname
        ? `${window.location.pathname}${resolvedAnchor ? `#${resolvedAnchor}` : ''}`
        : ROUTES.learningSpace);

    saveExerciseHandoff({
      lessonId: effectiveLessonId,
      lessonTitle: lessonTitle ?? 'Bài giảng',
      exerciseId: effectiveExerciseId,
      exerciseLabel: headingLabel,
      exerciseTitle: cleanTitle,
      promptText,
      returnPath:
        resolvedAnchor && !currentReturnPath.includes('#')
          ? `${currentReturnPath}#${resolvedAnchor}`
          : currentReturnPath,
      createdAt: new Date().toISOString(),
    });
    navigateToInk();
  };

  return (
    <section
      id={resolvedAnchor}
      data-exercise-id={effectiveExerciseId}
      data-exercise-status={status}
      aria-label={cleanTitle ? `${headingLabel}: ${cleanTitle}` : headingLabel}
      className={cn(
        'my-6 scroll-mt-24 rounded-2xl border p-5 shadow-sm transition-colors md:p-6 lg:p-7 dark:text-[#E8F1EC] dark:shadow-none',
        status === 'done'
          ? 'border-[#1B5E4A]/40 bg-[#F3F9F6] dark:border-[#52B394]/40 dark:bg-[#0D2118]'
          : status === 'review'
            ? 'border-[#9E763B]/45 bg-[#FCF8F1] dark:border-[#D4AF6A]/40 dark:bg-[#1E1911]'
            : 'border-[#E2ECE6] bg-[#F8FAF9] dark:border-[#1E3B2E] dark:bg-[#0E1E17]',
      )}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="subject"
            className="font-semibold dark:border-[#2B5642] dark:bg-[#19382A] dark:text-[#A1D1B7]"
          >
            {headingLabel}
          </Badge>
          {cleanTitle && (
            <>
              <span className="text-stone-400 select-none dark:text-stone-500" aria-hidden="true">
                —
              </span>
              <h4 className="text-base font-semibold text-zinc-900 dark:text-[#E8F1EC]">
                {cleanTitle}
              </h4>
            </>
          )}
          {groupLabel && (
            <span className="inline-flex items-center rounded-md border border-[#D5E4DC] bg-[#EDF4F0] px-2.5 py-0.5 text-xs font-medium text-[#2A5A41] dark:border-[#234736] dark:bg-[#142B20] dark:text-[#9BC7B1]">
              {groupLabel}
            </span>
          )}
          <SourceAttributionBadge original={original} source={source} page={page} />
        </div>

        {/* Bộ điều khiển tự luyện 3 trạng thái + nút 1 chạm Nháp trên Bảng viết */}
        <div className="flex flex-wrap items-center gap-1.5 print:hidden">
          <div
            role="group"
            data-testid="exercise-status-control"
            aria-label={`Trạng thái tự luyện cho ${headingLabel}`}
            className="inline-flex items-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-0.5"
          >
            {EXERCISE_STATUS_OPTIONS.map((opt) => {
              const isSelected = status === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  data-testid={`exercise-status-${opt.value}`}
                  aria-pressed={isSelected}
                  aria-label={`${opt.label} (${headingLabel})`}
                  title={opt.label}
                  onClick={() =>
                    setExerciseStatus(effectiveLessonId, effectiveExerciseId, opt.value)
                  }
                  className={cn(
                    'cursor-pointer rounded-md border px-2 py-0.5 text-[10.5px] font-semibold transition-colors',
                    isSelected
                      ? opt.activeClass
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-main)]',
                  )}
                >
                  {opt.shortLabel}
                </button>
              );
            })}
          </div>

          <ExerciseInkHandoffButton onHandoff={handleHandoffToInk} />
        </div>
      </header>
      <div
        ref={bodyRef}
        data-exercise-body="true"
        className="space-y-3 text-[16.5px] leading-relaxed text-zinc-900 dark:text-[#E8F1EC]"
      >
        {children}
      </div>
    </section>
  );
}

export interface HintProps {
  readonly title?: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export function Hint({ title = 'Gợi ý', defaultOpen = false, children }: HintProps) {
  return (
    <div className="my-3" data-exercise-auxiliary="true">
      <Collapsible
        defaultOpen={defaultOpen}
        title={
          <span className="inline-flex items-center gap-2 text-[var(--text-secondary)] dark:text-[#A1B5AB]">
            <HelpCircle
              className="text-subject-600 h-4 w-4 dark:text-[#C5A262]"
              aria-hidden="true"
            />
            <span>{title}</span>
          </span>
        }
        className="border-[var(--bg-muted)] bg-[var(--bg-surface)]/25 dark:border-[#1E3B2E] dark:bg-[#0E1E17]/60"
        contentClassName="bg-[#F8FAF9] dark:bg-[#0E1E17] text-zinc-800 dark:text-[#E8F1EC]"
      >
        <div className="space-y-2">{children}</div>
      </Collapsible>
    </div>
  );
}

export interface SolutionProps {
  readonly title?: string;
  readonly defaultOpen?: boolean;
  readonly children: ReactNode;
}

export function Solution({ title = 'Lời giải', defaultOpen = false, children }: SolutionProps) {
  const normalizedTitle =
    title === 'Lời giải chi tiết' || title === 'Lời giải tham khảo' ? 'Lời giải' : title;

  return (
    <div className="my-3" data-exercise-auxiliary="true">
      <Collapsible
        defaultOpen={defaultOpen}
        title={
          <span className="inline-flex items-center gap-2 text-zinc-900 dark:text-[#F5F2EB]">
            <CheckCircle2
              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
              aria-hidden="true"
            />
            <span>{normalizedTitle}</span>
          </span>
        }
        className="border-[var(--bg-muted)] bg-[var(--bg-surface)]/25 dark:border-[#1E3B2E] dark:bg-[#0E1E17]/60"
        contentClassName="bg-[#F8FAF9] dark:bg-[#0E1E17] text-base text-zinc-900 dark:text-[#E8F1EC]"
      >
        <div className="space-y-3">{children}</div>
      </Collapsible>
    </div>
  );
}
