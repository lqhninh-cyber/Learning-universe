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
    expect(brand).toHaveClass(
      'font-serif',
      'text-[20px]',
      'lg:text-[22px]',
      'font-bold',
      'text-[#F4F1EA]',
    );
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
      'text-[15.5px]',
      'lg:text-[16.5px]',
      'leading-[1.8]',
      'max-w-[740px]',
      'text-[#C4D4CE]',
    );

    const author = screen.getByText(/Chủ tịch Hồ Chí Minh/i);
    expect(author).toBeInTheDocument();
    expect(author).toHaveClass('font-mono', 'text-[14.5px]', 'text-[#D4B47A]', 'not-italic');
  });

  it('renders Minimalist Khue Van Geometric Seal SVG emblem for both mobile and desktop', () => {
    const { container } = render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const mobileLogoWrapper = container.querySelector('.md\\:hidden.flex.justify-center');
    expect(mobileLogoWrapper).toBeInTheDocument();

    const desktopLogoWrapper = container.querySelector('.hidden.md\\:flex');
    expect(desktopLogoWrapper).toBeInTheDocument();

    const brandEmblems = screen.getAllByTestId('footer-brand-logo');
    expect(brandEmblems.length).toBeGreaterThanOrEqual(2);
    brandEmblems.forEach((emblem) => {
      expect(emblem.querySelector('svg')).toBeInTheDocument();
    });

    // Ảnh lá xanh cũ đã được thay bằng huy hiệu Sao Khuê SVG
    expect(screen.queryByAltText('Learning Universe Logo')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.w-10.h-10').length).toBe(0);
  });

  it('renders 3 simplified navigation links without duplicate Tất cả môn học link', () => {
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

    const learningSpaceLink = screen.getByRole('link', { name: 'Không gian học tập' });
    expect(learningSpaceLink).toHaveAttribute('href', '/learning-space');

    expect(screen.queryByRole('link', { name: 'Tất cả môn học' })).not.toBeInTheDocument();

    const glossaryLink = screen.getByRole('link', { name: 'Thuật ngữ' });
    expect(glossaryLink).toHaveAttribute('href', '/thuat-ngu');

    // Ensure individual course links are removed from footer
    expect(screen.queryByRole('link', { name: 'Cấu trúc đại số' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Hình học Affine/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Giải tích hàm một biến/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Giáo dục học' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Ngân hàng Thuật ngữ' })).not.toBeInTheDocument();
  });

  it('renders updated bottom bar metadata without intro replay button', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );

    const copyright = screen.getByText('Learning Universe. Bản quyền mở.');
    expect(copyright).toBeInTheDocument();
    expect(copyright.parentElement).toHaveClass('text-[15px]', 'font-medium');
    expect(screen.getByText('~Không gian tri thức mở~')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toHaveClass(
      'text-[15px]',
      'font-medium',
    );
    expect(
      screen.queryByRole('button', { name: /Trải nghiệm lại nghi thức tĩnh tâm/i }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Bảo lưu bản quyền học thuật/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chuẩn mực & Khách quan/i)).not.toBeInTheDocument();
  });
});
