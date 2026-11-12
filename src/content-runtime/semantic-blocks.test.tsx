import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { LessonSemanticLegend } from '@/components/lesson';
import { FloatingZenToolbar } from '@/components/reader/FloatingZenToolbar';
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
import { PrincipleMatrix } from '@/features/pedagogy';

function SampleSemanticLesson() {
  return (
    <ReadingSettingsProvider>
      <LessonSemanticLegend />
      <FloatingZenToolbar />
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

describe('Khối kiến thức ngữ nghĩa (Semantic Blocks) & Chế độ Đọc lướt định lý', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.body.removeAttribute('data-skim-mode');
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

  it('hiển thị thanh chú giải Legend Bar đầy đủ 3 nhóm màu và nút Đọc lướt định lý', () => {
    render(<SampleSemanticLesson />);

    const legend = screen.getByTestId('lesson-semantic-legend');
    expect(legend).toHaveTextContent('Định nghĩa');
    expect(legend).toHaveTextContent('Định lý, tính chất');
    expect(legend).toHaveTextContent('Ví dụ (bấm để thu gọn)');

    const legendToggle = screen.getByTestId('skim-mode-legend-toggle');
    expect(legendToggle).toHaveAttribute('aria-pressed', 'false');
    expect(legendToggle).toHaveAttribute('aria-label', 'Đọc lướt định lý (Ẩn Ví dụ & Chứng minh)');
  });

  it('chế độ Đọc lướt định lý tự động thu gọn Ví dụ & Chứng minh, giữ nguyên Định nghĩa & Định lý và lưu sessionStorage', () => {
    const { container } = render(<SampleSemanticLesson />);

    const examples = Array.from(
      container.querySelectorAll<HTMLDetailsElement>('details.ex-block[data-kind="ex"]'),
    );
    const proofTrigger = screen.getByRole('button', { name: /^Chứng minh$/i });

    // Mặc định Ví dụ đang mở, Proof đang mở (với defaultOpen)
    for (const ex of examples) {
      expect(ex.open).toBe(true);
    }
    expect(proofTrigger).toHaveAttribute('aria-expanded', 'true');

    // Bật chế độ Đọc lướt định lý
    const legendToggle = screen.getByTestId('skim-mode-legend-toggle');
    fireEvent.click(legendToggle);

    expect(legendToggle).toHaveAttribute('aria-pressed', 'true');
    expect(sessionStorage.getItem('lu_skim_mode')).toBe('true');
    expect(document.body.getAttribute('data-skim-mode')).toBe('true');

    // Tất cả Ví dụ & Chứng minh đã thu gọn
    for (const ex of examples) {
      expect(ex.open).toBe(false);
    }
    expect(proofTrigger).toHaveAttribute('aria-expanded', 'false');

    // Định nghĩa và Định lý vẫn hiển thị đầy đủ
    expect(screen.getByText('Mỗi phần tử đều có phần tử nghịch đảo.')).toBeVisible();
    expect(screen.getByText('Cấp của nhóm con chia hết cấp của nhóm.')).toBeVisible();

    // Khi đang ở chế độ Đọc lướt, người học vẫn có thể mở tay một Ví dụ hoặc Chứng minh cụ thể
    const firstSummary = examples[0]!.querySelector('summary')!;
    fireEvent.click(firstSummary);
    expect(examples[0]!.open).toBe(true);
    expect(examples[1]!.open).toBe(false);

    fireEvent.click(proofTrigger);
    expect(proofTrigger).toHaveAttribute('aria-expanded', 'true');

    // Tắt chế độ Đọc lướt định lý -> mở lại toàn bộ Ví dụ
    fireEvent.click(legendToggle);
    expect(sessionStorage.getItem('lu_skim_mode')).toBe('false');
    for (const ex of examples) {
      expect(ex.open).toBe(true);
    }
  });

  it('đồng bộ nút Đọc lướt định lý trong FloatingZenToolbar và khôi phục trạng thái từ sessionStorage', () => {
    sessionStorage.setItem('lu_skim_mode', 'true');

    const { container } = render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
        <Example title="Ví dụ khôi phục">Nội dung ví dụ</Example>
        <PrincipleMatrix />
      </ReadingSettingsProvider>,
    );

    const ex = container.querySelector<HTMLDetailsElement>('details.ex-block[data-kind="ex"]')!;
    expect(ex.open).toBe(false);

    const principleEx = container.querySelector<HTMLDetailsElement>(
      'details[id^="principle-ex-"]',
    )!;
    expect(principleEx.open).toBe(false);

    // Mở FloatingZenToolbar và kiểm tra nút Đọc lướt định lý đang active
    fireEvent.click(screen.getByTestId('zen-toolbar-trigger'));
    const toolbarToggle = screen.getByTestId('skim-mode-toggle');
    expect(toolbarToggle).toHaveAttribute('aria-pressed', 'true');

    // Bấm tắt từ FloatingZenToolbar
    fireEvent.click(toolbarToggle);
    expect(toolbarToggle).toHaveAttribute('aria-pressed', 'false');
    expect(ex.open).toBe(true);
    expect(principleEx.open).toBe(true);
  });
});
