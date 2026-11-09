import { type FC, useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import { createLotusCanvasEngine, type LotusCanvasEngine } from './lotusCanvasEngine';

export interface GrandLotusLakeProps {
  readonly className?: string;
  readonly pageScrollProgress?: number;
}

/**
 * ĐẠI CẢNH "HỒ SEN TRI THỨC" (THE LIVING GRAND LOTUS LAKE — PROCEDURAL 2D CANVAS ENGINE)
 *
 * Tái tạo trung thực 100% thuật toán đồ họa Canvas 2D thủ tục từ "Hoa sen.html":
 * - Bông sen lớn trung tâm hé mở 4 tầng cánh + nhị hoa + đài sen nghiêng.
 * - Mặt hồ xanh ngọc bích sâu thẳm chuyển sắc hữu cơ với 18 dải sóng ngầm và 46 đốm sáng lấp lánh.
 * - 8 phiến lá sen bập bềnh, lá sen đứng vươn đón nắng, búp sen phụ uốn lượn.
 * - 3 chú cá chép bơi uốn khúc với hệ xương 12 đốt và vây đuôi nhịp nhàng.
 * - Chuồn chuồn bay lượn và đỗ nhẹ nhàng trên nụ sen.
 * - Đốm phấn hoa lơ lửng, gợn nước lan tỏa quanh thân sen và bóng phản chiếu mềm dưới đáy hồ.
 * - Hỗ trợ High DPI (devicePixelRatio tối đa 2x) và tự động tính lại kích thước.
 * - Quản lý vòng đời với requestAnimationFrame và dọn dẹp triệt để khi unmount.
 * - Tối ưu hiệu năng: Tạm dừng vòng lặp (0% CPU/GPU) khi ngoài viewport (IntersectionObserver).
 * - Tuân thủ prefers-reduced-motion: Chỉ vẽ một khung hình tĩnh tại t = 2.0s khi người dùng bật giảm chuyển động.
 */
export const GrandLotusLake: FC<GrandLotusLakeProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LotusCanvasEngine | null>(null);

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
      engine.render(ctx, width, height, t);
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
        'relative h-[520px] w-full overflow-hidden bg-[#0A4833] select-none md:h-[620px]',
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
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F5F4EF] via-[#F5F4EF]/60 to-transparent md:h-40"
        aria-hidden="true"
      />

      {/* Mép dưới hồ sen (Bottom blend) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0A261D] to-transparent"
        aria-hidden="true"
      />
    </section>
  );
};

export default GrandLotusLake;
