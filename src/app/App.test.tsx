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
        name: /Không gian học tập & Khám phá Toán học/i,
      }),
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

  it('hiển thị đầy đủ 7 khu vực của trang chủ theo concept Di sản tri thức & Hình học bản sắc', async () => {
    renderWithProviders('/');

    // 1. Eyebrow & Hero Section
    expect(await screen.findByText('CHÀO MỪNG BẠN ĐẾN VỚI LEARNING UNIVERSE')).toBeInTheDocument();
    expect(
      screen.getByText(/Nơi lưu trữ và chia sẻ hệ thống bài giảng, định lý/i),
    ).toBeInTheDocument();

    // 2. Ô tìm kiếm bài học
    expect(
      screen.getByRole('searchbox', { name: /Tìm kiếm môn học hoặc bài học/i }),
    ).toBeInTheDocument();

    // 3. Khối tiếp tục bài học gần nhất
    expect(screen.getByRole('region', { name: /Tiếp tục bài học gần nhất/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Đọc tiếp bài học/i })).toBeInTheDocument();

    // 4. Khu vực môn học
    expect(screen.getByRole('heading', { name: /Các học phần hiện có/i })).toBeInTheDocument();

    // 4. Khu vực Thư viện tri thức (6 trụ cột)
    expect(screen.getByRole('heading', { name: /THƯ VIỆN TRI THỨC/i })).toBeInTheDocument();
    expect(screen.getByText('Lý thuyết')).toBeInTheDocument();
    expect(screen.getByText('Định nghĩa')).toBeInTheDocument();
    expect(screen.getByText('Định lý & Bổ đề')).toBeInTheDocument();
    expect(screen.getByText('Chứng minh')).toBeInTheDocument();
    expect(screen.getByText('Ví dụ minh họa')).toBeInTheDocument();
    expect(screen.getByText('Bài tập & Lời giải')).toBeInTheDocument();

    // 5. Khu vực Bản đồ tri thức
    expect(
      screen.getByRole('heading', { name: /KẾT NỐI NHỮNG MIỀN TRI THỨC/i }),
    ).toBeInTheDocument();

    // 6. Khu vực Hành trình học tập
    expect(
      screen.getByRole('heading', { name: /HÀNH TRÌNH CHINH PHỤC TRI THỨC/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Trải nghiệm tự do ở Chế độ Khách/i)).toBeInTheDocument();

    // 7. Footer đồng bộ bản sắc
    expect(
      screen.getByText(
        /Nền tảng học tập Toán học đại học đương đại lấy cảm hứng từ cấu trúc Thư viện đình làng/i,
      ),
    ).toBeInTheDocument();
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
    const defItems = await screen.findAllByText(/Định nghĩa \d+\.\d+\.\d+/);
    expect(defItems.length).toBeGreaterThan(0);
  });
});
