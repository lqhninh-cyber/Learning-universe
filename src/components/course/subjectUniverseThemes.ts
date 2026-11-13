import type { CSSProperties } from 'react';

/**
 * Cấu hình bản sắc thị giác cho 4 "Không gian Tri thức" trên trang Chi tiết Môn học.
 * Mỗi môn có bảng màu, chủ đề Canvas 120fps và sơ đồ điều hướng nhanh tới các chương riêng.
 *
 * Lưu ý: `chapterNumbers` khớp với `chapter.number` trong manifest (số thứ tự lấy từ tiền tố
 * thư mục `content/` hoặc dữ liệu học phần), không tự tạo thêm chương mới.
 */

export type SubjectUniverseId = 'ctds' | 'hhave' | 'gthmb' | 'gdh';

export interface SubjectUniverseStage {
  readonly id: string;
  /** Tên chặng / bậc cấu trúc hiển thị chính */
  readonly label: string;
  /** Ký hiệu hoặc mô tả ngắn đi kèm (hiển thị dạng mono nhỏ) */
  readonly detail?: string;
  /** Số thứ tự các chương tương ứng trong manifest */
  readonly chapterNumbers: readonly number[];
}

export interface SubjectUniverseTheme {
  readonly id: SubjectUniverseId;
  readonly slug: string;
  /** Mã viết tắt hiển thị: CTĐS, HHAVE, GTHMB, GDH */
  readonly code: string;
  /** Tên chủ đề không gian tri thức */
  readonly themeTitle: string;
  /** Nền gradient sơn mài / không gian của Hero */
  readonly background: string;
  /** Màu nền tối nhất (dùng cho lớp tương phản chữ bên trái) */
  readonly baseRgb: readonly [number, number, number];
  /** Màu nhấn chính (vòng tròn, thanh tiến độ, viền) */
  readonly accent: string;
  /** Màu nhấn phụ */
  readonly accentSecondary: string;
  /** Màu nhấn thứ ba (nếu có) */
  readonly accentTertiary?: string;
  /** Tông chữ đậm của màu nhấn, đảm bảo tương phản trên nền sáng */
  readonly accentInk: string;
  /** Bề mặt sáng phớt màu nhấn cho thẻ bài học khi hover */
  readonly surface: string;
  /** Tiêu đề sơ đồ điều hướng nhanh bên phải Hero */
  readonly widgetTitle: string;
  readonly stages: readonly SubjectUniverseStage[];
}

