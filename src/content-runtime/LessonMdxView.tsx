import type { MDXComponents } from 'mdx/types';
import type { ComponentType } from 'react';
import type { BibliographyEntry, LessonMeta } from '@schemas/index';
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

/**
 * Khung kết xuất chuẩn cho một bài học MDX:
 * bọc `TooltipProvider`, `LessonProvider` và lớp typography `.lu-prose`.
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
        <article className={cn('lu-prose max-w-none', className)}>
          <Content components={mdxComponents} />
        </article>
      </LessonProvider>
    </TooltipProvider>
  );
}
