import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { computeContentHash, validateContent, type ContentLockFile } from './content-validator.ts';

const tempDirs: string[] = [];

function createTempFixtureProject(): string {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'lu-phase4-test-'));
  tempDirs.push(dir);

  const sharedDir = path.join(dir, 'content', '_shared');
  const chapterDir = path.join(dir, 'content', 'test-subject', '01-chuong-mot');
  mkdirSync(sharedDir, { recursive: true });
  mkdirSync(chapterDir, { recursive: true });

  // [DỮ LIỆU KIỂM THỬ] Thư mục tài liệu giả lập dùng cho kiểm thử tự động
  writeFileSync(
    path.join(sharedDir, 'bibliography.yaml'),
    [
      '# [DỮ LIỆU KIỂM THỬ] Nguồn giả lập phục vụ kiểm thử tự động',
      'sources:',
      '  - id: sach-kiem-thu',
      '    type: textbook',
      '    title: "[DỮ LIỆU KIỂM THỬ] Giáo trình kiểm thử"',
      '    authors:',
      '      - "Tác giả Kiểm thử"',
      '    year: 2024',
      '    publisher: "NXB Kiểm thử"',
    ].join('\n'),
    'utf8',
  );

  writeFileSync(
    path.join(sharedDir, 'katex-macros.json'),
    JSON.stringify({ '\\Z': '\\mathbb{Z}', '\\vect': '\\overrightarrow{#1}' }, null, 2),
    'utf8',
  );

  writeFileSync(
    path.join(dir, 'content', 'test-subject', 'subject.yaml'),
    [
      'id: test-subject',
      'title: "[KIỂM THỬ] Môn học kiểm thử"',
      'shortTitle: "KT"',
      'description: "[DỮ LIỆU KIỂM THỬ] Môn học giả lập"',
      'order: 1',
      'status: published',
      'theme:',
      '  hue: 250',
      'sources:',
      '  primary: sach-kiem-thu',
      '  references: []',
    ].join('\n'),
    'utf8',
  );

  writeFileSync(
    path.join(chapterDir, 'chapter.yaml'),
    [
      'id: chuong-mot',
      'title: "[KIỂM THỬ] Chương 1"',
      'description: "[DỮ LIỆU KIỂM THỬ] Mô tả chương 1"',
      'objectives: []',
    ].join('\n'),
    'utf8',
  );

  return dir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
});

