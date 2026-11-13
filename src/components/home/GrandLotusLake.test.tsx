import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GrandLotusLake } from './GrandLotusLake';
import { PADS, sortZBufferedEntities } from './lotusCanvasEngine';
import {
  buildEcosystemState,
  getBoxfishPuffScale,
  pushShockwave,
  spawnBaitAt,
  stepEcosystem,
  syncEcosystemFishesWithGameState,
} from './lotusEcosystem';
import {
  addFishToLake,
  ALL_FISH_SPECIES_IDS,
  createInitialZenKoiState,
  FISH_SPECIES,
  loadZenKoiState,
  removeFishFromLake,
  updateFishScale,
  ZEN_KOI_STORAGE_KEY,
} from './zenKoiGame';

describe('GrandLotusLake Procedural 3D Z-Buffer Canvas & Zen Koi Sandbox', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  it('kết xuất đại cảnh Hồ Sen Tri Thức mở rộng chiều cao với nút Hồ Sen góc dưới phải chuẩn không emoji', () => {
    render(<GrandLotusLake />);

    const section = screen.getByRole('region', { name: /Đại cảnh Hồ Sen Tri Thức/i });
    expect(section).toBeInTheDocument();
    expect(section).toHaveClass('h-[680px]', 'lg:h-[780px]', 'xl:h-[850px]', 'w-full');

    const canvas = section.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Viên thuốc HUD đặt góc dưới phải (bottom-6 right-6) với nhãn mới chuẩn xác
    const hudPill = screen.getByRole('button', { name: /Hồ Sen · 4 cá/i });
    expect(hudPill).toBeInTheDocument();
    expect(hudPill).toHaveClass('bottom-6', 'right-6');

    // Không chứa bất kỳ emoji icon nào trên UI
    expect(screen.queryByText(/(?:🐟|🪷|🌾|💧|✨|📖|💡|▲)/)).not.toBeInTheDocument();
  });

  it('bấm nút Hồ Sen mở Không Gian Hồ Sen 3D với Sổ Cá (10 Loài) và Danh Sách Cá Đang Nuôi', () => {
    render(<GrandLotusLake />);

    const hudPill = screen.getByRole('button', { name: /Hồ Sen · 4 cá/i });
    fireEvent.click(hudPill);

    // Trung tâm điều khiển Không Gian Hồ Sen 3D bung nở chính giữa
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Không Gian Hồ Sen 3D' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Sổ Cá \(10 Loài\)/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Danh Sách Cá Đang Nuôi \(4\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thêm cá ngẫu nhiên' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Đóng' })).toBeInTheDocument();

    // Đủ 10 loài cá trong Sổ Cá (gồm 4 loài mới: Đuối, Ngân Đai, Thần Tiên, Nóc)
    expect(ALL_FISH_SPECIES_IDS).toHaveLength(10);
    ALL_FISH_SPECIES_IDS.forEach((id) => {
      expect(screen.getByText(FISH_SPECIES[id].nameVi)).toBeInTheDocument();
    });
    const addButtons = screen.getAllByRole('button', { name: 'Thả vào hồ' });
    expect(addButtons).toHaveLength(10);

    // Thả thêm 1 chú Cá Nóc Ngọc Trai từ Sổ Cá
    fireEvent.click(addButtons[9]!);
    expect(screen.getByRole('status')).toHaveTextContent(/Đã thả Cá Nóc Ngọc Trai vào hồ/i);
    expect(screen.getByRole('button', { name: /Hồ Sen · 5 cá/i })).toBeInTheDocument();

    // Chuyển sang tab Danh Sách Cá Đang Nuôi (5)
    fireEvent.click(screen.getByRole('tab', { name: /Danh Sách Cá Đang Nuôi \(5\)/i }));
    expect(screen.getAllByRole('button', { name: 'Xem cá' })).toHaveLength(5);
    expect(screen.getAllByRole('button', { name: 'Thả bớt' })).toHaveLength(5);
    expect(screen.getAllByText(/Độ sâu Z:/i)).toHaveLength(5);

    // Không chứa tài nguyên ảo hay emoji
    expect(screen.queryByText(/Hạt Sen/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Ngọc Sương/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/(?:🐟|🪷|🌾|💧|✨|📖|💡|▲)/)).not.toBeInTheDocument();
  });

  it('bổ sung chính xác 4 hình thái cá mới (stingray, ribbonfish, angelfish, boxfish) và hiệu ứng phồng 1.4x', () => {
    const state = createInitialZenKoiState();
    const withStingray = addFishToLake(state, 'stingray', 'Ngọc Bích');
    const withRibbon = addFishToLake(withStingray.newState, 'ribbonfish', 'Thủy Tinh');
    const withAngel = addFishToLake(withRibbon.newState, 'angelfish', 'Vũ Y');
    const withBoxfish = addFishToLake(withAngel.newState, 'boxfish', 'Ngọc Trai');

    expect(withBoxfish.newState.fishes).toHaveLength(8);
    expect(FISH_SPECIES.stingray.defaultZRange).toEqual([0.15, 0.45]);
    expect(FISH_SPECIES.boxfish.bodyShape).toBe('pearl_boxfish');
    expect(FISH_SPECIES.ribbonfish.bodyShape).toBe('celestial_ribbon');
    expect(FISH_SPECIES.angelfish.bodyShape).toBe('veil_angelfish');

    const eco = buildEcosystemState(PADS.length);
    syncEcosystemFishesWithGameState(eco, withBoxfish.newState.fishes);
    const boxFishEco = eco.koiFishes.find((f) => f.species === 'boxfish');
    expect(boxFishEco).toBeDefined();
    expect(getBoxfishPuffScale(boxFishEco!)).toBe(1.0);

    // Giả lập khi nhấn trúng Cá Nóc Ngọc Trai: puffTimer = 2.0 -> phồng đạt 1.4x tại giữa chu kỳ
    boxFishEco!.puffTimer = 1.0;
    expect(getBoxfishPuffScale(boxFishEco!)).toBeCloseTo(1.4, 2);

    // Kiểm tra bộ sắp xếp Z-Buffer 3D thực sự: cá có thể ra sau (depthZ < 0.58) hoặc lên trước thân sen (depthZ > 0.58)
    const order: string[] = [];
    const sorted = sortZBufferedEntities([
      { depthZ: 0.78, kind: 'fish-front', draw: () => order.push('fish-front') },
      { depthZ: 0.58, kind: 'lotus-main-stem', draw: () => order.push('lotus-main-stem') },
      { depthZ: 0.25, kind: 'fish-back', draw: () => order.push('fish-back') },
    ]);
    sorted.forEach((item) => item.draw());
    expect(order).toEqual(['fish-back', 'lotus-main-stem', 'fish-front']);
  });

  it('thêm cá mới và thả bớt cá trong chế độ Sandbox tự do', () => {
    const state = createInitialZenKoiState();
    expect(state.fishes).toHaveLength(4);

    const resAdd = addFishToLake(state, 'arowana', 'Kim Long Hoàng Gia');
    expect(resAdd.newState.fishes).toHaveLength(5);
    expect(resAdd.fish.species).toBe('arowana');
    expect(resAdd.fish.name).toBe('Kim Long Hoàng Gia');

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

    pushShockwave(eco, 1300, 680);
    expect(eco.ripples.some((r) => r.tint === 'shockwave')).toBe(true);

    for (let step = 0; step < 240; step += 1) {
      time += dt;
      stepEcosystem(eco, PADS, 1440, 620, 1, 450, time, dt, 400, 480, 'night');
    }
    expect(eco.ripples.length).toBeGreaterThan(0);
    expect(eco.bubbles.length).toBeGreaterThan(0);
  });
});
