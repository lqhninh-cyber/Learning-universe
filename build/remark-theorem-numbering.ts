import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import type { Program } from 'estree';
import { valueToEstree } from 'estree-util-value-to-estree';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';
import type { Position } from 'unist';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';
import { parse as parseYaml } from 'yaml';
import {
  isNumberedBlockName,
  NUMBERED_BLOCKS,
  type CounterName,
  type LessonBlockInfo,
  type LessonHeadingInfo,
  type LessonMeta,
} from '../schemas/blocks.ts';
import { parsePrefixedName } from './content-paths.ts';

function slugifyHeading(text: string): string {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'muc';
}

function extractNodeText(node: unknown): string {
  if (typeof node !== 'object' || node === null) {
    return '';
  }
  const typed = node as { type?: string; value?: unknown; children?: unknown[] };
  if (typeof typed.value === 'string') {
    return typed.value;
  }
  if (Array.isArray(typed.children)) {
    return typed.children.map(extractNodeText).join('');
  }
  return '';
}

interface JsxAttribute {
  type: 'mdxJsxAttribute' | 'mdxJsxExpressionAttribute';
  name?: string;
  value?: string | { type: string; value: string } | null;
}

interface JsxElement {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name: string | null;
  attributes: JsxAttribute[];
  position?: Position;
}

const ID_PATTERN = /^[a-z][a-z0-9-]*$/;

function asJsxElement(node: { type: string }): JsxElement | null {
  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    return node as unknown as JsxElement;
  }
  return null;
}

function getStringAttribute(element: JsxElement, name: string): string | undefined {
  const attribute = element.attributes.find(
    (item) => item.type === 'mdxJsxAttribute' && item.name === name,
  );
  return typeof attribute?.value === 'string' ? attribute.value : undefined;
}

function hasAttribute(element: JsxElement, name: string): boolean {
  return element.attributes.some((item) => item.type === 'mdxJsxAttribute' && item.name === name);
}

function setStringAttribute(element: JsxElement, name: string, value: string): void {
  const existing = element.attributes.find(
    (item) => item.type === 'mdxJsxAttribute' && item.name === name,
  );
  if (existing) {
    existing.value = value;
    return;
  }
  element.attributes.push({ type: 'mdxJsxAttribute', name, value });
}

function readPositiveInt(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : null;
}

function readFrontmatterNumber(tree: Root): number | null {
  const node = tree.children.find((child) => child.type === 'yaml') as
    { value?: string } | undefined;
  if (!node?.value) {
    return null;
  }
  const data: unknown = parseYaml(node.value);
  if (typeof data === 'object' && data !== null && 'number' in data) {
    return readPositiveInt((data as { number: unknown }).number);
  }
  return null;
}

function readChapterYamlNumber(chapterDir: string): number | null {
  const chapterFile = path.join(chapterDir, 'chapter.yaml');
  if (!existsSync(chapterFile)) {
    return null;
  }
  const data: unknown = parseYaml(readFileSync(chapterFile, 'utf8'));
  if (typeof data === 'object' && data !== null && 'number' in data) {
    return readPositiveInt((data as { number: unknown }).number);
  }
  return null;
}

function resolveNumbers(file: VFile, tree: Root): { chapter: number; lesson: number } {
  const filePath = file.path;
  if (!filePath) {
    return file.fail('Không xác định được đường dẫn file để đánh số Chương.Bài.Số');
  }

  const chapterDir = path.dirname(filePath);
  const lessonNumber =
    readFrontmatterNumber(tree) ?? parsePrefixedName(path.basename(filePath)).order;
  const chapterNumber =
    readChapterYamlNumber(chapterDir) ?? parsePrefixedName(path.basename(chapterDir)).order;

  if (lessonNumber === null) {
    return file.fail(
      'Tên file bài học phải có tiền tố số (ví dụ 01-ten-bai.mdx) hoặc khai báo `number` trong frontmatter',
    );
  }
  if (chapterNumber === null) {
    return file.fail(
      'Tên thư mục chương phải có tiền tố số (ví dụ 01-ten-chuong) hoặc khai báo `number` trong chapter.yaml',
    );
  }
  return { chapter: chapterNumber, lesson: lessonNumber };
}

function buildExportProgram(meta: LessonMeta): Program {
  return {
    type: 'Program',
    sourceType: 'module',
    body: [
      {
        type: 'ExportNamedDeclaration',
        specifiers: [],
        source: null,
        attributes: [],
        declaration: {
          type: 'VariableDeclaration',
          kind: 'const',
          declarations: [
            {
              type: 'VariableDeclarator',
              id: { type: 'Identifier', name: 'lessonMeta' },
              init: valueToEstree(meta),
            },
          ],
        },
      },
    ],
  };
}

/**
 * Remark plugin đánh số tự động theo quy tắc Chương.Bài.Số (quyết định D3, D9).
 *
 * - Gán thuộc tính `number` và `anchorId` cho các khối được đánh số.
 * - Phân giải `<Ref to>` và `<Proof of>` thành nhãn đầy đủ (ví dụ "Định lý 1.1.2").
 * - Xuất `lessonMeta` (danh sách khối đã đánh số) từ mỗi file MDX.
 *
 * Tác giả không gõ số bằng tay: khai báo `number` thủ công sẽ gây lỗi.
 */
