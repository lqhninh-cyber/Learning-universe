/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Module ảo do build/vite-plugin-content.ts sinh ra từ thư mục content/. */
declare module 'virtual:content-manifest' {
  export const manifest: import('@schemas/manifest').ContentManifest;
  /** Bộ nạp lazy thân bài MDX theo `id` bài học (chỉ gồm các bài có trong manifest). */
  export const lessonModules: Readonly<Record<string, () => Promise<unknown>>>;
}

/** Mỗi file MDX trong content/ là một bài học. */
declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { MDXComponents } from 'mdx/types';
  import type { LessonMeta } from '@schemas/blocks';

  export const frontmatter: Record<string, unknown>;
  export const lessonMeta: LessonMeta;
  const Content: ComponentType<{ components?: MDXComponents }>;
  export default Content;
}
