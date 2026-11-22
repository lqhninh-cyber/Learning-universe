import { Check, Plus, Trash2, TrendingUp, X } from 'lucide-react';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import {
  compileMathExpression,
  computeDefiniteIntegral,
  renderFunctionGraphOnCanvas,
  type GraphFunctionEntry,
  type InkGraphItem,
} from '@/features/math-ink';

export interface FunctionGraphPopoverProps {
  readonly onInsert: (graph: Omit<InkGraphItem, 'id' | 'x' | 'y'>) => void;
  readonly onClose: () => void;
}

const FUNC_COLORS = ['#1D4ED8', '#DC2626', '#1B5E4A', '#9333EA', '#D97706'] as const;

const FUNCTION_PRESETS: readonly { readonly label: string; readonly expr: string }[] = [
  { label: 'Bậc 3', expr: 'x^3 - 3x' },
  { label: 'Trùng phương', expr: 'x^4 - 2x^2 - 1' },
  { label: 'Phân thức 1/1', expr: '(2x - 1)/(x - 1)' },
  { label: 'Parabol', expr: 'x^2 - 2x - 3' },
  { label: 'Lượng giác', expr: '2sin(x)' },
  { label: 'Logarit', expr: 'ln(x)' },
];

export const FunctionGraphPopover: FC<FunctionGraphPopoverProps> = ({ onInsert, onClose }) => {
  const [functions, setFunctions] = useState<GraphFunctionEntry[]>([
    { id: 'fn-1', expression: 'x^3 - 3x', color: FUNC_COLORS[0], visible: true },
  ]);
  const [xMin, setXMin] = useState(-5);
  const [xMax, setXMax] = useState(5);
  const [yMin, setYMin] = useState(-5);
  const [yMax, setYMax] = useState(5);
  const [showGrid, setShowGrid] = useState(true);
  const [showSpecialPoints, setShowSpecialPoints] = useState(true);
  const [integralEnabled, setIntegralEnabled] = useState(false);
  const [integralFrom, setIntegralFrom] = useState(0);
  const [integralTo, setIntegralTo] = useState(2);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const compiledStatuses = useMemo(
    () => functions.map((f) => compileMathExpression(f.expression)),
    [functions],
  );

  const integralValue = useMemo(() => {
    if (!integralEnabled) return null;
    const first = compiledStatuses[0];
    if (!first || !first.ok) return null;
    return computeDefiniteIntegral(first.evaluate, integralFrom, integralTo);
  }, [compiledStatuses, integralEnabled, integralFrom, integralTo]);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 340;
    const h = 210;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    renderFunctionGraphOnCanvas(ctx, {
      id: 'preview-graph',
      x: 2,
      y: 2,
      width: w - 4,
      height: h - 4,
      xMin: Math.min(xMin, xMax - 1),
      xMax: Math.max(xMax, xMin + 1),
      yMin: Math.min(yMin, yMax - 1),
      yMax: Math.max(yMax, yMin + 1),
      showGrid,
      showSpecialPoints,
      functions,
      integral: {
        enabled: integralEnabled,
        funcIndex: 0,
        from: integralFrom,
        to: integralTo,
      },
    });
  }, [
    functions,
    integralEnabled,
    integralFrom,
    integralTo,
    showGrid,
    showSpecialPoints,
    xMax,
    xMin,
    yMax,
    yMin,
  ]);

  const handleAddFunction = () => {
    if (functions.length >= 4) return;
    const color = FUNC_COLORS[functions.length % FUNC_COLORS.length]!;
    setFunctions((prev) => [
      ...prev,
      { id: `fn-${Date.now().toString(36)}`, expression: '2x - 1', color, visible: true },
    ]);
  };

  return (
    <div
      data-testid="function-graph-popover"
      className="w-[min(94vw,390px)] space-y-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 text-[var(--text-main)] shadow-2xl"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="h-4 w-4 text-[var(--accent-os)]" aria-hidden="true" />
          <h3 className="font-serif text-sm font-semibold">Vẽ Đồ Thị Hàm Số f(x)</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng bảng đồ thị hàm số"
          className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Mẫu hàm số nhanh */}
      <div className="flex flex-wrap items-center gap-1">
        {FUNCTION_PRESETS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() =>
              setFunctions((prev) =>
                prev.map((f, idx) => (idx === 0 ? { ...f, expression: preset.expr } : f)),
              )
            }
            className="cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[10px] font-medium text-[var(--text-secondary)] hover:border-[var(--accent-os)]/50 hover:text-[var(--text-main)]"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Danh sách các hàm số f1(x), f2(x)... */}
      <div className="space-y-1.5">
        {functions.map((fn, idx) => {
          const status = compiledStatuses[idx];
          return (
            <div key={fn.id} className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: fn.color }}
                  aria-hidden="true"
                />
                <span className="shrink-0 font-serif text-xs font-bold italic">y =</span>
                <input
                  type="text"
                  data-testid={`graph-fn-input-${idx}`}
                  value={fn.expression}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFunctions((prev) =>
                      prev.map((item, i) => (i === idx ? { ...item, expression: val } : item)),
                    );
                  }}
                  placeholder="VD: x^3 - 3x, sin(x), (2x-1)/(x-1)..."
                  aria-label={`Biểu thức hàm số ${idx + 1}`}
                  className="min-w-0 flex-1 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1 font-mono text-xs text-[var(--text-main)] focus:border-[var(--accent-os)] focus:outline-none"
                />
                {functions.length > 1 && (
                  <button
                    type="button"
                    aria-label={`Xóa hàm số ${idx + 1}`}
                    onClick={() => setFunctions((prev) => prev.filter((_, i) => i !== idx))}
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[var(--text-muted)] hover:text-[#8F3D35]"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
              {status && !status.ok && fn.expression.trim() && (
                <p className="pl-7 font-mono text-[10px] text-[#8F3D35]">{status.error}</p>
              )}
            </div>
          );
        })}

        {functions.length < 4 && (
          <button
            type="button"
            onClick={handleAddFunction}
            className="inline-flex cursor-pointer items-center gap-1 font-mono text-[10.5px] font-semibold text-[var(--accent-os)] hover:underline"
          >
            <Plus className="h-3 w-3" aria-hidden="true" />
            <span>Thêm hàm số cùng trục</span>
          </button>
        )}
      </div>

      {/* Xem trước đồ thị trực tiếp */}
      <div className="overflow-hidden rounded-xl border border-[var(--border-hairline)] bg-white">
        <canvas ref={previewCanvasRef} className="h-[210px] w-full" />
      </div>

      {/* Miền khảo sát + Tích phân xác định */}
      <div className="grid grid-cols-4 gap-1.5 font-mono text-[10.5px]">
        <label className="space-y-0.5">
          <span className="text-[var(--text-muted)]">x min</span>
          <input
            type="number"
            value={xMin}
            onChange={(e) => setXMin(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-1 text-xs"
          />
        </label>
        <label className="space-y-0.5">
          <span className="text-[var(--text-muted)]">x max</span>
          <input
            type="number"
            value={xMax}
            onChange={(e) => setXMax(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-1 text-xs"
          />
        </label>
        <label className="space-y-0.5">
          <span className="text-[var(--text-muted)]">y min</span>
          <input
            type="number"
            value={yMin}
            onChange={(e) => setYMin(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-1 text-xs"
          />
        </label>
        <label className="space-y-0.5">
          <span className="text-[var(--text-muted)]">y max</span>
          <input
            type="number"
            value={yMax}
            onChange={(e) => setYMax(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-1 text-xs"
          />
        </label>
      </div>

      {/* Tùy chọn hiển thị + Tích phân xác định */}
      <div className="space-y-2 text-xs text-[var(--text-secondary)]">
        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="accent-[var(--accent-os)]"
            />
            <span>Lưới tọa độ</span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={showSpecialPoints}
              onChange={(e) => setShowSpecialPoints(e.target.checked)}
              className="accent-[var(--accent-os)]"
            />
            <span>Điểm đặc biệt</span>
          </label>
          <label className="inline-flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              data-testid="graph-integral-toggle"
              checked={integralEnabled}
              onChange={(e) => setIntegralEnabled(e.target.checked)}
              className="accent-[var(--accent-os)]"
            />
            <span>Tô tích phân</span>
          </label>
        </div>

        {integralEnabled && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-1.5 font-mono text-[11px]">
            <span>Cận từ</span>
            <input
              type="number"
              step="0.5"
              value={integralFrom}
              onChange={(e) => setIntegralFrom(Number(e.target.value))}
              aria-label="Cận dưới tích phân"
              className="w-14 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 text-center"
            />
            <span>đến</span>
            <input
              type="number"
              step="0.5"
              value={integralTo}
              onChange={(e) => setIntegralTo(Number(e.target.value))}
              aria-label="Cận trên tích phân"
              className="w-14 rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 text-center"
            />
            {integralValue !== null && (
              <span className="ml-auto font-bold text-[var(--accent-os)]">
                ≈ {integralValue.toFixed(3)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end border-t border-[var(--border-hairline)] pt-2.5">
        <button
          type="button"
          data-testid="insert-graph-confirm"
          onClick={() => {
            onInsert({
              width: 440,
              height: 300,
              xMin: Math.min(xMin, xMax - 1),
              xMax: Math.max(xMax, xMin + 1),
              yMin: Math.min(yMin, yMax - 1),
              yMax: Math.max(yMax, yMin + 1),
              showGrid,
              showSpecialPoints,
              functions,
              integral: {
                enabled: integralEnabled,
                funcIndex: 0,
                from: integralFrom,
                to: integralTo,
              },
            });
            onClose();
          }}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-[var(--accent-os)] px-3.5 text-xs font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Chèn đồ thị vào trang</span>
        </button>
      </div>
    </div>
  );
};

export default FunctionGraphPopover;
