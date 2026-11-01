# Chuẩn Biên soạn Nội dung Học thuật — Môn Cấu trúc Đại số

> **Phạm vi áp dụng:** Toàn bộ 10 chương (`Chương 0` đến `Chương 9`) và 40 bài học của môn **Cấu trúc đại số** (`content/algebraic-structures/`) trên nền tảng Learning Universe.  
> **Tài liệu liên kết:** [source-inventory.md](file:///d:/Learning-universe/docs/authoring/cau-truc-dai-so/source-inventory.md) · [course-outline.md](file:///d:/Learning-universe/docs/authoring/cau-truc-dai-so/course-outline.md) · [knowledge-map.md](file:///d:/Learning-universe/docs/authoring/cau-truc-dai-so/knowledge-map.md) · [exercise-matrix.md](file:///d:/Learning-universe/docs/authoring/cau-truc-dai-so/exercise-matrix.md)  
> **Nguyên tắc cốt lõi:** Tuân thủ tuyệt đối hệ thống Content Engine, Zod Manifest, 18 Academic Components và bộ kiểm định `content-validator.ts` hiện có; **không tạo thêm component hay schema mới**.

---

## 1. Chuẩn Lý thuyết cho một Bài học MDX (11 Thành phần Bắt buộc)

Mỗi bài học trong môn Cấu trúc đại số phải chứa đầy đủ **11 thành phần chuẩn** theo đúng thứ tự sư phạm dưới đây:

|  STT   | Thành phần                          | Vị trí / Cách biểu diễn trong MDX                                                                        | Yêu cầu chi tiết                                                                                                                                                                                                               |
| :----: | :---------------------------------- | :------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | **Tên bài học**                     | Trường `title` trong YAML frontmatter                                                                    | Tiếng Việt chuẩn xác, khớp với [course-outline.md](file:///d:/Learning-universe/docs/authoring/cau-truc-dai-so/course-outline.md). Không đánh số thứ tự thủ công trong `title` (số bài lấy từ tiền tố tệp `NN-slug.mdx`).      |
| **2**  | **Mục tiêu bài học**                | Trường `description` trong frontmatter + Khối `<Note title="Mục tiêu bài học">` ngay đầu thân bài        | Nêu rõ 3–4 năng lực cụ thể người học đạt được sau bài học (bắt đầu bằng động từ hành động: _Phát biểu được, Kiểm tra được, Chứng minh được, Vận dụng được_).                                                                   |
| **3**  | **Kiến thức tiên quyết**            | Trường `prerequisites: [...]` trong frontmatter + dòng dẫn nhập đầu bài                                  | Trong frontmatter chỉ khai báo danh sách `id` của các bài học đã tồn tại trong kho nội dung. Trong phần mở đầu, nhắc lại ngắn gọn 1–2 khái niệm nền tảng cần dùng.                                                             |
| **4**  | **Nội dung lý thuyết**              | Các mục cấp 2 (`## 1. ...`, `## 2. ...`, `## 3. ...`) và cấp 3 (`### 1.1. ...`)                          | Dẫn dắt vấn đề trước khi đưa ra định nghĩa trừu tượng (theo đúng tinh thần _"từ hiện tượng cụ thể đến tiên đề"_ của giáo trình). Tự động sinh Mục lục (TOC) bên phải trang.                                                    |
| **5**  | **Định nghĩa**                      | `<Definition id="def-..." title="..." original="..." source="..." page="...">`                           | Nêu rõ các dữ liệu đầu vào (tập nền, phép toán), các tiên đề được đánh số rõ ràng, ký hiệu chuẩn và thuật ngữ tương đương (nếu có).                                                                                            |
| **6**  | **Mệnh đề, Bổ đề, Định lý, Hệ quả** | `<Proposition>`, `<Lemma>`, `<Theorem>`, `<Corollary>` kèm `id`, `title`, `original`, `source`, `page`   | **Bảo toàn 100% giả thiết và kết luận** của định lý gốc. Không lược bỏ các điều kiện như _"khác rỗng"_, _"hữu hạn"_, _"giao hoán"_, _"có đơn vị $1_R \neq 0_R$"_.                                                              |
| **7**  | **Chứng minh đầy đủ**               | `<Proof of="thm-..." defaultOpen={false\|true}>` đặt ngay dưới mệnh đề/định lý                           | Mọi `<Theorem>`, `<Proposition>`, `<Lemma>`, `<Corollary>` trong bài học đều **phải có chứng minh đầy đủ, chặt chẽ từng bước**, kết thúc tự động bằng ký hiệu `∎`. Các định lý trung tâm của bài đặt `defaultOpen={true}`.     |
| **8**  | **Ví dụ & Phản ví dụ**              | `<Example id="ex-..." title="...">` và `<Counterexample id="cex-..." title="...">`                       | Mỗi khái niệm/định lý chính cần ít nhất **01 Ví dụ minh họa** và **01 Phản ví dụ** chỉ ra điều gì sụp đổ khi bỏ một giả thiết. **Bắt buộc tạo ví dụ/số liệu mới**, không chép nguyên văn ví dụ trong sách.                     |
| **9**  | **Nhận xét & Lưu ý**                | `<Remark title="...">`, `<Note title="...">`, `<Warning title="...">`                                    | - `<Remark>`: Bình luận mở rộng, ý nghĩa hình học/cấu trúc.<br>- `<Note>`: Mẹo kiểm tra nhanh, quy trình giải toán, kết nối lịch sử/chương sau.<br>- `<Warning>`: Cảnh báo các ngộ nhận và bẫy sai lầm phổ biến của sinh viên. |
| **10** | **Tóm tắt kiến thức**               | `<KeyTakeaways>` đặt ở cuối bài học (sau phần Bài tập)                                                   | Tóm lược 3–5 ý cốt lõi nhất của bài dưới dạng danh sách gạch đầu dòng, có gắn `<Ref to="..." />` trỏ ngược về các định nghĩa và định lý trọng tâm. _(Trình kiểm định `content:check` sẽ cảnh báo nếu thiếu `<KeyTakeaways>`)._ |
| **11** | **Tài liệu tham khảo & Số trang**   | Trường `sources` trong frontmatter + thuộc tính `source`, `page`, `original` trên từng khối + `<Cite />` | Mọi bài ở trạng thái `review`, `approved`, `published` bắt buộc khai báo `sources` có `pages` hợp lệ (`"17-24"`, `"37, 41-45"`).                                                                                               |

---

## 2. Chuẩn Bài tập A, B, C, D (10 Thành phần Bắt buộc trên mỗi Bài tập)

Mỗi bài học lý thuyết kết thúc bằng mục `## 4. Bài tập tự luyện` gồm tối thiểu **4 bài tập đại diện cho đủ 4 nhóm A, B, C, D** (các bài tổng kết chương `*.4` có thể chứa 8–12 bài tập).

### 2.1. Quy ước tích hợp 10 trường thông tin bài tập vào Component hiện có

Để không phải tạo thêm component hay thay đổi schema hiện tại, 10 thành phần bắt buộc của mỗi bài tập được biểu diễn chuẩn hóa bên trong bộ ba `<Exercise>`, `<Hint>`, `<Solution>` như sau:

1. **Mã bài tập duy nhất (`id` + Mã hiển thị):**
   - Thuộc tính JSX `id`: theo mẫu `id="exr-c{chương}-b{bài}-{nhóm}{số}"` (chỉ gồm `[a-z0-9-]`, bắt đầu bằng chữ cái), ví dụ: `id="exr-c1-b1-a1"`.
   - Mã hiển thị trong bài: `CTDS-C{chương}-B{bài}-{Nhóm}{Số}` (ví dụ: `CTDS-C1-B1-A01`).
2. **Nhóm bài tập:** Ghi rõ trên thuộc tính `title` của `<Exercise>`:
   - `Nhóm A — Nhận diện và tính toán`
   - `Nhóm B — Áp dụng định lý`
   - `Nhóm C — Chứng minh và phản ví dụ`
   - `Nhóm D — Tổng hợp và cấu trúc thương`
3. **Chủ đề:** Nêu rõ tiểu mục kiến thức được kiểm tra.
4. **Mục tiêu đánh giá:** Nêu rõ kỹ năng/tư duy cần đo lường và loại hình đánh giá tương ứng (_Đánh giá thường xuyên / Đánh giá quá trình / Kiểm tra giữa kỳ / Thi kết thúc học phần_).
5. **Mức độ khó:** Một trong 4 mức: `Cơ bản (Mức 1)` · `Trung bình (Mức 2)` · `Khá – Giỏi (Mức 3)` · `Nâng cao (Mức 4)`.
6. **Nguồn kiến thức liên quan:** Liên kết trực tiếp tới các khối lý thuyết trong bài qua `<Ref to="..." />` và trích dẫn tiểu mục/trang tương ứng của giáo trình qua `<Cite source="gt-ctds-hvk-2026" page="..." />`.
7. **Đề bài:** Phát biểu tường minh, đầy đủ ký hiệu, **được biên soạn mới** (thay đổi tập nền, tham số, ma trận, đa thức, môđulô hoặc góc hỏi so với bài tập trong sách).
8. **Gợi ý (`<Hint>`):** Chỉ đường hướng tiếp cận hoặc công cụ cần dùng, không giải thay toàn bộ bài toán.
9. **Lời giải chi tiết (`<Solution>`):** Trình bày đầy đủ từng bước lập luận và kết luận cuối cùng.
10. **Thang điểm / Tiêu chí đánh giá:** Đặt ở cuối khối `<Solution>` dưới dạng bảng phân bổ **1,00 điểm chuẩn** (gồm các mốc `0,25 đ` – `0,50 đ`) để người học tự chấm hoặc giảng viên dùng làm đáp án chấm thi.

---

## 3. Quy tắc Độ chính xác Học thuật & Bản quyền

### 3.1. Bảy quy ước toán học bắt buộc (Đồng bộ 100% với Giáo trình chính `tr. iii`)

Mọi tác giả và AI hỗ trợ biên soạn phải tuân thủ nghiêm ngặt 7 quy ước sau, không được áp dụng quy ước lệch từ sách khác:

1. **Vành (Ring):** Mặc định **không cần giao hoán** và **không cần có đơn vị $1_R$**. Khi định lý cần đơn vị hoặc tính giao hoán, bắt buộc phải ghi rõ _"Cho $R$ là một vành giao hoán có đơn vị"_ hoặc _"Cho $R$ là một vành có đơn vị $1_R \neq 0_R$"_.
2. **Miền nguyên, Vành chia, Trường:** Luôn giả thiết $1_R \neq 0_R$ (tức vành khác $\{0\}$).
3. **Đồng cấu vành:** Ánh xạ $f: R \to S$ thỏa mãn $f(a+b)=f(a)+f(b)$ và $f(ab)=f(a)f(b)$. **Không mặc định** $f(1_R) = 1_S$. Khi cần bảo toàn đơn vị, phải viết rõ _"đồng cấu vành bảo toàn đơn vị"_.
4. **Vành con vs. Trường con:** Vành con $S \subseteq R$ không bắt buộc chứa $1_R$ (và có thể có đơn vị riêng $1_S \neq 1_R$). Ngược lại, trường con $E \subseteq K$ luôn có $0_E = 0_K$ và $1_E = 1_K$.
5. **Iđêan:** Khi viết _"iđêan"_ không kèm tính từ, luôn hiểu là **iđêan hai phía**.
6. **Ước của không:** Phần tử $a \neq 0$ là ước của không trái nếu tồn tại $b \neq 0$ sao cho $ab = 0$. Số $0$ **không** phải là ước của không.
7. **Ký hiệu chuẩn:**
   - Số tự nhiên: $\mathbb{N} = \{0, 1, 2, \dots\}$, số nguyên dương: $\mathbb{Z}_{>0}$.
   - Nhóm nhị diện của $n$-giác đều: ký hiệu $D_{2n}$ (có cấp $2n$, ví dụ $D_6$ cấp 6, $D_8$ cấp 8).
   - Nhóm các lớp khả nghịch môđulô $n$: ký hiệu $U(n) = (\mathbb{Z}/n\mathbb{Z})^\times$.
   - Hợp thành ánh xạ và tích hoán vị trong $S_n$: tính **từ phải sang trái**, $(f \circ g)(x) = f(g(x))$.

### 3.2. Phân biệt rõ nội dung từ giáo trình và phần biên soạn mới

| Loại khối nội dung                                                                 | Cách ghi nhận nguồn (`source`, `original`, `page`)                                                                                                                                                    | Quy tắc bản quyền & diễn đạt                                                                                                                                             |
| :--------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Định nghĩa, Định lý, Mệnh đề, Bổ đề, Hệ quả** có trong giáo trình chính          | Ghi đầy đủ `original="Định lý X.Y" source="gt-ctds-hvk-2026" page="..."` theo đúng bảng tra cứu tại [knowledge-map.md](file:///d:/Learning-universe/docs/authoring/cau-truc-dai-so/knowledge-map.md). | Giữ nguyên vẹn giả thiết và kết luận toán học; diễn đạt lời dẫn và trình bày chứng minh bằng văn phong sư phạm rõ ràng, không chép nguyên văn từng câu chữ dài của sách. |
| **Bổ đề phụ / Hệ quả giải thích bổ sung** do người biên soạn thêm                  | Chỉ ghi `source="gt-ctds-hvk-2026" page="..."` (nếu mở rộng trực tiếp từ trang đó) hoặc **không gắn `original`**.                                                                                     | Tuyệt đối **không tự bịa số hiệu `original`** không có trong giáo trình.                                                                                                 |
| **Ví dụ (`<Example>`), Phản ví dụ (`<Counterexample>`) và Bài tập (`<Exercise>`)** | **Không gắn `original`**. Có thể dùng `<Cite source="gt-ctds-hvk-2026" page="..." />` ở dòng "Kiến thức liên quan".                                                                                   | **Tạo mới 100%** (đổi tham số $n$, đổi ma trận, đổi đa thức, đổi hàm hoặc thiết kế tình huống mới tương đương về mặt sư phạm).                                           |
| **Nhận xét (`<Remark>`), Ghi chú (`<Note>`), Cảnh báo (`<Warning>`)**              | Không có thuộc tính `source`/`original` (là phần bình luận sư phạm của Learning Universe).                                                                                                            | Giúp sinh viên hiểu trực giác, tránh bẫy sai lầm và kết nối các chương.                                                                                                  |

---

## 4. Định dạng Kỹ thuật (Content Engine, Zod, MDX, KaTeX)

### 4.1. Quy tắc đặt tên tệp và định danh (`id`, `slug`)

- **Thư mục chương:** `content/algebraic-structures/{NN}-{slug-chuong}/`
  - Ví dụ Chương 0: `content/algebraic-structures/00-ngon-ngu-va-cong-cu-dai-so/`
  - Ví dụ Chương 1: `content/algebraic-structures/01-nhom-va-cac-vi-du-co-ban/`
- **Tệp bài học MDX:** `{NN}-{slug-bai-hoc}.mdx` (trong đó `NN` là `01`, `02`, `03`, `04`).
  - Ví dụ: `01-tap-hop-anh-xa-va-cong-cu-so-hoc.mdx`.
- **Quy tắc `id` của khối đánh số (`Definition`, `Theorem`, `Lemma`, `Proposition`, `Corollary`, `Example`, `Counterexample`, `Exercise`):**
  - Phải khớp biểu thức chính quy `^[a-z][a-z0-9-]*$` (bắt đầu bằng chữ cái thường, chỉ gồm `a-z`, `0-9`, `-`).
  - **Phải duy nhất trên toàn bộ môn học Cấu trúc đại số** (trình kiểm định `content-validator.ts` báo lỗi `error` nếu hai bài học khác nhau trong cùng một môn đặt trùng `id` khối).
  - **Công thức đặt `id` không bao giờ trùng:**
    - Định nghĩa: `def-c{chương}-b{bài}-{ten-ngan}` (ví dụ: `def-c0-b2-quan-he-tuong-duong`)
    - Định lý: `thm-c{chương}-b{bài}-{ten-ngan}` (ví dụ: `thm-c0-b2-tuong-ung-phan-hoach`)
    - Mệnh đề: `prop-c{chương}-b{bài}-{ten-ngan}`
    - Bổ đề: `lem-c{chương}-b{bài}-{ten-ngan}`
    - Hệ quả: `cor-c{chương}-b{bài}-{ten-ngan}`
    - Ví dụ: `ex-c{chương}-b{bài}-{so}`
    - Phản ví dụ: `cex-c{chương}-b{bài}-{so}`
    - Bài tập: `exr-c{chương}-b{bài}-{nhom}{so}` (ví dụ: `exr-c0-b2-a1`, `exr-c0-b2-b1`, `exr-c0-b2-c1`, `exr-c0-b2-d1`)
- **Cấm gõ số hiệu thủ công:** Tuyệt đối **không** truyền thuộc tính `number="..."` hay `anchorId="..."` vào các thẻ JSX (plugin `remark-theorem-numbering.ts` sẽ tự động đánh số theo dạng `Chương.Bài.Số` cho 3 bộ đếm độc lập: `theory`, `example`, `exercise` và sẽ báo lỗi nếu tác giả tự gõ `number`).

### 4.2. Danh sách 18 Academic Components được phép dùng trong môn Cấu trúc đại số

Trình kiểm định `content-validator.ts` chỉ cho phép các thẻ JSX nằm trong `WHITELISTED_MDX_COMPONENTS`:

1. **Khối lý thuyết (Bộ đếm `theory`):** `<Definition>`, `<Theorem>`, `<Lemma>`, `<Proposition>`, `<Corollary>`
2. **Khối chứng minh:** `<Proof of="id-khoi-ly-thuyet" defaultOpen={false}>`
3. **Khối ví dụ & phản ví dụ (Bộ đếm `example`):** `<Example>`, `<Counterexample>`
4. **Khối bình luận sư phạm (Không đánh số):** `<Remark>`, `<Note>`, `<Warning>`
5. **Khối bài tập (Bộ đếm `exercise`):** `<Exercise>`, `<Hint>`, `<Solution>`
6. **Khối tham chiếu, trích dẫn, hình vẽ & tổng kết:**
   - `<Ref to="id-khoi-trong-cung-bai" />` (Lưu ý: `<Ref>` chỉ trỏ tới `id` của một khối nằm **trong cùng tệp MDX đó**).
   - `<Cite source="gt-ctds-hvk-2026" page="18-20" note="Mục 1.2" />`
   - `<Figure caption="Mô tả hình hoặc bảng bắt buộc phải có">...</Figure>`
   - `<KeyTakeaways>...</KeyTakeaways>`

### 4.3. Quy tắc LaTeX / KaTeX và Cú pháp MDX An toàn

1. **Macro dùng chung (`content/_shared/katex-macros.json`):**
   - Có sẵn các macro: `\N` ($\mathbb{N}$), `\Z` ($\mathbb{Z}$), `\Q` ($\mathbb{Q}$), `\R` ($\mathbb{R}$), `\C` ($\mathbb{C}$), `\Aff` ($\operatorname{Aff}$), `\id` ($\operatorname{id}$), `\ker` ($\operatorname{ker}$), `\im` ($\operatorname{im}$), `\Hom` ($\operatorname{Hom}$), `\Aut` ($\operatorname{Aut}$), `\vect{AB}` ($\overrightarrow{AB}$).
   - Các toán tử khác viết bằng `\operatorname{...}`: `\operatorname{ord}`, `\operatorname{gcd}`, `\operatorname{lcm}`, `\operatorname{sgn}`, `\operatorname{Sym}`, `\operatorname{GL}`, `\operatorname{SL}`, `\operatorname{char}`, `\operatorname{Frac}`.
2. **Cấm định nghĩa macro cục bộ và cấm TikZ:**
   - Không dùng `\newcommand`, `\renewcommand`, `\def`, `\DeclareMathOperator` trong bài học MDX (`content:check` sẽ chặn và báo lỗi).
   - Không dùng `\begin{tikzcd}` hay `\begin{tikzpicture}`. Với bảng phép toán (Bảng Cayley), dùng bảng Markdown đặt bên trong `<Figure caption="...">`.
3. **Quy tắc an toàn MDX với dấu `<`, `>` và `{`, `}`:**
   - Mọi biểu thức chứa dấu `<`, `>`, `{`, `}` (như $H \le G$, $\langle a \rangle$, $\{e\}$, $f: X \to Y$) **phải được bọc trong cặp dấu `$ ... $` hoặc `$$ ... $$`**. Không bao giờ viết `<a, b>` hoặc `{1, 2, 3}` trần ngoài chế độ toán học vì trình biên dịch MDX sẽ hiểu nhầm là thẻ JSX hoặc biểu thức JavaScript.
   - Không dùng từ khóa `export` trong thân bài MDX.
   - Không dùng chuỗi giữ chỗ `TODO`, `???`, hoặc `<...>` trong bất kỳ trường văn bản hay thuộc tính nguồn nào.
