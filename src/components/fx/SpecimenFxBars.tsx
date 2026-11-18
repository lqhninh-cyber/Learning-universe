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
  readonly className?: string;
  readonly 'data-testid'?: string;
}

/**
 * Biểu đồ cột vi mật độ chương học (chuyển thể từ fx-bars của taste-skill).
 * Mỗi cột tương ứng một chương, chiều cao theo số bài học và mực khoáng thạch dâng theo tiến độ thực.
 */
export function SpecimenFxBars({
  chapters,
  accentHex,
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
          className="lu-tabular-telemetry pointer-events-none rounded border border-[#CFD8D4] bg-[#FAFBF9] px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.06em] text-[#162623] shadow-xs"
        >
          Ch.{(hoveredIdx ?? 0) + 1}: {activeChapter.completedLessons}/{activeChapter.totalLessons}
        </span>
      )}

      <div
        className="flex h-7 items-end gap-1 rounded border border-[#D8E0DD] bg-[#F2F5F4]/90 px-1.5 py-1"
        aria-label={`Biểu đồ tiến độ ${chapters.length} chương`}
      >
        {chapters.map((chapter, idx) => {
          const heightPct = Math.max(30, Math.round((chapter.totalLessons / maxLessons) * 100));
          const fillPct =
            chapter.totalLessons > 0
              ? Math.min(100, Math.round((chapter.completedLessons / chapter.totalLessons) * 100))
              : 0;
          const isHovered = hoveredIdx === idx;

          return (
            <button
              key={chapter.id}
              type="button"
              onMouseEnter={() => setHoveredIdx(idx)}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx(null)}
              title={`${chapter.title}: ${chapter.completedLessons}/${chapter.totalLessons} bài`}
              aria-label={`${chapter.title}: hoàn thành ${chapter.completedLessons} trên ${chapter.totalLessons} bài`}
              className="group relative flex h-full w-1.5 items-end overflow-hidden rounded-[2px] bg-[#DDE4E0] focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1E332E]"
            >
              <span
                className="relative block w-full rounded-[1px] bg-[#C5D0CB] transition-[transform,opacity] duration-200"
                style={{
                  height: `${heightPct}%`,
                  transform: isHovered ? 'scaleY(1.06)' : 'scaleY(1)',
                  transformOrigin: 'bottom',
                }}
              >
                <span
                  className="absolute inset-x-0 bottom-0 block rounded-[1px] transition-[height,opacity] duration-300"
                  style={{
                    height: `${fillPct}%`,
                    backgroundColor: accentHex,
                    opacity: fillPct > 0 ? 1 : 0,
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
