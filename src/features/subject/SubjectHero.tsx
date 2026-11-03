import type { ManifestSubject } from '@schemas/index';
import {
  BookOpen,
  Clock,
  Compass,
  ExternalLink,
  Layers,
  PlayCircle,
  Sigma,
  Sparkles,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import { getLessonById, getSubjectStats } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { Badge, Breadcrumb, Button, Card, ProgressRing } from '@/shared/ui';

export interface SubjectHeroProps {
  readonly subject: ManifestSubject;
}

export function SubjectHero({ subject }: SubjectHeroProps) {
  const stats = getSubjectStats(subject);
  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisited = useLearningStore((state) => state.lastVisitedBySubject[subject.id]);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);

  const completedCount = subject.chapters.reduce(
    (sum, chapter) =>
      sum + chapter.lessons.filter((lesson) => Boolean(completedLessons[lesson.id])).length,
    0,
  );
  const progressPercent =
    stats.lessonCount > 0 ? Math.round((completedCount / stats.lessonCount) * 100) : 0;

  const resumeLocation = lastVisited ? getLessonById(lastVisited.lessonId) : undefined;
  const ctaLocation = resumeLocation ?? stats.firstLesson;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Trang chủ', href: ROUTES.home },
          { label: 'Môn học', href: ROUTES.subjects },
          { label: subject.title },
        ]}
      />

      <div className="border-subject-200/80 grid gap-6 rounded-3xl border bg-white p-6 shadow-2xs sm:p-8 lg:grid-cols-12 lg:items-center">
        <div className="space-y-4 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="subject">
              {subject.theme.icon === 'compass' ? (
                <Compass className="h-3.5 w-3.5" aria-hidden="true" />
              ) : subject.theme.icon === 'function' ? (
                <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Sigma className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>Học phần chuyên ngành · {subject.shortTitle}</span>
            </Badge>
            <Badge variant="neutral">Mã học phần: {subject.shortTitle}</Badge>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            {subject.title}
          </h1>

          <p className="max-w-2xl text-base leading-relaxed text-stone-600">
            {subject.description}
          </p>

          <div className="flex flex-wrap items-center gap-5 pt-1 text-sm text-stone-600">
            <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
              <Layers className="text-subject-600 h-4 w-4" aria-hidden="true" />
              <span>{stats.chapterCount} chương</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
              <BookOpen className="text-subject-600 h-4 w-4" aria-hidden="true" />
              <span>{stats.lessonCount} bài học</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium text-stone-800">
              <Clock className="text-subject-600 h-4 w-4" aria-hidden="true" />
              <span>Tổng thời lượng ~{stats.totalMinutes} phút</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {ctaLocation && (
              <Button asChild variant="subject" size="md">
                <Link
                  to={ROUTES.lesson(
                    ctaLocation.subject.slug,
                    ctaLocation.chapter.slug,
                    ctaLocation.lesson.slug,
                  )}
                >
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {resumeLocation ? 'Tiếp tục học' : 'Bắt đầu học'}: Bài{' '}
                    {ctaLocation.chapter.number}.{ctaLocation.lesson.number} —{' '}
                    {ctaLocation.lesson.title}
                  </span>
                </Link>
              </Button>
            )}

            {subject.slug === 'hinh-hoc-affine' && (
              <Button
                asChild
                variant="outline"
                size="md"
                className="border-subject-300 text-subject-700 hover:bg-subject-50 gap-1.5"
              >
                <a
                  href="/interactive/affine-geometry.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Sparkles className="text-subject-600 h-4 w-4" aria-hidden="true" />
                  <span>Mở phòng Lab &amp; Ôn tập tương tác</span>
                  <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <Card className="border-subject-200/70 bg-subject-50/40 p-5">
            {isAuthenticated ? (
              <div className="space-y-3" aria-label="Tiến độ học tập môn học">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-subject-800 text-xs font-semibold tracking-wide uppercase">
                      Tiến độ học tập
                    </p>
                    <p className="mt-1 text-2xl font-bold text-stone-900">{progressPercent}%</p>
                  </div>
                  <ProgressRing value={progressPercent} size={52} strokeWidth={4.5} />
                </div>
                <p className="text-xs leading-relaxed text-stone-600">
                  Bạn đã hoàn thành{' '}
                  <strong className="font-semibold text-stone-900">
                    {completedCount}/{stats.lessonCount}
                  </strong>{' '}
                  bài học trong môn {subject.title}.
                </p>
              </div>
            ) : (
              <div className="space-y-3" aria-label="Chế độ khách">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-stone-700 uppercase">
                      Theo dõi tiến độ
                    </p>
                    <p className="mt-1 text-sm font-semibold text-stone-900">
                      Đang xem ở chế độ Khách
                    </p>
                  </div>
                  <ProgressRing value={0} size={44} strokeWidth={4} />
                </div>
                <p className="text-xs leading-relaxed text-stone-600">
                  Bạn có thể đọc toàn bộ nội dung công khai. Kích hoạt chế độ Học viên để lưu tiến
                  độ, ghi chú và bài yêu thích.
                </p>
                <Button
                  variant="subjectOutline"
                  size="sm"
                  onClick={() => enableLearnerMode()}
                  className="w-full"
                >
                  <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Bật theo dõi tiến độ học tập</span>
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
