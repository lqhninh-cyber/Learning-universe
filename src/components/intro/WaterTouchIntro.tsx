import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { EVENT_OPEN_INTRO, INTRO_STORAGE_KEY } from './introEvents';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  color: string;
}

export interface WaterTouchIntroProps {
  readonly onFinish?: () => void;
}

/**
 * COMPONENT: "CHẠM MẶT NƯỚC" (TOUCH THE WATER) INTRO OVERLAY
 *
 * Màn hình mở đầu tri thức với hoa sen 9 cánh thuần toán học:
 * - Phương trình cực: r(θ) = R · |cos(9θ / 2)|^0.75
 * - Nét viền vàng thếp cổ #C5A262, chuyển sắc hồng phấn ngọc và trắng giấy dó #F5F2EB.
 * - Sóng nước đồng tâm (Concentric Water Ripples).
 * - Tự động ghi nhớ localStorage('lu_intro_seen'), hỗ trợ nút "Bỏ qua", phím tắt Enter/Space/Esc
 *   và chuẩn tiếp cận WCAG (inert background, prefers-reduced-motion).
 */
export const WaterTouchIntro: FC<WaterTouchIntroProps> = ({ onFinish }) => {
  // Kiểm tra prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(INTRO_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const [phase, setPhase] = useState<'idle' | 'blooming' | 'bloomed' | 'dismissing'>(() =>
    prefersReducedMotion ? 'bloomed' : 'idle',
  );
  const [isDismissing, setIsDismissing] = useState<boolean>(false);
  const [bloomProgress, setBloomProgress] = useState<number>(() => (prefersReducedMotion ? 1 : 0));

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const ripplesRef = useRef<Ripple[]>([]);
  const lastRippleTimeRef = useRef<number>(0);
  const autoTimeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const enterBtnRef = useRef<HTMLButtonElement>(null);

  // Lắng nghe sự kiện mở lại Intro từ bên ngoài
  useEffect(() => {
    const handleReopen = () => {
      setIsDismissing(false);
      setBloomProgress(0);
      setPhase('idle');
      setIsVisible(true);
      ripplesRef.current = [];
    };

    window.addEventListener(EVENT_OPEN_INTRO, handleReopen);
    return () => window.removeEventListener(EVENT_OPEN_INTRO, handleReopen);
  }, []);

  // Xử lý đóng Intro và lưu cờ
  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(INTRO_STORAGE_KEY, 'true');
    } catch {
      // Bỏ qua lỗi storage
    }

    setIsDismissing(true);
    setPhase('dismissing');

    // Chờ hiệu ứng clip-path kết thúc trước khi gỡ khỏi DOM
    const timer = window.setTimeout(() => {
      setIsVisible(false);
      onFinish?.();

      // Trả lại focus cho nội dung chính
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus({ preventScroll: true });
      }
    }, 750);

    return () => window.clearTimeout(timer);
  }, [onFinish]);

  // Kích hoạt chuỗi bung nở sen
  const triggerBloom = useCallback(
    (clientX?: number, clientY?: number) => {
      if (phase !== 'idle') return;

      if (autoTimeoutRef.current) {
        window.clearTimeout(autoTimeoutRef.current);
        autoTimeoutRef.current = null;
      }

      const canvas = canvasRef.current;
      const rect = canvas?.getBoundingClientRect();
      const originX =
        clientX !== undefined && rect ? clientX - rect.left : (rect?.width ?? 400) / 2;
      const originY =
        clientY !== undefined && rect ? clientY - rect.top : (rect?.height ?? 400) / 2;

      setPhase('blooming');
      startTimeRef.current = performance.now();

      // Thêm 3 vòng sóng nước dồn dập từ điểm chạm
      const newRipples: Ripple[] = [
        {
          x: originX,
          y: originY,
          radius: 10,
          maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.65,
          alpha: 0.7,
          speed: 180,
          color: '#C5A262',
        },
        {
          x: originX,
          y: originY,
          radius: 5,
          maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.55,
          alpha: 0.5,
          speed: 140,
          color: '#739B88',
        },
        {
          x: originX,
          y: originY,
          radius: 0,
          maxRadius: Math.max(window.innerWidth, window.innerHeight) * 0.45,
          alpha: 0.4,
          speed: 110,
          color: '#E5C378',
        },
      ];
      ripplesRef.current.push(...newRipples);
    },
    [phase],
  );

  // Tự động kích hoạt chuỗi bung nở sau 4 giây nếu người dùng không chạm
  useEffect(() => {
    if (!isVisible || phase !== 'idle' || prefersReducedMotion) return;

    autoTimeoutRef.current = window.setTimeout(() => {
      triggerBloom();
    }, 4000);

    return () => {
      if (autoTimeoutRef.current) {
        window.clearTimeout(autoTimeoutRef.current);
      }
    };
  }, [isVisible, phase, prefersReducedMotion, triggerBloom]);

  // Ngăn chặn tương tác bàn phím lọt ra ngoài (Accessibility: inert)
  useEffect(() => {
    if (!isVisible) return;

    const readingContainer = document.getElementById('reading-container');
    if (readingContainer) {
      readingContainer.setAttribute('inert', '');
    }

    return () => {
      if (readingContainer) {
        readingContainer.removeAttribute('inert');
      }
    };
  }, [isVisible]);

  // Lắng nghe phím Enter, Space, Escape để đóng ngay lập tức
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleDismiss();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (phase === 'idle') {
          triggerBloom();
        } else {
          handleDismiss();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, phase, handleDismiss, triggerBloom]);

  // Render Loop Canvas cho Hoa sen cực & Sóng nước
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    let lastTime = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Vẽ đóa sen cực 9 cánh theo tiến độ P (0 -> 1)
    const drawLotus = (cx: number, cy: number, R: number, P: number, timestamp: number) => {
      if (P <= 0.02) {
        // Giai đoạn 1: Nụ sen khép tĩnh
        const breath = 1 + 0.04 * Math.sin(timestamp * 0.003);
        const budR = 26 * breath;

        // Quầng sáng thở nhẹ
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, budR * 2.5);
        halo.addColorStop(0, 'rgba(197, 162, 98, 0.25)');
        halo.addColorStop(0.5, 'rgba(115, 155, 136, 0.12)');
        halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, budR * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 3 Cánh nụ sen chụm
        ctx.save();
        ctx.translate(cx, cy);

        // Cánh trái
        ctx.beginPath();
        ctx.moveTo(0, -budR);
        ctx.bezierCurveTo(-budR * 0.7, -budR * 0.4, -budR * 0.7, budR * 0.6, 0, budR * 0.8);
        ctx.bezierCurveTo(-budR * 0.2, budR * 0.4, -budR * 0.2, -budR * 0.6, 0, -budR);
        ctx.fillStyle = 'rgba(226, 149, 167, 0.65)';
        ctx.fill();
        ctx.strokeStyle = '#C5A262';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Cánh phải
        ctx.beginPath();
        ctx.moveTo(0, -budR);
        ctx.bezierCurveTo(budR * 0.7, -budR * 0.4, budR * 0.7, budR * 0.6, 0, budR * 0.8);
        ctx.bezierCurveTo(budR * 0.2, budR * 0.4, budR * 0.2, -budR * 0.6, 0, -budR);
        ctx.fillStyle = 'rgba(244, 214, 220, 0.75)';
        ctx.fill();
        ctx.strokeStyle = '#E5C378';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Cánh giữa đỉnh búp
        ctx.beginPath();
        ctx.moveTo(0, -budR * 1.15);
        ctx.bezierCurveTo(-budR * 0.35, -budR * 0.5, -budR * 0.3, budR * 0.5, 0, budR * 0.7);
        ctx.bezierCurveTo(budR * 0.3, budR * 0.5, budR * 0.35, -budR * 0.5, 0, -budR * 1.15);
        ctx.fillStyle = 'rgba(250, 246, 238, 0.9)';
        ctx.fill();
        ctx.strokeStyle = '#C5A262';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
        return;
      }

      // Giai đoạn 2 & 3: Bung nở theo phương trình cực 9 cánh r(θ) = R · P · |cos(9θ/2)|^0.75
      ctx.save();
      ctx.translate(cx, cy);

      // Quầng hào quang sen nở
      const bloomHalo = ctx.createRadialGradient(0, 0, 0, 0, 0, R * P * 1.35);
      bloomHalo.addColorStop(0, 'rgba(197, 162, 98, 0.35)');
      bloomHalo.addColorStop(0.4, 'rgba(226, 149, 167, 0.18)');
      bloomHalo.addColorStop(0.8, 'rgba(115, 155, 136, 0.08)');
      bloomHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bloomHalo;
      ctx.beginPath();
      ctx.arc(0, 0, R * P * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // --- TẦNG 1: 9 CÁNH SEN NGOÀI (Outer 9 Petals) ---
      const outerPoints = 360;
      ctx.beginPath();
      for (let i = 0; i <= outerPoints; i++) {
        const theta = (i / outerPoints) * Math.PI * 2;
        // Phương trình cực hoa sen 9 cánh: r = R · P · |cos(4.5 · θ)|^0.75
        const cosTerm = Math.abs(Math.cos(4.5 * theta));
        const r = R * P * Math.pow(cosTerm, 0.72);
        const px = r * Math.cos(theta);
        const py = r * Math.sin(theta);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();

      // Gradient tô chuyển sắc hoa sen
      const outerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, R * P);
      outerGrad.addColorStop(0, 'rgba(252, 235, 203, 0.95)');
      outerGrad.addColorStop(0.35, 'rgba(226, 149, 167, 0.85)');
      outerGrad.addColorStop(0.75, 'rgba(244, 214, 220, 0.7)');
      outerGrad.addColorStop(1, 'rgba(250, 246, 238, 0.95)');
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // Viền mạ vàng thếp cổ #C5A262 siêu mảnh 1.2px
      ctx.strokeStyle = '#C5A262';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // --- TẦNG 2: 9 CÁNH SEN TRONG (Inner 9 Petals, lệch 20 độ = π/9) ---
      const innerR = R * 0.62;
      ctx.beginPath();
      for (let i = 0; i <= outerPoints; i++) {
        const theta = (i / outerPoints) * Math.PI * 2;
        const cosTerm = Math.abs(Math.cos(4.5 * (theta - Math.PI / 9)));
        const r = innerR * P * Math.pow(cosTerm, 0.75);
        const px = r * Math.cos(theta);
        const py = r * Math.sin(theta);
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();

      const innerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerR * P);
      innerGrad.addColorStop(0, 'rgba(255, 245, 210, 0.98)');
      innerGrad.addColorStop(0.45, 'rgba(222, 123, 146, 0.88)');
      innerGrad.addColorStop(0.85, 'rgba(255, 245, 247, 0.92)');
      innerGrad.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
      ctx.fillStyle = innerGrad;
      ctx.fill();

      ctx.strokeStyle = '#E5C378';
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // --- TẦNG 3: ĐÀI SEN VÀNG & NHỤY HOA NGỌC TRI THỨC (Center Core) ---
      const coreR = Math.max(3, 16 * P);
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR);
      coreGrad.addColorStop(0, '#FFE8A3');
      coreGrad.addColorStop(0.7, '#C5A262');
      coreGrad.addColorStop(1, '#8A6A2F');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#E5C378';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 9 hạt nhụy sen đối xứng
      if (P > 0.4) {
        ctx.fillStyle = '#4A3515';
        const numSeeds = 9;
        const seedRingR = coreR * 0.58;
        for (let s = 0; s < numSeeds; s++) {
          const sAngle = (s / numSeeds) * Math.PI * 2;
          const sx = seedRingR * Math.cos(sAngle);
          const sy = seedRingR * Math.sin(sAngle);
          ctx.beginPath();
          ctx.arc(sx, sy, 1.4 * P, 0, Math.PI * 2);
          ctx.fill();
        }
        // Hạt tâm đài
        ctx.beginPath();
        ctx.arc(0, 0, 1.8 * P, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    // Render loop chính
    const render = (timestamp: number) => {
      if (!isMounted) return;

      const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
      lastTime = timestamp;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Nền sương mai / nước hồ xanh rêu đêm huyền ảo (#081611)
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#081611';
      ctx.fillRect(0, 0, w, h);

      // Gradient chiều sâu nước hồ
      const waterGrad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, Math.max(w, h));
      waterGrad.addColorStop(0, 'rgba(10, 38, 29, 0.95)');
      waterGrad.addColorStop(0.5, 'rgba(8, 22, 17, 0.98)');
      waterGrad.addColorStop(1, '#050D0A');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, w, h);

      // Cập nhật tiến độ bung nở nếu đang ở phase 'blooming'
      if (phase === 'blooming') {
        const elapsed = (timestamp - startTimeRef.current) / 1000;
        const duration = 1.35; // 1.35s cho hoa nở trọn vẹn
        const t = Math.min(elapsed / duration, 1);
        // Easing: easeOutCubic
        const ease = 1 - Math.pow(1 - t, 3);
        setBloomProgress(ease);

        if (t >= 1) {
          setPhase('bloomed');
        }
      }

      // Tạo sóng lăn tăn nhẹ ở trạng thái tĩnh
      if (phase === 'idle' && timestamp - lastRippleTimeRef.current > 2200) {
        lastRippleTimeRef.current = timestamp;
        ripplesRef.current.push({
          x: w / 2,
          y: h / 2,
          radius: 12,
          maxRadius: Math.min(w, h) * 0.45,
          alpha: 0.35,
          speed: 65,
          color: '#739B88',
        });
      }

      // Vẽ và cập nhật các vòng sóng nước lan tỏa (Water Ripples)
      const currentRipples = ripplesRef.current;
      for (let i = currentRipples.length - 1; i >= 0; i--) {
        const r = currentRipples[i];
        if (!r) continue;
        r.radius += r.speed * dt;
        const life = r.radius / r.maxRadius;
        r.alpha = Math.max(0, 0.65 * (1 - life));

        if (r.alpha <= 0.01 || r.radius >= r.maxRadius) {
          currentRipples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = r.alpha;
        ctx.lineWidth = 1.0;
        ctx.stroke();
        ctx.restore();
      }

      // Vẽ Đóa sen cực toán học
      const maxLotusR = Math.min(w, h) * 0.22;
      drawLotus(w / 2, h / 2, maxLotusR, bloomProgress, timestamp);

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isVisible, phase, bloomProgress]);

  // Tự động focus nút "Bước vào" khi hoa đã nở xong
  useEffect(() => {
    if (phase === 'bloomed' && enterBtnRef.current) {
      enterBtnRef.current.focus();
    }
  }, [phase]);

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Màn hình tĩnh tâm mở đầu"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (phase === 'idle') {
          triggerBloom(e.clientX, e.clientY);
        }
      }}
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-between select-none',
        'bg-[#081611] text-[#F5F2EB]',
        'transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]',
        isDismissing &&
          'pointer-events-none scale-105 opacity-0 [clip-path:circle(150%_at_center)]',
      )}
      style={{
        clipPath: isDismissing ? 'circle(150% at center)' : 'circle(100% at center)',
        transition: 'clip-path 0.75s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease',
      }}
    >
      {/* Nút BỎ QUA nhanh ở góc trên bên phải, khả dụng ngay từ giây 0 */}
      <div className="fixed top-6 right-6 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleDismiss();
          }}
          className="cursor-pointer rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 font-mono text-xs tracking-wider text-[#CBD5CE] backdrop-blur-md transition-all duration-200 hover:border-[#C5A262] hover:bg-black/60 hover:text-[#E5C378]"
          title="Bỏ qua màn hình mở đầu (Phím Esc)"
          aria-label="Bỏ qua màn hình mở đầu"
        >
          Bỏ qua [Esc]
        </button>
      </div>

      {/* Canvas 2D toàn màn hình vẽ Hoa sen cực và Gợn sóng nước */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full cursor-pointer touch-none"
        aria-hidden="true"
      />

      {/* Lời tựa đỉnh đầu */}
      <header className="relative z-10 flex flex-col items-center pt-10 sm:pt-14">
        <span className="font-mono text-[11px] tracking-[0.25em] text-[#C5A262] uppercase">
          Learning Universe · Nghi thức khởi tâm
        </span>
      </header>

      {/* Khu vực tâm màn hình: Hướng dẫn chạm khi còn ở phase idle */}
      {phase === 'idle' && (
        <div className="pointer-events-none relative z-10 -mt-12 flex flex-col items-center space-y-2 text-center">
          <div className="h-44 w-44" aria-hidden="true" />
          <p className="animate-pulse font-serif text-sm tracking-wide text-[#CBD5CE]/80">
            — Chạm nhẹ vào mặt nước để thức tỉnh tri thức —
          </p>
        </div>
      )}

      {/* Chân màn hình: Câu châm ngôn & Nút Bước vào */}
      <footer className="relative z-10 flex flex-col items-center space-y-6 pb-12 sm:pb-16">
        {/* Câu danh ngôn in nghiêng trang trọng */}
        <div
          className={cn(
            'max-w-md px-6 text-center transition-all duration-700',
            phase === 'bloomed' || prefersReducedMotion
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0',
          )}
        >
          <blockquote className="font-serif text-base leading-relaxed text-[#F5F2EB] italic sm:text-lg">
            “Đi một ngày đàng, học một sàng khôn.”
          </blockquote>
          <cite className="mt-1.5 block font-mono text-xs text-[#C5A262] not-italic">
            — Tục ngữ Việt Nam
          </cite>
        </div>

        {/* Nút "Bước vào" */}
        <div
          className={cn(
            'transition-all duration-500',
            phase === 'bloomed' || prefersReducedMotion
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-4 opacity-0',
          )}
        >
          <button
            ref={enterBtnRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="group relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-[#C5A262] bg-[#0A261D]/80 px-8 py-3 text-sm font-semibold tracking-wide text-[#F5F2EB] shadow-[0_0_20px_rgba(197,162,98,0.25)] backdrop-blur-md transition-all duration-300 hover:border-[#E5C378] hover:bg-[#C5A262] hover:text-[#081611] hover:shadow-[0_0_30px_rgba(197,162,98,0.5)] active:scale-95"
          >
            <span>Bước vào không gian học tập</span>
            <span
              className="text-[#E5C378] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#081611]"
              aria-hidden="true"
            >
              →
            </span>
          </button>
        </div>
      </footer>
    </aside>
  );
};

export default WaterTouchIntro;
