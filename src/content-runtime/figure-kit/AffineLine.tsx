import { Line, Plot, Text } from 'mafs';
import { addVec, midpoint2D, type Point2D, type Vector2D, vectorLength } from './affine-math';

export type LineTone = 'primary' | 'secondary' | 'accent' | 'muted';

const LINE_HEX: Record<LineTone, string> = {
  primary: '#0d9488',
  secondary: '#4f46e5',
  accent: '#d97706',
  muted: '#78716c',
};

export interface AffineLineProps {
  /** Cách 1: Đường thẳng đi qua hai điểm phân biệt $A$ và $B$. */
  readonly through?: readonly [Point2D, Point2D];
  /** Cách 2: Đường thẳng đi qua điểm $A$ với vectơ chỉ phương $\vec{u}$. */
  readonly pointDirection?: {
    readonly point: Point2D;
    readonly direction: Vector2D;
  };
  /** Cách 3: Siêu phẳng / Đường thẳng trong $\R^2$ theo phương trình tổng quát $ax + by + c = 0$. */
  readonly generalEquation?: {
    readonly a: number;
    readonly b: number;
    readonly c: number;
    /** Tô miền nửa mặt phẳng dương $ax + by + c \ge 0$. */
    readonly shadeHalfPlane?: boolean;
  };
  /** Chỉ vẽ đoạn thẳng hữu hạn giữa 2 điểm trong `through`. */
  readonly segmentOnly?: boolean;
  readonly label?: string;
  readonly tone?: LineTone;
  readonly style?: 'solid' | 'dashed';
  readonly weight?: number;
}

export function AffineLine({
  through,
  pointDirection,
  generalEquation,
  segmentOnly = false,
  label,
  tone = 'secondary',
  style = 'solid',
  weight = 2,
}: AffineLineProps) {
  const color = LINE_HEX[tone];

  if (through) {
    const [p1, p2] = through;
    const dist = vectorLength([p2[0] - p1[0], p2[1] - p1[1]]);
    if (dist < 1e-5) {
      return null;
    }
    const mid = midpoint2D(p1, p2);
    return (
      <g data-testid={label ? `figure-line-${label}` : 'figure-line'}>
        {segmentOnly ? (
          <Line.Segment point1={p1} point2={p2} color={color} style={style} weight={weight} />
        ) : (
          <Line.ThroughPoints point1={p1} point2={p2} color={color} style={style} weight={weight} />
        )}
        {label && (
          <Text x={mid[0] + 0.25} y={mid[1] + 0.3} size={13} color={color}>
            {label}
          </Text>
        )}
      </g>
    );
  }

  if (pointDirection) {
    const { point, direction } = pointDirection;
    if (vectorLength(direction) < 1e-5) {
      return null;
    }
    const secondPoint = addVec(point, direction);
    return (
      <g data-testid={label ? `figure-line-${label}` : 'figure-line'}>
        <Line.ThroughPoints
          point1={point}
          point2={secondPoint}
          color={color}
          style={style}
          weight={weight}
        />
        {label && (
          <Text x={secondPoint[0] + 0.25} y={secondPoint[1] + 0.25} size={13} color={color}>
            {label}
          </Text>
        )}
      </g>
    );
  }

  if (generalEquation) {
    const { a, b, c, shadeHalfPlane = false } = generalEquation;
    if (Math.abs(a) < 1e-5 && Math.abs(b) < 1e-5) {
      return null;
    }

    if (Math.abs(b) >= 1e-5) {
      const fnX = (x: number) => (-a * x - c) / b;
      return (
        <g data-testid={label ? `figure-line-${label}` : 'figure-line'}>
          {shadeHalfPlane ? (
            b > 0 ? (
              <Plot.Inequality y={{ '>=': fnX }} color={color} />
            ) : (
              <Plot.Inequality y={{ '<=': fnX }} color={color} />
            )
          ) : (
            <Plot.OfX y={fnX} color={color} style={style} weight={weight} />
          )}
          {label && (
            <Text x={0.4} y={fnX(0.4) + 0.35} size={13} color={color}>
              {label}
            </Text>
          )}
        </g>
      );
    }

    const xConst = -c / a;
    return (
      <g data-testid={label ? `figure-line-${label}` : 'figure-line'}>
        {shadeHalfPlane ? (
          a > 0 ? (
            <Plot.Inequality x={{ '>=': () => xConst }} color={color} />
          ) : (
            <Plot.Inequality x={{ '<=': () => xConst }} color={color} />
          )
        ) : (
          <Line.ThroughPoints
            point1={[xConst, -10]}
            point2={[xConst, 10]}
            color={color}
            style={style}
            weight={weight}
          />
        )}
        {label && (
          <Text x={xConst + 0.35} y={1} size={13} color={color}>
            {label}
          </Text>
        )}
      </g>
    );
  }

  return null;
}
