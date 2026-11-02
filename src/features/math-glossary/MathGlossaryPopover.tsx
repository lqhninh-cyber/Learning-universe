import { ArrowRight, Lightbulb, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { KatexMath } from './KatexMath';
import { useMathGlossary } from './useMathGlossary';

const POPOVER_WIDTH = 340;

function computeCoords(anchorRect: DOMRect | null): { top: number; left: number } | null {
  if (!anchorRect || typeof window === 'undefined') {
    return null;
  }

  const margin = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const width = Math.min(POPOVER_WIDTH, viewportWidth - 32);
  let left = anchorRect.left + anchorRect.width / 2 - width / 2;
  // Chống tràn ngang
  left = Math.max(16, Math.min(left, viewportWidth - width - 16));

  // Mặc định hiển thị bên dưới, nếu chạm đáy màn hình thì bật lên trên
  const estimatedHeight = 260;
  const spaceBelow = viewportHeight - anchorRect.bottom;
  const openAbove = spaceBelow < estimatedHeight && anchorRect.top > estimatedHeight;

  const top = openAbove
    ? Math.max(16, anchorRect.top - estimatedHeight - margin)
    : anchorRect.bottom + margin;

  return { top, left };
}

export function MathGlossaryPopover() {
  const { activeEntry, anchorRect, isPinned, cancelHide, hidePopover, closePopover } =
    useMathGlossary();
  const popoverRef = useRef<HTMLDivElement>(null);

  const coords = useMemo(() => computeCoords(anchorRect), [anchorRect]);

  // Đóng popover khi nhấn phím Escape hoặc click bên ngoài (khi pinned)
  useEffect(() => {
    if (!activeEntry) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePopover();
      }
    };

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        closePopover();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    if (isPinned) {
      window.addEventListener('pointerdown', handlePointerDownOutside);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [activeEntry, isPinned, closePopover]);

  if (!activeEntry || !coords || typeof document === 'undefined') {
    return null;
  }

  const subjectLabel =
    activeEntry.subject === 'cau-truc-dai-so' ? 'Cấu trúc đại số' : 'Hình học Affine';

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Chú thích thuật ngữ: ${activeEntry.nameVi}`}
      onMouseEnter={cancelHide}
      onMouseLeave={() => hidePopover(180)}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${Math.min(POPOVER_WIDTH, window.innerWidth - 32)}px`,
      }}
      className="animate-in fade-in zoom-in-95 z-50 rounded-xl border border-[#D8D0C0] bg-[#F0ECE4] p-4 text-[#1C1917] shadow-xl backdrop-blur-xs transition-all duration-150"
    >
      {/* Header: Ký hiệu + Tên thuật ngữ */}
      <div className="flex items-start justify-between gap-2.5 border-b border-[#D8D0C0] pb-2.5">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
              {subjectLabel}
            </span>
          </div>
          <h3 className="font-serif text-base leading-snug font-bold text-stone-900">
            {activeEntry.nameVi}
          </h3>
          <p className="text-[11px] text-stone-600 italic">{activeEntry.nameEn}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="rounded-md border border-[#D0C8B8] bg-[#E8E0D2] px-2 py-0.5 text-center shadow-2xs">
            <KatexMath math={activeEntry.symbol} className="font-serif text-sm text-stone-900" />
          </div>
          {isPinned && (
            <button
              type="button"
              onClick={closePopover}
              aria-label="Đóng chú thích"
              className="rounded p-0.5 text-stone-500 hover:bg-stone-300/40 hover:text-stone-800"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Nội dung định nghĩa tóm tắt */}
      <div className="space-y-2 py-2.5 text-xs leading-relaxed text-stone-800">
        <p>{activeEntry.brief}</p>

        {/* Khối trực giác / bản chất */}
        <div className="space-y-1 rounded-lg border border-[#D0C8B8] bg-[#E8E0D2]/70 p-2.5 text-[11px] leading-relaxed text-stone-700">
          <div className="flex items-center gap-1.5 font-semibold text-amber-900">
            <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-700" aria-hidden="true" />
            <span>Trực quan & Bản chất:</span>
          </div>
          <p>{activeEntry.intuition}</p>
        </div>
      </div>

      {/* Footer: Nút xem bài học gốc */}
      <div className="mt-1 flex items-center justify-between border-t border-[#D8D0C0] pt-2">
        <Link
          to={activeEntry.relatedLesson}
          onClick={closePopover}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 underline underline-offset-4 transition-colors hover:text-amber-700"
        >
          <span>Xem bài học gốc</span>
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
        <span className="text-[10px] text-stone-500">Learning Universe</span>
      </div>
    </div>,
    document.body,
  );
}
