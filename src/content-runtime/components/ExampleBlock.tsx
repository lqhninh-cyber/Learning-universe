import { type ReactNode, useId } from 'react';
import { NUMBERED_BLOCKS } from '@schemas/blocks';
import { useSkimmableOpen } from '@/context/useSkimmableOpen';
import { usePrintExpanded } from '@/shared/hooks/usePrintExpanded';
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
  const generatedId = useId().replace(/:/g, '');
  const spec = NUMBERED_BLOCKS[kind];
  const resolvedAnchor = anchorId ?? id ?? `${spec.slug}-${generatedId}`;
  const headingLabel = number ? `${spec.label} ${number}` : spec.label;
  const isCounterexample = kind === 'Counterexample';

  const { isOpen, toggle } = useSkimmableOpen(true);
  const isPrinting = usePrintExpanded();

  return (
    <details
      id={resolvedAnchor}
      data-kind="ex"
      data-counterexample={isCounterexample ? 'true' : undefined}
      open={isPrinting || isOpen}
      aria-label={title ? `${headingLabel}: ${title}` : headingLabel}
      className="semantic-block ex-block my-6 scroll-mt-24 overflow-hidden rounded-xl shadow-xs transition-all duration-200 dark:shadow-none"
    >
      <summary
        onClick={(e) => {
          e.preventDefault();
          toggle();
        }}
        className="semantic-block-header ex-block-summary flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 select-none focus-visible:ring-2 focus-visible:ring-[#25694C] focus-visible:outline-none"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="kb-chevron inline-block text-sm font-bold" aria-hidden="true">
            ▸
          </span>
          <span
            className={cn(
              'kb-pill font-serif',
              isCounterexample &&
                'border-amber-500/40 bg-amber-100/80 text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/60 dark:text-amber-300',
            )}
          >
            {headingLabel}
          </span>
          {title && (
            <h4 className="font-serif text-base font-bold text-stone-900 dark:text-[#E8F1EC]">
              {title}
            </h4>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          <SourceAttributionBadge original={original} source={source} page={page} />
          <span
            className="hidden text-[11px] font-medium text-stone-500 sm:inline dark:text-[#A3E6C3]/80"
            aria-hidden="true"
          >
            {isOpen ? 'Thu gọn' : 'Mở rộng'}
          </span>
        </div>
      </summary>
      <div className="ex-block-body space-y-4 p-5 text-[18px] leading-[1.85] text-[#18221D] lg:p-6 dark:text-[#ECE8DF] [&_p]:mb-4 [&_p:last-child]:mb-0">
        {children}
      </div>
    </details>
  );
}

export function Example(props: ExampleBlockProps) {
  return <BaseExampleBlock kind="Example" {...props} />;
}

export function Counterexample(props: ExampleBlockProps) {
  return <BaseExampleBlock kind="Counterexample" {...props} />;
}
