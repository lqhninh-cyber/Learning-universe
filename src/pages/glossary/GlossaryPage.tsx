import { ArrowRight, BookOpen, Check, Copy, Lightbulb, RotateCcw, Search, X } from 'lucide-react';
import { useCallback, useId, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { BlueprintSectionFrame, TelemetrySpecBar } from '@/components/fx';
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
import { Breadcrumb } from '@/shared/ui';

type SubjectFilter = 'all' | MathGlossarySubject;

interface SubjectMineralStyle {
  readonly label: string;
  readonly shortLabel: string;
  readonly hex: string;
  readonly dotClass: string;
  readonly borderLeftClass: string;
  readonly badgeClass: string;
  readonly activeFilterClass: string;
}

const SUBJECT_MINERAL_STYLES: Record<MathGlossarySubject, SubjectMineralStyle> = {
  'cau-truc-dai-so': {
    label: 'Cấu trúc đại số',
    shortLabel: 'Cấu trúc đại số',
    hex: '#6B5335',
    dotClass: 'bg-[#6B5335] dark:bg-[#D5B47A]',
    borderLeftClass: 'border-l-[#6B5335] dark:border-l-[#C9A467]',
    badgeClass:
      'border-[#D8D0C0] bg-[#F3F0E8] text-[#6B5335] dark:border-[#4A3B28] dark:bg-[#241D14] dark:text-[#E5C992]',
    activeFilterClass:
      'border-[#6B5335] bg-[#6B5335] text-[#FAFBF9] shadow-xs dark:border-[#C9A467] dark:bg-[#6B5335] dark:text-[#FAFBF9]',
  },
  'hinh-hoc-affine': {
    label: 'Hình học Affine & Euclide',
    shortLabel: 'Hình học Affine & Euclide',
    hex: '#2D5266',
    dotClass: 'bg-[#2D5266] dark:bg-[#7BA9C2]',
    borderLeftClass: 'border-l-[#2D5266] dark:border-l-[#6D9CB5]',
    badgeClass:
      'border-[#C9D7DF] bg-[#ECF1F4] text-[#2D5266] dark:border-[#254454] dark:bg-[#13222B] dark:text-[#9AC3D9]',
    activeFilterClass:
      'border-[#2D5266] bg-[#2D5266] text-[#FAFBF9] shadow-xs dark:border-[#6D9CB5] dark:bg-[#2D5266] dark:text-[#FAFBF9]',
  },
  'giai-tich-ham-mot-bien': {
    label: 'Giải tích hàm một biến',
    shortLabel: 'Giải tích hàm một biến',
    hex: '#245746',
    dotClass: 'bg-[#245746] dark:bg-[#6EB59B]',
    borderLeftClass: 'border-l-[#245746] dark:border-l-[#5BA88D]',
    badgeClass:
      'border-[#C6DBD0] bg-[#EBF2EE] text-[#245746] dark:border-[#1F4A3B] dark:bg-[#102820] dark:text-[#8CD0B8]',
    activeFilterClass:
      'border-[#245746] bg-[#245746] text-[#FAFBF9] shadow-xs dark:border-[#5BA88D] dark:bg-[#245746] dark:text-[#FAFBF9]',
  },
  'giao-duc-hoc': {
    label: 'Giáo dục học',
    shortLabel: 'Giáo dục học',
    hex: '#7A463B',
    dotClass: 'bg-[#7A463B] dark:bg-[#D19385]',
    borderLeftClass: 'border-l-[#7A463B] dark:border-l-[#C98A7C]',
    badgeClass:
      'border-[#D8C8C1] bg-[#F3ECE9] text-[#7A463B] dark:border-[#4D2D26] dark:bg-[#261613] dark:text-[#E5ACA0]',
    activeFilterClass:
      'border-[#7A463B] bg-[#7A463B] text-[#FAFBF9] shadow-xs dark:border-[#C98A7C] dark:bg-[#7A463B] dark:text-[#FAFBF9]',
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
      const meta = SUBJECT_MINERAL_STYLES[entry.subject];
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
    <FadeIn className="min-h-screen bg-[var(--bg-page,#F2F4F3)] pt-24 pb-20 text-[#142622] dark:bg-[#0E1A15] dark:text-[#E6ECE7]">
      <div className="mx-auto max-w-[1400px] space-y-7 px-6 lg:px-10">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: ROUTES.home },
            { label: 'Tra cứu thuật ngữ & ký hiệu' },
          ]}
        />

        {/* ================================================================
            KHUNG ĐẦU TRANG NIÊN GIÁM (ALMANAC SPEC HEADER)
            ================================================================ */}
        <BlueprintSectionFrame
          data-testid="glossary-almanac-header"
          crosshairColor="#9C7A4C"
          crosshairOpacity={0.75}
          showInnerKeyline
          borderClassName="border-[#CFD8D4] dark:border-[#1E3B2D]"
          className="rounded-[2px] bg-[#FAFBF9] shadow-[0_14px_40px_rgba(24,38,36,0.05)] dark:bg-[#12241C] dark:shadow-[0_14px_40px_rgba(0,0,0,0.35)]"
          innerClassName="overflow-hidden rounded-[2px]"
        >
          <TelemetrySpecBar
            sectionCode="DOC. LU-2026 // LEXICON ALMANAC"
            subtitle="NIÊN GIÁM THUẬT NGỮ & KÝ HIỆU HỌC THUẬT"
            items={[
              { label: 'THUẬT NGỮ', value: String(allEntries.length).padStart(2, '0') },
              { label: 'HỌC PHẦN', value: '04' },
              { label: 'HIỂN THỊ', value: String(filteredEntries.length).padStart(2, '0') },
            ]}
            className="dark:divide-[#1E3B2D] dark:border-[#1E3B2D] dark:bg-[#0E1A15]/90 dark:text-[#A7B5AC] [&_span]:dark:text-[#E6ECE7]"
          />

          <div className="space-y-6 p-6 sm:p-8">
            <header className="space-y-2.5">
              <p className="font-mono text-[11px] font-semibold tracking-[0.14em] text-[#8C6228] uppercase dark:text-[#D5B47A]">
                ALMANAC // TỪ ĐIỂN KÝ HIỆU &amp; KHÁI NIỆM CHUẨN KATEX
              </p>
              <h1 className="font-serif text-3xl leading-tight font-bold tracking-tight text-[#142622] sm:text-4xl dark:text-[#E6ECE7]">
                Ký hiệu &amp; Thuật ngữ Toán học
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-[#2D423D] sm:text-base dark:text-[#B9C8C1]">
                Niên giám tra cứu nhanh định nghĩa chuẩn KaTeX, trực giác hình học – đại số và liên
                kết thẳng tới bài giảng gốc trên cả 4 học phần: Cấu trúc đại số, Hình học Affine
                &amp; Euclide, Giải tích hàm một biến và Giáo dục học.
              </p>
            </header>

            {/* Thanh tìm kiếm tức thời nền trắng sứ + Bộ lọc 4 sắc khoáng thạch */}
            <div className="space-y-4">
              <div className="relative max-w-2xl">
                <label htmlFor={searchInputId} className="sr-only">
                  Tìm kiếm thuật ngữ hoặc ký hiệu
                </label>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#4A5D58] dark:text-[#98ABA3]"
                  aria-hidden="true"
                />
                <input
                  id={searchInputId}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm kiếm theo tên tiếng Việt, tiếng Anh, ký hiệu (\cong, V_4...) hoặc môn học..."
                  className="h-11 w-full rounded-xl border border-[#CFD9D5] bg-[#FFFFFF] pr-10 pl-10 text-sm text-[#142622] placeholder-[#5C706A]/75 shadow-[0_2px_10px_rgba(24,38,36,0.03)] transition-colors focus:border-[#1E332E] focus:ring-1 focus:ring-[#1E332E] focus:outline-hidden dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#E6ECE7] dark:placeholder-[#8CA097] dark:focus:border-[#6EB59B] dark:focus:ring-[#6EB59B]"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Xóa từ khóa tìm kiếm"
                    className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-md p-1 text-[#4A5D58] transition-colors hover:bg-[#EDF2F0] hover:text-[#142622] dark:text-[#A7B5AC] dark:hover:bg-[#1B3328] dark:hover:text-[#E6ECE7]"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Bộ lọc nhanh theo 4 sắc khoáng thạch môn học */}
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
                    'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-medium transition-all duration-150',
                    subjectFilter === 'all'
                      ? 'border-[#1E332E] bg-[#1E332E] text-[#FAFBF9] shadow-xs dark:border-[#6EB59B] dark:bg-[#245746] dark:text-[#FAFBF9]'
                      : 'border-[#CFD9D5] bg-[#FFFFFF] text-[#2D423D] hover:border-[#9C7A4C] hover:text-[#142622] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#C9D6D0] dark:hover:border-[#6EB59B]',
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
                  const style = SUBJECT_MINERAL_STYLES[subjectKey];
                  const isActive = subjectFilter === subjectKey;
                  return (
                    <button
                      key={subjectKey}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => setSubjectFilter(subjectKey)}
                      className={cn(
                        'inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 font-mono text-xs font-medium transition-all duration-150',
                        isActive
                          ? style.activeFilterClass
                          : 'border-[#CFD9D5] bg-[#FFFFFF] text-[#2D423D] hover:border-[#9C7A4C] hover:text-[#142622] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#C9D6D0] dark:hover:border-[#6EB59B]',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'h-2 w-2 shrink-0 rounded-full',
                          isActive ? 'bg-[#FAFBF9]' : style.dotClass,
                        )}
                      />
                      <span>{style.shortLabel}</span>
                      <span className="tabular-nums opacity-75">({subjectCounts[subjectKey]})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </BlueprintSectionFrame>

        {/* ================================================================
            THANH CHỈ MỤC A–Z CỐ ĐỊNH (STICKY A–Z INDEX RAIL)
            ================================================================ */}
        <nav
          aria-label="Chỉ mục chữ cái A đến Z"
          data-testid="glossary-az-rail"
          className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D4DFDA] bg-[#FAFBF9]/95 px-3.5 py-2.5 shadow-[0_8px_24px_rgba(24,38,36,0.05)] backdrop-blur-md dark:border-[#1E3B2D] dark:bg-[#12241C]/95"
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
                        ? 'cursor-pointer bg-[#1E332E] text-[#FAFBF9] dark:bg-[#245746] dark:text-[#FAFBF9]'
                        : 'cursor-pointer text-[#142622] hover:bg-[#E7ECEA] hover:text-[#8C6228] dark:text-[#E6ECE7] dark:hover:bg-[#1B3328] dark:hover:text-[#D5B47A]'
                      : 'pointer-events-none text-[#5C706A] opacity-30 dark:text-[#7E948B]',
                  )}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-[#4A5D58] dark:text-[#A7B5AC]">
            <span className="tabular-nums">
              Hiển thị{' '}
              <strong className="text-[#142622] dark:text-[#E6ECE7]">
                {filteredEntries.length}
              </strong>{' '}
              / {allEntries.length} mục
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#CFD9D5] bg-[#FFFFFF] px-2.5 py-1 text-[11px] font-semibold text-[#1E332E] transition-colors hover:border-[#9C7A4C] hover:text-[#8C6228] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#E6ECE7]"
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
                {/* Tiêu đề nhóm chữ cái chuẩn Almanac */}
                <div className="flex items-center gap-3 border-b border-[#D4DFDA] pb-2.5 dark:border-[#1E3B2D]">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#CFD9D5] bg-[#FAFBF9] font-serif text-xl font-bold text-[#142622] shadow-2xs dark:border-[#244335] dark:bg-[#12241C] dark:text-[#E6ECE7]">
                    {letter}
                  </span>
                  <span className="font-mono text-xs font-semibold tracking-wider text-[#8C6228] uppercase tabular-nums dark:text-[#D5B47A]">
                    {String(items.length).padStart(2, '0')} thuật ngữ
                  </span>
                </div>

                {/* Lưới 2 cột thẻ thuật ngữ */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {items.map((entry) => {
                    const meta = SUBJECT_MINERAL_STYLES[entry.subject];
                    const isCopied = copiedId === entry.id;
                    return (
                      <article
                        key={entry.id}
                        id={`term-${entry.id}`}
                        data-testid={`lexicon-card-${entry.id}`}
                        className={cn(
                          'group/card flex h-full scroll-mt-28 flex-col justify-between rounded-xl border border-l-[3px] border-[#D8E0DD] bg-[#FAFBF9] p-5 shadow-[0_2px_10px_rgba(24,38,36,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(24,38,36,0.07)] dark:border-[#1E3B2D] dark:bg-[#12241C] dark:hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]',
                          meta.borderLeftClass,
                        )}
                      >
                        <div className="space-y-3.5">
                          {/* Hàng đầu: Ký hiệu KaTeX + Tên Việt/Anh + Huy hiệu môn & Sao chép */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="inline-flex min-h-12 min-w-[54px] shrink-0 items-center justify-center rounded-lg border border-[#DCE4E0] bg-[#F2F4F3] px-2.5 py-1.5 dark:border-[#244335] dark:bg-[#0E1A15]">
                                <KatexMath
                                  math={entry.symbol}
                                  className="font-serif text-xl font-semibold text-[#142622] dark:text-[#E6ECE7]"
                                />
                              </div>

                              <div className="min-w-0">
                                <h2 className="font-serif text-[18px] leading-snug font-semibold text-[#142622] dark:text-[#E6ECE7]">
                                  {entry.nameVi}
                                </h2>
                                <p className="mt-0.5 font-mono text-[11px] text-[#5C706A] dark:text-[#98ABA3]">
                                  {entry.nameEn}
                                </p>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                              <span
                                className={cn(
                                  'hidden items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10.5px] font-semibold sm:inline-flex',
                                  meta.badgeClass,
                                )}
                              >
                                <span
                                  aria-hidden="true"
                                  className={cn('h-1.5 w-1.5 rounded-full', meta.dotClass)}
                                />
                                {entry.courseName || meta.label}
                              </span>

                              <button
                                type="button"
                                onClick={() => void handleCopyEntry(entry)}
                                aria-label={`Sao chép định nghĩa ${entry.nameVi}`}
                                title="Sao chép định nghĩa & đường dẫn neo"
                                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border border-[#D8E0DD] bg-[#FFFFFF] text-[#4A5D58] transition-colors hover:border-[#9C7A4C] hover:text-[#142622] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#A7B5AC] dark:hover:border-[#6EB59B] dark:hover:text-[#E6ECE7]"
                              >
                                {isCopied ? (
                                  <Check
                                    className="h-3.5 w-3.5 text-[#245746] dark:text-[#6EB59B]"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Huy hiệu môn học trên mobile */}
                          <div className="sm:hidden">
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
                              {entry.courseName || meta.label}
                            </span>
                          </div>

                          {/* Định nghĩa súc tích chuẩn KaTeX */}
                          <div className="text-[14.5px] leading-relaxed text-[#2D423D] dark:text-[#C9D6D0]">
                            <InlineMathText text={entry.brief} />
                          </div>

                          {/* Hộp Trực quan & Bản chất */}
                          <div className="space-y-1 rounded-lg border border-[#E2E8E5] bg-[#F3F6F4] p-3 text-[13.5px] leading-relaxed text-[#2D423D] dark:border-[#1E3B2D] dark:bg-[#0E1A15]/75 dark:text-[#B9C8C1]">
                            <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#8C6228] uppercase dark:text-[#D5B47A]">
                              <Lightbulb className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                              <span>Trực quan &amp; Bản chất</span>
                            </div>
                            <div>
                              <InlineMathText text={entry.intuition} />
                            </div>
                          </div>
                        </div>

                        {/* Chân thẻ: Neo ID + Liên kết trực tiếp Đọc tại bài giảng → */}
                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#E4EAE7] pt-3 dark:border-[#1E3B2D]">
                          <span className="truncate font-mono text-[10.5px] text-[#5C706A] dark:text-[#8CA097]">
                            #{entry.id}
                          </span>
                          <Link
                            to={entry.relatedLesson}
                            className="group/link inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#CFD9D5] bg-[#FFFFFF] px-3 py-1.5 text-xs font-semibold text-[#1E332E] transition-all duration-150 hover:border-[#9C7A4C] hover:bg-[#EDF2F0] hover:text-[#142622] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#E6ECE7] dark:hover:border-[#6EB59B] dark:hover:bg-[#1B3328]"
                          >
                            <BookOpen
                              className="h-3.5 w-3.5 text-[#8C6228] dark:text-[#D5B47A]"
                              aria-hidden="true"
                            />
                            <span>Đọc tại bài giảng</span>
                            <ArrowRight
                              className="h-3.5 w-3.5 transition-transform duration-150 group-hover/link:translate-x-0.5"
                              aria-hidden="true"
                            />
                          </Link>
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
            className="rounded-2xl border border-[#D8E0DD] bg-[#FAFBF9] px-6 py-14 text-center shadow-[0_6px_24px_rgba(24,38,36,0.04)] dark:border-[#1E3B2D] dark:bg-[#12241C]"
          >
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#CFD9D5] bg-[#F2F4F3] text-[#8C6228] dark:border-[#244335] dark:bg-[#0E1A15] dark:text-[#D5B47A]">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#142622] dark:text-[#E6ECE7]">
              Không tìm thấy thuật ngữ nào
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#4A5D58] dark:text-[#A7B5AC]">
              Không có kết quả phù hợp với từ khóa &ldquo;{query}&rdquo;. Hãy thử tìm bằng ký hiệu
              Toán học, thuật ngữ tiếng Anh hoặc đặt lại bộ lọc môn học.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E332E] px-5 py-2.5 text-sm font-semibold text-[#FAFBF9] shadow-xs transition-colors hover:bg-[#28443D] dark:bg-[#245746] dark:hover:bg-[#2D6B57]"
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
