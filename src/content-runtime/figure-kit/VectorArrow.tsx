import { Text, Vector } from 'mafs';
import {
  addVec,
  midpoint2D,
  type Point2D,
  scaleVec,
  unitNormal,
  vectorBetween,
  vectorLength,
} from './affine-math';

export type VectorTone = 'primary' | 'secondary' | 'accent' | 'warning' | 'muted';

const VECTOR_HEX: Record<VectorTone, string> = {
  primary: '#0d9488',
  secondary: '#4f46e5',
  accent: '#d97706',
  warning: '#e11d48',
  muted: '#78716c',
};

export interface VectorArrowProps {
  /** Điểm gốc của vectơ (mặc định $[0, 0]$). */
  readonly tail?: Point2D;
  /** Điểm ngọn của vectơ. */
  readonly tip: Point2D;
  /** Nhãn hiển thị cạnh mũi tên (ví dụ `"AB"`, `"u"`, `"v"`). */
  readonly label?: string;
  /** Sắc thái màu của vectơ. */
  readonly tone?: VectorTone;
  /** Kiểu nét vẽ (`"solid"` hoặc `"dashed"`). */
  readonly style?: 'solid' | 'dashed';
  /** Độ dày nét vẽ (mặc định `2.5`). */
  readonly weight?: number;
  /** Đảo phía đặt nhãn sang bên phải hay bên trái hướng vectơ. */
  readonly labelSide?: 'left' | 'right';
}

export function VectorArrow({
  tail = [0, 0],
  tip,
  label,
  tone = 'primary',
  style = 'solid',
  weight = 2.5,
  labelSide = 'left',
}: VectorArrowProps) {
  const color = VECTOR_HEX[tone];
  const vec = vectorBetween(tail, tip);
  const len = vectorLength(vec);
  const mid = midpoint2D(tail, tip);
  const normal = unitNormal(vec);
  const sign = labelSide === 'left' ? 1 : -1;
  const labelPos = addVec(mid, scaleVec(normal, 0.36 * sign));

  return (
    <g data-testid={label ? `figure-vector-${label}` : 'figure-vector'}>
      <Vector tail={tail} tip={tip} color={color} style={style} weight={weight} />
      {label && len > 0.15 && (
        <Text
          x={labelPos[0]}
          y={labelPos[1]}
          size={13}
          color={color}
          svgTextProps={{ className: 'font-semibold select-none' }}
        >
          {label}
        </Text>
      )}
    </g>
  );
}
