/**
 * Bộ nhận diện và chuẩn hóa ký hiệu Toán học thông minh cho trình Soạn Đề Toán.
 * - Bảo toàn 100% các đoạn LaTeX chuẩn người dùng đã bọc trong `$ ... $` hoặc `$$ ... $$`.
 * - Tuyệt đối không bao giờ lồng kép `$...$` bên trong `$...$`.
 * - Với phần văn bản ngoài `$ ... $`, tự động nhận diện cú pháp gõ tắt thân thiện
 *   (vec(AB), goc(ABC), can(2), phan(a,b), tp(a,b,f), <=, >=, !=, <=>, =>, oo, in R/Z/N*,
 *   cũng như các biểu thức phổ biến như f(x) = x^3 - 12x - 8, log_3(2x-1) = 2, u_1 = 4)
 *   để biên ra công thức KaTeX chuẩn xác ngay lập tức.
 */

const LATEX_SEGMENT_REGEX = /(\$\$[\s\S]+?\$\$|(?<!\\)\$[^$\n]+?\$)/g;

/**
 * Chỉ áp dụng hàm biến đổi trên các đoạn văn bản nằm NGOÀI cặp `$...$` / `$$...$$`,
 * đảm bảo không bao giờ chèn dấu `$` lồng nhau gây vỡ KaTeX.
 */
function mapOutsideLatex(text: string, transformPlain: (chunk: string) => string): string {
  return text
    .split(LATEX_SEGMENT_REGEX)
    .map((part) => {
      if (
        (part.startsWith('$$') && part.endsWith('$$')) ||
        (part.startsWith('$') && part.endsWith('$'))
      ) {
        return part;
      }
      return transformPlain(part);
    })
    .join('');
}

function transformPlainTextSegment(segment: string): string {
  if (!segment.trim()) return segment;

  // Bước 1: Các hàm gõ tắt tiếng Việt & toán học trực quan
  let out = segment
    .replace(
      /\b(?:phan|frac)\(\s*([^,()]+?)\s*,\s*([^()]+?)\s*\)/gi,
      (_m, num: string, den: string) => `$\\frac{${num.trim()}}{${den.trim()}}$`,
    )
    .replace(
      /\btp\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*,\s*([^()]+?)\s*\)/gi,
      (_m, low: string, high: string, body: string) =>
        `$\\int_{${low.trim()}}^{${high.trim()}} ${body.trim()}\\,\\mathrm{d}x$`,
    )
    .replace(
      /\b(?:vec|vecto)\(\s*([A-Za-z0-9'_,]+)\s*\)/gi,
      (_m, inner: string) => `$\\overrightarrow{${inner.trim()}}$`,
    )
    .replace(
      /\bgoc\(\s*([A-Za-z0-9']+?)\s*\)/gi,
      (_m, inner: string) => `$\\widehat{${inner.trim()}}$`,
    )
    .replace(
      /\b(?:can|sqrt)\(\s*([^()]+?)\s*\)/gi,
      (_m, inner: string) => `$\\sqrt{${inner.trim()}}$`,
    );

  // Bước 2: Tập số chuẩn kèm ký hiệu thuộc: "x in R", "k in Z", "n in N*"
  out = mapOutsideLatex(out, (chunk) =>
    chunk.replace(
      /\b([a-zA-Z])\s+in\s+(N\*|R|Z|Q|C)\b/g,
      (_m, variable: string, setSymbol: string) => {
        const mappedSet = setSymbol === 'N*' ? '\\mathbb{N}^*' : `\\mathbb{${setSymbol}}`;
        return `$${variable} \\in ${mappedSet}$`;
      },
    ),
  );

  // Bước 3: Các ký hiệu so sánh / suy luận gõ tắt đứng giữa khoảng trắng & độ
  out = mapOutsideLatex(out, (chunk) =>
    chunk
      .replace(/(?<=\s)<=>?(?=\s)/g, (m) => (m === '<=>' ? '$\\Leftrightarrow$' : '$\\le$'))
      .replace(/(?<=\s)=>(?=\s)/g, '$\\Rightarrow$')
      .replace(/(?<=\s)<=(?=\s)/g, '$\\le$')
      .replace(/(?<=\s)>=(?=\s)/g, '$\\ge$')
      .replace(/(?<=\s)!=(?=\s)/g, '$\\neq$')
      .replace(/(?<=\s)\+-(?=\s)/g, '$\\pm$')
      .replace(/(^|\s)\+oo(?=\s|[.,;)\]]|$)/g, '$1$+\\infty$')
      .replace(/(^|\s)-oo(?=\s|[.,;)\]]|$)/g, '$1$-\\infty$')
      .replace(/(^|\s)oo(?=\s|[.,;)\]]|$)/g, '$1$\\infty$')
      .replace(/\b(\d+)\s*deg\b/gi, (_m, deg: string) => `$${deg}^\\circ$`),
  );

  // Bước 4: Các hàm logarit chưa bọc $: log_3(2x-1) = 2
  out = mapOutsideLatex(out, (chunk) =>
    chunk.replace(
      /\b(log|ln)_([A-Za-z0-9]+)\(([^()\n]{1,30})\)(?:\s*([=<>]|\\le|\\ge)\s*([-+A-Za-z0-9/]+))?/g,
      (match) => `$${match}$`,
    ),
  );

  // Bước 5: Biểu thức hàm số nguyên vẹn: f(x) = x^3 - 12x - 8, y = x^2 + 1, u_1 = 4
  out = mapOutsideLatex(out, (chunk) =>
    chunk.replace(
      /\b([fghy]\([a-zA-Z]\)|[a-zA-Z]_[A-Za-z0-9]+)\s*=\s*([-+]?(?:[0-9]*[a-zA-Z](?:\^[0-9a-zA-Z{}]+)?|[0-9]+)(?:\s*[+-]\s*(?:[0-9]*[a-zA-Z](?:\^[0-9a-zA-Z{}]+)?|[0-9]+))*)/g,
      (match) => `$${match}$`,
    ),
  );

  // Bước 6: Các biến có chỉ số dưới hoặc số mũ đứng riêng lẻ ngoài `$...$` (như x^2, u_n, Q_3, 2^{2x+1})
  out = mapOutsideLatex(out, (chunk) =>
    chunk.replace(
      /(?<![A-Za-z0-9\\/$])([A-Za-z0-9]\^(?:\{[^{}\n]+\}|[A-Za-z0-9+-]+)|[A-Za-z]_(?:\{[^{}\n]+\}|[A-Za-z0-9]+))(?![A-Za-z0-9_])/g,
      (match) => `$${match}$`,
    ),
  );

  return out;
}

