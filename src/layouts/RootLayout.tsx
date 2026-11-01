import {
  BookOpenText,
  Compass,
  GraduationCap,
  Menu,
  Palette,
  ShieldCheck,
  User,
  UserCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { LoginPromptDialog, useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { Badge, Button, Container, Drawer } from '@/shared/ui';

export function RootHydrateFallback() {
  return null;
}

export function RootLayout() {
  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);
  const signOutLearnerMode = useLearningStore((state) => state.signOutLearnerMode);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <header className="border-vn-border/70 bg-vn-bg/90 sticky top-0 z-30 border-b backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="md:hidden">
              <Drawer
                open={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}
                side="left"
                title="Điều hướng Learning Universe"
                trigger={
                  <Button variant="ghost" size="icon" aria-label="Mở menu điều hướng">
                    <Menu className="h-5 w-5" aria-hidden="true" />
                  </Button>
                }
              >
                <nav aria-label="Menu điều hướng di động" className="space-y-2">
                  <Link
                    to={ROUTES.home}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-vn-text hover:bg-vn-surface block rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    Trang chủ
                  </Link>
                  <Link
                    to={ROUTES.subjects}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-vn-text hover:bg-vn-surface block rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    Tất cả môn học
                  </Link>
                  <Link
                    to={ROUTES.subjectOverview('cau-truc-dai-so')}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-vn-text hover:bg-vn-surface block rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    Cấu trúc đại số
                  </Link>
                  <Link
                    to={ROUTES.subjectOverview('hinh-hoc-affine')}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-vn-text hover:bg-vn-surface block rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    Hình học Affine
                  </Link>
                </nav>
              </Drawer>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.home}
                className="text-vn-text hover:text-vn-primary inline-flex items-center gap-2 text-lg font-semibold tracking-tight transition-colors"
              >
                <GraduationCap className="text-vn-primary h-5 w-5" aria-hidden="true" />
                <span>Learning Universe</span>
              </Link>
              <Badge
                variant="neutral"
                className="border-vn-border bg-vn-surface/60 text-vn-primary hidden font-medium sm:inline-flex"
              >
                Sư phạm Toán học
              </Badge>
            </div>

            <nav aria-label="Liên kết môn học" className="hidden items-center gap-4 md:flex">
              <Link
                to={ROUTES.subjects}
                className="text-vn-muted hover:text-vn-text text-sm font-medium transition-colors"
              >
                Môn học
              </Link>
              <Link
                to={ROUTES.subjectOverview('cau-truc-dai-so')}
                className="text-vn-muted hover:text-vn-text text-sm font-medium transition-colors"
              >
                Cấu trúc đại số
              </Link>
              <Link
                to={ROUTES.subjectOverview('hinh-hoc-affine')}
                className="text-vn-muted hover:text-vn-text text-sm font-medium transition-colors"
              >
                Hình học Affine
              </Link>
            </nav>
          </div>

          <nav aria-label="Điều hướng chính" className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={signOutLearnerMode}
                title="Nhấn để chuyển về chế độ Khách"
              >
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                <span>Chế độ Học viên</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => enableLearnerMode()}
                title="Kích hoạt chế độ Học viên để lưu tiến độ và ghi chú"
              >
                <User className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                <span>Chế độ Khách</span>
              </Button>
            )}

            {import.meta.env.DEV && (
              <>
                <Link
                  to={ROUTES.devUi}
                  className="hidden items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 lg:inline-flex"
                >
                  <Palette className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                  <span>Design System</span>
                </Link>
                <Link
                  to={ROUTES.devMdx}
                  className="hidden items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 lg:inline-flex"
                >
                  <BookOpenText className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                  <span>MDX Engine</span>
                </Link>
                <Link
                  to={ROUTES.devPreview}
                  className="hidden items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 lg:inline-flex"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                  <span>Kiểm định</span>
                </Link>
                <Link
                  to={ROUTES.devFigures}
                  className="hidden items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900 lg:inline-flex"
                >
                  <Compass className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                  <span>Figure Kit</span>
                </Link>
              </>
            )}
          </nav>
        </Container>
      </header>

      <main className="flex-1 py-10 sm:py-12">
        <Container>
          <Outlet />
        </Container>
      </main>

      <LoginPromptDialog />

      <footer className="border-vn-border/70 bg-vn-surface/40 border-t">
        <Container className="text-vn-muted flex flex-col items-center justify-between gap-2 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Learning Universe. Nền tảng học tập Sư phạm Toán học.</p>
          <p className="text-vn-muted">Không gian học tập đại học đương đại · Di sản & Tri thức</p>
        </Container>
      </footer>
    </div>
  );
}
