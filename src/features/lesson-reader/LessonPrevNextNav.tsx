import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { getAdjacentLessons } from '@/content-runtime';
import { ROUTES } from '@/shared/config/routes';

export interface LessonPrevNextNavProps {
  readonly subjectSlug: string;
  readonly lessonId: string;
}

export function LessonPrevNextNav({ subjectSlug, lessonId }: LessonPrevNextNavProps) {
  const { previous, next } = getAdjacentLessons(subjectSlug, lessonId);

  if (!previous && !next) {
    return null;
  }

  return (
    <nav
      aria-label="Điều hướng bài học trước và tiếp theo"
      className="mt-10 grid gap-4 border-t border-stone-200 pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          to={ROUTES.lesson(previous.subject.slug, previous.chapter.slug, previous.lesson.slug)}
          className="group hover:border-subject-300 hover:bg-subject-50/35 flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-5 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span>Bài trước</span>
          </span>
          <span className="group-hover:text-subject-800 mt-2 text-sm font-semibold text-stone-900">
            Bài {previous.chapter.number}.{previous.lesson.number}: {previous.lesson.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          to={ROUTES.lesson(next.subject.slug, next.chapter.slug, next.lesson.slug)}
          className="group hover:border-subject-300 hover:bg-subject-50/35 flex flex-col items-end justify-between rounded-2xl border border-stone-200/90 bg-white p-5 text-right transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500">
            <span>Bài tiếp theo</span>
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
          <span className="group-hover:text-subject-800 mt-2 text-sm font-semibold text-stone-900">
            Bài {next.chapter.number}.{next.lesson.number}: {next.lesson.title}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
