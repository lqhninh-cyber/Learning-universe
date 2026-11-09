import type { ReactNode } from 'react';
import { NUMBERED_BLOCKS } from '@schemas/blocks';
import { cn } from '@/shared/lib/cn';
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
        'my-6 scroll-mt-24 rounded-2xl p-5 shadow-sm transition-colors md:p-6 lg:p-7 dark:shadow-none',
        isCounterexample
          ? 'border border-amber-200/90 bg-amber-50/35 dark:border-amber-900/40 dark:bg-amber-950/20'
          : 'border border-[#E2ECE6] bg-[#F8FAF9] text-zinc-900 dark:border dark:border-[#1E3B2E] dark:bg-[#0E1E17] dark:text-[#E8F1EC]',
      )}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors',
              isCounterexample
                ? 'border border-amber-200/80 bg-amber-50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300'
                : 'border border-[#E2ECE6] bg-[#E8F2EC] text-[#1B4332] dark:border dark:border-[#2B5642] dark:bg-[#19382A] dark:text-[#A1D1B7]',
            )}
          >
            {headingLabel}
          </span>
          {title && (
            <h4 className="text-base font-semibold text-zinc-900 dark:text-[#E8F1EC]">{title}</h4>
          )}
        </div>
        <SourceAttributionBadge original={original} source={source} page={page} />
      </header>
      <div className="space-y-3 text-[16.5px] leading-relaxed text-zinc-900 dark:text-[#E8F1EC]">
        {children}
      </div>
    </section>
  );
}

export function Example(props: ExampleBlockProps) {
  return <BaseExampleBlock kind="Example" {...props} />;
}

export function Counterexample(props: ExampleBlockProps) {
  return <BaseExampleBlock kind="Counterexample" {...props} />;
}
