export type KoiBreedId = 'kohaku' | 'yamabuki' | 'sanke' | 'jade' | 'celestial';

export interface KoiBreedMeta {
  readonly id: KoiBreedId;
  readonly nameVi: string;
  readonly englishName: string;
  readonly rarityVi: 'Phổ biến' | 'Hiếm' | 'Cực hiếm' | 'Huyền thoại';
  readonly rarityTier: 1 | 2 | 3 | 4 | 5;
  readonly description: string;
  readonly baseColor: [number, number, number];
  readonly spotColor: [number, number, number];
  readonly accentColor?: [number, number, number];
  readonly glowColor?: string;
  readonly isButterfly?: boolean;
}

export const KOI_BREEDS: Record<KoiBreedId, KoiBreedMeta> = {
  kohaku: {
    id: 'kohaku',
    nameVi: 'Hồng Bạch (Kohaku)',
    englishName: 'Kohaku',
    rarityVi: 'Phổ biến',
    rarityTier: 1,
    description:
      'Thân trắng sứ điểm các mảng đỏ chu sa tươi truyền thống, biểu tượng cho sự thanh cao và an lành.',
    baseColor: [252, 250, 246],
    spotColor: [232, 66, 42],
  },
  yamabuki: {
    id: 'yamabuki',
    nameVi: 'Hoàng Kim (Yamabuki Ogon)',
    englishName: 'Yamabuki Ogon',
    rarityVi: 'Hiếm',
    rarityTier: 2,
    description:
      'Toàn thân ánh vàng kim loại lấp lánh dưới làn nước đêm, mang lại may mắn, phúc lộc và thịnh vượng.',
    baseColor: [246, 196, 56],
    spotColor: [255, 236, 148],
    glowColor: 'rgba(255, 215, 0, 0.35)',
  },
  sanke: {
    id: 'sanke',
    nameVi: 'Tam Sắc (Taisho Sanke)',
    englishName: 'Taisho Sanke',
    rarityVi: 'Hiếm',
    rarityTier: 3,
    description:
      'Thân trắng tinh khôi kết hợp đốm đỏ son và vệt mực đen sumi mang đậm phong vị hội họa thủy mặc Á Đông.',
    baseColor: [250, 248, 242],
    spotColor: [228, 62, 40],
    accentColor: [28, 30, 36],
  },
  jade: {
    id: 'jade',
    nameVi: 'Thanh Ngọc (Jade Emerald)',
    englishName: 'Jade Emerald',
    rarityVi: 'Cực hiếm',
    rarityTier: 4,
    description:
      'Sắc xanh ngọc bích phát quang dịu mát trong đêm cùng đôi vây trắng dài mượt mà, toát lên vẻ an tịnh vô biên.',
    baseColor: [64, 182, 138],
    spotColor: [132, 235, 198],
    glowColor: 'rgba(78, 222, 168, 0.45)',
  },
  celestial: {
    id: 'celestial',
    nameVi: 'Kim Long Ngư (Celestial Butterfly Koi)',
    englishName: 'Celestial Butterfly',
    rarityVi: 'Huyền thoại',
    rarityTier: 5,
    description:
      'Toàn thân ánh vàng rực rỡ, bộ vây cánh bướm dài thướt tha uốn lượn và kéo theo các hạt bụi sao lấp lánh khi bơi.',
    baseColor: [255, 212, 72],
    spotColor: [255, 170, 48],
    accentColor: [255, 245, 180],
    glowColor: 'rgba(255, 225, 120, 0.65)',
    isButterfly: true,
  },
};

export interface SavedKoiFish {
  readonly id: string;
  name: string;
  readonly breed: KoiBreedId;
  level: number;
  xp: number;
  scale: number;
  patternSeed: number;
  affection: number;
  hatchedAt: number;
}

