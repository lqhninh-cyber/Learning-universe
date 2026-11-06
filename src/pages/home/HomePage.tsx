import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  Clock,
  Compass,
  FileText,
  Layers,
  Play,
  Search,
  Sparkles,
  User,
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
import { isSupabaseConfigured } from '@/services/supabase/client';
import { COURSE_DIRECT_PDF_LINKS, EXTERNAL_LINKS, ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Button, ProgressRing } from '@/shared/ui';

type HubBranchFilter = 'all' | AcademicBranch;

const HORIZONTAL_BLIND_INDICES = [0, 1, 2, 3, 4, 5, 6, 7] as const;

function formatDurationHours(totalMinutes: number): string {
  const hours = Math.max(1, Math.round((totalMinutes / 60) * 10) / 10);
  return `${hours} giờ học`;
}

export function HomePage() {
  const subjects = getSubjects();
  const prefersReducedMotion = useReducedMotion();
  const svgMaskId = useId().replace(/:/g, '');

  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const learnerName = useLearningStore((state) => state.learnerName);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);

  const [activeBranch, setActiveBranch] = useState<HubBranchFilter>('all');
  const [hubQuery, setHubQuery] = useState('');
  const [hoveredCourseSlug, setHoveredCourseSlug] = useState<string>('cau-truc-dai-so');
  const [scrollBlindsProgress, setScrollBlindsProgress] = useState(0);

  // Hiệu ứng chuyển cảnh màn trập SVG Mask / Horizontal Blinds 60fps khi cuộn từ Screen 1 sang Screen 2
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

  // Lọc danh sách học phần trong Screen 2 — Interactive Course Hub
  const filteredSubjects = subjects.filter((subject) => {
    const asset = getCourseCinematicAsset(subject.slug);
    if (activeBranch !== 'all' && asset.branch !== activeBranch) {
      return false;
    }
    if (hubQuery.trim().length > 0) {
      const searchable = `${subject.title} ${asset.courseCode} ${asset.categoryLabel} ${asset.conciseDescription} ${asset.vietnameseLandmark}`;
      return matchesVietnameseQuery(searchable, hubQuery);
    }
    return true;
  });

  const activeHubAsset = getCourseCinematicAsset(hoveredCourseSlug);

  return (
    <FadeIn className="bg-[#FAF7F2] text-stone-900">
      {/* =========================================================================
          SCREEN 1 — THE OPENING (100vw x 100vh Full-bleed Vietnamese Architectural Hero)
          ========================================================================= */}
      <section
        aria-label="Screen 1: Không gian Mở màn Học thuật Việt Nam"
        className="relative h-screen min-h-screen w-screen overflow-hidden bg-[#FAF7F2]"
      >
        {/* Định nghĩa SVG Mask Horizontal Blinds (Codrops / GSAP Section Transition) */}
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

        {/* Nền kiến trúc học thuật Việt Nam (Khuê Văn Các / Văn Miếu) với hòa sắc Giấy Dó */}
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
          {/* Lớp lọc hòa sắc học thuật (Academic Tint Overlay) */}
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

        {/* Nội dung chính của Screen 1 — The Opening */}
        <div className="relative z-20 mx-auto flex h-full max-w-[1440px] flex-col justify-between px-6 py-8 sm:px-12 sm:py-10 lg:px-20 lg:py-12">
          {/* Góc trên: Micro-typography kỹ thuật & Định danh Học viện */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-300/60 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-[#9A3412]" aria-hidden="true" />
              <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-stone-800 uppercase">
                TOÁN HỌC &amp; KHOA HỌC GIÁO DỤC · HCMUE
              </span>
            </div>
            <div className="hidden items-center gap-4 font-mono text-[11px] text-stone-600 md:flex">
              <span>HỌC VIỆN TRI THỨC TOÁN HỌC &amp; KHOA HỌC GIÁO DỤC</span>
              <span className="h-3 w-px bg-stone-300" aria-hidden="true" />
              <span>{HOMEPAGE_OPENING_ASSET.vietnameseLandmark}</span>
            </div>
          </div>

          {/* Trung tâm nửa trên màn hình: Đại tự thái Monumental Typography */}
          <div className="my-auto max-w-5xl space-y-6 py-6">
            <p className="font-mono text-xs font-semibold tracking-[0.22em] text-[#9A3412] uppercase">
              SCREEN 01 · VIETNAMESE ACADEMIC HERITAGE
            </p>

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

          {/* Góc dưới: Tọa độ, nhãn thông số & Chỉ báo cuộn trang */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-300/60 pt-4 font-mono text-[11px] text-stone-700">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-stone-900">
                04 HỌC PHẦN · 123 BÀI GIẢNG · ĐỒNG BỘ 2026
              </span>
              <span className="hidden h-3 w-px bg-stone-300 sm:inline" aria-hidden="true" />
              <span className="hidden text-stone-600 sm:inline">
                {HOMEPAGE_OPENING_ASSET.coordinates}
              </span>
            </div>

            <a
              href="#khong-gian-mon-hoc"
              aria-label="Cuộn xuống Cổng lựa chọn môn học"
              className="group inline-flex items-center gap-2 font-sans text-xs font-medium text-stone-700 transition-colors hover:text-stone-950"
            >
              <span>Cuộn xuống Cổng Học Phần</span>
              <span className="flex h-6 w-6 animate-pulse items-center justify-center rounded-full border border-stone-400/80">
                <ArrowDown className="h-3 w-3" aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCREEN 2 — INTERACTIVE COURSE HUB (Cổng Lựa Chọn Môn Học Mở Rộng)
          ========================================================================= */}
      <section
        id="khong-gian-mon-hoc"
        aria-label="Screen 2: Cổng lựa chọn môn học"
        className="relative min-h-screen w-full overflow-hidden border-t border-stone-300/60 py-16 sm:py-24"
      >
        {/* Lớp nền cảnh quan Việt Nam chuyển mượt khi người dùng hover vào từng môn học */}
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
                  isSelected ? 'opacity-20' : 'opacity-0',
                )}
              />
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2] via-[#FAF7F2]/85 to-[#FAF7F2]" />
        </div>

        <div className="relative z-10 mx-auto max-w-[1440px] space-y-10 px-6 sm:px-12 lg:px-20">
          {/* Header của Interactive Course Hub & Thanh tìm kiếm bài học toàn cục */}
          <div className="grid grid-cols-1 gap-8 border-b border-stone-300/70 pb-8 lg:grid-cols-12 lg:items-end">
            <div className="space-y-3 lg:col-span-7">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#9A3412] uppercase">
                  SCREEN 02 · INTERACTIVE COURSE HUB
                </span>
                <span className="h-3 w-px bg-stone-300" aria-hidden="true" />
                <span className="font-mono text-xs text-stone-600">
                  Cảnh quan hiện tại: {activeHubAsset.vietnameseLandmark}
                </span>
              </div>

              <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-950 sm:text-5xl">
                Cổng Lựa Chọn Học Phần
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-stone-700 sm:text-base">
                Tra cứu bao quát và truy cập trực tiếp vào từng môn học. Di chuột lên từng học phần
                để cảm nhận không gian cảnh quan đặc trưng hoặc bấm chọn để mở trang môn học chuyên
                sâu.
              </p>
            </div>

            {/* Ô tìm kiếm bài học & khái niệm toàn cục (SearchBar) */}
            <div className="w-full lg:col-span-5">
              <SearchBar className="w-full" />
            </div>
          </div>

          {/* Thanh bộ lọc phân nhánh: Tất cả học phần | Toán học | Khoa học Giáo dục + Lọc nhanh tên môn */}
          <div className="flex flex-col justify-between gap-4 border-b border-stone-300/50 pb-6 md:flex-row md:items-center">
            <div
              role="tablist"
              aria-label="Bộ lọc phân nhánh học phần"
              className="flex flex-wrap items-center gap-2"
            >
              {[
                { id: 'all' as const, label: 'Tất cả học phần', count: subjects.length },
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
                      'cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition-all',
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

            {/* Ô lọc nhanh học phần khi mở rộng lên 10-20 môn */}
            <div className="relative w-full md:w-72">
              <Search
                className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={hubQuery}
                onChange={(e) => setHubQuery(e.target.value)}
                placeholder="Lọc nhanh mã hoặc tên môn học..."
                aria-label="Lọc nhanh danh sách môn học"
                className="w-full rounded-full border border-stone-300/80 bg-[#FDFBF7]/90 py-1.5 pr-4 pl-9 text-xs text-stone-800 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Bố cục Danh mục Học phần Tương tác (Interactive Course Hub List & Preview) */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
            {/* CỘT TRÁI (8 Cột): Danh sách học phần mở rộng với đường hairline thanh lịch */}
            <div className="divide-y divide-stone-300/60 border-t border-b border-stone-300/60 lg:col-span-8">
              {filteredSubjects.map((subject, index) => {
                const stats = getSubjectStats(subject);
                const asset = getCourseCinematicAsset(subject.slug);
                const pdfUrl =
                  COURSE_DIRECT_PDF_LINKS[subject.slug] ?? EXTERNAL_LINKS.googleDriveDocs;
                const isHovered = hoveredCourseSlug === subject.slug;

                return (
                  <article
                    key={subject.id}
                    onMouseEnter={() => setHoveredCourseSlug(subject.slug)}
                    onFocus={() => setHoveredCourseSlug(subject.slug)}
                    aria-label={`Học phần ${subject.title}`}
                    className={cn(
                      'group py-7 transition-colors duration-300 sm:px-4',
                      isHovered ? 'bg-[#FDFBF7]/90' : 'hover:bg-[#FDFBF7]/60',
                    )}
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div className="space-y-2.5">
                        {/* 1. Mã học phần & Phân loại */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-stone-400">
                            0{index + 1}
                          </span>
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
                          <span className="font-mono text-[11px] text-stone-500">
                            {asset.vietnameseLandmark}
                          </span>
                        </div>

                        {/* 2. Tên chính thức của môn học */}
                        <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-950 transition-colors group-hover:text-[#9A3412] sm:text-3xl">
                          <Link
                            to={ROUTES.subjectOverview(subject.slug)}
                            aria-label={subject.title}
                          >
                            {subject.title}
                          </Link>
                        </h3>

                        {/* 3. Mô tả cơ bản, cô đọng đúng trọng tâm chuyên môn */}
                        <p className="max-w-2xl text-sm leading-relaxed text-stone-700">
                          {asset.conciseDescription}
                        </p>
                      </div>

                      {/* Nút vào thẳng trang riêng của môn học */}
                      <div className="flex shrink-0 items-center gap-2.5 pt-1">
                        <Button
                          asChild
                          variant="subject"
                          size="sm"
                          className="gap-1.5 rounded-full bg-stone-900 px-5 py-2 text-xs font-semibold text-[#FAF7F2] hover:bg-[#9A3412]"
                        >
                          <Link to={ROUTES.subjectOverview(subject.slug)}>
                            <span>Vào học phần</span>
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    </div>

                    {/* 4. Thông số thực tế & Liên kết trực tiếp */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-stone-600">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                          <Layers className="h-3.5 w-3.5 text-[#9A3412]" aria-hidden="true" />
                          <span>
                            {stats.chapterCount} chương · {stats.lessonCount} bài học
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{formatDurationHours(stats.totalMinutes)}</span>
                        </span>
                        {subject.slug === 'hinh-hoc-affine' && (
                          <a
                            href="/interactive/affine-geometry.html"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-[#9A3412] hover:underline"
                          >
                            <Sparkles className="h-3 w-3" aria-hidden="true" />
                            <span>Phòng Lab tương tác 2D/3D</span>
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-medium text-stone-600 hover:text-stone-950"
                        >
                          <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Giáo trình PDF (Drive)</span>
                        </a>
                        <Link
                          to={ROUTES.courseOverview(subject.slug)}
                          className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-stone-700 hover:text-[#9A3412]"
                        >
                          <span>/courses/{subject.slug}</span>
                          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* CỘT PHẢI (4 Cột): Khung Nhìn Cảnh Quan Việt Nam Tương Ứng Khi Rê Chuột */}
            <aside
              aria-label="Khung cảnh quan học phần đang chọn"
              className="sticky top-24 hidden space-y-4 lg:col-span-4 lg:block"
            >
              <div className="overflow-hidden rounded-2xl border border-stone-300/80 bg-[#FDFBF7] shadow-xs">
                <div className="relative aspect-video w-full overflow-hidden bg-stone-200">
                  <img
                    src={activeHubAsset.remoteSrc}
                    alt={activeHubAsset.alt}
                    className="h-full w-full object-cover object-center transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />
                  <div className="absolute right-4 bottom-3 left-4 flex items-end justify-between text-[#FAF7F2]">
                    <div>
                      <span className="font-mono text-[10px] tracking-widest text-amber-200 uppercase">
                        {activeHubAsset.categoryLabel}
                      </span>
                      <p className="font-serif text-lg font-bold">{activeHubAsset.title}</p>
                    </div>
                    <span className="font-mono text-[10px] text-stone-200">
                      {activeHubAsset.coordinates}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <div className="space-y-1">
                    <span className="font-mono text-[10px] font-bold tracking-wider text-[#9A3412] uppercase">
                      CẢNH QUAN VIỆT NAM ĐẠI DIỆN
                    </span>
                    <p className="font-serif text-sm font-bold text-stone-900">
                      {activeHubAsset.vietnameseLandmark}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed text-stone-600">
                    {activeHubAsset.visualMetaphor}
                  </p>
                  <div className="border-t border-stone-200/80 pt-3">
                    <Link
                      to={ROUTES.subjectOverview(activeHubAsset.slug)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9A3412] hover:underline"
                    >
                      <span>Mở không gian {activeHubAsset.title}</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SCREEN 3 — CONTINUE EXPLORING & MINIMALIST FOOTER
          ========================================================================= */}
      <section
        aria-label="Screen 3: Tiếp tục khám phá và lối tắt học thuật"
        className="mx-auto max-w-[1440px] space-y-12 border-t border-stone-300/70 px-6 pt-16 pb-8 sm:px-12 lg:px-20"
      >
        <div className="space-y-2">
          <p className="font-mono text-xs font-bold tracking-[0.2em] text-[#9A3412] uppercase">
            SCREEN 03 · CONTINUE EXPLORING
          </p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-stone-950 sm:text-4xl">
            Tiếp Tục Học Dở &amp; Lối Tắt Học Thuật
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* WIDGET TỐI GIẢN: TIẾP TỤC HỌC DỞ (7 Cột) */}
          {activeRecentLesson && (
            <div
              role="region"
              aria-label="Tiếp tục học dở"
              className="flex flex-col justify-between border-t border-b border-stone-300/70 bg-[#FDFBF7]/70 py-6 sm:px-6 lg:col-span-7"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold tracking-wider text-[#9A3412] uppercase">
                    <Play className="h-3 w-3" aria-hidden="true" />
                    <span>Tiếp tục học dở</span>
                  </span>
                  <span className="font-mono text-xs text-stone-500">
                    {activeRecentLesson.subject.title} · Chương {activeRecentLesson.chapter.number}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-5 pt-1">
                  <div className="space-y-1.5">
                    <h3 className="font-serif text-xl font-bold text-stone-950 sm:text-2xl">
                      {activeRecentLesson.lesson.title}
                    </h3>
                    <p className="line-clamp-2 max-w-xl text-sm leading-relaxed text-stone-600">
                      {activeRecentLesson.lesson.description}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <ProgressRing
                      value={progressPercent > 0 ? progressPercent : 25}
                      size={52}
                      strokeWidth={4}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/70 pt-4">
                <div className="flex items-center gap-4 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                    <span>Tiến độ:</span>
                    <strong className="font-mono text-[#9A3412]">
                      {progressPercent > 0 ? `${progressPercent}%` : '25%'}
                    </strong>
                    <span>
                      ({completedCount}/{totalLessonCount} bài)
                    </span>
                  </span>
                  <span className="hidden h-3 w-px bg-stone-300 sm:inline" aria-hidden="true" />
                  <span className="hidden items-center gap-1 sm:inline-flex">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>~{activeRecentLesson.lesson.estimatedMinutes} phút đọc</span>
                  </span>
                </div>

                <Button
                  asChild
                  variant="subject"
                  size="sm"
                  className="gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-xs font-semibold text-[#FAF7F2] hover:bg-[#9A3412]"
                >
                  <Link
                    to={ROUTES.lesson(
                      activeRecentLesson.subject.slug,
                      activeRecentLesson.chapter.slug,
                      activeRecentLesson.lesson.slug,
                    )}
                  >
                    <span>Tiếp tục học</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* CỤM LỐI TẮT NHANH (5 Cột): Ngân hàng Thuật ngữ & Kho Tài liệu Giáo trình */}
          <div className="flex flex-col justify-between divide-y divide-stone-300/60 border-t border-b border-stone-300/70 lg:col-span-5">
            <Link
              to={ROUTES.glossary}
              className="group flex items-start justify-between gap-4 py-4 transition-colors hover:bg-[#FDFBF7]"
            >
              <div className="flex items-start gap-3.5">
                <BookMarked className="mt-1 h-4 w-4 shrink-0 text-[#9A3412]" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-stone-950 group-hover:text-[#9A3412]">
                    Ngân hàng Thuật ngữ (Glossary)
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600">
                    Tra cứu hệ thống định nghĩa, ký hiệu KaTeX và thuật ngữ toán học Việt – Anh.
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#9A3412]"
                aria-hidden="true"
              />
            </Link>

            <a
              href={EXTERNAL_LINKS.googleDriveDocs}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-4 py-4 transition-colors hover:bg-[#FDFBF7]"
            >
              <div className="flex items-start gap-3.5">
                <BookOpen className="mt-1 h-4 w-4 shrink-0 text-indigo-950" aria-hidden="true" />
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-stone-950 group-hover:text-indigo-950">
                    Kho Tài liệu Giáo trình
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600">
                    Truy cập trực tiếp giáo trình chính, đề cương học phần và văn bản pháp quy trên
                    Google Drive.
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-950"
                aria-hidden="true"
              />
            </a>

            <div className="flex items-center justify-between py-3.5 text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                <span>
                  {isAuthenticated
                    ? `Đang đồng bộ: ${learnerName || 'Học viên'}`
                    : 'Trải nghiệm tự do ở Chế độ Khách'}
                </span>
              </div>
              {!isAuthenticated ? (
                <button
                  type="button"
                  onClick={() => enableLearnerMode()}
                  className="cursor-pointer font-semibold text-[#9A3412] hover:underline"
                >
                  Kích hoạt Học viên
                </button>
              ) : (
                <span className="font-mono text-[11px] text-stone-500">
                  {isSupabaseConfigured ? 'Supabase Cloud' : 'Lưu cục bộ'}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

export default HomePage;
