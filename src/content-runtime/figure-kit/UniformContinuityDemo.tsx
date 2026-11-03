import { useCallback, useId, useMemo, useState } from 'react';
import { Card } from '@/shared/ui';

export interface UniformContinuityDemoProps {
  readonly title?: string;
  readonly defaultX0?: number;
  readonly defaultEpsilon?: number;
}

export function UniformContinuityDemo({
  title = 'Mô phỏng trực quan: Liên tục tại điểm vs. Liên tục đều trên f(x) = x²',
  defaultX0 = 1.5,
  defaultEpsilon = 1.0,
}: UniformContinuityDemoProps) {
  const x0SliderId = useId();
  const epsSliderId = useId();

  const [x0, setX0] = useState<number>(defaultX0);
  const [epsilon, setEpsilon] = useState<number>(defaultEpsilon);

  // Hàm số f(x) = x^2 trên miền x >= 0
  const y0 = x0 * x0;
  const yTop = y0 + epsilon;
  const yBottom = Math.max(0, y0 - epsilon);

  // Khoảng lân cận trên trục hoành: (x_left, x_right)
  const xLeft = Math.sqrt(yBottom);
  const xRight = Math.sqrt(yTop);

  // Delta tối đa để (x0 - delta, x0 + delta) nằm trọn trong (xLeft, xRight)
  // Vì độ dốc tăng dần, xRight - x0 < x0 - xLeft, nên delta = xRight - x0
  const delta = Math.min(x0 - xLeft, xRight - x0);

  // SVG coordinate configuration
  const svgWidth = 620;
  const svgHeight = 280;
  const marginX = 50;
  const marginTop = 20;
  const marginBottom = 40;
  const plotWidth = svgWidth - 2 * marginX;
  const plotHeight = svgHeight - marginTop - marginBottom;

  const domainXMax = 4.2;
  const rangeYMax = 18.0;

  const toSvgX = useCallback(
    (xVal: number): number => {
      return marginX + (Math.max(0, Math.min(domainXMax, xVal)) / domainXMax) * plotWidth;
    },
    [plotWidth],
  );

  const toSvgY = useCallback(
    (yVal: number): number => {
      return marginTop + (1 - Math.max(0, Math.min(rangeYMax, yVal)) / rangeYMax) * plotHeight;
    },
    [plotHeight],
  );

  // Tạo đường cong parabol f(x) = x^2
  const curvePath = useMemo(() => {
    const steps = 80;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const x = (i / steps) * domainXMax;
      const y = x * x;
      if (y <= rangeYMax) {
        pts.push(`${i === 0 ? 'M' : 'L'} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }, [toSvgX, toSvgY]);

  const svgX0 = toSvgX(x0);
  const svgY0 = toSvgY(y0);
  const svgYTop = toSvgY(yTop);
  const svgYBottom = toSvgY(yBottom);
  const svgXLeft = toSvgX(x0 - delta);
  const svgXRight = toSvgX(x0 + delta);

  return (
    <Card className="my-6 overflow-hidden border-stone-200 bg-white p-5 shadow-xs">
      <header className="mb-4">
        <h4 className="text-base font-semibold text-stone-900">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Quan sát hàm số $f(x) = x^2$: cùng một dung sai sai số $\varepsilon$, khi điểm kiểm tra
          $x_0$ dịch chuyển càng xa gốc tọa độ, độ dốc của tiếp tuyến tăng vọt khiến khoảng dung sai
          $\delta(x_0, \varepsilon) \approx \varepsilon / (2x_0)$ bị thu hẹp dần về $0$. Do đó không
          tồn tại một số $\delta &gt; 0$ chung cho toàn bộ tập số thực.
        </p>
      </header>

      {/* Bộ điều khiển tương tác */}
      <div className="mb-5 grid grid-cols-1 gap-4 rounded-xl border border-stone-200/80 bg-stone-50/80 p-3.5 sm:grid-cols-2">
        {/* Điều khiển x0 */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <label htmlFor={x0SliderId}>
              Vị trí điểm khảo sát $x_0$:{' '}
              <span className="font-mono text-amber-700">{x0.toFixed(2)}</span>
            </label>
            <div className="flex gap-1">
              {[1.0, 2.0, 3.2].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setX0(preset)}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                    Math.abs(x0 - preset) < 0.05
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  x={preset}
                </button>
              ))}
            </div>
          </div>
          <input
            id={x0SliderId}
            type="range"
            min={0.5}
            max={3.8}
            step={0.05}
            value={x0}
            onChange={(e) => setX0(parseFloat(e.target.value))}
            className="h-2 cursor-pointer accent-amber-600"
          />
        </div>

        {/* Điều khiển Epsilon */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
            <label htmlFor={epsSliderId}>
              Độ rộng dung sai $\varepsilon$:{' '}
              <span className="font-mono text-cyan-700">{epsilon.toFixed(2)}</span>
            </label>
            <span className="text-[11px] text-stone-500">
              $y_0 \pm \varepsilon = [{yBottom.toFixed(1)}; {yTop.toFixed(1)}]$
            </span>
          </div>
          <input
            id={epsSliderId}
            type="range"
            min={0.4}
            max={3.0}
            step={0.1}
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            className="h-2 cursor-pointer accent-cyan-600"
          />
        </div>
      </div>

      {/* Đồ thị SVG tương tác */}
      <div className="relative overflow-x-auto rounded-lg border border-stone-200 bg-stone-900/95 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto block w-full max-w-[620px]"
          aria-label="Đồ thị hàm số x^2 và dải epsilon-delta"
        >
          {/* Lưới tọa độ phụ */}
          <line
            x1={marginX}
            y1={toSvgY(0)}
            x2={svgWidth - marginX}
            y2={toSvgY(0)}
            stroke="#52525b"
            strokeWidth="1.5"
          />
          <line
            x1={marginX}
            y1={marginTop}
            x2={marginX}
            y2={svgHeight - marginBottom}
            stroke="#52525b"
            strokeWidth="1.5"
          />

          {/* Dải băng Epsilon ngang trên trục tung */}
          <rect
            x={marginX}
            y={Math.min(svgYTop, svgYBottom)}
            width={plotWidth}
            height={Math.abs(svgYBottom - svgYTop)}
            fill="rgba(6, 182, 212, 0.12)"
          />
          <line
            x1={marginX}
            y1={svgYTop}
            x2={svgWidth - marginX}
            y2={svgYTop}
            stroke="#06b6d4"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={marginX}
            y1={svgYBottom}
            x2={svgWidth - marginX}
            y2={svgYBottom}
            stroke="#06b6d4"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Dải Delta tương ứng dọc trên trục hoành */}
          <rect
            x={svgXLeft}
            y={marginTop}
            width={svgXRight - svgXLeft}
            height={plotHeight}
            fill="rgba(245, 158, 11, 0.15)"
          />
          <line
            x1={svgXLeft}
            y1={marginTop}
            x2={svgXLeft}
            y2={toSvgY(0)}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          <line
            x1={svgXRight}
            y1={marginTop}
            x2={svgXRight}
            y2={toSvgY(0)}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Đường cong parabol y = x^2 */}
          <path d={curvePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

          {/* Dóng tọa độ điểm (x0, y0) */}
          <line
            x1={svgX0}
            y1={svgY0}
            x2={svgX0}
            y2={toSvgY(0)}
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <line
            x1={marginX}
            y1={svgY0}
            x2={svgX0}
            y2={svgY0}
            stroke="#fbbf24"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Điểm (x0, y0) */}
          <circle cx={svgX0} cy={svgY0} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

          {/* Nhãn văn bản SVG */}
          <text
            x={svgWidth - marginX - 10}
            y={toSvgY(0) + 18}
            fill="#a1a1aa"
            fontSize="11"
            textAnchor="end"
          >
            x
          </text>
          <text x={marginX + 10} y={marginTop + 12} fill="#a1a1aa" fontSize="11">
            y = f(x) = x²
          </text>

          {/* Nhãn x0 trên trục x */}
          <text
            x={svgX0}
            y={toSvgY(0) + 18}
            fill="#fbbf24"
            fontSize="11"
            fontWeight="bold"
            textAnchor="middle"
          >
            x₀ ({x0.toFixed(1)})
          </text>

          {/* Nhãn y0 trên trục y */}
          <text x={marginX - 8} y={svgY0 + 4} fill="#fbbf24" fontSize="10" textAnchor="end">
            y₀ ({y0.toFixed(1)})
          </text>

          {/* Đoạn hiển thị delta trên trục x */}
          <line
            x1={svgXLeft}
            y1={toSvgY(0) + 26}
            x2={svgXRight}
            y2={toSvgY(0) + 26}
            stroke="#f59e0b"
            strokeWidth="2"
          />
          <text
            x={svgX0}
            y={toSvgY(0) + 38}
            fill="#f59e0b"
            fontSize="10"
            fontWeight="bold"
            textAnchor="middle"
          >
            2δ = {(2 * delta).toFixed(3)}
          </text>
        </svg>
      </div>

      {/* Bảng phân tích trạng thái động */}
      <footer className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-stone-500">Điểm kiểm tra:</span>
          <span className="font-mono text-sm font-bold text-amber-800">
            x₀ = {x0.toFixed(2)}, f(x₀) = {y0.toFixed(2)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-stone-500">Độ mở dung sai yêu cầu:</span>
          <span className="font-mono text-sm font-bold text-cyan-800">
            δ(x₀, ε) = {delta.toFixed(4)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-stone-500">Nhận định giải tích:</span>
          <span className="text-xs text-stone-700">
            {x0 > 2.8
              ? "δ bị co lại rất nhỏ do độ dốc f'(x) = 2x tăng cao. Không thể chọn δ chung cho ℝ!"
              : x0 > 1.5
                ? 'δ bắt đầu thu hẹp đáng kể khi x₀ rời xa gốc tọa độ.'
                : 'Ở gần gốc tọa độ, độ dốc nhỏ nên δ tương đối rộng rãi.'}
          </span>
        </div>
      </footer>
    </Card>
  );
}
