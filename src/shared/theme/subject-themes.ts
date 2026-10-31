import { createContext, useContext } from 'react';

export type SubjectThemeId = 'default' | 'algebraic-structures' | 'affine-geometry';

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
    name: 'Hình học Affine',
    shortName: 'HH Affine',
    hue: 175,
    description: 'Tông Teal / Emerald thể hiện không gian hình học, trực quan và biến đổi.',
  },
} as const;

export const SubjectThemeContext = createContext<SubjectThemeId>('default');

const SLUG_TO_THEME_ID: Readonly<Record<string, SubjectThemeId>> = {
  default: 'default',
  'algebraic-structures': 'algebraic-structures',
  'cau-truc-dai-so': 'algebraic-structures',
  'affine-geometry': 'affine-geometry',
  'hinh-hoc-affine': 'affine-geometry',
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
