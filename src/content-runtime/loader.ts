import { lessonModules } from 'virtual:content-manifest';
import type { MDXComponents } from 'mdx/types';
import type { ComponentType } from 'react';
import type { LessonMeta } from '@schemas/index';

export interface CompiledLessonModule {
  readonly default: ComponentType<{ components?: MDXComponents }>;
  readonly frontmatter: Record<string, unknown>;
  readonly lessonMeta: LessonMeta;
}

/**
 * Nạp lazy module MDX đã biên dịch của một bài học theo `lesson.id`.
 */
export async function loadLessonModule(lessonId: string): Promise<CompiledLessonModule> {
  const loader = lessonModules[lessonId];
  if (!loader) {
    throw new Error(`Không tìm thấy module MDX cho bài học có id "${lessonId}"`);
  }
  const mod = (await loader()) as CompiledLessonModule;
  return mod;
}
