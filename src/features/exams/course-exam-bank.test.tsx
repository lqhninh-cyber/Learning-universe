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
    if (problem.sheetHeading) {
      entries.push({ context: `${pCtx}.sheetHeading`, text: problem.sheetHeading });
    }
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
      // Tách bạch 01 đề chính thức thực tế và 02 đề biên soạn ôn tập
      expect(bank.officialExams).toHaveLength(1);
      expect(bank.officialExams.every((p) => !p.isMockExam)).toBe(true);
      expect(bank.mockExams).toHaveLength(2);
      expect(bank.mockExams.every((p) => p.isMockExam === true)).toBe(true);

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

  it('MATH1301: hiển thị tờ đề chính thức nguyên bản 2522MATH170401, tách rời lời giải bên dưới và tách bạch đề ôn tập', async () => {
    const user = userEvent.setup();
    renderCourseDetailRoute('/courses/cau-truc-dai-so');

    const mainTab = await screen.findByRole('tab', { name: /^Ôn tập$/i });
    await user.click(mainTab);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Ôn tập môn Cấu trúc đại số' }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Ngân hàng Đề thi & Lời giải/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kho Đề thi Kết thúc Học phần/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/phân tích cấu trúc 40\/60 và bộ đề biên soạn ôn tập/i),
    ).not.toBeInTheDocument();

    // 3 tab chuẩn xác theo cấu trúc mới (Xanh Rêu Sơn Mài khi active)
    const tab1 = screen.getByRole('tab', { name: /1\.\s*Đề thi chính thức \(2025 - 2026\)/i });
    const tab2 = screen.getByRole('tab', {
      name: /2\.\s*Phân tích cấu trúc & Hướng dẫn ôn tập/i,
    });
    const tab3 = screen.getByRole('tab', {
      name: /3\.\s*Đề biên soạn thêm để ôn tập \(Đề mẫu\)/i,
    });
    expect(tab1).toBeInTheDocument();
    expect(tab1.className).toContain('bg-[#1B3D2F]');
    expect(tab2).toBeInTheDocument();
    expect(tab3).toBeInTheDocument();

    // Tuyệt đối không có thanh chọn các học kỳ I ảo, mã học phần tự thêm hay tên tóm tắt câu hỏi tự đặt
    expect(screen.queryByText(/MATH1301/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chọn đề thi chính thức/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/2024-2025/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nhóm con của nhóm đối xứng S₃/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^📝 Lời giải$/i })).not.toBeInTheDocument();

    // Header 2 cột và nội dung tờ đề gốc 2522MATH170401
    expect(screen.getByText('TRƯỜNG ĐH SƯ PHẠM TPHCM')).toBeInTheDocument();
    expect(screen.getByText('KHOA TOÁN - TIN HỌC')).toBeInTheDocument();
    expect(screen.getByText('Đề chính thức')).toBeInTheDocument();
    expect(screen.getByText('(Đề thi gồm có 1 trang)')).toBeInTheDocument();
    expect(screen.getByText('ĐỀ THI KẾT THỨC HỌC PHẦN')).toBeInTheDocument();
    expect(screen.getByText('Tên HP: ĐẠI SỐ')).toBeInTheDocument();
    expect(screen.getByText('Mã LHP: 2522MATH170401 — Số tín chỉ: 3')).toBeInTheDocument();
    expect(screen.getByText('Học kỳ: 2 — Năm học: 2025 - 2026')).toBeInTheDocument();
    expect(screen.getByText('Thời gian: 90 phút (không kể thời gian phát đề)')).toBeInTheDocument();

    expect(screen.getByText(/Câu 1\. \(3 điểm\)/)).toBeInTheDocument();
    expect(screen.getByText(/Câu 2\. \(3 điểm\)/)).toBeInTheDocument();
    expect(screen.getByText(/Câu 3\. \(4 điểm\)/)).toBeInTheDocument();
    expect(screen.getByText('— HẾT —')).toBeInTheDocument();
    expect(screen.getByText('Ghi chú:')).toBeInTheDocument();
    expect(screen.getByText(/Thí sinh KHÔNG được sử dụng tài liệu\./)).toBeInTheDocument();
    expect(screen.getByText(/Cán bộ coi thi không giải thích gì thêm\./)).toBeInTheDocument();

    // Khối 2 độc lập ở dưới mặc định thu gọn; 1 nút tổng Xanh Rêu bật/tắt toàn bộ lời giải
    expect(
      screen.getByRole('heading', { name: /LỜI GIẢI CHI TIẾT & THANG ĐIỂM THAM KHẢO/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Xét chuyển trí/i)).not.toBeInTheDocument();

    const masterToggle = screen.getByRole('button', {
      name: /Hiện lời giải chi tiết & thang điểm/i,
    });
    expect(masterToggle.className).toContain('bg-[#1B3D2F]');
    await user.click(masterToggle);

    expect(await screen.findByText(/Xét chuyển trí/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Thang điểm tham khảo:/).length).toBe(3);

    // Chuyển sang Tab 2: Phân tích cấu trúc & Hướng dẫn ôn tập
    await user.click(tab2);
    expect(screen.getAllByText(/Chứng minh định lý nền tảng về nhóm con/i).length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText(/Bốn họ nhóm mẫu cần thuộc lòng/i)).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    const firstCheckbox = checkboxes[0];
    expect(checkboxes.length).toBeGreaterThan(0);
    if (!firstCheckbox) throw new Error('Expected at least one checklist checkbox');
    expect(firstCheckbox).toHaveAttribute('aria-checked', 'false');
    await user.click(firstCheckbox);
    expect(firstCheckbox).toHaveAttribute('aria-checked', 'true');

    // Chuyển sang Tab 3: Đề biên soạn thêm để ôn tập (Đề mẫu)
    await user.click(tab3);
    expect(
      screen.getByText(/ĐỀ BIÊN SOẠN ÔN TẬP \(MÔ PHỎNG CẤU TRÚC ĐỀ CHÍNH THỨC\)/),
    ).toBeInTheDocument();
    expect(screen.getByText(/chứng minh tâm nhóm/i)).toBeInTheDocument();

    // Chọn Đề ôn tập số 2 và kiểm tra lời giải mặc định thu gọn trước khi mở
    await user.click(screen.getByRole('button', { name: 'Đề ôn tập số 2' }));
    expect(screen.getByText(/chỉ số/i)).toBeInTheDocument();
    expect(screen.queryByText(/Kiểm tra các phần tử còn lại/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Hiện lời giải chi tiết & thang điểm/i }));
    expect(await screen.findByText(/Kiểm tra các phần tử còn lại/i)).toBeInTheDocument();
  });

  it('MATH1302: hiển thị tờ đề chính thức nguyên bản 2512MATH18221, tách rời lời giải bên dưới và có 2 đề biên soạn ôn tập', async () => {
    const user = userEvent.setup();
    renderCourseDetailRoute('/courses/hinh-hoc-affine');

    const mainTab = await screen.findByRole('tab', { name: /^Ôn tập$/i });
    await user.click(mainTab);

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Ôn tập môn Hình học Affine và hình học Euclide',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Ngân hàng Đề thi & Lời giải/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kho Đề thi Kết thúc Học phần/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/cấu trúc cố định 3 bài và bộ đề biên soạn ôn tập/i),
    ).not.toBeInTheDocument();

    // Tuyệt đối không hiển thị mã tự thêm MATH1302 trên giao diện
    expect(screen.queryByText(/MATH1302/i)).not.toBeInTheDocument();

    // Header 2 cột nguyên bản đề 2512MATH18221 và nút Phòng Lab 3D
    expect(screen.getByText('TRƯỜNG ĐẠI HỌC SƯ PHẠM TP.HCM')).toBeInTheDocument();
    expect(screen.getByText('KHOA TOÁN – TIN HỌC')).toBeInTheDocument();
    expect(screen.getByText('Đề số 1')).toBeInTheDocument();
    expect(screen.getByText('(Đề thi gồm có 01 trang)')).toBeInTheDocument();
    expect(screen.getByText('HÌNH HỌC AFFINE VÀ HÌNH HỌC EUCLID')).toBeInTheDocument();
    expect(screen.getByText('Mã học phần: 2512MATH18221 — ĐVHT: 2')).toBeInTheDocument();
    expect(screen.getByText('Năm học: 2025-2026 — Học kỳ: 1')).toBeInTheDocument();
    expect(screen.getByText('Thời gian làm bài: 90 phút')).toBeInTheDocument();

    expect(
      screen
        .getAllByRole('link', { name: /Phòng Lab 3D/i })
        .some((el) => el.getAttribute('href') === '/interactive/affine-geometry.html'),
    ).toBe(true);

    // Nội dung nguyên bản Bài 1, Bài 2, Bài 3 *(Đề gốc ghi Bài 1)*, ---HẾT--- và Chú ý:
    expect(screen.getByText(/Bài 1 \(3\.0 điểm\)\./)).toBeInTheDocument();
    expect(screen.getByText(/Bài 2 \(4\.0 điểm\)\./)).toBeInTheDocument();
    expect(screen.getByText(/Bài 3 \(3\.0 điểm\)\./)).toBeInTheDocument();
    expect(screen.getByText(/\(Đề gốc ghi Bài 1\)/)).toBeInTheDocument();
    expect(screen.getByText('---HẾT---')).toBeInTheDocument();
    expect(screen.getByText('Chú ý:')).toBeInTheDocument();
    expect(screen.getByText(/Được sử dụng máy tính cầm tay\./)).toBeInTheDocument();

    // Không tự đặt tiêu đề tóm tắt trên tờ đề
    expect(
      screen.queryByText(/Siêu mặt bậc hai và siêu phẳng kính liên hợp trong A³/i),
    ).not.toBeInTheDocument();

    // Lời giải chi tiết ở khối dưới mặc định thu gọn; 1 nút tổng bật toàn bộ
    expect(screen.queryByText(/vế trái phương trình/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Hiện lời giải chi tiết & thang điểm/i }));
    expect(await screen.findByText(/vế trái phương trình/i)).toBeInTheDocument();

    // Phân tích cấu trúc 3.0 - 4.0 - 3.0
    await user.click(
      screen.getByRole('tab', { name: /2\.\s*Phân tích cấu trúc & Hướng dẫn ôn tập/i }),
    );
    expect(screen.getByText(/Bài 3: Chứng minh đại cương/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tham số hóa phẳng bù trực giao/i).length).toBeGreaterThan(0);

    // Đề biên soạn thêm để ôn tập (Tab 3)
    await user.click(
      screen.getByRole('tab', { name: /3\.\s*Đề biên soạn thêm để ôn tập \(Đề mẫu\)/i }),
    );
    expect(
      screen.getByText(/ĐỀ BIÊN SOẠN ÔN TẬP \(MÔ PHỎNG CẤU TRÚC ĐỀ CHÍNH THỨC\)/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tìm tọa độ tâm của/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Đề ôn tập số 2' }));
    expect(screen.getByText(/chéo nhau hoàn toàn/i)).toBeInTheDocument();
  });
});
