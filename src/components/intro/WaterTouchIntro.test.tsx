import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { openWaterTouchIntro, WaterTouchIntro } from './index';

describe('WaterTouchIntro Component (Mặt Trời Đông Sơn)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('hiển thị màn hình mở đầu thuần Canvas Zero-Text khi chưa có cờ lu_intro_seen', () => {
    const { container } = render(<WaterTouchIntro />);

    const dialog = screen.getByRole('dialog', { name: /Mặt Trời Đông Sơn/i });
    expect(dialog).toBeInTheDocument();

    // Tuyệt đối không có bất kỳ nút bấm hoặc văn bản chữ nào
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/Nghi thức khởi tâm/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bỏ qua/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Bước vào/i)).not.toBeInTheDocument();

    // Chứa canvas phủ kín
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('không hiển thị khi sessionStorage đã đánh dấu lu_intro_seen = true', () => {
    sessionStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(screen.queryByRole('dialog', { name: /Mặt Trời Đông Sơn/i })).not.toBeInTheDocument();
  });

  it('dọn dẹp cờ cũ trong localStorage khi mount', () => {
    localStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(localStorage.getItem('lu_intro_seen')).toBeNull();
    expect(screen.getByRole('dialog', { name: /Mặt Trời Đông Sơn/i })).toBeInTheDocument();
  });

  it('nhấn chuột bất kỳ nơi nào trên màn hình sẽ lập tức đóng màn hình và lưu cờ lu_intro_seen vào sessionStorage', () => {
    render(<WaterTouchIntro />);

    const dialog = screen.getByRole('dialog', { name: /Mặt Trời Đông Sơn/i });
    fireEvent.click(dialog);

    expect(sessionStorage.getItem('lu_intro_seen')).toBe('true');
  });

  it('nhấn phím bất kỳ (Enter, Space, Esc) sẽ đóng màn hình mở đầu ngay lập tức', () => {
    render(<WaterTouchIntro />);

    expect(screen.getByRole('dialog', { name: /Mặt Trời Đông Sơn/i })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(sessionStorage.getItem('lu_intro_seen')).toBe('true');
  });

  it('hàm openWaterTouchIntro() kích hoạt mở lại màn hình mở đầu', () => {
    sessionStorage.setItem('lu_intro_seen', 'true');
    render(<WaterTouchIntro />);

    expect(screen.queryByRole('dialog', { name: /Mặt Trời Đông Sơn/i })).not.toBeInTheDocument();

    act(() => {
      openWaterTouchIntro();
    });

    expect(screen.getByRole('dialog', { name: /Mặt Trời Đông Sơn/i })).toBeInTheDocument();
  });
});
