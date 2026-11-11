import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { EVENT_OPEN_INTRO, INTRO_STORAGE_KEY } from './introEvents';
import {
  type ComputedPortalTransform,
  INTRO_REDUCED_DURATION_S,
  INTRO_TOTAL_DURATION_S,
  PORTAL_DISMISS_DURATION_S,
  renderKhueVanCanvas,
} from './khueVanCanvas';

export interface WaterTouchIntroProps {
  readonly onFinish?: () => void;
}

interface DismissTransitionState {
  readonly startTime: number;
  readonly startPortalRadius: number;
  readonly startScale: number;
  readonly startRotation: number;
  readonly frozenElapsed: number;
}

/**
 * COMPONENT: MÀN HÌNH MỞ ĐẦU "THIÊN CẦU KHUÊ VĂN CÁC"
 *
 * Nghi thức thị giác thuần HTML5 Canvas 2D (Zero Text UI):
 * - Bảng màu sáng hoàng cung: giấy dó #FFFDF9 -> #EDE8D8, đỏ chu sa #C83E37,
 *   vàng thếp #C5A262 / #8A6A2F và xanh men ngọc #4E9B58.
 * - Tâm điểm: Lưới Trắc Địa Đĩa Poincaré 16 điểm (2 tầng xoay ngược tạo mộng gỗ moiré),
 *   Phép Dựng Hình Compa Euclid (4 đường tròn 0.5*R1 + tia quét + 8 giao điểm ngọc),
 *   Ấn Tâm Hoa Thị Vàng 8 cánh r = 0.18*R1*cos(4θ) & Hỗn Thiên Nghi 3D.
 * - Không gian ngoại vi: 16 Dòng Chảy Tơ Sơn Mài, sao băng quỹ đạo 12 đoạn (0.85 -> 0) & Parallax 3 lớp theo chuột.
 * - Kịch bản 7.5s gồm 3 hồi (Trời tròn Đất vuông -> Thiên cầu & 16 sao Khuê -> Cửa sổ thấu quang destination-out).
 * - Click / chạm / phím bất kỳ: Tua nhanh mở rộng cửa sổ tròn trong 0.45s để vào Trang chủ.
 * - Hỗ trợ Retina DPI, ResizeObserver và prefers-reduced-motion (1.5s).
 */
