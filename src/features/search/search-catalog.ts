import { searchIndex } from 'virtual:search-index';
import type { KnowledgeFilterKey } from '@schemas/search';
import { getSubjects } from '@/content-runtime/manifest';
import { MATH1301_EXAM_BANK } from '@/data/courses/cau-truc-dai-so/exam-bank';
import type { CourseExamBank, ExamPaper, ExamProblem } from '@/data/courses/exam-bank-types';
import { GTHMB_EXAM_PAPERS } from '@/data/courses/giai-tich-ham-mot-bien/exams';
import { PEDAGOGICAL_CASE_STUDIES } from '@/data/courses/giao-duc-hoc/course';
import { MATH1302_EXAM_BANK } from '@/data/courses/hinh-hoc-affine/exam-bank';
import { getAllGlossaryEntries } from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { scoreTextMatch } from '@/utils/vietnamese-text';

export type CommandCategoryKey = 'theorems' | 'lessons' | 'courses' | 'glossary' | 'reviews';

export type KnowledgeBadgeKind = Exclude<KnowledgeFilterKey, 'all'>;

export interface CommandResultItem {
  readonly id: string;
  readonly category: CommandCategoryKey;
  readonly knowledgeKind?: KnowledgeBadgeKind;
  readonly badgeLabel?: string;
  readonly title: string;
  readonly formula?: string;
  readonly subtitle: string;
  readonly snippetText?: string;
  readonly breadcrumb?: string;
  readonly badge?: string;
  readonly href: string;
  readonly keywords: string;
  readonly priorityBoost?: number;
}

interface CuratedTheoremItem {
  readonly id: string;
  readonly title: string;
  readonly formula?: string;
  readonly courseTitle: string;
  readonly summary: string;
  readonly href: string;
  readonly keywords: string;
}

