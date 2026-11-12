import { RotateCcw } from 'lucide-react';
import type React from 'react';
import { SVG_H, SVG_W } from './viz-math';

export interface InteractiveVizFrameProps {
  title: string;
  subtitle?: string;
  onReset: () => void;
  svgRef?: React.RefObject<SVGSVGElement | null>;
  onSvgPointerMove?: (e: React.PointerEvent<SVGSVGElement>) => void;
  onSvgPointerUp?: (e: React.PointerEvent<SVGSVGElement>) => void;
  svgAriaLabel?: string;
  svgChildren: React.ReactNode;
  controls: React.ReactNode;
  info: React.ReactNode;
}

export function InteractiveVizFrame({
  title,
  subtitle,
  onReset,
  svgRef,
  onSvgPointerMove,
  onSvgPointerUp,
  svgAriaLabel,
  svgChildren,
  controls,
  info,
}: InteractiveVizFrameProps) {
  return (
    <section
      className="viz"
      data-testid="interactive-viz"
      aria-label={`Thực nghiệm tương tác: ${title}`}
    >
      <header className="viz-header">
        <div className="viz-title-wrap">
          <h4 className="viz-title">🧪 Thực nghiệm tương tác: {title}</h4>
          {subtitle ? <p className="viz-subtitle">{subtitle}</p> : null}
        </div>
        <button type="button" onClick={onReset} className="viz-btn viz-reset-btn">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Đặt lại (Reset)</span>
        </button>
      </header>

      <div className="viz-stage">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="viz-svg"
          role="img"
          aria-label={svgAriaLabel ?? title}
          onPointerMove={onSvgPointerMove}
          onPointerUp={onSvgPointerUp}
          onPointerCancel={onSvgPointerUp}
        >
          <defs>
            <pattern id="viz-grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="var(--viz-grid, rgba(15,23,42,0.08))"
                strokeWidth="1"
              />
            </pattern>
            <marker
              id="viz-arrow-primary"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="var(--viz-primary)" />
            </marker>
            <marker
              id="viz-arrow-secondary"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="var(--viz-secondary)" />
            </marker>
            <marker
              id="viz-arrow-accent"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="var(--viz-accent)" />
            </marker>
            <marker
              id="viz-arrow-purple"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="var(--viz-purple)" />
            </marker>
          </defs>

          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#viz-grid-pattern)" />
          {svgChildren}
        </svg>
      </div>

      <div className="vc">{controls}</div>
      <div className="vi" aria-live="polite">
        {info}
      </div>
    </section>
  );
}
