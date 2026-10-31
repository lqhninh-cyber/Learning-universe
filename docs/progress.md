# Tiến độ Triển khai Dự án Learning Universe (`progress.md`)

Tài liệu này theo dõi trạng thái thực tế của từng giai đoạn so với Kế hoạch tổng thể v2.1 (`learning_universe_plan.md`).

---

## 1. Tổng quan các Giai đoạn

| Giai đoạn       | Hạng mục                                                                                                                                                                                                                                                                                                     | Trạng thái             | Commit mốc |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ---------- |
| **Giai đoạn 0** | Khởi tạo dự án, cấu hình Vite + TS + Tailwind v4 + ESLint + Prettier + Vitest + GitHub CI, kết nối Supabase client                                                                                                                                                                                           | ✅ Đã hoàn thành       | `378963e`  |
| **Giai đoạn 1** | Design System, OKLCH Subject Theming (`algebraic-structures`, `affine-geometry`), UI Primitives & Trang `/dev/ui`                                                                                                                                                                                            | ✅ Đã hoàn thành       | `47e5120`  |
| **Giai đoạn 2** | Content Engine: Zod Schemas, Vite Content Plugin (`virtual:content-manifest`), Pipeline MDX + KaTeX + Macros, Tự động đánh số 3 bộ đếm (`remark-theorem-numbering`), 18 Academic Components & Trang `/dev/mdx`                                                                                               | ✅ Đã hoàn thành       | `494f56b`  |
| **Giai đoạn 3** | Không gian học tập công khai & Điều hướng bài học: Trang chủ + Tìm kiếm tức thời, Không gian môn học (`/mon-hoc/:subjectSlug`), Trang bài học 3 cột + Mục lục kép + Điều hướng trước/sau, Đường dẫn rút gọn (`/bai-hoc/:slug`), Lưu tiến độ/yêu thích/ghi chú cục bộ (Zustand + `LoginPromptDialog` theo D1) | ✅ Đã hoàn thành       | `4333a89`  |
| **Giai đoạn 4** | Công cụ Quản lý & Kiểm định Nội dung (`content:check`, `content:new`, `content:approve`, `content.lock.json`, `SourcePanel` & Trang `/dev/preview`)                                                                                                                                                          | ⏳ Chuẩn bị triển khai | —          |
| **Giai đoạn 5** | Figure Kit (Mafs 2D cho Hình học Affine): `AffinePlane`, `DraggablePoint`, `VectorArrow`, `AffineLine`, `Barycenter`, `Parallelogram`, `AffineMapDemo`                                                                                                                                                       | 📋 Chưa bắt đầu        | —          |
| **Giai đoạn 6** | Supabase Auth & PostgreSQL + RLS: Đăng ký/Đăng nhập/Khôi phục mật khẩu, Bảng `profiles`, `user_roles`, `lesson_progress`, `bookmarks`, `lesson_notes`, đồng bộ đa thiết bị, Trang `/ca-nhan` & `/bien-tap`                                                                                                   | 📋 Chưa bắt đầu        | —          |
| **Giai đoạn 7** | Authoring Kit (`docs/authoring/` + 5 bộ Prompt + 3 Skills Antigravity) & Thí điểm biên soạn nội dung thật từ giáo trình                                                                                                                                                                                      | 📋 Chưa bắt đầu        | —          |
| **Giai đoạn 8** | Hoàn thiện chuyển cảnh, Kiểm thử E2E / Accessibility / Lighthouse & Triển khai Production trên Vercel                                                                                                                                                                                                        | 📋 Chưa bắt đầu        | —          |

---

## 2. Chi tiết những hạng mục đã hoàn thành (GĐ0 → GĐ3)

### 2.1 Hạ tầng & Design System (GĐ0 – GĐ1)

