import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openWaterTouchIntro, WaterTouchIntro } from './index';

describe('WaterTouchIntro Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('hiển thị màn hình mở đầu khi chưa có cờ lu_intro_seen', () => {
    render(<WaterTouchIntro />);

    const dialog = screen.getByRole('dialog', { name: /Màn hình tĩnh tâm mở đầu/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Nghi thức khởi tâm/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bỏ qua màn hình mở đầu/i })).toBeInTheDocument();
  });

  it('không hiển thị khi localStorage đã đánh dấu lu_intro_seen = true', () => {
    localStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(
      screen.queryByRole('dialog', { name: /Màn hình tĩnh tâm mở đầu/i }),
    ).not.toBeInTheDocument();
  });

  it('nhấn nút "Bỏ qua" sẽ đóng màn hình và lưu cờ lu_intro_seen vào localStorage', () => {
    const onFinish = vi.fn();
    render(<WaterTouchIntro onFinish={onFinish} />);

    const skipBtn = screen.getByRole('button', { name: /Bỏ qua màn hình mở đầu/i });
    fireEvent.click(skipBtn);

    expect(localStorage.getItem('lu_intro_seen')).toBe('true');
  });

  it('nhấn phím Escape sẽ đóng màn hình mở đầu', () => {
    render(<WaterTouchIntro />);

    expect(screen.getByRole('dialog', { name: /Màn hình tĩnh tâm mở đầu/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(localStorage.getItem('lu_intro_seen')).toBe('true');
  });

  it('hàm openWaterTouchIntro() kích hoạt mở lại màn hình mở đầu', () => {
    localStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(
      screen.queryByRole('dialog', { name: /Màn hình tĩnh tâm mở đầu/i }),
    ).not.toBeInTheDocument();

    act(() => {
      openWaterTouchIntro();
    });

    expect(screen.getByRole('dialog', { name: /Màn hình tĩnh tâm mở đầu/i })).toBeInTheDocument();
  });
});
