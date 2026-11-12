import { Check, Copy } from 'lucide-react';
import { type ReactNode, useMemo, useState } from 'react';
import { detectCourseIdFromPath } from '@/data/math-glossary';
import { annotateTextString } from '@/features/math-glossary/annotator';
import { KatexMath } from '@/features/math-glossary/KatexMath';
import { useMathGlossary } from '@/features/math-glossary/useMathGlossary';
import { cn } from '@/shared/lib/cn';

export interface MathTextProps {
  readonly text: string;
  readonly className?: string;
  readonly currentCourseId?: string;
  readonly courseId?: string;
  /** Render nội tuyến (`<span>`) không bọc khối `<p>`/`<div>`, phù hợp tiêu đề, badge, bảng phân bố. */
  readonly inline?: boolean;
}

export interface KatexDisplayFormulaProps {
  readonly math: string;
  readonly className?: string;
}

/**
 * Hiển thị một công thức toán khối (`displayMode`) bằng KaTeX kèm nút sao chép mã nguồn LaTeX.
 */
export function KatexDisplayFormula({ math, className }: KatexDisplayFormulaProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(math);
      }
      setCopied(true);
      if (typeof window !== 'undefined') {
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      // Bỏ qua nếu môi trường không hỗ trợ Clipboard API
    }
  };

  return (
    <div
      className={cn(
        'group/katex relative my-4 overflow-x-auto rounded-xl border border-[var(--border-subtle)]/70 bg-[var(--bg-subtle)]/60 px-5 pt-8 pb-3.5 transition-colors duration-200 hover:border-[var(--border-control)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? 'Đã sao chép mã LaTeX' : 'Sao chép LaTeX'}
        title="Sao chép mã nguồn LaTeX"
        className="absolute top-2 right-2 z-10 inline-flex min-h-[28px] cursor-pointer items-center gap-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] font-medium text-[var(--text-muted)] shadow-2xs transition-all duration-200 hover:border-[var(--border-control)] hover:text-[var(--text-main)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] active:scale-[0.98] print:hidden"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <span>Đã chép</span>
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" aria-hidden="true" />
            <span>Copy LaTeX</span>
          </>
        )}
      </button>

      <div className="overflow-x-auto py-0.5 text-center text-[var(--text-main)]">
        <KatexMath math={math} display={true} />
      </div>
    </div>
  );
}

/**
 * Phân tích và hiển thị chuỗi văn bản hỗn hợp chứa định dạng Markdown cơ bản và công thức KaTeX:
 * - Display math: `$$...$$` (có nút copy mã LaTeX)
 * - Inline math: `$...$`
 * - Bold `**...**`, Italic `*...*`, Inline code `` `...` ``
 * - Danh sách gạch đầu dòng `-`, `*`, danh sách có thứ tự `1.`, `a)`, phân cách `---`
 */
export function MathText({
  text,
  className,
  currentCourseId,
  courseId,
  inline = false,
}: MathTextProps) {
  const glossaryCtx = useMathGlossary();
  const effectiveCourseId = useMemo(() => {
    if (currentCourseId || courseId) return currentCourseId || courseId;
    if (glossaryCtx.currentCourseId) return glossaryCtx.currentCourseId;
    if (typeof window !== 'undefined') {
      return detectCourseIdFromPath(window.location?.pathname);
    }
    return undefined;
  }, [currentCourseId, courseId, glossaryCtx.currentCourseId]);

  const inlineNodes = useMemo(() => {
    if (!inline || !text) return null;
    return renderInlineTokens(text.trim(), 'inline', effectiveCourseId);
  }, [inline, text, effectiveCourseId]);

  const renderedContent = useMemo(() => {
    if (inline || !text) return null;

    const normalized = text.replace(/\r\n/g, '\n').trim();
    const topSegments = normalized.split(/(\$\$[\s\S]*?\$\$)/g);

    return topSegments.map((segment, segIdx) => {
      const displayMatch = segment.match(/^\$\$([\s\S]*?)\$\$$/);
      if (displayMatch && displayMatch[1] !== undefined) {
        return <KatexDisplayFormula key={`display-${segIdx}`} math={displayMatch[1].trim()} />;
      }

      if (!segment.trim()) return null;

      const blocks = segment.split(/\n\s*\n/);
      return (
        <div key={`prose-seg-${segIdx}`}>
          {blocks.map((block, blockIdx) =>
            renderTextBlock(block, `${segIdx}-${blockIdx}`, effectiveCourseId),
          )}
        </div>
      );
    });
  }, [inline, text, effectiveCourseId]);

  if (inline) {
    if (!text) return null;
    return <span className={cn('text-inherit', className)}>{inlineNodes}</span>;
  }

  return (
    <div className={cn('text-sm leading-relaxed text-[var(--text-main)]', className)}>
      {renderedContent}
    </div>
  );
}

