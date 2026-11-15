import type { FC, RefObject } from 'react';
import { cn } from '@/shared/lib/cn';

export interface BrandLogoProps {
  /** 'full' hiển thị ấn chương + chữ LEARNING UNIVERSE (Header); 'emblem-only' chỉ hiện ấn chương (Footer) */
  readonly variant?: 'full' | 'emblem-only';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly isDark?: boolean;
  readonly isSepia?: boolean;
  /** Tham chiếu SVG ngoài (tùy chọn) */
  readonly svgRef?: RefObject<SVGSVGElement | null>;
  readonly className?: string;
  readonly 'aria-label'?: string;
}

const SIZE_CLASSES = {
  sm: 'h-7 w-7',
  md: 'h-[34px] w-[34px]',
  lg: 'h-16 w-16 md:h-[72px] md:w-[72px]',
  xl: 'h-20 w-20',
} as const;

/**
 * MONOLINE GEOMETRIC MARK — ẤN CHƯƠNG KHUÊ VĂN TỐI GIẢN
 *
 * - Khung vuông bo góc mềm (rx="8") nền Đá Phiến Trầm (#1E332E), viền nhẫn mảnh Đồng Trầm (#9E845A).
 * - Tâm điểm: Vòng tròn đồng tâm lồng Ngôi Sao Khuê 4 cánh mảnh đối xứng nét đơn Ngà Sáng (#EDF2F0).
 */
export const BrandLogo: FC<BrandLogoProps> = ({
  variant = 'emblem-only',
  size = 'md',
  isDark = false,
  isSepia = false,
  svgRef,
  className,
  'aria-label': ariaLabel,
}) => {
  return (
    <div
      data-testid="brand-logo"
      className={cn('group inline-flex items-center gap-2.5 select-none', className)}
      aria-label={ariaLabel}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className={cn(
          SIZE_CLASSES[size],
          'shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.03]',
        )}
      >
        {/* Khung vuông bo góc mềm rx="8" màu Đá Phiến Trầm (#1E332E) viền mảnh Đồng Trầm (#9E845A) */}
        <rect
          x="1.5"
          y="1.5"
          width="33"
          height="33"
          rx="8"
          fill="#1E332E"
          stroke="#9E845A"
          strokeWidth="1.2"
        />

        {/* Viền nhẫn đồng tâm mảnh Đồng Trầm (#9E845A) */}
        <circle cx="18" cy="18" r="11.2" stroke="#9E845A" strokeWidth="0.9" strokeOpacity="0.85" />

        {/* Vòng tròn Cửa sổ Khuê Văn nét đơn Ngà Sáng (#EDF2F0) */}
        <circle cx="18" cy="18" r="8.8" stroke="#EDF2F0" strokeWidth="1.45" />

        {/* Ngôi Sao Khuê 4 cánh mảnh đối xứng nét đơn Ngà Sáng (#EDF2F0) */}
        <path
          d="M18 9.4 L20 16 L26.6 18 L20 20 L18 26.6 L16 20 L9.4 18 L16 16 Z"
          stroke="#EDF2F0"
          strokeWidth="1.45"
          strokeLinejoin="round"
        />

        {/* Tâm điểm nhỏ Đồng Trầm (#9E845A) */}
        <circle cx="18" cy="18" r="1.4" fill="#9E845A" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'text-[14px] font-extrabold tracking-[0.16em] uppercase transition-colors',
              isDark
                ? 'text-[#EBF0EE]'
                : isSepia
                  ? 'text-[#182624]'
                  : 'text-[#182624] dark:text-[#EBF0EE]',
            )}
          >
            LEARNING
          </span>
          <span
            className={cn(
              'mt-1 text-[10.5px] font-bold tracking-[0.26em] uppercase transition-colors',
              isDark
                ? 'text-[#9EC5B8]'
                : isSepia
                  ? 'text-[#4A5D58]'
                  : 'text-[#1E332E] dark:text-[#9EC5B8]',
            )}
          >
            UNIVERSE
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
