import type { ManifestSubject } from '@schemas/index';
import type { CompiledLessonModule } from '@/content-runtime/loader';
import { createElement, type FC } from 'react';
import { GOOGLE_DRIVE_DOCS_URL } from '@/shared/config/routes';
import { getChapter1LessonModule } from './chapter-1';
import { getChapter2LessonModule } from './chapter-2';
import { getChapter3LessonModule } from './chapter-3';
import { getChapter4LessonModule } from './chapter-4';
import { getChapter5LessonModule } from './chapter-5';
import { getChapter6LessonModule, PEDAGOGICAL_20_CASE_STUDIES } from './chapter-6';

// ============================================================================
// 0. SIÊU DỮ LIỆU ĐỀ CƯƠNG CHI TIẾT HỌC PHẦN EDUC2802 (K50-51) & HỆ THỐNG 9 CLO
// ============================================================================

export interface Educ2802CloItem {
  readonly code: string;
  readonly group: 'Kiến thức' | 'Kỹ năng' | 'Mức tự chủ và trách nhiệm';
  readonly description: string;
  readonly chapters: string;
}

export const EDUC2802_SYLLABUS_META = {
  courseName: 'Giáo dục học',
  courseCode: 'EDUC2802',
  cohort: 'K50–51',
  credits: '04 tín chỉ',
  classHours: '80 tiết trên lớp (40 Lý thuyết, 20 Thảo luận, 20 Thực hành)',
  selfStudyHours: '120 giờ tự học',
  structureSummary: '5 Chương Lý thuyết & 3 Bài Thực hành Nghiệp vụ',
  textbookTitle: 'Giáo trình Giáo dục học — Trường Đại học Sư phạm Thành phố Hồ Chí Minh (HCMUE)',
} as const;

export const EDUC2802_CLOS: readonly Educ2802CloItem[] = [
  {
    code: 'CLO1',
    group: 'Kiến thức',
    description:
      'Trình bày và phân tích được các kiến thức nền tảng về hoạt động sư phạm, nhân cách người giáo viên và những vấn đề chung của khoa học Giáo dục học.',
    chapters: 'Chương 1, Chương 2',
  },
  {
    code: 'CLO2',
    group: 'Kiến thức',
    description:
      'Xác định được yêu cầu về phẩm chất, năng lực theo Chuẩn nghề nghiệp giáo viên phổ thông (Thông tư 20/2018/TT-BGDĐT) và định hướng phát triển nghề nghiệp giáo viên.',
    chapters: 'Chương 1',
  },
  {
    code: 'CLO3',
    group: 'Kiến thức',
    description:
      'Phân tích được bản chất hiện tượng xã hội của giáo dục, mục đích, nguyên lí giáo dục Việt Nam và khái quát hệ thống giáo dục phổ thông theo Luật Giáo dục 2019 & CT GDPT 2018.',
    chapters: 'Chương 2, Chương 3',
  },
  {
    code: 'CLO4',
    group: 'Kỹ năng',
    description:
      'Vận dụng được bản chất, đặc điểm, hệ thống 6 nguyên tắc, cấu trúc thành tố, phương pháp và hình thức đánh giá hoạt động giáo dục ở nhà trường phổ thông.',
    chapters: 'Chương 3, Thực hành 1',
  },
  {
    code: 'CLO5',
    group: 'Kỹ năng',
    description:
      'Phân tích và giải quyết hiệu quả các tình huống giáo dục thực tiễn ở trường phổ thông theo đúng quy trình 5 bước chuẩn mực.',
    chapters: 'Chương 3, Thực hành 1',
  },
  {
    code: 'CLO6',
    group: 'Kỹ năng',
    description:
      'Thực hiện được chức năng, nhiệm vụ của người giáo viên chủ nhiệm lớp; tìm hiểu học sinh, xây dựng tập thể học sinh tự quản và phối hợp các lực lượng giáo dục.',
    chapters: 'Chương 4, Thực hành 2',
  },
  {
    code: 'CLO7',
    group: 'Kỹ năng',
    description:
      'Thiết kế được kế hoạch giáo dục lớp chủ nhiệm theo quy trình 6 bước, kịch bản tiết Sinh hoạt lớp và xây dựng môi trường lớp học an toàn, lành mạnh.',
    chapters: 'Chương 4, Thực hành 2',
  },
  {
    code: 'CLO8',
    group: 'Mức tự chủ và trách nhiệm',
    description:
      'Phân tích được bản chất, mục tiêu năng lực đặc thù, 4 mạch nội dung, phương thức, loại hình tổ chức và đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp.',
    chapters: 'Chương 5, Thực hành 3',
  },
  {
    code: 'CLO9',
    group: 'Mức tự chủ và trách nhiệm',
    description:
      'Thiết kế và tổ chức được kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp ở trường trung học với tinh thần trách nhiệm, đạo đức nghề nghiệp và tự chủ chuyên môn.',
    chapters: 'Chương 5, Thực hành 3',
  },
];

// ============================================================================
// 1. DANH MỤC 20 TÀI LIỆU HỌC PHẦN & VĂN BẢN PHÁP QUY SƯ PHẠM (EDUC2802)
// ============================================================================

export interface PedagogyDocument {
  readonly id: string;
  readonly title: string;
  readonly category: 'curriculum' | 'legal' | 'handbook' | string;
  readonly categoryLabel: string;
  readonly path: string;
  readonly url?: string;
  readonly filename: string;
  readonly description: string;
  readonly badge: string;
  readonly pages?: string;
  readonly size?: string;
}

