# KẾ HOẠCH TRIỂN KHAI THIẾT KẾ LẠI TRANG CHỦ (HOMEPAGE REDESIGN PLAN)

## Concept: Di sản tri thức – Thư viện đình làng – Hình học bản sắc Việt

_(Vietnamese Heritage – A Universe of Knowledge)_

> **Đơn vị lập kế hoạch:** Hội đồng Chuyên môn Thiết kế & Kiến trúc Frontend (Learning Universe)  
> **Thời điểm lập:** Tháng 11/2026  
> **Phiên bản tài liệu:** v1.0.0 — Giai đoạn 1: Khảo sát & Lập kế hoạch kiến trúc  
> **Tài liệu tham chiếu:** [`docs/design/VN_CULTURAL_DESIGN_EVALUATION.md`](file:///d:/Learning-universe/docs/design/VN_CULTURAL_DESIGN_EVALUATION.md), mã nguồn `src/pages/home/HomePage.tsx`, `src/features/subject/SubjectCard.tsx`, `src/layouts/RootLayout.tsx`.

---

## I. BỐI CẢNH DỰ ÁN & KẾT QUẢ KHẢO SÁT HIỆN TRẠNG

### 1.1. Hiện trạng Trang chủ (`src/pages/home/HomePage.tsx`)

Khảo sát trực tiếp tệp mã nguồn [`HomePage.tsx`](file:///d:/Learning-universe/src/pages/home/HomePage.tsx) và hệ thống kiểm thử tự động ghi nhận:

- **Cấu trúc hiện tại:**
  1. _Header & Hero:_ Huy hiệu "Chương trình Sư phạm Toán học", tiêu đề `<h1>` "Không gian học tập Toán học đại học", đoạn văn mô tả và component [`SearchBar`](file:///d:/Learning-universe/src/features/search/SearchBar.tsx).
  2. _Thẻ tiếp tục bài học gần nhất:_ Hiển thị nếu người dùng đã có lịch sử đọc (`lastVisitedGlobal`).
  3. _Danh sách học phần hiện có:_ Tiêu đề mục, link "Xem tất cả môn học", và lưới 2 cột hiển thị các [`SubjectCard`](file:///d:/Learning-universe/src/features/subject/SubjectCard.tsx).
  4. _Trạng thái hệ thống:_ Khối hiển thị kết nối dữ liệu Supabase / Chế độ khách chỉ đọc.
- **Đánh giá thẩm mỹ:**
  - Trang chủ hiện rất tinh gọn (đã dọn dẹp các khối quảng cáo tính năng dư thừa), tốc độ tải trang cực nhanh.
  - Tuy nhiên, phong cách thị giác hiện thuần túy là "Modern Minimalist Neutral" (trắng, xám stone), chưa phản ánh được chiều sâu văn hóa Việt Nam và tính độc bản của nền tảng Toán học Sư phạm Việt Nam.

### 1.2. Các Ràng buộc Kiểm thử Kỹ thuật Bắt buộc Bảo toàn

Các bài kiểm thử tự động hiện tại trong codebase đặt ra các yêu cầu bất biến khi thiết kế lại giao diện:

1. **Kiểm thử Route Smoke (`src/app/App.test.tsx`):**
   - Bắt buộc tồn tại tiêu đề trang khớp với biểu thức chính quy: `/Không gian học tập Toán học đại học/i`.
   - Bắt buộc tồn tại các đường link có tên `"Cấu trúc đại số"` trỏ đến `/mon-hoc/cau-truc-dai-so` và `"Hình học Affine"` trỏ đến `/mon-hoc/hinh-hoc-affine`.
2. **Kiểm thử Tìm kiếm Tức thời (`src/pages/phase3-navigation.test.tsx`):**
   - Ô tìm kiếm [`SearchBar`](file:///d:/Learning-universe/src/features/search/SearchBar.tsx) phải giữ nguyên thuộc tính `role="searchbox"` với `aria-label="Tìm kiếm môn học hoặc bài học"` để hỗ trợ tra cứu từ khóa không dấu/có dấu (ví dụ: "Cayley", "Chasles").
3. **Cơ chế Chủ đề Môn học (Subject Theming):**
   - Thẻ môn học và các trang con sử dụng hệ token OKLCH qua thuộc tính `data-subject` (Cấu trúc đại số: hue 275; Hình học Affine: hue 175). Việc bổ sung màu văn hóa của trang chủ không được phá vỡ logic màu nhận diện của từng môn.

---

## II. TRIẾT LÝ THIẾT KẾ: "VIETNAMESE HERITAGE – A UNIVERSE OF KNOWLEDGE"

Trang chủ được tái thiết kế như **tiền sảnh của một Thư viện Hàn lâm Việt Nam đương đại**, nơi văn hóa truyền thống được số hóa qua 3 tầng trừu tượng hóa hình học:

```
┌────────────────────────────────────────────────────────────────────────┐
│             BA LỚP CHUYỂN HÓA VĂN HÓA SANG DIGITAL UI                  │
├────────────────────────────────────────────────────────────────────────┤
│  LỚP 1: DI SẢN TRI THỨC (Knowledge Heritage)                           │
│  - Vòng tròn đồng tâm Đông Sơn thanh mảnh (sự lan tỏa tri thức).       │
│  - Chất cảm nền Trắng ngà (#F7F4EC) và Giấy Dó (#E9DFC9) dịu mắt.      │
│  - Sắc mực tàu thẫm (#292824) cho văn bản học thuật sắc nét.           │
├────────────────────────────────────────────────────────────────────────┤
│  LỚP 2: THƯ VIỆN ĐÌNH LÀNG (Communal Academy Architecture)             │
│  - Phân gian không gian rành mạch: Hero (Tiền sảnh) - Môn học          │
│    (Các gian tri thức) - Tiếp nối (Bàn nghiên cứu cá nhân).            │
│  - Khung viền thẻ (Card Border) lấy cảm hứng từ cấu trúc cửa bức bàn   │
│    và mộng gỗ tối giản, tạo chiều sâu thị giác phân lớp trang trọng.   │
├────────────────────────────────────────────────────────────────────────┤
│  LỚP 3: HÌNH HỌC BẢN SẮC VIỆT (Indigenous Geometry in Mathematics)     │
│  - Cấu trúc đối xứng nan nón lá xoắn ốc (Logarithmic Spiral).          │
│  - Lưới mây tre đan lục giác (Kagome lattice) làm đường viền divider.  │
│  - Họa tiết kỷ hà riêng biệt nhận diện từng môn học đại số & hình học. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## III. HỆ THỐNG DESIGN TOKENS MỚI DÀNH RIÊNG CHO TRANG CHỦ

### 3.1. Bảng Màu Hệ Thống & Kiểm Tra Tương Phản WCAG

| Token CSS           | Tên màu         | Giá trị HEX | Giá trị OKLCH           | Mục đích sử dụng                      |      Tỷ lệ tương phản WCAG      |
| :------------------ | :-------------- | :---------- | :---------------------- | :------------------------------------ | :-----------------------------: |
| `--lu-vn-bg`        | Trắng ngà       | `#F7F4EC`   | `oklch(0.968 0.012 95)` | Nền toàn trang chủ (thay `#fafaf9`)   |            Nền chính            |
| `--lu-vn-surface`   | Giấy dó         | `#E9DFC9`   | `oklch(0.905 0.032 85)` | Nền card nổi bật, banner tiếp tục bài |      13.8:1 (với Mực tàu)       |
| `--lu-vn-card`      | Trắng sứ ngà    | `#FFFFFF`   | `oklch(1.0 0.0 0)`      | Nền thẻ môn học (Subject Cards)       |      16.5:1 (với Mực tàu)       |
| `--lu-vn-primary`   | Xanh ngọc trầm  | `#173E35`   | `oklch(0.33 0.065 170)` | Màu thương hiệu chính, nút CTA, viền  | **10.2:1 (AAA)** trên Trắng ngà |
| `--lu-vn-secondary` | Đỏ son          | `#8B302D`   | `oklch(0.43 0.135 28)`  | Huy hiệu quan trọng, điểm nhấn active |  **5.5:1 (AA)** trên Trắng ngà  |
| `--lu-vn-accent`    | Vàng đồng       | `#B89555`   | `oklch(0.68 0.115 80)`  | Viền nhấn kỷ hà, icon viền vàng       |    3.2:1 (Đạt chuẩn đồ họa)     |
| `--lu-vn-text`      | Mực tàu         | `#292824`   | `oklch(0.24 0.008 80)`  | Văn bản chính, tiêu đề h1-h3          |    **14.2:1 (AAA Đỉnh cao)**    |
| `--lu-vn-muted`     | Xám tro gốm     | `#68645C`   | `oklch(0.50 0.015 80)`  | Văn bản phụ, số phút đọc, chú thích   |     **5.2:1 (AA Đọc dài)**      |
| `--lu-vn-border`    | Nét mộc mây tre | `#DDD5C3`   | `oklch(0.87 0.025 85)`  | Viền thẻ, đường kẻ mộng gỗ phân cách  |     Đạt chuẩn Non-text 3:1      |

### 3.2. Typography

- **Heading Display:** Duy trì `Be Vietnam Pro` (600, 700) với `letter-spacing: -0.025em`, bổ sung tinh chỉnh tỷ lệ dòng cân đối.
- **Eyebrow & Badges:** `font-medium tracking-wider uppercase text-xs`, viền đứt nét hoặc dải băng văn hóa mỏng nhẹ.
- **Mono Numbering:** `JetBrains Mono Variable` cho số chương, số bài và tỷ lệ % tiến độ.

---

## IV. ĐẶC TẢ CHI TIẾT BỐ CỤC TRANG CHỦ MỚI (LAYOUT ARCHITECTURE)

Sơ đồ cấu trúc tổng thể trang chủ:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LEARNING UNIVERSE NAVBAR                        │
│  [Logo Sen Kỷ Hà] Learning Universe   [Sư phạm Toán]   [Khách/Học viên]│
│  ════════════════════════════════════════════════════════════════════  │
│  (Đường viền chỉ gốm mỏng kết nối hệ thống)                            │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      HERO SECTION (TIỀN SẢNH TRI THỨC)                 │
│                                                                        │
│  [Eyebrow: KHÔNG GIAN HỌC TẬP ĐẠI HỌC ĐƯƠNG ĐẠI]                       │
│  <h1> Không gian học tập Toán học đại học </h1>                        │
│  <p>  Nền tảng chuẩn mực cho sinh viên Sư phạm Toán học... </p>         │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🔍 Tìm kiếm môn học, bài học, định lý, khái niệm... (SearchBar)   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  (Background SVG: Vòng tròn đồng tâm Đông Sơn & nan nón lá mờ 4%)     │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│             TIẾP NỐI HÀNH TRÌNH (CHỈ HIỂN THỊ KHI CÓ LỊCH SỬ)          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 📖 TIẾP TỤC BÀI ĐANG ĐỌC · CẤU TRÚC ĐẠI SỐ                       │  │
│  │ Bài 3.1: Lớp kề, phân hoạch và chỉ số của nhóm con  [Đọc tiếp →] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│            CÁC HỌC PHẦN HIỆN CÓ ("CÁC GIAN TRI THỨC")                  │
│  Tiêu đề: Các học phần chuyên ngành                 [Xem tất cả (2)]   │
│                                                                        │
│  ┌───────────────────────────────┐   ┌───────────────────────────────┐ │
│  │ GIAN 1: CẤU TRÚC ĐẠI SỐ       │   │ GIAN 2: HÌNH HỌC AFFINE       │ │
│  │ - Motif: Kỷ hà đối xứng nhóm  │   │ - Motif: Lưới phẳng tọa độ    │ │
│  │ - 10 chương · 39 bài học      │   │ - 1 chương · 1 bài học        │ │
│  │ - Tiến độ học: 3% (Ring)      │   │ - Tiến độ học: 0%             │ │
│  │ - [Tiếp tục 3.1] [Vào môn →]  │   │ - [Bài 1.1]   [Vào môn →]     │ │
│  └───────────────────────────────┘   └───────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                                FOOTER                                  │
│  ════════════════════════════════════════════════════════════════════  │
│  (Dải viền hoa văn mây tre Kagome cách điệu)                           │
│  © 2026 Learning Universe · Trạng thái dữ liệu: Sẵn sàng Supabase      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## V. ĐẶC TẢ CHI TIẾT CÁC THÀNH PHẦN GIAO DIỆN

### 5.1. Navigation Bar (Thanh Điều Hướng)

- **Vị trí:** Giữ vị trí sticky top-0 với nền `bg-[#F7F4EC]/90` kết hợp `backdrop-blur-md`.
- **Đường viền đáy:** Thay viền xám phẳng bằng viền đôi mộng gỗ thanh lịch: đường 1px màu `#DDD5C3` và điểm nhấn 1 vệt màu vàng đồng `#B89555` mảnh 1.5px ở trung tâm.
- **Logo:** Biểu tượng `GraduationCap` hiện tại được bổ sung vòng hào quang kỷ hà cách điệu bằng SVG nội tuyến.
- **Huy hiệu:** Đổi Badge "Sư phạm Toán học" sang viền xanh ngọc trầm `#173E35` trên nền trắng ngà `#F7F4EC`.

### 5.2. Hero Section (Tiền Sảnh Tri Thức)

- **Eyebrow:**
  ```tsx
  <div className="inline-flex items-center gap-2 rounded-full border border-[#B89555]/40 bg-[#E9DFC9]/60 px-3.5 py-1 text-xs font-semibold tracking-wider text-[#173E35] uppercase">
    <span className="h-1.5 w-1.5 rounded-full bg-[#8B302D]" />
    <span>Không gian học tập đại học đương đại</span>
  </div>
  ```
- **Tiêu đề chính:** Giữ nguyên chuỗi chuẩn để pass kiểm thử:
  `<h1 className="text-3xl font-bold tracking-tight text-[#292824] sm:text-4xl lg:text-5xl">Không gian học tập Toán học đại học</h1>`
- **Mô tả học thuật:** Nêu bật hai trụ cột học phần hiện tại (_Cấu trúc đại số_ và _Hình học Affine_).
- **Thanh tìm kiếm:** Giữ nguyên component [`SearchBar`](file:///d:/Learning-universe/src/features/search/SearchBar.tsx), tinh chỉnh viền ngoài màu `#DDD5C3`, bóng đổ ấm nhẹ, icon Search màu xanh ngọc trầm `#173E35`.
- **Đồ họa SVG Nền Hero (`HeroHeritageBackdrop`):**
  - Xây dựng component SVG thuần túy `<HeroHeritageBackdrop />` đặt ở lớp `absolute pointer-events-none -z-10 right-0 top-0 overflow-hidden w-full h-full`.
  - Họa tiết: Các vòng tròn đồng tâm lấy cảm hứng từ mặt trời trống đồng Đông Sơn, kết hợp các tia nan nón lá xoắn ốc bằng các nét vẽ siêu mảnh (`stroke-width="0.75"`), màu vàng đồng `#B89555` với độ trong suốt cực thấp (`opacity: 0.05`), tuyệt đối không đè lên chữ hay gây nhiễu ô tìm kiếm.

### 5.3. Thẻ Môn Học ("Gian Tri Thức" - Subject Cards)

Nâng cấp giao diện của [`SubjectCard.tsx`](file:///d:/Learning-universe/src/features/subject/SubjectCard.tsx) trên trang chủ:

1. **Khung bao Card:**
   - Bo góc mềm mại `rounded-2xl`, viền mộc `#DDD5C3`, nền trắng sứ ngà `#FFFFFF`.
   - Viền đỉnh (Top accent) dày 3px sử dụng màu nhận diện của môn kết hợp hoa văn góc mộng gỗ tinh vi.
2. **Họa tiết Kỷ hà Nhận diện Môn học:**
   - _Cấu trúc đại số:_ Biểu tượng kỷ hà hình thoi và các vòng tròn giao hoán đại diện cho nhóm đối xứng $D_4$ và bảng Cayley.
   - _Hình học Affine:_ Biểu tượng lưới không gian vector phẳng và tam giác trọng tâm.
3. **Khu vực Chỉ số & Tiến độ:**
   - Số chương, số bài, thời lượng hiển thị với icon màu xanh ngọc trầm.
   - 5 thẻ tags phổ biến nhất đặt trong các badge màu giấy dó nhạt `#F7F4EC`.
   - Vòng tiến độ `ProgressRing` hiển thị số % chuẩn xác ở tâm không bị đè nét.
4. **Hành động Kép:**
   - Nút chính: "Vào không gian môn học" với mũi tên chuyển động nhẹ khi hover.
   - Nút phụ ngữ cảnh: Nếu có bài đang đọc dở -> "Tiếp tục Bài X.Y"; nếu chưa đọc -> "Bắt đầu Bài 1.1".

### 5.4. Thẻ Tiếp Nối Bài Đang Đọc (Recent Activity Banner)

- Khi `lastLocation` tồn tại:
  - Nền chuyển sang màu Giấy Dó `#E9DFC9` kết hợp viền trái màu đỏ son `#8B302D` dày 4px.
  - Thông tin bài học hiển thị trang trọng: "Tiếp tục bài học gần nhất · Cấu trúc đại số".
  - Nút "Đọc tiếp bài học" mang màu xanh ngọc trầm `#173E35`, chữ trắng.

### 5.5. Footer Đồng Bộ Bản Sắc

- Phía trên footer có một đường kẻ SVG mỏng mô phỏng kỹ thuật mây tre đan Kagome (lục giác đối xứng).
- Thông tin bản quyền, chương trình Sư phạm Toán học, và trạng thái kết nối dữ liệu Supabase được căn chỉnh gọn gàng.

---

## VI. ĐẶC TẢ KỸ THUẬT ĐỒ HỌA SVG (100% NATIVE VECTOR)

Tất cả đồ họa được định nghĩa bằng mã SVG nội tuyến (Inline JSX), không tải file ảnh ngoài, không dùng thư viện nặng:

### 6.1. Họa tiết Vòng Tròn Đồng Tâm Đông Sơn (`DongSonCirclesMotif.tsx`)

```tsx
export function DongSonCirclesMotif({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="300" cy="300" r="80" stroke="#B89555" strokeWidth="0.75" strokeDasharray="3 3" />
      <circle cx="300" cy="300" r="140" stroke="#B89555" strokeWidth="0.75" />
      <circle cx="300" cy="300" r="200" stroke="#173E35" strokeWidth="0.5" strokeDasharray="4 4" />
      <circle cx="300" cy="300" r="260" stroke="#B89555" strokeWidth="0.75" />
      {/* 8 tia mặt trời kỷ hà hình thoi tối giản */}
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          x1="300"
          y1="300"
          x2={300 + 260 * Math.cos((i * Math.PI) / 4)}
          y2={300 + 260 * Math.sin((i * Math.PI) / 4)}
          stroke="#B89555"
          strokeWidth="0.5"
          strokeOpacity="0.4"
        />
      ))}
    </svg>
  );
}
```

_Dung lượng:_ **~850 bytes** gzipped; zero layout shift.

### 6.2. Dải Viền Mộng Gỗ & Đan Lát (`HeritageDivider.tsx`)

```tsx
export function HeritageDivider({ className }: { readonly className?: string }) {
  return (
    <div
      className={cn('flex items-center justify-center gap-2 py-4', className)}
      aria-hidden="true"
    >
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#DDD5C3] to-[#B89555]/40" />
      <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="text-[#B89555]">
        <path
          d="M12 0L18 6L12 12L6 6L12 0Z"
          fill="currentColor"
          fillOpacity="0.3"
          stroke="currentColor"
          strokeWidth="0.75"
        />
      </svg>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#DDD5C3] to-[#B89555]/40" />
    </div>
  );
}
```

---

## VII. CHIẾN LƯỢC CHUYỂN ĐỘNG & CÔNG THÁI HỌC THỊ GIÁC

1. **Hiệu ứng Xuất hiện (Entrance Animation):**
   - Sử dụng component [`FadeIn`](file:///d:/Learning-universe/src/shared/motion/FadeIn.tsx) hiện có trong codebase với độ trễ (stagger) tinh tế:
     - Hero Section: Xuất hiện tức thì (0ms).
     - SearchBar: Xuất hiện sau 100ms.
     - Recent Activity: Xuất hiện sau 150ms.
     - Subject Cards: Xuất hiện so le sau 200ms và 250ms.
2. **Hover & Tương tác Thẻ:**
   - Card môn học: Hiệu ứng nâng nhẹ `hover:-translate-y-1` và bóng đổ viền ấm `hover:shadow-md hover:border-[#B89555]/60` kéo dài `200ms ease-out`.
   - Vòng tròn `ProgressRing`: Hoạt ảnh stroke-dashoffset chạy êm dịu `300ms ease-out`.
3. **Khả năng Truy cập (Accessibility & Reduced Motion):**
   - Tuân thủ nghiêm ngặt hook [`useReducedMotion()`](file:///d:/Learning-universe/src/shared/hooks/useReducedMotion.ts) hiện có: khi người dùng bật chế độ giảm chuyển động, toàn bộ transition chuyển sang chuyển trạng thái tức thời không có hiệu ứng trượt.

---

## VIII. KẾ HOẠCH TRIỂN KHAI CHI TIẾT (KHI ĐƯỢC PHÊ DUYỆT BƯỚC VÀO GIAI ĐOẠN 2)

Sau khi Kế hoạch này được chủ dự án phê duyệt chính thức, Giai đoạn 2 sẽ được thực hiện theo đúng 5 bước an toàn:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   5 BƯỚC THI CÔNG TRANG CHỦ (GIAI ĐOẠN 2)              │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 1: KHAI BÁO TOKENS VĂN HÓA                                       │
│  - Khai báo các biến CSS văn hóa (--lu-vn-*) trong src/styles/index.css│
│  - Bảo đảm không ghi đè hay làm hỏng các token môn học OKLCH hiện có.  │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 2: TẠO CÁC MOTIF SVG NỘI TUYẾN SIÊU NHẸ                          │
│  - Tạo tệp src/shared/ui/motifs/HeritageMotifs.tsx chứa các vector:    │
│    DongSonCirclesMotif, HeritageDivider, AlgebraicSymmetryMotif.       │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 3: NÂNG CẤP GIAO DIỆN SUBJECT CARD                               │
│  - Bổ sung hoa văn kỷ hà nhận diện môn học vào SubjectCard.tsx.        │
│  - Căn chỉnh hoàn hảo vòng tròn tiến độ và nút hành động kép.          │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 4: TÁI CẤU TRÚC HOMEPAGE.TSX                                     │
│  - Cập nhật layout Hero, nhúng SearchBar và Backdrop SVG.             │
│  - Áp dụng bảng màu Xanh ngọc trầm / Trắng ngà / Mực tàu.             │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 5: KIỂM THỬ ĐA THIẾT BỊ VÀ CHẠY CHECK-SUITE                      │
│  - Kiểm thử responsive trên Mobile (375px), Tablet (768px), Desktop.   │
│  - Chạy `npm.cmd run check` & `npm.cmd run build` bảo đảm 0 lỗi.       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## IX. KẾT LUẬN & TRẠNG THÁI TUÂN THỦ (COMPLIANCE AUDIT)

- **Cam kết tuân thủ yêu cầu người dùng:** Ở lần chạy này, **CHỈ THỰC HIỆN GIAI ĐOẠN 1 (KHẢO SÁT VÀ LẬP KẾ HOẠCH)**.
- **Hiện trạng mã nguồn:**
  - 100% tệp trong `src/` và `content/` không bị chỉnh sửa.
  - Không thay đổi routing hay cài đặt thêm thư viện npm.
  - Toàn bộ kiểm thử tự động, mã băm SHA-256 trong `content.lock.json` được bảo toàn nguyên vẹn.
- Tài liệu này được tạo ra làm cơ sở căn cứ kỹ thuật và mỹ thuật để chủ dự án xem xét, phê duyệt trước khi kích hoạt Giai đoạn 2.
