import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  LogIn,
  LogOut,
  Menu,
  Search,
  SlidersHorizontal,
  User,
  Users,
} from 'lucide-react';
import { type FC, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import { ReadingProgressBar } from '@/features/lesson-reader/ReadingProgressBar';
import { CommandPalette, SearchBar } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Button, Drawer } from '@/shared/ui';

export interface HeaderProps {
  readonly isDarkLesson?: boolean;
  readonly className?: string;
}

type ReadingFontScale = 'sm' | 'base' | 'lg';

export const Header: FC<HeaderProps> = ({ isDarkLesson: propDarkLesson, className }) => {
  const { isAuthenticated, isAdmin, openAuthModal, signOut } = useAuth();

  const isStoreAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);
  const signOutLearnerMode = useLearningStore((state) => state.signOutLearnerMode);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [fontScale, setFontScale] = useState<ReadingFontScale>('base');

  const capsuleRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  const isLessonPage =
    /^\/(mon-hoc|courses)\/[^/]+\/[^/]+\/[^/]+\/?$/.test(pathname) ||
    /^\/bai-hoc\/[^/]+\/?$/.test(pathname) ||
    pathname === '/dev/mdx';

  const [readingTheme, setReadingTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light') return saved;
      } catch {
        // Bỏ qua lỗi storage
      }
    }
    return 'light';
  });

  useEffect(() => {
    const handleThemeChange = (e: Event) => {
      const custom = e as CustomEvent<'light' | 'dark'>;
      if (custom.detail === 'light' || custom.detail === 'dark') {
        setReadingTheme(custom.detail);
      } else {
        const saved = localStorage.getItem('lu_reading_theme');
        if (saved === 'dark' || saved === 'light') {
          setReadingTheme(saved);
        }
      }
    };
    window.addEventListener('lu_reading_theme_change', handleThemeChange);
    return () => window.removeEventListener('lu_reading_theme_change', handleThemeChange);
  }, []);

  const isDark = propDarkLesson ?? (isLessonPage && readingTheme === 'dark');

  // Đóng các menu thả nổi khi chuyển trang
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setIsMegaMenuOpen(false);
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }

  // Tự động thích ứng độ mờ khi người dùng cuộn sâu
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Đóng dropdown khi nhấp ra bên ngoài thanh Capsule
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (capsuleRef.current && !capsuleRef.current.contains(event.target as Node)) {
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
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleApplyFontScale = (scale: ReadingFontScale) => {
    setFontScale(scale);
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-reading-size', scale);
    }
  };

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false);
    signOutLearnerMode();
    await signOut();
  };

  const isUserLoggedIn = isAuthenticated || isStoreAuthenticated;
  const completedCount = Object.keys(completedLessons).length;

  const isCoursesActive = pathname === ROUTES.courses || pathname === ROUTES.subjects;
  const isGlossaryActive = pathname === ROUTES.glossary || pathname === '/glossary';
  const isLearningSpaceActive =
    isMegaMenuOpen ||
    pathname.startsWith('/mon-hoc/') ||
    (pathname.startsWith('/courses/') && pathname !== ROUTES.courses);

  return (
    <>
      <header
        ref={capsuleRef}
        className={cn(
          'lu-site-header fixed top-4 left-1/2 z-40 flex h-14 w-[94%] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full px-6 shadow-sm backdrop-blur-xl transition-all duration-300 md:top-5 md:h-15 print:hidden',
          isDark
            ? 'border-b border-[#2A323A] bg-[#16191D]/90 text-[#E2E8F0]'
            : 'border border-[#CFDADB] bg-[#F7FAFA]/85 text-[#29383D]',
          isScrolled &&
            (isDark
              ? 'border-[#2A323A] bg-[#16191D]/98 shadow-md'
              : 'border-[#CFDADB] bg-[#F7FAFA]/95 shadow-md'),
          className,
        )}
      >
        {/* 1. CỤM LOGO (Trái) */}
        <Link
          to={ROUTES.home}
          aria-label="LEARNING UNIVERSE"
          className="flex shrink-0 cursor-pointer items-center rounded-md transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#C5A262] focus-visible:outline-none"
        >
          <Logo variant="primary" size="md" theme={isDark ? 'dark' : 'light'} />
        </Link>

        {/* 2. CỤM ĐIỀU HƯỚNG TRUNG TÂM (Giữa — Desktop) */}
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
          <Link
            to={ROUTES.home}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
              pathname === ROUTES.home
                ? isDark
                  ? 'bg-[#242C33] font-semibold text-[#F8FAFC]'
                  : 'bg-[#E1E9EA] font-semibold text-[#3F6570]'
                : isDark
                  ? 'text-[#E2E8F0] hover:bg-[#20252B] hover:text-[#F8FAFC]'
                  : 'text-[#55676B] hover:bg-[#E1E9EA]/60 hover:text-[#29383D]',
            )}
          >
            Trang chủ
          </Link>

          {/* Trigger mở Dropdown "Không gian học tập" */}
          <button
            type="button"
            onClick={() => {
              setIsMegaMenuOpen((prev) => !prev);
              setIsAccountMenuOpen(false);
            }}
            aria-expanded={isMegaMenuOpen}
            aria-haspopup="true"
            className={cn(
              'inline-flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
              isLearningSpaceActive
                ? isDark
                  ? 'bg-[#242C33] font-semibold text-[#F8FAFC]'
                  : 'bg-[#E1E9EA] font-semibold text-[#3F6570]'
                : isDark
                  ? 'text-[#E2E8F0] hover:bg-[#20252B] hover:text-[#F8FAFC]'
                  : 'text-[#55676B] hover:bg-[#E1E9EA]/60 hover:text-[#29383D]',
            )}
          >
            <span>Không gian học tập</span>
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform duration-200',
                isDark ? 'text-[#94A3B8]' : 'text-[#55676B]',
                isMegaMenuOpen && 'rotate-180',
              )}
              aria-hidden="true"
            />
          </button>

          <Link
            to={ROUTES.courses}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
              isCoursesActive
                ? isDark
                  ? 'bg-[#242C33] font-semibold text-[#F8FAFC]'
                  : 'bg-[#E1E9EA] font-semibold text-[#3F6570]'
                : isDark
                  ? 'text-[#E2E8F0] hover:bg-[#20252B] hover:text-[#F8FAFC]'
                  : 'text-[#55676B] hover:bg-[#E1E9EA]/60 hover:text-[#29383D]',
            )}
          >
            Tất cả môn học
          </Link>

          <Link
            to="/glossary"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
              isGlossaryActive
                ? isDark
                  ? 'bg-[#242C33] font-semibold text-[#F8FAFC]'
                  : 'bg-[#E1E9EA] font-semibold text-[#3F6570]'
                : isDark
                  ? 'text-[#E2E8F0] hover:bg-[#20252B] hover:text-[#F8FAFC]'
                  : 'text-[#55676B] hover:bg-[#E1E9EA]/60 hover:text-[#29383D]',
            )}
          >
            Thuật ngữ
          </Link>
        </nav>

        {/* 3. CỤM TIỆN ÍCH & TÀI KHOẢN (Phải — Desktop & Mobile Burger) */}
        <div className="flex items-center gap-2.5">
          {/* Nút kích hoạt tìm kiếm: 🔍 Tìm kiếm ⌘K */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(true);
              setIsMegaMenuOpen(false);
              setIsAccountMenuOpen(false);
            }}
            aria-label="Mở tìm kiếm nhanh"
            className={cn(
              'hidden cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all md:inline-flex',
              isDark
                ? 'border border-[#2A323A] bg-[#20252B] text-[#E2E8F0] placeholder-[#64748B] hover:bg-[#242C33]'
                : 'border border-[#CFDADB] bg-white/70 text-[#55676B] hover:border-[#71889A] hover:bg-white hover:text-[#29383D]',
            )}
          >
            <Search
              className={cn('h-3.5 w-3.5', isDark ? 'text-[#94A3B8]' : 'text-[#55676B]')}
              aria-hidden="true"
            />
            <span className={cn(isDark && 'text-[#E2E8F0]')}>Tìm kiếm</span>
            <kbd
              className={cn(
                'rounded px-1.5 py-0.5 font-mono text-[10px]',
                isDark
                  ? 'border border-[#2A323A] bg-[#16191D] text-[#94A3B8]'
                  : 'bg-[#E1E9EA] text-[#55676B]',
              )}
            >
              ⌘K
            </kbd>
          </button>

          {/* Avatar tối giản đơn sắc mở menu cá nhân (Desktop) */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => {
                setIsAccountMenuOpen((prev) => !prev);
                setIsMegaMenuOpen(false);
              }}
              aria-expanded={isAccountMenuOpen}
              aria-label="Tài khoản và cài đặt giao diện"
              className={cn(
                'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-colors',
                isDark
                  ? 'border-[#2A323A] bg-[#20252B] text-[#E2E8F0] hover:bg-[#242C33]'
                  : 'border-[#CFDADB] bg-[#E1E9EA] text-[#29383D] hover:bg-[#D7E1E2]',
              )}
            >
              <User className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Menu con của Avatar */}
            {isAccountMenuOpen && (
              <div
                role="menu"
                aria-label="Menu tài khoản và giao diện"
                className={cn(
                  'absolute top-full right-0 mt-3 w-64 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl',
                  isDark
                    ? 'border border-[#2A323A] bg-[#16191D]/95 text-[#E2E8F0]'
                    : 'border border-[#CFDADB] bg-[#F7FAFA]/95 text-[#29383D]',
                )}
              >
                {/* Mục 1: Thông tin học tập cá nhân */}
                <div className="space-y-1.5 border-b border-[#CFDADB] pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#29383D]">
                    <BookOpen className="h-3.5 w-3.5 text-[#3F6570]" aria-hidden="true" />
                    <span>Thông tin học tập cá nhân</span>
                  </div>
                  <p className="text-xs text-[#55676B]">
                    Đã hoàn thành <strong className="text-[#29383D]">{completedCount}</strong> bài
                    học trên trình duyệt này.
                  </p>
                </div>

                {/* Mục 2: Cài đặt giao diện (Cỡ chữ đọc bài) */}
                <div className="space-y-2 border-b border-[#CFDADB] py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#29383D]">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-[#3F6570]" aria-hidden="true" />
                    <span>Cài đặt giao diện</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 rounded-full border border-[#CFDADB] bg-[#E1E9EA] p-1">
                    {(
                      [
                        { id: 'sm', label: 'A-' },
                        { id: 'base', label: 'A' },
                        { id: 'lg', label: 'A+' },
                      ] as const
                    ).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleApplyFontScale(opt.id)}
                        className={cn(
                          'cursor-pointer rounded-full py-1 text-xs font-medium transition-colors',
                          fontScale === opt.id
                            ? 'bg-[#3F6570] text-white'
                            : 'text-[#55676B] hover:text-[#29383D]',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Liên kết Quản trị viên (nếu có quyền Admin) */}
                {isAdmin && (
                  <div className="border-b border-[#CFDADB] py-2">
                    <Link
                      to={ROUTES.adminUsers}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-2 rounded-2xl px-2.5 py-2 text-xs font-medium text-[#29383D] transition-colors hover:bg-[#E1E9EA]/60"
                    >
                      <Users className="h-3.5 w-3.5 text-[#55676B]" aria-hidden="true" />
                      <span>Quản lý học viên</span>
                    </Link>
                  </div>
                )}

                {/* Mục 3: Đăng nhập / Đăng xuất bên trong menu con */}
                <div className="pt-2.5">
                  {isUserLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => void handleSignOut()}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-3 py-2 text-xs font-medium text-[#29383D] transition-colors hover:bg-[#E1E9EA]/60"
                    >
                      <span>Đăng xuất</span>
                      <LogOut className="h-3.5 w-3.5 text-[#55676B]" aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          openAuthModal();
                        }}
                        className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-[#3F6570] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#345761]"
                      >
                        <span>Đăng nhập đồng bộ</span>
                        <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          enableLearnerMode();
                          setIsAccountMenuOpen(false);
                        }}
                        className="w-full cursor-pointer rounded-2xl px-3 py-1.5 text-center text-[11px] font-medium text-[#55676B] transition-colors hover:bg-[#E1E9EA]/50 hover:text-[#29383D]"
                      >
                        Bật lưu tiến độ trình duyệt
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 4. NÚT MENU 3 GẠCH TRÊN DI ĐỘNG (< 768px) */}
          <div className="md:hidden">
            <Drawer
              open={isMobileMenuOpen}
              onOpenChange={setIsMobileMenuOpen}
              side="left"
              title="LEARNING UNIVERSE"
              trigger={
                <Button variant="ghost" size="icon" aria-label="Mở menu điều hướng">
                  <Menu className="h-5 w-5 text-[#29383D]" aria-hidden="true" />
                </Button>
              }
            >
              <nav aria-label="Menu điều hướng di động" className="space-y-5">
                <SearchBar className="w-full" />

                <div className="space-y-1">
                  <Link
                    to={ROUTES.home}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl px-3.5 py-2 text-sm font-medium text-[#29383D] transition-colors hover:bg-[#E1E9EA]/50"
                  >
                    Trang chủ
                  </Link>
                  <Link
                    to={ROUTES.courses}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl px-3.5 py-2 text-sm font-medium text-[#29383D] transition-colors hover:bg-[#E1E9EA]/50"
                  >
                    Tất cả môn học
                  </Link>
                  <Link
                    to="/glossary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl px-3.5 py-2 text-sm font-medium text-[#29383D] transition-colors hover:bg-[#E1E9EA]/50"
                  >
                    Thuật ngữ
                  </Link>
                </div>

                {/* Cột 1: Toán học */}
                <div className="space-y-2 border-t border-[#CFDADB] pt-4">
                  <p className="px-3 font-mono text-[11px] font-semibold tracking-wider text-[#55676B] uppercase">
                    Toán học
                  </p>
                  <div className="space-y-1">
                    <Link
                      to={ROUTES.subjectOverview('cau-truc-dai-so')}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Cấu trúc đại số"
                      className="flex items-center justify-between rounded-2xl px-3.5 py-2 text-sm text-[#29383D] transition-colors hover:bg-[#E1E9EA]/50"
                    >
                      <span className="font-serif font-semibold text-[#29383D]">
                        Cấu trúc đại số
                      </span>
                      <span className="font-mono text-[11px] text-[#55676B]">MATH1301</span>
                    </Link>
                    <Link
                      to={ROUTES.subjectOverview('hinh-hoc-affine')}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Hình học Affine và hình học Euclide"
                      className="flex items-center justify-between rounded-2xl px-3.5 py-2 text-sm text-[#29383D] transition-colors hover:bg-[#E1E9EA]/50"
                    >
                      <span className="font-serif font-semibold text-[#29383D]">
                        Hình học Affine &amp; Euclide
                      </span>
                      <span className="font-mono text-[11px] text-[#55676B]">MATH1302</span>
                    </Link>
                    <Link
                      to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Giải tích hàm một biến"
                      className="flex items-center justify-between rounded-2xl px-3.5 py-2 text-sm text-[#29383D] transition-colors hover:bg-[#E1E9EA]/50"
                    >
                      <span className="font-serif font-semibold text-[#29383D]">
                        Giải tích hàm một biến
                      </span>
                      <span className="font-mono text-[11px] text-[#55676B]">MATH1303</span>
                    </Link>
                  </div>
                </div>

                {/* Cột 2: Khoa học Giáo dục */}
                <div className="space-y-2 border-t border-[#CFDADB] pt-4">
                  <p className="px-3 font-mono text-[11px] font-semibold tracking-wider text-[#55676B] uppercase">
                    Khoa học Giáo dục
                  </p>
                  <Link
                    to={ROUTES.subjectOverview('giao-duc-hoc')}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Giáo dục học"
                    className="flex items-center justify-between rounded-2xl px-3.5 py-2 text-sm text-[#29383D] transition-colors hover:bg-[#E1E9EA]/50"
                  >
                    <span className="font-serif font-semibold text-[#29383D]">Giáo dục học</span>
                    <span className="font-mono text-[11px] text-[#55676B]">EDUC2802</span>
                  </Link>
                </div>

                {/* Tài khoản trên di động */}
                <div className="border-t border-[#CFDADB] pt-4">
                  {isUserLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-[#CFDADB] px-4 py-2.5 text-xs font-medium text-[#29383D]"
                    >
                      <span>Đăng xuất</span>
                      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openAuthModal();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3F6570] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-[#345761]"
                    >
                      <LogIn className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Đăng nhập</span>
                    </button>
                  )}
                </div>
              </nav>
            </Drawer>
          </div>
        </div>

        {/* 5. DROPDOWN "KHÔNG GIAN HỌC TẬP" KÍNH MỜ (Frosted Mega-menu 2 Cột Thanh Lịch) */}
        {isMegaMenuOpen && (
          <div
            role="region"
            aria-label="Danh mục Không gian học tập"
            className={cn(
              'absolute top-full left-1/2 mt-3 w-[500px] max-w-[92vw] -translate-x-1/2 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl',
              isDark
                ? 'border border-[#2A323A] bg-[#16191D]/98 text-[#E2E8F0]'
                : 'border border-[#CFDADB] bg-[#F7FAFA]/95 text-[#29383D]',
            )}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Cột 1: Toán học */}
              <div className="space-y-2.5">
                <p
                  className={cn(
                    'px-2.5 font-mono text-[11px] font-semibold tracking-wider uppercase',
                    isDark ? 'text-[#94A3B8]' : 'text-[#55676B]',
                  )}
                >
                  Toán học
                </p>
                <div className="space-y-1">
                  <Link
                    to={ROUTES.courseOverview('cau-truc-dai-so')}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className={cn(
                      'group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors',
                      isDark ? 'hover:bg-[#20252B]' : 'hover:bg-[#E1E9EA]/60',
                    )}
                  >
                    <span
                      className={cn(
                        'font-serif text-sm font-semibold',
                        isDark ? 'text-[#F8FAFC]' : 'text-[#29383D]',
                      )}
                    >
                      Cấu trúc đại số
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[11px]',
                        isDark ? 'text-[#94A3B8]' : 'text-[#55676B]',
                      )}
                    >
                      MATH1301
                    </span>
                  </Link>

                  <Link
                    to={ROUTES.courseOverview('hinh-hoc-affine')}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className={cn(
                      'group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors',
                      isDark ? 'hover:bg-[#20252B]' : 'hover:bg-[#E1E9EA]/60',
                    )}
                  >
                    <span
                      className={cn(
                        'font-serif text-sm font-semibold',
                        isDark ? 'text-[#F8FAFC]' : 'text-[#29383D]',
                      )}
                    >
                      Hình học Affine &amp; Euclide
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[11px]',
                        isDark ? 'text-[#94A3B8]' : 'text-[#55676B]',
                      )}
                    >
                      MATH1302
                    </span>
                  </Link>

                  <Link
                    to={ROUTES.courseOverview('giai-tich-ham-mot-bien')}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className={cn(
                      'group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors',
                      isDark ? 'hover:bg-[#20252B]' : 'hover:bg-[#E1E9EA]/60',
                    )}
                  >
                    <span
                      className={cn(
                        'font-serif text-sm font-semibold',
                        isDark ? 'text-[#F8FAFC]' : 'text-[#29383D]',
                      )}
                    >
                      Giải tích hàm một biến
                    </span>
                    <span
                      className={cn(
                        'font-mono text-[11px]',
                        isDark ? 'text-[#94A3B8]' : 'text-[#55676B]',
                      )}
                    >
                      MATH1303
                    </span>
                  </Link>
                </div>
              </div>

              {/* Cột 2: Khoa học Giáo dục */}
              <div className="flex flex-col justify-between space-y-2.5">
                <div className="space-y-2.5">
                  <p
                    className={cn(
                      'px-2.5 font-mono text-[11px] font-semibold tracking-wider uppercase',
                      isDark ? 'text-[#94A3B8]' : 'text-[#55676B]',
                    )}
                  >
                    Khoa học Giáo dục
                  </p>
                  <div className="space-y-1">
                    <Link
                      to={ROUTES.courseOverview('giao-duc-hoc')}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className={cn(
                        'group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors',
                        isDark ? 'hover:bg-[#20252B]' : 'hover:bg-[#E1E9EA]/60',
                      )}
                    >
                      <span
                        className={cn(
                          'font-serif text-sm font-semibold',
                          isDark ? 'text-[#F8FAFC]' : 'text-[#29383D]',
                        )}
                      >
                        Giáo dục học
                      </span>
                      <span
                        className={cn(
                          'font-mono text-[11px]',
                          isDark ? 'text-[#94A3B8]' : 'text-[#55676B]',
                        )}
                      >
                        EDUC2802
                      </span>
                    </Link>
                  </div>
                </div>

                <div
                  className={cn('border-t pt-3', isDark ? 'border-[#2A323A]' : 'border-[#CFDADB]')}
                >
                  <Link
                    to={ROUTES.courses}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 text-xs font-medium transition-colors',
                      isDark
                        ? 'text-[#C89738] hover:text-[#DFAD4D]'
                        : 'text-[#3F6570] hover:text-[#345761]',
                    )}
                  >
                    <span>Xem tất cả học phần</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Thanh chỉ báo tiến độ đọc bài (2px) trên đỉnh trình duyệt — chỉ hiện trên trang bài học */}
      <ReadingProgressBar key={pathname} className="fixed inset-x-0 top-0 z-50" />

      {/* Hộp thoại Tìm kiếm Học thuật Tức thì (Command Palette ⌘K / Ctrl+K) */}
      <CommandPalette open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Header;
