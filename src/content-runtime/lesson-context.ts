import { createContext, useContext } from 'react';
import type { BibliographyEntry, LessonBlockInfo, LessonMeta } from '@schemas/index';
import { getBibliographyEntry } from './manifest';

export interface LessonContextValue {
  readonly lessonMeta: LessonMeta | null;
  readonly lessonId: string | null;
  readonly lessonTitle: string | null;
  readonly lessonPath: string | null;
  readonly resolveBlock: (id: string) => LessonBlockInfo | undefined;
  readonly resolveSource: (sourceId: string) => BibliographyEntry | undefined;
}

const defaultLessonContextValue: LessonContextValue = {
  lessonMeta: null,
  lessonId: null,
  lessonTitle: null,
  lessonPath: null,
  resolveBlock: () => undefined,
  resolveSource: (sourceId: string) => getBibliographyEntry(sourceId),
};

export const LessonContext = createContext<LessonContextValue>(defaultLessonContextValue);

export function useLessonContext(): LessonContextValue {
  return useContext(LessonContext);
}
