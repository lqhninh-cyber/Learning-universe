import { Quote, Sparkles } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface ScholarQuoteProps {
  readonly quote: string;
  readonly author: string;
  readonly title?: string;
  readonly source?: string;
  readonly historicalContext?: string;
  readonly className?: string;
}

/**
 * Thẻ danh ngôn học giả & đại sư biểu giáo dục (J.A. Comenius, Makarenko, Chu Văn An, v.v.).
 * Mang bản sắc thư viện ngà ấm, gạch nung Terracotta và xanh học giả Slate Teal.
 */
export function ScholarQuote({
  quote,
  author,
  title,
  source,
  historicalContext,
  className,
}: ScholarQuoteProps) {
  return (
    <div
      className={cn(
        'relative my-6 overflow-hidden rounded-2xl border border-amber-900/20 bg-gradient-to-br from-[#fcfbf7] via-[#faf7f0] to-amber-50/50 p-6 shadow-xs transition-all hover:border-amber-800/35 sm:p-7',
        className,
      )}
    >
      {/* Họa tiết dấu ngoặc kép chìm nghệ thuật ở góc */}
      <div
        className="pointer-events-none absolute -right-2 -bottom-3 text-amber-900/10 select-none"
        aria-hidden="true"
      >
        <Quote className="h-28 w-28 rotate-180" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header danh ngôn */}
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-900 uppercase">
          <Sparkles className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
          <span>Danh ngôn Danh nhân Giáo dục</span>
        </div>

        {/* Thân danh ngôn */}
        <blockquote className="border-l-4 border-amber-800/70 pl-4 font-serif text-[18px] leading-relaxed text-stone-800 italic">
          "{quote}"
        </blockquote>

        {/* Tác giả & Tác phẩm */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-900/10 pt-3">
          <div>
            <div className="mt-2 text-base font-semibold text-stone-900 not-italic">{author}</div>
            {title && <div className="text-sm text-stone-600 not-italic">{title}</div>}
          </div>

          {source && (
            <div className="rounded-lg border border-amber-800/20 bg-white/80 px-2.5 py-1 text-xs text-amber-900">
              <span className="font-medium">Nguồn: </span>
              <cite className="font-semibold not-italic">{source}</cite>
            </div>
          )}
        </div>

        {/* Bối cảnh học thuật bổ sung */}
        {historicalContext && (
          <p className="border-t border-amber-900/10 pt-2.5 text-xs leading-relaxed text-stone-600 italic">
            💡 <strong>Bối cảnh &amp; Ý nghĩa:</strong> {historicalContext}
          </p>
        )}
      </div>
    </div>
  );
}

export default ScholarQuote;
