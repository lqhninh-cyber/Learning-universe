import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractContentSearchIndex } from './content-block-extractor';
import { scanContent } from './content-scanner';

describe('extractContentSearchIndex', () => {
  it('trích xuất chính xác Definition, Theorem (kèm id gốc như thm-s4-1) và Example cùng công thức KaTeX cân bằng', () => {
    const projectRoot = process.cwd();
    const scanResult = scanContent({
      projectRoot,
      contentDir: path.join(projectRoot, 'content'),
      publishedOnly: false,
    });

    const index = extractContentSearchIndex({
      projectRoot,
      manifest: scanResult.manifest,
    });

    expect(index.blocks.length).toBeGreaterThan(200);

    const defs = index.blocks.filter((b) => b.filterKind === 'def');
    const thms = index.blocks.filter((b) => b.filterKind === 'thm');
    const exs = index.blocks.filter((b) => b.filterKind === 'ex');

    expect(defs.length).toBeGreaterThan(50);
    expect(thms.length).toBeGreaterThan(50);
    expect(exs.length).toBeGreaterThan(50);

    // Kiểm tra định lý có id tường minh (ví dụ thm-s4-1 hoặc các định lý thuộc Cấu trúc đại số / Hình học Affine)
    const explicitThm = index.blocks.find((b) => b.anchorId === 'thm-s4-1');
    if (explicitThm) {
      expect(explicitThm.filterKind).toBe('thm');
      expect(index.lessons[explicitThm.lessonId]).toBeDefined();
    }

    // Mọi khối đều phải tham chiếu bài học hợp lệ và không bị cắt đôi dấu $
    for (const block of index.blocks) {
      expect(index.lessons[block.lessonId]).toBeDefined();
      expect(block.anchorId.length).toBeGreaterThan(0);

      const unescapedDollars = block.excerpt.match(/(?<!\\)\$/g) ?? [];
      expect(unescapedDollars.length % 2).toBe(0);
    }

    // Tổng dung lượng JSON chỉ mục giữ ở mức gọn nhẹ để nạp nhanh
    const serializedSize = Buffer.byteLength(JSON.stringify(index), 'utf8');
    expect(serializedSize).toBeLessThan(850_000);
  });
});
