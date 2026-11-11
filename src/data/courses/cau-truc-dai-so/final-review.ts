/**
 * Đề cương ôn tập trọng tâm và Chuẩn đầu ra (CLO) Học phần Cấu trúc Đại số
 * Chuẩn chương trình Sư phạm Toán học (HCMUE / ĐHSP)
 */

export interface ReviewTopic {
  readonly title: string;
  readonly description: string;
  readonly keyFormula?: string;
}

export interface ExamTrap {
  readonly mistake: string;
  readonly counterExampleOrExplanation: string;
  readonly correctApproach: string;
}

export interface ReviewModule {
  readonly id: string;
  readonly moduleNumber: number;
  readonly title: string;
  readonly creditWeight: string; // e.g. "20% đề thi (2.0 điểm)"
  readonly targetCLOs: readonly string[];
  readonly coreTheorems: readonly string[];
  readonly topics: readonly ReviewTopic[];
  readonly examTraps: readonly ExamTrap[];
  readonly typicalQuestions: readonly string[];
}

export interface FinalReviewSyllabus {
  readonly courseCode: string;
  readonly courseName: string;
  readonly examFormat: string;
  readonly durationMinutes: number;
  readonly totalPoints: number;
  readonly cloDescriptions: Record<string, string>;
  readonly modules: readonly ReviewModule[];
}

