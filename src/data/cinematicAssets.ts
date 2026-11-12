/**
 * Quản lý tập trung hệ thống hình ảnh cảnh quan & kiến trúc học thuật Việt Nam
 * cho giao diện Cinematic Architectural Editorial của Learning Universe.
 *
 * Khi bổ sung học phần mới (10–20 môn học), chỉ cần thêm một mục vào `COURSE_CINEMATIC_ASSETS`.
 */

export type AcademicBranch = 'math' | 'pedagogy';

export interface CinematicSceneAsset {
  readonly id: string;
  readonly slug: string;
  /** Mã học phần chính thức, ví dụ: MATH1301, EDUC2802 */
  readonly courseCode: string;
  /** Phân nhánh học thuật dùng cho bộ lọc trên Course Hub */
  readonly branch: AcademicBranch;
  /** Nhãn phân loại hiển thị trực diện, ví dụ: "MATH1301 · Toán học" */
  readonly categoryLabel: string;
  /** Tên chính thức của môn học */
  readonly title: string;
  /** Mô tả cơ bản, cô đọng đúng trọng tâm chuyên môn của môn học */
  readonly conciseDescription: string;
  /** Địa danh / Kiến trúc Việt Nam đại diện */
  readonly vietnameseLandmark: string;
  /** Ý nghĩa ẩn dụ học thuật của cảnh quan */
  readonly visualMetaphor: string;
  /** Đường dẫn ảnh nội bộ trong public/images/scenes/ (ưu tiên khi triển khai offline/self-hosted) */
  readonly localSrc: string;
  /** Đường dẫn CDN ảnh chất lượng cao (16:9, tối ưu tốc độ tải) */
  readonly remoteSrc: string;
  /** Văn bản thay thế chuẩn trợ năng (WCAG AAA) */
  readonly alt: string;
  /** Tọa độ địa lý thực tế của danh thắng / kiến trúc Việt Nam */
  readonly coordinates: string;
}

/**
 * Cảnh mở màn Trang chủ (Screen 1 — The Opening):
 * Khuê Văn Các (Văn Miếu - Quốc Tử Giám) & mặt nước hồ Văn tĩnh lặng trong nắng sớm.
 */
export const HOMEPAGE_OPENING_ASSET = {
  id: 'vn-khue-van-cac-opening',
  vietnameseLandmark: 'Khuê Văn Các · Văn Miếu – Quốc Tử Giám',
  subtitle: 'Biểu tượng truyền thống hiếu học và tinh hoa tri thức Việt Nam',
  localSrc: '/images/scenes/vn-khue-van-cac-opening.jpg',
  remoteSrc:
    'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=2400&q=85',
  alt: 'Kiến trúc truyền thống Việt Nam phản chiếu mặt nước tĩnh lặng trong nắng sớm',
  coordinates: '21°01′43″N · 105°50′08″E',
} as const;

/**
 * Danh mục cảnh quan Việt Nam & thông tin chuyên môn cô đọng cho từng học phần.
 */
