import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  compileMathExpression,
  computeDefiniteIntegral,
  eraseStrokeSegment,
  evaluateSolidConstructions,
  findSpecialGraphPoints,
  getSolidPresetSchema,
  recognizeInkGesture,
  resolveSolidVertexLabel,
  rotatePoint3D,
  selectActiveInkFolders,
  selectActiveInkPage,
  selectActiveNotebook,
  snapPointToRulerEdge,
  SOLID_3D_PRESETS,
  useInkNotebookStore,
  type InkPoint,
} from '@/features/math-ink';
import { MathInkPage } from '@/pages/math-ink/MathInkPage';

describe('Bảng Viết Toán Học (/bang-viet) — Math Ink, Thư mục đa cấp, Hình 3D nâng cao & Đồ Thị Hàm Số', () => {
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

  it('động cơ Hình 3D: đủ 8 mẫu khối, bảo toàn độ dài khi quay, đổi tên đỉnh và tính chính xác tọa độ Trung điểm / Trọng tâm / Đường cao', () => {
    expect(SOLID_3D_PRESETS).toHaveLength(8);
    const p = { x: 1, y: 2, z: -1.5 };
    const origNorm = Math.hypot(p.x, p.y, p.z);
    const rotated = rotatePoint3D(p, 47, 23);
    const rotNorm = Math.hypot(rotated.x, rotated.y, rotated.z);
    expect(rotNorm).toBeCloseTo(origNorm, 6);

    expect(resolveSolidVertexLabel('S', 'S', { S: 'P' })).toBe('P');
    expect(resolveSolidVertexLabel('A', 'A', { A: '' })).toBe('');

    const schema = getSolidPresetSchema('pyramid-quad');
    const evalResult = evaluateSolidConstructions(
      schema,
      [
        {
          id: 'm1',
          kind: 'midpoint',
          fromVertex: 'S',
          toVertex: 'A',
          label: 'M',
          color: '#DC2626',
        },
        {
          id: 'g1',
          kind: 'centroid',
          vertices: ['S', 'A', 'B'],
          label: 'G',
          color: '#2563EB',
        },
        {
          id: 'h1',
          kind: 'altitude',
          apexVertex: 'S',
          footTarget: 'base-plane',
          footLabel: 'H',
          color: '#1B5E4A',
          showRightAngle: true,
        },
        {
          id: 'seg1',
          kind: 'segment',
          fromPoint: 'm1',
          toPoint: 'g1',
          style: 'solid',
          color: '#7C3AED',
        },
      ],
      '#111827',
    );

    const vS = schema.vertices.find((v) => v.id === 'S')!.pos;
    const vA = schema.vertices.find((v) => v.id === 'A')!.pos;
    const vB = schema.vertices.find((v) => v.id === 'B')!.pos;

    const mid = evalResult.allPoints3D.get('m1')!;
    expect(mid.x).toBeCloseTo((vS.x + vA.x) / 2, 5);
    expect(mid.y).toBeCloseTo((vS.y + vA.y) / 2, 5);
    expect(mid.z).toBeCloseTo((vS.z + vA.z) / 2, 5);

    const centroid = evalResult.allPoints3D.get('g1')!;
    expect(centroid.x).toBeCloseTo((vS.x + vA.x + vB.x) / 3, 5);
    expect(centroid.y).toBeCloseTo((vS.y + vA.y + vB.y) / 3, 5);
    expect(centroid.z).toBeCloseTo((vS.z + vA.z + vB.z) / 3, 5);

    const footH = evalResult.allPoints3D.get('h1')!;
    expect(footH.x).toBeCloseTo(vS.x, 5);
    expect(footH.y).toBeCloseTo(schema.basePlaneY, 5);
    expect(footH.z).toBeCloseTo(vS.z, 5);
    expect(evalResult.constructedPoints).toHaveLength(3);
  });

  it('quản lý Thư mục đa cấp (tạo mục cha/con, di chuyển vở, xóa thư mục không mất vở) và tách biệt theo tài khoản', () => {
    const store = useInkNotebookStore.getState();

    store.setActiveAccount('student-a');
    const parentFolder = store.createFolder('Hình học 11', null, '#1D4F6E');
    expect(parentFolder).not.toBeNull();
    const childFolder = store.createFolder(
      'Chương 3: Quan hệ vuông góc',
      parentFolder!.id,
      '#1B5E4A',
    );
    expect(childFolder).not.toBeNull();
    expect(
      selectActiveInkFolders(useInkNotebookStore.getState()).some((f) => f.id === childFolder!.id),
    ).toBe(true);

    store.createNotebook('Bài tập Khoảng cách', childFolder!.id);
    const createdNb = selectActiveNotebook(useInkNotebookStore.getState());
    expect(createdNb.folderId).toBe(childFolder!.id);

    // Xóa thư mục con -> vở bên trong được giữ nguyên và tự chuyển lên thư mục cha
    store.deleteFolder(childFolder!.id);
    const updatedNb = selectActiveNotebook(useInkNotebookStore.getState());
    expect(updatedNb.title).toBe('Bài tập Khoảng cách');
    expect(updatedNb.folderId).toBe(parentFolder!.id);

    // Di chuyển vở sang gốc và kiểm tra Undo/Redo trên trang
    store.moveNotebookToFolder(updatedNb.id, null);
    expect(selectActiveNotebook(useInkNotebookStore.getState()).folderId).toBeNull();

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

  it('MathInkPage vận hành đầy đủ Thư mục đa cấp, Hình 3D (đổi tên đỉnh, hình trơn, trung điểm/trọng tâm/đường cao, thu phóng), Đồ thị f(x) và thêm trang', () => {
    render(
      <MemoryRouter initialEntries={['/bang-viet']}>
        <MathInkPage />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('math-ink-page')).toBeInTheDocument();
    expect(screen.getByTestId('math-ink-canvas')).toBeInTheDocument();

    // 1. Tạo thư mục mới trong thanh bên trái
    fireEvent.click(screen.getByTestId('ink-new-folder-btn'));
    fireEvent.change(screen.getByTestId('ink-new-folder-input'), {
      target: { value: 'Ôn thi Học kỳ 2' },
    });
    fireEvent.submit(screen.getByTestId('ink-new-folder-form'));
    expect(
      selectActiveInkFolders(useInkNotebookStore.getState()).some(
        (f) => f.name === 'Ôn thi Học kỳ 2',
      ),
    ).toBe(true);

    // 2. Đổi kiểu giấy sang Chấm bi & bật Thước kẻ
    fireEvent.click(screen.getByTestId('ink-paper-btn'));
    expect(screen.getByTestId('paper-settings-popover')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('paper-pattern-dotted'));
    expect(selectActiveNotebook(useInkNotebookStore.getState()).paper.pattern).toBe('dotted');

    fireEvent.click(screen.getByTestId('ink-ruler-toggle'));
    expect(screen.getByTestId('ink-canvas-ruler')).toBeInTheDocument();

    // 3. Mở bảng Hình 3D: đổi kích thước, đổi tên đỉnh S -> P, thêm Trung điểm / Trọng tâm / Đường cao / Nối đoạn
    fireEvent.click(screen.getByTestId('ink-solid3d-btn'));
    expect(screen.getByTestId('solid-3d-popover')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('solid-preset-pyramid-quad'));
    fireEvent.change(screen.getByTestId('solid-size-slider'), { target: { value: '360' } });

    fireEvent.click(screen.getByTestId('solid-tab-labels'));
    fireEvent.change(screen.getByTestId('solid-vertex-input-S'), { target: { value: 'P' } });

    fireEvent.click(screen.getByTestId('solid-tab-constructions'));
    fireEvent.click(screen.getByTestId('add-midpoint-btn'));
    fireEvent.click(screen.getByText('Trọng tâm'));
    fireEvent.click(screen.getByTestId('add-centroid-btn'));
    fireEvent.click(screen.getByText('Đường cao'));
    fireEvent.click(screen.getByTestId('add-altitude-btn'));
    fireEvent.click(screen.getByText('Nối đoạn'));
    fireEvent.click(screen.getByTestId('add-segment-btn'));

    fireEvent.click(screen.getByTestId('insert-solid-3d-confirm'));

    const insertedSolid = selectActiveInkPage(useInkNotebookStore.getState()).solids3d[0];
    expect(insertedSolid).toBeDefined();
    expect(insertedSolid!.width).toBe(360);
    expect(insertedSolid!.customLabels?.S).toBe('P');
    expect(insertedSolid!.constructions).toHaveLength(4);

    // 4. Thu/phóng trực tiếp hình 3D đang chọn và bật chế độ hình không tên (trơn) ngay trên trang
    expect(screen.getByTestId('ink-resize-frame')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('selected-scale-up'));
    const scaledUpWidth = selectActiveInkPage(useInkNotebookStore.getState()).solids3d[0]!.width;
    expect(scaledUpWidth).toBeGreaterThan(360);

    fireEvent.click(screen.getByTestId('selected-scale-down'));
    const scaledDownWidth = selectActiveInkPage(useInkNotebookStore.getState()).solids3d[0]!.width;
    expect(scaledDownWidth).toBeLessThan(scaledUpWidth);

    fireEvent.click(screen.getByTestId('selected-edit-solid-btn'));
    fireEvent.click(screen.getByTestId('solid-tab-labels'));
    fireEvent.click(screen.getByTestId('solid-blank-labels-btn'));
    fireEvent.click(screen.getByTestId('insert-solid-3d-confirm'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).solids3d[0]!.showLabels).toBe(false);

    // 5. Mở bảng Đồ thị hàm số, nhập x^2 - 4, bật tô tích phân và chèn vào trang
    fireEvent.click(screen.getByTestId('ink-graph-btn'));
    expect(screen.getByTestId('function-graph-popover')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('graph-fn-input-0'), { target: { value: 'x^2 - 4' } });
    fireEvent.click(screen.getByTestId('graph-integral-toggle'));
    fireEvent.click(screen.getByTestId('insert-graph-confirm'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).graphs).toHaveLength(1);

    // 6. Chuyển sang tab Trang vở và thêm trang mới
    fireEvent.click(screen.getByTestId('sidebar-tab-pages'));
    fireEvent.click(screen.getByTestId('ink-add-page-btn'));
    expect(selectActiveNotebook(useInkNotebookStore.getState()).pages).toHaveLength(2);
  });
});
