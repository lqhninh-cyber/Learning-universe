import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { ColorSystemPreviewPage } from './ColorSystemPreviewPage';

describe('Trang xem trước hệ màu độc lập (/color-system-preview)', () => {
  it('kết xuất thành công trang xem trước với scope data-theme="mist-blue-sage"', () => {
    const { container } = render(
      <MemoryRouter>
        <ColorSystemPreviewPage />
      </MemoryRouter>,
    );

    const themeContainer = container.querySelector('[data-theme="mist-blue-sage"]');
    expect(themeContainer).toBeInTheDocument();
    expect(themeContainer?.className).toContain('theme-mist-blue-sage');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /Bảng màu “Mist Blue & Sage”/i,
      }),
    ).toBeInTheDocument();
  });

  it('hiển thị đầy đủ danh mục Design Tokens (Nền, Tương tác, Chữ, Tín hiệu và Khối học phần)', () => {
    render(
      <MemoryRouter>
        <ColorSystemPreviewPage />
      </MemoryRouter>,
    );

    // Surfaces
    expect(screen.getByText('--bg-main')).toBeInTheDocument();
    expect(screen.getByText('#EAF0F1')).toBeInTheDocument();
    expect(screen.getByText('--surface-primary')).toBeInTheDocument();
    expect(screen.getByText('#F7FAFA')).toBeInTheDocument();
    expect(screen.getByText('--surface-secondary')).toBeInTheDocument();
    expect(screen.getByText('--surface-tertiary')).toBeInTheDocument();
    expect(screen.getByText('--border-subtle')).toBeInTheDocument();

    // Brand & Interactive
    expect(screen.getByText('--primary')).toBeInTheDocument();
    expect(screen.getByText('#3F6570')).toBeInTheDocument();
    expect(screen.getByText('--primary-hover')).toBeInTheDocument();
    expect(screen.getByText('--secondary')).toBeInTheDocument();
    expect(screen.getByText('#5E786D')).toBeInTheDocument();
    expect(screen.getByText('--accent')).toBeInTheDocument();
    expect(screen.getByText('#92714F')).toBeInTheDocument();

    // Typography
    expect(screen.getByText('--text-primary')).toBeInTheDocument();
    expect(screen.getByText('#29383D')).toBeInTheDocument();
    expect(screen.getByText('--text-secondary')).toBeInTheDocument();
    expect(screen.getByText('#55676B')).toBeInTheDocument();

    // Semantic Colors
    expect(screen.getByText('--success')).toBeInTheDocument();
    expect(screen.getByText('--warning')).toBeInTheDocument();
    expect(screen.getByText('--danger')).toBeInTheDocument();
    expect(screen.getByText('--info')).toBeInTheDocument();

    // Subject Accents
    expect(screen.getByText('--math-accent')).toBeInTheDocument();
    expect(screen.getByText('--math-light')).toBeInTheDocument();
    expect(screen.getByText('--edu-accent')).toBeInTheDocument();
    expect(screen.getByText('--edu-light')).toBeInTheDocument();
  });

  it('kết xuất Bảng kiểm định tỷ lệ tương phản WCAG 2.2 AA với đầy đủ các cặp màu', () => {
    render(
      <MemoryRouter>
        <ColorSystemPreviewPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /3\. Bảng Kiểm Định Tỷ Lệ Tương Phản/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Text Primary (#29383D)')).toBeInTheDocument();
    expect(screen.getByText('10.3 : 1')).toBeInTheDocument();
    expect(screen.getByText('11.3 : 1')).toBeInTheDocument();
    expect(screen.getByText('5.55 : 1')).toBeInTheDocument();
    expect(screen.getByText('5.14 : 1')).toBeInTheDocument();
  });

  it('kết xuất linh kiện mẫu bài đọc với liên kết PDF Google Drive và thanh kiến thức tiên quyết', () => {
    render(
      <MemoryRouter>
        <ColorSystemPreviewPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Định lý Lagrange và Cấp của Phần tử')).toBeInTheDocument();
    expect(screen.getByText('Kiến thức tiên quyết:')).toBeInTheDocument();
    expect(
      screen.getByText(/Bài 3\.1: Lớp kề, phân hoạch và chỉ số của nhóm con/i),
    ).toBeInTheDocument();

    const pdfLink = screen.getByRole('link', {
      name: /Đọc giáo trình PDF \(Trang 59–63\)/i,
    });
    expect(pdfLink).toBeInTheDocument();
    expect(pdfLink).toHaveAttribute(
      'href',
      'https://drive.google.com/file/d/17drWozpQN-4jt4si1hhCHoXslUFkYtKm/view',
    );
  });
});
