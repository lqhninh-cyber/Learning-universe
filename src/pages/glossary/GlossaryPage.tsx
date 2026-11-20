import { ArrowRight, BookOpen, Check, Copy, Lightbulb, RotateCcw, Search, X } from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { getLessonBySlug, getSubjectBySlug, resolveLessonShortcut } from '@/content-runtime';
import { useIsland } from '@/context/IslandContext';
import {
  getAllGlossaryEntries,
  InlineMathText,
  KatexMath,
  type MathGlossaryEntry,
  type MathGlossarySubject,
  searchGlossary,
} from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { stripDiacritics } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';

type SubjectFilter = 'all' | MathGlossarySubject;

interface SubjectAlmanacStyle {
  readonly label: string;
  readonly code: string;
  readonly hex: string;
  readonly dotClass: string;
  readonly borderLeftClass: string;
  readonly badgeClass: string;
  readonly activeFilterClass: string;
}

const SUBJECT_ALMANAC_STYLES: Record<MathGlossarySubject, SubjectAlmanacStyle> = {
  'cau-truc-dai-so': {
    label: 'Cấu trúc đại số',
    code: 'CTĐS',
    hex: '#8C5828',
    dotClass: 'bg-[#8C5828] dark:bg-[#D99B5E]',
    borderLeftClass: 'border-l-[#8C5828] dark:border-l-[#D99B5E]',
    badgeClass:
      'border-[#E7D7C5] bg-[#FDF8F3] text-[#8C5828] dark:border-[#3A2D20] dark:bg-[#1D1813] dark:text-[#D99B5E]',
    activeFilterClass:
      'border-[#8C5828] bg-[#8C5828] text-white dark:border-[#D99B5E] dark:bg-[#D99B5E] dark:text-[#0D1110]',
  },
  'hinh-hoc-affine': {
    label: 'Hình học Affine & Euclide',
    code: 'HHAVE',
    hex: '#1D4F6E',
    dotClass: 'bg-[#1D4F6E] dark:bg-[#64A8D1]',
    borderLeftClass: 'border-l-[#1D4F6E] dark:border-l-[#64A8D1]',
    badgeClass:
      'border-[#C9DCE7] bg-[#F3F8FB] text-[#1D4F6E] dark:border-[#233845] dark:bg-[#131C22] dark:text-[#64A8D1]',
    activeFilterClass:
      'border-[#1D4F6E] bg-[#1D4F6E] text-white dark:border-[#64A8D1] dark:bg-[#64A8D1] dark:text-[#0D1110]',
  },
  'giai-tich-ham-mot-bien': {
    label: 'Giải tích hàm một biến',
    code: 'GTHMB',
    hex: '#1B5E4A',
    dotClass: 'bg-[#1B5E4A] dark:bg-[#52B394]',
    borderLeftClass: 'border-l-[#1B5E4A] dark:border-l-[#52B394]',
    badgeClass:
      'border-[#C5DFD4] bg-[#F2F9F6] text-[#1B5E4A] dark:border-[#1F3B31] dark:bg-[#111F1A] dark:text-[#52B394]',
    activeFilterClass:
      'border-[#1B5E4A] bg-[#1B5E4A] text-white dark:border-[#52B394] dark:bg-[#52B394] dark:text-[#0D1110]',
  },
  'giao-duc-hoc': {
    label: 'Giáo dục học',
    code: 'GDH',
    hex: '#8F3D35',
    dotClass: 'bg-[#8F3D35] dark:bg-[#DF7B70]',
    borderLeftClass: 'border-l-[#8F3D35] dark:border-l-[#DF7B70]',
    badgeClass:
      'border-[#E4CCC9] bg-[#FBF4F3] text-[#8F3D35] dark:border-[#3F2624] dark:bg-[#211514] dark:text-[#DF7B70]',
    activeFilterClass:
      'border-[#8F3D35] bg-[#8F3D35] text-white dark:border-[#DF7B70] dark:bg-[#DF7B70] dark:text-[#0D1110]',
  },
};

