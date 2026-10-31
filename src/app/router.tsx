import { createBrowserRouter, type RouteObject } from 'react-router';
import { RootHydrateFallback, RootLayout } from '@/layouts/RootLayout';
import { ROUTES } from '@/shared/config/routes';

const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [
      {
        path: ROUTES.devUi,
        lazy: async () => {
          const { DevUiPage } = await import('@/pages/dev-ui/DevUiPage');
          return { Component: DevUiPage };
        },
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    path: ROUTES.home,
    Component: RootLayout,
    HydrateFallback: RootHydrateFallback,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import('@/pages/home/HomePage');
          return { Component: HomePage };
        },
      },
      ...devRoutes,
      {
        path: '*',
        lazy: async () => {
          const { NotFoundPage } = await import('@/pages/not-found/NotFoundPage');
          return { Component: NotFoundPage };
        },
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
