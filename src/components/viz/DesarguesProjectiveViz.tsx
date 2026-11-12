import { useCallback, useMemo, useState } from 'react';
import { InteractiveVizFrame } from './InteractiveVizFrame';
import { useSvgDrag } from './useSvgDrag';
import {
  computeDesargues,
  extendLineSegment,
  formatSigned,
  SVG_H,
  SVG_W,
  type Point2D,
} from './viz-math';

type HandleKey = 'O' | 'A' | 'B' | 'C';

interface DesarguesConfig {
  points: Record<HandleKey, Point2D>;
  t: number;
  customRatios: readonly [number, number, number] | null;
}

const DEFAULT_CONFIG: DesarguesConfig = {
  points: {
    O: { x: 225, y: 32 },
    A: { x: 210, y: 82 },
    B: { x: 145, y: 148 },
    C: { x: 305, y: 138 },
  },
  t: 0.5,
  customRatios: null,
};

function ratiosFromSlider(t: number): [number, number, number] {
  return [1.6 + 0.3 * t, 1.45 - 0.3 * t, 0.98 + 0.2 * t];
}

function isInViewport(p: Point2D, margin = 12): boolean {
  return p.x >= margin && p.x <= SVG_W - margin && p.y >= margin && p.y <= SVG_H - margin;
}

