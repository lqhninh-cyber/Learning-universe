import { render } from '@testing-library/react';
import katex from 'katex';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { describe, expect, it } from 'vitest';
import { MathText } from '@/features/exams/MathText';
import { KatexMath } from '@/features/math-glossary/KatexMath';
import { remarkMathSanitizePost, remarkMathSanitizePre } from '../../../build/remark-math-sanitize';
import { normalizeMixedMathProse, sanitizeKatexInput, sanitizeLatex } from './math-sanitize';

describe('sanitizeKatexInput', () => {
  it('chuẩn hóa ký hiệu khác `/=` sang `\\neq`', () => {
    expect(sanitizeKatexInput('\\det C = 2 /= 0')).toBe('\\det C = 2 \\neq 0');
    expect(sanitizeKatexInput('P /= Q')).toBe('P \\neq Q');
    expect(sanitizeKatexInput('P/=Q')).toBe('P\\neq Q');
  });

  it('chuẩn hóa hiệu tập hợp thiếu `\\setminus` như `\\R \\ {1}`', () => {
    expect(sanitizeKatexInput('k \\in \\R \\ {1}')).toBe('k \\in \\R \\setminus \\{1\\}');
    expect(sanitizeKatexInput('\\mathbb{R} \\ {0}')).toBe('\\mathbb{R} \\setminus \\{0\\}');
  });

  it('không làm hỏng xuống dòng LaTeX `\\\\` đứng trước nhóm `{...}`', () => {
    const casesFormula = '\\begin{cases} x = 1 \\\\ {y = 2} \\end{cases}';
    expect(sanitizeKatexInput(casesFormula)).toBe(casesFormula);
  });

  it('chuẩn hóa phân số Unicode sang lệnh `\\frac`', () => {
    expect(sanitizeKatexInput('(½, 0)')).toBe('(\\frac{1}{2}, 0)');
    expect(sanitizeKatexInput('¼ + ¾ = ⅓ + ⅔')).toBe(
      '\\frac{1}{4} + \\frac{3}{4} = \\frac{1}{3} + \\frac{2}{3}',
    );
  });
});

