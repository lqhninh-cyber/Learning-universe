import type { CourseDocument } from '../cau-truc-dai-so/course';

export const CALCULUS_DOCUMENTS: readonly CourseDocument[] = [
  {
    id: 'gt-giai-tich-ham-mot-bien',
    title: 'Giáo trình Giải tích hàm một biến (Trần Trí Dũng, 2022)',
    categoryLabel: 'Giáo trình chính khóa',
    badge: 'PDF Bản chuẩn',
    url: 'https://drive.google.com/file/d/1VWzmofOUrvvHF_Jz7vViVy3zLNZPhL7Z/view?usp=drive_link',
    filename: 'Giao_trinh_Giai_tich_ham_mot_bien.pdf',
    description:
      'Nền tảng Giải tích thực từ tiên đề trường R, giới hạn dãy/hàm, tính liên tục, phép tính vi phân, tích phân Riemann đến lý thuyết chuỗi số và chuỗi hàm.',
  },
  {
    id: 'de-cuong-on-thi-gthmb',
    title: 'Nội dung ôn thi và đề mẫu',
    categoryLabel: 'Tài liệu ôn thi cuối khóa',
    badge: 'Trọng tâm & Đề mẫu',
    url: 'https://drive.google.com/file/d/1DPL759PtZj44I7VcCCTjfN2kkRYNZoVK/view?usp=drive_link',
    filename: 'Noi_dung_on_thi_va_de_mau.pdf',
    description:
      'Hệ thống trọng tâm lý thuyết, bài tập ôn thi và 5 câu tự luận đề mẫu học phần Giải tích hàm một biến (MATH1403).',
  },
];
