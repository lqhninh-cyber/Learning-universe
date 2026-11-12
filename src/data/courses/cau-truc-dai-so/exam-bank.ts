import type { CourseExamBank, ExamPaper } from '../exam-bank-types';

const MATH1301_SHEET_NOTES = [
  'Thí sinh KHÔNG được sử dụng tài liệu.',
  'Cán bộ coi thi không giải thích gì thêm.',
] as const;

export const MATH1301_OFFICIAL_HK2_PAPER: ExamPaper = {
  id: 'ctds-official-2025-2026-hk2',
  year: '2025 - 2026',
  semester: 'Học kỳ II',
  examCourseCode: '2522MATH170401',
  allowedMaterials: 'Không dùng tài liệu',
  durationMinutes: 90,
  questionPrefix: 'Câu',
  title: 'Đề thi Chính thức HK2 (2025 - 2026) — Cấu trúc Đại số',
  description:
    'Mã học phần đề thi: 2522MATH170401 · Thời gian làm bài: 90 phút (Không dùng tài liệu). Gồm 3 câu hỏi tự luận (3.0đ – 3.0đ – 4.0đ).',
  sheetHeader: {
    leftLines: [
      'TRƯỜNG ĐH SƯ PHẠM TPHCM',
      'KHOA TOÁN - TIN HỌC',
      'Đề chính thức',
      '(Đề thi gồm có 1 trang)',
    ],
    rightTitle: 'ĐỀ THI KẾT THỨC HỌC PHẦN',
    rightSubtitle: 'Tên HP: ĐẠI SỐ',
    metaRows: [
      'Mã LHP: 2522MATH170401 — Số tín chỉ: 3',
      'Học kỳ: 2 — Năm học: 2025 - 2026',
      'Thời gian: 90 phút (không kể thời gian phát đề)',
    ],
  },
  endMarker: '— HẾT —',
  sheetNotesHeading: 'Ghi chú:',
  sheetNotes: MATH1301_SHEET_NOTES,
  problems: [
    {
      id: 'ctds-2025-2026-hk2-c1',
      number: 1,
      points: 3.0,
      labelPrefix: 'Câu',
      sheetHeading: 'Câu 1. (3 điểm)',
      partDelimiter: ')',
      solutionRubric: 'Ý a: 1.0 điểm · Ý b: 1.0 điểm · Ý c: 1.0 điểm.',
      parts: [
        {
          label: 'a',
          statement: 'Tìm một nhóm con của nhóm đối xứng $S_3$ có chứa đúng $2$ phần tử.',
          solution:
            'Xét chuyển trí $\\tau = (1\\ 2) \\in S_3$. Vì $\\tau^2 = id$ và $\\tau^{-1} = (1\\ 2)$, tập hợp:\n$$\nH_1 = \\langle (1\\ 2) \\rangle = \\{id, (1\\ 2)\\}\n$$\nlà một nhóm con của $S_3$ chứa đúng $2$ phần tử (có thể chọn $\\{id, (1\\ 3)\\}$ hoặc $\\{id, (2\\ 3)\\}$).',
        },
        {
          label: 'b',
          statement: 'Tìm một nhóm con của nhóm đối xứng $S_3$ có chứa đúng $3$ phần tử.',
          solution:
            'Xét xích độ dài $3$ là $\\sigma = (1\\ 2\\ 3) \\in S_3$. Ta có $\\sigma^2 = (1\\ 3\\ 2)$ và $\\sigma^3 = id$. Nhóm thay phiên:\n$$\nA_3 = \\langle (1\\ 2\\ 3) \\rangle = \\{id, (1\\ 2\\ 3), (1\\ 3\\ 2)\\}\n$$\nlà nhóm con của $S_3$ chứa đúng $3$ phần tử.',
        },
        {
          label: 'c',
          statement:
            'Tìm tất cả các nhóm con của nhóm cộng $\\mathbb{Z}_4 = \\{0, 1, 2, 3\\}$ (với phép cộng modulo $4$).',
          solution:
            'Vì $\\mathbb{Z}_4 = \\langle 1 \\rangle$ là nhóm cyclic cấp $4$, mọi nhóm con của $\\mathbb{Z}_4$ đều là nhóm cyclic có cấp là ước của $4$ ($d \\in \\{1, 2, 4\\}$). Có đúng $3$ nhóm con:\n- **Cấp $1$:** $H_1 = \\langle 0 \\rangle = \\{0\\}$.\n- **Cấp $2$:** $H_2 = \\langle 2 \\rangle = \\{0, 2\\}$.\n- **Cấp $4$:** $H_3 = \\langle 1 \\rangle = \\mathbb{Z}_4 = \\{0, 1, 2, 3\\}$.',
        },
      ],
    },
    {
      id: 'ctds-2025-2026-hk2-c2',
      number: 2,
      points: 3.0,
      labelPrefix: 'Câu',
      sheetHeading: 'Câu 2. (3 điểm)',
      partDelimiter: ')',
      solutionRubric: 'Ý a: 1.0 điểm · Ý b: 1.0 điểm · Ý c: 1.0 điểm.',
      parts: [
        {
          label: 'a',
          statement:
            'Cho $H$ và $K$ là hai nhóm con của nhóm $G$. Chứng minh rằng giao $H \\cap K$ cũng là một nhóm con của $G$.',
          solution:
            'Vì $H \\le G$ và $K \\le G$ nên phần tử đơn vị $e \\in H$ và $e \\in K \\implies e \\in H \\cap K \\implies H \\cap K \\neq \\emptyset$.\n\nLấy $x, y \\in H \\cap K$ bất kỳ $\\implies x, y \\in H$ và $x, y \\in K$.\n\nDo $H, K \\le G$ nên $xy^{-1} \\in H$ và $xy^{-1} \\in K \\implies xy^{-1} \\in H \\cap K$. Vậy $H \\cap K \\le G$.',
        },
        {
          label: 'b',
          statement:
            'Cho một ví dụ chỉ ra rằng hợp của hai nhóm con không nhất thiết là một nhóm con.',
          solution:
            'Xét nhóm cộng $(\\mathbb{Z}, +)$ với hai nhóm con $H = 2\\mathbb{Z}$ và $K = 3\\mathbb{Z}$.\n\nTa có $2 \\in H \\subset H \\cup K$ và $3 \\in K \\subset H \\cup K$, nhưng $2 + 3 = 5 \\notin 2\\mathbb{Z}$ và $5 \\notin 3\\mathbb{Z} \\implies 5 \\notin H \\cup K$.\n\nDo đó $H \\cup K$ không đóng kín với phép cộng nên không là nhóm con của $\\mathbb{Z}$.',
        },
        {
          label: 'c',
          statement:
            'Tìm tất cả các nhóm con của nhóm Klein $V_4 = \\{e, a, b, c\\}$, biết rằng $a^2 = b^2 = c^2 = e$ và tích của hai phần tử khác $e$ bất kỳ bằng phần tử thứ ba.',
          solution:
            'Theo định lý Lagrange, cấp của nhóm con $H \\le V_4$ là ước của $4$, nên $|H| \\in \\{1, 2, 4\\}$:\n- **Cấp $1$:** $H_0 = \\{e\\}$.\n- **Cấp $2$:** Do $a^2 = b^2 = c^2 = e$, có $3$ nhóm con cấp $2$ là $H_1 = \\{e, a\\}$, $H_2 = \\{e, b\\}$, $H_3 = \\{e, c\\}$.\n- **Cấp $4$:** Nếu $|H| > 2$ thì $H$ chứa ít nhất hai trong ba phần tử $a, b, c$. Do tích hai phần tử khác $e$ bằng phần tử thứ ba nên phần tử còn lại cũng thuộc $H \\implies H = V_4$.\n\n**Kết luận:** $V_4$ có $5$ nhóm con là $\\{e\\}, \\{e, a\\}, \\{e, b\\}, \\{e, c\\}, V_4$.',
        },
      ],
    },
    {
      id: 'ctds-2025-2026-hk2-c3',
      number: 3,
      points: 4.0,
      labelPrefix: 'Câu',
      sheetHeading: 'Câu 3. (4 điểm)',
      partDelimiter: ')',
      solutionRubric: 'Ý a: 3.0 điểm (mỗi chiều 1.5 điểm) · Ý b: 1.0 điểm.',
      parts: [
        {
          label: 'a',
          statement:
            'Cho $H, K$ là hai nhóm con của nhóm $G$. Ký hiệu $HK = \\{hk \\mid h \\in H, k \\in K\\}$. Chứng minh rằng $HK$ là một nhóm con của $G$ khi và chỉ khi $HK = KH$.',
          solution:
            '- **Chiều ($\\Rightarrow$):** Giả sử $HK \\le G$. Lấy $x = kh \\in KH \\implies x^{-1} = h^{-1}k^{-1} \\in HK$. Vì $HK \\le G$ nên $x = (x^{-1})^{-1} \\in HK \\implies KH \\subseteq HK$. Ngược lại, với mọi $y \\in HK$, vì $HK \\le G$ nên $y^{-1} \\in HK \\implies y^{-1} = h_1 k_1 \\implies y = k_1^{-1}h_1^{-1} \\in KH \\implies HK \\subseteq KH$. Vậy $HK = KH$.\n- **Chiều ($\\Leftarrow$):** Giả sử $HK = KH$. Ta có $e = e \\cdot e \\in HK \\implies HK \\neq \\emptyset$. Lấy $x = h_1 k_1, y = h_2 k_2 \\in HK$. Khi đó:\n$$\nxy^{-1} = h_1 (k_1 k_2^{-1}) h_2^{-1}.\n$$\nVì $(k_1 k_2^{-1}) h_2^{-1} \\in KH = HK$, tồn tại $h_3 \\in H, k_3 \\in K$ sao cho $(k_1 k_2^{-1}) h_2^{-1} = h_3 k_3 \\implies xy^{-1} = (h_1 h_3)k_3 \\in HK$. Vậy $HK \\le G$.',
        },
        {
          label: 'b',
          statement: 'Tìm một nhóm con cấp $4$ của nhóm đối xứng $S_4$.',
          solution:
            'Chọn xích độ dài $4$ là $\\sigma = (1\\ 2\\ 3\\ 4) \\in S_4$. Nhóm con cyclic sinh bởi $\\sigma$ có cấp $4$:\n$$\nH = \\langle (1\\ 2\\ 3\\ 4) \\rangle = \\{id, (1\\ 2\\ 3\\ 4), (1\\ 3)(2\\ 4), (1\\ 4\\ 3\\ 2)\\}\n$$\n*(Hoặc chọn nhóm Klein $V_4 = \\{id, (1\\ 2)(3\\ 4), (1\\ 3)(2\\ 4), (1\\ 4)(2\\ 3)\\}$).*',
        },
      ],
    },
  ],
};

