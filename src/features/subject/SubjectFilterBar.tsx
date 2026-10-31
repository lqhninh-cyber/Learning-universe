import { Filter, RotateCcw, Search } from 'lucide-react';
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
  const hasActiveFilter =
    searchQuery.trim().length > 0 || selectedLevel !== 'all' || selectedTag !== null;

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
            className="focus:border-subject-500 h-10 w-full rounded-xl border border-stone-200 bg-stone-50/70 pr-4 pl-10 text-sm text-stone-900 transition-colors placeholder:text-stone-400 focus:bg-white focus:outline-none"
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
                    ? 'bg-subject-600 text-white'
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
              <span>Chủ đề:</span>
            </span>
            {availableTags.map((tag) => {
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
                      ? 'border-subject-300 bg-subject-100 text-subject-900 border'
                      : 'border border-stone-200/80 bg-stone-50 text-stone-600 hover:bg-stone-100',
                  )}
                >
                  #{tag}
                </button>
              );
            })}
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
