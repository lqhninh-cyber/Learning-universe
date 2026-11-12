import { useCallback, useMemo, useState } from 'react';
import { InteractiveVizFrame } from './InteractiveVizFrame';
import { useSvgDrag } from './useSvgDrag';
import { computeBarycenter, formatSigned, toMathCoords, type Point2D } from './viz-math';

type VertexKey = 'p1' | 'p2' | 'p3';

const ORIGIN: Point2D = { x: 270, y: 165 };
const PX_PER_UNIT = 40;

const INITIAL_POINTS: Record<VertexKey, Point2D> = {
  p1: { x: 130, y: 245 },
  p2: { x: 410, y: 245 },
  p3: { x: 270, y: 65 },
};

const INITIAL_WEIGHTS: [number, number, number] = [1, 1, 1];

interface BaryPreset {
  id: string;
  label: string;
  weights: [number, number, number];
}

const PRESETS: readonly BaryPreset[] = [
  { id: 'centroid', label: 'Trọng tâm (1, 1, 1)', weights: [1, 1, 1] },
  { id: 'edge', label: 'Biên đơn hình (1, 1, 0)', weights: [1, 1, 0] },
  { id: 'outside', label: 'Ngoài Δ (-0.5, 1.5, 1)', weights: [-0.5, 1.5, 1] },
  { id: 'degenerate', label: 'Suy biến ∑λᵢ = 0 (1, 1, -2)', weights: [1, 1, -2] },
];

