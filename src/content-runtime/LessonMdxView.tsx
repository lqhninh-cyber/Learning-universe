import type { MDXComponents } from 'mdx/types';
import { type ComponentPropsWithoutRef, type ComponentType, useMemo } from 'react';
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
import { TooltipProvider } from '@/shared/ui';
import { LessonProvider } from './LessonContext';
import { mdxComponents } from './mdx-components';

export interface LessonMdxViewProps {
  readonly Content: ComponentType<{ components?: MDXComponents }>;
  readonly lessonMeta?: LessonMeta | null;
  readonly bibliography?: readonly BibliographyEntry[];
  readonly className?: string;
}

interface LessonMdxArticleProps {
  readonly Content: ComponentType<{ components?: MDXComponents }>;
  readonly className?: string;
}

function LessonMdxArticle({ Content, className }: LessonMdxArticleProps) {
  const { isEnabled } = useMathGlossary();

  const activeComponents = useMemo<MDXComponents>(() => {
    if (!isEnabled) {
      return mdxComponents;
    }

    return {
      ...mdxComponents,
      p: (props: ComponentPropsWithoutRef<'p'>) => (
        <p {...props}>{annotateChildren(props.children)}</p>
      ),
      li: (props: ComponentPropsWithoutRef<'li'>) => (
        <li {...props}>{annotateChildren(props.children)}</li>
      ),
      td: (props: ComponentPropsWithoutRef<'td'>) => (
        <td className="border border-stone-200 px-3 py-2" {...props}>
          {annotateChildren(props.children)}
        </td>
      ),
      span: (props: ComponentPropsWithoutRef<'span'>) => {
        // Nếu thẻ span chứa công thức KaTeX
        if (typeof props.className === 'string' && props.className.includes('katex')) {
          const tex = extractLatexFromKatexNode(props);
          if (tex) {
            const entry = matchLatexToGlossary(tex);
            if (entry) {
              return (
                <MathGlossaryTerm entry={entry}>
                  <span {...props} />
                </MathGlossaryTerm>
              );
            }
          }
        }
        return <span {...props} />;
      },
    };
  }, [isEnabled]);

  return (
    <>
      <article className={cn('lu-prose max-w-none', className)}>
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
}: LessonMdxViewProps) {
  return (
    <TooltipProvider>
      <LessonProvider lessonMeta={lessonMeta} bibliography={bibliography}>
        <MathGlossaryProvider>
          <LessonMdxArticle Content={Content} className={className} />
        </MathGlossaryProvider>
      </LessonProvider>
    </TooltipProvider>
  );
}
