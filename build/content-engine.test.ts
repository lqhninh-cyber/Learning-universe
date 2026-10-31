import path from 'node:path';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdx from 'remark-mdx';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { VFile } from 'vfile';
import { describe, expect, it } from 'vitest';
import { bibliographySchema, lessonSchema } from '../schemas';
import { hasErrors, scanContent } from './content-scanner';
import { remarkTheoremNumbering } from './remark-theorem-numbering';

const projectRoot = process.cwd();

describe('Giai đoạn 2 — Build Plugins & Zod Schemas (Scanner + Theorem Numbering)', () => {
  describe('1. Zod Schemas & Quy tắc Academic Integrity', () => {
    it('chặn các giá trị chỗ trống (<...>, TODO, ???) trong bibliographySchema', () => {
      const invalidPlaceholder = bibliographySchema.safeParse({
        sources: [
          {
            id: 'giao-trinh-mau',
            type: 'textbook',
            title: '<Tên giáo trình>',
            authors: ['TODO'],
            year: 2020,
            publisher: '???',
          },
        ],
      });
      expect(invalidPlaceholder.success).toBe(false);
    });

    it('bắt buộc bài học ở trạng thái review trở lên phải có ít nhất một nguồn tham khảo', () => {
      const draftWithoutSource = lessonSchema.safeParse({
        id: 'bai-nhap',
        title: 'Bài nháp',
        description: 'Mô tả bài nháp',
        estimatedMinutes: 30,
        level: 'basic',
        status: 'draft',
        version: '0.1.0',
        sources: [],
      });
      expect(draftWithoutSource.success).toBe(true);

      const publishedWithoutSource = lessonSchema.safeParse({
        id: 'bai-xuat-ban',
        title: 'Bài xuất bản',
        description: 'Mô tả bài xuất bản',
        estimatedMinutes: 30,
        level: 'basic',
        status: 'published',
        version: '1.0.0',
        sources: [],
      });
      expect(publishedWithoutSource.success).toBe(false);
    });
  });

  describe('2. Content Scanner & Lọc bài học theo môi trường', () => {
    const fixtureContentDir = path.resolve(projectRoot, 'tests/fixtures/content');

    it('quét thư mục fixture hợp lệ ở chế độ dev (publishedOnly = false)', () => {
      const result = scanContent({
        projectRoot,
        contentDir: fixtureContentDir,
        publishedOnly: false,
      });

      expect(hasErrors(result.issues)).toBe(false);
      expect(result.manifest.bibliography).toHaveLength(1);
      expect(result.manifest.bibliography[0]?.id).toBe('nguon-kiem-thu');

      const lessons = result.manifest.subjects[0]?.chapters[0]?.lessons ?? [];
      expect(lessons.map((item) => item.id)).toEqual(['bai-kiem-thu', 'bai-nhap-kiem-thu']);
    });

    it('lọc bỏ các bài draft khi ở chế độ production (publishedOnly = true)', () => {
      const result = scanContent({
        projectRoot,
        contentDir: fixtureContentDir,
        publishedOnly: true,
      });

      expect(hasErrors(result.issues)).toBe(false);
      const lessons = result.manifest.subjects[0]?.chapters[0]?.lessons ?? [];
      expect(lessons.map((item) => item.id)).toEqual(['bai-kiem-thu']);
    });
  });

  describe('3. Remark Plugin remark-theorem-numbering (3 bộ đếm độc lập)', () => {
    function runNumberingPlugin(
      mdxSource: string,
      filePath = '/repo/content/sub/02-chuong/03-bai.mdx',
    ) {
      const processor = unified()
        .use(remarkParse)
        .use(remarkFrontmatter)
        .use(remarkMdx)
        .use(remarkTheoremNumbering);

      const file = new VFile({ path: filePath, value: mdxSource });
      const tree = processor.parse(file);
      return processor.runSync(tree, file);
    }

    it('đánh số Chương.Bài.Số với 3 bộ đếm độc lập (theory, example, exercise) và phân giải <Ref />', () => {
      const source = [
        'Tham chiếu sớm tới <Ref to="cor-he-qua" />.',
        '',
        '<Definition id="def-dinh-nghia" title="Định nghĩa A">Nội dung</Definition>',
        '<Theorem id="thm-dinh-ly" title="Định lý B">Nội dung</Theorem>',
        '<Corollary id="cor-he-qua">Nội dung</Corollary>',
        '<Example id="ex-1">Ví dụ 1</Example>',
        '<Counterexample id="cex-2">Phản ví dụ 2</Counterexample>',
        '<Exercise id="exr-1">Bài tập 1</Exercise>',
        '<Proof of="thm-dinh-ly">Chứng minh</Proof>',
      ].join('\n');

      const tree = runNumberingPlugin(source);
      const exportNode = tree.children.at(-1) as { type: string; value?: string } | undefined;
      expect(exportNode?.type).toBe('mdxjsEsm');

      const jsonMatch = /^export const lessonMeta = (.+);$/.exec(exportNode?.value ?? '');
      expect(jsonMatch).not.toBeNull();
      const meta = JSON.parse(jsonMatch?.[1] ?? '{}') as {
        chapterNumber: number;
        lessonNumber: number;
        blocks: Array<{ name: string; number: string; label: string; anchorId: string }>;
      };

      expect(meta.chapterNumber).toBe(2);
      expect(meta.lessonNumber).toBe(3);
      expect(meta.blocks.map((b) => `${b.name}:${b.label}`)).toEqual([
        'Definition:Định nghĩa 2.3.1',
        'Theorem:Định lý 2.3.2',
        'Corollary:Hệ quả 2.3.3',
        'Example:Ví dụ 2.3.1',
        'Counterexample:Phản ví dụ 2.3.2',
        'Exercise:Bài tập 2.3.1',
      ]);
    });

    it('báo lỗi khi tác giả truyền thủ công thuộc tính number hoặc trùng id', () => {
      expect(() => runNumberingPlugin('<Theorem number="1.1.1">Sai quy tắc</Theorem>')).toThrow(
        /không được khai báo thủ công "number"/,
      );

      expect(() =>
        runNumberingPlugin(
          '<Definition id="trung-id">A</Definition>\n<Theorem id="trung-id">B</Theorem>',
        ),
      ).toThrow(/Trùng id\/anchor "trung-id"/);
    });
  });
});
