import { MATH1301_EXAM_BANK } from './cau-truc-dai-so/exam-bank';
import type { CourseExamBank } from './exam-bank-types';
import { MATH1302_EXAM_BANK } from './hinh-hoc-affine/exam-bank';

export const COURSE_EXAM_BANKS: Readonly<Record<string, CourseExamBank>> = {
  'cau-truc-dai-so': MATH1301_EXAM_BANK,
  'algebraic-structures': MATH1301_EXAM_BANK,
  'hinh-hoc-affine': MATH1302_EXAM_BANK,
  'affine-geometry': MATH1302_EXAM_BANK,
};

export function getCourseExamBank(subjectSlug?: string | null): CourseExamBank | undefined {
  if (!subjectSlug) return undefined;
  return COURSE_EXAM_BANKS[subjectSlug];
}
