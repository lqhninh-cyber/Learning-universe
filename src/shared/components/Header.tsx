import { ChevronDown, Eye, EyeOff, Menu, Play, Search, X } from 'lucide-react';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  getLessonById,
  getLessonBySlug,
  resolveLessonShortcut,
  type LessonLocation,
} from '@/content-runtime';
import { type ReadingFontSize, useReadingSettings } from '@/context/ReadingSettingsContext';
import { useAuth } from '@/features/auth';
import { type LastVisitedEntry, useLearningStore } from '@/features/learning';
import { CommandPalette } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { EightPetalBrandMark } from './header/EightPetalBrandMark';
import { HeaderAccountMenu } from './header/HeaderAccountMenu';
import { HeaderMegaMenu } from './header/HeaderMegaMenu';
import { HeaderMobileDrawer } from './header/HeaderMobileDrawer';

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
    fontSize,
    setFontSize,
    increaseFontSize,
    decreaseFontSize,
    isSkimmingMode,
    toggleSkimmingMode,
  } = useReadingSettings();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
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

  const activeTheme = propReadingTheme ?? (isLessonPage ? readingTheme : 'light');
  const isDark = propDarkLesson ?? activeTheme === 'dark';
  const isSepia = activeTheme === 'sepia';

  // Đóng các menu thả nổi và đặt lại trạng thái ngữ cảnh khi đổi đường dẫn
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setIsMegaMenuOpen(false);
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
        setIsMegaMenuOpen(false);
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
        setIsMegaMenuOpen(false);
        setIsAccountMenuOpen(false);
        setIsLessonMenuPinned(false);
        setIsLessonMenuHovered(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectFontSize = (scale: ReadingFontSize) => {
    setFontSize(scale);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-reading-size', scale);
    }
  };

  const handleDecreaseFontSize = () => {
    decreaseFontSize();
  };

  const handleIncreaseFontSize = () => {
    increaseFontSize();
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

  const quickResume = useMemo(() => {
    if (isLessonPage) return null;
    const entry = lastVisitedGlobal ?? readPersistedLastVisited();
    if (!entry?.lessonId) return null;
    const loc = getLessonById(entry.lessonId);
    if (!loc) return null;
    return {
      label: formatQuickResumeLabel(loc),
      to: ROUTES.lesson(loc.subject.slug, loc.chapter.slug, loc.lesson.slug),
    };
  }, [isLessonPage, lastVisitedGlobal]);

  const isUserLoggedIn = isAuthenticated || isStoreAuthenticated;
  const completedCount = Object.keys(completedLessons).length;

  const isHomeActive = pathname === ROUTES.home;
  const isGlossaryActive = pathname === ROUTES.glossary || pathname === '/glossary';
  const isLearningSpaceActive =
    isMegaMenuOpen ||
    pathname === ROUTES.learningSpace ||
    pathname.startsWith('/mon-hoc/') ||
    (pathname.startsWith('/courses/') && pathname !== ROUTES.courses);

  const showReadingContextBar =
    isLessonPage &&
    isScrolledInLesson &&
    !isLessonMenuPinned &&
    !isLessonMenuHovered &&
    !isMegaMenuOpen;

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
      'relative inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-[15px] font-semibold tracking-tight whitespace-nowrap transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-[#B89762] focus-visible:outline-none active:scale-[0.98] xl:px-4',
      active
        ? isDark
          ? 'bg-[#D4B47A]/20 text-[#F4F1EA]'
          : 'bg-[#213B34] text-[#F6F4EE] shadow-sm dark:bg-[#D4B47A]/20 dark:text-[#F4F1EA]'
        : isDark
          ? 'text-[#C4D4CE] hover:bg-white/[0.08] hover:text-[#F4F1EA]'
          : 'text-[#425650] hover:bg-[#EAE6DC] hover:text-[#1D332E] dark:text-[#C4D4CE] dark:hover:bg-white/[0.08] dark:hover:text-[#F4F1EA]',
    );

  const activeSealDot = (
    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4B47A]" aria-hidden="true" />
  );

  return (
    <>
      <header
        ref={mastheadRef}
        onMouseLeave={() => setIsMegaMenuOpen(false)}
        className={cn(
          'lu-site-header sticky top-3 z-50 mx-auto -mb-[66px] flex h-[66px] w-[min(94vw,1520px)] items-center rounded-full border px-5 backdrop-blur-xl transition-colors duration-200 print:hidden',
          isDark
            ? 'border-[#B89762]/25 bg-[#10241F]/94 text-[#F4F1EA] shadow-[0_12px_36px_rgba(6,16,14,0.42)]'
            : isSepia
              ? 'border-[#D5CFC2]/80 bg-[#F7F5EF]/95 text-[#1D332E] shadow-[0_8px_28px_rgba(24,42,36,0.08)]'
              : 'border-[#D5CFC2]/80 bg-[#F7F5EF]/90 text-[#1D332E] shadow-[0_8px_28px_rgba(24,42,36,0.08)] dark:border-[#B89762]/25 dark:bg-[#10241F]/94 dark:text-[#F4F1EA]',
          className,
        )}
      >
        {/* NGĂN 1 — THƯƠNG HIỆU (Trái) */}
        <Link
          to={ROUTES.home}
          aria-label="LEARNING UNIVERSE"
          className="flex h-full shrink-0 cursor-pointer items-center pr-3 pl-1 transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#B89762] focus-visible:outline-none md:pr-4"
        >
          <EightPetalBrandMark roseRef={roseRef} isDark={isDark} isSepia={isSepia} />
        </Link>

        {/* Vách ngăn mảnh 1 */}
        <div
          className="hidden h-6 w-[1px] shrink-0 bg-[#1D332E]/12 lg:block dark:bg-white/10"
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

            <div
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              className="inline-flex shrink-0 items-center"
            >
              <Link
                to={ROUTES.learningSpace}
                tabIndex={showReadingContextBar ? -1 : undefined}
                onClick={() => {
                  setIsMegaMenuOpen(false);
                  setIsAccountMenuOpen(false);
                }}
                className={cn(navItemClass(isLearningSpaceActive), 'pr-1.5')}
              >
                {isLearningSpaceActive && activeSealDot}
                <span>Không gian học tập</span>
              </Link>
              <button
                type="button"
                tabIndex={showReadingContextBar ? -1 : undefined}
                onClick={() => {
                  setIsMegaMenuOpen((prev) => !prev);
                  setIsAccountMenuOpen(false);
                }}
                aria-label="Mở menu nhanh Không gian học tập"
                aria-expanded={isMegaMenuOpen}
                aria-haspopup="true"
                className={cn(
                  'inline-flex h-8 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[#B89762] focus-visible:outline-none',
                  isDark
                    ? 'text-[#D4B47A] hover:bg-white/[0.08]'
                    : 'text-[#425650] hover:bg-[#EAE6DC] hover:text-[#1D332E]',
                )}
              >
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 transition-transform duration-200',
                    isMegaMenuOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>

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
                  setIsMegaMenuOpen(false);
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
                  'max-w-[340px] truncate text-[14.5px] font-bold',
                  isDark ? 'text-[#F7F4EB]' : 'text-[#142B21] dark:text-[#F7F4EB]',
                )}
              >
                {lessonContextTitle}
              </span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              {/* Bật/tắt nhanh Đọc lướt định lý */}
              <button
                type="button"
                tabIndex={showReadingContextBar ? undefined : -1}
                onClick={toggleSkimmingMode}
                aria-pressed={isSkimmingMode}
                title="Đọc lướt định lý (ẩn/hiện nhanh Ví dụ & Chứng minh)"
                className={cn(
                  'inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold whitespace-nowrap transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#388E3C] focus-visible:outline-none active:scale-[0.98]',
                  isSkimmingMode
                    ? 'border-[#1B3D2F] bg-[#1B3D2F] text-white shadow-xs dark:border-[#388E3C] dark:bg-[#388E3C]'
                    : isDark
                      ? 'border-[#4E9B58]/25 bg-[#182E24] text-[#E6ECE7] hover:border-[#4E9B58]/50'
                      : 'border-[#1B3D2F]/14 bg-[var(--bg-page)] text-[#142B21] hover:border-[#1B3D2F]/35 hover:text-[#1B3D2F]',
                )}
              >
                {isSkimmingMode ? (
                  <EyeOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                )}
                <span>Đọc lướt định lý</span>
              </button>

              {/* Chỉnh nhanh cỡ chữ A− / A+ */}
              <div
                role="group"
                aria-label="Chỉnh nhanh cỡ chữ bài đọc"
                className={cn(
                  'inline-flex h-8 items-center rounded-full border p-0.5',
                  isDark
                    ? 'border-[#4E9B58]/25 bg-[#182E24]'
                    : 'border-[#1B3D2F]/14 bg-[var(--bg-page)]',
                )}
              >
                <button
                  type="button"
                  tabIndex={showReadingContextBar ? undefined : -1}
                  onClick={handleDecreaseFontSize}
                  disabled={fontSize === 'sm'}
                  aria-label="Giảm cỡ chữ"
                  className={cn(
                    'h-7 cursor-pointer rounded-full px-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35',
                    isDark
                      ? 'text-[#E6ECE7] hover:bg-white/10'
                      : 'text-[#142B21] hover:bg-[#1B3D2F]/10',
                  )}
                >
                  A−
                </button>
                <span
                  className="h-3.5 w-[1px] bg-[#1B3D2F]/15 dark:bg-white/15"
                  aria-hidden="true"
                />
                <button
                  type="button"
                  tabIndex={showReadingContextBar ? undefined : -1}
                  onClick={handleIncreaseFontSize}
                  disabled={fontSize === 'xl'}
                  aria-label="Tăng cỡ chữ"
                  className={cn(
                    'h-7 cursor-pointer rounded-full px-2 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35',
                    isDark
                      ? 'text-[#E6ECE7] hover:bg-white/10'
                      : 'text-[#142B21] hover:bg-[#1B3D2F]/10',
                  )}
                >
                  A+
                </button>
              </div>

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
          className="hidden h-6 w-[1px] shrink-0 bg-[#1D332E]/12 lg:block dark:bg-white/10"
          aria-hidden="true"
        />

        {/* NGĂN 3 — TRỢ LÝ HỌC TẬP & CÔNG CỤ (Phải) */}
        <div className="ml-auto flex shrink-0 items-center gap-2.5 pl-3">
          {/* Huy hiệu "Học tiếp" thông minh trên Trang chủ / Danh mục */}
          {quickResume && (
            <Link
              to={quickResume.to}
              className="hidden items-center gap-1.5 rounded-full border border-[#B89762]/30 bg-[#2A4B42] px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap text-[#F5EFE2] shadow-sm transition-all duration-150 hover:bg-[#213B34] focus-visible:ring-2 focus-visible:ring-[#B89762] focus-visible:outline-none active:scale-[0.98] xl:inline-flex"
            >
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
              <span>Học tiếp: {quickResume.label}</span>
            </Link>
          )}

          {/* Ô tìm kiếm viên thuốc luân phiên gợi ý (đảm bảo không chồng badge ⌘K) */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(true);
              setIsMegaMenuOpen(false);
              setIsAccountMenuOpen(false);
            }}
            aria-label="Mở tìm kiếm nhanh"
            className={cn(
              'hidden h-10 w-[210px] cursor-pointer items-center justify-between gap-2 rounded-full border px-4 text-left text-[13px] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#B89762] focus-visible:outline-none active:scale-[0.99] md:inline-flex lg:w-[240px]',
              isDark
                ? 'border-[#B89762]/25 bg-[#10241F] text-[#C4D4CE] hover:border-[#B89762]/50 hover:bg-[#152C26]'
                : 'border-[#D5CFC2]/90 bg-[#EFECE3]/90 text-[#425650] hover:border-[#B89762]/50 hover:bg-white/90 hover:text-[#1D332E] dark:border-[#B89762]/25 dark:bg-[#10241F] dark:text-[#C4D4CE]',
            )}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <Search
                className={cn('h-3.5 w-3.5 shrink-0', isDark ? 'text-[#D4B47A]' : 'text-[#526B63]')}
                aria-hidden="true"
              />
              <span key={searchHintIndex} className="block truncate pr-2 font-medium">
                {ROTATING_SEARCH_HINTS[searchHintIndex]}
              </span>
            </span>
            <kbd className="shrink-0 rounded-full border border-[#D5CFC2] bg-[#F7F5EF] px-2 py-0.5 text-[11px] font-medium text-[#425650] dark:border-white/15 dark:bg-white/10 dark:text-[#C4D4CE]">
              ⌘K
            </kbd>
          </button>

          {/* Tài khoản & cài đặt */}
          <HeaderAccountMenu
            isOpen={isAccountMenuOpen}
            onToggle={() => {
              setIsAccountMenuOpen((prev) => !prev);
              setIsMegaMenuOpen(false);
            }}
            onClose={() => setIsAccountMenuOpen(false)}
            isDark={isDark}
            isSepia={isSepia}
            isAdmin={isAdmin}
            isUserLoggedIn={isUserLoggedIn}
            completedCount={completedCount}
            fontSize={fontSize}
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
            isSkimmingMode={isSkimmingMode}
            onToggleSkimmingMode={toggleSkimmingMode}
            fontSize={fontSize}
            onDecreaseFontSize={handleDecreaseFontSize}
            onIncreaseFontSize={handleIncreaseFontSize}
            quickResume={quickResume}
            isUserLoggedIn={isUserLoggedIn}
            onOpenAuthModal={openAuthModal}
            onSignOut={handleSignOut}
          />
        </div>

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

        {/* DROPDOWN "KHÔNG GIAN HỌC TẬP" */}
        {isMegaMenuOpen && (
          <HeaderMegaMenu
            isDark={isDark}
            isSepia={isSepia}
            onClose={() => setIsMegaMenuOpen(false)}
          />
        )}
      </header>

      {/* Hộp thoại Tìm kiếm Học thuật Tức thì (Command Palette ⌘K / Ctrl+K) */}
      <CommandPalette open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Header;
