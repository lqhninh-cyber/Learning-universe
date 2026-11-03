import { Check, Copy, ExternalLink, FileText, Scale } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { Badge, Button } from '@/shared/ui';

export interface LegalQuoteCardProps {
  readonly lawTitle: string;
  readonly article: string;
  readonly quote: string;
  readonly source: string;
  readonly sourceUrl?: string;
  readonly significance?: string;
  readonly className?: string;
}

/**
 * Thẻ trích dẫn các điều khoản văn bản quy phạm pháp luật (Luật GD 2019, TT20, TT32, TT17).
 * Thiết kế mang bản sắc trang nhã Dó ngà ấm với điểm nhấn Terracotta & Slate Teal.
 */
export function LegalQuoteCard({
  lawTitle,
  article,
  quote,
  source,
  sourceUrl,
  significance,
  className,
}: LegalQuoteCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`"${quote}" — ${lawTitle} (${article}), ${source}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Bỏ qua lỗi clipboard
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-amber-800/25 bg-gradient-to-br from-[#fcfbf7] via-[#faf8f2] to-amber-50/40 p-5 shadow-xs transition-all hover:border-amber-700/40 sm:p-6',
        className,
      )}
    >
      {/* Huy hiệu pháp quy & Nút sao chép */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-900/10 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-800/30 bg-amber-100/70 px-2.5 py-0.5 text-xs font-bold text-amber-900">
            <Scale className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
            <span>{lawTitle}</span>
          </span>
          <Badge
            variant="neutral"
            className="border-stone-300/80 bg-white/80 font-medium text-stone-700"
          >
            {article}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 gap-1 px-2 text-xs text-stone-600 hover:bg-amber-100/60"
            title="Sao chép trích dẫn"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-700">Đã chép</span>
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
              className="h-7 gap-1 border-amber-700/30 bg-white/90 px-2.5 text-xs text-amber-900 hover:bg-amber-50"
            >
              <a href={sourceUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Văn bản PDF</span>
                <ExternalLink className="h-3 w-3 opacity-70" aria-hidden="true" />
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Nội dung trích dẫn nguyên văn pháp quy */}
      <blockquote className="relative my-4 pl-4 text-sm leading-relaxed text-stone-800 sm:text-base">
        <div className="absolute top-0 bottom-0 left-0 w-1 rounded-full bg-amber-700/70" />
        <p className="font-serif italic">“{quote}”</p>
      </blockquote>

      {/* Ý nghĩa sư phạm & Vận dụng */}
      {significance && (
        <div className="mt-3 rounded-xl border border-stone-200/80 bg-white/85 p-3.5 text-xs leading-relaxed text-stone-700">
          <span className="font-bold text-amber-900">💡 Ý nghĩa vận dụng sư phạm: </span>
          <span>{significance}</span>
        </div>
      )}

      {/* Nguồn trích dẫn cuối thẻ */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500">
        <span>Căn cứ pháp lý: {source}</span>
      </div>
    </div>
  );
}
