/**
 * Chuẩn hóa chuỗi tiếng Việt về chữ thường không dấu để phục vụ tìm kiếm
 * (cho phép người dùng gõ có dấu hoặc không dấu đều khớp kết quả).
 */
export function normalizeVietnamese(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Kiểm tra chuỗi `target` có chứa toàn bộ các từ khóa trong `query` (không phân biệt dấu).
 */
export function matchesVietnameseQuery(target: string, query: string): boolean {
  const normalizedQuery = normalizeVietnamese(query);
  if (!normalizedQuery) {
    return true;
  }
  const normalizedTarget = normalizeVietnamese(target);
  const tokens = normalizedQuery.split(' ').filter(Boolean);
  return tokens.every((token) => normalizedTarget.includes(token));
}
