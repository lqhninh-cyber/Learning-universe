import { type FC, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { createLotusCanvasEngine, type LotusCanvasEngine } from './lotusCanvasEngine';

export interface GrandLotusLakeProps {
  readonly className?: string;
  readonly pageScrollProgress?: number;
}

/**
 * Xác định sắc thái hồ sen tự động theo giờ thực tế của hệ thống:
 * - 06:00 đến 17:59 -> "Sương mai" (day)
 * - 18:00 đến 05:59 -> "Nguyệt dạ" (night)
 */
function getSystemLakeTheme(): 'day' | 'night' {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
}

/**
 * ĐẠI CẢNH "HỒ SEN TRI THỨC" (THE LIVING GRAND LOTUS LAKE — PROCEDURAL 2D CANVAS ENGINE)
 *
 * Tái tạo hệ sinh thái hồ sen Canvas 2D thủ tục sống động với 10 lớp chiều sâu nghiêm ngặt:
 * 1. Nước hồ xanh ngọc bích sâu thẳm & đàn cá chép (cá lớn Tancho/Kohaku + bầy cá con minnow).
 * 2. Phiến lá sen hậu cảnh bập bềnh, gợn sóng cá, sóng cuống sen & sóng nhấp chuột tương tác.
 * 3. Bóng hoa sen phản chiếu lộn ngược dưới nước (scale(S, -S * 0.28)) với filter blur(3px) và sóng ngang.
 * 4. Cuống sen cong chữ S tự nhiên chịu sức nặng hoa, nụ sen & lá đứng.
 * 5. Đóa sen nở vòm chén ngọc 3D 5 tầng cánh (cánh sau -> đài sen & nhụy vàng -> cánh tiền cảnh ôm tâm).
 * 6. Phiến lá sen tiền cảnh góc trái và các phiến lá già bo góc đóng khung đại cảnh.
 * 7. CHÚ ẾCH NGỒI THIỀN trên lá sen tiền cảnh (x: ~0.16 * W, y: ~0.76 * H), thân ngọc bích #3A8752 bụng trắng ngà #FAF4E0.
 * 8. Chuồn chuồn ngọc bay lượn trên không và bóng đổ in trên mặt nước.
 * 9. BẦY ĐOM ĐÓM PHÁT SÁNG (15 chú đom đóm ban đêm tâm #E2F86B, hào quang 10-14px & phản xạ nước)
 *    cùng 26 hạt phấn hoa bay lơ lửng.
 * 10. Lớp sương mù che viền đỉnh và vignette chuyển tiếp chân trang mượt mà.
 *
 * Cơ chế hoạt động:
 * - Thuần hiển thị nghệ thuật Canvas 2D không có bất kỳ nút bấm hay thanh điều khiển đè lên.
 * - Luôn luôn tự động chuyển đổi sắc thái ngầm giữa "Sương mai" và "Nguyệt dạ" theo giờ hệ thống.
 */
export const GrandLotusLake: FC<GrandLotusLakeProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LotusCanvasEngine | null>(null);

  const [lakeTheme, setLakeTheme] = useState<'day' | 'night'>(getSystemLakeTheme);
  const lakeThemeRef = useRef<'day' | 'night'>(lakeTheme);

  // Đồng bộ sắc thái vào ref phục vụ render loop Canvas
  useEffect(() => {
    lakeThemeRef.current = lakeTheme;
  }, [lakeTheme]);

  // Luôn chạy tự động ngầm theo giờ thực tế của hệ thống (kiểm tra mỗi 60 giây)
  useEffect(() => {
    const checkTheme = () => {
      const current = getSystemLakeTheme();
      setLakeTheme((prev) => (prev !== current ? current : prev));
    };

    const timer = window.setInterval(checkTheme, 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animId = 0;
    let isIntersecting = true;
    let isMounted = true;
    let width = 0;
    let height = 0;

    // Kiểm tra prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Khởi tạo Canvas Engine (cache offscreen canvases một lần duy nhất)
    if (!engineRef.current) {
      engineRef.current = createLotusCanvasEngine();
    }
    const engine = engineRef.current;

    const handleResize = () => {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      const W = Math.floor(rect.width) || 1440;
      const H = Math.floor(rect.height) || 620;
      if (W <= 0 || H <= 0) return;
      width = W;
      height = H;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const renderFrame = (t: number) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || width <= 0 || height <= 0) return;
      ctx.clearRect(0, 0, width, height);
      engine.render(ctx, width, height, t, lakeThemeRef.current);
    };

    handleResize();

    if (prefersReducedMotion) {
      // Nếu giảm chuyển động, chỉ vẽ một khung hình tĩnh hoàn chỉnh (t = 2.0s) duy nhất
      renderFrame(2.0);
    } else {
      const loop = (timestamp: number) => {
        if (!isMounted) return;
        if (isIntersecting) {
          renderFrame(timestamp / 1000);
        }
        animId = requestAnimationFrame(loop);
      };
      animId = requestAnimationFrame(loop);
    }

    // Tối ưu hiệu năng: Dừng animation khi cuộn khỏi màn hình (0% CPU/GPU)
    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            isIntersecting = entry.isIntersecting;
          }
        },
        { threshold: 0.05 },
      );
      observer.observe(container);
    }

    // Theo dõi thay đổi kích thước khung chứa
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
        if (prefersReducedMotion) {
          renderFrame(2.0);
        }
      });
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      isMounted = false;
      if (animId) {
        cancelAnimationFrame(animId);
      }
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Khi lakeTheme thay đổi và prefers-reduced-motion đang bật, vẽ lại frame tĩnh
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && canvasRef.current && engineRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      if (ctx && rect.width > 0 && rect.height > 0) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        engineRef.current.render(ctx, rect.width, rect.height, 2.0, lakeThemeRef.current);
      }
    }
  }, [lakeTheme]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engineRef.current.addRipple(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !engineRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    engineRef.current.setPointer(x, y);
  };

  const handlePointerLeave = () => {
    engineRef.current?.setPointer(null, null);
  };

  return (
    <section
      ref={containerRef}
      aria-label="Đại cảnh Hồ Sen Tri Thức"
      className={cn(
        'relative h-[520px] w-full overflow-hidden transition-colors duration-700 select-none md:h-[620px]',
        lakeTheme === 'day' ? 'bg-[#5B9577]' : 'bg-[#040D08]',
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full cursor-pointer touch-pan-y"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      />

      {/* Mép trên hồ sen (Top edge mist blend) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b transition-colors duration-700 md:h-40',
          lakeTheme === 'day'
            ? 'from-[#F5F4EF] via-[#F5F4EF]/60 to-transparent'
            : 'from-[#040D08]/90 via-[#040D08]/50 to-transparent',
        )}
        aria-hidden="true"
      />

      {/* Mép dưới hồ sen (Bottom blend) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t transition-colors duration-700',
          lakeTheme === 'day' ? 'from-[#1D4A37] to-transparent' : 'from-[#040D08] to-transparent',
        )}
        aria-hidden="true"
      />
    </section>
  );
};

export default GrandLotusLake;
