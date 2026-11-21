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
      className="mt-10 grid gap-4 border-t border-[var(--border-hairline)] pt-8 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          to={ROUTES.lesson(previous.subject.slug, previous.chapter.slug, previous.lesson.slug)}
          className="group flex min-w-0 flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-5 transition-colors hover:border-[var(--accent-os)]/50 hover:bg-[var(--bg-surface)]"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <span>Bài trước</span>
          </span>
          <span className="mt-2 text-sm font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-os)]">
            {/^(?:Bài|Thực hành|Chuyên đề)\s+\d/i.test(previous.lesson.title)
              ? previous.lesson.title
              : `Bài ${previous.chapter.number}.${previous.lesson.number}: ${previous.lesson.title}`}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {next ? (
        <Link
          to={ROUTES.lesson(next.subject.slug, next.chapter.slug, next.lesson.slug)}
          className="group flex min-w-0 flex-col items-end justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-5 text-right transition-colors hover:border-[var(--accent-os)]/50 hover:bg-[var(--bg-surface)]"
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)]">
            <span>Bài tiếp theo</span>
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </span>
          <span className="mt-2 text-sm font-semibold text-[var(--text-main)] group-hover:text-[var(--accent-os)]">
            {/^(?:Bài|Thực hành|Chuyên đề)\s+\d/i.test(next.lesson.title)
              ? next.lesson.title
              : `Bài ${next.chapter.number}.${next.lesson.number}: ${next.lesson.title}`}
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}
    </nav>
  );
}
