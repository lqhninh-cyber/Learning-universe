import type { FC, ReactNode } from 'react';
import { SidenoteProvider } from '@/shared/components/Sidenote';
import { cn } from '@/shared/lib/cn';

export interface LessonViewProps {
  /** Tiêu đề chính của bài học (tùy chọn khi nhúng trong LessonPage). */
  readonly title?: ReactNode;
  /** Đoạn văn mở đầu (Lead paragraph) được tự động áp dụng Drop Cap (`academic-dropcap`). */
  readonly lead?: string;
  /** Nội dung chính của bài học. */
  readonly children: ReactNode;
  /** Nội dung cột mục lục / chú giải lề bên phải. */
  readonly marginalia?: ReactNode;
  /** Nội dung thanh điều hướng chương bài bên trái (nếu mở). */
  readonly sidebar?: ReactNode;
  readonly className?: string;
}

/**
 * Chuẩn hóa bố cục trang bài đọc (LessonView — Hệ màu Giấy Dó `#FAF7F2`):
 * - Toàn bộ không gian đọc nằm trên nền giấy Dó `#FAF7F2` (`text-stone-900`).
 * - Sidebar chương bài bên trái (nếu mở): `bg-[#F5F1EB] border-r border-stone-200/70 text-stone-800`.
 * - Khung bài học chính: `bg-white border border-stone-200/80 rounded-3xl p-8 md:p-12 shadow-sm`.
 * - Cột mục lục / chú giải bên phải: `bg-white/80 backdrop-blur border border-stone-200/70 rounded-2xl`.
 */
export const LessonView: FC<LessonViewProps> = ({
  title,
  lead,
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
          'relative mx-auto max-w-7xl bg-[#FAF7F2] px-6 text-stone-900 lg:grid lg:grid-cols-12 lg:gap-12',
          className,
        )}
      >
        {sidebar && (
          <aside
            aria-label="Danh mục chương bài"
            className="border-r border-stone-200/70 bg-[#F5F1EB] p-4 text-stone-800 lg:col-span-3"
          >
            {sidebar}
          </aside>
        )}

        {/* Khung bài học chính: Nền trắng sạch bg-white border border-stone-200/80 rounded-3xl p-8 md:p-12 shadow-sm */}
        <div
          data-testid="scholar-main-column"
          className={cn(
            'max-w-[70ch] min-w-0 rounded-3xl border border-stone-200/80 bg-white p-8 text-stone-900 shadow-sm md:p-12',
            sidebar ? 'lg:col-span-6' : 'lg:col-span-8',
          )}
        >
          {title && (
            <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight text-stone-900 lg:text-4xl">
              {title}
            </h1>
          )}

          {lead && (
            <p
              data-testid="scholar-lead-paragraph"
              className="academic-dropcap mb-6 font-serif text-[18.5px] leading-[1.85] text-stone-800"
            >
              <span
                aria-hidden="true"
                className="float-left pt-1 pr-3 font-serif text-5xl leading-none font-normal text-stone-900 md:text-6xl"
              >
                {firstChar}
              </span>
              {restLead}
            </p>
          )}

          {children}
        </div>

        {/* Cột mục lục & chú giải bên phải: Thẻ nền trắng ngà mờ bg-white/80 backdrop-blur border border-stone-200/70 rounded-2xl */}
        <aside
          data-sidenotes-column
          data-testid="scholar-sidenotes-column"
          aria-label="Cột chú giải lề học thuật"
          className={cn(
            'relative h-fit rounded-2xl border border-stone-200/70 bg-white/80 p-4 pl-4 text-stone-800 backdrop-blur',
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
