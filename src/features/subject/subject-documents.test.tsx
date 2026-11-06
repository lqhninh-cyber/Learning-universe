import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from '@/app/router';
import { getSubjectBySlug } from '@/content-runtime';
import { ALGEBRAIC_STRUCTURES_DOCUMENTS } from '@/data/courses/cau-truc-dai-so/course';
import { CALCULUS_DOCUMENTS } from '@/data/courses/giai-tich-ham-mot-bien/course';
import { PEDAGOGY_DOCUMENTS } from '@/data/courses/giao-duc-hoc/course';
import { AFFINE_GEOMETRY_DOCUMENTS } from '@/data/courses/hinh-hoc-affine/course';
import { DocumentCard } from '@/features/subject/DocumentCard';
import { SubjectBibliography } from '@/features/subject/SubjectBibliography';
import { COURSE_DIRECT_PDF_LINKS } from '@/shared/config/routes';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return {
    router,
    ...render(
      <MotionProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </MotionProvider>,
    ),
  };
}

describe('Kiểm tra liên kết tài liệu trực tiếp Google Drive & Tối ưu giao diện tài liệu', () => {
  it('1. Cấu hình liên kết trực tiếp cho từng môn học trong src/data/courses/ chính xác', () => {
    // Cấu trúc đại số
    expect(ALGEBRAIC_STRUCTURES_DOCUMENTS[0]?.url).toBe(
      'https://drive.google.com/file/d/17drWozpQN-4jt4si1hhCHoXslUFkYtKm/view?usp=drive_link',
    );

    // Hình học Affine
    expect(AFFINE_GEOMETRY_DOCUMENTS[0]?.url).toBe(
      'https://drive.google.com/file/d/1_8iCwa-pkqmD8wNyMwKiqMKJwq4m9hxw/view?usp=drive_link',
    );

    // Giải tích hàm một biến
    expect(CALCULUS_DOCUMENTS[0]?.url).toBe(
      'https://drive.google.com/file/d/1VWzmofOUrvvHF_Jz7vViVy3zLNZPhL7Z/view?usp=drive_link',
    );
    expect(CALCULUS_DOCUMENTS[1]?.url).toBe(
      'https://drive.google.com/file/d/1DPL759PtZj44I7VcCCTjfN2kkRYNZoVK/view?usp=drive_link',
    );

    // Giáo dục học
    const gdhPrimary = PEDAGOGY_DOCUMENTS.find((d) => d.id === 'gt-gdh-hcmue');
    expect(gdhPrimary?.url).toBe(
      'https://drive.google.com/file/d/1Jc3J6XZd7HKHOCsJu9w6C84FIsCNS3iM/view?usp=drive_link',
    );
  });

  it('2. DocumentCard mở liên kết trên tab mới với target="_blank" rel="noopener noreferrer"', () => {
    render(
      <DocumentCard
        title="Giáo trình kiểm thử"
        url="https://drive.google.com/file/d/17drWozpQN-4jt4si1hhCHoXslUFkYtKm/view?usp=drive_link"
        filename="test.pdf"
      />,
    );

    const openLink = screen.getByRole('link', { name: /Mở tài liệu/i });
    expect(openLink).toHaveAttribute(
      'href',
      'https://drive.google.com/file/d/17drWozpQN-4jt4si1hhCHoXslUFkYtKm/view?usp=drive_link',
    );
    expect(openLink).toHaveAttribute('target', '_blank');
    expect(openLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('3. Nút "Đọc giáo trình PDF" trong SubjectBibliography mở trực tiếp file PDF tương ứng trên Drive', () => {
    const ctdsSubject = getSubjectBySlug('cau-truc-dai-so');
    expect(ctdsSubject).toBeDefined();

    if (ctdsSubject) {
      render(<SubjectBibliography subject={ctdsSubject} />);
      const readBtn = screen.getByRole('link', { name: /Đọc giáo trình PDF/i });
      expect(readBtn).toHaveAttribute('href', COURSE_DIRECT_PDF_LINKS['cau-truc-dai-so']);
      expect(readBtn).toHaveAttribute('target', '_blank');
      expect(readBtn).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('4. Tab Tài liệu môn học không còn banner mở thư mục tổng Google Drive', async () => {
    const user = userEvent.setup();
    renderRoute('/mon-hoc/giao-duc-hoc');

    // Chuyển sang Tab Tài liệu & Văn bản
    const docTab = await screen.findByRole('tab', { name: /Tài liệu & Văn bản/i });
    await user.click(docTab);

    // Xác nhận KHÔNG CÒN banner tổng
    expect(screen.queryByText(/Kho Tài liệu & Giáo trình Trực tuyến/i)).toBeNull();
    expect(screen.queryByText(/Mở Toàn bộ Thư mục Tài liệu/i)).toBeNull();

    // Xác nhận hiển thị trực tiếp danh sách tài liệu
    expect(
      screen.getByText(/Hệ thống Tài liệu học tập, Giáo trình & Văn bản quy phạm pháp luật/i),
    ).toBeInTheDocument();
  });
});
