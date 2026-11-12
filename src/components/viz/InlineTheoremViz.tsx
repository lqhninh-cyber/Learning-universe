import { Suspense } from 'react';
import type React from 'react';
import {
  LazyBarycentricViz,
  LazyDesarguesProjectiveViz,
  LazyEuclideanDotCrossViz,
  LazySymmetricGroupCycleViz,
} from './lazy';

type VizRenderer = () => React.ReactElement;

const THEOREM_VIZ_REGISTRY: Record<string, VizRenderer> = {
  'thm-s4-1': () => <LazyBarycentricViz />,
  'def-e1-3': () => <LazyEuclideanDotCrossViz />,
  'def-e2-1': () => <LazyEuclideanDotCrossViz />,
  'thm-p7-13': () => <LazyDesarguesProjectiveViz />,
  'thm-p10-6': () => <LazyDesarguesProjectiveViz />,
  'thm-c1-b3-tinh-chat-hoan-vi': () => <LazySymmetricGroupCycleViz initialDegree={3} />,
  'thm-c3-b3-cau-truc-a4': () => <LazySymmetricGroupCycleViz initialDegree={4} />,
};

export interface InlineTheoremVizProps {
  blockId: string;
}

export function InlineTheoremViz({ blockId }: InlineTheoremVizProps) {
  const renderViz = THEOREM_VIZ_REGISTRY[blockId];
  if (!renderViz) return null;

  return (
    <Suspense
      fallback={
        <div
          className="viz"
          style={{ padding: '1rem', color: 'var(--text-muted, #475569)' }}
          aria-busy="true"
        >
          Đang tải mô hình thực nghiệm tương tác...
        </div>
      }
    >
      {renderViz()}
    </Suspense>
  );
}
