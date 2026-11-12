import type { CourseExamBank, ExamPaper } from '../exam-bank-types';

const MATH1302_SHEET_NOTES = [
  'Không được sử dụng tài liệu.',
  'Được sử dụng máy tính cầm tay.',
  'Cán bộ coi thi không giải thích gì thêm.',
] as const;

export const MATH1302_OFFICIAL_HK1_PAPER: ExamPaper = {
  id: 'hhave-official-2025-2026-hk1',
  year: '2025 - 2026',
  semester: 'Học kỳ I',
  examCourseCode: '2512MATH18221',
  allowedMaterials: 'Được dùng máy tính cầm tay',
  durationMinutes: 90,
  questionPrefix: 'Bài',
  title: 'Đề thi Chính thức HK1 (2025 - 2026) — Hình học Affine và Euclid',
  description:
    'Mã học phần đề thi: 2512MATH18221 · Thời gian làm bài: 90 phút (Được sử dụng máy tính cầm tay). Cấu trúc 3 bài tự luận (3.0đ – 4.0đ – 3.0đ).',
  sheetHeader: {
    leftLines: [
      'TRƯỜNG ĐẠI HỌC SƯ PHẠM TP.HCM',
      'KHOA TOÁN – TIN HỌC',
      'Đề số 1',
      '(Đề thi gồm có 01 trang)',
    ],
    rightTitle: 'ĐỀ THI KẾT THỨC HỌC PHẦN',
    rightSubtitle: 'HÌNH HỌC AFFINE VÀ HÌNH HỌC EUCLID',
    metaRows: [
      'Mã học phần: 2512MATH18221 — ĐVHT: 2',
      'Năm học: 2025-2026 — Học kỳ: 1',
      'Thời gian làm bài: 90 phút',
    ],
  },
  endMarker: '---HẾT---',
  sheetNotesHeading: 'Chú ý:',
  sheetNotes: MATH1302_SHEET_NOTES,
  problems: [
    {
      id: 'hhave-2025-2026-hk1-b1',
      number: 1,
      points: 3.0,
      labelPrefix: 'Bài',
      sheetHeading: 'Bài 1 (3.0 điểm).',
      inlineSheetHeading: true,
      solutionRubric:
        'Tính đúng các đạo hàm riêng chia đôi: 1.5 điểm · Lập đúng phương trình siêu phẳng kính liên hợp: 1.5 điểm.',
      statement:
        'Trong không gian afin $A^3$, cho siêu mặt bậc hai $(S)$ có phương trình đối với mục tiêu cho trước là\n$$\nx^2 - 2y^2 + z^2 + 4xy - 8xz - 4yz - 14x - 4y + 14z + 16 = 0.\n$$\nViết phương trình siêu phẳng kính liên hợp với phương $\\vec{c} = (1, 2, 3)$.',
      hint: "Tính các đa thức đạo hàm riêng chia đôi $F'_1, F'_2, F'_3$ rồi lập tổ hợp tuyến tính $c_1 F'_1 + c_2 F'_2 + c_3 F'_3 = 0$.",
      solution:
        "Đặt $F(x, y, z)$ là vế trái phương trình. Ta có các đa thức đạo hàm riêng chia đôi:\n$$\nF'_1 = x + 2y - 4z - 7, \\quad F'_2 = 2x - 2y - 2z - 2, \\quad F'_3 = -4x - 2y + z + 7.\n$$\nPhương trình siêu phẳng kính liên hợp với phương $\\vec{c} = (1, 2, 3)$ là:\n$$\n1 \\cdot F'_1 + 2 \\cdot F'_2 + 3 \\cdot F'_3 = 0 \\iff (x + 2y - 4z - 7) + 2(2x - 2y - 2z - 2) + 3(-4x - 2y + z + 7) = 0\n$$\n$$\n\\iff -7x - 8y - 5z + 10 = 0 \\iff 7x + 8y + 5z - 10 = 0.\n$$",
    },
    {
      id: 'hhave-2025-2026-hk1-b2',
      number: 2,
      points: 4.0,
      labelPrefix: 'Bài',
      sheetHeading: 'Bài 2 (4.0 điểm).',
      inlineSheetHeading: true,
      partDelimiter: ')',
      solutionRubric: 'Ý 1: 2.5 điểm · Ý 2: 1.5 điểm.',
      statement:
        'Trong không gian Euclid $E^4$ với mục tiêu trực chuẩn cho trước, cho điểm $M(2, -1, 3, 1)$ và phẳng $\\alpha$ có phương trình tổng quát là:\n$$\n\\begin{cases} x_1 + x_2 + x_3 - x_4 + 1 = 0 \\\\ 2x_1 + x_2 - 2x_3 + x_4 + 2 = 0 \\end{cases}\n$$',
      parts: [
        {
          label: '1',
          statement: "Tìm tọa độ hình chiếu vuông góc $M'$ của $M$ trên $\\alpha$.",
          hint: 'Dùng phương pháp tham số hóa phẳng bù trực giao $\\beta$ đi qua $M$ nhận $\\vec{n}_1, \\vec{n}_2$ làm cơ sở của phương $\\vec{\\alpha}^\\perp$.',
          solution:
            "Hai vectơ pháp tuyến $\\vec{n}_1 = (1, 1, 1, -1)$ và $\\vec{n}_2 = (2, 1, -2, 1)$ tạo thành cơ sở của $\\vec{\\alpha}^\\perp$. Phẳng $\\beta$ đi qua $M(2, -1, 3, 1)$ và vuông góc hoàn toàn với $\\alpha$ có phương trình tham số:\n$$\n\\begin{cases} x_1 = 2 + t + 2s \\\\ x_2 = -1 + t + s \\\\ x_3 = 3 + t - 2s \\\\ x_4 = 1 - t + s \\end{cases} \\quad (t, s \\in \\mathbb{R}).\n$$\nThay vào hệ phương trình của $\\alpha$, ta được:\n$$\n\\begin{cases} 4t + 4 = 0 \\\\ 10s = 0 \\end{cases} \\iff \\begin{cases} t = -1 \\\\ s = 0 \\end{cases} \\implies M'(1, -2, 2, 2).\n$$",
        },
        {
          label: '2',
          statement: 'Tính khoảng cách từ $M$ đến phẳng $\\alpha$.',
          solution:
            "Ta có $\\overrightarrow{MM'} = (-1, -1, -1, 1)$. Khoảng cách từ $M$ đến $\\alpha$ là:\n$$\nd(M, \\alpha) = |\\overrightarrow{MM'}| = \\sqrt{(-1)^2 + (-1)^2 + (-1)^2 + 1^2} = 2.\n$$",
        },
      ],
    },
    {
      id: 'hhave-2025-2026-hk1-b3',
      number: 3,
      points: 3.0,
      labelPrefix: 'Bài',
      sheetHeading: 'Bài 3 (3.0 điểm). *(Đề gốc ghi Bài 1)*',
      inlineSheetHeading: false,
      solutionRubric:
        "Lập bao afin A = af(N), A' = af(N'): 1.0 điểm · Chứng minh chéo nhau hoàn toàn: 2.0 điểm.",
      statement:
        "Trong không gian afin $A^n$, cho tập hợp $M = \\{A_0, A_1, \\dots, A_m\\}$ gồm $m + 1$ điểm độc lập. Gọi $N$ và $N'$ là hai tập con khác rỗng và không giao nhau của $M$. Chứng minh rằng có hai cái phẳng $A$ và $A'$ chéo nhau hoàn toàn lần lượt chứa $N$ và $N'$.",
      hint: "Chọn $A = \\text{af}(N)$ và $A' = \\text{af}(N')$. Từ giả thiết $M$ độc lập afin, kiểm tra $\\vec{A} \\cap \\vec{A'} = \\{\\vec{0}\\}$ và $\\overrightarrow{P_0 Q_0} \\notin \\vec{A} + \\vec{A'}$.",
      solution:
        "Giả sử $N = \\{P_0, \\dots, P_k\\}$ và $N' = \\{Q_0, \\dots, Q_l\\}$ với $N \\cap N' = \\emptyset$. Vì $N \\cup N' \\subseteq M$ và $M$ độc lập afin nên hệ điểm $\\{P_0, \\dots, P_k, Q_0, \\dots, Q_l\\}$ độc lập afin.\n\nĐặt $A = \\text{af}(N)$ và $A' = \\text{af}(N')$, suy ra $N \\subseteq A, N' \\subseteq A'$.\n\nDo hệ điểm độc lập afin nên hệ vectơ:\n$$\nS = \\{\\overrightarrow{P_0 P_1}, \\dots, \\overrightarrow{P_0 P_k}, \\overrightarrow{Q_0 Q_1}, \\dots, \\overrightarrow{Q_0 Q_l}, \\overrightarrow{P_0 Q_0}\\}\n$$\nđộc lập tuyến tính.\n\nSuy ra $\\vec{A} \\cap \\vec{A'} = \\{\\vec{0}\\}$ và $\\overrightarrow{P_0 Q_0} \\notin \\vec{A} + \\vec{A'} \\implies A \\cap A' = \\emptyset$. Vậy $A$ và $A'$ chéo nhau hoàn toàn.",
    },
  ],
};

