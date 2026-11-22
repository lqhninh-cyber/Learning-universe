import type { ExamDocument } from './types';

export const SAMPLE_THPT_2025_MARKUP = `PHẦN I. Thí sinh trả lời từ câu 1 đến câu 5. Mỗi câu hỏi thí sinh chỉ chọn một phương án.

Câu 1: Một người chia thời lượng (đơn vị: giây) thực hiện các cuộc gọi điện thoại của mình trong một tuần thành sáu nhóm và lập bảng tần số ghép nhóm như sau.
| **Nhóm** | $[0;40)$ | $[40;80)$ | $[80;120)$ | $[120;160)$ | $[160;200)$ | $[200;240)$ |
| --- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Tần số** | 11 | 10 | 6 | 8 | 4 | 1 |
Tứ phân vị thứ ba $Q_3$ (đơn vị: giây) của mẫu số liệu ghép nhóm trên bằng
A. $145.$
*B. $140.$
C. $135.$
D. $130.$

Câu 2: Trong không gian với hệ tọa độ $Oxyz$, cho đường thẳng $(d): \\frac{x-3}{4} = \\frac{y+2}{-5} = \\frac{z-1}{2}$. Vectơ nào sau đây là một vectơ chỉ phương của đường thẳng $(d)$?
A. $\\overrightarrow{v_3} = (4; 5; 2).$
B. $\\overrightarrow{v_1} = (3; -2; 1).$
C. $\\overrightarrow{v_4} = (3; 2; 1).$
*D. $\\overrightarrow{v_2} = (4; -5; 2).$

Câu 3: Họ nguyên hàm của hàm số $f(x) = x^2$ là
*A. $\\frac{1}{3}x^3 + C.$
B. $2x^3 + C.$
C. $3x^3 + C.$
D. $\\frac{1}{2}x^3 + C.$

Câu 4: Tập nghiệm của phương trình $\\sin x = 0$ là
A. $S = \\left\\{\\frac{\\pi}{2} + k\\pi \\mid k \\in \\mathbb{Z}\\right\\}.$
B. $S = \\{k2\\pi \\mid k \\in \\mathbb{Z}\\}.$
C. $S = \\left\\{\\frac{\\pi}{2} + k2\\pi \\mid k \\in \\mathbb{Z}\\right\\}.$
*D. $S = \\{k\\pi \\mid k \\in \\mathbb{Z}\\}.$

Câu 5: Trong mặt phẳng với hệ tọa độ $Oxy$, diện tích $S$ của hình phẳng giới hạn bởi đồ thị hàm số $y = 2x - 3$, trục hoành và hai đường thẳng $x = 1$, $x = 2$ được xác định bằng công thức
A. $S = \\pi\\int_{1}^{2} |2x-3|\\,\\mathrm{d}x.$
*B. $S = \\int_{1}^{2} |2x-3|\\,\\mathrm{d}x.$
C. $S = \\pi\\int_{1}^{2} (2x-3)^2\\,\\mathrm{d}x.$
D. $S = \\left|\\int_{1}^{2} (2x-3)\\,\\mathrm{d}x\\right|.$

PHẦN II. Thí sinh trả lời từ câu 1 đến câu 2. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.

Câu 1: Cho hàm số $f(x) = x^3 - 12x - 8$.
a) Hàm số đã cho có đạo hàm là $f'(x) = 3x^2 - 12$. [Đ]
b) Phương trình $f'(x) = 0$ có tập nghiệm là $S = \\{2\\}$. [S]
c) $f(2) = 24$. [S]
d) Giá trị lớn nhất của hàm số $f(x)$ trên đoạn $[-3;3]$ bằng $24$. [S]

Câu 2: Trong không gian $Oxyz$, cho mặt phẳng $(P): 2x - 4y + 3z - 9 = 0$ và điểm $A(2; 1; -4)$.
a) Vectơ $\\vec{n} = (2; -4; 3)$ là một vectơ pháp tuyến của mặt phẳng $(P)$. [Đ]
b) Điểm $A(2; 1; -4)$ nằm trên mặt phẳng $(P)$. [S]
c) Khoảng cách từ gốc tọa độ $O$ đến $(P)$ bằng $\\frac{9}{\\sqrt{29}}$. [Đ]
d) Mặt phẳng qua $A$ và song song với $(P)$ có phương trình $2x - 4y + 3z + 12 = 0$. [Đ]

PHẦN III. Thí sinh trả lời từ câu 1 đến câu 2.

Câu 1: Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình thoi với $\\widehat{ABC} = 60^\\circ$ và $AB = 2$. Biết rằng hình chiếu vuông góc của $S$ trên mặt phẳng $(ABCD)$ là trọng tâm $H$ của tam giác $ABC$ và $SH = \\sqrt{3}$. Khoảng cách giữa hai đường thẳng $AC$ và $SD$ bằng bao nhiêu (làm tròn kết quả cuối cùng đến hàng phần trăm)?
[Đáp án: 0,85]

Câu 2: Có bốn ngăn (trong một giá để sách) được đánh số thứ tự $1, 2, 3, 4$ và bảy quyển sách khác nhau. Bạn An xếp hết bảy quyển sách nói trên vào bốn ngăn đó sao cho mỗi ngăn có ít nhất một quyển sách. Hai cách xếp được gọi là giống nhau nếu:
+ Với từng ngăn, số lượng quyển sách ở ngăn đó là như nhau trong cả hai cách xếp;
+ Với từng ngăn, thứ tự từ trái sang phải của các quyển sách là như nhau trong cả hai cách xếp.
Gọi $T$ là số cách xếp đôi một khác nhau của bạn An. Giá trị của $\\frac{T}{100}$ bằng bao nhiêu?
[Đáp án: 1008]`;

