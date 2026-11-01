# Tiến độ Triển khai Dự án Learning Universe (`progress.md`)

Tài liệu này theo dõi trạng thái thực tế của từng giai đoạn so với Kế hoạch tổng thể v2.1 (`learning_universe_plan.md`).

---

## 1. Tổng quan các Giai đoạn

| Giai đoạn       | Hạng mục                                                                                                                                                                                                                                                                                                     | Trạng thái             | Commit mốc  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------- | ----------- |
| **Giai đoạn 0** | Khởi tạo dự án, cấu hình Vite + TS + Tailwind v4 + ESLint + Prettier + Vitest + GitHub CI, kết nối Supabase client                                                                                                                                                                                           | ✅ Đã hoàn thành       | `378963e`   |
| **Giai đoạn 1** | Design System, OKLCH Subject Theming (`algebraic-structures`, `affine-geometry`), UI Primitives & Trang `/dev/ui`                                                                                                                                                                                            | ✅ Đã hoàn thành       | `47e5120`   |
| **Giai đoạn 2** | Content Engine: Zod Schemas, Vite Content Plugin (`virtual:content-manifest`), Pipeline MDX + KaTeX + Macros, Tự động đánh số 3 bộ đếm (`remark-theorem-numbering`), 18 Academic Components & Trang `/dev/mdx`                                                                                               | ✅ Đã hoàn thành       | `494f56b`   |
| **Giai đoạn 3** | Không gian học tập công khai & Điều hướng bài học: Trang chủ + Tìm kiếm tức thời, Không gian môn học (`/mon-hoc/:subjectSlug`), Trang bài học 3 cột + Mục lục kép + Điều hướng trước/sau, Đường dẫn rút gọn (`/bai-hoc/:slug`), Lưu tiến độ/yêu thích/ghi chú cục bộ (Zustand + `LoginPromptDialog` theo D1) | ✅ Đã hoàn thành       | `f7629fc`   |
| **Giai đoạn 4** | Công cụ Quản lý & Kiểm định Nội dung (`content:check`, `content:new`, `content:approve`, `content:report`, `content.lock.json`, `SourcePanel`, `SubjectBibliography`, `DevEditorialBar` & Trang `/dev/preview`)                                                                                              | ✅ Đã hoàn thành       | `7d01287`   |
| **Giai đoạn 5** | Figure Kit (Mafs 2D cho Hình học Affine): `AffinePlane`, `DraggablePoint`, `VectorArrow`, `AffineLine`, `AffineFrame`, `Barycenter`, `Parallelogram`, `AffineMapDemo` & Trang `/dev/figures`                                                                                                                 | ✅ Đã hoàn thành       | Đang commit |
| **Giai đoạn 6** | Supabase Auth & PostgreSQL + RLS: Đăng ký/Đăng nhập/Khôi phục mật khẩu, Bảng `profiles`, `user_roles`, `lesson_progress`, `bookmarks`, `lesson_notes`, đồng bộ đa thiết bị, Trang `/ca-nhan` & `/bien-tap`                                                                                                   | ⏳ Chuẩn bị triển khai | —           |
| **Giai đoạn 7** | Authoring Kit (`docs/authoring/` + 5 bộ Prompt + 3 Skills Antigravity) & Thí điểm biên soạn nội dung thật từ giáo trình                                                                                                                                                                                      | 📋 Chưa bắt đầu        | —           |
| **Giai đoạn 8** | Hoàn thiện chuyển cảnh, Kiểm thử E2E / Accessibility / Lighthouse & Triển khai Production trên Vercel                                                                                                                                                                                                        | 📋 Chưa bắt đầu        | —           |

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

### 2.4 Công cụ Kiểm định & Bảo vệ Nội dung (GĐ4)

- **Lõi kiểm định 8 nhóm quy tắc (`build/content-validator.ts`)**: Kiểm tra cấu trúc (`structure`), metadata (`metadata`), nguồn học thuật (`sources`), cú pháp MDX & whitelist (`mdx`), công thức KaTeX (`latex`), đánh số & tham chiếu (`references`), tài nguyên (`assets`) và khóa SHA-256 (`lock`).
- **Bộ công cụ CLI (`scripts/content/`)**: `content:check`, `content:new`, `content:approve`, `content:report` và file khóa `content.lock.json`.
- **Hiển thị nguồn học thuật & Không gian xem trước**: `SourcePanel`, `SubjectBibliography`, `DevEditorialBar` và trang `/dev/preview` (`DevPreviewPage`).

