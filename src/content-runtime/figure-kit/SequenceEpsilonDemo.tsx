import { useId, useMemo, useState } from 'react';
import { Card } from '@/shared/ui';

export interface SequenceEpsilonDemoProps {
  readonly title?: string;
  readonly defaultEpsilon?: number;
}

export function SequenceEpsilonDemo({
  title = 'Mô phỏng trực quan: Ngôn ngữ ε - N của Giới hạn Dãy số',
  defaultEpsilon = 0.15,
}: SequenceEpsilonDemoProps) {
  const sliderId = useId();
  const [epsilon, setEpsilon] = useState<number>(defaultEpsilon);

  // Dãy số x_n = (n - 1) / (n + 1) với giới hạn a = 1
  const limitA = 1.0;
  const maxN = 30;

  // Tính ngưỡng N(epsilon): |x_n - 1| = 2/(n+1) < eps <=> n + 1 > 2/eps <=> n > 2/eps - 1
  const thresholdN = useMemo(() => {
    const raw = Math.floor(2 / epsilon - 1) + 1;
    return Math.max(1, raw);
  }, [epsilon]);

  // Dữ liệu các điểm dãy số n = 1 .. maxN
  const points = useMemo(() => {
    const data: { n: number; x: number; inBand: boolean }[] = [];
    for (let n = 1; n <= maxN; n += 1) {
      const x = (n - 1) / (n + 1);
      const inBand = Math.abs(x - limitA) < epsilon;
      data.push({ n, x, inBand });
    }
    return data;
  }, [epsilon, maxN, limitA]);

  // Tọa độ SVG
  const svgWidth = 620;
  const svgHeight = 260;
  const marginX = 45;
  const marginTop = 30;
  const marginBottom = 35;
  const plotWidth = svgWidth - 2 * marginX;
  const plotHeight = svgHeight - marginTop - marginBottom;

  const yMin = 0.0;
  const yMax = 1.25;

  const toSvgX = (n: number): number => {
    return marginX + ((n - 1) / (maxN - 1)) * plotWidth;
  };

  const toSvgY = (yVal: number): number => {
    return marginTop + (1 - (yVal - yMin) / (yMax - yMin)) * plotHeight;
  };

  const bandTopY = toSvgY(Math.min(yMax, limitA + epsilon));
  const bandBottomY = toSvgY(Math.max(yMin, limitA - epsilon));
  const limitY = toSvgY(limitA);

  const pointsInside = points.filter((p) => p.inBand).length;
  const pointsOutside = points.length - pointsInside;

  return (
    <Card className="my-6 overflow-hidden border-stone-200 bg-white p-5 shadow-xs">
      <header className="mb-4">
        <h4 className="text-base font-semibold text-stone-900">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Định nghĩa giải tích khẳng định: khi $\lim x_n = a$, với mọi $\varepsilon &gt; 0$ tùy ý,
          luôn tìm được chỉ số ngưỡng $N$ sao cho với mọi số hạng thứ $n \ge N$, điểm $x_n$ đều lọt
          hoàn toàn vào dải băng $(a - \varepsilon, a + \varepsilon)$.
        </p>
      </header>

      {/* Điều khiển thanh trượt Epsilon */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200/80 bg-stone-50/80 p-3.5">
        <div className="flex min-w-[260px] flex-1 items-center gap-3">
          <label
            htmlFor={sliderId}
            className="text-xs font-semibold whitespace-nowrap text-stone-700"
          >
            Độ rộng dải băng $\varepsilon$:
          </label>
          <input
            id={sliderId}
            type="range"
            min={0.06}
            max={0.35}
            step={0.01}
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            className="h-2 flex-1 cursor-pointer accent-amber-600"
          />
          <span className="w-12 text-right font-mono text-xs font-bold text-amber-700">
            {epsilon.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-emerald-800">
            Ngưỡng N(ε) = <strong>{thresholdN}</strong>
          </span>
          <span className="rounded-md border border-stone-200 bg-white px-2.5 py-1 text-stone-600">
            Dãy: $x_n = \frac{'{'}n-1{'}'}
            {'{'}n+1{'}'}$
          </span>
        </div>
      </div>

      {/* Đồ thị SVG phân tán */}
      <div className="relative overflow-x-auto rounded-xl border border-stone-200 bg-linear-to-b from-stone-50/50 to-white py-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto block w-full max-w-[650px] select-none"
        >
          {/* Dải băng lân cận (a - epsilon, a + epsilon) */}
          <rect
            x={marginX}
            y={bandTopY}
            width={plotWidth}
            height={Math.max(2, bandBottomY - bandTopY)}
            fill="#f59e0b"
            fillOpacity={0.15}
            stroke="#f59e0b"
            strokeWidth={1}
            strokeDasharray="4 3"
          />

          {/* Đường giới hạn a = 1 */}
          <line
            x1={marginX}
            y1={limitY}
            x2={marginX + plotWidth}
            y2={limitY}
            stroke="#dc2626"
            strokeWidth={1.5}
            strokeDasharray="5 3"
          />
          <text
            x={marginX + plotWidth - 4}
            y={limitY - 6}
            textAnchor="end"
            className="fill-red-700 text-[11px] font-bold"
          >
            Giới hạn a = 1
          </text>

          {/* Nhãn biên dải băng a + eps và a - eps */}
          <text x={marginX + 6} y={bandTopY + 12} className="fill-amber-700 font-mono text-[9px]">
            1 + ε = {(limitA + epsilon).toFixed(2)}
          </text>
          <text x={marginX + 6} y={bandBottomY - 4} className="fill-amber-700 font-mono text-[9px]">
            1 - ε = {(limitA - epsilon).toFixed(2)}
          </text>

          {/* Đường phân cách ngưỡng N(epsilon) */}
          {thresholdN <= maxN && (
            <g>
              <line
                x1={toSvgX(thresholdN)}
                y1={marginTop}
                x2={toSvgX(thresholdN)}
                y2={marginTop + plotHeight}
                stroke="#059669"
                strokeWidth={1.5}
                strokeDasharray="3 3"
              />
              <text
                x={toSvgX(thresholdN)}
                y={marginTop - 8}
                textAnchor="middle"
                className="fill-emerald-700 font-mono text-[11px] font-bold"
              >
                N = {thresholdN}
              </text>
            </g>
          )}

          {/* Trục hoành và trục tung */}
          <line
            x1={marginX}
            y1={toSvgY(yMin)}
            x2={marginX + plotWidth}
            y2={toSvgY(yMin)}
            stroke="#78716c"
            strokeWidth={1.5}
          />
          <line
            x1={marginX}
            y1={marginTop}
            x2={marginX}
            y2={toSvgY(yMin)}
            stroke="#78716c"
            strokeWidth={1.5}
          />

          {/* Vạch chia trục hoành n = 1, 5, 10, 15, 20, 25, 30 */}
          {[1, 5, 10, 15, 20, 25, 30].map((nVal) => (
            <g key={nVal}>
              <line
                x1={toSvgX(nVal)}
                y1={toSvgY(yMin)}
                x2={toSvgX(nVal)}
                y2={toSvgY(yMin) + 4}
                stroke="#78716c"
                strokeWidth={1}
              />
              <text
                x={toSvgX(nVal)}
                y={toSvgY(yMin) + 16}
                textAnchor="middle"
                className="fill-stone-600 font-mono text-[10px]"
              >
                {nVal}
              </text>
            </g>
          ))}

          {/* Vạch chia trục tung y = 0, 0.5, 1.0 */}
          {[0, 0.5, 1.0].map((yVal) => (
            <g key={yVal}>
              <line
                x1={marginX - 4}
                y1={toSvgY(yVal)}
                x2={marginX}
                y2={toSvgY(yVal)}
                stroke="#78716c"
                strokeWidth={1}
              />
              <text
                x={marginX - 8}
                y={toSvgY(yVal) + 3}
                textAnchor="end"
                className="fill-stone-600 font-mono text-[10px]"
              >
                {yVal.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Nhãn trục n */}
          <text
            x={marginX + plotWidth}
            y={toSvgY(yMin) + 26}
            textAnchor="end"
            className="fill-stone-500 text-[10px] font-semibold italic"
          >
            Chỉ số n →
          </text>

          {/* Vẽ các điểm dãy số (n, x_n) */}
          {points.map(({ n, x, inBand }) => {
            const cx = toSvgX(n);
            const cy = toSvgY(x);
            return (
              <g key={n}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={inBand ? 4.5 : 3.5}
                  fill={inBand ? '#059669' : '#94a3b8'}
                  stroke={inBand ? '#ffffff' : '#475569'}
                  strokeWidth={1.5}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Thông tin đối chiếu logic */}
      <footer className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-3">
          <span className="text-[11px] font-semibold tracking-wider text-amber-700 uppercase">
            Dải băng (1 - ε, 1 + ε)
          </span>
          <p className="mt-0.5 font-mono text-xs text-stone-800">
            ({(limitA - epsilon).toFixed(2)}, {(limitA + epsilon).toFixed(2)})
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/60 p-3">
          <span className="text-[11px] font-semibold tracking-wider text-emerald-700 uppercase">
            Số hạng trong dải băng
          </span>
          <p className="mt-0.5 text-xs text-stone-800">
            {thresholdN <= maxN ? (
              <>
                Từ <strong>n = {thresholdN}</strong> đến <strong>n = {maxN}</strong> (tổng{' '}
                {pointsInside} điểm)
              </>
            ) : (
              <>Cần $n \ge {thresholdN}$ (vượt ngoài khung hiển thị)</>
            )}
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <span className="text-[11px] font-semibold tracking-wider text-stone-600 uppercase">
            Điểm nằm ngoài dải băng
          </span>
          <p className="mt-0.5 text-xs leading-snug text-stone-700">
            Chỉ có hữu hạn <strong>{pointsOutside}</strong> số hạng đầu ($n &lt; {thresholdN}$) nằm
            ngoài dải băng. Vô số phần tử còn lại đều nằm trong!
          </p>
        </div>
      </footer>
    </Card>
  );
}
