import { type FC, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { ambientSound } from '@/shared/lib/ambientSound';
import { createLotusCanvasEngine, type LotusCanvasEngine } from './lotusCanvasEngine';

export interface GrandLotusLakeProps {
  readonly className?: string;
  readonly pageScrollProgress?: number;
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
 * Tính năng mở rộng:
 * - Ambient Themes: Tự động phát hiện ngày/đêm theo thời gian thực (06:00 - 17:59 Sương Mai, 18:00 - 05:59 Nguyệt Dạ) hoặc tùy chọn.
 * - Procedural Ambient Sound: Âm thanh suối nước róc rách & tiếng dế đêm bằng Web Audio API (zero external mp3 assets).
 */
export const GrandLotusLake: FC<GrandLotusLakeProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<LotusCanvasEngine | null>(null);

  const [ambientMode, setAmbientMode] = useState<'auto' | 'day' | 'night'>('auto');
  const [isSoundActive, setIsSoundActive] = useState<boolean>(false);

  // Xác định ngày/đêm theo đồng hồ thực tế: 06:00 - 17:59 là Ngày (Sương mai), còn lại là Đêm (Nguyệt dạ)
  const getSystemTheme = (): 'day' | 'night' => {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? 'day' : 'night';
  };

  const effectiveTheme: 'day' | 'night' = ambientMode === 'auto' ? getSystemTheme() : ambientMode;
  const effectiveThemeRef = useRef<'day' | 'night'>(effectiveTheme);

  // Đồng bộ theme vào engine và sound generator
  useEffect(() => {
    effectiveThemeRef.current = effectiveTheme;
    if (isSoundActive) {
      ambientSound.updateTheme(effectiveTheme);
    }
  }, [effectiveTheme, isSoundActive]);

  // Tự động ngắt âm thanh khi ẩn tab hoặc rời trang
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        ambientSound.stop();
        setIsSoundActive(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      ambientSound.stop();
    };
  }, []);

  const toggleSound = () => {
    if (isSoundActive) {
      ambientSound.stop();
      setIsSoundActive(false);
    } else {
      ambientSound.start(effectiveTheme);
      setIsSoundActive(true);
    }
  };

  const cycleAmbientMode = () => {
    setAmbientMode((prev) => {
      if (prev === 'auto') return 'day';
      if (prev === 'day') return 'night';
      return 'auto';
    });
  };

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
      engine.render(ctx, width, height, t, effectiveThemeRef.current);
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

  // Khi effectiveTheme thay đổi và prefers-reduced-motion đang bật, vẽ lại frame tĩnh
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
        engineRef.current.render(ctx, rect.width, rect.height, 2.0, effectiveThemeRef.current);
      }
    }
  }, [effectiveTheme]);

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
        effectiveTheme === 'day' ? 'bg-[#5B9577]' : 'bg-[#040D08]',
        className,
      )}
    >
      {/* Thanh điều khiển sinh thái nổi (Floating Ambient Controller) */}
      <div className="absolute top-5 right-6 z-20 flex items-center gap-3 rounded-full border border-white/15 bg-black/35 px-3.5 py-1.5 text-xs text-[#E2ECE6] shadow-lg backdrop-blur-md">
        {/* Nút chuyển chế độ Ngày/Đêm/Tự động */}
        <button
          type="button"
          onClick={cycleAmbientMode}
          aria-label="Chuyển chế độ thời gian cảnh hồ sen"
          className="flex items-center gap-1.5 transition-colors hover:text-white focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A262]"
        >
          {ambientMode === 'auto' && (
            <>
              <span aria-hidden="true">⏱️</span>
              <span>Tự động ({effectiveTheme === 'day' ? 'Sương mai' : 'Nguyệt dạ'})</span>
            </>
          )}
          {ambientMode === 'day' && (
            <>
              <span aria-hidden="true">☀️</span>
              <span>Sương mai</span>
            </>
          )}
          {ambientMode === 'night' && (
            <>
              <span aria-hidden="true">🌙</span>
              <span>Nguyệt dạ</span>
            </>
          )}
        </button>

        <span className="h-3 w-px bg-white/20" aria-hidden="true" />

        {/* Nút bật/tắt âm thanh sinh thái */}
        <button
          type="button"
          onClick={toggleSound}
          aria-label={isSoundActive ? 'Tắt âm thanh sinh thái' : 'Bật âm thanh sinh thái'}
          className={cn(
            'flex items-center gap-1.5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C5A262]',
            isSoundActive ? 'font-medium text-[#C5A262]' : 'text-zinc-300 hover:text-white',
          )}
        >
          {isSoundActive ? (
            <>
              <span className="flex h-3 items-end gap-0.5" aria-hidden="true">
                <span className="inline-block h-2 w-0.5 animate-pulse bg-[#C5A262]" />
                <span className="inline-block h-3 w-0.5 animate-pulse bg-[#C5A262] delay-75" />
                <span className="inline-block h-1.5 w-0.5 animate-pulse bg-[#C5A262] delay-150" />
              </span>
              <span>Róc rách & Dế đêm</span>
            </>
          ) : (
            <>
              <span aria-hidden="true">🔇</span>
              <span>Âm thanh</span>
            </>
          )}
        </button>
      </div>

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
          effectiveTheme === 'day'
            ? 'from-[#F5F4EF] via-[#F5F4EF]/60 to-transparent'
            : 'from-[#040D08]/90 via-[#040D08]/50 to-transparent',
        )}
        aria-hidden="true"
      />

      {/* Mép dưới hồ sen (Bottom blend) */}
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t transition-colors duration-700',
          effectiveTheme === 'day'
            ? 'from-[#1D4A37] to-transparent'
            : 'from-[#040D08] to-transparent',
        )}
        aria-hidden="true"
      />
    </section>
  );
};

export default GrandLotusLake;
