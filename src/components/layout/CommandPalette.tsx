import {
  BookMarked,
  BookOpen,
  CornerDownLeft,
  Download,
  FilePenLine,
  FilePlus2,
  FolderKanban,
  Gamepad2,
  Hourglass,
  Landmark,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  Presentation,
  RotateCcw,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';
import {
  type FC,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation, useNavigate } from 'react-router';
import { HERITAGE_ARTWORKS } from '@/components/home/HeritageArtShowcase';
import { getSubjects } from '@/content-runtime/manifest';
import { getIslandSubjectByIdOrSlug } from '@/context/island-helpers';
import { useLayout } from '@/context/LayoutContext';
import { usePomodoro } from '@/context/PomodoroContext';
import { useReadingSettings } from '@/context/ReadingSettingsContext';
import { selectActiveExamBucket, useExamBuilderStore } from '@/features/exam-builder';
import { getAllGlossaryEntries } from '@/features/math-glossary';
import {
  selectActiveInkBucket,
  selectActiveInkFolders,
  useInkNotebookStore,
} from '@/features/math-ink';
import { ROUTES } from '@/shared/config/routes';
import { usePwaStatus } from '@/shared/hooks/usePwaStatus';
import { cn } from '@/shared/lib/cn';
import { normalizeSearchQuery, scoreTextMatch } from '@/utils/vietnamese-text';

export type OsCommandGroupKey = 'actions' | 'studio' | 'lessons' | 'glossary' | 'heritage';
export type OsCommandScopeKey = 'all' | OsCommandGroupKey;

export interface OsCommandItem {
  readonly id: string;
  readonly group: OsCommandGroupKey;
  readonly title: string;
  readonly subtitle?: string;
  readonly badge?: string;
  readonly dotColor?: string;
  readonly searchText: string;
  readonly href?: string;
  readonly scrollTargetId?: string;
  readonly onExecute?: () => void;
}

export interface CommandPaletteProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly enableGlobalShortcut?: boolean;
}

const SCOPE_TABS: ReadonlyArray<{ readonly key: OsCommandScopeKey; readonly label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'actions', label: 'Lệnh nhanh' },
  { key: 'studio', label: 'Studio (Vở & Đề)' },
  { key: 'lessons', label: 'Bài giảng' },
  { key: 'glossary', label: 'Thuật ngữ' },
  { key: 'heritage', label: 'Di sản' },
];

const SUBJECT_DOT_COLORS: Record<string, string> = {
  'cau-truc-dai-so': '#8C5828',
  'algebraic-structures': '#8C5828',
  'hinh-hoc-affine': '#1D4F6E',
  'affine-geometry': '#1D4F6E',
  'giai-tich-ham-mot-bien': '#1B5E4A',
  'single-variable-calculus': '#1B5E4A',
  'giao-duc-hoc': '#8F3D35',
  pedagogy: '#8F3D35',
};

const SUBJECT_CODES: Record<string, string> = {
  'cau-truc-dai-so': 'CTĐS',
  'algebraic-structures': 'CTĐS',
  'hinh-hoc-affine': 'HHAVE',
  'affine-geometry': 'HHAVE',
  'giai-tich-ham-mot-bien': 'GTHMB',
  'single-variable-calculus': 'GTHMB',
  'giao-duc-hoc': 'GDH',
  pedagogy: 'GDH',
};

const SUBJECT_NAMES: Record<string, string> = {
  'cau-truc-dai-so': 'Cấu trúc đại số',
  'hinh-hoc-affine': 'Hình học Affine & Euclide',
  'giai-tich-ham-mot-bien': 'Giải tích hàm một biến',
  'giao-duc-hoc': 'Giáo dục học',
};

