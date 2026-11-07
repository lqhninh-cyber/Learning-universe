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
  colorSystemPreview: '/color-system-preview',
} as const;

/**
 * Liên kết mặc định tới tệp PDF giáo trình chính thức (không bao giờ trỏ vào thư mục Drive chung).
 */
export const GOOGLE_DRIVE_DOCS_URL =
  'https://drive.google.com/file/d/1Jc3J6XZd7HKHOCsJu9w6C84FIsCNS3iM/view?usp=drive_link';

/**
 * Liên kết xem trực tiếp tệp PDF giáo trình chính và tài liệu ôn tập trên Google Drive.
 */
export const COURSE_DIRECT_PDF_LINKS: Record<string, string> = {
  'cau-truc-dai-so':
    'https://drive.google.com/file/d/17drWozpQN-4jt4si1hhCHoXslUFkYtKm/view?usp=drive_link',
  'hinh-hoc-affine':
    'https://drive.google.com/file/d/1_8iCwa-pkqmD8wNyMwKiqMKJwq4m9hxw/view?usp=drive_link',
  'giai-tich-ham-mot-bien':
    'https://drive.google.com/file/d/1VWzmofOUrvvHF_Jz7vViVy3zLNZPhL7Z/view?usp=drive_link',
  'giao-duc-hoc':
    'https://drive.google.com/file/d/1Jc3J6XZd7HKHOCsJu9w6C84FIsCNS3iM/view?usp=drive_link',
};

export const EXTERNAL_LINKS = {
  googleDriveDocs: GOOGLE_DRIVE_DOCS_URL,
  cauTrucDaiSoPdf: COURSE_DIRECT_PDF_LINKS['cau-truc-dai-so'],
  hinhHocAffinePdf: COURSE_DIRECT_PDF_LINKS['hinh-hoc-affine'],
  giaiTichHamMotBienPdf: COURSE_DIRECT_PDF_LINKS['giai-tich-ham-mot-bien'],
  giaiTichDeCuongPdf:
    'https://drive.google.com/file/d/1DPL759PtZj44I7VcCCTjfN2kkRYNZoVK/view?usp=drive_link',
  giaoDucHocPdf: COURSE_DIRECT_PDF_LINKS['giao-duc-hoc'],
} as const;
