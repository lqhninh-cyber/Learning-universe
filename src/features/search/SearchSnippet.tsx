import { Fragment, type ReactNode } from 'react';
import { KatexMath } from '@/features/math-glossary/KatexMath';
import { extractBestExcerpt, findHighlightRanges, scoreTextMatch } from '@/utils/vietnamese-text';
import { cn } from '@/shared/lib/cn';

interface Segment {
  readonly kind: 'text' | 'math';
  readonly value: string;
}

/** Tách chuỗi thành các đoạn văn bản thường và công thức inline `$...$`. */
function splitInlineMathSegments(input: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;
  let mathStart = -1;

  for (let i = 0; i < input.length; i += 1) {
    if (input[i] === '\\') {
      i += 1;
      continue;
    }
    if (input[i] === '$') {
      if (mathStart === -1) {
        if (i > cursor) {
          segments.push({ kind: 'text', value: input.slice(cursor, i) });
        }
        mathStart = i + 1;
      } else {
        const formula = input.slice(mathStart, i).trim();
        if (formula.length > 0) {
          segments.push({ kind: 'math', value: formula });
        }
        cursor = i + 1;
        mathStart = -1;
      }
    }
  }

  if (mathStart !== -1) {
    segments.push({ kind: 'text', value: input.slice(mathStart - 1) });
  } else if (cursor < input.length) {
    segments.push({ kind: 'text', value: input.slice(cursor) });
  }

  return segments;
}

function renderHighlightedProse(text: string, query: string, keyPrefix: string): ReactNode {
  const ranges = findHighlightRanges(text, query);
  if (ranges.length === 0) {
    return text;
  }

  const nodes: ReactNode[] = [];
  let cursor = 0;

  for (let idx = 0; idx < ranges.length; idx += 1) {
    const [start, end] = ranges[idx]!;
    if (start > cursor) {
      nodes.push(text.slice(cursor, start));
    }
    nodes.push(
      <mark key={`${keyPrefix}-m-${idx}`} className="rounded bg-[#FFE08A] px-1 text-[#1C2430]">
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

export interface SearchSnippetProps {
  readonly text: string;
  readonly query: string;
  readonly maxLength?: number;
  readonly className?: string;
}

/**
 * Hiển thị đoạn trích kết quả tìm kiếm có công thức KaTeX và tô sáng cụm từ khớp.
 */
export function SearchSnippet({ text, query, maxLength = 210, className }: SearchSnippetProps) {
  const excerpt = extractBestExcerpt(text, query, maxLength);
  if (!excerpt) {
    return null;
  }

  const segments = splitInlineMathSegments(excerpt);
  const trimmedQuery = query.trim();

  return (
    <span className={cn('text-xs leading-relaxed text-[var(--text-secondary)]', className)}>
      {segments.map((seg, idx) => {
        if (seg.kind === 'text') {
          return (
            <Fragment key={`seg-${idx}`}>
              {trimmedQuery
                ? renderHighlightedProse(seg.value, trimmedQuery, `s-${idx}`)
                : seg.value}
            </Fragment>
          );
        }

        const mathMatched =
          trimmedQuery.length > 0 && scoreTextMatch(seg.value, trimmedQuery).matched;
        const katexEl = <KatexMath math={seg.value} className="text-[12px]" />;

        if (mathMatched) {
          return (
            <mark
              key={`seg-${idx}`}
              className="mx-0.5 inline-block rounded bg-[#FFE08A] px-1 text-[#1C2430]"
            >
              {katexEl}
            </mark>
          );
        }

        return (
          <span key={`seg-${idx}`} className="mx-0.5 inline-block">
            {katexEl}
          </span>
        );
      })}
    </span>
  );
}
