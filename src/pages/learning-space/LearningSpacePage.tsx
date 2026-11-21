import type { ManifestChapter, ManifestSubject } from '@schemas/index';
import { ArrowRight, BookOpen, FolderKanban, Layers, Search, Sparkles, X } from 'lucide-react';
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { AtmosphericCanopy } from '@/components/atmosphere/AtmosphericCanopy';
import { LearningSpaceHeroCanvas } from '@/components/home/LearningSpaceHeroCanvas';
import { LearningSpaceHub } from '@/components/home/LearningSpaceHub';
import { getSubjects } from '@/content-runtime';
import { InlineMathText, KatexMath, searchGlossary } from '@/features/math-glossary';
import { searchContent } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { Badge, Kbd } from '@/shared/ui';

const QUICK_SEARCH_CHIPS: readonly string[] = [
  'Định lý Lagrange',
  'Nhóm thương',
  'Siêu mặt bậc hai',
  'Khai triển Taylor',
  'Tình huống sư phạm',
];

const HERO_SUBJECT_ORBITS: ReadonlyArray<{
  readonly slug: string;
  readonly code: string;
  readonly label: string;
  readonly color: string;
}> = [
  { slug: 'cau-truc-dai-so', code: 'CTĐS', label: 'Cấu trúc đại số', color: '#8C5828' },
  { slug: 'hinh-hoc-affine', code: 'HHAVE', label: 'Hình học Affine', color: '#1D4F6E' },
  {
    slug: 'giai-tich-ham-mot-bien',
    code: 'GTHMB',
    label: 'Giải tích hàm một biến',
    color: '#1B5E4A',
  },
  { slug: 'giao-duc-hoc', code: 'GDH', label: 'Giáo dục học', color: '#8F3D35' },
];

interface ChapterSearchHit {
  readonly subject: ManifestSubject;
  readonly chapter: ManifestChapter;
  readonly href: string;
}

/**
 * Trang Không Gian Học Tập (/learning-space) — Swiss Neo-Editorial (Sứ Bạch & Than Đá):
 * - Bố cục 2 cột thoáng đãng: Tiêu đề + mô tả 1 dòng + lọc tức thời bên trái; Mô hình đa diện 3D 120fps bên phải.
 * - Gỡ bỏ hoàn toàn lớp trang trí bản vẽ kỹ thuật dư thừa (telemetry, crosshair, spy rail, axiom marquee).
 */
