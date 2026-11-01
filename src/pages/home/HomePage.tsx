import { PlayCircle, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { getLessonById, getSubjects } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { SearchBar } from '@/features/search';
import { SubjectCard } from '@/features/subject';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { ROUTES } from '@/shared/config/routes';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Button, Card } from '@/shared/ui';

export function HomePage() {
  const subjects = getSubjects();
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const lastLocation = lastVisitedGlobal ? getLessonById(lastVisitedGlobal.lessonId) : undefined;

  return (
    <FadeIn className="mx-auto max-w-5xl space-y-12 py-4">
      <section className="space-y-6">
        <div className="space-y-4">
          <Badge variant="neutral">Chương trình Sư phạm Toán học</Badge>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-5xl">
            Không gian học tập Toán học đại học
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Nền tảng tổng hợp lý thuyết, định nghĩa, định lý, chứng minh và bài tập có hướng dẫn
            giải cho các học phần chuyên ngành Sư phạm Toán học, bắt đầu với{' '}
            <strong className="font-semibold text-stone-900">Cấu trúc đại số</strong> và{' '}
            <strong className="font-semibold text-stone-900">Hình học Affine</strong>.
          </p>
        </div>

        <SearchBar className="max-w-2xl" />
      </section>

      {lastLocation && (
        <section aria-label="Tiếp tục bài đang đọc">
          <Card className="flex flex-col justify-between gap-4 border-stone-200/90 bg-white p-5 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase">
                <PlayCircle className="h-3.5 w-3.5 text-stone-700" aria-hidden="true" />
                <span>Tiếp tục bài học gần nhất · {lastLocation.subject.title}</span>
              </div>
              <p className="text-base font-semibold text-stone-900">
                Bài {lastLocation.chapter.number}.{lastLocation.lesson.number}:{' '}
                {lastLocation.lesson.title}
              </p>
            </div>
            <Button asChild variant="primary" size="sm">
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

      <section aria-label="Danh sách các môn học" className="space-y-5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">
              Các học phần hiện có
            </h2>
            <p className="text-sm text-stone-600">
              Chọn một môn học để đi vào không gian lý thuyết, hệ thống chương và bài tập riêng.
            </p>
          </div>
          <Link
            to={ROUTES.subjects}
            className="text-xs font-semibold text-stone-700 underline decoration-stone-300 underline-offset-4 hover:text-stone-900"
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

      <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-100/70 px-4 py-3 text-xs text-stone-600">
        <span className="inline-flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
          <span>
            Trạng thái kết nối dữ liệu:{' '}
            <strong className="font-medium text-stone-900">
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
