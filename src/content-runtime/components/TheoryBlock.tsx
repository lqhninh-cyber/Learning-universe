import { BookOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { NUMBERED_BLOCKS } from '@schemas/blocks';
import { Tooltip } from '@/shared/ui';
import { useLessonContext } from '../lesson-context';

export type TheoryKind = 'Definition' | 'Theorem' | 'Lemma' | 'Proposition' | 'Corollary';

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
  const spec = NUMBERED_BLOCKS[kind];
  const resolvedAnchor = anchorId ?? id;
  const headingLabel = number ? `${spec.label} ${number}` : spec.label;

  return (
    <section
      id={resolvedAnchor}
      aria-label={title ? `${headingLabel}: ${title}` : headingLabel}
      className="my-4 scroll-mt-24 rounded-xl border border-stone-200 bg-white/40 p-5 transition-colors lg:p-6 dark:border-[#1E3B2E] dark:bg-[#0E1E17]/80"
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/50 pb-2.5 dark:border-[#1E3B2E]">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-serif text-sm font-bold tracking-wider text-stone-900 uppercase dark:text-[#F5F2EB]">
            {headingLabel}
          </span>
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
      <div className="space-y-3 text-[17px] leading-[1.8] text-stone-800 lg:text-[17.5px] dark:text-[#E8F1EC]">
        {children}
      </div>
    </section>
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