export function DesarguesProjectiveViz() {
  const [config, setConfig] = useState<DesarguesConfig>(DEFAULT_CONFIG);

  const handleDrag = useCallback((id: HandleKey, pt: Point2D) => {
    setConfig((prev) => ({
      ...prev,
      points: { ...prev.points, [id]: pt },
    }));
  }, []);

  const { svgRef, activeId, startDrag, handleSvgPointerMove, stopDrag, nudgePoint } =
    useSvgDrag<HandleKey>({ onDrag: handleDrag });

  const handleReset = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
  }, []);

  const activeRatios: [number, number, number] = useMemo(() => {
    if (config.customRatios) {
      return [config.customRatios[0], config.customRatios[1], config.customRatios[2]];
    }
    return ratiosFromSlider(config.t);
  }, [config.customRatios, config.t]);

  const desargues = useMemo(() => {
    const { O, A, B, C } = config.points;
    return computeDesargues(O, A, B, C, activeRatios);
  }, [config.points, activeRatios]);

  const { O, A, B, C } = config.points;
  const { aPrime, bPrime, cPrime, P, Q, R, axisLine, parallelCount } = desargues;

  const sideLines = useMemo(() => {
    return [
      { id: 'AB', seg: extendLineSegment(A, B), color: 'var(--viz-primary)' },
      { id: 'BC', seg: extendLineSegment(B, C), color: 'var(--viz-primary)' },
      { id: 'CA', seg: extendLineSegment(C, A), color: 'var(--viz-primary)' },
      {
        id: 'ApBp',
        seg: extendLineSegment(aPrime, bPrime),
        color: 'var(--viz-secondary)',
      },
      {
        id: 'BpCp',
        seg: extendLineSegment(bPrime, cPrime),
        color: 'var(--viz-secondary)',
      },
      {
        id: 'CpAp',
        seg: extendLineSegment(cPrime, aPrime),
        color: 'var(--viz-secondary)',
      },
    ];
  }, [A, B, C, aPrime, bPrime, cPrime]);

  const rayLines = useMemo(() => {
    return [extendLineSegment(O, A), extendLineSegment(O, B), extendLineSegment(O, C)];
  }, [O, A, B, C]);

  const controls = (
    <>
      <div className="vc-sliders">
        <label className="vc-field">
          <span className="vc-label-row">
            <span>Tỉ lệ phối cảnh (t)</span>
            <span className="vc-value">
              t = {formatSigned(config.t, 2)} (k₁={formatSigned(activeRatios[0])}, k₂=
              {formatSigned(activeRatios[1])}, k₃={formatSigned(activeRatios[2])})
            </span>
          </span>
          <input
            type="range"
            min={-0.5}
            max={1.5}
            step={0.05}
            value={config.t}
            aria-label="Tỉ lệ phối cảnh Desargues"
            onChange={(e) => {
              const nextT = Number(e.target.value);
              setConfig((prev) => ({ ...prev, t: nextT, customRatios: null }));
            }}
            className="vc-range"
          />
        </label>
      </div>

      <div className="vc-actions" role="group" aria-label="Cấu hình mẫu Desargues">
        <button
          type="button"
          className="viz-btn"
          data-active={!config.customRatios && Math.abs(config.t - 0.5) < 0.01 ? 'true' : 'false'}
          onClick={handleReset}
        >
          Tổng quát (P, Q, R hữu hạn)
        </button>
        <button
          type="button"
          className="viz-btn"
          data-active={!config.customRatios && Math.abs(config.t + 0.25) < 0.01 ? 'true' : 'false'}
          onClick={() =>
            setConfig({
              ...DEFAULT_CONFIG,
              t: -0.25,
              customRatios: null,
            })
          }
        >
          AB ∥ A′B′ (P → ∞)
        </button>
        <button
          type="button"
          className="viz-btn"
          data-active={config.customRatios !== null ? 'true' : 'false'}
          onClick={() =>
            setConfig({
              points: {
                O: { x: 265, y: 155 },
                A: { x: 180, y: 78 },
                B: { x: 120, y: 155 },
                C: { x: 205, y: 198 },
              },
              t: 0.5,
              customRatios: [-0.85, -0.58, -1.18],
            })
          }
        >
          Hai phía tâm O
        </button>
      </div>
    </>
  );

  const formatInter = (name: string, inter: typeof P): string => {
    if (inter.kind === 'point') {
      return `${name} (${Math.round(inter.point.x)}, ${Math.round(inter.point.y)})`;
    }
    if (inter.kind === 'parallel') {
      return `${name} → ∞`;
    }
    return `${name} (suy biến)`;
  };

  const info = (
    <>
      <div className="vi-metrics">
        <span className="vi-metric">
          <span className="vi-metric-label">P = AB ∩ A′B′:</span>
          <span className="vi-metric-value">{formatInter('P', P)}</span>
        </span>
        <span className="vi-metric">
          <span className="vi-metric-label">Q = BC ∩ B′C′:</span>
          <span className="vi-metric-value">{formatInter('Q', Q)}</span>
        </span>
        <span className="vi-metric">
          <span className="vi-metric-label">R = CA ∩ C′A′:</span>
          <span className="vi-metric-value">{formatInter('R', R)}</span>
        </span>
      </div>

      {parallelCount > 0 ? (
        <div className="viz-alert" role="status">
          Có {parallelCount} cặp cạnh tương ứng song song trong mặt phẳng afin: giao điểm tương ứng
          đi ra điểm vô tận (∞) trên đường thẳng vô tận, đồng thời trục Desargues nối các giao điểm
          hữu hạn sẽ song song với cặp cạnh đó.
        </div>
      ) : (
        <p className="vi-note">
          Hai tam giác ABC và A′B′C′ thấu xạ tâm O (AA′, BB′, CC′ đồng quy tại O), nên ba giao điểm
          P, Q, R luôn thẳng hàng trên trục phối cảnh (đường màu cam).
        </p>
      )}
    </>
  );

  const intersectionNodes = [
    { key: 'P', res: P },
    { key: 'Q', res: Q },
    { key: 'R', res: R },
  ];

  const handleMeta: Array<{ key: HandleKey; label: string; color: string }> = [
    { key: 'O', label: 'O (Tâm)', color: 'var(--viz-accent)' },
    { key: 'A', label: 'A', color: 'var(--viz-primary)' },
    { key: 'B', label: 'B', color: 'var(--viz-primary)' },
    { key: 'C', label: 'C', color: 'var(--viz-primary)' },
  ];

  return (
    <InteractiveVizFrame
      title="Định lí Desargues trong Mặt phẳng Xạ ảnh P²"
      subtitle="Kéo tâm phối cảnh O hoặc các đỉnh A, B, C; chỉnh tỉ lệ t để kiểm chứng P, Q, R thẳng hàng"
      onReset={handleReset}
      svgRef={svgRef}
      onSvgPointerMove={handleSvgPointerMove}
      onSvgPointerUp={stopDrag}
      svgAriaLabel="Minh họa định lý Desargues về hai tam giác thấu xạ tâm O và trục PQR"
      controls={controls}
      info={info}
      svgChildren={
        <>
          {/* Perspective rays OA, OB, OC */}
          {rayLines.map(([p1, p2], i) => (
            <line
              key={i}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="var(--viz-axis)"
              strokeWidth={1.1}
              strokeDasharray="5 4"
            />
          ))}

          {/* Extended side lines */}
          {sideLines.map((line) => (
            <line
              key={line.id}
              x1={line.seg[0].x}
              y1={line.seg[0].y}
              x2={line.seg[1].x}
              y2={line.seg[1].y}
              stroke={line.color}
              strokeWidth={1}
              opacity={0.32}
            />
          ))}

          {/* Desargues collinearity axis */}
          {axisLine && (
            <line
              x1={axisLine[0].x}
              y1={axisLine[0].y}
              x2={axisLine[1].x}
              y2={axisLine[1].y}
              stroke="var(--viz-accent)"
              strokeWidth={2.4}
              data-testid="desargues-axis"
            />
          )}

          {/* Triangle ABC */}
          <polygon
            points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
            fill="var(--viz-parallelogram)"
            stroke="var(--viz-primary)"
            strokeWidth={2}
          />

          {/* Triangle A'B'C' */}
          <polygon
            points={`${aPrime.x},${aPrime.y} ${bPrime.x},${bPrime.y} ${cPrime.x},${cPrime.y}`}
            fill="var(--viz-simplex)"
            stroke="var(--viz-secondary)"
            strokeWidth={2}
          />

          {/* A', B', C' vertices */}
          {[
            { pt: aPrime, label: 'A′' },
            { pt: bPrime, label: 'B′' },
            { pt: cPrime, label: 'C′' },
          ].map(({ pt, label }) => (
            <g key={label}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={4.5}
                fill="var(--viz-secondary)"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
              <text
                x={pt.x + 8}
                y={pt.y + 4}
                fontSize={12}
                fontWeight={700}
                fill="var(--viz-secondary)"
              >
                {label}
              </text>
            </g>
          ))}

          {/* Collinear intersection points P, Q, R */}
          {intersectionNodes.map(({ key, res }) => {
            if (res.kind !== 'point' || !isInViewport(res.point, 4)) return null;
            return (
              <g key={key} data-testid={`desargues-${key}`}>
                <circle
                  cx={res.point.x}
                  cy={res.point.y}
                  r={5.5}
                  fill="var(--viz-accent)"
                  stroke="#ffffff"
                  strokeWidth={1.8}
                />
                <text
                  x={res.point.x + 8}
                  y={res.point.y - 7}
                  fontSize={12}
                  fontWeight={800}
                  fill="var(--viz-accent)"
                >
                  {key}
                </text>
              </g>
            );
          })}

          {/* Parallel pair / point-at-infinity indicator inside SVG */}
          {parallelCount > 0 && (
            <g data-testid="desargues-infinity-badge">
              <rect
                x={SVG_W - 196}
                y={12}
                width={184}
                height={26}
                rx={6}
                fill="var(--viz-warn-bg)"
                stroke="var(--viz-warn-border)"
                strokeWidth={1}
              />
              <text
                x={SVG_W - 104}
                y={29}
                textAnchor="middle"
                fontSize={11.5}
                fontWeight={700}
                fill="var(--viz-warn-text)"
              >
                Giao điểm → ∞ (đường song song)
              </text>
            </g>
          )}

          {/* Draggable handles O, A, B, C */}
          {handleMeta.map(({ key, label, color }) => {
            const pt = config.points[key];
            return (
              <g
                key={key}
                role="slider"
                tabIndex={0}
                aria-label={`Điểm điều khiển ${label}`}
                aria-valuetext={`x=${Math.round(pt.x)}, y=${Math.round(pt.y)}`}
                className="viz-handle"
                data-testid={`handle-${key}`}
                data-dragging={activeId === key ? 'true' : 'false'}
                onPointerDown={startDrag(key)}
                onKeyDown={nudgePoint(key, pt)}
              >
                <circle cx={pt.x} cy={pt.y} r={17} fill="transparent" />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={key === 'O' ? 7.5 : 6.5}
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                <text
                  x={pt.x + 9}
                  y={pt.y - 9}
                  fontSize={12}
                  fontWeight={700}
                  fill="var(--text-main, #0f172a)"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </>
      }
    />
  );
}
