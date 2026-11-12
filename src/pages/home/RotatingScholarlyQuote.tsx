import { ChevronLeft, ChevronRight, Pause, Play, Quote } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { HeroAtmosphere } from '@/components/home/heroAtmosphere';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface ScholarlyQuote {
  readonly id: number;
  readonly content: string;
  readonly author: string;
  readonly roleOrEra: string;
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
  },
  {
    id: 2,
    content: 'Nhà giáo dục trước hết phải tự mình được giáo dục.',
    author: 'Karl Marx',
    roleOrEra: 'Luận cương về Feuerbach (1845)',
  },
  {
    id: 3,
    content: 'Học, học nữa, học mãi.',
    author: 'V. I. Lênin',
    roleOrEra: 'Nhà tư tưởng & Lãnh tụ cách mạng',
  },
  {
    id: 4,
    content: 'Dưới ánh mặt trời không có nghề nào cao quý hơn nghề dạy học.',
    author: 'J. A. Cômenxki (Comenius)',
    roleOrEra: 'Ông tổ của nền Sư phạm cận đại',
  },
  {
    id: 5,
    content:
      'Hiền tài là nguyên khí của quốc gia, nguyên khí thịnh thì thế nước mạnh rồi lên cao, nguyên khí suy thì thế nước yếu rồi xuống thấp.',
    author: 'Thân Nhân Trung',
    roleOrEra: 'Văn bia Quốc Tử Giám (1442)',
  },
  {
    id: 6,
    content: 'Phi trí bất hưng, phi nông bất ổn, phi công bất phú, phi thương bất hoạt.',
    author: 'Lê Quý Đôn',
    roleOrEra: 'Nhà bác học thời Lê Trung Hưng',
  },
  {
    id: 7,
    content: 'Giáo dục là vũ khí mạnh nhất mà bạn có thể dùng để thay đổi thế giới.',
    author: 'Nelson Mandela',
    roleOrEra: 'Giải Nobel Hòa bình (1993)',
  },
  {
    id: 8,
    content: 'Giáo dục không phải là học thuộc lòng sự thật, mà là rèn luyện tâm trí để tư duy.',
    author: 'Albert Einstein',
    roleOrEra: 'Nhà vật lý lý thuyết lỗi lạc',
  },
  {
    id: 9,
    content: 'Lao động đã sáng tạo ra bản thân con người.',
    author: 'Friedrich Engels',
    roleOrEra: 'Biện chứng của tự nhiên',
  },
  {
    id: 10,
    content: 'Người thầy tồi mang đến chân lý, người thầy giỏi dạy cách tìm ra chân lý.',
    author: 'A. F. Đixtecvec (Diesterweg)',
    roleOrEra: 'Nhà sư phạm tiến bộ Đức',
  },
  {
    id: 11,
    content: 'Rễ của giáo dục thì đắng, nhưng quả của nó lại ngọt ngào.',
    author: 'Aristotle',
    roleOrEra: 'Triết gia Hy Lạp cổ đại',
  },
  {
    id: 12,
    content:
      'Bạn không thể dạy một người bất cứ điều gì; bạn chỉ có thể giúp họ tìm thấy điều đó bên trong chính họ.',
    author: 'Galileo Galilei',
    roleOrEra: 'Nhà thiên văn & Vật lý học',
  },
  {
    id: 13,
    content: 'Tôi tư duy, nên tôi tồn tại.',
    author: 'René Descartes',
    roleOrEra: 'Nhà triết học & Toán học Pháp',
  },
  {
    id: 14,
    content: 'Học mà không suy nghĩ thì vô ích, suy nghĩ mà không học thì nguy hiểm.',
    author: 'Khổng Tử',
    roleOrEra: 'Luận ngữ',
  },
  {
    id: 15,
    content: 'Nghề dạy học là nghề sáng tạo vào bậc nhất trong các nghề sáng tạo.',
    author: 'Phạm Văn Đồng',
    roleOrEra: 'Thủ tướng Chính phủ Việt Nam',
  },
] as const;

const ROTATION_INTERVAL_MS = 20000;
const FADE_TRANSITION_MS = 350;

export interface RotatingScholarlyQuoteProps {
  readonly atmosphere?: HeroAtmosphere;
}