const CURATED_THEOREMS: readonly CuratedTheoremItem[] = [
  {
    id: 'thm-lagrange-group',
    title: 'Định lý Lagrange (Lý thuyết Nhóm)',
    formula: '|G| = [G : H] \\cdot |H|',
    courseTitle: 'Cấu trúc đại số',
    summary:
      'Cấp của mọi nhóm con H và cấp của mọi phần tử đều là ước số của cấp nhóm hữu hạn |G|.',
    href: '/mon-hoc/cau-truc-dai-so/lop-ke-va-dinh-ly-lagrange/dinh-ly-lagrange-va-ung-dung-so-hoc',
    keywords: 'dinh ly lagrange nhom con chi so lop ke uoc so cap nhom |G| = [G:H]|H|',
  },
  {
    id: 'thm-first-isomorphism',
    title: 'Định lý Đồng cấu thứ nhất (Đẳng cấu nhóm thương)',
    formula: 'G / \\ker \\varphi \\cong \\operatorname{Im} \\varphi',
    courseTitle: 'Cấu trúc đại số',
    summary:
      'Hạt nhân ker φ là nhóm con chuẩn tắc của G và nhóm thương G/ker φ đẳng cấu tự nhiên với ảnh Im φ.',
    href: '/mon-hoc/cau-truc-dai-so/dong-cau-nhom-va-dang-cau/phan-tich-qua-nhom-thuong-va-dinh-ly-dang-cau-thu-nhat',
    keywords:
      'dinh ly dong cau thu nhat dinh ly dang cau thu nhat first isomorphism theorem ker im nhom thuong',
  },
  {
    id: 'thm-euclid-axiom',
    title: 'Tiên đề Euclid & Không gian Euclide',
    formula: '\\langle \\vec{u}, \\vec{v} \\rangle = \\sum_{i=1}^{n} u_i v_i',
    courseTitle: 'Hình học Affine & Euclide',
    summary:
      'Cấu trúc không gian Affine thực trang bị tích vô hướng xác định dương, định hình khoảng cách và góc.',
    href: '/mon-hoc/hinh-hoc-affine/khong-gian-euclide/khong-gian-euclide',
    keywords: 'tien de euclid khong gian euclide oclit tich vo huong song song khoang cach goc',
  },
  {
    id: 'thm-weyl-chasles',
    title: 'Hệ thức Chasles & Tiên đề Weyl (Không gian Affine)',
    formula: '\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}',
    courseTitle: 'Hình học Affine & Euclide',
    summary:
      'Hai tiên đề nền tảng liên kết tập điểm Affine với không gian vectơ nền thông qua ánh xạ hiệu điểm.',
    href: '/mon-hoc/hinh-hoc-affine/khong-gian-affine/khong-gian-affine',
    keywords: 'he thuc chasles quy tac chasles tien de weyl khong gian affine vecto',
  },
  {
    id: 'thm-lagrange-mvt',
    title: 'Định lý Giá trị Trung bình Lagrange (Giải tích)',
    formula: "f(b) - f(a) = f'(c)(b - a)",
    courseTitle: 'Giải tích hàm một biến',
    summary:
      'Tồn tại điểm c ∈ (a, b) mà tại đó tiếp tuyến song song với dây cung nối hai đầu mút đồ thị.',
    href: '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/cac-dinh-ly-gia-tri-trung-binh',
    keywords: 'dinh ly lagrange gia tri trung binh dao ham tiep tuyen mvt giai tich',
  },
  {
    id: 'thm-cauchy-mvt',
    title: 'Định lý Giá trị Trung bình Cauchy',
    formula: "\\frac{f(b) - f(a)}{g(b) - g(a)} = \\frac{f'(c)}{g'(c)}",
    courseTitle: 'Giải tích hàm một biến',
    summary:
      'Mở rộng định lý Lagrange cho hai hàm khả vi, làm nền tảng chứng minh quy tắc L’Hôpital.',
    href: '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/cac-dinh-ly-gia-tri-trung-binh',
    keywords: 'dinh ly cauchy gia tri trung binh dao ham lhopital',
  },
  {
    id: 'thm-fermat-stationary',
    title: 'Định lý Fermat về Điểm dừng Cực trị',
    formula: "f'(x_0) = 0",
    courseTitle: 'Giải tích hàm một biến',
    summary: 'Nếu hàm số đạt cực trị địa phương tại x₀ và khả vi tại đó thì đạo hàm triệt tiêu.',
    href: '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/cac-dinh-ly-gia-tri-trung-binh',
    keywords: 'dinh ly fermat diem dung cuc tri dao ham bang 0',
  },
  {
    id: 'thm-fermat-little',
    title: 'Định lý nhỏ Fermat & Định lý Euler',
    formula: 'a^{p-1} \\equiv 1 \\pmod p',
    courseTitle: 'Cấu trúc đại số',
    summary:
      'Hệ quả số học trực tiếp từ Định lý Lagrange áp dụng cho nhóm nhân các lớp thặng dư khả nghịch.',
    href: '/mon-hoc/cau-truc-dai-so/lop-ke-va-dinh-ly-lagrange/dinh-ly-lagrange-va-ung-dung-so-hoc',
    keywords: 'dinh ly nho fermat dinh ly euler phi ham euler dong du modulo',
  },
  {
    id: 'thm-cauchy-group',
    title: 'Định lý Cauchy cho Nhóm hữu hạn',
    formula: 'p \\mid |G| \\implies \\exists g \\in G : \\operatorname{ord}(g) = p',
    courseTitle: 'Cấu trúc đại số',
    summary:
      'Nếu số nguyên tố p chia hết cấp nhóm |G| thì luôn tồn tại phần tử có cấp đúng bằng p.',
    href: '/mon-hoc/cau-truc-dai-so/lop-ke-va-dinh-ly-lagrange/chieu-nguoc-cua-dinh-ly-lagrange-va-nhom-thay-phien-a4',
    keywords: 'dinh ly cauchy nhom huu han uoc nguyen to cap phan tu',
  },
  {
    id: 'thm-eisenstein',
    title: 'Tiêu chuẩn Bất khả quy Eisenstein',
    formula: 'p \\mid a_i \\; (i < n), \\; p \\nmid a_n, \\; p^2 \\nmid a_0',
    courseTitle: 'Cấu trúc đại số',
    summary: 'Điều kiện đủ để một đa thức hệ số nguyên bất khả quy trên trường số hữu tỉ Q.',
    href: '/mon-hoc/cau-truc-dai-so/truong-con-truong-cac-thuong/bai-tap-chuong-9-va-tong-ket-hoc-phan',
    keywords: 'tieu chuan eisenstein da thuc bat kha quy truong so huu ti',
  },
  {
    id: 'thm-taylor-lagrange',
    title: 'Khai triển Taylor & Phần dư Lagrange',
    formula: 'R_n(x) = \\frac{f^{(n+1)}(c)}{(n+1)!}(x - x_0)^{n+1}',
    courseTitle: 'Giải tích hàm một biến',
    summary:
      'Biểu diễn xấp xỉ hàm khả vi bằng đa thức bậc cao và đánh giá sai số qua đạo hàm cấp n+1.',
    href: '/mon-hoc/giai-tich-ham-mot-bien/phep-tinh-vi-phan/quy-tac-lhopital-va-khai-trien-taylor-maclaurin',
    keywords: 'khai trien taylor maclaurin phan du lagrange xap xi da thuc',
  },
  {
    id: 'thm-normal-subgroup',
    title: 'Tiêu chuẩn Nhóm con Chuẩn tắc',
    formula: 'H \\trianglelefteq G \\iff \\forall g \\in G, \\; gHg^{-1} = H',
    courseTitle: 'Cấu trúc đại số',
    summary:
      'Điều kiện cần và đủ để tập các lớp kề G/H lập thành nhóm thương với phép nhân đại diện.',
    href: '/mon-hoc/cau-truc-dai-so/nhom-con-chuan-tac-nhom-thuong/phep-lien-hop-va-tieu-chuan-chuan-tac',
    keywords: 'nhom con chuan tac phep lien hop nhom thuong gHg^-1 = H',
  },
  {
    id: 'thm-barycenter',
    title: 'Định lý Tâm tỉ cự & Công thức Vector',
    formula: '\\sum_{i=1}^{k} \\lambda_i \\overrightarrow{GA_i} = \\vec{0}',
    courseTitle: 'Hình học Affine & Euclide',
    summary: 'Xác định điểm cân bằng duy nhất G của hệ điểm gắn trọng số khi tổng trọng số khác 0.',
    href: '/mon-hoc/hinh-hoc-affine/khong-gian-affine/tam-ti-cu-cua-mot-he-diem',
    keywords: 'tam ti cu tam ty cu trong tam barycenter he diem affine',
  },
  {
    id: 'thm-projective-duality',
    title: 'Nguyên tắc Đối ngẫu Xạ ảnh',
    formula:
      '\\text{Điểm } \\mathbb{P}^n \\longleftrightarrow \\text{Siêu phẳng } (\\mathbb{P}^n)^*',
    courseTitle: 'Hình học Affine & Euclide',
    summary:
      'Mọi định lý về quan hệ liên thuộc giữa điểm và siêu phẳng trong không gian xạ ảnh đều có định lý đối ngẫu tương ứng.',
    href: '/mon-hoc/hinh-hoc-affine/khong-gian-xa-anh/nguyen-tac-doi-ngau-trong-khong-gian-xa-anh',
    keywords: 'nguyen tac doi ngau xa anh diem sieu phang tỉ số kép',
  },
];

