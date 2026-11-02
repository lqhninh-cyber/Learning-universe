export {
  getAllGlossaryEntries,
  getGlossaryEntryById,
  MATH_GLOSSARY,
  searchGlossary,
} from '@/data/math-glossary';
export { annotateChildren, matchLatexToGlossary } from './annotator';
export { KatexMath } from './KatexMath';
export { MathGlossaryProvider } from './MathGlossaryContext';
export { MathGlossaryPopover } from './MathGlossaryPopover';
export { MathGlossaryTerm } from './MathGlossaryTerm';
export type { MathGlossaryEntry, MathGlossarySubject, SearchGlossaryOptions } from './types';
export { useMathGlossary } from './useMathGlossary';
