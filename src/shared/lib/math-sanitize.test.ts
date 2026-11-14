import katex from 'katex';
import { describe, expect, it } from 'vitest';
import { fixKaTeXNegations, sanitizeLatex } from './math-sanitize';

describe('sanitizeLatex & fixKaTeXNegations', () => {
  it('chuẩn hóa các biến thể toán tử phủ định (/=, !=, /=, \\in/, /|, ∤, ≢, ⊄)', () => {
    expect(sanitizeLatex('a /= b')).toBe('a \\neq b');
    expect(sanitizeLatex('a != b')).toBe('a \\neq b');
    expect(sanitizeLatex('a ≠ b')).toBe('a \\neq b');
    expect(sanitizeLatex('a \\ne b')).toBe('a \\neq b');
    expect(sanitizeLatex('x \\in/ A')).toBe('x \\notin A');
    expect(sanitizeLatex('x /\\in A')).toBe('x \\notin A');
    expect(sanitizeLatex('x ∉ A')).toBe('x \\notin A');
    expect(sanitizeLatex('p /| a')).toBe('p \\nmid a');
    expect(sanitizeLatex('p \\not| a')).toBe('p \\nmid a');
    expect(sanitizeLatex('p \\not\\mid a')).toBe('p \\nmid a');
    expect(sanitizeLatex('p ∤ a')).toBe('p \\nmid a');
    expect(sanitizeLatex('a ≢ b')).toBe('a \\not\\equiv b');
    expect(sanitizeLatex('A ⊄ B')).toBe('A \\not\\subset B');
  });

  it('bảo toàn các biểu thức hợp lệ chứa dấu gạch chéo như |G|/|N|, \\infty/\\infty, \\sup/\\inf', () => {
    expect(sanitizeLatex('[G:N] = |G|/|N|')).toBe('[G:N] = |G|/|N|');
    expect(sanitizeLatex('\\infty/\\infty')).toBe('\\infty/\\infty');
    expect(sanitizeLatex('\\sup/\\inf')).toBe('\\sup/\\inf');
  });

  it('khôi phục dấu _ và ngoặc nhọn cho chỉ số dưới của lớp đồng dư ([3]13 -> [3]_{13}, [a]n -> [a]_{n})', () => {
    expect(sanitizeLatex('([3]13)^1 = [3]13 \\neq [1]13')).toBe(
      '([3]_{13})^1 = [3]_{13} \\neq [1]_{13}',
    );
    expect(sanitizeLatex('[a]n + [b]n = [a+b]n')).toBe('[a]_{n} + [b]_{n} = [a+b]_{n}');
  });

  it('xóa bỏ .rlap / .llap và gắn class .lu-negated-rel lên toán tử phủ định trong HTML KaTeX', () => {
    const cases: ReadonlyArray<readonly [string, string]> = [
      ['a \\neq b', '='],
      ['a \\notin A', '∈'],
      ['p \\nmid a', '∣'],
      ['a \\not\\equiv b', '≡'],
      ['A \\not\\subset B', '⊂'],
      ['A \\nsubseteq B', '⊆'],
      ['a \\nsim b', '∼'],
      ['([3]_{13})^1 = [3]_{13} \\neq [1]_{13}', '='],
    ];

    for (const [rawTex, expectedOp] of cases) {
      const cleanTex = sanitizeLatex(rawTex);
      const rawHtml = katex.renderToString(cleanTex, {
        output: 'htmlAndMathml',
        strict: 'ignore',
        throwOnError: false,
      });
      const fixedHtml = fixKaTeXNegations(rawHtml);

      expect(fixedHtml).toContain(`<span class="mrel lu-negated-rel">${expectedOp}</span>`);
      expect(fixedHtml).not.toContain('class="rlap"');
      expect(fixedHtml).not.toContain('class="llap"');
      expect(fixedHtml).not.toContain('\uE020');

      const openSpans = (fixedHtml.match(/<span\b/g) ?? []).length;
      const closeSpans = (fixedHtml.match(/<\/span>/g) ?? []).length;
      expect(openSpans).toBe(closeSpans);
    }
  });
});
