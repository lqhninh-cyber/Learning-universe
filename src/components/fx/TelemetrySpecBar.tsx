import { useEffect, useRef } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface TelemetrySpecItem {
  readonly label: string;
  readonly value: string;
}

export interface TelemetrySpecBarProps {
  /** Mã bản vẽ kỹ thuật đầu khung, ví dụ 'DOC. LU-2026 // ACADEMIC SANCTUARY' */
  readonly sectionCode: string;
  /** Chuỗi mô tả phụ bên cạnh mã vùng */
  readonly subtitle?: string;
  /** Các cặp thông số dạng bảng Almanac */
  readonly items?: readonly TelemetrySpecItem[];
  /** Hiển thị tọa độ con trỏ chuột (X, Y) thời gian thực qua DOM ref (0 re-render) */
  readonly showLiveCoordinates?: boolean;
  readonly accentHex?: string;
  readonly className?: string;
  readonly 'data-testid'?: string;
}

const RULER_MINOR_PATH = Array.from({ length: 29 }, (_, idx) =>
  idx % 5 === 0 ? '' : `M${idx * 10} 7.5V12`,
)
  .filter(Boolean)
  .join('');

const RULER_MED_PATH = Array.from({ length: 6 }, (_, idx) =>
  idx % 2 === 1 ? `M${idx * 50} 4.5V12` : '',
)
  .filter(Boolean)
  .join('');

const RULER_MAJOR_PATH = Array.from({ length: 4 }, (_, idx) => `M${idx * 100} 2V12`).join('');

/**
 * Thanh Telemetry Đầu Khung (Blueprint Spec Header Bar — Hallmark Blueprint + Almanac):
 * Phân tách thành các ô quy chuẩn bằng vạch dọc 1px solid #CFD8D4, có thước milimét SVG,
 * tọa độ chuột (X, Y) cập nhật trực tiếp qua DOM ref và chỉ số Almanac tabular.
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
    let clientX = 0;
    let clientY = 0;
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
      const xStr = String(Math.round(clientX)).padStart(4, '0');
      const yStr = String(Math.round(clientY)).padStart(4, '0');
      coordRef.current.textContent = `(${xStr}, ${yStr}) PX · ${String(scrollRatio).padStart(2, '0')}%`;
      dirty = false;
    };

    const schedule = () => {
      if (!dirty) {
        dirty = true;
        rafId = window.requestAnimationFrame(flush);
      }
    };

    const handlePointer = (e: PointerEvent) => {
      clientX = Math.max(0, e.clientX);
      clientY = Math.max(0, e.clientY);
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
        'lu-tabular-telemetry grid grid-cols-1 divide-y divide-[#CFD8D4] border-b border-[#CFD8D4] bg-[#EEF2EF]/92 text-[10px] tracking-[0.13em] text-[#35524B] uppercase lg:divide-x lg:divide-y-0',
        showLiveCoordinates ? 'lg:grid-cols-[auto_1fr_auto_auto]' : 'lg:grid-cols-[auto_1fr_auto]',
        className,
      )}
    >
      {/* Ô 1: Mã bản vẽ & danh xưng phân khu */}
      <div className="flex items-center gap-2.5 px-4 py-2 sm:px-5">
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 shrink-0 rotate-45 border"
          style={{ borderColor: accentHex, backgroundColor: `${accentHex}28` }}
        />
        <span className="font-semibold text-[#162623]">{sectionCode}</span>
        {subtitle && <span className="hidden text-[#536D66] xl:inline">· {subtitle}</span>}
      </div>

      {/* Ô 2: Thước chia vạch milimét SVG trải ngang */}
      <div className="hidden items-center gap-2.5 px-4 py-1.5 md:flex" aria-hidden="true">
        <span className="text-[8.5px] font-semibold text-[#8C7248]">MM</span>
        <svg className="h-3.5 w-full min-w-[140px]" viewBox="0 0 300 14" preserveAspectRatio="none">
          <line x1="0" y1="12" x2="300" y2="12" stroke="#CFD8D4" strokeWidth="1" />
          <path d={RULER_MINOR_PATH} stroke="#9AA9A3" strokeWidth="0.75" fill="none" />
          <path d={RULER_MED_PATH} stroke="#637871" strokeWidth="0.9" fill="none" />
          <path d={RULER_MAJOR_PATH} stroke={accentHex} strokeWidth="1.2" fill="none" />
        </svg>
        <span className="text-[8.5px] font-semibold text-[#637871]">30</span>
      </div>

      {/* Ô 3: Tọa độ con trỏ chuột (X, Y) thời gian thực */}
      {showLiveCoordinates && (
        <div className="hidden items-center gap-2 px-4 py-2 lg:flex">
          <span className="text-[9px] font-semibold text-[#8C7248]">XY</span>
          <span
            ref={coordRef}
            data-testid="telemetry-pointer-coords"
            className="font-semibold text-[#314B44]"
          >
            (0000, 0000) PX · 00%
          </span>
        </div>
      )}

      {/* Ô 4: Bảng chỉ số Almanac hệ thống */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 sm:px-5">
        {items.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className="text-[#5F7770]">{item.label}</span>
            <span className="font-semibold text-[#162623]">{item.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
