import { type FC, type ReactNode, useEffect, useState } from 'react';
import { useReadingSettings } from '@/context/ReadingSettingsContext';
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
  /** Chế độ đọc chuyên sâu ('light' | 'dark'). Mặc định đọc từ localStorage hoặc light. */
  readonly readingTheme?: 'light' | 'dark';
  /** Callback chuyển đổi chế độ đọc (tùy chọn). */
  readonly onToggleReadingTheme?: () => void;
  readonly className?: string;
}

/**
 * Chuẩn hóa bố cục trang bài đọc (LessonView — Hệ màu "Mist Blue & Sage" và Chế độ "Đêm Học Giả"):
 * - Toàn bộ không gian đọc nằm trên nền #EAF0F1 (`text-[#29383D]`), chuyển sang #14171A (`text-[#E2E8F0]`) khi ở chế độ Đêm Học Giả.
 * - Sidebar chương bài bên trái (nếu mở): nền #E1E9EA viền #CFDADB (khi tối: nền #1A1E22 viền #2D3339).
 * - Khung bài học chính: nền #F7FAFA viền #CFDADB (khi tối: nền #1C2024 viền #2D3339 text-[#E2E8F0]).
 * - Cột mục lục / chú giải bên phải: nền #E1E9EA/80 viền #CFDADB (khi tối: nền #1A1E22 viền #2D3339 text-[#94A3B8]).
 */
export const LessonView: FC<LessonViewProps> = ({
  title,
  lead,
  prerequisites,
  children,
  marginalia,
  sidebar,
  readingTheme: propTheme,
  className,
}) => {
  const [internalTheme, setInternalTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light') return saved;
      } catch {
        // Bỏ qua lỗi storage
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (propTheme) {
      return;
    }
    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<'light' | 'dark'>;
      if (custom.detail === 'light' || custom.detail === 'dark') {
        setInternalTheme(custom.detail);
      } else {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light') {
          setInternalTheme(saved);
        }
      }
    };
    window.addEventListener('lu_reading_theme_change', handleThemeChange);
    return () => window.removeEventListener('lu_reading_theme_change', handleThemeChange);
  }, [propTheme]);

  const settings = useReadingSettings();
  const activeTheme = propTheme ?? settings.theme ?? internalTheme;
  const isDark = activeTheme === 'dark';
  const isZen = settings.isZenMode;

  const firstChar = lead ? lead.trim().charAt(0) : '';
  const restLead = lead ? lead.trim().slice(1) : '';

  return (
    <SidenoteProvider>
      <div
        data-testid="asymmetric-scholar-grid"
        data-reading-theme={activeTheme}
        className={cn(
          'relative mx-auto max-w-7xl px-6 transition-colors duration-300 lg:grid lg:grid-cols-12 lg:gap-12',
          isDark ? 'bg-[#121517] text-[#E2E8F0]' : 'bg-[#EAF0F1] text-[#29383D]',
          className,
        )}
      >
        {sidebar && (
          <aside
            aria-label="Danh mục chương bài"
            className={cn(
              'custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] scrollbar-thin self-start overflow-y-auto rounded-2xl p-4 pr-2 transition-all duration-300 lg:col-span-3',
              isZen && 'pointer-events-none -translate-x-8 opacity-0 lg:hidden',
              isDark
                ? 'border-r border-[#2A323A] bg-[#181C20] text-[#E2E8F0]'
                : 'border-r border-[#CFDADB] bg-[#E1E9EA] text-[#29383D]',
            )}
          >
            {sidebar}
          </aside>
        )}

        {/* Khung bài học chính: Sáng: bg-[#F7FAFA] border-[#CFDADB] | Tối: bg-[#181C20] border-[#2A323A] */}
        <div
          data-testid="scholar-main-column"
          className={cn(
            'min-w-0 rounded-3xl p-8 shadow-sm transition-all duration-300 md:p-12',
            isZen
              ? 'mx-auto max-w-[720px] lg:col-span-12'
              : 'max-w-[70ch] ' + (sidebar ? 'lg:col-span-6' : 'lg:col-span-8'),
            isDark
              ? 'border border-[#2A323A] bg-[#181C20] text-[#E2E8F0]'
              : 'border border-[#CFDADB] bg-[#F7FAFA] text-[#29383D]',
            settings.typographyClasses,
          )}
        >
          {title && (
            <h1
              className={cn(
                'mb-6 font-serif text-3xl font-bold tracking-tight lg:text-4xl',
                isDark ? 'text-[#F8FAFC]' : 'text-[#29383D]',
              )}
            >
              {title}
            </h1>
          )}

          {lead && (
            <p
              data-testid="scholar-lead-paragraph"
              className={cn(
                'academic-dropcap mb-6 font-serif text-[18.5px] leading-[1.85]',
                isDark ? 'text-[#E2E8F0]' : 'text-[#29383D]',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'float-left pt-1 pr-3 font-serif text-5xl leading-none font-normal md:text-6xl',
                  isDark ? 'text-[#F8FAFC]' : 'text-[#29383D]',
                )}
              >
                {firstChar}
              </span>
              {restLead}
            </p>
          )}

          {prerequisites && <div className="clear-both mb-6">{prerequisites}</div>}

          {children}
        </div>

        {/* Cột mục lục & chú giải bên phải: Sáng: bg-[#E1E9EA]/80 border-[#CFDADB] | Tối: bg-[#181C20] border-[#2A323A] */}
        <aside
          data-sidenotes-column
          data-testid="scholar-sidenotes-column"
          aria-label="Cột chú giải lề học thuật"
          className={cn(
            'custom-scrollbar sticky top-24 max-h-[calc(100vh-7rem)] scrollbar-thin self-start overflow-y-auto rounded-2xl p-4 pl-2 backdrop-blur transition-all duration-300',
            isZen && 'pointer-events-none translate-x-8 opacity-0 lg:hidden',
            isDark
              ? 'border border-[#2A323A] bg-[#181C20] text-[#94A3B8]'
              : 'border border-[#CFDADB] bg-[#E1E9EA]/80 text-[#29383D]',
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
