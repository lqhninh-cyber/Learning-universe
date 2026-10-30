# Learning Universe

Nền tảng học tập trực tuyến tổng hợp các học phần trong Chương trình đào tạo ngành **Sư phạm Toán học**, khởi đầu với hai môn **Cấu trúc đại số** và **Hình học Affine**.

## Kiến trúc cốt lõi

- **Frontend:** React 19, TypeScript (`strict`), Vite, Tailwind CSS v4, React Router v7, Motion.
- **Nội dung học thuật (Git là nguồn sự thật):** MDX + KaTeX + Mafs (2D), quản lý trong thư mục `content/`.
- **Dữ liệu người dùng:** Supabase Auth (Email/Password) và Supabase PostgreSQL (hồ sơ, tiến độ, bài yêu thích, ghi chú).
- **Chế độ khách (Guest):** Khách chưa đăng nhập đọc được toàn bộ bài học công khai; đăng nhập chỉ cần thiết khi muốn lưu và đồng bộ dữ liệu cá nhân.

## Bắt đầu nhanh

Xem chi tiết tại [docs/setup.md](./docs/setup.md).

```bash
# Cài đặt dependencies
npm.cmd install

# Chạy máy chủ phát triển (http://localhost:5173)
npm.cmd run dev

# Kiểm tra định dạng, lint, kiểu dữ liệu và unit test
npm.cmd run check

# Đóng gói bản production
npm.cmd run build
```

## Tài liệu dự án

- [Hướng dẫn cài đặt môi trường](./docs/setup.md)
- [Nhật ký quyết định kiến trúc (D1–D9)](./docs/decisions.md)
- [Cấu trúc thư mục nội dung](./content/README.md)
- [Quy tắc làm việc cho AI Agent](./AGENTS.md)
