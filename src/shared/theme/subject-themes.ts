import { createContext, useContext } from 'react';

export type SubjectThemeId =
  | 'default'
  | 'algebraic-structures'
  | 'affine-geometry'
  | 'single-variable-calculus'
  | 'giao-duc-hoc';

export interface SubjectThemeMeta {
  readonly id: SubjectThemeId;
  readonly name: string;
  readonly shortName: string;
  readonly hue: number;
  readonly description: string;
}

export const SUBJECT_THEMES: Record<SubjectThemeId, SubjectThemeMeta> = {
  default: {
    id: 'default',
    name: 'Mặc định (Hệ thống)',
    shortName: 'Mặc định',
    hue: 260,
    description: 'Bảng màu trung tính dùng cho Trang chủ và các trang chung.',
  },
  'algebraic-structures': {
    id: 'algebraic-structures',
    name: 'Cấu trúc đại số',
    shortName: 'CTĐS',
    hue: 275,
    description: 'Tông Indigo / Violet thể hiện tính trừu tượng, cấu trúc và suy luận logic.',
  },
  'affine-geometry': {
    id: 'affine-geometry',
    name: 'Hình học Affine và hình học Euclide',
    shortName: 'HHAVE',
    hue: 175,
    description: 'Tông Teal / Emerald thể hiện không gian hình học, trực quan và biến đổi.',
  },
  'single-variable-calculus': {
    id: 'single-variable-calculus',
    name: 'Giải tích hàm một biến',
    shortName: 'MATH1403',
    hue: 200,
    description:
      'Tông Azure / Ocean thể hiện sự biến thiên liên tục, giới hạn và phép tính vi tích phân.',
  },
  'giao-duc-hoc': {
    id: 'giao-duc-hoc',
    name: 'Giáo dục học',
    shortName: 'EDUC2802',
    hue: 190,
    description:
      'Tông Slate Teal (xanh học giả) và Terracotta (vàng đất nung) thể hiện lý luận nhân cách, chuẩn nghề nghiệp và nghiệp vụ sư phạm.',
  },
} as const;

export const SubjectThemeContext = createContext<SubjectThemeId>('default');

const SLUG_TO_THEME_ID: Readonly<Record<string, SubjectThemeId>> = {
  default: 'default',
  'algebraic-structures': 'algebraic-structures',
  'cau-truc-dai-so': 'algebraic-structures',
  'affine-geometry': 'affine-geometry',
  'hinh-hoc-affine': 'affine-geometry',
  'single-variable-calculus': 'single-variable-calculus',
  'giai-tich-ham-mot-bien': 'single-variable-calculus',
  'giao-duc-hoc': 'giao-duc-hoc',
  pedagogy: 'giao-duc-hoc',
};

export function isSubjectThemeId(value: string): value is SubjectThemeId {
  return Object.hasOwn(SUBJECT_THEMES, value);
}

/**
 * Phân giải `id` hoặc `slug` tiếng Việt không dấu của môn học về `SubjectThemeId`.
 */
export function resolveSubjectThemeId(subjectOrSlug?: string | null): SubjectThemeId {
  if (!subjectOrSlug) {
    return 'default';
  }
  return SLUG_TO_THEME_ID[subjectOrSlug] ?? 'default';
}

export function useSubjectTheme(): SubjectThemeMeta {
  const themeId = useContext(SubjectThemeContext);
  return SUBJECT_THEMES[themeId];
}
