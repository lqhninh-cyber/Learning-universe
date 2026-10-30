---
trigger: always_on
description: Quy ước mã nguồn TypeScript, React, Tailwind v4 và URL tiếng Việt kebab-case
---

# Quy ước mã nguồn (`code-conventions`)

1. **Ngôn ngữ và đường dẫn (Quyết định D8):**
   - Giao diện người dùng sử dụng **tiếng Việt** chuẩn xác, rõ ràng.
   - Mọi đường dẫn URL và slug sử dụng **tiếng Việt không dấu, nối bằng gạch ngang (`kebab-case`)**, chỉ gồm `[a-z0-9-]`. Ví dụ: `/mon-hoc/cau-truc-dai-so/nhom/dinh-nghia-nhom`.
2. **TypeScript và React:**
   - Bật `strict: true`, không dùng `any`, ưu tiên kiểu tường minh ở ranh giới module.
   - Sử dụng path alias `@/*` trỏ về `src/*`.
3. **Tailwind CSS v4 và Theming:**
   - Không ghép chuỗi tạo tên class Tailwind động (như `bg-${color}-500`).
   - Màu nhận diện theo từng môn phải thông qua biến CSS và token cố định.
4. **Bảo mật Supabase:**
   - Chỉ sử dụng khóa công khai (`VITE_SUPABASE_ANON_KEY` / `VITE_SUPABASE_PUBLISHABLE_KEY`) ở frontend.
   - Không bao giờ đưa `service_role` hoặc `secret` key vào mã nguồn hay file `.env*` của frontend.
   - Ứng dụng phải hoạt động bình thường ở chế độ khách chỉ đọc ngay cả khi thiếu cấu hình Supabase (Quyết định D1).
