import { z } from 'zod';
import { slugSchema, textSchema } from './common.ts';

export const chapterSchema = z.strictObject({
  id: slugSchema,
  /** Ghi đè số chương lấy từ tiền tố thư mục (tùy chọn). */
  number: z.number().int().positive().optional(),
  title: textSchema,
  description: textSchema,
  objectives: z.array(textSchema).default([]),
});

export type Chapter = z.infer<typeof chapterSchema>;
