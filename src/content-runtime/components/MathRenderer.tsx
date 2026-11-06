import { type ReactNode, useMemo } from 'react';
import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface MathRendererProps {
  readonly content?: string | null;
  readonly inline?: boolean;
  readonly className?: string;
}

/**
 * Regex nhận diện các khối công thức toán có phân cách $...$ hoặc $$...$$
 */
const DELIMITED_MATH_REGEX = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

/**
 * Regex nhận diện các biểu thức LaTeX hoặc ký hiệu toán học trần (không có dấu $ bao quanh)
 * Bao gồm:
 * 1. Các lệnh LaTeX bắt đầu bằng dấu gạch chéo: \operatorname{...}(...), \mathbb{...}, \Z/12\Z, \Aff(\R), \ker, \im, v.v.
 * 2. Phép toán trong ngoặc: (\Z, +), (\mathbb{Z}, +)
 * 3. Ký hiệu cấu trúc đại số có chỉ số: D_{2n}, S_n, A_4, GL_n, GL_2(\R), M_n(R)
 * 4. Ký hiệu thương hoặc lũy thừa: G/N, R/I, R^\times, a^k, c_1^k, x_1^2
 */
const BARE_MATH_REGEX =
  /(\\[a-zA-Z]+(?:\{[^}]*\}|\([^)]*\))*(?:\/[a-zA-Z0-9\\]+)*|\([A-Za-z0-9\\]+\s*,\s*[-+*]\)|(?:[SDAGLM]_(?:\{[^{}]+\}|[a-zA-Z0-9]+))(?:\([A-Za-z0-9\\, ]+\))?|\b[A-Za-z]\^[a-zA-Z0-9{}]+\b|\b[A-Z]\/[A-Z0-9]+\b)/g;

/**
 * Phân tích và kết xuất đoạn văn bản trần có thể chứa các token LaTeX trần
 */
function renderBareMathTokens(text: string, prefix: string): ReactNode[] {
  if (!text) return [];

  // Nếu không có bất kỳ ký tự đặc biệt nào (\, _, ^, /), trả về chuỗi text trực tiếp
  if (!/[\\_^/]/.test(text)) {
    return [text];
  }

  const parts = text.split(BARE_MATH_REGEX);
  return parts.map((part, index) => {
    const key = `${prefix}-bare-${index}`;
    if (!part) return null;

    // Kiểm tra nếu part khớp với mẫu toán học
    if (
      part.startsWith('\\') ||
      /^\([A-Za-z0-9\\]+\s*,\s*[-+*]\)$/.test(part) ||
      /^(?:[SDAGLM]_(?:\{[^{}]+\}|[a-zA-Z0-9]+))(?:\([A-Za-z0-9\\, ]+\))?$/.test(part) ||
      /^[A-Za-z]\^[a-zA-Z0-9{}]+$/.test(part) ||
      /^[A-Z]\/[A-Z0-9]+$/.test(part)
    ) {
      return (
        <KatexMath key={key} math={part} display={false} className="align-baseline font-normal" />
      );
    }

    return <span key={key}>{part}</span>;
  });
}

/**
 * Component MathRenderer:
 * Phân tích và hiển thị chuỗi văn bản hỗn hợp (Markdown heading, block title, table of contents item)
 * Chuyển đổi toàn bộ các biểu thức LaTeX (dù có hay không có dấu $) thành font KaTeX sắc nét,
 * triệt tiêu hoàn toàn hiện tượng lộ mã nguồn thô hoặc ký tự gạch chéo ngược.
 */
export function MathRenderer({ content, inline = true, className }: MathRendererProps) {
  const rendered = useMemo(() => {
    if (!content) return null;

    // Kiểm tra xem chuỗi có chứa cặp dấu $...$ hay không
    if (content.includes('$')) {
      const segments = content.split(DELIMITED_MATH_REGEX);

      return segments.map((seg, index) => {
        const key = `math-seg-${index}`;
        if (!seg) return null;

        // Display math $$...$$
        if (seg.startsWith('$$') && seg.endsWith('$$') && seg.length >= 4) {
          const math = seg.slice(2, -2).trim();
          return (
            <KatexMath
              key={key}
              math={math}
              display={!inline}
              className={cn(!inline ? 'my-2 block' : 'align-baseline', className)}
            />
          );
        }

        // Inline math $...$
        if (seg.startsWith('$') && seg.endsWith('$') && seg.length >= 2) {
          const math = seg.slice(1, -1).trim();
          return (
            <KatexMath
              key={key}
              math={math}
              display={false}
              className={cn('align-baseline', className)}
            />
          );
        }

        // Đoạn văn bản nằm ngoài dấu $: có thể vẫn chứa lệnh LaTeX trần chưa bọc $
        return <span key={key}>{renderBareMathTokens(seg, key)}</span>;
      });
    }

    // Nếu chuỗi không chứa dấu $, xử lý các token toán trần
    return renderBareMathTokens(content, 'pure');
  }, [content, inline, className]);

  if (!content) return null;

  return <span className={cn(inline ? 'inline' : 'block', className)}>{rendered}</span>;
}
