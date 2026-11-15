import type { ManifestChapter, ManifestSubject } from '@schemas/index';
import {
  ArrowRight,
  BookOpen,
  Compass,
  FolderKanban,
  GraduationCap,
  Layers,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { TopographicWaterlinesBackdrop } from '@/components/home/HomeScrollTransitions';
import {
  LearningSpaceHeroCanvas,
  type OrbitalSubjectProgress,
} from '@/components/home/LearningSpaceHeroCanvas';
import { LearningSpaceHub } from '@/components/home/LearningSpaceHub';
import { getSubjects, getSubjectStats } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
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

interface ChapterSearchHit {
  readonly subject: ManifestSubject;
  readonly chapter: ManifestChapter;
  readonly href: string;
}

/**
 * Trang Không Gian Học Tập (/learning-space):
 * Hệ màu "Bạch Ngọc Khoáng Thạch & Trắng Sứ Dịu" (Balanced Mineral & Soft Porcelain):
 * - Nền trang: #F2F4F3 | Bề mặt: #FAFBF9 | Mực chữ: #182624
 * - Hero Spotlight Search phân nhóm 4 loại + Quick Chips & Bản đồ Quỹ đạo 4 Học Phần Tương Tác 120fps
 * - Atlas 4 Thẻ Học Phần Tương Tác 3D Tilt + Quỹ Đạo Học Tập Cá Nhân + Chuyển sắc mượt nối Footer
 */
export function LearningSpacePage() {
  const subjects = getSubjects();
  const navigate = useNavigate();
  const searchListboxId = useId();
  const gridPatternId = useId().replace(/:/g, '');
  const completedLessons = useLearningStore((state) => state.completedLessons);

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

  const totalChapterCount = subjects.reduce(
    (sum, sub) => sum + getSubjectStats(sub).chapterCount,
    0,
  );
  const totalLessonCount = subjects.reduce((sum, sub) => sum + getSubjectStats(sub).lessonCount, 0);
  const completedCount = Object.keys(completedLessons).length;
  const computedPercent =
    totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;
  const displayOrbitPercent = completedCount > 0 ? Math.max(computedPercent, 1) : 8;

  const orbitalSubjectProgress = useMemo<Readonly<Record<string, OrbitalSubjectProgress>>>(() => {
    const map: Record<string, OrbitalSubjectProgress> = {};
    for (const sub of subjects) {
      const stats = getSubjectStats(sub);
      let completed = 0;
      for (const ch of sub.chapters) {
        for (const ls of ch.lessons) {
          if (completedLessons[ls.id]) completed += 1;
        }
      }
      const percent = stats.lessonCount > 0 ? Math.round((completed / stats.lessonCount) * 100) : 0;
      map[sub.slug] = { completed, total: stats.lessonCount, percent };
    }
    return map;
  }, [completedLessons, subjects]);

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

  const handleSelectOrbitalSubject = (slug: string) => {
    const cardEl = document.getElementById(`atlas-subject-${slug}`);
    if (cardEl && typeof cardEl.scrollIntoView === 'function') {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    void navigate(ROUTES.subjectOverview(slug));
  };

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#F2F4F3] text-[#182624]">
      {/* =================================================================
        HERO BANNER SƯƠNG NGỌC KHOÁNG THẠCH DỊU (Balanced Mineral Mist)
        ================================================================= */}
      <section
        aria-label="Không gian Học tập & Nghiên cứu"
        className="relative z-30 pt-24 pb-4 sm:pt-28"
      >
        <div className="lu-container-wide">
          <div
            style={{
              background: 'linear-gradient(135deg, #EBF0EE 0%, #E2EAE7 55%, #E8ECE8 100%)',
            }}
            className="relative min-h-[420px] rounded-3xl border border-[#CBD6D2] p-8 text-[#162623] shadow-[0_10px_32px_rgba(24,38,36,0.05)] lg:p-11"
          >
            {/* Họa tiết lưới hình học khoáng thạch cực mờ (clip trong khung bo góc để Popover tìm kiếm không bị cắt) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl select-none"
            >
              <svg className="h-full w-full">
                <defs>
                  <pattern id={gridPatternId} width="56" height="56" patternUnits="userSpaceOnUse">
                    <path
                      d="M 56 0 L 0 0 0 56"
                      fill="none"
                      stroke="#243E38"
                      strokeOpacity="0.045"
                      strokeWidth="0.7"
                    />
                    <circle cx="56" cy="56" r="1.15" fill="#243E38" fillOpacity="0.055" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
                <circle
                  cx="78%"
                  cy="50%"
                  r="195"
                  fill="none"
                  stroke="#243E38"
                  strokeOpacity="0.055"
                  strokeWidth="0.8"
                  strokeDasharray="4 6"
                />
                <circle
                  cx="78%"
                  cy="50%"
                  r="265"
                  fill="none"
                  stroke="#3B6275"
                  strokeOpacity="0.045"
                  strokeWidth="0.7"
                />
              </svg>
            </div>

            <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="space-y-5 lg:col-span-7">
                {/* Breadcrumb */}
                <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#4A5D58]">
                  <Link to={ROUTES.home} className="transition-colors hover:text-[#182624]">
                    Trang chủ
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span className="font-semibold text-[#1E332E]">Không gian học tập</span>
                </div>

                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#CBD6D2] bg-[#FAFBF9]/85 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-[#1E332E] uppercase">
                    <Compass className="h-3.5 w-3.5 text-[#243E38]" aria-hidden="true" />
                    <span>ACADEMIC SANCTUARY · HỆ THỐNG HỌC PHẦN &amp; NGHIÊN CỨU</span>
                  </div>

                  <h1 className="font-serif text-3xl leading-tight font-bold tracking-tight text-[#162623] sm:text-4xl lg:text-5xl">
                    Không Gian Học Tập &amp; Nghiên Cứu
                  </h1>

                  <p className="max-w-2xl text-sm leading-relaxed text-[#3F524E] sm:text-base">
                    Toàn bộ kho tàng học phần Toán học và Khoa học Giáo dục, tra cứu ký hiệu KaTeX,
                    phòng mô phỏng hình học 3D và quỹ đạo tiến độ học tập cá nhân được tổ chức khoa
                    học tại đây.
                  </p>
                </div>

                {/* 3 Huy hiệu thống kê nền Trắng Sứ Dịu */}
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD6D2] bg-[#FAFBF9]/85 px-3.5 py-1.5 font-mono font-semibold text-[#182624] backdrop-blur-xs">
                    <Layers className="h-3.5 w-3.5 text-[#243E38]" aria-hidden="true" />
                    <span>{String(subjects.length).padStart(2, '0')} học phần cốt lõi</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD6D2] bg-[#FAFBF9]/85 px-3.5 py-1.5 font-mono font-semibold text-[#182624] backdrop-blur-xs">
                    <BookOpen className="h-3.5 w-3.5 text-[#3B6275]" aria-hidden="true" />
                    <span>
                      {totalChapterCount} chương · {totalLessonCount} bài giảng
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD6D2] bg-[#FAFBF9]/85 px-3.5 py-1.5 font-mono font-semibold text-[#182624] backdrop-blur-xs">
                    <GraduationCap className="h-3.5 w-3.5 text-[#8C7248]" aria-hidden="true" />
                    <span>Tiến độ cá nhân: {displayOrbitPercent}%</span>
                  </span>
                </div>

                {/* Ô Tìm kiếm Spotlight Tức thời + Từ khóa gợi ý nhanh */}
                <div ref={searchContainerRef} className="relative max-w-2xl space-y-2.5">
                  <form
                    onSubmit={handleSearchSubmit}
                    role="search"
                    aria-label="Tìm kiếm nội dung học tập"
                  >
                    <div className="relative flex h-12 w-full items-center rounded-2xl border border-[#CBD6D2] bg-[#FAFBF9]/95 px-4 text-sm text-[#182624] shadow-sm transition-all focus-within:border-[#1E332E] focus-within:ring-2 focus-within:ring-[#1E332E]/15">
                      <Search className="mr-3 h-4 w-4 shrink-0 text-[#4A5D58]" aria-hidden="true" />
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
                        className="w-full bg-transparent text-sm text-[#182624] placeholder:text-[#4A5D58] focus:outline-none"
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
                            className="rounded-lg p-1 text-[#4A5D58] transition-colors hover:bg-[#E7ECEA] hover:text-[#182624]"
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                        ) : (
                          <Kbd className="hidden border-[#CBD6D2] bg-[#EBF0EE] px-2 py-0.5 text-[11px] text-[#1E332E] sm:inline-flex">
                            /
                          </Kbd>
                        )}
                      </div>
                    </div>
                  </form>

                  {/* Hàng Từ khóa gợi ý nhanh (Quick Search Chips) */}
                  <div
                    data-testid="quick-search-chips"
                    className="flex flex-wrap items-center gap-1.5"
                  >
                    <span className="mr-1 font-mono text-[10.5px] font-semibold tracking-wider text-[#4A5D58] uppercase">
                      Gợi ý nhanh:
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
                              ? 'cursor-pointer rounded-full border border-[#1E332E] bg-[#1E332E] px-2.5 py-1 text-[11px] font-semibold text-[#FAFBF9] shadow-2xs transition-all'
                              : 'cursor-pointer rounded-full border border-[#CBD6D2] bg-[#FAFBF9]/85 px-2.5 py-1 text-[11px] font-medium text-[#3F524E] transition-all hover:border-[#1E332E] hover:bg-white hover:text-[#182624] active:scale-[0.98]'
                          }
                        >
                          {chip}
                        </button>
                      );
                    })}
                  </div>

                  {/* Popover Kết Quả Spotlight Tức Thời (Phân nhóm: Môn học · Chương · Bài giảng · Định lý/Thuật ngữ KaTeX) */}
                  {isSearchDropdownOpen && hasSearchQuery && (
                    <div
                      id={searchListboxId}
                      data-testid="spotlight-search-popover"
                      role="region"
                      aria-label="Kết quả tìm kiếm"
                      className="absolute top-14 right-0 left-0 z-50 max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-[#CBD6D2] bg-[#FAFBF9] p-3 shadow-2xl"
                    >
                      {totalSearchHitCount > 0 ? (
                        <>
                          {subjectHits.length > 0 && (
                            <div className="space-y-1">
                              <p className="px-2 font-mono text-[10px] font-bold tracking-wider text-[#4A5D58] uppercase">
                                Môn học ({subjectHits.length})
                              </p>
                              <ul className="space-y-1">
                                {subjectHits.map((result) => (
                                  <li key={`subject-${result.subject.id}`}>
                                    <Link
                                      to={result.href}
                                      onClick={() => setIsSearchDropdownOpen(false)}
                                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#EBF0EE]"
                                    >
                                      <div className="flex min-w-0 items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E7ECEA] text-[#1E332E]">
                                          <Layers className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-[#182624]">
                                              {result.subject.title}
                                            </span>
                                            <Badge variant="neutral">Môn học</Badge>
                                          </div>
                                          <p className="mt-0.5 line-clamp-1 text-xs text-[#4A5D58]">
                                            {result.subject.description}
                                          </p>
                                        </div>
                                      </div>
                                      <ArrowRight
                                        className="h-4 w-4 shrink-0 text-[#4A5D58]"
                                        aria-hidden="true"
                                      />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {chapterHits.length > 0 && (
                            <div className="space-y-1 border-t border-[#E7ECEA] pt-2">
                              <p className="px-2 font-mono text-[10px] font-bold tracking-wider text-[#4A5D58] uppercase">
                                Chương ({chapterHits.length})
                              </p>
                              <ul className="space-y-1">
                                {chapterHits.map((ch) => (
                                  <li key={`chapter-${ch.chapter.id}`}>
                                    <Link
                                      to={ch.href}
                                      onClick={() => setIsSearchDropdownOpen(false)}
                                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[#EBF0EE]"
                                    >
                                      <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#ECF1F4] text-[#2D5266]">
                                          <FolderKanban
                                            className="h-3.5 w-3.5"
                                            aria-hidden="true"
                                          />
                                        </div>
                                        <div className="min-w-0">
                                          <span className="block truncate text-xs font-semibold text-[#182624]">
                                            Chương {ch.chapter.number}: {ch.chapter.title}
                                          </span>
                                          <span className="font-mono text-[10.5px] text-[#4A5D58]">
                                            {ch.subject.title} · {ch.chapter.lessons.length} bài
                                          </span>
                                        </div>
                                      </div>
                                      <ArrowRight
                                        className="h-3.5 w-3.5 shrink-0 text-[#4A5D58]"
                                        aria-hidden="true"
                                      />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {lessonHits.length > 0 && (
                            <div className="space-y-1 border-t border-[#E7ECEA] pt-2">
                              <p className="px-2 font-mono text-[10px] font-bold tracking-wider text-[#4A5D58] uppercase">
                                Bài giảng ({lessonHits.length})
                              </p>
                              <ul className="space-y-1">
                                {lessonHits.map((result) => (
                                  <li key={`lesson-${result.lesson.id}`}>
                                    <Link
                                      to={result.href}
                                      onClick={() => setIsSearchDropdownOpen(false)}
                                      className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#EBF0EE]"
                                    >
                                      <div className="flex min-w-0 items-start gap-3">
                                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#E7ECEA] text-[#1E332E]">
                                          <BookOpen className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-semibold text-[#182624]">
                                              Bài {result.chapter.number}.{result.lesson.number}:{' '}
                                              <InlineMathText text={result.lesson.title} />
                                            </span>
                                            <Badge variant="neutral">{result.subject.title}</Badge>
                                          </div>
                                          <p className="mt-0.5 line-clamp-1 text-xs text-[#4A5D58]">
                                            <InlineMathText text={result.lesson.description} />
                                          </p>
                                        </div>
                                      </div>
                                      <ArrowRight
                                        className="h-4 w-4 shrink-0 text-[#4A5D58]"
                                        aria-hidden="true"
                                      />
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {glossaryHits.length > 0 && (
                            <div className="space-y-1 border-t border-[#E7ECEA] pt-2">
                              <p className="px-2 font-mono text-[10px] font-bold tracking-wider text-[#4A5D58] uppercase">
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
                                        className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-[#EBF0EE]"
                                      >
                                        <div className="flex min-w-0 items-start gap-3">
                                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3F0E8] text-[#6B5335]">
                                            <Sparkles className="h-4 w-4" aria-hidden="true" />
                                          </div>
                                          <div className="min-w-0 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="text-xs font-semibold text-[#182624]">
                                                {entry.nameVi}
                                              </span>
                                              <span className="rounded-md border border-[#D8D0C0] bg-[#FAFBF9] px-1.5 py-0.5 text-xs text-[#182624]">
                                                <KatexMath math={entry.formula || entry.symbol} />
                                              </span>
                                            </div>
                                            <p className="line-clamp-1 text-[11px] text-[#4A5D58]">
                                              <InlineMathText text={entry.brief} />
                                            </p>
                                          </div>
                                        </div>
                                        <ArrowRight
                                          className="h-3.5 w-3.5 shrink-0 text-[#4A5D58]"
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
                        <div className="px-4 py-6 text-center text-xs text-[#4A5D58]">
                          Không tìm thấy môn học, chương, bài học hoặc thuật ngữ nào khớp với{' '}
                          <strong className="font-semibold text-[#182624]">
                            &ldquo;{hubQuery}&rdquo;
                          </strong>
                          .
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Cột Phải Banner (5 cột): Bản đồ Quỹ đạo 4 Học Phần Tương Tác 120fps (tăng kích thước 1.35×) */}
              <div className="hidden flex-col items-center justify-center lg:col-span-5 lg:flex">
                <div className="relative w-full max-w-[475px]">
                  <LearningSpaceHeroCanvas
                    subjectProgress={orbitalSubjectProgress}
                    onSelectSubject={handleSelectOrbitalSubject}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Đường đồng mức nước chìm & Nội dung Không gian Học phần + Tiếp tục học tập */}
      <div className="relative bg-[#F2F4F3]">
        <TopographicWaterlinesBackdrop />
        <LearningSpaceHub hubQuery={hubQuery} onResetQuery={() => setHubQuery('')} />
      </div>

      {/* Dải chuyển sắc mềm cuối trang nối liền vào nền tối Footer (#0D211D) */}
      <div
        data-testid="learning-space-footer-transition"
        aria-hidden="true"
        style={{
          background: 'linear-gradient(180deg, #F2F4F3 0%, #DAE4E0 36%, #5E7B73 74%, #0D211D 100%)',
        }}
        className="pointer-events-none relative h-24 w-full"
      />
    </div>
  );
}

export default LearningSpacePage;
