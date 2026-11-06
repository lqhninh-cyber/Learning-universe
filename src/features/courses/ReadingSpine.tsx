import { type FC, useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';

export interface ReadingSpineStage {
  readonly id: string;
  readonly symbol: string;
  readonly title: string;
  readonly anchorId?: string;
}

export const DEFAULT_READING_SPINE_STAGES: readonly ReadingSpineStage[] = [
  {
    id: 'stage-0',
    symbol: '§0',
    title: 'Mở đầu / Bối cảnh (§0)',
  },
  {
    id: 'stage-1',
    symbol: '§1',
    title: 'Hệ tiên đề & Bổ đề (§1)',
  },
  {
    id: 'stage-2',
    symbol: '§2',
    title: 'Định lý chính (§2)',
  },
  {
    id: 'stage-3',
    symbol: '§3',
    title: 'Chứng minh chi tiết (§3)',
  },
  {
    id: 'stage-4',
    symbol: '§4',
    title: 'Bài tập thực hành & Phản ví dụ (§4)',
  },
];

export interface ReadingSpineProps {
  readonly stages?: readonly ReadingSpineStage[];
  readonly activeIndex?: number;
  readonly className?: string;
}

/**
 * Trục Tọa Độ Đọc & Chuỗi Chỉ Báo Tiến Trình (Minimal Reading Spine):
 * - Nằm cố định ở lề ngoài bên trái trang đọc (`fixed left-6 top-32 bottom-24 hidden xl:flex flex-col items-center z-30`).
 * - Trục kẻ dọc 1px kèm 5 hạt mốc tròn siêu nhỏ (`beads`) tương ứng với 5 chặng nhận thức của bài học (§0 → §4).
 * - Hạt mốc đang đọc sáng lên với sắc hổ phách ấm (`#E09F5A` / `#9E3D24`) và hiển thị tooltip tiêu đề khi rê chuột.
 */
export const ReadingSpine: FC<ReadingSpineProps> = ({
  stages = DEFAULT_READING_SPINE_STAGES,
  activeIndex: controlledIndex,
  className,
}) => {
  const [scrollActiveIndex, setScrollActiveIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (controlledIndex !== undefined || typeof window === 'undefined') {
      return;
    }

    const handleScroll = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const ratio = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const nextIndex = Math.min(stages.length - 1, Math.floor(ratio * stages.length));
      setScrollActiveIndex(nextIndex);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [controlledIndex, stages.length]);

  const currentActiveIndex = controlledIndex ?? scrollActiveIndex;

  const handleSelectStage = (stage: ReadingSpineStage, index: number) => {
    if (typeof window === 'undefined') return;

    if (stage.anchorId) {
      const el = document.getElementById(stage.anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }

    const doc = document.documentElement;
    const maxScroll = Math.max(0, doc.scrollHeight - window.innerHeight);
    const targetTop = stages.length > 1 ? (index / (stages.length - 1)) * maxScroll : 0;

    try {
      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    } catch {
      // Bỏ qua trong môi trường kiểm thử jsdom
    }
  };

  return (
    <nav
      aria-label="Trục tọa độ tiến trình đọc bài"
      data-testid="reading-spine"
      className={cn(
        'fixed top-32 bottom-24 left-6 z-30 hidden flex-col items-center xl:flex print:hidden',
        className,
      )}
    >
      <div className="relative flex h-full flex-col items-center justify-between py-2">
        {/* Đường kẻ trục dọc 1px chạy xuyên suốt */}
        <div
          aria-hidden="true"
          className="absolute inset-y-2 left-1/2 w-px -translate-x-1/2 bg-stone-300/75 dark:bg-stone-700/75"
        />

        {stages.map((stage, index) => {
          const isActive = index === currentActiveIndex;
          const isPassed = index < currentActiveIndex;
          const isHovered = hoveredId === stage.id;

          return (
            <div key={stage.id} className="relative z-10 flex items-center">
              <button
                type="button"
                onClick={() => handleSelectStage(stage, index)}
                onMouseEnter={() => setHoveredId(stage.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(stage.id)}
                onBlur={() => setHoveredId(null)}
                aria-label={stage.title}
                aria-current={isActive ? 'step' : undefined}
                className="group relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-full focus:outline-none"
              >
                {/* Hạt mốc tròn (Bead) */}
                <span
                  className={cn(
                    'block rounded-full border transition-all duration-300',
                    isActive
                      ? 'h-3 w-3 scale-110 border-[#9E3D24] bg-[#E09F5A] shadow-[0_0_10px_rgba(224,159,90,0.75)] dark:border-[#E09F5A] dark:bg-[#E09F5A]'
                      : isPassed
                        ? 'h-2 w-2 border-[#9E3D24]/60 bg-[#9E3D24]/60 dark:border-[#E09F5A]/60 dark:bg-[#E09F5A]/60'
                        : 'h-2 w-2 border-stone-400 bg-[#FAF7F2] group-hover:scale-125 group-hover:border-[#E09F5A] dark:border-stone-600 dark:bg-[#12151A]',
                  )}
                />
              </button>

              {/* Nhãn ký hiệu §0..§4 tinh tế kèm Tooltip tiêu đề phần khi hover */}
              <div
                role="tooltip"
                className={cn(
                  'pointer-events-none absolute left-7 flex items-center gap-2 rounded-full border border-stone-200/80 bg-[#FAF7F2]/95 px-3 py-1 text-xs whitespace-nowrap shadow-md backdrop-blur-md transition-all duration-200 dark:border-stone-700/80 dark:bg-[#1A2026]/95',
                  isHovered || isActive ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-0',
                )}
              >
                <span
                  className={cn(
                    'font-mono text-[10px] font-bold',
                    isActive
                      ? 'text-[#9E3D24] dark:text-[#E09F5A]'
                      : 'text-stone-500 dark:text-stone-400',
                  )}
                >
                  {stage.symbol}
                </span>
                <span className="font-serif text-xs font-medium text-stone-800 dark:text-stone-200">
                  {stage.title}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default ReadingSpine;
