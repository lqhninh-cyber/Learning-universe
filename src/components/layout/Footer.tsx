import { cn } from '@/shared/lib/cn';

export interface FooterProps {
  readonly isDarkLesson?: boolean;
}

/**
 * Thanh colophon tối giản 1 dòng chuẩn Academic OS (Sứ Bạch & Than Đá).
 * Gỡ bỏ liên kết điều hướng trùng lặp với LeftRail.
 */
export function Footer({ isDarkLesson }: FooterProps = {}) {
  return (
    <footer
      data-testid="academic-os-footer"
      className={cn(
        'border-t border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-6 py-3.5 text-xs text-[var(--text-muted)] transition-colors duration-200 lg:px-10 print:hidden',
        isDarkLesson && 'dark',
      )}
    >
      <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="flex flex-wrap items-center justify-center gap-1.5 text-center sm:justify-start sm:text-left">
          <span className="font-serif font-semibold text-[var(--text-main)]">
            Learning Universe
          </span>
          <span aria-hidden="true">·</span>
          <span>Không gian tri thức mở</span>
        </p>

        <p className="flex flex-wrap items-center justify-center gap-2 text-center sm:justify-end sm:text-right">
          <span className="font-serif italic">
            “Không chịu khó học thì không tiến bộ được.” — Hồ Chí Minh
          </span>
          <span className="hidden opacity-50 sm:inline" aria-hidden="true">
            ·
          </span>
          <span className="font-mono text-[11px]">Bản quyền mở</span>
        </p>
      </div>
    </footer>
  );
}