const UNORDERED_ITEM_RE = /^\s*[-*+]\s+(.*)$/;
const ORDERED_ITEM_RE = /^\s*(?:\d+\.|[a-z]\))\s+(.*)$/;
const HR_RE = /^\s*---+\s*$/;

function renderTextBlock(block: string, blockKey: string, courseId?: string): ReactNode {
  const trimmed = block.trim();
  if (!trimmed) return null;

  const lines = trimmed.split('\n');
  const nodes: ReactNode[] = [];
  let idx = 0;

  while (idx < lines.length) {
    const current = lines[idx] ?? '';

    if (HR_RE.test(current)) {
      nodes.push(
        <hr key={`hr-${blockKey}-${idx}`} className="my-3 border-[var(--border-subtle)]" />,
      );
      idx += 1;
      continue;
    }

    if (UNORDERED_ITEM_RE.test(current)) {
      const items: string[] = [];
      const startIdx = idx;
      while (idx < lines.length && UNORDERED_ITEM_RE.test(lines[idx] ?? '')) {
        const match = (lines[idx] ?? '').match(UNORDERED_ITEM_RE);
        items.push(match?.[1] ?? '');
        idx += 1;
      }
      nodes.push(
        <ul
          key={`ul-${blockKey}-${startIdx}`}
          className="my-2 list-outside list-disc space-y-1.5 pl-5 text-[var(--text-main)]"
        >
          {items.map((item, itemIdx) => (
            <li key={`li-${blockKey}-${startIdx}-${itemIdx}`} className="leading-relaxed">
              {renderInlineTokens(item, `ul-${blockKey}-${startIdx}-${itemIdx}`, courseId)}
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (ORDERED_ITEM_RE.test(current)) {
      const items: string[] = [];
      const startIdx = idx;
      while (idx < lines.length && ORDERED_ITEM_RE.test(lines[idx] ?? '')) {
        const match = (lines[idx] ?? '').match(ORDERED_ITEM_RE);
        items.push(match?.[1] ?? '');
        idx += 1;
      }
      nodes.push(
        <ol
          key={`ol-${blockKey}-${startIdx}`}
          className="my-2 list-outside list-decimal space-y-1.5 pl-5 text-[var(--text-main)]"
        >
          {items.map((item, itemIdx) => (
            <li key={`oli-${blockKey}-${startIdx}-${itemIdx}`} className="leading-relaxed">
              {renderInlineTokens(item, `ol-${blockKey}-${startIdx}-${itemIdx}`, courseId)}
            </li>
          ))}
        </ol>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    const startIdx = idx;
    while (
      idx < lines.length &&
      !HR_RE.test(lines[idx] ?? '') &&
      !UNORDERED_ITEM_RE.test(lines[idx] ?? '') &&
      !ORDERED_ITEM_RE.test(lines[idx] ?? '')
    ) {
      paragraphLines.push(lines[idx] ?? '');
      idx += 1;
    }

    nodes.push(
      <p
        key={`p-${blockKey}-${startIdx}`}
        className="my-1.5 leading-relaxed text-[var(--text-main)]"
      >
        {paragraphLines.map((line, lineIdx) => (
          <span key={`line-${blockKey}-${startIdx}-${lineIdx}`}>
            {renderInlineTokens(line, `p-${blockKey}-${startIdx}-${lineIdx}`, courseId)}
            {lineIdx < paragraphLines.length - 1 && <br />}
          </span>
        ))}
      </p>,
    );
  }

  return <div key={`blk-${blockKey}`}>{nodes}</div>;
}

function isEscaped(input: string, index: number): boolean {
  let slashCount = 0;
  let cursor = index - 1;
  while (cursor >= 0 && input[cursor] === '\\') {
    slashCount += 1;
    cursor -= 1;
  }
  return slashCount % 2 === 1;
}

/**
 * Tìm vị trí đóng cho delimiter (`**`, `*`, `` ` ``), tự động bỏ qua nội dung bên trong `$...$`
 * để tránh xung đột với dấu sao mũ (như `$\mathbb{Z}^*$`).
 */
function findClosingDelimiter(
  input: string,
  fromIndex: number,
  delimiter: '**' | '*' | '`',
): number {
  let i = fromIndex;
  while (i < input.length) {
    const ch = input[i];
    if (ch === '$' && !isEscaped(input, i)) {
      let endMath = i + 1;
      while (endMath < input.length && !(input[endMath] === '$' && !isEscaped(input, endMath))) {
        endMath += 1;
      }
      i = endMath < input.length ? endMath + 1 : input.length;
      continue;
    }
    if (input.startsWith(delimiter, i)) {
      return i;
    }
    i += 1;
  }
  return -1;
}

function renderInlineTokens(line: string, keyPrefix: string, courseId?: string): ReactNode[] {
  if (!line) return [];

  const nodes: ReactNode[] = [];
  let plainStart = 0;
  let i = 0;
  let tokenIndex = 0;

  const flushPlain = (endIndex: number) => {
    if (endIndex <= plainStart) return;
    const textChunk = line.slice(plainStart, endIndex);
    const key = `${keyPrefix}-${tokenIndex++}`;
    nodes.push(<span key={key}>{annotateTextString(textChunk, key, courseId)}</span>);
  };

  while (i < line.length) {
    if (line[i] === '$' && !isEscaped(line, i)) {
      let endMath = i + 1;
      while (endMath < line.length && !(line[endMath] === '$' && !isEscaped(line, endMath))) {
        endMath += 1;
      }
      if (endMath < line.length && endMath > i + 1) {
        flushPlain(i);
        const math = line.slice(i + 1, endMath);
        nodes.push(
          <KatexMath
            key={`${keyPrefix}-${tokenIndex++}`}
            math={math}
            display={false}
            className="mx-0.5 text-[var(--text-main)]"
          />,
        );
        i = endMath + 1;
        plainStart = i;
        continue;
      }
    }

    if (line.startsWith('**', i)) {
      const closeIdx = findClosingDelimiter(line, i + 2, '**');
      if (closeIdx > i + 2) {
        flushPlain(i);
        const inner = line.slice(i + 2, closeIdx);
        const key = `${keyPrefix}-${tokenIndex++}`;
        nodes.push(
          <strong key={key} className="font-semibold text-[var(--text-main)]">
            {renderInlineTokens(inner, `${key}-b`, courseId)}
          </strong>,
        );
        i = closeIdx + 2;
        plainStart = i;
        continue;
      }
    }

    if (line[i] === '*' && !line.startsWith('**', i)) {
      const closeIdx = findClosingDelimiter(line, i + 1, '*');
      if (closeIdx > i + 1) {
        flushPlain(i);
        const inner = line.slice(i + 1, closeIdx);
        const key = `${keyPrefix}-${tokenIndex++}`;
        nodes.push(
          <em key={key} className="text-[var(--text-main)] italic">
            {renderInlineTokens(inner, `${key}-i`, courseId)}
          </em>,
        );
        i = closeIdx + 1;
        plainStart = i;
        continue;
      }
    }

    if (line[i] === '`') {
      const closeIdx = findClosingDelimiter(line, i + 1, '`');
      if (closeIdx > i + 1) {
        flushPlain(i);
        const inner = line.slice(i + 1, closeIdx);
        nodes.push(
          <code
            key={`${keyPrefix}-${tokenIndex++}`}
            className="rounded bg-[var(--bg-sunken)] px-1.5 py-0.5 font-mono text-xs text-[var(--text-main)]"
          >
            {inner}
          </code>,
        );
        i = closeIdx + 1;
        plainStart = i;
        continue;
      }
    }

    i += 1;
  }

  flushPlain(line.length);
  return nodes;
}
