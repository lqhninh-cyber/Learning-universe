import { BookOpenCheck, Layers, Maximize2, Minimize2, Moon, Sun, X } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';
import { FONT_SIZE_LABELS, useReadingSettings } from '@/context/ReadingSettingsContext';
import { cn } from '@/shared/lib/cn';

export interface FloatingZenToolbarProps {
  readonly className?: string;
}

/**
 * Floating Zen Toolbar (Thanh công cụ đọc chuyên sâu ghim nổi)
 * - Trạng thái thu gọn (Mặc định):
 *   + Viên thuốc tròn mini (w-11 h-11) tại `fixed bottom-6 right-6 z-50`.
 *   + Nền kính mờ (backdrop-blur-xl), viền ngọc bích sẫm, biểu tượng chữ Aa trang nhã.
 *   + Chấm vàng thếp báo hiệu khi đang ở chế độ Zen.
 * - Trạng thái mở rộng (Khi click vào viên thuốc):
 *   + Bung mở thanh công cụ hoàn chỉnh với hiệu ứng chuyển tiếp mượt mà.
 *   + Nút [✕] thu gọn lại hoặc nhấn Escape để đóng.
 * - 3 tính năng cốt lõi:
 *   1. [Zen Mode]: Bật/tắt chế độ tập trung (Phím tắt Z). Khi active có nền Vàng Thếp #C5A262.
 *   2. [Cỡ chữ A- / A+]: Cụm nút tăng/giảm cỡ chữ kèm nhãn mức hiện tại (Nhỏ / Vừa / Lớn / Đại).
 *   3. [Chế độ Tối / Sáng]: Icon Mặt trăng / Mặt trời chuyển đổi theme tức thì (Phím tắt D).
 */