export const MATH1302_MOCK_EXAM_1: ExamPaper = {
  id: 'hhave-mock-01',
  year: 'Đề ôn tập tự biên soạn',
  semester: 'Đề ôn tập số 1',
  allowedMaterials: 'Được dùng máy tính cầm tay',
  durationMinutes: 90,
  questionPrefix: 'Bài',
  title: 'Đề ôn tập số 1 — Hình học Affine và Euclid',
  description:
    'Đề biên soạn mô phỏng cấu trúc cố định 3 bài (3.0đ – 4.0đ – 3.0đ): tìm tâm và tiếp diện siêu mặt bậc hai trong A³, hình chiếu, đối xứng, khoảng cách trong E⁴ và cặp phẳng song song trong Aⁿ.',
  isMockExam: true,
  mockBannerLabel: 'ĐỀ BIÊN SOẠN ÔN TẬP (MÔ PHỎNG CẤU TRÚC ĐỀ CHÍNH THỨC)',
  sheetHeader: {
    leftLines: [
      'TÀI LIỆU ÔN TẬP NỘI BỘ',
      'HỌC PHẦN: HÌNH HỌC AFFINE VÀ EUCLID',
      'Đề biên soạn số 1',
      '(Gồm có 01 trang)',
    ],
    rightTitle: 'ĐỀ ÔN TẬP MÔ PHỎNG THI KẾT THÚC HỌC PHẦN',
    rightSubtitle: 'HÌNH HỌC AFFINE VÀ HÌNH HỌC EUCLID',
    metaRows: [
      'Cấu trúc mô phỏng: 3 bài (3.0đ – 4.0đ – 3.0đ)',
      'Năm học: 2025-2026 — Học kỳ: 1',
      'Thời gian làm bài gợi ý: 90 phút',
    ],
  },
  endMarker: '---HẾT---',
  sheetNotesHeading: 'Chú ý:',
  sheetNotes: MATH1302_SHEET_NOTES,
  problems: [
    {
      id: 'hhave-mock-01-b1',
      number: 1,
      points: 3.0,
      labelPrefix: 'Bài',
      sheetHeading: 'Bài 1 (3.0 điểm).',
      inlineSheetHeading: true,
      partDelimiter: ')',
      solutionRubric: 'Ý 1: 1.5 điểm · Ý 2: 1.5 điểm.',
      statement:
        'Trong $A^3$, cho siêu mặt bậc hai $(S): x^2 + 2y^2 - z^2 - 2xy + 4xz - 2x + 6y - 8z + 5 = 0$.',
      parts: [
        {
          label: '1',
          statement: 'Tìm tọa độ tâm của $(S)$.',
          solution:
            "Ta có các đa thức đạo hàm riêng chia đôi:\n$$\nF'_1 = x - y + 2z - 1, \\quad F'_2 = -x + 2y + 3, \\quad F'_3 = 2x - z - 4, \\quad F'_0 = -x + 3y - 4z + 5.\n$$\nGiải hệ $F'_1 = F'_2 = F'_3 = 0$, ta thu được tọa độ tâm của $(S)$:\n$$\nI\\left(\\frac{5}{3}, -\\frac{2}{3}, -\\frac{2}{3}\\right).\n$$",
        },
        {
          label: '2',
          statement: 'Viết phương trình siêu phẳng tiếp diện của $(S)$ tại $P(1, -1, 1) \\in (S)$.',
          solution:
            "Tại $P(1, -1, 1)$, ta tính được:\n$$\nF'_1(P) = 3, \\quad F'_2(P) = 0, \\quad F'_3(P) = -3, \\quad F'_0(P) = -3.\n$$\nSuy ra phương trình siêu phẳng tiếp diện là:\n$$\n3x - 3z - 3 = 0 \\iff x - z - 1 = 0.\n$$",
        },
      ],
    },
    {
      id: 'hhave-mock-01-b2',
      number: 2,
      points: 4.0,
      labelPrefix: 'Bài',
      sheetHeading: 'Bài 2 (4.0 điểm).',
      inlineSheetHeading: true,
      partDelimiter: ')',
      solutionRubric: "Ý 1: 2.5 điểm (tìm đúng M' 1.5đ, M'' 1.0đ) · Ý 2: 1.5 điểm.",
      statement:
        'Trong $E^4$ với mục tiêu trực chuẩn, cho $M(1, 2, -1, 3)$ và phẳng $\\alpha$:\n$$\n\\begin{cases} x_1 - x_2 + x_3 + x_4 - 2 = 0 \\\\ x_1 + x_2 - x_3 + x_4 - 4 = 0 \\end{cases}\n$$',
      parts: [
        {
          label: '1',
          statement: "Tìm hình chiếu vuông góc $M'$ và điểm đối xứng $M''$ của $M$ qua $\\alpha$.",
          solution:
            "Hai vectơ pháp tuyến là $\\vec{n}_1 = (1, -1, 1, 1)$ và $\\vec{n}_2 = (1, 1, -1, 1)$. Tham số hóa phẳng bù trực giao $\\beta$ qua $M$:\n$$\n\\begin{cases} x_1 = 1 + t + s \\\\ x_2 = 2 - t + s \\\\ x_3 = -1 + t - s \\\\ x_4 = 3 + t + s \\end{cases}\n$$\nThay vào $\\alpha$ được $4t - 1 = 0 \\implies t = \\frac{1}{4}$ và $4s + 3 = 0 \\implies s = -\\frac{3}{4}$.\n\nSuy ra:\n$$\nM'\\left(\\frac{1}{2}, 1, 0, \\frac{5}{2}\\right), \\quad M''(0, 0, 1, 2).\n$$",
        },
        {
          label: '2',
          statement: 'Tính khoảng cách $d(M, \\alpha)$.',
          solution:
            "Ta có $\\overrightarrow{MM'} = \\left(-\\frac{1}{2}, -1, 1, -\\frac{1}{2}\\right)$, suy ra:\n$$\nd(M, \\alpha) = |\\overrightarrow{MM'}| = \\frac{\\sqrt{10}}{2}.\n$$",
        },
      ],
    },
    {
      id: 'hhave-mock-01-b3',
      number: 3,
      points: 3.0,
      labelPrefix: 'Bài',
      sheetHeading: 'Bài 3 (3.0 điểm).',
      inlineSheetHeading: true,
      solutionRubric: 'Chứng minh tồn tại: 1.5 điểm · Chứng minh duy nhất: 1.5 điểm.',
      statement:
        "Trong $A^n$, cho hai phẳng $P, Q$ chéo nhau. Chứng minh tồn tại duy nhất cặp phẳng $(P', Q')$ sao cho $P \\subseteq P', Q \\subseteq Q'$, $\\dim P' = \\dim Q' = \\dim P + \\dim Q$ và $P' \\parallel Q'$.",
      solution:
        "Vì $P, Q$ chéo nhau nên $P \\cap Q = \\emptyset$ và $\\vec{P} \\cap \\vec{Q} = \\{\\vec{0}\\}$. Chọn $P'$ qua $A \\in P$ và $Q'$ qua $B \\in Q$ cùng có phương:\n$$\n\\vec{W} = \\vec{P} \\oplus \\vec{Q}.\n$$\nKhi đó $\\dim P' = \\dim Q' = \\dim P + \\dim Q$, $P' \\cap Q' = \\emptyset$ nên $P' \\parallel Q'$.\n\nTính duy nhất suy trực tiếp từ việc mọi phẳng chứa $P$ và song song với phẳng chứa $Q$ có số chiều $\\dim P + \\dim Q$ đều buộc phải nhận $\\vec{P} \\oplus \\vec{Q}$ làm phương.",
    },
  ],
};