export const SUBJECT_UNIVERSE_THEMES: Readonly<Record<SubjectUniverseId, SubjectUniverseTheme>> = {
  ctds: {
    id: 'ctds',
    slug: 'cau-truc-dai-so',
    code: 'CTĐS',
    themeTitle: 'Tinh Thể Đối Xứng & Đồ Thị Cayley',
    background: 'linear-gradient(135deg, #120E0A 0%, #1F1710 55%, #2C1E12 100%)',
    baseRgb: [18, 14, 10],
    accent: '#E5B84B',
    accentSecondary: '#D94E34',
    accentInk: '#8A6110',
    surface: '#FBF5E6',
    widgetTitle: 'Thang Cấu Trúc Đại Số',
    stages: [
      { id: 'tap-hop', label: 'Tập hợp', chapterNumbers: [0] },
      { id: 'nhom', label: 'Nhóm', detail: '(G, ∗)', chapterNumbers: [1, 2, 3, 4, 5] },
      { id: 'vanh', label: 'Vành', detail: '(R, +, ·)', chapterNumbers: [6, 7, 8] },
      { id: 'mien-nguyen', label: 'Miền nguyên', chapterNumbers: [6, 9] },
      { id: 'truong', label: 'Trường', detail: '(F)', chapterNumbers: [9] },
    ],
  },
  hhave: {
    id: 'hhave',
    slug: 'hinh-hoc-affine',
    code: 'HHAVE',
    themeTitle: 'Không Gian Tọa Độ & Siêu Mặt Bậc Hai',
    background: 'linear-gradient(135deg, #07151F 0%, #0C2536 55%, #12374D 100%)',
    baseRgb: [7, 21, 31],
    accent: '#38BDF8',
    accentSecondary: '#FDE68A',
    accentInk: '#0B6A99',
    surface: '#EEF8FD',
    widgetTitle: 'Ba Tầng Hình Học',
    stages: [
      {
        id: 'affine',
        label: 'Hình học Affine',
        detail: 'Bất biến tỉ số đơn',
        chapterNumbers: [1],
      },
      {
        id: 'euclide',
        label: 'Hình học Euclide',
        detail: 'Tích vô hướng & Đẳng cự',
        chapterNumbers: [2],
      },
      {
        id: 'xa-anh',
        label: 'Hình học Xạ ảnh',
        detail: 'Tỉ số kép & Đối ngẫu',
        chapterNumbers: [3],
      },
    ],
  },
  gthmb: {
    id: 'gthmb',
    slug: 'giai-tich-ham-mot-bien',
    code: 'GTHMB',
    themeTitle: 'Dòng Chảy Liên Tục & Hội Tụ Chuỗi Hàm',
    background: 'linear-gradient(135deg, #061A15 0%, #0B2B23 55%, #123E33 100%)',
    baseRgb: [6, 26, 21],
    accent: '#34D399',
    accentSecondary: '#FBBF24',
    accentInk: '#08734F',
    surface: '#ECF9F3',
    widgetTitle: 'Mạch Giải Tích 5 Chặng',
    stages: [
      { id: 'so-thuc', label: 'Số thực', detail: 'sup / inf', chapterNumbers: [1, 2] },
      {
        id: 'gioi-han',
        label: 'Giới hạn dãy & hàm',
        detail: 'ε – N, ε – δ',
        chapterNumbers: [3, 4],
      },
      { id: 'lien-tuc', label: 'Hàm liên tục', detail: 'C[a, b]', chapterNumbers: [4] },
      { id: 'vi-phan', label: 'Phép tính vi phân', detail: 'f′(x)', chapterNumbers: [5] },
      {
        id: 'tich-phan-chuoi',
        label: 'Tích phân & Chuỗi',
        detail: '∫ f(x) dx, Σ uₙ',
        chapterNumbers: [6, 7],
      },
    ],
  },
  gdh: {
    id: 'gdh',
    slug: 'giao-duc-hoc',
    code: 'GDH',
    themeTitle: 'Vòm Cây Nhân Cách & Hệ Sinh Thái Sư Phạm',
    background: 'linear-gradient(135deg, #1A110F 0%, #2B1A16 55%, #3B241E 100%)',
    baseRgb: [26, 17, 15],
    accent: '#E76F51',
    accentSecondary: '#E9C46A',
    accentTertiary: '#52B788',
    accentInk: '#B1452B',
    surface: '#FDF1EC',
    widgetTitle: 'Bản Đồ 4 Trụ Cột Sư Phạm',
    stages: [
      {
        id: 'hoat-dong-su-pham',
        label: 'Hoạt động sư phạm & Nhân cách GV',
        chapterNumbers: [1],
      },
      { id: 'ly-luan-giao-duc', label: 'Lý luận Giáo dục', chapterNumbers: [2, 3] },
      {
        id: 'cong-tac-chu-nhiem',
        label: 'Công tác Chủ nhiệm',
        detail: 'GVCN & HĐTN, hướng nghiệp',
        chapterNumbers: [4, 5],
      },
      { id: 'thuc-hanh-tinh-huong', label: 'Thực hành Tình huống', chapterNumbers: [6] },
    ],
  },
};

const SLUG_TO_UNIVERSE: Readonly<Record<string, SubjectUniverseId>> = {
  'cau-truc-dai-so': 'ctds',
  'hinh-hoc-affine': 'hhave',
  'giai-tich-ham-mot-bien': 'gthmb',
  'giao-duc-hoc': 'gdh',
};

/** Tra cứu không gian tri thức theo slug môn học (mặc định CTĐS cho môn chưa cấu hình). */
export function getSubjectUniverseTheme(slug: string): SubjectUniverseTheme {
  const id = SLUG_TO_UNIVERSE[slug] ?? 'ctds';
  return SUBJECT_UNIVERSE_THEMES[id];
}

/** Chuyển mã màu HEX (#RRGGBB) sang chuỗi rgba(). */
export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(
    normalized.length === 3 ? normalized.replace(/(.)/g, '$1$1') : normalized,
    16,
  );
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Bộ biến CSS bản sắc môn học truyền xuống toàn bộ thân trang:
 * `--subject-accent`, `--subject-accent-2`, `--subject-accent-ink`, `--subject-surface`,
 * `--subject-accent-soft`, `--subject-accent-border`.
 */
export function getSubjectThemeVars(theme: SubjectUniverseTheme): CSSProperties {
  return {
    '--subject-accent': theme.accent,
    '--subject-accent-2': theme.accentSecondary,
    '--subject-accent-ink': theme.accentInk,
    '--subject-surface': theme.surface,
    '--subject-accent-soft': hexToRgba(theme.accent, 0.14),
    '--subject-accent-border': hexToRgba(theme.accent, 0.55),
  } as CSSProperties;
}
