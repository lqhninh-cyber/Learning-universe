import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Bookmark, CheckCircle2, FileEdit, UserCheck, X } from 'lucide-react';
import { Button } from '@/shared/ui';
import { type PendingLearningActionType, useLearningStore } from './learning-store';

const ACTION_LABELS: Record<
  PendingLearningActionType,
  {
    readonly title: string;
    readonly description: string;
    readonly Icon: typeof CheckCircle2;
  }
> = {
  complete: {
    title: 'Lưu tiến độ hoàn thành bài học',
    description:
      'Đánh dấu bài học đã hoàn thành để theo dõi tiến độ theo từng chương và đồng bộ dữ liệu học tập cá nhân.',
    Icon: CheckCircle2,
  },
  bookmark: {
    title: 'Lưu vào danh sách bài học yêu thích',
    description:
      'Lưu lại các bài học quan trọng để ôn tập nhanh trước kỳ thi hoặc tra cứu lại các định lý cốt lõi.',
    Icon: Bookmark,
  },
  note: {
    title: 'Ghi chú cá nhân theo bài học',
    description:
      'Viết nhận xét, ý tưởng chứng minh hoặc tóm tắt riêng của bạn ngay bên cạnh nội dung bài học.',
    Icon: FileEdit,
  },
};

export function LoginPromptDialog() {
  const pendingAction = useLearningStore((state) => state.pendingPromptAction);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);
  const dismissPrompt = useLearningStore((state) => state.dismissPrompt);

  const open = pendingAction !== null;
  const meta = pendingAction ? ACTION_LABELS[pendingAction.type] : ACTION_LABELS.complete;
  const IconComponent = meta.Icon;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(isOpen) => !isOpen && dismissPrompt()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/40 backdrop-blur-xs" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-white p-6 shadow-xl focus:outline-none">
          <div className="flex items-start justify-between gap-4">
            <div className="bg-subject-50 text-subject-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <IconComponent className="h-5 w-5" aria-hidden="true" />
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Đóng hộp thoại"
                className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Title className="mt-4 text-lg font-semibold text-stone-900">
            {meta.title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-stone-600">
            {meta.description}
          </DialogPrimitive.Description>

          <div className="mt-4 rounded-xl border border-stone-200/80 bg-stone-50 p-3.5 text-xs leading-relaxed text-stone-600">
            Theo <strong className="font-semibold text-stone-800">Quyết định D1</strong>, khách chưa
            đăng nhập được đọc toàn bộ lý thuyết, định nghĩa, định lý và chứng minh công khai. Khi
            kích hoạt chế độ học viên, thao tác vừa chọn sẽ được hoàn tất ngay lập tức.
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" size="sm" onClick={dismissPrompt}>
              Để sau (Chế độ Khách)
            </Button>
            <Button
              variant="subject"
              size="sm"
              onClick={() => enableLearnerMode()}
              className="gap-1.5"
            >
              <UserCheck className="h-4 w-4" aria-hidden="true" />
              <span>Kích hoạt Chế độ Học viên</span>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
