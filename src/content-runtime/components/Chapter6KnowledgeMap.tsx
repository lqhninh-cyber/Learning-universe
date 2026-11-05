import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface Chapter6KnowledgeMapProps {
  readonly className?: string;
  readonly title?: string;
}

export function Chapter6KnowledgeMap({
  className,
  title = 'Bản đồ tri thức',
}: Chapter6KnowledgeMapProps) {
  return (
    <div
      data-testid="chapter6-knowledge-map"
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
            Hệ thống hóa toàn cảnh: Từ Nền tảng hai phép toán, Tiên đề Vành tổng quát đến Thang bậc
            Miền nguyên, Vành chia và Trường
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-amber-800/20 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
            Chương 6 · Vành & các Cấu trúc
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* =========================================================================
            TẦNG 1: NỀN TẢNG HAI PHÉP TOÁN
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-indigo-900 uppercase">
              TẦNG 1 · NỀN TẢNG HAI PHÉP TOÁN
            </span>
            <span className="h-px flex-1 bg-indigo-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Hộp A: Nhóm cộng Abel */}
            <div className="flex flex-col justify-between rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                  <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                    Hộp A · Nhóm cộng Abel <KatexMath math="(R, +)" />
                  </h4>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    Cộng Abel
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-700">
                  <p>
                    <strong className="text-stone-900">Phép cộng nội tại:</strong> Đóng, kết hợp, và
                    có tính giao hoán:
                  </p>
                  <div className="rounded-lg border border-indigo-100/80 bg-indigo-50/70 p-2 text-center text-xs">
                    <KatexMath math="a + b = b + a \quad (\forall a, b \in R)" />
                  </div>
                  <ul className="space-y-1 text-xs text-stone-600">
                    <li>
                      • <strong className="text-stone-800">Phần tử không:</strong> Tồn tại duy nhất{' '}
                      <KatexMath math="0_R" /> sao cho <KatexMath math="a + 0_R = a" />.
                    </li>
                    <li>
                      • <strong className="text-stone-800">Phần tử đối:</strong> Mọi{' '}
                      <KatexMath math="a" /> đều có <KatexMath math="-a" /> thỏa{' '}
                      <KatexMath math="a + (-a) = 0_R" />.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Hộp B: Nửa nhóm nhân */}
            <div className="flex flex-col justify-between rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                  <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                    Hộp B · Nửa nhóm nhân <KatexMath math="(R, \cdot)" />
                  </h4>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    Nửa nhóm
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-700">
                  <p>
                    <strong className="text-stone-900">Phép nhân hai ngôi:</strong> Đóng đối với
                    phép nhân và có tính kết hợp:
                  </p>
                  <div className="rounded-lg border border-indigo-100/80 bg-indigo-50/70 p-2 text-center text-xs">
                    <KatexMath math="(a \cdot b) \cdot c = a \cdot (b \cdot c)" />
                  </div>
                  <p className="text-xs text-stone-600">
                    * Không mặc định giao hoán (<KatexMath math="ab" /> có thể khác{' '}
                    <KatexMath math="ba" />) và không mặc định có đơn vị <KatexMath math="1_R" />.
                  </p>
                </div>
              </div>
            </div>

            {/* Hộp C: Luật phân phối hai phía */}
            <div className="flex flex-col justify-between rounded-xl border border-indigo-200/80 bg-white/90 p-4 shadow-2xs">
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-indigo-100 pb-2">
                  <h4 className="font-serif text-[15px] font-bold text-indigo-950">
                    Hộp C · Phân phối hai phía
                  </h4>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    Nhịp cầu
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-700">
                  <p>
                    <strong className="text-stone-900">Liên kết cộng và nhân:</strong> Phép nhân
                    phân phối đối với phép cộng cả hai phía:
                  </p>
                  <div className="space-y-1.5 rounded-lg border border-indigo-100/80 bg-indigo-50/70 p-2 text-center text-xs">
                    <div>
                      <KatexMath math="a(b + c) = ab + ac" />
                    </div>
                    <div>
                      <KatexMath math="(b + c)a = ba + ca" />
                    </div>
                  </div>
                  <p className="text-xs text-stone-600">
                    Mối liên hệ duy nhất gắn kết hai phép toán đại số trừu tượng.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 1 -> 2 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Hợp nhất ba trụ cột cấu trúc tạo thành Vành</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 2: VÀNH TỔNG QUÁT (RING)
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-sky-900 uppercase">
              TẦNG 2 · VÀNH TỔNG QUÁT (RING)
            </span>
            <span className="h-px flex-1 bg-sky-200/60" />
          </div>

          {/* Khối trung tâm: Vành tổng quát */}
          <div className="space-y-4 rounded-2xl border border-sky-300/80 bg-sky-50/30 p-5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/70 pb-3">
              <div>
                <h4 className="font-serif text-base font-bold text-sky-950 sm:text-lg">
                  Khối trung tâm · Vành <KatexMath math="(R, +, \cdot)" />
                </h4>
                <p className="mt-0.5 text-xs text-stone-600">
                  Quy tắc tính toán cốt lõi: <KatexMath math="a \cdot 0_R = 0_R \cdot a = 0_R" />,{' '}
                  <KatexMath math="(-a)b = a(-b) = -(ab)" />, <KatexMath math="(-a)(-b) = ab" />.
                </p>
              </div>
              <span className="rounded-full bg-sky-100 px-3 py-0.5 text-xs font-bold text-sky-900">
                Ring Structure
              </span>
            </div>

            {/* Hai cực đối kháng */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Cực 1: Phần tử khả nghịch */}
              <div className="space-y-2 rounded-xl border border-sky-200/90 bg-white/95 p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                  <span className="font-serif text-[14.5px] font-bold text-stone-900">
                    Cực 1 · Nhóm phần tử khả nghịch <KatexMath math="(R^\times, \cdot)" />
                  </span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    Units
                  </span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-stone-700">
                  Phần tử <KatexMath math="u \in R" /> khả nghịch nếu tồn tại{' '}
                  <KatexMath math="v \in R" /> sao cho:
                </p>
                <div className="rounded bg-sky-50/80 p-2 text-center text-xs font-semibold text-sky-950">
                  <KatexMath math="u \cdot v = v \cdot u = 1_R \quad (v = u^{-1})" />
                </div>
                <p className="text-xs text-stone-600">
                  Tập hợp <KatexMath math="R^\times" /> lập thành một nhóm nhân theo phép nhân của
                  vành. Ví dụ: <KatexMath math="\mathbb{Z}^\times = \{-1, 1\}" />.
                </p>
              </div>

              {/* Cực 2: Ước của không */}
              <div className="space-y-2 rounded-xl border border-sky-200/90 bg-white/95 p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-sky-100 pb-2">
                  <span className="font-serif text-[14.5px] font-bold text-stone-900">
                    Cực 2 · Tập các ước của không
                  </span>
                  <span className="rounded bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-800">
                    Zero Divisors
                  </span>
                </div>
                <p className="text-[13.5px] leading-relaxed text-stone-700">
                  Phần tử <KatexMath math="a \neq 0_R" /> là ước của không nếu tồn tại{' '}
                  <KatexMath math="b \neq 0_R" /> sao cho:
                </p>
                <div className="rounded bg-rose-50/80 p-2 text-center text-xs font-semibold text-rose-950">
                  <KatexMath math="a \cdot b = 0_R \quad \text{hoặc} \quad b \cdot a = 0_R" />
                </div>
                <p className="text-xs text-stone-600">
                  Sự tồn tại ước của không làm hỏng luật giản ước (tồn tại{' '}
                  <KatexMath math="ab = ac" /> nhưng <KatexMath math="b \neq c" />
                  ).
                </p>
              </div>
            </div>

            {/* Định lý then chốt: Tính rời nhau tuyệt đối */}
            <div className="rounded-xl border border-sky-200 bg-sky-100/60 p-3 text-center text-[13.5px] font-medium text-sky-950">
              <span className="font-bold text-sky-900">Định lý then chốt:</span>{' '}
              <KatexMath math="R^\times \cap (\text{Ước của không}) = \varnothing" /> — Phần tử khả
              nghịch <strong className="text-stone-900">không bao giờ</strong> là ước của không!
            </div>
          </div>
        </section>

        {/* Mũi tên chuyển tầng 2 -> 3 */}
        <div className="flex justify-center text-stone-400">
          <span className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3.5 py-1 text-xs font-medium text-stone-600 shadow-2xs">
            <span>Phân hóa theo điều kiện triệt tiêu ước của 0 và mức độ khả nghịch</span>
            <span className="text-stone-400">↓</span>
          </span>
        </div>

        {/* =========================================================================
            TẦNG 3: THANG BẬC PHÂN HÓA CẤU TRÚC
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase">
              TẦNG 3 · THANG BẬC PHÂN HÓA CẤU TRÚC
            </span>
            <span className="h-px flex-1 bg-amber-200/60" />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Nhánh trái: Miền nguyên */}
            <div className="flex flex-col justify-between space-y-3 rounded-xl border border-amber-300/80 bg-amber-50/40 p-5 shadow-2xs">
              <div>
                <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                  <h4 className="font-serif text-[15px] font-bold text-amber-950 sm:text-base">
                    Nhánh Trái · Miền nguyên (Integral Domain)
                  </h4>
                  <span className="rounded bg-amber-200/70 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                    Không ước của 0
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-700">
                  <p>
                    <strong className="text-stone-900">Điều kiện định nghĩa:</strong> Vành giao
                    hoán, có đơn vị <KatexMath math="1_R \neq 0_R" />, và{' '}
                    <strong className="text-stone-900">không có ước của không</strong>:
                  </p>
                  <div className="rounded-lg border border-amber-200/70 bg-white/90 p-2 text-center text-xs font-semibold text-amber-950">
                    <KatexMath math="a \cdot b = 0_R \implies a = 0_R \quad \lor \quad b = 0_R" />
                  </div>
                  <p>
                    <strong className="text-stone-900">Luật giản ước nghiệm đúng:</strong> Nếu{' '}
                    <KatexMath math="a \neq 0_R" /> và <KatexMath math="ab = ac" /> thì suy ra{' '}
                    <KatexMath math="b = c" />.
                  </p>
                  <div className="pt-1 text-xs text-stone-600">
                    <strong>Ví dụ tiêu biểu:</strong> Vành số nguyên <KatexMath math="\mathbb{Z}" />
                    , vành đa thức hệ số thực <KatexMath math="\mathbb{R}[x]" />.
                  </div>
                </div>
              </div>
            </div>

            {/* Nhánh phải: Vành chia / Thể */}
            <div className="flex flex-col justify-between space-y-3 rounded-xl border border-amber-300/80 bg-amber-50/40 p-5 shadow-2xs">
              <div>
                <div className="flex items-center justify-between border-b border-amber-200 pb-2.5">
                  <h4 className="font-serif text-[15px] font-bold text-amber-950 sm:text-base">
                    Nhánh Phải · Vành chia / Thể (Division Ring)
                  </h4>
                  <span className="rounded bg-amber-200/70 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                    Khả nghịch tối đa
                  </span>
                </div>

                <div className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-stone-700">
                  <p>
                    <strong className="text-stone-900">Điều kiện định nghĩa:</strong> Vành có đơn vị{' '}
                    <KatexMath math="1_R \neq 0_R" /> và{' '}
                    <strong className="text-stone-900">
                      mọi phần tử khác không đều khả nghịch
                    </strong>
                    :
                  </p>
                  <div className="rounded-lg border border-amber-200/70 bg-white/90 p-2 text-center text-xs font-semibold text-amber-950">
                    <KatexMath math="R^\times = R \setminus \{0_R\}" />
                  </div>
                  <p>
                    <strong className="text-stone-900">Đặc trưng:</strong> Phép nhân không bắt buộc
                    giao hoán. Vành chia tự động không có ước của không.
                  </p>
                  <div className="pt-1 text-xs text-stone-600">
                    <strong>Ví dụ tiêu biểu:</strong> Thể Quaternion Hamilton{' '}
                    <KatexMath math="\mathbb{H}" /> (không giao hoán,{' '}
                    <KatexMath math="ij = -ji = k" />
                    ).
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hai mũi tên hội tụ về Tầng 4 */}
        <div className="grid grid-cols-1 gap-4 text-center md:grid-cols-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
            <span>Bổ sung tính khả nghịch của mọi phần tử khác 0 ↘</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
            <span>↙ Bổ sung tính giao hoán của phép nhân</span>
          </div>
        </div>

        {/* =========================================================================
            TẦNG 4: ĐỈNH CAO CẤU TRÚC — TRƯỜNG (FIELD)
            ========================================================================= */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold tracking-wider text-emerald-900 uppercase">
              TẦNG 4 · ĐỈNH CAO CẤU TRÚC — TRƯỜNG (FIELD)
            </span>
            <span className="h-px flex-1 bg-emerald-200/60" />
          </div>

          <div className="space-y-4 rounded-2xl border-2 border-emerald-300/80 bg-gradient-to-b from-emerald-50/70 to-white p-5 shadow-xs">
            <div className="text-center">
              <span className="inline-block rounded-full bg-emerald-200/80 px-3.5 py-0.5 text-[11.5px] font-bold tracking-wide text-emerald-950 uppercase">
                Đỉnh cao Hội tụ Đại số hai phép toán
              </span>
              <h4 className="mt-2 font-serif text-lg font-bold text-emerald-950 sm:text-xl">
                TRƯỜNG (Field <KatexMath math="\mathbb{F}" />)
              </h4>
              <p className="mt-1 text-xs text-stone-600 sm:text-[13.5px]">
                <strong className="text-stone-800">Định nghĩa:</strong> Vành chia giao hoán — vừa là
                Miền nguyên, vừa là Thể.
              </p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white/90 p-4 text-center text-sm shadow-2xs">
              <KatexMath
                math="(\mathbb{F}, +) \text{ là nhóm Abel}, \quad (\mathbb{F} \setminus \{0\}, \cdot) \text{ là nhóm Abel}, \quad \text{phân phối hai phía}"
                className="font-medium text-emerald-950"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 text-xs">
                <span className="block text-sm font-bold text-emerald-950">
                  Định lý Wedderburn & Tính Hữu hạn
                </span>
                <p className="leading-relaxed text-stone-700">
                  • <strong>Định lý Miền nguyên hữu hạn:</strong> Mọi miền nguyên hữu hạn đều là một
                  trường (<KatexMath math="\text{Miền nguyên hữu hạn} \implies \text{Trường}" />
                  ).
                </p>
                <p className="leading-relaxed text-stone-700">
                  • <strong>Định lý Wedderburn:</strong> Mọi vành chia hữu hạn đều là một trường
                  (phép nhân hữu hạn tự động giao hoán).
                </p>
              </div>

              <div className="space-y-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 text-xs">
                <span className="block text-sm font-bold text-emerald-950">
                  Hệ thống Ví dụ Kinh điển
                </span>
                <p className="leading-relaxed text-stone-700">
                  • <strong>Trường vô hạn:</strong> Số hữu tỉ <KatexMath math="\mathbb{Q}" />, số
                  thực <KatexMath math="\mathbb{R}" />, số phức <KatexMath math="\mathbb{C}" />.
                </p>
                <p className="leading-relaxed text-stone-700">
                  • <strong>Trường hữu hạn (Trường Galois):</strong>{' '}
                  <KatexMath math="\mathbb{Z}/p\mathbb{Z} \cong \mathbb{F}_p" /> với{' '}
                  <KatexMath math="p" /> là số nguyên tố, và tổng quát{' '}
                  <KatexMath math="\mathbb{F}_{p^n}" />.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
