# Bộ Ảnh Nghệ Thuật Khí Quyển (`public/assets/atmosphere/`)

Thư mục này chứa các tệp ảnh nền ngoài (External Curated Assets) cho kiến trúc **Thiên Cảnh Kính Mờ (Atmospheric Glassmorphism × Swiss Editorial)** của Learning Universe.

Chỉ cần đặt tệp ảnh đúng tên dưới đây vào thư mục này — giao diện sẽ tự động nạp mượt với hiệu ứng hiện mờ `450ms` và hòa tan đáy (không cần sửa mã nguồn React). Nếu tệp chưa tồn tại, hệ thống tự động dùng nền **Watercolor Mesh Fallback** đồng bộ màu Sứ Bạch / Than Đá.

## Danh sách tên tệp chuẩn

| Tên tệp                                | Vị trí sử dụng                                                | Thông số khuyến nghị                                                                                                                                                        |
| :------------------------------------- | :------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dashboard-canopy-light.webp`          | Tầng 1 Trang Tổng quan (`/`) — Chế độ Sáng (_Ceramic Light_)  | `2560×1100px` (hoặc `1920×840px`), `< 350KB`. Màu nước / thủy mặc sáng tông Bạch Ngọc – Lam Sương – Lục Nhạt, **không ám vàng**; 35% vùng đáy thoáng sáng tan về `#FFFFFF`. |
| `dashboard-canopy-dark.webp`           | Tầng 1 Trang Tổng quan (`/`) — Chế độ Tối (_Obsidian Studio_) | `2560×1100px` (hoặc `1920×840px`), `< 350KB`. Bản đêm độc lập: Than Đá – Lục Thông trầm – Lam Đêm – ánh đồng mờ; 35% vùng đáy chìm sâu về `#121716`.                        |
| `subject-wash-ctds.webp` _(tùy chọn)_  | Dải khí quyển đầu trang Cấu trúc đại số                       | `1920×400px`, `< 120KB`, vệt loang Nâu Hổ Phách (`#8C5828`).                                                                                                                |
| `subject-wash-hhave.webp` _(tùy chọn)_ | Dải khí quyển đầu trang Hình học Affine & Euclide             | `1920×400px`, `< 120KB`, vệt loang Lam Phổ (`#1D4F6E`).                                                                                                                     |
| `subject-wash-gthmb.webp` _(tùy chọn)_ | Dải khí quyển đầu trang Giải tích hàm một biến                | `1920×400px`, `< 120KB`, vệt loang Lục Thông (`#1B5E4A`).                                                                                                                   |
| `subject-wash-gdh.webp` _(tùy chọn)_   | Dải khí quyển đầu trang Giáo dục học                          | `1920×400px`, `< 120KB`, vệt loang Son Gạch Trầm (`#8F3D35`).                                                                                                               |

## Lưu ý bố cục ảnh (Safe Zones)

- **45% vùng bên trái:** ít chi tiết rối hoặc sáng/tối đồng nhất để tiêu đề Serif và danh ngôn nổi bật.
- **35% vùng đáy:** sáng dần về `#FFFFFF` (bản Sáng) hoặc tối dần về `#121716` (bản Tối) để khớp hoàn hảo với mặt nạ hòa tan viền.
