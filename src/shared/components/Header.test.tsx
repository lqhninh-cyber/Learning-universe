import { act, fireEvent, render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IslandProvider, useIsland } from '@/context/IslandContext';
import { writeLessonReadingPosition } from '@/context/island-helpers';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { AuthProvider } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import { TooltipProvider } from '@/shared/ui';
import { Header } from './Header';

function NoticeTriggerProbe() {
  const { triggerIslandNotice } = useIsland();
  return (
    <button
      type="button"
      onClick={() =>
        triggerIslandNotice({
          text: 'Đã hoàn thành Bài 1.2 · Tiến độ HHAVE: 25%',
          type: 'success',
        })
      }
    >
      Trigger Notice
    </button>
  );
}

function renderHeaderAt(initialEntry: string, extraChild?: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TooltipProvider>
        <AuthProvider>
          <ReadingSettingsProvider>
            <IslandProvider>
              <Header />
              {extraChild}
            </IslandProvider>
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

    // Logo Ấn Chương Khuê Văn Hình Học tối giản (vuông bo góc rx=8 nền #1E332E, không gradient/quỹ đạo thừa)
    const brandSvg = container.querySelector('header svg[aria-hidden="true"]');
    expect(brandSvg?.querySelector('rect[rx="8"]')).toHaveAttribute('fill', '#1E332E');
    expect(brandSvg?.querySelectorAll('ellipse').length).toBe(0);
    expect(brandSvg?.querySelectorAll('linearGradient').length).toBe(0);

    expect(screen.getByText('LEARNING')).toBeInTheDocument();
    expect(screen.getByText('UNIVERSE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Trang chủ' })).toBeInTheDocument();
    const learningSpaceLink = screen.getByRole('link', { name: 'Không gian học tập' });
    expect(learningSpaceLink).toBeInTheDocument();
    expect(learningSpaceLink).toHaveAttribute('href', '/learning-space');
    expect(screen.queryByRole('button', { name: /Không gian học tập/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Tất cả môn học' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Thuật ngữ' })).toBeInTheDocument();

    // Mục đang chọn trên trang chủ dùng dáng viên thuốc nền Xanh Đá Phiến Trầm (#1E332E)
    const homeLink = screen.getByRole('link', { name: 'Trang chủ' });
    expect(homeLink.className).toContain('rounded-full');
    expect(homeLink.className).toContain('bg-[#1E332E]');
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

    // Ấn chương Khuê Văn giữ nguyên thế đứng trang trọng khi cuộn trang (không xoay nghiêng)
    const brandSvg = container.querySelector('header svg[aria-hidden="true"]');
    expect(brandSvg).toBeInTheDocument();
    expect(brandSvg?.getAttribute('style') ?? '').not.toContain('rotate(');

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

  it('hiển thị huy hiệu ngữ cảnh môn học động trong "Không gian học tập" khi ở môn học/bài học', () => {
    renderHeaderAt('/mon-hoc/cau-truc-dai-so');
    const badge = screen.getByTestId('island-subject-badge');
    expect(badge).toHaveTextContent('CTĐS');

    const { container } = renderHeaderAt('/');
    expect(container.querySelectorAll('[data-testid="island-subject-badge"]')).toHaveLength(0);
  });

  it('mở thẻ kính mờ xem trước "Học tiếp" khi rê chuột với mục đang đọc dở và % tiến độ', () => {
    vi.useFakeTimers();
    useLearningStore
      .getState()
      .recordLessonVisit('affine-geometry', 'toa-do-afin-va-muc-tieu-afin');
    writeLessonReadingPosition('toa-do-afin-va-muc-tieu-afin', {
      sectionTitle: 'Mục 2. Mục tiêu Affine',
      progressPercent: 48,
    });

    renderHeaderAt('/');
    const resumeLink = screen.getByRole('link', { name: /Học tiếp: Bài 1\.2/i });
    const wrapper = resumeLink.parentElement;
    expect(wrapper).not.toBeNull();

    fireEvent.mouseEnter(wrapper!);
    expect(screen.queryByTestId('resume-preview-card')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(120);
    });

    const previewCard = screen.getByTestId('resume-preview-card');
    expect(previewCard).toBeInTheDocument();
    expect(previewCard).toHaveTextContent('Hình học Affine và Euclide');
    expect(previewCard).toHaveTextContent('Chương 1');
    expect(previewCard).toHaveTextContent(/Đang dừng ở:\s*Mục 2\. Mục tiêu Affine/);
    expect(previewCard).toHaveTextContent('48%');
  });

  it('hiển thị cụm điều khiển đọc nhanh A-/A+/Dịu mắt và nút tìm kiếm thu gọn trên trang bài học', () => {
    renderHeaderAt('/learning-space');
    expect(screen.queryByTestId('quick-reader-controls')).not.toBeInTheDocument();
    expect(screen.queryByTestId('compact-search-trigger')).not.toBeInTheDocument();

    renderHeaderAt('/mon-hoc/hinh-hoc-affine/khong-gian-affine/toa-do-afin-va-muc-tieu-afin');
    expect(screen.getByTestId('quick-reader-controls')).toBeInTheDocument();
    expect(screen.getByTestId('compact-search-trigger')).toBeInTheDocument();

    const incBtns = screen.getAllByRole('button', { name: 'Tăng cỡ chữ' });
    fireEvent.click(incBtns[0]!);
    expect(screen.getByTestId('quick-reader-scale-badge')).toHaveTextContent('105%');

    const comfortBtn = screen.getByTestId('eye-comfort-toggle');
    expect(comfortBtn).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(comfortBtn);
    expect(comfortBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('vận hành đồng hồ Pomodoro, bắn thông báo đồng tâm trên Island và tự đóng sau 2200ms', async () => {
    vi.useFakeTimers();
    renderHeaderAt('/', <NoticeTriggerProbe />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Notice' }));
    const banner = screen.getByTestId('island-notice-banner');
    expect(banner).toHaveTextContent('Đã hoàn thành Bài 1.2 · Tiến độ HHAVE: 25%');

    act(() => {
      vi.advanceTimersByTime(2200);
    });
    expect(screen.queryByTestId('island-notice-banner')).not.toBeInTheDocument();

    // Bật Pomodoro 5 phút và đếm ngược đến hoàn tất
    fireEvent.click(screen.getByTestId('pomodoro-trigger'));
    expect(screen.getByTestId('pomodoro-popover')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Nghỉ ngơi/i }));
    expect(screen.getByTestId('pomodoro-trigger')).toHaveTextContent('05:00');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByTestId('pomodoro-trigger')).toHaveTextContent('04:59');

    await act(async () => {
      vi.advanceTimersByTime(299 * 1000);
      await Promise.resolve();
    });
    expect(screen.getByTestId('island-notice-banner')).toHaveTextContent(/Hoàn thành nhịp học/i);
  });
});
