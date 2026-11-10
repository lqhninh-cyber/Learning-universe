import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrandLotusLake } from './GrandLotusLake';

describe('GrandLotusLake Procedural Canvas & Clean Immersive View', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('kết xuất thành công đại cảnh Hồ Sen Tri Thức với thẻ canvas và không có thanh điều khiển đè lên', () => {
    render(<GrandLotusLake />);

    const section = screen.getByRole('region', { name: /Đại cảnh Hồ Sen Tri Thức/i });
    expect(section).toBeInTheDocument();

    // Canvas hiển thị đầy đủ
    const canvas = section.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Đã dọn dẹp sạch sẽ: không render bất kỳ nút bấm hoặc điều khiển nổi nào trên canvas
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText(/Tự động/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Âm thanh/i)).not.toBeInTheDocument();
  });

  it('tự động áp dụng sắc thái "Sương mai" (day) khi hệ thống ở khung giờ 06:00 - 17:59', () => {
    // Đặt giờ giả lập là 10:00 sáng
    vi.setSystemTime(new Date(2026, 10, 10, 10, 0, 0));

    const { container } = render(<GrandLotusLake />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-[#5B9577]');
  });

  it('tự động áp dụng sắc thái "Nguyệt dạ" (night) khi hệ thống ở khung giờ tối (>= 18:00)', () => {
    // Đặt giờ giả lập là 20:30 tối
    vi.setSystemTime(new Date(2026, 10, 10, 20, 30, 0));

    const { container } = render(<GrandLotusLake />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-[#040D08]');
  });

  it('tự động áp dụng sắc thái "Nguyệt dạ" (night) khi hệ thống ở khung giờ đêm khuya (< 06:00)', () => {
    // Đặt giờ giả lập là 02:15 sáng
    vi.setSystemTime(new Date(2026, 10, 10, 2, 15, 0));

    const { container } = render(<GrandLotusLake />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-[#040D08]');
  });
});
