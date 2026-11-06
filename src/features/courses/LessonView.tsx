import type { FC, ReactNode } from 'react';
import { SidenoteProvider } from '@/shared/components/Sidenote';
import { cn } from '@/shared/lib/cn';
import { ReadingSpine, type ReadingSpineStage } from './ReadingSpine';

export interface LessonViewProps {
  /** Tiêu đề chính của bài học (tùy chọn khi nhúng trong LessonPage). */
  readonly title?: ReactNode;
  /** Đoạn văn mở đầu (Lead paragraph) được tự động áp dụng Drop Cap (`academic-dropcap`). */
  readonly lead?: string;
  /** Nội dung chính của bài học (cột 8/12, giới hạn `max-w-[70ch]`). */
  readonly children: ReactNode;
  /** Nội dung cột chú giải lề / mục lục bổ trợ bên phải (cột 4/12). */
  readonly marginalia?: ReactNode;
  /** Cấu hình các chặng nhận thức trên Trục Tọa Độ Đọc (`ReadingSpine`). */
  readonly spineStages?: readonly ReadingSpineStage[];
  /** Hiển thị Trục Tọa Độ Đọc bên lề trái (`xl:flex`). Mặc định `true`. */
  readonly showReadingSpine?: boolean;
  readonly className?: string;
}

/**
 * Bố Cục Lưới Lệch Tỷ Lệ Vàng & Sidenotes (Asymmetric Scholar Grid — Tufte / Distill Standard):
 * - Trên màn hình lớn (`lg:grid lg:grid-cols-12 lg:gap-12 relative max-w-7xl mx-auto px-6`):
 *   + Cột chính bài học (Main Content): `lg:col-span-8 max-w-[70ch]`
 *   + Cột chú giải lề (Sidenotes Column): `lg:col-span-4 relative pl-4 border-l border-stone-200/50 dark:border-stone-800/50`
 * - Tích hợp sẵn `SidenoteProvider`, `ReadingSpine` và chữ khởi đầu `academic-dropcap`.
 */
export const LessonView: FC<LessonViewProps> = ({
  title,
  lead,
  children,
  marginalia,
  spineStages,
  showReadingSpine = true,
  className,
}) => {
  const firstChar = lead ? lead.trim().charAt(0) : '';
  const restLead = lead ? lead.trim().slice(1) : '';

  return (
    <SidenoteProvider>
      {showReadingSpine && <ReadingSpine stages={spineStages} />}

      <div
        data-testid="asymmetric-scholar-grid"
        className={cn(
          'relative mx-auto max-w-7xl px-6 lg:grid lg:grid-cols-12 lg:gap-12',
          className,
        )}
      >
        {/* Cột chính bài học (Main Content): 8/12 cột, độ rộng dòng tối ưu 70 ký tự */}
        <div data-testid="scholar-main-column" className="max-w-[70ch] min-w-0 lg:col-span-8">
          {title && (
            <h1 className="mb-6 font-serif text-3xl font-bold tracking-tight text-stone-900 lg:text-4xl dark:text-stone-100">
              {title}
            </h1>
          )}

          {lead && (
            <p
              data-testid="scholar-lead-paragraph"
              className="academic-dropcap mb-6 font-serif text-[18.5px] leading-[1.85] text-stone-800 dark:text-stone-200"
            >
              <span
                aria-hidden="true"
                className="float-left pt-1 pr-3 font-serif text-5xl leading-none font-normal text-stone-900 md:text-6xl dark:text-stone-100"
              >
                {firstChar}
              </span>
              {restLead}
            </p>
          )}

          {children}
        </div>

        {/* Cột chú giải lề (Sidenotes Column): 4/12 cột với đường kẻ hairline phân tách */}
        <aside
          data-sidenotes-column
          data-testid="scholar-sidenotes-column"
          aria-label="Cột chú giải lề học thuật"
          className="relative border-stone-200/50 pl-4 lg:col-span-4 lg:border-l dark:border-stone-800/50"
        >
          {marginalia}
        </aside>
      </div>
    </SidenoteProvider>
  );
};

export const ReadingLayout = LessonView;
export default LessonView;
