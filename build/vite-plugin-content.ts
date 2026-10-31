import path from 'node:path';
import type { Logger, Plugin } from 'vite';
import {
  formatIssues,
  hasErrors,
  scanContent,
  type ContentIssue,
  type ScanResult,
} from './content-scanner.ts';
import { validateContent } from './content-validator.ts';
import type { ContentDiagnostics, ContentManifest } from '../schemas/manifest.ts';

export const VIRTUAL_MANIFEST_ID = 'virtual:content-manifest';
const RESOLVED_MANIFEST_ID = `\0${VIRTUAL_MANIFEST_ID}`;

export interface ContentPluginOptions {
  /** Thư mục nội dung, tương đối so với gốc dự án. Mặc định: `content`. */
  readonly contentDir?: string;
}

/**
 * Sinh mã của module ảo `virtual:content-manifest`.
 *
 * - `manifest`: cây môn → chương → bài (chỉ metadata, rất nhẹ).
 * - `lessonModules`: bộ nạp lazy cho từng bài. Chỉ các bài có trong manifest được
 *   `import()`, nên bài `draft/review/approved` không bao giờ lọt vào bản production.
 * - `contentDiagnostics`: kết quả kiểm định kỹ thuật cho `/dev/preview` (rỗng ở bản production).
 */
export function generateManifestModule(
  manifest: ContentManifest,
  diagnostics: ContentDiagnostics = { issues: [], lessons: [] },
): string {
  const loaders = manifest.subjects
    .flatMap((subject) => subject.chapters)
    .flatMap((chapter) => chapter.lessons)
    .map(
      (lesson) => `  ${JSON.stringify(lesson.id)}: () => import(${JSON.stringify(lesson.file)})`,
    );

  return [
    `export const manifest = ${JSON.stringify(manifest)};`,
    `export const lessonModules = {\n${loaders.join(',\n')}\n};`,
    `export const contentDiagnostics = ${JSON.stringify(diagnostics)};`,
    '',
  ].join('\n');
}

function report(logger: Logger, issues: readonly ContentIssue[]): void {
  const errors = issues.filter((issue) => issue.severity === 'error');
  const warnings = issues.filter((issue) => issue.severity === 'warning');
  if (errors.length > 0) {
    logger.error(`\n[content] Nội dung có lỗi:\n${formatIssues(errors)}\n`);
  }
  if (warnings.length > 0) {
    logger.warn(`\n[content] Cảnh báo nội dung:\n${formatIssues(warnings)}\n`);
  }
}

export function contentPlugin(options: ContentPluginOptions = {}): Plugin {
  let projectRoot = process.cwd();
  let contentDir = path.resolve(projectRoot, options.contentDir ?? 'content');
  let production = false;
  let logger: Logger | null = null;

  const scan = (): ScanResult => {
    const includeDrafts =
      process.env.VERCEL_ENV === 'preview' || process.env.VITE_INCLUDE_DRAFTS === 'true';
    return scanContent({
      projectRoot,
      contentDir,
      publishedOnly: production && !includeDrafts,
    });
  };

  return {
    name: 'learning-universe:content',

    configResolved(config) {
      projectRoot = config.root;
      contentDir = path.resolve(projectRoot, options.contentDir ?? 'content');
      production = config.isProduction;
      logger = config.logger;
    },

    resolveId(id) {
      return id === VIRTUAL_MANIFEST_ID ? RESOLVED_MANIFEST_ID : null;
    },

    load(id) {
      if (id !== RESOLVED_MANIFEST_ID) {
        return null;
      }

      let result = scan();
      if (production && hasErrors(result.issues)) {
        this.error(`Nội dung không hợp lệ, dừng build:\n${formatIssues(result.issues)}`);
      }

      const totalLessonsInManifest = result.manifest.subjects.reduce(
        (sum, subject) =>
          sum + subject.chapters.reduce((cSum, chapter) => cSum + chapter.lessons.length, 0),
        0,
      );
      if (production && totalLessonsInManifest === 0) {
        if (logger) {
          logger.warn(
            '\n[content] Chưa có bài học nào ở trạng thái "published"; giữ các bài học mẫu (draft) trong gói build thử nghiệm.\n',
          );
        }
        result = scanContent({
          projectRoot,
          contentDir,
          publishedOnly: false,
        });
      }

      if (logger) {
        report(logger, result.issues);
      }

      const includeDrafts =
        process.env.VERCEL_ENV === 'preview' || process.env.VITE_INCLUDE_DRAFTS === 'true';
      const diagnostics: ContentDiagnostics =
        !production || includeDrafts
          ? (() => {
              const validated = validateContent({ projectRoot, contentDir });
              return { issues: validated.issues, lessons: validated.lessons };
            })()
          : { issues: [], lessons: [] };

      return generateManifestModule(result.manifest, diagnostics);
    },

    configureServer(server) {
      server.watcher.add(contentDir);

      const normalizedContentDir = contentDir.split(path.sep).join('/');
      const refresh = (file: string): void => {
        const normalized = file.split(path.sep).join('/');
        if (
          !normalized.startsWith(normalizedContentDir) ||
          !/\.(mdx|ya?ml|json)$/i.test(normalized)
        ) {
          return;
        }
        const module = server.moduleGraph.getModuleById(RESOLVED_MANIFEST_ID);
        if (module) {
          server.moduleGraph.invalidateModule(module);
        }
        server.ws.send({ type: 'full-reload' });
      };

      server.watcher.on('add', refresh);
      server.watcher.on('change', refresh);
      server.watcher.on('unlink', refresh);
    },
  };
}
