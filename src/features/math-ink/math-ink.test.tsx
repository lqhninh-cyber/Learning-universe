import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildMultiPagePdfBytes,
  compileMathExpression,
  computeDefiniteIntegral,
  computeVariationAnchors,
  doesStampHitPoint,
  eraseStrokeSegment,
  evaluateGeoScene,
  evaluateSolidConstructions,
  findSpecialGraphPoints,
  formatLatexToReadableMath,
  GEOMETRY_STAMP_PRESETS,
  getSolidPresetSchema,
  hitTestGeoScene,
  hitTestSolid3DScene,
  parseRatioInput,
  recognizeInkGesture,
  removeGeoObjectsWithCascade,
  resolveSolidVertexLabel,
  rotatePoint3D,
  selectActiveInkFolders,
  selectActiveInkPage,
  selectActiveNotebook,
  smoothStrokePoints,
  snapPointToRulerEdge,
  snapRatioToNiceFraction,
  SOLID_3D_PRESETS,
  stabilizeInkPoint,
  translateGeoObjectsByTargets,
  useInkNotebookStore,
  VARIATION_TABLE_PRESETS,
  type GeoObject,
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

  it('động cơ Hình 3D & Chữ viết mượt: đủ 9 mẫu khối (gồm Mặt phẳng α), bộ ổn định nét Streamline, Điểm tỉ lệ, Điểm thuộc mặt, Hình chiếu cạnh & Mặt phẳng thiết diện', () => {
    expect(SOLID_3D_PRESETS).toHaveLength(9);

    // Kiểm tra bộ ổn định chữ viết tay (Streamline) và làm mịn bảo toàn góc nhọn
    const stabilized = stabilizeInkPoint(
      { x: 100, y: 100, pressure: 0.55 },
      { x: 120, y: 110 },
      0.65,
      16,
    );
    expect(stabilized.x).toBeGreaterThan(100);
    expect(stabilized.x).toBeLessThan(120);
    expect(stabilized.pressure).toBeGreaterThan(0.25);

    const zigZagCurve: InkPoint[] = [
      { x: 0, y: 0 },
      { x: 10, y: 3 },
      { x: 20, y: -2 },
      { x: 30, y: 2 },
      { x: 40, y: 0 },
    ];
    const smoothed = smoothStrokePoints(zigZagCurve, 0.75);
    expect(smoothed).toHaveLength(5);
    expect(smoothed[0]).toEqual(zigZagCurve[0]);
    expect(smoothed[4]).toEqual(zigZagCurve[4]);
    expect(Math.abs(smoothed[2]!.y)).toBeLessThan(Math.abs(zigZagCurve[2]!.y));

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
          id: 'r1',
          kind: 'ratio-point',
          fromPoint: 'S',
          toPoint: 'B',
          ratio: 1 / 3,
          label: 'N',
          color: '#DC2626',
        },
        {
          id: 'fp1',
          kind: 'free-point',
          anchorPoints: ['A', 'B', 'C'],
          weights: [1, 1, 1],
          label: 'I',
          color: '#0891B2',
        },
        {
          id: 'g1',
          kind: 'centroid',
          vertices: ['S', 'A', 'B'],
          label: 'G',
          color: '#2563EB',
          showMedians: true,
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
          id: 'hk1',
          kind: 'altitude',
          apexVertex: 'A',
          footTarget: 'S',
          targetEdgeTo: 'B',
          footLabel: 'K',
          color: '#D97706',
          showRightAngle: true,
        },
        {
          id: 'pln1',
          kind: 'plane',
          points: ['m1', 'r1', 'C'],
          label: 'α',
          color: '#1D4ED8',
          fillOpacity: 0.24,
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

    const ratioPt = evalResult.allPoints3D.get('r1')!;
    expect(ratioPt.x).toBeCloseTo(vS.x + (vB.x - vS.x) / 3, 5);
    expect(ratioPt.y).toBeCloseTo(vS.y + (vB.y - vS.y) / 3, 5);
    expect(ratioPt.z).toBeCloseTo(vS.z + (vB.z - vS.z) / 3, 5);

    const centroid = evalResult.allPoints3D.get('g1')!;
    expect(centroid.x).toBeCloseTo((vS.x + vA.x + vB.x) / 3, 5);
    expect(centroid.y).toBeCloseTo((vS.y + vA.y + vB.y) / 3, 5);
    expect(centroid.z).toBeCloseTo((vS.z + vA.z + vB.z) / 3, 5);

    const footH = evalResult.allPoints3D.get('h1')!;
    expect(footH.x).toBeCloseTo(vS.x, 5);
    expect(footH.y).toBeCloseTo(schema.basePlaneY, 5);
    expect(footH.z).toBeCloseTo(vS.z, 5);

    // Hình chiếu vuông góc K của A lên cạnh SB phải nằm trên đoạn SB
    const footK = evalResult.allPoints3D.get('hk1')!;
    expect(footK).toBeDefined();
    expect(evalResult.constructedPoints).toHaveLength(6);

    // Kiểm tra hit-test trực tiếp trên hình 3D (GeoGebra picking)
    const sampleSolid = {
      id: 's-test',
      preset: 'pyramid-quad' as const,
      x: 0,
      y: 0,
      width: 300,
      height: 300,
      yaw: 32,
      pitch: 20,
      color: '#111827',
      lineWidth: 2,
      showLabels: true,
      showAuxLines: true,
      dashedHidden: true,
    };
    // Điểm đỉnh S nằm phía trên tâm (150, ~30)
    const hitNearTop = hitTestSolid3DScene(sampleSolid, 146, 30, 45);
    expect(hitNearTop).not.toBeNull();
    expect(hitNearTop?.kind).toBe('point');
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
    fireEvent.click(screen.getByTestId('point-ratio-1/3'));
    fireEvent.click(screen.getByTestId('add-midpoint-btn'));
    fireEvent.click(screen.getByText('Trọng tâm'));
    fireEvent.click(screen.getByTestId('add-centroid-btn'));
    fireEvent.click(screen.getByText('Đường cao'));
    fireEvent.click(screen.getByTestId('add-altitude-btn'));
    fireEvent.click(screen.getByTestId('const-mode-plane'));
    fireEvent.click(screen.getByTestId('add-plane-btn'));
    fireEvent.click(screen.getByText('Nối đoạn'));
    fireEvent.click(screen.getByTestId('add-segment-btn'));

    fireEvent.click(screen.getByTestId('insert-solid-3d-confirm'));

    const insertedSolid = selectActiveInkPage(useInkNotebookStore.getState()).solids3d[0];
    expect(insertedSolid).toBeDefined();
    expect(insertedSolid!.width).toBe(360);
    expect(insertedSolid!.customLabels?.S).toBe('P');
    expect(insertedSolid!.constructions).toHaveLength(6);
    expect(insertedSolid!.constructions?.some((c) => c.kind === 'ratio-point')).toBe(true);
    expect(insertedSolid!.constructions?.some((c) => c.kind === 'plane')).toBe(true);

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

  it('Ý 3, 4, 5, 6: Bảng biến thiên & Xét dấu, 9 Con dấu hình học, Bút Laser + Xuất PDF đa trang và Phiếu bài tập nền khóa', () => {
    // Ý 3: Engine Bảng biến thiên tính đúng cực đại, cực tiểu & tiệm cận đứng ||
    expect(VARIATION_TABLE_PRESETS).toHaveLength(4);
    const cubicAnchors = computeVariationAnchors(VARIATION_TABLE_PRESETS[0]!);
    expect(cubicAnchors[0]!.leftSlot).toBe('low'); // -∞ đi lên
    expect(cubicAnchors[1]!.leftSlot).toBe('high'); // cực đại
    expect(cubicAnchors[2]!.leftSlot).toBe('low'); // cực tiểu
    expect(cubicAnchors[3]!.leftSlot).toBe('high'); // +∞

    const rationalAnchors = computeVariationAnchors(VARIATION_TABLE_PRESETS[2]!);
    expect(rationalAnchors[1]!.isDoubleBar).toBe(true);
    expect(rationalAnchors[1]!.leftLabel).toBe('+∞');
    expect(rationalAnchors[1]!.rightLabel).toBe('-∞');

    // Ý 4: Con dấu hình học đủ 9 mẫu và hit-test chính xác
    expect(GEOMETRY_STAMP_PRESETS).toHaveLength(9);
    expect(
      doesStampHitPoint(
        {
          id: 'st-ra',
          kind: 'right-angle',
          x: 200,
          y: 200,
          size: 36,
          rotationDeg: 0,
          color: '#DC2626',
          lineWidth: 2,
        },
        208,
        205,
      ),
    ).toBe(true);

    // Ý 5: Bộ xuất PDF 1.4 đa trang sinh header, /Count 2, xref và %%EOF chuẩn xác
    const dummyJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0xff, 0xd9]);
    const pdfBytes = buildMultiPagePdfBytes([
      {
        jpegBytes: dummyJpeg,
        pixelWidth: 960,
        pixelHeight: 1358,
        pageWidthPt: 595.28,
        pageHeightPt: 841.89,
      },
      {
        jpegBytes: dummyJpeg,
        pixelWidth: 960,
        pixelHeight: 1358,
        pageWidthPt: 595.28,
        pageHeightPt: 841.89,
      },
    ]);
    const pdfText = new TextDecoder('latin1').decode(pdfBytes);
    expect(pdfText.startsWith('%PDF-1.4')).toBe(true);
    expect(pdfText).toContain('/Count 2');
    expect(pdfText).toContain('xref');
    expect(pdfText.trim().endsWith('%%EOF')).toBe(true);

    // Ý 6: Phiếu bài tập nền khóa vẫn được giữ khi xóa sạch nét nháp & hỗ trợ nạp nhiều trang
    const store = useInkNotebookStore.getState();
    store.addPagesWithWorksheets([
      {
        id: 'ws-1',
        title: 'Đề kiểm tra trang 1',
        dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
        opacity: 0.9,
        fitMode: 'top-half',
        locked: true,
      },
      {
        id: 'ws-2',
        title: 'Đề kiểm tra trang 2',
        dataUrl: 'data:image/png;base64,iVBORw0KGgo=',
        opacity: 0.9,
        fitMode: 'contain',
        locked: true,
      },
    ]);
    expect(selectActiveNotebook(useInkNotebookStore.getState()).pages).toHaveLength(2);
    store.addStroke({
      id: 'st-draft',
      penKind: 'fountain',
      color: '#111827',
      width: 2,
      opacity: 1,
      points: [
        { x: 10, y: 10 },
        { x: 50, y: 50 },
      ],
    });
    store.clearActivePage();
    const afterClear = selectActiveInkPage(useInkNotebookStore.getState());
    expect(afterClear.strokes).toHaveLength(0);
    expect(afterClear.worksheetBackground?.id).toBe('ws-1');

    // Tương tác trực tiếp trên giao diện MathInkPage cho cả 4 tính năng
    render(
      <MemoryRouter initialEntries={['/bang-viet']}>
        <MathInkPage />
      </MemoryRouter>,
    );

    // Chèn Bảng biến thiên phân thức (||) -> chỉnh sang Bảng xét dấu
    fireEvent.click(screen.getByTestId('ink-variation-btn'));
    expect(screen.getByTestId('variation-table-popover')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('vt-preset-rational-asymptote'));
    fireEvent.click(screen.getByTestId('insert-variation-table-confirm'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).variationTables).toHaveLength(1);
    expect(
      selectActiveInkPage(useInkNotebookStore.getState()).variationTables[0]!.pointMarkers[0],
    ).toBe('double-bar');

    fireEvent.click(screen.getByTestId('selected-edit-vt-btn'));
    fireEvent.click(screen.getByTestId('vt-mode-sign'));
    fireEvent.click(screen.getByTestId('insert-variation-table-confirm'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).variationTables[0]!.mode).toBe(
      'sign',
    );

    // Chọn Con dấu góc vuông và chạm lên canvas để đóng dấu
    fireEvent.click(screen.getByTestId('ink-stamps-btn'));
    expect(screen.getByTestId('geometry-stamps-popover')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('stamp-preset-right-angle'));
    expect(screen.getByTestId('ink-stamp-bar')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByTestId('math-ink-canvas'), { clientX: 150, clientY: 180 });
    expect(selectActiveInkPage(useInkNotebookStore.getState()).stamps).toHaveLength(1);
    expect(selectActiveInkPage(useInkNotebookStore.getState()).stamps[0]!.kind).toBe('right-angle');

    // Bật Bút Laser trình chiếu: vẽ tia laser không làm tăng nét lưu trong vở
    fireEvent.click(screen.getByTestId('ink-laser-btn'));
    expect(screen.getByTestId('ink-laser-bar')).toBeInTheDocument();
    fireEvent.pointerDown(screen.getByTestId('math-ink-canvas'), { clientX: 200, clientY: 220 });
    fireEvent.pointerMove(screen.getByTestId('math-ink-canvas'), { clientX: 260, clientY: 250 });
    fireEvent.pointerUp(screen.getByTestId('math-ink-canvas'), { clientX: 260, clientY: 250 });
    expect(selectActiveInkPage(useInkNotebookStore.getState()).strokes).toHaveLength(0);

    // Mở hộp Phiếu bài tập nền khóa và chỉnh độ mờ / gỡ nền
    fireEvent.click(screen.getByTestId('ink-worksheet-btn'));
    expect(screen.getByTestId('worksheet-bg-popover')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('worksheet-fit-contain'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).worksheetBackground?.fitMode).toBe(
      'contain',
    );
    expect(screen.getByTestId('ink-export-pdf')).toBeInTheDocument();
  });

  it('Đổi tên file vở trực tiếp (sidebar & thanh công cụ), hộp Phiếu đề định vị fixed chống che khuất và Chế độ Dựng Hình Động GeoGebra', () => {
    // 1. Kiểm thử bộ phân tích tỉ số linh hoạt & động cơ giải hình học động GeoGebra
    expect(parseRatioInput('1/5')).toBeCloseTo(0.2, 4);
    expect(parseRatioInput('2/5')).toBeCloseTo(0.4, 4);
    expect(parseRatioInput('35%')).toBeCloseTo(0.35, 4);
    expect(parseRatioInput('0.62')).toBeCloseTo(0.62, 4);
    expect(snapRatioToNiceFraction(0.34).label).toBe('1/3');
    expect(snapRatioToNiceFraction(0.51).label).toBe('1/2');

    const scene = evaluateGeoScene([
      {
        id: 'pA',
        kind: 'geo-point',
        pointMode: 'free',
        x: 100,
        y: 200,
        label: 'A',
        color: '#1D4ED8',
      },
      {
        id: 'pB',
        kind: 'geo-point',
        pointMode: 'free',
        x: 300,
        y: 200,
        label: 'B',
        color: '#1D4ED8',
      },
      {
        id: 'pC',
        kind: 'geo-point',
        pointMode: 'free',
        x: 200,
        y: 100,
        label: 'C',
        color: '#1D4ED8',
      },
      {
        id: 'lAB',
        kind: 'geo-line',
        lineMode: 'segment',
        p1Id: 'pA',
        p2Id: 'pB',
        style: 'solid',
        color: '#1D4ED8',
        width: 2,
      },
      {
        id: 'pM',
        kind: 'geo-point',
        pointMode: 'on-segment',
        targetId: 'lAB',
        t: 0.25,
        label: 'M',
        color: '#DC2626',
      },
      {
        id: 'pMid',
        kind: 'geo-point',
        pointMode: 'midpoint',
        p1Id: 'pA',
        p2Id: 'pC',
        label: 'N',
        color: '#DC2626',
      },
      {
        id: 'pH',
        kind: 'geo-point',
        pointMode: 'projection',
        sourcePointId: 'pC',
        lineId: 'lAB',
        label: 'H',
        color: '#1B5E4A',
      },
      {
        id: 'c3',
        kind: 'geo-conic',
        conicMode: 'circle-3pts',
        p1Id: 'pA',
        p2Id: 'pB',
        p3Id: 'pC',
        style: 'solid',
        color: '#7C3AED',
        width: 2,
      },
    ]);

    expect(scene.points.get('pM')?.x).toBeCloseTo(150, 4);
    expect(scene.points.get('pM')?.y).toBeCloseTo(200, 4);
    expect(scene.points.get('pMid')?.x).toBeCloseTo(150, 4);
    expect(scene.points.get('pMid')?.y).toBeCloseTo(150, 4);
    expect(scene.points.get('pH')?.x).toBeCloseTo(200, 4);
    expect(scene.points.get('pH')?.y).toBeCloseTo(200, 4);
    // Đường tròn ngoại tiếp tam giác vuông cân A(100,200), B(300,200), C(200,100) có tâm (200, 200), R = 100
    expect(scene.conics.get('c3')?.cx).toBeCloseTo(200, 3);
    expect(scene.conics.get('c3')?.cy).toBeCloseTo(200, 3);
    expect(scene.conics.get('c3')?.rx).toBeCloseTo(100, 3);

    const edgeHit = hitTestGeoScene(scene, 166, 201, { skipPoints: true });
    expect(edgeHit?.kind).toBe('line');
    if (edgeHit?.kind === 'line') {
      expect(edgeHit.ratioLabel).toBe('1/3');
    }

    // 2. Kiểm thử UI đổi tên file vở trên Sidebar & Thanh công cụ, Popover Phiếu đề fixed & Chế độ Dựng hình GeoGebra
    render(
      <MemoryRouter initialEntries={['/bang-viet']}>
        <MathInkPage />
      </MemoryRouter>,
    );

    const initialNb = selectActiveNotebook(useInkNotebookStore.getState());
    fireEvent.click(screen.getByTestId(`rename-notebook-btn-${initialNb.id}`));
    const sidebarInput = screen.getByTestId('sidebar-rename-notebook-input');
    fireEvent.change(sidebarInput, { target: { value: 'Ôn thi Hình học Không gian' } });
    fireEvent.submit(sidebarInput.closest('form')!);
    expect(selectActiveNotebook(useInkNotebookStore.getState()).title).toBe(
      'Ôn thi Hình học Không gian',
    );

    // Đổi tên nhanh ngay từ thanh công cụ trên cùng
    fireEvent.click(screen.getByTestId('toolbar-rename-notebook-btn'));
    const toolbarInput = screen.getByTestId('toolbar-rename-notebook-input');
    fireEvent.change(toolbarInput, { target: { value: 'Chuyên đề Thiết diện 3D' } });
    fireEvent.submit(toolbarInput.closest('form')!);
    expect(selectActiveNotebook(useInkNotebookStore.getState()).title).toBe(
      'Chuyên đề Thiết diện 3D',
    );

    // Hộp Phiếu đề được bọc trong ToolbarPopoverAnchor cố định (position: fixed, zIndex: 80) không bị che bởi LeftRail
    fireEvent.click(screen.getByTestId('ink-worksheet-btn'));
    const wsPopover = screen.getByTestId('worksheet-bg-popover');
    expect(wsPopover.parentElement?.style.position).toBe('fixed');
    expect(wsPopover.parentElement?.style.zIndex).toBe('80');

    // Bật chế độ Dựng hình GeoGebra và dựng 1 đoạn thẳng AB trực tiếp trên canvas
    fireEvent.click(screen.getByTestId('ink-geo-btn'));
    expect(screen.getByTestId('geogebra-toolbar')).toBeInTheDocument();
    const canvas = screen.getByTestId('math-ink-canvas');
    fireEvent.pointerDown(canvas, { clientX: 120, clientY: 160 });
    fireEvent.pointerDown(canvas, { clientX: 320, clientY: 160 });
    const geoList = selectActiveInkPage(useInkNotebookStore.getState()).geoObjects ?? [];
    expect(geoList.filter((o) => o.kind === 'geo-point')).toHaveLength(2);
    expect(geoList.filter((o) => o.kind === 'geo-line')).toHaveLength(1);
  });

  it('C1 & C2: Hộp Công thức Toán học trực quan (nhấp đúp sửa lại, tăng giảm cỡ, chuẩn hóa xuất ảnh) và Chế độ Tập giảng & Ghi hình Offline', () => {
    // Kiểm tra chuẩn hóa ký hiệu LaTeX sang Unicode toán học sạch cho Canvas/PDF export
    const readable = formatLatexToReadableMath(
      '$\\forall x \\in \\mathbb{R}, \\frac{x^2+1}{2} \\ge x \\implies \\sqrt{x^2} \\ge 0$',
    );
    expect(readable).toContain('∀');
    expect(readable).toContain('∈');
    expect(readable).toContain('ℝ');
    expect(readable).toContain('(x^2+1)/(2)');
    expect(readable).toContain('⇒');
    expect(readable).toContain('√(x^2)');

    render(
      <MemoryRouter initialEntries={['/bang-viet']}>
        <MathInkPage />
      </MemoryRouter>,
    );

    // 1. C1 — Mở Hộp Công thức Toán trực quan, bấm phím chèn phân số + tích phân và đưa vào trang
    fireEvent.click(screen.getByTestId('ink-formula-btn'));
    expect(screen.getByTestId('ink-formula-editor-popover')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('formula-pad-int'));
    fireEvent.click(screen.getByTestId('formula-cat-algebra'));
    fireEvent.click(screen.getByTestId('formula-pad-implies'));
    fireEvent.click(screen.getByTestId('ink-formula-submit-btn'));

    const insertedTexts = selectActiveInkPage(useInkNotebookStore.getState()).texts;
    expect(insertedTexts).toHaveLength(1);
    const firstFormula = insertedTexts[0]!;
    expect(firstFormula.text).toContain('\\int_{0}^{1}');
    expect(firstFormula.isMath).toBe(true);

    // Tăng cỡ chữ công thức ngay từ thanh chọn nhanh
    const initialSize = firstFormula.fontSize;
    fireEvent.click(screen.getByTestId('selected-text-larger'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).texts[0]!.fontSize).toBe(
      initialSize + 3,
    );

    // Nhấp đúp trực tiếp vào chip công thức trên trang vở để mở lại hộp chỉnh sửa & cập nhật nội dung
    const chip = screen.getByTestId(`ink-text-chip-${firstFormula.id}`);
    fireEvent.doubleClick(chip);
    const formulaInput = screen.getByTestId('ink-formula-input');
    fireEvent.change(formulaInput, {
      target: { value: 'G / \\ker\\varphi \\cong \\operatorname{Im}\\varphi' },
    });
    fireEvent.click(screen.getByTestId('ink-formula-submit-btn'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).texts[0]!.text).toBe(
      'G / \\ker\\varphi \\cong \\operatorname{Im}\\varphi',
    );

    // 2. C2 — Bật Chế độ Tập giảng & Ghi hình bài giảng Offline
    fireEvent.click(screen.getByTestId('ink-teach-mode-btn'));
    expect(screen.getByTestId('ink-teach-studio-bar')).toBeInTheDocument();
    expect(screen.getByTestId('teach-timer-readout')).toHaveTextContent('00:00');
    expect(screen.getByTestId('teach-page-indicator')).toHaveTextContent('Trang 1/1');

    // Thêm trang bảng mới và lật qua lại bằng nút & phím PageUp/PageDown
    fireEvent.click(screen.getByTestId('teach-add-page'));
    expect(screen.getByTestId('teach-page-indicator')).toHaveTextContent('Trang 2/2');
    fireEvent.keyDown(window, { key: 'PageUp' });
    expect(screen.getByTestId('teach-page-indicator')).toHaveTextContent('Trang 1/2');
    fireEvent.keyDown(window, { key: 'PageDown' });
    expect(screen.getByTestId('teach-page-indicator')).toHaveTextContent('Trang 2/2');

    // Trong môi trường kiểm thử không có MediaRecorder, bấm Ghi bài giảng hiển thị thông báo thân thiện không văng lỗi
    fireEvent.click(screen.getByTestId('teach-record-start'));
    expect(screen.getByTestId('teach-status-banner')).toBeInTheDocument();

    // Thoát chế độ Tập giảng quay về Bảng viết đầy đủ
    fireEvent.click(screen.getByTestId('teach-exit-btn'));
    expect(screen.queryByTestId('ink-teach-studio-bar')).not.toBeInTheDocument();
    expect(screen.getByTestId('ink-teach-mode-btn')).toBeInTheDocument();
  });

  it('Tối ưu UX Bảng viết: Đoạn vuông góc (đường cao AH), kéo nguyên đoạn thẳng AB cùng lúc, tẩy ngoài chế độ Dựng hình và Zoom tự do (nhập % & Ctrl+Wheel)', () => {
    // 1. Kiểm thử toán học: Đoạn vuông góc hữu hạn (altitude) + tự tạo đường gióng đáy khi tam giác tù + dịch chuyển nguyên đoạn AB
    const baseObjs: GeoObject[] = [
      {
        id: 'pA',
        kind: 'geo-point',
        pointMode: 'free',
        x: 100,
        y: 200,
        label: 'A',
        color: '#1D4ED8',
      },
      {
        id: 'pB',
        kind: 'geo-point',
        pointMode: 'free',
        x: 300,
        y: 200,
        label: 'B',
        color: '#1D4ED8',
      },
      {
        id: 'pC',
        kind: 'geo-point',
        pointMode: 'free',
        x: 360,
        y: 80,
        label: 'C',
        color: '#1D4ED8',
      },
      {
        id: 'segAB',
        kind: 'geo-line',
        lineMode: 'segment',
        p1Id: 'pA',
        p2Id: 'pB',
        style: 'solid',
        color: '#1D4ED8',
        width: 2.2,
        tickMarks: 2,
      },
      {
        id: 'midM',
        kind: 'geo-point',
        pointMode: 'midpoint',
        p1Id: 'pA',
        p2Id: 'pB',
        label: 'M',
        color: '#DC2626',
      },
      {
        id: 'altCH',
        kind: 'geo-line',
        lineMode: 'altitude',
        throughPointId: 'pC',
        refLineId: 'segAB',
        style: 'dashed',
        color: '#DC2626',
        width: 2,
      },
    ];

    const scene1 = evaluateGeoScene(baseObjs);
    const altEval = scene1.lines.get('altCH')!;
    // Đoạn vuông góc phải hữu hạn (infinite = false), đi từ C(360, 80) xuống chân H(360, 200)
    expect(altEval.infinite).toBe(false);
    expect(altEval.p1).toEqual({ x: 360, y: 80 });
    expect(altEval.p2.x).toBeCloseTo(360, 4);
    expect(altEval.p2.y).toBeCloseTo(200, 4);
    // Vì H(360, 200) nằm ngoài đoạn AB [100..300], động cơ tự sinh đường gióng nét đứt nối từ B(300, 200) tới H(360, 200)
    expect(altEval.baseExtension).toBeDefined();
    expect(altEval.baseExtension?.from.x).toBeCloseTo(300, 4);
    expect(altEval.baseExtension?.to.x).toBeCloseTo(360, 4);

    // Kéo di chuyển nguyên đoạn thẳng AB đi (+40, -30): cả A, B và trung điểm M đều dịch chuyển đồng bộ đúng 1 lần!
    const movedObjs = translateGeoObjectsByTargets(baseObjs, ['segAB', 'pA'], 40, -30);
    const sceneMoved = evaluateGeoScene(movedObjs);
    expect(sceneMoved.points.get('pA')?.x).toBeCloseTo(140, 4);
    expect(sceneMoved.points.get('pA')?.y).toBeCloseTo(170, 4);
    expect(sceneMoved.points.get('pB')?.x).toBeCloseTo(340, 4);
    expect(sceneMoved.points.get('pB')?.y).toBeCloseTo(170, 4);
    expect(sceneMoved.points.get('midM')?.x).toBeCloseTo(240, 4);
    expect(sceneMoved.points.get('midM')?.y).toBeCloseTo(170, 4);

    // Xóa điểm A kéo theo dọn sạch đoạn AB, trung điểm M và đường cao CH phụ thuộc vào AB (giữ lại điểm độc lập C, B)
    const afterCascade = removeGeoObjectsWithCascade(movedObjs, ['pA']);
    expect(afterCascade.map((o) => o.id)).toEqual(['pB', 'pC']);

    // 2. Kiểm thử UI: Zoom tự do (nhập số % bất kỳ, thanh trượt, Ctrl+Wheel) & Tẩy xóa đối tượng dựng hình ngay từ công cụ Tẩy ngoài
    useInkNotebookStore.getState().commitPageMutation((pg) => ({
      ...pg,
      geoObjects: [
        {
          id: 'ptFree1',
          kind: 'geo-point',
          pointMode: 'free',
          x: 50,
          y: 50,
          label: 'P',
          color: '#1D4ED8',
        },
      ],
    }));

    render(
      <MemoryRouter initialEntries={['/bang-viet']}>
        <MathInkPage />
      </MemoryRouter>,
    );

    // Nhập tỉ lệ Zoom tùy ý 137% trực tiếp vào ô input
    const zoomInput = screen.getByTestId('ink-zoom-input') as HTMLInputElement;
    fireEvent.focus(zoomInput);
    fireEvent.change(zoomInput, { target: { value: '137' } });
    fireEvent.keyDown(zoomInput, { key: 'Enter' });
    expect(zoomInput.value).toBe('137%');

    // Mở Popover Zoom và kéo thanh trượt tới 185%
    fireEvent.click(screen.getByTestId('ink-zoom-menu-btn'));
    expect(screen.getByTestId('ink-zoom-popover')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('ink-zoom-slider'), { target: { value: '185' } });
    expect(zoomInput.value).toBe('185%');

    // Ctrl + Lăn chuột trên vùng cuộn trang giấy
    const viewport = screen.getByTestId('math-ink-scroll-viewport');
    fireEvent.wheel(viewport, { deltaY: -100, ctrlKey: true });
    expect(Number.parseInt(zoomInput.value, 10)).toBeGreaterThan(185);

    // Chuyển sang công cụ Tẩy chung (KHÔNG cần vào chế độ Dựng hình) và chạm vào vị trí điểm P -> điểm P bị xóa sạch!
    fireEvent.click(screen.getByTestId('ink-eraser-btn'));
    const canvas = screen.getByTestId('math-ink-canvas');
    // Trong jsdom getBoundingClientRect() trả 0x0 nên toCanvasPoint quy đổi clientX=0, clientY=0 -> (0,0); đặt điểm tại (4,4) nằm trong bán kính tẩy
    act(() => {
      useInkNotebookStore.getState().commitPageMutation((pg) => ({
        ...pg,
        geoObjects: [
          {
            id: 'ptOrigin',
            kind: 'geo-point',
            pointMode: 'free',
            x: 4,
            y: 4,
            label: 'Q',
            color: '#1D4ED8',
          },
        ],
      }));
    });
    expect(selectActiveInkPage(useInkNotebookStore.getState()).geoObjects).toHaveLength(1);
    fireEvent.pointerDown(canvas, { clientX: 0, clientY: 0 });
    expect(selectActiveInkPage(useInkNotebookStore.getState()).geoObjects).toHaveLength(0);

    // 3. Kéo di chuyển & thao tác nhanh Điểm trực tiếp bằng con trỏ Chọn (V) KHÔNG cần bấm vào Dựng hình!
    act(() => {
      useInkNotebookStore.getState().commitPageMutation((pg) => ({
        ...pg,
        geoObjects: [
          {
            id: 'ptDirect',
            kind: 'geo-point',
            pointMode: 'free',
            x: 5,
            y: 5,
            label: 'A',
            color: '#1D4ED8',
          },
        ],
      }));
    });
    // Nhấn phím tắt V để bật nhanh Con trỏ Chọn & Di chuyển đa năng (không mở thanh Dựng hình)
    fireEvent.keyDown(window, { key: 'v' });
    expect(screen.queryByTestId('geogebra-toolbar')).not.toBeInTheDocument();

    // Bấm vào điểm A ở gần gốc (0,0) -> mở thanh thao tác nhanh ink-geo-quick-bar & cho phép đổi tên / xóa tức thì
    fireEvent.pointerDown(canvas, { clientX: 0, clientY: 0 });
    expect(screen.getByTestId('ink-geo-quick-bar')).toBeInTheDocument();
    const renameInput = screen.getByLabelText('Đổi tên điểm') as HTMLInputElement;
    fireEvent.change(renameInput, { target: { value: 'K' } });
    const renamedObj = selectActiveInkPage(useInkNotebookStore.getState()).geoObjects?.[0];
    expect(renamedObj?.kind === 'geo-point' ? renamedObj.label : '').toBe('K');
    fireEvent.pointerUp(canvas, { clientX: 0, clientY: 0 });

    // Xóa nhanh ngay từ thanh nổi
    fireEvent.click(screen.getByTestId('ink-geo-quick-delete'));
    expect(selectActiveInkPage(useInkNotebookStore.getState()).geoObjects).toHaveLength(0);
  });
});
