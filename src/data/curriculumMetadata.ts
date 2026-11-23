import type { ChapterCloItem, ChapterDifficultyLevel } from '@/components/lesson';

export interface SubjectCurriculumMetadata {
  readonly canonicalSlug: string;
  readonly aliases: readonly string[];
  readonly curriculumSource: string;
  readonly defaultDifficulty?: ChapterDifficultyLevel;
  readonly cloFallbackDescription: string;
  readonly defaultClos: readonly ChapterCloItem[];
}

export const SUBJECT_CURRICULUM_METADATA: readonly SubjectCurriculumMetadata[] = [
  {
    canonicalSlug: 'giao-duc-hoc',
    aliases: ['giao-duc-hoc', 'pedagogy'],
    curriculumSource: 'Giáo trình Giáo dục học — Trường ĐH Sư phạm TP.HCM (HCMUE, K50–51)',
    defaultDifficulty: 'Nghiệp vụ thực hành',
    cloFallbackDescription:
      'Phân tích cơ sở lý luận và nghiệp vụ sư phạm giải quyết tình huống thực tế',
    defaultClos: [
      {
        code: 'CLO 1.1',
        description:
          'Phân tích bản chất hiện tượng giáo dục và chuẩn nghề nghiệp giáo viên THCS/THPT',
      },
      {
        code: 'CLO 6.2',
        description: 'Vận dụng 5 bước xử lý sư phạm và khung pháp quy giáo dục giải quyết xung đột',
      },
    ],
  },
  {
    canonicalSlug: 'giai-tich-ham-mot-bien',
    aliases: ['giai-tich-ham-mot-bien', 'single-variable-calculus'],
    curriculumSource: 'Giáo trình Giải tích hàm một biến — PGS.TS. Trần Trí Dũng (NXB Giáo dục)',
    cloFallbackDescription:
      'Chứng minh giới hạn và phân tích tính chất giải tích bằng ngôn ngữ Epsilon',
    defaultClos: [
      {
        code: 'CLO 1.2',
        description:
          'Kỹ thuật định lượng và chứng minh giới hạn dãy số bằng ngôn ngữ ε–N (Epsilon)',
      },
      {
        code: 'CLO 2.1',
        description:
          'Vận dụng tiêu chuẩn hội tụ Cauchy, Weierstrass và tính liên tục phân tích hàm số',
      },
    ],
  },
  {
    canonicalSlug: 'hinh-hoc-affine',
    aliases: ['hinh-hoc-affine', 'affine-geometry'],
    curriculumSource:
      'Giáo trình Hình học cao cấp — GS. Nguyễn Mộng Hy / TS. Huỳnh Việt Khánh (NXB Giáo dục)',
    cloFallbackDescription: 'Khảo sát cấu trúc hình học afin, phương trình m-phẳng và ánh xạ afin',
    defaultClos: [
      {
        code: 'CLO 2.1',
        description:
          'Xác định mục tiêu afin, phương và hệ phương trình tham số của m-phẳng trong không gian Afin',
      },
      {
        code: 'CLO 3.2',
        description:
          'Vận dụng nhóm các phép biến đổi afin và tính chất bất biến trong nghiên cứu hình học',
      },
    ],
  },
  {
    canonicalSlug: 'cau-truc-dai-so',
    aliases: ['cau-truc-dai-so', 'algebraic-structures'],
    curriculumSource:
      'Giáo trình Cấu trúc Đại số: Nhóm • Vành • Trường — TS. Huỳnh Việt Khánh (NXB Giáo dục)',
    cloFallbackDescription: 'Phân tích cấu trúc đại số và chứng minh các mệnh đề học thuật',
    defaultClos: [
      {
        code: 'CLO 1.1',
        description:
          'Nắm vững hệ thống tiên đề cấu trúc đại số: Nhóm, Vành, Trường và các định lý đẳng cấu',
      },
    ],
  },
];

const DEFAULT_CURRICULUM_SOURCE = 'Giáo trình chuẩn Đại học Sư phạm';
const DEFAULT_CLO_FALLBACK_DESC = 'Phân tích cấu trúc đại số và chứng minh các mệnh đề học thuật';
const DEFAULT_CLOS: readonly ChapterCloItem[] = [
  {
    code: 'CLO 1.1',
    description:
      'Nắm vững hệ thống tiên đề cấu trúc đại số: Nhóm, Vành, Trường và các định lý đẳng cấu',
  },
];

function findSubjectCurriculum(slug: string): SubjectCurriculumMetadata | undefined {
  return SUBJECT_CURRICULUM_METADATA.find((item) => item.aliases.includes(slug));
}

export function getCurriculumSource(slug: string): string {
  return findSubjectCurriculum(slug)?.curriculumSource ?? DEFAULT_CURRICULUM_SOURCE;
}

export function getDifficultyLevel(
  level: 'basic' | 'intermediate' | 'advanced',
  slug: string,
): ChapterDifficultyLevel {
  const subjectDefault = findSubjectCurriculum(slug)?.defaultDifficulty;
  if (subjectDefault) return subjectDefault;
  if (level === 'basic') return 'Nền tảng';
  if (level === 'advanced') return 'Chuyên sâu';
  return 'Trung cấp';
}

export function getCloFallbackDescription(slug: string): string {
  return findSubjectCurriculum(slug)?.cloFallbackDescription ?? DEFAULT_CLO_FALLBACK_DESC;
}

export function getLessonClos(tags: readonly string[], slug: string): readonly ChapterCloItem[] {
  const cloTags = tags.filter((t) => /^CLO/i.test(t));
  if (cloTags.length > 0) {
    return cloTags.map((tag) => {
      const match = tag.match(/^CLO-?(\d+(?:\.\d+)?)(?:\s*[:-]\s*(.*))?$/i);
      const code = match ? `CLO ${match[1]}` : tag;
      const desc = match?.[2] || getCloFallbackDescription(slug);
      return { code, description: desc };
    });
  }

  return findSubjectCurriculum(slug)?.defaultClos ?? DEFAULT_CLOS;
}
