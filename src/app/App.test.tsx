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
        name: /Nơi vẻ đẹp Toán học giao hòa cùng Nghệ thuật Sư phạm/i,
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

  it('hiển thị đầy đủ 4 Scene của trang chủ theo phong cách Cinematic Contemporary Editorial', async () => {
    renderWithProviders('/');

    // 1. Scene 01: The Opening (Hero Mở Màn)
    expect(
      await screen.findByText('HỌC VIỆN TRI THỨC TOÁN HỌC & KHOA HỌC GIÁO DỤC'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Nơi vẻ đẹp Toán học giao hòa cùng Nghệ thuật Sư phạm/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Khám phá Không gian Tri thức/i })).toHaveAttribute(
      'href',
      '#khong-gian-mon-hoc',
    );
    expect(
      screen.getByRole('searchbox', { name: /Tìm kiếm môn học hoặc bài học/i }),
    ).toBeInTheDocument();

    // 2. Scene 02: Two Worlds (Hai Cổng Không Gian Tri Thức)
    expect(
      screen.getByRole('heading', { name: /Hai Cổng Không Gian Tri Thức/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Cấu trúc • Không gian • Biến thiên')).toBeInTheDocument();
    expect(screen.getByText('Con người • Phương pháp • Nghệ thuật Dạy học')).toBeInTheDocument();

    // 3. Scene 03: Course Collection (Bộ Sưu Tập Học Phần So Le)
    expect(screen.getByRole('heading', { name: /Bộ Sưu Tập Học Phần So Le/i })).toBeInTheDocument();
    expect(screen.getByText(/Portrait · 3:4/i)).toBeInTheDocument();
    expect(screen.getByText(/Panorama · 16:9/i)).toBeInTheDocument();
    expect(screen.getByText(/Phòng Lab mô phỏng 3D & Mafs/i)).toBeInTheDocument();
    expect(screen.getByText(/Broadsheet Edition/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Vào học phần/i }).length).toBe(4);

    // 4. Scene 04: Continue Exploring & Minimalist Footer
    expect(screen.getByRole('region', { name: /Tiếp tục học dở/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Tiếp tục học/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ngân hàng Thuật ngữ \(Glossary\)/i })).toHaveAttribute(
      'href',
      '/thuat-ngu',
    );
    expect(screen.getByRole('link', { name: /Kho Tài liệu Giáo trình/i })).toBeInTheDocument();
    expect(screen.getByText(/Trải nghiệm tự do ở Chế độ Khách/i)).toBeInTheDocument();
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
