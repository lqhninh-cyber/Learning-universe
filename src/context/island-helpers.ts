import { resolveLessonShortcut } from '@/content-runtime';
import type { ReadingFontSize } from '@/context/ReadingSettingsContext';

export type IslandSubjectCode = 'CTĐS' | 'HHAVE' | 'GTHMB' | 'GDH';

export interface IslandSubjectMeta {
  readonly id: string;
  readonly slug: string;
  readonly code: IslandSubjectCode;
  readonly name: string;
  readonly accentColor: string;
}

export const ISLAND_SUBJECT_CATALOG: readonly IslandSubjectMeta[] = [
  {
    id: 'algebraic-structures',
    slug: 'cau-truc-dai-so',
    code: 'CTĐS',
    name: 'Cấu trúc đại số',
    accentColor: '#9C7A4C',
  },
  {
    id: 'affine-geometry',
    slug: 'hinh-hoc-affine',
    code: 'HHAVE',
    name: 'Hình học Affine và Euclide',
    accentColor: '#49768F',
  },
  {
    id: 'single-variable-calculus',
    slug: 'giai-tich-ham-mot-bien',
    code: 'GTHMB',
    name: 'Giải tích hàm một biến',
    accentColor: '#3B7A65',
  },
  {
    id: 'giao-duc-hoc',
    slug: 'giao-duc-hoc',
    code: 'GDH',
    name: 'Giáo dục học',
    accentColor: '#9E6356',
  },
] as const;

export function getIslandSubjectByIdOrSlug(
  subjectOrSlug?: string | null,
): IslandSubjectMeta | null {
  if (!subjectOrSlug) return null;
  const normalized = subjectOrSlug === 'pedagogy' ? 'giao-duc-hoc' : subjectOrSlug;
  return (
    ISLAND_SUBJECT_CATALOG.find((item) => item.id === normalized || item.slug === normalized) ??
    null
  );
}

export function resolveActiveSubjectFromPath(pathname: string): IslandSubjectMeta | null {
  const courseMatch = pathname.match(/^\/(?:mon-hoc|courses)\/([^/]+)(?:\/|$)/);
  if (courseMatch?.[1]) {
    return getIslandSubjectByIdOrSlug(courseMatch[1]);
  }

  const shortcutMatch = pathname.match(/^\/bai-hoc\/([^/]+)\/?$/);
  if (shortcutMatch?.[1]) {
    const loc = resolveLessonShortcut(shortcutMatch[1]);
    if (loc) {
      return (
        getIslandSubjectByIdOrSlug(loc.subject.slug) ?? getIslandSubjectByIdOrSlug(loc.subject.id)
      );
    }
  }

  return null;
}

export const FONT_SCALE_MIN = 0.9;
export const FONT_SCALE_MAX = 1.25;
export const FONT_SCALE_STEP = 0.05;
export const FONT_SCALE_DEFAULT = 1.0;

export function clampFontScale(value: number): number {
  const clamped = Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, value));
  return Math.round(clamped * 100) / 100;
}

export function fontScaleToReadingSize(scale: number): ReadingFontSize {
  if (scale <= 0.95) return 'sm';
  if (scale < 1.05) return 'base';
  if (scale < 1.15) return 'lg';
  return 'xl';
}

export function readingSizeToFontScale(size: ReadingFontSize): number {
  switch (size) {
    case 'sm':
      return 0.9;
    case 'lg':
      return 1.1;
    case 'xl':
      return 1.25;
    case 'base':
    default:
      return 1.0;
  }
}

export interface LessonReadingPosition {
  readonly sectionTitle: string;
  readonly progressPercent: number;
  readonly updatedAt: string;
}

const READING_POSITION_STORAGE_KEY = 'lu_lesson_section_progress_v1';

export function readLessonReadingPosition(lessonId: string): LessonReadingPosition | null {
  if (typeof window === 'undefined' || !lessonId) return null;
  try {
    const raw = window.localStorage.getItem(READING_POSITION_STORAGE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, LessonReadingPosition>;
    return map[lessonId] ?? null;
  } catch {
    return null;
  }
}

export function writeLessonReadingPosition(
  lessonId: string,
  entry: Omit<LessonReadingPosition, 'updatedAt'>,
): void {
  if (typeof window === 'undefined' || !lessonId) return;
  try {
    const raw = window.localStorage.getItem(READING_POSITION_STORAGE_KEY);
    const map: Record<string, LessonReadingPosition> = raw
      ? (JSON.parse(raw) as Record<string, LessonReadingPosition>)
      : {};
    map[lessonId] = {
      sectionTitle: entry.sectionTitle,
      progressPercent: Math.min(100, Math.max(0, Math.round(entry.progressPercent))),
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(READING_POSITION_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Bỏ qua lỗi lưu trữ cục bộ
  }
}
