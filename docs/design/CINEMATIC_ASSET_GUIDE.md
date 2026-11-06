# Hướng dẫn Quản lý Hình ảnh Cảnh quan & Kiến trúc Việt Nam (`CINEMATIC_ASSET_GUIDE.md`)

Tài liệu này quy định tiêu chuẩn hình ảnh, bố cục thị giác và cách mở rộng danh mục cảnh quan Việt Nam cho hệ thống giao diện **Cinematic Architectural Editorial** của nền tảng **Learning Universe**.

---

## 1. Triết lý Thị giác: Cảnh quan & Kiến trúc Học thuật Việt Nam

Toàn bộ ảnh nền mở màn (Hero Cover) trên Trang chủ và từng Trang Môn học đều sử dụng cảnh quan thiên nhiên, di sản kiến trúc và không gian học đường Việt Nam với các nguyên tắc:

1. **Tỷ lệ khung hình:** Góc rộng điện ảnh `16:9` (độ phân giải khuyến nghị `2400 × 1350 px`), đường chân trời thấp hoặc có khoảng không gian thoáng ở nửa trên để tôn vinh Typography Serif.
2. **Hòa sắc Giấy Dó (`#FAF7F2`):** Ảnh được phủ lớp lọc hòa sắc học thuật (`bg-gradient-to-t from-[#FAF7F2] via-[#FAF7F2]/55 to-[#FAF7F2]/35`), giữ ánh sáng ban ngày dịu nhẹ, tuyệt đối không dùng nền tối đen kiểu web phim.
3. **Ẩn dụ chuyên môn:**
   - **Trang chủ (`HomePage` — Screen 1):** _Khuê Văn Các (Văn Miếu – Quốc Tử Giám)_ phản chiếu mặt nước tĩnh lặng — biểu tượng truyền thống hiếu học và tinh hoa tri thức Việt Nam.
   - **Cấu trúc đại số (`MATH1301`):** _Kiến trúc cổng vòm & hành lang đối xứng Cố đô Huế_ — ẩn dụ cho tính đối xứng trục, nhóm phép biến hình và trật tự tiên đề.
   - **Hình học Affine & Euclide (`MATH1302`):** _Vịnh Hạ Long & Tràng An (Ninh Bình)_ — ẩn dụ cho phối cảnh không gian đa chiều, phép chiếu song song và mặt phẳng phản chiếu đẳng cự.
   - **Giải tích hàm một biến (`MATH1303`):** _Ruộng bậc thang Mù Cang Chải (Tây Bắc)_ — ẩn dụ cho đường cong liên tục, các lát cắt tích phân Riemann và độ dốc tiếp tuyến.
   - **Giáo dục học (`EDUT1401`):** _Không gian giảng đường & hành lang kiến trúc Đông Dương (Quốc Học Huế / HCMUE)_ — biểu trưng cho môi trường sư phạm nhân văn, ấm áp.

---

## 2. Cấu trúc Tệp Cấu hình Tập trung (`src/data/cinematicAssets.ts`)

Mọi đường dẫn ảnh nội bộ (`localSrc` trong `/public/images/scenes/...`) và ảnh CDN tốc độ cao (`remoteSrc`) được quản lý duy nhất tại [`src/data/cinematicAssets.ts`](../../src/data/cinematicAssets.ts):

| Khóa (`slug`)            | Mã học phần | Phân nhánh (`branch`) | Cảnh quan Việt Nam đại diện            | Đường dẫn nội bộ (`localSrc`)                          |
| :----------------------- | :---------- | :-------------------- | :------------------------------------- | :----------------------------------------------------- |
| `opening`                | —           | —                     | Khuê Văn Các · Văn Miếu – Quốc Tử Giám | `/images/scenes/vn-khue-van-cac-opening.jpg`           |
| `cau-truc-dai-so`        | `MATH1301`  | `math`                | Kiến trúc đối xứng Cố đô Huế           | `/images/scenes/vn-hue-symmetry-algebra.jpg`           |
| `hinh-hoc-affine`        | `MATH1302`  | `math`                | Vịnh Hạ Long & Tràng An – Ninh Bình    | `/images/scenes/vn-ha-long-trang-an-affine.jpg`        |
| `giai-tich-ham-mot-bien` | `MATH1303`  | `math`                | Ruộng bậc thang Mù Cang Chải           | `/images/scenes/vn-mu-cang-chai-terraces-calculus.jpg` |
| `giao-duc-hoc`           | `EDUT1401`  | `pedagogy`            | Giảng đường Quốc Học Huế & HCMUE       | `/images/scenes/vn-indochine-campus-pedagogy.jpg`      |

---

## 3. Quy trình Thêm Môn học Mới (Mở rộng lên 10–20 Môn học)

Khi bổ sung một môn học mới vào `content/<slug>/subject.yaml`:

1. Mở [`src/data/cinematicAssets.ts`](../../src/data/cinematicAssets.ts) và thêm một mục mới vào `COURSE_CINEMATIC_ASSETS`:
   - `courseCode`: Mã học phần chuẩn (ví dụ: `MATH1404`).
   - `branch`: `'math'` (Toán học) hoặc `'pedagogy'` (Khoa học Giáo dục).
   - `categoryLabel`: `<Mã học phần> · <Tên phân nhánh>`.
   - `title`: Tên chính thức của môn học.
   - `conciseDescription`: 1 câu mô tả cô đọng, trực diện đúng trọng tâm chuyên môn của học phần (không dùng khẩu hiệu hoa mỹ).
   - `vietnameseLandmark`, `localSrc`, `remoteSrc`, `alt`, `coordinates`.
2. **Screen 2 — Interactive Course Hub** trên Trang chủ và **Cinematic Course Cover** trên Trang chi tiết môn học (`/courses/:slug` và `/mon-hoc/:slug`) sẽ tự động nhận diện môn học mới, tích hợp vào bộ lọc phân nhánh và áp dụng hiệu ứng chuyển cảnh SVG Mask (`Horizontal Blinds`).
