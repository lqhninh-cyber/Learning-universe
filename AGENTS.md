# Learning Universe — Hướng dẫn cho AI Agent (`AGENTS.md`)

Tài liệu này áp dụng cho mọi AI agent làm việc trong kho mã nguồn `learning-universe`.

## 1. Tổng quan kiến trúc

- **Mục tiêu:** Nền tảng học tập trực tuyến cho sinh viên ngành Sư phạm Toán học, bắt đầu với **Cấu trúc đại số** và **Hình học Affine**.
- **Git là nguồn sự thật của nội dung học thuật:** Toàn bộ nội dung bài học nằm trong `content/` (MDX + YAML). Supabase **chỉ** dùng cho xác thực, hồ sơ người dùng (`full_name`), tiến độ học, bài yêu thích và ghi chú.
- **Không tích hợp AI trên website:** Không gọi AI API trực tiếp trên website, không xử lý/upload PDF trên website, không dùng RAG hay Vector DB.
- **Ranh giới rõ ràng:**
  - `content/`: Nội dung học thuật do chủ dự án phê duyệt.
  - `src/`: Mã nguồn ứng dụng React, hệ thống hiển thị MDX/KaTeX/Mafs và kết nối Supabase.

## 2. Lệnh thường dùng

Trên Windows khi PowerShell chặn `npm.ps1`, luôn gọi qua `npm.cmd` và `npx.cmd`:

- `npm.cmd run dev`: Chạy máy chủ phát triển tại `http://localhost:5173`.
- `npm.cmd run check`: Chạy kiểm tra định dạng (`format:check`), `lint`, `typecheck` và `test`.
- `npm.cmd run build`: Kiểm tra kiểu (`tsc -b`) và đóng gói bản production (`vite build`).
- `npm.cmd run format`: Tự động chuẩn hóa định dạng với Prettier.

## 3. Quy tắc bắt buộc

Mọi agent phải tuân thủ nghiêm ngặt 3 bộ quy tắc trong `.agents/rules/`:

- @[Bảo vệ nội dung học thuật](.agents/rules/content-protection.md)
- @[Liêm chính học thuật và giáo trình](.agents/rules/academic-integrity.md)
- @[Quy ước mã nguồn và đường dẫn](.agents/rules/code-conventions.md)
