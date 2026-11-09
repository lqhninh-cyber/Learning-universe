import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface LotusCenterLogoProps {
  readonly className?: string;
}

/**
 * Biểu tượng Bông sen hồ sương (Artistic 3D-on-2D Lotus Center Logo)
 *
 * Tác phẩm biểu trưng điêu khắc 3D trên mặt phẳng 2D:
 * - Góc nhìn phối cảnh nghiêng 35° tự nhiên từ trên xuống (Isometric 3D-on-2D view).
 * - Phiến lá sen tròn xanh thẫm làm bệ đỡ vững chãi với gân lá chạm khắc và bóng đổ trên mặt hồ.
 * - Bóng cá chép bơi ngầm mini màu cam đất (#D49A58 / #C45A38) uốn lượn dưới phiến lá.
 * - Đài sen 3D nghiêng ở trung tâm hé lộ các lỗ hạt sen ngọc bích và vành nhụy hoa vàng óng nổi hạt.
 * - Đóa sen nhiều tầng cánh phớt hồng vươn cao ôm lấy đài hoa: sắc hồng đằm (#B85D6F), lòng cánh chuyển ngà sứ với viền bắt sáng.
 * - Hiệu ứng nhịp thở ánh sáng 4s (breathing glow) co giãn nhịp nhàng.
 */