const SUBJECT_LABELS: Readonly<Record<string, string>> = {
  'cau-truc-dai-so': 'Cấu trúc đại số',
  'hinh-hoc-affine': 'Hình học Affine & Euclide',
  'giai-tich-ham-mot-bien': 'Giải tích hàm một biến',
  'giao-duc-hoc': 'Giáo dục học',
};

const BLOCK_BADGE_LABELS: Readonly<Record<KnowledgeBadgeKind, string>> = {
  def: 'ĐỊNH NGHĨA',
  thm: 'ĐỊNH LÝ',
  ex: 'VÍ DỤ',
  review: 'ÔN TẬP',
};

function summarizeExamProblem(problem: ExamProblem): {
  readonly statementText: string;
  readonly solutionText: string;
} {
  const partStatements = (problem.parts ?? []).map((part) => `${part.label}) ${part.statement}`);
  const partSolutions = (problem.parts ?? []).map((part) => part.solution ?? '').filter(Boolean);

  const statementText = [problem.statement ?? '', ...partStatements]
    .filter(Boolean)
    .join(' · ')
    .replace(/\$\$?/g, '$')
    .replace(/\s+/g, ' ')
    .trim();

  const solutionText = [problem.solution ?? '', problem.hint ?? '', ...partSolutions]
    .filter(Boolean)
    .join(' · ')
    .replace(/\s+/g, ' ')
    .trim();

  return { statementText, solutionText };
}

