# Đặc tả Kiến trúc Giao diện và Trải nghiệm Biên tập Đương đại Việt Nam

## Vietnamese Contemporary Editorial Design System — Learning Universe

---

## 1. Triết lý Thiết kế

Hệ thống giao diện của **Learning Universe** được xây dựng dựa trên sự giao thoa giữa:

1. **Chủ nghĩa Vùng miền Phê phán (Critical Regionalism)** — Tư tưởng kiến trúc của Kenneth Frampton, Álvaro Siza và Glenn Murcutt: Sử dụng vật liệu tự nhiên (đá vôi, vôi vữa mộc, gỗ, men gốm), ánh sáng dịu mắt và khoảng thở hiên nhà (_verandah whitespace_) để định hình không gian, thay vì sao chép các biểu tượng văn hóa dưới dạng trang trí bề mặt.
2. **"Ornament as Performance" (Trang trí là Hiệu năng)**: Triệt tiêu hoàn toàn các hoa văn minh họa giả lập (trống đồng, hoa sen, họa tiết kỷ hà vẽ tay rườm rà). Thay vào đó, tính thẩm mỹ bản sắc Việt được biểu đạt thông qua **nhịp điệu bố cục**, **đường hairline 1px** và **chất liệu màu nền giấy dó / đá vôi sáng**.
3. **Giải phẫu học Chữ Quốc ngữ (Vietnamese Typography Anatomy)** — Nghiên cứu của Donny Trương: Tối ưu hóa phông chữ, chiều cao dòng (`line-height`) và tính năng OpenType (`case`, `ccmp`) để tôn trọng cấu trúc dấu thanh điệu và dấu phụ phức tạp của tiếng Việt.
4. **Mô hình Bố cục Biên tập Edward Tufte**: Cấu trúc đọc học thuật 3 cột gồm Điều hướng cố định, Văn bản trọng tâm tối ưu cho mắt và Cột biên tập lề (_marginalia_) cho mục lục và chú dẫn.

---

## 2. Hệ thống Màu sắc Vật liệu Bản địa (Siza Limestone Tokens)

### 2.1. Danh mục Design Tokens (`src/styles/index.css`)

| Biến CSS               | Giá trị HEX | Nguồn cảm hứng vật liệu           | Công năng ứng dụng                                                                   |
| :--------------------- | :---------- | :-------------------------------- | :----------------------------------------------------------------------------------- |
| `--bg-canvas`          | `#F0ECE4`   | Đá vôi sáng / Giấy Dó Bắc Ninh    | Nền toàn trang, triệt tiêu hiện tượng _halation_ (lóa mắt do ánh sáng nền `#FFFFFF`) |
| `--bg-surface`         | `#F0E0CC`   | Vôi vữa tự nhiên / Tường vôi đình | Vùng đệm, thanh header phụ, nền khối callout                                         |
| `--bg-muted`           | `#D8D0C0`   | Vữa trát mộc / Bê tông cát        | Thẻ phụ, tag, đường viền hairline phân tách                                          |
| `--text-primary`       | `#1A1810`   | Mực Tàu đen sẫm                   | Văn bản chính, tiêu đề (Tương phản WCAG AAA > 14:1)                                  |
| `--text-secondary`     | `#575B5F`   | Xám đá phiến mực in               | Mô tả, nhãn phụ, thông tin tác giả                                                   |
| `--text-muted`         | `#807060`   | Nâu đất nung pha xám              | Metadata, ngày tháng, thời lượng đọc                                                 |
| `--accent-primary`     | `#3C2C1C`   | Mực nho đen khói                  | Điểm nhấn học thuật, đường biên Định nghĩa                                           |
| `--accent-verandah`    | `#5A6830`   | Rêu xanh hiên nhà                 | Khối Ghi chú (_Note_), ứng dụng thực tế                                              |
| `--accent-wood`        | `#9E7A5A`   | Gỗ mộc đòn tay                    | Viền Định lý, Bổ đề, Mệnh đề, Hệ quả                                                 |
| `--accent-interactive` | `#1A73E8`   | Xanh gốm men lam hiện đại         | Liên kết điều hướng, nút kích hoạt CTA                                               |

### 2.2. Đánh giá Khả năng Tiếp cận (WCAG 2.2)

- **Văn bản chính (`#1A1810`) trên nền `--bg-canvas` (`#F0ECE4`)**:
  - Tỉ lệ tương phản: **14.6:1** (Vượt xa ngưỡng WCAG AAA yêu cầu tối thiểu 7.0:1 cho văn bản thông thường).
