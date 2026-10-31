import { Outlet, useParams } from 'react-router';
import { getSubjectBySlug } from '@/content-runtime';
import { resolveSubjectThemeId } from '@/shared/theme/subject-themes';
import { SubjectThemeProvider } from '@/shared/theme/SubjectThemeProvider';

export function SubjectLayout() {
  const { subjectSlug } = useParams<{ subjectSlug: string }>();
  const subject = subjectSlug ? getSubjectBySlug(subjectSlug) : undefined;
  const themeId = resolveSubjectThemeId(subject?.slug ?? subject?.id ?? subjectSlug);

  return (
    <SubjectThemeProvider subject={themeId}>
      <Outlet />
    </SubjectThemeProvider>
  );
}
