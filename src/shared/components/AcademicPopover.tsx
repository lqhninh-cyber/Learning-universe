import { BookOpen, Lightbulb, Pin, X } from 'lucide-react';
import { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { findGlossaryEntry } from '@/data/math-glossary';
import { InlineMathText, KatexMath } from '@/features/math-glossary';
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
 * - Hiển thị thẻ nổi kính mờ (`backdrop-blur-xl bg-[#F7FAFA]/95 dark:bg-[#1A2026]/95 ... w-[min(92vw,420px)] text-xs`).
 * - Tách bố cục header thành 3 tầng dọc độc lập, loại bỏ xung đột ngang giữa tiêu đề và công thức.
 * - Kết xuất trực tiếp định nghĩa tóm tắt và công thức KaTeX nội dòng.
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

  const isFormulaLong = resolvedFormula && resolvedFormula.length > 35;

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
          className={cn(
            'absolute bottom-full left-1/2 z-50 mb-2.5 block -translate-x-1/2 rounded-2xl border border-[#CFDADB] bg-[#F7FAFA]/95 p-4 text-left text-[#29383D] shadow-2xl backdrop-blur-xl transition-all select-text dark:border-stone-700/80 dark:bg-[#1A2026]/95 dark:text-stone-200',
            'w-80',
            isFormulaLong ? 'sm:w-[min(92vw,460px)]' : 'sm:w-[min(92vw,420px)]',
          )}
        >
          {/* Tầng 1: Top Meta Bar */}
          <span className="mb-1.5 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold tracking-[0.08em] text-[#1B3D2F]/75 uppercase dark:text-[#86EFAC]">
              <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{resolvedCourse}</span>
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
                onClick={(event) => {
                  event.stopPropagation();
                  handleForceClose();
                }}
                aria-label="Đóng thẻ tra cứu"
                className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-black/5 dark:text-stone-400 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </span>
          </span>

          {/* Tầng 2: Khối Tiêu Đề Toàn Chiều Ngang */}
          <span className="mb-3 block w-full">
            <span className="block font-serif text-[18px] leading-[1.3] font-bold text-[var(--text-primary,#29383D)] dark:text-stone-100">
              {resolvedTitle}
            </span>
          </span>

          {/* Tầng 3: Khung Công Thức Trung Tâm Toàn Chiều Ngang */}
          {resolvedFormula && (
            <span className="mb-3.5 flex w-full scrollbar-none items-center justify-center overflow-x-auto rounded-xl border border-[#1B3D2F]/12 bg-[#1B3D2F]/[0.05] px-3.5 py-2.5 text-[#29383D] dark:border-white/10 dark:bg-white/[0.06] dark:text-stone-100">
              <KatexMath math={resolvedFormula} className="font-serif text-[15.5px]" />
            </span>
          )}

          {/* Thân thẻ cuộn mượt cho định lý dài */}
          <span className="block max-h-[min(60vh,340px)] scrollbar-thin overflow-y-auto pr-1">
            {/* Nội dung tóm tắt định nghĩa */}
            <span className="mb-3 block text-[14.5px] leading-[1.65] text-[var(--text-primary,#29383D)] dark:text-stone-200">
              <InlineMathText text={resolvedSummary} />
            </span>

            {/* Trực giác / Bản chất (nếu có) */}
            {resolvedIntuition && (
              <span className="block space-y-1 rounded-xl border border-[#25694C]/15 bg-[#E8F4EE]/60 p-3 text-[13.5px] leading-[1.6] text-[var(--text-primary,#29383D)] dark:border-[#25694C]/30 dark:bg-[#15302A]/50 dark:text-stone-200">
                <span className="flex items-center gap-1.5 font-semibold text-[#1B3D2F] dark:text-[#86EFAC]">
                  <Lightbulb
                    className="h-4 w-4 shrink-0 text-[#1B3D2F] dark:text-[#86EFAC]"
                    aria-hidden="true"
                  />
                  <span>Trực quan &amp; Bản chất:</span>
                </span>
                <span className="block">
                  <InlineMathText text={resolvedIntuition} />
                </span>
              </span>
            )}
          </span>
        </span>
      )}
    </span>
  );
};

export default AcademicPopover;