export const remarkTheoremNumbering: Plugin<[], Root> = () => (tree, file) => {
  const numbers = resolveNumbers(file, tree);
  const counters: Record<CounterName, number> = { theory: 0, example: 0, exercise: 0 };
  const headings: LessonHeadingInfo[] = [];
  const blocks: LessonBlockInfo[] = [];
  const byId = new Map<string, LessonBlockInfo>();
  const usedAnchors = new Set<string>();

  // Lượt 1: trích xuất headings (h2, h3) và đánh số các khối.
  visit(tree, (node) => {
    if (node.type === 'heading' && (node.depth === 2 || node.depth === 3)) {
      const text = extractNodeText(node).trim();
      if (text) {
        const baseSlug = slugifyHeading(text);
        let id = baseSlug;
        let suffix = 2;
        while (usedAnchors.has(id)) {
          id = `${baseSlug}-${suffix}`;
          suffix += 1;
        }
        usedAnchors.add(id);

        const data = (node.data ??= {}) as { hProperties?: Record<string, unknown> };
        data.hProperties = { ...(data.hProperties ?? {}), id };
        headings.push({ id, text, depth: node.depth });
      }
      return;
    }

    const element = asJsxElement(node);
    if (!element?.name || !isNumberedBlockName(element.name)) {
      return;
    }

    const name = element.name;
    const spec = NUMBERED_BLOCKS[name];

    if (hasAttribute(element, 'number') || hasAttribute(element, 'anchorId')) {
      file.fail(
        `<${name}> không được khai báo thủ công "number"/"anchorId"; số hiệu được đánh tự động theo Chương.Bài.Số`,
        element,
      );
    }

    counters[spec.counter] += 1;
    const number = `${numbers.chapter}.${numbers.lesson}.${counters[spec.counter]}`;
    const id = getStringAttribute(element, 'id') ?? null;

    if (id !== null && !ID_PATTERN.test(id)) {
      file.fail(
        `<${name}> có id "${id}" không hợp lệ: chỉ gồm chữ thường không dấu, số, gạch ngang và bắt đầu bằng chữ cái`,
        element,
      );
    }

    const anchorId = id ?? `${spec.slug}-${number.replaceAll('.', '-')}`;
    if (usedAnchors.has(anchorId) || (id !== null && byId.has(id))) {
      file.fail(`Trùng id/anchor "${anchorId}" trong cùng một bài`, element);
    }
    usedAnchors.add(anchorId);

    const info: LessonBlockInfo = {
      name,
      id,
      anchorId,
      number,
      label: `${spec.label} ${number}`,
      title: getStringAttribute(element, 'title') ?? null,
      original: getStringAttribute(element, 'original') ?? null,
      source: getStringAttribute(element, 'source') ?? null,
      page: getStringAttribute(element, 'page') ?? null,
    };
    blocks.push(info);
    if (id !== null) {
      byId.set(id, info);
    }

    setStringAttribute(element, 'number', number);
    setStringAttribute(element, 'anchorId', anchorId);
  });

  // Lượt 2: phân giải tham chiếu (cho phép tham chiếu tới khối xuất hiện phía sau).
  visit(tree, (node) => {
    const element = asJsxElement(node);
    if (!element?.name) {
      return;
    }

    if (element.name === 'Ref' || element.name === 'Proof') {
      const attributeName = element.name === 'Ref' ? 'to' : 'of';
      const targetId = getStringAttribute(element, attributeName);

      if (element.name === 'Proof' && targetId === undefined) {
        return;
      }
      if (targetId === undefined) {
        file.fail(`<Ref> thiếu thuộc tính "to"`, element);
        return;
      }

      const target = byId.get(targetId);
      if (!target) {
        file.fail(
          `<${element.name} ${attributeName}="${targetId}"> không tìm thấy khối có id "${targetId}" trong bài này (tham chiếu chéo giữa các bài sẽ được hỗ trợ ở giai đoạn sau)`,
          element,
        );
        return;
      }

      if (element.name === 'Ref') {
        setStringAttribute(element, 'label', target.label);
        setStringAttribute(element, 'anchorId', target.anchorId);
      } else {
        setStringAttribute(element, 'ofLabel', target.label);
        setStringAttribute(element, 'ofAnchor', target.anchorId);
      }
    }
  });

  // Lượt 3: xuất `lessonMeta` từ module MDX.
  const meta: LessonMeta = {
    chapterNumber: numbers.chapter,
    lessonNumber: numbers.lesson,
    headings,
    blocks,
  };
  tree.children.push({
    type: 'mdxjsEsm',
    value: `export const lessonMeta = ${JSON.stringify(meta)};`,
    data: { estree: buildExportProgram(meta) },
  } as unknown as Root['children'][number]);
};