export function RotatingScholarlyQuote({ atmosphere = 'dawn' }: RotatingScholarlyQuoteProps) {
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const totalQuotes = SCHOLARLY_QUOTES.length;
  const currentQuote = SCHOLARLY_QUOTES[currentIndex] ?? SCHOLARLY_QUOTES[0]!;

  const goToQuote = useCallback(
    (newIndex: number) => {
      if (prefersReducedMotion) {
        setCurrentIndex((newIndex + totalQuotes) % totalQuotes);
        return;
      }
      setIsFading(true);
      window.setTimeout(() => {
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

  // Luân phiên tự động mỗi 20 giây khi không bị tạm dừng bởi hover
  useEffect(() => {
    if (isPaused) {
      return;
    }
    const timer = window.setInterval(() => {
      handleNext();
    }, ROTATION_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [handleNext, isPaused]);

  const formattedIndex = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(totalQuotes).padStart(2, '0');
  const isNight = atmosphere === 'night';
  const isSunset = atmosphere === 'sunset';

  const cardSurfaceClass = isNight
    ? 'border-[#86EFAC]/35 bg-[#0A1913]/78 hover:border-[#86EFAC]/60 shadow-lg shadow-black/25'
    : isSunset
      ? 'border-[#F6D383]/45 bg-[#162825]/76 hover:border-[#F6D383]/75 shadow-lg shadow-[#0B1D1B]/30'
      : 'border-[#5B8C5A]/40 bg-[#FFFDF8]/84 hover:border-[#2E5D46]/55 shadow-sm';

  const headerBorderClass = isNight
    ? 'border-[#86EFAC]/20'
    : isSunset
      ? 'border-[#F6D383]/25'
      : 'border-[#5B8C5A]/20';

  const accentColorClass = isNight
    ? 'text-[#86EFAC]'
    : isSunset
      ? 'text-[#F6D383]'
      : 'text-[#2E5D46]';

  const counterTextClass = isNight
    ? 'text-[#D0DDD5]/80'
    : isSunset
      ? 'text-[#FDEBD3]/85'
      : 'text-[#4A5851]';

  const buttonClass = isNight
    ? 'border-[#86EFAC]/35 bg-[#0F261D]/85 text-[#D0DDD5] hover:border-[#86EFAC]/65 hover:text-[#F4F1EA]'
    : isSunset
      ? 'border-[#F6D383]/40 bg-[#1E3631]/80 text-[#FDEBD3] hover:border-[#F6D383] hover:text-white'
      : 'border-[#5B8C5A]/35 bg-[#FAF6EC]/90 text-[#36493E] hover:border-[#2E5D46]/55 hover:text-[#18221D]';

  const quoteBodyClass = isNight
    ? 'text-[#F4F1EA]'
    : isSunset
      ? 'text-[#FFF9F0]'
      : 'text-[#18221D]';

  const footerBorderClass = isNight
    ? 'border-[#86EFAC]/20'
    : isSunset
      ? 'border-[#F6D383]/20'
      : 'border-[#5B8C5A]/20';

  const authorTextClass = isNight
    ? 'text-[#A7F3D0]'
    : isSunset
      ? 'text-[#F6D383]'
      : 'text-[#2E5D46]';

  return (
    <aside
      data-testid="rotating-scholarly-quote"
      aria-label="Danh ngôn học thuật kinh điển"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={cn(
        'group relative w-full rounded-2xl border p-5 backdrop-blur-md transition-all duration-700 sm:p-6',
        cardSurfaceClass,
      )}
    >
      {/* Header: Phân loại & Điều khiển luân phiên */}
      <div
        className={cn(
          'flex items-center justify-between gap-3 border-b pb-3 transition-colors duration-700',
          headerBorderClass,
        )}
      >
        <div className="flex items-center gap-2">
          <Quote
            className={cn('h-3.5 w-3.5 transition-colors duration-700', accentColorClass)}
            aria-hidden="true"
          />
          <span
            className={cn(
              'font-mono text-[10px] font-semibold tracking-wider uppercase transition-colors duration-700',
              accentColorClass,
            )}
          >
            DANH NGÔN HỌC THUẬT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-mono text-[11px] font-medium transition-colors duration-700',
              counterTextClass,
            )}
          >
            {formattedIndex} / {formattedTotal}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Câu danh ngôn trước"
              className={cn(
                'inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border transition-colors',
                buttonClass,
              )}
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Tiếp tục tự động chuyển câu' : 'Tạm dừng tự động chuyển câu'}
              className={cn(
                'inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border transition-colors',
                buttonClass,
              )}
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
              className={cn(
                'inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border transition-colors',
                buttonClass,
              )}
            >
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Nội dung trích dẫn với hiệu ứng mờ dần (Fade Transition) */}
      <blockquote
        className={cn(
          'mt-3.5 transition-opacity duration-700 ease-in-out',
          isFading ? 'opacity-0' : 'opacity-100',
        )}
      >
        <p
          className={cn(
            'mb-3 font-serif text-[16.5px] leading-relaxed italic transition-colors duration-700',
            quoteBodyClass,
          )}
        >
          &ldquo;{currentQuote.content}&rdquo;
        </p>
        <div
          className={cn(
            'mt-2 flex w-full items-center justify-end border-t pt-2 transition-colors duration-700',
            footerBorderClass,
          )}
        >
          <footer
            className={cn(
              'text-right font-mono text-xs transition-colors duration-700',
              authorTextClass,
            )}
          >
            — {currentQuote.author}
            {currentQuote.roleOrEra ? ` · ${currentQuote.roleOrEra}` : ''}
          </footer>
        </div>
      </blockquote>
    </aside>
  );
}
