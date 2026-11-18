import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface BlueprintSectionFrameProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly innerClassName?: string;
  /** Các vị trí trục chia cột theo tỉ lệ 0..1 để đặt chốt chữ thập + trên đường chân */
  readonly columnSeams?: readonly number[];
  readonly crosshairColor?: string;
  readonly borderClassName?: string;
  readonly showInnerKeyline?: boolean;
  readonly 'data-testid'?: string;
}

function CrosshairNode({
  positionClass,
  color,
  style,
}: {
  readonly positionClass: string;
  readonly color: string;
  readonly style?: React.CSSProperties;
}) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      aria-hidden="true"
      style={style}
      className={cn('pointer-events-none absolute z-20 block', positionClass)}
    >
      <path d="M5.5 0V11M0 5.5H11" stroke={color} strokeWidth="1.2" shapeRendering="crispEdges" />
      <circle cx="5.5" cy="5.5" r="1.15" fill={color} />
    </svg>
  );
}

/**
 * Khung bản vẽ kiến trúc Blueprint (Hallmark Blueprint + Almanac):
 * Viền hairline 1px #CFD8D4 kèm các điểm định vị chữ thập + 11x11px #8C7248 ở góc & nút chia cột.
 */
export function BlueprintSectionFrame({
  children,
  className,
  innerClassName,
  columnSeams,
  crosshairColor = '#8C7248',
  borderClassName = 'border-[#CFD8D4]',
  showInnerKeyline = false,
  'data-testid': dataTestId = 'blueprint-section-frame',
}: BlueprintSectionFrameProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cn('relative border bg-[#FAFBF9]/60', borderClassName, className)}
    >
      {/* 4 nút chữ thập góc cố định 11x11px */}
      <CrosshairNode positionClass="-top-[5.5px] -left-[5.5px]" color={crosshairColor} />
      <CrosshairNode positionClass="-top-[5.5px] -right-[5.5px]" color={crosshairColor} />
      <CrosshairNode positionClass="-bottom-[5.5px] -left-[5.5px]" color={crosshairColor} />
      <CrosshairNode positionClass="-bottom-[5.5px] -right-[5.5px]" color={crosshairColor} />

      {/* Các nút chữ thập giao tuyến chia cột ở cạnh trên & dưới */}
      {columnSeams?.map((fraction) => {
        const pct = `${(fraction * 100).toFixed(3)}%`;
        return (
          <span key={pct} aria-hidden="true" className="hidden lg:contents">
            <CrosshairNode
              positionClass="-top-[5.5px] -translate-x-1/2"
              style={{ left: pct }}
              color={crosshairColor}
            />
            <CrosshairNode
              positionClass="-bottom-[5.5px] -translate-x-1/2"
              style={{ left: pct }}
              color={crosshairColor}
            />
          </span>
        );
      })}

      {/* Keyline nội vi kép tùy chọn */}
      {showInnerKeyline && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[5px] z-[1] border border-[#1E332E]/[0.06]"
        />
      )}

      <div className={cn('relative z-[2]', innerClassName)}>{children}</div>
    </div>
  );
}
