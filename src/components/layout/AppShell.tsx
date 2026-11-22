import {
  BookMarked,
  BookOpen,
  Compass,
  FilePenLine,
  Gamepad2,
  Hourglass,
  Landmark,
  LogIn,
  LogOut,
  Moon,
  PenTool,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { Suspense, type FC, type ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { BrandLogo } from '@/components/common/BrandLogo';
import { ISLAND_SUBJECT_CATALOG } from '@/context/island-helpers';
import { useLayout } from '@/context/LayoutContext';
import { usePomodoro } from '@/context/PomodoroContext';
import { useReadingSettings } from '@/context/ReadingSettingsContext';
import { useAuth } from '@/features/auth';
import { useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { LazyCommandPalette, preloadCommandPalette } from './command-palette-loader';
import { LeftRail } from './LeftRail';
import { TopContextBar } from './TopContextBar';

const MobileDrawerPomodoroButton: FC = () => {
  const { pomodoro, startPomodoro, pausePomodoro, resumePomodoro } = usePomodoro();

  const handleMobilePomodoro = () => {
    if (pomodoro.status === 'running') {
      pausePomodoro();
    } else if (pomodoro.status === 'paused') {
      resumePomodoro();
    } else {
      startPomodoro(25, 'Tiêu chuẩn');
    }
  };

  return (
    <button
      type="button"
      onClick={handleMobilePomodoro}
      className="flex min-h-[44px] w-full cursor-pointer items-center justify-between rounded-lg px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]"
    >
      <span className="flex items-center gap-2.5">
        <Hourglass className="h-4 w-4 text-[var(--accent-heritage)]" aria-hidden="true" />
        <span>
          {pomodoro.status === 'running'
            ? 'Tạm dừng Pomodoro'
            : pomodoro.status === 'paused'
              ? 'Tiếp tục Pomodoro'
              : 'Bắt đầu Pomodoro 25p'}
        </span>
      </span>
    </button>
  );
};

const PomodoroBreakToast: FC = () => {
  const { pomodoroBreakPrompt, dismissPomodoroBreakPrompt, startBreakTimer } = usePomodoro();

  if (!pomodoroBreakPrompt) return null;

  const handleEnterSanctuaryBreak = () => {
    startBreakTimer(5);
    dismissPomodoroBreakPrompt();
  };

  return (
    <aside
      role="status"
      aria-live="polite"
      data-testid="pomodoro-break-toast"
      className="fixed right-5 bottom-5 z-50 w-[min(92vw,340px)] rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-4 text-[var(--text-main)] shadow-lg print:hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--accent-heritage)]">
            <Hourglass className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-[var(--text-main)]">
              Hoàn thành phiên tập trung
            </p>
            <p className="text-[11.5px] text-[var(--text-secondary)]">
              Nghỉ 5 phút tại Sảnh Thư giãn?
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={dismissPomodoroBreakPrompt}
          aria-label="Đóng gợi ý nghỉ giải lao"
          className="inline-flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Link
          to={ROUTES.sanctuaryTab('bida')}
          onClick={handleEnterSanctuaryBreak}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--accent-os)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-95"
        >
          <Gamepad2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Đánh Bida</span>
        </Link>
        <Link
          to={ROUTES.sanctuaryTab('di-san')}
          onClick={handleEnterSanctuaryBreak}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-main)] transition-colors hover:border-[var(--accent-heritage)] hover:text-[var(--accent-heritage)]"
        >
          <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Ngắm Di sản</span>
        </Link>
      </div>
    </aside>
  );
};

export interface AppShellProps {
  readonly children: ReactNode;
  readonly footer?: ReactNode;
  readonly isLessonPage?: boolean;
  readonly isDark?: boolean;
  readonly mainClassName?: string;
}

