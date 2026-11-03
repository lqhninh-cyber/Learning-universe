import { type ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router';
import { ROUTES } from '@/shared/config/routes';
import { useAuth } from './useAuth';

export interface ProtectedRouteProps {
  readonly requireAdmin?: boolean;
  readonly children?: ReactNode;
}

export function ProtectedRoute({ requireAdmin = false, children }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-stone-400 border-t-stone-800" />
          <p className="mt-3 font-sans text-xs text-stone-500">
            Đang xác thực thông tin tài khoản...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to={ROUTES.home} replace />;
  }

  if (children) {
    return <>{children}</>;
  }

  return <Outlet />;
}
