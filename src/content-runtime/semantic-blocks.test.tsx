import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LessonSemanticLegend } from '@/components/lesson';
import {
  Corollary,
  Counterexample,
  Definition,
  Example,
  Lemma,
  Proof,
  Property,
  Proposition,
  Theorem,
} from '@/content-runtime';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';

function SampleSemanticLesson() {
  return (
    <ReadingSettingsProvider>
      <LessonSemanticLegend />
      <Definition title="Nhóm">Mỗi phần tử đều có phần tử nghịch đảo.</Definition>
      <Theorem title="Định lý Lagrange">Cấp của nhóm con chia hết cấp của nhóm.</Theorem>
      <Property title="Tính duy nhất đơn vị">Phần tử đơn vị là duy nhất.</Property>
      <Lemma title="Bổ đề phụ trợ">Bổ đề kỹ thuật.</Lemma>
      <Proposition title="Mệnh đề đảo">Mệnh đề đảo cơ bản.</Proposition>
      <Corollary title="Hệ quả trực tiếp">Hệ quả từ định lý.</Corollary>
      <Example title="Ví dụ nhóm Z_4">Nhóm cộng các lớp thặng dư modulo 4.</Example>
      <Counterexample title="Phản ví dụ">Tập số tự nhiên không là nhóm cộng.</Counterexample>
      <Proof defaultOpen>Kiểm tra trực tiếp theo tiên đề.</Proof>
    </ReadingSettingsProvider>
  );
}

describe('Khối kiến thức ngữ nghĩa (Semantic Blocks)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('gán đúng data-kind và id duy nhất cho 4 nhóm khối kiến thức (def, thm, ex, proof)', () => {
    const { container } = render(<SampleSemanticLesson />);

    const defs = container.querySelectorAll('[data-kind="def"]');
    const thms = container.querySelectorAll('[data-kind="thm"]');
    const exs = container.querySelectorAll('details.ex-block[data-kind="ex"]');
    const proofs = container.querySelectorAll('[data-kind="proof"]');

    expect(defs.length).toBe(1);
    expect(thms.length).toBe(5);
    expect(exs.length).toBe(2);
    expect(proofs.length).toBe(1);

    for (const el of [...defs, ...thms, ...exs, ...proofs]) {
      expect(el.getAttribute('id')).toBeTruthy();
    }

    // Kiểm tra ký hiệu Halmos Q.E.D. (∎) và tiêu đề CHỨNG MINH ở khối Proof đang mở
    expect(container.querySelector('.semantic-proof-kicker')?.textContent).toBe('Chứng minh');
    expect(container.querySelector('.kb-halmos')?.textContent).toBe('∎');
  });

  it('hiển thị thanh chú giải Legend Bar đầy đủ 3 nhóm màu và không còn nút Đọc lướt định lý', () => {
    render(<SampleSemanticLesson />);

    const legend = screen.getByTestId('lesson-semantic-legend');
    expect(legend).toHaveTextContent('Định nghĩa');
    expect(legend).toHaveTextContent('Định lý, tính chất');
    expect(legend).toHaveTextContent('Ví dụ (bấm để thu gọn)');
    expect(screen.queryByTestId('skim-mode-legend-toggle')).not.toBeInTheDocument();
  });

  it('cho phép người học tự đóng/mở từng khối Ví dụ và Chứng minh độc lập', () => {
    const { container } = render(<SampleSemanticLesson />);

    const examples = Array.from(
      container.querySelectorAll<HTMLDetailsElement>('details.ex-block[data-kind="ex"]'),
    );
    const proofTrigger = screen.getByRole('button', { name: /^Chứng minh$/i });

    expect(examples[0]!.open).toBe(true);
    expect(proofTrigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(proofTrigger);
    expect(proofTrigger).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(proofTrigger);
    expect(proofTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('không lặp nhãn khi title trùng với tên loại khối (ví dụ title="Định nghĩa" hoặc title="Định lý")', () => {
    const { container } = render(
      <ReadingSettingsProvider>
        <Definition number="1.5.1" title="Định nghĩa">
          Nội dung định nghĩa.
        </Definition>
        <Theorem number="1.5.2" title="Định lý">
          Nội dung định lý.
        </Theorem>
      </ReadingSettingsProvider>,
    );

    const headers = Array.from(container.querySelectorAll('.semantic-block-header'));
    expect(headers).toHaveLength(2);
    expect(headers[0]?.textContent?.trim()).toBe('Định nghĩa 1.5.1');
    expect(headers[1]?.textContent?.trim()).toBe('Định lý 1.5.2');
    expect(headers[0]?.querySelector('h4')).toBeNull();
    expect(headers[1]?.querySelector('h4')).toBeNull();
  });
});
