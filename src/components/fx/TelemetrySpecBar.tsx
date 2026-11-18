import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface TelemetrySpecItem {
  readonly label: string;
  readonly value: string;
}

export interface TelemetrySpecBarProps {
  /** Nhãn mã vùng kiến trúc, ví dụ 'SEC. 01 // ACADEMIC SANCTUARY' */
  readonly sectionCode: string;
  /** Chuỗi mô tả phụ bên cạnh mã vùng */
  readonly subtitle?: string;
  /** Các cặp thông số dạng bảng Almanac */
  readonly items?: readonly TelemetrySpecItem[];
  /** Hiển thị tọa độ con trỏ & tỷ lệ cuộn thời gian thực bằng DOM ref (0 re-render) */
  readonly showLiveCoordinates?: boolean;
  readonly accentHex?: string;
  readonly className?: string;
  readonly 'data-testid'?: string;
}

const RULER_MINOR_PATH = Array.from({ length: 27 }, (_, idx) =>
  idx % 5 === 0 ? '' : `M${idx * 10} 5V8.5`,
)
  .filter(Boolean)
  .join('');

const RULER_MAJOR_PATH = Array.from({ length: 6 }, (_, idx) => `M${idx * 50} 2V8.5`).join('');

/**
 * Thanh thông số kỹ thuật đầu phân khu (Hallmark Almanac + Blueprint):
 * Mã phân khu monospace, thước chia milimét SVG, số liệu tabular và tọa độ thời gian thực.
 */
export function TelemetrySpecBar({
  sectionCode,
  subtitle,
  items = [],
  showLiveCoordinates = true,
  accentHex = '#8C7248',
  className,
  'data-testid': dataTestId = 'telemetry-spec-bar',
}: TelemetrySpecBarProps) {
  const coordRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!showLiveCoordinates || reducedMotion) return;

    let rafId: number | null = null;
    let lastX = 21.0285;
    let lastY = 105.8542;
    let dirty = false;

    const flush = () => {
      rafId = null;
      if (!coordRef.current) return;
      const scrollRatio =
        typeof document !== 'undefined' &&
        document.documentElement.scrollHeight > window.innerHeight
          ? Math.round(
              (window.scrollY /
                Math.max(1, document.documentElement.scrollHeight - window.innerHeight)) *
                100,
            )
          : 0;
      coordRef.current.textContent = `φ ${lastX.toFixed(2)}°N · λ ${lastY.toFixed(2)}°E · ${String(scrollRatio).padStart(2, '0')}%`;
      dirty = false;
    };

    const schedule = () => {
      if (!dirty) {
        dirty = true;
        rafId = window.requestAnimationFrame(flush);
      }
    };

    const handlePointer = (e: PointerEvent) => {
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      lastX = 21.0 + (e.clientY / vh) * 0.24;
      lastY = 105.8 + (e.clientX / vw) * 0.24;
      schedule();
    };

    const handleScroll = () => {
      schedule();
    };

    window.addEventListener('pointermove', handlePointer, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showLiveCoordinates, reducedMotion]);

  return (
    <div
      data-testid={dataTestId}
      className={cn(
        'lu-tabular-telemetry flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b border-[#CFD8D4] bg-[#F2F5F4]/85 px-4 py-2 text-[10px] tracking-[0.14em] text-[#35524B] uppercase sm:px-6',
        className,
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 rotate-45 border"
          style={{ borderColor: accentHex, backgroundColor: `${accentHex}26` }}
        />
        <span className="font-semibold text-[#162623]">{sectionCode}</span>
        {subtitle && <span className="hidden text-[#536D66] sm:inline">· {subtitle}</span>}
      </div>

      {/* Thước chia milimét SVG ở khoảng trống giữa */}
      <div
        className="hidden min-w-[96px] flex-1 items-center justify-center px-4 md:flex"
        aria-hidden="true"
      >
        <svg className="h-2.5 w-full max-w-[260px]" viewBox="0 0 260 10" preserveAspectRatio="none">
          <line x1="0" y1="8.5" x2="260" y2="8.5" stroke="#CFD8D4" strokeWidth="1" />
          <path d={RULER_MINOR_PATH} stroke="#9AA9A3" strokeWidth="0.8" fill="none" />
          <path d={RULER_MAJOR_PATH} stroke={accentHex} strokeWidth="1.1" fill="none" />
        </svg>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {items.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className="text-[#5F7770]">{item.label}</span>
            <span className="font-semibold text-[#162623]">{item.value}</span>
          </span>
        ))}
        {showLiveCoordinates && (
          <span
            ref={coordRef}
            className="hidden border-l border-[#CFD8D4] pl-3 text-[10px] font-medium text-[#536D66] lg:inline"
          >
            φ 21.03°N · λ 105.85°E · 00%
          </span>
        )}
      </div>
    </div>
  );
}
