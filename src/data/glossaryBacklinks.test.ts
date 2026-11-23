import { describe, expect, it } from 'vitest';
import { getLessonById, getSubjects } from '@/content-runtime';
import { getAllGlossaryEntries } from '@/data/math-glossary';
import {
  getBacklinksForTerm,
  getBacklinkTermIdsForLesson,
  GLOSSARY_BACKLINKS,
} from './glossaryBacklinks';

describe('glossaryBacklinks — Chỉ mục ngược tĩnh Thuật ngữ ↔ Bài giảng', () => {
  it('bao phủ đầy đủ 122 bài giảng và toàn bộ mục thuật ngữ hiện hành', () => {
    const manifestLessonCount = getSubjects().reduce(
      (sum, subject) => sum + subject.chapters.reduce((cSum, ch) => cSum + ch.lessons.length, 0),
      0,
    );
    const allTerms = getAllGlossaryEntries();

    expect(GLOSSARY_BACKLINKS.stats.totalLessons).toBe(manifestLessonCount);
    expect(GLOSSARY_BACKLINKS.stats.totalLessons).toBe(122);
    expect(GLOSSARY_BACKLINKS.stats.totalTerms).toBe(allTerms.length);
    expect(GLOSSARY_BACKLINKS.stats.totalBacklinks).toBeGreaterThan(200);
  });

  it('không chứa bất kỳ lessonId chết, termId mồ côi hay đường dẫn href sai lệch nào', () => {
    const validTermIds = new Set(getAllGlossaryEntries().map((entry) => entry.id));

    for (const [termId, backlinks] of Object.entries(GLOSSARY_BACKLINKS.byTerm)) {
      expect(validTermIds.has(termId)).toBe(true);

      for (const link of backlinks) {
        const loc = getLessonById(link.lessonId);
        expect(loc, `lessonId không tồn tại trong manifest: ${link.lessonId}`).toBeDefined();
        expect(link.count).toBeGreaterThan(0);
        expect(link.href).toBe(
          `/mon-hoc/${loc!.subject.slug}/${loc!.chapter.slug}/${loc!.lesson.slug}`,
        );
        // Khớp hai chiều: lesson đó phải chứa termId trong byLesson
        expect(getBacklinkTermIdsForLesson(link.lessonId)).toContain(termId);
      }
    }

    for (const [lessonId, termIds] of Object.entries(GLOSSARY_BACKLINKS.byLesson)) {
      expect(getLessonById(lessonId), `lessonId chết trong byLesson: ${lessonId}`).toBeDefined();
      for (const termId of termIds) {
        expect(validTermIds.has(termId)).toBe(true);
        expect(getBacklinksForTerm(termId).some((item) => item.lessonId === lessonId)).toBe(true);
      }
    }
  });
});
