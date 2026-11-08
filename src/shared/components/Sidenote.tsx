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
    borderClass: 'border-l-2 border-[#718C7E]',
    textClass: 'text-[#29383D]',
    badgeClass: 'border-[#CFDADB] bg-[#EAF0F1] text-[#29383D]',
  },
  caution: {
    label: 'Lưu ý',
    Icon: AlertTriangle,
    borderClass: 'border-l-2 border-[#9E3D24]',
    textClass: 'text-[#29383D]',
    badgeClass: 'border-[#9E3D24]/40 bg-[#9E3D24]/10 text-[#9E3D24]',
  },
  pedagogy: {
    label: 'Sư phạm',
    Icon: GraduationCap,
    borderClass: 'border-l-2 border-[#718C7E]',
    textClass: 'text-[#29383D]',
    badgeClass: 'border-[#718C7E]/40 bg-[#E8EFEB] text-[#3F6570]',
  },
  figure: {
    label: 'Minh họa',
    Icon: ImageIcon,
    borderClass: 'border-l-2 border-[#CFDADB]',
    textClass: 'text-[#29383D]',
    badgeClass: 'border-[#CFDADB] bg-[#EAF0F1] text-[#29383D]',
  },
  note: {
    label: 'Chú giải',
    Icon: Info,
    borderClass: 'border-l-2 border-[#718C7E]',
    textClass: 'text-[#29383D]',
    badgeClass: 'border-[#CFDADB] bg-[#EAF0F1] text-[#29383D]',
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
            data-sidenote
            role="region"
            aria-label={`Nội dung chú giải ${displayNumber ? `số ${displayNumber}` : ''}`}
            className={cn(
              'clear-both my-3 mb-4 block w-full rounded-xl border border-[#CFDADB] bg-[#E8EFEB]/60 p-4 text-left text-xs leading-relaxed text-[#29383D] shadow-2xs transition-all md:text-sm',
              style.borderClass,
            )}
          >
            <span className="mb-1 flex items-center justify-between gap-2 font-mono text-[11px] font-semibold tracking-wider text-[#55676B] uppercase">
              <span className="flex items-center gap-1.5">
                <TypeIcon
                  className="h-3.5 w-3.5 shrink-0 text-current"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                {displayNumber && <span>[{displayNumber}]</span>}
                <span>{label}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="cursor-pointer rounded p-0.5 text-xs text-[#55676B] hover:text-[#29383D]"
                aria-label="Đóng chú giải"
              >
                ✕
              </button>
            </span>
            <span className={cn('block text-xs leading-relaxed md:text-sm', style.textClass)}>
              {children}
            </span>
            {caption && (
              <span className="mt-2 block border-t border-[#CFDADB] pt-1.5 font-serif text-[12px] text-[#55676B] italic">
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
            ? 'border-[#3F6570] bg-[#3F6570] text-white shadow-2xs'
            : 'border-[#CFDADB] bg-[#EAF0F1] text-[#3F6570]',
        )}
        title={`Chú giải [${displayNumber}]: ${label}`}
      >
        [{displayNumber}]
      </sup>

      {/* ===================================================================
          3. KHỐI CHÚ GIẢI HỌC THUẬT DESKTOP (lg: — Định dạng Inline Callout Full-Width):
          Tuyệt đối không float hay co kéo độ rộng của bảng biểu và khối nội dung chính
          =================================================================== */}
      <span
        data-sidenote
        role="note"
        aria-label={`Chú giải ${displayNumber ? `số ${displayNumber}` : ''}: ${label}`}
        style={anchorOffsetY !== null ? { marginTop: `${anchorOffsetY}px` } : undefined}
        className={cn(
          'sidenote-academic clear-both mt-3 mb-4 hidden w-full rounded-xl border border-[#CFDADB]/70 bg-[#E8EFEB]/60 p-4 text-xs leading-relaxed text-[#29383D] transition-all duration-200 md:text-sm lg:block',
          style.borderClass,
          isHovered && 'bg-[#E8EFEB]/90 shadow-xs ring-1 ring-[#718C7E]/50',
        )}
      >
        <span className="mb-1 flex items-center justify-between gap-1.5 font-mono text-[11px] font-semibold tracking-wider text-[#55676B] uppercase">
          <span className="flex items-center gap-1.5">
            <TypeIcon
              className="h-3.5 w-3.5 shrink-0 text-current"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            {displayNumber && <span>[{displayNumber}]</span>}
            <span>{label}</span>
          </span>
          {displayNumber && (
            <span className="rounded bg-[#EAF0F1] px-1.5 py-0.5 font-mono text-[10px] text-[#3F6570]">
              [{displayNumber}]
            </span>
          )}
        </span>
        <span className={cn('block text-xs leading-relaxed md:text-sm', style.textClass)}>
          {children}
        </span>
        {caption && (
          <span className="mt-2 block border-t border-[#CFDADB] pt-1.5 font-serif text-[12px] text-[#55676B] italic">
            {caption}
          </span>
        )}
      </span>
    </span>
  );
};

export default Sidenote;
