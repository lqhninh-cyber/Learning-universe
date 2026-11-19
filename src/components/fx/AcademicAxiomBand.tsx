import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface AcademicAxiomItem {
  readonly code: string;
  readonly formula: string;
  readonly label: string;
  readonly kind?: 'axiom' | 'milestone';
}

const DEFAULT_AXIOM_ITEMS: readonly AcademicAxiomItem[] = [
  {
    code: '1832 · É. GALOIS',
    formula: 'Gal(E/F)',
    label: 'Khai sinh Lý thuyết Nhóm & Tính giải được',
    kind: 'milestone',
  },
  {
    code: 'AX.01 // ĐẠI SỐ',
    formula: 'G / ker φ ≅ Im φ',
    label: 'Định lý đồng cấu cơ bản',
    kind: 'axiom',
  },
  {
    code: 'AX.02 // NHÓM',
    formula: '|G : H| · |H| = |G|',
    label: 'Định lý Lagrange về cấp nhóm con',
    kind: 'axiom',
  },
  {
    code: '1872 · F. KLEIN',
    formula: 'Aff(A) = V ⋊ GL(V)',
    label: 'Chương trình Erlangen: Bất biến hình học',
    kind: 'milestone',
  },
  {
    code: 'AX.03 // AFFINE',
    formula: 'x = (1 − λ)a + λb',
    label: 'Tổ hợp Affine & Tâm tỉ cự',
    kind: 'axiom',
  },
  {
    code: '1821 · A. CAUCHY',
    formula: '∀ε > 0, ∃δ > 0',
    label: 'Hình thức hóa giới hạn & Giải tích',
    kind: 'milestone',
  },
  {
    code: 'AX.04 // TUYẾN TÍNH',
    formula: 'det(A − λI) = 0',
    label: 'Đa thức đặc trưng & Phổ giá trị riêng',
    kind: 'axiom',
  },
  {
    code: '1854 · B. RIEMANN',
    formula: '∫ₐᵇ f(x) dx = lim ∑ f(ξᵢ)Δxᵢ',
    label: 'Tích phân xác định & Đa tạp hình học',
    kind: 'milestone',
  },
];

export interface AcademicAxiomBandProps {
  readonly items?: readonly AcademicAxiomItem[];
  readonly className?: string;
  readonly 'data-testid'?: string;
}

function renderFormulaGlyphs(formula: string) {
  if (formula === '∫ₐᵇ f(x) dx = lim ∑ f(ξᵢ)Δxᵢ') {
    return (
      <>
        <span>
          ∫<sub>a</sub>
          <sup>b</sup> f(x) dx = lim ∑ f(ξ<sub>i</sub>)Δx<sub>i</sub>
        </span>
      </>
    );
  }
  return formula;
}

function BandSequence({
  items,
  ariaHidden = false,
}: {
  readonly items: readonly AcademicAxiomItem[];
  readonly ariaHidden?: boolean;
}) {
  return (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center gap-7 px-4">
      {items.map((item) => (
        <div
          key={`${item.code}-${ariaHidden ? 'clone' : 'main'}`}
          className="inline-flex shrink-0 items-center gap-2.5 text-[11px] whitespace-nowrap"
        >
          <span
            className={cn(
              'lu-tabular-telemetry rounded-[2px] border px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-[0.12em] uppercase',
              item.kind === 'milestone'
                ? 'border-[#DCD1BE] bg-[#FAF8F4] text-[#8C7248]'
                : 'border-[#CFD8D4] bg-[#FAFBF9] text-[#245746]',
            )}
          >
            {item.code}
          </span>
          <span className="lu-fx-band-formula text-[#162623]">
            {renderFormulaGlyphs(item.formula)}
          </span>
          <span className="text-[#4F6861]">· {item.label}</span>
          <span className="ml-2 text-[#B8C4BF]" aria-hidden="true">
            ◆
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Dải Băng Học Thuật Chuyển Động Ngang (chuyển thể từ fx-band của taste-skill).
 * Trình chiếu liên tục 120fps các tiên đề, công thức toán học & mốc lịch sử toán học
 * trải rộng 100% chiều ngang với hiệu ứng làm mờ hai biên trái/phải.
 */
export function AcademicAxiomBand({
  items = DEFAULT_AXIOM_ITEMS,
  className,
  'data-testid': dataTestId = 'architectural-band',
}: AcademicAxiomBandProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      data-testid={dataTestId}
      data-component="academic-axiom-band"
      role="region"
      aria-label="Dải tiên đề, công thức và mốc lịch sử toán học"
      className={cn(
        'lu-fx-band-root relative flex h-10 w-full items-center overflow-hidden border-y border-[#CFD8D4] bg-[#F4F7F5] dark:border-[#1E3B2D] dark:bg-[#12241C]',
        className,
      )}
    >
      <div className="lu-fx-band-mask flex h-full w-full min-w-0 flex-1 items-center overflow-hidden">
        {reducedMotion ? (
          <div className="flex w-full items-center justify-start overflow-x-auto px-4">
            <BandSequence items={items} />
          </div>
        ) : (
          <div className="lu-fx-band-track items-center">
            <BandSequence items={items} />
            <BandSequence items={items} ariaHidden />
          </div>
        )}
      </div>
    </div>
  );
}
