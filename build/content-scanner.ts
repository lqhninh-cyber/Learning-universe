import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import type { ZodType } from 'zod';
import {
  bibliographySchema,
  chapterSchema,
  lessonSchema,
  SLUG_PATTERN,
  subjectSchema,
  type BibliographyEntry,
  type Chapter,
  type ContentManifest,
  type LessonFrontmatter,
  type ManifestChapter,
  type ManifestLesson,
  type ManifestSubject,
} from '../schemas/index.ts';
import { parsePrefixedName } from './content-paths.ts';

export interface ContentIssue {
  readonly severity: 'error' | 'warning';
  /** Đường dẫn file tính từ gốc dự án (dùng dấu "/"). */
  readonly file: string;
  readonly message: string;
}

export interface ScanOptions {
  /** Thư mục gốc dự án (dùng để tính đường dẫn tương đối). */
  readonly projectRoot: string;
  /** Thư mục nội dung cần quét (đường dẫn tuyệt đối). */
  readonly contentDir: string;
  /** Chỉ giữ bài `published` (bản production). */
  readonly publishedOnly?: boolean;
}

export interface ScanResult {
  readonly manifest: ContentManifest;
  readonly issues: readonly ContentIssue[];
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function listDirectories(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && !entry.name.startsWith('_') && !entry.name.startsWith('.'),
    )
    .map((entry) => entry.name)
    .sort();
}

function listMdxFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.mdx'))
    .map((entry) => entry.name)
    .sort();
}

/** Lấy phần frontmatter YAML ở đầu file MDX, `null` nếu không có. */
export function extractFrontmatter(source: string): string | null {
  const match = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  return match?.[1] ?? null;
}

export function formatIssues(issues: readonly ContentIssue[]): string {
  return issues
    .map(
      (issue) =>
        `  [${issue.severity === 'error' ? 'LỖI' : 'CẢNH BÁO'}] ${issue.file}: ${issue.message}`,
    )
    .join('\n');
}

export function hasErrors(issues: readonly ContentIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}

class Scanner {
  readonly issues: ContentIssue[] = [];
  private readonly options: ScanOptions;

  constructor(options: ScanOptions) {
    this.options = options;
  }

  relativeFile(absolutePath: string): string {
    return toPosix(path.relative(this.options.projectRoot, absolutePath));
  }

  report(severity: ContentIssue['severity'], absolutePath: string, message: string): void {
    this.issues.push({ severity, file: this.relativeFile(absolutePath), message });
  }

  /** Đọc và kiểm tra một file YAML bằng Zod schema. Trả về `null` nếu có lỗi. */
  parseYamlFile<T>(filePath: string, schema: ZodType<T>): T | null {
    let data: unknown;
    try {
      data = parseYaml(readFileSync(filePath, 'utf8'));
    } catch (error) {
      this.report('error', filePath, `Không đọc được YAML: ${(error as Error).message}`);
      return null;
    }
    return this.validate(filePath, schema, data);
  }

  validate<T>(filePath: string, schema: ZodType<T>, data: unknown): T | null {
    const result = schema.safeParse(data);
    if (result.success) {
      return result.data;
    }
    for (const issue of result.error.issues) {
      const where = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      this.report('error', filePath, `${where}${issue.message}`);
    }
    return null;
  }
}

interface ScannedLesson {
  readonly lesson: ManifestLesson;
  readonly absolutePath: string;
}

interface ScannedChapter {
  readonly chapter: Omit<ManifestChapter, 'lessons'>;
  readonly lessons: ScannedLesson[];
  /** Đường dẫn tuyệt đối tới chapter.yaml. */
  readonly absolutePath: string;
}

interface ScannedSubject {
  readonly subject: Omit<ManifestSubject, 'chapters'>;
  readonly chapters: ScannedChapter[];
  readonly absolutePath: string;
}

/**
 * Quét thư mục nội dung, kiểm tra bằng Zod và các quy tắc tham chiếu chéo,
 * rồi dựng manifest (chỉ metadata, không kèm thân bài MDX).
 */
export function scanContent(options: ScanOptions): ScanResult {
  const scanner = new Scanner(options);
  const { contentDir } = options;

  // 1. Thư mục tài liệu dùng chung.
  let bibliography: BibliographyEntry[] = [];
  const bibliographyFile = path.join(contentDir, '_shared', 'bibliography.yaml');
  if (existsSync(bibliographyFile)) {
    bibliography = [
      ...(scanner.parseYamlFile(bibliographyFile, bibliographySchema)?.sources ?? []),
    ];
  }
  const sourceIds = new Set(bibliography.map((entry) => entry.id));

  // 2. Môn học → chương → bài.
  const subjects: ScannedSubject[] = [];
  if (existsSync(contentDir) && statSync(contentDir).isDirectory()) {
    for (const subjectDirName of listDirectories(contentDir)) {
      const scanned = scanSubject(
        scanner,
        path.join(contentDir, subjectDirName),
        subjectDirName,
        options,
      );
      if (scanned) {
        subjects.push(scanned);
      }
    }
  }

  // 3. Kiểm tra tham chiếu chéo toàn hệ thống.
  crossCheck(scanner, subjects, sourceIds);

  // 4. Dựng manifest (có thể lọc bản production).
  const manifest = buildManifest(bibliography, subjects, options.publishedOnly === true);
  return { manifest, issues: scanner.issues };
}

