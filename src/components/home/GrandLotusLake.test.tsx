import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrandLotusLake } from './GrandLotusLake';
import { PADS } from './lotusCanvasEngine';
import { buildEcosystemState, spawnBaitAt, stepEcosystem } from './lotusEcosystem';

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

  it('mô phỏng hệ sinh thái 120fps: đom đóm 40 hạt, 8 cá Koi ăn mồi click, ếch ộp/nhảy & cánh hoa rơi', () => {
    const eco = buildEcosystemState(PADS.length);
    expect(eco.fireflies).toHaveLength(40);
    expect(eco.koiFishes).toHaveLength(8);
    expect(eco.minnows).toHaveLength(12);
    expect(eco.dragonflies).toHaveLength(3);

    // Chạy mô phỏng qua 6 giây với dt chuẩn 120Hz (1/120s)
    const dt = 1 / 120;
    let time = 0;
    for (let step = 0; step < 720; step += 1) {
      time += dt;
      stepEcosystem(eco, PADS, 1440, 620, 1, 450, time, dt, null, null, 'night');
    }

    // Đã phát sinh cánh hoa rơi & vòng gợn sóng âm thanh ếch ộp (~4s)
    expect(eco.fallingPetals.length).toBeGreaterThanOrEqual(1);
    expect(eco.ripples.some((r) => r.tint === 'sound')).toBe(true);

    // Click thả mồi hạt sáng vàng thu hút đàn cá Koi
    const koi0 = eco.koiFishes[0];
    expect(koi0).toBeDefined();
    spawnBaitAt(eco, (koi0?.x ?? 500) + 32, (koi0?.y ?? 420) + 8, 1);
    expect(eco.baitPellets.length).toBeGreaterThanOrEqual(2);
    expect(eco.baitPellets.length).toBeLessThanOrEqual(3);

    // Mô phỏng tiếp để cá Koi lao đến đớp mồi tạo bọt nước
    for (let step = 0; step < 240; step += 1) {
      time += dt;
      stepEcosystem(eco, PADS, 1440, 620, 1, 450, time, dt, 400, 480, 'night');
    }
    expect(eco.ripples.length).toBeGreaterThan(0);

    // Rê chuột sát lá sen chú ếch để kích hoạt nhảy parabol sang lá lân cận
    const startPad = eco.frog.currentPadIdx;
    const frogPad = PADS[startPad]!;
    stepEcosystem(
      eco,
      PADS,
      1440,
      620,
      1,
      450,
      time + dt,
      dt,
      frogPad.x * 1440,
      450 + frogPad.y * 620,
      'night',
    );
    expect(eco.frog.isJumping).toBe(true);
  });
});
