# BÁO CÁO NÂNG CẤP THỊ GIÁC (VISUAL REFINEMENT REPORT)
## TĂNG CƯỜNG BẢN SẮC VĂN HÓA VIỆT NAM — LEARNING UNIVERSE
**Concept:** *Vietnamese Heritage – A Universe of Knowledge*  
**Ngày thực hiện:** 02/11/2026  
**Trạng thái:** Đã hoàn thành (Green Build & Green Tests)

---

## I. MỤC TIÊU VÀ BỐI CẢNH NÂNG CẤP

### 1. Phản hồi và Đánh giá Hiện trạng
Sau lần Redesign trang chủ ban đầu:
- **Ưu điểm:** Bố cục 7 khu vực mạch lạc, bảng màu giấy Dó (#F7F4EC) và xanh ngọc (#173E35) trang nhã, typography hiện đại, kiểm thử 47/47 passed.
- **Tồn tại:** Yếu tố bản sắc văn hóa Việt Nam chưa thể hiện đủ rõ nét; vòng tròn đồng tâm ở Hero mờ nhạt (opacity 0.14), để trống nửa bên phải của Hero trên Desktop; thiếu điểm nhấn thị giác văn hóa có chiều sâu.

### 2. Định hướng Thiết kế Mới (Tỷ lệ 60 - 40)
- **60% Hiện đại & Học thuật:** Bảo đảm sự nghiêm cẩn toán học, gãy gọn, độ tương phản đọc chuẩn WCAG AAA, cấu trúc module sắc nét.
- **40% Bản sắc Di sản Việt Nam:**
  1. *Trống đồng Đông Sơn:* Mặt trời 14 tia, vành chim Lạc bay sải cánh ngược chiều kim đồng hồ, vành răng cưa/răng lược, chuỗi hạt vừng, mắt tiếp tuyến và hoa văn thổ cẩm quả trám liên hoàn.
  2. *Kiến trúc Đình làng & Mộc bản:* Mộng gỗ góc thẻ (`WoodblockCornerMotif`), dải hồi văn / răng lược (`TraditionalMeanderBorder`).
  3. *Chất liệu Thủ công:* Giấy Dó, nan nón lá xoắn ốc lan tỏa và vạt đan tre nan thưa.

---

## II. DANH MỤC HỌA TIẾT VÀ NÂNG CẤP KỸ THUẬT

### 1. Họa tiết Trống đồng Đông Sơn Nâng cao (`DongSonDrumVisual`)
Tệp triển khai: `src/shared/ui/HeritageMotifs.tsx`
- **Mặt trời 14 tia trung tâm:** Tái hiện trung tâm trống đồng Ngọc Lũ với 14 tia nhọn vươn ra, xen kẽ hoa văn lông công/đuôi chim, điểm xuyết tâm màu sơn son cổ điển (`#8B302D`).
- **6 Vành hoa văn kinh điển:**
  - *Vành 1:* Vành chuỗi hạt vừng (stippling dots) đối xứng tỏa đều.
  - *Vành 2:* Vành răng cưa tam giác (sawteeth serration) cách điệu bánh răng đối xứng.
  - *Vành 3:* Đàn chim Lạc 6 cánh bay sải ngược chiều kim đồng hồ mang đậm tính khí động học cổ truyền.
  - *Vành 4:* Vòng tròn kép có chấm tâm nối các đường tiếp tuyến hình học.
  - *Vành 5:* Hoa văn thổ cẩm quả trám (diamond brocade) hình thoi liên hoàn.
  - *Vành 6:* Vòng nan nón lá xoắn ốc lan tỏa ra không gian 2.5D.
- **Hiệu ứng Gradient:** Sử dụng radial gradient đồng cổ (`#B89555` và `#173E35`) tạo cảm giác ánh kim đồng mộc mạc.

### 2. Dải Hoa văn Hồi văn / Răng lược (`TraditionalMeanderBorder`)
- Tạo hoa văn SVG lặp tuần hoàn (`patternUnits="userSpaceOnUse"`).
- Đặt tại chân thanh điều hướng (Sticky Header) để tạo đường viền mộng gỗ kiến trúc đình làng tinh tế, ngăn cách tự nhiên giữa Header và nội dung.
- Đặt tại chân thẻ Hero Landmark và đỉnh Sơ đồ dòng chảy tri thức.

### 3. Họa tiết Mộng gỗ Góc thẻ (`WoodblockCornerMotif`)
- Lấy cảm hứng từ các mộng ghép gỗ kiến trúc đình chùa và khung viền bản khắc mộc bản (khắc gỗ in sách truyền thống).
- Ứng dụng: 4 góc thẻ Hero Cultural Landmark, 4 góc thẻ môn học (`SubjectCard`), và góc của 6 thẻ trụ cột học thuật tại Thư viện Tri thức.

---

## III. TÁI CẤU TRÚC BỐ CỤC HERO SECTION

### 1. Bố cục Màn hình Lớn (Desktop $\ge 1024\text{px}$)
- **Cột trái (7/12 cột):**
  - Eyebrow Badge: `"KHÔNG GIAN TRI THỨC ĐƯƠNG ĐẠI"`
  - Tiêu đề H1: Bảo toàn nguyên vẹn `"Không gian học tập Toán học đại học"` và `"KHAI MỞ TRI THỨC - KẾT NỐI TƯƠNG LAI"`.
  - Đoạn giới thiệu chuẩn học thuật.
  - Cụm hành động kép (Dual CTA): *Khám phá môn học* & *Bắt đầu hành trình*.
  - Thanh tìm kiếm tức thời SearchBar.
- **Cột phải (5/12 cột) — Hero Cultural Landmark Card:**
  - Thiết kế dạng thẻ bản khắc tri thức Di sản Việt Nam trên nền giấy Dó mờ.
  - 4 mộng gỗ góc thẻ (`WoodblockCornerMotif`) định vị 4 góc.
  - Trống đồng Đông Sơn `DongSonDrumVisual` sắc nét với đường kính 256px, tương tác parallax 2.5D theo chuyển động chuột (tự động vô hiệu hóa khi người dùng bật `prefers-reduced-motion`).
  - Huy hiệu con dấu son: `"Di sản Tri thức & Văn hóa Việt"`.
  - Thông số học thuật: `"10 Chương · 40 Bài học · Mã nguồn mở 100%"`.
  - Dải hồi văn đáy thẻ `TraditionalMeanderBorder`.

### 2. Bố cục Màn hình Nhỏ (Tablet & Mobile $< 1024\text{px}$)
- Đồ họa Trống đồng Đông Sơn & chim Lạc hiển thị tinh tế dưới dạng background layer với độ mờ tối ưu (`opacity-[0.16]`).
- Căn chỉnh an toàn không đè lên câu chữ, không làm giảm độ tương phản của tiêu đề và nút bấm.
- `overflow-x: hidden` đảm bảo 100% không bị tràn màn hình ngang.

---

## IV. BẢO TOÀN KIỂM THỬ VÀ TÍNH NĂNG

| Mục tiêu kiểm định | Kết quả | Ghi chú |
| :--- | :---: | :--- |
| **Accessibility (A11y)** | **ĐẠT** | Toàn bộ SVG họa tiết đều có `aria-hidden="true"`, không gây nhiễu cho Screen Readers. |
| **Reduced Motion** | **ĐẠT** | Hook `useReducedMotion` vô hiệu hóa hoàn toàn hiệu ứng dịch chuyển chuột khi người dùng cài đặt OS giảm chuyển động. |
| **Hiệu năng & Tài nguyên** | **ĐẠT** | 100% Native Vector SVG, 0 request hình ảnh ngoài, 0ms blocking I/O, 60fps tương tác. |
| **Format & Lint** | **ĐẠT** | Prettier và ESLint 100% sạch. |
| **TypeScript Typecheck** | **ĐẠT** | `tsc -b` không có bất kỳ cảnh báo hay lỗi kiểu (`strict: true`). |
| **Toàn bộ Test Suite** | **47/47 PASS** | Toàn bộ 9 tệp kiểm thử trong dự án đều vượt qua. |
| **Production Build** | **ĐẠT** | `vite build` đóng gói production thành công. |

---

## V. DANH SÁCH FILE ĐÃ THAY ĐỔI

1. `src/shared/ui/HeritageMotifs.tsx`: Bổ sung `DongSonDrumVisual`, `TraditionalMeanderBorder`, `WoodblockCornerMotif`.
2. `src/shared/ui/index.ts`: Export các motif mới ra hệ thống UI components dùng chung.
3. `src/layouts/RootLayout.tsx`: Tích hợp dải hồi văn `TraditionalMeanderBorder` dưới chân Header.
4. `src/features/subject/SubjectCard.tsx`: Tích hợp mộng gỗ góc thẻ và nâng độ tương phản watermark kỷ hà.
5. `src/pages/home/HomePage.tsx`: Tái cấu trúc Hero Section thành bố cục 2 cột cân bằng, bổ sung Hero Landmark Card, mộng gỗ góc thẻ cho 6 trụ cột học thuật và dải hồi văn cho bản đồ tri thức.
6. `docs/design/HOMEPAGE_VISUAL_REFINEMENT_REPORT.md`: Báo cáo chi tiết nâng cấp thị giác.
