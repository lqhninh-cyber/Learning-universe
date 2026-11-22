import { FileEdit, Save, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { useIsland } from '@/context/IslandContext';
import { useLearningStore } from '@/features/learning';
import { Button, Card } from '@/shared/ui';

export interface LessonNotesPanelProps {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly onClose?: () => void;
}

export function LessonNotesPanel({ lessonId, lessonTitle, onClose }: LessonNotesPanelProps) {
  const existingNote = useLearningStore((state) => state.lessonNotes[lessonId]);
  const saveLessonNote = useLearningStore((state) => state.saveLessonNote);
  const { triggerIslandNotice } = useIsland();

  const [draft, setDraft] = useState(existingNote?.body ?? '');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (saveLessonNote(lessonId, draft)) {
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
      triggerIslandNotice({
        text: draft.trim() ? `Đã lưu ghi chú · ${lessonTitle}` : `Đã xóa ghi chú · ${lessonTitle}`,
        type: draft.trim() ? 'success' : 'info',
      });
    }
  };

  const handleClear = () => {
    setDraft('');
    if (saveLessonNote(lessonId, '')) {
      triggerIslandNotice({
        text: `Đã xóa ghi chú · ${lessonTitle}`,
        type: 'info',
      });
    }
  };

  return (
    <Card
      aria-label={`Ghi chú cá nhân cho bài ${lessonTitle}`}
      className="border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 text-[var(--text-main)]"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
            <FileEdit
              className="text-subject-600 h-4 w-4 dark:text-[var(--accent-os)]"
              aria-hidden="true"
            />
            <span>Ghi chú cá nhân: {lessonTitle}</span>
          </div>
          {existingNote?.updatedAt && (
            <span className="text-xs text-[var(--text-muted)]">
              Cập nhật lần cuối: {new Date(existingNote.updatedAt).toLocaleTimeString('vi-VN')}
            </span>
          )}
        </div>

        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={4}
          maxLength={10000}
          placeholder="Ghi lại ý tưởng chứng minh, câu hỏi cần trao đổi hoặc tóm tắt của riêng bạn..."
          aria-label="Nội dung ghi chú cá nhân"
          className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3 text-sm leading-relaxed text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-os)] focus:outline-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button type="submit" variant="subject" size="sm">
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Lưu ghi chú</span>
            </Button>
            {draft.trim().length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Xóa</span>
              </Button>
            )}
            {onClose && (
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Ẩn khung ghi chú
              </Button>
            )}
          </div>

          {savedFeedback && (
            <span
              role="status"
              className="text-xs font-medium text-emerald-700 dark:text-emerald-400"
            >
              Đã lưu ghi chú thành công
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
