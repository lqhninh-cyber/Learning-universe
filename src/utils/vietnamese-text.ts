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

const UNICODE_SUB_SUPER_MAP: Readonly<Record<string, string>> = {
  '₀': '_0',
  '₁': '_1',
  '₂': '_2',
  '₃': '_3',
  '₄': '_4',
  '₅': '_5',
  '₆': '_6',
  '₇': '_7',
  '₈': '_8',
  '₉': '_9',
  ᵢ: '_i',
  ⱼ: '_j',
  ₖ: '_k',
  ₘ: '_m',
  ₙ: '_n',
  '⁰': '^0',
  '¹': '^1',
  '²': '^2',
  '³': '^3',
  '⁴': '^4',
  '⁵': '^5',
  '⁶': '^6',
  '⁷': '^7',
  '⁸': '^8',
  '⁹': '^9',
  ⁱ: '^i',
  ⁿ: '^n',
};

const UNICODE_SUB_SUPER_REGEX = /[₀-₉ᵢⱼₖₘₙ⁰¹²³⁴⁵⁶⁷⁸⁹ⁱⁿ]/g;

/**
 * Kiểm tra chuỗi có chứa dấu thanh điệu hoặc ký tự `đ`/`Đ` của tiếng Việt hay không.
 */
export function hasDiacritics(input: string): boolean {
  if (!input) {
    return false;
  }
  if (/[đĐ]/.test(input)) {
    return true;
  }
  return /[\u0300-\u036f]/.test(input.normalize('NFD'));
}

/**
 * Chuẩn hóa ký hiệu toán học LaTeX & Unicode về dạng tra cứu thống nhất
 * (`\mathbb{E}^{4}`, `E^4`, `E⁴` → `E^4`; `\mathbb{Z}_4`, `Z₄` → `Z_4`; `\ker` → `ker`).
 */
