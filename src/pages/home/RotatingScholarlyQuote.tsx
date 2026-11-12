import { ChevronLeft, ChevronRight, Pause, Play, Quote } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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

export function RotatingScholarlyQuote() {
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

  return (
    <aside
      data-testid="rotating-scholarly-quote"
      aria-label="Danh ngôn học thuật kinh điển"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="group relative w-full rounded-2xl border border-[#E8A85A]/40 bg-[#122623]/76 p-5 shadow-lg shadow-[#081715]/35 backdrop-blur-md transition-all duration-300 hover:border-[#E8A85A]/70 sm:p-6"
    >
      {/* Header: Phân loại & Điều khiển luân phiên */}
      <div className="flex items-center justify-between gap-3 border-b border-[#E8A85A]/20 pb-3">
        <div className="flex items-center gap-2">
          <Quote className="h-3.5 w-3.5 text-[#F6D383]" aria-hidden="true" />
          <span className="font-mono text-[10px] font-semibold tracking-wider text-[#F6D383] uppercase">
            DANH NGÔN HỌC THUẬT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-medium text-[#FDEBD3]/85">
            {formattedIndex} / {formattedTotal}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Câu danh ngôn trước"
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#E8A85A]/40 bg-[#1A3530]/85 text-[#FDEBD3] transition-colors hover:border-[#F6D383] hover:text-white"
            >
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Tiếp tục tự động chuyển câu' : 'Tạm dừng tự động chuyển câu'}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#E8A85A]/40 bg-[#1A3530]/85 text-[#FDEBD3] transition-colors hover:border-[#F6D383] hover:text-white"
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
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-[#E8A85A]/40 bg-[#1A3530]/85 text-[#FDEBD3] transition-colors hover:border-[#F6D383] hover:text-white"
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
        <p className="mb-3 font-serif text-[16.5px] leading-relaxed text-[#FFF9F0] italic">
          &ldquo;{currentQuote.content}&rdquo;
        </p>
        <div className="mt-2 flex w-full items-center justify-end border-t border-[#E8A85A]/20 pt-2">
          <footer className="text-right font-mono text-xs text-[#F6D383]">
            — {currentQuote.author}
            {currentQuote.roleOrEra ? ` · ${currentQuote.roleOrEra}` : ''}
          </footer>
        </div>
      </blockquote>
    </aside>
  );
}
