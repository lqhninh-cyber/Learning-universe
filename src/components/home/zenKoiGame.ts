export type FishSpeciesId = 'koi' | 'goldfish' | 'betta' | 'butterfly' | 'arowana' | 'neon';

export type KoiBreedId = FishSpeciesId | 'kohaku' | 'yamabuki' | 'sanke' | 'jade' | 'celestial';

export interface FishSpeciesMeta {
  readonly id: FishSpeciesId;
  readonly nameVi: string;
  readonly commonName: string;
  readonly description: string;
  readonly bodyShape:
    'torpedo' | 'fantail_oranda' | 'halfmoon_betta' | 'butterfly_carp' | 'arowana' | 'neon_tetra';
  readonly defaultZRange: readonly [number, number];
  readonly baseColor: readonly [number, number, number];
  readonly spotColor: readonly [number, number, number];
  readonly accentColor?: readonly [number, number, number];
  readonly glowColor?: string;
  readonly isButterfly?: boolean;
}

export const FISH_SPECIES: Record<FishSpeciesId, FishSpeciesMeta> = {
  koi: {
    id: 'koi',
    nameVi: 'Cá Chép Koi',
    commonName: 'Koi Carp',
    description:
      'Thân hình thoi khỏe khoắn, có đôi râu ngắn ở mõm, bơi uốn lượn khoan thai với hoa văn Hồng Bạch, Hoàng Kim hoặc Tam Sắc.',
    bodyShape: 'torpedo',
    defaultZRange: [0.25, 0.85],
    baseColor: [252, 250, 246],
    spotColor: [232, 66, 42],
    accentColor: [28, 30, 36],
  },
  goldfish: {
    id: 'goldfish',
    nameVi: 'Cá Vàng Đuôi Voan',
    commonName: 'Fantail Oranda Goldfish',
    description:
      'Thân bầu tròn mũm mĩm, đỉnh đầu có bướu oranda mềm mại, bộ đuôi kép xòe rộng 4 thùy thướt tha đung đưa bồng bềnh như váy lụa.',
    bodyShape: 'fantail_oranda',
    defaultZRange: [0.35, 0.8],
    baseColor: [255, 122, 41],
    spotColor: [255, 218, 148],
    accentColor: [229, 62, 62],
  },
  betta: {
    id: 'betta',
    nameVi: 'Cá Betta Xiêm Rồng',
    commonName: 'Halfmoon Betta',
    description:
      'Thân nhỏ thanh mảnh, vây lưng, vây hậu môn và vây đuôi xòe quạt 180 độ uốn sóng lộng lẫy với sắc Đỏ Ngọc Bích hoặc Xanh Lam Ánh Tím.',
    bodyShape: 'halfmoon_betta',
    defaultZRange: [0.4, 0.88],
    baseColor: [225, 29, 72],
    spotColor: [99, 102, 241],
    accentColor: [248, 250, 252],
    glowColor: 'rgba(244, 63, 94, 0.45)',
  },
  butterfly: {
    id: 'butterfly',
    nameVi: 'Cá Chép Phụng',
    commonName: 'Butterfly Fin Carp',
    description:
      'Thân trắng bạc hoặc vàng kim ánh ngọc trai, nổi bật với đôi vây ngực và vây đuôi dài thướt tha gấp 3 lần bình thường tung bay như cánh phượng.',
    bodyShape: 'butterfly_carp',
    defaultZRange: [0.3, 0.9],
    baseColor: [248, 245, 235],
    spotColor: [251, 191, 36],
    accentColor: [255, 245, 180],
    glowColor: 'rgba(251, 191, 36, 0.4)',
    isButterfly: true,
  },
  arowana: {
    id: 'arowana',
    nameVi: 'Cá Rồng Kim Long',
    commonName: 'Asian Arowana',
    description:
      'Thân dài uy nghi, mõm hếch với 2 râu rồng vểnh trước, vảy lớn ánh kim loại 3D (Vàng 24K hoặc Đỏ Huyết), dáng bơi thẳng dứt khoát ở tầng nước mặt.',
    bodyShape: 'arowana',
    defaultZRange: [0.72, 0.98],
    baseColor: [245, 158, 11],
    spotColor: [252, 211, 77],
    accentColor: [220, 38, 38],
    glowColor: 'rgba(245, 158, 11, 0.55)',
  },
  neon: {
    id: 'neon',
    nameVi: 'Cá Thanh Ngọc Phát Quang',
    commonName: 'Bioluminescent Medaka',
    description:
      'Kích thước nhỏ nhắn trong suốt, trên sống lưng có dải quang học phát sáng xanh ngọc – lam điện tử, thường bơi quấn quýt quanh gốc sen.',
    bodyShape: 'neon_tetra',
    defaultZRange: [0.2, 0.75],
    baseColor: [52, 211, 153],
    spotColor: [0, 245, 255],
    accentColor: [167, 243, 208],
    glowColor: 'rgba(0, 245, 255, 0.65)',
  },
};

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
  koi: {
    id: 'koi',
    nameVi: FISH_SPECIES.koi.nameVi,
    englishName: FISH_SPECIES.koi.commonName,
    rarityVi: 'Phổ biến',
    rarityTier: 1,
    description: FISH_SPECIES.koi.description,
    baseColor: [...FISH_SPECIES.koi.baseColor],
    spotColor: [...FISH_SPECIES.koi.spotColor],
    accentColor: FISH_SPECIES.koi.accentColor ? [...FISH_SPECIES.koi.accentColor] : undefined,
  },
  goldfish: {
    id: 'goldfish',
    nameVi: FISH_SPECIES.goldfish.nameVi,
    englishName: FISH_SPECIES.goldfish.commonName,
    rarityVi: 'Phổ biến',
    rarityTier: 2,
    description: FISH_SPECIES.goldfish.description,
    baseColor: [...FISH_SPECIES.goldfish.baseColor],
    spotColor: [...FISH_SPECIES.goldfish.spotColor],
    accentColor: FISH_SPECIES.goldfish.accentColor
      ? [...FISH_SPECIES.goldfish.accentColor]
      : undefined,
  },
  betta: {
    id: 'betta',
    nameVi: FISH_SPECIES.betta.nameVi,
    englishName: FISH_SPECIES.betta.commonName,
    rarityVi: 'Hiếm',
    rarityTier: 3,
    description: FISH_SPECIES.betta.description,
    baseColor: [...FISH_SPECIES.betta.baseColor],
    spotColor: [...FISH_SPECIES.betta.spotColor],
    accentColor: FISH_SPECIES.betta.accentColor ? [...FISH_SPECIES.betta.accentColor] : undefined,
    glowColor: FISH_SPECIES.betta.glowColor,
  },
  butterfly: {
    id: 'butterfly',
    nameVi: FISH_SPECIES.butterfly.nameVi,
    englishName: FISH_SPECIES.butterfly.commonName,
    rarityVi: 'Cực hiếm',
    rarityTier: 4,
    description: FISH_SPECIES.butterfly.description,
    baseColor: [...FISH_SPECIES.butterfly.baseColor],
    spotColor: [...FISH_SPECIES.butterfly.spotColor],
    accentColor: FISH_SPECIES.butterfly.accentColor
      ? [...FISH_SPECIES.butterfly.accentColor]
      : undefined,
    glowColor: FISH_SPECIES.butterfly.glowColor,
    isButterfly: true,
  },
  arowana: {
    id: 'arowana',
    nameVi: FISH_SPECIES.arowana.nameVi,
    englishName: FISH_SPECIES.arowana.commonName,
    rarityVi: 'Huyền thoại',
    rarityTier: 5,
    description: FISH_SPECIES.arowana.description,
    baseColor: [...FISH_SPECIES.arowana.baseColor],
    spotColor: [...FISH_SPECIES.arowana.spotColor],
    accentColor: FISH_SPECIES.arowana.accentColor
      ? [...FISH_SPECIES.arowana.accentColor]
      : undefined,
    glowColor: FISH_SPECIES.arowana.glowColor,
  },
  neon: {
    id: 'neon',
    nameVi: FISH_SPECIES.neon.nameVi,
    englishName: FISH_SPECIES.neon.commonName,
    rarityVi: 'Hiếm',
    rarityTier: 3,
    description: FISH_SPECIES.neon.description,
    baseColor: [...FISH_SPECIES.neon.baseColor],
    spotColor: [...FISH_SPECIES.neon.spotColor],
    accentColor: FISH_SPECIES.neon.accentColor ? [...FISH_SPECIES.neon.accentColor] : undefined,
    glowColor: FISH_SPECIES.neon.glowColor,
  },
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
  species: FishSpeciesId;
  breed: KoiBreedId;
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

