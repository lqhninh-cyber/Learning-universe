import { AlertTriangle, GraduationCap, History, Image as ImageIcon, Info } from 'lucide-react';
import {
  createContext,
  type FC,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { cn } from '@/shared/lib/cn';

export type SidenoteType = 'history' | 'caution' | 'pedagogy' | 'figure' | 'note';

export interface SidenoteProps {
  /** Mã định danh chú giải lề (tùy chọn) */
  readonly id?: string;
  /** ID phần tử neo trong bài học để tự động tính toán tọa độ Y ngang hàng trên Desktop (tùy chọn) */
  readonly anchor?: string;
  /**
   * Phân loại chú giải học thuật (Edward Tufte / Distill standard):
   * - 'history': Bối cảnh lịch sử toán học & nhân vật (màu mực than chì / xám đá `border-stone-400`)
   * - 'caution': Lưu ý quan trọng & bẫy lập luận (đỏ chu sa / đất nung `border-[#9E3D24] text-[#9E3D24] dark:text-[#E09F5A]`)
   * - 'pedagogy': Nghiệp vụ sư phạm & liên hệ thực tiễn dạy học (màu chàm cổ điển `border-indigo-400`)
   * - 'figure': Minh họa vi mô & đồ thị nhỏ (viền hairline mờ kèm chú thích hình phía dưới)
   * - 'note': Chú giải học thuật chung (màu than chì `border-stone-400`)
   */
  readonly type?: SidenoteType;
  /** Số thứ tự chú dẫn (tùy chọn; tự động tăng theo thứ tự xuất hiện trong bài nếu để trống) */
  readonly number?: number | string;
  /** Tiêu đề ngắn gọn cho chú giải (tùy chọn) */
  readonly title?: string;
  /** Chú thích hình vẽ (dùng cho type="figure") */
  readonly caption?: ReactNode;
  /** Nội dung chú giải (hỗ trợ văn bản, KaTeX, micro-diagram, v.v.) */
  readonly children?: ReactNode;
  /** Lớp CSS tùy biến */
  readonly className?: string;
}

interface SidenoteStyleDef {
  readonly label: string;
  readonly Icon: typeof Info;
  readonly borderClass: string;
  readonly textClass: string;
  readonly badgeClass: string;
}

const SIDENOTE_STYLES: Record<SidenoteType, SidenoteStyleDef> = {
  history: {
    label: 'Lịch sử',
    Icon: History,
    borderClass: 'border-l-2 border-stone-400 dark:border-stone-500',
    textClass: 'text-stone-600 dark:text-stone-400',
    badgeClass:
      'border-stone-400/50 bg-stone-200/70 text-stone-800 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
  },
  caution: {
    label: 'Lưu ý',
    Icon: AlertTriangle,
    borderClass: 'border-l-2 border-[#9E3D24] dark:border-[#E09F5A]',
    textClass: 'text-[#9E3D24] dark:text-[#E09F5A]',
    badgeClass:
      'border-[#9E3D24]/40 bg-[#9E3D24]/10 text-[#9E3D24] dark:bg-[#E09F5A]/15 dark:text-[#E09F5A] dark:border-[#E09F5A]/40',
  },
  pedagogy: {
    label: 'Sư phạm',
    Icon: GraduationCap,
    borderClass: 'border-l-2 border-indigo-400 dark:border-indigo-500',
    textClass: 'text-indigo-900 dark:text-indigo-300',
    badgeClass:
      'border-indigo-300/60 bg-indigo-50 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60',
  },
  figure: {
    label: 'Minh họa',
    Icon: ImageIcon,
    borderClass: 'border-l border-stone-200/90 dark:border-stone-700/80',
    textClass: 'text-stone-600 dark:text-stone-400',
    badgeClass:
      'border-stone-300/80 bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
  },
  note: {
    label: 'Chú giải',
    Icon: Info,
    borderClass: 'border-l-2 border-stone-400 dark:border-stone-500',
    textClass: 'text-stone-600 dark:text-stone-400',
    badgeClass:
      'border-stone-300/80 bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
  },
};

interface SidenoteContextType {
  readonly getIndex: (id: string) => number;
}

const SidenoteContext = createContext<SidenoteContextType | null>(null);

/**
 * Provider quản lý số thứ tự chú dẫn tự động (1, 2, 3...) cho toàn bài đọc.
 */
export function SidenoteProvider({ children }: { readonly children: ReactNode }) {
  const idsRef = useRef<string[]>([]);
  const getIndex = useCallback((id: string) => {
    let idx = idsRef.current.indexOf(id);
    if (idx === -1) {
      idsRef.current.push(id);
      idx = idsRef.current.length - 1;
    }
    return idx + 1;
  }, []);

  return <SidenoteContext.Provider value={{ getIndex }}>{children}</SidenoteContext.Provider>;
}

/**
 * Hook truy xuất context đánh số chú dẫn tự động.
 */
export function useSidenoteContext() {
  return useContext(SidenoteContext);
}

/**
 * Component Chú giải lề học thuật (Academic Marginalia / Sidenote)
 * chuẩn Edward Tufte / Distill:
 * - Desktop (lg:): Định vị chú giải lề thẳng hàng với vị trí gọi thẻ và tự động xếp ngăn (Collision Stagger) qua `float: right; clear: right`.
 * - Mobile / Tablet (< lg): Badge số mũ nhỏ gọn [1], [2], nhấn mở Collapsible Callout nổi mờ ngay bên dưới dòng văn bản.
 */
export const Sidenote: FC<SidenoteProps> = ({
  id,
  anchor,
  type = 'note',
  number,
  title,
  caption,
  children,
  className,
}) => {
  const autoId = useId();
  const context = useContext(SidenoteContext);
  const autoIndex = context ? context.getIndex(autoId) : 1;
  const displayNumber = number !== undefined ? number : autoIndex;

  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [anchorOffsetY, setAnchorOffsetY] = useState<number | null>(null);
  const wrapperRef = useRef<HTMLSpanElement>(null);

  // Tự động tính toán tọa độ Y tương đối để nằm ngang hàng với đoạn văn bản/định lý được neo (`anchor`)
  useEffect(() => {
    if (!anchor || typeof document === 'undefined') {
      return;
    }

    const updatePosition = () => {
      const targetEl =
        document.getElementById(anchor) ?? document.querySelector(`[data-anchor="${anchor}"]`);
      const parentCol = wrapperRef.current?.closest('[data-sidenotes-column]');

      if (targetEl && parentCol) {
        const targetRect = targetEl.getBoundingClientRect();
        const colRect = parentCol.getBoundingClientRect();
        setAnchorOffsetY(Math.max(0, Math.round(targetRect.top - colRect.top)));
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [anchor]);

  const style = SIDENOTE_STYLES[type] ?? SIDENOTE_STYLES.note;
  const TypeIcon = style.Icon;
  const label = title ?? style.label;

  return (
    <span
      ref={wrapperRef}
      id={id}
      data-sidenote-anchor={anchor}
      className={cn('academic-sidenote-wrapper group/sidenote relative inline', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ===================================================================
          1. GIAO DIỆN DI ĐỘNG & MÁY TÍNH BẢNG (< lg):
          Nút bấm badge tròn số mũ siêu nhỏ [1], [2] + Collapsible Callout
          =================================================================== */}
      <span className="academic-sidenote-mobile inline lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label={`Mở chú giải ${displayNumber ? `số ${displayNumber}` : ''}: ${label}`}
          className={cn(
            'mx-0.5 inline-flex cursor-pointer items-center justify-center rounded-full border px-1.5 py-0.5 align-super font-mono text-[10px] leading-none font-bold transition-all duration-150',
            style.badgeClass,
            isOpen &&
              'border-stone-900 bg-stone-900 text-white shadow-2xs dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900',
          )}
        >
          [{displayNumber}]
        </button>

        {/* Panel nổi mờ (Collapsible Callout) ngay bên dưới dòng văn bản hiện tại */}
        {isOpen && (
          <span
            role="region"
            aria-label={`Nội dung chú giải ${displayNumber ? `số ${displayNumber}` : ''}`}
            className={cn(
              'my-3 block w-full rounded-xl border border-[#CFDADB] bg-[#F7FAFA]/95 p-3.5 text-left shadow-sm backdrop-blur-md transition-all dark:border-stone-700/80 dark:bg-stone-900/95',
              style.borderClass,
            )}
          >
            <span className="mb-1.5 flex items-center justify-between gap-2 border-b border-stone-200/50 pb-1.5 dark:border-stone-800/60">
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-stone-600 uppercase dark:text-stone-300">
                <TypeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>{label}</span>
                {displayNumber && <span className="opacity-70">[{displayNumber}]</span>}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer rounded p-0.5 text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                aria-label="Đóng chú giải"
              >
                ✕
              </button>
            </span>
            <span className={cn('block font-serif text-[13px] leading-relaxed', style.textClass)}>
              {children}
            </span>
            {caption && (
              <span className="mt-2 block border-t border-stone-200/50 pt-1.5 font-serif text-[12px] text-stone-500 italic dark:border-stone-700/50 dark:text-stone-400">
                {caption}
              </span>
            )}
          </span>
        )}
      </span>

      {/* ===================================================================
          2. GIAO DIỆN MÀN HÌNH LỚN (lg:):
          Số mũ tham chiếu học thuật thanh nhã tại dòng gọi thẻ
          =================================================================== */}
      <sup
        className={cn(
          'hidden items-center justify-center rounded-full border px-1 py-0.5 align-super font-mono text-[10px] leading-none font-bold transition-colors duration-150 select-none lg:inline-flex',
          isHovered
            ? 'border-stone-900 bg-stone-900 text-white shadow-2xs dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900'
            : 'border-stone-300/80 bg-stone-100 text-stone-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300',
        )}
        title={`Chú giải [${displayNumber}]: ${label}`}
      >
        [{displayNumber}]
      </sup>

      {/* ===================================================================
          3. KHỐI CHÚ GIẢI LỀ HỌC THUẬT DESKTOP (lg:):
          Định vị lề thẳng hàng với vị trí gọi thẻ & Tự động chống đè (Collision Stagger)
          =================================================================== */}
      <span
        role="note"
        aria-label={`Chú giải ${displayNumber ? `số ${displayNumber}` : ''}: ${label}`}
        style={anchorOffsetY !== null ? { marginTop: `${anchorOffsetY}px` } : undefined}
        className={cn(
          'sidenote-academic float-right clear-right my-1 mb-4 ml-5 hidden w-[230px] rounded-r-xl border-y border-r border-[#CFDADB] bg-[#F7FAFA]/90 p-3 font-serif text-xs leading-relaxed text-stone-600 shadow-2xs backdrop-blur-xs transition-all duration-200 md:text-sm lg:block xl:w-[250px] dark:border-stone-800/60 dark:bg-stone-900/60 dark:text-stone-400',
          style.borderClass,
          isHovered &&
            'bg-[#F7FAFA] shadow-xs ring-1 ring-stone-400/60 dark:bg-stone-900/90 dark:ring-stone-500/60',
        )}
      >
        <span className="mb-1.5 flex items-center justify-between gap-1.5 border-b border-stone-200/50 pb-1 font-mono text-[11px] font-semibold tracking-wider text-stone-500 uppercase dark:border-stone-800/60 dark:text-stone-400">
          <span className="flex items-center gap-1.5">
            <TypeIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </span>
          {displayNumber && (
            <span className="py-0.2 rounded bg-stone-200/60 px-1 font-mono text-[10px] text-stone-600 dark:bg-stone-800 dark:text-stone-300">
              [{displayNumber}]
            </span>
          )}
        </span>
        <span className={cn('block font-serif text-[13px] leading-relaxed', style.textClass)}>
          {children}
        </span>
        {caption && (
          <span className="mt-2 block border-t border-stone-200/50 pt-1.5 font-serif text-[12px] text-stone-500 italic dark:border-stone-700/50 dark:text-stone-400">
            {caption}
          </span>
        )}
      </span>
    </span>
  );
};

export default Sidenote;