- Cấu hình chặt chẽ TypeScript (`strict: true`), ESLint, Prettier, Vitest và GitHub Actions CI (`.github/workflows/ci.yml`).
- Hệ thống biến màu động OKLCH theo môn học (`src/styles/subject-themes.css`, `SubjectThemeProvider`) không dùng class Tailwind ghép chuỗi động.
- Bộ UI Primitives dùng chung (`src/shared/ui/`): `Badge`, `Breadcrumb`, `Button`, `Card`, `Collapsible`, `Container`, `Drawer`, `Kbd`, `ProgressRing`, `Skeleton`, `Tooltip`.

### 2.2 Content Engine & Academic MDX (GĐ2)

- Bộ Zod Schemas (`schemas/`) xác thực `bibliography.yaml`, `subject.yaml`, `chapter.yaml` và frontmatter `.mdx`; tự động chặn placeholder (`<…>`, `TODO`, `???`).
- Plugin `build/vite-plugin-content.ts` và `build/content-scanner.ts` phát module ảo `virtual:content-manifest` và tự động lọc bài `draft` khỏi bản production.
- Plugin `build/remark-theorem-numbering.ts` tự động đánh số `Chương.Bài.Số` theo **3 bộ đếm độc lập** (`theory`, `example`, `exercise`), tự động phân giải `<Ref to="..." />` và `<Proof of="..." />`, đồng thời trích xuất `headings` (`h2`, `h3`) và `blocks` vào `lessonMeta`.
- 18 component học thuật MDX (`src/content-runtime/components/`): `Definition`, `Theorem`, `Lemma`, `Proposition`, `Corollary`, `Proof`, `Example`, `Counterexample`, `Remark`, `Note`, `Warning`, `Exercise`, `Hint`, `Solution`, `Cite`, `Ref`, `Figure`, `KeyTakeaways`.

### 2.3 Không gian học tập công khai & Điều hướng (GĐ3)

- **Trang chủ (`/`)**: Giới thiệu nền tảng, thanh tìm kiếm tức thời không phân biệt dấu (`SearchBar`), thẻ tiếp tục bài học gần nhất và danh sách môn học động từ manifest.
- **Trang Danh sách môn (`/mon-hoc`) & Không gian môn học (`/mon-hoc/cau-truc-dai-so`, `/mon-hoc/hinh-hoc-affine`)**: `SubjectHero`, `SubjectFilterBar` (lọc theo mức độ, chủ đề `#tag`, từ khóa), `ChapterAccordionList` (hiển thị mục tiêu chương, danh sách bài học và trạng thái hoàn thành).
- **Trang Bài học (`/mon-hoc/:subjectSlug/:chapterSlug/:lessonSlug` & `/bai-hoc/:lessonSlug`)**:
  - Bố cục 3 cột trên desktop và `Drawer` trên tablet/mobile (`LessonSidebar`, `LessonToc`, `LessonMdxView`).
  - Tương tác học tập cá nhân (`LessonActionBar`, `LessonNotesPanel`, `LoginPromptDialog` theo Quyết định D1) và điều hướng Bài trước / Bài tiếp theo (`LessonPrevNextNav`).

---

## 3. Những hạng mục chưa triển khai (Thuộc GĐ4 – GĐ8)

1. **CLI Scripts kiểm định & khóa nội dung (`scripts/content/`):** `npm.cmd run content:check`, `content:new`, `content:approve`, cơ chế khóa hash `content.lock.json`, bảng đối chiếu nguồn `SourcePanel` cuối bài và trang `/dev/preview` (Giai đoạn 4).
2. **Figure Kit 2D với Mafs (`src/content-runtime/figure-kit/`):** Các component hình học tương tác cho môn Hình học Affine (Giai đoạn 5).
3. **Kết nối Supabase Auth & Database thực tế:** Các trang `/dang-nhap`, `/dang-ky`, `/quen-mat-khau`, `/dat-lai-mat-khau`, `/ca-nhan/*`, `/bien-tap`, SQL migrations & RLS policies đồng bộ với `useLearningStore` (Giai đoạn 6).
4. **Bộ tài liệu Authoring Kit (`docs/authoring/`) & Giáo trình chính thức:** Nhập thông tin giáo trình do chủ dự án cung cấp vào `content/_shared/bibliography.yaml` và biên soạn các bài học xuất bản thật (Giai đoạn 7).
