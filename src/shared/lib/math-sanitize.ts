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

const UNICODE_OPERATOR_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/≤/g, '\\le '],
  [/≥/g, '\\ge '],
  [/≡/g, '\\equiv '],
  [/≈/g, '\\approx '],
  [/⇔/g, '\\iff '],
  [/⇒/g, '\\implies '],
  [/↦/g, '\\mapsto '],
  [/∘/g, '\\circ '],
  [/∩/g, '\\cap '],
  [/∪/g, '\\cup '],
  [/⊂/g, '\\subset '],
  [/⊃/g, '\\supset '],
  [/⊕/g, '\\oplus '],
  [/⊥/g, '\\perp '],
  [/∥/g, '\\parallel '],
  [/∅/g, '\\varnothing '],
  [/∞/g, '\\infty '],
  [/∉/g, '\\notin '],
  [/⊄/g, '\\not\\subset '],
  [/⊅/g, '\\not\\supset '],
  [/⊈/g, '\\nsubseteq '],
  [/⊉/g, '\\nsupseteq '],
  [/∤/g, '\\nmid '],
  [/≢/g, '\\not\\equiv '],
  [/≁/g, '\\nsim '],
  [/∦/g, '\\nparallel '],
  [/≠/g, '\\neq '],
  [/∈/g, '\\in '],
  [/×/g, '\\times '],
  [/±/g, '\\pm '],
  [/−/g, '-'],
  [/′/g, "'"],
  [/″/g, "''"],
  [/ᵀ/g, '^T'],
  [/ᾱ/g, '\\bar{\\alpha}'],
  [/β\u0304/g, '\\bar{\\beta}'],
  [/γ\u0304/g, '\\bar{\\gamma}'],
  [/δ\u0304/g, '\\bar{\\delta}'],
  [/μ/g, '\\mu '],
  [/λ/g, '\\lambda '],
];

const VECTOR_PAIR_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\bP0M\b/g, 'P_0 M'],
  [/\bP0Pi\b/g, 'P_0 P_i'],
  [/\bP0Pj\b/g, 'P_0 P_j'],
  [/\bA0Ai\b/g, 'A_0 A_i'],
  [/\bA0Am\b/g, 'A_0 A_m'],
  [/\bE0Ei\b/g, 'E_0 E_i'],
  [/E'0E'i/g, "E'_0 E'_i"],
  [/\bB0Bj\b/g, 'B_0 B_j'],
  [/\bM1M2\b/g, 'M_1 M_2'],
  [/\bI1I2\b/g, 'I_1 I_2'],
  [/\bIM0\b/g, 'I M_0'],
  [/\bOM0\b/g, 'O M_0'],
  [/\bM0M1\b/g, 'M_0 M_1'],
  [/\bM0M2\b/g, 'M_0 M_2'],
];

const PROTECTED_COMMAND_RE =
  /\\(?:text|textbf|textit|textrm|operatorname|mathrm|mathbf|mathbb|mathcal)\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g;

