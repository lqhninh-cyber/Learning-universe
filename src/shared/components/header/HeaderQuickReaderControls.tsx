import { Moon } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import { FONT_SCALE_MAX, FONT_SCALE_MIN } from '@/context/island-helpers';
import { useIsland } from '@/context/IslandContext';
import { cn } from '@/shared/lib/cn';

export interface HeaderQuickReaderControlsProps {
  readonly isDark?: boolean;
}

export const HeaderQuickReaderControls: FC<HeaderQuickReaderControlsProps> = ({
  isDark = false,
}) => {
  const { readerSettings, increaseFontScale, decreaseFontScale, toggleEyeComfortWarmth } =
    useIsland();
  const [showScaleReadout, setShowScaleReadout] = useState(false);
  const timerRef = useRef<number | null>(null);

  const flashReadout = () => {
    setShowScaleReadout(true);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setShowScaleReadout(false);
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const scalePercent = Math.round(readerSettings.fontScale * 100);
  const isMin = readerSettings.fontScale <= FONT_SCALE_MIN;
  const isMax = readerSettings.fontScale >= FONT_SCALE_MAX;

  return (
    <div
      role="group"
      aria-label="Điều chỉnh nhanh khổ chữ và chế độ dịu mắt"
      data-testid="quick-reader-controls"
      className={cn(
        'relative hidden h-9 items-center gap-0.5 rounded-full border p-0.5 md:flex',
        isDark ? 'border-[#4E9B58]/30 bg-[#182E24]' : 'border-[#D8E0DD] bg-[#EDF1EF]',
      )}
    >
      <button
        type="button"
        onClick={() => {
          decreaseFontScale();
          flashReadout();
        }}
        disabled={isMin}
        aria-label="Giảm cỡ chữ"
        title="Giảm khổ chữ (-5%)"
        className={cn(
          'inline-flex h-7 cursor-pointer items-center justify-center rounded-full px-2 font-serif text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35',
          isDark ? 'text-[#EBF0EE] hover:bg-white/10' : 'text-[#182624] hover:bg-[#FAFBF9]',
        )}
      >
        A-
      </button>

      {showScaleReadout && (
        <span
          data-testid="quick-reader-scale-badge"
          aria-live="polite"
          className={cn(
            'px-1 font-mono text-[10px] font-semibold tabular-nums',
            isDark ? 'text-[#9EC5B8]' : 'text-[#1E332E]',
          )}
        >
          {scalePercent}%
        </span>
      )}

      <button
        type="button"
        onClick={() => {
          increaseFontScale();
          flashReadout();
        }}
        disabled={isMax}
        aria-label="Tăng cỡ chữ"
        title="Tăng khổ chữ (+5%)"
        className={cn(
          'inline-flex h-7 cursor-pointer items-center justify-center rounded-full px-2 font-serif text-xs font-bold transition-colors focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-35',
          isDark ? 'text-[#EBF0EE] hover:bg-white/10' : 'text-[#182624] hover:bg-[#FAFBF9]',
        )}
      >
        A+
      </button>

      <span
        className={cn('mx-0.5 h-4 w-[1px]', isDark ? 'bg-white/15' : 'bg-[#D8E0DD]')}
        aria-hidden="true"
      />

      <button
        type="button"
        data-testid="eye-comfort-toggle"
        onClick={toggleEyeComfortWarmth}
        aria-pressed={readerSettings.eyeComfortWarmth}
        aria-label="Chế độ dịu mắt"
        title={
          readerSettings.eyeComfortWarmth
            ? 'Tắt chế độ dịu mắt (đang bật sắc ngà ấm)'
            : 'Bật chế độ dịu mắt (giảm ánh sáng xanh)'
        }
        className={cn(
          'inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none',
          readerSettings.eyeComfortWarmth
            ? 'bg-[#1E332E] text-[#FCD34D] shadow-2xs'
            : isDark
              ? 'text-[#B8C7C2] hover:bg-white/10 hover:text-[#EBF0EE]'
              : 'text-[#4A5D58] hover:bg-[#FAFBF9] hover:text-[#182624]',
        )}
      >
        <Moon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </div>
  );
};