export const MATH1301_MOCK_EXAM_1: ExamPaper = {
  id: 'ctds-mock-01',
  year: 'Đề ôn tập tự biên soạn',
  semester: 'Đề ôn tập số 1',
  allowedMaterials: 'Không dùng tài liệu',
  durationMinutes: 90,
  questionPrefix: 'Câu',
  title: 'Đề ôn tập số 1 — Cấu trúc Đại số',
  description:
    'Đề biên soạn mô phỏng cấu trúc 90 phút (3.0đ – 3.0đ – 4.0đ): phép thế S₄, nhóm cyclic ℤ₆, nhóm nhân U(10), tâm nhóm Z(G) và đồng cấu nhóm.',
  isMockExam: true,
  mockBannerLabel: 'ĐỀ BIÊN SOẠN ÔN TẬP (MÔ PHỎNG CẤU TRÚC ĐỀ CHÍNH THỨC)',
  sheetHeader: {
    leftLines: [
      'TÀI LIỆU ÔN TẬP NỘI BỘ',
      'HỌC PHẦN: CẤU TRÚC ĐẠI SỐ',
      'Đề biên soạn số 1',
      '(Gồm có 1 trang)',
    ],
    rightTitle: 'ĐỀ ÔN TẬP MÔ PHỎNG THI KẾT THÚC HỌC PHẦN',
    rightSubtitle: 'Tên HP: ĐẠI SỐ',
    metaRows: [
      'Cấu trúc mô phỏng: 3 câu (3đ – 3đ – 4đ)',
      'Học kỳ II — Năm học 2025 - 2026',
      'Thời gian làm bài gợi ý: 90 phút (Không dùng tài liệu)',
    ],
  },
  endMarker: '— HẾT —',
  sheetNotesHeading: 'Ghi chú:',
  sheetNotes: MATH1301_SHEET_NOTES,
  problems: [
    {
      id: 'ctds-mock-01-c1',
      number: 1,
      points: 3.0,
      labelPrefix: 'Câu',
      sheetHeading: 'Câu 1. (3 điểm)',
      partDelimiter: ')',
      solutionRubric: 'Ý a: 1.0 điểm · Ý b: 1.0 điểm · Ý c: 1.0 điểm.',
      parts: [
        {
          label: 'a',
          statement:
            'Trong $S_4$, cho $\\sigma = \\begin{pmatrix} 1 & 2 & 3 & 4 \\\\ 3 & 4 & 2 & 1 \\end{pmatrix}$. Phân tích $\\sigma$ thành tích các xích độc lập, xét tính chẵn lẻ và tìm cấp của $\\sigma$.',
          solution:
            'Ta có $\\sigma = (1\\ 3\\ 2\\ 4)$, độ dài $4 \\implies \\text{ord}(\\sigma) = 4$.\n\nVì $\\sigma = (1\\ 4)(1\\ 2)(1\\ 3)$ (tích của $3$ chuyển trí) nên $\\sigma$ là phép thế lẻ ($\\text{sgn}(\\sigma) = -1$).',
        },
        {
          label: 'b',
          statement:
            'Tìm tất cả các nhóm con của nhóm cộng $\\mathbb{Z}_6 = \\{0, 1, 2, 3, 4, 5\\}$.',
          solution:
            'Các ước dương của $6$ là $1, 2, 3, 6$. Có đúng $4$ nhóm con:\n- Cấp $1$: $\\langle 0 \\rangle = \\{0\\}$.\n- Cấp $2$: $\\langle 3 \\rangle = \\{0, 3\\}$.\n- Cấp $3$: $\\langle 2 \\rangle = \\{0, 2, 4\\}$.\n- Cấp $6$: $\\langle 1 \\rangle = \\mathbb{Z}_6 = \\{0, 1, 2, 3, 4, 5\\}$.',
        },
        {
          label: 'c',
          statement:
            'Tìm tất cả các phần tử sinh của nhóm nhân $U(10) = \\{\\overline{1}, \\overline{3}, \\overline{7}, \\overline{9}\\}$.',
          solution:
            'Kiểm tra cấp của từng phần tử trong $U(10)$: $\\text{ord}(\\overline{3}) = \\text{ord}(\\overline{7}) = 4$, $\\text{ord}(\\overline{9}) = 2$, $\\text{ord}(\\overline{1}) = 1$.\n\nVậy các phần tử sinh của $U(10)$ là $\\overline{3}$ và $\\overline{7}$.',
        },
      ],
    },
    {
      id: 'ctds-mock-01-c2',
      number: 2,
      points: 3.0,
      labelPrefix: 'Câu',
      sheetHeading: 'Câu 2. (3 điểm)',
      partDelimiter: ')',
      solutionRubric: 'Ý a: 1.0 điểm · Ý b: 1.0 điểm · Ý c: 1.0 điểm.',
      parts: [
        {
          label: 'a',
          statement:
            'Chứng minh tâm nhóm $Z(G) = \\{z \\in G \\mid zg = gz, \\forall g \\in G\\}$ là nhóm con chuẩn tắc của $G$.',
          solution:
            'Ta có $eg = ge, \\forall g \\in G$ nên $e \\in Z(G) \\neq \\emptyset$.\n\nVới $x, y \\in Z(G), g \\in G$: vì $yg = gy$ nên $y^{-1}g = gy^{-1}$, suy ra:\n$$\n(xy^{-1})g = x(y^{-1}g) = x(gy^{-1}) = (xg)y^{-1} = g(xy^{-1}) \\implies xy^{-1} \\in Z(G).\n$$\nDo đó $Z(G) \\le G$. Hơn nữa với mọi $g \\in G$ và $z \\in Z(G)$, $gzg^{-1} = zgg^{-1} = z \\in Z(G)$, nên $Z(G) \\trianglelefteq G$.',
        },
        {
          label: 'b',
          statement: 'Trong $S_3$, nhóm con $H = \\{id, (1\\ 2)\\}$ có chuẩn tắc không? Vì sao?',
          solution:
            'Không chuẩn tắc vì với $g = (1\\ 3) \\in S_3$, ta có:\n$$\ng(1\\ 2)g^{-1} = (1\\ 3)(1\\ 2)(1\\ 3) = (2\\ 3) \\notin H.\n$$',
        },
        {
          label: 'c',
          statement:
            'Chứng minh nếu nhóm $G$ thỏa $x^2 = e, \\forall x \\in G$ thì $G$ là nhóm Abel.',
          solution:
            'Mọi $z \\in G$ có $z^2 = e \\implies z = z^{-1}$. Với mọi $a, b \\in G$:\n$$\nab = (ab)^{-1} = b^{-1}a^{-1} = ba \\implies G \\text{ Abel}.\n$$',
        },
      ],
    },
    {
      id: 'ctds-mock-01-c3',
      number: 3,
      points: 4.0,
      labelPrefix: 'Câu',
      sheetHeading: 'Câu 3. (4 điểm)',
      partDelimiter: ')',
      solutionRubric: 'Ý a: 2.5 điểm · Ý b: 1.5 điểm.',
      parts: [
        {
          label: 'a',
          statement:
            "Cho đồng cấu nhóm $f: G \\to G'$. Chứng minh $\\ker f \\trianglelefteq G$ và $\\text{im } f \\le G'$.",
          solution:
            "Ta có $f(e) = e' \\implies e \\in \\ker f \\neq \\emptyset$. Với $x, y \\in \\ker f$:\n$$\nf(xy^{-1}) = f(x)f(y)^{-1} = e'(e')^{-1} = e' \\implies \\ker f \\le G.\n$$\nVới $g \\in G, u \\in \\ker f$: $f(gug^{-1}) = f(g)e'f(g)^{-1} = e' \\implies \\ker f \\trianglelefteq G$.\n\nTương tự, với $y_1 = f(x_1), y_2 = f(x_2) \\in \\text{im } f$, ta có $f(e) = e' \\in \\text{im } f$ và $f(x_1)f(x_2)^{-1} = f(x_1 x_2^{-1}) \\in \\text{im } f \\implies \\text{im } f \\le G'$.",
        },
        {
          label: 'b',
          statement: 'Tìm tất cả các nhóm con chuẩn tắc của $S_3$.',
          solution:
            '$S_3$ có đúng $3$ nhóm con chuẩn tắc:\n- $\\{id\\}$\n- $A_3 = \\{id, (1\\ 2\\ 3), (1\\ 3\\ 2)\\}$ (do $[S_3 : A_3] = 2$)\n- $S_3$\n*(Các nhóm con cấp $2$ đều không chuẩn tắc vì không bất biến qua phép liên hợp).*',
        },
      ],
    },
  ],
};

