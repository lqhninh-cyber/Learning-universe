/**
 * Hằng số đường dẫn tiếng Việt không dấu (kebab-case) theo quyết định D8.
 */
export const ROUTES = {
  home: '/',
  subjects: '/mon-hoc',
  subjectOverview: (subjectSlug: string) => `/mon-hoc/${subjectSlug}`,
  lesson: (subjectSlug: string, chapterSlug: string, lessonSlug: string) =>
    `/mon-hoc/${subjectSlug}/${chapterSlug}/${lessonSlug}`,
  lessonShortcut: (lessonOrChapterSlug: string) => `/bai-hoc/${lessonOrChapterSlug}`,
  glossary: '/thuat-ngu',
  about: '/gioi-thieu',
  auth: {
    signIn: '/dang-nhap',
    signUp: '/dang-ky',
    forgotPassword: '/quen-mat-khau',
    resetPassword: '/dat-lai-mat-khau',
    callback: '/auth/callback',
  },
  account: {
    root: '/ca-nhan',
    bookmarks: '/ca-nhan/yeu-thich',
    notes: '/ca-nhan/ghi-chu',
  },
  editorial: '/bien-tap',
  devUi: '/dev/ui',
  devMdx: '/dev/mdx',
  devPreview: '/dev/preview',
  devFigures: '/dev/figures',
} as const;
