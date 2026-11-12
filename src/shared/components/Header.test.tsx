import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { AuthProvider } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import { TooltipProvider } from '@/shared/ui';
import { Header } from './Header';

function renderHeaderAt(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TooltipProvider>
        <AuthProvider>
          <ReadingSettingsProvider>
            <Header />
          </ReadingSettingsProvider>
        </AuthProvider>
      </TooltipProvider>
    </MemoryRouter>,
  );
}

describe('Header — 3-Compartment Editorial Masthead & Context Morphing', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useLearningStore.getState().resetLearningStore();
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.removeAttribute('data-skim-mode');
    document.documentElement.removeAttribute('data-reading-size');
  });

  it('hiển thị vỏ viên thuốc bo tròn, logo 8 lá xanh xoáy tâm và trạng thái Active xanh ngọc cho mục đang chọn', () => {
    const { container } = renderHeaderAt('/');

    const header = container.querySelector('header.lu-site-header');
    expect(header).toBeInTheDocument();
    expect(header?.className).toContain('rounded-full');
    expect(header?.className).toContain('h-[66px]');
    expect(header?.className).toContain('w-[min(94vw,1520px)]');
    expect(header?.className).toContain('sticky');

    // Logo 8 lá xanh SVG kèm gradient
    const brandSvg = container.querySelector('header svg[aria-hidden="true"]');
    expect(brandSvg?.querySelectorAll('linearGradient').length).toBe(1);
    expect(brandSvg?.querySelectorAll('g').length).toBe(8);

    expect(screen.getByText('LEARNING')).toBeInTheDocument();
    expect(screen.getByText('UNIVERSE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Không gian học tập/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tất cả môn học' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Thuật ngữ' })).toBeInTheDocument();

    // Mục đang chọn trên trang chủ dùng dáng viên thuốc nền Xanh Ngọc Nhạt thay vì gạch chân đỏ
    const homeLink = screen.getByRole('link', { name: 'Trang chủ' });
    expect(homeLink.className).toContain('rounded-full');
    expect(homeLink.className).toContain('bg-[#1B3D2F]/[0.08]');
  });

  it('hiển thị chip "Học tiếp" từ bài học gần nhất trên Trang chủ và luân phiên gợi ý tìm kiếm mỗi 4 giây', () => {
    vi.useFakeTimers();
    useLearningStore
      .getState()
      .recordLessonVisit('affine-geometry', 'toa-do-afin-va-muc-tieu-afin');

    renderHeaderAt('/');

    const resumeLink = screen.getByRole('link', { name: /Học tiếp: Bài 1\.2/i });
    expect(resumeLink).toHaveAttribute(
      'href',
      '/mon-hoc/hinh-hoc-affine/khong-gian-affine/toa-do-afin-va-muc-tieu-afin',
    );

    expect(screen.getByText('Tìm: Nhóm Klein V₄...')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText('Tìm: Siêu phẳng kính...')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(screen.getByText('Tìm: Tâm tỉ cự...')).toBeInTheDocument();
  });

  it('biến hình Ngăn 2 sang Thanh Ngữ Cảnh Bài Đọc khi cuộn quá 200px, hỗ trợ Đọc lướt, A−/A+, Menu và xoay hoa', () => {
    const { container } = renderHeaderAt(
      '/mon-hoc/hinh-hoc-affine/khong-gian-affine/toa-do-afin-va-muc-tieu-afin',
    );

    const contextBar = screen.getByTestId('reading-context-bar');
    expect(contextBar).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByTestId('header-reading-progress')).toBeInTheDocument();

    // Không hiển thị chip Học tiếp khi đang ở bên trong trang bài học
    expect(screen.queryByRole('link', { name: /Học tiếp:/i })).not.toBeInTheDocument();

    // Giả lập cuộn xuống 300px
    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 300, writable: true, configurable: true });
      fireEvent.scroll(window);
    });

    expect(contextBar).toHaveAttribute('aria-hidden', 'false');
    expect(screen.getByText('Ch.1')).toBeInTheDocument();
    expect(screen.getByText(/Tọa độ Affine/i)).toBeInTheDocument();

    // Kiểm tra hoa 8 cánh xoay theo scrollY * 0.08deg = 24.00deg
    const brandSvg = container.querySelector('header svg[aria-hidden="true"]');
    expect(brandSvg).toHaveStyle({ transform: 'rotate(24.00deg)' });

    // Bật Đọc lướt định lý từ Header
    const skimBtn = screen.getByRole('button', { name: /Đọc lướt định lý/i });
    fireEvent.click(skimBtn);
    expect(skimBtn).toHaveAttribute('aria-pressed', 'true');
    expect(document.body.getAttribute('data-skim-mode')).toBe('true');

    // Chỉnh nhanh cỡ chữ A+
    const incBtn = screen.getByRole('button', { name: 'Tăng cỡ chữ' });
    fireEvent.click(incBtn);
    expect(localStorage.getItem('lu_reading_font_size')).toBe('lg');

    // Bấm nút Menu để khôi phục 4 mục điều hướng chính
    const menuBtn = screen.getByRole('button', { name: 'Mở menu điều hướng chính' });
    fireEvent.click(menuBtn);
    expect(contextBar).toHaveAttribute('aria-hidden', 'true');
  });
});
