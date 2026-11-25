---
name: doc-to-md
description: >-
  Chuyển đổi tài liệu bài giảng, giáo trình (.pdf, .docx, .pptx, .xlsx) sang Markdown bằng công cụ
  Microsoft MarkItDown cài đặt cô lập ngoài repo, kết hợp quy trình đối chiếu 2 pha để rà soát và bổ
  sung bài học MDX. Kích hoạt khi người dùng yêu cầu trích xuất tài liệu sang Markdown, đối chiếu
  file gốc với bài giảng trong content/, hoặc gọi trực tiếp skill doc-to-md.
---

# Chuyển đổi Tài liệu sang Markdown & Đối chiếu Bài giảng (`doc-to-md`)

Sử dụng công cụ `microsoft/markitdown` đã cài đặt cô lập bên ngoài kho mã nguồn để trích xuất nội dung từ tệp tài liệu (`.pdf`, `.docx`, `.pptx`, `.xlsx`) sang Markdown phục vụ đối chiếu và bổ sung bài học `.mdx`.

## 1. Lệnh thực thi cố định và vùng lưu trữ tạm

- **Đường dẫn thực thi cố định** (gọi trực tiếp binary trong `.venv` để tránh lỗi `ExecutionPolicy` của PowerShell):
  ```powershell
  & "D:\Tools\markitdown\.venv\Scripts\markitdown.exe" "<input_path>" -o "D:\Tools\markitdown\output\<ten-tep-tam>.md"
  ```
- **Quy tắc cô lập kho mã nguồn**:
  - Luôn lưu mọi tệp `.md` tạm vào `D:\Tools\markitdown\output\` (tạo thư mục nếu chưa có).
  - **Tuyệt đối không** lưu tệp `.md` trích xuất tạm hoặc tạo `.venv` bên trong `D:\Learning-universe`.

## 2. Cảnh báo kỹ thuật (PDF scan & Công thức Toán học)

- Bản cài đặt `markitdown` mặc định **không có OCR** và không tự khôi phục LaTeX từ ảnh chụp hay vector công thức phức tạp.
- Ngay sau khi chạy `markitdown`, phải đọc kiểm tra tệp `.md` trích xuất:
  - Nếu tệp nguồn là **PDF scan** (nội dung trống/lỗi font hàng loạt) hoặc **chứa công thức Toán dày đặc bị vỡ ký hiệu** (mất chỉ số trên/dưới, lỗi ký hiệu tập hợp, ánh xạ, ma trận, căn thức...), **phải dừng lại và báo ngay cho người dùng biết rõ vị trí bị vỡ**.
  - **Tuyệt đối không** tự suy đoán hay tự bịa lại công thức, mệnh đề, số trang hoặc thông tin giáo trình (tuân thủ quy tắc `academic-integrity`).

## 3. Quy trình đối chiếu 2 pha bắt buộc khi sửa bài học MDX

Trước khi can thiệp vào tệp trong `content/`, luôn kiểm tra trạng thái `status` ở frontmatter theo quy tắc `content-protection` (không tự ý sửa nội dung học thuật của bài `approved` hoặc `published` khi chưa có yêu cầu trực tiếp từ chủ dự án), sau đó thực hiện đúng 2 pha:

### Pha 1 — Đối chiếu theo từng bài lẻ

1. Đọc tệp `.md` trích xuất tại `D:\Tools\markitdown\output\` theo từng bài học lẻ.
2. Đọc tệp `.mdx` hiện có tương ứng trong `content/`.
3. Lập **bảng đối chiếu chi tiết** giữa bản trích xuất `.md` và tệp `.mdx`, liệt kê rõ các thành phần:
   - **Định nghĩa** (`Definition`)
   - **Định lý, Bổ đề, Mệnh đề, Hệ quả** (`Theorem`, `Lemma`, `Proposition`, `Corollary`)
   - **Chứng minh** (`Proof`)
   - **Ví dụ, Phản ví dụ, Nhận xét** (`Example`, `Counterexample`, `Remark`)
   - **Bài tập & Lời giải** (`Exercise`, `Solution`, `Hint`)

   Ghi rõ từng mục đang **đủ**, **bị thiếu**, hay **bị cắt ngắn/lược bỏ** so với tài liệu nguồn.

### Pha 2 — Vá bổ sung nguyên vẹn & Kiểm toán KaTeX

1. Chỉ sau khi đã lập xong danh sách thiếu đầy đủ ở Pha 1 mới tiến hành vá bổ sung vào tệp `.mdx`.
2. **Không tóm lược hay cắt bớt chứng minh**: Giữ trọn vẹn các bước lập luận, biến đổi và điều kiện toán học từ tài liệu gốc.
3. Sau khi cập nhật `.mdx`, **luôn chạy lệnh kiểm toán bắt buộc**:
   ```powershell
   node scripts/audit-mdx-katex.mjs
   ```
   và xác nhận kết quả **`0` lỗi KaTeX** (cùng thẻ JSX/MDX hợp lệ) trước khi kết thúc phiên làm việc.
