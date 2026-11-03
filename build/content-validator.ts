import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import katex from 'katex';
import type { Root } from 'mdast';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import type { Position } from 'unist';
import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';
import {
  isNumberedBlockName,
  type ContentManifest,
  type LessonBlockInfo,
  type LessonMeta,
  type LessonStatus,
} from '../schemas/index.ts';
import { scanContent, type ContentIssue } from './content-scanner.ts';
import { remarkTheoremNumbering } from './remark-theorem-numbering.ts';

export type ValidationCategory =
  'structure' | 'metadata' | 'sources' | 'mdx' | 'latex' | 'references' | 'assets' | 'lock';

export interface ValidationIssue extends ContentIssue {
  readonly category: ValidationCategory;
  readonly line?: number;
  readonly column?: number;
}

export interface ContentLockLessonEntry {
  readonly path: string;
  readonly status: 'approved' | 'published';
  readonly version: string;
  readonly sha256: string;
  readonly numberedBlocks: Readonly<Record<string, string>>;
}

export interface ContentLockFile {
  readonly schemaVersion: 1;
  readonly updatedAt: string;
  readonly lessons: Readonly<Record<string, ContentLockLessonEntry>>;
}

export interface LessonValidationSummary {
  readonly id: string;
  readonly title: string;
  readonly subjectId: string;
  readonly chapterId: string;
  readonly status: LessonStatus;
  readonly version: string;
  readonly file: string;
  readonly sha256: string;
  readonly isLocked: boolean;
  readonly hasKeyTakeaways: boolean;
  readonly blocks: readonly LessonBlockInfo[];
  readonly citedSources: readonly string[];
}

export interface ValidationResult {
  readonly manifest: ContentManifest;
  readonly issues: readonly ValidationIssue[];
  readonly lessons: readonly LessonValidationSummary[];
}

export interface ValidateContentOptions {
  readonly projectRoot: string;
  readonly contentDir?: string;
  readonly lockFilePath?: string;
}

export const WHITELISTED_MDX_COMPONENTS = new Set<string>([
  'Definition',
  'Theorem',
  'Lemma',
  'Proposition',
  'Corollary',
  'Proof',
  'Example',
  'Counterexample',
  'Remark',
  'Note',
  'Warning',
  'Exercise',
  'Hint',
  'Solution',
  'Cite',
  'Ref',
  'Figure',
  'KeyTakeaways',
  'AffinePlane',
  'DraggablePoint',
  'VectorArrow',
  'AffineLine',
  'AffineFrame',
  'Parallelogram',
  'Barycenter',
  'AffineMapDemo',
  'SupremumEpsilonDemo',
  'SequenceEpsilonDemo',
  'UniformContinuityDemo',
  'TaylorPolynomialDemo',
]);

const FORBIDDEN_HTML_TAGS = new Set<string>([
  'script',
  'iframe',
  'object',
  'embed',
  'style',
  'form',
]);

const PLACEHOLDER_REGEX = /<[^>\r\n]+>|(?:\bTODO\b)|\?\?\?/i;

const UNSUPPORTED_LATEX_PATTERNS: readonly { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\\begin\{tikzcd\}|\\tikz\b|\\begin\{tikzpicture\}/,
    reason: 'KaTeX không hỗ trợ môi trường vẽ hình TikZ/tikzcd (hãy dùng Figure Kit hoặc SVG)',
  },
  {
    pattern: /\\(?:newcommand|renewcommand|def|DeclareMathOperator)\b/,
    reason:
      'Không định nghĩa macro cục bộ trong bài học; hãy khai báo trong content/_shared/katex-macros.json',
  },
];

/**
 * Chuẩn hóa chuỗi nội dung sang LF và tính mã băm SHA-256 nhất quán giữa Windows và Linux.
 */
