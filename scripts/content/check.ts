import path from 'node:path';
import {
  formatValidationIssues,
  validateContent,
  type ValidationCategory,
} from '../../build/content-validator.ts';

function parseArgs(argv: readonly string[]): {
  readonly json: boolean;
  readonly strictWarnings: boolean;
  readonly contentDir?: string;
  readonly lockFilePath?: string;
} {
  let json = false;
  let strictWarnings = false;
  let contentDir: string | undefined;
  let lockFilePath: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') {
      json = true;
    } else if (arg === '--strict') {
      strictWarnings = true;
    } else if (arg === '--content-dir' && argv[i + 1]) {
      contentDir = argv[i + 1];
      i += 1;
    } else if (arg === '--lock-file' && argv[i + 1]) {
      lockFilePath = argv[i + 1];
      i += 1;
    }
  }

  return { json, strictWarnings, contentDir, lockFilePath };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const projectRoot = process.cwd();

  const result = validateContent({
    projectRoot,
    contentDir: args.contentDir ? path.resolve(projectRoot, args.contentDir) : undefined,
    lockFilePath: args.lockFilePath ? path.resolve(projectRoot, args.lockFilePath) : undefined,
  });

  const errors = result.issues.filter((item) => item.severity === 'error');
  const warnings = result.issues.filter((item) => item.severity === 'warning');

  if (args.json) {
    console.log(
      JSON.stringify(
        {
          ok: errors.length === 0 && (!args.strictWarnings || warnings.length === 0),
          errorCount: errors.length,
          warningCount: warnings.length,
          lessonCount: result.lessons.length,
          issues: result.issues,
          lessons: result.lessons,
        },
        null,
        2,
      ),
    );
  } else {
    const categories: readonly ValidationCategory[] = [
      'structure',
      'metadata',
      'sources',
      'mdx',
      'latex',
      'references',
      'assets',
      'lock',
    ];

    console.log('==============================================================');
    console.log('  LEARNING UNIVERSE — KIỂM ĐỊNH NỘI DUNG HỌC THUẬT (GĐ4)');
    console.log('==============================================================');
    console.log(
      `Đã quét: ${result.manifest.subjects.length} môn học · ${result.lessons.length} bài học · ${result.manifest.bibliography.length} tài liệu nguồn`,
    );

    const byCategory = categories
      .map((cat) => {
        const catErrors = errors.filter((item) => item.category === cat).length;
        const catWarnings = warnings.filter((item) => item.category === cat).length;
        return `${cat}: ${catErrors} lỗi, ${catWarnings} cảnh báo`;
      })
      .join(' | ');
    console.log(`Phân nhóm: ${byCategory}\n`);

    if (errors.length > 0) {
      console.error(`Phát hiện ${errors.length} lỗi cần khắc phục:\n`);
      console.error(formatValidationIssues(errors));
      console.error('');
    }

    if (warnings.length > 0) {
      console.warn(`Ghi nhận ${warnings.length} cảnh báo:\n`);
      console.warn(formatValidationIssues(warnings));
      console.warn('');
    }

    if (errors.length === 0) {
      console.log('✔ Kiểm định nội dung hoàn tất: Không có lỗi kỹ thuật hoặc vi phạm khóa.');
    }
  }

  if (errors.length > 0 || (args.strictWarnings && warnings.length > 0)) {
    process.exitCode = 1;
  }
}

main();
