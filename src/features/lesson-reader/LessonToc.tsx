import type { LessonMeta } from '@schemas/index';
import { BookMarked, ListTree } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/cn';

export interface LessonTocProps {
  readonly lessonMeta: LessonMeta | null;
  readonly onSelectAnchor?: () => void;
  readonly className?: string;
}

export function LessonToc({ lessonMeta, onSelectAnchor, className }: LessonTocProps) {
  const headings = useMemo(() => lessonMeta?.headings ?? [], [lessonMeta?.headings]);
  const blocks = useMemo(() => lessonMeta?.blocks ?? [], [lessonMeta?.blocks]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const allIds = [...headings.map((h) => h.id), ...blocks.map((b) => b.anchorId)];

    if (allIds.length === 0 || typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      // 140px threshold for sticky header and reading focus area
      const scrollY = window.scrollY + 140;
      let current = '';

      for (const id of allIds) {
        const element = document.getElementById(id);
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollY) {
            current = id;
          }
        }
      }

      if (current) {
        setActiveId(current);
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [headings, blocks]);

  const handleAnchorClick = (id: string) => {
    setActiveId(id);
    onSelectAnchor?.();
  };

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
          <ul className="space-y-1.5 border-l border-stone-200 pl-2">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              return (
                <li
                  key={heading.id}
                  className={cn('transition-all', heading.depth === 3 && 'pl-2.5')}
                >
                  <a
                    href={`#${heading.id}`}
                    onClick={() => handleAnchorClick(heading.id)}
                    className={cn(
                      'block rounded-md px-2 py-1 leading-snug transition-all',
                      isActive
                        ? 'bg-subject-100/90 text-subject-950 border-subject-600 border-l-2 font-semibold shadow-2xs'
                        : 'text-stone-600 hover:bg-stone-100/70 hover:text-stone-900',
                    )}
                  >
                    {heading.text}
                  </a>
                </li>
              );
            })}
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
            {blocks.map((block) => {
              const isActive = activeId === block.anchorId;
              return (
                <li key={block.anchorId}>
                  <a
                    href={`#${block.anchorId}`}
                    onClick={() => handleAnchorClick(block.anchorId)}
                    className={cn(
                      'group block rounded-lg border px-2.5 py-1.5 transition-all',
                      isActive
                        ? 'border-subject-400 bg-subject-100/90 text-subject-950 font-semibold shadow-xs'
                        : 'hover:border-subject-200 hover:bg-subject-50/50 border-stone-200/70 bg-stone-50/70 text-stone-700',
                    )}
                  >
                    <span
                      className={cn(
                        'block',
                        isActive
                          ? 'text-subject-950 font-bold'
                          : 'text-subject-800 group-hover:text-subject-950 font-semibold',
                      )}
                    >
                      {block.label}
                    </span>
                    {block.title && (
                      <span className="block truncate text-[11px] text-stone-500">
                        {block.title}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
