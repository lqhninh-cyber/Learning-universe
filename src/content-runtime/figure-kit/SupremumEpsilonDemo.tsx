import { useId, useMemo, useState } from 'react';
import { Card } from '@/shared/ui';

export interface SupremumEpsilonDemoProps {
  readonly title?: string;
  readonly defaultEpsilon?: number;
}

export function SupremumEpsilonDemo({
  title = 'Mô phỏng trực quan: Đặc trưng Epsilon của Supremum trên trục số thực',
  defaultEpsilon = 0.2,
}: SupremumEpsilonDemoProps) {
  const sliderId = useId();
  const [epsilon, setEpsilon] = useState<number>(defaultEpsilon);
  const [selectedSet, setSelectedSet] = useState<'continuous' | 'discrete'>('continuous');

  // Sup của cả hai tập mẫu đều là a = 1
  const supA = 1.0;
  const leftBound = Math.max(0, supA - epsilon);

  // Tính điểm chứng nhân x in E nằm trong (supA - epsilon, supA]
  const witness = useMemo(() => {
    if (selectedSet === 'continuous') {
      // Tập E = [0, 1) -> chọn điểm giữa x = 1 - epsilon / 2
      const x = supA - epsilon / 2;
      return {
        value: x,
        label: `x = 1 - ε/2 = ${x.toFixed(3)}`,
        explanation: `Điểm x = ${x.toFixed(3)} thuộc [0, 1) và thỏa mãn 1 - ε < x < 1.`,
      };
    } else {
      // Tập E = {1 - 1/n : n in N} -> n > 1/epsilon
      const n = Math.floor(1 / epsilon) + 1;
      const x = 1 - 1 / n;
      return {
        value: x,
        n,
        label: `x_${n} = 1 - 1/${n} ≈ ${x.toFixed(3)}`,
        explanation: `Theo nguyên lý Archimedes, chọn n = ${n} > 1/ε, điểm x_${n} = ${x.toFixed(3)} thuộc E và vượt qua 1 - ε.`,
      };
    }
  }, [epsilon, selectedSet]);

  // Các điểm rời rạc của tập E_2 để vẽ
  const discretePoints = useMemo(() => {
    const pts: { n: number; x: number }[] = [];
    for (let n = 1; n <= 25; n += 1) {
      pts.push({ n, x: 1 - 1 / n });
    }
    return pts;
  }, []);

  // Chuyển đổi tọa độ toán học x in [-0.1, 1.25] sang tọa độ SVG px
  const svgWidth = 600;
  const svgHeight = 160;
  const marginX = 40;
  const axisY = 90;
  const xMin = -0.05;
  const xMax = 1.2;

  const toSvgX = (val: number): number => {
    const ratio = (val - xMin) / (xMax - xMin);
    return marginX + ratio * (svgWidth - 2 * marginX);
  };

  return (
    <Card className="my-6 overflow-hidden border-stone-200 bg-white p-5 shadow-xs">
      <header className="mb-4">
        <h4 className="text-base font-semibold text-stone-900">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Định lý Mệnh đề 2.1.20 khẳng định: $a = \sup E \iff$ với mọi $\varepsilon &gt; 0$, luôn
          tìm được ít nhất một phần tử $x \in E$ sao cho $a - \varepsilon &lt; x \le a$. Kéo thanh
          trượt dưới đây để thu hẹp $\varepsilon$ và quan sát điểm chứng nhân $x$ luôn xuất hiện
          trong dải màu!
        </p>
      </header>

      {/* Bộ điều khiển */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-200/80 bg-stone-50/80 p-3.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold tracking-wide text-stone-600 uppercase">
            Chọn tập con $E$:
          </span>
          <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setSelectedSet('continuous')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedSet === 'continuous'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              $E = [0, 1)$
            </button>
            <button
              type="button"
              onClick={() => setSelectedSet('discrete')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedSet === 'discrete'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              E = {'{'}1 - 1/n{'}'}
            </button>
          </div>
        </div>

        <div className="flex min-w-[220px] flex-1 items-center gap-3">
          <label htmlFor={sliderId} className="text-xs font-semibold text-stone-700">
            Bán kính $\varepsilon$:
          </label>
          <input
            id={sliderId}
            type="range"
            min={0.03}
            max={0.45}
            step={0.01}
            value={epsilon}
            onChange={(e) => setEpsilon(parseFloat(e.target.value))}
            className="h-2 flex-1 cursor-pointer accent-amber-600"
          />
          <span className="w-12 text-right font-mono text-xs font-bold text-amber-700">
            {epsilon.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Trục số thực tương tác SVG */}
      <div className="relative overflow-x-auto rounded-xl border border-stone-200 bg-linear-to-b from-stone-50/40 to-white py-3">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto block w-full max-w-[650px] select-none"
        >
          <defs>
            {/* Mũi tên trục số */}
            <marker
              id="axis-arrow"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#78716c" />
            </marker>
          </defs>

          {/* Dải sáng biểu diễn khoảng (a - eps, a] */}
          <rect
            x={toSvgX(leftBound)}
            y={axisY - 26}
            width={toSvgX(supA) - toSvgX(leftBound)}
            height={52}
            fill="#f59e0b"
            fillOpacity={0.18}
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            rx={4}
          />

          {/* Nhãn khoảng (a - eps, a] */}
          <text
            x={(toSvgX(leftBound) + toSvgX(supA)) / 2}
            y={axisY - 32}
            textAnchor="middle"
            className="fill-amber-800 text-[11px] font-medium"
          >
            Khoảng (a - ε, a]
          </text>

          {/* Trục số chính */}
          <line
            x1={toSvgX(xMin)}
            y1={axisY}
            x2={toSvgX(xMax) + 16}
            y2={axisY}
            stroke="#78716c"
            strokeWidth={2}
            markerEnd="url(#axis-arrow)"
          />

          {/* Các vạch chia 0.0, 0.2, 0.4, 0.6, 0.8, 1.0 */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((val) => (
            <g key={val}>
              <line
                x1={toSvgX(val)}
                y1={axisY - 6}
                x2={toSvgX(val)}
                y2={axisY + 6}
                stroke="#a8a29e"
                strokeWidth={1.5}
              />
              <text
                x={toSvgX(val)}
                y={axisY + 22}
                textAnchor="middle"
                className="fill-stone-600 font-mono text-[11px]"
              >
                {val.toFixed(1)}
              </text>
            </g>
          ))}

          {/* Biểu diễn Tập E */}
          {selectedSet === 'continuous' ? (
            /* Đoạn liên tục [0, 1) */
            <g>
              <line
                x1={toSvgX(0)}
                y1={axisY}
                x2={toSvgX(1)}
                y2={axisY}
                stroke="#0284c7"
                strokeWidth={6}
                strokeLinecap="round"
                opacity={0.7}
              />
              {/* Điểm mút 0 thuộc E */}
              <circle cx={toSvgX(0)} cy={axisY} r={4.5} fill="#0284c7" />
              {/* Điểm mút 1 không thuộc E (vòng tròn rỗng) */}
              <circle
                cx={toSvgX(1)}
                cy={axisY}
                r={5}
                fill="white"
                stroke="#0284c7"
                strokeWidth={2}
              />
            </g>
          ) : (
            /* Tập rời rạc 1 - 1/n */
            <g>
              {discretePoints.map(({ n, x }) => (
                <circle
                  key={n}
                  cx={toSvgX(x)}
                  cy={axisY}
                  r={3.5}
                  fill="#0284c7"
                  opacity={n > 10 ? 0.4 : 0.8}
                />
              ))}
            </g>
          )}

          {/* Điểm a - epsilon (mút trái) */}
          <line
            x1={toSvgX(leftBound)}
            y1={axisY - 14}
            x2={toSvgX(leftBound)}
            y2={axisY + 14}
            stroke="#d97706"
            strokeWidth={2}
          />
          <text
            x={toSvgX(leftBound)}
            y={axisY + 38}
            textAnchor="middle"
            className="fill-amber-700 font-mono text-[10px] font-bold"
          >
            {leftBound.toFixed(2)}
          </text>
          <text
            x={toSvgX(leftBound)}
            y={axisY + 50}
            textAnchor="middle"
            className="fill-amber-800 text-[9px]"
          >
            a - ε
          </text>

          {/* Điểm Supremum a = 1 */}
          <g>
            <circle cx={toSvgX(supA)} cy={axisY} r={6} fill="#dc2626" />
            <text
              x={toSvgX(supA)}
              y={axisY - 14}
              textAnchor="middle"
              className="fill-red-700 text-[11px] font-bold"
            >
              sup E = 1
            </text>
          </g>

          {/* Điểm chứng nhân witness x */}
          <g>
            <circle
              cx={toSvgX(witness.value)}
              cy={axisY}
              r={7}
              fill="#16a34a"
              stroke="#ffffff"
              strokeWidth={2}
            />
            {/* Nhãn điểm x */}
            <path
              d={`M ${toSvgX(witness.value)} ${axisY - 8} L ${toSvgX(witness.value)} ${axisY - 22}`}
              stroke="#16a34a"
              strokeWidth={1.5}
            />
            <text
              x={toSvgX(witness.value)}
              y={axisY - 26}
              textAnchor="middle"
              className="fill-emerald-800 text-[11px] font-bold"
            >
              x ∈ E
            </text>
          </g>
        </svg>
      </div>

      {/* Kết quả tính toán & Đối thoại logic */}
      <footer className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-200/70 bg-amber-50/60 p-3">
          <span className="text-[11px] font-semibold tracking-wider text-amber-700 uppercase">
            Cận kiểm tra
          </span>
          <p className="mt-0.5 font-mono text-xs text-stone-800">
            a - ε = 1 - {epsilon.toFixed(2)} = <strong>{leftBound.toFixed(2)}</strong>
          </p>
        </div>

        <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/60 p-3">
          <span className="text-[11px] font-semibold tracking-wider text-emerald-700 uppercase">
            Điểm tìm được trong E
          </span>
          <p className="mt-0.5 font-mono text-xs text-stone-800">
            <strong>{witness.label}</strong>
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
          <span className="text-[11px] font-semibold tracking-wider text-stone-600 uppercase">
            Ý nghĩa toán học
          </span>
          <p className="mt-0.5 text-xs leading-snug text-stone-700">
            Vì $x &gt; a - \varepsilon$, số $a - \varepsilon$ không thể là cận trên của $E$. Do đó
            $a$ là cận trên nhỏ nhất!
          </p>
        </div>
      </footer>
    </Card>
  );
}
