import {
  Box,
  Check,
  Compass,
  Download,
  Eraser,
  FilePenLine,
  ImagePlus,
  Maximize2,
  Minimize2,
  Minus,
  PanelLeft,
  Plus,
  Redo2,
  RotateCw,
  Ruler,
  Shapes,
  SlidersHorizontal,
  Sparkles,
  SquareDashed,
  Trash2,
  TrendingUp,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router';
import { FolderNotebookSidebar } from '@/components/math-ink/FolderNotebookSidebar';
import { FunctionGraphPopover } from '@/components/math-ink/FunctionGraphPopover';
import {
  EraserModePopover,
  InkModePopover,
  PaperSettingsPopover,
  PenSettingsPopover,
  SelectionModePopover,
  ShapePickerPopover,
} from '@/components/math-ink/InkToolbarPopovers';
import { Solid3DPopover } from '@/components/math-ink/Solid3DPopover';
import { useExamBuilderStore } from '@/features/exam-builder';
import { InlineMathText } from '@/features/math-glossary';
import {
  doesCircleHitStroke,
  doesShapeHitPoint,
  eraseStrokeSegment,
  isPointInPolygon,
  PAGE_DIMENSIONS,
  recognizeInkGesture,
  renderInkPageToCanvas,
  selectActiveInkBucket,
  selectActiveInkFolders,
  selectActiveInkPage,
  selectActiveNotebook,
  selectActivePenPreset,
  snapPointToRulerEdge,
  useInkNotebookStore,
  type EraserMode,
  type Ink3DSolidItem,
  type InkActiveTool,
  type InkGraphItem,
  type InkPage,
  type InkPoint,
  type InkRecognitionMode,
  type InkShapeItem,
  type InkStroke,
  type RulerState,
  type SelectionMode,
  type ShapeToolKind,
} from '@/features/math-ink';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

type OpenPopoverKey =
  null | 'paper' | 'pen' | 'ink-mode' | 'shapes' | 'solid3d' | 'graph' | 'eraser' | 'selection';

function makeLocalId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function getEraserRadius(mode: EraserMode): number {
  if (mode === 'segment-sm') return 10;
  if (mode === 'segment-md') return 20;
  if (mode === 'segment-lg') return 34;
  return 14;
}

function shiftPageItemsBelowY(page: InkPage, anchorY: number, dy: number): InkPage {
  if (Math.abs(dy) < 1) return page;
  return {
    ...page,
    strokes: page.strokes.map((st) => {
      const hasBelow = st.points.some((p) => p.y >= anchorY);
      if (!hasBelow) return st;
      return {
        ...st,
        points: st.points.map((p) => (p.y >= anchorY ? { ...p, y: p.y + dy } : p)),
      };
    }),
    shapes: page.shapes.map((sh) =>
      Math.min(sh.y1, sh.y2) >= anchorY ? { ...sh, y1: sh.y1 + dy, y2: sh.y2 + dy } : sh,
    ),
    solids3d: page.solids3d.map((s) => (s.y >= anchorY ? { ...s, y: s.y + dy } : s)),
    graphs: page.graphs.map((g) => (g.y >= anchorY ? { ...g, y: g.y + dy } : g)),
    texts: page.texts.map((t) => (t.y >= anchorY ? { ...t, y: t.y + dy } : t)),
    images: page.images.map((im) => (im.y >= anchorY ? { ...im, y: im.y + dy } : im)),
  };
}

function translateSelectedOnPage(
  page: InkPage,
  selectedIds: ReadonlySet<string>,
  dx: number,
  dy: number,
): InkPage {
  if (selectedIds.size === 0 || (dx === 0 && dy === 0)) return page;
  return {
    ...page,
    strokes: page.strokes.map((st) =>
      selectedIds.has(st.id)
        ? { ...st, points: st.points.map((p) => ({ ...p, x: p.x + dx, y: p.y + dy })) }
        : st,
    ),
    shapes: page.shapes.map((sh) =>
      selectedIds.has(sh.id)
        ? { ...sh, x1: sh.x1 + dx, y1: sh.y1 + dy, x2: sh.x2 + dx, y2: sh.y2 + dy }
        : sh,
    ),
    solids3d: page.solids3d.map((s) =>
      selectedIds.has(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s,
    ),
    graphs: page.graphs.map((g) =>
      selectedIds.has(g.id) ? { ...g, x: g.x + dx, y: g.y + dy } : g,
    ),
    texts: page.texts.map((t) => (selectedIds.has(t.id) ? { ...t, x: t.x + dx, y: t.y + dy } : t)),
    images: page.images.map((im) =>
      selectedIds.has(im.id) ? { ...im, x: im.x + dx, y: im.y + dy } : im,
    ),
  };
}

export function MathInkPage() {
  const navigate = useNavigate();
  const bucket = useInkNotebookStore(selectActiveInkBucket);
  const folders = useInkNotebookStore(selectActiveInkFolders);
  const activeNotebook = useInkNotebookStore(selectActiveNotebook);
  const activePage = useInkNotebookStore(selectActiveInkPage);
  const penPresets = useInkNotebookStore((s) => s.penPresets);
  const activePenPreset = useInkNotebookStore(selectActivePenPreset);
  const undoCount = useInkNotebookStore((s) => s.undoStack.length);
  const redoCount = useInkNotebookStore((s) => s.redoStack.length);

  const selectNotebook = useInkNotebookStore((s) => s.selectNotebook);
  const createNotebook = useInkNotebookStore((s) => s.createNotebook);
  const renameActiveNotebook = useInkNotebookStore((s) => s.renameActiveNotebook);
  const deleteNotebook = useInkNotebookStore((s) => s.deleteNotebook);
  const moveNotebookToFolder = useInkNotebookStore((s) => s.moveNotebookToFolder);
  const createFolder = useInkNotebookStore((s) => s.createFolder);
  const renameFolder = useInkNotebookStore((s) => s.renameFolder);
  const deleteFolder = useInkNotebookStore((s) => s.deleteFolder);
  const updatePaperConfig = useInkNotebookStore((s) => s.updatePaperConfig);
  const selectPage = useInkNotebookStore((s) => s.selectPage);
  const addPage = useInkNotebookStore((s) => s.addPage);
  const duplicateActivePage = useInkNotebookStore((s) => s.duplicateActivePage);
  const deletePage = useInkNotebookStore((s) => s.deletePage);
  const clearActivePage = useInkNotebookStore((s) => s.clearActivePage);
  const commitPageMutation = useInkNotebookStore((s) => s.commitPageMutation);
  const addStroke = useInkNotebookStore((s) => s.addStroke);
  const addShape = useInkNotebookStore((s) => s.addShape);
  const addSolid3D = useInkNotebookStore((s) => s.addSolid3D);
  const updateSolid3D = useInkNotebookStore((s) => s.updateSolid3D);
  const addGraph = useInkNotebookStore((s) => s.addGraph);
  const addText = useInkNotebookStore((s) => s.addText);
  const addImage = useInkNotebookStore((s) => s.addImage);
  const undo = useInkNotebookStore((s) => s.undo);
  const redo = useInkNotebookStore((s) => s.redo);
  const selectPenPreset = useInkNotebookStore((s) => s.selectPenPreset);
  const updateActivePenPreset = useInkNotebookStore((s) => s.updateActivePenPreset);

  const attachImageToActiveExam = useExamBuilderStore((s) => s.attachImageToActiveExam);
  const updateActiveExam = useExamBuilderStore((s) => s.updateActiveExam);

  const [activeTool, setActiveTool] = useState<InkActiveTool>('pen');
  const [inkMode, setInkMode] = useState<InkRecognitionMode>('ink');
  const [activeShape, setActiveShape] = useState<ShapeToolKind>('line');
  const [eraserMode, setEraserMode] = useState<EraserMode>('stroke');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('rect');
  const [openPopover, setOpenPopover] = useState<OpenPopoverKey>(null);
  const [editingSolidId, setEditingSolidId] = useState<string | null>(null);
  const [resizingBox, setResizingBox] = useState<{
    readonly id: string;
    readonly kind: 'solid3d' | 'graph' | 'image' | 'shape';
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  } | null>(null);

  const [showPagesSidebar, setShowPagesSidebar] = useState(true);
  const [zoom, setZoom] = useState(0.85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sentToExamNotice, setSentToExamNotice] = useState(false);

  const [ruler, setRuler] = useState<RulerState>({
    visible: false,
    x: 420,
    y: 340,
    angleDeg: 0,
    length: 440,
  });

  // Trạng thái thao tác vẽ trực tiếp trên canvas
  const [activeStroke, setActiveStroke] = useState<InkStroke | null>(null);
  const [previewShape, setPreviewShape] = useState<InkShapeItem | null>(null);
  const [selectionRect, setSelectionRect] = useState<{
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
  } | null>(null);
  const [lassoPoints, setLassoPoints] = useState<readonly InkPoint[]>([]);
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [spacerLineY, setSpacerLineY] = useState<number | null>(null);

  // Hộp nhập chữ / công thức KaTeX nổi trên trang
  const [pendingTextBox, setPendingTextBox] = useState<{
    readonly x: number;
    readonly y: number;
    readonly text: string;
    readonly isMath: boolean;
  } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pageHostRef = useRef<HTMLDivElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imageCacheTick, setImageCacheTick] = useState(0);

  const interactionRef = useRef<{
    mode:
      | 'none'
      | 'draw-stroke'
      | 'draw-shape'
      | 'erase'
      | 'select-rect'
      | 'select-lasso'
      | 'drag-selected'
      | 'spacer'
      | 'drag-ruler';
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    strokeDraft: InkStroke | null;
    shapeDraft: InkShapeItem | null;
    lassoDraft: InkPoint[];
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    strokeDraft: null,
    shapeDraft: null,
    lassoDraft: [],
  });

  const dims = PAGE_DIMENSIONS[activeNotebook.paper.orientation];

  // Nạp ảnh đính kèm vào bộ nhớ đệm để Canvas vẽ sắc nét
  useEffect(() => {
    for (const im of activePage.images) {
      if (!imageCacheRef.current.has(im.id)) {
        const img = new Image();
        img.onload = () => setImageCacheTick((t) => t + 1);
        img.src = im.dataUrl;
        imageCacheRef.current.set(im.id, img);
      }
    }
  }, [activePage.images]);

  // Vẽ lại toàn bộ trang Canvas HiDPI mỗi khi trạng thái thay đổi
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(dims.width * dpr);
    canvas.height = Math.round(dims.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    renderInkPageToCanvas(ctx, {
      width: dims.width,
      height: dims.height,
      paper: activeNotebook.paper,
      page: activePage,
      activeStroke,
      previewShape,
      imageCache: imageCacheRef.current,
      selectionRect,
      lassoPoints,
      selectedIds,
      spacerLineY,
    });
  }, [
    activeNotebook.paper,
    activePage,
    activeStroke,
    dims.height,
    dims.width,
    imageCacheTick,
    lassoPoints,
    previewShape,
    selectedIds,
    selectionRect,
    spacerLineY,
  ]);

  // Phím tắt chuyên nghiệp Ctrl+Z / Ctrl+Y / Delete
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault();
        commitPageMutation((page) => ({
          ...page,
          strokes: page.strokes.filter((s) => !selectedIds.has(s.id)),
          shapes: page.shapes.filter((s) => !selectedIds.has(s.id)),
          solids3d: page.solids3d.filter((s) => !selectedIds.has(s.id)),
          graphs: page.graphs.filter((g) => !selectedIds.has(g.id)),
          texts: page.texts.filter((t) => !selectedIds.has(t.id)),
          images: page.images.filter((im) => !selectedIds.has(im.id)),
        }));
        setSelectedIds(new Set());
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [commitPageMutation, redo, selectedIds, undo]);

  const toCanvasPoint = useCallback(
    (e: ReactPointerEvent<HTMLCanvasElement>): InkPoint => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0, pressure: e.pressure || 0.5 };
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * dims.width;
      const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * dims.height;
      return { x, y, pressure: e.pressure && e.pressure > 0 ? e.pressure : 0.5 };
    },
    [dims.height, dims.width],
  );

  const findHitObjectId = useCallback(
    (pt: InkPoint): string | null => {
      for (let i = activePage.solids3d.length - 1; i >= 0; i -= 1) {
        const s = activePage.solids3d[i]!;
        if (pt.x >= s.x && pt.x <= s.x + s.width && pt.y >= s.y && pt.y <= s.y + s.height) {
          return s.id;
        }
      }
      for (let i = activePage.graphs.length - 1; i >= 0; i -= 1) {
        const g = activePage.graphs[i]!;
        if (pt.x >= g.x && pt.x <= g.x + g.width && pt.y >= g.y && pt.y <= g.y + g.height) {
          return g.id;
        }
      }
      for (let i = activePage.images.length - 1; i >= 0; i -= 1) {
        const im = activePage.images[i]!;
        if (pt.x >= im.x && pt.x <= im.x + im.width && pt.y >= im.y && pt.y <= im.y + im.height) {
          return im.id;
        }
      }
      for (let i = activePage.texts.length - 1; i >= 0; i -= 1) {
        const t = activePage.texts[i]!;
        if (pt.x >= t.x - 10 && pt.x <= t.x + 220 && pt.y >= t.y - 26 && pt.y <= t.y + 30) {
          return t.id;
        }
      }
      for (let i = activePage.shapes.length - 1; i >= 0; i -= 1) {
        if (doesShapeHitPoint(activePage.shapes[i]!, pt.x, pt.y, 12)) {
          return activePage.shapes[i]!.id;
        }
      }
      for (let i = activePage.strokes.length - 1; i >= 0; i -= 1) {
        if (doesCircleHitStroke(activePage.strokes[i]!, pt.x, pt.y, 10)) {
          return activePage.strokes[i]!.id;
        }
      }
      return null;
    },
    [activePage],
  );

  const applyEraseAt = useCallback(
    (pt: InkPoint) => {
      const r = getEraserRadius(eraserMode);
      commitPageMutation((page) => {
        if (eraserMode === 'stroke') {
          const nextStrokes = page.strokes.filter((st) => !doesCircleHitStroke(st, pt.x, pt.y, r));
          const nextShapes = page.shapes.filter((sh) => !doesShapeHitPoint(sh, pt.x, pt.y, r));
          const nextSolids = page.solids3d.filter(
            (s) => !(pt.x >= s.x && pt.x <= s.x + s.width && pt.y >= s.y && pt.y <= s.y + s.height),
          );
          const nextGraphs = page.graphs.filter(
            (g) => !(pt.x >= g.x && pt.x <= g.x + g.width && pt.y >= g.y && pt.y <= g.y + g.height),
          );
          const nextTexts = page.texts.filter(
            (t) => !(pt.x >= t.x - 10 && pt.x <= t.x + 180 && pt.y >= t.y - 24 && pt.y <= t.y + 24),
          );
          if (
            nextStrokes.length === page.strokes.length &&
            nextShapes.length === page.shapes.length &&
            nextSolids.length === page.solids3d.length &&
            nextGraphs.length === page.graphs.length &&
            nextTexts.length === page.texts.length
          ) {
            return page;
          }
          return {
            ...page,
            strokes: nextStrokes,
            shapes: nextShapes,
            solids3d: nextSolids,
            graphs: nextGraphs,
            texts: nextTexts,
          };
        }

        // Tẩy từng đoạn nét (Segment Eraser)
        let changed = false;
        const nextStrokes: InkStroke[] = [];
        for (const st of page.strokes) {
          const parts = eraseStrokeSegment(st, pt.x, pt.y, r);
          if (parts.length !== 1 || parts[0] !== st) changed = true;
          nextStrokes.push(...parts);
        }
        if (!changed) return page;
        return { ...page, strokes: nextStrokes };
      });
    },
    [commitPageMutation, eraserMode],
  );

  const handleCanvasPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (openPopover) setOpenPopover(null);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const rawPt = toCanvasPoint(e);

    // 1. Công cụ chèn chữ / KaTeX
    if (activeTool === 'text') {
      setPendingTextBox({ x: rawPt.x, y: rawPt.y, text: '', isMath: true });
      return;
    }

    // 2. Công cụ Bút viết (hỗ trợ hút thẳng theo cạnh Thước kẻ!)
    if (activeTool === 'pen') {
      const pt = ruler.visible ? (snapPointToRulerEdge(rawPt.x, rawPt.y, ruler) ?? rawPt) : rawPt;
      const stroke: InkStroke = {
        id: makeLocalId('st'),
        penKind: activePenPreset.penKind,
        color: activePenPreset.color,
        width: activePenPreset.width,
        opacity:
          activePenPreset.penKind === 'highlighter'
            ? 0.34
            : activePenPreset.penKind === 'pencil'
              ? 0.78
              : 1,
        points: [pt],
      };
      interactionRef.current = {
        ...interactionRef.current,
        mode: 'draw-stroke',
        startX: pt.x,
        startY: pt.y,
        lastX: pt.x,
        lastY: pt.y,
        strokeDraft: stroke,
      };
      setActiveStroke(stroke);
      return;
    }

    // 3. Công cụ Hình học 2D & Đường nét đứt / Mũi tên
    if (activeTool === 'shape') {
      const shape: InkShapeItem = {
        id: makeLocalId('sh'),
        kind: activeShape,
        x1: rawPt.x,
        y1: rawPt.y,
        x2: rawPt.x,
        y2: rawPt.y,
        color: activePenPreset.color,
        width: Math.max(1.8, Math.min(6, activePenPreset.width)),
      };
      interactionRef.current = {
        ...interactionRef.current,
        mode: 'draw-shape',
        startX: rawPt.x,
        startY: rawPt.y,
        lastX: rawPt.x,
        lastY: rawPt.y,
        shapeDraft: shape,
      };
      setPreviewShape(shape);
      return;
    }

    // 4. Công cụ Tẩy
    if (activeTool === 'eraser') {
      interactionRef.current = {
        ...interactionRef.current,
        mode: 'erase',
        startX: rawPt.x,
        startY: rawPt.y,
        lastX: rawPt.x,
        lastY: rawPt.y,
      };
      applyEraseAt(rawPt);
      return;
    }

    // 5. Công cụ Chọn vùng / Di chuyển / Chèn khoảng trống (Page Spacer)
    if (activeTool === 'select') {
      if (selectionMode === 'spacer') {
        interactionRef.current = {
          ...interactionRef.current,
          mode: 'spacer',
          startX: rawPt.x,
          startY: rawPt.y,
          lastX: rawPt.x,
          lastY: rawPt.y,
        };
        setSpacerLineY(rawPt.y);
        return;
      }

      const hitId = findHitObjectId(rawPt);
      if (hitId) {
        const nextSet = selectedIds.has(hitId) ? selectedIds : new Set([hitId]);
        setSelectedIds(nextSet);
        interactionRef.current = {
          ...interactionRef.current,
          mode: 'drag-selected',
          startX: rawPt.x,
          startY: rawPt.y,
          lastX: rawPt.x,
          lastY: rawPt.y,
        };
        return;
      }

      setSelectedIds(new Set());
      if (selectionMode === 'lasso') {
        interactionRef.current = {
          ...interactionRef.current,
          mode: 'select-lasso',
          startX: rawPt.x,
          startY: rawPt.y,
          lastX: rawPt.x,
          lastY: rawPt.y,
          lassoDraft: [rawPt],
        };
        setLassoPoints([rawPt]);
      } else {
        interactionRef.current = {
          ...interactionRef.current,
          mode: 'select-rect',
          startX: rawPt.x,
          startY: rawPt.y,
          lastX: rawPt.x,
          lastY: rawPt.y,
        };
        setSelectionRect({ x: rawPt.x, y: rawPt.y, w: 0, h: 0 });
      }
    }
  };

  const handleCanvasPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const state = interactionRef.current;
    if (state.mode === 'none') return;
    const rawPt = toCanvasPoint(e);

    if (state.mode === 'draw-stroke' && state.strokeDraft) {
      const pt = ruler.visible ? (snapPointToRulerEdge(rawPt.x, rawPt.y, ruler) ?? rawPt) : rawPt;
      const dist = Math.hypot(pt.x - state.lastX, pt.y - state.lastY);
      if (dist < 1.5) return;
      state.lastX = pt.x;
      state.lastY = pt.y;
      const nextStroke: InkStroke = {
        ...state.strokeDraft,
        points: [...state.strokeDraft.points, pt],
      };
      state.strokeDraft = nextStroke;
      setActiveStroke(nextStroke);
      return;
    }

    if (state.mode === 'draw-shape' && state.shapeDraft) {
      let x2 = rawPt.x;
      let y2 = rawPt.y;
      if (e.shiftKey) {
        const dx = x2 - state.startX;
        const dy = y2 - state.startY;
        const size = Math.max(Math.abs(dx), Math.abs(dy));
        x2 = state.startX + Math.sign(dx || 1) * size;
        y2 = state.startY + Math.sign(dy || 1) * size;
      }
      const nextShape: InkShapeItem = { ...state.shapeDraft, x2, y2 };
      state.shapeDraft = nextShape;
      setPreviewShape(nextShape);
      return;
    }

    if (state.mode === 'erase') {
      applyEraseAt(rawPt);
      return;
    }

    if (state.mode === 'drag-selected') {
      const dx = rawPt.x - state.lastX;
      const dy = rawPt.y - state.lastY;
      if (Math.hypot(dx, dy) < 1) return;
      state.lastX = rawPt.x;
      state.lastY = rawPt.y;
      commitPageMutation((page) => translateSelectedOnPage(page, selectedIds, dx, dy));
      return;
    }

    if (state.mode === 'select-rect') {
      setSelectionRect({
        x: Math.min(state.startX, rawPt.x),
        y: Math.min(state.startY, rawPt.y),
        w: Math.abs(rawPt.x - state.startX),
        h: Math.abs(rawPt.y - state.startY),
      });
      return;
    }

    if (state.mode === 'select-lasso') {
      state.lassoDraft = [...state.lassoDraft, rawPt];
      setLassoPoints(state.lassoDraft);
      return;
    }

    if (state.mode === 'spacer') {
      setSpacerLineY(rawPt.y);
    }
  };

  const handleCanvasPointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const state = interactionRef.current;
    if (state.mode === 'none') return;
    const rawPt = toCanvasPoint(e);

    if (state.mode === 'draw-stroke' && state.strokeDraft) {
      const finished = state.strokeDraft;
      const recognized = recognizeInkGesture(finished.points, inkMode);
      if (recognized) {
        addShape({
          id: makeLocalId('sh'),
          kind: recognized.kind,
          x1: recognized.x1,
          y1: recognized.y1,
          x2: recognized.x2,
          y2: recognized.y2,
          color: finished.color,
          width: Math.max(1.8, Math.min(6, finished.width)),
        });
      } else {
        addStroke(finished);
      }
      setActiveStroke(null);
    } else if (state.mode === 'draw-shape' && state.shapeDraft) {
      const sh = state.shapeDraft;
      if (Math.hypot(sh.x2 - sh.x1, sh.y2 - sh.y1) >= 6) {
        addShape(sh);
      }
      setPreviewShape(null);
    } else if (state.mode === 'select-rect' && selectionRect) {
      const rx1 = selectionRect.x;
      const ry1 = selectionRect.y;
      const rx2 = selectionRect.x + selectionRect.w;
      const ry2 = selectionRect.y + selectionRect.h;
      const picked = new Set<string>();
      for (const st of activePage.strokes) {
        if (st.points.some((p) => p.x >= rx1 && p.x <= rx2 && p.y >= ry1 && p.y <= ry2)) {
          picked.add(st.id);
        }
      }
      for (const sh of activePage.shapes) {
        const cx = (sh.x1 + sh.x2) / 2;
        const cy = (sh.y1 + sh.y2) / 2;
        if (cx >= rx1 && cx <= rx2 && cy >= ry1 && cy <= ry2) picked.add(sh.id);
      }
      for (const s of activePage.solids3d) {
        const cx = s.x + s.width / 2;
        const cy = s.y + s.height / 2;
        if (cx >= rx1 && cx <= rx2 && cy >= ry1 && cy <= ry2) picked.add(s.id);
      }
      for (const g of activePage.graphs) {
        const cx = g.x + g.width / 2;
        const cy = g.y + g.height / 2;
        if (cx >= rx1 && cx <= rx2 && cy >= ry1 && cy <= ry2) picked.add(g.id);
      }
      setSelectedIds(picked);
      setSelectionRect(null);
    } else if (state.mode === 'select-lasso' && state.lassoDraft.length >= 3) {
      const poly = state.lassoDraft;
      const picked = new Set<string>();
      for (const st of activePage.strokes) {
        if (st.points.some((p) => isPointInPolygon(p.x, p.y, poly))) picked.add(st.id);
      }
      for (const sh of activePage.shapes) {
        if (isPointInPolygon((sh.x1 + sh.x2) / 2, (sh.y1 + sh.y2) / 2, poly)) picked.add(sh.id);
      }
      for (const s of activePage.solids3d) {
        if (isPointInPolygon(s.x + s.width / 2, s.y + s.height / 2, poly)) picked.add(s.id);
      }
      for (const g of activePage.graphs) {
        if (isPointInPolygon(g.x + g.width / 2, g.y + g.height / 2, poly)) picked.add(g.id);
      }
      setSelectedIds(picked);
      setLassoPoints([]);
    } else if (state.mode === 'spacer') {
      const dy = rawPt.y - state.startY;
      if (Math.abs(dy) >= 12) {
        commitPageMutation((page) => shiftPageItemsBelowY(page, state.startY, dy));
      }
      setSpacerLineY(null);
    }

    interactionRef.current = {
      mode: 'none',
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      strokeDraft: null,
      shapeDraft: null,
      lassoDraft: [],
    };
  };

  const handleInsertSolid3D = (solidInput: Omit<Ink3DSolidItem, 'id' | 'x' | 'y'>) => {
    const id = makeLocalId('s3d');
    const offset = (activePage.solids3d.length % 4) * 28;
    addSolid3D({
      ...solidInput,
      id,
      x: Math.round(dims.width * 0.5 - solidInput.width / 2) + offset,
      y: 150 + offset,
    });
    setActiveTool('select');
    setSelectedIds(new Set([id]));
  };

  const handleInsertGraph = (graphInput: Omit<InkGraphItem, 'id' | 'x' | 'y'>) => {
    const id = makeLocalId('graph');
    const offset = (activePage.graphs.length % 4) * 24;
    addGraph({
      ...graphInput,
      id,
      x: Math.round(dims.width * 0.5 - graphInput.width / 2) + offset,
      y: 160 + offset,
    });
    setActiveTool('select');
    setSelectedIds(new Set([id]));
  };

  const handleUploadCanvasImage = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const dataUrl = reader.result;
      const img = new Image();
      img.onload = () => {
        const maxW = 360;
        const ratio = img.width > 0 ? Math.min(1, maxW / img.width) : 1;
        addImage({
          id: makeLocalId('img'),
          x: 120,
          y: 120,
          width: Math.round((img.width || 320) * ratio),
          height: Math.round((img.height || 240) * ratio),
          dataUrl,
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCommitTextBox = () => {
    if (!pendingTextBox || !pendingTextBox.text.trim()) {
      setPendingTextBox(null);
      return;
    }
    addText({
      id: makeLocalId('txt'),
      x: pendingTextBox.x,
      y: pendingTextBox.y,
      text: pendingTextBox.text.trim(),
      color: activePenPreset.color,
      fontSize: 20,
      isMath: pendingTextBox.isMath,
    });
    setPendingTextBox(null);
  };

  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${activeNotebook.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'bang-viet-toan'}-trang-${activeNotebook.activePageIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleSendToExamBuilder = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const attached = attachImageToActiveExam({
      dataUrl,
      caption: `${activeNotebook.title} — Trang ${activeNotebook.activePageIndex + 1}`,
      widthPercent: 60,
    });
    const currentExam = useExamBuilderStore.getState();
    const activeExamDoc =
      currentExam.buckets[currentExam.activeAccountKey]?.exams.find(
        (ex) => ex.id === currentExam.buckets[currentExam.activeAccountKey]?.activeExamId,
      ) ?? null;
    if (activeExamDoc) {
      updateActiveExam({
        rawMarkup: `${activeExamDoc.rawMarkup}\n[HÌNH:${attached.id}]\n`,
      });
    }
    setSentToExamNotice(true);
    window.setTimeout(() => {
      setSentToExamNotice(false);
      void navigate(ROUTES.examBuilder);
    }, 650);
  };

  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      void pageHostRef.current?.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const togglePopover = (key: OpenPopoverKey) => {
    setOpenPopover((prev) => (prev === key ? null : key));
  };

  const selectedSolid = useMemo(() => {
    if (selectedIds.size !== 1) return null;
    const onlyId = Array.from(selectedIds)[0];
    return activePage.solids3d.find((s) => s.id === onlyId) ?? null;
  }, [activePage.solids3d, selectedIds]);

  const editingSolid = useMemo(() => {
    if (!editingSolidId) return null;
    return activePage.solids3d.find((s) => s.id === editingSolidId) ?? null;
  }, [activePage.solids3d, editingSolidId]);

  const selectedResizable = useMemo(() => {
    if (selectedIds.size !== 1) return null;
    const onlyId = Array.from(selectedIds)[0];
    if (!onlyId) return null;

    const solid = activePage.solids3d.find((s) => s.id === onlyId);
    if (solid) {
      return {
        kind: 'solid3d' as const,
        id: solid.id,
        x: solid.x,
        y: solid.y,
        width: solid.width,
        height: solid.height,
      };
    }

    const graph = activePage.graphs.find((g) => g.id === onlyId);
    if (graph) {
      return {
        kind: 'graph' as const,
        id: graph.id,
        x: graph.x,
        y: graph.y,
        width: graph.width,
        height: graph.height,
      };
    }

    const image = activePage.images.find((im) => im.id === onlyId);
    if (image) {
      return {
        kind: 'image' as const,
        id: image.id,
        x: image.x,
        y: image.y,
        width: image.width,
        height: image.height,
      };
    }

    const shape = activePage.shapes.find((sh) => sh.id === onlyId);
    if (shape) {
      const minX = Math.min(shape.x1, shape.x2);
      const minY = Math.min(shape.y1, shape.y2);
      const w = Math.max(24, Math.abs(shape.x2 - shape.x1));
      const h = Math.max(24, Math.abs(shape.y2 - shape.y1));
      return {
        kind: 'shape' as const,
        id: shape.id,
        x: minX,
        y: minY,
        width: w,
        height: h,
      };
    }

    return null;
  }, [activePage.graphs, activePage.images, activePage.shapes, activePage.solids3d, selectedIds]);

  const handleRotateSelectedSolid = (deltaYaw: number) => {
    if (!selectedSolid) return;
    commitPageMutation((page) => ({
      ...page,
      solids3d: page.solids3d.map((s) =>
        s.id === selectedSolid.id ? { ...s, yaw: (s.yaw + deltaYaw + 360) % 360 } : s,
      ),
    }));
  };

  const applyResizedBox = useCallback(
    (box: {
      readonly id: string;
      readonly kind: 'solid3d' | 'graph' | 'image' | 'shape';
      readonly x: number;
      readonly y: number;
      readonly width: number;
      readonly height: number;
    }) => {
      commitPageMutation((page) => {
        if (box.kind === 'solid3d') {
          return {
            ...page,
            solids3d: page.solids3d.map((s) =>
              s.id === box.id
                ? {
                    ...s,
                    x: Math.round(box.x),
                    y: Math.round(box.y),
                    width: Math.round(box.width),
                    height: Math.round(box.height),
                  }
                : s,
            ),
          };
        }
        if (box.kind === 'graph') {
          return {
            ...page,
            graphs: page.graphs.map((g) =>
              g.id === box.id
                ? {
                    ...g,
                    x: Math.round(box.x),
                    y: Math.round(box.y),
                    width: Math.round(box.width),
                    height: Math.round(box.height),
                  }
                : g,
            ),
          };
        }
        if (box.kind === 'image') {
          return {
            ...page,
            images: page.images.map((im) =>
              im.id === box.id
                ? {
                    ...im,
                    x: Math.round(box.x),
                    y: Math.round(box.y),
                    width: Math.round(box.width),
                    height: Math.round(box.height),
                  }
                : im,
            ),
          };
        }
        return {
          ...page,
          shapes: page.shapes.map((sh) => {
            if (sh.id !== box.id) return sh;
            const oldMinX = Math.min(sh.x1, sh.x2);
            const oldMinY = Math.min(sh.y1, sh.y2);
            const oldSpanX = Math.abs(sh.x2 - sh.x1);
            const oldSpanY = Math.abs(sh.y2 - sh.y1);
            const mapX = (val: number) =>
              oldSpanX < 2
                ? box.x + box.width / 2
                : box.x + ((val - oldMinX) / oldSpanX) * box.width;
            const mapY = (val: number) =>
              oldSpanY < 2
                ? box.y + box.height / 2
                : box.y + ((val - oldMinY) / oldSpanY) * box.height;
            return {
              ...sh,
              x1: Math.round(mapX(sh.x1)),
              y1: Math.round(mapY(sh.y1)),
              x2: Math.round(mapX(sh.x2)),
              y2: Math.round(mapY(sh.y2)),
            };
          }),
        };
      });
    },
    [commitPageMutation],
  );

  const handleScaleSelected = (factor: number) => {
    if (!selectedResizable) return;
    const minSize =
      selectedResizable.kind === 'graph' ? 180 : selectedResizable.kind === 'shape' ? 32 : 110;
    const maxW = dims.width - 40;
    const maxH = dims.height - 40;
    const nextW = Math.min(maxW, Math.max(minSize, Math.round(selectedResizable.width * factor)));
    const nextH =
      selectedResizable.kind === 'solid3d'
        ? nextW
        : Math.min(maxH, Math.max(minSize, Math.round(selectedResizable.height * factor)));
    const cx = selectedResizable.x + selectedResizable.width / 2;
    const cy = selectedResizable.y + selectedResizable.height / 2;
    const nextX = Math.max(12, Math.min(dims.width - nextW - 12, Math.round(cx - nextW / 2)));
    const nextY = Math.max(12, Math.min(dims.height - nextH - 12, Math.round(cy - nextH / 2)));
    applyResizedBox({
      ...selectedResizable,
      x: nextX,
      y: nextY,
      width: nextW,
      height: nextH,
    });
  };

  const startCornerResize = (
    corner: 'nw' | 'ne' | 'sw' | 'se',
    e: ReactPointerEvent<HTMLButtonElement>,
  ) => {
    if (!selectedResizable) return;
    e.stopPropagation();
    e.preventDefault();
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const init = { ...selectedResizable };
    const aspect = init.height / Math.max(1, init.width);
    const minSize = init.kind === 'graph' ? 180 : init.kind === 'shape' ? 32 : 110;
    const maxW = dims.width - 32;
    const maxH = dims.height - 32;

    let latestBox = { ...init };
    setResizingBox(latestBox);

    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startClientX) / zoom;
      const dy = (ev.clientY - startClientY) / zoom;

      let nextW = init.width + (corner.includes('e') ? dx : -dx);
      let nextH = init.height + (corner.includes('s') ? dy : -dy);

      if (init.kind === 'solid3d') {
        const size = Math.min(maxW, Math.max(minSize, Math.round(Math.max(nextW, nextH))));
        nextW = size;
        nextH = size;
      } else if (init.kind === 'image') {
        nextW = Math.min(maxW, Math.max(minSize, Math.round(nextW)));
        nextH = Math.min(maxH, Math.max(minSize, Math.round(nextW * aspect)));
      } else {
        nextW = Math.min(maxW, Math.max(minSize, Math.round(nextW)));
        nextH = Math.min(maxH, Math.max(minSize, Math.round(nextH)));
      }

      const nextX = corner.includes('w') ? init.x + (init.width - nextW) : init.x;
      const nextY = corner.includes('n') ? init.y + (init.height - nextH) : init.y;

      latestBox = {
        ...init,
        x: Math.max(8, Math.min(dims.width - nextW - 8, nextX)),
        y: Math.max(8, Math.min(dims.height - nextH - 8, nextY)),
        width: nextW,
        height: nextH,
      };
      setResizingBox(latestBox);
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setResizingBox(null);
      if (
        latestBox.x !== init.x ||
        latestBox.y !== init.y ||
        latestBox.width !== init.width ||
        latestBox.height !== init.height
      ) {
        applyResizedBox(latestBox);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <div
      ref={pageHostRef}
      data-testid="math-ink-page"
      className="flex h-[calc(100vh-3rem)] flex-col overflow-hidden bg-[var(--bg-shell)] text-[var(--text-main)]"
    >
      <input
        ref={imageUploadRef}
        type="file"
        accept="image/*"
        onChange={handleUploadCanvasImage}
        className="hidden"
        aria-label="Chèn ảnh vào bảng viết"
      />

      {/* ========================================================================
          THANH CÔNG CỤ SCRBLE INK CẢI TIẾN (TOP RIBBON)
          ======================================================================== */}
      <header className="relative z-30 flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 py-2 shadow-2xs print:hidden">
        {/* TRÁI: Trang/Sổ, Undo/Redo, Giấy vở */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPagesSidebar((p) => !p)}
            title="Ẩn/hiện thư mục & danh sách trang"
            aria-label="Ẩn hoặc hiện thư mục và danh sách trang"
            className={cn(
              'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors',
              showPagesSidebar
                ? 'border-[var(--accent-os)]/40 bg-[var(--bg-surface)] text-[var(--accent-os)]'
                : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
            )}
          >
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <select
            aria-label="Chọn vở ghi chép"
            value={activeNotebook.id}
            onChange={(e) => selectNotebook(e.target.value)}
            className="h-8 max-w-[160px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 text-xs font-medium text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
          >
            {bucket.notebooks.map((nb) => (
              <option key={nb.id} value={nb.id}>
                {nb.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => createNotebook(undefined, activeNotebook.folderId ?? null)}
            title="Tạo vở mới trong thư mục hiện tại"
            aria-label="Tạo vở ghi chép mới"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--accent-os)]"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="mx-0.5 h-5 w-px bg-[var(--border-hairline)]" />

          <button
            type="button"
            data-testid="ink-undo-btn"
            disabled={undoCount === 0}
            onClick={undo}
            title="Hoàn tác (Ctrl+Z)"
            aria-label="Hoàn tác"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-35"
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            data-testid="ink-redo-btn"
            disabled={redoCount === 0}
            onClick={redo}
            title="Làm lại (Ctrl+Y)"
            aria-label="Làm lại"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-35"
          >
            <Redo2 className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Nút Cài đặt giấy vở (Scrble Paper) */}
          <div className="relative">
            <button
              type="button"
              data-testid="ink-paper-btn"
              onClick={() => togglePopover('paper')}
              title="Kiểu giấy, ô ly, lề đỏ & hướng trang"
              aria-label="Cài đặt giấy vở"
              className={cn(
                'inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border px-2 text-xs font-medium transition-colors',
                openPopover === 'paper'
                  ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Giấy</span>
            </button>
            {openPopover === 'paper' && (
              <div className="absolute top-10 left-0 z-50">
                <PaperSettingsPopover paper={activeNotebook.paper} onChange={updatePaperConfig} />
              </div>
            )}
          </div>
        </div>

        {/* GIỮA: Chấm màu bút nhanh + Nhận dạng nét + Thước + Hình 2D + 3D + Đồ thị f(x) + Tẩy + Chọn */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Chấm màu bút nhanh giống Scrble Ink */}
          <div className="relative flex items-center gap-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1">
            {penPresets.map((preset) => {
              const isSelected = activeTool === 'pen' && activePenPreset.id === preset.id;
              const isHighlighter = preset.penKind === 'highlighter';
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`pen-preset-${preset.id}`}
                  onClick={() => {
                    if (isSelected) {
                      togglePopover('pen');
                    } else {
                      selectPenPreset(preset.id);
                      setActiveTool('pen');
                      setOpenPopover(null);
                    }
                  }}
                  title={
                    isSelected
                      ? 'Nhấn lần nữa để chỉnh ngòi, bảng màu & cỡ nét'
                      : `Chọn ${isHighlighter ? 'dạ quang' : 'bút'}`
                  }
                  aria-label={`Chọn bút ${preset.id}`}
                  className={cn(
                    'flex cursor-pointer items-center justify-center rounded-full transition-transform',
                    isSelected
                      ? 'h-7 w-7 scale-105 ring-2 ring-[var(--accent-os)] ring-offset-1'
                      : 'h-6 w-6 hover:scale-110',
                  )}
                >
                  <span
                    style={{
                      backgroundColor: preset.color,
                      opacity: isHighlighter ? 0.65 : 1,
                    }}
                    className={cn(
                      'rounded-full border border-black/15',
                      isHighlighter ? 'h-4.5 w-4.5' : isSelected ? 'h-4 w-4' : 'h-3 w-3',
                    )}
                  />
                </button>
              );
            })}

            {openPopover === 'pen' && (
              <div className="absolute top-11 left-0 z-50">
                <PenSettingsPopover preset={activePenPreset} onChange={updateActivePenPreset} />
              </div>
            )}
          </div>

          {/* Chế độ nhận dạng mực (Ink / Shape / Line) */}
          <div className="relative">
            <button
              type="button"
              data-testid="ink-mode-btn"
              onClick={() => togglePopover('ink-mode')}
              title="Chế độ nắn nét tự động (Ink to Shape / Line)"
              aria-label="Chế độ nhận dạng nét mực"
              className={cn(
                'inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border px-2 text-xs font-medium transition-colors',
                inkMode !== 'ink' || openPopover === 'ink-mode'
                  ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
              )}
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden md:inline">
                {inkMode === 'ink'
                  ? 'Mực tự do'
                  : inkMode === 'line'
                    ? 'Nắn thẳng'
                    : inkMode === 'shape'
                      ? 'Nắn hình'
                      : 'Nắn hình+đường'}
              </span>
            </button>
            {openPopover === 'ink-mode' && (
              <div className="absolute top-10 left-0 z-50">
                <InkModePopover
                  mode={inkMode}
                  onChange={(m) => {
                    setInkMode(m);
                    setActiveTool('pen');
                    setOpenPopover(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* Thước kẻ tương tác */}
          <button
            type="button"
            data-testid="ink-ruler-toggle"
            onClick={() => setRuler((r) => ({ ...r, visible: !r.visible }))}
            title="Bật/tắt Thước kẻ thẳng (vẽ sát mép thước sẽ tự hút thẳng)"
            aria-pressed={ruler.visible}
            className={cn(
              'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors',
              ruler.visible
                ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            <Ruler className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Hình 2D, Nét đứt, Mũi tên & Chữ/KaTeX */}
          <div className="relative">
            <button
              type="button"
              data-testid="ink-shapes-btn"
              onClick={() => togglePopover('shapes')}
              title="Hình học 2D, nét đứt, vectơ & chèn chữ/KaTeX"
              aria-label="Công cụ hình học 2D và chữ"
              className={cn(
                'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors',
                activeTool === 'shape' || activeTool === 'text' || openPopover === 'shapes'
                  ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
              )}
            >
              <Shapes className="h-4 w-4" aria-hidden="true" />
            </button>
            {openPopover === 'shapes' && (
              <div className="absolute top-10 right-0 z-50 sm:left-0">
                <ShapePickerPopover
                  activeShape={activeShape}
                  onSelectShape={(kind) => {
                    setActiveShape(kind);
                    setActiveTool('shape');
                    setOpenPopover(null);
                  }}
                  onSelectTextTool={() => {
                    setActiveTool('text');
                    setOpenPopover(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* CẢI TIẾN ĐỘT PHÁ 1: HÌNH KHÔNG GIAN 3D */}
          <div className="relative">
            <button
              type="button"
              data-testid="ink-solid3d-btn"
              onClick={() => {
                setEditingSolidId(null);
                togglePopover('solid3d');
              }}
              title="Chèn Hình học không gian 3D tương tác (đặt tên đỉnh, hình trơn, dựng trung điểm/trọng tâm/đường cao)"
              className={cn(
                'inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors',
                openPopover === 'solid3d'
                  ? 'border-[#17332C] bg-[#17332C] text-white'
                  : 'border-[#1D4F6E]/35 bg-[#F3F8FB] text-[#1D4F6E] hover:bg-[#E4F0F7] dark:border-[#64A8D1]/35 dark:bg-[#131C22] dark:text-[#64A8D1]',
              )}
            >
              <Box className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Hình 3D</span>
            </button>
            {openPopover === 'solid3d' && (
              <div className="absolute top-10 right-0 z-50 sm:left-0">
                <Solid3DPopover
                  key={editingSolid?.id ?? 'new-solid'}
                  initialSolid={editingSolid}
                  onInsert={handleInsertSolid3D}
                  onUpdateExisting={(solidId, patch) => {
                    updateSolid3D(solidId, patch);
                    setEditingSolidId(null);
                  }}
                  onClose={() => {
                    setEditingSolidId(null);
                    setOpenPopover(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* CẢI TIẾN ĐỘT PHÁ 2: VẼ ĐỒ THỊ HÀM SỐ f(x) */}
          <div className="relative">
            <button
              type="button"
              data-testid="ink-graph-btn"
              onClick={() => togglePopover('graph')}
              title="Nhập biểu thức hàm số & vẽ đồ thị Oxy, điểm đặc biệt, tích phân"
              className={cn(
                'inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border px-2.5 text-xs font-semibold transition-colors',
                openPopover === 'graph'
                  ? 'border-[#17332C] bg-[#17332C] text-white'
                  : 'border-[#1B5E4A]/35 bg-[#F2F9F6] text-[#1B5E4A] hover:bg-[#E2F3EC] dark:border-[#52B394]/35 dark:bg-[#111F1A] dark:text-[#52B394]',
              )}
            >
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Đồ thị f(x)</span>
            </button>
            {openPopover === 'graph' && (
              <div className="absolute top-10 right-0 z-50">
                <FunctionGraphPopover
                  onInsert={handleInsertGraph}
                  onClose={() => setOpenPopover(null)}
                />
              </div>
            )}
          </div>

          {/* Tẩy (Stroke / Segment) */}
          <div className="relative">
            <button
              type="button"
              data-testid="ink-eraser-btn"
              onClick={() => {
                if (activeTool === 'eraser') togglePopover('eraser');
                else {
                  setActiveTool('eraser');
                  setOpenPopover(null);
                }
              }}
              title="Tẩy nét (nhấn lần 2 để chọn kiểu tẩy hoặc xóa trang)"
              aria-label="Công cụ tẩy"
              className={cn(
                'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors',
                activeTool === 'eraser' || openPopover === 'eraser'
                  ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
              )}
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
            </button>
            {openPopover === 'eraser' && (
              <div className="absolute top-10 right-0 z-50">
                <EraserModePopover
                  mode={eraserMode}
                  onChange={(m) => {
                    setEraserMode(m);
                    setActiveTool('eraser');
                    setOpenPopover(null);
                  }}
                  onClearPage={() => {
                    clearActivePage();
                    setOpenPopover(null);
                  }}
                />
              </div>
            )}
          </div>

          {/* Chọn vùng / Lasso / Chèn khoảng trống */}
          <div className="relative">
            <button
              type="button"
              data-testid="ink-select-btn"
              onClick={() => {
                if (activeTool === 'select') togglePopover('selection');
                else {
                  setActiveTool('select');
                  setOpenPopover(null);
                }
              }}
              title="Chọn & di chuyển đối tượng / Chèn khoảng trống (nhấn lần 2 để đổi chế độ)"
              aria-label="Công cụ chọn và di chuyển"
              className={cn(
                'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors',
                activeTool === 'select' || openPopover === 'selection'
                  ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
              )}
            >
              <SquareDashed className="h-4 w-4" aria-hidden="true" />
            </button>
            {openPopover === 'selection' && (
              <div className="absolute top-10 right-0 z-50">
                <SelectionModePopover
                  mode={selectionMode}
                  onChange={(m) => {
                    setSelectionMode(m);
                    setActiveTool('select');
                    setOpenPopover(null);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* PHẢI: Chèn ảnh, Zoom, Gửi sang Soạn đề, Xuất PNG, Toàn màn hình */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => imageUploadRef.current?.click()}
            title="Chèn ảnh từ máy tính"
            aria-label="Chèn ảnh vào trang"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
          >
            <ImagePlus className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="hidden items-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1 sm:inline-flex">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
              aria-label="Thu nhỏ"
              className="inline-flex h-7 w-6 cursor-pointer items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            >
              <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            <span className="min-w-[40px] text-center font-mono text-[10.5px] font-semibold tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(2))))}
              aria-label="Phóng to"
              className="inline-flex h-7 w-6 cursor-pointer items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-main)]"
            >
              <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            data-testid="ink-send-to-exam"
            onClick={handleSendToExamBuilder}
            title="Xuất hình trang này và gắn trực tiếp vào đề đang soạn ở Xưởng Soạn Đề"
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-[var(--accent-heritage)]/45 bg-[#FDF8F3] px-2.5 text-xs font-semibold text-[#8C5828] transition-colors hover:bg-[#F7ECE0] dark:bg-[#1D1813] dark:text-[#D4AF6A]"
          >
            {sentToExamNotice ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đã gửi!</span>
              </>
            ) : (
              <>
                <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden lg:inline">Đưa vào Soạn đề</span>
              </>
            )}
          </button>

          <button
            type="button"
            data-testid="ink-export-png"
            onClick={handleExportPng}
            title="Tải ảnh PNG độ nét cao của trang hiện tại"
            className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg bg-[#17332C] px-2.5 text-xs font-semibold text-white hover:bg-[#21463C]"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">PNG</span>
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Chế độ toàn màn hình"
            aria-label="Toàn màn hình"
            className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)] md:inline-flex"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* ========================================================================
          KHU VỰC CHÍNH: CỘT THƯ MỤC ĐA CẤP & TRANG VỞ + TRANG GIẤY VIẾT CANVAS
          ======================================================================== */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* CỘT THƯ MỤC ĐA CẤP & TRANG THUMBNAIL BÊN TRÁI */}
        {showPagesSidebar && (
          <FolderNotebookSidebar
            folders={folders}
            notebooks={bucket.notebooks}
            activeNotebook={activeNotebook}
            onSelectNotebook={selectNotebook}
            onCreateNotebook={createNotebook}
            onRenameActiveNotebook={renameActiveNotebook}
            onDeleteNotebook={deleteNotebook}
            onMoveNotebook={moveNotebookToFolder}
            onCreateFolder={createFolder}
            onRenameFolder={renameFolder}
            onDeleteFolder={deleteFolder}
            onSelectPage={selectPage}
            onAddPage={addPage}
            onDuplicatePage={(idx) => {
              selectPage(idx);
              duplicateActivePage();
            }}
            onDeletePage={deletePage}
          />
        )}

        {/* BÀN VIẾT CANVAS TƯƠNG TÁC */}
        <div className="os-thin-scrollbar relative flex-1 overflow-auto p-5 sm:p-8">
          {/* Thanh nổi thao tác nhanh khi đang chọn đối tượng (Di chuyển, Thu/Phóng, Xoay, Dựng hình 3D, Xóa) */}
          {selectedIds.size > 0 && (
            <div
              data-testid="ink-selection-bar"
              className="sticky top-2 z-20 mx-auto mb-3 flex w-fit flex-wrap items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/95 px-3.5 py-1.5 text-xs shadow-lg backdrop-blur-md"
            >
              <span className="font-mono text-[11px] font-semibold text-[var(--accent-os)]">
                Đang chọn {selectedIds.size} mục · Kéo để di chuyển
              </span>

              {selectedResizable && (
                <div className="inline-flex items-center gap-1 border-l border-[var(--border-hairline)] pl-1.5">
                  <button
                    type="button"
                    data-testid="selected-scale-down"
                    onClick={() => handleScaleSelected(0.85)}
                    title="Thu nhỏ đối tượng (-15%)"
                    className="inline-flex cursor-pointer items-center gap-0.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10.5px] font-medium hover:text-[var(--accent-os)]"
                  >
                    <Minus className="h-3 w-3" aria-hidden="true" />
                    <span>Thu nhỏ</span>
                  </button>
                  <button
                    type="button"
                    data-testid="selected-scale-up"
                    onClick={() => handleScaleSelected(1.15)}
                    title="Phóng to đối tượng (+15%)"
                    className="inline-flex cursor-pointer items-center gap-0.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10.5px] font-medium hover:text-[var(--accent-os)]"
                  >
                    <Plus className="h-3 w-3" aria-hidden="true" />
                    <span>Phóng to</span>
                  </button>
                </div>
              )}

              {selectedSolid && (
                <div className="inline-flex items-center gap-1 border-l border-[var(--border-hairline)] pl-1.5">
                  <button
                    type="button"
                    data-testid="selected-edit-solid-btn"
                    onClick={() => {
                      setEditingSolidId(selectedSolid.id);
                      setOpenPopover('solid3d');
                    }}
                    title="Đổi tên đỉnh, bật/tắt nhãn, thêm trung điểm / trọng tâm / đường cao"
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#1D4F6E]/40 bg-[#F3F8FB] px-2 py-0.5 text-[10.5px] font-semibold text-[#1D4F6E] hover:bg-[#E4F0F7] dark:border-[#64A8D1]/35 dark:bg-[#131C22] dark:text-[#64A8D1]"
                  >
                    <Compass className="h-3 w-3" aria-hidden="true" />
                    <span>Chỉnh đỉnh / Dựng hình</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotateSelectedSolid(-15)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10.5px] font-medium hover:text-[var(--accent-os)]"
                  >
                    <RotateCw className="h-3 w-3 -scale-x-100" aria-hidden="true" />
                    <span>-15°</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRotateSelectedSolid(15)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10.5px] font-medium hover:text-[var(--accent-os)]"
                  >
                    <RotateCw className="h-3 w-3" aria-hidden="true" />
                    <span>+15°</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  commitPageMutation((page) => ({
                    ...page,
                    strokes: page.strokes.filter((s) => !selectedIds.has(s.id)),
                    shapes: page.shapes.filter((s) => !selectedIds.has(s.id)),
                    solids3d: page.solids3d.filter((s) => !selectedIds.has(s.id)),
                    graphs: page.graphs.filter((g) => !selectedIds.has(g.id)),
                    texts: page.texts.filter((t) => !selectedIds.has(t.id)),
                    images: page.images.filter((im) => !selectedIds.has(im.id)),
                  }));
                  setSelectedIds(new Set());
                }}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[#8F3D35] px-2 py-0.5 text-[11px] font-semibold text-white"
              >
                <Trash2 className="h-3 w-3" aria-hidden="true" />
                <span>Xóa</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                aria-label="Bỏ chọn"
                className="inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full text-[var(--text-muted)] hover:bg-[var(--bg-surface)]"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* TỜ GIẤY VỞ Ô LY TOÁN HỌC */}
          <div
            className="relative mx-auto overflow-hidden rounded-lg border border-[var(--border-hairline)] shadow-[0_18px_46px_-22px_rgba(17,26,24,0.3)]"
            style={{
              width: Math.round(dims.width * zoom),
              height: Math.round(dims.height * zoom),
            }}
          >
            <canvas
              ref={canvasRef}
              data-testid="math-ink-canvas"
              onPointerDown={handleCanvasPointerDown}
              onPointerMove={handleCanvasPointerMove}
              onPointerUp={handleCanvasPointerUp}
              onPointerCancel={handleCanvasPointerUp}
              className={cn(
                'h-full w-full touch-none select-none',
                activeTool === 'pen' && 'cursor-crosshair',
                activeTool === 'shape' && 'cursor-crosshair',
                activeTool === 'eraser' && 'cursor-cell',
                activeTool === 'select' && 'cursor-move',
                activeTool === 'text' && 'cursor-text',
              )}
            />

            {/* Khung thu/phóng trực tiếp 4 góc cho Hình 3D, Đồ thị, Ảnh & Hình 2D đang chọn */}
            {(resizingBox ?? selectedResizable) &&
              (() => {
                const box = resizingBox ?? selectedResizable!;
                return (
                  <div
                    data-testid="ink-resize-frame"
                    style={{
                      left: `${(box.x / dims.width) * 100}%`,
                      top: `${(box.y / dims.height) * 100}%`,
                      width: `${(box.width / dims.width) * 100}%`,
                      height: `${(box.height / dims.height) * 100}%`,
                    }}
                    className="pointer-events-none absolute z-10 rounded-md border-2 border-dashed border-[var(--accent-os)]/75"
                  >
                    {resizingBox && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-[#17332C] px-1.5 py-0.5 font-mono text-[9.5px] whitespace-nowrap text-white shadow-sm">
                        {Math.round(box.width)} × {Math.round(box.height)} px
                      </div>
                    )}
                    <button
                      type="button"
                      data-testid="resize-handle-nw"
                      aria-label="Kéo góc trên trái để thu phóng"
                      onPointerDown={(e) => startCornerResize('nw', e)}
                      className="pointer-events-auto absolute -top-2 -left-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-[var(--accent-os)] shadow-md transition-transform hover:scale-125"
                    />
                    <button
                      type="button"
                      data-testid="resize-handle-ne"
                      aria-label="Kéo góc trên phải để thu phóng"
                      onPointerDown={(e) => startCornerResize('ne', e)}
                      className="pointer-events-auto absolute -top-2 -right-2 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-white bg-[var(--accent-os)] shadow-md transition-transform hover:scale-125"
                    />
                    <button
                      type="button"
                      data-testid="resize-handle-sw"
                      aria-label="Kéo góc dưới trái để thu phóng"
                      onPointerDown={(e) => startCornerResize('sw', e)}
                      className="pointer-events-auto absolute -bottom-2 -left-2 h-4 w-4 cursor-nesw-resize rounded-full border-2 border-white bg-[var(--accent-os)] shadow-md transition-transform hover:scale-125"
                    />
                    <button
                      type="button"
                      data-testid="resize-handle-se"
                      aria-label="Kéo góc dưới phải để thu phóng"
                      onPointerDown={(e) => startCornerResize('se', e)}
                      className="pointer-events-auto absolute -right-2 -bottom-2 h-4 w-4 cursor-nwse-resize rounded-full border-2 border-white bg-[var(--accent-os)] shadow-md transition-transform hover:scale-125"
                    />
                  </div>
                );
              })()}

            {/* Lớp phủ công thức KaTeX sắc nét cho các nhãn toán học đã chèn */}
            {activePage.texts
              .filter((t) => t.isMath && t.text.includes('$'))
              .map((t) => (
                <div
                  key={t.id}
                  style={{
                    left: `${(t.x / dims.width) * 100}%`,
                    top: `${((t.y - t.fontSize) / dims.height) * 100}%`,
                    color: t.color,
                    fontSize: `${Math.round(t.fontSize * zoom)}px`,
                  }}
                  className="pointer-events-none absolute rounded bg-white/85 px-1.5 py-0.5 shadow-2xs"
                >
                  <InlineMathText text={t.text} />
                </div>
              ))}

            {/* Hộp nhập chữ / công thức KaTeX ngay tại vị trí vừa click */}
            {pendingTextBox && (
              <div
                style={{
                  left: `${Math.min(72, (pendingTextBox.x / dims.width) * 100)}%`,
                  top: `${Math.min(82, (pendingTextBox.y / dims.height) * 100)}%`,
                }}
                className="absolute z-30 w-64 space-y-2 rounded-xl border border-[var(--accent-os)] bg-[var(--bg-workspace)] p-2.5 shadow-xl"
              >
                <input
                  type="text"
                  autoFocus
                  value={pendingTextBox.text}
                  onChange={(e) =>
                    setPendingTextBox((prev) => (prev ? { ...prev, text: e.target.value } : null))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommitTextBox();
                    if (e.key === 'Escape') setPendingTextBox(null);
                  }}
                  placeholder="Nhập chữ hoặc $f(x)=x^2$..."
                  className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                />
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <label className="inline-flex cursor-pointer items-center gap-1 text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={pendingTextBox.isMath}
                      onChange={(e) =>
                        setPendingTextBox((prev) =>
                          prev ? { ...prev, isMath: e.target.checked } : null,
                        )
                      }
                      className="accent-[var(--accent-os)]"
                    />
                    <span>KaTeX</span>
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPendingTextBox(null)}
                      className="cursor-pointer rounded px-2 py-1 text-[var(--text-muted)] hover:text-[var(--text-main)]"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleCommitTextBox}
                      className="cursor-pointer rounded bg-[var(--accent-os)] px-2.5 py-1 font-semibold text-white"
                    >
                      Chèn
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* THƯỚC KẺ TƯƠNG TÁC TRÊN TRANG VIẾT (KÉO DI CHUYỂN & XOAY GÓC) */}
            {ruler.visible && (
              <div
                data-testid="ink-canvas-ruler"
                style={{
                  left: `${(ruler.x / dims.width) * 100}%`,
                  top: `${(ruler.y / dims.height) * 100}%`,
                  width: `${(ruler.length / dims.width) * 100}%`,
                  transform: `translate(-50%, -50%) rotate(${ruler.angleDeg}deg)`,
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  const startClientX = e.clientX;
                  const startClientY = e.clientY;
                  const initX = ruler.x;
                  const initY = ruler.y;
                  const onMove = (ev: PointerEvent) => {
                    const dx = (ev.clientX - startClientX) / zoom;
                    const dy = (ev.clientY - startClientY) / zoom;
                    setRuler((prev) => ({ ...prev, x: initX + dx, y: initY + dy }));
                  };
                  const onUp = () => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                  };
                  window.addEventListener('pointermove', onMove);
                  window.addEventListener('pointerup', onUp);
                }}
                className="absolute z-20 flex h-12 cursor-grab items-center justify-between rounded-md border border-[#17332C]/45 bg-[#FFFDF8]/82 px-3 font-mono text-[10px] text-[#17332C] shadow-md backdrop-blur-xs select-none active:cursor-grabbing"
              >
                <span className="font-bold">{ruler.angleDeg}°</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() =>
                      setRuler((r) => ({ ...r, angleDeg: (r.angleDeg - 15 + 360) % 360 }))
                    }
                    className="cursor-pointer rounded border border-[#17332C]/25 bg-white/90 px-1.5 py-0.5 hover:bg-white"
                  >
                    -15°
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setRuler((r) => ({ ...r, angleDeg: 0 }))}
                    className="cursor-pointer rounded border border-[#17332C]/25 bg-white/90 px-1.5 py-0.5 hover:bg-white"
                  >
                    0°
                  </button>
                  <button
                    type="button"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => setRuler((r) => ({ ...r, angleDeg: (r.angleDeg + 15) % 360 }))}
                    className="cursor-pointer rounded border border-[#17332C]/25 bg-white/90 px-1.5 py-0.5 hover:bg-white"
                  >
                    +15°
                  </button>
                </div>
                <span className="text-[9px] text-[#4A5955]">Vẽ sát mép trên</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MathInkPage;
