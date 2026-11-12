export { Note, Remark, Warning, type CalloutBlockProps } from './components/CalloutBlock';
export { Cite, type CiteProps } from './components/Cite';
export { Counterexample, Example, type ExampleBlockProps } from './components/ExampleBlock';
export {
  Exercise,
  type ExerciseProps,
  Hint,
  type HintProps,
  Solution,
  type SolutionProps,
} from './components/ExerciseBlock';
export { Figure, type FigureProps } from './components/Figure';
export { KeyTakeaways, type KeyTakeawaysProps } from './components/KeyTakeaways';
export {
  Chapter0KnowledgeMap,
  type Chapter0KnowledgeMapProps,
} from './components/Chapter0KnowledgeMap';
export {
  Chapter1KnowledgeMap,
  type Chapter1KnowledgeMapProps,
} from './components/Chapter1KnowledgeMap';
export {
  Chapter3KnowledgeMap,
  type Chapter3KnowledgeMapProps,
} from './components/Chapter3KnowledgeMap';
export {
  Chapter5KnowledgeMap,
  type Chapter5KnowledgeMapProps,
} from './components/Chapter5KnowledgeMap';
export {
  Chapter6KnowledgeMap,
  type Chapter6KnowledgeMapProps,
} from './components/Chapter6KnowledgeMap';
export {
  Chapter7KnowledgeMap,
  type Chapter7KnowledgeMapProps,
} from './components/Chapter7KnowledgeMap';
export { CayleyTable, type CayleyTableProps } from './components/CayleyTable';
export { MermaidChart, type MermaidChartProps } from './components/MermaidChart';
export { Proof, type ProofProps } from './components/Proof';
export { Ref, type RefProps } from './components/Ref';
export {
  Sidenote,
  SidenoteProvider,
  type SidenoteProps,
  type SidenoteType,
  useSidenoteContext,
} from '@/shared/components/Sidenote';
export {
  Corollary,
  Definition,
  Lemma,
  Property,
  Proposition,
  Theorem,
  type TheoryBlockProps,
  type TheoryKind,
} from './components/TheoryBlock';
export { MathRenderer, type MathRendererProps } from './components/MathRenderer';
export { useLessonContext, type LessonContextValue } from './lesson-context';
export { LessonProvider, type LessonProviderProps } from './LessonContext';
export { LessonMdxView, type LessonMdxViewProps } from './LessonMdxView';
export { loadLessonModule, type CompiledLessonModule } from './loader';
export {
  type AdjacentLessons,
  getAdjacentLessons,
  getBibliographyEntry,
  getContentDiagnostics,
  getLessonById,
  getLessonBySlug,
  getManifest,
  getSubjectBySlug,
  getSubjectLessons,
  getSubjects,
  getSubjectStats,
  type LessonLocation,
  resolveLessonShortcut,
  type SubjectStats,
} from './manifest';
export { mdxComponents } from './mdx-components';
