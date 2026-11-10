import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { EVENT_OPEN_INTRO, INTRO_STORAGE_KEY } from './introEvents';

export interface WaterTouchIntroProps {
  readonly onFinish?: () => void;
}

/**
 * COMPONENT: MÀN HÌNH MỞ ĐẦU MẶT TRỜI ĐÔNG SƠN (CINNABAR DONG SON SOLAR CANVAS)
 *
 * Nghi thức thị giác văn hóa Việt Nam thuần Canvas 2D:
 * - TUYỆT ĐỐI KHÔNG CHỮ (Zero Text UI).
 * - Giai đoạn 1 (0s - 1.2s): Điểm sáng đỏ chu sa (#C23B38) bừng sáng quầng hào quang mềm mại (#A8282B -> #6B171A).
 * - Giai đoạn 2 (1.2s - 2.8s): 14 tia sáng tam giác nhọn Vàng Thếp (#D4AF37) vươn 360 độ (tọa độ cực)
 *   cùng 2 vòng tròn đồng tâm kỷ hà mảnh (1px) nét đứt & chấm bi màu vàng son mở rộng theo sóng nước âm vang.
 * - Giai đoạn 3 (2.8s - 3.5s): Toàn bộ họa tiết mở rộng nhẹ (scale tăng dần) và mờ dần vào Trang chủ.
 * - Click chuột hoặc chạm bất kỳ đâu / nhấn phím bất kỳ (Enter, Space, Esc) để chuyển trang ngay lập tức.
 * - Tự động kết thúc sau 3.5 giây.
 * - Lưu trạng thái vào sessionStorage('lu_intro_seen').
 */
