import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EditorialChapterOpener } from './EditorialChapterOpener';
import { toRomanNumeral } from './toRomanNumeral';

describe('EditorialChapterOpener Component', () => {
  it('tự động chuyển đổi số chương sang chữ số La Mã chính xác', () => {
    expect(toRomanNumeral(1)).toBe('I');
    expect(toRomanNumeral(2)).toBe('II');
    expect(toRomanNumeral(3)).toBe('III');
    expect(toRomanNumeral(4)).toBe('IV');
    expect(toRomanNumeral(5)).toBe('V');
    expect(toRomanNumeral(6)).toBe('VI');
    expect(toRomanNumeral(7)).toBe('VII');
    expect(toRomanNumeral(8)).toBe('VIII');
    expect(toRomanNumeral(9)).toBe('IX');
    expect(toRomanNumeral(10)).toBe('X');
    expect(toRomanNumeral(0)).toBe('O');
  });

  it('kết xuất đầy đủ thông số cho môn Giáo dục học (GDH - EDUC2802)', () => {
    render(
      <EditorialChapterOpener
        subjectCode="EDUC2802"
        subjectName="Khoa học Giáo dục"
        chapterNumber={6}
        romanNumeral="VI"
        title="Thực hành Nghiệp vụ Sư phạm: Xử lý 20 Tình huống Điển hình"
        subtitle="Hệ thống 5 bước giải quyết xung đột học đường theo Thông tư 32/2020/TT-BGDĐT"
        estimatedReadingMinutes={45}
        difficultyLevel="Nghiệp vụ thực hành"
        clos={[
          {
            code: 'CLO 6.1',
            description:
              'Phân tích bản chất tâm lý học sinh THCS/THPT trong các tình huống sư phạm',
          },
          {
            code: 'CLO 6.2',
            description: 'Vận dụng quy trình 5 bước và khung pháp quy giáo dục giải quyết xung đột',
          },
        ]}
        curriculumSource="Giáo trình Giáo dục học HCMUE (Mục 3.3.6, Trang 65 – 66)"
      />,
    );

    // Ký tự số La Mã chìm khổng lồ
    expect(screen.getByText('VI')).toBeInTheDocument();

    // Huy hiệu mã môn và tên môn
    expect(screen.getByText(/EDUC2802 · Khoa học Giáo dục/i)).toBeInTheDocument();

    // Tiêu đề h1 và phụ đề
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Thực hành Nghiệp vụ Sư phạm: Xử lý 20 Tình huống Điển hình',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Hệ thống 5 bước giải quyết xung đột/i)).toBeInTheDocument();

    // CLO Badges
    expect(screen.getByText('CLO 6.1')).toBeInTheDocument();
    expect(screen.getByText('CLO 6.2')).toBeInTheDocument();
    expect(screen.getByText(/Phân tích bản chất tâm lý học sinh THCS\/THPT/i)).toBeInTheDocument();

    // Chỉ dấu thời lượng và độ phức tạp
    expect(screen.getByText(/45 phút nghiên cứu/i)).toBeInTheDocument();
    expect(screen.getByText('Nghiệp vụ thực hành')).toBeInTheDocument();

    // Nguồn giáo trình đối chiếu
    expect(screen.getByText(/Giáo trình Giáo dục học HCMUE/i)).toBeInTheDocument();
  });

  it('kết xuất chuẩn môn Giải tích hàm một biến (GTHMB - MATH1403)', () => {
    render(
      <EditorialChapterOpener
        subjectCode="MATH1403"
        subjectName="Giải tích hàm một biến"
        chapterNumber={1}
        title="Giới hạn dãy số thực và Tiêu chuẩn hội tụ"
        subtitle="Nền tảng topo của tập số thực và kỹ thuật chứng minh giới hạn bằng ngôn ngữ ε–N"
        estimatedReadingMinutes={30}
        difficultyLevel="Nền tảng"
        clos={[
          {
            code: 'CLO 1.2',
            description: 'Kỹ thuật định lượng và chứng minh giới hạn bằng ngôn ngữ ε–N (Epsilon)',
          },
        ]}
        curriculumSource="Giáo trình Giải tích hàm một biến — Trần Trí Dũng (NXB Giáo dục)"
      />,
    );

    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText(/MATH1403 · Giải tích hàm một biến/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Giới hạn dãy số thực và Tiêu chuẩn hội tụ',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('CLO 1.2')).toBeInTheDocument();
    expect(screen.getByText(/Trần Trí Dũng/i)).toBeInTheDocument();
  });

  it('kết xuất chuẩn môn Hình học Afin và Euclide (HHAVE - MATH2204)', () => {
    render(
      <EditorialChapterOpener
        subjectCode="MATH2204"
        subjectName="Hình học Afin và Euclide"
        chapterNumber={1}
        title="Không gian Afin và Mục tiêu Afin"
        subtitle="Mô hình hóa hình học dựa trên cấu trúc không gian vectơ liên kết"
        estimatedReadingMinutes={35}
        difficultyLevel="Chuyên sâu"
        clos={[
          {
            code: 'CLO 2.1',
            description: 'Xác định mục tiêu afin, phương và hệ phương trình tham số của m-phẳng',
          },
        ]}
        curriculumSource="Giáo trình Hình học cao cấp — Nguyễn Mộng Hy (NXB Giáo dục)"
      />,
    );

    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText(/MATH2204 · Hình học Afin và Euclide/i)).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Không gian Afin và Mục tiêu Afin',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('CLO 2.1')).toBeInTheDocument();
    expect(screen.getByText(/Nguyễn Mộng Hy/i)).toBeInTheDocument();
  });
});
