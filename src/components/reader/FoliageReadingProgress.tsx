import { useEffect, useRef, useState, type FC, type RefObject } from 'react';
import { cn } from '@/shared/lib/cn';

export interface FoliageReadingProgressProps {
  /** Ref trỏ tới container chứa nội dung bài đọc (<article>) */
  readonly articleContainerRef: RefObject<HTMLElement | null>;
  readonly className?: string;
}

interface HeadingNode {
  readonly id: string;
  readonly text: string;
  readonly level: 'h2' | 'h3';
  readonly ratio: number; // Tỷ lệ vị trí dọc theo thân cây (0 đến 1)
  readonly element: HTMLElement;
}

/**
 * Tính tỉ lệ đã đọc (0 → 1) theo vị trí cuộn của khung bài đọc mục tiêu
 */
function computeReadingProgress(target: HTMLElement | null): number {
  if (!target || typeof window === 'undefined') {
    return 0;
  }

  const rect = target.getBoundingClientRect();
  if (rect.height <= 0) {
    return 0;
  }

  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const scrollable = rect.height - viewport;

  if (scrollable <= 0) {
    return rect.top <= 0 && rect.bottom <= viewport ? 1 : 0;
  }

  const ratio = -rect.top / scrollable;
  return Math.min(1, Math.max(0, ratio));
}

/**
 * FOLIAGE READING PROGRESS (VẠCH TIẾN ĐỘ MẦM CÂY SINH TRƯỞNG)
 *
 * Tính năng vạch tiến độ đọc mầm cây sinh trưởng thay thế thanh cuộn ngang cũ:
 * - Cố định dọc lề trái: `fixed left-4 xl:left-8 top-28 bottom-24 z-30` (chỉ hiện trên màn hình lớn `hidden lg:flex`).
 * - Trục thân cây: Đường thẳng đứng 1.5px màu xanh rêu (`#1E3B2E`).
 * - Dòng nhựa tăng trưởng: Dải gradient `#2E6B4F` -> `#739B88` -> `#C5A262` phủ lên trục theo tỷ lệ cuộn (0% -> 100%).
 * - Mầm lá bung nở tại các đề mục H2 (lá lớn), H3 (lá nhỏ) với Trắng Giấy Dó `#F5F2EB` và viền Vàng Thếp `#C5A262`.
 * - Mầm lá kép vàng trượt theo dòng nhựa (< 98.5%) và nở bung đóa sen vàng mini (Golden Lotus) khi hoàn thành (>= 98.5%).
 * - Tương thích hoàn hảo với Chế độ Zen và Dark Mode, tối ưu hiệu năng 60fps với requestAnimationFrame.
 */
