import type { LessonMeta } from '@schemas/index';
import { BookMarked, ChevronRight, ListTree } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { MathRenderer } from '@/content-runtime';
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
  const [activeTab, setActiveTab] = useState<'toc' | 'theorems'>('toc');

  const hasHeadings = headings.length > 0;
  const hasBlocks = blocks.length > 0;

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

    let observer: IntersectionObserver | null = null;
    if (typeof window.IntersectionObserver === 'function') {
      const visibleIds = new Set<string>();
      observer = new window.IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const targetId = entry.target.id;
            if (!targetId) continue;
            if (entry.isIntersecting) {
              visibleIds.add(targetId);
            } else {
              visibleIds.delete(targetId);
            }
          }
          const firstVisible = allIds.find((id) => visibleIds.has(id));
          if (firstVisible) {
            setActiveId(firstVisible);
          }
        },
        {
          rootMargin: '-80px 0px -65% 0px',
          threshold: [0, 1],
        },
      );

      for (const id of allIds) {
        const element = document.getElementById(id);
        if (element) {
          observer.observe(element);
        }
      }
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer?.disconnect();
    };
  }, [headings, blocks]);

  const handleAnchorClick = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setActiveId(id);
    if (typeof document !== 'undefined') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (typeof window !== 'undefined' && window.history?.pushState) {
          window.history.pushState(null, '', `#${id}`);
        }
      }
    }
    onSelectAnchor?.();
  };

  if (!hasHeadings && !hasBlocks) {
    return null;
  }

  return (
    <nav
      aria-label="Mục lục bài học"
      className={cn(
        'rounded-2xl border border-stone-200/70 bg-white/80 p-3 shadow-xs backdrop-blur transition-all duration-200',
        className,
      )}
    >
      {/* Thanh tab chuyển đổi Mục lục / Định nghĩa & Định lý */}
      {hasHeadings && hasBlocks && (
        <div
          className="mb-3.5 flex items-center rounded-xl border border-stone-200/70 bg-stone-100/80 p-1"
          role="tablist"
          aria-label="Tùy chọn mục lục bài học"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'toc'}
            onClick={() => setActiveTab('toc')}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-all',
              activeTab === 'toc'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:bg-white/60 hover:text-stone-900',
            )}
          >
            <span aria-hidden="true">📑</span>
            <span>Mục lục</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'theorems'}
            onClick={() => setActiveTab('theorems')}
            className={cn(
              'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-all',
              activeTab === 'theorems'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:bg-white/60 hover:text-stone-900',
            )}
          >
            <span aria-hidden="true">🔖</span>
            <span className="truncate">Định lý ({blocks.length})</span>
          </button>
        </div>
      )}

      {/* TAB 1: Danh sách đề mục H1, H2, H3 */}
      {(activeTab === 'toc' || !hasBlocks) && hasHeadings && (
        <div className="space-y-2">
          {!hasBlocks && (
            <div className="flex items-center gap-1.5 px-1 py-1 text-xs font-semibold tracking-wide text-stone-700 uppercase">
              <ListTree className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
              <span>Mục lục bài học</span>
            </div>
          )}
          <ul className="custom-scrollbar max-h-[calc(100vh-12rem)] space-y-1 overflow-y-auto pr-1 text-[14px]">
            {headings.map((heading) => {
              const isActive = activeId === heading.id;
              return (
                <li
                  key={heading.id}
                  className={cn('transition-all', heading.depth === 3 && 'pl-2.5')}
                >
                  <a
                    href={`#${heading.id}`}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={(e) => handleAnchorClick(e, heading.id)}
                    className={cn(
                      'group flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 text-[14px] leading-snug transition-all',
                      isActive
                        ? 'bg-stone-200/60 font-medium text-stone-900'
                        : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900',
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        'mt-0.5 h-3 w-3 shrink-0 transition-transform',
                        isActive
                          ? 'translate-x-0.5 text-stone-900'
                          : 'text-stone-400 group-hover:text-stone-600',
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1">
                      <MathRenderer content={heading.text} inline />
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* TAB 2: Danh sách Định nghĩa, Định lý, Hệ quả, Ví dụ */}
      {(activeTab === 'theorems' || !hasHeadings) && hasBlocks && (
        <div className="space-y-2">
          {!hasHeadings && (
            <div className="flex items-center gap-1.5 px-1 py-1 text-xs font-semibold tracking-wide text-stone-700 uppercase">
              <BookMarked className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
              <span>Định nghĩa & Định lý ({blocks.length})</span>
            </div>
          )}
          <ul className="custom-scrollbar max-h-[calc(100vh-12rem)] space-y-1.5 overflow-y-auto pr-1 text-[14px]">
            {blocks.map((block) => {
              const isActive = activeId === block.anchorId;
              return (
                <li key={block.anchorId}>
                  <a
                    href={`#${block.anchorId}`}
                    aria-current={isActive ? 'location' : undefined}
                    onClick={(e) => handleAnchorClick(e, block.anchorId)}
                    className={cn(
                      'group block rounded-lg border px-2.5 py-1.5 text-[14px] leading-snug transition-all',
                      isActive
                        ? 'border-stone-300 bg-stone-200/60 font-medium text-stone-900'
                        : 'border-stone-200/70 bg-stone-50/60 text-stone-700 hover:border-stone-300 hover:bg-stone-100/70',
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
                      <MathRenderer content={block.label} inline />
                    </span>
                    {block.title && (
                      <span className="block truncate text-xs text-stone-500">
                        <MathRenderer content={block.title} inline />
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
