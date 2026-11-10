import { Maximize2, Minimize2, Moon, Sun, Type } from 'lucide-react';
import { type FC, useEffect } from 'react';
import { FONT_SIZE_LABELS, useReadingSettings } from '@/context/ReadingSettingsContext';
import { cn } from '@/shared/lib/cn';

export interface FloatingZenToolbarProps {
  readonly className?: string;
}

/**
 * Floating Zen Toolbar (Thanh công cụ đọc chuyên sâu ghim nổi)
 * - Vị trí: Cố định góc dưới bên phải màn hình (fixed bottom-6 right-6 z-50)
 * - Thiết kế: Dạng Pill Bar bo tròn hoàn toàn (rounded-full), kính mờ (backdrop-blur-xl),
 *   viền ngọc bích sẫm (border-zinc-300 dark:border-[#1E3B2E]), đổ bóng sâu (shadow-2xl).
 * - Các tương tác chính:
 *   1. [Zen Mode]: Bật/tắt chế độ tập trung (Phím tắt Z). Khi active có nền Vàng Thếp #C5A262.
 *   2. [Font Serif / Sans]: Chuyển đổi nhanh kiểu chữ hiển thị rõ nhãn Serif / Sans.
 *   3. [Cỡ chữ A- / A+]: Cụm 2 nút tăng/giảm cỡ chữ kèm nhãn mức hiện tại (Nhỏ / Vừa / Lớn / Đại).
 *   4. [Chế độ Tối / Sáng]: Icon Mặt trăng / Mặt trời chuyển đổi theme tức thì (Phím tắt D).
 */
