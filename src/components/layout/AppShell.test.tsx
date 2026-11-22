import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IslandProvider, POMODORO_RETURN_PATH_KEY, useIsland } from '@/context/IslandContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { AuthProvider } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import { TooltipProvider } from '@/shared/ui';
import { AppShell } from './AppShell';

function LocationProbe() {
  const { pathname, search, hash } = useLocation();
  return <div data-testid="location-probe">{`${pathname}${search}${hash}`}</div>;
}

function NoticeTriggerProbe() {
  const { triggerIslandNotice } = useIsland();
  return (
    <button
      type="button"
      onClick={() => triggerIslandNotice({ text: 'Đã lưu tiến độ học tập', type: 'success' })}
    >
      Trigger OS Notice
    </button>
  );
}

function renderAppShell(
  initialEntry: string,
  options?: { readonly isLessonPage?: boolean; readonly extraChild?: ReactNode },
) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TooltipProvider>
        <AuthProvider>
          <LayoutProvider initialRailCollapsed={false}>
            <ReadingSettingsProvider>
              <IslandProvider initialPathname={initialEntry}>
                <AppShell isLessonPage={options?.isLessonPage}>
                  <LocationProbe />
                  {options?.extraChild}
                </AppShell>
              </IslandProvider>
            </ReadingSettingsProvider>
          </LayoutProvider>
        </AuthProvider>
      </TooltipProvider>
    </MemoryRouter>,
  );
}

