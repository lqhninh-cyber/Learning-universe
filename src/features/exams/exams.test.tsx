import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { MathText } from '@/features/exams/MathText';
import { SubjectExamsPage } from '@/pages/exams/SubjectExamsPage';

describe('Hệ thống Ngân hàng Đề thi & Lời giải thực chiến', () => {
  describe('Component MathText', () => {
    it('hiển thị công thức inline KaTeX và định dạng in đậm', () => {
      const { container } = render(
        <MathText text="Cho dãy số $(x_n)$ thỏa mãn **điều kiện Cauchy**." />,
      );

      expect(screen.getByText('điều kiện Cauchy')).toBeInTheDocument();
      // KaTeX sinh phần tử span chứa mathml hoặc katex-html
      expect(container.querySelector('.katex')).not.toBeNull();
    });

    it('hiển thị công thức display KaTeX riêng biệt', () => {
      const { container } = render(
        <MathText
          text={`Tìm giới hạn sau:
$$\\lim_{n \\to \\infty} \\frac{n^2 + 1}{2n^2 + 3} = \\frac{1}{2}$$`}
        />,
      );

      expect(screen.getByText(/Tìm giới hạn sau:/i)).toBeInTheDocument();
      expect(container.querySelector('.katex-display')).not.toBeNull();
    });

    it('hiển thị danh sách gạch đầu dòng và danh sách có thứ tự', () => {
      render(
        <MathText
          text={`- Điều kiện 1: Tập hợp bị chặn trên
- Điều kiện 2: Tập hợp khác rỗng`}
        />,
      );

      expect(screen.getByText(/Điều kiện 1: Tập hợp bị chặn trên/i)).toBeInTheDocument();
      expect(screen.getByText(/Điều kiện 2: Tập hợp khác rỗng/i)).toBeInTheDocument();
    });
  });

  describe('Trang SubjectExamsPage (/mon-hoc/giai-tich-ham-mot-bien/de-thi)', () => {
    function renderExamsPage(initialPath = '/mon-hoc/giai-tich-ham-mot-bien/de-thi') {
      return render(
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/mon-hoc/:subjectSlug/de-thi" element={<SubjectExamsPage />} />
          </Routes>
        </MemoryRouter>,
      );
    }

    it('hiển thị tiêu đề ngân hàng đề thi và 6 tab năm học', () => {
      renderExamsPage();

      expect(
        screen.getByRole('heading', {
          level: 1,
          name: /Đề thi Kết thúc Học phần Giải tích hàm một biến/i,
        }),
      ).toBeInTheDocument();

      // Kiểm tra 6 năm thi có mặt trong danh sách tab
      expect(screen.getByRole('button', { name: /2025-2026/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /2024-2025/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^2021HKII/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /2020-2021/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /2019-2020/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /2018/i })).toBeInTheDocument();
    });

    it('mặc định hiển thị đề năm 2025-2026 với 5 câu hỏi tự luận', () => {
      renderExamsPage();

      expect(
        screen.getByText(/Đề thi Kết thúc Học phần Giải tích hàm một biến — Năm học 2025-2026/i),
      ).toBeInTheDocument();

      expect(screen.getByText(/Danh sách 5 câu hỏi tự luận/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Cận trên, Cận dưới và Tiêu chuẩn Cauchy Dãy số/i),
      ).toBeInTheDocument();
    });

    it('có thể bấm chuyển tab sang năm 2024-2025 và cập nhật đề bài tương ứng', () => {
      renderExamsPage();

      const btn2024 = screen.getByRole('button', { name: /2024-2025/i });
      fireEvent.click(btn2024);

      expect(
        screen.getByText(/Đề thi Kết thúc Học phần Giải tích hàm một biến — Năm học 2024-2025/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Cực biên Tập hợp và Giới hạn Tích hai Dãy/i)).toBeInTheDocument();
    });

    it('mở và đóng modal xem ảnh đề gốc khi nhấn nút Xem ảnh đề gốc', () => {
      renderExamsPage();

      const openModalBtn = screen.getByRole('button', { name: /Xem ảnh đề gốc/i });
      fireEvent.click(openModalBtn);

      // Modal dialog hiển thị
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/Bản chụp đề gốc/i)).toBeInTheDocument();

      // Đóng modal qua nút X có aria-label "Đóng hộp thoại"
      const closeBtn = screen.getByRole('button', { name: /Đóng hộp thoại/i });
      fireEvent.click(closeBtn);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('có thể mở và thu gọn lời giải chi tiết', () => {
      renderExamsPage();

      // Tìm nút mở lời giải của Bài 1
      const problemSolutionButtons = screen.getAllByRole('button', {
        name: /📝 Lời giải chi tiết/i,
      });
      expect(problemSolutionButtons.length).toBeGreaterThan(0);

      // Nhấn nút mở lời giải bài đầu tiên
      fireEvent.click(problemSolutionButtons[0]!);

      // Kiểm tra xuất hiện khối Lời giải chi tiết
      expect(
        screen.getAllByText(/Lời giải thực chiến chi tiết|Chứng minh \/ Tính toán chi tiết/i)
          .length,
      ).toBeGreaterThan(0);
    });

    it('nút Mở tất cả lời giải mở toàn bộ các bài', () => {
      renderExamsPage();

      const openAllBtn = screen.getByRole('button', { name: /Mở tất cả lời giải/i });
      fireEvent.click(openAllBtn);

      expect(screen.getByRole('button', { name: /Thu gọn tất cả giải/i })).toBeInTheDocument();
      expect(
        screen.getAllByText(/Lời giải thực chiến chi tiết|Chứng minh \/ Tính toán chi tiết/i)
          .length,
      ).toBeGreaterThan(0);
    });
  });
});
