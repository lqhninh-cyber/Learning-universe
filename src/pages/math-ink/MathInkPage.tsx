import {
  ArrowLeft,
  Box,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Download,
  Eraser,
  Eye,
  EyeOff,
  FileDown,
  FileImage,
  FilePenLine,
  Hand,
  ImagePlus,
  Maximize2,
  Minimize2,
  Minus,
  MousePointer2,
  PanelLeft,
  Pencil,
  Plus,
  Presentation,
  Redo2,
  RotateCw,
  Ruler,
  Shapes,
  Sigma,
  SlidersHorizontal,
  Sparkles,
  Stamp,
  Table2,
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
import { Link, useNavigate, useSearchParams } from 'react-router';
import { FolderNotebookSidebar } from '@/components/math-ink/FolderNotebookSidebar';
import { FunctionGraphPopover } from '@/components/math-ink/FunctionGraphPopover';
import { GeoGebraToolbar } from '@/components/math-ink/GeoGebraToolbar';
import {
  GeometryStampsPopover,
  type StampToolConfig,
} from '@/components/math-ink/GeometryStampsPopover';
import {
  InkFormulaEditorPopover,
  SmartInkMathContent,
} from '@/components/math-ink/InkFormulaEditorPopover';
import {
  EraserModePopover,
  InkModePopover,
  PaperSettingsPopover,
  PenSettingsPopover,
  SelectionModePopover,
  ShapePickerPopover,
} from '@/components/math-ink/InkToolbarPopovers';
import { Solid3DPopover } from '@/components/math-ink/Solid3DPopover';
import { TeachStudioBar } from '@/components/math-ink/TeachStudioBar';
import { ToolbarPopoverAnchor } from '@/components/math-ink/ToolbarPopoverAnchor';
import { VariationTablePopover } from '@/components/math-ink/VariationTablePopover';
import { WorksheetBackgroundPopover } from '@/components/math-ink/WorksheetBackgroundPopover';
import { useLayout } from '@/context/LayoutContext';
import { useExamBuilderStore } from '@/features/exam-builder';
import { buildExerciseStorageKey, useLearningStore } from '@/features/learning';
import { InlineMathText } from '@/features/math-glossary';
import {
  buildMultiPagePdfBytes,
  dataUrlToUint8Array,
  doesCircleHitStroke,
  doesShapeHitPoint,
  doesStampHitPoint,
  downloadPdfFile,
  eraseStrokeSegment,
  evaluateGeoScene,
  hitTestGeoScene,
  isPointInPolygon,
  LASER_DARK_CORE_COLOR,
  LASER_LIGHT_CORE_COLOR,
  LASER_POINT_TTL_MS,
  nextGeoPointLabel,
  PAGE_DIMENSIONS,
  recognizeInkGesture,
  removeGeoObjectsWithCascade,
  renderExamTextToWorksheetDataUrl,
  renderInkPageToCanvas,
  renderLaserOverlay,
  selectActiveInkBucket,
  selectActiveInkFolders,
  selectActiveInkPage,
  selectActiveNotebook,
  selectActivePenPreset,
  snapPointToRulerEdge,
  stabilizeInkPoint,
  translateGeoObjectsByTargets,
  useInkNotebookStore,
  type EraserMode,
  type GeoObject,
  type GeoSceneHit,
  type GeoToolKind,
  type Ink3DSolidItem,
  type InkActiveTool,
  type InkGraphItem,
  type InkPage,
  type InkPoint,
  type InkRecognitionMode,
  type InkShapeItem,
  type InkStroke,
  type InkTextItem,
  type InkVariationTableItem,
  type InkWorksheetBackground,
  type LaserColorPresetId,
  type LaserCursorPosition,
  type LaserTrail,
  type RulerState,
  type SelectionMode,
  type ShapeToolKind,
} from '@/features/math-ink';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import {
  clearExerciseHandoff,
  readExerciseHandoff,
  type InkExerciseHandoff,
} from '@/utils/exerciseHandoff';
import { resolveMediaDataUrl } from '@/utils/mediaDb';

type OpenPopoverKey =
  | null
  | 'paper'
  | 'pen'
  | 'ink-mode'
  | 'shapes'
  | 'formula'
  | 'solid3d'
  | 'graph'
  | 'variation'
  | 'stamps'
  | 'worksheet'
  | 'eraser'
  | 'selection'
  | 'zoom';

const LASER_COLOR_OPTIONS: readonly {
  readonly id: LaserColorPresetId;
  readonly label: string;
  readonly swatch: string;
}[] = [
  { id: 'default', label: 'Đỏ laser', swatch: LASER_LIGHT_CORE_COLOR },
  { id: 'emerald', label: 'Xanh lá', swatch: '#22C55E' },
  { id: 'blue', label: 'Xanh dương', swatch: '#3B82F6' },
];

function isDarkHexColor(hex: string): boolean {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return false;
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
}

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
    variationTables: (page.variationTables ?? []).map((t) =>
      t.y >= anchorY ? { ...t, y: t.y + dy } : t,
    ),
    stamps: (page.stamps ?? []).map((st) => (st.y >= anchorY ? { ...st, y: st.y + dy } : st)),
    geoObjects: (page.geoObjects ?? []).map((obj) =>
      obj.kind === 'geo-point' && obj.pointMode === 'free' && obj.y >= anchorY
        ? { ...obj, y: Number((obj.y + dy).toFixed(2)) }
        : obj,
    ),
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
    variationTables: (page.variationTables ?? []).map((t) =>
      selectedIds.has(t.id) ? { ...t, x: t.x + dx, y: t.y + dy } : t,
    ),
    stamps: (page.stamps ?? []).map((st) =>
      selectedIds.has(st.id) ? { ...st, x: st.x + dx, y: st.y + dy } : st,
    ),
    geoObjects: translateGeoObjectsByTargets(page.geoObjects, selectedIds, dx, dy),
    texts: page.texts.map((t) => (selectedIds.has(t.id) ? { ...t, x: t.x + dx, y: t.y + dy } : t)),
    images: page.images.map((im) =>
      selectedIds.has(im.id) ? { ...im, x: im.x + dx, y: im.y + dy } : im,
    ),
  };
}

