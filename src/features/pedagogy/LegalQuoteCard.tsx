import { Check, Copy, ExternalLink, FileText, Scale } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Badge, Button } from '@/shared/ui';

export interface LegalQuoteCardProps {
  readonly lawTitle?: string;
  readonly documentTitle?: string;
  readonly article: string;
  readonly quote: string;
  readonly source?: string;
  readonly sourceUrl?: string;
  readonly significance?: string;
  readonly pedagogicalAnalysis?: string;
  readonly className?: string;
}

/**
 * Khung Pháp quy & Chuẩn nghề nghiệp (LegalReferenceBox / LegalQuoteCard).
 * Theo chuẩn bảng màu Mist Blue & Sage: Nền #E8EFEB, viền trái border-l-2 border-[#718C7E].
 */
export function LegalQuoteCard({
  lawTitle,
  documentTitle,
  article,
  quote,
  source,
  sourceUrl,
  significance,
  pedagogicalAnalysis,
  className,
}: LegalQuoteCardProps) {
  const [copied, setCopied] = useState(false);
  const resolvedLawTitle = lawTitle ?? documentTitle ?? 'Văn bản Pháp quy';
  const resolvedSource = source ?? documentTitle ?? lawTitle ?? 'Văn bản quy phạm pháp luật';
  const resolvedSignificance = significance ?? pedagogicalAnalysis;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `"${quote}" — ${resolvedLawTitle} (${article}), ${resolvedSource}`,
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Bỏ qua lỗi clipboard
    }
  };

  return (
    <div
      data-legal-box
      data-testid="legal-quote-card"
      className={cn(
        'relative overflow-hidden rounded-2xl border border-l-2 border-[#CFDADB] border-l-[#718C7E] bg-[#E8EFEB] p-5 shadow-xs transition-all hover:border-[#718C7E] sm:p-6',
        className,
      )}
    >
      {/* Huy hiệu pháp quy & Nút sao chép */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#CFDADB] pb-3 dark:border-[#1E3A2C]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#718C7E]/40 bg-[#F7FAFA] px-2.5 py-0.5 text-xs font-bold text-[#29383D] dark:border-[#284E3B] dark:bg-[#163023] dark:text-[#C5DCD0]">
            <Scale className="h-3.5 w-3.5 text-[#3F6570] dark:text-[#C5A262]" aria-hidden="true" />
            <span>{resolvedLawTitle}</span>
          </span>
          <Badge
            variant="neutral"
            className="border-[#CFDADB] bg-[#F7FAFA] font-medium text-[#55676B] dark:border-[#284E3B] dark:bg-[#163023] dark:text-[#E5C378]"
          >
            {article}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1 px-2 text-xs text-[#55676B] hover:bg-[#F7FAFA] hover:text-[#29383D] dark:text-[#CBD5CE] dark:hover:bg-[#163023] dark:hover:text-[#F5F2EB]"
            title="Sao chép trích dẫn"
          >
            {copied ? (
              <>
                <Check
                  className="h-3.5 w-3.5 text-[#4F7967] dark:text-[#A1D1B7]"
                  aria-hidden="true"
                />
                <span className="text-[#4F7967] dark:text-[#A1D1B7]">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sao chép</span>
              </>
            )}
          </Button>

          {sourceUrl && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-7 gap-1 border-[#CFDADB] bg-[#F7FAFA] px-2.5 text-xs text-[#29383D] hover:bg-white dark:border-[#284E3B] dark:bg-[#163023] dark:text-[#C5DCD0] dark:hover:bg-[#1E3A2C]"
            >
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                <FileText
                  className="h-3.5 w-3.5 text-[#3F6570] dark:text-[#C5A262]"
                  aria-hidden="true"
                />
                <span>Văn bản PDF</span>
                <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Nội dung trích dẫn nguyên văn pháp quy */}
      <blockquote className="relative my-4 border-l-2 border-[#718C7E] pl-4 text-[15.5px] leading-relaxed text-[#29383D] italic sm:text-[16.5px] dark:border-[#C5A262] dark:text-[#F5F2EB]">
        <p className="font-serif">“{quote}”</p>
      </blockquote>

      {/* Ý nghĩa sư phạm & Vận dụng */}
      {resolvedSignificance && (
        <div className="mt-3 rounded-xl border border-[#CFDADB] bg-[#F7FAFA] p-3.5 text-xs leading-relaxed text-[#29383D] dark:border-[#1E3A2C] dark:bg-[#0E2218] dark:text-[#D5E2DA]">
          <span className="font-bold text-[#3F6570] dark:text-[#A1D1B7]">
            Ý nghĩa vận dụng sư phạm:{' '}
          </span>
          <span className="text-[#55676B] dark:text-[#CBD5CE]">{resolvedSignificance}</span>
        </div>
      )}

      {/* Nguồn trích dẫn cuối thẻ */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-[#55676B] dark:text-[#A8C4B5]">
        <span>Căn cứ pháp lý: {resolvedSource}</span>
      </div>
    </div>
  );
}

export const LegalReferenceBox = LegalQuoteCard;
