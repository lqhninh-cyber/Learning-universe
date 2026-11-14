import katex from 'katex';
import { type ReactNode, useMemo } from 'react';
import { cn } from '@/shared/lib/cn';
import { fixKaTeXNegations, sanitizeKatexInput } from '@/shared/lib/math-sanitize';

export interface KatexMathProps {
  readonly math: string;
  readonly display?: boolean;
  readonly className?: string;
  readonly altText?: string;
}

const KATEX_MACROS = {
  '\\N': '\\mathbb{N}',
  '\\Z': '\\mathbb{Z}',
  '\\Q': '\\mathbb{Q}',
  '\\R': '\\mathbb{R}',
  '\\C': '\\mathbb{C}',
  '\\Aff': '\\operatorname{Aff}',
  '\\id': '\\operatorname{id}',
  '\\ker': '\\operatorname{ker}',
  '\\im': '\\operatorname{im}',
  '\\hom': '\\operatorname{Hom}',
  '\\Hom': '\\operatorname{Hom}',
  '\\aut': '\\operatorname{Aut}',
  '\\Aut': '\\operatorname{Aut}',
  '\\nequiv': '\\not\\equiv',
  '\\nsubset': '\\not\\subset',
  '\\nsupset': '\\not\\supset',
  '\\vect': '\\overrightarrow{#1}',
};

export function KatexMath({ math, display = false, className, altText }: KatexMathProps) {
  const html = useMemo(() => {
    const normalizedMath = sanitizeKatexInput(math);
    try {
      const rawHtml = katex.renderToString(normalizedMath, {
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        output: 'htmlAndMathml',
        macros: KATEX_MACROS,
      });
      return fixKaTeXNegations(rawHtml);
    } catch {
      return normalizedMath;
    }
  }, [math, display]);

  return (
    <span
      className={cn('inline-block select-none', className)}
      dangerouslySetInnerHTML={{ __html: html }}
      {...(altText ? { 'aria-label': altText } : {})}
    />
  );
}

export interface InlineMathTextProps {
  readonly text?: string | null;
  readonly className?: string;
}

/**
 * Phân tích và kết xuất chuỗi văn bản hỗn hợp có chứa công thức KaTeX nội dòng $...$ hoặc khối $$...$$
 */
export function InlineMathText({ text, className }: InlineMathTextProps): ReactNode {
  if (!text) return null;

  // Tách chuỗi theo các khối $$...$$ hoặc $...$
  const parts = text.split(/(\$\$[\s\S]+?\$\$|(?<!\\)\$[^$\n]+?\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
          const math = part.slice(2, -2);
          return <KatexMath key={index} math={math} display className="my-1.5 block text-center" />;
        }
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1);
          return <KatexMath key={index} math={math} className="inline-block px-0.5" />;
        }
        return part;
      })}
    </span>
  );
}

export default KatexMath;
