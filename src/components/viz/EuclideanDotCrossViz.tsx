import { useCallback, useMemo, useState } from 'react';
import { InteractiveVizFrame } from './InteractiveVizFrame';
import { useSvgDrag } from './useSvgDrag';
import {
  computeEuclideanMetrics,
  formatSigned,
  toMathCoords,
  toSvgCoords,
  type Point2D,
} from './viz-math';

type TipKey = 'a' | 'b';

const ORIGIN: Point2D = { x: 185, y: 215 };
const PX_PER_UNIT = 40;

const DEFAULT_A: Point2D = { x: 3.5, y: 0.75 };
const DEFAULT_B: Point2D = { x: 1.5, y: 3.0 };

export function EuclideanDotCrossViz() {
  const [vecA, setVecA] = useState<Point2D>(DEFAULT_A);
  const [vecB, setVecB] = useState<Point2D>(DEFAULT_B);

  const handleTipDrag = useCallback((id: TipKey, svgPt: Point2D) => {
    const mathPt = toMathCoords(svgPt, ORIGIN, PX_PER_UNIT);
    const rounded: Point2D = {
      x: Math.round(mathPt.x * 20) / 20,
      y: Math.round(mathPt.y * 20) / 20,
    };
    if (id === 'a') setVecA(rounded);
    else setVecB(rounded);
  }, []);

  const { svgRef, activeId, startDrag, handleSvgPointerMove, stopDrag, nudgePoint } =
    useSvgDrag<TipKey>({ onDrag: handleTipDrag });

  const handleReset = useCallback(() => {
    setVecA(DEFAULT_A);
    setVecB(DEFAULT_B);
  }, []);

  const metrics = useMemo(() => computeEuclideanMetrics(vecA, vecB), [vecA, vecB]);

  const svgPoints = useMemo(() => {
    const tipA = toSvgCoords(vecA, ORIGIN, PX_PER_UNIT);
    const tipB = toSvgCoords(vecB, ORIGIN, PX_PER_UNIT);
    const tipSum = toSvgCoords({ x: vecA.x + vecB.x, y: vecA.y + vecB.y }, ORIGIN, PX_PER_UNIT);
    const projH = toSvgCoords(metrics.projVec, ORIGIN, PX_PER_UNIT);

    // Angle arc path between a and b at radius 28
    const angA = Math.atan2(tipA.y - ORIGIN.y, tipA.x - ORIGIN.x);
    const angB = Math.atan2(tipB.y - ORIGIN.y, tipB.x - ORIGIN.x);
    let diff = angB - angA;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    const r = 28;
    const arcStart: Point2D = {
      x: ORIGIN.x + r * Math.cos(angA),
      y: ORIGIN.y + r * Math.sin(angA),
    };
    const arcEnd: Point2D = {
      x: ORIGIN.x + r * Math.cos(angA + diff),
      y: ORIGIN.y + r * Math.sin(angA + diff),
    };
    const sweepFlag = diff >= 0 ? 1 : 0;

    // Right-angle square marker at O when orthogonal
    const ua =
      metrics.normA > 1e-5
        ? { x: vecA.x / metrics.normA, y: vecA.y / metrics.normA }
        : { x: 1, y: 0 };
    const ub =
      metrics.normB > 1e-5
        ? { x: vecB.x / metrics.normB, y: vecB.y / metrics.normB }
        : { x: 0, y: 1 };
    const sqSize = 0.42;
    const orthoP1 = toSvgCoords({ x: ua.x * sqSize, y: ua.y * sqSize }, ORIGIN, PX_PER_UNIT);
    const orthoP2 = toSvgCoords(
      { x: (ua.x + ub.x) * sqSize, y: (ua.y + ub.y) * sqSize },
      ORIGIN,
      PX_PER_UNIT,
    );
    const orthoP3 = toSvgCoords({ x: ub.x * sqSize, y: ub.y * sqSize }, ORIGIN, PX_PER_UNIT);

    // Right-angle marker at H (foot of perpendicular from B onto line OA)
    const dirA = ua;
    const normFoot = { x: -dirA.y, y: dirA.x };
    const signPerp =
      (vecB.x - metrics.projVec.x) * normFoot.x + (vecB.y - metrics.projVec.y) * normFoot.y >= 0
        ? 1
        : -1;
    const dirProjSign = metrics.projScalar >= 0 ? -1 : 1;
    const fSize = 0.28;
    const foot1 = toSvgCoords(
      {
        x: metrics.projVec.x + dirProjSign * dirA.x * fSize,
        y: metrics.projVec.y + dirProjSign * dirA.y * fSize,
      },
      ORIGIN,
      PX_PER_UNIT,
    );
    const foot2 = toSvgCoords(
      {
        x: metrics.projVec.x + dirProjSign * dirA.x * fSize + signPerp * normFoot.x * fSize,
        y: metrics.projVec.y + dirProjSign * dirA.y * fSize + signPerp * normFoot.y * fSize,
      },
      ORIGIN,
      PX_PER_UNIT,
    );
    const foot3 = toSvgCoords(
      {
        x: metrics.projVec.x + signPerp * normFoot.x * fSize,
        y: metrics.projVec.y + signPerp * normFoot.y * fSize,
      },
      ORIGIN,
      PX_PER_UNIT,
    );

    return {
      tipA,
      tipB,
      tipSum,
      projH,
      arcPath: `M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 ${sweepFlag} ${arcEnd.x} ${arcEnd.y}`,
      orthoSquare: `M ${orthoP1.x} ${orthoP1.y} L ${orthoP2.x} ${orthoP2.y} L ${orthoP3.x} ${orthoP3.y}`,
      footSquare: `M ${foot1.x} ${foot1.y} L ${foot2.x} ${foot2.y} L ${foot3.x} ${foot3.y}`,
    };
  }, [metrics, vecA, vecB]);

  const angleSliderDeg = useMemo(() => {
    const raw = (Math.atan2(vecB.y, vecB.x) * 180) / Math.PI;
    return Math.round(((raw % 360) + 360) % 360);
  }, [vecB]);

  const setAngleKeepLength = useCallback(
    (deg: number) => {
      const len = Math.max(1.5, metrics.normB);
      const rad = (deg * Math.PI) / 180;
      setVecB({
        x: Math.round(len * Math.cos(rad) * 20) / 20,
        y: Math.round(len * Math.sin(rad) * 20) / 20,
      });
    },
    [metrics.normB],
  );

  const controls = (
    <>
      <div className="vc-sliders">
        <label className="vc-field">
          <span className="vc-label-row">
            <span>Góc cực của b⃗</span>
            <span className="vc-value">{angleSliderDeg}°</span>
          </span>
          <input
            type="range"
            min={0}
            max={355}
            step={5}
            value={angleSliderDeg}
            aria-label="Góc cực của vectơ b"
            onChange={(e) => setAngleKeepLength(Number(e.target.value))}
            className="vc-range"
          />
        </label>
      </div>

      <div className="vc-actions" role="group" aria-label="Cấu hình mẫu Euclide">
        <button
          type="button"
          className="viz-btn"
          data-active={metrics.isOrthogonal ? 'true' : 'false'}
          onClick={() => {
            setVecA({ x: 3.5, y: 0 });
            setVecB({ x: 0, y: 3 });
          }}
        >
          Trực giao (a⃗·b⃗ = 0)
        </button>
        <button
          type="button"
          className="viz-btn"
          data-active={metrics.isCollinear ? 'true' : 'false'}
          onClick={() => {
            setVecA({ x: 3, y: 1.5 });
            setVecB({ x: 2, y: 1 });
          }}
        >
          Cùng phương (|a⃗∧b⃗| = 0)
        </button>
        <button
          type="button"
          className="viz-btn"
          onClick={() => {
            setVecA({ x: 3.5, y: 0.5 });
            setVecB({ x: -1.8, y: 2.6 });
          }}
        >
          Góc tù (a⃗·b⃗ &lt; 0)
        </button>
      </div>
    </>
  );

  const info = (
    <>
      <div className="vi-metrics">
        <span className="vi-metric">
          <span className="vi-metric-label">Tích vô hướng a⃗·b⃗ =</span>
          <span className="vi-metric-value">{formatSigned(metrics.dot)}</span>
        </span>
        <span className="vi-metric">
          <span className="vi-metric-label">Góc φ =</span>
          <span className="vi-metric-value">{formatSigned(metrics.angleDeg, 1)}°</span>
        </span>
        <span className="vi-metric">
          <span className="vi-metric-label">Diện tích HBH |a⃗∧b⃗| =</span>
          <span className="vi-metric-value">{formatSigned(metrics.area)}</span>
        </span>
        <span className="vi-metric">
          <span className="vi-metric-label">Khoảng cách d(B, Δₐ) =</span>
          <span className="vi-metric-value">{formatSigned(metrics.distanceToLineA)}</span>
        </span>
      </div>

      {metrics.isOrthogonal ? (
        <div className="viz-alert" role="status">
          Hai véc-tơ trực giao (a⃗ ⊥ b⃗): tích vô hướng a⃗·b⃗ ≈ 0, góc φ = 90°, hình bình hành suy
          thành hình chữ nhật có diện tích |a⃗|·|b⃗|.
        </div>
      ) : (
        <p className="vi-note">
          a⃗ = ({formatSigned(vecA.x)}, {formatSigned(vecA.y)}), b⃗ = ({formatSigned(vecB.x)},{' '}
          {formatSigned(vecB.y)}). Vùng tô xanh là hình bình hành sinh bởi a⃗ và b⃗ với chiều cao hạ
          từ B xuống đường chứa a⃗.
        </p>
      )}
    </>
  );

  return (
    <InteractiveVizFrame
      title="Tích vô hướng, Phép chiếu trực giao & Hình bình hành |a⃗∧b⃗|"
      subtitle="Kéo đầu mút A, B của hai véc-tơ xuất phát từ gốc O"
      onReset={handleReset}
      svgRef={svgRef}
      onSvgPointerMove={handleSvgPointerMove}
      onSvgPointerUp={stopDrag}
      svgAriaLabel="Minh họa tương tác tích vô hướng và diện tích hình bình hành của hai vectơ a và b"
      controls={controls}
      info={info}
      svgChildren={
        <>
          {/* Axes */}
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

          {/* Parallelogram spanned by a and b */}
          <polygon
            points={`${ORIGIN.x},${ORIGIN.y} ${svgPoints.tipA.x},${svgPoints.tipA.y} ${svgPoints.tipSum.x},${svgPoints.tipSum.y} ${svgPoints.tipB.x},${svgPoints.tipB.y}`}
            fill="var(--viz-parallelogram)"
            stroke="var(--viz-primary)"
            strokeWidth={1}
            strokeDasharray="4 3"
          />

          {/* Projection extension along OA */}
          {metrics.normA > 0.1 && (
            <line
              x1={ORIGIN.x}
              y1={ORIGIN.y}
              x2={svgPoints.projH.x}
              y2={svgPoints.projH.y}
              stroke="var(--viz-purple)"
              strokeWidth={3}
              opacity={0.78}
            />
          )}

          {/* Perpendicular altitude BH */}
          {metrics.normA > 0.1 && metrics.distanceToLineA > 0.08 && (
            <>
              <line
                x1={svgPoints.tipB.x}
                y1={svgPoints.tipB.y}
                x2={svgPoints.projH.x}
                y2={svgPoints.projH.y}
                stroke="var(--viz-accent)"
                strokeWidth={1.6}
                strokeDasharray="4 3"
              />
              <path
                d={svgPoints.footSquare}
                fill="none"
                stroke="var(--viz-accent)"
                strokeWidth={1.5}
              />
              <circle
                cx={svgPoints.projH.x}
                cy={svgPoints.projH.y}
                r={3.5}
                fill="var(--viz-purple)"
              />
              <text
                x={svgPoints.projH.x + 6}
                y={svgPoints.projH.y + 14}
                fontSize={11}
                fontWeight={600}
                fill="var(--viz-purple)"
              >
                H (proj)
              </text>
            </>
          )}

          {/* Angle arc or automatic right-angle marker */}
          {metrics.isOrthogonal ? (
            <path
              d={svgPoints.orthoSquare}
              fill="none"
              stroke="var(--viz-accent)"
              strokeWidth={2.2}
              data-testid="right-angle-marker"
            />
          ) : (
            metrics.normA > 0.2 &&
            metrics.normB > 0.2 &&
            !metrics.isCollinear && (
              <path
                d={svgPoints.arcPath}
                fill="none"
                stroke="var(--viz-accent)"
                strokeWidth={1.8}
              />
            )
          )}

          {/* Vectors a and b */}
          <line
            x1={ORIGIN.x}
            y1={ORIGIN.y}
            x2={svgPoints.tipA.x}
            y2={svgPoints.tipA.y}
            stroke="var(--viz-primary)"
            strokeWidth={2.8}
            markerEnd="url(#viz-arrow-primary)"
          />
          <line
            x1={ORIGIN.x}
            y1={ORIGIN.y}
            x2={svgPoints.tipB.x}
            y2={svgPoints.tipB.y}
            stroke="var(--viz-secondary)"
            strokeWidth={2.8}
            markerEnd="url(#viz-arrow-secondary)"
          />

          {/* Origin dot */}
          <circle cx={ORIGIN.x} cy={ORIGIN.y} r={4} fill="var(--text-main, #0f172a)" />
          <text
            x={ORIGIN.x - 15}
            y={ORIGIN.y + 15}
            fontSize={12}
            fontWeight={700}
            fill="var(--text-main, #0f172a)"
          >
            O
          </text>

          {/* Draggable handle for tip A */}
          <g
            role="slider"
            tabIndex={0}
            aria-label="Đầu mút vectơ a"
            aria-valuetext={`(${formatSigned(vecA.x)}, ${formatSigned(vecA.y)})`}
            className="viz-handle"
            data-testid="handle-a"
            data-dragging={activeId === 'a' ? 'true' : 'false'}
            onPointerDown={startDrag('a')}
            onKeyDown={nudgePoint('a', svgPoints.tipA)}
          >
            <circle cx={svgPoints.tipA.x} cy={svgPoints.tipA.y} r={18} fill="transparent" />
            <circle
              cx={svgPoints.tipA.x}
              cy={svgPoints.tipA.y}
              r={7}
              fill="var(--viz-primary)"
              stroke="#ffffff"
              strokeWidth={2}
            />
            <text
              x={svgPoints.tipA.x + 10}
              y={svgPoints.tipA.y + 4}
              fontSize={13}
              fontWeight={700}
              fill="var(--viz-primary)"
            >
              a⃗
            </text>
          </g>

          {/* Draggable handle for tip B */}
          <g
            role="slider"
            tabIndex={0}
            aria-label="Đầu mút vectơ b"
            aria-valuetext={`(${formatSigned(vecB.x)}, ${formatSigned(vecB.y)})`}
            className="viz-handle"
            data-testid="handle-b"
            data-dragging={activeId === 'b' ? 'true' : 'false'}
            onPointerDown={startDrag('b')}
            onKeyDown={nudgePoint('b', svgPoints.tipB)}
          >
            <circle cx={svgPoints.tipB.x} cy={svgPoints.tipB.y} r={18} fill="transparent" />
            <circle
              cx={svgPoints.tipB.x}
              cy={svgPoints.tipB.y}
              r={7}
              fill="var(--viz-secondary)"
              stroke="#ffffff"
              strokeWidth={2}
            />
            <text
              x={svgPoints.tipB.x + 10}
              y={svgPoints.tipB.y - 8}
              fontSize={13}
              fontWeight={700}
              fill="var(--viz-secondary)"
            >
              b⃗
            </text>
          </g>
        </>
      }
    />
  );
}
