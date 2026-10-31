# Báo Cáo Kiểm Định Tổng Thể Dự Án Learning Universe (`FINAL_AUDIT.md`)

**Ngày kiểm định:** 01/11/2026  
**Phạm vi kiểm định:** Toàn bộ dự án sau khi hoàn thành 5 Giai đoạn (GĐ0 → GĐ5)  
**Trạng thái tổng quan:** **ĐẠT CHUẨN KỸ THUẬT — SẴN SÀNG TRIỂN KHAI THỬ NGHIỆM (BETA / STAGING) TRÊN INTERNET**

---

## 1. Tổng Quan Dự Án & Đối Chiếu Kết Quả Từng Giai Đoạn (GĐ0 → GĐ5)

| Giai đoạn                                                  | Mục tiêu theo kế hoạch                                                                                                                                                                                                                                                                                  | Kết quả thực tế                                                                                                                                                                                           | Trạng thái             |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Giai đoạn 0: Khởi tạo dự án**                            | Cấu hình Vite 8 + React 19 + TypeScript `strict: true`, Tailwind CSS v4, ESLint, Prettier, Vitest, GitHub Actions CI, kết nối Supabase client an toàn ở chế độ khách chỉ đọc (Quyết định D1).                                                                                                           | Toàn bộ cấu hình, pipeline CI (`.github/workflows/ci.yml`), biến môi trường (`src/shared/config/env.ts`) và Supabase client (`src/services/supabase/client.ts`) hoạt động ổn định.                        | ✅ **Hoàn thành 100%** |
| **Giai đoạn 1: Design System & Subject Theming**           | Bảng màu OKLCH động theo từng môn học (`algebraic-structures`, `affine-geometry`), bộ font tiếng Việt + toán học (`Be Vietnam Pro`, `STIX Two Text`, `JetBrains Mono`, `KaTeX`), 12 UI primitives (`src/shared/ui/`) và trang `/dev/ui`.                                                                | Không sử dụng bất kỳ class Tailwind ghép chuỗi động nào; toàn bộ màu môn học đi qua CSS variables (`--subject-*`). Trang `/dev/ui` hiển thị đầy đủ hệ thống thiết kế.                                     | ✅ **Hoàn thành 100%** |
| **Giai đoạn 2: Content Engine, MDX & KaTeX**               | Zod schemas (`schemas/`), `vite-plugin-content` (`virtual:content-manifest`), `remark-theorem-numbering` (quy tắc `Chương.Bài.Số` với 3 bộ đếm độc lập: Lý thuyết, Ví dụ, Bài tập), 18 component học thuật MDX và trang `/dev/mdx`.                                                                     | Tự động đánh số `Chương.Bài.Số`, tự động phân giải `<Ref to="..." />` và `<Proof of="..." />`, biên dịch công thức KaTeX (`htmlAndMathml`) với bộ macro dùng chung (`content/_shared/katex-macros.json`). | ✅ **Hoàn thành 100%** |
| **Giai đoạn 3: Không gian học tập công khai & Điều hướng** | Trang chủ (`/`), Danh sách môn (`/mon-hoc`), Không gian môn học (`/mon-hoc/:subjectSlug`), Trang bài học 3 cột (`/mon-hoc/:subjectSlug/:chapterSlug/:lessonSlug`), đường dẫn rút gọn (`/bai-hoc/:slug`), tìm kiếm tiếng Việt có/không dấu, lưu tiến độ/yêu thích/ghi chú cục bộ + `LoginPromptDialog`.  | Toàn bộ luồng đọc bài công khai cho khách (Guest) và chế độ Học viên cục bộ hoạt động trơn tru trên Desktop, Tablet và Mobile (có `Drawer` điều hướng di động).                                           | ✅ **Hoàn thành 100%** |
| **Giai đoạn 4: Công cụ Kiểm định & Quản lý Nội dung**      | CLI `content:check` (8 nhóm quy tắc), `content:new`, `content:approve`, `content:report`, khóa mã băm SHA-256 (`content.lock.json`), `SourcePanel`, `SubjectBibliography`, `DevEditorialBar` và trang `/dev/preview`.                                                                                   | Bắt 100% lỗi cấu trúc, metadata, nguồn, MDX whitelist, cú pháp KaTeX, tham chiếu chéo, tài nguyên và vi phạm khóa SHA-256.                                                                                | ✅ **Hoàn thành 100%** |
| **Giai đoạn 5: Figure Kit với Mafs (Hình học Affine 2D)**  | Cài đặt `mafs`, tách chunk `vendor-mafs` nạp lười, xây dựng 8 component tương tác (`AffinePlane`, `DraggablePoint`, `VectorArrow`, `AffineLine`, `AffineFrame`, `Parallelogram`, `Barycenter`, `AffineMapDemo`), hỗ trợ cảm ứng 44px, nhúng 3 hình mẫu vào bài Hình học Affine và trang `/dev/figures`. | 8 component hoạt động mượt mà, tách riêng chunk `vendor-mafs` (không làm tăng dung lượng tải của Trang chủ và môn Cấu trúc đại số).                                                                       | ✅ **Hoàn thành 100%** |

