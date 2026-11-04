import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Compass,
  Home,
  Layers,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import type { FC } from 'react';
import { Link } from 'react-router';
import { cn } from '@/shared/lib/cn';
import {
  type PreviewCourseSlug,
  type PreviewView,
  type VisualDirection,
  VISUAL_DIRECTIONS,
} from './types';

export interface PreviewControlBarProps {
  readonly direction: VisualDirection;
  readonly onDirectionChange: (direction: VisualDirection) => void;
  readonly view: PreviewView;
  readonly onViewChange: (view: PreviewView) => void;
  readonly courseSlug: PreviewCourseSlug;
  readonly onCourseSlugChange: (courseSlug: PreviewCourseSlug) => void;
  readonly isCollapsed: boolean;
  readonly onToggleCollapse: () => void;
  readonly motionEnabled: boolean;
  readonly onToggleMotion: () => void;
}

export const PreviewControlBar: FC<PreviewControlBarProps> = ({
  direction,
  onDirectionChange,
  view,
  onViewChange,
  courseSlug,
  onCourseSlugChange,
  isCollapsed,
  onToggleCollapse,
  motionEnabled,
  onToggleMotion,
}) => {
  const currentMeta = VISUAL_DIRECTIONS[direction];

  if (isCollapsed) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-300/90 bg-stone-900/95 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-stone-800 active:scale-95"
          title="Mở thanh điều khiển thử nghiệm UI/UX"
          aria-label="Mở thanh điều khiển thử nghiệm UI/UX"
        >
          <Sliders className="h-4 w-4 text-amber-400" aria-hidden="true" />
          <span>Thử nghiệm UI: {currentMeta.name}</span>
          <ChevronUp className="h-3.5 w-3.5 text-stone-400" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <aside
      aria-label="Thanh điều khiển thử nghiệm thiết kế UI/UX"
      className="fixed bottom-4 left-1/2 z-50 w-[95%] max-w-[1180px] -translate-x-1/2 transition-all duration-300"
    >
      <div className="rounded-2xl border border-stone-800/80 bg-stone-950/92 p-3 text-stone-100 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl sm:p-3.5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Nhóm 1: Chọn Hướng thiết kế (3 Visual Directions) */}
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
            <span className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">
              Hướng thiết kế:
            </span>
            <div
              className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-stone-800 bg-stone-900/90 p-1"
              role="radiogroup"
              aria-label="Chọn hướng thiết kế thị giác"
            >
              {/* Direction 1: Architectural Atelier */}
              <button
                type="button"
                role="radio"
                aria-checked={direction === 'atelier'}
                onClick={() => onDirectionChange('atelier')}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                  direction === 'atelier'
                    ? 'border border-amber-400/40 bg-amber-500/20 font-bold text-amber-300 shadow-xs'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200',
                )}
                title="Direction 1: Architectural Atelier - Lưới Bento & Kiến trúc học thuật"
              >
                <Compass className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                <span>1. Atelier Bento</span>
              </button>

              {/* Direction 2: Spatial Glass */}
              <button
                type="button"
                role="radio"
                aria-checked={direction === 'spatial'}
                onClick={() => onDirectionChange('spatial')}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                  direction === 'spatial'
                    ? 'border border-sky-400/40 bg-sky-500/20 font-bold text-sky-300 shadow-xs'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200',
                )}
                title="Direction 2: Spatial Glass & 2.5D Depth - Đa lớp kính mờ & Thẻ nổi 2.5D"
              >
                <Sparkles className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                <span>2. Spatial Glass</span>
              </button>

              {/* Direction 3: Kinetic Editorial */}
              <button
                type="button"
                role="radio"
                aria-checked={direction === 'editorial'}
                onClick={() => onDirectionChange('editorial')}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                  direction === 'editorial'
                    ? 'border border-rose-400/40 bg-rose-500/20 font-bold text-rose-300 shadow-xs'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200',
                )}
                title="Direction 3: Kinetic Editorial Folio - Bố cục tạp chí & Typography phân cấp mạnh"
              >
                <BookOpen className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
                <span>3. Editorial Folio</span>
              </button>
            </div>
          </div>

          {/* Nhóm 2: Chọn Chế độ màn hình (Homepage vs Course Dashboard) */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold tracking-wider text-stone-400 uppercase">
              Màn hình:
            </span>
            <div
              className="inline-flex items-center gap-1 rounded-xl border border-stone-800 bg-stone-900/90 p-1"
              role="radiogroup"
              aria-label="Chọn màn hình mẫu"
            >
              <button
                type="button"
                role="radio"
                aria-checked={view === 'homepage'}
                onClick={() => onViewChange('homepage')}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                  view === 'homepage'
                    ? 'border border-white/30 bg-white/20 font-bold text-white'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200',
                )}
              >
                <Home className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Trang chủ</span>
              </button>

              <button
                type="button"
                role="radio"
                aria-checked={view === 'course'}
                onClick={() => onViewChange('course')}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all',
                  view === 'course'
                    ? 'border border-white/30 bg-white/20 font-bold text-white'
                    : 'text-stone-400 hover:bg-stone-800 hover:text-stone-200',
                )}
              >
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Trang môn học</span>
              </button>
            </div>

            {/* Sub-toggle môn học khi đang ở Course Dashboard */}
            {view === 'course' && (
              <div
                className="inline-flex items-center gap-1 rounded-xl border border-stone-800 bg-stone-900/90 p-1"
                role="radiogroup"
                aria-label="Chọn môn học hiển thị"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={courseSlug === 'giai-tich-ham-mot-bien'}
                  onClick={() => onCourseSlugChange('giai-tich-ham-mot-bien')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-all',
                    courseSlug === 'giai-tich-ham-mot-bien'
                      ? 'border border-amber-500/40 bg-amber-600/30 font-bold text-amber-200'
                      : 'text-stone-400 hover:text-stone-200',
                  )}
                >
                  <span>Toán: Giải tích 1</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={courseSlug === 'giao-duc-hoc'}
                  onClick={() => onCourseSlugChange('giao-duc-hoc')}
                  className={cn(
                    'inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-all',
                    courseSlug === 'giao-duc-hoc'
                      ? 'border border-teal-500/40 bg-teal-600/30 font-bold text-teal-200'
                      : 'text-stone-400 hover:text-stone-200',
                  )}
                >
                  <span>Sư phạm: Giáo dục học</span>
                </button>
              </div>
            )}
          </div>

          {/* Nhóm 3: Tiện ích Motion, Thu gọn và Quay lại */}
          <div className="flex items-center justify-between gap-1.5 border-t border-stone-800 pt-2 lg:border-t-0 lg:pt-0">
            {/* Toggle Motion */}
            <button
              type="button"
              onClick={onToggleMotion}
              className={cn(
                'inline-flex cursor-pointer items-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-all',
                motionEnabled
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
                  : 'border-stone-800 bg-stone-900 text-stone-500 line-through',
              )}
              title={
                motionEnabled ? 'Đang bật hiệu ứng chuyển động' : 'Đã tắt hiệu ứng chuyển động'
              }
              aria-label="Bật tắt chuyển động"
            >
              <Zap className="h-3 w-3" aria-hidden="true" />
              <span className="hidden sm:inline">Chuyển động</span>
            </button>

            {/* Thu gọn thanh control */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-stone-800 bg-stone-900 px-2 py-1.5 text-[11px] text-stone-400 transition-all hover:bg-stone-800 hover:text-white"
              title="Thu gọn thanh điều khiển"
              aria-label="Thu gọn thanh điều khiển"
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Ẩn</span>
            </button>

            {/* Nút thoát về Trang chủ chính thức */}
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-lg border border-stone-800 bg-stone-900/90 px-2.5 py-1.5 text-[11px] font-medium text-stone-300 transition-all hover:bg-stone-800 hover:text-white"
              title="Quay lại trang chủ chính thức (/)"
            >
              <ArrowLeft className="h-3 w-3" aria-hidden="true" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};
