import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openWaterTouchIntro, WaterTouchIntro } from './index';
import {
  computePortalTransform,
  easeInOutExpo,
  easeInOutQuart,
  easeOutCubic,
  getWindowRadius,
  renderKhueVanCanvas,
} from './khueVanCanvas';

describe('WaterTouchIntro Component (Thiên Cầu Khuê Văn Các)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('hiển thị màn hình mở đầu thuần Canvas Zero-Text khi chưa có cờ lu_intro_seen', () => {
    const { container } = render(<WaterTouchIntro />);

    const dialog = screen.getByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i });
    expect(dialog).toBeInTheDocument();

    // Tuyệt đối không có bất kỳ văn bản chữ hay nút bấm nào
    expect(dialog.textContent).toBe('');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    // Chứa canvas phủ kín
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('không hiển thị khi sessionStorage đã đánh dấu lu_intro_seen = true', () => {
    sessionStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(
      screen.queryByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i }),
    ).not.toBeInTheDocument();
  });

  it('dọn dẹp cờ cũ trong localStorage khi mount', () => {
    localStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(localStorage.getItem('lu_intro_seen')).toBeNull();
    expect(screen.getByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i })).toBeInTheDocument();
  });

  it('nhấn chuột bất kỳ đâu lập tức lưu cờ sessionStorage, đặt pointer-events-none và unmount sau 0.45s', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();
    render(<WaterTouchIntro onFinish={onFinish} />);

    const dialog = screen.getByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i });
    fireEvent.click(dialog);

    expect(sessionStorage.getItem('lu_intro_seen')).toBe('true');
    expect(dialog).toHaveClass('pointer-events-none');
    expect(onFinish).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i }),
    ).not.toBeInTheDocument();
  });

  it('nhấn phím bất kỳ (Enter, Space, Esc) kích hoạt bỏ qua ngay lập tức', () => {
    vi.useFakeTimers();
    render(<WaterTouchIntro />);

    expect(screen.getByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Enter' });
    expect(sessionStorage.getItem('lu_intro_seen')).toBe('true');

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(
      screen.queryByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i }),
    ).not.toBeInTheDocument();
  });

  it('tự động hoàn tất kịch bản 7.5s, lưu sessionStorage và gỡ khỏi DOM', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();
    render(<WaterTouchIntro onFinish={onFinish} />);

    expect(screen.getByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(7400);
    });
    expect(onFinish).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(sessionStorage.getItem('lu_intro_seen')).toBe('true');
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i }),
    ).not.toBeInTheDocument();
  });

  it('rút ngắn xuống 1.5s khi bật prefers-reduced-motion', () => {
    vi.useFakeTimers();
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    try {
      const onFinish = vi.fn();
      render(<WaterTouchIntro onFinish={onFinish} />);

      act(() => {
        vi.advanceTimersByTime(1400);
      });
      expect(onFinish).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(150);
      });
      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(sessionStorage.getItem('lu_intro_seen')).toBe('true');
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        configurable: true,
        value: originalMatchMedia,
      });
    }
  });

  it('hàm openWaterTouchIntro() kích hoạt mở lại màn hình mở đầu', () => {
    sessionStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(
      screen.queryByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i }),
    ).not.toBeInTheDocument();

    act(() => {
      openWaterTouchIntro();
    });

    expect(screen.getByRole('dialog', { name: /Thiên Cầu Khuê Văn Các/i })).toBeInTheDocument();
  });
});

describe('KhueVanCanvas Math & Portal Choreography', () => {
  it('tính toán đúng các hàm nội suy mượt và biến đổi cổng thấu quang qua 3 hồi', () => {
    expect(easeOutCubic(0)).toBe(0);
    expect(easeOutCubic(1)).toBe(1);
    expect(easeInOutQuart(0.5)).toBeCloseTo(0.5, 5);
    expect(easeInOutExpo(0)).toBe(0);
    expect(easeInOutExpo(1)).toBe(1);

    const w = 1440;
    const h = 900;
    const r1 = getWindowRadius(w, h);
    // Phóng to +20% (minDim * 0.162 = 145.8 trên 1440x900)
    expect(r1).toBeCloseTo(900 * 0.162, 4);

    // Hồi I & II: cửa sổ thấu quang chưa mở (portalRadius = 0)
    const act2 = computePortalTransform(w, h, {
      elapsed: 3.5,
      dismissProgress: null,
      dismissStartPortalRadius: 0,
      dismissStartScale: 1,
      dismissStartRotation: 0,
      prefersReducedMotion: false,
    });
    expect(act2.portalRadius).toBe(0);

    // Hồi III (t = 7.5s): cổng mở vượt qua đường chéo màn hình
    const act3End = computePortalTransform(w, h, {
      elapsed: 7.5,
      dismissProgress: null,
      dismissStartPortalRadius: 0,
      dismissStartScale: 1,
      dismissStartRotation: 0,
      prefersReducedMotion: false,
    });
    expect(act3End.portalRadius).toBeGreaterThanOrEqual(Math.hypot(w, h));
  });

  it('vẽ Hỗn Thiên Nghi 3D, Mặt Trời 12 tia, Khung viền Sắc Phong 16:9 và destination-out ở Hồi III', () => {
    const compositeOps: string[] = [];
    const mockGrad = { addColorStop: vi.fn() };
    const mockCtx = {
      save: vi.fn(),
      restore: vi.fn(),
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      beginPath: vi.fn(),
      closePath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      arc: vi.fn(),
      ellipse: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      setLineDash: vi.fn(),
      createRadialGradient: vi.fn(() => mockGrad),
      set fillStyle(_v: unknown) {},
      set strokeStyle(_v: unknown) {},
      set lineWidth(_v: number) {},
      globalAlpha: 1,
      get globalCompositeOperation() {
        return 'source-over';
      },
      set globalCompositeOperation(op: string) {
        compositeOps.push(op);
      },
    } as unknown as CanvasRenderingContext2D;

    // Kiểm tra Hồi II trên màn hình rộng 1920x1080: 3 vòng elip Hỗn Thiên Nghi & Khung viền kép
    renderKhueVanCanvas(mockCtx, 1920, 1080, 2, {
      elapsed: 4.2,
      dismissProgress: null,
      dismissStartPortalRadius: 0,
      dismissStartScale: 1,
      dismissStartRotation: 0,
      prefersReducedMotion: false,
    });

    expect(mockCtx.ellipse).toHaveBeenCalledTimes(3);
    expect(mockCtx.strokeRect).toHaveBeenCalledTimes(2);
    expect(mockCtx.clip).toHaveBeenCalledTimes(1);

    // Kiểm tra Hồi III: cổng thấu quang destination-out
    renderKhueVanCanvas(mockCtx, 1920, 1080, 2, {
      elapsed: 6.2,
      dismissProgress: null,
      dismissStartPortalRadius: 0,
      dismissStartScale: 1,
      dismissStartRotation: 0,
      prefersReducedMotion: false,
    });

    expect(compositeOps).toContain('destination-out');
  });
});
