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
    <>
      {/* 1. Thanh tiến độ đọc thích ứng di động (< 1024px) */}
      <div
        className="pointer-events-none fixed top-0 right-0 left-0 z-50 h-[2.5px] bg-transparent lg:hidden"
        aria-hidden="true"
      >
        <div
          className="h-full bg-gradient-to-r from-[#2E6B4F] via-[#739B88] to-[#C5A262] shadow-[0_1px_4px_rgba(197,162,98,0.4)] transition-all duration-75 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* 2. Vạch tiến độ mầm cây sinh trưởng dọc lề trái (Desktop >= 1024px) */}
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

          {/* Điểm mút kết thúc: Đóa hoa bung nở tại chân trục (Blooming flower at tip) */}
          <div
            className="absolute bottom-0 z-30 flex -translate-x-1/2 translate-y-1/2 items-center justify-center"
            style={{ left: '50%' }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              data-testid="foliage-bloom-flower"
              aria-label={
                isComplete
                  ? 'Đóa hoa tri thức nở rộ — Bấm để cuộn lên đầu trang'
                  : 'Điểm kết thúc bài học'
              }
              className="group relative flex cursor-pointer items-center justify-center focus:outline-none"
            >
              {/* Quầng hào quang mềm mại (subtle glow) lan tỏa khi chạm mốc 100% */}
              {isComplete && (
                <div
                  className="pointer-events-none absolute h-9 w-9 animate-pulse rounded-full bg-[#C5A262]/25 opacity-70 blur-xs transition-opacity duration-700"
                  aria-hidden="true"
                />
              )}

              {/* Đóa hoa sen tri thức bung nở (Blooming Lotus Flower) */}
              <svg
                viewBox="0 0 32 32"
                className={cn(
                  'h-7.5 w-7.5 transition-all duration-700 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]',
                  isComplete
                    ? 'scale-100 rotate-0 opacity-100 drop-shadow-[0_0_8px_rgba(197,162,98,0.55)]'
                    : 'scale-75 text-[#739B88] opacity-60',
                )}
              >
                {/* Đài sen ngọc bích */}
                <path
                  d="M10 24C12 26 20 26 22 24C21 26.5 11 26.5 10 24Z"
                  fill="#2E6B4F"
                  stroke="#1E3B2E"
                  strokeWidth="1"
                />

                {/* Tầng cánh ngoài đối xứng (Vàng Thếp Cổ #C5A262) */}
                <path
                  d={
                    isComplete
                      ? 'M16 13C9 13 4 18 5 23C7 26 12 25 16 23'
                      : 'M16 16C12 17 8 20 9 23C11 25 14 24 16 23'
                  }
                  fill={isComplete ? '#FAF4E1' : '#E2ECE6'}
                  stroke="#C5A262"
                  strokeWidth="1.5"
                  className="transition-all duration-700"
                />
                <path
                  d={
                    isComplete
                      ? 'M16 13C23 13 28 18 27 23C25 26 20 25 16 23'
                      : 'M16 16C20 17 24 20 23 23C21 25 18 24 16 23'
                  }
                  fill={isComplete ? '#FAF4E1' : '#E2ECE6'}
                  stroke="#C5A262"
                  strokeWidth="1.5"
                  className="transition-all duration-700"
                />

                {/* Tầng cánh trung gian bung xòe */}
                <path
                  d={
                    isComplete
                      ? 'M16 9C10 11 6 15 7 21C10 23 15 22 16 23'
                      : 'M16 13C13 15 11 18 12 21C13 22 15 22 16 23'
                  }
                  fill="#F5F2EB"
                  stroke="#C5A262"
                  strokeWidth="1.6"
                  className="transition-all duration-700"
                />
                <path
                  d={
                    isComplete
                      ? 'M16 9C22 11 26 15 25 21C22 23 17 22 16 23'
                      : 'M16 13C19 15 21 18 20 21C19 22 17 22 16 23'
                  }
                  fill="#F5F2EB"
                  stroke="#C5A262"
                  strokeWidth="1.6"
                  className="transition-all duration-700"
                />

                {/* Cánh hoa chính tâm vươn cao (Trắng Giấy Dó #F5F2EB viền Vàng Thếp #C5A262) */}
                <path
                  d={
                    isComplete
                      ? 'M16 4C13.5 9 10.5 14 10.5 19.5C10.5 23 13.5 24.5 16 24.5C18.5 24.5 21.5 23 21.5 19.5C21.5 14 18.5 9 16 4Z'
                      : 'M16 9C14.5 12 12.5 16 12.5 20C12.5 22 14.5 23.5 16 23.5C17.5 23.5 19.5 22 19.5 20C19.5 16 17.5 12 16 9Z'
                  }
                  fill="#FFFDF7"
                  stroke="#C5A262"
                  strokeWidth="1.8"
                  className="transition-all duration-700"
                />

                {/* Nhụy hoa tâm sáng ngọc bích #739B88 */}
                <circle
                  cx="16"
                  cy="19"
                  r={isComplete ? '2.2' : '1.5'}
                  fill="#739B88"
                  className="transition-all duration-700"
                />
                {isComplete && <circle cx="16" cy="19" r="1" fill="#E5B25D" />}
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default FoliageReadingProgress;
