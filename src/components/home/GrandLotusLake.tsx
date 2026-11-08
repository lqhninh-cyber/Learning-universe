import { type FC, type MouseEvent, useCallback, useEffect, useId, useRef, useState } from 'react';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface GrandLotusLakeProps {
  readonly className?: string;
  readonly pageScrollProgress?: number;
}

/**
 * ĐẠI CẢNH "HỒ SEN TRI THỨC" (GRAND LOTUS LAKE — LIVING LOTUS PANORAMA)
 *
 * Tiêu chuẩn thiết kế & Thực vật học (Botanical Realism & Cinematic Lake):
 * - Bông sen chính (*Nelumbo nucifera*):
 *   + 3 tầng cánh so le tự nhiên, bất đối xứng, độ cong và nếp gập nhẹ khác nhau giữa các cánh.
 *   + Bề mặt cánh có gân hoa mảnh; sắc độ chuyển mượt từ hồng đậm (#9E384D) ở chân cánh sang hồng phấn (#C45E72) và trắng sứ (#FAF0F2) ở đầu cánh.
 *   + Mép cánh mỏng, có hiệu ứng xuyên sáng nhẹ (translucent rim light) đón ánh bình minh.
 *   + Gương sen (đài sen) nghiêng phối cảnh 35° tự nhiên, để lộ rõ 13 lỗ hạt sen ngọc bích xếp xoắn Fibonacci và vành 36 sợi nhụy vàng óng.
 * - Thân sen & Nụ sen phụ:
 *   + Thân sen thanh mảnh, uốn lượn chữ S mềm mại với gai nhám li ti vi mô và dải chuyển sắc trụ tròn.
 *   + Nụ sen phụ hé mở dạng tháp xoắn ốc (xanh ngọc ở gốc chuyển dần sang hồng thắm ở chóp nhọn).
 * - Chi tiết Cá chép bơi ngầm (Submerged Swimming Carp):
 *   + 3 chú cá chép bơi lội mềm mại dưới tầng nước bán trong suốt, uốn lượn tự nhiên theo hàm sin, hiển thị bóng mờ nghệ thuật.
 * - Lá sen & Giọt sương mai:
 *   + Lá sen to bản uốn lượn mép tự nhiên, hệ gân tỏa chân vịt rõ nét, rãnh khuyết chữ V (sinus) nối về rốn lá.
 *   + 3 giọt sương mai hình cầu lấp lánh phản quang và bóng đổ nổi khối 3D thực tế.
 * - Ánh sáng điện ảnh 3 tầng:
 *   + Nắng mai xiên nhẹ từ góc cao tạo luồng sáng xuyên sương và phản chiếu óng ả trên mặt nước.
 *   + Dải nước chuyển sắc loang êm dịu từ ngà sương sớm (#F5F4EF) sang ngọc bích sẫm (#365E4E) và lam rêu sâu thẳm (#1B3229 / #12241D).
 *   + 3 lớp sương mai lướt ngang và đốm phấn hoa vàng nhạt lơ lửng.
 * - Hệ thống chuyển động tự nhiên:
 *   + Cánh sen dao động độc lập không đồng bộ theo gió.
 *   + Thân sen uốn cong đàn hồi.
 *   + Sóng nước đồng tâm lan tỏa ngẫu nhiên.
 *   + Hoạt cảnh hé nở ĐÚNG MỘT LẦN DUY NHẤT (Once-only Entrance Bloom) khi cuộn đến, không lặp lại chu kỳ nở-khép.
 *   + Điểm chạm của The Knowledge Thread: Kích hoạt sóng gợn đồng tâm lan tỏa khi chạm xuống mặt nước.
 *   + Parallax nhiều lớp khi cuộn trang và Mouse Parallax Tilt 3D tương tác theo chuột.
 *   + Tự động tạm dừng animation khi ra khỏi viewport (IntersectionObserver) và tuân thủ `prefers-reduced-motion`.
 */
