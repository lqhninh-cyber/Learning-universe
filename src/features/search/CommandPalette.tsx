import {
  ArrowRight,
  BookMarked,
  BookOpen,
  CornerDownLeft,
  GraduationCap,
  Search,
  Sigma,
  Sparkles,
} from 'lucide-react';
import {
  type FC,
  type KeyboardEvent as ReactKeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router';
import { getSubjects, resolveLessonShortcut } from '@/content-runtime';
import { getAllGlossaryEntries, KatexMath } from '@/features/math-glossary';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery, normalizeSearchQuery } from '@/utils/vietnamese-text';

export interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Cho phép bật/tắt lắng nghe phím tắt toàn cục Ctrl+K / Cmd+K ngay trong component. Mặc định: true */
  readonly enableGlobalShortcut?: boolean;
}

export type CommandCategoryKey = 'theorems' | 'lessons' | 'courses' | 'glossary';

export interface CommandResultItem {
  readonly id: string;
  readonly category: CommandCategoryKey;
  readonly title: string;
  readonly subtitle: string;
  readonly badge?: string;
  readonly formula?: string;
  readonly href: string;
  readonly keywords: string;
}

interface CuratedTheoremItem {
  readonly id: string;
  readonly title: string;
  readonly formula: string;
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

const COURSE_CODE_BY_SLUG: Readonly<Record<string, string>> = {
  'cau-truc-dai-so': 'MATH1301',
  'hinh-hoc-affine': 'MATH1302',
  'giai-tich-ham-mot-bien': 'MATH1303',
  'giao-duc-hoc': 'EDUT1401',
};

function buildAllSearchableItems(): readonly CommandResultItem[] {
  const subjects = getSubjects();
  const glossaryEntries = getAllGlossaryEntries();
  const items: CommandResultItem[] = [];

  // 1. Nhóm ĐỊNH LÝ & CÔNG THỨC
  for (const thm of CURATED_THEOREMS) {
    items.push({
      id: thm.id,
      category: 'theorems',
      title: thm.title,
      subtitle: `${thm.courseTitle} · ${thm.summary}`,
      badge: thm.courseTitle,
      formula: thm.formula,
      href: thm.href,
      keywords: `${thm.title} ${thm.formula} ${thm.courseTitle} ${thm.summary} ${thm.keywords}`,
    });
  }

  // 2. Nhóm BÀI HỌC & CHƯƠNG
  for (const subject of subjects) {
    const courseCode = COURSE_CODE_BY_SLUG[subject.slug] ?? subject.slug.toUpperCase();
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        const chapterLabel = `Chương ${chapter.number}`;
        const lessonNumberLabel = `${chapter.number}.${lesson.number}`;
        items.push({
          id: `lesson-${subject.slug}-${lesson.id}`,
          category: 'lessons',
          title: lesson.title,
          subtitle: `${chapterLabel}: ${chapter.title} · ${subject.title}`,
          badge: `${courseCode} · Bài ${lessonNumberLabel}`,
          href: ROUTES.lesson(subject.slug, chapter.slug, lesson.slug),
          keywords: `${lesson.title} ${lesson.description} ${chapter.title} ${subject.title} ${lesson.tags.join(' ')} chuong ${chapter.number} bai ${lessonNumberLabel}`,
        });
      }
    }
  }

  // 3. Nhóm HỌC PHẦN (4 Courses)
  for (const subject of subjects) {
    const courseCode = COURSE_CODE_BY_SLUG[subject.slug] ?? 'HỌC PHẦN';
    items.push({
      id: `course-${subject.slug}`,
      category: 'courses',
      title: subject.title,
      subtitle: subject.description,
      badge: courseCode,
      href: ROUTES.courseOverview(subject.slug),
      keywords: `${subject.title} ${courseCode} ${subject.description} ${subject.slug} hoc phan mon hoc`,
    });
  }

  // 4. Nhóm THUẬT NGỮ (Glossary)
  for (const entry of glossaryEntries) {
    const courseLabel =
      entry.courseName ||
      (entry.subject === 'cau-truc-dai-so'
        ? 'Cấu trúc đại số'
        : entry.subject === 'giai-tich-ham-mot-bien'
          ? 'Giải tích hàm một biến'
          : 'Hình học Affine & Euclide');

    items.push({
      id: `glossary-${entry.id}`,
      category: 'glossary',
      title: entry.nameVi,
      subtitle: `${entry.nameEn} · ${entry.brief}`,
      badge: courseLabel,
      formula: entry.symbol,
      href: `/glossary?q=${encodeURIComponent(entry.nameVi)}`,
      keywords: `${entry.nameVi} ${entry.nameEn} ${entry.symbol} ${entry.formula ?? ''} ${entry.patterns.join(' ')} ${entry.brief} ${courseLabel}`,
    });
  }

  return items;
}