const ALPHABET: readonly string[] = Array.from({ length: 26 }, (_, idx) =>
  String.fromCharCode(65 + idx),
);

function resolveIndexLetter(nameVi: string): string {
  const normalized = stripDiacritics(nameVi.trim()).toUpperCase();
  const firstChar = normalized.charAt(0);
  if (firstChar >= 'A' && firstChar <= 'Z') {
    return firstChar;
  }
  return '#';
}

function resolveTargetLessonLabel(entry: MathGlossaryEntry): string {
  const rawUrl = entry.lessonUrl || entry.relatedLesson || '';
  const pathOnly = rawUrl.split('#')[0]?.split('?')[0] ?? '';

  const fullMatch = pathOnly.match(/^\/(?:mon-hoc|courses)\/([^/]+)\/([^/]+)\/([^/]+)\/?$/);
  if (fullMatch?.[1] && fullMatch[2] && fullMatch[3]) {
    const loc =
      getLessonBySlug(fullMatch[1], fullMatch[2], fullMatch[3]) ??
      resolveLessonShortcut(fullMatch[3]);
    if (loc) {
      const cleanTitle = loc.lesson.title.replace(/^Bài\s+\d+(?:\.\d+)?:\s*/i, '');
      return `Bài ${loc.chapter.number}.${loc.lesson.number} · ${cleanTitle}`;
    }
  }

  const shortcutMatch = pathOnly.match(/^\/bai-hoc\/([^/]+)\/?$/);
  if (shortcutMatch?.[1]) {
    const loc = resolveLessonShortcut(shortcutMatch[1]);
    if (loc) {
      const cleanTitle = loc.lesson.title.replace(/^Bài\s+\d+(?:\.\d+)?:\s*/i, '');
      return `Bài ${loc.chapter.number}.${loc.lesson.number} · ${cleanTitle}`;
    }
  }

  const subjectMatch = pathOnly.match(/^\/(?:mon-hoc|courses)\/([^/]+)\/?$/);
  if (subjectMatch?.[1]) {
    const subject = getSubjectBySlug(subjectMatch[1]);
    if (subject) {
      return `Tổng quan · ${subject.title}`;
    }
  }

  return entry.courseName || SUBJECT_ALMANAC_STYLES[entry.subject].label;
}

