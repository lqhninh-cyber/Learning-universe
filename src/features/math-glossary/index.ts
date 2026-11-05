export {
  detectCourseIdFromPath,
  findGlossaryEntry,
  getAllGlossaryEntries,
  getGlossaryEntryById,
  MATH_GLOSSARY,
  searchGlossary,
} from '@/data/math-glossary';
export {
  annotateChildren,
  annotateTextString,
  extractLatexFromKatexNode,
  matchLatexToGlossary,
} from './annotator';
export { MathGlossaryContext, type MathGlossaryContextValue } from './context';
export { KatexMath } from './KatexMath';
export { MathGlossaryProvider, type MathGlossaryProviderProps } from './MathGlossaryContext';
export { MathGlossaryPopover } from './MathGlossaryPopover';
export { MathGlossaryTerm, type MathGlossaryTermProps } from './MathGlossaryTerm';
export { QuickPopover } from './QuickPopover';
export { TermLink, type TermLinkProps } from './TermLink';
export type { MathGlossaryEntry, MathGlossarySubject, SearchGlossaryOptions } from './types';
export { useMathGlossary } from './useMathGlossary';