describe('Academic OS AppShell, LeftRail, TopContextBar & CommandPalette (⌘K)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    useLearningStore.getState().resetLearningStore();
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    document.body.classList.remove('overflow-hidden');
  });

  it('kết xuất đầy đủ LeftRail 4 mục điều hướng, TopContextBar breadcrumb và thu gọn/mở rộng Rail qua nút & phím [', () => {
    renderAppShell('/mon-hoc/hinh-hoc-affine/khong-gian-affine/toa-do-afin-va-muc-tieu-afin', {
      isLessonPage: true,
    });

    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    const rail = screen.getByTestId('left-rail');
    expect(rail).toHaveAttribute('data-collapsed', 'false');
    expect(rail.className).toContain('w-[232px]');

    // 4 mục điều hướng chính chuẩn Academic OS trong LeftRail
    expect(within(rail).getByRole('link', { name: 'Tổng quan' })).toHaveAttribute('href', '/');
    expect(within(rail).getByRole('link', { name: 'Không gian học tập' })).toHaveAttribute(
      'href',
      '/learning-space',
    );
    expect(within(rail).getByRole('link', { name: 'Kho Thuật ngữ' })).toHaveAttribute(
      'href',
      '/thuat-ngu',
    );
    expect(within(rail).getByRole('link', { name: 'Soạn đề' })).toHaveAttribute('href', '/soan-de');
    expect(within(rail).getByRole('link', { name: 'Bảng viết' })).toHaveAttribute(
      'href',
      '/bang-viet',
    );
    expect(within(rail).getByRole('link', { name: 'Sảnh Thư giãn' })).toHaveAttribute(
      'href',
      '/thu-gian?tab=di-san',
    );

    // Breadcrumb ngữ cảnh & bộ điều khiển đọc bài trên TopContextBar
    const breadcrumb = screen.getByTestId('topbar-breadcrumb');
    expect(breadcrumb).toHaveTextContent('Không gian học tập');
    expect(breadcrumb).toHaveTextContent('Hình học Affine');
    expect(breadcrumb).toHaveTextContent('Bài 1.2');
    expect(screen.getByTestId('quick-reader-controls')).toBeInTheDocument();
    expect(screen.getByTestId('header-reading-progress')).toBeInTheDocument();

    // Nút ⌘K trên TopContextBar ẩn ở desktop (md:hidden) khi Rail đang mở rộng (chống trùng lặp)
    const topbarCmdBtn = screen.getByTestId('topbar-command-trigger');
    expect(topbarCmdBtn.className).toContain('md:hidden');

    // Thu gọn Rail bằng nút bấm & lưu localStorage -> TopContextBar hiển thị lại nút ⌘K
    fireEvent.click(screen.getByTestId('rail-collapse-toggle'));
    expect(rail).toHaveAttribute('data-collapsed', 'true');
    expect(rail.className).toContain('w-[60px]');
    expect(localStorage.getItem('lu_rail_collapsed')).toBe('true');
    expect(screen.getByTestId('topbar-command-trigger').className).not.toContain('md:hidden');

    // Mở rộng lại bằng phím tắt `[` -> TopContextBar ẩn nút ⌘K trên desktop
    fireEvent.keyDown(window, { key: '[' });
    expect(rail).toHaveAttribute('data-collapsed', 'false');
    expect(localStorage.getItem('lu_rail_collapsed')).toBe('false');
    expect(screen.getByTestId('topbar-command-trigger').className).toContain('md:hidden');
  });

  it('tích hợp đầy đủ tiện ích đáy Rail: Học tiếp, Pomodoro, chuyển Sáng/Tối Ceramic↔Obsidian và thông báo TopContextBar', () => {
    useLearningStore
      .getState()
      .recordLessonVisit('affine-geometry', 'toa-do-afin-va-muc-tieu-afin');

    renderAppShell('/', { extraChild: <NoticeTriggerProbe /> });

    // Thẻ "Học tiếp"
    const resumeLink = screen.getByTestId('rail-resume-link');
    expect(resumeLink).toHaveAttribute(
      'href',
      '/mon-hoc/hinh-hoc-affine/khong-gian-affine/toa-do-afin-va-muc-tieu-afin',
    );

    // Chuyển Sáng -> Tối (Obsidian Studio)
    const themeToggle = screen.getByTestId('rail-theme-toggle');
    expect(themeToggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(themeToggle);
    expect(themeToggle).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');

    // Thông báo đồng tâm hiển thị trên TopContextBar
    fireEvent.click(screen.getByRole('button', { name: 'Trigger OS Notice' }));
    expect(screen.getByTestId('island-notice-banner')).toHaveTextContent('Đã lưu tiến độ học tập');

    // Pomodoro trong Rail mở được popover & đếm ngược
    fireEvent.click(screen.getByTestId('pomodoro-trigger'));
    expect(screen.getByTestId('pomodoro-popover')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /25 phút/i }));
    expect(screen.getByTestId('pomodoro-countdown')).toHaveTextContent('25:00');
  });

  it('mở CommandPalette bằng Ctrl+K, tìm không dấu tiếng Việt (nhom thuong, bi da, khue van), điều hướng phím và đóng bằng Esc', () => {
    renderAppShell('/');

    expect(screen.queryByTestId('os-command-palette')).not.toBeInTheDocument();

    // Mở bằng Ctrl+K
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    const dialog = screen.getByTestId('os-command-palette');
    expect(dialog).toBeInTheDocument();

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();

    // Tìm không dấu "nhom thuong" -> ra bài giảng / thuật ngữ Nhóm thương
    fireEvent.change(input, { target: { value: 'nhom thuong' } });
    expect(dialog).toHaveTextContent(/Nhóm thương/i);

    // Tìm không dấu "bi da" -> ra lệnh Đi tới Bida 8-Ball
    fireEvent.change(input, { target: { value: 'bi da' } });
    expect(dialog).toHaveTextContent(/Bida 8-Ball/i);

    // Tìm không dấu "khue van" -> ra di sản Khuê Văn Các
    fireEvent.change(input, { target: { value: 'khue van' } });
    expect(dialog).toHaveTextContent(/Khuê Văn Các/i);

    // Phím `[` khi đang focus trong input tìm kiếm không làm thu gọn Rail
    fireEvent.keyDown(input, { key: '[' });
    expect(screen.getByTestId('left-rail')).toHaveAttribute('data-collapsed', 'false');

    // Đóng bằng phím Esc
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByTestId('os-command-palette')).not.toBeInTheDocument();

    // Mở lại bằng nút ⌘K, thực thi lệnh đổi chế độ Sáng/Tối bằng Enter
    fireEvent.click(screen.getByTestId('topbar-command-trigger'));
    const inputAgain = screen.getByRole('combobox');
    fireEvent.change(inputAgain, { target: { value: 'che do toi' } });
    act(() => {
      fireEvent.keyDown(inputAgain, { key: 'Enter' });
    });
    expect(screen.queryByTestId('os-command-palette')).not.toBeInTheDocument();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('hiện toast cầu nối Pomodoro -> Sảnh Thư giãn khi hết giờ tập trung và lưu lu_pomodoro_return_path khi đang ở bài học', async () => {
    vi.useFakeTimers();
    const lessonPath =
      '/mon-hoc/cau-truc-dai-so/nhom-va-cac-vi-du-co-ban/nua-nhom-vi-nhom-va-tien-de-nhom';

    function QuickPomodoroTrigger() {
      const { startPomodoro } = useIsland();
      return (
        <button type="button" onClick={() => startPomodoro(1, 'Kiểm thử')}>
          Start 1m Pomodoro
        </button>
      );
    }

    try {
      renderAppShell(lessonPath, { extraChild: <QuickPomodoroTrigger /> });

      fireEvent.click(screen.getByRole('button', { name: 'Start 1m Pomodoro' }));

      await act(async () => {
        vi.advanceTimersByTime(61_000);
        await Promise.resolve();
      });

      const breakToast = screen.getByTestId('pomodoro-break-toast');
      expect(breakToast).toBeInTheDocument();
      expect(breakToast).toHaveTextContent(/Hoàn thành phiên tập trung/i);
      expect(within(breakToast).getByRole('link', { name: /Đánh Bida/i })).toHaveAttribute(
        'href',
        '/thu-gian?tab=bida',
      );
      expect(within(breakToast).getByRole('link', { name: /Ngắm Di sản/i })).toHaveAttribute(
        'href',
        '/thu-gian?tab=di-san',
      );
      expect(sessionStorage.getItem(POMODORO_RETURN_PATH_KEY)).toBe(lessonPath);
    } finally {
      vi.useRealTimers();
    }
  });
});