export const MATH1302_MOCK_EXAM_2: ExamPaper = {
  id: 'hhave-mock-02',
  year: 'Đề ôn tập tự biên soạn',
  semester: 'Đề ôn tập số 2',
  allowedMaterials: 'Được dùng máy tính cầm tay',
  durationMinutes: 90,
  questionPrefix: 'Bài',
  title: 'Đề ôn tập số 2 — Hình học Affine và Euclid',
  description:
    'Đề biên soạn mở rộng theo ma trận 3 bài (3.0đ – 4.0đ – 3.0đ): kính liên hợp siêu mặt bậc hai trong A³, hình chiếu vuông góc và khoảng cách trong E⁴, và tính chéo nhau từ hai phẳng chéo nhau hoàn toàn trong Aⁿ.',
  isMockExam: true,
  mockBannerLabel: 'ĐỀ BIÊN SOẠN ÔN TẬP (MÔ PHỎNG CẤU TRÚC ĐỀ CHÍNH THỨC)',
  sheetHeader: {
    leftLines: [
      'TÀI LIỆU ÔN TẬP NỘI BỘ',
      'HỌC PHẦN: HÌNH HỌC AFFINE VÀ EUCLID',
      'Đề biên soạn số 2',
      '(Gồm có 01 trang)',
    ],
    rightTitle: 'ĐỀ ÔN TẬP MÔ PHỎNG THI KẾT THÚC HỌC PHẦN',
    rightSubtitle: 'HÌNH HỌC AFFINE VÀ HÌNH HỌC EUCLID',
    metaRows: [
      'Cấu trúc mô phỏng: 3 bài (3.0đ – 4.0đ – 3.0đ)',
      'Năm học: 2025-2026 — Học kỳ: 1',
      'Thời gian làm bài gợi ý: 90 phút',
    ],
  },
  endMarker: '---HẾT---',
  sheetNotesHeading: 'Chú ý:',
  sheetNotes: MATH1302_SHEET_NOTES,
  problems: [
    {
      id: 'hhave-mock-02-b1',
      number: 1,
      points: 3.0,
      labelPrefix: 'Bài',
      sheetHeading: 'Bài 1 (3.0 điểm).',
      inlineSheetHeading: true,
      solutionRubric:
        'Tính đúng các đạo hàm riêng chia đôi: 1.5 điểm · Viết đúng phương trình siêu phẳng kính: 1.5 điểm.',
      statement:
        'Trong không gian afin $A^3$, cho siêu mặt bậc hai $(S)$ có phương trình đối với mục tiêu cho trước là\n$$\n2x^2 + y^2 - z^2 + 2xy - 2xz + 4yz - 4x + 2y + 6z - 5 = 0.\n$$\nViết phương trình siêu phẳng kính liên hợp với phương $\\vec{c} = (1, -1, 2)$.',
      solution:
        "Đặt $F(x, y, z)$ là vế trái phương trình. Các đa thức đạo hàm riêng chia đôi lần lượt là:\n$$\nF'_1 = 2x + y - z - 2, \\quad F'_2 = x + y + 2z + 1, \\quad F'_3 = -x + 2y - z + 3.\n$$\nKiểm tra với $\\vec{c} = (1, -1, 2)$, ta có phương trình siêu phẳng kính liên hợp:\n$$\n1 \\cdot F'_1 - 1 \\cdot F'_2 + 2 \\cdot F'_3 = 0 \\iff (2x + y - z - 2) - (x + y + 2z + 1) + 2(-x + 2y - z + 3) = 0\n$$\n$$\n\\iff -x + 4y - 5z + 3 = 0 \\iff x - 4y + 5z - 3 = 0.\n$$",
    },
    {
      id: 'hhave-mock-02-b2',
      number: 2,
      points: 4.0,
      labelPrefix: 'Bài',
      sheetHeading: 'Bài 2 (4.0 điểm).',
      inlineSheetHeading: true,
      partDelimiter: ')',
      solutionRubric: 'Ý 1: 2.5 điểm · Ý 2: 1.5 điểm.',
      statement:
        'Trong không gian Euclid $E^4$ với mục tiêu trực chuẩn cho trước, cho điểm $M(1, 0, 2, -1)$ và phẳng $\\alpha$ có phương trình tổng quát là:\n$$\n\\begin{cases} x_1 + x_2 - x_3 + x_4 - 2 = 0 \\\\ x_1 - x_2 + x_3 + x_4 + 2 = 0 \\end{cases}\n$$',
      parts: [
        {
          label: '1',
          statement: "Tìm tọa độ hình chiếu vuông góc $M'$ của $M$ trên $\\alpha$.",
          solution:
            "Hai vectơ pháp tuyến $\\vec{n}_1 = (1, 1, -1, 1)$ và $\\vec{n}_2 = (1, -1, 1, 1)$ lập thành cơ sở của $\\vec{\\alpha}^\\perp$. Phẳng bù trực giao $\\beta$ đi qua $M(1, 0, 2, -1)$ có phương trình tham số:\n$$\n\\begin{cases} x_1 = 1 + t + s \\\\ x_2 = t - s \\\\ x_3 = 2 - t + s \\\\ x_4 = -1 + t + s \\end{cases} \\quad (t, s \\in \\mathbb{R}).\n$$\nThay vào hệ phương trình của $\\alpha$, ta thu được:\n$$\n\\begin{cases} 4t - 4 = 0 \\\\ 4s + 4 = 0 \\end{cases} \\iff \\begin{cases} t = 1 \\\\ s = -1 \\end{cases} \\implies M'(1, 2, 0, -1).\n$$",
        },
        {
          label: '2',
          statement: 'Tính khoảng cách từ $M$ đến phẳng $\\alpha$.',
          solution:
            "Ta có $\\overrightarrow{MM'} = (0, 2, -2, 0)$. Khoảng cách từ $M$ đến phẳng $\\alpha$ là:\n$$\nd(M, \\alpha) = |\\overrightarrow{MM'}| = \\sqrt{0^2 + 2^2 + (-2)^2 + 0^2} = 2\\sqrt{2}.\n$$",
        },
      ],
    },
    {
      id: 'hhave-mock-02-b3',
      number: 3,
      points: 3.0,
      labelPrefix: 'Bài',
      sheetHeading: 'Bài 3 (3.0 điểm).',
      inlineSheetHeading: true,
      solutionRubric:
        'Thiết lập vectơ và điều kiện chéo nhau hoàn toàn: 1.5 điểm · Chứng minh độc lập tuyến tính suy ra hai đường thẳng chéo nhau: 1.5 điểm.',
      statement:
        'Trong không gian afin $A^n$, cho hai cái phẳng $P$ và $Q$ chéo nhau hoàn toàn, mỗi phẳng có số chiều lớn hơn hoặc bằng $1$. Trên $P$ lấy hai điểm phân biệt $A_1, A_2$, trên $Q$ lấy hai điểm phân biệt $B_1, B_2$. Chứng minh rằng hai đường thẳng $A_1 B_1$ và $A_2 B_2$ chéo nhau.',
      solution:
        'Đặt $\\vec{u} = \\overrightarrow{A_1 A_2} \\in \\vec{P} \\setminus \\{\\vec{0}\\}$, $\\vec{v} = \\overrightarrow{B_1 B_2} \\in \\vec{Q} \\setminus \\{\\vec{0}\\}$ và $\\vec{w} = \\overrightarrow{A_1 B_1}$. Khi đó $\\overrightarrow{A_2 B_2} = -\\vec{u} + \\vec{w} + \\vec{v}$.\n\nVì $P$ và $Q$ chéo nhau hoàn toàn nên $\\vec{P} \\cap \\vec{Q} = \\{\\vec{0}\\}$ và $\\vec{w} = \\overrightarrow{A_1 B_1} \\notin \\vec{P} + \\vec{Q}$.\n\nXét tổ hợp tuyến tính $\\lambda \\overrightarrow{A_1 B_1} + \\mu \\overrightarrow{A_2 B_2} + \\nu \\overrightarrow{A_1 A_2} = \\vec{0}$, ta viết lại:\n$$\n(\\lambda + \\mu)\\vec{w} = -(\\nu - \\mu)\\vec{u} - \\mu\\vec{v} \\in \\vec{P} + \\vec{Q}.\n$$\nDo $\\vec{w} \\notin \\vec{P} + \\vec{Q}$ nên $\\lambda + \\mu = 0$. Khi đó $(\\nu - \\mu)\\vec{u} = -\\mu\\vec{v} \\in \\vec{P} \\cap \\vec{Q} = \\{\\vec{0}\\}$. Vì $\\vec{u} \\neq \\vec{0}$ và $\\vec{v} \\neq \\vec{0}$, suy ra $\\mu = 0$, kéo theo $\\lambda = 0$ và $\\nu = 0$.\n\nVậy hệ vectơ $\\{\\overrightarrow{A_1 B_1}, \\overrightarrow{A_2 B_2}, \\overrightarrow{A_1 A_2}\\}$ độc lập tuyến tính, nghĩa là bốn điểm $A_1, A_2, B_1, B_2$ độc lập afin. Do đó hai đường thẳng $A_1 B_1$ và $A_2 B_2$ chéo nhau.',
    },
  ],
};

