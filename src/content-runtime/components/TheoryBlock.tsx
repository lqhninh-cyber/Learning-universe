import { BookOpen } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import { NUMBERED_BLOCKS } from '@schemas/blocks';
import { Tooltip } from '@/shared/ui';
import { InlineTheoremViz } from '@/components/viz/InlineTheoremViz';
import { useLessonContext } from '../lesson-context';

export type TheoryKind =
  'Definition' | 'Theorem' | 'Lemma' | 'Proposition' | 'Corollary' | 'Property';

export interface TheoryBlockProps {
  readonly id?: string;
  /** Số hiệu Chương.Bài.Số do `remark-theorem-numbering` tự động gán. */
  readonly number?: string;
  /** Anchor DOM do `remark-theorem-numbering` tự động gán. */
  readonly anchorId?: string;
  readonly title?: string;
  /** Số hiệu gốc trong giáo trình tham khảo (ví dụ: "Định lý 1.4"). */
  readonly original?: string;
  /** Mã nguồn tài liệu trong `bibliography.yaml`. */
  readonly source?: string;
  /** Số trang tham khảo trong tài liệu gốc. */
  readonly page?: string;
  readonly children: ReactNode;
}

interface InternalTheoryBlockProps extends TheoryBlockProps {
  readonly kind: TheoryKind;
}

export function SourceAttributionBadge({
  original,
  source,
  page,
}: {
  readonly original?: string;
  readonly source?: string;
  readonly page?: string;
}) {
  const { resolveSource } = useLessonContext();

  if (!original && !source && !page) {
    return null;
  }

  const entry = source ? resolveSource(source) : undefined;
  const shortSource = entry ? `${entry.authors[0]} (${entry.year})` : source;

  const parts: string[] = [];
  if (original) {
    parts.push(original);
  }
  if (shortSource) {
    parts.push(shortSource);
  }
  if (page) {
    parts.push(`tr. ${page}`);
  }

  const badgeNode = (
    <span className="inline-flex items-center gap-1 rounded-md border border-[var(--bg-muted)] bg-[var(--bg-surface)]/60 px-2 py-0.5 text-xs font-normal text-[var(--text-secondary)] dark:border-[#1E3B2D] dark:bg-[#142B20] dark:text-[#A1B5AB]">
      <BookOpen
        className="h-3 w-3 text-[var(--text-muted)] dark:text-[#C5A262]"
        aria-hidden="true"
      />
      <span>{parts.join(' · ')}</span>
    </span>
  );

  if (!entry) {
    return badgeNode;
  }

  return (
    <Tooltip
      content={
        <div className="space-y-0.5">
          <p className="font-medium text-white">{entry.title}</p>
          <p className="text-stone-300">
            {entry.authors.join(', ')} — {entry.publisher} ({entry.year})
          </p>
          {page && <p className="text-stone-400">Trang {page}</p>}
        </div>
      }
    >
      {badgeNode}
    </Tooltip>
  );
}

function BaseTheoryBlock({
  kind,
  id,
  number,
  anchorId,
  title,
  original,
  source,
  page,
  children,
}: InternalTheoryBlockProps) {
  const generatedId = useId().replace(/:/g, '');
  const label = kind === 'Property' ? 'Tính chất' : NUMBERED_BLOCKS[kind].label;
  const semanticKind = kind === 'Definition' ? 'def' : 'thm';
  const resolvedAnchor = anchorId ?? id ?? `${semanticKind}-${generatedId}`;
  const headingLabel = number ? `${label} ${number}` : label;

  return (
    <>
      <section
        id={resolvedAnchor}
        data-kind={semanticKind}
        aria-label={title ? `${headingLabel}: ${title}` : headingLabel}
        className="semantic-block my-5 scroll-mt-24 overflow-hidden rounded-xl shadow-xs transition-all duration-200 dark:shadow-none"
      >
        <header className="semantic-block-header flex flex-wrap items-center justify-between gap-2 px-5 py-3">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="kb-pill font-serif">{headingLabel}</span>
            {title && (
              <>
                <span className="text-stone-400 dark:text-stone-500" aria-hidden="true">
                  ·
                </span>
                <h4 className="font-serif text-base font-bold text-stone-900 dark:text-[#F5F2EB]">
                  {title}
                </h4>
              </>
            )}
          </div>
          <SourceAttributionBadge original={original} source={source} page={page} />
        </header>
        <div className="semantic-block-body space-y-3 p-5 text-[17px] leading-[1.8] text-stone-800 lg:p-6 lg:text-[17.5px] dark:text-[#E8F1EC]">
          {children}
        </div>
      </section>
      <InlineTheoremViz blockId={id ?? resolvedAnchor} />
    </>
  );
}

export function Definition(props: TheoryBlockProps) {
  return <BaseTheoryBlock kind="Definition" {...props} />;
}

export function Theorem(props: TheoryBlockProps) {
  return <BaseTheoryBlock kind="Theorem" {...props} />;
}

export function Lemma(props: TheoryBlockProps) {
  return <BaseTheoryBlock kind="Lemma" {...props} />;
}

export function Proposition(props: TheoryBlockProps) {
  return <BaseTheoryBlock kind="Proposition" {...props} />;
}

export function Corollary(props: TheoryBlockProps) {
  return <BaseTheoryBlock kind="Corollary" {...props} />;
}

export function Property(props: TheoryBlockProps) {
  return <BaseTheoryBlock kind="Property" {...props} />;
}
