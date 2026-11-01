# Bộ Mẫu Chuẩn: Nguồn Tham khảo, Bài học MDX và Bài tập A–B–C–D

> **Mục đích:** Cung cấp các mẫu chuẩn (`templates`) tương thích 100% với Zod Schema và `content-validator.ts` của Learning Universe để sao chép và sử dụng trực tiếp khi biên soạn môn **Cấu trúc đại số**.

---

## 1. Mẫu Khai báo Nguồn Tham khảo (Bibliography, Subject, Chapter, Frontmatter)

### 1.1. Mẫu `content/_shared/bibliography.yaml`

Theo quy tắc `bibliographySchema` (`schemas/bibliography.schema.ts`), mỗi mục tài liệu phải có đủ các trường bắt buộc `id`, `type`, `title`, `authors`, `year`, `publisher` (và không chứa chuỗi `TODO`, `???`, `<...>`):

```yaml
# Thư mục tài liệu dùng chung cho toàn bộ các môn học.
sources:
  - id: gt-ctds-hvk-2026
    type: textbook
    title: 'Giáo trình Cấu trúc Đại số: Nhóm • Vành • Trường (Đồng cấu, cấu trúc thương và các định lý đẳng cấu)'
    authors:
      - 'Huỳnh Việt Khánh'
    year: 2026
    publisher: 'Bản thảo giáo trình học phần Cấu trúc đại số (bản kết xuất ngày 10/10/2026)'
    edition: 'Bản ngày 10/10/2026'
    language: 'vi'
    numberingNote: 'Đánh số Định lý, Mệnh đề, Hệ quả, Ví dụ, Phản ví dụ chung theo từng chương (ví dụ: Định lý 1.8, Ví dụ 1.9); Bài tập đánh số riêng theo từng chương (ví dụ: Bài tập 1.1 đến 1.32).'
    note: '219 trang PDF (8 trang đầu i-viii + 211 trang nội dung 1-211). Trang PDF = Trang sách + 8.'

  - id: hai-deo-dai-so-hien-dai-2013
    type: reference-book
    title: 'Đại số hiện đại'
    authors:
      - 'Bùi Xuân Hải'
      - 'Trịnh Thanh Đèo'
    year: 2013
    publisher: 'NXB Đại học Quốc gia TP. Hồ Chí Minh'
    edition: 'Tái bản lần thứ nhất, có sửa chữa và bổ sung'
    language: 'vi'

  - id: hung-dai-so-dai-cuong-1999
    type: reference-book
    title: 'Đại số đại cương'
    authors:
      - 'Nguyễn Hữu Việt Hưng'
    year: 1999
    publisher: 'NXB Giáo dục'
    edition: 'Tái bản lần thứ nhất'
    language: 'vi'

  - id: bresar-undergraduate-algebra-2019
    type: reference-book
    title: 'Undergraduate Algebra: A Unified Approach'
    authors:
      - 'Matej Brešar'
    year: 2019
    publisher: 'Springer Nature Switzerland AG'
    isbn: '978-3-030-14052-6'
    language: 'en'

  - id: gallian-contemporary-abstract-algebra-2017
    type: reference-book
    title: 'Contemporary Abstract Algebra'
    authors:
      - 'Joseph A. Gallian'
    year: 2017
    publisher: 'Cengage Learning'
    edition: '9th ed.'
    isbn: '978-1-305-65796-0'
    language: 'en'

  - id: judson-abstract-algebra-2020
    type: reference-book
    title: 'Abstract Algebra: Theory and Applications'
    authors:
      - 'Thomas W. Judson'
    year: 2020
    publisher: 'Annual Edition 2020 (https://abstract.pugetsound.edu)'
    edition: 'Annual Edition 2020'
    language: 'en'
```

### 1.2. Mẫu `content/algebraic-structures/subject.yaml`

```yaml
id: algebraic-structures
slug: cau-truc-dai-so
title: Cấu trúc đại số
shortTitle: CTĐS
description: Nhóm, vành, miền nguyên, trường, cấu trúc thương và các định lý đẳng cấu dành cho sinh viên Sư phạm Toán học.
order: 1
status: published
theme:
  hue: 275
  icon: sigma
sources:
  primary: gt-ctds-hvk-2026
  references:
    - hai-deo-dai-so-hien-dai-2013
    - hung-dai-so-dai-cuong-1999
    - bresar-undergraduate-algebra-2019
    - gallian-contemporary-abstract-algebra-2017
    - judson-abstract-algebra-2020
```

### 1.3. Mẫu `chapter.yaml` (Ví dụ cho Chương 0 và Chương 1)

- **Lưu ý kỹ thuật cho Chương 0:** Trong `schemas/chapter.schema.ts`, trường tùy chọn `number` dùng `.positive()`. Do đó với thư mục `00-ngon-ngu-va-cong-cu-dai-so`, ta **không khai báo trường `number` trong `chapter.yaml`**; khi đó `scanChapter` và `remark-theorem-numbering` sẽ tự động lấy số `0` từ tiền tố thư mục `00-` và đánh số các khối là `0.1.1`, `0.1.2`, v.v. hoàn toàn hợp lệ!

```yaml
# File: content/algebraic-structures/00-ngon-ngu-va-cong-cu-dai-so/chapter.yaml
id: chuong-0-ngon-ngu-va-cong-cu-dai-so
title: 'Chương 0: Ngôn ngữ và công cụ đại số'
description: 'Hệ thống hóa ngôn ngữ ánh xạ, thớ, công cụ số học trên Z, quan hệ tương đương, tập thương và tiêu chuẩn xác định tốt.'
objectives:
  - 'Tính được ảnh, nghịch ảnh, thớ của ánh xạ và vận dụng thuật toán Euclid, đồng nhất thức Bézout, hàm Euler.'
  - 'Thiết lập được sự tương ứng hai chiều giữa quan hệ tương đương và phân hoạch của một tập hợp.'
  - 'Kiểm tra được tính xác định tốt khi định nghĩa ánh xạ hoặc phép toán hai ngôi trên tập thương.'
```

