import * as DialogPrimitive from '@radix-ui/react-dialog';
import { CheckCircle2, GraduationCap, ShieldAlert, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/ui';
import { DEMO_ADMIN, DEMO_APPROVED_STUDENT, DEMO_PENDING_STUDENT } from './mock-users';
import { useAuth } from './useAuth';

function GoogleIcon({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, signInWithGoogle, setMockUser, isMockMode } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await signInWithGoogle();
      closeAuthModal();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối đến Google OAuth';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogPrimitive.Root open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-stone-950/45 backdrop-blur-xs" />
        <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-[#FBF9F5] p-6 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-stone-300/80 bg-white shadow-xs">
              <GraduationCap className="h-6 w-6 text-stone-800" aria-hidden="true" />
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                aria-label="Đóng hộp thoại đăng nhập"
                className="rounded-lg p-1.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </DialogPrimitive.Close>
          </div>

          <DialogPrimitive.Title className="mt-4 font-serif text-xl font-bold tracking-tight text-stone-900">
            Đăng nhập Không gian Học viên
          </DialogPrimitive.Title>

          <DialogPrimitive.Description className="mt-2 text-sm leading-relaxed text-stone-600">
            Đăng nhập bằng tài khoản Google để kích hoạt tính năng lưu tiến độ học tập, ghi chú bài
            giảng và danh sách bài học yêu thích.
          </DialogPrimitive.Description>

          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="mt-5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm font-medium text-stone-800 shadow-xs transition-colors hover:bg-stone-50 hover:text-stone-900 focus:ring-2 focus:ring-stone-400/50 focus:outline-none disabled:opacity-60"
            >
              <GoogleIcon className="h-5 w-5 shrink-0" />
              <span>{isSubmitting ? 'Đang kết nối...' : 'Đăng nhập với Google'}</span>
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-stone-200/90 bg-stone-100/60 p-3 text-xs leading-relaxed text-stone-600">
            <div className="flex items-center gap-1.5 font-medium text-stone-800">
              <CheckCircle2 className="h-3.5 w-3.5 text-stone-700" aria-hidden="true" />
              <span>Chính sách Học thuật Mở (Quyết định D1):</span>
            </div>
            <p className="mt-1">
              Bạn luôn có thể đọc và tra cứu tự do 100% nội dung lý thuyết, định lý và bài tập mà
              không cần đăng nhập. Sau khi đăng ký, tài khoản sẽ được Ban biên tập xét duyệt quyền
              Học viên chính thức.
            </p>
          </div>

          {(isMockMode || import.meta.env.DEV) && (
            <div className="mt-5 border-t border-stone-200 pt-4">
              <div className="text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                Chuyển nhanh tài khoản mẫu (Kiểm thử & Phát triển):
              </div>
              <div className="mt-2.5 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    setMockUser(DEMO_ADMIN);
                    closeAuthModal();
                  }}
                >
                  Quản trị viên
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-emerald-700 hover:text-emerald-800"
                  onClick={() => {
                    setMockUser(DEMO_APPROVED_STUDENT);
                    closeAuthModal();
                  }}
                >
                  Học viên duyệt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs text-amber-700 hover:text-amber-800"
                  onClick={() => {
                    setMockUser(DEMO_PENDING_STUDENT);
                    closeAuthModal();
                  }}
                >
                  Chờ duyệt
                </Button>
              </div>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