export function computeContentHash(rawContent: string): string {
  const normalized = rawContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  return createHash('sha256').update(normalized, 'utf8').digest('hex');
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function classifyScannerIssue(message: string): ValidationCategory {
  if (
    message.includes('Thiếu file subject.yaml') ||
    message.includes('Thiếu file chapter.yaml') ||
    message.includes('thiếu tiền tố số') ||
    message.includes('kebab-case') ||
    message.includes('số thứ tự')
  ) {
    return 'structure';
  }
  if (
    message.includes('bibliography.yaml') ||
    message.includes('giáo trình') ||
    message.includes('nguồn tham khảo') ||
    message.includes('sources')
  ) {
    return 'sources';
  }
  return 'metadata';
}

interface JsxAttributeNode {
  type: 'mdxJsxAttribute' | 'mdxJsxExpressionAttribute';
  name?: string;
  value?: string | { type: string; value?: string } | null;
}

interface JsxElementNode {
  type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
  name: string | null;
  attributes: JsxAttributeNode[];
  children?: unknown[];
  position?: Position;
}

function asJsxElement(node: { type: string }): JsxElementNode | null {
  if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
    return node as unknown as JsxElementNode;
  }
  return null;
}

function getStringAttr(element: JsxElementNode, name: string): string | undefined {
  const attr = element.attributes.find(
    (item) => item.type === 'mdxJsxAttribute' && item.name === name,
  );
  return typeof attr?.value === 'string' ? attr.value : undefined;
}

function extractTextAndMathContent(children: readonly unknown[] | undefined): string {
  if (!children || children.length === 0) {
    return '';
  }
  const parts: string[] = [];
  for (const child of children) {
    if (typeof child === 'object' && child !== null) {
      const typed = child as { type?: string; value?: unknown; children?: unknown[] };
      if (typeof typed.value === 'string') {
        parts.push(typed.value);
      }
      if (Array.isArray(typed.children)) {
        parts.push(extractTextAndMathContent(typed.children));
      }
    }
  }
  return parts.join('').trim();
}

function loadKatexMacros(contentDir: string): Record<string, string> {
  const macrosPath = path.join(contentDir, '_shared', 'katex-macros.json');
  if (!existsSync(macrosPath)) {
    return {};
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(macrosPath, 'utf8'));
    if (typeof parsed === 'object' && parsed !== null) {
      const result: Record<string, string> = {};
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === 'string') {
          result[key] = value;
        }
      }
      return result;
    }
  } catch {
    // Nếu file JSON lỗi sẽ được báo ở bước kiểm tra
  }
  return {};
}

function loadLockFile(
  lockFilePath: string,
  relativeLockPath: string,
  issues: ValidationIssue[],
): ContentLockFile | null {
  if (!existsSync(lockFilePath)) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(readFileSync(lockFilePath, 'utf8'));
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'schemaVersion' in parsed &&
      'lessons' in parsed &&
      typeof (parsed as { lessons: unknown }).lessons === 'object' &&
      (parsed as { lessons: unknown }).lessons !== null
    ) {
      return parsed as ContentLockFile;
    }
    issues.push({
      severity: 'error',
      category: 'lock',
      file: relativeLockPath,
      message: 'Cấu trúc content.lock.json không hợp lệ',
    });
    return null;
  } catch (error) {
    issues.push({
      severity: 'error',
      category: 'lock',
      file: relativeLockPath,
      message: `Không đọc được content.lock.json: ${(error as Error).message}`,
    });
    return null;
  }
}