export function GlossaryPage() {
  const searchInputId = useId();
  const { triggerIslandNotice } = useIsland();
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') ?? '';
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const allEntries = useMemo(() => getAllGlossaryEntries(), []);

  const subjectCounts = useMemo(() => {
    const counts: Record<MathGlossarySubject, number> = {
      'cau-truc-dai-so': 0,
      'hinh-hoc-affine': 0,
      'giai-tich-ham-mot-bien': 0,
      'giao-duc-hoc': 0,
    };
    for (const entry of allEntries) {
      counts[entry.subject] += 1;
    }
    return counts;
  }, [allEntries]);

  const filteredEntries = useMemo(() => {
    return searchGlossary({
      subject: subjectFilter,
      query,
    });
  }, [subjectFilter, query]);

  const groupedByLetter = useMemo(() => {
    const groups = new Map<string, MathGlossaryEntry[]>();
    for (const entry of filteredEntries) {
      const letter = resolveIndexLetter(entry.nameVi);
      const list = groups.get(letter);
      if (list) {
        list.push(entry);
      } else {
        groups.set(letter, [entry]);
      }
    }

    const sortedLetters = Array.from(groups.keys()).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, 'en');
    });

    return sortedLetters.map((letter) => {
      const items = groups.get(letter) ?? [];
      items.sort((a, b) => a.nameVi.localeCompare(b.nameVi, 'vi'));
      return { letter, items };
    });
  }, [filteredEntries]);

  const availableLetters = useMemo(() => {
    return new Set(groupedByLetter.map((group) => group.letter));
  }, [groupedByLetter]);

  const hasActiveFilters = query.trim().length > 0 || subjectFilter !== 'all';

  const handleResetFilters = useCallback(() => {
    setQuery('');
    setSubjectFilter('all');
    setActiveLetter(null);
  }, []);

  const handleJumpToLetter = useCallback((letter: string) => {
    setActiveLetter(letter);
    const target = document.getElementById(`lexicon-group-${letter}`);
    target?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCopyEntry = useCallback(
    async (entry: MathGlossaryEntry) => {
      const meta = SUBJECT_ALMANAC_STYLES[entry.subject];
      const anchorUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}${ROUTES.glossary}#term-${entry.id}`
          : `${ROUTES.glossary}#term-${entry.id}`;
      const payload = `${entry.nameVi} (${entry.nameEn}) — ${entry.brief}\n${anchorUrl}`;

      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(payload);
        }
      } catch {
        // Fallback yên lặng nếu trình duyệt chặn Clipboard API
      }

      setCopiedId(entry.id);
      triggerIslandNotice({
        text: `Đã sao chép "${entry.nameVi}"`,
        type: 'success',
        accentColor: meta.hex,
      });

      window.setTimeout(() => {
        setCopiedId((prev) => (prev === entry.id ? null : prev));
      }, 1800);
    },
    [triggerIslandNotice],
  );

  return (
    <FadeIn className="min-h-screen bg-[var(--bg-workspace)] pt-8 pb-20 text-[var(--text-main)]">
      <div className="mx-auto max-w-[1240px] space-y-6 px-6 lg:px-10">
        {/* ================================================================
            ĐẦU TRANG KHO THUẬT NGỮ CHUẨN SWISS ALMANAC (SỨ BẠCH & THAN ĐÁ)
            ================================================================ */}
        <section
          data-testid="glossary-almanac-header"
          className="space-y-5 border-b border-[var(--border-hairline)] pb-6"
        >
          <header className="space-y-2">
            <h1 className="font-serif text-3xl leading-tight font-semibold tracking-tight text-[var(--text-main)] sm:text-4xl">
              Ký hiệu &amp; Thuật ngữ Học thuật
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)]">
              Từ điển tra cứu nhanh định nghĩa chuẩn KaTeX, trực giác hình học – đại số và liên kết
              thẳng tới bài giảng gốc trên cả 4 học phần.
            </p>
          </header>

          {/* Thanh tìm kiếm tức thời + Bộ lọc 4 học phần */}
          <div className="space-y-3.5">
            <div className="relative max-w-2xl">
              <label htmlFor={searchInputId} className="sr-only">
                Tìm kiếm thuật ngữ hoặc ký hiệu
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                id={searchInputId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm theo tiếng Việt, tiếng Anh, ký hiệu (≅, V₄, ∇...) hoặc môn học..."
                className="h-11 w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] pr-10 pl-10 text-sm text-[var(--text-main)] transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent-os)] focus:bg-[var(--bg-workspace)] focus:outline-hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Xóa từ khóa tìm kiếm"
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-shell)] hover:text-[var(--text-main)]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label="Lọc theo môn học"
              className="flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                aria-pressed={subjectFilter === 'all'}
                onClick={() => setSubjectFilter('all')}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-medium transition-colors',
                  subjectFilter === 'all'
                    ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-main)]',
                )}
              >
                <span>Tất cả</span>
                <span className="tabular-nums opacity-75">({allEntries.length})</span>
              </button>

              {(
                [
                  'cau-truc-dai-so',
                  'hinh-hoc-affine',
                  'giai-tich-ham-mot-bien',
                  'giao-duc-hoc',
                ] as const
              ).map((subjectKey) => {
                const style = SUBJECT_ALMANAC_STYLES[subjectKey];
                const isActive = subjectFilter === subjectKey;
                return (
                  <button
                    key={subjectKey}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSubjectFilter(subjectKey)}
                    className={cn(
                      'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-medium transition-colors',
                      isActive
                        ? style.activeFilterClass
                        : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-main)]',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'h-2 w-2 shrink-0 rounded-full',
                        isActive ? 'bg-current opacity-85' : style.dotClass,
                      )}
                    />
                    <span>{style.label}</span>
                    <span className="tabular-nums opacity-75">({subjectCounts[subjectKey]})</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================
            THANH CHỈ MỤC A–Z GHIM NGAY DƯỚI TOPCONTEXTBAR (sticky top-12)
            ================================================================ */}
        <nav
          aria-label="Chỉ mục chữ cái A đến Z"
          data-testid="glossary-az-rail"
          className="sticky top-12 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/95 px-3.5 py-2.5 backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center gap-1">
            {ALPHABET.map((letter) => {
              const hasItems = availableLetters.has(letter);
              const isSelected = activeLetter === letter && hasItems;
              return (
                <button
                  key={letter}
                  type="button"
                  disabled={!hasItems}
                  aria-label={`Đi tới nhóm chữ ${letter}`}
                  onClick={() => handleJumpToLetter(letter)}
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-md font-mono text-xs font-semibold transition-colors',
                    hasItems
                      ? isSelected
                        ? 'cursor-pointer bg-[var(--accent-os)] text-white'
                        : 'cursor-pointer text-[var(--text-main)] hover:bg-[var(--bg-surface)] hover:text-[var(--accent-os)]'
                      : 'pointer-events-none text-[var(--text-muted)] opacity-30',
                  )}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--text-muted)]">
            <span className="tabular-nums">
              Hiển thị <strong className="text-[var(--text-main)]">{filteredEntries.length}</strong>{' '}
              / {allEntries.length} mục
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)]"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Đặt lại</span>
              </button>
            )}
          </div>
        </nav>

        {/* ================================================================
            LƯỚI THẺ THUẬT NGỮ CHUẨN KATEX PHÂN NHÓM A–Z (2 CỘT DESKTOP)
            ================================================================ */}
        {groupedByLetter.length > 0 ? (
          <div className="space-y-10">
            {groupedByLetter.map(({ letter, items }) => (
              <section
                key={letter}
                id={`lexicon-group-${letter}`}
                aria-label={`Nhóm thuật ngữ bắt đầu bằng chữ ${letter}`}
                className="scroll-mt-28 space-y-4"
              >
                <div className="flex items-center gap-3 border-b border-[var(--border-hairline)] pb-2.5">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] font-serif text-xl font-bold text-[var(--text-main)]">
                    {letter}
                  </span>
                  <span className="font-mono text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase tabular-nums">
                    {String(items.length).padStart(2, '0')} thuật ngữ
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {items.map((entry) => {
                    const meta = SUBJECT_ALMANAC_STYLES[entry.subject];
                    const isCopied = copiedId === entry.id;
                    const mathExpr = entry.symbol || entry.formula || '';
                    const isShortFormula = mathExpr.length > 0 && mathExpr.length < 14;
                    const targetLessonLabel = resolveTargetLessonLabel(entry);

                    return (
                      <article
                        key={entry.id}
                        id={`term-${entry.id}`}
                        data-testid={`lexicon-card-${entry.id}`}
                        className={cn(
                          'group/card flex h-full scroll-mt-28 flex-col justify-between rounded-xl border border-l-[3px] border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 transition-colors hover:border-[var(--text-muted)]/40 hover:bg-[var(--bg-workspace)]',
                          meta.borderLeftClass,
                        )}
                      >
                        <div className="space-y-3.5">
                          {/* Hàng tiêu đề thoáng: Tên Việt/Anh + Pill môn học + Nút sao chép */}
                          <div className="flex flex-wrap items-start justify-between gap-2.5">
                            <div className="flex min-w-0 flex-1 items-start gap-3">
                              {isShortFormula && (
                                <div className="inline-flex min-h-10 min-w-[44px] shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 py-1">
                                  <KatexMath
                                    math={mathExpr}
                                    className="font-serif text-lg font-semibold text-[var(--text-main)]"
                                  />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h2 className="font-serif text-[18px] leading-snug font-semibold text-[var(--text-main)]">
                                  {entry.nameVi}
                                </h2>
                                <p className="mt-0.5 font-mono text-[11px] text-[var(--text-muted)]">
                                  {entry.nameEn}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] font-semibold',
                                  meta.badgeClass,
                                )}
                              >
                                <span
                                  aria-hidden="true"
                                  className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)}
                                />
                                <span>{meta.code}</span>
                              </span>

                              <button
                                type="button"
                                onClick={() => void handleCopyEntry(entry)}
                                aria-label={`Sao chép định nghĩa ${entry.nameVi}`}
                                title="Sao chép định nghĩa & đường dẫn neo"
                                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)] hover:text-[var(--text-main)]"
                              >
                                {isCopied ? (
                                  <Check
                                    className="h-3.5 w-3.5 text-[#1B5E4A] dark:text-[#52B394]"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Công thức dài (>= 14 ký tự) tách thành khối riêng thoáng phía dưới tiêu đề */}
                          {!isShortFormula && mathExpr && (
                            <div
                              data-testid={`lexicon-formula-block-${entry.id}`}
                              className="os-thin-scrollbar overflow-x-auto rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3.5 py-2"
                            >
                              <KatexMath
                                math={mathExpr}
                                className="font-serif text-base font-semibold text-[var(--text-main)]"
                              />
                            </div>
                          )}

                          {/* Định nghĩa súc tích chuẩn KaTeX */}
                          <div className="text-[14.5px] leading-relaxed text-[var(--text-secondary)]">
                            <InlineMathText text={entry.brief} />
                          </div>

                          {/* Hộp Trực quan & Bản chất */}
                          <div className="space-y-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 text-[13.5px] leading-relaxed text-[var(--text-secondary)]">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[var(--accent-heritage)] uppercase">
                              <Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span>Trực quan &amp; Bản chất</span>
                            </div>
                            <div>
                              <InlineMathText text={entry.intuition} />
                            </div>
                          </div>
                        </div>

                        {/* Chân thẻ: Tên/mã bài giảng đích (thay thế #slug) + Đọc tại bài giảng → */}
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--border-hairline)] pt-3">
                          <span
                            data-testid={`lexicon-lesson-label-${entry.id}`}
                            className="truncate text-xs font-medium text-[var(--text-muted)]"
                            title={targetLessonLabel}
                          >
                            {targetLessonLabel}
                          </span>
                          {entry.relatedLesson && (
                            <Link
                              to={entry.relatedLesson}
                              className="group/link inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-os)] hover:text-[var(--accent-os)]"
                            >
                              <BookOpen
                                className="h-3.5 w-3.5 text-[var(--accent-heritage)]"
                                aria-hidden="true"
                              />
                              <span>Đọc tại bài giảng</span>
                              <ArrowRight
                                className="h-3.5 w-3.5 transition-transform duration-150 group-hover/link:translate-x-0.5"
                                aria-hidden="true"
                              />
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div
            data-testid="glossary-empty-state"
            className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-6 py-14 text-center"
          >
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--accent-heritage)]">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[var(--text-main)]">
              Không tìm thấy thuật ngữ nào
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--text-secondary)]">
              Không có kết quả phù hợp với từ khóa &ldquo;{query}&rdquo;. Hãy thử tìm bằng ký hiệu
              Toán học, thuật ngữ tiếng Anh hoặc đặt lại bộ lọc môn học.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--accent-os)] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-95"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

export default GlossaryPage;