function appendExamPaperProblems(
  items: CommandResultItem[],
  subjectSlug: string,
  subjectTitle: string,
  paper: ExamPaper,
  paperKindLabel: string,
): void {
  const baseExamsRoute = ROUTES.subjectExams(subjectSlug);

  for (const problem of paper.problems) {
    const { statementText, solutionText } = summarizeExamProblem(problem);
    const problemHeading =
      problem.sheetHeading ?? `${paper.questionPrefix ?? 'Bài'} ${problem.number}`;
    const displayTitle = problem.title
      ? `${problemHeading} — ${problem.title}`
      : `${problemHeading} (${paper.year} · ${paper.semester})`;

    items.push({
      id: `review-exam-${paper.id}-${problem.id}`,
      category: 'reviews',
      knowledgeKind: 'review',
      badgeLabel: BLOCK_BADGE_LABELS.review,
      title: displayTitle,
      subtitle: `${paper.title} · ${statementText.slice(0, 140)}`,
      snippetText: statementText || paper.description,
      breadcrumb: `${subjectTitle} · Ôn tập · ${paperKindLabel} (${paper.year})`,
      badge: `${problem.points.toFixed(1)} điểm`,
      href: `${baseExamsRoute}?exam=${encodeURIComponent(paper.id)}#${problem.id}`,
      keywords: [
        displayTitle,
        paper.title,
        paper.year,
        paper.semester,
        problem.hint ?? '',
        problem.solutionRubric ?? '',
        statementText,
        solutionText,
      ]
        .filter(Boolean)
        .join(' '),
    });
  }
}

function appendCourseExamBank(items: CommandResultItem[], bank: CourseExamBank): void {
  const subjectTitle = SUBJECT_LABELS[bank.subjectSlug] ?? bank.courseTitle;

  for (const paper of bank.officialExams) {
    appendExamPaperProblems(items, bank.subjectSlug, subjectTitle, paper, 'Đề chính thức');
  }
  for (const paper of bank.mockExams) {
    appendExamPaperProblems(items, bank.subjectSlug, subjectTitle, paper, 'Đề ôn tập mẫu');
  }

  for (const group of bank.matrixAnalysis.focusChecklists) {
    for (const checkItem of group.items) {
      const formulasText = (checkItem.keyFormulas ?? []).join(' ');
      items.push({
        id: `review-checklist-${bank.subjectSlug}-${checkItem.id}`,
        category: 'reviews',
        knowledgeKind: 'review',
        badgeLabel: BLOCK_BADGE_LABELS.review,
        title: checkItem.title,
        formula: checkItem.keyFormulas?.[0],
        subtitle: `${group.title} · ${checkItem.summary}`,
        snippetText: checkItem.summary,
        breadcrumb: `${subjectTitle} · Ôn tập · ${group.title}`,
        badge: group.badge,
        href: `${ROUTES.subjectExams(bank.subjectSlug)}?section=matrix#${checkItem.id}`,
        keywords: `${checkItem.title} ${checkItem.summary} ${group.title} ${formulasText}`,
      });
    }
  }
}

