import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Compass,
  FileText,
  Network,
  PlayCircle,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router';
import { getLessonById, getSubjects } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { SearchBar } from '@/features/search';
import { SubjectCard } from '@/features/subject';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { ROUTES } from '@/shared/config/routes';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { FadeIn } from '@/shared/motion/FadeIn';
import {
  Button,
  Card,
  DefinitionPillarMotif,
  DongSonConcentricMotif,
  ExamplePillarMotif,
  ExercisePillarMotif,
  HeritageDivider,
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

  const lastLocation = lastVisitedGlobal ? getLessonById(lastVisitedGlobal.lessonId) : undefined;

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

  // Parallax nhẹ theo chuột cho Hero (tắt khi bật reduced motion)
  const prefersReducedMotion = useReducedMotion();
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (prefersReducedMotion) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
      const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
      setParallaxOffset({
        x: Math.round(xRatio * 12),
        y: Math.round(yRatio * 12),
      });
    },
    [prefersReducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    setParallaxOffset({ x: 0, y: 0 });
  }, []);

  const scrollToSubjects = () => {
    const el = document.getElementById('khong-gian-mon-hoc');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <FadeIn className="mx-auto max-w-5xl space-y-14 py-2 sm:py-4">
      {/* =========================================================================
          KHU VỰC 2: HERO SECTION (TIỀN SẢNH TRI THỨC ĐƯƠNG ĐẠI)
          ========================================================================= */}
      <section
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="border-vn-border/70 from-vn-surface/40 via-vn-surface/20 relative overflow-hidden rounded-3xl border bg-gradient-to-b to-transparent p-6 shadow-xs sm:p-10 lg:p-12"
      >
        {/* Đồ họa SVG vòng tròn đồng tâm Đông Sơn mờ nhẹ với hiệu ứng parallax 2.5D */}
        <div
          className="pointer-events-none absolute -top-24 -right-20 transition-transform duration-300 ease-out sm:-top-16 sm:-right-16"
          style={{
            transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0)`,
          }}
          aria-hidden="true"
        >
          <DongSonConcentricMotif className="text-vn-accent h-[440px] w-[440px] opacity-[0.14] sm:h-[540px] sm:w-[540px]" />
        </div>

        <div className="relative z-10 space-y-6">
          {/* Eyebrow */}
          <div className="border-vn-accent/40 bg-vn-surface/80 text-vn-primary inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold tracking-wider uppercase">
            <span className="bg-vn-secondary h-2 w-2 rounded-full" />
            <span>KHÔNG GIAN TRI THỨC ĐƯƠNG ĐẠI</span>
          </div>

          {/* Tiêu đề cấp 1 H1 bảo toàn kiểm thử tự động và yêu cầu người dùng */}
          <div className="space-y-3">
            <h1 className="space-y-1.5">
              <span className="text-vn-accent block text-xs font-semibold tracking-widest uppercase sm:text-sm">
                Không gian học tập Toán học đại học
              </span>
              <span className="text-vn-text block text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                KHAI MỞ TRI THỨC <br className="hidden sm:inline" />
                <span className="text-vn-primary">KẾT NỐI TƯƠNG LAI</span>
              </span>
            </h1>

            <p className="text-vn-muted max-w-2xl text-base leading-relaxed sm:text-lg">
              Learning Universe là không gian học tập nơi tri thức được hệ thống hóa, khám phá và
              kết nối thông qua những trải nghiệm học tập trực quan, hiện đại cho sinh viên Sư phạm
              Toán học.
            </p>
          </div>

          {/* Hành động kép (Dual CTA) */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={scrollToSubjects}
              className="bg-vn-primary hover:bg-vn-primary-hover text-white shadow-xs"
            >
              <span>Khám phá môn học</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-vn-border bg-vn-surface-card hover:border-vn-primary text-vn-text"
            >
              <Link
                to={
                  lastLocation
                    ? ROUTES.lesson(
                        lastLocation.subject.slug,
                        lastLocation.chapter.slug,
                        lastLocation.lesson.slug,
                      )
                    : ROUTES.lesson(
                        'cau-truc-dai-so',
                        '00-nhap-mon',
                        '01-tap-hop-anh-xa-va-cong-cu-so-hoc',
                      )
                }
              >
                <span>Bắt đầu hành trình</span>
              </Link>
            </Button>
          </div>

          {/* Thanh tìm kiếm tức thời */}
          <div className="pt-2">
            <SearchBar className="max-w-2xl" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHU VỰC 3: KHÔNG GIAN KHÁM PHÁ MÔN HỌC (SUBJECT CATALOG)
          ========================================================================= */}
      <section
        id="khong-gian-mon-hoc"
        aria-label="Không gian khám phá môn học"
        className="scroll-mt-20 space-y-6"
      >
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="text-vn-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
              <span className="bg-vn-primary h-1.5 w-1.5 rounded-full" />
              <span>Chương trình đào tạo Sư phạm</span>
            </div>
            <h2 className="text-vn-text text-2xl font-bold tracking-tight sm:text-3xl">
              KHÔNG GIAN KHÁM PHÁ TRI THỨC
            </h2>
            <p className="text-vn-muted text-sm sm:text-base">
              Mỗi môn học là một không gian riêng, nơi bạn có thể khám phá kiến thức theo hệ thống
              và tiến trình.
            </p>
          </div>
          <Link
            to={ROUTES.subjects}
            className="text-vn-primary decoration-vn-border hover:text-vn-text inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4 transition-colors"
          >
            <span>Xem tất cả môn học ({subjects.length})</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </section>

      <HeritageDivider className="opacity-70" />

      {/* =========================================================================
          KHU VỰC 4: THƯ VIỆN TRI THỨC (6 HỌC THUẬT CỐT LÕI)
          ========================================================================= */}
      <section aria-label="Thư viện tri thức" className="space-y-6">
        <div>
          <div className="text-vn-accent flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <span className="bg-vn-accent h-1.5 w-1.5 rounded-full" />
            <span>Quy chuẩn học thuật</span>
          </div>
          <h2 className="text-vn-text text-2xl font-bold tracking-tight sm:text-3xl">
            THƯ VIỆN TRI THỨC
          </h2>
          <p className="text-vn-muted text-sm sm:text-base">
            Hệ thống hóa nội dung học tập thông qua 6 cấu trúc học thuật kinh điển, chuẩn mực và
            minh bạch.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Lý thuyết */}
          <Card className="border-vn-border/80 bg-vn-surface-card hover:border-vn-primary/40 space-y-2.5 rounded-2xl p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="border-vn-border bg-vn-surface/60 text-vn-primary flex h-9 w-9 items-center justify-center rounded-xl border">
                <TheoryPillarMotif />
              </div>
              <h3 className="text-vn-text font-bold">Lý thuyết</h3>
            </div>
            <p className="text-vn-muted text-xs leading-relaxed">
              Mạch kiến thức nền tảng, xuất phát từ trực giác tự nhiên và dẫn dắt chặt chẽ đến các
              hệ tiên đề trừu tượng.
            </p>
          </Card>

          {/* 2. Định nghĩa */}
          <Card className="border-vn-border/80 bg-vn-surface-card hover:border-vn-primary/40 space-y-2.5 rounded-2xl p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="border-vn-border bg-vn-surface/60 text-vn-primary flex h-9 w-9 items-center justify-center rounded-xl border">
                <DefinitionPillarMotif />
              </div>
              <h3 className="text-vn-text font-bold">Định nghĩa</h3>
            </div>
            <p className="text-vn-muted text-xs leading-relaxed">
              Tường minh, gãy gọn, chuẩn hóa ký hiệu toán học quốc tế và làm rõ tính xác định tốt
              của mọi phép toán.
            </p>
          </Card>

          {/* 3. Định lý & Bổ đề */}
          <Card className="border-vn-border/80 bg-vn-surface-card hover:border-vn-primary/40 space-y-2.5 rounded-2xl p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="border-vn-border bg-vn-surface/60 text-vn-accent flex h-9 w-9 items-center justify-center rounded-xl border">
                <TheoremPillarMotif />
              </div>
              <h3 className="text-vn-text font-bold">Định lý & Bổ đề</h3>
            </div>
            <p className="text-vn-muted text-xs leading-relaxed">
              Đánh số Chương.Bài.Số chặt chẽ, khẳng định các cấu trúc then chốt và các định lý phân
              loại kinh điển.
            </p>
          </Card>

          {/* 4. Chứng minh */}
          <Card className="border-vn-border/80 bg-vn-surface-card hover:border-vn-primary/40 space-y-2.5 rounded-2xl p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="border-vn-border bg-vn-surface/60 text-vn-secondary flex h-9 w-9 items-center justify-center rounded-xl border">
                <ProofPillarMotif />
              </div>
              <h3 className="text-vn-text font-bold">Chứng minh</h3>
            </div>
            <p className="text-vn-muted text-xs leading-relaxed">
              Trình bày đầy đủ hai chiều, từng bước suy luận logic tường minh, không suy diễn tắt
              hay dùng giải thích qua loa.
            </p>
          </Card>

          {/* 5. Ví dụ trực quan */}
          <Card className="border-vn-border/80 bg-vn-surface-card hover:border-vn-primary/40 space-y-2.5 rounded-2xl p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="border-vn-border bg-vn-surface/60 text-vn-primary flex h-9 w-9 items-center justify-center rounded-xl border">
                <ExamplePillarMotif />
              </div>
              <h3 className="text-vn-text font-bold">Ví dụ minh họa</h3>
            </div>
            <p className="text-vn-muted text-xs leading-relaxed">
              Mô hình hóa trên các đối tượng cụ thể như nhóm modulo, nhóm hoán vị, vành đa thức giúp
              kiểm chứng trực giác.
            </p>
          </Card>

          {/* 6. Bài tập & Lời giải */}
          <Card className="border-vn-border/80 bg-vn-surface-card hover:border-vn-primary/40 space-y-2.5 rounded-2xl p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="border-vn-border bg-vn-surface/60 text-vn-primary flex h-9 w-9 items-center justify-center rounded-xl border">
                <ExercisePillarMotif />
              </div>
              <h3 className="text-vn-text font-bold">Bài tập & Lời giải</h3>
            </div>
            <p className="text-vn-muted text-xs leading-relaxed">
              Hệ thống bài tập tự luyện kèm hướng dẫn giải chi tiết từng bước, rèn luyện tư duy phản
              biện toán học.
            </p>
          </Card>
        </div>
      </section>

      <HeritageDivider className="opacity-70" />

      {/* =========================================================================
          KHU VỰC 5: KHU VỰC BẢN ĐỒ TRI THỨC (KẾT NỐI NHỮNG MIỀN TRI THỨC)
          ========================================================================= */}
      <section aria-label="Bản đồ tri thức" className="space-y-6">
        <div>
          <div className="text-vn-primary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <Network className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mạng lưới liên kết khái niệm</span>
          </div>
          <h2 className="text-vn-text text-2xl font-bold tracking-tight sm:text-3xl">
            KẾT NỐI NHỮNG MIỀN TRI THỨC
          </h2>
          <p className="text-vn-muted text-sm sm:text-base">
            Khám phá sự liên thông hữu cơ giữa các khái niệm trừu tượng của đại số và không gian
            hình học đa chiều.
          </p>
        </div>

        <div className="border-vn-border/80 bg-vn-surface-card relative overflow-hidden rounded-3xl border p-6 sm:p-8">
          {/* Dòng chảy khái niệm trực quan */}
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-vn-text text-sm font-semibold">
                Dòng chảy Cấu trúc: Từ Tiên đề đến Không gian
              </span>
              <span className="text-vn-muted text-xs">Nhấp vào một khái niệm để mở bài học</span>
            </div>

            {/* Sơ đồ tương tác mộc mạc phong cách nan tre */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to={ROUTES.lesson(
                  'cau-truc-dai-so',
                  '01-nua-nhom-va-nhom',
                  '01-nua-nhom-vi-nhom-va-tien-de-nhom',
                )}
                className="border-vn-border/70 bg-vn-surface/40 hover:border-vn-primary hover:bg-vn-surface group rounded-2xl border p-4 transition-all"
              >
                <span className="text-vn-accent text-[11px] font-semibold uppercase">
                  Đại số 01
                </span>
                <p className="text-vn-text group-hover:text-vn-primary mt-1 text-sm font-bold transition-colors">
                  Nửa nhóm & Nhóm
                </p>
                <p className="text-vn-muted mt-1 text-xs">
                  Phép toán hai ngôi, tính kết hợp và phần tử đơn vị
                </p>
              </Link>

              <Link
                to={ROUTES.lesson(
                  'cau-truc-dai-so',
                  '04-nhom-con-chuan-tac-va-nhom-thuong',
                  '02-nhom-thuong-va-tinh-xac-dinh-tot',
                )}
                className="border-vn-border/70 bg-vn-surface/40 hover:border-vn-primary hover:bg-vn-surface group rounded-2xl border p-4 transition-all"
              >
                <span className="text-vn-accent text-[11px] font-semibold uppercase">
                  Đại số 04
                </span>
                <p className="text-vn-text group-hover:text-vn-primary mt-1 text-sm font-bold transition-colors">
                  Cấu trúc Thương
                </p>
                <p className="text-vn-muted mt-1 text-xs">
                  Nhóm con chuẩn tắc và tính xác định tốt trên lớp kề
                </p>
              </Link>

              <Link
                to={ROUTES.lesson(
                  'cau-truc-dai-so',
                  '07-idean-va-vanh-thuong',
                  '01-idean-giao-tong-va-idean-sinh',
                )}
                className="border-vn-border/70 bg-vn-surface/40 hover:border-vn-primary hover:bg-vn-surface group rounded-2xl border p-4 transition-all"
              >
                <span className="text-vn-accent text-[11px] font-semibold uppercase">
                  Đại số 07
                </span>
                <p className="text-vn-text group-hover:text-vn-primary mt-1 text-sm font-bold transition-colors">
                  Iđêan & Vành
                </p>
                <p className="text-vn-muted mt-1 text-xs">
                  Điều kiện hấp thụ phép nhân và vành thương R/I
                </p>
              </Link>

              <Link
                to={ROUTES.lesson('hinh-hoc-affine', 'khong-gian-affine', 'khong-gian-affine')}
                className="border-vn-border/70 bg-vn-surface/40 hover:border-vn-primary hover:bg-vn-surface group rounded-2xl border p-4 transition-all"
              >
                <span className="text-vn-accent text-[11px] font-semibold uppercase">
                  Hình học 01
                </span>
                <p className="text-vn-text group-hover:text-vn-primary mt-1 text-sm font-bold transition-colors">
                  Không gian Affine
                </p>
                <p className="text-vn-muted mt-1 text-xs">
                  Tác động tự do và truyền tiếp của không gian vector
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HeritageDivider className="opacity-70" />

      {/* =========================================================================
          KHU VỰC 6: HÀNH TRÌNH CHINH PHỤC TRI THỨC (TIẾN TRÌNH & HỌC TẬP CÁ NHÂN)
          ========================================================================= */}
      <section aria-label="Hành trình học tập" className="space-y-6">
        <div>
          <div className="text-vn-secondary flex items-center gap-2 text-xs font-semibold tracking-wider uppercase">
            <span className="bg-vn-secondary h-1.5 w-1.5 rounded-full" />
            <span>Tiến trình cá nhân</span>
          </div>
          <h2 className="text-vn-text text-2xl font-bold tracking-tight sm:text-3xl">
            HÀNH TRÌNH CHINH PHỤC TRI THỨC
          </h2>
          <p className="text-vn-muted text-sm sm:text-base">
            Theo dõi tiến trình cá nhân, ghi nhớ bài học và làm chủ từng nấc thang học thuật.
          </p>
        </div>

        {isAuthenticated ? (
          /* Trạng thái 1: Học viên đã đăng nhập */
          <div className="border-vn-border/80 bg-vn-surface-card space-y-6 rounded-3xl border p-6 sm:p-8">
            <div className="border-vn-border/60 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="border-vn-border flex h-11 w-11 items-center justify-center rounded-2xl border bg-emerald-50 text-emerald-700">
                  <UserCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-vn-text text-lg font-bold">{learnerName}</h3>
                  <p className="text-vn-muted text-xs">Chế độ Học viên · Dữ liệu đã đồng bộ</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-vn-primary border-vn-border bg-vn-surface/60 rounded-xl border px-3 py-1.5 text-xs font-semibold">
                  {completedCount}/{totalLessonCount} bài học ({progressPercent}%)
                </span>
              </div>
            </div>

            {/* Chỉ số cá nhân */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="border-vn-border/70 bg-vn-surface/40 rounded-2xl border p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase">Đã hoàn thành</span>
                </div>
                <p className="text-vn-text mt-2 text-2xl font-extrabold">{completedCount} bài</p>
                <p className="text-vn-muted text-xs">Trên tổng số {totalLessonCount} bài học</p>
              </div>

              <div className="border-vn-border/70 bg-vn-surface/40 rounded-2xl border p-4">
                <div className="text-vn-secondary flex items-center gap-2">
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase">Yêu thích</span>
                </div>
                <p className="text-vn-text mt-2 text-2xl font-extrabold">{bookmarkedCount} bài</p>
                <p className="text-vn-muted text-xs">Đã lưu vào danh mục theo dõi</p>
              </div>

              <div className="border-vn-border/70 bg-vn-surface/40 rounded-2xl border p-4">
                <div className="text-vn-primary flex items-center gap-2">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase">Ghi chú cá nhân</span>
                </div>
                <p className="text-vn-text mt-2 text-2xl font-extrabold">{notesCount} mục</p>
                <p className="text-vn-muted text-xs">Ghi chú học thuật trong các bài</p>
              </div>
            </div>

            {/* Bài học gần nhất */}
            {lastLocation && (
              <div className="border-l-vn-secondary border-vn-border bg-vn-surface/50 flex flex-col justify-between gap-4 rounded-2xl border border-l-4 p-5 sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="text-vn-primary flex items-center gap-2 text-xs font-semibold uppercase">
                    <PlayCircle className="text-vn-secondary h-4 w-4" aria-hidden="true" />
                    <span>Bài học đang đọc dở · {lastLocation.subject.title}</span>
                  </div>
                  <p className="text-vn-text text-base font-semibold">
                    Bài {lastLocation.chapter.number}.{lastLocation.lesson.number}:{' '}
                    {lastLocation.lesson.title}
                  </p>
                </div>
                <Button
                  asChild
                  variant="primary"
                  size="sm"
                  className="bg-vn-primary hover:bg-vn-primary-hover text-white"
                >
                  <Link
                    to={ROUTES.lesson(
                      lastLocation.subject.slug,
                      lastLocation.chapter.slug,
                      lastLocation.lesson.slug,
                    )}
                  >
                    <span>Đọc tiếp bài học</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* Trạng thái 2: Người dùng ở Chế độ Khách (chưa đăng nhập) */
          <div className="space-y-4">
            {lastLocation && (
              <Card className="border-l-vn-secondary border-vn-border/80 bg-vn-surface-card flex flex-col justify-between gap-4 rounded-2xl border-l-4 p-5 shadow-2xs sm:flex-row sm:items-center">
                <div className="space-y-1">
                  <div className="text-vn-primary flex items-center gap-2 text-xs font-semibold uppercase">
                    <PlayCircle className="text-vn-secondary h-4 w-4" aria-hidden="true" />
                    <span>Tiếp tục phiên đọc gần nhất · {lastLocation.subject.title}</span>
                  </div>
                  <p className="text-vn-text text-base font-semibold">
                    Bài {lastLocation.chapter.number}.{lastLocation.lesson.number}:{' '}
                    {lastLocation.lesson.title}
                  </p>
                </div>
                <Button
                  asChild
                  variant="primary"
                  size="sm"
                  className="bg-vn-primary hover:bg-vn-primary-hover text-white"
                >
                  <Link
                    to={ROUTES.lesson(
                      lastLocation.subject.slug,
                      lastLocation.chapter.slug,
                      lastLocation.lesson.slug,
                    )}
                  >
                    <span>Đọc tiếp bài học</span>
                  </Link>
                </Button>
              </Card>
            )}

            <div className="border-vn-border/80 bg-vn-surface-card flex flex-col justify-between gap-5 rounded-3xl border p-6 shadow-2xs sm:flex-row sm:items-center sm:p-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="text-vn-muted h-4 w-4" aria-hidden="true" />
                  <span className="text-vn-text text-sm font-bold">
                    Trải nghiệm tự do ở Chế độ Khách
                  </span>
                </div>
                <p className="text-vn-muted max-w-xl text-xs leading-relaxed sm:text-sm">
                  Bạn có thể đọc toàn bộ 40 bài học công khai không giới hạn. Để lưu bài yêu thích,
                  viết ghi chú cá nhân và đồng bộ hóa tiến độ học trên các thiết bị, hãy kích hoạt
                  Chế độ Học viên.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => enableLearnerMode()}
                className="border-vn-border bg-vn-surface/70 hover:border-vn-primary text-vn-primary shrink-0 font-medium"
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
      <div className="border-vn-border/70 bg-vn-surface/40 text-vn-muted flex items-center justify-between rounded-xl border px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="text-vn-accent h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Trạng thái kết nối dữ liệu:{' '}
            <strong className="text-vn-text font-medium">
              {isSupabaseConfigured
                ? 'Đã cấu hình Supabase (sẵn sàng cho đồng bộ đám mây)'
                : 'Chế độ khách chỉ đọc (lưu phiên cục bộ an toàn)'}
            </strong>
          </span>
        </span>
        <span className="text-vn-muted hidden text-[11px] sm:inline">
          100% Nội dung học thuật khóa SHA-256
        </span>
      </div>
    </FadeIn>
  );
}

export default HomePage;
