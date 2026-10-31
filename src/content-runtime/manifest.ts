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

export interface AdjacentLessons {
  readonly previous: LessonLocation | null;
  readonly next: LessonLocation | null;
}

export interface SubjectStats {
  readonly chapterCount: number;
  readonly lessonCount: number;
  readonly totalMinutes: number;
  readonly tags: readonly string[];
  readonly firstLesson: LessonLocation | null;
}

/** Trả về toàn bộ manifest nội dung hiện tại. */
export function getManifest(): ContentManifest {
  return manifest;
}

/** Danh sách các môn học có trong manifest (đã sắp theo `order`). */
export function getSubjects(): readonly ManifestSubject[] {
  return manifest.subjects;
}

/** Tìm môn học theo `slug` (ví dụ `cau-truc-dai-so`) hoặc `id` (`algebraic-structures`). */
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

/**
 * Phân giải đường dẫn rút gọn `/bai-hoc/:slugOrId`:
 * 1. Khớp `lesson.slug`, `lesson.id` hoặc `lesson.aliases`.
 * 2. Nếu không, khớp `chapter.slug` hoặc `chapter.id` (ví dụ `/bai-hoc/nhom`) và trả về bài đầu tiên của chương.
 */
export function resolveLessonShortcut(slugOrId: string): LessonLocation | undefined {
  for (const subject of manifest.subjects) {
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        if (
          lesson.slug === slugOrId ||
          lesson.id === slugOrId ||
          lesson.aliases.includes(slugOrId)
        ) {
          return { subject, chapter, lesson };
        }
      }
    }
  }

  for (const subject of manifest.subjects) {
    for (const chapter of subject.chapters) {
      if (chapter.slug === slugOrId || chapter.id === slugOrId) {
        const firstLesson = chapter.lessons[0];
        if (firstLesson) {
          return { subject, chapter, lesson: firstLesson };
        }
      }
    }
  }

  return undefined;
}

/** Lấy danh sách phẳng toàn bộ bài học của một môn theo đúng thứ tự Chương → Bài. */
export function getSubjectLessons(subjectSlug: string): readonly LessonLocation[] {
  const subject = getSubjectBySlug(subjectSlug);
  if (!subject) {
    return [];
  }

  const list: LessonLocation[] = [];
  for (const chapter of subject.chapters) {
    for (const lesson of chapter.lessons) {
      list.push({ subject, chapter, lesson });
    }
  }
  return list;
}

/** Tìm bài học liền trước và liền sau của một bài trong cùng môn học. */
export function getAdjacentLessons(subjectSlug: string, lessonId: string): AdjacentLessons {
  const list = getSubjectLessons(subjectSlug);
  const index = list.findIndex((item) => item.lesson.id === lessonId);
  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: index > 0 ? (list[index - 1] ?? null) : null,
    next: index < list.length - 1 ? (list[index + 1] ?? null) : null,
  };
}

/** Thống kê tổng hợp cho một môn học (số chương, số bài, tổng thời lượng, danh sách tags). */
export function getSubjectStats(subject: ManifestSubject): SubjectStats {
  let lessonCount = 0;
  let totalMinutes = 0;
  const tagSet = new Set<string>();
  let firstLesson: LessonLocation | null = null;

  for (const chapter of subject.chapters) {
    for (const lesson of chapter.lessons) {
      lessonCount += 1;
      totalMinutes += lesson.estimatedMinutes;
      for (const tag of lesson.tags) {
        tagSet.add(tag);
      }
      if (!firstLesson) {
        firstLesson = { subject, chapter, lesson };
      }
    }
  }

  return {
    chapterCount: subject.chapters.length,
    lessonCount,
    totalMinutes,
    tags: [...tagSet],
    firstLesson,
  };
}

/** Tra cứu mục tài liệu tham khảo trong `bibliography.yaml` theo `id`. */
export function getBibliographyEntry(sourceId: string): BibliographyEntry | undefined {
  return manifest.bibliography.find((entry) => entry.id === sourceId);
}
