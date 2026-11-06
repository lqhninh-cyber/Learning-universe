import { GraduationCap } from 'lucide-react';
import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { AuthModal, AuthProvider, PendingNoticeDialog } from '@/features/auth';
import { LoginPromptDialog } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { Container } from '@/shared/ui';
import { Header } from './Header';

export function RootHydrateFallback() {
  return null;
}

function RootLayoutContent() {
  const { pathname, hash } = useLocation();

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
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] text-stone-900">
      {/* 1. STICKY FROSTED NAVIGATION BAR WITH DUAL-SPATIAL MEGA MENU */}
      <Header />

      {/* 2. MAIN OUTLET CONTAINER */}
      <main className="flex-1 pt-6 pb-12 sm:pt-8">
        <Container size="wide">
          <Outlet />
        </Container>
      </main>

      {/* 3. AUTH & NOTIFICATION MODALS */}
      <AuthModal />
      <PendingNoticeDialog />
      <LoginPromptDialog />

      {/* 4. MINIMALIST SCHOLARLY FOOTER */}
      <footer className="border-t border-stone-200/70 bg-[#FDFBF7]/90">
        <Container size="wide" className="space-y-6 py-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-[#9A3412]" aria-hidden="true" />
                <span className="font-serif font-bold text-stone-950">Learning Universe</span>
                <span className="text-xs text-stone-500">· Toán học &amp; Sư phạm</span>
              </div>
              <p className="max-w-xl text-xs leading-relaxed text-stone-600">
                Học viện Tri thức Toán học &amp; Khoa học Giáo dục. Đồng hành cùng sinh viên Sư phạm
                Toán học với các học phần chuyên ngành và Nghiệp vụ Sư phạm chuẩn mực. 100% nội dung
                học thuật nguồn mở và phi lợi nhuận.
              </p>
            </div>

            <nav
              aria-label="Điều hướng chân trang"
              className="flex flex-wrap gap-x-6 gap-y-2 text-xs"
            >
              <Link
                to={ROUTES.home}
                className="text-stone-600 transition-colors hover:text-[#9A3412]"
              >
                Trang chủ
              </Link>
              <Link
                to={ROUTES.courses}
                className="text-stone-600 transition-colors hover:text-[#9A3412]"
              >
                Tất cả môn học
              </Link>
              <Link
                to={ROUTES.subjectOverview('cau-truc-dai-so')}
                className="text-stone-600 transition-colors hover:text-[#9A3412]"
              >
                Cấu trúc đại số
              </Link>
              <Link
                to={ROUTES.subjectOverview('hinh-hoc-affine')}
                className="text-stone-600 transition-colors hover:text-[#9A3412]"
              >
                Hình học Affine &amp; Euclide
              </Link>
              <Link
                to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                className="text-stone-600 transition-colors hover:text-[#9A3412]"
              >
                Giải tích hàm một biến
              </Link>
              <Link
                to={ROUTES.subjectOverview('giao-duc-hoc')}
                className="font-semibold text-indigo-950 transition-colors hover:text-[#9A3412]"
              >
                Giáo dục học
              </Link>
              <Link
                to={ROUTES.glossary}
                className="text-stone-600 transition-colors hover:text-[#9A3412]"
              >
                Ngân hàng Thuật ngữ
              </Link>
            </nav>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 border-t border-stone-200/60 pt-4 text-[11px] text-stone-500 sm:flex-row">
            <p>© {new Date().getFullYear()} Learning Universe. Bảo lưu bản quyền học thuật.</p>
            <p>Không gian tri thức mở · Chuẩn mực &amp; Khách quan</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}

export function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
export default RootLayout;
