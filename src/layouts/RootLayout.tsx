import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { WaterTouchIntro } from '@/components/intro';
import { AppShell } from '@/components/layout/AppShell';
import { Footer } from '@/components/layout/Footer';
import { IslandProvider, useIsland } from '@/context/IslandContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { ReadingSettingsProvider, useReadingSettings } from '@/context/ReadingSettingsContext';
import { AuthModal, AuthProvider, PendingNoticeDialog } from '@/features/auth';
import { LoginPromptDialog } from '@/features/learning';
import { PaperGrain } from '@/shared/components/PaperGrain';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Container } from '@/shared/ui';

export function RootHydrateFallback() {
  return null;
}

function RootLayoutContent() {
  const { pathname, hash } = useLocation();
  const isHomePage = pathname === ROUTES.home;
  const isCourseDetailPage = /^\/(mon-hoc|courses)\/[^/]+\/?$/.test(pathname);
  const isLessonPage =
    /^\/(mon-hoc|courses)\/[^/]+\/[^/]+\/[^/]+\/?$/.test(pathname) ||
    /^\/bai-hoc\/[^/]+\/?$/.test(pathname) ||
    pathname === '/dev/mdx';

  const { theme } = useReadingSettings();
  const { setRoutePathname, readerSettings } = useIsland();
  const isDarkApp = theme === 'dark' || (isLessonPage && readerSettings.isDarkMode);
  const isSepiaLesson = isLessonPage && !isDarkApp && theme === 'sepia';
  const isEyeComfort =
    isLessonPage && readerSettings.eyeComfortWarmth && !isDarkApp && !isSepiaLesson;

  useEffect(() => {
    setRoutePathname(pathname);
  }, [pathname, setRoutePathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hash) {
      const targetId = hash.replace(/^#/, '');
      const tryScroll = () => {
        const el = document.getElementById(targetId);
        if (el && typeof el.scrollIntoView === 'function') {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };
      tryScroll();
      const timer = window.setTimeout(tryScroll, 180);
      return () => window.clearTimeout(timer);
    }
    if (typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'instant' });
      } catch {
        // Bỏ qua trong môi trường jsdom khi kiểm thử
      }
    }
    return undefined;
  }, [pathname, hash]);

  const mainClassName = isHomePage
    ? 'overflow-x-clip'
    : isCourseDetailPage
      ? 'overflow-x-clip pb-12'
      : 'pt-4 pb-12 sm:pt-6';

  return (
    <div
      id="reading-container"
      data-reading-theme={isLessonPage ? theme : undefined}
      data-eye-comfort={isEyeComfort ? 'true' : undefined}
      data-theme={theme}
      className={cn(
        'min-h-screen overflow-x-clip transition-colors duration-200',
        isDarkApp
          ? 'scoped-dark-mode dark bg-[var(--bg-workspace)] text-[var(--text-main)]'
          : isSepiaLesson
            ? 'scoped-sepia-mode bg-[#F4EEDF] text-[#231F18]'
            : isEyeComfort
              ? 'bg-[#EAE8E1] text-[#111A18]'
              : 'bg-[var(--bg-workspace)] text-[var(--text-main)]',
      )}
    >
      {/* SKIP TO MAIN CONTENT LINK CHO BÀN PHÍM & SCREEN READER (WCAG 2.1 SC 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-xl focus:bg-[var(--bg-surface)] focus:px-4 focus:py-2.5 focus:text-xs focus:font-semibold focus:text-[var(--text-main)] focus:shadow-xl focus:ring-2 focus:ring-[var(--border-control)]"
      >
        Chuyển đến nội dung chính
      </a>

      {/* 0. TACTILE DO PAPER GRAIN SVG NOISE OVERLAY */}
      <PaperGrain />

      {/* 1. ACADEMIC OS APP SHELL (LeftRail + TopContextBar + Main Workspace + Footer + CommandPalette ⌘K) */}
      <AppShell
        isLessonPage={isLessonPage}
        isDark={isDarkApp}
        mainClassName={mainClassName}
        footer={<Footer isDarkLesson={isDarkApp} />}
      >
        {isHomePage ? (
          <Outlet />
        ) : (
          <Container size="wide">
            <Outlet />
          </Container>
        )}
      </AppShell>

      {/* 2. AUTH & NOTIFICATION MODALS */}
      <AuthModal />
      <PendingNoticeDialog />
      <LoginPromptDialog />

      {/* 3. CHẠM MẶT NƯỚC (TOUCH THE WATER) INTRO OVERLAY */}
      <WaterTouchIntro />
    </div>
  );
}

export function RootLayout() {
  return (
    <AuthProvider>
      <LayoutProvider>
        <IslandProvider>
          <ReadingSettingsProvider>
            <RootLayoutContent />
          </ReadingSettingsProvider>
        </IslandProvider>
      </LayoutProvider>
    </AuthProvider>
  );
}
export default RootLayout;
