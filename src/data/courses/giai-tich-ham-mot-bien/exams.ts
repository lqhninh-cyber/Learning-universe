import type { ExamPaper } from '../exam-bank-types';

export type { ExamPaper, ExamProblem, ExamProblemPart } from '../exam-bank-types';

export const GTHMB_EXAM_PAPERS: readonly ExamPaper[] = [
  // =========================================================================
  // ĐỀ 1: NĂM HỌC 2025-2026 - HỌC KỲ I (90 PHÚT)
  // =========================================================================
  {
    id: 'exam-2025-2026-hk1',
    year: '2025-2026',
    semester: 'Học kỳ I',
    durationMinutes: 90,
    title: 'Đề thi Kết thúc Học phần Giải tích hàm một biến — Năm học 2025-2026 (HK1)',
    description:
      'Đề thi chính thức học kỳ 1 năm học 2025-2026 gồm 5 bài toán tự luận (thời gian làm bài: 90 phút). Bao quát: Cận trên/cận dưới, Tiêu chuẩn Cauchy dãy số, Giới hạn tham số, Tính liên tục đều, Khai triển Maclaurin, Mô hình tăng trưởng logistic, Tích phân suy rộng và Chuỗi lũy thừa.',
    originalImagePath: '/docs/giai-tich-ham-mot-bien/exams/de-2025-2026-hk1.png',
    problems: [
      {
        id: 'exam-2025-2026-b1',
        number: 1,
        points: 2.0,
        title: 'Cận trên, Cận dưới và Tiêu chuẩn Cauchy Dãy số',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Tìm $\\inf A$ và $\\sup A$ với tập hợp:\n$$\nA = \\left\\{ n \\ln\\left(1 + \\frac{1}{n}\\right) : n \\in \\mathbb{N}^* \\right\\}\n$$',
            hint: 'Khảo sát sự biến thiên của hàm số $f(x) = x \\ln(1 + 1/x)$ trên $[1; +\\infty)$ bằng cách đổi biến $t = 1/x \\in (0; 1]$.',
            solution:
              "**Bước 1: Khảo sát tính đơn điệu:**\nXét hàm số $f(x) = x \\ln\\left(1 + \\frac{1}{x}\\right)$ trên nửa khoảng $[1; +\\infty)$.\nĐạo hàm của $f(x)$ là:\n$$\nf'(x) = \\ln\\left(1 + \\frac{1}{x}\\right) + x \\cdot \\frac{-\\frac{1}{x^2}}{1 + \\frac{1}{x}} = \\ln\\left(1 + \\frac{1}{x}\\right) - \\frac{1}{x + 1}\n$$\nĐặt $t = \\frac{1}{x} \\in (0; 1]$. Khi đó $f'(x) = g(t) = \\ln(1 + t) - \\frac{t}{1 + t}$.\nĐạo hàm của $g(t)$ theo $t$:\n$$\ng'(t) = \\frac{1}{1 + t} - \\frac{(1 + t) - t}{(1 + t)^2} = \\frac{t}{(1 + t)^2} > 0, \\quad \\forall t \\in (0; 1]\n$$\nDo $g'(t) > 0$ trên $(0; 1]$, hàm $g(t)$ tăng nghiêm ngặt trên $[0; 1]$.\nVì vậy với mọi $t > 0$, ta có $g(t) > g(0) = 0$. Suy ra $f'(x) > 0$ với mọi $x \\ge 1$.\nDo đó hàm số $f(x)$ tăng nghiêm ngặt trên $[1; +\\infty)$, kéo theo dãy số $a_n = n \\ln\\left(1 + \\frac{1}{n}\\right)$ là một dãy số tăng nghiêm ngặt.\n\n**Bước 2: Tìm $\\inf A$:**\nVì dãy $(a_n)$ tăng nghiêm ngặt nên giá trị nhỏ nhất của tập $A$ đạt được tại số nguyên dương đầu tiên $n = 1$:\n$$\n\\min A = a_1 = 1 \\cdot \\ln\\left(1 + \\frac{1}{1}\\right) = \\ln 2\n$$\nDo đó $\\inf A = \\min A = \\ln 2$.\n\n**Bước 3: Tìm $\\sup A$:**\nXét giới hạn khi $n \\to \\infty$:\n$$\n\\lim_{n \\to \\infty} a_n = \\lim_{n \\to \\infty} n \\ln\\left(1 + \\frac{1}{n}\\right) = \\lim_{n \\to \\infty} \\ln\\left[ \\left(1 + \\frac{1}{n}\\right)^n \\right] = \\ln e = 1\n$$\nVì dãy $(a_n)$ tăng nghiêm ngặt và tiến về 1 nên $a_n < 1$ với mọi $n \\ge 1$. Do đó $\\sup A = 1$ (tập $A$ không có phần tử lớn nhất $\\max A$).\n\n**Kết luận:** $\\inf A = \\ln 2$, $\\sup A = 1$.",
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Dùng tiêu chuẩn Cauchy, xét sự hội tụ của dãy số $(x_n)$ cho bởi:\n$$\nx_n = \\sum_{k=1}^n \\frac{\\cos(k^{2025})}{2025^k}, \\quad n \\in \\mathbb{N}^*\n$$',
            hint: 'Sử dụng đánh giá bất đẳng thức tam giác $|\\cos u| \\le 1$ và đưa về tổng cấp số nhân lùi vô hạn.',
            solution:
              '**Bước 1: Thiết lập hiệu sai phân:**\nVới mọi số nguyên dương $n, p \\in \\mathbb{N}^*$, ta xét:\n$$\n|x_{n+p} - x_n| = \\left| \\sum_{k=n+1}^{n+p} \\frac{\\cos(k^{2025})}{2025^k} \\right|\n$$\nÁp dụng bất đẳng thức tam giác và đánh giá $|\\cos(k^{2025})| \\le 1$ với mọi $k$:\n$$\n|x_{n+p} - x_n| \\le \\sum_{k=n+1}^{n+p} \\frac{|\\cos(k^{2025})|}{2025^k} \\le \\sum_{k=n+1}^{n+p} \\frac{1}{2025^k}\n$$\n\n**Bước 2: Tính tổng cấp số nhân:**\nVế phải là tổng của cấp số nhân hữu hạn với số hạng đầu $\\frac{1}{2025^{n+1}}$ và công bội $q = \\frac{1}{2025}$:\n$$\n\\sum_{k=n+1}^{n+p} \\frac{1}{2025^k} = \\frac{1}{2025^{n+1}} \\cdot \\frac{1 - (1/2025)^p}{1 - 1/2025} < \\frac{1}{2025^{n+1}} \\cdot \\frac{1}{\\frac{2024}{2025}} = \\frac{1}{2024 \\cdot 2025^n}\n$$\n\n**Bước 3: Khẳng định theo Tiêu chuẩn Cauchy:**\nVì $\\lim_{n \\to \\infty} \\frac{1}{2024 \\cdot 2025^n} = 0$, nên với mọi $\\varepsilon > 0$, tồn tại chỉ số $N \\in \\mathbb{N}^*$ sao cho $\\frac{1}{2024 \\cdot 2025^N} < \\varepsilon$.\nKhi đó, với mọi $n \\ge N$ và mọi $p \\in \\mathbb{N}^*$, ta đều có:\n$$\n|x_{n+p} - x_n| < \\frac{1}{2024 \\cdot 2025^n} \\le \\frac{1}{2024 \\cdot 2025^N} < \\varepsilon\n$$\nTheo **Tiêu chuẩn Cauchy cho dãy số thực**, dãy số $(x_n)$ hội tụ.',
          },
        ],
      },
      {
        id: 'exam-2025-2026-b2',
        number: 2,
        points: 2.0,
        title: 'Giới hạn Tham số và Tính Liên tục Đều',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Tìm các số thực $p$ và $q$ sao cho:\n$$\n\\lim_{x \\to 0} \\frac{(p\\arcsin x + q)^3 - 1}{x} = 2025\n$$',
            hint: "Điều kiện cần để giới hạn hữu hạn là tử số tiến về 0 khi x tiến về 0. Sau đó áp dụng định nghĩa đạo hàm hoặc quy tắc L'Hôpital.",
            solution:
              "**Bước 1: Tìm điều kiện cần đối với $q$:**\nKhi $x \\to 0$, mẫu số $x \\to 0$. Để giới hạn là hữu hạn ($= 2025$), tử số phải tiến về 0 khi $x \\to 0$:\n$$\n\\lim_{x \\to 0} \\left[ (p\\arcsin x + q)^3 - 1 \\right] = (p \\cdot 0 + q)^3 - 1 = q^3 - 1 = 0 \\iff q = 1\n$$\n\n**Bước 2: Tìm $p$:**\nKhi $q = 1$, xét hàm số $F(x) = (p\\arcsin x + 1)^3$. Hàm $F$ khả vi tại lân cận $x = 0$ và có $F(0) = 1$.\nGiới hạn đã cho chính là đạo hàm của hàm số $F$ tại điểm $x = 0$:\n$$\n\\lim_{x \\to 0} \\frac{F(x) - F(0)}{x - 0} = F'(0)\n$$\nTa tính đạo hàm $F'(x)$:\n$$\nF'(x) = 3(p\\arcsin x + 1)^2 \\cdot \\frac{p}{\\sqrt{1 - x^2}}\n$$\nThay $x = 0$:\n$$\nF'(0) = 3(p \\cdot 0 + 1)^2 \\cdot \\frac{p}{\\sqrt{1 - 0}} = 3p\n$$\nTheo đề bài, giới hạn bằng 2025, do đó:\n$$\n3p = 2025 \\iff p = 675\n$$\n\n**Kết luận:** $p = 675$ và $q = 1$.",
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Chứng minh phương trình $x - \\sqrt[5]{x} - 2025 = 0$ có nghiệm thực. Hàm số $h(x) = x - \\sqrt[5]{x} - 2025$ có liên tục đều trên $\\mathbb{R}$ không?',
            hint: "Dùng định lý Bolzano - Cauchy trên đoạn phù hợp để chỉ ra nghiệm. Đối với tính liên tục đều, khảo sát đạo hàm h'(x) trên vùng vô hạn.",
            solution:
              "**1. Chứng minh phương trình có nghiệm thực:**\nHàm số $h(x) = x - \\sqrt[5]{x} - 2025$ xác định và liên tục trên toàn bộ $\\mathbb{R}$.\nTa tính giá trị tại hai điểm:\n- Tại $x = 0$: $h(0) = 0 - 0 - 2025 = -2025 < 0$.\n- Tại $x = 3000$: ta có $\\sqrt[5]{3000} < \\sqrt[5]{3200000} = 10$, do đó:\n  $$\n  h(3000) = 3000 - \\sqrt[5]{3000} - 2025 > 3000 - 10 - 2025 = 965 > 0\n  $$\nVì $h(x)$ liên tục trên đoạn $[0; 3000]$ và $h(0) \\cdot h(3000) < 0$, theo **Định lý giá trị trung gian Bolzano - Cauchy**, tồn tại ít nhất một số thực $c \\in (0; 3000)$ sao cho $h(c) = 0$.\nPhương trình có nghiệm thực.\n\n**2. Khảo sát tính liên tục đều trên $\\mathbb{R}$:**\nTa có $h(x) = x - \\sqrt[5]{x} - 2025$.\n- Hàm số $f_1(x) = x - 2025$ có đạo hàm $f_1'(x) = 1$ bị chặn trên $\\mathbb{R}$, nên theo định lý Lagrange, $f_1(x)$ liên tục Lipschitz trên $\\mathbb{R}$, do đó liên tục đều trên $\\mathbb{R}$.\n- Hàm số $f_2(x) = \\sqrt[5]{x}$ liên tục đều trên $\\mathbb{R}$ do thỏa mãn điều kiện Hölder: $|\\sqrt[5]{x} - \\sqrt[5]{y}| \\le 2 |x - y|^{1/5}$ (hoặc đạo hàm $f_2'(x) = \\frac{1}{5 x^{4/5}} \\to 0$ khi $|x| \\to \\infty$, kết hợp tính liên tục đều trên đoạn hữu hạn $[-1; 1]$ theo định lý Cantor).\n- Tổng và hiệu của hai hàm liên tục đều trên $\\mathbb{R}$ là một hàm liên tục đều trên $\\mathbb{R}$.\n\n**Kết luận:** Hàm số $h(x)$ **liên tục đều trên $\\mathbb{R}$**.",
          },
        ],
      },
      {
        id: 'exam-2025-2026-b3',
        number: 3,
        points: 2.0,
        title: 'Họ Nguyên hàm và Khai triển Maclaurin Đạo hàm Cấp cao',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Cho hàm số:\n$$\nf(x) = \\begin{cases} 3x^2 & \\text{nếu } x > 1 \\\\ 2^x + 1 & \\text{nếu } x \\le 1 \\end{cases}\n$$\nTìm tất cả các nguyên hàm của $f(x)$ trên $\\mathbb{R}$.',
            hint: 'Tìm nguyên hàm trên hai khoảng mở (1; +inf) và (-inf; 1), sau đó dùng điều kiện liên tục và khả vi tại điểm nối x = 1.',
            solution:
              '**Bước 1: Tìm nguyên hàm trên từng khoảng:**\n- Với $x > 1$: $\\int 3x^2 dx = x^3 + C_1$.\n- Với $x < 1$: $\\int (2^x + 1) dx = \\frac{2^x}{\\ln 2} + x + C_2$.\n\n**Bước 2: Kiểm tra tính liên tục của $f$ tại $x = 1$:**\n- $\\lim_{x \\to 1^+} f(x) = \\lim_{x \\to 1^+} (3x^2) = 3$.\n- $\\lim_{x \\to 1^-} f(x) = \\lim_{x \\to 1^-} (2^x + 1) = 2^1 + 1 = 3$.\n- $f(1) = 3$.\nDo $\\lim_{x \\to 1^+} f(x) = \\lim_{x \\to 1^-} f(x) = f(1) = 3$, hàm số $f$ liên tục tại $x = 1$. Vì $f$ liên tục trên toàn $\\mathbb{R}$ nên $f$ có nguyên hàm trên $\\mathbb{R}$.\n\n**Bước 3: Xác định quan hệ giữa $C_1$ và $C_2$ để $F(x)$ liên tục tại 1:**\nĐể $F(x)$ là nguyên hàm trên $\\mathbb{R}$, $F(x)$ phải liên tục tại $x = 1$:\n$$\n\\lim_{x \\to 1^+} F(x) = 1^3 + C_1 = 1 + C_1\n$$\n$$\n\\lim_{x \\to 1^-} F(x) = F(1) = \\frac{2^1}{\\ln 2} + 1 + C_2 = \\frac{2}{\\ln 2} + 1 + C_2\n$$\nDo đó: $1 + C_1 = \\frac{2}{\\ln 2} + 1 + C_2 \\iff C_1 = \\frac{2}{\\ln 2} + C_2$.\nĐặt $C_2 = C \\in \\mathbb{R}$, ta suy ra $C_1 = \\frac{2}{\\ln 2} + C$.\n\n**Kết luận:** Họ tất cả các nguyên hàm của $f(x)$ trên $\\mathbb{R}$ là:\n$$\nF(x) = \\begin{cases}\nx^3 + \\dfrac{2}{\\ln 2} + C & \\text{nếu } x > 1 \\\\[2ex]\n\\dfrac{2^x}{\\ln 2} + x + C & \\text{nếu } x \\le 1\n\\end{cases} \\quad (C \\in \\mathbb{R})\n$$',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Tìm khai triển Maclaurin của hàm số $g(x) = (x^3 - x^4) \\sin x$ đến cấp 7. Từ đó tính đạo hàm cấp 7 tại điểm 0: $g^{(7)}(0)$.',
            hint: 'Dùng khai triển sin(x) = x - x^3/6 + o(x^4), nhân với (x^3 - x^4) và đối chiếu hệ số a_7 = g^(7)(0)/7!.',
            solution:
              '**Bước 1: Khai triển $\\sin x$:**\nKhi $x \\to 0$, ta có khai triển Maclaurin của $\\sin x$ đến cấp 4:\n$$\n\\sin x = x - \\frac{x^3}{6} + o(x^4)\n$$\n\n**Bước 2: Nhân phân phối:**\n$$\n\\begin{aligned}\ng(x) &= (x^3 - x^4) \\left( x - \\frac{x^3}{6} + o(x^4) \\right) \\\\\n&= x^3 \\cdot x - x^3 \\cdot \\frac{x^3}{6} - x^4 \\cdot x + x^4 \\cdot \\frac{x^3}{6} + o(x^7) \\\\\n&= x^4 - \\frac{x^6}{6} - x^5 + \\frac{x^7}{6} + o(x^7) \\\\\n&= x^4 - x^5 - \\frac{x^6}{6} + \\frac{x^7}{6} + o(x^7)\n\\end{aligned}\n$$\n\n**Bước 3: Xác định $g^{(7)}(0)$:**\nTheo công thức Maclaurin tổng quát, hệ số của số hạng $x^7$ là:\n$$\na_7 = \\frac{g^{(7)}(0)}{7!}\n$$\nTừ khai triển trên, hệ số của $x^7$ là $\\frac{1}{6}$. Do đó:\n$$\n\\frac{g^{(7)}(0)}{7!} = \\frac{1}{6} \\iff g^{(7)}(0) = \\frac{7!}{6} = \\frac{5040}{6} = 840\n$$\n\n**Kết luận:** Khai triển Maclaurin là $g(x) = x^4 - x^5 - \\frac{x^6}{6} + \\frac{x^7}{6} + o(x^7)$ và $g^{(7)}(0) = 840$.',
          },
        ],
      },
      {
        id: 'exam-2025-2026-b4',
        number: 4,
        points: 2.0,
        title: 'Mô hình Tăng trưởng Ứng dụng và Tích phân Suy rộng',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              "Số lượng tế bào nấm men trong một môi trường nuôi cấy được mô hình hóa bởi hàm số:\n$$\nP(t) = \\frac{a}{b + e^{-0.25t}}\n$$\ntrong đó $t$ là thời gian (giờ), $a, b > 0$. Biết rằng tại thời điểm bắt đầu nuôi cấy $t = 0$, số lượng tế bào là $P(0) = 60$ và tốc độ tăng trưởng là $P'(0) = 10$. Tìm thời điểm $t$ mà tại đó số lượng tế bào tăng nhanh nhất.",
            hint: "Tìm a, b từ hệ điều kiện ban đầu, sau đó tìm điểm uốn (nơi đạo hàm cấp 2 P''(t) = 0) để tốc độ tăng trưởng P'(t) đạt cực đại.",
            solution:
              "**Bước 1: Xác định các hằng số $a$ và $b$:**\n- Tại $t = 0$: $P(0) = \\frac{a}{b + 1} = 60 \\implies a = 60(b + 1)$.\n- Đạo hàm tốc độ tăng trưởng:\n  $$\n  P'(t) = a \\cdot \\frac{-(-0.25 e^{-0.25t})}{(b + e^{-0.25t})^2} = \\frac{0.25 a e^{-0.25t}}{(b + e^{-0.25t})^2}\n  $$\n- Tại $t = 0$: $P'(0) = \\frac{0.25 a}{(b + 1)^2} = 10$.\n- Thay $a = 60(b + 1)$ vào phương trình trên:\n  $$\n  \\frac{0.25 \\cdot 60(b + 1)}{(b + 1)^2} = \\frac{15}{b + 1} = 10 \\iff b + 1 = 1.5 \\iff b = 0.5\n  $$\n- Suy ra $a = 60(0.5 + 1) = 90$.\nVậy $P(t) = \\frac{90}{0.5 + e^{-0.25t}}$.\n\n**Bước 2: Tìm thời điểm tăng nhanh nhất:**\nTốc độ tăng trưởng là $v(t) = P'(t) = \\frac{22.5 e^{-0.25t}}{(0.5 + e^{-0.25t})^2}$.\nĐể $P'(t)$ đạt giá trị lớn nhất, ta giải phương trình $P''(t) = 0$:\n$$\nP''(t) = 22.5 \\cdot \\frac{-0.25 e^{-0.25t}(0.5 + e^{-0.25t})^2 - e^{-0.25t} \\cdot 2(0.5 + e^{-0.25t})(-0.25 e^{-0.25t})}{(0.5 + e^{-0.25t})^4} = 0\n$$\nRút gọn nhân tử chung $-0.25 e^{-0.25t}(0.5 + e^{-0.25t}) \\neq 0$:\n$$\n(0.5 + e^{-0.25t}) - 2 e^{-0.25t} = 0 \\iff 0.5 - e^{-0.25t} = 0 \\iff e^{-0.25t} = 0.5\n$$\nLấy logarit tự nhiên hai vế:\n$$\n-0.25t = \\ln(0.5) = -\\ln 2 \\iff \\frac{t}{4} = \\ln 2 \\iff t = 4 \\ln 2 \\approx 2.77 \\text{ (giờ)}\n$$\n\n**Kết luận:** Số lượng tế bào tăng nhanh nhất tại thời điểm $t = 4\\ln 2$ giờ (khoảng 2 giờ 46 phút).",
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Tính tích phân suy rộng:\n$$\nI = \\int_0^{+\\infty} \\sqrt{x} e^{-\\sqrt{x}} dx\n$$',
            hint: 'Đổi biến u = \\sqrt{x} đưa về tích phân dạng \\int u^2 e^{-u} du và áp dụng tích phân từng phần.',
            solution:
              '**Bước 1: Đổi biến số:**\nĐặt $u = \\sqrt{x} \\implies x = u^2, \\; dx = 2u du$.\nĐổi cận:\n- Khi $x = 0 \\implies u = 0$.\n- Khi $x \\to +\\infty \\implies u \\to +\\infty$.\n\nThay vào tích phân:\n$$\nI = \\int_0^{+\\infty} u \\cdot e^{-u} \\cdot 2u du = 2 \\int_0^{+\\infty} u^2 e^{-u} du\n$$\n\n**Bước 2: Tích phân từng phần:**\nXét tích phân $J = \\int_0^{+\\infty} u^2 e^{-u} du$. Áp dụng tích phân từng phần với $v = -e^{-u}$:\n$$\n\\int_0^{+\\infty} u^2 e^{-u} du = \\left[ -u^2 e^{-u} \\right]_0^{+\\infty} + 2 \\int_0^{+\\infty} u e^{-u} du\n$$\nVì $\\lim_{u \\to +\\infty} u^2 e^{-u} = 0$ và tại $u = 0$ bằng 0, số hạng thế cận bằng 0.\nTiếp tục tích phân từng phần lần thứ hai:\n$$\n\\int_0^{+\\infty} u e^{-u} du = \\left[ -u e^{-u} \\right]_0^{+\\infty} + \\int_0^{+\\infty} e^{-u} du = 0 + \\left[ -e^{-u} \\right]_0^{+\\infty} = 0 - (-1) = 1\n$$\nDo đó $J = 2 \\cdot 1 = 2$.\n\n**Bước 3: Kết luận:**\n$$\nI = 2 J = 2 \\cdot 2 = 4\n$$',
          },
        ],
      },
      {
        id: 'exam-2025-2026-b5',
        number: 5,
        points: 2.0,
        title: 'Miền Hội tụ và Tính Tổng Chuỗi Lũy thừa',
        statement:
          'Cho chuỗi hàm:\n$$\nS(x) = \\sum_{n=0}^{+\\infty} \\frac{x^{2n+1}}{2n+1} = x + \\frac{x^3}{3} + \\frac{x^5}{5} + \\dots\n$$',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement: 'Tìm miền hội tụ $D$ của chuỗi hàm đã cho.',
            hint: 'Đặt t = x^2 để đưa về chuỗi lũy thừa theo t, tìm bán kính hội tụ và xét kỹ hai đầu mút x = 1 và x = -1.',
            solution:
              'Đặt $t = x^2 \\ge 0$. Chuỗi trở thành $\\sum_{n=0}^{+\\infty} \\frac{t^n}{2n+1} x$.\nXét chuỗi lũy thừa $\\sum_{n=0}^{+\\infty} c_n t^n$ với $c_n = \\frac{1}{2n+1}$:\n$$\nR_t = \\lim_{n \\to \\infty} \\left| \\frac{c_n}{c_{n+1}} \\right| = \\lim_{n \\to \\infty} \\frac{2n+3}{2n+1} = 1\n$$\nDo đó chuỗi hội tụ khi $|t| < 1 \\iff x^2 < 1 \\iff -1 < x < 1$.\n\n**Xét tại các đầu mút:**\n- Tại $x = 1$: chuỗi trở thành $\\sum_{n=0}^{+\\infty} \\frac{1}{2n+1}$. Vì $\\frac{1}{2n+1} \\sim \\frac{1}{2n}$ và chuỗi điều hòa $\\sum \\frac{1}{n}$ phân kỳ, chuỗi tại $x = 1$ phân kỳ.\n- Tại $x = -1$: chuỗi trở thành $\\sum_{n=0}^{+\\infty} \\frac{(-1)^{2n+1}}{2n+1} = -\\sum_{n=0}^{+\\infty} \\frac{1}{2n+1}$, chuỗi phân kỳ.\n\n**Kết luận:** Miền hội tụ của chuỗi hàm là khoảng mở $D = (-1; 1)$.',
          },
          {
            label: 'b',
            points: 1.0,
            statement: 'Tính tổng $S(x)$ của chuỗi hàm trên miền hội tụ $D$.',
            hint: 'Đạo hàm từng số hạng trên khoảng (-1; 1) và áp dụng công thức cấp số nhân.',
            solution:
              "Vì chuỗi lũy thừa hội tụ đều trên mọi đoạn con đóng $[-c; c] \\subset (-1; 1)$, ta có quyền lấy đạo hàm từng số hạng của chuỗi trên $(-1; 1)$:\n$$\nS'(x) = \\left( \\sum_{n=0}^{+\\infty} \\frac{x^{2n+1}}{2n+1} \\right)' = \\sum_{n=0}^{+\\infty} x^{2n} = 1 + x^2 + x^4 + \\dots\n$$\nĐây là chuỗi cấp số nhân với công bội $q = x^2 < 1$ (với $|x| < 1$). Tổng của cấp số nhân là:\n$$\nS'(x) = \\frac{1}{1 - x^2}\n$$\nLấy tích phân hai vế từ 0 đến $x$ và chú ý $S(0) = 0$:\n$$\nS(x) = \\int_0^x \\frac{dt}{1 - t^2} = \\frac{1}{2} \\int_0^x \\left( \\frac{1}{1 - t} + \\frac{1}{1 + t} \\right) dt = \\frac{1}{2} \\left[ -\\ln|1 - t| + \\ln|1 + t| \\right]_0^x\n$$\nVì $x \\in (-1; 1)$, ta có $1 - x > 0$ và $1 + x > 0$:\n$$\nS(x) = \\frac{1}{2} \\ln\\left( \\frac{1 + x}{1 - x} \\right)\n$$\n\n**Kết luận:** Với mọi $x \\in (-1; 1)$, tổng của chuỗi là $S(x) = \\frac{1}{2} \\ln\\left( \\frac{1 + x}{1 - x} \\right)$.",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // ĐỀ 2: NĂM HỌC 2024-2025 - HỌC KỲ I (90 PHÚT)
  // =========================================================================
  {
    id: 'exam-2024-2025-hk1',
    year: '2024-2025',
    semester: 'Học kỳ I',
    durationMinutes: 90,
    title: 'Đề thi Kết thúc Học phần Giải tích hàm một biến — Năm học 2024-2025 (HK1)',
    description:
      'Đề thi chính thức học kỳ 1 năm học 2024-2025 (thời gian: 90 phút). Bao quát: Dãy giảm sup/inf, Giới hạn tích hai dãy, Giới hạn hàm số căn thức, Tính liên tục đều của hàm lũy thừa x^r, Bài toán cực trị đồng biến AM-GM, Khai triển Maclaurin cos(x), Bài toán chuyển động quãng đường ô tô và Chuỗi lũy thừa arctan.',
    originalImagePath: '/docs/giai-tich-ham-mot-bien/exams/de-2024-2025-hk1.png',
    problems: [
      {
        id: 'exam-2024-2025-b1',
        number: 1,
        points: 2.0,
        title: 'Cực biên Tập hợp và Giới hạn Tích hai Dãy',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Tìm $\\sup A$, $\\inf A$, $\\max A$, $\\min A$ (nếu có) của tập hợp:\n$$\nA = \\left\\{ \\frac{n}{3^n} : n \\in \\mathbb{N}^* \\right\\}\n$$',
            hint: 'Xét tỉ số a_{n+1} / a_n để kiểm tra tính đơn điệu của dãy số.',
            solution:
              'Xét số hạng tổng quát $a_n = \\frac{n}{3^n} > 0$ với $n \\in \\mathbb{N}^*$.\nLập tỉ số hai số hạng liên tiếp:\n$$\n\\frac{a_{n+1}}{a_n} = \\frac{n+1}{3^{n+1}} \\cdot \\frac{3^n}{n} = \\frac{n+1}{3n} = \\frac{1}{3} + \\frac{1}{3n} \\le \\frac{1}{3} + \\frac{1}{3} = \\frac{2}{3} < 1, \\quad \\forall n \\ge 1\n$$\nDo đó $a_{n+1} < a_n$ với mọi $n \\ge 1$, nghĩa là dãy $(a_n)$ giảm nghiêm ngặt.\n- Phần tử lớn nhất đạt tại $n = 1$: $a_1 = \\frac{1}{3}$. Do đó $\\max A = \\sup A = \\frac{1}{3}$.\n- Vì $a_n > 0$ với mọi $n$ và $\\lim_{n \\to \\infty} a_n = \\lim_{n \\to \\infty} \\frac{n}{3^n} = 0$, ta có $\\inf A = 0$.\n- Do $a_n > 0$ với mọi $n$ nên $0 \\notin A$, vì vậy tập $A$ không có phần tử nhỏ nhất (không tồn tại $\\min A$).\n\n**Kết luận:** $\\sup A = \\max A = \\frac{1}{3}$; $\\inf A = 0$; không tồn tại $\\min A$.',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Cho dãy số $(a_n)$ hội tụ về 0 và dãy số $(b_n)$ bị chặn. Chứng minh rằng:\n$$\n\\lim_{n \\to \\infty} (a_n b_n) = 0\n$$',
            hint: 'Dùng định nghĩa dãy bị chặn tồn tại M > 0 sao cho |b_n| <= M và kẹp |a_n b_n| <= M |a_n|.',
            solution:
              'Vì dãy $(b_n)$ bị chặn nên tồn tại hằng số $M > 0$ sao cho:\n$$\n|b_n| \\le M, \\quad \\forall n \\in \\mathbb{N}^*\n$$\nKhi đó, với mọi $n \\ge 1$, ta có:\n$$\n0 \\le |a_n b_n| = |a_n| \\cdot |b_n| \\le M |a_n|\n$$\nVì $\\lim_{n \\to \\infty} a_n = 0$, ta có $\\lim_{n \\to \\infty} |a_n| = 0$, suy ra:\n$$\n\\lim_{n \\to \\infty} (M |a_n|) = M \\cdot 0 = 0\n$$\nTheo **Nguyên lý kẹp**, ta có $\\lim_{n \\to \\infty} |a_n b_n| = 0$, điều này tương đương với:\n$$\n\\lim_{n \\to \\infty} (a_n b_n) = 0\n$$\nĐịnh lý được chứng minh hoàn tất.',
          },
        ],
      },
      {
        id: 'exam-2024-2025-b2',
        number: 2,
        points: 2.0,
        title: 'Giới hạn Căn thức và Tính Liên tục Đều của Hàm Lũy thừa',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Tìm các số thực $a, b$ sao cho:\n$$\n\\lim_{x \\to 0} \\frac{\\sqrt{a \\sin x + b} - \\sqrt{2}}{x} = \\sqrt{2}\n$$',
            hint: 'Tử số phải tiến về 0 tại x = 0 (tìm b = 2), sau đó nhân liên hợp hoặc dùng đạo hàm.',
            solution:
              '**Bước 1: Tìm $b$:**\nĐể giới hạn hữu hạn khi mẫu dần về 0, tử số phải tiến về 0 khi $x \\to 0$:\n$$\n\\lim_{x \\to 0} \\left( \\sqrt{a \\sin x + b} - \\sqrt{2} \\right) = \\sqrt{b} - \\sqrt{2} = 0 \\iff b = 2\n$$\n\n**Bước 2: Tìm $a$:**\nKhi $b = 2$, nhân lượng liên hợp:\n$$\n\\begin{aligned}\n\\lim_{x \\to 0} \\frac{\\sqrt{a \\sin x + 2} - \\sqrt{2}}{x} &= \\lim_{x \\to 0} \\frac{(a \\sin x + 2) - 2}{x (\\sqrt{a \\sin x + 2} + \\sqrt{2})} \\\\\n&= \\lim_{x \\to 0} \\frac{a \\sin x}{x} \\cdot \\frac{1}{\\sqrt{a \\sin x + 2} + \\sqrt{2}}\n\\end{aligned}\n$$\nVì $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$ và $\\lim_{x \\to 0} (\\sqrt{a \\sin x + 2} + \\sqrt{2}) = 2\\sqrt{2}$, giới hạn bằng:\n$$\na \\cdot 1 \\cdot \\frac{1}{2\\sqrt{2}} = \\frac{a}{2\\sqrt{2}}\n$$\nTheo đề bài, giới hạn này bằng $\\sqrt{2}$:\n$$\n\\frac{a}{2\\sqrt{2}} = \\sqrt{2} \\iff a = 2\\sqrt{2} \\cdot \\sqrt{2} = 4\n$$\n\n**Kết luận:** $a = 4$ và $b = 2$.',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Chứng minh rằng hàm số $f(x) = x^r$ liên tục đều trên $[1; +\\infty)$ với mọi số thực $r \\le 1$.',
            hint: "Khảo sát đạo hàm f'(x) = r x^(r-1) trên [1; +inf). Chứng minh đạo hàm bị chặn và áp dụng tính chất hàm liên tục Lipschitz.",
            solution:
              "Hàm số $f(x) = x^r$ khả vi trên $[1; +\\infty)$ với đạo hàm $f'(x) = r x^{r-1}$.\n- Vì $r \\le 1$, số mũ $r - 1 \\le 0$.\n- Do đó với mọi $x \\ge 1$, ta có:\n  $$\n  |f'(x)| = |r| \\cdot x^{r-1} = \\frac{|r|}{x^{1-r}} \\le \\frac{|r|}{1^{1-r}} = |r|\n  $$\n  (vì $1 - r \\ge 0$ nên $x^{1-r} \\ge 1$ với mọi $x \\ge 1$).\n- Như vậy đạo hàm $|f'(x)|$ bị chặn trên $[1; +\\infty)$ bởi hằng số $M = |r|$.\n- Theo **Định lý giá trị trung bình Lagrange**, với mọi $x, y \\in [1; +\\infty)$:\n  $$\n  |f(x) - f(y)| = |f'(c)| \\cdot |x - y| \\le M |x - y|\n  $$\n  với $c$ nằm giữa $x$ và $y$.\n- Điều này chứng minh $f(x)$ là một hàm **Lipschitz** trên $[1; +\\infty)$.\n- Vì mọi hàm Lipschitz đều liên tục đều (với $\\varepsilon > 0$, chỉ cần chọn $\\delta = \\frac{\\varepsilon}{M}$ nếu $M > 0$), ta suy ra $f(x) = x^r$ liên tục đều trên $[1; +\\infty)$ với mọi $r \\le 1$.",
          },
        ],
      },
      {
        id: 'exam-2024-2025-b3',
        number: 3,
        points: 2.0,
        title: 'Đồng biến Bất đẳng thức AM-GM và Khai triển Maclaurin',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Tìm tất cả các giá trị của tham số $m$ để hàm số sau đồng biến trên khoảng $(1; +\\infty)$:\n$$\ny = x^2 - mx + 8\\ln x - 2024\n$$',
            hint: "y' >= 0 với mọi x > 1, cô lập m và dùng bất đẳng thức AM-GM tìm giá trị nhỏ nhất của biểu thức chứa x.",
            solution:
              "Tập xác định của hàm số chứa $(1; +\\infty)$. Đạo hàm của hàm số là:\n$$\ny' = 2x - m + \\frac{8}{x}\n$$\nHàm số đồng biến trên khoảng $(1; +\\infty)$ khi và chỉ khi $y' \\ge 0$ với mọi $x \\in (1; +\\infty)$:\n$$\n2x - m + \\frac{8}{x} \\ge 0 \\iff m \\le 2x + \\frac{8}{x}, \\quad \\forall x > 1\n$$\nXét hàm số $g(x) = 2x + \\frac{8}{x}$ trên $(1; +\\infty)$.\nÁp dụng bất đẳng thức AM-GM cho hai số dương $2x$ và $\\frac{8}{x}$:\n$$\ng(x) = 2x + \\frac{8}{x} \\ge 2 \\sqrt{2x \\cdot \\frac{8}{x}} = 2 \\sqrt{16} = 8\n$$\nDấu đẳng thức xảy ra khi và chỉ khi:\n$$\n2x = \\frac{8}{x} \\iff x^2 = 4 \\iff x = 2 \\quad (\\text{thỏa mãn } x > 1)\n$$\nDo đó $\\min_{x \\in (1; +\\infty)} g(x) = g(2) = 8$.\nĐể $m \\le g(x)$ với mọi $x > 1$, điều kiện cần và đủ là:\n$$\nm \\le \\min_{x \\in (1; +\\infty)} g(x) \\iff m \\le 8\n$$\n\n**Kết luận:** $m \\le 8$.",
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Khai triển Maclaurin của hàm số $f(x) = (x^2 + x^4) \\cos x$ đến cấp 6. Từ đó tính giá trị của $f^{(6)}(0)$.',
            hint: 'Dùng khai triển cos x = 1 - x^2/2 + x^4/24 + o(x^4), nhân phân phối và rút ra hệ số của x^6.',
            solution:
              '**Bước 1: Khai triển $\\cos x$:**\nKhi $x \\to 0$, ta có khai triển Maclaurin của $\\cos x$ đến cấp 4:\n$$\n\\cos x = 1 - \\frac{x^2}{2} + \\frac{x^4}{24} + o(x^4)\n$$\n\n**Bước 2: Nhân phân phối:**\n$$\n\\begin{aligned}\nf(x) &= (x^2 + x^4) \\left( 1 - \\frac{x^2}{2} + \\frac{x^4}{24} + o(x^4) \\right) \\\\\n&= x^2 \\left( 1 - \\frac{x^2}{2} + \\frac{x^4}{24} \\right) + x^4 \\left( 1 - \\frac{x^2}{2} \\right) + o(x^6) \\\\\n&= x^2 - \\frac{x^4}{2} + \\frac{x^6}{24} + x^4 - \\frac{x^6}{2} + o(x^6) \\\\\n&= x^2 + \\left( 1 - \\frac{1}{2} \\right) x^4 + \\left( \\frac{1}{24} - \\frac{1}{2} \\right) x^6 + o(x^6) \\\\\n&= x^2 + \\frac{x^4}{2} - \\frac{11x^6}{24} + o(x^6)\n\\end{aligned}\n$$\n\n**Bước 3: Tính $f^{(6)}(0)$:**\nTheo công thức Maclaurin, hệ số của $x^6$ là $\\frac{f^{(6)}(0)}{6!}$. Từ kết quả trên:\n$$\n\\frac{f^{(6)}(0)}{6!} = -\\frac{11}{24} \\iff f^{(6)}(0) = -\\frac{11}{24} \\cdot 6! = -\\frac{11}{24} \\cdot 720 = -11 \\cdot 30 = -330\n$$\n\n**Kết luận:** $f^{(6)}(0) = -330$.',
          },
        ],
      },
      {
        id: 'exam-2024-2025-b4',
        number: 4,
        points: 2.0,
        title: 'Ứng dụng Tích phân Tính Quãng đường và Tích phân Suy rộng',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Một ô tô bắt đầu chuyển động với vận tốc được mô tả bởi hàm bậc hai $v(t) = -a(t - 15)^2 + 60$ ($m/s$) trong 15 giây đầu ($t \\in [0; 15]$). Biết tại thời điểm ban đầu xe đứng yên $v(0) = 0$. Hãy tính quãng đường mà ô tô đi được trong 15 giây đó.',
            hint: 'Từ v(0) = 0 suy ra a, sau đó tính tích phân quãng đường S = \\int_0^15 v(t) dt.',
            solution:
              '**Bước 1: Xác định hằng số $a$:**\nTheo giả thiết tại thời điểm ban đầu xe đứng yên: $v(0) = 0$.\n$$\nv(0) = -a(0 - 15)^2 + 60 = -225a + 60 = 0 \\iff 225a = 60 \\iff a = \\frac{60}{225} = \\frac{4}{15}\n$$\nDo đó hàm vận tốc là:\n$$\nv(t) = -\\frac{4}{15}(t - 15)^2 + 60, \\quad t \\in [0; 15]\n$$\n\n**Bước 2: Tính quãng đường $S$:**\nQuãng đường ô tô đi được trong 15 giây đầu tiên là tích phân của hàm vận tốc:\n$$\nS = \\int_0^{15} v(t) dt = \\int_0^{15} \\left[ -\\frac{4}{15}(t - 15)^2 + 60 \\right] dt\n$$\nTính nguyên hàm:\n$$\n\\int \\left[ -\\frac{4}{15}(t - 15)^2 + 60 \\right] dt = -\\frac{4}{45}(t - 15)^3 + 60t\n$$\nThế cận từ 0 đến 15:\n$$\n\\begin{aligned}\nS &= \\left[ -\\frac{4}{45}(15 - 15)^3 + 60(15) \\right] - \\left[ -\\frac{4}{45}(0 - 15)^3 + 60(0) \\right] \\\\\n&= (0 + 900) - \\left[ -\\frac{4}{45}(-3375) \\right] \\\\\n&= 900 - \\left( \\frac{4 \\cdot 3375}{45} \\right) \\\\\n&= 900 - (4 \\cdot 75) = 900 - 300 = 600 \\text{ (mét)}\n\\end{aligned}\n$$\n\n**Kết luận:** Quãng đường ô tô đi được trong 15 giây đầu là $600$ mét.',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Xét sự hội tụ và tính giá trị của tích phân suy rộng:\n$$\nK = \\int_0^{+\\infty} x^{-1/2} e^{-\\sqrt{x}} dx\n$$',
            hint: 'Đổi biến u = \\sqrt{x} để triệt tiêu x^(-1/2) ở mẫu số vi phân.',
            solution:
              'Tích phân có điểm kỳ dị tại cận 0 (do số mũ $-1/2$) và tại cận $+\\infty$.\nĐặt $u = \\sqrt{x} \\implies du = \\frac{1}{2\\sqrt{x}} dx = \\frac{1}{2} x^{-1/2} dx \\implies x^{-1/2} dx = 2 du$.\nĐổi cận:\n- Khi $x \\to 0^+ \\implies u \\to 0^+$.\n- Khi $x \\to +\\infty \\implies u \\to +\\infty$.\n\nThay vào tích phân:\n$$\nK = \\int_0^{+\\infty} e^{-u} (2 du) = 2 \\int_0^{+\\infty} e^{-u} du\n$$\nTính tích phân suy rộng cơ bản:\n$$\n\\int_0^{+\\infty} e^{-u} du = \\lim_{B \\to +\\infty} \\left[ -e^{-u} \\right]_0^B = \\lim_{B \\to +\\infty} (-e^{-B} + 1) = 1\n$$\nDo đó:\n$$\nK = 2 \\cdot 1 = 2\n$$\n\n**Kết luận:** Tích phân suy rộng hội tụ và có giá trị bằng $2$.',
          },
        ],
      },
      {
        id: 'exam-2024-2025-b5',
        number: 5,
        points: 2.0,
        title: 'Chuỗi Lũy thừa Cấp số nhân và Khai triển arctan',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Tìm miền hội tụ $D$ và tính tổng hàm số của chuỗi lũy thừa:\n$$\nS(x) = \\sum_{n=0}^{+\\infty} (-1)^n x^{2n}\n$$',
            hint: 'Đây là cấp số nhân có công bội q = -x^2.',
            solution:
              'Đặt $q = -x^2$. Chuỗi có dạng cấp số nhân $\\sum_{n=0}^{+\\infty} q^n$.\nChuỗi cấp số nhân hội tụ khi và chỉ khi:\n$$\n|q| < 1 \\iff |-x^2| < 1 \\iff x^2 < 1 \\iff x \\in (-1; 1)\n$$\nTại $x = \\pm 1$, $(-1)^n (\\pm 1)^{2n} = (-1)^n$ không tiến về 0 nên chuỗi phân kỳ theo điều kiện cần.\nDo đó miền hội tụ của chuỗi là $D = (-1; 1)$.\nVới mọi $x \\in (-1; 1)$, tổng của cấp số nhân là:\n$$\nS(x) = \\frac{1}{1 - q} = \\frac{1}{1 - (-x^2)} = \\frac{1}{1 + x^2}\n$$\n\n**Kết luận:** Miền hội tụ $D = (-1; 1)$ và tổng là $S(x) = \\frac{1}{1 + x^2}$.',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Bằng phương pháp tích phân từng số hạng, hãy chứng minh công thức khai triển sau với mọi $x \\in (-1; 1)$:\n$$\n\\sum_{n=0}^{+\\infty} (-1)^n \\frac{x^{2n+1}}{2n+1} = \\arctan x\n$$',
            hint: 'Tích phân hai vế từ 0 đến x của kết quả câu a.',
            solution:
              'Vì chuỗi $\\sum_{n=0}^{+\\infty} (-1)^n t^{2n}$ hội tụ đều trên đoạn đóng $[0; x] \\subset (-1; 1)$ (với $|x| < 1$), theo định lý tích phân từng số hạng của chuỗi lũy thừa:\n$$\n\\int_0^x \\left( \\sum_{n=0}^{+\\infty} (-1)^n t^{2n} \\right) dt = \\sum_{n=0}^{+\\infty} (-1)^n \\int_0^x t^{2n} dt\n$$\nVế phải:\n$$\n\\sum_{n=0}^{+\\infty} (-1)^n \\left[ \\frac{t^{2n+1}}{2n+1} \\right]_0^x = \\sum_{n=0}^{+\\infty} (-1)^n \\frac{x^{2n+1}}{2n+1}\n$$\nVế trái:\n$$\n\\int_0^x \\frac{1}{1 + t^2} dt = [\\arctan t]_0^x = \\arctan x - \\arctan 0 = \\arctan x\n$$\nĐồng nhất hai vế, ta thu được:\n$$\n\\sum_{n=0}^{+\\infty} (-1)^n \\frac{x^{2n+1}}{2n+1} = \\arctan x, \\quad \\forall x \\in (-1; 1)\n$$\nĐẳng thức được chứng minh hoàn tất.',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // ĐỀ 3: NĂM HỌC 2021 - HỌC KỲ II (90 PHÚT)
  // =========================================================================
  {
    id: 'exam-2021-hk2',
    year: '2021',
    semester: 'Học kỳ II',
    durationMinutes: 90,
    title: 'Đề thi Kết thúc Học phần Giải tích hàm một biến — Năm học 2021 (HK2)',
    description:
      'Đề thi chính thức học kỳ 2 năm 2021 (thời gian làm bài: 90 phút) gồm 8 câu hỏi ngắn kiểm tra sâu sắc các khái niệm cốt lõi: sup/inf, phản ví dụ dãy hội tụ không đơn điệu, chứng minh giới hạn bằng epsilon-delta, số nghiệm phương trình lượng giác, liên tục đều, đạo hàm tích phân theo cận trên Leibniz, tích phân suy rộng và bán kính hội tụ.',
    originalImagePath: '/docs/giai-tich-ham-mot-bien/exams/de-2021-hk2.png',
    problems: [
      {
        id: 'exam-2021-b1',
        number: 1,
        points: 1.0,
        title: 'Supremum và Infimum của Tập hợp',
        statement:
          'Tìm $\\inf A$ và $\\sup A$ của tập hợp:\n$$\nA = \\left\\{ n \\ln\\left(\\frac{n+1}{n}\\right) : n \\in \\mathbb{N}^* \\right\\}\n$$',
        hint: 'Biến đổi n*ln((n+1)/n) = n*ln(1 + 1/n) và dùng kết quả khảo sát hàm số tăng nghiêm ngặt.',
        solution:
          'Ta có $n \\ln\\left(\\frac{n+1}{n}\\right) = n \\ln\\left(1 + \\frac{1}{n}\\right)$.\nNhư đã chứng minh ở Đề 1, hàm số $f(x) = x \\ln\\left(1 + \\frac{1}{x}\\right)$ tăng nghiêm ngặt trên $[1; +\\infty)$.\nDo đó dãy số $a_n = n \\ln\\left(\\frac{n+1}{n}\\right)$ là dãy tăng nghiêm ngặt.\n- Giá trị nhỏ nhất: $\\min A = a_1 = 1 \\cdot \\ln 2 = \\ln 2 \\implies \\inf A = \\ln 2$.\n- Cận trên đúng: $\\lim_{n \\to \\infty} a_n = \\lim_{n \\to \\infty} \\ln\\left(1 + \\frac{1}{n}\\right)^n = \\ln e = 1 \\implies \\sup A = 1$.\n\n**Kết luận:** $\\inf A = \\ln 2$, $\\sup A = 1$.',
      },
      {
        id: 'exam-2021-b2',
        number: 2,
        points: 1.0,
        title: 'Phản ví dụ Dãy số Hội tụ không Đơn điệu',
        statement: 'Hãy nêu một ví dụ về một dãy số thực $(x_n)$ hội tụ nhưng không đơn điệu.',
        hint: 'Nghĩ đến các dãy số đan dấu có biên độ tiến dần về 0.',
        solution:
          'Xét dãy số $(x_n)$ cho bởi:\n$$\nx_n = \\frac{(-1)^n}{n}, \\quad n \\in \\mathbb{N}^*\n$$\n1. **Tính hội tụ:** Ta có $|x_n - 0| = \\frac{1}{n} \\to 0$ khi $n \\to \\infty$. Theo định nghĩa giới hạn, dãy $(x_n)$ hội tụ về 0.\n2. **Tính không đơn điệu:** Các số hạng đầu tiên của dãy là:\n   $$\n   x_1 = -1, \\quad x_2 = \\frac{1}{2}, \\quad x_3 = -\\frac{1}{3}, \\quad x_4 = \\frac{1}{4}, \\dots\n   $$\n   Ta thấy $x_1 < x_2$ nhưng $x_2 > x_3$, nên dãy không tăng và cũng không giảm.\n\nVậy dãy $x_n = \\frac{(-1)^n}{n}$ là một dãy hội tụ nhưng không đơn điệu.',
      },
      {
        id: 'exam-2021-b3',
        number: 3,
        points: 1.0,
        title: 'Chứng minh Giới hạn bằng Định nghĩa Epsilon - Delta',
        statement:
          'Dùng định nghĩa $\\varepsilon - \\delta$, hãy chứng minh rằng:\n$$\n\\lim_{x \\to 1} \\frac{2 - x}{x} = 1\n$$',
        hint: 'Biến đổi |(2-x)/x - 1| = 2|x - 1| / |x|. Chọn delta sơ bộ delta_1 = 1/2 để chặn mẫu số.',
        solution:
          'Lấy $\\varepsilon > 0$ tùy ý. Ta cần tìm $\\delta > 0$ sao cho với mọi $x$ thỏa $0 < |x - 1| < \\delta$ thì $\\left| \\frac{2 - x}{x} - 1 \\right| < \\varepsilon$.\nXét hiệu:\n$$\n\\left| \\frac{2 - x}{x} - 1 \\right| = \\left| \\frac{2 - 2x}{x} \\right| = \\frac{2|x - 1|}{|x|}\n$$\nChọn $\\delta_1 = \\frac{1}{2}$. Khi đó nếu $|x - 1| < \\frac{1}{2}$, ta có:\n$$\n1 - \\frac{1}{2} < x < 1 + \\frac{1}{2} \\implies \\frac{1}{2} < x < \\frac{3}{2} \\implies |x| > \\frac{1}{2} \\implies \\frac{1}{|x|} < 2\n$$\nKhi đó:\n$$\n\\frac{2|x - 1|}{|x|} < 2 \\cdot 2 |x - 1| = 4 |x - 1|\n$$\nĐể $4 |x - 1| < \\varepsilon$, ta chỉ cần chọn $|x - 1| < \\frac{\\varepsilon}{4}$.\nĐặt $\\delta = \\min\\left( \\frac{1}{2}, \\frac{\\varepsilon}{4} \\right) > 0$.\nKhi $0 < |x - 1| < \\delta$, ta có:\n$$\n\\left| \\frac{2 - x}{x} - 1 \\right| < 4 |x - 1| < 4 \\cdot \\frac{\\varepsilon}{4} = \\varepsilon\n$$\nTheo định nghĩa giới hạn, $\\lim_{x \\to 1} \\frac{2 - x}{x} = 1$.',
      },
      {
        id: 'exam-2021-b4',
        number: 1.0,
        points: 1.0,
        title: 'Định lý Giá trị Trung gian và Số nghiệm Phương trình',
        statement:
          'Chứng minh rằng phương trình sau có ít nhất hai nghiệm dương:\n$$\n\\cos\\left((x^2 + x + 1)\\pi\\right) = (1 - 2x)^2\n$$',
        hint: 'Xét hàm f(x) = (1 - 2x)^2 - cos((x^2 + x + 1)pi) và tính dấu tại 0, 1/2, và 1.',
        solution:
          'Xét hàm số $f(x) = (1 - 2x)^2 - \\cos\\left((x^2 + x + 1)\\pi\\right)$ trên $[0; +\\infty)$. Hàm số $f(x)$ liên tục trên $\\mathbb{R}$.\nTa tính giá trị của $f(x)$ tại các điểm $x = 0$, $x = 1/2$ và $x = 1$:\n- Tại $x = 0$: $f(0) = (1 - 0)^2 - \\cos(\\pi) = 1 - (-1) = 2 > 0$.\n- Tại $x = 1/2$:\n  $$\n  x^2 + x + 1 = \\frac{1}{4} + \\frac{1}{2} + 1 = \\frac{7}{4}\n  $$\n  $$\n  f(1/2) = (1 - 1)^2 - \\cos\\left(\\frac{7\\pi}{4}\\right) = 0 - \\cos\\left(2\\pi - \\frac{\\pi}{4}\\right) = -\\cos\\left(\\frac{\\pi}{4}\\right) = -\\frac{\\sqrt{2}}{2} < 0\n  $$\n- Tại $x = 1$:\n  $$\n  f(1) = (1 - 2)^2 - \\cos(3\\pi) = (-1)^2 - (-1) = 1 + 1 = 2 > 0\n  $$\nÁp dụng định lý Bolzano - Cauchy:\n1. Vì $f(0) > 0$ và $f(1/2) < 0$, tồn tại ít nhất một nghiệm dương $c_1 \\in (0; 1/2)$.\n2. Vì $f(1/2) < 0$ và $f(1) > 0$, tồn tại ít nhất một nghiệm dương $c_2 \\in (1/2; 1)$.\n\nVì hai khoảng $(0; 1/2)$ và $(1/2; 1)$ rời nhau nên $c_1 \\neq c_2$.\nVậy phương trình có ít nhất hai nghiệm dương.',
      },
      {
        id: 'exam-2021-b5',
        number: 5,
        points: 2.0,
        title: 'Tính Liên tục Đều và Giới hạn Dạng Mũ',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Cho hàm số $f(x) = x^2$. Chứng minh $f(x)$ liên tục đều trên $[0; A]$ với mọi $A > 0$, nhưng không liên tục đều trên $[0; +\\infty)$.',
            hint: "Dùng định lý Cantor cho đoạn đóng [0; A], và dùng 2 dãy số x_n = n, x'_n = n + 1/n cho nửa khoảng vô hạn.",
            solution:
              "**1. Trên đoạn đóng $[0; A]$:**\nVới $A > 0$ bất kỳ, đoạn $[0; A]$ là một đoạn đóng và bị chặn. Hàm số $f(x) = x^2$ liên tục trên $[0; A]$.\nTheo **Định lý Cantor**, mọi hàm số liên tục trên đoạn đóng đều liên tục đều trên đoạn đó. Do đó $f(x) = x^2$ liên tục đều trên $[0; A]$.\n\n**2. Trên nửa khoảng $[0; +\\infty)$:**\nChọn hai dãy số $x_n = n$ và $x_n' = n + \\frac{1}{n}$ ($n \\in \\mathbb{N}^*$) thuộc $[0; +\\infty)$.\nTa có $|x_n' - x_n| = \\frac{1}{n} \\to 0$ khi $n \\to \\infty$.\nXét hiệu giá trị hàm:\n$$\n|f(x_n') - f(x_n)| = \\left(n + \\frac{1}{n}\\right)^2 - n^2 = 2 + \\frac{1}{n^2} > 2, \\quad \\forall n \\ge 1\n$$\nChọn $\\varepsilon_0 = 1 > 0$. Với mọi $n \\ge 1$, ta có $|x_n' - x_n| \\to 0$ nhưng $|f(x_n') - f(x_n)| \\ge 1$.\nTheo đặc trưng phủ định, hàm số $f(x) = x^2$ không liên tục đều trên $[0; +\\infty)$.",
          },
          {
            label: 'b',
            points: 1.0,
            statement: 'Tính giới hạn: $\\lim_{x \\to 0^+} (\\sqrt{x})^x$.',
            hint: 'Dạng 0^0, chuyển về dạng e^(x ln(\\sqrt{x})) = e^(1/2 * x ln x).',
            solution:
              "Biểu thức có dạng vô định $0^0$ khi $x \\to 0^+$.\nBiến đổi hàm số về dạng hàm mũ:\n$$\n(\\sqrt{x})^x = e^{x \\ln(\\sqrt{x})} = e^{\\frac{1}{2} x \\ln x}\n$$\nXét giới hạn của số mũ:\n$$\n\\lim_{x \\to 0^+} (x \\ln x) = \\lim_{x \\to 0^+} \\frac{\\ln x}{1/x}\n$$\nÁp dụng quy tắc L'Hôpital (dạng $\\infty/\\infty$):\n$$\n\\lim_{x \\to 0^+} \\frac{1/x}{-1/x^2} = \\lim_{x \\to 0^+} (-x) = 0\n$$\nDo đó $\\lim_{x \\to 0^+} \\left( \\frac{1}{2} x \\ln x \\right) = \\frac{1}{2} \\cdot 0 = 0$.\nVì hàm số $e^u$ liên tục tại $u = 0$, ta có:\n$$\n\\lim_{x \\to 0^+} (\\sqrt{x})^x = e^0 = 1\n$$",
          },
        ],
      },
      {
        id: 'exam-2021-b6',
        number: 6,
        points: 1.5,
        title: 'Đạo hàm Tích phân theo Cận trên Leibniz và Cực trị',
        parts: [
          {
            label: 'a',
            points: 0.75,
            statement: "Cho hàm số $f(x) = \\int_0^{x^2} e^{t^2}(1 - t) dt$. Tính đạo hàm $f'(x)$.",
            hint: "Áp dụng công thức Leibniz: d/dx \\int_0^u(x) g(t) dt = g(u(x)) * u'(x).",
            solution:
              "Hàm số dưới dấu tích phân $g(t) = e^{t^2}(1 - t)$ liên tục trên $\\mathbb{R}$ và cận trên là hàm khả vi $u(x) = x^2$.\nÁp dụng công thức đạo hàm của tích phân theo cận trên:\n$$\nf'(x) = g(u(x)) \\cdot u'(x) = e^{(x^2)^2}(1 - x^2) \\cdot (x^2)' = e^{x^4}(1 - x^2) \\cdot 2x = 2x(1 - x^2) e^{x^4}\n$$",
          },
          {
            label: 'b',
            points: 0.75,
            statement: 'Tìm điểm $x_0 \\in [0; 2]$ mà tại đó hàm số $f(x)$ đạt giá trị lớn nhất.',
            hint: "Xét dấu của f'(x) = 2x(1 - x^2)e^(x^4) trên [0; 2].",
            solution:
              "Xét phương trình $f'(x) = 0$ trên $[0; 2]$:\n$$\n2x(1 - x^2) e^{x^4} = 0 \\iff x = 0 \\quad \\text{hoặc} \\quad x^2 = 1 \\implies x = 1 \\quad (\\text{do } x \\in [0; 2])\n$$\nXét dấu của $f'(x)$ trên $[0; 2]$:\n- Với $x \\in (0; 1)$: $2x > 0, 1 - x^2 > 0, e^{x^4} > 0 \\implies f'(x) > 0$. Hàm số đồng biến.\n- Với $x \\in (1; 2)$: $2x > 0, 1 - x^2 < 0, e^{x^4} > 0 \\implies f'(x) < 0$. Hàm số nghịch biến.\nBảng biến thiên cho thấy hàm số tăng từ 0 đến 1 và giảm từ 1 đến 2.\nDo đó hàm số đạt giá trị lớn nhất trên đoạn $[0; 2]$ tại điểm $x_0 = 1$.",
          },
        ],
      },
      {
        id: 'exam-2021-b7',
        number: 7,
        points: 1.0,
        title: 'Tính Tích phân Suy rộng',
        statement: 'Tính tích phân suy rộng:\n$$\nI = \\int_0^{+\\infty} x e^{-x} dx\n$$',
        hint: 'Tích phân từng phần với u = x, dv = e^(-x) dx.',
        solution:
          "Tích phân suy rộng có cận vô hạn: $I = \\lim_{B \\to +\\infty} \\int_0^B x e^{-x} dx$.\nÁp dụng tích phân từng phần: đặt $u = x \\implies du = dx$, $dv = e^{-x}dx \\implies v = -e^{-x}$:\n$$\n\\int x e^{-x} dx = -x e^{-x} - \\int (-e^{-x}) dx = -x e^{-x} - e^{-x} = -(x + 1) e^{-x}\n$$\nThế cận từ 0 đến $B$:\n$$\n\\int_0^B x e^{-x} dx = \\left[ -(x + 1) e^{-x} \\right]_0^B = -(B + 1) e^{-B} - [-(0 + 1) e^0] = 1 - \\frac{B + 1}{e^B}\n$$\nLấy giới hạn khi $B \\to +\\infty$:\n$$\n\\lim_{B \\to +\\infty} \\frac{B + 1}{e^B} = 0 \\quad (\\text{theo quy tắc L'Hôpital})\n$$\nDo đó $I = 1 - 0 = 1$. Tích phân suy rộng hội tụ và có giá trị bằng 1.",
      },
      {
        id: 'exam-2021-b8',
        number: 8,
        points: 1.5,
        title: 'Miền Hội tụ của Chuỗi Lũy thừa',
        statement:
          'Tìm miền hội tụ của chuỗi lũy thừa:\n$$\n\\sum_{n=2}^{+\\infty} \\frac{x^{2n}}{n \\ln n}\n$$',
        hint: 'Đặt t = x^2, tìm bán kính hội tụ, và xét tại hai đầu mút bằng dấu hiệu tích phân.',
        solution:
          'Đặt $t = x^2 \\ge 0$. Chuỗi trở thành chuỗi lũy thừa $\\sum_{n=2}^{+\\infty} a_n t^n$ với $a_n = \\frac{1}{n \\ln n}$.\nBán kính hội tụ theo biến $t$:\n$$\nR_t = \\lim_{n \\to \\infty} \\frac{a_n}{a_{n+1}} = \\lim_{n \\to \\infty} \\frac{(n+1)\\ln(n+1)}{n \\ln n} = \\lim_{n \\to \\infty} \\left(1 + \\frac{1}{n}\\right) \\cdot \\frac{\\ln n + \\ln(1 + 1/n)}{\\ln n} = 1\n$$\nDo đó chuỗi hội tụ khi $|t| < 1 \\iff x^2 < 1 \\iff x \\in (-1; 1)$.\n\n**Xét tại các đầu mút $x = \\pm 1$:**\nKhi $x = \\pm 1$, ta có $x^{2n} = ((\\pm 1)^2)^n = 1^n = 1$. Chuỗi trở thành:\n$$\n\\sum_{n=2}^{+\\infty} \\frac{1}{n \\ln n}\n$$\nXét hàm số $f(u) = \\frac{1}{u \\ln u}$ liên tục, dương và giảm trên $[2; +\\infty)$. Tích phân suy rộng:\n$$\n\\int_2^{+\\infty} \\frac{du}{u \\ln u} = \\int_{\\ln 2}^{+\\infty} \\frac{dv}{v} = [\\ln v]_{\\ln 2}^{+\\infty} = +\\infty\n$$\nTích phân phân kỳ, theo Dấu hiệu tích phân Maclaurin - Cauchy, chuỗi số phân kỳ tại $x = \\pm 1$.\n\n**Kết luận:** Miền hội tụ của chuỗi lũy thừa là khoảng mở $D = (-1; 1)$.',
      },
    ],
  },

  // =========================================================================
  // ĐỀ 4: NĂM HỌC 2020-2021 - HỌC KỲ I (120 PHÚT)
  // =========================================================================
  {
    id: 'exam-2020-2021-hk1',
    year: '2020-2021',
    semester: 'Học kỳ I',
    durationMinutes: 120,
    title: 'Đề thi Kết thúc Học phần Giải tích hàm một biến — Năm học 2020-2021 (HK1)',
    description:
      'Đề thi chính thức học kỳ 1 năm học 2020-2021 (thời gian làm bài: 120 phút). Gồm 10 bài toán phân loại cao: sup/inf tập phân số đan dấu, Tiêu chuẩn Cauchy chuỗi arcsin, Dãy số truy hồi tổng phân kỳ, Định nghĩa epsilon-delta giới hạn bậc hai, Nghiệm duy nhất phương trình siêu việt, Hàm lồi bị chặn trên là hàm hằng, Khai triển Maclaurin ln, Tích phân hình phẳng, Tích phân suy rộng và Tính tổng chuỗi hàm x^(2n)/n.',
    originalImagePath: '/docs/giai-tich-ham-mot-bien/exams/de-2020-2021-hk1.png',
    problems: [
      {
        id: 'exam-2020-2021-b1',
        number: 1,
        points: 1.0,
        title: 'Cận trên và Cận dưới Tập Đan dấu',
        statement:
          'Tìm $\\inf A, \\sup A, \\min A, \\max A$ của tập hợp:\n$$\nA = \\left\\{ \\frac{2n + (-1)^n}{n} : n \\in \\mathbb{N}^* \\right\\}\n$$',
        hint: 'Tách A thành hai dãy con ứng với n chẵn và n lẻ.',
        solution:
          'Ta viết lại số hạng của tập hợp: $a_n = 2 + \\frac{(-1)^n}{n}$.\n- Với $n$ lẻ ($n = 2k - 1$): $a_{2k-1} = 2 - \\frac{1}{2k-1}$. Khi $k$ tăng, giá trị tăng dần từ $a_1 = 2 - 1 = 1$.\n  Giá trị nhỏ nhất của tập hợp đạt tại $n = 1$: $\\min A = 1$.\n- Với $n$ chẵn ($n = 2k$): $a_{2k} = 2 + \\frac{1}{2k}$. Khi $k$ tăng, giá trị giảm dần từ $a_2 = 2 + \\frac{1}{2} = \\frac{5}{2}$.\n  Giá trị lớn nhất của tập hợp đạt tại $n = 2$: $\\max A = \\frac{5}{2}$.\n\n**Kết luận:** $\\inf A = \\min A = 1$; $\\sup A = \\max A = \\frac{5}{2}$.',
      },
      {
        id: 'exam-2020-2021-b2',
        number: 2,
        points: 1.0,
        title: 'Tiêu chuẩn Cauchy Khảo sát Chuỗi số',
        statement:
          'Dùng tiêu chuẩn Cauchy, chứng minh chuỗi số sau hội tụ:\n$$\n\\sum_{n=1}^\\infty \\frac{\\arcsin(1/n)}{n^2}\n$$',
        hint: 'Dùng bất đẳng thức arcsin(x) <= pi/2 * x với x in [0; 1] để chặn arcsin(1/n) <= pi/(2n).',
        solution:
          'Với $x \\in [0; 1]$, hàm số $\\frac{\\arcsin x}{x}$ tăng từ 1 đến $\\pi/2$, do đó $\\arcsin(1/n) \\le \\frac{\\pi}{2n} < 2$ với mọi $n \\ge 1$.\nXét tổng đoạn từ $n+1$ đến $n+p$:\n$$\n\\sum_{k=n+1}^{n+p} \\frac{\\arcsin(1/k)}{k^2} < \\sum_{k=n+1}^{n+p} \\frac{2}{k^2} < 2 \\sum_{k=n+1}^{n+p} \\frac{1}{k(k-1)} = 2 \\left( \\frac{1}{n} - \\frac{1}{n+p} \\right) < \\frac{2}{n}\n$$\nVới mọi $\\varepsilon > 0$, chọn $N = [2/\\varepsilon] + 1$. Khi đó với mọi $n \\ge N$ và mọi $p \\ge 1$, ta có tổng đoạn bé hơn $\\frac{2}{n} \\le \\frac{2}{N} < \\varepsilon$.\nTheo tiêu chuẩn Cauchy, chuỗi số hội tụ.',
      },
      {
        id: 'exam-2020-2021-b3',
        number: 3,
        points: 1.0,
        title: 'Dãy số Truy hồi Phân kỳ về Vô cực',
        statement:
          'Cho dãy số $(x_n)$ xác định bởi $x_1 = 1$ và $x_{n+1} = x_n + \\frac{n+1}{n}$ với mọi $n \\ge 1$. Chứng minh $\\lim_{n \\to \\infty} x_n = +\\infty$.',
        hint: 'Cộng liên tiếp: x_n = x_1 + sum_{k=1}^{n-1} (1 + 1/k) và dùng tính phân kỳ của chuỗi điều hòa.',
        solution:
          'Ta có $x_{k+1} - x_k = 1 + \\frac{1}{k}$. Lấy tổng từ $k = 1$ đến $n - 1$:\n$$\nx_n - x_1 = \\sum_{k=1}^{n-1} \\left( 1 + \\frac{1}{k} \\right) = (n - 1) + \\sum_{k=1}^{n-1} \\frac{1}{k}\n$$\nSuy ra $x_n = n + \\sum_{k=1}^{n-1} \\frac{1}{k} > n$.\nVì $\\lim_{n \\to \\infty} n = +\\infty$, theo nguyên lý so sánh giới hạn, ta có $\\lim_{n \\to \\infty} x_n = +\\infty$.',
      },
      {
        id: 'exam-2020-2021-b4',
        number: 1.0,
        points: 1.0,
        title: 'Chứng minh Giới hạn Bậc hai bằng Epsilon - Delta',
        statement:
          'Dùng định nghĩa $\\varepsilon - \\delta$, chứng minh rằng:\n$$\n\\lim_{x \\to 2} (x^2 - 3x + 1) = -1\n$$',
        hint: 'Biến đổi |(x^2 - 3x + 1) - (-1)| = |x^2 - 3x + 2| = |x - 2| * |x - 1|.',
        solution:
          'Xét hiệu: $|(x^2 - 3x + 1) - (-1)| = |x^2 - 3x + 2| = |x - 2| \\cdot |x - 1|$.\nChọn $\\delta_1 = 1$. Khi $|x - 2| < 1$, ta có $1 < x < 3 \\implies 0 < x - 1 < 2 \\implies |x - 1| < 2$.\nKhi đó: $|x^2 - 3x + 2| < 2 |x - 2|$.\nVới mọi $\\varepsilon > 0$, chọn $\\delta = \\min(1, \\varepsilon/2)$. Khi $0 < |x - 2| < \\delta$, ta có:\n$$\n|(x^2 - 3x + 1) - (-1)| < 2 |x - 2| < 2 \\cdot \\frac{\\varepsilon}{2} = \\varepsilon\n$$\nVậy $\\lim_{x \\to 2} (x^2 - 3x + 1) = -1$.',
      },
      {
        id: 'exam-2020-2021-b5',
        number: 5,
        points: 1.0,
        title: 'Sự Tồn tại và Duy nhất Nghiệm Thực',
        statement: 'Chứng minh phương trình $x \\cdot 2^x = 1$ có đúng một nghiệm thực dương.',
        hint: 'Khảo sát f(x) = x * 2^x - 1 trên [0; +inf) chứng minh đơn điệu tăng ngặt.',
        solution:
          "Xét hàm số $f(x) = x \\cdot 2^x - 1$ trên $[0; +\\infty)$.\n- Tính liên tục: $f(x)$ liên tục trên $[0; +\\infty)$.\n- Đổi dấu: $f(0) = -1 < 0$ và $f(1) = 1 \\cdot 2^1 - 1 = 1 > 0$. Theo định lý Bolzano - Cauchy, tồn tại ít nhất một nghiệm $c \\in (0; 1)$.\n- Tính đơn điệu: Đạo hàm $f'(x) = 2^x + x 2^x \\ln 2 = 2^x(1 + x \\ln 2) > 0$ với mọi $x \\ge 0$.\nVì $f'(x) > 0$, hàm số $f(x)$ đồng biến nghiêm ngặt trên $[0; +\\infty)$, do đó phương trình có không quá một nghiệm.\n\n**Kết luận:** Phương trình $x \\cdot 2^x = 1$ có duy nhất một nghiệm thực dương.",
      },
      {
        id: 'exam-2020-2021-b6',
        number: 6,
        points: 1.0,
        title: 'Hàm Lồi Bị chặn trên là Hàm Hằng',
        statement:
          "Cho hàm số $f \\in C^2(\\mathbb{R})$ thỏa mãn $f''(x) \\ge 0$ với mọi $x \\in \\mathbb{R}$ và $f(x)$ bị chặn trên. Chứng minh rằng $f(x)$ là hàm hằng.",
        hint: "Dùng tiếp tuyến: f(x) >= f(x_0) + f'(x_0)(x - x_0). Nếu tồn tại f'(x_0) != 0 thì vế phải tiến ra vô cực, mâu thuẫn tính bị chặn.",
        solution:
          "Vì $f''(x) \\ge 0$ với mọi $x \\in \\mathbb{R}$, hàm số $f$ là hàm lồi trên $\\mathbb{R}$.\nTheo tính chất tiếp tuyến của hàm lồi, với mọi $x_0, x \\in \\mathbb{R}$, ta luôn có:\n$$\nf(x) \\ge f(x_0) + f'(x_0)(x - x_0)\n$$\nGiả sử phản chứng rằng tồn tại $x_0$ sao cho $f'(x_0) \\neq 0$:\n- Nếu $f'(x_0) > 0$: khi $x \\to +\\infty$, ta có $f(x_0) + f'(x_0)(x - x_0) \\to +\\infty$, suy ra $\\lim_{x \\to +\\infty} f(x) = +\\infty$, mâu thuẫn với giả thiết $f$ bị chặn trên.\n- Nếu $f'(x_0) < 0$: khi $x \\to -\\infty$, ta có $f(x_0) + f'(x_0)(x - x_0) \\to +\\infty$, suy ra $\\lim_{x \\to -\\infty} f(x) = +\\infty$, mâu thuẫn với giả thiết $f$ bị chặn trên.\nDo đó ta bắt buộc phải có $f'(x_0) = 0$ với mọi $x_0 \\in \\mathbb{R}$.\nĐạo hàm triệt tiêu trên toàn $\\mathbb{R}$ kéo theo $f(x) \\equiv C$ (hàm hằng).",
      },
      {
        id: 'exam-2020-2021-b7',
        number: 7,
        points: 1.0,
        title: 'Khai triển Maclaurin của Hàm Logarit Đa thức',
        statement:
          'Tìm khai triển Maclaurin của $f(x) = \\ln(1 + x - 2x^2)$ đến cấp 4 và tính $f^{(4)}(0)$.',
        hint: 'Phân tích 1 + x - 2x^2 = (1 - x)(1 + 2x), tách thành ln(1 - x) + ln(1 + 2x).',
        solution:
          'Ta có $1 + x - 2x^2 = (1 - x)(1 + 2x)$. Với $x$ đủ nhỏ gần 0:\n$$\nf(x) = \\ln(1 - x) + \\ln(1 + 2x)\n$$\nÁp dụng khai triển $\\ln(1 + u) = u - \\frac{u^2}{2} + \\frac{u^3}{3} - \\frac{u^4}{4} + o(u^4)$:\n1. $\\ln(1 - x) = -x - \\frac{x^2}{2} - \\frac{x^3}{3} - \\frac{x^4}{4} + o(x^4)$\n2. $\\ln(1 + 2x) = 2x - \\frac{(2x)^2}{2} + \\frac{(2x)^3}{3} - \\frac{(2x)^4}{4} + o(x^4) = 2x - 2x^2 + \\frac{8x^3}{3} - 4x^4 + o(x^4)$\n\nCộng hai biểu thức lại:\n$$\nf(x) = x - \\frac{5}{2} x^2 + \\frac{7}{3} x^3 - \\frac{17}{4} x^4 + o(x^4)\n$$\nHệ số của $x^4$ là $\\frac{f^{(4)}(0)}{4!} = -\\frac{17}{4} \\implies f^{(4)}(0) = -\\frac{17}{4} \\cdot 24 = -102$.',
      },
      {
        id: 'exam-2020-2021-b8',
        number: 8,
        points: 1.0,
        title: 'Ứng dụng Tích phân Tính Diện tích Hình phẳng',
        statement:
          'Tính diện tích hình phẳng giới hạn bởi parabol $y = x^2 - 4x + 3$ và trục hoành $y = 0$.',
        hint: 'Tìm nghiệm x^2 - 4x + 3 = 0 => x = 1, x = 3. Diện tích S = \\int_1^3 -(x^2 - 4x + 3) dx.',
        solution:
          'Phương trình hoành độ giao điểm: $x^2 - 4x + 3 = 0 \\iff x = 1$ hoặc $x = 3$.\nTrên đoạn $[1; 3]$, parabol nằm dưới trục hoành ($x^2 - 4x + 3 \\le 0$).\nDiện tích hình phẳng là:\n$$\nS = \\int_1^3 |x^2 - 4x + 3| dx = \\int_1^3 (4x - x^2 - 3) dx = \\left[ 2x^2 - \\frac{x^3}{3} - 3x \\right]_1^3\n$$\nThế cận:\n- Tại $x = 3$: $2(9) - 9 - 9 = 0$.\n- Tại $x = 1$: $2(1) - \\frac{1}{3} - 3 = -\\frac{4}{3}$.\nDo đó $S = 0 - \\left(-\\frac{4}{3}\\right) = \\frac{4}{3}$ (đơn vị diện tích).',
      },
      {
        id: 'exam-2020-2021-b9',
        number: 9,
        points: 1.0,
        title: 'Khảo sát Sự Hội tụ của Tích phân Suy rộng',
        statement:
          'Xét sự hội tụ của tích phân suy rộng:\n$$\nI = \\int_0^{+\\infty} \\frac{\\arctan x}{x \\sqrt{1 + x^3}} dx\n$$',
        hint: 'Tách tại 1: khi x -> 0, arctan x ~ x => hàm ~ 1; khi x -> inf, hàm ~ (pi/2) / x^(5/2).',
        solution:
          'Chia tích phân thành hai phần: $I = I_1 + I_2 = \\int_0^1 + \\int_1^{+\\infty}$.\n1. Tại $x \\to 0^+$: $\\arctan x \\sim x$, do đó:\n   $$\n   \\frac{\\arctan x}{x \\sqrt{1 + x^3}} \\sim \\frac{x}{x \\cdot 1} = 1\n   $$\n   Hàm số có giới hạn hữu hạn tại $0^+$, không có điểm kỳ dị thực sự. $I_1$ hội tụ.\n2. Tại $x \\to +\\infty$: $\\arctan x \\to \\frac{\\pi}{2}$ và $\\sqrt{1 + x^3} \\sim x^{3/2}$. Do đó:\n   $$\n   \\frac{\\arctan x}{x \\sqrt{1 + x^3}} \\sim \\frac{\\pi/2}{x \\cdot x^{3/2}} = \\frac{\\pi/2}{x^{5/2}}\n   $$\n   Vì tích phân $\\int_1^{+\\infty} \\frac{dx}{x^{5/2}}$ hội tụ ($p = 5/2 > 1$), $I_2$ hội tụ theo tiêu chuẩn so sánh giới hạn.\n\n**Kết luận:** Tích phân suy rộng $I$ hội tụ.',
      },
      {
        id: 'exam-2020-2021-b10',
        number: 10,
        points: 1.0,
        title: 'Tìm Miền Hội tụ và Tính Tổng Chuỗi Hàm',
        statement:
          'Tìm miền hội tụ và tính tổng của chuỗi hàm:\n$$\nS(x) = \\sum_{n=1}^{+\\infty} \\frac{x^{2n}}{n}\n$$',
        hint: 'Đặt t = x^2, dùng chuỗi ln(1 - t) = -sum t^n / n.',
        solution:
          'Đặt $t = x^2$. Chuỗi trở thành $\\sum_{n=1}^{+\\infty} \\frac{t^n}{n}$. Bán kính hội tụ theo biến $t$ là $R_t = 1$.\n- Tại $t = 1 \\iff x = \\pm 1$: chuỗi $\\sum \\frac{1}{n}$ phân kỳ.\n- Tại $t = -1$: không xảy ra vì $t = x^2 \\ge 0$.\nVậy miền hội tụ là $x^2 < 1 \\iff D = (-1; 1)$.\nVới $|x| < 1$, từ khai triển Maclaurin của $\\ln(1 - t) = -\\sum_{n=1}^{+\\infty} \\frac{t^n}{n}$, ta có:\n$$\nS(x) = \\sum_{n=1}^{+\\infty} \\frac{(x^2)^n}{n} = -\\ln(1 - x^2)\n$$\n\n**Kết luận:** Miền hội tụ $D = (-1; 1)$ và tổng là $S(x) = -\\ln(1 - x^2)$.',
      },
    ],
  },

  // =========================================================================
  // ĐỀ 5: NĂM HỌC 2019-2020 - HỌC KỲ I (120 PHÚT)
  // =========================================================================
  {
    id: 'exam-2019-2020-hk1',
    year: '2019-2020',
    semester: 'Học kỳ I',
    durationMinutes: 120,
    title: 'Đề thi Kết thúc Học phần Giải tích hàm một biến — Năm học 2019-2020 (HK1)',
    description:
      'Đề thi chính thức học kỳ 1 năm học 2019-2020 (thời gian làm bài: 120 phút) gồm 7 bài toán lớn: sup/inf dãy hàm số logarit, Bài toán kinh điển nhà sư leo núi, Bất đẳng thức hàm mũ đa biến, Khai triển Taylor xấp xỉ sai số căn bậc hai, Điểm bất động giá trị trung bình tích phân, Tích phân suy rộng Euler-Poisson và Chứng minh hội tụ đều Weierstrass.',
    originalImagePath: '/docs/giai-tich-ham-mot-bien/exams/de-2019-2020-hk1.png',
    problems: [
      {
        id: 'exam-2019-2020-b1',
        number: 1,
        points: 1.5,
        title: 'Cận trên và Cận dưới Dãy Logarit',
        statement:
          'Tìm $\\sup A, \\inf A, \\max A, \\min A$ với tập hợp:\n$$\nA = \\left\\{ \\frac{\\ln(1 + n)}{n} : n \\in \\mathbb{N}^* \\right\\}\n$$',
        hint: "Khảo sát f(x) = ln(1+x)/x trên [1; +inf), f'(x) = [x/(x+1) - ln(1+x)] / x^2 < 0.",
        solution:
          "Xét hàm số $f(x) = \\frac{\\ln(1 + x)}{x}$ trên $[1; +\\infty)$. Đạo hàm:\n$$\nf'(x) = \\frac{\\frac{x}{1 + x} - \\ln(1 + x)}{x^2}\n$$\nĐặt $h(x) = \\frac{x}{1 + x} - \\ln(1 + x)$. Ta có $h(0) = 0$ và $h'(x) = \\frac{1}{(1+x)^2} - \\frac{1}{1+x} = -\\frac{x}{(1+x)^2} < 0$ với mọi $x > 0$.\nDo đó $h(x) < 0$ với mọi $x \\ge 1$, kéo theo $f'(x) < 0$.\nHàm số $f(x)$ nghịch biến trên $[1; +\\infty)$, do đó dãy $a_n = \\frac{\\ln(1+n)}{n}$ giảm nghiêm ngặt.\n- $\\max A = \\sup A = a_1 = \\ln 2$.\n- Vì $a_n > 0$ và $\\lim_{n \\to \\infty} a_n = 0$, ta có $\\inf A = 0$. Không tồn tại $\\min A$.\n\n**Kết luận:** $\\sup A = \\max A = \\ln 2$; $\\inf A = 0$; không có $\\min A$.",
      },
      {
        id: 'exam-2019-2020-b2',
        number: 2,
        points: 1.5,
        title: 'Bài toán Nhà sư Leo núi (Định lý Bolzano - Cauchy)',
        statement:
          'Một nhà sư bắt đầu leo núi lúc 6 giờ sáng và đến đỉnh núi lúc 6 giờ chiều cùng ngày. Sáng hôm sau, ông bắt đầu đi xuống từ đỉnh núi lúc 6 giờ sáng theo con đường cũ và đến chân núi lúc 6 giờ chiều. Chứng minh rằng tồn tại ít nhất một thời điểm trong ngày mà ở cả hai ngày, nhà sư có mặt tại cùng một vị trí trên con đường.',
        hint: 'Chuẩn hóa thời gian t in [0; 12]. Gọi s_1(t) là quãng đường ngày 1, s_2(t) là quãng đường ngày 2. Xét h(t) = s_1(t) - s_2(t).',
        solution:
          'Gọi $L > 0$ là tổng chiều dài con đường từ chân núi lên đỉnh núi.\nChuẩn hóa thang thời gian $t \\in [0; 12]$ (với $t = 0$ ứng với 6 giờ sáng, $t = 12$ ứng với 6 giờ chiều):\n- Gọi $s_1(t)$ là khoảng cách từ chân núi đến vị trí của nhà sư tại thời điểm $t$ trong ngày thứ nhất. Hàm $s_1(t)$ liên tục trên $[0; 12]$, thỏa mãn $s_1(0) = 0$ và $s_1(12) = L$.\n- Gọi $s_2(t)$ là khoảng cách từ chân núi đến vị trí của nhà sư tại thời điểm $t$ trong ngày thứ hai. Hàm $s_2(t)$ liên tục trên $[0; 12]$, thỏa mãn $s_2(0) = L$ và $s_2(12) = 0$.\n\nXét hàm số hiệu $h(t) = s_1(t) - s_2(t)$ trên đoạn $[0; 12]$.\n1. Vì $s_1(t)$ và $s_2(t)$ liên tục nên $h(t)$ liên tục trên $[0; 12]$.\n2. Giá trị tại hai đầu mút:\n   - $h(0) = s_1(0) - s_2(0) = 0 - L = -L < 0$.\n   - $h(12) = s_1(12) - s_2(12) = L - 0 = L > 0$.\n3. Theo **Định lý giá trị trung gian Bolzano - Cauchy**, tồn tại ít nhất một thời điểm $t_0 \\in (0; 12)$ sao cho:\n   $$\n   h(t_0) = 0 \\iff s_1(t_0) = s_2(t_0)\n   $$\nĐiều này chứng minh tại thời điểm $t_0$ (tương ứng với $6 + t_0$ giờ), nhà sư ở cùng một vị trí trên đường trong cả hai ngày.',
      },
      {
        id: 'exam-2019-2020-b3',
        number: 3,
        points: 1.5,
        title: 'Bất đẳng thức Hàm Mũ Đa biến',
        statement:
          'Chứng minh rằng với mọi số thực dương $x, y > 0$, ta luôn có:\n$$\ne^{x + y} \\ge e^2 x y\n$$\nDấu đẳng thức xảy ra khi nào?',
        hint: 'Dùng bất đẳng thức cơ bản e^u >= e * u với mọi u > 0, áp dụng cho u = x và u = y.',
        solution:
          "Xét hàm số $g(u) = e^u - e \\cdot u$ trên $(0; +\\infty)$.\nĐạo hàm $g'(u) = e^u - e$. Ta có $g'(u) = 0 \\iff u = 1$.\nBảng biến thiên cho thấy $g(u)$ đạt giá trị nhỏ nhất tại $u = 1$:\n$$\ng(u) \\ge g(1) = e^1 - e \\cdot 1 = 0, \\quad \\forall u > 0\n$$\nDo đó $e^u \\ge e \\cdot u$ với mọi $u > 0$. Dấu đẳng thức xảy ra khi và chỉ khi $u = 1$.\n\nÁp dụng bất đẳng thức này lần lượt cho $x > 0$ và $y > 0$:\n$$\ne^x \\ge e \\cdot x \\quad \\text{và} \\quad e^y \\ge e \\cdot y\n$$\nVì cả hai vế đều dương, nhân hai bất đẳng thức vế theo vế:\n$$\ne^{x + y} = e^x \\cdot e^y \\ge (e \\cdot x)(e \\cdot y) = e^2 x y\n$$\nDấu đẳng thức xảy ra khi và chỉ khi đồng thời $x = 1$ và $y = 1$.\nBất đẳng thức được chứng minh hoàn tất.",
      },
      {
        id: 'exam-2019-2020-b4',
        number: 4,
        points: 1.5,
        title: 'Khai triển Taylor và Ước lượng Sai số Tính gần đúng',
        statement:
          'Viết công thức khai triển Taylor của hàm số $f(x) = \\sqrt{x}$ tại lân cận $x_0 = 4$ đến cấp 2 với phần dư dạng Lagrange. Áp dụng tính gần đúng $\\sqrt{4.2}$ và ước lượng sai số.',
        hint: "f(4) = 2, f'(4) = 1/4, f''(4) = -1/32, f'''(xi) = 3/(8 xi^(5/2)).",
        solution:
          "**Bước 1: Tính các đạo hàm:**\n$f(x) = x^{1/2} \\implies f(4) = 2$.\n$f'(x) = \\frac{1}{2\\sqrt{x}} \\implies f'(4) = \\frac{1}{4}$.\n$f''(x) = -\\frac{1}{4x^{3/2}} \\implies f''(4) = -\\frac{1}{32}$.\n$f'''(x) = \\frac{3}{8x^{5/2}}$.\n\n**Bước 2: Khai triển Taylor cấp 2 tại $x_0 = 4$:**\n$$\n\\sqrt{x} = 2 + \\frac{1}{4}(x - 4) - \\frac{1}{64}(x - 4)^2 + \\frac{f'''(\\xi)}{6}(x - 4)^3\n$$\nvới $\\xi$ nằm giữa 4 và $x$.\n\n**Bước 3: Tính gần đúng $\\sqrt{4.2}$ với $x - 4 = 0.2$:**\n$$\n\\sqrt{4.2} \\approx 2 + \\frac{1}{4}(0.2) - \\frac{1}{64}(0.2)^2 = 2 + 0.05 - \\frac{0.04}{64} = 2.05 - 0.000625 = 2.049375\n$$\n\n**Bước 4: Ước lượng sai số:**\nPhần dư $R_2 = \\frac{1}{6} \\cdot \\frac{3}{8 \\xi^{5/2}} (0.2)^3 = \\frac{0.008}{16 \\xi^{5/2}}$.\nVì $4 < \\xi < 4.2$, ta có $\\xi^{5/2} > 4^{5/2} = 32$. Do đó:\n$$\n|R_2| < \\frac{0.008}{16 \\cdot 32} = \\frac{0.008}{512} \\approx 1.56 \\times 10^{-5}\n$$\nSai số không vượt quá $2 \\times 10^{-5}$.",
      },
      {
        id: 'exam-2019-2020-b5',
        number: 5,
        points: 1.5,
        title: 'Điểm Bất động của Tích phân Giá trị Trung bình',
        statement:
          'Cho hàm số $f$ liên tục trên $[0; 1]$ thỏa mãn $\\int_0^1 f(x) dx = \\frac{1}{2}$. Chứng minh rằng tồn tại ít nhất một điểm $c \\in (0; 1)$ sao cho $f(c) = c$.',
        hint: 'Xét hàm phụ g(x) = \\int_0^x f(t) dt - x^2/2 trên [0; 1], dùng định lý Rolle.',
        solution:
          "Xét hàm số phụ $F(x) = \\int_0^x f(t) dt - \\frac{x^2}{2}$ trên đoạn $[0; 1]$.\n1. Vì $f(t)$ liên tục nên theo định lý cơ bản của giải tích, hàm tích phân cận trên $\\int_0^x f(t) dt$ khả vi trên $[0; 1]$, suy ra $F(x)$ khả vi liên tục trên $[0; 1]$.\n2. Giá trị tại hai đầu mút:\n   - $F(0) = \\int_0^0 f(t) dt - 0 = 0$.\n   - $F(1) = \\int_0^1 f(t) dt - \\frac{1^2}{2} = \\frac{1}{2} - \\frac{1}{2} = 0$.\n3. Vì $F(0) = F(1) = 0$ và $F$ khả vi trên $(0; 1)$, theo **Định lý Rolle**, tồn tại ít nhất một điểm $c \\in (0; 1)$ sao cho $F'(c) = 0$.\n4. Ta tính đạo hàm:\n   $$\n   F'(x) = f(x) - x \\implies F'(c) = f(c) - c = 0 \\iff f(c) = c\n   $$\nĐẳng thức được chứng minh hoàn tất.",
      },
      {
        id: 'exam-2019-2020-b6',
        number: 6,
        points: 1.5,
        title: 'Tính Tích phân Suy rộng Euler - Poisson',
        statement:
          'Biết rằng $\\int_0^{+\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$, hãy tính tích phân suy rộng:\n$$\nI = \\int_0^{+\\infty} x^2 e^{-x^2} dx\n$$',
        hint: 'Tách x^2 e^(-x^2) = x * (x e^(-x^2)) và tích phân từng phần với dv = x e^(-x^2) dx.',
        solution:
          'Áp dụng phương pháp tích phân từng phần:\nĐặt:\n$$\n\\begin{cases}\nu = x \\\\[1ex]\ndv = x e^{-x^2} dx\n\\end{cases} \\implies \\begin{cases}\ndu = dx \\\\[1ex]\nv = -\\frac{1}{2} e^{-x^2}\n\\end{cases}\n$$\nCông thức tích phân từng phần cho ta:\n$$\n\\int_0^B x^2 e^{-x^2} dx = \\left[ -\\frac{x}{2} e^{-x^2} \\right]_0^B + \\frac{1}{2} \\int_0^B e^{-x^2} dx\n$$\nXét giới hạn khi $B \\to +\\infty$:\n- $\\lim_{B \\to +\\infty} \\left( -\\frac{B}{2} e^{-B^2} \\right) = 0$ (do hàm mũ $e^{B^2}$ tăng nhanh hơn bậc nhất $B$).\n- Tại cận 0: $0 \\cdot e^0 = 0$.\n- Do đó phần thế cận triệt tiêu: $\\left[ -\\frac{x}{2} e^{-x^2} \\right]_0^{+\\infty} = 0$.\n\nKết hợp với giả thiết $\\int_0^{+\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$:\n$$\nI = 0 + \\frac{1}{2} \\int_0^{+\\infty} e^{-x^2} dx = \\frac{1}{2} \\cdot \\frac{\\sqrt{\\pi}}{2} = \\frac{\\sqrt{\\pi}}{4}\n$$\n\n**Kết luận:** $I = \\frac{\\sqrt{\\pi}}{4}$.',
      },
      {
        id: 'exam-2019-2020-b7',
        number: 7,
        points: 1.0,
        title: 'Chứng minh Hội tụ Đều bằng Tiêu chuẩn Weierstrass M-test',
        statement:
          'Chứng minh rằng chuỗi hàm sau hội tụ đều trên toàn bộ $\\mathbb{R}$:\n$$\n\\sum_{n=1}^\\infty \\frac{n x}{1 + n^5 x^2}\n$$',
        hint: 'Dùng bất đẳng thức AM-GM: 1 + n^5 x^2 >= 2 sqrt{n^5 x^2} = 2 n^(5/2) |x|.',
        solution:
          'Với mọi $x \\in \\mathbb{R}$ và mọi $n \\in \\mathbb{N}^*$:\n- Nếu $x = 0$: số hạng bằng 0.\n- Nếu $x \\neq 0$: áp dụng bất đẳng thức AM-GM cho mẫu số dương:\n  $$\n  1 + n^5 x^2 \\ge 2 \\sqrt{1 \\cdot n^5 x^2} = 2 n^{5/2} |x|\n  $$\n  Do đó:\n  $$\n  \\left| \\frac{n x}{1 + n^5 x^2} \\right| \\le \\frac{n |x|}{2 n^{5/2} |x|} = \\frac{1}{2 n^{3/2}}\n  $$\nBất đẳng thức này hiển nhiên cũng đúng tại $x = 0$.\nXét chuỗi số $\\sum_{n=1}^\\infty \\frac{1}{2 n^{3/2}} = \\frac{1}{2} \\sum_{n=1}^\\infty \\frac{1}{n^{3/2}}$.\nĐây là chuỗi Riemann với số mũ $p = 3/2 > 1$ nên chuỗi số này hội tụ.\nTheo **Dấu hiệu Weierstrass M-test**, chuỗi hàm $\\sum_{n=1}^\\infty \\frac{n x}{1 + n^5 x^2}$ **hội tụ đều trên toàn bộ $\\mathbb{R}$**.',
      },
    ],
  },

  // =========================================================================
  // ĐỀ 6: NĂM HỌC 2018 - HỌC KỲ I (120 PHÚT)
  // =========================================================================
  {
    id: 'exam-2018-hk1',
    year: '2018',
    semester: 'Học kỳ I',
    durationMinutes: 120,
    title: 'Đề thi Kết thúc Học phần Giải tích hàm một biến — Năm học 2018 (HK1)',
    description:
      "Đề thi chính thức học kỳ 1 năm học 2018 (thời gian làm bài: 120 phút) gồm 7 bài toán thực chiến: Cực biên dãy n^2/2^n, Bài toán tối ưu hóa khoảng cách hai chú kiến, Giới hạn tích phân L'Hôpital, Khảo sát hàm tỉ số f(x)/x tăng ngặt, Tích phân suy rộng theo tham số alpha, Bán hội tụ chuỗi lũy thừa và Weierstrass M-test.",
    originalImagePath: '/docs/giai-tich-ham-mot-bien/exams/de-2018-hk1.png',
    problems: [
      {
        id: 'exam-2018-b1',
        number: 1,
        points: 1.5,
        title: 'Cận trên và Cận dưới Dãy n^2 / 2^n',
        statement:
          'Tìm $\\sup A, \\inf A, \\max A, \\min A$ của tập hợp:\n$$\nA = \\left\\{ \\frac{n^2}{2^n} : n \\in \\mathbb{N}^* \\right\\}\n$$',
        hint: 'So sánh a_n = n^2/2^n: tính các giá trị n = 1, 2, 3, 4, 5 và nhận xét tỉ số khi n >= 3.',
        solution:
          'Tính các giá trị đầu tiên của dãy $a_n = \\frac{n^2}{2^n}$:\n- $a_1 = \\frac{1}{2} = 0.5$\n- $a_2 = \\frac{4}{4} = 1$\n- $a_3 = \\frac{9}{8} = 1.125$\n- $a_4 = \\frac{16}{16} = 1$\n- $a_5 = \\frac{25}{32} \\approx 0.781$\nXét tỉ số $\\frac{a_{n+1}}{a_n} = \\frac{(n+1)^2}{2n^2} = \\frac{1}{2}\\left(1 + \\frac{1}{n}\\right)^2$.\nVới $n \\ge 3$, ta có $1 + \\frac{1}{n} \\le \\frac{4}{3} \\implies \\frac{1}{2}\\left(1 + \\frac{1}{n}\\right)^2 \\le \\frac{1}{2} \\cdot \\frac{16}{9} = \\frac{8}{9} < 1$.\nDo đó dãy giảm từ $n = 3$ trở đi.\n- Phần tử lớn nhất là $a_3 = \\frac{9}{8} \\implies \\max A = \\sup A = \\frac{9}{8}$.\n- Vì $a_n > 0$ và $\\lim_{n \\to \\infty} a_n = 0$, ta có $\\inf A = 0$. Vì $0 \\notin A$, không tồn tại $\\min A$.\n\n**Kết luận:** $\\sup A = \\max A = \\frac{9}{8}$; $\\inf A = 0$; không có $\\min A$.',
      },
      {
        id: 'exam-2018-b2',
        number: 2,
        points: 1.5,
        title: 'Bài toán Chú kiến: Tối ưu Khoảng cách Chuyển động',
        statement:
          'Hai chú kiến bò trên hai đường thẳng vuông góc với nhau và cắt nhau tại gốc tọa độ $O$. Chú kiến thứ nhất chuyển động trên trục $Ox$ theo phương trình $x(t) = 4 - 2t$, chú kiến thứ hai chuyển động trên trục $Oy$ theo phương trình $y(t) = 3 - t$ ($t \\ge 0$, tính bằng giây, khoảng cách tính bằng cm). Tìm khoảng cách ngắn nhất giữa hai chú kiến và thời điểm đạt khoảng cách đó.',
        hint: 'Khoảng cách d(t) = sqrt{x(t)^2 + y(t)^2}. Khảo sát f(t) = x(t)^2 + y(t)^2.',
        solution:
          "Khoảng cách giữa hai chú kiến tại thời điểm $t$ là:\n$$\nd(t) = \\sqrt{x(t)^2 + y(t)^2} = \\sqrt{(4 - 2t)^2 + (3 - t)^2}\n$$\nXét hàm số bình phương khoảng cách $f(t) = d(t)^2$:\n$$\nf(t) = (16 - 16t + 4t^2) + (9 - 6t + t^2) = 5t^2 - 22t + 25\n$$\nĐây là một tam thức bậc hai có hệ số $a = 5 > 0$, parabol quay bề lõm lên trên.\nĐạo hàm: $f'(t) = 10t - 22$.\n$f'(t) = 0 \\iff t = \\frac{22}{10} = 2.2 \\text{ (giây)}$.\nGiá trị cực tiểu của $f(t)$ tại $t = 2.2$:\n$$\nf(2.2) = 5(2.2)^2 - 22(2.2) + 25 = 5(4.84) - 48.4 + 25 = 24.2 - 48.4 + 25 = 0.8\n$$\nKhoảng cách ngắn nhất là:\n$$\nd_{\\min} = \\sqrt{f(2.2)} = \\sqrt{0.8} = \\frac{2\\sqrt{5}}{5} \\approx 0.894 \\text{ cm}\n$$\n\n**Kết luận:** Khoảng cách ngắn nhất là $\\frac{2\\sqrt{5}}{5}$ cm, đạt được tại thời điểm $t = 2.2$ giây.",
      },
      {
        id: 'exam-2018-b3',
        number: 3,
        points: 1.5,
        title: "Giới hạn Tích phân Khử Dạng Vô định bằng L'Hôpital",
        statement:
          'Tính giới hạn:\n$$\nL = \\lim_{x \\to 0} \\frac{\\int_0^x (e^{t^2} - 1) dt}{x^3}\n$$',
        hint: "Dạng 0/0, áp dụng quy tắc L'Hôpital và đạo hàm tích phân theo cận trên.",
        solution:
          "Khi $x \\to 0$, cả tử số và mẫu số đều tiến về 0 (dạng vô định $\\frac{0}{0}$).\nÁp dụng quy tắc L'Hôpital, lấy đạo hàm của tử số và mẫu số:\n- Đạo hàm tử số theo định lý cơ bản giải tích: $\\left( \\int_0^x (e^{t^2} - 1) dt \\right)' = e^{x^2} - 1$.\n- Đạo hàm mẫu số: $(x^3)' = 3x^2$.\nDo đó:\n$$\nL = \\lim_{x \\to 0} \\frac{e^{x^2} - 1}{3x^2}\n$$\nSử dụng giới hạn cơ bản $\\lim_{u \\to 0} \\frac{e^u - 1}{u} = 1$ với $u = x^2 \\to 0$:\n$$\nL = \\frac{1}{3} \\lim_{x \\to 0} \\frac{e^{x^2} - 1}{x^2} = \\frac{1}{3} \\cdot 1 = \\frac{1}{3}\n$$\n\n**Kết luận:** $L = \\frac{1}{3}$.",
      },
      {
        id: 'exam-2018-b4',
        number: 4,
        points: 1.5,
        title: 'Tính Tăng ngặt của Hàm Tỉ số f(x) / x',
        statement:
          "Cho hàm số $f$ khả vi trên $[0; +\\infty)$ thỏa mãn $f(0) = 0$ và $f'(x)$ là hàm tăng ngặt trên $[0; +\\infty)$. Chứng minh rằng hàm số $g(x) = \\frac{f(x)}{x}$ tăng ngặt trên $(0; +\\infty)$.",
        hint: "Tính g'(x) = [x f'(x) - f(x)] / x^2. Dùng định lý Lagrange cho f(x) - f(0) = f'(c) x với 0 < c < x.",
        solution:
          "Xét hàm số $g(x) = \\frac{f(x)}{x}$ trên khoảng $(0; +\\infty)$. Đạo hàm của $g(x)$ là:\n$$\ng'(x) = \\frac{x f'(x) - f(x)}{x^2}\n$$\nVới mỗi $x > 0$, áp dụng **Định lý giá trị trung bình Lagrange** cho hàm số $f$ trên đoạn $[0; x]$:\nTồn tại số thực $c \\in (0; x)$ sao cho:\n$$\nf(x) - f(0) = f'(c)(x - 0) \\implies f(x) = x f'(c) \\quad (\\text{do } f(0) = 0)\n$$\nThay $f(x) = x f'(c)$ vào biểu thức tử số của $g'(x)$:\n$$\nx f'(x) - f(x) = x f'(x) - x f'(c) = x [f'(x) - f'(c)]\n$$\nVì $0 < c < x$ và giả thiết cho biết $f'$ là hàm **tăng ngặt**, ta có:\n$$\nf'(x) > f'(c) \\implies f'(x) - f'(c) > 0\n$$\nVì $x > 0$, suy ra:\n$$\nx [f'(x) - f'(c)] > 0 \\implies g'(x) = \\frac{x [f'(x) - f'(c)]}{x^2} > 0, \\quad \\forall x > 0\n$$\nDo đạo hàm $g'(x) > 0$ với mọi $x > 0$, hàm số $g(x) = \\frac{f(x)}{x}$ tăng ngặt trên khoảng $(0; +\\infty)$.",
      },
      {
        id: 'exam-2018-b5',
        number: 5,
        points: 1.5,
        title: 'Khảo sát Tham số Tích phân Suy rộng',
        statement:
          'Tìm tất cả các giá trị của tham số $\\alpha \\in \\mathbb{R}$ sao cho tích phân suy rộng sau hội tụ:\n$$\nI(\\alpha) = \\int_0^{+\\infty} \\frac{e^{-x}}{x^\\alpha} dx\n$$',
        hint: 'Tách tại 1, tại 0 hàm tương đương 1/x^alpha (hội tụ <=> alpha < 1), tại +inf hội tụ với mọi alpha.',
        solution:
          'Tách tích phân thành hai miền: $I(\\alpha) = \\int_0^1 \\frac{e^{-x}}{x^\\alpha} dx + \\int_1^{+\\infty} \\frac{e^{-x}}{x^\\alpha} dx = I_1 + I_2$.\n1. **Khảo sát $I_1$ (Kỳ dị tại cận 0):**\n   Khi $x \\to 0^+$, ta có $e^{-x} \\to 1$, do đó $\\frac{e^{-x}}{x^\\alpha} \\sim \\frac{1}{x^\\alpha}$.\n   Theo tiêu chuẩn tích phân suy rộng chuẩn Riemann tại 0, tích phân $\\int_0^1 \\frac{dx}{x^\\alpha}$ hội tụ khi và chỉ khi $\\alpha < 1$.\n   Do đó $I_1$ hội tụ khi và chỉ khi $\\alpha < 1$.\n2. **Khảo sát $I_2$ (Kỳ dị tại $+\\infty$):**\n   Với mọi $\\alpha \\in \\mathbb{R}$, ta có $\\lim_{x \\to +\\infty} x^2 \\frac{e^{-x}}{x^\\alpha} = \\lim_{x \\to +\\infty} \\frac{x^{2-\\alpha}}{e^x} = 0$.\n   Do đó tồn tại $x_0 \\ge 1$ sao cho $\\frac{e^{-x}}{x^\\alpha} \\le \\frac{1}{x^2}$ với mọi $x \\ge x_0$.\n   Vì $\\int_1^{+\\infty} \\frac{dx}{x^2}$ hội tụ, $I_2$ hội tụ với mọi $\\alpha \\in \\mathbb{R}$.\n\n**Kết luận:** Tích phân $I(\\alpha)$ hội tụ khi và chỉ khi $\\alpha < 1$.',
      },
      {
        id: 'exam-2018-b6',
        number: 6,
        points: 1.5,
        title: 'Khảo sát Miền Hội tụ và Bán hội tụ Chuỗi Lũy thừa',
        statement:
          'Tìm miền hội tụ của chuỗi lũy thừa $\\sum_{n=1}^\\infty \\frac{x^n}{\\sqrt{n}}$. Xét tính hội tụ tuyệt đối và bán hội tụ tại các điểm biên.',
        hint: 'Bán kính R = 1. Tại x = 1 chuỗi p-series p = 1/2 phân kỳ. Tại x = -1 chuỗi Leibniz bán hội tụ.',
        solution:
          'Chuỗi lũy thừa có hệ số $c_n = \\frac{1}{\\sqrt{n}}$.\nBán kính hội tụ:\n$$\nR = \\lim_{n \\to \\infty} \\left| \\frac{c_n}{c_{n+1}} \\right| = \\lim_{n \\to \\infty} \\frac{\\sqrt{n+1}}{\\sqrt{n}} = 1\n$$\nDo đó chuỗi hội tụ tuyệt đối trên khoảng $(-1; 1)$.\n\n**Xét tại các đầu mút biên:**\n- Tại $x = 1$: chuỗi trở thành $\\sum_{n=1}^\\infty \\frac{1}{n^{1/2}}$. Đây là chuỗi Riemann với số mũ $p = 1/2 \\le 1$ nên **phân kỳ**.\n- Tại $x = -1$: chuỗi trở thành chuỗi đan dấu $\\sum_{n=1}^\\infty \\frac{(-1)^n}{\\sqrt{n}}$.\n  Dãy $a_n = \\frac{1}{\\sqrt{n}} > 0$ giảm ngặt và tiến về 0 khi $n \\to \\infty$.\n  Theo **Dấu hiệu Leibniz**, chuỗi hội tụ.\n  Tuy nhiên chuỗi các giá trị tuyệt đối của nó là $\\sum \\frac{1}{\\sqrt{n}}$ phân kỳ, nên chuỗi **bán hội tụ** tại $x = -1$.\n\n**Kết luận:**\n- Miền hội tụ của chuỗi là $[-1; 1)$.\n- Miền hội tụ tuyệt đối là $(-1; 1)$.\n- Điểm bán hội tụ duy nhất là $x = -1$.',
      },
      {
        id: 'exam-2018-b7',
        number: 7,
        points: 1.0,
        title: 'Chứng minh Hội tụ Đều bằng Tiêu chuẩn Weierstrass',
        statement:
          'Dùng dấu hiệu Weierstrass M-test, chứng minh rằng chuỗi hàm sau hội tụ đều trên toàn bộ $\\mathbb{R}$:\n$$\n\\sum_{n=1}^\\infty \\frac{\\cos(n^2 x)}{n^3 + x^2}\n$$',
        hint: 'Đánh giá |cos(n^2 x)| <= 1 và n^3 + x^2 >= n^3.',
        solution:
          'Với mọi $x \\in \\mathbb{R}$ và mọi $n \\in \\mathbb{N}^*$, ta có $x^2 \\ge 0 \\implies n^3 + x^2 \\ge n^3$.\nKết hợp với bất đẳng thức lượng giác $|\\cos(n^2 x)| \\le 1$, ta có đánh giá độc lập với biến $x$:\n$$\n\\left| \\frac{\\cos(n^2 x)}{n^3 + x^2} \\right| \\le \\frac{1}{n^3 + x^2} \\le \\frac{1}{n^3} = a_n, \\quad \\forall x \\in \\mathbb{R}, \\; \\forall n \\ge 1\n$$\nXét chuỗi số $\\sum_{n=1}^\\infty a_n = \\sum_{n=1}^\\infty \\frac{1}{n^3}$.\nĐây là chuỗi Riemann với số mũ $p = 3 > 1$ nên chuỗi số này hội tụ.\nTheo **Dấu hiệu Weierstrass M-test**, chuỗi hàm $\\sum_{n=1}^\\infty \\frac{\\cos(n^2 x)}{n^3 + x^2}$ **hội tụ đều trên toàn bộ $\\mathbb{R}$**.',
      },
    ],
  },
];
