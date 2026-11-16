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
import { LearningSpaceHeroCanvas } from '@/components/home/LearningSpaceHeroCanvas';
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
 * - Nền Hero đa lớp tán xạ ánh sáng Ngọc Bích Sương (#DCECE5), Hổ Phách Nhạt (#EFE8D8), Lam Khói (#E2EBF0)
 * - Khối điêu khắc đa diện lồng nhau & 4 vòng Thiên cầu Hoàng Kim 3D (120fps) bên phải Hero
 * - Atlas 4 Thẻ Học Phần với hiệu ứng Spotlight Aura phẳng tuyệt đối + Quỹ đạo học tập & Biểu đồ phân tích
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
    <div className="relative min-h-screen overflow-x-clip bg-[var(--bg-page,#F2F4F3)] px-4 py-6 text-[#182624] sm:px-6 lg:px-8">
      {/* Hiệu ứng Vignette đài thiên văn cực nhẹ ở 4 mép ngoài viewport */}
      <div
        aria-hidden="true"
        data-testid="observatory-vignette"
        style={{ boxShadow: 'inset 0 0 80px rgba(15, 30, 38, 0.04)' }}
        className="pointer-events-none fixed inset-0 z-40"
      />

      {/* Khung trưng bày học thuật bao quanh toàn bộ trang với 4 dấu ngoặc góc trắc địa */}
      <div
        data-testid="learning-space-perimeter-frame"
        className="relative mx-auto min-h-[calc(100vh-3rem)] rounded-[28px] border border-[#D8E0DD]/75 bg-[var(--bg-page,#F2F4F3)] pb-10 shadow-[0_12px_40px_rgba(24,38,36,0.03)]"
      >
        {/* 4 Dấu ngoặc góc tọa độ trắc địa (12px x 12px) */}
        <div
          aria-hidden="true"
          data-testid="geodesic-corner-brackets"
          className="pointer-events-none absolute inset-3 z-30"
        >
          <span className="absolute top-0 left-0 h-3 w-3 border-t border-l border-[rgba(30,51,46,0.25)]" />
          <span className="absolute top-0 right-0 h-3 w-3 border-t border-r border-[rgba(30,51,46,0.25)]" />
          <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[rgba(30,51,46,0.25)]" />
          <span className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-[rgba(30,51,46,0.25)]" />
        </div>

        {/* =================================================================
          HERO BANNER SƯƠNG NGỌC KHOÁNG THẠCH ĐA TẦNG (Volumetric Frosted Mineral)
          ================================================================= */}
        <section aria-label="Không gian Học tập" className="relative z-30 pt-20 pb-4 sm:pt-24">
          <div className="lu-container-wide">
            <div
              style={{
                background:
                  'radial-gradient(640px circle at 14% 18%, rgba(220, 236, 229, 0.92), transparent 64%), radial-gradient(620px circle at 48% 92%, rgba(239, 232, 216, 0.85), transparent 62%), radial-gradient(560px circle at 88% 28%, rgba(226, 235, 240, 0.94), transparent 65%), linear-gradient(135deg, rgba(250, 251, 249, 0.94) 0%, rgba(240, 245, 243, 0.92) 55%, rgba(244, 247, 245, 0.95) 100%)',
              }}
              className="relative min-h-[430px] rounded-3xl border border-[#D8E0DD] p-8 text-[#162623] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_20px_60px_rgba(24,38,36,0.06)] backdrop-blur-md transition-shadow duration-300 lg:p-11"
            >
              {/* Lớp Lưới tọa độ trắc địa mờ (Engineering Blueprint Grid) & đường đồng mức hình học */}
              <div
                aria-hidden="true"
                data-testid="hero-blueprint-grid"
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl select-none"
              >
                <svg className="h-full w-full">
                  <defs>
                    <pattern
                      id={`${gridPatternId}-minor`}
                      width="24"
                      height="24"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 24 0 L 0 0 0 24"
                        fill="none"
                        stroke="rgba(30, 50, 45, 0.03)"
                        strokeWidth="0.7"
                      />
                    </pattern>
                    <pattern
                      id={gridPatternId}
                      width="96"
                      height="96"
                      patternUnits="userSpaceOnUse"
                    >
                      <rect width="96" height="96" fill={`url(#${gridPatternId}-minor)`} />
                      <path
                        d="M 96 0 L 0 0 0 96"
                        fill="none"
                        stroke="rgba(30, 50, 45, 0.05)"
                        strokeWidth="0.9"
                      />
                      <path
                        d="M 92 96 L 96 96 L 96 92"
                        fill="none"
                        stroke="rgba(30, 50, 45, 0.08)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill={`url(#${gridPatternId})`} />
                  {/* Vòng đồng mức thiên cầu khắc chìm bên phải */}
                  <circle
                    cx="78%"
                    cy="50%"
                    r="172"
                    fill="none"
                    stroke="#8C6D3F"
                    strokeOpacity="0.09"
                    strokeWidth="0.9"
                    strokeDasharray="3 5"
                  />
                  <circle
                    cx="78%"
                    cy="50%"
                    r="238"
                    fill="none"
                    stroke="#243E38"
                    strokeOpacity="0.065"
                    strokeWidth="0.85"
                  />
                  <circle
                    cx="78%"
                    cy="50%"
                    r="305"
                    fill="none"
                    stroke="#2D5266"
                    strokeOpacity="0.055"
                    strokeWidth="0.8"
                    strokeDasharray="6 8"
                  />
                  {/* Đường đồng mức toán học uốn lượn tinh xảo */}
                  <path
                    d="M -40 340 C 190 290, 360 390, 580 315 C 770 250, 960 360, 1280 280"
                    fill="none"
                    stroke="#243E38"
                    strokeOpacity="0.055"
                    strokeWidth="1"
                  />
                  <path
                    d="M -40 372 C 210 322, 390 412, 620 338 C 820 274, 990 385, 1280 312"
                    fill="none"
                    stroke="#8C6D3F"
                    strokeOpacity="0.06"
                    strokeWidth="0.9"
                  />
                </svg>
              </div>

              <div className="relative z-10 flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-5 lg:w-[58%]">
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
                      <span>ACADEMIC SANCTUARY · HỆ THỐNG HỌC PHẦN</span>
                    </div>

                    <h1 className="font-serif text-3xl leading-tight font-bold tracking-tight text-[#162623] sm:text-4xl lg:text-5xl">
                      Không Gian Học Tập
                    </h1>

                    <p className="max-w-2xl text-sm leading-relaxed text-[#3F524E] sm:text-base">
                      Toàn bộ kho tàng học phần Toán học và Khoa học Giáo dục, biểu đồ phân tích
                      năng lực, mạng lưới liên kết tri thức liên môn và quỹ đạo tiến độ học tập cá
                      nhân được tổ chức khoa học tại đây.
                    </p>
                  </div>

                  {/* 3 Huy hiệu thống kê nền Trắng Sứ Dịu */}
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#CBD6D2] bg-[#FAFBF9]/85 px-3.5 py-1.5 font-mono font-semibold text-[#182624] backdrop-blur-xs">
                      <Layers className="h-3.5 w-3.5 text-[#243E38]" aria-hidden="true" />
                      <span>{String(subjects.length).padStart(2, '0')} học phần</span>
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
                        <Search
                          className="mr-3 h-4 w-4 shrink-0 text-[#4A5D58]"
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
                                              <Badge variant="neutral">
                                                {result.subject.title}
                                              </Badge>
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

                {/* Cột Phải Banner (42% chiều rộng): Điêu khắc Đa diện Lồng nhau & Thiên cầu Hoàng Kim 3D 120fps */}
                <div className="hidden flex-col items-center justify-center lg:flex lg:w-[42%]">
                  <div className="relative w-full">
                    <LearningSpaceHeroCanvas />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dải phân cách hình học trắc địa giữa Hero & Hệ thống học phần */}
        <div aria-hidden="true" className="lu-container-wide relative z-20 pt-5 pb-1">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D8E0DD] to-[#CBD6D2]" />
            <div className="flex items-center gap-1.5 text-[#8C6D3F]/75">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C89738]/80" />
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6 0.5L7.3 4.7L11.5 6L7.3 7.3L6 11.5L4.7 7.3L0.5 6L4.7 4.7L6 0.5Z"
                  stroke="currentColor"
                  strokeWidth="0.9"
                />
              </svg>
              <span className="h-1.5 w-1.5 rounded-full bg-[#C89738]/80" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#D8E0DD] to-[#CBD6D2]" />
          </div>
        </div>

        {/* Đường đồng mức nước chìm & Nội dung Không gian Học phần + Tiếp tục học tập */}
        <div className="relative bg-transparent">
          <TopographicWaterlinesBackdrop />
          <LearningSpaceHub hubQuery={hubQuery} onResetQuery={() => setHubQuery('')} />
        </div>
      </div>
    </div>
  );
}

export default LearningSpacePage;
