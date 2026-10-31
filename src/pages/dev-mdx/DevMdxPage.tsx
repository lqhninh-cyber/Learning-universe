import { NUMBERED_BLOCKS } from '@schemas/blocks';
import { BookOpen, Clock, FileCode2, Hash, Layers } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  type CompiledLessonModule,
  getSubjects,
  type LessonLocation,
  LessonMdxView,
  loadLessonModule,
} from '@/content-runtime';
import { FadeIn } from '@/shared/motion/FadeIn';
import { isSubjectThemeId, type SubjectThemeId } from '@/shared/theme/subject-themes';
import { SubjectThemeProvider } from '@/shared/theme/SubjectThemeProvider';
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/shared/ui';

export function DevMdxPage() {
  const subjects = getSubjects();

  const allLessons = useMemo<readonly LessonLocation[]>(() => {
    const items: LessonLocation[] = [];
    for (const subject of subjects) {
      for (const chapter of subject.chapters) {
        for (const lesson of chapter.lessons) {
          items.push({ subject, chapter, lesson });
        }
      }
    }
    return items;
  }, [subjects]);

  const [selectedId, setSelectedId] = useState<string>(allLessons[0]?.lesson.id ?? '');
  const [loadedMap, setLoadedMap] = useState<Readonly<Record<string, CompiledLessonModule>>>({});
  const [loadError, setLoadError] = useState<string | null>(null);

  const activeLocation = useMemo(
    () => allLessons.find((item) => item.lesson.id === selectedId) ?? allLessons[0],
    [allLessons, selectedId],
  );

  const activeLessonId = activeLocation?.lesson.id;
  const compiled = activeLessonId ? loadedMap[activeLessonId] : undefined;

  useEffect(() => {
    if (!activeLessonId || loadedMap[activeLessonId]) {
      return;
    }

    let cancelled = false;
    loadLessonModule(activeLessonId)
      .then((mod) => {
        if (!cancelled) {
          setLoadedMap((prev) => ({ ...prev, [activeLessonId]: mod }));
          setLoadError(null);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Không tải được bài học MDX');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeLessonId, loadedMap]);

  const themeId: SubjectThemeId =
    activeLocation && isSubjectThemeId(activeLocation.subject.slug)
      ? activeLocation.subject.slug
      : 'default';

  return (
    <SubjectThemeProvider subject={themeId} className="space-y-10 pb-16">
      <FadeIn className="space-y-4">
        <Breadcrumb
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Content Engine & MDX Preview (/dev/mdx)' },
          ]}
        />

        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-6 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="subject">Giai đoạn 2</Badge>
              <Badge variant="neutral">MDX + KaTeX + Zod Manifest</Badge>
              <Badge variant="neutral">3 bộ đếm Chương.Bài.Số</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900">
              Content Engine & Academic MDX
            </h1>
            <p className="max-w-2xl text-sm text-stone-600">
              Kiểm thử trực quan pipeline biên dịch MDX, công thức KaTeX, đánh số định lý tự động
              theo quy tắc Chương.Bài.Số và 18 component học thuật.
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label="Chọn bài học mẫu"
          >
            {allLessons.map(({ subject, chapter, lesson }) => {
              const isSelected = lesson.id === activeLocation?.lesson.id;
              return (
                <Button
                  key={lesson.id}
                  variant={isSelected ? 'subject' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedId(lesson.id)}
                >
                  <span>
                    {subject.shortTitle} · Bài {chapter.number}.{lesson.number}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {activeLocation ? (
        <div className="grid gap-8 lg:grid-cols-12">
          <aside className="space-y-6 lg:col-span-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="subject">{activeLocation.subject.title}</Badge>
                  <Badge variant={activeLocation.lesson.status}>
                    {activeLocation.lesson.status}
                  </Badge>
                </div>
                <CardTitle className="mt-2">
                  Chương {activeLocation.chapter.number}.{activeLocation.lesson.number} —{' '}
                  {activeLocation.lesson.title}
                </CardTitle>
                <CardDescription>{activeLocation.lesson.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <FileCode2 className="h-4 w-4 text-stone-400" aria-hidden="true" />
                  <code className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-stone-800">
                    {activeLocation.lesson.file}
                  </code>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-stone-400" aria-hidden="true" />
                  <span>Thời lượng dự kiến: {activeLocation.lesson.estimatedMinutes} phút</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-stone-400" aria-hidden="true" />
                  <span>Mức độ: {activeLocation.lesson.level}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeLocation.lesson.tags.map((tag) => (
                    <Badge key={tag} variant="neutral">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Hash className="text-subject-600 h-4 w-4" aria-hidden="true" />
                  <CardTitle className="text-sm">
                    Bảng đánh số tự động ({compiled?.lessonMeta.blocks.length ?? 0} khối)
                  </CardTitle>
                </div>
                <CardDescription>
                  Xuất tự động từ <code className="font-mono">remark-theorem-numbering</code>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {compiled ? (
                  <ul className="space-y-2 text-xs">
                    {compiled.lessonMeta.blocks.map((block) => {
                      const spec = NUMBERED_BLOCKS[block.name];
                      return (
                        <li
                          key={block.anchorId}
                          className="flex items-start justify-between gap-2 rounded-lg border border-stone-200/80 bg-stone-50/70 px-3 py-2"
                        >
                          <div className="space-y-0.5">
                            <a
                              href={`#${block.anchorId}`}
                              className="text-subject-700 font-semibold hover:underline"
                            >
                              {block.label}
                            </a>
                            {block.title && <p className="text-stone-600">{block.title}</p>}
                          </div>
                          <Badge variant="neutral" className="shrink-0 font-mono text-[10px]">
                            {spec.counter}
                          </Badge>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                )}
              </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-8">
            <Card className="p-6 sm:p-8">
              <div className="mb-6 border-b border-stone-200 pb-5">
                <div className="text-subject-700 mb-2 flex items-center gap-2 text-xs font-medium">
                  <BookOpen className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {activeLocation.subject.title} · Chương {activeLocation.chapter.number}:{' '}
                    {activeLocation.chapter.title}
                  </span>
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-stone-900">
                  Bài {activeLocation.chapter.number}.{activeLocation.lesson.number}:{' '}
                  {activeLocation.lesson.title}
                </h2>
              </div>

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
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <Card className="p-6 text-sm text-stone-600">
          Chưa có bài học nào trong manifest hiện tại.
        </Card>
      )}
    </SubjectThemeProvider>
  );
}