export function normalizeMathSymbols(input: string): string {
  if (!input) {
    return '';
  }

  return input
    .replace(UNICODE_SUB_SUPER_REGEX, (ch) => UNICODE_SUB_SUPER_MAP[ch] ?? ch)
    .replace(/\$\$/g, ' ')
    .replace(/\$/g, ' ')
    .replace(/\\(?:left|right)\b/g, '')
    .replace(/\\(?:mathbb|mathbf|mathrm|mathcal|mathfrak|text)\{([^{}]+)\}/g, '$1')
    .replace(/\\([A-Za-z]+)/g, '$1')
    .replace(/_\{([^{}]+)\}/g, '_$1')
    .replace(/\^\{([^{}]+)\}/g, '^$1')
    .replace(/[{}]/g, '')
    .replace(/_{2,}/g, '_')
    .replace(/\^{2,}/g, '^')
    .replace(/([_^])\s+/g, '$1')
    .replace(/\s+([_^])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Chuẩn hóa đồng thời văn bản tiếng Việt (bỏ dấu hoặc giữ dấu) và ký hiệu toán học.
 */
export function normalizeMathAndText(input: string, preserveDiacritics = false): string {
  if (!input) {
    return '';
  }
  const mathNormalized = normalizeMathSymbols(normalizeNFC(input));
  const lowered = mathNormalized.toLowerCase().replace(/\s+/g, ' ').trim();
  return preserveDiacritics ? lowered : stripDiacritics(lowered).replace(/\s+/g, ' ').trim();
}

/**
 * Chuyển chuỗi đã chuẩn hóa toán học sang dạng rút gọn bỏ dấu `_` và `^`
 * (`s_3` → `s3`, `e^4` → `e4`) phục vụ khớp ký hiệu không cần gõ dấu mũ/chỉ số.
 */
export function toCompactMathText(input: string): string {
  return normalizeMathAndText(input, false).replace(/[_^]/g, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesCompactMathToken(compactTarget: string, compactToken: string): boolean {
  if (!compactToken) {
    return false;
  }
  const pattern = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(compactToken)}(?:$|[^a-z0-9])`);
  return pattern.test(compactTarget);
}

export interface TextMatchScore {
  readonly matched: boolean;
  /** Điểm thưởng cao khi khớp đúng dấu tiếng Việt hoặc nguyên cụm có dấu. */
  readonly exactAccentedBonus: number;
  readonly tokenMatchCount: number;
}

/**
 * Chấm điểm mức độ khớp giữa `target` và `query`, hỗ trợ cả tiếng Việt không dấu
 * lẫn ký hiệu toán học (`S_3`, `V_4`, `Z_4`, `E^4`, `ker`), đồng thời ưu tiên
 * kết quả khớp chính xác có dấu lên đầu.
 */
export function scoreTextMatch(target: string, query: string): TextMatchScore {
  const trimmedQuery = normalizeNFC(query).trim();
  if (!trimmedQuery) {
    return { matched: true, exactAccentedBonus: 0, tokenMatchCount: 0 };
  }
  if (!target) {
    return { matched: false, exactAccentedBonus: 0, tokenMatchCount: 0 };
  }

  const targetAccented = normalizeMathAndText(target, true);
  const targetUnaccented = normalizeMathAndText(target, false);
  const compactTarget = targetUnaccented.replace(/[_^]/g, '');

  const queryAccented = normalizeMathAndText(trimmedQuery, true);
  const queryUnaccented = normalizeMathAndText(trimmedQuery, false);

  const accentedTokens = queryAccented.split(' ').filter(Boolean);
  const unaccentedTokens = queryUnaccented.split(' ').filter(Boolean);

  if (unaccentedTokens.length === 0) {
    return { matched: true, exactAccentedBonus: 0, tokenMatchCount: 0 };
  }

  let exactAccentedBonus = 0;
  let tokenMatchCount = 0;

  for (let i = 0; i < unaccentedTokens.length; i += 1) {
    const rawToken = unaccentedTokens[i] ?? '';
    const accentedToken = accentedTokens[i] ?? rawToken;
    const isCompactCandidate = /[0-9_^]/.test(rawToken);
    const compactToken = rawToken.replace(/[_^]/g, '');

    const matchedUnaccented =
      targetUnaccented.includes(rawToken) ||
      (isCompactCandidate && matchesCompactMathToken(compactTarget, compactToken));

    if (!matchedUnaccented) {
      return { matched: false, exactAccentedBonus: 0, tokenMatchCount: 0 };
    }

    tokenMatchCount += 1;

    if (accentedToken && targetAccented.includes(accentedToken)) {
      exactAccentedBonus += hasDiacritics(accentedToken) ? 28 : 8;
    }

    // Thưởng thêm nếu khớp đúng ranh giới từ (hữu ích với `ker`, `S_3`, `nhóm`, ...)
    const boundaryPattern = new RegExp(
      `(?:^|[^a-z0-9\\u00C0-\\u1EF9])${escapeRegExp(rawToken)}(?:$|[^a-z0-9\\u00C0-\\u1EF9])`,
    );
    if (boundaryPattern.test(targetUnaccented)) {
      exactAccentedBonus += 6;
    }
  }

  if (queryAccented.length >= 2 && targetAccented.includes(queryAccented)) {
    exactAccentedBonus += hasDiacritics(queryAccented) ? 55 : 22;
  } else if (queryUnaccented.length >= 2 && targetUnaccented.includes(queryUnaccented)) {
    exactAccentedBonus += 14;
  }

  return {
    matched: true,
    exactAccentedBonus,
    tokenMatchCount,
  };
}

interface CharSpanIndex {
  readonly normalizedText: string;
  readonly spanStarts: readonly number[];
  readonly spanEnds: readonly number[];
}

function buildCharSpanIndex(text: string): CharSpanIndex {
  const chars: string[] = [];
  const spanStarts: number[] = [];
  const spanEnds: number[] = [];

  for (let i = 0; i < text.length;) {
    const codePoint = text.codePointAt(i) ?? text.charCodeAt(i);
    const firstUnitLen = codePoint > 0xffff ? 2 : 1;
    let end = i + firstUnitLen;

    // Gộp các dấu tổ hợp (nếu đầu vào ở dạng NFD) vào cùng cụm ký tự gốc
    while (end < text.length && /[\u0300-\u036f]/.test(text[end] ?? '')) {
      end += 1;
    }

    const cluster = text.slice(i, end);
    const mapped = UNICODE_SUB_SUPER_MAP[cluster] ?? stripDiacritics(cluster).toLowerCase();

    for (const ch of mapped) {
      chars.push(ch);
      spanStarts.push(i);
      spanEnds.push(end);
    }

    i = end;
  }

  return {
    normalizedText: chars.join(''),
    spanStarts,
    spanEnds,
  };
}

export interface FindHighlightRangesOptions {
  /** Khi `true`, chỉ khớp nguyên cụm liên tiếp mà không tách lẻ từng từ. */
  readonly phraseOnly?: boolean;
}

/**
 * Tìm tất cả khoảng vị trí `[start, end]` trong chuỗi gốc `text` khớp với `query`
 * (hỗ trợ khớp tiếng Việt không dấu nhưng vẫn ánh xạ đúng chỉ số ký tự có dấu).
 */
export function findHighlightRanges(
  text: string,
  query: string,
  options: FindHighlightRangesOptions = {},
): Array<[number, number]> {
  if (!text || !query.trim()) {
    return [];
  }

  const normalizedQuery = normalizeMathAndText(query, false);
  if (!normalizedQuery) {
    return [];
  }

  const { normalizedText, spanStarts, spanEnds } = buildCharSpanIndex(text);
  const splitTokens = normalizedQuery.split(' ').filter(Boolean);
  const isWordChar = (ch: string | undefined): boolean => Boolean(ch && /[a-z0-9]/.test(ch));

  const collectTermMatches = (term: string, out: Array<[number, number]>): number => {
    let hitCount = 0;
    const requireWordBoundary = term.length <= 2;

    let from = 0;
    while (from < normalizedText.length) {
      const idx = normalizedText.indexOf(term, from);
      if (idx === -1) {
        break;
      }
      const prevCh = normalizedText[idx - 1];
      const nextCh = normalizedText[idx + term.length];
      if (!requireWordBoundary || (!isWordChar(prevCh) && !isWordChar(nextCh))) {
        const start = spanStarts[idx];
        const end = spanEnds[idx + term.length - 1];
        if (start !== undefined && end !== undefined) {
          out.push([start, end]);
          hitCount += 1;
        }
      }
      from = idx + Math.max(1, term.length);
    }

    if (/[_^]/.test(term)) {
      const strippedTerm = term.replace(/[_^]/g, '');
      const requireStrippedBoundary = strippedTerm.length <= 2;
      if (strippedTerm.length >= 2 && strippedTerm !== term) {
        let sFrom = 0;
        while (sFrom < normalizedText.length) {
          const idx = normalizedText.indexOf(strippedTerm, sFrom);
          if (idx === -1) {
            break;
          }
          const prevCh = normalizedText[idx - 1];
          const nextCh = normalizedText[idx + strippedTerm.length];
          if (!requireStrippedBoundary || (!isWordChar(prevCh) && !isWordChar(nextCh))) {
            const start = spanStarts[idx];
            const end = spanEnds[idx + strippedTerm.length - 1];
            if (start !== undefined && end !== undefined) {
              out.push([start, end]);
              hitCount += 1;
            }
          }
          sFrom = idx + Math.max(1, strippedTerm.length);
        }
      }
    }

    return hitCount;
  };

  const rawRanges: Array<[number, number]> = [];

  // Ưu tiên khớp nguyên cụm truy vấn; chỉ tách từng token khi nguyên cụm không xuất hiện
  const phraseHits = collectTermMatches(normalizedQuery, rawRanges);
  if (phraseHits === 0 && splitTokens.length > 1 && !options.phraseOnly) {
    const uniqueTokens = Array.from(new Set(splitTokens)).sort((a, b) => b.length - a.length);
    for (const token of uniqueTokens) {
      collectTermMatches(token, rawRanges);
    }
  }

  if (rawRanges.length === 0) {
    return [];
  }

  rawRanges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
  const merged: Array<[number, number]> = [];
  for (const [start, end] of rawRanges) {
    const prev = merged.at(-1);
    if (prev && start <= prev[1]) {
      prev[1] = Math.max(prev[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  return merged;
}

/** Tách các đoạn công thức inline `$...$` để không cắt đôi KaTeX khi trích đoạn. */
function findMathSpans(text: string): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  let inMath = false;
  let mathStart = -1;

  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === '\\') {
      i += 1;
      continue;
    }
    if (text[i] === '$') {
      if (!inMath) {
        inMath = true;
        mathStart = i;
      } else {
        spans.push([mathStart, i + 1]);
        inMath = false;
        mathStart = -1;
      }
    }
  }

  return spans;
}

/**
 * Trích đoạn văn bản dài quanh vị trí khớp đầu tiên của `query`, luôn căn chỉnh ranh giới
 * bên ngoài cặp `$...$` để không bao giờ phá vỡ công thức KaTeX.
 */
export function extractBestExcerpt(text: string, query: string, maxLength: number = 210): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (!clean) {
    return '';
  }
  if (clean.length <= maxLength) {
    return clean;
  }

  const mathSpans = findMathSpans(clean);
  const { normalizedText, spanStarts } = buildCharSpanIndex(clean);
  const queryNorm = normalizeMathAndText(query, false);
  const tokens = queryNorm.split(' ').filter(Boolean);

  let anchorIndex = 0;
  if (tokens.length > 0) {
    const phraseIdx = queryNorm.length >= 2 ? normalizedText.indexOf(queryNorm) : -1;
    const hitIdx = phraseIdx !== -1 ? phraseIdx : normalizedText.indexOf(tokens[0] ?? '');
    if (hitIdx !== -1 && spanStarts[hitIdx] !== undefined) {
      anchorIndex = spanStarts[hitIdx];
    }
  }

  let start = Math.max(0, anchorIndex - Math.floor(maxLength * 0.35));
  let end = Math.min(clean.length, start + maxLength);
  if (end - start < maxLength && start > 0) {
    start = Math.max(0, end - maxLength);
  }

  // Đẩy start / end ra khỏi mọi cặp `$...$`
  for (const [mStart, mEnd] of mathSpans) {
    if (start > mStart && start < mEnd) {
      start = mStart;
    }
    if (end > mStart && end < mEnd) {
      end = end - mStart < (mEnd - mStart) / 2 ? mStart : mEnd;
    }
  }

  // Căn theo ranh giới khoảng trắng nếu cắt giữa từ (và không nằm ngay mép công thức)
  if (start > 0) {
    const nextSpace = clean.indexOf(' ', start);
    if (nextSpace !== -1 && nextSpace < start + 24) {
      start = nextSpace + 1;
    }
  }
  if (end < clean.length) {
    const prevSpace = clean.lastIndexOf(' ', end);
    if (prevSpace > start + Math.floor(maxLength * 0.45)) {
      end = prevSpace;
    }
  }

  // Kiểm tra lần cuối đảm bảo không cắt ngang `$...$` sau khi snap khoảng trắng
  for (const [mStart, mEnd] of mathSpans) {
    if (start > mStart && start < mEnd) {
      start = mStart;
    }
    if (end > mStart && end < mEnd) {
      end = mStart;
    }
  }

  const slice = clean.slice(start, end).trim();
  const prefix = start > 0 ? '…' : '';
  const suffix = end < clean.length ? '…' : '';
  return `${prefix}${slice}${suffix}`;
}
