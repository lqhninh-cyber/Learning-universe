import { createBrowserRouter, type RouteObject } from 'react-router';
import { RootHydrateFallback, RootLayout } from '@/layouts/RootLayout';
import { ROUTES } from '@/shared/config/routes';

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
