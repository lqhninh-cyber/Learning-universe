import type { FC } from 'react';
import { type ReadingTheme, useReadingSettings } from '@/context/ReadingSettingsContext';
import { cn } from '@/shared/lib/cn';

export interface LessonSemanticLegendProps {
  readonly readingTheme?: ReadingTheme;
  readonly className?: string;
}

/**
 * Thanh chú giải 3 nhóm màu ngữ nghĩa học thuật (Định nghĩa, Định lý/Tính chất, Ví dụ).
 */
export const LessonSemanticLegend: FC<LessonSemanticLegendProps> = ({
  readingTheme: propTheme,
  className,
}) => {
  const { theme } = useReadingSettings();
  const activeTheme = propTheme ?? theme;
  const isDark = activeTheme === 'dark';
  const isSepia = activeTheme === 'sepia';

  return (
    <div
      role="region"
      aria-label="Chú giải màu ngữ nghĩa khối kiến thức"
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
    </div>
  );
};

export default LessonSemanticLegend;