function scanSubject(
  scanner: Scanner,
  subjectDir: string,
  dirName: string,
  options: ScanOptions,
): ScannedSubject | null {
  const subjectFile = path.join(subjectDir, 'subject.yaml');

  if (!SLUG_PATTERN.test(dirName)) {
    scanner.report(
      'error',
      subjectDir,
      `Tên thư mục môn "${dirName}" phải là kebab-case [a-z0-9-]`,
    );
    return null;
  }
  if (!existsSync(subjectFile)) {
    scanner.report('error', subjectDir, 'Thiếu file subject.yaml');
    return null;
  }

  const subject = scanner.parseYamlFile(subjectFile, subjectSchema);
  if (!subject) {
    return null;
  }

  const chapters: ScannedChapter[] = [];
  for (const chapterDirName of listDirectories(subjectDir)) {
    const scanned = scanChapter(
      scanner,
      path.join(subjectDir, chapterDirName),
      chapterDirName,
      options,
    );
    if (scanned) {
      chapters.push(scanned);
    }
  }

  return {
    subject: { ...subject, slug: subject.slug ?? dirName },
    chapters,
    absolutePath: subjectFile,
  };
}

function scanChapter(
  scanner: Scanner,
  chapterDir: string,
  dirName: string,
  options: ScanOptions,
): ScannedChapter | null {
  const chapterFile = path.join(chapterDir, 'chapter.yaml');
  const prefixed = parsePrefixedName(dirName);

  if (prefixed.order === null) {
    scanner.report(
      'error',
      chapterDir,
      `Thư mục chương "${dirName}" thiếu tiền tố số (ví dụ 01-ten-chuong)`,
    );
    return null;
  }
  if (!SLUG_PATTERN.test(prefixed.slug)) {
    scanner.report(
      'error',
      chapterDir,
      `Slug chương "${prefixed.slug}" phải là kebab-case [a-z0-9-]`,
    );
    return null;
  }
  if (!existsSync(chapterFile)) {
    scanner.report('error', chapterDir, 'Thiếu file chapter.yaml');
    return null;
  }

  const chapter: Chapter | null = scanner.parseYamlFile(chapterFile, chapterSchema);
  if (!chapter) {
    return null;
  }

  const lessons: ScannedLesson[] = [];
  for (const fileName of listMdxFiles(chapterDir)) {
    const scanned = scanLesson(scanner, path.join(chapterDir, fileName), fileName, options);
    if (scanned) {
      lessons.push(scanned);
    }
  }

  const { number: numberOverride, ...rest } = chapter;
  return {
    chapter: { ...rest, slug: prefixed.slug, number: numberOverride ?? prefixed.order },
    lessons,
    absolutePath: chapterFile,
  };
}

function scanLesson(
  scanner: Scanner,
  lessonPath: string,
  fileName: string,
  options: ScanOptions,
): ScannedLesson | null {
  const prefixed = parsePrefixedName(fileName);

  if (prefixed.order === null) {
    scanner.report('error', lessonPath, 'Tên file bài học thiếu tiền tố số (ví dụ 01-ten-bai.mdx)');
    return null;
  }
  if (!SLUG_PATTERN.test(prefixed.slug)) {
    scanner.report(
      'error',
      lessonPath,
      `Slug bài học "${prefixed.slug}" phải là kebab-case [a-z0-9-]`,
    );
    return null;
  }

  const frontmatterText = extractFrontmatter(readFileSync(lessonPath, 'utf8'));
  if (frontmatterText === null) {
    scanner.report('error', lessonPath, 'Thiếu frontmatter YAML ở đầu file (khối --- ... ---)');
    return null;
  }

  let data: unknown;
  try {
    data = parseYaml(frontmatterText);
  } catch (error) {
    scanner.report(
      'error',
      lessonPath,
      `Frontmatter không phải YAML hợp lệ: ${(error as Error).message}`,
    );
    return null;
  }

  const frontmatter: LessonFrontmatter | null = scanner.validate(lessonPath, lessonSchema, data);
  if (!frontmatter) {
    return null;
  }

  const file = `/${toPosix(path.relative(options.projectRoot, lessonPath))}`;
  return {
    lesson: {
      ...frontmatter,
      slug: prefixed.slug,
      number: frontmatter.number ?? prefixed.order,
      file,
    },
    absolutePath: lessonPath,
  };
}

