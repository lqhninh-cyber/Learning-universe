import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface Chapter0KnowledgeMapProps {
  readonly className?: string;
  readonly title?: string;
}

export function Chapter0KnowledgeMap({
  className,
  title = 'Bản đồ tri thức',
}: Chapter0KnowledgeMapProps) {
  return (
    <div
      data-testid="chapter0-knowledge-map"
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
            Lưới mạng lưới khái niệm đa tầng: Từ Quan hệ tương đương, Cơ chế phân hoạch đến Phép
            toán cảm sinh và Cấu trúc thương
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-indigo-800/20 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-900">
            Chương 0 · Ngôn ngữ & Công cụ Đại số
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* =========================================================================
            TẦNG 1: ĐỐI TƯỢNG VÀ QUAN HỆ CƠ SỞ
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-indigo-900 uppercase">
              TẦNG 1 · ĐỐI TƯỢNG & QUAN HỆ CƠ SỞ
            </span>
            <span className="h-px flex-1 bg-indigo-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Thẻ A: Tập hợp gốc X & Công cụ Số học đồng dư */}
            <div className="flex flex-col justify-between rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                  <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                    Thẻ A · Tập hợp gốc <KatexMath math="X" /> & Công cụ Số học đồng dư
                  </h4>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    Khởi điểm
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-700">
                  <p>
                    <strong className="text-stone-900">Không gian nghiên cứu:</strong> Tập hợp{' '}
                    <KatexMath math="X" /> và các ánh xạ <KatexMath math="f: X \to Y" /> (đơn ánh,
                    toàn ánh, song ánh).
                  </p>
                  <p>
                    <strong className="text-stone-900">Quan hệ đồng dư:</strong> Trên tập hợp số
                    nguyên <KatexMath math="\mathbb{Z}" />, hai số <KatexMath math="a, b" /> đồng dư
                    modulo <KatexMath math="n" />:
                  </p>
                  <div className="rounded-lg border border-indigo-100/80 bg-indigo-50/70 p-2 text-center">
                    <KatexMath
                      math="a \equiv b \pmod n \iff n \mid (a - b)"
                      className="font-semibold text-indigo-950"
                    />
                  </div>
                  <p className="text-xs text-stone-600">
                    Nền tảng của thuật toán chia Euclid, Đồng nhất thức Bézout{' '}
                    <KatexMath math="ua + vb = \gcd(a, b)" /> và hàm phi Euler{' '}
                    <KatexMath math="\varphi(n)" />.
                  </p>
                </div>
              </div>
            </div>

            {/* Thẻ B: Quan hệ tương đương (~) */}
            <div className="flex flex-col justify-between rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                  <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                    Thẻ B · Quan hệ tương đương (<KatexMath math="\sim" />)
                  </h4>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    3 Trụ cột
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-700">
                  <p className="text-xs font-bold tracking-wide text-indigo-900 uppercase">
                    Ba tiên đề bất biến của quan hệ tương đương:
                  </p>
                  <ul className="space-y-1.5 pl-1">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-indigo-600">1.</span>
                      <span>
                        <strong className="text-stone-900">Phản xạ:</strong>{' '}
                        <KatexMath math="x \sim x" /> với mọi <KatexMath math="x \in X" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-indigo-600">2.</span>
                      <span>
                        <strong className="text-stone-900">Đối xứng:</strong>{' '}
                        <KatexMath math="x \sim y \implies y \sim x" />.
                      </span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-indigo-600">3.</span>
                      <span>
                        <strong className="text-stone-900">Bắc cầu:</strong>{' '}
                        <KatexMath math="x \sim y \text{ và } y \sim z \implies x \sim z" />.
                      </span>
                    </li>
                  </ul>
                  <p className="pt-1 text-xs text-stone-500 italic">
                    Thiếu bất kỳ tính chất nào trong 3 trụ cột thì cấu trúc thương không thể hình
                    thành.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 1 -> 2 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-0.5 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Cảm sinh phân hoạch tập hợp</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 2: CƠ CHẾ PHÂN HOẠCH VÀ TẬP THƯƠNG
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-sky-900 uppercase">
              TẦNG 2 · CƠ CHẾ PHÂN HOẠCH & TẬP THƯƠNG
            </span>
            <span className="h-px flex-1 bg-sky-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Thẻ C: Lớp tương đương */}
            <div className="flex flex-col justify-between rounded-xl border border-sky-200/80 bg-white/90 p-4 shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-2">
                  <h4 className="font-serif text-[15px] font-bold text-sky-950">
                    Thẻ C · Lớp tương đương <KatexMath math="[x]" />
                  </h4>
                  <span className="rounded bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                    Khối thành phần
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-700">
                  <div className="rounded-lg border border-sky-100/80 bg-sky-50/70 p-2 text-center">
                    <KatexMath
                      math="[x] = \{y \in X \mid y \sim x\} \subseteq X"
                      className="font-semibold text-sky-950"
                    />
                  </div>
                  <p>
                    <strong className="text-stone-900">Tiêu chuẩn trùng lớp:</strong> Hai phần tử có
                    lớp tương đương trùng nhau khi và chỉ khi chúng tương đương:
                  </p>
                  <p className="text-center font-medium text-sky-950">
                    <KatexMath math="x \sim y \iff [x] = [y] \iff [x] \cap [y] \neq \varnothing" />
                  </p>
                  <p className="text-xs text-stone-600">
                    Mọi phần tử <KatexMath math="x' \in [x]" /> đều là một{' '}
                    <em>đại diện hợp pháp</em> của cùng một lớp.
                  </p>
                </div>
              </div>
            </div>

            {/* Thẻ D: Tập thương X/~ và Phân hoạch P */}
            <div className="flex flex-col justify-between rounded-xl border border-sky-200/80 bg-white/90 p-4 shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-sky-100 pb-2">
                  <h4 className="font-serif text-[15px] font-bold text-sky-950">
                    Thẻ D · Tập thương <KatexMath math="X/\sim" /> & Phân hoạch{' '}
                    <KatexMath math="\mathcal{P}" />
                  </h4>
                  <span className="rounded bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
                    Tương ứng 1-1
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-700">
                  <p>
                    <strong className="text-stone-900">Tập thương:</strong> Tập hợp chứa toàn bộ các
                    lớp tương đương:
                  </p>
                  <div className="rounded-lg border border-sky-100/80 bg-sky-50/70 p-2 text-center">
                    <KatexMath
                      math="X/{\sim} = \{[x] \mid x \in X\}"
                      className="font-semibold text-sky-950"
                    />
                  </div>
                  <p>
                    <strong className="text-stone-900">Định lý cơ bản 0.5:</strong> Mối tương ứng
                    song ánh 2 chiều:
                  </p>
                  <div className="rounded border border-sky-200/60 bg-sky-50/50 p-2 text-center text-xs font-semibold text-sky-900">
                    Mỗi quan hệ tương đương <KatexMath math="\sim" />{' '}
                    <span className="font-bold text-sky-700">⟺</span> Một phân hoạch{' '}
                    <KatexMath math="\mathcal{P}" /> (các khối rời nhau, phủ kín{' '}
                    <KatexMath math="X" />)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải kết nối ánh xạ chiếu tự nhiên */}
          <div className="rounded-xl border border-sky-200/70 bg-sky-50/30 p-3 text-center text-[13.5px] text-stone-700">
            <span className="font-semibold text-sky-950">Ánh xạ chiếu tự nhiên:</span>{' '}
            <KatexMath math="\pi: X \twoheadrightarrow X/{\sim}, \; x \mapsto [x]" /> là một{' '}
            <strong>toàn ánh chính tắc</strong> giúp chuyển mọi bài toán từ tập gốc sang tập thương.
          </div>
        </section>

        {/* Mũi tên chuyển tầng 2 -> 3 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-0.5 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Thiết lập phép toán trên các lớp</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 3: TRỌNG TÂM ĐẠI SỐ — TÍNH XÁC ĐỊNH TỐT (WELL-DEFINEDNESS)
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase">
              TẦNG 3 · TRỌNG TÂM ĐẠI SỐ: TÍNH XÁC ĐỊNH TỐT
            </span>
            <span className="h-px flex-1 bg-amber-200/60" />
          </div>

          {/* Khối quyết định trung tâm */}
          <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-b from-amber-50/70 to-white p-5 shadow-xs">
            <div className="text-center">
              <span className="inline-block rounded-full bg-amber-200/80 px-3 py-0.5 text-[11.5px] font-bold tracking-wide text-amber-900 uppercase">
                Bài toán Thử thách Trung tâm
              </span>
              <h4 className="mt-2 font-serif text-base font-bold text-stone-900 sm:text-lg">
                Cảm ứng phép toán trên tập thương qua phần tử đại diện
              </h4>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
              <div className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-2xs">
                <span className="mb-0.5 block text-xs text-stone-500">Phép toán đề xuất:</span>
                <KatexMath
                  math="[a] * [b] \stackrel{?}{=} [a * b]"
                  className="text-base font-bold text-stone-900"
                />
              </div>
              <span className="text-xl font-bold text-amber-800">⟹</span>
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 shadow-2xs">
                <span className="mb-0.5 block text-xs text-amber-800">Tiêu chuẩn kiểm tra:</span>
                <KatexMath
                  math="a \sim a' \text{ và } b \sim b' \implies a * b \sim a' * b' \quad (?)"
                  className="text-[14px] font-semibold text-amber-950"
                />
              </div>
            </div>

            <p className="mx-auto mt-3.5 max-w-2xl text-center text-xs text-stone-600 sm:text-[13px]">
              Vì cùng một lớp có vô số phần tử đại diện khác nhau, kết quả của phép toán{' '}
              <strong className="text-stone-900">
                bắt buộc phải độc lập hoàn toàn với việc lựa chọn đại diện
              </strong>
              .
            </p>
          </div>
        </section>

        {/* Hai mũi tên rẽ nhánh sang Tầng 4 */}
        <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700">
            <span>↙ Nhánh Đạt chuẩn</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-rose-700">
            <span>Nhánh Cảnh báo Vi phạm ↘</span>
          </div>
        </div>

        {/* =========================================================================
            TẦNG 4: HAI NHÁNH PHÂN CẤP KẾT QUẢ
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-stone-200 px-2 py-0.5 text-[11px] font-bold tracking-wider text-stone-800 uppercase">
              TẦNG 4 · HAI NHÁNH PHÂN CẤP KẾT QUẢ
            </span>
            <span className="h-px flex-1 bg-stone-200/80" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nhánh 1: Thỏa mãn tính xác định tốt */}
            <div className="space-y-3 rounded-xl border-2 border-emerald-300/80 bg-emerald-50/40 p-5 shadow-2xs">
              <div className="flex items-center justify-between gap-2 border-b border-emerald-200/70 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    ✓
                  </span>
                  <h4 className="font-serif text-[15px] font-bold text-emerald-950">
                    Thỏa mãn tính Xác định tốt
                  </h4>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  Cấu trúc hợp lệ
                </span>
              </div>

              <p className="text-[13.5px] leading-relaxed text-stone-800">
                Hình thành <strong>Cấu trúc đại số thương</strong> hoàn chỉnh, mở đường cho toàn bộ
                các chương tiếp theo của môn học:
              </p>

              <ul className="space-y-2 text-[13px] text-stone-700">
                <li className="flex items-start gap-2 rounded-lg border border-emerald-200/60 bg-white/90 p-2.5">
                  <span className="font-bold text-emerald-700">•</span>
                  <span>
                    <strong className="text-stone-900">Tập thương các lớp đồng dư:</strong>{' '}
                    <KatexMath math="\mathbb{Z}/n\mathbb{Z} = \{[0]_n, [1]_n, \dots, [n-1]_n\}" />{' '}
                    với phép cộng và phép nhân lớp đồng dư.
                  </span>
                </li>
                <li className="flex items-start gap-2 rounded-lg border border-emerald-200/60 bg-white/90 p-2.5">
                  <span className="font-bold text-emerald-700">•</span>
                  <span>
                    <strong className="text-stone-900">Các lớp đồng dư khả nghịch:</strong>{' '}
                    <KatexMath math="U(n) = (\mathbb{Z}/n\mathbb{Z})^\times" /> gồm các lớp{' '}
                    <KatexMath math="[a]_n" /> với <KatexMath math="\gcd(a, n) = 1" />.
                  </span>
                </li>
                <li className="flex items-start gap-2 rounded-lg border border-emerald-200/60 bg-white/90 p-2.5">
                  <span className="font-bold text-emerald-700">•</span>
                  <span>
                    <strong className="text-stone-900">Nền tảng cấu trúc thương:</strong> Chuẩn bị
                    trực tiếp cho phép chia lớp kề (Chương 3) và nhóm thương{' '}
                    <KatexMath math="G/N" /> (Chương 4).
                  </span>
                </li>
              </ul>
            </div>

            {/* Nhánh 2: Vi phạm tính xác định tốt */}
            <div className="space-y-3 rounded-xl border-2 border-rose-300/80 bg-rose-50/40 p-5 shadow-2xs">
              <div className="flex items-center justify-between gap-2 border-b border-rose-200/70 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                    ✕
                  </span>
                  <h4 className="font-serif text-[15px] font-bold text-rose-950">
                    Vi phạm tính Xác định tốt
                  </h4>
                </div>
                <span className="rounded bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800">
                  Phụ thuộc đại diện
                </span>
              </div>

              <p className="text-[13.5px] leading-relaxed text-stone-800">
                <strong className="text-rose-950">Cảnh báo sai lầm kinh điển:</strong> Quy tắc gán
                bị phụ thuộc vào phần tử đại diện nên hoàn toàn vô nghĩa và làm phép toán sụp đổ:
              </p>

              <div className="space-y-2 rounded-lg border border-rose-200/70 bg-white/90 p-3">
                <p className="text-xs font-bold tracking-wide text-rose-900 uppercase">
                  Phản ví dụ kinh điển trên tập hợp số hữu tỉ <KatexMath math="\mathbb{Q}" />:
                </p>
                <p className="text-[13px] text-stone-700">
                  Định nghĩa quy tắc gán: <KatexMath math="f\left(\frac{a}{b}\right) = a + b" />.
                </p>
                <div className="rounded bg-rose-50 p-2 text-center text-xs font-medium text-rose-950">
                  Ta có <KatexMath math="\frac{1}{2} = \frac{2}{4}" /> nhưng{' '}
                  <KatexMath math="f\left(\frac{1}{2}\right) = 3 \neq f\left(\frac{2}{4}\right) = 6" />
                  !
                </div>
                <p className="text-[12px] text-stone-500 italic">
                  Cùng một phân số nhưng chọn đại diện khác nhau cho ra kết quả khác nhau. Do đó{' '}
                  <KatexMath math="f" /> không phải là một ánh xạ hợp lệ!
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
