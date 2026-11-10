import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openWaterTouchIntro, WaterTouchIntro } from './index';

describe('WaterTouchIntro Component', () => {
  beforeEach(() => {
    sessionStorage.clear();
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

  it('không hiển thị khi sessionStorage đã đánh dấu lu_intro_seen = true', () => {
    sessionStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(
      screen.queryByRole('dialog', { name: /Màn hình tĩnh tâm mở đầu/i }),
    ).not.toBeInTheDocument();
  });

  it('dọn dẹp cờ cũ trong localStorage khi mount', () => {
    localStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(localStorage.getItem('lu_intro_seen')).toBeNull();
    expect(screen.getByRole('dialog', { name: /Màn hình tĩnh tâm mở đầu/i })).toBeInTheDocument();
  });

  it('nhấn nút "Bỏ qua" sẽ đóng màn hình và lưu cờ lu_intro_seen vào sessionStorage', () => {
    const onFinish = vi.fn();
    render(<WaterTouchIntro onFinish={onFinish} />);

    const skipBtn = screen.getByRole('button', { name: /Bỏ qua màn hình mở đầu/i });
    fireEvent.click(skipBtn);

    expect(sessionStorage.getItem('lu_intro_seen')).toBe('true');
  });

  it('nhấn phím Escape sẽ đóng màn hình mở đầu', () => {
    render(<WaterTouchIntro />);

    expect(screen.getByRole('dialog', { name: /Màn hình tĩnh tâm mở đầu/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(sessionStorage.getItem('lu_intro_seen')).toBe('true');
  });

  it('hàm openWaterTouchIntro() kích hoạt mở lại màn hình mở đầu', () => {
    sessionStorage.setItem('lu_intro_seen', 'true');
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
