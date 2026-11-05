import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface Chapter5KnowledgeMapProps {
  readonly className?: string;
  readonly title?: string;
}

export function Chapter5KnowledgeMap({
  className,
  title = 'Bản đồ tri thức',
}: Chapter5KnowledgeMapProps) {
  return (
    <div
      data-testid="chapter5-knowledge-map"
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
            Hệ thống hóa toàn cảnh: Từ Ánh xạ bảo toàn phép toán, Hạt nhân chuẩn tắc đến Bộ ba Định
            lý Đẳng cấu và Định lý Cayley
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-amber-800/20 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
            Chương 5 · Đồng cấu Nhóm & Đẳng cấu
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* =========================================================================
            TẦNG 1: ĐỒNG CẤU NHÓM & HAI TRỤ CỘT KER - IM
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-indigo-900 uppercase">
              TẦNG 1 · ĐỒNG CẤU NHÓM & HAI TRỤ CỘT KER — IM
            </span>
            <span className="h-px flex-1 bg-indigo-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Thẻ 1: Đồng cấu nhóm */}
            <div className="space-y-2 rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                  Đồng cấu <KatexMath math="\varphi: G \to K" />
                </h4>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  Bảo toàn
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Ánh xạ bảo toàn phép toán đại số hai phía:
              </p>
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-2 text-center text-xs font-semibold text-indigo-950">
                <KatexMath math="\varphi(xy) = \varphi(x)\varphi(y)" />
              </div>
              <p className="text-xs text-stone-600">
                Hệ quả: <KatexMath math="\varphi(e_G) = e_K" /> và{' '}
                <KatexMath math="\varphi(x^{-1}) = (\varphi(x))^{-1}" />.
              </p>
            </div>

            {/* Thẻ 2: Hạt nhân Ker */}
            <div className="space-y-2 rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                  Hạt nhân <KatexMath math="\ker\varphi" />
                </h4>
                <span className="rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                  Chuẩn tắc
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Tập các phần tử bị biến về đơn vị <KatexMath math="e_K" />:
              </p>
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-2 text-center text-xs font-semibold text-indigo-950">
                <KatexMath math="\ker\varphi = \{x \in G \mid \varphi(x) = e_K\} \trianglelefteq G" />
              </div>
              <p className="text-xs text-stone-600">
                Luôn là <strong>nhóm con chuẩn tắc</strong>. <KatexMath math="\varphi" /> là đơn cấu{' '}
                <KatexMath math="\iff \ker\varphi = \{e_G\}" />.
              </p>
            </div>

            {/* Thẻ 3: Ảnh Im */}
            <div className="space-y-2 rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                  Ảnh <KatexMath math="\operatorname{Im}\varphi" />
                </h4>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  Nhóm con
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Tập các giá trị ảnh rơi vào nhóm đích <KatexMath math="K" />:
              </p>
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/70 p-2 text-center text-xs font-semibold text-indigo-950">
                <KatexMath math="\operatorname{Im}\varphi = \{\varphi(x) \mid x \in G\} \le K" />
              </div>
              <p className="text-xs text-stone-600">
                <KatexMath math="\varphi" /> là toàn cấu{' '}
                <KatexMath math="\iff \operatorname{Im}\varphi = K" />. <KatexMath math="\varphi" />{' '}
                đẳng cấu <KatexMath math="\iff" /> đơn cấu + toàn cấu.
              </p>
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 1 -> 2 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Nguyên lý phân tích qua nhóm thương</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 2: NGUYÊN LÝ PHÂN TÍCH QUA THƯƠNG
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-sky-900 uppercase">
              TẦNG 2 · NGUYÊN LÝ PHÂN TÍCH QUA NHÓM THƯƠNG (UNIVERSAL FACTORIZATION)
            </span>
            <span className="h-px flex-1 bg-sky-200/60" />
          </div>

          <div className="space-y-3 rounded-2xl border border-sky-300/80 bg-sky-50/30 p-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/60 pb-2">
              <h4 className="font-serif text-base font-bold text-sky-950">
                Sơ đồ giao hoán: Phân tích đồng cấu qua chiếu chính tắc
              </h4>
              <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-900">
                Universal Property
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-700">
              Nếu <KatexMath math="N \trianglelefteq G" /> và{' '}
              <KatexMath math="N \subseteq \ker\varphi" />, tồn tại duy nhất một đồng cấu cảm sinh{' '}
              <KatexMath math="\bar{\varphi}: G/N \to K" /> sao cho{' '}
              <KatexMath math="\bar{\varphi} \circ \pi = \varphi" /> (với{' '}
              <KatexMath math="\pi: G \twoheadrightarrow G/N" /> là phép chiếu chính tắc):
            </p>
            <div className="mx-auto max-w-lg rounded-xl border border-sky-200 bg-white/95 p-3 text-center text-xs font-semibold text-sky-950">
              <KatexMath math="\bar{\varphi}(gN) = \varphi(g) \quad (\text{xác định tốt } \iff N \subseteq \ker\varphi)" />
            </div>
            <p className="text-center text-xs text-stone-600">
              Khi chọn đúng <KatexMath math="N = \ker\varphi" />, ánh xạ cảm sinh{' '}
              <KatexMath math="\bar{\varphi}" /> trở thành một <strong>đơn cấu tự nhiên</strong>!
            </p>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 2 -> 3 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Dẫn tới Bộ ba Định lý Đẳng cấu kinh điển</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 3: BỘ BA ĐỊNH LÝ ĐẲNG CẤU KINH ĐIỂN
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase">
              TẦNG 3 · BỘ BA ĐỊNH LÝ ĐẲNG CẤU KINH ĐIỂN (ISOMORPHISM THEOREMS)
            </span>
            <span className="h-px flex-1 bg-amber-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Định lý 1 */}
            <div className="space-y-2.5 rounded-xl border-2 border-amber-300/80 bg-amber-50/50 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h4 className="font-serif text-[14.5px] font-bold text-amber-950">
                  Định lý Đẳng cấu Thứ nhất
                </h4>
                <span className="rounded bg-amber-200/70 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  Đẳng cấu I
                </span>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white/95 p-3 text-center text-base font-bold text-amber-950">
                <KatexMath math="G/\ker\varphi \cong \operatorname{Im}\varphi" />
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Đồng cấu cảm sinh{' '}
                <KatexMath math="\bar{\varphi}: g\ker\varphi \mapsto \varphi(g)" /> là một đẳng cấu
                nhóm. Nhận diện cấu trúc nhóm thương mà không cần lập bảng Cayley!
              </p>
            </div>

            {/* Định lý 2 */}
            <div className="space-y-2.5 rounded-xl border-2 border-amber-300/80 bg-amber-50/50 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h4 className="font-serif text-[14.5px] font-bold text-amber-950">
                  Định lý Đẳng cấu Thứ hai
                </h4>
                <span className="rounded bg-amber-200/70 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  Kim cương
                </span>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white/95 p-3 text-center text-base font-bold text-amber-950">
                <KatexMath math="HN/N \cong H/(H \cap N)" />
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Với <KatexMath math="H \le G" /> và <KatexMath math="N \trianglelefteq G" />. Sơ đồ
                kim cương liên kết bốn nhóm con: <KatexMath math="HN, H, N, H \cap N" />.
              </p>
            </div>

            {/* Định lý 3 */}
            <div className="space-y-2.5 rounded-xl border-2 border-amber-300/80 bg-amber-50/50 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                <h4 className="font-serif text-[14.5px] font-bold text-amber-950">
                  Định lý Đẳng cấu Thứ ba
                </h4>
                <span className="rounded bg-amber-200/70 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                  Giản ước
                </span>
              </div>
              <div className="rounded-lg border border-amber-200 bg-white/95 p-3 text-center text-base font-bold text-amber-950">
                <KatexMath math="(G/N)/(H/N) \cong G/H" />
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Với <KatexMath math="N \trianglelefteq G, H \trianglelefteq G" /> và{' '}
                <KatexMath math="N \subseteq H" />. Quy tắc giản ước phân số tự nhiên trong nhóm
                thương.
              </p>
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 3 -> 4 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Bảo toàn cấu trúc mạng và nhúng hoán vị</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 4: ĐỊNH LÝ TƯƠNG ỨNG & ĐỊNH LÝ CAYLEY
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-emerald-900 uppercase">
              TẦNG 4 · ĐỊNH LÝ TƯƠNG ỨNG & ĐỊNH LÝ NHÚNG CAYLEY
            </span>
            <span className="h-px flex-1 bg-emerald-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Định lý Tương ứng */}
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-white/95 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-emerald-950">
                  Định lý Tương ứng (Lattice Theorem)
                </h4>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  Song ánh mạng
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Với <KatexMath math="N \trianglelefteq G" />, tồn tại một song ánh bảo toàn thứ tự
                bao hàm:
              </p>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-2 text-center text-xs font-semibold text-emerald-950">
                <KatexMath math="\{H \le G \mid N \subseteq H\} \longleftrightarrow \{\bar{H} \le G/N\}" />
              </div>
              <p className="text-xs text-stone-600">
                Bảo toàn chỉ số: <KatexMath math="[G : H] = [G/N : H/N]" /> và bảo toàn tính chuẩn
                tắc.
              </p>
            </div>

            {/* Định lý Cayley */}
            <div className="space-y-2 rounded-xl border border-emerald-200 bg-white/95 p-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                <h4 className="font-serif text-[15px] font-bold text-emerald-950">
                  Định lý Nhúng Cayley (1854)
                </h4>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                  Nhóm Hoán vị
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-700">
                Mọi nhóm <KatexMath math="G" /> đều đẳng cấu với một nhóm con của nhóm đối xứng{' '}
                <KatexMath math="\operatorname{Sym}(G)" />:
              </p>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-2 text-center text-xs font-semibold text-emerald-950">
                <KatexMath math="G \hookrightarrow \operatorname{Sym}(G), \quad g \mapsto L_g \quad (L_g(x) = gx)" />
              </div>
              <p className="text-xs text-stone-600">
                Đặc biệt, nếu <KatexMath math="|G| = n < \infty" /> thì <KatexMath math="G" /> đẳng
                cấu với một nhóm con của <KatexMath math="S_n" />.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
