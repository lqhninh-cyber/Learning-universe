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
    expect(author).toHaveClass('font-mono', 'text-xs', 'text-[#3F6570]', 'not-italic');
  });

  it('renders artistic lotus emblem (LotusCenterLogo) for both mobile and desktop', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const mobileLogoWrapper = container.querySelector('.md\\:hidden.flex.justify-center');
    expect(mobileLogoWrapper).toBeInTheDocument();

    const desktopLogoWrapper = container.querySelector('.hidden.md\\:flex');
    expect(desktopLogoWrapper).toBeInTheDocument();

    const lotusLogos = screen.getAllByTestId('lotus-center-logo');
    expect(lotusLogos.length).toBeGreaterThanOrEqual(2);
    lotusLogos.forEach((logo) => {
      expect(logo.querySelector('svg')).toBeInTheDocument();
      expect(logo).toHaveAttribute('aria-label', 'Biểu trưng Bông sen hồ sương');
    });

    // Cũ monogram vuông không còn tồn tại
    expect(container.querySelectorAll('.w-10.h-10').length).toBe(0);
  });

  it('renders exactly 3 simplified navigation links in a single horizontal row', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const nav = screen.getByRole('navigation', { name: /Điều hướng chân trang/i });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('flex-row', 'items-center');

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
    expect(screen.getByText('-Không gian tri thức mở-')).toBeInTheDocument();
    expect(screen.queryByText(/Bảo lưu bản quyền học thuật/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chuẩn mực & Khách quan/i)).not.toBeInTheDocument();
  });
});