export const FloatingZenToolbar: FC<FloatingZenToolbarProps> = ({ className }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const {
    theme,
    toggleTheme,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    isZenMode,
    toggleZenMode,
    setZenMode,
    isSkimmingMode,
    toggleSkimmingMode,
  } = useReadingSettings();

  const isDark = theme === 'dark';

  // Lắng nghe phím tắt bàn phím: Z (Zen Mode), D (Theme), Esc (Đóng toolbar / Thoát Zen Mode)
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
      } else if (e.key === 'Escape') {
        if (isExpanded) {
          e.preventDefault();
          setIsExpanded(false);
        } else if (isZenMode) {
          e.preventDefault();
          setZenMode(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleZenMode, toggleTheme, setZenMode, isZenMode, isExpanded]);

  // Trạng thái thu gọn: Viên thuốc nhỏ gọn tinh tế
  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        aria-label="Mở thanh công cụ đọc"
        title="Công cụ đọc bài học"
        data-testid="zen-toolbar-trigger"
        className={cn(
          'fixed right-6 bottom-6 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full',
          'border border-zinc-300/90 bg-white/90 shadow-xl backdrop-blur-xl transition-all duration-200 hover:scale-105 active:scale-95',
          'dark:border-[#1E3B2E] dark:bg-[#081611]/90',
          'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:ring-offset-2 focus-visible:outline-none',
          'select-none print:hidden',
          className,
        )}
      >
        <span
          className="font-serif text-[15px] font-bold tracking-tight text-[#2E6B4F] dark:text-[#C5A262]"
          aria-hidden="true"
        >
          Aa
        </span>

        {/* Chấm vàng thông báo khi đang trong Zen Mode */}
        {isZenMode && (
          <span
            className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-[#C5A262] ring-2 ring-white dark:ring-[#081611]"
            title="Đang bật chế độ Zen Mode"
            aria-hidden="true"
          />
        )}

        {/* Chấm đỏ chu sa khi đang bật Đọc lướt định lý */}
        {isSkimmingMode && (
          <span
            className="absolute bottom-1.5 left-1.5 h-2 w-2 rounded-full bg-[#9B2C3D] ring-2 ring-white dark:bg-[#F19AA8] dark:ring-[#081611]"
            title="Đang bật chế độ Đọc lướt định lý"
            aria-hidden="true"
          />
        )}
      </button>
    );
  }

  // Trạng thái mở rộng: Thanh công cụ đọc đầy đủ tính năng cốt lõi
  return (
    <aside
      aria-label="Thanh công cụ đọc chuyên sâu"
      className={cn(
        'fixed right-4 bottom-6 z-50 flex max-w-[calc(100vw-2rem)] flex-wrap items-center gap-1.5 rounded-2xl p-1.5 sm:right-6 sm:flex-nowrap sm:gap-2 sm:rounded-full sm:p-2',
        'border border-zinc-300/90 bg-white/95 text-zinc-800 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out',
        'dark:border-[#1E3B2E] dark:bg-[#081611]/95 dark:text-[#E2ECE6]',
        'select-none print:hidden',
        className,
      )}
    >
      {/* 1. NÚT ĐỌC LƯỚT ĐỊNH LÝ: Ẩn nhanh Ví dụ & Chứng minh */}
      <button
        type="button"
        onClick={toggleSkimmingMode}
        aria-pressed={isSkimmingMode}
        aria-label="Đọc lướt định lý (Ẩn Ví dụ & Chứng minh)"
        title={`Đọc lướt định lý (Ẩn Ví dụ & Chứng minh) · ${isSkimmingMode ? 'Đang bật' : 'Đang tắt'}`}
        data-testid="skim-mode-toggle"
        className={cn(
          'flex min-h-[38px] cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200',
          'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:ring-offset-1 focus-visible:outline-none',
          isSkimmingMode
            ? 'bg-[#9B2C3D] font-bold text-white shadow-md hover:bg-[#822231] active:scale-95 dark:bg-[#F19AA8] dark:text-[#2B0F15] dark:hover:bg-[#F5B0BC]'
            : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950 active:scale-95 dark:text-[#CBD5CE] dark:hover:bg-[#163023] dark:hover:text-[#F5F2EB]',
        )}
      >
        {isSkimmingMode ? (
          <BookOpenCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Layers
            className="h-4 w-4 shrink-0 text-[#9B2C3D] dark:text-[#F19AA8]"
            aria-hidden="true"
          />
        )}
        <span className="font-semibold tracking-wide">
          <span className="sm:hidden">Đọc lướt</span>
          <span className="hidden sm:inline">Đọc lướt định lý</span>
        </span>
      </button>

      {/* Đường phân cách */}
      <span className="h-4 w-px bg-zinc-300 dark:bg-[#1E3B2E]" aria-hidden="true" />

      {/* 2. NÚT ZEN MODE: Bật/tắt chế độ tập trung (Phím tắt Z) */}
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

      {/* 2. CỤM CỠ CHỮ: A- / A+ kèm nhãn hiển thị mức (Nhỏ / Vừa / Lớn / Đại) */}
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

      {/* 3. NÚT CHUYỂN ĐỔI CHẾ ĐỘ TỐI / SÁNG (Phím tắt D) */}
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

      {/* Đường phân cách */}
      <span className="h-4 w-px bg-zinc-300 dark:bg-[#1E3B2E]" aria-hidden="true" />

      {/* 4. NÚT THU GỌN [✕] */}
      <button
        type="button"
        onClick={() => setIsExpanded(false)}
        aria-label="Thu gọn thanh công cụ đọc"
        title="Thu gọn"
        data-testid="zen-toolbar-close"
        className={cn(
          'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-all duration-200',
          'hover:bg-zinc-100 hover:text-zinc-900 active:scale-90',
          'dark:text-zinc-400 dark:hover:bg-[#163023] dark:hover:text-[#F5F2EB]',
          'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:outline-none',
        )}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </aside>
  );
};

export default FloatingZenToolbar;
