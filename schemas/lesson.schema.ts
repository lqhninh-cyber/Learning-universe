import { z } from 'zod';
import {
  isoDateSchema,
  pagesSchema,
  semverSchema,
  slugSchema,
  sourceTextSchema,
  textSchema,
} from './common.ts';

export const lessonStatusSchema = z.enum(['draft', 'review', 'approved', 'published']);
export const lessonLevelSchema = z.enum(['basic', 'intermediate', 'advanced']);

export const lessonSourceRefSchema = z.strictObject({
  source: slugSchema,
  pages: pagesSchema.optional(),
  sections: sourceTextSchema.optional(),
  note: sourceTextSchema.optional(),
});

export const lessonSchema = z
  .strictObject({
    id: slugSchema,
    /** Ghi đè số bài lấy từ tiền tố tên file (tùy chọn). */
    number: z.number().int().positive().optional(),
    title: textSchema,
    description: textSchema,
    estimatedMinutes: z.number().int().positive(),
    level: lessonLevelSchema,
    prerequisites: z.array(slugSchema).default([]),
    tags: z.array(textSchema).default([]),
    sources: z.array(lessonSourceRefSchema).default([]),
    status: lessonStatusSchema,
    version: semverSchema,
    /** Các id cũ của bài này, để không mất tiến độ khi đổi id. */
    aliases: z.array(slugSchema).default([]),
    authoring: z
      .strictObject({
        aiAssisted: z.boolean(),
        tools: z.array(textSchema).default([]),
        draftedAt: isoDateSchema.optional(),
      })
      .optional(),
    review: z
      .strictObject({
        reviewer: textSchema.nullable(),
        reviewedAt: isoDateSchema.nullable(),
        notes: z.string().optional(),
      })
      .optional(),
  })
  .superRefine((lesson, ctx) => {
    if (lesson.status !== 'draft' && lesson.sources.length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['sources'],
        message: 'Bài ở trạng thái review trở lên phải có ít nhất một nguồn tham khảo',
      });
    }
  });

export type LessonFrontmatter = z.infer<typeof lessonSchema>;
export type LessonStatus = z.infer<typeof lessonStatusSchema>;
export type LessonSourceRef = z.infer<typeof lessonSourceRefSchema>;
