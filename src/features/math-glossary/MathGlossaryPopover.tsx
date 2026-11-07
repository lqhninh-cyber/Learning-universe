import { ArrowRight, Lightbulb, Pin, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
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
  const { activeEntry, anchorRect, cancelHide, hidePopover, closePopover } = useMathGlossary();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(false);

  const coords = useMemo(() => computeCoords(anchorRect), [anchorRect]);

  // Đóng popover khi nhấn phím Escape hoặc click bên ngoài (nếu chưa ghim)
  useEffect(() => {
    if (!activeEntry) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPinned(false);
        closePopover();
      }
    };

    const handlePointerDownOutside = (e: PointerEvent) => {
      if (isPinned) {
        return;
      }
      const target = e.target as Element | null;
      if (popoverRef.current && popoverRef.current.contains(target as Node)) {
        return;
      }
      if (target?.closest?.('.lu-glossary-term')) {
        return;
      }
      closePopover();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDownOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDownOutside);
    };
  }, [activeEntry, closePopover, isPinned]);

  if (!activeEntry || !coords || typeof document === 'undefined') {
    return null;
  }

  const subjectLabel =
    activeEntry.courseName ||
    (activeEntry.subject === 'giai-tich-ham-mot-bien' ||
    activeEntry.courseId === 'giai-tich-ham-mot-bien'
      ? 'GIẢI TÍCH HÀM MỘT BIẾN'
      : activeEntry.subject === 'cau-truc-dai-so' || activeEntry.courseId === 'cau-truc-dai-so'
        ? 'CẤU TRÚC ĐẠI SỐ'
        : 'HÌNH HỌC AFFINE');

  const displayName = activeEntry.name || activeEntry.nameVi;
  const displayEnglish = activeEntry.englishName || activeEntry.nameEn;
  const displayFormula = activeEntry.formula || activeEntry.symbol;
  const displaySummary = activeEntry.summary || activeEntry.brief;
  const displayLessonUrl = activeEntry.lessonUrl || activeEntry.relatedLesson;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Chú thích thuật ngữ: ${displayName}`}
      onMouseEnter={cancelHide}
      onMouseLeave={() => {
        if (!isPinned) {
          hidePopover(180);
        }
      }}
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${Math.min(POPOVER_WIDTH, window.innerWidth - 32)}px`,
      }}
      className="animate-in fade-in zoom-in-95 z-50 w-80 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA]/95 p-4 text-xs text-[#29383D] shadow-2xl backdrop-blur-xl transition-all duration-150 dark:border-stone-700/80 dark:bg-[#1A2026]/95 dark:text-stone-200"
    >
      {/* Header: Ký hiệu + Tên thuật ngữ + Nút Ghim (Pin) & Đóng [✕] */}
      <div className="flex items-start justify-between gap-2.5 border-b border-[#CFDADB] pb-2.5 dark:border-stone-700/80">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold tracking-wider text-[#3F6570] uppercase dark:text-[#E09F5A]">
              {subjectLabel}
            </span>
          </div>
          <h3 className="font-serif text-base leading-snug font-bold text-[#29383D] dark:text-stone-100">
            {displayName}
          </h3>
          <p className="text-[11px] text-[#55676B] italic dark:text-stone-400">{displayEnglish}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <div className="flex items-center gap-1">
            <div className="rounded-md border border-[#CFDADB] bg-[#E1E9EA] px-2 py-0.5 text-center shadow-2xs dark:border-stone-700 dark:bg-stone-800">
              <KatexMath
                math={displayFormula}
                className="font-serif text-sm text-[#29383D] dark:text-stone-100"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPinned((prev) => {
                  const next = !prev;
                  if (next) {
                    cancelHide();
                  }
                  return next;
                });
              }}
              aria-pressed={isPinned}
              aria-label={isPinned ? 'Bỏ ghim chú thích' : 'Ghim chú thích cố định'}
              title={isPinned ? 'Bỏ ghim chú thích' : 'Ghim chú thích cố định để đối chiếu'}
              className={cn(
                'cursor-pointer rounded-md p-1 transition-colors',
                isPinned
                  ? 'bg-[#3F6570] text-white dark:bg-[#E09F5A] dark:text-stone-950'
                  : 'text-stone-500 hover:bg-[#E1E9EA] hover:text-[#29383D] dark:text-stone-400 dark:hover:bg-stone-800',
              )}
            >
              <Pin className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPinned(false);
                closePopover();
              }}
              aria-label="Đóng chú thích"
              className="cursor-pointer rounded-md p-1 text-stone-500 transition-colors hover:bg-[#E1E9EA] hover:text-[#29383D] dark:text-stone-400 dark:hover:bg-stone-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Nội dung định nghĩa tóm tắt */}
      <div className="space-y-2 py-2.5 text-xs leading-relaxed text-[#29383D]">
        <p>{displaySummary}</p>

        {/* Khối trực giác / bản chất */}
        <div className="space-y-1 rounded-lg border border-[#CFDADB] bg-[#E1E9EA]/70 p-2.5 text-[11px] leading-relaxed text-[#29383D]">
          <div className="flex items-center gap-1.5 font-semibold text-[#3F6570]">
            <Lightbulb className="h-3.5 w-3.5 shrink-0 text-[#3F6570]" aria-hidden="true" />
            <span>Trực quan & Bản chất:</span>
          </div>
          <p>{activeEntry.intuition}</p>
        </div>
      </div>

      {/* Footer: Nút xem bài học gốc */}
      <div className="mt-1 flex items-center justify-between border-t border-[#D8D0C0] pt-2">
        <Link
          to={displayLessonUrl}
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
