import {
  ArrowLeft,
  BookOpen,
  Clock,
  Layers,
  Link2,
  ListTree,
  PanelLeft,
  PanelLeftOpen,
} from 'lucide-react';
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
  FloatingReadingController,
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

  const [readingTheme, setReadingTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light') {
          return saved;
        }
      } catch {
        // Bỏ qua lỗi storage
      }
    }
    return 'light';
  });

  const handleToggleReadingTheme = () => {
    setReadingTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('lu_reading_theme', next);
      } catch {
        // Bỏ qua lỗi storage
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lu_reading_theme_change', { detail: next }));
      }
      return next;
    });
  };

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<'light' | 'dark'>;
      if (custom.detail === 'light' || custom.detail === 'dark') {
        setReadingTheme(custom.detail);
      } else {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light') {
          setReadingTheme(saved);
        }
      }
    };
    window.addEventListener('lu_reading_theme_change', handleThemeChange);
    return () => window.removeEventListener('lu_reading_theme_change', handleThemeChange);
  }, []);

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
    <div id="reading-container" className={cn(readingTheme === 'dark' && 'dark')}>
      <FadeIn
        className={cn(
          'mx-auto w-full pb-16 transition-all duration-300',
          readingTheme === 'dark'
            ? 'dark bg-[#121517] text-[#E2E8F0]'
            : 'bg-[#EAF0F1] text-[#29383D]',
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
            'flex flex-col justify-between gap-4 border-b pb-4 transition-all duration-300 lg:flex-row lg:items-center',
            readingTheme === 'dark' ? 'border-[#2A323A]' : 'border-[#CFDADB]',
            isFocusMode && 'border-transparent pb-1',
          )}
        >
          <div className="flex items-center gap-3">
            {!isFocusMode && isSidebarCollapsed && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleSidebarCollapse}
                className={cn(
                  'hidden items-center gap-1.5 text-xs shadow-2xs transition-colors lg:inline-flex',
                  readingTheme === 'dark'
                    ? 'border-[#2A323A] bg-[#20252B] text-[#E2E8F0] hover:bg-[#242C33]'
                    : 'border-stone-300 bg-stone-50/90 text-stone-700 hover:text-stone-900',
                )}
                title="Mở lại danh sách bài học (Thanh bên)"
                aria-label="Mở lại danh sách bài học"
              >
                <PanelLeftOpen
                  className={cn(
                    'h-4 w-4',
                    readingTheme === 'dark' ? 'text-[#C89738]' : 'text-subject-700',
                  )}
                  aria-hidden="true"
                />
                <span>Hiện danh mục bài</span>
              </Button>
            )}

            <Breadcrumb
              items={[
                { label: 'Trang chủ', href: ROUTES.home },
                { label: subject.title, href: ROUTES.subjectOverview(subject.slug) },
                {
                  label:
                    chapter.title.startsWith('Chương ') ||
                    chapter.title.startsWith('Chuyên đề ') ||
                    chapter.title.startsWith('Khối ')
                      ? chapter.title
                      : `Chương ${chapter.number}: ${chapter.title}`,
                  href: ROUTES.subjectOverview(subject.slug),
                },
                {
                  label:
                    lesson.title.startsWith('Bài ') ||
                    lesson.title.startsWith('Thực hành ') ||
                    lesson.title.startsWith('Chuyên đề ')
                      ? lesson.title
                      : `Bài ${chapter.number}.${lesson.number}: ${lesson.title}`,
                },
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
                    readingTheme={readingTheme}
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
                    readingTheme={readingTheme}
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
              className={cn(
                'custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] w-[280px] shrink-0 scrollbar-thin self-start overflow-y-auto rounded-2xl p-4 pr-2 pb-6 transition-all duration-300 lg:block',
                readingTheme === 'dark'
                  ? 'border-r border-[#2A323A] bg-[#181C20] text-[#E2E8F0]'
                  : 'border-r border-[#CFDADB] bg-[#E1E9EA] text-[#29383D]',
              )}
              aria-label="Danh mục điều hướng bài học"
            >
              <LessonSidebar
                subject={subject}
                activeLessonId={lesson.id}
                readingTheme={readingTheme}
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
              <div
                className={cn(
                  'mb-6 flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs shadow-2xs',
                  readingTheme === 'dark'
                    ? 'border-[#2A323A] bg-[#181C20] text-[#E2E8F0]'
                    : 'border-[#CFDADB] bg-[#F7FAFA] text-[#29383D]',
                )}
              >
                <span className="flex items-center gap-2 font-medium">
                  <BookOpen
                    className={cn(
                      'h-3.5 w-3.5',
                      readingTheme === 'dark' ? 'text-[#C89738]' : 'text-[#3F6570]',
                    )}
                    aria-hidden="true"
                  />
                  <span>
                    Đang bật <strong>Chế độ đọc tập trung</strong> (Nhấn phím{' '}
                    <kbd
                      className={cn(
                        'rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold',
                        readingTheme === 'dark'
                          ? 'border-[#2A323A] bg-[#20252B] text-[#E2E8F0]'
                          : 'border-[#CFDADB] bg-stone-100 text-[#29383D]',
                      )}
                    >
                      F
                    </kbd>{' '}
                    hoặc{' '}
                    <kbd
                      className={cn(
                        'rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold',
                        readingTheme === 'dark'
                          ? 'border-[#2A323A] bg-[#20252B] text-[#E2E8F0]'
                          : 'border-[#CFDADB] bg-stone-100 text-[#29383D]',
                      )}
                    >
                      Esc
                    </kbd>{' '}
                    để thoát).
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleToggleFocusMode}
                  className={cn(
                    'cursor-pointer font-semibold underline',
                    readingTheme === 'dark'
                      ? 'text-[#C89738] hover:text-[#DFAD4D]'
                      : 'text-[#29383D] hover:text-[#3F6570]',
                  )}
                >
                  Thoát tập trung (Esc)
                </button>
              </div>
            )}

            <article
              data-reading-article
              data-reading-theme={readingTheme}
              data-reading-size={fontSize}
              className={cn(
                'lesson-content transition-all duration-300',
                readingTheme === 'dark'
                  ? 'dark rounded-2xl border border-[#2A323A] bg-[#181C20] text-[#E2E8F0] shadow-none'
                  : 'rounded-3xl border border-[#CFDADB] bg-[#F7FAFA] text-[#29383D] shadow-sm',
                fontSize === 'lg' && 'reader-scale-lg',
                isFocusMode ? 'p-8 sm:p-12 lg:p-14' : 'p-8 md:p-12',
              )}
            >
              <header
                className={cn(
                  'space-y-4 border-b pb-6',
                  readingTheme === 'dark' ? 'border-[#2A323A]' : 'border-[#CFDADB]',
                )}
              >
                {/* Siêu dữ liệu bài học semantic <aside role="note"> */}
                <aside role="note" aria-label="Thông tin bài học" className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="subject"
                      className={cn(
                        readingTheme === 'dark' &&
                          'border border-[#2A323A] bg-[#20252B] text-[#CBD5E1]',
                      )}
                    >
                      {/^Thực hành/i.test(lesson.title)
                        ? `Khối Thực hành · Thực hành ${lesson.number}`
                        : `Chương ${chapter.number} · Bài ${chapter.number}.${lesson.number}`}
                    </Badge>
                    <Badge
                      variant="neutral"
                      className={cn(
                        readingTheme === 'dark' &&
                          'border border-[#2A323A] bg-[#20252B] text-[#CBD5E1]',
                      )}
                    >
                      {LEVEL_LABELS[lesson.level]}
                    </Badge>
                    {lesson.tags
                      .filter((t) => /^CLO/i.test(t))
                      .map((clo) => (
                        <Badge
                          key={clo}
                          variant="neutral"
                          className={cn(
                            readingTheme === 'dark'
                              ? 'border border-[#2A323A] bg-[#20252B] text-[#CBD5E1]'
                              : 'border-amber-600/30 bg-amber-500/10 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-200',
                          )}
                        >
                          Chuẩn đầu ra: {clo}
                        </Badge>
                      ))}
                    {lesson.status !== 'published' && (
                      <Badge variant={lesson.status}>Bản {lesson.status}</Badge>
                    )}
                  </div>

                  <div
                    className={cn(
                      'flex flex-wrap items-center gap-4 text-xs',
                      readingTheme === 'dark' ? 'text-[#94A3B8]' : 'text-[var(--text-muted)]',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        readingTheme === 'dark' &&
                          'rounded-lg border border-[#2A323A] bg-[#20252B] px-2.5 py-1 text-[#CBD5E1]',
                      )}
                    >
                      <Clock
                        className={cn(
                          'h-3.5 w-3.5',
                          readingTheme === 'dark' ? 'text-[#94A3B8]' : 'text-stone-400',
                        )}
                        aria-hidden="true"
                      />
                      <span>Thời lượng đọc: {Math.max(5, lesson.estimatedMinutes)} phút</span>
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5',
                        readingTheme === 'dark' &&
                          'rounded-lg border border-[#2A323A] bg-[#20252B] px-2.5 py-1 text-[#CBD5E1]',
                      )}
                    >
                      <Layers
                        className={cn(
                          'h-3.5 w-3.5',
                          readingTheme === 'dark' ? 'text-[#94A3B8]' : 'text-stone-400',
                        )}
                        aria-hidden="true"
                      />
                      <span>Phiên bản {lesson.version}</span>
                    </span>
                  </div>
                </aside>

                <h1
                  className={cn(
                    'mb-6 font-serif text-3xl font-bold tracking-tight lg:text-4xl',
                    readingTheme === 'dark' ? 'text-[#F8FAFC]' : 'text-[#29383D]',
                  )}
                >
                  {lesson.title}
                </h1>

                <p
                  className={cn(
                    'academic-dropcap mb-6 font-serif text-[18.5px] leading-[1.85]',
                    readingTheme === 'dark' ? 'leading-relaxed text-[#E2E8F0]' : 'text-[#29383D]',
                  )}
                >
                  {lesson.description}
                </p>

                {lesson.prerequisites.length > 0 && (
                  <div
                    className={cn(
                      'clear-both mt-4 flex flex-wrap items-center gap-2.5 rounded-xl border p-3 text-xs md:text-sm',
                      readingTheme === 'dark'
                        ? 'border border-[#2A323A] bg-[#20252B] text-[#E2E8F0]'
                        : 'border border-[#71889A]/30 bg-[#E5EDF1] text-[#29383D]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex shrink-0 items-center gap-1.5 font-semibold',
                        readingTheme === 'dark' ? 'text-[#E2E8F0]' : 'text-[#29383D]',
                      )}
                    >
                      <Link2
                        className={cn(
                          'h-4 w-4',
                          readingTheme === 'dark' ? 'text-[#C89738]' : 'text-[#3F6570]',
                        )}
                        aria-hidden="true"
                      />
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
                            className={cn(
                              'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs shadow-2xs transition-colors',
                              readingTheme === 'dark'
                                ? 'border border-[#2A323A] bg-[#14171A] font-medium text-[#C89738] hover:border-[#C89738] hover:bg-[#20252B]'
                                : 'border border-[#CFDADB] bg-white/90 font-semibold text-[#29383D] hover:border-[#71889A] hover:bg-white hover:text-[#3F6570]',
                            )}
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

                <div
                  className={cn(
                    'clear-both mt-6 flex flex-wrap items-center gap-2.5 border-t pt-4',
                    readingTheme === 'dark' ? 'border-[#2A323A]' : 'border-stone-200/60',
                  )}
                >
                  <LessonActionBar
                    lessonId={lesson.id}
                    isNotesOpen={isNotesOpen}
                    onToggleNotes={handleToggleNotes}
                    readingTheme={readingTheme}
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

              <footer
                className={cn(
                  'mt-10 border-t pt-6',
                  readingTheme === 'dark' ? 'border-[#2A323A]' : 'border-[#CFDADB]',
                )}
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <p
                    className={cn(
                      'text-xs',
                      readingTheme === 'dark' ? 'text-[#94A3B8]' : 'text-[var(--text-muted)]',
                    )}
                  >
                    Hoàn thành bài học này? Hãy đánh dấu để cập nhật tiến độ học phần.
                  </p>
                  <LessonActionBar
                    lessonId={lesson.id}
                    isNotesOpen={isNotesOpen}
                    onToggleNotes={handleToggleNotes}
                    readingTheme={readingTheme}
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
              className={cn(
                'custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] w-[260px] shrink-0 scrollbar-thin self-start overflow-y-auto pl-2 transition-all duration-300 xl:block',
                readingTheme === 'dark' ? 'text-[#94A3B8]' : '',
              )}
              role="complementary"
              aria-label="Cột biên tập lề và mục lục"
            >
              <LessonToc lessonMeta={compiled?.lessonMeta ?? null} readingTheme={readingTheme} />
            </aside>
          )}
        </div>

        {/* Floating Reading Controller cố định công thái học ở góc dưới màn hình */}
        <FloatingReadingController
          readingTheme={readingTheme}
          onToggleReadingTheme={handleToggleReadingTheme}
        />
      </FadeIn>
    </div>
  );
}

export default LessonPage;
