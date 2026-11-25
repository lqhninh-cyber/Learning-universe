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

- **Bước B — Cắt lát & Đối chiếu từng bài lẻ (`1–2 bài/lượt`)**:
  1. Tra `*-page-map.md` để lấy đúng khoảng trang lý thuyết và bài tập của 1–2 bài đang xử lý, render PNG vào `D:\Tools\markitdown\output\<mon>_pages\`:
     ```powershell
     & "D:\Tools\markitdown\.venv\Scripts\python.exe" "D:\Tools\markitdown\render_slices.py" `
       "D:\Tools\markitdown\input\<ten-tai-lieu>.pdf" `
       "D:\Tools\markitdown\output\<mon>_pages" `
       "<page_ranges>" 165
     ```
  2. Đọc trực tiếp các ảnh `.png` vừa xuất bằng công cụ `read_file` (Vision) để thực hiện **Pha 1** và **Pha 2** ở Mục 5.
  3. Xóa các ảnh `.png` tạm trong `D:\Tools\markitdown\output\<mon>_pages\` sau khi hoàn tất nghiệm thu bài học nếu cần tiết kiệm dung lượng ổ đĩa.

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

1. Chỉ sau khi đã xác định đủ danh sách thiếu từ Pha 1 (và được người dùng duyệt khi cần) mới vá bổ sung vào `.mdx`.
2. **Bảo toàn tính nguyên vẹn học thuật**: Trình bày đầy đủ các bước biến đổi và lập luận; **không tóm lược hay cắt bớt chứng minh**.
3. Sau mỗi đợt cập nhật `.mdx`, **bắt buộc chạy lệnh kiểm toán**:
   ```powershell
   node scripts/audit-mdx-katex.mjs
   ```
   và xác nhận kết quả **`0` lỗi KaTeX / thẻ JSX học thuật** trước khi báo cáo hoàn tất.
