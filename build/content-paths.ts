export interface PrefixedName {
  /** Số thứ tự lấy từ tiền tố (`01-nhom` → 1), `null` nếu thiếu tiền tố. */
  readonly order: number | null;
  /** Phần còn lại sau tiền tố và bỏ đuôi `.mdx` (`01-nhom.mdx` → `nhom`). */
  readonly slug: string;
}

/**
 * Tách tiền tố số và slug từ tên thư mục/file theo quy ước `NN-ten-slug`.
 * Tiền tố số quyết định thứ tự hiển thị; phần còn lại là slug URL.
 */
export function parsePrefixedName(name: string): PrefixedName {
  const base = name.replace(/\.mdx$/i, '');
  const match = /^(\d+)-(.+)$/.exec(base);
  if (!match) {
    return { order: null, slug: base };
  }
  return { order: Number.parseInt(match[1] ?? '', 10), slug: match[2] ?? base };
}
