import type { FC, ReactNode } from 'react';
import { SidenoteProvider } from '@/shared/components/Sidenote';
import { cn } from '@/shared/lib/cn';

export interface LessonViewProps {
  /** Tiêu đề chính của bài học (tùy chọn khi nhúng trong LessonPage). */
  readonly title?: ReactNode;
  /** Đoạn văn mở đầu (Lead paragraph) được tự động áp dụng Drop Cap (`academic-dropcap`). */
  readonly lead?: string;
  /** Thanh thông tin kiến thức tiên quyết (tùy chọn). */
  readonly prerequisites?: ReactNode;
  /** Nội dung chính của bài học. */
  readonly children: ReactNode;
  /** Nội dung cột mục lục / chú giải lề bên phải. */
  readonly marginalia?: ReactNode;
  /** Nội dung thanh điều hướng chương bài bên trái (nếu mở). */
  readonly sidebar?: ReactNode;
  readonly className?: string;
}

/**
 * Chuẩn hóa bố cục trang bài đọc (LessonView — Hệ màu "Mist Blue & Sage"):
 * - Toàn bộ không gian đọc nằm trên nền #EAF0F1 (`text-[#29383D]`).
 * - Sidebar chương bài bên trái (nếu mở): `sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2 custom-scrollbar scrollbar-thin bg-[#E1E9EA] border-r border-[#CFDADB] text-[#29383D]`.
 * - Khung bài học chính: `bg-[#F7FAFA] border border-[#CFDADB] rounded-3xl p-8 md:p-12 shadow-sm text-[#29383D]`.
 * - Cột mục lục / chú giải bên phải: `sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pl-2 custom-scrollbar scrollbar-thin bg-[#E1E9EA]/80 backdrop-blur border border-[#CFDADB] rounded-2xl text-[#29383D]`.
 */
export const LessonView: FC<LessonViewProps> = ({
  title,
  lead,
  prerequisites,
  children,
  marginalia,
  sidebar,
  className,
}) => {
  const firstChar = lead ? lead.trim().charAt(0) : '';
  const restLead = lead ? lead.trim().slice(1) : '';

  return (
    <SidenoteProvider>
      <div
        data-testid="asymmetric-scholar-grid"
        className={cn(
          'relative mx-auto max-w-7xl bg-[#EAF0F1] px-6 text-[#29383D] lg:grid lg:grid-cols-12 lg:gap-12',
          className,
        )}
      >
        {sidebar && (
          <aside
            aria-label="Danh mục chương bài"
            className="custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] scrollbar-thin self-start overflow-y-auto rounded-2xl border-r border-[#CFDADB] bg-[#E1E9EA] p-4 pr-2 text-[#29383D] lg:col-span-3"
          >
            {sidebar}
          </aside>
        )}

        {/* Khung bài học chính: Nền sáng sạch bg-[#F7FAFA] border border-[#CFDADB] rounded-3xl p-8 md:p-12 shadow-sm */}
        <div
          data-testid="scholar-main-column"
          className={cn(
            'max-w-[70ch] min-w-0 rounded-3xl border border-[#CFDADB] bg-[#F7FAFA] p-8 text-[#29383D] shadow-sm md:p-12',
            sidebar ? 'lg:col-span-6' : 'lg:col-span-8',
          )}
        >
          {title && (
            <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight text-[#29383D] lg:text-4xl">
              {title}
            </h1>
          )}

          {lead && (
            <p
              data-testid="scholar-lead-paragraph"
              className="academic-dropcap mb-6 font-serif text-[18.5px] leading-[1.85] text-[#29383D]"
            >
              <span
                aria-hidden="true"
                className="float-left pt-1 pr-3 font-serif text-5xl leading-none font-normal text-[#29383D] md:text-6xl"
              >
                {firstChar}
              </span>
              {restLead}
            </p>
          )}

          {prerequisites && <div className="clear-both mb-6">{prerequisites}</div>}

          {children}
        </div>

        {/* Cột mục lục & chú giải bên phải: Thẻ nền mờ bg-[#E1E9EA]/80 backdrop-blur border border-[#CFDADB] rounded-2xl */}
        <aside
          data-sidenotes-column
          data-testid="scholar-sidenotes-column"
          aria-label="Cột chú giải lề học thuật"
          className={cn(
            'custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] scrollbar-thin self-start overflow-y-auto rounded-2xl border border-[#CFDADB] bg-[#E1E9EA]/80 p-4 pl-2 text-[#29383D] backdrop-blur',
            sidebar ? 'lg:col-span-3' : 'lg:col-span-4',
          )}
        >
          {marginalia}
        </aside>
      </div>
    </SidenoteProvider>
  );
};

export const ReadingLayout = LessonView;
export default LessonView;
