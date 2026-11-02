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
import { Link } from 'react-router';
import { getLessonById, getSubjects } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { SearchBar } from '@/features/search';
import { SubjectCard } from '@/features/subject';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import {
  Button,
  Card,
  DefinitionPillarMotif,
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
    <FadeIn className="mx-auto max-w-5xl space-y-12 py-2 sm:py-4">
      {/* =========================================================================
          KHU VỰC 1: HERO SECTION (HỌC THUẬT ĐƯƠNG ĐẠI - TỐI GIẢN TINH TẾ)
          ========================================================================= */}
      <section
        aria-label="Tiền sảnh học thuật"
        className="relative overflow-hidden rounded-3xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/25 p-8 text-center shadow-2xs sm:p-12 lg:p-16"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center space-y-6">
          {/* Huy hiệu danh mục học thuật */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--bg-muted)] bg-[var(--bg-surface)] px-4 py-1 text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)]" />
            <span>KHÔNG GIAN TRI THỨC ĐƯƠNG ĐẠI</span>
          </div>

          {/* Tiêu đề cấp 1 H1 (Font có chân Crimson Pro) và Đoạn mô tả học thuật trực diện */}
          <div className="space-y-4">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl">
              Không gian học tập Toán học đại học
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
              Nền tảng tổng hợp lý thuyết, định nghĩa, định lý, chứng minh và bài tập có hướng dẫn
              giải chuyên ngành Toán học.
            </p>
          </div>

          {/* Thanh tìm kiếm nhanh căn giữa - đặt thẳng dưới mô tả */}
          <div className="w-full max-w-2xl pt-2">
            <SearchBar className="w-full" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          KHU VỰC 2: KHỐI TIẾP TỤC HỌC TẬP (TIẾP TỤC BÀI HỌC GẦN NHẤT)
          ========================================================================= */}
      {activeRecentLesson && (
        <section aria-label="Tiếp tục bài học gần nhất">
          <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/30 p-5 transition-colors hover:border-[var(--accent-primary)]/40 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent-wood)] uppercase">
                <PlayCircle className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                <span>Tiếp tục bài học gần nhất · {activeRecentLesson.subject.title}</span>
              </div>
              <p className="font-serif text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                Bài {activeRecentLesson.chapter.number}.{activeRecentLesson.lesson.number}:{' '}
                {activeRecentLesson.lesson.title}
              </p>
              <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
                {activeRecentLesson.lesson.description}
              </p>
            </div>
            <Button
              asChild
              variant="primary"
              size="sm"
              className="shrink-0 bg-[var(--accent-primary)] text-white hover:bg-[#2A1F13]"
            >
              <Link
                to={ROUTES.lesson(
                  activeRecentLesson.subject.slug,
                  activeRecentLesson.chapter.slug,
                  activeRecentLesson.lesson.slug,
                )}
              >
                <span>Đọc tiếp bài học</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      <HeritageDivider className="opacity-70" />

      {/* =========================================================================
          KHU VỰC 3: CÁC HỌC PHẦN HIỆN CÓ (SUBJECT CATALOG)
          ========================================================================= */}
      <section
        id="khong-gian-mon-hoc"
        aria-label="Các học phần hiện có"
        className="scroll-mt-20 space-y-6"
      >
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
              Các học phần hiện có
            </h2>
            <p className="text-sm text-[var(--text-secondary)] sm:text-base">
              Mỗi học phần là một không gian học tập chuyên biệt với hệ thống bài giảng, định lý và
              bài tập có hướng dẫn.
            </p>
          </div>
          <Link
            to={ROUTES.subjects}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-primary)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/60 text-[var(--accent-primary)]">
                <TheoryPillarMotif />
              </div>
              <h3 className="font-serif font-bold text-[var(--text-primary)]">Lý thuyết</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Mạch kiến thức nền tảng, xuất phát từ trực giác tự nhiên và dẫn dắt chặt chẽ đến các
              hệ tiên đề trừu tượng.
            </p>
          </Card>

          {/* 2. Định nghĩa */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/60 text-[var(--accent-primary)]">
                <DefinitionPillarMotif />
              </div>
              <h3 className="font-serif font-bold text-[var(--text-primary)]">Định nghĩa</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Tường minh, gãy gọn, chuẩn hóa ký hiệu toán học quốc tế và làm rõ tính xác định tốt
              của mọi phép toán.
            </p>
          </Card>

          {/* 3. Định lý & Bổ đề */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/60 text-[var(--accent-wood)]">
                <TheoremPillarMotif />
              </div>
              <h3 className="font-serif font-bold text-[var(--text-primary)]">Định lý & Bổ đề</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Đánh số Chương.Bài.Số chặt chẽ, khẳng định các cấu trúc then chốt và các định lý phân
              loại kinh điển.
            </p>
          </Card>

          {/* 4. Chứng minh */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/60 text-[#8B302D]">
                <ProofPillarMotif />
              </div>
              <h3 className="font-serif font-bold text-[var(--text-primary)]">Chứng minh</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Trình bày đầy đủ hai chiều, từng bước suy luận logic tường minh, không suy diễn tắt
              hay dùng giải thích qua loa.
            </p>
          </Card>

          {/* 5. Ví dụ trực quan */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/60 text-[var(--accent-primary)]">
                <ExamplePillarMotif />
              </div>
              <h3 className="font-serif font-bold text-[var(--text-primary)]">Ví dụ minh họa</h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
              Mô hình hóa trên các đối tượng cụ thể như nhóm modulo, nhóm hoán vị, vành đa thức giúp
              kiểm chứng trực giác.
            </p>
          </Card>

          {/* 6. Bài tập & Lời giải */}
          <Card className="space-y-2.5 rounded-2xl border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--accent-primary)]/40 hover:shadow-xs">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/60 text-[var(--accent-primary)]">
                <ExercisePillarMotif />
              </div>
              <h3 className="font-serif font-bold text-[var(--text-primary)]">
                Bài tập & Lời giải
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
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
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[var(--accent-primary)] uppercase">
            <Network className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Mạng lưới liên kết khái niệm</span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            KẾT NỐI NHỮNG MIỀN TRI THỨC
          </h2>
          <p className="text-sm text-[var(--text-secondary)] sm:text-base">
            Khám phá sự liên thông hữu cơ giữa các khái niệm trừu tượng của đại số và không gian
            hình học đa chiều.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/25 p-6 sm:p-8">
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                Dòng chảy Cấu trúc: Từ Tiên đề đến Không gian
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                Nhấp vào một khái niệm để mở bài học
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to={ROUTES.lesson(
                  'cau-truc-dai-so',
                  '01-nua-nhom-va-nhom',
                  '01-nua-nhom-vi-nhom-va-tien-de-nhom',
                )}
                className="group rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-4 transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--bg-surface)]/40"
              >
                <span className="text-[11px] font-semibold text-[var(--accent-wood)] uppercase">
                  Đại số 01
                </span>
                <p className="mt-1 font-serif text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-primary)]">
                  Nửa nhóm & Nhóm
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Phép toán hai ngôi, tính kết hợp và phần tử đơn vị
                </p>
              </Link>

              <Link
                to={ROUTES.lesson(
                  'cau-truc-dai-so',
                  '04-nhom-con-chuan-tac-va-nhom-thuong',
                  '02-nhom-thuong-va-tinh-xac-dinh-tot',
                )}
                className="group rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-4 transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--bg-surface)]/40"
              >
                <span className="text-[11px] font-semibold text-[var(--accent-wood)] uppercase">
                  Đại số 04
                </span>
                <p className="mt-1 font-serif text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-primary)]">
                  Cấu trúc Thương
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Nhóm con chuẩn tắc và tính xác định tốt trên lớp kề
                </p>
              </Link>

              <Link
                to={ROUTES.lesson(
                  'cau-truc-dai-so',
                  '07-idean-va-vanh-thuong',
                  '01-idean-giao-tong-va-idean-sinh',
                )}
                className="group rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-4 transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--bg-surface)]/40"
              >
                <span className="text-[11px] font-semibold text-[var(--accent-wood)] uppercase">
                  Đại số 07
                </span>
                <p className="mt-1 font-serif text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-primary)]">
                  Iđêan & Vành
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Điều kiện hấp thụ phép nhân và vành thương R/I
                </p>
              </Link>

              <Link
                to={ROUTES.lesson('hinh-hoc-affine', 'khong-gian-affine', 'khong-gian-affine')}
                className="group rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-4 transition-all hover:border-[var(--accent-primary)] hover:bg-[var(--bg-surface)]/40"
              >
                <span className="text-[11px] font-semibold text-[var(--accent-wood)] uppercase">
                  Hình học 01
                </span>
                <p className="mt-1 font-serif text-sm font-bold text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-primary)]">
                  Không gian Affine
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
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
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#8B302D] uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#8B302D]" />
            <span>Tiến trình cá nhân</span>
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            HÀNH TRÌNH CHINH PHỤC TRI THỨC
          </h2>
          <p className="text-sm text-[var(--text-secondary)] sm:text-base">
            Theo dõi tiến trình cá nhân, ghi nhớ bài học và làm chủ từng nấc thang học thuật.
          </p>
        </div>

        {isAuthenticated ? (
          /* Trạng thái 1: Học viên đã đăng nhập */
          <div className="space-y-6 rounded-3xl border border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-6 sm:p-8">
            <div className="flex flex-col justify-between gap-4 border-b border-[var(--bg-muted)] pb-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--bg-muted)] bg-emerald-50 text-emerald-700">
                  <UserCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                    {learnerName}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Chế độ Học viên · Dữ liệu đã đồng bộ
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/60 px-3 py-1.5 text-xs font-semibold text-[var(--accent-primary)]">
                  {completedCount}/{totalLessonCount} bài học ({progressPercent}%)
                </span>
              </div>
            </div>

            {/* Chỉ số cá nhân */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/40 p-4">
                <div className="flex items-center gap-2 text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase">Đã hoàn thành</span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-[var(--text-primary)]">
                  {completedCount} bài
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  Trên tổng số {totalLessonCount} bài học
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/40 p-4">
                <div className="flex items-center gap-2 text-[#8B302D]">
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase">Yêu thích</span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-[var(--text-primary)]">
                  {bookmarkedCount} bài
                </p>
                <p className="text-xs text-[var(--text-muted)]">Đã lưu vào danh mục theo dõi</p>
              </div>

              <div className="rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/40 p-4">
                <div className="flex items-center gap-2 text-[var(--accent-primary)]">
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  <span className="text-xs font-semibold uppercase">Ghi chú cá nhân</span>
                </div>
                <p className="mt-2 text-2xl font-extrabold text-[var(--text-primary)]">
                  {notesCount} mục
                </p>
                <p className="text-xs text-[var(--text-muted)]">Ghi chú học thuật trong các bài</p>
              </div>
            </div>
          </div>
        ) : (
          /* Trạng thái 2: Người dùng ở Chế độ Khách (chưa đăng nhập) */
          <div className="space-y-4">
            <div className="flex flex-col justify-between gap-5 rounded-3xl border border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-6 shadow-2xs sm:flex-row sm:items-center sm:p-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    Trải nghiệm tự do ở Chế độ Khách
                  </span>
                </div>
                <p className="max-w-xl text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
                  Bạn có thể đọc toàn bộ 40 bài học công khai không giới hạn. Để lưu bài yêu thích,
                  viết ghi chú cá nhân và đồng bộ hóa tiến độ học trên các thiết bị, hãy kích hoạt
                  Chế độ Học viên.
                </p>
              </div>

              <Button
                variant="outline"
                onClick={() => enableLearnerMode()}
                className="shrink-0 border-[var(--bg-muted)] bg-[var(--bg-surface)] font-medium text-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
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
      <div className="flex items-center justify-between rounded-xl border border-[var(--bg-muted)] bg-[var(--bg-surface)]/40 px-4 py-3 text-xs text-[var(--text-secondary)]">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[var(--accent-wood)]" aria-hidden="true" />
          <span>
            Trạng thái kết nối dữ liệu:{' '}
            <strong className="font-medium text-[var(--text-primary)]">
              {isSupabaseConfigured
                ? 'Đã cấu hình Supabase (sẵn sàng cho đồng bộ đám mây)'
                : 'Chế độ khách chỉ đọc (lưu phiên cục bộ an toàn)'}
            </strong>
          </span>
        </span>
        <span className="hidden text-[11px] text-[var(--text-muted)] sm:inline">
          100% Nội dung học thuật khóa SHA-256
        </span>
      </div>
    </FadeIn>
  );
}

export default HomePage;
