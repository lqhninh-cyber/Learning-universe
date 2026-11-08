import { contentDiagnostics, manifest } from 'virtual:content-manifest';
import type {
  BibliographyEntry,
  ContentDiagnostics,
  ContentManifest,
  ManifestChapter,
  ManifestLesson,
  ManifestSubject,
} from '@schemas/index';
import { GIAO_DUC_HOC_SUBJECT } from '@/data/courses/giao-duc-hoc/course';

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

const ALL_SUBJECTS: readonly ManifestSubject[] = [...manifest.subjects, GIAO_DUC_HOC_SUBJECT];

const COMBINED_MANIFEST: ContentManifest = {
  ...manifest,
  subjects: ALL_SUBJECTS,
};

/** Trả về toàn bộ manifest nội dung hiện tại. */
export function getManifest(): ContentManifest {
  return COMBINED_MANIFEST;
}

/** Danh sách các môn học có trong manifest (đã sắp theo `order`). */
export function getSubjects(): readonly ManifestSubject[] {
  return ALL_SUBJECTS;
}

/** Tìm môn học theo `slug` (ví dụ `cau-truc-dai-so`) hoặc `id` (`algebraic-structures`). */
export function getSubjectBySlug(subjectSlug: string): ManifestSubject | undefined {
  return ALL_SUBJECTS.find((subject) => subject.slug === subjectSlug || subject.id === subjectSlug);
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
    (item) =>
      item.slug === chapterSlug ||
      item.id === chapterSlug ||
      (item.number === 1 &&
        (chapterSlug === 'chuong-1' ||
          chapterSlug === 'hoat-dong-su-pham-va-nguoi-giao-vien-pho-thong')) ||
      (item.number === 2 &&
        (chapterSlug === 'chuong-2' ||
          chapterSlug === 'ban-chat-giao-duc-vai-tro-cua-giao-duc-va-giao-duc-hoc')) ||
      (item.number === 3 &&
        (chapterSlug === 'chuong-3' ||
          chapterSlug === 'nhung-van-de-chung-ve-hoat-dong-giao-duc-o-truong-pho-thong')) ||
      (item.number === 4 &&
        (chapterSlug === 'chuong-4' ||
          chapterSlug === 'cong-tac-cua-nguoi-giao-vien-chu-nhiem-lop')) ||
      (item.number === 5 &&
        (chapterSlug === 'chuong-5' ||
          chapterSlug === 'to-chuc-hoat-dong-trai-nghiem-o-truong-pho-thong')) ||
      (item.number === 6 &&
        (chapterSlug === 'chuong-6' ||
          chapterSlug === 'chuyen-de-6' ||
          chapterSlug === 'khoi-thuc-hanh' ||
          chapterSlug === 'thuc-hanh-nghiep-vu-su-pham' ||
          chapterSlug === 'cam-nang-xu-ly-tinh-huong-su-pham-va-de-cuong-on-tap' ||
          chapterSlug === '6')),
  );
  if (!chapter) {
    return undefined;
  }

  const lesson = chapter.lessons.find(
    (item) =>
      item.slug === lessonSlug ||
      item.id === lessonSlug ||
      item.aliases?.includes(lessonSlug) ||
      (item.number === 1 &&
        (lessonSlug === '6-1' ||
          lessonSlug === 'bai-6-1' ||
          lessonSlug === 'c6-b1' ||
          lessonSlug === 'thuc-hanh-1' ||
          lessonSlug === 'bai-1' ||
          lessonSlug === '1')) ||
      (item.number === 2 &&
        (lessonSlug === '6-2' ||
          lessonSlug === 'bai-6-2' ||
          lessonSlug === 'c6-b2' ||
          lessonSlug === 'thuc-hanh-2' ||
          lessonSlug === 'bai-2' ||
          lessonSlug === '2')) ||
      (item.number === 3 &&
        (lessonSlug === '6-3' ||
          lessonSlug === 'bai-6-3' ||
          lessonSlug === 'c6-b3' ||
          lessonSlug === 'thuc-hanh-3' ||
          lessonSlug === 'bai-3' ||
          lessonSlug === '3')),
  );
  if (!lesson) {
    return undefined;
  }

  return { subject, chapter, lesson };
}

/** Tìm bài học theo `id` hoặc `aliases` trên toàn hệ thống. */
export function getLessonById(lessonId: string): LessonLocation | undefined {
  for (const subject of ALL_SUBJECTS) {
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
  for (const subject of ALL_SUBJECTS) {
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

  for (const subject of ALL_SUBJECTS) {
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
      const safeLessonMinutes =
        typeof lesson.estimatedMinutes === 'number' && Number.isFinite(lesson.estimatedMinutes)
          ? Math.max(0, Math.abs(lesson.estimatedMinutes))
          : 0;
      totalMinutes += safeLessonMinutes;
      for (const tag of lesson.tags) {
        tagSet.add(tag);
      }
      if (!firstLesson) {
        firstLesson = { subject, chapter, lesson };
      }
    }
  }

  const rawMinutes = subject.curriculum?.totalMinutes ?? totalMinutes;
  const safeTotalMinutes =
    typeof rawMinutes === 'number' && Number.isFinite(rawMinutes)
      ? Math.max(0, Math.abs(rawMinutes))
      : 0;

  return {
    chapterCount: subject.curriculum?.chapterCount ?? subject.chapters.length,
    lessonCount: subject.curriculum?.lessonCount ?? lessonCount,
    totalMinutes: safeTotalMinutes,
    tags: [...tagSet],
    firstLesson,
  };
}

/** Tra cứu mục tài liệu tham khảo trong `bibliography.yaml` theo `id`. */
export function getBibliographyEntry(sourceId: string): BibliographyEntry | undefined {
  return manifest.bibliography.find((entry) => entry.id === sourceId);
}

/** Trả về dữ liệu chẩn đoán kỹ thuật của kho nội dung (dùng cho `/dev/preview`). */
export function getContentDiagnostics(): ContentDiagnostics {
  return contentDiagnostics;
}
