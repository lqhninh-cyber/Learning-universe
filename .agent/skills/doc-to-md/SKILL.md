---
name: doc-to-md
description: >-
  Chuyển đổi tài liệu bài giảng, giáo trình (.pdf, .docx, .pptx, .xlsx) từ thư mục đồng bộ Google
  Drive Desktop sang Markdown bằng công cụ Microsoft MarkItDown hoặc luồng cắt lát ảnh Vision
  (pypdfium2, không cài ML nặng) ngoài repo, kết hợp cổng Pha 0 và quy trình đối chiếu 2 pha để rà
  soát, bổ sung bài học MDX. Kích hoạt khi người dùng yêu cầu trích xuất tài liệu, đối chiếu giáo
  trình với bài giảng trong content/, hoặc gọi trực tiếp skill doc-to-md.
---

# Chuyển đổi Tài liệu & Đối chiếu Bài giảng (`doc-to-md`)

Sử dụng bộ công cụ cô lập tại `D:\Tools\markitdown\` (ngoài kho mã nguồn `D:\Learning-universe`) để trích xuất và đối chiếu tài liệu gốc từ Google Drive Desktop cho cả 4 học phần.

## 1. Đường dẫn gốc Google Drive Desktop & Phân loại Pha 0 của 4 học phần

- **Biến đường dẫn gốc tài liệu (`GDRIVE_DOCS_ROOT`)**:

  ```powershell
  $GDRIVE_DOCS_ROOT = "G:\Drive của tôi\Learning Universe - Tailieu"
  ```

  _(Nếu ổ `G:` chưa gắn, quét `<Drive>:\Drive của tôi\Learning Universe - Tailieu` hoặc `<Drive>:\My Drive\Learning Universe - Tailieu` từ `D:` đến `Z:` trước khi báo người dùng)._

- **Ánh xạ nguồn & Luồng xử lý đã kiểm định Pha 0**:

  | Học phần                       | Thư mục trong repo                  | Tệp nguồn chính trên Drive                                              | Kết quả Pha 0 & Luồng xử lý chuẩn                                                                                                                            |
  | :----------------------------- | :---------------------------------- | :---------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | **Cấu trúc đại số**            | `content/algebraic-structures/`     | `Giao_trinh_Cau_truc_dai_so.pdf` (219 tr.)                              | **Dùng được ngay với MarkItDown** (`output\Giao_trinh_Cau_truc_dai_so.md`); chỉ cắt ảnh PNG trang lẻ nếu cần kiểm tra phân thức/biểu đồ phức tạp             |
  | **Giải tích hàm một biến**     | `content/single-variable-calculus/` | `giai-tich-ham-mot-bien\GTHMB_Tran_Tri_Dung_2022.pdf` (90 tr.)          | **Có text nhưng vỡ CMap công thức Toán & tiếng Việt** → Không chép công thức từ `.md`; dùng **Nhánh Vision theo lát cắt**                                    |
  | **Hình học Affine và Euclide** | `content/affine-geometry/`          | `Hinhhoccaocap.pdf` (285 tr.)                                           | **PDF scan ảnh (0/285 tr. text)** → Dùng **Nhánh Vision theo lát cắt** với bản đồ trang cố định `output\Hinhhoccaocap-page-map.md`                           |
  | **Giáo dục học**               | `src/data/courses/giao-duc-hoc/`    | `giao-duc-hoc\Giao_trinh_GDH_HCMUE.pdf` (124 tr.) + các thông tư/mô-đun | `Giao_trinh_GDH_HCMUE.pdf` là **PDF scan ảnh (0/124 tr. text)** → Dùng **Nhánh Vision theo lát cắt**; các văn bản PDF phụ trợ chạy cổng Pha 0 trước khi dùng |

## 2. Quy tắc cô lập kho mã nguồn & Lệnh MarkItDown (Cho tệp có lớp text chuẩn)

- **Tuyệt đối không** tạo `.venv` hoặc lưu tệp `.pdf`, `.md`, `.png` tạm bên trong `D:\Learning-universe`.
- Sao chép tệp nguồn từ `$GDRIVE_DOCS_ROOT` vào `D:\Tools\markitdown\input\` trước khi trích xuất sang `D:\Tools\markitdown\output\`:
  ```powershell
  Copy-Item -LiteralPath "$GDRIVE_DOCS_ROOT\<ten-tai-lieu>.pdf" -Destination "D:\Tools\markitdown\input\<ten-tai-lieu>.pdf" -Force
  & "D:\Tools\markitdown\.venv\Scripts\markitdown.exe" "D:\Tools\markitdown\input\<ten-tai-lieu>.pdf" -o "D:\Tools\markitdown\output\<ten-tai-lieu>.md"
  ```

## 3. Cổng kiểm định chất lượng Pha 0 (Nguyên tắc dừng an toàn)

Với mọi tệp tài liệu mới chưa phân loại ở Mục 1, bắt buộc kiểm tra 3 tiêu chí ngay sau khi chạy `markitdown`:

1. **Số trang có lớp text (`pdfplumber` / `pypdfium2`) & mật độ dòng `.md`**: Phát hiện PDF scan ảnh hoặc tệp chỉ chứa watermark.
2. **Độ nguyên vẹn tiếng Việt**: Phát hiện lỗi bảng mã font cũ (TCVN3, VNI, LaTeX T5 hỏng CMap).
3. **Độ chính xác ký hiệu Toán**: Đọc mẫu 6–10 dòng chứa định nghĩa/định lý/công thức để kiểm tra lượng từ, ký hiệu tập hợp, chỉ số, dấu phủ định.

- **DỪNG AN TOÀN / CHUYỂN NHÁNH VISION**: Nếu tệp là PDF scan hoặc bị vỡ CMap công thức Toán/tiếng Việt, **tuyệt đối không tự suy diễn công thức từ `.md`** (tuân thủ `academic-integrity`); chuyển sang **Mục 4 (Nhánh dự phòng Vision theo lát cắt)**.

## 4. Nhánh dự phòng cho PDF Scan / Vỡ CMap Toán (Vision theo lát cắt — Không cài ML nặng)

Sử dụng trực tiếp `pypdfium2` + `Pillow` có sẵn qua script `D:\Tools\markitdown\render_slices.py` kết hợp khả năng đọc ảnh Vision của Agent:

- **Bước A — Lập bản đồ số trang (`*-page-map.md`)**:
  1. Render ảnh `.png` (~150–180 DPI) cho vùng Mục lục tiềm năng (đầu sách trang `1–8` và cuối sách `10` trang cuối):
     ```powershell
     & "D:\Tools\markitdown\.venv\Scripts\python.exe" "D:\Tools\markitdown\render_slices.py" `
       "D:\Tools\markitdown\input\<ten-tai-lieu>.pdf" `
       "D:\Tools\markitdown\output\<mon>_toc" `
       "1-8,<n-9>-<n>" 165
     ```
  2. Đọc ảnh Mục lục bằng Vision (mở rộng tối đa 5 trang liền kề nếu lệch vị trí), kiểm chứng độ lệch giữa số trang in và số trang PDF, rồi lưu bảng ánh xạ `Bài học ↔ Khoảng số trang PDF (page start–end)` vào `D:\Tools\markitdown\output\<ten-tai-lieu>-page-map.md`.
  3. _(Với học phần HHAVE, đọc trực tiếp bản đồ có sẵn tại `D:\Tools\markitdown\output\Hinhhoccaocap-page-map.md`)._

