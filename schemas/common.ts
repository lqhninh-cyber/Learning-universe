import { z } from 'zod';

/** Slug / id: chỉ gồm chữ thường không dấu, số và gạch ngang (quyết định D8). */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Dấu hiệu của giá trị chỗ trống chưa được điền thật: `<…>`, `TODO`, `???`. */
export const PLACEHOLDER_PATTERN = /<[^<>\n]*>|\bTODO\b|\?\?\?/i;

export const slugSchema = z
  .string()
  .regex(SLUG_PATTERN, 'Chỉ gồm chữ thường không dấu, số và gạch ngang (kebab-case)');

/** Văn bản thông thường, không được rỗng. */
export const textSchema = z.string().trim().min(1, 'Không được để trống');

/**
 * Văn bản thuộc metadata nguồn tham khảo: ngoài việc không rỗng còn phải là giá trị thật,
 * không được còn là chỗ trống (quy tắc `academic-integrity`).
 */
export const sourceTextSchema = textSchema.refine(
  (value) => !PLACEHOLDER_PATTERN.test(value),
  'Còn là giá trị chỗ trống (<…>, TODO, ???); chỉ điền thông tin do chủ dự án cung cấp',
);

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày phải theo dạng YYYY-MM-DD');

export const semverSchema = z.string().regex(/^\d+\.\d+\.\d+$/, 'Phiên bản phải theo dạng x.y.z');

/** Số trang: `"25"`, `"25-31"`, `"25, 40-42"`. */
export const pagesSchema = z
  .string()
  .regex(
    /^\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*$/,
    'Số trang phải theo dạng "25", "25-31" hoặc "25, 40-42"',
  );
