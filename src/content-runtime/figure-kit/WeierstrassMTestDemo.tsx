import { useCallback, useId, useMemo, useState } from 'react';
import { Card } from '@/shared/ui';

export interface WeierstrassMTestDemoProps {
  readonly title?: string;
  readonly defaultPreset?: 'cos' | 'sin';
  readonly defaultN?: number;
}

export function WeierstrassMTestDemo({
  title = 'Mô phỏng trực quan: Dấu hiệu Weierstrass (M-Test) và Hội tụ đều',
  defaultPreset = 'cos',
  defaultN = 4,
}: WeierstrassMTestDemoProps) {
  const sliderId = useId();
  const [preset, setPreset] = useState<'cos' | 'sin'>(defaultPreset);
  const [N, setN] = useState<number>(defaultN);
  const [viewMode, setViewMode] = useState<'sum' | 'term'>('sum');
  const [inspectK, setInspectK] = useState<number>(2);

  const isCos = preset === 'cos';
  const xMin = -Math.PI;
  const xMax = Math.PI;

  // Giới hạn hàm f_k(x)
  const evalTerm = useCallback(
    (x: number, k: number): number => {
      return isCos ? Math.cos(k * x) / (k * k) : Math.sin(k * x) / (k * k);
    },
    [isCos],
  );

  // Giới hạn dải bao a_k
  const evalBound = useCallback((k: number): number => {
    return 1 / (k * k);
  }, []);

  // Tổng riêng S_N(x)
  const evalPartialSum = useCallback(
    (x: number, maxN: number): number => {
      let sum = 0;
      for (let k = 1; k <= maxN; k += 1) {
        sum += evalTerm(x, k);
      }
      return sum;
    },
    [evalTerm],
  );

  // Tính tổng chuỗi chặn Riemann sum a_k = 1/k^2
  const { sumMajorant, remainderBound } = useMemo(() => {
    let sum = 0;
    for (let k = 1; k <= N; k += 1) {
      sum += 1 / (k * k);
    }
    const piSqOver6 = (Math.PI * Math.PI) / 6; // 1.644934
    const rem = Math.max(0, piSqOver6 - sum);
    return {
      sumMajorant: sum,
      remainderBound: rem,
    };
  }, [N]);

  // Cấu hình khung vẽ SVG
  const yMin = viewMode === 'sum' ? -1.8 : -1.2;
  const yMax = viewMode === 'sum' ? 1.8 : 1.2;

  const svgWidth = 620;
  const svgHeight = 280;
  const marginX = 45;
  const marginTop = 20;
  const marginBottom = 35;
  const plotWidth = svgWidth - 2 * marginX;
  const plotHeight = svgHeight - marginTop - marginBottom;

  const toSvgX = useCallback(
    (xVal: number): number => {
      return marginX + ((xVal - xMin) / (xMax - xMin)) * plotWidth;
    },
    [xMin, xMax, plotWidth],
  );

  const toSvgY = useCallback(
    (yVal: number): number => {
      const clamped = Math.max(yMin, Math.min(yMax, yVal));
      return marginTop + (1 - (clamped - yMin) / (yMax - yMin)) * plotHeight;
    },
    [yMin, yMax, plotHeight],
  );

  const yZeroSvg = toSvgY(0);

  // Đường cong tổng riêng S_N(x)
  const partialSumPath = useMemo(() => {
    const steps = 120;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evalPartialSum(x, N);
      pts.push(`${i === 0 ? 'M' : 'L'} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [xMin, xMax, N, evalPartialSum, toSvgX, toSvgY]);

  // Đường cong số hạng đơn lẻ f_k(x)
  const singleTermPath = useMemo(() => {
    const steps = 120;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evalTerm(x, inspectK);
      pts.push(`${i === 0 ? 'M' : 'L'} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [xMin, xMax, inspectK, evalTerm, toSvgX, toSvgY]);

  const boundK = evalBound(inspectK);
  const yUpperSvg = toSvgY(boundK);
  const yLowerSvg = toSvgY(-boundK);

  return (
    <Card className="my-6 overflow-hidden border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Minh họa định lý Weierstrass: Nếu |f_n(x)| ≤ a_n với chuỗi số ∑ a_n hội tụ thì chuỗi hàm
            ∑ f_n(x) hội tụ đều.
          </p>
        </div>

        {/* Nút chọn preset */}
        <div className="flex gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPreset('cos')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              isCos
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            f_n(x) = cos(nx)/n²
          </button>
          <button
            type="button"
            onClick={() => setPreset('sin')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              !isCos
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            f_n(x) = sin(nx)/n²
          </button>
        </div>
      </div>

      {/* Điều khiển tham số N và chế độ xem */}
      <div className="mb-4 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2 dark:bg-slate-800/60">
        <div>
          <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
            <label htmlFor={sliderId}>Số số hạng tổng riêng N:</label>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
              N = {N}
            </span>
          </div>
          <input
            id={sliderId}
            type="range"
            min={1}
            max={12}
            step={1}
            value={N}
            onChange={(e) => setN(Number(e.target.value))}
            className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-slate-700"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>N = 1</span>
            <span>N = 6</span>
            <span>N = 12</span>
          </div>
        </div>

        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Chế độ khảo sát:</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setViewMode('sum')}
              className={`rounded px-2 py-1 text-xs ${
                viewMode === 'sum'
                  ? 'bg-blue-600 font-medium text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              Tổng riêng S_N(x)
            </button>
            <button
              type="button"
              onClick={() => setViewMode('term')}
              className={`rounded px-2 py-1 text-xs ${
                viewMode === 'term'
                  ? 'bg-indigo-600 font-medium text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              Dải bao chặn |f_k(x)| ≤ a_k
            </button>
          </div>

          {viewMode === 'term' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Chọn số hạng k:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((kVal) => (
                  <button
                    key={kVal}
                    type="button"
                    onClick={() => setInspectK(kVal)}
                    className={`rounded px-2 py-0.5 text-[11px] ${
                      inspectK === kVal
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    }`}
                  >
                    k = {kVal}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Khung vẽ đồ thị SVG */}
      <div className="relative overflow-x-auto rounded border border-slate-100 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto block h-auto w-full max-w-[620px]"
          aria-label="Minh họa dấu hiệu Weierstrass M-test"
        >
          {/* Trục tọa độ Ox và Oy */}
          <line
            x1={toSvgX(xMin)}
            y1={yZeroSvg}
            x2={toSvgX(xMax)}
            y2={yZeroSvg}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />
          <line
            x1={toSvgX(0)}
            y1={toSvgY(yMin)}
            x2={toSvgX(0)}
            y2={toSvgY(yMax)}
            stroke="#94a3b8"
            strokeWidth={1.5}
          />

          {/* Vạch chia trục Ox */}
          <line
            x1={toSvgX(-Math.PI)}
            y1={yZeroSvg - 3}
            x2={toSvgX(-Math.PI)}
            y2={yZeroSvg + 3}
            stroke="#94a3b8"
          />
          <text x={toSvgX(-Math.PI) - 8} y={yZeroSvg + 15} fontSize={10} fill="#64748b">
            -π
          </text>
          <line
            x1={toSvgX(0)}
            y1={yZeroSvg - 3}
            x2={toSvgX(0)}
            y2={yZeroSvg + 3}
            stroke="#94a3b8"
          />
          <text x={toSvgX(0) - 4} y={yZeroSvg + 15} fontSize={10} fill="#64748b">
            0
          </text>
          <line
            x1={toSvgX(Math.PI)}
            y1={yZeroSvg - 3}
            x2={toSvgX(Math.PI)}
            y2={yZeroSvg + 3}
            stroke="#94a3b8"
          />
          <text x={toSvgX(Math.PI) - 4} y={yZeroSvg + 15} fontSize={10} fill="#64748b">
            π
          </text>

          {/* Chế độ dải bao chặn (Term mode) */}
          {viewMode === 'term' && (
            <g>
              {/* Vùng bóng dải bao [-a_k, a_k] */}
              <rect
                x={toSvgX(xMin)}
                y={yUpperSvg}
                width={plotWidth}
                height={Math.max(1, yLowerSvg - yUpperSvg)}
                fill="rgba(245, 158, 11, 0.15)"
              />
              {/* Đường biên trên y = a_k */}
              <line
                x1={toSvgX(xMin)}
                y1={yUpperSvg}
                x2={toSvgX(xMax)}
                y2={yUpperSvg}
                stroke="#d97706"
                strokeWidth={1.2}
                strokeDasharray="4 3"
              />
              <text
                x={toSvgX(xMax) - 75}
                y={yUpperSvg - 4}
                fontSize={10}
                fill="#d97706"
                fontWeight="bold"
              >
                y = a_{inspectK} = {(1 / (inspectK * inspectK)).toFixed(3)}
              </text>

              {/* Đường biên dưới y = -a_k */}
              <line
                x1={toSvgX(xMin)}
                y1={yLowerSvg}
                x2={toSvgX(xMax)}
                y2={yLowerSvg}
                stroke="#d97706"
                strokeWidth={1.2}
                strokeDasharray="4 3"
              />
              <text
                x={toSvgX(xMax) - 80}
                y={yLowerSvg + 12}
                fontSize={10}
                fill="#d97706"
                fontWeight="bold"
              >
                y = -a_{inspectK} = {(-1 / (inspectK * inspectK)).toFixed(3)}
              </text>

              {/* Đường cong hàm đơn lẻ f_k(x) */}
              <path d={singleTermPath} fill="none" stroke="#4f46e5" strokeWidth={2.2} />
            </g>
          )}

          {/* Chế độ tổng riêng S_N(x) (Sum mode) */}
          {viewMode === 'sum' && (
            <g>
              {/* Đường cong S_N(x) */}
              <path d={partialSumPath} fill="none" stroke="#2563eb" strokeWidth={2.5} />
            </g>
          )}
        </svg>
      </div>

      {/* Thống kê định lượng */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded border border-blue-200 bg-blue-50/60 p-2 dark:border-blue-900 dark:bg-blue-950/40">
          <span className="text-[11px] font-medium text-blue-800 dark:text-blue-300">
            Tổng riêng số hạng
          </span>
          <div className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400">
            N = {N} số hạng
          </div>
        </div>

        <div className="rounded border border-amber-200 bg-amber-50/60 p-2 dark:border-amber-900 dark:bg-amber-950/40">
          <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
            Tổng chuỗi trội ∑ a_k
          </span>
          <div className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400">
            {sumMajorant.toFixed(4)}
          </div>
        </div>

        <div className="rounded border border-emerald-200 bg-emerald-50/60 p-2 dark:border-emerald-900 dark:bg-emerald-950/40">
          <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            Tổng toàn phần ∑ 1/k²
          </span>
          <div className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
            π²/6 ≈ 1.6449
          </div>
        </div>

        <div className="rounded border border-purple-200 bg-purple-50/60 p-2 dark:border-purple-900 dark:bg-purple-950/40">
          <span className="text-[11px] font-medium text-purple-800 dark:text-purple-300">
            Chặn sai số đều sup |R_N|
          </span>
          <div className="font-mono text-sm font-bold text-purple-700 dark:text-purple-400">
            ≤ {remainderBound.toFixed(4)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>
          Bất đẳng thức chặn đều:{' '}
          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
            |f_n(x)| ≤ a_n = 1/n² với mọi x ∈ [-π; π]
          </span>
        </span>
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {viewMode === 'sum' ? 'S_N(x) hội tụ đều về S(x)' : `Khảo sát số hạng k = ${inspectK}`}
        </span>
      </div>
    </Card>
  );
}