export const COURSE_CINEMATIC_ASSETS: Readonly<Record<string, CinematicSceneAsset>> = {
  'cau-truc-dai-so': {
    id: 'algebraic-structures',
    slug: 'cau-truc-dai-so',
    courseCode: 'MATH1301',
    branch: 'math',
    categoryLabel: 'Toán học',
    title: 'Cấu trúc đại số',
    conciseDescription:
      'Khảo sát các cấu trúc đại số nền tảng gồm nhóm, vành, miền nguyên, trường, cùng lý thuyết đồng cấu, cấu trúc thương và các định lý đẳng cấu.',
    vietnameseLandmark: 'Kiến trúc Cổng vòm & Hành lang Đối xứng · Cố đô Huế',
    visualMetaphor: 'Tính đối xứng trục, phép biến hình bảo toàn cấu trúc và trật tự tiên đề',
    localSrc: '/images/scenes/vn-hue-symmetry-algebra.jpg',
    remoteSrc:
      'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=2400&q=85',
    alt: 'Kiến trúc cổng vòm đối xứng chuẩn mực của di sản cố đô Huế Việt Nam',
    coordinates: '16°28′10″N · 107°34′40″E',
  },
  'hinh-hoc-affine': {
    id: 'affine-geometry',
    slug: 'hinh-hoc-affine',
    courseCode: 'MATH1302',
    branch: 'math',
    categoryLabel: 'Toán học',
    title: 'Hình học Affine và hình học Euclide',
    conciseDescription:
      'Xây dựng không gian và ánh xạ affine từ không gian véc-tơ, tâm tỉ cự, phẳng con, tỉ số đơn, cùng cấu trúc tích vô hướng và biến đổi đẳng cự trong không gian Euclide.',
    vietnameseLandmark: 'Vịnh Hạ Long & Tràng An – Ninh Bình',
    visualMetaphor: 'Phép chiếu phối cảnh không gian xa gần và mặt phẳng phản chiếu đối xứng gương',
    localSrc: '/images/scenes/vn-ha-long-trang-an-affine.jpg',
    remoteSrc:
      'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=2400&q=85',
    alt: 'Cảnh quan không gian chiều sâu hùng vĩ của Vịnh Hạ Long và mặt nước phẳng lặng như gương',
    coordinates: '20°54′36″N · 107°04′30″E',
  },
  'giai-tich-ham-mot-bien': {
    id: 'single-variable-calculus',
    slug: 'giai-tich-ham-mot-bien',
    courseCode: 'MATH1303',
    branch: 'math',
    categoryLabel: 'Toán học',
    title: 'Giải tích hàm một biến',
    conciseDescription:
      'Trình bày hệ thống số thực, giới hạn dãy số và hàm số, tính liên tục, phép tính vi phân, tích phân Riemann, tích phân suy rộng và lý thuyết chuỗi trên đường thẳng thực.',
    vietnameseLandmark: 'Ruộng bậc thang Mù Cang Chải · Tây Bắc Việt Nam',
    visualMetaphor: 'Đường cong liên tục, các lát cắt tổng tích phân Riemann và độ dốc tiếp tuyến',
    localSrc: '/images/scenes/vn-mu-cang-chai-terraces-calculus.jpg',
    remoteSrc:
      'https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&w=2400&q=85',
    alt: 'Những đường cong uốn lượn liên tục của ruộng bậc thang Mù Cang Chải Tây Bắc trong sương sớm',
    coordinates: '21°51′00″N · 104°05′00″E',
  },
  'giao-duc-hoc': {
    id: 'giao-duc-hoc',
    slug: 'giao-duc-hoc',
    courseCode: 'EDUC2802',
    branch: 'pedagogy',
    categoryLabel: 'Khoa học Giáo dục',
    title: 'Giáo dục học',
    conciseDescription:
      'Nghiên cứu hoạt động sư phạm và nhân cách người giáo viên, những vấn đề chung của giáo dục học, lý luận hoạt động giáo dục ở nhà trường phổ thông, công tác giáo viên chủ nhiệm lớp và tổ chức hoạt động trải nghiệm, hướng nghiệp.',
    vietnameseLandmark: 'Hành lang Kiến trúc Học đường Đông Dương · Quốc Học Huế & HCMUE',
    visualMetaphor: 'Không gian giảng đường ngập nắng ấm áp, nhân văn và truyền thống sư phạm',
    localSrc: '/images/scenes/vn-indochine-campus-pedagogy.jpg',
    remoteSrc:
      'https://images.unsplash.com/photo-1540611025311-01df3cef54b5?auto=format&fit=crop&w=2400&q=85',
    alt: 'Không gian hành lang kiến trúc học đường Việt Nam ngập nắng sớm ấm áp',
    coordinates: '10°45′42″N · 106°40′56″E',
  },
};

/**
 * Tra cứu cấu hình cảnh quan & thông tin học thuật cô đọng theo `slug` hoặc `id` môn học.
 */
export function getCourseCinematicAsset(slugOrId: string): CinematicSceneAsset {
  const matched =
    COURSE_CINEMATIC_ASSETS[slugOrId] ??
    Object.values(COURSE_CINEMATIC_ASSETS).find((item) => item.id === slugOrId);

  if (matched) {
    return matched;
  }

  return {
    id: slugOrId,
    slug: slugOrId,
    courseCode: 'MATH1000',
    branch: 'math',
    categoryLabel: 'Toán học',
    title: slugOrId,
    conciseDescription: 'Học phần chuyên ngành thuộc chương trình đào tạo Sư phạm Toán học.',
    vietnameseLandmark: HOMEPAGE_OPENING_ASSET.vietnameseLandmark,
    visualMetaphor: HOMEPAGE_OPENING_ASSET.subtitle,
    localSrc: HOMEPAGE_OPENING_ASSET.localSrc,
    remoteSrc: HOMEPAGE_OPENING_ASSET.remoteSrc,
    alt: HOMEPAGE_OPENING_ASSET.alt,
    coordinates: HOMEPAGE_OPENING_ASSET.coordinates,
  };
}
