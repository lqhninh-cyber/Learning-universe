import { ChevronDown, ChevronUp, Filter, RotateCcw, Search } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui';

export type LessonLevelFilter = 'all' | 'basic' | 'intermediate' | 'advanced';

export interface SubjectFilterBarProps {
  readonly searchQuery: string;
  readonly onSearchChange: (value: string) => void;
  readonly selectedLevel: LessonLevelFilter;
  readonly onLevelChange: (level: LessonLevelFilter) => void;
  readonly selectedTag: string | null;
  readonly onTagChange: (tag: string | null) => void;
  readonly availableTags: readonly string[];
  readonly shownCount: number;
  readonly totalCount: number;
  readonly onReset: () => void;
}

const LEVEL_OPTIONS: ReadonlyArray<{ readonly value: LessonLevelFilter; readonly label: string }> =
  [
    { value: 'all', label: 'Tất cả mức độ' },
    { value: 'basic', label: 'Cơ bản' },
    { value: 'intermediate', label: 'Trung bình' },
    { value: 'advanced', label: 'Nâng cao' },
  ];

export function SubjectFilterBar({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  selectedTag,
  onTagChange,
  availableTags,
  shownCount,
  totalCount,
  onReset,
}: SubjectFilterBarProps) {
  const [isTagsExpanded, setIsTagsExpanded] = useState(false);
  const MAX_VISIBLE_TAGS = 10;

  const hasActiveFilter =
    searchQuery.trim().length > 0 || selectedLevel !== 'all' || selectedTag !== null;

  const visibleTags = (() => {
    if (isTagsExpanded || availableTags.length <= MAX_VISIBLE_TAGS) {
      return availableTags;
    }
    const top = availableTags.slice(0, MAX_VISIBLE_TAGS);
    if (selectedTag && !top.includes(selectedTag)) {
      return [...top, selectedTag];
    }
    return top;
  })();

  const hiddenCount = availableTags.length - MAX_VISIBLE_TAGS;

  return (
    <section
      aria-label="Bộ lọc và phân loại bài học"
      className="space-y-4 rounded-2xl border border-stone-200/90 bg-white p-4 shadow-2xs sm:p-5"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Lọc bài học theo tên, khái niệm hoặc từ khóa trong môn..."
            aria-label="Lọc bài học trong môn"
            className="h-10 w-full rounded-xl border border-stone-200 bg-stone-50/70 pr-4 pl-10 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:border-[var(--subject-accent-border,#6E6B7B)] focus:bg-white focus:outline-none"
          />
        </div>

        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Lọc theo mức độ bài học"
        >
          {LEVEL_OPTIONS.map((option) => {
            const active = selectedLevel === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onLevelChange(option.value)}
                aria-pressed={active}
                className={cn(
                  'cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  active
                    ? 'bg-[var(--subject-accent-ink,#4338CA)] text-white shadow-2xs'
                    : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 inline-flex items-center gap-1 text-xs font-medium text-stone-500">
              <Filter className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Chủ đề phổ biến:</span>
            </span>
            {visibleTags.map((tag) => {
              const active = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagChange(active ? null : tag)}
                  aria-pressed={active}
                  className={cn(
                    'cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                    active
                      ? 'border border-[var(--subject-accent-border,#A5B4FC)] bg-[var(--subject-accent-soft,#E0E7FF)] font-semibold text-[var(--subject-accent-ink,#312E81)]'
                      : 'border border-stone-200/80 bg-stone-50 text-stone-600 hover:bg-stone-100',
                  )}
                >
                  #{tag}
                </button>
              );
            })}
            {availableTags.length > MAX_VISIBLE_TAGS && (
              <button
                type="button"
                onClick={() => setIsTagsExpanded((prev) => !prev)}
                aria-expanded={isTagsExpanded}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-dashed border-stone-300 bg-white px-2 py-1 text-xs font-medium text-stone-600 transition-colors hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900"
              >
                {isTagsExpanded ? (
                  <>
                    <span>Thu gọn</span>
                    <ChevronUp className="h-3 w-3" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <span>+{hiddenCount} chủ đề khác</span>
                    <ChevronDown className="h-3 w-3" aria-hidden="true" />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span>
              Hiển thị <strong className="font-semibold text-stone-800">{shownCount}</strong> /{' '}
              {totalCount} bài học
            </span>
            {hasActiveFilter && (
              <Button variant="ghost" size="sm" onClick={onReset} className="h-7 px-2 text-xs">
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Xóa bộ lọc</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
