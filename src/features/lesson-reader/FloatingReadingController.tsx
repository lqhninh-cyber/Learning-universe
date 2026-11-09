import { Moon, Sun } from 'lucide-react';
import { type FC, useEffect } from 'react';
import { cn } from '@/shared/lib/cn';

export interface FloatingReadingControllerProps {
  readonly readingTheme: 'light' | 'dark';
  readonly onToggleReadingTheme: () => void;
  readonly className?: string;
}

/**
 * Floating Reading Controller (Thanh công cụ đọc ghim nổi công thái học)
 * - Neo cố định góc dưới bên phải màn hình (fixed bottom-6 right-6 z-40)
 * - Nút dạng Pill Button hỗ trợ Dark/Light mode tức thời
 * - Phím tắt 'D' chuyển nhanh chế độ đọc
 * - Vùng bấm tối thiểu 44×44px hỗ trợ mobile
 */
export const FloatingReadingController: FC<FloatingReadingControllerProps> = ({
  readingTheme,
  onToggleReadingTheme,
  className,
}) => {
  const isDark = readingTheme === 'dark';

  // Hỗ trợ phím tắt bàn phím D / d để chuyển nhanh Dark/Light mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if ((e.key === 'd' || e.key === 'D') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onToggleReadingTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleReadingTheme]);

  return (
    <div
      className={cn('fixed right-6 bottom-6 z-40 flex items-center gap-2 print:hidden', className)}
    >
      <button
        type="button"
        onClick={onToggleReadingTheme}
        aria-pressed={isDark}
        aria-label={isDark ? 'Chế độ đọc: Sáng (Phím D)' : 'Chế độ đọc: Tối (Phím D)'}
        title={`Chuyển chế độ đọc (Phím D) · Hiện tại: ${isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}`}
        data-testid="reading-theme-toggle"
        className={cn(
          'flex min-h-[44px] min-w-[44px] cursor-pointer items-center gap-2.5 rounded-full px-4 py-2.5 text-xs font-medium md:text-sm',
          'border border-zinc-200 bg-white/90 text-zinc-800 shadow-lg backdrop-blur-md transition-all duration-200',
          'hover:-translate-y-0.5 hover:shadow-xl active:scale-95',
          'dark:border-[#2C4D3B] dark:bg-[#13261D]/90 dark:text-[#F5F2EB]',
          'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:ring-offset-2 focus-visible:outline-none',
        )}
      >
        {isDark ? (
          <Sun className="h-4 w-4 shrink-0 text-[#C5A262]" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 shrink-0 text-[#2E6B4F]" aria-hidden="true" />
        )}
        <span>Chế độ đọc: {isDark ? 'Sáng' : 'Tối'}</span>
        <kbd
          className={cn(
            'hidden rounded px-1.5 py-0.5 font-mono text-[10px] font-bold sm:inline-block',
            isDark
              ? 'border border-[#2C4D3B] bg-[#1E362A] text-[#C5A262]'
              : 'border border-zinc-200 bg-zinc-100 text-zinc-600',
          )}
        >
          D
        </kbd>
      </button>
    </div>
  );
};
