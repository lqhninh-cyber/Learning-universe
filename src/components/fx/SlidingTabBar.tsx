import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { cn } from '@/shared/lib/cn';

export interface SlidingTabItem {
  readonly id: string;
  readonly label: string;
  readonly count?: number;
  readonly badge?: string | number;
  readonly icon?: ReactNode;
  readonly testId?: string;
}

export interface SlidingTabBarProps {
  readonly tabs: readonly SlidingTabItem[];
  readonly activeId: string;
  readonly onChange: (id: string) => void;
  readonly ariaLabel: string;
  readonly accentHex?: string;
  readonly size?: 'sm' | 'md';
  readonly className?: string;
  readonly 'data-testid'?: string;
}

/**
 * Thanh tab viên thuốc có chỉ báo trượt động mượt (chuyển thể từ fx-tabs của taste-skill).
 * Đo tọa độ nút trực tiếp bằng ResizeObserver + cập nhật DOM ref không gây re-render dư thừa.
 */
export function SlidingTabBar({
  tabs,
  activeId,
  onChange,
  ariaLabel,
  accentHex = '#1E332E',
  size = 'md',
  className,
  'data-testid': dataTestId = 'sliding-tab-bar',
}: SlidingTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const syncIndicator = useCallback(() => {
    const container = containerRef.current;
    const pill = pillRef.current;
    const activeBtn = tabRefs.current[activeId];
    if (!container || !pill || !activeBtn) return;

    const btnWidth = activeBtn.offsetWidth;
    if (btnWidth <= 0) {
      container.dataset.pillReady = '0';
      pill.style.opacity = '0';
      return;
    }

    const offsetX = activeBtn.offsetLeft;
    container.dataset.pillReady = '1';
    pill.style.opacity = '1';
    pill.style.width = `${btnWidth}px`;
    pill.style.transform = `translate3d(${offsetX}px, 0, 0)`;
  }, [activeId]);

  useLayoutEffect(() => {
    syncIndicator();
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      syncIndicator();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [syncIndicator, tabs]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (tabs.length === 0) return;
    let nextIdx = -1;
    if (event.key === 'ArrowRight') nextIdx = (currentIndex + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIdx = (currentIndex - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIdx = 0;
    else if (event.key === 'End') nextIdx = tabs.length - 1;

    if (nextIdx < 0) return;
    event.preventDefault();
    const nextTab = tabs[nextIdx];
    if (!nextTab) return;
    onChange(nextTab.id);
    tabRefs.current[nextTab.id]?.focus();
  };

  const containerStyle = {
    '--fx-tab-accent': accentHex,
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label={ariaLabel}
      data-testid={dataTestId}
      data-pill-ready="0"
      style={containerStyle}
      className={cn(
        'lu-fx-tabs-bar relative inline-flex max-w-full flex-wrap items-center gap-1 rounded-full border border-[#D8E0DD] bg-[#EAEFEC]/90 p-1',
        className,
      )}
    >
      {/* Viên thuốc chỉ báo trượt mượt */}
      <span
        ref={pillRef}
        aria-hidden="true"
        className="lu-fx-tab-pill pointer-events-none absolute top-1 bottom-1 left-0 z-0 rounded-full opacity-0 shadow-xs"
        style={{ backgroundColor: accentHex }}
      />

      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[tab.id] = el;
            }}
            type="button"
            role="tab"
            data-testid={tab.testId}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              'lu-fx-tab relative z-[1] inline-flex cursor-pointer items-center gap-1.5 rounded-full font-semibold whitespace-nowrap transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E332E]',
              size === 'sm' ? 'px-3 py-1 text-[11px]' : 'px-4 py-1.5 text-xs sm:text-[13px]',
              isActive ? 'text-white' : 'text-[#314E46] hover:bg-white/70 hover:text-[#162623]',
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'lu-tabular-telemetry font-mono text-[10px]',
                  isActive ? 'text-white/80' : 'text-[#5F7770]',
                )}
              >
                {tab.count}
              </span>
            )}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'lu-tabular-telemetry rounded-full px-1.5 py-0.5 font-mono text-[10.5px] font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-[#E2E7E4] text-[#314E46]',
                )}
              >
                {typeof tab.badge === 'number' ? `(${tab.badge})` : tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
