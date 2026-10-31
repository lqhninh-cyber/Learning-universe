import { FileEdit, Save, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
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

  const [draft, setDraft] = useState(existingNote?.body ?? '');
  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (saveLessonNote(lessonId, draft)) {
      setSavedFeedback(true);
      setTimeout(() => setSavedFeedback(false), 2000);
    }
  };

  const handleClear = () => {
    setDraft('');
    saveLessonNote(lessonId, '');
  };

  return (
    <Card
      aria-label={`Ghi chú cá nhân cho bài ${lessonTitle}`}
      className="border-subject-200 bg-subject-50/35 p-5"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
            <FileEdit className="text-subject-600 h-4 w-4" aria-hidden="true" />
            <span>Ghi chú cá nhân: {lessonTitle}</span>
          </div>
          {existingNote?.updatedAt && (
            <span className="text-xs text-stone-500">
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
          className="focus:border-subject-500 w-full rounded-xl border border-stone-200 bg-white p-3 text-sm leading-relaxed text-stone-900 placeholder:text-stone-400 focus:outline-none"
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
            <span role="status" className="text-xs font-medium text-emerald-700">
              Đã lưu ghi chú thành công
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
