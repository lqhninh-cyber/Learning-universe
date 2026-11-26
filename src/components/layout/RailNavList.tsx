import type { LucideIcon } from 'lucide-react';
import {
  type FC,
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';

export interface RailNavItem {
  readonly to: string;
  readonly label: string;
  /** Tooltip hiển thị khi Rail thu gọn (mặc định = label). */
  readonly collapsedTitle?: string;
  readonly icon: LucideIcon;
  readonly active: boolean;
  /** Nội dung phụ bên phải nhãn (ví dụ huy hiệu môn học) — chỉ hiện khi mở rộng. */
  readonly trailing?: ReactNode;
}

export interface RailNavListProps {
  readonly items: readonly RailNavItem[];
  readonly collapsed: boolean;
}

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

function canUseHoverEffects(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function isFocusVisible(el: Element): boolean {
  try {
    return el.matches(':focus-visible');
  } catch {
    return false;
  }
}

/**
 * Danh sách điều hướng chính của LeftRail kèm nền trượt (Sliding Hover Pill).
 *
 * Vị trí nền trượt được cập nhật trực tiếp qua DOM (ref + transform) nên lia chuột
 * qua các mục KHÔNG gây re-render cho Rail hay toàn trang.
 */
export const RailNavList: FC<RailNavListProps> = ({ items, collapsed }) => {
  const pillRef = useRef<HTMLSpanElement>(null);
  const visibleRef = useRef(false);

  const movePillTo = useCallback((target: HTMLElement) => {
    const pill = pillRef.current;
    if (!pill) return;

    const { offsetTop, offsetLeft, offsetWidth, offsetHeight } = target;
    const wasHidden = !visibleRef.current;

    if (wasHidden) {
      // Xuất hiện lần đầu: đặt ngay vào vị trí (không trượt từ chỗ cũ), rồi chỉ fade-in.
      pill.style.transition = 'none';
    }
    pill.style.width = `${offsetWidth}px`;
    pill.style.height = `${offsetHeight}px`;
    pill.style.transform = `translate3d(${offsetLeft}px, ${offsetTop}px, 0)`;

    if (wasHidden) {
      void pill.offsetWidth; // ép reflow để bỏ qua transition của lần đặt vị trí này
      pill.style.transition = '';
    }
    pill.dataset.visible = 'true';
    visibleRef.current = true;
  }, []);

  const hidePill = useCallback(() => {
    const pill = pillRef.current;
    if (!pill) return;
    pill.dataset.visible = 'false';
    visibleRef.current = false;
  }, []);

  // Khi đổi trạng thái thu gọn/mở rộng, kích thước mục thay đổi → ẩn nền trượt để tránh lệch khung.
  useEffect(() => {
    hidePill();
  }, [collapsed, hidePill]);

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!canUseHoverEffects()) return;
      movePillTo(event.currentTarget);
    },
    [movePillTo],
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => {
      if (!isFocusVisible(event.currentTarget)) return;
      movePillTo(event.currentTarget);
    },
    [movePillTo],
  );

  const handleListBlur = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && event.currentTarget.contains(next)) return;
      hidePill();
    },
    [hidePill],
  );

  return (
    <div className="lu-rail-nav relative space-y-1" onMouseLeave={hidePill} onBlur={handleListBlur}>
      <span
        ref={pillRef}
        aria-hidden="true"
        data-testid="rail-hover-pill"
        data-visible="false"
        className="lu-rail-pill pointer-events-none absolute top-0 left-0 rounded-lg"
      />

      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            title={collapsed ? (item.collapsedTitle ?? item.label) : undefined}
            aria-current={item.active ? 'page' : undefined}
            data-active={item.active ? 'true' : 'false'}
            onMouseEnter={handleMouseEnter}
            onFocus={handleFocus}
            className={cn(
              'lu-rail-item group relative flex h-9 items-center rounded-lg border text-[13px] focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none',
              collapsed ? 'mx-auto w-9 justify-center px-0' : 'w-full gap-2.5 px-2.5',
              item.active
                ? 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] font-medium text-[var(--accent-os)] shadow-2xs'
                : 'border-transparent font-normal text-[var(--text-secondary)]',
            )}
          >
            <span aria-hidden="true" className="lu-rail-edge" />
            <Icon className="lu-rail-icon h-4 w-4 shrink-0" aria-hidden="true" />
            {!collapsed &&
              (item.trailing ? (
                <span className="lu-rail-label flex min-w-0 flex-1 items-center justify-between gap-1.5">
                  <span className="truncate">{item.label}</span>
                  {item.trailing}
                </span>
              ) : (
                <span className="lu-rail-label truncate">{item.label}</span>
              ))}
          </Link>
        );
      })}
    </div>
  );
};

export default RailNavList;
