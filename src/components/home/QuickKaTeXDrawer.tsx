import { ArrowRight, Check, Copy, Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { getAllGlossaryEntries, KatexMath } from '@/features/math-glossary';
import { cn } from '@/shared/lib/cn';
import { matchesVietnameseQuery } from '@/shared/lib/vietnamese';

export type KaTeXCategory = 'all' | 'algebra' | 'geometry' | 'calculus' | 'logic';

export interface QuickKaTeXItem {
  readonly id: string;
  readonly category: Exclude<KaTeXCategory, 'all'>;
  readonly categoryLabel: string;
  readonly nameVi: string;
  readonly nameEn: string;
  readonly formula: string;
  readonly latexCode: string;
  readonly brief: string;
}

/**
 * Danh mục ký hiệu & công thức KaTeX tiêu chuẩn bổ sung cho cả 4 phân nhánh:
 * Đại số, Hình học, Giải tích và Logic học thuật.
 */
export const CURATED_KATEX_ITEMS: readonly QuickKaTeXItem[] = [
  {
    id: 'katex-iso-thm-1',
    category: 'algebra',
    categoryLabel: 'Đại số',
    nameVi: 'Định lý Đẳng cấu thứ nhất',
    nameEn: 'First Isomorphism Theorem',
    formula: 'G / \\ker(\\varphi) \\cong \\operatorname{Im}(\\varphi)',
    latexCode: 'G / \\ker(\\varphi) \\cong \\text{Im}(\\varphi)',
    brief: 'Nhóm thương theo hạt nhân đẳng cấu với ảnh của đồng cấu nhóm.',
  },
  {
    id: 'katex-normal-subgroup',
    category: 'algebra',
    categoryLabel: 'Đại số',
    nameVi: 'Nhóm con chuẩn tắc',
    nameEn: 'Normal Subgroup',
    formula: 'N \\trianglelefteq G \\iff \\forall g \\in G,\\; gNg^{-1} = N',
    latexCode: 'N \\trianglelefteq G',
    brief: 'Nhóm con bất biến dưới phép liên hợp bởi mọi phần tử trong G.',
  },
  {
    id: 'katex-lagrange-index',
    category: 'algebra',
    categoryLabel: 'Đại số',
    nameVi: 'Định lý Lagrange & Chỉ số nhóm con',
    nameEn: "Lagrange's Theorem",
    formula: '|G| = [G : H] \\cdot |H|',
    latexCode: '|G| = [G : H] \\cdot |H|',
    brief: 'Cấp của nhóm hữu hạn chia hết cho cấp của mọi nhóm con của nó.',
  },
  {
    id: 'katex-quotient-ring',
    category: 'algebra',
    categoryLabel: 'Đại số',
    nameVi: 'Vành thương theo Idean',
    nameEn: 'Quotient Ring',
    formula: 'R / I = \\{ r + I \\mid r \\in R \\}',
    latexCode: 'R / I = \\{ r + I \\mid r \\in R \\}',
    brief: 'Cấu trúc vành các lớp kề của idean hai phía I trong vành R.',
  },
  {
    id: 'katex-chasles-relation',
    category: 'geometry',
    categoryLabel: 'Hình học',
    nameVi: 'Hệ thức Chasles trong không gian Affine',
    nameEn: "Chasles' Relation",
    formula: '\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}',
    latexCode: '\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}',
    brief: 'Tiên đề cộng véc-tơ nền tảng định nghĩa cấu trúc không gian Affine.',
  },
  {
    id: 'katex-barycenter',
    category: 'geometry',
    categoryLabel: 'Hình học',
    nameVi: 'Tâm tỉ cự của hệ điểm',
    nameEn: 'Barycenter of Points',
    formula: '\\sum_{i=1}^{n} \\alpha_i \\overrightarrow{GA_i} = \\vec{0}',
    latexCode: '\\sum_{i=1}^{n} \\alpha_i \\overrightarrow{GA_i} = \\vec{0}',
    brief: 'Điểm duy nhất xác định bởi hệ điểm có tổng trọng số khác không.',
  },
  {
    id: 'katex-grassmann-affine',
    category: 'geometry',
    categoryLabel: 'Hình học',
    nameVi: 'Công thức chiều không gian con',
    nameEn: 'Dimension Formula',
    formula: '\\dim(U + V) = \\dim U + \\dim V - \\dim(U \\cap V)',
    latexCode: '\\dim(U + V) = \\dim U + \\dim V - \\dim(U \\cap V)',
    brief: 'Liên hệ số chiều của tổng và giao hai không gian véc-tơ con.',
  },
  {
    id: 'katex-limit-infinity',
    category: 'calculus',
    categoryLabel: 'Giải tích',
    nameVi: 'Giới hạn tại vô cùng',
    nameEn: 'Limit at Infinity',
    formula: '\\lim_{x \\to \\infty} f(x) = L',
    latexCode: '\\lim_{x \\to \\infty} f(x) = L',
    brief: 'Giá trị hàm số hội tụ về hằng số L khi biến số tiến ra vô cực.',
  },
  {
    id: 'katex-newton-leibniz',
    category: 'calculus',
    categoryLabel: 'Giải tích',
    nameVi: 'Công thức Newton – Leibniz',
    nameEn: 'Fundamental Theorem of Calculus',
    formula: '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)',
    latexCode: '\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)',
    brief: 'Liên hệ giữa tích phân xác định Riemann và nguyên hàm trên đoạn [a, b].',
  },
  {
    id: 'katex-taylor-series',
    category: 'calculus',
    categoryLabel: 'Giải tích',
    nameVi: 'Khai triển Taylor có phần dư',
    nameEn: "Taylor's Formula",
    formula: 'f(x) = \\sum_{k=0}^{n} \\frac{f^{(k)}(x_0)}{k!}(x - x_0)^k + R_n(x)',
    latexCode: '\\sum_{k=0}^{n} \\frac{f^{(k)}(x_0)}{k!}(x - x_0)^k',
    brief: 'Xấp xỉ hàm khả vi cấp cao bằng đa thức tại lân cận điểm x₀.',
  },
  {
    id: 'katex-logic-epsilon-delta',
    category: 'logic',
    categoryLabel: 'Logic',
    nameVi: 'Lượng từ Định nghĩa Giới hạn Cauchy',
    nameEn: 'Epsilon-Delta Quantifiers',
    formula:
      '\\forall \\varepsilon > 0,\\; \\exists \\delta > 0 : 0 < |x - x_0| < \\delta \\implies |f(x) - L| < \\varepsilon',
    latexCode: '\\forall \\varepsilon > 0, \\exists \\delta > 0',
    brief: 'Mệnh đề lượng từ phổ dụng và tồn tại trong ngôn ngữ giải tích chặt chẽ.',
  },
  {
    id: 'katex-logic-equivalence',
    category: 'logic',
    categoryLabel: 'Logic',
    nameVi: 'Quan hệ Tương đương & Tập thương',
    nameEn: 'Equivalence Relation',
    formula: 'x \\sim y \\iff [x] = [y] \\in X / {\\sim}',
    latexCode: 'x \\sim y \\iff [x] = [y]',
    brief: 'Quan hệ phản xạ, đối xứng, bắc cầu phân hoạch tập hợp thành các lớp tương đương.',
  },
  {
    id: 'katex-logic-bijection',
    category: 'logic',
    categoryLabel: 'Logic',
    nameVi: 'Song ánh (Đơn ánh & Toàn ánh)',
    nameEn: 'Bijective Mapping',
    formula:
      'f : A \\xrightarrow{\\sim} B \\iff \\forall y \\in B,\\; \\exists! x \\in A : f(x) = y',
    latexCode: '\\forall y \\in B, \\exists! x \\in A : f(x) = y',
    brief: 'Ánh xạ một-một và lên trên, đảm bảo sự tồn tại ánh xạ ngược.',
  },
  {
    id: 'katex-logic-set-operations',
    category: 'logic',
    categoryLabel: 'Logic',
    nameVi: 'Luật đối ngẫu De Morgan cho họ tập hợp',
    nameEn: "De Morgan's Laws",
    formula: 'X \\setminus \\bigcup_{i \\in I} A_i = \\bigcap_{i \\in I} (X \\setminus A_i)',
    latexCode: 'X \\setminus \\bigcup_{i \\in I} A_i = \\bigcap_{i \\in I} (X \\setminus A_i)',
    brief: 'Phần bù của hợp một họ tập hợp bằng giao các phần bù của chúng.',
  },
] as const;

export interface QuickKaTeXDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

const CATEGORY_TABS: readonly { id: KaTeXCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'algebra', label: 'Đại số' },
  { id: 'geometry', label: 'Hình học' },
  { id: 'calculus', label: 'Giải tích' },
  { id: 'logic', label: 'Logic' },
] as const;

