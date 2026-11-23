import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DiagramRenderer } from './DiagramRenderer';
import { resolveDiagramMetadata, type DiagramKind } from './diagramMetadata';

const SVG_DIAGRAM_SAMPLES: ReadonlyArray<{
  readonly kind: DiagramKind;
  readonly sample: string;
  readonly expectedText: string;
}> = [
  {
    kind: 'z12-subgroup-lattice',
    sample: 'flowchart TD\n  G["Z/12Z (cấp 12)"] --> H6["⟨[2]⟩ (cấp 6)"]',
    expectedText: 'ℤ/12ℤ',
  },
  {
    kind: 'z20-subgroup-lattice',
    sample: 'flowchart TD\n  G["Z/20Z (cấp 20)"] --> H10["⟨[2]⟩ (cấp 10)"]',
    expectedText: 'ℤ/20ℤ',
  },
  {
    kind: 'chapter-2-cyclic-map',
    sample: 'flowchart TD\n  D["Nhóm con cyclic"] --> H["Mạng nhóm con H_d"]',
    expectedText: 'Cấp của phần tử: ord(a) = |⟨a⟩|',
  },
  {
    kind: 'ring-hierarchy',
    sample:
      'flowchart TD\n  Field["TRƯỜNG (Field)"] --> CommRing1["Vành giao hoán có 1"]\n  Ring["VÀNH TỔNG QUÁT (Ring)"]',
    expectedText: 'VÀNH TỔNG QUÁT (Ring)',
  },
  {
    kind: 'subring-unity-cases',
    sample: 'flowchart TD\n  Case1["Tình huống 1: Mẹ có 1, Con KHÔNG có 1"]',
    expectedText: 'Mẹ có 1, Con KHÔNG có 1',
  },
  {
    kind: 'poly-quotient-trio',
    sample: 'flowchart TD\n  f["Đa thức bậc hai f(x) trên ℝ"] --> Case1["f(x) = x²"]',
    expectedText: 'TRƯỜNG SỐ PHỨC ℂ',
  },
  {
    kind: 'comm-tri-ring-quotient',
    sample: 'flowchart TD\n  R["R"] -- "π_I" --> RI["R / I"]\n  RI -. "∃! f̄" .-> S["S"]',
    expectedText: '∃! f̄',
  },
  {
    kind: 'comm-tri-ring-char',
    sample: 'flowchart LR\n  Z["ℤ"] -- "η_R" --> R["R"]\n  Z -- "π" --> Zchar["ℤ / (char R)ℤ"]',
    expectedText: 'ℤ / (char R)ℤ',
  },
  {
    kind: 'chapter-8-ring-hom-map',
    sample:
      'flowchart TD\n  subgraph DongCauSec["1. Khái niệm"]\n  subgraph DangCauSec["2. Ba Định lý Đẳng cấu Vành"]',
    expectedText: 'Định lý Thặng dư Trung Hoa (CRT)',
  },
  {
    kind: 'prime-subfield-dichotomy',
    sample: 'flowchart TD\n  F["Trường bất kỳ F"] --> CharCheck{"Đặc số char(F)"}',
    expectedText: 'P_F ≅ 𝔽_p = ℤ/pℤ',
  },
  {
    kind: 'comm-tri-frac-universal',
    sample: 'flowchart TD\n  R["R"] -- "ι_R (nhúng)" --> FracR["Frac(R)"]',
    expectedText: 'Frac(R)',
  },
  {
    kind: 'chapter-9-evolution-map',
    sample: 'flowchart TD\n  subgraph TienHoaSec["1. Tiến hóa Cấu trúc Đại số (Chương 0 – 9)"]',
    expectedText: 'Trường con nguyên tố P_F',
  },
];

describe('DiagramRenderer — Sơ đồ SVG nhẹ chuẩn CSS token (thay thế hoàn toàn mermaid)', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.removeAttribute('data-theme');
  });

  it.each(SVG_DIAGRAM_SAMPLES)(
    'kết xuất đúng sơ đồ SVG $kind với viewBox chuẩn và đủ nhãn học thuật',
    ({ kind, sample, expectedText }) => {
      expect(resolveDiagramMetadata(sample).kind).toBe(kind);

      const { container } = render(<DiagramRenderer chart={sample} />);
      const figure = screen.getByTestId('diagram-renderer');
      expect(figure).toHaveAttribute('data-diagram-kind', kind);

      const svg = container.querySelector('svg[viewBox]');
      expect(svg).not.toBeNull();
      expect(svg?.getAttribute('class')).toContain('w-full');
      expect(svg?.getAttribute('class')).toContain('h-auto');
      expect(container.textContent).toContain(expectedText);

      // Bảo đảm sử dụng biến CSS token động (không phụ thuộc theme JS tĩnh của mermaid)
      expect(svg?.innerHTML).toContain('var(--text-main)');
      expect(svg?.innerHTML).toContain('var(--bg-workspace)');
    },
  );

  it('tương thích hiển thị cả Ceramic Light và Obsidian Studio (Dark Mode)', () => {
    const sample = SVG_DIAGRAM_SAMPLES[0]!.sample;

    document.documentElement.setAttribute('data-theme', 'light');
    const lightRender = render(<DiagramRenderer chart={sample} />);
    expect(lightRender.container.querySelector('svg[viewBox]')).not.toBeNull();
    lightRender.unmount();

    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
    const darkRender = render(<DiagramRenderer chart={sample} />);
    const darkSvg = darkRender.container.querySelector('svg[viewBox]');
    expect(darkSvg).not.toBeNull();
    expect(darkSvg?.innerHTML).toContain('var(--bg-workspace)');
    expect(darkSvg?.innerHTML).toContain('var(--text-main)');
  });

  it('xử lý mượt flowchart tùy ý bằng bộ dựng SVG dự phòng không cần mermaid', () => {
    const customChart = `flowchart TD
      A["Vành giao hoán"] -->|"Không ước của 0"| B["Miền nguyên"]
      B -->|"Mọi phần tử khác 0 khả nghịch"| C["Trường"]`;

    expect(resolveDiagramMetadata(customChart).kind).toBe('generic-flowchart');

    const { container } = render(<DiagramRenderer chart={customChart} />);
    expect(container.querySelector('svg[viewBox]')).not.toBeNull();
    expect(screen.getByText('Vành giao hoán')).toBeInTheDocument();
    expect(screen.getByText('Miền nguyên')).toBeInTheDocument();
    expect(screen.getByText('Trường')).toBeInTheDocument();
  });
});
