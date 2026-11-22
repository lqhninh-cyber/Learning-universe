import { Box, Check, Compass, Plus, RotateCcw, Tag, Trash2, X } from 'lucide-react';
import {
  type FC,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  getSolidPresetSchema,
  renderSolid3DOnCanvas,
  resolveSolidVertexLabel,
  SOLID_3D_PRESETS,
  type Ink3DSolidItem,
  type Solid3DConstruction,
  type Solid3DPresetKind,
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

type SolidTab = 'basic' | 'labels' | 'constructions';
type ConstructionToolType = 'midpoint' | 'centroid' | 'altitude' | 'segment';

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
  const primaryEdges = useMemo(() => schema.edges.filter((e) => !e.aux), [schema.edges]);

  // Danh sách toàn bộ điểm có thể chọn (đỉnh gốc + các điểm đã dựng: trung điểm, trọng tâm, chân đường cao)
  const selectablePoints = useMemo(() => {
    const base = primaryVertices.map((v) => ({
      id: v.id,
      label: resolveSolidVertexLabel(v.id, v.label, customLabels) || v.label,
    }));
    const derived = constructions
      .filter((c): c is Exclude<Solid3DConstruction, { kind: 'segment' }> => c.kind !== 'segment')
      .map((c) => ({
        id: c.id,
        label: c.kind === 'altitude' ? c.footLabel : c.label,
      }));
    return [...base, ...derived];
  }, [constructions, customLabels, primaryVertices]);

  // State cho biểu mẫu dựng hình phụ
  const [selectedEdgeIdx, setSelectedEdgeIdx] = useState(0);
  const [midpointLabel, setMidpointLabel] = useState('M');
  const [selectedFaceIdx, setSelectedFaceIdx] = useState(0);
  const [centroidLabel, setCentroidLabel] = useState('G');
  const [altitudeApex, setAltitudeApex] = useState<string>(primaryVertices[0]?.id ?? 'S');
  const [altitudeFootTarget, setAltitudeFootTarget] = useState<string>('base-plane');
  const [altitudeFootLabel, setAltitudeFootLabel] = useState('H');
  const [segFrom, setSegFrom] = useState<string>(selectablePoints[0]?.id ?? 'S');
  const [segTo, setSegTo] = useState<string>(selectablePoints[1]?.id ?? 'A');
  const [segStyle, setSegStyle] = useState<'solid' | 'dashed'>('dashed');
  const [constColor, setConstColor] = useState<string>('#DC2626');

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ active: boolean; lastX: number; lastY: number }>({
    active: false,
    lastX: 0,
    lastY: 0,
  });

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

    renderSolid3DOnCanvas(ctx, {
      id: 'preview',
      preset,
      x: 24,
      y: 8,
      width: w - 48,
      height: h - 16,
      yaw,
      pitch,
      color,
      lineWidth: 2,
      showLabels,
      showAuxLines,
      dashedHidden,
      customLabels,
      constructions,
    });
  }, [
    color,
    constructions,
    customLabels,
    dashedHidden,
    pitch,
    preset,
    showAuxLines,
    showLabels,
    yaw,
  ]);

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
    const nextPrimary = nextSchema.vertices.filter((v) => !v.aux);
    setAltitudeApex(nextPrimary[0]?.id ?? 'S');
    setAltitudeFootTarget('base-plane');
    setSegFrom(nextPrimary[0]?.id ?? 'S');
    setSegTo(nextPrimary[1]?.id ?? 'A');
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
    setYaw((prev) => Math.round((prev + dx * 0.75 + 360) % 360));
    setPitch((prev) => Math.max(-60, Math.min(70, Math.round(prev + dy * 0.5))));
  };

  const handlePointerUp = () => {
    dragRef.current.active = false;
  };

  const handleAddMidpoint = () => {
    const edge = primaryEdges[selectedEdgeIdx] ?? primaryEdges[0];
    if (!edge) return;
    const label = midpointLabel.trim() || 'M';
    const next: Solid3DConstruction = {
      id: makeConstructionId('mid'),
      kind: 'midpoint',
      fromVertex: edge.from,
      toVertex: edge.to,
      label,
      color: constColor,
    };
    setConstructions((prev) => [...prev, next]);
    // Gợi ý tên điểm tiếp theo (M -> N -> P -> Q -> I -> K)
    const seq = ['M', 'N', 'P', 'Q', 'I', 'K', 'E', 'F'];
    const curIdx = seq.indexOf(label);
    setMidpointLabel(seq[(curIdx + 1) % seq.length]!);
  };

  const handleAddCentroid = () => {
    const face = schema.faces[selectedFaceIdx] ?? schema.faces[0];
    if (!face) return;
    const label = centroidLabel.trim() || 'G';
    const next: Solid3DConstruction = {
      id: makeConstructionId('cen'),
      kind: 'centroid',
      vertices: face.vertices,
      label,
      color: constColor,
    };
    setConstructions((prev) => [...prev, next]);
    setCentroidLabel(label === 'G' ? 'G₁' : label === 'G₁' ? 'G₂' : 'O₁');
  };

  const handleAddAltitude = () => {
    const apex = altitudeApex || primaryVertices[0]?.id;
    if (!apex) return;
    const next: Solid3DConstruction = {
      id: makeConstructionId('alt'),
      kind: 'altitude',
      apexVertex: apex,
      footTarget: altitudeFootTarget || 'base-plane',
      footLabel: altitudeFootLabel.trim() || 'H',
      showRightAngle: true,
      color: constColor,
    };
    setConstructions((prev) => [...prev, next]);
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
    if (c.kind === 'centroid') return `Trọng tâm ${c.label} (${c.vertices.map(lbl).join('')})`;
    if (c.kind === 'altitude') {
      const footDesc = c.footTarget === 'base-plane' ? 'đáy' : lbl(c.footTarget);
      return `Đường cao ${lbl(c.apexVertex)}${c.footLabel} ⊥ ${footDesc}`;
    }
    return `Đoạn ${lbl(c.fromPoint)}${lbl(c.toPoint)} (${c.style === 'dashed' ? 'đứt' : 'liền'})`;
  };

  return (
    <div
      data-testid="solid-3d-popover"
      className="w-[min(94vw,400px)] space-y-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 text-[var(--text-main)] shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Box className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
          <h3 className="font-serif text-sm font-semibold">
            {isEditing ? 'Chỉnh sửa Hình Không Gian 3D' : 'Tạo Hình Không Gian 3D'}
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

      {/* 8 mẫu khối chuẩn */}
      <div className="grid grid-cols-4 gap-1.5">
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

      {/* Khung xem trước kéo xoay 3D trực tiếp (nhãn góc đặt sạch dưới khung không che đỉnh B) */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-hairline)]">
        <canvas
          ref={previewCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-[196px] w-full cursor-grab touch-none active:cursor-grabbing"
        />
        <div className="flex items-center justify-between border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 font-mono text-[10px] text-[var(--text-muted)]">
          <span>Kéo trên hình để xoay 360°</span>
          <span>
            Góc: {yaw}° / {pitch}° · Cỡ {sizePx}px
          </span>
        </div>
      </div>

      {/* 3 Tab tính năng: Cơ bản | Tên đỉnh | Dựng hình (Trung điểm, Trọng tâm, Đường cao, Nối đoạn) */}
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

      {/* NỘI DUNG TAB 3: DỰNG TRUNG ĐIỂM, TRỌNG TÂM, ĐƯỜNG CAO & ĐOẠN NỐI */}
      {activeTab === 'constructions' && schema.supportsConstructions && (
        <div data-testid="solid-constructions-panel" className="space-y-2.5">
          <div className="grid grid-cols-4 gap-1">
            {(
              [
                { id: 'midpoint', label: 'Trung điểm' },
                { id: 'centroid', label: 'Trọng tâm' },
                { id: 'altitude', label: 'Đường cao' },
                { id: 'segment', label: 'Nối đoạn' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                data-testid={`const-mode-${t.id}`}
                onClick={() => setConstType(t.id)}
                className={cn(
                  'cursor-pointer rounded-md border py-1 font-mono text-[10px] font-semibold',
                  constType === t.id
                    ? 'border-[var(--accent-os)] bg-[var(--accent-os)] text-white'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* 1. Trung điểm cạnh */}
          {constType === 'midpoint' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <select
                aria-label="Chọn cạnh lấy trung điểm"
                value={selectedEdgeIdx}
                onChange={(e) => setSelectedEdgeIdx(Number(e.target.value))}
                className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-xs"
              >
                {primaryEdges.map((edge, idx) => {
                  const aLbl = selectablePoints.find((p) => p.id === edge.from)?.label ?? edge.from;
                  const bLbl = selectablePoints.find((p) => p.id === edge.to)?.label ?? edge.to;
                  return (
                    <option key={`${edge.from}-${edge.to}`} value={idx}>
                      Cạnh {aLbl}
                      {bLbl}
                    </option>
                  );
                })}
              </select>
              <input
                type="text"
                maxLength={4}
                value={midpointLabel}
                onChange={(e) => setMidpointLabel(e.target.value)}
                aria-label="Tên trung điểm"
                placeholder="Tên (M)"
                className="w-16 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-center font-serif text-xs font-semibold italic"
              />
              <button
                type="button"
                data-testid="add-midpoint-btn"
                onClick={handleAddMidpoint}
                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[var(--accent-os)] px-2.5 py-1 text-xs font-semibold text-white"
              >
                <Plus className="h-3 w-3" />
                <span>Thêm</span>
              </button>
            </div>
          )}

          {/* 2. Trọng tâm mặt / tam giác */}
          {constType === 'centroid' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <select
                aria-label="Chọn mặt lấy trọng tâm"
                value={selectedFaceIdx}
                onChange={(e) => setSelectedFaceIdx(Number(e.target.value))}
                className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-xs"
              >
                {schema.faces.map((face, idx) => (
                  <option key={face.id} value={idx}>
                    {face.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                maxLength={4}
                value={centroidLabel}
                onChange={(e) => setCentroidLabel(e.target.value)}
                aria-label="Tên trọng tâm"
                placeholder="Tên (G)"
                className="w-16 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-center font-serif text-xs font-semibold italic"
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
          )}

          {/* 3. Đường cao (có ký hiệu góc vuông 3D chuẩn) */}
          {constType === 'altitude' && (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                <select
                  aria-label="Đỉnh hạ đường cao"
                  value={altitudeApex}
                  onChange={(e) => setAltitudeApex(e.target.value)}
                  className="w-20 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-xs"
                >
                  {primaryVertices.map((v) => (
                    <option key={v.id} value={v.id}>
                      Từ {resolveSolidVertexLabel(v.id, v.label, customLabels)}
                    </option>
                  ))}
                </select>
                <select
                  aria-label="Chân đường cao"
                  value={altitudeFootTarget}
                  onChange={(e) => setAltitudeFootTarget(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-xs"
                >
                  <option value="base-plane">⊥ Mặt đáy (chiếu đứng)</option>
                  {selectablePoints
                    .filter((p) => p.id !== altitudeApex)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        Tới điểm {p.label}
                      </option>
                    ))}
                </select>
                <input
                  type="text"
                  maxLength={4}
                  value={altitudeFootLabel}
                  onChange={(e) => setAltitudeFootLabel(e.target.value)}
                  aria-label="Tên chân đường cao"
                  className="w-12 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-1 text-center font-serif text-xs font-semibold italic"
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

          {/* 4. Nối đoạn phụ / Thiết diện giữa 2 điểm bất kỳ */}
          {constType === 'segment' && (
            <div className="flex flex-wrap items-center gap-1.5">
              <select
                aria-label="Điểm đầu đoạn nối"
                value={segFrom}
                onChange={(e) => setSegFrom(e.target.value)}
                className="w-20 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-xs"
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
                className="w-20 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-xs"
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
                className="rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-1 text-xs"
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
            <span className="font-mono text-[var(--text-muted)]">Màu nét dựng:</span>
            <div className="flex items-center gap-1.5">
              {['#DC2626', '#1D4ED8', '#1B5E4A', '#D97706', '#111827'].map((c) => (
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
            <div className="max-h-24 space-y-1 overflow-y-auto pr-0.5">
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
