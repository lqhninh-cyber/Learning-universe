import { z } from 'zod';
import { slugSchema, textSchema } from './common.ts';

export const subjectStatusSchema = z.enum(['draft', 'published']);

export const subjectSchema = z.strictObject({
  id: slugSchema,
  title: textSchema,
  shortTitle: textSchema,
  description: textSchema,
  order: z.number().int().positive(),
  status: subjectStatusSchema,
  theme: z.strictObject({
    hue: z.number().min(0).max(360),
    icon: textSchema.optional(),
  }),
  sources: z
    .strictObject({
      primary: slugSchema.nullable(),
      references: z.array(slugSchema),
    })
    .default({ primary: null, references: [] }),
});

export type Subject = z.infer<typeof subjectSchema>;
