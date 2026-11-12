import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Root } from 'mdast';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';
import {
  isNumberedBlockName,
  NUMBERED_BLOCKS,
  type ContentManifest,
  type IndexedBlockKind,
  type NumberedBlockName,
  type SearchIndexBlockEntry,
  type SearchIndexLessonMeta,
  type VirtualSearchIndex,
} from '../schemas/index.ts';
import { remarkTheoremNumbering } from './remark-theorem-numbering.ts';

const MAX_EXCERPT_LENGTH = 340;

const BLOCK_FILTER_MAP: Readonly<Record<NumberedBlockName, IndexedBlockKind>> = {
  Definition: 'def',
  Theorem: 'thm',
  Lemma: 'thm',
  Proposition: 'thm',
  Corollary: 'thm',
  Example: 'ex',
  Counterexample: 'ex',
  Exercise: 'ex',
};

const SKIPPED_CHILD_COMPONENTS = new Set<string>([
  'Cite',
  'Figure',
  'MermaidChart',
  'CayleyTable',
  'MicroAffine3DCanvas',
  'Chapter0KnowledgeMap',
  'Chapter1KnowledgeMap',
  'Chapter3KnowledgeMap',
  'Chapter5KnowledgeMap',
  'Chapter6KnowledgeMap',
  'Chapter7KnowledgeMap',
]);

interface JsxAttributeNode {
  readonly type: 'mdxJsxAttribute' | 'mdxJsxExpressionAttribute';
  readonly name?: string;
  readonly value?: string | { readonly type?: string; readonly value?: string } | null;
}

interface MdxJsxNode {
  readonly type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  readonly name: string | null;
  readonly attributes: readonly JsxAttributeNode[];
  readonly children?: readonly unknown[];
}

interface TextOrMathSegment {
  readonly kind: 'text' | 'math';
  readonly value: string;
}

function asJsxNode(node: unknown): MdxJsxNode | null {
  if (typeof node !== 'object' || node === null) {
    return null;
  }
  const candidate = node as { type?: unknown };
  if (candidate.type === 'mdxJsxFlowElement' || candidate.type === 'mdxJsxTextElement') {
    return node as MdxJsxNode;
  }
  return null;
}