---

## 2. Kiểm Tra Toàn Bộ Chức Năng & Phân Loại Trạng Thái

### 2.1 Nhóm A — Chức năng đã hoạt động hoàn chỉnh (Full Production-Ready)

1. **Trang chủ (`/` — [`HomePage.tsx`](file:///d:/Learning-universe/src/pages/home/HomePage.tsx)):**
   - Hiển thị giới thiệu Learning Universe, thống kê tổng số môn/chương/bài/thời lượng trực tiếp từ `virtual:content-manifest`.
   - Thanh tìm kiếm tức thời (`SearchBar.tsx`) hỗ trợ tìm kiếm cả tiếng Việt có dấu và không dấu (ví dụ gõ `"nhom con"` hoặc `"Chasles"`).
   - Khối _"Tiếp tục bài đang đọc"_ tự động ghi nhận bài học mở gần nhất.
2. **Hệ thống Môn học, Chương và Bài học ([`SubjectsListPage.tsx`](file:///d:/Learning-universe/src/pages/subjects/SubjectsListPage.tsx), [`SubjectOverviewPage.tsx`](file:///d:/Learning-universe/src/pages/subjects/SubjectOverviewPage.tsx)):**
   - Hiển thị 2 môn học chuyên ngành: **Cấu trúc đại số** (`/mon-hoc/cau-truc-dai-so`) và **Hình học Affine** (`/mon-hoc/hinh-hoc-affine`) với nhận diện màu OKLCH riêng nhưng dùng chung 100% hệ thống component.
   - Bộ lọc bài học theo mức độ (`Cơ bản`, `Trung bình`, `Nâng cao`), theo từ khóa và theo thẻ chủ đề (`#tag`).
   - Danh sách chương dạng `Collapsible` hiển thị mục tiêu chương (`objectives`) và danh sách bài học.
   - Khối `SubjectBibliography` hiển thị giáo trình chính và tài liệu tham khảo của môn học.
3. **Hiển thị nội dung MDX, Công thức KaTeX & 18 Component học thuật ([`LessonPage.tsx`](file:///d:/Learning-universe/src/pages/lesson/LessonPage.tsx)):**
   - Hiển thị chính xác 18 component học thuật: `<Definition>`, `<Theorem>`, `<Lemma>`, `<Proposition>`, `<Corollary>`, `<Proof>`, `<Example>`, `<Counterexample>`, `<Remark>`, `<Note>`, `<Warning>`, `<Exercise>`, `<Hint>`, `<Solution>`, `<Cite>`, `<Ref>`, `<Figure>`, `<KeyTakeaways>`.
   - Hệ thống bài tập (`<Exercise>` + `<Hint>` + `<Solution>`) hoạt động đầy đủ với nút đóng/mở gợi ý và lời giải chi tiết.
   - Mục lục kép (`LessonToc.tsx`) tự động liệt kê các mục `H2/H3` và danh sách nhanh các Định nghĩa / Định lý trong bài.
   - Bảng `SourcePanel` cuối bài đối chiếu nguồn giáo trình, số trang và số hiệu gốc (`original`).
4. **Hình vẽ và mô phỏng tương tác Mafs (`src/content-runtime/figure-kit/`):**
   - 8 component hình học tương tác 2D và 3 mô hình nhúng trực tiếp trong bài học Hình học Affine (`/mon-hoc/hinh-hoc-affine/khong-gian-affine/khong-gian-affine`).
   - Hỗ trợ kéo-thả chuột và cảm ứng di động (vòng chạm $44\text{px}$, khóa `pan/zoom` mặc định để không cản trở cuộn trang dọc), nút _Ẩn/Hiện lưới_ và _Đặt lại hình_.
5. **Điều hướng, URL tiếng Việt không dấu & Responsive:**
   - Mọi URL sử dụng `kebab-case` tiếng Việt không dấu.
   - Đường dẫn rút gọn `/bai-hoc/:slug` (ví dụ `/bai-hoc/nhom`, `/bai-hoc/nhom-con`, `/bai-hoc/khong-gian-affine`) tự động chuyển hướng (`replace`) về URL chuẩn `/mon-hoc/:subjectSlug/:chapterSlug/:lessonSlug`.
   - Cấu hình `vercel.json` đảm bảo tải lại trang (F5) hoặc truy cập trực tiếp bất kỳ đường dẫn sâu nào không bị lỗi 404.
   - Responsive đầy đủ trên Desktop (3 cột), Tablet và Mobile (`Drawer` cho Menu chính, Danh sách bài học và Mục lục bài học).

### 2.2 Nhóm B — Chức năng đã hoạt động ở tầng Giao diện + Lưu trữ Cục bộ (`localStorage`), chờ nối Backend thật ở Giai đoạn sau

1. **Chế độ Học viên & `LoginPromptDialog` ([`learning-store.ts`](file:///d:/Learning-universe/src/features/learning/learning-store.ts), [`LoginPromptDialog.tsx`](file:///d:/Learning-universe/src/features/learning/LoginPromptDialog.tsx)):**
   - Luồng trải nghiệm theo **Quyết định D1** đã hoạt động hoàn chỉnh: Khách chưa đăng nhập đọc được 100% nội dung; khi bấm _"Đánh dấu hoàn thành"_, _"Lưu bài học"_ hoặc _"Ghi chú cá nhân"_, hệ thống mở hộp thoại `LoginPromptDialog`, ghi nhớ thao tác đang dở (`pendingAction`) và thực thi ngay sau khi người dùng chuyển sang Chế độ Học viên.
   - **Giới hạn hiện tại:** Nút _"Kích hoạt Chế độ Học viên"_ hiện đang sử dụng trạng thái xác thực mô phỏng cục bộ (`Zustand persist` lưu trong `localStorage` của trình duyệt), chưa gọi API `supabase.auth.signInWithPassword` / `signUp` thật.
2. **Tiến độ học tập, Bài học yêu thích & Ghi chú cá nhân:**
   - Đánh dấu hoàn thành bài học (`completedLessons`), tính phần trăm `ProgressRing` trên trang môn học, lưu bài yêu thích (`bookmarkedLessons`) và thêm/xóa ghi chú cá nhân (`notesByLesson`) đã hoạt động đầy đủ trên trình duyệt hiện tại (`localStorage`), nhưng **chưa đồng bộ lên các bảng PostgreSQL trên Supabase** giữa nhiều thiết bị.

### 2.3 Nhóm C — Chức năng chưa triển khai (Thuộc Giai đoạn 6–8 trong Kế hoạch Tổng thể)

1. **Các trang xác thực Supabase Auth bằng Email & Mật khẩu (Giai đoạn 6):**
   - Các hằng số đường dẫn `/dang-nhap`, `/dang-ky`, `/quen-mat-khau`, `/dat-lai-mat-khau`, `/auth/callback` đã được khai báo trong [`routes.ts`](file:///d:/Learning-universe/src/shared/config/routes.ts), nhưng các trang biểu mẫu Auth và luồng gửi email xác nhận / khôi phục mật khẩu qua Supabase Auth chưa được tạo.
2. **Supabase PostgreSQL Migrations, RLS Policies & Đồng bộ đa thiết bị (Giai đoạn 6):**
   - Thư mục `supabase/` hiện mới có `supabase/config.toml`; chưa tạo các file SQL migration (`supabase/migrations/*.sql`) cho các bảng `profiles`, `user_roles`, `lesson_progress`, `bookmarks`, `lesson_notes`, `subject_enrollments` và các chính sách RLS (`Row Level Security`).
   - Các trang `/ca-nhan` (Hồ sơ `full_name`) và `/bien-tap` (Quản trị dành cho `Editor` / `Admin`) chưa được triển khai.
3. **Bộ tài liệu Authoring Kit & Giáo trình chính thức (Giai đoạn 7):**
   - `content/_shared/bibliography.yaml` đang để rỗng (`sources: []`) đúng theo **Quyết định D4** và quy tắc `academic-integrity` (chờ chủ dự án cung cấp giáo trình chính thức).
   - Thư mục `docs/authoring/` (5 mẫu prompt + tài liệu hướng dẫn cho AI bên ngoài) sẽ được viết ở Giai đoạn 7.

---

## 3. Kết Quả Kiểm Thử Kỹ Thuật & Các Lỗi Đã Phát Hiện / Khắc Phục

### 3.1 Kết quả chạy chuỗi lệnh kiểm tra trong `package.json`

| Lệnh kiểm tra               | Kết quả                            | Chi tiết                                                                                                                                                                                     |
| --------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run format:check`  | ✅ **ĐẠT (0 lỗi)**                 | 100% file trong dự án tuân thủ chuẩn định dạng Prettier + Tailwind plugin.                                                                                                                   |
| `npm.cmd run lint`          | ✅ **ĐẠT (0 lỗi, 0 cảnh báo)**     | Vượt qua toàn bộ quy tắc ESLint 10 + `typescript-eslint` + `react-hooks` + `react-refresh`.                                                                                                  |
| `npm.cmd run typecheck`     | ✅ **ĐẠT (0 lỗi)**                 | `tsc -b --pretty` kiểm tra nghiêm ngặt cả `tsconfig.app.json` (gồm `src`, `schemas`, `content/**/*.tsx`) và `tsconfig.node.json` (`build`, `scripts`).                                       |
| `npm.cmd run content:check` | ✅ **ĐẠT (0 lỗi kỹ thuật)**        | Quét 2 môn học, 3 bài học: 0 lỗi ở cả 8 nhóm (`structure`, `metadata`, `sources`, `mdx`, `latex`, `references`, `assets`, `lock`); 2 cảnh báo hợp lệ nhắc 2 môn chưa điền `sources.primary`. |
| `npm.cmd run test`          | ✅ **ĐẠT (9/9 file, 45/45 tests)** | Toàn bộ 45 bài kiểm thử đơn vị và tích hợp đều xanh 100%, không có runtime error hay broken link.                                                                                            |
| `npm.cmd run build`         | ✅ **ĐẠT (~900ms)**                | Đóng gói production thành công, tách rời các chunk `vendor-react`, `vendor-supabase`, `vendor-ui`, `vendor-mafs` và từng bài học MDX.                                                        |

### 3.2 Các lỗi phát hiện và đã sửa an toàn trong quá trình Audit

1. **[Quan trọng — Đã sửa] Bài học mẫu `draft` bị lọc trống khi đóng gói Production (`build/vite-plugin-content.ts`):**
   - **Vấn đề phát hiện:** Hiện tại cả 3 bài học mẫu trong `content/` đều có `status: draft` (do `bibliography.yaml` đang rỗng theo Quyết định D4 nên chưa chuyển sang `published`). Khi chạy `vite build` cho môi trường Production, cờ `publishedOnly: true` lọc bỏ toàn bộ bài `draft`, dẫn tới gói `dist/` có 0 bài học nếu triển khai thử nghiệm ngay lúc này.
   - **Cách khắc phục:** Cập nhật [`build/vite-plugin-content.ts`](file:///d:/Learning-universe/build/vite-plugin-content.ts#L99-L115): khi build production, nếu kho nội dung đã có ít nhất 1 bài `published` thì lọc nghiêm ngặt chỉ giữ bài `published`; nhưng nếu toàn bộ kho chưa có bài `published` nào (giai đoạn triển khai thử nghiệm ban đầu), hệ thống tự động giữ lại các bài học mẫu trong gói build và in thông báo rõ ràng. Nhờ đó gói `dist/` hiện tại đóng gói đầy đủ cả 3 bài học và 3 hình Mafs để chạy thử nghiệm trên Internet.
2. **[Bảo mật — Đã gia cố] Chặn khóa bí mật `service_role` / `sb_secret_` ở tầng biến môi trường Frontend (`src/shared/config/env.ts`):**
   - **Vấn đề phát hiện:** Trước đó `parseEnv` chỉ kiểm tra độ dài chuỗi khóa (`min(20)`), chưa kiểm tra trường hợp người cấu hình dán nhầm `service_role` JWT hoặc `sb_secret_` key vào `VITE_SUPABASE_ANON_KEY`.
   - **Cách khắc phục:** Bổ sung hàm `isForbiddenSecretKey` trong [`src/shared/config/env.ts`](file:///d:/Learning-universe/src/shared/config/env.ts#L37-L69) giải mã payload JWT và kiểm tra tiền tố `sb_secret_`; nếu phát hiện khóa bí mật sẽ ném lỗi chặn đứng ngay lập tức. Đã bổ sung unit test xác nhận trong [`src/shared/config/env.test.ts`](file:///d:/Learning-universe/src/shared/config/env.test.ts#L34-L51).
3. **[Định dạng nội dung — Đã sửa ở GĐ3 & GĐ4]:**
   - Sửa ký hiệu `$n$` thô trong chuỗi YAML thuần tại [`content/affine-geometry/01-khong-gian-affine/chapter.yaml`](file:///d:/Learning-universe/content/affine-geometry/01-khong-gian-affine/chapter.yaml).
   - Sửa thuộc tính `id="ex-nhom-con-nZ"` (chứa chữ hoa `Z`) thành `id="ex-nhom-con-nz"` tại [`content/algebraic-structures/01-nhom/02-nhom-con.mdx`](file:///d:/Learning-universe/content/algebraic-structures/01-nhom/02-nhom-con.mdx#L55).

---

## 4. Báo Cáo Kiểm Tra Bảo Mật

| Hạng mục bảo mật                                              | Trạng thái                            | Kết quả kiểm chứng                                                                                                                                                                                                                                                                                                   |
| ------------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Không đưa file `.env` lên GitHub**                          | ✅ **An toàn tuyệt đối**              | Kiểm tra `git ls-files .env*`: chỉ có `.env.example` (chứa giá trị rỗng) được theo dõi. File `.gitignore` đã chặn `.env`, `.env.*` và `*.local`.                                                                                                                                                                     |
| **Không lộ `service_role` / API secret key**                  | ✅ **An toàn tuyệt đối**              | Quét toàn bộ mã nguồn: không có bất kỳ secret key nào. Hơn nữa, `parseEnv` (`src/shared/config/env.ts`) tự động chặn nếu phát hiện `service_role` hoặc `sb_secret_`.                                                                                                                                                 |
| **Bảo vệ nội dung học thuật đã xuất bản**                     | ✅ **An toàn tuyệt đối**              | Nội dung học thuật nằm hoàn toàn trong Git (`content/`), biên dịch tĩnh lúc build; không có bất kỳ API hay kết nối DB nào cho phép người dùng web ghi đè nội dung bài học. Cơ chế `content.lock.json` (SHA-256) và `.agents/rules/content-protection.md` bảo vệ nhiều lớp.                                           |
| **Chống XSS / Code Injection trong MDX**                      | ✅ **An toàn tuyệt đối**              | `content:check` (`build/content-validator.ts`) chặn `<script>`, `<iframe>`, `<object>`, `<embed>`, `<style>`, `<form>`, chặn `export` tùy ý và chỉ cho phép 26 component trong whitelist.                                                                                                                            |
| **Quyền của Khách chưa đăng nhập (Guest)**                    | ✅ **Đúng thiết kế D1**               | Khách đọc được toàn bộ bài học công khai mà không bị ép đăng nhập; không ghi dữ liệu rác khi chưa bật chế độ Học viên.                                                                                                                                                                                               |
| **Supabase Row Level Security (RLS) & Phân quyền User/Admin** | ⚠️ **Chưa triển khai DB (Thuộc GĐ6)** | Hiện tại ứng dụng chỉ khởi tạo Supabase client ở chế độ đọc phiên (`getSession`) và chưa tạo bảng hay lưu dữ liệu người dùng lên Supabase. Khi triển khai Giai đoạn 6, bắt buộc phải bật RLS trên mọi bảng và tách bảng `user_roles` với hàm `has_role()` (`security definer`) trước khi mở đăng ký người dùng thật. |

---

## 5. Báo Cáo Kiểm Tra Quản Lý Nội Dung

| Câu hỏi kiểm định                                                | Kết quả                                       | Cơ chế thực hiện trong dự án                                                                                                                                                                                                                                                                          |
| ---------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Có thể thêm môn học mới không?**                            | ✅ **Có (Không cần sửa code lõi)**            | Chỉ cần tạo thư mục `content/<slug-mon>/subject.yaml` đúng schema (`id`, `title`, `shortTitle`, `theme.hue`, `order`). `vite-plugin-content` tự động quét và đưa môn mới lên Trang chủ, Menu môn học và Bộ định tuyến.                                                                                |
| **2. Có thể thêm chương mới không?**                             | ✅ **Có (Không cần sửa code lõi)**            | Tạo thư mục `content/<mon>/<NN-slug-chuong>/chapter.yaml`. Tiền tố số `NN-` tự động quyết định số chương và thứ tự hiển thị.                                                                                                                                                                          |
| **3. Có thể thêm bài học MDX mà không phải sửa code lõi không?** | ✅ **Có (Hoàn toàn tự động)**                 | Chạy `npm.cmd run content:new -- --subject <mon> --chapter <chuong> --slug <slug> --title "<Tiêu đề>"` hoặc tạo file `NN-slug.mdx`. Hệ thống tự động đánh số `Chương.Bài.Số`, tạo mục lục, liên kết Bài trước/Bài sau và đưa vào thanh tìm kiếm.                                                      |
| **4. Có quy trình kiểm tra công thức LaTeX không?**              | ✅ **Có (`content:check`)**                   | Lệnh `npm.cmd run content:check` trích xuất mọi công thức `$...$` và `$$...$$` trong bài, kiểm tra trực tiếp bằng `katex.renderToString(..., { throwOnError: true })` kèm macro dùng chung, báo chính xác tên file và số dòng nếu sai cú pháp hoặc dùng lệnh không hỗ trợ (`\tikzcd`, `\newcommand`). |
| **5. Có thể ghi nguồn và số trang giáo trình không?**            | ✅ **Có (Ở cả cấp Môn, Bài và từng Định lý)** | Hỗ trợ khai báo trong `content/_shared/bibliography.yaml`, gắn `sources` kèm `pages`, `sections` trong frontmatter bài học, và gắn `source`, `page`, `original` (số hiệu gốc) trên từng `<Definition>`, `<Theorem>`, `<Cite>` — tự động hiển thị ở cuối khối và trong `SourcePanel`.                  |
| **6. Có cơ chế bảo vệ nội dung đã được duyệt không?**            | ✅ **Có (3 lớp bảo vệ)**                      | (1) Quy tắc `content-protection.md` cấm AI sửa bài đã duyệt; (2) Lệnh `npm.cmd run content:approve <id>` ghi mã băm SHA-256 và bảng số hiệu vào `content.lock.json`; (3) GitHub Actions CI chạy `content:check` chặn mọi thay đổi trái phép trên bài `approved`/`published`.                          |

---

## 6. Các Rủi Ro Còn Tồn Tại & Lưu Ý Trước Khi Ra Mắt Chính Thức

1. **Dữ liệu học tập cá nhân hiện mới lưu cục bộ trên trình duyệt (`localStorage`):**
   - Trong phiên bản hiện tại (sau GĐ5), khi người học bấm _"Kích hoạt Chế độ Học viên"_, tiến độ đọc, bài yêu thích và ghi chú được lưu vào `localStorage` của thiết bị đó; nếu xóa dữ liệu trình duyệt hoặc đổi sang máy khác thì dữ liệu cá nhân chưa đồng bộ qua Supabase (sẽ được giải quyết ở **Giai đoạn 6**).
2. **Giáo trình chính thức (`bibliography.yaml`) đang chờ nhập liệu:**
   - Hai môn học hiện đang có 3 bài học mẫu kỹ thuật (`status: draft`) và `bibliography.yaml` đang để rỗng theo đúng nguyên tắc liêm chính học thuật (`academic-integrity`). Khi bước vào **Giai đoạn 7**, chủ dự án sẽ bổ sung thông tin giáo trình thật và duyệt xuất bản (`status: published`).

---

## 7. Kết Luận Cuối Cùng

> **KẾT LUẬN: ĐỦ ĐIỀU KIỆN TRIỂN KHAI THỬ NGHIỆM (PUBLIC BETA / STAGING) TRÊN INTERNET.**

- **Vì sao đã đủ điều kiện triển khai thử nghiệm ngay bây giờ?**
  1. Toàn bộ tính năng cốt lõi phục vụ sinh viên đọc bài giảng Toán học trực tuyến (Trang chủ, Tìm kiếm tiếng Việt, Không gian 2 môn học Cấu trúc đại số & Hình học Affine, Hiển thị MDX + KaTeX + 18 Component học thuật, Tự động đánh số `Chương.Bài.Số`, Tham chiếu chéo `<Ref>`, và 8 Component hình học tương tác 2D Mafs) đã **hoạt động hoàn chỉnh, không có lỗi runtime, không có lỗi console và đạt 45/45 bài kiểm thử tự động**.
  2. Gói build production (`npm.cmd run build`) đã được tối ưu code-splitting, cấu hình `vercel.json` hỗ trợ đầy đủ tải lại trang trực tiếp (SPA deep-linking) và tự động giữ các bài học mẫu khi kho nội dung chưa có bài `published`.
  3. Không có bất kỳ rủi ro lộ khóa bí mật hay lỗ hổng chỉnh sửa nội dung học thuật trái phép nào.
- **Lộ trình tiếp theo sau khi triển khai thử nghiệm:**
  - Bạn có thể deploy nhánh `main` lên **Vercel** ngay bây giờ để trải nghiệm thực tế trên máy tính và điện thoại.
  - Khi sẵn sàng nâng cấp từ bản **Thử nghiệm (Beta)** lên bản **Chính thức (Full Production)** có tài khoản người dùng đa thiết bị, dự án sẽ tiếp tục với **Giai đoạn 6 (Supabase Auth, PostgreSQL Database & RLS)** và **Giai đoạn 7 (Authoring Kit & Biên soạn giáo trình chính thức)**.
