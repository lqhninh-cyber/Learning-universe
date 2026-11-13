import type { ManifestChapter, ManifestSubject } from '@schemas/index';
import {
  ArrowRight,
  Award,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  Circle,
  Clock,
  Layers,
  Target,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Badge, Button, Card } from '@/shared/ui';

/** Yêu cầu mở & cuộn tới nhóm chương (phát ra từ sơ đồ cấu trúc môn học trên Hero). */
export interface ChapterFocusRequest {
  readonly chapterIds: readonly string[];
  readonly nonce: number;
}

export interface ChapterAccordionListProps {
  readonly subject: ManifestSubject;
  readonly chapters: readonly ManifestChapter[];
  readonly hasActiveFilter?: boolean;
  readonly focusRequest?: ChapterFocusRequest | null;
}

/** Mã neo HTML ổn định cho từng chương, dùng để cuộn tới chương. */
function chapterAnchorId(chapterId: string): string {
  return `chuong-${chapterId.replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
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
  focusRequest = null,
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

  // Mở các chương được yêu cầu từ sơ đồ Hero (điều chỉnh trạng thái ngay trong lúc render)
  const [handledFocusNonce, setHandledFocusNonce] = useState(0);
  if (focusRequest && focusRequest.nonce !== handledFocusNonce) {
    setHandledFocusNonce(focusRequest.nonce);
    setOpenChapters((prev) => {
      const next = { ...prev };
      for (const chapterId of focusRequest.chapterIds) {
        next[chapterId] = true;
      }
      return next;
    });
  }

  // Cuộn mượt tới chương đầu tiên của nhóm được chọn
  useEffect(() => {
    const firstChapterId = focusRequest?.chapterIds[0];
    if (!firstChapterId) return;
    const target = document.getElementById(chapterAnchorId(firstChapterId));
    if (target && typeof target.scrollIntoView === 'function') {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [focusRequest]);

  const focusedChapterIds = focusRequest?.chapterIds ?? [];

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

      {/* Khung Vertical Learning Timeline */}
      <div className="relative space-y-6 pt-2">
        {/* Trục kẻ dọc mảnh chạy dọc mép trái nối liền từ Chương đầu đến Chương cuối */}
        <div
          className="absolute top-6 bottom-6 left-3.5 w-[1.5px] bg-[#DFE6E1] sm:left-4 dark:bg-[#1E3B2D]"
          aria-hidden="true"
        />

        {chapters.map((chapter) => {
          const completedInChapter = chapter.lessons.filter((lesson) =>
            Boolean(completedLessons[lesson.id]),
          ).length;
          const isOpen = isChapterOpen(chapter.id);
          const percentInChapter =
            chapter.lessons.length > 0
              ? Math.round((completedInChapter / chapter.lessons.length) * 100)
              : 0;

          const isFocused = focusedChapterIds.includes(chapter.id);

          return (
            <div
              key={chapter.id}
              id={chapterAnchorId(chapter.id)}
              className="relative flex scroll-mt-28 items-start gap-3.5 sm:gap-5"
            >
              {/* Điểm neo đầu mỗi chương: vòng tròn đánh số theo màu bản sắc môn học */}
              <div className="relative z-10 mt-4 flex h-7 w-7 shrink-0 items-center justify-center sm:h-8 sm:w-8">
                {percentInChapter === 100 ? (
                  <div
                    title="Đã hoàn thành 100%"
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--subject-accent,#1A7F5A)] text-white shadow-xs ring-4 ring-[#EAF0F1] sm:h-8 sm:w-8 dark:ring-[#121517]"
                  >
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
                  </div>
                ) : completedInChapter > 0 ? (
                  <div
                    title="Đang học dở dang"
                    className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--subject-accent,#C5A262)] bg-[var(--subject-surface,#FFFFFF)] font-mono text-[11px] font-bold text-[var(--subject-accent-ink,#8A6A2F)] shadow-xs ring-4 ring-[#EAF0F1] sm:h-8 sm:w-8 dark:bg-[#12241C] dark:text-[var(--subject-accent,#E5C378)] dark:ring-[#121517]"
                  >
                    {chapter.number}
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 animate-pulse rounded-full bg-[var(--subject-accent,#C5A262)]" />
                  </div>
                ) : (
                  <div
                    title="Chưa học"
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[var(--subject-accent-border,#DFE6E1)] bg-[#F6F8F5] font-mono text-[11px] font-semibold text-[var(--subject-accent-ink,#55676B)] shadow-2xs ring-4 ring-[#EAF0F1] sm:h-8 sm:w-8 dark:bg-[#0E1A15] dark:text-[var(--subject-accent,#A7B5AC)] dark:ring-[#121517]"
                  >
                    {chapter.number}
                  </div>
                )}
              </div>

              {/* Thẻ chương */}
              <section
                aria-label={
                  /^(Chương|Chuyên đề|Khối)/i.test(chapter.title)
                    ? chapter.title
                    : `Chương ${chapter.number}: ${chapter.title}`
                }
                data-focused={isFocused ? 'true' : undefined}
                className={cn(
                  'min-w-0 flex-1 overflow-hidden rounded-2xl border bg-white transition-all duration-200 dark:bg-[#16191D]',
                  isOpen
                    ? 'border-l-4 border-t-stone-200 border-r-stone-200 border-b-stone-200 border-l-[var(--subject-accent,#739B88)] shadow-md dark:border-t-[#2A323A] dark:border-r-[#2A323A] dark:border-b-[#2A323A]'
                    : 'border-stone-200/90 shadow-2xs hover:border-[var(--subject-accent-border,#D6D3D1)] dark:border-[#2A323A] dark:hover:border-[#3A4550]',
                  isFocused && 'ring-2 ring-[var(--subject-accent-border,#9BB8AA)] ring-offset-2',
                )}
              >
                {/* Header Accordion có thể bấm để đóng / mở */}
                <header className="border-b border-stone-100 bg-stone-50/60 transition-colors hover:bg-stone-100/60 dark:border-[#2A323A] dark:bg-[#1A1F26]/60 dark:hover:bg-[#202630]/60">
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter.id)}
                    aria-expanded={isOpen}
                    className="flex w-full cursor-pointer flex-col justify-between gap-3 p-4.5 text-left sm:flex-row sm:items-center sm:px-6"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 shrink-0">
                        <span className="inline-flex items-center rounded-full border border-[var(--subject-accent-border,#CFDADB)] bg-[var(--subject-accent-soft,#EEF3F2)] px-2.5 py-0.5 font-mono text-xs font-semibold whitespace-nowrap text-[var(--subject-accent-ink,#3F6570)] dark:text-[var(--subject-accent,#8EC5AA)]">
                          {/^Khối/i.test(chapter.title) ? 'Thực hành' : `Chương ${chapter.number}`}
                        </span>
                      </div>
                      <div className="min-w-0 space-y-1">
                        <h2 className="text-xl font-bold tracking-tight text-stone-900 dark:text-[#F8FAFC]">
                          {chapter.title.replace(/^(?:Chương|Chuyên đề)\s+\d+\s*:\s*/i, '')}
                        </h2>
                        <p className="line-clamp-1 text-sm text-stone-500 dark:text-stone-400">
                          {chapter.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-3.5 self-end sm:self-center">
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-semibold text-stone-700 dark:text-stone-300">
                            Hoàn thành {completedInChapter}/{chapter.lessons.length}
                          </span>
                          <span className="text-stone-500 dark:text-stone-400">bài</span>
                          <span className="font-mono text-[11px] text-stone-400">
                            ({percentInChapter}%)
                          </span>
                        </div>

                        {/* Thanh mini progress bar */}
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                          <div
                            className={cn(
                              'h-full rounded-full bg-[var(--subject-accent,#C5A262)] transition-all duration-300',
                              percentInChapter === 0 && 'bg-transparent',
                            )}
                            style={{ width: `${percentInChapter}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-200/60 text-stone-600 transition-transform duration-200 dark:bg-zinc-800 dark:text-stone-300">
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
                    <div className="border-t border-stone-100 bg-white/70 px-5 py-3 sm:px-6 dark:border-[#2A323A] dark:bg-[#16191D]/70">
                      <div className="rounded-xl border border-stone-200/70 bg-stone-50/50 p-3 dark:border-[#2A323A] dark:bg-[#1A1F26]/50">
                        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300">
                          <Target className="text-subject-600 h-3.5 w-3.5" aria-hidden="true" />
                          <span>Mục tiêu chương:</span>
                        </p>
                        <ul className="list-disc space-y-1 pl-4 text-xs text-stone-600 dark:text-stone-400">
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
                      <ul className="grid grid-cols-1 gap-4 p-4 sm:p-6 lg:grid-cols-2">
                        {chapter.lessons.map((lesson) => {
                          const isCompleted = Boolean(completedLessons[lesson.id]);
                          const isBookmarked = Boolean(bookmarkedLessons[lesson.id]);
                          const lessonHref = ROUTES.lesson(subject.slug, chapter.slug, lesson.slug);

                          return (
                            <li key={lesson.id} className="h-full">
                              <Link
                                to={lessonHref}
                                className="group flex h-full flex-col justify-between gap-4 rounded-xl border border-stone-200/85 bg-stone-50/45 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--subject-accent-border,#9BB8AA)] hover:bg-[var(--subject-surface,#F4F8F6)] hover:shadow-sm dark:border-[#2A323A] dark:bg-[#1A1F26]/55 dark:hover:border-[var(--subject-accent-border,#3A4550)] dark:hover:bg-[#202630]/75"
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className="mt-1 shrink-0">
                                    {isCompleted ? (
                                      <CheckCircle2
                                        className="h-5 w-5 text-emerald-600"
                                        aria-label="Đã hoàn thành"
                                      />
                                    ) : (
                                      <Circle
                                        className="h-5 w-5 text-stone-300 transition-colors group-hover:text-[var(--subject-accent,#739B88)] dark:text-stone-600"
                                        aria-hidden="true"
                                      />
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1 space-y-2">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <span className="font-mono text-xs font-semibold text-[var(--subject-accent-ink,#3F6570)] dark:text-[var(--subject-accent,#8EC5AA)]">
                                        {/^Thực hành/i.test(lesson.title)
                                          ? `Thực hành ${lesson.number}`
                                          : `Bài ${chapter.number}.${lesson.number}`}
                                      </span>
                                      <div className="flex items-center gap-1.5">
                                        <Badge variant="neutral">
                                          {LEVEL_LABELS[lesson.level]}
                                        </Badge>
                                        {isBookmarked && (
                                          <Bookmark
                                            className="h-3.5 w-3.5 fill-amber-400 text-amber-500"
                                            aria-label="Đã lưu yêu thích"
                                          />
                                        )}
                                      </div>
                                    </div>

                                    <h3 className="text-[17.5px] leading-snug font-bold text-stone-900 transition-colors group-hover:text-[var(--subject-accent-ink,#3F6570)] dark:text-[#F8FAFC] dark:group-hover:text-[var(--subject-accent,#8EC5AA)]">
                                      {lesson.title.replace(
                                        /^(?:Bài\s+\d+(?:\.\d+)?|Thực hành\s+\d+|Chuyên đề\s+\d+(?:\.\d+)?)\s*:\s*/i,
                                        '',
                                      )}
                                    </h3>

                                    <p className="line-clamp-2 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
                                      {lesson.description}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200/65 pt-3 dark:border-[#2A323A]">
                                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                                    <span className="mr-1 inline-flex items-center gap-1 font-medium">
                                      <Clock
                                        className="h-3.5 w-3.5 text-stone-400"
                                        aria-hidden="true"
                                      />
                                      <span>{lesson.estimatedMinutes} phút</span>
                                    </span>
                                    {lesson.tags.slice(0, 3).map((tag) => (
                                      <span
                                        key={tag}
                                        className="rounded-md bg-stone-200/60 px-2 py-0.5 text-[11px] font-medium text-stone-600 dark:bg-[#242C36] dark:text-stone-300"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--subject-accent-ink,#3F6570)] dark:text-[var(--subject-accent,#8EC5AA)]">
                                    <span>Đọc bài</span>
                                    <ArrowRight
                                      className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                                      aria-hidden="true"
                                    />
                                  </div>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="p-5 text-center text-xs text-stone-500 sm:p-6 dark:text-stone-400">
                        Chương trình học tập đang được số hóa và chuẩn bị phát hành. Học viên có thể
                        tải và xem trước nội dung trong tab Tài liệu &amp; Văn bản bên trên.
                      </div>
                    )}
                  </>
                )}
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
