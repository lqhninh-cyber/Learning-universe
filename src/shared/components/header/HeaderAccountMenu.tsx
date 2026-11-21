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
  readonly placement?: 'header' | 'rail';
  readonly collapsed?: boolean;
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
  placement = 'header',
  collapsed = false,
}) => {
  const fontOptions: ReadonlyArray<{ readonly id: ReadingFontSize; readonly label: string }> = [
    { id: 'sm', label: 'A−' },
    { id: 'base', label: 'A' },
    { id: 'lg', label: 'A+' },
  ];
  const isRail = placement === 'rail';

  return (
    <div className={cn('relative', isRail ? 'w-full' : 'hidden md:block')}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label="Tài khoản và cài đặt giao diện"
        title="Tài khoản & Hồ sơ học tập"
        className={cn(
          'cursor-pointer transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none active:scale-[0.98]',
          isRail
            ? collapsed
              ? 'mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[var(--text-secondary)] hover:border-[var(--border-hairline)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]'
              : 'flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-transparent px-2.5 text-[13px] font-medium text-[var(--text-secondary)] hover:border-[var(--border-hairline)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]'
            : cn(
                'flex h-10 w-10 items-center justify-center rounded-full border',
                isDark
                  ? 'border-[#4E9B58]/25 bg-[#182E24] text-[#F7F4EB] hover:border-[#4E9B58]/50 hover:bg-[#1E3B2E]'
                  : 'border-[#1B3D2F]/14 bg-[var(--bg-page)] text-[#142B21] hover:border-[#1B3D2F]/30 hover:bg-white dark:border-[#4E9B58]/25 dark:bg-[#182E24] dark:text-[#F7F4EB]',
              ),
        )}
      >
        {isRail && !collapsed ? (
          <>
            <span className="flex min-w-0 items-center gap-2.5">
              <User className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              <span className="truncate">{isUserLoggedIn ? 'Hồ sơ học tập' : 'Tài khoản'}</span>
            </span>
            {completedCount > 0 && (
              <span className="shrink-0 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)] tabular-nums">
                {completedCount}
              </span>
            )}
          </>
        ) : (
          <User className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Menu tài khoản và giao diện"
          className={cn(
            'absolute z-50 w-64 rounded-2xl p-4 shadow-2xl backdrop-blur-xl',
            isRail ? 'bottom-0 left-full ml-3' : 'top-full right-0 mt-3',
            isRail
              ? 'border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-main)]'
              : isDark
                ? 'border border-[#4E9B58]/25 bg-[#11221A]/96 text-[#F7F4EB]'
                : isSepia
                  ? 'border border-[#1B3D2F]/16 bg-[#FBF7EC]/98 text-[#231F18]'
                  : 'border border-[#1B3D2F]/14 bg-[#FCFDFC]/96 text-[#142B21] dark:border-[#4E9B58]/25 dark:bg-[#11221A]/96 dark:text-[#F7F4EB]',
          )}
        >
          {/* Mục 1: Thông tin học tập cá nhân */}
          <div className="space-y-1.5 border-b border-[var(--border-hairline)] pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-main)]">
              <BookOpen className="h-3.5 w-3.5 text-[var(--accent-os)]" aria-hidden="true" />
              <span>Thông tin học tập cá nhân</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)]">
              Đã hoàn thành <strong className="text-[var(--text-main)]">{completedCount}</strong>{' '}
              bài học trên trình duyệt này.
            </p>
          </div>

          {/* Mục 2: Cài đặt giao diện (Cỡ chữ đọc bài) */}
          <div className="space-y-2 border-b border-[var(--border-hairline)] py-3">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-main)]">
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal
                  className="h-3.5 w-3.5 text-[var(--accent-os)]"
                  aria-hidden="true"
                />
                <span>Cỡ chữ bài đọc</span>
              </span>
              <span className="font-mono text-[11px] font-medium text-[var(--accent-heritage)]">
                {FONT_SIZE_LABELS[fontSize]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-1">
              {fontOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectFontSize(opt.id)}
                  className={cn(
                    'cursor-pointer rounded-lg py-1 text-xs font-semibold transition-colors',
                    fontSize === opt.id
                      ? 'bg-[var(--accent-os)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Liên kết Quản trị viên (nếu có quyền Admin) */}
          {isAdmin && (
            <div className="border-b border-[var(--border-hairline)] py-2">
              <Link
                to={ROUTES.adminUsers}
                onClick={onClose}
                className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--bg-surface)]"
              >
                <Users className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
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
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-[var(--text-main)] transition-colors hover:bg-[var(--bg-surface)]"
              >
                <span>Đăng xuất</span>
                <LogOut className="h-3.5 w-3.5 text-[var(--text-muted)]" aria-hidden="true" />
              </button>
            ) : (
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl bg-[var(--accent-os)] px-3.5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-95"
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
                  className="w-full cursor-pointer rounded-xl px-3 py-1.5 text-center text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
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