/**
 * Chuẩn hóa chuỗi văn bản toán học thông minh:
 * - Nếu `enabled === false`, trả về nguyên bản để chỉ biên dịch `$...$` / `$$...$$`.
 * - Nếu `enabled === true`, tự động nhận diện thêm các ký hiệu gõ tắt ngoài `$...$`.
 */
export function normalizeSmartMathText(text: string, enabled = true): string {
  if (!text || !enabled) return text;

  const segments = text.split(LATEX_SEGMENT_REGEX);
  return segments
    .map((segment) => {
      if (
        (segment.startsWith('$$') && segment.endsWith('$$')) ||
        (segment.startsWith('$') && segment.endsWith('$'))
      ) {
        const isDisplay = segment.startsWith('$$');
        const inner = isDisplay ? segment.slice(2, -2) : segment.slice(1, -1);
        const polishedInner = inner
          .replace(/<=>/g, '\\Leftrightarrow ')
          .replace(/=>/g, '\\Rightarrow ')
          .replace(/<=/g, '\\le ')
          .replace(/>=/g, '\\ge ')
          .replace(/!=/g, '\\neq ')
          .replace(/\+-/g, '\\pm ');
        return isDisplay ? `$$${polishedInner}$$` : `$${polishedInner}$`;
      }
      return transformPlainTextSegment(segment);
    })
    .join('');
}

/**
 * Ước lượng độ dài hiển thị trực quan của một phương án A/B/C/D (bỏ bớt lệnh LaTeX như \frac, \overrightarrow)
 * để tự động quyết định dàn 4 cột, 2 cột hay 1 cột chuẩn đề Toán Bộ GD&ĐT.
 */
export function estimateVisualTextLength(content: string): number {
  if (!content) return 0;
  const simplified = content
    .replace(
      /\\(?:overrightarrow|overline|widehat|mathbb|mathrm|text|operatorname)\{([^}]*)\}/g,
      '$1',
    )
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (_m, a: string, b: string) =>
      a.length >= b.length ? `${a} ` : `${b} `,
    )
    .replace(/\\int_\{?[^}\s]*\}?\^\{?[^}\s]*\}?/g, '∫∫')
    .replace(/\\[a-zA-Z]+/g, 'x')
    .replace(/[{}$\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return simplified.length;
}