export function LearningSpacePage() {
  const subjects = getSubjects();
  const navigate = useNavigate();
  const searchListboxId = useId();

  const [hubQuery, setHubQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === 'Escape') {
        setIsSearchDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const hasSearchQuery = hubQuery.trim().length > 0;
  const instantSearchResults = useMemo(() => searchContent(hubQuery, 12), [hubQuery]);

  const subjectHits = useMemo(
    () => instantSearchResults.filter((item) => item.kind === 'subject').slice(0, 4),
    [instantSearchResults],
  );

  const chapterHits = useMemo<readonly ChapterSearchHit[]>(() => {
    if (!hasSearchQuery) return [];
    const hits: ChapterSearchHit[] = [];
    for (const sub of subjects) {
      for (const ch of sub.chapters) {
        const hay = `Chương ${ch.number} ${ch.title} ${ch.description ?? ''} ${sub.title}`;
        if (matchesVietnameseQuery(hay, hubQuery)) {
          hits.push({
            subject: sub,
            chapter: ch,
            href: `${ROUTES.subjectOverview(sub.slug)}?chapter=${ch.slug}`,
          });
        }
      }
    }
    return hits.slice(0, 5);
  }, [hasSearchQuery, hubQuery, subjects]);

  const lessonHits = useMemo(
    () => instantSearchResults.filter((item) => item.kind === 'lesson').slice(0, 6),
    [instantSearchResults],
  );

  const glossaryHits = useMemo(() => {
    if (!hasSearchQuery) return [];
    return searchGlossary({ query: hubQuery }).slice(0, 5);
  }, [hasSearchQuery, hubQuery]);

  const totalSearchHitCount =
    subjectHits.length + chapterHits.length + lessonHits.length + glossaryHits.length;

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const firstHref =
      subjectHits[0]?.href ??
      chapterHits[0]?.href ??
      lessonHits[0]?.href ??
      (glossaryHits[0] ? (glossaryHits[0].lessonUrl ?? glossaryHits[0].relatedLesson) : undefined);

    if (firstHref) {
      setIsSearchDropdownOpen(false);
      void navigate(firstHref);
    }
  };

  const handleQuickChipSelect = (chipQuery: string) => {
    setHubQuery(chipQuery);
    setIsSearchDropdownOpen(true);
    searchInputRef.current?.focus();
  };

  return (
    <div
      data-testid="learning-space-page"
      className="relative min-h-screen bg-[var(--bg-workspace)] text-[var(--text-main)]"
    >
      {/* Dải sương khí quyển mảnh 180–200px hòa tan mượt xuống mặt phẳng học thuật */}
      <AtmosphericCanopy
        variant="learning-space"
        backgroundOnly
        enableCelestialOverlay={false}
        testId="learning-space-atmospheric-wash"
        className="h-[180px] sm:h-[200px]"
      />

      <div className="relative z-10 mx-auto max-w-[1240px] space-y-8 px-6 py-8 lg:px-10">
        {/* KHỐI ĐẦU TRANG 2 CỘT CÂN ĐỐI SWISS NEO-EDITORIAL */}
        <section
          id="khoi-dau"
          aria-label="Không gian Học tập"
          className="grid grid-cols-1 items-center gap-8 border-b border-[var(--border-hairline)] pb-8 lg:grid-cols-12"
        >
          {/* Cột Trái (7 cột): Tiêu đề, mô tả tinh gọn, dải nhảy nhanh 4 môn, ô tìm kiếm lọc tức thời */}
          <div className="space-y-5 lg:col-span-7">
            <div className="space-y-2">
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--text-main)] sm:text-4xl">
                Không Gian Học Tập
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
                Kiến trúc lý thuyết tiên đề, mô phỏng trực quan và bản đồ liên kết tri thức giữa
                Toán học đại học với Khoa học Giáo dục.
              </p>
            </div>

            {/* Dải nhảy nhanh 4 quỹ đạo học phần */}
            <div className="flex flex-wrap items-center gap-2">
              {HERO_SUBJECT_ORBITS.map((orbit) => (
                <a
                  key={orbit.slug}
                  href={`#atlas-subject-${orbit.slug}`}
                  className="group inline-flex items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition-all duration-150 hover:-translate-y-0.5 hover:border-[var(--border-strong)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)] hover:shadow-2xs"
                >
                  <span
                    className="h-2 w-2 rounded-full transition-transform duration-150 group-hover:scale-125"
                    style={{ backgroundColor: orbit.color }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-[10.5px] font-bold text-[var(--text-main)]">
                    {orbit.code}
                  </span>
                  <span className="hidden sm:inline">{orbit.label}</span>
                </a>
              ))}
            </div>

            {/* Ô Tìm kiếm lọc tức thời môn / chương / bài / thuật ngữ */}
            <div ref={searchContainerRef} className="relative max-w-2xl space-y-2.5">
              <form
                onSubmit={handleSearchSubmit}
                role="search"
                aria-label="Tìm kiếm nội dung học tập"
              >
                <div className="relative flex h-11 w-full items-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3.5 text-sm text-[var(--text-main)] transition-colors focus-within:border-[var(--accent-os)] focus-within:bg-[var(--bg-workspace)]">
                  <Search
                    className="mr-2.5 h-4 w-4 shrink-0 text-[var(--text-muted)]"
                    aria-hidden="true"
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={hubQuery}
                    onChange={(event) => {
                      setHubQuery(event.target.value);
                      setIsSearchDropdownOpen(true);
                    }}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    placeholder="Tìm nhanh môn học, chương, định lý hoặc bài giảng..."
                    aria-label="Tìm kiếm môn học hoặc bài học"
                    aria-expanded={isSearchDropdownOpen && hasSearchQuery}
                    aria-controls={searchListboxId}
                    className="w-full bg-transparent text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
                  />
                  <div className="flex shrink-0 items-center gap-1.5 pl-2">
                    {hasSearchQuery ? (
                      <button
                        type="button"
                        aria-label="Xóa từ khóa tìm kiếm"
                        onClick={() => {
                          setHubQuery('');
                          searchInputRef.current?.focus();
                        }}
                        className="cursor-pointer rounded-md p-1 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-shell)] hover:text-[var(--text-main)]"
                      >
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <Kbd className="hidden border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 text-[11px] text-[var(--text-muted)] sm:inline-flex">
                        /
                      </Kbd>
                    )}
                  </div>
                </div>
              </form>

              {/* Chip gợi ý nhanh */}
              <div data-testid="quick-search-chips" className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 font-mono text-[10.5px] font-medium text-[var(--text-muted)]">
                  Gợi ý:
                </span>
                {QUICK_SEARCH_CHIPS.map((chip) => {
                  const isActive = hubQuery.trim().toLowerCase() === chip.toLowerCase();
                  return (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleQuickChipSelect(chip)}
                      className={
                        isActive
                          ? 'cursor-pointer rounded-full border border-[var(--accent-os)] bg-[var(--accent-os)] px-2.5 py-1 text-[11px] font-semibold text-white transition-colors'
                          : 'cursor-pointer rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)] active:scale-[0.98]'
                      }
                    >
                      {chip}
                    </button>
                  );
                })}
              </div>

              {/* Popover kết quả lọc tức thời */}
              {isSearchDropdownOpen && hasSearchQuery && (
                <div
                  id={searchListboxId}
                  data-testid="spotlight-search-popover"
                  role="region"
                  aria-label="Kết quả tìm kiếm"
                  className="absolute top-13 right-0 left-0 z-50 max-h-[420px] space-y-3 overflow-y-auto rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 shadow-2xl"
                >
                  {totalSearchHitCount > 0 ? (
                    <>
                      {subjectHits.length > 0 && (
                        <div className="space-y-1">
                          <p className="px-2 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                            Môn học ({subjectHits.length})
                          </p>
                          <ul className="space-y-1">
                            {subjectHits.map((result) => (
                              <li key={`subject-${result.subject.id}`}>
                                <Link
                                  to={result.href}
                                  onClick={() => setIsSearchDropdownOpen(false)}
                                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--bg-surface)]"
                                >
                                  <div className="flex min-w-0 items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--accent-os)]">
                                      <Layers className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-[var(--text-main)]">
                                          {result.subject.title}
                                        </span>
                                        <Badge variant="neutral">Môn học</Badge>
                                      </div>
                                      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-secondary)]">
                                        {result.subject.description}
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight
                                    className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {chapterHits.length > 0 && (
                        <div className="space-y-1 border-t border-[var(--border-hairline)] pt-2">
                          <p className="px-2 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                            Chương ({chapterHits.length})
                          </p>
                          <ul className="space-y-1">
                            {chapterHits.map((ch) => (
                              <li key={`chapter-${ch.chapter.id}`}>
                                <Link
                                  to={ch.href}
                                  onClick={() => setIsSearchDropdownOpen(false)}
                                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--bg-surface)]"
                                >
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--accent-os)]">
                                      <FolderKanban className="h-3.5 w-3.5" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                      <span className="block truncate text-xs font-semibold text-[var(--text-main)]">
                                        Chương {ch.chapter.number}: {ch.chapter.title}
                                      </span>
                                      <span className="font-mono text-[10.5px] text-[var(--text-muted)]">
                                        {ch.subject.title} · {ch.chapter.lessons.length} bài
                                      </span>
                                    </div>
                                  </div>
                                  <ArrowRight
                                    className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {lessonHits.length > 0 && (
                        <div className="space-y-1 border-t border-[var(--border-hairline)] pt-2">
                          <p className="px-2 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                            Bài giảng ({lessonHits.length})
                          </p>
                          <ul className="space-y-1">
                            {lessonHits.map((result) => (
                              <li key={`lesson-${result.lesson.id}`}>
                                <Link
                                  to={result.href}
                                  onClick={() => setIsSearchDropdownOpen(false)}
                                  className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--bg-surface)]"
                                >
                                  <div className="flex min-w-0 items-start gap-3">
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--accent-os)]">
                                      <BookOpen className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-semibold text-[var(--text-main)]">
                                          Bài {result.chapter.number}.{result.lesson.number}:{' '}
                                          <InlineMathText text={result.lesson.title} />
                                        </span>
                                        <Badge variant="neutral">{result.subject.title}</Badge>
                                      </div>
                                      <p className="mt-0.5 line-clamp-1 text-xs text-[var(--text-secondary)]">
                                        <InlineMathText text={result.lesson.description} />
                                      </p>
                                    </div>
                                  </div>
                                  <ArrowRight
                                    className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                                    aria-hidden="true"
                                  />
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {glossaryHits.length > 0 && (
                        <div className="space-y-1 border-t border-[var(--border-hairline)] pt-2">
                          <p className="px-2 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                            Định lý &amp; Thuật ngữ KaTeX ({glossaryHits.length})
                          </p>
                          <ul className="space-y-1">
                            {glossaryHits.map((entry) => {
                              const targetHref = entry.lessonUrl ?? entry.relatedLesson;
                              return (
                                <li key={`glossary-${entry.id}`}>
                                  <Link
                                    to={targetHref}
                                    onClick={() => setIsSearchDropdownOpen(false)}
                                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-[var(--bg-surface)]"
                                  >
                                    <div className="flex min-w-0 items-start gap-3">
                                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--accent-heritage)]">
                                        <Sparkles className="h-4 w-4" aria-hidden="true" />
                                      </div>
                                      <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-xs font-semibold text-[var(--text-main)]">
                                            {entry.nameVi}
                                          </span>
                                          <span className="rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-xs text-[var(--text-main)]">
                                            <KatexMath math={entry.formula || entry.symbol} />
                                          </span>
                                        </div>
                                        <p className="line-clamp-1 text-[11px] text-[var(--text-secondary)]">
                                          <InlineMathText text={entry.brief} />
                                        </p>
                                      </div>
                                    </div>
                                    <ArrowRight
                                      className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
                                      aria-hidden="true"
                                    />
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="px-4 py-6 text-center text-xs text-[var(--text-secondary)]">
                      Không tìm thấy môn học, chương, bài học hoặc thuật ngữ nào khớp với{' '}
                      <strong className="font-semibold text-[var(--text-main)]">
                        &ldquo;{hubQuery}&rdquo;
                      </strong>
                      .
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Cột Phải (5 cột): Mô hình đa diện 3D đặt nổi tự do trên dải khí quyển (không viền hộp cứng) */}
          <div
            data-testid="hero-3d-column"
            className="hidden flex-col items-center justify-center p-2 md:flex lg:col-span-5"
          >
            <div className="relative w-full">
              <LearningSpaceHeroCanvas />
            </div>
          </div>
        </section>

        {/* LƯỚI 4 HỌC PHẦN & KHU PHÂN TÍCH NĂNG LỰC / LỘ TRÌNH */}
        <LearningSpaceHub hubQuery={hubQuery} onResetQuery={() => setHubQuery('')} />
      </div>
    </div>
  );
}

export default LearningSpacePage;
