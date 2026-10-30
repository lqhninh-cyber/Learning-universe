# Hướng dẫn Cài đặt Môi trường (`setup.md`)

## 1. Yêu cầu hệ thống

- **Node.js:** `>= 24` (CI và Vercel sử dụng Node 24 LTS; môi trường máy trạm phát triển hỗ trợ Node 24/26).
- **Git:** Git for Windows đã cấu hình `user.name` và `user.email`.
- **Trình quản lý gói:** `npm` (trên Windows PowerShell khi bị chặn ExecutionPolicy, gọi qua `npm.cmd` và `npx.cmd`).

## 2. Thiết lập biến môi trường

Sao chép `.env.example` thành `.env.local`:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-hoac-publishable-key>
VITE_SITE_URL=http://localhost:5173
```

- **Lưu ý bảo mật:** Chỉ đặt khóa công khai (`anon` / `publishable`) trong `.env.local`. Tuyệt đối không đặt `service_role` / `secret` key vào ứng dụng frontend.
- **Chế độ khách chỉ đọc:** Nếu chưa cấu hình `.env.local`, ứng dụng vẫn khởi chạy và cho phép đọc toàn bộ nội dung công khai.

## 3. Các lệnh kiểm tra chất lượng

- `npm.cmd run dev`: Chạy máy chủ phát triển tại `http://localhost:5173`.
- `npm.cmd run format:check`: Kiểm tra định dạng mã nguồn bằng Prettier.
- `npm.cmd run lint`: Kiểm tra quy tắc mã nguồn bằng ESLint.
- `npm.cmd run typecheck`: Kiểm tra kiểu TypeScript (`tsc -b --pretty`).
- `npm.cmd run test`: Chạy bộ kiểm thử tự động bằng Vitest.
- `npm.cmd run check`: Chạy toàn bộ các bước kiểm tra trên.
- `npm.cmd run build`: Đóng gói bản production vào thư mục `dist/`.
