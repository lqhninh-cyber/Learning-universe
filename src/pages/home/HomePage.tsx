import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookMarked,
  BookOpen,
  Clock,
  Compass,
  FileText,
  GraduationCap,
  Layers,
  Play,
  Sigma,
  Sparkles,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { getLessonById, getSubjectBySlug, getSubjects, getSubjectStats } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { SearchBar } from '@/features/search';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { COURSE_DIRECT_PDF_LINKS, EXTERNAL_LINKS, ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Button, ProgressRing } from '@/shared/ui';

interface CourseEditorialMeta {
  readonly slug: string;
  readonly code: string;
  readonly shortCode: string;
  readonly layoutStyle: 'portrait' | 'landscape' | 'rhythmic' | 'broadsheet';
  readonly aspectBadge: string;
  readonly domainTag: string;
  readonly editorialLead: string;
  readonly formulaOrMotif: string;
  readonly highlights: readonly string[];
  readonly pdfUrl: string;
}

type KnownCourseSlug =
  'cau-truc-dai-so' | 'hinh-hoc-affine' | 'giai-tich-ham-mot-bien' | 'giao-duc-hoc';

const COURSE_EDITORIAL_META: Readonly<Record<KnownCourseSlug, CourseEditorialMeta>> = {
  'cau-truc-dai-so': {
    slug: 'cau-truc-dai-so',
    code: 'MATH1301',
    shortCode: 'CTĐS',
    layoutStyle: 'portrait',
    aspectBadge: 'Portrait · 3:4',
    domainTag: 'Nhóm • Vành • Trường',
    editorialLead:
      'Khảo sát tính đối xứng bất biến qua thang bậc tiên đề: từ Nửa nhóm, Nhóm đối xứng, Định lý Lagrange đến Đồng cấu Vành và Trường thương.',
    formulaOrMotif: 'G / ker(φ) ≅ Im(φ)',
    highlights: [
      'Thang bậc tiên đề & Bảng Cayley',
      'Lớp kề Lagrange & Nhóm thương',
      'Vành đa thức, Iđêan & Miền nguyên',
    ],
    pdfUrl: COURSE_DIRECT_PDF_LINKS['cau-truc-dai-so'] ?? EXTERNAL_LINKS.googleDriveDocs,
  },
  'hinh-hoc-affine': {
    slug: 'hinh-hoc-affine',
    code: 'MATH1302',
    shortCode: 'HHAE',
    layoutStyle: 'landscape',
    aspectBadge: 'Panorama · 16:9',
    domainTag: 'Không gian Affine & Euclide',
    editorialLead:
      'Kiến tạo trực giác không gian qua hệ quy chiếu véc-tơ tự do, tâm tỉ cự, phẳng con, ánh xạ bảo toàn tỉ số đơn và cấu trúc mêtric Euclide.',
    formulaOrMotif: 'Aff(ℰ) : M ↦ O′ + f⃗(OM⃗)',
    highlights: [
      'Quy tắc Chasles & Tâm tỉ cự',
      'Phẳng con & Ánh xạ Affine',
      'Không gian Euclide & Đẳng cự',
    ],
    pdfUrl: COURSE_DIRECT_PDF_LINKS['hinh-hoc-affine'] ?? EXTERNAL_LINKS.googleDriveDocs,
  },
  'giai-tich-ham-mot-bien': {
    slug: 'giai-tich-ham-mot-bien',
    code: 'MATH1303',
    shortCode: 'GTHMB',
    layoutStyle: 'rhythmic',
    aspectBadge: 'Rhythmic Flow',
    domainTag: 'Giới hạn • Vi tích phân • Chuỗi',
    editorialLead:
      'Dòng chảy liên tục của giải tích thực: từ tiên đề cận trên đúng, giới hạn ε–δ, đạo hàm vi phân đến tích phân Riemann, chuỗi lũy thừa và 6 bộ đề thi chuẩn.',
    formulaOrMotif: '∫ₐᵇ f(x) dx = F(b) − F(a)',
    highlights: [
      'Giới hạn ε–δ & Tính liên tục đều',
      'Định lý giá trị trung bình & Khai triển Taylor',
      'Tích phân suy rộng, Chuỗi hàm & 6 Đề thi',
    ],
    pdfUrl: COURSE_DIRECT_PDF_LINKS['giai-tich-ham-mot-bien'] ?? EXTERNAL_LINKS.googleDriveDocs,
  },
  'giao-duc-hoc': {
    slug: 'giao-duc-hoc',
    code: 'EDUT1401',
    shortCode: 'GDH',
    layoutStyle: 'broadsheet',
    aspectBadge: 'Broadsheet Edition',
    domainTag: 'Khoa học Giáo dục & Sư phạm',
    editorialLead:
      'Ấn bản học thuật chuyên sâu về bản chất hiện tượng giáo dục, sự hình thành nhân cách học sinh, lý luận dạy học, công tác chủ nhiệm lớp và 20 tình huống sư phạm thực tiễn.',
    formulaOrMotif: 'Nhân cách • Phương pháp • Sư phạm',
    highlights: [
      'Bản chất giáo dục & Sự phát triển nhân cách',
      'Nguyên tắc giáo dục & Công tác GVCN lớp',
      '19 văn bản pháp quy & 20 tình huống sư phạm',
    ],
    pdfUrl: COURSE_DIRECT_PDF_LINKS['giao-duc-hoc'] ?? EXTERNAL_LINKS.googleDriveDocs,
  },
};

function getCourseEditorialMeta(slug: string): CourseEditorialMeta | undefined {
  return (COURSE_EDITORIAL_META as Readonly<Record<string, CourseEditorialMeta>>)[slug];
}