function crossCheck(
  scanner: Scanner,
  subjects: readonly ScannedSubject[],
  sourceIds: ReadonlySet<string>,
): void {
  const lessonIds = new Set<string>();
  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      for (const { lesson } of chapter.lessons) {
        lessonIds.add(lesson.id);
      }
    }
  }

  // `id` phải duy nhất trong từng loại; `id` + `aliases` của bài duy nhất toàn hệ thống.
  const seenSubjects = new Map<string, string>();
  const seenChapters = new Map<string, string>();
  const seenLessonIds = new Map<string, string>();

  const claim = (
    registry: Map<string, string>,
    id: string,
    absolutePath: string,
    kind: string,
  ): void => {
    const previous = registry.get(id);
    if (previous !== undefined) {
      scanner.report(
        'error',
        absolutePath,
        `${kind} id "${id}" bị trùng với ${scanner.relativeFile(previous)}`,
      );
    } else {
      registry.set(id, absolutePath);
    }
  };

  for (const subject of subjects) {
    claim(seenSubjects, subject.subject.id, subject.absolutePath, 'Môn học');

    const { primary, references } = subject.subject.sources;
    const allowed = new Set<string>([...(primary ? [primary] : []), ...references]);
    for (const id of allowed) {
      if (!sourceIds.has(id)) {
        scanner.report(
          'error',
          subject.absolutePath,
          `Nguồn "${id}" không có trong content/_shared/bibliography.yaml`,
        );
      }
    }
    const hasNonDraftLesson = subject.chapters.some((chapter) =>
      chapter.lessons.some(({ lesson }) => lesson.status !== 'draft'),
    );
    if (primary === null && hasNonDraftLesson) {
      scanner.report(
        'warning',
        subject.absolutePath,
        'Môn học có bài review/approved/published nhưng chưa khai báo giáo trình chính (sources.primary)',
      );
    }

    checkDuplicateNumbers(
      scanner,
      subject.chapters.map((chapter) => ({
        number: chapter.chapter.number,
        path: subject.absolutePath,
      })),
      'Chương',
    );

    for (const chapter of subject.chapters) {
      claim(seenChapters, chapter.chapter.id, chapter.absolutePath, 'Chương');

      checkDuplicateNumbers(
        scanner,
        chapter.lessons.map(({ lesson, absolutePath }) => ({
          number: lesson.number,
          path: absolutePath,
        })),
        'Bài học',
      );

      for (const { lesson, absolutePath } of chapter.lessons) {
        claim(seenLessonIds, lesson.id, absolutePath, 'Bài học');
        for (const alias of lesson.aliases) {
          claim(seenLessonIds, alias, absolutePath, 'Bài học (alias)');
        }

        for (const prerequisite of lesson.prerequisites) {
          if (!lessonIds.has(prerequisite)) {
            scanner.report('error', absolutePath, `Bài tiên quyết "${prerequisite}" không tồn tại`);
          }
        }

        for (const ref of lesson.sources) {
          if (!sourceIds.has(ref.source)) {
            scanner.report(
              'error',
              absolutePath,
              `Nguồn "${ref.source}" không có trong content/_shared/bibliography.yaml`,
            );
          } else if (!allowed.has(ref.source)) {
            scanner.report(
              'warning',
              absolutePath,
              `Nguồn "${ref.source}" không thuộc giáo trình chính hoặc tài liệu tham khảo của môn`,
            );
          }
        }
      }
    }
  }
}

function checkDuplicateNumbers(
  scanner: Scanner,
  items: readonly { number: number; path: string }[],
  kind: string,
): void {
  const seen = new Set<number>();
  for (const item of items) {
    if (seen.has(item.number)) {
      scanner.report(
        'error',
        item.path,
        `${kind} có số thứ tự ${item.number} bị trùng trong cùng cấp`,
      );
    }
    seen.add(item.number);
  }
}

function buildManifest(
  bibliography: readonly BibliographyEntry[],
  subjects: readonly ScannedSubject[],
  publishedOnly: boolean,
): ContentManifest {
  const manifestSubjects: ManifestSubject[] = [];

  for (const { subject, chapters } of subjects) {
    if (publishedOnly && subject.status !== 'published') {
      continue;
    }

    const manifestChapters: ManifestChapter[] = [];
    for (const { chapter, lessons } of chapters) {
      const kept = lessons
        .map(({ lesson }) => lesson)
        .filter((lesson) => !publishedOnly || lesson.status === 'published')
        .sort((a, b) => a.number - b.number);
      if (publishedOnly && kept.length === 0 && lessons.length > 0) {
        continue;
      }
      manifestChapters.push({ ...chapter, lessons: kept });
    }
    manifestChapters.sort((a, b) => a.number - b.number);
    manifestSubjects.push({ ...subject, chapters: manifestChapters });
  }

  manifestSubjects.sort((a, b) => a.order - b.order);
  return { bibliography, subjects: manifestSubjects };
}
