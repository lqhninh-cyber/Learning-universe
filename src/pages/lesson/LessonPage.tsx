import { ArrowLeft, Clock, Layers, Link2, ListTree, PanelLeft, PanelLeftOpen } from 'lucide-react';
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

  // Đồng bộ data-focus-mode lên document.body để ẩn Header và chuyển layout mượt mà
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isFocusMode) {
      document.body.setAttribute('data-focus-mode', 'true');
    } else {
      document.body.removeAttribute('data-focus-mode');
    }
    return () => {
      document.body.removeAttribute('data-focus-mode');
    };
  }, [isFocusMode]);

  // Hỗ trợ phím F để bật/tắt Focus Mode và phím Esc để thoát chế độ tập trung
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Phím F / f: Bật/tắt Focus Mode (không kèm Ctrl / Meta / Alt để không cản trở Ctrl+F)
      if ((e.key === 'f' || e.key === 'F') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleToggleFocusMode();
        return;
      }

      // Phím Escape: Thoát Focus Mode khi đang kích hoạt
      if (e.key === 'Escape' && isFocusMode) {
        e.preventDefault();
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
    <FadeIn
      className={cn(
        'mx-auto w-full bg-[#FAF7F2] pb-16 text-stone-900 transition-all duration-300',
        isFocusMode
          ? 'max-w-[1000px] px-4 pt-2 sm:px-6'
          : 'max-w-[1560px] space-y-6 px-4 pt-0 sm:px-6 lg:px-8',
      )}
    >
      {/* Nút nhỏ cố định ở góc trên cùng bên phải màn hình: ✕ Thoát chế độ tập trung */}
      {isFocusMode && (
        <button
          type="button"
          onClick={handleToggleFocusMode}
          className="fixed top-4 right-4 z-50 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-300/90 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-stone-800 shadow-md backdrop-blur-md transition-all duration-200 hover:border-amber-700 hover:bg-amber-50 hover:text-amber-950 hover:shadow-lg"
          title="Thoát chế độ đọc tập trung (Phím Esc hoặc F)"
          aria-label="Thoát chế độ tập trung"
        >
          <span className="font-bold text-amber-900" aria-hidden="true">
            ✕
          </span>
          <span>Thoát chế độ tập trung</span>
          <kbd className="ml-1 rounded border border-stone-300/70 bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
            Esc
          </kbd>
        </button>
      )}

      {import.meta.env.DEV && (
        <DevEditorialBar lesson={lesson} lessonMeta={compiled?.lessonMeta ?? null} />
      )}

      <div
        className={cn(
          'flex flex-col justify-between gap-4 border-b border-stone-200/50 pb-4 transition-all duration-300 lg:flex-row lg:items-center',
          isFocusMode && 'border-transparent pb-1',
        )}
      >
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

      {/* Bố cục 3 cột linh hoạt: Sidebar (280px) | Main Content | TOC (230px) */}
      <div className="flex items-start justify-center gap-6 transition-all duration-300 lg:gap-8">
        {/* CỘT TRÁI (Danh mục bài học / Sidebar Navigation) - Tạm ẩn trong Focus Mode */}
        {!isFocusMode && !isSidebarCollapsed && (
          <aside
            className="custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] w-[280px] shrink-0 scrollbar-thin self-start overflow-y-auto rounded-2xl border-r border-stone-200/70 bg-[#F5F1EB] p-4 pr-2 pb-6 text-stone-800 transition-all duration-300 lg:block"
            aria-label="Danh mục điều hướng bài học"
          >
            <LessonSidebar
              subject={subject}
              activeLessonId={lesson.id}
              onToggleCollapse={handleToggleSidebarCollapse}
            />
          </aside>
        )}

        {/* CỘT GIỮA (Nội dung bài học - Main Content Reader: Căn giữa tự nhiên, max-w-3xl / max-w-[780px]) */}
        <main
          className={cn(
            'mx-auto min-w-0 flex-1 transition-all duration-300',
            isFocusMode
              ? 'max-w-3xl px-6 py-12 sm:py-16'
              : 'max-w-[780px] px-4 py-6 sm:px-6 lg:px-8',
          )}
        >
          {isFocusMode && (
            <div className="mb-6 flex items-center justify-between rounded-xl border border-stone-200/80 bg-[#FDFBF7] px-4 py-2.5 text-xs text-stone-800 shadow-2xs">
              <span className="flex items-center gap-2 font-medium">
                <span aria-hidden="true">📖</span>
                <span>
                  Đang bật <strong>Chế độ đọc tập trung</strong> (Nhấn phím{' '}
                  <kbd className="rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-800">
                    F
                  </kbd>{' '}
                  hoặc{' '}
                  <kbd className="rounded border border-stone-300 bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-stone-800">
                    Esc
                  </kbd>{' '}
                  để thoát).
                </span>
              </span>
              <button
                type="button"
                onClick={handleToggleFocusMode}
                className="cursor-pointer font-semibold text-stone-900 underline hover:text-[#9A3412]"
              >
                Thoát tập trung (Esc)
              </button>
            </div>
          )}

          <article
            data-reading-article
            data-reading-size={fontSize}
            className={cn(
              'lesson-content rounded-3xl border border-stone-200/80 bg-white text-stone-900 shadow-sm transition-all duration-300',
              fontSize === 'lg' && 'reader-scale-lg',
              isFocusMode ? 'p-8 sm:p-12 lg:p-14' : 'p-8 md:p-12',
            )}
          >
            <header className="space-y-4 border-b border-stone-200/50 pb-6">
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
                    <span>Thời lượng đọc: {Math.max(5, lesson.estimatedMinutes)} phút</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                    <span>Phiên bản {lesson.version}</span>
                  </span>
                </div>
              </aside>

              <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight text-stone-900 lg:text-4xl">
                {lesson.title}
              </h1>

              <p className="academic-dropcap mb-6 font-serif text-[18.5px] leading-[1.85] text-stone-800">
                {lesson.description}
              </p>

              {lesson.prerequisites.length > 0 && (
                <div className="clear-both mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-stone-800 md:text-sm">
                  <div className="flex shrink-0 items-center gap-1.5 font-semibold text-amber-950">
                    <Link2 className="h-4 w-4 text-amber-800" aria-hidden="true" />
                    <span>Kiến thức tiên quyết:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
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
                          className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-white/90 px-2.5 py-1 text-xs font-semibold text-amber-950 shadow-2xs transition-colors hover:border-amber-600/40 hover:bg-white hover:text-amber-900"
                        >
                          <span>
                            Bài {prereq.chapter.number}.{prereq.lesson.number}:{' '}
                            {prereq.lesson.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
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

            <footer className="mt-10 border-t border-stone-200/50 pt-6">
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

        {/* CỘT PHẢI (Mục lục bài học & Cột chú giải lề - Sidenotes Column) */}
        {!isFocusMode && (
          <aside
            data-sidenotes-column
            className="custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] w-[260px] shrink-0 scrollbar-thin self-start overflow-y-auto pl-2 transition-all duration-300 xl:block"
            role="complementary"
            aria-label="Cột biên tập lề và mục lục"
          >
            <LessonToc lessonMeta={compiled?.lessonMeta ?? null} />
          </aside>
        )}
      </div>

      {/* Floating Quick Reading Controls Toolbar ở góc dưới phải màn hình */}
      <div className="fixed right-6 bottom-6 z-40 hidden md:block print:hidden">
        <ReadingControlsToolbar
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
          isFocusMode={isFocusMode}
          onToggleFocusMode={handleToggleFocusMode}
          className="border-stone-300/90 bg-white/95 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-md"
        />
      </div>
    </FadeIn>
  );
}

export default LessonPage;
