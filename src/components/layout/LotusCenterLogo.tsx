import { cn } from '@/shared/lib/cn';

export interface LotusCenterLogoProps {
  readonly className?: string;
}

/**
 * Bông sen hồ sương (Artistic Lotus Emblem)
 * Biểu tượng sen thanh tao kết hợp giữa không gian mặt nước đầm sen,
 * phiến lá sen lục thẫm và đóa sen hồng nở rực rỡ với nhụy vàng óng.
 */
export function LotusCenterLogo({ className }: LotusCenterLogoProps) {
  return (
    <div
      data-testid="lotus-center-logo"
      className={cn(
        'relative flex items-center justify-center transition-transform duration-300 hover:scale-105',
        className,
      )}
      style={{ filter: 'drop-shadow(0 0 12px rgba(184, 93, 111, 0.25))' }}
      aria-label="Biểu trưng Bông sen hồ sương"
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-14 w-14 md:h-16 md:w-16"
        aria-hidden="true"
      >
        <defs>
          {/* Vầng hào quang mờ dịu (Misty Ambient Atmosphere) */}
          <radialGradient id="lotus-mist-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#B85D6F" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#C4687A" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#B85D6F" stopOpacity="0" />
          </radialGradient>

          {/* Sắc chuyển cánh sen ngoài (hồng sen chuyển trắng ngà) */}
          <linearGradient id="lotus-outer-petal" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#C4687A" />
            <stop offset="65%" stopColor="#ECAAB6" />
            <stop offset="100%" stopColor="#FDEEF1" />
          </linearGradient>

          {/* Sắc chuyển cánh sen trong (hồng sen thắm) */}
          <linearGradient id="lotus-inner-petal" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#B85D6F" />
            <stop offset="50%" stopColor="#C4687A" />
            <stop offset="100%" stopColor="#F8D3DC" />
          </linearGradient>

          {/* Sắc chuyển nhụy hoa vàng óng */}
          <linearGradient id="lotus-stamen-gold" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#C89738" />
            <stop offset="100%" stopColor="#F5D076" />
          </linearGradient>

          {/* Sắc chuyển phiến lá sen lục thẫm */}
          <linearGradient id="lotus-leaf-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#365E4E" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#223E33" stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* 1. VẦNG HÀO QUANG MỜ DỊU SAU ĐÓA SEN */}
        <circle cx="32" cy="34" r="26" fill="url(#lotus-mist-halo)" />

        {/* 2. NỀN NƯỚC & GỢN SÓNG HỒ SEN */}
        <path
          d="M 8 52 C 18 50, 46 50, 56 52"
          stroke="#5E8A75"
          strokeWidth="0.8"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />
        <path
          d="M 14 55.5 C 22 54, 42 54, 50 55.5"
          stroke="#5E8A75"
          strokeWidth="0.6"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />

        {/* Vệt nước & Bèo cám màu ngọc bích nhạt mờ sương */}
        <ellipse cx="14" cy="51" rx="2.5" ry="1.2" fill="#5E8A75" fillOpacity="0.45" />
        <ellipse cx="49" cy="51" rx="3" ry="1.3" fill="#5E8A75" fillOpacity="0.4" />
        <circle cx="20" cy="54" r="0.8" fill="#5E8A75" fillOpacity="0.35" />
        <circle cx="44" cy="54" r="0.9" fill="#5E8A75" fillOpacity="0.35" />

        {/* 3. HAI PHIẾN LÁ SEN TRÒN VIỀN LƯỢN SÓNG MÀU LỤC THẪM */}
        {/* Lá sen bên trái */}
        <path
          d="M 10 47 C 12 42, 20 40, 27 43 C 28 46, 25 50, 19 50 C 13 50, 9 48, 10 47 Z"
          fill="url(#lotus-leaf-grad)"
        />
        <path
          d="M 19 47 Q 14 45, 12 46"
          stroke="#5E8A75"
          strokeWidth="0.5"
          strokeOpacity="0.4"
          fill="none"
        />
        <path
          d="M 19 47 Q 24 43, 26 44"
          stroke="#5E8A75"
          strokeWidth="0.5"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* Lá sen bên phải */}
        <path
          d="M 54 47 C 52 42, 44 40, 37 43 C 36 46, 39 50, 45 50 C 51 50, 55 48, 54 47 Z"
          fill="url(#lotus-leaf-grad)"
        />
        <path
          d="M 45 47 Q 50 45, 52 46"
          stroke="#5E8A75"
          strokeWidth="0.5"
          strokeOpacity="0.4"
          fill="none"
        />
        <path
          d="M 45 47 Q 40 43, 38 44"
          stroke="#5E8A75"
          strokeWidth="0.5"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* 4. ĐÓA SEN HỒNG NHIỀU LỚP CÁNH (BLOOMING LOTUS) */}
        {/* Cánh hoa ngoài cùng bên trái (dáng bầu nhọn hé mở) */}
        <path
          d="M 32 46 C 22 45, 11 38, 13 28 C 17 28, 25 34, 32 46 Z"
          fill="url(#lotus-outer-petal)"
          stroke="#C4687A"
          strokeWidth="0.4"
          strokeOpacity="0.5"
        />

        {/* Cánh hoa ngoài cùng bên phải (dáng bầu nhọn hé mở) */}
        <path
          d="M 32 46 C 42 45, 53 38, 51 28 C 47 28, 39 34, 32 46 Z"
          fill="url(#lotus-outer-petal)"
          stroke="#C4687A"
          strokeWidth="0.4"
          strokeOpacity="0.5"
        />

        {/* Cánh tầng giữa bên trái */}
        <path
          d="M 32 46 C 24 43, 16 34, 19 24 C 23 25, 28 35, 32 46 Z"
          fill="url(#lotus-outer-petal)"
          stroke="#C4687A"
          strokeWidth="0.4"
          strokeOpacity="0.5"
        />

        {/* Cánh tầng giữa bên phải */}
        <path
          d="M 32 46 C 40 43, 48 34, 45 24 C 41 25, 36 35, 32 46 Z"
          fill="url(#lotus-outer-petal)"
          stroke="#C4687A"
          strokeWidth="0.4"
          strokeOpacity="0.5"
        />

        {/* Cánh vươn cao tầng trong bên trái (sắc thắm #B85D6F) */}
        <path
          d="M 32 46 C 26 40, 23 28, 26 18 C 29 23, 31 36, 32 46 Z"
          fill="url(#lotus-inner-petal)"
          stroke="#B85D6F"
          strokeWidth="0.4"
          strokeOpacity="0.6"
        />

        {/* Cánh vươn cao tầng trong bên phải (sắc thắm #B85D6F) */}
        <path
          d="M 32 46 C 38 40, 41 28, 38 18 C 35 23, 33 36, 32 46 Z"
          fill="url(#lotus-inner-petal)"
          stroke="#B85D6F"
          strokeWidth="0.4"
          strokeOpacity="0.6"
        />

        {/* Cánh chính tâm vút nhọn vươn thẳng */}
        <path
          d="M 32 46 C 28 36, 27 22, 32 13 C 37 22, 36 36, 32 46 Z"
          fill="url(#lotus-inner-petal)"
          stroke="#B85D6F"
          strokeWidth="0.5"
          strokeOpacity="0.7"
        />

        {/* 5. NHỤY HOA MÀU VÀNG ÓNG (#C89738) & ĐÀI HOA */}
        <ellipse cx="32" cy="38" rx="3.5" ry="4.5" fill="url(#lotus-stamen-gold)" />
        <circle cx="32" cy="35" r="1.3" fill="#F8DF8F" />
        <circle cx="30.2" cy="37.5" r="0.75" fill="#E6B34A" />
        <circle cx="33.8" cy="37.5" r="0.75" fill="#E6B34A" />

        {/* 6. ĐỐM SƯƠNG MAI TRẮNG MỜ LI TI XUNG QUANH ĐÀI HOA */}
        <circle cx="32" cy="12.5" r="0.9" fill="#FFFFFF" fillOpacity="0.85" />
        <circle cx="25.5" cy="17.5" r="0.65" fill="#FFFFFF" fillOpacity="0.75" />
        <circle cx="38.5" cy="17.5" r="0.65" fill="#FFFFFF" fillOpacity="0.75" />
        <circle cx="12.5" cy="27.5" r="0.7" fill="#FFFFFF" fillOpacity="0.7" />
        <circle cx="51.5" cy="27.5" r="0.7" fill="#FFFFFF" fillOpacity="0.7" />
        <circle cx="18" cy="46" r="0.5" fill="#FFFFFF" fillOpacity="0.6" />
        <circle cx="46" cy="46" r="0.5" fill="#FFFFFF" fillOpacity="0.6" />
      </svg>
    </div>
  );
}