export const MATH1301_MOCK_EXAM_2: ExamPaper = {
  id: 'ctds-mock-02',
  year: 'Đề ôn tập tự biên soạn',
  semester: 'Đề ôn tập số 2',
  allowedMaterials: 'Không dùng tài liệu',
  durationMinutes: 90,
  questionPrefix: 'Câu',
  title: 'Đề ôn tập số 2 — Cấu trúc Đại số',
  description:
    'Đề biên soạn mở rộng bám sát ma trận 40/60: cấp phần tử trong S₃, nhóm con ℤ₈, tính cyclic của U(12), nhóm con có chỉ số 2 và nghịch ảnh chuẩn tắc qua đồng cấu.',
  isMockExam: true,
  mockBannerLabel: 'ĐỀ BIÊN SOẠN ÔN TẬP (MÔ PHỎNG CẤU TRÚC ĐỀ CHÍNH THỨC)',
  sheetHeader: {
    leftLines: [
      'TÀI LIỆU ÔN TẬP NỘI BỘ',
      'HỌC PHẦN: CẤU TRÚC ĐẠI SỐ',
      'Đề biên soạn số 2',
      '(Gồm có 1 trang)',
    ],
    rightTitle: 'ĐỀ ÔN TẬP MÔ PHỎNG THI KẾT THÚC HỌC PHẦN',
    rightSubtitle: 'Tên HP: ĐẠI SỐ',
    metaRows: [
      'Cấu trúc mô phỏng: 3 câu (3đ – 3đ – 4đ)',
      'Học kỳ II — Năm học 2025 - 2026',
      'Thời gian làm bài gợi ý: 90 phút (Không dùng tài liệu)',
    ],
  },
  endMarker: '— HẾT —',
  sheetNotesHeading: 'Ghi chú:',
  sheetNotes: MATH1301_SHEET_NOTES,
  problems: [
    {
      id: 'ctds-mock-02-c1',
      number: 1,
      points: 3.0,
      labelPrefix: 'Câu',
      sheetHeading: 'Câu 1. (3 điểm)',
      partDelimiter: ')',
      solutionRubric: 'Ý a: 1.0 điểm · Ý b: 1.0 điểm · Ý c: 1.0 điểm.',
      parts: [
        {
          label: 'a',
          statement:
            'Tìm tất cả các phần tử có cấp bằng $2$ và các phần tử có cấp bằng $3$ trong nhóm đối xứng $S_3$.',
          solution:
            'Trong nhóm $S_3 = \\{id, (1\\ 2), (1\\ 3), (2\\ 3), (1\\ 2\\ 3), (1\\ 3\\ 2)\\}$:\n- **Các phần tử cấp $2$:** $(1\\ 2), (1\\ 3), (2\\ 3)$ (do mỗi chuyển trí $\\tau \\neq id$ thỏa $\\tau^2 = id$).\n- **Các phần tử cấp $3$:** $(1\\ 2\\ 3), (1\\ 3\\ 2)$ (do $(1\\ 2\\ 3)^2 = (1\\ 3\\ 2)$, $(1\\ 2\\ 3)^3 = id$ và $(1\\ 3\\ 2)^2 = (1\\ 2\\ 3)$, $(1\\ 3\\ 2)^3 = id$).',
        },
        {
          label: 'b',
          statement:
            'Liệt kê tất cả các nhóm con của nhóm cộng $\\mathbb{Z}_8 = \\{0, 1, 2, 3, 4, 5, 6, 7\\}$.',
          solution:
            'Vì $\\mathbb{Z}_8 = \\langle 1 \\rangle$ là nhóm cyclic cấp $8$, ứng với mỗi ước dương $d \\in \\{1, 2, 4, 8\\}$ có duy nhất $1$ nhóm con cấp $d$:\n- **Cấp $1$:** $H_1 = \\langle 0 \\rangle = \\{0\\}$.\n- **Cấp $2$:** $H_2 = \\langle 4 \\rangle = \\{0, 4\\}$.\n- **Cấp $4$:** $H_3 = \\langle 2 \\rangle = \\{0, 2, 4, 6\\}$.\n- **Cấp $8$:** $H_4 = \\langle 1 \\rangle = \\mathbb{Z}_8 = \\{0, 1, 2, 3, 4, 5, 6, 7\\}$.',
        },
        {
          label: 'c',
          statement:
            'Tìm cấp của phần tử $\\overline{5}$ trong nhóm nhân $U(12) = \\{\\overline{1}, \\overline{5}, \\overline{7}, \\overline{11}\\}$. Nhóm $U(12)$ có phải là nhóm cyclic hay không? Giải thích.',
          solution:
            'Ta có $\\overline{5}^2 = \\overline{25} = \\overline{1} \\implies \\operatorname{ord}(\\overline{5}) = 2$.\n\nKiểm tra các phần tử còn lại: $\\overline{7}^2 = \\overline{49} = \\overline{1}$, $\\overline{11}^2 = \\overline{121} = \\overline{1}$ và $\\operatorname{ord}(\\overline{1}) = 1$. Vì $|U(12)| = 4$ nhưng không có phần tử nào có cấp $4$ nên $U(12)$ **không phải** là nhóm cyclic.',
        },
      ],
    },
    {
      id: 'ctds-mock-02-c2',
      number: 2,
      points: 3.0,
      labelPrefix: 'Câu',
      sheetHeading: 'Câu 2. (3 điểm)',
      partDelimiter: ')',
      solutionRubric: 'Ý a: 1.0 điểm · Ý b: 1.0 điểm · Ý c: 1.0 điểm.',
      parts: [
        {
          label: 'a',
          statement:
            'Cho $H$ và $K$ là hai nhóm con chuẩn tắc của nhóm $G$. Chứng minh rằng $H \\cap K$ cũng là một nhóm con chuẩn tắc của $G$.',
          solution:
            'Vì $H, K \\le G$ nên $H \\cap K \\le G$ ($e \\in H \\cap K$ và mọi $x, y \\in H \\cap K$ có $xy^{-1} \\in H \\cap K$).\n\nVới mọi $g \\in G$ và $u \\in H \\cap K$, vì $H \\trianglelefteq G$ và $K \\trianglelefteq G$ nên $gug^{-1} \\in H$ và $gug^{-1} \\in K$, suy ra $gug^{-1} \\in H \\cap K$. Vậy $H \\cap K \\trianglelefteq G$.',
        },
        {
          label: 'b',
          statement:
            'Trong $S_3$, xét hai nhóm con $H = \\{id, (1\\ 2)\\}$ và $K = \\{id, (1\\ 3)\\}$. Chứng minh rằng tập tích $HK = \\{hk \\mid h \\in H, k \\in K\\}$ không phải là nhóm con của $S_3$.',
          solution:
            'Do $H \\cap K = \\{id\\}$ nên số phần tử của tập tích $HK$ là:\n$$\n|HK| = \\frac{|H|\\cdot|K|}{|H \\cap K|} = \\frac{2 \\cdot 2}{1} = 4.\n$$\nVì $|S_3| = 6$ và $4 \\nmid 6$, theo định lý Lagrange thì $HK$ không thể là nhóm con của $S_3$ *(hoặc trực tiếp thấy $(1\\ 2)(1\\ 3) \\neq (1\\ 3)(1\\ 2)$ nên $HK \\neq KH$)*.',
        },
        {
          label: 'c',
          statement:
            'Chứng minh rằng nếu $H$ là nhóm con có chỉ số $[G : H] = 2$ trong nhóm $G$ thì $H$ là nhóm con chuẩn tắc của $G$.',
          solution:
            'Vì $[G : H] = 2$, nhóm $G$ phân hoạch thành đúng $2$ lớp kề trái ($H$ và $G \\setminus H$) và $2$ lớp kề phải ($H$ và $G \\setminus H$).\n\nVới mọi $g \\in G$:\n- Nếu $g \\in H$ thì $gH = H = Hg$.\n- Nếu $g \\notin H$ thì $gH \\neq H$ và $Hg \\neq H$, suy ra $gH = G \\setminus H = Hg$.\n\nVậy $gH = Hg$ với mọi $g \\in G$, tức là $H \\trianglelefteq G$.',
        },
      ],
    },
    {
      id: 'ctds-mock-02-c3',
      number: 3,
      points: 4.0,
      labelPrefix: 'Câu',
      sheetHeading: 'Câu 3. (4 điểm)',
      partDelimiter: ')',
      solutionRubric: 'Ý a: 2.5 điểm · Ý b: 1.5 điểm.',
      parts: [
        {
          label: 'a',
          statement:
            "Cho đồng cấu nhóm $f: G \\to G'$ và $K'$ là một nhóm con chuẩn tắc của $G'$. Chứng minh rằng nghịch ảnh $f^{-1}(K') = \\{x \\in G \\mid f(x) \\in K'\\}$ là một nhóm con chuẩn tắc của $G$.",
          solution:
            "Ta có $f(e) = e' \\in K' \\implies e \\in f^{-1}(K') \\neq \\emptyset$. Với mọi $x, y \\in f^{-1}(K')$, vì $f(x), f(y) \\in K'$ nên:\n$$\nf(xy^{-1}) = f(x)f(y)^{-1} \\in K' \\implies xy^{-1} \\in f^{-1}(K').\n$$\nDo đó $f^{-1}(K') \\le G$. Hơn nữa, với mọi $g \\in G$ và $u \\in f^{-1}(K')$, vì $f(u) \\in K'$ và $K' \\trianglelefteq G'$ nên:\n$$\nf(gug^{-1}) = f(g)f(u)f(g)^{-1} \\in K' \\implies gug^{-1} \\in f^{-1}(K').\n$$\nVậy $f^{-1}(K') \\trianglelefteq G$.",
        },
        {
          label: 'b',
          statement:
            'Trong $S_4$, hãy chỉ ra một nhóm con cấp $4$ KHÔNG chuẩn tắc và một nhóm con cấp $4$ chuẩn tắc.',
          solution:
            '- **Nhóm con cấp $4$ không chuẩn tắc:** $H_1 = \\langle (1\\ 2\\ 3\\ 4) \\rangle = \\{id, (1\\ 2\\ 3\\ 4), (1\\ 3)(2\\ 4), (1\\ 4\\ 3\\ 2)\\}$, vì liên hợp bởi $(1\\ 2) \\in S_4$ cho $(1\\ 2)(1\\ 2\\ 3\\ 4)(1\\ 2)^{-1} = (1\\ 3\\ 4\\ 2) \\notin H_1$.\n- **Nhóm con cấp $4$ chuẩn tắc:** Nhóm bốn Klein $V_4 = \\{id, (1\\ 2)(3\\ 4), (1\\ 3)(2\\ 4), (1\\ 4)(2\\ 3)\\} \\trianglelefteq S_4$ (bất biến qua mọi phép liên hợp trong $S_4$).',
        },
      ],
    },
  ],
};

