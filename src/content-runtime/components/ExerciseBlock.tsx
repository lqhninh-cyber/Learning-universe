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
      className="my-6 scroll-mt-24 rounded-2xl border border-stone-200/90 bg-white p-5 shadow-2xs sm:p-6"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="subject" className="font-semibold">
            {headingLabel}
          </Badge>
          {title && <h4 className="text-base font-semibold text-stone-900">{title}</h4>}
        </div>
        <SourceAttributionBadge original={original} source={source} page={page} />
      </header>
      <div className="space-y-3 text-stone-800">{children}</div>
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
          <span className="inline-flex items-center gap-2 text-stone-700">
            <HelpCircle className="text-subject-600 h-4 w-4" aria-hidden="true" />
            <span>{title}</span>
          </span>
        }
        className="border-stone-200/80 bg-stone-50/50"
        contentClassName="bg-white text-stone-700"
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
          <span className="inline-flex items-center gap-2 text-stone-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
            <span>{title}</span>
          </span>
        }
        className="border-stone-200/90 bg-stone-50/60"
        contentClassName="bg-white text-base text-stone-800"
      >
        <div className="space-y-3">{children}</div>
      </Collapsible>
    </div>
  );
}
