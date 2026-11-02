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
  readonly original?: string;
  readonly source?: string;
  readonly page?: string;
  readonly children: ReactNode;
}

export function Exercise({
  id,
  number,
  anchorId,
  title,
  original,
  source,
  page,
  children,
}: ExerciseProps) {
  const spec = NUMBERED_BLOCKS.Exercise;
  const resolvedAnchor = anchorId ?? id;
  const headingLabel = number ? `${spec.label} ${number}` : spec.label;

  return (
    <section
      id={resolvedAnchor}
      aria-label={title ? `${headingLabel}: ${title}` : headingLabel}
      className="my-6 scroll-mt-24 rounded-2xl border border-[var(--bg-muted)] bg-[#FAF8F5] p-5 shadow-2xs sm:p-6"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="subject" className="font-semibold">
            {headingLabel}
          </Badge>
          {title && <h4 className="text-base font-semibold text-[var(--text-primary)]">{title}</h4>}
        </div>
        <SourceAttributionBadge original={original} source={source} page={page} />
      </header>
      <div className="space-y-3 text-[var(--text-primary)]">{children}</div>
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
          <span className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
            <HelpCircle className="text-subject-600 h-4 w-4" aria-hidden="true" />
            <span>{title}</span>
          </span>
        }
        className="border-[var(--bg-muted)] bg-[var(--bg-surface)]/25"
        contentClassName="bg-[#FAF8F5] text-[var(--text-secondary)]"
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

export function Solution({
  title = 'Lời giải tham khảo',
  defaultOpen = false,
  children,
}: SolutionProps) {
  return (
    <div className="my-3">
      <Collapsible
        defaultOpen={defaultOpen}
        title={
          <span className="inline-flex items-center gap-2 text-[var(--text-primary)]">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>{title}</span>
          </span>
        }
        className="border-[var(--bg-muted)] bg-[var(--bg-surface)]/25"
        contentClassName="bg-[#FAF8F5] text-base text-[var(--text-primary)]"
      >
        <div className="space-y-3">{children}</div>
      </Collapsible>
    </div>
  );
}
