import { Maximize2, Minimize2 } from 'lucide-react';
import type { FC } from 'react';
import { cn } from '@/shared/lib/cn';

export type ReadingFontSize = 'sm' | 'base' | 'lg';

export interface ReadingControlsToolbarProps {
  readonly fontSize: ReadingFontSize;
  readonly onFontSizeChange: (size: ReadingFontSize) => void;
  readonly isFocusMode: boolean;
  readonly onToggleFocusMode: () => void;
  readonly className?: string;
}

const FONT_SIZES: readonly {
  readonly id: ReadingFontSize;
  readonly label: string;
  readonly title: string;
}[] = [
  { id: 'sm', label: 'A-', title: 'Cỡ chữ nhỏ (15px)' },
  { id: 'base', label: 'A', title: 'Cỡ chữ chuẩn (16.5px)' },
  { id: 'lg', label: 'A+', title: 'Cỡ chữ lớn (18.5px)' },
];

/**
 * Thanh công cụ đọc nhanh (Reading Controls Toolbar)
 * - Tăng giảm cỡ chữ nội dung (A- / A / A+)
 * - Chế độ đọc tập trung (Focus Mode): Tạm ẩn 2 thanh điều hướng bên hông
 */
export const ReadingControlsToolbar: FC<ReadingControlsToolbarProps> = ({
  fontSize,
  onFontSizeChange,
  isFocusMode,
  onToggleFocusMode,
  className,
}) => {
  return (
    <div
      role="toolbar"
      aria-label="Tùy chỉnh chế độ đọc bài"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl border border-stone-200/90 bg-white/95 p-1 shadow-2xs backdrop-blur-xs',
        className,
      )}
    >
      {/* Bộ chọn thang cỡ chữ (A- / A / A+) */}
      <div
        className="flex items-center rounded-lg border border-stone-200/60 bg-stone-100/70 p-0.5"
        role="group"
        aria-label="Cỡ chữ bài đọc"
      >
        {FONT_SIZES.map((item) => {
          const isActive = fontSize === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onFontSizeChange(item.id)}
              aria-pressed={isActive}
              title={item.title}
              aria-label={item.title}
              className={cn(
                'cursor-pointer rounded-md px-2 py-0.5 font-serif text-xs transition-all',
                isActive
                  ? 'border border-amber-900/20 bg-white font-bold text-amber-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-stone-200" aria-hidden="true" />

      {/* Nút bật/tắt chế độ đọc tập trung */}
      <button
        type="button"
        onClick={onToggleFocusMode}
        aria-pressed={isFocusMode}
        title={
          isFocusMode
            ? 'Thoát chế độ tập trung (Phím Esc hoặc F)'
            : 'Chế độ tập trung (Phím F - Mở rộng tối đa & Tạm ẩn 2 thanh bên)'
        }
        aria-label={isFocusMode ? 'Thoát chế độ tập trung' : 'Bật chế độ tập trung'}
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all',
          isFocusMode
            ? 'border border-amber-800/30 bg-amber-100/80 font-semibold text-amber-950 shadow-2xs'
            : 'border border-transparent text-stone-700 hover:border-stone-200 hover:bg-stone-100/80 hover:text-stone-900',
        )}
      >
        {isFocusMode ? (
          <>
            <Minimize2 className="h-3.5 w-3.5 shrink-0 text-amber-800" aria-hidden="true" />
            <span>Thoát tập trung</span>
            <kbd className="py-0.2 ml-0.5 rounded border border-amber-300 bg-amber-200/60 px-1 font-mono text-[9px] font-bold text-amber-900">
              Esc
            </kbd>
          </>
        ) : (
          <>
            <Maximize2 className="h-3.5 w-3.5 shrink-0 text-stone-500" aria-hidden="true" />
            <span className="hidden sm:inline">Chế độ tập trung</span>
            <span className="sm:hidden">Tập trung</span>
            <kbd className="py-0.2 hidden rounded border border-stone-200 bg-stone-100 px-1 font-mono text-[9px] text-stone-500 sm:inline">
              F
            </kbd>
          </>
        )}
      </button>
    </div>
  );
};

export default ReadingControlsToolbar;
