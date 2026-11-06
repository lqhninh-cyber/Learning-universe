import {
  ArrowDown,
  ArrowRight,
  BookMarked,
  ChevronRight,
  Compass,
  Layers,
  Search,
} from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Link } from 'react-router';
import { getLessonById, getSubjects, getSubjectStats } from '@/content-runtime';
import {
  type AcademicBranch,
  COURSE_CINEMATIC_ASSETS,
  getCourseCinematicAsset,
  HOMEPAGE_OPENING_ASSET,
} from '@/data/cinematicAssets';
import { useLearningStore } from '@/features/learning';
import { SearchBar } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Button, HeritageDivider, ProgressRing } from '@/shared/ui';

type HubBranchFilter = 'all' | AcademicBranch;

const HORIZONTAL_BLIND_INDICES = [0, 1, 2, 3, 4, 5, 6, 7] as const;

export function HomePage() {
  const subjects = getSubjects();
  const prefersReducedMotion = useReducedMotion();
  const svgMaskId = useId().replace(/:/g, '');

  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);

  const [activeBranch, setActiveBranch] = useState<HubBranchFilter>('all');
  const [hubQuery, setHubQuery] = useState('');
  const [hoveredCourseSlug, setHoveredCourseSlug] = useState<string>('cau-truc-dai-so');
  const [scrollBlindsProgress, setScrollBlindsProgress] = useState(0);

  // Hiệu ứng chuyển cảnh màn trập SVG Mask / Horizontal Blinds 60fps khi cuộn
  useEffect(() => {
    if (prefersReducedMotion || typeof window === 'undefined') {
      return;
    }

    let rafId = 0;
    const updateProgress = () => {
      rafId = 0;
      const viewportHeight = Math.max(window.innerHeight || 800, 1);
      const raw = Math.min(1, Math.max(0, window.scrollY / (viewportHeight * 0.85)));
      setScrollBlindsProgress(raw);
    };

    const onScroll = () => {
      if (rafId === 0) {
        rafId = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
    };
  }, [prefersReducedMotion]);

  // Bài học gần nhất người dùng đang học dở
  const activeRecentLesson =
    (lastVisitedGlobal ? getLessonById(lastVisitedGlobal.lessonId) : undefined) ??
    getLessonById('lop-ke-phan-hoach-va-chi-so-cua-nhom-con') ??
    getLessonById('dinh-nghia-nhom');

  const totalLessonCount = subjects.reduce((sum, sub) => sum + getSubjectStats(sub).lessonCount, 0);
  const completedCount = Object.keys(completedLessons).length;
  const progressPercent =
    totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;

  // Lọc danh sách học phần trong Không gian Học phần
  const filteredSubjects = subjects.filter((subject) => {
    const asset = getCourseCinematicAsset(subject.slug);
    if (activeBranch !== 'all' && asset.branch !== activeBranch) {
      return false;
    }
    if (hubQuery.trim().length > 0) {
      const searchable = `${subject.title} ${asset.courseCode} ${asset.categoryLabel} ${asset.conciseDescription}`;
      return matchesVietnameseQuery(searchable, hubQuery);
    }
    return true;
  });

  const activeHubAsset = getCourseCinematicAsset(hoveredCourseSlug);

  // Định dạng tiêu đề bài học gần nhất (tránh lặp "Bài X.Y" nếu tiêu đề gốc đã có)
  const recentLessonTitle = activeRecentLesson
    ? activeRecentLesson.lesson.title.startsWith('Bài ')
      ? activeRecentLesson.lesson.title
      : `Bài ${activeRecentLesson.chapter.number}.${activeRecentLesson.lesson.number}: ${activeRecentLesson.lesson.title}`
    : '';

  return (
    <FadeIn className="bg-[#FAF7F2] text-stone-900">
      {/* =========================================================================
          THE OPENING (100vw x 100vh Full-bleed Architectural Hero)
          ========================================================================= */}
      <section
        aria-label="Không gian Mở màn Học thuật"
        className="relative h-screen min-h-screen w-screen overflow-hidden bg-[#FAF7F2]"
      >
        {/* Định nghĩa SVG Mask Horizontal Blinds */}
        <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
          <defs>
            <mask id={`hero-blinds-${svgMaskId}`} maskContentUnits="objectBoundingBox">
              {HORIZONTAL_BLIND_INDICES.map((idx) => {
                const sliceHeight = 1 / HORIZONTAL_BLIND_INDICES.length;
                const y = idx * sliceHeight;
                const openRatio = Math.max(0.12, 1 - scrollBlindsProgress * (0.65 + idx * 0.04));
                return (
                  <rect
                    key={idx}
                    x="0"
                    y={y}
                    width="1"
                    height={sliceHeight * openRatio + 0.002}
                    fill="white"
                  />
                );
              })}
            </mask>
          </defs>
        </svg>

        {/* Nền kiến trúc học thuật với hòa sắc Giấy Dó */}
        <div
          className="pointer-events-none absolute inset-0 transition-transform duration-700 ease-out will-change-transform"
          style={{
            transform: prefersReducedMotion
              ? undefined
              : `scale(${1 + scrollBlindsProgress * 0.05}) translate3d(0, ${scrollBlindsProgress * 28}px, 0)`,
            maskImage: prefersReducedMotion ? undefined : `url(#hero-blinds-${svgMaskId})`,
            WebkitMaskImage: prefersReducedMotion ? undefined : `url(#hero-blinds-${svgMaskId})`,
          }}
        >
          <img
            src={HOMEPAGE_OPENING_ASSET.remoteSrc}
            alt={HOMEPAGE_OPENING_ASSET.alt}
            loading="eager"
            className="h-full w-full object-cover object-center opacity-40 mix-blend-multiply"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/40 to-[#FAF7F2]/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#FAF7F2_100%)] opacity-75" />
        </div>

        {/* Hiệu ứng màn trập phân dải ngang (Horizontal Blinds Overlay) khi cuộn */}
        <div
          data-testid="horizontal-blinds-mask"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between"
        >
          {HORIZONTAL_BLIND_INDICES.map((idx) => {
            const slatScale = prefersReducedMotion
              ? 0
              : Math.min(1, Math.max(0, scrollBlindsProgress * (0.85 + idx * 0.05)));
            return (
              <div
                key={idx}
                className="w-full flex-1 origin-bottom border-b border-stone-300/25 bg-[#FAF7F2]/90 transition-transform duration-150 ease-out will-change-transform"
                style={{
                  transform: `scaleY(${slatScale})`,
                }}
              />
            );
          })}
        </div>

        {/* Nội dung chính của The Opening */}
        <div className="relative z-20 mx-auto flex h-full max-w-[1440px] flex-col justify-between px-6 pt-24 pb-8 sm:px-12 sm:pt-28 sm:pb-10 lg:px-20 lg:pb-12">
          {/* Góc trên: Định danh Học viện */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-300/60 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#9A3412]" aria-hidden="true" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-stone-800 uppercase">
                TOÁN HỌC &amp; KHOA HỌC GIÁO DỤC · HCMUE
              </span>
            </div>
            <div className="hidden items-center gap-4 font-mono text-[11px] text-stone-600 md:flex">
              <span>HỌC VIỆN TRI THỨC TOÁN HỌC &amp; KHOA HỌC GIÁO DỤC</span>
            </div>
          </div>

          {/* Trung tâm màn hình: Đại tự Monumental Typography */}
          <div className="my-auto max-w-5xl space-y-6 py-6">
            <h1 className="font-serif text-6xl leading-[0.9] font-normal tracking-tight text-stone-900 md:text-8xl lg:text-[7.5rem]">
              LEARNING UNIVERSE
            </h1>

            <p className="max-w-2xl font-serif text-2xl leading-snug font-medium text-stone-800 sm:text-3xl">
              Nơi vẻ đẹp Toán học giao hòa cùng Nghệ thuật Sư phạm.
            </p>

            <p className="max-w-xl text-sm leading-relaxed text-stone-700 sm:text-base">
              Hệ thống bài giảng, định lý, chứng minh toán học chặt chẽ cùng các học phần Khoa học
              Giáo dục và Nghiệp vụ Sư phạm chuẩn mực dành cho sinh viên Sư phạm Toán học.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Button
                asChild
                variant="subject"
                size="md"
                className="group gap-2.5 rounded-full bg-stone-900 px-7 py-3.5 text-sm font-semibold text-[#FAF7F2] shadow-xs transition-all duration-300 hover:bg-[#9A3412]"
              >
                <a href="#khong-gian-mon-hoc">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  <span>Khám phá Không gian Tri thức</span>
                  <ArrowDown
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </Button>

              <Link
                to={ROUTES.glossary}
                className="inline-flex items-center gap-2 rounded-full border border-stone-300/90 bg-[#FAF7F2]/80 px-5 py-3 text-xs font-semibold tracking-wider text-stone-800 uppercase backdrop-blur-md transition-colors hover:border-stone-500 hover:bg-white"
              >
                <BookMarked className="h-3.5 w-3.5 text-[#9A3412]" aria-hidden="true" />
                <span>Tra cứu Thuật ngữ KaTeX</span>
              </Link>
            </div>
          </div>

          {/* Góc dưới: Thông số học phần & Chỉ báo cuộn trang */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-300/60 pt-4 font-mono text-[11px] text-stone-700">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-stone-900">
                04 HỌC PHẦN · 123 BÀI GIẢNG · ĐỒNG BỘ 2026
              </span>
            </div>

            <a
              href="#khong-gian-mon-hoc"
              aria-label="Cuộn xuống Không gian Học phần"
              className="group inline-flex items-center gap-2 font-sans text-xs font-medium text-stone-700 transition-colors hover:text-stone-950"
            >
              <span>Cuộn xuống Không gian Học phần</span>
              <span className="flex h-6 w-6 animate-pulse items-center justify-center rounded-full border border-stone-400/80">
                <ArrowDown className="h-3 w-3" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FULL-VIEWPORT COURSE SELECTOR (Không gian Học phần)
          ========================================================================= */}
      <section
        id="khong-gian-mon-hoc"
        aria-label="Không gian Học phần"
        className="relative flex h-screen min-h-screen flex-col justify-center overflow-hidden border-t border-stone-300/60 px-6 lg:px-16"
      >
        {/* Lớp nền cảnh quan chuyển mượt khi người dùng di chuột vào từng học phần */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {Object.values(COURSE_CINEMATIC_ASSETS).map((asset) => {
            const isSelected = asset.slug === activeHubAsset.slug;
            return (
              <img
                key={asset.slug}
                src={asset.remoteSrc}
                alt=""
                loading="lazy"
                className={cn(
                  'absolute inset-0 h-full w-full object-cover object-center mix-blend-multiply transition-opacity duration-700 ease-out',
                  isSelected ? 'opacity-25' : 'opacity-0',
                )}
              />
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/85 to-[#FAF7F2]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[1440px] space-y-6">
          {/* Tiêu đề "Không gian Học phần" & Thanh tìm kiếm toàn cục */}
          <div className="flex flex-col justify-between gap-4 border-b border-stone-300/70 pb-5 lg:flex-row lg:items-end">
            <div className="space-y-1.5">
              <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-950 sm:text-5xl">
                Không gian Học phần
              </h2>
              <p className="max-w-xl text-sm text-stone-600">
                Lựa chọn học phần để truy cập lộ trình bài giảng, giáo trình PDF và ngân hàng đề
                thi.
              </p>
            </div>

            <div className="w-full lg:max-w-md">
              <SearchBar className="w-full" />
            </div>
          </div>

          {/* Bộ lọc: Tất cả | Toán học | Khoa học Giáo dục cùng ô tìm kiếm nhanh */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div
              role="tablist"
              aria-label="Bộ lọc phân nhánh học phần"
              className="flex flex-wrap items-center gap-2"
            >
              {[
                { id: 'all' as const, label: 'Tất cả', count: subjects.length },
                {
                  id: 'math' as const,
                  label: 'Toán học',
                  count: subjects.filter((s) => getCourseCinematicAsset(s.slug).branch === 'math')
                    .length,
                },
                {
                  id: 'pedagogy' as const,
                  label: 'Khoa học Giáo dục',
                  count: subjects.filter(
                    (s) => getCourseCinematicAsset(s.slug).branch === 'pedagogy',
                  ).length,
                },
              ].map((tab) => {
                const isActive = activeBranch === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveBranch(tab.id)}
                    className={cn(
                      'cursor-pointer rounded-full px-4 py-1.5 text-xs font-semibold transition-all',
                      isActive
                        ? 'bg-stone-900 text-[#FAF7F2] shadow-2xs'
                        : 'border border-stone-300/80 bg-[#FDFBF7]/90 text-stone-700 hover:border-stone-400 hover:text-stone-950',
                    )}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={cn(
                        'ml-1.5 font-mono text-[11px]',
                        isActive ? 'text-stone-300' : 'text-stone-500',
                      )}
                    >
                      ({tab.count})
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={hubQuery}
                onChange={(e) => setHubQuery(e.target.value)}
                placeholder="Tìm nhanh mã hoặc tên môn..."
                aria-label="Lọc nhanh danh sách môn học"
                className="w-full rounded-full border border-stone-300/80 bg-[#FDFBF7]/90 py-1.5 pr-4 pl-9 text-xs text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Danh sách môn học dạng lưới thẻ tương tác tối giản */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
            {filteredSubjects.map((subject) => {
              const stats = getSubjectStats(subject);
              const asset = getCourseCinematicAsset(subject.slug);
              const isHovered = hoveredCourseSlug === subject.slug;

              return (
                <article
                  key={subject.id}
                  onMouseEnter={() => setHoveredCourseSlug(subject.slug)}
                  onFocus={() => setHoveredCourseSlug(subject.slug)}
                  aria-label={`Học phần ${subject.title}`}
                  className={cn(
                    'group flex flex-col justify-between rounded-3xl border p-5 backdrop-blur-md transition-all duration-300 sm:p-6',
                    isHovered
                      ? 'border-stone-400 bg-[#FDFBF7]/95 shadow-sm'
                      : 'border-stone-200/80 bg-[#FDFBF7]/80 hover:border-stone-400 hover:bg-[#FDFBF7]/95',
                  )}
                >
                  <div className="space-y-2.5">
                    {/* Mã môn & số chương/bài học */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'rounded-md px-2.5 py-0.5 font-mono text-xs font-bold',
                          asset.branch === 'pedagogy'
                            ? 'bg-indigo-950/10 text-indigo-950'
                            : 'bg-[#9A3412]/10 text-[#9A3412]',
                        )}
                      >
                        {asset.categoryLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-600">
                        <Layers className="h-3.5 w-3.5 text-[#9A3412]" aria-hidden="true" />
                        <span>
                          {stats.chapterCount} chương · {stats.lessonCount} bài học
                        </span>
                      </span>
                    </div>

                    {/* Tên môn học */}
                    <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-950 transition-colors group-hover:text-[#9A3412]">
                      <Link to={ROUTES.subjectOverview(subject.slug)} aria-label={subject.title}>
                        {subject.title}
                      </Link>
                    </h3>

                    {/* 1 dòng mô tả bản chất môn học */}
                    <p className="line-clamp-1 text-sm text-stone-600">
                      {asset.conciseDescription}
                    </p>
                  </div>

                  {/* Nút "Vào học phần" dẫn thẳng đến /courses/:slug */}
                  <div className="mt-4 flex items-center justify-end border-t border-stone-200/70 pt-3.5">
                    <Button
                      asChild
                      variant="subject"
                      size="sm"
                      className="gap-1.5 rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold text-[#FAF7F2] hover:bg-[#9A3412]"
                    >
                      <Link to={ROUTES.courseOverview(subject.slug)}>
                        <span>Vào học phần</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          PHÂN CẢNH "TIẾP TỤC HỌC TẬP" THEO PHONG CÁCH APPLE STORE
          ========================================================================= */}
      <section
        aria-label="Tiếp tục học tập"
        className="mx-auto max-w-[1440px] space-y-10 border-t border-stone-300/60 px-6 pt-16 pb-8 sm:px-12 lg:px-16"
      >
        {/* Tiêu đề phân cảnh tối giản */}
        <div className="space-y-2">
          <h2 className="font-serif text-3xl text-stone-900 md:text-4xl">Tiếp tục học tập</h2>
          <p className="max-w-2xl text-sm text-stone-600 sm:text-base">
            Quay lại bài học đang đọc dở và các công cụ học tập trọng tâm.
          </p>
        </div>

        {/* Bố cục hàng 3 thẻ Apple Store (Apple-Style Card Row) */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* THẺ 1 — BÀI HỌC GẦN NHẤT (Recent Lesson) */}
          {activeRecentLesson && (
            <div
              role="region"
              aria-label="Tiếp tục học dở"
              className="group flex flex-col justify-between rounded-[28px] border border-stone-200/70 bg-[#FAF7F2] p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-8"
            >
              <div className="space-y-4">
                <span className="block text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                  GẦN ĐÂY
                </span>

                <h3 className="font-serif text-xl leading-snug font-bold text-stone-900 sm:text-2xl">
                  {recentLessonTitle}
                </h3>

                <p className="line-clamp-2 text-sm leading-relaxed text-stone-600">
                  {activeRecentLesson.lesson.description}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-200/70 pt-5">
                <div className="flex items-center gap-3">
                  <ProgressRing
                    value={progressPercent > 0 ? progressPercent : 25}
                    size={40}
                    strokeWidth={3.5}
                  />
                  <div>
                    <p className="text-xs font-semibold text-stone-900">
                      {activeRecentLesson.subject.title}
                    </p>
                    <p className="font-mono text-[11px] text-stone-500">
                      Hoàn thành {progressPercent > 0 ? `${progressPercent}%` : '25%'} (
                      {completedCount}/{totalLessonCount} bài)
                    </p>
                  </div>
                </div>

                <Link
                  to={ROUTES.lesson(
                    activeRecentLesson.subject.slug,
                    activeRecentLesson.chapter.slug,
                    activeRecentLesson.lesson.slug,
                  )}
                  aria-label="Tiếp tục học"
                  title="Tiếp tục học bài này"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-transform hover:scale-105"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}

          {/* THẺ 2 — TRA CỨU THUẬT NGỮ (Glossary) */}
          <div className="group flex flex-col justify-between rounded-[28px] border border-stone-200/70 bg-[#FAF7F2] p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-8">
            <div className="space-y-4">
              <span className="block text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                TRA CỨU HỌC THUẬT
              </span>

              <h3 className="font-serif text-xl leading-snug font-bold text-stone-900 sm:text-2xl">
                Ngân hàng Thuật ngữ &amp; Ký hiệu Toán
              </h3>

              <p className="text-sm leading-relaxed text-stone-600">
                Hệ thống định nghĩa, công thức KaTeX và thuật ngữ đối chiếu.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-200/70 pt-5">
              <span className="text-xs font-medium text-stone-500">
                Từ điển Toán học Việt – Anh
              </span>

              <Link
                to="/glossary"
                aria-label="Mở Ngân hàng Thuật ngữ & Ký hiệu Toán"
                title="Mở Ngân hàng Thuật ngữ & Ký hiệu Toán"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-transform hover:scale-105"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* THẺ 3 — PHÒNG LAB MÔ PHỎNG (Interactive Lab) */}
          <div className="group flex flex-col justify-between rounded-[28px] border border-stone-200/70 bg-[#FAF7F2] p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:p-8">
            <div className="space-y-4">
              <span className="block text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                MÔ PHỎNG TRỰC QUAN
              </span>

              <h3 className="font-serif text-xl leading-snug font-bold text-stone-900 sm:text-2xl">
                Phòng Lab Hình học Không gian
              </h3>

              <p className="text-sm leading-relaxed text-stone-600">
                Mô phỏng tương tác 3D các phép biến đổi Affine và không gian véc-tơ.
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4 border-t border-stone-200/70 pt-5">
              <span className="text-xs font-medium text-stone-500">Mô phỏng trực quan 2D / 3D</span>

              <a
                href="/interactive/affine-geometry.html"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Mở Phòng Lab Hình học Không gian"
                title="Mở Phòng Lab Hình học Không gian"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition-transform hover:scale-105"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Chân phân cảnh: Họa tiết kỷ hà truyền thống Việt Nam chìm mờ & Trạng thái trung tính */}
        <div className="space-y-4 pt-6 text-center">
          <HeritageDivider className="opacity-30" />
          <p className="text-xs text-stone-500">
            ● Tiến độ học tập cá nhân được lưu an toàn trên trình duyệt · Bản phát hành 2026
          </p>
        </div>
      </section>
    </FadeIn>
  );
}

export default HomePage;
