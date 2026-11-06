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
// 1. DANH MỤC 19 TÀI LIỆU HỌC PHẦN & VĂN BẢN PHÁP QUY SƯ PHẠM
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
  // Nhóm 1: Giáo trình & Đề cương chính thức
  {
    id: 'gt-gdh-hcmue',
    title: 'Giáo trình Giáo dục học HCMUE (Chính thức)',
    category: 'curriculum',
    categoryLabel: 'Giáo trình chuẩn',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Giao_trinh_GDH_HCMUE.pdf',
    size: '84.3 MB',
    description:
      'Giáo trình chuẩn mực của Trường ĐH Sư phạm TP.HCM. Hệ thống hóa đầy đủ lý luận giáo dục, lao động sư phạm, nguyên tắc giáo dục, nghiệp vụ chủ nhiệm và hoạt động trải nghiệm.',
    badge: 'HCMUE Official',
    pages: 'Toàn văn giáo trình',
  },
  {
    id: 'gioi-thieu-hp-gdh',
    title: 'Giới thiệu học phần & Đề cương GDH',
    category: 'curriculum',
    categoryLabel: 'Đề cương học phần',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Gioi_thieu_hoc_phan_GDH.pdf',
    size: '871 KB',
    description:
      'Mục tiêu, chuẩn đầu ra (CLO), ma trận kiểm tra đánh giá, đề cương chi tiết 3 tín chỉ học phần Giáo dục học (EDUT1401 / EDUC1001).',
    badge: '3 Tín chỉ',
    pages: 'Đề cương chi tiết',
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
      'Đạo luật nền tảng quy định mục tiêu, tính chất, nguyên lý giáo dục (Điều 3); mục tiêu giáo dục phổ thông (Điều 28); quyền và nghĩa vụ nhà giáo (Điều 69-70).',
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
      'Cập nhật định hướng chính sách mới nhất về vị thế pháp lý, quyền tự chủ nghề nghiệp, chế độ đãi ngộ và đạo đức nghề nghiệp của nhà giáo.',
    badge: 'Dự thảo Quốc hội',
  },
  {
    id: 'ct-gdpt-2018-tong-the',
    title: 'Khung Chương trình GDPT 2018 (Tổng thể)',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'CT_GDPT_2018_Tong_the.pdf',
    size: '563 KB',
    description:
      'Khung chương trình giáo dục phổ thông mới chuyển từ trang bị kiến thức sang phát triển toàn diện 5 phẩm chất chủ yếu và 10 năng lực cốt lõi.',
    badge: 'CT GDPT 2018',
  },
  {
    id: 'ct-hoat-dong-trai-nghiem',
    title: 'Chương trình Hoạt động trải nghiệm 2018',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'CT_Hoat_dong_trai_nghiem.pdf',
    size: '465 KB',
    description:
      'Quy chuẩn chương trình bắt buộc cấp THCS & THPT: 4 mạch nội dung (Bản thân, Xã hội, Tự nhiên, Hướng nghiệp) và 4 hình thức tổ chức chủ đạo.',
    badge: 'HĐTN & Hướng nghiệp',
  },
  {
    id: 'dieu-le-truong-trung-hoc-tt32',
    title: 'Điều lệ trường trung học (Thông tư 32/2020/TT-BGDĐT)',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Dieu_le_truong_trung_hoc_TT32.pdf',
    size: '13.3 MB',
    description:
      'Quy định cơ cấu tổ chức trường phổ thông, nhiệm vụ và quyền hạn của giáo viên (Điều 27, 29), quyền hạn đặc thù của giáo viên chủ nhiệm và khen thưởng - kỷ luật học sinh (Điều 38).',
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
      'Hệ thống 5 tiêu chuẩn và 15 tiêu chí đánh giá năng lực nghề nghiệp giáo viên cơ sở giáo dục phổ thông (Phẩm chất nhà giáo, Phát triển chuyên môn, Xây dựng môi trường, Phối hợp, Ngoại ngữ & Tin học).',
    badge: 'Thông tư 20/2018',
  },
  {
    id: 'tt17-sua-doi-ctgdpt',
    title: 'Thông tư 17/2025 Sửa đổi CT GDPT',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'TT17_Sua_doi_CTGDPT.pdf',
    size: '8.2 MB',
    description:
      'Cập nhật sửa đổi, bổ sung một số nội dung trong Chương trình GDPT 2018 nhằm tối ưu hóa thời lượng và tích hợp hoạt động giáo dục.',
    badge: 'Thông tư 17/2025',
  },
  {
    id: 'doc-chien-luoc-phat-trien-gd',
    title: 'Chiến lược phát triển giáo dục Việt Nam',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Chien_luoc_phat_trien_giao_duc.pdf',
    size: '1.1 MB',
    description:
      'Định hướng chiến lược, mục tiêu và giải pháp đổi mới căn bản, toàn diện giáo dục và đào tạo giai đoạn mới.',
    badge: 'Chiến lược GD',
  },

  // Nhóm 3: Cẩm nang Sư phạm & Công cụ Nghiên cứu
  {
    id: 'ky-luat-tich-cuc',
    title: 'Cẩm nang Phương pháp Kỷ luật tích cực',
    category: 'handbook',
    categoryLabel: 'Nghiệp vụ thực hành',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Ky_luat_tich_cuc.pdf',
    size: '233 KB',
    description:
      'Hệ thống các giải pháp thay thế hình phạt trừng phạt thân thể và bạo lực tinh thần, chuyển đổi hành vi dựa trên sự tôn trọng, thấu cảm và trách nhiệm.',
    badge: 'Kỷ luật tích cực',
  },
  {
    id: 'thang-bloom',
    title: 'Thang đo nhận thức Bloom trong sư phạm',
    category: 'handbook',
    categoryLabel: 'Công cụ đánh giá',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Thang_Bloom.pdf',
    size: '326 KB',
    description:
      '6 cấp độ nhận thức của Bloom (Nhận biết, Thông hiểu, Vận dụng, Phân tích, Đánh giá, Sáng tạo) ứng dụng thiết kế mục tiêu bài học và câu hỏi phản tư.',
    badge: 'Bloom Taxonomy',
  },
  {
    id: 'tra-cuu-nghe-ilo',
    title: 'Sách tra cứu nghề nghiệp (Phân loại ILO)',
    category: 'handbook',
    categoryLabel: 'Tư vấn hướng nghiệp',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Tra_cuu_nghe_ILO.pdf',
    size: '1.5 MB',
    description:
      'Bản đồ các nhóm ngành nghề chuẩn quốc tế phục vụ công tác tư vấn giáo dục hướng nghiệp trong Chương trình Hoạt động trải nghiệm.',
    badge: 'Tiêu chuẩn ILO',
  },
  {
    id: 'nghien-cuu-su-pham-bo-tro',
    title: 'Tài liệu Nghiên cứu sư phạm bổ trợ',
    category: 'handbook',
    categoryLabel: 'Nghiên cứu khoa học',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Nghien_cuu_su_pham_bo_tro.pdf',
    size: '276 KB',
    description:
      'Quy trình nghiên cứu khoa học sư phạm ứng dụng trong nhà trường phổ thông: xác định vấn đề, thiết kế tác động, đo lường và phân tích dữ liệu.',
    badge: 'NCKH Ứng dụng',
  },
  {
    id: 'doc-hdtnhn-thcs-modun-4',
    title: 'Tài liệu Mô-đun 4 HĐTN, HN cấp THCS',
    category: 'handbook',
    categoryLabel: 'Cẩm nang & Nghiên cứu',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'HDTNHN_THCS_Modun_4.pdf',
    size: '2.5 MB',
    description:
      'Tài liệu tập huấn Bộ GD&ĐT: Xây dựng kế hoạch dạy học và giáo dục phát triển phẩm chất, năng lực cấp THCS.',
    badge: 'Mô-đun 4 THCS',
  },
  {
    id: 'doc-hdtnhn-thpt-modun-4',
    title: 'Tài liệu Mô-đun 4 HĐTN, HN cấp THPT',
    category: 'handbook',
    categoryLabel: 'Cẩm nang & Nghiên cứu',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'HDTNHN_THPT_Modun_4.pdf',
    size: '2.5 MB',
    description:
      'Tài liệu tập huấn Bộ GD&ĐT: Xây dựng kế hoạch hoạt động trải nghiệm, hướng nghiệp cấp THPT.',
    badge: 'Mô-đun 4 THPT',
  },
  {
    id: 'doc-hdtn-thcs-modun-2',
    title: 'Tài liệu Mô-đun 2 HĐTN cấp THCS',
    category: 'handbook',
    categoryLabel: 'Cẩm nang & Nghiên cứu',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'HDTN_THCS_Modun_2.pdf',
    size: '2.2 MB',
    description:
      'Sử dụng phương pháp dạy học và giáo dục phát triển phẩm chất, năng lực học sinh trong HĐTN cấp THCS.',
    badge: 'Mô-đun 2 THCS',
  },
  {
    id: 'doc-phuong-thuc-to-chuc-hdtn',
    title: 'Phương thức tổ chức Hoạt động trải nghiệm',
    category: 'handbook',
    categoryLabel: 'Cẩm nang & Nghiên cứu',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Phuong_thuc_to_chuc_HDTN.pdf',
    size: '745 KB',
    description: 'Hệ thống hóa các phương thức tổ chức HĐTN thực tế trong nhà trường phổ thông.',
    badge: 'Phương thức HĐTN',
  },
  {
    id: 'doc-quy-trinh-thiet-ke-chu-de-hdtn',
    title: 'Quy trình thiết kế kế hoạch chủ đề tổ chức HĐTN',
    category: 'handbook',
    categoryLabel: 'Cẩm nang & Nghiên cứu',
    path: GOOGLE_DRIVE_DOCS_URL,
    url: GOOGLE_DRIVE_DOCS_URL,
    filename: 'Quy_trinh_thiet_ke_chu_de_HDTN.pdf',
    size: '646 KB',
    description: 'Hướng dẫn từng bước thiết kế chủ đề HĐTN phục vụ làm bài tập thực hành A.1.9.',
    badge: 'Kế hoạch HĐTN',
  },
];