export function QuickKaTeXDrawer({ isOpen, onClose }: QuickKaTeXDrawerProps) {
  const searchInputId = useId();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [activeCategory, setActiveCategory] = useState<KaTeXCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tích hợp thêm dữ liệu từ kho từ điển chung để phong phú hóa tra cứu
  const combinedItems = useMemo<readonly QuickKaTeXItem[]>(() => {
    const glossaryEntries = getAllGlossaryEntries();
    const mappedFromGlossary: QuickKaTeXItem[] = glossaryEntries.slice(0, 18).map((entry) => {
      const category: Exclude<KaTeXCategory, 'all'> =
        entry.subject === 'cau-truc-dai-so'
          ? 'algebra'
          : entry.subject === 'hinh-hoc-affine'
            ? 'geometry'
            : 'calculus';
      const categoryLabel =
        category === 'algebra' ? 'Đại số' : category === 'geometry' ? 'Hình học' : 'Giải tích';

      return {
        id: `glossary-${entry.id}`,
        category,
        categoryLabel,
        nameVi: entry.nameVi,
        nameEn: entry.nameEn,
        formula: entry.symbol,
        latexCode: entry.symbol,
        brief: entry.brief,
      };
    });

    return [...CURATED_KATEX_ITEMS, ...mappedFromGlossary];
  }, []);

  const filteredItems = useMemo(() => {
    return combinedItems.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim().length > 0) {
        const haystack = `${item.nameVi} ${item.nameEn} ${item.latexCode} ${item.brief} ${item.categoryLabel}`;
        return matchesVietnameseQuery(haystack, searchQuery);
      }
      return true;
    });
  }, [activeCategory, combinedItems, searchQuery]);

  // Tự động focus vào ô tìm kiếm khi mở ngăn kéo & lắng nghe phím Escape
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 80);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopyLatex = async (item: QuickKaTeXItem) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(item.latexCode);
      }
    } catch {
      // Dự phòng nếu môi trường kiểm thử không hỗ trợ clipboard API
    }
    setCopiedId(item.id);
    window.setTimeout(() => {
      setCopiedId((prev) => (prev === item.id ? null : prev));
    }, 1800);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      data-testid="quick-katex-drawer-root"
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Tra cứu Thuật ngữ & Ký hiệu KaTeX"
    >
      {/* Vùng phủ mờ Backdrop */}
      <div
        data-testid="quick-katex-backdrop"
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-[#29383D]/35 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Ngăn kéo trượt từ mép phải */}
      <aside
        data-testid="quick-katex-drawer-panel"
        className="fixed top-0 right-0 z-50 flex h-full w-[420px] max-w-[92vw] translate-x-0 flex-col border-l border-[#CFDADB] bg-[#F7FAFA] shadow-2xl transition-transform duration-300 ease-out"
      >
        {/* Header ngăn kéo */}
        <div className="space-y-3.5 border-b border-[#CFDADB] bg-[#EAF0F1]/70 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-[10px] font-semibold tracking-widest text-[#3F6570] uppercase">
                QUICK KATEX LEXICON · SHIFT + K
              </span>
              <h2 className="mt-0.5 font-serif text-lg font-semibold text-[#29383D]">
                Tra cứu Thuật ngữ &amp; Ký hiệu KaTeX
              </h2>
              <p className="mt-0.5 text-xs text-[#55676B]">
                Hệ thống ký hiệu Toán học và cú pháp mã nguồn trực quan.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng (Esc)"
              className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-[#CFDADB] bg-[#F7FAFA] px-2.5 py-1.5 font-mono text-[11px] font-medium text-[#55676B] transition-colors hover:border-[#3F6570] hover:text-[#29383D]"
            >
              <span>Đóng (Esc)</span>
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>

          {/* Ô tìm kiếm nhanh */}
          <div className="relative">
            <label htmlFor={searchInputId} className="sr-only">
              Tìm kiếm ký hiệu hoặc mã LaTeX
            </label>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#55676B]"
              aria-hidden="true"
            />
            <input
              id={searchInputId}
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm tên thuật ngữ, \ker, \lim, \forall..."
              className="w-full rounded-xl border border-[#CFDADB] bg-white py-2 pr-8 pl-9 text-xs text-[#29383D] outline-none placeholder:text-[#55676B]/70 focus:border-[#3F6570]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Xóa từ khóa tra cứu KaTeX"
                className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-0.5 text-[#55676B] hover:text-[#29383D]"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Các tab danh mục compact: [Tất cả] [Đại số] [Hình học] [Giải tích] [Logic] */}
          <div
            role="tablist"
            aria-label="Danh mục ký hiệu KaTeX"
            className="flex flex-wrap items-center gap-1.5"
          >
            {CATEGORY_TABS.map((tab) => {
              const isSelected = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveCategory(tab.id)}
                  className={cn(
                    'cursor-pointer rounded-lg px-2.5 py-1 font-mono text-[11px] font-medium transition-colors',
                    isSelected
                      ? 'bg-[#3F6570] text-white shadow-2xs'
                      : 'border border-[#CFDADB] bg-[#F7FAFA] text-[#55676B] hover:border-[#3F6570]/50 hover:text-[#29383D]',
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Thân ngăn kéo (Scrollable Body) */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-[#CFDADB] bg-white p-8 text-center">
              <p className="font-serif text-sm font-semibold text-[#29383D]">
                Không tìm thấy ký hiệu phù hợp.
              </p>
              <p className="mt-1 text-xs text-[#55676B]">
                Hãy thử tìm bằng từ khóa khác hoặc chuyển sang tab &ldquo;Tất cả&rdquo;.
              </p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  data-testid="katex-drawer-item"
                  className="flex flex-col justify-between gap-2.5 rounded-xl border border-[#CFDADB]/60 bg-white p-3 transition-colors hover:border-[#3F6570]"
                >
                  {/* Hàng trên: Cột trái (KaTeX + Tên Việt - Anh) & Cột phải (Nút Chép mã) */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="rounded bg-[#E1E9EA] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#3F6570]">
                          {item.categoryLabel}
                        </span>
                        <h3 className="font-serif text-xs font-bold text-[#29383D]">
                          {item.nameVi}
                        </h3>
                        <span className="text-[11px] text-[#55676B] italic">({item.nameEn})</span>
                      </div>

                      <div className="overflow-x-auto rounded-lg bg-[#F7FAFA] px-2.5 py-1.5 text-sm text-[#29383D]">
                        <KatexMath math={item.formula} />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => void handleCopyLatex(item)}
                      aria-label={`Chép mã LaTeX cho ${item.nameVi}`}
                      className={cn(
                        'inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors',
                        isCopied
                          ? 'border-[#5E786D] bg-[#5E786D] text-white'
                          : 'border-[#CFDADB] bg-[#F7FAFA] text-[#3F6570] hover:bg-[#E1E9EA]',
                      )}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3" aria-hidden="true" />
                          <span>Đã sao chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" aria-hidden="true" />
                          <span>Chép mã</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Hàng dưới: Mã nguồn LaTeX gốc & Tóm tắt nghĩa */}
                  <div className="flex flex-col gap-1 border-t border-[#CFDADB]/40 pt-2">
                    <code className="overflow-x-auto rounded bg-[#EAF0F1]/80 px-2 py-1 font-mono text-[11px] text-[#3F6570]">
                      {item.latexCode}
                    </code>
                    <p className="text-[11px] leading-relaxed text-[#55676B]">{item.brief}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer ngăn kéo */}
        <div className="border-t border-[#CFDADB] bg-[#EAF0F1]/80 p-4">
          <Link
            to="/glossary"
            onClick={onClose}
            className="inline-flex w-full items-center justify-between rounded-xl border border-[#CFDADB] bg-[#F7FAFA] px-4 py-2.5 text-xs font-semibold text-[#29383D] transition-colors hover:border-[#3F6570] hover:bg-[#3F6570] hover:text-white"
          >
            <span>Mở toàn bộ Từ điển Thuật ngữ KaTeX</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </aside>
    </div>
  );
}
