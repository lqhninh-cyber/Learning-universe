import type { ManifestSubject } from '@schemas/index';
import type { CompiledLessonModule } from '@/content-runtime/loader';
import { createElement, type FC } from 'react';
import { getChapter1LessonModule } from './chapter-1';

// ============================================================================
// 1. DANH MỤC 13 TÀI LIỆU HỌC PHẦN & VĂN BẢN PHÁP QUY SƯ PHẠM
// ============================================================================

export interface PedagogyDocument {
  readonly id: string;
  readonly title: string;
  readonly category: 'curriculum' | 'legal' | 'handbook';
  readonly categoryLabel: string;
  readonly path: string;
  readonly filename: string;
  readonly description: string;
  readonly badge: string;
  readonly pages?: string;
}

export const PEDAGOGY_DOCUMENTS: readonly PedagogyDocument[] = [
  // Nhóm 1: Giáo trình & Đề cương chính thức
  {
    id: 'gt-gdh-hcmue',
    title: 'Giáo trình Giáo dục học HCMUE (Chính thức)',
    category: 'curriculum',
    categoryLabel: 'Giáo trình chuẩn',
    path: '/docs/giao-duc-hoc/Giao_trinh_GDH_HCMUE.pdf',
    filename: 'Giao_trinh_GDH_HCMUE.pdf',
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
    path: '/docs/giao-duc-hoc/Gioi_thieu_hoc_phan_GDH.pdf',
    filename: 'Gioi_thieu_hoc_phan_GDH.pdf',
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
    path: '/docs/giao-duc-hoc/Luat_Giao_duc_2019.pdf',
    filename: 'Luat_Giao_duc_2019.pdf',
    description:
      'Đạo luật nền tảng quy định mục tiêu, tính chất, nguyên lý giáo dục (Điều 3); mục tiêu giáo dục phổ thông (Điều 28); quyền và nghĩa vụ nhà giáo (Điều 69-70).',
    badge: 'Luật số 43/2019',
  },
  {
    id: 'du-thao-luat-nha-giao',
    title: 'Dự thảo Luật Nhà giáo',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: '/docs/giao-duc-hoc/Luat_Nha_giao.pdf',
    filename: 'Luat_Nha_giao.pdf',
    description:
      'Cập nhật định hướng chính sách mới nhất về vị thế pháp lý, quyền tự chủ nghề nghiệp, chế độ đãi ngộ và đạo đức nghề nghiệp của nhà giáo.',
    badge: 'Dự thảo Quốc hội',
  },
  {
    id: 'ct-gdpt-2018-tong-the',
    title: 'Khung Chương trình GDPT 2018 (Tổng thể)',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: '/docs/giao-duc-hoc/CT_GDPT_2018_Tong_the.pdf',
    filename: 'CT_GDPT_2018_Tong_the.pdf',
    description:
      'Khung chương trình giáo dục phổ thông mới chuyển từ trang bị kiến thức sang phát triển toàn diện 5 phẩm chất chủ yếu và 10 năng lực cốt lõi.',
    badge: 'CT GDPT 2018',
  },
  {
    id: 'ct-hoat-dong-trai-nghiem',
    title: 'Chương trình Hoạt động trải nghiệm 2018',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: '/docs/giao-duc-hoc/CT_Hoat_dong_trai_nghiem.pdf',
    filename: 'CT_Hoat_dong_trai_nghiem.pdf',
    description:
      'Quy chuẩn chương trình bắt buộc cấp THCS & THPT: 4 mạch nội dung (Bản thân, Xã hội, Tự nhiên, Hướng nghiệp) và 4 hình thức tổ chức chủ đạo.',
    badge: 'HĐTN & Hướng nghiệp',
  },
  {
    id: 'dieu-le-truong-trung-hoc-tt32',
    title: 'Điều lệ trường trung học (Thông tư 32/2020/TT-BGDĐT)',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: '/docs/giao-duc-hoc/Dieu_le_truong_trung_hoc_TT32.pdf',
    filename: 'Dieu_le_truong_trung_hoc_TT32.pdf',
    description:
      'Quy định cơ cấu tổ chức trường phổ thông, nhiệm vụ và quyền hạn của giáo viên (Điều 27, 29), quyền hạn đặc thù của giáo viên chủ nhiệm và khen thưởng - kỷ luật học sinh (Điều 38).',
    badge: 'Thông tư 32/2020',
  },
  {
    id: 'chuan-nghe-nghiep-gv-tt20',
    title: 'Chuẩn nghề nghiệp giáo viên phổ thông (Thông tư 20/2018/TT-BGDĐT)',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: '/docs/giao-duc-hoc/Chuan_nghe_nghiep_GV_TT20.pdf',
    filename: 'Chuan_nghe_nghiep_GV_TT20.pdf',
    description:
      'Hệ thống 5 tiêu chuẩn và 15 tiêu chí đánh giá năng lực nghề nghiệp giáo viên cơ sở giáo dục phổ thông (Phẩm chất nhà giáo, Phát triển chuyên môn, Xây dựng môi trường, Phối hợp, Ngoại ngữ & Tin học).',
    badge: 'Thông tư 20/2018',
  },
  {
    id: 'tt17-sua-doi-ctgdpt',
    title: 'Thông tư 17/2025 Sửa đổi CT GDPT',
    category: 'legal',
    categoryLabel: 'Văn bản pháp quy',
    path: '/docs/giao-duc-hoc/TT17_Sua_doi_CTGDPT.pdf',
    filename: 'TT17_Sua_doi_CTGDPT.pdf',
    description:
      'Cập nhật sửa đổi, bổ sung một số nội dung trong Chương trình GDPT 2018 nhằm tối ưu hóa thời lượng và tích hợp hoạt động giáo dục.',
    badge: 'Thông tư 17/2025',
  },

  // Nhóm 3: Cẩm nang Sư phạm & Công cụ Nghiên cứu
  {
    id: 'ky-luat-tich-cuc',
    title: 'Cẩm nang Phương pháp Kỷ luật tích cực',
    category: 'handbook',
    categoryLabel: 'Nghiệp vụ thực hành',
    path: '/docs/giao-duc-hoc/Ky_luat_tich_cuc.pdf',
    filename: 'Ky_luat_tich_cuc.pdf',
    description:
      'Hệ thống các giải pháp thay thế hình phạt trừng phạt thân thể và bạo lực tinh thần, chuyển đổi hành vi dựa trên sự tôn trọng, thấu cảm và trách nhiệm.',
    badge: 'Kỷ luật tích cực',
  },
  {
    id: 'thang-bloom',
    title: 'Thang đo nhận thức Bloom trong sư phạm',
    category: 'handbook',
    categoryLabel: 'Công cụ đánh giá',
    path: '/docs/giao-duc-hoc/Thang_Bloom.pdf',
    filename: 'Thang_Bloom.pdf',
    description:
      '6 cấp độ nhận thức của Bloom (Nhận biết, Thông hiểu, Vận dụng, Phân tích, Đánh giá, Sáng tạo) ứng dụng thiết kế mục tiêu bài học và câu hỏi phản tư.',
    badge: 'Bloom Taxonomy',
  },
  {
    id: 'tra-cuu-nghe-ilo',
    title: 'Sách tra cứu nghề nghiệp (Phân loại ILO)',
    category: 'handbook',
    categoryLabel: 'Tư vấn hướng nghiệp',
    path: '/docs/giao-duc-hoc/Tra_cuu_nghe_ILO.pdf',
    filename: 'Tra_cuu_nghe_ILO.pdf',
    description:
      'Bản đồ các nhóm ngành nghề chuẩn quốc tế phục vụ công tác tư vấn giáo dục hướng nghiệp trong Chương trình Hoạt động trải nghiệm.',
    badge: 'Tiêu chuẩn ILO',
  },
  {
    id: 'nghien-cuu-su-pham-bo-tro',
    title: 'Tài liệu Nghiên cứu sư phạm bổ trợ',
    category: 'handbook',
    categoryLabel: 'Nghiên cứu khoa học',
    path: '/docs/giao-duc-hoc/Nghien_cuu_su_pham_bo_tro.pdf',
    filename: 'Nghien_cuu_su_pham_bo_tro.pdf',
    description:
      'Quy trình nghiên cứu khoa học sư phạm ứng dụng trong nhà trường phổ thông: xác định vấn đề, thiết kế tác động, đo lường và phân tích dữ liệu.',
    badge: 'NCKH Ứng dụng',
  },
];

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

