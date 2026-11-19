import { ChevronLeft, ChevronRight, Pause, Play, Quote } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface ScholarlyQuote {
  readonly id: number;
  readonly content: string;
  readonly author: string;
  readonly roleOrEra: string;
  readonly discipline: string;
}

/**
 * Danh sách 15 câu danh ngôn kinh điển về Giáo dục, Triết học và Toán học
 * được chỉ định chuẩn mực cho không gian học thuật Learning Universe.
 */
export const SCHOLARLY_QUOTES: readonly ScholarlyQuote[] = [
  {
    id: 1,
    content: 'Vì lợi ích mười năm thì phải trồng cây, vì lợi ích trăm năm thì phải trồng người.',
    author: 'Hồ Chí Minh',
    roleOrEra: 'Chủ tịch nước Việt Nam Dân chủ Cộng hòa',
    discipline: 'Triết học Giáo dục',
  },
  {
    id: 2,
    content: 'Nhà giáo dục trước hết phải tự mình được giáo dục.',
    author: 'Karl Marx',
    roleOrEra: 'Luận cương về Feuerbach (1845)',
    discipline: 'Triết học Giáo dục',
  },
  {
    id: 3,
    content: 'Học, học nữa, học mãi.',
    author: 'V. I. Lênin',
    roleOrEra: 'Nhà tư tưởng & Lãnh tụ cách mạng',
    discipline: 'Phương pháp học tập',
  },
  {
    id: 4,
    content: 'Dưới ánh mặt trời không có nghề nào cao quý hơn nghề dạy học.',
    author: 'J. A. Cômenxki (Comenius)',
    roleOrEra: 'Ông tổ của nền Sư phạm cận đại',
    discipline: 'Sư phạm học',
  },
  {
    id: 5,
    content:
      'Hiền tài là nguyên khí của quốc gia, nguyên khí thịnh thì thế nước mạnh rồi lên cao, nguyên khí suy thì thế nước yếu rồi xuống thấp.',
    author: 'Thân Nhân Trung',
    roleOrEra: 'Văn bia Quốc Tử Giám (1442)',
    discipline: 'Hiền tài & Quốc học',
  },
  {
    id: 6,
    content: 'Phi trí bất hưng, phi nông bất ổn, phi công bất phú, phi thương bất hoạt.',
    author: 'Lê Quý Đôn',
    roleOrEra: 'Nhà bác học thời Lê Trung Hưng',
    discipline: 'Bác học & Khai phóng',
  },
  {
    id: 7,
    content: 'Giáo dục là vũ khí mạnh nhất mà bạn có thể dùng để thay đổi thế giới.',
    author: 'Nelson Mandela',
    roleOrEra: 'Giải Nobel Hòa bình (1993)',
    discipline: 'Triết học Giáo dục',
  },
  {
    id: 8,
    content: 'Giáo dục không phải là học thuộc lòng sự thật, mà là rèn luyện tâm trí để tư duy.',
    author: 'Albert Einstein',
    roleOrEra: 'Nhà vật lý lý thuyết lỗi lạc',
    discipline: 'Tư duy Khoa học',
  },
  {
    id: 9,
    content: 'Lao động đã sáng tạo ra bản thân con người.',
    author: 'Friedrich Engels',
    roleOrEra: 'Biện chứng của tự nhiên',
    discipline: 'Triết học & Tự nhiên',
  },
  {
    id: 10,
    content: 'Người thầy tồi mang đến chân lý, người thầy giỏi dạy cách tìm ra chân lý.',
    author: 'A. F. Đixtecvec (Diesterweg)',
    roleOrEra: 'Nhà sư phạm tiến bộ Đức',
    discipline: 'Phương pháp Sư phạm',
  },
  {
    id: 11,
    content: 'Rễ của giáo dục thì đắng, nhưng quả của nó lại ngọt ngào.',
    author: 'Aristotle',
    roleOrEra: 'Triết gia Hy Lạp cổ đại',
    discipline: 'Triết học Cổ đại',
  },
  {
    id: 12,
    content:
      'Bạn không thể dạy một người bất cứ điều gì; bạn chỉ có thể giúp họ tìm thấy điều đó bên trong chính họ.',
    author: 'Galileo Galilei',
    roleOrEra: 'Nhà thiên văn & Vật lý học',
    discipline: 'Khoa học Tự nhiên',
  },
  {
    id: 13,
    content: 'Tôi tư duy, nên tôi tồn tại.',
    author: 'René Descartes',
    roleOrEra: 'Nhà triết học & Toán học Pháp',
    discipline: 'Triết học & Toán học',
  },
  {
    id: 14,
    content: 'Học mà không suy nghĩ thì vô ích, suy nghĩ mà không học thì nguy hiểm.',
    author: 'Khổng Tử',
    roleOrEra: 'Luận ngữ',
    discipline: 'Triết học Phương Đông',
  },
  {
    id: 15,
    content: 'Nghề dạy học là nghề sáng tạo vào bậc nhất trong các nghề sáng tạo.',
    author: 'Phạm Văn Đồng',
    roleOrEra: 'Thủ tướng Chính phủ Việt Nam',
    discipline: 'Nghệ thuật Sư phạm',
  },
] as const;

const ROTATION_INTERVAL_MS = 20000;
const FADE_TRANSITION_MS = 300;

export interface RotatingScholarlyQuoteProps {
  readonly variant?: 'card' | 'dock' | 'hero';
  readonly className?: string;
}