export const AppShell: FC<AppShellProps> = ({
  children,
  footer,
  isLessonPage = false,
  isDark = false,
  mainClassName,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isMobileMenuOpen, setMobileMenuOpen, isCommandOpen, setCommandOpen, openCommandPalette } =
    useLayout();
  const { theme, toggleTheme, isZenMode } = useReadingSettings();
  const { isAuthenticated, openAuthModal, signOut } = useAuth();
  const isStoreAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const signOutLearnerMode = useLearningStore((state) => state.signOutLearnerMode);

  const isUserLoggedIn = isAuthenticated || isStoreAuthenticated;
  const darkActive = isDark || theme === 'dark';

  // Tự động đóng mobile drawer khi đổi route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname, setMobileMenuOpen]);

  // Đóng mobile drawer bằng phím Esc
  useEffect(() => {
    if (!isMobileMenuOpen || typeof window === 'undefined') return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen, setMobileMenuOpen]);

  const handleMobileLounge = () => {
    setMobileMenuOpen(false);
    void navigate(ROUTES.sanctuaryTab('di-san'));
  };

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    signOutLearnerMode();
    await signOut();
  };

  return (
    <div
      data-testid="app-shell"
      className="flex min-h-screen bg-[var(--bg-workspace)] text-[var(--text-main)]"
    >
      {/* THANH RAIL TRÁI (DESKTOP >= 768px) */}
      <LeftRail hiddenInZen={isLessonPage && isZenMode} />

      {/* CỘT PHẢI: TOP CONTEXT BAR + NỘI DUNG CHÍNH + FOOTER */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopContextBar isLessonPage={isLessonPage} isDark={darkActive} />
        <main id="main-content" className={cn('min-w-0 flex-1', mainClassName)}>
          {children}
        </main>
        {footer}
      </div>

      {/* MOBILE NAVIGATION DRAWER (< 768px) */}
      {isMobileMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu điều hướng di động"
          data-testid="mobile-nav-drawer"
          className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="flex h-full w-[272px] max-w-[85vw] flex-col border-r border-[var(--border-hairline)] bg-[var(--bg-shell)] text-[var(--text-main)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-12 items-center justify-between border-b border-[var(--border-hairline)] px-4">
              <Link
                to={ROUTES.home}
                onClick={() => setMobileMenuOpen(false)}
                aria-label="LEARNING UNIVERSE"
              >
                <BrandLogo variant="full" size="sm" isDark={darkActive} />
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Đóng menu điều hướng"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-workspace)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="p-3">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCommandPalette();
                }}
                onMouseEnter={preloadCommandPalette}
                onFocus={preloadCommandPalette}
                className="flex h-10 w-full cursor-pointer items-center justify-between rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] px-3 text-xs font-medium text-[var(--text-secondary)]"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Tìm nhanh...</span>
                </span>
                <kbd className="font-mono text-[10px]">⌘K</kbd>
              </button>
            </div>

            <nav
              aria-label="Menu điều hướng di động"
              className="flex-1 space-y-1 overflow-y-auto px-3 py-1"
            >
              <Link
                to={ROUTES.home}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-workspace)]"
              >
                <Compass className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <span>Tổng quan</span>
              </Link>
              <Link
                to={ROUTES.learningSpace}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-workspace)]"
              >
                <BookOpen className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <span>Không gian học tập</span>
              </Link>
              <Link
                to={ROUTES.glossary}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-workspace)]"
              >
                <BookMarked className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <span>Kho Thuật ngữ</span>
              </Link>
              <Link
                to={ROUTES.examBuilder}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-workspace)]"
              >
                <FilePenLine className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <span>Soạn đề</span>
              </Link>
              <Link
                to={ROUTES.mathInk}
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-workspace)]"
              >
                <PenTool className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <span>Bảng viết</span>
              </Link>
              <button
                type="button"
                onClick={handleMobileLounge}
                className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-[var(--text-main)] hover:bg-[var(--bg-workspace)]"
              >
                <Sparkles className="h-4 w-4 text-[var(--text-muted)]" aria-hidden="true" />
                <span>Sảnh Thư giãn</span>
              </button>

              <div className="pt-3">
                <p className="px-3 pb-1.5 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                  Học phần
                </p>
                {ISLAND_SUBJECT_CATALOG.map((subject) => (
                  <Link
                    key={subject.slug}
                    to={ROUTES.subjectOverview(subject.slug)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex min-h-[40px] items-center gap-2.5 rounded-lg px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]"
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: subject.accentColor }}
                      aria-hidden="true"
                    />
                    <span className="truncate">{subject.name}</span>
                  </Link>
                ))}
              </div>
            </nav>

            <div className="space-y-1.5 border-t border-[var(--border-hairline)] p-3">
              <MobileDrawerPomodoroButton />

              <button
                type="button"
                onClick={toggleTheme}
                className="flex min-h-[44px] w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]"
              >
                {darkActive ? (
                  <Sun className="h-4 w-4 text-[var(--accent-heritage)]" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{darkActive ? 'Chuyển sang Sáng' : 'Chuyển sang Tối'}</span>
              </button>

              {isUserLoggedIn ? (
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  className="flex min-h-[44px] w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)]"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Đăng xuất</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal();
                  }}
                  className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[var(--accent-os)] px-3 text-xs font-semibold text-white"
                >
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Đăng nhập đồng bộ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOAST CẦU NỐI POMODORO -> SẢNH THƯ GIÃN (GÓC DƯỚI PHẢI) */}
      <PomodoroBreakToast />

      {/* BẢNG LỆNH TRUNG TÂM TOÀN CỤC (⌘K — Lazy-loaded khi mở) */}
      {isCommandOpen && (
        <Suspense fallback={null}>
          <LazyCommandPalette open={isCommandOpen} onOpenChange={setCommandOpen} />
        </Suspense>
      )}
    </div>
  );
};

export default AppShell;
