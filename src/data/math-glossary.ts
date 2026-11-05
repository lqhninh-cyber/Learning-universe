import { normalizeSearchQuery } from '@/utils/vietnamese-text';
import rawGlossary from './math-glossary.json';

export type MathGlossarySubject = 'cau-truc-dai-so' | 'hinh-hoc-affine' | 'giai-tich-ham-mot-bien';

export interface MathGlossaryEntry {
  readonly id: string;
  readonly slug?: string;
  readonly term?: string;
  readonly subject: MathGlossarySubject;
  readonly courseId?: string;
  readonly courseName?: string;
  readonly patterns: readonly string[];
  readonly symbol: string;
  readonly formula?: string;
  readonly nameVi: string;
  readonly name?: string;
  readonly nameEn: string;
  readonly englishName?: string;
  readonly brief: string;
  readonly summary?: string;
  readonly intuition: string;
  readonly relatedLesson: string;
  readonly lessonUrl?: string;
}

export const MATH_GLOSSARY: readonly MathGlossaryEntry[] = rawGlossary as MathGlossaryEntry[];

const GLOSSARY_MAP = new Map<string, MathGlossaryEntry>(
  MATH_GLOSSARY.map((entry) => [entry.id, entry]),
);

export function getAllGlossaryEntries(): readonly MathGlossaryEntry[] {
  return MATH_GLOSSARY;
}

/**
 * Trích xuất mã môn học từ đường dẫn URL (pathname).
 */
export function detectCourseIdFromPath(pathname?: string): string | undefined {
  if (!pathname) return undefined;
  if (pathname.includes('giai-tich-ham-mot-bien') || pathname.includes('gthmb')) {
    return 'giai-tich-ham-mot-bien';
  }
  if (pathname.includes('cau-truc-dai-so') || pathname.includes('ctds')) {
    return 'cau-truc-dai-so';
  }
  if (pathname.includes('hinh-hoc-affine') || pathname.includes('hha')) {
    return 'hinh-hoc-affine';
  }
  const match = pathname.match(/\/mon-hoc\/([^/]+)/);
  if (match) {
    return match[1];
  }
  return undefined;
}

/**
 * Lấy một mục thuật ngữ theo ID, hỗ trợ đối chiếu theo ngữ cảnh môn học hiện tại.
 */
export function getGlossaryEntryById(
  id: string,
  currentCourseId?: string,
): MathGlossaryEntry | undefined {
  if (id === 'dinh-ly-lagrange') {
    return currentCourseId === 'giai-tich-ham-mot-bien'
      ? GLOSSARY_MAP.get('gthmb-dinh-ly-lagrange')
      : GLOSSARY_MAP.get('ctds-dinh-ly-lagrange');
  }
  if (id === 'dinh-ly-fermat') {
    return currentCourseId === 'giai-tich-ham-mot-bien'
      ? GLOSSARY_MAP.get('gthmb-dinh-ly-fermat')
      : GLOSSARY_MAP.get('ctds-dinh-ly-fermat');
  }
  if (id === 'dinh-ly-cauchy') {
    return currentCourseId === 'giai-tich-ham-mot-bien'
      ? GLOSSARY_MAP.get('gthmb-dinh-ly-cauchy')
      : GLOSSARY_MAP.get('ctds-dinh-ly-cauchy');
  }
  return GLOSSARY_MAP.get(id);
}

/**
 * Tìm kiếm mục thuật ngữ khớp chính xác nhất với từ khóa/ký hiệu, ưu tiên môn học hiện tại (currentCourseId).
 */
