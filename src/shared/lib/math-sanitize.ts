const UNICODE_FRACTION_MAP: Readonly<Record<string, string>> = {
  '½': '\\frac{1}{2}',
  '¼': '\\frac{1}{4}',
  '¾': '\\frac{3}{4}',
  '⅓': '\\frac{1}{3}',
  '⅔': '\\frac{2}{3}',
  '⅕': '\\frac{1}{5}',
  '⅖': '\\frac{2}{5}',
  '⅗': '\\frac{3}{5}',
  '⅘': '\\frac{4}{5}',
  '⅙': '\\frac{1}{6}',
  '⅚': '\\frac{5}{6}',
  '⅛': '\\frac{1}{8}',
  '⅜': '\\frac{3}{8}',
  '⅝': '\\frac{5}{8}',
  '⅞': '\\frac{7}{8}',
};

const UNICODE_FRACTION_RE = /[½¼¾⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/g;

/**
 * Chuẩn hóa chuỗi LaTeX đầu vào trước khi đưa qua `katex.renderToString`:
 * - Chuyển ký hiệu khác `/=` sang `\neq` chuẩn LaTeX.
 * - Sửa lỗi hiệu tập hợp thiếu `\setminus` và dấu ngoặc nhọn (ví dụ `\R \ {1}` → `\R \setminus \{1\}`).
 * - Chuyển phân số Unicode (`½`, `¼`, `¾`, `⅓`, `⅔`, ...) sang `\frac{...}{...}`.
 */
export function sanitizeKatexInput(math: string): string {
  if (!math) return math;

  return math
    .replace(/\/=(?=[A-Za-z])/g, '\\neq ')
    .replace(/\/=/g, '\\neq')
    .replace(/(^|[^\\])\\\s+\\?\{([^}\\]+)\\?\}/g, '$1\\setminus \\{$2\\}')
    .replace(UNICODE_FRACTION_RE, (ch) => UNICODE_FRACTION_MAP[ch] ?? ch);
}