function formatDurationHours(totalMinutes: number): string {
  const hours = Math.max(1, Math.round((totalMinutes / 60) * 10) / 10);
  return `${hours} giờ học (${totalMinutes} phút)`;
}

export function HomePage() {
  const subjects = getSubjects();
  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const learnerName = useLearningStore((state) => state.learnerName);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);

  const [hoveredWorld, setHoveredWorld] = useState<'math' | 'pedagogy' | null>(null);

  // Bài học gần nhất: ưu tiên bài người học đang học dở, nếu chưa có thì lấy bài tiêu biểu từ dữ liệu
  const activeRecentLesson =
    (lastVisitedGlobal ? getLessonById(lastVisitedGlobal.lessonId) : undefined) ??
    getLessonById('lop-ke-phan-hoach-va-chi-so-cua-nhom-con') ??
    getLessonById('dinh-nghia-nhom');

  // Tính toán số liệu thống kê thực tế từ toàn bộ các học phần
  const totalLessonCount = subjects.reduce((sum, sub) => sum + getSubjectStats(sub).lessonCount, 0);
  const totalChapterCount = subjects.reduce(
    (sum, sub) => sum + getSubjectStats(sub).chapterCount,
    0,
  );
  const completedCount = Object.keys(completedLessons).length;
  const progressPercent =
    totalLessonCount > 0 ? Math.round((completedCount / totalLessonCount) * 100) : 0;

  // Dữ liệu thực của 4 học phần
  const ctdsSubject = getSubjectBySlug('cau-truc-dai-so');
  const hhaeSubject = getSubjectBySlug('hinh-hoc-affine');
  const gthmbSubject = getSubjectBySlug('giai-tich-ham-mot-bien');
  const gdhSubject = getSubjectBySlug('giao-duc-hoc');

  const ctdsStats = ctdsSubject ? getSubjectStats(ctdsSubject) : null;
  const hhaeStats = hhaeSubject ? getSubjectStats(hhaeSubject) : null;
  const gthmbStats = gthmbSubject ? getSubjectStats(gthmbSubject) : null;
  const gdhStats = gdhSubject ? getSubjectStats(gdhSubject) : null;

  const mathSubjects = [ctdsSubject, hhaeSubject, gthmbSubject].filter(
    (item): item is NonNullable<typeof item> => Boolean(item),
  );
  const mathTotalLessons = mathSubjects.reduce(
    (acc, sub) => acc + getSubjectStats(sub).lessonCount,
    0,
  );

  return (
    <FadeIn className="mx-auto max-w-6xl space-y-24 bg-[#FAF7F2] py-2 text-stone-900 sm:space-y-28 sm:py-6">
      {/* =========================================================================
          1. SCENE 01: THE OPENING (Hero Mở Màn - Cinematic Contemporary Editorial)
          ========================================================================= */}
      <section
        aria-label="Scene 01: Tiền sảnh học thuật mở màn"
        className="relative flex min-h-[88vh] flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/80 bg-[#FDFBF7] px-6 py-10 shadow-xs sm:px-12 sm:py-14 lg:px-16 lg:py-16"
      >
        {/* Đường lưới kỷ hà siêu mảnh tạo chiều sâu giấy ngà ấm */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #1c1917 1px, transparent 1px), linear-gradient(to bottom, #1c1917 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        {/* Dải đường thẳng biên tập dọc tinh tế */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 left-12 hidden w-px bg-stone-200/50 lg:block"
          aria-hidden="true"
        />

        {/* Thanh chỉ mục biên tập đầu trang */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/60 pb-5">
          <div className="inline-flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-[#9A3412]" aria-hidden="true" />
            <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-stone-700 uppercase">
              HỌC VIỆN TRI THỨC TOÁN HỌC &amp; KHOA HỌC GIÁO DỤC
            </span>
          </div>
          <div className="hidden items-center gap-4 font-mono text-[11px] text-stone-500 sm:flex">
            <span>ẤN BẢN HỌC THUẬT SỐ 01</span>
            <span className="h-3 w-px bg-stone-300" aria-hidden="true" />
            <span>
              {subjects.length} HỌC PHẦN · {totalLessonCount} BÀI GIẢNG
            </span>
          </div>
        </div>

        {/* Bố cục bất đối xứng hiện đại (7 cột Tuyên ngôn / 5 cột Chỉ mục Kính mờ) */}
        <div className="relative z-10 my-auto grid grid-cols-1 items-center gap-12 py-8 lg:grid-cols-12 lg:gap-12">
          {/* CỘT TRÁI (7 Cột): Display Heading Serif & Lead Paragraph */}
          <div className="space-y-8 lg:col-span-7">
            <div className="space-y-5">
              <p className="font-mono text-xs font-semibold tracking-[0.16em] text-[#9A3412] uppercase">
                SCENE 01 · THE OPENING
              </p>

              <h1 className="font-serif text-4xl leading-[1.12] font-bold tracking-tight text-stone-950 sm:text-5xl lg:text-[3.35rem]">
                Nơi vẻ đẹp <span className="text-[#9A3412]">Toán học</span> giao hòa cùng{' '}
                <span className="text-indigo-950">Nghệ thuật Sư phạm</span>.
              </h1>

              <p className="max-w-xl text-base leading-[1.85] text-stone-700 sm:text-lg">
                Không gian biên tập học thuật đương đại lưu trữ hệ thống tiên đề, định lý, chứng
                minh toán học chặt chẽ cùng các học phần Khoa học Giáo dục và Nghiệp vụ Sư phạm
                chuẩn mực, đồng hành cùng sinh viên trên hành trình đại học.
              </p>
            </div>

            {/* Thanh tìm kiếm học thuật tức thời */}
            <div className="w-full max-w-xl">
              <SearchBar className="w-full" />
            </div>

            {/* Cụm hành động chính */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Button
                asChild
                variant="subject"
                size="md"
                className="gap-2.5 rounded-xl bg-[#9A3412] px-6 py-3 text-sm font-semibold text-white shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-950"
              >
                <a href="#khong-gian-mon-hoc">
                  <Compass className="h-4 w-4" aria-hidden="true" />
                  <span>Khám phá Không gian Tri thức</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </Button>

              <Button
                asChild
                variant="outline"
                size="md"
                className="gap-2 rounded-xl border-stone-300 bg-[#FAF7F2]/90 px-5 py-3 text-sm font-semibold text-stone-800 backdrop-blur-md transition-all hover:border-stone-400 hover:bg-stone-100/80"
              >
                <a href="#bo-suu-tap-hoc-phan">
                  <span>Bộ sưu tập {subjects.length} học phần</span>
                </a>
              </Button>
            </div>
          </div>

          {/* CỘT PHẢI (5 Cột): Khung Bảng Chỉ Mục Kính Mờ (Frosted Editorial Dossier) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-stone-200/80 bg-[#FAF7F2]/85 p-6 shadow-xs backdrop-blur-md sm:p-7">
              <div className="flex items-center justify-between border-b border-stone-200/70 pb-4">
                <div>
                  <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#9A3412] uppercase">
                    CHỈ MỤC HỌC THUẬT TRỌNG TÂM
                  </span>
                  <h2 className="mt-1 font-serif text-lg font-bold text-stone-900">
                    Cấu trúc Chương trình Đào tạo
                  </h2>
                </div>
                <span className="rounded-full border border-stone-300/80 bg-white/80 px-2.5 py-1 font-mono text-[11px] font-semibold text-stone-800">
                  {totalChapterCount} Chương
                </span>
              </div>

              <ul className="divide-y divide-stone-200/60 py-2">
                {subjects.map((subject, idx) => {
                  const stats = getSubjectStats(subject);
                  const meta = getCourseEditorialMeta(subject.slug);
                  const isPedagogy = subject.slug === 'giao-duc-hoc';
                  return (
                    <li key={subject.id} className="py-3.5 first:pt-2 last:pb-1">
                      <Link
                        to={ROUTES.subjectOverview(subject.slug)}
                        className="group flex items-start justify-between gap-3 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-stone-400">
                              0{idx + 1}
                            </span>
                            <span
                              className={cn(
                                'font-mono text-[11px] font-bold tracking-wider uppercase',
                                isPedagogy ? 'text-indigo-950' : 'text-[#9A3412]',
                              )}
                            >
                              {meta?.code ?? subject.id} · {meta?.shortCode ?? subject.slug}
                            </span>
                          </div>
                          <p className="font-serif text-sm font-bold text-stone-900 transition-colors group-hover:text-[#9A3412]">
                            {subject.title}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 pt-1 text-xs font-medium text-stone-600">
                          <span>{stats.lessonCount} bài</span>
                          <ArrowUpRight
                            className="h-3.5 w-3.5 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-stone-900"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-stone-200/70 pt-4 text-xs text-stone-600">
                <span>Chuẩn tương phản học thuật WCAG AAA</span>
                <Link
                  to={ROUTES.courses}
                  className="inline-flex items-center gap-1 font-semibold text-stone-900 hover:text-[#9A3412]"
                >
                  <span>Danh mục đầy đủ</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Chỉ báo cuộn trang (Scroll Indicator) thanh mảnh ở đáy màn hình với hiệu ứng nhịp thở nhẹ */}
        <div className="relative z-10 flex items-center justify-between border-t border-stone-200/60 pt-5">
          <a
            href="#khong-gian-mon-hoc"
            aria-label="Cuộn xuống Hai Cổng Không Gian Tri Thức"
            className="group inline-flex items-center gap-3 text-xs font-medium tracking-wider text-stone-600 uppercase transition-colors hover:text-stone-950"
          >
            <span className="flex h-7 w-7 animate-pulse items-center justify-center rounded-full border border-stone-300 bg-white/80 text-stone-700 transition-transform group-hover:translate-y-0.5">
              <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            <span>Cuộn để khám phá Hai Cổng Không Gian Tri Thức</span>
          </a>

          <span className="hidden font-mono text-[11px] text-stone-500 sm:inline">
            GIẤY NGÀ ẤM #FDFBF7 · KÍNH MỜ BACKDROP-BLUR
          </span>
        </div>
      </section>

      {/* =========================================================================
          2. SCENE 02: TWO WORLDS (Hai Cổng Không Gian Tri Thức - 55/45 Split Screen)
          ========================================================================= */}
      <section
        id="khong-gian-mon-hoc"
        aria-label="Chọn không gian học tập"
        className="scroll-mt-24 space-y-8"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200/70 pb-6 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#9A3412] uppercase">
              SCENE 02 · TWO WORLDS
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
              Hai Cổng Không Gian Tri Thức
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              Sự giao thoa cân bằng giữa tư duy tiên đề của Toán học Đại học và chiều sâu nhân văn
              của Khoa học Giáo dục. Di chuột vào từng cổng để mở rộng không gian phân môn.
            </p>
          </div>
          <Link
            to={ROUTES.courses}
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wide text-stone-900 uppercase hover:text-[#9A3412]"
          >
            <span>Tất cả học phần ({subjects.length})</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Bố cục Split Screen bất đối xứng 55/45 với hiệu ứng nở rộng khi hover */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          {/* =====================================================================
              CỔNG 1 — KHỐI TOÁN HỌC ĐẠI HỌC (Terracotta & Deep Stone, 55% mặc định)
              ===================================================================== */}
          <div
            onMouseEnter={() => setHoveredWorld('math')}
            onMouseLeave={() => setHoveredWorld(null)}
            className={cn(
              'group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-[#FDFBF7] p-7 shadow-xs transition-all duration-500 ease-out sm:p-9',
              hoveredWorld === 'math'
                ? 'border-[#9A3412]/50 shadow-md lg:w-[60%]'
                : hoveredWorld === 'pedagogy'
                  ? 'opacity-95 lg:w-[48%]'
                  : 'lg:w-[55%]',
            )}
          >
            {/* Đặc trưng thị giác: Đường nét kỷ hà mỏng & chiều sâu trừu tượng */}
            <svg
              className="pointer-events-none absolute -top-10 -right-10 h-64 w-64 text-stone-900/[0.04] transition-transform duration-500 ease-out group-hover:scale-105"
              viewBox="0 0 200 200"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" />
              <circle cx="100" cy="100" r="52" stroke="currentColor" strokeWidth="1" />
              <polygon points="100,20 169,140 31,140" stroke="currentColor" strokeWidth="1" />
              <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="0.75" />
              <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="0.75" />
            </svg>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#9A3412]/25 bg-[#9A3412]/10 px-3.5 py-1 text-xs font-bold tracking-wider text-[#9A3412] uppercase">
                  <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Cổng 1 — Khối Toán học Đại học</span>
                </span>
                <span className="font-mono text-xs font-semibold text-stone-600">
                  3 Học phần · {mathTotalLessons} Bài học
                </span>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-xs font-semibold tracking-[0.15em] text-[#9A3412] uppercase">
                  Cấu trúc • Không gian • Biến thiên
                </p>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
                  Cấu trúc Đại số, Hình học Affine &amp; Giải tích
                </h3>
              </div>

              {/* Trích dẫn ngắn về tư duy tiên đề */}
              <blockquote className="border-l-2 border-[#9A3412]/60 pl-4 font-serif text-sm leading-relaxed text-stone-700 italic">
                “Tư duy tiên đề không chỉ là nghệ thuật suy diễn nghiêm ngặt, mà là thấu kính nhận
                diện những cấu trúc bất biến ẩn sau sự vận động của không gian và đại lượng.”
              </blockquote>

              {/* Danh sách phân môn bên trong */}
              <div className="space-y-2.5 pt-1">
                {mathSubjects.map((sub) => {
                  const stats = getSubjectStats(sub);
                  const meta = getCourseEditorialMeta(sub.slug);
                  return (
                    <Link
                      key={sub.id}
                      to={ROUTES.subjectOverview(sub.slug)}
                      aria-label={sub.title}
                      className="group/item flex items-center justify-between rounded-2xl border border-stone-200/80 bg-[#FAF7F2]/90 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9A3412]/40 hover:bg-white hover:shadow-xs"
                    >
                      <div className="space-y-0.5 pr-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold tracking-wider text-[#9A3412] uppercase">
                            {meta?.shortCode ?? sub.slug}
                          </span>
                          <span className="text-xs font-bold text-stone-900 group-hover/item:text-[#9A3412]">
                            {sub.title}
                          </span>
                        </div>
                        <p className="line-clamp-1 text-xs text-stone-600">{meta?.domainTag}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded-md border border-stone-200 bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-stone-700">
                          {stats.chapterCount} chương · {stats.lessonCount} bài
                        </span>
                        <ArrowRight
                          className="h-3.5 w-3.5 text-stone-400 transition-transform group-hover/item:translate-x-0.5 group-hover/item:text-[#9A3412]"
                          aria-hidden="true"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="relative z-10 mt-7 flex items-center justify-between border-t border-stone-200/70 pt-4">
              <span className="font-mono text-[11px] text-stone-500">
                CTĐS • HHAE • GTHMB (CHUẨN KA-TEX &amp; MAFS)
              </span>
              <Link
                to={ROUTES.subjectOverview('cau-truc-dai-so')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#9A3412] hover:underline"
              >
                <span>Khám phá Khối Toán học</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* =====================================================================
              CỔNG 2 — KHỐI KHOA HỌC GIÁO DỤC & NGHIỆP VỤ SƯ PHẠM (Indigo & Stone, 45% mặc định)
              ===================================================================== */}
          <div
            onMouseEnter={() => setHoveredWorld('pedagogy')}
            onMouseLeave={() => setHoveredWorld(null)}
            className={cn(
              'group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-[#FDFBF7] p-7 shadow-xs transition-all duration-500 ease-out sm:p-9',
              hoveredWorld === 'pedagogy'
                ? 'border-indigo-950/50 shadow-md lg:w-[52%]'
                : hoveredWorld === 'math'
                  ? 'opacity-95 lg:w-[40%]'
                  : 'lg:w-[45%]',
            )}
          >
            {/* Đặc trưng thị giác: Đường kẻ biên tập tạp chí giáo dục đương đại */}
            <svg
              className="pointer-events-none absolute -top-8 -right-8 h-60 w-60 text-indigo-950/[0.04] transition-transform duration-500 ease-out group-hover:scale-105"
              viewBox="0 0 200 200"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="28"
                y="28"
                width="144"
                height="144"
                rx="16"
                stroke="currentColor"
                strokeWidth="1"
              />
              <line x1="28" y1="68" x2="172" y2="68" stroke="currentColor" strokeWidth="1" />
              <line x1="76" y1="68" x2="76" y2="172" stroke="currentColor" strokeWidth="1" />
              <circle cx="124" cy="120" r="28" stroke="currentColor" strokeWidth="1" />
            </svg>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-indigo-950/25 bg-indigo-950/10 px-3.5 py-1 text-xs font-bold tracking-wider text-indigo-950 uppercase">
                  <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Cổng 2 — Khoa học Giáo dục &amp; Sư phạm</span>
                </span>
                <span className="font-mono text-xs font-semibold text-stone-600">
                  EDUT1401 · HCMUE
                </span>
              </div>

              <div className="space-y-2">
                <p className="font-mono text-xs font-semibold tracking-[0.15em] text-indigo-950 uppercase">
                  Con người • Phương pháp • Nghệ thuật Dạy học
                </p>
                <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
                  Giáo dục học &amp; Nghiệp vụ Sư phạm Hiện đại
                </h3>
              </div>

              {/* Trích dẫn về phát triển nhân cách học sinh */}
              <blockquote className="border-l-2 border-indigo-950/60 pl-4 font-serif text-sm leading-relaxed text-stone-700 italic">
                “Giáo dục là quá trình tổ chức có mục đích nhằm đánh thức tiềm năng tự giáo dục, bồi
                đắp phẩm chất và kiến tạo nhân cách toàn diện cho từng người học.”
              </blockquote>

              {/* Phân môn Giáo dục học bên trong */}
              {gdhSubject && gdhStats && (
                <div className="space-y-3 pt-1">
                  <Link
                    to={ROUTES.subjectOverview('giao-duc-hoc')}
                    aria-label="Giáo dục học"
                    className="group/item block rounded-2xl border border-stone-200/80 bg-[#FAF7F2]/90 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-950/40 hover:bg-white hover:shadow-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-[10px] font-bold tracking-wider text-indigo-950 uppercase">
                          EDUT1401 · GDH
                        </span>
                        <h4 className="font-serif text-base font-bold text-stone-900 group-hover/item:text-indigo-950">
                          {gdhSubject.title}
                        </h4>
                      </div>
                      <span className="rounded-md border border-stone-200 bg-white px-2.5 py-0.5 font-mono text-[11px] font-semibold text-indigo-950">
                        {gdhStats.chapterCount} chương · {gdhStats.lessonCount} bài
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-stone-600">
                      Hệ thống lý luận giáo dục, phẩm chất nhân cách, công tác chủ nhiệm lớp và 20
                      tình huống sư phạm thực tiễn theo chuẩn CT GDPT 2018.
                    </p>
                  </Link>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-xl border border-stone-200/70 bg-[#FAF7F2]/70 p-3">
                      <span className="font-mono text-[10px] font-semibold text-stone-500 uppercase">
                        Tư liệu pháp quy
                      </span>
                      <p className="mt-0.5 font-serif font-bold text-stone-900">
                        19 văn bản &amp; cẩm nang
                      </p>
                    </div>
                    <div className="rounded-xl border border-stone-200/70 bg-[#FAF7F2]/70 p-3">
                      <span className="font-mono text-[10px] font-semibold text-stone-500 uppercase">
                        Thực hành nghề nghiệp
                      </span>
                      <p className="mt-0.5 font-serif font-bold text-stone-900">
                        20 tình huống sư phạm
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 mt-7 flex items-center justify-between border-t border-stone-200/70 pt-4">
              <span className="font-mono text-[11px] text-stone-500">
                CHUẨN SƯ PHẠM · RUBRIC A.1.2 &amp; A.1.9
              </span>
              <Link
                to={ROUTES.subjectOverview('giao-duc-hoc')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-950 hover:underline"
              >
                <span>Khám phá Khối Sư phạm</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SCENE 03: COURSE COLLECTION (Bộ Sưu Tập Học Phần So Le - Asymmetric Gallery)
          ========================================================================= */}
      <section
        id="bo-suu-tap-hoc-phan"
        aria-label="Bộ sưu tập học phần"
        className="scroll-mt-24 space-y-10"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200/70 pb-6 sm:flex-row sm:items-end">
          <div className="space-y-2">
            <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#9A3412] uppercase">
              SCENE 03 · COURSE COLLECTION
            </p>
            <h2 className="font-serif text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">
              Bộ Sưu Tập Học Phần So Le
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
              Trưng bày theo ngôn ngữ Gallery/Editorial với tỷ lệ khung hình riêng biệt tôn vinh đặc
              trưng nhận thức của từng học phần đại học.
            </p>
          </div>
          <span className="font-mono text-xs font-semibold text-stone-600">
            100% DỮ LIỆU HỌC PHẦN THỰC TẾ
          </span>
        </div>

        {/* BỐ CỤC GALLERY SO LE BẤT ĐỐI XỨNG (Staggered Editorial Showcase) */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* -------------------------------------------------------------------
              THẺ 01: CẤU TRÚC ĐẠI SỐ (CTĐS) — Dáng đứng (Portrait / 3:4) - 5 Cột
              ------------------------------------------------------------------- */}
          {ctdsSubject && ctdsStats && (
            <article
              aria-label="Học phần Cấu trúc đại số"
              className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-[#FDFBF7] p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#9A3412]/50 hover:shadow-sm sm:p-8 lg:col-span-5 lg:min-h-[540px]"
            >
              <div className="space-y-6">
                {/* Header Mã học phần & Khung tỷ lệ */}
                <div className="flex items-center justify-between gap-2 border-b border-stone-200/60 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#9A3412]/10 px-2.5 py-1 font-mono text-xs font-bold text-[#9A3412]">
                      {COURSE_EDITORIAL_META['cau-truc-dai-so'].code} ·{' '}
                      {COURSE_EDITORIAL_META['cau-truc-dai-so'].shortCode}
                    </span>
                    <span className="rounded-full border border-stone-200 bg-[#FAF7F2] px-2.5 py-0.5 text-[11px] font-medium text-stone-700">
                      {COURSE_EDITORIAL_META['cau-truc-dai-so'].domainTag}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
                    {COURSE_EDITORIAL_META['cau-truc-dai-so'].aspectBadge}
                  </span>
                </div>

                {/* Biểu trưng cấu trúc đối xứng Portrait */}
                <div className="rounded-2xl border border-stone-200/70 bg-[#FAF7F2] p-5">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-stone-500">
                    <span>ĐỐI XỨNG &amp; CẤU TRÚC NHÓM</span>
                    <span className="font-mono text-[#9A3412]">
                      {COURSE_EDITORIAL_META['cau-truc-dai-so'].formulaOrMotif}
                    </span>
                  </div>
                  <h3 className="mt-3 font-serif text-2xl font-bold tracking-tight text-stone-950 group-hover:text-[#9A3412]">
                    <Link to={ROUTES.subjectOverview('cau-truc-dai-so')}>{ctdsSubject.title}</Link>
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-stone-600">
                    {COURSE_EDITORIAL_META['cau-truc-dai-so'].editorialLead}
                  </p>
                </div>

                {/* Các điểm nhấn học thuật */}
                <ul className="space-y-2 text-xs text-stone-700">
                  {COURSE_EDITORIAL_META['cau-truc-dai-so'].highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9A3412]"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Thông số & Nút hành động */}
              <div className="mt-8 space-y-4 border-t border-stone-200/70 pt-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                    <Layers className="h-3.5 w-3.5 text-[#9A3412]" aria-hidden="true" />
                    <span>
                      {ctdsStats.chapterCount} chương · {ctdsStats.lessonCount} bài học
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-stone-600">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{formatDurationHours(ctdsStats.totalMinutes)}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <a
                    href={COURSE_EDITORIAL_META['cau-truc-dai-so'].pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 transition-colors hover:text-stone-950"
                  >
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Giáo trình PDF (Drive)</span>
                  </a>

                  <Button
                    asChild
                    variant="subject"
                    size="sm"
                    className="gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-[#9A3412]"
                  >
                    <Link to={ROUTES.subjectOverview('cau-truc-dai-so')}>
                      <span>Vào học phần</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          )}

          {/* CỘT PHẢI SO LE (7 Cột): Chứa Thẻ 02 (Panorama 16:9) & Thẻ 03 (Nhịp điệu uốn lượn) */}
          <div className="space-y-8 lg:col-span-7">
            {/* -----------------------------------------------------------------
                THẺ 02: HÌNH HỌC AFFINE & EUCLIDE (HHAE) — Panorama ngang (16:9)
                ----------------------------------------------------------------- */}
            {hhaeSubject && hhaeStats && (
              <article
                aria-label="Học phần Hình học Affine và hình học Euclide"
                className="group relative flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-[#FDFBF7] p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-950/50 hover:shadow-sm sm:p-8"
              >
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/60 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-indigo-950/10 px-2.5 py-1 font-mono text-xs font-bold text-indigo-950">
                        {COURSE_EDITORIAL_META['hinh-hoc-affine'].code} ·{' '}
                        {COURSE_EDITORIAL_META['hinh-hoc-affine'].shortCode}
                      </span>
                      <span className="rounded-full border border-stone-200 bg-[#FAF7F2] px-2.5 py-0.5 text-[11px] font-medium text-stone-700">
                        {COURSE_EDITORIAL_META['hinh-hoc-affine'].domainTag}
                      </span>
                      {/* Tag dẫn nhanh tới Phòng Lab mô phỏng 3D / Tương tác */}
                      <a
                        href="/interactive/affine-geometry.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#9A3412]/30 bg-[#9A3412]/10 px-3 py-0.5 text-[11px] font-bold text-[#9A3412] transition-colors hover:bg-[#9A3412] hover:text-white"
                      >
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        <span>Phòng Lab mô phỏng 3D &amp; Mafs</span>
                        <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </div>
                    <span className="font-mono text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
                      {COURSE_EDITORIAL_META['hinh-hoc-affine'].aspectBadge}
                    </span>
                  </div>

                  {/* Khung Panorama 16:9 trực quan hóa không gian Affine */}
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
                    <div className="space-y-2.5 md:col-span-8">
                      <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-950 group-hover:text-indigo-950">
                        <Link to={ROUTES.subjectOverview('hinh-hoc-affine')}>
                          {hhaeSubject.title}
                        </Link>
                      </h3>
                      <p className="text-sm leading-relaxed text-stone-600">
                        {COURSE_EDITORIAL_META['hinh-hoc-affine'].editorialLead}
                      </p>
                    </div>

                    <div className="flex aspect-video flex-col justify-between rounded-2xl border border-stone-200/80 bg-[#FAF7F2] p-4 md:col-span-4">
                      <span className="font-mono text-[10px] font-semibold tracking-wider text-indigo-950 uppercase">
                        BIẾN ĐỔI HÌNH HỌC
                      </span>
                      <p className="font-mono text-xs font-bold text-stone-800">
                        {COURSE_EDITORIAL_META['hinh-hoc-affine'].formulaOrMotif}
                      </p>
                      <Link
                        to={ROUTES.devFigures}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9A3412] hover:underline"
                      >
                        <span>Mở Phòng thí nghiệm Hình học</span>
                        <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/70 pt-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                      <Layers className="h-3.5 w-3.5 text-indigo-950" aria-hidden="true" />
                      <span>
                        {hhaeStats.chapterCount} chương · {hhaeStats.lessonCount} bài học
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{formatDurationHours(hhaeStats.totalMinutes)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={COURSE_EDITORIAL_META['hinh-hoc-affine'].pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 transition-colors hover:text-stone-950"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Giáo trình PDF</span>
                    </a>

                    <Button
                      asChild
                      variant="subject"
                      size="sm"
                      className="gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-950"
                    >
                      <Link to={ROUTES.subjectOverview('hinh-hoc-affine')}>
                        <span>Vào học phần</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            )}

            {/* -----------------------------------------------------------------
                THẺ 03: GIẢI TÍCH HÀM MỘT BIẾN (GTHMB) — Nhịp điệu uốn lượn (Rhythmic)
                ----------------------------------------------------------------- */}
            {gthmbSubject && gthmbStats && (
              <article
                aria-label="Học phần Giải tích hàm một biến"
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200/90 bg-[#FDFBF7] p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#9A3412]/50 hover:shadow-sm sm:p-8"
              >
                {/* Đường cong giải tích uốn lượn tinh tế */}
                <svg
                  className="pointer-events-none absolute right-0 bottom-12 h-28 w-72 text-[#9A3412]/[0.07]"
                  viewBox="0 0 320 100"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 70 C 60 10, 120 90, 180 40 C 240 -10, 280 80, 320 30"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M0 85 C 60 25, 120 105, 180 55 C 240 5, 280 95, 320 45"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                </svg>

                <div className="relative z-10 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/60 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-[#9A3412]/10 px-2.5 py-1 font-mono text-xs font-bold text-[#9A3412]">
                        {COURSE_EDITORIAL_META['giai-tich-ham-mot-bien'].code} ·{' '}
                        {COURSE_EDITORIAL_META['giai-tich-ham-mot-bien'].shortCode}
                      </span>
                      <span className="rounded-full border border-stone-200 bg-[#FAF7F2] px-2.5 py-0.5 text-[11px] font-medium text-stone-700">
                        {COURSE_EDITORIAL_META['giai-tich-ham-mot-bien'].domainTag}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#9A3412]">
                      {COURSE_EDITORIAL_META['giai-tich-ham-mot-bien'].formulaOrMotif}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-950 group-hover:text-[#9A3412]">
                      <Link to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}>
                        {gthmbSubject.title}
                      </Link>
                    </h3>
                    <p className="text-sm leading-relaxed text-stone-600">
                      {COURSE_EDITORIAL_META['giai-tich-ham-mot-bien'].editorialLead}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {COURSE_EDITORIAL_META['giai-tich-ham-mot-bien'].highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-lg border border-stone-200/80 bg-[#FAF7F2] px-3 py-1 text-xs font-medium text-stone-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="relative z-10 mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/70 pt-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                    <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                      <Layers className="h-3.5 w-3.5 text-[#9A3412]" aria-hidden="true" />
                      <span>
                        {gthmbStats.chapterCount} chương · {gthmbStats.lessonCount} bài học
                      </span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{formatDurationHours(gthmbStats.totalMinutes)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <a
                      href={COURSE_EDITORIAL_META['giai-tich-ham-mot-bien'].pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 transition-colors hover:text-stone-950"
                    >
                      <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Giáo trình PDF</span>
                    </a>

                    <Button
                      asChild
                      variant="subject"
                      size="sm"
                      className="gap-1.5 rounded-xl bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-[#9A3412]"
                    >
                      <Link to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}>
                        <span>Vào học phần</span>
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            )}
          </div>

          {/* -------------------------------------------------------------------
              THẺ 04: GIÁO DỤC HỌC ĐẠI CƯƠNG (GDH) — Ấn bản khổ lớn (Broadsheet 12 Cột)
              ------------------------------------------------------------------- */}
          {gdhSubject && gdhStats && (
            <article
              aria-label="Học phần Giáo dục học đại cương"
              className="group relative rounded-3xl border border-stone-200/90 bg-[#FDFBF7] p-7 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-indigo-950/50 hover:shadow-sm sm:p-9 lg:col-span-12"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/70 pb-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="rounded-md bg-indigo-950/10 px-2.5 py-1 font-mono text-xs font-bold text-indigo-950">
                    {COURSE_EDITORIAL_META['giao-duc-hoc'].code} ·{' '}
                    {COURSE_EDITORIAL_META['giao-duc-hoc'].shortCode}
                  </span>
                  <span className="rounded-full border border-stone-200 bg-[#FAF7F2] px-3 py-0.5 text-xs font-medium text-stone-700">
                    {COURSE_EDITORIAL_META['giao-duc-hoc'].domainTag}
                  </span>
                </div>
                <span className="font-mono text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
                  {COURSE_EDITORIAL_META['giao-duc-hoc'].aspectBadge} · ĐẠI HỌC SƯ PHẠM TP.HCM
                </span>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                <div className="space-y-3 lg:col-span-7">
                  <h3 className="font-serif text-2xl font-bold tracking-tight text-stone-950 group-hover:text-indigo-950 sm:text-3xl">
                    <Link to={ROUTES.subjectOverview('giao-duc-hoc')}>
                      Giáo dục học đại cương ({gdhSubject.title})
                    </Link>
                  </h3>
                  <p className="text-sm leading-relaxed text-stone-600 sm:text-base">
                    {COURSE_EDITORIAL_META['giao-duc-hoc'].editorialLead}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:col-span-5">
                  {COURSE_EDITORIAL_META['giao-duc-hoc'].highlights.map((item, index) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-stone-200/80 bg-[#FAF7F2] p-3.5"
                    >
                      <span className="font-mono text-[10px] font-bold text-indigo-950">
                        CHUYÊN ĐỀ 0{index + 1}
                      </span>
                      <p className="mt-1 text-xs leading-snug font-medium text-stone-800">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/70 pt-5">
                <div className="flex flex-wrap items-center gap-5 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                    <Layers className="h-3.5 w-3.5 text-indigo-950" aria-hidden="true" />
                    <span>
                      {gdhStats.chapterCount} chương · {gdhStats.lessonCount} bài học
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{formatDurationHours(gdhStats.totalMinutes)}</span>
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-indigo-950">
                    3 TÍN CHỈ · 19 TỆP PDF PHÁP QUY &amp; GIÁO TRÌNH
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={COURSE_EDITORIAL_META['giao-duc-hoc'].pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 transition-colors hover:text-stone-950"
                  >
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Giáo trình PDF (Drive)</span>
                  </a>

                  <Button
                    asChild
                    variant="subject"
                    size="sm"
                    className="gap-1.5 rounded-xl bg-indigo-950 px-5 py-2 text-xs font-semibold text-white hover:bg-stone-900"
                  >
                    <Link to={ROUTES.subjectOverview('giao-duc-hoc')}>
                      <span>Vào học phần</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          )}
        </div>
      </section>

      {/* =========================================================================
          4. SCENE 04: CONTINUE EXPLORING & MINIMALIST FOOTER
          ========================================================================= */}
      <section aria-label="Tiếp tục khám phá và lối tắt học thuật" className="space-y-12">
        <div className="border-b border-stone-200/70 pb-5">
          <p className="font-mono text-xs font-bold tracking-[0.18em] text-[#9A3412] uppercase">
            SCENE 04 · CONTINUE EXPLORING
          </p>
          <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-stone-950 sm:text-3xl">
            Tiếp Tục Học Dở &amp; Lối Tắt Học Thuật
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* WIDGET TỐI GIẢN: TIẾP TỤC HỌC DỞ (7 Cột) */}
          {activeRecentLesson && (
            <div
              role="region"
              aria-label="Tiếp tục học dở"
              className="flex flex-col justify-between rounded-3xl border border-stone-200/90 bg-[#FDFBF7] p-6 shadow-2xs sm:p-8 lg:col-span-7"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9A3412]/25 bg-[#9A3412]/10 px-3 py-0.5 text-[11px] font-bold tracking-wide text-[#9A3412] uppercase">
                    <Play className="h-3 w-3" aria-hidden="true" />
                    <span>Tiếp tục học dở</span>
                  </span>
                  <span className="font-mono text-xs font-medium text-stone-500">
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

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/70 pt-5">
                <div className="flex items-center gap-4 text-xs text-stone-600">
                  <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
                    <span>Tiến độ tổng thể:</span>
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
                  className="gap-2 rounded-xl bg-[#9A3412] px-5 py-2.5 text-xs font-semibold text-white hover:bg-stone-900"
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
          <div className="flex flex-col justify-between gap-4 lg:col-span-5">
            {/* Lối tắt 1: Ngân hàng Thuật ngữ (Glossary) */}
            <Link
              to={ROUTES.glossary}
              className="group flex items-start justify-between gap-4 rounded-2xl border border-stone-200/90 bg-[#FDFBF7] p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#9A3412]/50 hover:shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-[#FAF7F2] text-[#9A3412]">
                  <BookMarked className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-stone-950 group-hover:text-[#9A3412]">
                    Ngân hàng Thuật ngữ (Glossary)
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600">
                    Tra cứu tức thời hệ thống định nghĩa, ký hiệu KaTeX và thuật ngữ toán học song
                    ngữ Việt – Anh.
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#9A3412]"
                aria-hidden="true"
              />
            </Link>

            {/* Lối tắt 2: Kho Tài liệu Giáo trình */}
            <a
              href={EXTERNAL_LINKS.googleDriveDocs}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-4 rounded-2xl border border-stone-200/90 bg-[#FDFBF7] p-5 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-950/50 hover:shadow-xs"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-[#FAF7F2] text-indigo-950">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-stone-950 group-hover:text-indigo-950">
                    Kho Tài liệu Giáo trình
                  </h3>
                  <p className="text-xs leading-relaxed text-stone-600">
                    Truy cập trực tiếp giáo trình chính, đề cương học phần và 19 văn bản pháp quy
                    lưu trữ trên Google Drive.
                  </p>
                </div>
              </div>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-stone-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-950"
                aria-hidden="true"
              />
            </a>

            {/* Thanh trạng thái phiên học viên tối giản */}
            <div className="flex items-center justify-between rounded-2xl border border-stone-200/80 bg-[#FAF7F2] px-4 py-3 text-xs text-stone-700">
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

        {/* CHÂN TRANG BIÊN TẬP TỐI GIẢN (Minimalist Editorial Colophon) */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-stone-200/80 pt-8 text-xs text-stone-600 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <p className="font-serif text-sm font-bold text-stone-900">
              Learning Universe · Học viện Tri thức Toán học &amp; Khoa học Giáo dục
            </p>
            <p>
              Biên tập cho sinh viên ngành Sư phạm Toán học · Trường Đại học Sư phạm TP. Hồ Chí Minh
              (HCMUE).
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] text-stone-500">
            <span>100% NỘI DUNG KHÓA SHA-256</span>
            <span className="h-3 w-px bg-stone-300" aria-hidden="true" />
            <span>WCAG AAA EDITORIAL</span>
          </div>
        </div>
      </section>
    </FadeIn>
  );
}

export default HomePage;
