import { Line, Polygon } from 'mafs';
import { useState } from 'react';
import {
  formatCoords,
  formatMathNumber,
  type Point2D,
  resolveAffineCoordinates,
  scaleVec,
  translatePoint,
  vectorBetween,
} from './affine-math';
import { AffinePlane } from './AffinePlane';
import { DraggablePoint } from './DraggablePoint';
import { VectorArrow } from './VectorArrow';

export interface AffineFrameProps {
  readonly title?: string;
  readonly initialOrigin?: Point2D;
  readonly initialE1Tip?: Point2D;
  readonly initialE2Tip?: Point2D;
  readonly initialPointM?: Point2D;
  readonly height?: number;
}

const GRID_INDICES = [-2, -1, 0, 1, 2];

export function AffineFrame({
  title = 'Mục tiêu Affine R = (O; e₁, e₂) và Tọa độ Affine của điểm M',
  initialOrigin = [-1.5, -1],
  initialE1Tip = [0.5, -0.5],
  initialE2Tip = [-0.8, 0.8],
  initialPointM = [1.7, 1.3],
  height = 350,
}: AffineFrameProps) {
  const [origin, setOrigin] = useState<Point2D>(initialOrigin);
  const [e1Tip, setE1Tip] = useState<Point2D>(initialE1Tip);
  const [e2Tip, setE2Tip] = useState<Point2D>(initialE2Tip);
  const [pointM, setPointM] = useState<Point2D>(initialPointM);

  const e1 = vectorBetween(origin, e1Tip);
  const e2 = vectorBetween(origin, e2Tip);
  const coords = resolveAffineCoordinates(origin, e1, e2, pointM);

  const handleReset = () => {
    setOrigin(initialOrigin);
    setE1Tip(initialE1Tip);
    setE2Tip(initialE2Tip);
    setPointM(initialPointM);
  };

  return (
    <AffinePlane
      title={title}
      instruction="Kéo điểm M, gốc O hoặc hai ngọn vectơ cơ sở E₁, E₂ để quan sát tọa độ affine (x; y) trong mục tiêu xiên."
      height={height}
      onReset={handleReset}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          {coords.degenerate ? (
            <span className="font-semibold text-rose-700">
              Cảnh báo: Hai vectơ e₁ và e₂ đang cùng phương (det = 0), không lập thành cơ sở!
            </span>
          ) : (
            <>
              <span>
                Phân tích duy nhất:{' '}
                <strong className="font-mono text-stone-900">
                  OM = {formatMathNumber(coords.x, 2)}·e₁ + {formatMathNumber(coords.y, 2)}·e₂
                </strong>
              </span>
              <span className="font-mono text-stone-700">
                Tọa độ Affine: M_R = ({formatMathNumber(coords.x, 2)};{' '}
                {formatMathNumber(coords.y, 2)}) · Tọa độ đề-các: M{formatCoords(pointM)}
              </span>
            </>
          )}
        </div>
      }
    >
      {/* Lưới tọa độ xiên theo hai phương cơ sở e1, e2 */}
      {!coords.degenerate &&
        GRID_INDICES.map((k) => {
          const start1 = translatePoint(translatePoint(origin, scaleVec(e2, k)), scaleVec(e1, -3));
          const end1 = translatePoint(translatePoint(origin, scaleVec(e2, k)), scaleVec(e1, 3));
          const start2 = translatePoint(translatePoint(origin, scaleVec(e1, k)), scaleVec(e2, -3));
          const end2 = translatePoint(translatePoint(origin, scaleVec(e1, k)), scaleVec(e2, 3));
          return (
            <g key={k}>
              <Line.Segment
                point1={start1}
                point2={end1}
                color="#0d9488"
                opacity={k === 0 ? 0.45 : 0.16}
                weight={k === 0 ? 1.5 : 1}
              />
              <Line.Segment
                point1={start2}
                point2={end2}
                color="#4f46e5"
                opacity={k === 0 ? 0.45 : 0.16}
                weight={k === 0 ? 1.5 : 1}
              />
            </g>
          );
        })}

      {/* Hình bình hành phân tích vectơ OM = x*e1 + y*e2 */}
      {!coords.degenerate && (
        <>
          <Polygon
            points={[origin, coords.projE1, pointM, coords.projE2]}
            color="#0d9488"
            fillOpacity={0.08}
            strokeOpacity={0.2}
          />
          <Line.Segment
            point1={coords.projE1}
            point2={pointM}
            color="#4f46e5"
            style="dashed"
            weight={1.5}
          />
          <Line.Segment
            point1={coords.projE2}
            point2={pointM}
            color="#0d9488"
            style="dashed"
            weight={1.5}
          />
          <VectorArrow tail={origin} tip={pointM} label="OM" tone="accent" weight={2.2} />
        </>
      )}

      {/* Hai vectơ cơ sở e1, e2 */}
      <VectorArrow tail={origin} tip={e1Tip} label="e₁" tone="primary" weight={3} />
      <VectorArrow
        tail={origin}
        tip={e2Tip}
        label="e₂"
        tone="secondary"
        weight={3}
        labelSide="right"
      />

      {/* Các điểm điều khiển */}
      <DraggablePoint point={origin} onMove={setOrigin} label="O" attach="sw" tone="neutral" />
      <DraggablePoint point={e1Tip} onMove={setE1Tip} label="E₁" attach="se" tone="primary" />
      <DraggablePoint point={e2Tip} onMove={setE2Tip} label="E₂" attach="nw" tone="secondary" />
      <DraggablePoint
        point={pointM}
        onMove={setPointM}
        label="M"
        attach="ne"
        tone="accent"
        showCoordinates={false}
      />
    </AffinePlane>
  );
}
