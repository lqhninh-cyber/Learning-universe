import { createBrowserRouter, type RouteObject } from 'react-router';
import { RootHydrateFallback, RootLayout } from '@/layouts/RootLayout';
import { SubjectLayout } from '@/layouts/SubjectLayout';
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
      {
        path: ROUTES.devMdx,
        lazy: async () => {
          const { DevMdxPage } = await import('@/pages/dev-mdx/DevMdxPage');
          return { Component: DevMdxPage };
        },
      },
      {
        path: ROUTES.devPreview,
        lazy: async () => {
          const { DevPreviewPage } = await import('@/pages/dev-preview/DevPreviewPage');
          return { Component: DevPreviewPage };
        },
      },
      {
        path: ROUTES.devFigures,
        lazy: async () => {
          const { DevFiguresPage } = await import('@/pages/dev-figures/DevFiguresPage');
          return { Component: DevFiguresPage };
        },
      },
    ]
  : [];

export const routes: RouteObject[] = [
  {
    path: ROUTES.uiPreview,
    lazy: async () => {
      const { UiPreviewPage } = await import('@/pages/ui-preview/UiPreviewPage');
      return { Component: UiPreviewPage };
    },
  },
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
        path: ROUTES.subjects,
        lazy: async () => {
          const { SubjectsListPage } = await import('@/pages/subjects/SubjectsListPage');
          return { Component: SubjectsListPage };
        },
      },
      {
        path: ROUTES.courses,
        lazy: async () => {
          const { SubjectsListPage } = await import('@/pages/subjects/SubjectsListPage');
          return { Component: SubjectsListPage };
        },
      },
      {
        path: ROUTES.glossary,
        lazy: async () => {
          const { GlossaryPage } = await import('@/pages/glossary/GlossaryPage');
          return { Component: GlossaryPage };
        },
      },
      {
        path: ROUTES.adminUsers,
        lazy: async () => {
          const { ProtectedRoute } = await import('@/features/auth');
          const { AdminUsersPage } = await import('@/pages/admin/AdminUsersPage');
          return {
            Component: () => (
              <ProtectedRoute requireAdmin>
                <AdminUsersPage />
              </ProtectedRoute>
            ),
          };
        },
      },
      {
        path: '/glossary',
        lazy: async () => {
          const { GlossaryPage } = await import('@/pages/glossary/GlossaryPage');
          return { Component: GlossaryPage };
        },
      },
      {
        path: '/mon-hoc/:subjectSlug',
        Component: SubjectLayout,
        children: [
          {
            index: true,
            lazy: async () => {
              const { SubjectOverviewPage } = await import('@/pages/subjects/SubjectOverviewPage');
              return { Component: SubjectOverviewPage };
            },
          },
          {
            path: 'de-thi',
            lazy: async () => {
              const { SubjectExamsPage } = await import('@/pages/exams/SubjectExamsPage');
              return { Component: SubjectExamsPage };
            },
          },
          {
            path: 'lessons/:lessonSlug',
            lazy: async () => {
              const { LessonShortcutRedirectPage } =
                await import('@/pages/lesson/LessonShortcutRedirectPage');
              return { Component: LessonShortcutRedirectPage };
            },
          },
          {
            path: ':chapterSlug/:lessonSlug',
            lazy: async () => {
              const { LessonPage } = await import('@/pages/lesson/LessonPage');
              return { Component: LessonPage };
            },
          },
        ],
      },
      {
        path: '/courses/:subjectSlug',
        Component: SubjectLayout,
        children: [
          {
            index: true,
            lazy: async () => {
              const { CourseDetailPage } = await import('@/pages/courses/CourseDetailPage');
              return { Component: CourseDetailPage };
            },
          },
          {
            path: 'de-thi',
            lazy: async () => {
              const { SubjectExamsPage } = await import('@/pages/exams/SubjectExamsPage');
              return { Component: SubjectExamsPage };
            },
          },
          {
            path: 'lessons/:lessonSlug',
            lazy: async () => {
              const { LessonShortcutRedirectPage } =
                await import('@/pages/lesson/LessonShortcutRedirectPage');
              return { Component: LessonShortcutRedirectPage };
            },
          },
          {
            path: ':chapterSlug/:lessonSlug',
            lazy: async () => {
              const { LessonPage } = await import('@/pages/lesson/LessonPage');
              return { Component: LessonPage };
            },
          },
        ],
      },
      {
        path: '/bai-hoc/:lessonSlug',
        lazy: async () => {
          const { LessonShortcutRedirectPage } =
            await import('@/pages/lesson/LessonShortcutRedirectPage');
          return { Component: LessonShortcutRedirectPage };
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
