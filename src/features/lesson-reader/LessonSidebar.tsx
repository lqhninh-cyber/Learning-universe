import type { ManifestSubject } from '@schemas/index';
import { CheckCircle2, Circle, Layers, PanelLeftClose } from 'lucide-react';
import { Link } from 'react-router';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface LessonSidebarProps {
  readonly subject: ManifestSubject;
  readonly activeLessonId: string;
  readonly onSelectLesson?: () => void;
  readonly onToggleCollapse?: () => void;
  readonly className?: string;
}

export function LessonSidebar({
  subject,
  activeLessonId,
  onSelectLesson,
  onToggleCollapse,
  className,
}: LessonSidebarProps) {
  const completedLessons = useLearningStore((state) => state.completedLessons);

  return (
    <nav
      aria-label={`Danh sách bài học môn ${subject.title}`}
      className={cn('space-y-4 bg-[#E1E9EA] text-[#29383D]', className)}
    >
      <div className="flex items-center justify-between border-b border-[#CFDADB] pb-3">
        <Link
          to={ROUTES.subjectOverview(subject.slug)}
          className="text-subject-700 hover:text-subject-900 inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase transition-colors"
        >
          <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="max-w-[155px] truncate">{subject.title}</span>
        </Link>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Thu gọn sidebar (Chế độ đọc tập trung)"
            aria-label="Thu gọn sidebar"
            className="flex cursor-pointer items-center gap-1 rounded-md border border-[#CFDADB] bg-[#F7FAFA] px-2 py-1 text-[11px] font-medium text-[#55676B] shadow-2xs transition-colors hover:bg-white hover:text-[#29383D]"
          >
            <PanelLeftClose className="h-3.5 w-3.5 text-[#55676B]" aria-hidden="true" />
            <span>Thu gọn</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {subject.chapters.map((chapter) => (
          <div key={chapter.id} className="space-y-1.5">
            <p className="px-2 text-xs font-semibold text-[#55676B]">
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
                        'flex items-start gap-2.5 rounded-xl px-3 py-2 text-[14.5px] leading-normal transition-colors',
                        isActive
                          ? 'bg-subject-100/80 text-subject-950 font-semibold'
                          : 'text-[#55676B] hover:bg-[#D7E1E2] hover:text-[#29383D]',
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
                        <span className="text-subject-700 font-mono text-xs font-semibold">
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
