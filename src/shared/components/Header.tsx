import { Bell, CheckCircle2, Menu, Search, Sparkles, X } from 'lucide-react';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  getLessonById,
  getLessonBySlug,
  resolveLessonShortcut,
  type LessonLocation,
} from '@/content-runtime';
import {
  fontScaleToReadingSize,
  getIslandSubjectByIdOrSlug,
  readingSizeToFontScale,
} from '@/context/island-helpers';
import { useIsland } from '@/context/IslandContext';
import { type ReadingFontSize } from '@/context/ReadingSettingsContext';
import { useAuth } from '@/features/auth';
import { type LastVisitedEntry, useLearningStore } from '@/features/learning';
import { CommandPalette } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { EightPetalBrandMark } from './header/EightPetalBrandMark';
import { HeaderAccountMenu } from './header/HeaderAccountMenu';
import { HeaderMobileDrawer } from './header/HeaderMobileDrawer';
import { HeaderPomodoroTimer } from './header/HeaderPomodoroTimer';
import { HeaderQuickReaderControls } from './header/HeaderQuickReaderControls';
import { HeaderResumePreview, type ResumePreviewData } from './header/HeaderResumePreview';

export interface HeaderProps {
  readonly isDarkLesson?: boolean;
  readonly readingTheme?: 'light' | 'dark' | 'sepia';
  readonly className?: string;
}

const ROTATING_SEARCH_HINTS: readonly string[] = [
  'Tìm: Nhóm Klein V₄...',
  'Tìm: Siêu phẳng kính...',
  'Tìm: Tâm tỉ cự...',
];

const LESSON_SCROLL_THRESHOLD_PX = 200;

function readPersistedLastVisited(): LastVisitedEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem('learning-universe-storage-v1');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { lastVisitedGlobal?: LastVisitedEntry | null };
    };
    return parsed?.state?.lastVisitedGlobal ?? null;
  } catch {
    return null;
  }
}

function resolveLessonFromPathname(pathname: string): LessonLocation | undefined {
  const fullMatch = pathname.match(/^\/(?:mon-hoc|courses)\/([^/]+)\/([^/]+)\/([^/]+)\/?$/);
  if (fullMatch) {
    const [, subjectSlug, chapterSlug, lessonSlug] = fullMatch;
    if (subjectSlug && chapterSlug && lessonSlug) {
      return (
        getLessonBySlug(subjectSlug, chapterSlug, lessonSlug) ?? resolveLessonShortcut(lessonSlug)
      );
    }
  }

  const shortcutMatch = pathname.match(/^\/bai-hoc\/([^/]+)\/?$/);
  if (shortcutMatch?.[1]) {
    return resolveLessonShortcut(shortcutMatch[1]);
  }

  return undefined;
}

function formatQuickResumeLabel(location: LessonLocation): string {
  const titleMatch = location.lesson.title.match(/^(Bài\s+\d+(?:\.\d+)?)/i);
  if (titleMatch?.[1]) {
    return titleMatch[1];
  }
  return `Bài ${location.chapter.number}.${location.lesson.number}`;
}

function computePageReadingProgress(): number {
  if (typeof window === 'undefined' || typeof document === 'undefined') return 0;

  const target = document.querySelector<HTMLElement>('main article');
  if (target) {
    const rect = target.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const scrollable = rect.height - viewport;
    if (scrollable > 0) {
      return Math.min(1, Math.max(0, -rect.top / scrollable));
    }
  }

  const docEl = document.documentElement;
  const maxScroll = docEl.scrollHeight - (window.innerHeight || docEl.clientHeight);
  if (maxScroll <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / maxScroll));
}

