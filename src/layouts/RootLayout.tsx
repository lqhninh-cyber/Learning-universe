import { Link, Outlet } from 'react-router';
import { ROUTES } from '@/shared/config/routes';

export function RootHydrateFallback() {
  return null;
}

export function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900">
      <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to={ROUTES.home}
            className="text-lg font-semibold tracking-tight text-stone-900 transition-colors hover:text-stone-700"
          >
            Learning Universe
          </Link>
          <span className="rounded-full border border-stone-200 bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600">
            Sư phạm Toán học
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200/80 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-xs text-stone-500 sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Learning Universe. Nền tảng học tập Sư phạm Toán học.</p>
          <p>Giai đoạn 0 — Khởi tạo dự án</p>
        </div>
      </footer>
    </div>
  );
}