function buildAllSearchableItems(): readonly CommandResultItem[] {
  const subjects = getSubjects();
  const glossaryEntries = getAllGlossaryEntries();
  const items: CommandResultItem[] = [];

  // 1. Định lý trọng tâm được tuyển chọn (ưu tiên xếp hạng cao)
  for (const thm of CURATED_THEOREMS) {
    items.push({
      id: thm.id,
      category: 'theorems',
      knowledgeKind: 'thm',
      badgeLabel: BLOCK_BADGE_LABELS.thm,
      title: thm.title,
      formula: thm.formula,
      subtitle: `${thm.courseTitle} — ${thm.summary}`,
      snippetText: thm.summary,
      breadcrumb: `${thm.courseTitle} · Định lý trọng tâm`,
      badge: 'ĐỊNH LÝ',
      href: thm.href,
      keywords: `${thm.title} ${thm.courseTitle} ${thm.summary} ${thm.keywords} ${thm.formula ?? ''}`,
      priorityBoost: 24,
    });
  }

  // 2. Toàn bộ khối Định nghĩa / Định lý / Ví dụ trích xuất từ MDX lúc build
  for (const block of searchIndex.blocks) {
    const lessonMeta = searchIndex.lessons[block.lessonId];
    if (!lessonMeta) {
      continue;
    }

    const category: CommandCategoryKey =
      block.filterKind === 'def' ? 'glossary' : block.filterKind === 'thm' ? 'theorems' : 'lessons';

    items.push({
      id: `block-${block.id}`,
      category,
      knowledgeKind: block.filterKind,
      badgeLabel: BLOCK_BADGE_LABELS[block.filterKind],
      title: block.title,
      subtitle: `${lessonMeta.subjectTitle} · ${lessonMeta.lessonTitle}`,
      snippetText: block.excerpt,
      breadcrumb: `${lessonMeta.subjectTitle} · ${lessonMeta.chapterTitle} · ${lessonMeta.lessonTitle}`,
      badge: BLOCK_BADGE_LABELS[block.filterKind],
      href: `/mon-hoc/${lessonMeta.subjectSlug}/${lessonMeta.chapterSlug}/${lessonMeta.lessonSlug}#${block.anchorId}`,
      keywords: `${block.title} ${block.excerpt} ${block.keywordsText ?? ''} ${lessonMeta.subjectTitle} ${lessonMeta.chapterTitle} ${lessonMeta.lessonTitle}`,
    });
  }

  // 3. Toàn bộ Học phần & Bài học theo cấu trúc môn học
  for (const subject of subjects) {
    items.push({
      id: `course-${subject.id}`,
      category: 'courses',
      title: subject.title,
      subtitle: `${subject.chapters.length} chương · ${subject.description}`,
      snippetText: subject.description,
      breadcrumb: 'Học phần chuyên ngành',
      badge: `${subject.chapters.length} chương`,
      href: ROUTES.subjectOverview(subject.slug),
      keywords: `${subject.title} ${subject.shortTitle ?? ''} ${subject.slug} ${subject.description}`,
    });

    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        items.push({
          id: `lesson-${lesson.id}`,
          category: 'lessons',
          title: lesson.title,
          subtitle: `${subject.title} · Chương ${chapter.number}: ${chapter.title}`,
          snippetText: lesson.description,
          breadcrumb: `${subject.title} · Chương ${chapter.number}: ${chapter.title}`,
          badge: `Bài ${chapter.number}.${lesson.number}`,
          href: ROUTES.lesson(subject.slug, chapter.slug, lesson.slug),
          keywords: `${lesson.title} ${lesson.description} ${chapter.title} ${subject.title} ${lesson.tags.join(' ')} ${lesson.aliases.join(' ')}`,
          priorityBoost: 6,
        });
      }
    }
  }

  // 4. Ngân hàng Đề thi & Checklist Ôn tập (CTĐS, HHAVE, GTHMB, 20 tình huống GDH)
  appendCourseExamBank(items, MATH1301_EXAM_BANK);
  appendCourseExamBank(items, MATH1302_EXAM_BANK);
  for (const paper of GTHMB_EXAM_PAPERS) {
    appendExamPaperProblems(
      items,
      'giai-tich-ham-mot-bien',
      SUBJECT_LABELS['giai-tich-ham-mot-bien'] ?? 'Giải tích hàm một biến',
      paper,
      'Đề thi HK',
    );
  }
  for (const cs of PEDAGOGICAL_CASE_STUDIES) {
    items.push({
      id: `review-gdh-case-${cs.id}`,
      category: 'reviews',
      knowledgeKind: 'review',
      badgeLabel: BLOCK_BADGE_LABELS.review,
      title: `Tình huống ${cs.id}: ${cs.title}`,
      subtitle: `Giáo dục học · ${cs.context}`,
      snippetText: `${cs.context} ${cs.question}`,
      breadcrumb: 'Giáo dục học · Thực hành 1 · 20 Tình huống sư phạm',
      badge: 'ÔN TẬP',
      href: '/mon-hoc/giao-duc-hoc/khoi-thuc-hanh-nghiep-vu-su-pham/phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te',
      keywords: `${cs.title} ${cs.context} ${cs.question} ${cs.coreLesson} ${cs.principlesApplied.join(' ')}`,
    });
  }

  // 5. Thuật ngữ Toán học & Công thức KaTeX (gắn nhãn ĐỊNH NGHĨA)
  for (const entry of glossaryEntries) {
    const title = entry.term ?? entry.name ?? entry.nameVi;
    const summary = entry.summary ?? entry.brief;
    const subjectLabel = entry.courseName ?? SUBJECT_LABELS[entry.subject] ?? 'Thuật ngữ học thuật';

    items.push({
      id: `glossary-${entry.id}`,
      category: 'glossary',
      knowledgeKind: 'def',
      badgeLabel: BLOCK_BADGE_LABELS.def,
      title,
      formula: entry.formula ?? entry.symbol,
      subtitle: `${subjectLabel} — ${summary}`,
      snippetText: `${summary} ${entry.intuition}`,
      breadcrumb: `${subjectLabel} · Thuật ngữ & Định nghĩa`,
      badge: 'ĐỊNH NGHĨA',
      href: entry.lessonUrl ?? entry.relatedLesson,
      keywords: `${title} ${entry.nameVi} ${entry.nameEn} ${entry.patterns.join(' ')} ${summary} ${entry.symbol}`,
      priorityBoost: 8,
    });
  }

  return items;
}