const ALL_COMMAND_ITEMS: readonly CommandResultItem[] = buildAllSearchableItems();

function resolvePopularSequenceLessonHref(): string {
  const subjects = getSubjects();
  const calc = subjects.find((s) => s.slug === 'giai-tich-ham-mot-bien');
  if (calc) {
    for (const ch of calc.chapters) {
      for (const ls of ch.lessons) {
        if (
          matchesVietnameseQuery(`${ls.title} ${ls.slug}`, 'gioi han day so') ||
          matchesVietnameseQuery(`${ls.title} ${ls.slug}`, 'day so')
        ) {
          return ROUTES.lesson(calc.slug, ch.slug, ls.slug);
        }
      }
    }
    const firstChapter = calc.chapters[0];
    const firstLesson = firstChapter?.lessons[0];
    if (firstChapter && firstLesson) {
      return ROUTES.lesson(calc.slug, firstChapter.slug, firstLesson.slug);
    }
  }
  return ROUTES.courseOverview('giai-tich-ham-mot-bien');
}

function buildPopularSuggestions(): readonly CommandResultItem[] {
  const pedagogyResolved = resolveLessonShortcut('ngan-hang-20-tinh-huong-su-pham-thuc-te');
  const pedagogyHref = pedagogyResolved
    ? ROUTES.lesson(
        pedagogyResolved.subject.slug,
        pedagogyResolved.chapter.slug,
        pedagogyResolved.lesson.slug,
      )
    : '/mon-hoc/giao-duc-hoc/cam-nang-xu-ly-tinh-huong-su-pham-va-de-cuong-on-tap/ngan-hang-20-tinh-huong-su-pham-thuc-te';

  return [
    {
      id: 'popular-lagrange',
      category: 'theorems',
      title: 'Định lý Lagrange',
      subtitle: 'Cấu trúc đại số · Lớp kề và ứng dụng số học của Định lý Lagrange',
      badge: 'Định lý & Công thức',
      formula: '|G| = [G : H] \\cdot |H|',
      href: '/mon-hoc/cau-truc-dai-so/lop-ke-va-dinh-ly-lagrange/dinh-ly-lagrange-va-ung-dung-so-hoc',
      keywords: 'Định lý Lagrange',
    },
    {
      id: 'popular-affine',
      category: 'lessons',
      title: 'Không gian Affine',
      subtitle: 'Hình học Affine & Euclide · Chương 1: Khái niệm, tiên đề Weyl và hệ thức Chasles',
      badge: 'Bài học trọng tâm',
      formula: '\\mathbb{A}^n',
      href: '/mon-hoc/hinh-hoc-affine/khong-gian-affine/khong-gian-affine',
      keywords: 'Không gian Affine',
    },
    {
      id: 'popular-sequence-limit',
      category: 'lessons',
      title: 'Giới hạn dãy số',
      subtitle: 'Giải tích hàm một biến · Định nghĩa ε-N, dãy đơn điệu và tiêu chuẩn hội tụ Cauchy',
      badge: 'Giải tích thực',
      formula: '\\lim_{n \\to \\infty} x_n = L',
      href: resolvePopularSequenceLessonHref(),
      keywords: 'Giới hạn dãy số',
    },
    {
      id: 'popular-pedagogy-20',
      category: 'lessons',
      title: '20 tình huống sư phạm',
      subtitle: 'Giáo dục học · Ngân hàng 20 tình huống sư phạm thực tế & quy trình 5 bước xử lý',
      badge: 'Thực hành Sư phạm',
      href: pedagogyHref,
      keywords: '20 tình huống sư phạm',
    },
  ];
}

