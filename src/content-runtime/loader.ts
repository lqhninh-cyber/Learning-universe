import { lessonModules } from 'virtual:content-manifest';
import type { MDXComponents } from 'mdx/types';
import type { ComponentType } from 'react';
import type { LessonMeta } from '@schemas/index';
import { getPedagogyLessonModule } from '@/data/courses/giao-duc-hoc/course';

export interface CompiledLessonModule {
  readonly default: ComponentType<{ components?: MDXComponents }>;
  readonly frontmatter: Record<string, unknown>;
  readonly lessonMeta: LessonMeta;
}

/**
 * Nạp lazy module MDX hoặc bài giảng động của một bài học theo `lesson.id`.
 */
export async function loadLessonModule(lessonId: string): Promise<CompiledLessonModule> {
  const pedagogyMod = getPedagogyLessonModule(lessonId);
  if (pedagogyMod) {
    return pedagogyMod;
  }

  const loader = lessonModules[lessonId];
  if (!loader) {
    throw new Error(`Không tìm thấy module MDX cho bài học có id "${lessonId}"`);
  }
  const mod = (await loader()) as CompiledLessonModule;
  return mod;
}
