import { LogIn, LogOut, Menu, Play, Sparkles } from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router';
import type { ReadingFontSize } from '@/context/ReadingSettingsContext';
import { SearchBar } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Button, Drawer } from '@/shared/ui';

export interface MobileQuickResume {
  readonly label: string;
  readonly to: string;
}

export interface HeaderMobileDrawerProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly isDark: boolean;
  readonly isLessonPage: boolean;
  readonly isSkimmingMode: boolean;
  readonly onToggleSkimmingMode: () => void;
  readonly fontSize: ReadingFontSize;
  readonly onDecreaseFontSize: () => void;
  readonly onIncreaseFontSize: () => void;
  readonly quickResume: MobileQuickResume | null;
  readonly isUserLoggedIn: boolean;
  readonly onOpenAuthModal: () => void;
  readonly onSignOut: () => Promise<void>;
}

export const HeaderMobileDrawer: FC<HeaderMobileDrawerProps> = ({
  open,
  onOpenChange,
  isDark,
  isLessonPage,
  isSkimmingMode,
  onToggleSkimmingMode,
  fontSize,
  onDecreaseFontSize,
  onIncreaseFontSize,
  quickResume,
  isUserLoggedIn,
  onOpenAuthModal,
  onSignOut,
}) => {
  const closeDrawer = () => onOpenChange(false);

  return (
    <div className="lg:hidden">
      <Drawer
        open={open}
        onOpenChange={onOpenChange}
        side="left"
        title="LEARNING UNIVERSE"
        trigger={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mở menu điều hướng"
            className="h-10 w-10 rounded-xl"
          >
            <Menu
              className={cn('h-5 w-5', isDark ? 'text-[#F7F4EB]' : 'text-[#142B21]')}
              aria-hidden="true"
            />
          </Button>
        }
      >
        <nav aria-label="Menu điều hướng di động" className="space-y-5">
          <SearchBar className="w-full" />

          {quickResume && !isLessonPage && (
            <Link
              to={quickResume.to}
              onClick={closeDrawer}
              className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1B3D2F] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#25523F]"
            >
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              <span>Học tiếp: {quickResume.label}</span>
            </Link>
          )}

          {isLessonPage && (
            <div className="space-y-2 rounded-2xl border border-[#1B3D2F]/14 bg-[#F5F9F6] p-3 dark:border-[#4E9B58]/25 dark:bg-[#182E24]">
              <p className="font-mono text-[10px] font-bold tracking-wider text-[#246A3B] uppercase dark:text-[#86EFAC]">
                Ngữ cảnh bài học
              </p>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onToggleSkimmingMode}
                  aria-pressed={isSkimmingMode}
                  className={cn(
                    'inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
                    isSkimmingMode
                      ? 'border-[#C83E37] bg-[#C83E37] text-white'
                      : 'border-[var(--border-subtle)] bg-white text-[#142B21]',
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Đọc lướt định lý</span>
                </button>
                <div className="inline-flex items-center rounded-xl border border-[var(--border-subtle)] bg-white p-0.5">
                  <button
                    type="button"
                    onClick={onDecreaseFontSize}
                    disabled={fontSize === 'sm'}
                    aria-label="Giảm cỡ chữ"
                    className="min-h-10 min-w-10 cursor-pointer rounded-lg text-xs font-bold text-[#142B21] disabled:opacity-40"
                  >
                    A−
                  </button>
                  <button
                    type="button"
                    onClick={onIncreaseFontSize}
                    disabled={fontSize === 'xl'}
                    aria-label="Tăng cỡ chữ"
                    className="min-h-10 min-w-10 cursor-pointer rounded-lg text-xs font-bold text-[#142B21] disabled:opacity-40"
                  >
                    A+
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-1">
            <Link
              to={ROUTES.home}
              onClick={closeDrawer}
              className="flex min-h-11 items-center rounded-xl px-3.5 py-2 text-sm font-semibold text-[#142B21] transition-colors hover:bg-[#E9EFEA]/70"
            >
              Trang chủ
            </Link>
            <Link
              to={ROUTES.courses}
              onClick={closeDrawer}
              className="flex min-h-11 items-center rounded-xl px-3.5 py-2 text-sm font-semibold text-[#142B21] transition-colors hover:bg-[#E9EFEA]/70"
            >
              Tất cả môn học
            </Link>
            <Link
              to="/glossary"
              onClick={closeDrawer}
              className="flex min-h-11 items-center rounded-xl px-3.5 py-2 text-sm font-semibold text-[#142B21] transition-colors hover:bg-[#E9EFEA]/70"
            >
              Thuật ngữ
            </Link>
          </div>

          {/* Cột 1: Toán học */}
          <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
            <p className="px-3 font-mono text-[11px] font-semibold tracking-wider text-[#55676B] uppercase">
              Toán học
            </p>
            <div className="space-y-1">
              <Link
                to={ROUTES.subjectOverview('cau-truc-dai-so')}
                onClick={closeDrawer}
                aria-label="Cấu trúc đại số"
                className="flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2 text-sm text-[#142B21] transition-colors hover:bg-[#E9EFEA]/70"
              >
                <span className="font-serif font-semibold">Cấu trúc đại số</span>
              </Link>
              <Link
                to={ROUTES.subjectOverview('hinh-hoc-affine')}
                onClick={closeDrawer}
                aria-label="Hình học Affine và hình học Euclide"
                className="flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2 text-sm text-[#142B21] transition-colors hover:bg-[#E9EFEA]/70"
              >
                <span className="font-serif font-semibold">Hình học Affine &amp; Euclide</span>
              </Link>
              <Link
                to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                onClick={closeDrawer}
                aria-label="Giải tích hàm một biến"
                className="flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2 text-sm text-[#142B21] transition-colors hover:bg-[#E9EFEA]/70"
              >
                <span className="font-serif font-semibold">Giải tích hàm một biến</span>
              </Link>
            </div>
          </div>

          {/* Cột 2: Khoa học Giáo dục */}
          <div className="space-y-2 border-t border-[var(--border-subtle)] pt-4">
            <p className="px-3 font-mono text-[11px] font-semibold tracking-wider text-[#55676B] uppercase">
              Khoa học Giáo dục
            </p>
            <div className="space-y-1">
              <Link
                to={ROUTES.subjectOverview('giao-duc-hoc')}
                onClick={closeDrawer}
                aria-label="Giáo dục học"
                className="flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2 text-sm text-[#142B21] transition-colors hover:bg-[#E9EFEA]/70"
              >
                <span className="font-serif font-semibold">Giáo dục học</span>
              </Link>
              <Link
                to="/mon-hoc/giao-duc-hoc/khoi-thuc-hanh-nghiep-vu-su-pham/phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te"
                onClick={closeDrawer}
                aria-label="Tình huống sư phạm thực hành"
                className="flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2 text-sm text-[#142B21] transition-colors hover:bg-[#E9EFEA]/70"
              >
                <span className="font-serif font-semibold">Tình huống sư phạm</span>
                <span className="font-mono text-[11px] text-[#55676B]">20 án lệ</span>
              </Link>
              <Link
                to="/mon-hoc/giao-duc-hoc?tab=documents"
                onClick={closeDrawer}
                aria-label="Hệ thống văn bản & Thông tư GD"
                className="flex min-h-11 items-center justify-between rounded-xl px-3.5 py-2 text-sm text-[#142B21] transition-colors hover:bg-[#E9EFEA]/70"
              >
                <span className="font-serif font-semibold">Văn bản &amp; Thông tư GD</span>
                <span className="font-mono text-[11px] text-[#55676B]">Phổ thông</span>
              </Link>
            </div>
          </div>

          {/* Tài khoản trên di động */}
          <div className="border-t border-[var(--border-subtle)] pt-4">
            {isUserLoggedIn ? (
              <button
                type="button"
                onClick={() => {
                  void onSignOut();
                  closeDrawer();
                }}
                className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-medium text-[#142B21]"
              >
                <span>Đăng xuất</span>
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  onOpenAuthModal();
                }}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#1B3D2F] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#25523F]"
              >
                <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </nav>
      </Drawer>
    </div>
  );
};
