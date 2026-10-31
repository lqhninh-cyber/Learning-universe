import { BookOpenText, Palette } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { Badge, Container } from '@/shared/ui';

export function RootHydrateFallback() {
  return null;
}

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/85 backdrop-blur-md">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to={ROUTES.home}
              className="text-lg font-semibold tracking-tight text-stone-900 transition-colors hover:text-stone-700"
            >
              Learning Universe
            </Link>
            <Badge variant="neutral">Sư phạm Toán học</Badge>
          </div>

          <nav aria-label="Điều hướng chính" className="flex items-center gap-2">
            {import.meta.env.DEV && (
              <>
                <Link
                  to={ROUTES.devUi}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <Palette className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                  <span>Design System</span>
                </Link>
                <Link
                  to={ROUTES.devMdx}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 hover:text-stone-900"
                >
                  <BookOpenText className="h-3.5 w-3.5 text-stone-500" aria-hidden="true" />
                  <span>MDX Engine</span>
                </Link>
              </>
            )}
          </nav>
        </Container>
      </header>

      <main className="flex-1 py-12">
        <Container>
          <Outlet />
        </Container>
      </main>

      <footer className="border-t border-stone-200/80 bg-white">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-stone-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Learning Universe. Nền tảng học tập Sư phạm Toán học.</p>
          <p>Giai đoạn 1 — Design System & Subject Theming</p>
        </Container>
      </footer>
    </div>
  );
}
