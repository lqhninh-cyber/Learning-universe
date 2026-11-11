import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import katex from 'katex';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CourseExamBank, ExamPaper } from '@/data/courses/exam-bank-types';
import { MATH1301_EXAM_BANK } from '@/data/courses/cau-truc-dai-so/exam-bank';
import { MATH1302_EXAM_BANK } from '@/data/courses/hinh-hoc-affine/exam-bank';
import { KatexDisplayFormula } from '@/features/exams/MathText';
import { CourseDetailPage } from '@/pages/courses/CourseDetailPage';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';
import katexMacros from '../../../content/_shared/katex-macros.json';

interface ExtractedLatex {
  readonly context: string;
  readonly math: string;
  readonly display: boolean;
}

function collectPaperTexts(paper: ExamPaper): Array<{ context: string; text: string }> {
  const entries: Array<{ context: string; text: string }> = [
    { context: `${paper.id}.title`, text: paper.title },
    { context: `${paper.id}.description`, text: paper.description },
  ];

  for (const problem of paper.problems) {
    const pCtx = `${paper.id}.${problem.id}`;
    if (problem.title) entries.push({ context: `${pCtx}.title`, text: problem.title });
    if (problem.statement) entries.push({ context: `${pCtx}.statement`, text: problem.statement });
    if (problem.hint) entries.push({ context: `${pCtx}.hint`, text: problem.hint });
    if (problem.solution) entries.push({ context: `${pCtx}.solution`, text: problem.solution });
    for (const part of problem.parts ?? []) {
      const partCtx = `${pCtx}.${part.label}`;
      entries.push({ context: `${partCtx}.statement`, text: part.statement });
      if (part.hint) entries.push({ context: `${partCtx}.hint`, text: part.hint });
      entries.push({ context: `${partCtx}.solution`, text: part.solution });
    }
  }

  return entries;
}

function collectBankTexts(bank: CourseExamBank): Array<{ context: string; text: string }> {
  const entries: Array<{ context: string; text: string }> = [
    { context: `${bank.courseCode}.courseTitle`, text: bank.courseTitle },
    { context: `${bank.courseCode}.subtitle`, text: bank.subtitle },
  ];

  for (const paper of [...bank.officialExams, ...bank.mockExams]) {
    entries.push(...collectPaperTexts(paper));
  }

  const m = bank.matrixAnalysis;
  entries.push(
    { context: `${bank.courseCode}.matrix.headline`, text: m.headline },
    { context: `${bank.courseCode}.matrix.summary`, text: m.summary },
    { context: `${bank.courseCode}.matrix.structureSummary`, text: m.structureSummary },
  );

  for (const seg of m.distribution) {
    entries.push(
      { context: `${bank.courseCode}.dist.${seg.id}.label`, text: seg.label },
      { context: `${bank.courseCode}.dist.${seg.id}.points`, text: seg.pointsSummary },
      { context: `${bank.courseCode}.dist.${seg.id}.desc`, text: seg.description },
    );
  }

  for (const row of m.specificationRows) {
    entries.push(
      { context: `${bank.courseCode}.spec.${row.id}.item`, text: row.itemLabel },
      { context: `${bank.courseCode}.spec.${row.id}.topic`, text: row.topic },
      { context: `${bank.courseCode}.spec.${row.id}.skills`, text: row.coreSkills },
      { context: `${bank.courseCode}.spec.${row.id}.strategy`, text: row.examStrategy },
    );
  }

  for (const group of m.focusChecklists) {
    entries.push({ context: `${bank.courseCode}.checklist.${group.id}.title`, text: group.title });
    if (group.description) {
      entries.push({
        context: `${bank.courseCode}.checklist.${group.id}.desc`,
        text: group.description,
      });
    }
    for (const item of group.items) {
      entries.push(
        { context: `${bank.courseCode}.item.${item.id}.title`, text: item.title },
        { context: `${bank.courseCode}.item.${item.id}.summary`, text: item.summary },
      );
    }
  }

  return entries;
}

