import { lazy } from 'react';

export function preloadCommandPalette(): void {
  void import('./CommandPalette');
}

export const LazyCommandPalette = lazy(() =>
  import('./CommandPalette').then((mod) => ({ default: mod.CommandPalette })),
);