export const PEDAGOGY_DOCUMENTS: readonly PedagogyDocument[] = [
  // Nhóm 1: Giáo trình & Đề cương chính thức EDUC2802
  {
    id: 'gt-gdh-hcmue',
    title: 'Giáo trình Giáo dục học HCMUE (Chính thức)',
    category: 'curriculum',
    categoryLabel: 'Giáo trình chuẩn',
    path: 'https://drive.google.com/file/d/1Jc3J6XZd7HKHOCsJu9w6C84FIsCNS3iM/view?usp=drive_link',
    url: 'https://drive.google.com/file/d/1Jc3J6XZd7HKHOCsJu9w6C84FIsCNS3iM/view?usp=drive_link',
    filename: 'Giao_trinh_GDH_HCMUE.pdf',
    size: '84.3 MB',
    description:
      'Giáo trình chính thức của Trường ĐH Sư phạm TP.HCM (Tr. 1–124). Hệ thống hóa 5 chương lý thuyết: Hoạt động sư phạm & nhân cách GV, Những vấn đề chung của GDH, Lý luận HĐGD ở trường phổ thông, Công tác GVCN lớp và Tổ chức Hoạt động trải nghiệm, hướng nghiệp.',
    badge: 'HCMUE Official',
    pages: 'Tr. 1–124 (5 Chương)',
  },
  {
    id: 'gioi-thieu-hp-gdh',
    title: 'Đề cương chi tiết học phần Giáo dục học (EDUC2802)',
    category: 'curriculum',
    categoryLabel: 'Đề cương học phần',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Chi tiết học phần Giáo dục học - EDUC2802 (K50-51).pdf',
    size: '871 KB',
    description:
      'Đề cương chi tiết học phần Giáo dục học mã EDUC2802 (K50-51): 04 tín chỉ (80 tiết trên lớp: 40 Lý thuyết, 20 Thảo luận, 20 Thực hành; 120 giờ tự học), hệ thống 9 chuẩn đầu ra (CLO1–CLO9) và ma trận đánh giá học phần.',
    badge: '04 Tín chỉ · EDUC2802',
    pages: 'Đề cương K50–51',
  },

  // Nhóm 2: Hệ thống Văn bản Quy phạm Pháp luật Giáo dục
  {
    id: 'luat-giao-duc-2019',
    title: 'Luật Giáo dục 2019 (Luật số 43/2019/QH14)',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Luat_Giao_duc_2019.pdf',
    size: '5.1 MB',
    description:
      'Đạo luật nền tảng quy định mục tiêu, tính chất, nguyên lí giáo dục (Điều 2, 3); hệ thống giáo dục quốc dân; mục tiêu giáo dục phổ thông (Điều 29); vị trí, chuẩn trình độ và nhiệm vụ nhà giáo (Điều 66, 67, 69, 70, 72).',
    badge: 'Luật số 43/2019',
  },
  {
    id: 'du-thao-luat-nha-giao',
    title: 'Dự thảo Luật Nhà giáo',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Luat_Nha_giao.pdf',
    size: '888 KB',
    description:
      'Cập nhật định hướng chính sách mới nhất về vị thế pháp lý, chuẩn nghề nghiệp, quyền tự chủ chuyên môn, chế độ đãi ngộ và đạo đức nghề nghiệp của đội ngũ nhà giáo.',
    badge: 'Dự thảo Quốc hội',
  },
  {
    id: 'ct-gdpt-2018-tong-the',
    title: 'Chương trình GDPT 2018 Tổng thể (Thông tư 32/2018/TT-BGDĐT)',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'CT_GDPT_2018_Tong_the.pdf',
    size: '563 KB',
    description:
      'Chương trình giáo dục phổ thông tổng thể ban hành kèm Thông tư 32/2018/TT-BGDĐT: quy định 5 phẩm chất chủ yếu, 10 năng lực cốt lõi và kế hoạch giáo dục 2 giai đoạn (Giáo dục cơ bản & Giáo dục định hướng nghề nghiệp).',
    badge: 'Thông tư 32/2018',
  },
  {
    id: 'ct-hoat-dong-trai-nghiem',
    title: 'Chương trình Hoạt động trải nghiệm và HĐTN, hướng nghiệp 2018',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'CT_Hoat_dong_trai_nghiem.pdf',
    size: '465 KB',
    description:
      'Quy chuẩn hoạt động giáo dục bắt buộc (105 tiết/năm học): 3 năng lực đặc thù (Thích ứng với cuộc sống, Thiết kế và tổ chức hoạt động, Định hướng nghề nghiệp), 4 mạch nội dung và 4 loại hình tổ chức.',
    badge: 'CT HĐTN 2018',
  },
  {
    id: 'dieu-le-truong-trung-hoc-tt32',
    title: 'Điều lệ trường THCS, THPT và trường phổ thông có nhiều cấp học (TT 32/2020)',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Dieu_le_truong_trung_hoc_TT32.pdf',
    size: '13.3 MB',
    description:
      'Quy định cơ cấu tổ chức bộ máy nhà trường phổ thông, nhiệm vụ và quyền hạn của giáo viên bộ môn, giáo viên chủ nhiệm (Điều 27, 29, 30, 31) và khen thưởng, kỷ luật học sinh (Điều 38).',
    badge: 'Thông tư 32/2020',
  },
  {
    id: 'chuan-nghe-nghiep-gv-tt20',
    title: 'Chuẩn nghề nghiệp giáo viên phổ thông (Thông tư 20/2018/TT-BGDĐT)',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Chuan_nghe_nghiep_GV_TT20.pdf',
    size: '11.8 MB',
    description:
      'Hệ thống 5 tiêu chuẩn và 15 tiêu chí đánh giá chuẩn nghề nghiệp giáo viên cơ sở giáo dục phổ thông theo 3 mức (Đạt, Khá, Tốt): Phẩm chất nhà giáo, Phát triển chuyên môn nghiệp vụ, Xây dựng môi trường GD, Phối hợp gia đình - xã hội, Ngoại ngữ & CNTT.',
    badge: 'Thông tư 20/2018',
  },
  {
    id: 'tt17-sua-doi-ctgdpt',
    title: 'Thông tư 17/2025 Sửa đổi CT GDPT & Quy chế đánh giá TT 27/2020, TT 22/2021',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'TT17_Sua_doi_CTGDPT.pdf',
    size: '8.2 MB',
    description:
      'Cập nhật sửa đổi Chương trình GDPT và quy định đánh giá học sinh Tiểu học (Thông tư 27/2020/TT-BGDĐT), đánh giá kết quả rèn luyện và học tập của học sinh THCS, THPT (Thông tư 22/2021/TT-BGDĐT).',
    badge: 'TT 27 & TT 22',
  },
  {
    id: 'doc-chien-luoc-phat-trien-gd',
    title: 'Chiến lược phát triển giáo dục Việt Nam & Khung cơ cấu QĐ 1981/QĐ-TTg',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Chien_luoc_phat_trien_giao_duc.pdf',
    size: '1.1 MB',
    description:
      'Định hướng chiến lược phát triển giáo dục và Khung cơ cấu hệ thống giáo dục quốc dân theo Quyết định 1981/QĐ-TTg của Thủ tướng Chính phủ.',
    badge: 'QĐ 1981/QĐ-TTg',
  },

  // Nhóm 3: Tài liệu Bồi dưỡng Mô đun 2, Cẩm nang Sư phạm & Công cụ Nghiên cứu
  {
    id: 'doc-hdtn-thcs-modun-2',
    title: 'Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 THCS',
    category: 'handbook',
    categoryLabel: 'Tài liệu Mô đun 2',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: '11.HDTN_tai-lieu-THCS_9.10.20.20-24h.pdf',
    size: '2.2 MB',
    description:
      'Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 cấp THCS: Sử dụng phương pháp dạy học và giáo dục phát triển phẩm chất, năng lực học sinh trong Hoạt động trải nghiệm, hướng nghiệp.',
    badge: 'Mô đun 2 THCS',
  },
  {
    id: 'doc-hdtn-thpt-modun-2',
    title: 'Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 THPT',
    category: 'handbook',
    categoryLabel: 'Tài liệu Mô đun 2',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: '12.HDTN_tai-lieu-THPT_9.10.20-24h.pdf',
    size: '2.4 MB',
    description:
      'Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 cấp THPT: Tổ chức các phương thức trải nghiệm và thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp cấp THPT.',
    badge: 'Mô đun 2 THPT',
  },
  {
    id: 'doc-hdtnhn-thcs-modun-4',
    title: 'Tài liệu Mô đun 4 HĐTN, HN cấp THCS',
    category: 'handbook',
    categoryLabel: 'Cẩm nang & Nghiên cứu',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'HDTNHN_THCS_Modun_4.pdf',
    size: '2.5 MB',
    description:
      'Tài liệu tập huấn Bộ GD&ĐT: Xây dựng kế hoạch giáo dục nhà trường và kế hoạch tổ chức Hoạt động trải nghiệm, hướng nghiệp cấp THCS.',
    badge: 'Mô đun 4 THCS',
  },
  {
    id: 'doc-hdtnhn-thpt-modun-4',
    title: 'Tài liệu Mô đun 4 HĐTN, HN cấp THPT',
    category: 'handbook',
    categoryLabel: 'Cẩm nang & Nghiên cứu',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'HDTNHN_THPT_Modun_4.pdf',
    size: '2.5 MB',
    description:
      'Tài liệu tập huấn Bộ GD&ĐT: Xây dựng kế hoạch tổ chức Hoạt động trải nghiệm, hướng nghiệp phát triển phẩm chất, năng lực học sinh cấp THPT.',
    badge: 'Mô đun 4 THPT',
  },
  {
    id: 'doc-phuong-thuc-to-chuc-hdtn',
    title: 'Phương thức tổ chức Hoạt động trải nghiệm ở trường phổ thông',
    category: 'handbook',
    categoryLabel: 'Cẩm nang & Nghiên cứu',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Phuong_thuc_to_chuc_HDTN.pdf',
    size: '745 KB',
    description:
      'Hệ thống hóa 4 nhóm phương thức tổ chức HĐTN (Khám phá, Thể nghiệm - tương tác, Cống hiến, Nghiên cứu) và quy trình chi tiết từng phương pháp.',
    badge: 'Phương thức HĐTN',
  },
  {
    id: 'doc-quy-trinh-thiet-ke-chu-de-hdtn',
    title: 'Quy trình thiết kế kế hoạch chủ đề tổ chức HĐTN, hướng nghiệp',
    category: 'handbook',
    categoryLabel: 'Cẩm nang & Nghiên cứu',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Quy_trinh_thiet_ke_chu_de_HDTN.pdf',
    size: '646 KB',
    description:
      'Hướng dẫn quy trình thiết kế kế hoạch chủ đề HĐTN, hướng nghiệp theo chuỗi hoạt động Khám phá – Kết nối – Thực hành/Luyện tập – Vận dụng/Mở rộng.',
    badge: 'Thiết kế Chủ đề',
  },
  {
    id: 'ky-luat-tich-cuc',
    title: 'Cẩm nang Phương pháp Giáo dục Kỷ luật tích cực',
    category: 'handbook',
    categoryLabel: 'Nghiệp vụ thực hành',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Ky_luat_tich_cuc.pdf',
    size: '233 KB',
    description:
      'Hệ thống giải pháp giáo dục kỷ luật tích cực trong công tác chủ nhiệm lớp, thay thế hình phạt xúc phạm nhân phẩm bằng sự tôn trọng, khích lệ và tự chịu trách nhiệm.',
    badge: 'Kỷ luật tích cực',
  },
  {
    id: 'thang-bloom',
    title: 'Thang đo nhận thức Bloom trong thiết kế mục tiêu giáo dục',
    category: 'handbook',
    categoryLabel: 'Công cụ đánh giá',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Thang_Bloom.pdf',
    size: '326 KB',
    description:
      '6 mức độ nhận thức của Bloom ứng dụng trong việc xác định yêu cầu cần đạt và thiết kế công cụ đánh giá hoạt động giáo dục.',
    badge: 'Bloom Taxonomy',
  },
  {
    id: 'tra-cuu-nghe-ilo',
    title: 'Sách tra cứu nghề nghiệp (Phân loại chuẩn ILO)',
    category: 'handbook',
    categoryLabel: 'Tư vấn hướng nghiệp',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Tra_cuu_nghe_ILO.pdf',
    size: '1.5 MB',
    description:
      'Danh mục và bản đồ nghề nghiệp chuẩn quốc tế ILO phục vụ mạch nội dung Hoạt động hướng nghiệp ở cấp THCS và THPT.',
    badge: 'Tiêu chuẩn ILO',
  },
  {
    id: 'nghien-cuu-su-pham-bo-tro',
    title: 'Tài liệu Phương pháp nghiên cứu khoa học Giáo dục học',
    category: 'handbook',
    categoryLabel: 'Nghiên cứu khoa học',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Nghien_cuu_su_pham_bo_tro.pdf',
    size: '276 KB',
    description:
      'Hệ thống 3 nhóm phương pháp nghiên cứu Giáo dục học (Nghiên cứu lý luận, Nghiên cứu thực tiễn, Thống kê toán học) và quy trình 8 bước nghiên cứu khoa học của học sinh.',
    badge: 'NCKH Giáo dục',
  },
];

export const documents = PEDAGOGY_DOCUMENTS;