```yaml
# File: content/algebraic-structures/01-nhom-va-cac-vi-du-co-ban/chapter.yaml
id: chuong-1-nhom-va-cac-vi-du-co-ban
number: 1
title: 'Chương 1: Nhóm và các ví dụ cơ bản'
description: 'Từ phép biến hình khả nghịch đến các tiên đề nhóm, quy tắc giản ước, lũy thừa nguyên, bảng Cayley và 7 họ nhóm cơ bản.'
objectives:
  - 'Phân biệt được nửa nhóm, vị nhóm, nhóm và nhóm abel; vận dụng thành thạo quy trình 4 bước kiểm tra một nhóm.'
  - 'Chứng minh và áp dụng được tính duy nhất của đơn vị, nghịch đảo, luật giản ước và quy tắc lũy thừa nguyên.'
  - 'Tính toán thành thạo trên các họ nhóm chuẩn: Z, Z/nZ, U(n), Sym(X), Sn, D2n, GL2(R) và Aff(R).'
```

### 1.4. Mẫu trích dẫn nguồn trong thân bài MDX

1. **Trích dẫn trên khối lý thuyết (`Definition`, `Theorem`, `Proposition`, `Lemma`, `Corollary`):**

   ```mdx
   <Theorem
     id="thm-c1-b1-tinh-chat-co-ban-nhom"
     title="Các tính chất cơ bản trong một nhóm"
     original="Định lý 1.8"
     source="gt-ctds-hvk-2026"
     page="20"
   >
     ...
   </Theorem>
   ```

   _(Lưu ý: Thuộc tính `page` trên khối JSX có thể ghi `"20"` hoặc `"20-21"`; còn trong `frontmatter.sources`, trường `pages` chỉ nhận chữ số, dấu gạch ngang `-` và dấu phẩy `,` theo biểu thức `^\d+(?:-\d+)?(?:,\s*\d+(?:-\d+)?)*$`, ví dụ: `pages: "17-22"`)._

2. **Trích dẫn nội dòng bằng `<Cite />`:**
   ```mdx
   Theo quy ước chung của giáo trình <Cite source="gt-ctds-hvk-2026" page="18" note="Mục 1.2.1" />, khi làm việc với nhóm tổng quát ta ưu tiên dùng ký hiệu nhân.
   ```

---

## 2. Mẫu Bài học MDX Chuẩn (Đầy đủ 11 Thành phần Lý thuyết + 4 Nhóm Bài tập A, B, C, D)

Dưới đây là mẫu chuẩn hoàn chỉnh cho một bài học MDX (minh họa trên **Bài 1.1: Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên**). Mọi bài học trong môn Cấu trúc đại số đều phải tuân theo đúng cấu trúc này:

