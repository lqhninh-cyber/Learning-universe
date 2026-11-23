import { type ReactNode, useMemo } from 'react';
import type { BibliographyEntry, LessonMeta } from '@schemas/index';
import { LessonContext, type LessonContextValue } from './lesson-context';
import { getBibliographyEntry } from './manifest';

export interface LessonProviderProps {
  readonly lessonMeta?: LessonMeta | null;
  readonly lessonId?: string | null;
  readonly lessonTitle?: string | null;
  readonly lessonPath?: string | null;
  /** Cho phép truyền danh mục nguồn tùy chỉnh (hữu ích khi kiểm thử với fixture). */
  readonly bibliography?: readonly BibliographyEntry[];
  readonly children: ReactNode;
}

export function LessonProvider({
  lessonMeta = null,
  lessonId = null,
  lessonTitle = null,
  lessonPath = null,
  bibliography,
  children,
}: LessonProviderProps) {
  const value = useMemo<LessonContextValue>(() => {
    const blocksById = new Map(
      (lessonMeta?.blocks ?? [])
        .filter((block) => block.id !== null)
        .map((block) => [block.id as string, block]),
    );

    const customBibMap = bibliography
      ? new Map(bibliography.map((entry) => [entry.id, entry]))
      : null;

    return {
      lessonMeta,
      lessonId,
      lessonTitle,
      lessonPath,
      resolveBlock: (id: string) => blocksById.get(id),
      resolveSource: (sourceId: string) =>
        customBibMap ? customBibMap.get(sourceId) : getBibliographyEntry(sourceId),
    };
  }, [lessonMeta, lessonId, lessonTitle, lessonPath, bibliography]);

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}
