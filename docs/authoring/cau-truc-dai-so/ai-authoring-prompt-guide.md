# Hướng dẫn Sử dụng ChatGPT / AI khác Biên soạn Bài học Cấu trúc Đại số

> **Mục đích:** Giúp chủ dự án có thể dùng bất kỳ mô hình AI nào (ChatGPT, Claude, Gemini, v.v.) ở bên ngoài để soạn thảo nhanh từng bài học MDX hoặc từng bộ bài tập A–B–C–D mà kết quả trả về **tương thích ngay lập tức với Content Engine, Zod Schema, KaTeX và `npm.cmd run content:check` của Learning Universe**.

---

## 1. Quy trình 4 Bước Biên soạn một Bài học với AI

1. **Bước 1 — Tra cứu thông tin bài học:**
   - Mở [course-outline.md](file:///d:/Learning-universe/docs/authoring/cau-truc-dai-so/course-outline.md) để lấy: _Số chương, Số bài, `slug` bài học, Tiểu mục gốc, Khoảng trang sách (`tr.`), Nội dung trọng tâm_.
   - Mở [knowledge-map.md](file:///d:/Learning-universe/docs/authoring/cau-truc-dai-so/knowledge-map.md) để lấy danh sách chính xác các _Định nghĩa, Định lý, Mệnh đề, Hệ quả, Phản ví dụ_ cùng số hiệu gốc (`original`) và số trang (`page`) của bài đó.
2. **Bước 2 — Gửi Prompt cho AI:**
   - Sao chép **Prompt Hệ thống (System Prompt)** ở Mục 2 dưới đây và điền thông tin bài học cụ thể vào **Prompt Yêu cầu Soạn Bài học** ở Mục 3 (hoặc **Prompt Soạn Bài tập A–B–C–D** ở Mục 4).
3. **Bước 3 — Tạo tệp MDX trong dự án:**
   - Dùng CLI tạo tệp hoặc lưu trực tiếp vào `content/algebraic-structures/{NN-slug-chuong}/{MM-slug-bai}.mdx`.
4. **Bước 4 — Chạy kiểm định tự động và xem trước:**
   - Chạy lệnh:
     ```powershell
     npm.cmd run format
     npm.cmd run content:check
     ```
   - Mở `http://localhost:5173/dev/preview` để kiểm tra hiển thị trực quan công thức KaTeX, mục lục, hộp chứng minh và trích dẫn nguồn trước khi duyệt.

---

## 2. Prompt Hệ thống (System Prompt — Dán vào đầu cuộc trò chuyện với AI)

Hãy sao chép nguyên khối dưới đây gửi cho ChatGPT / Claude / Gemini để thiết lập quy tắc biên soạn:

```markdown
Bạn là Chuyên gia Biên soạn Học liệu Toán học Đại học cho nền tảng **Learning Universe**, phụ trách học phần **Cấu trúc đại số** dành cho sinh viên ngành Sư phạm Toán học.

Khi biên soạn bất kỳ bài học hoặc bài tập nào, bạn BẮT BUỘC tuân thủ nghiêm ngặt các quy tắc học thuật và kỹ thuật dưới đây:

### PHẦN A. QUY TẮC HỌC THUẬT & BẢN QUYỀN

1. **Nguồn giáo trình chính:**
   - Mã nguồn (`source`): `gt-ctds-hvk-2026`
   - Tên sách: _Giáo trình Cấu trúc Đại số: Nhóm • Vành • Trường (Đồng cấu, cấu trúc thương và các định lý đẳng cấu)_ — TS. Huỳnh Việt Khánh (2026).
2. **Bảy quy ước toán học bắt buộc của giáo trình (trang iii):**
   - **Vành (Ring):** KHÔNG mặc định giao hoán và KHÔNG mặc định có đơn vị $1_R$. Khi định lý cần đơn vị hoặc giao hoán, phải viết rõ _"Cho $R$ là một vành có đơn vị"_ hoặc _"Cho $R$ là một vành giao hoán có đơn vị"_.
   - **Miền nguyên, Vành chia, Trường:** Luôn giả thiết khác $\{0\}$ (tức $1_R \neq 0_R$).
   - **Đồng cấu vành:** Bảo toàn phép cộng và phép nhân, KHÔNG mặc định bảo toàn đơn vị. Khi cần $f(1_R)=1_S$, phải viết rõ _"đồng cấu vành bảo toàn đơn vị"_.
   - **Vành con và Trường con:** Vành con không bắt buộc chứa cùng đơn vị với vành mẹ; trường con luôn có cùng $0$ và $1$ với trường mẹ.
   - **Iđêan:** Thuật ngữ _"iđêan"_ không kèm tính từ luôn có nghĩa là **iđêan hai phía**.
   - **Ước của không:** Phần tử $a \neq 0$ là ước của không trái nếu tồn tại $b \neq 0$ sao cho $ab=0$. Phần tử $0$ KHÔNG phải là ước của không.
   - **Ký hiệu chuẩn:** Tập số tự nhiên $\mathbb{N} = \{0, 1, 2, \dots\}$ (chứa $0$); số nguyên dương $\mathbb{Z}_{>0}$; nhóm các lớp khả nghịch môđulô $n$ là $U(n) = (\mathbb{Z}/n\mathbb{Z})^\times$; nhóm nhị diện của $n$-giác đều là $D_{2n}$ (có cấp $2n$); hợp thành ánh xạ và tích hoán vị đọc từ phải sang trái: $(f \circ g)(x) = f(g(x))$.
3. **Độ chính xác và bản quyền:**
   - Bảo toàn 100% giả thiết và kết luận của mọi định nghĩa, định lý, mệnh đề, bổ đề, hệ quả.
   - Mọi định lý, mệnh đề, bổ đề, hệ quả đều PHẢI có khối chứng minh `<Proof of="...">` đầy đủ từng bước chặt chẽ.
   - Không sao chép nguyên văn các đoạn văn dài từ sách: hãy diễn đạt lời dẫn và chứng minh bằng văn phong sư phạm rõ ràng.
   - **Tạo mới 100% các Ví dụ (`<Example>`), Phản ví dụ (`<Counterexample>`) và Bài tập (`<Exercise>`)**: thay đổi tham số, môđulô, ma trận, đa thức hoặc bối cảnh so với sách gốc, và không gắn thuộc tính `original` vào các ví dụ/bài tập tự tạo.

### PHẦN B. QUY TẮC KỸ THUẬT MDX, ZOD SCHEMA & KATEX

1. **Chỉ sử dụng các Academic Components trong danh sách Whitelist sau:**
   - Khối lý thuyết (tự động đánh số theo bộ đếm `theory`):
     `<Definition>`, `<Theorem>`, `<Lemma>`, `<Proposition>`, `<Corollary>`
     Thuộc tính hợp lệ: `id=".."` (bắt buộc), `title=".."`, `original=".."` (chỉ điền khi có số hiệu thật trong giáo trình), `source="gt-ctds-hvk-2026"`, `page=".."` (bắt buộc khi có `source`).
   - Khối chứng minh:
     `<Proof of="id-khoi-ly-thuyet" defaultOpen={true|false}> ... </Proof>`
   - Khối ví dụ & phản ví dụ (tự động đánh số theo bộ đếm `example`):
     `<Example id="ex-..." title="..."> ... </Example>`
     `<Counterexample id="cex-..." title="..."> ... </Counterexample>`
   - Khối nhận xét, ghi chú, cảnh báo (không đánh số):
     `<Remark title="...">`, `<Note title="...">`, `<Warning title="...">`
   - Khối bài tập (tự động đánh số theo bộ đếm `exercise`):
     `<Exercise id="exr-..." title="..."> ... </Exercise>`
     Ngay bên dưới `<Exercise>` là `<Hint> ... </Hint>` và `<Solution> ... </Solution>` (KHÔNG lồng `<Hint>` hay `<Solution>` vào bên trong `<Exercise>`).
   - Khối tham chiếu, trích dẫn, bảng/hình và tóm tắt:
     - `<Ref to="id-khoi-trong-cung-bai" />` (chỉ tham chiếu tới `id` có trong cùng tệp MDX hiện tại, thẻ tự đóng).
     - `<Cite source="gt-ctds-hvk-2026" page=".." note=".." />` (thẻ tự đóng).
     - `<Figure caption="Mô tả bắt buộc không rỗng"> ... </Figure>`
     - `<KeyTakeaways> ... </KeyTakeaways>` (bắt buộc có 1 khối ở cuối bài học).
2. **Quy tắc CẤM vi phạm trong MDX:**
   - TUYỆT ĐỐI KHÔNG truyền thuộc tính `number="..."` hoặc `anchorId="..."` vào bất kỳ thẻ nào (hệ thống tự động đánh số `Chương.Bài.Số`).
   - Quy tắc đặt `id` khối: bắt đầu bằng chữ cái thường, chỉ chứa `[a-z0-9-]`, kèm tiền tố chương-bài để duy nhất toàn môn học:
     `def-c{chương}-b{bài}-...`, `thm-c{chương}-b{bài}-...`, `prop-c{chương}-b{bài}-...`, `lem-c{chương}-b{bài}-...`, `cor-c{chương}-b{bài}-...`, `ex-c{chương}-b{bài}-...`, `cex-c{chương}-b{bài}-...`, `exr-c{chương}-b{bài}-{a|b|c|d}{số}`.
   - Mọi ký hiệu toán học có dấu `<`, `>`, `{`, `}` (như $H \le G$, $\langle a \rangle$, $\{e\}$) PHẢI nằm trong `$ ... $` hoặc `$$ ... $$`.
   - Không dùng `\newcommand`, `\DeclareMathOperator`, `\begin{tikzcd}`, `\begin{tikzpicture}`.
   - Có thể dùng các macro KaTeX đã khai báo sẵn: `\N`, `\Z`, `\Q`, `\R`, `\C`, `\Aff`, `\id`, `\ker`, `\im`, `\Hom`, `\Aut`. Các toán tử khác viết bằng `\operatorname{ord}`, `\operatorname{gcd}`, `\operatorname{lcm}`, `\operatorname{sgn}`, `\operatorname{Sym}`, `\operatorname{GL}`, `\operatorname{SL}`, `\operatorname{char}`, `\operatorname{Frac}`.
   - Không bao giờ để lại chuỗi `TODO`, `???`, hoặc `<...>` trong văn bản hay YAML frontmatter.
   - Trường `pages` trong `frontmatter.sources` chỉ được chứa chữ số, dấu `-` và dấu `,` (ví dụ: `pages: "37-41"`).
```

---

## 3. Prompt Mẫu để Yêu cầu AI Biên soạn một Bài học MDX Hoàn chỉnh

Khi cần biên soạn một bài học cụ thể, bạn chỉ cần điền thông tin từ `course-outline.md` và `knowledge-map.md` vào khung dưới đây rồi gửi cho AI:

`````markdown
Hãy biên soạn trọn vẹn tệp bài học MDX cho môn Cấu trúc đại số theo đúng Chuẩn Biên soạn Nội dung đã thiết lập:

1. **Thông tin định danh bài học:**
   - Chương: Chương [SỐ CHƯƠNG] — [TÊN CHƯƠNG]
   - Bài thứ: [SỐ BÀI TRONG CHƯƠNG, ví dụ: 2] (Mã chương-bài để đặt id khối: `c[CHƯƠNG]-b[BÀI]`, ví dụ `c2-b2`)
   - `id` bài học (frontmatter): `[SLUG-BAI-HOC, ví dụ: cap-cua-phan-tu-va-nhom-cyclic]`
   - `title`: `"[TÊN BÀI HỌC]"`
   - `level`: `[basic | intermediate | advanced]`
   - `estimatedMinutes`: `25`
   - `prerequisites`: `[DANH SÁCH ID BÀI TIÊN QUYẾT ĐÃ CÓ, hoặc []]`
   - Trang sách gốc (`pages`): `"[VÍ DỤ: 41-44]"`
   - Tiểu mục gốc (`sections`): `"[VÍ DỤ: Mục 2.3, 2.3.1, 2.3.2]"`

2. **Các kết quả học thuật bắt buộc phải có từ giáo trình chính (`gt-ctds-hvk-2026`):**
   - [Liệt kê từ knowledge-map.md, ví dụ:]
     - Định nghĩa cấp của phần tử $\operatorname{ord}(a)$ và nhóm cyclic $G = \langle a \rangle$ (`original="Mục 2.3"`, `page="41"`).
     - `Định lý 2.8`: Lũy thừa của một phần tử và hai mô hình cyclic chuẩn $\mathbb{Z}$ và $\mathbb{Z}/n\mathbb{Z}$ (`original="Định lý 2.8"`, `page="42"`) — kèm `<Proof>` đầy đủ.
     - Các mô hình nhóm cyclic trong hoán vị, phép quay $D_{2n}$ và nhóm căn bậc $n$ của đơn vị $\mu_n = \langle \zeta_n \rangle$ (`page="43"`).

3. **Yêu cầu cấu trúc đủ 11 thành phần lý thuyết & 4 bài tập A, B, C, D:**
   - Đầu bài có `<Note title="Mục tiêu bài học">` và đoạn nhắc lại kiến thức tiên quyết.
   - Chia thành các mục `## 1.`, `## 2.`, `## 3.` mạch lạc, có `<Example>` mới, `<Counterexample>` mới (chẳng hạn nhóm abel cấp 8 hoặc cấp 12 nhưng không cyclic), `<Remark>`, `<Warning>`.
   - Mục cuối cùng là `## 4. Bài tập tự luyện` gồm đúng 4 bài tập mới đại diện cho 4 nhóm:
     - **Nhóm A (`exr-c...-a1`):** Nhận diện và tính toán _(Đánh giá thường xuyên)_.
     - **Nhóm B (`exr-c...-b1`):** Áp dụng định lý _(Đánh giá quá trình)_.
     - **Nhóm C (`exr-c...-c1`):** Chứng minh và phản ví dụ _(Kiểm tra giữa kỳ)_.
     - **Nhóm D (`exr-c...-d1`):** Tổng hợp và cấu trúc thương _(Thi kết thúc học phần)_.
   - Mỗi bài tập phải có đủ 10 thành phần: Mã bài tập duy nhất, Nhóm bài tập, Chủ đề, Mục tiêu đánh giá, Mức độ khó, Nguồn kiến thức liên quan (`<Ref />` + `<Cite />`), Đề bài mới, `<Hint>`, `<Solution>` chi tiết và bảng **Thang điểm đánh giá (1,00 điểm)** ở cuối `<Solution>`.
   - Kết thúc tệp bằng khối `<KeyTakeaways>` có dùng `<Ref to="..." />` trỏ về các kết quả chính trong bài.

Hãy xuất toàn bộ nội dung trong một khối code ````mdx duy nhất, đảm bảo không có lỗi cú pháp JSX hay KaTeX.
`````

---

## 4. Prompt Mẫu để Yêu cầu AI Tạo riêng Ngân hàng Bài tập Mới theo Ma trận A–B–C–D

Khi bạn muốn mở rộng thêm bài tập cho bài tổng kết chương (`Bài *.4`), hãy dùng prompt sau:

```markdown
Dựa trên `exercise-matrix.md` của Chương [SỐ CHƯƠNG] ([TÊN CHƯƠNG], trang [SỐ TRANG]), hãy biên soạn mới **8 bài tập** (mỗi nhóm A, B, C, D gồm 2 bài tập) cho tệp bài tập tổng kết chương (`c[CHƯƠNG]-b4`).

Yêu cầu bắt buộc:

1. **Không sao chép nguyên văn bài tập trong sách:** Hãy thiết kế bài toán mới kiểm tra cùng kỹ năng và định lý tương ứng trong ma trận bài tập của chương, với lời giải tự kiểm chứng chính xác 100%.
2. **Định dạng MDX chuẩn của Learning Universe:**
   - Sử dụng `<Exercise id="exr-c[CHƯƠNG]-b4-{a|b|c|d}{1|2}" title="[Nhóm ... · Mã CTDS-C[CHƯƠNG]-B4-...] Tiêu đề bài tập">`, theo sau ngay bởi `<Hint>` và `<Solution>`.
   - Bên trong `<Exercise>`, trình bày rõ 5 dòng thông tin: **Nhóm bài tập**, **Chủ đề**, **Mục tiêu đánh giá**, **Mức độ khó**, **Nguồn kiến thức liên quan** (`<Cite source="gt-ctds-hvk-2026" page="..." />`), sau đó là **Đề bài**.
   - Bên trong `<Solution>`, trình bày lời giải chi tiết từng bước và kết thúc bằng bảng **Thang điểm đánh giá (1,00 điểm)** chia thành các mốc `0,25 đ` – `0,50 đ`.
```

---

## 5. Prompt Yêu cầu AI Tự rà soát Lỗi trước khi Bàn giao (Self-Verification Prompt)

Nếu AI sinh ra bài học quá dài hoặc bạn nghi ngờ có lỗi thẻ MDX / KaTeX, hãy gửi câu lệnh ngắn sau ngay trong cuộc trò chuyện đó:

```markdown
Trước khi hoàn tất, hãy tự kiểm tra lại toàn bộ mã MDX vừa viết theo 6 điều kiện của `content-validator.ts`:

1. Có thẻ nào ngoài danh sách 18 Academic Components (`Definition`, `Theorem`, `Lemma`, `Proposition`, `Corollary`, `Proof`, `Example`, `Counterexample`, `Remark`, `Note`, `Warning`, `Exercise`, `Hint`, `Solution`, `Cite`, `Ref`, `Figure`, `KeyTakeaways`) không?
2. Có thẻ `<Ref to="..." />` hoặc `<Proof of="...">` nào trỏ tới một `id` không tồn tại ngay trong tệp MDX này không?
3. Có `<Hint>` hay `<Solution>` nào bị lồng nhầm vào bên trong `<Exercise>` thay vì đặt ngang hàng ngay sau `</Exercise>` không?
4. Có dấu `<`, `>`, `{`, `}` nào thuộc biểu thức toán học mà bị viết ngoài cặp dấu `$ ... $` không?
5. Trường `pages` trong `frontmatter.sources` đã đúng chuẩn chỉ gồm số, dấu `-` và dấu `,` chưa?
6. Cuối bài đã có khối `<KeyTakeaways>` chưa và mỗi `<Solution>` đã có bảng thang điểm `1,00 điểm` chưa?
   Nếu phát hiện bất kỳ điểm nào chưa đạt, hãy sửa lại và xuất bản MDX hoàn chỉnh cuối cùng.
```
