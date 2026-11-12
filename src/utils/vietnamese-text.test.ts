import { describe, expect, it } from 'vitest';
import {
  extractBestExcerpt,
  findHighlightRanges,
  normalizeMathAndText,
  normalizeSearchQuery,
  scoreTextMatch,
  toCompactMathText,
} from './vietnamese-text';

describe('vietnamese-text utilities', () => {
  it('chuẩn hóa chữ Quốc ngữ NFD/NFC và giữ hoạt động normalizeSearchQuery', () => {
    expect(normalizeSearchQuery('Cấu   trúc   ĐẠI SỐ')).toBe('cau truc dai so');
  });

  it('chuẩn hóa ký hiệu toán học LaTeX và Unicode chỉ số trên/dưới tương đương nhau', () => {
    expect(normalizeMathAndText('$S_3$', false)).toBe('s_3');
    expect(normalizeMathAndText('S₃', false)).toBe('s_3');
    expect(normalizeMathAndText('$\\mathbb{E}^{4}$', false)).toBe('e^4');
    expect(normalizeMathAndText('E⁴', false)).toBe('e^4');
    expect(normalizeMathAndText('$\\mathbb{Z}_4$', false)).toBe('z_4');
    expect(normalizeMathAndText('\\ker(\\varphi)', false)).toBe('ker(varphi)');
    expect(toCompactMathText('$\\mathbb{Z}_4$')).toBe('z4');
  });

  it('khớp được truy vấn không dấu nhưng ưu tiên kết quả khớp chính xác có dấu lên đầu', () => {
    const exactAccented = scoreTextMatch(
      'Siêu phẳng kính và tâm tỉ cự trong không gian',
      'tâm tỉ cự',
    );
    const looseAccented = scoreTextMatch('Tam ti cu (tên biến thể không dấu)', 'tâm tỉ cự');

    expect(exactAccented.matched).toBe(true);
    expect(looseAccented.matched).toBe(true);
    expect(exactAccented.exactAccentedBonus).toBeGreaterThan(looseAccented.exactAccentedBonus);

    expect(scoreTextMatch('Nhóm đối xứng $S_3$ và nhóm Klein $V_4$', 'S_3 V_4').matched).toBe(true);
    expect(scoreTextMatch('Không gian Euclid $\\mathbb{E}^{4}$', 'E^4').matched).toBe(true);
    expect(scoreTextMatch('Không gian xạ ảnh $\\mathbb{A}^n$', 'A^n').matched).toBe(true);
    expect(scoreTextMatch('Nhân đồng cấu $\\ker f$', 'ker').matched).toBe(true);
    expect(scoreTextMatch('Nhóm cyclic $\\mathbb{Z}_4$', 'Z4').matched).toBe(true);
    expect(scoreTextMatch('Chúc bạn học tốt', 'A^n').matched).toBe(false);
  });

  it('tìm đúng khoảng tô sáng chữ có dấu ngay cả khi nhập truy vấn không dấu', () => {
    const text = 'Điểm G là tâm tỉ cự của hệ điểm.';
    const ranges = findHighlightRanges(text, 'tam ti cu');
    expect(ranges.length).toBe(1);
    const [start, end] = ranges[0]!;
    expect(text.slice(start, end)).toBe('tâm tỉ cự');
  });

  it('trích đoạn dài mà không bao giờ cắt đôi cặp $...$ KaTeX', () => {
    const longText =
      'Trong hình học affine, ' +
      'ta xét không gian liên kết với '.repeat(6) +
      'công thức tâm tỉ cự $\\sum_{i=1}^{n} \\alpha_i \\overrightarrow{MA_i} = \\vec{0}$ với tổng hệ số khác không.';
    const excerpt = extractBestExcerpt(longText, 'tâm tỉ cự', 140);
    const unescapedDollars = excerpt.match(/(?<!\\)\$/g) ?? [];
    expect(unescapedDollars.length % 2).toBe(0);
    expect(excerpt).toContain('tâm tỉ cự');
  });
});
