import katex from 'katex';
import { useMemo } from 'react';
import { cn } from '@/shared/lib/cn';
import { sanitizeKatexInput } from '@/shared/lib/math-sanitize';

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
  '\\vect': '\\overrightarrow{#1}',
};

export function KatexMath({ math, display = false, className, altText }: KatexMathProps) {
  const html = useMemo(() => {
    const normalizedMath = sanitizeKatexInput(math);
    try {
      return katex.renderToString(normalizedMath, {
        displayMode: display,
        throwOnError: false,
        strict: 'ignore',
        output: 'htmlAndMathml',
        macros: KATEX_MACROS,
      });
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

export default KatexMath;
