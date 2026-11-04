import type { ManifestChapter, ManifestSubject } from '@schemas/index';
import {
  ArrowRight,
  Award,
  Bookmark,
  CheckCircle2,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Circle,
  Clock,
  Layers,
  Target,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Badge, Button, Card } from '@/shared/ui';

export interface ChapterAccordionListProps {
  readonly subject: ManifestSubject;
  readonly chapters: readonly ManifestChapter[];
  readonly hasActiveFilter?: boolean;
}

const LEVEL_LABELS: Record<'basic' | 'intermediate' | 'advanced', string> = {
  basic: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Nâng cao',
};

export function ChapterAccordionList({
  subject,
  chapters,
  hasActiveFilter = false,
}: ChapterAccordionListProps) {
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const bookmarkedLessons = useLearningStore((state) => state.bookmarkedLessons);
  const lastVisited = useLearningStore((state) => state.lastVisitedBySubject[subject.id]);

  // Quản lý trạng thái đóng/mở của từng chương (mặc định mở Chương 1 / chương đang học dở)
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (lastVisited?.lessonId) {
      const foundChapter = chapters.find((ch) =>
        ch.lessons.some((l) => l.id === lastVisited.lessonId),
      );
      if (foundChapter) {
        initial[foundChapter.id] = true;
      }
    }
    // Mặc định mở Chương 1 (và Chương 0 mở đầu nếu có)
    const ch1 = chapters.find((ch) => ch.number === 1);
    if (ch1) {
      initial[ch1.id] = true;
    }
    if (chapters[0]) {
      initial[chapters[0].id] = true;
    }
    return initial;
  });

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

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    for (const chapter of chapters) {
      all[chapter.id] = true;
    }
    setOpenChapters(all);
  };

  const handleCollapseAll = () => {
    setOpenChapters({});
  };

  const isChapterOpen = (chapterId: string) => {
    // Khi đang có bộ lọc tìm kiếm/mức độ, luôn tự động mở để học viên nhìn thấy kết quả
    if (hasActiveFilter) {
      return true;
    }
    return Boolean(openChapters[chapterId]);
  };

  const totalLessonsInView = chapters.reduce((sum, ch) => sum + ch.lessons.length, 0);

  return (
    <div className="space-y-4" aria-label="Lộ trình bài học dạng bản đồ chương">
      {/* Thanh điều khiển nhanh Thu gọn / Mở rộng */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <Layers className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
          <span className="font-semibold text-stone-800">
            {chapters.length} chương · {totalLessonsInView} bài học
          </span>
          <span className="text-stone-400">|</span>
          <span className="text-stone-500">
            {hasActiveFilter
              ? 'Tự động mở các chương khớp kết quả lọc'
              : 'Nhấp tiêu đề chương để mở/thu gọn'}
          </span>
        </div>

        {!hasActiveFilter && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleExpandAll}
              className="h-8 gap-1.5 px-2.5 text-xs text-stone-600 hover:text-stone-900"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Mở tất cả</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCollapseAll}
              className="h-8 gap-1.5 px-2.5 text-xs text-stone-600 hover:text-stone-900"
            >
              <ChevronsDownUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Thu gọn</span>
            </Button>
          </div>
        )}
      </div>

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
        const isOpen = isChapterOpen(chapter.id);
        const percentInChapter =
          chapter.lessons.length > 0
            ? Math.round((completedInChapter / chapter.lessons.length) * 100)
            : 0;

        return (
          <section
            key={chapter.id}
            aria-label={`Chương ${chapter.number}: ${chapter.title}`}
            className="overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs transition-all hover:border-stone-300"
          >
            {/* Header Accordion có thể bấm để đóng / mở */}
            <header className="border-b border-stone-100 bg-stone-50/60 transition-colors hover:bg-stone-100/60">
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                aria-expanded={isOpen}
                className="flex w-full cursor-pointer flex-col justify-between gap-3 p-4.5 text-left sm:flex-row sm:items-center sm:px-6"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    <Badge variant="subject">Chương {chapter.number}</Badge>
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <h2 className="text-base font-bold tracking-tight text-stone-900 sm:text-lg">
                      {chapter.title}
                    </h2>
                    <p className="line-clamp-1 text-xs text-stone-500">{chapter.description}</p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-xs font-semibold text-stone-700">
                      {chapter.lessons.length} bài học
                    </span>
                    <span className="block text-[11px] text-stone-400">
                      {completedInChapter > 0 ? `${percentInChapter}% hoàn thành` : 'Chưa học'}
                    </span>
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

                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-200/60 text-stone-600 transition-transform duration-200">
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        isOpen && 'rotate-180',
                      )}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </button>

              {/* Mục tiêu chương (chỉ hiển thị khi accordion mở) */}
              {isOpen && chapter.objectives.length > 0 && (
                <div className="border-t border-stone-100 bg-white/70 px-5 py-3 sm:px-6">
                  <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-3">
                    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-700">
                      <Target className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
                      <span>Mục tiêu chương:</span>
                    </p>
                    <ul className="list-disc space-y-1 pl-4 text-xs text-stone-600">
                      {chapter.objectives.map((objective) => (
                        <li key={objective}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </header>

            {/* Danh sách bài học của chương */}
            {isOpen && (
              <>
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
                            className="group hover:bg-subject-50/35 flex flex-col justify-between gap-4 p-4.5 transition-colors sm:flex-row sm:items-center sm:px-6"
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
                                    <Clock
                                      className="h-3.5 w-3.5 text-stone-400"
                                      aria-hidden="true"
                                    />
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
                    Chương trình học tập đang được số hóa và chuẩn bị phát hành. Học viên có thể tải
                    và xem trước nội dung trong tab Tài liệu &amp; Văn bản bên trên.
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}
