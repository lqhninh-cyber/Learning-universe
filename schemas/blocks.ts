/**
 * Danh mục các khối nội dung được đánh số tự động theo quy tắc Chương.Bài.Số (D3, D9).
 *
 * Ba bộ đếm độc lập trong mỗi bài:
 * - `theory`: Định nghĩa, Định lý, Bổ đề, Mệnh đề, Hệ quả (đếm chung)
 * - `example`: Ví dụ, Phản ví dụ (đếm riêng)
 * - `exercise`: Bài tập (đếm riêng)
 */
export type CounterName = 'theory' | 'example' | 'exercise';

export interface NumberedBlockSpec {
  readonly counter: CounterName;
  /** Nhãn tiếng Việt hiển thị, ví dụ "Định lý". */
  readonly label: string;
  /** Tiền tố của anchor sinh tự động, ví dụ "dinh-ly" cho "dinh-ly-1-1-2". */
  readonly slug: string;
}

export const NUMBERED_BLOCKS = {
  Definition: { counter: 'theory', label: 'Định nghĩa', slug: 'dinh-nghia' },
  Theorem: { counter: 'theory', label: 'Định lý', slug: 'dinh-ly' },
  Lemma: { counter: 'theory', label: 'Bổ đề', slug: 'bo-de' },
  Proposition: { counter: 'theory', label: 'Mệnh đề', slug: 'menh-de' },
  Corollary: { counter: 'theory', label: 'Hệ quả', slug: 'he-qua' },
  Example: { counter: 'example', label: 'Ví dụ', slug: 'vi-du' },
  Counterexample: { counter: 'example', label: 'Phản ví dụ', slug: 'phan-vi-du' },
  Exercise: { counter: 'exercise', label: 'Bài tập', slug: 'bai-tap' },
} as const satisfies Record<string, NumberedBlockSpec>;

export type NumberedBlockName = keyof typeof NUMBERED_BLOCKS;

export function isNumberedBlockName(name: string): name is NumberedBlockName {
  return Object.hasOwn(NUMBERED_BLOCKS, name);
}

/** Thông tin một khối đã được đánh số, do remark plugin xuất ra cho từng bài. */
export interface LessonBlockInfo {
  readonly name: NumberedBlockName;
  /** `id` do tác giả khai báo (dùng để tham chiếu), nếu có. */
  readonly id: string | null;
  /** Anchor DOM của khối: `id` của tác giả hoặc anchor sinh tự động. */
  readonly anchorId: string;
  /** Số hiệu dạng Chương.Bài.Số, ví dụ "1.1.2". */
  readonly number: string;
  /** Nhãn đầy đủ, ví dụ "Định lý 1.1.2". */
  readonly label: string;
  readonly title: string | null;
  /** Số hiệu gốc trong giáo trình tham khảo (nếu có), ví dụ "Định lý 3.2". */
  readonly original?: string | null;
  /** Mã nguồn tham khảo trong bibliography.yaml (nếu có). */
  readonly source?: string | null;
  /** Trang tham khảo trong giáo trình gốc (nếu có). */
  readonly page?: string | null;
}

/** Thông tin một tiêu đề mục (h2, h3) trong bài học để dựng Mục lục (TOC). */
export interface LessonHeadingInfo {
  readonly id: string;
  readonly text: string;
  readonly depth: 2 | 3;
}

/** Metadata biên dịch của một bài, export từ mỗi file MDX dưới tên `lessonMeta`. */
export interface LessonMeta {
  readonly chapterNumber: number;
  readonly lessonNumber: number;
  readonly headings: readonly LessonHeadingInfo[];
  readonly blocks: readonly LessonBlockInfo[];
}
