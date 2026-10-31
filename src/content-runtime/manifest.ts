import { manifest } from 'virtual:content-manifest';
import type {
  BibliographyEntry,
  ContentManifest,
  ManifestChapter,
  ManifestLesson,
  ManifestSubject,
} from '@schemas/index';

export interface LessonLocation {
  readonly subject: ManifestSubject;
  readonly chapter: ManifestChapter;
  readonly lesson: ManifestLesson;
}

/** Trả về toàn bộ manifest nội dung hiện tại. */
export function getManifest(): ContentManifest {
  return manifest;
}

/** Danh sách các môn học có trong manifest (đã sắp theo `order`). */
export function getSubjects(): readonly ManifestSubject[] {
  return manifest.subjects;
}

/** Tìm môn học theo `slug` (hoặc `id`). */
export function getSubjectBySlug(subjectSlug: string): ManifestSubject | undefined {
  return manifest.subjects.find(
    (subject) => subject.slug === subjectSlug || subject.id === subjectSlug,
  );
}

/** Tìm bài học theo bộ ba slug trên URL: `/mon-hoc/:subjectSlug/:chapterSlug/:lessonSlug`. */
export function getLessonBySlug(
  subjectSlug: string,
  chapterSlug: string,
  lessonSlug: string,
): LessonLocation | undefined {
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) {
    return undefined;
  }

  const chapter = subject.chapters.find(
    (item) => item.slug === chapterSlug || item.id === chapterSlug,
  );
  if (!chapter) {
    return undefined;
  }

  const lesson = chapter.lessons.find((item) => item.slug === lessonSlug || item.id === lessonSlug);
  if (!lesson) {
    return undefined;
  }

  return { subject, chapter, lesson };
}

/** Tìm bài học theo `id` hoặc `aliases` trên toàn hệ thống. */
export function getLessonById(lessonId: string): LessonLocation | undefined {
  for (const subject of manifest.subjects) {
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        if (lesson.id === lessonId || lesson.aliases.includes(lessonId)) {
          return { subject, chapter, lesson };
        }
      }
    }
  }
  return undefined;
}

/** Tra cứu mục tài liệu tham khảo trong `bibliography.yaml` theo `id`. */
export function getBibliographyEntry(sourceId: string): BibliographyEntry | undefined {
  return manifest.bibliography.find((entry) => entry.id === sourceId);
}