function normalizeConcatenatedVectorBody(body: string): string {
  let out = body;
  for (const [pattern, replacement] of VECTOR_PAIR_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  // Tổng quát hóa các cặp điểm dạng A0B, A0Bi, AB0, A1B2 bên trong \overrightarrow{...} / \vect{...}
  out = out
    .replace(/\b([A-Z]'?)([0-9]+)([A-Z]'?)([0-9]+|[ijmn])\b/g, '$1_$2 $3_$4')
    .replace(/\b([A-Z]'?)([0-9]+)([A-Z]'?)\b/g, '$1_$2 $3')
    .replace(/\b([A-Z]'?)([A-Z]'?)([0-9]+)\b/g, '$1 $2_$3');
  return out;
}

function findMatchingBrace(input: string, openIndex: number): number {
  let depth = 0;
  for (let i = openIndex; i < input.length; i += 1) {
    if (input[i] === '\\') {
      i += 1;
      continue;
    }
    if (input[i] === '{') {
      depth += 1;
    } else if (input[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }
  return -1;
}

function escapeSpanGroupBraces(input: string): string {
  let result = '';
  let cursor = 0;
  const spanGroupRe = /(?<!\\)\bspan\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = spanGroupRe.exec(input)) !== null) {
    const openBraceIdx = match.index + match[0].length - 1;
    const closeBraceIdx = findMatchingBrace(input, openBraceIdx);
    if (closeBraceIdx === -1) {
      continue;
    }
    result += input.slice(cursor, match.index);
    const inner = input.slice(openBraceIdx + 1, closeBraceIdx);
    result += `\\operatorname{span}\\{${inner}\\}`;
    cursor = closeBraceIdx + 1;
    spanGroupRe.lastIndex = cursor;
  }

  result += input.slice(cursor);
  return result;
}

function escapeSetBuilderBraces(input: string): string {
  let result = '';
  let cursor = 0;
  const setBraceRe = /(?:^|=)\s*\{/g;
  let match: RegExpExecArray | null;

  while ((match = setBraceRe.exec(input)) !== null) {
    const openBraceIdx = match.index + match[0].length - 1;
    const closeBraceIdx = findMatchingBrace(input, openBraceIdx);
    if (closeBraceIdx === -1) {
      continue;
    }
    const inner = input.slice(openBraceIdx + 1, closeBraceIdx);
    const hasTopBar = /(?<!\\)\|/.test(inner);
    const isZeroVecSingleton = inner.trim() === '\\vec{0}';
    if (!hasTopBar && !isZeroVecSingleton) {
      continue;
    }
    const fixedInner = hasTopBar ? inner.replace(/\s*(?<!\\)\|\s*/g, ' \\mid ') : inner;
    result += input.slice(cursor, openBraceIdx);
    result += `\\{${fixedInner}\\}`;
    cursor = closeBraceIdx + 1;
    setBraceRe.lastIndex = cursor;
  }

  result += input.slice(cursor);
  return result;
}

/**
 * Chuẩn hóa chuỗi LaTeX thô trước khi truyền vào KaTeX:
 * - Chuyển các biến thể phủ Unicode & toán tử gạch chéo (`/=`, `=\not`, `=\u0338`, `\in/`, `⊄`, Unicode `≤`, `≥`, `≠`, `∉`, ...) sang LaTeX chuẩn.
 * - Sửa hiệu tập hợp thiếu `\setminus` và ngoặc nhọn (ví dụ `\R \ {1}` → `\R \setminus \{1\}`).
 * - Chuyển phân số Unicode (`½`, `¼`, `¾`, `⅓`, `⅔`, ...) sang `\frac{...}{...}`.
 * - Khôi phục chỉ số dưới trong vectơ (`\overrightarrow{P0Pi}` → `\overrightarrow{P_0 P_i}`) và biến tọa độ (`a0` → `a_0`, `a01` → `a_{01}`, `ai1` → `a_{i1}`, `b0i` → `b_{0i}`).
 * - Sửa ký hiệu chuyển vị ma trận (`[c]*`, `C*`, `B*`, `A'*`, `A*` → `^*`), tên hàm (`span`, `diag`, `dim`, `det`), và vectơ mũi tên dưới chữ (`\underrightarrow{u}`, `u\u20ef` → `\vec{u}`).
 * - Thêm khoảng cách chuẩn trước ngoặc điều kiện phụ (`0(j \neq i)`, `0(A = \operatorname{diag}...)`).
 */
export function sanitizeLatex(raw: string): string {
  if (!raw) return raw;

  let out = raw;

  // 1. Sửa mũi tên dưới chữ (\underrightarrow{...} hoặc ký tự combining arrow dưới U+20EF / U+20D7)
  out = out
    .replace(/\\underrightarrow\{([a-zA-Z])\}/g, '\\vec{$1}')
    .replace(/\\underrightarrow\{([^}]+)\}/g, '\\overrightarrow{$1}')
    .replace(/([a-zA-Z])[\u20EF\u20D7]/g, '\\vec{$1}')
    .replace(/\\vec\{e\}_\{([a-zA-Z0-9])\}/g, '\\vec{e}_$1');

  // 2. Chuẩn hóa dấu khác, không thuộc, không chia hết, không đồng dư, không chứa
  out = out
    .replace(/\\not\s*=/g, '\\neq ')
    .replace(/=\s*\\not\b/g, '\\neq ')
    .replace(/=\u0338/g, '\\neq ')
    .replace(/!=/g, '\\neq ')
    .replace(/\/=(?=[A-Za-z])/g, '\\neq ')
    .replace(/\/=/g, '\\neq ')
    .replace(/\\ne\b(?![a-zA-Z])/g, '\\neq ')
    .replace(/\\in\//g, '\\notin ')
    .replace(/\/\\in\b/g, '\\notin ')
    .replace(/∈\u0338/g, '\\notin ')
    .replace(/\\not\s*\\in\b/g, '\\notin ')
    .replace(/(?<=\s|^)\/\|(?=\s|$)/g, '\\nmid ')
    .replace(/\\not\s*\|/g, '\\nmid ')
    .replace(/\\not\s*\\mid\b/g, '\\nmid ')
    .replace(/[|∣]\u0338/g, '\\nmid ')
    .replace(/\\nequiv\b/g, '\\not\\equiv ')
    .replace(/≡\u0338/g, '\\not\\equiv ')
    .replace(/\\not\s*\\equiv\b/g, '\\not\\equiv ')
    .replace(/\\nsubset\b/g, '\\not\\subset ')
    .replace(/\\subset\//g, '\\not\\subset ')
    .replace(/\/\\subset\b/g, '\\not\\subset ')
    .replace(/⊂\u0338/g, '\\not\\subset ')
    .replace(/\\not\s*\\subset\b/g, '\\not\\subset ')
    .replace(/\\nsupset\b/g, '\\not\\supset ')
    .replace(/\\supset\//g, '\\not\\supset ')
    .replace(/\/\\supset\b/g, '\\not\\supset ')
    .replace(/⊃\u0338/g, '\\not\\supset ')
    .replace(/\\not\s*\\supset\b/g, '\\not\\supset ');

  // 2b. Chuẩn hóa chỉ số dưới của lớp đồng dư bị viết thiếu dấu _ (vd: [3]13 -> [3]_{13}, [a]n -> [a]_{n})
  out = out.replace(
    /(?<!\\sqrt)\[([0-9a-zA-Z+-]+)\]([0-9]+|[nmpk])\b/g,
    (_m, inner: string, sub: string) => `[${inner}]_{${sub}}`,
  );

  // 3. Hiệu tập hợp thiếu \setminus và ngoặc nhọn (giữ an toàn cho \\ {y = 2} trong cases)
  out = out.replace(/(^|[^\\])\\\s+\\?\{([^}\\]+)\\?\}/g, '$1\\setminus \\{$2\\}');

  // 4. Toán tử Unicode thô & phân số Unicode
  for (const [pattern, replacement] of UNICODE_OPERATOR_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  out = out.replace(UNICODE_FRACTION_RE, (ch) => UNICODE_FRACTION_MAP[ch] ?? ch);

  // 5. Khôi phục chỉ số dưới trong vectơ hai điểm (\overrightarrow{...} / \vect{...})
  out = out.replace(/\\(overrightarrow|vect)\{([^{}]+)\}/g, (_full, cmd: string, body: string) => {
    const fixedBody = normalizeConcatenatedVectorBody(body);
    return `\\${cmd}{${fixedBody}}`;
  });

  // 6. Khôi phục dấu ngoặc nhọn cho span{(...), (...)} hoặc span((...), (...)) và tập hợp {M \in A | ...}
  out = escapeSpanGroupBraces(out);
  out = out.replace(
    /(?<!\\)\bspan\s*\(\s*((?:\([^()]+\)(?:\s*,\s*\([^()]+\))+))\s*\)/g,
    '\\operatorname{span}\\{$1\\}',
  );
  out = escapeSetBuilderBraces(out);

  // 7. Bảo vệ các đoạn \text{...}, \operatorname{...}, \mathrm{...}, \mathbb{...}, \mathcal{...}
  const placeholders: string[] = [];
  out = out.replace(PROTECTED_COMMAND_RE, (match) => {
    const token = `__LU_TEX_PROTECTED_${placeholders.length}__`;
    placeholders.push(match);
    return token;
  });

  // 8. Chuyển đổi chuyển vị ma trận viết nhầm thành phép nhân *
  out = out
    .replace(/\[(c|b|a|x|u|x'|u')\]\s*\*(?!\s*\d)/g, '[$1]^*')
    .replace(/\)\s*\*(?=[A-Za-z[(\s]|$)/g, ')^*')
    .replace(/(?<![\^\\{A-Za-z])(A'|B'|C'|A|B|C)\s*\*(?!\s*[0-9])/g, '$1^*')
    .replace(/(\]|\)|[ABC]'?)\^\*(?=[A-Za-z[(])/g, '$1^* ');

  // 9. Tên hàm toán học bị in nghiêng thô
  out = out
    .replace(/(?<!\\)\bspan\b/g, '\\operatorname{span}')
    .replace(/(?<!\\)\bdiag\b/g, '\\operatorname{diag}')
    .replace(/(?<!\\)\bdim\b(?!\s)/g, '\\dim ')
    .replace(/(?<!\\)\bdim\b/g, '\\dim')
    .replace(/(?<!\\)\bdet\b(?!\s)/g, '\\det ')
    .replace(/(?<!\\)\bdet\b/g, '\\det');

  // 10. Khôi phục chỉ số dưới bị mất dấu _ ở biến tọa độ/ma trận (a0 -> a_0, a01 -> a_{01}, ai1 -> a_{i1}, b0i -> b_{0i})
  // Bảo vệ các khối chỉ số/mũ đã bọc ngoặc nhọn sẵn như _{i1}, ^{2n} để không chèn _ lặp bên trong
  const scriptPlaceholders: string[] = [];
  out = out.replace(/[_^]\{[^{}]*\}/g, (match) => {
    const token = `__LU_TEX_SCRIPT_${scriptPlaceholders.length}__`;
    scriptPlaceholders.push(match);
    return token;
  });
  out = out.replace(
    /(?<![A-Za-z\\_^])([A-Za-z]'?)([0-9]{2,}|[ijkmn][0-9]+|[0-9]+[ijkmn]|[0-9])(?![A-Za-z0-9])/g,
    (_m, base: string, sub: string) => (sub.length === 1 ? `${base}_${sub}` : `${base}_{${sub}}`),
  );
  out = out.replace(/__LU_TEX_SCRIPT_(\d+)__/g, (_m, idxStr: string) => {
    const idx = Number(idxStr);
    return scriptPlaceholders[idx] ?? '';
  });

  // 11. Khôi phục các đoạn đã bảo vệ
  out = out.replace(/__LU_TEX_PROTECTED_(\d+)__/g, (_m, idxStr: string) => {
    const idx = Number(idxStr);
    return placeholders[idx] ?? '';
  });

  // 12. Khoảng cách trước điều kiện phụ trong ngoặc
  out = out
    .replace(/0\s*\(\s*(A\s*=\s*\\operatorname\{diag\})/g, '0 \\quad ($1')
    .replace(
      /0\s*\(\s*(j\s*\\neq|i\s*\\neq|k\s*\\neq|\\lambda\s*\\neq|i\s*=|j\s*=|\\dim\b|\\det\b)/g,
      '0 \\;\\, ($1',
    )
    .replace(/\\\}\s*\(\s*(\\dim\b|\\det\b)/g, '\\} \\;\\, ($1');

  // Gom khoảng trắng dư thừa do thay thế toán tử mà vẫn giữ xuống dòng
  out = out.replace(/[^\S\r\n]{2,}/g, ' ').trim();

  return out;
}

/**
 * Alias tương thích ngược cho các điểm gọi hiện có (`KatexMath`).
 */
export function sanitizeKatexInput(math: string): string {
  return sanitizeLatex(math);
}

const AMS_NEGATED_CHAR_MAP: Readonly<Record<string, string>> = {
  '∤': '∣',
  '⊈': '⊆',
  '⊉': '⊇',
  '≁': '∼',
  '∦': '∥',
  '≠': '=',
  '∉': '∈',
  '≢': '≡',
  '⊄': '⊂',
  '⊅': '⊃',
};

/**
 * Hậu xử lý chuỗi HTML đầu ra của `katex.renderToString`:
 * - Xóa bỏ thẻ `.rlap` / `.llap` chứa ký tự gạch chéo phủ định (`\uE020`, `\u0338`, `&#x0338;`, `/`)
 * - Chuyển các ký tự quan hệ phủ định AMS (`∤`, `⊈`, `⊉`, `≁`, `∦`) về toán tử gốc (`∣`, `⊆`, `⊇`, `∼`, `∥`)
 * - Gắn trực tiếp class `lu-negated-rel` vào thẻ `<span class="mrel lu-negated-rel">` để vẽ nét gạch chéo bằng CSS độc lập font.
 */
export function fixKaTeXNegations(html: string): string {
  if (!html) return html;

  let out = html;

  // 1. \neq, \not\equiv, \not\subset, \not\supset, \not\subseteq, \not\mid, v.v. (cụm .rlap đứng liền trước .mrel)
  out = out.replace(
    /<span class="mrel"><span class="mord (?:katex-)?vbox"><span class="(?:katex-)?thinbox"><span class="rlap"><span class="(?:katex-)?strut"[^>]*><\/span><span class="(?:katex-)?inner"><span class="mord"><span class="mrel">(?:\uE020|&#x0338;|&#824;|\u0338|\/)<\/span><\/span><\/span><span class="(?:katex-)?fix"><\/span><\/span><\/span><\/span><\/span>(?:<span class="mspace nobreak"><\/span>)?<span class="mrel">([^<]+)<\/span>/g,
    '<span class="mrel lu-negated-rel">$1</span>',
  );

  // Dự phòng cho cấu trúc rút gọn <span class="mrel"><span class="mord"><span class="rlap">...&#x0338;...</span></span></span>
  out = out.replace(
    /<span class="mrel"><span class="mord"><span class="rlap">(?:<span[^>]*><\/span>)*<span class="(?:katex-)?inner">(?:<span[^>]*>)*(?:\uE020|&#x0338;|&#824;|\u0338|\/)(?:<\/span>)*<\/span>(?:<span[^>]*><\/span>)*<\/span><\/span><\/span>(?:<span class="mspace nobreak"><\/span>)?<span class="mrel">([^<]+)<\/span>/g,
    '<span class="mrel lu-negated-rel">$1</span>',
  );

  // 2. \notin (cụm .llap chứa '/' đứng ngay sau \in)
  out = out.replace(
    /<span class="mrel"><span class="mord"><span class="mrel">∈<\/span><\/span><span class="mord (?:katex-)?vbox"><span class="(?:katex-)?thinbox"><span class="llap"><span class="(?:katex-)?strut"[^>]*><\/span><span class="(?:katex-)?inner"><span class="mord"><span class="mord">\/<\/span><span class="mspace"[^>]*><\/span><\/span><\/span><span class="(?:katex-)?fix"><\/span><\/span><\/span><\/span><\/span>/g,
    '<span class="mrel"><span class="mrel lu-negated-rel">∈</span></span>',
  );

  // 3. Ký tự phủ định đơn lẻ thuộc font AMS (\nmid -> ∤, \nsubseteq -> ⊈, \nsim -> ≁, \nparallel -> ∦)
  out = out.replace(
    /<span class="mrel(?:\s+amsrm)?">([∤⊈⊉≁∦≠∉≢⊄⊅])<\/span>/g,
    (_m, ch: string) =>
      `<span class="mrel lu-negated-rel">${AMS_NEGATED_CHAR_MAP[ch] ?? ch}</span>`,
  );

  return out;
}

/**
 * Sửa các lỗi phân mảnh công thức từ chuyển đổi HTML -> Markdown/Text
 * và đảm bảo khoảng trắng hợp lý giữa chữ tiếng Việt và delimiter `$math$`.
 */
export function normalizeMixedMathProse(input: string): string {
  if (!input) return input;

  let out = input;
  let prev = '';

  while (prev !== out) {
    prev = out;
    out = out
      // Sửa dạng *f*$^{-1}$ hoặc *f*$_{0}$ -> $f^{-1}$ / $f_{0}$
      .replace(
        /\*([A-Za-z][′']?)\*\$([_^]\{[^}]+\})\$/g,
        (_m, base: string, script: string) => `$${base.replace(/′/g, "'")}${script}$`,
      )
      // Sửa dạng g∘*f* hoặc g∘$f$ -> $g \circ f$
      .replace(
        /([A-Za-z][′']?)\s*∘\s*\*([A-Za-z][′']?)\*/g,
        (_m, lhs: string, rhs: string) =>
          `$${lhs.replace(/′/g, "'")} \\circ ${rhs.replace(/′/g, "'")}$`,
      )
      .replace(
        /([A-Za-z][′']?)\s*∘\s*\$([^$\n]+?)\$/g,
        (_m, lhs: string, rhs: string) => `$${lhs.replace(/′/g, "'")} \\circ ${rhs}$`,
      )
      // Sửa dạng t$_{0}$ -> $t_{0}$, a$_{0i}$ -> $a_{0i}$, C$^{-1}$ -> $C^{-1}$, E′$_{0}$ -> $E'_{0}$
      .replace(
        /(^|[\s(=+\-*,$}])([A-Za-z][′']?)\$([_^]\{[^}]+\})\$/g,
        (_m, lead: string, base: string, script: string) =>
          `${lead}$${base.replace(/′/g, "'")}${script}$`,
      )
      // Sửa dạng $B' =$ C$^{-1}$BC -> gộp chữ cái biến dính ngay sau $ đóng (khi có mũ/chỉ số trước đó)
      .replace(/(\$\$|\$[^$\n]+?\})\$([A-Za-z]{1,3})(?=[\s.,;:)=+\-*/$]|$)/g, '$1$2$')
      // Gộp các đoạn $...$ dính nhau hoặc bị tách bởi toán tử trần (+, -, =) sát rìa như `$x_{i} =$ $t_{0}$$a_{0i}$`
      .replace(/\$([^$\n]+?)\$\$([^$\n]+?)\$/g, (_m, a: string, b: string) =>
        /\\[A-Za-z]+$/.test(a) && /^[A-Za-z]/.test(b) ? `$${a} ${b}$` : `$${a}${b}$`,
      )
      .replace(/\$([^$\n]*?[=+-])\$\s*\$([^$\n]+?)\$/g, '$$$1 $2$');
  }

  // Đảm bảo khoảng trắng giữa chữ tiếng Việt/chữ cái và dấu $ mở/đóng (ngoại trừ dấu câu , . ; : ) ] ? !)
  // Tách trái-qua-phải đúng từng cặp $...$ / $$...$$ để không bao giờ ghép nhầm dấu $ đóng của biểu thức trước với dấu $ mở của biểu thức sau.
  const tokenRe = /\$\$[\s\S]+?\$\$|(?<!\\)\$(?!\$)[^$\n]+?(?<!\\)\$/g;
  let result = '';
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRe.exec(out)) !== null) {
    let proseBefore = out.slice(lastIndex, match.index);
    const mathToken = match[0];
    const isDisplay = mathToken.startsWith('$$');

    if (
      result.length > 0 &&
      result.endsWith('$') &&
      !result.endsWith('$$') &&
      proseBefore.length > 0 &&
      /^\p{L}/u.test(proseBefore)
    ) {
      proseBefore = ` ${proseBefore}`;
    }

    result += proseBefore;

    if (!isDisplay && result.length > 0 && /[\p{L}\p{N}]$/u.test(result)) {
      result += ' ';
    }

    result += mathToken;
    lastIndex = match.index + mathToken.length;
  }

  let tail = out.slice(lastIndex);
  if (result.endsWith('$') && !result.endsWith('$$') && tail.length > 0 && /^\p{L}/u.test(tail)) {
    tail = ` ${tail}`;
  }
  result += tail;

  return result;
}
