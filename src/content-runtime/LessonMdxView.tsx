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
import { SidenoteProvider } from '@/shared/components/Sidenote';
import { TooltipProvider } from '@/shared/ui';
import { LessonProvider } from './LessonContext';
import { mdxComponents } from './mdx-components';

function KatexDisplayBlock({
  spanProps,
}: {
  readonly spanProps: ComponentPropsWithoutRef<'span'>;
}) {
  return (
    <span className="my-4 block overflow-x-auto rounded-xl bg-[var(--bg-subtle)]/60 px-5 py-1.5 transition-colors duration-200">
      <span {...spanProps} />
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
          className="border-b border-stone-200/60 px-4 py-3 text-left text-[14.5px] leading-relaxed text-stone-800 transition-colors dark:border-b dark:border-[#152B20] dark:text-[#E8F1EC] [&_.katex]:text-stone-900 dark:[&_.katex]:text-[#F5F2EB] [&:first-child]:font-semibold dark:[&:first-child]:text-[#739B88]"
          {...props}
        >
          {annotateChildren(props.children, currentCourseId)}
        </td>
      ),
      span: (props: ComponentPropsWithoutRef<'span'>) => {
        if (typeof props.className === 'string' && props.className.includes('katex-display')) {
          return <KatexDisplayBlock spanProps={props} />;
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
