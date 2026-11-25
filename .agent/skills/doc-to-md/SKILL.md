---
name: doc-to-md
description: >-
  Chuyển đổi tài liệu bài giảng, giáo trình (.pdf, .docx, .pptx, .xlsx) từ thư mục đồng bộ Google
  Drive Desktop sang Markdown bằng công cụ Microsoft MarkItDown cài đặt cô lập ngoài repo, kết hợp
  cổng kiểm định Pha 0 và quy trình đối chiếu 2 pha để rà soát, bổ sung bài học MDX. Kích hoạt khi
  người dùng yêu cầu trích xuất tài liệu sang Markdown, đối chiếu file gốc với bài giảng trong
  content/, hoặc gọi trực tiếp skill doc-to-md.
---

# Chuyển đổi Tài liệu sang Markdown & Đối chiếu Bài giảng (`doc-to-md`)

Sử dụng công cụ `microsoft/markitdown` đã cài đặt cô lập bên ngoài kho mã nguồn để trích xuất nội dung từ tài liệu gốc trên Google Drive Desktop sang Markdown phục vụ đối chiếu và bổ sung học liệu.

## 1. Đường dẫn gốc Google Drive Desktop & Ánh xạ 4 học phần

- **Biến đường dẫn gốc tài liệu (`GDRIVE_DOCS_ROOT`)**:

  ```powershell
  $GDRIVE_DOCS_ROOT = "G:\Drive của tôi\Learning Universe - Tailieu"
  ```

  _(Nếu ổ `G:` chưa gắn do Google Drive Desktop chưa chạy, quét nhanh `<Drive>:\Drive của tôi\Learning Universe - Tailieu` hoặc `<Drive>:\My Drive\Learning Universe - Tailieu` từ `D:` đến `Z:` trước khi báo người dùng)._

