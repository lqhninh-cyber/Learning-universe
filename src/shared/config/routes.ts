/**
 * Hằng số đường dẫn tiếng Việt không dấu (kebab-case) theo quyết định D8.
 */
export const ROUTES = {
  home: '/',
  subjects: '/mon-hoc',
  courses: '/courses',
  subjectOverview: (subjectSlug: string) => `/mon-hoc/${subjectSlug}`,
  courseOverview: (courseSlug: string) => `/courses/${courseSlug}`,
  subjectExams: (subjectSlug: string) => `/mon-hoc/${subjectSlug}/de-thi`,
  coursesExams: (subjectSlug: string) => `/courses/${subjectSlug}/de-thi`,
  lesson: (subjectSlug: string, chapterSlug: string, lessonSlug: string) =>
    `/mon-hoc/${subjectSlug}/${chapterSlug}/${lessonSlug}`,
  lessonShortcut: (lessonOrChapterSlug: string) => `/bai-hoc/${lessonOrChapterSlug}`,
  glossary: '/thuat-ngu',
  adminUsers: '/admin/users',
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
  uiPreview: '/ui-preview',
} as const;

/**
 * Thư mục Google Drive chính thức lưu trữ toàn bộ tài liệu & giáo trình môn học.
 */
export const GOOGLE_DRIVE_DOCS_URL =
  'https://drive.google.com/drive/folders/1uHHOAep9ZRI5BKcOnJeTRpxwsHek8rZ1?usp=drive_link';

export const EXTERNAL_LINKS = {
  googleDriveDocs: GOOGLE_DRIVE_DOCS_URL,
} as const;
