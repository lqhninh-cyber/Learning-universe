import type { ManifestChapter, ManifestSubject } from '@schemas/index';
import { ArrowRight, Award, Bookmark, CheckCircle2, Circle, Clock, Target } from 'lucide-react';
import { Link } from 'react-router';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { Badge, Card } from '@/shared/ui';

export interface ChapterAccordionListProps {
  readonly subject: ManifestSubject;
  readonly chapters: readonly ManifestChapter[];
}

const LEVEL_LABELS: Record<'basic' | 'intermediate' | 'advanced', string> = {
  basic: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Nâng cao',
};

export function ChapterAccordionList({ subject, chapters }: ChapterAccordionListProps) {
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const bookmarkedLessons = useLearningStore((state) => state.bookmarkedLessons);

  if (chapters.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-base font-medium text-stone-800">
          Không tìm thấy bài học nào phù hợp với điều kiện lọc hiện tại.
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Hãy thử xóa bộ lọc hoặc tìm bằng một từ khóa khác.
        </p>
      </Card>
    );
  }

  const isAllChaptersCompleted =
    chapters.length > 0 &&
    chapters.every(
      (chapter) =>
        chapter.lessons.length > 0 &&
        chapter.lessons.every((lesson) => Boolean(completedLessons[lesson.id])),
    );

  return (
    <div className="space-y-6" aria-label="Danh sách chương và bài học">
      {isAllChaptersCompleted && (
        <Card className="border-emerald-200 bg-emerald-50/70 p-4 text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Award className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="approved">
                  <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                  <span>Đã hoàn thành toàn bộ khóa học</span>
                </Badge>
                <span className="text-xs font-semibold text-emerald-800">
                  Chúc mừng bạn đã hoàn thành trọn vẹn tất cả {chapters.length} chương!
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-700">
                Toàn bộ các bài học lý thuyết và đề thi mẫu đã được tích xanh và đồng bộ lên tài
                khoản cá nhân.
              </p>
            </div>
          </div>
        </Card>
      )}

      {chapters.map((chapter) => {
        const completedInChapter = chapter.lessons.filter((lesson) =>
          Boolean(completedLessons[lesson.id]),
        ).length;

        return (
          <section
            key={chapter.id}
            aria-label={`Chương ${chapter.number}: ${chapter.title}`}
            className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs"
          >
            <header className="border-b border-stone-100 bg-stone-50/70 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="subject">Chương {chapter.number}</Badge>
                  <span className="text-xs text-stone-500">{chapter.lessons.length} bài học</span>
                </div>
                <Badge
                  variant={
                    completedInChapter === chapter.lessons.length && chapter.lessons.length > 0
                      ? 'approved'
                      : 'neutral'
                  }
                >
                  Hoàn thành {completedInChapter}/{chapter.lessons.length}
                </Badge>
              </div>

              <h2 className="mt-2 text-xl font-bold tracking-tight text-stone-900">
                Chương {chapter.number}: {chapter.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{chapter.description}</p>

              {chapter.objectives.length > 0 && (
                <div className="mt-4 rounded-xl border border-stone-200/70 bg-white p-3.5">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                    <Target className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
                    <span>Mục tiêu chương:</span>
                  </p>
                  <ul className="list-disc space-y-1 pl-4 text-xs text-stone-600">
                    {chapter.objectives.map((objective) => (
                      <li key={objective}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
            </header>

            {chapter.lessons.length > 0 ? (
              <ul className="divide-y divide-stone-100">
                {chapter.lessons.map((lesson) => {
                  const isCompleted = Boolean(completedLessons[lesson.id]);
                  const isBookmarked = Boolean(bookmarkedLessons[lesson.id]);
                  const lessonHref = ROUTES.lesson(subject.slug, chapter.slug, lesson.slug);

                  return (
                    <li key={lesson.id}>
                      <Link
                        to={lessonHref}
                        className="group hover:bg-subject-50/35 flex flex-col justify-between gap-4 p-5 transition-colors sm:flex-row sm:items-center sm:px-6"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className="mt-0.5 shrink-0">
                            {isCompleted ? (
                              <CheckCircle2
                                className="h-5 w-5 text-emerald-600"
                                aria-label="Đã hoàn thành"
                              />
                            ) : (
                              <Circle
                                className="group-hover:text-subject-500 h-5 w-5 text-stone-300 transition-colors"
                                aria-hidden="true"
                              />
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-subject-700 font-mono text-xs font-semibold">
                                Bài {chapter.number}.{lesson.number}
                              </span>
                              <h3 className="group-hover:text-subject-700 text-base font-semibold text-stone-900 transition-colors">
                                {lesson.title}
                              </h3>
                              <Badge variant="neutral">{LEVEL_LABELS[lesson.level]}</Badge>
                              {isBookmarked && (
                                <Bookmark
                                  className="h-3.5 w-3.5 fill-amber-400 text-amber-500"
                                  aria-label="Đã lưu yêu thích"
                                />
                              )}
                            </div>

                            <p className="text-sm leading-relaxed text-stone-600">
                              {lesson.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-500">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                                <span>{lesson.estimatedMinutes} phút</span>
                              </span>
                              {lesson.tags.map((tag) => (
                                <span key={tag} className="text-stone-400">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="text-subject-700 flex items-center gap-1.5 self-end text-xs font-semibold sm:self-center">
                          <span>Đọc bài</span>
                          <ArrowRight
                            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-5 text-center text-xs text-stone-500 sm:p-6">
                Chương trình học tập đang được số hóa và chuẩn bị phát hành. Học viên có thể tải và
                xem trước nội dung trong phần Tài liệu học tập &amp; Đề thi mẫu bên trên.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
