import { type FC, type ReactNode, type RefObject, useLayoutEffect, useRef, useState } from 'react';

export interface ToolbarPopoverAnchorProps {
  /** Phần tử nút bấm hoặc vùng neo kích hoạt hộp popover */
  readonly anchorRef: RefObject<HTMLElement | null>;
  /** Canh lề ưu tiên trước khi tự động kẹp an toàn trong vùng nhìn thấy */
  readonly preferAlign?: 'left' | 'right';
  /** Hướng bung ưu tiên theo chiều dọc (mặc định mở xuống dưới, riêng HUD đáy mở lên trên) */
  readonly preferPlacement?: 'bottom' | 'top';
  readonly children: ReactNode;
}

/**
 * Hộp định vị Popover thông minh bám theo nút thanh công cụ (`position: fixed; z-index: 80`):
 * - Tự động đo lề trái của vùng Bảng viết (`math-ink-page`) để không bao giờ bị thanh LeftRail che khuất
 *   khi nút thanh công cụ xuống dòng (như nút "Phiếu đề" ở chế độ cửa sổ thường).
 * - Tự động kẹp gọn trong khung nhìn ngang và dọc của màn hình ở mọi độ phân giải và chế độ toàn màn hình.
 */
export const ToolbarPopoverAnchor: FC<ToolbarPopoverAnchorProps> = ({
  anchorRef,
  preferAlign = 'left',
  preferPlacement = 'bottom',
  children,
}) => {
  const popRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    readonly top: number;
    readonly left: number;
    readonly maxHeight: number;
    readonly ready: boolean;
  }>({
    top: 64,
    left: 16,
    maxHeight: 560,
    ready: false,
  });

  useLayoutEffect(() => {
    const updatePosition = () => {
      const anchor = anchorRef.current;
      const pop = popRef.current;
      if (!anchor || !pop) return;

      const anchorRect = anchor.getBoundingClientRect();
      const pageHost = anchor.closest('[data-testid="math-ink-page"]');
      const pageLeft = pageHost ? pageHost.getBoundingClientRect().left : 0;

      const vw = window.innerWidth || 1280;
      const vh = window.innerHeight || 720;
      const popW = pop.offsetWidth || 320;
      const popH = pop.offsetHeight || 260;

      // Kẹp an toàn phía bên phải LeftRail và trong mép phải khung nhìn
      const minLeft = Math.max(12, Math.round(pageLeft) + 10);
      const maxLeft = Math.max(minLeft, vw - popW - 12);
      const desiredLeft = preferAlign === 'right' ? anchorRect.right - popW : anchorRect.left;
      const clampedLeft = Math.round(Math.max(minLeft, Math.min(desiredLeft, maxLeft)));

      let clampedTop: number;
      let maxHeight: number;
      if (preferPlacement === 'top') {
        clampedTop = Math.max(12, Math.round(anchorRect.top - popH - 8));
        maxHeight = Math.max(220, Math.round(anchorRect.top - 20));
      } else {
        const desiredTop = Math.round(anchorRect.bottom + 8);
        clampedTop = Math.max(12, Math.min(desiredTop, Math.max(12, vh - 180)));
        maxHeight = Math.max(220, vh - clampedTop - 12);
      }

      setCoords({
        top: clampedTop,
        left: clampedLeft,
        maxHeight,
        ready: true,
      });
    };

    updatePosition();
    const raf = window.requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, preferAlign, preferPlacement]);

  return (
    <div
      ref={popRef}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        maxHeight: coords.maxHeight,
        zIndex: 80,
        opacity: coords.ready ? 1 : 0,
      }}
      className="overflow-y-auto rounded-2xl transition-opacity duration-75"
    >
      {children}
    </div>
  );
};

export default ToolbarPopoverAnchor;