export const PEDAGOGICAL_CASE_STUDIES: readonly PedagogicalCaseStudy[] = [
  {
    id: 1,
    title: 'Học sinh cá biệt ngang nhiên không ghi bài và thách thức giáo viên trên lớp',
    context:
      'Trong giờ dạy, giáo viên phát hiện em H. (học sinh cá biệt nổi tiếng của lớp) ngồi quay xuống bàn dưới trêu chọc bạn bè và không hề mở vở chép bài. Khi giáo viên bước tới nhắc nhở nhẹ nhàng, H. ngửa người ra sau và nói lớn tiếng trước cả lớp: "Môn này chán òm, em không thích học nên không ghi đấy, cô làm gì được em nào?"',
    question:
      'Nếu là giáo viên bộ môn trong tình huống này, thầy/cô sẽ xử lý như thế nào để vừa giữ nghiêm kỷ cương lớp học, vừa không làm bùng phát xung đột căng thẳng với học sinh?',
    principlesApplied: [
      'Nguyên tắc tôn trọng nhân cách kết hợp với yêu cầu cao đối với học sinh',
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể',
      'Nguyên tắc kiềm chế cảm xúc sư phạm & biến đổi tình huống',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Giữ bình tĩnh tuyệt đối & Không rơi vào bẫy đối đầu tay đôi',
        content:
          'Giáo viên hít thở sâu, giữ nét mặt điềm tĩnh, không nổi giận mắng mỏ hay đôi co to tiếng với học sinh trước mặt cả lớp, vì đây là hành vi học sinh đang muốn kích động để thể hiện bản thân.',
      },
      {
        step: 2,
        title: 'Ổn định không khí lớp học & Đặt ranh giới rõ ràng',
        content:
          'Nói rõ ràng, dứt khoát với âm lượng vừa phải: "Ý kiến về việc thích hay không thích môn học là cảm xúc cá nhân của em, cô ghi nhận. Tuy nhiên, quy định chung của lớp học là mọi học sinh đều phải có vở ghi và giữ trật tự để không ảnh hưởng đến các bạn khác. Bây giờ là thời gian của cả lớp, cô và em sẽ trao đổi riêng về vấn đề này sau giờ học." Sau đó tiếp tục bài giảng ngay.',
      },
      {
        step: 3,
        title: 'Gặp gỡ riêng sau giờ học & Lắng nghe nguyên nhân thực sự',
        content:
          'Cuối buổi, mời H. ở lại văn phòng hoặc góc yên tĩnh. Không vội vàng kết tội mà đặt câu hỏi gợi mở: "Hôm nay điều gì khiến em cảm thấy môn học chán và có phản ứng gay gắt như vậy?". Lắng nghe để hiểu H. đang bị hổng kiến thức căn bản, buồn bực chuyện gia đình hay muốn gây chú ý.',
      },
      {
        step: 4,
        title: 'Phân tích hành vi & Đưa ra yêu cầu sửa đổi cụ thể',
        content:
          'Chỉ rõ cho H. thấy hành vi thách thức giáo viên trước lớp là sai quy định và ảnh hưởng đến danh dự của chính em. Đề nghị em mượn vở bạn ghi lại bài hôm nay và hỗ trợ em giải tỏa khó khăn trong môn học.',
      },
      {
        step: 5,
        title: 'Phối hợp với GVCN và theo dõi sự tiến bộ',
        content:
          'Trao đổi với GVCN để nắm rõ thêm bối cảnh gia đình. Trong các tiết học sau, chủ động quan sát, đặt những câu hỏi vừa sức và kịp thời khen ngợi khi H. có biểu hiện hợp tác tích cực.',
      },
    ],
    pitfallsToAvoid: [
      'Tức giận xông vào tát hoặc đuổi ngay học sinh ra khỏi lớp (vi phạm Điều lệ trường học).',
      'Đôi co tranh cãi tay đôi làm cả lớp gián đoạn việc học và biến mình thành trò cười.',
      'Bỏ qua xem như không có gì xảy ra khiến kỷ cương lớp học bị sụp đổ.',
    ],
    coreLesson:
      'Sự bình tĩnh và điềm đạm của người thầy trước sự khiêu khích chính là sức mạnh sư phạm tối cao.',
  },
  {
    id: 2,
    title: 'Phát hiện học sinh trong lớp có biểu hiện yêu sớm và sa sút học tập',
    context:
      'GVCN lớp 10 nhận thấy hai học sinh T. (nam) và M. (nữ) thường xuyên đi học cùng nhau, ngồi cạnh nhau thì lơ đãng, thì thầm to nhỏ. Điểm kiểm tra giữa kỳ của cả hai em đều tụt dốc thảm hại. Một số bạn trong lớp bắt đầu xì xào bàn tán về việc hai bạn đang "cặp kè" yêu nhau. Phụ huynh của em M. gọi điện cho GVCN trong trạng thái hoảng hốt và yêu cầu chuyển chỗ ngay lập tức.',
    question:
      'Với vai trò là Giáo viên chủ nhiệm lớp, thầy/cô sẽ xử lý tình huống này như thế nào để bảo vệ tình bạn trong sáng tuổi học trò và giúp hai em tập trung học tập?',
    principlesApplied: [
      'Nguyên tắc phù hợp đặc điểm tâm sinh lý lứa tuổi',
      'Nguyên tắc tôn trọng nhân cách kết hợp yêu cầu cao',
      'Nguyên tắc phối hợp Nhà trường và Gia đình',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Thấu hiểu và tôn trọng quy luật tâm sinh lý lứa tuổi',
        content:
          'Nhận thức rằng rung cảm giới tính ở tuổi 15-16 là hoàn toàn tự nhiên; không coi đây là "tội lỗi" hay sự đồi bại đạo đức. Tuyệt đối không đưa sự việc ra bêu rếu trước tập thể lớp hay trước cờ.',
      },
      {
        step: 2,
        title: 'Trấn an phụ huynh học sinh',
        content:
          'Trao đổi với phụ huynh em M., khuyên cha mẹ bình tĩnh, không nên mắng nhiếc hay cấm đoán tiêu cực kẻo tạo phản ứng chống đối hoặc bỏ nhà đi; giải thích rằng nhà trường và gia đình sẽ cùng đồng hành hỗ trợ các em.',
      },
      {
        step: 3,
        title: 'Gặp gỡ riêng từng em với thái độ chân thành, tin cậy',
        content:
          'Trò chuyện riêng với từng em. Khéo léo phân tích: Tình cảm tuổi học trò rất đẹp nếu nó là động lực để cùng nhau phấn đấu. Nhưng việc điểm số sa sút hiện tại đang chứng minh điều ngược lại, khiến phụ huynh lo lắng và bạn bè bàn tán.',
      },
      {
        step: 4,
        title: 'Điều chỉnh vị trí ngồi tinh tế & Đặt ra giao ước',
        content:
          'Trong đợt đổi chỗ định kỳ của lớp, sắp xếp hai em ngồi ở hai bàn khác nhau nhưng vẫn trong cùng tổ để tránh cảm giác bị kỳ thị hay trừng phạt. Đặt ra "giao ước thi đua" giữa hai em về việc phục hồi điểm số học kỳ.',
      },
      {
        step: 5,
        title: 'Tổ chức sinh hoạt chuyên đề giáo dục giới tính cho cả lớp',
        content:
          'Lồng ghép vào tiết sinh hoạt lớp chủ đề "Tình bạn trong sáng và tình yêu tuổi học trò", giúp cả lớp trang bị nhận thức đúng đắn và kỹ năng bảo vệ bản thân.',
      },
    ],
    pitfallsToAvoid: [
      'Đọc tin nhắn riêng tư hoặc công khai chuyện tình cảm của các em trước lớp.',
      'Cấm đoán cực đoan khiến các em chuyển sang hẹn hò lén lút nguy hiểm hơn.',
    ],
    coreLesson:
      'Giáo dục giới tính tuổi dậy thì đòi hỏi sự khéo léo như người chèo đò qua dòng nước xoáy: phải xuôi theo dòng chảy tự nhiên nhưng định hướng đúng đích đến.',
  },
  {
    id: 3,
    title: 'Học sinh bị nghi ngờ lấy trộm tiền của bạn cùng lớp',
    context:
      'Trong giờ ra chơi, em A. chạy lên khóc nức nở báo với giáo viên là mình để quên 500.000 đồng trong cặp và vừa bị mất. Một số học sinh trong lớp chỉ điểm em B. (một học sinh có hoàn cảnh kinh tế khó khăn) vừa đi ngang qua bàn của A. lúc vắng người. Cả lớp bắt đầu dồn ánh mắt nghi ngờ và xa lánh B.',
    question:
      'Là GVCN, thầy/cô sẽ giải quyết tình huống nhạy cảm này như thế nào để tìm ra sự thật mà không làm tổn thương lòng tự trọng của học sinh bị nghi ngờ?',
    principlesApplied: [
      'Nguyên tắc tôn trọng nhân cách kết hợp yêu cầu cao',
      'Nguyên tắc giáo dục trong tập thể và bằng tập thể (bảo vệ dư luận lành mạnh)',
      'Nguyên tắc khách quan, công bằng và bảo vệ quyền trẻ em',
    ],
    solutionSteps: [
      {
        step: 1,
        title: 'Bảo toàn hiện trường & Tuyệt đối không khám xét tùy tiện',
        content:
          'Nhắc nhở cả lớp giữ trật tự, tuyệt đối không ai được tự ý lục cặp hay lục người của bạn khác (vi phạm nghiêm trọng quyền tự do thân thể). Yêu cầu các em không bàn tán, phán xét khi chưa có bằng chứng xác thực.',
      },
      {
        step: 2,
        title: 'Xác minh kỹ lưỡng với học sinh bị mất tiền',
        content:
          'Gặp riêng em A. để hỏi kỹ: Em mang tiền từ nhà lúc nào, để ở ngăn nào, có chắc chắn không bị rơi ở căng tin hay trên đường đi học không? Cùng em rà soát lại các nơi em đã đi qua.',
      },
      {
        step: 3,
        title: 'Nói chuyện riêng tế nhị với học sinh bị nghi ngờ',
        content:
          'Mời em B. vào phòng riêng trao đổi nhẹ nhàng: "Cô/thầy biết hiện tại có bạn hiểu nhầm em, nhưng thầy/cô tin rằng em là người trung thực. Em có thể kể lại giờ ra chơi em đã làm những gì không?". Giúp em cảm nhận được sự bảo vệ và tin tưởng từ người thầy.',
      },
      {
        step: 4,
        title: 'Tạo cơ hội tự giác sửa sai (nếu thực sự có việc lấy trộm)',
        content:
          'Nếu có chứng cứ gián tiếp chỉ ra B. có liên quan, tạo cơ hội cho em tự nguyện sửa sai mà không bị bêu tên: Đưa ra thông điệp trước lớp rằng "Ai nhặt được hoặc lỡ cầm nhầm hãy để lại vào hòm thư góp ý của lớp trong ngày hôm nay, mọi chuyện sẽ coi như hiểu lầm và được giải quyết êm đẹp".',
      },
      {
        step: 5,
        title: 'Khôi phục danh dự và tâm lý cho học sinh',
        content:
          'Khi tìm ra sự thật (hoặc tiền rơi ở chỗ khác), công khai minh oan dứt khoát trước lớp để bảo vệ danh dự cho em B., đồng thời giáo dục cả lớp bài học về sự cẩn thận giữ gìn tài sản cá nhân và không nghi kỵ bạn bè.',
      },
    ],
    pitfallsToAvoid: [
      'Tự ý khám xét cặp sách, quần áo của học sinh trước tập thể.',
      'Vội vàng quy chụp học sinh nghèo là kẻ trộm gây chấn thương tâm lý suốt đời cho đứa trẻ.',
    ],
    coreLesson:
      'Mất một số tiền có thể bù đắp được, nhưng để mất lòng tự trọng và niềm tin của một đứa trẻ thì không gì có thể hàn gắn nổi.',
  },
];

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
    lessonCount: 18,
    totalMinutes: 720,
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
      objectives: [],
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
          tags: ['Bản chất giáo dục', 'Chức năng xã hội', 'Tính lịch sử'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c2-b1.tsx',
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
          tags: ['Phát triển nhân cách', 'Vai trò chủ đạo', 'Di truyền', 'Môi trường'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c2-b2.tsx',
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
          tags: ['Khoa học Giáo dục', 'Luật Giáo dục 2019', 'Nguyên lý giáo dục'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c2-b3.tsx',
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
      objectives: [],
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
          tags: ['Điều lệ trường học', 'Thông tư 32', 'Cơ cấu tổ chức', 'HĐGD'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c3-b1.tsx',
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
          tags: ['Nguyên tắc giáo dục', '6 Nguyên tắc', 'Thực hành sư phạm'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c3-b2.tsx',
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
          tags: ['5 Phẩm chất 10 Năng lực', 'Phương pháp giáo dục', 'Kỷ luật tích cực'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c3-b3.tsx',
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
        'Vị trí, 4 chức năng cốt lõi của GVCN, nghệ thuật xây dựng tập thể học sinh tự quản và biện pháp phối hợp các lực lượng giáo dục trong và ngoài nhà trường.',
      number: 4,
      objectives: [],
      lessons: [
        {
          id: 'gdh-c4-b1-vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn',
          slug: 'vi-tri-chuc-nang-va-nhiem-vu-cua-gvcn',
          title: 'Bài 4.1: Vị trí, Chức năng và Nhiệm vụ của GVCN',
          number: 1,
          description:
            '4 chức năng nòng cốt của GVCN; quyền hạn và nhiệm vụ của GVCN theo Điều lệ trường phổ thông Thông tư 32/2020/TT-BGDĐT.',
          level: 'basic',
          estimatedMinutes: 35,
          prerequisites: [],
          sources: [{ source: 'thong-tu-32-2020' }],
          aliases: [],
          tags: ['GVCN', 'Chức năng GVCN', 'Quyền hạn nhiệm vụ'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c4-b1.tsx',
        },
        {
          id: 'gdh-c4-b2-xay-dung-va-phat-trien-tap-the-hoc-sinh',
          slug: 'xay-dung-va-phat-trien-tap-the-hoc-sinh',
          title: 'Bài 4.2: Xây dựng và Phát triển tập thể học sinh',
          number: 2,
          description:
            'Quy trình xây dựng tập thể học sinh: lập kế hoạch chủ nhiệm, bồi dưỡng ban cán sự lớp tự quản, xây dựng dư luận tập thể tích cực và phát huy truyền thống.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: ['Tập thể học sinh', 'Kế hoạch chủ nhiệm', 'Ban cán sự lớp'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c4-b2.tsx',
        },
        {
          id: 'gdh-c4-b3-phoi-hop-cac-luc-luong-giao-duc-va-bien-phap-tam-ly-giao-tiep',
          slug: 'phoi-hop-cac-luc-luong-giao-duc-va-bien-phap-tam-ly-giao-tiep',
          title: 'Bài 4.3: Phối hợp các lực lượng giáo dục & Biện pháp tâm lý - giao tiếp',
          number: 3,
          description:
            'Mô hình liên kết Nhà trường - Gia đình (CMHS) - Xã hội; kỹ năng giao tiếp sư phạm, xử lý học sinh cá biệt và hỗ trợ học sinh có hoàn cảnh đặc biệt.',
          level: 'advanced',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: ['Phối hợp giáo dục', 'Học sinh cá biệt', 'Giao tiếp sư phạm'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c4-b3.tsx',
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
        'Bản chất, 4 mạch nội dung của Hoạt động trải nghiệm theo CT GDPT 2018, các hình thức tổ chức phong phú và quy trình 6 bước thiết kế chủ đề trải nghiệm.',
      number: 5,
      objectives: [],
      lessons: [
        {
          id: 'gdh-c5-b1-ban-chat-muc-tieu-va-noi-dung-hoat-dong-trai-nghiem',
          slug: 'ban-chat-muc-tieu-va-noi-dung-hoat-dong-trai-nghiem',
          title: 'Bài 5.1: Bản chất, Mục tiêu và Nội dung Hoạt động trải nghiệm',
          number: 1,
          description:
            'Đặc trưng hoạt động giáo dục bắt buộc; mục tiêu cấp học THCS/THPT; phân tích 4 mạch nội dung: Hoạt động hướng vào bản thân, hướng đến xã hội, hướng đến tự nhiên và hướng nghiệp.',
          level: 'basic',
          estimatedMinutes: 40,
          prerequisites: [],
          sources: [{ source: 'chuong-trinh-gdpt-2018' }],
          aliases: [],
          tags: ['Hoạt động trải nghiệm', '4 Mạch nội dung', 'Hướng nghiệp'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c5-b1.tsx',
        },
        {
          id: 'gdh-c5-b2-hinh-thuc-va-phuong-phap-to-chuc-hoat-dong-trai-nghiem',
          slug: 'hinh-thuc-va-phuong-phap-to-chuc-hoat-dong-trai-nghiem',
          title: 'Bài 5.2: Hình thức và Phương pháp tổ chức Hoạt động trải nghiệm',
          number: 2,
          description:
            '4 hình thức tổ chức cốt lõi: Sinh hoạt dưới cờ, Sinh hoạt lớp, Hoạt động giáo dục theo chủ đề và Câu lạc bộ; phương pháp diễn đàn, dự án, trò chơi và tham quan thực tế.',
          level: 'intermediate',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'chuong-trinh-gdpt-2018' }],
          aliases: [],
          tags: ['Sinh hoạt dưới cờ', 'Sinh hoạt lớp', 'Phương pháp trải nghiệm'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c5-b2.tsx',
        },
        {
          id: 'gdh-c5-b3-quy-trinh-thiet-ke-ke-hoach-hoat-dong-trai-nghiem-va-danh-gia',
          slug: 'quy-trinh-thiet-ke-ke-hoach-hoat-dong-trai-nghiem-va-danh-gia',
          title: 'Bài 5.3: Quy trình Thiết kế Kế hoạch hoạt động trải nghiệm & Đánh giá',
          number: 3,
          description:
            'Quy trình 6 bước thiết kế kế hoạch giáo dục chủ đề trải nghiệm; các công cụ đánh giá năng lực: rubric, hồ sơ học tập (portfolio), bảng kiểm và đánh giá đồng đẳng.',
          level: 'advanced',
          estimatedMinutes: 45,
          prerequisites: [],
          sources: [{ source: 'gt-gdh-hcmue-2024' }],
          aliases: [],
          tags: ['Kế hoạch bài dạy', 'Rubric đánh giá', 'Quy trình 6 bước'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c5-b3.tsx',
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
          aliases: [],
          tags: ['Tình huống sư phạm', 'Thực hành sư phạm', 'Quy trình 5 bước'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c6-b1.tsx',
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
          aliases: [],
          tags: ['Đề cương ôn thi', 'Câu hỏi tự luận', 'Barem điểm'],
          status: 'published',
          version: '1.0.0',
          file: '/src/data/courses/giao-duc-hoc/c6-b2.tsx',
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
  // Ưu tiên nạp module chuyên sâu của Chương 1 nếu có
  const ch1Module = getChapter1LessonModule(lessonId);
  if (ch1Module) {
    return ch1Module;
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
