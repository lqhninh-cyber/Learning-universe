import { Download, ExternalLink } from 'lucide-react';
import { GOOGLE_DRIVE_DOCS_URL } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui';

export interface DocumentCardProps {
  readonly id?: string;
  readonly title: string;
  readonly categoryLabel?: string;
  readonly description?: string;
  readonly size?: string;
  readonly badge?: string;
  readonly url?: string;
  readonly filename?: string;
  readonly className?: string;
}

export function DocumentCard({
  title,
  categoryLabel,
  description,
  size,
  badge,
  url = GOOGLE_DRIVE_DOCS_URL,
  filename,
  className,
}: DocumentCardProps) {
  const targetUrl = url || GOOGLE_DRIVE_DOCS_URL;

  return (
    <div
      className={cn(
        'flex flex-col justify-between rounded-2xl border border-stone-200/90 bg-white p-4.5 shadow-2xs transition-all hover:border-teal-400/80 hover:shadow-xs',
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1">
          {categoryLabel && (
            <span className="text-[11px] font-bold tracking-wider text-teal-800 uppercase">
              {categoryLabel}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {size && (
              <span className="rounded border border-stone-200/80 bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-stone-600">
                {size}
              </span>
            )}
            {badge && (
              <span className="rounded-full bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                {badge}
              </span>
            )}
          </div>
        </div>

        <h3 className="line-clamp-2 text-sm font-bold text-stone-900">{title}</h3>

        {description && (
          <p className="line-clamp-3 text-xs leading-relaxed text-stone-600">{description}</p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-stone-100 pt-3 text-xs">
        <Button asChild variant="subject" size="sm" className="h-7 gap-1 px-2.5 text-xs">
          <a href={targetUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            <span>Mở tài liệu</span>
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 gap-1 px-2.5 text-xs text-stone-700 hover:bg-stone-50"
        >
          <a
            href={targetUrl}
            target="_blank"
            rel="noopener noreferrer"
            {...(filename ? { download: filename } : {})}
          >
            <Download className="h-3 w-3" aria-hidden="true" />
            <span>Tải về / Drive</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
