import { ArrowRight, Lightbulb, Pin, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import { InlineMathText, KatexMath } from './KatexMath';
import { useMathGlossary } from './useMathGlossary';

function computeCoords(
  anchorRect: DOMRect | null,
  targetWidth: number,
  estimatedHeight = 360,
): { top: number; left: number; width: number } | null {
  if (!anchorRect || typeof window === 'undefined') {
    return null;
  }

  const margin = 12;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const width = Math.min(Math.round(viewportWidth * 0.92), targetWidth);
  let left = anchorRect.left + anchorRect.width / 2 - width / 2;
  // Chống tràn mép trái / phải: giữ margin 12px cách mép viewport
  left = Math.max(margin, Math.min(left, viewportWidth - width - margin));

  // Mặc định hiển thị bên dưới, nếu chạm đáy màn hình thì bật lên trên
  const spaceBelow = viewportHeight - anchorRect.bottom - margin;
  const openAbove = spaceBelow < estimatedHeight && anchorRect.top > estimatedHeight;

  let top: number;
  if (openAbove) {
    top = Math.max(margin, anchorRect.top - estimatedHeight - 8);
  } else {
    top = anchorRect.bottom + 8;
    if (top + estimatedHeight > viewportHeight - margin) {
      top = Math.max(margin, viewportHeight - estimatedHeight - margin);
    }
  }

  return { top, left, width };
}

export function MathGlossaryPopover() {
  const { activeEntry, anchorRect, cancelHide, hidePopover, closePopover } = useMathGlossary();
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isPinned, setIsPinned] = useState(false);

  const displayFormula = activeEntry ? activeEntry.formula || activeEntry.symbol : '';
  const targetWidth = displayFormula && displayFormula.length > 35 ? 460 : 420;

  const coords = useMemo(() => computeCoords(anchorRect, targetWidth), [anchorRect, targetWidth]);

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
    (activeEntry.subject === 'giao-duc-hoc' || activeEntry.courseId === 'giao-duc-hoc'
      ? 'GIÁO DỤC HỌC'
      : activeEntry.subject === 'giai-tich-ham-mot-bien' ||
          activeEntry.courseId === 'giai-tich-ham-mot-bien'
        ? 'GIẢI TÍCH HÀM MỘT BIẾN'
        : activeEntry.subject === 'cau-truc-dai-so' || activeEntry.courseId === 'cau-truc-dai-so'
          ? 'CẤU TRÚC ĐẠI SỐ'
          : 'HÌNH HỌC AFFINE');

  const displayName = activeEntry.name || activeEntry.nameVi;
  const displayEnglish = activeEntry.englishName || activeEntry.nameEn;
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
        width: `${coords.width}px`,
      }}
      className="animate-in fade-in zoom-in-95 z-50 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA]/95 p-4 text-[#29383D] shadow-2xl backdrop-blur-xl transition-all duration-150 select-text dark:border-stone-700/80 dark:bg-[#1A2026]/95 dark:text-stone-200"
    >
      {/* Tầng 1: Top Meta Bar */}
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-[11px] font-bold tracking-[0.08em] text-[#1B3D2F]/75 uppercase dark:text-[#86EFAC]">
          {subjectLabel}
        </span>

        <div className="flex shrink-0 items-center gap-1">
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
              'flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors',
              isPinned
                ? 'bg-[#1B3D2F] text-white dark:bg-[#86EFAC] dark:text-[#091A13]'
                : 'text-stone-500 hover:bg-black/5 dark:text-stone-400 dark:hover:bg-white/10',
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
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-black/5 dark:text-stone-400 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Tầng 2: Khối Tiêu Đề Toàn Chiều Ngang */}
      <div className="mb-3 w-full">
        <h3 className="font-serif text-[18px] leading-[1.3] font-bold text-[var(--text-primary,#29383D)] dark:text-stone-100">
          {displayName}
        </h3>
        {displayEnglish && (
          <p className="mt-0.5 text-[13px] text-[var(--text-secondary,#55676B)] italic dark:text-stone-400">
            {displayEnglish}
          </p>
        )}
      </div>

      {/* Tầng 3: Khung Công Thức Trung Tâm Toàn Chiều Ngang */}
      {displayFormula && (
        <div className="mb-3.5 flex w-full scrollbar-none items-center justify-center overflow-x-auto rounded-xl border border-[#1B3D2F]/12 bg-[#1B3D2F]/[0.05] px-3.5 py-2.5 dark:border-white/10 dark:bg-white/[0.06]">
          <KatexMath
            math={displayFormula}
            className="font-serif text-[15.5px] text-[#29383D] dark:text-stone-100"
          />
        </div>
      )}

      {/* Thân thẻ cuộn mượt cho định lý dài */}
      <div className="max-h-[min(60vh,340px)] scrollbar-thin overflow-y-auto pr-1">
        {/* Nội dung định nghĩa / phát biểu định lý */}
        <div className="mb-3 text-[14.5px] leading-[1.65] text-[var(--text-primary,#29383D)] dark:text-stone-200">
          <InlineMathText text={displaySummary} />
        </div>

        {/* Khối trực giác / bản chất */}
        {activeEntry.intuition && (
          <div className="space-y-1 rounded-xl border border-[#25694C]/15 bg-[#E8F4EE]/60 p-3 text-[13.5px] leading-[1.6] text-[var(--text-primary,#29383D)] dark:border-[#25694C]/30 dark:bg-[#15302A]/50 dark:text-stone-200">
            <div className="flex items-center gap-1.5 font-semibold text-[#1B3D2F] dark:text-[#86EFAC]">
              <Lightbulb
                className="h-4 w-4 shrink-0 text-[#1B3D2F] dark:text-[#86EFAC]"
                aria-hidden="true"
              />
              <span>Trực quan &amp; Bản chất:</span>
            </div>
            <div>
              <InlineMathText text={activeEntry.intuition} />
            </div>
          </div>
        )}
      </div>

      {/* Footer: Nút xem bài học gốc */}
      {displayLessonUrl && (
        <div className="mt-3 flex items-center justify-between border-t border-[#CFDADB] pt-2.5 dark:border-stone-700/80">
          <Link
            to={displayLessonUrl}
            onClick={closePopover}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1B3D2F] underline underline-offset-4 transition-colors hover:text-[#25694C] dark:text-[#86EFAC] dark:hover:text-[#4ADE80]"
          >
            <span>Xem bài học gốc</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
          <span className="text-[10px] text-stone-500 dark:text-stone-400">Learning Universe</span>
        </div>
      )}
    </div>,
    document.body,
  );
}
