import { BookOpen } from 'lucide-react';
import type { ReactNode } from 'react';
import { NUMBERED_BLOCKS } from '@schemas/blocks';
import { cn } from '@/shared/lib/cn';
import { Badge, Tooltip } from '@/shared/ui';
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
    <span className="inline-flex items-center gap-1 rounded-md border border-[var(--bg-muted)] bg-[var(--bg-surface)]/60 px-2 py-0.5 text-xs font-normal text-[var(--text-secondary)]">
      <BookOpen className="h-3 w-3 text-[var(--text-muted)]" aria-hidden="true" />
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
  const isDefinition = kind === 'Definition';

  return (
    <section
      id={resolvedAnchor}
      aria-label={title ? `${headingLabel}: ${title}` : headingLabel}
      className={cn(
        'my-6 scroll-mt-24 rounded-2xl border p-5 shadow-2xs transition-colors sm:p-6',
        isDefinition
          ? 'border-l-4 border-[var(--bg-muted)] border-l-[var(--accent-primary)] bg-[#FAF8F5]'
          : 'border-l-4 border-[var(--bg-muted)] border-l-[var(--accent-wood)] bg-[#FAF8F5]',
      )}
    >
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="subject" className="font-semibold tracking-tight">
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