describe('Giai đoạn 4 — Bộ kiểm định nội dung học thuật (content:check & content.lock.json)', () => {
  it('1. Kiểm định kho content/ thật của dự án: 0 lỗi kỹ thuật', () => {
    const result = validateContent({ projectRoot: process.cwd() });
    const errors = result.issues.filter((item) => item.severity === 'error');
    expect(errors).toEqual([]);
    expect(result.lessons.length).toBeGreaterThanOrEqual(3);
  }, 45000);

  it('2. Bắt lỗi công thức LaTeX sai cú pháp KaTeX và môi trường tikzcd/newcommand không hỗ trợ', () => {
    const root = createTempFixtureProject();
    const lessonPath = path.join(
      root,
      'content',
      'test-subject',
      '01-chuong-mot',
      '01-bai-loi-latex.mdx',
    );

    writeFileSync(
      lessonPath,
      [
        '---',
        'id: bai-loi-latex',
        'title: "[KIỂM THỬ] Bài lỗi LaTeX"',
        'description: "[DỮ LIỆU KIỂM THỬ]"',
        'estimatedMinutes: 20',
        'level: basic',
        'status: draft',
        'version: 0.1.0',
        '---',
        '',
        'Công thức bị thiếu ngoặc đóng: $\\frac{1}{2$.',
        '',
        '$$',
        '\\begin{tikzcd} A \\arrow[r] & B \\end{tikzcd}',
        '$$',
        '',
        'Định nghĩa macro cục bộ trái phép: $\\newcommand{\\foo}{x}$.',
        '',
        '<KeyTakeaways>Tóm tắt</KeyTakeaways>',
      ].join('\n'),
      'utf8',
    );

    const result = validateContent({ projectRoot: root });
    const latexErrors = result.issues.filter(
      (item) => item.severity === 'error' && item.category === 'latex',
    );

    expect(latexErrors.length).toBe(3);
    expect(latexErrors.some((e) => e.message.includes('KaTeX'))).toBe(true);
    expect(latexErrors.some((e) => e.message.includes('TikZ/tikzcd'))).toBe(true);
    expect(latexErrors.some((e) => e.message.includes('katex-macros.json'))).toBe(true);
  });

  it('3. Bắt lỗi MDX: component ngoài whitelist, thẻ <script>, export tùy ý, import ngoài ./figures/* và thiếu thuộc tính bắt buộc', () => {
    const root = createTempFixtureProject();
    const lessonPath = path.join(
      root,
      'content',
      'test-subject',
      '01-chuong-mot',
      '01-bai-loi-mdx.mdx',
    );

    writeFileSync(
      lessonPath,
      [
        '---',
        'id: bai-loi-mdx',
        'title: "[KIỂM THỬ] Bài lỗi MDX"',
        'description: "[DỮ LIỆU KIỂM THỬ]"',
        'estimatedMinutes: 20',
        'level: basic',
        'status: draft',
        'version: 0.1.0',
        '---',
        '',
        "import BadComp from '../outside/BadComp'",
        'export const secretValue = 42',
        '',
        '<CustomBox>Không nằm trong whitelist</CustomBox>',
        '<script>alert(1)</script>',
        '<Cite />',
        '<Figure>Hình thiếu caption</Figure>',
        '<KeyTakeaways>Tóm tắt</KeyTakeaways>',
      ].join('\n'),
      'utf8',
    );

    const result = validateContent({ projectRoot: root });
    const mdxErrors = result.issues.filter(
      (item) => item.severity === 'error' && item.category === 'mdx',
    );

    expect(mdxErrors.some((e) => e.message.includes('export'))).toBe(true);
    expect(mdxErrors.some((e) => e.message.includes('Import "../outside/BadComp"'))).toBe(true);
    expect(mdxErrors.some((e) => e.message.includes('<CustomBox>'))).toBe(true);
    expect(mdxErrors.some((e) => e.message.includes('<script>'))).toBe(true);
    expect(mdxErrors.some((e) => e.message.includes('<Cite>'))).toBe(true);
    expect(mdxErrors.some((e) => e.message.includes('<Figure>'))).toBe(true);
  });

  it('4. Bắt lỗi Nguồn (sources), Tham chiếu (<Ref to>), Tài nguyên (assets) và trùng ID khối giữa các bài', () => {
    const root = createTempFixtureProject();
    const chapterDir = path.join(root, 'content', 'test-subject', '01-chuong-mot');

    writeFileSync(
      path.join(chapterDir, '01-bai-mot.mdx'),
      [
        '---',
        'id: bai-mot',
        'title: "[KIỂM THỬ] Bài 1"',
        'description: "[DỮ LIỆU KIỂM THỬ]"',
        'estimatedMinutes: 20',
        'level: basic',
        'status: draft',
        'version: 0.1.0',
        '---',
        '',
        "import ChaslesFig from './figures/khong-ton-tai'",
        '',
        '<Theorem id="thm-chung" original="Định lý 3.2">',
        'Định lý có original nhưng thiếu source.',
        '</Theorem>',
        '',
        '<Definition id="def-nguon-la" source="nguon-khong-co-that" page="12">',
        'Nguồn không tồn tại trong bibliography.',
        '</Definition>',
        '',
        'Tham chiếu sai: <Ref to="id-khong-ton-tai" />.',
        '',
        '![Ảnh thiếu](./assets/missing.png)',
        '',
        '<KeyTakeaways>Tóm tắt</KeyTakeaways>',
      ].join('\n'),
      'utf8',
    );

    writeFileSync(
      path.join(chapterDir, '02-bai-hai.mdx'),
      [
        '---',
        'id: bai-hai',
        'title: "[KIỂM THỬ] Bài 2"',
        'description: "[DỮ LIỆU KIỂM THỬ]"',
        'estimatedMinutes: 20',
        'level: basic',
        'status: draft',
        'version: 0.1.0',
        '---',
        '',
        '<Theorem id="thm-chung" title="Trùng ID với bài 1">Nội dung</Theorem>',
        '<KeyTakeaways>Tóm tắt</KeyTakeaways>',
      ].join('\n'),
      'utf8',
    );

    const result = validateContent({ projectRoot: root });
    const errors = result.issues.filter((item) => item.severity === 'error');

    expect(
      errors.some(
        (e) => e.category === 'sources' && e.message.includes('thiếu thuộc tính "source"'),
      ),
    ).toBe(true);
    expect(
      errors.some((e) => e.category === 'sources' && e.message.includes('nguon-khong-co-that')),
    ).toBe(true);
    expect(
      errors.some((e) => e.category === 'references' && e.message.includes('id-khong-ton-tai')),
    ).toBe(true);
    expect(
      errors.some(
        (e) => e.category === 'references' && e.message.includes('bị trùng với khối cùng id'),
      ),
    ).toBe(true);
    expect(
      errors.some((e) => e.category === 'assets' && e.message.includes('./figures/khong-ton-tai')),
    ).toBe(true);
    expect(
      errors.some((e) => e.category === 'assets' && e.message.includes('./assets/missing.png')),
    ).toBe(true);
  });

  it('5. Bảo vệ nội dung đã duyệt bằng content.lock.json: phát hiện bài published chưa khóa và bài bị sửa trái phép', () => {
    const root = createTempFixtureProject();
    const lessonPath = path.join(
      root,
      'content',
      'test-subject',
      '01-chuong-mot',
      '01-bai-da-duyet.mdx',
    );

    const validPublishedMdx = [
      '---',
      'id: bai-da-duyet',
      'title: "[KIỂM THỬ] Bài học đã xuất bản"',
      'description: "[DỮ LIỆU KIỂM THỬ]"',
      'estimatedMinutes: 25',
      'level: basic',
      'sources:',
      '  - source: sach-kiem-thu',
      '    pages: "10-12"',
      'status: published',
      'version: 1.0.0',
      '---',
      '',
      '<Definition id="def-goc" title="Định nghĩa chuẩn" source="sach-kiem-thu" page="10">',
      'Nội dung đã được phê duyệt học thuật.',
      '</Definition>',
      '',
      '<KeyTakeaways>Tóm tắt</KeyTakeaways>',
    ].join('\n');

    writeFileSync(lessonPath, validPublishedMdx, 'utf8');

    // Trường hợp A: Chưa có trong content.lock.json -> báo lỗi lock
    const resultUnlocked = validateContent({ projectRoot: root });
    expect(
      resultUnlocked.issues.some(
        (e) =>
          e.severity === 'error' && e.category === 'lock' && e.message.includes('chưa được khóa'),
      ),
    ).toBe(true);

    // Trường hợp B: Khóa đúng mã băm SHA-256 -> 0 lỗi
    const correctHash = computeContentHash(validPublishedMdx);
    const lockData: ContentLockFile = {
      schemaVersion: 1,
      updatedAt: '2026-11-01T00:00:00.000Z',
      lessons: {
        'bai-da-duyet': {
          path: 'content/test-subject/01-chuong-mot/01-bai-da-duyet.mdx',
          status: 'published',
          version: '1.0.0',
          sha256: correctHash,
          numberedBlocks: { 'def-goc': '1.1.1' },
        },
      },
    };
    writeFileSync(path.join(root, 'content.lock.json'), JSON.stringify(lockData, null, 2), 'utf8');

    const resultLocked = validateContent({ projectRoot: root });
    expect(resultLocked.issues.filter((e) => e.severity === 'error')).toEqual([]);
    expect(resultLocked.lessons[0]?.isLocked).toBe(true);

    // Trường hợp C: Sửa 1 chữ trong bài published -> báo lỗi vi phạm khóa
    writeFileSync(
      lessonPath,
      validPublishedMdx.replace(
        'Nội dung đã được phê duyệt học thuật.',
        'Nội dung bị tự ý chỉnh sửa.',
      ),
      'utf8',
    );
    const resultTampered = validateContent({ projectRoot: root });
    expect(
      resultTampered.issues.some(
        (e) =>
          e.severity === 'error' &&
          e.category === 'lock' &&
          e.message.includes('đã bị thay đổi so với mã băm trong content.lock.json'),
      ),
    ).toBe(true);
  });
});
