import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GrandLotusLake } from './GrandLotusLake';
import { ambientSound } from '@/shared/lib/ambientSound';

describe('GrandLotusLake Ambient Themes & Procedural Sound Controller', () => {
  beforeEach(() => {
    ambientSound.stop();
    vi.restoreAllMocks();
  });

  it('kết xuất thành phần đại cảnh với nhãn trợ năng và thanh điều khiển', () => {
    render(<GrandLotusLake />);

    const section = screen.getByRole('region', { name: /Đại cảnh Hồ Sen Tri Thức/i });
    expect(section).toBeInTheDocument();

    const modeButton = screen.getByRole('button', { name: /Chuyển chế độ thời gian cảnh hồ sen/i });
    expect(modeButton).toBeInTheDocument();

    const soundButton = screen.getByRole('button', { name: /Bật âm thanh sinh thái/i });
    expect(soundButton).toBeInTheDocument();
  });

  it('cho phép chuyển đổi chu kỳ chế độ Ngày / Đêm / Tự động (auto -> day -> night -> auto)', () => {
    render(<GrandLotusLake />);

    const modeButton = screen.getByRole('button', { name: /Chuyển chế độ thời gian cảnh hồ sen/i });

    // Ban đầu là Tự động
    expect(modeButton.textContent).toMatch(/Tự động/i);

    // Bấm 1 lần: chuyển sang Sương mai (day)
    fireEvent.click(modeButton);
    expect(modeButton.textContent).toMatch(/Sương mai/i);

    // Bấm 2 lần: chuyển sang Nguyệt dạ (night)
    fireEvent.click(modeButton);
    expect(modeButton.textContent).toMatch(/Nguyệt dạ/i);

    // Bấm 3 lần: quay lại Tự động (auto)
    fireEvent.click(modeButton);
    expect(modeButton.textContent).toMatch(/Tự động/i);
  });

  it('bật và tắt âm thanh sinh thái môi trường bằng Web Audio API khi người dùng nhấp nút', () => {
    const startSpy = vi.spyOn(ambientSound, 'start');
    const stopSpy = vi.spyOn(ambientSound, 'stop');

    render(<GrandLotusLake />);

    const soundButton = screen.getByRole('button', { name: /Bật âm thanh sinh thái/i });
    expect(soundButton.textContent).toMatch(/Âm thanh/i);

    // Nhấp bật âm thanh
    fireEvent.click(soundButton);
    expect(startSpy).toHaveBeenCalledTimes(1);
    expect(soundButton.textContent).toMatch(/Róc rách & Dế đêm/i);
    expect(screen.getByRole('button', { name: /Tắt âm thanh sinh thái/i })).toBeInTheDocument();

    // Nhấp tắt âm thanh
    fireEvent.click(soundButton);
    expect(stopSpy).toHaveBeenCalled();
    expect(soundButton.textContent).toMatch(/Âm thanh/i);
  });

  it('dọn dẹp và dừng âm thanh khi component unmount', () => {
    const stopSpy = vi.spyOn(ambientSound, 'stop');

    const { unmount } = render(<GrandLotusLake />);
    const soundButton = screen.getByRole('button', { name: /Bật âm thanh sinh thái/i });

    fireEvent.click(soundButton);
    expect(ambientSound.getStatus()).toBe(true);

    unmount();
    expect(stopSpy).toHaveBeenCalled();
    expect(ambientSound.getStatus()).toBe(false);
  });
});