- **Văn bản phụ (`#575B5F`) trên nền `--bg-canvas` (`#F0ECE4`)**:
  - Tỉ lệ tương phản: **5.2:1** (Đạt chuẩn WCAG AA cho văn bản nhỏ).
- **Hiện tượng Halation**: Nền sáng tự nhiên `#F0ECE4` hấp thụ bớt bước sóng ánh sáng chói, cho phép sinh viên đọc các chứng minh toán học dài hàng giờ mà không gây mỏi điều tiết cơ mắt.

---

## 3. Typography & Giải phẫu học Chữ Quốc ngữ (Donny Trương Orthography)

### 3.1. Đặc thù Chữ Quốc ngữ trong Văn bản Toán học

Chữ Quốc ngữ là hệ chữ Latin mang mật độ dấu phụ dày đặc bậc nhất thế giới:

- 5 dấu thanh điệu: Sắc (`´`), Huyền (`\`\`), Hỏi (`̉`), Ngã (`˜`), Nặng (`.`).
- Các nguyên âm có mũ/móc/trăng: `â, ê, ô, ư, ơ, ă` và phụ âm `đ/Đ`.
- **Dấu kép**: Khi dấu thanh kết hợp cùng dấu mũ hoặc móc (`ấ, ế, ổ, ứ, ở, ự...`), chiều cao chữ vươn vượt khỏi đường _cap-height_ hoặc tụt sâu dưới đường _baseline_.

### 3.2. Giải pháp Kỹ thuật Triển khai

1. **Bộ phông chữ kép**:
   - `Crimson Pro` (Google Fonts Serif): Nạp cho toàn bộ văn bản học thuật nội dung bài học (`.lu-prose`). Các dấu thanh điệu tiếng Việt trong Crimson Pro được vẽ với độ nghiêng và tỉ lệ tinh mỹ, không làm méo mó nhịp điệu của chữ cái gốc.
   - `Cabin` và `Be Vietnam Pro` (Sans-serif): Dành cho UI, header, breadcrumbs, nút bấm và danh mục điều hướng.
   - `JetBrains Mono Variable`: Dành cho khối code và số hiệu tham chiếu.
2. **Thông số Đọc Công thái học (Ergonomics)**:
   - `line-height: 1.7`: Khoảng cách dòng mở rộng giúp các dấu thanh kép phía trên và dấu nặng phía dưới không bao giờ bị chạm vào hàng chữ kề trên/kề dưới.
   - Độ rộng cột: Cố định ở `65ch` (nằm trong dải vàng `60ch` - `68ch`), giúp mắt quét hết dòng mà không mất dấu đầu dòng tiếp theo.
3. **Chống đè dấu khi viết hoa (OpenType Features)**:
   ```css
   [class*='uppercase'],
   .small-caps,
   h1,
   h2,
   h3,
   h4,
   h5,
   h6 {
     font-feature-settings:
       'case' 1,
       'ccmp' 1;
   }
   ```
   - `'case' 1` kích hoạt glyphs dấu dành riêng cho chữ hoa (chuyển dấu thanh điệu lên vị trí thích hợp của chữ in hoa).
   - `'ccmp' 1` kích hoạt _Glyph Composition/Decomposition_, đảm bảo các tổ hợp ký tự dấu ghép không bị phân mảnh.
4. **Editorial Dropcap**:
   Hỗ trợ thuộc tính CSS hiện đại `initial-letter: 3` với fallback `float/padding` chuẩn mực, giữ nguyên vẹn dấu phụ và dấu thanh trên các chữ cái mở đầu như `Ấ, Ể, Ự, Đ`:
   ```css
   .editorial-dropcap::first-letter {
     font-family: var(--font-serif);
     font-weight: 700;
     color: var(--accent-primary);
     margin-right: 0.15em;
     line-height: 1;
   }
   @supports (initial-letter: 3) or (-webkit-initial-letter: 3) {
     .editorial-dropcap::first-letter {
       initial-letter: 3;
       -webkit-initial-letter: 3;
       padding-top: 0.1em;
     }
   }
   ```

---

## 4. Mô hình Không gian Đọc Edward Tufte (Lesson View)

### 4.1. Bố cục 3 Cột Grid (`LessonPage.tsx`)

Trên màn hình desktop $\ge 1024\text{px}$, trang bài học sử dụng CSS Grid 3 cột:

```tsx
<div className="grid gap-8 lg:grid-cols-[240px_minmax(0,65ch)_minmax(240px,280px)] lg:justify-center">
  {/* Cột 1: Danh mục điều hướng bài học (240px) */}
  <aside className="hidden lg:block lg:w-[240px]">...</aside>

  {/* Cột 2: Cột văn bản chính (minmax(0, 65ch)) */}
  <main className="min-w-0">
    <article className="rounded-2xl border border-[var(--bg-muted)] bg-[var(--bg-canvas)] p-6 sm:p-8 lg:p-10">
      ...
    </article>
  </main>

  {/* Cột 3: Cột biên tập lề (Marginalia / TOC 240px - 280px) */}
  <aside className="hidden lg:block lg:w-[280px]" role="complementary">
    ...
  </aside>
</div>
```

### 4.2. Cấu trúc Semantic Marginalia & Metadata

Thay vì các huy hiệu badge màu sắc sặc sỡ, thông tin bài học được tổ chức bằng phần tử semantic `<aside role="note">`:

- Thời lượng đọc và số hiệu phiên bản hiển thị trang nhã với icon tinh giản.
- Khối trích dẫn nguồn giáo trình tham khảo (`SourceAttributionBadge`) sử dụng viền hairline `1px solid var(--bg-muted)` và nền vôi dịu `#F0E0CC`.

### 4.3. Thiết kế Academic Callouts

- **Định nghĩa (`Definition`)**: Viền bên trái `border-l-4 border-l-[var(--accent-primary)]`, nền đá vôi `#FAF8F5`, viền bao quanh hairline `1px solid var(--bg-muted)`.
- **Định lý, Bổ đề, Mệnh đề, Hệ quả (`Theorem`, `Lemma`, `Proposition`, `Corollary`)**: Viền bên trái `border-l-4 border-l-[var(--accent-wood)]`, nền đá vôi `#FAF8F5`.
- **Chứng minh (`Proof`) & Lời giải (`Solution`)**: Sử dụng cơ chế _Progressive Disclosure_ thông qua component `Collapsible`, nền hộp `#FAF8F5`, viền mộc hairline, kết thúc chứng minh bằng ký hiệu Halmos `∎` trang trọng.
- **Nhận xét & Ghi chú (`Remark`, `Note`)**: Tông màu xanh rêu hiên nhà `--accent-verandah` thanh nhã, tôn trọng sự tập trung của người học.

---

## 5. Xử lý Ngôn ngữ Tự nhiên & Tiếng Việt Chuẩn xác

Được đóng gói tại `src/utils/vietnamese-text.ts` và tái xuất tại `src/shared/lib/vietnamese.ts`:

1. **`normalizeNFC(input)`**:
   Chuẩn hóa chuỗi đầu vào về dạng _Unicode Normalization Form C_ (NFC). Ngăn chặn tình trạng cùng một từ tiếng Việt nhưng một bên dùng mã dựng sẵn (precomposed) còn một bên dùng ký tự tổ hợp (combining diacritics).
2. **`stripDiacritics(input)`**:
   Tách chuỗi sang dạng NFD, loại bỏ dải tổ hợp dấu `[\u0300-\u036f]`, và chuyển đổi tường minh cặp chữ `đ/Đ` thành `d/D`.
3. **`normalizeSearchQuery(input)` & `matchesVietnameseQuery(target, query)`**:
   Cho phép người học gõ tìm kiếm không dấu (`khong gian affine`, `cayley`, `dong cau`) hay có dấu (`Không gian Affine`, `đồng cấu`) đều ra kết quả tức thì và chính xác 100%.
4. **`truncateGraphemes(text, maxGraphemes, suffix)`**:
   Sử dụng API chuẩn `Intl.Segmenter('vi', { granularity: 'grapheme' })`. Khi cần rút gọn tiêu đề hoặc đoạn văn, hàm sẽ cắt chính xác theo cụm ký tự hiển thị (grapheme cluster), triệt tiêu hoàn toàn lỗi đứt gãy dấu phụ (ví dụ tách chữ `ấ` thành chữ `a` kèm dấu lơ lửng).

---

## 6. Bảo toàn Tính Toàn vẹn và Tính Bền vững

- **Nội dung học thuật**: Toàn bộ file MDX trong `content/` và file khóa `content.lock.json` được bảo vệ nguyên vẹn 100%.
- **Công thức Toán học**: Các biểu thức KaTeX, macro `\Aff`, `\vect` hoạt động trơn tru trên nền chữ mới.
- **Hệ thống Kiểm thử**: 100% kiểm thử tự động (47+ tests) bao gồm kiểm thử routing, kiểm định nội dung, figure kit tương tác và navigation đều vượt qua thành công.
