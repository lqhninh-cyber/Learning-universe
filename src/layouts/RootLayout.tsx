import { BookOpenText, GraduationCap, Palette, User, UserCheck } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { LoginPromptDialog, useLearningStore } from '@/features/learning';
import { ROUTES } from '@/shared/config/routes';
import { Badge, Button, Container } from '@/shared/ui';

export function RootHydrateFallback() {
  return null;
}

export function RootLayout() {
  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const enableLearnerMode = useLearningStore((state) => state.enableLearnerMode);
  const signOutLearnerMode = useLearningStore((state) => state.signOutLearnerMode);

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/85 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Link
                to={ROUTES.home}
                className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-stone-900 transition-colors hover:text-stone-700"
              >
                <GraduationCap className="h-5 w-5 text-stone-800" aria-hidden="true" />
                <span>Learning Universe</span>
              </Link>
              <Badge variant="neutral" className="hidden sm:inline-flex">
                Sư phạm Toán học
              </Badge>
            </div>

            <nav aria-label="Liên kết môn học" className="hidden items-center gap-4 md:flex">
              <Link
                to={ROUTES.subjects}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                Môn học
              </Link>
              <Link
                to={ROUTES.subjectOverview('cau-truc-dai-so')}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
              >
                Cấu trúc đại số
              </Link>
              <Link
                to={ROUTES.subjectOverview('hinh-hoc-affine')}
                className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
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

      <footer className="border-t border-stone-200/80 bg-white">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Learning Universe. Nền tảng học tập Sư phạm Toán học.</p>
          <p>Giai đoạn 3 — Không gian học tập công khai & Điều hướng bài học</p>
        </Container>
      </footer>
    </div>
  );
}