export const documents = PEDAGOGY_DOCUMENTS;

// ============================================================================
// 2. MA TRẬN 6 NGUYÊN TẮC GIÁO DỤC HỌC SINH PHỔ THÔNG
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
    name: 'Nguyên tắc đảm bảo tính mục đích của giáo dục',
    essence:
      'Mọi hoạt động giáo dục phải luôn hướng tới hình thành nhân cách công dân phát triển toàn diện (Đức - Trí - Thể - Mỹ) theo mục tiêu giáo dục của Đảng, Nhà nước và chuẩn đầu ra Chương trình GDPT 2018.',
    requirements: [
      'Xác định rõ ràng mục tiêu phẩm chất và năng lực cho từng hoạt động giáo dục cụ thể.',
      'Lựa chọn nội dung, hình thức và phương pháp phù hợp với định hướng nhân cách cần bồi dưỡng.',
      'Giúp học sinh tự giác nhận thức được ý nghĩa và mục đích của hoạt động mình tham gia.',
    ],
    commonPitfalls: [
      'Tổ chức hoạt động theo phong trào hình thức, vui chơi giải trí đơn thuần mà quên mục tiêu rèn luyện nhân cách.',
      'Áp đặt mục tiêu một chiều từ giáo viên mà không giúp học sinh hiểu lý do tại sao phải thực hiện.',
    ],
    caseExample:
      'Khi tổ chức lao động dọn vệ sinh trường lớp, không chỉ yêu cầu sạch sẽ mà cần giáo dục ý thức tôn trọng người lao động và bảo vệ môi trường chung.',
  },
  {
    id: 2,
    name: 'Nguyên tắc giáo dục gắn liền với thực tiễn, đời sống và lao động',
    essence:
      'Giáo dục không thể khép kín trong khuôn viên lớp học mà phải gắn với đời sống kinh tế - xã hội, biến tri thức sách vở thành niềm tin và hành vi thực tế.',
    requirements: [
      'Đưa học sinh vào các hoạt động thực tiễn đa dạng (lao động, thiện nguyện, trải nghiệm nghề nghiệp).',
      'Liên hệ bài giảng lý thuyết với những vấn đề thời sự, xã hội và cộng đồng địa phương.',
      'Tạo cơ hội để học sinh vận dụng kiến thức giải quyết vấn đề thực tế trong đời sống học đường và gia đình.',
    ],
    commonPitfalls: [
      'Giáo điều, lý thuyết suông, thuyết giảng đạo đức rời xa thực tế lứa tuổi học sinh.',
      'Tách rời việc rèn luyện trong nhà trường với thực tiễn môi trường sống của học sinh.',
    ],
    caseExample:
      'Tổ chức chuyên đề an toàn giao thông gắn với thực tế các điểm ùn tắc ngay trước cổng trường học sinh đi lại hàng ngày.',
  },
  {
    id: 3,
    name: 'Nguyên tắc giáo dục trong tập thể và bằng tập thể',
    essence:
      'Tập thể học sinh vừa là môi trường, vừa là phương tiện mạnh mẽ để hình thành nhân cách. Tác động của dư luận tập thể lành mạnh có sức thuyết phục sâu sắc hơn mệnh lệnh cá nhân của giáo viên.',
    requirements: [
      'Xây dựng tập thể lớp thành một cộng đồng đoàn kết, có kỷ cương, truyền thống và dư luận tích cực.',
      'Phát huy vai trò tự quản của ban cán sự lớp và các tổ nhóm học sinh.',
      'Tác động song song: tác động trực tiếp đến từng học sinh và tác động gián tiếp thông qua tập thể (phương pháp song hành Makarenko).',
    ],
    commonPitfalls: [
      'Giáo viên ôm đồm làm thay ban cán sự lớp, biến tập thể thành công cụ phục tùng thụ động.',
      'Lợi dụng áp lực tập thể để trừng phạt hoặc cô lập một cá nhân học sinh có lỗi.',
    ],
    caseExample:
      'Khi một học sinh thường xuyên đi muộn, GVCN hướng dẫn chi đội họp bàn tìm nguyên nhân và phân công bạn cùng tuyến đường hỗ trợ nhắc nhở, thay vì tự GVCN phạt trừ điểm thi đua.',
  },
  {
    id: 4,
    name: 'Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao đối với học sinh',
    essence:
      'Tôn trọng nhân cách là điểm tựa tâm lý để học sinh tự tin, tự trọng; còn yêu cầu cao là động lực thúc đẩy học sinh không ngừng nỗ lực hoàn thiện bản thân. "Yêu cầu càng cao bao nhiêu thì càng phải tôn trọng bấy nhiêu" (A.S. Makarenko).',
    requirements: [
      'Tuyệt đối không xúc phạm danh dự, thân thể, không dùng lời lẽ miệt thị hay định kiến với học sinh.',
      'Tin tưởng vào khả năng tiến bộ của học sinh, kể cả những em đang có khuyết điểm.',
      'Đưa ra các yêu cầu rõ ràng, hợp lý, nhất quán và kiên quyết đòi hỏi học sinh phải nỗ lực thực hiện.',
    ],
    commonPitfalls: [
      'Dễ dãi, buông lỏng, xuê xoa trước các vi phạm kỷ luật của học sinh dưới danh nghĩa "thân thiện".',
      'Độc đoán, hà khắc, đòi hỏi vượt quá khả năng thực tế của học sinh hoặc áp dụng hình phạt hạ thấp nhân phẩm.',
    ],
    caseExample:
      'Khi học sinh gian lận trong kiểm tra, GVCN gặp riêng trò chuyện nghiêm túc, khẳng định tin tưởng vào năng lực thật của em và yêu cầu em tự giác làm lại bài kiểm tra nghiêm túc.',
  },
  {
    id: 5,
    name: 'Nguyên tắc kết hợp phù hợp đặc điểm lứa tuổi và cá biệt hóa giáo dục',
    essence:
      'Mỗi lứa tuổi học sinh có quy luật phát triển tâm sinh lý riêng; mỗi cá nhân học sinh lại có hoàn cảnh gia đình, tính cách, nhịp độ nhận thức và năng khiếu khác nhau.',
    requirements: [
      'Nắm vững đặc điểm tâm lý lứa tuổi (ví dụ khủng hoảng tuổi dậy thì ở học sinh THCS và xu hướng tự khẳng định ở THPT).',
      'Tìm hiểu sâu sắc hoàn cảnh sống, tính khí, sở trường và hoàn cảnh cá nhân của từng học sinh.',
      'Lựa chọn phương pháp tiếp cận riêng biệt, xây dựng kế hoạch hỗ trợ cá nhân phù hợp.',
    ],
    commonPitfalls: [
      'Áp dụng một công thức giáo dục cứng nhắc, rập khuôn cho tất cả học sinh trong lớp.',
      'Đánh giá học sinh dựa trên định kiến chủ quan mà không xem xét hoàn cảnh xuất thân.',
    ],
    caseExample:
      'Đối với học sinh có tính khí sôi nổi, hướng ngoại thì giao việc phụ trách phong trào; đối với học sinh trầm tính, nhút nhát thì động viên làm việc theo cặp và giao các nhiệm vụ lưu trữ hồ sơ tỉ mỉ.',
  },
  {
    id: 6,
    name: 'Nguyên tắc đảm bảo tính hệ thống, kế thừa và liên tục trong giáo dục',
    essence:
      'Sự hình thành nhân cách là một quá trình lâu dài, tích lũy dần về lượng để đổi về chất. Giáo dục phải có kế hoạch, không được ngắt quãng hay "đánh trống bỏ dùi".',
    requirements: [
      'Xây dựng kế hoạch giáo dục có tính kế thừa từ đầu năm học đến cuối năm học và xuyên suốt các cấp học.',
      'Thường xuyên củng cố, duy trì các thói quen hành vi tích cực đã được hình thành.',
      'Phối hợp chặt chẽ, thống nhất yêu cầu giáo dục giữa Nhà trường, Gia đình và Xã hội.',
    ],
    commonPitfalls: [
      'Làm việc tùy tiện, nhớ đâu làm đấy, phong trào rầm rộ lúc đầu rồi buông lỏng về sau.',
      'Trống đánh xuôi kèn thổi ngược giữa lời dạy của giáo viên và cách ứng xử thực tế của cha mẹ ở nhà.',
    ],
    caseExample:
      'Để rèn luyện văn hóa chào hỏi và xếp hàng, GVCN kiên trì duy trì nhắc nhở và tuyên dương trong suốt 9 tháng học kỳ, thay vì chỉ kiểm tra gắt gao trong tuần lễ đầu năm học.',
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
// 4. CẤU TRÚC HỌC PHẦN GIÁO DỤC HỌC (5 CHƯƠNG + 1 CHUYÊN ĐỀ = 17 BÀI)
// ============================================================================

export const GIAO_DUC_HOC_SUBJECT: ManifestSubject = {
  id: 'giao-duc-hoc',
  slug: 'giao-duc-hoc',
  title: 'Giáo dục học',
  shortTitle: 'EDUT1401',
  description:
    'Hệ thống hóa lý luận giáo dục nhân cách, chuẩn nghề nghiệp giáo viên phổ thông theo Thông tư 20, nghiệp vụ chủ nhiệm lớp theo Điều lệ trường học và quy trình tổ chức hoạt động trải nghiệm theo Chương trình GDPT 2018.',
  order: 4,
  status: 'published',
  theme: {
    hue: 190,
    icon: 'graduation-cap',
  },
  sources: {
    primary: 'gt-gdh-hcmue-2024',
    references: [
      'luat-giao-duc-2019',
      'thong-tu-20-2018',
      'thong-tu-32-2020',
      'chuong-trinh-gdpt-2018',
    ],
  },
  curriculum: {
    chapterCount: 6,
    lessonCount: 20,
    totalMinutes: 840,
  },
  chapters: [
    // ------------------------------------------------------------------------
    // CHƯƠNG 1
    // ------------------------------------------------------------------------
    {
      id: 'hoat-dong-su-pham-va-nguoi-giao-vien-pho-thong',
      slug: 'hoat-dong-su-pham-va-nguoi-giao-vien-pho-thong',
      title: 'Chương 1: Hoạt động sư phạm và Người giáo viên phổ thông',
      description:
        'Bản chất nghề dạy học, vai trò của người thầy, 5 đặc điểm lao động sư phạm, chuẩn nghề nghiệp giáo viên theo Thông tư 20, kế hoạch rèn luyện 4 năm và tình huống sư phạm thực hành.',
      number: 1,
      objectives: [
        'CLO 1: Nhận thức đúng đắn về tác phong sư phạm và chuẩn mực đạo đức nhà giáo',
        'CLO 2: Phân tích sâu sắc 5 đặc điểm lao động sư phạm và 5 tiêu chuẩn chuẩn nghề nghiệp giáo viên',
        'CLO 3: Xây dựng phương hướng và kế hoạch rèn luyện bản thân trong 4 năm đại học',
      ],
      lessons: [
        {
          id: 'gdh-c1-b1-hoat-dong-su-pham-cua-nguoi-giao-vien',
          slug: 'hoat-dong-su-pham-cua-nguoi-giao-vien',
          title: 'Bài 1.1: Hoạt động sư phạm của người giáo viên',
          number: 1,
          description:
            'Nguồn gốc thuật ngữ Hán - Việt, chức năng xã hội, 5 đặc điểm cốt lõi của lao động sư phạm và luận điểm then chốt: Nhân cách người thầy là công cụ lao động chủ yếu.',
          level: 'basic',
          estimatedMinutes: 35,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: ['Hoạt động sư phạm', 'Lao động sư phạm', 'Đặc điểm nghề giáo', 'CLO 2'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-1.ts',
        },
        {
          id: 'gdh-c1-b2-nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong',
          slug: 'nhan-cach-va-chuan-nghe-nghiep-giao-vien-pho-thong',
          title: 'Bài 1.2: Nhân cách & Chuẩn nghề nghiệp giáo viên phổ thông',
          number: 2,
          description:
            'Cấu trúc nhân cách người thầy (Phẩm chất & Năng lực) và ma trận 5 Tiêu chuẩn, 15 Tiêu chí Chuẩn nghề nghiệp theo Thông tư 20/2018/TT-BGDĐT.',
          level: 'basic',
          estimatedMinutes: 40,
          prerequisites: [],
          sources: [{ source: 'thong-tu-20-2018' }],
          aliases: [],
          tags: [
            'Chuẩn nghề nghiệp',
            'Thông tư 20',
            'Phẩm chất nhà giáo',
            'Năng lực sư phạm',
            'CLO 1',
            'CLO 2',
          ],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-1.ts',
        },
        {
          id: 'gdh-c1-b3-ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua',
          slug: 'ren-luyen-de-tro-thanh-nguoi-giao-vien-hieu-qua',
          title: 'Bài 1.3: Rèn luyện để trở thành người giáo viên hiệu quả',
          number: 3,
          description:
            'Bản chất tự giáo dục và thực hành thiết kế Kế hoạch học tập, rèn luyện cá nhân trong 4 năm đại học đối chiếu 15 tiêu chí TT20.',
          level: 'intermediate',
          estimatedMinutes: 40,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: ['Tự giáo dục', 'Kế hoạch 4 năm', 'Rèn luyện cá nhân', 'CLO 1', 'CLO 3'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-1.ts',
        },
        {
          id: 'gdh-c1-b4-tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1',
          slug: 'tinh-huong-su-pham-va-de-cuong-on-tap-chuong-1',
          title: 'Bài 1.4: Tình huống sư phạm & Đề cương tự luận ôn tập Chương 1',
          number: 4,
          description:
            'Giải quyết 2 tình huống sư phạm thực hành về công cụ lao động và văn hóa mạng xã hội; đề cương 3 câu hỏi tự luận kinh điển ôn thi.',
          level: 'advanced',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }, { source: 'thong-tu-20-2018' }],
          aliases: [],
          tags: [
            'Tình huống sư phạm',
            'Đề cương ôn tập',
            'Câu hỏi tự luận',
            'CLO 1',
            'CLO 2',
            'CLO 3',
          ],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-1.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // CHƯƠNG 2
    // ------------------------------------------------------------------------
    {
      id: 'ban-chat-giao-duc-vai-tro-cua-giao-duc-va-giao-duc-hoc',
      slug: 'ban-chat-giao-duc-vai-tro-cua-giao-duc-va-giao-duc-hoc',
      title: 'Chương 2: Bản chất giáo dục, Vai trò của giáo dục và Giáo dục học',
      description:
        'Các chức năng xã hội của giáo dục, biện chứng 4 yếu tố hình thành nhân cách và hệ thống mục đích, nguyên lý giáo dục theo Luật Giáo dục 2019.',
      number: 2,
      objectives: [
        'CLO 2: Phân tích bản chất hiện tượng xã hội của giáo dục và 3 chức năng xã hội nền tảng',
        'CLO 2: Luận giải mối quan hệ biện chứng giữa 4 yếu tố hình thành và phát triển nhân cách',
        'CLO 1: Vận dụng 3 nguyên lý giáo dục và mục tiêu GDPT (Luật GD 2019) vào hoạt động sư phạm',
      ],
      lessons: [
        {
          id: 'gdh-c2-b1-ban-chat-va-cac-chuc-nang-xa-hoi-cua-giao-duc',
          slug: 'ban-chat-va-cac-chuc-nang-xa-hoi-cua-giao-duc',
          title: 'Bài 2.1: Bản chất và các chức năng xã hội của giáo dục',
          number: 1,
          description:
            'Khái niệm giáo dục theo nghĩa rộng và nghĩa hẹp; 3 chức năng xã hội (Kinh tế - sản xuất, Chính trị - tư tưởng, Văn hóa - tư tưởng); tính lịch sử và tính giai cấp.',
          level: 'basic',
          estimatedMinutes: 35,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: ['Bản chất giáo dục', 'Chức năng xã hội', 'Tính lịch sử', 'CLO 2'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-2.ts',
        },
        {
          id: 'gdh-c2-b2-giao-duc-va-su-phat-trien-nhan-cach',
          slug: 'giao-duc-va-su-phat-trien-nhan-cach',
          title: 'Bài 2.2: Giáo dục và Sự phát triển nhân cách',
          number: 2,
          description:
            'Phân tích biện chứng 4 yếu tố: Di truyền (tiền đề vật chất), Môi trường (điều kiện cần), Hoạt động cá nhân (quyết định trực tiếp) và Giáo dục giữ vai trò CHỦ ĐẠO.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: ['Phát triển nhân cách', 'Vai trò chủ đạo', 'Di truyền', 'Môi trường', 'CLO 2'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-2.ts',
        },
        {
          id: 'gdh-c2-b3-giao-duc-hoc-la-mot-khoa-hoc-muc-dich-va-nguyen-ly-giao-duc',
          slug: 'giao-duc-hoc-la-mot-khoa-hoc-muc-dich-va-nguyen-ly-giao-duc',
          title: 'Bài 2.3: Giáo dục học là một khoa học, Mục đích & Nguyên lý giáo dục',
          number: 3,
          description:
            'Đối tượng, nhiệm vụ của Giáo dục học; mục tiêu GDPT theo Điều 28 Luật Giáo dục 2019; 3 nguyên lý: Học đi đôi với hành, Lý luận gắn với thực tiễn, Nhà trường gắn với Gia đình & Xã hội.',
          level: 'basic',
          estimatedMinutes: 40,
          prerequisites: [],
          sources: [{ source: 'luat-giao-duc-2019' }],
          aliases: [],
          tags: ['Khoa học Giáo dục', 'Luật Giáo dục 2019', 'Nguyên lý giáo dục', 'CLO 1', 'CLO 2'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-2.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // CHƯƠNG 3
    // ------------------------------------------------------------------------
    {
      id: 'nhung-van-de-chung-ve-hoat-dong-giao-duc-o-truong-pho-thong',
      slug: 'nhung-van-de-chung-ve-hoat-dong-giao-duc-o-truong-pho-thong',
      title: 'Chương 3: Những vấn đề chung về Hoạt động giáo dục ở trường phổ thông',
      description:
        'Cơ cấu tổ chức trường phổ thông theo Điều lệ TT32, hệ thống 6 nguyên tắc giáo dục toàn diện và ma trận phương pháp giáo dục phẩm chất - năng lực.',
      number: 3,
      objectives: [
        'CLO 2: Nắm vững cơ cấu tổ chức trường trung học (TT 32/2020) và cấu trúc hoạt động giáo dục',
        'CLO 1: Thực thi thành thạo hệ thống 6 nguyên tắc giáo dục học sinh phổ thông',
        'CLO 1: Vận dụng ma trận 5 phẩm chất, 10 năng lực (CT GDPT 2018) và phương pháp kỷ luật tích cực',
      ],
      lessons: [
        {
          id: 'gdh-c3-b1-co-cau-to-chuc-truong-pho-thong-va-khai-niem-hoat-dong-giao-duc',
          slug: 'co-cau-to-chuc-truong-pho-thong-va-khai-niem-hoat-dong-giao-duc',
          title: 'Bài 3.1: Cơ cấu tổ chức trường phổ thông & Khái niệm hoạt động giáo dục',
          number: 1,
          description:
            'Bộ máy tổ chức nhà trường theo Thông tư 32/2020; khái niệm, cấu trúc và 4 đặc điểm cốt lõi của hoạt động giáo dục ở trường trung học.',
          level: 'basic',
          estimatedMinutes: 35,
          prerequisites: [],
          sources: [{ source: 'thong-tu-32-2020' }],
          aliases: [],
          tags: ['Điều lệ trường học', 'Thông tư 32', 'Cơ cấu tổ chức', 'HĐGD', 'CLO 2'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-3.ts',
        },
        {
          id: 'gdh-c3-b2-he-thong-6-nguyen-tac-giao-duc-hoc-sinh-pho-thong',
          slug: 'he-thong-6-nguyen-tac-giao-duc-hoc-sinh-pho-thong',
          title: 'Bài 3.2: Hệ thống 6 Nguyên tắc giáo dục học sinh phổ thông',
          number: 2,
          description:
            'Nội dung, yêu cầu thực hiện và các bẫy sai lầm cần tránh của 6 nguyên tắc giáo dục nền tảng trong nhà trường trung học.',
          level: 'intermediate',
          estimatedMinutes: 50,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: ['Nguyên tắc giáo dục', '6 Nguyên tắc', 'Thực hành sư phạm', 'CLO 1'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-3.ts',
        },
        {
          id: 'gdh-c3-b3-muc-tieu-pham-chat-nang-luc-va-phuong-phap-giao-duc',
          slug: 'muc-tieu-pham-chat-nang-luc-va-phuong-phap-giao-duc',
          title: 'Bài 3.3: Mục tiêu Phẩm chất - Năng lực và Phương pháp giáo dục',
          number: 3,
          description:
            '5 phẩm chất và 10 năng lực theo CT GDPT 2018; phân loại phương pháp giáo dục: thuyết phục, tổ chức hoạt động, kích thích hành vi và kỷ luật tích cực.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'chuong-trinh-gdpt-2018' }],
          aliases: [],
          tags: [
            '5 Phẩm chất 10 Năng lực',
            'Phương pháp giáo dục',
            'Kỷ luật tích cực',
            'CLO 1',
            'CLO 2',
          ],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-3.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // CHƯƠNG 4
    // ------------------------------------------------------------------------
    {
      id: 'cong-tac-cua-nguoi-giao-vien-chu-nhiem-lop',
      slug: 'cong-tac-cua-nguoi-giao-vien-chu-nhiem-lop',
      title: 'Chương 4: Công tác của Người giáo viên chủ nhiệm lớp',
      description:
        'Vị trí, 4 chức năng cốt lõi của GVCN, nghệ thuật xây dựng tập thể học sinh tự quản, phương pháp kỷ luật tích cực và thực hành xử lý tình huống theo Rubric A.1.2.',
      number: 4,
      objectives: [
        'CLO 1: Nắm vững vị trí, 4 chức năng nòng cốt và quyền hạn nhiệm vụ của GVCN (TT 32/2020)',
        'CLO 2: Vận dụng 3 giai đoạn xây dựng tập thể (Makarenko) và phương pháp kỷ luật tích cực (Jane Nelsen)',
        'CLO 3: Thực hành thiết kế kế hoạch chủ nhiệm, kịch bản họp phụ huynh và xử lý tình huống theo Rubric A.1.2',
      ],
      lessons: [
        {
          id: 'gdh-c4-b1-vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn',
          slug: 'vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn',
          title: 'Bài 4.1: Vị trí, Chức năng và Nhiệm vụ của GVCN',
          number: 1,
          description:
            'Vị trí vai trò hạt nhân của GVCN; 4 chức năng nòng cốt theo HCMUE; nhiệm vụ, quyền hạn theo Thông tư 32/2020/TT-BGDĐT.',
          level: 'basic',
          estimatedMinutes: 35,
          prerequisites: [],
          sources: [{ source: 'thong-tu-32-2020' }],
          aliases: [],
          tags: [
            'GVCN',
            'Chức năng GVCN',
            'Quyền hạn nhiệm vụ',
            'Thông tư 32/2020',
            'CLO 1',
            'CLO 2',
          ],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-4.ts',
        },
        {
          id: 'gdh-c4-b2-noi-dung-va-phuong-phap-giao-duc-cua-gvcn-lop',
          slug: 'noi-dung-va-phuong-phap-giao-duc-cua-gvcn-lop',
          title: 'Bài 4.2: Nội dung và Phương pháp giáo dục của GVCN lớp',
          number: 2,
          description:
            'Lý luận 3 giai đoạn xây dựng tập thể học sinh theo Makarenko; phương pháp Kỷ luật tích cực theo Jane Nelsen; kỹ thuật nhận diện 4 mục tiêu sai lệch.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: [
            'Tập thể học sinh',
            'Kỷ luật tích cực',
            'Makarenko',
            'Jane Nelsen',
            'CLO 1',
            'CLO 2',
          ],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-4.ts',
        },
        {
          id: 'gdh-c4-b3-yeu-cau-pham-chat-nang-luc-gvcn-va-thiet-ke-hoat-dong-chu-nhiem',
          slug: 'yeu-cau-pham-chat-nang-luc-gvcn-va-thiet-ke-hoat-dong-chu-nhiem',
          title:
            'Bài 4.3: Yêu cầu về phẩm chất, năng lực của GVCN & Thiết kế hoạt động chủ nhiệm trọng tâm',
          number: 3,
          description:
            'Phẩm chất đạo đức và năng lực của GVCN; hướng dẫn thiết kế 3 hoạt động thực tế: Kế hoạch chủ nhiệm tháng, Kịch bản họp cha mẹ học sinh và Tiết sinh hoạt lớp tự quản.',
          level: 'advanced',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: [
            'Phẩm chất GVCN',
            'Kế hoạch tháng',
            'Họp phụ huynh',
            'Sinh hoạt lớp',
            'CLO 1',
            'CLO 3',
          ],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-4.ts',
        },
        {
          id: 'gdh-c4-b4-thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12',
          slug: 'thuc-hanh-xu-ly-tinh-huong-su-pham-theo-rubric-a12',
          title: 'Bài 4.4: Thực hành xử lý tình huống sư phạm theo Rubric A.1.2',
          number: 4,
          description:
            'Quy trình khoa học 5 bước xử lý tình huống giáo dục HCMUE; Bảng tiêu chí Rubric đánh giá A.1.2; giải quyết 2 tình huống sư phạm kinh điển: học sinh cá biệt và bạo lực học đường mạng xã hội.',
          level: 'advanced',
          estimatedMinutes: 50,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: [
            'Tình huống sư phạm',
            'Rubric A.1.2',
            'Học sinh cá biệt',
            'Bạo lực mạng',
            'CLO 1',
            'CLO 2',
            'CLO 3',
          ],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-4.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // CHƯƠNG 5
    // ------------------------------------------------------------------------
    {
      id: 'to-chuc-hoat-dong-trai-nghiem-o-truong-pho-thong',
      slug: 'to-chuc-hoat-dong-trai-nghiem-o-truong-pho-thong',
      title: 'Chương 5: Tổ chức Hoạt động trải nghiệm ở trường phổ thông',
      description:
        'Bản chất hoạt động giáo dục bắt buộc theo CT GDPT 2018, 4 mạch nội dung, 4 loại hình tổ chức, quy trình 6 bước thiết kế chủ đề và thực hành theo Rubric A.1.9.',
      number: 5,
      objectives: [
        'CLO 1: Hiểu rõ bản chất hoạt động trải nghiệm bắt buộc (105 tiết/năm) và chu trình Kolb',
        'CLO 2: Nắm vững 4 mạch nội dung và 4 loại hình tổ chức hoạt động trải nghiệm trường phổ thông',
        'CLO 3: Thành thạo quy trình 6 bước thiết kế chủ đề HĐTN và thực hành theo Rubric A.1.9',
      ],
      lessons: [
        {
          id: 'gdh-c5-b1-khai-niem-ban-chat-va-muc-tieu-hoat-dong-trai-nghiem',
          slug: 'khai-niem-ban-chat-va-muc-tieu-hoat-dong-trai-nghiem',
          title: 'Bài 5.1: Khái niệm, Bản chất và Mục tiêu của Hoạt động trải nghiệm',
          number: 1,
          description:
            'Định vị hoạt động giáo dục bắt buộc theo CT GDPT 2018 (105 tiết/năm); Chu trình 4 bước học tập qua trải nghiệm David Kolb; mục tiêu phân tầng 3 cấp học.',
          level: 'basic',
          estimatedMinutes: 40,
          prerequisites: [],
          sources: [{ source: 'chuong-trinh-gdpt-2018' }],
          aliases: [],
          tags: ['HĐTN', 'CT GDPT 2018', 'Chu trình Kolb', 'Mục tiêu 3 cấp học', 'CLO 1', 'CLO 2'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-5.ts',
        },
        {
          id: 'gdh-c5-b2-noi-dung-va-phuong-thuc-to-chuc-hoat-dong-trai-nghiem',
          slug: 'noi-dung-va-phuong-thuc-to-chuc-hoat-dong-trai-nghiem',
          title: 'Bài 5.2: Nội dung và Phương thức tổ chức Hoạt động trải nghiệm',
          number: 2,
          description:
            'Bốn mạch nội dung xuyên suốt và 4 loại hình tổ chức cơ bản trong nhà trường phổ thông (Sinh hoạt dưới cờ, Sinh hoạt lớp, HĐGD theo chủ đề, CLB).',
          level: 'basic',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'chuong-trinh-gdpt-2018' }],
          aliases: [],
          tags: [
            '4 Mạch nội dung',
            '4 Loại hình tổ chức',
            'Sinh hoạt dưới cờ',
            'Sinh hoạt lớp',
            'CLO 1',
            'CLO 2',
          ],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-5.ts',
        },
        {
          id: 'gdh-c5-b3-quy-trinh-thiet-ke-ke-hoach-chu-de-hdtn-va-tien-trinh-4-buoc',
          slug: 'quy-trinh-thiet-ke-ke-hoach-chu-de-hdtn-va-tien-trinh-4-buoc',
          title: 'Bài 5.3: Quy trình thiết kế kế hoạch chủ đề HĐTN và Tiến trình 4 bước tổ chức',
          number: 3,
          description:
            'Quy trình 6 bước thiết kế kế hoạch giáo dục chủ đề HĐTN theo chuẩn HCMUE; cấu trúc tiến trình 4 bước tổ chức hoạt động cụ thể.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: ['Quy trình 6 bước', 'Tiến trình 4 bước', 'Thiết kế chủ đề', 'CLO 1', 'CLO 3'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-5.ts',
        },
        {
          id: 'gdh-c5-b4-danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19',
          slug: 'danh-gia-ket-qua-hdtn-va-thuc-hanh-xay-dung-ke-hoach-rubric-a19',
          title: 'Bài 5.4: Đánh giá kết quả HĐTN & Thực hành xây dựng Kế hoạch theo Rubric A.1.9',
          number: 4,
          description:
            'Bảng tiêu chí Rubric đánh giá bài tập thực hành HĐTN A.1.9 (20%); Kế hoạch bài dạy chủ đề "Xây dựng tình bạn đẹp — Phòng chống bạo lực học đường" chuẩn mức Tốt.',
          level: 'advanced',
          estimatedMinutes: 50,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: [
            'Rubric A.1.9',
            'Kế hoạch bài dạy mẫu',
            'Bạo lực học đường',
            'Tình bạn đẹp',
            'CLO 1',
            'CLO 3',
          ],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-5.ts',
        },
      ],
    },

    // ------------------------------------------------------------------------
    // CHUYÊN ĐỀ 6
    // ------------------------------------------------------------------------
    {
      id: 'cam-nang-xu-ly-tinh-huong-su-pham-va-de-cuong-on-tap',
      slug: 'cam-nang-xu-ly-tinh-huong-su-pham-va-de-cuong-on-tap',
      title: 'Chuyên đề 6: Cẩm nang Xử lý Tình huống sư phạm & Đề cương Ôn tập',
      description:
        'Ngân hàng 20 tình huống sư phạm thực chiến ở trường phổ thông kèm 5 bước xử lý khoa học và Đề cương ôn thi tự luận trọng tâm chuẩn barem ĐH Sư phạm.',
      number: 6,
      objectives: [],
      lessons: [
        {
          id: 'gdh-c6-b1-ngan-hang-20-tinh-huong-su-pham-thuc-te',
          slug: 'ngan-hang-20-tinh-huong-su-pham-thuc-te',
          title: 'Bài 6.1: Ngân hàng 20 tình huống sư phạm thực tế ở trường phổ thông',
          number: 1,
          description:
            'Tuyển tập 20 tình huống sư phạm điển hình (chống đối, yêu sớm, bạo lực học đường, mất cắp, mâu thuẫn CMHS) kèm quy trình 5 bước xử lý mẫu và bẫy sư phạm cần tránh.',
          level: 'advanced',
          estimatedMinutes: 50,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: ['6-1', 'bai-6-1', 'c6-b1', 'tinh-huong-su-pham'],
          tags: ['Tình huống sư phạm', 'Thực hành sư phạm', 'Quy trình 5 bước'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/chapter-6.tsx',
        },
        {
          id: 'gdh-c6-b2-de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an',
          slug: 'de-cuong-cau-hoi-on-thi-tu-luan-trong-tam-va-dan-y-dap-an',
          title: 'Bài 6.2: Đề cương câu hỏi ôn thi tự luận trọng tâm & Dàn ý đáp án',
          number: 2,
          description:
            'Bộ câu hỏi tự luận lý thuyết và phân tích thực tiễn cốt lõi của học phần Giáo dục học kèm barem điểm chuẩn phục vụ kỳ thi kết thúc học phần.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: ['6-2', 'bai-6-2', 'c6-b2', 'de-cuong-on-tap'],
          tags: ['Đề cương ôn thi', 'Câu hỏi tự luận', 'Barem điểm'],
          status: 'published',
          version: '1.0.0',
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
 * Trả về module bài học cho các bài thuộc học phần Giáo dục học.
 */
export function getPedagogyLessonModule(lessonId: string): CompiledLessonModule | null {
  // Ưu tiên nạp module chuyên sâu của Chương 1, 2, 3, 4, 5, 6 nếu có
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
    .find((l) => l.id === lessonId);

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
            'rounded-2xl border border-amber-800/15 bg-gradient-to-br from-[#fcfbf7] to-amber-50/30 p-6 shadow-xs',
        },
        createElement(
          'div',
          { className: 'flex items-center gap-2 text-xs font-bold text-amber-800 uppercase' },
          createElement('span', null, 'Học phần Khoa học Giáo dục & Nghiệp vụ Sư phạm'),
        ),
        createElement(
          'h2',
          { className: 'mt-2 font-serif text-2xl font-bold text-stone-900' },
          lessonItem.title,
        ),
        createElement(
          'p',
          { className: 'mt-2 text-sm leading-relaxed text-stone-700' },
          lessonItem.description,
        ),
      ),
      createElement(
        'div',
        {
          className:
            'rounded-xl border border-stone-200/90 bg-white p-5 leading-relaxed text-stone-700 space-y-4',
        },
        createElement(
          'h3',
          { className: 'text-base font-bold text-stone-900 border-b border-stone-100 pb-2' },
          'Mục tiêu bài học & Chuẩn đầu ra',
        ),
        createElement(
          'ul',
          { className: 'list-disc pl-5 space-y-1.5 text-sm' },
          createElement(
            'li',
            null,
            'Nắm vững hệ thống khái niệm lý luận và các quy định pháp quy liên quan.',
          ),
          createElement(
            'li',
            null,
            'Vận dụng linh hoạt các nguyên tắc và phương pháp giáo dục vào môi trường trường phổ thông.',
          ),
          createElement(
            'li',
            null,
            'Rèn luyện kỹ năng xử lý tình huống sư phạm khoa học, thấu cảm và tuân thủ chuẩn nghề nghiệp.',
          ),
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
