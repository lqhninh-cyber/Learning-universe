import { GraduationCap } from 'lucide-react';
import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { AuthModal, AuthProvider, PendingNoticeDialog } from '@/features/auth';
import { LoginPromptDialog } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { Container, KagomeWeaveDivider } from '@/shared/ui';
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
    <div className="bg-vn-bg text-vn-text flex min-h-screen flex-col">
      {/* 1. FLOATING NAVIGATION BAR WITH DUAL-SPATIAL MEGA MENU */}
      <Header />

      {/* 2. MAIN OUTLET CONTAINER */}
      <main className="flex-1 pt-20 pb-12 sm:pt-24">
        <Container size="wide">
          <Outlet />
        </Container>
      </main>

      {/* 3. AUTH & NOTIFICATION MODALS */}
      <AuthModal />
      <PendingNoticeDialog />
      <LoginPromptDialog />

      {/* 4. FOOTER DI SẢN TRI THỨC */}
      <footer className="border-vn-border/70 bg-vn-surface/35 border-t">
        <KagomeWeaveDivider />
        <Container size="wide" className="space-y-6 py-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-vn-primary h-5 w-5" aria-hidden="true" />
                <span className="text-vn-text font-bold">Learning Universe</span>
                <span className="text-vn-muted text-xs">· Toán học &amp; Sư phạm</span>
              </div>
              <p className="text-vn-muted max-w-xl text-xs leading-relaxed">
                Nền tảng học tập Toán học đại học đương đại lấy cảm hứng từ cấu trúc Thư viện đình
                làng &amp; Di sản tri thức Việt Nam. Đồng hành cùng sinh viên Sư phạm Toán học với
                các học phần chuyên ngành và Khoa học Giáo dục. 100% nội dung học thuật chuẩn mực,
                nguồn mở và phi lợi nhuận.
              </p>
            </div>

            <nav
              aria-label="Điều hướng chân trang"
              className="flex flex-wrap gap-x-6 gap-y-2 text-xs"
            >
              <Link
                to={ROUTES.home}
                className="text-vn-muted hover:text-vn-primary transition-colors"
              >
                Trang chủ
              </Link>
              <Link
                to={ROUTES.courses}
                className="text-vn-muted hover:text-vn-primary transition-colors"
              >
                Tất cả môn học
              </Link>
              <Link
                to={ROUTES.subjectOverview('cau-truc-dai-so')}
                className="text-vn-muted hover:text-vn-primary transition-colors"
              >
                Cấu trúc đại số
              </Link>
              <Link
                to={ROUTES.subjectOverview('hinh-hoc-affine')}
                className="text-vn-muted hover:text-vn-primary transition-colors"
              >
                Hình học Affine &amp; Euclide
              </Link>
              <Link
                to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                className="text-vn-muted hover:text-vn-primary transition-colors"
              >
                Giải tích hàm một biến
              </Link>
              <Link
                to={ROUTES.subjectOverview('giao-duc-hoc')}
                className="font-semibold text-teal-800 transition-colors hover:text-teal-950"
              >
                Giáo dục học
              </Link>
              <Link
                to={ROUTES.glossary}
                className="text-vn-muted hover:text-vn-primary transition-colors"
              >
                Tra cứu thuật ngữ &amp; ký hiệu
              </Link>
              <Link
                to={ROUTES.uiPreview}
                className="font-semibold text-amber-800 transition-colors hover:text-amber-950"
              >
                Thử nghiệm UI V2
              </Link>
            </nav>
          </div>

          <div className="border-vn-border/50 text-vn-muted flex flex-col items-center justify-between gap-2 border-t pt-4 text-[11px] sm:flex-row">
            <p>© {new Date().getFullYear()} Learning Universe. Bảo lưu bản quyền học thuật.</p>
            <p>Không gian tri thức mở · Chuẩn mực & Khách quan</p>
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
