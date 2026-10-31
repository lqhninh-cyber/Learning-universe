import type { BibliographyEntry } from './bibliography.schema.ts';
import type { Chapter } from './chapter.schema.ts';
import type { LessonFrontmatter } from './lesson.schema.ts';
import type { Subject } from './subject.schema.ts';

/** Bài học trong manifest: metadata frontmatter + thông tin vị trí (không kèm thân bài MDX). */
export interface ManifestLesson extends LessonFrontmatter {
  /** Slug URL, lấy từ tên file bỏ tiền tố số. */
  readonly slug: string;
  /** Số bài (từ `number` trong frontmatter hoặc tiền tố tên file). */
  readonly number: number;
  /** Đường dẫn file MDX tính từ gốc dự án, bắt đầu bằng "/". */
  readonly file: string;
}

export interface ManifestChapter extends Omit<Chapter, 'number'> {
  readonly slug: string;
  readonly number: number;
  readonly lessons: readonly ManifestLesson[];
}

export interface ManifestSubject extends Subject {
  /** Slug URL, chính là tên thư mục của môn. */
  readonly slug: string;
  readonly chapters: readonly ManifestChapter[];
}

export interface ContentManifest {
  readonly bibliography: readonly BibliographyEntry[];
  readonly subjects: readonly ManifestSubject[];
}
