import {
  BookOpenText,
  Clock,
  Compass,
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  Palette,
  ShieldCheck,
  User,
  UserCheck,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { AuthModal, AuthProvider, PendingNoticeDialog, useAuth } from '@/features/auth';
import { LoginPromptDialog, useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { Badge, Button, Container, Drawer, KagomeWeaveDivider } from '@/shared/ui';

export function RootHydrateFallback() {
  return null;
}

function RootLayoutContent() {
  const {
    user,
    isAuthenticated,
    isAdmin,
    isPending,
    isApprovedStudent,
    openAuthModal,
    openPendingNotice,
    signOut,
  } = useAuth();

  const isStoreAuthenticated = useLearningStore((state) => state.isAuthenticated);
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

  const handleSignOut = async () => {
    signOutLearnerMode();
    await signOut();
  };

  const isUserLoggedIn = isAuthenticated || isStoreAuthenticated;

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
                    Hình học Affine và hình học Euclide
                  </Link>
                  <Link
                    to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-vn-text hover:bg-vn-surface block rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    Giải tích hàm một biến
                  </Link>
                  <Link
                    to={ROUTES.glossary}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-vn-text hover:bg-vn-surface block rounded-xl px-3 py-2.5 text-sm font-medium"
                  >
                    Tra cứu thuật ngữ & ký hiệu
                  </Link>

                  {isAdmin && (
                    <Link
                      to={ROUTES.adminUsers}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2 rounded-xl bg-purple-50/70 px-3 py-2.5 text-sm font-semibold text-purple-800 hover:bg-purple-100"
                    >
                      <Users className="h-4 w-4" aria-hidden="true" />
                      <span>Quản lý học viên</span>
                    </Link>
                  )}

                  <div className="border-t border-stone-200 pt-3">
                    {isUserLoggedIn ? (
                      <div className="space-y-2 px-1">
                        <div className="text-xs text-stone-500">
                          Đăng nhập: {user?.fullName || user?.email || 'Học viên'}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            void handleSignOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full justify-start text-xs text-rose-700"
                        >
                          <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                          <span>Đăng xuất</span>
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="subject"
                        size="sm"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          openAuthModal();
                        }}
                        className="w-full justify-start text-xs"
                      >
                        <LogIn className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        <span>Đăng nhập</span>
                      </Button>
                    )}
                  </div>
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
                Toán học
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
                Hình học Affine và hình học Euclide
              </Link>
              <Link
                to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                className="text-vn-muted hover:text-vn-text text-sm font-medium transition-colors"
              >
                Giải tích hàm một biến
              </Link>
              <Link
                to={ROUTES.glossary}
                className="text-vn-muted hover:text-vn-text text-sm font-medium transition-colors"
              >
                Thuật ngữ & Ký hiệu
              </Link>
            </nav>
          </div>

          <nav aria-label="Điều hướng tài khoản và tiện ích" className="flex items-center gap-2">
            {isUserLoggedIn ? (
              <div className="flex items-center gap-2">
                {/* Khi là Quản trị viên (Admin): Hiển thị nút liên kết trực tiếp đến trang /admin/users */}
                {isAdmin && (
                  <Link
                    to={ROUTES.adminUsers}
                    className="flex items-center gap-1.5 rounded-lg border border-purple-300 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-900 shadow-2xs transition-colors hover:bg-purple-100"
                    title="Truy cập Trang quản lý và xét duyệt học viên"
                  >
                    <Users className="h-3.5 w-3.5 text-purple-700" aria-hidden="true" />
                    <span>Quản lý học viên</span>
                  </Link>
                )}

                {/* Huy hiệu Chờ duyệt: Chỉ hiển thị khi KHÔNG PHẢI Admin VÀ status === 'pending' */}
                {isPending && (
                  <button
                    type="button"
                    onClick={openPendingNotice}
                    title="Tài khoản đang chờ phê duyệt. Nhấp để xem chi tiết."
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
                  >
                    <Clock className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
                    <span>Chờ duyệt</span>
                  </button>
                )}

                {/* Trạng thái Đã duyệt: Hiển thị badge Học viên khi đã duyệt và không phải Admin */}
                {!isAdmin && (isApprovedStudent || (!user && isStoreAuthenticated)) && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" />
                    <span>Học viên</span>
                  </div>
                )}

                {/* Tên người dùng */}
                <span
                  className="hidden max-w-[140px] truncate text-xs font-medium text-stone-700 sm:inline-block"
                  title={user?.fullName || user?.email || 'Học viên'}
                >
                  {user?.fullName || user?.email || 'Học viên'}
                </span>

                {/* Nút Đăng xuất */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleSignOut()}
                  title="Đăng xuất khỏi phiên học tập"
                  className="h-8 px-2 text-stone-500 hover:text-stone-800"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={openAuthModal}
                title="Đăng nhập tài khoản Google để kích hoạt đầy đủ quyền hạn học viên"
                className="gap-1.5"
              >
                <User className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                <span>Đăng nhập</span>
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

      <AuthModal />
      <PendingNoticeDialog />
      <LoginPromptDialog />

      <footer className="border-vn-border/70 bg-vn-surface/35 border-t">
        <KagomeWeaveDivider />
        <Container className="space-y-6 py-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-vn-primary h-5 w-5" aria-hidden="true" />
                <span className="text-vn-text font-bold">Learning Universe</span>
                <span className="text-vn-muted text-xs">· Toán học</span>
              </div>
              <p className="text-vn-muted max-w-xl text-xs leading-relaxed">
                Nền tảng học tập Toán học đại học đương đại lấy cảm hứng từ cấu trúc Thư viện đình
                làng & Di sản tri thức Việt Nam. 100% nội dung học thuật chuẩn mực, nguồn mở và phi
                lợi nhuận.
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
                to={ROUTES.subjects}
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
                Hình học Affine và hình học Euclide
              </Link>
              <Link
                to={ROUTES.subjectOverview('giai-tich-ham-mot-bien')}
                className="text-vn-muted hover:text-vn-primary transition-colors"
              >
                Giải tích hàm một biến
              </Link>
              <Link
                to={ROUTES.glossary}
                className="text-vn-muted hover:text-vn-primary transition-colors"
              >
                Tra cứu thuật ngữ & ký hiệu
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