function parseEsmImportsAndExports(esmValue: string): {
  readonly hasExport: boolean;
  readonly imports: readonly { localNames: readonly string[]; source: string }[];
} {
  const lines = esmValue
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('//'));

  let hasExport = false;
  const imports: { localNames: readonly string[]; source: string }[] = [];

  for (const line of lines) {
    if (/^export\b/.test(line)) {
      hasExport = true;
      continue;
    }
    const fromMatch = /^import\s+(.+?)\s+from\s+['"]([^'"]+)['"]\s*;?$/.exec(line);
    if (fromMatch) {
      const clause = fromMatch[1] ?? '';
      const source = fromMatch[2] ?? '';
      const names = clause
        .replace(/[{}]/g, ' ')
        .split(',')
        .map((part) => {
          const asParts = part.trim().split(/\s+as\s+/);
          return (asParts[1] ?? asParts[0] ?? '').trim();
        })
        .filter((name) => /^[A-Za-z_$][\w$]*$/.test(name));
      imports.push({ localNames: names, source });
      continue;
    }
    const bareMatch = /^import\s+['"]([^'"]+)['"]\s*;?$/.exec(line);
    if (bareMatch) {
      imports.push({ localNames: [], source: bareMatch[1] ?? '' });
    }
  }

  return { hasExport, imports };
}

function resolveAssetOrFigureExists(chapterDir: string, relativeImport: string): boolean {
  const cleanRel = relativeImport.split('?')[0]?.split('#')[0] ?? relativeImport;
  const candidate = path.resolve(chapterDir, cleanRel);
  if (existsSync(candidate)) {
    return true;
  }
  for (const ext of ['.tsx', '.ts', '.jsx', '.js']) {
    if (existsSync(`${candidate}${ext}`)) {
      return true;
    }
  }
  return false;
}

/**
 * Thực hiện kiểm định toàn diện kho nội dung theo 8 nhóm quy tắc của Giai đoạn 4:
 * `structure`, `metadata`, `sources`, `mdx`, `latex`, `references`, `assets`, `lock`.
 */
