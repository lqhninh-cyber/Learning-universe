import { useCallback, useId, useMemo, useState } from 'react';
import { Card } from '@/shared/ui';

export interface RiemannDarbouxSumDemoProps {
  readonly title?: string;
  readonly defaultFunction?: 'quadratic' | 'sin';
  readonly defaultSubdivisions?: number;
}

export function RiemannDarbouxSumDemo({
  title = 'Mô phỏng trực quan: Tổng Darboux trên/dưới và Tích phân Riemann',
  defaultFunction = 'quadratic',
  defaultSubdivisions = 6,
}: RiemannDarbouxSumDemoProps) {
  const sliderId = useId();
  const [selectedFunc, setSelectedFunc] = useState<'quadratic' | 'sin'>(defaultFunction);
  const [n, setN] = useState<number>(defaultSubdivisions);
  const [displayMode, setDisplayMode] = useState<'both' | 'upper' | 'lower' | 'midpoint'>('both');

  const isQuad = selectedFunc === 'quadratic';
  const a = 0;
  const b = isQuad ? 2 : Math.PI;

  // Hàm f(x)
  const evalF = useCallback(
    (x: number): number => {
      return isQuad ? x * x : Math.sin(x);
    },
    [isQuad],
  );

  // Tích phân chính xác
  const exactIntegral = isQuad ? 8 / 3 : 2;

  // Tính toán các phân hoạch và tổng Darboux
  const { intervals, upperSum, lowerSum, midpointSum } = useMemo(() => {
    const dx = (b - a) / n;
    const inters: Array<{
      xLeft: number;
      xRight: number;
      m: number;
      M: number;
      mid: number;
      fMid: number;
    }> = [];
    let uSum = 0;
    let lSum = 0;
    let mSum = 0;

    for (let i = 0; i < n; i += 1) {
      const xLeft = a + i * dx;
      const xRight = a + (i + 1) * dx;
      const mid = (xLeft + xRight) / 2;
      const fMid = evalF(mid);

      // Tìm m_i và M_i trên [xLeft, xRight]
      let mVal: number;
      let mMax: number;
      if (isQuad) {
        // x^2 đồng biến trên [0, 2]
        mVal = evalF(xLeft);
        mMax = evalF(xRight);
      } else {
        // sin(x) trên [0, pi]
        const sampleSteps = 20;
        let localMin = Number.POSITIVE_INFINITY;
        let localMax = Number.NEGATIVE_INFINITY;
        for (let s = 0; s <= sampleSteps; s += 1) {
          const sx = xLeft + (s / sampleSteps) * (xRight - xLeft);
          const val = Math.sin(sx);
          if (val < localMin) localMin = val;
          if (val > localMax) localMax = val;
        }
        mVal = localMin;
        mMax = localMax;
      }

      inters.push({
        xLeft,
        xRight,
        m: mVal,
        M: mMax,
        mid,
        fMid,
      });

      uSum += mMax * dx;
      lSum += mVal * dx;
      mSum += fMid * dx;
    }

    return {
      intervals: inters,
      upperSum: uSum,
      lowerSum: lSum,
      midpointSum: mSum,
    };
  }, [a, b, n, isQuad, evalF]);

  // Cấu hình khung vẽ SVG
  const xMin = -0.2;
  const xMax = isQuad ? 2.3 : Math.PI + 0.3;
  const yMin = -0.3;
  const yMax = isQuad ? 4.4 : 1.3;

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

  // Đường cong f(x)
  const curvePath = useMemo(() => {
    const steps = 100;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const x = a + (i / steps) * (b - a);
      const y = evalF(x);
      pts.push(`${i === 0 ? 'M' : 'L'} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
    }
    return pts.join(' ');
  }, [a, b, evalF, toSvgX, toSvgY]);

  const yZeroSvg = toSvgY(0);

  return (
    <Card className="my-6 overflow-hidden border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Khảo sát các hình chữ nhật Darboux trên $U(P)$, Darboux dưới $L(P)$ và tổng Riemann khi
            tăng số phân hoạch $n$.
          </p>
        </div>

        {/* Nút chọn hàm số */}
        <div className="flex gap-1.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSelectedFunc('quadratic')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              isQuad
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            f(x) = x² trên [0; 2]
          </button>
          <button
            type="button"
            onClick={() => setSelectedFunc('sin')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              !isQuad
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            f(x) = sin x trên [0; π]
          </button>
        </div>
      </div>

      {/* Thanh điều khiển số đoạn chia n và chế độ xem */}
      <div className="mb-4 grid grid-cols-1 gap-4 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2 dark:bg-slate-800/60">
        <div>
          <div className="flex items-center justify-between font-medium text-slate-700 dark:text-slate-300">
            <label htmlFor={sliderId}>Số đoạn phân hoạch n:</label>
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
              n = {n}
            </span>
          </div>
          <input
            id={sliderId}
            type="range"
            min={2}
            max={40}
            step={1}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="mt-1.5 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-blue-600 dark:bg-slate-700"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>n = 2 (thô)</span>
            <span>n = 20</span>
            <span>n = 40 (mịn)</span>
          </div>
        </div>

        <div>
          <span className="font-medium text-slate-700 dark:text-slate-300">Chế độ hiển thị:</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setDisplayMode('both')}
              className={`rounded px-2 py-0.5 text-xs ${
                displayMode === 'both'
                  ? 'bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              Cả hai (U và L)
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('upper')}
              className={`rounded px-2 py-0.5 text-xs ${
                displayMode === 'upper'
                  ? 'bg-amber-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              Chỉ tổng trên U(P)
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('lower')}
              className={`rounded px-2 py-0.5 text-xs ${
                displayMode === 'lower'
                  ? 'bg-emerald-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              Chỉ tổng dưới L(P)
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('midpoint')}
              className={`rounded px-2 py-0.5 text-xs ${
                displayMode === 'midpoint'
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              Riemann điểm giữa S(P)
            </button>
          </div>
        </div>
      </div>

      {/* Khung vẽ đồ thị trực quan SVG */}
      <div className="relative overflow-x-auto rounded border border-slate-100 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto block h-auto w-full max-w-[620px]"
          aria-label="Minh họa tổng Darboux và tích phân Riemann"
        >
          {/* Trục hoành Ox và Trục tung Oy */}
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

          {/* Vạch chia trục hoành */}
          <text x={toSvgX(0) - 10} y={yZeroSvg + 15} fontSize={10} fill="#64748b">
            0
          </text>
          {isQuad ? (
            <>
              <line
                x1={toSvgX(1)}
                y1={yZeroSvg - 3}
                x2={toSvgX(1)}
                y2={yZeroSvg + 3}
                stroke="#94a3b8"
              />
              <text x={toSvgX(1) - 4} y={yZeroSvg + 15} fontSize={10} fill="#64748b">
                1
              </text>
              <line
                x1={toSvgX(2)}
                y1={yZeroSvg - 3}
                x2={toSvgX(2)}
                y2={yZeroSvg + 3}
                stroke="#94a3b8"
              />
              <text
                x={toSvgX(2) - 4}
                y={yZeroSvg + 15}
                fontSize={10}
                fill="#64748b"
                fontWeight="bold"
              >
                2 (b)
              </text>
            </>
          ) : (
            <>
              <line
                x1={toSvgX(Math.PI / 2)}
                y1={yZeroSvg - 3}
                x2={toSvgX(Math.PI / 2)}
                y2={yZeroSvg + 3}
                stroke="#94a3b8"
              />
              <text x={toSvgX(Math.PI / 2) - 8} y={yZeroSvg + 15} fontSize={10} fill="#64748b">
                π/2
              </text>
              <line
                x1={toSvgX(Math.PI)}
                y1={yZeroSvg - 3}
                x2={toSvgX(Math.PI)}
                y2={yZeroSvg + 3}
                stroke="#94a3b8"
              />
              <text
                x={toSvgX(Math.PI) - 8}
                y={yZeroSvg + 15}
                fontSize={10}
                fill="#64748b"
                fontWeight="bold"
              >
                π (b)
              </text>
            </>
          )}

          {/* Cột hình chữ nhật tổng trên U(P) */}
          {(displayMode === 'both' || displayMode === 'upper') &&
            intervals.map((inter, idx) => {
              const x1 = toSvgX(inter.xLeft);
              const x2 = toSvgX(inter.xRight);
              const yTop = toSvgY(inter.M);
              const width = Math.max(0.5, x2 - x1);
              const height = Math.max(0, yZeroSvg - yTop);
              return (
                <rect
                  key={`upper-${idx}`}
                  x={x1}
                  y={yTop}
                  width={width}
                  height={height}
                  fill="rgba(245, 158, 11, 0.22)"
                  stroke="#d97706"
                  strokeWidth={0.8}
                />
              );
            })}

          {/* Cột hình chữ nhật tổng dưới L(P) */}
          {(displayMode === 'both' || displayMode === 'lower') &&
            intervals.map((inter, idx) => {
              const x1 = toSvgX(inter.xLeft);
              const x2 = toSvgX(inter.xRight);
              const yTop = toSvgY(inter.m);
              const width = Math.max(0.5, x2 - x1);
              const height = Math.max(0, yZeroSvg - yTop);
              return (
                <rect
                  key={`lower-${idx}`}
                  x={x1}
                  y={yTop}
                  width={width}
                  height={height}
                  fill="rgba(16, 185, 129, 0.38)"
                  stroke="#059669"
                  strokeWidth={0.8}
                />
              );
            })}

          {/* Cột hình chữ nhật Riemann điểm giữa S(P) */}
          {displayMode === 'midpoint' &&
            intervals.map((inter, idx) => {
              const x1 = toSvgX(inter.xLeft);
              const x2 = toSvgX(inter.xRight);
              const yTop = toSvgY(inter.fMid);
              const width = Math.max(0.5, x2 - x1);
              const height = Math.max(0, yZeroSvg - yTop);
              return (
                <g key={`mid-${idx}`}>
                  <rect
                    x={x1}
                    y={yTop}
                    width={width}
                    height={height}
                    fill="rgba(99, 102, 241, 0.25)"
                    stroke="#4f46e5"
                    strokeWidth={0.8}
                  />
                  <circle cx={toSvgX(inter.mid)} cy={yTop} r={2.5} fill="#4f46e5" />
                </g>
              );
            })}

          {/* Đường cong hàm gốc f(x) */}
          <path d={curvePath} fill="none" stroke="#2563eb" strokeWidth={2.5} />
        </svg>
      </div>

      {/* Bảng so sánh chỉ số định lượng */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded border border-emerald-200 bg-emerald-50/60 p-2 dark:border-emerald-900 dark:bg-emerald-950/40">
          <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            Tổng dưới L(P)
          </span>
          <div className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {lowerSum.toFixed(4)}
          </div>
        </div>

        <div className="rounded border border-blue-200 bg-blue-50/60 p-2 dark:border-blue-900 dark:bg-blue-950/40">
          <span className="text-[11px] font-medium text-blue-800 dark:text-blue-300">
            Tích phân chuẩn I
          </span>
          <div className="font-mono text-sm font-bold text-blue-700 dark:text-blue-400">
            {exactIntegral.toFixed(4)}
          </div>
        </div>

        <div className="rounded border border-amber-200 bg-amber-50/60 p-2 dark:border-amber-900 dark:bg-amber-950/40">
          <span className="text-[11px] font-medium text-amber-800 dark:text-amber-300">
            Tổng trên U(P)
          </span>
          <div className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400">
            {upperSum.toFixed(4)}
          </div>
        </div>

        <div className="rounded border border-purple-200 bg-purple-50/60 p-2 dark:border-purple-900 dark:bg-purple-950/40">
          <span className="text-[11px] font-medium text-purple-800 dark:text-purple-300">
            Độ lệch U(P) - L(P)
          </span>
          <div className="font-mono text-sm font-bold text-purple-700 dark:text-purple-400">
            {(upperSum - lowerSum).toFixed(4)}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>
          Bất đẳng thức kẹp Darboux:{' '}
          <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
            {lowerSum.toFixed(4)} ≤ {exactIntegral.toFixed(4)} ≤ {upperSum.toFixed(4)}
          </span>
        </span>
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {displayMode === 'midpoint'
            ? `Tổng Riemann S(P) = ${midpointSum.toFixed(4)}`
            : 'lim (U - L) = 0'}
        </span>
      </div>
    </Card>
  );
}
