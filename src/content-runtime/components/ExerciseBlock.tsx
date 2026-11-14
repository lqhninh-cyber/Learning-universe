import { CheckCircle2, HelpCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { NUMBERED_BLOCKS } from '@schemas/blocks';
import { Badge, Collapsible } from '@/shared/ui';
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

  return (
    <section
      id={resolvedAnchor}
      aria-label={cleanTitle ? `${headingLabel}: ${cleanTitle}` : headingLabel}
      className="my-6 scroll-mt-24 rounded-2xl border border-[#E2ECE6] bg-[#F8FAF9] p-5 shadow-sm transition-colors md:p-6 lg:p-7 dark:border-[#1E3B2E] dark:bg-[#0E1E17] dark:text-[#E8F1EC] dark:shadow-none"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
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
        </div>
        <div className="flex items-center gap-2">
          {groupLabel && (
            <span className="inline-flex items-center rounded-md border border-[#D5E4DC] bg-[#EDF4F0] px-2.5 py-0.5 text-xs font-medium text-[#2A5A41] dark:border-[#234736] dark:bg-[#142B20] dark:text-[#9BC7B1]">
              {groupLabel}
            </span>
          )}
          <SourceAttributionBadge original={original} source={source} page={page} />
        </div>
      </header>
      <div className="space-y-3 text-[16.5px] leading-relaxed text-zinc-900 dark:text-[#E8F1EC]">
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
    <div className="my-3">
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
    <div className="my-3">
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
