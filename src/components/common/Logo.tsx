import { type FC } from 'react';
import { cn } from '@/shared/lib/cn';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

export interface LogoProps {
  readonly variant?: 'primary' | 'symbol' | 'compact';
  readonly theme?: 'light' | 'dark';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly animated?: boolean;
  readonly className?: string;
  readonly 'aria-label'?: string;
}

const SIZE_CONFIG = {
  sm: {
    px: 28,
    gap: 'gap-2',
    learningText: 'text-xs md:text-sm',
    universeText: 'text-[10px] md:text-xs',
  },
  md: {
    px: 40,
    gap: 'gap-2.5',
    learningText: 'text-sm md:text-base',
    universeText: 'text-xs md:text-sm',
  },
  lg: {
    px: 64,
    gap: 'gap-3.5',
    learningText: 'text-lg md:text-xl',
    universeText: 'text-sm md:text-base',
  },
  xl: {
    px: 96,
    gap: 'gap-4',
    learningText: 'text-2xl md:text-3xl',
    universeText: 'text-base md:text-lg',
  },
} as const;

export const Logo: FC<LogoProps> = ({
  variant = 'primary',
  theme = 'dark',
  size = 'md',
  animated = false,
  className,
  'aria-label': ariaLabel,
}) => {
  const prefersReduced = useReducedMotion();
  const isAnimated = animated && !prefersReduced;
  const config = SIZE_CONFIG[size];

  const isDark = theme === 'dark';

  // Palette tokens
  const gold = isDark ? '#C5A262' : '#B88E3E';
  const goldLight = isDark ? '#E2C48D' : '#D4AC5C';
  const trunkCol = isDark ? '#163327' : '#081611';
  const boughCol = isDark ? '#1B4332' : '#143326';
  const pageIvory = '#F5F2EB';
  const pageShadow = isDark ? '#11291F' : '#D9D5CB';
  const leafHighlight = isDark ? '#F5F2EB' : '#2D5A46';
  const leafJade = isDark ? '#739B88' : '#3E6F58';
  const leafMoss = isDark ? '#3D6953' : '#1B4332';
  const wordmarkLearning = isDark ? '#F5F2EB' : '#143326';
  const wordmarkUniverse = isDark ? '#C5A262' : '#B88E3E';

  const isCompact = variant === 'compact';

  // Render SVG Symbol
  const renderSymbol = () => (
    <svg
      viewBox="0 0 160 160"
      width={config.px}
      height={config.px}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 overflow-visible select-none', isAnimated && 'lu-logo-animated')}
      aria-hidden="true"
      data-testid="tree-of-knowledge-logo"
    >
      <defs>
        {/* Hào quang vàng cho sao và quỹ đạo */}
        <filter id="lu-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor={gold} floodOpacity="0.45" />
        </filter>
        <linearGradient
          id="lu-trunk-grad"
          x1="80"
          y1="136"
          x2="80"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={trunkCol} />
          <stop offset="60%" stopColor={boughCol} />
          <stop offset="100%" stopColor={leafMoss} />
        </linearGradient>
        <linearGradient
          id="lu-page-l"
          x1="24"
          y1="138"
          x2="80"
          y2="138"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={pageShadow} />
          <stop offset="25%" stopColor={pageIvory} />
          <stop offset="100%" stopColor={pageIvory} />
        </linearGradient>
        <linearGradient
          id="lu-page-r"
          x1="136"
          y1="138"
          x2="80"
          y2="138"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={pageShadow} />
          <stop offset="25%" stopColor={pageIvory} />
          <stop offset="100%" stopColor={pageIvory} />
        </linearGradient>
        <linearGradient
          id="lu-gold-grad"
          x1="24"
          y1="60"
          x2="140"
          y2="119"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor={gold} />
          <stop offset="50%" stopColor={goldLight} />
          <stop offset="100%" stopColor={gold} />
        </linearGradient>
      </defs>

      {/* =================================================================== */}
      {/* 1. NỬA SAU QUỸ ĐẠO THIÊN HÀ (Back Celestial Orbit - chìm sau thân) */}
      {/* =================================================================== */}
      <g className={isAnimated ? 'lu-orbit-back' : undefined}>
        <path
          d="M 24 102 C 38 60, 86 42, 140 60"
          stroke={gold}
          strokeWidth={isCompact ? '2.2' : '1.5'}
          strokeDasharray={isCompact ? undefined : '3 2'}
          opacity="0.65"
          fill="none"
        />
        {/* Tinh cầu vàng nửa sau */}
        <circle cx="54" cy="49" r="1.8" fill={gold} filter="url(#lu-gold-glow)" />
        <circle cx="106" cy="46" r="2.2" fill={gold} filter="url(#lu-gold-glow)" />
      </g>

      {/* =================================================================== */}
      {/* 2. BỆ ĐỠ SÁCH MỞ ĐẠI THỤ (The Root Folio) */}
      {/* =================================================================== */}
      <g id="lu-root-folio" className={isAnimated ? 'lu-book-group' : undefined}>
        {/* Lớp giấy dày bên dưới / bóng chân sách */}
        <path
          d="M 80 144 C 68 141 46 142 22 149 C 46 153 68 150 80 152 C 92 150 114 153 138 149 C 114 142 92 141 80 144 Z"
          fill={pageShadow}
          opacity="0.9"
        />

        {/* Trang sách lật bên trái (Trắng Giấy Dó) */}
        <path
          d="M 80 134 C 68 131 46 132 24 140 C 46 144 68 141 80 143 Z"
          fill="url(#lu-page-l)"
          stroke={gold}
          strokeWidth="0.8"
        />
        {/* Nếp lật trang trái thứ hai */}
        <path
          d="M 80 138 C 68 135 48 136 26 144 C 48 147 68 145 80 147 Z"
          fill={pageIvory}
          stroke={gold}
          strokeWidth="0.5"
          opacity="0.85"
        />
        {/* Gân chỉ vàng trang sách trái */}
        <path
          d="M 76 136 C 64 134 48 135 34 140"
          stroke={gold}
          strokeWidth="0.8"
          opacity="0.8"
          fill="none"
        />
        <path
          d="M 76 139 C 64 137 50 138 38 143"
          stroke={gold}
          strokeWidth="0.5"
          opacity="0.6"
          fill="none"
        />

        {/* Trang sách lật bên phải (Trắng Giấy Dó) */}
        <path
          d="M 80 134 C 92 131 114 132 136 140 C 114 144 92 141 80 143 Z"
          fill="url(#lu-page-r)"
          stroke={gold}
          strokeWidth="0.8"
        />
        {/* Nếp lật trang phải thứ hai */}
        <path
          d="M 80 138 C 92 135 112 136 134 144 C 112 147 92 145 80 147 Z"
          fill={pageIvory}
          stroke={gold}
          strokeWidth="0.5"
          opacity="0.85"
        />
        {/* Gân chỉ vàng trang sách phải */}
        <path
          d="M 84 136 C 96 134 112 135 126 140"
          stroke={gold}
          strokeWidth="0.8"
          opacity="0.8"
          fill="none"
        />
        <path
          d="M 84 139 C 96 137 110 138 122 143"
          stroke={gold}
          strokeWidth="0.5"
          opacity="0.6"
          fill="none"
        />

        {/* Gáy sách vòm mạ Vàng Thếp Cổ (#C5A262) */}
        <path d="M 74 146 Q 80 139 86 146 Q 80 142 74 146 Z" fill={gold} />
        {/* Dải ruy băng đánh dấu trang rủ từ gáy sách */}
        <path d="M 80 142 Q 78 149 80 155 Q 82 149 80 142 Z" fill={gold} />

        {/* Rễ cây cắm vào gáy sách */}
        <path
          d="M 77 134 Q 68 136 58 138"
          stroke={trunkCol}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 83 134 Q 92 136 102 138"
          stroke={trunkCol}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* =================================================================== */}
      {/* 3. THÂN CÂY & MẠNG NHÁNH BÁN NGUYỆT (Trunk & Branches) */}
      {/* =================================================================== */}
      <g id="lu-trunk-branches" className={isAnimated ? 'lu-tree-group' : undefined}>
        {/* Thân cây chính vươn lên từ gáy sách */}
        <path
          d="M 76 134 C 77 122 76 108 78 98 C 74 92 68 88 56 82 C 66 88 74 90 78 96 C 77 82 74 68 64 54 C 70 60 76 72 79 84 C 79 72 78 56 80 44 C 82 56 81 72 81 84 C 84 72 90 60 96 54 C 86 68 83 82 82 96 C 86 90 94 88 104 82 C 92 88 86 92 82 98 C 84 108 83 122 84 134 Z"
          fill="url(#lu-trunk-grad)"
        />

        {/* Nhánh bực 1 (Lower Boughs - vươn rộng hai bên) */}
        <path d="M 77 114 C 64 117 48 118 34 108 C 48 113 64 111 77 106 Z" fill={trunkCol} />
        <path d="M 83 114 C 96 117 112 118 126 108 C 112 113 96 111 83 106 Z" fill={trunkCol} />

        {/* Nhánh bực 2 (Mid Boughs) */}
        <path d="M 77 104 C 62 98 48 90 38 74 C 48 84 62 88 77 92 Z" fill={boughCol} />
        <path d="M 83 104 C 98 98 112 90 122 74 C 112 84 98 88 83 92 Z" fill={boughCol} />
      </g>

      {/* =================================================================== */}
      {/* 4. TÁN LÁ BÁN NGUYỆT CHI TIẾT (Canopy Foliage) */}
      {/* =================================================================== */}
      <g id="lu-foliage" className={isAnimated ? 'lu-foliage-group' : undefined}>
        {/* --- CÁNH LÁ BÊN TRÁI (Left Symmetrical Foliage) --- */}
        {/* Tầng 1: Lá nền xanh rêu / men ngọc */}
        <path d="M 34 106 C 28 102 26 94 32 90 C 38 94 38 102 34 106 Z" fill={leafMoss} />
        <path d="M 40 88 C 34 84 32 76 38 72 C 44 76 44 84 40 88 Z" fill={leafJade} />
        <path d="M 48 70 C 42 66 42 58 48 54 C 54 58 54 66 48 70 Z" fill={leafMoss} />
        <path d="M 60 54 C 54 50 56 42 62 38 C 68 42 66 50 60 54 Z" fill={leafJade} />
        <path d="M 72 44 C 68 40 70 34 76 32 C 80 36 78 42 72 44 Z" fill={leafMoss} />

        {/* Tầng 2: Lá trung cảnh đón sáng Trắng Giấy Dó (#F5F2EB) */}
        <path d="M 38 102 C 34 98 34 90 40 86 C 46 90 44 98 38 102 Z" fill={leafHighlight} />
        <path d="M 46 84 C 42 80 42 72 48 68 C 54 72 52 80 46 84 Z" fill={leafHighlight} />
        <path d="M 56 66 C 52 62 52 54 58 50 C 64 54 62 62 56 66 Z" fill={leafHighlight} />
        <path d="M 68 50 C 64 46 66 38 72 36 C 76 40 74 48 68 50 Z" fill={leafHighlight} />

        {/* Tầng 3: Lá lót bổ trợ bên trong */}
        <path d="M 50 98 C 44 94 44 86 50 82 C 56 86 56 94 50 98 Z" fill={leafJade} />
        <path d="M 60 82 C 54 78 56 70 62 66 C 68 70 66 78 60 82 Z" fill={leafMoss} />
        <path d="M 70 66 C 66 62 68 54 74 52 C 78 56 76 64 70 66 Z" fill={leafHighlight} />

        {/* Lá ôm sát chân sách */}
        <path d="M 44 118 C 38 116 38 110 44 108 C 50 110 50 116 44 118 Z" fill={leafJade} />
        <path d="M 56 114 C 50 112 50 106 56 104 C 62 106 62 112 56 114 Z" fill={leafHighlight} />

        {/* --- CÁNH LÁ BÊN PHẢI (Right Symmetrical Foliage - Đối xứng) --- */}
        {/* Tầng 1: Lá nền */}
        <path d="M 126 106 C 132 102 134 94 128 90 C 122 94 122 102 126 106 Z" fill={leafMoss} />
        <path d="M 120 88 C 126 84 128 76 122 72 C 116 76 116 84 120 88 Z" fill={leafJade} />
        <path d="M 112 70 C 118 66 118 58 112 54 C 106 58 106 66 112 70 Z" fill={leafMoss} />
        <path d="M 100 54 C 106 50 104 42 98 38 C 92 42 94 50 100 54 Z" fill={leafJade} />
        <path d="M 88 44 C 92 40 90 34 84 32 C 80 36 82 42 88 44 Z" fill={leafMoss} />

        {/* Tầng 2: Lá đón sáng Trắng Giấy Dó */}
        <path d="M 122 102 C 126 98 126 90 120 86 C 114 90 116 98 122 102 Z" fill={leafHighlight} />
        <path d="M 114 84 C 118 80 118 72 112 68 C 106 72 108 80 114 84 Z" fill={leafHighlight} />
        <path d="M 104 66 C 108 62 108 54 102 50 C 96 54 98 62 104 66 Z" fill={leafHighlight} />
        <path d="M 92 50 C 96 46 94 38 88 36 C 84 40 86 48 92 50 Z" fill={leafHighlight} />

        {/* Tầng 3: Lá lót bổ trợ bên trong */}
        <path d="M 110 98 C 116 94 116 86 110 82 C 104 86 104 94 110 98 Z" fill={leafJade} />
        <path d="M 100 82 C 106 78 104 70 98 66 C 92 70 94 78 100 82 Z" fill={leafMoss} />
        <path d="M 90 66 C 94 62 92 54 86 52 C 82 56 84 64 90 66 Z" fill={leafHighlight} />

        {/* Lá ôm sát chân sách */}
        <path d="M 116 118 C 122 116 122 110 116 108 C 110 110 110 116 116 118 Z" fill={leafJade} />
        <path
          d="M 104 114 C 110 112 110 106 104 104 C 98 106 98 112 104 114 Z"
          fill={leafHighlight}
        />
      </g>

      {/* =================================================================== */}
      {/* 5. ĐÓA HOA SEN THỜI LÝ VƯƠNG MIỆN (Central Lotus Crown) */}
      {/* =================================================================== */}
      <g id="lu-central-crown" className={isAnimated ? 'lu-crown-group' : undefined}>
        {/* Đế đài sen đỉnh */}
        <circle cx="80" cy="36" r="2.2" fill={gold} />
        <path d="M 76 37 Q 80 34 84 37" stroke={gold} strokeWidth="0.8" fill="none" />

        {/* Cánh hoa xòe hai bên (Outer Winged Lotus Petals) */}
        <path
          d="M 80 37 C 70 37 63 32 65 26 C 70 28 75 33 80 37 Z"
          fill={leafHighlight}
          stroke={gold}
          strokeWidth="0.8"
        />
        <path
          d="M 80 37 C 90 37 97 32 95 26 C 90 28 85 33 80 37 Z"
          fill={leafHighlight}
          stroke={gold}
          strokeWidth="0.8"
        />

        {/* Cánh hoa ôm trong (Inner Petals) */}
        <path
          d="M 80 35 C 73 33 70 25 73 20 C 77 23 78.5 29 80 35 Z"
          fill={pageIvory}
          stroke={gold}
          strokeWidth="0.8"
        />
        <path
          d="M 80 35 C 87 33 90 25 87 20 C 83 23 81.5 29 80 35 Z"
          fill={pageIvory}
          stroke={gold}
          strokeWidth="0.8"
        />

        {/* Cánh hoa chính giữa hình ngọn lửa búp sen (Central Flame Petal) */}
        <path
          d="M 80 16 C 84 22 85 29 80 35 C 75 29 76 22 80 16 Z"
          fill={pageIvory}
          stroke={gold}
          strokeWidth="1.1"
        />
        {/* Sống gân vàng trang nghiêm ở tâm cánh chính */}
        <path d="M 80 18 L 80 33" stroke={gold} strokeWidth="0.8" strokeLinecap="round" />

        {/* Tinh cầu vàng ngọn lửa đỉnh hoa (Zenith Jewel) */}
        <circle cx="80" cy="13.5" r="1.8" fill={gold} filter="url(#lu-gold-glow)" />
      </g>

      {/* =================================================================== */}
      {/* 6. NỬA TRƯỚC QUỸ ĐẠO THIÊN HÀ (Front Celestial Orbit - vắt nổi 3D) */}
      {/* =================================================================== */}
      <g className={isAnimated ? 'lu-orbit-front' : undefined}>
        <path
          d="M 140 60 C 148 74, 136 108, 80 119 C 48 124, 25 115, 24 102"
          stroke="url(#lu-gold-grad)"
          strokeWidth={isCompact ? '2.4' : '1.8'}
          strokeLinecap="round"
          fill="none"
          filter="url(#lu-gold-glow)"
        />

        {/* Các hạt tinh cầu vàng tri thức nổi phía trước */}
        <circle cx="28" cy="106" r="2.2" fill={gold} filter="url(#lu-gold-glow)" />
        <circle cx="68" cy="120" r="1.8" fill={gold} filter="url(#lu-gold-glow)" />
        <circle cx="114" cy="113" r="2.2" fill={gold} filter="url(#lu-gold-glow)" />
        <circle cx="138" cy="64" r="2.8" fill={goldLight} filter="url(#lu-gold-glow)" />
      </g>
    </svg>
  );

  // Compact or Symbol only variant
  if (variant === 'symbol' || isCompact) {
    return (
      <div
        className={cn('inline-flex items-center justify-center', className)}
        aria-label={ariaLabel ?? 'Biểu trưng Cây Tri Thức Learning Universe'}
      >
        {renderSymbol()}
      </div>
    );
  }

  // Primary variant: Symbol + Wordmark
  return (
    <div
      className={cn('inline-flex items-center', config.gap, className)}
      aria-label={ariaLabel ?? 'Learning Universe'}
    >
      {renderSymbol()}
      <div className="flex flex-col leading-none">
        <span className="sr-only">LEARNING UNIVERSE</span>
        <span
          aria-hidden="true"
          style={{ color: wordmarkLearning }}
          className={cn(
            'font-serif font-medium tracking-[0.18em] uppercase transition-colors',
            config.learningText,
          )}
        >
          LEARNING
        </span>
        <span
          aria-hidden="true"
          style={{ color: wordmarkUniverse }}
          className={cn(
            'mt-0.5 font-sans font-semibold tracking-[0.14em] uppercase transition-colors',
            config.universeText,
          )}
        >
          UNIVERSE
        </span>
      </div>
    </div>
  );
};

export default Logo;
