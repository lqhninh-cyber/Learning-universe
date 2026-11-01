# Checklist Kiểm duyệt Học thuật & Kỹ thuật — Môn Cấu trúc Đại số

> **Mục đích:** Danh mục kiểm tra bắt buộc dành cho chủ dự án và người biên tập trước khi nâng trạng thái một bài học từ `draft` $\to$ `review` $\to$ `approved` $\to$ `published` và khóa mã băm SHA-256 bằng lệnh `npm.cmd run content:approve`.

---

## 1. Kiểm duyệt Độ chính xác Học thuật (Toán học)

- [ ] **1.1. Bảo toàn giả thiết và kết luận:**
  - Mọi `<Definition>`, `<Theorem>`, `<Proposition>`, `<Lemma>`, `<Corollary>` đều giữ nguyên 100% giả thiết của giáo trình gốc (`Giao_trinh_Cau_truc_dai_so.pdf`).
  - Không bỏ sót các điều kiện nền: _"tập hợp khác rỗng"_, _"nhóm hữu hạn"_, _"vành có đơn vị $1_R \neq 0_R$"_, _"vành giao hoán có đơn vị"_, _"miền nguyên"_.
- [ ] **1.2. Tuân thủ đúng 7 quy ước gốc của giáo trình (`tr. iii`):**
  - [ ] Vành không mặc định giao hoán và không mặc định có đơn vị $1_R$.
  - [ ] Miền nguyên, vành chia, trường luôn giả thiết khác $\{0\}$ ($1 \neq 0$).
  - [ ] Đồng cấu vành không mặc định bảo toàn đơn vị (phải viết rõ _"đồng cấu vành bảo toàn đơn vị"_ khi cần $f(1_R) = 1_S$).
  - [ ] Vành con không bắt buộc có cùng đơn vị với vành mẹ; trường con luôn có cùng $0$ và $1$ với trường mẹ.
  - [ ] Thuật ngữ _"iđêan"_ đứng một mình luôn là iđêan hai phía.
  - [ ] Phần tử $0$ không được gọi là ước của không ($a \neq 0$ mới được xét là ước của không).
  - [ ] Tập số tự nhiên $\mathbb{N} = \{0, 1, 2, \dots\}$; nhóm nhị diện ký hiệu là $D_{2n}$ (cấp $2n$); hợp thành ánh xạ và tích hoán vị đọc từ phải sang trái $(f \circ g)(x) = f(g(x))$.
- [ ] **1.3. Kiểm tra tính hợp lệ của từng chứng minh (`<Proof>`):**
  - [ ] Mọi định lý, mệnh đề, bổ đề, hệ quả đều có khối `<Proof of="...">` đầy đủ, không bỏ trống và không ghi _"chứng minh tương tự xem như bài tập"_ đối với các ý cốt lõi.
  - [ ] Mỗi bước suy luận trong chứng minh đều chỉ rõ căn cứ (theo tiên đề nào, theo luật giản ước, theo tính xác định tốt hay theo định lý nào qua `<Ref to="..." />`).
  - [ ] Đối với định nghĩa ánh xạ hoặc phép toán trên tập thương ($X/\sim$, $G/N$, $R/I$, $\operatorname{Frac}(R)$), chứng minh luôn có bước **kiểm tra tính xác định tốt (không phụ thuộc cách chọn phần tử đại diện)**.
- [ ] **1.4. Không nhầm lẫn các cặp khái niệm dễ sai:**
  - [ ] Không nhầm _cấp của nhóm_ $|G|$ với _cấp của phần tử_ $\operatorname{ord}(a)$.
  - [ ] Không nhầm _nhóm abel_ với _nhóm cyclic_ (nhớ phản ví dụ $U(8)$ và $V_4$).
  - [ ] Không áp dụng chiều ngược của Định lý Lagrange (nhớ phản ví dụ $A_4$ cấp $12$ không có nhóm con cấp $6$).
  - [ ] Không nhầm _lớp kề_, _nhóm con chuẩn tắc_ và _nhóm thương_ (`Mục 4.5, tr. 77`).
  - [ ] Không nhầm _vành con_ với _iđêan_ (nhớ phản ví dụ $\mathbb{Z} \subseteq \mathbb{Q}$).
  - [ ] Không nhầm _iđêan nguyên tố_ với _iđêan cực đại_ (nhớ phản ví dụ $(x) \subsetneq (2,x)$ trong $\mathbb{Z}[x]$).
  - [ ] Không nhầm _vành thương $R/I$_ (đồng nhất các phần tử của $I$ về $0$) với _trường các thương $\operatorname{Frac}(R)$_ (bổ sung nghịch đảo cho $b \in R \setminus \{0\}$).

---

## 2. Kiểm duyệt Liêm chính Học thuật & Bản quyền (`academic-integrity`)

