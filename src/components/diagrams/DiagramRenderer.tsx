import { Chapter0KnowledgeMap } from '@/content-runtime/components/Chapter0KnowledgeMap';
import { Chapter1KnowledgeMap } from '@/content-runtime/components/Chapter1KnowledgeMap';
import { Chapter3KnowledgeMap } from '@/content-runtime/components/Chapter3KnowledgeMap';
import { Chapter5KnowledgeMap } from '@/content-runtime/components/Chapter5KnowledgeMap';
import { Chapter6KnowledgeMap } from '@/content-runtime/components/Chapter6KnowledgeMap';
import { Chapter7KnowledgeMap } from '@/content-runtime/components/Chapter7KnowledgeMap';
import { cn } from '@/shared/lib/cn';
import {
  Chapter2CyclicMapSvg,
  Chapter8RingHomomorphismMapSvg,
  Chapter9CourseEvolutionMapSvg,
  FractionFieldUniversalTriangleSvg,
  GenericFlowchartSvg,
  PolynomialQuotientTrioSvg,
  PrimeSubfieldDichotomySvg,
  RingCharacteristicTriangleSvg,
  RingQuotientFactorTriangleSvg,
  RingStructureHierarchySvg,
  SubringUnityCasesSvg,
  Z12SubgroupLatticeSvg,
  Z20SubgroupLatticeSvg,
} from './AlgebraDiagrams';
import { resolveDiagramMetadata } from './diagramMetadata';

export interface DiagramRendererProps {
  readonly chart: string;
  readonly className?: string;
  readonly title?: string;
}

export function DiagramRenderer({ chart, className, title }: DiagramRendererProps) {
  const meta = resolveDiagramMetadata(chart);

  if (meta.kind === 'chapter-0-map') {
    return <Chapter0KnowledgeMap className={className} title={title} />;
  }
  if (meta.kind === 'chapter-1-map') {
    return <Chapter1KnowledgeMap className={className} title={title} />;
  }
  if (meta.kind === 'chapter-3-map') {
    return <Chapter3KnowledgeMap className={className} title={title} />;
  }
  if (meta.kind === 'chapter-5-map') {
    return <Chapter5KnowledgeMap className={className} title={title} />;
  }
  if (meta.kind === 'chapter-6-map') {
    return <Chapter6KnowledgeMap className={className} title={title} />;
  }
  if (meta.kind === 'chapter-7-map') {
    return <Chapter7KnowledgeMap className={className} title={title} />;
  }

  const renderSvg = () => {
    switch (meta.kind) {
      case 'z12-subgroup-lattice':
        return <Z12SubgroupLatticeSvg />;
      case 'z20-subgroup-lattice':
        return <Z20SubgroupLatticeSvg />;
      case 'chapter-2-cyclic-map':
        return <Chapter2CyclicMapSvg />;
      case 'ring-hierarchy':
        return <RingStructureHierarchySvg />;
      case 'subring-unity-cases':
        return <SubringUnityCasesSvg />;
      case 'poly-quotient-trio':
        return <PolynomialQuotientTrioSvg />;
      case 'comm-tri-ring-quotient':
        return <RingQuotientFactorTriangleSvg />;
      case 'comm-tri-ring-char':
        return <RingCharacteristicTriangleSvg />;
      case 'comm-tri-frac-universal':
        return <FractionFieldUniversalTriangleSvg />;
      case 'prime-subfield-dichotomy':
        return <PrimeSubfieldDichotomySvg />;
      case 'chapter-8-ring-hom-map':
        return <Chapter8RingHomomorphismMapSvg />;
      case 'chapter-9-evolution-map':
        return <Chapter9CourseEvolutionMapSvg />;
      default:
        return <GenericFlowchartSvg chart={chart} />;
    }
  };

  return (
    <figure
      data-testid="diagram-renderer"
      data-diagram-kind={meta.kind}
      data-diagram-renderer="true"
      className={cn(
        'my-8 overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-main)] shadow-xs transition-colors duration-200',
        className,
      )}
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-hairline)] bg-[var(--bg-workspace)]/75 px-5 py-3">
        <span className="font-serif text-[15px] font-semibold text-[var(--text-main)]">
          {title ?? meta.heading}
        </span>
        <span className="inline-flex items-center rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-secondary)]">
          {meta.badge}
        </span>
      </figcaption>

      <div className="overflow-x-auto px-3 py-5 sm:px-6 sm:py-6">{renderSvg()}</div>
    </figure>
  );
}
