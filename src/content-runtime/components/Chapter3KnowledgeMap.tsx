import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface Chapter3KnowledgeMapProps {
  readonly className?: string;
  readonly title?: string;
}

export function Chapter3KnowledgeMap({
  className,
  title = 'Bản đồ tri thức',
}: Chapter3KnowledgeMapProps) {
  return (
    <div
      data-testid="chapter3-knowledge-map"
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
            Hệ thống hóa toàn cảnh: Từ Lớp kề tương đương, Cơ chế Phân hoạch Đẳng thế đến Định lý
            Lagrange và Ứng dụng Số học
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-amber-800/20 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
            Chương 3 · Lớp kề & Định lý Lagrange
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* =========================================================================
            TẦNG 1: QUAN HỆ TƯƠNG ĐƯƠNG & KHÁI NIỆM LỚP KỀ
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-indigo-900 uppercase">
              TẦNG 1 · QUAN HỆ TƯƠNG ĐƯƠNG & KHÁI NIỆM LỚP KỀ
            </span>
            <span className="h-px flex-1 bg-indigo-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Lớp kề trái */}
            <div className="space-y-2 rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                  Lớp kề trái <KatexMath math="gH" />
                </h4>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  Left Coset
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Được sinh bởi quan hệ tương đương:{' '}
                <KatexMath math="x \sim_L y \iff x^{-1}y \in H" />.
              </p>
              <div className="rounded-lg border border-indigo-100/80 bg-indigo-50/70 p-2 text-center text-xs font-semibold text-indigo-950">
                <KatexMath math="gH = \{gh \mid h \in H\} \subseteq G" />
              </div>
              <p className="text-xs text-stone-600">
                Hai phần tử cùng lớp kề trái:{' '}
                <KatexMath math="aH = bH \iff a^{-1}b \in H \iff b \in aH" />.
              </p>
            </div>

            {/* Lớp kề phải */}
            <div className="space-y-2 rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                  Lớp kề phải <KatexMath math="Hg" />
                </h4>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  Right Coset
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Được sinh bởi quan hệ tương đương:{' '}
                <KatexMath math="x \sim_R y \iff xy^{-1} \in H" />.
              </p>
              <div className="rounded-lg border border-indigo-100/80 bg-indigo-50/70 p-2 text-center text-xs font-semibold text-indigo-950">
                <KatexMath math="Hg = \{hg \mid h \in H\} \subseteq G" />
              </div>
              <p className="text-xs text-stone-600">
                * Trong nhóm không Abel, lớp kề trái <KatexMath math="gH" /> có thể{' '}
                <strong className="text-stone-900">không trùng</strong> lớp kề phải{' '}
                <KatexMath math="Hg" />.
              </p>
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 1 -> 2 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Cảm sinh phân hoạch và tính đẳng thế</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 2: PHÂN HOẠCH RỜI NHAU & ĐẲNG THẾ TUYỆT ĐỐI
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-sky-900 uppercase">
              TẦNG 2 · PHÂN HOẠCH RỜI NHAU & ĐẲNG THẾ TUYỆT ĐỐI
            </span>
            <span className="h-px flex-1 bg-sky-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Phân hoạch nhóm */}
            <div className="space-y-2 rounded-xl border border-sky-200/90 bg-white/95 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-sky-950">
                  1. Phân hoạch rời nhau của <KatexMath math="G" />
                </h4>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                  Phân hoạch
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Tập hợp <KatexMath math="G" /> là hợp rời nhau của tất cả các lớp kề trái phân biệt:
              </p>
              <div className="rounded-lg border border-sky-100 bg-sky-50/70 p-2 text-center text-xs font-semibold text-sky-950">
                <KatexMath math="G = \bigsqcup_{i=1}^k g_i H = g_1 H \cup g_2 H \cup \dots \cup g_k H" />
              </div>
              <p className="text-xs text-stone-600">
                Mỗi phần tử của <KatexMath math="G" /> thuộc về duy nhất một lớp kề. Hai lớp kề bất
                kỳ hoặc trùng nhau hoặc hoàn toàn rời nhau.
              </p>
            </div>

            {/* Tính đẳng thế */}
            <div className="space-y-2 rounded-xl border border-sky-200/90 bg-white/95 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-sky-950">
                  2. Đẳng thế tuyệt đối (Song ánh)
                </h4>
                <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                  Kích thước bằng nhau
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Ánh xạ tịnh tiến trái <KatexMath math="\lambda_g: H \to gH, \; h \mapsto gh" /> là
                một <strong>song ánh</strong> (đơn ánh nhờ luật giản ước):
              </p>
              <div className="rounded-lg border border-sky-100 bg-sky-50/70 p-2 text-center text-xs font-semibold text-sky-950">
                <KatexMath math="|gH| = |H| = |Hg| \quad (\forall g \in G)" />
              </div>
              <p className="text-xs text-stone-600">
                Mọi viên gạch lát sàn (lớp kề) đều có kích thước bằng chằn chặn số phần tử của nhóm
                con <KatexMath math="H" />.
              </p>
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 2 -> 3 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Tổng lực lượng các lớp kề suy ra Định lý Lagrange</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 3: ĐỊNH LÝ LAGRANGE — CÔNG CỤ ĐỊNH LƯỢNG TRỤ CỘT
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase">
              TẦNG 3 · ĐỊNH LÝ LAGRANGE — TRỤ CỘT ĐỊNH LƯỢNG CỦA LÝ THUYẾT NHÓM
            </span>
            <span className="h-px flex-1 bg-amber-200/60" />
          </div>

          <div className="space-y-4 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-b from-amber-50/70 to-white p-5 shadow-xs">
            <div className="text-center">
              <span className="inline-block rounded-full bg-amber-200/80 px-3.5 py-0.5 text-[11.5px] font-bold tracking-wide text-amber-950 uppercase">
                Định lý Lagrange (1770)
              </span>
              <div className="mx-auto mt-2 max-w-md rounded-xl border border-amber-200 bg-white/90 p-3 shadow-2xs">
                <KatexMath
                  math="|G| = [G : H] \cdot |H|"
                  className="text-xl font-bold text-amber-950"
                />
              </div>
              <p className="mt-2 text-xs text-stone-600">
                Số phần tử của nhóm <KatexMath math="|G|" /> bằng tích của chỉ số{' '}
                <KatexMath math="[G : H]" /> (số lượng lớp kề) với cấp của nhóm con{' '}
                <KatexMath math="|H|" />.
              </p>
            </div>

            {/* Ba hệ quả đại số then chốt */}
            <div className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-3">
              <div className="space-y-1 rounded-xl border border-amber-200/80 bg-white/90 p-3">
                <span className="block font-bold text-amber-950">1. Cấp phần tử</span>
                <p className="leading-relaxed text-stone-700">
                  Cấp của mọi phần tử đều là ước của cấp nhóm:{' '}
                  <KatexMath math="\operatorname{ord}(a) \mid |G|" /> và suy ra{' '}
                  <KatexMath math="a^{|G|} = e" />.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-amber-200/80 bg-white/90 p-3">
                <span className="block font-bold text-amber-950">2. Cấp nguyên tố là Cyclic</span>
                <p className="leading-relaxed text-stone-700">
                  Nếu <KatexMath math="|G| = p" /> (nguyên tố), mọi <KatexMath math="a \neq e" />{' '}
                  đều có cấp <KatexMath math="p" />. Suy ra{' '}
                  <KatexMath math="G \cong \mathbb{Z}/p\mathbb{Z}" />.
                </p>
              </div>

              <div className="space-y-1 rounded-xl border border-amber-200/80 bg-white/90 p-3">
                <span className="block font-bold text-amber-950">3. Nhóm con chỉ số 2</span>
                <p className="leading-relaxed text-stone-700">
                  Mọi nhóm con có chỉ số <KatexMath math="[G : H] = 2" /> đều là{' '}
                  <strong>nhóm con chuẩn tắc</strong> (<KatexMath math="H \trianglelefteq G" />
                  ).
                </p>
              </div>
            </div>

            {/* Cảnh báo chiều ngược */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-950">
              <strong className="font-bold text-rose-900">Cảnh báo chiều ngược sai:</strong> Nếu{' '}
              <KatexMath math="d \mid |G|" />, trong <KatexMath math="G" />{' '}
              <strong className="text-rose-900">chưa chắc</strong> đã tồn tại nhóm con cấp{' '}
              <KatexMath math="d" />! Phản ví dụ kinh điển: Nhóm thay phiên <KatexMath math="A_4" />{' '}
              có cấp <KatexMath math="12" /> nhưng không chứa bất kỳ nhóm con nào có cấp{' '}
              <KatexMath math="6" /> (mặc dù <KatexMath math="6 \mid 12" />
              ).
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 3 -> 4 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Áp dụng vào nhóm nhân modulo U(n)</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 4: HAI ĐỈNH CAO ỨNG DỤNG SỐ HỌC (EULER & FERMAT)
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-emerald-900 uppercase">
              TẦNG 4 · HAI ĐỈNH CAO ỨNG DỤNG SỐ HỌC (EULER & FERMAT NHỎ)
            </span>
            <span className="h-px flex-1 bg-emerald-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Định lý Euler */}
            <div className="space-y-2.5 rounded-xl border-2 border-emerald-300/80 bg-emerald-50/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-emerald-950">
                  Định lý Euler (Tổng quát)
                </h4>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                  Euler
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Áp dụng Lagrange cho nhóm{' '}
                <KatexMath math="U(n) = (\mathbb{Z}/n\mathbb{Z})^\times" /> có cấp{' '}
                <KatexMath math="|U(n)| = \varphi(n)" />:
              </p>
              <div className="rounded-lg border border-emerald-200 bg-white/90 p-2.5 text-center text-sm font-bold text-emerald-950">
                <KatexMath math="a^{\varphi(n)} \equiv 1 \pmod n \quad (\forall a \in \mathbb{Z}, \; \gcd(a, n) = 1)" />
              </div>
              <p className="text-xs text-stone-600">
                Công cụ hạ bậc số mũ khổng lồ trong số học đồng dư và bảo mật RSA.
              </p>
            </div>

            {/* Định lý Fermat nhỏ */}
            <div className="space-y-2.5 rounded-xl border-2 border-emerald-300/80 bg-emerald-50/40 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-emerald-950">
                  Định lý Fermat nhỏ (Trường hợp p nguyên tố)
                </h4>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                  Fermat
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Khi <KatexMath math="n = p" /> là số nguyên tố,{' '}
                <KatexMath math="\varphi(p) = p - 1" />:
              </p>
              <div className="rounded-lg border border-emerald-200 bg-white/90 p-2.5 text-center text-sm font-bold text-emerald-950">
                <KatexMath math="a^{p-1} \equiv 1 \pmod p \implies a^p \equiv a \pmod p" />
              </div>
              <p className="text-xs text-stone-600">
                Thỏa mãn với mọi số nguyên <KatexMath math="a" /> không chia hết cho{' '}
                <KatexMath math="p" />. Nền tảng thuật toán kiểm tra tính nguyên tố Fermat.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
