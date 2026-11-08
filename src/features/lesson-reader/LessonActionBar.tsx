import { BookOpenCheck, Bookmark, CheckCircle2, FileEdit } from 'lucide-react';
import { useLearningStore } from '@/features/learning';
import { cn } from '@/shared/lib/cn';

export interface LessonActionBarProps {
  readonly lessonId: string;
  readonly isNotesOpen: boolean;
  readonly onToggleNotes: () => void;
  readonly className?: string;
}

export function LessonActionBar({
  lessonId,
  isNotesOpen,
  onToggleNotes,
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

  const handleNoteClick = () => {
    if (requestNoteAccess(lessonId)) {
      onToggleNotes();
    }
  };

  const buttonBaseClass =
    'whitespace-nowrap px-3.5 py-1.5 rounded-xl border border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-stone-800/80 text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-2 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer shadow-2xs';

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
            'border-[#3F6570] bg-[#3F6570] text-white hover:bg-[#345761] dark:border-[#3F6570] dark:bg-[#3F6570] dark:text-white',
        )}
      >
        <CheckCircle2
          className={cn('h-4 w-4 shrink-0', isCompleted ? 'text-white' : 'text-[#3F6570]')}
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
            'border-[#3F6570] bg-[#3F6570]/10 text-[#3F6570] hover:bg-[#3F6570]/20 dark:border-[#3F6570] dark:bg-[#3F6570]/20 dark:text-teal-300',
        )}
      >
        <FileEdit
          className={cn('h-4 w-4 shrink-0', hasNote ? 'text-[#3F6570]' : 'text-stone-400')}
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
            'border-[#5E786D] bg-[#5E786D]/10 text-[#5E786D] hover:bg-[#5E786D]/20 dark:border-[#5E786D] dark:bg-[#5E786D]/20 dark:text-emerald-300',
        )}
      >
        <BookOpenCheck
          className={cn(
            'h-4 w-4 shrink-0',
            glossaryAnnotationsEnabled ? 'text-[#5E786D]' : 'text-stone-400',
          )}
          aria-hidden="true"
        />
        <span>{glossaryAnnotationsEnabled ? 'Thuật ngữ: Bật' : 'Thuật ngữ: Tắt'}</span>
      </button>
    </div>
  );
}
