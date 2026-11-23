/**
 * Cấu hình trung tâm cho bộ ảnh chụp thật 0% AI (External Curated Real Photography)
 * trong `public/assets/atmosphere/` — phong cách Spatial Editorial Portal (Spaces That Inspire × Pomaii).
 *
 * - Toàn bộ 7 tệp ảnh chụp thật được tối ưu cục bộ dạng `.webp` (miễn phí bản quyền Wikimedia Commons).
 * - Khi thiếu ảnh hoặc trong môi trường offline/test, hệ thống tự dùng Fallback CSS gradient giàu chiều sâu.
 */

export interface CanopyThemePair {
  readonly light: string;
  readonly dark: string;
}

export interface SubjectWashAssetConfig {
  readonly slug: string;
  readonly shortCode: string;
  readonly src: string;
  readonly accentHex: string;
  readonly darkAccentHex: string;
  readonly rgb: string;
  readonly darkRgb: string;
  readonly objectPosition?: string;
}

export const ATMOSPHERE_BASE_PATH = '/assets/atmosphere' as const;

export const DASHBOARD_CANOPY_ASSETS: CanopyThemePair = {
  light: `${ATMOSPHERE_BASE_PATH}/dashboard-canopy-light.webp`,
  dark: `${ATMOSPHERE_BASE_PATH}/dashboard-canopy-dark.webp`,
};

export const SANCTUARY_BANNER_ASSET = {
  src: `${ATMOSPHERE_BASE_PATH}/sanctuary-banner.webp`,
  alt: 'Vườn rêu tĩnh lặng chùa Saihō-ji (Kyoto) trong ánh nắng dịu chiều',
  fallbackGradient: 'radial-gradient(80% 110% at 24% 50%, #245243 0%, #17332C 58%, #0E1F1A 100%)',
} as const;

export const STUDIO_PREVIEW_ASSETS = {
  mathInk: {
    src: `${ATMOSPHERE_BASE_PATH}/studio-ink-desk.jpg`,
    alt: 'Bàn phác thảo hình học không gian với vở ô ly và bút bảng viết toán',
    fallbackGradient: 'linear-gradient(135deg, #EAF3F6 0%, #DFECE9 54%, #F6EFE2 100%)',
  },
  examBuilder: {
    src: `${ATMOSPHERE_BASE_PATH}/studio-exam-folio.jpg`,
    alt: 'Tập hồ sơ soạn đề toán học kèm thước đồng và dải ruy-băng ngọc lục bảo',
    fallbackGradient: 'linear-gradient(135deg, #F6F1E7 0%, #E7EFEA 55%, #DCE6E2 100%)',
  },
} as const;

export const PLANNER_EMPTY_ASSET = {
  src: `${ATMOSPHERE_BASE_PATH}/planner-scholar-desk.jpg`,
  alt: 'Sổ lịch học tập đặt bên đồng hồ cát đồng và viên ngọc lục bảo dưới nắng sáng',
  fallbackGradient: 'linear-gradient(135deg, #F4F7F4 0%, #E7EFEA 55%, #F6EFE2 100%)',
} as const;

export const SUBJECT_WASH_ASSETS: Readonly<Record<string, SubjectWashAssetConfig>> = {
  'cau-truc-dai-so': {
    slug: 'cau-truc-dai-so',
    shortCode: 'CTĐS',
    src: `${ATMOSPHERE_BASE_PATH}/subject-wash-ctds.webp`,
    accentHex: '#8C5828',
    darkAccentHex: '#D99B5E',
    rgb: '140, 88, 40',
    darkRgb: '217, 155, 94',
    objectPosition: 'center 35%',
  },
  'hinh-hoc-affine': {
    slug: 'hinh-hoc-affine',
    shortCode: 'HHAVE',
    src: `${ATMOSPHERE_BASE_PATH}/subject-wash-hhave.webp`,
    accentHex: '#1D4F6E',
    darkAccentHex: '#64A8D1',
    rgb: '29, 79, 110',
    darkRgb: '100, 168, 209',
    objectPosition: 'center 35%',
  },
  'giai-tich-ham-mot-bien': {
    slug: 'giai-tich-ham-mot-bien',
    shortCode: 'GTHMB',
    src: `${ATMOSPHERE_BASE_PATH}/subject-wash-gthmb.webp`,
    accentHex: '#1B5E4A',
    darkAccentHex: '#52B394',
    rgb: '27, 94, 74',
    darkRgb: '82, 179, 148',
    objectPosition: 'center 35%',
  },
  'giao-duc-hoc': {
    slug: 'giao-duc-hoc',
    shortCode: 'GDH',
    src: `${ATMOSPHERE_BASE_PATH}/subject-wash-gdh.webp`,
    accentHex: '#8F3D35',
    darkAccentHex: '#DF7B70',
    rgb: '143, 61, 53',
    darkRgb: '223, 123, 112',
    objectPosition: 'center 35%',
  },
};

