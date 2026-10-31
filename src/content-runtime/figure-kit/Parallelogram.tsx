import { Polygon } from 'mafs';
import { useState } from 'react';
import {
  formatCoords,
  fourthParallelogramVertex,
  type Point2D,
  vectorBetween,
} from './affine-math';
import { AffinePlane } from './AffinePlane';
import { DraggablePoint } from './DraggablePoint';
import { VectorArrow } from './VectorArrow';

export interface ParallelogramProps {
  readonly title?: string;
  /** Chế độ hiển thị: `"chasles"` nhấn mạnh $\vect{AB} + \vect{BC} = \vect{AC}$, `"parallelogram"` nhấn mạnh $\vect{AB} = \vect{DC} \iff \vect{AD} = \vect{BC}$. */
  readonly mode?: 'chasles' | 'parallelogram';
  readonly initialA?: Point2D;
  readonly initialB?: Point2D;
  readonly initialD?: Point2D;
  readonly height?: number;
}

export function Parallelogram({
  title,
  mode = 'parallelogram',
  initialA = [-2.5, -1.2],
  initialB = [1.0, -1.0],
  initialD = [-1.4, 1.5],
  height = 330,
}: ParallelogramProps) {
  const [pointA, setPointA] = useState<Point2D>(initialA);
  const [pointB, setPointB] = useState<Point2D>(initialB);
  const [pointD, setPointD] = useState<Point2D>(initialD);

  const pointC = fourthParallelogramVertex(pointA, pointB, pointD);
  const vecAB = vectorBetween(pointA, pointB);
  const vecAC = vectorBetween(pointA, pointC);
  const vecAD = vectorBetween(pointA, pointD);

  const resolvedTitle =
    title ??
    (mode === 'chasles'
      ? 'Tiên đề Chasles (Quy tắc ba điểm): AB + BC = AC'
      : 'Quy tắc Hình bình hành trong Không gian Affine: AB = DC ⇔ AD = BC');

  const handleReset = () => {
    setPointA(initialA);
    setPointB(initialB);
    setPointD(initialD);
  };

  return (
    <AffinePlane
      title={resolvedTitle}
      instruction="Kéo 3 đỉnh A, B, D trên mặt phẳng; đỉnh C được xác định duy nhất theo Tiên đề Weyl sao cho DC = AB."
      height={height}
      onReset={handleReset}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
          <span>
            AB = {formatCoords(vecAB)} · BC = AD = {formatCoords(vecAD)}
          </span>
          <span className="font-semibold text-stone-900">
            AC = AB + BC = {formatCoords(vecAC)} · Đỉnh C{formatCoords(pointC)}
          </span>
        </div>
      }
    >
      <Polygon
        points={[pointA, pointB, pointC, pointD]}
        color="#0d9488"
        fillOpacity={0.1}
        strokeOpacity={0.3}
      />

      {/* Hai cặp cạnh đối song song và bằng nhau */}
      <VectorArrow tail={pointA} tip={pointB} label="AB" tone="primary" labelSide="right" />
      <VectorArrow tail={pointD} tip={pointC} label="DC" tone="primary" style="dashed" />
      <VectorArrow tail={pointA} tip={pointD} label="AD" tone="secondary" />
      <VectorArrow
        tail={pointB}
        tip={pointC}
        label="BC"
        tone="secondary"
        style={mode === 'chasles' ? 'solid' : 'dashed'}
        labelSide="right"
      />

      {/* Đường chéo tổng Chasles AC = AB + BC */}
      <VectorArrow tail={pointA} tip={pointC} label="AC = AB + BC" tone="accent" weight={2.8} />

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
        tone="primary"
        showCoordinates
      />
      <DraggablePoint
        point={pointD}
        onMove={setPointD}
        label="D"
        attach="nw"
        tone="secondary"
        showCoordinates
      />
      <DraggablePoint point={pointC} label="C" attach="ne" tone="accent" showCoordinates />
    </AffinePlane>
  );
}