export const ALL_COMMAND_ITEMS: readonly CommandResultItem[] = buildAllSearchableItems();

function buildPopularSuggestions(): readonly CommandResultItem[] {
  return [
    {
      id: 'popular-lagrange',
      category: 'theorems',
      knowledgeKind: 'thm',
      badgeLabel: BLOCK_BADGE_LABELS.thm,
      title: 'Định lý Lagrange',
      formula: '|G| = [G : H] \\cdot |H|',
      subtitle: 'Cấu trúc đại số · Chỉ số lớp kề và ước số cấp nhóm hữu hạn',
      breadcrumb: 'Cấu trúc đại số · Gợi ý phổ biến',
      badge: 'ĐỊNH LÝ',
      href: '/mon-hoc/cau-truc-dai-so/lop-ke-va-dinh-ly-lagrange/dinh-ly-lagrange-va-ung-dung-so-hoc',
      keywords: 'dinh ly lagrange nhom con chi so',
    },
    {
      id: 'popular-affine',
      category: 'lessons',
      knowledgeKind: 'def',
      badgeLabel: BLOCK_BADGE_LABELS.def,
      title: 'Không gian Affine',
      formula: '\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}',
      subtitle: 'Hình học Affine & Euclide · Tiên đề Weyl và hệ thức Chasles',
      breadcrumb: 'Hình học Affine & Euclide · Gợi ý phổ biến',
      badge: 'ĐỊNH NGHĨA',
      href: '/mon-hoc/hinh-hoc-affine/khong-gian-affine/khong-gian-affine',
      keywords: 'khong gian affine weyl chasles',
    },
    {
      id: 'popular-limit-sequence',
      category: 'lessons',
      knowledgeKind: 'thm',
      badgeLabel: BLOCK_BADGE_LABELS.thm,
      title: 'Giới hạn dãy số',
      formula: '\\forall \\varepsilon > 0, \\exists N : |x_n - L| < \\varepsilon',
      subtitle: 'Giải tích hàm một biến · Định nghĩa Cauchy và các tiêu chuẩn hội tụ',
      breadcrumb: 'Giải tích hàm một biến · Gợi ý phổ biến',
      badge: 'ĐỊNH LÝ',
      href: '/mon-hoc/giai-tich-ham-mot-bien/day-so-va-gioi-han/khai-niem-gioi-han-day-so',
      keywords: 'gioi han day so hoi tu cauchy',
    },
    {
      id: 'popular-pedagogy-cases',
      category: 'reviews',
      knowledgeKind: 'review',
      badgeLabel: BLOCK_BADGE_LABELS.review,
      title: '20 tình huống sư phạm',
      subtitle: 'Giáo dục học · Quy trình 5 bước xử lí tình huống giáo dục phổ thông',
      breadcrumb: 'Giáo dục học · Thực hành 1',
      badge: 'ÔN TẬP',
      href: '/mon-hoc/giao-duc-hoc/khoi-thuc-hanh-nghiep-vu-su-pham/phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te',
      keywords: '20 tinh huong su pham quy trinh 5 buoc',
    },
  ];
}