function getJsxStringAttribute(node: MdxJsxNode, attrName: string): string | undefined {
  const attr = node.attributes.find(
    (item) => item.type === 'mdxJsxAttribute' && item.name === attrName,
  );
  if (!attr) {
    return undefined;
  }
  if (typeof attr.value === 'string') {
    return attr.value;
  }
  if (attr.value && typeof attr.value === 'object' && typeof attr.value.value === 'string') {
    const trimmed = attr.value.value.trim();
    const quotedMatch = /^(['"`])([\s\S]*)\1$/.exec(trimmed);
    return quotedMatch ? quotedMatch[2] : trimmed;
  }
  return undefined;
}

function collectTextAndMathSegments(
  nodes: readonly unknown[] | undefined,
  out: TextOrMathSegment[],
): void {
  if (!nodes || nodes.length === 0) {
    return;
  }

  for (const rawNode of nodes) {
    if (typeof rawNode !== 'object' || rawNode === null) {
      continue;
    }

    const jsx = asJsxNode(rawNode);
    if (jsx) {
      const tagName = jsx.name ?? '';
      if (
        SKIPPED_CHILD_COMPONENTS.has(tagName) ||
        tagName.includes('Viz') ||
        tagName.includes('Demo')
      ) {
        continue;
      }
      if (tagName === 'br' || tagName === 'hr') {
        out.push({ kind: 'text', value: ' ' });
        continue;
      }
      collectTextAndMathSegments(jsx.children, out);
      if (jsx.type === 'mdxJsxFlowElement') {
        out.push({ kind: 'text', value: ' ' });
      }
      continue;
    }

    const node = rawNode as {
      readonly type?: string;
      readonly value?: unknown;
      readonly children?: readonly unknown[];
    };

    if (node.type === 'inlineMath' || node.type === 'math') {
      const rawMath = typeof node.value === 'string' ? node.value.replace(/\s+/g, ' ').trim() : '';
      if (rawMath.length > 0) {
        out.push({ kind: 'math', value: `$${rawMath}$` });
      }
      continue;
    }

    if (node.type === 'text' || node.type === 'inlineCode') {
      if (typeof node.value === 'string' && node.value.length > 0) {
        out.push({ kind: 'text', value: node.value });
      }
      continue;
    }

    if (node.type === 'break') {
      out.push({ kind: 'text', value: ' ' });
      continue;
    }

    if (Array.isArray(node.children)) {
      collectTextAndMathSegments(node.children, out);
      if (
        node.type === 'paragraph' ||
        node.type === 'heading' ||
        node.type === 'listItem' ||
        node.type === 'blockquote' ||
        node.type === 'tableRow'
      ) {
        out.push({ kind: 'text', value: ' ' });
      }
    }
  }
}

/**
 * Chuyển các nút MDAST con của khối tri thức thành đoạn trích sạch,
 * giữ nguyên công thức toán `$...$` cân bằng và không cắt đôi biểu thức KaTeX.
 */
export function buildCleanBlockExcerpt(
  children: readonly unknown[] | undefined,
  maxLength: number = MAX_EXCERPT_LENGTH,
): string {
  const rawSegments: TextOrMathSegment[] = [];
  collectTextAndMathSegments(children, rawSegments);

  // Gộp các đoạn text kề nhau và chuẩn hóa khoảng trắng
  const normalized: TextOrMathSegment[] = [];
  for (const seg of rawSegments) {
    if (seg.kind === 'math') {
      const prev = normalized.at(-1);
      if (
        prev &&
        prev.kind === 'text' &&
        prev.value.length > 0 &&
        !/\s$/.test(prev.value) &&
        !/[({"'“‘[]$/.test(prev.value)
      ) {
        normalized[normalized.length - 1] = { kind: 'text', value: `${prev.value} ` };
      }
      normalized.push(seg);
      continue;
    }

    const cleanedText = seg.value.replace(/\s+/g, ' ');
    if (cleanedText.length === 0) {
      continue;
    }
    const prev = normalized.at(-1);
    if (prev && prev.kind === 'text') {
      normalized[normalized.length - 1] = {
        kind: 'text',
        value: `${prev.value}${cleanedText}`.replace(/\s+/g, ' '),
      };
    } else if (
      prev &&
      prev.kind === 'math' &&
      !/^\s/.test(cleanedText) &&
      !/^[.,;:!?)\]}”’']/.test(cleanedText)
    ) {
      normalized.push({ kind: 'text', value: ` ${cleanedText}` });
    } else {
      normalized.push({ kind: 'text', value: cleanedText });
    }
  }

  let result = '';
  let truncated = false;

  for (const seg of normalized) {
    const remaining = maxLength - result.length;
    if (remaining <= 0) {
      truncated = true;
      break;
    }

    if (seg.kind === 'math') {
      if (seg.value.length <= remaining || result.length === 0) {
        result += seg.value;
      } else {
        truncated = true;
        break;
      }
      continue;
    }

    if (seg.value.length <= remaining) {
      result += seg.value;
    } else {
      const slice = seg.value.slice(0, remaining);
      const lastSpace = slice.lastIndexOf(' ');
      result += lastSpace > Math.floor(remaining * 0.45) ? slice.slice(0, lastSpace) : slice;
      truncated = true;
      break;
    }
  }

  const trimmed = result
    .replace(/\s+([.,;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (!trimmed) {
    return '';
  }
  return truncated ? `${trimmed.replace(/[.,;:!?…\s]+$/, '')}…` : trimmed;
}

function formatBlockTitle(
  blockLabel: string,
  number: string | undefined,
  rawTitle: string | undefined,
): string {
  const prefix = number ? `${blockLabel} ${number}` : blockLabel;
  const cleanedTitle = rawTitle?.replace(/\s+/g, ' ').trim();
  if (!cleanedTitle) {
    return prefix;
  }
  if (cleanedTitle.toLowerCase().startsWith(prefix.toLowerCase())) {
    return cleanedTitle;
  }
  return `${prefix}: ${cleanedTitle}`;
}

export interface ExtractContentSearchIndexOptions {
  readonly projectRoot: string;
  readonly manifest: ContentManifest;
}

/**
 * Quét toàn bộ file MDX trong manifest ở thời điểm build/dev để tạo chỉ mục tìm kiếm
 * tới từng khối Definition / Theorem / Lemma / Proposition / Corollary / Example / Exercise.
 */
export function extractContentSearchIndex(
  options: ExtractContentSearchIndexOptions,
): VirtualSearchIndex {
  const { projectRoot, manifest } = options;
  const lessonsMap: Record<string, SearchIndexLessonMeta> = {};
  const blocks: SearchIndexBlockEntry[] = [];

  const mdxParser = unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkMdx);

  const numberingRunner = unified().use(remarkTheoremNumbering);

  for (const subject of manifest.subjects) {
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        const relativePath = lesson.file.replace(/^\//, '');
        const absolutePath = path.join(projectRoot, relativePath);
        if (!existsSync(absolutePath)) {
          continue;
        }

        const source = readFileSync(absolutePath, 'utf8');
        const vfile = new VFile({ path: absolutePath, value: source });

        let tree: Root;
        try {
          tree = mdxParser.parse(vfile);
          numberingRunner.runSync(tree, vfile);
        } catch {
          // Lỗi cú pháp MDX (nếu có) được content:check báo cáo riêng; bỏ qua khi tạo index tìm kiếm
          continue;
        }

        const lessonBlocks: SearchIndexBlockEntry[] = [];

        visit(tree, (rawNode) => {
          const jsx = asJsxNode(rawNode);
          if (!jsx || jsx.type !== 'mdxJsxFlowElement' || !jsx.name) {
            return;
          }
          if (!isNumberedBlockName(jsx.name)) {
            return;
          }

          const spec = NUMBERED_BLOCKS[jsx.name];
          const filterKind = BLOCK_FILTER_MAP[jsx.name];
          const blockKind = jsx.name;
          const number = getJsxStringAttribute(jsx, 'number');
          const anchorId =
            getJsxStringAttribute(jsx, 'anchorId') ??
            getJsxStringAttribute(jsx, 'id') ??
            (number ? `${spec.slug}-${number.replaceAll('.', '-')}` : undefined);

          if (!anchorId) {
            return;
          }

          const rawTitle = getJsxStringAttribute(jsx, 'title');
          const original = getJsxStringAttribute(jsx, 'original');
          const excerpt = buildCleanBlockExcerpt(jsx.children);
          const title = formatBlockTitle(spec.label, number, rawTitle);

          const keywordsParts = [original].filter(
            (part): part is string => typeof part === 'string' && part.trim().length > 0,
          );

          lessonBlocks.push({
            id: `${lesson.id}#${anchorId}`,
            anchorId,
            filterKind,
            blockKind,
            ...(number ? { number } : {}),
            title,
            lessonId: lesson.id,
            excerpt,
            ...(keywordsParts.length > 0 ? { keywordsText: keywordsParts.join(' · ') } : {}),
          });
        });

        if (lessonBlocks.length > 0) {
          lessonsMap[lesson.id] = {
            lessonId: lesson.id,
            subjectSlug: subject.slug,
            subjectTitle: subject.title,
            chapterSlug: chapter.slug,
            chapterTitle: chapter.title,
            lessonSlug: lesson.slug,
            lessonTitle: lesson.title,
          };
          blocks.push(...lessonBlocks);
        }
      }
    }
  }

  return {
    lessons: lessonsMap,
    blocks,
  };
}