export interface ZenKoiGameState {
  version: 1;
  pondLevel: number;
  foodCount: number;
  dewGems: number;
  fishes: SavedKoiFish[];
  unlockedBreeds: KoiBreedId[];
  lastFedAt: number;
  lastForageAt: number;
  lastReplenishedAt: number;
  stats: {
    totalFed: number;
    totalHatched: number;
    totalForaged: number;
  };
}

export const ZEN_KOI_STORAGE_KEY = 'lu_lotus_koi_game_v1';

export function getScaleForLevel(level: number): number {
  const clamped = Math.max(1, Math.min(10, level));
  return Number((0.55 + ((clamped - 1) / 9) * 0.8).toFixed(3));
}

export function getXpForNextLevel(level: number): number {
  return Math.max(1, Math.min(10, level)) * 50;
}

export function computePondLevel(fishes: readonly SavedKoiFish[]): number {
  if (!fishes || fishes.length === 0) return 1;
  const totalLevels = fishes.reduce((sum, f) => sum + (f.level || 1), 0);
  return Math.max(1, 1 + Math.floor((totalLevels - fishes.length) / 3));
}

const SERENE_KOI_NAMES: readonly string[] = [
  'Bạch Vân',
  'Kim Ngân',
  'Thủy Mặc',
  'Hồng Diệp',
  'Thanh Ba',
  'Bích Ngọc',
  'Kim Lân',
  'Lạc Hà',
  'Huyền Sương',
  'Nguyệt Ảnh',
  'Vân Phong',
  'Minh Châu',
  'Đan Thanh',
  'Tử La',
  'Thái Hòa',
  'Hải Yến',
  'Lưu Ly',
  'Cẩm Tú',
  'Thiên Chương',
  'An Nhiên',
];

export function createInitialZenKoiState(): ZenKoiGameState {
  const now = Date.now();
  const initialFishes: SavedKoiFish[] = [
    {
      id: 'koi-init-1',
      name: 'Bạch Vân',
      breed: 'kohaku',
      level: 2,
      xp: 20,
      scale: getScaleForLevel(2),
      patternSeed: 101,
      affection: 22,
      hatchedAt: now - 86400000,
    },
    {
      id: 'koi-init-2',
      name: 'Kim Ngân',
      breed: 'yamabuki',
      level: 1,
      xp: 0,
      scale: getScaleForLevel(1),
      patternSeed: 202,
      affection: 15,
      hatchedAt: now - 72000000,
    },
    {
      id: 'koi-init-3',
      name: 'Thủy Mặc',
      breed: 'sanke',
      level: 1,
      xp: 25,
      scale: getScaleForLevel(1),
      patternSeed: 303,
      affection: 18,
      hatchedAt: now - 60000000,
    },
    {
      id: 'koi-init-4',
      name: 'Hồng Diệp',
      breed: 'kohaku',
      level: 1,
      xp: 10,
      scale: getScaleForLevel(1),
      patternSeed: 404,
      affection: 12,
      hatchedAt: now - 48000000,
    },
  ];

  return {
    version: 1,
    pondLevel: computePondLevel(initialFishes),
    foodCount: 30,
    dewGems: 8,
    fishes: initialFishes,
    unlockedBreeds: ['kohaku', 'yamabuki', 'sanke'],
    lastFedAt: now,
    lastForageAt: now,
    lastReplenishedAt: now,
    stats: {
      totalFed: 0,
      totalHatched: 4,
      totalForaged: 0,
    },
  };
}

