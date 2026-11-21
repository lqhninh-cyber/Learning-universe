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
        'flex min-w-0 flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4.5 shadow-2xs transition-all hover:border-[var(--accent-os)]/60 hover:shadow-xs',
        className,
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-1">
          {categoryLabel && (
            <span className="text-[11px] font-bold tracking-wider text-[var(--accent-os)] uppercase">
              {categoryLabel}
            </span>
          )}
          <div className="flex items-center gap-1.5">
            {size && (
              <span className="rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--text-secondary)]">
                {size}
              </span>
            )}
            {badge && (
              <span className="rounded-full bg-[var(--accent-heritage)]/15 px-2 py-0.5 text-[10px] font-bold text-[var(--accent-heritage)]">
                {badge}
              </span>
            )}
          </div>
        </div>

        <h3 className="line-clamp-2 text-sm font-bold text-[var(--text-main)]">{title}</h3>

        {description && (
          <p className="line-clamp-3 text-xs leading-relaxed text-[var(--text-secondary)]">
            {description}
          </p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--border-hairline)] pt-3 text-xs">
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
          className="h-7 gap-1 px-2.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
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
