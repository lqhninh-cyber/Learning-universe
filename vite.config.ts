import { readFileSync } from 'node:fs';
import path from 'node:path';
import mdx from '@mdx-js/rollup';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import { defineConfig } from 'vitest/config';
import { remarkMathSanitizePost, remarkMathSanitizePre } from './build/remark-math-sanitize.ts';
import { remarkTheoremNumbering } from './build/remark-theorem-numbering.ts';
import { contentPlugin } from './build/vite-plugin-content.ts';

const rootDir = import.meta.dirname;

/** Macro LaTeX dùng chung cho toàn bộ nội dung (xem content/_shared/katex-macros.json). */
const katexMacros = JSON.parse(
  readFileSync(path.resolve(rootDir, 'content/_shared/katex-macros.json'), 'utf8'),
) as Record<string, string>;

export default defineConfig({
  plugins: [
    contentPlugin({ contentDir: 'content' }),
    {
      enforce: 'pre',
      ...mdx({
        include: ['**/*.mdx'],
        remarkPlugins: [
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
          remarkGfm,
          remarkMathSanitizePre,
          remarkMath,
          remarkMathSanitizePost,
          remarkTheoremNumbering,
        ],
        rehypePlugins: [
          [
            rehypeKatex,
            {
              macros: katexMacros,
              output: 'htmlAndMathml',
              strict: 'ignore',
              throwOnError: true,
            },
          ],
          rehypeSlug,
        ],
      }),
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@schemas': path.resolve(rootDir, './schemas'),
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'vendor-react',
              test: /node_modules[\\/](react|react-dom|react-router|scheduler)[\\/]/,
            },
            {
              name: 'vendor-supabase',
              test: /node_modules[\\/]@supabase[\\/]/,
            },
            {
              name: 'vendor-ui',
              test: /node_modules[\\/](motion|framer-motion|@radix-ui|lucide-react)[\\/]/,
            },
            {
              name: 'vendor-mafs',
              test: /node_modules[\\/](mafs|@use-gesture|use-resize-observer)[\\/]/,
            },
            {
              name: 'vendor-mermaid',
              test: /node_modules[\\/]mermaid[\\/]/,
            },
          ],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'build/**/*.test.ts', 'schemas/**/*.test.ts'],
    css: false,
    testTimeout: 15000,
  },
});
