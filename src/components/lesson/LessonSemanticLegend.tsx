import { BookOpenCheck, Layers } from 'lucide-react';
import type { FC } from 'react';
import { type ReadingTheme, useReadingSettings } from '@/context/ReadingSettingsContext';
import { cn } from '@/shared/lib/cn';

export interface LessonSemanticLegendProps {
  readonly readingTheme?: ReadingTheme;
  readonly className?: string;
}

/**
 * Thanh chú giải màu ngữ nghĩa & nút bật/tắt nhanh chế độ "Đọc lướt định lý"
 * Giúp người học nhận diện tức thì Định nghĩa / Định lý / Ví dụ và thu gọn chứng minh khi ôn tập.
 */
export const LessonSemanticLegend: FC<LessonSemanticLegendProps> = ({
  readingTheme: propTheme,
  className,
}) => {
  const { theme, isSkimmingMode, toggleSkimmingMode } = useReadingSettings();
  const activeTheme = propTheme ?? theme;
  const isDark = activeTheme === 'dark';
  const isSepia = activeTheme === 'sepia';

  return (
    <div
      role="region"
      aria-label="Chú giải khối kiến thức và chế độ đọc lướt định lý"
      data-testid="lesson-semantic-legend"
      className={cn(
        'mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 text-xs transition-colors',
        isDark
          ? 'border-[#2A323A] bg-[#14181D]/90 text-[#CBD5E1]'
          : isSepia
            ? 'border-[#DECDB0] bg-[#F4EEDF]/90 text-[#3D3629]'
            : 'border-[#CFDADB] bg-[#F3F7F7]/85 text-[#29383D]',
        className,
      )}
    >
      {/* Chú giải 3 nhóm màu ngữ nghĩa */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 font-medium">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: 'var(--kb-def-accent)' }}
            aria-hidden="true"
          />
          <span>Định nghĩa</span>
        </span>

        <span
          className="hidden h-3 w-px bg-current opacity-20 sm:inline-block"
          aria-hidden="true"
        />

        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: 'var(--kb-thm-accent)' }}
            aria-hidden="true"
          />
          <span>Định lý, tính chất</span>
        </span>

        <span
          className="hidden h-3 w-px bg-current opacity-20 sm:inline-block"
          aria-hidden="true"
        />

        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: 'var(--kb-ex-accent)' }}
            aria-hidden="true"
          />
          <span>Ví dụ (bấm để thu gọn)</span>
        </span>
      </div>

      {/* Nút chuyển đổi Chế độ Đọc lướt định lý (Cheat-sheet toggle) */}
      <button
        type="button"
        onClick={toggleSkimmingMode}
        aria-pressed={isSkimmingMode}
        aria-label="Đọc lướt định lý (Ẩn Ví dụ & Chứng minh)"
        title={
          isSkimmingMode
            ? 'Đang bật chế độ Đọc lướt định lý (Chỉ giữ Định nghĩa & Định lý). Bấm để hiện lại toàn bộ Ví dụ & Chứng minh.'
            : 'Đọc lướt định lý (Ẩn Ví dụ & Chứng minh)'
        }
        data-testid="skim-mode-legend-toggle"
        className={cn(
          'inline-flex min-h-[32px] cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200',
          'hover:-translate-y-px active:scale-[0.98]',
          'focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:ring-offset-1 focus-visible:outline-none',
          isSkimmingMode
            ? isDark
              ? 'border-[#C5A262] bg-[#C5A262] text-[#0A1F16] shadow-xs hover:bg-[#D4B06F]'
              : 'border-[#9B2C3D] bg-[#9B2C3D] text-white shadow-xs hover:bg-[#822231]'
            : isDark
              ? 'border-[#2E3842] bg-[#1D242B] text-[#E2E8F0] hover:border-[#8DB6F2]/50 hover:bg-[#242C35]'
              : isSepia
                ? 'border-[#C9B38C] bg-[#FBF8EF] text-[#3D3629] hover:border-[#8B2635]/50 hover:bg-white'
                : 'border-[#BFD0D2] bg-white text-[#29383D] hover:border-[#9B2C3D]/40 hover:bg-[#FBEAED]/40',
        )}
      >
        {isSkimmingMode ? (
          <BookOpenCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        ) : (
          <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        )}
        <span>{isSkimmingMode ? 'Đang đọc lướt định lý' : 'Đọc lướt định lý'}</span>
      </button>
    </div>
  );
};

export default LessonSemanticLegend;