const POPULAR_SUGGESTIONS: readonly CommandResultItem[] = buildPopularSuggestions();

const CATEGORY_METADATA: Record<
  CommandCategoryKey,
  { readonly label: string; readonly icon: typeof Sigma }
> = {
  theorems: {
    label: 'ĐỊNH LÝ & CÔNG THỨC',
    icon: Sigma,
  },
  lessons: {
    label: 'BÀI HỌC & CHƯƠNG',
    icon: BookOpen,
  },
  courses: {
    label: 'HỌC PHẦN',
    icon: GraduationCap,
  },
  glossary: {
    label: 'THUẬT NGỮ',
    icon: BookMarked,
  },
};

function scoreCommandItem(item: CommandResultItem, rawQuery: string): number {
  const clean = rawQuery.trim();
  if (!clean) return 0;

  const normQuery = normalizeSearchQuery(clean);
  const normTitle = normalizeSearchQuery(item.title);
  const normKeywords = normalizeSearchQuery(item.keywords);
  const rawFormula = (item.formula ?? '').toLowerCase();
  const lowerQuery = clean.toLowerCase();

  let score = 0;

  if (normTitle === normQuery) {
    score += 120;
  } else if (normTitle.startsWith(normQuery)) {
    score += 85;
  } else if (normTitle.includes(normQuery)) {
    score += 60;
  }

  if (rawFormula && rawFormula.includes(lowerQuery)) {
    score += 70;
  }

  if (matchesVietnameseQuery(item.keywords, clean)) {
    score += 35;
  } else if (normKeywords.includes(normQuery)) {
    score += 25;
  }

  return score;
}

