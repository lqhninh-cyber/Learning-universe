import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CornerDownLeft,
  FileCheck2,
  GraduationCap,
  Search,
  Sigma,
  Sparkles,
} from 'lucide-react';
import {
  type FC,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { KnowledgeFilterKey } from '@schemas/search';
import { KatexMath } from '@/features/math-glossary';
import { cn } from '@/shared/lib/cn';
import {
  ALL_COMMAND_ITEMS,
  buildSearchNavigationUrl,
  type CommandCategoryKey,
  type CommandResultItem,
  type KnowledgeBadgeKind,
  POPULAR_SUGGESTIONS,
  scoreCommandItem,
} from './search-catalog';
import { SearchSnippet } from './SearchSnippet';

export type { CommandCategoryKey, CommandResultItem } from './search-catalog';

export interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Cho phép bật/tắt lắng nghe phím tắt toàn cục Ctrl+K / Cmd+K và phím `/`. Mặc định: true */
  readonly enableGlobalShortcut?: boolean;
}

const CATEGORY_METADATA: Record<
  CommandCategoryKey,
  { readonly label: string; readonly icon: typeof Sigma }
> = {
  theorems: {
    label: 'ĐỊNH LÝ & CÔNG THỨC',
    icon: Sigma,
  },
  glossary: {
    label: 'THUẬT NGỮ',
    icon: BookMarked,
  },
  lessons: {
    label: 'BÀI HỌC & CHƯƠNG',
    icon: BookOpen,
  },
  reviews: {
    label: 'ÔN TẬP & ĐỀ THI',
    icon: FileCheck2,
  },
  courses: {
    label: 'HỌC PHẦN',
    icon: GraduationCap,
  },
};

const FILTER_PILLS: ReadonlyArray<{
  readonly key: KnowledgeFilterKey;
  readonly label: string;
  readonly activeClass: string;
}> = [
  { key: 'all', label: 'Tất cả', activeClass: 'border-[#1B3D2F] bg-[#1B3D2F] text-white' },
  { key: 'def', label: 'Định nghĩa', activeClass: 'border-[#264A8A] bg-[#264A8A] text-white' },
  { key: 'thm', label: 'Định lý', activeClass: 'border-[#9E2A2B] bg-[#9E2A2B] text-white' },
  { key: 'ex', label: 'Ví dụ', activeClass: 'border-[#1B5E43] bg-[#1B5E43] text-white' },
  { key: 'review', label: 'Ôn tập', activeClass: 'border-[#8A6A2F] bg-[#8A6A2F] text-white' },
];

const KNOWLEDGE_BADGE_CLASSES: Readonly<
  Record<KnowledgeBadgeKind, { readonly default: string; readonly selected: string }>
> = {
  def: {
    default: 'border-[#264A8A]/25 bg-[#E9EFF9] text-[#264A8A]',
    selected: 'border-white/25 bg-white/20 text-white',
  },
  thm: {
    default: 'border-[#9E2A2B]/25 bg-[#FCEEEE] text-[#9E2A2B]',
    selected: 'border-white/25 bg-white/20 text-white',
  },
  ex: {
    default: 'border-[#1B5E43]/25 bg-[#E8F4EE] text-[#1B5E43]',
    selected: 'border-white/25 bg-white/20 text-white',
  },
  review: {
    default: 'border-[#8A6A2F]/30 bg-[#FAF3E3] text-[#78571E]',
    selected: 'border-white/25 bg-white/20 text-white',
  },
};

function isEditableElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export const CommandPalette: FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  enableGlobalShortcut = true,
}) => {
  const inputId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<KnowledgeFilterKey>('all');
  const [activeIndex, setActiveIndex] = useState(0);

  // Tự động đóng Command Palette khi đường dẫn URL thay đổi
  const routeKey = `${pathname}${search}`;
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey);
    if (open) {
      onOpenChange(false);
    }
  }

  // Đặt lại từ khóa, bộ lọc và mục chọn về đầu khi modal mở
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setActiveFilter('all');
      setActiveIndex(0);
    }
  }

  // Lắng nghe phím tắt toàn cục: Ctrl/Cmd+K, `/` (khi không đang nhập liệu) và Esc
  useEffect(() => {
    if (!enableGlobalShortcut) return;

    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
        return;
      }

      if (
        !open &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        event.key === '/' &&
        !isEditableElement(event.target) &&
        !isEditableElement(document.activeElement)
      ) {
        event.preventDefault();
        onOpenChange(true);
        return;
      }

      if (event.key === 'Escape' && open) {
        event.preventDefault();
        onOpenChange(false);
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [enableGlobalShortcut, open, onOpenChange]);

  // Khóa cuộn trang nền (body scroll lock) và tự động focus vào ô tìm kiếm khi mở modal
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add('overflow-hidden');
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove('overflow-hidden');
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const trimmedQuery = query.trim();
  const isQueryEmpty = trimmedQuery.length === 0;

  const { scoredAll, pillCounts } = useMemo(() => {
    if (isQueryEmpty) {
      const counts: Record<KnowledgeFilterKey, number> = {
        all: ALL_COMMAND_ITEMS.length,
        def: ALL_COMMAND_ITEMS.filter((item) => item.knowledgeKind === 'def').length,
        thm: ALL_COMMAND_ITEMS.filter((item) => item.knowledgeKind === 'thm').length,
        ex: ALL_COMMAND_ITEMS.filter((item) => item.knowledgeKind === 'ex').length,
        review: ALL_COMMAND_ITEMS.filter((item) => item.knowledgeKind === 'review').length,
      };
      return { scoredAll: [] as CommandResultItem[], pillCounts: counts };
    }

    const ranked = ALL_COMMAND_ITEMS.map((item) => ({
      item,
      score: scoreCommandItem(item, trimmedQuery),
    }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);

    const counts: Record<KnowledgeFilterKey, number> = {
      all: ranked.length,
      def: ranked.filter((item) => item.knowledgeKind === 'def').length,
      thm: ranked.filter((item) => item.knowledgeKind === 'thm').length,
      ex: ranked.filter((item) => item.knowledgeKind === 'ex').length,
      review: ranked.filter((item) => item.knowledgeKind === 'review').length,
    };

    return { scoredAll: ranked, pillCounts: counts };
  }, [isQueryEmpty, trimmedQuery]);

  if (!open) {
    return null;
  }

  const defaultCourses = ALL_COMMAND_ITEMS.filter((item) => item.category === 'courses');

  interface DisplayGroup {
    readonly key: string;
    readonly label: string;
    readonly icon: typeof Sigma;
    readonly items: readonly CommandResultItem[];
  }

  let groups: DisplayGroup[] = [];

  if (isQueryEmpty) {
    if (activeFilter === 'all') {
      groups = [
        {
          key: 'popular',
          label: 'Gợi ý phổ biến',
          icon: Sparkles,
          items: POPULAR_SUGGESTIONS,
        },
        {
          key: 'courses-default',
          label: 'HỌC PHẦN',
          icon: GraduationCap,
          items: defaultCourses,
        },
      ];
    } else {
      const kindSamples = ALL_COMMAND_ITEMS.filter(
        (item) => item.knowledgeKind === activeFilter,
      ).slice(0, 8);
      const pillLabel = FILTER_PILLS.find((p) => p.key === activeFilter)?.label ?? 'Kết quả';
      if (kindSamples.length > 0) {
        groups = [
          {
            key: `empty-${activeFilter}`,
            label: `${pillLabel} tiêu biểu`,
            icon: Sparkles,
            items: kindSamples,
          },
        ];
      }
    }
  } else if (activeFilter !== 'all') {
    const filteredItems = scoredAll.filter((item) => item.knowledgeKind === activeFilter);
    const matchedTheorems: CommandResultItem[] = [];
    const matchedGlossary: CommandResultItem[] = [];
    const matchedLessons: CommandResultItem[] = [];
    const matchedReviews: CommandResultItem[] = [];

    for (const item of filteredItems.slice(0, 18)) {
      if (item.category === 'theorems') matchedTheorems.push(item);
      else if (item.category === 'glossary') matchedGlossary.push(item);
      else if (item.category === 'lessons') matchedLessons.push(item);
      else if (item.category === 'reviews') matchedReviews.push(item);
    }

    groups = (
      [
        {
          key: 'theorems',
          label: CATEGORY_METADATA.theorems.label,
          icon: CATEGORY_METADATA.theorems.icon,
          items: matchedTheorems,
        },
        {
          key: 'glossary',
          label: CATEGORY_METADATA.glossary.label,
          icon: CATEGORY_METADATA.glossary.icon,
          items: matchedGlossary,
        },
        {
          key: 'lessons',
          label: CATEGORY_METADATA.lessons.label,
          icon: CATEGORY_METADATA.lessons.icon,
          items: matchedLessons,
        },
        {
          key: 'reviews',
          label: CATEGORY_METADATA.reviews.label,
          icon: CATEGORY_METADATA.reviews.icon,
          items: matchedReviews,
        },
      ] as const
    ).filter((group) => group.items.length > 0);
  } else {
    const matchedTheorems: CommandResultItem[] = [];
    const matchedGlossary: CommandResultItem[] = [];
    const matchedLessons: CommandResultItem[] = [];
    const matchedReviews: CommandResultItem[] = [];
    const matchedCourses: CommandResultItem[] = [];

    for (const item of scoredAll) {
      if (item.category === 'theorems' && matchedTheorems.length < 5) {
        matchedTheorems.push(item);
      } else if (item.category === 'glossary' && matchedGlossary.length < 5) {
        matchedGlossary.push(item);
      } else if (item.category === 'lessons' && matchedLessons.length < 6) {
        matchedLessons.push(item);
      } else if (item.category === 'reviews' && matchedReviews.length < 4) {
        matchedReviews.push(item);
      } else if (item.category === 'courses' && matchedCourses.length < 4) {
        matchedCourses.push(item);
      }
    }

    groups = (
      [
        {
          key: 'theorems',
          label: CATEGORY_METADATA.theorems.label,
          icon: CATEGORY_METADATA.theorems.icon,
          items: matchedTheorems,
        },
        {
          key: 'glossary',
          label: CATEGORY_METADATA.glossary.label,
          icon: CATEGORY_METADATA.glossary.icon,
          items: matchedGlossary,
        },
        {
          key: 'lessons',
          label: CATEGORY_METADATA.lessons.label,
          icon: CATEGORY_METADATA.lessons.icon,
          items: matchedLessons,
        },
        {
          key: 'reviews',
          label: CATEGORY_METADATA.reviews.label,
          icon: CATEGORY_METADATA.reviews.icon,
          items: matchedReviews,
        },
        {
          key: 'courses',
          label: CATEGORY_METADATA.courses.label,
          icon: CATEGORY_METADATA.courses.icon,
          items: matchedCourses,
        },
      ] as const
    ).filter((group) => group.items.length > 0);
  }

  const flatItems: CommandResultItem[] = groups.flatMap((group) => group.items);
  const safeActiveIndex =
    flatItems.length === 0 ? -1 : Math.min(Math.max(0, activeIndex), flatItems.length - 1);
  const activeOptionId =
    safeActiveIndex >= 0 && flatItems[safeActiveIndex]
      ? `cmd-option-${flatItems[safeActiveIndex].id}`
      : undefined;

  const handleSelectItem = (item: CommandResultItem) => {
    const targetUrl = buildSearchNavigationUrl(item.href, trimmedQuery);
    onOpenChange(false);
    void navigate(targetUrl);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (flatItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % flatItems.length);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (flatItems.length > 0) {
        setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      }
    } else if (event.key === 'Enter') {
      if (safeActiveIndex >= 0 && flatItems[safeActiveIndex]) {
        event.preventDefault();
        handleSelectItem(flatItems[safeActiveIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  const activeResultCount = isQueryEmpty ? flatItems.length : pillCounts[activeFilter];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hộp tìm kiếm học thuật nhanh (Command Palette)"
      className="fixed inset-0 z-50 flex items-start justify-center bg-stone-900/35 px-4 pt-16 backdrop-blur-sm transition-all sm:pt-20"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#FAF8F5]/95 shadow-2xl backdrop-blur-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Thanh nhập liệu tìm kiếm */}
        <div className="flex items-center gap-3 border-b border-[#CFDADB] px-5 py-3.5">
          <Search className="h-5 w-5 shrink-0 text-[#55676B]" aria-hidden="true" />
          <label htmlFor={inputId} className="sr-only">
            Tìm kiếm định lý, công thức, bài học và thuật ngữ
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Tìm kiếm định lý, công thức, bài học (Lagrange, Affine, Nhóm con)..."
            className="w-full bg-transparent font-sans text-sm text-[#29383D] placeholder:text-[#55676B]/60 focus:outline-none md:text-base"
          />

          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              className="shrink-0 cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium text-[#55676B] transition-colors hover:bg-[#E1E9EA] hover:text-[#29383D]"
            >
              Xóa
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Đóng hộp thoại tìm kiếm (ESC)"
            className="shrink-0 cursor-pointer rounded-md border border-[#CFDADB] bg-[#E1E9EA] px-2 py-1 font-mono text-[10px] font-semibold tracking-wider text-[#55676B] uppercase transition-colors hover:bg-[#D7E1E2] hover:text-[#29383D]"
          >
            ESC
          </button>
        </div>

        {/* Thanh bộ lọc phân loại tri thức & số lượng kết quả */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#CFDADB] bg-[#F3F5F4] px-4 py-2.5">
          <div
            role="tablist"
            aria-label="Lọc theo phân loại tri thức"
            className="flex flex-wrap items-center gap-1.5"
          >
            {FILTER_PILLS.map((pill) => {
              const isSelected = activeFilter === pill.key;
              const count = pillCounts[pill.key];
              return (
                <button
                  key={pill.key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveFilter(pill.key);
                    setActiveIndex(0);
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                    isSelected
                      ? pill.activeClass
                      : 'border-[#CFDADB] bg-white text-[#29383D] hover:bg-[#E7ECEB]',
                  )}
                >
                  <span>{pill.label}</span>
                  <span
                    className={cn(
                      'py-0.2 rounded-full px-1.5 font-mono text-[10px] font-semibold',
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#E1E9EA] text-[#55676B]',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {!isQueryEmpty && (
            <span className="shrink-0 font-mono text-[11px] font-semibold text-[#1B3D2F]">
              {activeResultCount} kết quả
            </span>
          )}
        </div>

        {/* Danh sách kết quả tìm kiếm phân nhóm */}
        <div
          id={listboxId}
          role="listbox"
          aria-label="Kết quả tìm kiếm học thuật"
          className="max-h-[60vh] overflow-y-auto px-3 py-3"
        >
          {flatItems.length > 0 ? (
            <div className="space-y-4">
              {groups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.key} className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-1">
                      <GroupIcon className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                      <span className="font-mono text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                        {group.label}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const itemIndex = flatItems.findIndex((entry) => entry.id === item.id);
                        const isSelected = itemIndex === safeActiveIndex;
                        const knowledgeBadgeStyle = item.knowledgeKind
                          ? KNOWLEDGE_BADGE_CLASSES[item.knowledgeKind]
                          : null;

                        return (
                          <button
                            key={item.id}
                            id={`cmd-option-${item.id}`}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            onClick={() => handleSelectItem(item)}
                            className={cn(
                              'group flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 text-left transition-colors',
                              isSelected
                                ? 'bg-[#3F6570] text-white'
                                : 'text-[#29383D] hover:bg-[#E1E9EA]/60',
                            )}
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              {/* Dòng trên: Huy hiệu phân loại tri thức + Tên môn · Chương · Bài */}
                              {(item.badgeLabel || item.breadcrumb) && (
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                  {item.badgeLabel && knowledgeBadgeStyle && (
                                    <span
                                      className={cn(
                                        'rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase',
                                        isSelected
                                          ? knowledgeBadgeStyle.selected
                                          : knowledgeBadgeStyle.default,
                                      )}
                                    >
                                      {item.badgeLabel}
                                    </span>
                                  )}
                                  {item.breadcrumb && (
                                    <span
                                      className={cn(
                                        'truncate font-medium',
                                        isSelected ? 'text-stone-200' : 'text-[#55676B]',
                                      )}
                                    >
                                      {item.breadcrumb}
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Tiêu đề chính (giữ nguyên chuỗi liên tục) */}
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    'font-serif text-sm font-semibold md:text-[15px]',
                                    isSelected ? 'text-white' : 'text-[#29383D]',
                                  )}
                                >
                                  {item.title}
                                </span>

                                {item.badge && item.badge !== item.badgeLabel && (
                                  <span
                                    className={cn(
                                      'rounded-full px-2 py-0.5 font-mono text-[10px] font-medium',
                                      isSelected
                                        ? 'bg-white/15 text-stone-200'
                                        : 'bg-[#E1E9EA] text-[#55676B]',
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>

                              {/* Công thức KaTeX nổi bật (nếu có) */}
                              {item.formula && (
                                <div
                                  className={cn(
                                    'inline-flex max-w-full items-center overflow-x-auto rounded-lg border px-2.5 py-0.5 text-xs',
                                    isSelected
                                      ? 'border-white/20 bg-white/10 text-white'
                                      : 'border-[#CFDADB] bg-[#E1E9EA] text-[#29383D]',
                                  )}
                                >
                                  <KatexMath math={item.formula} />
                                </div>
                              )}

                              {/* Dòng dưới: Snippet tích hợp highlight <mark> + KaTeX inline */}
                              {!isQueryEmpty ? (
                                <div className="line-clamp-2">
                                  <SearchSnippet
                                    text={item.snippetText ?? item.subtitle}
                                    query={trimmedQuery}
                                    className={isSelected ? 'text-stone-100' : 'text-[#55676B]'}
                                  />
                                </div>
                              ) : (
                                <p
                                  className={cn(
                                    'line-clamp-1 text-xs',
                                    isSelected ? 'text-white/80' : 'text-[#55676B]',
                                  )}
                                >
                                  {item.subtitle}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                              {isSelected ? (
                                <CornerDownLeft className="h-4 w-4 text-white" aria-hidden="true" />
                              ) : (
                                <ArrowRight
                                  className="h-4 w-4 text-[#55676B] opacity-0 transition-opacity group-hover:opacity-100"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="font-serif text-base font-medium text-[#29383D]">
                Không tìm thấy nội dung phù hợp cho từ khóa này
              </p>
              <p className="mt-1.5 text-xs text-[#55676B]">
                Hãy thử tìm bằng tên định lý (Lagrange, Cauchy, Chasles), ký hiệu Toán học (`S_3`,
                `ker`, `E^4`), hoặc chuyển sang tab Tất cả.
              </p>
            </div>
          )}
        </div>

        {/* Chân hộp thoại: Hướng dẫn điều hướng bàn phím */}
        <div className="flex items-center justify-between border-t border-[#CFDADB] bg-[#E1E9EA]/80 px-5 py-2.5 text-[11px] text-[#55676B]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-700">
                ↑
              </kbd>
              <kbd className="rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-700">
                ↓
              </kbd>
              <span>Di chuyển</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-700">
                Enter
              </kbd>
              <span>Mở ngay</span>
            </span>
            <span className="hidden items-center gap-1 sm:inline-flex">
              <kbd className="rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-700">
                /
              </kbd>
              <span>Mở nhanh</span>
            </span>
          </div>
          <span className="hidden font-mono text-[10px] tracking-wider text-stone-500 uppercase sm:inline">
            Learning Universe · Command Palette
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
