import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrandLotusLake } from './GrandLotusLake';
import { PADS } from './lotusCanvasEngine';
import { buildEcosystemState, spawnBaitAt, stepEcosystem } from './lotusEcosystem';
import {
  addFishToLake,
  createInitialZenKoiState,
  loadZenKoiState,
  removeFishFromLake,
  updateFishScale,
  ZEN_KOI_STORAGE_KEY,
} from './zenKoiGame';

describe('GrandLotusLake Procedural Canvas & Zen Koi Sandbox', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('kết xuất thành công đại cảnh Hồ Sen Tri Thức với thẻ canvas và nút Hồ Sen (Số cá: N) chuẩn không emoji', () => {
    render(<GrandLotusLake />);

    const section = screen.getByRole('region', { name: /Đại cảnh Hồ Sen Tri Thức/i });
    expect(section).toBeInTheDocument();

    // Canvas hiển thị đầy đủ
    const canvas = section.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Viên thuốc HUD hiển thị chuẩn xác không emoji
    expect(screen.getByText(/Hồ Sen \(Số cá: 4\)/i)).toBeInTheDocument();

    // Không chứa bất kỳ emoji icon nào trên UI
    expect(screen.queryByText(/🐟/)).not.toBeInTheDocument();
    expect(screen.queryByText(/🪷/)).not.toBeInTheDocument();
  });

  it('bấm vào nút HUD mở bảng điều khiển Danh sách với Thêm cá mới, Sổ Cá và danh sách cá đang bơi', () => {
    render(<GrandLotusLake />);

    const hudPill = screen.getByText(/Hồ Sen \(Số cá: 4\)/i);
    fireEvent.click(hudPill);

    // Bảng điều khiển Danh sách mở ra
    expect(screen.getByRole('heading', { name: /Danh sách/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm cá mới/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sổ Cá/i })).toBeInTheDocument();

    // Danh sách cá hiển thị với các nút Xem và Thả bớt
    expect(screen.getAllByRole('button', { name: /Xem/i }).length).toBe(4);
    expect(screen.getAllByRole('button', { name: /Thả bớt/i }).length).toBe(4);

    // Tuyệt đối không còn tài nguyên nhân tạo hay toggle chuyển đổi chế độ
    expect(screen.queryByText(/Hạt Sen/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ngọc Sương/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cho ăn/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Vuốt ve/i })).not.toBeInTheDocument();
  });

  it('mở Sổ Cá hiển thị đầy đủ 6 loài cá và các nút Thả vào hồ', () => {
    render(<GrandLotusLake />);

    const hudPill = screen.getByText(/Hồ Sen \(Số cá: 4\)/i);
    fireEvent.click(hudPill);

    const compendiumBtn = screen.getByRole('button', { name: /Sổ Cá/i });
    fireEvent.click(compendiumBtn);

    expect(screen.getByRole('heading', { name: /Sổ Cá/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Cá Chép Koi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cá Vàng Đuôi Voan/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cá Betta Xiêm Rồng/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cá Chép Phụng/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cá Rồng Kim Long/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cá Thanh Ngọc Phát Quang/i).length).toBeGreaterThan(0);

    const addButtons = screen.getAllByRole('button', { name: /Thả vào hồ/i });
    expect(addButtons).toHaveLength(6);
  });

  it('thêm cá mới và thả bớt cá trong chế độ Sandbox tự do', () => {
    const state = createInitialZenKoiState();
    expect(state.fishes).toHaveLength(4);

    // Thêm cá Rồng Kim Long
    const resAdd = addFishToLake(state, 'arowana', 'Kim Long Hoàng Gia');
    expect(resAdd.newState.fishes).toHaveLength(5);
    expect(resAdd.fish.species).toBe('arowana');
    expect(resAdd.fish.name).toBe('Kim Long Hoàng Gia');

    // Thả bớt 1 cá
    const fishToRemoveId = resAdd.newState.fishes[0]!.id;
    const resRemove = removeFishFromLake(resAdd.newState, fishToRemoveId);
    expect(resRemove.fishes).toHaveLength(4);
    expect(resRemove.fishes.some((f) => f.id === fishToRemoveId)).toBe(false);
  });

  it('tùy chỉnh kích thước cá updateFishScale hoạt động chính xác trong giới hạn 0.4x đến 1.8x', () => {
    const state = createInitialZenKoiState();
    const targetFish = state.fishes[0]!;

    const updatedState = updateFishScale(state, targetFish.id, 1.45);
    const updatedFish = updatedState.fishes.find((f) => f.id === targetFish.id);
    expect(updatedFish?.scale).toBe(1.45);

    // Kiểm tra kẹp giới hạn
    const clampedMax = updateFishScale(state, targetFish.id, 3.0);
    expect(clampedMax.fishes.find((f) => f.id === targetFish.id)?.scale).toBe(1.8);

    const clampedMin = updateFishScale(state, targetFish.id, 0.1);
    expect(clampedMin.fishes.find((f) => f.id === targetFish.id)?.scale).toBe(0.4);
  });

  it('lưu trữ dữ liệu bền vững qua localStorage lu_lotus_koi_game_v1', () => {
    const initial = loadZenKoiState();
    expect(initial.fishes.length).toBe(4);

    const raw = window.localStorage.getItem(ZEN_KOI_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(1);
    expect(parsed.fishes).toHaveLength(4);
  });

  it('tự động áp dụng sắc thái "Sương mai" (day) khi hệ thống ở khung giờ 06:00 - 17:59', () => {
    vi.setSystemTime(new Date(2026, 10, 10, 10, 0, 0));

    const { container } = render(<GrandLotusLake />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-[#5B9577]');
  });

  it('tự động áp dụng sắc thái "Nguyệt dạ" (night) khi hệ thống ở khung giờ tối (>= 18:00)', () => {
    vi.setSystemTime(new Date(2026, 10, 10, 20, 30, 0));

    const { container } = render(<GrandLotusLake />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('bg-[#040D08]');
  });

  it('mô phỏng hệ sinh thái 120fps: đom đóm 40 hạt, 8 cá Koi 3D Z-axis, ếch ộp/nhảy & cánh hoa rơi', () => {
    const eco = buildEcosystemState(PADS.length);
    expect(eco.fireflies).toHaveLength(40);
    expect(eco.koiFishes).toHaveLength(8);
    expect(eco.minnows).toHaveLength(12);
    expect(eco.dragonflies).toHaveLength(3);

    const dt = 1 / 120;
    let time = 0;
    for (let step = 0; step < 720; step += 1) {
      time += dt;
      stepEcosystem(eco, PADS, 1440, 620, 1, 450, time, dt, null, null, 'night');
    }

    expect(eco.fallingPetals.length).toBeGreaterThanOrEqual(1);
    expect(eco.ripples.some((r) => r.tint === 'sound')).toBe(true);

    const koi0 = eco.koiFishes[0];
    expect(koi0).toBeDefined();
    expect(koi0?.z).toBeGreaterThanOrEqual(0.15);
    expect(koi0?.z).toBeLessThanOrEqual(1.0);

    spawnBaitAt(eco, (koi0?.x ?? 500) + 32, (koi0?.y ?? 420) + 8, 1);
    expect(eco.baitPellets.length).toBeGreaterThanOrEqual(2);
    expect(eco.baitPellets.length).toBeLessThanOrEqual(3);

    for (let step = 0; step < 240; step += 1) {
      time += dt;
      stepEcosystem(eco, PADS, 1440, 620, 1, 450, time, dt, 400, 480, 'night');
    }
    expect(eco.ripples.length).toBeGreaterThan(0);
  });
});
