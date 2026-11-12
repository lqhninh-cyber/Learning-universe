import { useCallback, useRef, useState } from 'react';
import type React from 'react';
import { clampSvgPoint, SVG_H, SVG_W, type Point2D } from './viz-math';

export function clientToSvgPoint(
  svg: SVGSVGElement | null,
  clientX: number,
  clientY: number,
  pad = 22,
): Point2D {
  if (!svg) return { x: SVG_W / 2, y: SVG_H / 2 };
  const rect = svg.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    return clampSvgPoint({ x: clientX, y: clientY }, pad);
  }
  const rawX = ((clientX - rect.left) / rect.width) * SVG_W;
  const rawY = ((clientY - rect.top) / rect.height) * SVG_H;
  return clampSvgPoint({ x: rawX, y: rawY }, pad);
}

interface UseSvgDragOptions<K extends string> {
  onDrag: (id: K, point: Point2D) => void;
  pad?: number;
}

export function useSvgDrag<K extends string>({ onDrag, pad = 22 }: UseSvgDragOptions<K>) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [activeId, setActiveId] = useState<K | null>(null);

  const startDrag = useCallback(
    (id: K) => (e: React.PointerEvent<SVGElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setActiveId(id);
      const pt = clientToSvgPoint(svgRef.current, e.clientX, e.clientY, pad);
      onDrag(id, pt);
    },
    [onDrag, pad],
  );

  const handleSvgPointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!activeId) return;
      const pt = clientToSvgPoint(svgRef.current, e.clientX, e.clientY, pad);
      onDrag(activeId, pt);
    },
    [activeId, onDrag, pad],
  );

  const stopDrag = useCallback(() => {
    setActiveId(null);
  }, []);

  const nudgePoint = useCallback(
    (id: K, current: Point2D, step = 10) =>
      (e: React.KeyboardEvent<SVGElement>) => {
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowLeft') dx = -step;
        else if (e.key === 'ArrowRight') dx = step;
        else if (e.key === 'ArrowUp') dy = -step;
        else if (e.key === 'ArrowDown') dy = step;
        else return;

        e.preventDefault();
        onDrag(id, clampSvgPoint({ x: current.x + dx, y: current.y + dy }, pad));
      },
    [onDrag, pad],
  );

  return {
    svgRef,
    activeId,
    startDrag,
    handleSvgPointerMove,
    stopDrag,
    nudgePoint,
  };
}
