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

  it('hiển thị trang chủ Learning Universe với 2 môn học từ manifest tại /', async () => {
    renderWithProviders('/');

    expect(
      await screen.findByRole('heading', {
        name: /Không gian học tập Toán học đại học/i,
      }),
    ).toBeInTheDocument();
    const algebraLinks = screen.getAllByRole('link', { name: 'Cấu trúc đại số' });
    expect(algebraLinks.length).toBeGreaterThan(0);
    expect(algebraLinks[0]).toHaveAttribute('href', '/mon-hoc/cau-truc-dai-so');

    const affineLinks = screen.getAllByRole('link', { name: 'Hình học Affine' });
    expect(affineLinks.length).toBeGreaterThan(0);
    expect(affineLinks[0]).toHaveAttribute('href', '/mon-hoc/hinh-hoc-affine');
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
    const defItems = await screen.findAllByText('Định nghĩa 1.1.1');
    expect(defItems.length).toBeGreaterThan(0);
  });
});