export const MATH1302_EXAM_BANK: CourseExamBank = {
  subjectSlug: 'hinh-hoc-affine',
  courseCode: 'MATH1302',
  examCourseCode: '2512MATH18221',
  courseTitle: 'Hình học Affine và Hình học Euclid',
  subtitle: 'Đề thi chính thức HK1 (2025 - 2026), cấu trúc cố định 3 bài và bộ đề biên soạn ôn tập',
  officialExams: [MATH1302_OFFICIAL_HK1_PAPER],
  matrixAnalysis: {
    headline: 'Phân tích cấu trúc & Chiến lược ôn tập Hình học Affine và Euclid',
    summary:
      'Đề thi 2512MATH18221 tuân theo cấu trúc cố định 3 bài (3.0đ – 4.0đ – 3.0đ) trong 90 phút, kiểm tra cân bằng giữa hình học giải tích trên $A^3$, tính toán trực chuẩn trong $E^4$ và lập luận tiên đề đại cương trên $A^n$.',
    structureSummary:
      'Cấu trúc cố định 3 bài: 3.0đ – 4.0đ – 3.0đ · 90 phút · Được dùng máy tính cầm tay',
    distribution: [
      {
        id: 'hhave-b1-30',
        label: 'Bài 1: Siêu mặt bậc hai trong A³',
        percentage: 30,
        pointsSummary: '3.0 điểm',
        description:
          'Tìm tâm, siêu phẳng kính liên hợp phương $\\vec{c}$, phương tiệm cận và siêu phẳng tiếp diện.',
        tone: 'primary',
      },
      {
        id: 'hhave-b2-40',
        label: 'Bài 2: Hình học Euclid E⁴ trực chuẩn',
        percentage: 40,
        pointsSummary: '4.0 điểm',
        description:
          "Tìm hình chiếu vuông góc $M'$, điểm đối xứng $M''$, khoảng cách từ điểm đến $2$-phẳng bằng phẳng bù trực giao $\\beta$.",
        tone: 'secondary',
      },
      {
        id: 'hhave-b3-30',
        label: 'Bài 3: Chứng minh đại cương Aⁿ',
        percentage: 30,
        pointsSummary: '3.0 điểm',
        description:
          'Hệ điểm độc lập afin, bao afin $\\operatorname{af}(N)$, vị trí tương đối giữa hai phẳng (chéo nhau, chéo nhau hoàn toàn, song song).',
        tone: 'accent',
      },
    ],
    specificationRows: [
      {
        id: 'hhave-spec-b1',
        itemLabel: 'Bài 1',
        points: '3.0 điểm (30%)',
        topic: 'Siêu mặt bậc hai trong $A^3$',
        coreSkills:
          "Lập đa thức đạo hàm riêng chia đôi $F'_1, F'_2, F'_3, F'_0$; tìm tâm, viết siêu phẳng kính liên hợp phương $\\vec{c}$, phương tiệm cận và tiếp diện.",
        examStrategy:
          "Kiểm tra kỹ hệ số chia đôi của các số hạng chéo $xy, xz, yz$ và $x, y, z$ trước khi nhân tổ hợp $c_1 F'_1 + c_2 F'_2 + c_3 F'_3 = 0$.",
      },
      {
        id: 'hhave-spec-b2',
        itemLabel: 'Bài 2',
        points: '4.0 điểm (40%)',
        topic: 'Hình học Euclid $E^4$ trực chuẩn',
        coreSkills:
          "Tìm hình chiếu vuông góc $M'$, điểm đối xứng $M''$ qua $2$-phẳng $\\alpha$ và tính khoảng cách $d(M, \\alpha)$ trong mục tiêu trực chuẩn.",
        examStrategy:
          'Dùng phương pháp tham số hóa phẳng bù trực giao $\\beta = M + \\operatorname{span}\\{\\vec{n}_1, \\vec{n}_2\\}$; thay vào hệ của $\\alpha$ để giải $t, s$ cực nhanh.',
      },
      {
        id: 'hhave-spec-b3',
        itemLabel: 'Bài 3',
        points: '3.0 điểm (30%)',
        topic: 'Chứng minh đại cương trong $A^n$',
        coreSkills:
          'Vận dụng định nghĩa hệ điểm độc lập afin, bao afin $\\text{af}(N)$ và tiêu chuẩn hai phẳng chéo nhau / chéo nhau hoàn toàn / song song.',
        examStrategy:
          "Chuyển điều kiện hình học của phẳng về phương vectơ $\\vec{A}, \\vec{A'}$ và vectơ nối gốc $\\overrightarrow{P_0 Q_0}$ để dùng độc lập tuyến tính.",
      },
    ],
    focusChecklists: [
      {
        id: 'hhave-check-b1',
        title: 'Trọng tâm Bài 1 (3.0đ) — Siêu mặt bậc hai trong A³',
        badge: 'Bài 1 · A³',
        items: [
          {
            id: 'hhave-item-center-diameter',
            title: 'Tâm, kính liên hợp, phương tiệm cận & tiếp diện',
            summary:
              "Thành thạo bộ công thức đạo hàm riêng chia đôi $F'_1, F'_2, F'_3, F'_0$: tìm tâm giải hệ $F'_i = 0$; kính liên hợp phương $\\vec{c}$ là $\\sum c_i F'_i = 0$; tiếp diện tại $P \\in (S)$ là $\\sum F'_i(P) x_i + F'_0(P) = 0$.",
            keyFormulas: [
              "c_1 F'_1 + c_2 F'_2 + c_3 F'_3 = 0",
              "F'_1(P)x + F'_2(P)y + F'_3(P)z + F'_0(P) = 0",
            ],
          },
        ],
      },
      {
        id: 'hhave-check-b2',
        title: 'Trọng tâm Bài 2 (4.0đ) — Hình học Euclid E⁴ trực chuẩn',
        badge: 'Bài 2 · E⁴',
        items: [
          {
            id: 'hhave-item-ortho-proj',
            title: 'Tham số hóa phẳng bù trực giao β tìm M′, M′′ và d(M, α)',
            summary:
              "Từ $2$ phương trình của $\\alpha$, đọc ngay cơ sở trực giao $\\vec{n}_1, \\vec{n}_2 \\in \\vec{\\alpha}^\\perp$, viết tham số $\\beta$ đi qua $M$, giải giao điểm $M' = \\beta \\cap \\alpha$, suy ra $M'' = 2M' - M$ và $d(M, \\alpha) = |\\overrightarrow{MM'}|$.",
            keyFormulas: [
              'X = M + t\\vec{n}_1 + s\\vec{n}_2',
              "M'' = 2M' - M, \\quad d(M, \\alpha) = |\\overrightarrow{MM'}|",
            ],
          },
        ],
      },
      {
        id: 'hhave-check-b3',
        title: 'Trọng tâm Bài 3 (3.0đ) — Chứng minh đại cương Aⁿ',
        badge: 'Bài 3 · Aⁿ',
        items: [
          {
            id: 'hhave-item-affine-positions',
            title: 'Độc lập afin, bao afin và vị trí tương đối giữa hai phẳng',
            summary:
              "Nắm chắc tương đương giữa độc lập afin của $\\{P_0, \\dots, P_k\\}$ và độc lập tuyến tính của $\\{\\overrightarrow{P_0 P_i}\\}$, cùng các tiêu chuẩn chéo nhau ($A \\cap A' = \\emptyset, \\vec{A} \\cap \\vec{A'} = \\{\\vec{0}\\}$), chéo nhau hoàn toàn và song song.",
            keyFormulas: [
              "\\vec{A} \\cap \\vec{A'} = \\{\\vec{0}\\}, \\quad \\overrightarrow{P_0 Q_0} \\notin \\vec{A} + \\vec{A'}",
              "\\dim P' = \\dim Q' = \\dim P + \\dim Q",
            ],
          },
        ],
      },
    ],
  },
  mockExams: [MATH1302_MOCK_EXAM_1, MATH1302_MOCK_EXAM_2],
};
