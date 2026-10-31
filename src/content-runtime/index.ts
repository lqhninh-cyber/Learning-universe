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
export { Proof, type ProofProps } from './components/Proof';
export { Ref, type RefProps } from './components/Ref';
export {
  Corollary,
  Definition,
  Lemma,
  Proposition,
  Theorem,
  type TheoryBlockProps,
  type TheoryKind,
} from './components/TheoryBlock';
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
