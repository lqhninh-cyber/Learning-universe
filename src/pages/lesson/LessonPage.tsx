import { ArrowLeft, BookOpen, Link2, ListTree, PanelLeft, PanelLeftOpen } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  SourcePanel,
} from '@/features/lesson-reader';
import { FloatingZenToolbar } from '@/components/reader/FloatingZenToolbar';
import { FoliageReadingProgress } from '@/components/reader/FoliageReadingProgress';
import {
  EditorialChapterOpener,
  type ChapterCloItem,
  type ChapterDifficultyLevel,
} from '@/components/lesson';
import { ReadingSettingsProvider, useReadingSettings } from '@/context/ReadingSettingsContext';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { FadeIn } from '@/shared/motion/FadeIn';
import { Badge, Breadcrumb, Button, Card, Drawer, Skeleton } from '@/shared/ui';

function getSubjectCode(slug: string): string {
  if (slug === 'giao-duc-hoc') return 'EDUC2802';
  if (slug === 'giai-tich-ham-mot-bien' || slug === 'single-variable-calculus') return 'MATH1403';
  if (slug === 'hinh-hoc-affine' || slug === 'affine-geometry') return 'MATH2204';
  if (slug === 'cau-truc-dai-so' || slug === 'algebraic-structures') return 'MATH1301';
  return 'MATH';
}

function getCurriculumSource(slug: string): string {
  if (slug === 'giao-duc-hoc') {
    return 'Giáo trình Giáo dục học — Trường ĐH Sư phạm TP.HCM (HCMUE, K50–51)';
  }
  if (slug === 'giai-tich-ham-mot-bien' || slug === 'single-variable-calculus') {
    return 'Giáo trình Giải tích hàm một biến — PGS.TS. Trần Trí Dũng (NXB Giáo dục)';
  }
  if (slug === 'hinh-hoc-affine' || slug === 'affine-geometry') {
    return 'Giáo trình Hình học cao cấp — GS. Nguyễn Mộng Hy / TS. Huỳnh Việt Khánh (NXB Giáo dục)';
  }
  if (slug === 'cau-truc-dai-so' || slug === 'algebraic-structures') {
    return 'Giáo trình Cấu trúc Đại số: Nhóm • Vành • Trường — TS. Huỳnh Việt Khánh (NXB Giáo dục)';
  }
  return 'Giáo trình chuẩn Đại học Sư phạm';
}

function getDifficultyLevel(
  level: 'basic' | 'intermediate' | 'advanced',
  slug: string,
): ChapterDifficultyLevel {
  if (slug === 'giao-duc-hoc') return 'Nghiệp vụ thực hành';
  if (level === 'basic') return 'Nền tảng';
  if (level === 'advanced') return 'Chuyên sâu';
  return 'Trung cấp';
}

function getLessonClos(tags: readonly string[], slug: string): readonly ChapterCloItem[] {
  const cloTags = tags.filter((t) => /^CLO/i.test(t));
  if (cloTags.length > 0) {
    return cloTags.map((tag) => {
      const match = tag.match(/^CLO-?(\d+(?:\.\d+)?)(?:\s*[:-]\s*(.*))?$/i);
      const code = match ? `CLO ${match[1]}` : tag;
      const desc = match?.[2] || getCloFallbackDescription(slug);
      return { code, description: desc };
    });
  }

  if (slug === 'giao-duc-hoc') {
    return [
      {
        code: 'CLO 1.1',
        description:
          'Phân tích bản chất hiện tượng giáo dục và chuẩn nghề nghiệp giáo viên THCS/THPT',
      },
      {
        code: 'CLO 6.2',
        description: 'Vận dụng 5 bước xử lý sư phạm và khung pháp quy giáo dục giải quyết xung đột',
      },
    ];
  }
  if (slug === 'giai-tich-ham-mot-bien' || slug === 'single-variable-calculus') {
    return [
      {
        code: 'CLO 1.2',
        description:
          'Kỹ thuật định lượng và chứng minh giới hạn dãy số bằng ngôn ngữ ε–N (Epsilon)',
      },
      {
        code: 'CLO 2.1',
        description:
          'Vận dụng tiêu chuẩn hội tụ Cauchy, Weierstrass và tính liên tục phân tích hàm số',
      },
    ];
  }
  if (slug === 'hinh-hoc-affine' || slug === 'affine-geometry') {
    return [
      {
        code: 'CLO 2.1',
        description:
          'Xác định mục tiêu afin, phương và hệ phương trình tham số của m-phẳng trong không gian Afin',
      },
      {
        code: 'CLO 3.2',
        description:
          'Vận dụng nhóm các phép biến đổi afin và tính chất bất biến trong nghiên cứu hình học',
      },
    ];
  }
  return [
    {
      code: 'CLO 1.1',
      description:
        'Nắm vững hệ thống tiên đề cấu trúc đại số: Nhóm, Vành, Trường và các định lý đẳng cấu',
    },
  ];
}