export function getSubjectWashAsset(slug?: string): SubjectWashAssetConfig | null {
  if (!slug) return null;
  return SUBJECT_WASH_ASSETS[slug] ?? null;
}

/**
 * Tạo lớp nền CSS đa sắc giàu chiều sâu (Fallback Gradient) phòng môi trường offline/test.
 */
export function buildAtmosphericFallbackMesh(options: {
  readonly variant: 'dashboard' | 'learning-space' | 'subject';
  readonly isDark: boolean;
  readonly subjectSlug?: string;
}): string {
  const { variant, isDark, subjectSlug } = options;

  if (variant === 'subject') {
    const wash = getSubjectWashAsset(subjectSlug);
    const rgb = isDark ? (wash?.darkRgb ?? '82, 179, 148') : (wash?.rgb ?? '27, 94, 74');
    if (isDark) {
      return [
        `radial-gradient(62% 110% at 84% 16%, rgba(${rgb}, 0.24) 0%, rgba(${rgb}, 0.08) 46%, transparent 78%)`,
        `radial-gradient(50% 95% at 18% 12%, rgba(${rgb}, 0.16) 0%, transparent 72%)`,
        `radial-gradient(45% 85% at 54% 6%, rgba(212, 175, 106, 0.08) 0%, transparent 70%)`,
        'linear-gradient(180deg, #101816 0%, #121716 100%)',
      ].join(', ');
    }
    return [
      `radial-gradient(64% 115% at 82% 14%, rgba(${rgb}, 0.16) 0%, rgba(${rgb}, 0.05) 48%, transparent 80%)`,
      `radial-gradient(52% 95% at 16% 18%, rgba(${rgb}, 0.11) 0%, transparent 74%)`,
      'radial-gradient(46% 85% at 54% 8%, rgba(209, 224, 228, 0.42) 0%, transparent 74%)',
      'linear-gradient(180deg, #F4F8F8 0%, #FFFFFF 100%)',
    ].join(', ');
  }

  if (variant === 'learning-space') {
    if (isDark) {
      return [
        'radial-gradient(54% 115% at 78% 22%, rgba(82, 179, 148, 0.22) 0%, rgba(29, 79, 110, 0.12) 44%, transparent 78%)',
        'radial-gradient(48% 95% at 22% 14%, rgba(100, 168, 209, 0.16) 0%, transparent 74%)',
        'radial-gradient(38% 80% at 56% 12%, rgba(212, 175, 106, 0.09) 0%, transparent 70%)',
        'linear-gradient(180deg, #0E1715 0%, #121716 100%)',
      ].join(', ');
    }
    return [
      'radial-gradient(56% 118% at 78% 20%, rgba(27, 94, 74, 0.14) 0%, rgba(29, 79, 110, 0.06) 46%, transparent 80%)',
      'radial-gradient(50% 96% at 18% 12%, rgba(29, 79, 110, 0.12) 0%, transparent 74%)',
      'radial-gradient(40% 78% at 54% 6%, rgba(158, 118, 59, 0.07) 0%, transparent 70%)',
      'linear-gradient(180deg, #EEF5F5 0%, #F8FBFA 56%, #FFFFFF 100%)',
    ].join(', ');
  }

  // Dashboard Spatial Hero Fallback: sắc độ đậm sâu ở nửa dưới để kính mờ xuyên qua nổi khối rõ nét
  if (isDark) {
    return [
      'radial-gradient(64% 92% at 82% 24%, rgba(59, 138, 114, 0.34) 0%, rgba(27, 94, 74, 0.14) 48%, transparent 80%)',
      'radial-gradient(58% 88% at 24% 80%, rgba(29, 79, 110, 0.36) 0%, transparent 76%)',
      'radial-gradient(42% 72% at 58% 64%, rgba(212, 175, 106, 0.16) 0%, transparent 72%)',
      'linear-gradient(135deg, #0D1917 0%, #132823 54%, #0B1412 100%)',
    ].join(', ');
  }

  return [
    'radial-gradient(68% 96% at 78% 28%, rgba(44, 112, 92, 0.44) 0%, rgba(29, 79, 110, 0.22) 52%, transparent 82%)',
    'radial-gradient(56% 88% at 24% 78%, rgba(23, 51, 44, 0.56) 0%, transparent 78%)',
    'radial-gradient(44% 70% at 54% 18%, rgba(158, 186, 198, 0.46) 0%, transparent 72%)',
    'linear-gradient(135deg, #1E3D35 0%, #2B5350 48%, #162E2A 100%)',
  ].join(', ');
}