export function RotatingScholarlyQuote({
  variant = 'card',
  className,
}: RotatingScholarlyQuoteProps = {}) {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const elapsedMsRef = useRef(0);
  const fadeTimerRef = useRef<number | null>(null);

  const totalQuotes = SCHOLARLY_QUOTES.length;
  const currentQuote = SCHOLARLY_QUOTES[currentIndex] ?? SCHOLARLY_QUOTES[0]!;
  const isDock = variant === 'dock';

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  const goToQuote = useCallback(
    (newIndex: number) => {
      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = null;
      }
      elapsedMsRef.current = 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = 'scaleX(0)';
      }
      if (prefersReducedMotion) {
        setCurrentIndex((newIndex + totalQuotes) % totalQuotes);
        return;
      }
      setIsFading(true);
      fadeTimerRef.current = window.setTimeout(() => {
        fadeTimerRef.current = null;
        setCurrentIndex((newIndex + totalQuotes) % totalQuotes);
        setIsFading(false);
      }, FADE_TRANSITION_MS);
    },
    [prefersReducedMotion, totalQuotes],
  );

  const handleNext = useCallback(() => {
    goToQuote(currentIndex + 1);
  }, [currentIndex, goToQuote]);

  const handlePrev = useCallback(() => {
    goToQuote(currentIndex - 1);
  }, [currentIndex, goToQuote]);

  // Luân phiên tự động mỗi 20 giây & cập nhật thanh tiến trình vàng 1.5px chuẩn 120fps (tạm dừng khi hover/pause)
  useEffect(() => {
    if (isPaused) {
      return;
    }

    let rafId = 0;
    let lastTick = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(250, Math.max(0, now - lastTick));
      lastTick = now;
      elapsedMsRef.current += dt;

      const ratio = Math.min(1, elapsedMsRef.current / ROTATION_INTERVAL_MS);
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`;
      }

      if (elapsedMsRef.current >= ROTATION_INTERVAL_MS) {
        elapsedMsRef.current = 0;
        handleNext();
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [handleNext, isPaused]);

  const formattedIndex = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalQuotes).padStart(2, '0');

  return (
    <aside
      data-testid="rotating-scholarly-quote"
      aria-label="Danh ngôn học thuật kinh điển"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        'group relative w-full overflow-hidden rounded-2xl border border-[#D2DDD8] bg-[#FAFBF9]/85 shadow-[0_20px_50px_rgba(24,38,36,0.09)] backdrop-blur-xl transition-[border-color,box-shadow] duration-300 hover:border-[#B9C9C2]',
        isDock ? 'px-4 py-3.5 sm:px-5 sm:py-4' : 'p-6',
        className,
      )}
    >
      {/* Thanh tiến trình đồng cổ 2px chạy dọc mép trên báo hiệu thời gian chuyển câu (tạm dừng khi hover) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-[#D2DDD8]/70"
      >
        <div
          ref={progressBarRef}
          data-testid="quote-progress-bar"
          className="h-full w-full origin-left bg-[#9C7A4C] will-change-transform"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Header: Phân loại & Điều khiển luân phiên */}
      <div
        className={cn(
          'flex items-center justify-between gap-3 border-b border-[#D2DDD8]/90',
          isDock ? 'pb-2' : 'pb-3',
        )}
      >
        <div className="flex items-center gap-2">
          <Quote className="h-3.5 w-3.5 text-[#9C7A4C]" aria-hidden="true" />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-[#2B4B43] uppercase">
            DANH NGÔN HỌC THUẬT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="lu-tabular-telemetry font-mono text-[11px] font-medium text-[#46605A]">
            {formattedIndex} / {formattedTotal}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Câu danh ngôn trước"
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#D0DCD7] bg-[#FAFBF9] text-[#1E332E] transition-colors hover:border-[#9C7A4C] hover:bg-[#EDF2F0]"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Tiếp tục tự động chuyển câu' : 'Tạm dừng tự động chuyển câu'}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#D0DCD7] bg-[#FAFBF9] text-[#1E332E] transition-colors hover:border-[#9C7A4C] hover:bg-[#EDF2F0]"
            >
              {isPaused ? (
                <Play className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Pause className="h-3 w-3" aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Câu danh ngôn tiếp theo"
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#D0DCD7] bg-[#FAFBF9] text-[#1E332E] transition-colors hover:border-[#9C7A4C] hover:bg-[#EDF2F0]"
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Nội dung trích dẫn với hiệu ứng mờ dần & trượt nhẹ translateY(6px -> 0) */}
      <blockquote
        className={cn(
          'transition-[transform,opacity] duration-300 ease-out will-change-transform',
          isDock ? 'mt-2.5' : 'mt-3.5',
          isFading ? 'translate-y-[6px] opacity-0' : 'translate-y-0 opacity-100',
        )}
      >
        <p
          className={cn(
            'font-serif text-[#182624] italic',
            isDock
              ? 'mb-1.5 text-[14.5px] leading-relaxed sm:text-[15.5px]'
              : 'mb-3.5 text-[17px] leading-[1.65] lg:text-[18px]',
          )}
        >
          &ldquo;{currentQuote.content}&rdquo;
        </p>
        <div className="mt-2 flex w-full flex-wrap items-center justify-end gap-2.5 border-t border-[#D2DDD8]/80 pt-2">
          <span
            data-testid="quote-discipline-badge"
            className="inline-flex items-center rounded-full border border-[#D0DCD7] bg-[#EDF2F0] px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-[#2B4B43]"
          >
            {currentQuote.discipline}
          </span>
          <footer className="text-right font-mono text-xs font-medium text-[#8C6228]">
            — {currentQuote.author}
            {currentQuote.roleOrEra ? ` · ${currentQuote.roleOrEra}` : ''}
          </footer>
        </div>
      </blockquote>
    </aside>
  );
}