function extractLatexSegments(context: string, text: string): ExtractedLatex[] {
  const segments: ExtractedLatex[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === '\\' && text[i + 1] === '$') {
      i += 2;
      continue;
    }

    if (text.startsWith('$$', i)) {
      const closeIdx = text.indexOf('$$', i + 2);
      if (closeIdx === -1) {
        throw new Error(`Unclosed display math $$ in ${context}: ${text.slice(i, i + 60)}`);
      }
      segments.push({
        context,
        math: text.slice(i + 2, closeIdx).trim(),
        display: true,
      });
      i = closeIdx + 2;
      continue;
    }

    if (text[i] === '$') {
      let closeIdx = i + 1;
      while (closeIdx < text.length) {
        if (text[closeIdx] === '\\' && text[closeIdx + 1] === '$') {
          closeIdx += 2;
          continue;
        }
        if (text[closeIdx] === '$') {
          break;
        }
        closeIdx += 1;
      }
      if (closeIdx >= text.length) {
        throw new Error(`Unclosed inline math $ in ${context}: ${text.slice(i, i + 60)}`);
      }
      segments.push({
        context,
        math: text.slice(i + 1, closeIdx).trim(),
        display: false,
      });
      i = closeIdx + 1;
      continue;
    }

    i += 1;
  }

  return segments;
}

function renderCourseDetailRoute(path: string) {
  return render(
    <MotionProvider>
      <TooltipProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/courses/:subjectSlug" element={<CourseDetailPage />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>
    </MotionProvider>,
  );
}