export function MathInkPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setRailCollapsed } = useLayout();
  const [pinnedExercise, setPinnedExercise] = useState<InkExerciseHandoff | null>(() =>
    readExerciseHandoff(),
  );
  const [isPinnedExerciseCollapsed, setIsPinnedExerciseCollapsed] = useState(false);

  const pinnedExerciseKey = pinnedExercise
    ? buildExerciseStorageKey(pinnedExercise.lessonId, pinnedExercise.exerciseId)
    : null;
  const pinnedExerciseStatus = useLearningStore((state) =>
    pinnedExerciseKey ? (state.exerciseStatus[pinnedExerciseKey] ?? 'todo') : 'todo',
  );
  const setExerciseStatus = useLearningStore((state) => state.setExerciseStatus);

  // Tự động thu gọn LeftRail về 60px khi vào Bảng viết trên desktop để mở rộng tối đa mặt giấy
  const didAutoCollapseRailRef = useRef(false);
  useEffect(() => {
    if (didAutoCollapseRailRef.current) return;
    didAutoCollapseRailRef.current = true;
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setRailCollapsed(true);
    }
  }, [setRailCollapsed]);
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
  const renameNotebook = useInkNotebookStore((s) => s.renameNotebook);
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
  const addVariationTable = useInkNotebookStore((s) => s.addVariationTable);
  const updateVariationTable = useInkNotebookStore((s) => s.updateVariationTable);
  const addStamp = useInkNotebookStore((s) => s.addStamp);
  const setWorksheetBackground = useInkNotebookStore((s) => s.setWorksheetBackground);
  const addPagesWithWorksheets = useInkNotebookStore((s) => s.addPagesWithWorksheets);
  const addText = useInkNotebookStore((s) => s.addText);
  const updateText = useInkNotebookStore((s) => s.updateText);
  const deleteText = useInkNotebookStore((s) => s.deleteText);
  const addImage = useInkNotebookStore((s) => s.addImage);
  const undo = useInkNotebookStore((s) => s.undo);
  const redo = useInkNotebookStore((s) => s.redo);
  const selectPenPreset = useInkNotebookStore((s) => s.selectPenPreset);
  const updateActivePenPreset = useInkNotebookStore((s) => s.updateActivePenPreset);

  const attachImageToActiveExam = useExamBuilderStore((s) => s.attachImageToActiveExam);
  const updateActiveExam = useExamBuilderStore((s) => s.updateActiveExam);
  const activeExamTitle = useExamBuilderStore((s) => {
    const examBucket = s.buckets[s.activeAccountKey];
    const doc = examBucket?.exams.find((ex) => ex.id === examBucket.activeExamId);
    return doc?.title ?? null;
  });

  const [activeTool, setActiveTool] = useState<InkActiveTool>('pen');
  const [inkMode, setInkMode] = useState<InkRecognitionMode>('ink');
  const [activeShape, setActiveShape] = useState<ShapeToolKind>('line');
  const [eraserMode, setEraserMode] = useState<EraserMode>('stroke');
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('rect');
  const [openPopover, setOpenPopover] = useState<OpenPopoverKey>(null);
  const [editingSolidId, setEditingSolidId] = useState<string | null>(null);
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [stampConfig, setStampConfig] = useState<StampToolConfig>({
    kind: 'right-angle',
    size: 36,
    rotationDeg: 0,
    color: '#DC2626',
    label: 'A',
  });
  const [laserColorPreset, setLaserColorPreset] = useState<LaserColorPresetId>('default');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Đổi tên file vở trực tiếp trên thanh công cụ trên cùng
  const [isRenamingToolbarNb, setIsRenamingToolbarNb] = useState(false);
  const [toolbarNbTitleDraft, setToolbarNbTitleDraft] = useState('');

  // Trạng thái Chế độ Dựng Hình Động GeoGebra trực tiếp trên trang Bảng viết
  const [geoTool, setGeoTool] = useState<GeoToolKind>('segment');
  const [geoLineStyle, setGeoLineStyle] = useState<'solid' | 'dashed'>('solid');
  const [geoColor, setGeoColor] = useState<string>('#1D4ED8');
  const [geoPendingPts, setGeoPendingPts] = useState<readonly string[]>([]);
  const [geoPendingCurveId, setGeoPendingCurveId] = useState<string | null>(null);
  const [geoHoveredHit, setGeoHoveredHit] = useState<GeoSceneHit | null>(null);
  const [geoCursor, setGeoCursor] = useState<{ readonly x: number; readonly y: number } | null>(
    null,
  );
  const [geoSelectedId, setGeoSelectedId] = useState<string | null>(null);
  const geoDragStateRef = useRef<
    | null
    | { readonly mode: 'single-point'; readonly id: string }
    | { readonly mode: 'rigid-group'; readonly targetId: string; lastX: number; lastY: number }
    | { readonly mode: 'erase' }
  >(null);
  const geoPressStartRef = useRef<{
    readonly ptId: string;
    readonly x: number;
    readonly y: number;
  } | null>(null);

  // Các điểm neo Popover chống che khuất bởi LeftRail / mép màn hình
  const paperAnchorRef = useRef<HTMLDivElement>(null);
  const penAnchorRef = useRef<HTMLDivElement>(null);
  const inkModeAnchorRef = useRef<HTMLDivElement>(null);
  const shapesAnchorRef = useRef<HTMLDivElement>(null);
  const formulaAnchorRef = useRef<HTMLDivElement>(null);
  const solid3dAnchorRef = useRef<HTMLDivElement>(null);
  const graphAnchorRef = useRef<HTMLDivElement>(null);
  const variationAnchorRef = useRef<HTMLDivElement>(null);
  const stampsAnchorRef = useRef<HTMLDivElement>(null);
  const eraserAnchorRef = useRef<HTMLDivElement>(null);
  const selectionAnchorRef = useRef<HTMLDivElement>(null);
  const worksheetAnchorRef = useRef<HTMLDivElement>(null);
  const zoomAnchorRef = useRef<HTMLDivElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const [resizingBox, setResizingBox] = useState<{
    readonly id: string;
    readonly kind: 'solid3d' | 'graph' | 'variation' | 'image' | 'shape';
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  } | null>(null);

  const [showPagesSidebar, setShowPagesSidebar] = useState(true);
  const [zoom, setZoom] = useState<number>(() =>
    typeof window !== 'undefined' && window.innerWidth >= 1280 ? 1.05 : 0.95,
  );
  const [zoomInputDraft, setZoomInputDraft] = useState<string | null>(null);
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sentToExamNotice, setSentToExamNotice] = useState(false);
  const [isTeachMode, setIsTeachMode] = useState<boolean>(
    () => searchParams.get('mode') === 'teach',
  );
  const urlModeParam = searchParams.get('mode');
  const [prevUrlModeParam, setPrevUrlModeParam] = useState<string | null>(urlModeParam);
  if (urlModeParam !== prevUrlModeParam) {
    setPrevUrlModeParam(urlModeParam);
    if (urlModeParam === 'teach') {
      setIsTeachMode(true);
    }
  }

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
  const laserCanvasRef = useRef<HTMLCanvasElement>(null);
  const laserTrailsRef = useRef<LaserTrail[]>([]);
  const laserPointerHeadRef = useRef<LaserCursorPosition | null>(null);
  const isLaserPointerActiveRef = useRef<boolean>(false);
  const laserRafRef = useRef<number | null>(null);
  const laserColorPresetRef = useRef<LaserColorPresetId>('default');
  const paperBgColorRef = useRef<string>(activeNotebook.paper.backgroundColor);
  const pageHostRef = useRef<HTMLDivElement>(null);
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imageCacheTick, setImageCacheTick] = useState(0);

  const interactionRef = useRef<{
    mode:
      | 'none'
      | 'pan-viewport'
      | 'draw-stroke'
      | 'draw-shape'
      | 'laser'
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
    lastTimeMs: number;
    panStartClientX?: number;
    panStartClientY?: number;
    panStartScrollLeft?: number;
    panStartScrollTop?: number;
    strokeDraft: InkStroke | null;
    shapeDraft: InkShapeItem | null;
    lassoDraft: InkPoint[];
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    lastTimeMs: 0,
    strokeDraft: null,
    shapeDraft: null,
    lassoDraft: [],
  });

  const dims = PAGE_DIMENSIONS[activeNotebook.paper.orientation];

  // Nạp ảnh đính kèm & nền phiếu bài tập (hỗ trợ cả DataURL và idb:// từ IndexedDB) vào bộ nhớ đệm Canvas
  useEffect(() => {
    let cancelled = false;

    const loadIntoCache = (id: string, rawUrl: string) => {
      if (imageCacheRef.current.has(id)) return;
      void resolveMediaDataUrl(rawUrl).then((resolved) => {
        if (cancelled || !resolved || imageCacheRef.current.has(id)) return;
        const img = new Image();
        img.onload = () => {
          if (!cancelled) setImageCacheTick((t) => t + 1);
        };
        img.src = resolved;
        imageCacheRef.current.set(id, img);
      });
    };

    for (const im of activePage.images) {
      loadIntoCache(im.id, im.dataUrl);
    }
    const bg = activePage.worksheetBackground;
    if (bg) {
      loadIntoCache(bg.id, bg.dataUrl);
    }

    return () => {
      cancelled = true;
    };
  }, [activePage.images, activePage.worksheetBackground]);

  useEffect(() => {
    laserColorPresetRef.current = laserColorPreset;
  }, [laserColorPreset]);

  useEffect(() => {
    paperBgColorRef.current = activeNotebook.paper.backgroundColor;
  }, [activeNotebook.paper.backgroundColor]);

  const stopLaserLoop = useCallback(() => {
    if (laserRafRef.current !== null) {
      window.cancelAnimationFrame(laserRafRef.current);
      laserRafRef.current = null;
    }
  }, []);

  const clearLaserOverlay = useCallback(() => {
    laserTrailsRef.current = [];
    laserPointerHeadRef.current = null;
    isLaserPointerActiveRef.current = false;
    stopLaserLoop();
    const canvas = laserCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [stopLaserLoop]);

  // Vòng kết xuất tia Laser tự tan 60fps (1200ms, 0% CPU lúc nhàn rỗi, không lưu vào vở / Undo / xuất file)
  const ensureLaserLoop = useCallback(() => {
    if (laserRafRef.current !== null) return;

    const tick = () => {
      const canvas = laserCanvasRef.current;
      if (!canvas) {
        laserRafRef.current = null;
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        laserRafRef.current = null;
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetW = Math.round(dims.width * dpr);
      const targetH = Math.round(dims.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const isDarkUi =
        typeof document !== 'undefined' &&
        (document.documentElement.classList.contains('dark') ||
          document.documentElement.getAttribute('data-theme') === 'dark');
      const isDarkSurface = isDarkUi || isDarkHexColor(paperBgColorRef.current);

      const { aliveTrails, shouldContinue } = renderLaserOverlay(ctx, {
        width: dims.width,
        height: dims.height,
        trails: laserTrailsRef.current,
        pointerHead: laserPointerHeadRef.current,
        isPointerActive: isLaserPointerActiveRef.current,
        isDark: isDarkSurface,
        activeColorPreset: laserColorPresetRef.current,
        now: performance.now(),
        ttlMs: LASER_POINT_TTL_MS,
      });

      laserTrailsRef.current = aliveTrails;
      if (shouldContinue) {
        laserRafRef.current = window.requestAnimationFrame(tick);
      } else {
        stopLaserLoop();
      }
    };

    laserRafRef.current = window.requestAnimationFrame(tick);
  }, [dims.height, dims.width, stopLaserLoop]);

  useEffect(() => {
    clearLaserOverlay();
  }, [activeNotebook.id, activePage.id, clearLaserOverlay]);

  useEffect(() => {
    return () => {
      stopLaserLoop();
    };
  }, [stopLaserLoop]);

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
      skipScreenMathTexts: true,
      geoOverlay:
        activeTool === 'geo' || activeTool === 'select'
          ? {
              hoveredHit: geoHoveredHit,
              selectedGeoId: geoSelectedId,
              pendingPointIds: activeTool === 'geo' ? geoPendingPts : [],
              cursor: activeTool === 'geo' ? geoCursor : null,
              activeGeoTool: activeTool === 'geo' ? geoTool : 'move',
              activeColor: geoColor,
              activeLineStyle: geoLineStyle,
            }
          : undefined,
    });
  }, [
    activeNotebook.paper,
    activePage,
    activeStroke,
    activeTool,
    dims.height,
    dims.width,
    geoColor,
    geoCursor,
    geoHoveredHit,
    geoLineStyle,
    geoPendingPts,
    geoSelectedId,
    geoTool,
    imageCacheTick,
    lassoPoints,
    previewShape,
    selectedIds,
    selectionRect,
    spacerLineY,
  ]);

  const clampZoom = useCallback((nextZoom: number): number => {
    return Math.min(3.0, Math.max(0.35, Number(nextZoom.toFixed(2))));
  }, []);

  const fitZoomToWidth = useCallback(() => {
    const vp = scrollViewportRef.current;
    if (!vp || vp.clientWidth <= 100) {
      setZoom(1.05);
      return;
    }
    const ideal = (vp.clientWidth - 72) / dims.width;
    setZoom(clampZoom(ideal));
  }, [clampZoom, dims.width]);

  const fitZoomToPage = useCallback(() => {
    const vp = scrollViewportRef.current;
    if (!vp || vp.clientWidth <= 100 || vp.clientHeight <= 100) {
      setZoom(0.85);
      return;
    }
    const ideal = Math.min(
      (vp.clientWidth - 64) / dims.width,
      (vp.clientHeight - 56) / dims.height,
    );
    setZoom(clampZoom(ideal));
  }, [clampZoom, dims.height, dims.width]);

  // Hỗ trợ Ctrl + Lăn chuột (hoặc chụm/tách 2 ngón Trackpad) để Zoom tự do mượt mà 35% -> 300%
  useEffect(() => {
    const vp = scrollViewportRef.current;
    if (!vp) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.08 : 0.925;
      setZoom((prev) => clampZoom(prev * factor));
    };
    vp.addEventListener('wheel', onWheel, { passive: false });
    return () => vp.removeEventListener('wheel', onWheel);
  }, [clampZoom]);

  // Phím tắt chuyên nghiệp Ctrl+Z / Ctrl+Y / Delete / Space kéo trang / Ctrl +/- / 0
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' && !e.repeat && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsSpaceHeld(true);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setZoom((z) => clampZoom(z + 0.1));
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoom((z) => clampZoom(z - 0.1));
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoom(1);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        redo();
      } else if (isTeachMode && e.key === 'PageDown') {
        e.preventDefault();
        if (activeNotebook.activePageIndex < activeNotebook.pages.length - 1) {
          selectPage(activeNotebook.activePageIndex + 1);
        }
      } else if (isTeachMode && e.key === 'PageUp') {
        e.preventDefault();
        if (activeNotebook.activePageIndex > 0) {
          selectPage(activeNotebook.activePageIndex - 1);
        }
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setActiveTool('select');
        setOpenPopover(null);
      } else if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setOpenPopover(null);
        setActiveTool((prev) => (prev === 'laser' ? 'pen' : 'laser'));
      } else if (e.key === 'Escape' && activeTool === 'laser') {
        setActiveTool('pen');
      } else if (e.key === 'Escape' && activeTool === 'geo') {
        if (geoPendingPts.length > 0 || geoPendingCurveId) {
          setGeoPendingPts([]);
          setGeoPendingCurveId(null);
        } else if (geoTool !== 'move') {
          setGeoTool('move');
        } else {
          setGeoSelectedId(null);
        }
      } else if (e.key === 'Escape' && activeTool === 'select') {
        setGeoSelectedId(null);
        setSelectedIds(new Set());
      } else if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        activeTool === 'geo' &&
        geoSelectedId
      ) {
        e.preventDefault();
        commitPageMutation((page) => ({
          ...page,
          geoObjects: removeGeoObjectsWithCascade(page.geoObjects, [geoSelectedId]),
        }));
        setGeoSelectedId(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.size > 0) {
        e.preventDefault();
        commitPageMutation((page) => ({
          ...page,
          strokes: page.strokes.filter((s) => !selectedIds.has(s.id)),
          shapes: page.shapes.filter((s) => !selectedIds.has(s.id)),
          solids3d: page.solids3d.filter((s) => !selectedIds.has(s.id)),
          graphs: page.graphs.filter((g) => !selectedIds.has(g.id)),
          variationTables: (page.variationTables ?? []).filter((t) => !selectedIds.has(t.id)),
          stamps: (page.stamps ?? []).filter((st) => !selectedIds.has(st.id)),
          geoObjects: removeGeoObjectsWithCascade(page.geoObjects, selectedIds),
          texts: page.texts.filter((t) => !selectedIds.has(t.id)),
          images: page.images.filter((im) => !selectedIds.has(im.id)),
        }));
        setSelectedIds(new Set());
        setGeoSelectedId(null);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpaceHeld(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [
    activeNotebook.activePageIndex,
    activeNotebook.pages.length,
    activeTool,
    clampZoom,
    commitPageMutation,
    geoPendingCurveId,
    geoPendingPts.length,
    geoSelectedId,
    geoTool,
    isTeachMode,
    redo,
    selectPage,
    selectedIds,
    undo,
  ]);

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
      const stamps = activePage.stamps ?? [];
      for (let i = stamps.length - 1; i >= 0; i -= 1) {
        if (doesStampHitPoint(stamps[i]!, pt.x, pt.y)) {
          return stamps[i]!.id;
        }
      }
      for (let i = activePage.solids3d.length - 1; i >= 0; i -= 1) {
        const s = activePage.solids3d[i]!;
        if (pt.x >= s.x && pt.x <= s.x + s.width && pt.y >= s.y && pt.y <= s.y + s.height) {
          return s.id;
        }
      }
      const variationTables = activePage.variationTables ?? [];
      for (let i = variationTables.length - 1; i >= 0; i -= 1) {
        const vt = variationTables[i]!;
        if (pt.x >= vt.x && pt.x <= vt.x + vt.width && pt.y >= vt.y && pt.y <= vt.y + vt.height) {
          return vt.id;
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
      if (activePage.geoObjects && activePage.geoObjects.length > 0) {
        const gScene = evaluateGeoScene(activePage.geoObjects);
        const gHit = hitTestGeoScene(gScene, pt.x, pt.y, {
          includePolygons: true,
          pointRadius: 16,
          curveRadius: 13,
        });
        if (
          gHit &&
          (gHit.kind === 'point' ||
            gHit.kind === 'line' ||
            gHit.kind === 'conic' ||
            gHit.kind === 'polygon')
        ) {
          return gHit.id;
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
        const origGeo = page.geoObjects ?? [];
        let nextGeo = origGeo;
        if (origGeo.length > 0) {
          const gScene = evaluateGeoScene(origGeo);
          const gHit = hitTestGeoScene(gScene, pt.x, pt.y, {
            includePolygons: true,
            pointRadius: Math.max(16, r + 4),
            curveRadius: Math.max(13, r + 2),
          });
          if (
            gHit &&
            (gHit.kind === 'point' ||
              gHit.kind === 'line' ||
              gHit.kind === 'conic' ||
              gHit.kind === 'polygon')
          ) {
            nextGeo = removeGeoObjectsWithCascade(origGeo, [gHit.id]);
          }
        }

        if (eraserMode === 'stroke') {
          const nextStrokes = page.strokes.filter((st) => !doesCircleHitStroke(st, pt.x, pt.y, r));
          const nextShapes = page.shapes.filter((sh) => !doesShapeHitPoint(sh, pt.x, pt.y, r));
          const nextSolids = page.solids3d.filter(
            (s) => !(pt.x >= s.x && pt.x <= s.x + s.width && pt.y >= s.y && pt.y <= s.y + s.height),
          );
          const nextGraphs = page.graphs.filter(
            (g) => !(pt.x >= g.x && pt.x <= g.x + g.width && pt.y >= g.y && pt.y <= g.y + g.height),
          );
          const origTables = page.variationTables ?? [];
          const nextTables = origTables.filter(
            (t) => !(pt.x >= t.x && pt.x <= t.x + t.width && pt.y >= t.y && pt.y <= t.y + t.height),
          );
          const origStamps = page.stamps ?? [];
          const nextStamps = origStamps.filter((st) => !doesStampHitPoint(st, pt.x, pt.y));
          const nextTexts = page.texts.filter(
            (t) => !(pt.x >= t.x - 10 && pt.x <= t.x + 180 && pt.y >= t.y - 24 && pt.y <= t.y + 24),
          );
          if (
            nextStrokes.length === page.strokes.length &&
            nextShapes.length === page.shapes.length &&
            nextSolids.length === page.solids3d.length &&
            nextGraphs.length === page.graphs.length &&
            nextTables.length === origTables.length &&
            nextStamps.length === origStamps.length &&
            nextGeo.length === origGeo.length &&
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
            variationTables: nextTables,
            stamps: nextStamps,
            geoObjects: nextGeo,
            texts: nextTexts,
          };
        }

        // Tẩy từng đoạn nét (Segment Eraser) + xóa luôn điểm/đường dựng hình nếu chạm phải
        let changed = nextGeo.length !== origGeo.length;
        const nextStrokes: InkStroke[] = [];
        for (const st of page.strokes) {
          const parts = eraseStrokeSegment(st, pt.x, pt.y, r);
          if (parts.length !== 1 || parts[0] !== st) changed = true;
          nextStrokes.push(...parts);
        }
        if (!changed) return page;
        return { ...page, strokes: nextStrokes, geoObjects: nextGeo };
      });
    },
    [commitPageMutation, eraserMode],
  );

  // ============================================================================
  // ĐỘNG CƠ TƯƠNG TÁC DỰNG HÌNH ĐỘNG KIỂU GEOGEBRA TRỰC TIẾP TRÊN TRANG GIẤY
  // ============================================================================
  const geoObjects = useMemo(() => activePage.geoObjects ?? [], [activePage.geoObjects]);
  const geoScene = useMemo(() => evaluateGeoScene(geoObjects), [geoObjects]);
  const selectedGeoObject = useMemo(
    () => (geoSelectedId ? (geoObjects.find((o) => o.id === geoSelectedId) ?? null) : null),
    [geoObjects, geoSelectedId],
  );

  const geoStepHint = useMemo(() => {
    const pCount = geoPendingPts.length;
    if (geoTool === 'move')
      return 'Kéo điểm động HOẶC nắm kéo nguyên đoạn thẳng AB, đường tròn, đa giác cùng lúc';
    if (geoTool === 'eraser') return 'Chạm hoặc rê qua bất kỳ điểm / đường / hình nào để xóa ngay';
    if (geoTool === 'point-free')
      return 'Chạm bất kỳ đâu trên trang giấy để đặt Điểm tự do (A, B, C...)';
    if (geoTool === 'point-on-object')
      return 'Rê dọc đoạn thẳng hoặc đường tròn (tự hiển thị tỉ số k) rồi bấm để gắn điểm trượt';
    if (geoTool === 'midpoint')
      return pCount === 0
        ? 'Chạm thẳng 1 đoạn thẳng (1 chạm) hoặc chọn lần lượt 2 điểm để dựng Trung điểm'
        : 'Chọn điểm thứ hai để dựng Trung điểm';
    if (geoTool === 'centroid')
      return `Chọn đủ 3 điểm bất kỳ để dựng Trọng tâm G (đã chọn ${pCount}/3)`;
    if (geoTool === 'intersect')
      return geoPendingCurveId
        ? 'Chọn đường / đường tròn thứ hai để lấy Giao điểm'
        : 'Chạm trực tiếp vào chỗ giao nhau của 2 đường / đường tròn (hoặc chọn lần lượt 2 đường)';
    if (geoTool === 'segment' || geoTool === 'line' || geoTool === 'ray' || geoTool === 'vector') {
      return pCount === 0
        ? 'Chạm điểm đầu (hoặc nhấn-kéo-thả liền mạch tới điểm cuối)'
        : 'Chạm điểm thứ hai để hoàn tất đường';
    }
    if (geoTool === 'altitude' || geoTool === 'perpendicular' || geoTool === 'parallel') {
      if (pCount > 0) return 'Bấm vào 1 đoạn thẳng hoặc đường thẳng làm phương chuẩn';
      if (geoPendingCurveId) return 'Bấm vào 1 điểm mà đường đi qua';
      if (geoTool === 'altitude') {
        return 'Chọn 1 điểm và 1 cạnh để hạ Đoạn thẳng vuông góc (Đường cao AH ⊥ cạnh)';
      }
      return geoTool === 'perpendicular'
        ? 'Chọn 1 điểm và 1 đường thẳng để dựng Đường thẳng vuông góc vô hạn ⊥'
        : 'Chọn 1 điểm và 1 đường thẳng để dựng Đường song song';
    }
    if (geoTool === 'perp-bisector')
      return pCount === 0
        ? 'Chạm 1 đoạn thẳng hoặc chọn 2 điểm để dựng Đường trung trực'
        : 'Chọn điểm thứ hai để dựng Đường trung trực';
    if (geoTool === 'angle-bisector')
      return `Chọn 3 điểm A, B, C theo thứ tự với B là đỉnh góc (đã chọn ${pCount}/3)`;
    if (geoTool === 'tangent') {
      if (pCount > 0) return 'Bấm vào đường tròn để dựng các tiếp tuyến đi qua điểm vừa chọn';
      if (geoPendingCurveId) return 'Bấm vào 1 điểm để kẻ tiếp tuyến tới đường tròn';
      return 'Chọn 1 điểm và 1 đường tròn để dựng Tiếp tuyến';
    }
    if (geoTool === 'polygon')
      return pCount < 3
        ? `Chạm lần lượt các đỉnh của đa giác / mặt phẳng (đã chọn ${pCount})`
        : 'Chạm thêm đỉnh hoặc bấm nút Khép kín / chạm đỉnh đầu tiên để tô mặt phẳng';
    if (geoTool === 'circle-center-point')
      return pCount === 0
        ? 'Chọn tâm O (hoặc nhấn-kéo-thả từ tâm O ra điểm trên đường tròn)'
        : 'Chọn 1 điểm đi qua trên đường tròn';
    if (geoTool === 'circle-3pts')
      return `Chọn 3 điểm bất kỳ để dựng đường tròn ngoại tiếp (đã chọn ${pCount}/3)`;
    if (geoTool === 'ellipse')
      return pCount === 0
        ? 'Chọn tâm O của hình Elip'
        : pCount === 1
          ? 'Chọn đỉnh bán trục lớn A'
          : 'Chọn điểm xác định độ rộng bán trục nhỏ B';
    return 'Chọn công cụ dựng hình trên thanh GeoGebra';
  }, [geoPendingCurveId, geoPendingPts.length, geoTool]);

  const appendGeoObjects = useCallback(
    (items: readonly GeoObject[]) => {
      if (items.length === 0) return;
      commitPageMutation((page) => ({
        ...page,
        geoObjects: [...(page.geoObjects ?? []), ...items],
      }));
    },
    [commitPageMutation],
  );

  const updateGeoObject = useCallback(
    (id: string, patch: Partial<GeoObject>) => {
      commitPageMutation((page) => ({
        ...page,
        geoObjects: (page.geoObjects ?? []).map((obj) =>
          obj.id === id ? ({ ...obj, ...patch } as GeoObject) : obj,
        ),
      }));
    },
    [commitPageMutation],
  );

  const deleteGeoObject = useCallback(
    (id: string) => {
      commitPageMutation((page) => ({
        ...page,
        geoObjects: removeGeoObjectsWithCascade(page.geoObjects, [id]),
      }));
      setGeoSelectedId((prev) => (prev === id ? null : prev));
    },
    [commitPageMutation],
  );

  const closePendingGeoPolygon = useCallback(() => {
    if (geoPendingPts.length < 3) return;
    const curObjects = activePage.geoObjects ?? [];
    const polyId = makeLocalId('gpoly');
    const createdEdges: GeoObject[] = [];
    for (let i = 0; i < geoPendingPts.length; i += 1) {
      const p1Id = geoPendingPts[i]!;
      const p2Id = geoPendingPts[(i + 1) % geoPendingPts.length]!;
      const alreadyHasEdge = curObjects.some(
        (o) =>
          o.kind === 'geo-line' &&
          o.lineMode === 'segment' &&
          ((o.p1Id === p1Id && o.p2Id === p2Id) || (o.p1Id === p2Id && o.p2Id === p1Id)),
      );
      if (!alreadyHasEdge) {
        createdEdges.push({
          id: makeLocalId('gl'),
          kind: 'geo-line',
          lineMode: 'segment',
          p1Id,
          p2Id,
          style: geoLineStyle,
          color: geoColor,
          width: 2.1,
        });
      }
    }
    appendGeoObjects([
      ...createdEdges,
      {
        id: polyId,
        kind: 'geo-polygon',
        pointIds: geoPendingPts,
        color: geoColor,
        fillOpacity: 0.16,
        borderStyle: geoLineStyle,
        width: 2.1,
      },
    ]);
    setGeoPendingPts([]);
    setGeoSelectedId(polyId);
  }, [activePage.geoObjects, appendGeoObjects, geoColor, geoLineStyle, geoPendingPts]);

  const handleGeoPointerDown = (rawPt: InkPoint) => {
    const curObjects = activePage.geoObjects ?? [];
    const curScene = evaluateGeoScene(curObjects);
    const hit = hitTestGeoScene(curScene, rawPt.x, rawPt.y, {
      preferIntersection: geoTool === 'intersect',
      skipPoints: geoTool === 'point-on-object',
      includePolygons: geoTool === 'move' || geoTool === 'eraser',
    });

    // 0. Công cụ Xóa nhanh ngay trong thanh Dựng hình (chạm hoặc kéo qua là xóa)
    if (geoTool === 'eraser') {
      geoDragStateRef.current = { mode: 'erase' };
      if (
        hit &&
        (hit.kind === 'point' ||
          hit.kind === 'line' ||
          hit.kind === 'conic' ||
          hit.kind === 'polygon')
      ) {
        deleteGeoObject(hit.id);
      }
      return;
    }

    // 1. Công cụ Di chuyển & Kéo nguyên đoạn thẳng AB / Đường tròn / Đa giác cùng lúc
    if (geoTool === 'move') {
      if (hit?.kind === 'point') {
        setGeoSelectedId(hit.id);
        const ptObj = curObjects.find((o) => o.id === hit.id);
        if (
          ptObj?.kind === 'geo-point' &&
          (ptObj.pointMode === 'free' ||
            ptObj.pointMode === 'on-segment' ||
            ptObj.pointMode === 'on-circle')
        ) {
          geoDragStateRef.current = { mode: 'single-point', id: hit.id };
        } else {
          // Kéo trung điểm M hoặc trọng tâm G sẽ tịnh tiến đồng thời toàn bộ đoạn / tam giác gốc!
          geoDragStateRef.current = {
            mode: 'rigid-group',
            targetId: hit.id,
            lastX: rawPt.x,
            lastY: rawPt.y,
          };
        }
        return;
      }
      if (hit?.kind === 'line' || hit?.kind === 'conic' || hit?.kind === 'polygon') {
        setGeoSelectedId(hit.id);
        geoDragStateRef.current = {
          mode: 'rigid-group',
          targetId: hit.id,
          lastX: rawPt.x,
          lastY: rawPt.y,
        };
        return;
      }
      setGeoSelectedId(null);
      return;
    }

    // Helper: lấy ID điểm đang trúng hoặc tự tạo nhanh 1 điểm tự do mới tại vị trí chạm (giống GeoGebra!)
    const ensurePointAtCursor = (
      extraPendingObjects: GeoObject[],
      preferredLabels?: readonly string[],
    ): string => {
      if (hit?.kind === 'point') return hit.id;
      const allSoFar = [...curObjects, ...extraPendingObjects];
      const ptId = makeLocalId('gp');
      const newPt: GeoObject = {
        id: ptId,
        kind: 'geo-point',
        pointMode: 'free',
        x: Math.round(rawPt.x),
        y: Math.round(rawPt.y),
        label: nextGeoPointLabel(allSoFar, preferredLabels),
        color: geoColor,
      };
      extraPendingObjects.push(newPt);
      return ptId;
    };

    // 2. Đặt điểm tự do
    if (geoTool === 'point-free') {
      const label = nextGeoPointLabel(curObjects);
      const id = makeLocalId('gp');
      appendGeoObjects([
        {
          id,
          kind: 'geo-point',
          pointMode: 'free',
          x: Math.round(rawPt.x),
          y: Math.round(rawPt.y),
          label,
          color: geoColor,
        },
      ]);
      setGeoSelectedId(id);
      return;
    }

    // 3. Điểm trượt trên cạnh (tỉ số k linh hoạt mọi giá trị) hoặc trên đường tròn
    if (geoTool === 'point-on-object') {
      if (hit?.kind === 'line') {
        const label = nextGeoPointLabel(curObjects, ['M', 'N', 'P', 'Q', 'E', 'F']);
        const id = makeLocalId('gp');
        appendGeoObjects([
          {
            id,
            kind: 'geo-point',
            pointMode: 'on-segment',
            targetId: hit.id,
            t: hit.snappedT,
            label,
            color: geoColor,
          },
        ]);
        setGeoSelectedId(id);
      } else if (hit?.kind === 'conic') {
        const label = nextGeoPointLabel(curObjects, ['M', 'N', 'P', 'Q']);
        const id = makeLocalId('gp');
        appendGeoObjects([
          {
            id,
            kind: 'geo-point',
            pointMode: 'on-circle',
            targetId: hit.id,
            angleRad: hit.angleRad,
            label,
            color: geoColor,
          },
        ]);
        setGeoSelectedId(id);
      }
      return;
    }

    // 4. Trung điểm / Tâm (chạm thẳng 1 đoạn thẳng 1 phát HOẶC chạm 2 điểm)
    if (geoTool === 'midpoint') {
      if (geoPendingPts.length === 0 && hit?.kind === 'line') {
        const lineObj = curObjects.find((o) => o.id === hit.id);
        if (
          lineObj?.kind === 'geo-line' &&
          (lineObj.lineMode === 'segment' ||
            lineObj.lineMode === 'line' ||
            lineObj.lineMode === 'ray' ||
            lineObj.lineMode === 'vector')
        ) {
          const label = nextGeoPointLabel(curObjects, ['M', 'N', 'I', 'K', 'P']);
          appendGeoObjects([
            {
              id: makeLocalId('gp'),
              kind: 'geo-point',
              pointMode: 'midpoint',
              p1Id: lineObj.p1Id,
              p2Id: lineObj.p2Id,
              label,
              color: geoColor,
            },
          ]);
          return;
        }
      }
      const created: GeoObject[] = [];
      const pid = ensurePointAtCursor(created);
      if (geoPendingPts.length === 0) {
        appendGeoObjects(created);
        setGeoPendingPts([pid]);
      } else if (geoPendingPts[0] !== pid) {
        const label = nextGeoPointLabel([...curObjects, ...created], ['M', 'N', 'I', 'K', 'P']);
        created.push({
          id: makeLocalId('gp'),
          kind: 'geo-point',
          pointMode: 'midpoint',
          p1Id: geoPendingPts[0]!,
          p2Id: pid,
          label,
          color: geoColor,
        });
        appendGeoObjects(created);
        setGeoPendingPts([]);
      }
      return;
    }

    // 5. Trọng tâm tam giác (3 điểm bất kỳ, tự kẻ trung tuyến nét đứt)
    if (geoTool === 'centroid') {
      const created: GeoObject[] = [];
      const pid = ensurePointAtCursor(created);
      if (geoPendingPts.includes(pid)) return;
      const nextPending = [...geoPendingPts, pid];
      if (nextPending.length < 3) {
        appendGeoObjects(created);
        setGeoPendingPts(nextPending);
      } else {
        const label = nextGeoPointLabel([...curObjects, ...created], ['G', 'G₁', 'O']);
        created.push({
          id: makeLocalId('gp'),
          kind: 'geo-point',
          pointMode: 'centroid',
          pointIds: nextPending,
          showMedians: true,
          label,
          color: geoColor,
        });
        appendGeoObjects(created);
        setGeoPendingPts([]);
      }
      return;
    }

    // 6. Giao điểm của 2 đường / đường tròn (1 chạm tự bắt giao điểm hoặc chọn lần lượt 2 đường)
    if (geoTool === 'intersect') {
      if (hit?.kind === 'intersection-snap') {
        const label = nextGeoPointLabel(curObjects, ['I', 'J', 'K', 'E', 'F']);
        appendGeoObjects([
          {
            id: makeLocalId('gp'),
            kind: 'geo-point',
            pointMode: 'intersection',
            obj1Id: hit.obj1Id,
            obj2Id: hit.obj2Id,
            branch: hit.branch,
            label,
            color: geoColor,
          },
        ]);
        setGeoPendingCurveId(null);
        return;
      }
      if (hit?.kind === 'line' || hit?.kind === 'conic') {
        if (!geoPendingCurveId) {
          setGeoPendingCurveId(hit.id);
        } else if (geoPendingCurveId !== hit.id) {
          const label = nextGeoPointLabel(curObjects, ['I', 'J', 'K', 'E', 'F']);
          appendGeoObjects([
            {
              id: makeLocalId('gp'),
              kind: 'geo-point',
              pointMode: 'intersection',
              obj1Id: geoPendingCurveId,
              obj2Id: hit.id,
              branch: 0,
              label,
              color: geoColor,
            },
          ]);
          setGeoPendingCurveId(null);
        }
      }
      return;
    }

    // 7. Đoạn thẳng / Đường thẳng / Tia / Vectơ / Đường trung trực
    if (
      geoTool === 'segment' ||
      geoTool === 'line' ||
      geoTool === 'ray' ||
      geoTool === 'vector' ||
      geoTool === 'perp-bisector'
    ) {
      if (geoTool === 'perp-bisector' && geoPendingPts.length === 0 && hit?.kind === 'line') {
        const lineObj = curObjects.find((o) => o.id === hit.id);
        if (
          lineObj?.kind === 'geo-line' &&
          (lineObj.lineMode === 'segment' ||
            lineObj.lineMode === 'line' ||
            lineObj.lineMode === 'ray' ||
            lineObj.lineMode === 'vector')
        ) {
          appendGeoObjects([
            {
              id: makeLocalId('gl'),
              kind: 'geo-line',
              lineMode: 'perp-bisector',
              p1Id: lineObj.p1Id,
              p2Id: lineObj.p2Id,
              style: geoLineStyle,
              color: geoColor,
              width: 2,
            },
          ]);
          return;
        }
      }

      const created: GeoObject[] = [];
      const pid = ensurePointAtCursor(created);
      if (geoPendingPts.length === 0) {
        appendGeoObjects(created);
        setGeoPendingPts([pid]);
        geoPressStartRef.current = { ptId: pid, x: rawPt.x, y: rawPt.y };
      } else if (geoPendingPts[0] !== pid) {
        created.push({
          id: makeLocalId('gl'),
          kind: 'geo-line',
          lineMode: geoTool,
          p1Id: geoPendingPts[0]!,
          p2Id: pid,
          style: geoLineStyle,
          color: geoColor,
          width: 2.2,
        });
        appendGeoObjects(created);
        setGeoPendingPts([]);
        geoPressStartRef.current = null;
      }
      return;
    }

    // 8. Đoạn vuông góc (Đường cao AH) · Đường thẳng vuông góc vô hạn · Đường song song
    if (geoTool === 'altitude' || geoTool === 'perpendicular' || geoTool === 'parallel') {
      const needsFootPoint = geoTool === 'altitude' || geoTool === 'perpendicular';
      if (hit?.kind === 'line') {
        if (geoPendingPts.length > 0) {
          const throughPtId = geoPendingPts[0]!;
          const newObjs: GeoObject[] = [
            {
              id: makeLocalId('gl'),
              kind: 'geo-line',
              lineMode: geoTool,
              throughPointId: throughPtId,
              refLineId: hit.id,
              style: geoLineStyle,
              color: geoColor,
              width: 2.1,
            },
          ];
          if (needsFootPoint) {
            newObjs.push({
              id: makeLocalId('gp'),
              kind: 'geo-point',
              pointMode: 'projection',
              sourcePointId: throughPtId,
              lineId: hit.id,
              label: nextGeoPointLabel(curObjects, ['H', 'K', 'H₁']),
              color: geoColor,
            });
          }
          appendGeoObjects(newObjs);
          setGeoPendingPts([]);
          setGeoPendingCurveId(null);
        } else {
          setGeoPendingCurveId(hit.id);
        }
        return;
      }

      const created: GeoObject[] = [];
      const pid = ensurePointAtCursor(created);
      if (geoPendingCurveId) {
        created.push({
          id: makeLocalId('gl'),
          kind: 'geo-line',
          lineMode: geoTool,
          throughPointId: pid,
          refLineId: geoPendingCurveId,
          style: geoLineStyle,
          color: geoColor,
          width: 2.1,
        });
        if (needsFootPoint) {
          created.push({
            id: makeLocalId('gp'),
            kind: 'geo-point',
            pointMode: 'projection',
            sourcePointId: pid,
            lineId: geoPendingCurveId,
            label: nextGeoPointLabel([...curObjects, ...created], ['H', 'K', 'H₁']),
            color: geoColor,
          });
        }
        appendGeoObjects(created);
        setGeoPendingPts([]);
        setGeoPendingCurveId(null);
      } else {
        appendGeoObjects(created);
        setGeoPendingPts([pid]);
      }
      return;
    }

    // 9. Phân giác góc (3 điểm A, B, C)
    if (geoTool === 'angle-bisector') {
      const created: GeoObject[] = [];
      const pid = ensurePointAtCursor(created);
      if (geoPendingPts.includes(pid)) return;
      const nextPending = [...geoPendingPts, pid];
      if (nextPending.length < 3) {
        appendGeoObjects(created);
        setGeoPendingPts(nextPending);
      } else {
        created.push({
          id: makeLocalId('gl'),
          kind: 'geo-line',
          lineMode: 'angle-bisector',
          p1Id: nextPending[0]!,
          vertexId: nextPending[1]!,
          p3Id: nextPending[2]!,
          style: geoLineStyle,
          color: geoColor,
          width: 2,
        });
        appendGeoObjects(created);
        setGeoPendingPts([]);
      }
      return;
    }

    // 10. Tiếp tuyến đường tròn (1 điểm + 1 đường tròn)
    if (geoTool === 'tangent') {
      if (hit?.kind === 'conic') {
        if (geoPendingPts.length > 0) {
          const throughPtId = geoPendingPts[0]!;
          appendGeoObjects([
            {
              id: makeLocalId('gl'),
              kind: 'geo-line',
              lineMode: 'tangent',
              throughPointId: throughPtId,
              circleId: hit.id,
              branch: 0,
              style: geoLineStyle,
              color: geoColor,
              width: 2,
            },
            {
              id: makeLocalId('gl'),
              kind: 'geo-line',
              lineMode: 'tangent',
              throughPointId: throughPtId,
              circleId: hit.id,
              branch: 1,
              style: geoLineStyle,
              color: geoColor,
              width: 2,
            },
          ]);
          setGeoPendingPts([]);
          setGeoPendingCurveId(null);
        } else {
          setGeoPendingCurveId(hit.id);
        }
        return;
      }
      const created: GeoObject[] = [];
      const pid = ensurePointAtCursor(created);
      if (geoPendingCurveId) {
        created.push(
          {
            id: makeLocalId('gl'),
            kind: 'geo-line',
            lineMode: 'tangent',
            throughPointId: pid,
            circleId: geoPendingCurveId,
            branch: 0,
            style: geoLineStyle,
            color: geoColor,
            width: 2,
          },
          {
            id: makeLocalId('gl'),
            kind: 'geo-line',
            lineMode: 'tangent',
            throughPointId: pid,
            circleId: geoPendingCurveId,
            branch: 1,
            style: geoLineStyle,
            color: geoColor,
            width: 2,
          },
        );
        appendGeoObjects(created);
        setGeoPendingPts([]);
        setGeoPendingCurveId(null);
      } else {
        appendGeoObjects(created);
        setGeoPendingPts([pid]);
      }
      return;
    }

    // 11. Đa giác / Mặt phẳng tô màu bán trong suốt (khép kín khi bấm lại đỉnh đầu tiên hoặc nút Khép kín)
    if (geoTool === 'polygon') {
      if (geoPendingPts.length >= 3 && hit?.kind === 'point' && hit.id === geoPendingPts[0]) {
        closePendingGeoPolygon();
        return;
      }
      const created: GeoObject[] = [];
      const pid = ensurePointAtCursor(created);
      if (geoPendingPts.includes(pid)) return;
      appendGeoObjects(created);
      setGeoPendingPts([...geoPendingPts, pid]);
      return;
    }

    // 12. Đường tròn (Tâm & Điểm — hỗ trợ cả chạm 2 lần hoặc nhấn-kéo-thả từ tâm O)
    if (geoTool === 'circle-center-point') {
      const created: GeoObject[] = [];
      const pid = ensurePointAtCursor(
        created,
        geoPendingPts.length === 0 ? ['O', 'I', 'O₁'] : undefined,
      );
      if (geoPendingPts.length === 0) {
        appendGeoObjects(created);
        setGeoPendingPts([pid]);
        geoPressStartRef.current = { ptId: pid, x: rawPt.x, y: rawPt.y };
      } else if (geoPendingPts[0] !== pid) {
        created.push({
          id: makeLocalId('gc'),
          kind: 'geo-conic',
          conicMode: 'circle-center-point',
          centerId: geoPendingPts[0]!,
          throughId: pid,
          style: geoLineStyle,
          color: geoColor,
          width: 2.1,
        });
        appendGeoObjects(created);
        setGeoPendingPts([]);
        geoPressStartRef.current = null;
      }
      return;
    }

    // 13. Đường tròn ngoại tiếp qua 3 điểm & Elip (Tâm + 2 trục)
    if (geoTool === 'circle-3pts' || geoTool === 'ellipse') {
      const created: GeoObject[] = [];
      const pid = ensurePointAtCursor(
        created,
        geoTool === 'ellipse' && geoPendingPts.length === 0 ? ['O', 'I'] : undefined,
      );
      if (geoPendingPts.includes(pid)) return;
      const nextPending = [...geoPendingPts, pid];
      if (nextPending.length < 3) {
        appendGeoObjects(created);
        setGeoPendingPts(nextPending);
      } else {
        created.push(
          geoTool === 'circle-3pts'
            ? {
                id: makeLocalId('gc'),
                kind: 'geo-conic',
                conicMode: 'circle-3pts',
                p1Id: nextPending[0]!,
                p2Id: nextPending[1]!,
                p3Id: nextPending[2]!,
                style: geoLineStyle,
                color: geoColor,
                width: 2.1,
              }
            : {
                id: makeLocalId('gc'),
                kind: 'geo-conic',
                conicMode: 'ellipse',
                centerId: nextPending[0]!,
                axis1Id: nextPending[1]!,
                axis2Id: nextPending[2]!,
                style: geoLineStyle,
                color: geoColor,
                width: 2.1,
              },
        );
        appendGeoObjects(created);
        setGeoPendingPts([]);
      }
    }
  };

  const handleGeoPointerMove = (rawPt: InkPoint) => {
    setGeoCursor({ x: rawPt.x, y: rawPt.y });

    const drag = geoDragStateRef.current;
    if (drag) {
      if (drag.mode === 'erase') {
        const hit = hitTestGeoScene(geoScene, rawPt.x, rawPt.y, { includePolygons: true });
        if (
          hit &&
          (hit.kind === 'point' ||
            hit.kind === 'line' ||
            hit.kind === 'conic' ||
            hit.kind === 'polygon')
        ) {
          deleteGeoObject(hit.id);
        }
        return;
      }

      if (drag.mode === 'rigid-group') {
        const dx = rawPt.x - drag.lastX;
        const dy = rawPt.y - drag.lastY;
        if (Math.hypot(dx, dy) < 0.8) return;
        drag.lastX = rawPt.x;
        drag.lastY = rawPt.y;
        commitPageMutation((page) => ({
          ...page,
          geoObjects: translateGeoObjectsByTargets(page.geoObjects, [drag.targetId], dx, dy),
        }));
        return;
      }

      if (drag.mode === 'single-point') {
        const dragId = drag.id;
        const ptObj = (activePage.geoObjects ?? []).find((o) => o.id === dragId);
        if (ptObj?.kind === 'geo-point') {
          if (ptObj.pointMode === 'free') {
            updateGeoObject(dragId, {
              x: Number(rawPt.x.toFixed(2)),
              y: Number(rawPt.y.toFixed(2)),
            });
          } else if (ptObj.pointMode === 'on-segment') {
            const line = geoScene.lines.get(ptObj.targetId);
            if (line) {
              const dx = line.p2.x - line.p1.x;
              const dy = line.p2.y - line.p1.y;
              const lenSq = dx * dx + dy * dy;
              if (lenSq > 4) {
                const rawT = ((rawPt.x - line.p1.x) * dx + (rawPt.y - line.p1.y) * dy) / lenSq;
                const clampedT = Math.max(0.02, Math.min(0.98, rawT));
                updateGeoObject(dragId, { t: Number(clampedT.toFixed(3)) });
              }
            }
          } else if (ptObj.pointMode === 'on-circle') {
            const conic = geoScene.conics.get(ptObj.targetId);
            if (conic) {
              const dx = rawPt.x - conic.cx;
              const dy = rawPt.y - conic.cy;
              const cosR = Math.cos(-conic.rotation);
              const sinR = Math.sin(-conic.rotation);
              const lx = dx * cosR - dy * sinR;
              const ly = dx * sinR + dy * cosR;
              const angleRad = Math.atan2(ly / Math.max(1, conic.ry), lx / Math.max(1, conic.rx));
              updateGeoObject(dragId, { angleRad });
            }
          }
        }
        return;
      }
    }

    const hit = hitTestGeoScene(geoScene, rawPt.x, rawPt.y, {
      preferIntersection: geoTool === 'intersect',
      skipPoints: geoTool === 'point-on-object',
      includePolygons: geoTool === 'move' || geoTool === 'eraser',
    });
    setGeoHoveredHit(hit);
  };

  const handleCanvasPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (openPopover) setOpenPopover(null);
    e.currentTarget.setPointerCapture?.(e.pointerId);

    // Kéo bàn tay (Pan) khi giữ phím Space, nhấn chuột giữa, hoặc chọn công cụ Kéo trang
    if (activeTool === 'pan' || isSpaceHeld || e.button === 1) {
      const vp = scrollViewportRef.current;
      interactionRef.current = {
        ...interactionRef.current,
        mode: 'pan-viewport',
        panStartClientX: e.clientX,
        panStartClientY: e.clientY,
        panStartScrollLeft: vp?.scrollLeft ?? 0,
        panStartScrollTop: vp?.scrollTop ?? 0,
      };
      return;
    }

    const rawPt = toCanvasPoint(e);

    // -1. Chế độ Dựng Hình Động GeoGebra trực tiếp trên trang giấy
    if (activeTool === 'geo') {
      handleGeoPointerDown(rawPt);
      return;
    }

    // 0. Bút Laser tự tan (lớp phủ không phá hủy, 1200ms, không lưu vào vở/Undo/export)
    if (activeTool === 'laser') {
      const now = performance.now();
      isLaserPointerActiveRef.current = true;
      laserPointerHeadRef.current = { x: rawPt.x, y: rawPt.y };
      laserTrailsRef.current.push({
        colorPreset: laserColorPreset,
        points: [{ x: rawPt.x, y: rawPt.y, createdAt: now }],
      });
      interactionRef.current = {
        ...interactionRef.current,
        mode: 'laser',
        startX: rawPt.x,
        startY: rawPt.y,
        lastX: rawPt.x,
        lastY: rawPt.y,
      };
      ensureLaserLoop();
      return;
    }

    // 0b. Con dấu ký hiệu Hình học phẳng (đóng dấu tức thì tại vị trí chạm)
    if (activeTool === 'stamp') {
      const needsLabel =
        stampConfig.kind === 'dot-point' ||
        stampConfig.kind === 'angle-arc-1' ||
        stampConfig.kind === 'angle-arc-2';
      addStamp({
        id: makeLocalId('stamp'),
        kind: stampConfig.kind,
        x: Math.round(rawPt.x),
        y: Math.round(rawPt.y),
        size: stampConfig.size,
        rotationDeg: stampConfig.rotationDeg,
        color: stampConfig.color,
        lineWidth: 2,
        label: needsLabel ? stampConfig.label : undefined,
      });
      return;
    }

    // 1. Công cụ chèn chữ / KaTeX
    if (activeTool === 'text') {
      setPendingTextBox({ x: rawPt.x, y: rawPt.y, text: '', isMath: true });
      return;
    }

    // 2. Công cụ Bút viết (hỗ trợ hút thẳng theo cạnh Thước kẻ & bộ ổn định nét Streamline!)
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
        streamline: activePenPreset.streamline ?? 0.58,
        points: [pt],
      };
      interactionRef.current = {
        ...interactionRef.current,
        mode: 'draw-stroke',
        startX: pt.x,
        startY: pt.y,
        lastX: pt.x,
        lastY: pt.y,
        lastTimeMs: performance.now(),
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

    // 5. Công cụ Chọn vùng / Con trỏ Di chuyển đa năng / Chèn khoảng trống (Page Spacer)
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

      // Cho phép nắm kéo trực tiếp Điểm (tự do / trượt trên cạnh / trên đường tròn), Đoạn thẳng, Đường tròn, Đa giác ngay ngoài chế độ Dựng hình!
      const curGeoObjects = activePage.geoObjects ?? [];
      if (curGeoObjects.length > 0) {
        const gHit = hitTestGeoScene(geoScene, rawPt.x, rawPt.y, {
          includePolygons: true,
          pointRadius: 16,
          curveRadius: 13,
        });
        if (
          gHit &&
          (gHit.kind === 'point' ||
            gHit.kind === 'line' ||
            gHit.kind === 'conic' ||
            gHit.kind === 'polygon') &&
          !(selectedIds.size > 1 && selectedIds.has(gHit.id))
        ) {
          setGeoSelectedId(gHit.id);
          setSelectedIds(new Set([gHit.id]));
          if (gHit.kind === 'point') {
            const ptObj = curGeoObjects.find((o) => o.id === gHit.id);
            if (
              ptObj?.kind === 'geo-point' &&
              (ptObj.pointMode === 'free' ||
                ptObj.pointMode === 'on-segment' ||
                ptObj.pointMode === 'on-circle')
            ) {
              geoDragStateRef.current = { mode: 'single-point', id: gHit.id };
            } else {
              geoDragStateRef.current = {
                mode: 'rigid-group',
                targetId: gHit.id,
                lastX: rawPt.x,
                lastY: rawPt.y,
              };
            }
          } else {
            geoDragStateRef.current = {
              mode: 'rigid-group',
              targetId: gHit.id,
              lastX: rawPt.x,
              lastY: rawPt.y,
            };
          }
          return;
        }
      }

      setGeoSelectedId(null);

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
    if (state.mode === 'pan-viewport') {
      const vp = scrollViewportRef.current;
      if (vp && state.panStartClientX !== undefined && state.panStartClientY !== undefined) {
        vp.scrollLeft = (state.panStartScrollLeft ?? 0) - (e.clientX - state.panStartClientX);
        vp.scrollTop = (state.panStartScrollTop ?? 0) - (e.clientY - state.panStartClientY);
      }
      return;
    }
    if (activeTool === 'geo' || geoDragStateRef.current) {
      handleGeoPointerMove(toCanvasPoint(e));
      return;
    }
    if (state.mode === 'none') {
      if (activeTool === 'select' && selectionMode !== 'spacer' && geoObjects.length > 0) {
        const hoverPt = toCanvasPoint(e);
        const hit = hitTestGeoScene(geoScene, hoverPt.x, hoverPt.y, {
          includePolygons: true,
          pointRadius: 16,
          curveRadius: 13,
        });
        setGeoHoveredHit(hit);
      }
      return;
    }
    const rawPt = toCanvasPoint(e);

    if (state.mode === 'laser') {
      laserPointerHeadRef.current = { x: rawPt.x, y: rawPt.y };
      const currentTrail = laserTrailsRef.current[laserTrailsRef.current.length - 1];
      if (currentTrail && Math.hypot(rawPt.x - state.lastX, rawPt.y - state.lastY) >= 1.5) {
        currentTrail.points.push({ x: rawPt.x, y: rawPt.y, createdAt: performance.now() });
        state.lastX = rawPt.x;
        state.lastY = rawPt.y;
      }
      ensureLaserLoop();
      return;
    }

    if (state.mode === 'draw-stroke' && state.strokeDraft) {
      const rawCandidate = ruler.visible
        ? (snapPointToRulerEdge(rawPt.x, rawPt.y, ruler) ?? rawPt)
        : rawPt;
      const nowMs = performance.now();
      const dtMs = Math.max(4, nowMs - (state.lastTimeMs || nowMs - 16));
      const prevPt = state.strokeDraft.points[state.strokeDraft.points.length - 1] ?? rawCandidate;
      const streamlineVal = ruler.visible ? 0 : (state.strokeDraft.streamline ?? 0.58);
      const pt =
        streamlineVal > 0.02
          ? stabilizeInkPoint(prevPt, rawCandidate, streamlineVal, dtMs)
          : rawCandidate;
      const dist = Math.hypot(pt.x - state.lastX, pt.y - state.lastY);
      if (dist < 1.15) return;
      state.lastX = pt.x;
      state.lastY = pt.y;
      state.lastTimeMs = nowMs;
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
    if (geoDragStateRef.current) {
      geoDragStateRef.current = null;
      return;
    }

    // Hỗ trợ nhấn-kéo-thả liền mạch để vẽ Đoạn thẳng / Đường thẳng / Tia / Vectơ / Đường tròn trong 1 lần kéo
    if (activeTool === 'geo' && geoPressStartRef.current && geoPendingPts.length === 1) {
      const press = geoPressStartRef.current;
      geoPressStartRef.current = null;
      const releasePt = toCanvasPoint(e);
      if (Math.hypot(releasePt.x - press.x, releasePt.y - press.y) >= 22) {
        const curObjects = activePage.geoObjects ?? [];
        const curScene = evaluateGeoScene(curObjects);
        const hit = hitTestGeoScene(curScene, releasePt.x, releasePt.y);
        const created: GeoObject[] = [];
        let endPid: string;
        if (hit?.kind === 'point' && hit.id !== press.ptId) {
          endPid = hit.id;
        } else {
          endPid = makeLocalId('gp');
          created.push({
            id: endPid,
            kind: 'geo-point',
            pointMode: 'free',
            x: Number(releasePt.x.toFixed(2)),
            y: Number(releasePt.y.toFixed(2)),
            label: nextGeoPointLabel(curObjects),
            color: geoColor,
          });
        }
        if (
          geoTool === 'segment' ||
          geoTool === 'line' ||
          geoTool === 'ray' ||
          geoTool === 'vector' ||
          geoTool === 'perp-bisector'
        ) {
          created.push({
            id: makeLocalId('gl'),
            kind: 'geo-line',
            lineMode: geoTool,
            p1Id: press.ptId,
            p2Id: endPid,
            style: geoLineStyle,
            color: geoColor,
            width: 2.2,
          });
          appendGeoObjects(created);
          setGeoPendingPts([]);
          return;
        }
        if (geoTool === 'circle-center-point') {
          created.push({
            id: makeLocalId('gc'),
            kind: 'geo-conic',
            conicMode: 'circle-center-point',
            centerId: press.ptId,
            throughId: endPid,
            style: geoLineStyle,
            color: geoColor,
            width: 2.1,
          });
          appendGeoObjects(created);
          setGeoPendingPts([]);
          return;
        }
      }
    }

    const state = interactionRef.current;
    if (state.mode === 'none') return;
    if (state.mode === 'pan-viewport') {
      interactionRef.current = {
        mode: 'none',
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        lastTimeMs: 0,
        strokeDraft: null,
        shapeDraft: null,
        lassoDraft: [],
      };
      return;
    }
    const rawPt = toCanvasPoint(e);

    if (state.mode === 'laser') {
      isLaserPointerActiveRef.current = false;
      laserPointerHeadRef.current = null;
      interactionRef.current = {
        mode: 'none',
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        lastTimeMs: 0,
        strokeDraft: null,
        shapeDraft: null,
        lassoDraft: [],
      };
      return;
    }
    if (state.mode === 'draw-stroke' && state.strokeDraft) {
      const endCandidate = ruler.visible
        ? (snapPointToRulerEdge(rawPt.x, rawPt.y, ruler) ?? rawPt)
        : rawPt;
      const draftPts = state.strokeDraft.points;
      const lastDraftPt = draftPts[draftPts.length - 1];
      const finalPoints =
        lastDraftPt &&
        Math.hypot(endCandidate.x - lastDraftPt.x, endCandidate.y - lastDraftPt.y) >= 1.4
          ? [
              ...draftPts,
              { ...endCandidate, pressure: Math.min(0.45, lastDraftPt.pressure ?? 0.45) },
            ]
          : draftPts;
      const finished: InkStroke = {
        ...state.strokeDraft,
        points: finalPoints,
      };
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
      for (const vt of activePage.variationTables ?? []) {
        const cx = vt.x + vt.width / 2;
        const cy = vt.y + vt.height / 2;
        if (cx >= rx1 && cx <= rx2 && cy >= ry1 && cy <= ry2) picked.add(vt.id);
      }
      for (const st of activePage.stamps ?? []) {
        if (st.x >= rx1 && st.x <= rx2 && st.y >= ry1 && st.y <= ry2) picked.add(st.id);
      }
      for (const t of activePage.texts) {
        if (t.x >= rx1 && t.x <= rx2 && t.y >= ry1 && t.y <= ry2) picked.add(t.id);
      }
      for (const im of activePage.images) {
        const cx = im.x + im.width / 2;
        const cy = im.y + im.height / 2;
        if (cx >= rx1 && cx <= rx2 && cy >= ry1 && cy <= ry2) picked.add(im.id);
      }
      if (activePage.geoObjects && activePage.geoObjects.length > 0) {
        const gScene = evaluateGeoScene(activePage.geoObjects);
        for (const [id, pt] of gScene.points.entries()) {
          if (pt.x >= rx1 && pt.x <= rx2 && pt.y >= ry1 && pt.y <= ry2) picked.add(id);
        }
        for (const [id, ln] of gScene.lines.entries()) {
          const mx = (ln.p1.x + ln.p2.x) / 2;
          const my = (ln.p1.y + ln.p2.y) / 2;
          if (
            (mx >= rx1 && mx <= rx2 && my >= ry1 && my <= ry2) ||
            (ln.p1.x >= rx1 && ln.p1.x <= rx2 && ln.p1.y >= ry1 && ln.p1.y <= ry2) ||
            (ln.p2.x >= rx1 && ln.p2.x <= rx2 && ln.p2.y >= ry1 && ln.p2.y <= ry2)
          ) {
            picked.add(id);
          }
        }
        for (const [id, cnObj] of gScene.conics.entries()) {
          if (cnObj.cx >= rx1 && cnObj.cx <= rx2 && cnObj.cy >= ry1 && cnObj.cy <= ry2) {
            picked.add(id);
          }
        }
        for (const [id, polyObj] of gScene.polygons.entries()) {
          if (polyObj.vertices.some((v) => v.x >= rx1 && v.x <= rx2 && v.y >= ry1 && v.y <= ry2)) {
            picked.add(id);
          }
        }
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
      for (const vt of activePage.variationTables ?? []) {
        if (isPointInPolygon(vt.x + vt.width / 2, vt.y + vt.height / 2, poly)) picked.add(vt.id);
      }
      for (const st of activePage.stamps ?? []) {
        if (isPointInPolygon(st.x, st.y, poly)) picked.add(st.id);
      }
      for (const t of activePage.texts) {
        if (isPointInPolygon(t.x, t.y, poly)) picked.add(t.id);
      }
      for (const im of activePage.images) {
        if (isPointInPolygon(im.x + im.width / 2, im.y + im.height / 2, poly)) picked.add(im.id);
      }
      if (activePage.geoObjects && activePage.geoObjects.length > 0) {
        const gScene = evaluateGeoScene(activePage.geoObjects);
        for (const [id, pt] of gScene.points.entries()) {
          if (isPointInPolygon(pt.x, pt.y, poly)) picked.add(id);
        }
        for (const [id, ln] of gScene.lines.entries()) {
          if (
            isPointInPolygon((ln.p1.x + ln.p2.x) / 2, (ln.p1.y + ln.p2.y) / 2, poly) ||
            isPointInPolygon(ln.p1.x, ln.p1.y, poly) ||
            isPointInPolygon(ln.p2.x, ln.p2.y, poly)
          ) {
            picked.add(id);
          }
        }
        for (const [id, cnObj] of gScene.conics.entries()) {
          if (isPointInPolygon(cnObj.cx, cnObj.cy, poly)) picked.add(id);
        }
        for (const [id, polyObj] of gScene.polygons.entries()) {
          if (polyObj.vertices.some((v) => isPointInPolygon(v.x, v.y, poly))) picked.add(id);
        }
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
      lastTimeMs: 0,
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

  const handleInsertVariationTable = (
    tableInput: Omit<InkVariationTableItem, 'id' | 'x' | 'y'>,
  ) => {
    const id = makeLocalId('vt');
    const offset = ((activePage.variationTables?.length ?? 0) % 4) * 26;
    addVariationTable({
      ...tableInput,
      id,
      x: Math.round(dims.width * 0.5 - tableInput.width / 2) + offset,
      y: 160 + offset,
    });
    setActiveTool('select');
    setSelectedIds(new Set([id]));
  };

  const handleUploadWorksheetImages = (files: FileList) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    const readOne = (file: File): Promise<InkWorksheetBackground | null> =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result !== 'string') {
            resolve(null);
            return;
          }
          resolve({
            id: makeLocalId('ws'),
            title: file.name.replace(/\.[^.]+$/, ''),
            dataUrl: reader.result,
            opacity: 0.92,
            fitMode: 'top-half',
            locked: true,
          });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });

    void Promise.all(imageFiles.map(readOne)).then((results) => {
      const valid = results.filter((w): w is InkWorksheetBackground => w !== null);
      if (valid.length === 0) return;
      if (valid.length === 1) {
        setWorksheetBackground(valid[0]!);
      } else {
        addPagesWithWorksheets(valid);
      }
    });
  };

  const handleImportActiveExamAsWorksheet = () => {
    const currentExam = useExamBuilderStore.getState();
    const activeExamDoc =
      currentExam.buckets[currentExam.activeAccountKey]?.exams.find(
        (ex) => ex.id === currentExam.buckets[currentExam.activeAccountKey]?.activeExamId,
      ) ?? null;
    if (!activeExamDoc) return;

    const dataUrl = renderExamTextToWorksheetDataUrl(activeExamDoc.title, activeExamDoc.rawMarkup);
    if (!dataUrl) return;
    setWorksheetBackground({
      id: makeLocalId('ws-exam'),
      title: activeExamDoc.title || 'Đề từ Xưởng Soạn Đề',
      dataUrl,
      opacity: 0.95,
      fitMode: 'top-half',
      locked: true,
    });
    setOpenPopover(null);
  };

  const renderActivePageExportDataUrl = useCallback((): string | null => {
    const scale = 1.5;
    const offscreen = document.createElement('canvas');
    offscreen.width = Math.round(dims.width * scale);
    offscreen.height = Math.round(dims.height * scale);
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) {
      return canvasRef.current ? canvasRef.current.toDataURL('image/png') : null;
    }
    offCtx.setTransform(scale, 0, 0, scale, 0, 0);
    renderInkPageToCanvas(offCtx, {
      width: dims.width,
      height: dims.height,
      paper: activeNotebook.paper,
      page: activePage,
      imageCache: imageCacheRef.current,
      skipScreenMathTexts: false,
    });
    return offscreen.toDataURL('image/png');
  }, [activeNotebook.paper, activePage, dims.height, dims.width]);

  const handleExportPng = () => {
    const dataUrl = renderActivePageExportDataUrl();
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${activeNotebook.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'bang-viet-toan'}-trang-${activeNotebook.activePageIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportNotebookPdf = async () => {
    if (isExportingPdf || activeNotebook.pages.length === 0) return;
    setIsExportingPdf(true);
    try {
      const loadImage = async (id: string, rawUrl: string): Promise<void> => {
        const existing = imageCacheRef.current.get(id);
        if (existing && existing.complete && existing.naturalWidth > 0) {
          return;
        }
        const resolvedUrl = await resolveMediaDataUrl(rawUrl);
        if (!resolvedUrl) return;
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            imageCacheRef.current.set(id, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = resolvedUrl;
        });
      };

      const isLandscape = activeNotebook.paper.orientation === 'landscape';
      const pageWidthPt = isLandscape ? 841.89 : 595.28;
      const pageHeightPt = isLandscape ? 595.28 : 841.89;
      const scale = 1.5;

      const offscreen = document.createElement('canvas');
      offscreen.width = Math.round(dims.width * scale);
      offscreen.height = Math.round(dims.height * scale);
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      const pdfPages = [];
      for (const pg of activeNotebook.pages) {
        const preloadTasks: Promise<void>[] = pg.images.map((im) => loadImage(im.id, im.dataUrl));
        if (pg.worksheetBackground) {
          preloadTasks.push(loadImage(pg.worksheetBackground.id, pg.worksheetBackground.dataUrl));
        }
        if (preloadTasks.length > 0) {
          await Promise.all(preloadTasks);
        }

        offCtx.setTransform(scale, 0, 0, scale, 0, 0);
        renderInkPageToCanvas(offCtx, {
          width: dims.width,
          height: dims.height,
          paper: activeNotebook.paper,
          page: pg,
          imageCache: imageCacheRef.current,
        });

        const jpegUrl = offscreen.toDataURL('image/jpeg', 0.92);
        pdfPages.push({
          jpegBytes: dataUrlToUint8Array(jpegUrl),
          pixelWidth: offscreen.width,
          pixelHeight: offscreen.height,
          pageWidthPt,
          pageHeightPt,
        });
      }

      const pdfBytes = buildMultiPagePdfBytes(pdfPages);
      const safeTitle =
        activeNotebook.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-') || 'vo-toan-hoc';
      downloadPdfFile(pdfBytes, `${safeTitle}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSendToExamBuilder = () => {
    const dataUrl = renderActivePageExportDataUrl();
    if (!dataUrl) return;
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

  const selectedTable = useMemo(() => {
    if (selectedIds.size !== 1) return null;
    const onlyId = Array.from(selectedIds)[0];
    return (activePage.variationTables ?? []).find((t) => t.id === onlyId) ?? null;
  }, [activePage.variationTables, selectedIds]);

  const editingTable = useMemo(() => {
    if (!editingTableId) return null;
    return (activePage.variationTables ?? []).find((t) => t.id === editingTableId) ?? null;
  }, [activePage.variationTables, editingTableId]);

  const selectedStamp = useMemo(() => {
    if (selectedIds.size !== 1) return null;
    const onlyId = Array.from(selectedIds)[0];
    return (activePage.stamps ?? []).find((st) => st.id === onlyId) ?? null;
  }, [activePage.stamps, selectedIds]);

  const selectedText = useMemo<InkTextItem | null>(() => {
    if (selectedIds.size !== 1) return null;
    const onlyId = Array.from(selectedIds)[0];
    return activePage.texts.find((t) => t.id === onlyId) ?? null;
  }, [activePage.texts, selectedIds]);

  const editingText = useMemo<InkTextItem | null>(() => {
    if (!editingTextId) return null;
    return activePage.texts.find((t) => t.id === editingTextId) ?? null;
  }, [activePage.texts, editingTextId]);

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

    const table = (activePage.variationTables ?? []).find((t) => t.id === onlyId);
    if (table) {
      return {
        kind: 'variation' as const,
        id: table.id,
        x: table.x,
        y: table.y,
        width: table.width,
        height: table.height,
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
  }, [
    activePage.graphs,
    activePage.images,
    activePage.shapes,
    activePage.solids3d,
    activePage.variationTables,
    selectedIds,
  ]);

  const handleRotateSelectedSolid = (deltaYaw: number) => {
    if (!selectedSolid) return;
    commitPageMutation((page) => ({
      ...page,
      solids3d: page.solids3d.map((s) =>
        s.id === selectedSolid.id ? { ...s, yaw: (s.yaw + deltaYaw + 360) % 360 } : s,
      ),
    }));
  };

  const handleRotateSelectedStamp = (deltaDeg: number) => {
    if (!selectedStamp) return;
    commitPageMutation((page) => ({
      ...page,
      stamps: (page.stamps ?? []).map((st) =>
        st.id === selectedStamp.id
          ? { ...st, rotationDeg: (st.rotationDeg + deltaDeg + 360) % 360 }
          : st,
      ),
    }));
  };

  const handleScaleSelectedStamp = (deltaSize: number) => {
    if (!selectedStamp) return;
    commitPageMutation((page) => ({
      ...page,
      stamps: (page.stamps ?? []).map((st) =>
        st.id === selectedStamp.id
          ? { ...st, size: Math.min(96, Math.max(18, st.size + deltaSize)) }
          : st,
      ),
    }));
  };

  const applyResizedBox = useCallback(
    (box: {
      readonly id: string;
      readonly kind: 'solid3d' | 'graph' | 'variation' | 'image' | 'shape';
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
        if (box.kind === 'variation') {
          return {
            ...page,
            variationTables: (page.variationTables ?? []).map((t) =>
              t.id === box.id
                ? {
                    ...t,
                    x: Math.round(box.x),
                    y: Math.round(box.y),
                    width: Math.round(box.width),
                    height: Math.round(box.height),
                  }
                : t,
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
          THANH CÔNG CỤ SCRBLE INK CẢI TIẾN HOẶC THANH TẬP GIẢNG & GHI HÌNH OFFLINE
          ======================================================================== */}
      {isTeachMode ? (
        <TeachStudioBar
          notebookTitle={activeNotebook.title}
          pageIndex={activeNotebook.activePageIndex}
          pageCount={activeNotebook.pages.length}
          pageWidth={dims.width}
          pageHeight={dims.height}
          activePage={activePage}
          mainCanvasRef={canvasRef}
          laserCanvasRef={laserCanvasRef}
          penPresets={penPresets}
          activePenPresetId={activePenPreset.id}
          activeTool={activeTool}
          canUndo={undoCount > 0}
          onSelectPen={(presetId) => {
            selectPenPreset(presetId);
            setActiveTool('pen');
          }}
          onSelectTool={(tool) => {
            setOpenPopover(null);
            setActiveTool(tool);
          }}
          onOpenFormulaPad={() => {
            setPendingTextBox({
              x: Math.round(dims.width * 0.24),
              y: 170,
              text: '',
              isMath: true,
            });
          }}
          onUndo={undo}
          onSelectPage={selectPage}
          onAddPage={addPage}
          onExitTeachMode={() => {
            setIsTeachMode(false);
            if (searchParams.get('mode') === 'teach') {
              const nextParams = new URLSearchParams(searchParams);
              nextParams.delete('mode');
              setSearchParams(nextParams, { replace: true });
            }
          }}
        />
      ) : (
        <header className="relative z-30 flex flex-col border-b border-[var(--border-hairline)] bg-[var(--bg-workspace)] shadow-2xs print:hidden">
          {/* ====================================================================
              TẦNG 1: THANH TÀI LIỆU, NỀN GIẤY & XUẤT BẢN (Cân đối Trái ↔ Phải)
              ==================================================================== */}
          <div
            data-testid="ink-document-bar"
            className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)]/70 px-3.5 py-1.5"
          >
            {/* TRÁI: Thư mục · Chọn/Đổi tên/Tạo vở | Giấy · Phiếu đề · Chèn ảnh */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowPagesSidebar((p) => !p)}
                title="Ẩn/hiện thư mục & danh sách trang"
                aria-label="Ẩn hoặc hiện thư mục và danh sách trang"
                className={cn(
                  'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors',
                  showPagesSidebar
                    ? 'border-[var(--accent-os)]/40 bg-[var(--bg-surface)] text-[var(--accent-os)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
                )}
              >
                <PanelLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              {isRenamingToolbarNb ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (toolbarNbTitleDraft.trim()) {
                      renameNotebook(activeNotebook.id, toolbarNbTitleDraft.trim());
                    }
                    setIsRenamingToolbarNb(false);
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    type="text"
                    autoFocus
                    data-testid="toolbar-rename-notebook-input"
                    value={toolbarNbTitleDraft}
                    onChange={(e) => setToolbarNbTitleDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setIsRenamingToolbarNb(false);
                    }}
                    onBlur={() => {
                      if (toolbarNbTitleDraft.trim()) {
                        renameNotebook(activeNotebook.id, toolbarNbTitleDraft.trim());
                      }
                      setIsRenamingToolbarNb(false);
                    }}
                    aria-label="Đổi tên file vở đang mở"
                    className="h-9 w-[180px] rounded-xl border border-[var(--accent-os)] bg-[var(--bg-workspace)] px-2.5 text-[13px] font-medium text-[var(--text-main)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    onMouseDown={(e) => e.preventDefault()}
                    title="Lưu tên vở"
                    aria-label="Lưu tên vở"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-[var(--accent-os)] text-white"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              ) : (
                <>
                  <select
                    aria-label="Chọn vở ghi chép"
                    value={activeNotebook.id}
                    onChange={(e) => selectNotebook(e.target.value)}
                    className="h-9 max-w-[190px] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-[13px] font-medium text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                  >
                    {bucket.notebooks.map((nb) => (
                      <option key={nb.id} value={nb.id}>
                        {nb.title}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    data-testid="toolbar-rename-notebook-btn"
                    onClick={() => {
                      setToolbarNbTitleDraft(activeNotebook.title);
                      setIsRenamingToolbarNb(true);
                    }}
                    title="Đổi tên file vở đang mở"
                    aria-label="Đổi tên file vở đang mở"
                    className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--accent-os)]"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => createNotebook(undefined, activeNotebook.folderId ?? null)}
                title="Tạo vở mới trong thư mục hiện tại"
                aria-label="Tạo vở ghi chép mới"
                className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--accent-os)]"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
              </button>

              <div className="mx-1 h-5 w-px bg-[var(--border-hairline)]" />

              {/* Nhóm Trang & Nền giấy: Giấy · Phiếu đề · Chèn ảnh */}
              <div ref={paperAnchorRef} className="relative">
                <button
                  type="button"
                  data-testid="ink-paper-btn"
                  onClick={() => togglePopover('paper')}
                  title="Kiểu giấy, ô ly, lề đỏ & hướng trang"
                  aria-label="Cài đặt giấy vở"
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 text-[13px] font-medium transition-colors',
                    openPopover === 'paper'
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Giấy</span>
                </button>
                {openPopover === 'paper' && (
                  <ToolbarPopoverAnchor anchorRef={paperAnchorRef} preferAlign="left">
                    <PaperSettingsPopover
                      paper={activeNotebook.paper}
                      onChange={updatePaperConfig}
                    />
                  </ToolbarPopoverAnchor>
                )}
              </div>

              <div ref={worksheetAnchorRef} className="relative">
                <button
                  type="button"
                  data-testid="ink-worksheet-btn"
                  onClick={() => togglePopover('worksheet')}
                  title="Gắn ảnh phiếu bài tập hoặc nạp đề từ Xưởng Soạn Đề làm nền khóa để giải trực tiếp"
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 text-[13px] font-medium transition-colors',
                    openPopover === 'worksheet' || activePage.worksheetBackground
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)]/12 text-[var(--accent-os)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  <FileImage className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Phiếu đề</span>
                </button>
                {openPopover === 'worksheet' && (
                  <ToolbarPopoverAnchor anchorRef={worksheetAnchorRef} preferAlign="left">
                    <WorksheetBackgroundPopover
                      background={activePage.worksheetBackground}
                      activeExamTitle={activeExamTitle}
                      onUploadImages={handleUploadWorksheetImages}
                      onImportActiveExam={handleImportActiveExamAsWorksheet}
                      onUpdateBackground={(patch) => {
                        if (!activePage.worksheetBackground) return;
                        setWorksheetBackground({ ...activePage.worksheetBackground, ...patch });
                      }}
                      onRemoveBackground={() => setWorksheetBackground(null)}
                      onClose={() => setOpenPopover(null)}
                    />
                  </ToolbarPopoverAnchor>
                )}
              </div>

              <button
                type="button"
                onClick={() => imageUploadRef.current?.click()}
                title="Chèn ảnh từ máy tính"
                aria-label="Chèn ảnh vào trang"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              >
                <ImagePlus className="h-4 w-4" aria-hidden="true" />
                <span className="hidden xl:inline">Chèn ảnh</span>
              </button>
            </div>

            {/* PHẢI: Tập giảng · Đưa vào Soạn đề · Xuất PNG / PDF · Toàn màn hình */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                data-testid="ink-teach-mode-btn"
                onClick={() => {
                  setOpenPopover(null);
                  setIsTeachMode(true);
                }}
                title="Bật Chế độ Tập giảng & Ghi hình bài giảng Offline (.webm) kèm Micro & bút Laser"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[#1B5E4A]/40 bg-[#F2F9F6] px-3 text-[13px] font-semibold text-[#1B5E4A] transition-colors hover:bg-[#E2F3EC] dark:border-[#52B394]/35 dark:bg-[#111F1A] dark:text-[#52B394]"
              >
                <Presentation className="h-4 w-4" aria-hidden="true" />
                <span className="hidden md:inline">Tập giảng</span>
              </button>

              <button
                type="button"
                data-testid="ink-send-to-exam"
                onClick={handleSendToExamBuilder}
                title="Xuất hình trang này và gắn trực tiếp vào đề đang soạn ở Xưởng Soạn Đề"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--accent-heritage)]/45 bg-[#FDF8F3] px-3 text-[13px] font-semibold text-[#8C5828] transition-colors hover:bg-[#F7ECE0] dark:bg-[#1D1813] dark:text-[#D4AF6A]"
              >
                {sentToExamNotice ? (
                  <>
                    <Check className="h-4 w-4" aria-hidden="true" />
                    <span>Đã gửi!</span>
                  </>
                ) : (
                  <>
                    <FilePenLine className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden lg:inline">Đưa vào Soạn đề</span>
                  </>
                )}
              </button>

              <div className="mx-0.5 h-5 w-px bg-[var(--border-hairline)]" />

              <button
                type="button"
                data-testid="ink-export-png"
                onClick={handleExportPng}
                title="Tải ảnh PNG độ nét cao của trang hiện tại"
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2.5 text-[13px] font-semibold text-[var(--text-main)] hover:border-[var(--accent-os)]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">PNG</span>
              </button>

              <button
                type="button"
                data-testid="ink-export-pdf"
                disabled={isExportingPdf}
                onClick={() => void handleExportNotebookPdf()}
                title={`Xuất toàn bộ ${activeNotebook.pages.length} trang vở thành 1 file PDF chuẩn A4`}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl bg-[#17332C] px-3 text-[13px] font-semibold text-white hover:bg-[#21463C] disabled:opacity-60"
              >
                <FileDown className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{isExportingPdf ? 'Đang xuất...' : 'PDF'}</span>
              </button>

              <button
                type="button"
                onClick={toggleFullscreen}
                title="Chế độ toàn màn hình"
                aria-label="Toàn màn hình"
                className="hidden h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)] md:inline-flex"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* ====================================================================
              TẦNG 2: THANH CÔNG CỤ VẼ & TOÁN HỌC (3 cụm chức năng tách bạch rõ ràng)
              Cụm 1: Undo/Redo + Bút + Tẩy/Chọn/Kéo/Laser
              Cụm 2: Nắn nét + Thước + Hình 2D + Con dấu
              Cụm 3: Công thức + Dựng hình + Hình 3D + Đồ thị f(x) + Bảng biến thiên
              ==================================================================== */}
          <div
            data-testid="ink-studio-dock"
            className="flex flex-wrap items-center justify-center gap-2 bg-[var(--bg-surface)]/55 px-3.5 py-1.5"
          >
            {/* CỤM 1: Hoàn tác · Màu bút · Tẩy · Chọn · Bàn tay · Laser (cụm thao tác tần suất cao nhất nằm sát nhau) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  data-testid="ink-undo-btn"
                  disabled={undoCount === 0}
                  onClick={undo}
                  title="Hoàn tác (Ctrl+Z)"
                  aria-label="Hoàn tác"
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-35"
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
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)] disabled:opacity-35"
                >
                  <Redo2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Khay chấm màu bút viết */}
              <div
                ref={penAnchorRef}
                className="relative flex h-9 items-center gap-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2"
              >
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
                          ? 'Nhấn lần nữa để chỉnh ngòi (Bút thường / Bút máy), bảng màu & cỡ nét'
                          : `Chọn ${
                              preset.penKind === 'highlighter'
                                ? 'dạ quang'
                                : preset.penKind === 'fountain'
                                  ? 'bút máy'
                                  : preset.penKind === 'pencil'
                                    ? 'bút chì'
                                    : 'bút thường'
                            }`
                      }
                      aria-label={`Chọn bút ${preset.id}`}
                      className={cn(
                        'flex cursor-pointer items-center justify-center rounded-full transition-transform',
                        isSelected
                          ? 'h-7 w-7 scale-105 ring-2 ring-[var(--accent-os)] ring-offset-1'
                          : 'h-6.5 w-6.5 hover:scale-110',
                      )}
                    >
                      <span
                        style={{
                          backgroundColor: preset.color,
                          opacity: isHighlighter ? 0.65 : 1,
                        }}
                        className={cn(
                          'rounded-full border border-black/15',
                          isHighlighter ? 'h-4.5 w-4.5' : isSelected ? 'h-4 w-4' : 'h-3.5 w-3.5',
                        )}
                      />
                    </button>
                  );
                })}

                {openPopover === 'pen' && (
                  <ToolbarPopoverAnchor anchorRef={penAnchorRef} preferAlign="left">
                    <PenSettingsPopover preset={activePenPreset} onChange={updateActivePenPreset} />
                  </ToolbarPopoverAnchor>
                )}
              </div>

              {/* Tẩy · Chọn · Bàn tay · Laser nằm ngay kế bên bút để thao tác chuột cực ngắn */}
              <div ref={eraserAnchorRef} className="relative">
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
                  title="Tẩy nét viết & xóa trực tiếp Điểm/Đường Dựng hình (nhấn lần 2 để chọn kiểu tẩy)"
                  aria-label="Công cụ tẩy"
                  className={cn(
                    'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors',
                    activeTool === 'eraser' || openPopover === 'eraser'
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  <Eraser className="h-4 w-4" aria-hidden="true" />
                </button>
                {openPopover === 'eraser' && (
                  <ToolbarPopoverAnchor anchorRef={eraserAnchorRef} preferAlign="left">
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
                  </ToolbarPopoverAnchor>
                )}
              </div>

              <div ref={selectionAnchorRef} className="relative">
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
                  title="Con trỏ Chọn & Di chuyển (V) — kéo trực tiếp Điểm, Đoạn thẳng, Hình hoặc khoanh vùng"
                  aria-label="Công cụ chọn và di chuyển"
                  className={cn(
                    'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors',
                    activeTool === 'select' || openPopover === 'selection'
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  <MousePointer2 className="h-4 w-4" aria-hidden="true" />
                </button>
                {openPopover === 'selection' && (
                  <ToolbarPopoverAnchor anchorRef={selectionAnchorRef} preferAlign="left">
                    <SelectionModePopover
                      mode={selectionMode}
                      onChange={(m) => {
                        setSelectionMode(m);
                        setActiveTool('select');
                        setOpenPopover(null);
                      }}
                    />
                  </ToolbarPopoverAnchor>
                )}
              </div>

              <button
                type="button"
                data-testid="ink-pan-btn"
                onClick={() => {
                  setOpenPopover(null);
                  setActiveTool((prev) => (prev === 'pan' ? 'pen' : 'pan'));
                }}
                aria-pressed={activeTool === 'pan'}
                title="Bàn tay kéo trượt trang giấy (hoặc giữ phím Space + kéo chuột bất kỳ lúc nào)"
                aria-label="Công cụ bàn tay kéo trang"
                className={cn(
                  'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors',
                  activeTool === 'pan' || isSpaceHeld
                    ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                )}
              >
                <Hand className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                data-testid="ink-laser-btn"
                onClick={() => {
                  setOpenPopover(null);
                  setActiveTool((prev) => (prev === 'laser' ? 'pen' : 'laser'));
                }}
                title="Bút Laser tự tan (Phím tắt: L — tự mờ sau 1.2 giây, không lưu vào vở)"
                aria-pressed={activeTool === 'laser'}
                aria-label="Bút Laser tự tan (Phím tắt L)"
                className={cn(
                  'inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2.5 text-[13px] font-medium transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-[1px] active:scale-[0.98]',
                  activeTool === 'laser'
                    ? 'border-[#FF4D4F] bg-[#FF4D4F] text-white shadow-xs dark:border-[#FF6B6B] dark:bg-[#FF6B6B] dark:text-[#111A18]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:border-[#FF4D4F]/50 hover:text-[#FF4D4F] dark:hover:border-[#FF6B6B]/55 dark:hover:text-[#FF6B6B]',
                )}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                >
                  <circle cx="18" cy="6" r="2.2" fill="currentColor" />
                  <path
                    d="M18 1.75V3M22.25 6H21M20.85 3.15L19.95 4.05M20.85 8.85L19.95 7.95"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                  <path
                    d="M15.2 8.8L4.2 19.8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M10.8 13.2L8.4 10.8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeOpacity="0.65"
                  />
                </svg>
                <span className="hidden sm:inline">Laser</span>
                <kbd
                  aria-hidden="true"
                  className={cn(
                    'hidden rounded px-1 py-0.5 font-mono text-[10px] leading-none font-semibold xl:inline-block',
                    activeTool === 'laser'
                      ? 'bg-white/20 text-current dark:bg-black/15'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)]',
                  )}
                >
                  L
                </kbd>
              </button>
            </div>

            <div className="hidden h-6 w-px bg-[var(--border-hairline)] lg:block" />

            {/* CỤM 2: Hỗ trợ vẽ tay — Nắn nét · Thước kẻ · Hình 2D · Con dấu ký hiệu */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div ref={inkModeAnchorRef} className="relative">
                <button
                  type="button"
                  data-testid="ink-mode-btn"
                  onClick={() => togglePopover('ink-mode')}
                  title="Chế độ nắn nét tự động (Ink to Shape / Line)"
                  aria-label="Chế độ nhận dạng nét mực"
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 text-[13px] font-medium transition-colors',
                    inkMode !== 'ink' || openPopover === 'ink-mode'
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden xl:inline">
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
                  <ToolbarPopoverAnchor anchorRef={inkModeAnchorRef} preferAlign="left">
                    <InkModePopover
                      mode={inkMode}
                      onChange={(m) => {
                        setInkMode(m);
                        setActiveTool('pen');
                        setOpenPopover(null);
                      }}
                    />
                  </ToolbarPopoverAnchor>
                )}
              </div>

              <button
                type="button"
                data-testid="ink-ruler-toggle"
                onClick={() => setRuler((r) => ({ ...r, visible: !r.visible }))}
                title="Bật/tắt Thước kẻ thẳng (vẽ sát mép thước sẽ tự hút thẳng)"
                aria-pressed={ruler.visible}
                className={cn(
                  'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors',
                  ruler.visible
                    ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                )}
              >
                <Ruler className="h-4 w-4" aria-hidden="true" />
              </button>

              <div ref={shapesAnchorRef} className="relative">
                <button
                  type="button"
                  data-testid="ink-shapes-btn"
                  onClick={() => togglePopover('shapes')}
                  title="Hình học 2D, nét đứt, vectơ & chèn chữ/KaTeX"
                  aria-label="Công cụ hình học 2D và chữ"
                  className={cn(
                    'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors',
                    activeTool === 'shape' || activeTool === 'text' || openPopover === 'shapes'
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  <Shapes className="h-4 w-4" aria-hidden="true" />
                </button>
                {openPopover === 'shapes' && (
                  <ToolbarPopoverAnchor anchorRef={shapesAnchorRef} preferAlign="left">
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
                  </ToolbarPopoverAnchor>
                )}
              </div>

              <div ref={stampsAnchorRef} className="relative">
                <button
                  type="button"
                  data-testid="ink-stamps-btn"
                  onClick={() => togglePopover('stamps')}
                  title="Con dấu ký hiệu hình học: góc vuông, vạch bằng nhau, cung góc, song song, điểm"
                  aria-label="Con dấu ký hiệu hình học"
                  className={cn(
                    'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border transition-colors',
                    activeTool === 'stamp' || openPopover === 'stamps'
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                  )}
                >
                  <Stamp className="h-4 w-4" aria-hidden="true" />
                </button>
                {openPopover === 'stamps' && (
                  <ToolbarPopoverAnchor anchorRef={stampsAnchorRef} preferAlign="right">
                    <GeometryStampsPopover
                      config={stampConfig}
                      onChange={setStampConfig}
                      onSelectAndActivate={(next) => {
                        setStampConfig(next);
                        setActiveTool('stamp');
                        setOpenPopover(null);
                      }}
                      onClose={() => setOpenPopover(null)}
                    />
                  </ToolbarPopoverAnchor>
                )}
              </div>
            </div>

            <div className="hidden h-6 w-px bg-[var(--border-hairline)] lg:block" />

            {/* CỤM 3: Bộ công cụ Chuyên môn Toán học — Công thức · Dựng hình · Hình 3D · Đồ thị f(x) · Bảng biến thiên */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div ref={formulaAnchorRef} className="relative">
                <button
                  type="button"
                  data-testid="ink-formula-btn"
                  onClick={() => {
                    setEditingTextId(selectedText ? selectedText.id : null);
                    togglePopover('formula');
                  }}
                  title="Chèn hoặc chỉnh sửa Công thức Toán học trực quan (KaTeX, phân số, tích phân, hệ phương trình, ma trận)"
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition-colors',
                    openPopover === 'formula' || activeTool === 'text'
                      ? 'border-[#6D28D9] bg-[#6D28D9] text-white shadow-xs'
                      : 'border-[#6D28D9]/35 bg-[#F6F3FF] text-[#6D28D9] hover:bg-[#EDE7FE] dark:border-[#A78BFA]/35 dark:bg-[#191528] dark:text-[#C4B5FD]',
                  )}
                >
                  <Sigma className="h-4 w-4" aria-hidden="true" />
                  <span>Công thức</span>
                </button>
                {openPopover === 'formula' && (
                  <ToolbarPopoverAnchor anchorRef={formulaAnchorRef} preferAlign="left">
                    <InkFormulaEditorPopover
                      key={editingText?.id ?? 'new-formula'}
                      initialItem={editingText}
                      defaultColor={activePenPreset.color}
                      onSave={(payload) => {
                        if (editingText) {
                          updateText(editingText.id, payload);
                        } else {
                          const id = makeLocalId('txt');
                          const offset = (activePage.texts.length % 6) * 28;
                          addText({
                            id,
                            x: Math.round(dims.width * 0.24) + (offset % 56),
                            y: 165 + offset,
                            ...payload,
                          });
                          setActiveTool('select');
                          setSelectedIds(new Set([id]));
                        }
                        setEditingTextId(null);
                        setOpenPopover(null);
                      }}
                      onDelete={
                        editingText
                          ? () => {
                              deleteText(editingText.id);
                              setSelectedIds(new Set());
                              setEditingTextId(null);
                              setOpenPopover(null);
                            }
                          : undefined
                      }
                      onClose={() => {
                        setEditingTextId(null);
                        setOpenPopover(null);
                      }}
                    />
                  </ToolbarPopoverAnchor>
                )}
              </div>

              <button
                type="button"
                data-testid="ink-geo-btn"
                onClick={() => {
                  setOpenPopover(null);
                  setGeoPendingPts([]);
                  setGeoPendingCurveId(null);
                  setActiveTool((prev) => (prev === 'geo' ? 'pen' : 'geo'));
                }}
                title="Chế độ Dựng Hình Động GeoGebra trực tiếp trên trang giấy (Điểm, Tỉ lệ, Trung điểm, Trọng tâm, Giao điểm, Đường cao AH, Vuông góc/Song song, Đường tròn, Elip, Mặt phẳng)"
                aria-pressed={activeTool === 'geo'}
                className={cn(
                  'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition-colors',
                  activeTool === 'geo'
                    ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white shadow-xs'
                    : 'border-[#1D4ED8]/35 bg-[#EFF5FE] text-[#1D4ED8] hover:bg-[#E0ECFD] dark:border-[#60A5FA]/35 dark:bg-[#121D2B] dark:text-[#93C5FD]',
                )}
              >
                <Compass className="h-4 w-4" aria-hidden="true" />
                <span>Dựng hình</span>
              </button>

              <div ref={solid3dAnchorRef} className="relative">
                <button
                  type="button"
                  data-testid="ink-solid3d-btn"
                  onClick={() => {
                    setEditingSolidId(null);
                    togglePopover('solid3d');
                  }}
                  title="Chèn Hình học không gian 3D tương tác (đặt tên đỉnh, hình trơn, dựng điểm tỉ lệ trượt cạnh, trọng tâm, đường cao, mặt phẳng)"
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition-colors',
                    openPopover === 'solid3d'
                      ? 'border-[#17332C] bg-[#17332C] text-white'
                      : 'border-[#1D4F6E]/35 bg-[#F3F8FB] text-[#1D4F6E] hover:bg-[#E4F0F7] dark:border-[#64A8D1]/35 dark:bg-[#131C22] dark:text-[#64A8D1]',
                  )}
                >
                  <Box className="h-4 w-4" aria-hidden="true" />
                  <span>Hình 3D</span>
                </button>
                {openPopover === 'solid3d' && (
                  <ToolbarPopoverAnchor anchorRef={solid3dAnchorRef} preferAlign="right">
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
                  </ToolbarPopoverAnchor>
                )}
              </div>

              <div ref={graphAnchorRef} className="relative">
                <button
                  type="button"
                  data-testid="ink-graph-btn"
                  onClick={() => togglePopover('graph')}
                  title="Nhập biểu thức hàm số & vẽ đồ thị Oxy, điểm đặc biệt, tích phân"
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition-colors',
                    openPopover === 'graph'
                      ? 'border-[#17332C] bg-[#17332C] text-white'
                      : 'border-[#1B5E4A]/35 bg-[#F2F9F6] text-[#1B5E4A] hover:bg-[#E2F3EC] dark:border-[#52B394]/35 dark:bg-[#111F1A] dark:text-[#52B394]',
                  )}
                >
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  <span>Đồ thị f(x)</span>
                </button>
                {openPopover === 'graph' && (
                  <ToolbarPopoverAnchor anchorRef={graphAnchorRef} preferAlign="right">
                    <FunctionGraphPopover
                      onInsert={handleInsertGraph}
                      onClose={() => setOpenPopover(null)}
                    />
                  </ToolbarPopoverAnchor>
                )}
              </div>

              <div ref={variationAnchorRef} className="relative">
                <button
                  type="button"
                  data-testid="ink-variation-btn"
                  onClick={() => {
                    setEditingTableId(null);
                    togglePopover('variation');
                  }}
                  title="Tạo & chèn Bảng biến thiên / Bảng xét dấu chuẩn Toán THPT"
                  className={cn(
                    'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-xl border px-3 text-[13px] font-semibold transition-colors',
                    openPopover === 'variation'
                      ? 'border-[#17332C] bg-[#17332C] text-white'
                      : 'border-[#8C5828]/35 bg-[#FDF8F3] text-[#8C5828] hover:bg-[#F5EADC] dark:border-[#D4AF6A]/35 dark:bg-[#1D1813] dark:text-[#D4AF6A]',
                  )}
                >
                  <Table2 className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden xl:inline">Bảng biến thiên</span>
                  <span className="xl:hidden">BBT</span>
                </button>
                {openPopover === 'variation' && (
                  <ToolbarPopoverAnchor anchorRef={variationAnchorRef} preferAlign="right">
                    <VariationTablePopover
                      key={editingTable?.id ?? 'new-vt'}
                      initialTable={editingTable}
                      onInsert={handleInsertVariationTable}
                      onUpdateExisting={(tableId, patch) => {
                        updateVariationTable(tableId, patch);
                        setEditingTableId(null);
                      }}
                      onClose={() => {
                        setEditingTableId(null);
                        setOpenPopover(null);
                      }}
                    />
                  </ToolbarPopoverAnchor>
                )}
              </div>
            </div>
          </div>
        </header>
      )}

      {/* THANH CÔNG CỤ DỰNG HÌNH ĐỘNG KIỂU GEOGEBRA (HIỆN KHI BẬT CHẾ ĐỘ DỰNG HÌNH) */}
      {activeTool === 'geo' && (
        <GeoGebraToolbar
          activeGeoTool={geoTool}
          onSelectGeoTool={(tool) => {
            setGeoTool(tool);
            setGeoPendingPts([]);
            setGeoPendingCurveId(null);
          }}
          lineStyle={geoLineStyle}
          onChangeLineStyle={setGeoLineStyle}
          color={geoColor}
          onChangeColor={setGeoColor}
          stepHint={geoStepHint}
          pendingCount={geoPendingPts.length + (geoPendingCurveId ? 1 : 0)}
          onCancelPending={() => {
            setGeoPendingPts([]);
            setGeoPendingCurveId(null);
            geoPressStartRef.current = null;
          }}
          onClosePolygon={closePendingGeoPolygon}
          selectedObject={selectedGeoObject}
          onUpdateSelected={(patch) => {
            if (geoSelectedId) updateGeoObject(geoSelectedId, patch);
          }}
          onDeleteSelected={() => {
            if (geoSelectedId) deleteGeoObject(geoSelectedId);
          }}
          onExitGeoMode={() => {
            setGeoPendingPts([]);
            setGeoPendingCurveId(null);
            setGeoHoveredHit(null);
            setActiveTool('pen');
          }}
        />
      )}

      {/* ========================================================================
          KHU VỰC CHÍNH: CỘT THƯ MỤC ĐA CẤP & TRANG VỞ + TRANG GIẤY VIẾT CANVAS
          ======================================================================== */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* CỘT THƯ MỤC ĐA CẤP & TRANG THUMBNAIL BÊN TRÁI (Ẩn tự động khi Tập giảng để tối đa mặt bảng) */}
        {showPagesSidebar && !isTeachMode && (
          <FolderNotebookSidebar
            folders={folders}
            notebooks={bucket.notebooks}
            activeNotebook={activeNotebook}
            onSelectNotebook={selectNotebook}
            onCreateNotebook={createNotebook}
            onRenameNotebook={renameNotebook}
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

        {/* BÀN VIẾT CANVAS TƯƠNG TÁC + THANH NỔI ZOOM & CHUYỂN TRANG GÓC DƯỚI PHẢI */}
        <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            ref={scrollViewportRef}
            data-testid="math-ink-scroll-viewport"
            className="os-thin-scrollbar relative flex-1 overflow-auto p-5 pb-20 sm:p-8 sm:pb-24"
          >
            {/* THẺ ĐỀ BÀI GHIM NỔI TỪ BÀI GIẢNG (Nháp trên Bảng viết ↗) */}
            {pinnedExercise && (
              <aside
                data-testid="ink-pinned-exercise-card"
                aria-label={`Đề bài đang nháp: ${pinnedExercise.exerciseLabel}`}
                className="sticky top-2 z-30 mx-auto mb-4 w-full max-w-2xl rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/96 shadow-lg backdrop-blur-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] px-3.5 py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex shrink-0 items-center rounded-md bg-[var(--accent-os)]/12 px-2 py-0.5 font-mono text-[10.5px] font-bold text-[var(--accent-os)]">
                      {pinnedExercise.exerciseLabel}
                    </span>
                    <span className="truncate text-xs font-semibold text-[var(--text-main)]">
                      {pinnedExercise.exerciseTitle || pinnedExercise.lessonTitle}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      data-testid="ink-handoff-mark-done-btn"
                      aria-pressed={pinnedExerciseStatus === 'done'}
                      onClick={() =>
                        setExerciseStatus(
                          pinnedExercise.lessonId,
                          pinnedExercise.exerciseId,
                          pinnedExerciseStatus === 'done' ? 'todo' : 'done',
                        )
                      }
                      className={cn(
                        'inline-flex h-6 cursor-pointer items-center gap-1 rounded-md border px-2 text-[11px] font-semibold transition-colors',
                        pinnedExerciseStatus === 'done'
                          ? 'border-[#1B5E4A] bg-[#1B5E4A] text-white dark:border-[#52B394] dark:bg-[#1B5E4A]'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[#1B5E4A] hover:text-[#1B5E4A]',
                      )}
                    >
                      <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>
                        {pinnedExerciseStatus === 'done' ? 'Đã giải xong' : 'Đánh dấu đã giải'}
                      </span>
                    </button>

                    <Link
                      to={pinnedExercise.returnPath}
                      data-testid="ink-handoff-return-btn"
                      className="inline-flex h-6 items-center gap-1 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 text-[11px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)] hover:text-[var(--accent-os)]"
                    >
                      <ArrowLeft className="h-3 w-3 shrink-0" aria-hidden="true" />
                      <span>Quay lại bài giảng</span>
                    </Link>

                    <button
                      type="button"
                      data-testid="ink-handoff-collapse-btn"
                      onClick={() => setIsPinnedExerciseCollapsed((prev) => !prev)}
                      aria-expanded={!isPinnedExerciseCollapsed}
                      aria-label={isPinnedExerciseCollapsed ? 'Mở rộng đề bài' : 'Thu gọn đề bài'}
                      className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                    >
                      {isPinnedExerciseCollapsed ? (
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                    </button>

                    <button
                      type="button"
                      data-testid="ink-handoff-close-btn"
                      onClick={() => {
                        clearExerciseHandoff();
                        setPinnedExercise(null);
                      }}
                      aria-label="Đóng thẻ đề bài ghim"
                      className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {!isPinnedExerciseCollapsed && (
                  <div
                    data-testid="ink-pinned-exercise-body"
                    className="os-thin-scrollbar max-h-44 overflow-y-auto px-4 py-3 text-[13.5px] leading-relaxed whitespace-pre-line text-[var(--text-main)]"
                  >
                    <InlineMathText text={pinnedExercise.promptText} />
                  </div>
                )}
              </aside>
            )}

            {/* Thanh thao tác nhanh khi chọn Điểm / Đường / Hình bằng con trỏ ngoài chế độ Dựng hình */}
            {activeTool === 'select' && selectedGeoObject && (
              <div
                data-testid="ink-geo-quick-bar"
                className="sticky top-2 z-20 mx-auto mb-3 flex w-fit flex-wrap items-center gap-1.5 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/96 px-3 py-1.5 text-[12px] shadow-lg backdrop-blur-md"
              >
                <span className="font-semibold text-[var(--accent-os)]">
                  {selectedGeoObject.kind === 'geo-point'
                    ? 'Điểm'
                    : selectedGeoObject.kind === 'geo-line'
                      ? 'Đường / Đoạn'
                      : selectedGeoObject.kind === 'geo-conic'
                        ? 'Đường tròn / Elip'
                        : 'Đa giác'}
                </span>

                {selectedGeoObject.kind === 'geo-point' && (
                  <>
                    <input
                      type="text"
                      maxLength={8}
                      value={selectedGeoObject.label}
                      onChange={(e) =>
                        updateGeoObject(selectedGeoObject.id, { label: e.target.value })
                      }
                      className="h-7 w-14 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 text-center font-serif text-[12.5px] font-bold text-[var(--text-main)] italic outline-none focus:border-[var(--accent-os)]"
                      aria-label="Đổi tên điểm"
                      title="Đổi tên điểm (ví dụ A, B, M, H...)"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateGeoObject(selectedGeoObject.id, {
                          showLabel: selectedGeoObject.showLabel === false,
                        })
                      }
                      className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 text-[11.5px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                      title={
                        selectedGeoObject.showLabel === false ? 'Hiện tên điểm' : 'Ẩn tên điểm'
                      }
                    >
                      {selectedGeoObject.showLabel === false ? (
                        <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      <span>Tên</span>
                    </button>
                  </>
                )}

                {(selectedGeoObject.kind === 'geo-line' ||
                  selectedGeoObject.kind === 'geo-conic') && (
                  <button
                    type="button"
                    onClick={() =>
                      updateGeoObject(selectedGeoObject.id, {
                        style: selectedGeoObject.style === 'dashed' ? 'solid' : 'dashed',
                      })
                    }
                    className="inline-flex h-7 cursor-pointer items-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 text-[11.5px] font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]"
                    title="Chuyển nhanh giữa nét liền và nét đứt"
                  >
                    {selectedGeoObject.style === 'dashed' ? 'Nét đứt' : 'Nét liền'}
                  </button>
                )}

                <span className="h-4 w-px bg-[var(--border-hairline)]" />

                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('geo');
                    setGeoTool('move');
                  }}
                  className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 text-[11.5px] font-semibold text-blue-700 hover:bg-blue-100"
                  title="Mở thanh Dựng hình để dựng thêm vuông góc, trung điểm, đường tròn..."
                >
                  <Compass className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Dựng hình</span>
                </button>

                <button
                  type="button"
                  data-testid="ink-geo-quick-delete"
                  onClick={() => {
                    deleteGeoObject(selectedGeoObject.id);
                    setSelectedIds(new Set());
                  }}
                  className="inline-flex h-7 cursor-pointer items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 text-[11.5px] font-semibold text-rose-700 hover:bg-rose-100"
                  title="Xóa đối tượng đang chọn (hoặc nhấn Delete)"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Xóa</span>
                </button>
              </div>
            )}

            {/* Thanh nổi cho Bút Laser tự tan */}
            {activeTool === 'laser' && (
              <div
                data-testid="ink-laser-bar"
                className="sticky top-2 z-20 mx-auto mb-3 flex w-fit flex-wrap items-center gap-2 rounded-full border border-[#FF4D4F]/35 bg-[var(--bg-workspace)]/95 px-3.5 py-1.5 text-xs shadow-lg backdrop-blur-md dark:border-[#FF6B6B]/40"
              >
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#D9363E] dark:text-[#FF6B6B]">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-[#FF4D4F] dark:bg-[#FF6B6B]" />
                  <span>Bút Laser tự tan (1.2s · phím L)</span>
                </span>
                <div className="flex items-center gap-1 border-l border-[var(--border-hairline)] pl-2">
                  {LASER_COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLaserColorPreset(opt.id)}
                      title={opt.label}
                      aria-label={`Màu tia laser: ${opt.label}`}
                      aria-pressed={laserColorPreset === opt.id}
                      style={{
                        backgroundColor:
                          opt.id === 'default'
                            ? isDarkHexColor(activeNotebook.paper.backgroundColor)
                              ? LASER_DARK_CORE_COLOR
                              : LASER_LIGHT_CORE_COLOR
                            : opt.swatch,
                      }}
                      className={cn(
                        'h-4 w-4 cursor-pointer rounded-full border border-white/60 transition-transform hover:scale-110 active:scale-95',
                        laserColorPreset === opt.id &&
                          'ring-2 ring-[var(--text-main)] ring-offset-1',
                      )}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTool('pen')}
                  className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 text-[11px] font-medium transition-colors hover:text-[var(--accent-os)]"
                >
                  Quay lại bút
                </button>
              </div>
            )}

            {/* Thanh nổi khi đang ở chế độ Đóng dấu Hình học */}
            {activeTool === 'stamp' && (
              <div
                data-testid="ink-stamp-bar"
                className="sticky top-2 z-20 mx-auto mb-3 flex w-fit flex-wrap items-center gap-2 rounded-full border border-[var(--accent-os)]/35 bg-[var(--bg-workspace)]/95 px-3.5 py-1.5 text-xs shadow-lg backdrop-blur-md"
              >
                <span className="font-semibold text-[var(--accent-os)]">
                  Đang đóng dấu · Chạm vào giấy để gắn ({stampConfig.rotationDeg}°)
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setStampConfig((c) => ({ ...c, rotationDeg: (c.rotationDeg - 15 + 360) % 360 }))
                  }
                  className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10.5px]"
                >
                  -15°
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStampConfig((c) => ({ ...c, rotationDeg: (c.rotationDeg + 15) % 360 }))
                  }
                  className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10.5px]"
                >
                  +15°
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTool('pen')}
                  className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 text-[11px] font-medium hover:text-[var(--accent-os)]"
                >
                  Xong
                </button>
              </div>
            )}

            {/* Thanh nổi thao tác nhanh khi đang chọn đối tượng (Di chuyển, Thu/Phóng, Xoay, Dựng hình 3D, Bảng biến thiên, Xóa) */}
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

                {selectedTable && (
                  <div className="inline-flex items-center gap-1 border-l border-[var(--border-hairline)] pl-1.5">
                    <button
                      type="button"
                      data-testid="selected-edit-vt-btn"
                      onClick={() => {
                        setEditingTableId(selectedTable.id);
                        setOpenPopover('variation');
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#8C5828]/40 bg-[#FDF8F3] px-2 py-0.5 text-[10.5px] font-semibold text-[#8C5828] hover:bg-[#F5EADC] dark:border-[#D4AF6A]/35 dark:bg-[#1D1813] dark:text-[#D4AF6A]"
                    >
                      <Table2 className="h-3 w-3" aria-hidden="true" />
                      <span>Chỉnh bảng</span>
                    </button>
                  </div>
                )}

                {selectedText && (
                  <div className="inline-flex items-center gap-1 border-l border-[var(--border-hairline)] pl-1.5">
                    <button
                      type="button"
                      data-testid="selected-edit-text-btn"
                      onClick={() => {
                        setEditingTextId(selectedText.id);
                        setOpenPopover('formula');
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-[#6D28D9]/40 bg-[#F6F3FF] px-2 py-0.5 text-[10.5px] font-semibold text-[#6D28D9] hover:bg-[#EDE7FE] dark:border-[#A78BFA]/35 dark:bg-[#191528] dark:text-[#C4B5FD]"
                    >
                      <Sigma className="h-3 w-3" aria-hidden="true" />
                      <span>Sửa công thức</span>
                    </button>
                    <button
                      type="button"
                      data-testid="selected-text-smaller"
                      onClick={() =>
                        updateText(selectedText.id, {
                          fontSize: Math.max(12, selectedText.fontSize - 3),
                        })
                      }
                      className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10.5px] hover:text-[var(--accent-os)]"
                    >
                      - Cỡ
                    </button>
                    <button
                      type="button"
                      data-testid="selected-text-larger"
                      onClick={() =>
                        updateText(selectedText.id, {
                          fontSize: Math.min(48, selectedText.fontSize + 3),
                        })
                      }
                      className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10.5px] hover:text-[var(--accent-os)]"
                    >
                      + Cỡ
                    </button>
                  </div>
                )}

                {selectedStamp && (
                  <div className="inline-flex items-center gap-1 border-l border-[var(--border-hairline)] pl-1.5">
                    <button
                      type="button"
                      onClick={() => handleScaleSelectedStamp(-6)}
                      className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10.5px]"
                    >
                      - Cỡ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleScaleSelectedStamp(6)}
                      className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10.5px]"
                    >
                      + Cỡ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRotateSelectedStamp(-15)}
                      className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10.5px]"
                    >
                      -15°
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRotateSelectedStamp(15)}
                      className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10.5px]"
                    >
                      +15°
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  data-testid="selected-delete-btn"
                  onClick={() => {
                    commitPageMutation((page) => ({
                      ...page,
                      strokes: page.strokes.filter((s) => !selectedIds.has(s.id)),
                      shapes: page.shapes.filter((s) => !selectedIds.has(s.id)),
                      solids3d: page.solids3d.filter((s) => !selectedIds.has(s.id)),
                      graphs: page.graphs.filter((g) => !selectedIds.has(g.id)),
                      variationTables: (page.variationTables ?? []).filter(
                        (t) => !selectedIds.has(t.id),
                      ),
                      stamps: (page.stamps ?? []).filter((st) => !selectedIds.has(st.id)),
                      geoObjects: removeGeoObjectsWithCascade(page.geoObjects, selectedIds),
                      texts: page.texts.filter((t) => !selectedIds.has(t.id)),
                      images: page.images.filter((im) => !selectedIds.has(im.id)),
                    }));
                    setSelectedIds(new Set());
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-[#8F3D35] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#7A322B]"
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

            {/* TỜ GIẤY VỞ Ô LY TOÁN HỌC (w-fit mx-auto giúp cuộn ngang/dọc mượt mà ở mọi mức Zoom tới 300%) */}
            <div className="mx-auto w-fit">
              <div
                className="relative overflow-hidden rounded-lg border border-[var(--border-hairline)] shadow-[0_18px_46px_-22px_rgba(17,26,24,0.3)]"
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
                  onDoubleClick={(e) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const rect = canvas.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * dims.width;
                    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * dims.height;
                    for (let i = activePage.texts.length - 1; i >= 0; i -= 1) {
                      const t = activePage.texts[i]!;
                      if (x >= t.x - 14 && x <= t.x + 260 && y >= t.y - 32 && y <= t.y + 36) {
                        setSelectedIds(new Set([t.id]));
                        setEditingTextId(t.id);
                        setOpenPopover('formula');
                        return;
                      }
                    }
                  }}
                  onPointerLeave={() => {
                    if (activeTool === 'geo' || activeTool === 'select') {
                      setGeoHoveredHit(null);
                      setGeoCursor(null);
                    }
                  }}
                  className={cn(
                    'h-full w-full touch-none select-none',
                    (activeTool === 'pan' || isSpaceHeld) && 'cursor-grab active:cursor-grabbing',
                    activeTool === 'pen' && !isSpaceHeld && 'cursor-crosshair',
                    activeTool === 'shape' && !isSpaceHeld && 'cursor-crosshair',
                    activeTool === 'stamp' && !isSpaceHeld && 'cursor-copy',
                    activeTool === 'laser' && !isSpaceHeld && 'cursor-crosshair',
                    activeTool === 'eraser' && !isSpaceHeld && 'cursor-cell',
                    activeTool === 'select' &&
                      !isSpaceHeld &&
                      (geoHoveredHit ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'),
                    activeTool === 'text' && !isSpaceHeld && 'cursor-text',
                    activeTool === 'geo' &&
                      !isSpaceHeld &&
                      (geoTool === 'move'
                        ? geoHoveredHit
                          ? 'cursor-grab active:cursor-grabbing'
                          : 'cursor-default'
                        : geoTool === 'eraser'
                          ? 'cursor-cell'
                          : 'cursor-crosshair'),
                  )}
                />

                {/* Lớp phủ tia Laser trình chiếu 60fps (trong suốt, không chặn con trỏ) */}
                <canvas
                  ref={laserCanvasRef}
                  data-testid="math-ink-laser-canvas"
                  className="pointer-events-none absolute inset-0 z-15 h-full w-full"
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

                {/* Lớp phủ công thức KaTeX & nhãn văn bản tương tác (nhấp đúp để sửa lại, kéo để di chuyển) */}
                {activePage.texts.map((t) => {
                  const isSelected = selectedIds.has(t.id);
                  const isInteractiveMode = activeTool === 'select' || activeTool === 'text';
                  return (
                    <div
                      key={t.id}
                      data-testid={`ink-text-chip-${t.id}`}
                      title={
                        isInteractiveMode
                          ? 'Kéo để di chuyển · Nhấp đúp để chỉnh sửa công thức'
                          : undefined
                      }
                      style={{
                        left: `${(t.x / dims.width) * 100}%`,
                        top: `${((t.y - t.fontSize * 0.92) / dims.height) * 100}%`,
                        color: t.color,
                        fontSize: `${Math.max(11, Math.round(t.fontSize * zoom))}px`,
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setSelectedIds(new Set([t.id]));
                        setEditingTextId(t.id);
                        setOpenPopover('formula');
                      }}
                      onPointerDown={(e) => {
                        if (!isInteractiveMode) return;
                        e.stopPropagation();
                        setSelectedIds(new Set([t.id]));
                        const startClientX = e.clientX;
                        const startClientY = e.clientY;
                        const initX = t.x;
                        const initY = t.y;
                        let moved = false;
                        let latestX = initX;
                        let latestY = initY;
                        const onMove = (ev: PointerEvent) => {
                          const dx = (ev.clientX - startClientX) / zoom;
                          const dy = (ev.clientY - startClientY) / zoom;
                          if (Math.hypot(dx, dy) < 2 && !moved) return;
                          moved = true;
                          latestX = Math.max(12, Math.min(dims.width - 40, Math.round(initX + dx)));
                          latestY = Math.max(
                            24,
                            Math.min(dims.height - 20, Math.round(initY + dy)),
                          );
                          updateText(t.id, { x: latestX, y: latestY });
                        };
                        const onUp = () => {
                          window.removeEventListener('pointermove', onMove);
                          window.removeEventListener('pointerup', onUp);
                        };
                        window.addEventListener('pointermove', onMove);
                        window.addEventListener('pointerup', onUp);
                      }}
                      className={cn(
                        'absolute z-10 rounded-md px-1.5 py-0.5 transition-shadow select-none',
                        isInteractiveMode
                          ? 'pointer-events-auto cursor-move'
                          : 'pointer-events-none',
                        isSelected
                          ? 'bg-[var(--bg-workspace)]/90 shadow-sm ring-2 ring-[var(--accent-os)]'
                          : isInteractiveMode
                            ? 'hover:bg-[var(--bg-workspace)]/75 hover:ring-1 hover:ring-[var(--accent-os)]/50'
                            : 'bg-transparent',
                      )}
                    >
                      <SmartInkMathContent text={t.text} isMath={t.isMath} />
                    </div>
                  );
                })}

                {/* Chỉnh sửa công thức trực tiếp khi đang ở Chế độ Tập giảng */}
                {isTeachMode && openPopover === 'formula' && editingText && (
                  <div className="absolute top-6 left-1/2 z-30 -translate-x-1/2">
                    <InkFormulaEditorPopover
                      key={editingText.id}
                      initialItem={editingText}
                      defaultColor={activePenPreset.color}
                      onSave={(payload) => {
                        updateText(editingText.id, payload);
                        setEditingTextId(null);
                        setOpenPopover(null);
                      }}
                      onDelete={() => {
                        deleteText(editingText.id);
                        setSelectedIds(new Set());
                        setEditingTextId(null);
                        setOpenPopover(null);
                      }}
                      onClose={() => {
                        setEditingTextId(null);
                        setOpenPopover(null);
                      }}
                    />
                  </div>
                )}

                {/* Hộp Công thức Toán học trực quan ngay tại vị trí vừa click (khi dùng công cụ Chữ / KaTeX) */}
                {pendingTextBox && (
                  <div
                    style={{
                      left: `${Math.max(2, Math.min(48, (pendingTextBox.x / dims.width) * 100))}%`,
                      top: `${Math.max(2, Math.min(46, (pendingTextBox.y / dims.height) * 100))}%`,
                    }}
                    className="absolute z-30"
                  >
                    <InkFormulaEditorPopover
                      defaultColor={activePenPreset.color}
                      onSave={(payload) => {
                        const id = makeLocalId('txt');
                        addText({
                          id,
                          x: Math.round(pendingTextBox.x),
                          y: Math.round(pendingTextBox.y),
                          ...payload,
                        });
                        setPendingTextBox(null);
                        setSelectedIds(new Set([id]));
                      }}
                      onClose={() => setPendingTextBox(null)}
                    />
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
                        onClick={() =>
                          setRuler((r) => ({ ...r, angleDeg: (r.angleDeg + 15) % 360 }))
                        }
                        className="cursor-pointer rounded border border-[#17332C]/25 bg-white/90 px-1.5 py-0.5 hover:bg-white"
                      >
                        +15°
                      </button>
                    </div>
                    <span className="text-[10.5px] text-[#4A5955]">Vẽ sát mép trên</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* THANH NỔI GÓC DƯỚI PHẢI: CHUYỂN TRANG NHANH + ZOOM TỰ DO (35%–300%) */}
          <div
            data-testid="ink-viewport-hud"
            className="pointer-events-none absolute right-4 bottom-4 z-30 flex items-center gap-2"
          >
            {/* Cụm Chuyển trang nhanh */}
            <div className="pointer-events-auto flex items-center gap-0.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/95 p-1 shadow-lg backdrop-blur-md">
              <button
                type="button"
                data-testid="hud-prev-page"
                onClick={() => {
                  if (activeNotebook.activePageIndex > 0) {
                    selectPage(activeNotebook.activePageIndex - 1);
                  }
                }}
                disabled={activeNotebook.activePageIndex <= 0}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-35"
                title="Trang trước (PageUp)"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="min-w-[66px] px-1.5 text-center font-mono text-[12px] font-semibold text-[var(--text-main)] select-none">
                Trang {activeNotebook.activePageIndex + 1}/{activeNotebook.pages.length}
              </span>
              <button
                type="button"
                data-testid="hud-next-page"
                onClick={() => {
                  if (activeNotebook.activePageIndex < activeNotebook.pages.length - 1) {
                    selectPage(activeNotebook.activePageIndex + 1);
                  }
                }}
                disabled={activeNotebook.activePageIndex >= activeNotebook.pages.length - 1}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] disabled:cursor-not-allowed disabled:opacity-35"
                title="Trang sau (PageDown)"
                aria-label="Trang sau"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="mx-0.5 h-4 w-px bg-[var(--border-hairline)]" />
              <button
                type="button"
                data-testid="hud-add-page"
                onClick={addPage}
                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg px-2 text-[12px] font-medium text-[var(--accent-os)] hover:bg-[var(--accent-os)]/10"
                title="Thêm trang mới vào cuối vở"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Trang</span>
              </button>
            </div>

            {/* Cụm Zoom tự do 35%–300% + Popover mở hướng lên trên */}
            <div
              ref={zoomAnchorRef}
              data-testid="ink-zoom-control"
              className="pointer-events-auto relative flex items-center gap-0.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)]/95 p-1 shadow-lg backdrop-blur-md"
            >
              <button
                type="button"
                data-testid="ink-zoom-out"
                onClick={() => setZoom((z) => clampZoom(z - 0.1))}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                title="Thu nhỏ (-10%, hoặc Ctrl + -)"
                aria-label="Thu nhỏ trang"
              >
                <ZoomOut className="h-4 w-4" aria-hidden="true" />
              </button>
              <input
                type="text"
                inputMode="numeric"
                data-testid="ink-zoom-input"
                aria-label="Tỉ lệ thu phóng trang (%)"
                value={zoomInputDraft ?? `${Math.round(zoom * 100)}%`}
                onFocus={(e) => {
                  setZoomInputDraft(String(Math.round(zoom * 100)));
                  e.currentTarget.select();
                }}
                onChange={(e) => setZoomInputDraft(e.target.value)}
                onBlur={() => {
                  if (zoomInputDraft !== null) {
                    const parsed = Number.parseInt(zoomInputDraft.replace(/[^\d]/g, ''), 10);
                    if (Number.isFinite(parsed) && parsed > 0) {
                      setZoom(clampZoom(parsed / 100));
                    }
                    setZoomInputDraft(null);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (zoomInputDraft !== null) {
                      const parsed = Number.parseInt(zoomInputDraft.replace(/[^\d]/g, ''), 10);
                      if (Number.isFinite(parsed) && parsed > 0) {
                        setZoom(clampZoom(parsed / 100));
                      }
                      setZoomInputDraft(null);
                    }
                    e.currentTarget.blur();
                  } else if (e.key === 'Escape') {
                    setZoomInputDraft(null);
                    e.currentTarget.blur();
                  }
                }}
                className="h-7 w-[52px] rounded-md bg-transparent text-center font-mono text-[12.5px] font-semibold text-[var(--text-main)] outline-none focus:bg-[var(--bg-surface)] focus:ring-1 focus:ring-[var(--accent-os)]"
                title="Nhập tỉ lệ % tùy ý (35–300%) rồi nhấn Enter"
              />
              <button
                type="button"
                data-testid="ink-zoom-menu-btn"
                onClick={() => setOpenPopover((p) => (p === 'zoom' ? null : 'zoom'))}
                className="inline-flex h-7 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
                title="Tùy chỉnh tỉ lệ Zoom (thanh trượt, vừa chiều ngang, vừa trang)"
                aria-label="Mở bảng chọn tỉ lệ thu phóng"
              >
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                data-testid="ink-zoom-in"
                onClick={() => setZoom((z) => clampZoom(z + 0.1))}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]"
                title="Phóng to (+10%, hoặc Ctrl + +)"
                aria-label="Phóng to trang"
              >
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </button>

              {openPopover === 'zoom' && (
                <ToolbarPopoverAnchor
                  anchorRef={zoomAnchorRef}
                  preferAlign="right"
                  preferPlacement="top"
                >
                  <div
                    data-testid="ink-zoom-popover"
                    className="w-[268px] rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5 shadow-2xl"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[12px] font-bold text-[var(--text-main)]">
                        Thu phóng trang giấy
                      </span>
                      <span className="font-mono text-[12px] font-semibold text-[var(--accent-os)]">
                        {Math.round(zoom * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      data-testid="ink-zoom-slider"
                      min={35}
                      max={300}
                      step={5}
                      value={Math.round(zoom * 100)}
                      onChange={(e) => setZoom(clampZoom(Number(e.target.value) / 100))}
                      className="mb-3 w-full cursor-pointer accent-[var(--accent-os)]"
                      aria-label="Thanh trượt tỉ lệ thu phóng trang"
                    />
                    <div className="mb-2.5 grid grid-cols-3 gap-1.5">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2, 2.5].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setZoom(preset);
                            setOpenPopover(null);
                          }}
                          className={`cursor-pointer rounded-lg border px-2 py-1 font-mono text-[12px] font-medium transition-colors ${
                            Math.abs(zoom - preset) < 0.02
                              ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                              : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
                          }`}
                        >
                          {Math.round(preset * 100)}%
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 border-t border-[var(--border-hairline)] pt-2.5">
                      <button
                        type="button"
                        data-testid="ink-zoom-fit-width"
                        onClick={() => {
                          fitZoomToWidth();
                          setOpenPopover(null);
                        }}
                        className="cursor-pointer rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]"
                      >
                        Vừa chiều ngang
                      </button>
                      <button
                        type="button"
                        data-testid="ink-zoom-fit-page"
                        onClick={() => {
                          fitZoomToPage();
                          setOpenPopover(null);
                        }}
                        className="cursor-pointer rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 text-[12px] font-medium text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]"
                      >
                        Vừa trọn trang
                      </button>
                    </div>
                    <p className="mt-2 text-[11px] leading-snug text-[var(--text-muted)]">
                      Mẹo: Giữ{' '}
                      <kbd className="rounded bg-[var(--bg-surface)] px-1 font-mono">Ctrl</kbd> +
                      lăn chuột để zoom mượt; giữ{' '}
                      <kbd className="rounded bg-[var(--bg-surface)] px-1 font-mono">Space</kbd> +
                      kéo để di chuyển trang.
                    </p>
                  </div>
                </ToolbarPopoverAnchor>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MathInkPage;
