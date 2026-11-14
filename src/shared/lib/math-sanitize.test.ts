import katex from 'katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import {
  fixKaTeXNegations,
  parseMarkdownTableAlignments,
  parseMarkdownTableRow,
  preprocessMarkdownTables,
  protectTableMathPipes,
  sanitizeLatex,
} from './math-sanitize';

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

  it('bảo vệ dấu gạch đứng | trong công thức toán bảng Markdown sang \\lvert...\\rvert / \\mid', () => {
    expect(protectTableMathPipes('|G|')).toBe('\\lvert G\\rvert');
    expect(protectTableMathPipes('|gH| = |H| = |Hg|')).toBe(
      '\\lvert gH\\rvert = \\lvert H\\rvert = \\lvert Hg\\rvert',
    );
    expect(protectTableMathPipes('\\varphi(n) = |(\\mathbb{Z}/n\\mathbb{Z})^\\times|')).toBe(
      '\\varphi(n) = \\lvert(\\mathbb{Z}/n\\mathbb{Z})^\\times\\rvert',
    );
    expect(protectTableMathPipes('d | |G|')).toBe('d \\mid \\lvert G\\rvert');
    expect(protectTableMathPipes('\\{x \\in G | x^2 = e\\}')).toBe('\\{x \\in G \\mid x^2 = e\\}');
    expect(protectTableMathPipes('\\|x - a\\| < \\delta')).toBe('\\lvert x - a\\rvert < \\delta');
  });

  it('khôi phục bảng Markdown bị gộp dòng (| |) và giúp remarkGfm parse đúng nút table', () => {
    const collapsed =
      '| Cấp $|G|$ | Cấu trúc | Số kiểu | | :---: | :--- | :---: | | $1$ | $\\{e\\}$ | $1$ |';
    const expanded = preprocessMarkdownTables(collapsed);
    expect(expanded.split('\n')).toEqual([
      '| Cấp $\\lvert G\\rvert$ | Cấu trúc | Số kiểu |',
      '| :---: | :--- | :---: |',
      '| $1$ | $\\{e\\}$ | $1$ |',
    ]);

    const tree = unified().use(remarkParse).use(remarkGfm).use(remarkMath).parse(expanded);
    const tables: unknown[] = [];
    visit(tree, 'table', (node) => {
      tables.push(node);
    });
    expect(tables).toHaveLength(1);
    expect(parseMarkdownTableRow('| **Đẳng thế** | $|gH| = |H|$ |')).toEqual([
      '**Đẳng thế**',
      '$\\lvert gH\\rvert = \\lvert H\\rvert$',
    ]);
    expect(parseMarkdownTableAlignments('| :---: | :--- | ---: |')).toEqual([
      'center',
      'left',
      'right',
    ]);
  });
});