describe('Ngân hàng Đề thi & Lời giải MATH1301 & MATH1302', () => {
  beforeEach(() => {
    window.localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('biên dịch 100% công thức LaTeX trong MATH1301 và MATH1302 bằng KaTeX không lỗi', () => {
    const banks: readonly CourseExamBank[] = [MATH1301_EXAM_BANK, MATH1302_EXAM_BANK];

    for (const bank of banks) {
      // Thang điểm các đề phải đúng 10.0 điểm
      for (const paper of [...bank.officialExams, ...bank.mockExams]) {
        const totalPoints = paper.problems.reduce((sum, p) => sum + p.points, 0);
        expect(totalPoints).toBeCloseTo(10, 5);
      }

      // Tổng tỷ trọng ma trận bằng 100%
      const totalPercent = bank.matrixAnalysis.distribution.reduce(
        (sum, seg) => sum + seg.percentage,
        0,
      );
      expect(totalPercent).toBe(100);

      // Mọi công thức inline/display đều cân bằng dấu $ và compile bởi KaTeX strict
      const textEntries = collectBankTexts(bank);
      let formulaCount = 0;

      for (const entry of textEntries) {
        const segments = extractLatexSegments(entry.context, entry.text);
        for (const seg of segments) {
          formulaCount += 1;
          expect(() =>
            katex.renderToString(seg.math, {
              displayMode: seg.display,
              throwOnError: true,
              strict: 'ignore',
              output: 'htmlAndMathml',
              macros: { ...katexMacros },
            }),
          ).not.toThrow();
        }
      }

      // Các công thức standalone trong checklist keyFormulas
      for (const group of bank.matrixAnalysis.focusChecklists) {
        for (const item of group.items) {
          for (const formula of item.keyFormulas ?? []) {
            formulaCount += 1;
            expect(() =>
              katex.renderToString(formula, {
                displayMode: true,
                throwOnError: true,
                strict: 'ignore',
                output: 'htmlAndMathml',
                macros: { ...katexMacros },
              }),
            ).not.toThrow();
          }
        }
      }

      expect(formulaCount).toBeGreaterThan(50);
    }
  });

  it('KatexDisplayFormula hiển thị KaTeX và nút Copy LaTeX sao chép chính xác công thức', async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

    const formula = String.raw`\mathbb{Z}_8 = \{\overline{0}, \overline{1}, \ldots, \overline{7}\}`;
    const { container } = render(<KatexDisplayFormula math={formula} />);

    expect(container.querySelector('.katex-display')).toBeInTheDocument();

    const copyBtn = screen.getByRole('button', { name: /LaTeX/i });
    await user.click(copyBtn);

    expect(writeText).toHaveBeenCalledWith(formula);
    await waitFor(() => {
      expect(screen.getByText('Đã chép')).toBeInTheDocument();
    });
  });

  it('MATH1301: trang chi tiết học phần /courses/cau-truc-dai-so hiển thị đủ 3 phân khu và thu gọn lời giải mặc định', async () => {
    const user = userEvent.setup();
    renderCourseDetailRoute('/courses/cau-truc-dai-so');

    const mainTab = await screen.findByRole('tab', { name: /Ngân hàng Đề thi & Lời giải/i });
    await user.click(mainTab);

    // 3 phân khu con
    expect(
      screen.getByRole('tab', { name: /1\.\s*Đề thi chính thức & Lời giải chuẩn/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /2\.\s*Phân tích cấu trúc & Chiến lược ôn tập/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('tab', { name: /3\.\s*Đề ôn tập mẫu bám sát cấu trúc/i }),
    ).toBeInTheDocument();

    // Hiển thị đề HK2 2025-2026 (2522MATH170401)
    expect(
      screen.getByText(/Đề thi Chính thức HK2 \(2025 - 2026\) — Cấu trúc Đại số/),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/2522MATH170401/).length).toBeGreaterThan(0);

    // Lời giải mặc định thu gọn để sinh viên tự làm trước
    expect(screen.queryByText(/Xét chuyển trí/i)).not.toBeInTheDocument();

    // Mở lời giải Câu 1a (nhấn nút 📝 Lời giải đầu tiên)
    const revealButtons = screen.getAllByRole('button', { name: /^📝 Lời giải$/i });
    const firstRevealButton = revealButtons[0];
    if (!firstRevealButton) throw new Error('Expected at least one reveal button');
    await user.click(firstRevealButton);
    expect(await screen.findByText(/Xét chuyển trí/i)).toBeInTheDocument();

    // Chuyển sang phân khu 2: Phân tích cấu trúc & Chiến lược ôn tập
    await user.click(
      screen.getByRole('tab', { name: /2\.\s*Phân tích cấu trúc & Chiến lược ôn tập/i }),
    );
    expect(screen.getAllByText(/Chứng minh định lý nền tảng về nhóm con/i).length).toBeGreaterThan(
      0,
    );
    expect(
      screen.getAllByText(/Tìm cấu trúc tường minh trên nhóm mẫu hữu hạn/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/Bốn họ nhóm mẫu cần thuộc lòng/i)).toBeInTheDocument();

    // Kiểm tra tương tác checklist ôn tập
    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    expect(checkboxes.length).toBeGreaterThan(0);
    if (!firstCheckbox) throw new Error('Expected at least one checklist checkbox');
    expect(firstCheckbox).toHaveAttribute('aria-checked', 'false');
    await user.click(firstCheckbox);
    expect(firstCheckbox).toHaveAttribute('aria-checked', 'true');

    // Chuyển sang phân khu 3: Đề ôn tập mẫu
    await user.click(screen.getByRole('tab', { name: /3\.\s*Đề ôn tập mẫu bám sát cấu trúc/i }));
    expect(
      screen.getByText(/Đề ôn tập mẫu số 1 — Cấu trúc Đại số \(MATH1301\)/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tâm nhóm Z\(G\)/i)).toBeInTheDocument();
  });

  it('MATH1302: trang chi tiết học phần /courses/hinh-hoc-affine hiển thị đúng Bài 1-3, ma trận 3-4-3 và đề mẫu', async () => {
    const user = userEvent.setup();
    renderCourseDetailRoute('/courses/hinh-hoc-affine');

    const mainTab = await screen.findByRole('tab', { name: /Ngân hàng Đề thi & Lời giải/i });
    await user.click(mainTab);

    // Mã đề chính thức HK1 2025-2026 (2512MATH18221) và nút Phòng Lab 3D
    expect(screen.getAllByText(/2512MATH18221/).length).toBeGreaterThan(0);
    expect(
      screen
        .getAllByRole('link', { name: /Phòng Lab 3D/i })
        .some((el) => el.getAttribute('href') === '/interactive/affine-geometry.html'),
    ).toBe(true);
    expect(screen.getAllByText(/Bài 1/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bài 2/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Bài 3/).length).toBeGreaterThan(0);

    // Lời giải chi tiết mặc định thu gọn; bấm Mở tất cả lời giải
    expect(screen.queryByText(/vế trái phương trình/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Mở tất cả lời giải/i }));
    expect(await screen.findByText(/vế trái phương trình/i)).toBeInTheDocument();

    // Phân tích cấu trúc 3.0 - 4.0 - 3.0
    await user.click(
      screen.getByRole('tab', { name: /2\.\s*Phân tích cấu trúc & Chiến lược ôn tập/i }),
    );
    expect(screen.getByText(/Bài 3: Chứng minh đại cương Aⁿ/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tham số hóa phẳng bù trực giao/i).length).toBeGreaterThan(0);

    // Đề ôn tập mẫu MATH1302
    await user.click(screen.getByRole('tab', { name: /3\.\s*Đề ôn tập mẫu bám sát cấu trúc/i }));
    expect(
      screen.getByText(/Đề ôn tập mẫu số 1 — Hình học Affine và Euclid \(MATH1302\)/i),
    ).toBeInTheDocument();
  });
});