export const CommandPalette: FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  enableGlobalShortcut = true,
}) => {
  const inputId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  // Tự động đóng Command Palette khi đường dẫn URL thay đổi
  const routeKey = `${pathname}${search}`;
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey);
    if (open) {
      onOpenChange(false);
    }
  }

  // Đặt lại từ khóa và mục chọn về đầu khi modal mở
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setActiveIndex(0);
    }
  }

  // Lắng nghe sự kiện bàn phím toàn cục: Ctrl+K / Cmd+K để mở/đóng, Esc để đóng
  useEffect(() => {
    if (!enableGlobalShortcut) return;

    function handleGlobalKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      } else if (event.key === 'Escape' && open) {
        event.preventDefault();
        onOpenChange(false);
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [enableGlobalShortcut, open, onOpenChange]);

  // Khóa cuộn trang nền (body scroll lock) và tự động focus vào ô tìm kiếm khi mở modal
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    document.body.classList.add('overflow-hidden');
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove('overflow-hidden');
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  const trimmedQuery = query.trim();
  const isQueryEmpty = trimmedQuery.length === 0;

  // Lọc và phân nhóm kết quả theo 4 danh mục học thuật
  const matchedTheorems: CommandResultItem[] = [];
  const matchedLessons: CommandResultItem[] = [];
  const matchedCourses: CommandResultItem[] = [];
  const matchedGlossary: CommandResultItem[] = [];

  if (!isQueryEmpty) {
    const scored = ALL_COMMAND_ITEMS.map((item) => ({
      item,
      score: scoreCommandItem(item, trimmedQuery),
    }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const { item } of scored) {
      if (item.category === 'theorems' && matchedTheorems.length < 4) {
        matchedTheorems.push(item);
      } else if (item.category === 'lessons' && matchedLessons.length < 6) {
        matchedLessons.push(item);
      } else if (item.category === 'courses' && matchedCourses.length < 4) {
        matchedCourses.push(item);
      } else if (item.category === 'glossary' && matchedGlossary.length < 4) {
        matchedGlossary.push(item);
      }
    }
  }

  const defaultCourses = ALL_COMMAND_ITEMS.filter((item) => item.category === 'courses');

  const groups: ReadonlyArray<{
    readonly key: string;
    readonly label: string;
    readonly icon: typeof Sigma;
    readonly items: readonly CommandResultItem[];
  }> = isQueryEmpty
    ? [
        {
          key: 'popular',
          label: 'Gợi ý phổ biến',
          icon: Sparkles,
          items: POPULAR_SUGGESTIONS,
        },
        {
          key: 'courses-default',
          label: 'HỌC PHẦN',
          icon: GraduationCap,
          items: defaultCourses,
        },
      ]
    : (
        [
          {
            key: 'theorems',
            label: CATEGORY_METADATA.theorems.label,
            icon: CATEGORY_METADATA.theorems.icon,
            items: matchedTheorems,
          },
          {
            key: 'lessons',
            label: CATEGORY_METADATA.lessons.label,
            icon: CATEGORY_METADATA.lessons.icon,
            items: matchedLessons,
          },
          {
            key: 'courses',
            label: CATEGORY_METADATA.courses.label,
            icon: CATEGORY_METADATA.courses.icon,
            items: matchedCourses,
          },
          {
            key: 'glossary',
            label: CATEGORY_METADATA.glossary.label,
            icon: CATEGORY_METADATA.glossary.icon,
            items: matchedGlossary,
          },
        ] as const
      ).filter((group) => group.items.length > 0);

  const flatItems: CommandResultItem[] = groups.flatMap((group) => group.items);
  const safeActiveIndex =
    flatItems.length === 0 ? -1 : Math.min(Math.max(0, activeIndex), flatItems.length - 1);

  const handleSelectItem = (item: CommandResultItem) => {
    onOpenChange(false);
    void navigate(item.href);
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (flatItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % flatItems.length);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (flatItems.length > 0) {
        setActiveIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
      }
    } else if (event.key === 'Enter') {
      if (safeActiveIndex >= 0 && flatItems[safeActiveIndex]) {
        event.preventDefault();
        handleSelectItem(flatItems[safeActiveIndex]);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hộp tìm kiếm học thuật nhanh (Command Palette)"
      className="fixed inset-0 z-50 flex items-start justify-center bg-stone-900/30 px-4 pt-24 backdrop-blur-sm transition-all"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200/80 bg-[#FAF7F2]/95 shadow-2xl backdrop-blur-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Thanh nhập liệu tìm kiếm (Search Input Header) */}
        <div className="flex items-center gap-3 border-b border-stone-200/80 px-5 py-4">
          <Search className="h-5 w-5 shrink-0 text-stone-500" aria-hidden="true" />
          <label htmlFor={inputId} className="sr-only">
            Tìm kiếm định lý, công thức, bài học và thuật ngữ
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-autocomplete="list"
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Tìm kiếm định lý, công thức, bài học (Lagrange, Affine, Nhóm con)..."
            className="w-full bg-transparent font-sans text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none md:text-base"
          />

          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              className="shrink-0 cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium text-stone-500 transition-colors hover:bg-stone-200/60 hover:text-stone-900"
            >
              Xóa
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Đóng hộp thoại tìm kiếm (ESC)"
            className="shrink-0 cursor-pointer rounded-md border border-stone-300/80 bg-stone-200/60 px-2 py-1 font-mono text-[10px] font-semibold tracking-wider text-stone-600 uppercase transition-colors hover:bg-stone-300/70 hover:text-stone-900"
          >
            ESC
          </button>
        </div>

        {/* Danh sách kết quả tìm kiếm phân nhóm */}
        <div
          id={listboxId}
          role="listbox"
          aria-label="Kết quả tìm kiếm học thuật"
          className="max-h-[65vh] overflow-y-auto px-3 py-3"
        >
          {flatItems.length > 0 ? (
            <div className="space-y-4">
              {groups.map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.key} className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-1">
                      <GroupIcon className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                      <span className="font-mono text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
                        {group.label}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const itemIndex = flatItems.findIndex((entry) => entry.id === item.id);
                        const isSelected = itemIndex === safeActiveIndex;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setActiveIndex(itemIndex)}
                            onClick={() => handleSelectItem(item)}
                            className={cn(
                              'group flex w-full cursor-pointer items-center justify-between gap-4 rounded-xl px-3.5 py-2.5 text-left transition-colors',
                              isSelected
                                ? 'bg-stone-900 text-[#FAF7F2]'
                                : 'text-stone-800 hover:bg-stone-200/60',
                            )}
                          >
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={cn(
                                    'font-serif text-sm font-semibold md:text-[15px]',
                                    isSelected ? 'text-[#FAF7F2]' : 'text-stone-900',
                                  )}
                                >
                                  {item.title}
                                </span>

                                {item.badge && (
                                  <span
                                    className={cn(
                                      'rounded-full px-2 py-0.5 font-mono text-[10px] font-medium',
                                      isSelected
                                        ? 'bg-white/15 text-stone-200'
                                        : 'bg-stone-200/80 text-stone-600',
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>

                              {/* Công thức Toán học KaTeX hiển thị trực tiếp cho Định lý & Thuật ngữ */}
                              {item.formula && (
                                <div
                                  className={cn(
                                    'inline-flex max-w-full items-center overflow-x-auto rounded-lg border px-2.5 py-0.5 text-xs',
                                    isSelected
                                      ? 'border-white/20 bg-white/10 text-stone-100'
                                      : 'border-stone-300/70 bg-[#F3EFE6] text-stone-900',
                                  )}
                                >
                                  <KatexMath math={item.formula} />
                                </div>
                              )}

                              <p
                                className={cn(
                                  'line-clamp-1 text-xs',
                                  isSelected ? 'text-stone-300' : 'text-stone-500',
                                )}
                              >
                                {item.subtitle}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-1.5">
                              {isSelected ? (
                                <CornerDownLeft
                                  className="h-4 w-4 text-stone-300"
                                  aria-hidden="true"
                                />
                              ) : (
                                <ArrowRight
                                  className="h-4 w-4 text-stone-400 opacity-0 transition-opacity group-hover:opacity-100"
                                  aria-hidden="true"
                                />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="font-serif text-base font-medium text-stone-800">
                Không tìm thấy nội dung phù hợp cho từ khóa này
              </p>
              <p className="mt-1.5 text-xs text-stone-500">
                Hãy thử tìm bằng tên định lý (Lagrange, Cauchy, Chasles), tên bài học hoặc ký hiệu
                Toán học.
              </p>
            </div>
          )}
        </div>

        {/* Chân hộp thoại: Hướng dẫn điều hướng bàn phím */}
        <div className="flex items-center justify-between border-t border-stone-200/80 bg-[#F4EFE6]/80 px-5 py-2.5 text-[11px] text-stone-500">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-700">
                ↑
              </kbd>
              <kbd className="rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-700">
                ↓
              </kbd>
              <span>Di chuyển</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-stone-300 bg-white px-1.5 py-0.5 font-mono text-[10px] text-stone-700">
                Enter
              </kbd>
              <span>Mở ngay</span>
            </span>
          </div>
          <span className="hidden font-mono text-[10px] tracking-wider text-stone-500 uppercase sm:inline">
            Learning Universe · Command Palette
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