// ============================================================================
// 2. MA TRẬN 6 NGUYÊN TẮC HOẠT ĐỘNG GIÁO DỤC (GIÁO TRÌNH HCMUE TR. 43–47)
// ============================================================================

export interface EducationalPrinciple {
  readonly id: number;
  readonly name: string;
  readonly essence: string;
  readonly requirements: readonly string[];
  readonly commonPitfalls: readonly string[];
  readonly caseExample: string;
}

export const EDUCATIONAL_PRINCIPLES: readonly EducationalPrinciple[] = [
  {
    id: 1,
    name: 'Nguyên tắc đảm bảo tính mục đích trong hoạt động giáo dục',
    essence:
      'Mọi hoạt động giáo dục ở nhà trường phổ thông phải quán triệt và hướng tới mục tiêu phát triển toàn diện phẩm chất và năng lực người học theo Luật Giáo dục 2019 và Chương trình GDPT 2018 (Giáo trình HCMUE tr. 43–44).',
    requirements: [
      'Xác định rõ mục tiêu phẩm chất và năng lực cần hình thành cho học sinh trước khi tổ chức bất kỳ hoạt động giáo dục nào.',
      'Lựa chọn nội dung, phương pháp và hình thức tổ chức phù hợp với mục tiêu đã xác định.',
      'Chuyển hóa mục tiêu giáo dục từ bên ngoài thành mục tiêu tự giáo dục, tự rèn luyện có ý thức của chính học sinh.',
    ],
    commonPitfalls: [
      'Tổ chức hoạt động chạy theo phong trào hình thức, chỉ chú trọng vui chơi bề nổi mà bỏ quên mục tiêu giáo dục nhân cách.',
      'Áp đặt mục tiêu hành chính một chiều khiến học sinh tham gia đối phó, thụ động.',
    ],
    caseExample:
      'Khi tổ chức hoạt động lao động vệ sinh trường lớp, giáo viên không chỉ kiểm tra bề mặt sạch sẽ mà định hướng để học sinh hình thành phẩm chất chăm chỉ, trách nhiệm và tôn trọng giá trị lao động.',
  },
  {
    id: 2,
    name: 'Nguyên tắc hoạt động giáo dục gắn với đời sống, với thực tiễn xã hội',
    essence:
      'Hoạt động giáo dục phải gắn kết chặt chẽ với đời sống thực tiễn kinh tế, văn hóa, xã hội của đất nước và địa phương, thực hiện nguyên lí học đi đôi với hành, lí luận gắn liền với thực tiễn (Giáo trình HCMUE tr. 44).',
    requirements: [
      'Đưa các vấn đề thời sự, thực tiễn cuộc sống và văn hóa địa phương vào nội dung sinh hoạt giáo dục.',
      'Tổ chức cho học sinh trực tiếp tham gia các hoạt động lao động công ích, tình nguyện cộng đồng và trải nghiệm nghề nghiệp.',
      'Hướng dẫn học sinh vận dụng chuẩn mực đạo đức, pháp luật đã học để giải quyết các tình huống thực tế.',
    ],
    commonPitfalls: [
      'Thuyết giảng đạo đức khép kín, giáo điều, tách rời môi trường sống thực tế và tâm lý thời đại của học sinh.',
      'Tổ chức hoạt động xa rời điều kiện thực tiễn của địa phương và khả năng tham gia của học sinh.',
    ],
    caseExample:
      'Tổ chức chủ đề giáo dục văn hóa giao thông và văn minh không gian mạng gắn trực tiếp với các tình huống học sinh đang gặp hàng ngày tại cổng trường và trên mạng xã hội.',
  },
  {
    id: 3,
    name: 'Nguyên tắc đảm bảo sự thống nhất giữa ý thức và hành vi trong hoạt động giáo dục',
    essence:
      'Nhân cách học sinh chỉ thực sự hình thành khi nhận thức đúng đắn về chuẩn mực xã hội chuyển hóa thành niềm tin nội tâm và biểu hiện nhất quán qua hành vi, thói quen ứng xử hàng ngày (Giáo trình HCMUE tr. 44–45).',
    requirements: [
      'Kết hợp chặt chẽ giữa việc nâng cao nhận thức, bồi dưỡng tình cảm với việc tổ chức cho học sinh luyện tập hành vi thực tế.',
      'Tạo lập môi trường rèn luyện thường xuyên để hành vi đúng đắn lặp đi lặp lại thành thói quen bền vững.',
      'Khắc phục tình trạng học sinh nói đúng lý thuyết đạo đức nhưng hành xử ngược lại trong đời sống.',
    ],
    commonPitfalls: [
      'Chỉ dừng lại ở việc giảng giải lý thuyết suông mà thiếu tổ chức hoạt động để học sinh rèn luyện hành vi.',
      'Chỉ ép buộc học sinh làm theo mệnh lệnh bên ngoài mà không giải thích để các em hiểu và đồng tình về mặt nhận thức.',
    ],
    caseExample:
      'Trong chủ đề "Tôn trọng sự khác biệt", giáo viên không chỉ thảo luận khái niệm mà còn thiết lập quy tắc ứng xử lắng nghe, không phán xét ngay trong các hoạt động nhóm hàng ngày của lớp.',
  },
  {
    id: 4,
    name: 'Nguyên tắc giáo dục trong tập thể và bằng tập thể',
    essence:
      'Tập thể học sinh vừa là môi trường, vừa là phương tiện giáo dục hữu hiệu. Dư luận tập thể lành mạnh và hệ thống tự quản giúp điều chỉnh hành vi cá nhân một cách tự nhiên, sâu sắc (Giáo trình HCMUE tr. 45).',
    requirements: [
      'Xây dựng tập thể lớp đoàn kết, có mục tiêu chung, có kỷ cương dân chủ và dư luận tập thể lành mạnh.',
      'Phát huy năng lực tự quản của đội ngũ cán bộ lớp và sự tương trợ giữa các thành viên.',
      'Kết hợp tác động trực tiếp của giáo viên với tác động song hành thông qua tập thể học sinh.',
    ],
    commonPitfalls: [
      'Giáo viên làm thay toàn bộ công việc của ban cán sự lớp, biến tập thể thành đám đông thụ động.',
      'Sử dụng áp lực số đông để phê phán nặng nề, cô lập hoặc xúc phạm cá nhân học sinh mắc lỗi.',
    ],
    caseExample:
      'Khi lớp có học sinh gặp khó khăn trong học tập và hòa nhập, GVCN hướng dẫn các tổ học tập phân công đôi bạn cùng tiến đồng hành hỗ trợ thay vì chỉ phê bình cá nhân trước lớp.',
  },
  {
    id: 5,
    name: 'Nguyên tắc tôn trọng nhân cách học sinh kết hợp với yêu cầu hợp lí',
    essence:
      'Tôn trọng phẩm giá, quyền lợi và tiềm năng của học sinh là cơ sở tạo dựng niềm tin sư phạm; đồng thời đặt ra những yêu cầu vừa sức, nâng dần mức độ để thúc đẩy học sinh vươn lên (Giáo trình HCMUE tr. 45–46).',
    requirements: [
      'Lắng nghe, thấu cảm, bảo vệ danh dự và tuyệt đối không có hành vi xúc phạm nhân phẩm, thân thể học sinh.',
      'Luôn tin tưởng vào khả năng hướng thiện và tiến bộ của mọi học sinh, kể cả học sinh đang vi phạm kỷ luật.',
      'Đưa ra hệ thống yêu cầu rõ ràng, công bằng, vừa sức và kiên trì hướng dẫn học sinh hoàn thành.',
    ],
    commonPitfalls: [
      'Buông lỏng kỷ luật, chiều chuộng dễ dãi hoặc bỏ mặc học sinh dưới danh nghĩa tôn trọng tự do cá nhân.',
      'Độc đoán, áp đặt yêu cầu quá cao vượt khả năng hoặc dùng lời lẽ miệt thị khi học sinh chưa đạt yêu cầu.',
    ],
    caseExample:
      'Khi học sinh vi phạm nội quy, giáo viên mời em trao đổi riêng với thái độ điềm tĩnh, lắng nghe nguyên nhân, khẳng định niềm tin vào sự sửa đổi của em và cùng thống nhất cam kết khắc phục cụ thể.',
  },
  {
    id: 6,
    name: 'Nguyên tắc đảm bảo tính hệ thống, kế thừa và phù hợp đặc điểm cá nhân học sinh',
    essence:
      'Hoạt động giáo dục phải được tiến hành liên tục, đồng bộ giữa các lực lượng giáo dục (Nhà trường - Gia đình - Xã hội), đồng thời sát hợp với đặc điểm tâm sinh lí lứa tuổi và hoàn cảnh cá nhân từng học sinh (Giáo trình HCMUE tr. 46–47).',
    requirements: [
      'Thiết kế hoạt động giáo dục có tính kế thừa theo từng cấp học, năm học và thống nhất yêu cầu giữa các lực lượng giáo dục.',
      'Nắm vững đặc điểm tâm sinh lí lứa tuổi học sinh Tiểu học, THCS, THPT để chọn phương thức tác động thích hợp.',
      'Tìm hiểu kỹ hoàn cảnh gia đình, khí chất, năng lực và nhu cầu riêng để cá biệt hóa biện pháp giáo dục.',
    ],
    commonPitfalls: [
      'Tổ chức giáo dục ngắt quãng, thiếu sự phối hợp thống nhất giữa giáo viên chủ nhiệm, giáo viên bộ môn và cha mẹ học sinh.',
      'Áp dụng máy móc một biện pháp xử lí giống hệt nhau cho mọi học sinh có tính cách và hoàn cảnh khác nhau.',
    ],
    caseExample:
      'Với học sinh trầm tính và có hoàn cảnh gia đình nhạy cảm, giáo viên lựa chọn hình thức khích lệ riêng tư và giao nhiệm vụ vừa sức trước khi khuyến khích em phát biểu trước đám đông.',
  },
];

