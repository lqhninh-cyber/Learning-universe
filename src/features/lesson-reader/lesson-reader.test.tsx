import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReadingControlsToolbar } from './ReadingControlsToolbar';
import * as lessonReaderExports from './index';

describe('Thanh công cụ đọc nhanh (ReadingControlsToolbar)', () => {
  it('xuất đầy đủ component và types từ module index', () => {
    expect(lessonReaderExports.ReadingControlsToolbar).toBeDefined();
  });

  it('kết xuất đúng 3 nút cỡ chữ A-, A, A+ và thể hiện trạng thái kích hoạt', () => {
    const handleFontSizeChange = vi.fn();
    const handleToggleFocus = vi.fn();

    render(
      <ReadingControlsToolbar
        fontSize="base"
        onFontSizeChange={handleFontSizeChange}
        isFocusMode={false}
        onToggleFocusMode={handleToggleFocus}
      />,
    );

    const btnSm = screen.getByRole('button', { name: /Cỡ chữ nhỏ/i });
    const btnBase = screen.getByRole('button', { name: /Cỡ chữ chuẩn/i });
    const btnLg = screen.getByRole('button', { name: /Cỡ chữ lớn/i });

    expect(btnSm).toBeInTheDocument();
    expect(btnBase).toBeInTheDocument();
    expect(btnLg).toBeInTheDocument();

    expect(btnBase).toHaveAttribute('aria-pressed', 'true');
    expect(btnSm).toHaveAttribute('aria-pressed', 'false');
    expect(btnLg).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(btnSm);
    expect(handleFontSizeChange).toHaveBeenCalledWith('sm');

    fireEvent.click(btnLg);
    expect(handleFontSizeChange).toHaveBeenCalledWith('lg');
  });

  it('cho phép chuyển đổi chế độ đọc tập trung (Focus Mode)', () => {
    const handleFontSizeChange = vi.fn();
    const handleToggleFocus = vi.fn();

    const { rerender } = render(
      <ReadingControlsToolbar
        fontSize="base"
        onFontSizeChange={handleFontSizeChange}
        isFocusMode={false}
        onToggleFocusMode={handleToggleFocus}
      />,
    );

    const focusBtn = screen.getByRole('button', { name: /Bật chế độ tập trung/i });
    expect(focusBtn).toBeInTheDocument();
    expect(focusBtn).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Chế độ tập trung')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();

    fireEvent.click(focusBtn);
    expect(handleToggleFocus).toHaveBeenCalledTimes(1);

    // Khi chuyển sang trạng thái isFocusMode = true
    rerender(
      <ReadingControlsToolbar
        fontSize="base"
        onFontSizeChange={handleFontSizeChange}
        isFocusMode={true}
        onToggleFocusMode={handleToggleFocus}
      />,
    );

    const exitFocusBtn = screen.getByRole('button', { name: /Thoát chế độ tập trung/i });
    expect(exitFocusBtn).toBeInTheDocument();
    expect(exitFocusBtn).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Thoát tập trung')).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();

    fireEvent.click(exitFocusBtn);
    expect(handleToggleFocus).toHaveBeenCalledTimes(2);
  });
});
