/**
 * Tiện ích xử lý tiếng Việt chuẩn xác theo giải phẫu học chữ Quốc ngữ & Unicode Standard.
 * Hỗ trợ chuẩn hóa NFC, tìm kiếm phi dấu (accent-insensitive) và cắt chuỗi an toàn theo Grapheme Cluster.
 */

/**
 * Chuẩn hóa chuỗi văn bản về Unicode Normalization Form C (NFC).
 * Đảm bảo các ký tự có dấu tổ hợp (NFD) được kết hợp thành ký tự dựng sẵn precomposed.
 */
export function normalizeNFC(input: string): string {
  if (!input) {
    return '';
  }
  return input.normalize('NFC');
}

/**
 * Tách dấu thanh điệu và dấu phụ chữ Quốc ngữ (accent-stripping)
 * 1. Chuyển sang NFD để tách các dấu tổ hợp.
 * 2. Xóa các ký tự kết hợp trong dải Unicode [\u0300-\u036f].
 * 3. Thay thế ký tự đ/Đ tường minh thành d/D.
 */
export function stripDiacritics(input: string): string {
  if (!input) {
    return '';
  }
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Chuẩn hóa chuỗi tiếng Việt để phục vụ tìm kiếm phi dấu (accent-insensitive)
 * và không phân biệt hoa thường.
 */
export function normalizeSearchQuery(input: string): string {
  if (!input) {
    return '';
  }
  return stripDiacritics(input).toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Tương thích ngược với hàm normalizeVietnamese trước đây.
 */
export const normalizeVietnamese = normalizeSearchQuery;

/**
 * Kiểm tra chuỗi `target` có chứa toàn bộ token trong `query` (không phân biệt dấu và hoa thường).
 */
export function matchesVietnameseQuery(target: string, query: string): boolean {
  const normalizedQuery = normalizeSearchQuery(query);
  if (!normalizedQuery) {
    return true;
  }
  const normalizedTarget = normalizeSearchQuery(target);
  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return tokens.every((token) => normalizedTarget.includes(token));
}

/**
 * Cắt chuỗi an toàn theo Grapheme Cluster tiếng Việt.
 * Tránh việc cắt ngang giữa ký tự cơ sở và dấu phụ tổ hợp (ví dụ: a + ̂ + ́ -> ấ).
 * Sử dụng Intl.Segmenter nếu môi trường hỗ trợ, fallback an toàn sang Array.from.
 */
export function truncateGraphemes(
  text: string,
  maxGraphemes: number,
  suffix: string = '...',
): string {
  if (!text) {
    return '';
  }
  if (maxGraphemes <= 0) {
    return '';
  }

  const normalized = normalizeNFC(text);

  let graphemes: string[];
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    // TypeScript type-safe invocation for Intl.Segmenter
    const SegmenterCtor = (
      Intl as unknown as {
        Segmenter: new (
          locale: string,
          options: { granularity: 'grapheme' | 'word' | 'sentence' },
        ) => {
          segment(input: string): Iterable<{ segment: string; index: number }>;
        };
      }
    ).Segmenter;

    const segmenter = new SegmenterCtor('vi', { granularity: 'grapheme' });
    graphemes = Array.from(segmenter.segment(normalized), (s) => s.segment);
  } else {
    // Fallback cho môi trường không hỗ trợ Intl.Segmenter
    graphemes = Array.from(normalized);
  }

  if (graphemes.length <= maxGraphemes) {
    return normalized;
  }

  return graphemes.slice(0, maxGraphemes).join('') + suffix;
}
