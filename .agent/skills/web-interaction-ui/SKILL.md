---
name: web-interaction-ui
description: Áp dụng các tiêu chuẩn thiết kế UI/UX hiện đại, hệ thống Design Tokens và hiệu ứng chuyển động/tương tác mượt mà khi viết mã giao diện web. Tự động kích hoạt khi chỉnh sửa giao diện, component, CSS, animation hoặc layout.
---

# Nguyên tắc thiết kế Giao diện và Tương tác Web

Mỗi khi xây dựng hoặc tinh chỉnh giao diện, agent bắt buộc phải tuân theo các quy chuẩn sau:

## 1. Visual Aesthetics & Design System

- **Tránh giao diện mẫu (AI defaults)**: Không sử dụng các bố cục thẻ (card) xám xịt đơn điệu hoặc các màu xanh mặc định thiếu điểm nhấn.
- **Design Tokens**: Luôn khai báo và sử dụng biến CSS (`--primary`, `--surface`, `--accent`, `--radius`, `--text-muted`). Không hardcode mã màu hex rải rác trong file.
- **Spacing Scale**: Tuân thủ hệ lưới 4px / 8px (`gap-2`, `p-4`, `p-6`...).
- **Typography Hierarchy**: Phân cấp kích thước font và line-height rõ ràng, sử dụng font sans-serif hiện đại với độ tương phản văn bản đạt chuẩn WCAG AA.

## 2. Micro-interactions & Motion (Tương tác & Hiệu ứng)

- **Visual Feedback**: Mọi thành phần tương tác (Button, Card, Input, Tab) bắt buộc phải có trạng thái rõ ràng:
  - `:hover`: Dịch chuyển nhẹ (`translate-y-[-1px]` hoặc `translate-y-[-2px]`), độ sáng hoặc viền highlight tinh tế.
  - `:active`: Hiệu ứng nhấn xuống (`scale(0.98)`).
  - `:focus-visible`: Outline rõ nét hỗ trợ điều hướng bàn phím.
- **Timing & Easing**:
  - Thời gian chuyển đổi (transition duration) từ 150ms đến 250ms cho các tương tác micro.
  - Sử dụng timing function tự nhiên: `cubic-bezier(0.16, 1, 0.3, 1)` thay vì `linear`.
- **Loading & Empty States**: Cung cấp Skeleton loaders hoặc hiệu ứng Shimmer khi fetch dữ liệu, tránh layout shift (CLS).
- **Page Transitions**: Khi xuất hiện danh sách hoặc card, thêm stagger fade-in nhẹ.

## 3. Ergonomics & Usability

- Vùng bấm (Touch target) tối thiểu 44x44px trên thiết bị di động.
- Không che khuất nội dung quan trọng; tooltip/modal phải đóng được bằng phím `Escape` hoặc bấm ra ngoài (click outside).
