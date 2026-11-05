import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { MathText } from '@/features/exams/MathText';
import { MathGlossaryPopover, MathGlossaryProvider } from '@/features/math-glossary';
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

    it('MathText tự động nhận diện và chú thích ứng dụng định lý Lagrange trong ngữ cảnh Giải tích', () => {
      render(
        <MemoryRouter>
          <MathGlossaryProvider courseId="giai-tich-ham-mot-bien">
            <div>
              <MathText text="Bài toán yêu cầu **ứng dụng định lý Lagrange** để đánh giá sai số." />
              <MathGlossaryPopover />
            </div>
          </MathGlossaryProvider>
        </MemoryRouter>,
      );

      const trigger = screen.getByRole('button', {
        name: /Chú thích thuật ngữ: Định lý giá trị trung bình Lagrange/i,
      });
      expect(trigger).toBeInTheDocument();

      fireEvent.click(trigger);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('GIẢI TÍCH HÀM MỘT BIẾN')).toBeInTheDocument();
      expect(screen.getByRole('dialog')).toHaveTextContent(/f\(b\)\s*-\s*f\(a\)/);
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

    it('hiển thị đầy đủ 5 câu hỏi tự luận lớn cho học phần Cấu trúc đại số tại /mon-hoc/cau-truc-dai-so/de-thi', () => {
      render(
        <MemoryRouter initialEntries={['/mon-hoc/cau-truc-dai-so/de-thi']}>
          <Routes>
            <Route path="/mon-hoc/:subjectSlug/de-thi" element={<SubjectExamsPage />} />
          </Routes>
        </MemoryRouter>,
      );

      expect(
        screen.getByRole('heading', {
          name: /Đề thi Kết thúc Học phần Cấu trúc Đại số — Năm học 2025-2026/i,
        }),
      ).toBeInTheDocument();

      // Kiểm tra 5 tiêu đề câu hỏi lớn
      expect(
        screen.getByText(
          /Quan hệ tương đương, Lớp tương đương và Phép toán cảm sinh trên Tập thương/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Cấp của Phần tử, Phần tử sinh và Cấu trúc Nhóm con của Nhóm Cyclic/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Lớp kề trong Nhóm Hoán vị S_3, Định lý Lagrange và Ứng dụng/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Đồng cấu Nhóm, Tiêu chuẩn Đơn cấu và Định lý Đẳng cấu thứ nhất/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Tiêu chuẩn Eisenstein, Vành thương và Tìm Phần tử Nghịch đảo/i),
      ).toBeInTheDocument();
    });
  });
});
