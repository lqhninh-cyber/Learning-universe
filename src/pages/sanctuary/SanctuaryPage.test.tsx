import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppShell } from '@/components/layout/AppShell';
import {
  IslandProvider,
  POMODORO_BREAK_AUTOSTART_KEY,
  POMODORO_RETURN_PATH_KEY,
} from '@/context/IslandContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { AuthProvider } from '@/features/auth';
import { TooltipProvider } from '@/shared/ui';
import { SanctuaryPage } from './SanctuaryPage';

function renderSanctuary(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <TooltipProvider>
        <AuthProvider>
          <LayoutProvider initialRailCollapsed={false}>
            <ReadingSettingsProvider>
              <IslandProvider initialPathname={initialEntry}>
                <AppShell>
                  <Routes>
                    <Route path="/thu-gian" element={<SanctuaryPage />} />
                    <Route path="*" element={<div data-testid="other-route">Other Route</div>} />
                  </Routes>
                </AppShell>
              </IslandProvider>
            </ReadingSettingsProvider>
          </LayoutProvider>
        </AuthProvider>
      </TooltipProvider>
    </MemoryRouter>,
  );
}

describe('SanctuaryPage (/thu-gian — Sảnh Thư giãn chuyên biệt)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('mặc định mở tab Bảo tàng 40 Di sản (?tab=di-san), hiển thị thanh chuyển 2 tab trên TopContextBar và nạp lười phòng trưng bày', async () => {
    renderSanctuary('/thu-gian?tab=di-san');

    expect(screen.getByTestId('sanctuary-page')).toHaveAttribute('data-active-tab', 'di-san');
    expect(screen.getByTestId('topbar-breadcrumb')).toHaveTextContent('Sảnh Thư giãn');

    const diSanTab = screen.getByTestId('sanctuary-tab-di-san');
    const bidaTab = screen.getByTestId('sanctuary-tab-bida');
    expect(diSanTab).toHaveAttribute('aria-selected', 'true');
    expect(bidaTab).toHaveAttribute('aria-selected', 'false');

    // Phòng trưng bày 40 Di sản nạp lười thành công + khối Góc nhìn Toán học & Học phần liên quan
    expect(await screen.findByTestId('heritage-art-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('heritage-filmstrip')).toBeInTheDocument();
    expect(screen.getByTestId('heritage-math-connection')).toBeInTheDocument();
    expect(screen.getByTestId('heritage-math-subject-link')).toHaveAttribute(
      'href',
      '/mon-hoc/hinh-hoc-affine',
    );
    expect(screen.queryByTestId('mineral-billiards-stage')).not.toBeInTheDocument();
  });

  it('khi mở tab Bida 8-Ball WPA (?tab=bida) tự động thu gọn LeftRail và nạp lười sân khấu Bida 2.5D', async () => {
    renderSanctuary('/thu-gian?tab=bida');

    expect(screen.getByTestId('sanctuary-page')).toHaveAttribute('data-active-tab', 'bida');
    expect(screen.getByTestId('sanctuary-tab-bida')).toHaveAttribute('aria-selected', 'true');

    // Tự động thu gọn LeftRail để bàn Bida 15 bi chiếm tối đa bề ngang
    expect(screen.getByTestId('left-rail')).toHaveAttribute('data-collapsed', 'true');

    // Nạp lười thành công Bida 8-Ball WPA
    expect(await screen.findByTestId('mineral-billiards-stage')).toBeInTheDocument();
    expect(screen.getByTestId('mineral-billiards-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('billiards-match-hud')).toBeInTheDocument();
  });

  it('chuyển đổi mượt giữa tab Bảo tàng 40 Di sản và Bida 8-Ball WPA, đồng thời hiển thị nút Quay lại bài đang học khi đến từ Pomodoro', async () => {
    const lessonPath =
      '/mon-hoc/cau-truc-dai-so/nhom-va-cac-vi-du-co-ban/nua-nhom-vi-nhom-va-tien-de-nhom';
    sessionStorage.setItem(POMODORO_RETURN_PATH_KEY, lessonPath);

    renderSanctuary('/thu-gian');

    const returnBtn = screen.getByTestId('sanctuary-return-lesson-btn');
    expect(returnBtn).toHaveAttribute('href', lessonPath);
    expect(returnBtn).toHaveTextContent(/Quay lại bài đang học/i);

    // Chuyển sang Bida từ tab switcher trên TopContextBar
    fireEvent.click(screen.getByTestId('sanctuary-tab-bida'));
    expect(screen.getByTestId('sanctuary-page')).toHaveAttribute('data-active-tab', 'bida');
    expect(screen.getByTestId('left-rail')).toHaveAttribute('data-collapsed', 'true');
    expect(await screen.findByTestId('mineral-billiards-stage')).toBeInTheDocument();
  });

  it('tự động chạy Break Countdown 5p/10p khi đến từ Pomodoro và hiện thông báo thị giác nhẹ kèm nút quay về bài khi đếm về 00:00', async () => {
    vi.useFakeTimers();
    const lessonPath =
      '/mon-hoc/cau-truc-dai-so/nhom-va-cac-vi-du-co-ban/nua-nhom-vi-nhom-va-tien-de-nhom';
    sessionStorage.setItem(POMODORO_RETURN_PATH_KEY, lessonPath);
    sessionStorage.setItem(POMODORO_BREAK_AUTOSTART_KEY, '5');

    try {
      renderSanctuary('/thu-gian?tab=di-san');

      const breakPill = screen.getByTestId('sanctuary-break-pill');
      expect(breakPill).toHaveAttribute('data-break-status', 'running');
      expect(screen.getByTestId('sanctuary-break-countdown')).toHaveTextContent('05:00');

      // Chuyển nhanh sang 10 phút rồi quay lại 5 phút
      fireEvent.click(screen.getByTestId('sanctuary-break-10m'));
      expect(screen.getByTestId('sanctuary-break-countdown')).toHaveTextContent('10:00');

      fireEvent.click(screen.getByTestId('sanctuary-break-5m'));
      expect(screen.getByTestId('sanctuary-break-countdown')).toHaveTextContent('05:00');

      // Tua hết 5 phút -> hiện thông báo thị giác nhẹ kèm nút quay về bài đang học
      await act(async () => {
        vi.advanceTimersByTime(301_000);
        await Promise.resolve();
      });

      expect(screen.getByTestId('sanctuary-break-pill')).toHaveAttribute(
        'data-break-status',
        'done',
      );
      expect(screen.getByTestId('sanctuary-break-countdown')).toHaveTextContent('00:00');
      const doneBanner = screen.getByTestId('sanctuary-break-done-banner');
      expect(doneBanner).toBeInTheDocument();
      expect(screen.getByTestId('sanctuary-break-done-return-btn')).toHaveAttribute(
        'href',
        lessonPath,
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
