import { BookOpenCheck, Bookmark, CheckCircle2, FileEdit } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReadingTheme } from '@/context/ReadingSettingsContext';
import { useLearningStore } from '@/features/learning';
import { cn } from '@/shared/lib/cn';

export interface LessonActionBarProps {
  readonly lessonId: string;
  readonly isNotesOpen: boolean;
  readonly onToggleNotes: () => void;
  readonly readingTheme?: ReadingTheme;
  readonly onToggleReadingTheme?: () => void;
  readonly className?: string;
}

export function LessonActionBar({
  lessonId,
  isNotesOpen,
  onToggleNotes,
  readingTheme: propTheme,
  className,
}: LessonActionBarProps) {
  const isCompleted = useLearningStore((state) => Boolean(state.completedLessons[lessonId]));
  const isBookmarked = useLearningStore((state) => Boolean(state.bookmarkedLessons[lessonId]));
  const hasNote = useLearningStore((state) => Boolean(state.lessonNotes[lessonId]?.body));
  const glossaryAnnotationsEnabled = useLearningStore((state) => state.glossaryAnnotationsEnabled);
  const toggleLessonCompleted = useLearningStore((state) => state.toggleLessonCompleted);
  const toggleLessonBookmark = useLearningStore((state) => state.toggleLessonBookmark);
  const toggleGlossaryAnnotations = useLearningStore((state) => state.toggleGlossaryAnnotations);
  const requestNoteAccess = useLearningStore((state) => state.requestNoteAccess);

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
    if (propTheme) {
      return;
    }
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

  const handleNoteClick = () => {
    if (requestNoteAccess(lessonId)) {
      onToggleNotes();
    }
  };

  const buttonBaseClass = cn(
    'whitespace-nowrap px-3.5 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-2xs',
    isDark
      ? 'border-[#2D3339] bg-[#1C2024] text-[#E2E8F0] hover:bg-[#23292F] hover:text-white'
      : 'border-[#CFDADB] bg-[#F7FAFA] text-[#29383D] hover:bg-[#E1E9EA]',
  );

  return (
    <div
      role="toolbar"
      aria-label="Thao tác học tập cá nhân"
      className={cn('flex flex-wrap items-center gap-2.5', className)}
    >
      <button
        type="button"
        onClick={() => toggleLessonCompleted(lessonId)}
        aria-pressed={isCompleted}
        aria-label={isCompleted ? 'Đã hoàn thành bài học' : 'Đánh dấu hoàn thành'}
        className={cn(
          buttonBaseClass,
          isCompleted &&
            (isDark
              ? 'border-[#5E8A75] bg-[#5E8A75] text-white hover:bg-[#4d7362]'
              : 'border-[#3F6570] bg-[#3F6570] text-white hover:bg-[#345761]'),
        )}
      >
        <CheckCircle2
          className={cn(
            'h-4 w-4 shrink-0',
            isCompleted ? 'text-white' : isDark ? 'text-[#5E8A75]' : 'text-[#3F6570]',
          )}
          aria-hidden="true"
        />
        <span>{isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}</span>
      </button>

      <button
        type="button"
        onClick={() => toggleLessonBookmark(lessonId)}
        aria-pressed={isBookmarked}
        aria-label={isBookmarked ? 'Đã lưu bài học' : 'Lưu bài học'}
        className={cn(
          buttonBaseClass,
          isBookmarked &&
            'border-[#92714F] bg-[#92714F]/10 text-[#92714F] hover:bg-[#92714F]/20 dark:border-[#92714F] dark:bg-[#92714F]/20 dark:text-amber-300',
        )}
      >
        <Bookmark
          className={cn(
            'h-4 w-4 shrink-0',
            isBookmarked ? 'fill-current text-[#92714F]' : 'text-stone-400',
          )}
          aria-hidden="true"
        />
        <span>{isBookmarked ? 'Đã lưu bài' : 'Lưu bài'}</span>
      </button>

      <button
        type="button"
        onClick={handleNoteClick}
        aria-expanded={isNotesOpen}
        aria-label={hasNote ? 'Ghi chú cá nhân (Đã có)' : 'Ghi chú cá nhân'}
        className={cn(
          buttonBaseClass,
          (isNotesOpen || hasNote) &&
            (isDark
              ? 'border-[#5E8A75] bg-[#5E8A75]/20 text-emerald-300 hover:bg-[#5E8A75]/30'
              : 'border-[#3F6570] bg-[#3F6570]/10 text-[#3F6570] hover:bg-[#3F6570]/20'),
        )}
      >
        <FileEdit
          className={cn(
            'h-4 w-4 shrink-0',
            hasNote ? (isDark ? 'text-emerald-300' : 'text-[#3F6570]') : 'text-stone-400',
          )}
          aria-hidden="true"
        />
        <span>{hasNote ? 'Ghi chú (Đã có)' : 'Ghi chú'}</span>
      </button>

      <button
        type="button"
        onClick={toggleGlossaryAnnotations}
        aria-pressed={glossaryAnnotationsEnabled}
        aria-label={glossaryAnnotationsEnabled ? 'Thuật ngữ: Bật' : 'Thuật ngữ: Tắt'}
        title={
          glossaryAnnotationsEnabled
            ? 'Đang bật chú thích thuật ngữ (nhấn để chuyển sang chế độ đọc tập trung)'
            : 'Đang tắt chú thích thuật ngữ (nhấn để bật chú thích tự động)'
        }
        className={cn(
          buttonBaseClass,
          glossaryAnnotationsEnabled &&
            (isDark
              ? 'border-[#5E8A75] bg-[#5E8A75]/20 text-[#5E8A75] hover:bg-[#5E8A75]/30'
              : 'border-[#5E786D] bg-[#5E786D]/10 text-[#5E786D] hover:bg-[#5E786D]/20'),
        )}
      >
        <BookOpenCheck
          className={cn(
            'h-4 w-4 shrink-0',
            glossaryAnnotationsEnabled
              ? isDark
                ? 'text-[#5E8A75]'
                : 'text-[#5E786D]'
              : 'text-stone-400',
          )}
          aria-hidden="true"
        />
        <span>{glossaryAnnotationsEnabled ? 'Thuật ngữ: Bật' : 'Thuật ngữ: Tắt'}</span>
      </button>
    </div>
  );
}
