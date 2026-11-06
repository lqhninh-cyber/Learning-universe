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
import { CommandPalette } from '@/components/search/CommandPalette';
import { useAuth } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import { ReadingProgressBar } from '@/features/lesson-reader/ReadingProgressBar';
import { SearchBar } from '@/features/search';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Button, Drawer } from '@/shared/ui';

export interface HeaderProps {
  readonly className?: string;
}

type ReadingFontScale = 'sm' | 'base' | 'lg';

export const Header: FC<HeaderProps> = ({ className }) => {
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
          'lu-site-header fixed top-4 left-1/2 z-50 flex h-14 w-[94%] max-w-5xl -translate-x-1/2 items-center justify-between rounded-full border px-6 shadow-[0_10px_35px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-300 md:top-5 md:h-15 print:hidden',
          isScrolled
            ? 'border-stone-300/80 bg-[#FAF7F2]/95'
            : 'border-stone-200/75 bg-[#FAF7F2]/85',
          className,
        )}
      >
        {/* 1. CỤM THƯƠNG HIỆU TỐI GIẢN (Left Brand Wordmark) */}
        <Link
          to={ROUTES.home}
          className="font-serif text-xs font-medium tracking-[0.22em] text-stone-900 uppercase transition-opacity select-none hover:opacity-75 md:text-sm"
        >
          LEARNING UNIVERSE
        </Link>

        {/* 2. CỤM ĐIỀU HƯỚNG TRUNG TÂM (Center Navigation Links — Desktop) */}
        <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
          <Link
            to={ROUTES.home}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
              pathname === ROUTES.home
                ? 'bg-stone-200/60 text-stone-900'
                : 'text-stone-600 hover:bg-stone-200/40 hover:text-stone-900',
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
                ? 'bg-stone-200/60 text-stone-900'
                : 'text-stone-600 hover:bg-stone-200/40 hover:text-stone-900',
            )}
          >
            <span>Không gian học tập</span>
            <ChevronDown
              className={cn(
                'h-3 w-3 text-stone-500 transition-transform duration-200',
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
                ? 'bg-stone-200/60 text-stone-900'
                : 'text-stone-600 hover:bg-stone-200/40 hover:text-stone-900',
            )}
          >
            Tất cả môn học
          </Link>

          <Link
            to="/glossary"
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-all',
              isGlossaryActive
                ? 'bg-stone-200/60 text-stone-900'
                : 'text-stone-600 hover:bg-stone-200/40 hover:text-stone-900',
            )}
          >
            Thuật ngữ
          </Link>
        </nav>

        {/* 3. CỤM TIỆN ÍCH & TÀI KHOẢN (Right Utility Hub — Desktop & Mobile Burger) */}
        <div className="flex items-center gap-2.5">
          {/* Nút tìm kiếm nhanh: 🔍 Tìm kiếm ⌘K */}
          <button
            type="button"
            onClick={() => {
              setIsSearchOpen(true);
              setIsMegaMenuOpen(false);
              setIsAccountMenuOpen(false);
            }}
            aria-label="Mở tìm kiếm nhanh"
            className="hidden cursor-pointer items-center gap-2 rounded-full border border-stone-200/90 bg-white/60 px-3 py-1.5 text-xs font-medium text-stone-600 transition-all hover:border-stone-300 hover:bg-white hover:text-stone-900 md:inline-flex"
          >
            <Search className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
            <span>Tìm kiếm</span>
            <kbd className="rounded bg-stone-200/60 px-1.5 py-0.5 font-mono text-[10px] text-stone-600">
              ⌘K
            </kbd>
          </button>

          {/* Avatar tối giản mở menu cá nhân (Desktop) */}
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => {
                setIsAccountMenuOpen((prev) => !prev);
                setIsMegaMenuOpen(false);
              }}
              aria-expanded={isAccountMenuOpen}
              aria-label="Tài khoản và cài đặt giao diện"
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-stone-300/80 bg-stone-200/50 text-stone-700 transition-colors hover:bg-stone-200/90 hover:text-stone-950"
            >
              <User className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Menu con của Avatar */}
            {isAccountMenuOpen && (
              <div
                role="menu"
                aria-label="Menu tài khoản và giao diện"
                className="absolute top-full right-0 mt-3 w-64 rounded-3xl border border-stone-200/80 bg-[#FAF7F2]/95 p-4 shadow-2xl backdrop-blur-2xl"
              >
                {/* Mục 1: Thông tin học tập cá nhân */}
                <div className="space-y-1.5 border-b border-stone-200/70 pb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                    <BookOpen className="h-3.5 w-3.5 text-stone-600" aria-hidden="true" />
                    <span>Thông tin học tập cá nhân</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    Đã hoàn thành <strong className="text-stone-900">{completedCount}</strong> bài
                    học trên trình duyệt này.
                  </p>
                </div>

                {/* Mục 2: Cài đặt giao diện (Cỡ chữ đọc bài) */}
                <div className="space-y-2 border-b border-stone-200/70 py-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-900">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-stone-600" aria-hidden="true" />
                    <span>Cài đặt giao diện</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 rounded-full border border-stone-200/80 bg-stone-100/70 p-1">
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
                            ? 'bg-stone-900 text-white'
                            : 'text-stone-600 hover:text-stone-900',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Liên kết Quản trị viên (nếu có quyền Admin) */}
                {isAdmin && (
                  <div className="border-b border-stone-200/70 py-2">
                    <Link
                      to={ROUTES.adminUsers}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-2 rounded-2xl px-2.5 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200/60 hover:text-stone-950"
                    >
                      <Users className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                      <span>Quản lý học viên</span>
                    </Link>
                  </div>
                )}

                {/* Mục 3: Đăng nhập / Đăng xuất */}
                <div className="pt-2.5">
                  {isUserLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => void handleSignOut()}
                      className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-3 py-2 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-200/60 hover:text-stone-950"
                    >
                      <span>Đăng xuất</span>
                      <LogOut className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          openAuthModal();
                        }}
                        className="flex w-full cursor-pointer items-center justify-between rounded-2xl bg-stone-900 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-stone-800"
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
                        className="w-full cursor-pointer rounded-2xl px-3 py-1.5 text-center text-[11px] font-medium text-stone-600 transition-colors hover:bg-stone-200/50 hover:text-stone-900"
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
                  <Menu className="h-5 w-5 text-stone-800" aria-hidden="true" />
                </Button>
              }
            >
              <nav aria-label="Menu điều hướng di động" className="space-y-5">
                <SearchBar className="w-full" />

                <div className="space-y-1">
                  <Link
                    to={ROUTES.home}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl px-3.5 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200/50"
                  >
                    Trang chủ
                  </Link>
                  <Link
                    to={ROUTES.courses}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl px-3.5 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200/50"
                  >
                    Tất cả môn học
                  </Link>
                  <Link
                    to="/glossary"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block rounded-2xl px-3.5 py-2 text-sm font-medium text-stone-900 transition-colors hover:bg-stone-200/50"
                  >
                    Thuật ngữ
                  </Link>
                </div>

                {/* Cột 1: Toán học */}
                <div className="space-y-2 border-t border-stone-200/80 pt-4">
                  <p className="px-3 font-mono text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                    Toán học
                  </p>
                  <div className="space-y-1">
                    <Link
                      to={ROUTES.subjectOverview('cau-truc-dai-so')}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Cấu trúc đại số"
                      className="flex items-center justify-between rounded-2xl px-3.5 py-2 text-sm text-stone-800 transition-colors hover:bg-stone-200/50"
                    >
                      <span className="font-serif font-semibold text-stone-900">
                        Cấu trúc đại số
                      </span>
                      <span className="font-mono text-[11px] text-stone-500">MATH1301</span>
                    </Link>
                    <Link
                      to={ROUTES.subjectOverview('hinh-hoc-affine')}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Hình học Affine và hình học Euclide"
                      className="flex items-center justify-between rounded-2xl px-3.5 py-2 text-sm text-stone-800 transition-colors hover:bg-stone-200/50"
                    >
                      <span className="font-serif font-semibold text-stone-900">
                        Hình học Affine &amp; Euclide
                      </span>
                      <span className="font-mono text-[11px] text-stone-500">MATH1302</span>
                    </Link>
                    <Link
                      to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Giải tích hàm một biến"
                      className="flex items-center justify-between rounded-2xl px-3.5 py-2 text-sm text-stone-800 transition-colors hover:bg-stone-200/50"
                    >
                      <span className="font-serif font-semibold text-stone-900">
                        Giải tích hàm một biến
                      </span>
                      <span className="font-mono text-[11px] text-stone-500">MATH1303</span>
                    </Link>
                  </div>
                </div>

                {/* Cột 2: Khoa học Giáo dục */}
                <div className="space-y-2 border-t border-stone-200/80 pt-4">
                  <p className="px-3 font-mono text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                    Khoa học Giáo dục
                  </p>
                  <Link
                    to={ROUTES.subjectOverview('giao-duc-hoc')}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Giáo dục học"
                    className="flex items-center justify-between rounded-2xl px-3.5 py-2 text-sm text-stone-800 transition-colors hover:bg-stone-200/50"
                  >
                    <span className="font-serif font-semibold text-stone-900">
                      Giáo dục học &amp; Nghiệp vụ Sư phạm
                    </span>
                    <span className="font-mono text-[11px] text-stone-500">EDUT1401</span>
                  </Link>
                </div>

                {/* Tài khoản trên di động */}
                <div className="border-t border-stone-200/80 pt-4">
                  {isUserLoggedIn ? (
                    <button
                      type="button"
                      onClick={() => {
                        void handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-2xl border border-stone-200/80 px-4 py-2.5 text-xs font-medium text-stone-700"
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
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-4 py-2.5 text-xs font-medium text-white"
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

        {/* 5. DROPDOWN "KHÔNG GIAN HỌC TẬP" KÍNH MỜ (Frosted Mega-menu 2 Cột Tối Giản) */}
        {isMegaMenuOpen && (
          <div
            role="region"
            aria-label="Danh mục Không gian học tập"
            className="absolute top-full left-1/2 mt-3 w-[520px] max-w-[92vw] -translate-x-1/2 rounded-3xl border border-stone-200/80 bg-[#FAF7F2]/95 p-6 shadow-2xl backdrop-blur-2xl"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Cột 1: Toán học */}
              <div className="space-y-2.5">
                <p className="px-2.5 font-mono text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                  Toán học
                </p>
                <div className="space-y-1">
                  <Link
                    to={ROUTES.courseOverview('cau-truc-dai-so')}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors hover:bg-stone-200/50"
                  >
                    <span className="font-serif text-sm font-semibold text-stone-900">
                      Cấu trúc đại số
                    </span>
                    <span className="font-mono text-[11px] text-stone-500">MATH1301</span>
                  </Link>

                  <Link
                    to={ROUTES.courseOverview('hinh-hoc-affine')}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors hover:bg-stone-200/50"
                  >
                    <span className="font-serif text-sm font-semibold text-stone-900">
                      Hình học Affine &amp; Euclide
                    </span>
                    <span className="font-mono text-[11px] text-stone-500">MATH1302</span>
                  </Link>

                  <Link
                    to={ROUTES.courseOverview('giai-tich-ham-mot-bien')}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors hover:bg-stone-200/50"
                  >
                    <span className="font-serif text-sm font-semibold text-stone-900">
                      Giải tích hàm một biến
                    </span>
                    <span className="font-mono text-[11px] text-stone-500">MATH1303</span>
                  </Link>
                </div>
              </div>

              {/* Cột 2: Khoa học Giáo dục */}
              <div className="flex flex-col justify-between space-y-2.5">
                <div className="space-y-2.5">
                  <p className="px-2.5 font-mono text-[11px] font-semibold tracking-wider text-stone-400 uppercase">
                    Khoa học Giáo dục
                  </p>
                  <div className="space-y-1">
                    <Link
                      to={ROUTES.courseOverview('giao-duc-hoc')}
                      onClick={() => setIsMegaMenuOpen(false)}
                      className="group flex items-center justify-between rounded-2xl px-3 py-2.5 transition-colors hover:bg-stone-200/50"
                    >
                      <span className="font-serif text-sm font-semibold text-stone-900">
                        Giáo dục học &amp; Nghiệp vụ Sư phạm
                      </span>
                      <span className="font-mono text-[11px] text-stone-500">EDUT1401</span>
                    </Link>
                  </div>
                </div>

                <div className="border-t border-stone-200/70 pt-3">
                  <Link
                    to={ROUTES.courses}
                    onClick={() => setIsMegaMenuOpen(false)}
                    className="inline-flex items-center gap-1.5 px-2.5 text-xs font-medium text-stone-600 transition-colors hover:text-stone-950"
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

      {/* Hộp thoại Tìm kiếm Học thuật Nhanh (Command Palette ⌘K / Ctrl+K) */}
      <CommandPalette open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};
