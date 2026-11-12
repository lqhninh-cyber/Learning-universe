import type { NumberedBlockName } from './blocks.ts';

/** Khóa bộ lọc phân loại tri thức trong Tìm kiếm toàn cục. */
export type KnowledgeFilterKey = 'all' | 'def' | 'thm' | 'ex' | 'review';

/** Phân loại khối tri thức được đánh chỉ mục từ bài học MDX. */
export type IndexedBlockKind = 'def' | 'thm' | 'ex';

/** Siêu dữ liệu định tuyến cho mỗi bài học có khối tri thức được đánh chỉ mục. */
export interface SearchIndexLessonMeta {
  readonly lessonId: string;
  readonly subjectSlug: string;
  readonly subjectTitle: string;
  readonly chapterSlug: string;
  readonly chapterTitle: string;
  readonly lessonSlug: string;
  readonly lessonTitle: string;
}

/** Một khối tri thức (Định nghĩa / Định lý / Ví dụ) được trích xuất ở build-time. */
export interface SearchIndexBlockEntry {
  /** Mã duy nhất toàn cục: `${lessonId}#${anchorId}`. */
  readonly id: string;
  /** Neo HTML dùng cho deep-link `#anchorId`. */
  readonly anchorId: string;
  /** Nhóm phân loại tìm kiếm (`def` | `thm` | `ex`). */
  readonly filterKind: IndexedBlockKind;
  /** Tên thành phần gốc trong MDX (`Definition`, `Theorem`, `Lemma`, ...). */
  readonly blockKind: NumberedBlockName;
  /** Số hiệu đánh tự động (vd. "1.2.3"), nếu có. */
  readonly number?: string;
  /** Tiêu đề hiển thị rút gọn của khối. */
  readonly title: string;
  /** ID bài học tham chiếu tới bảng `lessons`. */
  readonly lessonId: string;
  /** Đoạn trích sạch đã giữ lại công thức `$...$` và làm gọn văn bản. */
  readonly excerpt: string;
  /** Chuỗi từ khóa bổ sung (như `original`, tên ký hiệu, tên thành phần). */
  readonly keywordsText?: string;
}

/** Chỉ mục tri thức MDX sinh ra qua module ảo `virtual:search-index`. */
export interface VirtualSearchIndex {
  readonly lessons: Readonly<Record<string, SearchIndexLessonMeta>>;
  readonly blocks: readonly SearchIndexBlockEntry[];
}
