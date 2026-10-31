import { lazy, Suspense } from 'react';
import { Skeleton } from '@/shared/ui';
import type { AffineFrameProps } from './AffineFrame';
import type { AffineLineProps } from './AffineLine';
import type { AffineMapDemoProps } from './AffineMapDemo';
import type { AffinePlaneProps } from './AffinePlane';
import type { BarycenterProps } from './Barycenter';
import type { DraggablePointProps } from './DraggablePoint';
import type { ParallelogramProps } from './Parallelogram';
import type { VectorArrowProps } from './VectorArrow';

const AffinePlaneInner = lazy(() =>
  import('./AffinePlane').then((m) => ({ default: m.AffinePlane })),
);
const DraggablePointInner = lazy(() =>
  import('./DraggablePoint').then((m) => ({ default: m.DraggablePoint })),
);
const VectorArrowInner = lazy(() =>
  import('./VectorArrow').then((m) => ({ default: m.VectorArrow })),
);
const AffineLineInner = lazy(() => import('./AffineLine').then((m) => ({ default: m.AffineLine })));
const AffineFrameInner = lazy(() =>
  import('./AffineFrame').then((m) => ({ default: m.AffineFrame })),
);
const ParallelogramInner = lazy(() =>
  import('./Parallelogram').then((m) => ({ default: m.Parallelogram })),
);
const BarycenterInner = lazy(() => import('./Barycenter').then((m) => ({ default: m.Barycenter })));
const AffineMapDemoInner = lazy(() =>
  import('./AffineMapDemo').then((m) => ({ default: m.AffineMapDemo })),
);

function FigureFallback({ height = 340 }: { readonly height?: number }) {
  return (
    <div
      aria-label="Đang tải hình tương tác 2D"
      className="my-5 overflow-hidden rounded-2xl border border-stone-200 bg-white p-4"
    >
      <Skeleton className="mb-3 h-5 w-1/3" />
      <Skeleton className="w-full rounded-xl" style={{ height }} />
    </div>
  );
}

export function LazyAffinePlane(props: AffinePlaneProps) {
  return (
    <Suspense fallback={<FigureFallback height={props.height} />}>
      <AffinePlaneInner {...props} />
    </Suspense>
  );
}

export function LazyDraggablePoint(props: DraggablePointProps) {
  return (
    <Suspense fallback={null}>
      <DraggablePointInner {...props} />
    </Suspense>
  );
}

export function LazyVectorArrow(props: VectorArrowProps) {
  return (
    <Suspense fallback={null}>
      <VectorArrowInner {...props} />
    </Suspense>
  );
}

export function LazyAffineLine(props: AffineLineProps) {
  return (
    <Suspense fallback={null}>
      <AffineLineInner {...props} />
    </Suspense>
  );
}

export function LazyAffineFrame(props: AffineFrameProps) {
  return (
    <Suspense fallback={<FigureFallback height={props.height} />}>
      <AffineFrameInner {...props} />
    </Suspense>
  );
}

export function LazyParallelogram(props: ParallelogramProps) {
  return (
    <Suspense fallback={<FigureFallback height={props.height} />}>
      <ParallelogramInner {...props} />
    </Suspense>
  );
}

export function LazyBarycenter(props: BarycenterProps) {
  return (
    <Suspense fallback={<FigureFallback height={props.height} />}>
      <BarycenterInner {...props} />
    </Suspense>
  );
}

export function LazyAffineMapDemo(props: AffineMapDemoProps) {
  return (
    <Suspense fallback={<FigureFallback height={props.height} />}>
      <AffineMapDemoInner {...props} />
    </Suspense>
  );
}