export const CTDS_FINAL_REVIEW_SYLLABUS: FinalReviewSyllabus = {
  courseCode: 'MATH1301',
  courseName: 'Cấu trúc Đại số',
  examFormat: 'Tự luận 100% (5 câu hỏi lớn, mỗi câu 2.0 điểm có chia ý a, b kèm barem chi tiết)',
  durationMinutes: 90,
  totalPoints: 10.0,
  cloDescriptions: {
    CLO1: 'Nắm vững ngôn ngữ logic, quan hệ tương đương, phân hoạch tập hợp và phép toán cảm sinh trên tập thương.',
    CLO2: 'Hiểu sâu các hệ tiên đề nửa nhóm, vị nhóm, nhóm, nhóm con, cấp phần tử và tính chất nhóm cyclic.',
    CLO3: 'Vận dụng thành thạo Định lý Lagrange, phân hoạch lớp kề và các ứng dụng số học (Fermat, Euler).',
    CLO4: 'Làm chủ lý thuyết nhóm con chuẩn tắc, nhóm thương, đồng cấu nhóm và bộ ba định lý đẳng cấu.',
    CLO5: 'Phân tích cấu trúc vành, miền nguyên, i-đê-an, vành thương, tính chất bất khả quy và phép dựng trường các thương.',
  },
  modules: [
    {
      id: 'module-1-ngon-ngu-va-cong-cu',
      moduleNumber: 1,
      title: 'Module 1: Quan hệ tương đương, Tập thương và Phép toán cảm sinh',
      creditWeight: '2.0 điểm (Câu 1)',
      targetCLOs: ['CLO1', 'CLO2'],
      coreTheorems: [
        'Định lý về Phân hoạch tập hợp và Quan hệ tương đương',
        'Tiêu chuẩn xác định tốt (well-defined) của phép toán hai ngôi cảm sinh trên tập thương',
      ],
      topics: [
        {
          title: 'Quan hệ tương đương',
          description:
            'Chứng minh một quan hệ hai ngôi thỏa mãn 3 tiên đề: phản xạ, đối xứng, bắc cầu. Lưu ý các điều kiện ràng buộc mẫu số khác 0 trong phân số.',
          keyFormula: 'x \\sim y \\iff (x, y) \\in R',
        },
        {
          title: 'Lớp tương đương & Tập thương',
          description:
            'Mô tả các lớp tương đương $[a]$ như các lát cắt rời nhau. Nhận diện tập thương $X/\\sim$ với các đối tượng đại số quen thuộc (như $\\mathbb{Q} = (\\mathbb{Z} \\times \\mathbb{Z}^*)/\\sim$).',
          keyFormula: '[a] = \\{x \\in X \\mid x \\sim a\\}',
        },
        {
          title: 'Tính xác định tốt của phép toán cảm sinh',
          description:
            "Khi định nghĩa phép toán trên các lớp $[a] \\star [b] = [a * b]$, bắt buộc phải chứng minh: nếu $[a] = [a']$ và $[b] = [b']$ thì $[a * b] = [a' * b'].",
          keyFormula: "a \\sim a' \\land b \\sim b' \\implies a * b \\sim a' * b'",
        },
      ],
      examTraps: [
        {
          mistake: 'Quên kiểm tra tính xác định tốt khi định nghĩa phép toán trên tập thương.',
          counterExampleOrExplanation:
            'Định nghĩa $f([a]_n) = [a]_m$ trên $\\mathbb{Z}/n\\mathbb{Z}$ sẽ vô nghĩa nếu $m \\nmid n$, vì cùng một lớp $[0]_n = [n]_n$ lại cho ra hai ảnh khác nhau trong $\\mathbb{Z}/m\\mathbb{Z}$.',
          correctApproach:
            "Luôn bắt đầu bằng việc giả sử hai đại diện khác nhau $(a, b) \\sim (a', b')$ rồi biến đổi tương đương để chứng minh ảnh của chúng tương đương nhau.",
        },
        {
          mistake:
            'Quên xét trường hợp triệt tiêu mẫu hoặc phần tử bằng 0 khi chứng minh tính bắc cầu.',
          counterExampleOrExplanation:
            'Từ $(ad)(cf) = (bc)(de)$ muốn suy ra $af = be$ cần chú ý trường hợp $c = 0$ và $d \\neq 0$.',
          correctApproach:
            'Chia rõ hai trường hợp: $c \\neq 0$ (áp dụng luật giản ước của miền nguyên) và $c = 0$ (dẫn tới $a = 0$ và $e = 0$).',
        },
      ],
      typicalQuestions: [
        'Chứng minh quan hệ $(a, b) \\sim (c, d) \\iff ad = bc$ trên $\\mathbb{Z} \\times \\mathbb{Z}^*$ là quan hệ tương đương.',
        'Chứng minh phép cộng phân số $[(a, b)] \\oplus [(c, d)] = [(ad + bc, bd)]$ xác định tốt và lập thành nhóm Abel.',
      ],
    },
    {
      id: 'module-2-nhom-va-nhom-cyclic',
      moduleNumber: 2,
      title: 'Module 2: Lý thuyết Nhóm, Cấp của phần tử và Cấu trúc Nhóm Cyclic',
      creditWeight: '2.0 điểm (Câu 2)',
      targetCLOs: ['CLO2'],
      coreTheorems: [
        'Công thức cấp của lũy thừa: $\\operatorname{ord}(a^k) = \\frac{n}{\\gcd(n, k)}$',
        'Định lý Phân loại và cấu trúc nhóm con của nhóm cyclic hữu hạn',
      ],
      topics: [
        {
          title: 'Tiên đề nhóm và Bảng Cayley',
          description:
            '4 tiên đề: đóng, kết hợp, phần tử trung hòa, phần tử đối xứng. Luật Sudoku trong bảng Cayley: mỗi phần tử xuất hiện đúng 1 lần trên mỗi hàng và mỗi cột.',
          keyFormula: 'a * e = e * a = a, \\quad a * a^{-1} = a^{-1} * a = e',
        },
        {
          title: 'Cấp của phần tử',
          description:
            'Số nguyên dương $n$ nhỏ nhất sao cho $a^n = e$. Tính chất $a^m = e \\iff \\operatorname{ord}(a) \\mid m$.',
          keyFormula:
            '\\operatorname{ord}(a^k) = \\frac{\\operatorname{ord}(a)}{\\gcd(\\operatorname{ord}(a), k)}',
        },
        {
          title: 'Cấu trúc nhóm cyclic',
          description:
            'Mọi nhóm con của nhóm cyclic đều là nhóm cyclic. Với mỗi ước $d \\mid n$, tồn tại duy nhất một nhóm con cấp $d$ sinh bởi $a^{n/d}$.',
          keyFormula: 'H_d = \\langle a^{n/d} \\rangle, \\quad |H_d| = d',
        },
      ],
      examTraps: [
        {
          mistake: 'Nhầm lẫn giữa cấp của phần tử $\\operatorname{ord}(a)$ và số mũ lũy thừa $k$.',
          counterExampleOrExplanation:
            'Nhiều sinh viên cho rằng cấp của $a^k$ là $n/k$, điều này sai khi $k$ không phải là ước của $n$ (ví dụ cấp của $[4]_{10}$ là $10/\\gcd(10, 4) = 5$, không phải $10/4$).',
          correctApproach:
            'Luôn áp dụng đúng công thức mẫu số là ước chung lớn nhất $\\gcd(n, k)$.',
        },
        {
          mistake: 'Khẳng định nhóm cyclic chỉ có 1 phần tử sinh.',
          counterExampleOrExplanation:
            'Nhóm $\\mathbb{Z}/n\\mathbb{Z}$ có đúng $\\varphi(n)$ phần tử sinh, ứng với các thặng dư nguyên tố cùng nhau với $n$.',
          correctApproach: 'Đếm và liệt kê đầy đủ tất cả $k$ thỏa mãn $\\gcd(k, n) = 1$.',
        },
      ],
      typicalQuestions: [
        'Chứng minh công thức $\\operatorname{ord}(a^k) = \\frac{n}{\\gcd(n, k)}$ và tìm các phần tử sinh của $\\mathbb{Z}/18\\mathbb{Z}$.',
        'Chứng minh với mỗi ước $d \\mid n$, nhóm cyclic cấp $n$ có duy nhất một nhóm con cấp $d$ và vẽ lưới nhóm con của $\\mathbb{Z}/18\\mathbb{Z}$.',
      ],
    },
    {
      id: 'module-3-lop-ke-va-lagrange',
      moduleNumber: 3,
      title: 'Module 3: Lớp kề, Định lý Lagrange và Ứng dụng Số học',
      creditWeight: '2.0 điểm (Câu 3)',
      targetCLOs: ['CLO3'],
      coreTheorems: [
        'Định lý Lagrange: $|G| = [G : H] \\cdot |H|$',
        'Định lý Euler: $a^{\\varphi(n)} \\equiv 1 \\pmod n$ và Định lý nhỏ Fermat: $a^p \\equiv a \\pmod p$',
      ],
      topics: [
        {
          title: 'Lớp kề trái và Lớp kề phải',
          description:
            'Các lớp kề $gH$ và $Hg$ tạo nên hai phân hoạch khác nhau của nhóm $G$. Khi nhóm không giao hoán, nói chung $gH \\neq Hg$.',
          keyFormula: 'gH = \\{gh \\mid h \\in H\\}, \\quad Hg = \\{hg \\mid h \\in H\\}',
        },
        {
          title: 'Định lý Lagrange',
          description:
            'Trong nhóm hữu hạn, cấp của nhóm con $H$ chia hết cấp của nhóm $G$. Mọi lớp kề đều có cùng số lượng phần tử bằng $|H|$ nhờ song ánh tịnh tiến.',
          keyFormula: '|G| = [G : H] \\cdot |H|',
        },
        {
          title: 'Ứng dụng số học',
          description:
            'Áp dụng Định lý Lagrange cho nhóm nhân các phần tử khả nghịch $U(n) = (\\mathbb{Z}/n\\mathbb{Z})^*$ có cấp $\\varphi(n)$ để chứng minh Định lý Euler.',
          keyFormula: 'a^{\\varphi(n)} \\equiv 1 \\pmod n \\quad (\\gcd(a, n) = 1)',
        },
      ],
      examTraps: [
        {
          mistake: 'Ngộ nhận chiều ngược của Định lý Lagrange luôn đúng.',
          counterExampleOrExplanation:
            'Nếu $d \\mid |G|$ thì chưa chắc $G$ đã có nhóm con cấp $d$. Phản ví dụ kinh điển: Nhóm thay phiên $A_4$ có cấp 12, số $6 \\mid 12$ nhưng $A_4$ không có bất kỳ nhóm con nào cấp 6.',
          correctApproach:
            'Chỉ khẳng định chiều ngược đúng khi nhóm $G$ là nhóm cyclic, nhóm Abel, hoặc thông qua Định lý Sylow (khi $d = p^k$ là lũy thừa nguyên tố).',
        },
        {
          mistake: 'Đồng nhất lớp kề trái $gH$ với lớp kề phải $Hg$ trong nhóm không Abel.',
          counterExampleOrExplanation:
            'Trong nhóm $S_3$ với $H = \\langle (1\\;2) \\rangle$, ta có $(1\\;3)H = \\{(1\\;3), (1\\;2\\;3)\\}$ nhưng $H(1\\;3) = \\{(1\\;3), (1\\;3\\;2)\\} \\neq (1\\;3)H$.',
          correctApproach:
            'Tính toán tường minh từng phần tử bằng phép nhân hoán vị từ phải sang trái để đối chiếu.',
        },
      ],
      typicalQuestions: [
        'Cho $H = \\langle (1\\;2) \\rangle$ trong $S_3$. Tính toàn bộ các lớp kề trái, lớp kề phải và chứng minh $H$ không chuẩn tắc.',
        'Phát biểu, chứng minh Định lý Lagrange và suy ra cấp của phần tử luôn chia hết cấp nhóm.',
        'Chứng minh Định lý Euler và tìm 2 chữ số tận cùng của $7^{2026}$.',
      ],
    },
    {
      id: 'module-4-dong-cau-va-dang-cau',
      moduleNumber: 4,
      title: 'Module 4: Nhóm con Chuẩn tắc, Nhóm thương và Đồng cấu Nhóm',
      creditWeight: '2.0 điểm (Câu 4)',
      targetCLOs: ['CLO3', 'CLO4'],
      coreTheorems: [
        'Tiêu chuẩn Nhóm con chuẩn tắc: $gHg^{-1} = H, \\forall g \\in G$',
        'Định lý Đẳng cấu thứ nhất: $G/\\ker\\varphi \\cong \\operatorname{Im}\\varphi$',
      ],
      topics: [
        {
          title: 'Nhóm con chuẩn tắc & Nhóm thương',
          description:
            'Nhóm con $N \\trianglelefteq G$ khi và chỉ khi $gN = Ng$ với mọi $g$. Phép nhân lớp kề $(aN)(bN) = (ab)N$ xác định tốt khi và chỉ khi $N$ chuẩn tắc.',
          keyFormula: 'N \\trianglelefteq G \\iff \\forall g \\in G, \\; gNg^{-1} \\subseteq N',
        },
        {
          title: 'Đồng cấu nhóm, Hạt nhân & Ảnh',
          description:
            'Ánh xạ bảo toàn phép toán: $\\varphi(xy) = \\varphi(x)\\varphi(y)$. Hạt nhân $\\ker\\varphi$ luôn là nhóm con chuẩn tắc; ảnh $\\operatorname{Im}\\varphi$ là nhóm con.',
          keyFormula:
            '\\ker\\varphi = \\{x \\in G \\mid \\varphi(x) = e_K\\}, \\quad \\operatorname{Im}\\varphi = \\{\\varphi(x) \\mid x \\in G\\}',
        },
        {
          title: 'Định lý Đẳng cấu thứ nhất',
          description:
            'Mọi đồng cấu $\\varphi$ đều phân tích tự nhiên thành tích của một toàn cấu chính tắc $\\pi: G \\twoheadrightarrow G/\\ker\\varphi$, một đẳng cấu $\\bar{\\varphi}$, và một đơn cấu nhúng.',
          keyFormula: 'G/\\ker\\varphi \\cong \\operatorname{Im}\\varphi',
        },
      ],
      examTraps: [
        {
          mistake: 'Khẳng định $\\ker\\varphi = \\{0\\}$ suy ra $\\varphi$ là đẳng cấu.',
          counterExampleOrExplanation:
            'Điều kiện $\\ker\\varphi = \\{e_G\\}$ chỉ chứng minh $\\varphi$ là **đơn cấu** (injective), chưa đủ để kết luận toàn cấu (surjective). Cần kiểm tra thêm $\\operatorname{Im}\\varphi = K$ hoặc so sánh số phần tử khi các nhóm hữu hạn cùng cấp.',
          correctApproach:
            'Kiểm tra tách biệt: đơn ánh qua $\\ker\\varphi = \\{e\\}$, toàn ánh qua việc lấy tùy ý $y \\in K$ và chỉ ra phần tử tạo ảnh $x$.',
        },
      ],
      typicalQuestions: [
        'Chứng minh mọi nhóm con có chỉ số bằng 2 đều là nhóm con chuẩn tắc.',
        'Cho $\\varphi: \\mathbb{C}^* \\to \\mathbb{R}^*, z \\mapsto |z|$. Chứng minh $\\varphi$ là đồng cấu, tìm $\\ker\\varphi, \\operatorname{Im}\\varphi$ và áp dụng định lý đẳng cấu thứ nhất suy ra $\\mathbb{C}^*/\\mathbb{S}^1 \\cong \\mathbb{R}_+^*$.',
      ],
    },
    {
      id: 'module-5-vanh-va-da-thuc-bat-kha-quy',
      moduleNumber: 5,
      title: 'Module 5: Vành, I-đê-an, Đa thức Bất khả quy và Trường',
      creditWeight: '2.0 điểm (Câu 5)',
      targetCLOs: ['CLO5'],
      coreTheorems: [
        'Tiêu chuẩn Bất khả quy Eisenstein trên $\\mathbb{Z}[x]$',
        'Định lý Vành thương theo I-đê-an cực đại: $R/M$ là trường $\\iff M$ cực đại',
        'Thuật toán chia Euclid tìm phần tử nghịch đảo trong trường mở rộng đại số',
      ],
      topics: [
        {
          title: 'Vành, Miền nguyên và Trường',
          description:
            'Vành có 2 phép toán $(+, \\cdot)$. Miền nguyên là vành giao hoán có đơn vị không có ước của không. Trường là miền nguyên mà mọi phần tử khác 0 đều khả nghịch.',
          keyFormula: 'ab = 0 \\implies a = 0 \\lor b = 0',
        },
        {
          title: 'I-đê-an nguyên tố & I-đê-an cực đại',
          description:
            '$P$ nguyên tố $\\iff R/P$ là miền nguyên. $M$ cực đại $\\iff R/M$ là trường. Mọi i-đê-an cực đại đều là nguyên tố.',
          keyFormula: 'M \\text{ cực đại} \\iff R/M \\text{ là một trường}',
        },
        {
          title: 'Tiêu chuẩn Eisenstein & Trường mở rộng',
          description:
            'Điều kiện đủ để đa thức nguyên bất khả quy trên $\\mathbb{Q}$. Nếu $f(x)$ bất khả quy bậc $n$ thì $\\mathbb{Q}[x]/\\langle f \\rangle$ là một trường mở rộng bậc $n$ trên $\\mathbb{Q}$.',
          keyFormula: 'p \\mid a_0, \\dots, a_{n-1}; \\; p \\nmid a_n; \\; p^2 \\nmid a_0',
        },
        {
          title: 'Nghịch đảo trong $\\mathbb{Q}[\\theta]$',
          description:
            'Thực hiện phép chia Euclid $f(x) = (x + c)q(x) + r$. Vì $f(\\theta) = 0$, ta có $(\\theta + c)q(\\theta) = -r$, suy ra $(\\theta + c)^{-1} = -\\frac{1}{r}q(\\theta)$.',
          keyFormula: '(\\theta + c)^{-1} = -\\frac{1}{r} q(\\theta)',
        },
      ],
      examTraps: [
        {
          mistake: 'Áp dụng Tiêu chuẩn Eisenstein nhưng quên kiểm tra điều kiện $p^2 \\nmid a_0$.',
          counterExampleOrExplanation:
            'Đa thức $x^2 - 4$ có $2 \\mid a_1=0$, $2 \\mid a_0=-4$, $2 \\nmid a_2=1$. Nhưng $2^2 = 4 \\mid (-4)$, do đó không áp dụng được Eisenstein (thực tế $x^2 - 4 = (x-2)(x+2)$ khả quy).',
          correctApproach:
            'Luôn kiểm tra đầy đủ cả 3 điều kiện: $p \\mid a_i$ ($i < n$), $p \\nmid a_n$, và $p^2 \\nmid a_0$.',
        },
        {
          mistake: 'Nhầm lẫn giữa quan hệ chia hết trong vành đa thức và giá trị số.',
          counterExampleOrExplanation:
            'Trong trường mở rộng $K = \\mathbb{Q}[x]/\\langle f \\rangle$, phần tử $\\theta$ thỏa mãn $f(\\theta) = 0$. Không được tính $(\\theta + 1)^{-1}$ bằng cách thay số thực xấp xỉ.',
          correctApproach:
            'Dùng đẳng thức Bezout hoặc phép chia Euclid đa thức để tìm các hệ số hữu tỉ chính xác tuyệt đối.',
        },
      ],
      typicalQuestions: [
        'Phát biểu Tiêu chuẩn Eisenstein. Chứng minh $f(x) = x^3 - 3x + 3$ bất khả quy trên $\\mathbb{Q}$.',
        'Chứng minh $K = \\mathbb{Q}[x]/\\langle x^3 - 3x + 3 \\rangle$ là một trường và tìm $(\\theta + 1)^{-1}$ dưới dạng $a\\theta^2 + b\\theta + c$.',
      ],
    },
  ],
};
