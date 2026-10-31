import 'mafs/core.css';
import { Coordinates, Mafs } from 'mafs';
import { Grid3X3, RotateCcw } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import type { Point2D } from './affine-math';

export interface AffinePlaneProps {
  /** Tiêu đề ngắn của hình tương tác. */
  readonly title?: string;
  /** Hướng dẫn thao tác kéo-thả cho người học (hỗ trợ cả chuột và cảm ứng). */
  readonly instruction?: string;
  /** Khung nhìn tọa độ `[min, max]` theo trục hoành và trục tung. */
  readonly viewBox?: {
    readonly x?: Point2D;
    readonly y?: Point2D;
    readonly padding?: number;
  };
  /** Chiều cao khung vẽ tính bằng pixel (mặc định 340). */
  readonly height?: number;
  /** Hiển thị lưới tọa độ nền mặc định hay không (mặc định `true`). */
  readonly defaultShowGrid?: boolean;
  /** Cho phép kéo trượt toàn mặt phẳng (mặc định `false` để ưu tiên cuộn trang trên điện thoại). */
  readonly pan?: boolean;
  /** Cho phép phóng to/thu nhỏ mặt phẳng (mặc định `false` để không kẹt cử chỉ chạm trên mobile). */
  readonly zoom?: boolean;
  /** Hàm khôi phục trạng thái ban đầu của các điểm tương tác khi bấm nút "Đặt lại". */
  readonly onReset?: () => void;
  /** Nội dung thanh đọc thông số / điều khiển phía dưới mặt phẳng. */
  readonly footer?: ReactNode;
  readonly children: ReactNode;
}

export function AffinePlane({
  title,
  instruction = 'Chạm hoặc kéo các điểm màu để quan sát sự thay đổi hình học theo thời gian thực.',
  viewBox = { x: [-5, 5], y: [-3.5, 3.5], padding: 0.5 },
  height = 340,
  defaultShowGrid = true,
  pan = false,
  zoom = false,
  onReset,
  footer,
  children,
}: AffinePlaneProps) {
  const [showGrid, setShowGrid] = useState(defaultShowGrid);

  return (
    <div
      role="region"
      aria-label={title ?? 'Mặt phẳng hình học tương tác'}
      className="my-5 overflow-hidden rounded-2xl border border-stone-200/90 bg-white shadow-2xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 bg-stone-50/80 px-4 py-2.5">
        <div className="min-w-0">
          {title && <p className="text-sm font-semibold text-stone-900">{title}</p>}
          {instruction && <p className="text-xs text-stone-600">{instruction}</p>}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowGrid((prev) => !prev)}
            aria-pressed={showGrid}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100"
          >
            <Grid3X3 className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
            <span>{showGrid ? 'Ẩn lưới' : 'Hiện lưới'}</span>
          </button>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100"
            >
              <RotateCcw className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
              <span>Đặt lại hình</span>
            </button>
          )}
        </div>
      </div>

      <div
        className="relative w-full select-none [&_.MafsView]:bg-stone-50/35 [&_.MafsView]:font-sans [&_circle]:transition-transform [&_g[tabindex]]:touch-none"
        style={{
          ['--mafs-bg' as string]: '#fafaf9',
          ['--mafs-fg' as string]: '#1c1917',
          ['--mafs-line-color' as string]: '#e7e5e4',
          ['--mafs-origin-color' as string]: '#a8a29e',
        }}
      >
        <Mafs
          height={height}
          pan={pan}
          zoom={zoom}
          viewBox={{
            x: viewBox.x ?? [-5, 5],
            y: viewBox.y ?? [-3.5, 3.5],
            padding: viewBox.padding ?? 0.5,
          }}
        >
          {showGrid && <Coordinates.Cartesian subdivisions={2} />}
          {children}
        </Mafs>
      </div>

      {footer && (
        <div className="border-t border-stone-200/80 bg-stone-50/70 px-4 py-3 text-xs text-stone-700">
          {footer}
        </div>
      )}
    </div>
  );
}