const SERENE_FISH_NAMES: readonly string[] = [
  'Bạch Vân',
  'Kim Ngân',
  'Thủy Mặc',
  'Hồng Diệp',
  'Xích Long',
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

export function mapOldBreedToSpecies(breed: string): FishSpeciesId {
  switch (breed) {
    case 'goldfish':
      return 'goldfish';
    case 'betta':
      return 'betta';
    case 'butterfly':
    case 'celestial':
      return 'butterfly';
    case 'arowana':
      return 'arowana';
    case 'neon':
    case 'jade':
      return 'neon';
    case 'koi':
    case 'kohaku':
    case 'yamabuki':
    case 'sanke':
    default:
      return 'koi';
  }
}

export function createInitialZenKoiState(): ZenKoiGameState {
  const now = Date.now();
  const initialFishes: SavedKoiFish[] = [
    {
      id: 'fish-init-1',
      name: 'Bạch Vân',
      species: 'koi',
      breed: 'koi',
      level: 2,
      xp: 20,
      scale: getScaleForLevel(2),
      patternSeed: 101,
      affection: 25,
      hatchedAt: now - 86400000,
    },
    {
      id: 'fish-init-2',
      name: 'Kim Ngân',
      species: 'goldfish',
      breed: 'goldfish',
      level: 1,
      xp: 0,
      scale: getScaleForLevel(1),
      patternSeed: 202,
      affection: 18,
      hatchedAt: now - 72000000,
    },
    {
      id: 'fish-init-3',
      name: 'Xích Long',
      species: 'betta',
      breed: 'betta',
      level: 2,
      xp: 35,
      scale: getScaleForLevel(2),
      patternSeed: 303,
      affection: 22,
      hatchedAt: now - 60000000,
    },
    {
      id: 'fish-init-4',
      name: 'Thanh Ngọc',
      species: 'neon',
      breed: 'neon',
      level: 1,
      xp: 15,
      scale: getScaleForLevel(1),
      patternSeed: 404,
      affection: 14,
      hatchedAt: now - 48000000,
    },
  ];

  return {
    version: 1,
    pondLevel: computePondLevel(initialFishes),
    foodCount: 99,
    dewGems: 25,
    fishes: initialFishes,
    unlockedBreeds: ['koi', 'goldfish', 'betta', 'butterfly', 'arowana', 'neon'],
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

    const state: ZenKoiGameState = {
      version: 1,
      pondLevel:
        typeof parsed.pondLevel === 'number' ? parsed.pondLevel : computePondLevel(parsed.fishes),
      foodCount: typeof parsed.foodCount === 'number' ? Math.max(0, parsed.foodCount) : 99,
      dewGems: typeof parsed.dewGems === 'number' ? Math.max(0, parsed.dewGems) : 25,
      fishes: parsed.fishes.map((f, idx) => {
        const rawBreed = String(f.breed || 'koi');
        const species = (
          f.species && FISH_SPECIES[f.species as FishSpeciesId]
            ? f.species
            : mapOldBreedToSpecies(rawBreed)
        ) as FishSpeciesId;
        const validBreed = (KOI_BREEDS[rawBreed as KoiBreedId] ? rawBreed : species) as KoiBreedId;

        return {
          id: f.id || `fish-${idx + 1}`,
          name: f.name || `Cá ${idx + 1}`,
          species,
          breed: validBreed,
          level: Math.max(1, Math.min(10, f.level || 1)),
          xp: Math.max(0, f.xp || 0),
          scale: typeof f.scale === 'number' ? f.scale : getScaleForLevel(f.level || 1),
          patternSeed: typeof f.patternSeed === 'number' ? f.patternSeed : (idx + 1) * 111,
          affection: Math.max(0, Math.min(100, f.affection || 10)),
          hatchedAt: f.hatchedAt || Date.now(),
        };
      }),
      unlockedBreeds:
        Array.isArray(parsed.unlockedBreeds) && parsed.unlockedBreeds.length > 0
          ? parsed.unlockedBreeds
          : ['koi', 'goldfish', 'betta', 'butterfly', 'arowana', 'neon'],
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
 * Thêm một chú cá mới vào hồ (Chế độ Sandbox tự do)
 */
export function addFishToLake(
  state: ZenKoiGameState,
  species: FishSpeciesId,
  customName?: string,
): { newState: ZenKoiGameState; fish: SavedKoiFish } {
  const existingNames = new Set(state.fishes.map((f) => f.name));
  const availableNames = SERENE_FISH_NAMES.filter((n) => !existingNames.has(n));
  const chosenName =
    customName?.trim() ||
    (availableNames.length > 0
      ? availableNames[Math.floor(Math.random() * availableNames.length)]!
      : `${FISH_SPECIES[species].nameVi} ${state.fishes.length + 1}`);

  const newFish: SavedKoiFish = {
    id: `fish-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: chosenName,
    species,
    breed: species,
    level: 1,
    xp: 0,
    scale: getScaleForLevel(1),
    patternSeed: Math.floor(Math.random() * 10000),
    affection: 15,
    hatchedAt: Date.now(),
  };

  const updatedFishes = [...state.fishes, newFish];
  const unlocked = new Set([...state.unlockedBreeds, species]);

  const newState: ZenKoiGameState = {
    ...state,
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
 * Thả bớt cá ra khỏi hồ
 */
export function removeFishFromLake(state: ZenKoiGameState, fishId: string): ZenKoiGameState {
  const updatedFishes = state.fishes.filter((f) => f.id !== fishId);
  if (updatedFishes.length === 0) return state; // Giữ ít nhất 1 chú cá

  const newState: ZenKoiGameState = {
    ...state,
    fishes: updatedFishes,
    pondLevel: computePondLevel(updatedFishes),
  };

  saveZenKoiState(newState);
  return newState;
}

/**
 * Điều chỉnh kích thước cá trong chế độ Sandbox
 */
export function updateFishScale(
  state: ZenKoiGameState,
  fishId: string,
  newScale: number,
): ZenKoiGameState {
  const clamped = Number(Math.max(0.4, Math.min(1.8, newScale)).toFixed(2));
  const updatedFishes = state.fishes.map((f) => {
    if (f.id !== fishId) return f;
    return {
      ...f,
      scale: clamped,
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
 * Ấp / Tạo cá mới (Gacha ngẫu nhiên 6 loài)
 */
export function hatchNewKoi(
  state: ZenKoiGameState,
): { newState: ZenKoiGameState; fish: SavedKoiFish } | null {
  const roll = Math.random() * 100;
  let species: FishSpeciesId;
  if (roll < 30) {
    species = 'koi'; // 30%
  } else if (roll < 52) {
    species = 'goldfish'; // 22%
  } else if (roll < 70) {
    species = 'betta'; // 18%
  } else if (roll < 82) {
    species = 'neon'; // 12%
  } else if (roll < 92) {
    species = 'butterfly'; // 10%
  } else {
    species = 'arowana'; // 8% (Huyền thoại Cá Rồng Kim Long)
  }

  const result = addFishToLake(state, species);
  const newState: ZenKoiGameState = {
    ...result.newState,
    dewGems: Math.max(0, state.dewGems - (state.dewGems >= HATCH_GEM_COST ? HATCH_GEM_COST : 0)),
  };
  saveZenKoiState(newState);
  return { newState, fish: result.fish };
}

/**
 * Cho cá ăn: cộng XP, lên cấp và tăng nhẹ kích thước
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
    dewGems: state.dewGems + 1,
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

export function awardLessonBonus(state: ZenKoiGameState): ZenKoiGameState {
  const newState: ZenKoiGameState = {
    ...state,
    foodCount: state.foodCount + 10,
    dewGems: state.dewGems + 5,
  };
  saveZenKoiState(newState);
  return newState;
}
