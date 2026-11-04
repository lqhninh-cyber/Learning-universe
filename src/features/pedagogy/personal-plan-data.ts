export interface YearPlanData {
  criteria: number[];
  goalsText: string;
  updatedAt?: string;
}

export interface PlanStorageMap {
  [year: number]: YearPlanData;
}

export interface TT20CriterionItem {
  readonly id: number;
  readonly name: string;
  readonly standard: string;
}

export const TT20_CRITERIA: readonly TT20CriterionItem[] = [
  { id: 1, name: '1. Đạo đức nhà giáo', standard: 'Tiêu chuẩn 1: Phẩm chất' },
  { id: 2, name: '2. Phong cách nhà giáo', standard: 'Tiêu chuẩn 1: Phẩm chất' },
  {
    id: 3,
    name: '3. Phát triển chuyên môn bản thân',
    standard: 'Tiêu chuẩn 2: Chuyên môn & Nghiệp vụ',
  },
  {
    id: 4,
    name: '4. Xây dựng kế hoạch dạy học & GD',
    standard: 'Tiêu chuẩn 2: Chuyên môn & Nghiệp vụ',
  },
  {
    id: 5,
    name: '5. Sử dụng phương pháp dạy học & GD',
    standard: 'Tiêu chuẩn 2: Chuyên môn & Nghiệp vụ',
  },
  {
    id: 6,
    name: '6. Kiểm tra, đánh giá học sinh',
    standard: 'Tiêu chuẩn 2: Chuyên môn & Nghiệp vụ',
  },
  {
    id: 7,
    name: '7. Tư vấn và hỗ trợ học sinh',
    standard: 'Tiêu chuẩn 2: Chuyên môn & Nghiệp vụ',
  },
  { id: 8, name: '8. Xây dựng văn hóa nhà trường', standard: 'Tiêu chuẩn 3: Môi trường giáo dục' },
  { id: 9, name: '9. Thực hiện quy chế dân chủ', standard: 'Tiêu chuẩn 3: Môi trường giáo dục' },
  {
    id: 10,
    name: '10. Thực hiện an toàn trường học',
    standard: 'Tiêu chuẩn 3: Môi trường giáo dục',
  },
  {
    id: 11,
    name: '11. Tạo dựng mối quan hệ hợp tác cha mẹ HS',
    standard: 'Tiêu chuẩn 4: Phối hợp',
  },
  { id: 12, name: '12. Phối hợp các tổ chức, cá nhân', standard: 'Tiêu chuẩn 4: Phối hợp' },
  {
    id: 13,
    name: '13. Sử dụng ngoại ngữ hoặc tiếng DT',
    standard: 'Tiêu chuẩn 5: Ngoại ngữ & CNTT',
  },
  { id: 14, name: '14. Ứng dụng công nghệ thông tin', standard: 'Tiêu chuẩn 5: Ngoại ngữ & CNTT' },
  {
    id: 15,
    name: '15. Học tập nâng cao năng lực nghề nghiệp',
    standard: 'Tiêu chuẩn 5: Ngoại ngữ & CNTT',
  },
];

export interface SampleYearTemplate {
  year: number;
  title: string;
  subtitle: string;
  criteria: number[];
  content: string;
  badge: string;
}

