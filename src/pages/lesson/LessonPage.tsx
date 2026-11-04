import { ArrowLeft, Clock, Layers, ListTree, PanelLeft, PanelLeftOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import {
  type CompiledLessonModule,
  getLessonById,
  getLessonBySlug,
  LessonMdxView,
  loadLessonModule,
} from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import {
  DevEditorialBar,
  LessonActionBar,
  LessonNotesPanel,
  LessonPrevNextNav,
  LessonSidebar,
  LessonToc,
  ReadingControlsToolbar,
  type ReadingFontSize,
  SourcePanel,
} from '@/features/lesson-reader';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Breadcrumb, Button, Card, Drawer, Skeleton } from '@/shared/ui';

const LEVEL_LABELS: Record<'basic' | 'intermediate' | 'advanced', string> = {
  basic: 'Cơ bản',
  intermediate: 'Trung bình',
  advanced: 'Nâng cao',
};

export function LessonPage() {
  const { subjectSlug, chapterSlug, lessonSlug } = useParams<{
    subjectSlug: string;
    chapterSlug: string;
    lessonSlug: string;
  }>();

  const location =
    subjectSlug && chapterSlug && lessonSlug
      ? getLessonBySlug(subjectSlug, chapterSlug, lessonSlug)
      : undefined;

  const lessonId = location?.lesson.id;
  const subjectId = location?.subject.id;

  const recordLessonVisit = useLearningStore((state) => state.recordLessonVisit);
  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const openNoteLessonId = useLearningStore((state) => state.openNoteLessonId);
  const setOpenNoteLessonId = useLearningStore((state) => state.setOpenNoteLessonId);

  const [loadedMap, setLoadedMap] = useState<Readonly<Record<string, CompiledLessonModule>>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSidebarDrawerOpen, setIsSidebarDrawerOpen] = useState(false);
  const [isTocDrawerOpen, setIsTocDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('lu_sidebar_collapsed') === 'true';
      } catch {
        return false;
      }
    }
    return false;
  });

  const [fontSize, setFontSize] = useState<ReadingFontSize>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_font_size');
        if (saved === 'sm' || saved === 'base' || saved === 'lg') {
          return saved;
        }
      } catch {
        // Ignore storage errors
      }
    }
    return 'base';
  });

  const [isFocusMode, setIsFocusMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('lu_focus_mode') === 'true';
      } catch {
        // Ignore storage errors
      }
    }
    return false;
  });

  const handleFontSizeChange = (size: ReadingFontSize) => {
    setFontSize(size);
    try {
      localStorage.setItem('lu_reading_font_size', size);
    } catch {
      // Ignore storage errors
    }
  };

  const handleToggleFocusMode = () => {
    setIsFocusMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lu_focus_mode', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  // Hỗ trợ phím Esc để thoát nhanh Chế độ đọc tập trung
  useEffect(() => {
    if (!isFocusMode) {
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFocusMode(false);
        try {
          localStorage.setItem('lu_focus_mode', 'false');
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('lu_sidebar_collapsed', String(next));
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  };

  const isNotesOpen = Boolean(lessonId && openNoteLessonId === lessonId);
  const handleToggleNotes = () => {
    if (!lessonId) {
      return;
    }
    setOpenNoteLessonId(isNotesOpen ? null : lessonId);
  };

  const compiled = lessonId ? loadedMap[lessonId] : undefined;

  useEffect(() => {
    if (subjectId && lessonId) {
      recordLessonVisit(subjectId, lessonId);
    }
  }, [subjectId, lessonId, recordLessonVisit]);

  useEffect(() => {
    if (!lessonId || loadedMap[lessonId]) {
      return;
    }

    let cancelled = false;
    loadLessonModule(lessonId)
      .then((mod) => {
        if (!cancelled) {
          setLoadedMap((prev) => ({ ...prev, [lessonId]: mod }));
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Không tải được nội dung bài học');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lessonId, loadedMap]);

  if (!location) {
    return (
      <FadeIn className="mx-auto max-w-xl py-12 text-center">
        <Card className="space-y-4 p-8">
          <h1 className="text-2xl font-bold text-stone-900">Không tìm thấy bài học bạn yêu cầu</h1>
          <p className="text-sm text-stone-600">
            Bài học không tồn tại hoặc đường dẫn đã thay đổi.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Button asChild variant="primary" size="sm">
              <Link to={subjectSlug ? ROUTES.subjectOverview(subjectSlug) : ROUTES.home}>
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Quay lại môn học</span>
              </Link>
            </Button>
          </div>
        </Card>
      </FadeIn>
    );
  }

  const { subject, chapter, lesson } = location;

  return (
    <FadeIn className="mx-auto w-full max-w-[1600px] space-y-6 px-4 pb-16 sm:px-6 lg:px-8">
      {import.meta.env.DEV && (
        <DevEditorialBar lesson={lesson} lessonMeta={compiled?.lessonMeta ?? null} />
      )}

      <div className="flex flex-col justify-between gap-4 border-b border-[var(--bg-muted)] pb-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          {!isFocusMode && isSidebarCollapsed && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleSidebarCollapse}
              className="hidden items-center gap-1.5 border-stone-300 bg-stone-50/90 text-xs text-stone-700 shadow-2xs transition-colors hover:text-stone-900 lg:inline-flex"
              title="Mở lại danh sách bài học (Thanh bên)"
              aria-label="Mở lại danh sách bài học"
            >
              <PanelLeftOpen className="text-subject-700 h-4 w-4" aria-hidden="true" />
              <span>Hiện danh mục bài</span>
            </Button>
          )}

          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: ROUTES.home },
              { label: subject.title, href: ROUTES.subjectOverview(subject.slug) },
              {
                label: `Chương ${chapter.number}: ${chapter.title}`,
                href: ROUTES.subjectOverview(subject.slug),
              },
              { label: `Bài ${chapter.number}.${lesson.number}: ${lesson.title}` },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Thanh công cụ đọc nhanh (Reading Controls Toolbar) */}
          <ReadingControlsToolbar
            fontSize={fontSize}
            onFontSizeChange={handleFontSizeChange}
            isFocusMode={isFocusMode}
            onToggleFocusMode={handleToggleFocusMode}
          />

          {/* Nút mở danh sách bài học trên mobile & tablet (< lg) */}
          {!isFocusMode && (
            <div className="lg:hidden">
              <Drawer
                open={isSidebarDrawerOpen}
                onOpenChange={setIsSidebarDrawerOpen}
                side="left"
                title={`Chương & Bài học — ${subject.title}`}
                trigger={
                  <Button variant="outline" size="sm">
                    <PanelLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Danh sách bài học</span>
                  </Button>
                }
              >
                <LessonSidebar
                  subject={subject}
                  activeLessonId={lesson.id}
                  onSelectLesson={() => setIsSidebarDrawerOpen(false)}
                />
              </Drawer>
            </div>
          )}

          {/* Nút mở mục lục bài học trên mobile, tablet & laptop vừa (< xl) */}
          {!isFocusMode && (
            <div className="xl:hidden">
              <Drawer
                open={isTocDrawerOpen}
                onOpenChange={setIsTocDrawerOpen}
                side="right"
                title="Mục lục & Định lý trong bài"
                trigger={
                  <Button variant="outline" size="sm">
                    <ListTree className="h-4 w-4" aria-hidden="true" />
                    <span>Mục lục bài</span>
                  </Button>
                }
              >
                <LessonToc
                  lessonMeta={compiled?.lessonMeta ?? null}
                  onSelectAnchor={() => setIsTocDrawerOpen(false)}
                />
              </Drawer>
            </div>
          )}
        </div>
      </div>

      {/* Bố cục 3 cột linh hoạt: Sidebar (280px) | Main Content (max 920px - 1000px) | TOC (230px) */}
      <div className="flex items-start justify-center gap-6 lg:gap-8">
        {/* CỘT TRÁI (Danh mục bài học / Sidebar Navigation) */}
        {!isFocusMode && !isSidebarCollapsed && (
          <aside
            className="custom-scrollbar sticky top-20 hidden h-[calc(100vh-5.5rem)] w-[280px] shrink-0 overflow-y-auto border-r border-stone-200/80 pr-4 pb-6 lg:block"
            aria-label="Danh mục điều hướng bài học"
          >
            <LessonSidebar
              subject={subject}
              activeLessonId={lesson.id}
              onToggleCollapse={handleToggleSidebarCollapse}
            />
          </aside>
        )}

        {/* CỘT GIỮA (Nội dung bài học - Main Content Reader) */}
        <main
          className={cn(
            'mx-auto min-w-0 flex-1 px-4 py-6 transition-all duration-200 sm:px-8 lg:px-12',
            isFocusMode ? 'max-w-[1000px]' : 'max-w-[920px]',
          )}
        >
          {isFocusMode && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-800/25 bg-amber-50/70 px-4 py-2 text-xs text-amber-950 shadow-2xs">
              <span className="font-medium">
                📖 Đang bật <strong>Chế độ đọc tập trung</strong> (đã ẩn thanh điều hướng và mục lục
                hai bên).
              </span>
              <button
                type="button"
                onClick={handleToggleFocusMode}
                className="cursor-pointer font-semibold text-amber-900 underline hover:text-amber-950"
              >
                Thoát tập trung (Esc)
              </button>
            </div>
          )}

          <article
            data-reading-size={fontSize}
            className="rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-6 shadow-xs sm:p-8 lg:p-10"
          >
            <header className="space-y-4 border-b border-[var(--bg-muted)] pb-6">
              {/* Siêu dữ liệu bài học semantic <aside role="note"> */}
              <aside role="note" aria-label="Thông tin bài học" className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="subject">
                    Chương {chapter.number} · Bài {chapter.number}.{lesson.number}
                  </Badge>
                  <Badge variant="neutral">{LEVEL_LABELS[lesson.level]}</Badge>
                  {lesson.status !== 'published' && (
                    <Badge variant={lesson.status}>Bản {lesson.status}</Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                    <span>Thời lượng đọc: ~{lesson.estimatedMinutes} phút</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                    <span>Phiên bản {lesson.version}</span>
                  </span>
                </div>
              </aside>

              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl lg:text-4xl">
                {lesson.title}
              </h1>

              <p className="text-base leading-relaxed text-[var(--text-secondary)] sm:text-[17px]">
                {lesson.description}
              </p>

              {lesson.prerequisites.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-stone-600">
                  <span className="font-medium text-stone-700">Kiến thức tiên quyết:</span>
                  {lesson.prerequisites.map((prereqId) => {
                    const prereq = getLessonById(prereqId);
                    if (!prereq) {
                      return (
                        <Badge key={prereqId} variant="neutral">
                          {prereqId}
                        </Badge>
                      );
                    }
                    return (
                      <Link
                        key={prereqId}
                        to={ROUTES.lesson(
                          prereq.subject.slug,
                          prereq.chapter.slug,
                          prereq.lesson.slug,
                        )}
                        className="text-subject-700 decoration-subject-300 hover:text-subject-900 font-medium underline underline-offset-4"
                      >
                        Bài {prereq.chapter.number}.{prereq.lesson.number}: {prereq.lesson.title}
                      </Link>
                    );
                  })}
                </div>
              )}

              <div className="pt-2">
                <LessonActionBar
                  lessonId={lesson.id}
                  isNotesOpen={isNotesOpen}
                  onToggleNotes={handleToggleNotes}
                />
              </div>
            </header>

            {isAuthenticated && isNotesOpen && (
              <div className="mt-6">
                <LessonNotesPanel
                  key={lesson.id}
                  lessonId={lesson.id}
                  lessonTitle={lesson.title}
                  onClose={() => setOpenNoteLessonId(null)}
                />
              </div>
            )}

            <div className="mt-8">
              {loadError ? (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  {loadError}
                </div>
              ) : compiled ? (
                <LessonMdxView Content={compiled.default} lessonMeta={compiled.lessonMeta} />
              ) : (
                <div className="space-y-4" aria-label="Đang tải nội dung bài học">
                  <Skeleton className="h-8 w-2/3" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              )}
            </div>

            <SourcePanel lesson={lesson} lessonMeta={compiled?.lessonMeta ?? null} />

            <footer className="mt-10 border-t border-[var(--bg-muted)] pt-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs text-[var(--text-muted)]">
                  Hoàn thành bài học này? Hãy đánh dấu để cập nhật tiến độ học phần.
                </p>
                <LessonActionBar
                  lessonId={lesson.id}
                  isNotesOpen={isNotesOpen}
                  onToggleNotes={handleToggleNotes}
                />
              </div>

              <LessonPrevNextNav subjectSlug={subject.slug} lessonId={lesson.id} />
            </footer>
          </article>
        </main>

        {/* CỘT PHẢI (Mục lục bài học - Table of Contents / On this page) */}
        {!isFocusMode && (
          <aside
            className="custom-scrollbar sticky top-20 hidden h-fit max-h-[calc(100vh-6rem)] w-[230px] shrink-0 overflow-y-auto pl-2 xl:block"
            role="complementary"
            aria-label="Cột biên tập lề và mục lục"
          >
            <LessonToc lessonMeta={compiled?.lessonMeta ?? null} />
          </aside>
        )}
      </div>
    </FadeIn>
  );
}

export default LessonPage;
