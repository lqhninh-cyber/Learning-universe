import type { ReactNode } from 'react';
import { NUMBERED_BLOCKS } from '@schemas/blocks';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui';
import { SourceAttributionBadge } from './TheoryBlock';

export interface ExampleBlockProps {
  readonly id?: string;
  /** Số hiệu Chương.Bài.Số do `remark-theorem-numbering` tự động gán (bộ đếm riêng). */
  readonly number?: string;
  readonly anchorId?: string;
  readonly title?: string;
  readonly original?: string;
  readonly source?: string;
  readonly page?: string;
  readonly children: ReactNode;
}

interface InternalExampleBlockProps extends ExampleBlockProps {
  readonly kind: 'Example' | 'Counterexample';
}

function BaseExampleBlock({
  kind,
  id,
  number,
  anchorId,
  title,
  original,
  source,
  page,
  children,
}: InternalExampleBlockProps) {
  const spec = NUMBERED_BLOCKS[kind];
  const resolvedAnchor = anchorId ?? id;
  const headingLabel = number ? `${spec.label} ${number}` : spec.label;
  const isCounterexample = kind === 'Counterexample';

  return (
    <section
      id={resolvedAnchor}
      aria-label={title ? `${headingLabel}: ${title}` : headingLabel}
      className={cn(
        'my-6 scroll-mt-24 rounded-2xl border p-5 transition-colors sm:p-6',
        isCounterexample
          ? 'border-amber-200/90 bg-amber-50/35'
          : 'border-stone-200/90 bg-stone-50/55',
      )}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant={isCounterexample ? 'draft' : 'neutral'} className="font-semibold">
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

export function Example(props: ExampleBlockProps) {
  return <BaseExampleBlock kind="Example" {...props} />;
}

export function Counterexample(props: ExampleBlockProps) {
  return <BaseExampleBlock kind="Counterexample" {...props} />;
}