export const SAMPLE_ALGEBRA_UNIVERSITY_MARKUP = `PHẦN I. Thí sinh trả lời từ câu 1 đến câu 3. Mỗi câu hỏi thí sinh chỉ chọn một phương án.

Câu 1: Cho nhóm cyclic hữu hạn $G = \\langle a \\rangle$ cấp $12$. Số phần tử sinh của nhóm $G$ bằng
A. $2.$
*B. $4.$
C. $6.$
D. $12.$

Câu 2: Cho đồng cấu nhóm $\\varphi: G \\to G'$. Khẳng định nào sau đây là đúng theo Định lý đẳng cấu thứ nhất?
A. $G / \\operatorname{Im}\\varphi \\cong \\ker\\varphi.$
*B. $G / \\ker\\varphi \\cong \\operatorname{Im}\\varphi.$
C. $\\ker\\varphi \\cong \\operatorname{Im}\\varphi.$
D. $G \\cong \\ker\\varphi \\times \\operatorname{Im}\\varphi.$

Câu 3: Trong vành số nguyên $\\mathbb{Z}$, tập hợp các phần tử khả nghịch $U(\\mathbb{Z})$ là
A. $\\{0; 1\\}.$
B. $\\{1\\}.$
*C. $\\{-1; 1\\}.$
D. $\\mathbb{Z} \\setminus \\{0\\}.$

PHẦN II. Thí sinh trả lời từ câu 1 đến câu 1. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.

Câu 1: Xét nhóm đối xứng $S_3$ các phép thế trên tập $\\{1; 2; 3\\}$ và nhóm thay phiên $A_3$.
a) Cấp của nhóm $S_3$ bằng $6$ và $S_3$ là nhóm không giao hoán. [Đ]
b) $A_3$ là nhóm con chuẩn tắc của $S_3$ có chỉ số $[S_3 : A_3] = 2$. [Đ]
c) Mọi nhóm con cấp $2$ của $S_3$ đều là nhóm con chuẩn tắc. [S]
d) Nhóm thương $S_3 / A_3$ đẳng cấu với nhóm cộng $\\mathbb{Z}_2$. [Đ]

PHẦN IV. Thí sinh trình bày chi tiết lời giải từ câu 1 đến câu 1.

Câu 1: Cho $H$ và $K$ là hai nhóm con của nhóm $G$ với $H$ chuẩn tắc trong $G$. Chứng minh rằng $HK$ là một nhóm con của $G$ và $HK / H \\cong K / (H \\cap K)$.
[Đáp án: Áp dụng Định lý đẳng cấu thứ nhất cho đồng cấu thu hẹp $\\psi: K \\to HK/H, k \\mapsto kH$.]`;

export function createDefaultSampleExam(): ExamDocument {
  return {
    id: 'sample-toan-2025',
    title: 'ĐỀ KIỂM TRA MÔN TOÁN',
    rawMarkup: SAMPLE_THPT_2025_MARKUP,
    autoRecognizeMath: true,
    showEndLine: true,
    showAnswerKey: false,
    images: {},
    updatedAt: new Date().toISOString(),
  };
}

export function createAlgebraSampleExam(): ExamDocument {
  return {
    id: `exam-ctds-${Date.now().toString(36)}`,
    title: 'ĐỀ KIỂM TRA CẤU TRÚC ĐẠI SỐ',
    rawMarkup: SAMPLE_ALGEBRA_UNIVERSITY_MARKUP,
    autoRecognizeMath: true,
    showEndLine: true,
    showAnswerKey: true,
    images: {},
    updatedAt: new Date().toISOString(),
  };
}
