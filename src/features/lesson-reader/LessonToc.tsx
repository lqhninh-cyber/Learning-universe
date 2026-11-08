import type { LessonMeta } from '@schemas/index';
import { BookMarked, ChevronRight, ListTree } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { MathRenderer } from '@/content-runtime';
import { cn } from '@/shared/lib/cn';

export interface LessonTocProps {
  readonly lessonMeta: LessonMeta | null;
  readonly onSelectAnchor?: () => void;
  readonly readingTheme?: 'light' | 'dark';
  readonly className?: string;
}

export function LessonToc({
  lessonMeta,
  onSelectAnchor,
  readingTheme: propTheme,
  className,
}: LessonTocProps) {
  const headings = useMemo(() => lessonMeta?.headings ?? [], [lessonMeta?.headings]);
  const blocks = useMemo(() => lessonMeta?.blocks ?? [], [lessonMeta?.blocks]);
  const [activeId, setActiveId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'toc' | 'theorems'>('toc');

  const [internalTheme, setInternalTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light') return saved;
      } catch {
        // Bỏ qua lỗi storage
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (propTheme) return;
    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<'light' | 'dark'>;
      if (custom.detail === 'light' || custom.detail === 'dark') {
        setInternalTheme(custom.detail);
      } else {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light') {
          setInternalTheme(saved);
        }
      }
    };
    window.addEventListener('lu_reading_theme_change', handleThemeChange);
    return () => window.removeEventListener('lu_reading_theme_change', handleThemeChange);
  }, [propTheme]);

  const activeTheme = propTheme ?? internalTheme;
  const isDark = activeTheme === 'dark';

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
        'rounded-2xl p-3 transition-all duration-200',
        isDark
          ? 'border border-[#2A323A] bg-[#181C20] text-[#E2E8F0] shadow-none'
          : 'border border-[#CFDADB] bg-[#E1E9EA]/80 text-[#29383D] shadow-xs backdrop-blur',
        className,
      )}
    >
      {/* Thanh tab chuyển đổi Mục lục / Định nghĩa & Định lý */}
      {hasHeadings && hasBlocks && (
        <div
          className={cn(
            'mb-3.5 flex items-center rounded-xl border p-1',
            isDark ? 'border-[#2A323A] bg-[#14171A]' : 'border-[#CFDADB] bg-[#E1E9EA]',
          )}
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
                ? isDark
                  ? 'bg-[#242C33] text-[#F8FAFC]'
                  : 'bg-[#F7FAFA] text-[#29383D] shadow-2xs'
                : isDark
                  ? 'text-[#94A3B8] hover:bg-[#20252B] hover:text-[#F8FAFC]'
                  : 'text-[#55676B] hover:bg-white/60 hover:text-[#29383D]',
            )}
          >
            <ListTree className="h-3.5 w-3.5" aria-hidden="true" />
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
                ? isDark
                  ? 'bg-[#242C33] text-[#F8FAFC]'
                  : 'bg-[#F7FAFA] text-[#29383D] shadow-2xs'
                : isDark
                  ? 'text-[#94A3B8] hover:bg-[#20252B] hover:text-[#F8FAFC]'
                  : 'text-[#55676B] hover:bg-white/60 hover:text-[#29383D]',
            )}
          >
            <BookMarked className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="truncate">Định lý ({blocks.length})</span>
          </button>
        </div>
      )}

      {/* TAB 1: Danh sách đề mục H1, H2, H3 */}
      {(activeTab === 'toc' || !hasBlocks) && hasHeadings && (
        <div className="space-y-2">
          {!hasBlocks && (
            <div
              className={cn(
                'flex items-center gap-1.5 px-1 py-1 font-mono text-xs uppercase',
                isDark ? 'text-[#94A3B8]' : 'font-semibold tracking-wide text-[#29383D]',
              )}
            >
              <ListTree
                className={cn('h-3.5 w-3.5', isDark ? 'text-[#94A3B8]' : 'text-subject-600')}
                aria-hidden="true"
              />
              <span>MỤC LỤC BÀI HỌC</span>
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
                      isDark
                        ? isActive
                          ? 'bg-[#242C33] font-medium text-[#F8FAFC]'
                          : 'text-[#94A3B8] hover:bg-[#20252B] hover:text-[#F8FAFC]'
                        : isActive
                          ? 'bg-[#D7E1E2] font-medium text-[#29383D]'
                          : 'text-[#55676B] hover:bg-white/60 hover:text-[#29383D]',
                    )}
                  >
                    <ChevronRight
                      className={cn(
                        'mt-0.5 h-3 w-3 shrink-0 transition-transform',
                        isDark
                          ? isActive
                            ? 'translate-x-0.5 text-[#F8FAFC]'
                            : 'text-[#94A3B8]/60 group-hover:text-[#F8FAFC]'
                          : isActive
                            ? 'translate-x-0.5 text-[#29383D]'
                            : 'text-[#55676B]/60 group-hover:text-[#29383D]',
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
            <div
              className={cn(
                'flex items-center gap-1.5 px-1 py-1 font-mono text-xs uppercase',
                isDark ? 'text-[#94A3B8]' : 'font-semibold tracking-wide text-[#29383D]',
              )}
            >
              <BookMarked
                className={cn('h-3.5 w-3.5', isDark ? 'text-[#94A3B8]' : 'text-subject-600')}
                aria-hidden="true"
              />
              <span>Định nghĩa &amp; Định lý ({blocks.length})</span>
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
                      isDark
                        ? isActive
                          ? 'border-[#C89738] bg-[#242C33] font-medium text-[#F8FAFC]'
                          : 'border-[#2A323A] bg-[#14171A] text-[#94A3B8] hover:border-[#C89738] hover:bg-[#20252B]'
                        : isActive
                          ? 'border-[#71889A] bg-[#D7E1E2] font-medium text-[#29383D]'
                          : 'border-[#CFDADB] bg-[#F7FAFA]/80 text-[#55676B] hover:border-[#71889A] hover:bg-[#F7FAFA]',
                    )}
                  >
                    <span
                      className={cn(
                        'block',
                        isDark
                          ? isActive
                            ? 'font-bold text-[#F8FAFC]'
                            : 'font-semibold text-[#CBD5E1] group-hover:text-white'
                          : isActive
                            ? 'text-subject-950 font-bold'
                            : 'text-subject-800 group-hover:text-subject-950 font-semibold',
                      )}
                    >
                      <MathRenderer content={block.label} inline />
                    </span>
                    {block.title && (
                      <span
                        className={cn(
                          'block truncate text-xs',
                          isDark ? 'text-[#94A3B8]' : 'text-[#55676B]',
                        )}
                      >
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
