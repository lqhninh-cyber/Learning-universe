import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { FloatingZenToolbar } from './FloatingZenToolbar';

describe('FloatingZenToolbar Component (Viên thuốc thu gọn & Bung mở công cụ đọc)', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    document.documentElement.classList.remove('dark');
    document.body.removeAttribute('data-zen-mode');
    document.body.removeAttribute('data-skim-mode');
  });

  it('mặc định hiển thị ở trạng thái thu gọn thành viên thuốc tròn mini "Aa"', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    const trigger = screen.getByTestId('zen-toolbar-trigger');
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Aa');

    // Các nút chi tiết chưa hiển thị khi đang thu gọn
    expect(screen.queryByTestId('zen-mode-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('reading-theme-toggle')).not.toBeInTheDocument();
  });

  it('bung mở thanh công cụ với đầy đủ 3 tính năng cốt lõi và nút [✕] khi click vào viên thuốc', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    // Click vào viên thuốc để mở
    fireEvent.click(screen.getByTestId('zen-toolbar-trigger'));

    // 1. Zen mode
    const zenBtn = screen.getByTestId('zen-mode-toggle');
    expect(zenBtn).toBeInTheDocument();
    expect(zenBtn).toHaveAttribute('aria-pressed', 'false');

    // 2. Không còn nút đổi Font Serif/Sans
    expect(screen.queryByTestId('font-family-toggle')).not.toBeInTheDocument();
    expect(screen.queryByText('Serif')).not.toBeInTheDocument();
    expect(screen.queryByText('Sans')).not.toBeInTheDocument();

    // 3. Cỡ chữ
    expect(screen.getByTestId('decrease-font-size')).toBeInTheDocument();
    expect(screen.getByText('Vừa')).toBeInTheDocument();
    expect(screen.getByTestId('increase-font-size')).toBeInTheDocument();

    // 4. Chế độ theme
    const themeBtn = screen.getByTestId('reading-theme-toggle');
    expect(themeBtn).toBeInTheDocument();
    expect(screen.getByText('Tối')).toBeInTheDocument();

    // 5. Nút đóng [✕]
    const closeBtn = screen.getByTestId('zen-toolbar-close');
    expect(closeBtn).toBeInTheDocument();
  });

  it('thu gọn thanh công cụ lại thành viên thuốc khi nhấn nút [✕] hoặc nhấn Escape', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    // Mở toolbar
    fireEvent.click(screen.getByTestId('zen-toolbar-trigger'));
    expect(screen.getByTestId('zen-mode-toggle')).toBeInTheDocument();

    // Bấm nút [✕] để thu gọn
    fireEvent.click(screen.getByTestId('zen-toolbar-close'));
    expect(screen.queryByTestId('zen-mode-toggle')).not.toBeInTheDocument();
    expect(screen.getByTestId('zen-toolbar-trigger')).toBeInTheDocument();

    // Mở lại và thu gọn bằng phím Escape
    fireEvent.click(screen.getByTestId('zen-toolbar-trigger'));
    expect(screen.getByTestId('zen-mode-toggle')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('zen-mode-toggle')).not.toBeInTheDocument();
    expect(screen.getByTestId('zen-toolbar-trigger')).toBeInTheDocument();
  });

  it('bật Zen Mode khi bấm nút hoặc nhấn phím Z, active với nền vàng #C5A262', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    // Mở toolbar
    fireEvent.click(screen.getByTestId('zen-toolbar-trigger'));

    const zenBtn = screen.getByTestId('zen-mode-toggle');

    // Bấm nút Zen Mode
    fireEvent.click(zenBtn);
    expect(zenBtn).toHaveAttribute('aria-pressed', 'true');
    expect(zenBtn).toHaveClass('bg-[#C5A262]');

    // Thu gọn lại: viên thuốc có chấm báo hiệu Zen Mode
    fireEvent.click(screen.getByTestId('zen-toolbar-close'));
    const trigger = screen.getByTestId('zen-toolbar-trigger');
    expect(trigger.querySelector('span[title="Đang bật chế độ Zen Mode"]')).toBeInTheDocument();

    // Bấm phím Z để tắt Zen Mode
    fireEvent.keyDown(window, { key: 'z' });
    expect(trigger.querySelector('span[title="Đang bật chế độ Zen Mode"]')).not.toBeInTheDocument();
  });

  it('tăng và giảm cỡ chữ khi bấm A+ và A-', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    // Mở toolbar
    fireEvent.click(screen.getByTestId('zen-toolbar-trigger'));

    const incBtn = screen.getByTestId('increase-font-size');
    const decBtn = screen.getByTestId('decrease-font-size');

    expect(screen.getByText('Vừa')).toBeInTheDocument();

    // Tăng lên Lớn
    fireEvent.click(incBtn);
    expect(screen.getByText('Lớn')).toBeInTheDocument();

    // Giảm về Vừa
    fireEvent.click(decBtn);
    expect(screen.getByText('Vừa')).toBeInTheDocument();
  });

  it('chuyển đổi chế độ tối / sáng khi bấm nút theme hoặc phím D', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    // Mở toolbar
    fireEvent.click(screen.getByTestId('zen-toolbar-trigger'));

    const themeBtn = screen.getByTestId('reading-theme-toggle');
    expect(themeBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Tối')).toBeInTheDocument();

    // Bấm nút theme
    fireEvent.click(themeBtn);
    expect(themeBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Sáng')).toBeInTheDocument();

    // Bấm phím D
    fireEvent.keyDown(window, { key: 'd' });
    expect(themeBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Tối')).toBeInTheDocument();
  });

  it('bật/tắt chế độ Đọc lướt định lý từ FloatingZenToolbar và lưu sessionStorage', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    fireEvent.click(screen.getByTestId('zen-toolbar-trigger'));
    const skimBtn = screen.getByTestId('skim-mode-toggle');
    expect(skimBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(skimBtn);
    expect(skimBtn).toHaveAttribute('aria-pressed', 'true');
    expect(sessionStorage.getItem('lu_skim_mode')).toBe('true');

    fireEvent.click(screen.getByTestId('zen-toolbar-close'));
    const trigger = screen.getByTestId('zen-toolbar-trigger');
    expect(
      trigger.querySelector('span[title="Đang bật chế độ Đọc lướt định lý"]'),
    ).toBeInTheDocument();
  });
});