export const WaterTouchIntro: FC<WaterTouchIntroProps> = ({ onFinish }) => {
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      // Dọn dẹp cờ cũ trong localStorage (nếu có) để tránh bị chặn bởi phiên bản trước
      localStorage.removeItem(INTRO_STORAGE_KEY);
      return sessionStorage.getItem(INTRO_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const [isDismissing, setIsDismissing] = useState<boolean>(false);

  const containerRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isDismissingRef = useRef<boolean>(false);
  const finishedRef = useRef<boolean>(false);
  const dismissInfoRef = useRef<DismissTransitionState | null>(null);
  const lastElapsedRef = useRef<number>(0);
  const lastTransformRef = useRef<ComputedPortalTransform>({
    portalRadius: 0,
    sceneScale: 1,
    sceneRotation: 0,
  });
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const animFrameRef = useRef<number>(0);
  const autoTimerRef = useRef<number | null>(null);
  const dismissTimerRef = useRef<number | null>(null);

  // Dọn dẹp cờ cũ trong localStorage khi mount
  useEffect(() => {
    try {
      localStorage.removeItem(INTRO_STORAGE_KEY);
    } catch {
      // Bỏ qua lỗi storage
    }
  }, []);

  // Hoàn tất quy trình: ghi cờ sessionStorage và gỡ bỏ khỏi DOM
  const finishUnmount = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;

    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
    } catch {
      // Bỏ qua lỗi storage
    }

    if (autoTimerRef.current !== null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    setIsVisible(false);
    onFinish?.();

    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus({ preventScroll: true });
    }
  }, [onFinish]);

  // Kích hoạt tua nhanh sang trạng thái mở rộng cửa sổ tròn 0.45s ngay khi người dùng tương tác
  const handleDismiss = useCallback(() => {
    if (isDismissingRef.current || finishedRef.current) return;
    isDismissingRef.current = true;

    try {
      sessionStorage.setItem(INTRO_STORAGE_KEY, 'true');
    } catch {
      // Bỏ qua lỗi storage
    }

    if (autoTimerRef.current !== null) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }

    dismissInfoRef.current = {
      startTime: performance.now(),
      startPortalRadius: lastTransformRef.current.portalRadius,
      startScale: lastTransformRef.current.sceneScale,
      startRotation: lastTransformRef.current.sceneRotation,
      frozenElapsed: lastElapsedRef.current,
    };

    setIsDismissing(true);

    // Đảm bảo luôn unmount sau đúng 0.45s ngay cả khi tab bị throttle hoặc chạy trong jsdom test
    dismissTimerRef.current = window.setTimeout(() => {
      finishUnmount();
    }, PORTAL_DISMISS_DURATION_S * 1000);
  }, [finishUnmount]);

  // Lắng nghe sự kiện mở lại Intro từ bên ngoài (nếu có)
  useEffect(() => {
    const handleReopen = () => {
      try {
        sessionStorage.removeItem(INTRO_STORAGE_KEY);
        localStorage.removeItem(INTRO_STORAGE_KEY);
      } catch {
        // Bỏ qua lỗi storage
      }
      finishedRef.current = false;
      isDismissingRef.current = false;
      dismissInfoRef.current = null;
      lastElapsedRef.current = 0;
      lastTransformRef.current = { portalRadius: 0, sceneScale: 1, sceneRotation: 0 };
      mouseTargetRef.current = { x: 0, y: 0 };
      mouseCurrentRef.current = { x: 0, y: 0 };
      setIsDismissing(false);
      setIsVisible(true);
    };

    window.addEventListener(EVENT_OPEN_INTRO, handleReopen);
    return () => window.removeEventListener(EVENT_OPEN_INTRO, handleReopen);
  }, []);

  // Tự động hoàn tất sau 7.5s (hoặc 1.5s khi bật prefers-reduced-motion) nếu không có tương tác
  useEffect(() => {
    if (!isVisible) return;

    const totalMs =
      (prefersReducedMotion ? INTRO_REDUCED_DURATION_S : INTRO_TOTAL_DURATION_S) * 1000;
    autoTimerRef.current = window.setTimeout(() => {
      finishUnmount();
    }, totalMs);

    return () => {
      if (autoTimerRef.current !== null) {
        window.clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
    };
  }, [isVisible, prefersReducedMotion, finishUnmount]);

  // Lắng nghe phím bấm bất kỳ (Enter, Space, Esc, v.v.) để bỏ qua ngay lập tức
  useEffect(() => {
    if (!isVisible || isDismissing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isDismissingRef.current) return;

      // Tránh chặn thao tác gõ phím nếu tiêu điểm đang nằm trong ô nhập liệu nền dưới
      const target = e.target;
      const isFormInput =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement;
      if (isFormInput && e.key !== 'Escape') return;

      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
      }
      handleDismiss();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isDismissing, handleDismiss]);

  // Lắng nghe mousemove trên window để tính toán Parallax đa lớp và dọn sạch khi unmount
  useEffect(() => {
    if (!isVisible) return;

    const handleMouseMove = (e: MouseEvent) => {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      const mx = Math.max(-1, Math.min(1, (e.clientX / w) * 2 - 1));
      const my = Math.max(-1, Math.min(1, (e.clientY / h) * 2 - 1));
      mouseTargetRef.current = { x: mx, y: my };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isVisible]);

  // Vòng lặp 60FPS vẽ Thiên Cầu Khuê Văn Các & quản lý ResizeObserver + Retina DPR
  useEffect(() => {
    if (!isVisible) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let currentDpr = Math.min(window.devicePixelRatio || 1, 3);

    const updateCanvasSize = (nextW: number, nextH: number) => {
      const W = nextW > 0 ? nextW : window.innerWidth;
      const H = nextH > 0 ? nextH : window.innerHeight;
      viewportWidth = W;
      viewportHeight = H;
      currentDpr = Math.min(window.devicePixelRatio || 1, 3);

      canvas.width = Math.round(W * currentDpr);
      canvas.height = Math.round(H * currentDpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };

    const initialRect = container.getBoundingClientRect();
    updateCanvasSize(initialRect.width, initialRect.height);

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        updateCanvasSize(window.innerWidth, window.innerHeight);
        return;
      }
      updateCanvasSize(entry.contentRect.width, entry.contentRect.height);
    });
    resizeObserver.observe(container);

    const handleWindowResize = () => {
      updateCanvasSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleWindowResize);

    const timelineStart = performance.now();
    let prevFrameNow = timelineStart;
    const totalDurationS = prefersReducedMotion ? INTRO_REDUCED_DURATION_S : INTRO_TOTAL_DURATION_S;

    const renderFrame = (now: number) => {
      if (finishedRef.current) return;

      const dt = Math.min(0.05, Math.max(0, (now - prevFrameNow) / 1000));
      prevFrameNow = now;

      if (!prefersReducedMotion) {
        const lerpAlpha = 1 - Math.exp(-8.5 * dt);
        mouseCurrentRef.current.x +=
          (mouseTargetRef.current.x - mouseCurrentRef.current.x) * lerpAlpha;
        mouseCurrentRef.current.y +=
          (mouseTargetRef.current.y - mouseCurrentRef.current.y) * lerpAlpha;
      }

      const dismissInfo = dismissInfoRef.current;
      let elapsed = (now - timelineStart) / 1000;
      let dismissProgress: number | null = null;

      if (dismissInfo) {
        elapsed = dismissInfo.frozenElapsed;
        dismissProgress = Math.min(
          1,
          (now - dismissInfo.startTime) / (PORTAL_DISMISS_DURATION_S * 1000),
        );
        if (dismissProgress >= 1) {
          finishUnmount();
          return;
        }
      } else {
        lastElapsedRef.current = elapsed;
        if (elapsed >= totalDurationS) {
          finishUnmount();
          return;
        }
      }

      const transform = renderKhueVanCanvas(ctx, viewportWidth, viewportHeight, currentDpr, {
        elapsed,
        dismissProgress,
        dismissStartPortalRadius: dismissInfo?.startPortalRadius ?? 0,
        dismissStartScale: dismissInfo?.startScale ?? 1,
        dismissStartRotation: dismissInfo?.startRotation ?? 0,
        prefersReducedMotion,
        parallaxX: prefersReducedMotion ? 0 : mouseCurrentRef.current.x,
        parallaxY: prefersReducedMotion ? 0 : mouseCurrentRef.current.y,
      });

      lastTransformRef.current = transform;
      animFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [isVisible, prefersReducedMotion, finishUnmount]);

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="Màn hình mở đầu Thiên Cầu Khuê Văn Các"
      tabIndex={0}
      onClick={handleDismiss}
      onTouchStart={handleDismiss}
      onKeyDown={handleDismiss}
      className={cn(
        'fixed inset-0 z-[100] select-none',
        isDismissing ? 'pointer-events-none cursor-default' : 'cursor-pointer',
      )}
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />
    </aside>
  );
};

export default WaterTouchIntro;