describe('KatexMath với bộ tiền xử lý sanitizeKatexInput', () => {
  it('render `\\det C = 2 /= 0` và `k \\in \\R \\ {1}` không có lỗi KaTeX', () => {
    const { container } = render(
      <div>
        <KatexMath math={'\\det C = 2 /= 0'} />
        <KatexMath math={'k \\in \\R \\ {1}'} />
        <KatexMath math={'(\\frac{1}{2}, ¼)'} />
      </div>,
    );

    expect(container.querySelector('.katex-error')).toBeNull();
    expect(container.textContent).toContain('≠');
    expect(container.textContent).toContain('{1}');
  });

  it('xử lý triệt để ký hiệu phủ định, vectơ, chỉ số dưới, chuyển vị và hàm chuẩn học thuật', () => {
    expect(sanitizeLatex('a =\\not b, x \\in/ A, U ⊄ V')).toBe(
      'a \\neq b, x \\notin A, U \\not\\subset V',
    );
    expect(sanitizeLatex('\\overrightarrow{P0M} + \\vect{P0Pi}')).toBe(
      '\\overrightarrow{P_0 M} + \\vect{P_0 P_i}',
    );
    expect(sanitizeLatex('a0 + a01 + ai1 + b0i')).toBe('a_0 + a_{01} + a_{i1} + b_{0i}');
    // Không làm hỏng chỉ số đã bọc ngoặc nhọn sẵn như a_{i1}, x_{n0}
    expect(sanitizeLatex('a_{i1} + x_{n0}')).toBe('a_{i1} + x_{n0}');
    // Chuyển vị ma trận & hàm toán học
    expect(sanitizeLatex('[c]*A[c] = B*AB')).toBe('[c]^* A[c] = B^* AB');
    expect(sanitizeLatex("C* A'* C = (P)*")).toBe("C^* A'^* C = (P)^*");
    expect(
      sanitizeLatex('\\overline{\\alpha} = span{(1,1,0), (0,1,1)} (dim \\overline{\\alpha} = 2)'),
    ).toBe(
      '\\overline{\\alpha} = \\operatorname{span}\\{(1,1,0), (0,1,1)\\} \\;\\, (\\dim \\overline{\\alpha} = 2)',
    );
    expect(sanitizeLatex('A = diag(1,0), det A')).toBe('A = \\operatorname{diag}(1,0), \\det A');
    expect(sanitizeLatex('P = {M \\in \\mathcal{A} | M \\neq Q}')).toBe(
      'P = \\{M \\in \\mathcal{A} \\mid M \\neq Q\\}',
    );
    expect(sanitizeLatex('\\underrightarrow{u} + v\u20ef + μ_{i}x_{i}')).toBe(
      '\\vec{u} + \\vec{v} + \\mu _{i}x_{i}',
    );
    expect(sanitizeLatex('0(j \\neq i), 0(A = diag(1,0))')).toBe(
      '0 \\;\\, (j \\neq i), 0 \\quad (A = \\operatorname{diag}(1,0))',
    );
  });

  it('gộp các mảnh HTML-to-MDX và căn khoảng trắng tiếng Việt trong normalizeMixedMathProse', () => {
    expect(normalizeMixedMathProse('(dùng *f*$^{-1}$) và (dùng g∘*f*)')).toBe(
      '(dùng $f^{-1}$) và (dùng $g \\circ f$)',
    );
    expect(normalizeMixedMathProse('$x_{i} =$ t$_{0}$a$_{0i} + \\dots +$ t$_{m}$a$_{mi}$')).toBe(
      '$x_{i} = t_{0}a_{0i} + \\dots + t_{m}a_{mi}$',
    );
    expect(normalizeMixedMathProse('$P = \\sum_{i,j=1}^{n}$a$_{ij}$b$_{i}$c$_{j}$')).toBe(
      '$P = \\sum_{i,j=1}^{n}a_{ij}b_{i}c_{j}$',
    );
    expect(normalizeMixedMathProse('Điểm$M \\neq Q$thuộc phẳng')).toBe(
      'Điểm $M \\neq Q$ thuộc phẳng',
    );
  });

  it('compile AST MDX mẫu từ Bài 1.3, 1.5, 1.7, 1.8 qua remarkMathSanitizePre/Post + KaTeX không lỗi', () => {
    const mdxSamples = [
      'Cho phẳng $\\alpha = {M \\in \\mathcal{A} | M /= Q}$ với $\\overline{\\alpha} = span{(1,1,0), (0,1,1)} (dim \\overline{\\alpha} = 2)$.',
      'Tọa độ tâm tỉ cự $x_{i} =$ t$_{0}$a$_{0i} + \\dots +$ t$_{m}$a$_{mi}$, trong đó $\\lambda = μ_{i}$, điều kiện $0(j \\neq i)$.',
      'Xét phép biến đổi ngược (dùng *f*$^{-1}$) và phép hợp thành (dùng g∘*f*) cùng hệ số $(½, 0)$ với $\\underrightarrow{u}$.',
      'Dạng toàn phương $[c]*A[c] = a0 + \\sum_{i,j=1}^{n}$a$_{ij}$b$_{i}$c$_{j}$, chuẩn hóa $A = diag(1,0)$, $\\det A /= 0$ qua $B*AB$ và $C*$.',
    ];

    const processor = unified()
      .use(remarkParse)
      .use(remarkMathSanitizePre)
      .use(remarkMath)
      .use(remarkMathSanitizePost);

    for (const sample of mdxSamples) {
      const tree = processor.runSync(processor.parse(sample));
      const collectedMath: string[] = [];
      visit(tree, ['math', 'inlineMath'], (node) => {
        const mathNode = node as unknown as {
          value: string;
          data?: { hChildren?: Array<{ value: string }> };
        };
        collectedMath.push(mathNode.value);
        // Đảm bảo data.hChildren đồng bộ với node.value để rehype-katex nhận đúng mã đã làm sạch
        expect(mathNode.data?.hChildren?.[0]?.value).toBe(mathNode.value);
        const html = katex.renderToString(mathNode.value, { throwOnError: true, strict: 'warn' });
        expect(html).not.toContain('katex-error');
      });
      expect(collectedMath.length).toBeGreaterThan(0);

      // Không còn mảnh văn bản hỏng từ HTML -> MDX
      const textChunks: string[] = [];
      visit(tree, 'text', (node) => {
        textChunks.push((node as unknown as { value: string }).value);
      });
      const joinedText = textChunks.join(' ');
      expect(joinedText).not.toContain('$_{');
      expect(joinedText).not.toContain('^{');
      expect(joinedText).not.toContain('∘');
    }

    // Kiểm tra cụ thể các mảnh vỡ HTML -> MDX được gộp thành nút inlineMath hoàn chỉnh
    const tree15 = processor.runSync(
      processor.parse('Tọa độ $x_{i} =$ t$_{0}$a$_{0i} + \\dots +$ t$_{m}$a$_{mi}$.'),
    );
    const math15: string[] = [];
    visit(tree15, 'inlineMath', (node) => {
      math15.push((node as unknown as { value: string }).value);
    });
    expect(math15).toEqual(['x_{i} = t_{0}a_{0i} + \\dots + t_{m}a_{mi}']);

    const tree17 = processor.runSync(
      processor.parse('Phép ngược (dùng *f*$^{-1}$) và (dùng g∘*f*).'),
    );
    const math17: string[] = [];
    visit(tree17, 'inlineMath', (node) => {
      math17.push((node as unknown as { value: string }).value);
    });
    expect(math17).toEqual(['f^{-1}', 'g \\circ f']);

    const tree18 = processor.runSync(
      processor.parse('$P = \\sum_{i,j=1}^{n}$a$_{ij}$b$_{i}$c$_{j}$'),
    );
    const math18: string[] = [];
    visit(tree18, 'inlineMath', (node) => {
      math18.push((node as unknown as { value: string }).value);
    });
    expect(math18).toEqual(['P = \\sum_{i,j=1}^{n}a_{ij}b_{i}c_{j}']);
  });

  it('MathText render bảng Markdown bị gộp dòng (| |) và bảo toàn $|G|$ trong KaTeX', () => {
    const markdown =
      '| Cấp $|G|$ | Cấu trúc | Đặc điểm | | :---: | :--- | :--- | | **$1$** | $\\{e\\}$ | Nhóm tầm thường | | **$4$** | $\\mathbb{Z}/4\\mathbb{Z}$, $V_4 = \\{e, a, b, c\\}$ | Đều là nhóm abel ($|H| \\mid |G|$) |';
    const { container } = render(<MathText text={markdown} />);

    const table = container.querySelector('table');
    expect(table).not.toBeNull();
    expect(container.querySelectorAll('thead th')).toHaveLength(3);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(container.querySelectorAll('.katex-error')).toHaveLength(0);
    expect(container.textContent).not.toContain('| :--- |');
    expect(container.textContent).toContain('∣G∣');
    expect(container.textContent).toContain('\\lvert G\\rvert');
  });
});
