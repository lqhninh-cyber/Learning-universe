import { BookOpenCheck, Bookmark, CheckCircle2, FileEdit } from 'lucide-react';
import { useLearningStore } from '@/features/learning';
import { Button } from '@/shared/ui';

export interface LessonActionBarProps {
  readonly lessonId: string;
  readonly isNotesOpen: boolean;
  readonly onToggleNotes: () => void;
}

export function LessonActionBar({ lessonId, isNotesOpen, onToggleNotes }: LessonActionBarProps) {
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

  return (
    <div
      role="toolbar"
      aria-label="Thao tác học tập cá nhân"
      className="flex flex-wrap items-center gap-2.5"
    >
      <Button
        variant={isCompleted ? 'subject' : 'outline'}
        size="sm"
        onClick={() => toggleLessonCompleted(lessonId)}
        aria-pressed={isCompleted}
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        <span>{isCompleted ? 'Đã hoàn thành bài học' : 'Đánh dấu hoàn thành'}</span>
      </Button>

      <Button
        variant={isBookmarked ? 'subjectOutline' : 'outline'}
        size="sm"
        onClick={() => toggleLessonBookmark(lessonId)}
        aria-pressed={isBookmarked}
      >
        <Bookmark
          className={isBookmarked ? 'h-4 w-4 fill-current' : 'h-4 w-4'}
          aria-hidden="true"
        />
        <span>{isBookmarked ? 'Đã lưu bài học' : 'Lưu bài học'}</span>
      </Button>

      <Button
        variant={isNotesOpen || hasNote ? 'subjectOutline' : 'outline'}
        size="sm"
        onClick={handleNoteClick}
        aria-expanded={isNotesOpen}
      >
        <FileEdit className="h-4 w-4" aria-hidden="true" />
        <span>{hasNote ? 'Ghi chú (Đã có)' : 'Ghi chú cá nhân'}</span>
      </Button>

      <Button
        variant={glossaryAnnotationsEnabled ? 'subjectOutline' : 'outline'}
        size="sm"
        onClick={toggleGlossaryAnnotations}
        aria-pressed={glossaryAnnotationsEnabled}
        title={
          glossaryAnnotationsEnabled
            ? 'Đang bật chú thích thuật ngữ (nhấn để chuyển sang chế độ đọc tập trung)'
            : 'Đang tắt chú thích thuật ngữ (nhấn để bật chú thích tự động)'
        }
      >
        <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
        <span>{glossaryAnnotationsEnabled ? 'Thuật ngữ: Bật' : 'Thuật ngữ: Tắt'}</span>
      </Button>
    </div>
  );
}
