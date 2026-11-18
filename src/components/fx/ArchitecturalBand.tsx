import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/lib/cn';

export interface ArchitecturalBandItem {
  readonly code: string;
  readonly formula: string;
  readonly label: string;
}

const DEFAULT_BAND_ITEMS: readonly ArchitecturalBandItem[] = [
  { code: 'AX.01', formula: 'G / ker φ ≅ Im φ', label: 'Định lý đồng cấu cơ bản' },
  { code: 'AX.02', formula: '|G : H| · |H| = |G|', label: 'Định lý Lagrange' },
  { code: 'AX.03', formula: 'det(A − λI) = 0', label: 'Đa thức đặc trưng' },
  { code: 'AX.04', formula: 'x = (1 − λ)a + λb', label: 'Tổ hợp Affine' },
  { code: 'AX.05', formula: 'lim_{n→∞} aₙ = L', label: 'Hội tụ giải tích' },
  { code: 'AX.06', formula: '∑ᵢ λᵢ · vᵢ ∈ Ker(T − λI)', label: 'Phổ tuyến tính' },
  { code: 'AX.07', formula: 'Dim V = Dim Ker f + Dim Im f', label: 'Định lý số chiều' },
];

export interface ArchitecturalBandProps {
  readonly items?: readonly ArchitecturalBandItem[];
  readonly className?: string;
  readonly 'data-testid'?: string;
}

function BandSequence({
  items,
  ariaHidden = false,
}: {
  readonly items: readonly ArchitecturalBandItem[];
  readonly ariaHidden?: boolean;
}) {
  return (
    <div aria-hidden={ariaHidden} className="flex shrink-0 items-center gap-7 px-3.5">
      {items.map((item) => (
        <div
          key={`${item.code}-${ariaHidden ? 'clone' : 'main'}`}
          className="inline-flex shrink-0 items-center gap-2.5 text-[11px] whitespace-nowrap"
        >
          <span className="font-mono text-[9.5px] font-semibold tracking-[0.14em] text-[#8C7248] uppercase">
            {item.code}
          </span>
          <span className="font-mono font-semibold text-[#162623]">{item.formula}</span>
          <span className="text-[#5F7770]">· {item.label}</span>
          <span className="ml-2 text-[#B8C4BF]" aria-hidden="true">
            ◆
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Dải ruy-băng kiến trúc chạy ngang (chuyển thể từ fx-band của taste-skill).
 * Tự động tạm dừng khi rê chuột / focus bàn phím và tôn trọng prefers-reduced-motion.
 */
export function ArchitecturalBand({
  items = DEFAULT_BAND_ITEMS,
  className,
  'data-testid': dataTestId = 'architectural-band',
}: ArchitecturalBandProps) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      data-testid={dataTestId}
      role="region"
      aria-label="Hệ tiên đề và công thức nền tảng"
      className={cn(
        'lu-fx-band-root relative h-9 w-full overflow-hidden border-y border-[#CFD8D4] bg-[#EAEFEC]/78 backdrop-blur-xs',
        className,
      )}
    >
      <div className="lu-fx-band-mask flex h-full w-full items-center overflow-hidden">
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
