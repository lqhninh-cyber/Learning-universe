import { KatexMath } from '@/features/math-glossary/KatexMath';
import { cn } from '@/shared/lib/cn';

export interface Chapter7KnowledgeMapProps {
  readonly className?: string;
  readonly title?: string;
}

export function Chapter7KnowledgeMap({
  className,
  title = 'Bản đồ tri thức',
}: Chapter7KnowledgeMapProps) {
  return (
    <div
      data-testid="chapter7-knowledge-map"
      className={cn(
        'my-8 overflow-hidden rounded-2xl border border-stone-300 bg-[#fbf9f5]/90 p-6 shadow-sm transition-all duration-200',
        className,
      )}
    >
      {/* Khung tiêu đề học thuật trang nhã */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/90 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-800/10 text-sm text-amber-900">
              🏛️
            </span>
            <h3 className="font-serif text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
              {title}
            </h3>
          </div>
          <p className="mt-1 text-xs text-stone-600 sm:text-[13px]">
            Hệ thống hóa toàn diện mạng lưới khái niệm: từ Tiên đề Iđêan đến Vành thương và Phân
            loại cấu trúc
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-md border border-amber-800/20 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
            Chương 7 · Cấu trúc đại số
          </span>
        </div>
      </div>

      {/* Lưới 4 khối kiến thức trung tâm */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* KHỐI 1: KHÁI NIỆM & PHÉP TOÁN IĐÊAN */}
        <div className="flex flex-col justify-between rounded-xl border border-indigo-200/80 bg-indigo-50/40 p-5 transition-shadow hover:shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-indigo-200/60 pb-2.5">
              <span className="font-serif text-[15px] font-bold text-indigo-950 sm:text-[16px]">
                1. Khái niệm & Phép toán Iđêan
              </span>
              <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800">
                01 · NỀN TẢNG
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-stone-800">
              <div className="rounded-lg border border-indigo-200/60 bg-white/90 p-3">
                <p className="font-medium text-indigo-950">
                  <span className="font-bold">Nhóm con cộng:</span>{' '}
                  <KatexMath math="(I, +) \le (R, +)" /> (tức đóng đối với phép trừ:{' '}
                  <KatexMath math="x - y \in I" /> với mọi <KatexMath math="x, y \in I" />
                  ).
                </p>
              </div>

              <div className="space-y-2 rounded-lg border border-indigo-200/60 bg-white/90 p-3">
                <p className="text-xs font-bold tracking-wide text-indigo-950 uppercase">
                  Điều kiện hấp thụ phép nhân:
                </p>
                <ul className="space-y-1.5 pl-1 text-[13.5px]">
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">•</span>
                    <span>
                      <strong className="text-stone-900">Iđêan trái:</strong>{' '}
                      <KatexMath math="rI \subseteq I" /> (với mọi{' '}
                      <KatexMath math="r \in R, x \in I \implies rx \in I" />
                      ).
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">•</span>
                    <span>
                      <strong className="text-stone-900">Iđêan phải:</strong>{' '}
                      <KatexMath math="Ir \subseteq I" /> (với mọi{' '}
                      <KatexMath math="r \in R, x \in I \implies xr \in I" />
                      ).
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-indigo-600">•</span>
                    <span>
                      <strong className="text-indigo-900">Iđêan hai phía:</strong>{' '}
                      <KatexMath math="rI \subseteq I \text{ và } Ir \subseteq I" /> (hấp thụ nhân
                      hai phía).
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-indigo-200/60 bg-white/90 p-3">
                <p className="mb-1.5 text-xs font-bold tracking-wide text-indigo-950 uppercase">
                  Phép toán trên Iđêan:
                </p>
                <p className="text-[13px] text-stone-700">
                  Giao <KatexMath math="I \cap J" />, Tổng{' '}
                  <KatexMath math="I + J = \{x + y \mid x \in I, y \in J\}" />, Tích{' '}
                  <KatexMath math="IJ = \left\{\sum x_i y_i\right\} \subseteq I \cap J" />, và Iđêan
                  chính <KatexMath math="(a) = Ra" />.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-indigo-200/50 pt-2 text-xs font-medium text-indigo-800">
            <span>Tiền đề cho cấu trúc thương</span>
            <span>↓ Sang Khối 2</span>
          </div>
        </div>

        {/* KHỐI 2: VÀNH THƯƠNG & TÍNH TOÁN */}
        <div className="flex flex-col justify-between rounded-xl border border-sky-200/80 bg-sky-50/40 p-5 transition-shadow hover:shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-sky-200/60 pb-2.5">
              <span className="font-serif text-[15px] font-bold text-sky-950 sm:text-[16px]">
                2. Vành thương & Tính toán
              </span>
              <span className="rounded bg-sky-100 px-2 py-0.5 text-[11px] font-bold text-sky-800">
                02 · THƯƠNG HÓA
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-stone-800">
              <div className="rounded-lg border border-sky-200/60 bg-white/90 p-3">
                <p className="font-medium text-sky-950">
                  <span className="font-bold">Vành thương:</span>{' '}
                  <KatexMath math="R/I = \{a + I \mid a \in R\}" /> gồm các lớp kề cộng.
                </p>
                <div className="mt-2 rounded border border-sky-100 bg-sky-50/80 p-2 text-center">
                  <KatexMath
                    math="(a+I)(b+I) = ab + I \text{ xác định tốt} \iff I \text{ là iđêan hai phía}"
                    display={false}
                    className="font-semibold text-sky-900"
                  />
                </div>
              </div>

              <div className="space-y-1.5 rounded-lg border border-sky-200/60 bg-white/90 p-3">
                <p className="text-xs font-bold tracking-wide text-sky-950 uppercase">
                  Vành đa thức thương <KatexMath math="F[x]/(f)" />:
                </p>
                <p className="text-[13px] text-stone-700">
                  Mỗi lớp có đại diện chuẩn duy nhất là phần dư <KatexMath math="r(x)" /> có{' '}
                  <KatexMath math="\deg r < \deg f" />. Không gian vector có chiều{' '}
                  <KatexMath math="\dim_F(F[x]/(f)) = \deg f" />.
                </p>
              </div>

              <div className="space-y-1.5 rounded-lg border border-sky-200/60 bg-white/90 p-3">
                <p className="text-xs font-bold tracking-wide text-sky-950 uppercase">
                  Bộ ba mô hình kinh điển:
                </p>
                <ul className="space-y-1 pl-1 text-[13px] text-stone-700">
                  <li>
                    • <KatexMath math="\mathbb{R}[x]/(x^2)" />: Vành số đối ngẫu (chứa phần tử lũy
                    linh <KatexMath math="\varepsilon^2 = 0" />
                    ).
                  </li>
                  <li>
                    • <KatexMath math="\mathbb{R}[x]/(x^2-1) \cong \mathbb{R} \times \mathbb{R}" />:
                    Có ước của không không tầm thường.
                  </li>
                  <li>
                    • <KatexMath math="\mathbb{R}[x]/(x^2+1) \cong \mathbb{C}" />: Mở rộng trường số
                    phức tuyệt đẹp.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-sky-200/50 pt-2 text-xs font-medium text-sky-800">
            <span>Đặc trưng cấu trúc thương</span>
            <span>↓ Sang Khối 3</span>
          </div>
        </div>

        {/* KHỐI 3: PHÂN LOẠI IĐÊAN */}
        <div className="flex flex-col justify-between rounded-xl border border-amber-200/80 bg-amber-50/50 p-5 transition-shadow hover:shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-2.5">
              <span className="font-serif text-[15px] font-bold text-amber-950 sm:text-[16px]">
                3. Phân loại Iđêan (R giao hoán có 1)
              </span>
              <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                03 · PHÂN LOẠI
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-stone-800">
              <div className="rounded-lg border border-amber-200/70 bg-white/90 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-bold text-amber-950">
                    Iđêan nguyên tố <KatexMath math="\mathfrak{p} \neq R" />:
                  </span>
                  <span className="rounded border border-amber-200/50 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                    Miền nguyên
                  </span>
                </div>
                <p className="text-[13px] text-stone-700">
                  <KatexMath math="ab \in \mathfrak{p} \implies (a \in \mathfrak{p} \lor b \in \mathfrak{p}) \iff R/\mathfrak{p} \text{ là miền nguyên}." />
                </p>
              </div>

              <div className="rounded-lg border border-amber-200/70 bg-white/90 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-bold text-amber-950">
                    Iđêan cực đại <KatexMath math="\mathfrak{m} \neq R" />:
                  </span>
                  <span className="rounded border border-amber-200/50 bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
                    Trường
                  </span>
                </div>
                <p className="text-[13px] text-stone-700">
                  Không bị chứa trong iđêan chân phương nào khác{' '}
                  <KatexMath math="\iff R/\mathfrak{m} \text{ là trường}." />
                </p>
              </div>

              <div className="space-y-1.5 rounded-lg border border-amber-200/70 bg-white/90 p-3 text-[13px]">
                <p className="text-xs font-bold tracking-wide text-amber-950 uppercase">
                  Mối liên hệ & Thang bậc:
                </p>
                <div className="space-y-1 text-stone-700">
                  <p className="flex items-center gap-1.5">
                    <span className="font-bold text-emerald-600">✔</span>
                    <span>
                      <strong className="text-stone-900">Luôn đúng:</strong> Mọi iđêan cực đại đều
                      là iđêan nguyên tố.
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="font-bold text-amber-700">★</span>
                    <span>
                      <strong className="text-stone-900">Trong Vành chính (PID):</strong> Mọi iđêan
                      nguyên tố <KatexMath math="\mathfrak{p} \neq \{0\}" /> đều là cực đại.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-amber-200/60 pt-2 text-xs font-medium text-amber-900">
            <span>Nền tảng cho hình học đại số</span>
            <span>↓ Sang Khối 4</span>
          </div>
        </div>

        {/* KHỐI 4: CÁC ĐỊNH LÝ SÂU SẮC */}
        <div className="flex flex-col justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-5 transition-shadow hover:shadow-xs">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 pb-2.5">
              <span className="font-serif text-[15px] font-bold text-emerald-950 sm:text-[16px]">
                4. Các Định lý Sâu sắc
              </span>
              <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-900">
                04 · ĐỈNH CAO
              </span>
            </div>

            <div className="mt-4 space-y-3.5 text-[14px] leading-relaxed text-stone-800">
              <div className="rounded-lg border border-emerald-200/60 bg-white/90 p-3">
                <p className="mb-1 text-xs font-bold tracking-wide text-emerald-950 uppercase">
                  Định lý Thặng dư Trung Hoa (CRT):
                </p>
                <p className="mb-1.5 text-[13px] text-stone-700">
                  Nếu hai iđêan nguyên tố cùng nhau (<KatexMath math="I + J = R" />
                  ), thì giao bằng tích (<KatexMath math="I \cap J = IJ" />) và:
                </p>
                <div className="rounded border border-emerald-100 bg-emerald-50/80 p-2 text-center">
                  <KatexMath
                    math="R/(I \cap J) \cong R/I \times R/J"
                    className="font-bold text-emerald-900"
                  />
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200/60 bg-white/90 p-3">
                <p className="mb-1 text-xs font-bold tracking-wide text-emerald-950 uppercase">
                  Căn lũy linh (Nilradical):
                </p>
                <p className="text-[13px] text-stone-700">
                  Tập tất cả các phần tử lũy linh <KatexMath math="\mathrm{Nil}(R)" /> chính bằng
                  giao của toàn bộ họ các iđêan nguyên tố:
                </p>
                <p className="mt-1.5 text-center font-serif text-[14px] text-emerald-950">
                  <KatexMath math="\mathrm{Nil}(R) = \bigcap_{\mathfrak{p} \text{ nguyên tố}} \mathfrak{p}" />
                </p>
              </div>

              <div className="rounded-lg border border-emerald-200/60 bg-white/90 p-3">
                <p className="mb-1 text-xs font-bold tracking-wide text-emerald-950 uppercase">
                  Vành đơn (Simple Ring):
                </p>
                <p className="text-[13px] text-stone-700">
                  Vành ma trận <KatexMath math="M_n(F)" /> trên trường <KatexMath math="F" /> chỉ có
                  hai iđêan hai phía là <KatexMath math="\{0\}" /> và chính{' '}
                  <KatexMath math="M_n(F)" /> (không tồn tại iđêan chân phương không tầm thường).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-emerald-200/50 pt-2 text-xs font-medium text-emerald-900">
            <span>Ứng dụng trong Đại số hiện đại</span>
            <span>Hoàn tất tổng kết Chương 7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
