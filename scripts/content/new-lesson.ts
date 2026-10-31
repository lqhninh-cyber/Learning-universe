import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { SLUG_PATTERN } from '../../schemas/common.ts';
import { parsePrefixedName } from '../../build/content-paths.ts';

interface NewLessonArgs {
  readonly subject?: string;
  readonly chapter?: string;
  readonly slug?: string;
  readonly title?: string;
  readonly id?: string;
  readonly level?: 'basic' | 'intermediate' | 'advanced';
  readonly estimatedMinutes?: number;
}

function parseCliArgs(argv: readonly string[]): NewLessonArgs {
  const result: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (current?.startsWith('--')) {
      const key = current.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        result[key] = next;
        i += 1;
      }
    }
  }

  const levelArg = result.level;
  const level: 'basic' | 'intermediate' | 'advanced' =
    levelArg === 'intermediate' || levelArg === 'advanced' ? levelArg : 'basic';

  const minutesNum = result.minutes ? Number.parseInt(result.minutes, 10) : 45;

  return {
    subject: result.subject,
    chapter: result.chapter,
    slug: result.slug,
    title: result.title,
    id: result.id,
    level,
    estimatedMinutes: Number.isFinite(minutesNum) && minutesNum > 0 ? minutesNum : 45,
  };
}

function computeNextLessonOrder(chapterDir: string): number {
  const entries = readdirSync(chapterDir, { withFileTypes: true });
  let maxOrder = 0;
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.mdx')) {
      const parsed = parsePrefixedName(entry.name);
      if (parsed.order !== null && parsed.order > maxOrder) {
        maxOrder = parsed.order;
      }
    }
  }
  return maxOrder + 1;
}

function buildLessonTemplate(options: {
  readonly id: string;
  readonly title: string;
  readonly level: 'basic' | 'intermediate' | 'advanced';
  readonly estimatedMinutes: number;
  readonly draftedDate: string;
}): string {
  return `---
id: ${options.id}
title: ${JSON.stringify(options.title)}
description: "Mô tả tóm tắt nội dung bài học ${options.title}."
estimatedMinutes: ${options.estimatedMinutes}
level: ${options.level}
prerequisites: []
tags: []
sources: []
status: draft
version: 0.1.0
authoring:
  aiAssisted: false
  tools: []
  draftedAt: "${options.draftedDate}"
---

## 1. Mở đầu và Định nghĩa

Giới thiệu ngữ cảnh toán học của bài học **${options.title}**.

<Definition id="def-${options.id}-1" title="Khái niệm cơ bản">
Phát biểu định nghĩa chính xác tại đây.
</Definition>

## 2. Định lý và Tính chất

<Theorem id="thm-${options.id}-1" title="Tính chất cơ bản">
Phát biểu mệnh đề hoặc định lý liên hệ với <Ref to="def-${options.id}-1" />.
</Theorem>

<Proof of="thm-${options.id}-1">
Trình bày chứng minh chi tiết từng bước.
</Proof>

## 3. Ví dụ và Bài tập

<Example id="ex-${options.id}-1" title="Ví dụ minh họa">
Trình bày ví dụ minh họa cho <Ref to="thm-${options.id}-1" />.
</Example>

<Exercise id="exr-${options.id}-1" title="Bài tập tự luyện">
Phát biểu đề bài tập rèn luyện.
</Exercise>

<Hint>
Gợi ý hướng tiếp cận cho bài tập.
</Hint>

<Solution>
Lời giải chi tiết cho bài tập.
</Solution>

<KeyTakeaways>
- Tóm tắt ý chính thứ nhất từ <Ref to="def-${options.id}-1" />.
- Tóm tắt ý chính thứ hai từ <Ref to="thm-${options.id}-1" />.
</KeyTakeaways>
`;
}

function main(): void {
  const args = parseCliArgs(process.argv.slice(2));
  if (!args.subject || !args.chapter || !args.slug || !args.title) {
    console.error(
      [
        'Cách dùng:',
        '  npm.cmd run content:new -- --subject <thu-muc-mon> --chapter <thu-muc-chuong> --slug <slug-bai> --title "<Tiêu đề bài>" [--id <id-bat-bien>] [--level basic|intermediate|advanced]',
        '',
        'Ví dụ:',
        '  npm.cmd run content:new -- --subject affine-geometry --chapter 01-khong-gian-affine --slug toa-do-affine --title "Tọa độ Affine và Mục tiêu Affine"',
      ].join('\n'),
    );
    process.exitCode = 1;
    return;
  }

  if (!SLUG_PATTERN.test(args.slug)) {
    console.error(
      `[LỖI] Slug "${args.slug}" không hợp lệ: chỉ dùng chữ thường không dấu, số và gạch ngang [a-z0-9-].`,
    );
    process.exitCode = 1;
    return;
  }

  const lessonId = args.id ?? args.slug;
  if (!SLUG_PATTERN.test(lessonId)) {
    console.error(`[LỖI] ID "${lessonId}" không hợp lệ: chỉ dùng [a-z0-9-].`);
    process.exitCode = 1;
    return;
  }

  const projectRoot = process.cwd();
  const chapterDir = path.resolve(projectRoot, 'content', args.subject, args.chapter);
  if (!existsSync(chapterDir)) {
    console.error(`[LỖI] Không tìm thấy thư mục chương: ${chapterDir}`);
    process.exitCode = 1;
    return;
  }

  const nextOrder = computeNextLessonOrder(chapterDir);
  const paddedOrder = String(nextOrder).padStart(2, '0');
  const fileName = `${paddedOrder}-${args.slug}.mdx`;
  const targetPath = path.join(chapterDir, fileName);

  if (existsSync(targetPath)) {
    console.error(`[LỖI] File bài học đã tồn tại: ${targetPath}`);
    process.exitCode = 1;
    return;
  }

  const draftedDate = new Date().toISOString().slice(0, 10);
  const content = buildLessonTemplate({
    id: lessonId,
    title: args.title,
    level: args.level ?? 'basic',
    estimatedMinutes: args.estimatedMinutes ?? 45,
    draftedDate,
  });

  writeFileSync(targetPath, content, 'utf8');
  const relativeTarget = path.relative(projectRoot, targetPath).split(path.sep).join('/');
  console.log(`✔ Đã tạo khung bài học mới: ${relativeTarget} (id: ${lessonId}, status: draft)`);
}

main();