export const WaterTouchIntro: FC<WaterTouchIntroProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      // Dọn dẹp cờ cũ trong localStorage (nếu có) để tránh bị chặn
      localStorage.removeItem(INTRO_STORAGE_KEY);
      return sessionStorage.getItem(INTRO_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const [isDismissing, setIsDismissing] = useState<boolean>(false);
  const isDismissingRef = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const autoTimerRef = useRef<number | null>(null);
  const animFrameRef = useRef<number>(0);

  // Đảm bảo dọn dẹp cờ cũ trong localStorage khi mount
  useEffect(() => {
    try {
      localStorage.removeItem(INTRO_STORAGE_KEY);
    } catch {
      // Bỏ qua lỗi storage
    }
  }, []);

  // Xử lý đóng màn hình mở đầu ngay lập tức
  const handleDismiss = useCallback(() => {
    if (isDismissingRef.current) return;
    isDismissingRef.current = true;

    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
    } catch {
      // Bỏ qua lỗi storage
    }

    setIsDismissing(true);

    if (autoTimerRef.current) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    // Thời gian transition out 500ms trước khi gỡ khỏi DOM
    const timer = window.setTimeout(() => {
      setIsVisible(false);
      onFinish?.();

      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus({ preventScroll: true });
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [onFinish]);

  // Lắng nghe sự kiện mở lại Intro từ bên ngoài (nếu có)
  useEffect(() => {
    const handleReopen = () => {
      try {
        sessionStorage.removeItem(INTRO_STORAGE_KEY);
        localStorage.removeItem(INTRO_STORAGE_KEY);
      } catch {
        // Bỏ qua lỗi storage
      }
      isDismissingRef.current = false;
      setIsDismissing(false);
      setIsVisible(true);
    };

    window.addEventListener(EVENT_OPEN_INTRO, handleReopen);
    return () => window.removeEventListener(EVENT_OPEN_INTRO, handleReopen);
  }, []);

  // Tự động kết thúc sau 3.5 giây nếu không có tương tác
  useEffect(() => {
    if (!isVisible) return;

    autoTimerRef.current = window.setTimeout(() => {
      handleDismiss();
    }, 3500);

    return () => {
      if (autoTimerRef.current) {
        window.clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
    };
  }, [isVisible, handleDismiss]);

  // Lắng nghe phím bấm (Enter, Space, Esc) từ window để chuyển trang ngay lập tức
  useEffect(() => {
    if (!isVisible || isDismissing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDismissingRef.current) return;
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isDismissing, handleDismiss]);

  // Vòng lặp vẽ Canvas Mặt Trời Đông Sơn
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    const handleResize = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      width = W;
      height = H;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000; // Thời gian trôi qua tính bằng giây

      if (elapsed >= 3.5 && !isDismissingRef.current) {
        handleDismiss();
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.save();
      ctx.scale(dpr, dpr);

      // Nền đen than mộc Đông Sơn (#090D0B)
      ctx.fillStyle = '#090D0B';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);
      const baseR = minDim * 0.22;

      // Giai đoạn 3 (2.8s - 3.5s): Mở rộng nhẹ (scale tăng dần) và mờ dần
      let currentScale = 1.0;
      let currentAlpha = 1.0;
      if (elapsed > 2.8) {
        const p3 = Math.min(1, (elapsed - 2.8) / 0.7);
        currentScale = 1.0 + 0.16 * p3;
        currentAlpha = Math.max(0, 1.0 - 0.45 * p3);
      }

      ctx.globalAlpha = currentAlpha;
      ctx.translate(cx, cy);
      ctx.scale(currentScale, currentScale);
      ctx.translate(-cx, -cy);

      // --- GIAI ĐOẠN 1 (0s - 1.2s): Điểm sáng đỏ chu sa (#C23B38) & quầng hào quang mềm mại ---
      const p1 = Math.min(1, elapsed / 1.2);
      const e1 = p1 * p1 * (3 - 2 * p1); // Smooth easing

      // Quầng hào quang tỏa rộng mềm mại (#A8282B -> #6B171A -> trong suốt)
      const haloR = baseR * (0.35 + 1.25 * e1);
      const haloGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, haloR);
      haloGrad.addColorStop(0, `rgba(194, 59, 56, ${0.85 * e1})`); // Đỏ chu sa #C23B38
      haloGrad.addColorStop(0.35, `rgba(168, 40, 43, ${0.55 * e1})`); // #A8282B
      haloGrad.addColorStop(0.7, `rgba(107, 23, 26, ${0.25 * e1})`); // #6B171A
      haloGrad.addColorStop(1, 'rgba(9, 13, 11, 0)');

      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.fill();

      // Tâm hạt nhân sáng đỏ chu sa viền vàng
      const coreR = baseR * 0.18 * Math.min(1, elapsed / 0.6);
      if (coreR > 0) {
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        coreGrad.addColorStop(0, '#FFFDF8');
        coreGrad.addColorStop(0.35, '#E5C378');
        coreGrad.addColorStop(0.7, '#C23B38');
        coreGrad.addColorStop(1, '#6B171A');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- GIAI ĐOẠN 2 (1.2s - 2.8s): 14 tia sáng mặt trời hình tam giác nhọn Vàng Thếp (#D4AF37) & 2 vòng kỷ hà ---
      if (elapsed >= 0.7) {
        const p2 = Math.min(1, (elapsed - 0.7) / 1.7);
        const e2 = 1 - Math.pow(1 - p2, 3); // Ease-out cubic

        const numRays = 14;
        const deltaAngle = (Math.PI * 2) / numRays;
        const innerR = baseR * 0.22;
        const outerR = baseR * (0.22 + 0.82 * e2);
        const halfWidthAngle = deltaAngle * 0.38;

        // Vẽ 14 tia sáng tam giác nhọn vươn đều 360 độ (tọa độ cực: x = r*cos, y = r*sin)
        for (let i = 0; i < numRays; i++) {
          const theta = i * deltaAngle - Math.PI / 2;
          const leftBaseTheta = theta - halfWidthAngle;
          const rightBaseTheta = theta + halfWidthAngle;

          const x1 = cx + innerR * Math.cos(leftBaseTheta);
          const y1 = cy + innerR * Math.sin(leftBaseTheta);

          const tipX = cx + outerR * Math.cos(theta);
          const tipY = cy + outerR * Math.sin(theta);

          const x2 = cx + innerR * Math.cos(rightBaseTheta);
          const y2 = cy + innerR * Math.sin(rightBaseTheta);

          // Gradient ánh vàng thếp từ gốc ra đỉnh nhọn
          const rayGrad = ctx.createLinearGradient(
            cx + innerR * 0.5 * Math.cos(theta),
            cy + innerR * 0.5 * Math.sin(theta),
            tipX,
            tipY,
          );
          rayGrad.addColorStop(0, `rgba(229, 195, 120, ${0.95 * e2})`);
          rayGrad.addColorStop(0.5, `rgba(212, 175, 55, ${0.9 * e2})`); // #D4AF37
          rayGrad.addColorStop(1, `rgba(197, 162, 98, ${0.45 * e2})`);

          ctx.fillStyle = rayGrad;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(tipX, tipY);
          ctx.lineTo(x2, y2);
          ctx.closePath();
          ctx.fill();

          // Nét viền mảnh vàng thếp cho tia
          ctx.strokeStyle = `rgba(245, 242, 235, ${0.5 * e2})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();

          // Họa tiết tam giác con xen kẽ giữa các tia (đặc trưng văn hóa trống đồng Đông Sơn)
          if (e2 > 0.35) {
            const midTheta = theta + deltaAngle / 2;
            const subInnerR = innerR * 1.05;
            const subOuterR = innerR + (outerR - innerR) * 0.36;
            const subHalf = deltaAngle * 0.16;

            const subAlpha = Math.min(1, (e2 - 0.35) / 0.65);
            ctx.fillStyle = `rgba(194, 59, 56, ${0.75 * subAlpha})`;
            ctx.beginPath();
            ctx.moveTo(
              cx + subInnerR * Math.cos(midTheta - subHalf),
              cy + subInnerR * Math.sin(midTheta - subHalf),
            );
            ctx.lineTo(cx + subOuterR * Math.cos(midTheta), cy + subOuterR * Math.sin(midTheta));
            ctx.lineTo(
              cx + subInnerR * Math.cos(midTheta + subHalf),
              cy + subInnerR * Math.sin(midTheta + subHalf),
            );
            ctx.closePath();
            ctx.fill();
          }
        }

        // Vòng tròn trung tâm ôm lấy gốc 14 tia sáng
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.9 * e2})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.stroke();

        // --- 2 VÒNG TRÒN ĐỒNG TÂM KỶ HÀ MẢNH (1px) NÉT ĐỨT / CHẤM BI MÀU VÀNG SON ---
        // Vòng 1: Ôm sát đỉnh tia sáng, lan tỏa gợn sóng âm vang
        const ring1R = outerR * (1.06 + 0.04 * Math.sin(elapsed * 4));
        ctx.save();
        ctx.strokeStyle = `rgba(212, 175, 55, ${0.75 * e2})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, ring1R, 0, Math.PI * 2);
        ctx.stroke();

        // Chuỗi chấm bi kỷ hà (hạt cườm trống đồng) chạy dọc vòng 1
        const numDots = 28;
        ctx.fillStyle = `rgba(229, 195, 120, ${0.85 * e2})`;
        for (let j = 0; j < numDots; j++) {
          const dotAngle = (j * (Math.PI * 2)) / numDots + elapsed * 0.12;
          const dx = cx + ring1R * Math.cos(dotAngle);
          const dy = cy + ring1R * Math.sin(dotAngle);
          ctx.beginPath();
          ctx.arc(dx, dy, 1.25, 0, Math.PI * 2);
          ctx.fill();
        }

        // Vòng 2: Mở rộng ra ngoài theo hiệu ứng sóng nước âm vang
        const ring2R = outerR * (1.2 + 0.08 * e2);
        ctx.strokeStyle = `rgba(194, 59, 56, ${0.65 * e2})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 6]);
        ctx.beginPath();
        ctx.arc(cx, cy, ring2R, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      if (!isDismissingRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, handleDismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-label="Màn hình mở đầu Mặt Trời Đông Sơn"
      tabIndex={0}
      onClick={handleDismiss}
      onTouchStart={handleDismiss}
      onKeyDown={handleDismiss}
      className={cn(
        'fixed inset-0 z-[100] flex cursor-pointer items-center justify-center select-none',
        'bg-[#090D0B]',
        'transition-all duration-500 ease-out',
        isDismissing ? 'pointer-events-none scale-105 opacity-0' : 'scale-100 opacity-100',
      )}
    >
      {/* Canvas nghệ thuật phủ kín màn hình */}
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
    </aside>
  );
};

export default WaterTouchIntro;
