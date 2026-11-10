import { normalizeSearchQuery } from '@/utils/vietnamese-text';
import rawGlossary from './math-glossary.json';

export type MathGlossarySubject =
  'cau-truc-dai-so' | 'hinh-hoc-affine' | 'giai-tich-ham-mot-bien' | 'giao-duc-hoc';

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

export const GDH_GLOSSARY_ENTRIES: readonly MathGlossaryEntry[] = [
  {
    id: 'gdh-ban-chat-xa-hoi',
    slug: 'ban-chat-xa-hoi',
    term: 'Bản chất xã hội',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['ban chat xa hoi', 'bản chất xã hội', 'social essence', 'xa hoi hoa'],
    symbol: '\\text{Social}',
    formula: '\\text{Edu} \\subset \\text{Society}',
    nameVi: 'Bản chất xã hội của giáo dục',
    name: 'Bản chất xã hội',
    nameEn: 'Social Nature of Education',
    englishName: 'Social Essence of Education',
    brief:
      'Bản chất cốt tử khẳng định giáo dục chỉ nảy sinh, tồn tại và phát triển trong đời sống xã hội loài người. Giáo dục phản ánh nhu cầu truyền thụ kinh nghiệm lịch sử - xã hội.',
    summary:
      'Giáo dục chỉ nảy sinh, tồn tại và phát triển trong xã hội loài người nhằm đáp ứng nhu cầu duy trì và phát triển phương thức sản xuất.',
    intuition:
      'Không có cá nhân nào trưởng thành người ngoài môi trường xã hội; giáo dục là phương thức tái sinh văn hóa và kinh nghiệm lịch sử của nhân loại.',
    relatedLesson: '/mon-hoc/giao-duc-hoc',
    lessonUrl: '/mon-hoc/giao-duc-hoc',
  },
  {
    id: 'gdh-chuc-nang-kinh-te-san-xuat',
    slug: 'chuc-nang-kinh-te-san-xuat',
    term: 'Chức năng kinh tế - sản xuất',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: [
      'chuc nang kinh te san xuat',
      'kinh te san xuat',
      'chức năng kinh tế',
      'economic function',
    ],
    symbol: '\\text{Econ}',
    formula: '\\text{Education} \\to \\text{Human Capital}',
    nameVi: 'Chức năng kinh tế - sản xuất',
    name: 'Chức năng kinh tế - sản xuất',
    nameEn: 'Economic-Productive Function',
    englishName: 'Economic and Productive Function',
    brief:
      'Chức năng tái sản xuất sức lao động xã hội và nâng cao năng suất của người học. Giáo dục đào tạo nguồn nhân lực và biến tri thức thành lực lượng sản xuất trực tiếp.',
    summary:
      'Giáo dục cung ứng nguồn nhân lực chất lượng cao, thúc đẩy chuyển giao công nghệ và tăng năng suất lao động xã hội.',
    intuition:
      'Đầu tư cho giáo dục là đầu tư sinh lợi xã hội cao nhất; đào tạo người học năng lực giải quyết vấn đề thực tiễn của nền kinh tế.',
    relatedLesson: '/mon-hoc/giao-duc-hoc',
    lessonUrl: '/mon-hoc/giao-duc-hoc',
  },
  {
    id: 'gdh-chuan-nghe-nghiep-gvpt',
    slug: 'chuan-nghe-nghiep-gvpt',
    term: 'Chuẩn nghề nghiệp giáo viên',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: [
      'chuan nghe nghiep',
      'chuẩn nghề nghiệp giáo viên',
      'thong tu 20',
      'professional standards',
    ],
    symbol: '\\text{TT20}',
    formula: '5\\,\\text{TC} \\times 15\\,\\text{TChi}',
    nameVi: 'Chuẩn nghề nghiệp giáo viên phổ thông',
    name: 'Chuẩn nghề nghiệp GVPT',
    nameEn: 'Teacher Professional Standards',
    englishName: 'Professional Standards for General Education Teachers',
    brief:
      'Hệ thống phẩm chất và năng lực nghề nghiệp mà giáo viên phổ thông cần đạt được theo Thông tư số 20/2018/TT-BGDĐT.',
    summary:
      'Gồm 5 tiêu chuẩn: Phẩm chất nhà giáo, Phát triển chuyên môn/nghiệp vụ, Xây dựng môi trường giáo dục, Phát triển mối quan hệ nhà trường - gia đình - xã hội, Sử dụng ngoại ngữ và công nghệ.',
    intuition:
      'Hệ quy chiếu giúp nhà giáo tự soi, tự rèn và hoạch định lộ trình phát triển năng lực sư phạm suốt đời.',
    relatedLesson: '/mon-hoc/giao-duc-hoc',
    lessonUrl: '/mon-hoc/giao-duc-hoc',
  },
  {
    id: 'gdh-xung-dot-su-pham',
    slug: 'xung-dot-su-pham',
    term: 'Xung đột sư phạm',
    subject: 'giao-duc-hoc',
    courseId: 'giao-duc-hoc',
    courseName: 'Giáo dục học',
    patterns: ['xung dot su pham', 'tinh huong su pham', 'an le su pham', 'pedagogical conflict'],
    symbol: '\\Delta_{\\text{SP}}',
    formula: '\\text{Issue} \\xrightarrow{\\text{5 steps}} \\text{Resolution}',
    nameVi: 'Xung đột sư phạm & Án lệ thực hành',
    name: 'Xung đột sư phạm',
    nameEn: 'Pedagogical Conflict',
    englishName: 'Pedagogical Conflict and Resolution',
    brief:
      'Mâu thuẫn hoặc tình huống căng thẳng nảy sinh trong giao tiếp sư phạm giữa thầy - trò hoặc giữa các học sinh trong tập thể.',
    summary:
      'Xử lý qua 5 bước chuẩn hóa: Kiềm chế cảm xúc, Thu thập thông tin khách quan, Phân tích động cơ, Đưa ra giải pháp mang tính giáo dục, Theo dõi và đánh giá tác động.',
    intuition:
      'Biến xung đột thành cơ hội vàng giáo dục phẩm chất và kỹ năng sống cho học sinh bằng tình thương và sự tôn trọng nhân cách.',
    relatedLesson: '/mon-hoc/giao-duc-hoc',
    lessonUrl: '/mon-hoc/giao-duc-hoc',
  },
];

