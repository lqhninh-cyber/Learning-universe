import type { MDXComponents } from 'mdx/types';
import { type ComponentPropsWithoutRef, type ComponentType, useMemo, useState } from 'react';
import type { BibliographyEntry, LessonMeta } from '@schemas/index';
import {
  annotateChildren,
  matchLatexToGlossary,
  MathGlossaryPopover,
  MathGlossaryProvider,
  MathGlossaryTerm,
  useMathGlossary,
} from '@/features/math-glossary';
import { extractLatexFromKatexNode } from '@/features/math-glossary/annotator';
import { cn } from '@/shared/lib/cn';
import { SidenoteProvider } from '@/shared/components/Sidenote';
import { TooltipProvider } from '@/shared/ui';
import { LessonProvider } from './LessonContext';
import { mdxComponents } from './mdx-components';

function KatexDisplayBlock({
  tex,
  spanProps,
}: {
  readonly tex: string | null;
  readonly spanProps: ComponentPropsWithoutRef<'span'>;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!tex) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(tex);
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
    <span className="group/katex relative my-2 block rounded-xl px-3 py-1 transition-colors duration-200 hover:bg-stone-100/40">
      <span {...spanProps} />
      {tex && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Sao chép LaTeX"
          title="Sao chép mã nguồn LaTeX"
          className="absolute top-2 right-2 z-10 inline-flex cursor-pointer items-center gap-1 rounded-md border border-stone-200/80 bg-[#FDFBF7]/95 px-2 py-0.5 font-mono text-[11px] font-medium text-stone-600 opacity-0 shadow-2xs backdrop-blur-xs transition-all duration-200 group-hover/katex:opacity-100 hover:border-stone-300 hover:text-stone-900 focus-visible:opacity-100"
        >
          <span>{copied ? 'Đã chép!' : 'Sao chép LaTeX'}</span>
        </button>
      )}
    </span>
  );
}

export interface LessonMdxViewProps {
  readonly Content: ComponentType<{ components?: MDXComponents }>;
  readonly lessonMeta?: LessonMeta | null;
  readonly bibliography?: readonly BibliographyEntry[];
  readonly className?: string;
  readonly courseId?: string;
}

interface LessonMdxArticleProps {
  readonly Content: ComponentType<{ components?: MDXComponents }>;
  readonly className?: string;
}

function LessonMdxArticle({ Content, className }: LessonMdxArticleProps) {
  const { isEnabled, currentCourseId } = useMathGlossary();

  const activeComponents = useMemo<MDXComponents>(() => {
    if (!isEnabled) {
      return mdxComponents;
    }

    return {
      ...mdxComponents,
      p: (props: ComponentPropsWithoutRef<'p'>) => (
        <p {...props}>{annotateChildren(props.children, currentCourseId)}</p>
      ),
      li: (props: ComponentPropsWithoutRef<'li'>) => (
        <li {...props}>{annotateChildren(props.children, currentCourseId)}</li>
      ),
      td: (props: ComponentPropsWithoutRef<'td'>) => (
        <td
          className="border-t border-stone-200 px-4 py-3 text-[15px] leading-relaxed text-stone-800"
          {...props}
        >
          {annotateChildren(props.children, currentCourseId)}
        </td>
      ),
      span: (props: ComponentPropsWithoutRef<'span'>) => {
        if (typeof props.className === 'string' && props.className.includes('katex-display')) {
          const tex = extractLatexFromKatexNode({ props });
          return <KatexDisplayBlock tex={tex} spanProps={props} />;
        }

        // Nếu thẻ span chứa công thức KaTeX nội dòng
        if (typeof props.className === 'string' && props.className.includes('katex')) {
          const tex = extractLatexFromKatexNode({ props });
          if (tex) {
            const entry = matchLatexToGlossary(tex, currentCourseId);
            if (entry) {
              return (
                <MathGlossaryTerm entry={entry} currentCourseId={currentCourseId}>
                  <span {...props} />
                </MathGlossaryTerm>
              );
            }
          }
        }
        return <span {...props} />;
      },
    };
  }, [isEnabled, currentCourseId]);

  return (
    <>
      <article className={cn('lu-prose lesson-content max-w-none', className)}>
        <Content components={activeComponents} />
      </article>
      <MathGlossaryPopover />
    </>
  );
}

/**
 * Khung kết xuất chuẩn cho một bài học MDX:
 * bọc `TooltipProvider`, `LessonProvider`, `MathGlossaryProvider` và lớp typography `.lu-prose`.
 */
export function LessonMdxView({
  Content,
  lessonMeta = null,
  bibliography,
  className,
  courseId,
}: LessonMdxViewProps) {
  return (
    <TooltipProvider>
      <LessonProvider lessonMeta={lessonMeta} bibliography={bibliography}>
        <MathGlossaryProvider courseId={courseId}>
          <SidenoteProvider>
            <LessonMdxArticle Content={Content} className={className} />
          </SidenoteProvider>
        </MathGlossaryProvider>
      </LessonProvider>
    </TooltipProvider>
  );
}
