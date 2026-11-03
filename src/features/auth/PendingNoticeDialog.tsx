import * as DialogPrimitive from '@radix-ui/react-dialog';
import { BookOpen, Clock, LogOut, X } from 'lucide-react';
import { Badge, Button } from '@/shared/ui';
import { useAuth } from './useAuth';

export function PendingNoticeDialog() {
  const { user, isPendingNoticeOpen, closePendingNotice, signOut } = useAuth();

  return (
    <DialogPrimitive.Root
      open={isPendingNoticeOpen}
      onOpenChange={(open) => !open && closePendingNotice()}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-xs" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-[#FBF9F5] p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50">
              <Clock className="h-5 w-5 text-amber-700" aria-hidden="true" />
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Đóng thông báo"
                className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Badge
              variant="draft"
              className="border-amber-300 bg-amber-100/70 font-semibold text-amber-800"
            >
              Chờ duyệt
            </Badge>
            <span className="text-xs text-stone-500">Đăng ký ngày</span>
            <span className="text-xs font-medium text-stone-700">
              {user ? new Intl.DateTimeFormat('vi-VN').format(new Date(user.createdAt)) : ''}
            </span>
          </div>

          <DialogPrimitive.Title className="mt-2 font-serif text-xl font-bold tracking-tight text-stone-900">
            Tài khoản đang chờ phê duyệt
          </DialogPrimitive.Title>

          <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-stone-600">
            Tài khoản của bạn ({user?.email}) hiện đang trong danh sách chờ Ban biên tập xét duyệt.
            Bạn hiện có thể đọc công khai toàn bộ tài liệu lý thuyết, định lý và bài tập.
          </DialogPrimitive.Description>

          <div className="mt-4 rounded-xl border border-stone-200 bg-white p-3.5 text-xs leading-relaxed text-stone-600 shadow-xs">
            <div className="font-semibold text-stone-800">Quyền hạn trong thời gian chờ:</div>
            <ul className="mt-1.5 list-inside list-disc space-y-1 text-stone-600">
              <li>Đọc toàn bộ bài học, định lý, chứng minh Toán học.</li>
              <li>Sử dụng hệ thống tra cứu thuật ngữ và đồ họa tương tác.</li>
              <li>
                Tính năng lưu tiến độ, ghi chú bài giảng sẽ được tự động kích hoạt ngay khi tài
                khoản được duyệt.
              </li>
            </ul>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void signOut();
              }}
              className="gap-1.5 text-stone-600 hover:text-red-700"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Đăng xuất</span>
            </Button>
            <Button variant="subject" size="sm" onClick={closePendingNotice} className="gap-1.5">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tiếp tục đọc bài học</span>
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
