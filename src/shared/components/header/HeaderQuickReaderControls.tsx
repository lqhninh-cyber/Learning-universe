import { Eye, Maximize2, Minimize2, Moon, Sun } from 'lucide-react';
import type { FC } from 'react';
import { FONT_SCALE_MAX, FONT_SCALE_MIN } from '@/context/island-helpers';
import { useIsland } from '@/context/IslandContext';
import { cn } from '@/shared/lib/cn';

export interface HeaderQuickReaderControlsProps {
  readonly isDark?: boolean;
}

/**
 * Viên Thuốc Điều Khiển Đọc Bài Đồng Nhất trên thanh Island đầu trang:
 * - Điều chỉnh cỡ chữ: A- · % hiện tại · A+
 * - Chuyển chế độ Sáng / Tối (Phím D)
 * - Chế độ Dịu mắt (Giấy Dó ấm #EAE8E1 / #F5F3EE)
 * - Bật / tắt Chế độ tập trung Zen thu gọn 2 cột bên (Phím Z)
 */
export const HeaderQuickReaderControls: FC<HeaderQuickReaderControlsProps> = ({
  isDark = false,
}) => {
  const {
    readerSettings,
    increaseFontScale,
    decreaseFontScale,
    toggleEyeComfortWarmth,
    setDarkMode,
    toggleDarkMode,
    toggleZenMode,
  } = useIsland();

  const scalePercent = Math.round(readerSettings.fontScale * 100);
  const isMin = readerSettings.fontScale <= FONT_SCALE_MIN;
  const isMax = readerSettings.fontScale >= FONT_SCALE_MAX;
  const darkActive = isDark || readerSettings.isDarkMode;
  const eyeComfortActive = readerSettings.eyeComfortWarmth && !readerSettings.isDarkMode;

  const handleToggleEyeComfort = () => {
    if (!readerSettings.eyeComfortWarmth && readerSettings.isDarkMode) {
      setDarkMode(false);
    }
    toggleEyeComfortWarmth();
  };

  return (
    <div
      role="group"
      aria-label="Điều khiển đọc bài: cỡ chữ, chế độ sáng tối và chế độ tập trung"
      data-testid="quick-reader-controls"
      className={cn(
        'hidden items-center gap-1.5 rounded-full border px-2 py-1 transition-colors md:flex',
        darkActive
          ? 'border-white/15 bg-white/10'
          : 'border-[#D8E0DD] bg-[#EDF1EF] dark:border-white/15 dark:bg-white/10',
      )}
    >
      {/* 1. Cụm chỉnh cỡ chữ: A- · Nhãn % · A+ */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={decreaseFontScale}
          disabled={isMin}
          aria-label="Giảm cỡ chữ"
          title="Giảm cỡ chữ (-5%)"
          className={cn(
            'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35',
            darkActive ? 'text-[#EBF0EE] hover:bg-white/15' : 'text-[#182624] hover:bg-[#FAFBF9]',
          )}
        >
          A-
        </button>

        <span
          data-testid="quick-reader-scale-badge"
          aria-live="polite"
          className={cn(
            'min-w-[36px] text-center text-[12px] font-medium tabular-nums select-none',
            darkActive ? 'text-[#C2D1CC]' : 'text-[#4A5D58]',
          )}
        >
          {scalePercent}%
        </span>

        <button
          type="button"
          onClick={increaseFontScale}
          disabled={isMax}
          aria-label="Tăng cỡ chữ"
          title="Tăng cỡ chữ (+5%)"
          className={cn(
            'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[13px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35',
            darkActive ? 'text-[#EBF0EE] hover:bg-white/15' : 'text-[#182624] hover:bg-[#FAFBF9]',
          )}
        >
          A+
        </button>
      </div>

      <span
        className={cn('h-4 w-[1px]', darkActive ? 'bg-white/15' : 'bg-[#D8E0DD]')}
        aria-hidden="true"
      />

      {/* 2. Chế độ Sáng / Tối (Phím D) */}
      <button
        type="button"
        data-testid="theme-mode-toggle"
        onClick={toggleDarkMode}
        aria-pressed={readerSettings.isDarkMode}
        aria-label={
          readerSettings.isDarkMode ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'
        }
        title="Chế độ Sáng/Tối (Phím D)"
        className={cn(
          'inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-2.5 text-[12px] leading-normal font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none',
          readerSettings.isDarkMode
            ? 'bg-[#1E332E] text-[#FCD34D] shadow-2xs'
            : darkActive
              ? 'text-[#B8C7C2] hover:bg-white/15 hover:text-[#EBF0EE]'
              : 'text-[#4A5D58] hover:bg-[#FAFBF9] hover:text-[#182624]',
        )}
      >
        {readerSettings.isDarkMode ? (
          <Sun className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <Moon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}
        <span className="hidden whitespace-nowrap xl:inline">
          {readerSettings.isDarkMode ? 'Sáng' : 'Tối'}
        </span>
      </button>

      {/* 3. Chế độ Dịu mắt (Giấy Dó ấm) */}
      <button
        type="button"
        data-testid="eye-comfort-toggle"
        onClick={handleToggleEyeComfort}
        aria-pressed={eyeComfortActive}
        aria-label={eyeComfortActive ? 'Tắt chế độ Dịu mắt' : 'Bật chế độ Dịu mắt'}
        title="Chế độ Dịu mắt (Giấy Dó ấm)"
        className={cn(
          'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none',
          eyeComfortActive
            ? 'bg-[#7A623C] text-[#FAFBF9] shadow-2xs'
            : darkActive
              ? 'text-[#B8C7C2] hover:bg-white/15 hover:text-[#EBF0EE]'
              : 'text-[#4A5D58] hover:bg-[#FAFBF9] hover:text-[#182624]',
        )}
      >
        <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </button>

      {/* 4. Chế độ tập trung Zen (Phím Z) */}
      <button
        type="button"
        data-testid="zen-mode-toggle"
        onClick={toggleZenMode}
        aria-pressed={readerSettings.isZenMode}
        aria-label={
          readerSettings.isZenMode ? 'Tắt chế độ tập trung Zen' : 'Bật chế độ tập trung Zen'
        }
        title="Chế độ tập trung Zen (Phím Z)"
        className={cn(
          'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none',
          readerSettings.isZenMode
            ? 'bg-[#1E332E] text-[#9EC5B8] shadow-2xs'
            : darkActive
              ? 'text-[#B8C7C2] hover:bg-white/15 hover:text-[#EBF0EE]'
              : 'text-[#4A5D58] hover:bg-[#FAFBF9] hover:text-[#182624]',
        )}
      >
        {readerSettings.isZenMode ? (
          <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
        ) : (
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
