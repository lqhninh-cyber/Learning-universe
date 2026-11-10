import { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { getGlossaryEntry } from '@/data/glossaryData';
import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface GlossaryTermProps {
  /** ID thuật ngữ tương ứng trong glossaryData */
  readonly termId: string;
  /** Từ ngữ hiển thị trong câu (nếu không truyền sẽ dùng entry.term) */
  readonly children?: ReactNode;
  readonly className?: string;
}

/**
 * Phân tích và kết xuất chuỗi văn bản hỗn hợp có chứa công thức KaTeX nội dòng $...$
 */
function renderMixedText(text: string): ReactNode {
  if (!text) return null;
  const parts = text.split(/(\$[^$]+\$)/g);

  return parts.map((part, index) => {
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const math = part.slice(1, -1);
      return <KatexMath key={index} math={math} className="inline-block px-0.5" />;
    }
    return part;
  });
}

/**
 * SMART MARGINALIA & POPOVER GLOSSES (HỆ THỐNG CHÚ GIẢI THUẬT NGỮ NỔI)
 *
 * Cho phép sinh viên tra cứu trực tiếp các khái niệm chuyên sâu (GDH, GTHMB, HHAVE)
 * mà không làm gián đoạn dòng đọc:
 * - Trực quan inline: Gạch chân đứt đoạn màu xanh men ngọc (#739B88), hover chuyển sang vàng thếp (#C5A262).
 * - Thẻ nổi kính mờ (Backdrop Blur Popover): Tiêu đề, Ký hiệu KaTeX/phiên âm, Định nghĩa 2 câu, Liên kết chuyên khảo.
 * - Tự động tránh tràn viền (Collision boundary check) theo 4 hướng.
 * - Hỗ trợ cả Desktop (Hover debounce 120ms / Click) & Mobile (Chạm mở, chạm ngoài / ESC đóng).
 */
export const GlossaryTerm: FC<GlossaryTermProps> = ({ termId, children, className }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const [align, setAlign] = useState<'center' | 'left' | 'right'>('center');

  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  const entry = getGlossaryEntry(termId);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Tính toán vị trí hiển thị tối ưu tránh tràn màn hình (Collision boundary check)
  const updatePlacement = useCallback(() => {
    if (!triggerRef.current || typeof window === 'undefined') return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverHeight = 170;
    const halfWidth = 160;

    // Ưu tiên phía trên, nếu không đủ chỗ ở trên (< 175px từ đỉnh viewport) thì đặt phía dưới
    if (rect.top < popoverHeight && rect.bottom + popoverHeight < window.innerHeight) {
      setPlacement('bottom');
    } else {
      setPlacement('top');
    }

    // Kiểm tra tràn viền ngang
    const centerX = rect.left + rect.width / 2;
    if (centerX < halfWidth + 16) {
      setAlign('left');
    } else if (window.innerWidth - centerX < halfWidth + 16) {
      setAlign('right');
    } else {
      setAlign('center');
    }
  }, []);

  const handleOpen = useCallback(() => {
    clearTimer();
    updatePlacement();
    setIsOpen(true);
  }, [clearTimer, updatePlacement]);

  const handleDelayedClose = useCallback(() => {
    clearTimer();
    if (typeof window !== 'undefined') {
      timerRef.current = window.setTimeout(() => {
        setIsOpen(false);
      }, 120);
    } else {
      setIsOpen(false);
    }
  }, [clearTimer]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpen) {
      clearTimer();
      setIsOpen(false);
    } else {
      handleOpen();
    }
  };

  // Lắng nghe sự kiện click outside và phím ESC để đóng popover
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node | null;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // Nếu không tìm thấy thuật ngữ trong từ điển, render nội dung gốc an toàn
  if (!entry) {
    return <span className={className}>{children ?? termId}</span>;
  }

  const isMathNotation = entry.notation.includes('$') || entry.notation.includes('\\');
  const cleanMathNotation = entry.notation.replace(/^\$|\$$/g, '');

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={handleOpen}
      onMouseLeave={handleDelayedClose}
    >
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggle(e as unknown as React.MouseEvent);
          }
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        data-glossary-term={termId}
        title={`Thuật ngữ: ${entry.term} (Bấm hoặc rê chuột để xem chú giải)`}
        className={cn(
          'inline-flex cursor-help items-center border-b border-dashed border-[#739B88] font-medium text-inherit transition-colors duration-150 hover:border-[#C5A262]',
          isOpen && 'border-[#C5A262] text-[#2E6B4F] dark:text-[#C5A262]',
          className,
        )}
      >
        {children ?? entry.term}
      </span>

      {/* Thẻ chú giải kính mờ (Backdrop Blur Popover) */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="dialog"
          aria-label={`Chú giải thuật ngữ: ${entry.term}`}
          onMouseEnter={handleOpen}
          onMouseLeave={handleDelayedClose}
          className={cn(
            'absolute z-50 w-72 rounded-xl p-3.5 text-left shadow-2xl backdrop-blur-xl transition-all duration-150 select-none sm:w-80',
            'border border-zinc-200/90 bg-white/95 text-zinc-900',
            'dark:border-[#1E3B2D] dark:bg-[#091A13]/95 dark:text-[#F5F2EB]',
            'animate-in fade-in zoom-in-95',
            placement === 'top' ? 'bottom-full mb-2.5' : 'top-full mt-2.5',
            align === 'center' && 'left-1/2 -translate-x-1/2',
            align === 'left' && 'left-0',
            align === 'right' && 'right-0',
          )}
        >
          {/* Dòng 1: Tiêu đề thuật ngữ & Ký hiệu / Phiên âm */}
          <div className="flex items-baseline justify-between gap-2 border-b border-zinc-200/60 pb-2 dark:border-[#162E22]">
            <h4 className="font-serif text-sm font-bold text-zinc-900 dark:text-[#F5F2EB]">
              {entry.term}
            </h4>

            {entry.notation && (
              <span className="font-mono text-xs font-semibold text-[var(--gold-text)]">
                {isMathNotation ? (
                  <KatexMath math={cleanMathNotation} />
                ) : (
                  <span>{entry.notation}</span>
                )}
              </span>
            )}
          </div>

          {/* Dòng 2: Nội dung định nghĩa cô đọng */}
          <div className="mt-2 line-clamp-3 text-xs leading-relaxed text-zinc-600 dark:text-[#CBD5CE]">
            {renderMixedText(entry.shortDefinition)}
          </div>

          {/* Dòng 3: Huy hiệu môn học & Đường link chuyển tiếp chuyên khảo */}
          <div className="mt-2.5 flex items-center justify-between border-t border-zinc-200/60 pt-2 dark:border-[#162E22]">
            <span className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-zinc-600 dark:bg-[#12241C] dark:text-[#A1D1B7]">
              {entry.subject}
            </span>

            <Link
              to={entry.targetUrl}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1 text-[11px] font-medium text-[#2B6347] transition-colors hover:text-[var(--gold-text)] dark:text-[#739B88] dark:hover:text-[var(--gold-text)]"
            >
              <span>Xem mục chuyên khảo</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      )}
    </span>
  );
};

export default GlossaryTerm;