export const FloatingZenToolbar: FC<FloatingZenToolbarProps> = ({ className }) => {
  const {
    theme,
    toggleTheme,
    fontFamily,
    toggleFontFamily,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    isZenMode,
    toggleZenMode,
    setZenMode,
  } = useReadingSettings();

  const isDark = theme === 'dark';

  // Lắng nghe phím tắt bàn phím: Z (Zen Mode), D (Theme), Esc (Thoát Zen Mode)
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

      // Tránh ghi đè các tổ hợp phím hệ thống của trình duyệt (Ctrl+Z, Ctrl+D, v.v.)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }

      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        toggleZenMode();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === 'Escape' && isZenMode) {
        e.preventDefault();
        setZenMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleZenMode, toggleTheme, setZenMode, isZenMode]);

  return (
    <aside
      aria-label="Thanh công cụ đọc chuyên sâu"
      className={cn(
        'fixed right-4 bottom-6 z-50 flex items-center gap-1.5 rounded-full p-1.5 sm:right-6 md:gap-2 md:p-2',
        'border border-zinc-300/90 bg-white/90 text-zinc-800 shadow-2xl backdrop-blur-xl transition-all duration-300',
        'dark:border-[#1E3B2E] dark:bg-[#0B1A13]/95 dark:text-[#E2ECE6]',
        'select-none print:hidden',
        className,
      )}
    >
      {/* 1. NÚT ZEN MODE: Bật/tắt chế độ tập trung (Phím tắt Z) */}
      <button
        type="button"
        onClick={toggleZenMode}
        aria-pressed={isZenMode}
        aria-label={
          isZenMode
            ? 'Thoát chế độ tập trung Zen Mode (Phím Z)'
            : 'Bật chế độ tập trung Zen Mode (Phím Z)'
        }
        title={`Chế độ tập trung Zen Mode (Phím Z) · ${isZenMode ? 'Đang bật' : 'Đang tắt'}`}
        data-testid="zen-mode-toggle"
        className={cn(
          'flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
          'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:ring-offset-1 focus-visible:outline-none',
          isZenMode
            ? 'bg-[#C5A262] font-bold text-[#0A1F16] shadow-md hover:bg-[#D4B06F] active:scale-95'
            : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 dark:text-[#CBD5CE] dark:hover:bg-[#163023] dark:hover:text-[#F5F2EB]',
        )}
      >
        {isZenMode ? (
          <Minimize2 className="h-4 w-4 shrink-0 text-[#0A1F16]" aria-hidden="true" />
        ) : (
          <Maximize2
            className="h-4 w-4 shrink-0 text-[#2D6A4F] dark:text-[#A1D1B7]"
            aria-hidden="true"
          />
        )}
        <span className="font-semibold tracking-wide">Zen</span>
        <kbd
          className={cn(
            'hidden rounded px-1.5 py-0.5 font-mono text-[10px] font-bold sm:inline-block',
            isZenMode
              ? 'border border-[#0A1F16]/20 bg-[#0A1F16]/10 text-[#0A1F16]'
              : 'border border-zinc-200 bg-zinc-100 text-zinc-600 dark:border-[#284E3A] dark:bg-[#163023] dark:text-[#A1D1B7]',
          )}
        >
          Z
        </kbd>
      </button>

      {/* Đường phân cách */}
      <span className="h-4 w-px bg-zinc-300 dark:bg-[#1E3B2E]" aria-hidden="true" />

      {/* 2. NÚT CHUYỂN FONT: Serif / Sans */}
      <button
        type="button"
        onClick={toggleFontFamily}
        aria-label={`Kiểu chữ hiện tại: ${fontFamily}. Nhấn để đổi sang ${fontFamily === 'serif' ? 'Sans' : 'Serif'}`}
        title={`Đổi kiểu chữ (Hiện tại: ${fontFamily === 'serif' ? 'Serif (Học thuật)' : 'Sans (Công thức Toán)'})`}
        data-testid="font-family-toggle"
        className={cn(
          'flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
          'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:ring-offset-1 focus-visible:outline-none',
          'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 dark:text-[#CBD5CE] dark:hover:bg-[#163023] dark:hover:text-[#F5F2EB]',
        )}
      >
        <Type
          className="h-3.5 w-3.5 shrink-0 text-[#3F6570] dark:text-[#A1D1B7]"
          aria-hidden="true"
        />
        <span className="font-semibold">{fontFamily === 'serif' ? 'Serif' : 'Sans'}</span>
      </button>

      {/* Đường phân cách */}
      <span className="h-4 w-px bg-zinc-300 dark:bg-[#1E3B2E]" aria-hidden="true" />

      {/* 3. CỤM CỠ CHỮ: A- / A+ kèm nhãn hiển thị mức (Nhỏ / Vừa / Lớn / Đại) */}
      <div
        role="group"
        aria-label="Điều chỉnh cỡ chữ bài đọc"
        className="flex items-center gap-0.5 rounded-full border border-zinc-200/80 bg-zinc-100/80 p-0.5 dark:border-[#1F3D2E] dark:bg-[#12241C]"
      >
        <button
          type="button"
          onClick={decreaseFontSize}
          disabled={fontSize === 'sm'}
          aria-label="Giảm cỡ chữ (A-)"
          title="Giảm cỡ chữ (A-)"
          data-testid="decrease-font-size"
          className={cn(
            'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full font-serif text-xs font-bold transition-all',
            'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:outline-none',
            fontSize === 'sm'
              ? 'cursor-not-allowed text-zinc-400 opacity-30 dark:text-zinc-600'
              : 'text-zinc-700 hover:bg-white hover:text-zinc-950 active:scale-90 dark:text-[#CBD5CE] dark:hover:bg-[#1B3829] dark:hover:text-[#F5F2EB]',
          )}
        >
          A-
        </button>

        <span
          className="min-w-[34px] px-1 text-center font-mono text-[11px] font-semibold text-[#3F6570] dark:text-[#E5C378]"
          aria-live="polite"
          title={`Cỡ chữ: ${FONT_SIZE_LABELS[fontSize]}`}
        >
          {FONT_SIZE_LABELS[fontSize]}
        </span>

        <button
          type="button"
          onClick={increaseFontSize}
          disabled={fontSize === 'xl'}
          aria-label="Tăng cỡ chữ (A+)"
          title="Tăng cỡ chữ (A+)"
          data-testid="increase-font-size"
          className={cn(
            'flex h-7 w-7 cursor-pointer items-center justify-center rounded-full font-serif text-xs font-bold transition-all',
            'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:outline-none',
            fontSize === 'xl'
              ? 'cursor-not-allowed text-zinc-400 opacity-30 dark:text-zinc-600'
              : 'text-zinc-700 hover:bg-white hover:text-zinc-950 active:scale-90 dark:text-[#CBD5CE] dark:hover:bg-[#1B3829] dark:hover:text-[#F5F2EB]',
          )}
        >
          A+
        </button>
      </div>

      {/* Đường phân cách */}
      <span className="h-4 w-px bg-zinc-300 dark:bg-[#1E3B2E]" aria-hidden="true" />

      {/* 4. NÚT CHUYỂN ĐỔI CHẾ ĐỘ TỐI / SÁNG (Phím tắt D) */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-pressed={isDark}
        aria-label={isDark ? 'Chế độ đọc: Sáng (Phím D)' : 'Chế độ đọc: Tối (Phím D)'}
        title={`Chuyển chế độ đọc (Phím D) · Hiện tại: ${isDark ? 'Chế độ Tối' : 'Chế độ Sáng'}`}
        data-testid="reading-theme-toggle"
        className={cn(
          'flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
          'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:ring-offset-1 focus-visible:outline-none',
          'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 dark:text-[#CBD5CE] dark:hover:bg-[#163023] dark:hover:text-[#F5F2EB]',
        )}
      >
        {isDark ? (
          <Sun className="h-4 w-4 shrink-0 text-[#C5A262]" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 shrink-0 text-[#2D6A4F]" aria-hidden="true" />
        )}
        <span className="font-semibold">{isDark ? 'Sáng' : 'Tối'}</span>
        <kbd
          className={cn(
            'hidden rounded px-1.5 py-0.5 font-mono text-[10px] font-bold sm:inline-block',
            isDark
              ? 'border border-[#284E3A] bg-[#163023] text-[#C5A262]'
              : 'border border-zinc-200 bg-zinc-100 text-zinc-600',
          )}
        >
          D
        </kbd>
      </button>
    </aside>
  );
};

export default FloatingZenToolbar;