function scrollToSectionById(elementId: string): void {
  if (typeof document === 'undefined') return;
  const runScroll = () => {
    const el = document.getElementById(elementId);
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  runScroll();
  window.setTimeout(runScroll, 180);
}

function buildLessonItems(): readonly OsCommandItem[] {
  const subjects = getSubjects();
  const items: OsCommandItem[] = [];
  for (const subject of subjects) {
    const meta = getIslandSubjectByIdOrSlug(subject.slug) ?? getIslandSubjectByIdOrSlug(subject.id);
    const code = meta?.code ?? SUBJECT_CODES[subject.slug] ?? subject.slug.toUpperCase();
    const dotColor = meta?.accentColor ?? SUBJECT_DOT_COLORS[subject.slug] ?? '#17332C';
    for (const chapter of subject.chapters) {
      for (const lesson of chapter.lessons) {
        const href = ROUTES.lesson(subject.slug, chapter.slug, lesson.slug);
        items.push({
          id: `lesson-${subject.slug}-${lesson.id}`,
          group: 'lessons',
          title: lesson.title,
          subtitle: `${subject.title} · Chương ${chapter.number}: ${chapter.title}`,
          badge: code,
          dotColor,
          href,
          searchText: [
            lesson.title,
            lesson.description,
            chapter.title,
            subject.title,
            code,
            ...lesson.tags,
          ]
            .filter(Boolean)
            .join(' '),
        });
      }
    }
  }
  return items;
}

function buildGlossaryItems(): readonly OsCommandItem[] {
  const entries = getAllGlossaryEntries();
  return entries.map((entry) => {
    const subjectLabel = SUBJECT_NAMES[entry.subject] ?? entry.subject;
    const dotColor = SUBJECT_DOT_COLORS[entry.subject] ?? '#17332C';
    const code = SUBJECT_CODES[entry.subject] ?? entry.subject.toUpperCase();
    return {
      id: `glossary-${entry.id}`,
      group: 'glossary' as const,
      title: entry.nameVi,
      subtitle: `${entry.nameEn} · ${subjectLabel}`,
      badge: code,
      dotColor,
      href: `${ROUTES.glossary}?q=${encodeURIComponent(entry.nameVi)}`,
      searchText: [
        entry.nameVi,
        entry.nameEn,
        entry.symbol,
        entry.brief,
        entry.summary ?? '',
        subjectLabel,
        code,
        ...entry.patterns,
      ].join(' '),
    };
  });
}

function buildHeritageItems(): readonly OsCommandItem[] {
  return HERITAGE_ARTWORKS.map((art) => ({
    id: `heritage-${art.id}`,
    group: 'heritage' as const,
    title: art.title,
    subtitle: `${art.artistOrOrigin} · ${art.yearOrEra}`,
    badge: 'Di sản',
    dotColor: '#9E763B',
    href: ROUTES.sanctuaryTab('di-san'),
    searchText: [
      art.title,
      art.shortTitle,
      art.originalTitle,
      art.artistOrOrigin,
      art.yearOrEra,
      art.eraAndPeriod,
      art.caption,
      'di san nghe thuat bao tang',
    ].join(' '),
  }));
}

const STATIC_LESSONS = buildLessonItems();
const STATIC_GLOSSARY = buildGlossaryItems();
const STATIC_HERITAGE = buildHeritageItems();

function rankItems(
  items: readonly OsCommandItem[],
  query: string,
  limit: number,
): readonly OsCommandItem[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return items.slice(0, limit);
  }
  const normalizedQ = normalizeSearchQuery(trimmed);
  if (!normalizedQ) {
    return items.slice(0, limit);
  }

  const scored: Array<{ readonly item: OsCommandItem; readonly score: number }> = [];
  for (const item of items) {
    const titleMatch = scoreTextMatch(item.title, trimmed);
    const fullMatch = titleMatch.matched ? titleMatch : scoreTextMatch(item.searchText, trimmed);
    if (!fullMatch.matched) continue;

    let score = fullMatch.exactAccentedBonus + fullMatch.tokenMatchCount * 10;
    if (titleMatch.matched) {
      score += 80;
      const normTitle = normalizeSearchQuery(item.title);
      if (normTitle.startsWith(normalizedQ)) {
        score += 60;
      } else if (normTitle.includes(normalizedQ)) {
        score += 35;
      }
    }
    scored.push({ item, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((entry) => entry.item);
}

interface CommandGroupSection {
  readonly key: OsCommandGroupKey;
  readonly label: string;
  readonly icon: typeof Sparkles;
  readonly items: readonly OsCommandItem[];
}

export const CommandPalette: FC<CommandPaletteProps> = ({
  open,
  onOpenChange,
  enableGlobalShortcut = false,
}) => {
  const inputId = useId();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { theme, toggleTheme } = useReadingSettings();
  const { isRailCollapsed, toggleRail } = useLayout();
  const { pomodoro, startPomodoro, pausePomodoro, resumePomodoro, resetPomodoro } = usePomodoro();
  const { canInstall, isStandalone, promptInstall } = usePwaStatus();

  // Kết nối trực tiếp Vở Bảng viết & Đề thi trong Xưởng Soạn đề
  const inkBucket = useInkNotebookStore(selectActiveInkBucket);
  const inkFolders = useInkNotebookStore(selectActiveInkFolders);
  const selectNotebook = useInkNotebookStore((s) => s.selectNotebook);
  const createNotebook = useInkNotebookStore((s) => s.createNotebook);

  const examBucket = useExamBuilderStore(selectActiveExamBucket);
  const selectExam = useExamBuilderStore((s) => s.selectExam);
  const createNewExam = useExamBuilderStore((s) => s.createNewExam);

  const [query, setQuery] = useState('');
  const [activeScope, setActiveScope] = useState<OsCommandScopeKey>('all');
  const [activeIndex, setActiveIndex] = useState(0);

  // Tự động đóng khi route thay đổi
  const routeKey = `${pathname}${search}`;
  const [prevRouteKey, setPrevRouteKey] = useState(routeKey);
  if (routeKey !== prevRouteKey) {
    setPrevRouteKey(routeKey);
    if (open) {
      onOpenChange(false);
    }
  }

  // Đặt lại từ khóa, phạm vi và mục chọn mỗi khi mở modal
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setActiveScope('all');
      setActiveIndex(0);
    }
  }

  // Phím Escape khi mở + tùy chọn Ctrl/Cmd+K khi chạy độc lập
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        enableGlobalShortcut &&
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();
        onOpenChange(!open);
        return;
      }
      if (event.key === 'Escape' && open) {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableGlobalShortcut, onOpenChange, open]);

  // Khóa cuộn nền & focus ô tìm kiếm khi mở modal
  useEffect(() => {
    if (!open || typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.classList.add('overflow-hidden');
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 10);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove('overflow-hidden');
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const isDark = theme === 'dark';

  const osActionItems = useMemo<readonly OsCommandItem[]>(() => {
    const isPomodoroRunning = pomodoro.status === 'running';
    const isPomodoroPaused = pomodoro.status === 'paused';

    const list: OsCommandItem[] = [
      {
        id: 'action-toggle-theme',
        group: 'actions',
        title: isDark
          ? 'Chuyển sang chế độ Sáng (Ceramic Light)'
          : 'Chuyển sang chế độ Tối (Obsidian Studio)',
        subtitle: 'Đổi bảng màu Sứ Bạch ↔ Than Đá trên toàn hệ thống',
        badge: 'Giao diện',
        searchText: 'doi che do sang toi dark mode light mode ceramic obsidian giao dien theme',
        onExecute: () => {
          toggleTheme();
        },
      },
      {
        id: 'action-new-ink-notebook',
        group: 'actions',
        title: 'Tạo vở Bảng viết mới',
        subtitle: 'Khởi tạo ngay 1 quyển vở ô ly trắng & mở Bảng viết Toán học',
        badge: 'Tạo mới',
        dotColor: '#1D4F6E',
        searchText: 'tao vo moi bang viet ghi chep nhap toan notebook math ink',
        onExecute: () => {
          createNotebook();
          void navigate(ROUTES.mathInk);
        },
      },
      {
        id: 'action-teach-mode',
        group: 'actions',
        title: 'Mở Chế độ Tập giảng & Ghi hình bài giảng (.webm)',
        subtitle: 'Bảng giảng toàn khung kèm đồng hồ 15p/45p, bút Laser & thu âm Offline',
        badge: 'Tập giảng',
        dotColor: '#1B5E4A',
        href: `${ROUTES.mathInk}?mode=teach`,
        searchText:
          'tap giang ghi hinh quay video bai giang micro teaching laser thuyet trinh su pham',
      },
      {
        id: 'action-new-exam',
        group: 'actions',
        title: 'Tạo đề kiểm tra mới trong Xưởng Soạn đề',
        subtitle: 'Khởi tạo đề chuẩn THPT 2025 (A–D, Đúng/Sai, Trả lời ngắn) sẵn sàng xuất PDF',
        badge: 'Tạo đề',
        dotColor: '#1B5E4A',
        searchText: 'tao de moi xuong soan de kiem tra de thi trac nghiem latex a4',
        onExecute: () => {
          createNewExam('blank');
          void navigate(ROUTES.examBuilder);
        },
      },
      {
        id: 'action-pomodoro',
        group: 'actions',
        title: isPomodoroRunning
          ? 'Tạm dừng Nhịp học tập (Pomodoro)'
          : isPomodoroPaused
            ? 'Tiếp tục Nhịp học tập (Pomodoro)'
            : 'Bắt đầu Nhịp học tập Pomodoro (25 phút)',
        subtitle: 'Đồng hồ tập trung bền vững xuyên suốt các bài học',
        badge: 'Pomodoro',
        dotColor: '#9E763B',
        searchText: 'bat dau tam dung pomodoro nhip hoc tap hen gio 25 phut tap trung',
        onExecute: () => {
          if (isPomodoroRunning) {
            pausePomodoro();
          } else if (isPomodoroPaused) {
            resumePomodoro();
          } else {
            startPomodoro(25, 'Tiêu chuẩn');
          }
        },
      },
      {
        id: 'action-pomodoro-45',
        group: 'actions',
        title: 'Bắt đầu Phiên học sâu Pomodoro (45 phút)',
        subtitle: 'Chế độ nghiên cứu định lý, chứng minh đại số & giải đề chuyên sâu',
        badge: '45 phút',
        dotColor: '#9E763B',
        searchText: 'phien hoc sau pomodoro 45 phut chuyen sau tap trung dai',
        onExecute: () => {
          startPomodoro(45, 'Chuyên sâu');
        },
      },
      {
        id: 'action-toggle-rail',
        group: 'actions',
        title: isRailCollapsed ? 'Mở rộng thanh điều hướng trái' : 'Thu gọn thanh điều hướng trái',
        subtitle: 'Chuyển độ rộng Rail giữa 232px và 60px (Phím [)',
        badge: 'Phím [',
        searchText: 'thu gon mo rong thanh ben rail sidebar menu dieu huong',
        onExecute: () => {
          toggleRail();
        },
      },
      {
        id: 'action-goto-math-ink',
        group: 'actions',
        title: 'Mở Bảng viết (Math Ink Studio)',
        subtitle: 'Vở ô ly viết tay, dựng hình GeoGebra, hình 3D nét đứt, đồ thị f(x) & công thức',
        badge: 'Bảng viết',
        dotColor: '#1D4F6E',
        href: ROUTES.mathInk,
        searchText:
          'bang viet scrble ink vo o ly ve do thi ham so hinh khong gian 3d geogebra cong thuc',
      },
      {
        id: 'action-goto-exam-builder',
        group: 'actions',
        title: 'Mở Soạn đề',
        subtitle: 'Soạn đề 3 phần chuẩn PDF (A–D, Đúng/Sai, Trả lời ngắn), KaTeX & in A4',
        badge: 'Soạn đề',
        dotColor: '#1B5E4A',
        href: ROUTES.examBuilder,
        searchText: 'soan de tao de kiem tra toan trac nghiem dung sai tra loi ngan latex pdf in',
      },
      {
        id: 'action-goto-billiards',
        group: 'actions',
        title: 'Đi tới Bida 8-Ball Khoáng Thạch',
        subtitle: 'Sảnh thư giãn · Bàn bida 15 bi vật lý chuẩn WPA 120fps',
        badge: 'Thư giãn',
        dotColor: '#9E763B',
        href: ROUTES.sanctuaryTab('bida'),
        searchText: 'di toi bi da bida 8 ball pool sanh thu gian tro choi giai tri',
      },
    ];

    if (pomodoro.status !== 'idle') {
      list.push({
        id: 'action-pomodoro-reset',
        group: 'actions',
        title: 'Đặt lại đồng hồ Pomodoro về 00:00',
        subtitle: 'Kết thúc phiên đếm ngược hiện tại',
        badge: 'Đặt lại',
        searchText: 'dat lai huy dung pomodoro reset timer',
        onExecute: () => {
          resetPomodoro();
        },
      });
    }

    if (canInstall && !isStandalone) {
      list.unshift({
        id: 'action-install-pwa',
        group: 'actions',
        title: 'Cài đặt Ứng dụng Học Offline (PWA)',
        subtitle: 'Ghim Learning Universe ra màn hình máy tính / điện thoại để học không cần mạng',
        badge: 'Offline App',
        dotColor: '#17332C',
        searchText: 'cai dat ung dung app pwa offline ngoai tuyen giang duong',
        onExecute: () => {
          void promptInstall();
        },
      });
    }

    return list;
  }, [
    canInstall,
    createNewExam,
    createNotebook,
    isDark,
    isRailCollapsed,
    isStandalone,
    navigate,
    pausePomodoro,
    pomodoro.status,
    promptInstall,
    resetPomodoro,
    resumePomodoro,
    startPomodoro,
    toggleRail,
    toggleTheme,
  ]);

  const studioItems = useMemo<readonly OsCommandItem[]>(() => {
    const folderMap = new Map(inkFolders.map((f) => [f.id, f.name]));
    const notebookItems: OsCommandItem[] = inkBucket.notebooks.map((nb) => {
      const folderName = nb.folderId
        ? (folderMap.get(nb.folderId) ?? 'Thư mục riêng')
        : 'Chưa phân mục';
      const strokeAndObjCount = nb.pages.reduce(
        (sum, pg) =>
          sum +
          pg.strokes.length +
          pg.shapes.length +
          pg.solids3d.length +
          pg.graphs.length +
          (pg.geoObjects?.length ?? 0) +
          pg.texts.length,
        0,
      );
      return {
        id: `studio-nb-${nb.id}`,
        group: 'studio',
        title: nb.title,
        subtitle: `Bảng viết · ${folderName} · ${nb.pages.length} trang (${strokeAndObjCount} mục)`,
        badge: 'Vở viết',
        dotColor: '#1D4F6E',
        searchText: `${nb.title} ${folderName} vo bang viet ghi chep nhap toan studio`,
        onExecute: () => {
          selectNotebook(nb.id);
          void navigate(ROUTES.mathInk);
        },
      };
    });

    const examItems: OsCommandItem[] = examBucket.exams.map((exam) => ({
      id: `studio-exam-${exam.id}`,
      group: 'studio',
      title: exam.title,
      subtitle: `Xưởng Soạn đề · ${exam.images.length} hình đính kèm · Chuẩn in A4 / LaTeX`,
      badge: 'Đề soạn',
      dotColor: '#1B5E4A',
      searchText: `${exam.title} de thi de kiem tra xuong soan de studio`,
      onExecute: () => {
        selectExam(exam.id);
        void navigate(ROUTES.examBuilder);
      },
    }));

    return [...notebookItems, ...examItems];
  }, [examBucket.exams, inkBucket.notebooks, inkFolders, navigate, selectExam, selectNotebook]);

  const groups = useMemo<readonly CommandGroupSection[]>(() => {
    const isEmpty = query.trim().length === 0;
    const focusedLimit = 14;

    const matchedActions =
      activeScope === 'all' || activeScope === 'actions'
        ? rankItems(
            osActionItems,
            query,
            activeScope === 'actions' ? focusedLimit : isEmpty ? 5 : 6,
          )
        : [];
    const matchedStudio =
      activeScope === 'all' || activeScope === 'studio'
        ? rankItems(studioItems, query, activeScope === 'studio' ? focusedLimit : isEmpty ? 3 : 6)
        : [];
    const matchedLessons =
      activeScope === 'all' || activeScope === 'lessons'
        ? rankItems(
            STATIC_LESSONS,
            query,
            activeScope === 'lessons' ? focusedLimit : isEmpty ? 4 : 6,
          )
        : [];
    const matchedGlossary =
      activeScope === 'all' || activeScope === 'glossary'
        ? rankItems(
            STATIC_GLOSSARY,
            query,
            activeScope === 'glossary' ? focusedLimit : isEmpty ? 3 : 6,
          )
        : [];
    const matchedHeritage =
      activeScope === 'all' || activeScope === 'heritage'
        ? rankItems(
            STATIC_HERITAGE,
            query,
            activeScope === 'heritage' ? focusedLimit : isEmpty ? 3 : 5,
          )
        : [];

    const all: CommandGroupSection[] = [
      { key: 'actions', label: 'LỆNH NHANH OS', icon: Sparkles, items: matchedActions },
      {
        key: 'studio',
        label: `STUDIO CÁ NHÂN (${inkBucket.notebooks.length} VỞ · ${examBucket.exams.length} ĐỀ)`,
        icon: FolderKanban,
        items: matchedStudio,
      },
      {
        key: 'lessons',
        label: `BÀI GIẢNG (${STATIC_LESSONS.length} BÀI)`,
        icon: BookOpen,
        items: matchedLessons,
      },
      {
        key: 'glossary',
        label: `THUẬT NGỮ (${STATIC_GLOSSARY.length}+ MỤC)`,
        icon: BookMarked,
        items: matchedGlossary,
      },
      {
        key: 'heritage',
        label: `DI SẢN (${STATIC_HERITAGE.length} TÁC PHẨM)`,
        icon: Landmark,
        items: matchedHeritage,
      },
    ];

    return all.filter((section) => section.items.length > 0);
  }, [
    activeScope,
    examBucket.exams.length,
    inkBucket.notebooks.length,
    osActionItems,
    query,
    studioItems,
  ]);

  const flatItems = useMemo(() => groups.flatMap((section) => section.items), [groups]);

  const safeActiveIndex =
    flatItems.length === 0 ? -1 : Math.min(Math.max(0, activeIndex), flatItems.length - 1);
  const activeItem = safeActiveIndex >= 0 ? flatItems[safeActiveIndex] : undefined;
  const activeOptionId = activeItem ? `os-cmd-option-${activeItem.id}` : undefined;

  // Tự cuộn mượt theo mục đang active khi di chuyển bằng phím ↑ / ↓
  useEffect(() => {
    if (!open || !activeItem) return;
    const node = optionRefs.current.get(activeItem.id);
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ block: 'nearest' });
    }
  }, [activeItem, open]);

  const handleSelectItem = useCallback(
    (item: OsCommandItem) => {
      onOpenChange(false);
      if (item.onExecute) {
        item.onExecute();
        return;
      }
      if (item.href) {
        if (item.scrollTargetId && pathname === ROUTES.home) {
          scrollToSectionById(item.scrollTargetId);
          return;
        }
        void navigate(item.href);
        if (item.scrollTargetId) {
          window.setTimeout(() => scrollToSectionById(item.scrollTargetId!), 160);
        }
      }
    },
    [navigate, onOpenChange, pathname],
  );

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const idx = SCOPE_TABS.findIndex((t) => t.key === activeScope);
      const nextIdx = event.shiftKey
        ? (idx - 1 + SCOPE_TABS.length) % SCOPE_TABS.length
        : (idx + 1) % SCOPE_TABS.length;
      setActiveScope(SCOPE_TABS[nextIdx]!.key);
      setActiveIndex(0);
      return;
    }
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
      if (activeItem) {
        event.preventDefault();
        handleSelectItem(activeItem);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onOpenChange(false);
    }
  };

  if (!open) {
    return null;
  }

  const renderItemLeading = (item: OsCommandItem, isSelected: boolean) => {
    if (item.group === 'actions') {
      let icon = <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />;
      if (item.id === 'action-toggle-theme') {
        icon = isDark ? (
          <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
        );
      } else if (item.id === 'action-toggle-rail') {
        icon = isRailCollapsed ? (
          <PanelLeftOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
        ) : (
          <PanelLeftClose className="h-4 w-4 shrink-0" aria-hidden="true" />
        );
      } else if (item.id === 'action-pomodoro' || item.id === 'action-pomodoro-45') {
        icon = <Hourglass className="h-4 w-4 shrink-0" aria-hidden="true" />;
      } else if (item.id === 'action-pomodoro-reset') {
        icon = <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />;
      } else if (item.id === 'action-goto-billiards') {
        icon = <Gamepad2 className="h-4 w-4 shrink-0" aria-hidden="true" />;
      } else if (item.id === 'action-new-ink-notebook' || item.id === 'action-goto-math-ink') {
        icon = <PenTool className="h-4 w-4 shrink-0" aria-hidden="true" />;
      } else if (item.id === 'action-teach-mode') {
        icon = <Presentation className="h-4 w-4 shrink-0" aria-hidden="true" />;
      } else if (item.id === 'action-new-exam') {
        icon = <FilePlus2 className="h-4 w-4 shrink-0" aria-hidden="true" />;
      } else if (item.id === 'action-goto-exam-builder') {
        icon = <FilePenLine className="h-4 w-4 shrink-0" aria-hidden="true" />;
      } else if (item.id === 'action-install-pwa') {
        icon = <Download className="h-4 w-4 shrink-0" aria-hidden="true" />;
      }

      return (
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)]',
            isSelected ? 'text-[var(--accent-os)]' : 'text-[var(--text-muted)]',
          )}
        >
          {icon}
        </span>
      );
    }

    if (item.group === 'studio') {
      const isExam = item.id.startsWith('studio-exam-');
      return (
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)]',
            isSelected ? 'text-[var(--accent-os)]' : 'text-[var(--text-secondary)]',
          )}
        >
          {isExam ? (
            <FilePenLine className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          ) : (
            <PenTool className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          )}
        </span>
      );
    }

    return (
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: item.dotColor ?? 'var(--accent-os)' }}
        aria-hidden="true"
      />
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bảng lệnh trung tâm Academic OS (⌘K)"
      data-testid="os-command-palette"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-14 backdrop-blur-xs transition-opacity sm:pt-20"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="lu-glass-bar w-full max-w-[640px] overflow-hidden rounded-2xl border border-[var(--glass-border)] text-[var(--text-main)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Thanh nhập liệu tìm kiếm toàn cục */}
        <div className="flex items-center gap-3 border-b border-[var(--border-hairline)] px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
          <label htmlFor={inputId} className="sr-only">
            Tìm bài giảng, thuật ngữ, vở bảng viết, đề soạn hoặc chạy lệnh nhanh
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Tìm bài giảng, vở Bảng viết, đề soạn, thuật ngữ hoặc lệnh nhanh (VD: nhom thuong, tap giang)..."
            className="w-full bg-transparent text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />

          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveIndex(0);
                inputRef.current?.focus();
              }}
              className="shrink-0 cursor-pointer rounded-md px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
            >
              Xóa
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Đóng bảng lệnh (ESC)"
            className="shrink-0 cursor-pointer rounded-md border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-muted)] uppercase transition-colors hover:text-[var(--text-main)]"
          >
            ESC
          </button>
        </div>

        {/* Thanh lọc phân mục nhanh (hỗ trợ bấm chuột hoặc nhấn phím Tab) */}
        <div
          data-testid="os-cmd-filter-bar"
          className="flex items-center gap-1 overflow-x-auto border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/55 px-3 py-1.5"
        >
          {SCOPE_TABS.map((tab) => {
            const selected = activeScope === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                data-testid={`os-cmd-scope-${tab.key}`}
                aria-pressed={selected}
                onClick={() => {
                  setActiveScope(tab.key);
                  setActiveIndex(0);
                  inputRef.current?.focus();
                }}
                className={cn(
                  'shrink-0 cursor-pointer rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors',
                  selected
                    ? 'bg-[var(--accent-os)] text-white shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]',
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Danh sách kết quả đa nguồn */}
        <div
          id={listboxId}
          role="listbox"
          aria-label="Kết quả bảng lệnh"
          className="custom-scrollbar max-h-[56vh] overflow-y-auto px-2 py-2"
        >
          {flatItems.length > 0 ? (
            <div className="space-y-3">
              {groups.map((section) => {
                const GroupIcon = section.icon;
                return (
                  <div key={section.key} className="space-y-0.5">
                    <div className="flex items-center gap-1.5 px-2.5 py-1">
                      <GroupIcon
                        className="h-3.5 w-3.5 text-[var(--text-muted)]"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-[10.5px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                        {section.label}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const idx = flatItems.findIndex((entry) => entry.id === item.id);
                        const isSelected = idx === safeActiveIndex;
                        return (
                          <button
                            key={item.id}
                            ref={(el) => {
                              if (el) optionRefs.current.set(item.id, el);
                              else optionRefs.current.delete(item.id);
                            }}
                            id={`os-cmd-option-${item.id}`}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => handleSelectItem(item)}
                            className={cn(
                              'flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-2.5 py-2 text-left transition-colors',
                              isSelected
                                ? 'bg-[var(--bg-surface)] text-[var(--text-main)] ring-1 ring-[var(--border-hairline)]'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]/70 hover:text-[var(--text-main)]',
                            )}
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-2.5">
                              {renderItemLeading(item, isSelected)}

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[13.5px] font-medium text-[var(--text-main)]">
                                  {item.title}
                                </p>
                                {item.subtitle && (
                                  <p className="truncate text-[11.5px] text-[var(--text-muted)]">
                                    {item.subtitle}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              {item.badge && (
                                <span className="rounded-md border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)]">
                                  {item.badge}
                                </span>
                              )}
                              {isSelected && (
                                <CornerDownLeft
                                  className="h-3.5 w-3.5 text-[var(--accent-os)]"
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
            <div className="px-6 py-10 text-center">
              <p className="text-sm font-medium text-[var(--text-main)]">
                Không tìm thấy kết quả phù hợp cho &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Thử chuyển bộ lọc sang &ldquo;Tất cả&rdquo; hoặc gõ không dấu như &ldquo;nhom
                thuong&rdquo;, &ldquo;tap giang&rdquo;, &ldquo;vo toan&rdquo;.
              </p>
            </div>
          )}
        </div>

        {/* Chân hộp lệnh */}
        <div className="flex items-center justify-between border-t border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2 text-[11px] text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 font-mono text-[10px]">
                ↑
              </kbd>
              <kbd className="rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 font-mono text-[10px]">
                ↓
              </kbd>
              <span>Chọn</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 font-mono text-[10px]">
                Tab
              </kbd>
              <span>Lọc nhóm</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>
              <span>Thực thi</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-1.5 py-0.5 font-mono text-[10px]">
                Esc
              </kbd>
              <span>Đóng</span>
            </span>
          </div>
          <span className="hidden font-mono text-[10px] tracking-wider uppercase sm:inline">
            Academic OS · ⌘K
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
