import { type FC, type RefObject, useId } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface BrandLogoProps {
  /** 'full' hiển thị huy hiệu + chữ LEARNING UNIVERSE (Header); 'emblem-only' chỉ hiện huy hiệu (Footer) */
  readonly variant?: 'full' | 'emblem-only';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly isDark?: boolean;
  readonly isSepia?: boolean;
  /** Tham chiếu SVG ngoài (tùy chọn cho hiệu ứng xoay theo scroll ở Header) */
  readonly svgRef?: RefObject<SVGSVGElement | null>;
  readonly className?: string;
  readonly 'aria-label'?: string;
}

const SIZE_CLASSES = {
  sm: 'h-7 w-7',
  md: 'h-9 w-9',
  lg: 'h-16 w-16 md:h-20 md:w-20',
  xl: 'h-20 w-20',
} as const;

const OUTER_TICKS = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] as const;

/**
 * HUY HIỆU THƯƠNG HIỆU: "SAO KHUÊ & THIÊN CẦU ĐÔNG SƠN"
 *
 * - Lớp nền: Hình tròn bo góc Chàm Ngọc Hoàng Gia (#102532 -> #1B3B4B) viền kép Vàng Đồng (#D4A853).
 * - Trung tâm: Cửa sổ tròn Khuê Văn Các kết hợp 2 vòng quỹ đạo elip nghiêng 45 độ,
 *   Ngôi Sao Khuê 8 cánh đối xứng gradient Vàng Hoàng Kim (#FFF3D1 -> #E5B85B -> #C8963E)
 *   cùng viên ngọc Đỏ Chu Sa (#C83E37) tại tâm điểm.
 * - Vi tương tác: Vòng quỹ đạo ngoài xoay chậm liên tục, ngôi sao Khuê rực sáng khi rê chuột.
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
  const prefersReducedMotion = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const bgGradId = `lu-brand-bg-${uid}`;
  const goldGradId = `lu-brand-gold-${uid}`;
  const rubyGradId = `lu-brand-ruby-${uid}`;

  return (
    <div
      data-testid="brand-logo"
      className={cn('group inline-flex items-center gap-2.5 select-none', className)}
      aria-label={ariaLabel}
    >
      <div className="relative flex shrink-0 items-center justify-center">
        {/* Quầng sáng vàng hoàng kim khi hover hoặc ở kích thước lớn */}
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -inset-1.5 rounded-full transition-opacity duration-300',
            size === 'lg' || size === 'xl'
              ? 'opacity-70 blur-md group-hover:opacity-100'
              : 'opacity-0 blur-sm group-hover:opacity-75',
          )}
          style={{
            background:
              'radial-gradient(circle, rgba(229, 184, 91, 0.38) 0%, rgba(212, 168, 83, 0.1) 60%, transparent 78%)',
          }}
        />

        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className={cn(
            SIZE_CLASSES[size],
            'relative shrink-0 transition-transform duration-300 ease-out group-hover:scale-105',
          )}
        >
          <defs>
            {/* 1. NỀN HUY HIỆU CHÀM NGỌC HOÀNG GIA (#102532 -> #1B3B4B) */}
            <linearGradient id={bgGradId} x1="12%" y1="8%" x2="88%" y2="92%">
              <stop offset="0%" stopColor="#1B3B4B" />
              <stop offset="100%" stopColor="#102532" />
            </linearGradient>

            {/* 2. VÀNG HOÀNG KIM NGÔI SAO KHUÊ (#FFF3D1 -> #E5B85B -> #C8963E) */}
            <linearGradient id={goldGradId} x1="15%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stopColor="#FFF3D1" />
              <stop offset="52%" stopColor="#E5B85B" />
              <stop offset="100%" stopColor="#C8963E" />
            </linearGradient>

            {/* 3. NGỌC ĐỎ CHU SA TÂM ĐIỂM (#E76F51 -> #C83E37) */}
            <radialGradient id={rubyGradId} cx="38%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#F58D7A" />
              <stop offset="55%" stopColor="#C83E37" />
              <stop offset="100%" stopColor="#8A1E19" />
            </radialGradient>
          </defs>

          {/* Đĩa nền Chàm Ngọc Hoàng Gia */}
          <circle cx="50" cy="50" r="46" fill={`url(#${bgGradId})`} />

          {/* Viền kép Vàng Đồng (#D4A853) */}
          <circle cx="50" cy="50" r="46" stroke="#D4A853" strokeWidth="2.1" />
          <circle
            cx="50"
            cy="50"
            r="41.5"
            stroke="#D4A853"
            strokeOpacity="0.45"
            strokeWidth="0.85"
          />

          {/* Vòng quỹ đạo ngoài xoay chậm liên tục */}
          <g
            className={
              prefersReducedMotion
                ? 'origin-[50px_50px]'
                : 'origin-[50px_50px] motion-safe:animate-[spin_36s_linear_infinite]'
            }
          >
            <circle
              cx="50"
              cy="50"
              r="37"
              stroke={`url(#${goldGradId})`}
              strokeOpacity="0.65"
              strokeWidth="0.9"
              strokeDasharray="4 4"
            />
            {OUTER_TICKS.map((deg) => (
              <line
                key={deg}
                x1="50"
                y1="10.5"
                x2="50"
                y2="14.5"
                stroke="#E5B85B"
                strokeWidth="1"
                strokeOpacity="0.72"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
          </g>

          {/* Cửa sổ tròn Khuê Văn Các trung tâm */}
          <circle cx="50" cy="50" r="26" stroke="#D4A853" strokeOpacity="0.82" strokeWidth="1.25" />

          {/* Hai vòng quỹ đạo Thiên cầu elip nghiêng ±45 độ */}
          <ellipse
            cx="50"
            cy="50"
            rx="31"
            ry="13.5"
            transform="rotate(45 50 50)"
            stroke={`url(#${goldGradId})`}
            strokeOpacity="0.75"
            strokeWidth="1.15"
          />
          <ellipse
            cx="50"
            cy="50"
            rx="31"
            ry="13.5"
            transform="rotate(-45 50 50)"
            stroke={`url(#${goldGradId})`}
            strokeOpacity="0.75"
            strokeWidth="1.15"
          />

          {/* Ngôi Sao Khuê 8 cánh đối xứng sắc nét */}
          <g className="transition-all duration-300 group-hover:brightness-115">
            {/* 4 tia chéo phụ */}
            <path
              d="M50 28 L53.4 46.6 L72 50 L53.4 53.4 L50 72 L46.6 53.4 L28 50 L46.6 46.6 Z"
              transform="rotate(45 50 50)"
              fill={`url(#${goldGradId})`}
              fillOpacity="0.72"
              stroke="#FFF3D1"
              strokeOpacity="0.55"
              strokeWidth="0.6"
              strokeLinejoin="round"
            />
            {/* 4 tia chính bắc-nam-đông-tây */}
            <path
              d="M50 20 L55.2 44.8 L80 50 L55.2 55.2 L50 80 L44.8 55.2 L20 50 L44.8 44.8 Z"
              fill={`url(#${goldGradId})`}
              stroke="#FFF3D1"
              strokeWidth="0.8"
              strokeLinejoin="round"
            />
          </g>

          {/* Viên ngọc Đỏ Chu Sa tại tâm điểm */}
          <circle
            cx="50"
            cy="50"
            r="4.8"
            fill={`url(#${rubyGradId})`}
            stroke="#FFF3D1"
            strokeWidth="0.95"
          />
          <circle cx="48.5" cy="48.4" r="1.2" fill="#FFFDF7" fillOpacity="0.85" />
        </svg>
      </div>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'text-[15px] font-extrabold tracking-[0.16em] uppercase transition-colors',
              isDark
                ? 'text-[#FAF5E8]'
                : isSepia
                  ? 'text-[#231F18]'
                  : 'text-[#142834] dark:text-[#FAF5E8]',
            )}
          >
            LEARNING
          </span>
          <span
            className={cn(
              'mt-1 text-[11px] font-bold tracking-[0.26em] uppercase transition-colors',
              isDark ? 'text-[#E5B85B]' : 'text-[#A37424] dark:text-[#E5B85B]',
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
