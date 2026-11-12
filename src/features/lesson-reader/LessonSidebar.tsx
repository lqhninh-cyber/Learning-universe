import type { ManifestSubject } from '@schemas/index';
import { CheckCircle2, ChevronDown, Layers, PanelLeftClose } from 'lucide-react';
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

  const activeChapterId = subject.chapters.find((chapter) =>
    chapter.lessons.some((lesson) => lesson.id === activeLessonId),
  )?.id;

  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    if (activeChapterId) {
      initial[activeChapterId] = true;
    } else if (subject.chapters[0]) {
      initial[subject.chapters[0].id] = true;
    }
    return initial;
  });

  const [prevActiveChapterId, setPrevActiveChapterId] = useState(activeChapterId);
  if (activeChapterId && activeChapterId !== prevActiveChapterId) {
    setPrevActiveChapterId(activeChapterId);
    setOpenChapters((prev) => ({
      ...prev,
      [activeChapterId]: true,
    }));
  }

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  return (
    <nav
      aria-label={`Danh sách bài học môn ${subject.title}`}
      className={cn(
        'space-y-3 transition-colors',
        isDark
          ? 'bg-[#12241C] text-[#ECE8DF]'
          : activeTheme === 'sepia'
            ? 'bg-[#FBF8EF] text-[#231F18]'
            : 'bg-[var(--bg-surface)] text-[#18221D]',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-start justify-between gap-2 border-b pb-3',
          isDark
            ? 'border-[#1E3B2E]'
            : activeTheme === 'sepia'
              ? 'border-[#DECDB0]'
              : 'border-[var(--border-subtle)]',
        )}
      >
        <Link
          to={ROUTES.subjectOverview(subject.slug)}
          className={cn(
            'flex min-w-0 flex-1 items-start gap-2 pt-0.5 transition-colors',
            isDark
              ? 'text-[#ECE8DF] hover:text-white'
              : 'text-[var(--text-primary)] hover:text-[#1B3D2F]',
          )}
        >
          <Layers
            className={cn('mt-0.5 h-4 w-4 shrink-0', isDark ? 'text-[#86EFAC]' : 'text-[#25694C]')}
            aria-hidden="true"
          />
          <span className="line-clamp-2 text-[13px] leading-snug font-bold tracking-wider uppercase">
            {subject.title}
          </span>
        </Link>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Thu gọn mục lục"
            aria-label="Thu gọn mục lục"
            className={cn(
              'flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors',
              isDark
                ? 'text-[#A7B5AC] hover:bg-white/10 hover:text-[#ECE8DF]'
                : 'text-[#4A5851] hover:bg-black/5 hover:text-[#18221D]',
            )}
          >
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="space-y-2">
        {subject.chapters.map((chapter) => {
          const isOpen = Boolean(openChapters[chapter.id]);
          const formattedChapterHeading = /^(Chương|Chuyên đề|Khối)/i.test(chapter.title)
            ? chapter.title
            : `Chương ${chapter.number}: ${chapter.title}`;

          return (
            <div key={chapter.id} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                aria-expanded={isOpen}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-[12px] leading-snug font-bold tracking-wider uppercase transition-colors',
                  isDark
                    ? 'text-[#A7B5AC] hover:bg-white/[0.05] hover:text-[#ECE8DF]'
                    : 'text-[var(--text-secondary)] hover:bg-black/[0.03] hover:text-[#18221D]',
                )}
              >
                <span className="min-w-0 flex-1">{formattedChapterHeading}</span>
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {isOpen && (
                <ul className="space-y-1 pb-1">
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
                            'flex items-start gap-2.5 rounded-xl border-l-[3px] px-3 py-2.5 text-[14.5px] leading-snug transition-colors',
                            isDark
                              ? isActive
                                ? 'border-[#4E9B58] bg-[#4E9B58]/20 font-semibold text-[#86EFAC]'
                                : 'border-transparent text-[#CBD5E1] hover:bg-white/[0.06] hover:text-[#ECE8DF]'
                              : isActive
                                ? 'border-[#1B3D2F] bg-[#1B3D2F]/10 font-semibold text-[#1B3D2F]'
                                : 'border-transparent text-[#3B4842] hover:bg-black/[0.04] hover:text-[#18221D]',
                          )}
                        >
                          {isCompleted ? (
                            <CheckCircle2
                              className={cn(
                                'mt-0.5 h-4 w-4 shrink-0',
                                isDark ? 'text-[#4E9B58]' : 'text-[#25694C]',
                              )}
                              aria-label="Đã hoàn thành"
                            />
                          ) : (
                            <span
                              className={cn(
                                'mt-[3px] inline-block h-3.5 w-3.5 shrink-0 rounded-full border-[1.5px]',
                                isActive
                                  ? isDark
                                    ? 'border-[#86EFAC] bg-[#4E9B58]/25'
                                    : 'border-[#1B3D2F] bg-[#1B3D2F]/15'
                                  : isDark
                                    ? 'border-stone-500'
                                    : 'border-stone-400',
                              )}
                              aria-hidden="true"
                            />
                          )}
                          <span className="min-w-0 flex-1">
                            <span
                              className={cn(
                                'font-mono text-xs font-semibold',
                                isDark
                                  ? isActive
                                    ? 'text-[#86EFAC]'
                                    : 'text-[#86EFAC]/80'
                                  : isActive
                                    ? 'text-[#1B3D2F]'
                                    : 'text-[#25694C]',
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
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}
