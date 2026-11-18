import { useState } from 'react';
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
  /** Kích hoạt sóng nhảy nhẹ giữa các cột khi rê chuột vào thẻ Specimen */
  readonly isCardHovered?: boolean;
  readonly className?: string;
  readonly 'data-testid'?: string;
}

/**
 * Biểu đồ cột vi mật độ chương học (chuyển thể từ fx-bars của taste-skill).
 * Mỗi cột ứng với một chương, có vạch thang chuẩn nền 50%/100%, mực khoáng thạch theo tiến độ
 * và hiệu ứng gợn sóng lệch pha nhẹ khi hover vào thẻ môn học.
 */
export function SpecimenFxBars({
  chapters,
  accentHex,
  isCardHovered = false,
  className,
  'data-testid': dataTestId = 'specimen-fx-bars',
}: SpecimenFxBarsProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxLessons = chapters.reduce((acc, ch) => Math.max(acc, ch.totalLessons), 1);

  if (chapters.length === 0) return null;

  const activeChapter = hoveredIdx !== null ? chapters[hoveredIdx] : null;

  return (
    <div
      data-testid={dataTestId}
      className={cn('relative inline-flex items-end gap-2', className)}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {activeChapter && (
        <span
          role="status"
          className="lu-tabular-telemetry pointer-events-none border border-[#CFD8D4] bg-[#FAFBF9] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.06em] text-[#162623] shadow-xs"
        >
          Ch.{(hoveredIdx ?? 0) + 1}: {activeChapter.completedLessons}/{activeChapter.totalLessons}
        </span>
      )}

      <div
        className="relative flex h-8 items-end gap-1 border border-[#CFD8D4] bg-[#F2F5F4]/95 px-2 py-1"
        aria-label={`Biểu đồ tiến độ ${chapters.length} chương`}
      >
        {/* Vạch thang chia đứt nét 50% từ fx-bars */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-1 left-1 border-t border-dashed border-[#CFD8D4]"
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
              className="group relative z-[1] flex h-full w-1.5 items-end overflow-hidden bg-[#DCE3DF] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E332E]"
            >
              <span
                className={cn(
                  'relative block w-full bg-[#B9C5C0] transition-[transform,opacity] duration-200',
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
                  className="absolute inset-x-0 bottom-0 block transition-[height,opacity] duration-300"
                  style={{
                    height: `${Math.max(fillPct, isCardHovered ? 18 : 0)}%`,
                    backgroundColor: accentHex,
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
