import type { ManifestChapter, ManifestSubject } from '@schemas/index';
import {
  ArrowRight,
  BookOpen,
  Compass,
  FolderKanban,
  Layers,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import { type FormEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  AcademicAxiomBand,
  BlueprintSectionFrame,
  EngravedGroundCanvas,
  TelemetrySpecBar,
} from '@/components/fx';
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
  const completedLessons = useLearningStore((state) => state.completedLessons);

  const [hubQuery, setHubQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [activeSpySection, setActiveSpySection] = useState<
    'khoi-dau' | 'khong-gian-mon-hoc' | 'quy-dao-hoc-tap'
  >('khoi-dau');

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sectionIds = ['khoi-dau', 'khong-gian-mon-hoc', 'quy-dao-hoc-tap'] as const;
    const handleScrollSpy = () => {
      const markerY = window.scrollY + window.innerHeight * 0.32;
      let current: (typeof sectionIds)[number] = 'khoi-dau';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (markerY >= top) current = id;
      }
      setActiveSpySection((prev) => (prev === current ? prev : current));
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, []);

  const handleSpyJump = (targetId: 'khoi-dau' | 'khong-gian-mon-hoc' | 'quy-dao-hoc-tap') => {
    setActiveSpySection(targetId);
    const el = document.getElementById(targetId);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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

      {/* Trục Cánh Trái (Left Section Spy Rail cố định trên màn hình rộng 2xl+) */}
      <nav
        aria-label="Điều hướng phân khu Không gian học tập"
        data-testid="learning-space-spy-rail"
        className="fixed top-1/2 left-5 z-30 hidden -translate-y-1/2 flex-col items-center gap-4 2xl:flex"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-3 bottom-3 left-1/2 w-px -translate-x-1/2 bg-[#CBD6D2]"
        />
        {(
          [
            { id: 'khoi-dau', label: '01 · KHỞI ĐẦU' },
            { id: 'khong-gian-mon-hoc', label: '02 · HỌC PHẦN' },
            { id: 'quy-dao-hoc-tap', label: '03 · QUỸ ĐẠO' },
          ] as const
        ).map((milestone) => {
          const isActive = activeSpySection === milestone.id;
          return (
            <button
              key={milestone.id}
              type="button"
              onClick={() => handleSpyJump(milestone.id)}
              aria-current={isActive ? 'location' : undefined}
              className={
                isActive
                  ? 'relative z-10 cursor-pointer rounded-full border border-[#1E332E] bg-[#1E332E] px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-wider whitespace-nowrap text-[#FAFBF9] shadow-sm transition-all'
                  : 'relative z-10 cursor-pointer rounded-full border border-[#CBD6D2] bg-[#FAFBF9]/90 px-2.5 py-1.5 font-mono text-[10px] font-medium tracking-wider whitespace-nowrap text-[#4A5D58] backdrop-blur-xs transition-all hover:border-[#1E332E]/50 hover:text-[#1E332E]'
              }
            >
              {milestone.label}
            </button>
          );
        })}
      </nav>

      {/* Khung trưng bày học thuật bao quanh toàn bộ trang với 4 dấu ngoặc góc trắc địa */}
      <div
        data-testid="learning-space-perimeter-frame"
        className="relative mx-auto min-h-[calc(100vh-3rem)] overflow-hidden rounded-[28px] border border-[#D8E0DD]/75 bg-[var(--bg-page,#F2F4F3)] pb-10 shadow-[0_12px_40px_rgba(24,38,36,0.03)]"
      >
        {/* Họa tiết Cánh Phải & Trái Ngoại Vi (Ambient Geodesic Wing & Side Ornaments) */}
        <div
          aria-hidden="true"
          data-testid="ambient-geodesic-wings"
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden select-none"
        >
          <svg
            viewBox="0 0 1600 1200"
            preserveAspectRatio="none"
            className="h-full w-full opacity-[0.055]"
            fill="none"
          >
            {/* Hệ cung tròn trắc địa & lưới tọa độ cực bán nguyệt bên mép trái */}
            <circle cx="0" cy="360" r="240" stroke="#1E332E" strokeWidth="1.2" />
            <circle
              cx="0"
              cy="360"
              r="340"
              stroke="#9C7A4C"
              strokeWidth="1"
              strokeDasharray="6 8"
            />
            <circle cx="0" cy="360" r="440" stroke="#1E332E" strokeWidth="0.9" />
            <circle cx="0" cy="920" r="280" stroke="#9C7A4C" strokeWidth="1" />
            <line x1="0" y1="360" x2="340" y2="210" stroke="#1E332E" strokeWidth="0.7" />
            <line x1="0" y1="360" x2="360" y2="510" stroke="#9C7A4C" strokeWidth="0.7" />

            {/* Hệ cung tròn trắc địa & lưới tọa độ cực bán nguyệt bên mép phải */}
            <circle cx="1600" cy="360" r="240" stroke="#1E332E" strokeWidth="1.2" />
            <circle
              cx="1600"
              cy="360"
              r="340"
              stroke="#9C7A4C"
              strokeWidth="1"
              strokeDasharray="6 8"
            />
            <circle cx="1600" cy="360" r="440" stroke="#1E332E" strokeWidth="0.9" />
            <circle cx="1600" cy="920" r="280" stroke="#9C7A4C" strokeWidth="1" />
            <line x1="1600" y1="360" x2="1260" y2="210" stroke="#1E332E" strokeWidth="0.7" />
            <line x1="1600" y1="360" x2="1240" y2="510" stroke="#9C7A4C" strokeWidth="0.7" />
          </svg>
        </div>

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
        <section
          id="khoi-dau"
          aria-label="Không gian Học tập"
          className="relative z-30 scroll-mt-24 pt-20 pb-1 sm:pt-24"
        >
          <div className="mx-auto w-full max-w-[1400px] px-6 lg:px-10">
            <BlueprintSectionFrame
              data-testid="hero-blueprint-frame"
              crosshairColor="#9C7A4C"
              crosshairOpacity={0.65}
              showInnerKeyline
              className="rounded-[2px] border-[#CFD8D4] shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_20px_60px_rgba(24,38,36,0.06)] backdrop-blur-md"
              innerClassName="overflow-hidden rounded-[2px]"
            >
              <TelemetrySpecBar
                sectionCode="DOC. LU-2026 // ACADEMIC SANCTUARY"
                subtitle="HỆ THỐNG HỌC PHẦN & ĐỊA ĐỒ TRI THỨC"
                items={[
                  { label: 'HỌC PHẦN', value: String(subjects.length).padStart(2, '0') },
                  { label: 'BÀI GIẢNG', value: String(totalLessonCount) },
                  { label: 'QUỸ ĐẠO', value: `${displayOrbitPercent}%` },
                ]}
              />

              <div
                style={{
                  background:
                    'radial-gradient(640px circle at 14% 18%, rgba(220, 236, 229, 0.92), transparent 64%), radial-gradient(620px circle at 48% 92%, rgba(239, 232, 216, 0.85), transparent 62%), radial-gradient(560px circle at 88% 28%, rgba(226, 235, 240, 0.94), transparent 65%), linear-gradient(135deg, rgba(250, 251, 249, 0.96) 0%, rgba(240, 245, 243, 0.94) 55%, rgba(244, 247, 245, 0.96) 100%)',
                }}
                className="relative min-h-[420px] p-8 text-[#162623] lg:p-11"
              >
                {/* Lớp Lưới chuẩn độ Ruled-Grounds & Khắc Tuyến Tính 120fps được che mượt vùng đọc bên trái */}
                <div
                  aria-hidden="true"
                  data-testid="hero-blueprint-grid"
                  style={{
                    WebkitMaskImage:
                      'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,1) 100%)',
                    maskImage:
                      'linear-gradient(90deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.12) 42%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,1) 100%)',
                  }}
                  className="pointer-events-none absolute inset-0 overflow-hidden select-none"
                >
                  <EngravedGroundCanvas
                    step={16}
                    crosshairEvery={4}
                    calmLeftFraction={0.46}
                    rosetteCenterX={0.75}
                    rosetteCenterY={0.5}
                  />
                </div>

                <div className="relative z-10 flex flex-col items-stretch gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-5 lg:w-[54%]">
                    {/* Breadcrumb */}
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[#4A5D58]">
                      <Link to={ROUTES.home} className="transition-colors hover:text-[#182624]">
                        Trang chủ
                      </Link>
                      <span aria-hidden="true">/</span>
                      <span className="font-semibold text-[#1E332E]">Không gian học tập</span>
                    </div>

                    <div className="space-y-3">
                      <div
                        data-testid="hero-eyebrow-badge"
                        className="inline-flex w-fit items-center gap-2 rounded-lg border border-[#D4DFDA] bg-[#FAFBF9] px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#354E48] uppercase shadow-[0_1px_2px_rgba(24,38,36,0.03)]"
                      >
                        <Compass
                          className="h-3.5 w-3.5 shrink-0 text-[#354E48]"
                          aria-hidden="true"
                        />
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

                    {/* Thanh Chỉ Số Phân Đoạn Liền Khối (Unified Architectural Stat Strip) */}
                    <div
                      data-testid="hero-unified-stat-strip"
                      className="inline-flex flex-wrap items-center divide-x divide-[#E0E7E4] overflow-hidden rounded-xl border border-[#D4DFDA] bg-[#FAFBF9] shadow-[0_2px_10px_rgba(24,38,36,0.035)]"
                    >
                      <div className="inline-flex items-center gap-2 bg-[#FAFBF9] px-3.5 py-2 text-xs text-[#3F524E]">
                        <Layers
                          className="h-3.5 w-3.5 shrink-0 text-[#4A635D]"
                          aria-hidden="true"
                        />
                        <span className="font-mono">
                          <span className="font-semibold text-[#182624] tabular-nums">
                            {String(subjects.length).padStart(2, '0')}
                          </span>{' '}
                          học phần
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-[#FAFBF9] px-3.5 py-2 text-xs text-[#3F524E]">
                        <BookOpen
                          className="h-3.5 w-3.5 shrink-0 text-[#4A635D]"
                          aria-hidden="true"
                        />
                        <span className="font-mono">
                          <span className="font-semibold text-[#182624] tabular-nums">
                            {totalChapterCount}
                          </span>{' '}
                          chương ·{' '}
                          <span className="font-semibold text-[#182624] tabular-nums">
                            {totalLessonCount}
                          </span>{' '}
                          bài giảng
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-[#FAFBF9] px-3.5 py-2 text-xs text-[#3F524E]">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 shrink-0 rounded-full bg-[#245746]"
                        />
                        <span className="font-mono">
                          Tiến độ cá nhân:{' '}
                          <span className="font-semibold text-[#182624] tabular-nums">
                            {displayOrbitPercent}%
                          </span>
                        </span>
                        <span
                          aria-hidden="true"
                          className="h-1.5 w-10 overflow-hidden rounded-full bg-[#E3EAE7]"
                        >
                          <span
                            className="block h-full rounded-full bg-[#245746] transition-[width] duration-500"
                            style={{ width: `${Math.max(displayOrbitPercent, 6)}%` }}
                          />
                        </span>
                      </div>
                    </div>

                    {/* Ô Tìm kiếm Spotlight Tức thời nền trắng sứ #FFFFFF & Chip gợi ý nhanh nền sứ sạch */}
                    <div
                      ref={searchContainerRef}
                      className="lu-fx-search relative max-w-2xl space-y-2.5"
                    >
                      <div
                        aria-hidden="true"
                        data-testid="fx-search-glow"
                        className="lu-fx-search-glow"
                      />
                      <form
                        onSubmit={handleSearchSubmit}
                        role="search"
                        aria-label="Tìm kiếm nội dung học tập"
                      >
                        <div className="lu-fx-search-field relative flex h-12 w-full items-center rounded-xl border border-[#CFD9D5] bg-[#FFFFFF] px-4 text-sm text-[#182624] shadow-[0_4px_16px_rgba(24,38,36,0.04)] focus-within:border-[#1E332E]">
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

                      {/* Hàng Từ khóa gợi ý nhanh (Quick Search Chips — nền sứ đặc sạch tuyệt đối) */}
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
                                  ? 'cursor-pointer rounded-full border border-[#1E332E] bg-[#1E332E] px-2.5 py-1 text-[11px] font-semibold text-[#FAFBF9] shadow-2xs transition-colors'
                                  : 'cursor-pointer rounded-full border border-[#D8E1DD] bg-[#FAFBF9] px-2.5 py-1 text-[11px] font-medium text-[#2C423D] transition-colors hover:bg-[#EDF2F0] hover:text-[#182624] active:scale-[0.98]'
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
                                                  Bài {result.chapter.number}.{result.lesson.number}
                                                  : <InlineMathText text={result.lesson.title} />
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
                                                    <KatexMath
                                                      math={entry.formula || entry.symbol}
                                                    />
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

                  {/* Cột Phải Banner (46% chiều rộng): Điêu khắc Đa diện Platonic Kép & Đĩa Thiên Văn 120fps */}
                  <div
                    data-testid="hero-3d-column"
                    className="hidden flex-col items-center justify-center lg:flex lg:w-[46%]"
                  >
                    <div className="relative w-full">
                      <LearningSpaceHeroCanvas />
                    </div>
                  </div>
                </div>
              </div>
            </BlueprintSectionFrame>
          </div>
        </section>

        {/* Dải ruy-băng học thuật chuyển động ngang AcademicAxiomBand (fx-band) giữa Hero & Hệ thống học phần */}
        <div className="relative z-20 mx-auto my-5 w-full max-w-[1400px] px-6 lg:px-10">
          <AcademicAxiomBand className="rounded-[2px]" />
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
