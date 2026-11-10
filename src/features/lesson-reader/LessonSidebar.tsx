import type { ManifestSubject } from '@schemas/index';
import { CheckCircle2, Circle, Layers, PanelLeftClose } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import type { ReadingTheme } from '@/context/ReadingSettingsContext';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface LessonSidebarProps {
  readonly subject: ManifestSubject;
  readonly activeLessonId: string;
  readonly onSelectLesson?: () => void;
  readonly onToggleCollapse?: () => void;
  readonly readingTheme?: ReadingTheme;
  readonly className?: string;
}

export function LessonSidebar({
  subject,
  activeLessonId,
  onSelectLesson,
  onToggleCollapse,
  readingTheme: propTheme,
  className,
}: LessonSidebarProps) {
  const completedLessons = useLearningStore((state) => state.completedLessons);

  const [internalTheme, setInternalTheme] = useState<ReadingTheme>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light' || saved === 'sepia') return saved;
      } catch {
        // Bỏ qua lỗi storage
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (propTheme) return;
    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<ReadingTheme>;
      if (custom.detail === 'light' || custom.detail === 'dark' || custom.detail === 'sepia') {
        setInternalTheme(custom.detail);
      } else {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light' || saved === 'sepia') {
          setInternalTheme(saved);
        }
      }
    };
    window.addEventListener('lu_reading_theme_change', handleThemeChange);
    return () => window.removeEventListener('lu_reading_theme_change', handleThemeChange);
  }, [propTheme]);

  const activeTheme = propTheme ?? internalTheme;
  const isDark = activeTheme === 'dark';

  return (
    <nav
      aria-label={`Danh sách bài học môn ${subject.title}`}
      className={cn(
        'space-y-4 transition-colors',
        isDark ? 'bg-[#181C20] text-[#E2E8F0]' : 'bg-[#E1E9EA] text-[#29383D]',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between border-b pb-3',
          isDark ? 'border-[#2A323A]' : 'border-[#CFDADB]',
        )}
      >
        <Link
          to={ROUTES.subjectOverview(subject.slug)}
          className={cn(
            'inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase transition-colors',
            isDark
              ? 'text-[#E2E8F0] hover:text-[#F8FAFC]'
              : 'text-subject-700 hover:text-subject-900',
          )}
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
            className={cn(
              'flex cursor-pointer items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium shadow-2xs transition-colors',
              isDark
                ? 'border-[#2A323A] bg-[#20252B] text-[#94A3B8] hover:bg-[#242C33] hover:text-[#F8FAFC]'
                : 'border-[#CFDADB] bg-[#F7FAFA] text-[#55676B] hover:bg-white hover:text-[#29383D]',
            )}
          >
            <PanelLeftClose
              className={cn('h-3.5 w-3.5', isDark ? 'text-[#94A3B8]' : 'text-[#55676B]')}
              aria-hidden="true"
            />
            <span>Thu gọn</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {subject.chapters.map((chapter) => {
          const formattedChapterHeading = /^(Chương|Chuyên đề|Khối)/i.test(chapter.title)
            ? chapter.title
            : `Chương ${chapter.number}: ${chapter.title}`;

          return (
            <div key={chapter.id} className="space-y-1.5">
              <p
                className={cn(
                  'px-2 font-mono text-xs uppercase',
                  isDark ? 'text-[#94A3B8]' : 'font-semibold text-[#55676B]',
                )}
              >
                {formattedChapterHeading}
              </p>
              <ul className="space-y-1">
                {chapter.lessons.map((lesson) => {
                  const isActive = lesson.id === activeLessonId;
                  const isCompleted = Boolean(completedLessons[lesson.id]);
                  const strippedLessonTitle = lesson.title.replace(
                    /^(?:Bài\s+\d+(?:\.\d+)?|Thực hành\s+\d+|Chuyên đề\s+\d+(?:\.\d+)?)\s*:\s*/i,
                    '',
                  );
                  const lessonNumberBadge = /^Thực hành/i.test(lesson.title)
                    ? `TH.${lesson.number}`
                    : `${chapter.number}.${lesson.number}`;

                  return (
                    <li key={lesson.id}>
                      <Link
                        to={ROUTES.lesson(subject.slug, chapter.slug, lesson.slug)}
                        onClick={onSelectLesson}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          'flex items-start gap-2.5 rounded-xl px-3 py-2 text-[14.5px] leading-normal transition-colors',
                          isDark
                            ? isActive
                              ? 'border-l-2 border-[#C89738] bg-[#242C33] font-medium text-[#F8FAFC]'
                              : 'text-[#CBD5E1] hover:bg-[#20252B] hover:text-white'
                            : isActive
                              ? 'bg-subject-100/80 text-subject-950 font-semibold'
                              : 'text-[#55676B] hover:bg-[#D7E1E2] hover:text-[#29383D]',
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle2
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500"
                            aria-label="Đã hoàn thành"
                          />
                        ) : (
                          <Circle
                            className={cn(
                              'mt-0.5 h-3.5 w-3.5 shrink-0',
                              isDark
                                ? isActive
                                  ? 'text-[#C89738]'
                                  : 'text-[#64748B]'
                                : isActive
                                  ? 'text-subject-600'
                                  : 'text-stone-300',
                            )}
                            aria-hidden="true"
                          />
                        )}
                        <span>
                          <span
                            className={cn(
                              'font-mono text-xs',
                              isDark
                                ? isActive
                                  ? 'font-semibold text-[#F8FAFC]'
                                  : 'font-medium text-[#C89738]'
                                : 'text-subject-700 font-semibold',
                            )}
                          >
                            {lessonNumberBadge}
                          </span>{' '}
                          {strippedLessonTitle}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
