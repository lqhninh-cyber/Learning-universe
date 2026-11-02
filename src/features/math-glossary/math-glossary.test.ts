import { describe, expect, it } from 'vitest';
import { getLessonBySlug } from '@/content-runtime';
import {
  getAllGlossaryEntries,
  getGlossaryEntryById,
  MATH_GLOSSARY,
  searchGlossary,
} from '@/data/math-glossary';
import { annotateTextString, matchLatexToGlossary } from './annotator';

describe('Cơ sở dữ liệu Thuật ngữ Toán học (Math Glossary)', () => {
  it('chứa ít nhất 30 thuật ngữ và ký hiệu chuẩn mực', () => {
    expect(MATH_GLOSSARY.length).toBeGreaterThanOrEqual(30);
  });

  it('mọi mục thuật ngữ đều có đầy đủ trường thông tin bắt buộc', () => {
    for (const item of MATH_GLOSSARY) {
      expect(item.id).toBeTruthy();
      expect(item.subject).toMatch(/^(cau-truc-dai-so|hinh-hoc-affine)$/);
      expect(item.patterns.length).toBeGreaterThan(0);
      expect(item.symbol).toBeTruthy();
      expect(item.nameVi).toBeTruthy();
      expect(item.nameEn).toBeTruthy();
      expect(item.brief).toBeTruthy();
      expect(item.intuition).toBeTruthy();
      expect(item.relatedLesson).toMatch(/^\/mon-hoc\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+$/);
    }
  });

  it('mọi liên kết relatedLesson đều trỏ tới bài học thực tế có trong hệ thống', () => {
    for (const item of MATH_GLOSSARY) {
      const parts = item.relatedLesson.split('/').filter(Boolean);
      // /mon-hoc/:subjectSlug/:chapterSlug/:lessonSlug
      expect(parts.length).toBe(4);
      expect(parts[0]).toBe('mon-hoc');
      const subjectSlug = parts[1] ?? '';
      const chapterSlug = parts[2] ?? '';
      const lessonSlug = parts[3] ?? '';
      const found = getLessonBySlug(subjectSlug, chapterSlug, lessonSlug);
      expect(
        found,
        `Thuật ngữ "${item.id}" có relatedLesson "${item.relatedLesson}" không tìm thấy trong manifest`,
      ).toBeDefined();
    }
  });

  it('tìm kiếm chính xác theo ID', () => {
    const v4 = getGlossaryEntryById('v4');
    expect(v4).toBeDefined();
    expect(v4?.nameVi).toBe('Nhóm bốn Klein');
    expect(v4?.symbol).toBe('V_4');

    const affine = getGlossaryEntryById('khong-gian-afin');
    expect(affine).toBeDefined();
    expect(affine?.nameVi).toBe('Không gian Affine');
  });

  it('tìm kiếm tiếng Việt không phân biệt dấu thanh', () => {
    const resultsNoDiacritics = searchGlossary({ query: 'nhom bon klein' });
    expect(resultsNoDiacritics.some((r) => r.id === 'v4')).toBe(true);

    const resultsWithDiacritics = searchGlossary({ query: 'nhóm bốn Klein' });
    expect(resultsWithDiacritics.some((r) => r.id === 'v4')).toBe(true);

    const affineResults = searchGlossary({ query: 'khong gian afin' });
    expect(affineResults.some((r) => r.id === 'khong-gian-afin')).toBe(true);
  });

  it('tìm kiếm theo ký hiệu TeX', () => {
    const congResults = searchGlossary({ query: '\\cong' });
    expect(congResults.some((r) => r.id === 'dang-cau')).toBe(true);

    const v4Results = searchGlossary({ query: 'V_4' });
    expect(v4Results.some((r) => r.id === 'v4')).toBe(true);
  });

  it('lọc thuật ngữ theo môn học chính xác', () => {
    const all = getAllGlossaryEntries();
    const algebraOnly = searchGlossary({ subject: 'cau-truc-dai-so' });
    const affineOnly = searchGlossary({ subject: 'hinh-hoc-affine' });

    expect(algebraOnly.length + affineOnly.length).toBe(all.length);
    expect(algebraOnly.every((e) => e.subject === 'cau-truc-dai-so')).toBe(true);
    expect(affineOnly.every((e) => e.subject === 'hinh-hoc-affine')).toBe(true);
  });
});

describe('Bộ nhận diện thuật ngữ tự động (Auto-Annotator)', () => {
  it('khớp chính xác chuỗi TeX với mục từ điển tương ứng', () => {
    expect(matchLatexToGlossary('V_4')?.id).toBe('v4');
    expect(matchLatexToGlossary('\\cong')?.id).toBe('dang-cau');
    expect(matchLatexToGlossary('G \\cong H')?.id).toBe('dang-cau');
    expect(matchLatexToGlossary('H \\unlhd G')?.id).toBe('nhom-con-chuan-tac');
    expect(matchLatexToGlossary('\\ker \\varphi')?.id).toBe('hat-nhan');
    expect(matchLatexToGlossary('\\mathbb{A}^n')?.id).toBe('khong-gian-afin');
  });

  it('bóc tách chuỗi văn bản và chỉ chú thích lần đầu xuất hiện của mỗi thuật ngữ', () => {
    const seen = new Set<string>();
    const claim = (id: string) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    };

    const text =
      'Trong bài này ta nghiên cứu nhóm bốn Klein. Sau đó nhóm bốn Klein tiếp tục xuất hiện.';
    const nodes = annotateTextString(text, claim);

    // Cụm "nhóm bốn Klein" đầu tiên được bọc MathGlossaryTerm, cụm thứ 2 là chuỗi thường
    expect(nodes.length).toBeGreaterThan(1);
    expect(seen.has('v4')).toBe(true);
  });
});