export function findGlossaryEntry(
  termOrPatternOrId: string,
  currentCourseId?: string,
): MathGlossaryEntry | undefined {
  if (!termOrPatternOrId) return undefined;
  const clean = termOrPatternOrId.trim();
  const normalized = normalizeSearchQuery(clean);

  // 1. Khớp trực tiếp theo ID (có ưu tiên môn nếu là ID tương đương)
  const byId = getGlossaryEntryById(clean, currentCourseId);
  if (byId) return byId;

  // 2. Thu thập các ứng viên khớp theo term, slug, nameVi, name hoặc patterns
  const candidates: MathGlossaryEntry[] = [];
  for (const entry of MATH_GLOSSARY) {
    if (entry.id === clean || (entry.slug && entry.slug === clean)) {
      candidates.push(entry);
      continue;
    }
    if (entry.term && normalizeSearchQuery(entry.term) === normalized) {
      candidates.push(entry);
      continue;
    }
    if (
      normalizeSearchQuery(entry.nameVi) === normalized ||
      (entry.name && normalizeSearchQuery(entry.name) === normalized)
    ) {
      candidates.push(entry);
      continue;
    }
    if (
      entry.patterns.some(
        (p) => normalizeSearchQuery(p) === normalized || p.toLowerCase() === clean.toLowerCase(),
      )
    ) {
      candidates.push(entry);
      continue;
    }
  }

  // Khớp bán phần nếu chưa tìm thấy
  if (candidates.length === 0) {
    for (const entry of MATH_GLOSSARY) {
      if (
        entry.patterns.some(
          (p) =>
            normalizeSearchQuery(p).includes(normalized) ||
            normalized.includes(normalizeSearchQuery(p)),
        )
      ) {
        candidates.push(entry);
      }
    }
  }

  if (candidates.length === 0) return undefined;

  // Ưu tiên bản ghi khớp đúng môn học hiện tại
  if (currentCourseId) {
    const matchedCourse = candidates.find(
      (c) => c.subject === currentCourseId || c.courseId === currentCourseId,
    );
    if (matchedCourse) return matchedCourse;
  }

  return candidates[0];
}

export interface SearchGlossaryOptions {
  readonly subject?: MathGlossarySubject | 'all';
  readonly courseId?: string;
  readonly query?: string;
}

/**
 * Tìm kiếm thuật ngữ theo từ khóa tiếng Việt không dấu, ký hiệu TeX hoặc tên tiếng Anh.
 */
export function searchGlossary({
  subject = 'all',
  courseId,
  query = '',
}: SearchGlossaryOptions = {}): readonly MathGlossaryEntry[] {
  const targetSubject = courseId || subject;
  const normalizedQuery = normalizeSearchQuery(query);

  return MATH_GLOSSARY.filter((entry) => {
    if (
      targetSubject !== 'all' &&
      entry.subject !== targetSubject &&
      entry.courseId !== targetSubject
    ) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    // Kiểm tra term và tên tiếng Việt
    if (entry.term && normalizeSearchQuery(entry.term).includes(normalizedQuery)) {
      return true;
    }

    const nameViNorm = normalizeSearchQuery(entry.nameVi);
    if (nameViNorm.includes(normalizedQuery)) {
      return true;
    }
    if (entry.name && normalizeSearchQuery(entry.name).includes(normalizedQuery)) {
      return true;
    }

    // Kiểm tra tên tiếng Anh
    const nameEnNorm = normalizeSearchQuery(entry.nameEn);
    if (nameEnNorm.includes(normalizedQuery)) {
      return true;
    }
    if (entry.englishName && normalizeSearchQuery(entry.englishName).includes(normalizedQuery)) {
      return true;
    }

    // Kiểm tra ký hiệu và patterns
    const symbolNorm = entry.symbol.toLowerCase();
    if (symbolNorm.includes(normalizedQuery.toLowerCase())) {
      return true;
    }
    if (entry.formula && entry.formula.toLowerCase().includes(normalizedQuery.toLowerCase())) {
      return true;
    }

    const matchPattern = entry.patterns.some((pattern) => {
      const pNorm = normalizeSearchQuery(pattern);
      return pNorm.includes(normalizedQuery) || pattern.toLowerCase().includes(normalizedQuery);
    });
    if (matchPattern) {
      return true;
    }

    // Kiểm tra trong định nghĩa và trực quan
    const briefNorm = normalizeSearchQuery(entry.brief);
    if (briefNorm.includes(normalizedQuery)) {
      return true;
    }
    if (entry.summary && normalizeSearchQuery(entry.summary).includes(normalizedQuery)) {
      return true;
    }

    const intuitionNorm = normalizeSearchQuery(entry.intuition);
    if (intuitionNorm.includes(normalizedQuery)) {
      return true;
    }

    return false;
  });
}
