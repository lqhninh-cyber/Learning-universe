import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  computeContentHash,
  validateContent,
  type ContentLockFile,
  type ContentLockLessonEntry,
} from '../../build/content-validator.ts';

function parseApproveArgs(argv: readonly string[]): {
  readonly lessonIds: readonly string[];
  readonly allPublished: boolean;
  readonly contentDir?: string;
  readonly lockFilePath?: string;
} {
  const lessonIds: string[] = [];
  let allPublished = false;
  let contentDir: string | undefined;
  let lockFilePath: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg) continue;
    if (arg === '--all-published') {
      allPublished = true;
    } else if (arg === '--content-dir' && argv[i + 1]) {
      contentDir = argv[i + 1];
      i += 1;
    } else if (arg === '--lock-file' && argv[i + 1]) {
      lockFilePath = argv[i + 1];
      i += 1;
    } else if (!arg.startsWith('--')) {
      lessonIds.push(arg);
    }
  }

  return { lessonIds, allPublished, contentDir, lockFilePath };
}

function main(): void {
  const args = parseApproveArgs(process.argv.slice(2));
  const projectRoot = process.cwd();
  const contentDir = args.contentDir
    ? path.resolve(projectRoot, args.contentDir)
    : path.resolve(projectRoot, 'content');
  const lockFilePath = args.lockFilePath
    ? path.resolve(projectRoot, args.lockFilePath)
    : path.resolve(projectRoot, 'content.lock.json');

  const validation = validateContent({
    projectRoot,
    contentDir,
    lockFilePath,
  });

  // Bỏ qua lỗi thiếu khóa/lệch khóa của chính các bài đang được yêu cầu approve
  const targetLessonSet = new Set<string>(
    args.allPublished
      ? validation.lessons
          .filter((item) => item.status === 'approved' || item.status === 'published')
          .map((item) => item.id)
      : args.lessonIds,
  );

  if (!args.allPublished && targetLessonSet.size === 0) {
    console.error(
      [
        'Cách dùng:',
        '  npm.cmd run content:approve -- <lesson-id> [<lesson-id-2> ...]',
        '  npm.cmd run content:approve -- --all-published',
      ].join('\n'),
    );
    process.exitCode = 1;
    return;
  }

  const blockingErrors = validation.issues.filter(
    (issue) => issue.severity === 'error' && issue.category !== 'lock',
  );
  if (blockingErrors.length > 0) {
    console.error(
      '[LỖI] Không thể phê duyệt khi kho nội dung vẫn còn lỗi kỹ thuật. Hãy chạy npm.cmd run content:check trước.',
    );
    process.exitCode = 1;
    return;
  }

  let existingLock: ContentLockFile = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    lessons: {},
  };

  if (existsSync(lockFilePath)) {
    try {
      const parsed = JSON.parse(readFileSync(lockFilePath, 'utf8')) as ContentLockFile;
      if (parsed && typeof parsed.lessons === 'object') {
        existingLock = parsed;
      }
    } catch {
      // Khởi tạo lại nếu file cũ hỏng
    }
  }

  const updatedLessons: Record<string, ContentLockLessonEntry> = {
    ...existingLock.lessons,
  };

  for (const targetId of targetLessonSet) {
    const summary = validation.lessons.find((item) => item.id === targetId);
    if (!summary) {
      console.error(`[LỖI] Không tìm thấy bài học có id "${targetId}" trong kho nội dung.`);
      process.exitCode = 1;
      return;
    }

    if (summary.status !== 'approved' && summary.status !== 'published') {
      console.error(
        `[LỖI] Bài học "${summary.id}" đang ở trạng thái "${summary.status}". Chỉ khóa được bài có trạng thái "approved" hoặc "published".`,
      );
      process.exitCode = 1;
      return;
    }

    const absoluteFile = path.resolve(projectRoot, summary.file);
    const rawContent = readFileSync(absoluteFile, 'utf8');
    const sha256 = computeContentHash(rawContent);

    const numberedBlocks: Record<string, string> = {};
    for (const block of summary.blocks) {
      if (block.id) {
        numberedBlocks[block.id] = block.number;
      }
    }

    updatedLessons[summary.id] = {
      path: summary.file,
      status: summary.status,
      version: summary.version,
      sha256,
      numberedBlocks,
    };

    console.log(
      `✔ Đã khóa mã băm SHA-256 cho bài "${summary.id}" (${summary.status}, v${summary.version}): ${sha256.slice(0, 12)}...`,
    );
  }

  const nextLock: ContentLockFile = {
    schemaVersion: 1,
    updatedAt: new Date().toISOString(),
    lessons: updatedLessons,
  };

  writeFileSync(lockFilePath, `${JSON.stringify(nextLock, null, 2)}\n`, 'utf8');
  console.log(
    `✔ Đã cập nhật ${path.relative(projectRoot, lockFilePath)} (${Object.keys(updatedLessons).length} bài được khóa).`,
  );
}

main();
