import type { FC } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface GrandLotusLakeProps {
  readonly className?: string;
}

/**
 * ĐẠI CẢNH "HỒ SEN TRI THỨC" (GRAND LOTUS LAKE)
 * Đại cảnh toàn màn hình (Full-bleed Panorama) kết nối nhịp nhàng
 * giữa điểm kết thúc của đường dẫn tri thức và chân trang:
 * - Nền mặt nước hữu cơ loang từ #F5F4EF sang #1B3229 / #12241D.
 * - 3 chú cá chép bơi lội mềm mại dưới tầng nước bán trong suốt.
 * - Đóa sen nở rộ & đài sen (gương sen) nghiêng phối cảnh 35° chân thực.
 * - Sóng nước đồng tâm, làn sương mai lướt nhẹ và đốm sáng tri thức vàng nhụy sen.
 */
export const GrandLotusLake: FC<GrandLotusLakeProps> = ({ className }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      aria-label="Đại cảnh Hồ Sen Tri Thức"
      className={cn(
        'relative w-full overflow-hidden border-t border-[#D9DFD9]/60 select-none',
        className,
      )}
    >
      <div className="relative h-[420px] w-full sm:h-[480px] lg:h-[560px]">
        {/* SVG Toàn Cảnh Hồ Sen (Full-bleed Panorama) */}
        <svg
          viewBox="0 0 1440 560"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-hidden="true"
        >
          <defs>
            {/* 1. DẢI CHUYỂN SẮC NỀN NƯỚC HỒ SEN (#F5F4EF sang #1B3229 / #12241D) */}
            <linearGradient id="lake-water-depth" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5F4EF" stopOpacity="1" />
              <stop offset="18%" stopColor="#8DA89B" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#365E4E" stopOpacity="0.9" />
              <stop offset="78%" stopColor="#1B3229" stopOpacity="0.96" />
              <stop offset="100%" stopColor="#12241D" stopOpacity="1" />
            </linearGradient>

            {/* Sắc chuyển dòng chảy tầng ngầm */}
            <radialGradient id="lake-deep-abyss" cx="50%" cy="80%" r="60%">
              <stop offset="0%" stopColor="#1B3229" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#12241D" stopOpacity="1" />
            </radialGradient>

            {/* Sắc chuyển thân cá chép 1 (Hổ phách nhạt sang cam đất #D49A58 / #C45A38) */}
            <linearGradient id="carp-body-1" x1="0%" y1="0%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#C45A38" stopOpacity="0.9" />
              <stop offset="45%" stopColor="#D49A58" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#E6B87A" stopOpacity="0.75" />
            </linearGradient>

            {/* Sắc chuyển vây cá bán trong suốt */}
            <linearGradient id="carp-fin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6B87A" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#D49A58" stopOpacity="0.2" />
            </linearGradient>

            {/* Sắc chuyển cánh sen hồng ngoài (Hồng đằm sang trắng ngà) */}
            <linearGradient id="grand-lotus-outer" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#B85D6F" />
              <stop offset="55%" stopColor="#C4687A" />
              <stop offset="100%" stopColor="#FDEEF1" />
            </linearGradient>

            {/* Sắc chuyển cánh sen trong đón sáng */}
            <linearGradient id="grand-lotus-inner" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#9E495A" />
              <stop offset="40%" stopColor="#B85D6F" />
              <stop offset="85%" stopColor="#ECAAB6" />
              <stop offset="100%" stopColor="#FAF0F2" />
            </linearGradient>

            {/* Sắc chuyển đài sen (gương sen) ngọc bích non nghiêng 35 độ */}
            <linearGradient id="lotus-pod-top" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#88A896" />
              <stop offset="50%" stopColor="#5E786D" />
              <stop offset="100%" stopColor="#3E544A" />
            </linearGradient>

            {/* Sắc chuyển nhụy hoa vàng óng */}
            <linearGradient id="grand-stamen-gold" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#C89738" />
              <stop offset="100%" stopColor="#FCE39E" />
            </linearGradient>

            {/* Sắc chuyển tán lá sen già lục thẫm */}
            <radialGradient id="grand-leaf-grad" cx="45%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#365E4E" />
              <stop offset="70%" stopColor="#254337" />
              <stop offset="100%" stopColor="#1B3229" />
            </radialGradient>

            {/* Bộ lọc sương mai và vầng hào quang đom đóm */}
            <filter id="mist-blur" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id="stamen-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* CSS ANIMATIONS CHO CÁ BƠI, SÓNG NƯỚC, SƯƠNG MAI VÀ ĐOM ĐÓM */}
            <style>{`
              @keyframes carp-path-1 {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(45px, -14px) rotate(4deg); }
                50% { transform: translate(90px, 0px) rotate(0deg); }
                75% { transform: translate(45px, 16px) rotate(-5deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }
              @keyframes carp-path-2 {
                0% { transform: translate(0, 0) rotate(0deg); }
                30% { transform: translate(-40px, 12px) rotate(-4deg); }
                65% { transform: translate(-80px, -8px) rotate(3deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }
              @keyframes carp-tail-wag {
                0%, 100% { transform: rotate(-8deg); }
                50% { transform: rotate(10deg); }
              }
              @keyframes ripple-expand {
                0% { r: 6px; opacity: 0.65; stroke-width: 1.6px; }
                50% { opacity: 0.35; stroke-width: 1px; }
                100% { r: 90px; opacity: 0; stroke-width: 0.4px; }
              }
              @keyframes mist-float {
                0% { transform: translateX(-35px); opacity: 0.3; }
                50% { transform: translateX(35px); opacity: 0.55; }
                100% { transform: translateX(-35px); opacity: 0.3; }
              }
              @keyframes firefly-hover {
                0% { transform: translate(0, 0); opacity: 0.35; }
                50% { transform: translate(14px, -18px); opacity: 0.95; }
                100% { transform: translate(0, 0); opacity: 0.35; }
              }
              .anim-carp-1 {
                animation: ${prefersReducedMotion ? 'none' : 'carp-path-1 14s ease-in-out infinite'};
              }
              .anim-carp-2 {
                animation: ${prefersReducedMotion ? 'none' : 'carp-path-2 18s ease-in-out infinite'};
              }
              .anim-tail {
                transform-origin: 0 0;
                animation: ${prefersReducedMotion ? 'none' : 'carp-tail-wag 2.2s ease-in-out infinite'};
              }
              .anim-ripple-1 {
                animation: ${prefersReducedMotion ? 'none' : 'ripple-expand 6s ease-out infinite'};
              }
              .anim-ripple-2 {
                animation: ${prefersReducedMotion ? 'none' : 'ripple-expand 6s ease-out 2s infinite'};
              }
              .anim-ripple-3 {
                animation: ${prefersReducedMotion ? 'none' : 'ripple-expand 6s ease-out 4s infinite'};
              }
              .anim-mist {
                animation: ${prefersReducedMotion ? 'none' : 'mist-float 22s ease-in-out infinite'};
              }
              .anim-firefly-1 {
                animation: ${prefersReducedMotion ? 'none' : 'firefly-hover 7s ease-in-out infinite'};
              }
              .anim-firefly-2 {
                animation: ${prefersReducedMotion ? 'none' : 'firefly-hover 9s ease-in-out 1.5s infinite'};
              }
              .anim-firefly-3 {
                animation: ${prefersReducedMotion ? 'none' : 'firefly-hover 8s ease-in-out 3s infinite'};
              }
            `}</style>
          </defs>

          {/* 1. MẶT NƯỚC HỒ SEN CHUYỂN SẮC TỰ NHIÊN (#F5F4EF -> #1B3229) */}
          <rect width="1440" height="560" fill="url(#lake-water-depth)" />
          <ellipse cx="720" cy="460" rx="680" ry="240" fill="url(#lake-deep-abyss)" />

          {/* Dải vân phản quang gợn sóng ngang mờ ảo */}
          <path
            d="M 0 160 Q 360 145, 720 160 T 1440 160"
            fill="none"
            stroke="#D9DFD9"
            strokeWidth="0.8"
            strokeOpacity="0.3"
          />
          <path
            d="M 0 240 Q 420 225, 840 240 T 1440 240"
            fill="none"
            stroke="#5E8A75"
            strokeWidth="1"
            strokeOpacity="0.25"
          />
          <path
            d="M 0 340 Q 380 325, 760 340 T 1440 340"
            fill="none"
            stroke="#5E8A75"
            strokeWidth="1.2"
            strokeOpacity="0.2"
          />

          {/* 2. CHI TIẾT CÁ CHÉP BƠI DƯỚI NƯỚC (UNDERWATER SWIMMING CARP) */}
          {/* Chú cá chép 1: Bơi lượn dưới tầng nước bán trong suốt bên trái / giữa */}
          <g
            className="anim-carp-1"
            transform="translate(360, 360)"
            opacity="0.65"
            style={{ mixBlendMode: 'screen' }}
          >
            {/* Vây ngực & vây bụng bán trong suốt */}
            <path
              d="M 28 -8 C 36 -24, 52 -28, 48 -14 C 44 -4, 34 2, 28 -8 Z"
              fill="url(#carp-fin-grad)"
            />
            <path
              d="M 28 8 C 36 24, 52 28, 48 14 C 44 4, 34 -2, 28 8 Z"
              fill="url(#carp-fin-grad)"
            />

            {/* Thân cá chép uốn lượn hình thoi thuôn dài */}
            <path
              d="M -35 0 C -25 -16, 20 -22, 50 -10 C 65 -4, 75 0, 80 0 C 75 0, 65 4, 50 10 C 20 22, -25 16, -35 0 Z"
              fill="url(#carp-body-1)"
              stroke="#E6B87A"
              strokeWidth="0.8"
              strokeOpacity="0.5"
            />

            {/* Sống lưng & vân vảy cá nhẹ nhàng */}
            <path
              d="M -20 0 C 0 -4, 35 -3, 60 0"
              stroke="#FCE39E"
              strokeWidth="1.2"
              strokeOpacity="0.4"
              fill="none"
            />
            <circle cx="68" cy="-3" r="1.8" fill="#FCE39E" fillOpacity="0.75" />

            {/* Đuôi cá chép khẽ đung đưa (Wagging tail) */}
            <g transform="translate(-35, 0)" className="anim-tail">
              <path
                d="M 0 0 C -18 -14, -36 -18, -44 -10 C -38 0, -38 0, -44 10 C -36 18, -18 14, 0 0 Z"
                fill="url(#carp-fin-grad)"
                stroke="#E6B87A"
                strokeWidth="0.6"
                strokeOpacity="0.5"
              />
            </g>
          </g>

          {/* Chú cá chép 2: Bơi uyển chuyển ở độ sâu bên phải */}
          <g
            className="anim-carp-2"
            transform="translate(1020, 420)"
            opacity="0.52"
            style={{ mixBlendMode: 'screen' }}
          >
            <path
              d="M 22 -6 C 28 -18, 42 -22, 38 -10 C 35 -2, 26 2, 22 -6 Z"
              fill="url(#carp-fin-grad)"
            />
            <path
              d="M 22 6 C 28 18, 42 22, 38 10 C 35 2, 26 -2, 22 6 Z"
              fill="url(#carp-fin-grad)"
            />
            <path
              d="M -28 0 C -20 -13, 16 -17, 40 -8 C 52 -3, 60 0, 64 0 C 60 0, 52 3, 40 8 C 16 17, -20 13, -28 0 Z"
              fill="url(#carp-body-1)"
              stroke="#E6B87A"
              strokeWidth="0.7"
              strokeOpacity="0.4"
            />
            <g transform="translate(-28, 0)" className="anim-tail">
              <path
                d="M 0 0 C -14 -11, -28 -14, -34 -8 C -30 0, -30 0, -34 8 C -28 14, -14 11, 0 0 Z"
                fill="url(#carp-fin-grad)"
              />
            </g>
          </g>

          {/* Chú cá chép 3 (Nhỏ): Bơi thoắt ẩn thoắt hiện dưới bóng lá sen */}
          <g
            transform="translate(680, 440) scale(0.68) rotate(-15)"
            opacity="0.45"
            style={{ mixBlendMode: 'screen' }}
          >
            <path
              d="M -24 0 C -16 -11, 14 -14, 34 -6 C 45 -2, 52 0, 55 0 C 52 0, 45 2, 34 6 C 14 14, -16 11, -24 0 Z"
              fill="url(#carp-body-1)"
            />
            <g transform="translate(-24, 0)" className="anim-tail">
              <path
                d="M 0 0 C -12 -9, -24 -12, -28 -6 C -25 0, -25 0, -28 6 C -24 12, -12 9, 0 0 Z"
                fill="url(#carp-fin-grad)"
              />
            </g>
          </g>

          {/* 3. VÒNG SÓNG NƯỚC ĐỒNG TÂM LAN TỎA TỪ CUỐNG SEN (RIPPLES) */}
          <g transform="translate(740, 395)">
            <ellipse
              cx="0"
              cy="0"
              rx="40"
              ry="16"
              fill="none"
              stroke="#5E8A75"
              className="anim-ripple-1"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="40"
              ry="16"
              fill="none"
              stroke="#5E8A75"
              className="anim-ripple-2"
            />
            <ellipse
              cx="0"
              cy="0"
              rx="40"
              ry="16"
              fill="none"
              stroke="#5E8A75"
              className="anim-ripple-3"
            />
          </g>

          {/* 4. TÁN LÁ SEN GIÀ XÒE RỘNG ĐỠ BÊN DƯỚI (BROAD LOTUS LEAVES) */}
          {/* Phiến lá sen lớn bên trái */}
          <g transform="translate(540, 380)">
            <path
              d="M 0 0 C 40 -20, 160 -25, 220 0 C 260 20, 240 60, 180 75 C 100 85, 20 70, -20 40 C -40 20, -20 10, 0 0 Z"
              fill="url(#grand-leaf-grad)"
              stroke="#2B4C3E"
              strokeWidth="1.5"
              strokeOpacity="0.7"
            />
            {/* Gân lá sen lan tỏa từ cuống */}
            <path
              d="M 110 32 Q 50 15, 10 5"
              stroke="#5E8A75"
              strokeWidth="0.8"
              strokeOpacity="0.45"
              fill="none"
            />
            <path
              d="M 110 32 Q 80 55, 40 65"
              stroke="#5E8A75"
              strokeWidth="0.8"
              strokeOpacity="0.45"
              fill="none"
            />
            <path
              d="M 110 32 Q 170 15, 205 10"
              stroke="#5E8A75"
              strokeWidth="0.8"
              strokeOpacity="0.45"
              fill="none"
            />
            <path
              d="M 110 32 Q 165 55, 175 70"
              stroke="#5E8A75"
              strokeWidth="0.8"
              strokeOpacity="0.45"
              fill="none"
            />
            {/* Hạt sương phản quang lấp lánh đọng trên lá sen */}
            <circle cx="95" cy="24" r="3" fill="#FFFFFF" fillOpacity="0.85" />
            <circle cx="94" cy="23" r="1" fill="#FFFFFF" />
            <circle cx="140" cy="38" r="2.2" fill="#FFFFFF" fillOpacity="0.8" />
            <circle cx="165" cy="28" r="1.6" fill="#FFFFFF" fillOpacity="0.75" />
          </g>

          {/* Phiến lá sen nghiêng bên phải */}
          <g transform="translate(820, 400)">
            <path
              d="M 0 0 C 35 -15, 130 -18, 180 5 C 210 20, 190 50, 140 60 C 80 70, 15 55, -15 30 C -25 15, -15 8, 0 0 Z"
              fill="url(#grand-leaf-grad)"
              stroke="#2B4C3E"
              strokeWidth="1.2"
              strokeOpacity="0.65"
            />
            <circle cx="75" cy="22" r="2.5" fill="#FFFFFF" fillOpacity="0.8" />
          </g>

          {/* 5. ĐÓA HOA SEN NỞ RỘ & ĐÀI SEN (GƯƠNG SEN) NGHIÊNG 35 ĐỘ */}
          <g transform="translate(740, 290)">
            {/* Cuống sen vươn từ mặt nước */}
            <path
              d="M 0 105 C 5 70, -2 35, 0 0"
              stroke="#2B4C3E"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 0 105 C 5 70, -2 35, 0 0"
              stroke="#5E8A75"
              strokeWidth="1"
              strokeDasharray="2 6"
              fill="none"
            />

            {/* Tầng cánh sen lớp sau (Hé mở đón ánh sáng ban mai) */}
            <path
              d="M 0 0 C -50 -10, -95 -50, -80 -105 C -55 -95, -25 -55, 0 0 Z"
              fill="url(#grand-lotus-outer)"
              stroke="#B85D6F"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />
            <path
              d="M 0 0 C 50 -10, 95 -50, 80 -105 C 55 -95, 25 -55, 0 0 Z"
              fill="url(#grand-lotus-outer)"
              stroke="#B85D6F"
              strokeWidth="0.8"
              strokeOpacity="0.6"
            />

            {/* Tầng cánh sen lớp giữa (Vươn cong mềm mại) */}
            <path
              d="M 0 0 C -40 -25, -65 -75, -45 -125 C -25 -100, -10 -55, 0 0 Z"
              fill="url(#grand-lotus-inner)"
              stroke="#B85D6F"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />
            <path
              d="M 0 0 C 40 -25, 65 -75, 45 -125 C 25 -100, 10 -55, 0 0 Z"
              fill="url(#grand-lotus-inner)"
              stroke="#B85D6F"
              strokeWidth="0.8"
              strokeOpacity="0.7"
            />

            {/* Cánh chính tâm vút cao */}
            <path
              d="M 0 0 C -22 -45, -20 -105, 0 -145 C 20 -105, 22 -45, 0 0 Z"
              fill="url(#grand-lotus-inner)"
              stroke="#B85D6F"
              strokeWidth="0.9"
              strokeOpacity="0.8"
            />

            {/* Cánh sen ôm đáy phía trước gập nhẹ */}
            <path
              d="M 0 0 C -35 5, -55 -25, -40 -50 C -20 -35, -5 -10, 0 0 Z"
              fill="url(#grand-lotus-outer)"
            />
            <path
              d="M 0 0 C 35 5, 55 -25, 40 -50 C 20 -35, 5 -10, 0 0 Z"
              fill="url(#grand-lotus-outer)"
            />

            {/* ĐÀI SEN / GƯƠNG SEN NGHIÊNG PHỐI CẢNH 35 ĐỘ TỰ NHIÊN */}
            {/* Khối vòm đài sen */}
            <g transform="translate(0, -32) rotate(-8)">
              {/* Thân nón gương sen */}
              <path
                d="M -24 0 C -22 18, 22 18, 24 0 C 20 -8, -20 -8, -24 0 Z"
                fill="#3E544A"
                stroke="#5E786D"
                strokeWidth="0.8"
              />

              {/* Mặt gương sen nghiêng 35 độ nhìn từ trên xuống */}
              <ellipse
                cx="0"
                cy="-4"
                rx="25"
                ry="13"
                fill="url(#lotus-pod-top)"
                stroke="#88A896"
                strokeWidth="1.2"
              />

              {/* Lỗ hạt sen tròn trịa màu ngọc bích non (7 lỗ hạt sen) */}
              <circle cx="0" cy="-4" r="2.6" fill="#1B3229" />
              <circle cx="0" cy="-4" r="1.6" fill="#A3C4B2" />
              <circle cx="0" cy="-4" r="0.6" fill="#12241D" />

              <circle cx="-12" cy="-6" r="2.2" fill="#1B3229" />
              <circle cx="-12" cy="-6" r="1.4" fill="#A3C4B2" />
              <circle cx="-12" cy="-6" r="0.5" fill="#12241D" />

              <circle cx="12" cy="-6" r="2.2" fill="#1B3229" />
              <circle cx="12" cy="-6" r="1.4" fill="#A3C4B2" />
              <circle cx="12" cy="-6" r="0.5" fill="#12241D" />

              <circle cx="-7" cy="1" r="2.2" fill="#1B3229" />
              <circle cx="-7" cy="1" r="1.4" fill="#A3C4B2" />

              <circle cx="7" cy="1" r="2.2" fill="#1B3229" />
              <circle cx="7" cy="1" r="1.4" fill="#A3C4B2" />

              <circle cx="-14" cy="0" r="1.8" fill="#1B3229" />
              <circle cx="-14" cy="0" r="1.1" fill="#A3C4B2" />

              <circle cx="14" cy="0" r="1.8" fill="#1B3229" />
              <circle cx="14" cy="0" r="1.1" fill="#A3C4B2" />

              {/* Sợi nhụy vàng óng ả bao quanh đài sen */}
              {Array.from({ length: 18 }).map((_, idx) => {
                const angle = (idx * 20 * Math.PI) / 180;
                const rx = 27;
                const ry = 15;
                const x1 = Math.cos(angle) * (rx - 2);
                const y1 = Math.sin(angle) * (ry - 2) - 4;
                const x2 = Math.cos(angle) * (rx + 5);
                const y2 = Math.sin(angle) * (ry + 3) - 4;
                return (
                  <line
                    key={idx}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#grand-stamen-gold)"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                );
              })}
            </g>
          </g>

          {/* Nụ sen non hé nở phụ bên phải */}
          <g transform="translate(940, 340)">
            <path
              d="M 0 50 C 4 30, -2 15, 0 0"
              stroke="#2B4C3E"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 0 0 C -12 -12, -15 -35, 0 -48 C 15 -35, 12 -12, 0 0 Z"
              fill="url(#grand-lotus-inner)"
              stroke="#B85D6F"
              strokeWidth="0.8"
            />
          </g>

          {/* 6. LÀN SƯƠNG MAI MỎNG BAY LƯỚT LÀ LÀ SÁT MẶT HỒ SEN */}
          <g className="anim-mist" opacity="0.35" filter="url(#mist-blur)">
            <ellipse cx="400" cy="220" rx="260" ry="25" fill="#FFFFFF" />
            <ellipse cx="980" cy="260" rx="340" ry="30" fill="#FDEEF1" />
            <ellipse cx="700" cy="360" rx="420" ry="35" fill="#FFFFFF" />
          </g>

          {/* 7. ĐỐM SÁNG TRI THỨC VÀNG NHỤY SEN (#C89738) BAY LƠ LỬNG */}
          <g filter="url(#stamen-glow)">
            {/* Đom đóm 1 */}
            <g className="anim-firefly-1" transform="translate(420, 240)">
              <circle cx="0" cy="0" r="3" fill="#C89738" />
              <circle cx="0" cy="0" r="1.2" fill="#FFF4D0" />
            </g>
            {/* Đom đóm 2 */}
            <g className="anim-firefly-2" transform="translate(680, 210)">
              <circle cx="0" cy="0" r="2.5" fill="#C89738" />
              <circle cx="0" cy="0" r="1" fill="#FFF4D0" />
            </g>
            {/* Đom đóm 3 */}
            <g className="anim-firefly-3" transform="translate(860, 260)">
              <circle cx="0" cy="0" r="3.2" fill="#C89738" />
              <circle cx="0" cy="0" r="1.3" fill="#FFF4D0" />
            </g>
            {/* Đom đóm 4 */}
            <g className="anim-firefly-1" transform="translate(1080, 230)">
              <circle cx="0" cy="0" r="2.2" fill="#C89738" />
              <circle cx="0" cy="0" r="0.9" fill="#FFF4D0" />
            </g>
            {/* Đom đóm 5 */}
            <g className="anim-firefly-2" transform="translate(260, 310)">
              <circle cx="0" cy="0" r="2.8" fill="#C89738" />
              <circle cx="0" cy="0" r="1.1" fill="#FFF4D0" />
            </g>
          </g>
        </svg>

        {/* Lớp thông điệp học thuật chìm tinh tế */}
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex flex-col items-center justify-center text-center">
          <span className="font-mono text-[11px] tracking-widest text-[#E8EFEB]/80 uppercase">
            Hồ Sen Tri Thức · Điểm Gặp Gỡ Của Trí Tuệ &amp; Tâm Hồn Sư Phạm
          </span>
        </div>
      </div>
    </section>
  );
};

export default GrandLotusLake;
