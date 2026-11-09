import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface BookCenterLogoProps {
  readonly className?: string;
}

/**
 * Biểu tượng Cuốn Sách Mở Tri Thức (Luminous Open Book Emblem)
 *
 * Tác phẩm biểu trưng trang sách tri thức hồ sương:
 * - Đôi trang sách mở xòe đối xứng hoàn mỹ với mép giấy uốn lượn như cánh sóng tri thức.
 * - Sống sách thanh thoát kết nối gáy sách ngọc bích sẫm (#143326) hòa trộn cùng mặt nước.
 * - Các dòng kẻ tri thức mạ vàng kim/hổ phách (#E5B25D) cùng dải lụa đánh dấu trang rủ xuống.
 * - Màu trang giấy: Trắng ngà phản quang (#F1F5F3) với viền sáng mỏng (rim light).
 * - Hiệu ứng hào quang ấm áp: drop-shadow vàng hổ phách và hào quang trắng ngọc.
 * - Vi tương tác: Nhịp thở phát sáng 4s ở trạng thái nghỉ; nâng nhẹ khi hover.
 */
export function BookCenterLogo({ className }: BookCenterLogoProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      data-testid="book-center-logo"
      className={cn(
        'group relative flex cursor-pointer items-center justify-center select-none',
        'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'hover:-translate-y-0.5 hover:scale-[1.05]',
        className,
      )}
      aria-label="Biểu trưng Cuốn sách mở tri thức"
    >
      <svg
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 transition-all duration-300 md:h-20 md:w-20"
        aria-hidden="true"
        style={{
          filter:
            'drop-shadow(0 0 12px rgba(229, 178, 93, 0.45)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.6))',
        }}
      >
        <defs>
          <style>{`
            @keyframes book-breathe-pulse {
              0%, 100% {
                opacity: 0.8;
                transform: scale(1);
              }
              50% {
                opacity: 1;
                transform: scale(1.03);
              }
            }
            @keyframes book-sheen-sweep {
              0%, 100% {
                opacity: 0.4;
                transform: translateX(-2px);
              }
              50% {
                opacity: 0.85;
                transform: translateX(2px);
              }
            }
            .book-breath-halo {
              transform-origin: 48px 50px;
              animation: ${prefersReducedMotion ? 'none' : 'book-breathe-pulse 4s ease-in-out infinite'};
            }
            .book-sheen-wave {
              animation: ${prefersReducedMotion ? 'none' : 'book-sheen-sweep 3s ease-in-out infinite'};
            }
          `}</style>

          {/* 1. HÀO QUANG VÀNG HỔ PHÁCH VÀ TRẮNG NGỌC */}
          <radialGradient id="book-halo-glow" cx="50%" cy="50%" r="48%">
            <stop offset="0%" stopColor="#FCE39E" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#E5B25D" stopOpacity="0.28" />
            <stop offset="75%" stopColor="#E5B25D" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#E5B25D" stopOpacity="0" />
          </radialGradient>

          {/* 2. GÁY SÁCH & BÌA ĐÁY NGỌC BÍCH SẪM */}
          <linearGradient id="book-base-spine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1B4232" />
            <stop offset="50%" stopColor="#143326" />
            <stop offset="100%" stopColor="#0B1F16" />
          </linearGradient>

          {/* 3. LỚP ĐỘ DÀY TẬP TRANG SÁCH (PAGE STACK) */}
          <linearGradient id="book-stack-left" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#C8D6CF" />
            <stop offset="60%" stopColor="#9FB4AA" />
            <stop offset="100%" stopColor="#7E968B" />
          </linearGradient>

          <linearGradient id="book-stack-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C8D6CF" />
            <stop offset="60%" stopColor="#9FB4AA" />
            <stop offset="100%" stopColor="#7E968B" />
          </linearGradient>

          {/* 4. SẮC CHUYỂN TRANG SÁCH BÊN TRÁI (TRẮNG NGÀ PHẢN QUANG #F1F5F3) */}
          <linearGradient id="book-page-left" x1="100%" y1="20%" x2="0%" y2="70%">
            <stop offset="0%" stopColor="#D5E0DB" />
            <stop offset="14%" stopColor="#E8F0EC" />
            <stop offset="55%" stopColor="#F1F5F3" />
            <stop offset="92%" stopColor="#FAFDFB" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* 5. SẮC CHUYỂN TRANG SÁCH BÊN PHẢI (TRẮNG NGÀ PHẢN QUANG #F1F5F3) */}
          <linearGradient id="book-page-right" x1="0%" y1="20%" x2="100%" y2="70%">
            <stop offset="0%" stopColor="#D5E0DB" />
            <stop offset="14%" stopColor="#E8F0EC" />
            <stop offset="55%" stopColor="#F1F5F3" />
            <stop offset="92%" stopColor="#FAFDFB" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* 6. DÒNG KẺ TRI THỨC MẠ VÀNG KIM/HỔ PHÁCH (#E5B25D) */}
          <linearGradient id="book-gold-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DDA74F" />
            <stop offset="50%" stopColor="#E5B25D" />
            <stop offset="100%" stopColor="#FDE39E" />
          </linearGradient>

          {/* 7. DẢI LỤA ĐÁNH DẤU TRANG */}
          <linearGradient id="book-ribbon-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FCE39E" />
            <stop offset="60%" stopColor="#E5B25D" />
            <stop offset="100%" stopColor="#B88028" />
          </linearGradient>
        </defs>

        {/* 1. VẦNG HÀO QUANG NHỊP THỞ ẤM ÁP */}
        <circle cx="48" cy="50" r="42" fill="url(#book-halo-glow)" className="book-breath-halo" />

        {/* 2. BÓNG ĐỔ MẶT NƯỚC DƯỚI ĐÁY SÁCH */}
        <ellipse cx="48" cy="72" rx="36" ry="7" fill="#081a13" fillOpacity="0.45" />

        {/* 3. LỚP BÌA ĐÁY VÀ ĐỘ DÀY GÁY SÁCH NGỌC BÍCH SẪM */}
        <path
          d="M 12 64 C 26 68, 38 69.5, 48 70.5 C 58 69.5, 70 68, 84 64 L 83 67 C 70 71, 58 72.5, 48 73.5 C 38 72.5, 26 71, 13 67 Z"
          fill="url(#book-base-spine)"
          stroke="#2A523F"
          strokeWidth="0.6"
        />

        {/* Lớp khối các trang sách bên dưới (Stack Pages Depth) */}
        {/* Bên trái */}
        <path
          d="M 13 58 C 24 63, 36 65.5, 48 66.5 L 48 69 C 37 68, 25 65.5, 13 61 Z"
          fill="url(#book-stack-left)"
        />
        {/* Bên phải */}
        <path
          d="M 83 58 C 72 63, 60 65.5, 48 66.5 L 48 69 C 59 68, 71 65.5, 83 61 Z"
          fill="url(#book-stack-right)"
        />

        {/* 4. TRANG SÁCH MỞ ĐÔI (OPEN PAGES WITH KNOWLEDGE WAVE CURVES) */}
        {/* Trang bên trái: Cánh sóng tri thức vươn cong mềm mại */}
        <path
          d="M 48 37 C 37 32, 25 30, 14 35 C 12.5 43, 12 51, 13 58 C 24 53.5, 36 57.5, 48 65 Z"
          fill="url(#book-page-left)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.9"
        />

        {/* Trang bên phải: Mở xòe đối xứng hoàn mỹ */}
        <path
          d="M 48 37 C 59 32, 71 30, 82 35 C 83.5 43, 84 51, 83 58 C 72 53.5, 60 57.5, 48 65 Z"
          fill="url(#book-page-right)"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.9"
        />

        {/* 5. GÁY SÁCH & RÃNH GIỮA CÓ ĐỘ CONG THANH THOÁT */}
        <path
          d="M 48 37 Q 47.5 51, 48 65.5"
          stroke="#143326"
          strokeWidth="1.2"
          strokeOpacity="0.5"
          strokeLinecap="round"
        />

        {/* Vệt bóng đổ sâu ở nếp gấp trang sách */}
        <path
          d="M 48 37 C 46.5 44, 46.5 58, 48 65 C 49.5 58, 49.5 44, 48 37 Z"
          fill="#143326"
          fillOpacity="0.18"
        />

        {/* 6. DÒNG KẺ HOẶC GÂN TRANG SÁCH MẠ VÀNG KIM/HỔ PHÁCH (#E5B25D) */}
        {/* Trang trái */}
        <g stroke="url(#book-gold-accent)" strokeWidth="1.15" strokeLinecap="round" opacity="0.9">
          <path d="M 21 41 C 29 38, 36 40, 42 43" />
          <path d="M 19 46.5 C 28 43.5, 36 45.5, 42 48.5" />
          <path d="M 20 52 C 28 49, 36 51, 42 54" />
          <path d="M 22 56.5 C 29 54, 35 55.5, 41 58.5" opacity="0.65" />
        </g>

        {/* Trang phải */}
        <g stroke="url(#book-gold-accent)" strokeWidth="1.15" strokeLinecap="round" opacity="0.9">
          <path d="M 54 43 C 60 40, 67 38, 75 41" />
          <path d="M 54 48.5 C 60 45.5, 68 43.5, 77 46.5" />
          <path d="M 54 54 C 60 51, 68 49, 76 52" />
          <path d="M 55 58.5 C 61 55.5, 67 54, 74 56.5" opacity="0.65" />
        </g>

        {/* 7. DẢI LỤA ĐÁNH DẤU TRANG VÀNG KIM (GOLDEN BOOKMARK RIBBON) */}
        <path
          d="M 47.2 37 C 48.8 46, 46.8 57, 50.5 71.5 L 53.5 69.8 L 52.2 63.5 C 49.8 54, 50.2 44, 48.2 37 Z"
          fill="url(#book-ribbon-grad)"
          stroke="#C89738"
          strokeWidth="0.4"
        />

        {/* 8. VỆT SÁNG PHẢN QUANG (LUMINOUS SHEEN OVERLAY) */}
        <path
          d="M 18 36 C 28 32, 38 34, 46 39"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.8"
          strokeLinecap="round"
          className="book-sheen-wave"
        />
        <path
          d="M 50 39 C 58 34, 68 32, 78 36"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeOpacity="0.8"
          strokeLinecap="round"
          className="book-sheen-wave"
        />
      </svg>
    </div>
  );
}