export const MATH1301_EXAM_BANK: CourseExamBank = {
  subjectSlug: 'cau-truc-dai-so',
  courseCode: 'MATH1301',
  examCourseCode: '2522MATH170401',
  courseTitle: 'Cấu trúc đại số',
  subtitle:
    'Đề thi chính thức HK2 (2025 - 2026), phân tích cấu trúc 40/60 và bộ đề biên soạn ôn tập',
  officialExams: [MATH1301_OFFICIAL_HK2_PAPER],
  matrixAnalysis: {
    headline: 'Phân tích cấu trúc & Chiến lược ôn tập Cấu trúc Đại số',
    summary:
      'Đề thi 2522MATH170401 cân bằng rõ rệt giữa 40% chứng minh định lý nền tảng về nhóm con và 60% tìm cấu trúc tường minh trên các nhóm mẫu hữu hạn ($S_3, S_4, \\mathbb{Z}_n, V_4$).',
    structureSummary: '3 câu tự luận · 90 phút · Tỷ trọng 40% chứng minh – 60% cấu trúc nhóm mẫu',
    distribution: [
      {
        id: 'ctds-proof-40',
        label: 'Chứng minh định lý nền tảng về nhóm con',
        percentage: 40,
        pointsSummary: 'Câu 2a & Câu 3a',
        description:
          'Giao hai nhóm con $H \\cap K \\le G$, điều kiện cần và đủ để tích hai nhóm con là nhóm con ($HK \\le G \\iff HK = KH$).',
        tone: 'primary',
      },
      {
        id: 'ctds-explicit-60',
        label: 'Tìm cấu trúc tường minh trên nhóm mẫu hữu hạn',
        percentage: 60,
        pointsSummary: 'Câu 1, Câu 2b-c & Câu 3b',
        description:
          'Xác định nhóm con theo cấp trên $S_3, S_4, \\mathbb{Z}_4, V_4$ và xây dựng phản ví dụ hợp hai nhóm con không là nhóm con.',
        tone: 'secondary',
      },
    ],
    specificationRows: [
      {
        id: 'ctds-spec-c1',
        itemLabel: 'Câu 1 (a, b, c)',
        points: '3.0 điểm (30%)',
        topic: 'Nhóm đối xứng $S_3$ & Nhóm cyclic $\\mathbb{Z}_4$',
        coreSkills:
          'Tìm nhóm con cấp $2$, cấp $3$ của $S_3$; liệt kê toàn bộ nhóm con của nhóm cyclic $\\mathbb{Z}_4$ theo các ước $d \\mid 4$.',
        examStrategy:
          'Viết tường minh phần tử sinh $\\langle \\tau \\rangle, \\langle \\sigma \\rangle$ và kiểm tra đủ $3$ nhóm con ứng với $d \\in \\{1, 2, 4\\}$.',
      },
      {
        id: 'ctds-spec-c2',
        itemLabel: 'Câu 2 (a, b, c)',
        points: '3.0 điểm (30%)',
        topic: 'Phép toán tập hợp trên nhóm con & Nhóm Klein $V_4$',
        coreSkills:
          'Chứng minh $H \\cap K \\le G$; đưa phản ví dụ $H \\cup K$ không đóng kín; phân tích các ước cấp của $V_4$ theo Lagrange.',
        examStrategy:
          'Nhớ đủ 2 bước tiêu chuẩn nhóm con: khác rỗng ($e \\in H \\cap K$) và đóng với $xy^{-1}$. Với phản ví dụ hợp nhóm con, dùng $2\\mathbb{Z} \\cup 3\\mathbb{Z}$.',
      },
      {
        id: 'ctds-spec-c3',
        itemLabel: 'Câu 3 (a, b)',
        points: '4.0 điểm (40%)',
        topic: 'Tích hai nhóm con $HK$ & Nhóm đối xứng $S_4$',
        coreSkills:
          'Chứng minh hai chiều $HK \\le G \\iff HK = KH$; chỉ ra nhóm con cấp $4$ trong $S_4$ (cyclic cấp $4$ hoặc Klein $V_4 \\le S_4$).',
        examStrategy:
          'Ở chiều $(\\Rightarrow)$, tận dụng nghịch đảo $(x^{-1})^{-1} = x$ và $(hk)^{-1} = k^{-1}h^{-1}$. Ở ý b, liệt kê đủ $4$ phần tử tường minh.',
      },
    ],
    focusChecklists: [
      {
        id: 'ctds-check-samples',
        title: '1. Bốn họ nhóm mẫu cần thuộc lòng',
        badge: '4 họ nhóm',
        description: 'Nắm chắc cấu trúc phần tử sinh, cấp phần tử và biểu diễn tường minh.',
        items: [
          {
            id: 'ctds-sample-zn',
            title: 'Nhóm cộng modulo n (ℤₙ)',
            summary:
              'Nhóm cyclic cấp $n$ sinh bởi $\\overline{1}$; với mỗi ước $d \\mid n$ có đúng $1$ nhóm con cấp $d$ là $\\langle n/d \\rangle$.',
            keyFormulas: [
              '\\mathbb{Z}_n = \\langle 1 \\rangle',
              '|H_d| = d \\iff H_d = \\langle n/d \\rangle',
            ],
          },
          {
            id: 'ctds-sample-un',
            title: 'Nhóm nhân khả nghịch U(n)',
            summary:
              'Gồm các lớp $\\overline{k}$ thỏa $\\gcd(k, n) = 1$, cấp nhóm bằng hàm phi Euler $\\varphi(n)$.',
            keyFormulas: [
              'U(10) = \\{\\overline{1}, \\overline{3}, \\overline{7}, \\overline{9}\\}',
            ],
          },
          {
            id: 'ctds-sample-sn',
            title: 'Nhóm đối xứng S₃, S₄',
            summary:
              'Phân tích phép thế thành tích các xích độc lập, tính cấp bằng $\\operatorname{lcm}$ độ dài xích, xét chẵn lẻ và nhóm thay phiên $A_n$.',
            keyFormulas: [
              'A_3 = \\{id, (1\\ 2\\ 3), (1\\ 3\\ 2)\\}',
              'H = \\langle (1\\ 2\\ 3\\ 4) \\rangle \\le S_4',
            ],
          },
          {
            id: 'ctds-sample-v4',
            title: 'Nhóm bốn Klein V₄',
            summary:
              'Nhóm Abel cấp $4$ không cyclic: mọi phần tử khác $e$ đều có cấp $2$ ($a^2 = b^2 = c^2 = e$); có đúng $5$ nhóm con.',
            keyFormulas: ['V_4 = \\{e, a, b, c\\}, \\quad ab = c'],
          },
        ],
      },
      {
        id: 'ctds-check-proofs',
        title: '2. Năm chứng minh kinh điển',
        badge: '5 chứng minh',
        description: 'Thuộc khung lập luận $2$–$3$ bước theo tiêu chuẩn nhóm con và chuẩn tắc.',
        items: [
          {
            id: 'ctds-proof-cap',
            title: 'Giao các nhóm con / nhóm con chuẩn tắc',
            summary:
              'Kiểm tra $e \\in H \\cap K \\neq \\emptyset$, tính đóng với $xy^{-1}$ và phép liên hợp $gxg^{-1}$.',
            keyFormulas: [
              'H \\cap K \\le G',
              'H, K \\trianglelefteq G \\implies H \\cap K \\trianglelefteq G',
            ],
          },
          {
            id: 'ctds-proof-hk',
            title: 'Tích hai nhóm con HK ≤ G ⇔ HK = KH',
            summary:
              'Chứng minh hai chiều dùng phép lấy nghịch đảo $(hk)^{-1} = k^{-1}h^{-1}$ và tiêu chuẩn nhóm con.',
            keyFormulas: ['HK \\le G \\iff HK = KH'],
          },
          {
            id: 'ctds-proof-center',
            title: 'Tâm nhóm Z(G) ⊴ G',
            summary:
              'Từ $yg = gy$ suy ra $y^{-1}g = gy^{-1}$ để có $xy^{-1} \\in Z(G)$ và $gzg^{-1} = z$.',
            keyFormulas: [
              'Z(G) = \\{z \\in G \\mid zg = gz, \\forall g \\in G\\} \\trianglelefteq G',
            ],
          },
          {
            id: 'ctds-proof-ker',
            title: 'Hạt nhân ker f ⊴ G',
            summary:
              "Với đồng cấu $f: G \\to G'$, chứng minh $e \\in \\ker f$, $xy^{-1} \\in \\ker f$ và $f(gug^{-1}) = f(g)e'f(g)^{-1} = e'$.",
            keyFormulas: ['\\ker f \\trianglelefteq G'],
          },
          {
            id: 'ctds-proof-im',
            title: "Ảnh đồng cấu im f ≤ G'",
            summary:
              "Chứng minh $e' = f(e) \\in \\text{im } f$ và $f(x_1)f(x_2)^{-1} = f(x_1x_2^{-1}) \\in \\text{im } f$.",
            keyFormulas: ["\\text{im } f \\le G'"],
          },
        ],
      },
      {
        id: 'ctds-check-counter',
        title: '3. Bộ phản ví dụ bắt buộc nhớ',
        badge: 'Phản ví dụ',
        description:
          'Trình bày rõ phần tử thuộc từng nhóm con nhưng không thuộc hợp / không bất biến liên hợp.',
        items: [
          {
            id: 'ctds-counter-union',
            title: 'Hợp hai nhóm con không là nhóm con: 2ℤ ∪ 3ℤ',
            summary:
              'Trong $(\\mathbb{Z}, +)$, $2 \\in 2\\mathbb{Z}$ và $3 \\in 3\\mathbb{Z}$ nhưng $2 + 3 = 5 \\notin 2\\mathbb{Z} \\cup 3\\mathbb{Z}$.',
            keyFormulas: ['2 + 3 = 5 \\notin 2\\mathbb{Z} \\cup 3\\mathbb{Z}'],
          },
          {
            id: 'ctds-counter-normal',
            title: 'Nhóm con không chuẩn tắc trong S₃: {id, (1 2)}',
            summary:
              'Liên hợp bởi $g = (1\\ 3) \\in S_3$ cho $(1\\ 3)(1\\ 2)(1\\ 3) = (2\\ 3) \\notin \\{id, (1\\ 2)\\}$.',
            keyFormulas: ['(1\\ 3)(1\\ 2)(1\\ 3)^{-1} = (2\\ 3) \\notin H'],
          },
        ],
      },
    ],
  },
  mockExams: [MATH1301_MOCK_EXAM_1, MATH1301_MOCK_EXAM_2],
};
