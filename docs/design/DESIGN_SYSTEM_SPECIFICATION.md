# TÀI LIỆU ĐẶC TẢ HỆ THỐNG THIẾT KẾ DÙNG CHUNG (DESIGN SYSTEM SPECIFICATION)

## LEARNING UNIVERSE – VIETNAMESE HERITAGE DESIGN SYSTEM

### Bản sắc Di sản Việt Nam Đương đại · Chuẩn mực Hàn lâm · Mở rộng Đa Môn học

> **Nhóm chuyên gia biên soạn:**
>
> - **Senior Design System Architect:** Kiến trúc phân tầng tokens, module hóa components và chiến lược tương thích ngược.
> - **Senior UI/UX Designer Giáo dục:** Công thái học đọc tài liệu, nhịp điệu thị giác và trải nghiệm học tập đại học lâu dài.
> - **Senior Frontend Engineer (React & TypeScript):** Kiến trúc type-safe với `tailwind-variants`, tối ưu bundle size và zero-regression.
> - **Accessibility Specialist:** Tiêu chuẩn WCAG 2.2 AAA/AA, điều hướng bàn phím, tương phản ánh sáng và `prefers-reduced-motion`.
> - **Academic Interface Designer:** Phân cấp ký hiệu toán học, tương thích KaTeX, Mafs Figure Kit và cấu trúc chứng minh hai chiều.
>
> **Thời điểm lập:** Tháng 11/2026  
> **Phiên bản:** v1.0.0 — Bước 1: Kiểm kê hiện trạng & Thiết kế hệ thống toàn diện  
> **Tài liệu tham chiếu:** [`HOMEPAGE_IMPLEMENTATION_PLAN.md`](file:///d:/Learning-universe/docs/design/HOMEPAGE_IMPLEMENTATION_PLAN.md), [`HOMEPAGE_QA_REPORT.md`](file:///d:/Learning-universe/docs/design/HOMEPAGE_QA_REPORT.md), [`VN_CULTURAL_DESIGN_EVALUATION.md`](file:///d:/Learning-universe/docs/design/VN_CULTURAL_DESIGN_EVALUATION.md).

---

## I. ĐÁNH GIÁ HIỆN TRẠNG DESIGN SYSTEM CỦA DỰ ÁN

### 1.1. Hiện trạng Kiến trúc Giao diện

Khảo sát trực tiếp toàn bộ kho mã nguồn `learning-universe` ghi nhận:

1. **Hệ thống CSS & Framework:**
   - Dự án sử dụng **Tailwind CSS v4** (`@import 'tailwindcss'`) với cấu hình `@theme` nội tuyến trong [`src/styles/index.css`](file:///d:/Learning-universe/src/styles/index.css).
   - Đã tích hợp phông chữ `@fontsource/be-vietnam-pro` (trọng số 400, 500, 600, 700) và `@fontsource-variable/jetbrains-mono`.
   - Hiển thị công thức toán qua KaTeX (`katex/dist/katex.min.css`) và hình học tương tác 2D qua Mafs SVG.

2. **Cơ chế Màu nhận diện Môn học (Subject Theming):**
   - Đã xây dựng hoàn chỉnh cơ chế OKLCH động trong [`src/styles/subject-themes.css`](file:///d:/Learning-universe/src/styles/subject-themes.css) qua thuộc tính `data-subject="..."`.
   - Cung cấp dải token cố định từ `--subject-50` đến `--subject-950` và `--subject-hue`:
     - Môn 1 (_Cấu trúc đại số_): Hue $275^\circ$ (Indigo/Violet — biểu trưng cho trừu tượng, cấu trúc nhóm).
     - Môn 2 (_Hình học Affine_): Hue $175^\circ$ (Teal/Emerald — biểu trưng cho không gian, vector phẳng).
   - Component quản lý chủ đề: [`SubjectThemeProvider.tsx`](file:///d:/Learning-universe/src/shared/theme/SubjectThemeProvider.tsx) kết hợp hook [`useSubjectTheme()`](file:///d:/Learning-universe/src/shared/theme/subject-themes.ts).

3. **Giao diện Trang chủ (Văn hóa Việt Nam đương đại):**
   - Trang chủ vừa được tái thiết kế thành công với bộ tokens `--color-vn-*`:
     - Nền: Trắng ngà `#F7F4EC` và Giấy Dó `#E9DFC9`.
     - Màu nhấn: Xanh ngọc trầm `#173E35`, Đỏ son `#8B302D`, Vàng đồng `#B89555`.
     - Chữ: Mực tàu `#292824` ($12.87:1$ WCAG AAA), Ghi gốm `#68645C` ($4.91:1$ WCAG AA).
     - Đồ họa: 11 component vector SVG native trong [`HeritageMotifs.tsx`](file:///d:/Learning-universe/src/shared/ui/HeritageMotifs.tsx).

### 1.2. Những Điểm hạn chế Cần Giải quyết khi Mở rộng Toàn Hệ thống

| Vấn đề hiện tại                                       | Hậu quả kỹ thuật & UX                                                                                                                                                                             | Giải pháp chuẩn hóa trong Design System                                                                                       |
| :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :---------------------------------------------------------------------------------------------------------------------------- |
| **Phân mảnh màu sắc giữa Trang chủ và Trang học tập** | Trang chủ dùng tông Giấy Dó `#F7F4EC` nhưng các trang bài học (`LessonPage`), tổng quan môn (`SubjectOverviewPage`) vẫn dùng màu Tailwind mặc định (`bg-stone-50`, `bg-white`, `text-stone-900`). | Hợp nhất hệ thống tokens: Đưa biến màu giấy và mực vào layer nền tảng, các trang học tập kế thừa tự nhiên không bị lệch tông. |
| **Thiếu Semantic Tokens hành động & phản hồi**        | Chưa có token chuẩn cho các trạng thái: `Success`, `Warning`, `Error`, `Info`, `Disabled`, `Focus-ring`. Một số nơi đang dùng màu Tailwind rời rạc (`text-emerald-600`, `bg-amber-50`).           | Chuẩn hóa bảng màu ngữ nghĩa học thuật với độ tương phản kiểm định WCAG 2.2.                                                  |
| **Thiếu Core Form Components**                        | Dự án mới có `Button`, `Badge`, `Drawer`, `Tooltip`, `Collapsible`; chưa có component chuẩn hóa cho `Input`, `Textarea`, `Select`, `Checkbox`, `Progress Bar ngang`.                              | Xây dựng bộ Core Form Components sử dụng `tailwind-variants` đồng bộ trong `src/shared/ui/`.                                  |
| **Ranh giới chưa rõ giữa Văn hóa và Học thuật**       | Nguy cơ lạm dụng hoa văn di sản vào vùng đọc chứng minh hoặc bài tập, gây rối mắt cho sinh viên.                                                                                                  | Định nghĩa rõ **Quy tắc 2 Lớp (Two-Layer Architecture)**: Lớp Thương hiệu Di sản và Lớp Giao diện Hàn lâm.                    |

---

## II. TRIẾT LÝ THIẾT KẾ: "TWO-LAYER ARCHITECTURE"

Design System của **Learning Universe** được phân định rõ ràng thành hai lớp tương hỗ:

```
┌────────────────────────────────────────────────────────────────────────┐
│        LEARNING UNIVERSE — VIETNAMESE HERITAGE DESIGN SYSTEM           │
├────────────────────────────────────────────────────────────────────────┤
│  LỚP 1: NHẬN DIỆN DI SẢN (HERITAGE BRAND IDENTITY LAYER)              │
│  - Áp dụng tại: Header, Footer, Hero, Thẻ tổng quan, Dải phân cách.    │
│  - Chất cảm: Nền Giấy Dó, Trắng ngà, Mực tàu, Chỉ mộng gỗ.             │
│  - Họa tiết: Trống đồng Đông Sơn, hoa văn kỷ hà nan tre, nan nón lá.  │
│  - Mục tiêu: Khơi gợi niềm tự hào văn hóa, cảm giác bước vào thư viện. │
├────────────────────────────────────────────────────────────────────────┤
│  LỚP 2: GIAO DIỆN HÀN LÂM (ACADEMIC READING & COGNITIVE LAYER)         │
│  - Áp dụng tại: Trang bài học (MDX), Định lý, Chứng minh, Bài tập.     │
│  - Nguyên tắc: "Content First" — Nội dung toán học là trung tâm.       │
│  - Trình bày: Độ rộng dòng ~70ch, nền phẳng tĩnh lặng, không hoa văn.  │
│  - Độ chính xác: Công thức KaTeX chuẩn AMS, phân biệt rõ Định lý/Ví dụ │
│  - Mục tiêu: Bảo vệ thị lực, hỗ trợ học tập và nghiên cứu bền bỉ.      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## III. HỆ THỐNG DESIGN TOKENS CHUẨN HÓA

### 3.1. Color Tokens (Hệ thống Màu sắc 3 Phân tầng)

#### Tầng A: Bảng màu Thương hiệu Di sản (Brand Heritage Tokens)

Kế thừa nguyên vẹn từ bản sắc Trang chủ đã nghiệm thu:

```css
--lu-color-brand-primary: #173e35; /* Xanh ngọc trầm / Sơn ta đậm */
--lu-color-brand-primary-hover: #1f5045; /* Xanh ngọc sáng hơn khi hover */
--lu-color-brand-secondary: #8b302d; /* Đỏ son / Chu sa */
--lu-color-brand-accent: #b89555; /* Vàng đồng / Hoàng thổ */
--lu-color-brand-accent-light: #d4b77f; /* Ánh đồng nhạt */
```

#### Tầng B: Bảng màu Ngữ nghĩa Học thuật (Semantic Academic Tokens)

Dành cho toàn bộ bề mặt, văn bản và trạng thái hệ thống:

```css
/* Bề mặt (Surfaces) */
--lu-color-bg-canvas: #f7f4ec; /* Trắng ngà: nền toàn trang web */
--lu-color-surface-paper: #e9dfc9; /* Giấy Dó: nền khối ghi chú, thanh công cụ */
--lu-color-surface-card: #fcfbf7; /* Trắng ấm: nền thẻ học tập, khối định lý */
--lu-color-surface-elevated: #ffffff; /* Trắng nổi: modal, popover, tooltip dropdown */

/* Văn bản (Text & Typography) */
--lu-color-text-primary: #292824; /* Mực tàu thẫm: chữ nội dung chính (12.87:1 AAA) */
--lu-color-text-secondary: #4a4740; /* Mực nho vừa: văn bản phụ, giải thích (8.4:1 AAA) */
--lu-color-text-muted: #68645c; /* Ghi gốm ấm: số trang, chú thích (4.91:1 AA) */
--lu-color-text-inverse: #fcfbf7; /* Chữ sáng trên nền tối */

/* Đường viền & Phân cách (Borders & Dividers) */
--lu-color-border-default: #ddd5c3; /* Chỉ ngà trầm: viền thẻ, mộng gỗ (Non-text 3:1) */
--lu-color-border-soft: #eae3d4; /* Viền mảnh mờ: kẻ phân đoạn trong bài học */
--lu-color-border-focus: #173e35; /* Focus ring xanh ngọc trầm cho bàn phím */

/* Trạng thái Phản hồi (Feedback States - Đảm bảo phân biệt rõ với Đỏ son thương hiệu) */
--lu-color-feedback-success: #1b6348; /* Lục bảo trầm: Đã hoàn thành, lời giải đúng */
--lu-color-feedback-success-bg: #edf6f1; /* Nền xanh nhạt dịu mắt */
--lu-color-feedback-warning: #945800; /* Hổ phách gốm: Lưu ý, cảnh báo học thuật */
--lu-color-feedback-warning-bg: #fdf6ec; /* Nền hổ phách nhạt */
--lu-color-feedback-error: #a82320; /* Đỏ huyết dụ: Lỗi hệ thống, phản chứng */
--lu-color-feedback-error-bg: #fdf2f2; /* Nền đỏ nhạt */
--lu-color-feedback-info: #185a7e; /* Lam chàm trầm: Thông tin tham khảo, nguồn */
--lu-color-feedback-info-bg: #f0f6fa; /* Nền lam nhạt */
```

#### Tầng C: Dải màu Động theo Môn học (Dynamic Subject Palette via OKLCH)

Giữ nguyên vẹn cơ chế OKLCH không phụ thuộc class động:

- `--subject-50` .. `--subject-950` ứng với từng giá trị hue (`275` cho Đại số, `175` cho Hình học Affine, và sẵn sàng mở rộng cho Giải tích hue `210`, Xác suất thống kê hue `30`, v.v.).

---

### 3.2. Typography Tokens (Thang Phông chữ & Quy chuẩn KaTeX)

#### Bộ phông tiêu chuẩn

- **Phông giao diện chính (Sans-serif):** `Be Vietnam Pro`, `system-ui`, `-apple-system`, `sans-serif`. Hỗ trợ 100% dấu tiếng Việt chuẩn Unicode, không lỗi chân chữ.
- **Phông số hiệu & mã nguồn (Monospace):** `JetBrains Mono Variable`, `monospace`. Dùng cho mã băm SHA-256, số Chương.Bài.Số (ví dụ: `01.02`), tỷ lệ %, phím tắt bàn phím.
- **Phông công thức toán (Math Engine):** Giữ nguyên vẹn bộ phông **KaTeX (Computer Modern / AMS)**. Tuyệt đối không áp đặt phông trang trí lên công thức toán học!

#### Bảng phân cấp Thang kiểu chữ (Type Scale)

| Cấp bậc            |     Font Size      | Line Height |   Font Weight   |  Letter Spacing   | Phạm vi sử dụng                                     |
| :----------------- | :----------------: | :---------: | :-------------: | :---------------: | :-------------------------------------------------- |
| **Display**        | $44 - 56\text{px}$ |   $1.15$    | 800 (ExtraBold) | $-0.025\text{em}$ | Đại tự tiêu đề Hero trang chủ                       |
| **Heading 1 (H1)** | $32 - 40\text{px}$ |   $1.25$    |   700 (Bold)    | $-0.02\text{em}$  | Tên bài học (`LessonPage`), tên môn (`SubjectHero`) |
| **Heading 2 (H2)** | $24 - 28\text{px}$ |   $1.30$    |   700 (Bold)    | $-0.015\text{em}$ | Tên chương, đề mục lớn trong bài                    |
| **Heading 3 (H3)** | $18 - 20\text{px}$ |   $1.35$    | 600 (SemiBold)  | $-0.01\text{em}$  | Đề mục nhỏ, tiêu đề thẻ môn học                     |
| **Heading 4 (H4)** | $16 - 18\text{px}$ |   $1.40$    | 600 (SemiBold)  |        $0$        | Tiêu đề Định lý, Định nghĩa, Ví dụ, Bài tập         |
| **Body Large**     |   $18\text{px}$    |   $1.70$    |  400 (Regular)  |        $0$        | Đoạn giới thiệu đầu bài học, tóm tắt chương         |
| **Body Standard**  |   $16\text{px}$    |   $1.75$    |  400 (Regular)  |        $0$        | Nội dung lý thuyết, văn bản chứng minh, bài tập     |
| **Body Small**     |   $14\text{px}$    |   $1.60$    |  400 (Regular)  |        $0$        | Chú thích bài học, giải thích bước biến đổi         |
| **Caption / Meta** |   $12\text{px}$    |   $1.50$    |  500 (Medium)   | $+0.01\text{em}$  | Số trang nguồn, thời lượng đọc, tag môn học         |
| **Overline**       |   $11\text{px}$    |   $1.20$    | 600 (SemiBold)  | $+0.10\text{em}$  | Huy hiệu trạng thái, tiền tố danh mục (In hoa)      |

---

### 3.3. Spacing Tokens (Hệ thống Khoảng cách 8-Point Grid)

Dựa trên bước nhảy $4\text{px}$ của Tailwind, chuẩn hóa thành 9 cấp độ ngữ nghĩa:

```css
--lu-spacing-3xs: 0.25rem; /* 4px:  Khoảng cách icon và chữ trong badge */
--lu-spacing-2xs: 0.5rem; /* 8px:  Khoảng cách giữa các tag, padding nhỏ */
--lu-spacing-xs: 0.75rem; /* 12px: Padding bên trong nút nhỏ, gap danh sách */
--lu-spacing-sm: 1rem; /* 16px: Padding card nhỏ, margin đoạn văn ngắn */
--lu-spacing-md: 1.5rem; /* 24px: Padding chuẩn của card, khoảng cách giữa các block */
--lu-spacing-lg: 2rem; /* 32px: Khoảng cách giữa các đề mục h3 và nội dung */
--lu-spacing-xl: 3rem; /* 48px: Khoảng cách phân đoạn lớn h2 trong bài học */
--lu-spacing-2xl: 4rem; /* 64px: Khoảng cách giữa các Section trên trang chủ */
--lu-spacing-3xl: 5rem; /* 80px: Khoảng cách padding đỉnh trang, hero container */
```

---

### 3.4. Radius, Border & Elevation Tokens

```css
/* Bo góc (Border Radius) — Cảm giác mộc bản mộng gỗ mềm mại, không tròn lẳn */
--lu-radius-sm: 0.375rem; /* 6px:  Badge, Kbd, nhãn tag */
--lu-radius-md: 0.5rem; /* 8px:  Nút bấm Button, Input, Select, Tooltip */
--lu-radius-lg: 0.75rem; /* 12px: Thẻ phụ, Drawer mobile menu item */
--lu-radius-xl: 1rem; /* 16px: Khối Định nghĩa, Định lý, Bài tập (Standard Card) */
--lu-radius-2xl: 1.5rem; /* 24px: Thẻ môn học SubjectCard, Banner Hero */
--lu-radius-full: 9999px; /* Huy hiệu tròn, thanh tiến độ pill */

/* Độ nổi & Bóng đổ (Elevation & Shadows) — Tone ấm, tuyệt đối không đổ bóng đen gắt */
--lu-shadow-2xs: 0 1px 2px 0 oklch(0.24 0.008 80 / 0.04);
--lu-shadow-xs: 0 1px 3px 0 oklch(0.24 0.008 80 / 0.06), 0 1px 2px -1px oklch(0.24 0.008 80 / 0.06);
--lu-shadow-sm:
  0 2px 5px -1px oklch(0.24 0.008 80 / 0.08), 0 1px 3px -1px oklch(0.24 0.008 80 / 0.05);
--lu-shadow-md:
  0 4px 12px -2px oklch(0.24 0.008 80 / 0.08), 0 2px 6px -2px oklch(0.24 0.008 80 / 0.05);
```

---

### 3.5. Motion Tokens (Động lực học Giao diện Học thuật)

```css
/* Thời lượng chuyển tiếp (Durations) */
--lu-motion-fast: 150ms; /* Hover nút, focus ring, tooltip reveal */
--lu-motion-normal: 250ms; /* Accordion gập/mở chứng minh, tab switch */
--lu-motion-slow: 350ms; /* Modal popup, Drawer trượt từ cánh */

/* Đường cong gia tốc (Easing) */
--lu-ease-standard: cubic-bezier(0.2, 0, 0, 1); /* Mượt mà, tự nhiên */
--lu-ease-decelerate: cubic-bezier(0, 0, 0.2, 1); /* Xuất hiện êm dịu */
--lu-ease-accelerate: cubic-bezier(0.3, 0, 1, 1); /* Ẩn đi dứt khoát */

/* Quy tắc an toàn: Tôn trọng prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## IV. ĐẶC TẢ HỆ THỐNG COMPONENT ĐỒNG BỘ

Mọi component tuân thủ thư viện quản lý biến thể `tailwind-variants` (`tv`), hỗ trợ thuộc tính `className`, đầy đủ kiểu TypeScript `readonly` và chuẩn WAI-ARIA.

### 4.1. Nhóm Core Components (`src/shared/ui/`)

1. **`Button`:**
   - **Variants:**
     - `primary`: Nền xanh ngọc trầm `#173E35`, chữ trắng ngà, hover ngọc sáng `#1F5045`.
     - `secondary`: Nền giấy dó `#E9DFC9`, viền chỉ ngà `#DDD5C3`, chữ mực tàu `#292824`.
     - `outline`: Nền trong suốt hoặc trắng ấm, viền `#DDD5C3`, hover viền xanh ngọc.
     - `subject`: Nền màu nhận diện môn học hiện tại (`bg-subject-600`), chữ trắng.
     - `subjectOutline`: Viền màu nhận diện môn học (`border-subject-300 bg-subject-50/50`).
     - `ghost`: Trong suốt, hover nền giấy dó nhạt, chữ mực tàu.
     - `destructive`: Nền đỏ huyết dụ `#A82320`, chữ trắng.
   - **Sizes:** `sm` ($32\text{px}$), `md` ($40\text{px}$), `lg` ($44\text{px}$), `icon` ($36\text{px} \times 36\text{px}$).

2. **`Badge` (Huy hiệu Học thuật):**
   - **Variants:** `neutral` (mộc), `subject` (theo môn), `subjectSolid`, `approved` (xanh lục bảo), `published` (mực thẫm), `draft` (hổ phách), `review` (lam chàm).
   - Thiết kế: Bo góc nhỏ `rounded-md`, chữ nhỏ thanh thoát $11 - 12\text{px}$.

3. **`Input` & `Textarea` (Thành phần Nhập liệu Chuẩn hóa mới):**
   - Nền trắng ấm `bg-vn-surface-card`, viền mộc `border-vn-border`.
   - Trạng thái `focus`: Viền xanh ngọc trầm `--lu-color-border-focus`, vòng sáng mờ không gây chói.

4. **`ProgressBar` (Thanh tiến độ ngang thay thế triệt để vòng tròn):**
   - Nền rãnh: `--lu-color-border-soft` bo góc pill `rounded-full`.
   - Vạch tiến độ: Nền `--lu-color-brand-primary` hoặc `bg-subject-600`.
   - Tích hợp chuẩn trợ năng: `role="progressbar"`, `aria-valuenow`, `aria-valuemin="0"`, `aria-valuemax="100"`.

5. **`Divider` (Dải phân cách Mộng gỗ & Di sản):**
   - `HeritageDivider`: Vạch gradient ngọc trầm với nút thắt kỷ hà trung tâm.
   - `KagomeWeaveDivider`: Dải viền mây tre đan lục giác cho đỉnh/đáy trang.
   - `SimpleDivider`: Đường kẻ mảnh $1\text{px}$ màu `--lu-color-border-soft`.

---

### 4.2. Nhóm Academic Content Components (`src/content-runtime/components/`)

Đây là trái tim của nền tảng, hiển thị toàn bộ 40 bài học MDX:

```
┌────────────────────────────────────────────────────────────────────────┐
│               PHÂN CẤP KHỐI NỘI DUNG HỌC THUẬT (ACADEMIC BLOCKS)       │
├────────────────────────────────────────────────────────────────────────┤
│ 1. ĐỊNH NGHĨA (Definition):                                            │
│    - Gờ viền trái dày 4px: Màu nhận diện môn đậm (--subject-600).      │
│    - Nền: Trắng ấm (#FCFBF7), viền ngà trầm.                           │
│    - Badge: "Định nghĩa X.Y.Z", nhãn nguồn gốc bên phải.               │
├────────────────────────────────────────────────────────────────────────┤
│ 2. ĐỊNH LÝ / BỔ ĐỀ / MỆNH ĐỀ (Theorem / Lemma / Proposition):          │
│    - Gờ viền trái dày 4px: Màu nhận diện môn vừa (--subject-500).      │
│    - Nền: Phủ mờ nhẹ sắc môn học (bg-subject-50/45).                   │
│    - Chữ: Mực tàu sắc nét, công thức KaTeX căn chỉnh chuẩn dòng.       │
├────────────────────────────────────────────────────────────────────────┤
│ 3. CHỨNG MINH (Proof):                                                 │
│    - Khối collapsible: Mặc định mở hoặc cho phép thu gọn.              │
│    - Icon: Nút thắt logic hai chiều, gờ trái nét đứt mảnh (dashed).    │
│    - Ký hiệu kết thúc: Ô vuông mộc Halmos (Q.E.D.) "∎" ở góc phải.     │
├────────────────────────────────────────────────────────────────────────┤
│ 4. VÍ DỤ / PHẢN VÍ DỤ (Example / Counterexample):                      │
│    - Gờ viền mộc mây tre, nền giấy dó nhạt (bg-stone-50/60).           │
│    - Phân biệt rõ ràng với Định lý để sinh viên không nhầm lẫn.        │
├────────────────────────────────────────────────────────────────────────┤
│ 5. BÀI TẬP & LỜI GIẢI (Exercise / Hint / Solution):                    │
│    - Đề bài: Khung thẻ trang trọng với số hiệu bài tập.                │
│    - Gợi ý (Hint): Khối gập icon bóng đèn/dấu hỏi màu lam chàm.        │
│    - Lời giải (Solution): Khối gập icon kiểm định màu lục bảo trầm.    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 4.3. Nhóm Navigation & Layout Components

1. **`Container`:**
   - Hỗ trợ các kích thước chuẩn: `sm` ($768\text{px}$), `md` ($1024\text{px}$), `lg` ($1152\text{px}$), `xl` ($1280\text{px}$), và đặc biệt `prose` (tối ưu đúng $70\text{ch} \approx 680\text{px}$ cho bài đọc lý thuyết).
2. **`Breadcrumb`:**
   - Phân cấp đường dẫn học thuật rõ ràng: `Trang chủ` / `Tên môn học` / `Chương X` / `Bài Y`.
   - Phần tử cuối cùng mang thuộc tính `aria-current="page"`.
3. **`LessonSidebar` & `LessonToc`:**
   - Sidebar cố định danh sách bài học theo cây thư mục môn.
   - Mục lục bài học (`LessonToc`) bám dính (sticky) ở cánh phải, tự động đánh dấu mục đang đọc bằng vệt chỉ ngọc trầm qua `IntersectionObserver`.

---

## V. QUY TẮC THIẾT KẾ CHO NỀN TẢNG ĐA MÔN HỌC

Hệ thống được thiết kế theo cấu trúc module độc lập để **mở rộng không giới hạn cho mọi môn học mới** mà không cần sửa đổi CSS cốt lõi:

```
                  ┌─────────────────────────────────────────┐
                  │ LEARNING UNIVERSE BASE DESIGN SYSTEM    │
                  │ (Tokens Giấy Dó, Mực Tàu, Grid, KaTeX)   │
                  └────────────────────┬────────────────────┘
                                       │ Kế thừa
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐
│ MÔN 1: CẤU TRÚC ĐẠI SỐ        │     │ MÔN 2: HÌNH HỌC AFFINE        │
│ • Hue OKLCH: 275 (Tím/Indigo) │     │ • Hue OKLCH: 175 (Xanh ngọc)  │
│ • Motif: Bát giác đối xứng D4 │     │ • Motif: Lưới tọa độ Affine   │
│ • Icon: Sigma / Nhóm hoán vị  │     │ • Tool: Mafs Figure Kit 2D    │
└───────────────────────────────┘     └───────────────────────────────┘
            │                                                     │
            ▼                                                     ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐
│ (Tương lai) GIẢI TÍCH CỔ ĐIỂN │     │ (Tương lai) ĐẠI SỐ TUYẾN TÍNH │
│ • Hue OKLCH: 215 (Xanh Lam)   │     │ • Hue OKLCH: 320 (Hồng Magenta│
│ • Motif: Đường cong Tích phân │     │ • Motif: Ma trận không gian   │
└───────────────────────────────┘     └───────────────────────────────┘
```

**Nguyên tắc triển khai:**

1. Mỗi môn học chỉ cần khai báo 1 file `subject.yaml` và 1 biến `hue` trong cấu hình theme.
2. Các component học thuật tự động ăn màu theo biến `--subject-*` thông qua `SubjectThemeProvider`.
3. Tuyệt đối không hardcode mã màu hex của riêng một môn học nào vào các component dùng chung.

---

## VI. 10 QUY TẮC VÀNG CHO GIAO DIỆN HỌC THUẬT (ACADEMIC UI RULES)

Tuân thủ nghiêm ngặt theo các quyết định D1–D8 của dự án:

1. **Nội dung là tối thượng (Content First):** Mọi chi tiết trang trí không được phép làm phân tán sự chú ý của người học.
2. **Độ rộng dòng đọc tối ưu:** Vùng văn bản lý thuyết luôn giới hạn trong khoảng $65\text{ch} - 72\text{ch}$ (`.lu-prose`). Không bao giờ kéo dài văn bản toàn màn hình $1920\text{px}$.
3. **Công thức toán KaTeX độc lập & cuộn an toàn:** Công thức toán khối (`.katex-display`) phải có `overflow-x: auto; overflow-y: hidden;` để không làm vỡ giao diện trên điện thoại di động.
4. **Không đặt hoa văn dưới vùng đọc dài:** Nền của vùng đọc lý thuyết và chứng minh luôn là bề mặt tĩnh lặng (`#FCFBF7` hoặc `#FFFFFF`). Hoa văn Đông Sơn chỉ xuất hiện ở Hero hoặc dải phân cách.
5. **Gập/mở chứng minh có chủ đích:** Các chứng minh dài được đặt trong khối `Proof` hoặc `Collapsible` để kích thích sinh viên tự suy nghĩ trước khi mở xem bước giải.
6. **Ký hiệu Q.E.D chuẩn mực:** Mọi chứng minh kết thúc bằng biểu tượng mộc Halmos vuông (`∎`) ở góc phải dưới.
7. **Phân biệt rõ ràng giữa Định lý và Ví dụ:** Định lý có gờ biên màu môn học và nền nổi; ví dụ có gờ biên màu trung tính và nền giấy mờ.
8. **Bảo tồn tính toàn vẹn học thuật:** Tuyệt đối không chỉnh sửa từ ngữ của định lý hay chứng minh trong `content/` để làm đẹp giao diện.
9. **Điều hướng bàn phím đầy đủ:** Hỗ trợ phím tắt chuyển bài (`J`/`K`), tìm kiếm nhanh (`/`), và đóng mở thanh bên (`[`).
10. **Bảo mật trạng thái Khách (Quyết định D1):** Giao diện học tập hoạt động 100% công khai ở chế độ Khách chỉ đọc, không bắt buộc người học phải đăng nhập mới được đọc bài.

---

## VII. TỔ CHỨC CẤU TRÚC MÃ NGUỒN (CODEBASE ARCHITECTURE)

Nhằm đảm bảo **Zero-Regression** và không làm xáo trộn các đường dẫn import `@/*` đang hoạt động, cấu trúc mã nguồn được giữ nguyên và tổ chức tinh gọn:

```text
src/
├── styles/
│   ├── index.css               # Điểm nạp Tailwind v4, phông chữ, @theme tokens
│   ├── tokens.css              # (Mới) Bộ biến CSS tokens học thuật & ngữ nghĩa dùng chung
│   ├── subject-themes.css      # Hệ thống OKLCH dynamic palettes theo môn
│   └── prose.css               # Quy tắc typography học thuật .lu-prose
├── shared/
│   ├── theme/                  # SubjectThemeProvider & hook useSubjectTheme
│   ├── motion/                 # FadeIn, MotionProvider, useReducedMotion
│   └── ui/                     # BỘ CORE DESIGN SYSTEM COMPONENTS
│       ├── Button.tsx          # Chuẩn hóa variants (primary, secondary, subject...)
│       ├── Badge.tsx           # Chuẩn hóa trạng thái học thuật (approved, published...)
│       ├── Card.tsx            # Thẻ mộng gỗ mộc bản
│       ├── Input.tsx           # (Mới) Ô nhập liệu chuẩn hóa
│       ├── ProgressBar.tsx     # (Mới) Thanh tiến độ ngang chuẩn WAI-ARIA
│       ├── Collapsible.tsx     # Khối gập mở chứng minh / lời giải
│       ├── Breadcrumb.tsx      # Thanh dẫn đường học thuật
│       ├── Tooltip.tsx         # Chú giải nguồn tài liệu
│       ├── Drawer.tsx          # Ngăn kéo di động
│       ├── HeritageMotifs.tsx  # 11 component vector di sản bản sắc Việt
│       ├── index.ts            # Thư viện xuất component tập trung
│       └── variants.ts         # Quản lý tailwind-variants (tv) type-safe
├── content-runtime/
│   └── components/             # BỘ ACADEMIC BLOCKS (Hiển thị MDX)
│       ├── TheoryBlock.tsx     # Định nghĩa, Định lý, Bổ đề, Mệnh đề, Hệ quả
│       ├── ExampleBlock.tsx    # Ví dụ minh họa, Phản ví dụ
│       ├── ExerciseBlock.tsx   # Bài tập, Gợi ý (Hint), Lời giải (Solution)
│       ├── Proof.tsx           # Khối chứng minh hai chiều
│       ├── CalloutBlock.tsx    # Lưu ý, Cảnh báo học thuật
│       └── Figure.tsx          # Khung chứa hình minh họa & Mafs Figure Kit
└── pages/
    └── dev-ui/
        └── DevUiPage.tsx       # TRANG SHOWCASE KIỂM THỬ DESIGN SYSTEM
```

---

## VIII. KẾ HOẠCH TRIỂN KHAI TỪNG BƯỚC (PHASED ROADMAP)

```
┌────────────────────────────────────────────────────────────────────────┐
│                   LỘ TRÌNH 3 BƯỚC THI CÔNG (GIAI ĐOẠN 4)               │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 1: KIỂM KÊ & THIẾT KẾ ĐẶC TẢ HỆ THỐNG (HIỆN TẠI - HOÀN TẤT)       │
│  - Hoàn thành tài liệu DESIGN_SYSTEM_SPECIFICATION.md.                 │
│  - Đệ trình chủ dự án xem xét và phê duyệt. Chưa sửa mã nguồn.        │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 2: TRIỂN KHAI TOKENS & CHUẨN HÓA CORE COMPONENTS                 │
│  - Bổ sung src/styles/tokens.css và nạp vào index.css.                 │
│  - Chuẩn hóa Button, Badge, Card, ProgressBar trong src/shared/ui/.    │
│  - Cập nhật trang Showcase /dev/ui hiển thị đầy đủ bảng token & motif. │
├────────────────────────────────────────────────────────────────────────┤
│  BƯỚC 3: ĐỒNG BỘ ACADEMIC BLOCKS & KIỂM THỬ TOÀN DIỆN                   │
│  - Tinh chỉnh TheoryBlock, ExampleBlock, ExerciseBlock theo tông giấy. │
│  - Chạy `npm.cmd run check` (Prettier, ESLint, Typecheck, Test).       │
│  - Chạy `npm.cmd run build` đóng gói production.                       │
│  - Lập báo cáo nghiệm thu DESIGN_SYSTEM_IMPLEMENTATION_REPORT.md.      │
└────────────────────────────────────────────────────────────────────────┘
```

---

## IX. KẾT LUẬN & CAM KẾT BẢO TOÀN

1. **Cam kết phạm vi:** Ở lượt chạy này, **CHỈ THỰC HIỆN BƯỚC 1 (KIỂM KÊ VÀ LẬP TÀI LIỆU ĐẶC TẢ)**.
2. **An toàn mã nguồn:** 100% tệp trong `src/` và `content/` không bị chỉnh sửa. Không có bất kỳ rủi ro nào đối với 47 bài kiểm thử Vitest và mã băm SHA-256 trong `content.lock.json`.
3. **Sẵn sàng thi công:** Sau khi chủ dự án phê duyệt bản đặc tả này, Bước 2 và Bước 3 sẽ được tiến hành bài bản, chính xác và an toàn tuyệt đối.