export function LotusCenterLogo({ className }: LotusCenterLogoProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      data-testid="lotus-center-logo"
      className={cn('group relative flex items-center justify-center select-none', className)}
      aria-label="Biểu trưng Bông sen hồ sương"
    >
      <svg
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 transition-all duration-300 md:h-20 md:w-20"
        aria-hidden="true"
        style={{
          filter: 'drop-shadow(0 0 12px rgba(217, 119, 141, 0.45))',
        }}
      >
        <defs>
          <style>{`
            @keyframes lotus-breathe-pulse {
              0%, 100% {
                opacity: 0.72;
                transform: scale(1);
              }
              50% {
                opacity: 1;
                transform: scale(1.04);
              }
            }
            @keyframes mini-carp-drift {
              0%, 100% {
                transform: translate(0, 0) rotate(0deg);
              }
              50% {
                transform: translate(2px, -1.5px) rotate(2deg);
              }
            }
            @keyframes lotus-dew-shimmer {
              0%, 100% {
                opacity: 0.65;
              }
              50% {
                opacity: 1;
              }
            }
            .lotus-breath-halo {
              transform-origin: 48px 48px;
              animation: ${prefersReducedMotion ? 'none' : 'lotus-breathe-pulse 4s ease-in-out infinite'};
            }
            .mini-carp-submerged {
              transform-origin: 48px 74px;
              animation: ${prefersReducedMotion ? 'none' : 'mini-carp-drift 5s ease-in-out infinite'};
            }
            .lotus-dewdrop {
              animation: ${prefersReducedMotion ? 'none' : 'lotus-dew-shimmer 3s ease-in-out infinite'};
            }
          `}</style>

          {/* 1. HÀO QUANG NHỊP THỞ ÁNH SÁNG (BREATHING GLOW) */}
          <radialGradient id="logo-halo-glow" cx="50%" cy="48%" r="48%">
            <stop offset="0%" stopColor="#FCE39E" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#B85D6F" stopOpacity="0.32" />
            <stop offset="70%" stopColor="#B85D6F" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#B85D6F" stopOpacity="0" />
          </radialGradient>

          {/* 2. SẮC CHUYỂN BÓNG ĐỔ MẶT NƯỚC HỒ SƯƠNG */}
          <radialGradient id="water-shadow-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1B3229" stopOpacity="0.5" />
            <stop offset="65%" stopColor="#254337" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#254337" stopOpacity="0" />
          </radialGradient>

          {/* 3. SẮC CHUYỂN CÁ CHÉP BƠI NGẦM MINI (#C45A38 / #D49A58) */}
          <linearGradient id="mini-carp-body" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#C45A38" stopOpacity="0.85" />
            <stop offset="55%" stopColor="#D49A58" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#E6B87A" stopOpacity="0.55" />
          </linearGradient>

          {/* 4. SẮC CHUYỂN PHIẾN LÁ SEN 3D (BỆ ĐỠ ĐIÊU KHẮC NỔI BẬT ĐÓN SÁNG) */}
          <radialGradient id="base-leaf-surface" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#629A83" />
            <stop offset="35%" stopColor="#4A7B67" />
            <stop offset="70%" stopColor="#325949" />
            <stop offset="100%" stopColor="#1E3B2E" />
          </radialGradient>

          {/* Viền dày 3D mép lá sen đón sáng */}
          <linearGradient id="leaf-3d-rim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7EBAA1" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1B382B" stopOpacity="0.95" />
          </linearGradient>

          {/* 5. SẮC CHUYỂN ĐÀI SEN 3D NGHIÊNG 35 ĐỘ */}
          <linearGradient id="pod-3d-cone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#678A77" />
            <stop offset="60%" stopColor="#486858" />
            <stop offset="100%" stopColor="#2B4036" />
          </linearGradient>

          <linearGradient id="pod-3d-surface" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8EAF9D" />
            <stop offset="45%" stopColor="#658875" />
            <stop offset="100%" stopColor="#476656" />
          </linearGradient>

          {/* 6. VÀNH NHỤY VÀNG ÓNG TỎA TIA */}
          <linearGradient id="stamen-gold-ray" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#B37C22" />
            <stop offset="60%" stopColor="#C89738" />
            <stop offset="100%" stopColor="#FCE39E" />
          </linearGradient>

          {/* 7. SẮC CHUYỂN CÁNH SEN TẦNG NGOÀI (HỒNG ĐẰM SANG TRẮNG NGÀ) */}
          <linearGradient id="petal-outer-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#A4485A" />
            <stop offset="40%" stopColor="#B85D6F" />
            <stop offset="80%" stopColor="#ECAAB6" />
            <stop offset="100%" stopColor="#FDEEF1" />
          </linearGradient>

          {/* 8. SẮC CHUYỂN CÁNH SEN TẦNG TRONG (NGÀ SỨ ĐÓN SÁNG) */}
          <linearGradient id="petal-inner-porcelain" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#B85D6F" />
            <stop offset="35%" stopColor="#CF7B8D" />
            <stop offset="75%" stopColor="#F7CCD5" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          {/* 9. SẮC CHUYỂN CÁNH SEN TRUNG TÂM VƯƠN CAO */}
          <linearGradient id="petal-center-crown" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#933D4F" />
            <stop offset="50%" stopColor="#B85D6F" />
            <stop offset="88%" stopColor="#F5C3CD" />
            <stop offset="100%" stopColor="#FAF0F2" />
          </linearGradient>
        </defs>

        {/* 1. VẦNG HÀO QUANG NHỊP THỞ (BREATHING AMBIENT HALO) */}
        <circle cx="48" cy="48" r="42" fill="url(#logo-halo-glow)" className="lotus-breath-halo" />

        {/* 2. GỢN SÓNG NƯỚC ĐỒNG TÂM MẶT HỒ SƯƠNG */}
        <ellipse cx="48" cy="74" rx="38" ry="11" fill="url(#water-shadow-grad)" />
        <path
          d="M 12 75 C 24 72, 72 72, 84 75"
          stroke="#5E8A75"
          strokeWidth="0.8"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />
        <path
          d="M 22 79 C 34 77, 62 77, 74 79"
          stroke="#5E8A75"
          strokeWidth="0.6"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />

        {/* 3. BÓNG CÁ CHÉP BƠI NGẦM MINI UỐN LƯỢN DƯỚI PHIẾN LÁ */}
        <g className="mini-carp-submerged">
          {/* Vệt rẽ nước mờ ảo */}
          <path
            d="M 28 80 Q 40 78, 54 81"
            stroke="#D49A58"
            strokeWidth="0.6"
            strokeOpacity="0.3"
            strokeLinecap="round"
          />
          {/* Thân cá chép mini */}
          <path
            d="M 32 78 C 36 75, 46 76, 54 78 C 50 81, 40 82, 32 78 Z"
            fill="url(#mini-carp-body)"
          />
          {/* Vây đuôi cá uốn lượn */}
          <path
            d="M 32 78 C 28 76, 26 73, 23 75 C 26 77, 27 80, 24 83 C 27 81, 30 79, 32 78 Z"
            fill="#C45A38"
            fillOpacity="0.65"
          />
          {/* Vây ngực bán trong suốt */}
          <ellipse
            cx="44"
            cy="79.5"
            rx="3"
            ry="1.2"
            transform="rotate(18 44 79.5)"
            fill="#E6B87A"
            fillOpacity="0.5"
          />
        </g>

        {/* 4. PHIẾN LÁ SEN 3D (SCULPTURAL JADE BASE LEAF) */}
        {/* Bóng khối 3D đáy lá */}
        <path
          d="M 18 64 C 20 54, 42 50, 48 50 C 54 50, 76 54, 78 64 C 76 72, 54 75, 48 75 C 42 75, 20 72, 18 64 Z"
          fill="url(#leaf-3d-rim)"
        />
        {/* Bề mặt lá phối cảnh nghiêng */}
        <path
          d="M 18 63 C 20 53.5, 42 49.5, 48 49.5 C 54 49.5, 76 53.5, 78 63 C 75.5 70.5, 54 73.5, 48 73.5 C 42 73.5, 20.5 70.5, 18 63 Z"
          fill="url(#base-leaf-surface)"
          stroke="#6EA890"
          strokeWidth="0.75"
          strokeOpacity="0.7"
        />

        {/* Vệt phản quang sáng dịu trên tán lá sen đỡ đáy */}
        <ellipse cx="46" cy="62.5" rx="18" ry="4" fill="#A2D4BE" fillOpacity="0.22" />

        {/* Khía khuyết tự nhiên của lá sen */}
        <path
          d="M 48 49.5 Q 48 56, 48 62"
          stroke="#1F362C"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Hệ gân lá sen chạm khắc tinh vi */}
        <g stroke="#679782" strokeWidth="0.5" strokeOpacity="0.45" fill="none">
          <path d="M 48 62 C 38 60, 28 58, 22 62" />
          <path d="M 48 62 C 36 64, 28 66, 26 69" />
          <path d="M 48 62 C 58 60, 68 58, 74 62" />
          <path d="M 48 62 C 60 64, 68 66, 70 69" />
          <path d="M 48 62 C 44 67, 46 71, 48 73" />
        </g>

        {/* Giọt sương mai lấp lánh đọng trên phiến lá sen */}
        <g className="lotus-dewdrop">
          <ellipse cx="34" cy="64" rx="2" ry="1.2" fill="#FFFFFF" fillOpacity="0.85" />
          <circle cx="34.6" cy="63.6" r="0.6" fill="#FFFFFF" />
          <ellipse cx="64" cy="65" rx="1.6" ry="1" fill="#FFFFFF" fillOpacity="0.75" />
        </g>

        {/* 5. ĐÓA SEN NHIỀU TẦNG CÁNH (BLOOMING LOTUS SCULPTURE) */}
        {/* TẦNG CÁNH SAU CÙNG (REAR ARCHING PETALS) */}
        {/* Cánh sau bên trái */}
        <path
          d="M 48 58 C 36 54, 26 42, 30 29 C 36 30, 42 42, 48 58 Z"
          fill="url(#petal-outer-grad)"
          stroke="#B85D6F"
          strokeWidth="0.5"
          strokeOpacity="0.6"
        />
        {/* Cánh sau bên phải */}
        <path
          d="M 48 58 C 60 54, 70 42, 66 29 C 60 30, 54 42, 48 58 Z"
          fill="url(#petal-outer-grad)"
          stroke="#B85D6F"
          strokeWidth="0.5"
          strokeOpacity="0.6"
        />
        {/* Cánh sau đỉnh cao */}
        <path
          d="M 48 58 C 42 45, 41 28, 48 16 C 55 28, 54 45, 48 58 Z"
          fill="url(#petal-center-crown)"
          stroke="#B85D6F"
          strokeWidth="0.5"
          strokeOpacity="0.7"
        />

        {/* TẦNG CÁNH GIỮA (LATERAL EMBRACING PETALS) */}
        {/* Cánh xòe rộng bên trái */}
        <path
          d="M 48 58 C 34 56, 18 46, 21 34 C 27 34, 38 43, 48 58 Z"
          fill="url(#petal-outer-grad)"
          stroke="#C4687A"
          strokeWidth="0.4"
          strokeOpacity="0.65"
        />
        {/* Cánh xòe rộng bên phải */}
        <path
          d="M 48 58 C 62 56, 78 46, 75 34 C 69 34, 58 43, 48 58 Z"
          fill="url(#petal-outer-grad)"
          stroke="#C4687A"
          strokeWidth="0.4"
          strokeOpacity="0.65"
        />

        {/* Cánh tầng giữa bên trái ôm sát đài */}
        <path
          d="M 48 58 C 38 52, 30 38, 36 24 C 42 28, 45 42, 48 58 Z"
          fill="url(#petal-inner-porcelain)"
          stroke="#B85D6F"
          strokeWidth="0.5"
          strokeOpacity="0.7"
        />
        {/* Cánh tầng giữa bên phải ôm sát đài */}
        <path
          d="M 48 58 C 58 52, 66 38, 60 24 C 54 28, 51 42, 48 58 Z"
          fill="url(#petal-inner-porcelain)"
          stroke="#B85D6F"
          strokeWidth="0.5"
          strokeOpacity="0.7"
        />

        {/* 6. ĐÀI SEN 3D (GƯƠNG SEN) NGHIÊNG PHỐI CẢNH 35 ĐỘ Ở TRUNG TÂM */}
        <g id="lotus-pod-3d">
          {/* Thân chóp cụt 3D của đài sen */}
          <path
            d="M 38 48 C 38 54, 58 54, 58 48 L 57 43 C 57 40, 39 40, 39 43 Z"
            fill="url(#pod-3d-cone)"
          />
          {/* Mặt cắt nghiêng gương sen phối cảnh bầu dục */}
          <ellipse
            cx="48"
            cy="42.5"
            rx="9.5"
            ry="6"
            fill="url(#pod-3d-surface)"
            stroke="#3E5B4D"
            strokeWidth="0.6"
          />

          {/* 7 Lỗ hạt sen ngọc bích non (Jade Seed Pits) */}
          {/* Hạt trung tâm */}
          <circle cx="48" cy="42.5" r="1.3" fill="#294136" />
          <circle cx="48.2" cy="42.3" r="0.8" fill="#A2C8B5" />

          {/* 6 Hạt xung quanh viền đài */}
          <circle cx="43" cy="40.8" r="1.1" fill="#294136" />
          <circle cx="43.2" cy="40.6" r="0.7" fill="#A2C8B5" />

          <circle cx="53" cy="40.8" r="1.1" fill="#294136" />
          <circle cx="53.2" cy="40.6" r="0.7" fill="#A2C8B5" />

          <circle cx="41.5" cy="43.5" r="1.1" fill="#294136" />
          <circle cx="41.7" cy="43.3" r="0.7" fill="#A2C8B5" />

          <circle cx="54.5" cy="43.5" r="1.1" fill="#294136" />
          <circle cx="54.7" cy="43.3" r="0.7" fill="#A2C8B5" />

          <circle cx="45" cy="45.5" r="1.1" fill="#294136" />
          <circle cx="45.2" cy="45.3" r="0.7" fill="#A2C8B5" />

          <circle cx="51" cy="45.5" r="1.1" fill="#294136" />
          <circle cx="51.2" cy="45.3" r="0.7" fill="#A2C8B5" />

          {/* Vành nhụy hoa vàng óng tỏa tia quanh mép đài sen */}
          <g stroke="url(#stamen-gold-ray)" strokeWidth="0.75" strokeLinecap="round">
            <line x1="38" y1="42.5" x2="35.5" y2="42" />
            <line x1="39.5" y1="39" x2="37.5" y2="37.5" />
            <line x1="43.5" y1="37" x2="42.5" y2="34.8" />
            <line x1="48" y1="36.5" x2="48" y2="34" />
            <line x1="52.5" y1="37" x2="53.5" y2="34.8" />
            <line x1="56.5" y1="39" x2="58.5" y2="37.5" />
            <line x1="58" y1="42.5" x2="60.5" y2="42" />
            <line x1="57" y1="45.5" x2="59.5" y2="46.5" />
            <line x1="53.5" y1="48" x2="55" y2="50" />
            <line x1="48" y1="48.8" x2="48" y2="51.2" />
            <line x1="42.5" y1="48" x2="41" y2="50" />
            <line x1="39" y1="45.5" x2="36.5" y2="46.5" />
          </g>

          {/* Hạt nhụy vàng li ti ở đầu sợi nhụy */}
          <circle cx="35.5" cy="42" r="0.65" fill="#FCE39E" />
          <circle cx="37.5" cy="37.5" r="0.65" fill="#FCE39E" />
          <circle cx="42.5" cy="34.8" r="0.65" fill="#FCE39E" />
          <circle cx="48" cy="34" r="0.75" fill="#FCE39E" />
          <circle cx="53.5" cy="34.8" r="0.65" fill="#FCE39E" />
          <circle cx="58.5" cy="37.5" r="0.65" fill="#FCE39E" />
          <circle cx="60.5" cy="42" r="0.65" fill="#FCE39E" />
        </g>

        {/* 7. CÁC CÁNH SEN TẦNG TRƯỚC (FOREGROUND CUP PETALS EMBRACING THE POD) */}
        {/* Cánh trước bên trái */}
        <path
          d="M 48 60 C 37 56, 31 46, 35 38 C 40 44, 46 54, 48 60 Z"
          fill="url(#petal-inner-porcelain)"
          stroke="#C4687A"
          strokeWidth="0.4"
          strokeOpacity="0.7"
        />
        {/* Cánh trước bên phải */}
        <path
          d="M 48 60 C 59 56, 65 46, 61 38 C 56 44, 50 54, 48 60 Z"
          fill="url(#petal-inner-porcelain)"
          stroke="#C4687A"
          strokeWidth="0.4"
          strokeOpacity="0.7"
        />
        {/* Cánh phía trước che đỡ chính diện */}
        <path
          d="M 48 61 C 42 54, 41 46, 48 41 C 55 46, 54 54, 48 61 Z"
          fill="url(#petal-inner-porcelain)"
          stroke="#FAF0F2"
          strokeWidth="0.5"
          strokeOpacity="0.8"
        />

        {/* Viền bắt sáng (Rim Lighting) bằng nét trắng ngọc sứ */}
        <path
          d="M 36 24 C 40 27, 43 35, 45 42"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeOpacity="0.7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 60 24 C 56 27, 53 35, 51 42"
          stroke="#FFFFFF"
          strokeWidth="0.6"
          strokeOpacity="0.7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 48 16.5 L 48 24"
          stroke="#FFFFFF"
          strokeWidth="0.7"
          strokeOpacity="0.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
