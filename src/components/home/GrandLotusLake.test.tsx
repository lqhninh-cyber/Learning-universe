import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrandLotusLake } from './GrandLotusLake';
import { PADS } from './lotusCanvasEngine';
import { buildEcosystemState, spawnBaitAt, stepEcosystem } from './lotusEcosystem';
import {
  createInitialZenKoiState,
  feedFish,
  getScaleForLevel,
  hatchNewKoi,
  loadZenKoiState,
  saveZenKoiState,
  ZEN_KOI_STORAGE_KEY,
} from './zenKoiGame';

describe('GrandLotusLake Procedural Canvas & Zen Koi Sanctuary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('kết xuất thành công đại cảnh Hồ Sen Tri Thức với thẻ canvas và viên thuốc Zen Koi HUD tinh gọn', () => {
    render(<GrandLotusLake />);

    const section = screen.getByRole('region', { name: /Đại cảnh Hồ Sen Tri Thức/i });
    expect(section).toBeInTheDocument();

    // Canvas hiển thị đầy đủ
    const canvas = section.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Viên thuốc HUD Hồ Sen của bạn hiển thị tinh gọn ở góc trên bên phải
    expect(screen.getByText(/Hồ Sen của bạn/i)).toBeInTheDocument();

    // Không render các nút điều khiển cũ (Âm thanh / Tự động)
    expect(screen.queryByText(/Âm thanh/i)).not.toBeInTheDocument();
  });

  it('bấm vào viên thuốc HUD mở bảng điều khiển Liên Trì Ngư Các với tài nguyên và các nút chế độ', () => {
    render(<GrandLotusLake />);

    const hudPill = screen.getByText(/Hồ Sen của bạn/i);
    fireEvent.click(hudPill);

    // Bảng điều khiển mở ra
    expect(screen.getByText(/Liên Trì Ngư Các/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Hạt Sen/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ngọc Sương/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /Cho ăn/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vuốt ve/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Ấp cá mới/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sổ Cá/i })).toBeInTheDocument();
  });

  it('mở Sổ Cá (Koi Compendium) hiển thị 5 giống loài và danh sách cá đang bơi', () => {
    render(<GrandLotusLake />);

    const hudPill = screen.getByText(/Hồ Sen của bạn/i);
    fireEvent.click(hudPill);

    const compendiumBtn = screen.getByRole('button', { name: /Sổ Cá/i });
    fireEvent.click(compendiumBtn);

    expect(screen.getByText(/Sổ Tay Ngư Các/i)).toBeInTheDocument();
    expect(screen.getByText(/Hồng Bạch/i)).toBeInTheDocument();
    expect(screen.getByText(/Hoàng Kim/i)).toBeInTheDocument();
    expect(screen.getByText(/Tam Sắc/i)).toBeInTheDocument();
    expect(screen.getByText(/Đàn cá trong hồ/i)).toBeInTheDocument();
  });

  it('lưu trữ dữ liệu bền vững qua localStorage lu_lotus_koi_game_v1', () => {
    const initial = loadZenKoiState();
    expect(initial.fishes.length).toBe(4);
    expect(initial.foodCount).toBe(30);

    const raw = window.localStorage.getItem(ZEN_KOI_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(1);
    expect(parsed.fishes).toHaveLength(4);
  });

  it('cho cá ăn tăng XP, lên cấp và phóng to kích thước tỉ lệ', () => {
    const state = createInitialZenKoiState();
    const fishId = state.fishes[0]!.id;
    const initialLevel = state.fishes[0]!.level;

    // Cho ăn nhiều lần để lên cấp
    let curState = state;
    for (let i = 0; i < 15; i += 1) {
      const res = feedFish(curState, fishId);
      curState = res.newState;
    }

    const updatedFish = curState.fishes.find((f) => f.id === fishId)!;
    expect(updatedFish.level).toBeGreaterThan(initialLevel);
    expect(updatedFish.scale).toBe(getScaleForLevel(updatedFish.level));
    expect(curState.dewGems).toBeGreaterThan(state.dewGems);
  });

  it('hatchNewKoi ấp cá mới tiêu tốn 10 Ngọc Sương và mở khóa giống loài mới', () => {
    const state = createInitialZenKoiState();
    state.dewGems = 20;
    saveZenKoiState(state);

    const result = hatchNewKoi(state);
    expect(result).not.toBeNull();
    expect(result!.newState.dewGems).toBe(10);
    expect(result!.newState.fishes).toHaveLength(5);
    expect(result!.newState.unlockedBreeds).toContain(result!.fish.breed);
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

  it('mô phỏng hệ sinh thái 120fps: đom đóm 40 hạt, 8 cá Koi ăn mồi click, ếch ộp/nhảy & cánh hoa rơi', () => {
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
