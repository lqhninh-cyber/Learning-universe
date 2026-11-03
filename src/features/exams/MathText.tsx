import { type ReactNode, useMemo } from 'react';
import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface MathTextProps {
  readonly text: string;
  readonly className?: string;
}

/**
 * Phân tích và hiển thị chuỗi văn bản hỗn hợp chứa định dạng Markdown cơ bản và công thức KaTeX
 * - Inline math: $...$
 * - Display math: $$...$$
 * - Bold: **...**
 * - Italic: *...*
 * - Inline code: `...`
 * - Unordered / Ordered list items: - , * , 1. , a)
 */
export function MathText({ text, className }: MathTextProps) {
  const renderedContent = useMemo(() => {
    if (!text) return null;

    // Chuẩn hóa xuống dòng
    const normalized = text.replace(/\r\n/g, '\n').trim();

    // Tách khối theo 2 lần xuống dòng liên tiếp
    const blocks = normalized.split(/\n\s*\n/);

    return blocks.map((block, blockIdx) => {
      const trimmedBlock = block.trim();
      if (!trimmedBlock) return null;

      // Kiểm tra nếu khối toàn bộ là công thức toán độc lập $$...$$
      const displayMathMatch = trimmedBlock.match(/^\$\$([\s\S]*?)\$\$$/);
      if (displayMathMatch && displayMathMatch[1]) {
        return (
          <div key={`block-${blockIdx}`} className="my-2.5 overflow-x-auto py-1 text-center">
            <KatexMath math={displayMathMatch[1].trim()} display={true} />
          </div>
        );
      }

      // Xử lý các dòng trong khối (có thể chứa danh sách hoặc các công thức display nằm xen kẽ)
      const lines = trimmedBlock.split('\n');

      // Kiểm tra nếu tất cả các dòng là list item (bắt đầu bằng - , * , + )
      const isUnorderedList = lines.every((line) => /^\s*[-*+]\s+/.test(line));
      if (isUnorderedList && lines.length > 0) {
        return (
          <ul
            key={`block-${blockIdx}`}
            className="my-2 list-outside list-disc space-y-1.5 pl-5 text-stone-700"
          >
            {lines.map((line, lineIdx) => {
              const cleanLine = line.replace(/^\s*[-*+]\s+/, '');
              return (
                <li key={`li-${blockIdx}-${lineIdx}`} className="leading-relaxed">
                  {renderInlineTokens(cleanLine, `ul-${blockIdx}-${lineIdx}`)}
                </li>
              );
            })}
          </ul>
        );
      }

      // Kiểm tra nếu tất cả các dòng là ordered list (bắt đầu bằng số hoặc chữ e.g. 1. hoặc a) )
      const isOrderedList = lines.every((line) => /^\s*(\d+\.|[a-z]\))\s+/.test(line));
      if (isOrderedList && lines.length > 0) {
        return (
          <ol
            key={`block-${blockIdx}`}
            className="my-2 list-outside list-decimal space-y-1.5 pl-5 text-stone-700"
          >
            {lines.map((line, lineIdx) => {
              const cleanLine = line.replace(/^\s*(\d+\.|[a-z]\))\s+/, '');
              return (
                <li key={`ol-${blockIdx}-${lineIdx}`} className="leading-relaxed">
                  {renderInlineTokens(cleanLine, `ol-${blockIdx}-${lineIdx}`)}
                </li>
              );
            })}
          </ol>
        );
      }

      // Khối đoạn văn thông thường (có thể có display math $$ bên trong)
      const segments = trimmedBlock.split(/(\$\$[\s\S]*?\$\$)/g);

      return (
        <div key={`p-${blockIdx}`} className="my-1.5 leading-relaxed text-stone-700">
          {segments.map((seg, segIdx) => {
            const segDisplayMatch = seg.match(/^\$\$([\s\S]*?)\$\$$/);
            if (segDisplayMatch && segDisplayMatch[1]) {
              return (
                <div
                  key={`disp-${blockIdx}-${segIdx}`}
                  className="my-2.5 overflow-x-auto py-1 text-center"
                >
                  <KatexMath math={segDisplayMatch[1].trim()} display={true} />
                </div>
              );
            }

            // Tách theo dòng đơn để giữ ngắt dòng
            const subLines = seg.split('\n');
            return (
              <span key={`seg-${blockIdx}-${segIdx}`}>
                {subLines.map((subLine, subIdx) => (
                  <span key={`line-${blockIdx}-${segIdx}-${subIdx}`}>
                    {renderInlineTokens(subLine, `txt-${blockIdx}-${segIdx}-${subIdx}`)}
                    {subIdx < subLines.length - 1 && <br />}
                  </span>
                ))}
              </span>
            );
          })}
        </div>
      );
    });
  }, [text]);

  return <div className={cn('text-sm leading-relaxed', className)}>{renderedContent}</div>;
}

/**
 * Phân tích các token nội dòng: KaTeX inline, In đậm, In nghiêng, Code
 */
function renderInlineTokens(line: string, keyPrefix: string): ReactNode[] {
  if (!line) return [];

  // Regex tách token:
  // 1: Inline math ($...$)
  // 2: Bold (**...**)
  // 3: Italic (*...*)
  // 4: Inline code (`...`)
  const tokenRegex = /(\$[^$\n]+?\$|\*\*[^*\n]+?\*\*|\*[^*\n]+?\*|`[^`\n]+?`)/g;
  const parts = line.split(tokenRegex);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    if (!part) return null;

    // Inline math $...$
    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      const math = part.slice(1, -1);
      return <KatexMath key={key} math={math} display={false} className="mx-0.5 text-stone-900" />;
    }

    // Bold **...**
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      return (
        <strong key={key} className="font-semibold text-stone-900">
          {renderInlineTokens(inner, `${key}-b`)}
        </strong>
      );
    }

    // Italic *...*
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <em key={key} className="text-stone-800 italic">
          {renderInlineTokens(inner, `${key}-i`)}
        </em>
      );
    }

    // Inline code `...`
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const inner = part.slice(1, -1);
      return (
        <code
          key={key}
          className="rounded bg-stone-100 px-1 py-0.5 font-mono text-xs text-stone-800"
        >
          {inner}
        </code>
      );
    }

    // Văn bản bình thường
    return <span key={key}>{part}</span>;
  });
}