export function validateContent(options: ValidateContentOptions): ValidationResult {
  const { projectRoot } = options;
  const contentDir = path.resolve(projectRoot, options.contentDir ?? 'content');
  const lockFilePath = path.resolve(projectRoot, options.lockFilePath ?? 'content.lock.json');
  const relativeLockPath = toPosix(path.relative(projectRoot, lockFilePath));

  const scanResult = scanContent({
    projectRoot,
    contentDir,
    publishedOnly: false,
  });

  const issues: ValidationIssue[] = scanResult.issues.map((issue) => ({
    ...issue,
    category: classifyScannerIssue(issue.message),
  }));

  const sharedMacros = loadKatexMacros(contentDir);
  const lockFile = loadLockFile(lockFilePath, relativeLockPath, issues);
  const sourceIds = new Set(scanResult.manifest.bibliography.map((item) => item.id));

  const lessonSummaries: LessonValidationSummary[] = [];
  const allKnownLessonIds = new Set<string>();

  for (const subject of scanResult.manifest.subjects) {
    const allowedSubjectSources = new Set<string>([
      ...(subject.sources.primary ? [subject.sources.primary] : []),
      ...subject.sources.references,
    ]);

    if (subject.sources.primary === null) {
      const firstLessonFile = subject.chapters[0]?.lessons[0]?.file.replace(/^\//, '');
      const subjectDirFromLesson = firstLessonFile
        ? path.posix.dirname(path.posix.dirname(firstLessonFile))
        : `content/${subject.id}`;
      const subjectFile = `${subjectDirFromLesson}/subject.yaml`;
      const alreadyWarned = issues.some(
        (issue) =>
          issue.file === subjectFile && issue.message.includes('chưa khai báo giáo trình chính'),
      );
      if (!alreadyWarned) {
        issues.push({
          severity: 'warning',
          category: 'sources',
          file: subjectFile,
          message: 'Môn học chưa khai báo giáo trình chính (sources.primary đang là null)',
        });
      }
    }

    // Kiểm tra trùng id khối định lý/định nghĩa trong toàn bộ một môn học
    const subjectBlockIds = new Map<string, { file: string; line?: number }>();

    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        allKnownLessonIds.add(lesson.id);
        for (const alias of lesson.aliases) {
          allKnownLessonIds.add(alias);
        }

        // Kiểm tra bài tự tham chiếu chính mình trong prerequisites
        if (lesson.prerequisites.includes(lesson.id)) {
          issues.push({
            severity: 'error',
            category: 'metadata',
            file: lesson.file.replace(/^\//, ''),
            message: `Bài học "${lesson.id}" không được khai báo chính nó trong prerequisites`,
          });
        }

        // Cảnh báo nếu nguồn trong frontmatter thiếu pages
        for (const srcRef of lesson.sources) {
          if (!srcRef.pages) {
            issues.push({
              severity: 'warning',
              category: 'sources',
              file: lesson.file.replace(/^\//, ''),
              message: `Nguồn tham khảo "${srcRef.source}" trong frontmatter chưa ghi số trang (pages)`,
            });
          }
        }

        const absoluteLessonPath = path.join(projectRoot, lesson.file.replace(/^\//, ''));
        const relativeLessonFile = toPosix(path.relative(projectRoot, absoluteLessonPath));
        const chapterDir = path.dirname(absoluteLessonPath);
        const rawSource = readFileSync(absoluteLessonPath, 'utf8');
        const sha256 = computeContentHash(rawSource);

        let blocks: readonly LessonBlockInfo[] = [];
        let hasKeyTakeaways = false;
        const citedSources = new Set<string>(lesson.sources.map((s) => s.source));
        const importedFigureComponents = new Set<string>();

        const processor = unified()
          .use(remarkParse)
          .use(remarkFrontmatter)
          .use(remarkGfm)
          .use(remarkMath)
          .use(remarkMdx);

        const vfile = new VFile({ path: absoluteLessonPath, value: rawSource });
        let tree: Root | null = null;

        try {
          tree = processor.parse(vfile);
        } catch (error) {
          const err = error as { message?: string; line?: number; column?: number };
          issues.push({
            severity: 'error',
            category: 'mdx',
            file: relativeLessonFile,
            line: err.line,
            column: err.column,
            message: `Lỗi cú pháp MDX: ${err.message ?? String(error)}`,
          });
        }

        if (tree) {
          // 1. Kiểm tra ESM (import/export), hình ảnh, công thức LaTeX và JSX components
          visit(tree, (node) => {
            const position = (node as { position?: Position }).position;
            const line = position?.start.line;
            const column = position?.start.column;

            if (node.type === 'mdxjsEsm') {
              const esmValue = (node as unknown as { value?: string }).value ?? '';
              const parsedEsm = parseEsmImportsAndExports(esmValue);

              if (parsedEsm.hasExport) {
                issues.push({
                  severity: 'error',
                  category: 'mdx',
                  file: relativeLessonFile,
                  line,
                  column,
                  message:
                    'Không được phép sử dụng "export" tùy ý trong thân bài MDX (chỉ dùng YAML frontmatter)',
                });
              }

              for (const imp of parsedEsm.imports) {
                const isAllowedPath =
                  imp.source.startsWith('./figures/') || imp.source.startsWith('./assets/');
                if (!isAllowedPath) {
                  issues.push({
                    severity: 'error',
                    category: 'mdx',
                    file: relativeLessonFile,
                    line,
                    column,
                    message: `Import "${imp.source}" không hợp lệ: MDX chỉ cho phép import từ "./figures/*" hoặc "./assets/*"`,
                  });
                } else {
                  for (const localName of imp.localNames) {
                    importedFigureComponents.add(localName);
                  }
                  if (!resolveAssetOrFigureExists(chapterDir, imp.source)) {
                    issues.push({
                      severity: 'error',
                      category: 'assets',
                      file: relativeLessonFile,
                      line,
                      column,
                      message: `Không tìm thấy file tài nguyên/hình vẽ được import: "${imp.source}"`,
                    });
                  }
                }
              }
              return;
            }

            if (node.type === 'image') {
              const imageUrl = (node as { url?: string }).url ?? '';
              if (
                imageUrl &&
                !imageUrl.startsWith('http://') &&
                !imageUrl.startsWith('https://') &&
                !imageUrl.startsWith('/')
              ) {
                if (!resolveAssetOrFigureExists(chapterDir, imageUrl)) {
                  issues.push({
                    severity: 'error',
                    category: 'assets',
                    file: relativeLessonFile,
                    line,
                    column,
                    message: `Ảnh minh họa "${imageUrl}" không tồn tại`,
                  });
                }
              }
              return;
            }

            if (node.type === 'math' || node.type === 'inlineMath') {
              const formula = (node as unknown as { value?: string }).value ?? '';
              for (const rule of UNSUPPORTED_LATEX_PATTERNS) {
                if (rule.pattern.test(formula)) {
                  issues.push({
                    severity: 'error',
                    category: 'latex',
                    file: relativeLessonFile,
                    line,
                    column,
                    message: `Công thức LaTeX không hợp lệ: ${rule.reason}`,
                  });
                  return;
                }
              }

              try {
                katex.renderToString(formula, {
                  throwOnError: true,
                  displayMode: node.type === 'math',
                  macros: { ...sharedMacros },
                  strict: 'ignore',
                });
              } catch (error) {
                issues.push({
                  severity: 'error',
                  category: 'latex',
                  file: relativeLessonFile,
                  line,
                  column,
                  message: `Lỗi cú pháp KaTeX: ${(error as Error).message}`,
                });
              }
              return;
            }

            const element = asJsxElement(node);
            if (!element?.name) {
              return;
            }

            const tagName = element.name;
            if (FORBIDDEN_HTML_TAGS.has(tagName.toLowerCase())) {
              issues.push({
                severity: 'error',
                category: 'mdx',
                file: relativeLessonFile,
                line,
                column,
                message: `Thẻ HTML "<${tagName}>" bị cấm sử dụng trong nội dung MDX vì lý do bảo mật`,
              });
              return;
            }

            if (tagName === 'img') {
              const srcAttr = getStringAttr(element, 'src');
              if (
                srcAttr &&
                !srcAttr.startsWith('http://') &&
                !srcAttr.startsWith('https://') &&
                !srcAttr.startsWith('/')
              ) {
                if (!resolveAssetOrFigureExists(chapterDir, srcAttr)) {
                  issues.push({
                    severity: 'error',
                    category: 'assets',
                    file: relativeLessonFile,
                    line,
                    column,
                    message: `Ảnh "<img src="${srcAttr}">" không tồn tại`,
                  });
                }
              }
              return;
            }

            const isCustomComponent = /^[A-Z]/.test(tagName);
            if (
              isCustomComponent &&
              !WHITELISTED_MDX_COMPONENTS.has(tagName) &&
              !importedFigureComponents.has(tagName)
            ) {
              issues.push({
                severity: 'error',
                category: 'mdx',
                file: relativeLessonFile,
                line,
                column,
                message: `Component "<${tagName}>" không nằm trong danh sách whitelist được phép sử dụng trong MDX`,
              });
              return;
            }

            if (tagName === 'KeyTakeaways') {
              hasKeyTakeaways = true;
            }

            if (isNumberedBlockName(tagName)) {
              const blockId = getStringAttr(element, 'id');
              if (blockId) {
                const prev = subjectBlockIds.get(blockId);
                if (prev && prev.file !== relativeLessonFile) {
                  issues.push({
                    severity: 'error',
                    category: 'references',
                    file: relativeLessonFile,
                    line,
                    column,
                    message: `Khối có id "${blockId}" bị trùng với khối cùng id trong bài ${prev.file}`,
                  });
                } else if (!prev) {
                  subjectBlockIds.set(blockId, { file: relativeLessonFile, line });
                }
              }
            }

            if (tagName === 'Cite') {
              const citeSource = getStringAttr(element, 'source');
              if (!citeSource || citeSource.trim().length === 0) {
                issues.push({
                  severity: 'error',
                  category: 'mdx',
                  file: relativeLessonFile,
                  line,
                  column,
                  message: 'Component <Cite> bắt buộc phải có thuộc tính "source"',
                });
              }
            }

            if (tagName === 'Figure') {
              const caption = getStringAttr(element, 'caption');
              if (!caption || caption.trim().length === 0) {
                issues.push({
                  severity: 'error',
                  category: 'mdx',
                  file: relativeLessonFile,
                  line,
                  column,
                  message: 'Component <Figure> bắt buộc phải có thuộc tính "caption"',
                });
              }
            }

            if (tagName === 'Proof') {
              const textInside = extractTextAndMathContent(element.children);
              if (textInside.length === 0) {
                issues.push({
                  severity: 'warning',
                  category: 'mdx',
                  file: relativeLessonFile,
                  line,
                  column,
                  message: 'Khối <Proof> đang để trống nội dung chứng minh',
                });
              }
            }

            const originalAttr = getStringAttr(element, 'original');
            const sourceAttr = getStringAttr(element, 'source');
            const pageAttr = getStringAttr(element, 'page');

            if (originalAttr !== undefined && (!sourceAttr || sourceAttr.trim().length === 0)) {
              issues.push({
                severity: 'error',
                category: 'sources',
                file: relativeLessonFile,
                line,
                column,
                message: `<${tagName}> có thuộc tính "original" ("${originalAttr}") nhưng thiếu thuộc tính "source"`,
              });
            }

            if (originalAttr !== undefined && PLACEHOLDER_REGEX.test(originalAttr)) {
              issues.push({
                severity: 'error',
                category: 'sources',
                file: relativeLessonFile,
                line,
                column,
                message: `Thuộc tính "original" trong <${tagName}> chứa giá trị giữ chỗ chưa hoàn thiện ("${originalAttr}")`,
              });
            }

            if (sourceAttr !== undefined) {
              if (PLACEHOLDER_REGEX.test(sourceAttr)) {
                issues.push({
                  severity: 'error',
                  category: 'sources',
                  file: relativeLessonFile,
                  line,
                  column,
                  message: `Thuộc tính "source" trong <${tagName}> chứa giá trị giữ chỗ chưa hoàn thiện ("${sourceAttr}")`,
                });
              } else if (!sourceIds.has(sourceAttr)) {
                issues.push({
                  severity: 'error',
                  category: 'sources',
                  file: relativeLessonFile,
                  line,
                  column,
                  message: `Nguồn "${sourceAttr}" trong <${tagName}> không tồn tại trong content/_shared/bibliography.yaml`,
                });
              } else {
                citedSources.add(sourceAttr);
                if (!allowedSubjectSources.has(sourceAttr)) {
                  issues.push({
                    severity: 'warning',
                    category: 'sources',
                    file: relativeLessonFile,
                    line,
                    column,
                    message: `Nguồn "${sourceAttr}" trong <${tagName}> không nằm trong danh sách sources của môn học`,
                  });
                }
              }

              if ((isNumberedBlockName(tagName) || tagName === 'Cite') && !pageAttr) {
                issues.push({
                  severity: 'warning',
                  category: 'sources',
                  file: relativeLessonFile,
                  line,
                  column,
                  message: `<${tagName}> trích dẫn nguồn "${sourceAttr}" nhưng chưa ghi số trang (page)`,
                });
              }
            }
          });

          // 2. Chạy remarkTheoremNumbering để kiểm tra đánh số Chương.Bài.Số và tham chiếu <Ref to> / <Proof of>
          try {
            const numberingRunner = unified().use(remarkTheoremNumbering);
            numberingRunner.runSync(tree, vfile);

            const lastChild = tree.children.at(-1) as { type?: string; value?: string } | undefined;
            if (lastChild?.type === 'mdxjsEsm' && typeof lastChild.value === 'string') {
              const match = /^export const lessonMeta = (.+);$/.exec(lastChild.value);
              if (match?.[1]) {
                const meta = JSON.parse(match[1]) as LessonMeta;
                blocks = meta.blocks;
              }
            }
          } catch (error) {
            const err = error as { message?: string; line?: number; column?: number };
            issues.push({
              severity: 'error',
              category: 'references',
              file: relativeLessonFile,
              line: err.line,
              column: err.column,
              message: err.message ?? String(error),
            });
          }

          if (!hasKeyTakeaways) {
            issues.push({
              severity: 'warning',
              category: 'mdx',
              file: relativeLessonFile,
              message: 'Bài học chưa có khối tóm tắt <KeyTakeaways> ở cuối bài',
            });
          }
        }

        // 3. Kiểm tra khóa bảo vệ nội dung đã duyệt (content.lock.json)
        const lockEntry = lockFile?.lessons[lesson.id];
        const isApprovedOrPublished = lesson.status === 'approved' || lesson.status === 'published';

        if (isApprovedOrPublished) {
          if (!lockEntry) {
            issues.push({
              severity: 'error',
              category: 'lock',
              file: relativeLessonFile,
              message: `Bài học "${lesson.id}" có trạng thái "${lesson.status}" nhưng chưa được khóa trong content.lock.json (hãy chạy: npm.cmd run content:approve ${lesson.id})`,
            });
          } else {
            if (lockEntry.sha256 !== sha256) {
              issues.push({
                severity: 'error',
                category: 'lock',
                file: relativeLessonFile,
                message: `Nội dung bài đã duyệt "${lesson.id}" (${lesson.status}) đã bị thay đổi so với mã băm trong content.lock.json! Để chỉnh sửa hợp lệ, hãy chuyển status về "review" rồi duyệt lại.`,
              });
            }

            // Kiểm tra dịch chuyển số hiệu (Rủi ro R17)
            for (const block of blocks) {
              if (block.id && lockEntry.numberedBlocks[block.id] !== undefined) {
                const lockedNumber = lockEntry.numberedBlocks[block.id];
                if (lockedNumber !== block.number) {
                  issues.push({
                    severity: 'warning',
                    category: 'references',
                    file: relativeLessonFile,
                    message: `Số hiệu của khối "${block.id}" đã bị dịch chuyển từ ${lockedNumber} sang ${block.number} so với content.lock.json`,
                  });
                }
              }
            }
          }
        }

        lessonSummaries.push({
          id: lesson.id,
          title: lesson.title,
          subjectId: subject.id,
          chapterId: chapter.id,
          status: lesson.status,
          version: lesson.version,
          file: relativeLessonFile,
          sha256,
          isLocked: Boolean(lockEntry && lockEntry.sha256 === sha256),
          hasKeyTakeaways,
          blocks,
          citedSources: [...citedSources],
        });
      }
    }
  }

  // 4. Kiểm tra các bài đã từng published trong content.lock.json nhưng bị xóa mất id (Rủi ro R6)
  if (lockFile) {
    for (const [lockedId, entry] of Object.entries(lockFile.lessons)) {
      if (!allKnownLessonIds.has(lockedId)) {
        issues.push({
          severity: 'error',
          category: 'lock',
          file: relativeLockPath,
          message: `Bài học đã duyệt "${lockedId}" (${entry.path}) trong content.lock.json đã bị xóa hoặc đổi id mà chưa khai báo trong aliases`,
        });
      }
    }
  }

  return {
    manifest: scanResult.manifest,
    issues,
    lessons: lessonSummaries,
  };
}

export function formatValidationIssues(issues: readonly ValidationIssue[]): string {
  return issues
    .map((issue) => {
      const tag = issue.severity === 'error' ? 'LỖI' : 'CẢNH BÁO';
      const loc = issue.line !== undefined ? `:${issue.line}` : '';
      return `  [${tag}][${issue.category}] ${issue.file}${loc} — ${issue.message}`;
    })
    .join('\n');
}
