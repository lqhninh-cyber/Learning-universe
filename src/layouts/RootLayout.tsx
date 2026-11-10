import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
import { WaterTouchIntro } from '@/components/intro';
import { Footer } from '@/components/layout/Footer';
import { ReadingSettingsProvider, useReadingSettings } from '@/context/ReadingSettingsContext';
import { AuthModal, AuthProvider, PendingNoticeDialog } from '@/features/auth';
import { LoginPromptDialog } from '@/features/learning';
import { PaperGrain } from '@/shared/components/PaperGrain';
import { ROUTES } from '@/shared/config/routes';
import { cn } from '@/shared/lib/cn';
import { Container } from '@/shared/ui';
import { Header } from './Header';

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
  const isDarkLesson = isLessonPage && theme === 'dark';
  const isSepiaLesson = isLessonPage && theme === 'sepia';

  useEffect(() => {
    if (!hash && typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'instant' });
      } catch {
        // Bỏ qua trong môi trường jsdom khi kiểm thử
      }
    }
  }, [pathname, hash]);

  return (
    <div
      id="reading-container"
      data-reading-theme={isLessonPage ? theme : undefined}
      data-theme={theme}
      className={cn(
        'flex min-h-screen flex-col overflow-x-clip transition-colors duration-300',
        isDarkLesson
          ? 'scoped-dark-mode dark bg-[#121517] text-[#E2E8F0]'
          : isSepiaLesson
            ? 'scoped-sepia-mode bg-[#F4EEDF] text-[#231F18]'
            : 'bg-[var(--bg-page)] text-[var(--text-main)]',
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

      {/* 1. STICKY FROSTED NAVIGATION BAR WITH DUAL-SPATIAL MEGA MENU */}
      <Header isDarkLesson={isDarkLesson} readingTheme={isLessonPage ? theme : 'light'} />

      {/* 2. MAIN OUTLET CONTAINER */}
      {isHomePage ? (
        <main id="main-content" className="flex-1 overflow-x-clip">
          <Outlet />
        </main>
      ) : isCourseDetailPage ? (
        <main id="main-content" className="flex-1 overflow-x-clip pb-12">
          <Container size="wide">
            <Outlet />
          </Container>
        </main>
      ) : (
        <main id="main-content" className="flex-1 pt-24 pb-12 sm:pt-28">
          <Container size="wide">
            <Outlet />
          </Container>
        </main>
      )}

      {/* 3. AUTH & NOTIFICATION MODALS */}
      <AuthModal />
      <PendingNoticeDialog />
      <LoginPromptDialog />

      {/* 4. CHẠM MẶT NƯỚC (TOUCH THE WATER) INTRO OVERLAY */}
      <WaterTouchIntro />

      {/* 5. MINIMALIST SCHOLARLY FOOTER */}
      <Footer isDarkLesson={isDarkLesson} />
    </div>
  );
}

export function RootLayout() {
  return (
    <AuthProvider>
      <ReadingSettingsProvider>
        <RootLayoutContent />
      </ReadingSettingsProvider>
    </AuthProvider>
  );
}
export default RootLayout;
