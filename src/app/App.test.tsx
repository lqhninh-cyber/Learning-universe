import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { beforeEach, describe, expect, it } from 'vitest';
import { routes } from '@/app/router';
import { useLearningStore } from '@/features/learning';
import { MotionProvider } from '@/shared/motion/MotionProvider';
import { TooltipProvider } from '@/shared/ui/Tooltip';

function renderWithProviders(initialEntry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return render(
    <MotionProvider>
      <TooltipProvider>
        <RouterProvider router={router} />
      </TooltipProvider>
    </MotionProvider>,
  );
}

describe('App routing smoke test', () => {
  beforeEach(() => {
    useLearningStore.getState().resetLearningStore();
  });

  it('hiển thị trang chủ Learning Universe với các môn học từ manifest tại /', async () => {
    renderWithProviders('/');

    expect(
      await screen.findByRole('heading', {
        name: /LEARNING UNIVERSE/i,
      }),
    ).toBeInTheDocument();
    // Floating Capsule Island Header: Wordmark LEARNING UNIVERSE, nút Tìm kiếm ⌘K và Avatar tối giản
    expect(screen.getByRole('button', { name: /Mở tìm kiếm nhanh/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Tài khoản và cài đặt giao diện/i }),
    ).toBeInTheDocument();
    const algebraLinks = screen.getAllByRole('link', { name: 'Cấu trúc đại số' });
    expect(algebraLinks.length).toBeGreaterThan(0);
    expect(algebraLinks[0]).toHaveAttribute('href', '/mon-hoc/cau-truc-dai-so');

    const affineLinks = screen.getAllByRole('link', {
      name: 'Hình học Affine và hình học Euclide',
    });
    expect(affineLinks.length).toBeGreaterThan(0);
    expect(affineLinks[0]).toHaveAttribute('href', '/mon-hoc/hinh-hoc-affine');

    const calculusLinks = screen.getAllByRole('link', {
      name: 'Giải tích hàm một biến',
    });
    expect(calculusLinks.length).toBeGreaterThan(0);
    expect(calculusLinks[0]).toHaveAttribute('href', '/mon-hoc/giai-tich-ham-mot-bien');
  });

  it('hiển thị đầy đủ kiến trúc trang chủ The Living Atlas (4-Layer Hero, Spatial Subject Gallery, My Learning Orbit & Knowledge Thread)', async () => {
    renderWithProviders('/');

    // 1. Hero Section — THE LIVING ATLAS (Hero Di sản, Rotating Quotes & The Knowledge Thread)
    expect(await screen.findByRole('heading', { name: /Đi một ngày đàng/i })).toBeInTheDocument();
    expect(screen.getByText(/— Tục ngữ Việt Nam/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /Không gian hỗ trợ Toán học và Khoa học Giáo dục, đồng hành cùng người học trên bước đường học tập/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByText('LEARNING UNIVERSE').length).toBeGreaterThan(0);
    expect(screen.getByText(/TOÁN HỌC & KHOA HỌC GIÁO DỤC · HCMUE/i)).toBeInTheDocument();
    expect(screen.getByText(/04 HỌC PHẦN · 123 BÀI GIẢNG · ĐỒNG BỘ 2026/i)).toBeInTheDocument();
    expect(screen.getByTestId('the-knowledge-thread')).toBeInTheDocument();
    expect(screen.getByTestId('rotating-scholarly-quote')).toBeInTheDocument();
    expect(screen.getByTestId('heritage-art-showcase')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Khám phá không gian tri thức/i })).toHaveAttribute(
      'href',
      '#khong-gian-mon-hoc',
    );
    expect(screen.getByRole('link', { name: /Tra cứu thuật ngữ KaTeX/i })).toHaveAttribute(
      'href',
      '/glossary',
    );

    // Đảm bảo không lộ các nhãn nội bộ
    expect(screen.queryByText(/SCREEN 01/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SCREEN 02/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cảnh quan hiện tại/i)).not.toBeInTheDocument();

    // 2. Spatial Subject Gallery (3 Tabs phân loại & DUY NHẤT 01 ô tìm kiếm thông minh)
    expect(screen.getByRole('heading', { name: /Không gian Học phần/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Tất cả/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Toán học/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Khoa học Giáo dục/i })).toBeInTheDocument();

    const searchboxes = screen.getAllByRole('searchbox', {
      name: /Tìm kiếm môn học hoặc bài học/i,
    });
    expect(searchboxes).toHaveLength(1);

    expect(screen.getAllByText('Toán học').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Khoa học Giáo dục').length).toBeGreaterThan(0);
    expect(screen.queryByText(/MATH1301|MATH1302|MATH1303|EDUC2802/i)).not.toBeInTheDocument();

    const enterCourseLinks = screen.getAllByRole('link', { name: /Vào học phần/i });
    expect(enterCourseLinks.length).toBe(4);
    expect(enterCourseLinks[0]).toHaveAttribute('href', '/courses/cau-truc-dai-so');

    // 3. My Learning Orbit (Bố cục bất đối xứng 65% Hero Progress Card : 35% 2 Thẻ tiện ích)
    expect(screen.getByRole('heading', { name: /Tiếp tục học tập/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Tiếp tục học dở/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Bài 1\.1: Hoạt động sư phạm của người giáo viên/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tiếp tục đọc ngay/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Ngân hàng Thuật ngữ KaTeX/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Phòng Lab Hình học 3D/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Mở Ngân hàng Thuật ngữ & Ký hiệu Toán/i }),
    ).toHaveAttribute('href', '/glossary');
    expect(screen.getByRole('link', { name: /Mở Phòng Lab Hình học Không gian/i })).toHaveAttribute(
      'href',
      '/interactive/affine-geometry.html',
    );
    expect(
      screen.getByText(/Tiến độ học tập cá nhân được lưu an toàn trên trình duyệt/i),
    ).toBeInTheDocument();

    // Đảm bảo không còn lộ dữ liệu cá nhân hoặc link thư mục Drive tổng
    expect(screen.queryByText(/Đang đồng bộ:/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Supabase Cloud/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Kho Tài liệu Giáo trình/i)).not.toBeInTheDocument();
  });

  it('hiển thị Cinematic Course Cover tràn viền tại /courses/cau-truc-dai-so', async () => {
    renderWithProviders('/courses/cau-truc-dai-so');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cấu trúc đại số' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Toán học').length).toBeGreaterThan(0);
    expect(screen.queryByText(/MATH1301/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('10 chương · 39 bài học').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Tiếp tục học: Bài/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đọc giáo trình PDF/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Ôn tập$/i })).toBeInTheDocument();
    expect(screen.queryByText(/Ngân hàng Đề thi & Lời giải/i)).not.toBeInTheDocument();
  });

  it('hiển thị trang Danh mục Học phần (/courses) đồng bộ phong cách Apple Card', async () => {
    renderWithProviders('/courses');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Danh mục Học phần' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Tất cả' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Toán học' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Khoa học Giáo dục' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Vào học phần Cấu trúc đại số/i })).toHaveAttribute(
      'href',
      '/courses/cau-truc-dai-so',
    );
  });

  it('hiển thị trang 404 tiếng Việt khi truy cập đường dẫn không tồn tại', async () => {
    renderWithProviders('/duong-dan-khong-ton-tai');

    expect(
      await screen.findByRole('heading', {
        name: /Không tìm thấy trang bạn yêu cầu/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Về trang chủ/i })).toHaveAttribute('href', '/');
  });

  it('hiển thị trang kiểm thử Content Engine tại /dev/mdx ở chế độ DEV', async () => {
    renderWithProviders('/dev/mdx');

    expect(
      await screen.findByRole('heading', {
        name: /Content Engine & Academic MDX/i,
      }),
    ).toBeInTheDocument();
    const defItems = await screen.findAllByText(/Định nghĩa \d+\.\d+\.\d+/, {}, { timeout: 10000 });
    expect(defItems.length).toBeGreaterThan(0);
  });
});
