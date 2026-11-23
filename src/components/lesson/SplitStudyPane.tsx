import type { LessonMeta } from '@schemas/index';
import { ArrowUpRight, BookMarked, ListTree, Search, Sparkles, X } from 'lucide-react';
import { type MouseEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { MathRenderer } from '@/content-runtime';
import { getBacklinkTermIdsForLesson } from '@/data/glossaryBacklinks';
import {
  buildExerciseStorageKey,
  useLearningStore,
  type ExercisePracticeStatus,
} from '@/features/learning';
import {
  getAllGlossaryEntries,
  InlineMathText,
  KatexMath,
  type MathGlossaryEntry,
  type MathGlossarySubject,
} from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery, stripDiacritics } from '@/shared/lib/vietnamese';

export type SplitStudyTab = 'toc' | 'glossary';

export interface SplitStudyPaneProps {
  readonly lessonId?: string;
  readonly lessonTitle: string;
  readonly lessonDescription?: string;
  readonly subjectSlug: string;
  readonly lessonMeta: LessonMeta | null;
  readonly activeTab: SplitStudyTab;
  readonly onTabChange: (tab: SplitStudyTab) => void;
  readonly onClose?: () => void;
  readonly onSelectAnchor?: () => void;
  readonly className?: string;
}

function mapSubjectSlugToGlossarySubject(slug: string): MathGlossarySubject | null {
  if (slug === 'cau-truc-dai-so' || slug === 'algebraic-structures') return 'cau-truc-dai-so';
  if (slug === 'hinh-hoc-affine' || slug === 'affine-geometry') return 'hinh-hoc-affine';
  if (slug === 'giai-tich-ham-mot-bien' || slug === 'single-variable-calculus') {
    return 'giai-tich-ham-mot-bien';
  }
  if (slug === 'giao-duc-hoc' || slug === 'pedagogy') return 'giao-duc-hoc';
  return null;
}

function getBlockKindBadge(name: string): { readonly label: string; readonly accentClass: string } {
  if (name === 'Definition') {
    return {
      label: 'Định nghĩa',
      accentClass: 'bg-[var(--bg-workspace)] text-[var(--accent-heritage)]',
    };
  }
  if (
    name === 'Theorem' ||
    name === 'Proposition' ||
    name === 'Lemma' ||
    name === 'Corollary' ||
    name === 'Property'
  ) {
    return {
      label: 'Định lý',
      accentClass: 'bg-[var(--accent-os)]/10 text-[var(--accent-os)]',
    };
  }
  if (name === 'Exercise') {
    return {
      label: 'Bài tập',
      accentClass: 'bg-[#1B5E4A]/12 text-[#1B5E4A] dark:bg-[#52B394]/15 dark:text-[#52B394]',
    };
  }
  return {
    label: 'Ví dụ',
    accentClass: 'bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
  };
}

/**
 * Ngăn kéo học tập chia đôi 2 Tab (Split-Pane Study Drawer) cho Academic OS:
 * 1. Mục lục: Scroll-Spy đề mục + Tóm tắt Định lý / Định nghĩa / Bài tập kèm tiến độ tự luyện.
 * 2. Thuật ngữ: Lọc ngữ cảnh theo môn & từ khóa xuất hiện trong bài, hỗ trợ tìm không dấu tiếng Việt.
 */
