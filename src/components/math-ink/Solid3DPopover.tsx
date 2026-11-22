import { Box, Check, RotateCcw, X } from 'lucide-react';
import {
  type FC,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  renderSolid3DOnCanvas,
  SOLID_3D_PRESETS,
  type Ink3DSolidItem,
  type Solid3DPresetKind,
} from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

export interface Solid3DPopoverProps {
  readonly onInsert: (solid: Omit<Ink3DSolidItem, 'id' | 'x' | 'y'>) => void;
  readonly onClose: () => void;
}

const SOLID_COLORS = ['#111827', '#1D4ED8', '#DC2626', '#1B5E4A', '#9E763B', '#FFFFFF'] as const;

export const Solid3DPopover: FC<Solid3DPopoverProps> = ({ onInsert, onClose }) => {
  const [preset, setPreset] = useState<Solid3DPresetKind>('pyramid-quad');
  const [yaw, setYaw] = useState(32);
  const [pitch, setPitch] = useState(20);
  const [color, setColor] = useState<string>('#111827');
  const [showLabels, setShowLabels] = useState(true);
  const [showAuxLines, setShowAuxLines] = useState(true);
  const [dashedHidden, setDashedHidden] = useState(true);

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

    const w = 300;
    const h = 190;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = color === '#FFFFFF' ? '#13221E' : '#F8FAFB';
    ctx.fillRect(0, 0, w, h);

    renderSolid3DOnCanvas(ctx, {
      id: 'preview',
      preset,
      x: 20,
      y: 8,
      width: w - 40,
      height: h - 16,
      yaw,
      pitch,
      color,
      lineWidth: 2,
      showLabels,
      showAuxLines,
      dashedHidden,
    });
  }, [color, dashedHidden, pitch, preset, showAuxLines, showLabels, yaw]);

  const handleSelectPreset = (kind: Solid3DPresetKind) => {
    setPreset(kind);
    const meta = SOLID_3D_PRESETS.find((m) => m.kind === kind);
    if (meta) {
      setYaw(meta.defaultYaw);
      setPitch(meta.defaultPitch);
    }
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

  return (
    <div
      data-testid="solid-3d-popover"
      className="w-[min(92vw,360px)] space-y-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 text-[var(--text-main)] shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Box className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
          <h3 className="font-serif text-sm font-semibold">Chèn Hình Không Gian 3D</h3>
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

      {/* 8 mẫu hình không gian chuẩn SGK */}
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

      {/* Khung xem trước kéo xoay 3D trực tiếp */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--border-hairline)]">
        <canvas
          ref={previewCanvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="h-[190px] w-full cursor-grab touch-none active:cursor-grabbing"
        />
        <span className="pointer-events-none absolute right-2 bottom-1.5 rounded bg-black/45 px-1.5 py-0.5 font-mono text-[9.5px] text-white">
          Kéo để xoay góc nhìn ({yaw}° / {pitch}°)
        </span>
      </div>

      {/* Thanh góc xoay nhanh */}
      <div className="grid grid-cols-2 gap-2.5 text-[11px]">
        <label className="space-y-1">
          <span className="flex justify-between font-mono text-[10px] text-[var(--text-muted)]">
            <span>Xoay ngang</span>
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
            <span>Góc nghiêng</span>
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
      </div>

      {/* Tùy chọn hiển thị chuẩn vẽ hình không gian */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
        <label className="inline-flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="accent-[var(--accent-os)]"
          />
          <span>Tên đỉnh</span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={showAuxLines}
            onChange={(e) => setShowAuxLines(e.target.checked)}
            className="accent-[var(--accent-os)]"
          />
          <span>Đường cao / chéo</span>
        </label>
        <label className="inline-flex cursor-pointer items-center gap-1.5">
          <input
            type="checkbox"
            checked={dashedHidden}
            onChange={(e) => setDashedHidden(e.target.checked)}
            className="accent-[var(--accent-os)]"
          />
          <span>Nét đứt cạnh khuất</span>
        </label>
      </div>

      {/* Chọn màu nét & hành động */}
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
            onClick={() => {
              onInsert({
                preset,
                width: 290,
                height: 270,
                yaw,
                pitch,
                color,
                lineWidth: 2,
                showLabels,
                showAuxLines,
                dashedHidden,
              });
              onClose();
            }}
            className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--accent-os)] px-3 text-xs font-semibold text-white transition-opacity hover:opacity-95"
          >
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Chèn vào trang</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Solid3DPopover;
