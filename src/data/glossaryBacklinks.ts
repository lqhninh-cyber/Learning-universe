import rawBacklinks from './generated/glossaryBacklinks.json';

export interface GlossaryLessonBacklink {
  readonly lessonId: string;
  readonly lessonCode: string;
  readonly lessonTitle: string;
  readonly subjectId: string;
  readonly href: string;
  readonly count: number;
}

export interface GlossaryBacklinksIndex {
  readonly stats: {
    readonly totalLessons: number;
    readonly totalTerms: number;
    readonly totalBacklinks: number;
    readonly termsWithBacklinks: number;
    readonly lessonsWithBacklinks: number;
  };
  readonly byTerm: Readonly<Record<string, readonly GlossaryLessonBacklink[]>>;
  readonly byLesson: Readonly<Record<string, readonly string[]>>;
}

export const GLOSSARY_BACKLINKS: GlossaryBacklinksIndex = rawBacklinks as GlossaryBacklinksIndex;

const EMPTY_BACKLINKS: readonly GlossaryLessonBacklink[] = [];
const EMPTY_TERM_IDS: readonly string[] = [];

/** Trả về danh sách bài giảng (sắp theo tần suất) mà thuật ngữ `termId` xuất hiện. */
export function getBacklinksForTerm(termId: string): readonly GlossaryLessonBacklink[] {
  return GLOSSARY_BACKLINKS.byTerm[termId] ?? EMPTY_BACKLINKS;
}

/** Trả về danh sách ID thuật ngữ xuất hiện trong bài giảng `lessonId` (O(1), 0ms regex). */
export function getBacklinkTermIdsForLesson(lessonId?: string): readonly string[] {
  if (!lessonId) return EMPTY_TERM_IDS;
  return GLOSSARY_BACKLINKS.byLesson[lessonId] ?? EMPTY_TERM_IDS;
}
