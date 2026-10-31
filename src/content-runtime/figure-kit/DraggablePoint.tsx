import { type CardinalDirection, type ConstraintFunction, MovablePoint, Point, Text } from 'mafs';
import { formatCoords, type Point2D, snapPointToStep } from './affine-math';

export type PointTone = 'primary' | 'secondary' | 'accent' | 'warning' | 'neutral';

const TONE_HEX: Record<PointTone, string> = {
  primary: '#0d9488',
  secondary: '#4f46e5',
  accent: '#d97706',
  warning: '#e11d48',
  neutral: '#44403c',
};

export interface DraggablePointProps {
  /** Tọa độ hiện tại $[x, y]$ của điểm. */
  readonly point: Point2D;
  /** Hàm cập nhật tọa độ khi người dùng kéo điểm (nếu không truyền, điểm sẽ cố định). */
  readonly onMove?: (next: Point2D) => void;
  /** Nhãn tên điểm hiển thị cạnh điểm (ví dụ `"A"`, `"M"`, `"G"`). */
  readonly label?: string;
  /** Hiển thị thêm tọa độ $(x; y)$ ngay cạnh nhãn điểm. */
  readonly showCoordinates?: boolean;
  /** Hướng gắn nhãn so với điểm (`"n"`, `"ne"`, `"nw"`, `"s"`, `"se"`, `"sw"`, `"e"`, `"w"`). */
  readonly attach?: CardinalDirection;
  /** Sắc thái màu học thuật của điểm. */
  readonly tone?: PointTone;
  /** Bắt dính điểm vào lưới có bước `snapStep` (ví dụ `0.5` hoặc `0.25`). */
  readonly snapStep?: number;
  /** Hàm ràng buộc chuyển động tùy chỉnh (ví dụ buộc điểm nằm trên một đường thẳng). */
  readonly constrain?: ConstraintFunction;
}

export function DraggablePoint({
  point,
  onMove,
  label,
  showCoordinates = false,
  attach = 'ne',
  tone = 'primary',
  snapStep,
  constrain,
}: DraggablePointProps) {
  const color = TONE_HEX[tone];

  const effectiveConstrain: ConstraintFunction | undefined = constrain
    ? constrain
    : snapStep
      ? (rawPoint) => snapPointToStep(rawPoint, snapStep)
      : undefined;

  const fullLabel = label
    ? showCoordinates
      ? `${label}${formatCoords(point)}`
      : label
    : showCoordinates
      ? formatCoords(point)
      : null;

  return (
    <g data-testid={label ? `figure-point-${label}` : 'figure-point'}>
      {/* Vòng đệm cảm ứng 44px vô hình giúp kéo điểm dễ dàng trên màn hình điện thoại */}
      {onMove && (
        <Point
          x={point[0]}
          y={point[1]}
          color={color}
          opacity={0.12}
          svgCircleProps={{ r: 22, className: 'pointer-events-none' }}
        />
      )}

      {onMove ? (
        <MovablePoint point={point} onMove={onMove} constrain={effectiveConstrain} color={color} />
      ) : (
        <Point x={point[0]} y={point[1]} color={color} />
      )}

      {fullLabel && (
        <Text
          x={point[0]}
          y={point[1]}
          attach={attach}
          attachDistance={16}
          size={14}
          color={color}
          svgTextProps={{ className: 'font-semibold select-none' }}
        >
          {fullLabel}
        </Text>
      )}
    </g>
  );
}
