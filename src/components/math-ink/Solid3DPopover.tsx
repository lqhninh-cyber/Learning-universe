import {
  Box,
  Check,
  Compass,
  Layers,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import {
  type FC,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  formatRatioLabel,
  getSolidPresetSchema,
  hitTestSolid3DScene,
  parseRatioInput,
  renderSolid3DOnCanvas,
  resolveSolidVertexLabel,
  SOLID_3D_PRESETS,
  type Ink3DSolidItem,
  type Solid3DConstruction,
  type Solid3DPresetKind,
  type Solid3DSceneHit,
} from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

export interface Solid3DPopoverProps {
  /** Nếu truyền vào -> mở ở chế độ chỉnh sửa trực tiếp hình 3D đang chọn trên trang */
  readonly initialSolid?: Ink3DSolidItem | null;
  readonly onInsert: (solid: Omit<Ink3DSolidItem, 'id' | 'x' | 'y'>) => void;
  readonly onUpdateExisting?: (solidId: string, patch: Partial<Ink3DSolidItem>) => void;
  readonly onClose: () => void;
}

const SOLID_COLORS = ['#111827', '#1D4ED8', '#DC2626', '#1B5E4A', '#9E763B', '#FFFFFF'] as const;
const CONSTRUCTION_COLORS = [
  '#DC2626',
  '#1D4ED8',
  '#1B5E4A',
  '#D97706',
  '#7C3AED',
  '#0891B2',
  '#111827',
] as const;

type SolidTab = 'basic' | 'labels' | 'constructions';
type ConstructionToolType = 'midpoint' | 'centroid' | 'altitude' | 'plane' | 'segment';
type PointPlacementSource = 'edge' | 'two-points' | 'face-point';
type CentroidSourceMode = 'face' | 'custom-points';

const RATIO_PRESETS: readonly { readonly label: string; readonly value: number }[] = [
  { label: '1/2 (T.điểm)', value: 0.5 },
  { label: '1/3', value: 1 / 3 },
  { label: '2/3', value: 2 / 3 },
  { label: '1/4', value: 0.25 },
  { label: '3/4', value: 0.75 },
];

const FACE_POINT_POSITIONS: readonly {
  readonly id: string;
  readonly label: string;
  readonly weights: readonly number[];
}[] = [
  { id: 'inner-a', label: 'Lệch đỉnh 1', weights: [0.52, 0.24, 0.24, 0.18] },
  { id: 'inner-b', label: 'Lệch đỉnh 2', weights: [0.22, 0.54, 0.24, 0.18] },
  { id: 'inner-c', label: 'Lệch đỉnh 3', weights: [0.22, 0.24, 0.54, 0.18] },
  { id: 'center', label: 'Giữa mặt', weights: [1, 1, 1, 1] },
];

const POINT_NAME_SEQUENCE = ['M', 'N', 'P', 'Q', 'I', 'K', 'E', 'F', 'J', 'L'] as const;

function nextPointLabel(current: string): string {
  const idx = POINT_NAME_SEQUENCE.indexOf(current as (typeof POINT_NAME_SEQUENCE)[number]);
  if (idx === -1) return 'M';
  return POINT_NAME_SEQUENCE[(idx + 1) % POINT_NAME_SEQUENCE.length]!;
}

function makeConstructionId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`;
}

export const Solid3DPopover: FC<Solid3DPopoverProps> = ({
  initialSolid = null,
  onInsert,
  onUpdateExisting,
  onClose,
}) => {
  const isEditing = Boolean(initialSolid && onUpdateExisting);

  const [preset, setPreset] = useState<Solid3DPresetKind>(initialSolid?.preset ?? 'pyramid-quad');
  const [yaw, setYaw] = useState(initialSolid?.yaw ?? 32);
  const [pitch, setPitch] = useState(initialSolid?.pitch ?? 20);
  const [sizePx, setSizePx] = useState(initialSolid?.width ?? 300);
  const [color, setColor] = useState<string>(initialSolid?.color ?? '#111827');
  const [showLabels, setShowLabels] = useState(initialSolid?.showLabels ?? true);
  const [showAuxLines, setShowAuxLines] = useState(initialSolid?.showAuxLines ?? true);
  const [dashedHidden, setDashedHidden] = useState(initialSolid?.dashedHidden ?? true);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>(() => ({
    ...(initialSolid?.customLabels ?? {}),
  }));
  const [constructions, setConstructions] = useState<Solid3DConstruction[]>(() => [
    ...(initialSolid?.constructions ?? []),
  ]);

  const [activeTab, setActiveTab] = useState<SolidTab>('basic');
  const [constType, setConstType] = useState<ConstructionToolType>('midpoint');

  const schema = useMemo(() => getSolidPresetSchema(preset), [preset]);
  const primaryVertices = useMemo(() => schema.vertices.filter((v) => !v.aux), [schema.vertices]);
  const visibleBaseVertices = useMemo(
    () => schema.vertices.filter((v) => !v.aux || showAuxLines),
    [schema.vertices, showAuxLines],
  );
  const primaryEdges = useMemo(() => schema.edges.filter((e) => !e.aux), [schema.edges]);

  // Danh sách toàn bộ điểm có thể chọn (đỉnh gốc + điểm phụ đang hiện + các điểm đã dựng)
  const selectablePoints = useMemo(() => {
    const base = visibleBaseVertices.map((v) => ({
      id: v.id,
      label: resolveSolidVertexLabel(v.id, v.label, customLabels) || v.label,
    }));
    const derived = constructions
      .filter(
        (
          c,
        ): c is Exclude<
          Solid3DConstruction,
          { readonly kind: 'segment' } | { readonly kind: 'plane' }
        > => c.kind !== 'segment' && c.kind !== 'plane',
      )
      .map((c) => ({
        id: c.id,
        label: c.kind === 'altitude' ? c.footLabel : c.label,
      }));
    return [...base, ...derived];
  }, [constructions, customLabels, visibleBaseVertices]);

  // 1. State dựng Điểm / Trung điểm / Tỉ lệ / Điểm thuộc mặt
  const [pointSource, setPointSource] = useState<PointPlacementSource>('edge');
  const [selectedEdgeIdx, setSelectedEdgeIdx] = useState(0);
  const [pointFromId, setPointFromId] = useState<string>(primaryVertices[0]?.id ?? 'S');
  const [pointToId, setPointToId] = useState<string>(primaryVertices[1]?.id ?? 'A');
  const [pointRatio, setPointRatio] = useState<number>(0.5);
  const [customRatioText, setCustomRatioText] = useState<string>('1/2');
  const [facePointFaceIdx, setFacePointFaceIdx] = useState(0);
  const [facePointPosIdx, setFacePointPosIdx] = useState(0);
  const [midpointLabel, setMidpointLabel] = useState('M');

  // 2. State dựng Trọng tâm / Tâm đáy
  const [centroidSource, setCentroidSource] = useState<CentroidSourceMode>('face');
  const [selectedFaceIdx, setSelectedFaceIdx] = useState(0);
  const [customCentroidPts, setCustomCentroidPts] = useState<string[]>(() =>
    primaryVertices.slice(0, 3).map((v) => v.id),
  );
  const [centroidShowMedians, setCentroidShowMedians] = useState(true);
  const [centroidLabel, setCentroidLabel] = useState('G');

  // 3. State dựng Đường cao / Hình chiếu vuông góc
  const [altitudeApex, setAltitudeApex] = useState<string>(primaryVertices[0]?.id ?? 'S');
  const [altitudeFootTarget, setAltitudeFootTarget] = useState<string>('base-plane');
  const [altitudeFootLabel, setAltitudeFootLabel] = useState('H');

  // 4. State dựng Mặt phẳng & Thiết diện tô màu bán trong suốt
  const [planePoints, setPlanePoints] = useState<string[]>(() =>
    primaryVertices.slice(0, 3).map((v) => v.id),
  );
  const [planeLabel, setPlaneLabel] = useState('α');
  const [planeOpacity, setPlaneOpacity] = useState(0.22);
  const [planeBorderStyle, setPlaneBorderStyle] = useState<'auto' | 'solid' | 'dashed'>('auto');
  const [planeShowArc, setPlaneShowArc] = useState(true);

  // 5. State dựng Đoạn nối
  const [segFrom, setSegFrom] = useState<string>(selectablePoints[0]?.id ?? 'S');
  const [segTo, setSegTo] = useState<string>(selectablePoints[1]?.id ?? 'A');
  const [segStyle, setSegStyle] = useState<'solid' | 'dashed'>('dashed');
  const [constColor, setConstColor] = useState<string>('#DC2626');

  // Tương tác trực tiếp trên Canvas 3D kiểu GeoGebra (Hover & Click chọn đỉnh/cạnh)
  const [hoveredHit, setHoveredHit] = useState<Solid3DSceneHit | null>(null);
  const [lastCanvasHint, setLastCanvasHint] = useState<string | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    lastX: number;
    lastY: number;
    movedPx: number;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    movedPx: 0,
  });

  // Bản xem trước trực tiếp (bao gồm mặt phẳng đang chọn điểm trong tab Mặt phẳng)
  const previewConstructions = useMemo<readonly Solid3DConstruction[]>(() => {
    if (
      activeTab === 'constructions' &&
      constType === 'plane' &&
      planePoints.length >= 3 &&
      schema.supportsConstructions
    ) {
      const draftPlane: Solid3DConstruction = {
        id: '__draft_plane_preview__',
        kind: 'plane',
        points: planePoints,
        label: planeLabel,
        color: constColor,
        fillOpacity: planeOpacity,
        borderStyle: planeBorderStyle,
        showPlaneArc: planeShowArc,
      };
      return [...constructions, draftPlane];
    }
    return constructions;
  }, [
    activeTab,
    constColor,
    constType,
    constructions,
    planeBorderStyle,
    planeLabel,
    planeOpacity,
    planePoints,
    planeShowArc,
    schema.supportsConstructions,
  ]);

  const previewSolidItem = useMemo<Ink3DSolidItem>(
    () => ({
      id: 'preview',
      preset,
      x: 24,
      y: 8,
      width: 340 - 48,
      height: 196 - 16,
      yaw,
      pitch,
      color,
      lineWidth: 2,
      showLabels,
      showAuxLines,
      dashedHidden,
      customLabels,
      constructions: previewConstructions,
    }),
    [
      color,
      customLabels,
      dashedHidden,
      pitch,
      preset,
      previewConstructions,
      showAuxLines,
      showLabels,
      yaw,
    ],
  );

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 340;
    const h = 196;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = color === '#FFFFFF' ? '#13221E' : '#F8FAFB';
    ctx.fillRect(0, 0, w, h);

    renderSolid3DOnCanvas(ctx, previewSolidItem);

    // Vẽ vòng sáng GeoGebra khi người dùng rê chuột lên đỉnh hoặc trung điểm cạnh trên hình 3D
    if (hoveredHit) {
      ctx.save();
      const ringColor = hoveredHit.kind === 'point' ? '#1D4ED8' : '#D97706';
      ctx.strokeStyle = ringColor;
      ctx.fillStyle =
        hoveredHit.kind === 'point' ? 'rgba(29, 78, 216, 0.16)' : 'rgba(217, 119, 6, 0.18)';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(hoveredHit.x, hoveredHit.y, hoveredHit.kind === 'point' ? 8.5 : 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = ringColor;
      ctx.beginPath();
      ctx.arc(hoveredHit.x, hoveredHit.y, 2.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }, [color, hoveredHit, previewSolidItem]);

  const handleSelectPreset = (kind: Solid3DPresetKind) => {
    setPreset(kind);
    const meta = SOLID_3D_PRESETS.find((m) => m.kind === kind);
    const nextSchema = getSolidPresetSchema(kind);
    if (meta) {
      setYaw(meta.defaultYaw);
      setPitch(meta.defaultPitch);
    }
    setCustomLabels({});
    setConstructions([]);
    setSelectedEdgeIdx(0);
    setSelectedFaceIdx(0);
    setFacePointFaceIdx(0);
    const nextPrimary = nextSchema.vertices.filter((v) => !v.aux);
    setPointFromId(nextPrimary[0]?.id ?? 'S');
    setPointToId(nextPrimary[1]?.id ?? 'A');
    setCustomCentroidPts(nextPrimary.slice(0, 3).map((v) => v.id));
    setPlanePoints(nextPrimary.slice(0, 3).map((v) => v.id));
    setAltitudeApex(nextPrimary[0]?.id ?? 'S');
    setAltitudeFootTarget('base-plane');
    setSegFrom(nextPrimary[0]?.id ?? 'S');
    setSegTo(nextPrimary[1]?.id ?? 'A');
    setHoveredHit(null);
    setLastCanvasHint(null);
  };

  const toPreviewCanvasCoord = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / Math.max(1, rect.width)) * 340;
    const y = ((e.clientY - rect.top) / Math.max(1, rect.height)) * 196;
    return { x, y };
  };

  const handleCanvasDirectPick = (hit: Solid3DSceneHit) => {
    if (!schema.supportsConstructions) return;
    if (activeTab !== 'constructions') {
      setActiveTab('constructions');
    }

    if (constType === 'midpoint') {
      if (hit.kind === 'edge-midpoint') {
        const label = midpointLabel.trim() || 'M';
        const isMid = Math.abs(hit.ratio - 0.5) < 0.015;
        const next: Solid3DConstruction = isMid
          ? {
              id: makeConstructionId('mid'),
              kind: 'midpoint',
              fromVertex: hit.fromId,
              toVertex: hit.toId,
              label,
              color: constColor,
            }
          : {
              id: makeConstructionId('rat'),
              kind: 'ratio-point',
              fromPoint: hit.fromId,
              toPoint: hit.toId,
              ratio: hit.ratio,
              label,
              color: constColor,
            };
        setConstructions((prev) => [...prev, next]);
        setMidpointLabel(nextPointLabel(label));
        setPointRatio(hit.ratio);
        setCustomRatioText(hit.ratioLabel);
        setLastCanvasHint(
          `Đã chèn điểm ${label} ∈ ${hit.fromLabel}${hit.toLabel} (k = ${hit.ratioLabel})`,
        );
      } else {
        setPointSource('two-points');
        if (pointFromId !== hit.id && pointToId !== hit.id) {
          setPointFromId(pointToId);
          setPointToId(hit.id);
        } else if (pointFromId === hit.id) {
          setPointToId(hit.id);
        } else {
          setPointFromId(hit.id);
        }
        setLastCanvasHint(`Đã chọn điểm ${hit.label} trên hình 3D`);
      }
      return;
    }

    if (constType === 'centroid') {
      if (hit.kind === 'point') {
        setCentroidSource('custom-points');
        setCustomCentroidPts((prev) => {
          if (prev.includes(hit.id)) {
            return prev.length > 2 ? prev.filter((id) => id !== hit.id) : prev;
          }
          const next = [...prev, hit.id];
          return next.length > 4 ? next.slice(next.length - 3) : next;
        });
        setLastCanvasHint(`Đã chọn đỉnh ${hit.label} cho tam giác / đa giác lấy trọng tâm`);
      }
      return;
    }

    if (constType === 'altitude') {
      if (hit.kind === 'point') {
        setAltitudeApex(hit.id);
        setLastCanvasHint(`Đặt đỉnh hạ đường cao từ ${hit.label}`);
      } else {
        setAltitudeFootTarget(`edge:${hit.fromId}:${hit.toId}`);
        setLastCanvasHint(`Hạ vuông góc xuống cạnh ${hit.fromLabel}${hit.toLabel}`);
      }
      return;
    }

    if (constType === 'plane') {
      if (hit.kind === 'point') {
        setPlanePoints((prev) => {
          if (prev.includes(hit.id)) {
            return prev.filter((id) => id !== hit.id);
          }
          if (prev.length >= 6) return [...prev.slice(1), hit.id];
          return [...prev, hit.id];
        });
        setLastCanvasHint(`Đã chọn điểm ${hit.label} vào mặt phẳng`);
      } else {
        // Bấm trực tiếp vào cạnh khi đang ở chế độ Mặt phẳng -> Tự tạo trung điểm trên cạnh đó và đưa vào Mặt phẳng!
        const newMidId = makeConstructionId('mid');
        const label = midpointLabel.trim() || 'M';
        const midConst: Solid3DConstruction = {
          id: newMidId,
          kind: 'midpoint',
          fromVertex: hit.fromId,
          toVertex: hit.toId,
          label,
          color: constColor,
        };
        setConstructions((prev) => [...prev, midConst]);
        setMidpointLabel(nextPointLabel(label));
        setPlanePoints((prev) =>
          prev.length >= 6 ? [...prev.slice(1), newMidId] : [...prev, newMidId],
        );
        setLastCanvasHint(
          `Đã tạo trung điểm ${label} trên cạnh ${hit.fromLabel}${hit.toLabel} & thêm vào mặt phẳng`,
        );
      }
      return;
    }

    if (constType === 'segment') {
      if (hit.kind === 'point') {
        if (segFrom !== hit.id) {
          setSegFrom(segTo);
          setSegTo(hit.id);
          setLastCanvasHint(`Chọn đoạn nối tới ${hit.label}`);
        }
      }
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      movedPx: 0,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const pt = toPreviewCanvasCoord(e);
    if (!dragRef.current.active) {
      const hit = hitTestSolid3DScene(previewSolidItem, pt.x, pt.y);
      setHoveredHit(hit);
      return;
    }
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    dragRef.current.movedPx += Math.hypot(dx, dy);
    if (dragRef.current.movedPx > 3) {
      setYaw((prev) => Math.round((prev + dx * 0.75 + 360) % 360));
      setPitch((prev) => Math.max(-60, Math.min(70, Math.round(prev + dy * 0.5))));
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const wasClick = dragRef.current.active && dragRef.current.movedPx <= 5;
    dragRef.current.active = false;
    if (wasClick) {
      const pt = toPreviewCanvasCoord(e);
      const hit = hitTestSolid3DScene(previewSolidItem, pt.x, pt.y);
      if (hit) {
        handleCanvasDirectPick(hit);
      }
    }
  };

  const handleAddMidpointOrPoint = () => {
    const label = midpointLabel.trim() || 'M';

    if (pointSource === 'face-point') {
      const face = schema.faces[facePointFaceIdx] ?? schema.faces[0];
      if (!face) return;
      const posPreset = FACE_POINT_POSITIONS[facePointPosIdx] ?? FACE_POINT_POSITIONS[0]!;
      const next: Solid3DConstruction = {
        id: makeConstructionId('pt'),
        kind: 'free-point',
        anchorPoints: face.vertices,
        weights: posPreset.weights.slice(0, face.vertices.length),
        label,
        color: constColor,
      };
      setConstructions((prev) => [...prev, next]);
      setMidpointLabel(nextPointLabel(label));
      return;
    }

    let fromId = pointFromId;
    let toId = pointToId;
    if (pointSource === 'edge') {
      const edge = primaryEdges[selectedEdgeIdx] ?? primaryEdges[0];
      if (!edge) return;
      fromId = edge.from;
      toId = edge.to;
    }
    if (!fromId || !toId || fromId === toId) return;

    const isExactMidpoint = Math.abs(pointRatio - 0.5) < 0.01;
    const next: Solid3DConstruction = isExactMidpoint
      ? {
          id: makeConstructionId('mid'),
          kind: 'midpoint',
          fromVertex: fromId,
          toVertex: toId,
          label,
          color: constColor,
        }
      : {
          id: makeConstructionId('rat'),
          kind: 'ratio-point',
          fromPoint: fromId,
          toPoint: toId,
          ratio: pointRatio,
          label,
          color: constColor,
        };

    setConstructions((prev) => [...prev, next]);
    setMidpointLabel(nextPointLabel(label));
  };

  const handleAddCentroid = () => {
    const vertices =
      centroidSource === 'custom-points' && customCentroidPts.length >= 3
        ? customCentroidPts
        : (schema.faces[selectedFaceIdx] ?? schema.faces[0])?.vertices;
    if (!vertices || vertices.length < 2) return;

    const label = centroidLabel.trim() || 'G';
    const next: Solid3DConstruction = {
      id: makeConstructionId('cen'),
      kind: 'centroid',
      vertices,
      label,
      color: constColor,
      showMedians: centroidShowMedians,
    };
    setConstructions((prev) => [...prev, next]);
    setCentroidLabel(label === 'G' ? 'G₁' : label === 'G₁' ? 'G₂' : 'O₁');
  };

  const handleAddAltitude = () => {
    const apex = altitudeApex || primaryVertices[0]?.id;
    if (!apex) return;

    let footTarget = altitudeFootTarget || 'base-plane';
    let targetEdgeTo: string | undefined;
    if (footTarget.startsWith('edge:')) {
      const parts = footTarget.split(':');
      footTarget = parts[1] ?? 'A';
      targetEdgeTo = parts[2] ?? 'B';
    }

    const footLbl = altitudeFootLabel.trim() || 'H';
    const next: Solid3DConstruction = {
      id: makeConstructionId('alt'),
      kind: 'altitude',
      apexVertex: apex,
      footTarget,
      targetEdgeTo,
      footLabel: footLbl,
      showRightAngle: true,
      color: constColor,
    };
    setConstructions((prev) => [...prev, next]);
    setAltitudeFootLabel(footLbl === 'H' ? 'K' : footLbl === 'K' ? 'H₁' : 'H');
  };

  const handleAddPlane = (overridePoints?: readonly string[], overrideLabel?: string) => {
    const pts = overridePoints ?? planePoints;
    const uniquePts = Array.from(new Set(pts)).filter((pid) =>
      selectablePoints.some((sp) => sp.id === pid),
    );
    if (uniquePts.length < 3) return;

    const next: Solid3DConstruction = {
      id: makeConstructionId('pln'),
      kind: 'plane',
      points: uniquePts,
      label: (overrideLabel ?? planeLabel).trim(),
      color: constColor,
      fillOpacity: planeOpacity,
      borderStyle: planeBorderStyle,
      showPlaneArc: planeShowArc,
    };
    setConstructions((prev) => [...prev, next]);
    setPlaneLabel((prev) => (prev === 'α' ? 'β' : prev === 'β' ? 'P' : 'Q'));
  };

  const handleAddSegment = () => {
    if (!segFrom || !segTo || segFrom === segTo) return;
    const next: Solid3DConstruction = {
      id: makeConstructionId('seg'),
      kind: 'segment',
      fromPoint: segFrom,
      toPoint: segTo,
      style: segStyle,
      color: constColor,
    };
    setConstructions((prev) => [...prev, next]);
  };

  // Các mẫu mặt phẳng / thiết diện 1 chạm thông minh theo từng hình khối + các điểm vừa dựng
  const quickPlaneTemplates = useMemo(() => {
    const list: {
      readonly label: string;
      readonly points: readonly string[];
      readonly tag: string;
    }[] = [];
    const constructedOnly = constructions.filter(
      (
        c,
      ): c is Exclude<
        Solid3DConstruction,
        { readonly kind: 'segment' } | { readonly kind: 'plane' }
      > => c.kind !== 'segment' && c.kind !== 'plane',
    );
    if (constructedOnly.length >= 3) {
      const topPts = constructedOnly.slice(-4);
      const names = topPts.map((c) => (c.kind === 'altitude' ? c.footLabel : c.label)).join('');
      list.push({
        label: `Thiết diện (${names})`,
        points: topPts.map((c) => c.id),
        tag: `(${names})`,
      });
    }
    if (preset === 'pyramid-quad') {
      list.push(
        { label: 'Mặt chéo (SAC)', points: ['S', 'A', 'C'], tag: 'α' },
        { label: 'Mặt chéo (SBD)', points: ['S', 'B', 'D'], tag: 'β' },
        { label: 'Mặt đáy (ABCD)', points: ['A', 'B', 'C', 'D'], tag: 'P' },
      );
    } else if (preset === 'pyramid-tri') {
      list.push(
        { label: 'Mặt đáy (ABC)', points: ['A', 'B', 'C'], tag: 'α' },
        { label: 'Mặt bên (SBC)', points: ['S', 'B', 'C'], tag: 'β' },
      );
    } else if (preset === 'box') {
      list.push(
        { label: "Mặt chéo (ACC'A')", points: ['A', 'C', 'C1', 'A1'], tag: 'α' },
        { label: "Thiết diện (AB'D')", points: ['A', 'B1', 'D1'], tag: 'β' },
      );
    } else if (preset === 'prism-tri') {
      list.push(
        { label: "Mặt bên (ABB'A')", points: ['A', 'B', 'B1', 'A1'], tag: 'α' },
        { label: "Thiết diện (A'BC)", points: ['A1', 'B', 'C'], tag: 'β' },
      );
    } else if (preset === 'oxyz') {
      list.push(
        { label: 'Mặt phẳng chắn (XYZ)', points: ['X', 'Y', 'Z'], tag: 'α' },
        { label: 'Mặt phẳng (Oxy)', points: ['O', 'X', 'Y'], tag: 'Oxy' },
      );
    } else if (preset === 'plane-alpha') {
      list.push(
        { label: 'Mặt phẳng (α)', points: ['A', 'B', 'C', 'D'], tag: 'α' },
        { label: 'Mặt phẳng vuông góc (SHM)', points: ['S', 'H', 'M'], tag: 'β' },
      );
    }
    return list;
  }, [constructions, preset]);

  const handleApplyAlternativeNaming = () => {
    const altMap: Record<string, string> = {
      S: 'P',
      A: 'M',
      B: 'N',
      C: 'Q',
      D: 'R',
      A1: "M'",
      B1: "N'",
      C1: "Q'",
      D1: "R'",
    };
    const next: Record<string, string> = {};
    for (const v of schema.vertices) {
      if (altMap[v.id]) next[v.id] = altMap[v.id]!;
    }
    setShowLabels(true);
    setCustomLabels(next);
  };

  const handleConfirm = () => {
    const payload: Omit<Ink3DSolidItem, 'id' | 'x' | 'y'> = {
      preset,
      width: sizePx,
      height: Math.round(sizePx * 0.92),
      yaw,
      pitch,
      color,
      lineWidth: 2,
      showLabels,
      showAuxLines,
      dashedHidden,
      customLabels,
      constructions,
    };

    if (isEditing && initialSolid && onUpdateExisting) {
      onUpdateExisting(initialSolid.id, payload);
    } else {
      onInsert(payload);
    }
    onClose();
  };

  const describeConstruction = (c: Solid3DConstruction): string => {
    const lbl = (id: string) => {
      const found = selectablePoints.find((p) => p.id === id);
      return found?.label ?? id;
    };
    if (c.kind === 'midpoint')
      return `Trung điểm ${c.label} (${lbl(c.fromVertex)}${lbl(c.toVertex)})`;
    if (c.kind === 'ratio-point') {
      const pct =
        Math.abs(c.ratio - 1 / 3) < 0.02
          ? '1/3'
          : Math.abs(c.ratio - 2 / 3) < 0.02
            ? '2/3'
            : Math.abs(c.ratio - 0.25) < 0.02
              ? '1/4'
              : Math.abs(c.ratio - 0.75) < 0.02
                ? '3/4'
                : c.ratio.toFixed(2);
      return `Điểm ${c.label} ∈ ${lbl(c.fromPoint)}${lbl(c.toPoint)} (k=${pct})`;
    }
    if (c.kind === 'free-point') {
      return `Điểm ${c.label} ∈ (${c.anchorPoints.map(lbl).join('')})`;
    }
    if (c.kind === 'centroid') return `Trọng tâm ${c.label} (${c.vertices.map(lbl).join('')})`;
    if (c.kind === 'altitude') {
      const footDesc =
        c.footTarget === 'base-plane'
          ? 'đáy'
          : c.targetEdgeTo
            ? `${lbl(c.footTarget)}${lbl(c.targetEdgeTo)}`
            : lbl(c.footTarget);
      return `Đường cao ${lbl(c.apexVertex)}${c.footLabel} ⊥ ${footDesc}`;
    }
    if (c.kind === 'plane') {
      const ptsName = c.points.map(lbl).join('');
      const tag = c.label?.trim() ? ` [${c.label.trim()}]` : '';
      return `Mặt phẳng (${ptsName})${tag}`;
    }
    return `Đoạn ${lbl(c.fromPoint)}${lbl(c.toPoint)} (${c.style === 'dashed' ? 'đứt' : 'liền'})`;
  };

  return (
    <div
      data-testid="solid-3d-popover"
      className="w-[min(94vw,416px)] space-y-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 text-[var(--text-main)] shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Box className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
          <h3 className="font-serif text-sm font-semibold">
            {isEditing ? 'Chỉnh sửa Hình Không Gian 3D' : 'Tạo Hình Không Gian 3D & Mặt Phẳng'}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng bảng hình không gian 3D"
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* 9 mẫu khối & mặt phẳng chuẩn */}
      <div className="grid grid-cols-3 gap-1.5">
        {SOLID_3D_PRESETS.map((item) => (
          <button
            key={item.kind}
            type="button"
            data-testid={`solid-preset-${item.kind}`}
            onClick={() => handleSelectPreset(item.kind)}
            title={item.name}
            className={cn(
              'cursor-pointer rounded-lg border px-1.5 py-1.5 text-center font-mono text-[10px] font-semibold transition-colors',
              preset === item.kind
                ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
            )}
          >
            {item.shortName}
          </button>
        ))}
      </div>

      {/* Khung xem trước kéo xoay 3D + Bấm trực tiếp lên đỉnh/cạnh kiểu GeoGebra */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-hairline)]">
        <canvas
          ref={previewCanvasRef}
          data-testid="solid-3d-preview-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerLeave={() => setHoveredHit(null)}
          className={cn(
            'h-[196px] w-full touch-none',
            hoveredHit ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing',
          )}
        />
        {hoveredHit && (
          <div className="pointer-events-none absolute top-2 left-2 rounded-md border border-[var(--accent-os)]/30 bg-[var(--bg-workspace)]/90 px-2 py-0.5 font-mono text-[10px] font-semibold text-[var(--accent-os)] shadow-sm">
            {hoveredHit.kind === 'point'
              ? `Đỉnh/Điểm ${hoveredHit.label} — Bấm để chọn`
              : `Cạnh ${hoveredHit.fromLabel}${hoveredHit.toLabel} · k = ${hoveredHit.ratioLabel} — Bấm để chèn điểm ngay`}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 font-mono text-[10px] text-[var(--text-muted)]">
          <span className="truncate">
            {lastCanvasHint ?? 'Kéo để xoay 360° · Bấm đỉnh/cạnh để dựng nhanh'}
          </span>
          <span className="shrink-0 pl-2">
            {yaw}°/{pitch}° · {sizePx}px
          </span>
        </div>
      </div>

      {/* 3 Tab tính năng: Cơ bản | Tên đỉnh | Dựng hình (Điểm, Trọng tâm, Đường cao, Mặt phẳng, Nối đoạn) */}
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5 text-[11px] font-semibold">
        <button
          type="button"
          data-testid="solid-tab-basic"
          onClick={() => setActiveTab('basic')}
          className={cn(
            'cursor-pointer rounded-md py-1 transition-colors',
            activeTab === 'basic'
              ? 'bg-[var(--accent-os)] text-white'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
          )}
        >
          Góc & Cỡ
        </button>
        <button
          type="button"
          data-testid="solid-tab-labels"
          onClick={() => setActiveTab('labels')}
          className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-1 rounded-md py-1 transition-colors',
            activeTab === 'labels'
              ? 'bg-[var(--accent-os)] text-white'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
          )}
        >
          <Tag className="h-3 w-3" aria-hidden="true" />
          <span>Tên đỉnh</span>
        </button>
        <button
          type="button"
          data-testid="solid-tab-constructions"
          disabled={!schema.supportsConstructions}
          onClick={() => setActiveTab('constructions')}
          className={cn(
            'inline-flex cursor-pointer items-center justify-center gap-1 rounded-md py-1 transition-colors disabled:opacity-40',
            activeTab === 'constructions'
              ? 'bg-[var(--accent-os)] text-white'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]',
          )}
        >
          <Compass className="h-3 w-3" aria-hidden="true" />
          <span>Dựng hình ({constructions.length})</span>
        </button>
      </div>

      {/* NỘI DUNG TAB 1: GÓC XOAY, KÍCH THƯỚC & HIỂN THỊ */}
      {activeTab === 'basic' && (
        <div className="space-y-2.5">
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <label className="space-y-1">
              <span className="flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
                <span>Ngang</span>
                <span>{yaw}°</span>
              </span>
              <input
                type="range"
                min={0}
                max={359}
                value={yaw}
                onChange={(e) => setYaw(Number(e.target.value))}
                className="w-full accent-[var(--accent-os)]"
              />
            </label>
            <label className="space-y-1">
              <span className="flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
                <span>Nghiêng</span>
                <span>{pitch}°</span>
              </span>
              <input
                type="range"
                min={-45}
                max={65}
                value={pitch}
                onChange={(e) => setPitch(Number(e.target.value))}
                className="w-full accent-[var(--accent-os)]"
              />
            </label>
            <label className="space-y-1">
              <span className="flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
                <span>Thu/Phóng</span>
                <span>{sizePx}</span>
              </span>
              <input
                type="range"
                data-testid="solid-size-slider"
                min={160}
                max={520}
                step={10}
                value={sizePx}
                onChange={(e) => setSizePx(Number(e.target.value))}
                className="w-full accent-[var(--accent-os)]"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                data-testid="solid-show-labels-toggle"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="accent-[var(--accent-os)]"
              />
              <span>Hiện tên đỉnh</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={showAuxLines}
                onChange={(e) => setShowAuxLines(e.target.checked)}
                className="accent-[var(--accent-os)]"
              />
              <span>Đường chéo / tâm</span>
            </label>
            <label className="inline-flex cursor-pointer items-center gap-1.5">
              <input
                type="checkbox"
                checked={dashedHidden}
                onChange={(e) => setDashedHidden(e.target.checked)}
                className="accent-[var(--accent-os)]"
              />
              <span>Nét đứt khuất</span>
            </label>
          </div>
        </div>
      )}

      {/* NỘI DUNG TAB 2: TÙY CHỈNH TÊN TỪNG ĐỈNH HOẶC HÌNH KHÔNG TÊN */}
      {activeTab === 'labels' && (
        <div data-testid="solid-labels-panel" className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              data-testid="solid-blank-labels-btn"
              onClick={() => setShowLabels((prev) => !prev)}
              className={cn(
                'cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors',
                !showLabels
                  ? 'border-[var(--accent-heritage)] bg-[#FDF8F3] text-[#8C5828] dark:bg-[#1D1813] dark:text-[#D4AF6A]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]',
              )}
            >
              {showLabels ? 'Tắt tên (Hình trơn tự viết)' : 'Đang ẩn tên — Bấm để hiện lại'}
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleApplyAlternativeNaming}
                className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 font-mono text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              >
                M, N, P, Q
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLabels(true);
                  setCustomLabels({});
                }}
                className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 font-mono text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
              >
                Mặc định
              </button>
            </div>
          </div>

          {showLabels ? (
            <div className="grid grid-cols-4 gap-1.5">
              {schema.vertices.map((v) => {
                const value = resolveSolidVertexLabel(v.id, v.label, customLabels);
                return (
                  <label key={v.id} className="space-y-0.5">
                    <span className="block font-mono text-[9.5px] text-[var(--text-muted)]">
                      Đỉnh {v.label}
                    </span>
                    <input
                      type="text"
                      maxLength={5}
                      data-testid={`solid-vertex-input-${v.id}`}
                      value={value}
                      onChange={(e) =>
                        setCustomLabels((prev) => ({ ...prev, [v.id]: e.target.value }))
                      }
                      aria-label={`Tên đỉnh ${v.label}`}
                      className="w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-center font-serif text-xs font-semibold text-[var(--text-main)] italic focus:border-[var(--accent-os)] focus:outline-none"
                    />
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-2 text-xs text-[var(--text-secondary)]">
              Hình sẽ được chèn <strong>không có tên đỉnh</strong> để bạn dùng bút viết tay ký hiệu
              trực tiếp theo đề bài.
            </p>
          )}
        </div>
      )}

      {/* NỘI DUNG TAB 3: DỰNG ĐIỂM / TRUNG ĐIỂM, TRỌNG TÂM, ĐƯỜNG CAO, MẶT PHẲNG & ĐOẠN NỐI */}
      {activeTab === 'constructions' && schema.supportsConstructions && (
        <div data-testid="solid-constructions-panel" className="space-y-2.5">
          <div className="grid grid-cols-5 gap-1">
            {(
              [
                { id: 'midpoint', label: 'Trung điểm' },
                { id: 'centroid', label: 'Trọng tâm' },
                { id: 'altitude', label: 'Đường cao' },
                { id: 'plane', label: 'Mặt phẳng' },
                { id: 'segment', label: 'Nối đoạn' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`const-mode-${t.id}`}
                onClick={() => setConstType(t.id)}
                className={cn(
                  'cursor-pointer rounded-md border py-1 font-mono text-[10px] font-semibold transition-colors',
                  constType === t.id
                    ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 1. Chèn Điểm: Trung điểm cạnh, Điểm chia tỉ lệ k (1/3, 2/3, 1/4...) hoặc Điểm thuộc mặt */}
          {constType === 'midpoint' && (
            <div className="space-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/55 p-2">
              <div className="grid grid-cols-3 gap-1">
                {(
                  [
                    { id: 'edge', label: 'Trên cạnh gốc' },
                    { id: 'two-points', label: 'Giữa 2 điểm' },
                    { id: 'face-point', label: 'Thuộc mặt' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    data-testid={`point-source-${mode.id}`}
                    onClick={() => setPointSource(mode.id)}
                    className={cn(
                      'cursor-pointer rounded border py-0.5 text-[10px] font-medium transition-colors',
                      pointSource === mode.id
                        ? 'border-[var(--accent-os)] bg-[var(--accent-os)]/12 font-semibold text-[var(--accent-os)]'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
                    )}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {pointSource === 'edge' && (
                  <select
                    aria-label="Chọn cạnh lấy trung điểm"
                    value={selectedEdgeIdx}
                    onChange={(e) => setSelectedEdgeIdx(Number(e.target.value))}
                    className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
                  >
                    {primaryEdges.map((edge, idx) => {
                      const aLbl =
                        selectablePoints.find((p) => p.id === edge.from)?.label ?? edge.from;
                      const bLbl = selectablePoints.find((p) => p.id === edge.to)?.label ?? edge.to;
                      return (
                        <option key={`${edge.from}-${edge.to}`} value={idx}>
                          Cạnh {aLbl}
                          {bLbl}
                        </option>
                      );
                    })}
                  </select>
                )}

                {pointSource === 'two-points' && (
                  <>
                    <select
                      aria-label="Điểm đầu đoạn chia"
                      value={pointFromId}
                      onChange={(e) => setPointFromId(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
                    >
                      {selectablePoints.map((p) => (
                        <option key={p.id} value={p.id}>
                          Từ {p.label}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="Điểm cuối đoạn chia"
                      value={pointToId}
                      onChange={(e) => setPointToId(e.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
                    >
                      {selectablePoints.map((p) => (
                        <option key={p.id} value={p.id}>
                          Tới {p.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                {pointSource === 'face-point' && (
                  <>
                    <select
                      aria-label="Chọn mặt phẳng chứa điểm"
                      value={facePointFaceIdx}
                      onChange={(e) => setFacePointFaceIdx(Number(e.target.value))}
                      className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
                    >
                      {schema.faces.map((f, idx) => (
                        <option key={f.id} value={idx}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <select
                      aria-label="Vị trí điểm trong mặt"
                      value={facePointPosIdx}
                      onChange={(e) => setFacePointPosIdx(Number(e.target.value))}
                      className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
                    >
                      {FACE_POINT_POSITIONS.map((pos, idx) => (
                        <option key={pos.id} value={idx}>
                          {pos.label}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <input
                  type="text"
                  maxLength={4}
                  value={midpointLabel}
                  onChange={(e) => setMidpointLabel(e.target.value)}
                  aria-label="Tên trung điểm"
                  placeholder="Tên (M)"
                  className="w-14 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-center font-serif text-xs font-semibold italic"
                />
                <button
                  type="button"
                  data-testid="add-midpoint-btn"
                  onClick={handleAddMidpointOrPoint}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-2.5 py-1 text-xs font-semibold text-white"
                >
                  <Plus className="h-3 w-3" />
                  <span>Thêm</span>
                </button>
              </div>

              {pointSource !== 'face-point' && (
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">Tỉ số k:</span>
                    <div className="flex items-center gap-1">
                      {RATIO_PRESETS.map((r) => {
                        const active = Math.abs(pointRatio - r.value) < 0.02;
                        return (
                          <button
                            key={r.label}
                            type="button"
                            data-testid={`point-ratio-${r.label.split(' ')[0]}`}
                            onClick={() => {
                              setPointRatio(r.value);
                              setCustomRatioText(formatRatioLabel(r.value));
                            }}
                            className={cn(
                              'cursor-pointer rounded border px-1.5 py-0.5 font-mono text-[10px]',
                              active
                                ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                                : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
                            )}
                          >
                            {r.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      aria-label="Thanh trượt tỉ số chia cạnh"
                      min={0.05}
                      max={0.95}
                      step={0.01}
                      value={pointRatio}
                      onChange={(e) => {
                        const nextVal = Number(e.target.value);
                        setPointRatio(nextVal);
                        setCustomRatioText(formatRatioLabel(nextVal));
                      }}
                      className="min-w-0 flex-1 accent-[var(--accent-os)]"
                    />
                    <input
                      type="text"
                      aria-label="Nhập tỉ số tùy chỉnh (VD: 1/5, 2/7, 0.35)"
                      data-testid="solid-ratio-custom-input"
                      value={customRatioText}
                      onChange={(e) => setCustomRatioText(e.target.value)}
                      onBlur={() => {
                        const parsed = parseRatioInput(customRatioText);
                        if (parsed !== null) {
                          setPointRatio(parsed);
                          setCustomRatioText(formatRatioLabel(parsed));
                        } else {
                          setCustomRatioText(formatRatioLabel(pointRatio));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const parsed = parseRatioInput(customRatioText);
                          if (parsed !== null) {
                            setPointRatio(parsed);
                            setCustomRatioText(formatRatioLabel(parsed));
                          }
                        }
                      }}
                      placeholder="1/5"
                      className="w-14 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 text-center font-mono text-[10.5px]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Trọng tâm mặt / tam giác 3 điểm bất kỳ */}
          {constType === 'centroid' && (
            <div className="space-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/55 p-2">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setCentroidSource('face')}
                  className={cn(
                    'cursor-pointer rounded border py-0.5 text-[10px] font-medium',
                    centroidSource === 'face'
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)]/12 font-semibold text-[var(--accent-os)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
                  )}
                >
                  Theo mặt có sẵn
                </button>
                <button
                  type="button"
                  data-testid="centroid-source-custom"
                  onClick={() => setCentroidSource('custom-points')}
                  className={cn(
                    'cursor-pointer rounded border py-0.5 text-[10px] font-medium',
                    centroidSource === 'custom-points'
                      ? 'border-[var(--accent-os)] bg-[var(--accent-os)]/12 font-semibold text-[var(--accent-os)]'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
                  )}
                >
                  Chọn 3–4 điểm bất kỳ
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {centroidSource === 'face' ? (
                  <select
                    aria-label="Chọn mặt lấy trọng tâm"
                    value={selectedFaceIdx}
                    onChange={(e) => setSelectedFaceIdx(Number(e.target.value))}
                    className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
                  >
                    {schema.faces.map((face, idx) => (
                      <option key={face.id} value={idx}>
                        {face.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                    {selectablePoints.map((p) => {
                      const picked = customCentroidPts.includes(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() =>
                            setCustomCentroidPts((prev) =>
                              prev.includes(p.id)
                                ? prev.length > 2
                                  ? prev.filter((id) => id !== p.id)
                                  : prev
                                : [...prev, p.id],
                            )
                          }
                          className={cn(
                            'cursor-pointer rounded border px-1.5 py-0.5 font-serif text-[11px] font-semibold italic',
                            picked
                              ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                              : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)]',
                          )}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                <input
                  type="text"
                  maxLength={4}
                  value={centroidLabel}
                  onChange={(e) => setCentroidLabel(e.target.value)}
                  aria-label="Tên trọng tâm"
                  placeholder="Tên (G)"
                  className="w-14 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-center font-serif text-xs font-semibold italic"
                />
                <button
                  type="button"
                  data-testid="add-centroid-btn"
                  onClick={handleAddCentroid}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-2.5 py-1 text-xs font-semibold text-white"
                >
                  <Plus className="h-3 w-3" />
                  <span>Thêm</span>
                </button>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={centroidShowMedians}
                  onChange={(e) => setCentroidShowMedians(e.target.checked)}
                  className="accent-[var(--accent-os)]"
                />
                <span>Tự động kẻ đường trung tuyến / hai đường chéo nét đứt</span>
              </label>
            </div>
          )}

          {/* 3. Đường cao & Hình chiếu vuông góc (lên mặt đáy, lên cạnh AB hoặc tới điểm) */}
          {constType === 'altitude' && (
            <div className="space-y-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/55 p-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  aria-label="Đỉnh hạ đường cao"
                  value={altitudeApex}
                  onChange={(e) => setAltitudeApex(e.target.value)}
                  className="w-20 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
                >
                  {selectablePoints.map((p) => (
                    <option key={p.id} value={p.id}>
                      Từ {p.label}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Chân đường cao"
                  value={altitudeFootTarget}
                  onChange={(e) => setAltitudeFootTarget(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
                >
                  <option value="base-plane">⊥ Mặt đáy (chiếu đứng)</option>
                  <optgroup label="Chiếu vuông góc lên cạnh">
                    {primaryEdges
                      .filter((e) => e.from !== altitudeApex && e.to !== altitudeApex)
                      .map((e) => {
                        const aLbl = selectablePoints.find((p) => p.id === e.from)?.label ?? e.from;
                        const bLbl = selectablePoints.find((p) => p.id === e.to)?.label ?? e.to;
                        return (
                          <option key={`edge:${e.from}:${e.to}`} value={`edge:${e.from}:${e.to}`}>
                            ⊥ Cạnh {aLbl}
                            {bLbl}
                          </option>
                        );
                      })}
                  </optgroup>
                  <optgroup label="Tới điểm đã có">
                    {selectablePoints
                      .filter((p) => p.id !== altitudeApex)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          Tới điểm {p.label}
                        </option>
                      ))}
                  </optgroup>
                </select>
                <input
                  type="text"
                  maxLength={4}
                  value={altitudeFootLabel}
                  onChange={(e) => setAltitudeFootLabel(e.target.value)}
                  aria-label="Tên chân đường cao"
                  className="w-12 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-1 text-center font-serif text-xs font-semibold italic"
                />
                <button
                  type="button"
                  data-testid="add-altitude-btn"
                  onClick={handleAddAltitude}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-2.5 py-1 text-xs font-semibold text-white"
                >
                  <Plus className="h-3 w-3" />
                  <span>Dựng</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Chèn Mặt phẳng & Thiết diện tô màu bán trong suốt (kiểu GeoGebra 3D) */}
          {constType === 'plane' && (
            <div className="space-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/55 p-2">
              {quickPlaneTemplates.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="inline-flex items-center gap-0.5 font-mono text-[9.5px] text-[var(--text-muted)]">
                    <Sparkles className="h-2.5 w-2.5 text-[var(--accent-os)]" />
                    <span>Mẫu nhanh:</span>
                  </span>
                  {quickPlaneTemplates.map((tpl) => (
                    <button
                      key={tpl.label}
                      type="button"
                      onClick={() => {
                        setPlanePoints([...tpl.points]);
                        handleAddPlane(tpl.points, tpl.tag);
                      }}
                      className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 font-mono text-[10px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent-os)] hover:text-[var(--accent-os)]"
                    >
                      + {tpl.label}
                    </button>
                  ))}
                </div>
              )}

              <div>
                <div className="mb-1 flex items-center justify-between text-[10px]">
                  <span className="font-mono text-[var(--text-muted)]">
                    Chọn 3–6 điểm (hoặc bấm đỉnh/cạnh trên hình 3D):
                  </span>
                  <span className="font-mono font-semibold text-[var(--accent-os)]">
                    (
                    {planePoints
                      .map((id) => selectablePoints.find((p) => p.id === id)?.label ?? id)
                      .join('')}
                    )
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {selectablePoints.map((p) => {
                    const orderIdx = planePoints.indexOf(p.id);
                    const picked = orderIdx !== -1;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        data-testid={`plane-point-chip-${p.id}`}
                        onClick={() =>
                          setPlanePoints((prev) =>
                            prev.includes(p.id)
                              ? prev.filter((id) => id !== p.id)
                              : prev.length >= 6
                                ? [...prev.slice(1), p.id]
                                : [...prev, p.id],
                          )
                        }
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-1 rounded-md border px-2 py-0.5 font-serif text-xs font-semibold italic transition-colors',
                          picked
                            ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                            : 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] hover:text-[var(--text-main)]',
                        )}
                      >
                        <span>{p.label}</span>
                        {picked && (
                          <span className="font-mono text-[9px] not-italic opacity-80">
                            {orderIdx + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <input
                  type="text"
                  maxLength={6}
                  data-testid="plane-label-input"
                  value={planeLabel}
                  onChange={(e) => setPlaneLabel(e.target.value)}
                  aria-label="Nhãn góc mặt phẳng"
                  placeholder="Nhãn (α)"
                  className="w-14 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-1 text-center font-serif text-xs font-semibold italic"
                />
                <select
                  aria-label="Kiểu viền mặt phẳng"
                  value={planeBorderStyle}
                  onChange={(e) =>
                    setPlaneBorderStyle(e.target.value as 'auto' | 'solid' | 'dashed')
                  }
                  className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
                >
                  <option value="auto">Viền tự động</option>
                  <option value="solid">Viền liền</option>
                  <option value="dashed">Viền đứt</option>
                </select>
                <label
                  title="Độ đậm màu tô mặt phẳng"
                  className="flex min-w-0 flex-1 items-center gap-1 font-mono text-[10px] text-[var(--text-muted)]"
                >
                  <span>Đậm</span>
                  <input
                    type="range"
                    min={0.1}
                    max={0.42}
                    step={0.04}
                    value={planeOpacity}
                    onChange={(e) => setPlaneOpacity(Number(e.target.value))}
                    className="min-w-0 flex-1 accent-[var(--accent-os)]"
                  />
                </label>
                <label className="inline-flex cursor-pointer items-center gap-1 font-mono text-[10px] text-[var(--text-secondary)]">
                  <input
                    type="checkbox"
                    checked={planeShowArc}
                    onChange={(e) => setPlaneShowArc(e.target.checked)}
                    className="accent-[var(--accent-os)]"
                  />
                  <span>Cung góc</span>
                </label>
                <button
                  type="button"
                  data-testid="add-plane-btn"
                  disabled={planePoints.length < 3}
                  onClick={() => handleAddPlane()}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-40"
                >
                  <Layers className="h-3 w-3" />
                  <span>Chèn MP</span>
                </button>
              </div>
            </div>
          )}

          {/* 5. Nối đoạn phụ / Giao tuyến giữa 2 điểm bất kỳ */}
          {constType === 'segment' && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/55 p-2">
              <select
                aria-label="Điểm đầu đoạn nối"
                value={segFrom}
                onChange={(e) => setSegFrom(e.target.value)}
                className="w-20 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
              >
                {selectablePoints.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <span className="text-xs text-[var(--text-muted)]">—</span>
              <select
                aria-label="Điểm cuối đoạn nối"
                value={segTo}
                onChange={(e) => setSegTo(e.target.value)}
                className="w-20 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
              >
                {selectablePoints.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Kiểu nét đoạn nối"
                value={segStyle}
                onChange={(e) => setSegStyle(e.target.value as 'solid' | 'dashed')}
                className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-2 py-1 text-xs"
              >
                <option value="dashed">Nét đứt</option>
                <option value="solid">Nét liền</option>
              </select>
              <button
                type="button"
                data-testid="add-segment-btn"
                onClick={handleAddSegment}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-2.5 py-1 text-xs font-semibold text-white"
              >
                <Plus className="h-3 w-3" />
                <span>Nối</span>
              </button>
            </div>
          )}

          {/* Chọn màu nét dựng phụ + Danh sách yếu tố đã dựng */}
          <div className="flex items-center justify-between gap-2 text-[10.5px]">
            <span className="font-mono text-[var(--text-muted)]">Màu điểm & mặt phẳng:</span>
            <div className="flex items-center gap-1.5">
              {CONSTRUCTION_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setConstColor(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    'h-4 w-4 cursor-pointer rounded-full',
                    constColor === c && 'ring-2 ring-[var(--accent-os)] ring-offset-1',
                  )}
                />
              ))}
            </div>
          </div>

          {constructions.length > 0 && (
            <div className="max-h-28 space-y-1 overflow-y-auto pr-0.5">
              {constructions.map((c) => (
                <div
                  key={c.id}
                  data-testid="solid-construction-chip"
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-[11px]"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: c.color ?? '#DC2626' }}
                    />
                    <span className="truncate">{describeConstruction(c)}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Xóa ${describeConstruction(c)}`}
                    onClick={() =>
                      setConstructions((prev) => prev.filter((item) => item.id !== c.id))
                    }
                    className="cursor-pointer text-[var(--text-muted)] hover:text-[#8F3D35]"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hàng đáy: Chọn màu khối chính + Xác nhận */}
      <div className="flex items-center justify-between gap-2 border-t border-[var(--border-hairline)] pt-2.5">
        <div className="flex items-center gap-1.5">
          {SOLID_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Chọn màu ${c}`}
              style={{ backgroundColor: c }}
              className={cn(
                'h-5 w-5 cursor-pointer rounded-full border transition-transform hover:scale-110',
                color === c
                  ? 'ring-2 ring-[var(--accent-os)] ring-offset-1'
                  : 'border-[var(--border-hairline)]',
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Đặt lại góc mặc định"
            onClick={() => handleSelectPreset(preset)}
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-main)]"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-testid="insert-solid-3d-confirm"
            onClick={handleConfirm}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--accent-os)] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-95"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isEditing ? 'Cập nhật hình' : 'Chèn vào trang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Solid3DPopover;
