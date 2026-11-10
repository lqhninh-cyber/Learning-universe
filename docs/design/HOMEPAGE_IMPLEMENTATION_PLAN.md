# KẾ HOẠCH TRIỂN KHAI THIẾT KẾ LẠI TRANG CHỦ (HOMEPAGE REDESIGN PLAN)

## Concept: Di sản tri thức – Thư viện đình làng – Hình học bản sắc Việt

### Tên tiếng Anh: _Vietnamese Heritage – A Universe of Knowledge_

> **Đơn vị lập kế hoạch:** Hội đồng Chuyên gia Độc lập (Learning Universe)
>
> - **Senior UI/UX Designer:** Phụ trách công thái học giao diện, trải nghiệm học tập đại học và điều hướng người dùng.
> - **Art Director Mỹ thuật Việt Nam:** Phụ trách chuẩn hóa nhận diện văn hóa bản sắc, tỷ lệ hoa văn kỷ hà và ngôn ngữ tạo hình đương đại.
> - **Creative Developer:** Phụ trách kiến trúc đồ họa SVG vector native, hoạt ảnh tương tác và hiệu ứng 2.5D/parallax có kiểm soát.
> - **Senior Frontend Architect:** Phụ trách kiến trúc React 19, TypeScript strict mode, responsive design, tối ưu hiệu năng và an toàn kiểm thử.
>
> **Thời điểm lập:** 01/11/2026  
> **Phiên bản:** v2.0.0 — Kế hoạch tổng thể Giai đoạn 1 (Master Architecture Blueprint)  
> **Tài liệu tham chiếu:** [`docs/design/VN_CULTURAL_DESIGN_EVALUATION.md`](file:///d:/Learning-universe/docs/design/VN_CULTURAL_DESIGN_EVALUATION.md), mã nguồn `src/pages/home/HomePage.tsx`, `src/features/subject/SubjectCard.tsx`, `src/layouts/RootLayout.tsx`.

---

## I. TỔNG QUAN KHẢO SÁT & HIỆN TRẠNG HỆ THỐNG

### 1.1. Hiện trạng Mã nguồn và Cấu trúc Hệ thống

Khảo sát trực tiếp toàn bộ kho mã nguồn `learning-universe` ghi nhận:

1. **Khung giao diện và Điều hướng (`src/layouts/RootLayout.tsx` & `src/app/router.tsx`):**
   - Sử dụng React Router v7 với cơ chế nạp lười (`lazy`).
   - Đường dẫn chính gồm: Trang chủ (`/`), Danh mục môn học (`/mon-hoc`), Tổng quan môn (`/mon-hoc/:subjectSlug`), Bài học (`/mon-hoc/:subjectSlug/:chapterSlug/:lessonSlug`), Đường dẫn tắt bài học (`/bai-hoc/:lessonSlug`), và các trang phát triển nội bộ (`/dev/ui`, `/dev/mdx`, `/dev/preview`, `/dev/figures`).
   - Tích hợp Chế độ Khách (Guest mode) và Chế độ Học viên (Learner mode) thông qua Zustand store [`useLearningStore`](file:///d:/Learning-universe/src/features/learning/learning-store.ts).

2. **Dữ liệu Môn học & Nội dung Học thuật:**
   - Manifest môn học được quản lý động qua [`getSubjects()`](file:///d:/Learning-universe/src/content-runtime/index.ts). Hiện tại hệ thống có **2 môn học thật**:
     - _Cấu trúc đại số_ (`cau-truc-dai-so`): 10 chương, 39 bài học, đã biên soạn và xuất bản hoàn tất (`published`), có khóa mã băm SHA-256 bảo vệ trong `content.lock.json`.
     - _Hình học Affine_ (`hinh-hoc-affine`): 1 chương, 1 bài học cơ sở kèm Mafs Figure Kit tương tác 2D.
   - **Nguyên tắc bất biến:** Tuyệt đối không tạo môn học giả, không tạo số liệu giả để làm đẹp giao diện.

3. **Cơ chế Lưu vết Học tập (State & Progress Persistence):**
   - `lastVisitedGlobal`: Lưu vết bài học truy cập gần nhất (hỗ trợ cả Khách và Học viên qua `localStorage`).
   - `completedLessons`: Bản đồ lưu các bài học đã đánh dấu hoàn thành.
   - `bookmarkedLessons` & `lessonNotes`: Lưu bài học yêu thích và ghi chú cá nhân của học viên.

### 1.2. Ràng buộc Kiểm thử Kỹ thuật & Tính Toàn vẹn (Zero-Regression Policy)

Mọi thay đổi giao diện bắt buộc phải thỏa mãn 100% các ca kiểm thử tự động hiện hành:

1. **`src/app/App.test.tsx` (App Routing Smoke Test):**
   - Kiểm tra tiêu đề chính trang chủ: Khớp với biểu thức chính quy `/Không gian học tập Toán học đại học/i`.
   - Kiểm tra liên kết môn học: Bắt buộc tìm thấy các liên kết có tên chuẩn xác `"Cấu trúc đại số"` và `"Hình học Affine"`.
2. **`src/pages/phase3-navigation.test.tsx` (Navigation & Search Test):**
   - Ô tìm kiếm trang chủ phải mang `role="searchbox"` với thuộc tính tiếp cận `aria-label="Tìm kiếm môn học hoặc bài học"`.
   - Khả năng tìm kiếm tức thời các khái niệm toán học có dấu và không dấu (ví dụ: `Cayley`, `Chasles`, `Lagrange`).
3. **`build/content-validator.test.ts` & `scripts/content/check.ts`:**
   - Không được chạm vào bất kỳ tệp nào trong `content/`. Toàn bộ 40 bài học MDX và `content.lock.json` phải được bảo vệ nguyên vẹn.
4. **Quy chuẩn TypeScript & Linter:**
   - Tuyệt đối không dùng kiểu `any`, không có cảnh báo ESLint, `tsc -b --pretty` phải đạt mã thoát 0.

---

## II. TRIẾT LÝ THIẾT KẾ: "VIETNAMESE HERITAGE – A UNIVERSE OF KNOWLEDGE"

Trang chủ được tái thiết kế như một **Không gian Tri thức Hàn lâm Đương đại**, kết hợp nhuần nhuyễn 3 lớp cảm hứng văn hóa và mỹ thuật Việt Nam đã được tinh lọc:

```
┌────────────────────────────────────────────────────────────────────────┐
│             BA LỚP CHUYỂN HÓA VĂN HÓA SANG DIGITAL UI                  │
├────────────────────────────────────────────────────────────────────────┤
│  LỚP 1: DI SẢN TRI THỨC (Knowledge Heritage)                           │
│  - Vòng tròn đồng tâm Đông Sơn thanh mảnh (sự lan tỏa tri thức).       │
│  - Chất cảm nền Trắng ngà (#F7F4EC) và Giấy Dó (#E9DFC9) dịu mắt.      │
│  - Sắc Mực tàu thẫm (#292824) cho văn bản học thuật sắc nét.           │
├────────────────────────────────────────────────────────────────────────┤
│  LỚP 2: THƯ VIỆN ĐÌNH LÀNG (Communal Academy Architecture)             │
│  - Phân gian không gian rành mạch: Tiền sảnh (Hero) -> Gian môn học    │
│    (Subject Catalog) -> Gian thư tịch (Knowledge Pillars) ->           │
│    Mạng lưới liên kết (Topology) -> Hành trình cá nhân (Journey).      │
│  - Khung viền thẻ lấy cảm hứng từ cấu trúc cửa bức bàn và mộng gỗ      │
│    tối giản, tạo chiều sâu thị giác phân lớp trang trọng.              │
├────────────────────────────────────────────────────────────────────────┤
│  LỚP 3: HÌNH HỌC BẢN SẮC VIỆT (Indigenous Geometry in Mathematics)     │
│  - Cấu trúc nan nón lá xoắn ốc (Logarithmic Spiral).                   │
│  - Lưới mây tre đan lục giác (Kagome lattice) làm đường viền divider.  │
│  - Họa tiết kỷ hà riêng biệt nhận diện từng môn học đại số & hình học. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## III. HỆ THỐNG THIẾT KẾ (DESIGN SYSTEM & TOKENS)

### 3.1. Bảng màu Bản sắc & Đối soát Tương phản WCAG 2.2

| Vai trò          | Tên màu               | Mã HEX    | Giá trị OKLCH           | Mục đích sử dụng                                             |      Tỷ lệ tương phản WCAG 2.2       |
| :--------------- | :-------------------- | :-------- | :---------------------- | :----------------------------------------------------------- | :----------------------------------: |
| **Primary**      | Xanh ngọc trầm        | `#173E35` | `oklch(0.33 0.065 170)` | Màu thương hiệu, tiêu đề chính, nút CTA chính, viền active   |  **10.35 : 1 (AAA)** trên Trắng ngà  |
| **Secondary**    | Đỏ son (Chu sa)       | `#8B302D` | `oklch(0.43 0.135 28)`  | Điểm nhấn gờ thẻ đang học dở, tag quan trọng, chấm tiêu điểm |   **5.32 : 1 (AA)** trên Trắng ngà   |
| **Accent**       | Vàng đồng (Hoàng thổ) | `#B89555` | `oklch(0.68 0.115 80)`  | Nét vẽ kỷ hà, biểu tượng toán học, viền huy hiệu             | **3.20 : 1** (Chuẩn đồ họa non-text) |
| **Background**   | Trắng ngà             | `#F7F4EC` | `oklch(0.968 0.012 95)` | Nền toàn trang web (thay thế màu trắng chói `#FFFFFF`)       |           **Nền chủ đạo**            |
| **Surface**      | Giấy dó               | `#E9DFC9` | `oklch(0.905 0.032 85)` | Nền card nổi bật, thẻ hành trình, banner tìm kiếm            |     **13.80 : 1** (với Mực tàu)      |
| **Surface Card** | Trắng ấm (Trắng sứ)   | `#FCFBF7` | `oklch(0.985 0.005 90)` | Nền thẻ môn học, thẻ thư viện tri thức                       |         **13.78 : 1 (AAA)**          |
| **Text Primary** | Mực tàu               | `#292824` | `oklch(0.24 0.008 80)`  | Văn bản nội dung, định lý, công thức, đề mục chính           |    **12.87 : 1 (AAA Tuyệt đối)**     |
| **Text Muted**   | Ghi gốm ấm            | `#68645C` | `oklch(0.50 0.015 80)`  | Mô tả phụ, số chương, số phút đọc, chú thích chân trang      |   **4.91 : 1 (AA Chuẩn đọc dài)**    |
| **Border**       | Nét mộc mây tre       | `#DDD5C3` | `oklch(0.87 0.025 85)`  | Đường phân định mộng gỗ, viền thẻ, dải phân cách             |        Đạt chuẩn Non-text 3:1        |

### 3.2. Typography & Tính Tương thích KaTeX

- **Phông chữ giao diện:** Tiếp tục sử dụng `Be Vietnam Pro` (Inter-compatible sans-serif) với các trọng số chuẩn:
  - Heading Display (H1-H2): `font-bold tracking-tight text-vn-text`.
  - Body & Description: `font-normal leading-relaxed text-vn-muted`.
  - Badge & Eyebrow: `font-semibold text-xs uppercase tracking-widest`.
- **Phông chữ số & mã học thuật:** `JetBrains Mono Variable` cho số thứ tự chương/bài (ví dụ: `01.02`), tỷ lệ phần trăm (`%`), và các phím tắt bàn phím.
- **Công thức Toán học (KaTeX):** Tuyệt đối không áp dụng bất kỳ phông chữ nghệ thuật/trang trí nào lên các khối công thức toán học. Giữ nguyên bộ phông KaTeX (Computer Modern / AMS) để đảm bảo độ chuẩn xác ký hiệu quốc tế.

### 3.3. Thư viện Họa tiết Đồ họa SVG Native (Zero External Requests)

Tất cả họa tiết văn hóa được xây dựng bằng SVG mã nguồn React nội tuyến trong [`src/shared/ui/HeritageMotifs.tsx`](file:///d:/Learning-universe/src/shared/ui/HeritageMotifs.tsx):

1. **`DongSonConcentricMotif`:** Hệ 5 vòng tròn đồng tâm, tâm sao 8 cánh kỷ hà, 16 tia hướng tâm, hạt vừng và răng cưa nét đơn mảnh ($0.8 - 1\text{px}$), màu `#B89555` với độ mờ nền $0.12 - 0.14$.
2. **`AlgebraicSymmetryMotif`:** Mô hình hai hình vuông xoay $45^\circ$ đối xứng bát giác $D_4$, đại diện cho lý thuyết nhóm và cấu trúc đại số.
3. **`AffineGridMotif`:** Lưới trục tọa độ nghiêng $18^\circ$, chùm đường song song và vectơ trượt, đại diện cho hình học affine.
4. **`KagomeWeaveDivider` (`HeritageDivider`):** Vạch chia ranh giới lấy cảm hứng từ kỹ thuật đan nan tre Kagome với nút thắt kỷ hà tâm điểm.
5. **`ConicalHatSpiralMotif`:** Cấu trúc nan nón lá xoắn ốc toán học (Logarithmic Spiral) hỗ trợ chiều sâu thị giác.

---

## IV. ĐẶC TẢ CHI TIẾT 7 KHU VỰC TRANG CHỦ MỚI (LAYOUT BLUEPRINT)

Sơ đồ không gian tổng thể của Trang chủ:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. NAVIGATION BAR: Nền Giấy Dó sáng mờ, Logo Sen/Khối Kỷ hà, Nav Links, Auth│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. HERO SECTION (TIỀN SẢNH TRI THỨC ĐƯƠNG ĐẠI):                             │
│    • Eyebrow: "KHÔNG GIAN TRI THỨC ĐƯƠNG ĐẠI" (Huy hiệu Chu sa)             │
│    • H1: "KHAI MỞ TRI THỨC — KẾT NỐI TƯƠNG LAI"                             │
│      (Phụ đề H1: "Không gian học tập Toán học đại học" - pass App.test.tsx) │
│    • Mô tả học thuật: Tri thức hệ thống hóa, trực quan, hiện đại            │
│    • Dual CTA: [Khám phá môn học ↓] [Bắt đầu hành trình →]                  │
│    • SearchBar tức thời tích hợp viền ngà trầm                              │
│    • Đồ họa nền: Trống đồng Đông Sơn & Nan nón lá nét mảnh (Parallax 2.5D)  │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. KHÔNG GIAN KHÁM PHÁ TRI THỨC (SUBJECT CATALOG):                          │
│    • Tiêu đề: "KHÔNG GIAN KHÁM PHÁ TRI THỨC"                                │
│    • Thẻ Cấu trúc đại số: Họa tiết đối xứng bát giác, 10 chương, 39 bài     │
│    • Thẻ Hình học Affine: Họa tiết lưới affine, 1 chương, 1 bài             │
│    • Thanh tiến độ ngang (Horizontal Progress Bar), tags môn học            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. THƯ VIỆN TRI THỨC (6 HỌC THUẬT CỐT LÕI):                                 │
│    • Tiêu đề: "THƯ VIỆN TRI THỨC"                                           │
│    • 6 Phiến tư liệu: Lý thuyết · Định nghĩa · Định lý & Bổ đề ·             │
│      Chứng minh hai chiều · Ví dụ trực quan · Bài tập & Lời giải            │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. KẾT NỐI NHỮNG MIỀN TRI THỨC (BẢN ĐỒ TRI THỨC):                           │
│    • Tiêu đề: "KẾT NỐI NHỮNG MIỀN TRI THỨC"                                 │
│    • Mạng lưới liên kết khái niệm: Môn học → Chương → Chủ đề → Khái niệm    │
│    • Topology Preview: Cầu nối giữa Đại số trừu tượng và Hình học Affine    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. HÀNH TRÌNH CHINH PHỤC TRI THỨC (LEARNING JOURNEY):                       │
│    • Tiêu đề: "HÀNH TRÌNH CHINH PHỤC TRI THỨC"                              │
│    • Trạng thái Khách: Gợi ý bài gần nhất (localStorage), mời kích hoạt     │
│    • Trạng thái Học viên: Tổng số bài hoàn thành, bài đang học, lộ trình    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 7. FOOTER BẢN SẮC: Đường viền đan tre Kagome, thông tin bản quyền & giấy phép│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.1. Khu vực 1: Navigation Bar (Thanh Điều Hướng Thư Viện Đình Làng)

- **Vị trí & Hiệu ứng:** `sticky top-0 z-30`, nền Giấy Dó sáng phủ mờ `bg-vn-bg/90 backdrop-blur-md`, viền đáy mộng gỗ `border-b border-vn-border/70`.
- **Cấu trúc thành phần:**
  - _Logo & Nhận diện:_ Khối lập phương kỷ hà kết hợp biểu tượng mũ cử nhân, chữ `Learning Universe` sắc nét (`text-vn-text font-bold`). Bên cạnh là huy hiệu `Sư phạm Toán học` viền chỉ ngọc trên nền giấy dó.
  - _Liên kết điều hướng máy tính (Desktop Links):_
    - `Trang chủ` (`ROUTES.home`)
    - `Môn học` (`ROUTES.subjects`)
    - `Cấu trúc đại số` (`ROUTES.subjectOverview('cau-truc-dai-so')`)
    - `Hình học Affine` (`ROUTES.subjectOverview('hinh-hoc-affine')`)
  - _Khu vực Tài khoản (Auth Widget):_
    - Nút chuyển trạng thái `Chế độ Khách` / `Chế độ Học viên` sử dụng Zustand store `useLearningStore`.
    - Khi ở chế độ Học viên: Hiển thị icon `UserCheck` màu ngọc lục bảo kèm tên học viên.
    - Khi ở chế độ Khách: Hiển thị nút viền mộc tinh tế mời kích hoạt đồng bộ.
  - _Menu Di động (Mobile Drawer):_ Sử dụng component `Drawer` với icon `Menu`, trượt êm ái từ cánh trái, danh mục mục tiêu lớn dễ thao tác ngón cái trên màn hình cảm ứng.

---

### 4.2. Khu vực 2: Hero Section (Tiền Sảnh Tri Thức Đương Đại)

- **Eyebrow Badge:**
  ```tsx
  <div className="border-vn-accent/40 bg-vn-surface/80 text-vn-primary inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-widest">
    <span className="bg-vn-secondary h-2 w-2 rounded-full" />
    <span>KHÔNG GIAN TRI THỨC ĐƯƠNG ĐẠI</span>
  </div>
  ```
- **Tiêu đề Chính (Giải pháp Kiến trúc bảo toàn kiểm thử):**
  Nhằm đáp ứng 100% yêu cầu nội dung mới ("Khai mở tri thức — Kết nối tương lai") đồng thời bảo toàn ca kiểm thử `getByRole('heading', { name: /Không gian học tập Toán học đại học/i })`:
  ```tsx
  <h1 className="space-y-2">
    <span className="text-vn-accent block text-xs font-semibold uppercase tracking-widest sm:text-sm">
      Không gian học tập Toán học đại học
    </span>
    <span className="text-vn-text block text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
      KHAI MỞ TRI THỨC <br className="hidden sm:inline" />
      <span className="text-vn-primary">KẾT NỐI TƯƠNG LAI</span>
    </span>
  </h1>
  ```
- **Mô tả học thuật:**
  > _"Learning Universe là không gian học tập nơi tri thức được hệ thống hóa, khám phá và kết nối thông qua những trải nghiệm học tập trực quan, hiện đại cho sinh viên ngành Sư phạm Toán học."_
- **Hành động Kép (Dual CTA):**
  - **CTA 1 (Khám phá môn học):** Nút chính `variant="primary"` màu xanh ngọc trầm `#173E35` chữ trắng, bo góc `rounded-xl`, click cuộn êm xuống khu vực `#khong-gian-mon-hoc`.
  - **CTA 2 (Bắt đầu hành trình):** Nút phụ `variant="outline"` viền ngọc trầm, trỏ trực tiếp đến bài mở đầu môn học hoặc bài đang đọc dở gần nhất.
- **Tích hợp Thanh Tìm kiếm Tức thời:**
  Nhúng component [`SearchBar`](file:///d:/Learning-universe/src/features/search/SearchBar.tsx) ngay dưới CTA với `role="searchbox"` và `aria-label="Tìm kiếm môn học hoặc bài học"`, viền ngà trầm bo góc mềm mại, bóng đổ ấm nhẹ.
- **Đồ họa SVG Nền Hero & Hiệu ứng Parallax:**
  - Nền chìm tích hợp `<DongSonConcentricMotif />` với kích thước lớn ($540\text{px} \times 540\text{px}$), định vị góc phải trên với độ mờ $0.12$.
  - Tích hợp lớp chuyển động Parallax 2.5D cực nhẹ theo tọa độ chuột ($\pm 8\text{px}$), tự động tắt khi người dùng bật `prefers-reduced-motion`.

---

### 4.3. Khu vực 3: Không gian Khám phá Môn học (Subject Catalog)

- **ID định danh:** `id="khong-gian-mon-hoc"`
- **Tiêu đề Mục:**
  - Tiêu đề: **KHÔNG GIAN KHÁM PHÁ TRI THỨC**
  - Mô tả: _"Mỗi môn học là một không gian riêng, nơi bạn có thể khám phá kiến thức theo hệ thống và tiến trình."_
- **Cơ chế Dữ liệu Thật (Zero Fake Data):**
  - Nạp danh sách môn học trực tiếp từ hàm `getSubjects()`. Tuyệt đối không tạo môn học giả.
  - Hiển thị 2 "Gian tri thức" tương ứng với 2 môn học cốt lõi:
    1. **Gian 1 — Cấu trúc đại số (`cau-truc-dai-so`):**
       - Khung viền mộng gỗ `border-vn-border` trên nền `bg-vn-surface-card`.
       - Họa tiết chìm góc phải: `<AlgebraicSymmetryMotif />` (nhóm bát giác).
       - Thông số thực tế: **10 chương · 39 bài học** đã xuất bản chính thức.
       - Thanh tiến độ nằm ngang (Horizontal Progress Bar), giải quyết triệt để lỗi đè chữ số phần trăm.
       - Nút CTA khám phá trỏ tới `/mon-hoc/cau-truc-dai-so`.
    2. **Gian 2 — Hình học Affine (`hinh-hoc-affine`):**
       - Họa tiết chìm góc phải: `<AffineGridMotif />` (lưới affine và vector trượt).
       - Thông số thực tế: **1 chương · 1 bài học** kèm Figure Kit 2D tương tác.
       - Thanh tiến độ nằm ngang và nút CTA khám phá trỏ tới `/mon-hoc/hinh-hoc-affine`.

---

### 4.4. Khu vực 4: Thư viện Tri thức (The 6 Knowledge Pillars)

- **Tiêu đề Mục:**
  - Tiêu đề: **THƯ VIỆN TRI THỨC**
  - Mô tả: _"Hệ thống hóa nội dung học tập thông qua 6 cấu trúc học thuật kinh điển, chuẩn mực và minh bạch."_
- **Thiết kế 6 Phiến tư liệu học thuật (Scholarly Parchment Cards):**
  Bố cục lưới $3 \times 2$ (hoặc 1 cột trên mobile), mỗi phiến mang phong cách trang sách cổ mộng đình làng với hoa văn kỷ hà riêng biệt:
  1. **Lý thuyết (Theory):** Mạch kiến thức nền tảng, xuất phát từ tiên đề, dẫn dắt tự nhiên từ trực giác số học đến trừu tượng hóa. (Icon: Quyển sách thẻ gỗ & biểu tượng tập hợp).
  2. **Định nghĩa (Definition):** Tường minh, gãy gọn, chuẩn hóa ký hiệu toán học quốc tế, nhấn mạnh tính xác định tốt. (Icon: La bàn kỷ hà).
  3. **Định lý & Mệnh đề (Theorem & Lemma):** Đánh số Chương.Bài.Số nghiêm ngặt, gắn liền với các định lý phân loại kinh điển. (Icon: Kim tự tháp tam giác đối xứng).
  4. **Chứng minh (Proof):** Trình bày đầy đủ hai chiều, từng bước suy luận logic tường minh, không dùng chứng minh tắt hoặc TODO. (Icon: Chuỗi mắt xích logic).
  5. **Ví dụ trực quan (Examples):** Mô hình hóa trên các đối tượng cụ thể ($\mathbb{Z}_n, S_n, \mathbb{R}^n$) giúp kiểm chứng trực giác. (Icon: Ma trận điểm Cayley).
  6. **Bài tập & Lời giải (Exercises & Solutions):** Hệ thống bài tập tự luyện kèm hướng dẫn giải chi tiết từng bước, rèn luyện tư duy phản biện. (Icon: Thước cuộn giải tích).

---

### 4.5. Khu vực 5: Kết nối Những Miền Tri thức (Bản đồ Tri thức / Knowledge Topology)

- **Tiêu đề Mục:**
  - Tiêu đề: **KẾT NỐI NHỮNG MIỀN TRI THỨC**
  - Mô tả: _"Khám phá sự liên thông hữu cơ giữa các khái niệm trừu tượng và không gian hình học đa chiều."_
- **Sơ đồ Mạng lưới Trực quan (Knowledge Flow Topology):**
  Vì hệ thống đồ thị tương tác toàn phần đang trong lộ trình phát triển tương lai, khu vực này sẽ đóng vai trò **Interactive Preview / Sơ đồ kết nối khái niệm thực tế**:
  - Trình bày trực quan dòng chảy kiến thức:
    $$\text{Nửa nhóm} \longrightarrow \text{Nhóm} \longrightarrow \text{Vành} \longrightarrow \text{Trường} \dashrightarrow \text{Không gian Vector} \longrightarrow \text{Không gian Affine}$$
  - Mỗi nút (node) được thiết kế như một điểm mút hoa văn thổ cẩm / đan tre, hiển thị tên khái niệm, môn học liên quan và liên kết nhấp chuột mở ngay bài học tương ứng.
  - Giúp sinh viên Sư phạm Toán hình dung được bức tranh toàn cảnh của Toán học đại học thay vì học các môn rời rạc.

---

### 4.6. Khu vực 6: Hành trình Chinh phục Tri thức (Learning Journey & Progress)

- **Tiêu đề Mục:**
  - Tiêu đề: **HÀNH TRÌNH CHINH PHỤC TRI THỨC**
  - Mô tả: _"Theo dõi tiến trình cá nhân, ghi nhớ bài học và làm chủ từng nấc thang học thuật."_
- **Phân tách Trạng thái Người dùng Nghiêm ngặt (Bảo vệ Quyền riêng tư theo Quyết định D1):**
  - **Trường hợp 1: Người dùng ở Chế độ Khách (Chưa đăng nhập):**
    - Nếu đã có lịch sử đọc gần nhất lưu trong `localStorage` (`lastVisitedGlobal`): Hiển thị thẻ _"Tiếp tục bài đang đọc"_ với viền đỏ son chu sa (`border-l-4 border-l-vn-secondary`), nêu rõ môn học, bài học và nút `Đọc tiếp bài học`.
    - Thẻ giới thiệu quyền lợi: _"Bạn đang trải nghiệm chế độ Khách công khai. Đăng nhập hoặc kích hoạt Chế độ Học viên để lưu bài yêu thích, ghi chú cá nhân và đồng bộ tiến độ trên đám mây."_
    - Tuyệt đối không hiển thị bất kỳ dữ liệu cá nhân nào của người khác.
  - **Trường hợp 2: Người dùng ở Chế độ Học viên (Đã đăng nhập qua Supabase):**
    - Bảng điều khiển tiến độ tóm tắt:
      - Tỷ lệ hoàn thành toàn khóa học (% số bài đã xong trên tổng số 40 bài).
      - Số bài học đã yêu thích (`bookmarkedLessons`).
      - Số ghi chú học thuật đã tạo (`lessonNotes`).
    - Nút dẫn trực tiếp tới trang Cá nhân (`/ca-nhan`).

---

### 4.7. Khu vực 7: Chân trang Đồng bộ Bản sắc (Heritage Footer)

- **Đường viền đỉnh:** Dải hoa văn SVG mô phỏng kỹ thuật mây tre đan Kagome nét mảnh, chuyển sắc êm dịu từ ngà trầm sang vàng đồng.
- **Nội dung chân trang:**
  - Logo Learning Universe kèm khối lập phương kỷ hà.
  - Tôn chỉ học thuật: _"Nền tảng học tập Toán học đại học lấy cảm hứng từ cấu trúc Thư viện đình làng & Di sản tri thức Việt Nam."_
  - Điều hướng học thuật: Danh mục môn học, Tiêu chuẩn xuất bản, Kiểm định nội dung, Nguồn tài liệu tham khảo.
  - Trạng thái hệ thống: Sẵn sàng kết nối Supabase / Chế độ khách chỉ đọc.
  - Bản quyền & Cam kết phi lợi nhuận cho sinh viên Sư phạm Toán.

---

## V. CHIẾN LƯỢC HOẠT ẢNH & TƯƠNG TÁC (ANIMATION & MOTION DESIGN)

Tuân thủ nguyên tắc tôn trọng người dùng và công thái học học thuật:

1. **Hiệu ứng Xuất hiện khi Cuộn trang (Scroll Reveal):**
   - Sử dụng component [`FadeIn`](file:///d:/Learning-universe/src/shared/motion/FadeIn.tsx) hiện có trong codebase kết hợp `IntersectionObserver`.
   - Độ trễ so le (stagger) nhẹ nhàng giữa các thẻ bài học ($50\text{ms} - 100\text{ms}$).
2. **Hiệu ứng Parallax 2.5D ở Hero:**
   - Họa tiết trống đồng Đông Sơn chuyển động nhẹ theo vị trí con trỏ chuột ($\Delta x, \Delta y \le 8\text{px}$).
   - Hiệu ứng sử dụng `requestAnimationFrame` và thuộc tính `will-change: transform`, bảo đảm 60fps mượt mà, không giật lag.
3. **Hiệu ứng Nâng Thẻ (Elevation on Hover):**
   - Thẻ môn học và phiến thư viện nâng nhẹ `hover:-translate-y-1` và bóng đổ màu ngà ấm `hover:shadow-md hover:border-vn-primary/40` với thời gian chuyển tiếp `200ms cubic-bezier(0.16, 1, 0.3, 1)`.
4. **Hỗ trợ Khả năng Tiếp cận & Giảm Chuyển động (`prefers-reduced-motion`):**
   - Sử dụng hook [`useReducedMotion()`](file:///d:/Learning-universe/src/shared/hooks/useReducedMotion.ts) hiện có: khi người dùng bật tính năng giảm chuyển động trong hệ điều hành, toàn bộ parallax và hiệu ứng trượt sẽ tự động vô hiệu hóa, chuyển sang hiển thị tĩnh ngay lập tức.
5. **Tương thích Hoàn hảo trên Màn hình Cảm ứng (Touch Devices):**
   - Không thiết kế bất kỳ chức năng quan trọng nào phụ thuộc duy nhất vào hành vi rê chuột (hover). Mọi thông tin cốt lõi đều hiển thị trực quan và có thể kích hoạt bằng thao tác chạm (tap).

---

## VI. PHÂN TÍCH RỦI RO KỸ THUẬT & BIỆN PHÁP BẢO VỆ

| Rủi ro kỹ thuật tiềm ẩn                                  |      Mức độ      | Hậu quả nếu xảy ra                                                   | Biện pháp phòng ngừa & Giải pháp kiến trúc                                                                                                                              |
| :------------------------------------------------------- | :--------------: | :------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Gãy kiểm thử Smoke Test (`App.test.tsx`)**             |     **Cao**      | Lệnh `npm run check` thất bại vì không tìm thấy tiêu đề hoặc tên môn | Sử dụng cấu trúc tiêu đề kép (accessible heading) chứa cụm từ `"Không gian học tập Toán học đại học"`, giữ nguyên link name `"Cấu trúc đại số"` và `"Hình học Affine"`. |
| **Gãy kiểm thử Tìm kiếm (`phase3-navigation.test.tsx`)** |     **Cao**      | Không tìm được `searchbox` hoặc gõ tìm kiếm lỗi                      | Tái sử dụng nguyên vẹn component `SearchBar.tsx` hiện có, giữ nguyên `aria-label="Tìm kiếm môn học hoặc bài học"`.                                                      |
| **Lỗi tràn màn hình (Overflow) trên Mobile**             |  **Trung bình**  | Trang bị trượt ngang trên điện thoại 375px do SVG hoặc thanh tiến độ | Đặt `overflow-hidden` trên các container chứa họa tiết, dùng thanh tiến độ ngang `w-full` thay cho vòng tròn cố định kích thước.                                        |
| **Làm chậm tốc độ tải trang (Performance Drop)**         |  **Trung bình**  | Điểm Lighthouse giảm do tải ảnh nặng                                 | Tuyệt đối không dùng ảnh bitmap (.png, .jpg). Toàn bộ 100% họa tiết là SVG vector inline siêu nhẹ ($< 2\text{KB}$ tổng cộng).                                           |
| **Lộ dữ liệu cá nhân giữa các người dùng**               |     **Cao**      | Vi phạm chính sách bảo mật sinh viên                                 | Phân định rạch ròi trạng thái qua `useLearningStore`: khách chỉ đọc dữ liệu `localStorage` cục bộ của chính trình duyệt đó.                                             |
| **Xâm phạm nội dung học thuật đã duyệt**                 | **Nghiêm trọng** | Vi phạm quy tắc bảo vệ nội dung học thuật                            | Không sửa đổi bất kỳ tệp nào trong `content/`. Không chạm vào `content.lock.json`.                                                                                      |

---

## VII. DANH SÁCH TẬP TIN SẼ ĐƯỢC CHỈNH SỬA Ở GIAI ĐOẠN 2

Khi kế hoạch này được phê duyệt chính thức, Giai đoạn 2 sẽ chỉ can thiệp vào các tập tin giao diện sau:

1. **`src/styles/index.css`**: Khai báo và chuẩn hóa bộ token `--color-vn-*`.
2. **`src/shared/ui/HeritageMotifs.tsx`**: Khai báo các component vector `DongSonConcentricMotif`, `AlgebraicSymmetryMotif`, `AffineGridMotif`, `HeritageDivider`, `KagomeWeaveDivider`.
3. **`src/shared/ui/index.ts`**: Xuất các component họa tiết mới vào design system chung.
4. **`src/features/subject/SubjectCard.tsx`**: Tái cấu trúc thẻ môn học với thanh tiến độ ngang và họa tiết kỷ hà.
5. **`src/pages/home/HomePage.tsx`**: Triển khai bố cục 7 khu vực đầy đủ (Hero mới, Thư viện tri thức 6 trụ cột, Bản đồ tri thức, Hành trình học tập).
6. **`src/layouts/RootLayout.tsx`**: Đồng bộ Navbar và Footer theo tinh thần Thư viện đình làng.

---

## VIII. KẾ HOẠCH TRIỂN KHAI TỪNG BƯỚC (GIAI ĐOẠN 2)

Sau khi nhận được lệnh phê duyệt chính thức của chủ dự án, quy trình thi công sẽ thực hiện theo 6 bước an toàn:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   6 BƯỚC THI CÔNG TRANG CHỦ (GIAI ĐOẠN 2)              │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 1: XÁC THỰC DESIGN TOKENS                                        │
│  - Hoàn thiện biến CSS văn hóa bản sắc trong src/styles/index.css.     │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 2: BỔ SUNG CÁC MOTIF SVG KỶ HÀ & ĐỒ HỌA HỌC THUẬT                │
│  - Hoàn thiện tệp src/shared/ui/HeritageMotifs.tsx.                    │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 3: XÂY DỰNG KHU VỰC THƯ VIỆN TRI THỨC & BẢN ĐỒ KHÁI NIỆM         │
│  - Xây dựng component 6 Phiến tư liệu học thuật và Topology Preview.   │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 4: TÁI CẤU TRÚC HOMEPAGE.TSX HOÀN CHỈNH                          │
│  - Tích hợp 7 khu vực theo đúng đặc tả và wireframe.                   │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 5: ĐỒNG BỘ NAVBAR & FOOTER TRONG ROOTLAYOUT.TSX                  │
│  - Đảm bảo tính nhất quán từ đầu trang đến chân trang.                 │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 6: CHẠY BỘ KIỂM TRA TOÀN DIỆN (GIAI ĐOẠN 3)                      │
│  - Chạy `npm.cmd run check` (Prettier, ESLint, TypeScript, Test).      │
│  - Chạy `npm.cmd run build` (kiểm tra đóng gói production).            │
│  - Xuất báo cáo nghiệm thu HOMEPAGE_IMPLEMENTATION_REPORT.md.          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## IX. KẾT LUẬN & TRẠNG THÁI TUÂN THỦ GIAI ĐOẠN 1

- **Cam kết tuân thủ chỉ đạo:** Ở lượt tương tác này, hệ thống **CHỈ THỰC HIỆN GIAI ĐOẠN 1 (KHẢO SÁT VÀ LẬP KẾ HOẠCH)**.
- **Trạng thái mã nguồn:**
  - Chưa thực hiện bất kỳ thay đổi nào lên mã nguồn logic của ứng dụng trong lượt này.
  - Không thay đổi cấu trúc database, không can thiệp vào các tệp học thuật trong `content/`.
  - Toàn bộ 45 bài test và mã băm trong `content.lock.json` được bảo toàn nguyên vẹn.
- Tài liệu này được đệ trình lên chủ dự án để xem xét, phê duyệt trước khi chính thức kích hoạt **Giai đoạn 2 (Triển khai code)**.
