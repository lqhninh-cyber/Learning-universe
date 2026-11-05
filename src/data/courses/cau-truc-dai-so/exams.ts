import type { ExamPaper } from '../giai-tich-ham-mot-bien/exams';

export const CTDS_EXAM_PAPERS: readonly ExamPaper[] = [
  // =========================================================================
  // ĐỀ 1: NĂM HỌC 2025-2026 - HỌC KỲ I (90 PHÚT)
  // =========================================================================
  {
    id: 'ctds-exam-2025-2026-hk1',
    year: '2025-2026',
    semester: 'Học kỳ I',
    durationMinutes: 90,
    title: 'Đề thi Kết thúc Học phần Cấu trúc Đại số — Năm học 2025-2026 (HK1)',
    description:
      'Đề thi chính thức học kỳ 1 năm học 2025-2026 gồm 5 câu hỏi tự luận lớn (thời gian làm bài: 90 phút). Bao quát: Quan hệ tương đương & cấu trúc nhóm, Nhóm con & cấp phần tử & phân loại nhóm cấp 2p, Lớp kề & Định lý Lagrange & Định lý Euler/Fermat, Nhóm con chuẩn tắc & Định lý đẳng cấu thứ nhất, Vành & Tiêu chuẩn bất khả quy Eisenstein.',
    originalImagePath: '/docs/cau-truc-dai-so/exams/de-ctds-2025-2026-hk1.png',
    problems: [
      {
        id: 'ctds-2025-b1',
        number: 1,
        points: 2.0,
        title: 'Quan hệ tương đương, Lớp tương đương và Cấu trúc Nhóm',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Cho tập hợp $X = \\mathbb{Z} \\times \\mathbb{Z}^*$ (với $\\mathbb{Z}^* = \\mathbb{Z} \\setminus \\{0\\}$). Trên $X$ định nghĩa quan hệ hai ngôi $\\sim$ như sau:\n$$\n(a, b) \\sim (c, d) \\iff ad = bc.\n$$\n1. Chứng minh rằng $\\sim$ là một quan hệ tương đương trên $X$.\n2. Hãy mô tả hình học các lớp tương đương $[(a, b)]$ và nêu rõ ý nghĩa đại số của tập thương $X/\\sim$.',
            hint: 'Kiểm tra lần lượt 3 tính chất: phản xạ, đối xứng và bắc cầu. Lưu ý khi chứng minh tính bắc cầu cần sử dụng điều kiện $b, d, f \\neq 0$ để rút gọn.',
            solution:
              '**1. Chứng minh $\\sim$ là quan hệ tương đương:**\n- **Tính phản xạ:** Với mọi $(a, b) \\in X$, ta có $ab = ba$ (tính giao hoán của phép nhân trong $\\mathbb{Z}$). Do đó $(a, b) \\sim (a, b)$.\n- **Tính đối xứng:** Giả sử $(a, b) \\sim (c, d)$, nghĩa là $ad = bc$. Khi đó $cb = da$, suy ra $(c, d) \\sim (a, b)$.\n- **Tính bắc cầu:** Giả sử $(a, b) \\sim (c, d)$ và $(c, d) \\sim (e, f)$. Khi đó:\n$$\nad = bc \\quad \\text{và} \\quad cf = de.\n$$\nNhân hai vế của hai đẳng thức trên:\n$$\n(ad)(cf) = (bc)(de) \\iff (af)(cd) = (be)(cd).\n$$\nVì $(c, d) \\in X$, ta xét hai trường hợp:\n+ Nếu $c \\neq 0$: Do $d \\neq 0$ nên $cd \\neq 0$. Trong miền nguyên $\\mathbb{Z}$, luật giản ước cho phép suy ra $af = be$, tức là $(a, b) \\sim (e, f)$.\n+ Nếu $c = 0$: Từ $ad = bc = 0$ và $d \\neq 0$ suy ra $a = 0$. Từ $cf = de = 0$ và $d \\neq 0$ suy ra $e = 0$. Khi đó $af = 0 \\cdot f = 0 = b \\cdot 0 = be$, do đó $(a, b) \\sim (e, f)$.\nVậy $\\sim$ là một quan hệ tương đương trên $X$.\n\n**2. Mô tả lớp tương đương và tập thương:**\n- Mỗi lớp tương đương $[(a, b)] = \\{(x, y) \\in X \\mid ay = bx\\}$ tương ứng với tập hợp tất cả các cặp số nguyên biểu diễn cùng một phân số $\\frac{a}{b}$.\n- Về mặt hình học trên mặt phẳng tọa độ $\\mathbb{Z}^2$, lớp $[(a, b)]$ là tập hợp các điểm nguyên (khác gốc tọa độ) cùng nằm trên đường thẳng đi qua gốc tọa độ có hệ số góc bằng $a/b$.\n- Tập thương $X/\\sim$ chính là mô hình toán học giải tích chặt chẽ xây dựng nên **trường số hữu tỉ $\\mathbb{Q}$** từ tập các số nguyên $\\mathbb{Z}$.',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Trên tập hợp $G = \\mathbb{R} \\setminus \\{-1\\}$, ta định nghĩa phép toán hai ngôi $*$ như sau:\n$$\nx * y = x + y + xy, \\quad \\forall x, y \\in G.\n$$\nChứng minh rằng $(G, *)$ là một nhóm abel. Tìm phần tử trung hòa và phần tử đối xứng của mỗi $x \\in G$.',
            hint: 'Nhận xét rằng $x * y + 1 = (x + 1)(y + 1)$ để kiểm tra nhanh tính đóng và tính kết hợp.',
            solution:
              "**Bước 1: Tính đóng của phép toán trên $G$:**\nVới mọi $x, y \\in G$, ta có $x \\neq -1$ và $y \\neq -1$, suy ra $x + 1 \\neq 0$ và $y + 1 \\neq 0$.\nXét $x * y + 1 = x + y + xy + 1 = (x + 1)(y + 1) \\neq 0$.\nDo đó $x * y \\neq -1$, nghĩa là $x * y \\in G$. Phép toán $*$ đóng trên $G$.\n\n**Bước 2: Tính kết hợp:**\nVới mọi $x, y, z \\in G$:\n$$\n(x * y) * z = (x + y + xy) + z + (x + y + xy)z = x + y + z + xy + yz + zx + xyz.\n$$\nDo tính đối xứng hoàn toàn của biểu thức đại số đối với ba biến $x, y, z$, ta cũng có:\n$$\nx * (y * z) = x + y + z + xy + yz + zx + xyz = (x * y) * z.\n$$\nVậy phép toán $*$ có tính kết hợp.\n\n**Bước 3: Tính giao hoán:**\nVới mọi $x, y \\in G$, $x * y = x + y + xy = y + x + yx = y * x$. Phép toán $*$ giao hoán.\n\n**Bước 4: Phần tử trung hòa (đơn vị):**\nTìm $e \\in G$ sao cho $x * e = x$ với mọi $x \\in G$:\n$$\nx + e + xe = x \\iff e(1 + x) = 0.\n$$\nVì $x \\in G$ nên $x + 1 \\neq 0$, suy ra $e = 0 \\in G$. Do tính giao hoán, $e = 0$ là phần tử trung hòa của nhóm.\n\n**Bước 5: Phần tử đối xứng (nghịch đảo):**\nVới mỗi $x \\in G$, tìm $x' \\in G$ sao cho $x * x' = e = 0$:\n$$\nx + x' + xx' = 0 \\iff x'(1 + x) = -x \\iff x' = \\frac{-x}{1 + x}.\n$$\nVì $x \\neq -1$ nên $x'$ xác định duy nhất. Hơn nữa, nếu $x' = -1$ thì $-x = -(1 + x) = -1 - x \\implies 0 = -1$ (vô lý). Do đó $x' \\in G$.\n\n**Kết luận:** $(G, *)$ thỏa mãn đầy đủ 4 tiên đề của nhóm và có tính giao hoán, nên $(G, *)$ là một nhóm abel.",
          },
        ],
      },
      {
        id: 'ctds-2025-b2',
        number: 2,
        points: 2.0,
        title: 'Nhóm con, Cấp của phần tử, Nhóm Cyclic và Phân loại Nhóm cấp 2p',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Cho nhóm $G$ và một phần tử $a \\in G$ có cấp hữu hạn $n = \\operatorname{ord}(a)$.\n1. Chứng minh rằng với mọi số nguyên $k \\in \\mathbb{Z}$, ta có công thức:\n$$\n\\operatorname{ord}(a^k) = \\frac{n}{\\gcd(n, k)}.\n$$\n2. Áp dụng: Tìm toàn bộ các phần tử sinh của nhóm cyclic $(\\mathbb{Z}/18\\mathbb{Z}, +)$.',
            hint: 'Đặt $d = \\gcd(n, k)$ và chứng minh $(a^k)^m = e \\iff n \\mid km \\iff \\frac{n}{d} \\mid \\frac{k}{d} m$.',
            solution:
              '**1. Chứng minh công thức cấp của $a^k$:**\nĐặt $d = \\gcd(n, k)$, ta có $n = d \\cdot n_1$, $k = d \\cdot k_1$ với $\\gcd(n_1, k_1) = 1$.\nGiả sử $m$ là số nguyên dương thỏa mãn $(a^k)^m = e$. Khi đó:\n$$\na^{km} = e \\iff n \\mid km \\iff (d \\cdot n_1) \\mid (d \\cdot k_1 \\cdot m) \\iff n_1 \\mid k_1 m.\n$$\nVì $\\gcd(n_1, k_1) = 1$, theo bổ đề Gauss, $n_1 \\mid k_1 m \\iff n_1 \\mid m$.\nDo đó số nguyên dương $m$ nhỏ nhất thỏa mãn $(a^k)^m = e$ chính là $m = n_1 = \\frac{n}{d} = \\frac{n}{\\gcd(n, k)}$.\nVậy $\\operatorname{ord}(a^k) = \\frac{n}{\\gcd(n, k)}$.\n\n**2. Tìm các phần tử sinh của $(\\mathbb{Z}/18\\mathbb{Z}, +)$:**\nNhóm $(\\mathbb{Z}/18\\mathbb{Z}, +)$ là nhóm cyclic cấp 18 sinh bởi $[1]_{18}$.\nMột phần tử $[k]_{18} = k \\cdot [1]_{18}$ là phần tử sinh khi và chỉ khi cấp của nó bằng 18:\n$$\n\\operatorname{ord}([k]_{18}) = \\frac{18}{\\gcd(18, k)} = 18 \\iff \\gcd(18, k) = 1.\n$$\nCác số nguyên dương $k < 18$ nguyên tố cùng nhau với 18 (tức là không chia hết cho 2 và không chia hết cho 3) là:\n$$\nk \\in \\{1, 5, 7, 11, 13, 17\\}.\n$$\nVậy nhóm $\\mathbb{Z}/18\\mathbb{Z}$ có đúng $\\varphi(18) = 6$ phần tử sinh là:\n$$\n\\{[1]_{18}, [5]_{18}, [7]_{18}, [11]_{18}, [13]_{18}, [17]_{18}\\}.$$',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Cho $p$ là một số nguyên tố lẻ. Giả sử $G$ là một nhóm có cấp đúng bằng $2p$.\nChứng minh rằng $G$ chỉ có thể đẳng cấu với một trong hai cấu trúc nhóm sau:\n1. Nhóm cyclic $\\mathbb{Z}/2p\\mathbb{Z}$ (trường hợp $G$ abel).\n2. Nhóm nhị diện $D_{2p} = \\langle r, s \\mid r^p = e, s^2 = e, sr = r^{-1}s \\rangle$ (trường hợp $G$ không abel).',
            hint: 'Theo Định lý Cauchy, tồn tại phần tử r có cấp p và phần tử s có cấp 2. Xét nhóm con H = ⟨r⟩ có chỉ số 2 nên chuẩn tắc trong G, từ đó khảo sát phép liên hợp srs⁻¹.',
            solution:
              '**Bước 1: Sự tồn tại các phần tử có cấp $p$ và 2:**\nVì $p$ là số nguyên tố lẻ và $p \\mid |G| = 2p$, theo **Định lý Cauchy**, trong $G$ tồn tại một phần tử $r$ có cấp $\\operatorname{ord}(r) = p$.\nTương tự, vì $2 \\mid |G|$, tồn tại phần tử $s \\in G$ có cấp $\\operatorname{ord}(s) = 2$ ($s^2 = e, s \\neq e$).\n\n**Bước 2: Cấu trúc của nhóm con $H = \\langle r \\rangle$:**\nXét nhóm con cyclic $H = \\langle r \\rangle = \\{e, r, r^2, \\dots, r^{p-1}\\}$.\nChỉ số của $H$ trong $G$ là $[G : H] = \\frac{|G|}{|H|} = \\frac{2p}{p} = 2$.\nVì mọi nhóm con có chỉ số 2 đều là **nhóm con chuẩn tắc**, nên $H \\trianglelefteq G$.\nDo $s \\notin H$ (vì mọi phần tử khác $e$ trong $H$ đều có cấp $p$ mà $\\operatorname{ord}(s) = 2$), tập hợp $G$ được phân hoạch thành hai lớp kề rời nhau:\n$$\nG = H \\cup sH = \\{e, r, \\dots, r^{p-1}, s, sr, \\dots, sr^{p-1}\\}.\n$$\n\n**Bước 3: Khảo sát phép liên hợp $srs^{-1}$:**\nDo $H \\trianglelefteq G$, ta có $srs^{-1} \\in H$. Vì $H = \\langle r \\rangle$, tồn tại số nguyên $k \\in \\{0, 1, \\dots, p-1\\}$ sao cho:\n$$\nsrs^{-1} = r^k.\n$$\nVì $s^2 = e$ nên $s = s^{-1}$. Áp dụng liên tiếp hai lần:\n$$\nr = s^2 r s^{-2} = s(srs^{-1})s^{-1} = s(r^k)s^{-1} = (srs^{-1})^k = (r^k)^k = r^{k^2}.\n$$\nSuy ra $r^{k^2 - 1} = e$. Do $\\operatorname{ord}(r) = p$, ta có:\n$$\nk^2 \\equiv 1 \\pmod p \\iff p \\mid (k - 1)(k + 1).\n$$\nVì $p$ là số nguyên tố, chỉ có hai khả năng:\n\n- **Khả năng 1: $k \\equiv 1 \\pmod p$:**\n  Khi đó $srs^{-1} = r \\iff sr = rs$. Phần tử $r$ và $s$ giao hoán với nhau.\n  Khi đó $\\operatorname{ord}(rs) = \\operatorname{lcm}(\\operatorname{ord}(r), \\operatorname{ord}(s)) = \\operatorname{lcm}(p, 2) = 2p$.\n  Do đó phần tử $rs$ sinh ra toàn bộ nhóm $G$, suy ra $G$ là nhóm cyclic:\n  $$\nG = \\langle rs \\rangle \\cong \\mathbb{Z}/2p\\mathbb{Z}.\n  $$\n\n- **Khả năng 2: $k \\equiv -1 \\pmod p$:**\n  Khi đó $srs^{-1} = r^{-1} \\iff sr = r^{-1}s$.\n  Đây chính là quan hệ xác định của **nhóm nhị diện** $D_{2p}$ (nhóm các phép đối xứng của đa giác đều $p$ cạnh):\n  $$\nG = \\langle r, s \\mid r^p = e, s^2 = e, sr = r^{-1}s \\rangle \\cong D_{2p}.\n  $$\n\n**Kết luận:** Mọi nhóm cấp $2p$ ($p$ nguyên tố lẻ) chỉ có đúng hai lớp đẳng cấu: $\\mathbb{Z}/2p\\mathbb{Z}$ hoặc $D_{2p}$.',
          },
        ],
      },
      {
        id: 'ctds-2025-b3',
        number: 3,
        points: 2.0,
        title: 'Lớp kề, Định lý Lagrange và Ứng dụng Số học (Fermat & Euler)',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              '1. Cho $G$ là một nhóm hữu hạn và $H$ là một nhóm con của $G$. Phát biểu và chứng minh **Định lý Lagrange** về mối liên hệ giữa $|G|$, $|H|$ và chỉ số $[G : H]$.\n2. Từ Định lý Lagrange, hãy suy ra rằng:\n   - Cấp của mọi phần tử $g \\in G$ luôn là ước số của cấp nhóm $|G|$.\n   - Mọi nhóm có cấp nguyên tố $p$ đều là nhóm cyclic.',
            hint: 'Chứng minh các lớp kề trái gH lập thành một phân hoạch của G và mọi lớp kề trái đều có cùng số lượng phần tử bằng |H| thông qua song ánh tịnh tiến trái.',
            solution:
              '**1. Phát biểu và Chứng minh Định lý Lagrange:**\n- **Phát biểu:** Cho $G$ là nhóm hữu hạn và $H$ là nhóm con của $G$. Khi đó:\n$$\n|G| = [G : H] \\cdot |H|.\n$$\nTrong đó $[G : H]$ là số lượng các lớp kề trái phân biệt của $H$ trong $G$.\n\n- **Chứng minh:**\n  + Định nghĩa quan hệ tương đương trên $G$: $x \\sim y \\iff x^{-1}y \\in H$. Lớp tương đương chứa phần tử $x$ chính là lớp kề trái $xH = \\{xh \\mid h \\in H\\}$.\n  + Do quan hệ tương đương tạo nên một phân hoạch của tập hợp $G$, nên tập $G$ là hợp rời của tất cả các lớp kề trái phân biệt:\n    $$\nG = g_1 H \\cup g_2 H \\cup \\dots \\cup g_k H, \\quad \\text{với } k = [G : H].\n    $$\n  + Với mỗi $g \\in G$, xét ánh xạ tịnh tiến trái $\\lambda_g: H \\to gH, h \\mapsto gh$. Ánh xạ này là một song ánh vì:\n    * Toàn ánh: hiển nhiên theo định nghĩa $gH$.\n    * Đơn ánh: $gh_1 = gh_2 \\implies h_1 = h_2$ (luật giản ước trái trong nhóm).\n    Do đó mọi lớp kề trái đều có đúng $|H|$ phần tử: $|gH| = |H|$.\n  + Vì các lớp kề rời nhau từng đôi một, ta có:\n    $$\n|G| = \\sum_{i=1}^k |g_i H| = \\sum_{i=1}^k |H| = k \\cdot |H| = [G : H] \\cdot |H|.\n    $$\n\n**2. Các hệ quả trực tiếp:**\n- Với mỗi $g \\in G$, xét nhóm con cyclic $\\langle g \\rangle$. Cấp của phần tử là $\\operatorname{ord}(g) = |\\langle g \\rangle|$. Theo Định lý Lagrange, $|\\langle g \\rangle| \\mid |G|$, suy ra $\\operatorname{ord}(g) \\mid |G|$.\n- Nếu $|G| = p$ (số nguyên tố): Lấy phần tử $g \\in G, g \\neq e$. Cấp của $g$ là $\\operatorname{ord}(g) > 1$ và $\\operatorname{ord}(g) \\mid p$. Vì $p$ nguyên tố, bắt buộc $\\operatorname{ord}(g) = p = |G|$. Suy ra $\\langle g \\rangle = G$, tức là $G$ là một nhóm cyclic.',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              '1. Vận dụng Định lý Lagrange cho nhóm các phần tử khả nghịch $U(n) = (\\mathbb{Z}/n\\mathbb{Z})^*$, hãy chứng minh **Định lý Euler**:\n$$\na^{\\varphi(n)} \\equiv 1 \\pmod n, \\quad \\forall a \\in \\mathbb{Z}, \\; \\gcd(a, n) = 1.\n$$\nTừ đó suy ra **Định lý nhỏ Fermat** khi $n = p$ là số nguyên tố.\n2. Áp dụng: Tìm hai chữ số tận cùng của số $7^{2026}$.',
            hint: 'Hai chữ số tận cùng chính là số dư khi chia cho 100. Tính φ(100) = 100 * (1 - 1/2) * (1 - 1/5) = 40.',
            solution:
              '**1. Chứng minh Định lý Euler & Định lý nhỏ Fermat:**\n- Nhóm $U(n) = \\{[x]_n \\in \\mathbb{Z}/n\\mathbb{Z} \\mid \\gcd(x, n) = 1\\}$ với phép nhân lớp đồng dư là một nhóm hữu hạn có cấp bằng $\\varphi(n)$ (phi hàm Euler).\n- Với mọi $a \\in \\mathbb{Z}$ thỏa mãn $\\gcd(a, n) = 1$, lớp đồng dư $[a]_n \\in U(n)$.\n- Theo hệ quả Định lý Lagrange, cấp của phần tử $[a]_n$ là ước số của cấp nhóm $|U(n)| = \\varphi(n)$. Do đó:\n$$\n([a]_n)^{\\varphi(n)} = [1]_n \\iff a^{\\varphi(n)} \\equiv 1 \\pmod n.\n$$\n- Khi $n = p$ là một số nguyên tố, mọi số từ $1$ đến $p-1$ đều nguyên tố cùng nhau với $p$, nên $\\varphi(p) = p - 1$. Với mọi $a$ không chia hết cho $p$, ta có:\n$$\na^{p-1} \\equiv 1 \\pmod p \\implies a^p \\equiv a \\pmod p.\n$$\nĐây chính là phát biểu của Định lý nhỏ Fermat.\n\n**2. Tìm hai chữ số tận cùng của $7^{2026}$:**\n- Hai chữ số tận cùng của $7^{2026}$ là số dư của phép chia $7^{2026}$ cho $100$.\n- Ta có $100 = 2^2 \\cdot 5^2$. Phi hàm Euler của 100 là:\n$$\n\\varphi(100) = 100 \\left(1 - \\frac{1}{2}\\right)\\left(1 - \\frac{1}{5}\\right) = 100 \\cdot \\frac{1}{2} \\cdot \\frac{4}{5} = 40.\n$$\n- Vì $\\gcd(7, 100) = 1$, theo Định lý Euler:\n$$\n7^{40} \\equiv 1 \\pmod{100}.\n$$\n- Phân tích số mũ: $2026 = 40 \\cdot 50 + 26$. Khi đó:\n$$\n7^{2026} = (7^{40})^{50} \\cdot 7^{26} \\equiv 1^{50} \\cdot 7^{26} \\equiv 7^{26} \\pmod{100}.\n$$\n- Ta tính $7^{26} \\pmod{100}$:\n  + $7^2 = 49 \\equiv -51 \\pmod{100}$.\n  + $7^4 = (49)^2 = 2401 \\equiv 1 \\pmod{100}$ (thậm chí cấp của 7 modulo 100 chỉ bằng 4).\n- Do $26 = 4 \\cdot 6 + 2$, ta có:\n$$\n7^{26} = (7^4)^6 \\cdot 7^2 \\equiv 1^6 \\cdot 49 \\equiv 49 \\pmod{100}.\n$$\n**Kết luận:** Hai chữ số tận cùng của $7^{2026}$ là **49**.',
          },
        ],
      },
      {
        id: 'ctds-2025-b4',
        number: 4,
        points: 2.0,
        title: 'Nhóm con Chuẩn tắc, Nhóm thương và Định lý Đẳng cấu thứ nhất',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              '1. Cho $G$ là một nhóm và $H$ là một nhóm con của $G$ có chỉ số $[G : H] = 2$. Chứng minh rằng $H$ là một **nhóm con chuẩn tắc** của $G$ ($H \\trianglelefteq G$).\n2. Nêu một ví dụ chứng minh rằng một nhóm con có chỉ số bằng 3 chưa chắc đã chuẩn tắc.',
            hint: 'Khi [G:H] = 2, hai lớp kề trái là H và G \\ H. Hai lớp kề phải cũng là H và G \\ H.',
            solution:
              '**1. Chứng minh mọi nhóm con chỉ số 2 đều chuẩn tắc:**\n- Giả sử $[G : H] = 2$. Khi đó có đúng 2 lớp kề trái của $H$ trong $G$.\n- Một lớp kề trái là $eH = H$. Lớp kề trái còn lại bắt buộc phải là phần bù của $H$ trong $G$, tức là $G \\setminus H$.\n  Do đó với mọi $g \\notin H$, ta có $gH = G \\setminus H$.\n- Hoàn toàn tương tự, có đúng 2 lớp kề phải của $H$ trong $G$: một lớp là $He = H$ và lớp còn lại là $G \\setminus H$.\n  Do đó với mọi $g \\notin H$, ta có $Hg = G \\setminus H$.\n- Xét mọi phần tử $g \\in G$:\n  + Nếu $g \\in H$: hiển nhiên $gH = H = Hg$.\n  + Nếu $g \\notin H$: theo lập luận trên, $gH = G \\setminus H = Hg$.\n- Vậy với mọi $g \\in G$, ta luôn có $gH = Hg$, tương đương $gHg^{-1} = H$. Theo định nghĩa, $H \\trianglelefteq G$.\n\n**2. Phản ví dụ với nhóm con có chỉ số bằng 3:**\n- Xét nhóm đối xứng $S_3 = \\{e, (1\\;2), (1\\;3), (2\\;3), (1\\;2\\;3), (1\\;3\\;2)\\}$ có cấp $|S_3| = 6$.\n- Xét nhóm con $H = \\langle (1\\;2) \\rangle = \\{e, (1\\;2)\\}$ có cấp 2. Chỉ số của $H$ là $[S_3 : H] = 6/2 = 3$.\n- Lấy $g = (1\\;3) \\in S_3$. Ta tính phép liên hợp:\n$$\ng(1\\;2)g^{-1} = (1\\;3)(1\\;2)(1\\;3) = (2\\;3) \\notin H.\n$$\nDo $gHg^{-1} \\neq H$, nhóm con $H$ **không phải** là nhóm con chuẩn tắc của $S_3$.',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              'Xét ánh xạ $\\varphi: (\\mathbb{C}^*, \\cdot) \\to (\\mathbb{R}^*, \\cdot)$ xác định bởi $\\varphi(z) = |z|$ với mọi $z \\in \\mathbb{C}^*$.\n1. Chứng minh $\\varphi$ là một đồng cấu nhóm.\n2. Xác định hạt nhân $\\ker \\varphi$ và ảnh $\\operatorname{Im}\\varphi$.\n3. Áp dụng **Định lý đẳng cấu thứ nhất**, hãy chỉ ra một đẳng cấu nhóm tự nhiên giữa nhóm thương $\\mathbb{C}^*/\\mathbb{S}^1$ và nhóm $(\\mathbb{R}_+^*, \\cdot)$.',
            hint: 'Định lý đẳng cấu thứ nhất: G/ker φ ≅ Im φ. Hạt nhân là tập các số phức có môđun bằng 1, tức đường tròn đơn vị S¹.',
            solution:
              '**1. Chứng minh $\\varphi$ là đồng cấu nhóm:**\nVới mọi $z_1, z_2 \\in \\mathbb{C}^*$, theo tính chất môđun của tích hai số phức:\n$$\n\\varphi(z_1 z_2) = |z_1 z_2| = |z_1| \\cdot |z_2| = \\varphi(z_1) \\cdot \\varphi(z_2).\n$$\nVậy $\\varphi$ là một đồng cấu nhóm từ $(\\mathbb{C}^*, \\cdot)$ vào $(\\mathbb{R}^*, \\cdot)$.\n\n**2. Xác định $\\ker \\varphi$ và $\\operatorname{Im}\\varphi$:**\n- Phần tử đơn vị của nhóm đích $(\\mathbb{R}^*, \\cdot)$ là $1$.\n- Hạt nhân của $\\varphi$:\n$$\n\\ker \\varphi = \\{z \\in \\mathbb{C}^* \\mid \\varphi(z) = 1\\} = \\{z \\in \\mathbb{C} \\mid |z| = 1\\} = \\mathbb{S}^1.\n$$\nĐây chính là nhóm đường tròn đơn vị trên mặt phẳng phức.\n- Nhóm ảnh của $\\varphi$:\nVì môđun của mọi số phức khác không luôn là một số thực dương ($|z| > 0$), và với bất kỳ số thực dương $r > 0$, ta luôn có $\\varphi(r) = |r| = r$, nên:\n$$\n\\operatorname{Im}\\varphi = \\{|z| \\mid z \\in \\mathbb{C}^*\\} = \\mathbb{R}_+^* = (0, +\\infty).\n$$\n\n**3. Áp dụng Định lý đẳng cấu thứ nhất:**\nTheo **Định lý đẳng cấu thứ nhất** cho nhóm (First Isomorphism Theorem):\n$$\n\\mathbb{C}^*/\\ker \\varphi \\cong \\operatorname{Im}\\varphi.\n$$\nThay $\\ker \\varphi = \\mathbb{S}^1$ và $\\operatorname{Im}\\varphi = \\mathbb{R}_+^*$, ta nhận được đẳng cấu tự nhiên:\n$$\n\\mathbb{C}^*/\\mathbb{S}^1 \\cong (\\mathbb{R}_+^*, \\cdot).\n$$\nÁnh xạ đẳng cấu cảm sinh là $\\bar{\\varphi}: \\mathbb{C}^*/\\mathbb{S}^1 \\to \\mathbb{R}_+^*, z\\mathbb{S}^1 \\mapsto |z|$.',
          },
        ],
      },
      {
        id: 'ctds-2025-b5',
        number: 5,
        points: 2.0,
        title: 'Vành, Trường, I-đê-an và Tiêu chuẩn Bất khả quy Eisenstein',
        parts: [
          {
            label: 'a',
            points: 1.0,
            statement:
              'Xét tập hợp các số nguyên Gauss $\\mathbb{Z}[i] = \\{a + bi \\mid a, b \\in \\mathbb{Z}\\}$, trong đó $i^2 = -1$.\n1. Chứng minh rằng $\\mathbb{Z}[i]$ là một miền nguyên.\n2. Định nghĩa chuẩn $N(a + bi) = a^2 + b^2$. Tìm tất cả các phần tử khả nghịch trong vành $\\mathbb{Z}[i]$ (tức nhóm $U(\\mathbb{Z}[i])$).',
            hint: 'Z[i] là vành con của trường số phức C nên không có ước của không. Phần tử z khả nghịch khi và chỉ khi N(z) = 1.',
            solution:
              '**1. Chứng minh $\\mathbb{Z}[i]$ là miền nguyên:**\n- Rõ ràng $\\mathbb{Z}[i]$ là một tập con của trường số phức $\\mathbb{C}$, đóng dưới phép trừ và phép nhân:\n  + $(a + bi) - (c + di) = (a - c) + (b - d)i \\in \\mathbb{Z}[i]$.\n  + $(a + bi)(c + di) = (ac - bd) + (ad + bc)i \\in \\mathbb{Z}[i]$.\n  + Chứa phần tử $1 = 1 + 0i \\neq 0$.\n  Do đó $\\mathbb{Z}[i]$ là một vành giao hoán có đơn vị.\n- Vì $\\mathbb{Z}[i] \\subset \\mathbb{C}$ và $\\mathbb{C}$ là một trường nên không có ước của không: nếu $z_1 z_2 = 0$ thì bắt buộc $z_1 = 0$ hoặc $z_2 = 0$. Vậy $\\mathbb{Z}[i]$ là một **miền nguyên**.\n\n**2. Tìm các phần tử khả nghịch $U(\\mathbb{Z}[i])$:**\n- Với mỗi $z = a + bi \\in \\mathbb{Z}[i]$, chuẩn $N(z) = a^2 + b^2 = |z|^2$ thỏa mãn tính chất nhân tính: $N(z_1 z_2) = N(z_1) N(z_2)$.\n- Giả sử $z$ khả nghịch trong $\\mathbb{Z}[i]$, khi đó tồn tại $w \\in \\mathbb{Z}[i]$ sao cho $zw = 1$.\n- Lấy chuẩn hai vế: $N(zw) = N(z)N(w) = N(1) = 1$.\n- Vì $a, b \\in \\mathbb{Z}$, $N(z) = a^2 + b^2$ là một số nguyên không âm. Do đó $N(z) \\mid 1 \\implies N(z) = 1$.\n- Phương trình nghiệm nguyên $a^2 + b^2 = 1$ chỉ có 4 nghiệm $(a, b)$ là:\n$$\n(1, 0), \\; (-1, 0), \\; (0, 1), \\; (0, -1).\n$$\n- Tương ứng với 4 phần tử:\n$$\nU(\\mathbb{Z}[i]) = \\{1, -1, i, -i\\}.\n$$\nĐây là một nhóm cyclic cấp 4 sinh bởi $i$.',
          },
          {
            label: 'b',
            points: 1.0,
            statement:
              '1. Phát biểu **Tiêu chuẩn bất khả quy Eisenstein** đối với đa thức trong $\\mathbb{Z}[X]$.\n2. Cho đa thức $P(X) = X^5 - 4X + 2 \\in \\mathbb{Z}[X]$.\n   - Chứng minh $P(X)$ bất khả quy trên $\\mathbb{Q}[X]$.\n   - Chứng minh rằng i-đê-an $\\langle X^5 - 4X + 2 \\rangle$ là một **i-đê-an cực đại** trong vành $\\mathbb{Q}[X]$, và vành thương $\\mathbb{Q}[X]/\\langle X^5 - 4X + 2 \\rangle$ là một **trường**.',
            hint: 'Áp dụng Eisenstein với số nguyên tố p = 2. Trong vành chính Q[X], một i-đê-an sinh bởi đa thức bất khả quy luôn là cực đại.',
            solution:
              '**1. Phát biểu Tiêu chuẩn Eisenstein:**\nCho đa thức $f(X) = a_n X^n + a_{n-1} X^{n-1} + \\dots + a_1 X + a_0 \\in \\mathbb{Z}[X]$ với $n \\ge 1$.\nNếu tồn tại một số nguyên tố $p$ thỏa mãn ba điều kiện sau:\n1. $p \\mid a_i$ với mọi $i = 0, 1, \\dots, n - 1$,\n2. $p \\nmid a_n$,\n3. $p^2 \\nmid a_0$,\nthì đa thức $f(X)$ là **bất khả quy trên trường số hữu tỉ $\\mathbb{Q}$** (và bất khả quy trong $\\mathbb{Z}[X]$ nếu $\\gcd(a_0, \\dots, a_n) = 1$).\n\n**2. Áp dụng cho đa thức $P(X) = X^5 - 4X + 2$:**\n- Các hệ số của $P(X)$ là: $a_5 = 1, a_4 = a_3 = a_2 = 0, a_1 = -4, a_0 = 2$.\n- Chọn số nguyên tố $p = 2$, ta kiểm tra:\n  + $2 \\mid a_0 = 2, \\; 2 \\mid a_1 = -4, \\; 2 \\mid a_2 = a_3 = a_4 = 0$,\n  + $2 \\nmid a_5 = 1$,\n  + $2^2 = 4 \\nmid a_0 = 2$.\n- Ba điều kiện của Tiêu chuẩn Eisenstein đều được thỏa mãn, suy ra $P(X)$ là **đa thức bất khả quy trên $\\mathbb{Q}[X]$**.\n\n**3. Chứng minh tính cực đại và cấu trúc trường thương:**\n- Vành đa thức $\\mathbb{Q}[X]$ là một **vành i-đê-an chính (PID)** (vì $\\mathbb{Q}$ là một trường).\n- Trong một vành i-đê-an chính, một i-đê-an khác không $\\langle f(X) \\rangle$ là **i-đê-an cực đại** khi và chỉ khi phần tử sinh $f(X)$ là bất khả quy.\n- Vì $P(X)$ bất khả quy trên $\\mathbb{Q}$, i-đê-an $I = \\langle X^5 - 4X + 2 \\rangle$ là một **i-đê-an cực đại** của $\\mathbb{Q}[X]$.\n- Theo định lý tổng quát về vành thương: Một vành thương $R/M$ là một trường khi và chỉ khi $M$ là một i-đê-an cực đại của vành giao hoán có đơn vị $R$.\n- Do đó, vành thương $\\mathbb{Q}[X]/\\langle X^5 - 4X + 2 \\rangle$ là một **trường** (chính là trường mở rộng đại số bậc 5 của $\\mathbb{Q}$).',
          },
        ],
      },
    ],
  },
  // =========================================================================
  // ĐỀ 2: NĂM HỌC 2024-2025 - HỌC KỲ I (90 PHÚT)
  // =========================================================================
  {
    id: 'ctds-exam-2024-2025-hk1',
    year: '2024-2025',
    semester: 'Học kỳ I',
    durationMinutes: 90,
    title: 'Đề thi Kết thúc Học phần Cấu trúc Đại số — Năm học 2024-2025 (HK1)',
    description:
      'Đề cương ôn tập và đề thi mẫu chuẩn sư phạm năm học 2024-2025: Bảng Cayley và phân loại nhóm cấp 4, Nhóm cyclic và cấu trúc nhóm con, Đồng cấu nhóm và định lý đẳng cấu, I-đê-an nguyên tố và i-đê-an cực đại trong Z[X], Trường các thương của miền nguyên.',
    originalImagePath: '/docs/cau-truc-dai-so/exams/de-ctds-2024-2025-hk1.png',
    problems: [
      {
        id: 'ctds-2024-b1',
        number: 1,
        points: 2.0,
        title: 'Bảng Cayley và Phân loại Nhóm cấp 4',
        statement:
          '1. Chứng minh rằng trong bảng Cayley của một nhóm hữu hạn, mỗi phần tử của nhóm xuất hiện đúng một lần trên mỗi hàng và mỗi cột.\n2. Vận dụng tính chất trên, hãy chứng minh rằng mọi nhóm cấp 4 chỉ có thể đẳng cấu với nhóm cyclic $\\mathbb{Z}/4\\mathbb{Z}$ hoặc nhóm bốn Klein $V_4 = \\mathbb{Z}/2\\mathbb{Z} \\times \\mathbb{Z}/2\\mathbb{Z}$.',
        hint: 'Xét cấp của các phần tử khác e: nếu có phần tử cấp 4 thì là Z/4Z, nếu mọi phần tử khác e đều có cấp 2 thì là V_4.',
        solution:
          '**1. Tính chất bảng Cayley:**\n- Hàng ứng với phần tử $a$ là ảnh của song ánh tịnh tiến trái $L_a: x \\mapsto ax$. Vì $L_a$ là song ánh nên mỗi phần tử $y \\in G$ xuất hiện đúng một lần tại cột $x = a^{-1}y$.\n- Tương tự, cột ứng với $b$ là ảnh của song ánh tịnh tiến phải $R_b: x \\mapsto xb$, nên mỗi phần tử xuất hiện đúng một lần trên mỗi cột.\n\n**2. Phân loại nhóm cấp 4:**\n- Giả sử $G = \\{e, a, b, c\\}$ là nhóm cấp 4. Theo Định lý Lagrange, cấp của mọi phần tử khác $e$ chỉ có thể là 2 hoặc 4.\n- Nếu $G$ có ít nhất một phần tử cấp 4 (giả sử là $a$): Khi đó $\\langle a \\rangle = \\{e, a, a^2, a^3\\} = G$, suy ra $G \\cong \\mathbb{Z}/4\\mathbb{Z}$.\n- Nếu $G$ không có phần tử cấp 4: Khi đó mọi phần tử khác $e$ đều có cấp 2, tức là $a^2 = b^2 = c^2 = e$.\n  Khi đó tích $ab$ không thể bằng $a$ (vì $b \\neq e$), không thể bằng $b$ (vì $a \\neq e$), và không thể bằng $e$ (vì nếu $ab = e$ thì $b = a^{-1} = a$, mâu thuẫn). Do đó bắt buộc $ab = c$.\n  Tương tự $ba = c, bc = cb = a, ca = ac = b$.\n  Bảng Cayley hoàn toàn đối xứng qua đường chéo chính và gồm toàn phần tử $e$ trên đường chéo chính. Đây chính là cấu trúc của **nhóm bốn Klein $V_4$**.',
      },
      {
        id: 'ctds-2024-b2',
        number: 2,
        points: 2.0,
        title: 'Cấu trúc Nhóm con của Nhóm Cyclic',
        statement:
          'Cho $G = \\langle a \\rangle$ là một nhóm cyclic cấp $n$.\n1. Chứng minh rằng mọi nhóm con của $G$ đều là nhóm cyclic.\n2. Chứng minh rằng với mỗi ước số dương $d$ của $n$, tồn tại duy nhất một nhóm con của $G$ có cấp đúng bằng $d$, và chỉ ra phần tử sinh của nhóm con đó.',
        hint: 'Lấy H là nhóm con của G. Xét số nguyên dương m nhỏ nhất sao cho a^m thuộc H.',
        solution:
          '**1. Mọi nhóm con của nhóm cyclic đều là nhóm cyclic:**\n- Lấy $H \\le G = \\langle a \\rangle$. Nếu $H = \\{e\\} = \\langle e \\rangle$ thì hiển nhiên $H$ cyclic.\n- Nếu $H \\neq \\{e\\}$, tồn tại $a^k \\in H$ với $k \\neq 0$. Vì $H$ là nhóm con nên $a^{-k} \\in H$. Do đó tập các số nguyên dương $S = \\{m \\in \\mathbb{Z}^+ \\mid a^m \\in H\\}$ khác rỗng.\n- Theo nguyên lý sắp thứ tự tốt, $S$ có phần tử nhỏ nhất, gọi là $m_0$. Ta chứng minh $H = \\langle a^{m_0} \\rangle$.\n  + Rõ ràng $\\langle a^{m_0} \\rangle \\subseteq H$.\n  + Lấy tùy ý $h \\in H$. Do $G = \\langle a \\rangle$, ta có $h = a^t$ với $t \\in \\mathbb{Z}$. Thực hiện phép chia Euclid $t$ cho $m_0$: $t = q m_0 + r$ với $0 \\le r < m_0$.\n  + Khi đó $a^r = a^{t - q m_0} = a^t (a^{m_0})^{-q} = h (a^{m_0})^{-q} \\in H$.\n  + Vì $m_0$ là số nguyên dương nhỏ nhất thuộc $S$ mà $0 \\le r < m_0$, bắt buộc $r = 0$.\n  + Do đó $t = q m_0$, kéo theo $h = (a^{m_0})^q \\in \\langle a^{m_0} \\rangle$.\n  Vậy $H = \\langle a^{m_0} \\rangle$ là nhóm cyclic.\n\n**2. Tính duy nhất của nhóm con cấp $d$ ($d \\mid n$):**\n- Đặt $m = n/d$. Xét nhóm con $H_d = \\langle a^m \\rangle = \\langle a^{n/d} \\rangle$.\n  Cấp của $a^{n/d}$ là $\\frac{n}{\\gcd(n, n/d)} = \\frac{n}{n/d} = d$, do đó $|H_d| = d$.\n- Giả sử $H$ là một nhóm con bất kỳ của $G$ có cấp $d$. Theo chứng minh ở câu 1, $H = \\langle a^k \\rangle$ với $k$ là số nguyên dương nhỏ nhất sao cho $a^k \\in H$.\n- Ta có $d = |H| = \\operatorname{ord}(a^k) = \\frac{n}{\\gcd(n, k)} \\implies \\gcd(n, k) = \\frac{n}{d} = m$.\n- Vì $k$ nhỏ nhất và chia hết cho $m$, bắt buộc $k = m = n/d$. Do đó $H = H_d$ là duy nhất.',
      },
      {
        id: 'ctds-2024-b3',
        number: 3,
        points: 2.0,
        title: 'Đồng cấu Nhóm và Nhóm Tự đẳng cấu Aut(Z_n)',
        statement:
          '1. Tìm tất cả các đồng cấu nhóm từ $(\\mathbb{Z}, +)$ vào $(\\mathbb{Z}/12\\mathbb{Z}, +)$.\n2. Chứng minh rằng nhóm tự đẳng cấu $\\operatorname{Aut}(\\mathbb{Z}/n\\mathbb{Z})$ đẳng cấu với nhóm nhân các phần tử khả nghịch $U(n) = (\\mathbb{Z}/n\\mathbb{Z})^*$.',
        hint: 'Một đồng cấu từ nhóm cyclic được xác định hoàn toàn bởi ảnh của phần tử sinh 1.',
        solution:
          '**1. Tìm tất cả các đồng cấu từ $\\mathbb{Z}$ vào $\\mathbb{Z}/12\\mathbb{Z}$:**\n- Vì $\\mathbb{Z} = \\langle 1 \\rangle$ là nhóm cyclic tự do, một đồng cấu $\\varphi: \\mathbb{Z} \\to \\mathbb{Z}/12\\mathbb{Z}$ được xác định hoàn toàn bởi giá trị $\\varphi(1) = [a]_{12}$.\n- Với bất kỳ lựa chọn $[a]_{12} \\in \\mathbb{Z}/12\\mathbb{Z}$, ánh xạ $\\varphi_a(k) = k \\cdot [a]_{12} = [ka]_{12}$ luôn là một đồng cấu nhóm vì:\n$$\n\\varphi_a(k + m) = [(k + m)a]_{12} = [ka]_{12} + [ma]_{12} = \\varphi_a(k) + \\varphi_a(m).\n$$\n- Có đúng 12 lớp thặng dư $[a]_{12}$ trong $\\mathbb{Z}/12\\mathbb{Z}$, nên có đúng 12 đồng cấu nhóm phân biệt.\n\n**2. Chứng minh $\\operatorname{Aut}(\\mathbb{Z}/n\\mathbb{Z}) \\cong U(n)$:**\n- Mỗi tự đẳng cấu $\\theta \\in \\operatorname{Aut}(\\mathbb{Z}/n\\mathbb{Z})$ là một đồng cấu song ánh từ $\\mathbb{Z}/n\\mathbb{Z}$ vào chính nó.\n- Vì $\\theta$ là đẳng cấu, nó phải biến phần tử sinh $[1]_n$ thành một phần tử sinh của $\\mathbb{Z}/n\\mathbb{Z}$.\n- Một phần tử $[u]_n$ là phần tử sinh khi và chỉ khi $\\gcd(u, n) = 1$, tức là $[u]_n \\in U(n)$.\n- Xét ánh xạ $\\Phi: \\operatorname{Aut}(\\mathbb{Z}/n\\mathbb{Z}) \\to U(n)$ định nghĩa bởi $\\Phi(\\theta) = \\theta([1]_n)$:\n  + Bảo toàn phép toán: $\\Phi(\\theta_1 \\circ \\theta_2) = (\\theta_1 \\circ \\theta_2)([1]_n) = \\theta_1([u_2]_n) = u_2 \\theta_1([1]_n) = [u_2 u_1]_n = \\Phi(\\theta_1) \\Phi(\\theta_2)$.\n  + Đơn ánh: Nếu $\\theta([1]_n) = [1]_n$ thì $\\theta([k]_n) = k[1]_n = [k]_n$, suy ra $\\theta = \\operatorname{id}$.\n  + Toàn ánh: Với mỗi $[u]_n \\in U(n)$, ánh xạ $\\theta_u([k]_n) = [ku]_n$ là một tự đẳng cấu.\n- Vậy $\\Phi$ là một đẳng cấu nhóm: $\\operatorname{Aut}(\\mathbb{Z}/n\\mathbb{Z}) \\cong U(n)$.',
      },
      {
        id: 'ctds-2024-b4',
        number: 4,
        points: 2.0,
        title: 'I-đê-an Nguyên tố và I-đê-an Cực đại trong Vành Giao hoán',
        statement:
          'Cho $R$ là một vành giao hoán có đơn vị $1 \\neq 0$ và $I$ là một i-đê-an chính thống của $R$.\n1. Chứng minh rằng $I$ là một **i-đê-an nguyên tố** khi và chỉ khi vành thương $R/I$ là một miền nguyên.\n2. Chứng minh rằng $I$ là một **i-đê-an cực đại** khi và chỉ khi vành thương $R/I$ là một trường. Từ đó suy ra mọi i-đê-an cực đại đều là i-đê-an nguyên tố.',
        hint: 'R/I là miền nguyên khi không có ước của không. R/I là trường khi mọi phần tử khác 0 đều khả nghịch.',
        solution:
          '**1. I là i-đê-an nguyên tố $\\iff R/I$ là miền nguyên:**\n- Theo định nghĩa, $I$ nguyên tố $\\iff (ab \\in I \\implies a \\in I \\lor b \\in I)$.\n- Trong vành thương $R/I$, điều này tương đương với:\n$$\n(a + I)(b + I) = 0 + I \\implies a + I = 0 + I \\quad \\text{hoặc} \\quad b + I = 0 + I.\n$$\nĐiều này khẳng định $R/I$ không có ước của không. Vì $R$ giao hoán có đơn vị $1 \\notin I$ nên $R/I$ là một miền nguyên.\n\n**2. I là i-đê-an cực đại $\\iff R/I$ là một trường:**\n- Giả sử $I$ cực đại. Lấy phần tử $a + I \\neq 0 + I$ trong $R/I$, tức là $a \\notin I$.\n  Xét i-đê-an $J = I + Ra = \\{x + ra \\mid x \\in I, r \\in R\\}$.\n  Vì $a \\in J$ mà $a \\notin I$ nên $I \\subsetneq J$. Do $I$ cực đại, bắt buộc $J = R$.\n  Vì $1 \\in R = J$, tồn tại $x \\in I, b \\in R$ sao cho $x + ba = 1$.\n  Chuyển sang vành thương: $(b + I)(a + I) = 1 - x + I = 1 + I$.\n  Vậy mọi phần tử khác $0$ trong $R/I$ đều khả nghịch, suy ra $R/I$ là một trường.\n- Ngược lại, nếu $R/I$ là một trường: Giả sử tồn tại i-đê-an $J$ sao cho $I \\subsetneq J \\subseteq R$.\n  Lấy $a \\in J \\setminus I$, khi đó $a + I \\neq 0 + I$ trong trường $R/I$.\n  Do $R/I$ là trường, tồn tại $b + I$ sao cho $(b + I)(a + I) = 1 + I \\implies ba - 1 \\in I \\subset J$.\n  Vì $a \\in J$ nên $ba \\in J$, suy ra $1 = ba - (ba - 1) \\in J$. Do đó $J = R$. Vậy $I$ cực đại.\n- **Hệ quả:** Vì mọi trường đều là miền nguyên, nên nếu $I$ cực đại thì $R/I$ là trường $\\implies R/I$ là miền nguyên $\\implies I$ là i-đê-an nguyên tố.',
      },
      {
        id: 'ctds-2024-b5',
        number: 5,
        points: 2.0,
        title: 'Trường các Thương của Miền nguyên và Tính chất Phổ dụng',
        statement:
          '1. Trình bày các bước dựng trường các thương $\\operatorname{Frac}(R)$ từ một miền nguyên $R$.\n2. Nêu tính chất phổ dụng của $\\operatorname{Frac}(R)$ và giải thích vì sao trường các thương của vành đa thức $\\mathbb{R}[X]$ chính là trường các hàm phân thức hữu tỉ $\\mathbb{R}(X)$.',
        hint: 'Dựng qua quan hệ tương đương (a, b) ~ (c, d) <=> ad = bc trên R x (R \\ {0}).',
        solution:
          '**1. Các bước dựng trường các thương $\\operatorname{Frac}(R)$:**\n- **Bước 1 (Tập hợp các cặp):** Xét tập $X = R \\times (R \\setminus \\{0\\})$. Cặp $(a, b)$ đóng vai trò phân số thô $a/b$.\n- **Bước 2 (Quan hệ tương đương):** Định nghĩa $(a, b) \\sim (c, d) \\iff ad = bc$. Nhờ $R$ là miền nguyên (không có ước của không), quan hệ $\\sim$ có tính bắc cầu, do đó là một quan hệ tương đương.\n- **Bước 3 (Định nghĩa phép toán trên tập thương):** Đặt $K = X/\\sim$, ký hiệu lớp $[(a, b)]$ là $\\frac{a}{b}$:\n  + Phép cộng: $\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$.\n  + Phép nhân: $\\frac{a}{b} \\cdot \\frac{c}{d} = \\frac{ac}{bd}$.\n  Các phép toán được chứng minh xác định tốt (không phụ thuộc vào đại diện).\n- **Bước 4 (Cấu trúc trường):** $(K, +, \\cdot)$ là một trường với đơn vị cộng $0/1$, đơn vị nhân $1/1$, và nghịch đảo của $\\frac{a}{b} \\neq 0$ là $\\frac{b}{a}$.\n\n**2. Tính chất phổ dụng và trường phân thức $\\mathbb{R}(X)$:**\n- **Tính chất phổ dụng:** Tồn tại một đơn cấu vành chính tắc $\\iota: R \\hookrightarrow \\operatorname{Frac}(R), a \\mapsto a/1$. Với bất kỳ trường $F$ nào và bất kỳ đơn cấu vành $f: R \\hookrightarrow F$, luôn tồn tại duy nhất một đồng cấu trường $\\tilde{f}: \\operatorname{Frac}(R) \\to F$ sao cho $\\tilde{f} \\circ \\iota = f$, xác định bởi $\\tilde{f}(a/b) = f(a) f(b)^{-1}$.\n- **Áp dụng cho $R = \\mathbb{R}[X]$:**\n  Vành đa thức $\\mathbb{R}[X]$ là một miền nguyên. Trường các thương $\\operatorname{Frac}(\\mathbb{R}[X])$ gồm các lớp tương đương của các cặp $(P(X), Q(X))$ với $Q(X) \\neq 0$, tức là các phân thức hữu tỉ $\\frac{P(X)}{Q(X)}$. Đây chính là trường hàm phân thức hữu tỉ $\\mathbb{R}(X)$.',
      },
    ],
  },
];
