import { PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { getLessonById, getSubjects } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { SearchBar } from '@/features/search';
import { SubjectCard } from '@/features/subject';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Button, Card, DongSonConcentricMotif, HeritageDivider } from '@/shared/ui';

export function HomePage() {
  const subjects = getSubjects();
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const lastLocation = lastVisitedGlobal ? getLessonById(lastVisitedGlobal.lessonId) : undefined;

  return (
    <FadeIn className="mx-auto max-w-5xl space-y-10 py-2 sm:py-4">
      {/* Hero Section: Tiền sảnh tri thức văn hóa Việt Nam */}
      <section className="border-vn-border/70 from-vn-surface/40 via-vn-surface/20 relative overflow-hidden rounded-3xl border bg-gradient-to-b to-transparent p-6 shadow-xs sm:p-10">
        {/* Đồ họa SVG vòng tròn đồng tâm Đông Sơn mờ nhẹ */}
        <DongSonConcentricMotif className="text-vn-accent pointer-events-none absolute -top-24 -right-20 h-[440px] w-[440px] opacity-[0.14] sm:-top-16 sm:-right-16 sm:h-[520px] sm:w-[520px]" />

        <div className="relative z-10 space-y-5">
          <div className="border-vn-accent/40 bg-vn-surface/80 text-vn-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wider uppercase">
            <span className="bg-vn-secondary h-1.5 w-1.5 rounded-full" />
            <span>Không gian học tập đại học đương đại</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-vn-text text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Không gian học tập Toán học đại học
            </h1>
            <p className="text-vn-muted max-w-2xl text-base leading-relaxed sm:text-lg">
              Nền tảng tổng hợp lý thuyết, định nghĩa, định lý, chứng minh và bài tập có hướng dẫn
              giải cho các học phần chuyên ngành Sư phạm Toán học, bắt đầu với{' '}
              <strong className="text-vn-text font-semibold">Cấu trúc đại số</strong> và{' '}
              <strong className="text-vn-text font-semibold">Hình học Affine</strong>.
            </p>
          </div>

          <div className="pt-2">
            <SearchBar className="max-w-2xl" />
          </div>
        </div>
      </section>

      {lastLocation && (
        <section aria-label="Tiếp tục bài đang đọc">
          <Card className="border-l-vn-secondary border-vn-border/80 bg-vn-surface/45 flex flex-col justify-between gap-4 rounded-2xl border-l-4 p-5 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="text-vn-primary flex items-center gap-2 text-xs font-semibold uppercase">
                <PlayCircle className="text-vn-secondary h-3.5 w-3.5" aria-hidden="true" />
                <span>Tiếp tục bài học gần nhất · {lastLocation.subject.title}</span>
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
        </section>
      )}

      <HeritageDivider className="opacity-80" />

      {/* Danh sách học phần hiện có (Các gian tri thức) */}
      <section aria-label="Danh sách các môn học" className="space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-vn-text text-2xl font-bold tracking-tight">Các học phần hiện có</h2>
            <p className="text-vn-muted text-sm">
              Chọn một môn học để đi vào không gian lý thuyết, hệ thống chương và bài tập riêng.
            </p>
          </div>
          <Link
            to={ROUTES.subjects}
            className="text-vn-primary decoration-vn-border hover:text-vn-text text-xs font-semibold underline underline-offset-4 transition-colors"
          >
            Xem tất cả môn học ({subjects.length})
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>
      </section>

      {/* Trạng thái kết nối dữ liệu */}
      <div className="border-vn-border/70 bg-vn-surface/40 text-vn-muted flex items-center justify-between rounded-xl border px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-2">
          <Sparkles className="text-vn-accent h-3.5 w-3.5" aria-hidden="true" />
          <span>
            Trạng thái kết nối dữ liệu:{' '}
            <strong className="text-vn-text font-medium">
              {isSupabaseConfigured
                ? 'Đã cấu hình Supabase (sẵn sàng cho đồng bộ tiến độ)'
                : 'Chế độ khách chỉ đọc (chưa cấu hình Supabase)'}
            </strong>
          </span>
        </span>
      </div>
    </FadeIn>
  );
}

export default HomePage;