export function loadZenKoiState(): ZenKoiGameState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createInitialZenKoiState();
  }

  try {
    const raw = window.localStorage.getItem(ZEN_KOI_STORAGE_KEY);
    if (!raw) {
      const initial = createInitialZenKoiState();
      saveZenKoiState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<ZenKoiGameState>;
    if (
      !parsed ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.fishes) ||
      parsed.fishes.length === 0
    ) {
      const initial = createInitialZenKoiState();
      saveZenKoiState(initial);
      return initial;
    }

    // Đảm bảo dữ liệu các trường hợp lệ
    const state: ZenKoiGameState = {
      version: 1,
      pondLevel:
        typeof parsed.pondLevel === 'number' ? parsed.pondLevel : computePondLevel(parsed.fishes),
      foodCount: typeof parsed.foodCount === 'number' ? Math.max(0, parsed.foodCount) : 30,
      dewGems: typeof parsed.dewGems === 'number' ? Math.max(0, parsed.dewGems) : 8,
      fishes: parsed.fishes.map((f, idx) => ({
        id: f.id || `koi-${idx + 1}`,
        name: f.name || `Cá Koi ${idx + 1}`,
        breed: (KOI_BREEDS[f.breed as KoiBreedId] ? f.breed : 'kohaku') as KoiBreedId,
        level: Math.max(1, Math.min(10, f.level || 1)),
        xp: Math.max(0, f.xp || 0),
        scale: getScaleForLevel(f.level || 1),
        patternSeed: typeof f.patternSeed === 'number' ? f.patternSeed : (idx + 1) * 111,
        affection: Math.max(0, Math.min(100, f.affection || 10)),
        hatchedAt: f.hatchedAt || Date.now(),
      })),
      unlockedBreeds:
        Array.isArray(parsed.unlockedBreeds) && parsed.unlockedBreeds.length > 0
          ? parsed.unlockedBreeds
          : ['kohaku', 'yamabuki', 'sanke'],
      lastFedAt: parsed.lastFedAt || Date.now(),
      lastForageAt: parsed.lastForageAt || Date.now(),
      lastReplenishedAt: parsed.lastReplenishedAt || Date.now(),
      stats: {
        totalFed: parsed.stats?.totalFed || 0,
        totalHatched: parsed.stats?.totalHatched || parsed.fishes.length,
        totalForaged: parsed.stats?.totalForaged || 0,
      },
    };

    return state;
  } catch {
    const initial = createInitialZenKoiState();
    saveZenKoiState(initial);
    return initial;
  }
}

export function saveZenKoiState(state: ZenKoiGameState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(ZEN_KOI_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Không làm gián đoạn UI nếu quota bị đầy
  }
}

export const HATCH_GEM_COST = 10;

/**
 * Triệu hồi / Ấp cá Koi mới (Gacha với tỉ lệ Kim Long Ngư 8%)
 */
