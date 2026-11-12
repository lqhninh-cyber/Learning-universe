import { lazy } from 'react';

export const LazyBarycentricViz = lazy(() =>
  import('./BarycentricViz').then((m) => ({ default: m.BarycentricViz })),
);

export const LazyEuclideanDotCrossViz = lazy(() =>
  import('./EuclideanDotCrossViz').then((m) => ({
    default: m.EuclideanDotCrossViz,
  })),
);

export const LazyDesarguesProjectiveViz = lazy(() =>
  import('./DesarguesProjectiveViz').then((m) => ({
    default: m.DesarguesProjectiveViz,
  })),
);

export const LazySymmetricGroupCycleViz = lazy(() =>
  import('./SymmetricGroupCycleViz').then((m) => ({
    default: m.SymmetricGroupCycleViz,
  })),
);
