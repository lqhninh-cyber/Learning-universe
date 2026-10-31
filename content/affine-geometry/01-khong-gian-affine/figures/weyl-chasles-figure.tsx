import { useState } from 'react';
import {
  addVec,
  AffinePlane,
  DraggablePoint,
  formatCoords,
  type Point2D,
  VectorArrow,
  vectorBetween,
} from '@/content-runtime/figure-kit';

/**
 * Hình tương tác 1: Minh họa Tiên đề Weyl và Tiên đề Chasles (AB + BC = AC).
 */
export function WeylChaslesFigure() {
  const initialA: Point2D = [-2.8, -1.0];
  const initialB: Point2D = [-0.2, 1.4];
  const initialC: Point2D = [2.6, -0.6];

  const [pointA, setPointA] = useState<Point2D>(initialA);
  const [pointB, setPointB] = useState<Point2D>(initialB);
  const [pointC, setPointC] = useState<Point2D>(initialC);

  const vecAB = vectorBetween(pointA, pointB);
  const vecBC = vectorBetween(pointB, pointC);
  const vecAC = addVec(vecAB, vecBC);

  const handleReset = () => {
    setPointA(initialA);
    setPointB(initialB);
    setPointC(initialC);
  };

  return (
    <AffinePlane
      title="Mô hình tương tác: Tiên đề Weyl & Quy tắc ba điểm Chasles"
      instruction="Kéo 3 điểm A, B, C để kiểm nghiệm đẳng thức vectơ AB + BC = AC trên mặt phẳng affine."
      height={320}
      onReset={handleReset}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono">
          <span>
            AB = {formatCoords(vecAB)} · BC = {formatCoords(vecBC)}
          </span>
          <span className="font-semibold text-stone-900">
            AB + BC = AC = {formatCoords(vecAC)}
          </span>
        </div>
      }
    >
      <VectorArrow tail={pointA} tip={pointB} label="AB" tone="primary" />
      <VectorArrow tail={pointB} tip={pointC} label="BC" tone="secondary" />
      <VectorArrow
        tail={pointA}
        tip={pointC}
        label="AC = AB + BC"
        tone="accent"
        weight={2.8}
        labelSide="right"
      />

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
        attach="n"
        tone="secondary"
        showCoordinates
      />
      <DraggablePoint
        point={pointC}
        onMove={setPointC}
        label="C"
        attach="se"
        tone="accent"
        showCoordinates
      />
    </AffinePlane>
  );
}

export default WeylChaslesFigure;
