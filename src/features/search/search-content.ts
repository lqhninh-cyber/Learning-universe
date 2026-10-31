import type { ManifestChapter, ManifestLesson, ManifestSubject } from '@schemas/index';
import { getSubjects } from '@/content-runtime';
import { ROUTES } from '@/shared/config/routes';
import { matchesVietnameseQuery, normalizeVietnamese } from '@/shared/lib/vietnamese';

export interface SearchSubjectResult {
  readonly kind: 'subject';
  readonly subject: ManifestSubject;
  readonly href: string;
}

export interface SearchLessonResult {
  readonly kind: 'lesson';
  readonly subject: ManifestSubject;
  readonly chapter: ManifestChapter;
  readonly lesson: ManifestLesson;
  readonly href: string;
}

export type SearchResultItem = SearchSubjectResult | SearchLessonResult;

/**
 * Tìm kiếm tức thời các môn học, chương và bài học theo từ khóa (hỗ trợ cả có dấu và không dấu).
 */
export function searchContent(query: string, limit = 10): readonly SearchResultItem[] {
  const normalized = normalizeVietnamese(query);
  if (!normalized) {
    return [];
  }

  const subjects = getSubjects();
  const subjectResults: SearchSubjectResult[] = [];
  const lessonResults: Array<{ item: SearchLessonResult; score: number }> = [];

  for (const subject of subjects) {
    const subjectText = `${subject.title} ${subject.shortTitle} ${subject.description} ${subject.slug}`;
    if (matchesVietnameseQuery(subjectText, query)) {
      subjectResults.push({
        kind: 'subject',
        subject,
        href: ROUTES.subjectOverview(subject.slug),
      });
    }

    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        const searchable = [
          lesson.title,
          lesson.description,
          lesson.tags.join(' '),
          chapter.title,
          subject.title,
          lesson.slug,
        ].join(' ');

        if (matchesVietnameseQuery(searchable, query)) {
          const titleMatch = normalizeVietnamese(lesson.title).includes(normalized) ? 2 : 0;
          const tagMatch = lesson.tags.some((tag) => normalizeVietnamese(tag).includes(normalized))
            ? 1
            : 0;

          lessonResults.push({
            score: titleMatch + tagMatch,
            item: {
              kind: 'lesson',
              subject,
              chapter,
              lesson,
              href: ROUTES.lesson(subject.slug, chapter.slug, lesson.slug),
            },
          });
        }
      }
    }
  }

  lessonResults.sort((a, b) => b.score - a.score);

  return [...subjectResults, ...lessonResults.map((entry) => entry.item)].slice(0, limit);
}