function getCloFallbackDescription(slug: string): string {
  if (slug === 'giao-duc-hoc') {
    return 'Phân tích cơ sở lý luận và nghiệp vụ sư phạm giải quyết tình huống thực tế';
  }
  if (slug === 'giai-tich-ham-mot-bien' || slug === 'single-variable-calculus') {
    return 'Chứng minh giới hạn và phân tích tính chất giải tích bằng ngôn ngữ Epsilon';
  }
  if (slug === 'hinh-hoc-affine' || slug === 'affine-geometry') {
    return 'Khảo sát cấu trúc hình học afin, phương trình m-phẳng và ánh xạ afin';
  }
  return 'Phân tích cấu trúc đại số và chứng minh các mệnh đề học thuật';
}

function LessonPageContent() {
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

  const { theme, fontSize, isZenMode, toggleZenMode, setZenMode, typographyClasses } =
    useReadingSettings();
  const readingTheme = theme;
  const isFocusMode = isZenMode;
  const articleRef = useRef<HTMLElement>(null);

  // Hỗ trợ phím tắt F và Escape bổ trợ cho Zen Mode
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

      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleZenMode();
      } else if (e.key === 'Escape' && isZenMode) {
        e.preventDefault();
        setZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleZenMode, setZenMode, isZenMode]);

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
            onClick={toggleZenMode}
            className="fixed top-4 right-4 z-50 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-stone-300/90 bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-stone-800 shadow-md backdrop-blur-md transition-all duration-200 hover:border-amber-700 hover:bg-amber-50 hover:text-amber-950 hover:shadow-lg dark:border-[#2C4D3B] dark:bg-[#13261D] dark:text-[#E2ECE6]"
            title="Thoát chế độ đọc tập trung (Phím Esc hoặc Z)"
            aria-label="Thoát chế độ tập trung"
          >
            <span className="font-bold text-[#C5A262]" aria-hidden="true">
              ✕
            </span>
            <span>Thoát tập trung</span>
            <kbd className="ml-1 rounded border border-stone-300/70 bg-stone-100 px-1.5 py-0.5 font-mono text-[10px] text-stone-600 dark:border-[#284E3A] dark:bg-[#163023] dark:text-[#A1D1B7]">
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
          {/* CỘT TRÁI (Danh mục bài học / Sidebar Navigation) */}
          {!isSidebarCollapsed && (
            <aside
              className={cn(
                'custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] shrink-0 scrollbar-thin self-start overflow-y-auto rounded-2xl p-4 pr-2 pb-6 transition-all duration-300 lg:block',
                isZenMode
                  ? 'pointer-events-none m-0 w-0 max-w-0 -translate-x-8 overflow-hidden border-0 p-0 opacity-0'
                  : 'w-[280px] translate-x-0 opacity-100',
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

          {/* CỘT GIỮA (Nội dung bài học - Main Content Reader: Căn giữa tự nhiên, max-w-[720px] khi Zen Mode) */}
          <main
            className={cn(
              'mx-auto min-w-0 flex-1 transition-all duration-300',
              isZenMode
                ? 'max-w-[720px] px-4 py-8 sm:px-6'
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
                    Đang bật <strong>Chế độ đọc tập trung (Zen Mode)</strong> (Nhấn phím{' '}
                    <kbd
                      className={cn(
                        'rounded border px-1.5 py-0.5 font-mono text-[10px] font-bold',
                        readingTheme === 'dark'
                          ? 'border-[#2A323A] bg-[#20252B] text-[#E2E8F0]'
                          : 'border-[#CFDADB] bg-stone-100 text-[#29383D]',
                      )}
                    >
                      Z
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
                  onClick={toggleZenMode}
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
              ref={articleRef}
              data-reading-article
              data-reading-theme={readingTheme}
              data-reading-size={fontSize}
              className={cn(
                'lesson-content transition-all duration-300',
                typographyClasses,
                readingTheme === 'dark'
                  ? 'dark rounded-2xl border border-[#2A323A] bg-[#181C20] text-[#E2E8F0] shadow-none'
                  : 'rounded-3xl border border-[#CFDADB] bg-[#F7FAFA] text-[#29383D] shadow-sm',
                fontSize === 'lg' && 'reader-scale-lg',
                isFocusMode ? 'p-8 sm:p-12 lg:p-14' : 'p-8 md:p-12',
              )}
            >
              <EditorialChapterOpener
                subjectCode={getSubjectCode(subject.slug)}
                subjectName={subject.title}
                chapterNumber={chapter.number}
                title={lesson.title}
                subtitle={lesson.description}
                estimatedReadingMinutes={Math.max(5, lesson.estimatedMinutes)}
                difficultyLevel={getDifficultyLevel(lesson.level, subject.slug)}
                clos={getLessonClos(lesson.tags, subject.slug)}
                curriculumSource={getCurriculumSource(subject.slug)}
                prerequisites={
                  lesson.prerequisites.length > 0 ? (
                    <div
                      className={cn(
                        'clear-both mt-3 flex flex-wrap items-center gap-2.5 rounded-xl border p-3 text-xs md:text-sm',
                        readingTheme === 'dark'
                          ? 'border-[#2A323A] bg-[#20252B]/80 text-[#E2E8F0]'
                          : 'border-[#71889A]/30 bg-[#E5EDF1]/80 text-[#29383D]',
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
                            readingTheme === 'dark' ? 'text-[#C5A262]' : 'text-[#3F6570]',
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
                  ) : null
                }
              >
                {lesson.status !== 'published' && (
                  <div className="pt-2">
                    <Badge variant={lesson.status}>Bản {lesson.status}</Badge>
                  </div>
                )}
              </EditorialChapterOpener>

              <div
                className={cn(
                  'clear-both mb-8 flex flex-wrap items-center gap-2.5 border-b pb-4',
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
          <aside
            data-sidenotes-column
            className={cn(
              'custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] shrink-0 scrollbar-thin self-start overflow-y-auto pl-2 transition-all duration-300 xl:block',
              isZenMode
                ? 'pointer-events-none m-0 w-0 max-w-0 translate-x-8 overflow-hidden border-0 p-0 opacity-0'
                : 'w-[260px] translate-x-0 opacity-100',
              readingTheme === 'dark' ? 'text-[#94A3B8]' : '',
            )}
            role="complementary"
            aria-label="Cột biên tập lề và mục lục"
          >
            <LessonToc lessonMeta={compiled?.lessonMeta ?? null} readingTheme={readingTheme} />
          </aside>
        </div>

        {/* Vạch tiến độ mầm cây sinh trưởng công thái học */}
        <FoliageReadingProgress articleContainerRef={articleRef} />

        {/* Floating Zen Toolbar ghim nổi công thái học */}
        <FloatingZenToolbar />
      </FadeIn>
    </div>
  );
}

export function LessonPage() {
  return (
    <ReadingSettingsProvider>
      <LessonPageContent />
    </ReadingSettingsProvider>
  );
}

export default LessonPage;
