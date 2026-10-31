import { Line, Polygon } from 'mafs';
import { useState } from 'react';
import { computeBarycenter, formatCoords, formatMathNumber, type Point2D } from './affine-math';
import { AffinePlane } from './AffinePlane';
import { DraggablePoint } from './DraggablePoint';
import { VectorArrow } from './VectorArrow';

export interface BarycenterProps {
  readonly title?: string;
  /** Chế độ 2 điểm (đoạn thẳng / trung điểm) hoặc 3 điểm (tam giác / trọng tâm). */
  readonly pointCount?: 2 | 3;
  readonly initialA?: Point2D;
  readonly initialB?: Point2D;
  readonly initialC?: Point2D;
  readonly initialOrigin?: Point2D;
  readonly showOriginVectors?: boolean;
  readonly height?: number;
}

export function Barycenter({
  title = 'Tâm tỉ cự & Tổ hợp Affine của hệ điểm có trọng số',
  pointCount = 3,
  initialA = [-2.6, -1.0],
  initialB = [2.4, -0.8],
  initialC = [0.2, 2.2],
  initialOrigin = [-0.5, -2.2],
  showOriginVectors = false,
  height = 350,
}: BarycenterProps) {
  const [pointA, setPointA] = useState<Point2D>(initialA);
  const [pointB, setPointB] = useState<Point2D>(initialB);
  const [pointC, setPointC] = useState<Point2D>(initialC);
  const [originO, setOriginO] = useState<Point2D>(initialOrigin);

  const [alpha, setAlpha] = useState<number>(1);
  const [beta, setBeta] = useState<number>(1);
  const [gamma, setGamma] = useState<number>(pointCount === 3 ? 1 : 0);

  const weightedItems =
    pointCount === 2
      ? [
          { label: 'A', point: pointA, weight: alpha },
          { label: 'B', point: pointB, weight: beta },
        ]
      : [
          { label: 'A', point: pointA, weight: alpha },
          { label: 'B', point: pointB, weight: beta },
          { label: 'C', point: pointC, weight: gamma },
        ];

  const result = computeBarycenter(weightedItems);

  const handleReset = () => {
    setPointA(initialA);
    setPointB(initialB);
    setPointC(initialC);
    setOriginO(initialOrigin);
    setAlpha(1);
    setBeta(1);
    setGamma(pointCount === 3 ? 1 : 0);
  };

  return (
    <AffinePlane
      title={title}
      instruction="Kéo các đỉnh hoặc điều chỉnh thanh trượt trọng số α, β, γ để quan sát vị trí tâm tỉ cự G."
      height={height}
      onReset={handleReset}
      footer={
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="flex justify-between font-medium text-stone-700">
                <span>Trọng số α (điểm A):</span>
                <strong className="font-mono text-stone-900">{formatMathNumber(alpha, 1)}</strong>
              </span>
              <input
                type="range"
                min={-2}
                max={3}
                step={0.5}
                value={alpha}
                aria-label="Trọng số alpha của điểm A"
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="accent-teal-600"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="flex justify-between font-medium text-stone-700">
                <span>Trọng số β (điểm B):</span>
                <strong className="font-mono text-stone-900">{formatMathNumber(beta, 1)}</strong>
              </span>
              <input
                type="range"
                min={-2}
                max={3}
                step={0.5}
                value={beta}
                aria-label="Trọng số beta của điểm B"
                onChange={(e) => setBeta(Number(e.target.value))}
                className="accent-indigo-600"
              />
            </label>

            {pointCount === 3 && (
              <label className="flex flex-col gap-1">
                <span className="flex justify-between font-medium text-stone-700">
                  <span>Trọng số γ (điểm C):</span>
                  <strong className="font-mono text-stone-900">{formatMathNumber(gamma, 1)}</strong>
                </span>
                <input
                  type="range"
                  min={-2}
                  max={3}
                  step={0.5}
                  value={gamma}
                  aria-label="Trọng số gamma của điểm C"
                  onChange={(e) => setGamma(Number(e.target.value))}
                  className="accent-amber-600"
                />
              </label>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/80 pt-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setAlpha(1);
                  setBeta(1);
                  setGamma(0);
                }}
                className="rounded-md border border-stone-200 bg-white px-2 py-1 font-medium text-stone-700 hover:bg-stone-100"
              >
                Trung điểm AB (1 : 1)
              </button>
              {pointCount === 3 && (
                <button
                  type="button"
                  onClick={() => {
                    setAlpha(1);
                    setBeta(1);
                    setGamma(1);
                  }}
                  className="rounded-md border border-stone-200 bg-white px-2 py-1 font-medium text-stone-700 hover:bg-stone-100"
                >
                  Trọng tâm △ABC (1 : 1 : 1)
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setAlpha(1);
                  setBeta(-1);
                  setGamma(0);
                }}
                className="rounded-md border border-stone-200 bg-white px-2 py-1 font-medium text-stone-700 hover:bg-stone-100"
              >
                Tổng bằng 0 (α + β = 0)
              </button>
            </div>

            {result.exists && result.barycenter ? (
              <span className="font-mono font-semibold text-stone-900">
                Tổng trọng số S = {formatMathNumber(result.totalWeight, 1)} · Tâm tỉ cự G
                {formatCoords(result.barycenter)}
              </span>
            ) : (
              <span className="font-semibold text-rose-700">
                Tổng trọng số S = 0: Không tồn tại tâm tỉ cự G (tổ hợp trở thành vectơ tự do{' '}
                {formatCoords(result.freeVector)})
              </span>
            )}
          </div>
        </div>
      }
    >
      {pointCount === 3 ? (
        <Polygon
          points={[pointA, pointB, pointC]}
          color="#0d9488"
          fillOpacity={0.08}
          strokeOpacity={0.35}
        />
      ) : (
        <Line.Segment point1={pointA} point2={pointB} color="#0d9488" weight={2} />
      )}

      {showOriginVectors && result.barycenter && (
        <>
          <VectorArrow tail={originO} tip={pointA} label="OA" tone="muted" style="dashed" />
          <VectorArrow tail={originO} tip={pointB} label="OB" tone="muted" style="dashed" />
          <VectorArrow
            tail={originO}
            tip={result.barycenter}
            label="OG"
            tone="accent"
            weight={2.6}
          />
          <DraggablePoint point={originO} onMove={setOriginO} label="O" attach="s" tone="neutral" />
        </>
      )}

      {result.barycenter && (
        <>
          <VectorArrow
            tail={result.barycenter}
            tip={pointA}
            label="GA"
            tone="primary"
            style="dashed"
            weight={1.8}
          />
          <VectorArrow
            tail={result.barycenter}
            tip={pointB}
            label="GB"
            tone="secondary"
            style="dashed"
            weight={1.8}
          />
          {pointCount === 3 && Math.abs(gamma) > 1e-4 && (
            <VectorArrow
              tail={result.barycenter}
              tip={pointC}
              label="GC"
              tone="accent"
              style="dashed"
              weight={1.8}
            />
          )}
          <DraggablePoint
            point={result.barycenter}
            label="G"
            attach="n"
            tone="warning"
            showCoordinates
          />
        </>
      )}

      <DraggablePoint
        point={pointA}
        onMove={setPointA}
        label="A"
        attach="sw"
        tone="primary"
        showCoordinates
      />
      <DraggablePoint
        point={pointB}
        onMove={setPointB}
        label="B"
        attach="se"
        tone="secondary"
        showCoordinates
      />
      {pointCount === 3 && (
        <DraggablePoint
          point={pointC}
          onMove={setPointC}
          label="C"
          attach="n"
          tone="accent"
          showCoordinates
        />
      )}
    </AffinePlane>
  );
}
