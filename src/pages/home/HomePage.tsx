import {
  ArrowRight,
  Bookmark,
  BookMarked,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Network,
  Play,
  Sigma,
  Sparkles,
  TrendingUp,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { getLessonById, getSubjects } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { SearchBar } from '@/features/search';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { FadeIn } from '@/shared/motion/FadeIn';
import {
  Button,
  Card,
  DefinitionPillarMotif,
  ExamplePillarMotif,
  ExercisePillarMotif,
  HeritageDivider,
  ProgressRing,
  ProofPillarMotif,
  TheoremPillarMotif,
  TheoryPillarMotif,
} from '@/shared/ui';

export function HomePage() {
  const subjects = getSubjects();
  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const learnerName = useLearningStore((state) => state.learnerName);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const bookmarkedLessons = useLearningStore((state) => state.bookmarkedLessons);
  const lessonNotes = useLearningStore((state) => state.lessonNotes);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);

  const [hoveredPortalCard, setHoveredPortalCard] = useState<string | null>(null);

  // Bài học gần nhất: ưu tiên bài người học đã truy cập, nếu chưa có thì gợi ý Bài 3.1 Cấu trúc đại số
  const activeRecentLesson =
    (lastVisitedGlobal ? getLessonById(lastVisitedGlobal.lessonId) : undefined) ??
    getLessonById('lop-ke-phan-hoach-va-chi-so-cua-nhom-con');

  // Tính toán số liệu thống kê tổng quát
  const totalLessonCount = subjects.reduce(
    (sum, sub) => sum + sub.chapters.reduce((cSum, c) => cSum + c.lessons.length, 0),
    0,
  );
  const completedCount = Object.keys(completedLessons).length;
  const bookmarkedCount = Object.keys(bookmarkedLessons).length;
  const notesCount = Object.keys(lessonNotes).length;
  const progressPercent =
    totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;

  return (
    <FadeIn className="mx-auto max-w-6xl space-y-16 py-2 sm:py-4">
      {/* =========================================================================
          KHU VỰC 1: ASYMMETRIC EDITORIAL HERO (7:5 BẤT ĐỐI XỨNG & 2.5D CLUSTER)
          ========================================================================= */}
      <section
        aria-label="Tiền sảnh học thuật"
        className="relative overflow-hidden rounded-3xl border border-stone-200/90 bg-gradient-to-br from-[#faf8f2]/90 via-white to-amber-50/30 p-6 shadow-sm sm:p-10 lg:p-12"
      >
        {/* Nền tọa độ vi mô mờ */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
          aria-hidden="true"
        />

        <div className="relative grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          {/* CỘT TRÁI (7 Phần): Tiêu đề Serif, Tuyên ngôn tri thức & SearchBar */}
          <div className="space-y-6 lg:col-span-7">
            {/* Huy hiệu danh mục học thuật */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-900/20 bg-amber-50/90 px-3.5 py-1 text-xs font-semibold text-amber-950 shadow-2xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-600" />
                <span>CHÀO MỪNG BẠN ĐẾN VỚI LEARNING UNIVERSE</span>
              </div>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800">
                Toán học &amp; Khoa học Giáo dục
              </span>
            </div>

            {/* Tiêu đề cấp 1 H1 (Font có chân Serif phân cấp mạnh mẽ) */}
            <div className="space-y-3">
              <h1 className="font-serif text-3xl leading-[1.15] font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
                Không gian Học tập &amp; Khám phá: Nơi vẻ đẹp{' '}
                <span className="text-amber-900 not-italic">Toán học</span> giao hòa cùng{' '}
                <span className="text-teal-900 not-italic">Nghệ thuật Sư phạm</span>.
              </h1>

              <p className="max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg">
                Nơi lưu trữ và chia sẻ hệ thống bài giảng, định lý, chứng minh toán học chặt chẽ
                cùng các học phần Khoa học Giáo dục và Nghiệp vụ Sư phạm chuẩn mực, đồng hành cùng
                bạn trên hành trình đại học.
              </p>
            </div>

            {/* Thanh tìm kiếm nhanh căn trái gọn gàng */}
            <div className="w-full max-w-xl pt-1">
              <SearchBar className="w-full shadow-xs" />
            </div>

            {/* Cụm liên kết hành động nhanh */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button
                asChild
                variant="subject"
                size="md"
                className="gap-2 rounded-xl bg-amber-900 text-white shadow-md hover:bg-amber-950"
              >
                <a href="#khong-gian-mon-hoc">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  <span>Khám phá 2 Không gian Tri thức</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="md"
                className="gap-2 rounded-xl border-stone-300 bg-white/90 text-stone-800 shadow-2xs hover:bg-stone-50"
              >
                <Link to={ROUTES.courses}>
                  <span>Tất cả học phần ({subjects.length})</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* CỘT PHẢI (5 Phần): 2.5D Floating Cluster với Chỉ báo Tiến độ sống động */}
          <div className="space-y-4 lg:col-span-5">
            {/* THẺ 1: TIẾP TỤC BÀI HỌC GẦN NHẤT */}
            {activeRecentLesson && (
              <div
                role="region"
                aria-label="Tiếp tục bài học gần nhất"
                className="rounded-2xl border border-amber-900/20 bg-white/90 p-5 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                    <Play className="h-2.5 w-2.5" aria-hidden="true" />
                    <span>Tiếp tục bài học gần nhất</span>
                  </span>
                  <span className="text-[11px] font-semibold text-stone-500">
                    {activeRecentLesson.subject.title}
                  </span>
                </div>

                <div className="mt-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[11px] font-medium text-amber-800">
                      Chương {activeRecentLesson.chapter.number} · Bài{' '}
                      {activeRecentLesson.chapter.number}.{activeRecentLesson.lesson.number}
                    </span>
                    <h3 className="line-clamp-2 font-serif text-base font-bold text-stone-900">
                      {activeRecentLesson.lesson.title}
                    </h3>
                    <p className="line-clamp-1 text-xs text-stone-500">
                      {activeRecentLesson.lesson.description}
                    </p>
                  </div>

                  <div className="shrink-0 pt-1">
                    <ProgressRing
                      value={progressPercent > 0 ? progressPercent : 25}
                      size={46}
                      strokeWidth={4}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                  <span className="inline-flex items-center gap-1 text-[11px] text-stone-500">
                    <Clock className="h-3 w-3" aria-hidden="true" />
                    <span>~{activeRecentLesson.lesson.estimatedMinutes} phút đọc</span>
                  </span>
                  <Link
                    to={ROUTES.lesson(
                      activeRecentLesson.subject.slug,
                      activeRecentLesson.chapter.slug,
                      activeRecentLesson.lesson.slug,
                    )}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline"
                  >
                    <span>Đọc tiếp bài học</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}

            {/* THẺ 2: LỐI TẮT NHANH 2.5D (TRA CỨU THUẬT NGỮ & PHÒNG LAB) */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to={ROUTES.glossary}
                className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white/85 p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-900">
                    <BookMarked className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-900"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-amber-900">
                    Thuật ngữ KaTeX
                  </h4>
                  <p className="text-[10px] text-stone-500">68 định nghĩa &amp; ký hiệu</p>
                </div>
              </Link>

              <Link
                to="/interactive/affine-geometry.html"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white/85 p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-900">
                    <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-900"
                    aria-hidden="true"
                  />
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-bold text-stone-900 group-hover:text-teal-900">
                    Phòng Lab 2D
                  </h4>
                  <p className="text-[10px] text-stone-500">Hình học Affine tương tác</p>
                </div>
              </Link>
            </div>

            {/* THẺ 3: CHỈ SỐ NỀN TẢNG PILL */}
            <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-stone-50/80 px-4 py-2.5 text-xs text-stone-600">
              <span className="font-medium">
                Tổng cộng: <strong className="text-stone-900">{totalLessonCount} bài học</strong>
              </span>
              <span className="h-3 w-px bg-stone-300" aria-hidden="true" />
              <span className="font-medium">
                Tài liệu: <strong className="text-teal-900">19 tệp PDF</strong>
              </span>
              <span className="h-3 w-px bg-stone-300" aria-hidden="true" />
              <span className="font-mono text-[11px] font-bold text-emerald-800">
                100% Nguồn mở
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHU VỰC 2: CHỌN KHÔNG GIAN HỌC TẬP (ASYMMETRIC BENTO GRID - DUAL PORTALS)
          ========================================================================= */}
      <section
        id="khong-gian-mon-hoc"
        aria-label="Chọn không gian học tập"
        className="scroll-mt-24 space-y-8"
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider text-amber-900 uppercase">
              <span>Trục tri thức tích hợp</span>
              <span className="h-1 w-1 rounded-full bg-amber-900" />
              <span>Dual Spatial Portals</span>
            </div>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
              Chọn không gian học tập: Hai Cổng Tri Thức Sư Phạm Toán
            </h2>
            <p className="mt-1 text-sm text-stone-600 sm:text-base">
              Phân tách rõ ràng giữa Hệ thống Toán học Đại học chuyên sâu và Khoa học Giáo dục hiện
              đại.
            </p>
          </div>
          <Link
            to={ROUTES.courses}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 hover:underline"
          >
            <span>Xem tất cả học phần ({subjects.length})</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* BENTO GRID: 2 CỔNG ĐỐI TRỌNG (7 COLS TOÁN - 5 COLS SƯ PHẠM) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* =====================================================================
              CỔNG 1: KHỐI TOÁN HỌC (Geometric / Indigo / Amber) - 7 Cols
              ===================================================================== */}
          <Card className="flex flex-col justify-between rounded-3xl border border-amber-200/90 bg-gradient-to-br from-amber-50/40 via-white to-stone-50/60 p-6 shadow-xs transition-all duration-300 sm:p-8 lg:col-span-7">
            <div className="space-y-6">
              {/* Header Cổng Toán */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/80 bg-amber-100/70 px-3 py-1 text-xs font-bold tracking-wide text-amber-900 uppercase">
                    <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Khối 1: Toán học Đại học</span>
                  </span>
                  <span className="rounded-full bg-amber-100/90 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                    3 học phần · 83 bài
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-900">
                  Cấu trúc Đại số, Hình học Affine &amp; Giải tích
                </h3>
                <p className="text-sm leading-relaxed text-stone-600">
                  Ngôn ngữ hình học kỷ luật cao, tích hợp công thức KaTeX, phòng thí nghiệm 2D Mafs
                  và ngân hàng đề thi có lời giải chi tiết.
                </p>
              </div>

              {/* Danh sách 3 Thẻ môn học với Hover Elevation & Reveal */}
              <div className="space-y-3">
                {/* 1. Cấu trúc đại số */}
                <Link
                  to={ROUTES.subjectOverview('cau-truc-dai-so')}
                  aria-label="Cấu trúc đại số"
                  onMouseEnter={() => setHoveredPortalCard('ctds')}
                  onMouseLeave={() => setHoveredPortalCard(null)}
                  className={cn(
                    'group block rounded-2xl border p-4.5 transition-all duration-300',
                    hoveredPortalCard === 'ctds'
                      ? '-translate-y-1 border-amber-800 bg-amber-50/50 shadow-md'
                      : 'border-stone-200/90 bg-white/90 shadow-2xs hover:border-amber-300',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                        Học phần 1
                      </span>
                      <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-900">
                        Cấu trúc đại số
                      </h4>
                    </div>
                    <span className="rounded bg-amber-100/80 px-2 py-0.5 text-xs font-bold text-amber-900">
                      39 bài học
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-stone-600">
                    Nhóm, Vành, Trường &amp; Tiên đề đại số trừu tượng.
                  </p>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      hoveredPortalCard === 'ctds'
                        ? 'mt-2.5 max-h-16 border-t border-amber-900/15 pt-2 opacity-100'
                        : 'max-h-0 opacity-0',
                    )}
                  >
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                      <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                        Định lý Lagrange
                      </span>
                      <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                        Nhóm cyclic
                      </span>
                      <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                        Đồng cấu và Vành
                      </span>
                    </div>
                  </div>
                </Link>

                {/* 2. Hình học Affine và Euclide */}
                <Link
                  to={ROUTES.subjectOverview('hinh-hoc-affine')}
                  aria-label="Hình học Affine và hình học Euclide"
                  onMouseEnter={() => setHoveredPortalCard('affine')}
                  onMouseLeave={() => setHoveredPortalCard(null)}
                  className={cn(
                    'group block rounded-2xl border p-4.5 transition-all duration-300',
                    hoveredPortalCard === 'affine'
                      ? '-translate-y-1 border-amber-800 bg-amber-50/50 shadow-md'
                      : 'border-stone-200/90 bg-white/90 shadow-2xs hover:border-amber-300',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                        Học phần 2
                      </span>
                      <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-900">
                        Hình học Affine và hình học Euclide
                      </h4>
                    </div>
                    <span className="rounded bg-amber-100/80 px-2 py-0.5 text-xs font-bold text-amber-900">
                      23 bài · Lab 2D
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-stone-600">
                    Không gian Affine, Ánh xạ Affine &amp; Phòng Lab mô phỏng kéo thả Mafs.
                  </p>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      hoveredPortalCard === 'affine'
                        ? 'mt-2.5 max-h-16 border-t border-amber-900/15 pt-2 opacity-100'
                        : 'max-h-0 opacity-0',
                    )}
                  >
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                      <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                        Trọng tâm
                      </span>
                      <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                        Hình bình hành tương tác
                      </span>
                      <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                        Mafs SVG
                      </span>
                    </div>
                  </div>
                </Link>

                {/* 3. Giải tích hàm một biến */}
                <Link
                  to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                  aria-label="Giải tích hàm một biến"
                  onMouseEnter={() => setHoveredPortalCard('calculus')}
                  onMouseLeave={() => setHoveredPortalCard(null)}
                  className={cn(
                    'group block rounded-2xl border p-4.5 transition-all duration-300',
                    hoveredPortalCard === 'calculus'
                      ? '-translate-y-1 border-amber-800 bg-amber-50/50 shadow-md'
                      : 'border-stone-200/90 bg-white/90 shadow-2xs hover:border-amber-300',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold tracking-wider text-amber-800 uppercase">
                        Học phần 3 · Trọng tâm
                      </span>
                      <h4 className="font-serif text-base font-bold text-stone-900 group-hover:text-amber-900">
                        Giải tích hàm một biến
                      </h4>
                    </div>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-900">
                      41 bài · 6 Bộ đề thi
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-stone-600">
                    Giới hạn dãy số, Hàm liên tục, Vi phân, Tích phân Riemann và Chuỗi số.
                  </p>
                  <div
                    className={cn(
                      'overflow-hidden transition-all duration-300',
                      hoveredPortalCard === 'calculus'
                        ? 'mt-2.5 max-h-16 border-t border-amber-900/15 pt-2 opacity-100'
                        : 'max-h-0 opacity-0',
                    )}
                  >
                    <div className="flex flex-wrap gap-1.5 text-[11px] text-stone-600">
                      <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                        Đề 2025-2026
                      </span>
                      <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                        Ảnh đề gốc
                      </span>
                      <span className="rounded border border-stone-200 bg-white px-2 py-0.5">
                        Lời giải chi tiết
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Chân thẻ Cổng Toán */}
            <div className="mt-6 flex items-center justify-between border-t border-amber-200/60 pt-4">
              <span className="text-xs font-medium text-stone-500">
                Toán giải tích, hình học &amp; đại số
              </span>
              <Button
                asChild
                variant="subject"
                size="sm"
                className="gap-1.5 bg-amber-900 text-white hover:bg-amber-950"
              >
                <Link to={ROUTES.subjectOverview('cau-truc-dai-so')}>
                  <span>Vào Khối Toán học</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* =====================================================================
              CỔNG 2: KHỐI KHOA HỌC GIÁO DỤC (Editorial / Slate Teal) - 5 Cols
              ===================================================================== */}
          <Card className="flex flex-col justify-between rounded-3xl border border-teal-200/90 bg-gradient-to-br from-teal-50/50 via-white to-amber-50/30 p-6 shadow-xs transition-all duration-300 sm:p-8 lg:col-span-5">
            <div className="space-y-6">
              {/* Header Cổng Sư phạm */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300/80 bg-teal-100/70 px-3 py-1 text-xs font-bold tracking-wide text-teal-900 uppercase">
                    <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Khối 2: Khoa học GD &amp; Sư phạm</span>
                  </span>
                  <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-800">
                    Cốt lõi
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-teal-950">
                  Giáo dục học &amp; Nghiệp vụ Sư phạm
                </h3>
                <p className="text-sm leading-relaxed text-stone-600">
                  Bản chất hiện tượng giáo dục, 6 nguyên tắc nhân cách, công tác GVCN lớp và năng
                  lực giải quyết 20 tình huống sư phạm thực tiễn.
                </p>
              </div>

              {/* Thẻ học phần Giáo dục học chính thức */}
              <Link
                to={ROUTES.subjectOverview('giao-duc-hoc')}
                aria-label="Giáo dục học"
                className="group block rounded-2xl border border-teal-200/90 bg-white/95 p-5 shadow-2xs transition-all hover:-translate-y-1 hover:border-teal-400 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold tracking-wider text-teal-800 uppercase">
                      Học phần EDUT1401
                    </span>
                    <h4 className="font-serif text-lg font-bold text-stone-900 group-hover:text-teal-950">
                      Giáo dục học đại cương
                    </h4>
                  </div>
                  <span className="rounded bg-teal-100 px-2 py-0.5 font-mono text-xs font-bold text-teal-900">
                    3 Tín chỉ
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-stone-600">
                  Chuẩn HCMUE &amp; CT GDPT 2018 · 19 tài liệu pháp quy &amp; cẩm nang · Rubric
                  A.1.2 &amp; A.1.9 · 20 tình huống sư phạm.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-2">
                    <span className="block font-bold text-teal-950">6 Chương học</span>
                    <span className="text-[10px] text-teal-700">Lý thuyết &amp; Thực hành</span>
                  </div>
                  <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-2">
                    <span className="block font-bold text-teal-950">19 Tệp PDF</span>
                    <span className="text-[10px] text-teal-700">Giáo trình &amp; Pháp quy</span>
                  </div>
                </div>
              </Link>

              {/* Hộp mở rộng thông tin đào tạo sư phạm */}
              <div className="rounded-2xl border border-dashed border-teal-200/90 bg-teal-50/40 p-4 text-xs text-teal-950">
                <div className="flex items-center gap-1.5 font-bold text-teal-900">
                  <Sparkles className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                  <span>Đang mở rộng trong lộ trình</span>
                </div>
                <p className="mt-1.5 leading-relaxed text-stone-600">
                  Các học phần Phương pháp Dạy học Toán và Tâm lý học Sư phạm đang được hoàn thiện
                  theo chuẩn Chương trình GDPT 2018.
                </p>
              </div>
            </div>

            {/* Chân thẻ Cổng Sư phạm */}
            <div className="mt-6 flex items-center justify-between border-t border-teal-200/60 pt-4">
              <span className="text-xs font-medium text-stone-500">ĐH Sư phạm TP.HCM (HCMUE)</span>
              <Button
                asChild
                variant="subject"
                size="sm"
                className="gap-1.5 bg-teal-800 text-white hover:bg-teal-900"
              >
                <Link to={ROUTES.subjectOverview('giao-duc-hoc')}>
                  <span>Vào Khối Sư phạm</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      <HeritageDivider className="opacity-70" />

      {/* =========================================================================
          KHU VỰC 3: THƯ VIỆN TRI THỨC (6 HỌC THUẬT CỐT LÕI)
          ========================================================================= */}
      <section aria-label="Thư viện tri thức" className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[var(--accent-wood)] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-wood)]" />
            <span>Quy chuẩn học thuật</span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            THƯ VIỆN TRI THỨC
          </h2>
          <p className="text-sm text-[var(--text-secondary)] sm:text-base">
            Hệ thống hóa nội dung học tập thông qua 6 cấu trúc học thuật kinh điển, chuẩn mực và
            minh bạch.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Lý thuyết */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <TheoryPillarMotif />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">Lý thuyết</h3>
            </div>
            <p className="text-xs leading-relaxed text-stone-600">
              Các khái niệm cơ bản, cơ chế chuyển giao kinh nghiệm lịch sử - xã hội và bản chất hiện
              tượng giáo dục.
            </p>
          </Card>

          {/* 2. Định nghĩa */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <DefinitionPillarMotif />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">Định nghĩa</h3>
            </div>
            <p className="text-xs leading-relaxed text-stone-600">
              Ngôn ngữ toán học chặt chẽ, các cấu trúc đại số và thuật ngữ sư phạm quy chuẩn.
            </p>
          </Card>

          {/* 3. Định lý */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <TheoremPillarMotif />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">Định lý &amp; Bổ đề</h3>
            </div>
            <p className="text-xs leading-relaxed text-stone-600">
              Các mệnh đề trọng tâm của giải tích, hình học và đại số kèm số hiệu giáo trình gốc.
            </p>
          </Card>

          {/* 4. Chứng minh */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <ProofPillarMotif />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">Chứng minh</h3>
            </div>
            <p className="text-xs leading-relaxed text-stone-600">
              Lập luận logic từng bước, có chú giải trực quan và nút ẩn/hiện tăng tính chủ động.
            </p>
          </Card>

          {/* 5. Ví dụ minh họa */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <ExamplePillarMotif />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">Ví dụ minh họa</h3>
            </div>
            <p className="text-xs leading-relaxed text-stone-600">
              Tình huống thực tế, bài toán tiêu biểu làm sáng tỏ lý thuyết trừu tượng.
            </p>
          </Card>

          {/* 6. Bài tập thực hành */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                <ExercisePillarMotif />
              </div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Bài tập &amp; Lời giải
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-stone-600">
              Hệ thống câu hỏi tự luận, trắc nghiệm tình huống và gợi ý giải toán bám sát đề thi.
            </p>
          </Card>
        </div>
      </section>

      <HeritageDivider className="opacity-70" />

      {/* =========================================================================
          KHU VỰC 4: BẢN ĐỒ TRI THỨC (KẾT NỐI NHỮNG MIỀN TRI THỨC)
          ========================================================================= */}
      <section aria-label="Bản đồ tri thức" className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[var(--accent-wood)] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-wood)]" />
            <span>Mạng lưới khái niệm</span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            KẾT NỐI NHỮNG MIỀN TRI THỨC
          </h2>
          <p className="text-sm text-[var(--text-secondary)] sm:text-base">
            Mỗi bài học là một mắt xích trong mạng lưới tri thức toán học và sư phạm liên ngành.
          </p>
        </div>

        <div className="rounded-3xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/25 p-6 shadow-2xs sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Đại số &amp; Hình học
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                Không gian véc-tơ liên kết chặt chẽ với không gian Affine thông qua tác động nhóm
                cộng.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Toán học &amp; Sư phạm
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                Tri thức toán học chuyên sâu là nền tảng để thiết kế hoạt động trải nghiệm và bài
                giảng phổ thông.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Network className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">
                  Lý thuyết &amp; Thực hành
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                Lý luận giáo dục kết hợp cẩm nang 20 tình huống thực tế giúp sinh viên tự tin bước
                vào nghề giáo.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HeritageDivider className="opacity-70" />

      {/* =========================================================================
          KHU VỰC 5: HÀNH TRÌNH CHINH PHỤC TRI THỨC (TIẾN ĐỘ & SUPABASE SYNC)
          ========================================================================= */}
      <section aria-label="Hành trình học tập" className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[var(--accent-wood)] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-wood)]" />
            <span>Tiến độ cá nhân hóa</span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            HÀNH TRÌNH CHINH PHỤC TRI THỨC
          </h2>
          <p className="text-sm text-[var(--text-secondary)] sm:text-base">
            Ghi nhận từng bước tiến trong hành trình học tập đại học của bạn.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-6 rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <span className="text-xs font-bold tracking-wide text-emerald-800 uppercase">
                  Đang đồng bộ đám mây
                </span>
                <h3 className="mt-1 font-serif text-xl font-bold text-stone-900 sm:text-2xl">
                  Chào mừng trở lại, {learnerName || 'Học viên'}!
                </h3>
                <p className="mt-1 text-xs text-stone-600">
                  Tiến độ học tập và ghi chú của bạn được đồng bộ tự động với Supabase.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button asChild variant="subject" size="sm" className="rounded-xl">
                  <Link to={ROUTES.courses}>
                    <span>Tiếp tục học tập</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/50 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase">Đã hoàn thành</span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-stone-900">{completedCount} bài</p>
                <p className="text-xs text-stone-500">Trên tổng số {totalLessonCount} bài học</p>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/50 p-4">
                <div className="flex items-center gap-2 text-rose-800">
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase">Yêu thích</span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-stone-900">{bookmarkedCount} bài</p>
                <p className="text-xs text-stone-500">Đã lưu vào danh mục theo dõi</p>
              </div>

              <div className="rounded-2xl border border-stone-200/90 bg-stone-50/50 p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase">Ghi chú cá nhân</span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-stone-900">{notesCount} mục</p>
                <p className="text-xs text-stone-500">Ghi chú học thuật trong các bài</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xs sm:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-stone-500" aria-hidden="true" />
                  <span className="text-sm font-bold text-stone-900">
                    Trải nghiệm tự do ở Chế độ Khách
                  </span>
                </div>
                <p className="max-w-xl text-xs leading-relaxed text-stone-600 sm:text-sm">
                  Bạn có thể đọc toàn bộ 103 bài học công khai không giới hạn. Để lưu bài yêu thích,
                  viết ghi chú cá nhân và đồng bộ hóa tiến độ học trên các thiết bị, hãy kích hoạt
                  Chế độ Học viên.
                </p>
              </div>

              <Button
                variant="subject"
                onClick={() => enableLearnerMode()}
                className="shrink-0 rounded-xl"
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                <span>Kích hoạt Chế độ Học viên</span>
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* =========================================================================
          TRẠNG THÁI KẾT NỐI HỆ THỐNG
          ========================================================================= */}
      <div className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50/80 px-4 py-3 text-xs text-stone-600">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
          <span>
            Trạng thái kết nối dữ liệu:{' '}
            <strong className="font-medium text-stone-900">
              {isSupabaseConfigured
                ? 'Đã cấu hình Supabase (sẵn sàng cho đồng bộ đám mây)'
                : 'Chế độ khách chỉ đọc (lưu phiên cục bộ an toàn)'}
            </strong>
          </span>
        </span>
        <span className="hidden text-[11px] text-stone-500 sm:inline">
          100% Nội dung học thuật khóa SHA-256
        </span>
      </div>
    </FadeIn>
  );
}

export default HomePage;
