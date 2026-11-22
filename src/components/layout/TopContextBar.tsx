import { Bell, CheckCircle2, ChevronRight, Hourglass, Menu, Search, Sparkles } from 'lucide-react';
import { type FC, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import {
  getLessonBySlug,
  getSubjectBySlug,
  resolveLessonShortcut,
  type LessonLocation,
} from '@/content-runtime';
import { useIsland } from '@/context/IslandContext';
import { useLayout } from '@/context/LayoutContext';
import { HeaderQuickReaderControls } from '@/shared/components/header/HeaderQuickReaderControls';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';

export interface TopContextBarProps {
  readonly isLessonPage?: boolean;
  readonly isDark?: boolean;
}

interface BreadcrumbSegment {
  readonly label: string;
  readonly to?: string;
}

function formatMmSs(totalSec: number): string {
  const safe = Math.max(0, Math.floor(totalSec));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function resolveLessonForBreadcrumb(pathname: string): LessonLocation | undefined {
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

function buildContextBreadcrumbs(pathname: string): readonly BreadcrumbSegment[] {
  if (pathname === ROUTES.home) {
    return [{ label: 'Tổng quan' }];
  }
  if (pathname === ROUTES.learningSpace) {
    return [{ label: 'Không gian học tập' }];
  }
  if (pathname === ROUTES.subjects) {
    return [
      { label: 'Không gian học tập', to: ROUTES.learningSpace },
      { label: 'Danh mục học phần' },
    ];
  }
  if (pathname === ROUTES.glossary || pathname === '/glossary') {
    return [{ label: 'Kho Thuật ngữ' }];
  }
  if (pathname === ROUTES.examBuilder) {
    return [{ label: 'Soạn đề Toán' }];
  }
  if (pathname === ROUTES.sanctuary) {
    return [{ label: 'Sảnh Thư giãn' }];
  }
  if (pathname === ROUTES.adminUsers) {
    return [{ label: 'Quản trị' }, { label: 'Quản lý học viên' }];
  }
  if (pathname.startsWith('/dev/')) {
    return [
      { label: 'Môi trường kiểm thử' },
      { label: pathname.replace('/dev/', '').toUpperCase() },
    ];
  }

  const examMatch = pathname.match(/^\/(?:mon-hoc|courses)\/([^/]+)\/de-thi\/?$/);
  if (examMatch?.[1]) {
    const subject = getSubjectBySlug(examMatch[1]);
    return [
      { label: 'Không gian học tập', to: ROUTES.learningSpace },
      {
        label: subject?.title ?? examMatch[1],
        to: subject ? ROUTES.subjectOverview(subject.slug) : undefined,
      },
      { label: 'Ôn tập & Đề thi' },
    ];
  }

  const lessonLoc = resolveLessonForBreadcrumb(pathname);
  if (lessonLoc) {
    const shortLessonLabel = `Bài ${lessonLoc.chapter.number}.${lessonLoc.lesson.number}`;
    return [
      { label: 'Không gian học tập', to: ROUTES.learningSpace },
      { label: lessonLoc.subject.title, to: ROUTES.subjectOverview(lessonLoc.subject.slug) },
      { label: shortLessonLabel },
    ];
  }

  const subjectMatch = pathname.match(/^\/(?:mon-hoc|courses)\/([^/]+)\/?$/);
  if (subjectMatch?.[1]) {
    const subject = getSubjectBySlug(subjectMatch[1]);
    return [
      { label: 'Không gian học tập', to: ROUTES.learningSpace },
      { label: subject?.title ?? subjectMatch[1] },
    ];
  }

  return [{ label: 'Learning Universe', to: ROUTES.home }];
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

export const TopContextBar: FC<TopContextBarProps> = ({ isLessonPage = false, isDark = false }) => {
  const { pathname } = useLocation();
  const { isRailCollapsed, toggleMobileMenu, openCommandPalette, topBarRightSlot } = useLayout();
  const { activeNotice, dismissIslandNotice, pomodoro } = useIsland();
  const progressBarRef = useRef<HTMLDivElement>(null);

  const breadcrumbs = useMemo(() => buildContextBreadcrumbs(pathname), [pathname]);
  const isPomodoroActive = pomodoro.status !== 'idle';

  useEffect(() => {
    if (!isLessonPage || typeof window === 'undefined') return;
    let rafId = 0;

    const syncProgress = () => {
      rafId = 0;
      if (progressBarRef.current) {
        const ratio = computePageReadingProgress();
        progressBarRef.current.style.transform = `translate3d(0px, 0px, 0px) scaleX(${ratio.toFixed(4)})`;
      }
    };

    const onScroll = () => {
      if (rafId !== 0) return;
      rafId = window.requestAnimationFrame(syncProgress);
    };

    syncProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isLessonPage, pathname]);

  return (
    <header
      data-testid="top-context-bar"
      className="lu-glass-bar sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-3 border-b border-[var(--border-hairline)] px-3 transition-colors duration-200 sm:px-5 print:hidden"
    >
      {/* TRÁI: Hamburger (Mobile) + Breadcrumb ngữ cảnh */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          data-testid="mobile-menu-trigger"
          onClick={toggleMobileMenu}
          aria-label="Mở menu điều hướng"
          className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none md:hidden"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
        </button>

        <nav
          aria-label="Đường dẫn ngữ cảnh"
          data-testid="topbar-breadcrumb"
          className="flex min-w-0 items-center gap-1 overflow-hidden text-xs sm:text-[13px]"
        >
          {breadcrumbs.map((seg, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <span key={`${seg.label}-${idx}`} className="flex min-w-0 items-center gap-1">
                {idx > 0 && (
                  <ChevronRight
                    className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
                    aria-hidden="true"
                  />
                )}
                {seg.to && !isLast ? (
                  <Link
                    to={seg.to}
                    className="truncate text-[var(--text-secondary)] transition-colors hover:text-[var(--text-main)]"
                  >
                    {seg.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'truncate',
                      isLast
                        ? 'font-medium text-[var(--text-main)]'
                        : 'text-[var(--text-secondary)]',
                    )}
                  >
                    {seg.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
      </div>

      {/* THÔNG BÁO NỔI ĐỒNG TÂM (MICRO-NOTIFICATIONS) */}
      {activeNotice && (
        <div
          key={activeNotice.id}
          role="status"
          aria-live="polite"
          data-testid="island-notice-banner"
          onClick={dismissIslandNotice}
          className="pointer-events-auto absolute top-1/2 left-1/2 z-50 flex max-w-[min(86vw,520px)] -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2 overflow-hidden rounded-full border border-[var(--border-hairline)] bg-[var(--accent-os)] px-3.5 py-1 text-xs font-semibold text-white shadow-md transition-all"
        >
          {activeNotice.type === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-300" aria-hidden="true" />
          ) : activeNotice.type === 'timer' ? (
            <Bell className="h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
          ) : (
            <Sparkles
              className="h-3.5 w-3.5 shrink-0 text-emerald-200"
              style={activeNotice.accentColor ? { color: activeNotice.accentColor } : undefined}
              aria-hidden="true"
            />
          )}
          <span className="truncate">{activeNotice.text}</span>
        </div>
      )}

      {/* PHẢI: topBarRightSlot (công cụ đọc bài) · Pomodoro mobile · nút ⌘K */}
      <div className="flex shrink-0 items-center gap-2">
        {topBarRightSlot ?? (isLessonPage ? <HeaderQuickReaderControls isDark={isDark} /> : null)}

        {isPomodoroActive && (
          <span
            data-testid="topbar-mobile-pomodoro"
            className="inline-flex items-center gap-1 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--accent-heritage)] tabular-nums md:hidden"
          >
            <Hourglass className="h-3 w-3 shrink-0" aria-hidden="true" />
            <span>{formatMmSs(pomodoro.remainingSeconds)}</span>
          </span>
        )}

        <button
          type="button"
          data-testid="topbar-command-trigger"
          onClick={openCommandPalette}
          aria-label="Mở bảng lệnh (⌘K)"
          title="Mở bảng lệnh trung tâm (⌘K)"
          className={cn(
            'h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-2 text-xs font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-os)]/40 hover:text-[var(--text-main)] focus-visible:ring-2 focus-visible:ring-[var(--accent-os)] focus-visible:outline-none active:scale-[0.98]',
            isRailCollapsed ? 'inline-flex' : 'inline-flex md:hidden',
          )}
        >
          <Search className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <kbd className="hidden font-mono text-[10.5px] font-semibold text-[var(--text-muted)] sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* THANH TIẾN ĐỘ ĐỌC 2px Ở ĐÁY TOP CONTEXT BAR (Trang bài học) */}
      {isLessonPage && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 left-0 h-[2px] overflow-hidden bg-transparent"
        >
          <div
            ref={progressBarRef}
            data-testid="header-reading-progress"
            style={{
              transform: 'translate3d(0px, 0px, 0px) scaleX(0)',
              transformOrigin: 'left center',
              backgroundColor: 'var(--accent-os)',
            }}
            className="h-full w-full will-change-transform"
          />
        </div>
      )}
    </header>
  );
};

export default TopContextBar;
