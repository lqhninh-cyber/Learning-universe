import { type FC, useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface GrandLotusLakeProps {
  readonly className?: string;
  readonly pageScrollProgress?: number;
}

/**
 * ĐẠI CẢNH "HỒ SEN TRI THỨC" (THE LIVING GRAND LOTUS LAKE — FULL-VIEWPORT BOTANICAL REALISM)
 *
 * Tiêu chuẩn thiết kế & Thực vật học (Botanical Realism & Cinematic Pond):
 * 1. Khung hình mặt hồ cố định 100%, không bị xê dịch hay nghiêng phối cảnh theo chuột (Zero mouse tilt).
 * 2. Đáy tranh hòa sắc mượt mà trực tiếp xuống nền chân trang (Footer), không có thanh chữ/badge nhân tạo.
 * 3. Không gian hồ nước thuần khiết: Đường dẫn tri thức (Knowledge Thread) kết thúc trọn vẹn ở vùng chuyển tiếp phía trên.
 * 4. Dòng nước sống động & Đa tầng không gian có chiều sâu lớn:
 *    - Nền: Gradient mềm mại từ ngà sương sớm #F5F4EF xuống xanh ngọc bích rêu sâu và sẫm tối #0B120F / #14221C ở đáy hồ.
 *    - Không có mảng đầm elip đen nhân tạo.
 *    - Làn sương mai mờ dải mỏng lướt là là sát mặt nước di chuyển cực chậm (CSS drift).
 *    - Các dải sóng mờ (ambient wave currents) lượn sóng ngang chậm rãi chu kỳ 10 - 14s.
 *    - Gợn nước phản chiếu ánh sáng lấp lánh nhẹ nhàng trên mặt hồ.
 * 5. Thảm thực vật học chân thực (Botanical Realism):
 *    - Bông sen lớn trung tâm: 100% cấu trúc thực vật học với các tầng cánh dày so le, cong tự nhiên, chuyển sắc mượt từ gốc hồng thắm (#9E384D) sang phớt hồng (#DF7B8F) và ngọn trắng ngà (#FAF0F2); viền hứng sáng mềm.
 *    - Một nụ sen phụ hé mở uốn lượn nép bên cuống cong thanh thoát.
 *    - Đài sen đã tàn (seedpod) nghiêng phối cảnh 35° tự nhiên bên phải, lộ rõ hạt sen xanh ngọc bích và nhị vàng rủ.
 *    - Các tán lá sen khổng lồ nhấp nhô lượn sóng tự nhiên với hệ gân chân vịt chi tiết và đọng giọt sương hình cầu 3D lấp lánh.
 * 6. Đàn cá chép dưới nước (4 chú cá chép sắc cam, vàng óng #D49A58 / #C45A38):
 *    - Bơi lội mềm mại dưới tầng nước bán trong suốt theo hàm sin tự nhiên (sinusoidal motion).
 *    - Độ mờ vừa phải (opacity 0.45 - 0.65) chìm dưới sắc nước tạo cảm giác đa tầng sâu thẳm.
 * 7. Hoạt cảnh sóng & gió tự nhiên:
 *    - Cánh hoa, thân sen, nụ sen và đài sen tàn đung đưa nhẹ nhàng lệch pha theo gió (chu kỳ dao động chậm 7 - 10s bằng CSS keyframes mượt mà).
 *    - Gợn nước đồng tâm nhẹ lan tỏa từ gốc hoa.
 *    - Once-only Bloom: Khi người dùng lần đầu cuộn đến, hoa sen hé nở nhẹ nhàng (scale 0.9 -> 1.0 trong 2s) đúng một lần duy nhất, sau đó giữ nguyên trạng thái tĩnh và chỉ đung đưa tự nhiên.
 * 8. Tối ưu hiệu năng: Tự động tạm dừng animation khi ngoài viewport (IntersectionObserver) và tuân thủ prefers-reduced-motion.
 */
export const GrandLotusLake: FC<GrandLotusLakeProps> = ({ className, pageScrollProgress = 0 }) => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasBloomed, setHasBloomed] = useState(false);
  const uniqueId = useId().replace(/[:]/g, '_');

  // 1. Tối ưu hiệu năng: Tạm dừng animation khi cuộn khỏi màn hình
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. Hoạt cảnh hé nở nhẹ nhàng đúng 1 lần duy nhất khi lần đầu xuất hiện (scale 0.9 -> 1.0 trong 2s)
  useEffect(() => {
    if (isVisible && !hasBloomed) {
      const timer = setTimeout(() => {
        setHasBloomed(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, hasBloomed]);

  // 3. Parallax nhẹ nhàng khi cuộn trang
  const clampedProgress = Math.max(0, Math.min(1, pageScrollProgress));
  const midParallaxY = prefersReducedMotion
    ? 0
    : Number(((clampedProgress - 0.85) * 14).toFixed(1));
  const fgParallaxY = prefersReducedMotion ? 0 : Number(((clampedProgress - 0.85) * 22).toFixed(1));

  // Tọa độ tâm điểm của bông sen chính trong đại cảnh (1440 x 580)
  const flowerCenterX = 730;
  const flowerCenterY = 280;

  return (
    <section
      ref={containerRef}
      aria-label="Đại cảnh Hồ Sen Tri Thức"
      className={cn(
        'relative w-full overflow-hidden border-t border-[#D9DFD9]/60 bg-[#0B120F] select-none',
        className,
      )}
    >
      <div className="relative h-[460px] w-full sm:h-[520px] lg:h-[580px]">
        <svg
          viewBox="0 0 1440 580"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-label="Đại cảnh Hồ Sen Tri Thức sống động"
          role="img"
        >
          <defs>
            {/* ===================================================================
                1. DẢI CHUYỂN SẮC NƯỚC HỒ HỮU CƠ & ÁNH SÁNG ĐIỆN ẢNH
                =================================================================== */}

            {/* Dải chuyển sắc loang tự nhiên: ngà sương sớm (#F5F4EF) -> xanh ngọc bích rêu sâu (#21382E) -> sẫm tối (#0B120F / #14221C) ở đáy hồ */}
            <linearGradient id={`lake-water-depth_${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5F4EF" stopOpacity="1" />
              <stop offset="14%" stopColor="#8DA89B" stopOpacity="0.88" />
              <stop offset="34%" stopColor="#436C59" stopOpacity="0.94" />
              <stop offset="58%" stopColor="#2E4F41" stopOpacity="0.98" />
              <stop offset="78%" stopColor="#21382E" stopOpacity="1" />
              <stop offset="90%" stopColor="#14221C" stopOpacity="1" />
              <stop offset="100%" stopColor="#0B120F" stopOpacity="1" />
            </linearGradient>

            {/* Vệt nắng mai xiên chếch từ góc trên bên phải (Volumetric Morning Backlight) */}
            <radialGradient id={`morning-sunbeam_${uniqueId}`} cx="85%" cy="10%" r="70%">
              <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.55" />
              <stop offset="30%" stopColor="#FCE39E" stopOpacity="0.2" />
              <stop offset="68%" stopColor="#F5F4EF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>

            {/* ===================================================================
                2. DẢI SẮC THỰC VẬT HỌC CHO BÔNG SEN, NỤ SEN & ĐÀI SEN TÀN
                =================================================================== */}

            {/* Cánh sen lớp ngoài: Hồng thắm chân cánh -> Hồng phấn -> Trắng ngà đầu cánh */}
            <linearGradient id={`lotus-outer-grad_${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#9E384D" />
              <stop offset="30%" stopColor="#B85D6F" />
              <stop offset="68%" stopColor="#DF7B8F" />
              <stop offset="92%" stopColor="#FCECEF" />
              <stop offset="100%" stopColor="#FAF0F2" />
            </linearGradient>

            {/* Cánh sen lớp giữa vươn cao đón nắng */}
            <linearGradient id={`lotus-mid-grad_${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8C2E42" />
              <stop offset="32%" stopColor="#B85D6F" />
              <stop offset="74%" stopColor="#EA95A6" />
              <stop offset="94%" stopColor="#FDF3F5" />
              <stop offset="100%" stopColor="#FAF0F2" />
            </linearGradient>

            {/* Cánh sen lớp trong ôm đài hoa */}
            <linearGradient id={`lotus-inner-grad_${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7A2234" />
              <stop offset="35%" stopColor="#B85D6F" />
              <stop offset="72%" stopColor="#F0A6B5" />
              <stop offset="92%" stopColor="#FBF2EC" />
              <stop offset="100%" stopColor="#FFF9F5" />
            </linearGradient>

            {/* Mặt gương sen nghiêng 32°: Ngọc bích non chuyển lục rêu tự nhiên */}
            <linearGradient
              id={`receptacle-surface-grad_${uniqueId}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#8DBFA6" />
              <stop offset="45%" stopColor="#6C9A84" />
              <stop offset="85%" stopColor="#4A7561" />
              <stop offset="100%" stopColor="#365E4E" />
            </linearGradient>

            {/* Thân nón gương sen đổ bóng 3D */}
            <linearGradient
              id={`receptacle-cone-grad_${uniqueId}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#4A7561" />
              <stop offset="60%" stopColor="#365E4E" />
              <stop offset="100%" stopColor="#203E31" />
            </linearGradient>

            {/* Sợi nhị hoa vàng óng rủ nhẹ */}
            <linearGradient
              id={`stamen-filament-grad_${uniqueId}`}
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#C89738" />
              <stop offset="55%" stopColor="#E5B84A" />
              <stop offset="100%" stopColor="#FFF0A8" />
            </linearGradient>

            {/* Thân sen thanh mảnh uốn lượn hình trụ tròn */}
            <linearGradient id={`stem-cylinder-grad_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E372A" />
              <stop offset="35%" stopColor="#365E4E" />
              <stop offset="70%" stopColor="#5E8A75" />
              <stop offset="100%" stopColor="#254337" />
            </linearGradient>

            {/* Nụ sen phụ hé mở dạng tháp xoắn */}
            <linearGradient id={`lotus-bud-grad_${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#365E4E" />
              <stop offset="30%" stopColor="#5E8A75" />
              <stop offset="65%" stopColor="#C45E72" />
              <stop offset="100%" stopColor="#9E384D" />
            </linearGradient>

            {/* Phiến lá sen tự nhiên (Peltate Leaf) */}
            <radialGradient id={`leaf-pad-grad_${uniqueId}`} cx="48%" cy="48%" r="52%">
              <stop offset="0%" stopColor="#4A7561" />
              <stop offset="55%" stopColor="#365E4E" />
              <stop offset="85%" stopColor="#254337" />
              <stop offset="100%" stopColor="#1B3229" />
            </radialGradient>

            {/* Giọt sương mai hình cầu nổi khối 3D */}
            <radialGradient id={`dew-drop-grad_${uniqueId}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#E8F4F0" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#365E4E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1B3229" stopOpacity="0.8" />
            </radialGradient>

            {/* Sắc chuyển cá chép bơi ngầm (#C45A38 / #D49A58 / #E6B87A) */}
            <linearGradient id={`carp-body_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="60%">
              <stop offset="0%" stopColor="#C45A38" stopOpacity="0.92" />
              <stop offset="50%" stopColor="#D49A58" stopOpacity="0.84" />
              <stop offset="100%" stopColor="#E6B87A" stopOpacity="0.68" />
            </linearGradient>

            <linearGradient id={`carp-fin-grad_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6B87A" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#D49A58" stopOpacity="0.3" />
            </linearGradient>

            {/* Bộ lọc sương mai mềm và vầng sáng đốm phấn hoa */}
            <filter id={`mist-soft-blur_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="11" />
            </filter>

            <filter id={`pollen-glow_${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* ===================================================================
                3. HỆ THỐNG KEYFRAMES CHUYỂN ĐỘNG TỰ NHIÊN (7 - 10s & 10 - 14s)
                =================================================================== */}
            <style>{`
              /* 1. Hoạt cảnh hoa hé nở nhẹ nhàng (scale 0.9 -> 1.0 trong 2s) đúng một lần duy nhất */
              @keyframes lotus-entrance-bloom_${uniqueId} {
                0% {
                  transform: scale(0.9) translateY(14px);
                  opacity: 0.82;
                }
                100% {
                  transform: scale(1) translateY(0);
                  opacity: 1;
                }
              }

              /* 2. Bông sen và thân cây đung đưa rất nhẹ nhàng theo gió (chu kỳ chậm 8.5s lệch pha) */
              @keyframes lotus-breeze-sway_${uniqueId} {
                0%, 100% {
                  transform: rotate(0deg);
                }
                38% {
                  transform: rotate(1.2deg);
                }
                72% {
                  transform: rotate(-0.9deg);
                }
              }

              /* 3. Cánh sen tầng ngoài trái dao động độc lập (chu kỳ 7.2s) */
              @keyframes petal-flutter-left_${uniqueId} {
                0%, 100% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(1.4deg) scale(1.008); }
              }

              /* 4. Cánh sen tầng ngoài phải dao động độc lập (chu kỳ 9.0s) */
              @keyframes petal-flutter-right_${uniqueId} {
                0%, 100% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(-1.2deg) scale(1.008); }
              }

              /* 5. Cánh sen tầng giữa vươn nhịp thở tự nhiên (chu kỳ 7.8s) */
              @keyframes petal-flutter-mid_${uniqueId} {
                0%, 100% { transform: rotate(0deg); }
                50% { transform: rotate(0.85deg); }
              }

              /* 6. Nụ sen phụ uốn lượn đung đưa nhẹ (chu kỳ 8.0s) */
              @keyframes lotus-bud-sway_${uniqueId} {
                0%, 100% { transform: rotate(0deg); }
                42% { transform: rotate(-1.4deg); }
                78% { transform: rotate(1deg); }
              }

              /* 7. Đài sen đã tàn nghiêng phối cảnh 35° đung đưa nhẹ (chu kỳ 7.5s) */
              @keyframes seedpod-sway_${uniqueId} {
                0%, 100% { transform: rotate(0deg); }
                40% { transform: rotate(1.3deg); }
                75% { transform: rotate(-0.9deg); }
              }

              /* 8. Dòng nước chuyển động: Các dải sóng mờ lượn sóng ngang chậm rãi chu kỳ 10 - 14s */
              @keyframes water-current-drift-1_${uniqueId} {
                0% { transform: translateX(0); }
                50% { transform: translateX(-65px); }
                100% { transform: translateX(0); }
              }

              @keyframes water-current-drift-2_${uniqueId} {
                0% { transform: translateX(-45px); }
                50% { transform: translateX(35px); }
                100% { transform: translateX(-45px); }
              }

              @keyframes water-current-drift-3_${uniqueId} {
                0% { transform: translateX(25px); }
                50% { transform: translateX(-40px); }
                100% { transform: translateX(25px); }
              }

              /* 9. Gợn nước phản chiếu ánh sáng lấp lánh nhẹ nhàng trên mặt hồ (chu kỳ 5.5s) */
              @keyframes water-shimmer_${uniqueId} {
                0%, 100% { opacity: 0.18; transform: scaleX(0.96); }
                50% { opacity: 0.52; transform: scaleX(1.05); }
              }

              /* 10. Sóng nước đồng tâm lan tỏa quanh cuống sen (chu kỳ 6.5s) */
              @keyframes water-ripple-radiate_${uniqueId} {
                0% {
                  r: 10px;
                  opacity: 0.65;
                  stroke-width: 1.6px;
                }
                45% {
                  opacity: 0.3;
                  stroke-width: 1px;
                }
                100% {
                  r: 135px;
                  opacity: 0;
                  stroke-width: 0.25px;
                }
              }

              /* 11. Lá sen khổng lồ bập bềnh nhấp nhô lượn sóng tự nhiên (chu kỳ 8.2s) */
              @keyframes leaf-pad-bob_${uniqueId} {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(4.2px) rotate(0.8deg); }
              }

              /* 12. Làn sương mai hậu cảnh lướt cực chậm sát mặt nước */
              @keyframes morning-mist-drift_${uniqueId} {
                0% { transform: translateX(-45px); opacity: 0.22; }
                50% { transform: translateX(45px); opacity: 0.42; }
                100% { transform: translateX(-45px); opacity: 0.22; }
              }

              /* 13. Đàn cá chép bơi lội mềm mại dưới nước theo hàm sin tự nhiên */
              @keyframes carp-swim-path-1_${uniqueId} {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(45px, -12px) rotate(3deg); }
                50% { transform: translate(90px, 0px) rotate(0deg); }
                75% { transform: translate(45px, 14px) rotate(-4deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }

              @keyframes carp-swim-path-2_${uniqueId} {
                0% { transform: translate(0, 0) rotate(0deg); }
                30% { transform: translate(-42px, 11px) rotate(-3deg); }
                65% { transform: translate(-82px, -8px) rotate(2.5deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }

              @keyframes carp-tail-wag_${uniqueId} {
                0%, 100% { transform: rotate(-7deg); }
                50% { transform: rotate(8deg); }
              }

              /* 14. Đốm phấn hoa lơ lửng */
              @keyframes pollen-spore-float_${uniqueId} {
                0% { transform: translate(0, 0); opacity: 0.3; }
                50% { transform: translate(14px, -20px); opacity: 0.9; }
                100% { transform: translate(0, 0); opacity: 0.3; }
              }

              /* Gán các class animation */
              .anim-lotus-flower_${uniqueId} {
                transform-origin: ${flowerCenterX}px ${flowerCenterY + 145}px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `lotus-breeze-sway_${uniqueId} 8.5s ease-in-out infinite`
                };
              }

              .anim-petal-left_${uniqueId} {
                transform-origin: 0px 0px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `petal-flutter-left_${uniqueId} 7.2s ease-in-out infinite`
                };
              }

              .anim-petal-right_${uniqueId} {
                transform-origin: 0px 0px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `petal-flutter-right_${uniqueId} 9.0s ease-in-out 1.2s infinite`
                };
              }

              .anim-petal-mid_${uniqueId} {
                transform-origin: 0px 0px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `petal-flutter-mid_${uniqueId} 7.8s ease-in-out 0.6s infinite`
                };
              }

              .anim-bud-sway_${uniqueId} {
                transform-origin: 0px 100px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `lotus-bud-sway_${uniqueId} 8.0s ease-in-out 2s infinite`
                };
              }

              .anim-seedpod-sway_${uniqueId} {
                transform-origin: 0px 135px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `seedpod-sway_${uniqueId} 7.5s ease-in-out 1.5s infinite`
                };
              }

              .anim-current-1_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-current-drift-1_${uniqueId} 11.5s ease-in-out infinite`
                };
              }

              .anim-current-2_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-current-drift-2_${uniqueId} 13.8s ease-in-out 1.5s infinite`
                };
              }

              .anim-current-3_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-current-drift-3_${uniqueId} 12.2s ease-in-out 2.5s infinite`
                };
              }

              .anim-shimmer_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-shimmer_${uniqueId} 5.5s ease-in-out infinite`
                };
              }

              .anim-ripple-1_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-ripple-radiate_${uniqueId} 6.5s ease-out infinite`
                };
              }

              .anim-ripple-2_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-ripple-radiate_${uniqueId} 6.5s ease-out 2.2s infinite`
                };
              }

              .anim-ripple-3_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-ripple-radiate_${uniqueId} 6.5s ease-out 4.4s infinite`
                };
              }

              .anim-leaf-bob_${uniqueId} {
                transform-origin: 280px 390px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `leaf-pad-bob_${uniqueId} 8.2s ease-in-out infinite`
                };
              }

              .anim-mist-drift_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `morning-mist-drift_${uniqueId} 28s ease-in-out infinite`
                };
              }

              .anim-carp-1_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `carp-swim-path-1_${uniqueId} 13.5s ease-in-out infinite`
                };
              }

              .anim-carp-2_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `carp-swim-path-2_${uniqueId} 17.5s ease-in-out infinite`
                };
              }

              .anim-tail_${uniqueId} {
                transform-origin: 0px 0px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `carp-tail-wag_${uniqueId} 2.2s ease-in-out infinite`
                };
              }

              .anim-pollen-1_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `pollen-spore-float_${uniqueId} 6.5s ease-in-out infinite`
                };
              }

              .anim-pollen-2_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `pollen-spore-float_${uniqueId} 8.2s ease-in-out 2s infinite`
                };
              }
            `}</style>
          </defs>

          {/* ===================================================================
              4. TẦNG HẬU CẢNH: MẶT NƯỚC SÂU THẲM, DÒNG NƯỚC LƯỢN SÓNG VÀ NẮNG MAI
              (Neo cố định 100%, không bị xê dịch hay nghiêng phối cảnh)
              =================================================================== */}
          <g>
            {/* Mặt nước hồ sen chuyển sắc hữu cơ (#F5F4EF -> #21382E -> #0B120F) */}
            <rect width="1440" height="580" fill={`url(#lake-water-depth_${uniqueId})`} />

            {/* Nắng mai rọi xiên dịu dàng từ góc cao (Cinematic Morning Backlight) */}
            <rect width="1440" height="580" fill={`url(#morning-sunbeam_${uniqueId})`} />

            {/* HIỆU ỨNG DÒNG NƯỚC CHUYỂN ĐỘNG: Các dải sóng mờ (ambient wave currents) lượn sóng ngang chu kỳ 10 - 14s */}
            <g fill="none">
              {/* Dải sóng 1: Tầng nước trên (chu kỳ 11.5s) */}
              <g
                className={`anim-current-1_${uniqueId}`}
                stroke="#8DA89B"
                strokeWidth="1.2"
                strokeOpacity="0.28"
              >
                <path d="M -120 185 Q 240 165, 600 185 T 1320 185 T 1980 185" />
                <path d="M -80 215 Q 280 195, 640 215 T 1360 215 T 2020 215" strokeOpacity="0.18" />
              </g>

              {/* Dải sóng 2: Tầng nước giữa (chu kỳ 13.8s) */}
              <g
                className={`anim-current-2_${uniqueId}`}
                stroke="#5E8A75"
                strokeWidth="1.4"
                strokeOpacity="0.24"
              >
                <path d="M -150 275 Q 210 250, 570 275 T 1290 275 T 1950 275" />
                <path
                  d="M -100 310 Q 260 285, 620 310 T 1340 310 T 2000 310"
                  strokeOpacity="0.16"
                />
              </g>

              {/* Dải sóng 3: Tầng nước sâu (chu kỳ 12.2s) */}
              <g
                className={`anim-current-3_${uniqueId}`}
                stroke="#436C59"
                strokeWidth="1.6"
                strokeOpacity="0.22"
              >
                <path d="M -130 380 Q 230 355, 590 380 T 1310 380 T 1970 380" />
                <path d="M -90 425 Q 270 400, 630 425 T 1350 425 T 2010 425" strokeOpacity="0.14" />
              </g>
            </g>

            {/* GỢN NƯỚC PHẢN CHIẾU ÁNH SÁNG LẤP LÁNH NHẸ NHÀNG TRÊN MẶT HỒ */}
            <g className={`anim-shimmer_${uniqueId}`} fill="#FFFDF0" opacity="0.35">
              <ellipse cx="620" cy="220" rx="36" ry="1.4" />
              <ellipse cx="880" cy="245" rx="48" ry="1.6" fill="#FCE39E" />
              <ellipse cx="450" cy="290" rx="42" ry="1.5" />
              <ellipse cx="980" cy="315" rx="54" ry="1.8" />
              <ellipse cx="730" cy="360" rx="46" ry="1.6" fill="#FCE39E" />
              <ellipse cx="1120" cy="385" rx="38" ry="1.4" />
              <ellipse cx="540" cy="420" rx="34" ry="1.3" />
            </g>

            {/* LÀN SƯƠNG MAI HẬU CẢNH: Lướt cực chậm sát mặt nước */}
            <g
              className={`anim-mist-drift_${uniqueId}`}
              filter={`url(#mist-soft-blur_${uniqueId})`}
            >
              <ellipse cx="380" cy="210" rx="340" ry="26" fill="#FFFFFF" opacity="0.26" />
              <ellipse cx="980" cy="245" rx="380" ry="30" fill="#FDEEF1" opacity="0.24" />
              <ellipse cx="700" cy="350" rx="440" ry="34" fill="#FAF9F6" opacity="0.25" />
            </g>
          </g>

          {/* ===================================================================
              5. TẦNG CÁ CHÉP BƠI NGẦM DƯỚI NƯỚC (UNDERWATER CARPS - 4 CHÚ CÁ CHÉP)
              (Sắc cam, vàng óng #D49A58 / #C45A38, bơi lội mềm mại theo hàm sin)
              =================================================================== */}
          <g opacity="0.58">
            {/* Chú cá 1 (Cá lớn): Bơi uốn lượn dưới tán lá trái */}
            <g transform="translate(440, 420)" className={`anim-carp-1_${uniqueId}`}>
              <path
                d="M -38 0 C -26 -13, 20 -15, 44 0 C 20 15, -26 13, -38 0 Z"
                fill={`url(#carp-body_${uniqueId})`}
              />
              <path d="M 6 -5 C 20 -20, 32 -13, 20 -2 Z" fill={`url(#carp-fin-grad_${uniqueId})`} />
              <path d="M 6 5 C 20 20, 32 13, 20 2 Z" fill={`url(#carp-fin-grad_${uniqueId})`} />
              <g transform="translate(-38, 0)" className={`anim-tail_${uniqueId}`}>
                <path
                  d="M 0 0 C -16 -15, -30 -2, -40 -11 C -32 4, -32 11, -40 18 C -27 9, -16 15, 0 0 Z"
                  fill={`url(#carp-body_${uniqueId})`}
                />
              </g>
            </g>

            {/* Chú cá 2: Sắc cam đất bơi nhẹ gần chân hoa sen */}
            <g transform="translate(980, 430)" className={`anim-carp-2_${uniqueId}`}>
              <path
                d="M -32 0 C -22 -11, 18 -12, 38 0 C 18 12, -22 11, -32 0 Z"
                fill={`url(#carp-body_${uniqueId})`}
              />
              <path d="M 5 -4 C 16 -16, 26 -10, 16 -2 Z" fill={`url(#carp-fin-grad_${uniqueId})`} />
              <path d="M 5 4 C 16 16, 26 10, 16 2 Z" fill={`url(#carp-fin-grad_${uniqueId})`} />
              <g transform="translate(-32, 0)" className={`anim-tail_${uniqueId}`}>
                <path
                  d="M 0 0 C -13 -12, -24 0, -32 -8 C -26 3, -26 8, -32 14 C -22 7, -13 12, 0 0 Z"
                  fill={`url(#carp-body_${uniqueId})`}
                />
              </g>
            </g>

            {/* Chú cá 3: Cá nhỏ ở tầng nước sâu hơn */}
            <g
              transform="translate(700, 490) scale(0.68)"
              opacity="0.6"
              className={`anim-carp-1_${uniqueId}`}
            >
              <path
                d="M -26 0 C -17 -9, 15 -10, 30 0 C 15 10, -17 9, -26 0 Z"
                fill={`url(#carp-body_${uniqueId})`}
              />
              <g transform="translate(-26, 0)" className={`anim-tail_${uniqueId}`}>
                <path
                  d="M 0 0 C -11 -10, -20 0, -27 -7 C -22 3, -22 7, -27 12 C -18 6, -11 10, 0 0 Z"
                  fill={`url(#carp-body_${uniqueId})`}
                />
              </g>
            </g>

            {/* Chú cá 4: Cá con lượn nhẹ gần đài sen tàn */}
            <g
              transform="translate(1160, 470) scale(0.58)"
              opacity="0.52"
              className={`anim-carp-2_${uniqueId}`}
            >
              <path
                d="M -24 0 C -16 -8, 14 -9, 28 0 C 14 9, -16 8, -24 0 Z"
                fill={`url(#carp-body_${uniqueId})`}
              />
              <g transform="translate(-24, 0)" className={`anim-tail_${uniqueId}`}>
                <path
                  d="M 0 0 C -10 -9, -18 0, -25 -6 C -20 3, -20 6, -25 11 C -16 5, -10 9, 0 0 Z"
                  fill={`url(#carp-body_${uniqueId})`}
                />
              </g>
            </g>
          </g>

          {/* ===================================================================
              6. TẦNG TRUNG CẢNH: BÔNG SEN CHÍNH, NỤ SEN PHỤ, ĐÀI SEN TÀN (SEEDPOD)
              =================================================================== */}
          <g transform={`translate(0, ${midParallaxY})`}>
            {/* Vòng sóng nước đồng tâm lan tỏa tự nhiên quanh gốc cuống sen */}
            <g
              transform={`translate(${flowerCenterX}, ${flowerCenterY + 145})`}
              stroke="#C89738"
              fill="none"
            >
              <ellipse
                cx="0"
                cy="0"
                rx="28"
                ry="9"
                className={`anim-ripple-1_${uniqueId}`}
                stroke="#C89738"
                strokeOpacity="0.5"
              />
              <ellipse
                cx="0"
                cy="0"
                rx="28"
                ry="9"
                className={`anim-ripple-2_${uniqueId}`}
                stroke="#8FA89B"
                strokeOpacity="0.4"
              />
              <ellipse
                cx="0"
                cy="0"
                rx="28"
                ry="9"
                className={`anim-ripple-3_${uniqueId}`}
                stroke="#D9DFD9"
                strokeOpacity="0.3"
              />
            </g>

            {/* Bóng phản chiếu mềm của đóa sen dưới làn nước */}
            <g
              transform={`translate(${flowerCenterX}, ${flowerCenterY + 160}) scale(1, -0.3)`}
              opacity="0.18"
              filter={`url(#mist-soft-blur_${uniqueId})`}
            >
              <ellipse cx="0" cy="0" rx="95" ry="75" fill="#B85D6F" />
              <ellipse cx="0" cy="-22" rx="42" ry="26" fill="#C89738" />
            </g>

            {/* A. NỤ SEN PHỤ HÉ MỞ UỐN LƯỢN NÉP BÊN PHẢI HOA CHÍNH */}
            <g
              transform={`translate(${flowerCenterX + 160}, ${flowerCenterY + 45})`}
              className={`anim-bud-sway_${uniqueId}`}
            >
              <path
                d="M 0 100 C -8 65, 12 32, 0 0"
                stroke={`url(#stem-cylinder-grad_${uniqueId})`}
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="2" cy="48" r="0.8" fill="#1B3229" />
              <circle cx="-3" cy="26" r="0.8" fill="#1B3229" />

              <path
                d="M 0 0 C -15 -14, -19 -38, 0 -62 C 19 -38, 15 -14, 0 0 Z"
                fill={`url(#lotus-bud-grad_${uniqueId})`}
                stroke="#B85D6F"
                strokeWidth="0.8"
              />
              <path
                d="M -2 0 C -8 -16, -12 -40, 0 -62 C 2 -42, 2 -22, -2 0 Z"
                fill="#5E8A75"
                opacity="0.65"
              />
              <path d="M 0 -45 C -4 -52, -2 -60, 0 -62 C 2 -60, 4 -52, 0 -45 Z" fill="#9E384D" />
            </g>

            {/* B. ĐÀI SEN ĐÃ TÀN (SEEDPOD) NGHIÊNG PHỐI CẢNH 35° TỰ NHIÊN BÊN PHẢI */}
            <g
              transform={`translate(${flowerCenterX + 320}, ${flowerCenterY + 60})`}
              className={`anim-seedpod-sway_${uniqueId}`}
            >
              {/* Cuống đài sen tàn vươn cao uốn cong */}
              <path
                d="M 0 135 C -12 90, 14 45, 0 0"
                stroke={`url(#stem-cylinder-grad_${uniqueId})`}
                strokeWidth="4.6"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="2.5" cy="95" r="0.8" fill="#1B3229" />
              <circle cx="-2" cy="55" r="0.8" fill="#1B3229" />
              <circle cx="2" cy="25" r="0.75" fill="#1B3229" />

              {/* Khối đài sen nón cụt nghiêng 35° để lộ hạt sen xanh ngọc bích */}
              <g transform="rotate(35)">
                {/* Thân nón cụt đổ bóng 3D */}
                <path
                  d="M -28 0 C -26 24, 26 24, 28 0 C 24 -8, -24 -8, -28 0 Z"
                  fill={`url(#receptacle-cone-grad_${uniqueId})`}
                  stroke="#254337"
                  strokeWidth="0.9"
                />

                {/* Mặt đài sen phối cảnh nghiêng để lộ các hốc hạt */}
                <ellipse
                  cx="0"
                  cy="-4"
                  rx="30"
                  ry="15"
                  fill={`url(#receptacle-surface-grad_${uniqueId})`}
                  stroke="#8DBFA6"
                  strokeWidth="1.3"
                />

                {/* Các hạt sen xanh ngọc bích non nhô lên khỏi hốc hạt */}
                {[
                  { x: 0, y: -4, r: 2.7 },
                  { x: -13, y: -7, r: 2.2 },
                  { x: 13, y: -7, r: 2.2 },
                  { x: -8, y: 1, r: 2.3 },
                  { x: 8, y: 1, r: 2.3 },
                  { x: -17, y: 0, r: 1.9 },
                  { x: 17, y: 0, r: 1.9 },
                  { x: -5, y: -10, r: 2.0 },
                  { x: 5, y: -10, r: 2.0 },
                  { x: 21, y: -5, r: 1.7 },
                  { x: -21, y: -5, r: 1.7 },
                  { x: 0, y: 5, r: 2.1 },
                  { x: 0, y: -11, r: 1.9 },
                ].map((pit, idx) => (
                  <g key={`mature-seed-pit-${idx}`}>
                    <circle cx={pit.x} cy={pit.y} r={pit.r} fill="#1B3229" />
                    <circle cx={pit.x} cy={pit.y} r={pit.r * 0.7} fill="#A8D4BC" />
                    <circle cx={pit.x} cy={pit.y} r={pit.r * 0.28} fill="#14221C" />
                  </g>
                ))}

                {/* Vành nhụy vàng đã rụng bao phấn rủ nhẹ xuống chân đài sen */}
                {Array.from({ length: 24 }).map((_, idx) => {
                  const angle = (idx * 15 * Math.PI) / 180;
                  const rx = 31;
                  const ry = 16;
                  const x1 = Math.cos(angle) * rx;
                  const y1 = Math.sin(angle) * ry - 4;
                  const x2 = Math.cos(angle) * (rx + 4);
                  const y2 = Math.sin(angle) * (ry + 8) - 2;
                  return (
                    <line
                      key={`withered-filament-${idx}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="#C89738"
                      strokeWidth="0.9"
                      strokeOpacity="0.75"
                      strokeLinecap="round"
                    />
                  );
                })}
              </g>
            </g>

            {/* C. BÔNG SEN LỚN TRUNG TÂM (CENTRAL LIVING LOTUS)
                Đạt 100% cấu trúc thực vật học, đung đưa rất nhẹ nhàng theo gió (chu kỳ 8.5s) */}
            <g
              className={`anim-lotus-flower_${uniqueId}`}
              style={{
                animationName: hasBloomed ? undefined : `lotus-entrance-bloom_${uniqueId}`,
                animationDuration: '2.0s',
                animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                animationFillMode: 'forwards',
              }}
            >
              {/* Thân sen mảnh mai, uốn cong chữ S tự nhiên, có độ đàn hồi và gai nhám */}
              <g transform={`translate(${flowerCenterX}, ${flowerCenterY})`}>
                <path
                  d="M 0 148 C 11 98, -8 46, 0 0"
                  stroke={`url(#stem-cylinder-grad_${uniqueId})`}
                  strokeWidth="5.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 1 148 C 12 98, -7 46, 1 0"
                  stroke="#8FA89B"
                  strokeWidth="1.1"
                  strokeDasharray="3 7"
                  fill="none"
                  opacity="0.75"
                />
                <circle cx="2.5" cy="118" r="0.8" fill="#1B3229" />
                <circle cx="-1.5" cy="88" r="0.8" fill="#1B3229" />
                <circle cx="3" cy="56" r="0.75" fill="#1B3229" />
                <circle cx="-2" cy="26" r="0.75" fill="#1B3229" />
              </g>

              {/* Vòm cánh sen đa tầng so le dày dặn & Gương sen nhụy hoa */}
              <g transform={`translate(${flowerCenterX}, ${flowerCenterY})`}>
                {/* TẦNG CÁNH SAU CÙNG (DEEP BACK PETALS — TẠO ĐỘ DÀY ĐẶN CHO ĐÓA HOA) */}
                <g opacity="0.95">
                  <path
                    d="M 0 0 C -42 -40, -102 -75, -96 -138 C -65 -132, -28 -75, 0 0 Z"
                    fill={`url(#lotus-outer-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.7"
                    strokeOpacity="0.65"
                  />
                  <path
                    d="M 0 0 C 38 -45, 108 -70, 104 -142 C 72 -132, 30 -75, 0 0 Z"
                    fill={`url(#lotus-outer-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.7"
                    strokeOpacity="0.65"
                  />
                  <path
                    d="M 0 0 C -22 -65, -20 -145, 0 -185 C 20 -145, 22 -65, 0 0 Z"
                    fill={`url(#lotus-mid-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.75"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M -10 -155 C -3 -178, 0 -185, 0 -185 C 0 -185, 3 -178, 10 -155"
                    stroke="#FFFFFF"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.8"
                  />
                </g>

                {/* TẦNG CÁNH NGOÀI BÈ RỘNG, BẤT ĐỐI XỨNG TỰ NHIÊN */}
                <g className={`anim-petal-left_${uniqueId}`}>
                  <path
                    d="M 0 0 C -52 -18, -128 -38, -130 -98 C -102 -116, -48 -70, 0 0 Z"
                    fill={`url(#lotus-outer-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.8"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M 0 0 C -38 -22, -82 -50, -126 -97"
                    stroke="#B85D6F"
                    strokeWidth="0.6"
                    strokeOpacity="0.45"
                    fill="none"
                  />
                  <path
                    d="M -130 -98 C -102 -116, -48 -70, 0 0"
                    stroke="#FFF5F7"
                    strokeWidth="0.8"
                    strokeOpacity="0.85"
                    fill="none"
                  />
                </g>

                <g className={`anim-petal-right_${uniqueId}`}>
                  <path
                    d="M 0 0 C 48 -20, 132 -36, 126 -102 C 94 -120, 48 -74, 0 0 Z"
                    fill={`url(#lotus-outer-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.8"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M 0 0 C 40 -24, 82 -52, 122 -101"
                    stroke="#B85D6F"
                    strokeWidth="0.6"
                    strokeOpacity="0.45"
                    fill="none"
                  />
                  <path
                    d="M 126 -102 C 94 -120, 48 -74, 0 0"
                    stroke="#FFF5F7"
                    strokeWidth="0.8"
                    strokeOpacity="0.85"
                    fill="none"
                  />
                </g>

                {/* TẦNG CÁNH GIỮA (VƯƠN CAO KIÊU HÃNH, ÔM NHẸ) */}
                <g className={`anim-petal-mid_${uniqueId}`}>
                  <path
                    d="M 0 0 C -46 -34, -84 -86, -68 -144 C -40 -124, -16 -68, 0 0 Z"
                    fill={`url(#lotus-mid-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.8"
                    strokeOpacity="0.75"
                  />
                  <path
                    d="M 0 0 C -32 -40, -56 -86, -67 -143"
                    stroke="#9E384D"
                    strokeWidth="0.6"
                    strokeOpacity="0.4"
                    fill="none"
                  />
                  <path
                    d="M -68 -144 C -40 -124, -16 -68, 0 0"
                    stroke="#FFF8F9"
                    strokeWidth="0.75"
                    strokeOpacity="0.8"
                    fill="none"
                  />
                </g>

                <g className={`anim-petal-mid_${uniqueId}`}>
                  <path
                    d="M 0 0 C 50 -35, 86 -84, 72 -146 C 42 -126, 18 -68, 0 0 Z"
                    fill={`url(#lotus-mid-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.8"
                    strokeOpacity="0.75"
                  />
                  <path
                    d="M 0 0 C 35 -40, 60 -88, 71 -145"
                    stroke="#9E384D"
                    strokeWidth="0.6"
                    strokeOpacity="0.4"
                    fill="none"
                  />
                  <path
                    d="M 72 -146 C 42 -126, 18 -68, 0 0"
                    stroke="#FFF8F9"
                    strokeWidth="0.75"
                    strokeOpacity="0.8"
                    fill="none"
                  />
                </g>

                {/* Cánh trung tâm vút cao */}
                <path
                  d="M 0 0 C -26 -56, -24 -128, 0 -170 C 24 -128, 26 -56, 0 0 Z"
                  fill={`url(#lotus-inner-grad_${uniqueId})`}
                  stroke="#B85D6F"
                  strokeWidth="0.85"
                  strokeOpacity="0.8"
                />
                <path
                  d="M 0 0 L 0 -168"
                  stroke="#C45E72"
                  strokeWidth="0.65"
                  strokeOpacity="0.5"
                  fill="none"
                />
                <path
                  d="M -12 -142 C -4 -162, 0 -170, 0 -170 C 0 -170, 4 -162, 12 -142"
                  stroke="#FFFFFF"
                  strokeWidth="1"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Cánh trước xếp so le ôm lấy chân hoa */}
                <path
                  d="M 0 0 C -48 8, -68 -24, -50 -56 C -26 -38, -8 -12, 0 0 Z"
                  fill={`url(#lotus-outer-grad_${uniqueId})`}
                  stroke="#B85D6F"
                  strokeWidth="0.75"
                />
                <path
                  d="M 0 0 C 48 8, 68 -24, 50 -56 C 26 -38, 8 -12, 0 0 Z"
                  fill={`url(#lotus-outer-grad_${uniqueId})`}
                  stroke="#B85D6F"
                  strokeWidth="0.75"
                />

                {/* GƯƠNG SEN & NHỤY HOA BOTANICAL THỰC VẬT CHÂN THỰC
                    (Gương sen nghiêng 32° tự nhiên + 13 lỗ hạt Fibonacci + 36 sợi nhị vàng rủ nhẹ) */}
                <g transform="translate(0, -36) rotate(-6)">
                  <path
                    d="M -30 0 C -28 24, 28 24, 30 0 C 26 -10, -26 -10, -30 0 Z"
                    fill={`url(#receptacle-cone-grad_${uniqueId})`}
                    stroke="#254337"
                    strokeWidth="0.8"
                  />

                  <ellipse
                    cx="0"
                    cy="-4"
                    rx="32"
                    ry="16"
                    fill={`url(#receptacle-surface-grad_${uniqueId})`}
                    stroke="#8DBFA6"
                    strokeWidth="1.3"
                  />

                  {[
                    { x: 0, y: -4, r: 2.8 },
                    { x: -14, y: -7, r: 2.3 },
                    { x: 14, y: -7, r: 2.3 },
                    { x: -8, y: 1, r: 2.4 },
                    { x: 8, y: 1, r: 2.4 },
                    { x: -18, y: 0, r: 2.0 },
                    { x: 18, y: 0, r: 2.0 },
                    { x: -6, y: -10, r: 2.1 },
                    { x: 6, y: -10, r: 2.1 },
                    { x: 22, y: -5, r: 1.8 },
                    { x: -22, y: -5, r: 1.8 },
                    { x: 0, y: 5, r: 2.2 },
                    { x: 0, y: -11, r: 2.0 },
                  ].map((pit, idx) => (
                    <g key={`seed-pit-${idx}`}>
                      <circle cx={pit.x} cy={pit.y} r={pit.r} fill="#1B3229" />
                      <circle cx={pit.x} cy={pit.y} r={pit.r * 0.65} fill="#A8D4BC" />
                      <circle cx={pit.x} cy={pit.y} r={pit.r * 0.25} fill="#16261E" />
                    </g>
                  ))}

                  {/* Vành 36 sợi nhị hoa vàng óng rủ nhẹ tự nhiên quanh gương sen */}
                  {Array.from({ length: 36 }).map((_, idx) => {
                    const angle = (idx * 10 * Math.PI) / 180;
                    const rx = 34;
                    const ry = 18;
                    const lengthOffset = (idx % 3) * 2;
                    const droopOffset = Math.sin(angle) > 0 ? 2 : 0;
                    const x1 = Math.cos(angle) * (rx - 2);
                    const y1 = Math.sin(angle) * (ry - 2) - 4;
                    const x2 = Math.cos(angle) * (rx + 6 + lengthOffset);
                    const y2 = Math.sin(angle) * (ry + 4 + lengthOffset + droopOffset) - 4;
                    return (
                      <g key={`stamen-filament-${idx}`}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={`url(#stamen-filament-grad_${uniqueId})`}
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                        <circle
                          cx={x2}
                          cy={y2}
                          r="1.4"
                          fill="#FFF0A8"
                          stroke="#C89738"
                          strokeWidth="0.5"
                        />
                      </g>
                    );
                  })}
                </g>
              </g>
            </g>
          </g>

          {/* ===================================================================
              7. TẦNG TIỀN CẢNH: CÁC TÁN LÁ SEN KHỔNG LỒ & GIỌT SƯƠNG MAI 3D LẤP LÁNH
              =================================================================== */}
          <g transform={`translate(0, ${fgParallaxY})`}>
            {/* Tán lá sen khổng lồ bên trái với gân lá chân vịt (Peltate Leaf) */}
            <g className={`anim-leaf-bob_${uniqueId}`} transform="translate(280, 400)">
              <path
                d="M 0 0 C -85 -32, -185 20, -162 82 C -136 136, -42 152, 60 140 C 152 126, 175 54, 118 14 C 74 -18, 32 -11, 0 0 Z"
                fill={`url(#leaf-pad-grad_${uniqueId})`}
                stroke="#5E8A75"
                strokeWidth="1.4"
              />

              {/* Rãnh khuyết hình chữ V (Sinus) nối tới rốn lá */}
              <path d="M 0 0 L -32 -16" stroke="#1B3229" strokeWidth="2.2" strokeLinecap="round" />
              <circle cx="0" cy="0" r="5.5" fill="#5E8A75" />
              <circle cx="0" cy="0" r="2.8" fill="#254337" />

              {/* Hệ gân lá chân vịt tỏa tròn sắc nét (Radiating Palmate Veins) */}
              <g stroke="#6C9A84" strokeWidth="1.1" strokeOpacity="0.65" fill="none">
                <path d="M 0 0 C -42 18, -104 34, -152 68" />
                <path d="M 0 0 C -32 42, -68 92, -100 128" />
                <path d="M 0 0 C 14 46, 32 96, 48 135" />
                <path d="M 0 0 C 54 30, 104 54, 144 85" />
                <path d="M 0 0 C 42 -7, 85 -7, 108 16" />
              </g>

              {/* 3 Giọt sương mai hình cầu nổi khối 3D đọng trên phiến lá */}
              <g transform="translate(-54, 54)">
                <ellipse cx="2.2" cy="2.2" rx="7.2" ry="4.6" fill="#0B120F" opacity="0.45" />
                <circle cx="0" cy="0" r="6.6" fill={`url(#dew-drop-grad_${uniqueId})`} />
                <circle cx="-2.2" cy="-2.2" r="1.8" fill="#FFFFFF" />
              </g>

              <g transform="translate(48, 78)">
                <ellipse cx="1.6" cy="1.6" rx="4.4" ry="2.8" fill="#0B120F" opacity="0.4" />
                <circle cx="0" cy="0" r="4" fill={`url(#dew-drop-grad_${uniqueId})`} />
                <circle cx="-1.2" cy="-1.2" r="1.1" fill="#FFFFFF" />
              </g>

              <g transform="translate(-20, 95)">
                <ellipse cx="1.3" cy="1.3" rx="3.3" ry="2" fill="#0B120F" opacity="0.4" />
                <circle cx="0" cy="0" r="3" fill={`url(#dew-drop-grad_${uniqueId})`} />
                <circle cx="-0.9" cy="-0.9" r="0.85" fill="#FFFFFF" />
              </g>
            </g>

            {/* Tán lá sen khổng lồ bên phải (Bập bềnh lượn sóng) */}
            <g
              transform="translate(1200, 420) scale(0.95)"
              className={`anim-leaf-bob_${uniqueId}`}
              opacity="0.9"
            >
              <path
                d="M 0 0 C -62 -22, -135 14, -115 58 C -95 104, -25 115, 42 108 C 110 99, 130 40, 85 10 C 54 -12, 22 -10, 0 0 Z"
                fill={`url(#leaf-pad-grad_${uniqueId})`}
                stroke="#5E8A75"
                strokeWidth="1.2"
              />
              <circle cx="0" cy="0" r="4.5" fill="#5E8A75" />
              <circle cx="-25" cy="36" r="3.6" fill={`url(#dew-drop-grad_${uniqueId})`} />
              <circle cx="-26" cy="35" r="1" fill="#FFFFFF" />
            </g>
          </g>

          {/* ===================================================================
              8. TẦNG ĐỐM PHẤN HOA VÀNG NHẠT LƠ LỬNG (AMBIENT GLOWING SPORES)
              =================================================================== */}
          <g filter={`url(#pollen-glow_${uniqueId})`}>
            <circle
              cx={flowerCenterX - 50}
              cy={flowerCenterY - 75}
              r="2.3"
              fill="#FFF0A8"
              className={`anim-pollen-1_${uniqueId}`}
            />
            <circle
              cx={flowerCenterX + 70}
              cy={flowerCenterY - 100}
              r="1.9"
              fill="#FCE39E"
              className={`anim-pollen-2_${uniqueId}`}
            />
            <circle
              cx={flowerCenterX + 130}
              cy={flowerCenterY - 22}
              r="2.5"
              fill="#E5B84A"
              className={`anim-pollen-1_${uniqueId}`}
            />
            <circle
              cx={flowerCenterX - 105}
              cy={flowerCenterY + 18}
              r="1.7"
              fill="#FFF0A8"
              className={`anim-pollen-2_${uniqueId}`}
            />
          </g>
        </svg>
      </div>
    </section>
  );
};

export default GrandLotusLake;
