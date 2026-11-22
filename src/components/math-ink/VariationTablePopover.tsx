import { Check, Minus, Plus, Table2, X } from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import {
  renderVariationTableOnCanvas,
  VARIATION_TABLE_PRESETS,
  type InkVariationTableItem,
  type VariationMarkerKind,
  type VariationSignValue,
  type VariationTableMode,
} from '@/features/math-ink';
import { cn } from '@/shared/lib/cn';

export interface VariationTablePopoverProps {
  readonly initialTable?: InkVariationTableItem | null;
  readonly onInsert: (table: Omit<InkVariationTableItem, 'id' | 'x' | 'y'>) => void;
  readonly onUpdateExisting?: (tableId: string, patch: Partial<InkVariationTableItem>) => void;
  readonly onClose: () => void;
}

const TABLE_COLORS = ['#111827', '#1D4ED8', '#1B5E4A', '#8C5828', '#DC2626'] as const;

const MARKER_CYCLE: readonly VariationMarkerKind[] = ['zero', 'double-bar', 'bar', 'none'];
const MARKER_TEXT: Readonly<Record<VariationMarkerKind, string>> = {
  zero: '0',
  'double-bar': '||',
  bar: '|',
  none: '·',
};

export const VariationTablePopover: FC<VariationTablePopoverProps> = ({
  initialTable = null,
  onInsert,
  onUpdateExisting,
  onClose,
}) => {
  const isEditing = Boolean(initialTable && onUpdateExisting);
  const defaultPreset = VARIATION_TABLE_PRESETS[0]!;

  const [mode, setMode] = useState<VariationTableMode>(initialTable?.mode ?? defaultPreset.mode);
  const [color, setColor] = useState<string>(initialTable?.color ?? '#111827');
  const [widthPx, setWidthPx] = useState<number>(initialTable?.width ?? 520);
  const [xLabel, setXLabel] = useState<string>(initialTable?.xLabel ?? defaultPreset.xLabel);
  const [derivativeLabel, setDerivativeLabel] = useState<string>(
    initialTable?.derivativeLabel ?? defaultPreset.derivativeLabel,
  );
  const [valueLabel, setValueLabel] = useState<string>(
    initialTable?.valueLabel ?? defaultPreset.valueLabel,
  );
  const [xPoints, setXPoints] = useState<string[]>(() => [
    ...(initialTable?.xPoints ?? defaultPreset.xPoints),
  ]);
  const [pointMarkers, setPointMarkers] = useState<VariationMarkerKind[]>(() => [
    ...(initialTable?.pointMarkers ?? defaultPreset.pointMarkers),
  ]);
  const [intervalSigns, setIntervalSigns] = useState<VariationSignValue[]>(() => [
    ...(initialTable?.intervalSigns ?? defaultPreset.intervalSigns),
  ]);
  const [yValues, setYValues] = useState<string[]>(() => [
    ...(initialTable?.yValues ?? defaultPreset.yValues),
  ]);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const heightPx = mode === 'sign' ? Math.round(widthPx * 0.25) : Math.round(widthPx * 0.44);

  const applyPreset = (presetId: string) => {
    const preset = VARIATION_TABLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setMode(preset.mode);
    setXLabel(preset.xLabel);
    setDerivativeLabel(preset.derivativeLabel);
    setValueLabel(preset.valueLabel);
    setXPoints([...preset.xPoints]);
    setPointMarkers([...preset.pointMarkers]);
    setIntervalSigns([...preset.intervalSigns]);
    setYValues([...preset.yValues]);
  };

  const handleAddCriticalPoint = () => {
    if (xPoints.length >= 7) return;
    const insertIdx = xPoints.length - 1;
    setXPoints((prev) => [...prev.slice(0, insertIdx), '2', prev[insertIdx]!]);
    setPointMarkers((prev) => [...prev, 'zero']);
    setIntervalSigns((prev) => {
      const last = prev[prev.length - 1] ?? '+';
      return [...prev, last === '+' ? '-' : '+'];
    });
    setYValues((prev) => [...prev.slice(0, insertIdx), '0', prev[insertIdx]!]);
  };

  const handleRemoveCriticalPoint = () => {
    if (xPoints.length <= 3) return;
    const removeIdx = xPoints.length - 2;
    setXPoints((prev) => prev.filter((_, idx) => idx !== removeIdx));
    setPointMarkers((prev) => prev.slice(0, -1));
    setIntervalSigns((prev) => prev.slice(0, -1));
    setYValues((prev) => prev.filter((_, idx) => idx !== removeIdx));
  };

  const cycleMarker = (markerIdx: number) => {
    setPointMarkers((prev) =>
      prev.map((m, i) => {
        if (i !== markerIdx) return m;
        const nextIdx = (MARKER_CYCLE.indexOf(m) + 1) % MARKER_CYCLE.length;
        return MARKER_CYCLE[nextIdx] ?? 'zero';
      }),
    );
  };

  const toggleSign = (signIdx: number) => {
    setIntervalSigns((prev) => prev.map((s, i) => (i === signIdx ? (s === '+' ? '-' : '+') : s)));
  };

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previewW = 396;
    const previewH = mode === 'sign' ? 104 : 168;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = previewW * dpr;
    canvas.height = previewH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, previewW, previewH);

    renderVariationTableOnCanvas(ctx, {
      id: 'preview-vt',
      x: 4,
      y: 4,
      width: previewW - 8,
      height: previewH - 8,
      mode,
      color,
      xLabel,
      derivativeLabel,
      valueLabel,
      xPoints,
      pointMarkers,
      intervalSigns,
      yValues,
    });
  }, [
    color,
    derivativeLabel,
    intervalSigns,
    mode,
    pointMarkers,
    valueLabel,
    xLabel,
    xPoints,
    yValues,
  ]);

  const handleSubmit = () => {
    const payload: Omit<InkVariationTableItem, 'id' | 'x' | 'y'> = {
      width: widthPx,
      height: heightPx,
      mode,
      color,
      xLabel: xLabel.trim() || 'x',
      derivativeLabel: derivativeLabel.trim() || (mode === 'sign' ? 'f(x)' : "y'"),
      valueLabel: valueLabel.trim() || 'y',
      xPoints,
      pointMarkers,
      intervalSigns,
      yValues,
    };

    if (isEditing && initialTable && onUpdateExisting) {
      onUpdateExisting(initialTable.id, payload);
    } else {
      onInsert(payload);
    }
    onClose();
  };

  return (
    <div
      data-testid="variation-table-popover"
      className="w-[428px] max-w-[94vw] rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-3.5 shadow-2xl"
    >
      <div className="mb-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)]">
          <Table2 className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
          <span>{isEditing ? 'Chỉnh sửa Bảng biến thiên' : 'Chèn Bảng biến thiên & Xét dấu'}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp tạo bảng biến thiên"
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 4 mẫu chuẩn nhanh */}
      <div className="mb-2.5 grid grid-cols-4 gap-1">
        {VARIATION_TABLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            data-testid={`vt-preset-${preset.id}`}
            onClick={() => applyPreset(preset.id)}
            title={preset.description}
            className="cursor-pointer rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-1.5 text-[10.5px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)] hover:text-[var(--text-main)]"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Xem trước Canvas trực tiếp */}
      <div className="mb-2.5 overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-[#F8FAF9] p-1 dark:bg-[#101816]">
        <canvas
          ref={previewRef}
          style={{ width: '100%', height: mode === 'sign' ? 104 : 168 }}
          className="block"
        />
      </div>

      {/* Chọn chế độ + thêm/bớt mốc */}
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <div className="inline-flex rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-0.5">
          <button
            type="button"
            data-testid="vt-mode-variation"
            onClick={() => {
              setMode('variation');
              if (derivativeLabel === 'f(x)') setDerivativeLabel("y'");
            }}
            className={cn(
              'cursor-pointer rounded-md px-2 py-1 text-[10.5px] font-semibold transition-colors',
              mode === 'variation'
                ? 'bg-[var(--accent-os)] text-white'
                : 'text-[var(--text-secondary)]',
            )}
          >
            Bảng biến thiên
          </button>
          <button
            type="button"
            data-testid="vt-mode-sign"
            onClick={() => {
              setMode('sign');
              if (derivativeLabel === "y'") setDerivativeLabel('f(x)');
            }}
            className={cn(
              'cursor-pointer rounded-md px-2 py-1 text-[10.5px] font-semibold transition-colors',
              mode === 'sign' ? 'bg-[var(--accent-os)] text-white' : 'text-[var(--text-secondary)]',
            )}
          >
            Bảng xét dấu
          </button>
        </div>

        <div className="inline-flex items-center gap-1">
          <span className="font-mono text-[10px] text-[var(--text-muted)]">
            {xPoints.length - 2} mốc:
          </span>
          <button
            type="button"
            data-testid="vt-remove-point"
            disabled={xPoints.length <= 3}
            onClick={handleRemoveCriticalPoint}
            title="Bớt 1 mốc x"
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] disabled:opacity-35"
          >
            <Minus className="h-3 w-3" />
          </button>
          <button
            type="button"
            data-testid="vt-add-point"
            disabled={xPoints.length >= 7}
            onClick={handleAddCriticalPoint}
            title="Thêm 1 mốc x"
            className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] disabled:opacity-35"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Trình sửa tương tác các dòng x, y', y */}
      <div className="mb-3 space-y-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]/65 p-2.5 text-[11px]">
        {/* Dòng x */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={xLabel}
            onChange={(e) => setXLabel(e.target.value)}
            aria-label="Nhãn dòng x"
            className="w-9 shrink-0 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1 py-1 text-center font-serif font-bold italic"
          />
          <div
            className="grid flex-1 gap-1"
            style={{ gridTemplateColumns: `repeat(${xPoints.length}, minmax(0, 1fr))` }}
          >
            {xPoints.map((val, idx) => (
              <input
                key={`xp-${idx}`}
                type="text"
                data-testid={`vt-x-input-${idx}`}
                value={val}
                onChange={(e) =>
                  setXPoints((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                }
                aria-label={`Mốc x thứ ${idx + 1}`}
                className="min-w-0 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1 py-1 text-center font-mono text-[10.5px] focus:border-[var(--accent-os)] focus:outline-none"
              />
            ))}
          </div>
        </div>

        {/* Dòng dấu y' / f(x) */}
        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={derivativeLabel}
            onChange={(e) => setDerivativeLabel(e.target.value)}
            aria-label="Nhãn dòng đạo hàm hoặc xét dấu"
            className="w-9 shrink-0 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1 py-1 text-center font-serif font-bold italic"
          />
          <div className="flex flex-1 flex-wrap items-center justify-between gap-1">
            {intervalSigns.map((sign, idx) => (
              <div key={`slot-${idx}`} className="flex flex-1 items-center gap-1">
                <button
                  type="button"
                  data-testid={`vt-sign-btn-${idx}`}
                  onClick={() => toggleSign(idx)}
                  title="Bấm để đảo dấu + / −"
                  className={cn(
                    'flex-1 cursor-pointer rounded-md border py-1 font-mono text-xs font-bold transition-colors',
                    sign === '+'
                      ? 'border-[#1B5E4A]/40 bg-[#EDF7F3] text-[#1B5E4A] dark:bg-[#13261F] dark:text-[#52B394]'
                      : 'border-[#8F3D35]/40 bg-[#FDF2F2] text-[#8F3D35] dark:bg-[#261414] dark:text-[#F87171]',
                  )}
                >
                  {sign === '-' ? '−' : '+'}
                </button>
                {idx < pointMarkers.length && (
                  <button
                    type="button"
                    data-testid={`vt-marker-btn-${idx}`}
                    onClick={() => cycleMarker(idx)}
                    title="Đổi ký hiệu tại mốc: 0 → || (không xác định) → | → trống"
                    className="h-7 min-w-[26px] cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1 font-mono text-[11px] font-bold text-[var(--text-main)] hover:border-[var(--accent-os)]"
                  >
                    {MARKER_TEXT[pointMarkers[idx]!]}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dòng giá trị y (khi ở chế độ Bảng biến thiên) */}
        {mode === 'variation' && (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={valueLabel}
              onChange={(e) => setValueLabel(e.target.value)}
              aria-label="Nhãn dòng y"
              className="w-9 shrink-0 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1 py-1 text-center font-serif font-bold italic"
            />
            <div
              className="grid flex-1 gap-1"
              style={{ gridTemplateColumns: `repeat(${yValues.length}, minmax(0, 1fr))` }}
            >
              {yValues.map((val, idx) => (
                <input
                  key={`yv-${idx}`}
                  type="text"
                  data-testid={`vt-y-input-${idx}`}
                  value={val}
                  onChange={(e) =>
                    setYValues((prev) => prev.map((v, i) => (i === idx ? e.target.value : v)))
                  }
                  placeholder={pointMarkers[idx - 1] === 'double-bar' ? '+∞ | -∞' : '0'}
                  aria-label={`Giá trị y thứ ${idx + 1}`}
                  className="min-w-0 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1 py-1 text-center font-mono text-[10.5px] focus:border-[var(--accent-os)] focus:outline-none"
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cỡ bảng + màu mực + nút chèn */}
      <div className="mb-2.5 flex items-center gap-2 text-[11px]">
        <span className="shrink-0 text-[var(--text-muted)]">Cỡ bảng ({widthPx}px)</span>
        <input
          type="range"
          min={340}
          max={760}
          step={20}
          value={widthPx}
          onChange={(e) => setWidthPx(Number(e.target.value))}
          className="flex-1 accent-[var(--accent-os)]"
        />
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {TABLE_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{ backgroundColor: c }}
              aria-label={`Màu mực bảng ${c}`}
              className={cn(
                'h-5 w-5 cursor-pointer rounded-full border border-black/15',
                color === c && 'ring-2 ring-[var(--accent-os)] ring-offset-1',
              )}
            />
          ))}
        </div>

        <button
          type="button"
          data-testid="insert-variation-table-confirm"
          onClick={handleSubmit}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#17332C] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#21463C]"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{isEditing ? 'Cập nhật bảng' : 'Chèn vào trang'}</span>
        </button>
      </div>
    </div>
  );
};
