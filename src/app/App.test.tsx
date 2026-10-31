import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { routes } from '@/app/router';
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
  it('hiển thị trang chủ Learning Universe tại đường dẫn gốc /', async () => {
    renderWithProviders('/');

    expect(
      await screen.findByRole('heading', {
        name: /Không gian học tập Toán học đại học/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Nhóm, Vành và Trường/i })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /Không gian và Ánh xạ Affine/i }),
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
});