export const Header: FC<HeaderProps> = ({
  isDarkLesson: propDarkLesson,
  readingTheme: propReadingTheme,
  className,
}) => {
  const { isAuthenticated, isAdmin, openAuthModal, signOut } = useAuth();

  const isStoreAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);
  const signOutLearnerMode = useLearningStore((state) => state.signOutLearnerMode);

  const {
    activeNotice,
    activeSubject,
    readerSettings,
    setFontScale,
    increaseFontScale,
    decreaseFontScale,
    setRoutePathname,
    dismissIslandNotice,
  } = useIsland();
  const activeFontSize = fontScaleToReadingSize(readerSettings.fontScale);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolledInLesson, setIsScrolledInLesson] = useState(false);
  const [isLessonMenuPinned, setIsLessonMenuPinned] = useState(false);
  const [isLessonMenuHovered, setIsLessonMenuHovered] = useState(false);
  const [searchHintIndex, setSearchHintIndex] = useState(0);

  const mastheadRef = useRef<HTMLElement>(null);
  const roseRef = useRef<SVGSVGElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    setRoutePathname(pathname);
  }, [pathname, setRoutePathname]);

  const isLessonPage =
    /^\/(mon-hoc|courses)\/[^/]+\/[^/]+\/[^/]+\/?$/.test(pathname) ||
    /^\/bai-hoc\/[^/]+\/?$/.test(pathname) ||
    pathname === '/dev/mdx';

  const [readingTheme, setReadingTheme] = useState<'light' | 'dark' | 'sepia'>(() => {
    if (propReadingTheme) return propReadingTheme;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light' || saved === 'sepia') return saved;
      } catch {
        // Bỏ qua lỗi storage
      }
    }
    return 'light';
  });

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<'light' | 'dark' | 'sepia'>;
      if (custom.detail === 'light' || custom.detail === 'dark' || custom.detail === 'sepia') {
        setReadingTheme(custom.detail);
      } else {
        try {
          const saved = localStorage.getItem('lu_reading_theme');
          if (saved === 'dark' || saved === 'light' || saved === 'sepia') {
            setReadingTheme(saved);
          }
        } catch {
          // Bỏ qua lỗi storage
        }
      }
    };
    window.addEventListener('lu_reading_theme_change', handleThemeChange);
    return () => window.removeEventListener('lu_reading_theme_change', handleThemeChange);
  }, []);

  const activeTheme =
    propReadingTheme ??
    (isLessonPage
      ? readerSettings.isDarkMode
        ? 'dark'
        : readingTheme === 'dark'
          ? 'light'
          : readingTheme
      : 'light');
  const isDark = propDarkLesson ?? activeTheme === 'dark';
  const isSepia = activeTheme === 'sepia';

  // Đóng các menu thả nổi và đặt lại trạng thái ngữ cảnh khi đổi đường dẫn
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
    setIsLessonMenuPinned(false);
    setIsLessonMenuHovered(false);
  }

  // Luân phiên câu gợi ý trong ô tìm kiếm mỗi 4 giây
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const intervalId = window.setInterval(() => {
      setSearchHintIndex((prev) => (prev + 1) % ROTATING_SEARCH_HINTS.length);
    }, 4000);
    return () => window.clearInterval(intervalId);
  }, []);

  // Lắng nghe cuộn trang 60fps bằng passive: true + requestAnimationFrame
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rafId = 0;

    const syncScrollVisuals = () => {
      rafId = 0;
      const y = window.scrollY || 0;

      const nextInLessonScrolled = isLessonPage && y > LESSON_SCROLL_THRESHOLD_PX;
      setIsScrolledInLesson((prev) => {
        if (prev === nextInLessonScrolled) return prev;
        if (!nextInLessonScrolled) {
          setIsLessonMenuPinned(false);
          setIsLessonMenuHovered(false);
        }
        return nextInLessonScrolled;
      });

      if (isLessonPage && progressBarRef.current) {
        const ratio = computePageReadingProgress();
        progressBarRef.current.style.transform = `translate3d(0px, 0px, 0px) scaleX(${ratio.toFixed(4)})`;
      }
    };

    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(syncScrollVisuals);
    };

    syncScrollVisuals();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (rafId !== 0) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isLessonPage, pathname]);

  // Đóng dropdown khi nhấp ra bên ngoài thanh Masthead
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mastheadRef.current && !mastheadRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng menu thả nổi khi nhấn phím Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
        setIsLessonMenuPinned(false);
        setIsLessonMenuHovered(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectFontSize = (scale: ReadingFontSize) => {
    setFontScale(readingSizeToFontScale(scale));
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-reading-size', scale);
    }
  };

  const handleDecreaseFontSize = () => {
    decreaseFontScale();
  };

  const handleIncreaseFontSize = () => {
    increaseFontScale();
  };

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false);
    signOutLearnerMode();
    await signOut();
  };

  const currentLessonLocation = useMemo(
    () => (isLessonPage ? resolveLessonFromPathname(pathname) : undefined),
    [isLessonPage, pathname],
  );

  const quickResume = useMemo<ResumePreviewData | null>(() => {
    if (isLessonPage) return null;
    const entry = lastVisitedGlobal ?? readPersistedLastVisited();
    if (!entry?.lessonId) return null;
    const loc = getLessonById(entry.lessonId);
    if (!loc) return null;
    const subjectMeta =
      getIslandSubjectByIdOrSlug(loc.subject.slug) ?? getIslandSubjectByIdOrSlug(loc.subject.id);
    return {
      label: formatQuickResumeLabel(loc),
      to: ROUTES.lesson(loc.subject.slug, loc.chapter.slug, loc.lesson.slug),
      lessonId: loc.lesson.id,
      subjectName: subjectMeta?.name ?? loc.subject.title,
      subjectAccentColor: subjectMeta?.accentColor ?? '#3B7A65',
      chapterNumber: loc.chapter.number,
      lessonTitle: loc.lesson.title,
      isCompleted: Boolean(completedLessons[loc.lesson.id]),
    };
  }, [completedLessons, isLessonPage, lastVisitedGlobal]);

  const isUserLoggedIn = isAuthenticated || isStoreAuthenticated;
  const completedCount = Object.keys(completedLessons).length;

  const isHomeActive = pathname === ROUTES.home;
  const isGlossaryActive = pathname === ROUTES.glossary || pathname === '/glossary';
  const isLearningSpaceActive =
    pathname === ROUTES.learningSpace ||
    pathname.startsWith('/mon-hoc/') ||
    (pathname.startsWith('/courses/') && pathname !== ROUTES.courses);

  const showReadingContextBar =
    isLessonPage && isScrolledInLesson && !isLessonMenuPinned && !isLessonMenuHovered;

  const chapterContextBadge = currentLessonLocation
    ? `Ch.${currentLessonLocation.chapter.number}`
    : pathname === '/dev/mdx'
      ? 'Dev'
      : 'Bài học';
  const chapterTooltipTitle = currentLessonLocation
    ? `Chương ${currentLessonLocation.chapter.number}: ${currentLessonLocation.chapter.title}`
    : undefined;
  const lessonContextTitle =
    currentLessonLocation?.lesson.title ??
    (pathname === '/dev/mdx' ? 'Trình kiểm thử MDX & KaTeX' : 'Nội dung bài học');

  const navItemClass = (active: boolean) =>
    cn(
      'relative inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-[15px] font-semibold tracking-tight whitespace-nowrap transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none active:scale-[0.98] xl:px-4',
      active
        ? isDark
          ? 'bg-[#9EC5B8]/18 text-[#EBF0EE]'
          : 'bg-[#1E332E] text-[#FAFBF9] shadow-sm dark:bg-[#9EC5B8]/18 dark:text-[#EBF0EE]'
        : isDark
          ? 'text-[#B8C7C2] hover:bg-white/[0.08] hover:text-[#EBF0EE]'
          : 'text-[#4A5D58] hover:bg-[#E7ECEA] hover:text-[#182624] dark:text-[#B8C7C2] dark:hover:bg-white/[0.08] dark:hover:text-[#EBF0EE]',
    );

  const activeSealDot = (
    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#9EC5B8]" aria-hidden="true" />
  );

  return (
    <>
      <header
        ref={mastheadRef}
        className={cn(
          'lu-site-header sticky top-3 z-50 mx-auto -mb-[66px] flex h-[66px] w-[min(94vw,1520px)] items-center rounded-full border px-4 backdrop-blur-xl transition-all duration-300 ease-out xl:px-5 print:hidden',
          activeNotice && 'py-1 ring-2 ring-[#9EC5B8]/35',
          isDark
            ? 'border-[#9E845A]/30 bg-[#0D211D]/94 text-[#EBF0EE] shadow-[0_12px_36px_rgba(6,16,14,0.42)]'
            : isSepia
              ? 'border-[#D8E0DD] bg-[#FAFBF9]/95 text-[#182624] shadow-[0_8px_28px_rgba(24,38,36,0.06)]'
              : 'border-[#D8E0DD] bg-[#FAFBF9]/90 text-[#182624] shadow-[0_8px_28px_rgba(24,38,36,0.06)] dark:border-[#9E845A]/30 dark:bg-[#0D211D]/94 dark:text-[#EBF0EE]',
          className,
        )}
      >
        {/* NGĂN 1 — THƯƠNG HIỆU (Trái) */}
        <Link
          to={ROUTES.home}
          aria-label="LEARNING UNIVERSE"
          className="flex h-full shrink-0 cursor-pointer items-center pr-3 pl-1 transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none md:pr-4"
        >
          <EightPetalBrandMark roseRef={roseRef} isDark={isDark} isSepia={isSepia} />
        </Link>

        {/* Vách ngăn mảnh 1 */}
        <div
          className="hidden h-6 w-[1px] shrink-0 bg-[#182624]/10 lg:block dark:bg-white/10"
          aria-hidden="true"
        />

        {/* NGĂN 2 — ĐIỀU HƯỚNG VIÊN THUỐC / THANH NGỮ CẢNH BÀI ĐỌC (Giữa) */}
        <div
          onMouseLeave={() => setIsLessonMenuHovered(false)}
          className="relative hidden h-full min-w-0 flex-1 items-center justify-center overflow-hidden px-2 lg:flex xl:px-4"
        >
          {/* Lớp A: Menu điều hướng chính */}
          <nav
            aria-label="Điều hướng chính"
            aria-hidden={showReadingContextBar}
            className={cn(
              'flex h-full w-full items-center justify-center gap-1 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] xl:gap-1.5',
              showReadingContextBar
                ? 'pointer-events-none -translate-y-3 opacity-0'
                : 'pointer-events-auto translate-y-0 opacity-100',
            )}
          >
            <Link
              to={ROUTES.home}
              tabIndex={showReadingContextBar ? -1 : undefined}
              className={navItemClass(isHomeActive)}
            >
              {isHomeActive && activeSealDot}
              <span>Trang chủ</span>
            </Link>

            <Link
              to={ROUTES.learningSpace}
              tabIndex={showReadingContextBar ? -1 : undefined}
              onClick={() => setIsAccountMenuOpen(false)}
              className={navItemClass(isLearningSpaceActive)}
            >
              {isLearningSpaceActive && activeSealDot}
              <span>Không gian học tập</span>
              {activeSubject && (
                <span
                  data-testid="island-subject-badge"
                  className="inline-flex items-center gap-1.5 transition-all duration-300"
                >
                  <span aria-hidden="true" className="opacity-50">
                    ·
                  </span>
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: activeSubject.accentColor }}
                    aria-hidden="true"
                  />
                  <span className="font-mono text-xs font-bold tracking-wide">
                    {activeSubject.code}
                  </span>
                </span>
              )}
            </Link>

            <Link
              to="/glossary"
              tabIndex={showReadingContextBar ? -1 : undefined}
              className={navItemClass(isGlossaryActive)}
            >
              {isGlossaryActive && activeSealDot}
              <span>Thuật ngữ</span>
            </Link>

            {isLessonPage && isScrolledInLesson && isLessonMenuPinned && (
              <button
                type="button"
                onClick={() => {
                  setIsLessonMenuPinned(false);
                  setIsLessonMenuHovered(false);
                }}
                aria-label="Quay lại thanh ngữ cảnh bài đọc"
                className="ml-1 inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#1B3D2F]/18 px-2.5 py-1 text-xs font-semibold text-[#1B3D2F] transition-colors hover:bg-[#1B3D2F]/8 dark:border-[#4E9B58]/35 dark:text-[#86EFAC]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Bài đọc</span>
              </button>
            )}
          </nav>

          {/* Lớp B: Thanh Ngữ Cảnh Bài Đọc (Morph khi cuộn > 200px trong bài học) */}
          <div
            data-testid="reading-context-bar"
            aria-hidden={!showReadingContextBar}
            className={cn(
              'absolute inset-0 flex items-center justify-between gap-2.5 px-2 transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] xl:px-4',
              showReadingContextBar
                ? 'pointer-events-auto translate-y-0 opacity-100'
                : 'pointer-events-none translate-y-3 opacity-0',
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span
                title={chapterTooltipTitle}
                className="shrink-0 rounded-full border border-[#1B3D2F]/16 bg-[#1B3D2F]/[0.07] px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#1B3D2F] dark:border-[#4E9B58]/30 dark:bg-[#4E9B58]/15 dark:text-[#86EFAC]"
              >
                {chapterContextBadge}
              </span>
              <span
                title={lessonContextTitle}
                className={cn(
                  'max-w-[440px] truncate text-[14.5px] font-bold xl:max-w-[520px]',
                  isDark ? 'text-[#F7F4EB]' : 'text-[#142B21] dark:text-[#F7F4EB]',
                )}
              >
                {lessonContextTitle}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {/* Nút bật lại Menu điều hướng chính */}
              <button
                type="button"
                tabIndex={showReadingContextBar ? undefined : -1}
                onMouseEnter={() => setIsLessonMenuHovered(true)}
                onClick={() => setIsLessonMenuPinned(true)}
                aria-label="Mở menu điều hướng chính"
                className={cn(
                  'inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border px-3 text-xs font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[#388E3C] focus-visible:outline-none',
                  isDark
                    ? 'border-[#4E9B58]/25 bg-[#182E24] text-[#E6ECE7] hover:border-[#4E9B58]/50'
                    : 'border-[#1B3D2F]/14 bg-[var(--bg-page)] text-[#142B21] hover:border-[#1B3D2F]/35 hover:text-[#1B3D2F]',
                )}
              >
                <Menu className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Menu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vách ngăn mảnh 2 */}
        <div
          className="hidden h-6 w-[1px] shrink-0 bg-[#182624]/10 lg:block dark:bg-white/10"
          aria-hidden="true"
        />

        {/* NGĂN 3 — TRỢ LÝ HỌC TẬP & CÔNG CỤ (Phải) */}
        <div className="ml-auto flex shrink-0 items-center gap-2 pl-2 xl:gap-2.5 xl:pl-3">
          {/* Huy hiệu "Học tiếp" + Thẻ Kính Mờ Xem Trước trên Trang chủ / Danh mục */}
          {quickResume && <HeaderResumePreview data={quickResume} />}

          {/* Cụm điều khiển đọc nhanh A- / A+ / Chế độ Dịu mắt (Chỉ hiển thị khi đang ở Chi tiết Bài học) */}
          {isLessonPage && <HeaderQuickReaderControls isDark={isDark} />}

          {/* Ô tìm kiếm: thu gọn thành nút tròn 36px khi ở trang Chi tiết Bài học để tối ưu chiều ngang 1280px */}
          {isLessonPage ? (
            <button
              type="button"
              data-testid="compact-search-trigger"
              onClick={() => {
                setIsSearchOpen(true);
                setIsAccountMenuOpen(false);
              }}
              aria-label="Mở tìm kiếm nhanh"
              title="Tìm kiếm (⌘K)"
              className={cn(
                'hidden h-9 w-9 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none active:scale-[0.98] md:inline-flex',
                isDark
                  ? 'border-[#9E845A]/30 bg-[#0D211D] text-[#9EC5B8] hover:border-[#9EC5B8]/50 hover:bg-[#112624]'
                  : 'border-[#D8E0DD] bg-[#EDF1EF] text-[#4A5D58] hover:border-[#9EC5B8]/60 hover:bg-[#FAFBF9] hover:text-[#182624]',
              )}
            >
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsSearchOpen(true);
                setIsAccountMenuOpen(false);
              }}
              aria-label="Mở tìm kiếm nhanh"
              className={cn(
                'hidden h-10 w-[210px] cursor-pointer items-center justify-between gap-2 rounded-full border px-4 text-left text-[13px] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#9E845A] focus-visible:outline-none active:scale-[0.99] md:inline-flex lg:w-[240px]',
                isDark
                  ? 'border-[#9E845A]/30 bg-[#0D211D] text-[#B8C7C2] hover:border-[#9EC5B8]/50 hover:bg-[#112624]'
                  : 'border-[#D8E0DD] bg-[#EDF1EF] text-[#182624] hover:border-[#9EC5B8]/60 hover:bg-[#FAFBF9] dark:border-[#9E845A]/30 dark:bg-[#0D211D] dark:text-[#B8C7C2]',
              )}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <Search
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    isDark ? 'text-[#9EC5B8]' : 'text-[#4A5D58]',
                  )}
                  aria-hidden="true"
                />
                <span key={searchHintIndex} className="block truncate pr-2 font-medium">
                  {ROTATING_SEARCH_HINTS[searchHintIndex]}
                </span>
              </span>
              <kbd className="shrink-0 rounded-full border border-[#D8E0DD] bg-[#FAFBF9] px-2 py-0.5 text-[11px] font-medium text-[#4A5D58] dark:border-white/15 dark:bg-white/10 dark:text-[#B8C7C2]">
                ⌘K
              </kbd>
            </button>
          )}

          {/* Bộ đếm nhịp học tập sâu Pomodoro tối giản */}
          <HeaderPomodoroTimer isDark={isDark} />

          {/* Tài khoản & cài đặt */}
          <HeaderAccountMenu
            isOpen={isAccountMenuOpen}
            onToggle={() => {
              setIsAccountMenuOpen((prev) => !prev);
            }}
            onClose={() => setIsAccountMenuOpen(false)}
            isDark={isDark}
            isSepia={isSepia}
            isAdmin={isAdmin}
            isUserLoggedIn={isUserLoggedIn}
            completedCount={completedCount}
            fontSize={activeFontSize}
            onSelectFontSize={handleSelectFontSize}
            onOpenAuthModal={openAuthModal}
            onEnableLearnerMode={enableLearnerMode}
            onSignOut={handleSignOut}
          />

          {/* Menu di động (< 1024px) */}
          <HeaderMobileDrawer
            open={isMobileMenuOpen}
            onOpenChange={setIsMobileMenuOpen}
            isDark={isDark}
            isLessonPage={isLessonPage}
            fontSize={activeFontSize}
            onDecreaseFontSize={handleDecreaseFontSize}
            onIncreaseFontSize={handleIncreaseFontSize}
            quickResume={quickResume}
            isUserLoggedIn={isUserLoggedIn}
            onOpenAuthModal={openAuthModal}
            onSignOut={handleSignOut}
          />
        </div>

        {/* LỚP PHỦ THÔNG BÁO ĐỘNG ĐỒNG TÂM TRONG LÒNG ISLAND (DYNAMIC ISLAND MICRO-NOTIFICATIONS) */}
        {activeNotice && (
          <div
            key={activeNotice.id}
            role="status"
            aria-live="polite"
            data-testid="island-notice-banner"
            onClick={dismissIslandNotice}
            className="pointer-events-auto absolute top-1/2 left-1/2 z-50 flex max-w-[min(88vw,560px)] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2.5 overflow-hidden rounded-full bg-[#1E332E] px-4 py-1.5 text-xs font-semibold text-[#FAFBF9] shadow-md transition-all duration-300 ease-out"
          >
            {activeNotice.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#6EE7B7]" aria-hidden="true" />
            ) : activeNotice.type === 'timer' ? (
              <Bell className="h-4 w-4 shrink-0 text-[#FCD34D]" aria-hidden="true" />
            ) : (
              <Sparkles
                className="h-4 w-4 shrink-0 text-[#9EC5B8]"
                style={activeNotice.accentColor ? { color: activeNotice.accentColor } : undefined}
                aria-hidden="true"
              />
            )}
            <span className="truncate">{activeNotice.text}</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-3 bottom-0 h-[1.5px] origin-left rounded-full bg-[#6EE7B7]/80"
              style={{ animation: 'lu-notice-countdown 2200ms linear forwards' }}
            />
          </div>
        )}

        {/* THANH TIẾN ĐỘ ĐỌC TÍCH HỢP DƯỚI ĐÁY BAR (Khi ở Trang bài học) */}
        {isLessonPage && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-8 bottom-0 left-8 h-[2.5px] overflow-hidden rounded-full bg-[#1B3D2F]/10 dark:bg-white/10"
          >
            <div
              ref={progressBarRef}
              data-testid="header-reading-progress"
              style={{
                transform: 'translate3d(0px, 0px, 0px) scaleX(0)',
                transformOrigin: 'left center',
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(90deg, #213B34 0%, #B89762 55%, #2A4B42 100%)',
              }}
              className="h-full w-full rounded-full will-change-transform"
            />
          </div>
        )}
      </header>

      {/* Hộp thoại Tìm kiếm Học thuật Tức thì (Command Palette ⌘K / Ctrl+K) */}
      <CommandPalette open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Header;
