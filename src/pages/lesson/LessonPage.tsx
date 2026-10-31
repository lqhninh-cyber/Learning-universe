import { ArrowLeft, Clock, Layers, ListTree, PanelLeft } from 'lucide-react';
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
  SourcePanel,
} from '@/features/lesson-reader';
import { ROUTES } from '@/shared/config/routes';
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
    <FadeIn className="space-y-6 pb-16">
      {import.meta.env.DEV && (
        <DevEditorialBar lesson={lesson} lessonMeta={compiled?.lessonMeta ?? null} />
      )}

      <div className="flex flex-col justify-between gap-4 border-b border-stone-200/80 pb-4 lg:flex-row lg:items-center">
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

        <div className="flex items-center gap-2 lg:hidden">
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
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
            <LessonSidebar subject={subject} activeLessonId={lesson.id} />
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-6">
          <Card className="p-6 sm:p-8 lg:p-10">
            <header className="space-y-4 border-b border-stone-200 pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="subject">
                  Chương {chapter.number} · Bài {chapter.number}.{lesson.number}
                </Badge>
                <Badge variant="neutral">{LEVEL_LABELS[lesson.level]}</Badge>
                {lesson.status !== 'published' && (
                  <Badge variant={lesson.status}>Bản {lesson.status}</Badge>
                )}
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">
                {lesson.title}
              </h1>

              <p className="text-base leading-relaxed text-stone-600">{lesson.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                  <span>Thời lượng đọc: ~{lesson.estimatedMinutes} phút</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
                  <span>Phiên bản {lesson.version}</span>
                </span>
              </div>

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

            <footer className="mt-10 border-t border-stone-200 pt-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <p className="text-xs text-stone-500">
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
          </Card>
        </div>

        <aside className="hidden lg:col-span-3 lg:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pl-2">
            <LessonToc lessonMeta={compiled?.lessonMeta ?? null} />
          </div>
        </aside>
      </div>
    </FadeIn>
  );
}

export default LessonPage;
