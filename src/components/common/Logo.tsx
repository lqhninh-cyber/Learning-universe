import type { FC } from 'react';
import { cn } from '@/shared/lib/cn';

export interface LogoProps {
  readonly variant?: 'primary' | 'symbol';
  readonly theme?: 'light' | 'dark';
  readonly size?: 'sm' | 'md' | 'lg' | 'xl';
  readonly className?: string;
  readonly 'aria-label'?: string;
}

const SIZE_CONFIG = {
  sm: { px: 28, text: 'text-sm', sub: 'text-[10px]' },
  md: { px: 40, text: 'text-base', sub: 'text-xs' },
  lg: { px: 68, text: 'text-xl', sub: 'text-sm' },
  xl: { px: 96, text: 'text-2xl', sub: 'text-base' },
} as const;

export const TreeOfKnowledgeSymbol: FC<{ className?: string; theme?: 'light' | 'dark' }> = ({
  className,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';
  const trunkColor = isDark ? '#143829' : '#092117';
  const branchColor = isDark ? '#1D4D38' : '#0E2E20';
  const leafLight = isDark ? '#F5F2EB' : '#FFFFFF';
  const leafGreen = isDark ? '#739B88' : '#3E735B';
  const gold = '#C5A262';

  return (
    <svg
      viewBox="0 0 320 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('h-full w-full overflow-visible select-none', className)}
      data-testid="tree-of-knowledge-logo"
    >
      <defs>
        {/* Mẫu lá nghiêng trái */}
        <g id="leaf-L">
          <path d="M0,0 C-4,-6 -8,-14 0,-20 C8,-14 4,-6 0,0 Z" fill={leafGreen} />
          <path d="M0,0 C-2,-6 -4,-13 0,-18" stroke={leafLight} strokeWidth="0.8" opacity="0.7" />
        </g>
        {/* Mẫu lá đón sáng */}
        <g id="leaf-Light">
          <path d="M0,0 C-3,-5 -7,-12 0,-18 C7,-12 3,-5 0,0 Z" fill={leafLight} />
        </g>
      </defs>

      {/* 1. ĐƯỜNG QUỸ ĐẠO VÀNG VẮT CHÉO (NỬA PHÍA SAU) */}
      <path
        d="M40,165 C30,120 120,70 240,65 C295,62 310,85 295,115"
        stroke={gold}
        strokeWidth="1.6"
        strokeDasharray="4 3"
        opacity="0.45"
      />

      {/* 2. CUỐN SÁCH MỞ ĐA TẦNG Ở GỐC (THE ROOT FOLIO) */}
      <g id="book-base">
        {/* Bìa đáy mạ vàng */}
        <path
          d="M160,248 C120,248 60,235 45,215 H155 L160,248 Z"
          fill="#0A1F16"
          stroke={gold}
          strokeWidth="1.8"
        />
        <path
          d="M160,248 C200,248 260,235 275,215 H165 L160,248 Z"
          fill="#0A1F16"
          stroke={gold}
          strokeWidth="1.8"
        />

        {/* Các lớp trang sách trắng ngà uốn lượn */}
        <path
          d="M160,244 C125,244 70,230 50,210 C90,218 135,225 160,240 Z"
          fill={leafLight}
          opacity="0.85"
        />
        <path
          d="M160,244 C195,244 250,230 270,210 C230,218 185,225 160,240 Z"
          fill={leafLight}
          opacity="0.85"
        />

        <path d="M160,238 C130,238 78,225 55,204 C100,212 140,218 160,232 Z" fill="#E8E4D8" />
        <path d="M160,238 C190,238 242,225 265,204 C220,212 180,218 160,232 Z" fill="#E8E4D8" />

        {/* Trang trên cùng đón thân cây */}
        <path d="M160,230 C125,228 80,212 60,195 C105,202 145,210 160,224 Z" fill={leafLight} />
        <path d="M160,230 C195,228 240,212 260,195 C215,202 175,210 160,224 Z" fill={leafLight} />

        {/* Gáy sách vòm mạ vàng */}
        <path d="M152,246 C152,252 168,252 168,246 L164,228 H156 L152,246 Z" fill={gold} />
      </g>

      {/* 3. THÂN CÂY & HỆ THỐNG CÀNH ĐỐI XỨNG HÌNH BÁN NGUYỆT */}
      <g id="trunk-and-branches">
        {/* Thân cây chính */}
        <path
          d="M154,228 C154,195 142,165 130,145 C145,152 155,165 160,185 C165,165 175,152 190,145 C178,165 166,195 166,228 Z"
          fill={trunkColor}
        />

        {/* Cặp cành tầng 1: Xòe thấp sang hai bên */}
        <path
          d="M152,198 C120,195 85,188 62,174 C80,180 115,185 145,182"
          stroke={branchColor}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          d="M168,198 C200,195 235,188 258,174 C240,180 205,185 175,182"
          stroke={branchColor}
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* Nhánh con tầng 1 */}
        <path
          d="M105,188 C85,178 72,160 68,142"
          stroke={branchColor}
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M215,188 C235,178 248,160 252,142"
          stroke={branchColor}
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Cặp cành tầng 2: Tỏa rộng trung tâm */}
        <path
          d="M155,175 C125,160 90,138 78,112 C95,124 125,142 150,150"
          stroke={branchColor}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M165,175 C195,160 230,138 242,112 C225,124 195,142 170,150"
          stroke={branchColor}
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Nhánh con tầng 2 */}
        <path
          d="M115,145 C100,125 95,98 96,78"
          stroke={branchColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M205,145 C220,125 225,98 224,78"
          stroke={branchColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Cặp cành tầng 3: Vươn cao hướng thiên */}
        <path
          d="M158,155 C145,130 128,95 125,65 C135,82 148,110 156,128"
          stroke={branchColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M162,155 C175,130 192,95 195,65 C185,82 172,110 164,128"
          stroke={branchColor}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Trục cành chính giữa đỡ đóa sen */}
        <path d="M160,150 V82" stroke={branchColor} strokeWidth="3.2" strokeLinecap="round" />
      </g>

      {/* 4. TÁN LÁ DÀY ĐẶC (FOLIAGE FIELD - ĐỐI XỨNG BÁN NGUYỆT) */}
      <g id="foliage-clusters">
        {/* Tầng đáy xòe thấp (y: 160 - 185) */}
        <use href="#leaf-L" x="52" y="180" transform="rotate(-65 52 180) scale(0.9)" />
        <use href="#leaf-Light" x="65" y="172" transform="rotate(-50 65 172) scale(0.85)" />
        <use href="#leaf-L" x="80" y="184" transform="rotate(-40 80 184) scale(0.9)" />
        <use href="#leaf-Light" x="96" y="190" transform="rotate(-25 96 190) scale(0.8)" />

        <use href="#leaf-L" x="268" y="180" transform="rotate(65 268 180) scale(0.9)" />
        <use href="#leaf-Light" x="255" y="172" transform="rotate(50 255 172) scale(0.85)" />
        <use href="#leaf-L" x="240" y="184" transform="rotate(40 240 184) scale(0.9)" />
        <use href="#leaf-Light" x="224" y="190" transform="rotate(25 224 190) scale(0.8)" />

        {/* Tầng biên ngang giữa (y: 110 - 155) */}
        <use href="#leaf-L" x="58" y="145" transform="rotate(-75 58 145) scale(0.95)" />
        <use href="#leaf-Light" x="68" y="132" transform="rotate(-60 68 132) scale(0.85)" />
        <use href="#leaf-L" x="82" y="152" transform="rotate(-45 82 152) scale(0.9)" />
        <use href="#leaf-Light" x="98" y="138" transform="rotate(-35 98 138) scale(0.95)" />
        <use href="#leaf-L" x="114" y="156" transform="rotate(-20 114 156) scale(0.85)" />

        <use href="#leaf-L" x="262" y="145" transform="rotate(75 262 145) scale(0.95)" />
        <use href="#leaf-Light" x="252" y="132" transform="rotate(60 252 132) scale(0.85)" />
        <use href="#leaf-L" x="238" y="152" transform="rotate(45 238 152) scale(0.9)" />
        <use href="#leaf-Light" x="222" y="138" transform="rotate(35 222 138) scale(0.95)" />
        <use href="#leaf-L" x="206" y="156" transform="rotate(20 206 156) scale(0.85)" />

        {/* Tầng vòm trên (y: 65 - 110) */}
        <use href="#leaf-L" x="78" y="108" transform="rotate(-70 78 108) scale(0.95)" />
        <use href="#leaf-Light" x="92" y="92" transform="rotate(-55 92 92) scale(0.9)" />
        <use href="#leaf-L" x="108" y="112" transform="rotate(-40 108 112) scale(0.95)" />
        <use href="#leaf-Light" x="126" y="85" transform="rotate(-30 126 85) scale(0.9)" />
        <use href="#leaf-L" x="136" y="108" transform="rotate(-15 136 108) scale(0.85)" />

        <use href="#leaf-L" x="242" y="108" transform="rotate(70 242 108) scale(0.95)" />
        <use href="#leaf-Light" x="228" y="92" transform="rotate(55 228 92) scale(0.9)" />
        <use href="#leaf-L" x="212" y="112" transform="rotate(40 212 112) scale(0.95)" />
        <use href="#leaf-Light" x="194" y="85" transform="rotate(30 194 85) scale(0.9)" />
        <use href="#leaf-L" x="184" y="108" transform="rotate(15 184 108) scale(0.85)" />
      </g>

      {/* 5. ĐÓA SEN THỜI LÝ ĐỈNH VÒM (CENTRAL LOTUS CROWN) */}
      <g id="lotus-crown" transform="translate(160, 56)">
        {/* Đài sen vàng đỡ cánh */}
        <path d="M-12,18 C-6,22 6,22 12,18 L8,14 H-8 Z" fill={gold} />
        {/* Cánh sen ngoài hai bên */}
        <path d="M0,16 C-15,10 -22,-5 -18,-18 C-10,-8 -4,6 0,16 Z" fill={leafGreen} />
        <path d="M0,16 C15,10 22,-5 18,-18 C10,-8 4,6 0,16 Z" fill={leafGreen} />
        {/* Cánh sen trong ôm búp */}
        <path d="M0,16 C-10,6 -14,-12 -8,-24 C-2,-12 0,2 0,16 Z" fill={leafLight} />
        <path d="M0,16 C10,6 14,-12 8,-24 C2,-12 0,2 0,16 Z" fill={leafLight} />
        {/* Cánh búp sen chính giữa vươn cao */}
        <path d="M0,16 C-5,2 -6,-18 0,-30 C6,-18 5,2 0,16 Z" fill={gold} />
        {/* Hạt ngọc tinh tú đỉnh hoa */}
        <circle cx="0" cy="-34" r="2.2" fill={gold} />
      </g>

      {/* 6. ĐƯỜNG QUỸ ĐẠO VÀNG VẮT CHÉO (NỬA PHÍA TRƯỚC VÀ CÁC VÌ SAO) */}
      <path
        d="M295,115 C275,150 180,185 80,182 C45,181 25,172 32,160"
        stroke={gold}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* 5 hạt tinh tú dọc quỹ đạo */}
      <circle cx="280" cy="132" r="2.8" fill={gold} />
      <circle cx="215" cy="168" r="2" fill={leafLight} />
      <circle cx="115" cy="184" r="2.5" fill={gold} />
      <circle cx="48" cy="172" r="1.8" fill={leafLight} />
      <circle cx="160" cy="18" r="2" fill={gold} />
    </svg>
  );
};

