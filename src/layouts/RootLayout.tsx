import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';
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
      data-reading-theme={isDarkLesson ? 'dark' : undefined}
      className={cn(
        'flex min-h-screen flex-col overflow-x-clip transition-colors duration-300',
        isDarkLesson
          ? 'scoped-dark-mode dark bg-[#121517] text-[#E2E8F0]'
          : 'bg-[#EAF0F1] text-[#29383D]',
      )}
    >
      {/* 0. TACTILE DO PAPER GRAIN SVG NOISE OVERLAY */}
      <PaperGrain />

      {/* 1. STICKY FROSTED NAVIGATION BAR WITH DUAL-SPATIAL MEGA MENU */}
      <Header isDarkLesson={isDarkLesson} />

      {/* 2. MAIN OUTLET CONTAINER */}
      {isHomePage ? (
        <main className="flex-1 overflow-x-clip">
          <Outlet />
        </main>
      ) : isCourseDetailPage ? (
        <main className="flex-1 overflow-x-clip pb-12">
          <Container size="wide">
            <Outlet />
          </Container>
        </main>
      ) : (
        <main className="flex-1 pt-24 pb-12 sm:pt-28">
          <Container size="wide">
            <Outlet />
          </Container>
        </main>
      )}

      {/* 3. AUTH & NOTIFICATION MODALS */}
      <AuthModal />
      <PendingNoticeDialog />
      <LoginPromptDialog />

      {/* 4. MINIMALIST SCHOLARLY FOOTER */}
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
