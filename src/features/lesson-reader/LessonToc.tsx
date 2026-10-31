import type { LessonMeta } from '@schemas/index';
import { BookMarked, ListTree } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface LessonTocProps {
  readonly lessonMeta: LessonMeta | null;
  readonly onSelectAnchor?: () => void;
  readonly className?: string;
}

export function LessonToc({ lessonMeta, onSelectAnchor, className }: LessonTocProps) {
  const headings = lessonMeta?.headings ?? [];
  const blocks = lessonMeta?.blocks ?? [];

  if (headings.length === 0 && blocks.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Mục lục bài học" className={cn('space-y-6 text-xs', className)}>
      {headings.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 font-semibold tracking-wide text-stone-700 uppercase">
            <ListTree className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
            <span>Mục lục bài học</span>
          </div>
          <ul className="space-y-1.5 border-l border-stone-200 pl-3">
            {headings.map((heading) => (
              <li key={heading.id} className={cn(heading.depth === 3 && 'pl-3')}>
                <a
                  href={`#${heading.id}`}
                  onClick={onSelectAnchor}
                  className="hover:text-subject-700 block py-0.5 leading-snug text-stone-600 transition-colors"
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {blocks.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 font-semibold tracking-wide text-stone-700 uppercase">
            <BookMarked className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
            <span>Định nghĩa & Định lý ({blocks.length})</span>
          </div>
          <ul className="space-y-1.5">
            {blocks.map((block) => (
              <li key={block.anchorId}>
                <a
                  href={`#${block.anchorId}`}
                  onClick={onSelectAnchor}
                  className="group hover:border-subject-200 hover:bg-subject-50/50 block rounded-lg border border-stone-200/70 bg-stone-50/70 px-2.5 py-1.5 transition-colors"
                >
                  <span className="text-subject-800 group-hover:text-subject-950 font-semibold">
                    {block.label}
                  </span>
                  {block.title && (
                    <span className="block truncate text-[11px] text-stone-500">{block.title}</span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