export const Logo: FC<LogoProps> = ({
  variant = 'primary',
  theme = 'dark',
  size = 'md',
  className,
  'aria-label': ariaLabel = 'Learning Universe',
}) => {
  const cfg = SIZE_CONFIG[size];
  const isDark = theme === 'dark';

  return (
    <div
      className={cn('inline-flex items-center gap-3 select-none', className)}
      aria-label={ariaLabel}
      role="img"
    >
      <div
        style={{ width: cfg.px, height: Math.round(cfg.px * 0.82) }}
        className="relative flex shrink-0 items-center justify-center transition-transform duration-200 hover:-translate-y-0.5"
      >
        <TreeOfKnowledgeSymbol theme={theme} />
      </div>

      {variant === 'primary' && (
        <div className="flex flex-col leading-none tracking-wider">
          <span className="sr-only">LEARNING UNIVERSE</span>
          <span
            className={cn(
              cfg.text,
              'font-serif font-bold tracking-[0.16em] uppercase',
              isDark ? 'text-[#F5F2EB]' : 'text-[#081611]',
            )}
          >
            Learning
          </span>
          <span
            className={cn(
              cfg.sub,
              'mt-1 font-sans font-semibold tracking-[0.22em] uppercase',
              'text-[#C5A262]',
            )}
          >
            Universe
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
