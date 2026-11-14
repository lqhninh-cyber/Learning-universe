import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface Chapter1KnowledgeMapProps {
  readonly className?: string;
  readonly title?: string;
}

export function Chapter1KnowledgeMap({
  className,
  title = 'Bản đồ tri thức',
}: Chapter1KnowledgeMapProps) {
  return (
    <div
      data-testid="chapter1-knowledge-map"
      className={cn(
        'my-8 overflow-hidden rounded-2xl border border-stone-300 bg-[#fbf9f5]/90 p-6 shadow-sm transition-all duration-200',
        className,
      )}
    >
      {/* Khung tiêu đề học thuật duy nhất: "Bản đồ tri thức" */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/90 pb-4">
        <div>
          <h3 className="font-serif text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
            {title}
          </h3>
          <p className="mt-1 text-xs text-stone-600 sm:text-[13.5px]">
            Hệ thống hóa toàn cảnh: Từ Thang bậc Tiên đề một phép toán đến 4 Họ nhóm mẫu mực và Phân
            loại Cấu trúc cấp nhỏ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-amber-800/20 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
            Chương 1 · Nhóm & các Ví dụ Cơ bản
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* =========================================================================
            TẦNG 1: THANG BẬC TIÊN ĐỀ MỘT PHÉP TOÁN
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-indigo-900 uppercase">
              TẦNG 1 · THANG BẬC TIÊN ĐỀ MỘT PHÉP TOÁN
            </span>
            <span className="h-px flex-1 bg-indigo-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Cấp độ 1: Nửa nhóm */}
            <div className="space-y-2 rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="font-serif text-[14.5px] font-bold text-indigo-950">
                  1. Nửa nhóm (Semigroup)
                </span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  Cấp 1
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Tập <KatexMath math="G" /> cùng phép toán <KatexMath math="*" /> có{' '}
                <strong>tính đóng</strong> và <strong>tính kết hợp</strong>:
              </p>
              <div className="rounded bg-indigo-50/70 p-2 text-center text-xs">
                <KatexMath math="(a * b) * c = a * (b * c)" />
              </div>
              <p className="text-[11px] text-stone-500 italic">
                Ví dụ: <KatexMath math="(\mathbb{Z}^+, +)" />, tập ma trận không khả nghịch.
              </p>
            </div>

            {/* Cấp độ 2: Vị nhóm */}
            <div className="space-y-2 rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="font-serif text-[14.5px] font-bold text-indigo-950">
                  2. Vị nhóm (Monoid)
                </span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  Cấp 2
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Nửa nhóm có thêm <strong>phần tử đơn vị duy nhất</strong>{' '}
                <KatexMath math="e \in G" />:
              </p>
              <div className="rounded bg-indigo-50/70 p-2 text-center text-xs">
                <KatexMath math="a * e = e * a = a \quad (\forall a \in G)" />
              </div>
              <p className="text-[11px] text-stone-500 italic">
                Ví dụ: <KatexMath math="(\mathbb{N}, +)" /> với đơn vị <KatexMath math="0" />,{' '}
                <KatexMath math="(M_n(\mathbb{R}), \cdot)" /> với <KatexMath math="I_n" />.
              </p>
            </div>

            {/* Cấp độ 3: Nhóm */}
            <div className="space-y-2 rounded-xl border-2 border-indigo-300 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-indigo-200 pb-2">
                <span className="font-serif text-[14.5px] font-bold text-indigo-950">
                  3. Nhóm (Group)
                </span>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800">
                  Trọng tâm
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Vị nhóm có <strong>mọi phần tử đều có nghịch đảo</strong>:
              </p>
              <div className="rounded bg-indigo-50 p-2 text-center text-xs font-semibold text-indigo-950">
                <KatexMath math="\forall a \in G, \; \exists a^{-1}: a a^{-1} = a^{-1} a = e" />
              </div>
              <p className="text-[11px] text-stone-500 italic">
                Ví dụ: <KatexMath math="S_n" /> (<KatexMath math="n \ge 3" />
                ), <KatexMath math="D_{2n}" />, <KatexMath math="\operatorname{GL}_n(\mathbb{R})" />
                .
              </p>
            </div>

            {/* Cấp độ 4: Nhóm Abel */}
            <div className="space-y-2 rounded-xl border border-emerald-300/80 bg-emerald-50/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="font-serif text-[14.5px] font-bold text-emerald-950">
                  4. Nhóm Abel (Abelian)
                </span>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Giao hoán
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Nhóm thỏa mãn thêm <strong>tính chất giao hoán</strong>:
              </p>
              <div className="rounded border border-emerald-200/80 bg-white/90 p-2 text-center text-xs font-semibold text-emerald-950">
                <KatexMath math="a * b = b * a \quad (\forall a, b \in G)" />
              </div>
              <p className="text-[11px] text-stone-500 italic">
                Ví dụ: <KatexMath math="(\mathbb{Z}, +)" />,{' '}
                <KatexMath math="(\mathbb{Z}/n\mathbb{Z}, +)" />, <KatexMath math="U(n)" />.
              </p>
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 1 -> 2 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Khảo sát 4 mô hình nhóm kinh điển</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 2: BỐN HỌ NHÓM MẪU MỰC KINH ĐIỂN
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-sky-900 uppercase">
              TẦNG 2 · BỐN HỌ NHÓM MẪU MỰC KINH ĐIỂN
            </span>
            <span className="h-px flex-1 bg-sky-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Họ 1: Nhóm Số học */}
            <div className="space-y-2.5 rounded-xl border border-sky-200/90 bg-white/95 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-sky-950">
                  Họ 1 · Nhóm Số học (Abel)
                </h4>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                  Số học
                </span>
              </div>
              <ul className="space-y-1.5 text-xs leading-relaxed text-stone-700">
                <li>
                  • <strong className="text-stone-900">Nhóm cộng:</strong>{' '}
                  <KatexMath math="(\mathbb{Z}, +) < (\mathbb{Q}, +) < (\mathbb{R}, +) < (\mathbb{C}, +)" />{' '}
                  với đơn vị <KatexMath math="0" />.
                </li>
                <li>
                  • <strong className="text-stone-900">Nhóm modulo:</strong> Nhóm cyclic{' '}
                  <KatexMath math="(\mathbb{Z}/n\mathbb{Z}, +)" /> có cấp đúng bằng{' '}
                  <KatexMath math="n" />.
                </li>
                <li>
                  • <strong className="text-stone-900">Nhóm nhân modulo:</strong>{' '}
                  <KatexMath math="U(n) = (\mathbb{Z}/n\mathbb{Z})^\times" /> gồm các lớp thặng dư
                  nguyên tố cùng nhau với <KatexMath math="n" />, cấp bằng phi hàm Euler{' '}
                  <KatexMath math="\varphi(n)" />.
                </li>
              </ul>
            </div>

            {/* Họ 2: Nhóm Hoán vị */}
            <div className="space-y-2.5 rounded-xl border border-sky-200/90 bg-white/95 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-sky-950">
                  Họ 2 · Nhóm Hoán vị <KatexMath math="S_n" /> & <KatexMath math="A_n" />
                </h4>
                <span className="rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                  Phi Abel
                </span>
              </div>
              <ul className="space-y-1.5 text-xs leading-relaxed text-stone-700">
                <li>
                  • <strong className="text-stone-900">Nhóm đối xứng:</strong>{' '}
                  <KatexMath math="S_n" /> gồm <KatexMath math="n!" /> hoán vị trên tập{' '}
                  <KatexMath math="\{1, \dots, n\}" />. Phép toán là phép hợp thành ánh xạ.
                </li>
                <li>
                  • <strong className="text-stone-900">Nhóm phi Abel nhỏ nhất:</strong>{' '}
                  <KatexMath math="S_3" /> có cấp bằng <KatexMath math="6 = 3!" /> (tam giác đều),
                  không giao hoán vì{' '}
                  <KatexMath math="(1\;2)(1\;3) = (1\;3\;2) \neq (1\;2\;3) = (1\;3)(1\;2)" />.
                </li>
                <li>
                  • <strong className="text-stone-900">Nhóm thay phiên:</strong>{' '}
                  <KatexMath math="A_n \le S_n" /> gồm các hoán vị chẵn, có cấp{' '}
                  <KatexMath math="n!/2" />.
                </li>
              </ul>
            </div>

            {/* Họ 3: Nhóm Nhị diện */}
            <div className="space-y-2.5 rounded-xl border border-sky-200/90 bg-white/95 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-sky-950">
                  Họ 3 · Nhóm Nhị diện <KatexMath math="D_{2n}" /> (Dihedral)
                </h4>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                  Hình học
                </span>
              </div>
              <ul className="space-y-1.5 text-xs leading-relaxed text-stone-700">
                <li>
                  • <strong className="text-stone-900">Đối xứng đa giác đều:</strong> Gồm{' '}
                  <KatexMath math="n" /> phép quay <KatexMath math="r^k" /> và{' '}
                  <KatexMath math="n" /> phép phản xạ trục <KatexMath math="r^k s" />. Cấp{' '}
                  <KatexMath math="|D_{2n}| = 2n" />.
                </li>
                <li>
                  • <strong className="text-stone-900">Hệ thức xác định:</strong>{' '}
                  <KatexMath math="r^n = e, \; s^2 = e, \; sr = r^{-1}s = r^{n-1}s" />.
                </li>
                <li>
                  • Quy tắc dời phản xạ sang phải: <KatexMath math="s r^k = r^{-k} s = r^{n-k} s" />{' '}
                  giúp tính toán đại số cực kỳ thuận tiện.
                </li>
              </ul>
            </div>

            {/* Họ 4: Nhóm Ma trận */}
            <div className="space-y-2.5 rounded-xl border border-sky-200/90 bg-white/95 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-sky-950">
                  Họ 4 · Nhóm Ma trận <KatexMath math="\operatorname{GL}_n" /> &{' '}
                  <KatexMath math="\operatorname{SL}_n" />
                </h4>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                  Tuyến tính
                </span>
              </div>
              <ul className="space-y-1.5 text-xs leading-relaxed text-stone-700">
                <li>
                  • <strong className="text-stone-900">Tuyến tính tổng quát:</strong>{' '}
                  <KatexMath math="\operatorname{GL}_n(\mathbb{R}) = \{A \in M_n(\mathbb{R}) \mid \det(A) \neq 0\}" />
                  . Vô hạn, không giao hoán (<KatexMath math="n \ge 2" />
                  ).
                </li>
                <li>
                  • <strong className="text-stone-900">Tuyến tính đặc biệt:</strong>{' '}
                  <KatexMath math="\operatorname{SL}_n(\mathbb{R}) = \{A \in \operatorname{GL}_n(\mathbb{R}) \mid \det(A) = 1\}" />
                  .
                </li>
                <li>
                  • Đơn vị là <KatexMath math="I_n" />, nghịch đảo qua công thức phụ hợp và định
                  thức.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 2 -> 3 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Quy luật vận hành căn bản của Nhóm</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 3: CÁC KẾT QUẢ ĐẠI SỐ CĂN BẢN
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase">
              TẦNG 3 · CÁC KẾT QUẢ ĐẠI SỐ CĂN BẢN
            </span>
            <span className="h-px flex-1 bg-amber-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2 rounded-xl border border-amber-200/80 bg-white/95 p-4 shadow-2xs">
              <h4 className="border-b border-amber-100 pb-1.5 font-serif text-[14px] font-bold text-amber-950">
                1. Duy nhất & Giản ước
              </h4>
              <p className="text-xs leading-relaxed text-stone-700">
                • Đơn vị <KatexMath math="e" /> và nghịch đảo <KatexMath math="x^{-1}" /> là{' '}
                <strong>duy nhất</strong>.
              </p>
              <p className="text-xs leading-relaxed text-stone-700">
                • Luật giản ước hai phía: <KatexMath math="ax = ay \implies x = y" />,{' '}
                <KatexMath math="xa = ya \implies x = y" />.
              </p>
              <p className="text-xs leading-relaxed text-stone-700">
                • Phương trình <KatexMath math="ax = b" /> có nghiệm duy nhất{' '}
                <KatexMath math="x = a^{-1}b" />.
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-amber-200/80 bg-white/95 p-4 shadow-2xs">
              <h4 className="border-b border-amber-100 pb-1.5 font-serif text-[14px] font-bold text-amber-950">
                2. Nghịch đảo tích & Lũy thừa
              </h4>
              <p className="text-xs leading-relaxed text-stone-700">
                • Đảo ngược thứ tự khi nghịch đảo tích:{' '}
                <KatexMath math="(ab)^{-1} = b^{-1}a^{-1}" />.
              </p>
              <p className="text-xs leading-relaxed text-stone-700">
                • Lũy thừa nguyên: <KatexMath math="a^m a^n = a^{m+n}" />,{' '}
                <KatexMath math="(a^m)^n = a^{mn}" />.
              </p>
              <p className="text-xs leading-relaxed text-stone-700">
                • Lưu ý: <KatexMath math="(ab)^n = a^n b^n \iff ab = ba" /> (chỉ đúng khi giao
                hoán).
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-amber-200/80 bg-white/95 p-4 shadow-2xs">
              <h4 className="border-b border-amber-100 pb-1.5 font-serif text-[14px] font-bold text-amber-950">
                3. Bảng Cayley & Latin Square
              </h4>
              <p className="text-xs leading-relaxed text-stone-700">
                • Mỗi phần tử xuất hiện đúng <strong>1 lần</strong> trên mỗi hàng và mỗi cột (hình
                vuông Latin).
              </p>
              <p className="text-xs leading-relaxed text-stone-700">
                • Bảng Cayley đối xứng qua đường chéo chính <KatexMath math="\iff" /> Nhóm Abel.
              </p>
              <p className="text-xs leading-relaxed text-stone-700">
                • Mọi nhóm cấp chẵn luôn có phần tử cấp 2: <KatexMath math="x \neq e, x^2 = e" />.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
            TẦNG 4: PHÂN LOẠI CẤU TRÚC NHÓM CẤP NHỎ
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-emerald-900 uppercase">
              TẦNG 4 · PHÂN LOẠI CẤU TRÚC NHÓM CẤP NHỎ (CẤP ≤ 6)
            </span>
            <span className="h-px flex-1 bg-emerald-200/60" />
          </div>

          <div className="space-y-3 rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-b from-emerald-50/60 to-white p-5 shadow-xs">
            <div className="text-center">
              <h4 className="font-serif text-base font-bold text-emerald-950 sm:text-lg">
                Định lý Phân loại Cấu trúc Nhóm cấp nhỏ
              </h4>
              <p className="mt-1 text-xs text-stone-600">
                Toàn bộ các nhóm có cấp nhỏ hơn 6 đều là nhóm Abel:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
              <div className="space-y-1 rounded-xl border border-emerald-200 bg-white/90 p-3 text-center">
                <span className="block font-bold text-emerald-950">Cấp 1, 2, 3, 5</span>
                <p className="text-stone-600">
                  Đều là cấp nguyên tố (hoặc tầm thường).{' '}
                  <strong className="text-emerald-900">Duy nhất 1 cấu trúc</strong>: Nhóm cyclic{' '}
                  <KatexMath math="\mathbb{Z}/p\mathbb{Z}" />.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-emerald-200 bg-white/90 p-3 text-center">
                <span className="block font-bold text-emerald-950">Cấp 4 (Đúng 2 cấu trúc)</span>
                <p className="text-stone-600">
                  • Nhóm cyclic <KatexMath math="\mathbb{Z}/4\mathbb{Z}" /> (chứa phần tử cấp 4).
                  <br />• Nhóm bốn Klein{' '}
                  <KatexMath math="V_4 = \mathbb{Z}/2\mathbb{Z} \times \mathbb{Z}/2\mathbb{Z}" /> (
                  <KatexMath math="x^2 = e" />
                  ).
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-emerald-200 bg-white/90 p-3 text-center">
                <span className="block font-bold text-emerald-950">
                  Cấp 6 (Nhóm phi Abel nhỏ nhất)
                </span>
                <p className="text-stone-600">
                  • Nhóm Abel: <KatexMath math="\mathbb{Z}/6\mathbb{Z}" />.
                  <br />• Nhóm không giao hoán: <KatexMath math="S_3" /> và <KatexMath math="D_6" />{' '}
                  (cấp 6).
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
