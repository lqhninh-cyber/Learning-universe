import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  computeLaserPointStyle,
  LASER_DARK_CORE_COLOR,
  LASER_GLOW_SHADOW_BLUR,
  LASER_HEAD_RADIUS,
  LASER_LIGHT_CORE_COLOR,
  LASER_MAX_CORE_WIDTH,
  LASER_POINT_TTL_MS,
  pruneExpiredLaserPoints,
  pruneExpiredLaserTrails,
  renderLaserOverlay,
  resolveLaserPalette,
  selectActiveInkPage,
  shouldKeepLaserLoopRunning,
  useInkNotebookStore,
  type LaserPoint,
  type LaserTrail,
} from '@/features/math-ink';
import { MathInkPage } from '@/pages/math-ink/MathInkPage';

describe('Bút Laser tự tan trên /bang-viet (laserEngine & MathInkPage)', () => {
  beforeEach(() => {
    useInkNotebookStore.getState().resetInkStore();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lọc hết hạn chính xác theo ngưỡng 1200ms và trả về mảng rỗng khi toàn bộ điểm đã tan', () => {
    expect(LASER_POINT_TTL_MS).toBe(1200);
    expect(LASER_MAX_CORE_WIDTH).toBe(3.5);
    expect(LASER_HEAD_RADIUS).toBe(4);
    expect(LASER_GLOW_SHADOW_BLUR).toBe(10);

    const points: readonly LaserPoint[] = [
      { x: 10, y: 10, createdAt: 1000 }, // hết hạn đúng mốc 2200ms
      { x: 20, y: 20, createdAt: 1001 }, // còn sống 1ms tại 2200ms
      { x: 30, y: 30, createdAt: 1800 }, // còn sống 800ms tại 2200ms
    ];

    // Tại t = 2200ms: điểm 1000ms chạm đúng 1200ms -> bị lọc bỏ
    const atBoundary = pruneExpiredLaserPoints(points, 2200);
    expect(atBoundary).toHaveLength(2);
    expect(atBoundary[0]!.createdAt).toBe(1001);
    expect(atBoundary[1]!.createdAt).toBe(1800);

    // Tại t = 3000ms: toàn bộ điểm đã hết hạn -> mảng rỗng hoàn toàn
    const allExpired = pruneExpiredLaserPoints(points, 3000);
    expect(allExpired).toEqual([]);

    // Kiểm tra mảng rỗng ban đầu
    expect(pruneExpiredLaserPoints([], 5000)).toEqual([]);

    // Lọc cấp trail: tự loại bỏ các trail đã rỗng
    const trails: readonly LaserTrail[] = [
      { colorPreset: 'default', points: [{ x: 1, y: 1, createdAt: 100 }] },
      { colorPreset: 'default', points: [{ x: 5, y: 5, createdAt: 1500 }] },
    ];
    const midTrails = pruneExpiredLaserTrails(trails, 1600);
    expect(midTrails).toHaveLength(1);
    expect(midTrails[0]!.points[0]!.createdAt).toBe(1500);

    const emptyTrails = pruneExpiredLaserTrails(trails, 2700);
    expect(emptyTrails).toEqual([]);
  });

  it('trả về điều kiện dừng requestAnimationFrame (0% CPU nhàn rỗi) và tính độ mờ / độ dày thu hẹp chuẩn xác', () => {
    expect(shouldKeepLaserLoopRunning([], false)).toBe(false);
    expect(shouldKeepLaserLoopRunning([], true)).toBe(true);
    expect(
      shouldKeepLaserLoopRunning(
        [{ colorPreset: 'default', points: [{ x: 10, y: 20, createdAt: 500 }] }],
        false,
      ),
    ).toBe(true);

    const pt: LaserPoint = { x: 100, y: 100, createdAt: 1000 };
    const fresh = computeLaserPointStyle(pt, 1000);
    const half = computeLaserPointStyle(pt, 1600);
    const nearEnd = computeLaserPointStyle(pt, 2100);
    const expired = computeLaserPointStyle(pt, 2200);

    expect(fresh.opacity).toBeCloseTo(1, 4);
    expect(fresh.width).toBeCloseTo(3.5, 4);

    expect(half.opacity).toBeGreaterThan(nearEnd.opacity);
    expect(half.opacity).toBeLessThan(fresh.opacity);
    expect(half.width).toBeGreaterThan(nearEnd.width);
    expect(half.width).toBeLessThan(fresh.width);

    expect(expired).toEqual({ life: 0, opacity: 0, width: 0 });
  });

  it('chọn đúng bảng màu Light (#FF4D4F) / Dark (#FF6B6B) và kết xuất đúng shadowBlur=10, r=4px, tự dừng khi hết hạn', () => {
    const lightPalette = resolveLaserPalette(false, 'default');
    const darkPalette = resolveLaserPalette(true, 'default');
    expect(lightPalette.core).toBe(LASER_LIGHT_CORE_COLOR);
    expect(darkPalette.core).toBe(LASER_DARK_CORE_COLOR);

    const arcCalls: number[][] = [];
    const shadowBlurs: number[] = [];
    const lineWidths: number[] = [];

    const mockCtx = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(() => {
        shadowBlurs.push(mockCtx.shadowBlur);
        lineWidths.push(mockCtx.lineWidth);
      }),
      arc: vi.fn((x: number, y: number, r: number) => {
        arcCalls.push([x, y, r]);
      }),
      fill: vi.fn(),
      globalAlpha: 1,
      strokeStyle: '',
      fillStyle: '',
      shadowColor: '',
      shadowBlur: 0,
      lineWidth: 0,
      lineCap: 'butt',
      lineJoin: 'miter',
    } as unknown as CanvasRenderingContext2D;

    const trails: LaserTrail[] = [
      {
        colorPreset: 'default',
        points: [
          { x: 100, y: 100, createdAt: 1000 },
          { x: 140, y: 120, createdAt: 1200 },
        ],
      },
    ];

    const activeResult = renderLaserOverlay(mockCtx, {
      width: 960,
      height: 1358,
      trails,
      pointerHead: { x: 140, y: 120 },
      isPointerActive: true,
      isDark: false,
      activeColorPreset: 'default',
      now: 1250,
    });

    expect(activeResult.shouldContinue).toBe(true);
    expect(activeResult.aliveTrails).toHaveLength(1);
    expect(shadowBlurs).toContain(10);
    expect(Math.max(...lineWidths)).toBeLessThanOrEqual(3.5);
    expect(arcCalls.some(([, , r]) => r === 4)).toBe(true);

    // Sau 1200ms kể từ điểm cuối (1200 + 1200 = 2400ms) và người dùng đã thả bút -> dừng hoàn toàn
    const expiredResult = renderLaserOverlay(mockCtx, {
      width: 960,
      height: 1358,
      trails: activeResult.aliveTrails,
      pointerHead: null,
      isPointerActive: false,
      isDark: true,
      activeColorPreset: 'default',
      now: 2400,
    });

    expect(expiredResult.aliveTrails).toEqual([]);
    expect(expiredResult.shouldContinue).toBe(false);
  });

  it('hỗ trợ phím tắt L (bật/tắt), Escape thoát Laser và không làm bẩn mảng nét vẽ hoặc Undo/Redo stack trên /bang-viet', () => {
    render(
      <MemoryRouter initialEntries={['/bang-viet']}>
        <MathInkPage />
      </MemoryRouter>,
    );

    const laserBtn = screen.getByTestId('ink-laser-btn');
    expect(laserBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByTestId('ink-laser-bar')).not.toBeInTheDocument();

    // Bấm phím tắt L bật Bút Laser
    fireEvent.keyDown(window, { key: 'l' });
    expect(laserBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('ink-laser-bar')).toBeInTheDocument();

    // Rê bút laser trên canvas: không ghi stroke, không tăng undoStack/redoStack
    const canvas = screen.getByTestId('math-ink-canvas');
    fireEvent.pointerDown(canvas, { clientX: 120, clientY: 160, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 200, clientY: 220, pointerId: 1 });
    fireEvent.pointerUp(canvas, { clientX: 200, clientY: 220, pointerId: 1 });

    const storeState = useInkNotebookStore.getState();
    expect(selectActiveInkPage(storeState).strokes).toHaveLength(0);
    expect(storeState.undoStack).toHaveLength(0);
    expect(storeState.redoStack).toHaveLength(0);

    // Bấm Escape quay về công cụ bút viết
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(laserBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByTestId('ink-laser-bar')).not.toBeInTheDocument();

    // Bấm phím tắt L lại bật Laser, bấm L lần nữa tắt Laser
    fireEvent.keyDown(window, { key: 'L' });
    expect(laserBtn).toHaveAttribute('aria-pressed', 'true');
    fireEvent.keyDown(window, { key: 'l' });
    expect(laserBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('chỉ chạy requestAnimationFrame khi vẽ tia Laser và dừng hẳn khi điểm cuối hết hạn sau 1200ms (0% CPU nhàn rỗi)', () => {
    let fakeNow = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => fakeNow);

    const pendingFrames = new Map<number, FrameRequestCallback>();
    let nextRafId = 1;
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        const id = nextRafId;
        nextRafId += 1;
        pendingFrames.set(id, cb);
        return id;
      });
    const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id: number) => {
      pendingFrames.delete(id);
    });

    const mock2d = {
      setTransform: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      setLineDash: vi.fn(),
      roundRect: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      ellipse: vi.fn(),
      closePath: vi.fn(),
      fillText: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      measureText: vi.fn(() => ({ width: 20 })),
      globalAlpha: 1,
      strokeStyle: '',
      fillStyle: '',
      shadowColor: '',
      shadowBlur: 0,
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      font: '',
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mock2d);

    render(
      <MemoryRouter initialEntries={['/bang-viet']}>
        <MathInkPage />
      </MemoryRouter>,
    );

    // Ở trạng thái nhàn rỗi (chưa vẽ laser) -> không khởi chạy rAF
    fireEvent.keyDown(window, { key: 'l' });
    expect(rafSpy).not.toHaveBeenCalled();

    // Bắt đầu vẽ tia laser -> khởi chạy 1 vòng rAF
    const canvas = screen.getByTestId('math-ink-canvas');
    fireEvent.pointerDown(canvas, { clientX: 100, clientY: 120, pointerId: 2 });
    fireEvent.pointerMove(canvas, { clientX: 160, clientY: 150, pointerId: 2 });
    fireEvent.pointerUp(canvas, { clientX: 160, clientY: 150, pointerId: 2 });

    expect(rafSpy).toHaveBeenCalledTimes(1);
    expect(pendingFrames.size).toBe(1);

    // Frame ở t = 1500ms (chưa hết 1200ms) -> tiếp tục lên lịch frame kế
    fakeNow = 1500;
    const frame1 = Array.from(pendingFrames.entries())[0]!;
    pendingFrames.delete(frame1[0]);
    frame1[1](fakeNow);
    expect(pendingFrames.size).toBe(1);

    // Frame ở t = 2250ms (đã vượt 1200ms từ t = 1000ms) -> mảng điểm rỗng, dừng hẳn rAF
    fakeNow = 2250;
    const frame2 = Array.from(pendingFrames.entries())[0]!;
    pendingFrames.delete(frame2[0]);
    frame2[1](fakeNow);
    expect(pendingFrames.size).toBe(0);
    expect(cancelSpy).toHaveBeenCalled();
  });
});
