/**
 * Cấu hình trung tâm cho bộ ảnh nền khí quyển ngoài (External Curated Assets)
 * thuộc kiến trúc Thiên Cảnh Kính Mờ (Atmospheric Glassmorphism × Swiss Editorial).
 *
 * - Toàn bộ ảnh đặt tại `public/assets/atmosphere/`.
 * - Chủ dự án có thể thay đổi tranh bất kỳ lúc nào bằng cách ghi đè file cùng tên
 *   mà không cần sửa mã nguồn React.
 * - Khi file ảnh chưa được đặt vào thư mục hoặc tải lỗi, hệ thống tự động chuyển
 *   sang lớp Fallback CSS Watercolor Mesh đồng bộ hoàn toàn với Ceramic Light / Obsidian Studio.
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
 * Tạo lớp nền CSS đa sắc loang màu nước (Layered Watercolor Mesh Fallback)
 * đảm bảo giao diện luôn đạt chất cảm hội họa tinh tế ngay cả khi chưa có ảnh ngoài.
 * - Ceramic Light: Bạch Ngọc – Lam Sương – Lục Nhạt – vệt đồng siêu mảnh (tuyệt đối không ám vàng).
 * - Obsidian Studio: Than Đá – Lục Thông trầm – Lam Đêm – ánh đồng mờ.
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

  // Dashboard Canopy (Tầng 1 Trang Tổng quan): Bạch Ngọc – Lam Sương – Lục Nhạt (Sáng) / Than Đá – Lục Thông – Lam Đêm (Tối)
  if (isDark) {
    return [
      'radial-gradient(64% 92% at 80% 18%, rgba(59, 138, 114, 0.30) 0%, rgba(27, 94, 74, 0.12) 45%, transparent 78%)',
      'radial-gradient(56% 88% at 48% 10%, rgba(29, 79, 110, 0.26) 0%, rgba(29, 79, 110, 0.08) 48%, transparent 76%)',
      'radial-gradient(42% 72% at 16% 24%, rgba(212, 175, 106, 0.12) 0%, transparent 70%)',
      'radial-gradient(48% 76% at 66% 58%, rgba(100, 168, 209, 0.11) 0%, transparent 74%)',
      'linear-gradient(180deg, #0D1514 0%, #101B19 52%, #121716 100%)',
    ].join(', ');
  }

  return [
    'radial-gradient(66% 96% at 82% 16%, rgba(164, 206, 200, 0.56) 0%, rgba(196, 224, 220, 0.22) 48%, transparent 80%)',
    'radial-gradient(58% 90% at 46% 8%, rgba(182, 208, 226, 0.52) 0%, rgba(210, 226, 236, 0.18) 50%, transparent 78%)',
    'radial-gradient(44% 72% at 14% 22%, rgba(212, 232, 225, 0.48) 0%, transparent 74%)',
    'radial-gradient(36% 64% at 68% 44%, rgba(158, 118, 59, 0.10) 0%, transparent 72%)',
    'linear-gradient(180deg, #E8F1F3 0%, #F1F7F6 48%, #FFFFFF 100%)',
  ].join(', ');
}
