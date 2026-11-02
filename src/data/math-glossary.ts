import { normalizeSearchQuery } from '@/utils/vietnamese-text';
import rawGlossary from './math-glossary.json';

export type MathGlossarySubject = 'cau-truc-dai-so' | 'hinh-hoc-affine';

export interface MathGlossaryEntry {
  readonly id: string;
  readonly subject: MathGlossarySubject;
  readonly patterns: readonly string[];
  readonly symbol: string;
  readonly nameVi: string;
  readonly nameEn: string;
  readonly brief: string;
  readonly intuition: string;
  readonly relatedLesson: string;
}

export const MATH_GLOSSARY: readonly MathGlossaryEntry[] = rawGlossary as MathGlossaryEntry[];

const GLOSSARY_MAP = new Map<string, MathGlossaryEntry>(
  MATH_GLOSSARY.map((entry) => [entry.id, entry]),
);

export function getAllGlossaryEntries(): readonly MathGlossaryEntry[] {
  return MATH_GLOSSARY;
}

export function getGlossaryEntryById(id: string): MathGlossaryEntry | undefined {
  return GLOSSARY_MAP.get(id);
}

export interface SearchGlossaryOptions {
  readonly subject?: MathGlossarySubject | 'all';
  readonly query?: string;
}

/**
 * Tìm kiếm thuật ngữ theo từ khóa tiếng Việt không dấu, ký hiệu TeX hoặc tên tiếng Anh.
 */
export function searchGlossary({
  subject = 'all',
  query = '',
}: SearchGlossaryOptions = {}): readonly MathGlossaryEntry[] {
  const normalizedQuery = normalizeSearchQuery(query);

  return MATH_GLOSSARY.filter((entry) => {
    if (subject !== 'all' && entry.subject !== subject) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    // Kiểm tra tên tiếng Việt
    const nameViNorm = normalizeSearchQuery(entry.nameVi);
    if (nameViNorm.includes(normalizedQuery)) {
      return true;
    }

    // Kiểm tra tên tiếng Anh
    const nameEnNorm = normalizeSearchQuery(entry.nameEn);
    if (nameEnNorm.includes(normalizedQuery)) {
      return true;
    }

    // Kiểm tra ký hiệu và patterns
    const symbolNorm = entry.symbol.toLowerCase();
    if (symbolNorm.includes(normalizedQuery.toLowerCase())) {
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

    const intuitionNorm = normalizeSearchQuery(entry.intuition);
    if (intuitionNorm.includes(normalizedQuery)) {
      return true;
    }

    return false;
  });
}
