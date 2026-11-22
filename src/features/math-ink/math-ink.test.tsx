import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  compileMathExpression,
  computeDefiniteIntegral,
  eraseStrokeSegment,
  findSpecialGraphPoints,
  recognizeInkGesture,
  rotatePoint3D,
  selectActiveInkPage,
  selectActiveNotebook,
  snapPointToRulerEdge,
  SOLID_3D_PRESETS,
  useInkNotebookStore,
  type InkPoint,
} from '@/features/math-ink';
import { MathInkPage } from '@/pages/math-ink/MathInkPage';

describe('Bảng Viết Toán Học (/bang-viet) — Math Ink, Hình 3D & Đồ Thị Hàm Số', () => {
  beforeEach(() => {
    useInkNotebookStore.getState().resetInkStore();
    window.localStorage.clear();
  });

  it('biên dịch biểu thức toán học an toàn (nhân ngầm định, hàm lượng giác/log), tìm điểm đặc biệt và tính tích phân Simpson chính xác', () => {
    const cubic = compileMathExpression('y = x^3 - 3x');
    expect(cubic.ok).toBe(true);
    if (!cubic.ok) return;
    expect(cubic.evaluate(2)).toBeCloseTo(2, 6);
    expect(cubic.evaluate(-1)).toBeCloseTo(2, 6);

    const implicit = compileMathExpression('2x(x + 1) + |x - 3|');
    expect(implicit.ok).toBe(true);
    if (implicit.ok) {
      expect(implicit.evaluate(1)).toBeCloseTo(6, 6);
    }

    const quad = compileMathExpression('x^2');
    expect(quad.ok).toBe(true);
    if (quad.ok) {
      const area = computeDefiniteIntegral(quad.evaluate, 0, 2);
      expect(area).not.toBeNull();
      expect(area!).toBeCloseTo(8 / 3, 4);
    }

    const special = findSpecialGraphPoints(cubic.evaluate, -4, 4, -5, 5);
    expect(special.some((p) => p.kind === 'y-intercept' && p.y === 0)).toBe(true);
    expect(special.some((p) => p.kind === 'extremum')).toBe(true);

    const bad = compileMathExpression('2 + * @');
    expect(bad.ok).toBe(false);
  });

  it('nhận dạng nét vẽ tay thành đoạn thẳng / hình tròn (Ink-to-Shape/Line), tẩy đoạn nét và hút cạnh thước kẻ', () => {
    const straightPts: InkPoint[] = Array.from({ length: 12 }, (_, i) => ({
      x: 40 + i * 18,
      y: 120 + (i % 2 === 0 ? 0.5 : -0.5),
    }));
    const lineMatch = recognizeInkGesture(straightPts, 'line');
    expect(lineMatch?.kind).toBe('line');

    const circlePts: InkPoint[] = Array.from({ length: 36 }, (_, i) => {
      const a = (i / 35) * Math.PI * 2;
      return { x: 200 + Math.cos(a) * 60, y: 200 + Math.sin(a) * 60 };
    });
    const circleMatch = recognizeInkGesture(circlePts, 'shape');
    expect(circleMatch?.kind).toBe('circle');

    // Tẩy giữa nét -> tách thành 2 đoạn con độc lập
    const split = eraseStrokeSegment(
      {
        id: 'st-1',
        penKind: 'ballpoint',
        color: '#000',
        width: 2,
        opacity: 1,
        points: Array.from({ length: 20 }, (_, i) => ({ x: i * 10, y: 50 })),
      },
      95,
      50,
      15,
    );
    expect(split).toHaveLength(2);

    // Hút nét sát cạnh trên của thước ngang (y = ruler.y - 28)
    const snapped = snapPointToRulerEdge(300, 175, {
      x: 300,
      y: 200,
      angleDeg: 0,
      length: 400,
    });
    expect(snapped).not.toBeNull();
    expect(snapped!.y).toBeCloseTo(172, 2);
  });

  it('động cơ Hình học không gian 3D đủ 8 mẫu khối chuẩn và phép quay 3D bảo toàn độ dài vectơ', () => {
    expect(SOLID_3D_PRESETS).toHaveLength(8);
    const p = { x: 1, y: 2, z: -1.5 };
    const origNorm = Math.hypot(p.x, p.y, p.z);
    const rotated = rotatePoint3D(p, 47, 23);
    const rotNorm = Math.hypot(rotated.x, rotated.y, rotated.z);
    expect(rotNorm).toBeCloseTo(origNorm, 6);
  });

  it('tách biệt vở ghi chép theo từng tài khoản (user.id), hỗ trợ đa trang và Undo/Redo', () => {
    const store = useInkNotebookStore.getState();

    store.setActiveAccount('student-a');
    store.renameActiveNotebook('Vở Giải tích của A');
    store.addPage();
    expect(selectActiveNotebook(useInkNotebookStore.getState()).pages).toHaveLength(2);

    store.addStroke({
      id: 'st-undo',
      penKind: 'fountain',
      color: '#111827',
      width: 2.5,
      opacity: 1,
      points: [
        { x: 10, y: 10 },
        { x: 40, y: 40 },
      ],
    });
    expect(selectActiveInkPage(useInkNotebookStore.getState()).strokes).toHaveLength(1);
    store.undo();
    expect(selectActiveInkPage(useInkNotebookStore.getState()).strokes).toHaveLength(0);
    store.redo();
    expect(selectActiveInkPage(useInkNotebookStore.getState()).strokes).toHaveLength(1);

    // Chuyển sang tài khoản B -> hoàn toàn sạch
    store.setActiveAccount('student-b');
    expect(selectActiveNotebook(useInkNotebookStore.getState()).title).toBe(
      'Vở Toán — Nháp & Hình không gian',
    );
    expect(selectActiveNotebook(useInkNotebookStore.getState()).pages).toHaveLength(1);
  });

  it('MathInkPage vận hành đầy đủ đổi giấy vở, bật thước kẻ, chèn Hình không gian 3D, chèn Đồ thị hàm số f(x) và thêm trang', () => {
    render(
      <MemoryRouter initialEntries={['/bang-viet']}>
        <MathInkPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('math-ink-page')).toBeInTheDocument();
    expect(screen.getByTestId('math-ink-canvas')).toBeInTheDocument();

    // 1. Đổi kiểu giấy sang Chấm bi
    fireEvent.click(screen.getByTestId('ink-paper-btn'));
    expect(screen.getByTestId('paper-settings-popover')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('paper-pattern-dotted'));
    expect(selectActiveNotebook(useInkNotebookStore.getState()).paper.pattern).toBe('dotted');

    // 2. Bật Thước kẻ tương tác
    fireEvent.click(screen.getByTestId('ink-ruler-toggle'));
    expect(screen.getByTestId('ink-canvas-ruler')).toBeInTheDocument();

    // 3. Mở bảng Hình 3D, chọn Hình chóp S.ABCD và chèn vào trang
    fireEvent.click(screen.getByTestId('ink-solid3d-btn'));
    expect(screen.getByTestId('solid-3d-popover')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('solid-preset-pyramid-quad'));
    fireEvent.click(screen.getByTestId('insert-solid-3d-confirm'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).solids3d).toHaveLength(1);

    // 4. Mở bảng Đồ thị hàm số, nhập x^2 - 4, bật tô tích phân và chèn vào trang
    fireEvent.click(screen.getByTestId('ink-graph-btn'));
    expect(screen.getByTestId('function-graph-popover')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('graph-fn-input-0'), { target: { value: 'x^2 - 4' } });
    fireEvent.click(screen.getByTestId('graph-integral-toggle'));
    fireEvent.click(screen.getByTestId('insert-graph-confirm'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).graphs).toHaveLength(1);

    // 5. Thêm trang mới
    fireEvent.click(screen.getByTestId('ink-add-page-btn'));
    expect(selectActiveNotebook(useInkNotebookStore.getState()).pages).toHaveLength(2);
  });
});
