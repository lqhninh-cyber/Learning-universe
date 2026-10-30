---
trigger: always_on
description: Bảo vệ nội dung học thuật đã được phê duyệt trong thư mục content/
---

# Quy tắc bảo vệ nội dung học thuật (`content-protection`)

1. **Cấm tự ý sửa nội dung đã duyệt:**
   - Tuyệt đối **KHÔNG** chỉnh sửa nội dung học thuật (định nghĩa, định lý, bổ đề, mệnh đề, hệ quả, chứng minh, ví dụ, bài tập, lời giải) của các bài học có trạng thái `approved` hoặc `published`.
2. **Phạm vi hỗ trợ với bài `draft` và `review`:**
   - Chỉ được sửa **lỗi định dạng và kỹ thuật** (cú pháp MDX, cú pháp LaTeX không tương thích KaTeX, tên component, thuộc tính bắt buộc bị thiếu) khi chủ dự án yêu cầu.
   - Sau khi sửa định dạng, phải **liệt kê rõ từng thay đổi** để chủ dự án kiểm tra.
3. **Khi phát hiện nghi vấn học thuật:**
   - Nếu phát hiện điểm nghi ngờ sai sót toán học trong bất kỳ bài học nào, chỉ **báo cáo vị trí và mô tả vấn đề** cho chủ dự án; không tự ý viết lại mệnh đề hay chứng minh.
