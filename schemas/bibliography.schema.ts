import { z } from 'zod';
import { slugSchema, sourceTextSchema, textSchema } from './common.ts';

export const sourceTypeSchema = z.enum([
  'textbook',
  'reference-book',
  'lecture-notes',
  'article',
  'other',
]);

export const bibliographyEntrySchema = z.strictObject({
  id: slugSchema,
  type: sourceTypeSchema,
  title: sourceTextSchema,
  authors: z.array(sourceTextSchema).min(1, 'Cần ít nhất một tác giả'),
  year: z.number().int().min(1000).max(2100),
  publisher: sourceTextSchema,
  edition: sourceTextSchema.optional(),
  isbn: sourceTextSchema.optional(),
  language: textSchema.optional(),
  numberingNote: textSchema.optional(),
  note: textSchema.optional(),
});

export const bibliographySchema = z
  .strictObject({
    sources: z.array(bibliographyEntrySchema),
  })
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    value.sources.forEach((entry, index) => {
      if (seen.has(entry.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['sources', index, 'id'],
          message: `Mã tài liệu "${entry.id}" bị trùng`,
        });
      }
      seen.add(entry.id);
    });
  });

export type BibliographyEntry = z.infer<typeof bibliographyEntrySchema>;
export type Bibliography = z.infer<typeof bibliographySchema>;
