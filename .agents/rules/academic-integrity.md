---
trigger: always_on
description: Cấm tự tạo hoặc suy đoán thông tin giáo trình, số trang và số hiệu gốc
---

# Quy tắc liêm chính học thuật (`academic-integrity`)

1. **Không tự tạo thông tin giáo trình:**
   - Tuyệt đối **KHÔNG** tự điền, suy đoán hoặc bịa tên giáo trình, tác giả, năm xuất bản, nhà xuất bản, ISBN trong `content/_shared/bibliography.yaml` hay bất kỳ file cấu hình môn học nào khi chủ dự án chưa cung cấp.
2. **Không suy đoán số trang và số hiệu gốc:**
   - Không tự điền số trang (`pages`, `page`) hoặc số hiệu gốc (`original`) nếu không có thông tin xác thực từ tài liệu gốc do chủ dự án cung cấp.
   - Khi chưa xác định được, hãy để trống trường tùy chọn hoặc hỏi trực tiếp chủ dự án.
3. **Dữ liệu kiểm thử:**
   - Mọi dữ liệu giả phục vụ kiểm thử tự động chỉ được đặt trong `tests/fixtures/` và phải ghi rõ là dữ liệu kiểm thử; không bao giờ đưa vào `content/`.
