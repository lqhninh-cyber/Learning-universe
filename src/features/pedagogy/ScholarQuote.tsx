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
        'relative my-6 overflow-hidden rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 shadow-xs transition-all hover:border-[#718C7E] sm:p-7 dark:border-[#1E3A2C] dark:bg-[#0B1A13]',
        className,
      )}
    >
      {/* Họa tiết dấu ngoặc kép chìm nghệ thuật ở góc */}
      <div
        className="pointer-events-none absolute -right-2 -bottom-3 text-[#718C7E]/10 opacity-40 select-none dark:text-[#183628]"
        aria-hidden="true"
      >
        <Quote className="h-28 w-28 rotate-180" />
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header danh ngôn */}
        <div className="flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#739B88] uppercase dark:text-[#A1D1B7]">
          <Sparkles className="h-3.5 w-3.5 text-[#739B88] dark:text-[#A1D1B7]" aria-hidden="true" />
          <span>Danh ngôn Danh nhân Giáo dục</span>
        </div>

        {/* Thân danh ngôn */}
        <blockquote className="border-l-4 border-[#C5A262] py-1 pl-4 font-serif text-base leading-relaxed text-[#29383D] italic md:text-lg dark:text-[#F5F2EB]">
          "{quote}"
        </blockquote>

        {/* Tác giả & Tác phẩm */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#CFDADB] pt-3 dark:border-[#1E3A2C]">
          <div>
            <div className="mt-3 text-sm font-bold tracking-wide text-[#29383D] not-italic dark:text-[#E5C378]">
              {resolvedAuthor}
            </div>
            {title && (
              <div className="mt-0.5 font-serif text-xs text-[#55676B] not-italic dark:text-[#CBD5CE]">
                {title}
              </div>
            )}
          </div>

          {resolvedSource && (
            <div className="mt-3 inline-block rounded-full border border-[#CFDADB] bg-[#E8EFEB] px-3 py-1.5 text-xs text-[#29383D] dark:border dark:border-[#284E3B] dark:bg-[#163023] dark:text-[#C5DCD0]">
              <span className="font-medium text-[#55676B] dark:text-[#9FB8AB]">Nguồn: </span>
              <cite className="font-semibold text-[#29383D] not-italic dark:text-[#C5DCD0]">
                {resolvedSource}
              </cite>
            </div>
          )}
        </div>

        {/* Bối cảnh học thuật bổ sung */}
        {resolvedContext && (
          <p className="border-t border-[#CFDADB] pt-2.5 text-xs leading-relaxed text-[#55676B] italic dark:border-[#1E3A2C] dark:text-[#D1E0D7]">
            <strong className="font-bold text-[#29383D] not-italic dark:text-[#F5F2EB]">
              Bối cảnh &amp; Ý nghĩa:
            </strong>{' '}
            {resolvedContext}
          </p>
        )}
      </div>
    </div>
  );
}

export default ScholarQuote;
