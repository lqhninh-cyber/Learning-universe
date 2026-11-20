import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer Component (Academic OS Colophon)', () => {
  it('hiển thị thanh colophon tối giản 1 dòng với thương hiệu Learning Universe · Không gian tri thức mở', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const footer = screen.getByTestId('academic-os-footer');
    expect(footer).toBeInTheDocument();
    expect(footer.className).toContain('bg-[var(--bg-workspace)]');
    expect(footer.className).toContain('border-t');
    expect(footer).toHaveTextContent('Learning Universe');
    expect(footer).toHaveTextContent('Không gian tri thức mở');
  });

  it('giữ câu trích dẫn gọn và bản quyền mở, không lặp lại các link điều hướng đã có trên LeftRail', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText(/Không chịu khó học thì không tiến bộ được/i)).toBeInTheDocument();
    expect(screen.getByText(/Bản quyền mở/i)).toBeInTheDocument();

    // Không lặp danh sách liên kết đã nằm cố định ở LeftRail
    expect(screen.queryByRole('link', { name: 'Trang chủ' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Không gian học tập' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Thuật ngữ' })).not.toBeInTheDocument();
  });

  it('hỗ trợ chế độ đọc tối khi truyền isDarkLesson', () => {
    render(
      <MemoryRouter>
        <Footer isDarkLesson />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('academic-os-footer').className).toContain('dark');
  });
});
