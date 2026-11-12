import { BookOpen, LogIn, LogOut, SlidersHorizontal, User, Users } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router';
import { FONT_SIZE_LABELS, type ReadingFontSize } from '@/context/ReadingSettingsContext';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface HeaderAccountMenuProps {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
  readonly onClose: () => void;
  readonly isDark: boolean;
  readonly isSepia: boolean;
  readonly isAdmin: boolean;
  readonly isUserLoggedIn: boolean;
  readonly completedCount: number;
  readonly fontSize: ReadingFontSize;
  readonly onSelectFontSize: (size: ReadingFontSize) => void;
  readonly onOpenAuthModal: () => void;
  readonly onEnableLearnerMode: () => void;
  readonly onSignOut: () => Promise<void>;
}

export const HeaderAccountMenu: FC<HeaderAccountMenuProps> = ({
  isOpen,
  onToggle,
  onClose,
  isDark,
  isSepia,
  isAdmin,
  isUserLoggedIn,
  completedCount,
  fontSize,
  onSelectFontSize,
  onOpenAuthModal,
  onEnableLearnerMode,
  onSignOut,
}) => {
  const fontOptions: ReadonlyArray<{ readonly id: ReadingFontSize; readonly label: string }> = [
    { id: 'sm', label: 'A−' },
    { id: 'base', label: 'A' },
    { id: 'lg', label: 'A+' },
  ];

  return (
    <div className="relative hidden md:block">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label="Tài khoản và cài đặt giao diện"
        className={cn(
          'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#388E3C] focus-visible:outline-none active:scale-[0.98]',
          isDark
            ? 'border-[#4E9B58]/25 bg-[#182E24] text-[#F7F4EB] hover:border-[#4E9B58]/50 hover:bg-[#1E3B2E]'
            : 'border-[#1B3D2F]/14 bg-[var(--bg-page)] text-[#142B21] hover:border-[#1B3D2F]/30 hover:bg-white dark:border-[#4E9B58]/25 dark:bg-[#182E24] dark:text-[#F7F4EB]',
        )}
      >
        <User className="h-4 w-4" aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Menu tài khoản và giao diện"
          className={cn(
            'absolute top-full right-0 mt-3 w-64 rounded-3xl p-4 shadow-2xl backdrop-blur-xl',
            isDark
              ? 'border border-[#4E9B58]/25 bg-[#11221A]/96 text-[#F7F4EB]'
              : isSepia
                ? 'border border-[#1B3D2F]/16 bg-[#FBF7EC]/98 text-[#231F18]'
                : 'border border-[#1B3D2F]/14 bg-[#FCFDFC]/96 text-[#142B21] dark:border-[#4E9B58]/25 dark:bg-[#11221A]/96 dark:text-[#F7F4EB]',
          )}
        >
          {/* Mục 1: Thông tin học tập cá nhân */}
          <div className="space-y-1.5 border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <BookOpen
                className="h-3.5 w-3.5 text-[#1B3D2F] dark:text-[#E5C378]"
                aria-hidden="true"
              />
              <span>Thông tin học tập cá nhân</span>
            </div>
            <p className="text-xs text-[#55676B] dark:text-[#A7B5AC]">
              Đã hoàn thành{' '}
              <strong className="text-[#142B21] dark:text-[#F7F4EB]">{completedCount}</strong> bài
              học trên trình duyệt này.
            </p>
          </div>

          {/* Mục 2: Cài đặt giao diện (Cỡ chữ đọc bài) */}
          <div className="space-y-2 border-b border-[var(--border-subtle)] py-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal
                  className="h-3.5 w-3.5 text-[#1B3D2F] dark:text-[#E5C378]"
                  aria-hidden="true"
                />
                <span>Cỡ chữ bài đọc</span>
              </span>
              <span className="font-mono text-[11px] font-medium text-[#9A7B3E]">
                {FONT_SIZE_LABELS[fontSize]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-page)] p-1">
              {fontOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectFontSize(opt.id)}
                  className={cn(
                    'cursor-pointer rounded-lg py-1 text-xs font-semibold transition-colors',
                    fontSize === opt.id
                      ? 'bg-[#1B3D2F] text-white'
                      : 'text-[#55676B] hover:text-[#142B21] dark:text-[#A7B5AC] dark:hover:text-[#F7F4EB]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liên kết Quản trị viên (nếu có quyền Admin) */}
          {isAdmin && (
            <div className="border-b border-[var(--border-subtle)] py-2">
              <Link
                to={ROUTES.adminUsers}
                onClick={onClose}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium transition-colors hover:bg-[#1B3D2F]/8 dark:hover:bg-white/5"
              >
                <Users
                  className="h-3.5 w-3.5 text-[#55676B] dark:text-[#A7B5AC]"
                  aria-hidden="true"
                />
                <span>Quản lý học viên</span>
              </Link>
            </div>
          )}

          {/* Mục 3: Đăng nhập / Đăng xuất */}
          <div className="pt-2.5">
            {isUserLoggedIn ? (
              <button
                type="button"
                onClick={() => void onSignOut()}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors hover:bg-[#1B3D2F]/8 dark:hover:bg-white/5"
              >
                <span>Đăng xuất</span>
                <LogOut
                  className="h-3.5 w-3.5 text-[#55676B] dark:text-[#A7B5AC]"
                  aria-hidden="true"
                />
              </button>
            ) : (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[#1B3D2F] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#25523F]"
                >
                  <span>Đăng nhập đồng bộ</span>
                  <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onEnableLearnerMode();
                    onClose();
                  }}
                  className="w-full cursor-pointer rounded-xl px-3 py-1.5 text-center text-[11px] font-medium text-[#55676B] transition-colors hover:bg-[#1B3D2F]/6 hover:text-[#142B21] dark:text-[#A7B5AC] dark:hover:text-[#F7F4EB]"
                >
                  Bật lưu tiến độ trình duyệt
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