export const FoliageReadingProgress: FC<FoliageReadingProgressProps> = ({
  articleContainerRef,
  className,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [headings, setHeadings] = useState<readonly HeadingNode[]>([]);
  const stemTrackRef = useRef<HTMLDivElement>(null);

  // 1. Quét và định vị các đề mục H2 & H3 trong bài viết
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const scanHeadings = () => {
      const article = articleContainerRef.current;
      if (!article) return;

      const headingEls = article.querySelectorAll<HTMLHeadingElement>('h2, h3');
      const articleRect = article.getBoundingClientRect();
      const articleTopDoc = articleRect.top + window.scrollY;
      const articleHeight = articleRect.height || 1;

      const nodes: HeadingNode[] = [];
      headingEls.forEach((h, index) => {
        const text = h.textContent?.trim() || '';
        if (!text) return;

        const hRect = h.getBoundingClientRect();
        const hTopDoc = hRect.top + window.scrollY;
        const offset = hTopDoc - articleTopDoc;
        // Giữ vị trí lá non phân bố hài hòa trên thân cây từ 4% đến 95%
        const ratio = Math.min(0.95, Math.max(0.04, offset / articleHeight));

        nodes.push({
          id: h.id || `heading-node-${index}`,
          text,
          level: h.tagName.toLowerCase() as 'h2' | 'h3',
          ratio,
          element: h,
        });
      });

      setHeadings(nodes);
    };

    scanHeadings();

    // Bài học có công thức KaTeX hoặc hình vẽ nạp bất đồng bộ: quét lại sau một nhịp
    const lateTimer = window.setTimeout(scanHeadings, 600);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && articleContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        scanHeadings();
      });
      resizeObserver.observe(articleContainerRef.current);
    }

    return () => {
      window.clearTimeout(lateTimer);
      resizeObserver?.disconnect();
    };
  }, [articleContainerRef]);

  // 2. Theo dõi sự kiện cuộn với requestAnimationFrame (passive: true) tối ưu 60fps
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const p = computeReadingProgress(articleContainerRef.current);
      setProgress(p);
    };

    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    const timer = window.setTimeout(update, 500);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      window.clearTimeout(timer);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [articleContainerRef]);

  // Nhấp vào thân cây để cuộn nhanh đến tỷ lệ tương ứng
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const article = articleContainerRef.current;
    const track = stemTrackRef.current;
    if (!article || !track) return;

    const trackRect = track.getBoundingClientRect();
    const clickY = e.clientY - trackRect.top;
    const ratio = Math.min(1, Math.max(0, clickY / trackRect.height));

    const articleRect = article.getBoundingClientRect();
    const articleTopDoc = articleRect.top + window.scrollY;
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const scrollable = articleRect.height - viewport;

    const targetY = articleTopDoc + ratio * Math.max(0, scrollable);
    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const isComplete = progress >= 0.985;
  const percentText = `${Math.round(progress * 100)}%`;

  return (
    <aside
      role="navigation"
      aria-label="Vạch tiến độ mầm cây sinh trưởng"
      className={cn(
        'pointer-events-auto fixed top-28 bottom-24 left-4 z-30 hidden flex-col items-center transition-all duration-300 select-none lg:flex xl:left-8',
        className,
      )}
    >
      {/* Hạt mầm khởi nguyên ở đỉnh thân cây */}
      <div
        className="mb-1 h-2.5 w-2.5 rounded-full border border-[#739B88] bg-[#2E6B4F] shadow-2xs dark:border-[#A1D1B7] dark:bg-[#1E3B2E]"
        title="Khởi điểm bài học (0%)"
        aria-hidden="true"
      />

      {/* Trục thân cây & Dòng nhựa tăng trưởng */}
      <div
        ref={stemTrackRef}
        onClick={handleTrackClick}
        title={`Tiến độ đọc: ${percentText} — Bấm để cuộn nhanh`}
        className="relative flex w-6 flex-1 cursor-pointer justify-center"
      >
        {/* Đường trục thẳng đứng siêu mảnh 1.5px màu xanh rêu */}
        <div className="absolute top-0 bottom-0 w-[1.5px] rounded-full bg-[#1E3B2E]/25 dark:bg-[#739B88]/20" />

        {/* Dòng nhựa sinh trưởng gradient (#2E6B4F -> #739B88 -> #C5A262) */}
        <div
          className="absolute top-0 w-[2px] rounded-full bg-gradient-to-b from-[#2E6B4F] via-[#739B88] to-[#C5A262] shadow-[0_0_8px_rgba(197,162,98,0.4)] transition-all duration-75 ease-out"
          style={{ height: `${progress * 100}%` }}
        />

        {/* Mầm lá bung nở tại các đề mục H2 & H3 */}
        {headings.map((h, i) => {
          const isPassed = progress >= h.ratio;
          const isH2 = h.level === 'h2';
          const isLeft = i % 2 === 0;

          return (
            <div
              key={h.id}
              className="group absolute -translate-y-1/2 cursor-pointer transition-all duration-200"
              style={{ top: `${h.ratio * 100}%` }}
              onClick={(e) => {
                e.stopPropagation();
                h.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              aria-label={`Chuyển tới đề mục: ${h.text}`}
            >
              {isPassed ? (
                // Mầm lá non đã bung nở (Trắng Giấy Dó #F5F2EB viền Vàng Thếp #C5A262 / Xanh Men Ngọc #739B88)
                <div
                  className={cn(
                    'relative flex items-center justify-center transition-transform duration-300 hover:scale-135',
                    isLeft ? '-translate-x-1.5' : 'translate-x-1.5',
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className={cn(
                      'transition-colors duration-200',
                      isH2 ? 'h-4 w-4' : 'h-3.5 w-3.5',
                    )}
                    style={{
                      transform: isLeft ? 'rotate(-35deg)' : 'rotate(35deg) scaleX(-1)',
                      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.25))',
                    }}
                  >
                    <path
                      d="M21 3C11 3 3 11 3 21c2.5-4.5 7-7.5 12-7.5M21 3c0 10-8 18-18 18"
                      stroke={isH2 ? '#C5A262' : '#739B88'}
                      strokeWidth={isH2 ? '2' : '1.8'}
                      fill="#F5F2EB"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              ) : (
                // Nụ mầm chưa nở
                <div
                  className={cn(
                    'rounded-full transition-colors',
                    isH2
                      ? 'h-2 w-2 border border-[#1E3B2E]/40 bg-white/90 dark:border-[#739B88]/40 dark:bg-[#1E3B2E]/70'
                      : 'h-1.5 w-1.5 border border-[#1E3B2E]/30 bg-white/70 dark:border-[#739B88]/30 dark:bg-[#1E3B2E]/50',
                  )}
                />
              )}

              {/* Tooltip hiển thị tên đề mục khi hover */}
              <div
                className={cn(
                  'pointer-events-none absolute top-1/2 left-7 z-40 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100',
                  'max-w-xs truncate rounded-md border border-[#C5A262]/30 bg-[#0E2018]/95 px-2.5 py-1 text-xs text-[#F5F2EB] shadow-xl backdrop-blur-md',
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[10px] font-bold text-[#C5A262] uppercase">
                    {h.level.toUpperCase()}
                  </span>
                  <span className="truncate">{h.text}</span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Mầm lá kép trượt liên tục theo dòng nhựa (< 98.5%) */}
        {!isComplete && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
            style={{
              top: `${progress * 100}%`,
              left: '50%',
            }}
          >
            <div className="relative flex items-center justify-center">
              {/* Hào quang phát sáng nhẹ */}
              <div className="blur-2xs absolute h-5 w-5 animate-pulse rounded-full bg-[#C5A262]/30" />

              {/* Biểu tượng mầm lá kép màu vàng thếp #C5A262 */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-[#C5A262] drop-shadow-[0_0_6px_rgba(197,162,98,0.7)]"
              >
                <path d="M12 21V11" stroke="#C5A262" strokeWidth="2.2" strokeLinecap="round" />
                <path
                  d="M12 13C8.5 11 6 7 7 3C11 4 12 7.5 12 13Z"
                  fill="#FAF4E1"
                  stroke="#C5A262"
                  strokeWidth="1.8"
                />
                <path
                  d="M12 13C15.5 11 18 7 17 3C13 4 12 7.5 12 13Z"
                  fill="#FAF4E1"
                  stroke="#C5A262"
                  strokeWidth="1.8"
                />
              </svg>
            </div>
          </div>
        )}

        {/* Đóa sen vàng nở khi chạm đáy bài học (>= 98.5%) */}
        {isComplete && (
          <div
            className="absolute bottom-0 z-30 flex -translate-x-1/2 translate-y-1/2 flex-col items-center"
            style={{ left: '50%' }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="Chúc mừng đã hoàn thành bài học! Bấm để cuộn lên đầu trang"
              className="group relative flex cursor-pointer items-center justify-center focus:outline-none"
            >
              {/* Hào quang hoa sen phát sáng */}
              <div className="absolute h-9 w-9 animate-ping rounded-full bg-[#C5A262]/30 opacity-60 blur-xs" />

              {/* Đóa sen vàng mini (Golden Lotus) */}
              <svg
                viewBox="0 0 32 32"
                className="h-7 w-7 animate-pulse text-[#C5A262] drop-shadow-[0_0_10px_rgba(197,162,98,0.9)] transition-transform duration-300 group-hover:scale-125"
              >
                <path
                  d="M16 4C14 10 9 14 9 20C9 24 12 27 16 27C20 27 23 24 23 20C23 14 18 10 16 4Z"
                  fill="#FFFDF0"
                  stroke="#C5A262"
                  strokeWidth="1.8"
                />
                <path
                  d="M16 11C11 14 5 17 6 22C7 26 11 27 16 27"
                  fill="#FAF4E1"
                  stroke="#C5A262"
                  strokeWidth="1.5"
                  opacity="0.95"
                />
                <path
                  d="M16 11C21 14 27 17 26 22C25 26 21 27 16 27"
                  fill="#FAF4E1"
                  stroke="#C5A262"
                  strokeWidth="1.5"
                  opacity="0.95"
                />
                <circle cx="16" cy="19" r="2" fill="#E2B755" />
              </svg>

              {/* Nhãn "Đắc thụ 100%" */}
              <div className="absolute top-1/2 left-8 -translate-y-1/2 rounded-full border border-[#C5A262] bg-[#FDFBF7] px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-[#A87B28] shadow-md dark:bg-[#16271E] dark:text-[#C5A262]">
                Đắc thụ 100% 🪷
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Gốc cội rễ ở đáy thân cây */}
      <div
        className="mt-1 h-2 w-2 rounded-full border border-[#739B88] bg-[#1E3B2E]/60 dark:border-[#A1D1B7]/60 dark:bg-[#1E3B2E]"
        title="Gốc rễ tri thức"
        aria-hidden="true"
      />
    </aside>
  );
};

export default FoliageReadingProgress;
