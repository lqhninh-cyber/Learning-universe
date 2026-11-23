import { type CSSProperties, useState } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SpecimenChapterBarData {
  readonly id: string;
  readonly title: string;
  readonly totalLessons: number;
  readonly completedLessons: number;
}

export interface SpecimenFxBarsProps {
  readonly chapters: readonly SpecimenChapterBarData[];
  readonly accentHex: string;
  readonly darkAccentHex?: string;
  /** Kích hoạt sóng nhảy nhẹ giữa các cột khi rê chuột vào thẻ Specimen */
  readonly isCardHovered?: boolean;
  readonly className?: string;
  readonly 'data-testid'?: string;
}

const DARK_BAR_ACCENT_FALLBACKS: Record<string, string> = {
  '#1E332E': '#52B394',
  '#8C5828': '#D99B5E',
  '#1D4F6E': '#64A8D1',
  '#1B5E4A': '#52B394',
  '#8F3D35': '#DF7B70',
};

/**
 * Biểu đồ cột vi mật độ chương học (chuyển thể từ fx-bars của taste-skill).
 * Mỗi cột ứng với một chương, có vạch thang chuẩn nền 50%/100%, mực khoáng thạch theo tiến độ
 * và hiệu ứng gợn sóng lệch pha nhẹ khi hover vào thẻ môn học.
 */
export function SpecimenFxBars({
  chapters,
  accentHex,
  darkAccentHex,
  isCardHovered = false,
  className,
  'data-testid': dataTestId = 'specimen-fx-bars',
}: SpecimenFxBarsProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxLessons = chapters.reduce((acc, ch) => Math.max(acc, ch.totalLessons), 1);

  if (chapters.length === 0) return null;

  const activeChapter = hoveredIdx !== null ? chapters[hoveredIdx] : null;
  const resolvedDarkAccent =
    darkAccentHex ?? DARK_BAR_ACCENT_FALLBACKS[accentHex.toUpperCase()] ?? accentHex;
  const barVarsStyle = {
    '--fx-bar-accent': accentHex,
    '--fx-bar-accent-dark': resolvedDarkAccent,
  } as CSSProperties;

  return (
    <div
      data-testid={dataTestId}
      style={barVarsStyle}
      className={cn('relative inline-flex items-end gap-2', className)}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {activeChapter && (
        <span
          role="status"
          className="lu-tabular-telemetry pointer-events-none border border-[#CFD8D4] bg-[#FAFBF9] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.06em] text-[#162623] shadow-xs dark:border-[#34433E] dark:bg-[#181F1D] dark:text-[#EFF4F2]"
        >
          Ch.{(hoveredIdx ?? 0) + 1}: {activeChapter.completedLessons}/{activeChapter.totalLessons}
        </span>
      )}

      <div
        className="relative flex h-8 items-end gap-1 border border-[#CFD8D4] bg-[#F2F5F4]/95 px-2 py-1 dark:border-[#242E2B] dark:bg-[#121716]/95"
        aria-label={`Biểu đồ tiến độ ${chapters.length} chương`}
      >
        {/* Vạch thang chia đứt nét 50% từ fx-bars */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-1 left-1 border-t border-dashed border-[#CFD8D4] dark:border-[#2A3733]"
        />

        {chapters.map((chapter, idx) => {
          const heightPct = Math.max(32, Math.round((chapter.totalLessons / maxLessons) * 100));
          const fillPct =
            chapter.totalLessons > 0
              ? Math.min(100, Math.round((chapter.completedLessons / chapter.totalLessons) * 100))
              : 0;
          const isBarHovered = hoveredIdx === idx;

          return (
            <button
              key={chapter.id}
              type="button"
              onMouseEnter={() => setHoveredIdx(idx)}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx(null)}
              title={`${chapter.title}: ${chapter.completedLessons}/${chapter.totalLessons} bài`}
              aria-label={`${chapter.title}: hoàn thành ${chapter.completedLessons} trên ${chapter.totalLessons} bài`}
              className="group relative z-[1] flex h-full w-1.5 items-end overflow-hidden bg-[#DCE3DF] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E332E] dark:bg-[#1B2421] dark:focus-visible:ring-[#52B394]"
            >
              <span
                className={cn(
                  'relative block w-full bg-[#B9C5C0] transition-[transform,opacity] duration-200 dark:bg-[#2E3C37]',
                  isCardHovered && 'lu-fx-bar-wave',
                )}
                style={{
                  height: `${heightPct}%`,
                  animationDelay: isCardHovered ? `${idx * 55}ms` : undefined,
                  transform: isBarHovered ? 'scaleY(1.12)' : undefined,
                  transformOrigin: 'bottom',
                }}
              >
                <span
                  className="lu-fx-bar-fill absolute inset-x-0 bottom-0 block transition-[height,opacity] duration-300"
                  style={{
                    height: `${Math.max(fillPct, isCardHovered ? 18 : 0)}%`,
                    opacity: fillPct > 0 ? 1 : isCardHovered ? 0.32 : 0,
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
