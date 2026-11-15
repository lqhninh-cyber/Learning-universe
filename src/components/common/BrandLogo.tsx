import type { FC, RefObject } from 'react';
import { cn } from '@/shared/lib/cn';

export interface BrandLogoProps {
  /** 'full' hiển thị ấn chương + chữ LEARNING UNIVERSE (Header); 'emblem-only' chỉ hiện ấn chương (Footer) */
  readonly variant?: 'full' | 'emblem-only';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly isDark?: boolean;
  readonly isSepia?: boolean;
  /** Tham chiếu SVG ngoài (tùy chọn cho hiệu ứng xoay nhẹ theo scroll ở Header) */
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
 * ẤN CHƯƠNG KHUÊ VĂN HÌNH HỌC (MINIMALIST GEOMETRIC SEAL)
 *
 * - Khung ngoài: Hình vuông bo góc mềm (rx="8") nền Xanh Đá Phiến Trầm (#1D332E), viền mảnh Vàng Đồng Dịu (#B89762).
 * - Tâm điểm: Vòng tròn Cửa sổ Khuê Văn lồng hình thoi mảnh và Ngôi Sao Khuê 4 cánh đối xứng
 *   bằng nét đơn (#EAE0C8, strokeWidth 1.6) cùng điểm tâm nhỏ màu Vàng Đồng Dịu (#B89762).
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
        {/* Khung ngoài hình vuông bo góc mềm rx="8" nền #1D332E viền mảnh #B89762 */}
        <rect
          x="1.5"
          y="1.5"
          width="33"
          height="33"
          rx="8"
          fill="#1D332E"
          stroke="#B89762"
          strokeWidth="1.2"
        />

        {/* Vòng tròn Cửa sổ Khuê Văn chuẩn mực */}
        <circle cx="18" cy="18" r="10.2" stroke="#EAE0C8" strokeWidth="1.6" />

        {/* Hình thoi mảnh lồng bên trong vòng tròn */}
        <polygon
          points="18,7.8 28.2,18 18,28.2 7.8,18"
          stroke="#EAE0C8"
          strokeWidth="0.95"
          strokeOpacity="0.65"
          strokeLinejoin="round"
        />

        {/* Ngôi Sao Khuê 4 cánh đối xứng thanh mảnh bằng nét đơn */}
        <path
          d="M18 10.2 L20.1 15.9 L25.8 18 L20.1 20.1 L18 25.8 L15.9 20.1 L10.2 18 L15.9 15.9 Z"
          stroke="#EAE0C8"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />

        {/* Điểm tâm tròn nhỏ Vàng Đồng Dịu (#B89762) */}
        <circle cx="18" cy="18" r="1.9" fill="#B89762" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'text-[14px] font-extrabold tracking-[0.16em] uppercase transition-colors',
              isDark
                ? 'text-[#EAE0C8]'
                : isSepia
                  ? 'text-[#1D332E]'
                  : 'text-[#1D332E] dark:text-[#EAE0C8]',
            )}
          >
            LEARNING
          </span>
          <span
            className={cn(
              'mt-1 text-[10.5px] font-bold tracking-[0.26em] uppercase transition-colors',
              isDark
                ? 'text-[#D4B47A]'
                : isSepia
                  ? 'text-[#1D332E]'
                  : 'text-[#1D332E] dark:text-[#D4B47A]',
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
