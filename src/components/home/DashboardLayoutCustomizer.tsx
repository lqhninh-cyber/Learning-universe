import { ArrowDown, ArrowUp, Eye, EyeOff, RotateCcw, SlidersHorizontal, X } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import {
  DASHBOARD_SECTION_META,
  DEFAULT_DASHBOARD_SECTION_ORDER,
  type DashboardLayoutConfig,
  type DashboardSectionId,
} from '@/features/workspace';
import { cn } from '@/shared/lib/cn';

export interface DashboardLayoutCustomizerProps {
  readonly layout: DashboardLayoutConfig;
  readonly onToggleSection: (sectionId: DashboardSectionId) => void;
  readonly onMoveSection: (sectionId: DashboardSectionId, direction: 'up' | 'down') => void;
  readonly onReset: () => void;
}

/**
 * Bảng nổi tùy chỉnh ẩn/hiện và sắp xếp các tầng của Trang Tổng quan.
 * Lưu tự động theo từng tài khoản trong `useWorkspaceStore`, đóng bằng Escape hoặc click ngoài.
 */
export const DashboardLayoutCustomizer: FC<DashboardLayoutCustomizerProps> = ({
  layout,
  onToggleSection,
  onMoveSection,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const hiddenSet = new Set(layout.hidden);
  const hiddenCount = layout.hidden.length;
  const isCustomOrder = layout.order.some(
    (id, index) => id !== DEFAULT_DASHBOARD_SECTION_ORDER[index],
  );
  const isCustomized = hiddenCount > 0 || isCustomOrder;

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <button
        type="button"
        data-testid="dashboard-layout-trigger"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-mono text-[11px] font-semibold transition-all duration-150 active:scale-[0.98]',
          isOpen || isCustomized
            ? 'border-[#0F7656]/35 bg-[#EAF5F0] text-[#0F7656] dark:border-[#4AD1A3]/35 dark:bg-[#132C24] dark:text-[#4AD1A3]'
            : 'border-black/[0.08] bg-white/85 text-[var(--text-secondary)] hover:border-black/[0.16] hover:text-[var(--text-main)] dark:border-white/[0.1] dark:bg-[#141D1A]/85',
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Tùy chỉnh bố cục</span>
        {hiddenCount > 0 && (
          <span
            data-testid="dashboard-layout-hidden-badge"
            className="rounded-full bg-[#0F7656] px-1.5 py-0.5 text-[9.5px] leading-none font-bold text-white dark:bg-[#4AD1A3] dark:text-[#0C1210]"
          >
            Ẩn {hiddenCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Tùy chỉnh thứ tự và hiển thị các tầng Trang Tổng quan"
          data-testid="dashboard-layout-panel"
          className="absolute top-full right-0 z-40 mt-2 w-[320px] max-w-[calc(100vw-2rem)] rounded-[22px] border border-black/[0.08] bg-white p-4 shadow-[0_24px_56px_-18px_rgba(15,45,35,0.28)] sm:w-[352px] dark:border-white/[0.1] dark:bg-[#141D1A]"
        >
          <div className="mb-3 flex items-start justify-between gap-2 border-b border-[var(--border-hairline)] pb-2.5">
            <div>
              <h3 className="font-serif text-[15px] font-semibold text-[var(--text-main)]">
                Bố cục Trang Tổng quan
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Ẩn hoặc đổi thứ tự các khối · Lưu riêng theo tài khoản
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng bảng tùy chỉnh bố cục"
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <ul className="space-y-1.5">
            {layout.order.map((sectionId, index) => {
              const meta = DASHBOARD_SECTION_META[sectionId];
              const isHidden = hiddenSet.has(sectionId);
              const isFirst = index === 0;
              const isLast = index === layout.order.length - 1;

              return (
                <li
                  key={sectionId}
                  data-testid={`layout-item-${sectionId}`}
                  className={cn(
                    'flex items-center justify-between gap-2 rounded-xl border px-2.5 py-2 transition-colors',
                    isHidden
                      ? 'border-dashed border-[var(--border-hairline)] bg-[var(--bg-workspace)]/60 opacity-65'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)]',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--text-main)]">
                      {meta.label}
                    </p>
                    <p className="truncate text-[10.5px] text-[var(--text-muted)]">
                      {meta.description}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      data-testid={`layout-move-up-${sectionId}`}
                      disabled={isFirst}
                      onClick={() => onMoveSection(sectionId, 'up')}
                      aria-label={`Đưa ${meta.label} lên`}
                      title="Đưa lên"
                      className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors hover:border-[#0F7656]/40 hover:text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowUp className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      data-testid={`layout-move-down-${sectionId}`}
                      disabled={isLast}
                      onClick={() => onMoveSection(sectionId, 'down')}
                      aria-label={`Đưa ${meta.label} xuống`}
                      title="Đưa xuống"
                      className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors hover:border-[#0F7656]/40 hover:text-[var(--text-main)] disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowDown className="h-3 w-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      data-testid={`layout-toggle-${sectionId}`}
                      aria-pressed={!isHidden}
                      onClick={() => onToggleSection(sectionId)}
                      aria-label={isHidden ? `Hiện ${meta.label}` : `Ẩn ${meta.label}`}
                      title={isHidden ? 'Hiện lại' : 'Ẩn khối này'}
                      className={cn(
                        'inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border transition-colors',
                        isHidden
                          ? 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[#0F7656]'
                          : 'border-[#0F7656]/25 bg-[#EAF5F0] text-[#0F7656] hover:bg-[#0F7656] hover:text-white dark:border-[#4AD1A3]/25 dark:bg-[#132C24] dark:text-[#4AD1A3]',
                      )}
                    >
                      {isHidden ? (
                        <EyeOff className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3 w-3" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {isCustomized && (
            <div className="mt-3 flex justify-end border-t border-[var(--border-hairline)] pt-2.5">
              <button
                type="button"
                data-testid="dashboard-layout-reset"
                onClick={onReset}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-1 font-mono text-[10.5px] font-semibold text-[var(--text-secondary)] transition-colors hover:border-[#0F7656]/40 hover:text-[#0F7656] dark:hover:text-[#4AD1A3]"
              >
                <RotateCcw className="h-3 w-3" aria-hidden="true" />
                <span>Khôi phục mặc định</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
