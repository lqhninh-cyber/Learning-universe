import { describe, expect, it } from 'vitest';
import {
  matchesVietnameseQuery,
  normalizeNFC,
  normalizeSearchQuery,
  stripDiacritics,
  truncateGraphemes,
} from './vietnamese-text';

describe('src/utils/vietnamese-text — Tiện ích xử lý tiếng Việt chuẩn xác', () => {
  it('normalizeNFC kết hợp ký tự tổ hợp NFD thành ký tự đơn precomposed', () => {
    // "a" + combining circumflex + combining acute
    const decomposed = 'a\u0302\u0301';
    const precomposed = 'ấ';
    expect(normalizeNFC(decomposed)).toBe(precomposed);
  });

  it('stripDiacritics loại bỏ dấu tiếng Việt chuẩn bao gồm đ/Đ', () => {
    expect(stripDiacritics('Định lý Đồng hình')).toBe('Dinh ly Dong hinh');
    expect(stripDiacritics('Cấu trúc Đại số')).toBe('Cau truc Dai so');
    expect(stripDiacritics('Hình học Affine')).toBe('Hinh hoc Affine');
  });

  it('normalizeSearchQuery chuẩn hóa chữ thường, xóa dấu và khoảng trắng', () => {
    expect(normalizeSearchQuery('   ĐỒNG CẤU   Nhóm   ')).toBe('dong cau nhom');
    expect(normalizeSearchQuery('')).toBe('');
  });

  it('matchesVietnameseQuery tìm kiếm chính xác không phân biệt dấu và hoa thường', () => {
    const target = 'Định lý Cayley về nhóm con của nhóm hoán vị';

    expect(matchesVietnameseQuery(target, 'cayley')).toBe(true);
    expect(matchesVietnameseQuery(target, 'nhom hoan vi')).toBe(true);
    expect(matchesVietnameseQuery(target, 'dinh ly')).toBe(true);
    expect(matchesVietnameseQuery(target, 'DONG DANG')).toBe(false);
  });

  it('truncateGraphemes cắt chuỗi an toàn theo grapheme cluster mà không đứt dấu phụ', () => {
    const text = 'Không gian Affine và các phép biến đổi';

    expect(truncateGraphemes(text, 10)).toBe('Không gian...');
    expect(truncateGraphemes(text, 100)).toBe(text);
    expect(truncateGraphemes('', 5)).toBe('');
    expect(truncateGraphemes(text, 0)).toBe('');

    // Kiểm tra ký tự phức tạp có dấu thanh kép không bị cắt xén nửa chừng
    const complex = 'Ấn tượng';
    expect(truncateGraphemes(complex, 2, '')).toBe('Ấn');
  });
});