export const GrandLotusLake: FC<GrandLotusLakeProps> = ({ className, pageScrollProgress = 0 }) => {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasBloomed, setHasBloomed] = useState(false);
  const [mouseTilt, setMouseTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const uniqueId = useId().replace(/[:]/g, '_');

  // 1. Tối ưu hiệu năng: Tạm dừng animation khi khu vực cuộn khỏi viewport
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
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 2. Kích hoạt hoạt ảnh nở 1 lần duy nhất khi lần đầu xuất hiện
  useEffect(() => {
    if (isVisible && !hasBloomed) {
      const timer = setTimeout(() => {
        setHasBloomed(true);
      }, 2600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isVisible, hasBloomed]);

  // 3. Tương tác Parallax Tilt 3D theo chuyển động chuột
  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const normX = (event.clientX - rect.left) / rect.width - 0.5;
      const normY = (event.clientY - rect.top) / rect.height - 0.5;
      setMouseTilt({
        x: Number((-normY * 5).toFixed(2)),
        y: Number((normX * 5).toFixed(2)),
      });
    },
    [prefersReducedMotion],
  );

  const handleMouseLeave = useCallback(() => {
    setMouseTilt({ x: 0, y: 0 });
  }, []);

  // 4. Parallax nhiều lớp theo tiến trình cuộn trang
  // Hậu cảnh dịch chuyển chậm nhất (0.12x), Trung cảnh (0.35x), Tiền cảnh (0.65x)
  const clampedProgress = Math.max(0, Math.min(1, pageScrollProgress));
  const bgParallaxY = prefersReducedMotion ? 0 : Number(((clampedProgress - 0.8) * 20).toFixed(1));
  const midParallaxY = prefersReducedMotion ? 0 : Number(((clampedProgress - 0.8) * 38).toFixed(1));
  const fgParallaxY = prefersReducedMotion ? 0 : Number(((clampedProgress - 0.8) * 55).toFixed(1));

  // Kiểm tra điểm kết thúc của The Knowledge Thread chạm xuống mặt nước (ngưỡng 0.90+)
  const isThreadTouchingWater = clampedProgress >= 0.9;

  // Tọa độ tâm điểm của bông sen chính trong đại cảnh (1440 x 560)
  const flowerCenterX = 760;
  const flowerCenterY = 295;

  return (
    <section
      ref={containerRef}
      aria-label="Đại cảnh Hồ Sen Tri Thức"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group relative w-full overflow-hidden border-t border-[#D9DFD9]/60 bg-[#12241D] select-none',
        className,
      )}
      style={{
        transform:
          !prefersReducedMotion && (mouseTilt.x !== 0 || mouseTilt.y !== 0)
            ? `perspective(1200px) rotateX(${mouseTilt.x}deg) rotateY(${mouseTilt.y}deg)`
            : undefined,
        transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
      }}
    >
      <div className="relative h-[440px] w-full sm:h-[500px] lg:h-[580px]">
        <svg
          viewBox="0 0 1440 560"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          aria-label="Đại cảnh Hồ Sen Tri Thức sống động"
          role="img"
        >
          <defs>
            {/* ===================================================================
                1. DẢI CHUYỂN SẮC NƯỚC HỒ HỮU CƠ & ÁNH SÁNG ĐIỆN ẢNH
                =================================================================== */}

            {/* Dải chuyển sắc độ sâu mặt nước loang mượt từ ngà sương sớm (#F5F4EF) sang lam rêu (#1B3229 / #12241D) */}
            <linearGradient id={`lake-water-depth_${uniqueId}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5F4EF" stopOpacity="1" />
              <stop offset="18%" stopColor="#8FA89B" stopOpacity="0.88" />
              <stop offset="42%" stopColor="#365E4E" stopOpacity="0.94" />
              <stop offset="75%" stopColor="#1B3229" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#12241D" stopOpacity="1" />
            </linearGradient>

            {/* Vùng nước sâu thẳm tầng đáy hữu cơ */}
            <radialGradient id={`lake-deep-abyss_${uniqueId}`} cx="50%" cy="85%" r="65%">
              <stop offset="0%" stopColor="#1B3229" stopOpacity="0.85" />
              <stop offset="70%" stopColor="#14261F" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#12241D" stopOpacity="1" />
            </radialGradient>

            {/* Vệt nắng mai xiên chếch từ góc trên bên phải (Cinematic Volumetric Backlight) */}
            <radialGradient id={`morning-sunbeam_${uniqueId}`} cx="82%" cy="15%" r="65%">
              <stop offset="0%" stopColor="#FFF9E6" stopOpacity="0.6" />
              <stop offset="32%" stopColor="#FCE39E" stopOpacity="0.28" />
              <stop offset="70%" stopColor="#F5F4EF" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>

            {/* ===================================================================
                2. DẢI SẮC THỰC VẬT HỌC CHO BÔNG SEN, GƯƠNG SEN & NHỤY HOA
                =================================================================== */}

            {/* Cánh sen lớp ngoài cùng: Hồng thắm chân cánh -> Hồng phấn -> Trắng sứ ngọc */}
            <linearGradient id={`lotus-outer-grad_${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#9E384D" />
              <stop offset="28%" stopColor="#B85D6F" />
              <stop offset="68%" stopColor="#DF7B8F" />
              <stop offset="92%" stopColor="#FCECEF" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            {/* Cánh sen lớp giữa vươn cao: Rực rỡ đón nắng mai */}
            <linearGradient id={`lotus-mid-grad_${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#8C2E42" />
              <stop offset="32%" stopColor="#B85D6F" />
              <stop offset="74%" stopColor="#EA95A6" />
              <stop offset="94%" stopColor="#FDF3F5" />
              <stop offset="100%" stopColor="#FFFFFF" />
            </linearGradient>

            {/* Cánh sen lớp trong ôm lấy đài hoa: Chân thắm đậm, lòng cánh phản quang vàng ấm */}
            <linearGradient id={`lotus-inner-grad_${uniqueId}`} x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#7A2234" />
              <stop offset="35%" stopColor="#B85D6F" />
              <stop offset="72%" stopColor="#F0A6B5" />
              <stop offset="92%" stopColor="#FBF2EC" />
              <stop offset="100%" stopColor="#FFF9F5" />
            </linearGradient>

            {/* Mặt gương sen (đài sen) nghiêng 35°: Ngọc bích non chuyển lục rêu tự nhiên */}
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

            {/* Sợi nhị hoa vàng óng tỏa tia quanh gương sen */}
            <linearGradient
              id={`stamen-filament-grad_${uniqueId}`}
              x1="0%"
              y1="100%"
              x2="0%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#C89738" />
              <stop offset="50%" stopColor="#E5B84A" />
              <stop offset="100%" stopColor="#FFF0A8" />
            </linearGradient>

            {/* Thân sen thanh mảnh uốn lượn hình trụ tròn với vệt bắt sáng */}
            <linearGradient id={`stem-cylinder-grad_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E372A" />
              <stop offset="35%" stopColor="#365E4E" />
              <stop offset="70%" stopColor="#5E8A75" />
              <stop offset="100%" stopColor="#254337" />
            </linearGradient>

            {/* Nụ sen phụ hé mở dạng xoắn ốc */}
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

            {/* Giọt sương mai hình cầu nổi khối 3D với bóng đổ và phản quang */}
            <radialGradient id={`dew-drop-grad_${uniqueId}`} cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
              <stop offset="40%" stopColor="#E8F4F0" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#365E4E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#1B3229" stopOpacity="0.8" />
            </radialGradient>

            {/* Sắc chuyển cá chép bơi ngầm (Hổ phách nhạt sang cam đất #D49A58 / #C45A38) */}
            <linearGradient id={`carp-body-1_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="60%">
              <stop offset="0%" stopColor="#C45A38" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#D49A58" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#E6B87A" stopOpacity="0.65" />
            </linearGradient>

            <linearGradient id={`carp-fin-grad_${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E6B87A" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#D49A58" stopOpacity="0.25" />
            </linearGradient>

            {/* Bộ lọc sương mai mềm và vầng sáng đốm phấn hoa */}
            <filter id={`mist-soft-blur_${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="9" />
            </filter>

            <filter id={`pollen-glow_${uniqueId}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* ===================================================================
                3. HỆ THỐNG KEYFRAMES CHUYỂN ĐỘNG TỰ NHIÊN (NATURAL MOTION)
                =================================================================== */}
            <style>{`
              /* 1. Hiệu ứng hoa hé nở ĐÚNG MỘT LẦN DUY NHẤT (Once-only Entrance Bloom) */
              @keyframes lotus-entrance-bloom_${uniqueId} {
                0% {
                  transform: scale(0.92) translateY(12px);
                  opacity: 0.82;
                }
                100% {
                  transform: scale(1) translateY(0);
                  opacity: 1;
                }
              }

              /* 2. Thân sen uốn cong đàn hồi tự nhiên theo nhịp gió */
              @keyframes lotus-stem-sway_${uniqueId} {
                0%, 100% { transform: rotate(0deg); }
                33% { transform: rotate(1.4deg); }
                68% { transform: rotate(-1.1deg); }
              }

              /* 3. Cánh sen tầng ngoài dao động độc lập */
              @keyframes lotus-petal-outer-wave_${uniqueId} {
                0%, 100% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(1.8deg) scale(1.012); }
              }

              /* 4. Cánh sen tầng giữa vươn nhịp thở */
              @keyframes lotus-petal-mid-wave_${uniqueId} {
                0%, 100% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(-1.5deg) scale(1.008); }
              }

              /* 5. Vòng sóng nước đồng tâm lan tỏa tự nhiên */
              @keyframes water-ripple-radiate_${uniqueId} {
                0% {
                  r: 12px;
                  opacity: 0.7;
                  stroke-width: 1.8px;
                }
                45% {
                  opacity: 0.35;
                  stroke-width: 1.1px;
                }
                100% {
                  r: 140px;
                  opacity: 0;
                  stroke-width: 0.3px;
                }
              }

              /* 6. Lá sen bập bềnh nhấp nhô trên mặt hồ */
              @keyframes leaf-pad-bob_${uniqueId} {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(4.5px) rotate(0.8deg); }
              }

              /* 7. Làn sương mai hậu cảnh lướt ngang chậm rãi */
              @keyframes morning-mist-drift_${uniqueId} {
                0% { transform: translateX(-45px); opacity: 0.25; }
                50% { transform: translateX(50px); opacity: 0.48; }
                100% { transform: translateX(-45px); opacity: 0.25; }
              }

              /* 8. Cá chép bơi lội mềm mại dưới nước theo hàm sin */
              @keyframes carp-swim-path-1_${uniqueId} {
                0% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(45px, -14px) rotate(4deg); }
                50% { transform: translate(90px, 0px) rotate(0deg); }
                75% { transform: translate(45px, 16px) rotate(-5deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }

              @keyframes carp-swim-path-2_${uniqueId} {
                0% { transform: translate(0, 0) rotate(0deg); }
                30% { transform: translate(-40px, 12px) rotate(-4deg); }
                65% { transform: translate(-80px, -8px) rotate(3deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
              }

              @keyframes carp-tail-wag_${uniqueId} {
                0%, 100% { transform: rotate(-7deg); }
                50% { transform: rotate(9deg); }
              }

              /* 9. Đốm phấn hoa vàng nhạt lơ lửng */
              @keyframes pollen-spore-float_${uniqueId} {
                0% { transform: translate(0, 0); opacity: 0.3; }
                50% { transform: translate(16px, -22px); opacity: 0.95; }
                100% { transform: translate(0, 0); opacity: 0.3; }
              }

              /* Gán các class animation */
              .anim-lotus-flower_${uniqueId} {
                transform-origin: ${flowerCenterX}px ${flowerCenterY + 120}px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `lotus-stem-sway_${uniqueId} 7.2s ease-in-out infinite`
                };
              }

              .anim-petal-outer-left_${uniqueId} {
                transform-origin: 0px 0px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `lotus-petal-outer-wave_${uniqueId} 5.8s ease-in-out infinite`
                };
              }

              .anim-petal-outer-right_${uniqueId} {
                transform-origin: 0px 0px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `lotus-petal-outer-wave_${uniqueId} 6.4s ease-in-out 1.2s infinite`
                };
              }

              .anim-petal-mid_${uniqueId} {
                transform-origin: 0px 0px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `lotus-petal-mid-wave_${uniqueId} 4.9s ease-in-out 0.6s infinite`
                };
              }

              .anim-ripple-1_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-ripple-radiate_${uniqueId} 6.4s ease-out infinite`
                };
              }

              .anim-ripple-2_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-ripple-radiate_${uniqueId} 6.4s ease-out 2.2s infinite`
                };
              }

              .anim-ripple-3_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `water-ripple-radiate_${uniqueId} 6.4s ease-out 4.4s infinite`
                };
              }

              .anim-leaf-bob_${uniqueId} {
                transform-origin: 320px 390px;
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `leaf-pad-bob_${uniqueId} 6.8s ease-in-out infinite`
                };
              }

              .anim-mist-drift_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `morning-mist-drift_${uniqueId} 24s ease-in-out infinite`
                };
              }

              .anim-carp-1_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `carp-swim-path-1_${uniqueId} 14s ease-in-out infinite`
                };
              }

              .anim-carp-2_${uniqueId} {
                animation: ${
                  prefersReducedMotion || !isVisible
                    ? 'none'
                    : `carp-swim-path-2_${uniqueId} 18s ease-in-out infinite`
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
              4. TẦNG HẬU CẢNH: MẶT NƯỚC SÂU THẲM, SƯƠNG MAI VÀ NẮNG SỚM
              (Áp dụng Parallax Hậu cảnh Y: 0.12x)
              =================================================================== */}
          <g transform={`translate(0, ${bgParallaxY})`}>
            {/* Mặt nước hồ sen chuyển sắc hữu cơ (#F5F4EF -> #1B3229 / #12241D) */}
            <rect width="1440" height="560" fill={`url(#lake-water-depth_${uniqueId})`} />
            <ellipse
              cx="720"
              cy="460"
              rx="680"
              ry="240"
              fill={`url(#lake-deep-abyss_${uniqueId})`}
            />

            {/* Nắng mai rọi xiên dịu dàng từ góc cao (Cinematic Backlight) */}
            <rect width="1440" height="560" fill={`url(#morning-sunbeam_${uniqueId})`} />

            {/* Dải vân phản quang gợn sóng ngang mờ ảo */}
            <g stroke="#D9DFD9" strokeWidth="0.8" strokeOpacity="0.28" fill="none">
              <path d="M 0 170 Q 360 155, 720 170 T 1440 170" />
              <path
                d="M 0 245 Q 420 230, 840 245 T 1440 245"
                stroke="#5E8A75"
                strokeOpacity="0.22"
              />
              <path
                d="M 0 325 Q 380 310, 760 325 T 1440 325"
                stroke="#718C7E"
                strokeOpacity="0.2"
              />
            </g>

            {/* Làn sương mai đa tầng lướt ngang mặt hồ */}
            <g
              className={`anim-mist-drift_${uniqueId}`}
              filter={`url(#mist-soft-blur_${uniqueId})`}
            >
              <ellipse cx="380" cy="210" rx="320" ry="28" fill="#FFFFFF" opacity="0.32" />
              <ellipse cx="960" cy="240" rx="360" ry="32" fill="#FDEEF1" opacity="0.28" />
              <ellipse cx="700" cy="350" rx="420" ry="36" fill="#FAF9F6" opacity="0.3" />
            </g>
          </g>

          {/* ===================================================================
              5. TẦNG CÁ CHÉP BƠI NGẦM DƯỚI NƯỚC (SUBMERGED SWIMMING CARP)
              (3 chú cá chép bơi lội mềm mại dưới tầng nước bán trong suốt)
              =================================================================== */}
          <g opacity="0.55">
            {/* Chú cá 1: Thân hổ phách uốn lượn dưới phiến lá trái */}
            <g transform="translate(480, 410)" className={`anim-carp-1_${uniqueId}`}>
              {/* Thân cá chép 1 */}
              <path
                d="M -35 0 C -24 -12, 18 -14, 40 0 C 18 14, -24 12, -35 0 Z"
                fill={`url(#carp-body-1_${uniqueId})`}
              />
              {/* Vây ức cá bán trong suốt */}
              <path d="M 5 -4 C 18 -18, 30 -12, 18 -2 Z" fill={`url(#carp-fin-grad_${uniqueId})`} />
              <path d="M 5 4 C 18 18, 30 12, 18 2 Z" fill={`url(#carp-fin-grad_${uniqueId})`} />
              {/* Đuôi cá vẫy nhịp nhàng */}
              <g transform="translate(-35, 0)" className={`anim-tail_${uniqueId}`}>
                <path
                  d="M 0 0 C -15 -14, -28 -2, -38 -10 C -30 4, -30 10, -38 16 C -25 8, -15 14, 0 0 Z"
                  fill={`url(#carp-body-1_${uniqueId})`}
                />
              </g>
            </g>

            {/* Chú cá 2: Sắc cam đất bơi nhẹ gần chân hoa sen */}
            <g transform="translate(1020, 430)" className={`anim-carp-2_${uniqueId}`}>
              <path
                d="M -30 0 C -20 -10, 16 -11, 35 0 C 16 11, -20 10, -30 0 Z"
                fill={`url(#carp-body-1_${uniqueId})`}
              />
              <g transform="translate(-30, 0)" className={`anim-tail_${uniqueId}`}>
                <path
                  d="M 0 0 C -12 -11, -22 0, -30 -7 C -24 3, -24 7, -30 13 C -20 6, -12 11, 0 0 Z"
                  fill={`url(#carp-body-1_${uniqueId})`}
                />
              </g>
            </g>

            {/* Chú cá 3: Cá nhỏ ở tầng sâu xa hơn */}
            <g
              transform="translate(720, 480) scale(0.65)"
              opacity="0.6"
              className={`anim-carp-1_${uniqueId}`}
            >
              <path
                d="M -25 0 C -16 -8, 14 -9, 28 0 C 14 9, -16 8, -25 0 Z"
                fill={`url(#carp-body-1_${uniqueId})`}
              />
              <g transform="translate(-25, 0)" className={`anim-tail_${uniqueId}`}>
                <path
                  d="M 0 0 C -10 -9, -18 0, -25 -6 C -20 3, -20 6, -25 11 C -16 5, -10 9, 0 0 Z"
                  fill={`url(#carp-body-1_${uniqueId})`}
                />
              </g>
            </g>
          </g>

          {/* ===================================================================
              6. TẦNG TRUNG CẢNH: BÔNG SEN CHÍNH, GƯƠNG SEN, NỤ SEN & SÓNG NƯỚC
              (Áp dụng Parallax Trung cảnh Y: 0.35x)
              =================================================================== */}
          <g transform={`translate(0, ${midParallaxY})`}>
            {/* Điểm chạm The Knowledge Thread tại đỉnh hồ (x=720, y=30) */}
            {isThreadTouchingWater && (
              <g transform="translate(720, 30)" stroke="#C89738" fill="none">
                <ellipse
                  cx="0"
                  cy="0"
                  rx="30"
                  ry="10"
                  className={`anim-ripple-1_${uniqueId}`}
                  stroke="#C89738"
                  strokeOpacity="0.75"
                />
                <ellipse
                  cx="0"
                  cy="0"
                  rx="30"
                  ry="10"
                  className={`anim-ripple-2_${uniqueId}`}
                  stroke="#8FA89B"
                  strokeOpacity="0.55"
                />
                {/* Giọt sương tri thức chạm mặt nước */}
                <circle cx="0" cy="0" r="3.5" fill="#FAF9F6" stroke="#C89738" strokeWidth="1.2" />
              </g>
            )}

            {/* Vòng sóng nước đồng tâm lan tỏa quanh cuống sen */}
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
                strokeOpacity="0.45"
              />
              <ellipse
                cx="0"
                cy="0"
                rx="28"
                ry="9"
                className={`anim-ripple-3_${uniqueId}`}
                stroke="#D9DFD9"
                strokeOpacity="0.35"
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

            {/* Nụ sen phụ e ấp đa tầng xoắn ốc (xanh ngọc ở gốc, hồng thắm ở chóp) */}
            <g transform={`translate(${flowerCenterX + 250}, ${flowerCenterY + 45})`}>
              {/* Cuống nụ sen uốn lượn */}
              <path
                d="M 0 100 C -8 65, 14 32, 0 0"
                stroke={`url(#stem-cylinder-grad_${uniqueId})`}
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="2" cy="48" r="0.8" fill="#1B3229" />
              <circle cx="-3" cy="26" r="0.8" fill="#1B3229" />

              {/* Các cánh nụ sen ôm khít dạng tháp xoắn ốc */}
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

            {/* BÔNG SEN CHÍNH ĐANG NỞ RỘ (THE CENTRAL LIVING LOTUS) */}
            <g
              className={`anim-lotus-flower_${uniqueId}`}
              style={{
                animationName: hasBloomed ? undefined : `lotus-entrance-bloom_${uniqueId}`,
                animationDuration: '2.4s',
                animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                animationFillMode: 'forwards',
              }}
            >
              {/* Thân sen chính: Vươn cao chữ S mềm mại với dải hình trụ và gai nhám */}
              <g transform={`translate(${flowerCenterX}, ${flowerCenterY})`}>
                <path
                  d="M 0 148 C 11 98, -8 46, 0 0"
                  stroke={`url(#stem-cylinder-grad_${uniqueId})`}
                  strokeWidth="5.6"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 1 148 C 12 98, -7 46, 1 0"
                  stroke="#8FA89B"
                  strokeWidth="1.2"
                  strokeDasharray="3 7"
                  fill="none"
                  opacity="0.75"
                />
                <circle cx="2.5" cy="118" r="0.9" fill="#1B3229" />
                <circle cx="-1.5" cy="88" r="0.9" fill="#1B3229" />
                <circle cx="3" cy="56" r="0.8" fill="#1B3229" />
                <circle cx="-2" cy="26" r="0.8" fill="#1B3229" />
              </g>

              {/* Vòm cánh sen đa tầng & Nhụy sen tại tâm điểm */}
              <g transform={`translate(${flowerCenterX}, ${flowerCenterY})`}>
                {/* 6A. TẦNG CÁNH NGOÀI CÙNG (OUTER LAYER — BÈ RỘNG, BẤT ĐỐI XỨNG) */}
                <g className={`anim-petal-outer-left_${uniqueId}`}>
                  <path
                    d="M 0 0 C -48 -16, -118 -42, -120 -102 C -94 -112, -48 -70, 0 0 Z"
                    fill={`url(#lotus-outer-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.8"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M 0 0 C -36 -22, -78 -50, -116 -101"
                    stroke="#B85D6F"
                    strokeWidth="0.6"
                    strokeOpacity="0.45"
                    fill="none"
                  />
                  <path
                    d="M -120 -102 C -94 -112, -48 -70, 0 0"
                    stroke="#FFF5F7"
                    strokeWidth="0.8"
                    strokeOpacity="0.8"
                    fill="none"
                  />
                </g>

                <g className={`anim-petal-outer-right_${uniqueId}`}>
                  <path
                    d="M 0 0 C 50 -18, 124 -40, 118 -106 C 88 -116, 46 -72, 0 0 Z"
                    fill={`url(#lotus-outer-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.8"
                    strokeOpacity="0.7"
                  />
                  <path
                    d="M 0 0 C 40 -24, 80 -52, 115 -105"
                    stroke="#B85D6F"
                    strokeWidth="0.6"
                    strokeOpacity="0.45"
                    fill="none"
                  />
                  <path
                    d="M 118 -106 C 88 -116, 46 -72, 0 0"
                    stroke="#FFF5F7"
                    strokeWidth="0.8"
                    strokeOpacity="0.8"
                    fill="none"
                  />
                </g>

                {/* 6B. TẦNG CÁNH GIỮA (MID LAYER — VƯƠN CAO KIÊU HÃNH) */}
                <g className={`anim-petal-mid_${uniqueId}`}>
                  <path
                    d="M 0 0 C -44 -32, -80 -84, -64 -140 C -38 -122, -16 -68, 0 0 Z"
                    fill={`url(#lotus-mid-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.85"
                    strokeOpacity="0.75"
                  />
                  <path
                    d="M 0 0 C -30 -40, -54 -86, -63 -139"
                    stroke="#9E384D"
                    strokeWidth="0.6"
                    strokeOpacity="0.4"
                    fill="none"
                  />
                </g>

                <g className={`anim-petal-mid_${uniqueId}`}>
                  <path
                    d="M 0 0 C 48 -34, 84 -82, 70 -142 C 40 -124, 18 -68, 0 0 Z"
                    fill={`url(#lotus-mid-grad_${uniqueId})`}
                    stroke="#B85D6F"
                    strokeWidth="0.85"
                    strokeOpacity="0.75"
                  />
                  <path
                    d="M 0 0 C 34 -40, 58 -88, 69 -141"
                    stroke="#9E384D"
                    strokeWidth="0.6"
                    strokeOpacity="0.4"
                    fill="none"
                  />
                </g>

                {/* Cánh chính tâm vút cao nhất (Trọng tâm thị giác) */}
                <path
                  d="M 0 0 C -28 -58, -25 -130, 0 -172 C 25 -130, 28 -58, 0 0 Z"
                  fill={`url(#lotus-inner-grad_${uniqueId})`}
                  stroke="#B85D6F"
                  strokeWidth="0.9"
                  strokeOpacity="0.8"
                />
                <path
                  d="M 0 0 L 0 -170"
                  stroke="#C45E72"
                  strokeWidth="0.7"
                  strokeOpacity="0.5"
                  fill="none"
                />
                <path
                  d="M -13 -144 C -4 -164, 0 -172, 0 -172 C 0 -172, 4 -164, 13 -144"
                  stroke="#FFFFFF"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* Cánh tầng trước ôm đáy (Gập nhẹ tạo chiều sâu 3D tự nhiên) */}
                <path
                  d="M 0 0 C -50 8, -70 -26, -52 -58 C -28 -40, -8 -12, 0 0 Z"
                  fill={`url(#lotus-outer-grad_${uniqueId})`}
                  stroke="#B85D6F"
                  strokeWidth="0.75"
                />
                <path
                  d="M 0 0 C 50 8, 70 -26, 52 -58 C 28 -40, 8 -12, 0 0 Z"
                  fill={`url(#lotus-outer-grad_${uniqueId})`}
                  stroke="#B85D6F"
                  strokeWidth="0.75"
                />

                {/* 6C. GƯƠNG SEN & NHỤY HOA BOTANICAL THỰC VẬT CHÂN THỰC
                    (Gương sen nón cụt nghiêng 35° + 13 lỗ hạt Fibonacci + 36 sợi nhị vàng) */}
                <g transform="translate(0, -38) rotate(-7)">
                  {/* Thân nón gương sen đổ bóng tự nhiên */}
                  <path
                    d="M -30 0 C -28 24, 28 24, 30 0 C 26 -10, -26 -10, -30 0 Z"
                    fill={`url(#receptacle-cone-grad_${uniqueId})`}
                    stroke="#254337"
                    strokeWidth="0.8"
                  />

                  {/* Mặt gương sen hình elip nghiêng 35° nhìn từ trên xuống */}
                  <ellipse
                    cx="0"
                    cy="-4"
                    rx="32"
                    ry="16"
                    fill={`url(#receptacle-surface-grad_${uniqueId})`}
                    stroke="#8DBFA6"
                    strokeWidth="1.3"
                  />

                  {/* 13 Lỗ hạt sen xoắn Fibonacci tự nhiên & Hạt sen ngọc bích non với đầu núm nhụy */}
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
                    { x: -22, y: -5, r: 1.8 },
                    { x: 22, y: -5, r: 1.8 },
                    { x: 0, y: 5, r: 2.2 },
                    { x: 0, y: -11, r: 2.0 },
                  ].map((pit, idx) => (
                    <g key={`seed-pit-${idx}`}>
                      <circle cx={pit.x} cy={pit.y} r={pit.r} fill="#1B3229" />
                      <circle cx={pit.x} cy={pit.y} r={pit.r * 0.65} fill="#A8D4BC" />
                      <circle cx={pit.x} cy={pit.y} r={pit.r * 0.25} fill="#16261E" />
                    </g>
                  ))}

                  {/* Vành sợi nhị hoa vàng óng (Stamens & Golden Filaments) quanh chân gương sen */}
                  {Array.from({ length: 36 }).map((_, idx) => {
                    const angle = (idx * 10 * Math.PI) / 180;
                    const rx = 34;
                    const ry = 18;
                    const lengthOffset = (idx % 3) * 2;
                    const x1 = Math.cos(angle) * (rx - 2);
                    const y1 = Math.sin(angle) * (ry - 2) - 4;
                    const x2 = Math.cos(angle) * (rx + 6 + lengthOffset);
                    const y2 = Math.sin(angle) * (ry + 4 + lengthOffset) - 4;
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
              7. TẦNG TIỀN CẢNH: PHIẾN LÁ SEN UỐN LƯỢN & GIỌT SƯƠNG MAI NỔI KHỐI 3D
              (Áp dụng Parallax Tiền cảnh Y: 0.65x)
              =================================================================== */}
          <g transform={`translate(0, ${fgParallaxY})`}>
            {/* Phiến lá sen lớn bên trái với gân lá chân vịt (Peltate Leaf) */}
            <g className={`anim-leaf-bob_${uniqueId}`} transform="translate(320, 390)">
              {/* Mặt phiến lá sen uốn lượn hình khiên */}
              <path
                d="M 0 0 C -75 -28, -165 18, -145 72 C -122 120, -38 135, 52 125 C 135 112, 155 48, 105 12 C 65 -16, 28 -10, 0 0 Z"
                fill={`url(#leaf-pad-grad_${uniqueId})`}
                stroke="#5E8A75"
                strokeWidth="1.3"
              />

              {/* Rãnh khuyết hình chữ V (Sinus) nối tới rốn lá */}
              <path d="M 0 0 L -28 -14" stroke="#1B3229" strokeWidth="2" strokeLinecap="round" />
              <circle cx="0" cy="0" r="5" fill="#5E8A75" />
              <circle cx="0" cy="0" r="2.5" fill="#254337" />

              {/* Hệ gân lá chân vịt tỏa tròn (Radiating Palmate Veins) */}
              <g stroke="#6C9A84" strokeWidth="1" strokeOpacity="0.65" fill="none">
                <path d="M 0 0 C -38 16, -92 30, -136 60" />
                <path d="M 0 0 C -28 38, -60 82, -88 114" />
                <path d="M 0 0 C 12 42, 28 86, 42 120" />
                <path d="M 0 0 C 48 26, 92 48, 128 76" />
                <path d="M 0 0 C 38 -6, 76 -6, 96 14" />
              </g>

              {/* 3 Giọt sương mai hình cầu nổi khối 3D đọng trên phiến lá */}
              {/* Giọt sương 1 */}
              <g transform="translate(-48, 48)">
                <ellipse cx="2" cy="2" rx="6.5" ry="4.2" fill="#12241D" opacity="0.45" />
                <circle cx="0" cy="0" r="6" fill={`url(#dew-drop-grad_${uniqueId})`} />
                <circle cx="-2" cy="-2" r="1.6" fill="#FFFFFF" />
              </g>

              {/* Giọt sương 2 */}
              <g transform="translate(42, 70)">
                <ellipse cx="1.5" cy="1.5" rx="4" ry="2.5" fill="#12241D" opacity="0.4" />
                <circle cx="0" cy="0" r="3.6" fill={`url(#dew-drop-grad_${uniqueId})`} />
                <circle cx="-1.1" cy="-1.1" r="1" fill="#FFFFFF" />
              </g>

              {/* Giọt sương 3 */}
              <g transform="translate(-18, 85)">
                <ellipse cx="1.2" cy="1.2" rx="3" ry="1.8" fill="#12241D" opacity="0.4" />
                <circle cx="0" cy="0" r="2.8" fill={`url(#dew-drop-grad_${uniqueId})`} />
                <circle cx="-0.8" cy="-0.8" r="0.8" fill="#FFFFFF" />
              </g>
            </g>

            {/* Phiến lá sen phụ bên phải (Bập bềnh nhẹ) */}
            <g
              transform="translate(1180, 410) scale(0.9)"
              className={`anim-leaf-bob_${uniqueId}`}
              opacity="0.88"
            >
              <path
                d="M 0 0 C -55 -20, -120 12, -102 52 C -85 92, -22 102, 38 95 C 98 88, 115 35, 75 9 C 48 -11, 20 -9, 0 0 Z"
                fill={`url(#leaf-pad-grad_${uniqueId})`}
                stroke="#5E8A75"
                strokeWidth="1.1"
              />
              <circle cx="0" cy="0" r="4" fill="#5E8A75" />
              <circle cx="-22" cy="32" r="3.2" fill={`url(#dew-drop-grad_${uniqueId})`} />
              <circle cx="-23" cy="31" r="0.9" fill="#FFFFFF" />
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

        {/* Chú giải học thuật ở góc dưới đại cảnh */}
        <div className="pointer-events-none absolute right-4 bottom-4 left-4 flex flex-col items-center justify-between gap-1.5 rounded-2xl border border-[#D9DFD9]/40 bg-[#FAF9F6]/85 px-4 py-2 text-xs backdrop-blur-md sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#B85D6F]" aria-hidden="true" />
            <p className="font-serif font-bold text-[#262B28]">
              Đại Cảnh Hồ Sen Tri Thức · Điểm Gặp Gỡ Của Trí Tuệ &amp; Tâm Hồn Sư Phạm
            </p>
          </div>
          <p className="font-mono text-[11px] text-[#365E4E]">
            Tái hiện thực vật học (Nelumbo nucifera) · Nắng mai điện ảnh 2026
          </p>
        </div>
      </div>
    </section>
  );
};

export default GrandLotusLake;