export function BarycentricViz() {
  const [points, setPoints] = useState<Record<VertexKey, Point2D>>(INITIAL_POINTS);
  const [weights, setWeights] = useState<[number, number, number]>(INITIAL_WEIGHTS);

  const handlePointDrag = useCallback((id: VertexKey, pt: Point2D) => {
    setPoints((prev) => ({ ...prev, [id]: pt }));
  }, []);

  const { svgRef, activeId, startDrag, handleSvgPointerMove, stopDrag, nudgePoint } =
    useSvgDrag<VertexKey>({ onDrag: handlePointDrag });

  const handleReset = useCallback(() => {
    setPoints(INITIAL_POINTS);
    setWeights(INITIAL_WEIGHTS);
  }, []);

  const updateWeight = useCallback((index: 0 | 1 | 2, nextVal: number) => {
    setWeights((prev) => {
      const updated: [number, number, number] = [prev[0], prev[1], prev[2]];
      updated[index] = nextVal;
      return updated;
    });
  }, []);

  const mathData = useMemo(() => {
    const m1 = toMathCoords(points.p1, ORIGIN, PX_PER_UNIT);
    const m2 = toMathCoords(points.p2, ORIGIN, PX_PER_UNIT);
    const m3 = toMathCoords(points.p3, ORIGIN, PX_PER_UNIT);
    const svgRes = computeBarycenter([points.p1, points.p2, points.p3], weights);
    const mathRes = computeBarycenter([m1, m2, m3], weights);

    // Centroid for anchoring the free vector when sum == 0
    const centroidSvg: Point2D = {
      x: (points.p1.x + points.p2.x + points.p3.x) / 3,
      y: (points.p1.y + points.p2.y + points.p3.y) / 3,
    };

    const freeEndSvg: Point2D = {
      x: centroidSvg.x + mathRes.freeVector.x * (PX_PER_UNIT * 0.28),
      y: centroidSvg.y - mathRes.freeVector.y * (PX_PER_UNIT * 0.28),
    };

    return { m1, m2, m3, svgRes, mathRes, centroidSvg, freeEndSvg };
  }, [points, weights]);

  const { svgRes, mathRes, centroidSvg, freeEndSvg } = mathData;
  const activePreset = PRESETS.find(
    (p) =>
      Math.abs(p.weights[0] - weights[0]) < 1e-6 &&
      Math.abs(p.weights[1] - weights[1]) < 1e-6 &&
      Math.abs(p.weights[2] - weights[2]) < 1e-6,
  );

  const controls = (
    <>
      <div className="vc-sliders">
        {([0, 1, 2] as const).map((idx) => (
          <label key={idx} className="vc-field">
            <span className="vc-label-row">
              <span>Hệ số λ{idx + 1}</span>
              <span className="vc-value">{formatSigned(weights[idx], 2)}</span>
            </span>
            <input
              type="range"
              min={-2}
              max={3}
              step={0.25}
              value={weights[idx]}
              aria-label={`Hệ số lambda ${idx + 1}`}
              onChange={(e) => updateWeight(idx, Number(e.target.value))}
              className="vc-range"
            />
          </label>
        ))}
      </div>

      <div className="vc-actions" role="group" aria-label="Cấu hình mẫu tâm tỉ cự">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="viz-btn"
            data-active={activePreset?.id === preset.id ? 'true' : 'false'}
            onClick={() => setWeights(preset.weights)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </>
  );

  const info = (
    <>
      <div className="vi-metrics">
        <span className="vi-metric">
          <span className="vi-metric-label">Tổng trọng số ∑λᵢ =</span>
          <span className="vi-metric-value">{formatSigned(mathRes.sum, 2)}</span>
        </span>
        {mathRes.exists && mathRes.point && mathRes.normalizedWeights ? (
          <>
            <span className="vi-metric">
              <span className="vi-metric-label">Tâm tỉ cự G =</span>
              <span className="vi-metric-value">
                ({formatSigned(mathRes.point.x)}, {formatSigned(mathRes.point.y)})
              </span>
            </span>
            <span className="vi-metric">
              <span className="vi-metric-label">Tọa độ tỉ cự chuẩn hóa =</span>
              <span className="vi-metric-value">
                ({mathRes.normalizedWeights.map((w) => formatSigned(w)).join(', ')})
              </span>
            </span>
          </>
        ) : (
          <span className="vi-metric">
            <span className="vi-metric-label">Véc-tơ tự do ∑λᵢ OPᵢ =</span>
            <span className="vi-metric-value">
              ({formatSigned(mathRes.freeVector.x)}, {formatSigned(mathRes.freeVector.y)})
            </span>
          </span>
        )}
      </div>

      {!mathRes.exists ? (
        <div className="viz-alert" role="status">
          Tổng trọng số ∑λᵢ = 0 (suy biến): Tâm tỉ cự G không tồn tại. Tổ hợp ∑λᵢ·OPᵢ không phụ
          thuộc gốc O và trở thành một véc-tơ tự do không đổi.
        </div>
      ) : (
        <p className="vi-note">
          Kéo các đỉnh P₁, P₂, P₃ hoặc chỉnh λ₁, λ₂, λ₃.{' '}
          {mathRes.inSimplex
            ? 'Vì mọi λᵢ/∑λⱼ ≥ 0 nên G nằm trong hoặc trên biên đơn hình ΔP₁P₂P₃.'
            : 'Vì tồn tại hệ số chuẩn hóa âm nên G nằm ngoài đơn hình ΔP₁P₂P₃.'}
        </p>
      )}
    </>
  );

  const vertexMeta: Array<{ key: VertexKey; label: string; color: string }> = [
    { key: 'p1', label: 'P₁', color: 'var(--viz-primary)' },
    { key: 'p2', label: 'P₂', color: 'var(--viz-secondary)' },
    { key: 'p3', label: 'P₃', color: 'var(--viz-purple)' },
  ];

  return (
    <InteractiveVizFrame
      title="Tâm tỉ cự và Đơn hình afin ΔP₁P₂P₃"
      subtitle="Quan sát đẳng thức ∑λᵢ·GPᵢ = 0⃗ và trường hợp suy biến ∑λᵢ = 0"
      onReset={handleReset}
      svgRef={svgRef}
      onSvgPointerMove={handleSvgPointerMove}
      onSvgPointerUp={stopDrag}
      svgAriaLabel="Minh họa tương tác tâm tỉ cự G của ba điểm P1, P2, P3"
      controls={controls}
      info={info}
      svgChildren={
        <>
          {/* Faint coordinate axes */}
          <line
            x1={20}
            y1={ORIGIN.y}
            x2={520}
            y2={ORIGIN.y}
            stroke="var(--viz-axis)"
            strokeWidth={1}
          />
          <line
            x1={ORIGIN.x}
            y1={15}
            x2={ORIGIN.x}
            y2={305}
            stroke="var(--viz-axis)"
            strokeWidth={1}
          />
          <circle cx={ORIGIN.x} cy={ORIGIN.y} r={3} fill="var(--viz-axis)" />
          <text x={ORIGIN.x + 6} y={ORIGIN.y + 14} fontSize={11} fill="var(--text-muted, #475569)">
            O
          </text>

          {/* Triangle P1P2P3 */}
          <polygon
            points={`${points.p1.x},${points.p1.y} ${points.p2.x},${points.p2.y} ${points.p3.x},${points.p3.y}`}
            fill={svgRes.inSimplex ? 'var(--viz-simplex)' : 'transparent'}
            stroke="var(--viz-primary)"
            strokeWidth={2}
            strokeDasharray={svgRes.inSimplex ? undefined : '5 4'}
          />

          {/* Barycenter rays or degenerate free vector */}
          {svgRes.exists && svgRes.point ? (
            <>
              {vertexMeta.map(({ key, color }) => (
                <line
                  key={key}
                  x1={svgRes.point!.x}
                  y1={svgRes.point!.y}
                  x2={points[key].x}
                  y2={points[key].y}
                  stroke={color}
                  strokeWidth={1.6}
                  strokeDasharray="4 3"
                  opacity={0.85}
                />
              ))}
              <circle
                cx={svgRes.point.x}
                cy={svgRes.point.y}
                r={8}
                fill="var(--viz-accent)"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={svgRes.point.x + 12}
                y={svgRes.point.y - 8}
                fontSize={13}
                fontWeight={700}
                fill="var(--viz-accent)"
              >
                G
              </text>
            </>
          ) : (
            <>
              <line
                x1={centroidSvg.x}
                y1={centroidSvg.y}
                x2={freeEndSvg.x}
                y2={freeEndSvg.y}
                stroke="var(--viz-accent)"
                strokeWidth={3}
                markerEnd="url(#viz-arrow-accent)"
              />
              <text
                x={freeEndSvg.x + 8}
                y={freeEndSvg.y - 6}
                fontSize={12}
                fontWeight={700}
                fill="var(--viz-accent)"
              >
                v⃗ (tự do)
              </text>
            </>
          )}

          {/* Draggable vertex handles */}
          {vertexMeta.map(({ key, label, color }, idx) => {
            const pt = points[key];
            return (
              <g
                key={key}
                role="slider"
                tabIndex={0}
                aria-label={`Điểm điều khiển ${label}`}
                aria-valuetext={`x=${formatSigned(toMathCoords(pt, ORIGIN, PX_PER_UNIT).x)}, y=${formatSigned(toMathCoords(pt, ORIGIN, PX_PER_UNIT).y)}`}
                className="viz-handle"
                data-testid={`handle-${key}`}
                data-dragging={activeId === key ? 'true' : 'false'}
                onPointerDown={startDrag(key)}
                onKeyDown={nudgePoint(key, pt)}
              >
                <circle cx={pt.x} cy={pt.y} r={18} fill="transparent" />
                <circle cx={pt.x} cy={pt.y} r={7.5} fill={color} stroke="#ffffff" strokeWidth={2} />
                <text
                  x={pt.x + 11}
                  y={pt.y + (key === 'p3' ? -10 : 18)}
                  fontSize={12}
                  fontWeight={700}
                  fill="var(--text-main, #0f172a)"
                >
                  {label} (λ={formatSigned(weights[idx] ?? 0, 2)})
                </text>
              </g>
            );
          })}
        </>
      }
    />
  );
}
