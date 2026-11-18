import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface BlueprintSectionFrameProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly innerClassName?: string;
  /** Các vị trí trục chia cột theo tỉ lệ 0..1 để đặt chốt chữ thập + trên đường chân */
  readonly columnSeams?: readonly number[];
  /** Vị trí thanh ngăn Telemetry đầu khung (px từ trên xuống) để gắn giao điểm chữ thập */
  readonly headerSeamTopPx?: number;
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
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      style={style}
      className={cn('pointer-events-none absolute z-20 block', positionClass)}
    >
      <path d="M6 0V12M0 6H12" stroke={color} strokeWidth="1.25" shapeRendering="crispEdges" />
      <circle cx="6" cy="6" r="1.2" fill={color} />
    </svg>
  );
}

/**
 * Khung bản vẽ kiến trúc Blueprint (Hallmark Blueprint + Almanac):
 * Viền hairline 1px #CFD8D4, bo góc sắc 2px, keyline nội vi và chốt chữ thập 12x12px #8C7248 ở mọi giao điểm.
 */
export function BlueprintSectionFrame({
  children,
  className,
  innerClassName,
  columnSeams,
  headerSeamTopPx,
  crosshairColor = '#8C7248',
  borderClassName = 'border-[#CFD8D4]',
  showInnerKeyline = false,
  'data-testid': dataTestId = 'blueprint-section-frame',
}: BlueprintSectionFrameProps) {
  return (
    <div
      data-testid={dataTestId}
      className={cn('relative border bg-[#FAFBF9]/70', borderClassName, className)}
    >
      {/* 4 nút chữ thập chuẩn trực 12x12px #8C7248 tại 4 góc ngoài */}
      <CrosshairNode positionClass="-top-[6px] -left-[6px]" color={crosshairColor} />
      <CrosshairNode positionClass="-top-[6px] -right-[6px]" color={crosshairColor} />
      <CrosshairNode positionClass="-bottom-[6px] -left-[6px]" color={crosshairColor} />
      <CrosshairNode positionClass="-bottom-[6px] -right-[6px]" color={crosshairColor} />

      {/* Giao điểm chữ thập hai bên đường chân thanh Telemetry đầu khung */}
      {headerSeamTopPx !== undefined && (
        <>
          <CrosshairNode
            positionClass="-left-[6px] -translate-y-1/2"
            style={{ top: `${headerSeamTopPx}px` }}
            color={crosshairColor}
          />
          <CrosshairNode
            positionClass="-right-[6px] -translate-y-1/2"
            style={{ top: `${headerSeamTopPx}px` }}
            color={crosshairColor}
          />
        </>
      )}

      {/* Các nút chữ thập giao tuyến chia cột ở cạnh trên & dưới */}
      {columnSeams?.map((fraction) => {
        const pct = `${(fraction * 100).toFixed(3)}%`;
        return (
          <span key={pct} aria-hidden="true" className="hidden lg:contents">
            <CrosshairNode
              positionClass="-top-[6px] -translate-x-1/2"
              style={{ left: pct }}
              color={crosshairColor}
            />
            <CrosshairNode
              positionClass="-bottom-[6px] -translate-x-1/2"
              style={{ left: pct }}
              color={crosshairColor}
            />
          </span>
        );
      })}

      {/* Keyline nội vi kép kiểu bản vẽ kỹ thuật */}
      {showInnerKeyline && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[5px] z-[1] border border-[#1E332E]/[0.075]"
        />
      )}

      <div className={cn('relative z-[2]', innerClassName)}>{children}</div>
    </div>
  );
}
