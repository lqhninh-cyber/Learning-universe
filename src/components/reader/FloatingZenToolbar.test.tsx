import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ReadingSettingsProvider } from '@/context/ReadingSettingsContext';
import { FloatingZenToolbar } from './FloatingZenToolbar';

describe('FloatingZenToolbar Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    document.body.removeAttribute('data-zen-mode');
  });

  it('kết xuất đầy đủ 4 khối tương tác: Zen Mode, Font Family, Font Sizing, Theme Toggle', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    // 1. Zen mode
    const zenBtn = screen.getByTestId('zen-mode-toggle');
    expect(zenBtn).toBeInTheDocument();
    expect(zenBtn).toHaveAttribute('aria-pressed', 'false');

    // 2. Font family
    const fontBtn = screen.getByTestId('font-family-toggle');
    expect(fontBtn).toBeInTheDocument();
    expect(screen.getByText('Serif')).toBeInTheDocument();

    // 3. Font sizing
    expect(screen.getByTestId('decrease-font-size')).toBeInTheDocument();
    expect(screen.getByText('Vừa')).toBeInTheDocument();
    expect(screen.getByTestId('increase-font-size')).toBeInTheDocument();

    // 4. Theme toggle
    const themeBtn = screen.getByTestId('reading-theme-toggle');
    expect(themeBtn).toBeInTheDocument();
    expect(screen.getByText('Tối')).toBeInTheDocument();
  });

  it('bật Zen Mode khi bấm nút hoặc nhấn phím Z, active với nền vàng #C5A262', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    const zenBtn = screen.getByTestId('zen-mode-toggle');

    // Bấm nút Zen Mode
    fireEvent.click(zenBtn);
    expect(zenBtn).toHaveAttribute('aria-pressed', 'true');
    expect(zenBtn).toHaveClass('bg-[#C5A262]');

    // Thoát Zen Mode bằng phím Esc
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(zenBtn).toHaveAttribute('aria-pressed', 'false');

    // Bật lại bằng phím Z
    fireEvent.keyDown(window, { key: 'z' });
    expect(zenBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('chuyển đổi Serif / Sans khi bấm nút font', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

    const fontBtn = screen.getByTestId('font-family-toggle');
    expect(screen.getByText('Serif')).toBeInTheDocument();

    fireEvent.click(fontBtn);
    expect(screen.getByText('Sans')).toBeInTheDocument();

    fireEvent.click(fontBtn);
    expect(screen.getByText('Serif')).toBeInTheDocument();
  });

  it('tăng và giảm cỡ chữ khi bấm A+ và A-', () => {
    render(
      <ReadingSettingsProvider>
        <FloatingZenToolbar />
      </ReadingSettingsProvider>,
    );

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
});
