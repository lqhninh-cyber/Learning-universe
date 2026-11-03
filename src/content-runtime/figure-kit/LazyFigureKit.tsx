import { lazy, Suspense } from 'react';
import { Skeleton } from '@/shared/ui';
import type { AffineFrameProps } from './AffineFrame';
import type { AffineLineProps } from './AffineLine';
import type { AffineMapDemoProps } from './AffineMapDemo';
import type { AffinePlaneProps } from './AffinePlane';
import type { BarycenterProps } from './Barycenter';
import type { DraggablePointProps } from './DraggablePoint';
import type { ParallelogramProps } from './Parallelogram';
import type { RiemannDarbouxSumDemoProps } from './RiemannDarbouxSumDemo';
import type { SequenceEpsilonDemoProps } from './SequenceEpsilonDemo';
import type { SupremumEpsilonDemoProps } from './SupremumEpsilonDemo';
import type { TaylorPolynomialDemoProps } from './TaylorPolynomialDemo';
import type { UniformContinuityDemoProps } from './UniformContinuityDemo';
import type { VectorArrowProps } from './VectorArrow';
import type { WeierstrassMTestDemoProps } from './WeierstrassMTestDemo';

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
const SupremumEpsilonDemoInner = lazy(() =>
  import('./SupremumEpsilonDemo').then((m) => ({ default: m.SupremumEpsilonDemo })),
);
const SequenceEpsilonDemoInner = lazy(() =>
  import('./SequenceEpsilonDemo').then((m) => ({ default: m.SequenceEpsilonDemo })),
);
const UniformContinuityDemoInner = lazy(() =>
  import('./UniformContinuityDemo').then((m) => ({ default: m.UniformContinuityDemo })),
);
const TaylorPolynomialDemoInner = lazy(() =>
  import('./TaylorPolynomialDemo').then((m) => ({ default: m.TaylorPolynomialDemo })),
);
const RiemannDarbouxSumDemoInner = lazy(() =>
  import('./RiemannDarbouxSumDemo').then((m) => ({ default: m.RiemannDarbouxSumDemo })),
);
const WeierstrassMTestDemoInner = lazy(() =>
  import('./WeierstrassMTestDemo').then((m) => ({ default: m.WeierstrassMTestDemo })),
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

export function LazySupremumEpsilonDemo(props: SupremumEpsilonDemoProps) {
  return (
    <Suspense fallback={<FigureFallback height={240} />}>
      <SupremumEpsilonDemoInner {...props} />
    </Suspense>
  );
}

export function LazySequenceEpsilonDemo(props: SequenceEpsilonDemoProps) {
  return (
    <Suspense fallback={<FigureFallback height={260} />}>
      <SequenceEpsilonDemoInner {...props} />
    </Suspense>
  );
}

export function LazyUniformContinuityDemo(props: UniformContinuityDemoProps) {
  return (
    <Suspense fallback={<FigureFallback height={280} />}>
      <UniformContinuityDemoInner {...props} />
    </Suspense>
  );
}

export function LazyTaylorPolynomialDemo(props: TaylorPolynomialDemoProps) {
  return (
    <Suspense fallback={<FigureFallback height={280} />}>
      <TaylorPolynomialDemoInner {...props} />
    </Suspense>
  );
}

export function LazyRiemannDarbouxSumDemo(props: RiemannDarbouxSumDemoProps) {
  return (
    <Suspense fallback={<FigureFallback height={280} />}>
      <RiemannDarbouxSumDemoInner {...props} />
    </Suspense>
  );
}

export function LazyWeierstrassMTestDemo(props: WeierstrassMTestDemoProps) {
  return (
    <Suspense fallback={<FigureFallback height={280} />}>
      <WeierstrassMTestDemoInner {...props} />
    </Suspense>
  );
}