### 2.5 Figure Kit 2D với Mafs cho Hình học Affine (GĐ5)

- **Lõi toán học Affine (`src/content-runtime/figure-kit/affine-math.ts`)**: Phép toán vectơ, định thức, giải tọa độ mục tiêu affine xiên $\mathcal{R} = (O; \vec{e}_1, \vec{e}_2)$, tâm tỉ cự và ánh xạ affine phẳng.
- **8 Component tương tác (`src/content-runtime/figure-kit/`)**: `AffinePlane`, `DraggablePoint`, `VectorArrow`, `AffineLine`, `AffineFrame`, `Parallelogram`, `Barycenter`, `AffineMapDemo` kèm nạp lười (`LazyFigureKit.tsx` + chunk `vendor-mafs`).
- **3 hình mẫu trong bài học Hình học Affine & Trang `/dev/figures`**: Tích hợp vào [`01-khong-gian-affine.mdx`](file:///d:/Learning-universe/content/affine-geometry/01-khong-gian-affine/01-khong-gian-affine.mdx) và phòng thí nghiệm `/dev/figures` (`DevFiguresPage.tsx`).

### 2.6 Khởi tạo học liệu Cấu trúc Đại số (Chương 0, Chương 1 & Chương 2)

- **Chương 0: Ngôn ngữ và công cụ đại số (`00-ngon-ngu-va-cong-cu-dai-so`)**: 4 bài học hoàn chỉnh (`01-tap-hop-anh-xa-va-cong-cu-so-hoc`, `02-quan-he-tuong-duong-va-tap-thuong`, `03-phep-toan-hai-ngoi-va-tinh-xac-dinh-tot`, `04-bai-tap-va-tong-ket-chuong-0`).
- **Chương 1: Nhóm và các ví dụ cơ bản (`01-nhom-va-cac-vi-du-co-ban`)**: 4 bài học hoàn chỉnh theo giáo trình TS. Huỳnh Việt Khánh (tr. 17–36, 166–168):
  - `01-nua-nhom-vi-nhom-va-tien-de-nhom.mdx`: Nửa nhóm, vị nhóm, nhóm, nhóm abel; quy trình 4 bước kiểm tra nhóm; Định lý 1.8; 4 bài tập A, B, C, D kèm thang điểm 1.00.
  - `02-luy-thua-nguyen-nhom-huu-han-va-bang-cayley.mdx`: Lũy thừa nguyên $a^n$, bội nguyên $na$, Định lý 1.10, cấp của nhóm, Định lý 1.12 bảng Cayley và phân tích nhóm cấp 4; 4 bài tập A, B, C, D kèm thang điểm 1.00.
  - `03-cac-ho-nhom-co-ban.mdx`: 7 họ nhóm cơ bản ($(\Z, +)$, $(\Z/n\Z, +)$, $U(n)$, $S_n$, $D_{2n}$, $\operatorname{GL}_2(\R)$, $\operatorname{Aff}(\R)$); Mệnh đề 1.21; Bảng 8 nhóm mẫu; 4 bài tập A, B, C, D.
  - `04-bai-tap-va-tong-ket-chuong-1.mdx`: Sơ đồ tư duy phân cấp cấu trúc; bảng thuật ngữ đối chiếu Việt–Anh; phương pháp giải trọng tâm; 4 bài tập chuyên đề A, B, C, D.
- **Chương 2: Nhóm con và nhóm cyclic (`02-nhom-con-va-nhom-cyclic`)**: 4 bài học hoàn chỉnh theo giáo trình TS. Huỳnh Việt Khánh (tr. 37–54, 169–173):
  - `01-nhom-con-va-nhom-con-sinh-boi-mot-tap-hop.mdx`: Định nghĩa nhóm con; Định lý 2.1 (tiêu chuẩn 2 bước và tiêu chuẩn 1 bước rút gọn $xy^{-1} \in H$, dạng cộng $x - y \in H$); tiêu chuẩn tập con hữu hạn; giao và hợp nhóm con ($H \cup K \le G \iff H \subseteq K \lor K \subseteq H$); nhóm con sinh $\langle S \rangle$ và Định lý 2.5 (mô tả bằng từ hữu hạn); 4 bài tập A, B, C, D (ma trận đường chéo $D_2(\R)$, tâm nhóm $Z(G)$, $G$ không thể là hợp 2 nhóm con thực sự, tiêu chuẩn tập tích $HK \le G \iff HK = KH$).
  - `02-cap-cua-phan-tu-va-nhom-cyclic.mdx`: Cấp phần tử $\operatorname{ord}(a)$; Định lý 2.8 (quan hệ đẳng thức lũy thừa $a^k = e \iff \operatorname{ord}(a) \mid k$ và hai mô hình cyclic chuẩn $\Z, \Z/n\Z$); tính giao hoán của nhóm cyclic; cấp của hoán vị qua $\operatorname{lcm}$ chu trình rời; căn đơn vị $\mu_n$; 4 bài tập A, B, C, D (cấp trong $S_6$, bất biến liên hợp $\operatorname{ord}(gag^{-1}) = \operatorname{ord}(a)$ và $\operatorname{ord}(ab) = \operatorname{ord}(ba)$, cấp lũy thừa $\gcd(k, n) = 1$, cấp của tích $ab$ khi giao hoán).
  - `03-cau-truc-nhom-con-cua-nhom-cyclic.mdx`: Định lý cơ bản 2.12 (mọi nhóm con của nhóm cyclic đều là cyclic, công thức $\operatorname{ord}(a^k) = \frac{n}{\gcd(n, k)}$, $\varphi(n)$ phần tử sinh, tương ứng 1-1 giữa ước dương $d \mid n$ và nhóm con duy nhất $\langle a^{n/d} \rangle$); giao và nhóm con sinh trong nhóm cyclic ($\operatorname{lcm}$ và $\gcd$); khảo sát chi tiết mạng nhóm con của $\Z/12\Z$; 4 bài tập A, B, C, D (tính trong $\langle a \rangle$ cấp 30, mạng nhóm con $\Z/18\Z$, đồng nhất thức Gauss $\sum_{d \mid n} \varphi(d) = n$, tiêu chuẩn nhóm cyclic từ tính duy nhất nhóm con).
  - `04-bai-tap-va-tong-ket-chuong-2.mdx`: Sơ đồ tư duy Chương 2 (Mermaid flowchart); bảng thuật ngữ đối chiếu Việt–Anh; phương pháp giải 4 dạng toán cốt lõi; 4 bài tập chuyên đề A, B, C, D ($U(14)$ cyclic và phần tử sinh - Bài 2.12, mạng nhóm con $\Z/20\Z$ và sơ đồ Hasse - Bài 2.25, nhóm không có nhóm con thực sự không tầm thường là cyclic cấp nguyên tố - Bài 2.27, nhóm con xoắn $T(G)$ của nhóm abel - Bài 2.35–2.36).
- **Kiểm định học thuật & Kiểm thử kỹ thuật**: Toàn bộ 12 bài học của Môn Cấu trúc Đại số ở trạng thái `status: draft`, vượt qua kiểm tra `content:check` với 0 lỗi, `npm.cmd run check` (45/45 test passed) và `npm.cmd run build` thành công.

---

## 3. Những hạng mục chưa triển khai (Thuộc GĐ6 – GĐ8)

1. **Kết nối Supabase Auth & Database thực tế:** Các trang `/dang-nhap`, `/dang-ky`, `/quen-mat-khau`, `/dat-lai-mat-khau`, `/ca-nhan/*`, `/bien-tap`, SQL migrations & RLS policies đồng bộ với `useLearningStore` (Giai đoạn 6).
2. **Bộ tài liệu Authoring Kit (`docs/authoring/`) & Giáo trình chính thức:** Nhập thông tin giáo trình do chủ dự án cung cấp vào `content/_shared/bibliography.yaml` và biên soạn các bài học xuất bản thật (Giai đoạn 7).
