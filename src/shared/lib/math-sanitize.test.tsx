import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KatexMath } from '@/features/math-glossary/KatexMath';
import { sanitizeKatexInput } from './math-sanitize';

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
});