- **Bước B — Cắt lát & Đối chiếu theo lô (`Context Guard <= 16 trang/lượt`)**:
  1. Tra `*-page-map.md` để lấy đúng khoảng trang lý thuyết và bài tập của 1–2 bài đang xử lý (giới hạn cứng tối đa `16 trang/lượt`), render PNG ở **`200 DPI`** vào `D:\Tools\markitdown\output\<mon>_pages\<ma_lo>\`:
     ```powershell
     & "D:\Tools\markitdown\.venv\Scripts\python.exe" "D:\Tools\markitdown\render_slices.py" `
       "D:\Tools\markitdown\input\<ten-tai-lieu>.pdf" `
       "D:\Tools\markitdown\output\<mon>_pages\<ma_lo>" `
       "<page_ranges>" 200
     ```
  2. Đọc trực tiếp các ảnh `.png` vừa xuất bằng công cụ `read_file` (Vision) để thực hiện **Pha 1** và **Pha 2** ở Mục 5 (hoặc chạy liền mạch theo **Giao thức 1-Shot** ở Mục 6).
  3. Xóa sạch thư mục ảnh `.png` tạm `D:\Tools\markitdown\output\<mon>_pages\<ma_lo>\` sau khi hoàn tất nghiệm thu lô bài học.

## 5. Quy trình đối chiếu 2 pha bắt buộc khi sửa bài học MDX

Luôn kiểm tra `status` ở frontmatter theo quy tắc `content-protection` (không tự ý sửa nội dung học thuật của bài `approved` hoặc `published` khi chưa có yêu cầu rõ ràng của chủ dự án), sau đó thực hiện nghiêm ngặt 2 pha:

### Pha 1 — Đối chiếu chi tiết theo từng bài lẻ (Chỉ đọc)

Lập **bảng đối chiếu 5 hạng mục** giữa tài liệu gốc (từ phân đoạn `.md` hoặc lát cắt ảnh PNG) và tệp `.mdx` hiện có trong `content/`:

1. **Định nghĩa** (`Definition`)
2. **Định lý / Bổ đề / Mệnh đề / Hệ quả** kèm đầy đủ điều kiện giả thiết (`Theorem`, `Lemma`, `Proposition`, `Corollary`)
3. **Chứng minh** — chỉ rõ các bước lập luận bị thiếu hoặc bị cắt ngắn (`Proof`)
4. **Ví dụ / Phản ví dụ / Chú ý** (`Example`, `Counterexample`, `Remark`, `Note`)
5. **Bài tập & Lời giải** (`Exercise`, `Solution`, `Hint`)

### Pha 2 — Vá bổ sung nguyên vẹn & Kiểm toán KaTeX

1. Chỉ sau khi đã xác định đủ danh sách thiếu từ Pha 1 (trong chế độ rà soát thủ công thì chờ người dùng duyệt; trong **Giao thức 1-Shot ở Mục 6** thì chuyển thẳng sang Pha 2) mới vá bổ sung vào `.mdx`.
2. **Bảo toàn tính nguyên vẹn học thuật**: Trình bày đầy đủ các bước biến đổi và lập luận; **không tóm lược hay cắt bớt chứng minh**.
3. Sau mỗi đợt cập nhật `.mdx`, **bắt buộc chạy lệnh kiểm toán**:
   ```powershell
   node scripts/audit-mdx-katex.mjs
   ```
   và xác nhận kết quả **`0` lỗi KaTeX / thẻ JSX học thuật** trước khi báo cáo hoàn tất.

## 6. Giao thức Khôi phục Bài giảng Toán 1-Shot (Chuẩn hóa từ HHAVE 1.1–1.3)

Khi thực hiện khôi phục chuẩn hóa các bài giảng Toán từ giáo trình gốc, áp dụng trọn vẹn **6 ràng buộc cố định** sau đây trong một lượt xử lý khép kín:

1. **Vision & Context Guard:**
   - Render ảnh PNG ở độ phân giải **`200 DPI`** bằng `D:\Tools\markitdown\render_slices.py` vào thư mục tạm theo lô `D:\Tools\markitdown\output\<mon>_pages\<ma_lo>\`.
   - **Giới hạn cứng tối đa `16 trang/lượt`** (tổng số trang Lý thuyết + Bài tập của lô). Nếu tổng số trang vượt `16 trang`, tự động thu gọn phạm vi về **1 bài** (hoặc tách nửa Lý thuyết / nửa Bài tập nếu riêng 1 bài vượt 16 trang).

2. **Điểm dừng an toàn duy nhất:**
   - Tự động chạy liền mạch **Pha 1 (đối chiếu nội bộ)** → **Pha 2 (cập nhật `.mdx`)** mà không dừng chờ duyệt trung gian.
   - **Chỉ dừng hỏi người dùng** nếu trang scan bị mờ, rách hoặc mất hẳn công thức không thể xác minh chắc chắn bằng lập luận toán học.

3. **Chuẩn LaTeX/KaTeX bắt buộc:**
   - **Cấm tuyệt đối** sử dụng macro `\vect{...}` trong tệp bài giảng `.mdx`.
   - Dùng `\overrightarrow{...}` cho vectơ nối 2 điểm và không gian phương (`\overrightarrow{AB}`, `\overrightarrow{\mathcal{A}}`, `\overrightarrow{\alpha}`).
   - Dùng `\vec{...}` cho vectơ đơn (`\vec{a}`, `\vec{e}_i`, `\vec{0}`).
   - Escape ngoặc nhọn `\{ \}` cho tập hợp và mục tiêu affine (`\{E_0; E_i\}`, `\{\vec{e}_i\}`).
   - Loại bỏ **100% ký tự Unicode toán học trần** ngoài biểu thức `$...$` (như `α`, `λ`, `μ`, `≤`, `∈`, `A²`, `P₁`, `Σ`...) và khắc phục triệt để mọi lỗi đứt câu, khuyết phương trình.

4. **Chống cắt ngắn & Bảo toàn:**
   - Khôi phục **100%** Định nghĩa, Định lý / Điều kiện giả thiết, **toàn bộ các bước Chứng minh trung gian** (không cắt gọt), Ví dụ / Thí dụ, Chú ý / Hệ quả và **trọn bộ Bài tập gốc** (nếu bản in gốc sai chính tả hoặc nhầm chỉ số, đính chính chuẩn xác kèm ghi chú ngắn trong ngoặc; đồng thời cập nhật chính xác trường `pages` trong frontmatter).
   - Mọi `<Example>` dạng bài toán (tính toán, chứng minh, đổi mục tiêu, lập phương trình...) bắt buộc phải nêu đầy đủ **Đề bài** (giả thiết + yêu cầu rõ ràng, không đưa thêm dữ kiện mới bất ngờ ở cuối) trước phần **Lời giải**; chỉ các ví dụ minh họa khái niệm thuần túy mới viết dạng tường thuật.
   - Bảo toàn **100%** các component tương tác (`<...Figure />`, `<...Canvas />`), thẻ `<GlossaryTerm>`, và các `id` khối định lý/định nghĩa được tham chiếu bởi `InlineTheoremViz` (như `thm-s4-1`, `def-e1-3`, `def-e2-1`, `thm-p7-13`, `thm-p10-6`...).
   - Thay thế các bài tập tự chế bị lỗi cú pháp hoặc trùng lặp bằng bài tập gốc (chỉ giữ lại bài tập tự chế nếu bài đó đang gắn trực tiếp component tương tác).

5. **Kiểm chứng số học bằng Python:**
   - Mọi bài toán và ví dụ có tính toán tọa độ, ma trận, khoảng cách, tỉ số, phương trình phẳng hoặc vị trí tương đối phải được kiểm tra ngược bằng script Python tạm ngoài repo (`D:\Tools\markitdown\.venv\Scripts\python.exe` dùng `fractions.Fraction`) trước khi ghi lời giải vào `.mdx`.

6. **Dọn dẹp & Cổng kiểm định:**
   - Xóa sạch thư mục ảnh tạm `D:\Tools\markitdown\output\<mon>_pages\<ma_lo>\` và script Python tạm sau khi hoàn tất (**TUYỆT ĐỐI giữ nguyên** `D:\Tools\markitdown\input\` và các tệp `*-page-map.md`).
   - Đồng bộ lại khóa băm nội dung nếu bài có trạng thái `approved`/`published` (`npm.cmd run content:approve -- <lesson-id>`), chỉ mục thuật ngữ và cập nhật đồng bộ các bài test nhãn khối nếu có (`src/content-runtime/content-runtime.test.tsx`...).
   - Chuẩn hóa định dạng (`npm.cmd run format`) và chạy cổng kiểm định:
     ```powershell
     node scripts/audit-mdx-katex.mjs && npm.cmd run check && npm.cmd run build
     ```
     đạt **`0` lỗi**, **pass `100%` test**, và đảm bảo `git status` sạch tệp tạm.
