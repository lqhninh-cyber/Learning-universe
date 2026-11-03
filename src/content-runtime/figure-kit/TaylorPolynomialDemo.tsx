import { useCallback, useId, useMemo, useState } from 'react';
import { Card } from '@/shared/ui';

export interface TaylorPolynomialDemoProps {
  readonly title?: string;
  readonly defaultFunction?: 'sin' | 'exp';
  readonly defaultOrder?: number;
}

export function TaylorPolynomialDemo({
  title = 'Mô phỏng trực quan: Khai triển Taylor - Maclaurin ôm sát đồ thị hàm số',
  defaultFunction = 'sin',
  defaultOrder = 3,
}: TaylorPolynomialDemoProps) {
  const sliderId = useId();
  const [selectedFunc, setSelectedFunc] = useState<'sin' | 'exp'>(defaultFunction);
  const [order, setOrder] = useState<number>(defaultOrder);
  const [inspectX, setInspectX] = useState<number>(1.5);

  // Tính giai thừa k!
  const factorial = (k: number): number => {
    let res = 1;
    for (let i = 2; i <= k; i += 1) res *= i;
    return res;
  };

  // Tính giá trị đa thức Taylor Tn(x) tại điểm x
  const evalTaylor = useCallback(
    (x: number, funcType: 'sin' | 'exp', n: number): number => {
      if (funcType === 'sin') {
        // sin(x) = x - x^3/3! + x^5/5! - x^7/7!
        let sum = 0;
        for (let k = 0; 2 * k + 1 <= n; k += 1) {
          const power = 2 * k + 1;
          const sign = k % 2 === 0 ? 1 : -1;
          sum += (sign * Math.pow(x, power)) / factorial(power);
        }
        return sum;
      } else {
        // e^x = 1 + x + x^2/2! + ... + x^n/n!
        let sum = 0;
        for (let k = 0; k <= n; k += 1) {
          sum += Math.pow(x, k) / factorial(k);
        }
        return sum;
      }
    },
    [],
  );

  // Tính giá trị hàm gốc f(x)
  const evalOriginal = useCallback((x: number, funcType: 'sin' | 'exp'): number => {
    return funcType === 'sin' ? Math.sin(x) : Math.exp(x);
  }, []);

  // Cấu hình miền hiển thị SVG
  const isSin = selectedFunc === 'sin';
  const xMin = isSin ? -4.5 : -3.0;
  const xMax = isSin ? 4.5 : 2.5;
  const yMin = isSin ? -2.2 : -0.8;
  const yMax = isSin ? 2.2 : 9.5;

  const svgWidth = 620;
  const svgHeight = 280;
  const marginX = 45;
  const marginTop = 25;
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

  // Tạo đường dẫn SVG cho hàm gốc f(x)
  const originalCurvePath = useMemo(() => {
    const steps = 100;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evalOriginal(x, selectedFunc);
      if (y >= yMin - 1 && y <= yMax + 1) {
        pts.push(`${pts.length === 0 ? 'M' : 'L'} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }, [xMin, xMax, yMin, yMax, selectedFunc, evalOriginal, toSvgX, toSvgY]);

  // Tạo đường dẫn SVG cho đa thức Taylor Tn(x)
  const taylorCurvePath = useMemo(() => {
    const steps = 120;
    const pts: string[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const x = xMin + (i / steps) * (xMax - xMin);
      const y = evalTaylor(x, selectedFunc, order);
      if (y >= yMin - 1 && y <= yMax + 1) {
        pts.push(`${pts.length === 0 ? 'M' : 'L'} ${toSvgX(x).toFixed(1)} ${toSvgY(y).toFixed(1)}`);
      }
    }
    return pts.join(' ');
  }, [xMin, xMax, yMin, yMax, selectedFunc, order, evalTaylor, toSvgX, toSvgY]);

  // Giá trị tại điểm khảo sát
  const actualY = evalOriginal(inspectX, selectedFunc);
  const approxY = evalTaylor(inspectX, selectedFunc, order);
  const absError = Math.abs(actualY - approxY);

  const inspectSvgX = toSvgX(inspectX);
  const actualSvgY = toSvgY(actualY);
  const approxSvgY = toSvgY(approxY);

  // Chuỗi công thức đa thức Taylor
  const formulaText = useMemo(() => {
    if (selectedFunc === 'sin') {
      const terms: string[] = [];
      if (order >= 1) terms.push('x');
      if (order >= 3) terms.push('- x³/3!');
      if (order >= 5) terms.push('+ x⁵/5!');
      if (order >= 7) terms.push('- x⁷/7!');
      return `T_${order}(x) = ${terms.join(' ') || '0'}`;
    } else {
      const terms: string[] = ['1'];
      if (order >= 1) terms.push('+ x');
      if (order >= 2) terms.push('+ x²/2!');
      if (order >= 3) terms.push('+ x³/3!');
      if (order >= 4) terms.push('+ x⁴/4!');
      if (order >= 5) terms.push('+ x⁵/5!');
      if (order >= 6) terms.push('+ x⁶/6!');
      if (order >= 7) terms.push('+ x⁷/7!');
      return `T_${order}(x) = ${terms.join(' ')}`;
    }
  }, [selectedFunc, order]);

  return (
    <Card className="my-6 overflow-hidden border-stone-200 bg-white p-5 shadow-xs">
      <header className="mb-4">
        <h4 className="text-base font-semibold text-stone-900">{title}</h4>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Quan sát sự xấp xỉ địa phương của đa thức Maclaurin quanh gốc tọa độ $x_0 = 0$. Khi tăng
          bậc $n$ từ $1$ đến $7$, đồ thị đa thức màu vàng ôm sát đường cong gốc màu xanh ngọc bích
          trên một khoảng ngày càng mở rộng ra hai phía.
        </p>
      </header>

      {/* Điều khiển chọn hàm và chọn bậc */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200/80 bg-stone-50/80 p-3.5">
        {/* Chọn hàm */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-700">Hàm số:</span>
          <div className="flex rounded-lg border border-stone-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => {
                setSelectedFunc('sin');
                setInspectX(1.5);
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                selectedFunc === 'sin'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              f(x) = sin(x)
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedFunc('exp');
                setInspectX(1.2);
              }}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                selectedFunc === 'exp'
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              f(x) = eˣ
            </button>
          </div>
        </div>

        {/* Chọn bậc n */}
        <div className="flex flex-1 min-w-[240px] items-center gap-3">
          <label htmlFor={sliderId} className="text-xs font-semibold text-stone-700 whitespace-nowrap">
            Bậc đa thức Taylor n = <span className="font-mono text-amber-700 font-bold">{order}</span>:
          </label>
          <input
            id={sliderId}
            type="range"
            min={1}
            max={7}
            step={1}
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value, 10))}
            className="h-2 flex-1 cursor-pointer accent-amber-600"
          />
          <div className="flex gap-1">
            {[1, 3, 5, 7].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setOrder(preset)}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                  order === preset ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                n={preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Đồ thị SVG trực quan */}
      <div className="relative overflow-x-auto rounded-lg border border-stone-200 bg-stone-900/95 p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="mx-auto block w-full max-w-[620px]"
          aria-label="Đồ thị hàm số và đa thức Taylor"
        >
          {/* Trục hoành và trục tung */}
          <line
            x1={marginX}
            y1={toSvgY(0)}
            x2={svgWidth - marginX}
            y2={toSvgY(0)}
            stroke="#52525b"
            strokeWidth="1.5"
          />
          <line
            x1={toSvgX(0)}
            y1={marginTop}
            x2={toSvgX(0)}
            y2={svgHeight - marginBottom}
            stroke="#52525b"
            strokeWidth="1.5"
          />

          {/* Đồ thị hàm gốc f(x) */}
          <path d={originalCurvePath} fill="none" stroke="#38bdf8" strokeWidth="2.5" />

          {/* Đồ thị đa thức Taylor Tn(x) */}
          <path d={taylorCurvePath} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="5 3" />

          {/* Điểm khảo sát x */}
          {inspectX >= xMin && inspectX <= xMax && (
            <>
              {/* Dóng thẳng đứng giữa 2 giá trị */}
              <line
                x1={inspectSvgX}
                y1={actualSvgY}
                x2={inspectSvgX}
                y2={approxSvgY}
                stroke="#f43f5e"
                strokeWidth="2"
              />
              {/* Điểm thực f(x) */}
              <circle cx={inspectSvgX} cy={actualSvgY} r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              {/* Điểm xấp xỉ Tn(x) */}
              <circle cx={inspectSvgX} cy={approxSvgY} r="4.5" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
            </>
          )}

          {/* Gốc tọa độ O */}
          <circle cx={toSvgX(0)} cy={toSvgY(0)} r="3" fill="#a1a1aa" />
          <text x={toSvgX(0) - 10} y={toSvgY(0) + 14} fill="#a1a1aa" fontSize="10">
            0
          </text>

          {/* Chú giải đồ thị trực tiếp trong SVG */}
          <g transform={`translate(${marginX + 10}, ${marginTop + 12})`}>
            <line x1="0" y1="0" x2="18" y2="0" stroke="#38bdf8" strokeWidth="2.5" />
            <text x="24" y="3.5" fill="#38bdf8" fontSize="10" fontWeight="bold">
              Hàm gốc: {isSin ? 'y = sin(x)' : 'y = eˣ'}
            </text>
            <line x1="140" y1="0" x2="158" y2="0" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="4 2" />
            <text x="164" y="3.5" fill="#f59e0b" fontSize="10" fontWeight="bold">
              Đa thức Taylor T_{order}(x)
            </text>
          </g>
        </svg>
      </div>

      {/* Thông số tính toán và công thức */}
      <footer className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-stone-200 bg-stone-50 p-3 sm:grid-cols-3">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-stone-500">Khai triển Maclaurin bậc {order}:</span>
          <span className="font-mono text-xs font-bold text-amber-800 break-words">
            {formulaText}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-stone-500">Tại điểm kiểm tra x = {inspectX.toFixed(1)}:</span>
          <span className="font-mono text-xs text-stone-700">
            f(x) = {actualY.toFixed(4)} | T_{order}(x) = {approxY.toFixed(4)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-stone-500">Sai số phần dư |R_{order}(x)|:</span>
          <span
            className={`font-mono text-xs font-bold ${
              absError < 0.01 ? 'text-emerald-700' : absError < 0.2 ? 'text-amber-700' : 'text-rose-700'
            }`}
          >
            {absError.toFixed(6)} {absError < 0.001 ? '(Rất chính xác!)' : ''}
          </span>
        </div>
      </footer>
    </Card>
  );
}