export const POPULAR_SUGGESTIONS: readonly CommandResultItem[] = buildPopularSuggestions();

/** Chấm điểm mức độ khớp của một mục tìm kiếm đối với truy vấn `rawQuery`. */
export function scoreCommandItem(item: CommandResultItem, rawQuery: string): number {
  const clean = rawQuery.trim();
  if (!clean) {
    return 0;
  }

  const titleMatch = scoreTextMatch(item.title, clean);
  const formulaMatch = item.formula
    ? scoreTextMatch(item.formula, clean)
    : { matched: false, exactAccentedBonus: 0, tokenMatchCount: 0 };
  const snippetMatch = item.snippetText
    ? scoreTextMatch(item.snippetText, clean)
    : { matched: false, exactAccentedBonus: 0, tokenMatchCount: 0 };
  const keywordsMatch = scoreTextMatch(item.keywords, clean);
  const combinedMatch = scoreTextMatch(
    `${item.title} ${item.formula ?? ''} ${item.snippetText ?? ''} ${item.keywords}`,
    clean,
  );

  if (
    !titleMatch.matched &&
    !formulaMatch.matched &&
    !snippetMatch.matched &&
    !keywordsMatch.matched &&
    !combinedMatch.matched
  ) {
    return 0;
  }

  let score = item.priorityBoost ?? 0;

  if (titleMatch.matched) {
    score += 110 + titleMatch.exactAccentedBonus;
  }
  if (formulaMatch.matched) {
    score += 75 + formulaMatch.exactAccentedBonus;
  }
  if (snippetMatch.matched) {
    score += 55 + snippetMatch.exactAccentedBonus;
  }
  if (keywordsMatch.matched) {
    score += 32 + keywordsMatch.exactAccentedBonus;
  }
  if (combinedMatch.matched) {
    score += 16 + combinedMatch.exactAccentedBonus;
  }

  return score;
}

/**
 * Gắn query `?q=...` vào đường dẫn đích khi điều hướng từ kết quả tìm kiếm
 * nhằm kích hoạt thanh duyệt kết quả tại chỗ và tô sáng trong trang.
 */
export function buildSearchNavigationUrl(rawHref: string, rawQuery: string): string {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return rawHref;
  }

  const hashIndex = rawHref.indexOf('#');
  const hash = hashIndex >= 0 ? rawHref.slice(hashIndex) : '';
  const beforeHash = hashIndex >= 0 ? rawHref.slice(0, hashIndex) : rawHref;

  const queryIndex = beforeHash.indexOf('?');
  const pathname = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
  const search = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : '';

  const params = new URLSearchParams(search);
  params.set('q', trimmed);
  const queryString = params.toString();

  return `${pathname}${queryString ? `?${queryString}` : ''}${hash}`;
}
