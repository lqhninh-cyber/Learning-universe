import type { ManifestSubject } from '@schemas/index';
import { CheckCircle2, Circle, Layers } from 'lucide-react';
import { Link } from 'react-router';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface LessonSidebarProps {
  readonly subject: ManifestSubject;
  readonly activeLessonId: string;
  readonly onSelectLesson?: () => void;
  readonly className?: string;
}

export function LessonSidebar({
  subject,
  activeLessonId,
  onSelectLesson,
  className,
}: LessonSidebarProps) {
  const completedLessons = useLearningStore((state) => state.completedLessons);

  return (
    <nav
      aria-label={`Danh sách bài học môn ${subject.title}`}
      className={cn('space-y-5', className)}
    >
      <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
        <Link
          to={ROUTES.subjectOverview(subject.slug)}
          className="text-subject-700 hover:text-subject-900 inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase"
        >
          <Layers className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{subject.title}</span>
        </Link>
      </div>

      <div className="space-y-4">
        {subject.chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-1.5">
            <p className="px-2 text-xs font-semibold text-stone-500">
              Chương {chapter.number}: {chapter.title}
            </p>
            <ul className="space-y-1">
              {chapter.lessons.map((lesson) => {
                const isActive = lesson.id === activeLessonId;
                const isCompleted = Boolean(completedLessons[lesson.id]);

                return (
                  <li key={lesson.id}>
                    <Link
                      to={ROUTES.lesson(subject.slug, chapter.slug, lesson.slug)}
                      onClick={onSelectLesson}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-start gap-2.5 rounded-xl px-3 py-2 text-xs leading-snug transition-colors',
                        isActive
                          ? 'bg-subject-100/80 text-subject-950 font-semibold'
                          : 'text-stone-700 hover:bg-stone-100/80 hover:text-stone-900',
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600"
                          aria-label="Đã hoàn thành"
                        />
                      ) : (
                        <Circle
                          className={cn(
                            'mt-0.5 h-3.5 w-3.5 shrink-0',
                            isActive ? 'text-subject-600' : 'text-stone-300',
                          )}
                          aria-hidden="true"
                        />
                      )}
                      <span>
                        <span className="text-subject-700 font-mono text-[11px]">
                          {chapter.number}.{lesson.number}
                        </span>{' '}
                        {lesson.title}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
