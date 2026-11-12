import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import type { ReadingTheme } from '@/context/ReadingSettingsContext';
import { cn } from '@/shared/lib/cn';

export interface InPageSearchNavigatorProps {
  readonly query: string;
  readonly totalMatches: number;
  readonly activeIndex: number;
  readonly onPrev: () => void;
  readonly onNext: () => void;
  readonly onClear: () => void;
  readonly readingTheme?: ReadingTheme;
  readonly className?: string;
}

/**
 * Thanh duyệt kết quả tìm kiếm tại chỗ (`[i / N kết quả] [‹ Trước] [Sau ›] [× Xóa highlight]`).
 */
export function InPageSearchNavigator({
  query,
  totalMatches,
  activeIndex,
  onPrev,
  onNext,
  onClear,
  readingTheme = 'light',
  className,
}: InPageSearchNavigatorProps) {
  if (!query.trim()) {
    return null;
  }

  const isDark = readingTheme === 'dark';
  const counterLabel =
    totalMatches > 0 ? `${activeIndex + 1} / ${totalMatches} kết quả` : '0 / 0 kết quả';

  return (
    <div
      data-inpage-nav="true"
      role="region"
      aria-label="Thanh duyệt kết quả tìm kiếm trong trang"
      className={cn(
        'sticky top-20 z-30 mb-5 flex flex-wrap items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2.5 shadow-sm backdrop-blur-md transition-colors',
        isDark
          ? 'border-[#334155] bg-[#161B22]/95 text-[#E2E8F0]'
          : 'border-amber-300/80 bg-[#FFFDF6]/95 text-[#1C2430]',
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-medium',
            isDark ? 'bg-amber-500/15 text-amber-200' : 'bg-[#FFE08A]/70 text-[#1C2430]',
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="max-w-[180px] truncate sm:max-w-[260px]">&ldquo;{query}&rdquo;</span>
        </span>

        <span
          data-testid="inpage-search-counter"
          className={cn(
            'rounded-md px-2 py-0.5 font-mono text-xs font-semibold',
            isDark ? 'bg-[#1E293B] text-[#E2E8F0]' : 'bg-stone-100 text-stone-800',
          )}
        >
          {counterLabel}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={onPrev}
          disabled={totalMatches === 0}
          aria-label="Kết quả trước"
          className={cn(
            'inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45',
            isDark
              ? 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] hover:bg-[#334155]'
              : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-100',
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Trước</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={totalMatches === 0}
          aria-label="Kết quả sau"
          className={cn(
            'inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45',
            isDark
              ? 'border-[#334155] bg-[#1E293B] text-[#E2E8F0] hover:bg-[#334155]'
              : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-100',
          )}
        >
          <span>Sau</span>
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={onClear}
          aria-label="Xóa highlight"
          className={cn(
            'inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors',
            isDark
              ? 'border-red-500/40 bg-red-950/40 text-red-200 hover:bg-red-900/50'
              : 'border-stone-200 bg-stone-50 text-stone-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700',
          )}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Xóa highlight</span>
        </button>
      </div>
    </div>
  );
}
