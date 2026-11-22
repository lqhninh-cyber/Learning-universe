import {
  BookMarked,
  BookOpen,
  Compass,
  FilePenLine,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  PenTool,
  PlayCircle,
  Search,
  Sparkles,
  Sun,
} from 'lucide-react';
import { type FC, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { BrandLogo } from '@/components/common/BrandLogo';
import { getLessonById, type LessonLocation } from '@/content-runtime';
import {
  fontScaleToReadingSize,
  getIslandSubjectByIdOrSlug,
  readingSizeToFontScale,
} from '@/context/island-helpers';
import { useIsland } from '@/context/IslandContext';
import { useLayout } from '@/context/LayoutContext';
import { type ReadingFontSize, useReadingSettings } from '@/context/ReadingSettingsContext';
import { useAuth } from '@/features/auth';
import { type LastVisitedEntry, useLearningStore } from '@/features/learning';
import { HeaderAccountMenu } from '@/shared/components/header/HeaderAccountMenu';
import { HeaderPomodoroTimer } from '@/shared/components/header/HeaderPomodoroTimer';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface LeftRailProps {
  readonly hiddenInZen?: boolean;
}

interface QuickResumeMeta {
  readonly label: string;
  readonly to: string;
  readonly subjectName: string;
  readonly subjectAccentColor: string;
  readonly lessonTitle: string;
}

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

function formatQuickResumeLabel(location: LessonLocation): string {
  const titleMatch = location.lesson.title.match(/^(Bài\s+\d+(?:\.\d+)?)/i);
  if (titleMatch?.[1]) {
    return titleMatch[1];
  }
  return `Bài ${location.chapter.number}.${location.lesson.number}`;
}

export const LeftRail: FC<LeftRailProps> = ({ hiddenInZen = false }) => {
  const { pathname } = useLocation();
  const { isRailCollapsed, toggleRail, openCommandPalette } = useLayout();
  const { theme, toggleTheme } = useReadingSettings();
  const { activeSubject, readerSettings, setFontScale } = useIsland();
  const { isAuthenticated, isAdmin, openAuthModal, signOut } = useAuth();

  const isStoreAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const lastVisitedGlobal = useLearningStore((state) => state.lastVisitedGlobal);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);
  const signOutLearnerMode = useLearningStore((state) => state.signOutLearnerMode);

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountWrapperRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';
  const isSepia = theme === 'sepia';
  const isUserLoggedIn = isAuthenticated || isStoreAuthenticated;
  const completedCount = Object.keys(completedLessons).length;
  const activeFontSize = fontScaleToReadingSize(readerSettings.fontScale);

  // Đóng menu tài khoản khi đổi route
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (isAccountMenuOpen) {
      setIsAccountMenuOpen(false);
    }
  }

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (accountWrapperRef.current && !accountWrapperRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isAccountMenuOpen]);

  const quickResume = useMemo<QuickResumeMeta | null>(() => {
    const entry = lastVisitedGlobal ?? readPersistedLastVisited();
    if (!entry?.lessonId) return null;
    const loc = getLessonById(entry.lessonId);
    if (!loc) return null;
    const subjectMeta =
      getIslandSubjectByIdOrSlug(loc.subject.slug) ?? getIslandSubjectByIdOrSlug(loc.subject.id);
    return {
      label: formatQuickResumeLabel(loc),
      to: ROUTES.lesson(loc.subject.slug, loc.chapter.slug, loc.lesson.slug),
      subjectName: subjectMeta?.name ?? loc.subject.title,
      subjectAccentColor: subjectMeta?.accentColor ?? '#1B5E4A',
      lessonTitle: loc.lesson.title,
    };
  }, [lastVisitedGlobal]);

  const isLoungeActive = pathname === ROUTES.sanctuary;
  const isHomeActive = pathname === ROUTES.home;
  const isLearningSpaceActive =
    pathname === ROUTES.learningSpace ||
    pathname === ROUTES.subjects ||
    pathname.startsWith('/mon-hoc/') ||
    pathname.startsWith('/courses/') ||
    pathname.startsWith('/bai-hoc/');
  const isGlossaryActive = pathname === ROUTES.glossary || pathname === '/glossary';
  const isExamBuilderActive = pathname === ROUTES.examBuilder;
  const isMathInkActive = pathname === ROUTES.mathInk;

  const handleSelectFontSize = (scale: ReadingFontSize) => {
    setFontScale(readingSizeToFontScale(scale));
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-reading-size', scale);
    }
  };

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false);
    signOutLearnerMode();
    await signOut();
  };

  const navItemClass = (active: boolean) =>
    cn(
      'group relative flex h-9 items-center rounded-lg border text-[13px] transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none',
      isRailCollapsed ? 'mx-auto w-9 justify-center px-0' : 'w-full gap-2.5 px-2.5',
      active
        ? 'border-[var(--border-hairline)] bg-[var(--bg-workspace)] font-medium text-[var(--accent-os)] shadow-2xs'
        : 'border-transparent font-normal text-[var(--text-secondary)] hover:bg-[var(--bg-workspace)]/65 hover:text-[var(--text-main)]',
    );

  if (hiddenInZen) {
    return null;
  }

  return (
    <aside
      data-testid="left-rail"
      data-collapsed={isRailCollapsed ? 'true' : 'false'}
      aria-label="Thanh điều hướng ứng dụng"
      className={cn(
        'sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-[var(--border-hairline)] bg-[var(--bg-shell)] transition-[width] duration-200 ease-out md:flex print:hidden',
        isRailCollapsed ? 'w-[60px]' : 'w-[232px]',
      )}
    >
      {/* ĐẦU RAIL: Thương hiệu + Nút thu gọn/mở rộng */}
      <div
        className={cn(
          'flex shrink-0 border-b border-[var(--border-hairline)]',
          isRailCollapsed
            ? 'flex-col items-center gap-2 px-2 py-2.5'
            : 'h-12 items-center justify-between gap-2 px-3',
        )}
      >
        <Link
          to={ROUTES.home}
          aria-label="LEARNING UNIVERSE"
          title="Learning Universe"
          className="flex min-w-0 items-center transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none"
        >
          <BrandLogo
            variant={isRailCollapsed ? 'emblem-only' : 'full'}
            size="sm"
            isDark={isDark}
            isSepia={isSepia}
          />
        </Link>

        <button
          type="button"
          data-testid="rail-collapse-toggle"
          onClick={toggleRail}
          aria-label={isRailCollapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          title={isRailCollapsed ? 'Mở rộng thanh bên ([)' : 'Thu gọn thanh bên ([)'}
          className="inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none active:scale-95"
        >
          {isRailCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Ô MỞ NHANH COMMAND PALETTE (⌘K) */}
      <div className={cn('shrink-0 pt-3 pb-2', isRailCollapsed ? 'px-2' : 'px-3')}>
        <button
          type="button"
          data-testid="rail-command-trigger"
          onClick={openCommandPalette}
          aria-label="Mở tìm kiếm nhanh"
          title="Tìm nhanh (⌘K)"
          className={cn(
            'flex cursor-pointer items-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--text-secondary)] shadow-2xs transition-all duration-150 hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none active:scale-[0.98]',
            isRailCollapsed
              ? 'mx-auto h-9 w-9 justify-center'
              : 'h-9 w-full justify-between gap-2 px-2.5 text-xs',
          )}
        >
          {isRailCollapsed ? (
            <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <>
              <span className="flex min-w-0 items-center gap-2">
                <Search
                  className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
                <span className="truncate">Tìm nhanh...</span>
              </span>
              <kbd className="shrink-0 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-muted)]">
                ⌘K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* 4 MỤC ĐIỀU HƯỚNG CHÍNH */}
      <nav
        aria-label="Điều hướng chính"
        className={cn('flex-1 space-y-1 overflow-y-auto py-2', isRailCollapsed ? 'px-2' : 'px-3')}
      >
        <Link
          to={ROUTES.home}
          aria-label="Tổng quan"
          title={isRailCollapsed ? 'Tổng quan' : undefined}
          aria-current={isHomeActive ? 'page' : undefined}
          className={navItemClass(isHomeActive)}
        >
          {isHomeActive && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r bg-[var(--accent-os)]"
            />
          )}
          <Compass className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!isRailCollapsed && <span className="truncate">Tổng quan</span>}
        </Link>

        <Link
          to={ROUTES.learningSpace}
          aria-label="Không gian học tập"
          title={isRailCollapsed ? 'Không gian học tập' : undefined}
          aria-current={isLearningSpaceActive ? 'page' : undefined}
          className={navItemClass(isLearningSpaceActive)}
        >
          {isLearningSpaceActive && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r bg-[var(--accent-os)]"
            />
          )}
          <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!isRailCollapsed && (
            <span className="flex min-w-0 flex-1 items-center justify-between gap-1.5">
              <span className="truncate">Không gian học tập</span>
              {activeSubject && (
                <span
                  data-testid="island-subject-badge"
                  className="inline-flex shrink-0 items-center gap-1 rounded border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--text-secondary)]"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: activeSubject.accentColor }}
                    aria-hidden="true"
                  />
                  {activeSubject.code}
                </span>
              )}
            </span>
          )}
        </Link>

        <Link
          to={ROUTES.glossary}
          aria-label="Kho Thuật ngữ"
          title={isRailCollapsed ? 'Kho Thuật ngữ' : undefined}
          aria-current={isGlossaryActive ? 'page' : undefined}
          className={navItemClass(isGlossaryActive)}
        >
          {isGlossaryActive && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r bg-[var(--accent-os)]"
            />
          )}
          <BookMarked className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!isRailCollapsed && <span className="truncate">Kho Thuật ngữ</span>}
        </Link>

        <Link
          to={ROUTES.examBuilder}
          aria-label="Soạn đề Toán"
          title={isRailCollapsed ? 'Soạn đề Toán' : undefined}
          aria-current={isExamBuilderActive ? 'page' : undefined}
          className={navItemClass(isExamBuilderActive)}
        >
          {isExamBuilderActive && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r bg-[var(--accent-os)]"
            />
          )}
          <FilePenLine className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!isRailCollapsed && <span className="truncate">Soạn đề Toán</span>}
        </Link>

        <Link
          to={ROUTES.mathInk}
          aria-label="Bảng viết Toán"
          title={isRailCollapsed ? 'Bảng viết Toán (Ink & 3D & Đồ thị)' : undefined}
          aria-current={isMathInkActive ? 'page' : undefined}
          className={navItemClass(isMathInkActive)}
        >
          {isMathInkActive && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r bg-[var(--accent-os)]"
            />
          )}
          <PenTool className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!isRailCollapsed && <span className="truncate">Bảng viết Toán</span>}
        </Link>

        <Link
          to={ROUTES.sanctuaryTab('di-san')}
          aria-label="Sảnh Thư giãn"
          title={isRailCollapsed ? 'Sảnh Thư giãn (Di sản & Bida)' : undefined}
          aria-current={isLoungeActive ? 'page' : undefined}
          className={navItemClass(isLoungeActive)}
        >
          {isLoungeActive && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 left-0 w-[2px] rounded-r bg-[var(--accent-os)]"
            />
          )}
          <Sparkles className="h-4 w-4 shrink-0" aria-hidden="true" />
          {!isRailCollapsed && <span className="truncate">Sảnh Thư giãn</span>}
        </Link>
      </nav>

      {/* ĐÁY RAIL: Học tiếp · Pomodoro · Sáng/Tối · Tài khoản */}
      <div
        className={cn(
          'mt-auto shrink-0 space-y-1.5 border-t border-[var(--border-hairline)] py-3',
          isRailCollapsed ? 'px-2' : 'px-3',
        )}
      >
        {/* Thẻ rút gọn "Học tiếp" */}
        {quickResume &&
          (isRailCollapsed ? (
            <Link
              to={quickResume.to}
              data-testid="rail-resume-link"
              aria-label={`Học tiếp: ${quickResume.label}`}
              title={`Học tiếp: ${quickResume.lessonTitle} (${quickResume.subjectName})`}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-workspace)] text-[var(--accent-os)] transition-colors hover:border-[var(--accent-os)]/50 focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none"
            >
              <PlayCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            </Link>
          ) : (
            <Link
              to={quickResume.to}
              data-testid="rail-resume-link"
              aria-label={`Học tiếp: ${quickResume.label}`}
              className="group block rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-workspace)] p-2.5 transition-all duration-150 hover:border-[var(--accent-os)]/40 hover:shadow-xs focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: quickResume.subjectAccentColor }}
                  aria-hidden="true"
                />
                <span className="font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] uppercase">
                  Học tiếp · {quickResume.label}
                </span>
              </div>
              <p className="mt-1 truncate text-xs font-medium text-[var(--text-main)] group-hover:text-[var(--accent-os)]">
                {quickResume.lessonTitle}
              </p>
              <p className="truncate text-[11px] text-[var(--text-muted)]">
                {quickResume.subjectName}
              </p>
            </Link>
          ))}

        {/* Nhịp học tập (Pomodoro) */}
        <HeaderPomodoroTimer placement="rail" collapsed={isRailCollapsed} isDark={isDark} />

        {/* Chuyển nhanh Sáng / Tối (Ceramic Light ↔ Obsidian Studio) */}
        <button
          type="button"
          data-testid="rail-theme-toggle"
          onClick={toggleTheme}
          aria-pressed={isDark}
          aria-label={isDark ? 'Chuyển sang chế độ Sáng' : 'Chuyển sang chế độ Tối'}
          title={isDark ? 'Ceramic Light (Sáng)' : 'Obsidian Studio (Tối)'}
          className={cn(
            'flex cursor-pointer items-center rounded-lg border border-transparent text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hairline)] hover:bg-[var(--bg-workspace)] hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none active:scale-[0.98]',
            isRailCollapsed
              ? 'mx-auto h-9 w-9 justify-center'
              : 'h-9 w-full justify-between gap-2 px-2.5',
          )}
        >
          {isRailCollapsed ? (
            isDark ? (
              <Sun className="h-4 w-4 text-[var(--accent-heritage)]" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )
          ) : (
            <>
              <span className="flex min-w-0 items-center gap-2.5">
                {isDark ? (
                  <Sun
                    className="h-4 w-4 shrink-0 text-[var(--accent-heritage)]"
                    aria-hidden="true"
                  />
                ) : (
                  <Moon className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
                )}
                <span className="truncate">{isDark ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>
              </span>
              <span className="shrink-0 font-mono text-[10px] text-[var(--text-muted)]">
                {isDark ? 'Obsidian' : 'Ceramic'}
              </span>
            </>
          )}
        </button>

        {/* Tài khoản / Hồ sơ */}
        <div ref={accountWrapperRef}>
          <HeaderAccountMenu
            placement="rail"
            collapsed={isRailCollapsed}
            isOpen={isAccountMenuOpen}
            onToggle={() => setIsAccountMenuOpen((prev) => !prev)}
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
        </div>
      </div>
    </aside>
  );
};

export default LeftRail;