export function hatchNewKoi(
  state: ZenKoiGameState,
): { newState: ZenKoiGameState; fish: SavedKoiFish } | null {
  if (state.dewGems < HATCH_GEM_COST) {
    return null;
  }

  const roll = Math.random() * 100;
  let breed: KoiBreedId;
  if (roll < 44) {
    breed = 'kohaku'; // 44%
  } else if (roll < 69) {
    breed = 'yamabuki'; // 25%
  } else if (roll < 85) {
    breed = 'sanke'; // 16%
  } else if (roll < 92) {
    breed = 'jade'; // 7%
  } else {
    breed = 'celestial'; // 8% (Huyền thoại)
  }

  const existingNames = new Set(state.fishes.map((f) => f.name));
  const availableNames = SERENE_KOI_NAMES.filter((n) => !existingNames.has(n));
  const chosenName =
    availableNames.length > 0
      ? availableNames[Math.floor(Math.random() * availableNames.length)]!
      : `Kim Ngư ${state.fishes.length + 1}`;

  const newFish: SavedKoiFish = {
    id: `koi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: chosenName,
    breed,
    level: 1,
    xp: 0,
    scale: getScaleForLevel(1),
    patternSeed: Math.floor(Math.random() * 10000),
    affection: 10,
    hatchedAt: Date.now(),
  };

  const updatedFishes = [...state.fishes, newFish];
  const unlocked = new Set([...state.unlockedBreeds, breed]);

  const newState: ZenKoiGameState = {
    ...state,
    dewGems: state.dewGems - HATCH_GEM_COST,
    fishes: updatedFishes,
    unlockedBreeds: Array.from(unlocked),
    pondLevel: computePondLevel(updatedFishes),
    stats: {
      ...state.stats,
      totalHatched: state.stats.totalHatched + 1,
    },
  };

  saveZenKoiState(newState);
  return { newState, fish: newFish };
}

/**
 * Cho một chú cá ăn: cộng XP, nếu đủ XP thì lên cấp và phóng to kích thước
 */
export function feedFish(
  state: ZenKoiGameState,
  fishId: string,
): { newState: ZenKoiGameState; leveledUp: boolean; newLevel: number } {
  let leveledUp = false;
  let newLevel = 1;

  const updatedFishes = state.fishes.map((fish) => {
    if (fish.id !== fishId) return fish;

    const gainedXp = 10;
    let curXp = fish.xp + gainedXp;
    let curLevel = fish.level;

    while (curLevel < 10 && curXp >= getXpForNextLevel(curLevel)) {
      curXp -= getXpForNextLevel(curLevel);
      curLevel += 1;
      leveledUp = true;
    }

    newLevel = curLevel;

    return {
      ...fish,
      level: curLevel,
      xp: curXp,
      scale: getScaleForLevel(curLevel),
      affection: Math.min(100, fish.affection + 1),
    };
  });

  const newState: ZenKoiGameState = {
    ...state,
    dewGems: state.dewGems + 1, // Đớp mồi nhận thêm 1 ngọc sương
    fishes: updatedFishes,
    pondLevel: computePondLevel(updatedFishes),
    lastFedAt: Date.now(),
    stats: {
      ...state.stats,
      totalFed: state.stats.totalFed + 1,
    },
  };

  saveZenKoiState(newState);
  return { newState, leveledUp, newLevel };
}

/**
 * Vuốt ve chú cá: tăng độ thân thiết
 */
export function petFish(state: ZenKoiGameState, fishId: string): ZenKoiGameState {
  const updatedFishes = state.fishes.map((fish) => {
    if (fish.id !== fishId) return fish;
    return {
      ...fish,
      affection: Math.min(100, fish.affection + 3),
    };
  });

  const newState: ZenKoiGameState = {
    ...state,
    fishes: updatedFishes,
  };

  saveZenKoiState(newState);
  return newState;
}

/**
 * Đổi tên cho chú cá
 */
export function renameFish(
  state: ZenKoiGameState,
  fishId: string,
  newName: string,
): ZenKoiGameState {
  const trimmed = newName.trim();
  if (!trimmed) return state;

  const updatedFishes = state.fishes.map((fish) => {
    if (fish.id !== fishId) return fish;
    return {
      ...fish,
      name: trimmed.slice(0, 24),
    };
  });

  const newState: ZenKoiGameState = {
    ...state,
    fishes: updatedFishes,
  };

  saveZenKoiState(newState);
  return newState;
}

/**
 * Tự động hồi phục thức ăn định kỳ (mỗi 60s nhận 2 Hạt Sen)
 */
export function applyPassiveReplenishment(
  state: ZenKoiGameState,
  now: number = Date.now(),
): ZenKoiGameState {
  const elapsedMs = now - (state.lastReplenishedAt || now);
  const minutes = Math.floor(elapsedMs / 60000);
  if (minutes < 1) return state;

  const addedFood = Math.min(30, minutes * 2);
  const newFoodCount = Math.min(150, state.foodCount + addedFood);

  const newState: ZenKoiGameState = {
    ...state,
    foodCount: newFoodCount,
    lastReplenishedAt: now,
  };

  saveZenKoiState(newState);
  return newState;
}

/**
 * Tặng thưởng thức ăn & ngọc sương khi người dùng hoàn thành 1 bài học trên web
 */
export function awardLessonBonus(state: ZenKoiGameState): ZenKoiGameState {
  const newState: ZenKoiGameState = {
    ...state,
    foodCount: state.foodCount + 10,
    dewGems: state.dewGems + 5,
  };
  saveZenKoiState(newState);
  return newState;
}