export const MATH_GLOSSARY: readonly MathGlossaryEntry[] = [
  ...(rawGlossary as MathGlossaryEntry[]),
  ...GDH_GLOSSARY_ENTRIES,
];

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
  if (pathname.includes('giao-duc-hoc') || pathname.includes('gdh')) {
    return 'giao-duc-hoc';
  }
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
  if (id === 'ban-chat-xa-hoi') {
    return GLOSSARY_MAP.get('gdh-ban-chat-xa-hoi') || GLOSSARY_MAP.get('ban-chat-xa-hoi');
  }
  if (id === 'chuc-nang-kinh-te-san-xuat') {
    return (
      GLOSSARY_MAP.get('gdh-chuc-nang-kinh-te-san-xuat') ||
      GLOSSARY_MAP.get('chuc-nang-kinh-te-san-xuat')
    );
  }
  if (id === 'chuan-nghe-nghiep-gvpt') {
    return GLOSSARY_MAP.get('gdh-chuan-nghe-nghiep-gvpt');
  }
  if (id === 'xung-dot-su-pham') {
    return GLOSSARY_MAP.get('gdh-xung-dot-su-pham');
  }
  if (id === 'nhom-con-chuan-tac') {
    return GLOSSARY_MAP.get('ctds-nhom-con-chuan-tac') || GLOSSARY_MAP.get('nhom-con-chuan-tac');
  }
  if (id === 'dinh-ly-dang-cau-1' || id === 'dang-cau-1') {
    return GLOSSARY_MAP.get('ctds-dinh-ly-dang-cau-1');
  }
  if (id === 'tieu-chuan-eisenstein') {
    return GLOSSARY_MAP.get('ctds-tieu-chuan-eisenstein');
  }
  if (id === 'dinh-ly-euler') {
    return GLOSSARY_MAP.get('ctds-dinh-ly-euler');
  }
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