- [ ] **2.1. Chính xác tuyệt đối về nguồn và số trang:**
  - [ ] Mọi thuộc tính `original`, `source`, `page` trên khối lý thuyết đều khớp 100% với bảng tra cứu tại [knowledge-map.md](file:///d:/Learning-universe/docs/authoring/cau-truc-dai-so/knowledge-map.md).
  - [ ] Không tự bịa số hiệu `original` cho các bổ đề phụ, ví dụ mới hoặc bài tập mới.
- [ ] **2.2. Phân biệt rõ nội dung giáo trình và phần giải thích bổ sung:**
  - [ ] Các khối từ giáo trình có gắn `source="gt-ctds-hvk-2026"` và `page="..."`.
  - [ ] Các bình luận sư phạm, mẹo tư duy, cảnh báo bẫy sai lầm của biên tập viên được đặt trong `<Remark>`, `<Note>`, `<Warning>`.
- [ ] **2.3. Độc창 (Originality) của lời dẫn, ví dụ và bài tập:**
  - [ ] Không sao chép nguyên văn các đoạn văn giải thích dài từ sách có bản quyền.
  - [ ] Toàn bộ `<Example>`, `<Counterexample>` và `<Exercise>` đều đã được thiết kế mới (đổi tham số, đổi ma trận, đổi đa thức, đổi môđulô hoặc cấu trúc câu hỏi), kèm lời giải tự kiểm chứng.

---

## 3. Kiểm duyệt Chuẩn Sư phạm (11 Thành phần Lý thuyết & 4 Nhóm Bài tập)

- [ ] **3.1. Đủ 11 thành phần lý thuyết:**
  - [ ] (1) `title` chuẩn xác · (2) `<Note title="Mục tiêu bài học">` đầu bài · (3) `prerequisites` + dẫn nhập kiến thức tiên quyết · (4) Cấu trúc mục `## 1.`, `## 2.` rõ ràng · (5) `<Definition>` · (6) `<Theorem>` / `<Proposition>` / `<Lemma>` / `<Corollary>` · (7) `<Proof>` đầy đủ · (8) `<Example>` và `<Counterexample>` · (9) `<Remark>` / `<Note>` / `<Warning>` · (10) `<KeyTakeaways>` ở cuối bài · (11) `sources` kèm `pages` trong frontmatter.
- [ ] **3.2. Đủ 4 nhóm bài tập A, B, C, D và đủ 10 trường thông tin mỗi bài:**
  - [ ] Có đủ đại diện của **Nhóm A** (Nhận diện & tính toán), **Nhóm B** (Áp dụng định lý), **Nhóm C** (Chứng minh & phản ví dụ), **Nhóm D** (Tổng hợp & cấu trúc thương).
  - [ ] Mỗi `<Exercise>` đều có: (1) `id` duy nhất + Mã `CTDS-C{x}-B{y}-{Nhóm}{Số}` trong `title`, (2) Nhóm bài tập, (3) Chủ đề, (4) Mục tiêu đánh giá, (5) Mức độ khó, (6) Nguồn kiến thức liên quan (`<Ref />` + `<Cite />`), (7) Đề bài rõ ràng, (8) `<Hint>`, (9) `<Solution>` chi tiết, (10) Bảng **Thang điểm đánh giá (1,00 điểm)**.

---

## 4. Kiểm duyệt Kỹ thuật Tự động (MDX, KaTeX, Zod & Content Lock)

Trước khi phê duyệt bài học, chạy lần lượt các lệnh sau trên PowerShell và đảm bảo **0 lỗi (`0 errors`)**:

```powershell
npm.cmd run format
npm.cmd run content:check
npm.cmd run check
```

Các mục kỹ thuật cần đạt 100%:

- [ ] **4.1. Frontmatter YAML:**
  - [ ] `id` khớp với phần slug của tên tệp `NN-{id}.mdx` và chỉ gồm `[a-z0-9-]`.
  - [ ] `prerequisites` chỉ chứa `id` của các bài học đã có thật trong kho nội dung (và không chứa chính `id` của bài hiện tại).
  - [ ] `sources` có ít nhất 1 mục khi `status` là `review`, `approved` hoặc `published`; trường `pages` đúng định dạng `"17-22"` hoặc `"17, 20-22"` (chỉ gồm số, dấu `-` và dấu `,`).
  - [ ] Không còn bất kỳ chuỗi giữ chỗ `TODO`, `???`, `<...>` nào trong toàn bộ tệp.
- [ ] **4.2. Thẻ JSX và Tham chiếu chéo:**
  - [ ] Chỉ sử dụng các component nằm trong `WHITELISTED_MDX_COMPONENTS`.
  - [ ] Không truyền thủ công `number="..."` hoặc `anchorId="..."` vào các khối đánh số.
  - [ ] Mọi `id` của khối đánh số bắt đầu bằng chữ cái thường (`def-...`, `thm-...`, `prop-...`, `lem-...`, `cor-...`, `ex-...`, `cex-...`, `exr-...`) và không trùng với bất kỳ khối nào khác trong toàn bộ môn học.
  - [ ] Mọi `<Ref to="..." />` và `<Proof of="...">` đều trỏ tới đúng một `id` tồn tại trong cùng tệp MDX đó.
  - [ ] Mọi `<Figure>` đều có thuộc tính `caption="..."` không rỗng; mọi `<Cite>` đều có thuộc tính `source="..."` tồn tại trong `content/_shared/bibliography.yaml`.
- [ ] **4.3. Công thức KaTeX:**
  - [ ] Mọi ký hiệu chứa `<`, `>`, `{`, `}` đều nằm trong `$ ... $` hoặc `$$ ... $$`.
  - [ ] Không sử dụng `\newcommand`, `\DeclareMathOperator`, `\begin{tikzcd}` hay `\begin{tikzpicture}`.
- [ ] **4.4. Quy trình Khóa bảo vệ sau khi duyệt (`content.lock.json`):**
  - [ ] Sau khi chủ dự án kiểm tra trên `/dev/preview` và đổi `status` sang `approved` hoặc `published`, chạy lệnh:
    ```powershell
    npm.cmd run content:approve -- <lesson-id>
    ```
  - [ ] Chạy lại `npm.cmd run content:check` để xác nhận mã băm SHA-256 và danh sách số hiệu khối đã được khóa an toàn trong `content.lock.json`.
