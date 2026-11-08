import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { Footer } from './Footer';

describe('Footer Component', () => {
  it('renders branding "Learning Universe" without old tagline', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const brand = screen.getByText('Learning Universe');
    expect(brand).toBeInTheDocument();
    expect(brand).toHaveClass('font-serif', 'text-base', 'font-semibold', 'text-[#29383D]');
    expect(screen.queryByText(/· Toán học & Sư phạm/i)).not.toBeInTheDocument();
  });

  it('renders President Ho Chi Minh quotation and citation', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const quoteText = screen.getByText(/Chúng ta phải học, phải cố gắng học nhiều/i);
    expect(quoteText).toBeInTheDocument();
    expect(quoteText.tagName.toLowerCase()).toBe('blockquote');
    expect(quoteText).toHaveClass(
      'font-serif',
      'italic',
      'text-xs',
      'md:text-sm',
      'text-[#55676B]',
      'leading-relaxed',
    );

    const author = screen.getByText(/Chủ tịch Hồ Chí Minh/i);
    expect(author).toBeInTheDocument();
    expect(author).toHaveClass('font-mono', 'text-[11px]', 'text-[#3F6570]', 'not-italic');
  });

  it('renders center monogram logo for both mobile and desktop', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const mobileLogoWrapper = container.querySelector('.md\\:hidden.flex.justify-center');
    expect(mobileLogoWrapper).toBeInTheDocument();

    const desktopLogoWrapper = container.querySelector('.hidden.md\\:flex');
    expect(desktopLogoWrapper).toBeInTheDocument();

    const logoBoxes = container.querySelectorAll('.w-10.h-10');
    expect(logoBoxes.length).toBeGreaterThanOrEqual(2);
    logoBoxes.forEach((box) => {
      expect(box).toHaveClass(
        'rounded-xl',
        'border',
        'border-[#CFDADB]',
        'bg-[#E1E9EA]/50',
        'text-[#3F6570]',
      );
      expect(box.querySelector('svg')).toBeInTheDocument();
    });
  });

  it('renders exactly 3 simplified navigation links and removes individual subject links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const nav = screen.getByRole('navigation', { name: /Điều hướng chân trang/i });
    expect(nav).toBeInTheDocument();

    const homeLink = screen.getByRole('link', { name: 'Trang chủ' });
    expect(homeLink).toHaveAttribute('href', '/');

    const coursesLink = screen.getByRole('link', { name: 'Tất cả môn học' });
    expect(coursesLink).toHaveAttribute('href', '/courses');

    const glossaryLink = screen.getByRole('link', { name: 'Thuật ngữ' });
    expect(glossaryLink).toHaveAttribute('href', '/thuat-ngu');

    // Ensure individual course links are removed from footer
    expect(screen.queryByRole('link', { name: 'Cấu trúc đại số' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Hình học Affine/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Giải tích hàm một biến/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Giáo dục học' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ngân hàng Thuật ngữ' })).not.toBeInTheDocument();
  });

  it('renders updated bottom bar metadata', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    expect(screen.getByText('Learning Universe. Bản quyền mở.')).toBeInTheDocument();
    expect(screen.getByText('Không gian tri thức mở')).toBeInTheDocument();
    expect(screen.queryByText(/Bảo lưu bản quyền học thuật/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chuẩn mực & Khách quan/i)).not.toBeInTheDocument();
  });
});