export function SplitStudyPane({
  lessonId,
  lessonTitle,
  lessonDescription = '',
  subjectSlug,
  lessonMeta,
  activeTab,
  onTabChange,
  onClose,
  onSelectAnchor,
  className,
}: SplitStudyPaneProps) {
  const headings = useMemo(() => lessonMeta?.headings ?? [], [lessonMeta?.headings]);
  const blocks = useMemo(() => lessonMeta?.blocks ?? [], [lessonMeta?.blocks]);
  const exerciseStatusMap = useLearningStore((state) => state.exerciseStatus);
  const [onlyReviewExercises, setOnlyReviewExercises] = useState(false);

  const exerciseStats = useMemo(() => {
    const effectiveLessonId = lessonId ?? 'standalone-lesson';
    const exerciseBlocks = blocks.filter((b) => b.name === 'Exercise');
    let done = 0;
    let review = 0;
    for (const block of exerciseBlocks) {
      const exId = block.anchorId || block.id || `exercise-${block.number}`;
      const st: ExercisePracticeStatus =
        exerciseStatusMap[buildExerciseStorageKey(effectiveLessonId, exId)] ?? 'todo';
      if (st === 'done') done += 1;
      else if (st === 'review') review += 1;
    }
    return { total: exerciseBlocks.length, done, review };
  }, [blocks, exerciseStatusMap, lessonId]);

  const visibleBlocks = useMemo(() => {
    if (!onlyReviewExercises) return blocks;
    const effectiveLessonId = lessonId ?? 'standalone-lesson';
    return blocks.filter((block) => {
      if (block.name !== 'Exercise') return false;
      const exId = block.anchorId || block.id || `exercise-${block.number}`;
      return (
        (exerciseStatusMap[buildExerciseStorageKey(effectiveLessonId, exId)] ?? 'todo') === 'review'
      );
    });
  }, [blocks, exerciseStatusMap, lessonId, onlyReviewExercises]);

  // --- 1. Scroll-Spy cho Tab Mục lục ---
  const [activeAnchorId, setActiveAnchorId] = useState<string>('');

  useEffect(() => {
    const allIds = [...headings.map((h) => h.id), ...blocks.map((b) => b.anchorId)];
    if (allIds.length === 0 || typeof window === 'undefined') return;

    const firstId = allIds[0] ?? '';
    const lastId = allIds[allIds.length - 1] ?? firstId;

    // Xác định mục đang hiển thị bằng IntersectionObserver (tránh getBoundingClientRect lặp trên mọi frame cuộn)
    let observer: IntersectionObserver | null = null;
    if (typeof window.IntersectionObserver === 'function') {
      const visible = new Set<string>();
      observer = new window.IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const targetId = entry.target.id;
            if (!targetId) continue;
            if (entry.isIntersecting) visible.add(targetId);
            else visible.delete(targetId);
          }
          const firstVisible = allIds.find((id) => visible.has(id));
          if (firstVisible) {
            setActiveAnchorId(firstVisible);
          }
        },
        { rootMargin: '-64px 0px -65% 0px', threshold: [0, 1] },
      );
      for (const id of allIds) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
    }

    // Fallback siêu nhẹ được throttle bằng requestAnimationFrame chỉ xử lý mép đầu / mép cuối trang
    let edgeRafId = 0;
    const syncBoundaryEdges = () => {
      edgeRafId = 0;
      const scrollY = window.scrollY;
      if (scrollY <= 32) {
        if (firstId) setActiveAnchorId(firstId);
        return;
      }
      const docEl = document.documentElement;
      const maxScroll = docEl.scrollHeight - window.innerHeight;
      if (maxScroll > 0 && scrollY >= maxScroll - 32) {
        if (lastId) setActiveAnchorId(lastId);
      }
    };

    const onScrollEdge = () => {
      if (edgeRafId !== 0) return;
      edgeRafId = window.requestAnimationFrame(syncBoundaryEdges);
    };

    syncBoundaryEdges();
    window.addEventListener('scroll', onScrollEdge, { passive: true });

    return () => {
      if (edgeRafId !== 0) window.cancelAnimationFrame(edgeRafId);
      window.removeEventListener('scroll', onScrollEdge);
      observer?.disconnect();
    };
  }, [headings, blocks]);

  const handleAnchorClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    setActiveAnchorId(id);
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

  // --- 2. Ngữ cảnh Thuật ngữ cho Tab Thuật ngữ ---
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const [glossaryScope, setGlossaryScope] = useState<'subject' | 'all'>('subject');

  const glossarySubject = useMemo(
    () => mapSubjectSlugToGlossarySubject(subjectSlug),
    [subjectSlug],
  );
  const allGlossaryEntries = useMemo(() => getAllGlossaryEntries(), []);

  const backlinkOrderMap = useMemo(() => {
    const ids = getBacklinkTermIdsForLesson(lessonId);
    const map = new Map<string, number>();
    ids.forEach((id, idx) => map.set(id, idx));
    return map;
  }, [lessonId]);

  // Fallback tối giản chỉ khi thiếu lessonId (ví dụ trong unit test render độc lập)
  const fallbackHaystack = useMemo(() => {
    if (backlinkOrderMap.size > 0) return '';
    const raw = [
      lessonTitle,
      lessonDescription,
      ...headings.map((h) => h.text),
      ...blocks.map((b) => `${b.label} ${b.title ?? ''}`),
    ].join(' ');
    return stripDiacritics(raw).toLowerCase();
  }, [backlinkOrderMap.size, blocks, headings, lessonDescription, lessonTitle]);

  const contextualGlossary = useMemo(() => {
    const base =
      glossaryScope === 'subject' && glossarySubject
        ? allGlossaryEntries.filter((entry) => entry.subject === glossarySubject)
        : allGlossaryEntries;

    const scored = base
      .filter((entry) => {
        if (!glossaryQuery.trim()) return true;
        const searchable = `${entry.nameVi} ${entry.nameEn} ${entry.brief} ${entry.intuition} ${entry.patterns.join(' ')}`;
        return matchesVietnameseQuery(searchable, glossaryQuery);
      })
      .map((entry) => {
        const backlinkRank = backlinkOrderMap.get(entry.id);
        if (backlinkOrderMap.size > 0) {
          return {
            entry,
            hitInLesson: backlinkRank !== undefined,
            rank: backlinkRank ?? Number.POSITIVE_INFINITY,
          };
        }
        const normalizedName = stripDiacritics(entry.nameVi).toLowerCase();
        const hitInLesson =
          (normalizedName.length >= 3 && fallbackHaystack.includes(normalizedName)) ||
          entry.patterns.some((pat) => {
            const norm = stripDiacritics(pat).toLowerCase().trim();
            return norm.length >= 3 && fallbackHaystack.includes(norm);
          });
        return {
          entry,
          hitInLesson,
          rank: hitInLesson ? 0 : Number.POSITIVE_INFINITY,
        };
      })
      .sort((a, b) => {
        if (a.hitInLesson !== b.hitInLesson) return Number(b.hitInLesson) - Number(a.hitInLesson);
        return a.rank - b.rank;
      });

    return scored.slice(0, 24);
  }, [
    allGlossaryEntries,
    backlinkOrderMap,
    fallbackHaystack,
    glossaryQuery,
    glossaryScope,
    glossarySubject,
  ]);

  return (
    <div
      data-testid="split-study-pane"
      className={cn('flex h-full flex-col bg-[var(--bg-shell)] text-[var(--text-main)]', className)}
    >
      {/* Header + 2 Tab cân đối (Mục lục · Thuật ngữ) */}
      <div className="shrink-0 border-b border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 pt-2.5 pb-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
            Công cụ học tập
          </span>
          {onClose && (
            <button
              type="button"
              data-testid="split-pane-close-btn"
              onClick={onClose}
              aria-label="Đóng bảng chia đôi công cụ"
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div
          role="tablist"
          aria-label="Ngăn kéo công cụ học tập chia đôi"
          className="grid grid-cols-2 gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-shell)] p-1"
        >
          {(
            [
              { id: 'toc', label: 'Mục lục', Icon: ListTree, testId: 'split-tab-toc' },
              {
                id: 'glossary',
                label: 'Thuật ngữ',
                Icon: BookMarked,
                testId: 'split-tab-glossary',
              },
            ] as const
          ).map(({ id, label, Icon, testId }) => {
            const isSelected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                data-testid={testId}
                aria-selected={isSelected}
                onClick={() => onTabChange(id)}
                className={cn(
                  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
                  isSelected
                    ? 'bg-[var(--bg-workspace)] text-[var(--text-main)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nội dung từng Tab (cuộn siêu mảnh tiệp Dark/Light Mode) */}
      <div className="os-thin-scrollbar min-h-0 flex-1 overflow-y-auto p-3.5">
        {/* TAB 1: MỤC LỤC + TÓM TẮT ĐỊNH LÝ / ĐỊNH NGHĨA */}
        {activeTab === 'toc' && (
          <nav aria-label="Mục lục bài học" data-testid="split-panel-toc" className="space-y-5">
            {/* Danh sách đề mục (Scroll-Spy) */}
            <div className="space-y-1.5">
              <p className="px-1 font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                Đề mục bài giảng
              </p>
              {headings.length === 0 ? (
                <p className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 text-xs text-[var(--text-muted)]">
                  Bài học đang tải hoặc không có mục con.
                </p>
              ) : (
                <ul className="space-y-0.5 border-l border-[var(--border-hairline)]">
                  {headings.map((heading) => {
                    const isActive = activeAnchorId === heading.id;
                    return (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          onClick={(e) => handleAnchorClick(e, heading.id)}
                          className={cn(
                            '-ml-px block border-l-2 py-1.5 pr-2 text-xs leading-snug transition-colors',
                            heading.depth >= 3 ? 'pl-5' : 'pl-3',
                            isActive
                              ? 'border-[var(--accent-os)] bg-[var(--bg-workspace)] font-semibold text-[var(--text-main)]'
                              : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]',
                          )}
                        >
                          <MathRenderer content={heading.text} />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Tóm tắt Định lý / Định nghĩa / Bài tập trong bài */}
            <div className="space-y-2 border-t border-[var(--border-hairline)] pt-4">
              <div className="space-y-2 px-1">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <p className="font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                    Định nghĩa &amp; Định lý / Bài tập ({blocks.length})
                  </p>
                </div>

                {exerciseStats.total > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span
                      data-testid="split-exercise-progress"
                      className="inline-flex items-center gap-1 rounded-md border border-[#1B5E4A]/25 bg-[#1B5E4A]/10 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-[#1B5E4A] tabular-nums dark:border-[#52B394]/30 dark:bg-[#52B394]/15 dark:text-[#52B394]"
                    >
                      Bài tập: {exerciseStats.done}/{exerciseStats.total} đã giải
                    </span>

                    <button
                      type="button"
                      data-testid="split-exercise-filter-review"
                      aria-pressed={onlyReviewExercises}
                      onClick={() => setOnlyReviewExercises((prev) => !prev)}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] font-semibold transition-colors',
                        onlyReviewExercises
                          ? 'border-[#9E763B] bg-[#9E763B] text-white'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[#9E763B] hover:border-[#9E763B]/60 dark:text-[#D4AF6A]',
                      )}
                    >
                      <span>Cần xem lại ({exerciseStats.review})</span>
                    </button>
                  </div>
                )}
              </div>

              {visibleBlocks.length === 0 ? (
                <p className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 text-xs text-[var(--text-muted)]">
                  {onlyReviewExercises
                    ? 'Chưa có bài tập nào gắn cờ "Cần xem lại" trong bài này.'
                    : 'Chưa có khối định nghĩa hoặc định lý được đánh số trong bài này.'}
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {visibleBlocks.map((block) => {
                    const isActive = activeAnchorId === block.anchorId;
                    const badge = getBlockKindBadge(block.name);
                    const exId = block.anchorId || block.id || `exercise-${block.number}`;
                    const exStatus: ExercisePracticeStatus | null =
                      block.name === 'Exercise'
                        ? (exerciseStatusMap[
                            buildExerciseStorageKey(lessonId ?? 'standalone-lesson', exId)
                          ] ?? 'todo')
                        : null;
                    return (
                      <li key={block.anchorId}>
                        <a
                          href={`#${block.anchorId}`}
                          onClick={(e) => handleAnchorClick(e, block.anchorId)}
                          className={cn(
                            'block rounded-lg border px-3 py-2 text-xs transition-colors',
                            isActive
                              ? 'border-[var(--accent-os)] bg-[var(--bg-workspace)] text-[var(--text-main)]'
                              : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)]/80 text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]',
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex min-w-0 items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--text-main)]">
                              {exStatus !== null && (
                                <span
                                  aria-hidden="true"
                                  className={cn(
                                    'h-2 w-2 shrink-0 rounded-full',
                                    exStatus === 'done'
                                      ? 'bg-[#1B5E4A] dark:bg-[#52B394]'
                                      : exStatus === 'review'
                                        ? 'bg-[#9E763B] dark:bg-[#D4AF6A]'
                                        : 'bg-stone-300 dark:bg-stone-600',
                                  )}
                                />
                              )}
                              <span className="truncate">{block.label}</span>
                            </span>
                            <span
                              className={cn(
                                'shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-semibold',
                                badge.accentClass,
                              )}
                            >
                              {badge.label}
                            </span>
                          </div>
                          {block.title &&
                            block.title.toLowerCase() !== badge.label.toLowerCase() && (
                              <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-[var(--text-secondary)]">
                                <MathRenderer content={block.title} />
                              </p>
                            )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </nav>
        )}

        {/* TAB 2: THUẬT NGỮ NGỮ CẢNH */}
        {activeTab === 'glossary' && (
          <div data-testid="split-panel-glossary" className="space-y-3">
            <div className="space-y-2">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  data-testid="split-glossary-search"
                  value={glossaryQuery}
                  onChange={(e) => setGlossaryQuery(e.target.value)}
                  placeholder="Tra nhanh thuật ngữ (không dấu)..."
                  aria-label="Tra nhanh thuật ngữ trong bài"
                  className="h-8 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] pr-7 pl-8 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-os)] focus:outline-none"
                />
                {glossaryQuery && (
                  <button
                    type="button"
                    onClick={() => setGlossaryQuery('')}
                    aria-label="Xóa từ khóa thuật ngữ"
                    className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-main)]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setGlossaryScope('subject')}
                    className={cn(
                      'cursor-pointer rounded px-2 py-0.5 font-medium transition-colors',
                      glossaryScope === 'subject'
                        ? 'bg-[var(--accent-os)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                    )}
                  >
                    Môn hiện tại
                  </button>
                  <button
                    type="button"
                    onClick={() => setGlossaryScope('all')}
                    className={cn(
                      'cursor-pointer rounded px-2 py-0.5 font-medium transition-colors',
                      glossaryScope === 'all'
                        ? 'bg-[var(--accent-os)] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                    )}
                  >
                    Toàn kho
                  </button>
                </div>

                <Link
                  to={ROUTES.glossary}
                  className="inline-flex items-center gap-1 font-mono text-[10.5px] font-semibold text-[var(--accent-os)] hover:underline"
                >
                  <span>Mở Kho Thuật ngữ</span>
                  <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {contextualGlossary.length === 0 ? (
              <p className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 text-center text-xs text-[var(--text-muted)]">
                Không tìm thấy thuật ngữ phù hợp. Thử chuyển sang &ldquo;Toàn kho&rdquo;.
              </p>
            ) : (
              <div className="space-y-2.5">
                {contextualGlossary.map(({ entry, hitInLesson }) => (
                  <GlossarySplitCard key={entry.id} entry={entry} hitInLesson={hitInLesson} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GlossarySplitCard({
  entry,
  hitInLesson,
}: {
  readonly entry: MathGlossaryEntry;
  readonly hitInLesson: boolean;
}) {
  return (
    <article
      data-testid={`split-glossary-card-${entry.id}`}
      className="space-y-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 transition-colors hover:border-[var(--accent-os)]/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <h4 className="font-serif text-xs font-bold text-[var(--text-main)]">{entry.nameVi}</h4>
            {hitInLesson && (
              <span className="inline-flex items-center gap-0.5 rounded bg-[var(--accent-os)]/10 px-1.5 py-0.5 font-mono text-[9.5px] font-semibold text-[var(--accent-os)]">
                <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
                <span>Có trong bài này</span>
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--text-muted)]">{entry.nameEn}</p>
        </div>

        <span className="max-w-[120px] shrink-0 overflow-x-auto rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[11px] text-[var(--text-main)]">
          <KatexMath math={entry.formula || entry.symbol} />
        </span>
      </div>

      <p className="text-[11.5px] leading-relaxed text-[var(--text-secondary)]">
        <strong className="font-semibold text-[var(--text-main)]">Bản chất: </strong>
        <InlineMathText text={entry.brief} />
      </p>

      {entry.intuition && (
        <p className="rounded border-l-2 border-[var(--accent-heritage)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[11px] leading-relaxed text-[var(--text-secondary)]">
          <strong className="font-semibold text-[var(--accent-heritage)]">Trực quan: </strong>
          <InlineMathText text={entry.intuition} />
        </p>
      )}

      <div className="flex justify-end pt-0.5">
        <Link
          to={`${ROUTES.glossary}?q=${encodeURIComponent(entry.nameVi)}`}
          className="inline-flex items-center gap-1 font-mono text-[10.5px] font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--accent-os)]"
        >
          <span>Mở trong Kho Thuật ngữ</span>
          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