// ============================================================================
// 3. NGÂN HÀNG 20 TÌNH HUỐNG SƯ PHẠM VÀ QUY TRÌNH 5 BƯỚC XỬ LÝ KHOA HỌC
// ============================================================================

export interface PedagogicalCaseStudy {
  readonly id: number;
  readonly title: string;
  readonly context: string;
  readonly question: string;
  readonly principlesApplied: readonly string[];
  readonly solutionSteps: readonly {
    readonly step: number;
    readonly title: string;
    readonly content: string;
  }[];
  readonly pitfallsToAvoid: readonly string[];
  readonly coreLesson: string;
}

export const PEDAGOGICAL_CASE_STUDIES: readonly PedagogicalCaseStudy[] =
  PEDAGOGICAL_20_CASE_STUDIES;

// ============================================================================
// 4. CẤU TRÚC HỌC PHẦN GIÁO DỤC HỌC EDUC2802 (5 CHƯƠNG LÝ THUYẾT + 3 BÀI THỰC HÀNH)
// ============================================================================

export const GIAO_DUC_HOC_SUBJECT: ManifestSubject = {
  id: 'giao-duc-hoc',
  slug: 'giao-duc-hoc',
  title: 'Giáo dục học',
  shortTitle: 'EDUC2802',
  description:
    'Học phần Giáo dục học (EDUC2802 — 04 tín chỉ: 40 tiết Lý thuyết, 20 tiết Thảo luận, 20 tiết Thực hành; 120 giờ tự học) trang bị hệ thống lý luận và nghiệp vụ sư phạm theo Giáo trình Giáo dục học HCMUE: Hoạt động sư phạm & nhân cách người giáo viên, Những vấn đề chung của Giáo dục học, Lý luận hoạt động giáo dục ở trường phổ thông, Công tác giáo viên chủ nhiệm lớp và Tổ chức Hoạt động trải nghiệm, hướng nghiệp.',
  order: 4,
  status: 'published',
  theme: {
    hue: 190,
    icon: 'graduation-cap',
  },
  sources: {
    primary: 'gt-gdh-hcmue',
    references: [
      'gioi-thieu-hp-gdh',
      'luat-giao-duc-2019',
      'chuan-nghe-nghiep-gv-tt20',
      'dieu-le-truong-trung-hoc-tt32',
      'ct-gdpt-2018-tong-the',
      'ct-hoat-dong-trai-nghiem',
      'doc-hdtn-thcs-modun-2',
      'doc-hdtn-thpt-modun-2',
    ],
  },
  curriculum: {
    chapterCount: 6,
    lessonCount: 19,
    totalMinutes: 855,
  },
  chapters: [
    // ------------------------------------------------------------------------
    // CHƯƠNG 1: HOẠT ĐỘNG SƯ PHẠM VÀ NHÂN CÁCH NGƯỜI GIÁO VIÊN (CLO1, CLO2)
    // ------------------------------------------------------------------------
    {
      id: 'hoat-dong-su-pham-va-nhan-cach-nguoi-giao-vien',
      slug: 'hoat-dong-su-pham-va-nhan-cach-nguoi-giao-vien',
      title: 'Chương 1: Hoạt động sư phạm và nhân cách người giáo viên',
      description:
        'Vai trò, chức năng, nhiệm vụ và quyền hạn của người giáo viên theo Luật Giáo dục 2019 & Điều lệ trường học 2020; 5 đặc điểm hoạt động sư phạm; cấu trúc nhân cách, Chuẩn nghề nghiệp giáo viên phổ thông (Thông tư 20/2018/TT-BGDĐT) và 5 định hướng phát triển nghề nghiệp (Giáo trình HCMUE tr. 1–12).',
      number: 1,
      objectives: [
        'CLO1: Phân tích được vai trò, chức năng, nhiệm vụ, quyền hạn của người giáo viên và 5 đặc điểm đặc trưng của hoạt động sư phạm (Giáo trình tr. 1–7).',
        'CLO2: Xác định được cấu trúc phẩm chất, 5 nhóm năng lực nghề nghiệp (Điều 67 Luật GD 2019) và 5 tiêu chuẩn, 15 tiêu chí Chuẩn nghề nghiệp GVPT theo Thông tư 20/2018/TT-BGDĐT (Giáo trình tr. 7–9).',
        'CLO2: Vận dụng 5 định hướng phát triển nghề nghiệp giáo viên phổ thông để xây dựng kế hoạch tự học, tự bồi dưỡng suốt đời (Giáo trình tr. 9–12).',
      ],
      lessons: [
        {
          id: 'gdh-c1-b1-hoat-dong-su-pham-cua-nguoi-giao-vien',
          slug: 'hoat-dong-su-pham-cua-nguoi-giao-vien',
          title: 'Bài 1.1: Hoạt động sư phạm của người giáo viên',
          number: 1,
          description:
            'Khảo sát nguồn gốc thuật ngữ Hán - Việt, vai trò then chốt của người giáo viên trong xã hội hiện đại, đối chiếu ma trận nhiệm vụ - quyền hạn theo Luật Giáo dục 2019 và Điều lệ trường học 2020, cùng 5 đặc điểm cốt lõi cấu thành hoạt động sư phạm.',
          level: 'basic',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '1-7' },
            { source: 'luat-giao-duc-2019', sections: 'Điều 66, 69, 70, 72' },
            { source: 'dieu-le-truong-trung-hoc-tt32', sections: 'Điều 27, 29, 31' },
          ],
          aliases: ['1-1', 'bai-1-1', 'c1-b1', 'educ2802-c1-l1'],
          tags: [
            'EDUC2802-C1-L1',
            'CLO1',
            'CLO2',
            'Hoạt động sư phạm',
            '5 Đặc điểm HĐSP',
            'Công cụ nhân cách',
            'Giáo trình tr. 1-7',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-1.ts',
        },
        {
          id: 'gdh-c1-b2-nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong',
          slug: 'nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong',
          title: 'Bài 1.2: Nhân cách và Chuẩn nghề nghiệp giáo viên phổ thông',
          number: 2,
          description:
            'Phân tích các yêu cầu nền tảng về phẩm chất và 5 nhóm năng lực cốt lõi theo Điều 67 Luật Giáo dục 2019, giải mã chi tiết hệ thống 5 Tiêu chuẩn và 15 Tiêu chí Chuẩn nghề nghiệp giáo viên phổ thông theo Thông tư 20/2018/TT-BGDĐT.',
          level: 'basic',
          estimatedMinutes: 45,
          prerequisites: ['gdh-c1-b1-hoat-dong-su-pham-cua-nguoi-giao-vien'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '7-9' },
            { source: 'chuan-nghe-nghiep-gv-tt20', sections: '5 Tiêu chuẩn · 15 Tiêu chí' },
            { source: 'luat-giao-duc-2019', sections: 'Điều 67' },
          ],
          aliases: ['1-2', 'bai-1-2', 'c1-b2', 'educ2802-c1-l2'],
          tags: [
            'EDUC2802-C1-L2',
            'CLO2',
            'Nhân cách giáo viên',
            'Thông tư 20/2018',
            '5 Tiêu chuẩn 15 Tiêu chí',
            'Giáo trình tr. 7-9',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-1.ts',
        },
        {
          id: 'gdh-c1-b3-phat-trien-nghe-nghiep-giao-vien-pho-thong',
          slug: 'phat-trien-nghe-nghiep-giao-vien-pho-thong',
          title: 'Bài 1.3: Phát triển nghề nghiệp giáo viên phổ thông',
          number: 3,
          description:
            'Bản chất của phát triển nghề nghiệp theo định nghĩa của OECD, các yêu cầu tất yếu trong kỷ nguyên bùng nổ thông tin và 5 định hướng hình thức phát triển nghề nghiệp thực chiến cho giáo viên phổ thông.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: ['gdh-c1-b2-nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '9-12' },
            { source: 'chuan-nghe-nghiep-gv-tt20', sections: 'Tiêu chuẩn 2 & Tiêu chuẩn 5' },
            { source: 'gioi-thieu-hp-gdh', sections: 'CLO2' },
          ],
          aliases: [
            '1-3',
            'bai-1-3',
            'c1-b3',
            'educ2802-c1-l3',
            'ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua',
            'gdh-c1-b3-ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua',
            'tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1',
            'gdh-c1-b4-tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1',
          ],
          tags: [
            'EDUC2802-C1-L3',
            'CLO2',
            'Phát triển nghề nghiệp',
            'OECD 2009',
            'Cộng đồng học tập chuyên môn',
            'Kế hoạch rèn luyện',
            'Giáo trình tr. 9-12',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-1.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // CHƯƠNG 2: NHỮNG VẤN ĐỀ CHUNG CỦA GIÁO DỤC HỌC (CLO1, CLO3)
    // ------------------------------------------------------------------------
    {
      id: 'nhung-van-de-chung-cua-giao-duc-hoc',
      slug: 'nhung-van-de-chung-cua-giao-duc-hoc',
      title: 'Chương 2: Những vấn đề chung của Giáo dục học',
      description:
        'Giáo dục là một hiện tượng xã hội đặc biệt, 4 tính chất và 3 chức năng xã hội của giáo dục, vai trò chủ đạo của giáo dục đối với sự phát triển cá nhân; Giáo dục học là một khoa học, 7 thành tố của quá trình giáo dục, 3 nhóm phương pháp nghiên cứu; Mục đích và nguyên lí giáo dục Việt Nam (Giáo trình HCMUE tr. 13–30).',
      number: 2,
      objectives: [
        'CLO1: Phân tích được bản chất truyền thụ – lĩnh hội kinh nghiệm lịch sử – xã hội, 4 tính chất, 3 chức năng xã hội và vai trò chủ đạo của giáo dục đối với sự phát triển nhân cách (Giáo trình tr. 13–20).',
        'CLO1: Trình bày được lịch sử hình thành, đối tượng nghiên cứu (hoạt động giáo dục tổng thể và 7 thành tố), nhiệm vụ và 3 nhóm phương pháp nghiên cứu Giáo dục học (Giáo trình tr. 20–24).',
        'CLO3: Phân tích và vận dụng được mục đích giáo dục hai cấp độ (vĩ mô & cá nhân) và 3 nội dung nguyên lí giáo dục Việt Nam theo Luật Giáo dục 2019 (Giáo trình tr. 25–30).',
      ],
      lessons: [
        {
          id: 'gdh-c2-b1-giao-duc-la-mot-hien-tuong-xa-hoi-dac-biet',
          slug: 'giao-duc-la-mot-hien-tuong-xa-hoi-dac-biet',
          title: 'Bài 2.1: Giáo dục là một hiện tượng xã hội đặc biệt',
          number: 1,
          description:
            'Khảo sát bản chất cơ chế di sản xã hội của giáo dục, 4 tính chất cơ bản chi phối sự vận động lịch sử, 3 chức năng xã hội vĩ mô và phân tích vai trò chủ đạo của giáo dục đối với sự hình thành, phát triển nhân cách cá nhân.',
          level: 'basic',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '13-20' },
            { source: 'gioi-thieu-hp-gdh', sections: 'CLO1, CLO3' },
            { source: 'luat-giao-duc-2019', sections: 'Điều 3, Điều 5' },
          ],
          aliases: [
            '2-1',
            'bai-2-1',
            'c2-b1',
            'educ2802-c2-l1',
            'ban-chat-va-cac-chuc-nang-xa-hoi-cua-giao-duc',
            'gdh-c2-b1-ban-chat-va-cac-chuc-nang-xa-hoi-cua-giao-duc',
          ],
          tags: [
            'EDUC2802-C2-L1',
            'CLO1',
            'CLO3',
            'Hiện tượng xã hội đặc biệt',
            '3 Chức năng xã hội',
            'Vai trò chủ đạo',
            'Giáo trình tr. 13-20',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-2.ts',
        },
        {
          id: 'gdh-c2-b2-giao-duc-hoc-la-mot-khoa-hoc-ve-giao-duc-con-nguoi',
          slug: 'giao-duc-hoc-la-mot-khoa-hoc-ve-giao-duc-con-nguoi',
          title: 'Bài 2.2: Giáo dục học là một khoa học về giáo dục con người',
          number: 2,
          description:
            'Khái quát tiến trình lịch sử đưa Giáo dục học trở thành khoa học độc lập từ mốc son J. A. Cômenxki, bóc tách cấu trúc 7 thành tố của hoạt động giáo dục tổng thể, xác lập các nhiệm vụ nghiên cứu và 3 nhóm phương pháp nghiên cứu sư phạm.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: ['gdh-c2-b1-giao-duc-la-mot-hien-tuong-xa-hoi-dac-biet'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '20-24' },
            { source: 'nghien-cuu-su-pham-bo-tro' },
          ],
          aliases: [
            '2-2',
            'bai-2-2',
            'c2-b2',
            'educ2802-c2-l2',
            'giao-duc-va-su-phat-trien-nhan-cach',
            'gdh-c2-b2-giao-duc-va-su-phat-trien-nhan-cach',
          ],
          tags: [
            'EDUC2802-C2-L2',
            'CLO1',
            'CLO3',
            'Khoa học Giáo dục học',
            '7 Thành tố giáo dục',
            'Phương pháp nghiên cứu',
            'Giáo trình tr. 20-24',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-2.ts',
        },
        {
          id: 'gdh-c2-b3-muc-dich-va-nguyen-li-giao-duc-viet-nam',
          slug: 'muc-dich-va-nguyen-li-giao-duc-viet-nam',
          title: 'Bài 2.3: Mục đích và nguyên lí giáo dục Việt Nam',
          number: 3,
          description:
            'Phân tích mục đích giáo dục trên bình diện xã hội (3 mục tiêu: Dân trí - Nhân lực - Nhân tài) và bình diện cá nhân (5 phẩm chất, 10 năng lực), mục tiêu phân kỳ giáo dục phổ thông, cùng 3 nội dung bất biến của Nguyên lý giáo dục Việt Nam.',
          level: 'basic',
          estimatedMinutes: 45,
          prerequisites: ['gdh-c2-b2-giao-duc-hoc-la-mot-khoa-hoc-ve-giao-duc-con-nguoi'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '25-30' },
            { source: 'luat-giao-duc-2019', sections: 'Điều 2, Điều 3, Điều 5, Điều 28' },
            { source: 'ct-gdpt-2018-tong-the' },
          ],
          aliases: [
            '2-3',
            'bai-2-3',
            'c2-b3',
            'educ2802-c2-l3',
            'giao-duc-hoc-la-mot-khoa-hoc-muc-dich-va-nguyen-ly-giao-duc',
            'gdh-c2-b3-giao-duc-hoc-la-mot-khoa-hoc-muc-dich-va-nguyen-ly-giao-duc',
          ],
          tags: [
            'EDUC2802-C2-L3',
            'CLO1',
            'CLO3',
            'Mục đích giáo dục',
            'Nguyên lí giáo dục',
            'Luật Giáo dục 2019',
            'Giáo trình tr. 25-30',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-2.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // CHƯƠNG 3: LÝ LUẬN HOẠT ĐỘNG GIÁO DỤC Ở NHÀ TRƯỜNG PHỔ THÔNG (CLO3, CLO4, CLO5)
    // ------------------------------------------------------------------------
    {
      id: 'ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong',
      slug: 'ly-luan-hoat-dong-giao-duc-o-nha-truong-pho-thong',
      title: 'Chương 3: Lý luận hoạt động giáo dục ở nhà trường phổ thông',
      description:
        'Khái quát về giáo dục phổ thông Việt Nam (Luật GD 2019, QĐ 1981/QĐ-TTg, CT GDPT 2018, Điều lệ 2020); bản chất, 4 đặc điểm và 6 nguyên tắc hoạt động giáo dục; cấu trúc thành tố, 3 nhóm phương pháp, đánh giá kết quả (TT 27/2020, TT 22/2021) và quy trình 5 bước xử lí tình huống giáo dục (Giáo trình HCMUE tr. 32–66).',
      number: 3,
      objectives: [
        'CLO3: Trình bày được hệ thống giáo dục quốc dân, chương trình GDPT 2018 và cơ cấu tổ chức bộ máy nhà trường phổ thông theo Điều lệ 2020 (Giáo trình tr. 32–39).',
        'CLO4: Phân tích được bản chất, 4 đặc điểm, 6 nguyên tắc, cấu trúc thành tố, 3 nhóm phương pháp giáo dục và quy định đánh giá theo TT 27/2020, TT 22/2021 (Giáo trình tr. 39–65).',
        'CLO5: Vận dụng thành thạo kĩ năng và quy trình 5 bước giải quyết tình huống giáo dục ở trường phổ thông (Giáo trình tr. 65–66).',
      ],
      lessons: [
        {
          id: 'gdh-c3-b1-khai-quat-ve-giao-duc-pho-thong-viet-nam',
          slug: 'khai-quat-ve-giao-duc-pho-thong-viet-nam',
          title: 'Bài 3.1: Khái quát về giáo dục phổ thông Việt Nam',
          number: 1,
          description:
            'Khảo sát cấu trúc Hệ thống giáo dục quốc dân theo Luật Giáo dục 2019 và Quyết định 1981/QĐ-TTg, vai trò nền tảng và mục tiêu đổi mới giáo dục phổ thông theo Nghị quyết 29-NQ/TW và Nghị quyết 88/2014/QH13, phân tích kế hoạch giáo dục theo Chương trình GDPT 2018 và cơ cấu bộ máy tổ chức nhà trường phổ thông.',
          level: 'basic',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '32-39' },
            { source: 'dieu-le-truong-trung-hoc-tt32' },
            { source: 'ct-gdpt-2018-tong-the' },
            { source: 'doc-chien-luoc-phat-trien-gd' },
          ],
          aliases: [
            '3-1',
            'bai-3-1',
            'c3-b1',
            'educ2802-c3-l1',
            'co-cau-to-chuc-truong-pho-thong-va-khai-niem-hoat-dong-giao-duc',
            'gdh-c3-b1-co-cau-to-chuc-truong-pho-thong-va-khai-niem-hoat-dong-giao-duc',
          ],
          tags: [
            'EDUC2802-C3-L1',
            'CLO3',
            'CLO4',
            'Hệ thống giáo dục quốc dân',
            'CT GDPT 2018',
            'Điều lệ 2020',
            'Giáo trình tr. 32-39',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-3.ts',
        },
        {
          id: 'gdh-c3-b2-ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc',
          slug: 'ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc',
          title: 'Bài 3.2: Bản chất, đặc điểm và nguyên tắc của hoạt động giáo dục',
          number: 2,
          description:
            'Khám phá bản chất tương tác biện chứng hai mặt giữa vai trò chủ đạo của giáo viên và tính tích cực tự giáo dục của học sinh; 4 đặc điểm chi phối tiến trình sư phạm và hệ thống 6 nguyên tắc chỉ đạo toàn vẹn hoạt động giáo dục trong trường phổ thông.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: ['gdh-c3-b1-khai-quat-ve-giao-duc-pho-thong-viet-nam'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '39-47' },
            { source: 'gioi-thieu-hp-gdh', sections: 'CLO3, CLO4, CLO5' },
          ],
          aliases: [
            '3-2',
            'bai-3-2',
            'c3-b2',
            'educ2802-c3-l2',
            'he-thong-6-nguyen-tac-giao-duc-hoc-sinh-pho-thong',
            'gdh-c3-b2-he-thong-6-nguyen-tac-giao-duc-hoc-sinh-pho-thong',
          ],
          tags: [
            'EDUC2802-C3-L2',
            'CLO4',
            'CLO5',
            'Bản chất HĐGD',
            '4 Đặc điểm HĐGD',
            '6 Nguyên tắc giáo dục',
            'Giáo trình tr. 39-47',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-3.ts',
        },
        {
          id: 'gdh-c3-b3-cau-truc-thanh-to-phuong-phap-va-danh-gia-ket-qua-hoat-dong-giao-duc',
          slug: 'cau-truc-thanh-to-phuong-phap-va-danh-gia-ket-qua-hoat-dong-giao-duc',
          title: 'Bài 3.3: Cấu trúc thành tố, phương pháp và đánh giá kết quả hoạt động giáo dục',
          number: 3,
          description:
            'Hệ thống hóa mục tiêu theo 5 phẩm chất và 10 năng lực (CT GDPT 2018), đối chiếu kế hoạch giáo dục 3 cấp học, phân tích 3 nhóm phương pháp giáo dục phổ thông kèm lưu đồ quy trình, và chuẩn hóa phương pháp đánh giá kết quả theo Thông tư 27/2021 và Thông tư 22/2021.',
          level: 'intermediate',
          estimatedMinutes: 50,
          prerequisites: ['gdh-c3-b2-ban-chat-dac-diem-va-nguyen-tac-cua-hoat-dong-giao-duc'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '47-65' },
            { source: 'ct-gdpt-2018-tong-the' },
            { source: 'tt17-sua-doi-ctgdpt', sections: 'Thông tư 27/2020 & Thông tư 22/2021' },
          ],
          aliases: [
            '3-3',
            'bai-3-3',
            'c3-b3',
            'educ2802-c3-l3',
            'muc-tieu-pham-chat-nang-luc-va-phuong-phap-giao-duc',
            'gdh-c3-b3-muc-tieu-pham-chat-nang-luc-va-phuong-phap-giao-duc',
          ],
          tags: [
            'EDUC2802-C3-L3',
            'CLO4',
            'CLO5',
            '5 Phẩm chất 10 Năng lực',
            '3 Nhóm phương pháp GD',
            'TT 27/2020 & TT 22/2021',
            'Giáo trình tr. 47-65',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-3.ts',
        },
        {
          id: 'gdh-c3-b4-ki-nang-va-quy-trinh-xu-li-tinh-huong-giao-duc',
          slug: 'ki-nang-va-quy-trinh-xu-li-tinh-huong-giao-duc',
          title: 'Bài 3.4: Kĩ năng và quy trình xử lí tình huống giáo dục',
          number: 4,
          description:
            'Nhận diện khái niệm tình huống sư phạm, phân tích các nguyên nhân gây xung đột trong quan hệ giáo dục, chuẩn hóa quy trình 5 bước giải quyết tình huống giáo dục tối ưu và bài tập thực hành tình huống điển hình.',
          level: 'advanced',
          estimatedMinutes: 45,
          prerequisites: [
            'gdh-c3-b3-cau-truc-thanh-to-phuong-phap-va-danh-gia-ket-qua-hoat-dong-giao-duc',
          ],
          sources: [{ source: 'gt-gdh-hcmue', pages: '65-66' }, { source: 'ky-luat-tich-cuc' }],
          aliases: [
            '3-4',
            'bai-3-4',
            'c3-b4',
            'educ2802-c3-l4',
            'quy-trinh-5-buoc-xu-li-tinh-huong-giao-duc',
          ],
          tags: [
            'EDUC2802-C3-L4',
            'CLO4',
            'CLO5',
            'Tình huống giáo dục',
            'Quy trình 5 bước',
            'Mục 3.3.6 Giáo trình',
            'Giáo trình tr. 65-66',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-3.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // CHƯƠNG 4: CÔNG TÁC GIÁO VIÊN CHỦ NHIỆM LỚP (CLO6, CLO7)
    // ------------------------------------------------------------------------
    {
      id: 'cong-tac-giao-vien-chu-nhiem-lop',
      slug: 'cong-tac-giao-vien-chu-nhiem-lop',
      title: 'Chương 4: Công tác giáo viên chủ nhiệm lớp',
      description:
        '4 chức năng và nhiệm vụ của người giáo viên chủ nhiệm lớp theo Điều lệ trường học 2020; cách thức tìm hiểu học sinh, quy trình 6 bước xây dựng kế hoạch chủ nhiệm, 3 giai đoạn phát triển tập thể và 4 biện pháp xây dựng tập thể; tổ chức giáo dục toàn diện, môi trường lớp học an toàn và phối hợp các lực lượng giáo dục (Giáo trình HCMUE tr. 67–82).',
      number: 4,
      objectives: [
        'CLO6: Phân tích được 4 chức năng và hệ thống nhiệm vụ, quyền hạn của giáo viên chủ nhiệm lớp ở trường Tiểu học, THCS, THPT theo Điều lệ 2020 (Giáo trình tr. 67–69).',
        'CLO7: Thực hiện được cách thức tìm hiểu học sinh, lập kế hoạch chủ nhiệm theo quy trình 6 bước và xây dựng tập thể học sinh qua 3 giai đoạn phát triển (Giáo trình tr. 70–77).',
        'CLO6, CLO7: Tổ chức giáo dục toàn diện, kiến tạo môi trường vật chất & tâm lí – xã hội an toàn và phối hợp hiệu quả giữa Đoàn/Đội, GV bộ môn, gia đình (Giáo trình tr. 78–82).',
      ],
      lessons: [
        {
          id: 'gdh-c4-b1-chuc-nang-va-nhiem-vu-cua-nguoi-giao-vien-chu-nhiem-lop',
          slug: 'chuc-nang-va-nhiem-vu-cua-nguoi-giao-vien-chu-nhiem-lop',
          title: 'Bài 4.1: Chức năng và nhiệm vụ của người giáo viên chủ nhiệm lớp',
          number: 1,
          description:
            'Phân tích 4 chức năng cốt lõi của GVCN (Quản lí – giáo dục toàn diện, Cố vấn tự quản, Cầu nối trong trường, Phối hợp ngoài trường) và đối sánh nhiệm vụ, quyền hạn của GVCN theo Điều lệ trường Tiểu học & trường Trung học 2020 (Giáo trình HCMUE tr. 67–69).',
          level: 'basic',
          estimatedMinutes: 40,
          prerequisites: [],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '67-69' },
            { source: 'dieu-le-truong-trung-hoc-tt32', sections: 'Điều 27, 29, 31' },
          ],
          aliases: [
            '4-1',
            'bai-4-1',
            'c4-b1',
            'vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn',
            'gdh-c4-b1-vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn',
          ],
          tags: [
            'CLO6',
            'GVCN',
            '4 Chức năng GVCN',
            'Điều lệ trường học 2020',
            'Giáo trình tr. 67-69',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-4.ts',
        },
        {
          id: 'gdh-c4-b2-tim-hieu-hoc-sinh-lap-ke-hoach-va-xay-dung-tap-the-hoc-sinh',
          slug: 'tim-hieu-hoc-sinh-lap-ke-hoach-va-xay-dung-tap-the-hoc-sinh',
          title: 'Bài 4.2: Tìm hiểu học sinh, lập kế hoạch và xây dựng tập thể học sinh',
          number: 2,
          description:
            'Nội dung và phương pháp tìm hiểu, phân loại học sinh lớp chủ nhiệm; Quy trình 6 bước xây dựng kế hoạch giáo dục lớp chủ nhiệm; 3 giai đoạn phát triển tập thể học sinh và 4 biện pháp xây dựng tập thể vững mạnh (Giáo trình HCMUE tr. 70–77).',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: ['gdh-c4-b1-chuc-nang-va-nhiem-vu-cua-nguoi-giao-vien-chu-nhiem-lop'],
          sources: [{ source: 'gt-gdh-hcmue', pages: '70-77' }, { source: 'ky-luat-tich-cuc' }],
          aliases: [
            '4-2',
            'bai-4-2',
            'c4-b2',
            'noi-dung-va-phuong-phap-giao-duc-cua-gvcn-lop',
            'gdh-c4-b2-noi-dung-va-phuong-phap-giao-duc-cua-gvcn-lop',
          ],
          tags: [
            'CLO6',
            'CLO7',
            'Quy trình 6 bước GVCN',
            '3 Giai đoạn tập thể',
            'Tìm hiểu học sinh',
            'Giáo trình tr. 70-77',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-4.ts',
        },
        {
          id: 'gdh-c4-b3-to-chuc-giao-duc-toan-dien-xay-dung-moi-truong-lop-hoc-va-phoi-hop-cac-luc-luong-giao-duc',
          slug: 'to-chuc-giao-duc-toan-dien-xay-dung-moi-truong-lop-hoc-va-phoi-hop-cac-luc-luong-giao-duc',
          title:
            'Bài 4.3: Tổ chức giáo dục toàn diện, xây dựng môi trường lớp học và phối hợp các lực lượng giáo dục',
          number: 3,
          description:
            'Tổ chức các hoạt động học tập và trải nghiệm toàn diện; xây dựng môi trường lớp học (môi trường vật chất và môi trường tâm lí – xã hội an toàn, thân thiện); phối hợp giữa GVCN với Đoàn/Đội, giáo viên bộ môn và gia đình học sinh (Giáo trình HCMUE tr. 78–82).',
          level: 'advanced',
          estimatedMinutes: 45,
          prerequisites: ['gdh-c4-b2-tim-hieu-hoc-sinh-lap-ke-hoach-va-xay-dung-tap-the-hoc-sinh'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '78-82' },
            { source: 'chuan-nghe-nghiep-gv-tt20', sections: 'Tiêu chuẩn 3 & Tiêu chuẩn 4' },
          ],
          aliases: [
            '4-3',
            'bai-4-3',
            'c4-b3',
            'yeu-cau-pham-chat-nang-luc-gvcn-va-thiet-ke-hoat-dong-chu-nhiem',
            'gdh-c4-b3-yeu-cau-pham-chat-nang-luc-gvcn-va-thiet-ke-hoat-dong-chu-nhiem',
            'thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12',
            'gdh-c4-b4-thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12',
          ],
          tags: [
            'CLO6',
            'CLO7',
            'Giáo dục toàn diện',
            'Môi trường lớp học',
            'Phối hợp lực lượng GD',
            'Giáo trình tr. 78-82',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-4.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // CHƯƠNG 5: TỔ CHỨC HOẠT ĐỘNG TRẢI NGHIỆM, HƯỚNG NGHIỆP (CLO8, CLO9)
    // ------------------------------------------------------------------------
    {
      id: 'to-chuc-hoat-dong-trai-nghiem-huong-nghiep',
      slug: 'to-chuc-hoat-dong-trai-nghiem-huong-nghiep',
      title: 'Chương 5: Tổ chức Hoạt động trải nghiệm, hướng nghiệp',
      description:
        'Bản chất, mục tiêu 3 năng lực đặc thù và 4 mạch nội dung Hoạt động trải nghiệm, hướng nghiệp; 4 nhóm phương thức tổ chức cùng quy trình các phương pháp cụ thể và 4 loại hình tổ chức; 6 phương pháp đánh giá kết quả, điều kiện tổ chức và quy trình thiết kế chủ đề HĐTN (Giáo trình HCMUE tr. 83–124).',
      number: 5,
      objectives: [
        'CLO8: Phân tích được bản chất phương thức trải nghiệm, 3 năng lực đặc thù và 4 mạch nội dung chính của Hoạt động trải nghiệm, hướng nghiệp ở trường phổ thông (Giáo trình tr. 83–87).',
        'CLO8, CLO9: Vận dụng được 4 nhóm phương thức tổ chức (quy trình Sân khấu tương tác 5 bước, Tham quan 3 bước, Tình nguyện 5 bước, Lao động công ích 4 bước, NCKH 8 bước, Dự án 5 bước) và 4 loại hình tổ chức (Giáo trình tr. 88–110).',
        'CLO9: Thực hiện được 6 phương pháp đánh giá kết quả, xác định điều kiện tổ chức và thiết kế kế hoạch chủ đề HĐTN, hướng nghiệp theo đúng quy trình chuẩn (Giáo trình tr. 110–124).',
      ],
      lessons: [
        {
          id: 'gdh-c5-b1-ban-chat-muc-tieu-va-noi-dung-hoat-dong-trai-nghiem-o-truong-pho-thong',
          slug: 'ban-chat-muc-tieu-va-noi-dung-hoat-dong-trai-nghiem-o-truong-pho-thong',
          title: 'Bài 5.1: Bản chất, mục tiêu và nội dung hoạt động trải nghiệm ở trường phổ thông',
          number: 1,
          description:
            'Bản chất phương thức giáo dục qua trải nghiệm; mục tiêu hình thành 3 năng lực đặc thù (Thích ứng với cuộc sống, Thiết kế và tổ chức hoạt động, Định hướng nghề nghiệp) và 4 mạch nội dung chính: Hướng vào bản thân, Hướng đến xã hội, Hướng đến tự nhiên, Hướng nghiệp (Giáo trình HCMUE tr. 83–87).',
          level: 'basic',
          estimatedMinutes: 40,
          prerequisites: [],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '83-87' },
            { source: 'ct-hoat-dong-trai-nghiem' },
            { source: 'doc-hdtn-thcs-modun-2' },
            { source: 'doc-hdtn-thpt-modun-2' },
          ],
          aliases: [
            '5-1',
            'bai-5-1',
            'c5-b1',
            'khai-niem-ban-chat-va-muc-tieu-hoat-dong-trai-nghiem',
            'gdh-c5-b1-khai-niem-ban-chat-va-muc-tieu-hoat-dong-trai-nghiem',
          ],
          tags: [
            'CLO8',
            'HĐTN & Hướng nghiệp',
            '3 Năng lực đặc thù',
            '4 Mạch nội dung',
            'Giáo trình tr. 83-87',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-5.ts',
        },
        {
          id: 'gdh-c5-b2-phuong-thuc-va-loai-hinh-to-chuc-hoat-dong-trai-nghiem',
          slug: 'phuong-thuc-va-loai-hinh-to-chuc-hoat-dong-trai-nghiem',
          title: 'Bài 5.2: Phương thức và loại hình tổ chức hoạt động trải nghiệm',
          number: 2,
          description:
            '4 nhóm phương thức và quy trình chi tiết: Hội thảo, Diễn đàn, Trò chơi, Sân khấu tương tác (5 bước), Tham quan (3 bước), Tình nguyện (5 bước), Lao động công ích (4 bước), Nghiên cứu khoa học (8 bước), Dự án (5 bước); cùng 4 loại hình: Sinh hoạt dưới cờ, Sinh hoạt lớp, Hoạt động theo chủ đề và Câu lạc bộ (Giáo trình HCMUE tr. 88–110).',
          level: 'intermediate',
          estimatedMinutes: 50,
          prerequisites: [
            'gdh-c5-b1-ban-chat-muc-tieu-va-noi-dung-hoat-dong-trai-nghiem-o-truong-pho-thong',
          ],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '88-110' },
            { source: 'doc-phuong-thuc-to-chuc-hdtn' },
            { source: 'doc-hdtn-thcs-modun-2' },
            { source: 'doc-hdtn-thpt-modun-2' },
          ],
          aliases: [
            '5-2',
            'bai-5-2',
            'c5-b2',
            'noi-dung-va-phuong-thuc-to-chuc-hoat-dong-trai-nghiem',
            'gdh-c5-b2-noi-dung-va-phuong-thuc-to-chuc-hoat-dong-trai-nghiem',
          ],
          tags: [
            'CLO8',
            'CLO9',
            '4 Nhóm phương thức',
            '4 Loại hình HĐTN',
            'Sân khấu tương tác',
            'Giáo trình tr. 88-110',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-5.ts',
        },
        {
          id: 'gdh-c5-b3-danh-gia-ket-qua-dieu-kien-to-chuc-va-quy-trinh-thiet-ke-chu-de-hoat-dong-trai-nghiem',
          slug: 'danh-gia-ket-qua-dieu-kien-to-chuc-va-quy-trinh-thiet-ke-chu-de-hoat-dong-trai-nghiem',
          title:
            'Bài 5.3: Đánh giá kết quả, điều kiện tổ chức và quy trình thiết kế chủ đề hoạt động trải nghiệm',
          number: 3,
          description:
            '6 phương pháp đánh giá kết quả Hoạt động trải nghiệm, hướng nghiệp; các điều kiện đảm bảo tổ chức hoạt động và quy trình thiết kế kế hoạch chủ đề HĐTN theo cấu trúc chuẩn của Giáo trình HCMUE & Tài liệu Mô đun 2 (Giáo trình HCMUE tr. 110–124).',
          level: 'advanced',
          estimatedMinutes: 50,
          prerequisites: ['gdh-c5-b2-phuong-thuc-va-loai-hinh-to-chuc-hoat-dong-trai-nghiem'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '110-124' },
            { source: 'doc-quy-trinh-thiet-ke-chu-de-hdtn' },
            { source: 'doc-hdtn-thcs-modun-2' },
            { source: 'doc-hdtn-thpt-modun-2' },
          ],
          aliases: [
            '5-3',
            'bai-5-3',
            'c5-b3',
            'quy-trinh-thiet-ke-ke-hoach-chu-de-hdtn-va-tien-trinh-4-buoc',
            'gdh-c5-b3-quy-trinh-thiet-ke-ke-hoach-chu-de-hdtn-va-tien-trinh-4-buoc',
            'danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19',
            'gdh-c5-b4-danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19',
          ],
          tags: [
            'CLO8',
            'CLO9',
            '6 Phương pháp đánh giá HĐTN',
            'Quy trình thiết kế chủ đề',
            'Mô đun 2 THCS & THPT',
            'Giáo trình tr. 110-124',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-5.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // KHỐI THỰC HÀNH NGHIỆP VỤ SƯ PHẠM (3 BÀI THỰC HÀNH — 20 TIẾT THỰC HÀNH)
    // ------------------------------------------------------------------------
    {
      id: 'khoi-thuc-hanh-nghiep-vu-su-pham',
      slug: 'khoi-thuc-hanh-nghiep-vu-su-pham',
      title: 'Khối Thực hành Nghiệp vụ Sư phạm',
      description:
        'Hệ thống 3 bài thực hành nghiệp vụ trọng tâm (20 tiết Thực hành & 20 tiết Thảo luận theo Đề cương EDUC2802): Phân tích & giải quyết 20 tình huống sư phạm theo quy trình 5 bước; Lập kế hoạch giáo dục lớp chủ nhiệm & thiết kế tiết Sinh hoạt lớp; Thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp tích hợp Mô đun 2 THCS & THPT.',
      number: 6,
      objectives: [
        'CLO4, CLO5: Thực hành phân tích và giải quyết 20 tình huống sư phạm thực tế ở trường phổ thông theo đúng quy trình 5 bước của Mục 3.3.6 Giáo trình HCMUE.',
        'CLO6, CLO7: Thực hành lập kế hoạch giáo dục lớp chủ nhiệm theo quy trình 6 bước và thiết kế kịch bản tiết Sinh hoạt lớp theo chủ đề.',
        'CLO8, CLO9: Thực hành thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp cấp THCS & THPT theo tài liệu bồi dưỡng Mô đun 2.',
      ],
      lessons: [
        {
          id: 'gdh-th-b1-phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te',
          slug: 'phan-tich-va-giai-quyet-20-tinh-huong-su-pham-thuc-te',
          title:
            'Thực hành 1: Phân tích và giải quyết 20 tình huống sư phạm thực tế theo quy trình 5 bước',
          number: 1,
          description:
            'Vận dụng hệ thống 6 nguyên tắc hoạt động giáo dục và quy trình 5 bước (Mục 3.3.6 Giáo trình HCMUE tr. 65–66) để phân tích, xử lí 20 tình huống sư phạm điển hình trong dạy học, công tác chủ nhiệm và phối hợp gia đình – xã hội.',
          level: 'advanced',
          estimatedMinutes: 50,
          prerequisites: ['gdh-c3-b4-ki-nang-va-quy-trinh-xu-li-tinh-huong-giao-duc'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '65-66' },
            { source: 'gioi-thieu-hp-gdh', sections: 'Thực hành 1 · CLO4, CLO5' },
            { source: 'ky-luat-tich-cuc' },
          ],
          aliases: [
            '6-1',
            'bai-6-1',
            'c6-b1',
            'thuc-hanh-1',
            'tinh-huong-su-pham',
            'ngan-hang-20-tinh-huong-su-pham-thuc-te',
            'gdh-c6-b1-ngan-hang-20-tinh-huong-su-pham-thuc-te',
          ],
          tags: [
            'CLO4',
            'CLO5',
            'Thực hành 1',
            '20 Tình huống sư phạm',
            'Quy trình 5 bước',
            'Giáo trình tr. 65-66',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-6.tsx',
        },
        {
          id: 'gdh-th-b2-lap-ke-hoach-giao-duc-lop-chu-nhiem-va-thiet-ke-tiet-sinh-hoat-lop',
          slug: 'lap-ke-hoach-giao-duc-lop-chu-nhiem-va-thiet-ke-tiet-sinh-hoat-lop',
          title: 'Thực hành 2: Lập kế hoạch giáo dục lớp chủ nhiệm và thiết kế tiết Sinh hoạt lớp',
          number: 2,
          description:
            'Thực hành xây dựng kế hoạch giáo dục lớp chủ nhiệm năm học/tháng theo quy trình 6 bước (Giáo trình HCMUE tr. 71–73), thiết kế kịch bản tiết Sinh hoạt lớp tự quản và hệ thống đề cương tự luận ôn tập tổng hợp.',
          level: 'advanced',
          estimatedMinutes: 50,
          prerequisites: ['gdh-c4-b2-tim-hieu-hoc-sinh-lap-ke-hoach-va-xay-dung-tap-the-hoc-sinh'],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '70-82' },
            { source: 'gioi-thieu-hp-gdh', sections: 'Thực hành 2 · CLO6, CLO7' },
            { source: 'dieu-le-truong-trung-hoc-tt32', sections: 'Điều 29, 31' },
          ],
          aliases: [
            '6-2',
            'bai-6-2',
            'c6-b2',
            'thuc-hanh-2',
            'de-cuong-on-tap',
            'de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an',
            'gdh-c6-b2-de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an',
          ],
          tags: [
            'CLO6',
            'CLO7',
            'Thực hành 2',
            'Kế hoạch chủ nhiệm',
            'Tiết Sinh hoạt lớp',
            'Giáo trình tr. 70-82',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-6.tsx',
        },
        {
          id: 'gdh-th-b3-thiet-ke-ke-hoach-chu-de-hoat-dong-trai-nghiem-huong-nghiep',
          slug: 'thiet-ke-ke-hoach-chu-de-hoat-dong-trai-nghiem-huong-nghiep',
          title:
            'Thực hành 3: Thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp (Tích hợp tài liệu Mô đun 2 THCS & THPT)',
          number: 3,
          description:
            'Thực hành thiết kế kế hoạch chủ đề Hoạt động trải nghiệm, hướng nghiệp theo quy trình chuẩn Giáo trình HCMUE (tr. 116–124) kết hợp Tài liệu bồi dưỡng giáo viên cốt cán Mô đun 2 cấp THCS & THPT và Rubric đánh giá thực hành.',
          level: 'advanced',
          estimatedMinutes: 50,
          prerequisites: [
            'gdh-c5-b3-danh-gia-ket-qua-dieu-kien-to-chuc-va-quy-trinh-thiet-ke-chu-de-hoat-dong-trai-nghiem',
          ],
          sources: [
            { source: 'gt-gdh-hcmue', pages: '110-124' },
            { source: 'doc-hdtn-thcs-modun-2' },
            { source: 'doc-hdtn-thpt-modun-2' },
            { source: 'doc-quy-trinh-thiet-ke-chu-de-hdtn' },
            { source: 'gioi-thieu-hp-gdh', sections: 'Thực hành 3 · CLO8, CLO9' },
          ],
          aliases: ['6-3', 'bai-6-3', 'c6-b3', 'thuc-hanh-3', 'thiet-ke-chu-de-hdtn'],
          tags: [
            'CLO8',
            'CLO9',
            'Thực hành 3',
            'Mô đun 2 THCS & THPT',
            'Kế hoạch chủ đề HĐTN',
            'Giáo trình tr. 110-124',
          ],
          status: 'published',
          version: '2.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-6.tsx',
        },
      ],
    },
  ],
};

// ============================================================================
// 5. TRÌNH NẠP BÀI HỌC SƯ PHẠM ĐỘNG (DYNAMIC PEDAGOGY LESSON LOADER)
// ============================================================================

/**
 * Trả về module bài học cho các bài thuộc học phần Giáo dục học (EDUC2802).
 */
export function getPedagogyLessonModule(lessonId: string): CompiledLessonModule | null {
  const ch1Module = getChapter1LessonModule(lessonId);
  if (ch1Module) {
    return ch1Module;
  }

  const ch2Module = getChapter2LessonModule(lessonId);
  if (ch2Module) {
    return ch2Module;
  }

  const ch3Module = getChapter3LessonModule(lessonId);
  if (ch3Module) {
    return ch3Module;
  }

  const ch4Module = getChapter4LessonModule(lessonId);
  if (ch4Module) {
    return ch4Module;
  }

  const ch5Module = getChapter5LessonModule(lessonId);
  if (ch5Module) {
    return ch5Module;
  }

  const ch6Module = getChapter6LessonModule(lessonId);
  if (ch6Module) {
    return ch6Module;
  }

  const lessonItem = GIAO_DUC_HOC_SUBJECT.chapters
    .flatMap((ch) => ch.lessons)
    .find((l) => l.id === lessonId || l.aliases.includes(lessonId));

  if (!lessonItem) {
    return null;
  }

  const LessonComponent: FC = () => {
    return createElement(
      'div',
      { className: 'space-y-6' },
      createElement(
        'div',
        {
          className:
            'rounded-2xl border border-[#CFDADB] bg-[#F7FAFA] p-6 text-[#29383D] shadow-xs',
        },
        createElement(
          'div',
          { className: 'flex items-center gap-2 text-xs font-bold text-[#3F6570] uppercase' },
          createElement('span', null, 'Học phần Giáo dục học · EDUC2802'),
        ),
        createElement(
          'h2',
          { className: 'mt-2 font-serif text-2xl font-bold text-[#29383D]' },
          lessonItem.title,
        ),
        createElement(
          'p',
          { className: 'mt-2 text-sm leading-relaxed text-[#55676B]' },
          lessonItem.description,
        ),
      ),
    );
  };

  return {
    default: LessonComponent,
    frontmatter: {
      title: lessonItem.title,
      description: lessonItem.description,
      level: lessonItem.level,
      tags: lessonItem.tags,
    },
    lessonMeta: {
      chapterNumber: 1,
      lessonNumber: lessonItem.number,
      headings: [],
      blocks: [],
    },
  };
}
