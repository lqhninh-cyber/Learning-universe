import { BookOpen, Lightbulb, Pin, X } from 'lucide-react';
import { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { findGlossaryEntry } from '@/data/math-glossary';
import { KatexMath } from '@/features/math-glossary';
import { cn } from '@/shared/lib/cn';

export interface AcademicPopoverProps {
  /** Mã định danh thuật ngữ, ký hiệu hoặc định lý (ví dụ: "dinh-ly-lagrange", "khong-gian-afin") */
  readonly term: string;
  /** Tiêu đề hiển thị trên thẻ popover (tùy chọn; tự động tra cứu từ ngân hàng thuật ngữ nếu để trống) */
  readonly title?: string;
  /** Công thức Toán học KaTeX ngắn gọn (tùy chọn; tự động tra cứu nếu để trống) */
  readonly formula?: string;
  /** Nội dung tóm tắt định nghĩa / phát biểu định lý (tùy chọn; tự động tra cứu nếu để trống) */
  readonly summary?: string;
  /** Ghi chú trực giác / bản chất toán học (tùy chọn) */
  readonly intuition?: string;
  /** Tên học phần hoặc phân loại (tùy chọn) */
  readonly courseLabel?: string;
  /** Mã môn học hiện tại để phân giải thuật ngữ đồng âm (tùy chọn) */
  readonly currentCourseId?: string;
  /** Nội dung văn bản gốc được gắn thuộc tính `data-academic-term` */
  readonly children?: ReactNode;
  /** Lớp CSS tùy biến cho phần tử kích hoạt */
  readonly className?: string;
}

/**
 * Kỹ thuật Kính Lúp Tri Thức (Transclusion & Gwern-style Academic Popover):
 * - Kích hoạt khi rê chuột (hover) hoặc focus vào thuật ngữ/ký hiệu/mã định lý có `data-academic-term="..."`.
 * - Hiển thị thẻ nổi kính mờ (`backdrop-blur-xl bg-[#F7FAFA]/95 dark:bg-[#1A2026]/95 ... w-80 text-xs`).
 * - Kết xuất trực tiếp định nghĩa tóm tắt và công thức KaTeX.
 * - Hỗ trợ nút ghim (`Pin`) để giữ cố định thẻ khi đối chiếu chứng minh phức tạp.
 */
export const AcademicPopover: FC<AcademicPopoverProps> = ({
  term,
  title,
  formula,
  summary,
  intuition,
  courseLabel,
  currentCourseId,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

  const glossaryEntry = findGlossaryEntry(term, currentCourseId);

  const resolvedTitle = title ?? glossaryEntry?.name ?? glossaryEntry?.nameVi ?? term;
  const resolvedFormula = formula ?? glossaryEntry?.formula ?? glossaryEntry?.symbol;
  const resolvedSummary =
    summary ??
    glossaryEntry?.summary ??
    glossaryEntry?.brief ??
    'Khái niệm hoặc mệnh đề học thuật đối chiếu trực tiếp trong bài giảng.';
  const resolvedIntuition = intuition ?? glossaryEntry?.intuition;
  const resolvedCourse =
    courseLabel ??
    glossaryEntry?.courseName ??
    (glossaryEntry?.subject === 'cau-truc-dai-so'
      ? 'Cấu trúc đại số'
      : glossaryEntry?.subject === 'giai-tich-ham-mot-bien'
        ? 'Giải tích hàm một biến'
        : glossaryEntry?.subject === 'hinh-hoc-affine'
          ? 'Hình học Affine & Euclide'
          : 'Tra cứu Học thuật');

  const clearHideTimer = useCallback(() => {
    if (hideTimeoutRef.current !== null && typeof window !== 'undefined') {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  }, []);

  const handleOpen = useCallback(() => {
    clearHideTimer();
    setIsOpen(true);
  }, [clearHideTimer]);

  const handleDelayedClose = useCallback(() => {
    if (isPinned) {
      return;
    }
    clearHideTimer();
    if (typeof window !== 'undefined') {
      hideTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false);
      }, 160);
    } else {
      setIsOpen(false);
    }
  }, [clearHideTimer, isPinned]);

  const handleForceClose = useCallback(() => {
    clearHideTimer();
    setIsPinned(false);
    setIsOpen(false);
  }, [clearHideTimer]);

  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleOpen}
      onMouseLeave={handleDelayedClose}
    >
      <span
        tabIndex={0}
        role="button"
        data-academic-term={term}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onFocus={handleOpen}
        onBlur={handleDelayedClose}
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'cursor-help border-b border-dotted border-[#9E3D24]/70 font-serif text-stone-900 transition-colors hover:border-solid hover:border-[#9E3D24] hover:text-[#9E3D24] dark:border-[#E09F5A]/70 dark:text-stone-100 dark:hover:border-[#E09F5A] dark:hover:text-[#E09F5A]',
          isPinned && 'rounded-xs bg-[#9E3D24]/10 px-1 dark:bg-[#E09F5A]/15',
          className,
        )}
      >
        {children ?? resolvedTitle}
      </span>

      {isOpen && (
        <span
          role="dialog"
          aria-label={`Kính lúp tri thức: ${resolvedTitle}`}
          onMouseEnter={handleOpen}
          onMouseLeave={handleDelayedClose}
          className="absolute bottom-full left-1/2 z-50 mb-2.5 block w-80 -translate-x-1/2 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA]/95 p-4 text-left text-xs text-[#29383D] shadow-2xl backdrop-blur-xl transition-all dark:border-stone-700/80 dark:bg-[#1A2026]/95 dark:text-stone-200"
        >
          {/* Header: Nhãn môn học + Tiêu đề + Nút Ghim (Pin) & Đóng */}
          <span className="flex items-start justify-between gap-2 border-b border-[#CFDADB] pb-2.5 dark:border-stone-700/70">
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="inline-flex items-center gap-1 font-mono text-[10px] font-semibold tracking-wider text-[#3F6570] uppercase dark:text-[#E09F5A]">
                <BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{resolvedCourse}</span>
              </span>
              <span className="block font-serif text-sm leading-snug font-bold text-[#29383D] dark:text-stone-100">
                {resolvedTitle}
              </span>
            </span>

            <span className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsPinned((prev) => !prev);
                }}
                aria-pressed={isPinned}
                aria-label={isPinned ? 'Bỏ ghim thẻ tra cứu' : 'Ghim cố định thẻ tra cứu'}
                title={
                  isPinned
                    ? 'Đang ghim cố định để đối chiếu chứng minh (Nhấn để bỏ ghim)'
                    : 'Ghim cố định thẻ này khi đọc chứng minh'
                }
                className={cn(
                  'cursor-pointer rounded-lg p-1.5 transition-colors',
                  isPinned
                    ? 'bg-[#3F6570] text-white dark:bg-[#E09F5A] dark:text-stone-950'
                    : 'text-stone-500 hover:bg-[#E1E9EA] hover:text-[#29383D] dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100',
                )}
              >
                <Pin className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              {isPinned && (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleForceClose();
                  }}
                  aria-label="Đóng thẻ tra cứu"
                  className="cursor-pointer rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-[#E1E9EA] hover:text-[#29383D] dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </span>
          </span>

          {/* Khối Công thức Toán học KaTeX */}
          {resolvedFormula && (
            <span className="my-2.5 flex items-center justify-center overflow-x-auto rounded-xl border border-[#CFDADB] bg-[#E1E9EA] px-3 py-2 text-[#29383D] dark:border-stone-700/80 dark:bg-stone-900/80 dark:text-stone-100">
              <KatexMath math={resolvedFormula} className="font-serif text-sm" />
            </span>
          )}

          {/* Nội dung tóm tắt định nghĩa */}
          <span className="mt-2 block leading-relaxed text-[#55676B] dark:text-stone-300">
            {resolvedSummary}
          </span>

          {/* Trực giác / Bản chất (nếu có) */}
          {resolvedIntuition && (
            <span className="mt-2.5 block rounded-xl border border-[#CFDADB] bg-[#E1E9EA]/80 p-2.5 text-[11px] leading-relaxed text-[#55676B] dark:border-stone-700/70 dark:bg-stone-900/60 dark:text-stone-400">
              <span className="mb-0.5 flex items-center gap-1 font-semibold text-[#3F6570] dark:text-[#E09F5A]">
                <Lightbulb className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>Trực giác học thuật:</span>
              </span>
              <span className="block">{resolvedIntuition}</span>
            </span>
          )}
        </span>
      )}
    </span>
  );
};

export default AcademicPopover;
