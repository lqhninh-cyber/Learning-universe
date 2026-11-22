import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  exportExamToLatex,
  normalizeSmartMathText,
  parseExamMarkupToStructure,
  resolveOptionColumns,
  selectActiveExamBucket,
  serializePartsToExamMarkup,
  shuffleExamParts,
  useExamBuilderStore,
} from '@/features/exam-builder';
import { ExamBuilderPage } from '@/pages/exam-builder/ExamBuilderPage';

describe('Xưởng Soạn Đề Toán (/soan-de) — Smart Parser, Auto-Math & A4 Paper', () => {
  beforeEach(() => {
    useExamBuilderStore.getState().resetExamBuilderStore();
    window.localStorage.clear();
  });

  it('tự động nhận diện ký hiệu toán học gõ tắt (vec, goc, can, phan, tp, in R/Z, f(x)=...) và giữ nguyên LaTeX chuẩn', () => {
    const sample =
      'Cho vec(AB), goc(ABC) = 60deg, phan(1, 3) + can(2), tp(1, 2, 2x-3), k in Z và f(x) = x^3 - 12x - 8.';
    const normalized = normalizeSmartMathText(sample, true);

    expect(normalized).toContain('$\\overrightarrow{AB}$');
    expect(normalized).toContain('$\\widehat{ABC}$');
    expect(normalized).toContain('$60^\\circ$');
    expect(normalized).toContain('$\\frac{1}{3}$');
    expect(normalized).toContain('$\\sqrt{2}$');
    expect(normalized).toContain('$\\int_{1}^{2} 2x-3\\,\\mathrm{d}x$');
    expect(normalized).toContain('$k \\in \\mathbb{Z}$');
    expect(normalized).toContain('$f(x) = x^3 - 12x - 8$');

    // Khi tắt autoRecognizeMath, giữ nguyên văn bản gốc
    expect(normalizeSmartMathText('vec(AB)', false)).toBe('vec(AB)');
  });

  it('phân tích chuẩn 3 phần PDF Toán 2025 (Trắc nghiệm tự dàn 4/2/1 cột, Đúng/Sai a-d, Trả lời ngắn & Bảng tần số)', () => {
    const raw = `PHẦN I. Thí sinh trả lời từ câu 1 đến câu 2.

Câu 1: Giá trị của $u_5$ bằng
A. 16.   *B. 19.   C. -8.   D. -11.

Câu 2: Tập nghiệm của phương trình $\\sin x = 0$ là
A. $S = \\{\\frac{\\pi}{2} + k\\pi \\mid k \\in \\mathbb{Z}\\}$ với $k$ là số nguyên bất kỳ.
*B. $S = \\{k\\pi \\mid k \\in \\mathbb{Z}\\}$ với mọi $k$ nguyên.
C. $S = \\{k2\\pi \\mid k \\in \\mathbb{Z}\\}$ với mọi $k$ nguyên.
D. $S = \\{\\frac{\\pi}{2} + k2\\pi \\mid k \\in \\mathbb{Z}\\}$ với mọi $k$ nguyên.

PHẦN II. Trắc nghiệm đúng sai.
Câu 1: Cho hàm số $f(x) = x^3 - 12x - 8$.
a) $f'(x) = 3x^2 - 12$. [Đ]
b) $f(2) = 24$. [S]
c) Đạo hàm có 2 nghiệm. [Đ]
d) Giá trị lớn nhất bằng 24. [S]

PHẦN III. Trả lời ngắn.
Câu 1: Tính giá trị $T$.
[Đáp án: 1008]`;

    const parsed = parseExamMarkupToStructure({
      title: 'ĐỀ KIỂM TRA GIỮA KỲ I',
      rawMarkup: raw,
      autoRecognizeMath: true,
      images: {},
    });

    expect(parsed.parts).toHaveLength(3);
    expect(parsed.totalQuestions).toBe(4);

    // Phần I: Câu 1 đáp án ngắn -> tự động 4 cột; Câu 2 đáp án vừa -> tự động 2 cột
    const mcPart = parsed.parts[0]!;
    expect(mcPart.kind).toBe('multiple-choice');
    expect(mcPart.questions[0]?.correctOption).toBe('B');
    expect(resolveOptionColumns(mcPart.questions[0]!.options!)).toBe(4);
    expect(resolveOptionColumns(mcPart.questions[1]!.options!)).toBe(2);

    // Phần II: 4 ý a)-d) với trạng thái Đúng/Sai
    const tfPart = parsed.parts[1]!;
    expect(tfPart.kind).toBe('true-false');
    expect(tfPart.questions[0]?.statements?.map((s) => s.isTrue)).toEqual([
      true,
      false,
      true,
      false,
    ]);

    // Phần III: Trả lời ngắn kèm đáp án
    const shortPart = parsed.parts[2]!;
    expect(shortPart.kind).toBe('short-answer');
    expect(shortPart.questions[0]?.shortAnswer).toBe('1008');

    // Trộn đề phải bảo toàn chính xác nội dung đáp án đúng
    const shuffled = shuffleExamParts(parsed.parts);
    const shuffledQ1 = shuffled[0]!.questions.find((q) => q.stem.includes('u_5'));
    const chosenOpt = shuffledQ1?.options?.find((o) => o.label === shuffledQ1.correctOption);
    expect(chosenOpt?.content).toContain('19');

    // Xuất LaTeX chỉ gồm Tên đề kiểm tra (KHÔNG có Bộ GD&ĐT / Họ tên / SBD / Mã đề)
    const latex = exportExamToLatex(parsed, { showEndLine: true, showAnswerKey: true });
    expect(latex).toContain('ĐỀ KIỂM TRA GIỮA KỲ I');
    expect(latex).not.toContain('BỘ GIÁO DỤC');
    expect(latex).not.toContain('Số báo danh');
    expect(latex).not.toContain('Mã đề');

    // Roundtrip serialize giữ đủ số phần và số câu
    const reserialized = serializePartsToExamMarkup(parsed.parts);
    const reparsed = parseExamMarkupToStructure({
      title: parsed.title,
      rawMarkup: reserialized,
      autoRecognizeMath: true,
      images: {},
    });
    expect(reparsed.totalQuestions).toBe(4);
  });

  it('tách biệt kho đề đã lưu theo từng tài khoản (user.id)', () => {
    const store = useExamBuilderStore.getState();

    store.setActiveAccount('teacher-a');
    store.updateActiveExam({ title: 'ĐỀ RIÊNG CỦA THẦY A' });
    expect(selectActiveExamBucket(useExamBuilderStore.getState()).exams[0]?.title).toBe(
      'ĐỀ RIÊNG CỦA THẦY A',
    );

    store.setActiveAccount('teacher-b');
    expect(selectActiveExamBucket(useExamBuilderStore.getState()).exams[0]?.title).toBe(
      'ĐỀ KIỂM TRA MÔN TOÁN',
    );

    store.setActiveAccount('teacher-a');
    expect(selectActiveExamBucket(useExamBuilderStore.getState()).exams[0]?.title).toBe(
      'ĐỀ RIÊNG CỦA THẦY A',
    );
  });

  it('ExamBuilderPage chỉ hiển thị Tên đề kiểm tra ở đầu tờ đề (bỏ khối Bộ GD&ĐT/SBD/Mã đề), cập nhật live khi soạn, hỗ trợ chèn ký hiệu, Thẻ trực quan & Bảng Đáp án', () => {
    render(
      <MemoryRouter initialEntries={['/soan-de']}>
        <ExamBuilderPage />
      </MemoryRouter>,
    );

    // 1. Đầu trang tờ đề CHỈ có Tên đề kiểm tra (không có Bộ GD&ĐT, Họ tên thí sinh, SBD, Mã đề)
    const paper = screen.getByTestId('exam-paper-preview');
    const paperHeader = screen.getByTestId('exam-paper-header');
    expect(paperHeader).toHaveTextContent('ĐỀ KIỂM TRA MÔN TOÁN');
    expect(paper).not.toHaveTextContent(/BỘ GIÁO DỤC/i);
    expect(paper).not.toHaveTextContent(/Họ, tên thí sinh/i);
    expect(paper).not.toHaveTextContent(/Số báo danh/i);
    expect(paper).not.toHaveTextContent(/Mã đề:/i);

    // Đổi tên đề kiểm tra -> cập nhật tức thì trên tờ đề A4
    fireEvent.change(screen.getByTestId('exam-title-input'), {
      target: { value: 'ĐỀ KIỂM TRA 45 PHÚT CHƯƠNG 1' },
    });
    expect(paperHeader).toHaveTextContent('ĐỀ KIỂM TRA 45 PHÚT CHƯƠNG 1');

    // 2. Chèn nhanh mẫu câu từ MathToolbar
    const textarea = screen.getByTestId('exam-markup-textarea') as HTMLTextAreaElement;
    const prevLength = textarea.value.length;
    fireEvent.click(screen.getByTestId('math-snippet-tpl-short'));
    expect(textarea.value.length).toBeGreaterThan(prevLength);

    // 3. Chuyển sang chế độ Thẻ trực quan & thêm 1 câu Trắc nghiệm
    fireEvent.click(screen.getByTestId('editor-tab-visual-cards'));
    expect(screen.getByTestId('exam-visual-editor')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('visual-add-mc'));
    expect(screen.getByTestId('paper-question-multiple-choice-6')).toBeInTheDocument();

    // 4. Bật Bảng Đáp án -> xuất hiện bảng tổng hợp đáp án cuối đề
    expect(screen.queryByTestId('exam-answer-key-sheet')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('exam-toggle-answers'));
    expect(screen.getByTestId('exam-answer-key-sheet')).toBeInTheDocument();
  });
});