export const SAMPLE_TEMPLATES: Record<number, SampleYearTemplate> = {
  1: {
    year: 1,
    title: 'Năm 1: Thích ứng & Xây dựng Nền tảng Sư phạm',
    subtitle:
      'Rèn luyện tác phong chuẩn mực, kỹ năng viết bảng, chuẩn tiếng Anh B1 và GPA Toán >= 3.2',
    criteria: [1, 2, 3, 13],
    badge: 'Nền tảng & Thích ứng',
    content: `1. Mục tiêu Học tập & Chuyên môn Toán học:
- Đạt danh hiệu Sinh viên Xuất sắc, điểm rèn luyện Tốt trở lên.
- Đạt GPA các học phần Toán đại cương (Cấu trúc đại số, Hình học Affine, Giải tích hàm một biến) từ 3.2/4.0 trở lên.
- Xây dựng phương pháp tự học đại học khoa học, rèn luyện tư duy trừu tượng và độc lập nghiên cứu tài liệu toán.
- Ôn tập và thi đạt chứng chỉ tiếng Anh B1 (IELTS 5.0 - 5.5) ngay trong năm nhất (Tiêu chí 13).

2. Rèn luyện Tác phong & Nghiệp vụ Sư phạm:
- Tham gia Câu lạc bộ Sư phạm Toán: luyện phát âm chuẩn, rèn chữ viết bảng ngay ngắn, cách trình bày bảng sư phạm khoa học (Tiêu chí 2).
- Giữ gìn đạo đức nhà giáo trong lời ăn tiếng nói, tác phong giao tiếp chuẩn mực với thầy cô và bạn bè; xây dựng văn hóa ứng xử văn minh trên không gian mạng (Tiêu chí 1).

3. Kỹ năng Xã hội & Hoạt động Đoàn - Hội:
- Tích cực tham gia các phong trào tình nguyện (Tiếp sức mùa thi, Mùa hè xanh) để rèn luyện tinh thần cống hiến và kỹ năng làm việc nhóm.`,
  },
  2: {
    year: 2,
    title: 'Năm 2: Kỹ năng Dạy học Số & Công cụ Chuyên ngành',
    subtitle: 'Làm chủ GeoGebra/LaTeX, soạn giáo án Công văn 5512, lập đề cương NCKHSPUD',
    criteria: [4, 5, 14],
    badge: 'Công nghệ & Giáo án',
    content: `1. Năng lực Công nghệ & Dạy học Số:
- Thành thạo các công cụ số chuyên ngành Toán: GeoGebra 2D/3D trực quan hóa hình học không gian, soạn thảo tài liệu toán bằng LaTeX/Overleaf chuẩn mực (Tiêu chí 14).
- Ứng dụng các nền tảng tương tác số (Canva, PowerPoint, Quizizz, Padlet) vào thiết kế bài giảng sinh động, kích thích sự chủ động của học sinh.

2. Xây dựng Kế hoạch Bài dạy (Giáo án) theo CT GDPT 2018:
- Nghiên cứu Công văn 5512/BGDĐT, tập thiết kế kế hoạch bài dạy phát triển phẩm chất và năng lực học sinh (Tiêu chí 4).
- Vận dụng các phương pháp dạy học tích cực (dạy học giải quyết vấn đề, dạy học hợp tác nhóm) vào bài tập thực hành bộ môn (Tiêu chí 5).

3. Nghiên cứu Khoa học & Thực tế Sư phạm:
- Đăng ký và hoàn thành đề tài Nghiên cứu khoa học sư phạm ứng dụng (NCKHSPUD) cấp Khoa/Trường về ứng dụng công nghệ trong dạy học Toán.
- Đi làm gia sư dạy kèm học sinh THCS/THPT để cọ xát trực tiếp với tâm lý lứa tuổi và phát hiện lỗ hổng kiến thức thường gặp.`,
  },
  3: {
    year: 3,
    title: 'Năm 3: Nghiệp vụ Sư phạm Chuyên sâu & Công tác Chủ nhiệm',
    subtitle: 'Tập giảng, thiết kế kế hoạch HĐTN theo Rubric A.1.9, tìm hiểu hồ sơ GVCN theo TT32',
    criteria: [6, 7, 8, 11],
    badge: 'Chủ nhiệm & Trải nghiệm',
    content: `1. Nghiệp vụ Giảng dạy & Kiểm tra Đánh giá:
- Tham gia đợt Kiến tập sư phạm và các buổi tập giảng chuyên sâu: hoàn thiện kỹ năng thuyết trình, đặt câu hỏi gợi mở và làm chủ thời gian tiết học.
- Nắm vững quy trình xây dựng ma trận đề kiểm tra, bảng đặc tả và ngân hàng câu hỏi đánh giá năng lực theo đúng chuẩn Thông tư 22/2021 (Tiêu chí 6).

2. Công tác Giáo viên Chủ nhiệm & Hoạt động Trải nghiệm:
- Nghiên cứu Điều lệ trường trung học (Thông tư 32/2020), tìm hiểu chức năng, nhiệm vụ và các biểu mẫu sổ sách quản lý lớp của GVCN.
- Thiết kế kế hoạch chủ đề tổ chức Hoạt động trải nghiệm, hướng nghiệp (HĐTN, HN) theo đúng cấu trúc rubric A.1.9 (Tiêu chí 7, 8).
- Rèn luyện kỹ năng lắng nghe thấu cảm, tư vấn tâm lý học đường cho học sinh; áp dụng các biện pháp Kỷ luật tích cực thay thế trừng phạt.

3. Phối hợp Giáo dục & Kết nối Lực lượng:
- Rèn luyện kỹ năng giao tiếp sư phạm với phụ huynh học sinh; tìm hiểu quy trình phối hợp Nhà trường - Gia đình - Xã hội trong giáo dục đạo đức học sinh (Tiêu chí 11).`,
  },
  4: {
    year: 4,
    title: 'Năm 4: Thực tập Sư phạm Toàn diện & Hoàn thiện Chuẩn nghề',
    subtitle: 'Thực tập tốt nghiệp Xuất sắc, giải quyết 20 tình huống sư phạm, chuẩn ngoại ngữ B2',
    criteria: [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 13, 14, 15],
    badge: 'Thực tập & Khóa luận',
    content: `1. Thực tập Sư phạm Tốt nghiệp Toàn diện:
- Hoàn thành xuất sắc đợt Thực tập tốt nghiệp tại trường THPT: đứng lớp giảng dạy tối thiểu 8-10 tiết Toán chính khóa đạt loại Giỏi; làm chủ công tác chủ nhiệm lớp trong 8-10 tuần thực tế.
- Xử lý linh hoạt và nhân văn các tình huống sư phạm phát sinh theo quy trình 5 bước khoa học; xây dựng tình cảm gắn bó với học sinh và đồng nghiệp.

2. Khóa luận Tốt nghiệp & Chuẩn Đầu ra:
- Bảo vệ thành công Khóa luận tốt nghiệp cử nhân Sư phạm Toán học với điểm số Xuất sắc.
- Đạt chuẩn ngoại ngữ đầu ra B2 (IELTS 6.5) và chuẩn tin học ứng dụng theo quy định của Trường ĐH Sư phạm TP.HCM.

3. Hoàn thiện Hồ sơ Năng lực (Teaching Portfolio):
- Hệ thống hóa toàn bộ hồ sơ minh chứng đối chiếu 15 tiêu chí của Chuẩn nghề nghiệp giáo viên phổ thông (Thông tư 20/2018).
- Chuẩn bị hồ sơ tuyển dụng viên chức giáo dục, sẵn sàng tham gia kỳ thi tuyển dụng giáo viên phổ thông hoặc ứng tuyển vào các trường trung học trọng điểm.`,
  },
};