- **Cấu trúc nguồn của 4 học phần trong `$GDRIVE_DOCS_ROOT`**:
  | Học phần                       | Thư mục trong repo                  | Nguồn tài liệu trên Google Drive (`$GDRIVE_DOCS_ROOT`)                                                                                       |
  | :----------------------------- | :---------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------- |
  | **Hình học Affine và Euclide** | `content/affine-geometry/`          | `Hinhhoccaocap.pdf` (~9.19 MB)                                                                                                               |
  | **Cấu trúc đại số**            | `content/algebraic-structures/`     | `Giao_trinh_Cau_truc_dai_so.pdf` (~3.93 MB)                                                                                                  |
  | **Giải tích hàm một biến**     | `content/single-variable-calculus/` | `giai-tich-ham-mot-bien\` (`GTHMB_Tran_Tri_Dung_2022.pdf`, `ND_on_thi_va_de_mau.pdf`, `exams\`)                                              |
  | **Giáo dục học**               | `src/data/courses/giao-duc-hoc/`    | `giao-duc-hoc\` (`Giao_trinh_GDH_HCMUE.pdf`, `De_cuong_chi_tiet_EDUC2802.pdf`, `Gioi_thieu_hoc_phan_GDH.pdf`, các thông tư/mô-đun GDPT 2018) |

## 2. Bộ đệm cục bộ & Lệnh thực thi cố định (Ngoài Repo)

- **Quy tắc cô lập kho mã nguồn**:
  - **Tuyệt đối không** tạo `.venv` hoặc lưu tệp `.pdf`, `.md` tạm bên trong `D:\Learning-universe`.
  - Luôn sao chép tệp nguồn từ `$GDRIVE_DOCS_ROOT` sang bộ đệm `D:\Tools\markitdown\input\` trước khi trích xuất (tránh lỗi đọc stream/timeout trên ổ ảo Google Drive), và lưu đầu ra tại `D:\Tools\markitdown\output\`.
- **Lệnh sao đệm và trích xuất chuẩn**:
  ```powershell
  Copy-Item -LiteralPath "$GDRIVE_DOCS_ROOT\<ten-tai-lieu>.pdf" -Destination "D:\Tools\markitdown\input\<ten-tai-lieu>.pdf" -Force
  & "D:\Tools\markitdown\.venv\Scripts\markitdown.exe" "D:\Tools\markitdown\input\<ten-tai-lieu>.pdf" -o "D:\Tools\markitdown\output\<ten-tai-lieu>.md"
  ```

## 3. Cổng kiểm định chất lượng Pha 0 (Nguyên tắc dừng an toàn)

Bản cài đặt `markitdown` mặc định **không tích hợp OCR**. Ngay sau khi trích xuất ra `.md`, bắt buộc kiểm tra 3 tiêu chí trước khi đối chiếu học thuật:

1. **Dung lượng & mật độ dòng**: Phát hiện PDF scan ảnh (tệp `.md` rỗng, quá nhỏ so với số trang PDF, hoặc chỉ lặp lại chuỗi watermark phần mềm ghép PDF).
2. **Độ nguyên vẹn tiếng Việt**: Không bị vỡ bảng mã cũ (TCVN3, VNI-Windows) hay mất dấu hàng loạt.
3. **Độ chính xác ký hiệu Toán**: Đọc thử đoạn mẫu ~10 dòng có chứa định nghĩa/định lý và công thức để kiểm tra chỉ số, ký hiệu tập hợp, ánh xạ, vectơ.

- **DỪNG AN TOÀN**: Nếu tệp nguồn là PDF scan không có lớp văn bản học thuật **hoặc** công thức Toán/tiếng Việt bị vỡ nặng không đọc được bản chất, **phải dừng ngay tại Pha 0 và báo cho người dùng kèm đoạn mẫu lỗi** để chuyển hướng OCR; **tuyệt đối không** tự suy diễn hay bịa lại công thức, mệnh đề, số trang (tuân thủ `academic-integrity`).

## 4. Quy trình đối chiếu 2 pha bắt buộc khi sửa bài học MDX

Chỉ thực hiện khi tệp `.md` đã vượt qua cổng Pha 0. Luôn kiểm tra `status` ở frontmatter theo quy tắc `content-protection` trước khi chỉnh sửa tệp trong `content/`:

### Pha 1 — Lập mục lục dòng & Đối chiếu từng bài lẻ (Chỉ đọc)

1. Nếu giáo trình lớn chứa nhiều bài, lập tệp chỉ mục `D:\Tools\markitdown\output\<ten-tai-lieu>-index.md` ánh xạ từng bài `.mdx` với khoảng số dòng (`line start–end`) để chỉ đọc đúng phân đoạn cần thiết.
2. Đọc phân đoạn `.md` của từng bài lẻ và lập **bảng đối chiếu 5 hạng mục** với tệp `.mdx` hiện có:
   - **Định nghĩa** (`Definition`)
   - **Định lý / Bổ đề / Mệnh đề / Hệ quả** kèm đầy đủ điều kiện giả thiết (`Theorem`, `Lemma`, `Proposition`, `Corollary`)
   - **Chứng minh** — ghi rõ các bước lập luận bị thiếu hoặc bị cắt ngắn (`Proof`)
   - **Ví dụ / Phản ví dụ / Chú ý** (`Example`, `Counterexample`, `Remark`, `Note`)
   - **Bài tập & Lời giải** (`Exercise`, `Solution`, `Hint`)

### Pha 2 — Vá bổ sung nguyên vẹn & Kiểm toán KaTeX

1. Chỉ sau khi đã xác nhận danh sách thiếu từ Pha 1 (và được người dùng duyệt khi cần) mới vá bổ sung vào `.mdx`.
2. **Bảo toàn tính nguyên vẹn học thuật**: Không tự ý tóm lược hay cắt bớt chứng minh.
3. Sau mỗi đợt sửa `.mdx`, **luôn chạy lệnh kiểm toán bắt buộc**:
   ```powershell
   node scripts/audit-mdx-katex.mjs
   ```
   và xác nhận đạt **`0` lỗi KaTeX** trước khi nghiệm thu.
