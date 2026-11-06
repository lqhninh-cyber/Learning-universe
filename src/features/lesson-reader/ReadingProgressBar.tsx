import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';

/** Bộ chọn khung bài đọc chính dùng để đo độ sâu cuộn trang. */
const READING_ARTICLE_SELECTOR = '[data-reading-article]';

export interface ReadingProgressBarProps {
  readonly className?: string;
  /** Bộ chọn CSS của phần tử cần đo tiến độ (mặc định: khung bài đọc chính). */
  readonly targetSelector?: string;
}

/**
 * Tính tỉ lệ đã đọc (0 → 1) của một phần tử theo vị trí cuộn hiện tại của cửa sổ.
 * Trả về `null` khi không tìm thấy phần tử (không phải trang bài học).
 */
function computeReadingProgress(target: Element | null): number | null {
  if (!target || typeof window === 'undefined') {
    return null;
  }

  const rect = target.getBoundingClientRect();
  const viewport = window.innerHeight || document.documentElement.clientHeight;
  const scrollable = rect.height - viewport;

  if (scrollable <= 0) {
    return rect.top <= 0 ? 1 : 0;
  }

  const ratio = -rect.top / scrollable;
  return Math.min(1, Math.max(0, ratio));
}

/**
 * Thanh chỉ báo tiến độ đọc bài siêu mảnh (cao 2px).
 * Tự lấp đầy từ 0% đến 100% theo độ sâu cuộn của khung bài đọc; tự ẩn khi không có bài đọc.
 */
export function ReadingProgressBar({
  className,
  targetSelector = READING_ARTICLE_SELECTOR,
}: ReadingProgressBarProps) {
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      setProgress(computeReadingProgress(document.querySelector(targetSelector)));
    };
    const schedule = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(update);
      }
    };

    update();
    // Bài học MDX được nạp bất đồng bộ: đo lại sau một nhịp ngắn để bắt kịp nội dung vừa hiển thị.
    const lateCheck = window.setTimeout(update, 600);

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.clearTimeout(lateCheck);
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [targetSelector]);

  if (progress === null) {
    return null;
  }

  const percent = Math.round(progress * 100);

  return (
    <div
      role="progressbar"
      aria-label="Tiến độ đọc bài"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn('pointer-events-none h-[2px] overflow-hidden', className)}
    >
      <div
        className="h-full w-full origin-left bg-stone-700/70 transition-transform duration-150 ease-out motion-reduce:transition-none"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}

export default ReadingProgressBar;
