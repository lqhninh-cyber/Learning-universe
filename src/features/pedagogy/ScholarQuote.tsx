import { Quote, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface ScholarQuoteProps {
  readonly quote: string;
  readonly author?: string;
  readonly scholar?: string;
  readonly title?: string;
  readonly source?: string;
  readonly work?: string;
  readonly historicalContext?: string;
  readonly analysis?: string;
  readonly className?: string;
}

/**
 * Thẻ danh ngôn học giả & đại sư biểu giáo dục (J.A. Comenius, Makarenko, Chu Văn An, v.v.).
 * Mang bản sắc thư viện ngà ấm, gạch nung Terracotta và xanh học giả Slate Teal.
 */
export function ScholarQuote({
  quote,
  author,
  scholar,
  title,
  source,
  work,
  historicalContext,
  analysis,
  className,
}: ScholarQuoteProps) {
  const resolvedAuthor = author ?? scholar ?? '';
  const resolvedSource = source ?? work;
  const resolvedContext = historicalContext ?? analysis;

  return (
    <div
      className={cn(
        'relative my-6 overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-xs transition-all hover:border-[#718C7E] sm:p-7',
        className,
      )}
    >
      {/* Họa tiết dấu ngoặc kép chìm nghệ thuật ở góc */}
      <div
        className="pointer-events-none absolute -right-2 -bottom-3 text-[#718C7E]/10 select-none"
        aria-hidden="true"
      >
        <Quote className="h-28 w-28 rotate-180" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header danh ngôn */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-[#3F6570] uppercase">
          <Sparkles className="h-3.5 w-3.5 text-[#718C7E]" aria-hidden="true" />
          <span>Danh ngôn Danh nhân Giáo dục</span>
        </div>

        {/* Thân danh ngôn */}
        <blockquote className="border-l-2 border-[#718C7E] pl-4 font-serif text-[18px] leading-relaxed text-[#29383D] italic">
          "{quote}"
        </blockquote>

        {/* Tác giả & Tác phẩm */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#CFDADB] pt-3">
          <div>
            <div className="mt-2 text-base font-semibold text-[#29383D] not-italic">
              {resolvedAuthor}
            </div>
            {title && <div className="text-sm text-[#55676B] not-italic">{title}</div>}
          </div>

          {resolvedSource && (
            <div className="rounded-lg border border-[#CFDADB] bg-[#E8EFEB] px-2.5 py-1 text-xs text-[#29383D]">
              <span className="font-medium text-[#55676B]">Nguồn: </span>
              <cite className="font-semibold not-italic">{resolvedSource}</cite>
            </div>
          )}
        </div>

        {/* Bối cảnh học thuật bổ sung */}
        {resolvedContext && (
          <p className="border-t border-[#CFDADB] pt-2.5 text-xs leading-relaxed text-[#55676B] italic">
            <strong className="text-[#29383D] not-italic">Bối cảnh &amp; Ý nghĩa:</strong>{' '}
            {resolvedContext}
          </p>
        )}
      </div>
    </div>
  );
}

export default ScholarQuote;
