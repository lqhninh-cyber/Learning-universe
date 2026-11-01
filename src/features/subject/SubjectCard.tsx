import type { ManifestSubject } from '@schemas/index';
import { ArrowRight, BookOpen, Clock, Compass, Layers, PlayCircle, Sigma } from 'lucide-react';
import { Link } from 'react-router';
import { getLessonById, getSubjectStats } from '@/content-runtime';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { resolveSubjectThemeId } from '@/shared/theme/subject-themes';
import { SubjectThemeProvider } from '@/shared/theme/SubjectThemeProvider';
import {
  AffineGridMotif,
  AlgebraicSymmetryMotif,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ProgressRing,
} from '@/shared/ui';

export interface SubjectCardProps {
  readonly subject: ManifestSubject;
}

function SubjectIcon({ slug, icon }: { readonly slug?: string; readonly icon?: string }) {
  if (slug === 'cau-truc-dai-so' || icon === 'sigma') {
    return <AlgebraicSymmetryMotif className="h-3.5 w-3.5 text-current" />;
  }
  if (slug === 'hinh-hoc-affine' || icon === 'compass') {
    return <AffineGridMotif className="h-3.5 w-3.5 text-current" />;
  }
  if (icon === 'compass') {
    return <Compass className="h-3.5 w-3.5" aria-hidden="true" />;
  }
  if (icon === 'sigma') {
    return <Sigma className="h-3.5 w-3.5" aria-hidden="true" />;
  }
  return <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />;
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const themeId = resolveSubjectThemeId(subject.slug);
  const stats = getSubjectStats(subject);
  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisited = useLearningStore((state) => state.lastVisitedBySubject[subject.id]);

  const completedCount = subject.chapters.reduce(
    (sum, chapter) =>
      sum + chapter.lessons.filter((lesson) => Boolean(completedLessons[lesson.id])).length,
    0,
  );
  const progressValue =
    isAuthenticated && stats.lessonCount > 0
      ? Math.round((completedCount / stats.lessonCount) * 100)
      : 0;

  const lastVisitedLocation = lastVisited ? getLessonById(lastVisited.lessonId) : undefined;
  const targetLesson = lastVisitedLocation ?? stats.firstLesson;

  return (
    <SubjectThemeProvider subject={themeId} className="h-full">
      <Card
        accent="subjectTop"
        interactive
        className="border-vn-border/80 bg-vn-surface-card hover:border-vn-accent/60 flex h-full flex-col justify-between shadow-2xs transition-all duration-200 hover:shadow-md"
      >
        <div>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="subject">
                <SubjectIcon slug={subject.slug} icon={subject.theme.icon} />
                <span>{subject.title}</span>
              </Badge>
              <ProgressRing value={progressValue} size={38} strokeWidth={3.5} />
            </div>
            <CardTitle className="mt-2 text-xl font-bold">
              <Link
                to={ROUTES.subjectOverview(subject.slug)}
                className="text-vn-text hover:text-subject-700 transition-colors"
              >
                {subject.title}
              </Link>
            </CardTitle>
            <CardDescription className="text-vn-muted leading-relaxed">
              {subject.description}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-vn-muted flex flex-wrap items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="text-vn-accent h-3.5 w-3.5" aria-hidden="true" />
                <span>{stats.chapterCount} chương</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="text-vn-accent h-3.5 w-3.5" aria-hidden="true" />
                <span>{stats.lessonCount} bài học</span>
              </span>
              {stats.totalMinutes > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="text-vn-accent h-3.5 w-3.5" aria-hidden="true" />
                  <span>~{stats.totalMinutes} phút</span>
                </span>
              )}
            </div>

            {stats.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {stats.tags.slice(0, 5).map((tag) => (
                  <Badge
                    key={tag}
                    variant="neutral"
                    className="border-vn-border/60 bg-vn-bg text-vn-text text-[11px] font-normal"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {isAuthenticated && stats.lessonCount > 0 && (
              <p className="text-subject-700 text-xs font-medium">
                Đã hoàn thành {completedCount}/{stats.lessonCount} bài học ({progressValue}%)
              </p>
            )}
          </CardContent>
        </div>

        <CardFooter className="flex-wrap gap-3">
          <Link
            to={ROUTES.subjectOverview(subject.slug)}
            className="text-subject-700 hover:text-subject-900 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors"
          >
            <span>Vào không gian môn học</span>
            <ArrowRight className="text-subject-600 h-4 w-4" aria-hidden="true" />
          </Link>

          {targetLesson && (
            <Link
              to={ROUTES.lesson(
                targetLesson.subject.slug,
                targetLesson.chapter.slug,
                targetLesson.lesson.slug,
              )}
              className="border-vn-border bg-vn-surface/70 text-vn-text hover:border-vn-accent hover:bg-vn-surface inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors"
            >
              <PlayCircle className="text-vn-primary h-3.5 w-3.5" aria-hidden="true" />
              <span>
                {lastVisitedLocation ? 'Tiếp tục' : 'Bài'} {targetLesson.chapter.number}.
                {targetLesson.lesson.number}
              </span>
            </Link>
          )}
        </CardFooter>
      </Card>
    </SubjectThemeProvider>
  );
}
