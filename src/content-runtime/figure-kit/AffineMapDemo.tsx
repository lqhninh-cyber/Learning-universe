import { Polygon } from 'mafs';
import { useState } from 'react';
import {
  applyAffineMap2D,
  formatCoords,
  type Matrix2x2,
  midpoint2D,
  type Point2D,
  type Vector2D,
} from './affine-math';
import { AffinePlane } from './AffinePlane';
import { DraggablePoint } from './DraggablePoint';
import { VectorArrow } from './VectorArrow';

export type AffineMapPresetId = 'translation' | 'homothety' | 'shear' | 'reflection' | 'projection';

interface AffineMapPreset {
  readonly id: AffineMapPresetId;
  readonly label: string;
  readonly formula: string;
  readonly matrix: Matrix2x2;
  readonly translation: Vector2D;
}

const PRESETS: readonly AffineMapPreset[] = [
  {
    id: 'translation',
    label: 'Phép tịnh tiến T_v',
    formula: 'f(M) = M + v, với v = (2; 1)',
    matrix: { a11: 1, a12: 0, a21: 0, a22: 1 },
    translation: [2, 1],
  },
  {
    id: 'homothety',
    label: 'Phép vị tự H(O, -0.8)',
    formula: 'f(M) = -0.8 · OM (đảo chiều & thu nhỏ)',
    matrix: { a11: -0.8, a12: 0, a21: 0, a22: -0.8 },
    translation: [0.5, 0.3],
  },
  {
    id: 'shear',
    label: 'Phép trượt (Shear)',
    formula: "x' = x + 0.7y, y' = y + 0.5",
    matrix: { a11: 1, a12: 0.7, a21: 0, a22: 1 },
    translation: [0.8, 0.4],
  },
  {
    id: 'reflection',
    label: 'Đối xứng trục Oy + Tịnh tiến',
    formula: "x' = -x + 0.5, y' = y + 0.2",
    matrix: { a11: -1, a12: 0, a21: 0, a22: 1 },
    translation: [0.5, 0.2],
  },
  {
    id: 'projection',
    label: 'Phép chiếu song song (suy biến)',
    formula: "x' = x, y' = 0.5x - 0.5 (biến △ABC thành đoạn thẳng)",
    matrix: { a11: 1, a12: 0, a21: 0.5, a22: 0 },
    translation: [0.5, -0.5],
  },
];

export interface AffineMapDemoProps {
  readonly title?: string;
  readonly defaultPreset?: AffineMapPresetId;
  readonly height?: number;
}

export function AffineMapDemo({
  title = 'Ánh xạ Affine phẳng f: A → A và tính bảo toàn tâm tỉ cự',
  defaultPreset = 'translation',
  height = 360,
}: AffineMapDemoProps) {
  const initialA: Point2D = [-3.2, -1.2];
  const initialB: Point2D = [-1.2, -1.5];
  const initialC: Point2D = [-2.2, 1.0];

  const [pointA, setPointA] = useState<Point2D>(initialA);
  const [pointB, setPointB] = useState<Point2D>(initialB);
  const [pointC, setPointC] = useState<Point2D>(initialC);
  const [presetId, setPresetId] = useState<AffineMapPresetId>(defaultPreset);

  const preset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0]!;

  // Trung điểm I của AB và ảnh của tam giác + trung điểm qua ánh xạ affine f
  const midpointI = midpoint2D(pointA, pointB);
  const imageA = applyAffineMap2D(pointA, preset.matrix, preset.translation);
  const imageB = applyAffineMap2D(pointB, preset.matrix, preset.translation);
  const imageC = applyAffineMap2D(pointC, preset.matrix, preset.translation);
  const imageI = applyAffineMap2D(midpointI, preset.matrix, preset.translation);

  const handleReset = () => {
    setPointA(initialA);
    setPointB(initialB);
    setPointC(initialC);
    setPresetId(defaultPreset);
  };

  return (
    <AffinePlane
      title={title}
      instruction="Chọn phép biến đổi affine bên dưới và kéo các đỉnh A, B, C của tam giác gốc (màu xanh ngọc) để quan sát ảnh A'B'C' (màu tím)."
      height={height}
      onReset={handleReset}
      footer={
        <div className="space-y-2.5">
          <div
            className="flex flex-wrap items-center gap-1.5"
            role="group"
            aria-label="Chọn phép biến đổi Affine mẫu"
          >
            {PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={presetId === item.id}
                onClick={() => setPresetId(item.id)}
                className={
                  presetId === item.id
                    ? 'rounded-lg border border-teal-600 bg-teal-600 px-2.5 py-1 font-semibold text-white'
                    : 'rounded-lg border border-stone-200 bg-white px-2.5 py-1 font-medium text-stone-700 hover:bg-stone-100'
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/80 pt-2 font-mono">
            <span>Công thức: {preset.formula}</span>
            <span className="font-semibold text-stone-900">
              Bảo toàn trung điểm: f(I) = I&apos;{formatCoords(imageI)} (trung điểm của
              A&apos;B&apos;)
            </span>
          </div>
        </div>
      }
    >
      {/* Tam giác gốc ABC */}
      <Polygon
        points={[pointA, pointB, pointC]}
        color="#0d9488"
        fillOpacity={0.14}
        strokeOpacity={0.7}
      />

      {/* Tam giác ảnh A'B'C' */}
      <Polygon
        points={[imageA, imageB, imageC]}
        color="#4f46e5"
        fillOpacity={0.14}
        strokeOpacity={0.8}
      />

      {/* Các mũi tên ánh xạ A -> A', I -> I' */}
      <VectorArrow tail={pointA} tip={imageA} style="dashed" tone="muted" weight={1.5} />
      <VectorArrow
        tail={midpointI}
        tip={imageI}
        label="f"
        style="dashed"
        tone="accent"
        weight={1.8}
      />

      {/* Điểm gốc A, B, C và trung điểm I */}
      <DraggablePoint point={pointA} onMove={setPointA} label="A" attach="sw" tone="primary" />
      <DraggablePoint point={pointB} onMove={setPointB} label="B" attach="se" tone="primary" />
      <DraggablePoint point={pointC} onMove={setPointC} label="C" attach="nw" tone="primary" />
      <DraggablePoint point={midpointI} label="I" attach="s" tone="accent" />

      {/* Điểm ảnh A', B', C' và I' = f(I) */}
      <DraggablePoint point={imageA} label="A'" attach="sw" tone="secondary" />
      <DraggablePoint point={imageB} label="B'" attach="se" tone="secondary" />
      <DraggablePoint point={imageC} label="C'" attach="ne" tone="secondary" />
      <DraggablePoint point={imageI} label="I'=f(I)" attach="n" tone="warning" />
    </AffinePlane>
  );
}