```mdx
---
id: nua-nhom-vi-nhom-va-tien-de-nhom
title: 'Nửa nhóm, vị nhóm, nhóm và các hệ quả đầu tiên'
description: 'Hình thành các tiên đề của nửa nhóm, vị nhóm, nhóm từ các phép biến đổi khả nghịch; chứng minh tính duy nhất của đơn vị, nghịch đảo, luật giản ước và giải phương trình bậc nhất trong nhóm.'
estimatedMinutes: 25
level: basic
prerequisites:
  - phep-toan-hai-ngoi-va-tinh-xac-dinh-tot
tags:
  - nửa nhóm
  - vị nhóm
  - nhóm
  - nhóm abel
  - luật giản ước
sources:
  - source: gt-ctds-hvk-2026
    pages: '17-22'
    sections: 'Mục 1.1, 1.2, 1.3'
    note: 'Tiên đề nhóm và Định lý 1.8 (trang 20)'
  - source: hai-deo-dai-so-hien-dai-2013
    pages: '15-24'
    sections: 'Chương 1, Mục 1.1'
status: draft
version: 0.1.0
authoring:
  aiAssisted: true
  tools:
    - 'Learning Universe Authoring Standard'
  draftedAt: '2026-11-01'
review:
  reviewer: null
  reviewedAt: null
---

<Note title="Mục tiêu bài học">
Sau khi hoàn thành bài học này, bạn có thể:

1. **Phân biệt chính xác** bốn cấu trúc có một phép toán hai ngôi: _nửa nhóm_, _vị nhóm_, _nhóm_ và _nhóm abel_.
2. **Thực hiện đúng** quy trình 4 bước có thứ tự để kiểm tra một tập hợp cùng phép toán cho trước có lập thành nhóm hay không.
3. **Chứng minh và vận dụng** các hệ quả đầu tiên của tiên đề nhóm: tính duy nhất của đơn vị và nghịch đảo, luật giản ước trái/phải, công thức nghịch đảo của tích $(ab)^{-1} = b^{-1}a^{-1}$ và tính song ánh của phép tịnh tiến.
   </Note>

**Kiến thức tiên quyết:** Trước khi bắt đầu, bạn cần nắm vững khái niệm _phép toán hai ngôi_, _tính kết hợp_, _phần tử đơn vị_ và _phần tử khả nghịch_ đã học ở Chương 0 (<Cite source="gt-ctds-hvk-2026" page="7-8" note="Mục 0.5" />).

## 1. Từ phép biến hình đến các tiên đề của Nhóm

Khi khảo sát các phép biến đổi hình học giữ nguyên một hình phẳng hay các song ánh trên một tập hợp $X$, ta nhận thấy ba đặc điểm nổi bật luôn xuất hiện cùng nhau (<Cite source="gt-ctds-hvk-2026" page="17" note="Mục 1.1" />):

- Thực hiện liên tiếp hai phép biến đổi rồi ghép với phép thứ ba theo cách nào cũng cho cùng một kết quả (**tính kết hợp**).
- Luôn có phép biến đổi giữ nguyên mọi điểm (**phần tử đơn vị**).
- Mọi phép biến đổi đều có thể "đi ngược lại" để khôi phục trạng thái ban đầu (**phần tử nghịch đảo**).

Việc tách riêng từng lớp tính chất trên dẫn đến hệ thống phân cấp các cấu trúc đại số có một phép toán hai ngôi.

<Definition
  id="def-c1-b1-nua-nhom-vi-nhom-nhom"
  title="Nửa nhóm, vị nhóm, nhóm và nhóm abel"
  original="Mục 1.2"
  source="gt-ctds-hvk-2026"
  page="18"
>
Cho $G$ là một tập hợp khác rỗng cùng với một phép toán hai ngôi $*: G \times G \to G, (x, y) \mapsto x * y$.

1. Cặp $(G, *)$ được gọi là một **nửa nhóm** (_semigroup_) nếu phép toán $*$ có **tính kết hợp**:
   $$
   (x * y) * z = x * (y * z), \quad \forall x, y, z \in G.
   $$
2. Một nửa nhóm $(G, *)$ được gọi là một **vị nhóm** (_monoid_) nếu tồn tại **phần tử đơn vị** $e \in G$ sao cho:
   $$
   e * x = x * e = x, \quad \forall x \in G.
   $$
3. Một vị nhóm $(G, *)$ với đơn vị $e$ được gọi là một **nhóm** (_group_) nếu mọi phần tử $x \in G$ đều có **phần tử nghịch đảo** $y \in G$ sao cho:
   $$
   x * y = y * x = e.
   $$
4. Một nhóm $(G, *)$ được gọi là **nhóm giao hoán** hay **nhóm abel** (_abelian group_) nếu phép toán $*$ có thêm tính giao hoán:
   $$
   x * y = y * x, \quad \forall x, y \in G.
   $$
   </Definition>

<Remark title="Đối chiếu ký hiệu nhân và ký hiệu cộng">
  Theo quy ước của giáo trình (<Cite source="gt-ctds-hvk-2026" page="18" note="Mục 1.2.1" />
  ), trong một nhóm tổng quát ta thường dùng **ký hiệu nhân**: viết $xy$ thay cho $x * y$, ký hiệu
  đơn vị là $e$ (hoặc $1, 1_G$) và nghịch đảo của $x$ là $x^{-1}$. Ngược lại, **ký hiệu cộng** $x +
  y$ chỉ được dùng khi nhóm đã biết là **giao hoán (abel)**; khi đó phần tử đơn vị được gọi là *phần
  tử không* (ký hiệu $0$ hoặc $0_G$) và nghịch đảo của $x$ được gọi là *phần tử đối* (ký hiệu $-x$).
</Remark>

<Figure caption="Bảng đối chiếu ngôn ngữ nhân và ngôn ngữ cộng trong lý thuyết nhóm (Giáo trình chính, tr. 18).">
  | Thành phần cấu trúc | Ký hiệu nhân (nhóm tổng quát) | Ký hiệu cộng (chỉ dùng cho nhóm abel) | |
  :--- | :---: | :---: | | Phép toán trên hai phần tử $x, y$ | $xy$ hoặc $x \cdot y$ | $x + y$ | |
  Phần tử đơn vị (trung hòa) | $e$ hoặc $1_G$ | $0$ hoặc $0_G$ | | Nghịch đảo / Phần tử đối của $x$
  | $x^{-1}$ | $-x$ | | Hệ thức nghịch đảo | $xx^{-1} = x^{-1}x = e$ | $x + (-x) = (-x) + x = 0$ | |
  Lũy thừa / Bội nguyên ($n \in \Z$) | $x^n$ | $nx$ |
</Figure>

<Note title="Quy trình 4 bước kiểm tra một nhóm theo thứ tự">
Khi cần chứng minh $(G, *)$ là một nhóm, ta luôn kiểm tra tuần tự theo 4 bước (<Cite source="gt-ctds-hvk-2026" page="19" note="Mục 1.2.3" />):

1. **Khác rỗng và tính đóng:** Chỉ ra $G \neq \varnothing$ và với mọi $x, y \in G$ thì $x * y \in G$.
2. **Tính kết hợp:** Kiểm tra $(x * y) * z = x * (y * z)$ với mọi $x, y, z \in G$.
3. **Phần tử đơn vị:** Tìm $e \in G$ (phải kiểm tra $e$ thực sự thuộc $G$) thỏa mãn $e * x = x * e = x$.
4. **Phần tử nghịch đảo:** Với mỗi $x \in G$, tìm $x^{-1} \in G$ (phải kiểm tra $x^{-1} \in G$) thỏa mãn $x * x^{-1} = x^{-1} * x = e$.

Không thể kiểm tra bước 4 nếu chưa xác định được phần tử đơn vị $e$ ở bước 3!

</Note>

<Example id="ex-c1-b1-nhom-bien-doi-tuyen-tinh-dich-chuyen" title="Kiểm tra cấu trúc nhóm trên tập số thực bỏ đi một điểm">
Trên tập hợp $G = \R \setminus \left\{\frac{1}{3}\right\}$, xét phép toán hai ngôi $*$ xác định bởi:

$$
x * y = x + y - 3xy, \quad \forall x, y \in G.
$$

Ta kiểm tra $(G, *)$ là một nhóm abel theo đúng quy trình 4 bước:

1. **Khác rỗng và tính đóng:** Rõ ràng $0 \in G$ nên $G \neq \varnothing$. Với mọi $x, y \in G$, ta có $1 - 3x \neq 0$ và $1 - 3y \neq 0$, suy ra:
   $$
   1 - 3(x * y) = 1 - 3(x + y - 3xy) = (1 - 3x)(1 - 3y) \neq 0.
   $$
   Do đó $x * y \neq \frac{1}{3}$, tức là $x * y \in G$.
2. **Tính kết hợp và giao hoán:** Với mọi $x, y, z \in G$, hiển nhiên $x * y = y * x$ và:
   $$
   (x * y) * z = (x + y - 3xy) + z - 3(x + y - 3xy)z = x + y + z - 3(xy + yz + zx) + 9xyz.
   $$
   Biểu thức này đối xứng giữa $x, y, z$ nên $(x * y) * z = x * (y * z)$.
3. **Phần tử đơn vị:** Ta có $0 \in G$ và $x * 0 = 0 * x = x + 0 - 0 = x$ với mọi $x \in G$. Vậy $e = 0$ là phần tử đơn vị.
4. **Phần tử nghịch đảo:** Với mỗi $x \in G$, phương trình $x * y = 0$ tương đương với $y(1 - 3x) = -x$, hay $y = \frac{-x}{1 - 3x}$ (xác định vì $x \neq \frac{1}{3}$). Hơn nữa:
   $$
   1 - 3y = 1 + \frac{3x}{1 - 3x} = \frac{1}{1 - 3x} \neq 0 \implies y \in G.
   $$
   Vậy mọi $x \in G$ đều có nghịch đảo $x^{-1} = \frac{-x}{1 - 3x} \in G$, nên $(G, *)$ là một nhóm abel.
   </Example>

<Counterexample
  id="cex-c1-b1-vi-nhom-khong-la-nhom"
  title="Vị nhóm có đơn vị nhưng không phải là nhóm"
>
  Xét tập các ma trận vuông cấp hai hệ số nguyên $M_2(\Z)$ với phép nhân ma trận thông thường. Phép
  nhân ma trận có tính kết hợp và có phần tử đơn vị là ma trận đơn vị $I_2 = \begin{pmatrix} 1 & 0
  \\ 0 & 1 \end{pmatrix} \in M_2(\Z)$, nên $(M_2(\Z), \cdot)$ là một vị nhóm. Tuy nhiên, ma trận $A
  = \begin{pmatrix} 2 & 0 \\ 0 & 1 \end{pmatrix} \in M_2(\Z)$ có $\det(A) = 2$ nên không có ma trận
  nghịch đảo hệ số nguyên. Vì vậy $(M_2(\Z), \cdot)$ không phải là một nhóm.
</Counterexample>

## 2. Những hệ quả đầu tiên của các tiên đề Nhóm

Trong <Ref to="def-c1-b1-nua-nhom-vi-nhom-nhom" />, các tiên đề chỉ yêu cầu _tồn tại_ phần tử đơn vị và phần tử nghịch đảo. Định lý dưới đây khẳng định tính duy nhất của chúng và cung cấp các quy tắc biến đổi đại số nền tảng nhất trong nhóm.

<Theorem
  id="thm-c1-b1-he-qua-tien-de-nhom"
  title="Các tính chất cơ bản trong một nhóm"
  original="Định lý 1.8"
  source="gt-ctds-hvk-2026"
  page="20"
>
Cho $(G, \cdot)$ là một nhóm. Khi đó:

1. **Tính duy nhất của đơn vị:** Phần tử đơn vị $e$ của $G$ là duy nhất.
2. **Tính duy nhất của nghịch đảo:** Với mỗi $a \in G$, phần tử nghịch đảo của $a$ là duy nhất, được ký hiệu là $a^{-1}$.
3. **Luật giản ước trái và phải:** Với mọi $a, x, y \in G$, nếu $ax = ay$ thì $x = y$; nếu $xa = ya$ thì $x = y$.
4. **Nghiệm duy nhất của phương trình bậc nhất:** Với mọi $a, b \in G$, phương trình $ax = b$ có nghiệm duy nhất $x = a^{-1}b$, và phương trình $ya = b$ có nghiệm duy nhất $y = ba^{-1}$.
5. **Nghịch đảo của nghịch đảo và nghịch đảo của tích:** Với mọi $a, b \in G$, ta có:
   $$
   (a^{-1})^{-1} = a \quad \text{và} \quad (ab)^{-1} = b^{-1}a^{-1}.
   $$
   </Theorem>

<Proof of="thm-c1-b1-he-qua-tien-de-nhom" defaultOpen={true}>
  1. Giả sử $e$ và $e'$ đều là phần tử đơn vị của $G$. Vì $e$ là đơn vị nên $ee' = e'$; vì $e'$ là
  đơn vị nên $ee' = e$. Suy ra $e = e'$. 2. Giả sử $u, v \in G$ đều là phần tử nghịch đảo của $a$.
  Áp dụng tính kết hợp: $$ u = ue = u(av) = (ua)v = ev = v. $$ Do đó nghịch đảo của $a$ là duy nhất.
  3. Giả sử $ax = ay$. Nhân $a^{-1}$ vào bên trái hai vế và dùng tính kết hợp: $$ x = ex = (a^{-1}
  a)x = a^{-1}(ax) = a^{-1}(ay) = (a^{-1}a)y = ey = y. $$ Trường hợp $xa = ya$ được chứng minh tương
  tự bằng cách nhân $a^{-1}$ vào bên phải. 4. Thay $x = a^{-1}b$ vào vế trái của $ax = b$, ta được
  $a(a^{-1}b) = (aa^{-1})b = eb = b$, nên $x = a^{-1}b$ là một nghiệm. Ngược lại, nếu $x \in G$ thỏa
  mãn $ax = b$ thì $ax = a(a^{-1}b)$, theo luật giản ước trái ở ý (3) ta suy ra $x = a^{-1}b$.
  Phương trình $ya = b$ chứng minh hoàn toàn tương tự. 5. Vì $aa^{-1} = a^{-1}a = e$, theo tính duy
  nhất của nghịch đảo ở ý (2), phần tử nghịch đảo của $a^{-1}$ chính là $a$, tức $(a^{-1})^{-1} =
  a$. Tiếp theo, xét tích $(ab)(b^{-1}a^{-1})$: $$ (ab)(b^{-1}a^{-1}) = a(bb^{-1})a^{-1} = aea^{-1}{' '}
  = aa^{-1} = e. $$ Hoàn toàn tương tự, $(b^{-1}a^{-1})(ab) = b^{-1}(a^{-1}a)b = b^{-1}eb = b^{-1}b
  = e$. Theo ý (2), nghịch đảo duy nhất của $ab$ là $b^{-1}a^{-1}$.
</Proof>

<Corollary
  id="cor-c1-b1-anh-xa-tinh-tien"
  title="Tính song ánh của ánh xạ tịnh tiến trái và phải"
  original="Mục 1.3"
  source="gt-ctds-hvk-2026"
  page="21"
>
Cho nhóm $G$ và một phần tử cố định $a \in G$. Khi đó **ánh xạ tịnh tiến trái** $L_a: G \to G, x \mapsto ax$ và **ánh xạ tịnh tiến phải** $R_a: G \to G, x \mapsto xa$ đều là các song ánh trên $G$, với ánh xạ ngược lần lượt là $(L_a)^{-1} = L_{a^{-1}}$ và $(R_a)^{-1} = R_{a^{-1}}$.
</Corollary>

<Proof of="cor-c1-b1-anh-xa-tinh-tien">
Với mọi $x \in G$, ta có $(L_{a^{-1}} \circ L_a)(x) = a^{-1}(ax) = (a^{-1}a)x = ex = x$ và $(L_a \circ L_{a^{-1}})(x) = a(a^{-1}x) = x$. Vậy $L_a$ là song ánh với $(L_a)^{-1} = L_{a^{-1}}$. Chứng minh cho $R_a$ hoàn toàn tương tự.
</Proof>

<Warning title="Không giản ước chéo và không giữ nguyên thứ tự khi lấy nghịch đảo của tích">
Trong một nhóm không giao hoán:

1. Từ đẳng thức $ax = ya$, ta **không thể** giản ước $a$ ở hai phía khác nhau để kết luận $x = y$ (vì $x = a^{-1}ya$ có thể khác $y$).
2. Khi lấy nghịch đảo của tích nhiều phần tử, phải **đảo ngược toàn bộ thứ tự các nhân tử**: $(a_1 a_2 \cdots a_k)^{-1} = a_k^{-1} \cdots a_2^{-1} a_1^{-1}$.
   </Warning>

## 3. Bài tập tự luyện

<Exercise id="exr-c1-b1-a1" title="[Nhóm A · Mã CTDS-C1-B1-A01] Nhận diện cấu trúc và giải phương trình trong nhóm ma trận">
- **Nhóm bài tập:** Nhóm A — Nhận diện và tính toán
- **Chủ đề:** Quy tắc nghịch đảo của tích và phương trình $AX = B, YA = B$ trong nhóm không giao hoán
- **Mục tiêu đánh giá:** Thực hiện đúng phép tìm nghịch đảo và phân biệt nghiệm của $AX = B$ với $YA = B$ *(Đánh giá thường xuyên)*
- **Mức độ khó:** Cơ bản (Mức 1)
- **Nguồn kiến thức liên quan:** <Ref to="thm-c1-b1-he-qua-tien-de-nhom" /> · <Cite source="gt-ctds-hvk-2026" page="20-21" note="Mục 1.3" />

**Đề bài:** Trong nhóm nhân các ma trận thực khả nghịch cấp hai $\operatorname{GL}_2(\R)$, cho hai ma trận:

$$
A = \begin{pmatrix} 1 & 2 \\ 0 & 1 \end{pmatrix}, \quad B = \begin{pmatrix} 1 & 0 \\ 3 & 1 \end{pmatrix}.
$$

1. Tính $A^{-1}, B^{-1}$ và kiểm chứng trực tiếp đẳng thức $(AB)^{-1} = B^{-1}A^{-1} \neq A^{-1}B^{-1}$.
2. Giải hai phương trình ma trận $AX = B$ và $YA = B$ trong $\operatorname{GL}_2(\R)$, từ đó so sánh $X$ và $Y$.
   </Exercise>

<Hint>
  Áp dụng công thức nghịch đảo của ma trận cấp hai có định thức bằng $1$: $\begin{pmatrix} a & b \\
  c & d \end{pmatrix}^{-1} = \begin{pmatrix} d & -b \\ -c & a \end{pmatrix}$. Ở câu (2), dùng công
  thức nghiệm duy nhất $X = A^{-1}B$ và $Y = BA^{-1}$ trong{' '}
  <Ref to="thm-c1-b1-he-qua-tien-de-nhom" />.
</Hint>

<Solution>
1. Vì $\det(A) = \det(B) = 1$, ta có:
   $$
   A^{-1} = \begin{pmatrix} 1 & -2 \\ 0 & 1 \end{pmatrix}, \quad B^{-1} = \begin{pmatrix} 1 & 0 \\ -3 & 1 \end{pmatrix}.
   $$
   Tính tích $AB = \begin{pmatrix} 7 & 2 \\ 3 & 1 \end{pmatrix}$, suy ra $(AB)^{-1} = \begin{pmatrix} 1 & -2 \\ -3 & 7 \end{pmatrix}$. Mặt khác:
   $$
   B^{-1}A^{-1} = \begin{pmatrix} 1 & 0 \\ -3 & 1 \end{pmatrix}\begin{pmatrix} 1 & -2 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & -2 \\ -3 & 7 \end{pmatrix} = (AB)^{-1},
   $$
   còn $A^{-1}B^{-1} = \begin{pmatrix} 1 & -2 \\ 0 & 1 \end{pmatrix}\begin{pmatrix} 1 & 0 \\ -3 & 1 \end{pmatrix} = \begin{pmatrix} 7 & -2 \\ -3 & 1 \end{pmatrix} \neq (AB)^{-1}$.
2. Theo <Ref to="thm-c1-b1-he-qua-tien-de-nhom" />, phương trình $AX = B$ có nghiệm duy nhất:
   $$
   X = A^{-1}B = \begin{pmatrix} 1 & -2 \\ 0 & 1 \end{pmatrix}\begin{pmatrix} 1 & 0 \\ 3 & 1 \end{pmatrix} = \begin{pmatrix} -5 & -2 \\ 3 & 1 \end{pmatrix}.
   $$
   Phương trình $YA = B$ có nghiệm duy nhất:
   $$
   Y = BA^{-1} = \begin{pmatrix} 1 & 0 \\ 3 & 1 \end{pmatrix}\begin{pmatrix} 1 & -2 \\ 0 & 1 \end{pmatrix} = \begin{pmatrix} 1 & -2 \\ 3 & -5 \end{pmatrix}.
   $$
   Hai nghiệm $X$ và $Y$ khác nhau vì $A$ và $B$ không giao hoán.

**Thang điểm đánh giá (1,00 điểm):**

|  Ý  | Nội dung đạt được                                                                                               |   Điểm   |
| :-: | :-------------------------------------------------------------------------------------------------------------- | :------: |
| 1a  | Tính đúng $A^{-1}, B^{-1}$ và $(AB)^{-1}$                                                                       | `0,25 đ` |
| 1b  | Tính đúng $B^{-1}A^{-1} = (AB)^{-1}$ và chỉ ra $A^{-1}B^{-1} \neq (AB)^{-1}$                                    | `0,25 đ` |
| 2a  | Giải đúng nghiệm duy nhất $X = A^{-1}B = \begin{pmatrix} -5 & -2 \\ 3 & 1 \end{pmatrix}$                        | `0,25 đ` |
| 2b  | Giải đúng nghiệm duy nhất $Y = BA^{-1} = \begin{pmatrix} 1 & -2 \\ 3 & -5 \end{pmatrix}$ và kết luận $X \neq Y$ | `0,25 đ` |

</Solution>

<Exercise id="exr-c1-b1-b1" title="[Nhóm B · Mã CTDS-C1-B1-B01] Áp dụng quy trình 4 bước và luật giản ước để rút gọn đẳng thức trong nhóm">
- **Nhóm bài tập:** Nhóm B — Áp dụng định lý
- **Chủ đề:** Vận dụng luật giản ước trái/phải và tính duy nhất của đơn vị trong nhóm
- **Mục tiêu đánh giá:** Vận dụng <Ref to="thm-c1-b1-he-qua-tien-de-nhom" /> để biến đổi phương trình đại số trong một nhóm tùy ý *(Đánh giá quá trình)*
- **Mức độ khó:** Trung bình (Mức 2)
- **Nguồn kiến thức liên quan:** <Ref to="thm-c1-b1-he-qua-tien-de-nhom" /> · <Cite source="gt-ctds-hvk-2026" page="20-21" note="Định lý 1.8" />

**Đề bài:** Cho $(G, \cdot)$ là một nhóm với phần tử đơn vị $e$ và $a, b \in G$.

1. Chứng minh rằng nếu $x \in G$ là một phần tử lũy đẳng (tức là $x^2 = x$) thì bắt buộc $x = e$.
2. Giả sử hai phần tử $a, b \in G$ thỏa mãn $aba^{-1} = b^2$ và $a^2 = e$. Chứng minh rằng $b^3 = e$.
   </Exercise>

<Hint>
  Ở ý (1), viết $x^2 = x$ thành $xx = xe$ rồi áp dụng luật giản ước trái. Ở ý (2), hãy tính $a^2 b
  a^{-2}$ bằng cách thay liên tiếp giả thiết $aba^{-1} = b^2$, sau đó kết hợp với $a^2 = e$.
</Hint>

<Solution>
1. Vì $x^2 = x$ nên ta có $xx = xe$. Theo luật giản ước trái trong <Ref to="thm-c1-b1-he-qua-tien-de-nhom" />, giản ước $x$ ở bên trái hai vế ta thu được $x = e$.
2. Từ giả thiết $aba^{-1} = b^2$, bình phương hai vế ta có:
   $$
   b^4 = (b^2)(b^2) = (aba^{-1})(aba^{-1}) = ab(a^{-1}a)ba^{-1} = ab^2a^{-1}.
   $$
   Thay tiếp $b^2 = aba^{-1}$ vào vế phải của đẳng thức trên:
   $$
   b^4 = a(aba^{-1})a^{-1} = a^2 b (a^{-1})^2 = a^2 b (a^2)^{-1}.
   $$
   Do $a^2 = e$ nên $(a^2)^{-1} = e^{-1} = e$, suy ra $b^4 = ebe = b$, hay $b^3 \cdot b = e \cdot b$. Áp dụng luật giản ước phải cho $b$, ta kết luận $b^3 = e$.

**Thang điểm đánh giá (1,00 điểm):**

|  Ý  | Nội dung đạt được                                                  |   Điểm   |
| :-: | :----------------------------------------------------------------- | :------: |
|  1  | Viết được $xx = xe$ và áp dụng luật giản ước trái suy ra $x = e$   | `0,25 đ` |
| 2a  | Chứng minh được $(aba^{-1})^2 = ab^2a^{-1} = b^4$ nhờ tính kết hợp | `0,25 đ` |
| 2b  | Thay $b^2 = aba^{-1}$ và dùng $a^2 = e$ để suy ra $b^4 = b$        | `0,25 đ` |
| 2c  | Dùng luật giản ước suy ra $b^3 = e$                                | `0,25 đ` |

</Solution>

<Exercise id="exr-c1-b1-c1" title="[Nhóm C · Mã CTDS-C1-B1-C01] Đặc trưng tính giao hoán của nhóm qua đẳng thức lũy thừa và phản ví dụ">
- **Nhóm bài tập:** Nhóm C — Chứng minh và phản ví dụ
- **Chủ đề:** Điều kiện cần và đủ để một nhóm là nhóm abel
- **Mục tiêu đánh giá:** Thiết lập chứng minh hai chiều bằng luật giản ước và xây dựng phản ví dụ khi giảm số phần tử kiểm tra *(Kiểm tra giữa kỳ)*
- **Mức độ khó:** Khá – Giỏi (Mức 3)
- **Nguồn kiến thức liên quan:** <Ref to="def-c1-b1-nua-nhom-vi-nhom-nhom" /> · <Ref to="thm-c1-b1-he-qua-tien-de-nhom" /> · <Cite source="gt-ctds-hvk-2026" page="20-23" note="Mục 1.3 - 1.4" />

**Đề bài:** Cho $(G, \cdot)$ là một nhóm.

1. Chứng minh rằng $G$ là nhóm abel khi và chỉ khi $(ab)^{-1} = a^{-1}b^{-1}$ với mọi $a, b \in G$.
2. Khẳng định sau đúng hay sai: _"Nếu tồn tại hai phần tử $a, b \in G$ sao cho $(ab)^2 = a^2b^2$ thì $G$ là nhóm abel"_? Nếu sai, hãy chỉ ra một phản ví dụ cụ thể trong nhóm $\operatorname{GL}_2(\R)$.
   </Exercise>

<Hint>
  Ở ý (1), kết hợp công thức tổng quát $(ab)^{-1} = b^{-1}a^{-1}$ trong{' '}
  <Ref to="thm-c1-b1-he-qua-tien-de-nhom" /> với tính chất $(x^{-1})^{-1} = x$. Ở ý (2), lưu ý sự
  khác biệt giữa lượng từ *"với mọi $a, b \in G$"* và *"tồn tại $a, b \in G$"*; chẳng hạn chọn $a =
  e$ trong một nhóm không giao hoán.
</Hint>

<Solution>
1. **Chiều thuận ($\Rightarrow$):** Giả sử $G$ là nhóm abel. Khi đó với mọi $a, b \in G$, ta có $ab = ba$. Áp dụng <Ref to="thm-c1-b1-he-qua-tien-de-nhom" />:
   $$
   (ab)^{-1} = (ba)^{-1} = a^{-1}b^{-1}.
   $$
   **Chiều đảo ($\Leftarrow$):** Giả sử $(ab)^{-1} = a^{-1}b^{-1}$ với mọi $a, b \in G$. Theo <Ref to="thm-c1-b1-he-qua-tien-de-nhom" />, ta luôn có $(ab)^{-1} = b^{-1}a^{-1}$, nên:
   $$
   b^{-1}a^{-1} = a^{-1}b^{-1} = (ba)^{-1}.
   $$
   Lấy nghịch đảo hai vế của đẳng thức $(ab)^{-1} = (ba)^{-1}$ và sử dụng tính chất $(x^{-1})^{-1} = x$, ta thu được $ab = ba$ với mọi $a, b \in G$. Vậy $G$ là nhóm abel.
2. Khẳng định đã cho là **sai**. Phản ví dụ: Xét nhóm $G = \operatorname{GL}_2(\R)$ (không phải là nhóm abel theo <Ref to="exr-c1-b1-a1" />). Chọn $A = I_2 = \begin{pmatrix} 1 & 0 \\ 0 & 1 \end{pmatrix}$ và $B = \begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}$. Khi đó $(AB)^2 = B^2 = I_2^2 B^2 = A^2 B^2$, nhưng $G = \operatorname{GL}_2(\R)$ không giao hoán. Điều kiện $(ab)^2 = a^2b^2$ chỉ kéo theo $G$ abel khi nó đúng **với mọi** $a, b \in G$.

**Thang điểm đánh giá (1,00 điểm):**

|  Ý  | Nội dung đạt được                                                                                               |   Điểm   |
| :-: | :-------------------------------------------------------------------------------------------------------------- | :------: |
| 1a  | Chứng minh đúng chiều thuận: $G$ abel $\implies (ab)^{-1} = a^{-1}b^{-1}$                                       | `0,25 đ` |
| 1b  | Chứng minh đúng chiều đảo: từ $b^{-1}a^{-1} = a^{-1}b^{-1}$ suy ra $ab = ba$ ($\forall a,b \in G$)              | `0,50 đ` |
|  2  | Kết luận khẳng định sai, giải thích rõ lỗi lượng từ và chỉ ra phản ví dụ hợp lệ trong $\operatorname{GL}_2(\R)$ | `0,25 đ` |

</Solution>

<Exercise id="exr-c1-b1-d1" title="[Nhóm D · Mã CTDS-C1-B1-D01] Tiêu chuẩn nhóm từ sự tồn tại nghiệm của phương trình tuyến tính trái và phải">
- **Nhóm bài tập:** Nhóm D — Tổng hợp và cấu trúc thương
- **Chủ đề:** Đặc trưng hệ tiên đề nhóm qua tính toàn ánh của các phép tịnh tiến trái và phải
- **Mục tiêu đánh giá:** Tổng hợp lập luận đại số để dựng phần tử đơn vị toàn cục và nghịch đảo hai phía từ điều kiện giải được phương trình $ax = b, ya = b$ *(Thi kết thúc học phần)*
- **Mức độ khó:** Nâng cao (Mức 4)
- **Nguồn kiến thức liên quan:** <Ref to="def-c1-b1-nua-nhom-vi-nhom-nhom" /> · <Ref to="thm-c1-b1-he-qua-tien-de-nhom" /> · <Cite source="gt-ctds-hvk-2026" page="20-22" note="Mục 1.3 & Bài tập 1.27" />

**Đề bài:** Cho $(G, \cdot)$ là một nửa nhóm khác rỗng thỏa mãn tính chất: với mọi $a, b \in G$, các phương trình $ax = b$ và $ya = b$ luôn có ít nhất một nghiệm $x, y \in G$. Chứng minh rằng $(G, \cdot)$ là một nhóm.

</Exercise>

<Hint>
  Cố định một phần tử $a_0 \in G$ và lấy $e \in G$ sao cho $a_0 e = a_0$. Với mọi $b \in G$, hãy
  biểu diễn $b = y a_0$ (nhờ sự tồn tại nghiệm của $y a_0 = b$) để chứng minh $be = b$ với mọi $b
  \in G$ (tức $e$ là đơn vị phải). Tương tự dựng đơn vị trái $e'$, chỉ ra $e = e'$, rồi dùng phương
  trình $ax = e$ và $ya = e$ để suy ra nghịch đảo hai phía.
</Hint>

<Solution>
Vì $G \neq \varnothing$, ta cố định một phần tử $a_0 \in G$.

1. **Dựng phần tử đơn vị phải $e$:** Theo giả thiết áp dụng cho cặp $(a_0, a_0)$, tồn tại $e \in G$ sao cho $a_0 e = a_0$. Lấy $b \in G$ bất kỳ; do phương trình $y a_0 = b$ có nghiệm nên tồn tại $y \in G$ sao cho $b = y a_0$. Sử dụng tính kết hợp của nửa nhóm $G$:
   $$
   be = (y a_0)e = y(a_0 e) = y a_0 = b, \quad \forall b \in G.
   $$
   Vậy $e$ là phần tử đơn vị phải của $G$.
2. **Dựng phần tử đơn vị trái $e'$ và chứng minh $e' = e$:** Tương tự, tồn tại $e' \in G$ sao cho $e' a_0 = a_0$. Với mọi $b \in G$, tồn tại $x \in G$ sao cho $a_0 x = b$, do đó:
   $$
   e'b = e'(a_0 x) = (e' a_0)x = a_0 x = b, \quad \forall b \in G.
   $$
   Vậy $e'$ là phần tử đơn vị trái của $G$. Khi đó $e' = e'e = e$, nghĩa là $e$ là phần tử đơn vị hai phía của $G$.
3. **Chứng minh mọi phần tử đều khả nghịch:** Với mỗi $a \in G$, áp dụng giả thiết cho cặp $(a, e)$, tồn tại $x \in G$ và $y \in G$ sao cho $ax = e$ và $ya = e$. Khi đó:
   $$
   y = ye = y(ax) = (ya)x = ex = x.
   $$
   Đặt $a^{-1} = x = y \in G$, ta có $aa^{-1} = a^{-1}a = e$. Vậy $(G, \cdot)$ là một nhóm.

**Thang điểm đánh giá (1,00 điểm):**

|  Ý  | Nội dung đạt được                                                                                  |   Điểm   |
| :-: | :------------------------------------------------------------------------------------------------- | :------: |
|  1  | Cố định $a_0 \in G$, chọn $a_0 e = a_0$ và dùng $b = ya_0$ chứng minh $be = b$ ($\forall b \in G$) | `0,35 đ` |
|  2  | Dựng đơn vị trái $e'$ thỏa mãn $e'b = b$ ($\forall b \in G$) và suy ra $e' = e'e = e$              | `0,30 đ` |
|  3  | Giải $ax = e, ya = e$ và chứng minh $y = y(ax) = (ya)x = x$ để kết luận $G$ là nhóm                | `0,35 đ` |

</Solution>

<KeyTakeaways>
  - **Phân cấp cấu trúc một phép toán:** Nửa nhóm (kết hợp) $\supset$ Vị nhóm (thêm đơn vị $e$)
  $\supset$ Nhóm (thêm nghịch đảo $x^{-1}$ cho mọi phần tử) $\supset$ Nhóm abel (thêm giao hoán) (
  <Ref to="def-c1-b1-nua-nhom-vi-nhom-nhom" />
  ). - **Quy trình kiểm tra nhóm:** Luôn đi theo 4 bước có thứ tự: *Tính đóng $\to$ Tính kết hợp
  $\to$ Phần tử đơn vị $\to$ Phần tử nghịch đảo*. - **Các quy tắc cốt lõi trong nhóm (
  <Ref to="thm-c1-b1-he-qua-tien-de-nhom" />
  ):** Đơn vị $e$ và nghịch đảo $a^{-1}$ là duy nhất; có luật giản ước trái và phải; phương trình
  $ax=b$ có nghiệm duy nhất $x=a^{-1}b$, $ya=b$ có nghiệm duy nhất $y=ba^{-1}$; và nghịch đảo của
  tích đổi thứ tự $(ab)^{-1} = b^{-1}a^{-1}$. - **Song ánh tịnh tiến (
  <Ref to="cor-c1-b1-anh-xa-tinh-tien" />
  ):** Các ánh xạ $L_a(x)=ax$ và $R_a(x)=xa$ luôn là các song ánh trên nhóm $G$.
</KeyTakeaways>
```
